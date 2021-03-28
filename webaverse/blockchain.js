import Web3 from 'web3';
import bip39 from '../libs/bip39.js';
import hdkeySpec from '../libs/hdkey.js';
const hdkey = hdkeySpec.default;
import ethereumJsTx from '../libs/ethereumjs-tx.js';
import { makePromise } from './util.js';
import { storageHost, web3MainnetSidechainEndpoint, web3TestnetSidechainEndpoint } from './constants.js';
const { Transaction, Common } = ethereumJsTx;

// TODO: Polygon
const chainName = 'mainnet'; // TODO: Handle getting the chain we're on here

export const Networks = {
  mainnet: {
    displayName: "Mainnet",
    transferOptions: ["mainnetsidechain"]
  },
  mainnetsidechain: {
    displayName: "Webaverse",
    transferOptions: ["mainnet", "polygon"]
  },
  polygon: {
    displayName: "Polygon",
    transferOptions: ["mainnetsidechain"]
  },
  testnet: {
    displayName: "Rinkeby Testnet",
    transferOptions: ["testnetsidechain"]
  },
  testnetsidechain: {
    displayName: "Webaverse Testnet",
    transferOptions: ["testnet, testnetpolygon"]
  },
  testnetpolygon: {
    displayName: "Polygon Testnet",
    transferOptions: ["mainnetsidechain"]
  }
}
const getBlockchain = async () => {
  const addresses = await fetch('https://contracts.webaverse.com/config/addresses.js').then(res => res.text()).then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));

  const abis = await fetch('https://contracts.webaverse.com/config/abi.js').then(res => res.text()).then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));

  let injectedWeb3 = (typeof window !== 'undefined' && window.ethereum) ?
    new Web3(window.ethereum) :
    new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/0bb8f708513d45a1881ec056c7296df9"))

  const web3 = {
    mainnet: injectedWeb3,
    mainnetsidechain: new Web3(new Web3.providers.HttpProvider(web3MainnetSidechainEndpoint)),
    testnet: injectedWeb3,
    testnetsidechain: new Web3(new Web3.providers.HttpProvider(web3TestnetSidechainEndpoint)),
    polygon: new Web3(new Web3.providers.HttpProvider(`https://rpc-mainnet.maticvigil.com/v1/0937c004ab133135c86586b55ca212a6c9ecd224`))
  };
  let networkName = '';
  let common = null;
  // TODO: Add polygon
  function _setMainChain(chainName) {
    networkName = chainName;
    let nodeName = 'geth';
    let networkId = 1;
    let chainId = 1338; // 1337 for testnet
    // TODO: 
    common = Common.forCustomChain(
      // TODO: handle polygon, what is going on here?
      chainName,
      {
        name: nodeName,
        networkId: networkId,
        chainId: chainId,
      },
      'petersburg',
    );
  }
  _setMainChain(chainName);

  let contracts = {}
  Object.keys(Networks).forEach(network => {
    console.log("*** Network is", network);
    contracts[network] = {
      Account: new web3[network].eth.Contract(abis.Account, addresses[network].Account),
      FT: new web3[network].eth.Contract(abis.FT, addresses[network].FT),
      FTProxy: new web3[network].eth.Contract(abis.FTProxy, addresses[network].FTProxy),
      NFT: new web3[network].eth.Contract(abis.NFT, addresses[network].NFT),
      NFTProxy: new web3[network].eth.Contract(abis.NFTProxy, addresses[network].NFTProxy),
      Trade: new web3[network].eth.Contract(abis.Trade, addresses[network].Trade),
      LAND: new web3[network].eth.Contract(abis.LAND, addresses[network].LAND),
      LANDProxy: new web3[network].eth.Contract(abis.LANDProxy, addresses[network].LANDProxy),
    }
  })

  const getNetworkName = () => networkName;

  const getMainnetAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const [address] = await window.ethereum.enable();
      return address || null;
    } else {
      return null;
    }
  };

  return { web3, contracts, addresses, common, getNetworkName, getMainnetAddress };
}

const transactionQueue = {
  running: false,
  queue: [],
  lock() {
    if (!this.running) {
      this.running = true;
      return Promise.resolve();
    } else {
      const promise = makePromise();
      this.queue.push(promise.accept);
      return promise;
    }
  },
  unlock() {
    this.running = false;
    if (this.queue.length > 0) {
      this.queue.shift()();
    }
  },
};

const runMainnetTransaction = async (contractName, method, ...args) => {
  const { contracts, getMainnetAddress } = await getBlockchain();

  const address = await getMainnetAddress();
  if (address) {
    const m = contracts.front[contractName].methods[method];
    const receipt = await m.apply(m, args).send({
      from: address,
    });
    return receipt;
  } else {
    throw new Error('no addresses passed by web3');
    return Error('no addresses passed by web3');
  }
};

const runSidechainTransaction = mnemonic => async (contractName, method, ...args) => {
  const { web3, contracts, common } = await getBlockchain();
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();
  const privateKey = wallet.getPrivateKeyString();
  const privateKeyBytes = Uint8Array.from(web3['back'].utils.hexToBytes(privateKey));

  const txData = contracts['back'][contractName].methods[method](...args);
  const data = txData.encodeABI();
  let gasPrice = await web3['back'].eth.getGasPrice();
  gasPrice = parseInt(gasPrice, 10);

  await transactionQueue.lock();
  const nonce = await web3['back'].eth.getTransactionCount(address);
  let tx = Transaction.fromTxData({
    to: contracts['back'][contractName]._address,
    nonce: '0x' + new web3['back'].utils.BN(nonce).toString(16),
    gas: '0x' + new web3['back'].utils.BN(gasPrice).toString(16),
    gasPrice: '0x' + new web3['back'].utils.BN(gasPrice).toString(16),
    gasLimit: '0x' + new web3['back'].utils.BN(8000000).toString(16),
    data,
  }, {
    common,
  }).sign(privateKeyBytes);
  const rawTx = '0x' + tx.serialize().toString('hex');
  const receipt = await web3['back'].eth.sendSignedTransaction(rawTx);
  transactionQueue.unlock();
  return receipt;
};

const getTransactionSignature = async (chainName, contractName, transactionHash) => {
  const u = `https://sign.exokit.org/${chainName}/${contractName}/${transactionHash}`;
  for (let i = 0; i < 10; i++) {
    const signature = await fetch(u).then(res => res.json());
    if (signature) {
      return signature;
    } else {
      await new Promise((accept, reject) => {
        setTimeout(accept, 1000);
      });
    }
  }
  return null;
};

const _getWalletFromMnemonic = mnemonic => hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
  .derivePath(`m/44'/60'/0'/0/0`)
  .getWallet();

const getAddressFromMnemonic = mnemonic => _getWalletFromMnemonic(mnemonic)
  .getAddressString();

export {
  getBlockchain,
  runSidechainTransaction,
  runMainnetTransaction,
  getTransactionSignature,
  getAddressFromMnemonic,
};

import Web3 from 'web3';
import bip39 from '../libs/bip39.js';
import hdkeySpec from '../libs/hdkey.js';
const hdkey = hdkeySpec.default;
import ethereumJsTx from '../libs/ethereumjs-tx.js';
import { makePromise } from './util.js';
import storage from '../functions/Storage.js';
import { infuraKey, polygonVigilKey } from '../constants/ApiKeys.js';
import { storageHost, web3MainnetSidechainEndpoint, web3TestnetSidechainEndpoint, Networks } from './constants.js';
const { Transaction, Common } = ethereumJsTx;

let addresses = null;
let abis = null;
const loadPromise = Promise.all([
  'https://contracts.webaverse.com/config/addresses.js',
  'https://contracts.webaverse.com/config/abi.js',
].map(u =>
  fetch(u)
    .then(res => res.text())
    .then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')))
)).then(([
  newAddresses,
  newAbis,
]) => {
  addresses = newAddresses;
  abis = newAbis;

  _resetWeb3();
  if (typeof window !== 'undefined' && /^test\./.test(location.hostname)) {
    _setChain('testnet');
  } else if (typeof window !== 'undefined' && /^polygon\./.test(location.hostname)) {
    _setChain('polygon');
  } else {
    _setChain('mainnet');
  }
  _updateContracts();
  
  for (const k in web3) {
    web3Raw[k] = web3[k];
  }
  for (const k in web3) {
    contractsRaw[k] = contracts[k];
  }
});

const web3 = {};
const web3Raw = {};
const _updateWeb3 = async () => {
  const chainId = await new Web3(window.ethereum).eth.net.getId();
  let chainNetworkName = null;
  for (const k in blockchainChainIds) {
    const v = blockchainChainIds[k];
    if (v === chainId) {
      chainNetworkName = k;
      break;
    }
  }
  if (chainNetworkName === null) {
    throw new Error('failed to find blockchain chain id ' + chainNetworkName);
  }

  _resetWeb3();
  // console.log('override chain name 1', chainNetworkName, web3[chainNetworkName].injected);
  web3[chainNetworkName] = new Web3(window.ethereum);
  web3[chainNetworkName].injected = true;
  // console.log('override chain name 2', chainNetworkName, web3[chainNetworkName].injected);
  _updateContracts();
};
const _resetWeb3 = () => {
  // console.log('reset 1');
  web3.mainnet = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${infuraKey}`));
  web3.mainnetsidechain = new Web3(new Web3.providers.HttpProvider(web3MainnetSidechainEndpoint));
  web3.testnet = new Web3(new Web3.providers.HttpProvider(`https://rinkeby.infura.io/v3/${infuraKey}`));
  web3.testnetsidechain = new Web3(new Web3.providers.HttpProvider(web3TestnetSidechainEndpoint));
  web3.polygon = new Web3(new Web3.providers.HttpProvider(`https://rpc-mainnet.maticvigil.com/v1/${polygonVigilKey}`));
  web3.testnetpolygon = new Web3(new Web3.providers.HttpProvider(`https://rpc-mumbai.maticvigil.com/v1/${polygonVigilKey}`));
  // console.log('reset 2');
};
// _resetWeb3();
const contracts = {};
const contractsRaw = {};
const _updateContracts = () => {
  Object.keys(Networks).forEach(network => {
    // console.log("*** Network is", network);
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
  });
};
let addressFront = null;
let addressBack = null;
let networkName = '';
let common = null;
/* const _updateChainFrontBack = () => {
  web3.front = web3[networkName];
  web3.back = web3[networkName + 'sidechain'];
}; */
function _setChain(nn) {
  addressFront = addresses[nn];
  addressBack = addresses[nn + 'sidechain'];
  networkName = nn;
  
  // _updateChainFrontBack();

  if (nn === 'mainnet') {
    common = Common.forCustomChain(
      'mainnet',
      {
        name: 'geth',
        networkId: 1,
        chainId: 1338,
      },
      'petersburg',
    );
  } else if (nn === 'testnet') {
    common = Common.forCustomChain(
      'mainnet',
      {
        name: 'geth',
        networkId: 1,
        chainId: 1337,
      },
      'petersburg',
    );
  } else if (nn === 'polygon') {
    // throw new Error('cannot set common properties for polygon yet');
  } else {
    throw new Error('unknown network name: ' + nn);
  }
}

const getNetworkName = () => networkName;

const getMainnetAddress = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    const [address] = await window.ethereum.enable();
    return address || null;
  } else {
    return null;
  }
};

const getBlockchain = async () => {
  await loadPromise;
  return {
    web3,
    web3Raw,
    contracts,
    contractsRaw,
    addresses,
    common,
    getNetworkName,
    getMainnetAddress,
  };
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

const runChainTransaction = async (chainName, contractName, address, method, ...args) => {
  const {web3, contracts} = await getBlockchain();
  // console.log('got chain', chainName, web3[chainName].injected);
  const m = contracts[chainName][contractName].methods[method];
  const receipt = await m.apply(m, args).send({
    from: address,
  });
  return receipt;
};

const runSidechainTransaction = mnemonic => async (contractName, method, ...args) => {
  const { web3, contracts, common } = await getBlockchain();
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();
  const privateKey = wallet.getPrivateKeyString();
  const privateKeyBytes = Uint8Array.from(web3['mainnetsidechain'].utils.hexToBytes(privateKey));

  const txData = contracts['mainnetsidechain'][contractName].methods[method](...args);
  const data = txData.encodeABI();
  const gas = await txData.estimateGas({
    from: address,
  });
  let gasPrice = await web3['mainnetsidechain'].eth.getGasPrice();
  gasPrice = parseInt(gasPrice, 10);

  await transactionQueue.lock();
  const nonce = await web3['mainnetsidechain'].eth.getTransactionCount(address);
  let tx = Transaction.fromTxData({
    to: contracts['mainnetsidechain'][contractName]._address,
    nonce: '0x' + new web3['mainnetsidechain'].utils.BN(nonce).toString(16),
    gas: '0x' + new web3['mainnetsidechain'].utils.BN(gas).toString(16),
    gasPrice: '0x' + new web3['mainnetsidechain'].utils.BN(gasPrice).toString(16),
    gasLimit: '0x' + new web3['mainnetsidechain'].utils.BN(8000000).toString(16),
    data,
  }, {
    common,
  }).sign(privateKeyBytes);
  const rawTx = '0x' + tx.serialize().toString('hex');
  const receipt = await web3['mainnetsidechain'].eth.sendSignedTransaction(rawTx);
  transactionQueue.unlock();
  return receipt;
};

const getTransactionSignature = async (chainName, contractName, destinationChainName, transactionHash) => {
  const u = `https://sign.exokit.org/${chainName}/${contractName}/${destinationChainName}/${transactionHash}`;
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
let ethEnabledFlag = false;
const ethEnabled = async () => {
  if (!ethEnabledFlag) {
    ethEnabledFlag = true;

    if (window.ethereum) {
      await window.ethereum.enable();
      /* window.ethereum.on('accountsChanged', async accounts => {
        await _updateWeb3();
      }); */
      window.ethereum.on('networkChanged', async accounts => {
        await _updateWeb3();
      });
      await _updateWeb3();
      // window.mainWeb3 = ;
      /* const network = await window.mainWeb3.eth.net.getNetworkType();
      if (network === "main") {
        return true;
      } else if (network === "testnet"){
        return true;
      } else {
        throw new Error("You need to be on the Mainnet network, but you are on " 
        + network);
      } */
    } else {
      throw new Error("Please install MetaMask to use Webaverse!");
    }
  }
};
const loginWithMetaMask = async () => {
  // try {
    await ethEnabled();
    const eth = await window.ethereum.request({
      method: 'eth_accounts',
    });
    if (eth && eth[0]) {
      // setMainnetAddress(eth[0]);
      return eth[0];
    } else {
      /* ethereum.on("accountsChanged", (accounts) => {
        // setMainnetAddress(accounts[0]);
        func();
      }); */
      return null;
    }
  /* } catch (err) {
    handleError(err);
    return null;
  } */
};

const blockchainChainIds = {
  mainnet: 1,
  mainnetsidechain: 1338,
  testnetsidechain: 80001,
  polygon: 137,
  testnetpolygon: 137,
};

const ensureMetamaskChain = async networkName => {
  // console.log('ensure metamask chain', networkName, !!web3[networkName]);
  if (!web3[networkName].injected) {
    const injectedWeb3 = (() => {
      for (const networkName in web3) {
        if (web3[networkName].injected) {
          return web3[networkName];
        }
      }
      return null;
    })();
    if (injectedWeb3) {
      // console.log('not injected', web3[networkName], injectedWeb3);
      const chainId = await injectedWeb3.eth.net.getId();
      const expectedChainId = blockchainChainIds[networkName];
      throw new Error(`You are on network ${chainId}, expected ${expectedChainId}`);
    } else {
      throw new Error(`Metamask is not connected!`);
    }
  }
};

const switchToSidechain = async () => {
  await ethereum.enable();
  await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
          chainId: "0x53A",
          chainName: "Webaverse sidechain",
          rpcUrls: ['https://mainnetsidechain.exokit.org',],
          iconUrls: ['https://app.webaverse.com/assets/logo-flat.png'],
          blockExplorerUrls: ['https://webaverse.com/activity'],
          nativeCurrency: {
            name: 'Silk',
            symbol: 'SILK',
            decimals: 18,
          },
      }],
  });
};
const switchToPolygon = async () => {
  await ethereum.enable();
  await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
          chainId: "0x89",
          chainName: "Matic network",
          rpcUrls: ['https://rpc-mainnet.maticvigil.com/',],
          iconUrls: ['https://docs.matic.network/img/logo.svg'],
          blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com'],
          nativeCurrency: {
            name: 'Matic',
            symbol: 'MATIC',
            decimals: 18,
          },
      }],
  });
};
const logout = async () => {
  await storage.remove('loginToken');
  // window.storage = storage;
  window.location.href = '/';
};

export {
  getBlockchain,
  runSidechainTransaction,
  runChainTransaction,
  getTransactionSignature,
  getAddressFromMnemonic,
  loginWithMetaMask,
  blockchainChainIds,
  ensureMetamaskChain,
  switchToSidechain,
  switchToPolygon,
  logout,
};

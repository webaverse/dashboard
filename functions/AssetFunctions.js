import Web3 from 'web3';
import { getAddress } from './UIStateFunctions';
import { uniquify, getAddressProofs } from './Functions';
import { getAddressFromMnemonic, getBlockchain, runSidechainTransaction, runChainTransaction, getTransactionSignature, loginWithMetaMask, ensureMetamaskChain } from '../webaverse/blockchain.js';
import { previewExt, previewHost, storageHost } from '../webaverse/constants.js';
import { getExt } from '../webaverse/util.js';
import bip39 from '../libs/bip39.js';
import hdkeySpec from '../libs/hdkey.js';
const hdkey = hdkeySpec.default;
import {proofOfAddressMessage} from "../constants/UnlockConstants.js";

export const getTxData = async (txHash, contract) => {
  const { web3, contracts, getNetworkName } = await getBlockchain();
  const networkName = getNetworkName() + 'sidechain';

  const tx = await web3[networkName].eth.getTransaction(txHash);
  const events = await contracts['mainnetsidechain'][contract].getPastEvents('Transfer', {
    fromBlock: tx.blockNumber,
    toBlock: tx.blockNumber,
  });

  const txFound = events.find(obj => {
    return obj.transactionHash === txHash;
  })

  return txFound;
}

export const getSidechainActivityMaxBlock = async () => {
  const { web3, contracts, getNetworkName } = await getBlockchain();

  const networkName = getNetworkName();
  const latest = await web3[networkName + "sidechain"].eth.getBlockNumber();

  return latest;
}

export const getTimeByBlock = async (txHash) => {
  const { web3, getNetworkName } = await getBlockchain();
  const networkName = getNetworkName() + 'sidechain';


  const blockN = await web3[networkName].eth.getTransaction(txHash);
  const blockData = await web3[networkName].eth.getBlock(blockN.blockNumber)

  return blockData.timestamp;
}

export const getSidechainActivity = async (page) => {
  const { web3, contracts, getNetworkName } = await getBlockchain();

  const networkName = getNetworkName();
  const latest = await web3[networkName + "sidechain"].eth.getBlockNumber();
  const [
    ftTransferEntries,
    nftTransferEntries,
    landTransferEntries,
  ] = await Promise.all([
    contracts['mainnetsidechain']['FT'].getPastEvents('Transfer', {
      fromBlock: parseInt(latest-((page+1)*(latest-(latest/1.05)))),
      toBlock: page === 1 ? "latest" : parseInt(latest-(page*(latest-(latest/1.05)))),
    }),
    contracts['mainnetsidechain']['NFT'].getPastEvents('Transfer', {
      fromBlock: parseInt(latest-((page+1)*(latest-(latest/1.05)))),
      toBlock: page === 1 ? "latest" : parseInt(latest-(page*(latest-(latest/1.05)))),
    }),
    contracts['mainnetsidechain']['LAND'].getPastEvents('Transfer', {
      fromBlock: parseInt(latest-((page+1)*(latest-(latest/1.05)))),
      toBlock: page === 1 ? "latest" : parseInt(latest-(page*(latest-(latest/1.05)))),
    }),

  ]);

  await Promise.all(landTransferEntries.map(entry => entry.type = "LAND"));
  let activity = [].concat(ftTransferEntries, nftTransferEntries, landTransferEntries);
/*
  console.log("fromBlock", parseInt(latest-((page+1)*(latest-(latest/1.05)))));
  console.log("toBlock", parseInt(latest-(page*(latest-(latest/1.05)))));
  console.log("activity", accountMetadataEntries);
  console.log("activity sorted", sorted);
*/
  const activityWithTimestamp = await Promise.all(activity.map(async entry => {
    entry.timestamp = await getTimeByBlock(entry.transactionHash);
    return entry;
  }));
  const activitySortedWithTimestamp = activityWithTimestamp.sort((a, b)=>{
    return b.timestamp - a.timestamp;
  });

  return activitySortedWithTimestamp;
}

export const getStuckAsset = async (chainName, contractName, tokenId) => {
  const {contracts} = await getBlockchain();

  // const contract = contracts[chainName];
  const proxyContract = contracts[chainName][contractName + 'Proxy'];
  // const otherContract = contracts[otherChainName];
  // const otherProxyContract = otherContract[contractName + 'Proxy'];

  let [
    depositedEntries,
    /* withdrewEntries,
    otherDepositedEntries,
    otherWithdrewEntries, */
  ] = await Promise.all([
    proxyContract.getPastEvents('Deposited', {
      fromBlock: 0,
      toBlock: 'latest',
    }),
    /* proxyContract.getPastEvents('Withdrew', {
      fromBlock: 0,
      toBlock: 'latest',
    }),
    otherProxyContract.getPastEvents('Deposited', {
      fromBlock: 0,
      toBlock: 'latest',
    }),
    otherProxyContract.getPastEvents('Withdrew', {
      fromBlock: 0,
      toBlock: 'latest',
    }), */
  ]);
  
  /* console.log('got entries 1', {
    depositedEntries,
    withdrewEntries,
    otherDepositedEntries,
    otherWithdrewEntries,
  }); */
  
  depositedEntries = depositedEntries.filter(d => {
    let {returnValues: {tokenId: tokenId2}} = d;
    tokenId2 = parseInt(tokenId2, 10);
    return tokenId2 === tokenId;
  });
  
  const depositedEntry = depositedEntries[depositedEntries.length - 1];

  return depositedEntry ? {
    transactionHash: depositedEntry.transactionHash,
  } : null;
}

export const resubmitAsset = async (networkName, tokenName, destinationNetworkName, tokenId, address, handleSuccess, handleError) => {
  const {web3, contracts} = await getBlockchain();
  const stuckAsset = await getStuckAsset(networkName, tokenName, tokenId);

  const transactionHash = stuckAsset && stuckAsset.transactionHash;

  const res = await fetch(`https://sign.exokit.org/${networkName}/${tokenName}/${destinationNetworkName}/${transactionHash}`);
  const signatureJson = await res.json();
  const {timestamp, r, s, v} = signatureJson;

  try {
    console.log('resubmit asset 1', destinationNetworkName);
    
    await ensureMetamaskChain(destinationNetworkName);

    console.log('resubmit asset 2', destinationNetworkName, web3[destinationNetworkName].lol);

    await runChainTransaction(destinationNetworkName, tokenName + 'Proxy', address, 'withdraw', address, tokenId, timestamp, r, s, v);
  } catch (err) {
    console.log('failed', err);
    handleError(err.message);
    // return err;
  }
}

export const deleteAsset = async (id, mnemonic, handleSuccess, handleError) => {
  const {contracts} = await getBlockchain();
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();

  try {
    const network = 'sidechain';
    const burnAddress = "0x000000000000000000000000000000000000dEaD";

    const currentHash = await contracts['mainnetsidechain'].NFT.methods.getHash(id).call();
    const r = Math.random().toString(36);
    const updateHashResult = await runSidechainTransaction(mnemonic)('NFT', 'updateHash', currentHash, r);
    const result = await runSidechainTransaction(mnemonic)('NFT', 'transferFrom', address, burnAddress, id);

    if(result) console.log("Result of delete transaction:", result);

    if (handleSuccess)
      handleSuccess(result);
  } catch (error) {
    if (handleError) {
      handleError(error);
    }
  }
}

export const buyAsset = async (id, networkType, mnemonic, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();

  const fullAmount = {
    t: 'uint256',
    v: new web3['mainnetsidechain'].utils.BN(1e9)
      .mul(new web3['mainnetsidechain'].utils.BN(1e9))
      .mul(new web3['mainnetsidechain'].utils.BN(1e9)),
  };
  const fullAmountD2 = {
    t: 'uint256',
    v: fullAmount.v.div(new web3['mainnetsidechain'].utils.BN(2)),
  };

  try {
    {
      let allowance = await contracts['mainnetsidechain']['FT'].methods.allowance(address, contracts['mainnetsidechain']['Trade']._address).call();
      allowance = new web3['mainnetsidechain'].utils.BN(allowance, 10);
      if (allowance.lt(fullAmountD2.v)) {
        await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['mainnetsidechain']['Trade']._address, fullAmount.v);
      }
    }

    const result = await runSidechainTransaction(mnemonic)('Trade', 'buy', id);

    if (handleSuccess)
      handleSuccess(result);
  } catch (error) {
    if (handleError)
      handleError(error);
  }
};

export const sellAsset = async (id, price, networkType, mnemonic, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  try {
    await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts['mainnetsidechain']['Trade']._address, true);
    const result = await runSidechainTransaction(mnemonic)('Trade', 'addStore', id, price);

    if (handleSuccess)
      handleSuccess(result);
  } catch (error) {
    if (handleError)
      handleError(error);
  }
};

export const cancelSale = async (id, networkType, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  try {
    const network = networkType.toLowerCase() === 'mainnet' ? 'mainnet' : 'sidechain';
    await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts[network]['Trade']._address, true);

    await runSidechainTransaction(mnemonic)('Trade', 'removeStore', id);

    console.log("No buy asset logic");
    if (handleSuccess)
      handleSuccess();
  } catch (error) {
    if (handleError)
      handleError(error);
  }
};

export const setAssetName = async (name, hash, state, handleSuccess, handleError) => {
  if (!state.loginToken)
    throw new Error('not logged in');
  try {
    await Promise.all([
      runSidechainTransaction(state.loginToken.mnemonic)('NFT', 'setMetadata', hash, 'name', name),
    ]);
    if (handleSuccess)
      handleSuccess();

    return;
  } catch (error) {
    if (handleError) {
      handleError(error);
      return;
    }
  }
};


export const setName = async (name, state, handleSuccess, handleError) => {
  if (!state.loginToken)
    throw new Error('not logged in');
  try {
    const address = state.address;
    await Promise.all([
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'name', name),
    ]);
    if (handleSuccess)
      handleSuccess();

    const newState = {...state, name };
    return newState;
  } catch (error) {
    if (handleError) {
      handleError(error);
      return state;
    }
  }
};


export const setAvatar = async (id, state, handleSuccess, handleError) => {
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  if (!state.loginToken)
    throw new Error('not logged in');
  try {
    const res = await fetch(`${networkName !== "main" ? `https://testnetall-tokens.webaverse.com/${id}` : `https://mainnetall-tokens.webaverse.com/${id}`}`);
    const token = await res.json();
    const { name, ext, hash } = token.properties;
    const url = `${storageHost}/${hash.slice(2)}`;
    const preview = `${previewHost}/${hash}${ext ? ('.' + ext) : ''}/preview.${previewExt}`;
    const address = state.address;
    await Promise.all([
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'avatarId', id + ''),
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'avatarName', name),
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'avatarExt', ext),
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'avatarPreview', preview),
    ]);
    if (handleSuccess)
      handleSuccess();

    const newState = {...state, avatarPreview: preview };
    return newState;
  } catch (error) {
    if (handleError) {
      handleError(error);
      return state;
    }
  }
};

export const removeNftCollaborator = async (hash, address, handleSuccess, handleError, state) => {
  const mnemonic = state.loginToken.mnemonic;

  if (address) {
    let status, transactionHash;
    try {
      const result = await runSidechainTransaction(mnemonic)('NFT', 'removeCollaborator', hash, address);
      status = result.status;
    } catch(err) {
      status = false;
      transactionHash = err.message;
    }

    if (status) {
      handleSuccess();
    } else {
      handleError(transactionHash);
    }
  } else {
    handleError("No address given.");
  }
}

export const addNftCollaborator = async (hash, address, handleSuccess, handleError, state) => {
  const mnemonic = state.loginToken.mnemonic;

  if (address) {
    let status, transactionHash;
    try {
      const result = await runSidechainTransaction(mnemonic)('NFT', 'addCollaborator', hash, address);
      status = result.status;
    } catch(err) {
      status = false;
      transactionHash = err.message;
    }

    if (status) {
      handleSuccess();
    } else {
      handleError(transactionHash);
    }
  } else {
    handleError("No address given.");
  }
}

export const getLandHash = async (id) => {
  const { web3, contracts } = await getBlockchain();
  const hash = contracts['mainnetsidechain'].LAND.methods.getSingleMetadata(id, 'hash').call();

  return hash;
}

export const removeLandCollaborator = async (tokenId, address, handleSuccess, handleError, state) => {
  const mnemonic = state.loginToken.mnemonic;

  if (address) {
    let status, transactionHash;
    try {
      const result = await runSidechainTransaction(mnemonic)('LAND', 'removeSingleCollaborator', tokenId, address);
      status = result.status;
    } catch(err) {
      status = false;
      transactionHash = err.message;
    }

    if (status) {
      handleSuccess();
    } else {
      handleError(transactionHash);
    }
  } else {
    handleError("No address given.");
  }
}

export const addLandCollaborator = async (tokenId, address, handleSuccess, handleError, state) => {
  const mnemonic = state.loginToken.mnemonic;

  if (address) {
    let status, transactionHash;
    try {
      const result = await runSidechainTransaction(mnemonic)('LAND', 'addSingleCollaborator', tokenId, address);
      status = result.status;
    } catch(err) {
      status = false;
      transactionHash = err.message;
    }

    if (status) {
      handleSuccess();
    } else {
      handleError(transactionHash);
    }
  } else {
    handleError("No address given.");
  }
}


export const deployLand = async (tokenId, contentId, handleSuccess, handleError, state) => {
  const mnemonic = state.loginToken.mnemonic;

  if (!isNaN(contentId)) {
    let status, transactionHash;
    try {
        const result = await runSidechainTransaction(mnemonic)('LAND', 'setSingleMetadata', tokenId, 'hash', contentId);
        status = result.status;
    } catch(err) {
      status = false;
      transactionHash = err.message;
    }

    if (status) {
      handleSuccess();
    } else {
      handleError(transactionHash);
    }
  } else {
    handleError("Invalid NFT ID");
  }
}

export const mintNft = async (hash, name, ext, description, quantity, handleSuccess, handleError, state) => {
  const { web3, contracts } = await getBlockchain();
  const  mnemonic = state.loginToken.mnemonic;
  const address = state.address;

  let status, transactionHash, tokenIds;

  try {

    const fullAmount = {
      t: 'uint256',
      v: new web3['mainnetsidechain'].utils.BN(1e9)
        .mul(new web3['mainnetsidechain'].utils.BN(1e9))
        .mul(new web3['mainnetsidechain'].utils.BN(1e9)),
    };
    const fullAmountD2 = {
      t: 'uint256',
      v: fullAmount.v.div(new web3['mainnetsidechain'].utils.BN(2)),
    };

    let allowance = await contracts['mainnetsidechain'].FT.methods.allowance(address, contracts['mainnetsidechain']['NFT']._address).call();
    allowance = new web3['mainnetsidechain'].utils.BN(allowance, 10);
    if (allowance.lt(fullAmountD2.v)) {
      const result = await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['mainnetsidechain']['NFT']._address, fullAmount.v);
      status = result.status;
    } else {
      status = true;
//      transactionHash = '0x0';
//      tokenIds = [];
    }

    if (status) {
      const result = await runSidechainTransaction(mnemonic)('NFT', 'mint', address, hash, name, ext, description, quantity);

      status = result.status;
      transactionHash = result.transactionHash;
      const tokenId = new web3['mainnetsidechain'].utils.BN(result.logs[0].topics[3].slice(2), 16).toNumber();
      tokenIds = [tokenId, tokenId + quantity - 1];
      handleSuccess(tokenId);
    }
  } catch (err) {
    console.warn(err);
    status = false;
    transactionHash = '0x0';
    tokenIds = [];
    handleError(err);
  }
};

export const setHomespace = async (id, state, handleSuccess, handleError) => {
  if (!state.loginToken)
    throw new Error('not logged in');
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  try {

    const res = await fetch(`${networkName !== "main" ? `https://testnetall-tokens.webaverse.com/${id}` : `https://mainnetall-tokens.webaverse.com/${id}`}`);
    const token = await res.json();
    const { name, ext, hash } = token.properties;
    const url = `${storageHost}/${hash.slice(2)}`;
    const preview = `${previewHost}/${hash}${ext ? ('.' + ext) : ''}/preview.${previewExt}`;
    const address = state.address;
    await Promise.all([
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'homeSpaceId', id + ''),
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'homeSpaceName', name),
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'homeSpaceExt', ext),
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'homeSpacePreview', preview),
    ]);
    if (handleSuccess !== undefined)
      handleSuccess();

    const newState = {...state, homeSpacePreview: preview };
    return newState;
  } catch (err) {
    console.log("ERROR: ", err);
    if (handleError !== undefined)
      handleError();

    return state;
  }
};

export const depositSILK = async (amount, mainnetAddress, state, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(state.loginToken.mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();
  // Withdraw from mainnet
  amount = parseInt(amount, 10);

  await runSidechainTransaction(state.loginToken.mnemonic)('FT', 'approve', contracts['mainnetsidechain'].FTProxy._address, amount);

  const receipt = await runSidechainTransaction(state.loginToken.mnemonic)('FTProxy', 'deposit', mainnetAddress, amount);

  const signature = await getTransactionSignature('mainnetsidechain', 'FT', receipt.transactionHash);
  const timestamp = {
    t: 'uint256',
    v: signature.timestamp,
  };

  const { r, s, v } = signature;

  try {
    await contracts.front.FTProxy.methods.withdraw(mainnetAddress, amount, timestamp.v, r, s, v).send({
      from: mainnetAddress,
    });
    handleSuccess();
  } catch (err) {
    handleError(err);
  }

  return;
}

export const withdrawSILK = async (amount, mainnetAddress, address, state, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  // Withdraw from mainnet
  amount = parseInt(amount, 10);
  amount = {
    t: 'uint256',
    v: new web3['front'].utils.BN(amount),
  };

  await contracts.front.FT.methods.approve(contracts.front.FTProxy._address, amount.v).send({
    from: mainnetAddress,
  });

  const receipt = await contracts.front.FTProxy.methods.deposit(address, amount.v).send({
    from: mainnetAddress,
  });

  const signature = await getTransactionSignature('front', 'FT', receipt.transactionHash);
  const timestamp = {
    t: 'uint256',
    v: signature.timestamp,
  };

  const { r, s, v } = signature;

  try {
    await runSidechainTransaction(state.loginToken.mnemonic)('FTProxy', 'withdraw', address, amount.v, timestamp.v, r, s, v);
    handleSuccess();
  } catch (err) {
    handleError(err);
  }

  return;
}


export const withdrawLand = async (tokenId, mainnetAddress, address, state, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  // Withdraw from mainnet
  const id = parseInt(tokenId, 10);
  tokenId = {
    t: 'uint256',
    v: new web3['front'].utils.BN(id),
  };

  await contracts.front.LAND.methods.setApprovalForAll(contracts.front.LANDProxy._address, true).send({
    from: mainnetAddress,
  });

  const receipt = await contracts.front.LANDProxy.methods.deposit(address, tokenId.v).send({
    from: mainnetAddress,
  });

  const signature = await getTransactionSignature('front', 'LAND', receipt.transactionHash);
  const timestamp = {
    t: 'uint256',
    v: signature.timestamp,
  };

  const { r, s, v } = signature;

  try {
    const receipt = await runSidechainTransaction(state.loginToken.mnemonic)('LANDProxy', 'withdraw', address, tokenId.v, timestamp.v, r, s, v);
    handleSuccess(receipt, `/activity/${receipt.transactionHash}.LAND`);
  } catch (err) {
    handleError(err);
  }

  return;
}

export const depositLand = async (tokenId, mainnetAddress, state, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(state.loginToken.mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();

// Deposit to mainnet
  const id = parseInt(tokenId, 10);
  if (!isNaN(id)) {
    const tokenId = {
      t: 'uint256',
      v: new web3['mainnetsidechain'].utils.BN(id),
    };

    await runSidechainTransaction(state.loginToken.mnemonic)('LAND', 'setApprovalForAll', contracts['mainnetsidechain'].LANDProxy._address, true);

    const receipt = await runSidechainTransaction(state.loginToken.mnemonic)('LANDProxy', 'deposit', mainnetAddress, tokenId.v);

    const signature = await getTransactionSignature('mainnetsidechain', 'LAND', receipt.transactionHash);
    const timestamp = {
      t: 'uint256',
      v: signature.timestamp,
    };

    const { r, s, v } = signature;

    try {
      const receipt = await contracts.front.LANDProxy.methods.withdraw(mainnetAddress, tokenId.v, timestamp.v, r, s, v).send({
        from: mainnetAddress,
      });
      handleSuccess(receipt, `/activity/${receipt.transactionHash}.LAND`);
    } catch (err) {
      handleError(err);
    }

    return;
  }
}

export const withdrawAsset = async (tokenId, mainnetAddress, address, state, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  // Withdraw from mainnet
  const id = parseInt(tokenId, 10);
  tokenId = {
    t: 'uint256',
    v: new web3['front'].utils.BN(id),
  };

  await contracts.front.NFT.methods.setApprovalForAll(contracts.front.NFTProxy._address, true).send({
    from: mainnetAddress,
  });

  const receipt = await contracts.front.NFTProxy.methods.deposit(address, tokenId.v).send({
    from: mainnetAddress,
  });

  const signature = await getTransactionSignature('front', 'NFT', receipt.transactionHash);
  const timestamp = {
    t: 'uint256',
    v: signature.timestamp,
  };

  const { r, s, v } = signature;

  try {
    const receipt = await runSidechainTransaction(state.loginToken.mnemonic)('NFTProxy', 'withdraw', address, tokenId.v, timestamp.v, r, s, v);
    handleSuccess(receipt, `/activity/${receipt.transactionHash}.NFT`);
  } catch (err) {
    handleError(err);
  }

  return;
}

export const depositAsset = async (tokenId, sourceNetworkName, destinationNetworkName, mainnetAddress, address, state, handleSuccess, handleError) => {
  const {web3, contracts} = await getBlockchain();
  // Deposit to mainnet
  // if (sourceNetworkName === 'mainnetsidechain') {
    const id = parseInt(tokenId, 10);
    if (!isNaN(id)) {
      try {
        const tokenId = {
          t: 'uint256',
          v: new web3['mainnetsidechain'].utils.BN(id),
        };

        const _deposit = async () => {
          if (sourceNetworkName === 'mainnetsidechain') {
            await runSidechainTransaction(state.loginToken.mnemonic)('NFT', 'setApprovalForAll', contracts[sourceNetworkName].NFTProxy._address, true);
            
            const receipt = await runSidechainTransaction(state.loginToken.mnemonic)('NFTProxy', 'deposit', mainnetAddress, tokenId.v);
            
            return receipt.transactionHash;
          } else {
            console.log('approve 1', {
              sourceNetworkName,
              destinationNetworkName,
              mainnetAddress,
              address,
            });
            
            await contracts[sourceNetworkName].NFT.methods.setApprovalForAll(contracts[sourceNetworkName].NFTProxy._address, true).send({
              from: mainnetAddress,
            });;
            
            console.log('approve 2', {
              sourceNetworkName,
              destinationNetworkName,
              mainnetAddress,
              address,
            });
            
            const receipt = await contracts[sourceNetworkName].NFTProxy.methods.deposit(mainnetAddress, tokenId.v).send({
              from: mainnetAddress,
            });
            
            console.log('approve 3', {
              sourceNetworkName,
              destinationNetworkName,
              mainnetAddress,
              address,
            });
            
            return receipt.transactionHash;
          }
        };
        const transactionHash = await _deposit();

        const signature = await getTransactionSignature(sourceNetworkName, 'NFT', destinationNetworkName, transactionHash);
        const timestamp = {
          t: 'uint256',
          v: signature.timestamp,
        };
        const {r, s, v} = signature;

        const _withdraw = async () => {
          if (destinationNetworkName === 'mainnetsidechain') {
            const receipt = await contracts[destinationNetworkName].NFTProxy.methods.withdraw(mainnetAddress, tokenId.v, timestamp.v, r, s, v).send({
              from: mainnetAddress,
            });
            return receipt;
          } else {
            const receipt = await runSidechainTransaction(state.loginToken.mnemonic)(mainnetAddress, tokenId.v, timestamp.v, r, s, v);
            return receipt;
          }
        };
        const receipt = await _withdraw();

        handleSuccess(receipt, `/activity/${receipt.transactionHash}.NFT`);
      } catch (err) {
        handleError(err);
      }

      return;
    } else {
      handleError('failed to parse', JSON.stringify(ethNftIdInput.value));
    }
  /* } else {
    const id = parseInt(tokenId, 10);
    const tokenIdSpec = {
      t: 'uint256',
      v: new web3['front'].utils.BN(id),
    };

    const hashSpec = await contracts.front.NFT.methods.getHash(Spec.v).call();
    const hash = {
      t: 'uint256',
      v: new web3['front'].utils.BN(hashSpec),
    };
    const filenameSpec = await contracts.front.NFT.methods.getMetadata(hashSpec, 'filename').call();
    const filename = {
      t: 'string',
      v: filenameSpec,
    };

    const descriptionSpec = await contracts.front.NFT.methods.getMetadata(hashSpec, 'description').call();
    const description = {
      t: 'string',
      v: descriptionSpec,
    };


    await _checkMainNftApproved();

    const receipt = await contracts.front.NFTProxy.methods.deposit(myAddress, tokenId.v).send({
      from: mainnetAddress,
    });

    const signature = await getTransactionSignature('front', 'NFT', receipt.transactionHash);

    const { timestamp, r, s, v } = signature;

    try {
      const receipt = await runSidechainTransaction('NFTProxy', 'withdraw', myAddress, tokenId.v, hash.v, filename.v, description.v, timestamp, r, s, v);
    } catch (err) {
      handleError(err.message);
    }

    handleSuccess(receipt);
    return;
  } */
}

export const getLoadout = async (address) => {
  const { web3, contracts } = await getBlockchain();
  const loadoutString = await contracts['mainnetsidechain'].Account.methods.getMetadata(address, 'loadout').call();
  let loadout = loadoutString ? JSON.parse(loadoutString) : null;
  if (!Array.isArray(loadout)) {
    loadout = [];
  }
  while (loadout.length < 8) {
    loadout.push(null);
  }
  return loadout;
}

export const setLoadoutState = async (id, index, state, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  if (!state.loginToken) {
    throw new Error('not logged in');
    return state;
  }

  const hash = await contracts['mainnetsidechain'].NFT.methods.getHash(id).call();
  const [
    name,
    ext,
  ] = await Promise.all([
    contracts['mainnetsidechain'].NFT.methods.getMetadata(hash, 'name').call(),
    contracts['mainnetsidechain'].NFT.methods.getMetadata(hash, 'ext').call(),
  ]);

  // const itemUrl = `${storageHost}/${hash.slice(2)}${ext ? ('.' + ext) : ''}`;
  // const itemFileName = itemUrl.replace(/.*\/([^\/]+)$/, '$1');
  const itemPreview = `${previewHost}/${hash}${ext ? ('.' + ext) : ''}/preview.${previewExt}`;

  const loadout = await getLoadout(state.address);
  loadout.splice(index - 1, 1, [
    id + '',
    name,
    ext,
    itemPreview
  ]);

  try {
    await runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', state.address, 'loadout', JSON.stringify(loadout));
    handleSuccess("Successfully added item to loadout number " + index + ".");
  } catch(err) {
    handleError(err);
  }

  return { ...state, loadout: JSON.stringify(loadout) };
};
export const clearLoadoutState = async (index, state, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();
  if (!state.loginToken) {
    throw new Error('not logged in');
    return state;
  }

  const loadout = await getLoadout(state.address);
  loadout.splice(index - 1, 1, [
    '',
    '',
    '',
    ''
  ]);

  try {
    await runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', state.address, 'loadout', JSON.stringify(loadout));
    handleSuccess();
  } catch(err) {
    handleError(err);
  }

  return { ...state, loadout: JSON.stringify(loadout) };
};
export const addMainnetAddress = async (profile, state, handleSuccess, handleError) => {
  const {web3, contracts} = await getBlockchain();

  try {
    const mainnetAddress = await loginWithMetaMask();
    
    const injectedWeb3 = (() => {
      for (const k in web3) {
        const v = web3[k];
        if (v.injected) {
          return v;
        }
      }
      return null;
    })();

    const signature = await injectedWeb3.eth.personal.sign(proofOfAddressMessage, mainnetAddress);
    let addressProofs = getAddressProofs(profile);
    addressProofs.push(signature);
    addressProofs = uniquify(addressProofs);

    console.log('set address proofs', addressProofs);

    await runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', state.address, 'addressProofs', JSON.stringify(addressProofs));
    handleSuccess();
  } catch(err) {
    handleError(err);
  }
}
export const removeMainnetAddress = async (state, handleSuccess, handleError) => {
  const { web3, contracts } = await getBlockchain();

  try {
    await runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', state.address, 'addressProofs', '');
    handleSuccess();
  } catch(err) {
    handleError(err);
  }

  return;
}
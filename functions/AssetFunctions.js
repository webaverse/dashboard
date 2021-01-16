import { getAddress } from './UIStateFunctions';
import { getAddressFromMnemonic, contracts, runSidechainTransaction, web3, getTransactionSignature } from '../webaverse/blockchain.js';
import { previewExt, previewHost, storageHost } from '../webaverse/constants.js';
import { getExt } from '../webaverse/util.js';
import bip39 from '../libs/bip39.js';
import hdkeySpec from '../libs/hdkey.js';
const hdkey = hdkeySpec.default;


export const deleteAsset = async (id, mnemonic, successCallback, errorCallback) => {
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();

  console.log("Deleting asset", id);
  try {
    const network = 'sidechain';
    const burnAddress = "0x000000000000000000000000000000000000dEaD";

    const result = await runSidechainTransaction(mnemonic)('NFT', 'transferFrom', address, burnAddress, id);

    if(result) console.log("Result of delete transaction:", result);

    if (successCallback)
      successCallback(result);
  } catch (error) {
    if (errorCallback)
      errorCallback(error);
  }
}

export const buyAsset = async (id, networkType, mnemonic, successCallback, errorCallback) => {
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();

  const fullAmount = {
    t: 'uint256',
    v: new web3['sidechain'].utils.BN(1e9)
      .mul(new web3['sidechain'].utils.BN(1e9))
      .mul(new web3['sidechain'].utils.BN(1e9)),
  };
  const fullAmountD2 = {
    t: 'uint256',
    v: fullAmount.v.div(new web3['sidechain'].utils.BN(2)),
  };

  try {
    {
      let allowance = await contracts['sidechain']['FT'].methods.allowance(address, contracts['sidechain']['Trade']._address).call();
      allowance = new web3['sidechain'].utils.BN(allowance, 10);
      if (allowance.lt(fullAmountD2.v)) {
        await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['sidechain']['Trade']._address, fullAmount.v);
      }
    }

    const result = await runSidechainTransaction(mnemonic)('Trade', 'buy', id);
    if(result) console.log("Result of buy transaction:", result);

    if (successCallback)
      successCallback(result);
  } catch (error) {
    if (errorCallback)
      errorCallback(error);
  }
};

export const sellAsset = async (id, price, networkType, mnemonic, successCallback, errorCallback) => {
  console.log("Selling asset, price is", price);
  try {
    const network = networkType.toLowerCase() === 'mainnet' ? 'mainnet' : 'sidechain';

    await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts[network]['Trade']._address, true);
    const result = await runSidechainTransaction(mnemonic)('Trade', 'addStore', id, price);
    if(result) console.log("Result of buy transaction:", result);

    if (successCallback)
      successCallback(result);
  } catch (error) {
    if (errorCallback)
      errorCallback(error);
  }
};

export const cancelSale = async (id, networkType, successCallback, errorCallback) => {
  try {
    const network = networkType.toLowerCase() === 'mainnet' ? 'mainnet' : 'sidechain';
    await runSidechainTransaction(mnemonic)('NFT', 'setApprovalForAll', contracts[network]['Trade']._address, true);

    await runSidechainTransaction(mnemonic)('Trade', 'removeStore', id);

    console.log("No buy asset logic");
    if (successCallback)
      successCallback();
  } catch (error) {
    if (errorCallback)
      errorCallback(error);
  }
};

export const setAssetName = async (name, hash, state, successCallback, errorCallback) => {
  if (!state.loginToken)
    throw new Error('not logged in');
  try {
    await Promise.all([
      runSidechainTransaction(state.loginToken.mnemonic)('NFT', 'setMetadata', hash, 'name', name),
    ]);
    if (successCallback)
      successCallback();

    return;
  } catch (error) {
    if (errorCallback) {
      errorCallback(error);
      return;
    }
  }
};


export const setName = async (name, state, successCallback, errorCallback) => {
  if (!state.loginToken)
    throw new Error('not logged in');
  try {
    const address = state.address;
    await Promise.all([
      runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', address, 'name', name),
    ]);
    if (successCallback)
      successCallback();

    const newState = {...state, name };
    return newState;
  } catch (error) {
    if (errorCallback) {
      errorCallback(error);
      return state;
    }
  }
};


export const setAvatar = async (id, state, successCallback, errorCallback) => {
  if (!state.loginToken)
    throw new Error('not logged in');
  try {
    const res = await fetch(`https://tokens.webaverse.com/${id}`);
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
    if (successCallback)
      successCallback();

    const newState = {...state, avatarPreview: preview };
    return newState;
  } catch (error) {
    if (errorCallback) {
      errorCallback(error);
      return state;
    }
  }
};

export const deployLand = async (file, tokenId, successCallback, errorCallback, state) => {
  const mnemonic = state.loginToken.mnemonic;
  const res = await fetch(storageHost, { method: 'POST', body: file });
  const { hash } = await res.json();

  const oldHash = await contracts.sidechain.LAND.methods.getHash(tokenId).call();

  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();

  const fullAmount = {
    t: 'uint256',
    v: new web3.sidechain.utils.BN(1e9)
      .mul(new web3.sidechain.utils.BN(1e9))
      .mul(new web3.sidechain.utils.BN(1e9)),
  };

  let status, transactionHash;
  try {
    {
      const result = await runSidechainTransaction(mnemonic)('LAND', 'setSingleMetadata', tokenId, 'hash', hash);
      status = result.status;
      transactionHash = '0x0';
    }
    if (status) {
      const extName = getExt(file.name);
      const fileName = extName ? file.name.slice(0, -(extName.length + 1)) : file.name;
      await runSidechainTransaction(mnemonic)('LAND', 'setSingleMetadata', tokenId, 'ext', extName);
      status = true;
      transactionHash = '0x0';
    }
  } catch(err) {
    status = false;
    transactionHash = err.message;
  }

  if (status) {
    successCallback();
  } else {
    errorCallback(transactionHash);
  }
}

export const mintNft = async (file, name, ext, description, quantity, successCallback, errorCallback, state) => {
  const  mnemonic = state.loginToken.mnemonic;
  const address = state.address;
  const res = await fetch(storageHost, { method: 'POST', body: file });
  const { hash } = await res.json();

  let status, transactionHash, tokenIds;

  try {

    const fullAmount = {
      t: 'uint256',
      v: new web3['sidechain'].utils.BN(1e9)
        .mul(new web3['sidechain'].utils.BN(1e9))
        .mul(new web3['sidechain'].utils.BN(1e9)),
    };
    const fullAmountD2 = {
      t: 'uint256',
      v: fullAmount.v.div(new web3['sidechain'].utils.BN(2)),
    };

    let allowance = await contracts.sidechain.FT.methods.allowance(address, contracts['sidechain']['NFT']._address).call();
    allowance = new web3['sidechain'].utils.BN(allowance, 10);
    if (allowance.lt(fullAmountD2.v)) {
      const result = await runSidechainTransaction(mnemonic)('FT', 'approve', contracts['sidechain']['NFT']._address, fullAmount.v);
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
      const tokenId = new web3['sidechain'].utils.BN(result.logs[0].topics[3].slice(2), 16).toNumber();
      tokenIds = [tokenId, tokenId + quantity - 1];
      console.log("Token id is", tokenId);
      successCallback(tokenId);
    }
  } catch (err) {
    console.warn(err);
    status = false;
    transactionHash = '0x0';
    tokenIds = [];
    errorCallback(err);
  }
};

export const setHomespace = async (id, state, successCallback, errorCallback) => {
  if (!state.loginToken)
    throw new Error('not logged in');
  console.log("Setting homespace");
  try {

    const res = await fetch(`https://tokens.webaverse.com/${id}`);
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
    if (successCallback !== undefined)
      successCallback();

    const newState = {...state, homeSpacePreview: preview };
    return newState;
  } catch (err) {
    console.log("ERROR: ", err);
    if (errorCallback !== undefined)
      errorCallback();

    return state;
  }
};

export const withdrawAsset = async (tokenId, mainnetAddress, address, state, successCallback, errorCallback) => {
  // Withdraw from mainnet
  const id = parseInt(tokenId, 10);
  tokenId = {
    t: 'uint256',
    v: new web3['main'].utils.BN(id),
  };

  await contracts.main.LAND.methods.setApprovalForAll(contracts.main.LANDProxy._address, true).send({
    from: mainnetAddress,
  });

  const receipt = await contracts.main.LANDProxy.methods.deposit(address, tokenId.v).send({
    from: mainnetAddress,
  });

  const signature = await getTransactionSignature('main', 'LAND', receipt.transactionHash);
  const timestamp = {
    t: 'uint256',
    v: signature.timestamp,
  };

  const { r, s, v } = signature;

  await runSidechainTransaction(state.loginToken.mnemonic)('LANDProxy', 'withdraw', address, tokenId.v, timestamp.v, r, s, v);

  successCallback();

  return;
}

export const depositLand = async (tokenId, mainnetAddress, state) => {
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(state.loginToken.mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();

// Deposit to mainnet
  const id = parseInt(tokenId, 10);
  if (!isNaN(id)) {
    console.log("setting tokenId");
    const tokenId = {
      t: 'uint256',
      v: new web3['sidechain'].utils.BN(id),
    };

    await runSidechainTransaction(state.loginToken.mnemonic)('LAND', 'setApprovalForAll', contracts['sidechain'].LANDProxy._address, true);

    const receipt = await runSidechainTransaction(state.loginToken.mnemonic)('LANDProxy', 'deposit', mainnetAddress, tokenId.v);

    const signature = await getTransactionSignature('sidechain', 'LAND', receipt.transactionHash);
    const timestamp = {
      t: 'uint256',
      v: signature.timestamp,
    };

    const { r, s, v } = signature;

    await contracts.main.LANDProxy.methods.withdraw(mainnetAddress, tokenId.v, timestamp.v, r, s, v).send({
      from: mainnetAddress,
    });

    return;
    console.log('OK');
  }
}


export const depositAsset = async (tokenId, networkType, mainnetAddress, address, state) => {
  // Deposit to mainnet
  if (networkType === 'webaverse') {
    const id = parseInt(tokenId, 10);
    if (!isNaN(id)) {
      console.log("setting tokenId");
      const tokenId = {
        t: 'uint256',
        v: new web3['sidechain'].utils.BN(id),
      };

      await runSidechainTransaction(state.loginToken.mnemonic)('NFT', 'setApprovalForAll', contracts['sidechain'].NFTProxy._address, true);

      const receipt = await runSidechainTransaction(state.loginToken.mnemonic)('NFTProxy', 'deposit', mainnetAddress, tokenId.v);

      const signature = await getTransactionSignature('sidechain', 'NFT', receipt.transactionHash);
      console.log("setting tmestamp");
      const timestamp = {
        t: 'uint256',
        v: signature.timestamp,
      };

      const { r, s, v } = signature;

      console.log("mainnetAddress", mainnetAddress);
      console.log("tokenId", tokenId.v);
      console.log("timestamp", timestamp.v);
      await contracts.main.NFTProxy.methods.withdraw(mainnetAddress, tokenId.v, timestamp.v, r, s, v).send({
        from: mainnetAddress,
      });

      return;
      console.log('OK');
    } else {
      console.log('failed to parse', JSON.stringify(ethNftIdInput.value));
    }
  }  else {
    const id = parseInt(tokenId, 10);
    const tokenId = {
      t: 'uint256',
      v: new web3['main'].utils.BN(id),
    };

    const hashSpec = await contracts.main.NFT.methods.getHash(tokenId.v).call();
    const hash = {
      t: 'uint256',
      v: new web3['main'].utils.BN(hashSpec),
    };
    const filenameSpec = await contracts.main.NFT.methods.getMetadata(hashSpec, 'filename').call();
    const filename = {
      t: 'string',
      v: filenameSpec,
    };

    const descriptionSpec = await contracts.main.NFT.methods.getMetadata(hashSpec, 'description').call();
    const description = {
      t: 'string',
      v: descriptionSpec,
    };


    await _checkMainNftApproved();

    const receipt = await contracts.main.NFTProxy.methods.deposit(myAddress, tokenId.v).send({
      from: mainnetAddress,
    });

    const signature = await getTransactionSignature('main', 'NFT', receipt.transactionHash);

    const { timestamp, r, s, v } = signature;

    await runSidechainTransaction('NFTProxy', 'withdraw', myAddress, tokenId.v, hash.v, filename.v, description.v, timestamp, r, s, v);

    return;
  }
}

export const getLoadout = async (address) => {
  const loadoutString = await contracts.sidechain.Account.methods.getMetadata(address, 'loadout').call();
  console.log("loadoutString", loadoutString);
  let loadout = loadoutString ? JSON.parse(loadoutString) : null;
  if (!Array.isArray(loadout)) {
    loadout = [];
  }
  while (loadout.length < 8) {
    loadout.push(null);
  }
  return loadout;
}

export const setLoadoutState = async (id, index, state) => {
  if (!state.loginToken) {
    console.log("state", state);
    throw new Error('not logged in');
    return state;
  }

  const hash = await contracts.sidechain.NFT.methods.getHash(id).call();
  const [
    name,
    ext,
  ] = await Promise.all([
    contracts.sidechain.NFT.methods.getMetadata(hash, 'name').call(),
    contracts.sidechain.NFT.methods.getMetadata(hash, 'ext').call(),
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

  await runSidechainTransaction(state.loginToken.mnemonic)('Account', 'setMetadata', state.address, 'loadout', JSON.stringify(loadout));

  return { ...state, loadout: JSON.stringify(loadout) };
};

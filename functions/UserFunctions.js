import { runSidechainTransaction, getBlockchain } from '../webaverse/blockchain.js';
import { previewExt, previewHost, storageHost } from '../webaverse/constants.js';
import { getExt } from '../webaverse/util.js';

export const setName = async (name, state) => {
  // console.warn("Setting username in user object, but not to server");
  try {
    await runSidechainTransaction(state.loginToken.mnemonic)(
      'Account',
      'setMetadata',
      state.address,
      'name',
      name
     );
  } catch(err) {
    console.warn(err);
    throw err;
  }
};

export const setAccountMetadata = async (key, value, state) => {
  // console.warn("Setting username in user object, but not to server");
  try {
    const result = await runSidechainTransaction(state.loginToken.mnemonic)(
      'Account',
      'setMetadata',
      state.address,
      key,
      value
    );
    return result;
  } catch(err) {
    console.warn(err);
    throw err;
  }
};

export const setFtu = async (name, avatarUrl, state) => {
  const address = state.getAddress();
  const avatarPreview = `${previewHost}/[${avatarUrl}]/preview.${previewExt}`;

  await Promise.all([
    runSidechainTransaction(state.loginToken.mnemonic)(
      "Account",
      "setMetadata",
      address,
      "name",
      name
    ),
    runSidechainTransaction(state.loginToken.mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarUrl",
      avatarUrl
    ),
    runSidechainTransaction(state.loginToken.mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarFileName",
      avatarUrl
    ),
    runSidechainTransaction(state.loginToken.mnemonic)(
      "Account",
      "setMetadata",
      address,
      "avatarPreview",
      avatarPreview
    ),
    runSidechainTransaction(state.loginToken.mnemonic)(
      "Account",
      "setMetadata",
      address,
      "ftu",
      "1"
    ),
  ]);
  return {
    ...state,
    avatarUrl: avatarUrl,
    avatarFileName: avatarUrl,
    avatarPreview: avatarPreview,
  };
};

export const connectMetamask = async (state) => {
  const { web3, contracts } = await getBlockchain();
  if (!window.ethereum) {
    console.log("Window.ethereum is null");
    return state;
  }
  await window.ethereum.enable();
  const address = web3['front'].currentProvider.selectedAddress;
  const ftBalance = await contracts['front'].FT.methods
    .balanceOf(address)
    .call();
  const res = await fetch(`https://tokens-main.webaverse.com/${address}`);
  const tokens = await res.json();

  const newState = {
    mainnetAddress: address,
    mainnetFtBalance: ftBalance,
    mainnetInventory: tokens,
  };

  return { ...state, ...newState };
};

export const disconnectMetamask = async (state) => {
  const newState = {
    mainnetAddress: address,
    mainnetFtBalance: ftBalance,
    mainnetInventory: tokens,
  };

  return { ...state, ...newState };
};

export const checkMainFtApproved = async (amt) => {
  const { web3, contracts } = await getBlockchain();
  const receipt0 = await contracts.main.FT.methods
    .allowance(mainnetAddress, contracts.main.FTProxy._address)
    .call();

  if (receipt0 >= amt) return null;
  window.alert(
    "First you have to approve the FT contract to handle funds. This will only happen once."
  );

  const fullAmount = {
    t: "uint256",
    v: new web3['front'].utils.BN(1e9)
      .mul(new web3['front'].utils.BN(1e9))
      .mul(new web3['front'].utils.BN(1e9)),
  };
  const receipt1 = await contracts.main.FT.methods
    .approve(contracts.main.FTProxy._address, fullAmount.v)
    .send({
      from: mainnetAddress,
    });
  return receipt1;
};

export const checkMainNftApproved = async () => {
  const { web3, contracts } = await getBlockchain();
  const approved = await contracts.main.NFT.methods
    .isApprovedForAll(mainnetAddress, contracts.main.NFTProxy._address)
    .call();

  if (approved) return null;
  window.alert(
    "First you have to approve the NFT contract to handle tokens. This will only happen once."
  );

  const receipt1 = await contracts.main.NFT.methods
    .setApprovalForAll(contracts.main.NFTProxy._address, true)
    .send({
      from: mainnetAddress,
    });
  return receipt1;
};

import bip39 from '../libs/bip39.js';
import hdkeySpec from '../libs/hdkey.js';
import { getBlockchain, getAddressFromMnemonic } from '../webaverse/blockchain.js';
import storage from './Storage.js';

const hdkey = hdkeySpec.default;

export const getNetworkNameFromHostName = (hostname) => {
  let networkName = null;
  if (hostname) {
    if (/^main\./.test(hostname)) {
      networkName = 'main';
    } else {
      networkName = 'side';
    }
  }
  return networkName;
}

export const getBalance = async (address) => {
  const { web3, contracts } = await getBlockchain();
  try {
    console.log("address", address);
    const result = await contracts['back']['FT'].methods.balanceOf(address).call();
    return result;
  } catch (error) {
    console.warn(error);
    return 0;
  }
}

export const getAddress = (state) => {
  if (!state.loginToken) return state;
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(state.loginToken.mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();

  return { ...state, address };
};

export const getLandMain = async (id) => {
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  const res = await fetch(`${networkName !== "main" ? `https://rinkeby-land.webaverse.com/${id}` : `https://mainnet-land.webaverse.com/${id}`}`);
  const tokens = await res.json();

  return tokens;
};

export const getLands = async (start, end, hostname) => {
  let networkName;
  if (hostname) {
    networkName = getNetworkNameFromHostName(hostname);
  } else {
    const { getNetworkName } = await getBlockchain();
    networkName = getNetworkName();
  }

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-land.webaverse.com/${start}-${end}` : `https://mainnetsidechain-land.webaverse.com/${start}-${end}`}`);

  const tokens = await res.json();

  return tokens;
};

export const getLand = async (id, hostname) => {
  let networkName;
  if (hostname) {
    networkName = getNetworkNameFromHostName(hostname);
  } else {
    const { getNetworkName } = await getBlockchain();
    networkName = getNetworkName();
  }

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-land.webaverse.com/${id}` : `https://mainnetsidechain-land.webaverse.com/${id}`}`);

  const land = await res.json();

  return land;
};

export const getTokens = async (start, end, hostname) => {
  let networkName;
  if (hostname) {
    networkName = getNetworkNameFromHostName(hostname);
  } else {
    const { getNetworkName } = await getBlockchain();
    networkName = getNetworkName();
  }

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-tokens.webaverse.com/${start}-${end}` : `https://mainnetsidechain-tokens.webaverse.com/${start}-${end}`}`);
  const tokens = await res.json();

  return tokens;
};

export const getToken = async (id, hostname) => {
  let networkName;
  if (hostname) {
    networkName = getNetworkNameFromHostName(hostname);
  } else {
    const { getNetworkName } = await getBlockchain();
    networkName = getNetworkName();
  }

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-tokens.webaverse.com/${id}` : `https://mainnetsidechain-tokens.webaverse.com/${id}`}`);


  const token = await res.json();

  return token;
};

export const getTokenMain = async (id) => {
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  const res = await fetch(`${networkName !== "main" ? `https://rinkeby-tokens.webaverse.com/${id}` : `https://mainnet-tokens.webaverse.com/${id}`}`);

  const token = await res.json();
  return token;
};

export const isTokenOnMain = async (id) => {
  const { contracts, getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  const res = await fetch(`${networkName !== "main" ? `https://rinkeby-tokens.webaverse.com/${id}` : `https://mainnet-tokens.webaverse.com/${id}`}`);

  const token = await res.json();
  const owner = token.owner.address;
  const tokenOnMain = owner === contracts.front.NFTProxy._address || owner === ("0x0000000000000000000000000000000000000000") ? false : true;
  return tokenOnMain;
};


export const clearInventroryForCreator = async (creatorAddress, state) => {
  let newState = { ...state }
  // Use cached page
  newState.creatorProfiles[creatorAddress] = undefined;
  newState.creatorInventories[creatorAddress] = undefined;
  return newState;
};

export const getInventoryForCreator = async (creatorAddress, hostname) => {
  let networkName;
  if (hostname) {
    networkName = getNetworkNameFromHostName(hostname);
  } else {
    const { getNetworkName } = await getBlockchain();
    networkName = getNetworkName();
  }

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-tokens.webaverse.com/${creatorAddress}` : `https://mainnetsidechain-tokens.webaverse.com/${creatorAddress}`}`);

  const creatorInventory = await res.json();

  if (creatorInventory && creatorInventory.length === 1 && creatorInventory[0] === "0") {
    return [];
  }

  return creatorInventory;
};

export const getStoreForCreator = async (creatorAddress, hostname) => {
  creatorAddress = creatorAddress.toLowerCase();

  let networkName;
  if (hostname) {
    networkName = getNetworkNameFromHostName(hostname);
  } else {
    const { getNetworkName } = await getBlockchain();
    networkName = getNetworkName();
  }

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-store.webaverse.com/${creatorAddress}` : `https://mainnetsidechain-store.webaverse.com/${creatorAddress}`}`);

  const creatorBooth = await res.json();

  let data;
  if (creatorBooth[0] && creatorBooth[0]["entries"]) {
    data = creatorBooth[0]["entries"];
  } else {
    data = [];
  }

  return data;
};

export const getProfileForCreator = async (creatorAddress) => {
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-accounts.webaverse.com/${creatorAddress}` : `https://mainnetsidechain-accounts.webaverse.com/${creatorAddress}`}`);
  const creatorProfile = await res.json();

  return creatorProfile;
};

export const getBooths = async (page) => {
  // Use cached page
/*
  if (state.booths && state.booths[page] !== undefined)
    return state;
*/
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-store.webaverse.com/` : `https://mainnetsidechain-store.webaverse.com/`}`);

  const booths = await res.json();

  const boothsMap = [];
  await Promise.all(
    booths.map(seller => {
      return Promise.all(seller.entries.map(entry => {
        boothsMap.push(entry);
      }));
    })
  );
  return boothsMap;
/*
  const newState = { ...state };
  newState.booths[page] = booths;

  return newState;
*/
};

export const getStores = async () => {
  const { web3, contracts } = await getBlockchain();
  const numStores = await contracts['back']['Trade'].methods.numStores().call();
  const booths = [];
  const sales = {};
  for (let i = 0; i < numStores; i++) {
    const store = await contracts['back']['Trade'].methods.getStoreByIndex(i + 1).call();
    if (store.live) {
      const id = parseInt(store.id, 10);
      const seller = store.seller.toLowerCase();
      const tokenId = parseInt(store.tokenId, 10);
      const price = store.price;
      const entry = {
        id,
        seller,
        tokenId,
        price,
      };
      sales[tokenId] = entry;

      console.log('got store', store, entry);

      let booth = booths.find(booth => booth.seller === seller);
      if (!booth) {
        booth = {
          seller,
          entries: [],
        };
        booths.push(booth);
      }
      booth.entries.push(entry);
    }
  }
  return sales;
};

export const getCreators = async () => {
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-accounts.webaverse.com/` : `https://mainnetsidechain-accounts.webaverse.com/`}`);

  const creators = await res.json();

  return creators;
};

export const pullUser = async (state) => {
  const address = state.address;
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-accounts.webaverse.com/${address}` : `https://mainnetsidechain-accounts.webaverse.com/${address}`}`);
  const result = await res.json();
  const newState = {
    ...state,
    address,
    ...result
  };
  return newState;
};

export const pullUserObject = async (state) => {
  const address = getAddressFromMnemonic(state.loginToken.mnemonic);
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

   const balance = await getBalance(address);
  const res = await fetch(`${networkName !== "main" ? `https://rinkebysidechain-accounts.webaverse.com/${address}` : `https://mainnetsidechain-accounts.webaverse.com/${address}`}`);
  const result = await res.json();
  const newState = {
    ...state,
    address,
    balance,
    ...result
  };
  return newState;
};

export const requestTokenByEmail = async (email, state) => {
  await fetch(`/gateway?email=${encodeURIComponent(email)}`, {
    method: 'POST',
  });
  alert(`Code sent to ${email}!`);
  return state;
};

export const loginWithEmailCode = async (email, code, state) => {
  const res = await fetch(`/gateway?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
    method: 'POST',
  });

  if (!res.ok) {
    console.warn("Email login failed");
    return state;
  }

  const newLoginToken = await res.json();
  setNewLoginToken(newLoginToken, state);
};

export const loginWithPrivateKey = async (privateKey, state) => {
  const split = privateKey.split(/\s+/).filter(w => !!w);

  // Private key
  const mnemonic = split.slice(0, 12).join(' ');
  return await setNewLoginToken(mnemonic, state);
};

export const loginWithEmailOrPrivateKey = async (emailOrPrivateKey, state) => {
  const split = emailOrPrivateKey.split(/\s+/).filter(w => !!w);

  if (split.length === 12) {
    // Private key
    const mnemonic = split.slice(0, 12).join(' ');
    return await setNewLoginToken(mnemonic, state);
  } else {
    // Email
    return await requestTokenByEmail(emailOrPrivateKey);
  }
};

export const setNewLoginToken = async (newLoginToken, state) => {
  await storage.set('loginToken', { mnemonic: newLoginToken });
  const newState = await pullUserObject({ ...state, loginToken: { mnemonic: newLoginToken } });
  return newState;
};

export const logout = async (state) => {
  await storage.remove('loginToken');
  return await initializeStart(state);
};

export const initializeStart = async (state) => {
  let loginToken = await storage.get('loginToken');
  if (!loginToken) {
    const mnemonic = await bip39.generateMnemonic();
    loginToken = {
      unregistered: true,
      mnemonic
    }
    await storage.set('loginToken', loginToken);
  }

  const newState = await pullUserObject({ ...state, loginToken });
  // newState = await initializeEthereum(newState);
  if (newState.loginToken.unregistered) console.warn("Login token is unregistered");
  return await getAddress(newState);
};

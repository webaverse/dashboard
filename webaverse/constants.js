export const PARCEL_SIZE = 300;
export const SUBPARCEL_SIZE = 10;
export const SUBPARCEL_SIZE_P1 = SUBPARCEL_SIZE + 1;
export const SUBPARCEL_SIZE_P3 = SUBPARCEL_SIZE + 3;
export const NUM_PARCELS = PARCEL_SIZE / SUBPARCEL_SIZE;

export const chunkDistance = 3;
export const baseHeight = PARCEL_SIZE / 2 - 10;

export const numSlices = (1 + chunkDistance * 2 + 1) ** 3;
export const slabRadius = Math.sqrt((SUBPARCEL_SIZE / 2) * (SUBPARCEL_SIZE / 2) * 3);

export const thingTextureSize = 4096;
export const objectTextureSize = 512;

export const BUILD_SNAP = 2;

export const MAX_NAME_LENGTH = 32;
export const PLANET_OBJECT_SLOTS = 512;
export const PLANET_OBJECT_SIZE = (
  Uint32Array.BYTES_PER_ELEMENT + // id
  Uint32Array.BYTES_PER_ELEMENT + // type
  MAX_NAME_LENGTH * Uint8Array.BYTES_PER_ELEMENT + // build.name
  Float32Array.BYTES_PER_ELEMENT * 3 + // build.position
  Float32Array.BYTES_PER_ELEMENT * 4 // build.quaternion
);

export const discordOauthUrl = `https://discord.com/api/oauth2/authorize?client_id=684141574808272937&redirect_uri=https%3A%2F%2Fwebaverse.com%2Flogin&response_type=code&scope=identify`;

export const colors = [
  'ef5350',
  'ec407a',
  'ab47bc',
  '7e57c2',
  '5c6bc0',
  '42a5f5',
  '29b6f6',
  '26c6da',
  '26a69a',
  '66bb6a',
  '9ccc65',
  'd4e157',
  'ffee58',
  'ffca28',
  'ffa726',
  'ff7043',
  '8d6e63',
  'bdbdbd',
  '78909c',
  '333333',
];
export const previewExt = 'png';
export const storageHost = 'https://ipfs.exokit.org';
export const previewHost = 'https://preview.exokit.org'
export const worldsHost = 'https://worlds.exokit.org';
// export const accountsHost = 'https://accounts.exokit.org';
export const contractsHost = 'https://contracts.webaverse.com';
export const presenceHost = 'worlds.webaverse.com';
export const localstorageHost = 'https://localstorage.webaverse.com';
export const loginEndpoint = 'https://login.exokit.org';
export const web3MainnetSidechainEndpoint = 'https://mainnetsidechain.exokit.org';
export const web3TestnetSidechainEndpoint = 'https://testnetsidechain.exokit.org';
export const Networks = {
  mainnet: {
    displayName: 'Ethereum mainnet',
    transferOptions: ['mainnetsidechain'],
    iconSrc: '/ethereum.png',
  },
  mainnetsidechain: {
    displayName: 'Webaverse sidechain',
    transferOptions: ['polygon', 'mainnet'],
    iconSrc: '/webaverse.png',
  },
  polygon: {
    displayName: 'Polygon network',
    transferOptions: ['mainnetsidechain'],
    iconSrc: '/polygon.png',
  },
  /* testnet: {
    displayName: 'Rinkeby Testnet',
    transferOptions: ['testnetsidechain', 'testnetpolygon'],
  },
  testnetsidechain: {
    displayName: 'Webaverse Testnet',
    transferOptions: ['testnet'],
  },
  testnetpolygon: {
    displayName: 'Polygon Testnet',
    transferOptions: ['testnetsidechain'],
  }, */
};
export const appPreviewHost = `https://app.webaverse.com/preview.html`;
export const appTryHost = `https://app.webaverse.com/`;
export const cardsHost = `https://cards.webaverse.com`;
export const cardPreviewHost = `https://card-preview.exokit.org`;
export const lockHost = `https://lock.exokit.org`;
/* export const appPreviewHost = `https://127.0.0.1:3001/preview.html`;
export const cardsHost = `http://127.0.0.1:3002`; */

export const cardScrollViews = ['3d', 'game'];
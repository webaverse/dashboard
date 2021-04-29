import React, { Fragment, useState, useEffect } from "react";
import { useRouter } from 'next/router';
// import Head from 'next/head';
import CardDetails from "../components/CardDetails";
import Loader from "../components/Loader";
import {getToken, getProfileForCreator} from "../functions/UIStateFunctions";
import {useAppContext} from "../libs/contextLib";
import {getBlockchain} from "../webaverse/blockchain.js";
import {getStuckAsset} from "../functions/AssetFunctions.js";
import {Networks} from "../webaverse/blockchain.js";
import {getAddressProofs, getAddressesFromProofs} from '../functions/Functions.js';
import {proofOfAddressMessage} from "../constants/UnlockConstants.js";

export async function getData(id) {
  if (id) {
    const [
      token,
      networkName,
    ] = await Promise.all([
      (async () => {
        const token = await getToken(id);
        return token;
      })(),
      (async () => {
        const {contracts, getNetworkName} = await getBlockchain();
        const networkName = await getNetworkName();
        return networkName;
      })(),
    ]);
    return {
      token,
      networkName,
    };
  } else {
    return null;
  }
};
/* const _waitForAllCardFonts = () => Promise.all([
  'FuturaLT',
  'MS-Gothic',
  'FuturaStd-BoldOblique',
  'GillSans',
  'GillSans-CondensedBold',
  'FuturaStd-Heavy',
  'FuturaLT-CondensedLight',
  'SanvitoPro-LtCapt',
  'FuturaLT-Book',
].map(fontFamily => {
  if (typeof document !== 'undefined') {
    return document.fonts.load(`16px "${fontFamily}"`);
  } else {
    return null;
  }
})).then(() => {});
_waitForAllCardFonts().catch(err => {
  console.warn(err);
}); */
const _computeSvgSpec = async s => {
  /* await _waitForAllCardFonts();
  
  await new Promise((accept, reject) => {
    setTimeout(accept, 3 * 1000);
  }); */
  
  const div = document.createElement('div');
  div.className = 'absolute-top-left';
  div.innerHTML = s;
  const svgEl = div.querySelector('svg');
  document.body.appendChild(div);

  const match = svgEl.getAttribute('viewBox').match(/^([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+)$/);

  const width = parseInt(match[3], 10) - parseInt(match[1], 10);
  const height = parseInt(match[4], 10) - parseInt(match[2], 10);
  // const width = 500;
  // const height = 700;
  
  // console.log('width / height', width, height);
  
  svgEl.style.width = `${width}px`;
  svgEl.style.height = `${height}px`;

  const result = {};
  result['svg'] = {
    x: 0,
    y: 0,
    width,
    height,
  };
  [
    'title-text',
    'avatar-image',
    'illustrator-text',
    'details',
    'type-fire',
    'unlockable-button',
    'hp',
    'mp',
    'attack',
    'speed',
    'defense',
    'luck',
    'edition-text',
    'filetype-text',
    'filename-text',
    'filesize-text',
    'hash-text',
    'stamp',
    'filetype-description-text',
    'Image-background',
  ].forEach(k => {
    // console.log('getting', k);
    result[k] = svgEl.querySelector('#' + k).getBoundingClientRect();
    // console.log('got', k, result[k], svgEl.querySelector('#stamp'));
  });
  
  /* if (result['svg'].width === 0) {
    debugger;
  } */
  
  // debugger;
  
  document.body.removeChild(div);
  
  return result;
};

const Asset = ({
  data,
  selectedView,
  setSelectedView,
}) => {
  // console.log('got data', {selectedView});
  // const {cardSvgSource} = data;
  
  const router = useRouter();
  const {id} = router.query;
  const {globalState, setGlobalState} = useAppContext();
  const [name, setName] = useState(data.token.name);
  const [description, setDescription] = useState(data.token.description);
  const [token, setToken] = useState(data.token);
  const [networkName, setNetworkName] = useState(data.networkName);
  // const [stuck, setStuck] = useState(data.stuck);
  // const [tokenOnChains, setTokenOnChains] = useState({});
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [cardSvgSpec, setCardSvgSpec] = useState(null);
  
  useEffect(async () => {
    if (globalState.address) {
      const {
        web3,
      } = await getBlockchain();

      const profile = await getProfileForCreator(globalState.address);
      const addressProofs = getAddressProofs(profile);
      const addresses = await getAddressesFromProofs(addressProofs, web3, proofOfAddressMessage);
      // console.log('got profile', profile, addresses);
      setAddresses(addresses);
    }
  }, [globalState]);
  useEffect(async () => {
    if (!cardSvgSpec) {
      const res = await fetch("/cards.svg");
      const s = await res.text();
      const spec = await _computeSvgSpec(s);
      setCardSvgSpec(spec);
    }
  }, [cardSvgSpec]);
  /* useEffect(async () => {
    const {contracts} = await getBlockchain();
    
    const tokenOnChains = {};
    await Promise.all(Networks[networkName + 'sidechain'].transferOptions.map(async transferOptionNetworkName => {
      const tokenId = parseInt(id, 10);
      let ownerOnChain;
      try {
        ownerOnChain = await contracts[transferOptionNetworkName]['NFT'].methods.ownerOf(tokenId).call();
      } catch(err) {
        ownerOnChain = '';
      }
      const isOwnerOnChain = globalState.address === ownerOnChain;
      tokenOnChains[transferOptionNetworkName] = isOwnerOnChain;
    }));
    setTokenOnChains(tokenOnChains);
  }, [globalState]); */

  return token ? (
    <Fragment>
      {!loading ?
          <CardDetails
             id={token.id}
             isMainnet={token.isMainnet}
             isPolygon={token.isPolygon}
             key={token.id}
             name={name}
             setName={setName}
             description={description}
             setDescription={setDescription}
             image={token.image}
             buyPrice={token.buyPrice}
             storeId={token.storeId}
             hash={token.properties.hash}
             animation_url={token.animation_url}
             external_url={token.external_url}
             filename={token.properties.filename}
             ext={token.properties.ext}
             totalSupply={token.totalSupply}
             balance={token.balance}
             ownerAvatarPreview={token.owner.avatarPreview}
             ownerUsername={token.owner.username}
             ownerAddress={token.ownerAddress}
             minterAvatarPreview={token.minter.avatarPreview}
             minterAddress={token.minterAddress}
             minterUsername={token.minter.username}
             currentOwnerAddress={token.currentOwnerAddress}
             unlockable={token.properties.unlockable}
             encrypted={token.properties.encrypted}
             globalState={globalState}
             networkName={networkName}
             currentLocation={token.currentLocation}
             stuckTransactionHash={token.stuckTransactionHash}
             getData={async () => {
               const {
                 token,
                 // stuck,
                 networkName,
               } = await getData(id);
               
               setToken(token);
               // setStuck(stuck);
               setNetworkName(networkName);
               setLoading(false);
             }}
             addresses={addresses}
             selectedView={selectedView}
             setSelectedView={setSelectedView}
             cardSvgSpec={cardSvgSpec}
             tilt={true}
           />
      :
        <Loader loading={true} />
      }
    </Fragment>
  ) : <div>Token not found.</div>;
};
export default Asset;

export async function getServerSideProps(context) {
  const urlPrefix = (() => {
    if (typeof window !== 'undefined') {
      return window.location.protocol + '//' + window.location.host;
    } else {
      return 'http://' + context.req.headers.host;
    }
  })();
  const u = new URL('cards.svg', urlPrefix).href;
  console.log('got u', u);
  
  const [
    o,
    // cardSvgSource,
  ] = await Promise.all([
    (async () => {
      const id = /^[0-9]+$/.test(context.params.id) ? parseInt(context.params.id, 10) : NaN;
      const o = await getData(id);
      return o;
    })(),
    /* (async () => {
      const res = await fetch(u);
      const s = await res.text();
      return s;
    })(), */
  ]);
  const token = o?.token;
  const networkName = o?.networkName;

  return {
    props: {
      data: {
        token,
        networkName,
        // cardSvgSource,
      },
    },
  };
}

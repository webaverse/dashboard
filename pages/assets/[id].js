import React, { Fragment, useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import CardDetails from "../../components/CardDetails";
import Loader from "../../components/Loader";
import {getToken, getProfileForCreator} from "../../functions/UIStateFunctions";
import {useAppContext} from "../../libs/contextLib";
import {getBlockchain} from "../../webaverse/blockchain.js";
import {getStuckAsset} from "../../functions/AssetFunctions.js";
import {Networks} from "../../webaverse/blockchain.js";
import {} from "../../functions/UIStateFunctions.js";
import {getAddressProofs, getAddressesFromProofs} from '../../functions/Functions.js';
import {proofOfAddressMessage} from "../../constants/UnlockConstants.js";

const getData = async id => {
  if (id) {
    const [
      token,
      // stuck,
      networkName,
    ] = await Promise.all([
      (async () => {
        const token = await getToken(id);
        return token;
      })(),
      /* (async () => {
        const stuck = await getStuckAsset('NFT', id);
        return stuck;
      })(), */
      (async () => {
        const {contracts, getNetworkName} = await getBlockchain();
        const networkName = await getNetworkName();
        return networkName;
      })(),
    ]);
    return {
      token,
      // stuck,
      networkName,
    };
  } else {
    return null;
  }
};

const Asset = ({ data }) => {
  // console.log('got data', data);
  
  const router = useRouter();
  const {id} = router.query;
  const {globalState, setGlobalState} = useAppContext();
  const [token, setToken] = useState(data.token);
  const [networkName, setNetworkName] = useState(data.networkName);
  // const [stuck, setStuck] = useState(data.stuck);
  // const [tokenOnChains, setTokenOnChains] = useState({});
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  
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
      <Head>
        <title>{token.name} | Webaverse</title>
        <meta name="description" content={token.description + " | Webaverse"} />
        <meta property="og:title" content={token.name + " | Webaverse"} />
        <meta property={["webm","mp4"].indexOf(token.properties.ext) >=0 ? "og:video:url" : "og:image"} content={["gif","webm","mp4"].indexOf(token.properties.ext) >=0 ? token.animation_url : token.image} />
        {["webm","mp4"].indexOf(token.properties.ext) >=0 ?
          <meta property="og:type" content="video" />
        : null}
        {["webm","mp4"].indexOf(token.properties.ext) >=0 ?
          <meta property="og:video:width" content="994" />
        : null}
        {["webm","mp4"].indexOf(token.properties.ext) >=0 ?
          <meta property="og:video:height" content="720" />
        : null}
        {token.properties.ext === "mp4" ?
          <meta property="og:video:type" content="webm/mp4" />
        : null}
        {token.properties.ext === "webm" ?
          <meta property="og:video:type" content="video/webm" />
        : null}
        <meta name="theme-color" content="#c4005d" />
        {["webm","mp4"].indexOf(token.properties.ext) >=0 ?
          null
        :
          <meta name="twitter:card" content="summary_large_image" />
        }
        <script type="text/javascript" src="/geometry.js"></script>
      </Head>
      { !loading ?
          <CardDetails
             id={token.id}
             isMainnet={token.isMainnet}
             isPolygon={token.isPolygon}
             key={token.id}
             name={token.name}
             description={token.description}
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
             ownerAddress={token.owner.address}
             minterAvatarPreview={token.minter.avatarPreview}
             minterAddress={token.minter.address}
             minterUsername={token.minter.username}
             currentOwnerAddress={token.currentOwnerAddress}
             globalState={globalState}
             networkName={networkName}
             currentLocation={token.currentLocation}
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
           />
      :
        <Loader loading={true} />
      }
    </Fragment>
  ) : <div>Token not found.</div>;
};
export default Asset;

export async function getServerSideProps(context) {
  const id = /^[0-9]+$/.test(context.params.id) ? parseInt(context.params.id, 10) : NaN;
  const o = await getData(id);
  const token = o?.token;
  // const stuck = o?.stuck;
  const networkName = o?.networkName;

  return {
    props: {
      data: {
        token,
        // stuck,
        networkName,
      },
    },
  };
}

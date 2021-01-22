import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import LandCardDetails from "../../components/LandCardDetails";
import Loader from "../../components/Loader";
import { getLand } from "../../functions/UIStateFunctions";
import { useAppContext } from "../../libs/contextLib";

export default ({ data }) => {
  const router = useRouter()
  const { id } = router.query
  const { globalState, setGlobalState } = useAppContext();
  const [land, setLand] = useState(null);

  useEffect(() => {
    if (id && !land) {
      (async () => {
        const data = await getLand(id);
        setLand(data);
      })();
    }
  }, [id]);

  return (
    <>
      { land ?
        <>
          <Head>
            <title>{land.name} | Webaverse</title>
            <meta name="description" content={land.description + " | Webaverse"} />
            <meta property="og:title" content={land.name + " | Webaverse"} />
            <meta property="og:image" content={land.image} />
            <meta name="theme-color" content="#c4005d" />
            <meta name="twitter:card" content="summary_large_image" />
          </Head>
          <LandCardDetails
             id={land.id}
             key={land.id}
             name={land.name}
             description={land.description}
             image={land.image}
             buyPrice={land.buyPrice}
             storeId={land.storeId}
             hash={land.properties.hash}
             external_url={land.external_url}
             filename={land.properties.filename}
             rarity={land.properties.rarity}
             ext={land.properties.ext}
             totalSupply={land.totalSupply}
             balance={land.balance}
             ownerAvatarPreview={land.owner.avatarPreview}
             ownerUsername={land.owner.username}
             ownerAddress={land.owner.address}
             globalState={globalState}
             networkType='webaverse'
           />
        </>
      :
        <Loader loading={true} />
      }
    </>
  )
}

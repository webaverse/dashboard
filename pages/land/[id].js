import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import LandCardDetails from "../../components/LandCardDetails";
import Loader from "../../components/Loader";
import { getLand } from "../../functions/UIStateFunctions";
import { useAppContext } from "../../libs/contextLib";

const Land = ({ data }) => {
  const router = useRouter()
  const { id } = router.query
  const { globalState, setGlobalState } = useAppContext();
  const [land, setLand] = useState(data);
  const [loading, setLoading] = useState(false);

  /* useEffect(() => {
    getData();
  }, [id]); */

  const getData = () => {
    if (id) {
      (async () => {
        const data = await getLand(id);
        setLand(data);
        setLoading(false);
      })();
    }
  }

  return land ? (
    <>
      <Head>
        <title>{land.name} | Webaverse</title>
        <meta name="description" content={land.description + " | Webaverse"} />
        <meta property="og:title" content={land.name + " | Webaverse"} />
        <meta property="og:image" content={land.image + "&r=" + land.properties.rarity} />
        <meta name="theme-color" content="#c4005d" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {!loading ?
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
             networkType="sidechain"
             getData={getData}
           />
      :
        <Loader loading={true} />
      }
    </>
  ) : <div>Token not found.</div>;
};
export default Land;

export async function getServerSideProps({ params }) {
  const id = /^[0-9]+$/.test(params.id) ? parseInt(params.id, 10) : NaN;
  const data = !isNaN(id) ? (await getLand(id)) : null;

  return {
    props: {
      data,
    },
  };
}

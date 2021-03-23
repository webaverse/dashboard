import React, { Fragment, useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import CardDetails from "../../components/CardDetails";
import Loader from "../../components/Loader";
import { getToken } from "../../functions/UIStateFunctions";
import { useAppContext } from "../../libs/contextLib";

export default ({ data }) => {
  const router = useRouter()
  const { id } = router.query
  const { globalState, setGlobalState } = useAppContext();
  const [token, setToken] = useState(data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, [id]);

  const getData = () => {
    if (id) {
      (async () => {
        const data = await getToken(id);
        setToken(data);
        setLoading(false);
      })();
    }
  }

  return (
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
      </Head>
      { !loading ?
          <CardDetails
             id={token.id}
             isMainnet={token.isMainnet}
             isMatic={token.isMatic}
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
             globalState={globalState}
             networkType='webaverse'
             getData={getData}
           />
      :
        <Loader loading={true} />
      }
    </Fragment>
  )
}

export async function getServerSideProps(context) {
  const data = await getToken(context.params.id);

  return { props: { data } }
}

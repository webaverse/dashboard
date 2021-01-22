import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import CardDetails from "../../components/CardDetails";
import Loader from "../../components/Loader";
import { getToken } from "../../functions/UIStateFunctions";
import { useAppContext } from "../../libs/contextLib";

export default () => {
  const router = useRouter()
  const { id } = router.query
  const { globalState, setGlobalState } = useAppContext();
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (id && !token) {
      (async () => {
        const data = await getToken(id);
        setToken(data);
      })();
    }
  }, [id]);

  return (
    <>
      { token ?
        <>
          <Head>
            <title>{token.name} | Webaverse</title>
            <meta name="description" content={token.description + " | Webaverse"} />
            <meta property="og:title" content={token.name + " | Webaverse"} />
            <meta property="og:image" content={token.image} />
            <meta name="theme-color" content="#c4005d" />
            <meta name="twitter:card" content="summary_large_image" />
          </Head>
          <CardDetails
             id={token.id}
             key={token.id}
             name={token.name}
             description={token.description}
             image={token.image}
             buyPrice={token.buyPrice}
             storeId={token.storeId}
             hash={token.properties.hash}
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
           />
        </>
      :
        <Loader loading={true} />
      }
    </>
  )
}

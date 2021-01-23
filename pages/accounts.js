import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../libs/contextLib";
import { getCreators } from "../functions/UIStateFunctions.js";
import ProfileCards from "../components/ProfileCards";
import Loader from "../components/Loader";

export default ({ data }) => {
  const { globalState, setGlobalState } = useAppContext();
  const [creatorProfiles, setCreatorProfiles] = useState(data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getCreators();
      setCreatorProfiles(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Members | Webaverse</title>
        <meta name="description" content={"Check out the awesome members on Webaverse."} />
        <meta property="og:title" content={"Members | Webaverse"} />
        <meta property="og:image" content={"./preview.png"} />
        <meta name="theme-color" content="#c4005d" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      { loading ?
        <Loader loading={true} />
      :
        <ProfileCards profiles={creatorProfiles} />
      }
    </div>
  )
}

export async function getServerSideProps() {
  const data = await getCreators();

  return { props: { data } }
}

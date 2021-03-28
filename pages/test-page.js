import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../libs/contextLib";
import { getCreators } from "../functions/UIStateFunctions.js";
import ProfileCards from "../components/ProfileCards";
import Loader from "../components/Loader";

const TestPage = () => {
  const { globalState, setGlobalState } = useAppContext();
  const [creatorProfiles, setCreatorProfiles] = useState(null);
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
        <meta property="og:image" content={"https://webaverse.com/webaverse.png"} />
        <meta name="theme-color" content="#c4005d" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div></div>
    </div>
  )
};
export default TestPage;

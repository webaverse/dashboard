import React, {useState, useEffect} from 'react';
import Head from 'next/head';
import {Container, Row} from 'react-grid-system';
import {useAppContext} from "../libs/contextLib";
import {getCreators} from "../functions/UIStateFunctions.js";
import ProfileCards from "../components/ProfileCards";
import Loader from "../components/Loader";

const Accounts = ({data}) => {
  // console.log('got data', data.creators);
  
  const { globalState, setGlobalState } = useAppContext();
  const [creatorProfiles, setCreatorProfiles] = useState(data.creators);
  const [loading, setLoading] = useState(false);

  /* useEffect(() => {
    (async () => {
      const data = await getCreators();
      setCreatorProfiles(data);
      setLoading(false);
    })();
  }, []); */

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
      { loading ?
        <Loader loading={true} />
      :
        <ProfileCards profiles={creatorProfiles} />
      }
    </div>
  )
};
export default Accounts;

export async function getServerSideProps(context) {
  const creators = await getCreators();

  return { 
    props: { 
      data: {
        creators,
      }
    } 
  }
}
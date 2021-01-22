import React, { useState, useEffect } from 'react';
import { getTokens, getLands } from "../functions/UIStateFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import Loader from "../components/Loader";
import styles from '../styles/Home.module.css';

export default () => {
  const [avatars, setAvatars] = useState(null);
  const [art, setArt] = useState(null);
  const [models, setModels] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const tokens1 = await getTokens(1, 100);
      const tokens2 = await getTokens(100, 200);
      const tokens = tokens1.concat(tokens2);

      setAvatars(tokens.filter(o => o.properties.ext.toLowerCase().includes("vrm")));
      setArt(tokens.filter(o => o.properties.ext.toLowerCase().includes("png")));
      setModels(tokens.filter(o => o.properties.ext.toLowerCase().includes("glb")));
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Hero
        heroBg="/hero.gif"
        title="Webaverse"
        subtitle="An open virtual world built with existing communities."
        callToAction="Explore"
        ctaUrl="https://app.webaverse.com"
      />
      <div className="container">
        { loading ?
          <Loader loading={loading} />
        :
          <>
          <CardRowHeader name="Avatars" />
          <CardRow data={avatars} cardSize="small" />

          <CardRowHeader name="Digital Art" />
          <CardRow data={art} cardSize="small" />

          <CardRowHeader name="3D Models" />
          <CardRow data={models} cardSize="small" />
          </>
        }
      </div>
    </>
  )
}


export async function getServerSideProps(context) {
  const tokens1 = await getTokens(1, 100, context.req.headers.host);
  const tokens2 = await getTokens(100, 200, context.req.headers.host);
  const tokens = tokens1.concat(tokens2);

  const avatars = tokens.filter(o => o.properties.ext.toLowerCase().includes("vrm"));
  const art = tokens.filter(o => o.properties.ext.toLowerCase().includes("png"));
  const models = tokens.filter(o => o.properties.ext.toLowerCase().includes("glb"));

  return { props: { 
    data: {
      avatars,
      art,
      models
    }
  } }
}

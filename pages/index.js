import React from 'react';
import { getTokens, getLands } from "../functions/UIStateFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import styles from '../styles/Home.module.css';

export default ({ data }) => 
  <>
    <Hero
      heroBg="/hero.gif"
      title="Webaverse"
      subtitle="An open virtual world built with existing communities."
      callToAction="Explore"
      ctaUrl="https://app.webaverse.com"
    />
    <div className="container">
      <CardRowHeader name="Avatars" />
      <CardRow data={data.avatars} cardSize="small" />

      <CardRowHeader name="Digital Art" />
      <CardRow data={data.art} cardSize="small" />

      <CardRowHeader name="3D Models" />
      <CardRow data={data.models} cardSize="small" />
    </div>
  </>


export async function getServerSideProps() {
  const tokens1 = await getTokens(1, 100);
  const tokens2 = await getTokens(100, 200);
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

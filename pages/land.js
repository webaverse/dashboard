import React, { useState, useEffect } from 'react'
import dynamic from "next/dynamic";
import { useHistory } from "react-router-dom";
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../libs/contextLib";
import { getLands } from "../functions/UIStateFunctions.js";

import CardGrid from "../components/LandCardGrid";

export default ({ data }) => {
  const Map = dynamic(() => import("../components/Map"), {
    ssr: false
  });

  const history = useHistory();
  const { globalState, setGlobalState } = useAppContext();
  const [lands, setLands] = useState(data);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);


  return lands && lands.length > 0 && 
    <div className="container">
      <Map />
      <CardGrid data={lands} globalState={globalState} cardSize="" currentCard={currentCard} setCurrentCard={setCurrentCard} />
    </div>
}

export async function getServerSideProps() {
  const data = await getLands(1, 100);

  return { props: { data } }
}

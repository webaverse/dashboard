import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../libs/contextLib";
import { getLands } from "../functions/UIStateFunctions.js";

import Loader from "../components/Loader";
import CardGrid from "../components/LandCardGrid";

export default ({ data }) => {
  const history = useHistory();
  const { globalState, setGlobalState } = useAppContext();
  const [lands, setLands] = useState(data);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);


  return lands && lands.length > 0 && 
    <div className="container">
      <CardGrid data={lands} globalState={globalState} cardSize="" currentCard={currentCard} setCurrentCard={setCurrentCard} />
    </div>
}

export async function getServerSideProps() {
  const data = await getLands(1, 100);

  return { props: { data } }
}

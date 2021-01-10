import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../libs/contextLib";
import { getBooths } from "../functions/UIStateFunctions.js";

import CardGrid from "../components/CardGrid";

export default ({ data }) => {
  const [booths, setBooths] = useState(data);
  const [currentCard, setCurrentCard] = useState(null);

  const { globalState, setGlobalState } = useAppContext();

  return (
    <div className="container">
      <CardGrid data={booths} globalState={globalState} cardSize="" currentCard={currentCard} setCurrentCard={setCurrentCard} />
    </div>
  )
}

export async function getServerSideProps() {
  const data = await getBooths(0);

  return { props: { data } }
}

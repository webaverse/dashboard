import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getLands } from "../../functions/UIStateFunctions.js";

import Loader from "../../components/Loader";
import CardGrid from "../../components/LandCardGrid";

export default () => {
  const history = useHistory();
  const { globalState, setGlobalState } = useAppContext();
  const [lands, setLands] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);

  const pathName = window.location.pathname.split("/")[2];

  useEffect(() => {
    if (pathName && pathName != "") {
      setCurrentCard(pathName);
    } else if (pathName === "" || pathName === undefined || !pathName) {
      console.log("pathName is now", pathName);
      setCurrentCard(null);
    }

  }, [pathName]);

  useEffect(() => {
    (async () => {
      const lands = await getLands(1, 100);
      setLands(lands);
    })();

    if (pathName && pathName != "") {
      setCurrentCard(pathName);
    } else if (!pathName) {
      setCurrentCard(null);
    }
  }, []);

  useEffect(() => {
    if (lands && lands.length > 0) {
      setLoading(false);
    }
  }, [lands, currentCard]);

  useEffect(() => {
    if (!currentCard) return;

    if (currentCard && currentCard.hide === true) {
      setCurrentCard(null);
      history.push("/land");
    } else if (currentCard && currentCard.id) {
      history.push("/land/" + currentCard.id);
    }
  }, [currentCard]);

  return !loading && lands && lands.length > 0 ?
    <div className="container">
      <CardGrid data={lands} globalState={globalState} cardSize="" currentCard={currentCard} setCurrentCard={setCurrentCard} />
    </div>
  :
    <div className="container">
      <Loader loading={true} />
    </div>
}

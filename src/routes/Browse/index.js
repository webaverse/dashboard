import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import { Container, Row } from 'react-grid-system';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAppContext } from "../../libs/contextLib";
import { getTokens } from "../../functions/UIStateFunctions.js";
import MoonLoader from "react-spinners/MoonLoader";

import Loader from "../../components/Loader";
import CardGrid from "../../components/CardGrid";

export default () => {
  const history = useHistory();
  const { globalState, setGlobalState } = useAppContext();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(30);
  const [hasMore, setHasMore] = useState(true);

  const pathName = window.location.pathname.split("/")[2];

  const fetchData = async () => {
    const res = await getTokens(start, end);
    if (res.length === 1 && res[0].totalSupply === 0) {
      setHasMore(false);
      console.log(tokens[tokens.length-1]);
      console.log(tokens[tokens.length]);
      console.log(tokens);

      const newTokens = tokens;
      newTokens.splice(tokens.length-1, 1);
      console.log(newTokens);
      setTokens(newTokens);
    } else {
      console.log(tokens);
      console.log("res", res);
      setTokens([...tokens, ...res]);
      setStart(start+10);
      setEnd(end+10);
    }
  }

  useEffect(() => {
    if (pathName && pathName != "all") {
      setCurrentCard(pathName);
    } else if (pathName === "all" || pathName === undefined || !pathName) {
      console.log("pathName is now", pathName);
      setCurrentCard(null);
      history.push("/browse/all");
    }

  }, [pathName]);

  useEffect(() => {
    fetchData();

    if (pathName && pathName != "all") {
      setCurrentCard(pathName);
    } else if (!pathName) {
      setCurrentCard(null);
    }
  }, []);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setLoading(false);
    }
  }, [tokens, currentCard]);

  useEffect(() => {
    if (!currentCard) return;

    if (currentCard && currentCard.hide === true) {
      setCurrentCard(null);
      history.push("/browse/all");
    } else if (currentCard && currentCard.id) {
      history.push("/browse/" + currentCard.id);
    }
  }, [currentCard]);

  return !loading && tokens && tokens.length > 0 ?
    <div className="container">
      <InfiniteScroll
        style={{ overflow: 'hidden' }}
        dataLength={tokens.length}
        next={fetchData}
        hasMore={hasMore}
        loader={hasMore ? <MoonLoader css={"margin: 0 auto;"} size={50} color={"#c4005d"} /> : null}
      >
        <CardGrid data={tokens} globalState={globalState} cardSize="" currentCard={currentCard} setCurrentCard={setCurrentCard} />
      </InfiniteScroll>
    </div>
  :
    <div className="container">
      <Loader loading={true} />
    </div>
}

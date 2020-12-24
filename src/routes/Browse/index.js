import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getBooths } from "../../functions/UIStateFunctions.js";

import Loader from "../../components/Loader";
import Inventory from "../../components/Inventory";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooths(0, globalState).then(res => {
      console.log(res);
      setGlobalState(res);
      setLoading(false);
    });
  }, []);

  const Sales = () => globalState.booths[0] ? globalState.booths[0].map((seller, i) =>
    <Inventory key={i} inventory={seller.entries} />
  ) : null

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Loader loading={loading} />
        <Sales />
      </Row>
    </Container>
  )
}

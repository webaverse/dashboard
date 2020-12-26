import React, { useState } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getBooths } from "../../functions/UIStateFunctions.js";

import Loader from "../../components/Loader";
import Inventory from "../../components/Inventory";

export default () => {
  const { globalState, setGlobalState } = useAppContext();

  const Sales = () => globalState.creatorBooths ? Object.keys(globalState.creatorBooths).map((seller, i) =>
    <Inventory key={i} inventory={globalState.creatorBooths[seller][1]} />
  ) : null

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Loader loading={Object.keys(globalState.creatorBooths).length > 0 ? false : true} />
        <Sales />
      </Row>
    </Container>
  )
}

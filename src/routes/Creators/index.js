import React, { useState } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getCreators } from "../../functions/UIStateFunctions.js";
import Loader from "../../components/Loader";
import Inventory from "../../components/Inventory";


export default () => {
  const { globalState, setGlobalState } = useAppContext();

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Loader loading={globalState.creators[0] ? false : true} />
        <Inventory inventory={globalState.creators[0]} />
      </Row>
    </Container>
  )
}

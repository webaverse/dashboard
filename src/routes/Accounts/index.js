import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator, getBoothForCreator, getBalance } from "../../functions/UIStateFunctions.js";

import Loader from "../../components/Loader";
import Cards from "../../components/Inventory";
import ProfileHeader from "../../components/Profile";

export default () => {
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();

  return (
    <Container>
      <Row sm={8} md={10} lg={10} style={{ justifyContent: "center" }}>
        <Loader loading={globalState.creatorInventories[id] && globalState.creatorProfiles[id] ? false : true} />
        <ProfileHeader profile={globalState.creatorProfiles[id]} />
        <Cards inventory={globalState.creatorBooths[id] ? globalState.creatorBooths[id][0] : null} />
        <Cards inventory={globalState.creatorInventories[id] ? globalState.creatorInventories[id][0] : null} />
      </Row>
    </Container>
  )
}

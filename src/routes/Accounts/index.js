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
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [forSale, setForSale] = useState(null);
  const [inventory, setInventory] = useState(null);

  const init = async () => {
    const creatorInventory = await getInventoryForCreator(id, 0, true, globalState);
    const creatorBooth = await getBoothForCreator(id, 0, true, globalState);
    const balanceRes = await getBalance(id);
    const creatorProfile = await getProfileForCreator(id, globalState);

    setInventory(creatorInventory.creatorInventories[id][0]);
    setForSale(creatorBooth.creatorBooths[id.toLowerCase()][0]);
    setBalance(balanceRes);
    setProfile({ ...creatorProfile.creatorProfiles[id], balance: balanceRes });
    setLoading(false);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <Container>
      <Row sm={8} md={10} lg={10} style={{ justifyContent: "center" }}>
        <Loader loading={loading} />
        <ProfileHeader profile={profile} />
        <Cards inventory={forSale} />
        <Cards inventory={inventory} />
      </Row>
    </Container>
  )
}

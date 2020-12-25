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

  useEffect(() => {
    getInventoryForCreator(id, 0, true, globalState).then(res => {
      setInventory(res.creatorInventories[id][0]);
    });

    getBoothForCreator(id, 0, true, globalState).then(res => {
      setForSale(res.creatorBooths[id.toLowerCase()][0]);
    });
  
    getBalance(id).then(balanceRes => {
      setBalance(balanceRes);

      getProfileForCreator(id, globalState).then(res => {
        setProfile({ ...res.creatorProfiles[id], balance: balanceRes });
        setLoading(false);
      });
    });
  }, []);

  return (
    <Container>
      <Row sm={8} md={10} lg={10} style={{ justifyContent: "center" }}>
        <Loader loading={loading} />
        <ProfileHeader profile={profile} />
        <Col sm={12}>
          <h1>For Sale</h1>
        </Col>
        <Cards inventory={forSale} />
        <Col sm={12}>
          <h1>Inventory</h1>
        </Col>
        <Cards inventory={inventory} />
      </Row>
    </Container>
  )
}

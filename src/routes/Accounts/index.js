import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator, getBoothForCreator, getBalance } from "../../functions/UIStateFunctions.js";
import { getLoadout } from "../../functions/AssetFunctions.js";

import Loader from "../../components/Loader";
import Cards from "../../components/Inventory";
import ProfileHeader from "../../components/Profile";

export default () => {
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loadout, setLoadout] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    (async () => {
      const balance = await getBalance(id);
      const loadout = await getLoadout(id);
      const profile = await getProfileForCreator(id, globalState);
      const inventory = await getInventoryForCreator(id, 0, true, globalState);
      const store = await getBoothForCreator(id, 0, true, globalState);
      console.log(store);

      setBalance(balance);
      setLoadout(loadout);
      setProfile(profile.creatorProfiles[id]);
      setInventory(inventory.creatorInventories[id][0]);
      setStore(store.creatorBooths[id.toLowerCase()][0]);
      setLoading(false);
    })();
  }, []);

  return (
    <Row style={{ justifyContent: "center" }}>
      <Loader loading={loading} />
      <ProfileHeader loadout={loadout} balance={balance} profile={profile} />
      <Cards inventory={store} />
      <Cards inventory={inventory} />
    </Row>
  )
}

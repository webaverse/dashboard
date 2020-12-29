import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator, getBoothForCreator, getBalance } from "../../functions/UIStateFunctions.js";
import { getLoadout } from "../../functions/AssetFunctions.js";

import Loader from "../../components/Loader";
import CardGrid from "../../components/CardGrid";
import ProfileHeader from "../../components/Profile";

import './style.css';

export default () => {
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loadout, setLoadout] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [selectedView, setSelectedView] = useState("inventory");

  const handleViewToggle = (view) => setSelectedView(view);

  useEffect(() => {
    (async () => {
      if (id) {
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
      }
    })();
  }, []);

  return (
    <div>
      {[
        loading && (
        <Loader loading={loading} />),
        !loading && (
        <ProfileHeader loadout={loadout} balance={balance} profile={profile} />),
        !loading && (
        <div className="profileBodyNav">
          <div className="profileBodyNavContainer">
            <a className={`profileNavLink ${selectedView === "store" ? "active disable" : ""}`} onClick={() => handleViewToggle("store")}>
              Store
            </a>
            <a className={`profileNavLink ${selectedView === "inventory" ? "active disable" : ""}`} onClick={() => handleViewToggle("inventory")}>
              Inventory
            </a>
          </div>
        </div>),
        !loading && (
        <div className="profileBodyAssets">
          {selectedView === "store" ?
            store && (
            <CardGrid data={store} globalState={globalState} cardSize="" />)
          :
            inventory && (
            <CardGrid data={inventory} globalState={globalState} cardSize="" />)
          }
        </div>)
      ]}
    </div>
  )
}

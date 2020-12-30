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

  const logout = () => {
    setGlobalState({ ...globalState, logout: "true" });
  }
  const loadStore = async () => {
    const store = await getBoothForCreator(id, 0, true, globalState);
    setStore(store.creatorBooths[id.toLowerCase()][0]);
    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      (async () => {
        const balance = await getBalance(id);
        setBalance(balance);
      })();
      (async () => {
        const loadout = await getLoadout(id);
        setLoadout(loadout);
      })();
      (async () => {
        const profile = await getProfileForCreator(id, globalState);
        setProfile(profile.creatorProfiles[id]);
        setLoading(false);
      })();
      (async () => {
        const inventory = await getInventoryForCreator(id, 0, true, globalState);
        setInventory(inventory.creatorInventories[id][0]);
      })();
    }

    if (globalState && id.toLowerCase() === globalState.address) {
      handleViewToggle("settings");
    }
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
            {(
            <a className={`profileNavLink ${selectedView === "store" ? "active disable" : ""}`} onClick={() => {
              setLoading("true");
              loadStore();
              handleViewToggle("store");
            }}>
              Store
            </a>)}
            {inventory && inventory.length > 0 && (
            <a className={`profileNavLink ${selectedView === "inventory" ? "active disable" : ""}`} onClick={() => handleViewToggle("inventory")}>
              Inventory
            </a>)}
            {globalState && globalState.address === id.toLowerCase() && (
            <a className={`profileNavLink ${selectedView === "settings" ? "active disable" : ""}`} onClick={() => handleViewToggle("settings")}>
              Settings
            </a>)}
          </div>
        </div>),
        !loading && (
        <div className="profileBodyAssets">
          {[
          selectedView === "store" && store && (
            <CardGrid data={store} globalState={globalState} cardSize="" />
          ),
          selectedView === "inventory" && inventory && (
            <CardGrid data={inventory} globalState={globalState} cardSize="" />
          )
          ]}
        </div>),
        !loading && selectedView === "settings" && globalState && globalState.address == id.toLowerCase() && (
          <div className="settingsButtonsContainer">
          {[
            (<a className="button" onClick={() => {
              const name = prompt("What is your name?", "Satoshi");
              setName(name, globalState, handleSuccess, handleError)
            }}>
              Change Name
            </a>),
            (<a className="button" onClick={() => logout()}>
              Logout
            </a>)
          ]}
          </div>
        )
      ]}
    </div>
  )
}

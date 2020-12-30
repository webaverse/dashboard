import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-grid-system';
import { useHistory, useParams } from "react-router-dom";
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator, getBoothForCreator, getBalance } from "../../functions/UIStateFunctions.js";
import { getLoadout } from "../../functions/AssetFunctions.js";

import Loader from "../../components/Loader";
import CardGrid from "../../components/CardGrid";
import ProfileHeader from "../../components/Profile";

import './style.css';

export default () => {
  const history = useHistory();
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loadout, setLoadout] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [selectedView, setSelectedView] = useState("inventory");

  const currentTab = window.location.pathname.split("/")[3];
  console.log("pathname", window.location.pathname);

  const handleViewToggle = (view) => {
    history.push("/accounts/" + id + "/" + view);
    setSelectedView(view);
  }

  const logout = () => {
    setGlobalState({ ...globalState, logout: "true" });
  }

  useEffect(() => {
    if (id) {
      (async () => {
        const profile = await getProfileForCreator(id, globalState);
        setProfile(profile.creatorProfiles[id]);
      })();
      (async () => {
        const inventory = await getInventoryForCreator(id, 0, true, globalState);
        if (inventory.creatorInventories[id][0][0] != "0") {
          setInventory(inventory.creatorInventories[id][0]);
        }
      })();
      (async () => {
        const store = await getBoothForCreator(id, 0, true, globalState);
        setStore(store.creatorBooths[id.toLowerCase()][0]);
      })();
      (async () => {
        const balance = await getBalance(id);
        setBalance(balance);
      })();
      (async () => {
        const loadout = await getLoadout(id);
        setLoadout(loadout);
      })();
    }

    if (globalState && id.toLowerCase() === globalState.address) {
      handleViewToggle("settings");
    } else if (currentTab) {
      handleViewToggle(currentTab);
    } else {
      handleViewToggle(selectedView);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setLoading(false);
    }
  }, [inventory, profile]);


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
            {store && store.length > 0 && (
            <a className={`profileNavLink ${currentTab === "store" ? "active disable" : ""}`} onClick={() => {
              handleViewToggle("store");
            }}>
              Store
            </a>)}
            {inventory && inventory.length > 0 && (
            <a className={`profileNavLink ${currentTab === "inventory" ? "active disable" : ""}`} onClick={() => handleViewToggle("inventory")}>
              Inventory
            </a>)}
            {globalState && globalState.address === id.toLowerCase() && (
            <a className={`profileNavLink ${currentTab === "settings" ? "active disable" : ""}`} onClick={() => handleViewToggle("settings")}>
              Settings
            </a>)}
          </div>
        </div>),
        !loading && (
        <div className="profileBodyAssets">
          {[
          currentTab === "store" && store && (
            <CardGrid data={store} globalState={globalState} cardSize="" />
          ),
          currentTab === "inventory" && inventory && (
            <CardGrid data={inventory} globalState={globalState} cardSize="" />
          )
          ]}
        </div>),
        !loading &&  currentTab === "settings" && globalState && globalState.address == id.toLowerCase() && (
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

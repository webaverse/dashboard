import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container, Row, Col } from 'react-grid-system';
import { useHistory, useParams } from "react-router-dom";
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator, getStoreForCreator, getBalance } from "../../functions/UIStateFunctions.js";
import { setName, getLoadout } from "../../functions/AssetFunctions.js";

import Loader from "../../components/Loader";
import CardGrid from "../../components/CardGrid";
import ProfileHeader from "../../components/Profile";

export default ({ data }) => {
  const history = useHistory();
  const router = useRouter()
  const { id } = router.query
  const { globalState, setGlobalState } = useAppContext();
  const [inventory, setInventory] = useState(data.inventory);
  const [balance, setBalance] = useState(data.balance);
  const [loadout, setLoadout] = useState(data.loadout);
  const [profile, setProfile] = useState(data.profile);
  const [store, setStore] = useState(data.store);
  const [selectedView, setSelectedView] = useState("inventory");

  const handleViewToggle = (view) => {
    setSelectedView(view);
  }

  const logout = () => {
    setGlobalState({ ...globalState, logout: "true" });
  }

  const handleSuccess = () => {
    console.log("success!");
  }

  const handleError = (err) => {
    console.log("error", err);
    //setLoading(false);
  }

  return (
    <div>
      <Head>
        <title>{profile.name} | Webaverse</title>
        <meta name="description" content={"Check out " + profile.name + "'s items on Webaverse."} />
        <meta property="og:title" content={profile.name + "'s account | Webaverse"} />
        <meta property="og:image" content={profile.avatarPreview ? profile.avatarPreview.replace(/\.[^.]*$/, '.png') : "./preview.png"} />
        <meta name="theme-color" content="#c4005d" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {[
        (<ProfileHeader loadout={loadout} balance={balance} profile={profile} />),
        (<div className="profileBodyNav">
          <div className="profileBodyNavContainer">
            {store && store.length > 0 && (
            <a className={`profileNavLink ${selectedView === "store" ? "active disable" : ""}`} onClick={() => {
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
        (<div className="profileBodyAssets">
          {[
          selectedView === "store" && store && (
            <CardGrid data={store} globalState={globalState} cardSize="small" />
          ),
          selectedView === "inventory" && inventory && (
            <CardGrid data={inventory} globalState={globalState} cardSize="small" />
          )
          ]}
        </div>),
        selectedView === "settings" && globalState && globalState.address == id.toLowerCase() && (
          <div className="settingsButtonsContainer">
          {[
            (<a className="button" onClick={() => {
              const name = prompt("What is your name?", "Satoshi");
              setName(name, globalState, handleSuccess, handleError)
              //setLoading(true);
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

export async function getServerSideProps({ params }) {
  const id = params.id;

  const profile = await getProfileForCreator(id);
  const inventory = await getInventoryForCreator(id);
  const store = await getStoreForCreator(id);
  const balance = await getBalance(id);
  const loadout = await getLoadout(id);

  return { 
    props: { 
      data: {
        profile: profile,
        inventory: inventory,
        store: store,
        balance: balance,
        loadout: loadout 
      }
    } 
  }
}

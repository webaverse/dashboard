import React, { useState, useEffect } from 'react'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container, Row, Col } from 'react-grid-system';
import { useHistory, useParams } from "react-router-dom";
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator, getStoreForCreator, getBalance } from "../../functions/UIStateFunctions.js";
import { setName, getLoadout, withdrawFlux, depositFlux } from "../../functions/AssetFunctions.js";

import Loader from "../../components/Loader";
import CardGrid from "../../components/CardGrid";
import ProfileHeader from "../../components/Profile";

export default () => {
  const history = useHistory();
  const router = useRouter()
  const { id } = router.query;
  const { globalState, setGlobalState } = useAppContext();
  const [inventory, setInventory] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loadout, setLoadout] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [selectedView, setSelectedView] = useState("inventory");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && !profile && !balance && !inventory && !store && !loadout) {
      (async () => {
        const profile = await getProfileForCreator(id);
        setProfile(profile);
      })();
      (async () => {
        const inventory = await getInventoryForCreator(id);
        setInventory(inventory);
      })();
      (async () => {
        const store = await getStoreForCreator(id);
        setStore(store);
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
  }, [id]);

  const handleViewToggle = (view) => {
    setSelectedView(view);
  }

  const logout = () => {
    setGlobalState({ ...globalState, logout: "true" });
  }

  const handleSuccess = () => {
    console.log("success!");
    setLoading(false);
    if (window != "undefined") {
      location.reload();
    }
  }

  const handleError = (err) => {
    console.log("error", err);
    setLoading(false);
  }

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      if (window.web3.version.network == 4) {
        return true;
      } else {
        alert("You need to be on the Rinkeby network.");
        return false;
      }
    }
    alert("Please install MetaMask to use Webaverse!");
    return false;
  }

  const loginWithMetaMask = async (func) => {
    if (!ethEnabled()) {
      return;
    } else {
      const web3 = window.web3;
      try {
        const eth = await window.ethereum.request({ method: 'eth_accounts' });
        if (eth && eth[0]) {
          //setMainnetAddress(eth[0]);
          return eth[0];
        } else {
          ethereum.on('accountsChanged', (accounts) => {
            //setMainnetAddress(accounts[0]);
            func();
          });
          return false;
        }
      } catch(err) {
        handleError(err);
      }
    }
  }

  const handleDeposit = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const ethAccount = await loginWithMetaMask(handleWithdraw);
      if (ethAccount) {
        const amount = prompt("How much FLUX do you want to transfer?", "10");
        const mainnetAddress = prompt("What mainnet address do you want to transfer to?", "0x0");
        await depositFlux(amount, mainnetAddress, globalState, handleSuccess, handleError);
        handleSuccess();
      } else {
        setLoading(false);
      }
    } catch (err) {
      handleError(err.toString());
    }

  }

  const handleWithdraw = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const ethAccount = await loginWithMetaMask(handleWithdraw);
      if (ethAccount) {
        const amount = prompt("How much FLUX do you want to transfer?", "10");
        const mainnetAddress = prompt("What mainnet address do you want to transfer from?", "0x0");
        await withdrawFlux(amount, mainnetAddress, globalState.address, globalState, handleSuccess, handleError);
        handleSuccess();
      } else {
        setLoading(false);
      }
    } catch (err) {
      handleError(err.toString());
    }

  }

  return (<>{
    loading || !loadout || !store || !inventory || !balance || !profile ?
    <Loader loading={true} />
  :
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
        (<ProfileHeader key="profileHeader" loadout={loadout} balance={balance} profile={profile} />),
        (<div key="profileBodynav" className="profileBodyNav">
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
        (<div key="profileBodyAssets" className="profileBodyAssets">
          {[
          selectedView === "store" && store && (
            <CardGrid key="storeCards" data={store} globalState={globalState} cardSize="small" />
          ),
          selectedView === "inventory" && inventory && (
            <CardGrid key="inventoryCards" data={inventory} globalState={globalState} cardSize="small" />
          )
          ]}
        </div>),
        selectedView === "settings" && globalState && globalState.address == id.toLowerCase() && (
          <div key="settingsButtonsContainer" className="settingsButtonsContainer">
          {[
            (<a key="fluxToMainnetButton" className="button" onClick={handleDeposit}>
              Transfer FLUX to mainnet
            </a>),
            (<a key="fluxButton" className="button" onClick={handleWithdraw}>
              Transfer FLUX from mainnet
            </a>),
            (<a key="nameChangeButton" className="button" onClick={() => {
              const name = prompt("What is your name?", "Satoshi");
              setName(name, globalState, handleSuccess, handleError)
              setLoading(true);
            }}>
              Change Name
            </a>),
            (<a key="logoutButton" className="button" onClick={() => logout()}>
              Logout
            </a>)
          ]}
          </div>
        )
      ]}
    </div>
  }</>)
}

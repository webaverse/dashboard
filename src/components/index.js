import React, { useEffect, useState } from 'react'
import createHistory from 'history/createBrowserHistory'
import { AppContext } from "../libs/contextLib";
import MoonLoader from "react-spinners/MoonLoader";

import Routes from "./Routes";
import NavBar from "./NavBar";
import Footer from "./Footer";

import '../assets/css/custom.css';
import '../assets/css/content.css';


const Loader = () =>  <MoonLoader css={"display: inline-block"} size={50} color={"#c4005d"} />

const App = () => {
  const [globalState, setGlobalState] = useState({
    useWebXR: false,
    loginToken: null,
    name: "anon",
    mainnetAddress: null,
    mainnetFtBalance: null,
    mainnetInventory: null,
    showUserDropdown: false,
    address: null,
    avatarUrl: null,
    avatarFileName: null,
    avatarPreview: null,
    homespaceUrl: null,
    homespaceFileName: null,
    homespacePreview: null,
    ftu: true,
    inventory: null,
    creatorProfiles: {},
    creatorInventories: {},
    creatorBooths: {},
    creators: {},
    booths: {},
    lastFileHash: null,
    lastFileId: null
  });

  React.useEffect(() => {
    if (globalState.address) {
      localStorage.setItem('globalState', JSON.stringify(globalState));
    }
  }, [globalState]);

  React.useEffect(() => {
    if (!globalState.address && localStorage.getItem('globalState')) {
     setGlobalState(JSON.parse(localStorage.getItem('globalState')));
    }
  }, []);


  return (
        <AppContext.Provider value={{ globalState, setGlobalState }}>
          <NavBar />
          <Routes />
          <Footer />
        </AppContext.Provider>
  )
}

export default App

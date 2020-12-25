import React, { useEffect, useState } from 'react'
import createHistory from 'history/createBrowserHistory'
import { AppContext } from "./libs/contextLib";
import { InitialStateValues } from "./constants/InitialStateValues";
import storage from "./functions/Storage";
import { getCreators, getBooths, getInventoryForCreator } from "./functions/UIStateFunctions.js";

import Routes from "./routes";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

import './assets/css/custom.css';
import './assets/css/content.css';

const App = () => {
  const [globalState, setGlobalState] = useState(InitialStateValues);

  const init = async () => {
    const creators = await getCreators(0, globalState);

    const booths = await getBooths(0, globalState);

    const tokens = [];
    const tokensPromise = await Promise.all(creators.creators[0].map(async creator => {
      const inventory = await getInventoryForCreator(creator.address, 0, true, globalState);
      return tokens.push(...inventory.creatorInventories[creator.address][0]);
    }));
    const sortedTokens = tokens.sort((a, b) => a.id - b.id);
    setGlobalState({ ...globalState, ...creators, ...booths, tokens: sortedTokens });
  }

  const updateLocalStorage = async (globalState) => {
    if (globalState.logout === "true") {
       setGlobalState({ ...globalState, logout: "false", address: "", name: "", avatarUrl: "", avatarPreview: "", avatarFileName: "" });
      await storage.set('globalState', JSON.stringify(globalState));
      await storage.set('loginToken', null);
    }
    if (globalState.address) {
      await storage.set('globalState', JSON.stringify(globalState));
    }
  }

  const getLocalStorage = async () => {
    const storageState = await storage.get('globalState');

    if (storageState) {
      setGlobalState(JSON.parse(storageState));
    }
  } 

  React.useEffect(() => {
    updateLocalStorage(globalState);
  }, [globalState]);

  React.useEffect(() => {
    getLocalStorage(); 
    init();
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

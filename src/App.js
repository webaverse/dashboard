import React, { useEffect, useState } from 'react'
import createHistory from 'history/createBrowserHistory'
import { AppContext } from "./libs/contextLib";
import { InitialStateValues } from "./constants/InitialStateValues";
import storage from "./functions/Storage";
import { getCreators, getBooths, getStores, getInventoryForCreator, getProfileForCreator, getBalance } from "./functions/UIStateFunctions.js";

import Routes from "./routes";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

import './assets/css/custom.css';
import './assets/css/content.css';

const App = () => {
  const [globalState, setGlobalState] = useState(InitialStateValues);

  const init = async () => {
    const storageState = await storage.get('globalState');
    const loginToken = await storage.get('loginToken');

    if (storageState && loginToken) {
      setGlobalState({...storageState, loginToken: loginToken});
    } else if (storageState) {
      setGlobalState(storageState);
    } else if (loginToken) {
      setGlobalState({...globalState, loginToken: loginToken});
    }
  }

  const updateLocalStorage = async (globalState) => {
    if (globalState.login === "true") {
      await storage.set('globalState', globalState);
      await storage.set('loginToken', globalState.loginToken);
      setGlobalState({ ...globalState, login: "false" });
    } else if (globalState.logout === "true") {
      await storage.set("globalState", { ...globalState, logout: "false", loginToken: null, address: "", name: "", avatarUrl: "", avatarPreview: "", avatarFileName: "" });
      await storage.set('loginToken', null);
       setGlobalState({ ...globalState, logout: "false", loginToken: null, address: "", name: "", avatarUrl: "", avatarPreview: "", avatarFileName: "" });
    } else if (globalState.refresh === "true") {
      init();
    } else if (globalState.address) {
      const localStorageState = await getLocalStorage();
      await storage.set('globalState', globalState);
    }
  }

  React.useEffect(() => {
    updateLocalStorage(globalState);
  }, [globalState]);

  React.useEffect(() => {
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

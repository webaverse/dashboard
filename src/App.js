import React, { useEffect, useState } from 'react'
import createHistory from 'history/createBrowserHistory'
import { AppContext } from "./libs/contextLib";
import { InitialStateValues } from "./constants/InitialStateValues";
import storage from "./functions/Storage";
import { pullUserObject, getCreators, getBooths, getStores, getInventoryForCreator, getProfileForCreator, getBalance } from "./functions/UIStateFunctions.js";

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
      const newState = await pullUserObject({...storageState, loginToken: loginToken});
      setGlobalState({ ...newState, init: true });
    } else if (storageState) {
      const newState = await pullUserObject({...storageState});
      setGlobalState({ ...newState, init: true });
    } else if (loginToken) {
      const newState = await pullUserObject({...globalState, loginToken: loginToken});
      setGlobalState({ ...newState, init: true });
    } else {
      setGlobalState({ ...globalState, init: true });
    }
  }

  const updateLocalStorage = async (globalState) => {
    if (globalState.login === "true") {
      await storage.set('globalState', globalState);
      if (globalState.loginToken) {
        await storage.set('loginToken', globalState.loginToken);
      }
      setGlobalState({ ...globalState, login: "false" });
    } else if (globalState.logout === "true") {
      await storage.remove("globalState");
      await storage.remove("loginToken");
      setGlobalState(InitialStateValues);
    } else if (globalState.refresh === "true") {
      init();
    } else if (globalState.address) {
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
          { globalState.init === true ?
            <Routes />
          :
            <div>
              <Loader loading={true} />
            </div>
          }
          <Footer />
        </AppContext.Provider>
  )
}

export default App

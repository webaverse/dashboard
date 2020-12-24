import React, { useEffect, useState } from 'react'
import createHistory from 'history/createBrowserHistory'
import { AppContext } from "./libs/contextLib";
import { InitialStateValues } from "./constants/InitialStateValues";

import Routes from "./routes";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

import './assets/css/custom.css';
import './assets/css/content.css';

const App = () => {
  const [globalState, setGlobalState] = useState(InitialStateValues);


  React.useEffect(() => {
    console.log("globalState changed");
    if (globalState.logout === "true") {
       setGlobalState({ ...globalState, logout: "false", address: "", name: "", avatarUrl: "", avatarPreview: "", avatarFileName: "" });
      localStorage.setItem('globalState', JSON.stringify(globalState));
      console.log("globalState changed logged out");
    }
    if (globalState.address) {
      localStorage.setItem('globalState', JSON.stringify(globalState));
      console.log("globalState changed with address");
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

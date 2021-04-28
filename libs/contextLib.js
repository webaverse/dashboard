import { createElement, createContext, useContext, useState, useEffect } from 'react';
import { InitialStateValues } from "../constants/InitialStateValues";
import storage from "../functions/Storage";
import { pullUserObject } from "../functions/UIStateFunctions.js";


export const AppContext = createContext(null);

export function useAppContext() {
  return useContext(AppContext);
}

export function AppWrapper({ children }) {
  const [globalState, setGlobalState] = useState(InitialStateValues);

  const init = async () => {
    const loginToken = await storage.get('loginToken');

    if (loginToken) {
      const newState = await pullUserObject({...globalState, loginToken});
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
      window.location.href = "/browse";
    } else if (globalState.refresh === "true") {
      init();
    } else if (globalState.address) {
      await storage.set('globalState', globalState);
    }
  }

  useEffect(() => {
    updateLocalStorage(globalState);
  }, [globalState]);

  useEffect(() => {
    init();
  }, []);

  return createElement(
    AppContext.Provider,
    {
      value: {
        globalState,
        setGlobalState,
      },
    },
    children
  );
}

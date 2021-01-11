import { createContext, useContext, useState, useEffect } from 'react';
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

  return (
    <AppContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </AppContext.Provider>
  );
}

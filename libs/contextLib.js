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
      setGlobalState({ ...newState, loaded: true });
    } else {
      setGlobalState({ ...globalState, loaded: true });
    }
  }

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

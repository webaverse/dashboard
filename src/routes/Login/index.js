import React, { useEffect } from 'react'
import { useParams } from "react-router-dom"
import { useAppContext } from "../../libs/contextLib";
import { parseQuery } from "../../functions/Functions";
import storage from "../../functions/Storage";
import Loader from "../../components/Loader";

export default () => {
  const code = new URLSearchParams(window.location.search).get("code") || "";
  const id = new URLSearchParams(window.location.search).get("id") || "";
  const { globalState, setGlobalState } = useAppContext();

  useEffect(async () => {
    if (code) {
      const res = await fetch(`https://login.exokit.org/?discordcode=${code}&id=${id}`, {method: 'POST'});
      const j = await res.json();
      const {mnemonic} = j;
      if (mnemonic) {
        await storage.set('loginToken', { mnemonic });
        await storage.set('globalState', {...globalState, loginToken: { mnemonic } });
        location.href = '/settings';
        await setGlobalState({...globalState, loginToken: { mnemonic } });
      } else {
        console.warn('no mnemonic returned');
        location.href = '/settings';
      }
    } else {
      console.warn('no discord code provided');
      location.href = '/settings';
    }
  }, []);

  return <Loader loading={true} />
}

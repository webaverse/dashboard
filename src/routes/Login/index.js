import React, { useEffect } from 'react'
import { useParams } from "react-router-dom"
import { useAppContext } from "../../libs/contextLib";
import { parseQuery } from "../../functions/Functions";
import storage from "../../functions/Storage";
import Loader from "../../components/Loader";

export default () => {
  const { code } = useParams();
  const { globalState, setGlobalState } = useAppContext();

  useEffect(async () => {
    if (code) {
      const res = await fetch(`https://login.exokit.org/?discordcode=${code}`, {method: 'POST'});
      const j = await res.json();
      const {mnemonic} = j;
      await storage.set('globalState', JSON.stringify({...globalState, loginToken: mnemonic}));
      location.href = '/settings';
    } else {
      console.warn('no discord code provided', q);
      location.href = '/settings';
    }
  }, []);

  return <Loader loading={true} />
}

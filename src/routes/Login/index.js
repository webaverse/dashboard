import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom"
import { useAppContext } from "../../libs/contextLib";
import { parseQuery } from "../../functions/Functions";
import storage from "../../functions/Storage";
import Loader from "../../components/Loader";

export default () => {
  const code = new URLSearchParams(window.location.search).get("code") || "";
  const id = new URLSearchParams(window.location.search).get("id") || "";
  const { globalState, setGlobalState } = useAppContext();
  const [message, setMessage] = useState(null);

  useEffect(async () => {
    if (code || login) {
      const res = await fetch(`https://login.exokit.org/?discordcode=${code}&discordid=${id}`, {method: 'POST'});
      const j = await res.json();
      const {mnemonic} = j;
      if (mnemonic) {
        await storage.set('loginToken', { mnemonic });
        await storage.set('globalState', {...globalState, loginToken: { mnemonic } });
//        location.href = '/settings';
        await setGlobalState({...globalState, loginToken: { mnemonic } });
        setMessage('got mnemonic, logging in');
      } else {
        console.warn('no mnemonic returned from api');
        setMessage('no mnemonic returned from api: ', j);
//        location.href = '/settings';
      }
    } else {
      console.warn('no discord code or id provided');
      setMessage('no discord code or id provided');
//      location.href = '/settings';
    }
  }, []);

  return !message ?
    <Loader loading={true} />
  :
    <div>
      <p>{message}</p>
    </div>
}

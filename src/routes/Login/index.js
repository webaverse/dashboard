import React, { useEffect, useState } from 'react'
import { Redirect, useParams } from "react-router-dom"
import { useAppContext } from "../../libs/contextLib";
import { parseQuery } from "../../functions/Functions";
import storage from "../../functions/Storage";
import { loginWithPrivateKey, pullUser, getBalance } from "../../functions/UIStateFunctions.js";
import bip39 from '../../libs/bip39.js';
import Loader from "../../components/Loader";

export default () => {
  const code = new URLSearchParams(window.location.search).get("code") || "";
  const id = new URLSearchParams(window.location.search).get("id") || "";
  const { globalState, setGlobalState } = useAppContext();
  const [address, setAddress] = useState(null);

  const loginWithKey = (key) => {
    if (bip39.validateMnemonic(key)) {
      loginWithPrivateKey(key, globalState)
      .then(res => {
        setInitialState(res);
      })
      .catch(err => {
        console.log(err);
      });
    } else {
      alert("not a valid private key!");
    }
  }

  const setInitialState = async (state) => {
    const balance = await getBalance(state.address);
    const newState = await pullUser(state);

    setAddress(newState.address);
    setGlobalState({ balance, login: "true", ...newState });
  }

  useEffect(() => {
    (async () => {
      const res = await fetch(`https://login.exokit.org/?discordcode=${code}&discordid=${id}`, {method: 'POST'});
      const j = await res.json();
      const {mnemonic} = j;
      if (mnemonic) {
        loginWithKey(mnemonic);
      } else {
        console.warn('no mnemonic returned from api');
      }
    })();
  }, []);

  return (
    <div>
      <Loader loading={true} />
      {address && (
        <Redirect to={"/accounts/" + address} />
      )}
    </div>
  )
}

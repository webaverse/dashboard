import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from "react-router-dom"
import { useAppContext } from "../libs/contextLib";
import { parseQuery } from "../functions/Functions";
import storage from "../functions/Storage";
import { loginWithPrivateKey, pullUser, getBalance } from "../functions/UIStateFunctions.js";
import { discordOauthUrl } from '../webaverse/constants.js';
import bip39 from '../libs/bip39.js';
import Loader from "../components/Loader";

export default () => {
  const history = useHistory();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);

  const loginWithKey = (key, play) => {
    if (bip39.validateMnemonic(key)) {
      loginWithPrivateKey(key, globalState)
      .then(res => {
        setInitialState(res, key, play);
      })
      .catch(err => {
        console.log(err);
      });
    } else {
      alert("not a valid private key!");
    }
  }

  const setInitialState = async (state, key, play) => {
    const balance = await getBalance(state.address);
    const newState = await pullUser(state);

    if (play) {
      await storage.set("loginToken", { mnemonic: key });
      window.location.href = "https://app.webaverse.com";
    } else {
      setGlobalState({ balance, loginProcessed: true, login: "true", ...newState });
      history.push("/accounts/" + state.address);
    }
  }

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code") || "";
    const id = new URLSearchParams(window.location.search).get("id") || "";
    const play = new URLSearchParams(window.location.search).get("play") || false;

    if (code || id || play) {
      (async () => {
        const res = await fetch(`https://login.exokit.org/?discordcode=${code}&discordid=${id}`, {method: 'POST'});
        const j = await res.json();
        const {mnemonic} = j;
        if (mnemonic) {
          loginWithKey(mnemonic, true);
        } else {
          console.warn('no mnemonic returned from api');
        }
      })();
    } else {
      setLoading(false)
    }
  }, []);

  return (
    <>
      { loading ?
        <div>
          <Loader loading={loading} />
        </div>
      :
        <div className="container">
          <a className="button" href={discordOauthUrl}>
            Login With Discord
          </a>
        </div>
      }
    </>
  )
}

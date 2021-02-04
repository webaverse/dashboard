import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { useAppContext } from "../libs/contextLib";
import { parseQuery } from "../functions/Functions";
import storage from "../functions/Storage";
import { loginWithPrivateKey, pullUser, getBalance } from "../functions/UIStateFunctions.js";
import { discordOauthUrl } from '../webaverse/constants.js';
import bip39 from '../libs/bip39.js';
import Loader from "../components/Loader";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const loginWithKey = (key, play, realmId) => {
    if (bip39.validateMnemonic(key)) {
      loginWithPrivateKey(key, globalState)
      .then(res => {
        setInitialState(res, key, play, realmId);
      })
      .catch(err => {
        console.log(err);
      });
    } else {
      alert("not a valid private key!");
    }
  }

  const setInitialState = async (state, key, play, realmId) => {
    const balance = await getBalance(state.address);
    const newState = await pullUser(state);

    if (play) {
      const storedLoginToken = await storage.get("loginToken");

      if (storedLoginToken.mnemonic && storedLoginToken.mnemonic != state.loginToken.mnemonic) {
        if (!window.confirm("Do you want to overwrite your existing login?")) {
          router.push("/");
          return;
        }
      }

      await storage.set("loginToken", { mnemonic: key });
      if (realmId != "") {
        window.location.href = "https://app.webaverse.com/?r=room-" + realmId;
      } else {
        window.location.href = "https://app.webaverse.com";
      }
    } else {
      const storedLoginToken = await storage.get("loginToken");

      if (storedLoginToken.mnemonic && storedLoginToken.mnemonic != state.loginToken.mnemonic) {
        if (!window.confirm("Do you want to overwrite your existing login?")) {
          router.push("/");
          return;
        }
      }

      setGlobalState({ balance, loginProcessed: true, login: "true", ...newState });
      router.push("/accounts/" + state.address);
    }
  }

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code") || "";
    const id = new URLSearchParams(window.location.search).get("id") || "";
    const play = new URLSearchParams(window.location.search).get("play") || false;
    const realmId = new URLSearchParams(window.location.search).get("realmId") || "";
    const arrivingFromTwitter = new URLSearchParams(window.location.search).get("twitter") || false;

    if (code || id || play) {
      (async () => {
        try {
          const res = await fetch(
            arrivingFromTwitter ?
            `https://login.exokit.org/?twittercode=${code}&twitterid=${id}` :
            `https://login.exokit.org/?discordcode=${code}&discordid=${id}`, {method: 'POST'});
          if (res.status !== 200) {
            throw "Login did not work, got response: " + res.status;
          }
          const j = await res.json();
          const {mnemonic} = j;
          if (mnemonic) {
            loginWithKey(mnemonic, play, realmId);
          } else {
            console.warn('no mnemonic returned from api');
          }
        } catch (err) {
          setLoading(false);
          setError(err);
        }
      })();
    } else {
      setLoading(false)
    }
  }, []);

  return (
    <>
      {[
        error && (<div key="error">
          {error}
        </div>),
        loading && (<div key="loading">
          <Loader loading={loading} />
        </div>),
        !loading && (<div className="container" key="buttonContainer">
          <a className="button" href={discordOauthUrl}>
            Login With Discord
          </a>
        </div>)
      ]}
    </>
  )
}

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { useAppContext } from "../libs/contextLib";
import { parseQuery } from "../functions/Functions";
import storage from "../functions/Storage";
import { loginWithPrivateKey, pullUser, getBalance } from "../functions/UIStateFunctions.js";
import { discordOauthUrl } from '../webaverse/constants.js';
import bip39 from '../libs/bip39.js';
import Loader from "../components/Loader";

const Login = () => {
  const {globalState, setGlobalState} = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loginWithKey = (key, play, realmId) => {
    // console.log('loginWithKey 1');
    if (bip39.validateMnemonic(key)) {
      // console.log('loginWithKey 2');
      loginWithPrivateKey(key, globalState)
        .then(res => {
          // console.log('loginWithKey 3');
          setInitialState(res, key, play, realmId);
        })
        .catch(err => {
          console.warn('loginWithKey error', err);
        });
    } else {
      alert('not a valid private key!');
    }
  }

  const setInitialState = async (state, key, play, realmId) => {
    // console.log('setInitialState 1');
    
    const balance = await getBalance(state.address);
    // console.log('setInitialState 2');
    const newState = await pullUser(state);
    // console.log('setInitialState 3');

    if (play) {
      // console.log('setInitialState 4.1');
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
      // console.log('setInitialState 4.2');
      const storedLoginToken = await storage.get("loginToken");

      if (storedLoginToken.mnemonic && storedLoginToken.mnemonic != state.loginToken.mnemonic) {
        if (!window.confirm("Do you want to overwrite your existing login?")) {
          router.push("/");
          return;
        }
      }
      
      // console.log('setInitialState 5');

      setGlobalState({ balance, loginProcessed: true, login: "true", ...newState });
      // console.log('setInitialState 6');
      router.push("/accounts/" + state.address);
      // console.log('setInitialState 7');
    }
  }

  useEffect(async () => {
    const error = new URLSearchParams(window.location.search).get("error") || "";
    const code = new URLSearchParams(window.location.search).get("code") || "";
    const id = new URLSearchParams(window.location.search).get("id") || "";
    const play = new URLSearchParams(window.location.search).get("play") || false;
    const realmId = new URLSearchParams(window.location.search).get("realmId") || "";
    const arrivingFromTwitter = new URLSearchParams(window.location.search).get("twitter") || false;

    // console.log('effect 1');

    if (error) {
      router.push('/');
    } else if (code || id || play) {
      // console.log('effect 2');
      try {
        const res = await fetch(
          arrivingFromTwitter ?
          `https://login.exokit.org/?twittercode=${code}&twitterid=${id}` :
          `https://login.exokit.org/?discordcode=${code}&discordid=${id}`, {method: 'POST'});
        // console.log('effect 3');
        if (res.status !== 200) {
          throw "Login did not work, got response: " + res.status;
        }
        // console.log('effect 4');
        const j = await res.json();
        // console.log('effect 5');
        const {mnemonic} = j;
        if (mnemonic) {
          // console.log('effect 6');
          loginWithKey(mnemonic, play, realmId);
        } else {
          console.warn('no mnemonic returned from api');
        }
      } catch (err) {
        console.warn(err);
        setError(err);
      }
    } else {
      // router.push('/');
    }
    setLoading(false);
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
export default Login;
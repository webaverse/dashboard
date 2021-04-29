import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { useAppContext } from "../libs/contextLib";
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
  const [loginStep, setLoginStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

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

      await storage.set('loginToken', {
        mnemonic: key,
      });
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

      setGlobalState({ balance, loaded: true, ...newState });
      // console.log('setInitialState 6');
      router.push("/accounts/" + state.address);
      // console.log('setInitialState 7');
    }
  }

  useEffect(async () => {
    const error = new URLSearchParams(window.location.search).get("error") || "";
    const error_description = new URLSearchParams(window.location.search).get("error_description") || "";
    const code = new URLSearchParams(window.location.search).get("code") || "";
    const id = new URLSearchParams(window.location.search).get("id") || "";
    const play = new URLSearchParams(window.location.search).get("play") || false;
    const realmId = new URLSearchParams(window.location.search).get("realmId") || "";
    const arrivingFromTwitter = new URLSearchParams(window.location.search).get("twitter") || false;

    // console.log('effect 1');

    if (error || error_description) {
      // router.push('/');
      setError(error + '\n' + error_description);
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
      setLoginStep(1);
    }
    setLoading(false);
  }, []);
  
  // console.log('render login', error);

  return (
    <div className="login-page">
      {loginStep ? (
        <form className="login-page-form" onSubmit={async e => {
          e.preventDefault();
          
          console.log('got form submit', {loginStep, name, code});
          
          if (loginStep === 1 && email) {
            setLoginStep(loginStep + 1);
            
            const res = await fetch(`https://login.exokit.org/?email=${encodeURIComponent(email)}`, {
              method: 'POST',
            });
            const j = await res.json();
            
            // console.log('got j', j);
          } else if (loginStep === 2 && code) {
            const res = await fetch(`https://login.exokit.org/?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
              method: 'POST',
            });
            const j = await res.json();
            const {mnemonic} = j;
            
            // console.log('got result', j);
            
            await loginWithKey(mnemonic, false, null);
          } else {
            console.warn('unknown login step');
          }
        }} >
          {loginStep === 1 ?
            <input type="email" value={email} placeholder="your@email.com" onChange={e => {
              setEmail(e.target.value);
            }} />
          :
            <input type="password" value={code} placeholder="Verification code (check your email)" onChange={e => {
              setCode(e.target.value);
            }} />
          }
          <input type="submit" value="Submit" />
        </form>
      ) : (
        error ?
          <div className="login-page-error">
            {error}
          </div>
        :
          <div className="login-page-placeholder">Logging you in...</div>
      )}
    </div>
  )
}
export default Login;
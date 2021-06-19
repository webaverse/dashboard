import React, {Fragment, Component, useEffect, useState} from 'react'
import { useRouter } from 'next/router';
import { useAppContext } from "../libs/contextLib";
import storage from "../functions/Storage";
import {parseQuery} from "../webaverse/util";
import { loginWithPrivateKey, pullUser, getBalance } from "../functions/UIStateFunctions.js";
import { discordOauthUrl } from '../webaverse/constants.js';
import bip39 from '../libs/bip39.js';
import Loader from "../components/Loader";

class Input extends Component {
  componentDidMount(){
    this.input.focus();
  }
  render() {
    return(
      <input 
        ref={input => { this.input = input; }} 
        {...this.props}
      />
    );
  }
}

const Login = () => {
  const {globalState, setGlobalState} = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginStep, setLoginStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [useForm, setUseForm] = useState(false);

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

  {
    const {
      error,
      error_description,
      code,
      id,
      play,
      realmId,
      twitter: arrivingFromTwitter,
    } = typeof window !== 'undefined' ? parseQuery(window.location.search) : {};

    useEffect(async () => {
      // console.log('effect 1');

      if (!loading) {
        setLoading(true);
        
        setUseForm(!(error || error_description) && !(code || id || play));
        
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
        } else if (globalState.loginToken) {
          router.push('/');
        } else {
          setLoginStep(1);
        }
      }
    }, [globalState.loginToken]);
  }
  
  let emailEl = null; 
  let codeEl = null; 
  const submit = async () => {
    console.log('got form submit', {loginStep, name, code});
          
    if (loginStep === 1 && emailEl && emailEl.checkValidity()) {
      setLoginStep(loginStep + 1);
      
      const res = await fetch(`https://login.exokit.org/?email=${encodeURIComponent(email)}`, {
        method: 'POST',
      });
      if (res.ok) {
        const j = await res.json(); 
        
        // console.log('got j', j);
      } else {
        console.warn('failed to request code');
      }
    } else if (loginStep === 2 && codeEl && codeEl.checkValidity()) {
      const res = await fetch(`https://login.exokit.org/?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
        method: 'POST',
      });
      if (res.ok) {
        const j = await res.json();
        const {mnemonic} = j;
        
        // console.log('got result', j);
        
        await loginWithKey(mnemonic, false, null);
      } else {
        console.warn('failed to log in with code');
      }
    } else {
      console.warn('unknown login step');
    }
  };

  return (
    <div className="login-page">
      {useForm ? (
        <form className="login-page-form" onSubmit={async e => {
          e.preventDefault();
          
          submit();
        }} >
          {loginStep === 1 ?
            <Fragment>
              <div className="h1">Log in</div>
              <div className="label">Email</div>
              <Input type="email" value={email} placeholder="your@email.com" required={true} onChange={e => {
                setEmail(e.target.value);
              }} ref={el => {
                emailEl = el;
              }} />
            </Fragment>
          :
            <Fragment>
              <div className="h1">Check your email</div>
              <div className="label">Verification code</div>
              <Input type="password" value={code} placeholder="123456" required={true} onChange={e => {
                setCode(e.target.value);
              }} ref={el => {
                codeEl = el;
              }} />
            </Fragment>
          }
          <input className="button" type="button" value="Submit" onChange={e => {}} disabled={(() => {
            return !(
              (loginStep === 1 && email) ||
              (loginStep === 2 && code)
            );
          })()} onClick={submit} />
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
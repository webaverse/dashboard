import React, { useState, useEffect } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { loginWithPrivateKey, pullUser, getBalance } from "../../functions/UIStateFunctions.js";
import bip39 from '../../libs/bip39.js';
import Loader from '../../components/Loader';

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);

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
    const newState = await pullUser({ ...state });
    setGlobalState({ balance, ...globalState, ...newState });
  }

  useEffect(() => {
    if (globalState.loginToken && globalState.loginToken.mnemonic) {
      loginWithKey(globalState.loginToken.mnemonic);
    }

    if (globalState.address) {
      setLoading(false);
    }
  }, [globalState.address]);

  return (
    <Row style={{ justifyContent: "center" }}>
      <Loader loading={loading} />
      {globalState.address && (
        <Redirect to={"/accounts/" + globalState.address} />
      )}
    </Row>
  )
}

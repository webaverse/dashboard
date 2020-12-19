import React, { useState } from 'react'
import Web3 from 'web3';
import { useAppContext } from "../../libs/contextLib";
import { loginWithEmailOrPrivateKey, getAddress, pullUser } from "../../functions/UIStateFunctions.js";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  const loginWithKey = (pKey) => {
    loginWithEmailOrPrivateKey(pKey, globalState)
    .then(res => {
      console.log(res);
      const address = getAddress(res);
      console.log(address);

    })
    .catch(err => {
        // alert err here
        // redirect here
    });
  }
  const loginWithMetaMask = () => {
    if (!ethEnabled()) {
      alert("Please install an Ethereum-compatible browser or extension like MetaMask to use Webaverse!");
    } else {
      const web3 = window.web3;
      const ens = web3.eth.ens;
      window.ethereum.request({ method: 'eth_accounts' })
      .then(account => {
        if (!web3.utils.isAddress(account)) {
          return;
        } else {
          setGlobalState({ ...globalState, address: account[0] });
          pullUser({ ...globalState, address: account[0] })
          .then(res => {
            setGlobalState(res);
          });
        }
      });
      ethereum.on('accountsChanged', function (accounts) {
        if(!web3.utils.isAddress(accounts[0])) {
          return;
        } else {
          setGlobalState({ ...globalState, address: accounts[0] });
          pullUser({ ...globalState, address: account[0] })
          .then(res => {
            setGlobalState(res);
          });
        }
      });
    }
  }

  return (
    <>
      <h1>Settings</h1>
      <a onClick={() => loginWithMetaMask() }>
        <h1>Login With MetaMask</h1>
      </a>
    </>
  )
}

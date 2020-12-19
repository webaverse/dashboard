import React from 'react'
import { useAppContext } from "../../libs/contextLib";
import { loginWithEmailOrPrivateKey, getAddress } from "../../functions/UIStateFunctions.js";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);

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
          window.location.href = '/accounts/' + account;
        }
      });
      ethereum.on('accountsChanged', function (accounts) {
        if(!web3.utils.isAddress(accounts[0])) {
          return;
        } else {
          window.location.href = '/accounts/' + accounts[0];
        }
      });
    }
  }

  return (
    <>
      <h1>Webaverse</h1>
      <p>
        text here
      </p>
    </>
  )
}

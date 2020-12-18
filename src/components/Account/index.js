import React, { useState, useEffect } from 'react'
import BounceLoader from "react-spinners/BounceLoader";
import { Container, Row, Col } from 'react-grid-system';
import Web3 from 'web3';
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator } from "../../functions/UIStateFunctions.js";

export default () => {
  const [loading, setLoading] = useState(true);
  const { state } = useAppContext();

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  useEffect(() => {
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
  }, []);

  return (
    <>
      <BounceLoader
        css={"display: inline-block"}
        size={50}
        color={"#c4005d"}
        loading={loading}
      />
    </>
  )
}

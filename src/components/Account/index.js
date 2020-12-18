import React, { useState, useEffect } from 'react'
import BounceLoader from "react-spinners/BounceLoader";
import { Container, Row, Col } from 'react-grid-system';
import Web3 from 'web3';
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator } from "../../functions/UIStateFunctions.js";

export default () => {
  const ENS_NAME = "webaverse" + ".eth";
  const [loading, setLoading] = useState(true);
  const [ensAddress, setEnsAddress] = useState(null);
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
      web3.eth.ens.getAddress(ENS_NAME).then((address) => {
        setEnsAddress(address); 
        setLoading(false);
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
      <h1>Webaverse</h1>
      <p>
        This is <a href="/">Webaverse</a> cryptoprofile. It resolves from <a href="https://ens.domains">ENS</a>.
      </p>
        {loading ?
              <BounceLoader
                css={"display: inline-block"}
                size={50}
                color={"#a00"}
                loading={loading}
              />
        :
          <Container>
            <Row style={{ justifyContent: "center" }}>
              <Col className="content" sm={12}>
                <h3>{ENS_NAME}</h3>
                { ensAddress ? <p>{ensAddress}</p> : null}
              </Col>
            </Row>
          </Container>
        }
    </>
  )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Web3 from 'web3';
import { Container, Row, Col } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { loginWithEmailOrPrivateKey, getAddress, pullUser } from "../../functions/UIStateFunctions.js";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [key, setKey] = useState(null);

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  const loginWithKey = () => {
    loginWithEmailOrPrivateKey(key, globalState)
    .then(res => {
      pullUser(res)
      .then(res => {
        setGlobalState(res);
      });

    })
    .catch(err => {
      console.log(err);
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
          pullUser({ ...globalState, address: account[0] })
          .then(res => {
            setGlobalState(res);
          });
        }
      });
    }
  }

  const handleChange = (e) => setKey(e.target.value);

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Col sm={7}>
          <h1>Account Information</h1>
          <p>{globalState.name ? `Name: ${globalState.name}` : null}</p> 
          <p>{globalState.address ? `Address: ${globalState.address}` : null}</p> 
          <img className="accountPicture" src={globalState.avatarPreview ? globalState.avatarPreview : null} />
        </Col>
        <Col sm={7}>
          <h1>Private Key</h1>
          <input
            type="text"
            value={key}
            onChange={(e) => handleChange(e)}
          /> 
          <a className="button" onClick={() => loginWithKey() }>
            Login With Key 
          </a>
        </Col>
        <Col sm={7}>
          <h1>MetaMask</h1>
          <a className="button" onClick={() => loginWithMetaMask() }>
            Login With MetaMask
          </a>
        </Col>
      </Row>
    </Container>
  )
}

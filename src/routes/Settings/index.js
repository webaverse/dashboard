import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { loginWithPrivateKey, getAddress, getInventoryForCreator, pullUser } from "../../functions/UIStateFunctions.js";
import preview from "../../assets/images/preview.png";
import { discordOauthUrl } from '../../webaverse/constants.js';
import Profile from '../../components/Profile';
import Cards from '../../components/Inventory';

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

  const setInitialState = (state) => {
    pullUser({ ...state })
    .then(async res => {
      const newState = await getInventoryForCreator(res.address, 0, true, res);
      setGlobalState(newState);
    });
  }

  const loginWithKey = () => {
    loginWithPrivateKey(key, globalState)
    .then(res => {
      setInitialState(res);
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
          console.log(account[0]);
          setInitialState(account[0]);
        }
      });
      ethereum.on('accountsChanged', function (accounts) {
        if(!web3.utils.isAddress(accounts[0])) {
          return;
        } else {
          console.log(accounts[0]);
          setInitialState(accounts[0]);
        }
      });
    }
  }

  const Inventory = () => globalState.address && globalState.creatorInventories && globalState.creatorInventories[globalState.address] && globalState.creatorInventories[globalState.address][0] ? 
     <Cards inventory={globalState.creatorInventories[globalState.address][0]} />
   : null

  const handleChange = e => {
    setKey(e.target.value);
  }

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        { globalState.address ?
          <Col sm={12}>
            <Profile profile={globalState} />
            <Row style={{ justifyContent: "center" }}>
              <Inventory />
            </Row>
          </Col>
        :
          <Col sm={12}>
            <Col sm={7}>
              <h2>MetaMask</h2>
              <br />
              <a className="button" onClick={() => loginWithMetaMask() }>
                Login With MetaMask
              </a>
            </Col>
            <br />
            <Col sm={7}>
              <a className="button" href={discordOauthUrl}>
                Login With Discord
              </a>
              <h2>Private Key</h2>
              <input
                type="text"
                onChange={handleChange}
              /> 
              <a className="button" onClick={() => loginWithKey() }>
                Login With Key 
              </a>
            </Col>
            <Inventory />
          </Col>
        }
      </Row>
    </Container>
  )
}

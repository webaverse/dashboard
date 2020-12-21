import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Web3 from 'web3';
import { Container, Row, Col } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { loginWithEmailOrPrivateKey, getAddress, getInventoryForCreator, pullUser } from "../../functions/UIStateFunctions.js";

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

  const setInitialState = (address) => {
    pullUser({ ...globalState, address })
    .then(async res => {
      const newState = await getInventoryForCreator(res.address, 0, true, res);
      setGlobalState(newState);
    });
  }

  const loginWithKey = () => {
    loginWithEmailOrPrivateKey(key, globalState)
    .then(res => {
      setInitialState(res.address);
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

  console.log(globalState);
  const Inventory = () => globalState.address && globalState.creatorInventories && globalState.creatorInventories[globalState.address] && globalState.creatorInventories[globalState.address][0] ? 
    globalState.creatorInventories[globalState.address][0].map((item, i) =>
      <Col key={i} className="content" sm={2}>
        <Link to={"/browse/" + item.id}>
          <img src={item.image} />
          <h3>{item.name}</h3>
        </Link>
      </Col>
   ) : null

  const handleChange = e => setKey(e.target.value);

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Col sm={7}>
          <h2>Account Information</h2>
          <p>{globalState.name ? `Name: ${globalState.name}` : null}</p> 
          <p>{globalState.address ? `Address: ${globalState.address}` : null}</p> 
          <img className="accountPicture" src={globalState.avatarPreview ? globalState.avatarPreview : null} />
        </Col>
        <Col sm={7}>
          <h2>Private Key</h2>
          <input
            type="text"
            onChange={handleChange}
          /> 
          <a className="button" onClick={() => loginWithKey() }>
            Login With Key 
          </a>
        </Col>
        <Col sm={7}>
          <h2>MetaMask</h2>
          <a className="button" onClick={() => loginWithMetaMask() }>
            Login With MetaMask
          </a>
        </Col>
        <Inventory />
      </Row>
    </Container>
  )
}

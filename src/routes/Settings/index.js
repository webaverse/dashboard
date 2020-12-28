import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { loginWithPrivateKey, pullUser, getBalance, getInventoryForCreator, getProfileForCreator } from "../../functions/UIStateFunctions.js";
import bip39 from '../../libs/bip39.js';
import { getLoadout } from "../../functions/AssetFunctions.js";
import preview from "../../assets/images/preview.png";
import { discordOauthUrl } from '../../webaverse/constants.js';
import Loader from '../../components/Loader';
import Profile from '../../components/Profile';
import Cards from '../../components/Inventory';

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loadout, setLoadout] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (globalState.loginToken && globalState.loginToken.mnemonic && !globalState.address) {
      setKey(globalState.loginToken.mnemonic);
      loginWithKey();
    }
    if (globalState.address) {
      (async () => {
        const balance = await getBalance(globalState.address);
        const loadout = await getLoadout(globalState.address);
        const profile = await getProfileForCreator(globalState.address, globalState);
        const inventory = await getInventoryForCreator(globalState.address, 0, true, globalState);

        setBalance(balance);
        setLoadout(loadout);
        setProfile(profile);
        setInventory(inventory.creatorInventories[globalState.address][0]);
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [globalState.address]);


  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  const setInitialState = async (state) => {
    const balance = await getBalance(state.address);
    const newState = await pullUser({ ...state });
    setGlobalState({ balance, ...globalState, ...newState });
  }

  const loginWithKey = () => {
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
        }
      });
      ethereum.on('accountsChanged', function (accounts) {
        if(!web3.utils.isAddress(accounts[0])) {
          return;
         } else {
          console.log(accounts[0]);
        }
      });
    }
  }

  const handleChange = e => {
    setKey(e.target.value);
  }

  return (
    <Row style={{ justifyContent: "center" }}>
      { loading ?
        <Loader loading={loading} />
      :
        globalState.address ?
            <>
              <Profile balance={balance} loadout={loadout} profile={profile} />
              <Cards globalState={globalState} setGlobalState={setGlobalState} loadout={loadout} inventory={inventory} />
            </>
        :
          <Col sm={12}>
            <Col sm={7} style={{ margin: "0 auto" }}>
              <h2>Discord</h2>
              <br />
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
          </Col>
      }
    </Row>
  )
}

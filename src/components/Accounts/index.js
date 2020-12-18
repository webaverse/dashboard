import React, { useState, useEffect } from 'react'
import BounceLoader from "react-spinners/BounceLoader";
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import Web3 from 'web3';
import axios from "axios";
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator } from "../../functions/UIStateFunctions.js";

export default () => {
  const { id } = useParams();
  const { state } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [ensAddress, setEnsAddress] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [ensContentHash, setContentHash] = useState(null);
  const [inventory, setInventory] = useState(null);

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }
 
  useEffect(() => {
    getInventoryForCreator(id, 0, true, state).then(res => {
      console.log(res);
      console.log(id);
      console.log(res.creatorInventories);
      console.log(res.creatorInventories[id]);
      console.log(res.creatorInventories[id][0]);
      if (res.creatorInventories[id][0].length > 0) {
        setInventory(res.creatorInventories[id][0]);
        console.log(JSON.stringify(res.creatorInventories[id]));
      }
    });

    if (!ethEnabled()) {
      alert("Please install an Ethereum-compatible browser or extension like MetaMask to use Webaverse!");
    } else {
      const web3 = window.web3;
      if (web3.utils.isAddress(id)) { 
        setEnsAddress(id);
        setEnsName("Ethereum Address");
        setLoading(false);
      } else {
        const tempEnsName = id + ".eth";
        setEnsName(tempEnsName);
        web3.eth.ens.getAddress(tempEnsName).then((address) => {
          if (address) {
            setEnsAddress(address); 
            setLoading(false);
          }
        });
      }
    }
  }, []);

  return (
    <>
        {loading ?
              <BounceLoader
                css={"display: inline-block"}
                size={50}
                color={"#a00"}
                loading={loading}
              />
        :
          inventory ? inventory.map(item =>
            <Container>
              <Row style={{ justifyContent: "center" }}>
                <Col className="content" sm={12}>
                  <h3>{item.id} - {item.name}</h3>
                  {item.description}
                  <img src={item.image} />
                </Col>
              </Row>
            </Container>
          ) : null
        }
    </>
  )
}

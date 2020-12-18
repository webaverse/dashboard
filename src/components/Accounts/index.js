import React, { useState, useEffect } from 'react'
import BounceLoader from "react-spinners/BounceLoader";
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import Web3 from 'web3';
import axios from "axios";
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator } from "../../functions/UIStateFunctions.js";

export default () => {
  const { id } = useParams();
  const { state, setState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [ensAddress, setEnsAddress] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [ensContentHash, setContentHash] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [profile, setProfile] = useState(null);

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
      setInventory(res.creatorInventories[id][0]);
//      setState(res);
      console.log(res);
    });

    getProfileForCreator(id, state).then(res => {
      setProfile(res.creatorProfiles[id]);
//      setState(res);
      console.log(res);
    });

    if (!ethEnabled()) {
      alert("Please install an Ethereum-compatible browser or extension like MetaMask to use Webaverse!");
      setLoading(false);
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

  const Inventory = () => inventory ? inventory.map(item =>
     <Col className="content" sm={4}>
       <h3>#{item.id} - {item.name}</h3>
       <img src={item.image} />
     </Col>
   ) : null

  const Profile = () => profile ? 
     <>
       <Col sm={12}>
         <h1>{profile.name}</h1>
         <p>{profile.address}</p>
         <img src={profile.avatarPreview} />
       </Col>
     </>
  : null


  return (
    <>
      <Container>
       <Row style={{ justifyContent: "center" }}>
        {loading ?
              <BounceLoader
                css={"display: inline-block"}
                size={50}
                color={"#a00"}
                loading={loading}
              />
        :
          <>
            <Profile />
            <Inventory />
          </>
        }
        </Row>
      </Container>
    </>
  )
}

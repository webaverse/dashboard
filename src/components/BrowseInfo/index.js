import React, { useState, useEffect } from 'react'
import MoonLoader from "react-spinners/MoonLoader";
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import Web3 from 'web3';
import axios from "axios";
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator } from "../../functions/UIStateFunctions.js";

export default () => {
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getInventoryForCreator(id, 0, true, globalState).then(res => {
      setItem(res.creatorInventories[id][0]);
      console.log(res.creatorInventories[id][0]);
      console.log("id", id);
      setLoading(false);
    });

/*
    getProfileForCreator(id, globalState).then(res => {
      setProfile(res.creatorProfiles[id]);
      setLoading(false);
    });
*/
  }, []);

/*
  const Item = () => item ? 
     <Col className="content" sm={2}>
       <img src={item.image} />
       <h3>{item.name}</h3>
     </Col>
   : null
*/

  const Item = () => item ? 
    <Col sm={10}>
      <div className="profileHeader">
        <div className="profileName">
          <h1>{item.name}</h1>
          <p>Current Owner: {item.owner.address}</p>
          <p>Total Supply: {item.totalSupply}</p>
        </div>
        <img src={item.image} />
      </div>
    </Col>
  : null


  return (
    <>
      <Container>
       <Row style={{ justifyContent: "center" }}>
        {loading ?
              <MoonLoader
                css={"display: inline-block"}
                size={50}
                color={"#c4005d"}
                loading={loading}
              />
        :
          <>
            <Item />
          </>
        }
        </Row>
      </Container>
    </>
  )
}

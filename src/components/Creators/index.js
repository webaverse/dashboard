import React, { useState, useEffect } from 'react'
import BounceLoader from "react-spinners/BounceLoader";
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import Web3 from 'web3';
import axios from "axios";
import { useAppContext } from "../../libs/contextLib";
import { getCreators } from "../../functions/UIStateFunctions.js";

export default () => {
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState(null);

  useEffect(() => {
    getCreators(0, globalState).then(res => {
      setCreators(res.creators[0]);
      console.log(res.creators[0]);
      setLoading(false);
    });
  }, []);

  const Creators = () => creators ? creators.map(item =>
     item.avatarPreview && item.name ?
       <Col className="content" sm={3}>
         <a href={"/accounts/" + item.address}>
           <img src={item.avatarPreview} />
           <h3>{item.name}</h3>
         </a>
       </Col>
     : null
   ) : null

  return (
    <>
      <Container>
       <Row style={{ justifyContent: "center" }}>
        {loading ?
              <BounceLoader
                css={"display: inline-block"}
                size={50}
                color={"#c4005d"}
                loading={loading}
              />
        :
          <>
            <Creators />
          </>
        }
        </Row>
      </Container>
    </>
  )
}

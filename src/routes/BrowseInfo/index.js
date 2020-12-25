import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import { useAppContext } from "../../libs/contextLib";
import { getInventoryForCreator, getProfileForCreator } from "../../functions/UIStateFunctions.js";
import { buyAsset, sellAsset, depositAsset } from "../../functions/AssetFunctions.js";
import Loader from "../../components/Loader";

export default () => {
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getInventoryForCreator(id, 0, true, globalState).then(res => {
      setItem(res.creatorInventories[id][0]);
      setLoading(false);
    });
  }, []);

  const handleSuccess = (res) => {
    console.log("HANDLING SUCCESS", res);
  }

  const handleError = (err) => {
    console.log("HANDLING ERROR", err);
  }

  const handleBuy = (e) => {
    e.preventDefault();
    console.log(globalState);
    buyAsset(5, 'sidechain', globalState.loginToken, handleSuccess, handleError);
  }

  const handleSell = (e) => {
    e.preventDefault();
    console.log(globalState);
    sellAsset(id, 69, 'sidechain', globalState.loginToken, handleSuccess, handleError);
  }

  const handleTransfer = (e) => {
    e.preventDefault();
    console.log(globalState);
    depositAsset(id, 'webaverse', globalState.address, globalState);
  }

  const Buttons = () => {
    console.log(globalState)
    if (globalState.address && globalState.creatorInventories[id][0].owner.address.toLowerCase() == globalState.address) {
      return (
        <>
          <a className="button" onClick={e => handleSell(e)}>
            Sell
          </a>
          <a className="button" onClick={e => handleTransfer(e)}>
            Transfer
          </a>
        </>
      );
    } else if (globalState.address) {
      return (
        <>
          <a className="button" onClick={e => handleBuy(e)}>
            Buy 
          </a>
        </>
      );
    } else {
      return null;
    }
  }

  const Item = () => item ? 
    <>
      <Col sm={12} md={6}>
        <div className="profileHeader">
          <div className="profileName">
            <h1>{item.name}</h1>
            <p>Total Supply: {item.totalSupply}</p>
            <Buttons />
          </div>
        </div>
      </Col>
      <Col sm={12} md={6}>
        <img className="itemImage" src={item.image} />
      </Col>
    </>
  : null

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Loader loading={loading} />
        <Item />
      </Row>
    </Container>
  )
}

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import { setName } from "../functions/AssetFunctions";
import { useAppContext } from "../libs/contextLib";

export default ({ loadout, balance, profile }) => {
  if (!profile) { return null; }

  const { globalState, setGlobalState } = useAppContext();

  const logout = () => {
    setGlobalState({ ...globalState, logout: "true" });
  }

  const handleSuccess = () => {
    console.log("success");
    setGlobalState({ ...globalState, refresh: "true" });
  }
  const handleError = (err) => console.log("error");

  return (
    <Col sm={12} className="profileHeaderContainer">
      <div className="profileHeaderBackground" style={{
        backgroundImage: `url(${profile.homeSpacePreview ? profile.homeSpacePreview : "../defaulthomespace.svg"})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      }} />
      <div className="profileHeader">
        <div className="profileName">
          <>
            <h1 className="profileText mainName">{profile.name ? profile.name : "Anonymous"}</h1>
            <p className="profileText address">Sidechain: {profile.address ? profile.address : ""}</p>
            {globalState && globalState.mainnetAddress ?
              <p className="profileText address">Mainnet: {globalState.mainnetAddress ? globalState.mainnetAddress : ""}</p>
            : null}
            {balance && balance > 0 ?
              <p className="profileText">FLUX Balance: {balance ? balance : "0"}</p>
            : null}
          </>
        </div>
        <div className="profilePictureContainer">
          <div className="profilePicture" style={{
            backgroundImage: `url("${profile.avatarPreview ? profile.avatarPreview.replace(/\.[^.]*$/, '.png') : "./preview.png"}")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
          }} />
          <div className="profileLoadout">
            {loadout ?
                loadout.map((item, i) =>
                  item && item[3] ?
                    <div key={i} className="profileLoadoutPicture" style={{
                      display: "inline-block",
                      backgroundImage: `url(${item[3]})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center center",
                    }} />
                  : null
                )
            : null}
          </div>
        </div>
      </div>
    </Col>
  )
}

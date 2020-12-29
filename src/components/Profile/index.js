import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import { setName } from "../../functions/AssetFunctions";
import preview from "../../assets/images/preview.png";
import { useAppContext } from "../../libs/contextLib";

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
        backgroundImage: `url(${profile.homeSpacePreview})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      }} />
      <div className="profileHeader">
        <div className="profileName">
          <div>
            <h1 className="profileText">{profile.name ? profile.name : "Anonymous"}</h1>
            <p className="profileText">{profile.address ? profile.address : ""}</p>
            {balance && balance > 0 ?
              <p className="profileText">FLUX Balance: {balance ? balance : "0"}</p>
            : null}
          </div>
          {globalState.address == profile.address.toLowerCase() && ([
            (<a className="button" onClick={() => {
              const name = prompt("What is your name?", "Satoshi");
              setName(name, globalState, handleSuccess, handleError)
            }}>
              Change Name
            </a>),
            (<a className="button" onClick={() => logout()}>
              Logout
            </a>)
          ])}
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
        <Col className="profilePicture" sm={12} md={3} style={{
          backgroundImage: `url("${profile.avatarPreview ? profile.avatarPreview : preview}")`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }} />
      </div>
    </Col>
  )
}

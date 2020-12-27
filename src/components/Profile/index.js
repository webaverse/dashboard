import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import preview from "../../assets/images/preview.png";
import { useAppContext } from "../../libs/contextLib";

export default ({ loadout, balance, profile }) => {
  if (!profile) { return null; }

  const { globalState, setGlobalState } = useAppContext();

  const logout = () => {
    setGlobalState({ ...globalState, logout: "true" });
  }

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
          <h1 className="profileText">{profile.name ? profile.name : "Anonymous"}</h1>
          {balance && balance > 0 ?
            <h1 className="profileText">FLUX Balance: {balance ? balance : "0"}</h1>
          : null}
          {globalState.address == profile.address.toLowerCase() ?
            <a className="button" onClick={() => logout()}>
              Logout
            </a>
          : null}
          <div className="profileLoadout">
            {loadout ?
                loadout.map((item, i) =>
                  item && item[2] ?
                    <img key={i} className="profileLoadoutPicture" src={item[2]} />
                  : null
                )
            : null}
          </div>
        </div>
        <img className="profilePicture" src={profile.avatarPreview ? profile.avatarPreview : preview} />
      </div>
    </Col>
  )
}

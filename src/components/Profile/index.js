import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import preview from "../../assets/images/preview.png";

export default ({ profile }) => {
  if (!profile) { return null; }

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
          <h1 className="profileText">GREASE Balance: {profile.balance ? profile.balance : "0"}</h1>
          <div className="profileLoadout">
            {profile.loadout ?
                JSON.parse(profile.loadout).map((item, i) =>
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

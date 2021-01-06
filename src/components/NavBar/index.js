import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import logo from '../../assets/images/webaverse.png';
import preview from '../../assets/images/preview.png';
import { useAppContext } from "../../libs/contextLib";
import '../../assets/css/navbar.css';

export default () => {
  const { globalState, setGlobalState } = useAppContext();

  return (
    <div className="navbar">
      <div className="container">
        <div className="navbar-menu">
  
            <div className="left-menu-container">
              <Link to="/">
                <img className="logo" src={logo} />
              </Link>
            </div>
  
            <div className="secondary-menu">
              <Link className="item" to="/assets">Assets</Link>
              <Link className="item" to="/land">Land</Link>
              <Link className="item" to="/profiles">Profiles</Link>
              <Link className="item" to="/mint">Mint</Link>
              <a className="item" href="https://docs.webaverse.com">Docs</a>
            </div>
  
            <div className="right-menu-container">
              <a className="item" href="https://discord.gg/R5wqYhvv53">Join Our Discord</a>
            </div>
            <div>
              <Link to="/settings">
                <img className={`accountPicture ${globalState.address ? "loggedIn" : ""}`} src={globalState.avatarPreview ? globalState.avatarPreview.replace(/\.[^.]*$/, '.png') : preview} />
              </Link>
            </div>
  
        </div>
      </div>
    </div>
  )
}

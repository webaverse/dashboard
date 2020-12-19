import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import logo from '../../assets/images/webaverse.png';
import preview from '../../assets/images/preview.png';
import { useAppContext } from "../../libs/contextLib";

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
              <Link className="item" to="/browse">Browse</Link>
              <Link className="item" to="/creators">Creators</Link>
              <Link className="item" to="/mint">Mint</Link>
              <Link className="item" to="https://docs.webaverse.com">Docs</Link>
              <Link className="item" to="https://blog.webaverse.com">Blog</Link>
            </div>
  
            <div className="right-menu-container">
              <Link to="/settings">
                <img className="accountPicture" src={globalState.avatarPreview ? globalState.avatarPreview : preview} />
              </Link>
            </div>
  
        </div>
      </div>
    </div>
  )
}

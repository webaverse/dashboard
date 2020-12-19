import React, { useState, useEffect } from 'react';
import logo from '../../assets/images/webaverse.png';
import preview from '../../assets/images/preview.png';
import { useAppContext } from "../../libs/contextLib";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [accountPicture, setAccountPicture] = useState(null);

  useEffect(() => {
    setAccountPicture(globalState.avatarPreview); 
  }, [globalState]);

  return (
    <div className="navbar">
      <div className="container">
        <div className="navbar-menu">
  
            <div className="left-menu-container">
              <a href="/">
                <img className="logo" src={logo} />
              </a>
            </div>
  
            <div className="secondary-menu">
              <a className="item" href="/browse">Browse</a>
              <a className="item" href="/creators">Creators</a>
              <a className="item" href="/creators">Mint</a>
              <a className="item" href="https://docs.webaverse.com">Docs</a>
              <a className="item" href="https://blog.webaverse.com">Blog</a>
            </div>
  
            <div className="right-menu-container">
              <a href="/settings">
                <img className="accountPicture" src={accountPicture ? accountPicture : preview} />
              </a>
            </div>
  
        </div>
      </div>
    </div>
  )
}

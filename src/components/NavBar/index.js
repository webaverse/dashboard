import React from 'react';
import logo from '../../assets/images/webaverse.png';

export default () => 
  <div className="navbar">
    <div className="container">
      <div className="navbar-menu">
        <div className="secondary-menu">
          <a href="/">
            <img className="logo" src={logo} />
          </a>
          <a className="item" href="/creators">Creators</a>
          <a className="item" href="https://docs.webaverse.com">Docs</a>
          <a className="item" href="https://blog.webaverse.com">Blog</a>
          <a className="item" href="/account">My Account</a>
        </div>
      </div>
    </div>
  </div>

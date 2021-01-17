import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import { useAppContext } from "../libs/contextLib";

const Navbar = () => {
  const { globalState, setGlobalState } = useAppContext();

  return (
    <div className="navbar">
      <div className="navbarContainer">
        <div className="navbarMenu">
          <div className="leftMenuContainer">
            <Link href="/">
              <img className="logo" src="/webaverse.png" alt="Webaverse logo" />
            </Link>
          </div>
          <div className="secondaryMenu">
            <Link href="/">
              Webaverse
            </Link>
          </div>
          <div className="rightMenuContainer">
            <Link href="/assets"><a className="item">Browse</a></Link>
            <Link href="/land"><a className="item">Land</a></Link>
            <Link href="/map"><a className="item">Map</a></Link>
            <Link href="/accounts"><a className="item">Accounts</a></Link>
            <Link href="/mint"><a className="item">Mint</a></Link>
            <a className="item" href="https://docs.webaverse.com">Docs</a>
            <a className="item" href="https://webaverse.github.io/whitepaper/whitepaper.pdf">Whitepaper</a>
            <a className="item" target="_blank" href="https://discord.gg/3byWubumSa">Discord</a>
            <a className="item" href="https:/app.webaverse.com">Play</a>
          </div>
          <div>
            { globalState.address ?
              <a href={"/accounts/" + globalState.address}>
                <img className={`accountPicture loggedIn`} src={globalState.avatarPreview ? globalState.avatarPreview.replace(/\.[^.]*$/, '.png') : "/preview.png"} />
              </a>
            :
              <Link href="/login">
                <img className="accountPicture" src="/preview.png" alt="Placeholder profile picture" />
              </Link>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar;

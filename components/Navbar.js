import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import MenuIcon from '@material-ui/icons/Menu';
import { useAppContext } from "../libs/contextLib";

const Navbar = () => {
  const { globalState, setGlobalState } = useAppContext();
  const [dropdown, setDropdown] = useState(false);

  return (
    <div className="navbar">
      <div className="navbarContainer">
        <div className="navbarMenu">
          <div onClick={() => setDropdown(false)} className="leftMenuContainer">
            <Link href="/">
              <img className="logo" src="/webaverse.png" alt="Webaverse logo" />
            </Link>
          </div>
          <div className="secondaryMenu">
            <Link href="/">
              Webaverse
            </Link>
          </div>
          <div onClick={() => setDropdown(false)} className={`rightMenuContainer ${dropdown ? "responsive" : "hidden"}`}>
            <Link href="/assets"><a className="item">Browse</a></Link>
            <Link href="/land"><a className="item">Land</a></Link>
            <Link href="/map"><a className="item">Map</a></Link>
            <Link href="/accounts"><a className="item">Accounts</a></Link>
            <Link href="/mint"><a className="item">Mint</a></Link>
            <a className="item" href="https://docs.webaverse.com">Docs</a>
            <a className="item" href="https://webaverse.github.io/whitepaper/whitepaper.pdf">Whitepaper</a>
            <a className="item" target="_blank" href="https://discord.gg/3byWubumSa">Discord</a>
            <a className="item" href="https://app.webaverse.com">Play</a>
          </div>
          <div onClick={() => setDropdown(false)} className={`rightMenuContainer ${dropdown ? "hidden" : ""}`}>
            <div className="navbarTopLevelMenuOption">
              <a className="navbarLinkLearn item" href="https://docs.webaverse.com">Learn</a>
              <div className="navbarSubMenuContainer">
                <div className="navbarSubMenu">
                  <div className="navbarSubMenuLeftbar">
                    <Link href="/assets"><a className="item">Browse</a></Link>
                    <Link href="/land"><a className="item">Land</a></Link>
                    <Link href="/map"><a className="item">Map</a></Link>
                    <Link href="/accounts"><a className="item">Accounts</a></Link>
                    <Link href="/mint"><a className="item">Mint</a></Link>
                    <a className="item" href="https://docs.webaverse.com">Docs</a>
                    <a className="item" href="https://webaverse.github.io/whitepaper/whitepaper.pdf">Whitepaper</a>
                    <a className="item" target="_blank" href="https://discord.gg/3byWubumSa">Discord</a>
                    <a className="item" href="https://app.webaverse.com">Play</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div onClick={() => setDropdown(false)} className={`rightMenuContainer ${dropdown ? "hidden" : ""}`}>
            <a className="navbarFluxSymbol">
              山
            </a>
            <a className="navbarFluxAmount">
              {globalState && globalState.balance ? Number(globalState.balance).toLocaleString() : "0"}
            </a>
            <div className={`navbarFluxPlusContainer noselect ${dropdown ? "responsive" : ""}`}>
              <a className="navbarFluxPlus">
                +
              </a>
            </div>
          </div>
          <div onClick={() => setDropdown(false)} className={`accountPictureContainer ${dropdown ? "responsive" : ""}`}>
            { globalState.address ?
              <a href={"/accounts/" + globalState.address}>
                <img className={`accountPicture loggedIn ${dropdown ? "responsive" : ""}`} src={globalState.avatarPreview ? globalState.avatarPreview.replace(/\.[^.]*$/, '.png') : "/preview.png"} />
              </a>
            :
              <Link href="/login">
                <a>
                  <img className="accountPicture" src="/preview.png" alt="Placeholder profile picture" />
                </a>
              </Link>
            }
          </div>
          <a className="navbarIcon" onClick={() => setDropdown(!dropdown)}>
            <MenuIcon />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Navbar;

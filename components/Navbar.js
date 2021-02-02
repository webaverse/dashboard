import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import MenuIcon from '@material-ui/icons/Menu';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
{/*
          <div onClick={() => setDropdown(false)} className={`rightMenuContainer ${dropdown ? "responsive" : ""}`}>
            <a className={`item`} href="https://app.webaverse.com">Play</a>
            <Link href="/assets"><a className={`item`}>Browse</a></Link>
            <Link href="/land"><a className={`item`}>Land</a></Link>
            <Link href="/map"><a className={`item`}>Map</a></Link>
            <Link href="/accounts"><a className={`item`}>Members</a></Link>
            <Link href="/mint"><a className={`item`}>Mint</a></Link>
            <Link href="/activity"><a className={`item`}>Activity</a></Link>
            <a className={`item`} href="https://docs.webaverse.com">Docs</a>
            <a className={`item`} href="https://webaverse.github.io/whitepaper/whitepaper.pdf">Whitepaper</a>
            <a className={`item`} target="_blank" href="https://discord.gg/3byWubumSa">Discord</a>
          </div>
*/}
          <div onClick={() => setDropdown(false)} className={`rightMenuContainer ${dropdown ? "responsive" : ""}`}>
            <div className="navbarTopLevelMenuOption">
              <a className="navbarLinkItem item" href="https://app.webaverse.com">Play</a>
            </div>
            <div className="navbarTopLevelMenuOption">
              <Link href="/assets"><a className={`navbarLinkItem item`}>Items</a></Link>
            </div>
            <div className="navbarTopLevelMenuOption">
              <div onClick={e => e.preventDefault} className={`navbarLinkItem item ${dropdown ? "responsive" : ""}`}>World<ExpandMoreIcon /></div>
              <div className={`navbarSubMenuContainer ${dropdown ? "responsive" : ""}`}>
                <div className="navbarSubMenu">
                  <div className="navbarSubMenuLeftbar">
                    <Link href="/land"><a className={`navbarSubMenuLinkItem item`}>Land</a></Link>
                    <Link href="/map"><a className={`navbarSubMenuLinkItem item`}>Map</a></Link>
                    <Link href="/accounts"><a className={`navbarSubMenuLinkItem item`}>Accounts</a></Link>
                    <Link href="/tv/1"><a className={`navbarSubMenuLinkItem item`}>TV</a></Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="navbarTopLevelMenuOption">
              <div onClick={e => e.preventDefault} className={`navbarLinkItem item ${dropdown ? "responsive" : ""}`}>Market<ExpandMoreIcon /></div>
              <div className={`navbarSubMenuContainer ${dropdown ? "responsive" : ""}`}>
                <div className="navbarSubMenu">
                  <div className="navbarSubMenuLeftbar">
                    <Link href="/activity"><a className={`navbarSubMenuLinkItem item`}>Activity</a></Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="navbarTopLevelMenuOption">
              <div onClick={e => e.preventDefault} className={`navbarLinkItem item ${dropdown ? "responsive" : ""}`}>Create<ExpandMoreIcon /></div>
              <div className={`navbarSubMenuContainer ${dropdown ? "responsive" : ""}`}>
                <div className="navbarSubMenu">
                  <div className="navbarSubMenuLeftbar">
                    <Link href="/mint"><a className={`navbarSubMenuLinkItem item`}>Item</a></Link>
                    <Link href="/pets"><a className={`navbarSubMenuLinkItem item`}>Pet</a></Link>
                    <Link href="/fly"><a className={`navbarSubMenuLinkItem item`}>Flying Pet</a></Link>
                    <Link href="/mounts"><a className={`navbarSubMenuLinkItem item`}>Mount</a></Link>
                    <a className={`navbarSubMenuLinkItem item`} target="_blank" href="https://editaverse.com">World Editor</a>
                    <a className={`navbarSubMenuLinkItem item`} target="_blank" href="https://voxel.editaverse.com">Voxel Editor</a>
                    <a className={`navbarSubMenuLinkItem item`} target="_blank" href="https://discord.com/oauth2/authorize?client_id=758956702669209611&permissions=0&scope=bot">Discord Bot</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="navbarTopLevelMenuOption">
              <div onClick={e => e.preventDefault} className={`navbarLinkItem item ${dropdown ? "responsive" : ""}`}>Learn<ExpandMoreIcon /></div>
              <div className={`navbarSubMenuContainer ${dropdown ? "responsive" : ""}`}>
                <div className="navbarSubMenu">
                  <div className="navbarSubMenuLeftbar">
                    <a className={`navbarSubMenuLinkItem item`} target="_blank" href="https://docs.webaverse.com">Docs</a>
                    <a className={`navbarSubMenuLinkItem item`} target="_blank" href="https://webaverse.github.io/whitepaper/whitepaper.pdf">Whitepaper</a>
                    <a className={`navbarSubMenuLinkItem item`} target="_blank" href="https://discord.gg/3byWubumSa">Discord</a>
                    <a className={`navbarSubMenuLinkItem item`} target="_blank" href="https://twitter.com/webaverse">Twitter</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div onClick={() => setDropdown(false)} className={`navbarFluxContainer desktop`}>
            <a className="navbarFluxSymbol">
              山
            </a>
            <a className="navbarFluxAmount">
              {globalState && globalState.balance ? Number(globalState.balance).toLocaleString() : "0"}
            </a>
            <div className={`navbarFluxPlusContainer noselect`}>
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

import React, { Fragment, useState, useEffect } from 'react';
import Link from 'next/link'
import {useRouter} from 'next/router';
import MenuIcon from '@material-ui/icons/Menu';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {useAppContext} from "../libs/contextLib";
import {getBlockchain, loginWithMetaMask, logout} from "../webaverse/blockchain.js";
import {proofOfAddressMessage} from '../constants/UnlockConstants.js';
import {parseQuery, cancelEvent} from "../webaverse/util";
import {discordOauthUrl} from '../webaverse/constants.js';

const StreetFilters = ({
  q,
  setQ,
  selectedOption,
  setSelectedOption,
}) => {
  const router = useRouter();
  
  return (
    <div className="street-filters">
      <label className="row">
        <img className="search-image" src="/search.svg" />
        <input
          type="text"
          value={q}
          onChange={e => {
            setQ(e.target.value);
          }}
          onKeyDown={e => {
            if (e.which === 13) {
              router.push(`/?q=${q}`);
            }
          }}
        />
      </label>
      <div className="row">
        <div className="filter-options">
          <div className={`option ${selectedOption === 'image' ? 'selected' : ''}`} onClick={e => setSelectedOption('image')}>
            <img className="option-image" src="/image.svg" />
          </div>
          <div className={`option ${selectedOption === 'video' ? 'selected' : ''}`} onClick={e => setSelectedOption('video')}>
            <img className="option-image" src="/video.svg" />
          </div>
          <div className={`option ${selectedOption === 'audio' ? 'selected' : ''}`} onClick={e => setSelectedOption('audio')}>
            <img className="option-image" src="/audio.svg" />
          </div>
          <div className={`option ${selectedOption === 'avatar' ? 'selected' : ''}`} onClick={e => setSelectedOption('avatar')}>
            <img className="option-image" src="/avatar.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({
  selectedView,
  setSelectedView,
  setSearchResults,
}) => {
  const { globalState, setGlobalState } = useAppContext();
  const [dropdown, setDropdown] = useState(false);
  const [q, setQ] = useState('');
  const [lastQ, setLastQ] = useState('');
  const [selectedOption, setSelectedOption] = useState(0);
  const [userContainerOpen, setUserContainerOpen] = useState(false);
  
  const router = useRouter();
  
  const qs = parseQuery(router.asPath.match(/(\?.*)$/)?.[1] || '');
  const {q: currentQ} = qs;
  
  if (currentQ !== undefined && currentQ !== lastQ) {
    setLastQ(currentQ);

    if (currentQ) {
      setQ(currentQ);
      (async () => {      
        const res = await fetch(`https://tokens.webaverse.com/search?q=${currentQ}`);
        const tokens = await res.json();
        setSearchResults(tokens);
      })().catch(err => {
        console.warn(err);
      });
    } else {
      setQ('');
      setSearchResults(null);
    }
  }

  // console.log('got path', router.asPath);

  return (
    <div className="navbar">
      <div className="navbarContainer">
        <div className="navbarMenu">
          <div onClick={() => setDropdown(false)} className="leftMenuContainer">
            <Link href="/">
              <a>
                <img className="logo" src="/webaverse.png" alt="Webaverse logo" />
                <div className="beta-label">beta</div>
              </a>
            </Link>
          </div>
          {/* <div className="secondaryMenu">
            <Link href="/">
              Webaverse
            </Link>
          </div> */}
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
            <section className="navbarSection">
              <div className="navbar-buttons">
                <Link href="/"><a className={`item ${/(?:\/|\/assets(?:\/.+|$))$/.test(router.asPath) ? 'selected' : ''}`}>Objects</a></Link>
                <Link href="/accounts"><a className={`item ${/(?:\/accounts(?:\/.+|$))$/.test(router.asPath) ? 'selected' : ''}`}>Accounts</a></Link>
                <Link href="/map"><a className={`item ${router.asPath === '/map' ? 'selected' : ''}`}>Map</a></Link>
                <Link href="https://app.webaverse.com/"><a className={`item ${router.asPath === '/play' ? 'selected' : ''}`}>Play</a></Link>
                <Link href="https://docs.webaverse.com/"><a className={`item ${router.asPath === '/docs' ? 'selected' : ''}`}>Docs</a></Link>
              </div>
              <div className="navbarSwitchWrap">
                <div className="navbarSwitch">
                  <div className={`option ${selectedView === 'cards' ? 'selected' : ''}`} onClick={e => {
                    setSelectedView('cards');
                  }}>
                    Cards
                  </div>
                  <div className={`option ${selectedView === '2d' ? 'selected' : ''}`} onClick={e => {
                    setSelectedView('2d');
                  }}>
                    2D
                  </div>
                  <div className={`option ${selectedView === '3d' ? 'selected' : ''}`} onClick={e => {
                    setSelectedView('3d');
                  }}>
                    3D
                  </div>
                  <div className={`option ${selectedView === 'live' ? 'selected' : ''}`} onClick={e => {
                    setSelectedView('live');
                  }}>
                    Live
                  </div>
                </div>
              </div>
            </section>
            <StreetFilters
              q={q}
              setQ={setQ}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
            />
          </div>
          {globalState && globalState.loaded ? (
              <div className={`userInfoContainer ${userContainerOpen ? 'open' : ''}`} onClick={e => {
                e.preventDefault();

                setUserContainerOpen(!userContainerOpen);
              }} onDragStart={cancelEvent}>
                <div className="dropdown">
                  {!globalState.address ? 
                    <Fragment>
                      <Link href="/login">                    
                        <a className="dropdown-item">
                          <div className="label">via email</div>
                        </a>
                      </Link>
                      <a href={discordOauthUrl} className="dropdown-item" onClick={e => {
                        // console.log('oauth', discordOauthUrl);
                        window.location.href = discordOauthUrl;
                      }}>
                        <div className="label">via Discord</div>
                      </a>
                      <a className="dropdown-item" onClick={async e => {
                        const metaMaskAddress = await loginWithMetaMask();
                        const {web3} = await getBlockchain();
                        // console.log('sign', web3); // XXX
                        const nonce = crypto.getRandomValues(new Uint32Array(1))[0];
                        const signature = await web3.mainnet.eth.personal.sign(proofOfAddressMessage + ' Nonce: ' + nonce, metaMaskAddress);
                        
                        const res = await fetch(`https://login.exokit.org?signature=${signature}&nonce=${nonce}`, {
                          method: 'POST',
                        });
                        const text = await res.text();
                        console.log('got result', text);
                      }}>
                        <div className="label">via MetaMask</div>
                      </a>
                    </Fragment>
                  :
                    <Fragment>
                      <Link className="dropdown-item" href={"/accounts/" + globalState.address}>
                        <a className="label">Profile</a>
                      </Link>
                      <div className="dropdown-item">
                        <a className="label" onClick={logout}>Log out</a>
                      </div>
                    </Fragment>
                  }
                </div>
                {globalState.address ?
                  <div className="user-info-wrap">
                    <div className="username">{globalState.name}</div>
                    <div onClick={() => setDropdown(false)} className={`navbarSILKContainer desktop`}>
                      <div className="navbarSILKSymbol">
                        <img src="/curve.svg" onDragStart={cancelEvent} />
                      </div>
                      <div className="navbarSILKAmount">
                        {globalState && globalState.balance ? Number(globalState.balance).toLocaleString() : "0"}
                      </div>
                      {/* <div className={`navbarSILKPlusContainer noselect`}>
                        <div className="navbarSILKPlus">
                          +
                        </div>
                      </div> */}
                    </div>
                  </div>
                :
                  <div className="user-info-placeholder">
                    Log in...
                  </div>
                }
                <div onClick={() => setDropdown(false)} className={`accountPictureContainer ${dropdown ? "responsive" : ""}`}>
                  {globalState.address ?
                    <img className={`accountPicture loggedIn ${dropdown ? "responsive" : ""}`} src={globalState.avatarPreview ? globalState.avatarPreview.replace(/\.[^.]*$/, '.png') : "/preview.png"} onDragStart={cancelEvent} />
                  :
                    <img className="accountPicture account-picture-placeholder" src="/preview.png" alt="Placeholder profile picture" />
                  }
                </div>
              </div>
          ) : null}
          <a className="navbarIcon" onClick={() => setDropdown(!dropdown)}>
            <MenuIcon />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Navbar;

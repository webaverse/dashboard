import React, { Fragment, useState, useEffect } from 'react';
import Link from 'next/link'
import {useRouter} from 'next/router';
import MenuIcon from '@material-ui/icons/Menu';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ViewSwitch from "./ViewSwitch";
import {useAppContext} from "../libs/contextLib";
import {getBlockchain, loginWithMetaMask, logout} from "../webaverse/blockchain.js";
import storage from "../webaverse/storage.js";
import {proofOfAddressMessage} from '../constants/UnlockConstants.js';
import {parseQuery, downloadFile, cancelEvent} from "../webaverse/util";
import {discordOauthUrl} from '../webaverse/constants.js';
import bip39 from '../libs/bip39.js';
import hdkeySpec from '../libs/hdkey.js';
const hdkey = hdkeySpec.default;

const ManageKeysMenu = ({
  setManageKeysOpen,
}) => {
  const {globalState, setGlobalState} = useAppContext();
  const [mnemonic, setMnemonic] = useState('');
  
  return (
    <div className="menu manage-keys-menu">
      <div className="background" onClick={e => {
        setManageKeysOpen(false);
      }} />
      <div className="menu-wrap">
        <div className="h1">Manage keys</div>
        <div className="label">Mnemonic</div>
        <input type="button" value="Download mnemonic file" onChange={e => {}} onClick={e => {
          const file = new Blob([
            globalState.loginToken.mnemonic,
          ], {
            type: 'text/plain',
          });
          const filename = 'mnemonic.txt';
          downloadFile(file, filename);
        }} />
        <div className="label">Private key</div>
        <input type="button" value="Download private key" onChange={e => {}} onClick={e => {
          // const { web3, contracts, common } = await getBlockchain();
          const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
          const address = wallet.getAddressString();
          const privateKey = wallet.getPrivateKeyString();
          
          const file = new Blob([
            privateKey,
          ], {
            type: 'text/plain',
          });
          const filename = 'private-key.txt';
          downloadFile(file, filename);
        }} />
        <div className="label">Update key</div>
        <input type="text" value={mnemonic} placeholder="enter mnemonic" onChange={e => {
          setMnemonic(e.target.value);
        }} />
        <input className="button" type="button" value="Update mnemonic" onChange={e => {}} />
      </div>
    </div>
  );
};

const Search = React.memo(({
  q,
  setQ,
  onEnter,
}) => {
  return (
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
            onEnter && onEnter(e, {q});
          }
        }}
      />
    </label>
  );
});

const StreetFilters = ({
  q,
  setQ,
  selectedOption,
  setSelectedOption,
}) => {
  const router = useRouter();
  
  return (
    <div className="street-filters">
      <Search
        q={q}
        setQ={setQ}
        onEnter={(e, {q}) => {
          router.push(`/?q=${q}`);
        }}
      />
      <div className="row">
        <div className="filter-options">
          <div className={`option ${selectedOption === 'image' ? 'selected' : ''}`} onClick={e => setSelectedOption('image')}>
            <img className="option-image" title="Filter images" alt="Filter images" src="/image.svg" />
          </div>
          <div className={`option ${selectedOption === 'video' ? 'selected' : ''}`} onClick={e => setSelectedOption('video')}>
            <img className="option-image" title="Filter videos"  alt="Filter videos" src="/video.svg" />
          </div>
          <div className={`option ${selectedOption === 'audio' ? 'selected' : ''}`} onClick={e => setSelectedOption('audio')}>
            <img className="option-image" title="Filter audio" alt="Filter audio" src="/audio.svg" />
          </div>
          <div className={`option ${selectedOption === 'avatar' ? 'selected' : ''}`} onClick={e => setSelectedOption('avatar')}>
            <img className="option-image" title="Filter avatars" alt="Filter avatars" src="/avatar.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({
  token,
  setToken,
  mintMenuOpen,
  setMintMenuOpen,
  selectedView,
  setSelectedView,
  setSearchResults,
  manageKeysOpen,
  setManageKeysOpen,
}) => {
  const { globalState, setGlobalState } = useAppContext();
  const router = useRouter();
  const [dropdown, setDropdown] = useState(false);
  const [q, setQ] = useState('');
   const [lastQ, setLastQ] = useState('');
  const [selectedOption, setSelectedOption] = useState(0);
  const [userContainerOpen, setUserContainerOpen] = useState(false);
  const [viewSwitchOpen, setViewSwitchOpen] = useState(router.asPath === '/');
  
  const qs = parseQuery(router.asPath.match(/(\?.*)$/)?.[1] || '');
  const {q: currentQ} = qs;
  
  useEffect(() => {
    if (currentQ !== lastQ) {
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
  }, [currentQ, lastQ]);
  
  useEffect(() => {
    const u = new URL(router.asPath, window.location.href);
    if (u.pathname === '/' && !viewSwitchOpen) {
      setViewSwitchOpen(true);
    } else if (u.pathname !== '/' && viewSwitchOpen) {
      setViewSwitchOpen(false);
    }
  }, [viewSwitchOpen, router.asPath]);
  const u = new URL(router.asPath, typeof window !== 'undefined' ? window.location.href : 'http://127.0.0.1/');
  const showMintButton = u.pathname === '/' || u.pathname === '/mint';

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
          {manageKeysOpen ?
            <ManageKeysMenu
              setManageKeysOpen={setManageKeysOpen}
            />
          :
            null
          }

          <div onClick={() => setDropdown(false)} className={`rightMenuContainer ${dropdown ? "responsive" : ""}`}>
            <section className="navbarSection">
              <div className="navbar-buttons">
                <Link href="/"><a className={`item ${/(?:\/|\/mint|\/assets(?:\/.+|$))$/.test(router.asPath) ? 'selected' : ''}`}>Objects</a></Link>
                <Link href="/accounts"><a className={`item ${/(?:\/accounts(?:\/.+|$))$/.test(router.asPath) ? 'selected' : ''}`}>Accounts</a></Link>
                <Link href="/map"><a className={`item ${router.asPath === '/map' ? 'selected' : ''}`}>Map</a></Link>
                <Link href="https://app.webaverse.com/"><a className={`item ${router.asPath === '/play' ? 'selected' : ''}`}>Play</a></Link>
                <Link href="https://docs.webaverse.com/"><a className={`item ${router.asPath === '/docs' ? 'selected' : ''}`}>Docs</a></Link>
                <a className={`item`} target="_blank" href="https://www.notion.so/webaverse/Webaverse-is-Hiring-8fb49c069c2f450f93ebb911149f21bd">Careers</a>
              </div>
              {viewSwitchOpen ?
                <ViewSwitch
                  selectedView={selectedView}
                  setSelectedView={setSelectedView}
                />
              : null}
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
                  <div className="dropdown-background" />
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
                        const nonce = crypto.getRandomValues(new Uint32Array(1))[0];
                        const signature = await web3.mainnet.eth.personal.sign(proofOfAddressMessage + ' Nonce: ' + nonce, metaMaskAddress);
                        
                        const res = await fetch(`https://login.exokit.org?signature=${signature}&nonce=${nonce}`, {
                          method: 'POST',
                        });
                        const j = await res.json();
                        const {mnemonic} = j;
                        // console.log('got result', j);
                        await storage.set('loginToken', {mnemonic});
                        window.location.reload();
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
                        <a className="label" onClick={e => {
                          setManageKeysOpen(!manageKeysOpen);
                        }}>Manage keys</a>
                      </div>
                      <div className="dropdown-item">
                        <a className="label" onClick={logout}>Log out</a>
                      </div>
                    </Fragment>
                  }
                </div>
                <div onClick={() => setDropdown(false)} className={`accountPictureContainer ${dropdown ? "responsive" : ""}`}>
                  {globalState.address ?
                    <img className={`accountPicture ${globalState.avatarPreview ? '' : 'account-picture-placeholder'} ${dropdown ? "responsive" : ""}`} src={globalState.avatarPreview ? globalState.avatarPreview.replace(/\.[^.]*$/, '.png') : "/preview.png"} onDragStart={cancelEvent} />
                  :
                    <img className="accountPicture account-picture-placeholder" src="/preview.png" alt="Placeholder profile picture" />
                  }
                </div>
                {globalState.address ?
                  <div className="user-info-wrap">
                    <div className="username">{globalState.name || 'Anonymous'}</div>
                    <div onClick={() => setDropdown(false)} className={`navbarSILKContainer desktop`}>
                      <div className="navbarSILKSymbol">
                        <img src="/curve.svg" onDragStart={cancelEvent} />
                      </div>
                      <div className="navbarSILKAmount">
                        {globalState && globalState.balance ? Number(globalState.balance).toLocaleString() : "0"}
                      </div>
                    </div>
                    <div className="address">
                      {globalState.address}
                    </div>
                  </div>
                :
                  <div className="user-info-placeholder">
                    Log in...
                  </div>
                }
              </div>
          ) : null}
          <a className="navbarIcon" onClick={() => setDropdown(!dropdown)}>
            <MenuIcon />
          </a>
        </div>
        {showMintButton ?
          <div className={`mint-button ${mintMenuOpen ? 'open' : ''} ${token ? 'below' : ''}`} onClick={e => {
              if (mintMenuOpen) {
                router.push('/');
              } else {
                router.push('/', '/mint');
              }
            }}
          >
            <img src="/mint.svg" onDragStart={cancelEvent}/>
          </div>
        : null}
      </div>
    </div>
  )
}

export default Navbar;

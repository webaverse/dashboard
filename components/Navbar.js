import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import {useRouter} from 'next/router';
import MenuIcon from '@material-ui/icons/Menu';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {useAppContext} from "../libs/contextLib";
import {parseQuery} from "../webaverse/util";

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
              if (q) {
                router.push(`/?q=${q}`);
              } else {
                router.push('/');
              }
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
  
  const router = useRouter();
  
  const qs = parseQuery(router.asPath.match(/(\?.*)$/)?.[1] || '');
  const {q: currentQ = ''} = qs;
  
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

  const _switchToSideChain = async e => {
    e.preventDefault();
    
    await ethereum.enable();
    await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
            chainId: "0x53A",
            chainName: "Webaverse Sidechain",
            rpcUrls: ['https://mainnetsidechain.exokit.org',],
            iconUrls: ['https://app.webaverse.com/assets/logo-flat.png'],
            blockExplorerUrls: ['https://webaverse.com/activity'],
            nativeCurrency: {
              name: 'Silk',
              symbol: 'SILK',
              decimals: 18,
            },
        }],
    });
  };

  // console.log('got path', router.asPath);

  return (
    <div className="navbar">
      <div className="navbarContainer">
        <div className="navbarMenu">
          <div onClick={() => setDropdown(false)} className="leftMenuContainer">
            <Link href="/">
              <img className="logo" src="/webaverse.png" alt="Webaverse logo" />
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
                <Link href="/"><a className={`item ${router.asPath === '/' ? 'selected' : ''}`}>Objects</a></Link>
                <Link href="/accounts"><a className={`item ${router.asPath === '/accounts' ? 'selected' : ''}`}>Accounts</a></Link>
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
          <div onClick={() => setDropdown(false)} className={`navbarSILKContainer desktop`}>
            <a className="navbarSILKSymbol">
              <img src="/curve.svg" />
            </a>
            <a className="navbarSILKAmount">
              {globalState && globalState.balance ? Number(globalState.balance).toLocaleString() : "0"}
            </a>
            <div className={`navbarSILKPlusContainer noselect`}>
              <a className="navbarSILKPlus">
                +
              </a>
            </div>
          </div>
          <div onClick={() => setDropdown(false)} className={`accountPictureContainer ${dropdown ? "responsive" : ""}`}>
            { globalState.address ?
              <Link href={"/accounts/" + globalState.address}>
                <a>
                  <img className={`accountPicture loggedIn ${dropdown ? "responsive" : ""}`} src={globalState.avatarPreview ? globalState.avatarPreview.replace(/\.[^.]*$/, '.png') : "/preview.png"} />
                </a>
              </Link>
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

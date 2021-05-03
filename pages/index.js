import React, { Component, Fragment, useState, useEffect } from "react";
import Head from "next/head";
import {useRouter} from 'next/router';
import axios from 'axios';
import {getTokens} from "../functions/UIStateFunctions.js";
// import Hero from "../components/Hero";
// import CardRow from "../components/CardRow";
// import CardRowHeader from "../components/CardRowHeader";
import Asset from "../components/Asset";
import Minter from "../components/Minter";
// import Loader from "../components/Loader";
import Masonry from "../components/Masonry";
// import ProgressBar from "../components/ProgressBar";
// import {FileDrop} from "react-file-drop";
import {makeWbn, makeBin, makePhysicsBake} from "../webaverse/build";
import {getExt, schedulePerFrame, cancelEvent} from "../webaverse/util";
import {storageHost, cardScrollViews} from "../webaverse/constants";
import JSZip from '../webaverse/jszip.js';

class AssetOverlayBackground extends Component {
  constructor(props) {
    super(props);
    this.keyDown = this.keyDown.bind(this);
    this.onEscape = this.props.onEscape;
  }
  componentDidMount() {
    window.addEventListener('keydown', this.keyDown);
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyDown);
  }
  componentDidUpdate() {
  }
  keyDown(e) {
    if (e.which === 27) {
      this.onEscape && this.onEscape(e);
    }
  }
  render() {
    const {router} = this.props;
    return (
      <div className="asset-overlay-background" onClick={e => {
        router.push('/', '/', {
          scroll: false,
        });
      }} />
    );
  }
}

const PagesRoot = ({
  data,
  selectedView,
  setSelectedView,
  token,
  setToken,
  mintMenuOpen,
  setMintMenuOpen,
  searchResults,
  setSearchResults,
}) => {
    const [avatars, setAvatars] = useState(null);
    const [art, setArt] = useState(null);
    const [models, setModels] = useState(null);
    const [loading, setLoading] = useState(true);    
    // const [mintMenuLarge, setMintMenuLarge] = useState(false);
    const [selectedTab, setSelectedTab] = useState('');
    const [selectedPage, setSelectedPage] = useState(0);
    const [loadingMessge, setLoadingMessage] = useState('');
    const [assetSelectedView, setAssetSelectedView] = useState('cards');
    const [previewId, setPreviewId] = useState('');
    const [masonryOpen, setMasonryOpen] = useState(true);
    const [masonryOpening, setMasonryOpening] = useState(false);
    
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const tokens1 = await getTokens(1, 100);
            const tokens2 = await getTokens(100, 200);
            const tokens = tokens1.concat(tokens2);

            setAvatars(
                tokens.filter((o) =>
                    o.properties.ext.toLowerCase().includes("vrm")
                )
            );
            setArt(
                tokens.filter((o) =>
                    o.properties.ext.toLowerCase().includes("png")
                )
            );
            setModels(
                tokens.filter((o) =>
                    o.properties.ext.toLowerCase().includes("glb")
                )
            );
            setLoading(false);
        })();
    }, []);
    useEffect(() => {
      if (mintMenuOpen && masonryOpen && !masonryOpening) {
        setTimeout(() => {
          setMasonryOpen(false);
          setMasonryOpening(false);
        }, 500);
        setMasonryOpening(true);
      } else if (!mintMenuOpen && !masonryOpen) {
        setMasonryOpen(true);
        setMasonryOpening(false);
      }
    }, [mintMenuOpen, masonryOpening]);
    useEffect(() => {
      if (!token && assetSelectedView !== 'cards') {
        setAssetSelectedView('cards');
      }
    }, [token, assetSelectedView]);
    const mintMenuLarge = selectedPage === 3;

    // console.log('masonry open', {mintMenuOpen, masonryOpen, masonryOpening});

    return (
        <Fragment>
            <Head>
                <title>Webaverse</title>
                <meta
                    name="description"
                    content={"Virtual world built with NFTs."}
                />
                <meta property="og:title" content={"Webaverse"} />
                <meta
                    property="og:image"
                    content={"https://webaverse.com/webaverse.png"}
                />
                <meta name="theme-color" content="#c4005d" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            {/* <Hero
                heroBg="/hero.gif"
                title="Webaverse"
                subtitle="The virtual world built with NFTs"
                callToAction="Play"
                ctaUrl="https://app.webaverse.com"
            /> */}
            <div className={`container ${mintMenuOpen ? 'open' : ''} ${mintMenuLarge ? 'large' : ''} ${token ? 'background' : ''}`}>
                {!cardScrollViews.includes(selectedView) ?
                  <div className="streetchain">
                    <div className="bar" />
                  </div>
                : null}
                {mintMenuOpen ?
                  <Minter
                    mintMenuOpen={mintMenuOpen}
                    setMintMenuOpen={setMintMenuOpen}
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    loading={loading}
                    setLoading={setLoading}
                    animate={true}
                  />
                : null}
                {masonryOpen ?
                  <Masonry
                    selectedView={selectedView}
                    loading={loading}
                    mintMenuOpen={mintMenuOpen}
                    setMintMenuOpen={setMintMenuOpen}
                    avatars={avatars}
                    art={art}
                    models={models}
                    searchResults={searchResults}
                  />
                : null}
            </div>
            {token ?
              <div className="asset-overlay">
                <AssetOverlayBackground
                  router={router}
                  onEscape={e => {
                    router.push('/', undefined, {
                      scroll: false,
                    });
                  }}
                />
                <div className="asset-overlay-foreground">
                  <Asset
                    data={token}
                    selectedView={assetSelectedView}
                    setSelectedView={setAssetSelectedView}
                  />
                </div>
              </div>
            : null}
        </Fragment>
    );
};
export default PagesRoot;

/* export async function getServerSideProps(context) {
  const urlPrefix = (() => {
    if (typeof window !== 'undefined') {
      return window.location.protocol + '//' + window.location.host;
    } else {
      return 'http://' + context.req.headers.host;
    }
  })();
  const u = new URL('cards.svg', urlPrefix).href;
  // console.log('got u', u);
  
  const [
    // o,
    cardSvgSource,
  ] = await Promise.all([
    (async () => {
      const res = await fetch(u);
      const s = await res.text();
      return s;
    })(),
  ]);
  // const token = o?.token;
  // const networkName = o?.networkName;

  return {
    props: {
      data: {
        // token,
        // networkName,
        cardSvgSource,
      },
    },
  };
} */
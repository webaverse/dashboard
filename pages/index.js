import React, { Fragment, useState, useEffect } from "react";
import Head from "next/head";
import { getTokens } from "../functions/UIStateFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import Loader from "../components/Loader";
const PagesRoot = ({data}) => {
    const [avatars, setAvatars] = useState(null);
    const [art, setArt] = useState(null);
    const [models, setModels] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mintMenuOpen, setMintMenuOpen] = useState(false);
    let [selectedTab, setSelectedTab] = useState('');
    const [selectedPage, setSelectedPage] = useState(0);
    const [selectedOption, setSelectedOption] = useState(0);

    setSelectedTab = (setSelectedTab => newTab => {
      setSelectedTab(newTab);
      setSelectedPage(selectedPage + 1);
      // console.log('new page', selectedPage + 1);
    })(setSelectedTab);

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
    
    const nftTypeDescriptions = {
      image: `Image NFT lets you store visual art on the blockchain. They are represented as planes in the virtual world.`,
      video: `Video NFT lets you store video clips on the blockchain. They are represented as screens in the virtual world.`,
      audio: `Audio NFT lets you store audio compositions on the blockchain. They are represented as audio nodes in the virtual world.`,
    };

    return (
        <Fragment>
            <Head>
                <title>Webaverse</title>
                <meta
                    name="description"
                    content={"The virtual world built with NFTs."}
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
            <div className="street-filters">
              <label className="row">
                <img className="search-image" src="/search.svg" />
                <input type="text" />
              </label>
              <div className="row">
                <div className="filter-options">
                  <div className={`option ${selectedOption === 0 ? 'selected' : ''}`}>
                    <img className="option-image" onClick={e => setSelectedOption(0)} src="/image.svg" />
                  </div>
                  <div className={`option ${selectedOption === 1 ? 'selected' : ''}`} onClick={e => setSelectedOption(1)}>
                    <img className="option-image" src="/image.svg" />
                  </div>
                  <div className={`option ${selectedOption === 2 ? 'selected' : ''}`} onClick={e => setSelectedOption(2)}>
                    <img className="option-image" src="/image.svg" />
                  </div>
                  <div className={`option ${selectedOption === 3 ? 'selected' : ''}`} onClick={e => setSelectedOption(3)}>
                    <img className="option-image" src="/image.svg" />
                  </div>
                </div>
              </div>
            </div>
            <div className={`container ${mintMenuOpen ? 'open' : ''}`}>
                <div className="streetchain">
                  <div className="bar" />
                </div>
                <div className="mint-button" onClick={e => {
                  setMintMenuOpen(!mintMenuOpen);
                }}>
                  <img src="/icons/plus.svg" />
                </div>
                <div className="blocker" />
                <div className="mint-menu-bar" />
                <div className="slider">
                  <div className="left-bar" />
                  <div className="contents">
                    <div
                      className="wrap-slider"
                      style={{
                        transform: `translateX(calc(-1 * (100vw - 16vw) * ${selectedPage}))`,
                      }}
                    >
                      <div className="wrap">
                        <div className="label">Choose type of NFT to mint:</div>
                        <div className="subtabs">
                          <div className={`tab ${selectedTab === 'image' ? 'selected' : ''}`} onClick={e => setSelectedTab('image')}>Image <img src="/image.svg" /></div>
                          <div className={`tab ${selectedTab === 'video' ? 'selected' : ''}`} onClick={e => setSelectedTab('video')}>Video <img src="/video.svg" /></div>
                          <div className={`tab ${selectedTab === 'audio' ? 'selected' : ''}`} onClick={e => setSelectedTab('audio')}>Audio <img src="/audio.svg" /></div>
                        </div>
                        <div className="subtabs">
                          <div className={`tab ${selectedTab === 'avatar' ? 'selected' : ''}`} onClick={e => setSelectedTab('avatar')}>Avatar <img src="/avatar.svg" /> </div>
                          <div className={`tab ${selectedTab === 'item' ? 'selected' : ''}`} onClick={e => setSelectedTab('item')}>Item <img src="/sword.svg" /></div>
                          <div className={`tab ${selectedTab === 'wearable' ? 'selected' : ''}`} onClick={e => setSelectedTab('wearable')}>Wearable <img src="/chain-mail.svg" /></div>
                          <div className={`tab ${selectedTab === 'pet' ? 'selected' : ''}`} onClick={e => setSelectedTab('pet')}>Pet <img src="/rabbit.svg" /></div>
                          <div className={`tab ${selectedTab === 'mount' ? 'selected' : ''}`} onClick={e => setSelectedTab('mount')}>Mount <img src="/sofa.svg" /></div>
                          <div className={`tab ${selectedTab === 'vehicle' ? 'selected' : ''}`} onClick={e => setSelectedTab('vehicle')}>Vehicle <img src="/scooter.svg" /></div>
                        </div>
                        <div className="text"></div>
                      </div>
                      <div className="wrap">
                        <div className="subwraps">
                          <div className="subwrap">
                            <div className="label">
                              <nav
                                className="back-button"
                                onClick={e => {
                                  setSelectedPage(selectedPage - 1);
                                }}
                              >
                                <img
                                  src="/chevron-left.svg"
                                  onDragStart={e => {
                                    e.preventDefault();
                                  }}
                                />
                              </nav>
                              <div className="text">{selectedTab}</div>
                            </div>
                            <div className="description">
                              <div className="text">
                                {nftTypeDescriptions[selectedTab]}
                              </div>
                              <div className="card-hype">
                                
                              </div>
                            </div>
                          </div>
                          <div className="subwrap">
                            <div>Upload file to mint:</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {loading ? (
                    <Loader loading={loading} />
                ) : (
                    <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
                        {/* <CardRowHeader name="Avatars" /> */}
                        <CardRow data={avatars} cardSize="small" cardSvgSource={data.cardSvgSource} />

                        {/* <CardRowHeader name="Digital Art" /> */}
                        <CardRow data={art} cardSize="small" cardSvgSource={data.cardSvgSource} />

                        {/* <CardRowHeader name="3D Models" /> */}
                        <CardRow data={models} cardSize="small" cardSvgSource={data.cardSvgSource} />
                    </div>
                )}
            </div>
        </Fragment>
    );
};
export default PagesRoot;

export async function getServerSideProps(context) {
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
    /* (async () => {
      const id = /^[0-9]+$/.test(context.params.id) ? parseInt(context.params.id, 10) : NaN;
      const o = await getData(id);
      return o;
    })(), */
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
}

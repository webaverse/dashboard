import React, { Component, Fragment, useState, useEffect } from "react";
import Head from "next/head";
import {useRouter} from 'next/router';
import axios from 'axios';
import {getTokens} from "../functions/UIStateFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import Asset from "../components/Asset";
import Loader from "../components/Loader";
import {FileDrop} from "react-file-drop";
import {makeWbn, makeBin, makePhysicsBake} from "../webaverse/build";
import {blobToFile, getExt, parseQuery} from "../webaverse/util";
import {storageHost} from "../webaverse/constants";

class Dropper extends Component {
  constructor(props) {
    super(props);
    
    this.dragOverHandler = this.dragOverHandler.bind(this);
    this.dropHandler = this.dropHandler.bind(this);
    this.onDrop = props.onDrop;
  }
  componentDidMount() {
    if (window !== 'undefined') {
      window.document.addEventListener('dragover', this.dragOverHandler);
      window.document.addEventListener('drop', this.dropHandler);
    }
  }
  componentWillUnmount() {
    if (window !== 'undefined') {
      window.document.removeEventListener('dragover', this.dragOverHandler);
      window.document.removeEventListener('drop', this.dropHandler);
    }
  }
  dragOverHandler(e) {
    // console.log('drag over');
    e.preventDefault();
  }
  dropHandler(e) {
    // console.log('drop');
    e.preventDefault();
    const {files} = e;
    this.onDrop(files);
  }
  render() {
    return (
      <div />
    );
  }
}

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
  token,
  setToken,
  searchResults,
  setSearchResults,
}) => {
    const [avatars, setAvatars] = useState(null);
    const [art, setArt] = useState(null);
    const [models, setModels] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mintMenuOpen, setMintMenuOpen] = useState(false);
    // const [mintMenuLarge, setMintMenuLarge] = useState(false);
    const [selectedTab, setSelectedTab] = useState('');
    const [selectedPage, setSelectedPage] = useState(0);
    const [loadingMessge, setLoadingMessage] = useState('');
    const [previewId, setPreviewId] = useState('');
    
    const router = useRouter();

    const _setSelectedTab = newTab => {
      setSelectedTab(newTab);
      setSelectedPage(1);
      // console.log('new page', selectedPage + 1);
    };

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
    const mintMenuLarge = selectedPage === 3;
    
    const nftTypeDescriptions = {
      image: `Image NFT lets you store visual art on the blockchain. They are represented as planes in the virtual world.`,
      video: `Video NFT lets you store video clips on the blockchain. They are represented as screens in the virtual world.`,
      audio: `Audio NFT lets you store audio compositions on the blockchain. They are represented as audio nodes in the virtual world.`,
      avatar: `Avatar NFT lets you create VRM avatars on the blockchain. They can be worn in the virtual world.`,
      item: `Item NFT lets you create virtual objects on the blockchain. They can be pulled out of your inventory in the virtual world.`,
      wearable: `Wearable NFT lets you create digital fashion on the blockchain. They can be worn by your avatar in the virtual world.`,
      pet: `Pet NFT lets you create virtual pets on the blockchain. They can be interacted with in the virtual world.`,
      scene: `Scene NFT lets you create digital scenes on the blockchain. They can be visited in the virtual world.`,
      vehicle: `Vehicle NFT lets you create virtual vehicles on the blockchain. They can be ridden in the virtual world.`,
    };
    const _reset = () => {
      setSelectedPage(0);
      setSelectedTab('');
      setLoadingMessage('');
    };
    const handleFilesMagically = async (files = []) => {
      // setLoading(true);
      if (files.length > 1) {
        const filesArray = Array.from(files)
        const wbn = await makeWbn(filesArray);
        handleFileUpload(wbn);
      } else if (files.length === 1) {
        if (getExt(files[0].name) === "glb") {
          const wbn = await makePhysicsBake(files);
          handleFileUpload(wbn);
        } else /* if (['glb', 'png', 'vrm'].indexOf(getExt(files[0].name)) >= 0) */ {
          handleFileUpload(files[0]);
        /* } else {
          alert("Use one of the support file formats: png, glb, vrm");
          setLoading(false); */
        }
      } else {
        console.warn("No files uploaded!");
        // setLoading(false);
      }
    };
    const handleFileUpload = file => {
      if (file) {
        setSelectedPage(selectedPage + 1);
        
        // let reader = new FileReader();
        // reader.onloadend = () => {
          const extName = getExt(file.name);
          const fileName = extName ? file.name.slice(0, -(extName.length + 1)) : file.name;
          // setExtName(extName);
          // setName(fileName);

          // const documentStyles = document.documentElement.style;
          let progress = 0;

          // setLoading('true');
          // setProgress('in-progress');

          axios({
            method: 'post',
            url: storageHost,
            data: file,
            onUploadProgress(progressEvent) {
              progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              // setPercentage(progress);
              console.log("progress", progress);
              // documentStyles.setProperty('--progress', `${progress}%`);

              if (progress > 0 && progress < 10) {
                setLoadingMessage("Blurring Reality Lines");
              } else if (progress > 10 && progress < 20) {
                setLoadingMessage("Preparing Captive Simulators");
              } else if (progress > 20 && progress < 30) {
                setLoadingMessage("Destabilizing Orbital Payloads");
              } else if (progress > 30 && progress < 40) {
                setLoadingMessage("Reticulating 3-Dimensional Splines");
              } else if (progress > 40 && progress < 50) {
                setLoadingMessage("Inserting Chaos Generator");
              } else if (progress > 50 && progress < 60) {
                setLoadingMessage("Initializing Secret Societies");
              } else if (progress > 60 && progress < 70) {
                setLoadingMessage("Recycling Hex Decimals");
              } else if (progress > 70 && progress < 80) {
                setLoadingMessage("Locating Misplaced Calculations");
              } else if (progress > 80 && progress < 90) {
                setLoadingMessage("Simulating Program Execution");
              } else if (progress > 90) {
                setLoadingMessage("Composing Melodic Euphony");
              } else {
                setLoadingMessage("Composing Melodic Euphony");
              }
            }
          })
          .then(data => {
            data = data.data;
            // setProgress('finished');
            // setHash(data.hash);
            // setIpfsUrl("https://ipfs.exokit.org/" + data.hash + "/" + fileName + "." + extName);
            // router.push('/preview/' + data.hash + "." + fileName + "." + extName);

            console.log('got data', data, `${storageHost}/${data.hash}/nft.${extName}`);

            setPreviewId(`${storageHost}/${data.hash}/nft.${extName}`);
            setSelectedPage(3);
          })
          .catch(error => {
            console.error(error)
          });

          /*
            fetch(storageHost, {
              method: 'POST',
              body: file
            })
            .then(response => response.json())
            .then(data => {
              setHash(data.hash);
              setIpfsUrl("https://ipfs.exokit.org/" + data.hash + "/" + fileName + "." + extName);
              router.push('/preview/' + data.hash + "." + fileName + "." + extName);
            })
            .catch(error => {
              console.error(error)
            })
          */
        /* }
        reader.readAsDataURL(file); */
      }
      else console.warn("Didnt upload file");
    };
    const _handleTokenClick = tokenId => e => {
      router.push('/', '/assets/' + tokenId, {
        scroll: false,
      });
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
            <div className={`container ${mintMenuOpen ? 'open' : ''} ${mintMenuLarge ? 'large' : ''} ${token ? 'background' : ''}`}>
                <div className="streetchain">
                  <div className="bar" />
                </div>
                <div className={`mint-button ${token ? 'below' : ''}`} onClick={e => {
                  const newMintMenuOpen = !mintMenuOpen;
                  setMintMenuOpen(newMintMenuOpen);
                  if (!newMintMenuOpen) {
                    _reset();
                  }
                }}>
                  <img src="/icons/plus.svg" />
                </div>
                {/* <div className="blocker" /> */}
                <div className="mint-menu-bar" />
                <div className="slider">
                  {/* <div className="left-bar" /> */}
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
                          <div className={`tab ${selectedTab === 'image' ? 'selected' : ''}`} onClick={e => _setSelectedTab('image')}>Image <img src="/image.svg" /></div>
                          <div className={`tab ${selectedTab === 'video' ? 'selected' : ''}`} onClick={e => _setSelectedTab('video')}>Video <img src="/video.svg" /></div>
                          <div className={`tab ${selectedTab === 'audio' ? 'selected' : ''}`} onClick={e => _setSelectedTab('audio')}>Audio <img src="/audio.svg" /></div>
                        </div>
                        <div className="subtabs">
                          <div className={`tab ${selectedTab === 'avatar' ? 'selected' : ''}`} onClick={e => _setSelectedTab('avatar')}>Avatar <img src="/avatar.svg" /> </div>
                          <div className={`tab ${selectedTab === 'item' ? 'selected' : ''}`} onClick={e => _setSelectedTab('item')}>Item <img src="/sword.svg" /></div>
                          <div className={`tab ${selectedTab === 'wearable' ? 'selected' : ''}`} onClick={e => _setSelectedTab('wearable')}>Wearable <img src="/chain-mail.svg" /></div>
                          <div className={`tab ${selectedTab === 'pet' ? 'selected' : ''}`} onClick={e => _setSelectedTab('pet')}>Pet <img src="/rabbit.svg" /></div>
                          <div className={`tab ${selectedTab === 'scene' ? 'selected' : ''}`} onClick={e => _setSelectedTab('scene')}>Scene <img src="/road.svg" /></div>
                          <div className={`tab ${selectedTab === 'vehicle' ? 'selected' : ''}`} onClick={e => _setSelectedTab('vehicle')}>Vehicle <img src="/scooter.svg" /></div>
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
                            <Dropper
                              onDrop={handleFilesMagically}
                            />
                            <label className="upload-section file-drop-container" htmlFor="input-file">
                              <Head>
                                <script type="text/javascript" src="/geometry.js"></script>
                              </Head>
                            
                              <div className="text">Drop a file here to mint<br/>Click to choose file</div>
                              <img src="/upload.svg" />
                              
                              <input type="file" id="input-file" onChange={(e) => handleFilesMagically(e.target.files)} multiple={true} style={{display: 'none'}} />
                              
                            </label>
                          </div>
                        </div>
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
                              <div className="text">Cancel</div>
                            </div>
                            <div className="description">
                              Uploading NFT...
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="wrap">
                        <div className="subwraps">
                          <div className="subwrap">
                            <div className="label">
                              <nav
                                className="back-button"
                                onClick={e => {
                                  setSelectedPage(selectedPage - 2);
                                }}
                              >
                                <img
                                  src="/chevron-left.svg"
                                  onDragStart={e => {
                                    e.preventDefault();
                                  }}
                                />
                              </nav>
                              <div className="text">Preview NFT</div>
                            </div>
                            <div className="description">
                              Upload complete, here is the preview:
                              {previewId ? <div className="IFrameContainer">
                                <iframe className="IFrame" src={"https://app.webaverse.com/?t=" + previewId} />
                              </div> : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {loading ? (
                  <Loader loading={loading} />
                ) : (
                  searchResults ? (
                    <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
                      {/* <CardRowHeader name="Avatars" /> */}
                      <CardRow name="Results" data={searchResults} selectedView={selectedView} cardSize="small" />
                    </div>
                  ) : (
                    <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
                      {/* <CardRowHeader name="Avatars" /> */}
                      <CardRow name="Avatars" data={avatars} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />

                      {/* <CardRowHeader name="Digital Art" /> */}
                      <CardRow name="Art" data={art} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />

                      {/* <CardRowHeader name="3D Models" /> */}
                      <CardRow name="Models" data={models} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />
                    </div>
                  )
                )}
            </div>
            {token ?
              <div className="asset-overlay">
                <AssetOverlayBackground
                  router={router}
                  onEscape={e => {
                    setToken(null);
                  }}
                />
                <div className="asset-overlay-foreground">
                  <Asset
                    data={token}
                    selectedView={selectedView}
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
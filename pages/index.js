import React, { Component, Fragment, useState, useEffect } from "react";
import Head from "next/head";
import {useRouter} from 'next/router';
import axios from 'axios';
import {getTokens} from "../functions/UIStateFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import Asset from "../components/Asset";
import Minter from "../components/Minter";
// import Loader from "../components/Loader";
import ProgressBar from "../components/ProgressBar";
// import {FileDrop} from "react-file-drop";
import {makeWbn, makeBin, makePhysicsBake} from "../webaverse/build";
import {blobToFile, getExt, parseQuery, schedulePerFrame} from "../webaverse/util";
import {storageHost} from "../webaverse/constants";
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
    const [previewId, setPreviewId] = useState('');
    const [mintMenuOpen, setMintMenuOpen] = useState(false);
    const [mintMenuStep, setMintMenuStep] = useState(1);
    const [mintProgress, setMintProgress] = useState(0);
    
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
    const mintMenuLarge = selectedPage === 3;

    const _reset = () => {
      // setSelectedPage(0);
      setSelectedTab('');
      setLoadingMessage('');
      setMintMenuStep(1);
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
    
    const _updateMintProgress = () => {
      let frame = null;
      const _scheduleFrame = () => {
        frame = requestAnimationFrame(_recurse);
      };
      const _recurse = () => {
        _scheduleFrame();
        // if (mintMenuStep === 3) {
          setMintProgress(Date.now() % 1000 / 1000);
        // }
      };
      schedulePerFrame(() => {
        _scheduleFrame();
      }, () => {
        frame && cancelAnimationFrame(frame);
        frame = null;
      });
    };
    _updateMintProgress();

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
                  <img src="/mint.svg" onDragStart={e => {
                    e.preventDefault();
                  }}/>
                </div>
                {/* <div className="blocker" /> */}
                {/* <div className="mint-menu-bar" /> */}
                <Minter
                  mintMenuOpen={mintMenuOpen}
                  setMintMenuOpen={setMintMenuOpen}
                  mintMenuStep={mintMenuStep}
                  setMintMenuStep={setMintMenuStep}
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  loading={loading}
                  setLoading={setLoading}
                />
                {(loading && !mintMenuOpen) ? (
                  <div className="progress-bar-wrap">
                    <ProgressBar
                      value={mintProgress}
                    />
                  </div>
                ) : (
                  searchResults ? (
                    <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
                      {/* <CardRowHeader name="Avatars" /> */}
                      <CardRow name="Results" data={searchResults} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />
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
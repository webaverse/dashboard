import React, { Component, Fragment, useState, useEffect } from "react";
import Head from "next/head";
import {useRouter} from 'next/router';
import axios from 'axios';
import {getTokens} from "../functions/UIStateFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import Asset from "../components/Asset";
import {makeWbn, makeBin, makePhysicsBake} from "../webaverse/build";
import {blobToFile, getExt, parseQuery} from "../webaverse/util";
import {storageHost} from "../webaverse/constants";
import JSZip from '../webaverse/jszip.js';

const nftTypeDescriptions = {
  image: `Image NFT lets you store visual art on the blockchain. They are represented as planes in the virtual world.`,
  video: `Video NFT lets you store video clips on the blockchain. They are represented as screens in the virtual world.`,
  audio: `Audio NFT lets you store audio compositions on the blockchain. They are represented as audio nodes in the virtual world.`,
  avatar: `Avatar NFT lets you create VRM avatars on the blockchain. They can be worn in the virtual world.`,
  model: `Model NFT lets you create 3D virtual objects on the blockchain. They can be pulled out of your inventory in the virtual world.`,
  html: `HMTL NFT lets you create web sites on the blockchain. They are represented as screens in the virtual world.`,
  wearable: `Wearable NFT lets you create digital fashion on the blockchain. They can be worn by your avatar in the virtual world.`,
  pet: `Pet NFT lets you create virtual pets on the blockchain. They can be interacted with in the virtual world.`,
  scene: `Scene NFT lets you create digital scenes on the blockchain. They can be visited in the virtual world.`,
  vehicle: `Vehicle NFT lets you create virtual vehicles on the blockchain. They can be ridden in the virtual world.`,
};

const urlToRepoZipUrl = url => {
  const u = new URL(url);
  const match = u.pathname.match(/^\/(.+?)\/(.+?)\/tree\/(.+)(\/.*)?$/);
  console.log('match pathname', [url, u.pathname, match]);
  if (match) {
    const username = match[1]; 
    const reponame = match[2];
    const branchname = match[3];
    const tail = match[4];

    return `https://http-github-com.proxy.exokit.org/${username}/${reponame}/archive/${branchname}.zip`;
  } else {
    return null;
  }
};

const FakeCard = ({animate, animationSize, onClick}) => {
  const [translation, setTranslation] = useState([0, 0, 0]);
  const [perspective, setPerspective] = useState([0, 0]);
  const [transitioning, setTransitioning ] = useState(false);
  
  const flip = false;
  const tilt = true;
  const cardSize = 'large';
  const cardSpecHighlight = null;
  
  let frame = null;
  const _scheduleFrame = () => {
    frame = requestAnimationFrame(_recurse);
  };
  const _recurse = () => {
    if (frame) {
      _scheduleFrame();
      setTranslation([
        0,
        Math.sin((Date.now() % 5000) / 5000 * Math.PI * 2) * (animationSize === 'large' ? 20 : 3),
        0
      ]);
      setPerspective([
        Math.sin((Date.now() % 5000) / 5000 * Math.PI * 2) * (animationSize === 'large' ? 0.5 : 1),
        Math.cos((Date.now() % 3000) / 3000 * Math.PI * 2) * (animationSize === 'large' ? 0.2 : 0.5)
      ]);
    }
  };
  useEffect(() => {
    animate && _scheduleFrame();
    return () => {
      frame && cancelAnimationFrame(frame);
      frame = null;
    };
  });
  
  const _cancelDragStart = e => {
    e.preventDefault();
  };
  
  return (
    <div className="card-outer">
      <div className="card-outer-flip">
        {/* <div className='card-glossy' /> */}
        <div
          className={`card-wrap`}
          onClick={onClick}
        >
          <div
            className={`card-svg`}
            style={{
              transform: `translate3D(${translation.map(n => n + 'px').join(', ')}) rotateY(${perspective[0] * 180 * 0.2 + (flip ? -180 : 0)}deg) rotateX(${perspective[1] * 180 * 0.2}deg)`,
            }}
          >
            <img
              src={`cards-placeholder.png`}
              className={`card-svg-inner ${cardSize}`}
              onDragStart={_cancelDragStart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Form = ({mintMenuOpen, quantity, setQuantity, mintMenuStep, setMintMenuStep, url, setUrl, source, setSource}) => {
  let nameEl = null;
  const _updateNameFocus = () => {
    if (mintMenuOpen && nameEl) {
      nameEl.focus();
    }
  };
  useEffect(() => {
    _updateNameFocus();
  }, [mintMenuOpen]);
  
  let urlEl = null;
  const _updateUrlFocus = () => {
    if (source === 'url' && urlEl) {
      urlEl.focus();
    }
  };
  useEffect(() => {
    _updateUrlFocus();
  }, [source]);
  
  return (
    <form className={`form`} onSubmit={e => {
      e.preventDefault();
      setMintMenuStep(2);
    }}>
      <div className="label">Name</div>
      <input type="text" placeholder="Name" ref={el => {
        nameEl = el;
      }} />
      <div className="label">Description</div>
      <textarea placeholder="Description"/>
      <div className="label">Source</div>
      <div className="radio">
        <label>
          <input
            type="radio"
            name="source"
            value="file"
            checked={source === 'file'}
            onChange={e => {
              setSource('file');
            }}
          />File
        </label>
        <label>
          <input
            type="radio"
            name="source"
            value="file"
            checked={source === 'url'}
            onChange={e => {
              setSource('url');
            }}
          />URL
        </label>
      </div>
      {source === 'file' ?
        [
          (<div className="label" key="file">File</div>),
          (<input type="file" placeholder="File" value={null} onChange={e => {
            console.log('file change', e);
          }} key="file2" />),
        ]
      :
        [
          (<div className="label" key="file3">URL</div>),
          (<input type="text" placeholder="https://" value={url} onChange={e => {
            // console.log('url change', e);
            setUrl(e.target.value);
          }} ref={el => {
            urlEl = el;
          }} key="file4" />),
        ]
      }
      <div className="label">Quantity</div>
      <input type="number" placeholder="Quantity" value={quantity} onChange={e => {
        setQuantity(e.target.value);
      }} min={1} step={1} />
      <input className={source === 'url' ? '' : 'disabled'} type="button" value="Preview NFT" onChange={e => {}} disabled={source !== 'url'} onClick={e => {
        setMintMenuStep(2);
      }} />
    </form>
  );
};

const Minter = ({
  mintMenuOpen,
  setMintMenuOpen,
  mintMenuStep,
  setMintMenuStep,
  selectedTab,
  setSelectedTab,
  loading,
  setLoading,
}) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [url, setUrl] = useState(`https://github.com/hicetnunc2000/hicetnunc/tree/main/templates/html-three-template`);
  const [source, setSource] = useState('file');
  const [frontendUrl, setFrontendUrl] = useState('');
  
  useEffect(async () => {
    // console.log('effect update', mintMenuStep);
    if (mintMenuStep === 2 && !loading) {
      setLoading(true);

      const repoZipUrl = urlToRepoZipUrl(url);
      if (repoZipUrl) {
        // console.log('got repo zip', repoZipUrl);
        const res = await fetch(repoZipUrl);
        const ab = await res.arrayBuffer();
        
        const zip = await JSZip.loadAsync(ab);
        
        const fileNames = [];
        const isDirectoryName = fileName => /\/$/.test(fileName);
        const filePredicate = fileName => {
          return /html-three-template/.test(fileName);
        };
        for (const fileName in zip.files) {
          // const file = zip.files[fileName];
          if (filePredicate(fileName)) {
            fileNames.push(fileName);
          }
        }
        
        const files = await Promise.all(fileNames.map(async fileName => {
          const file = zip.file(fileName);
          const b = file && await file.async('blob');
          return {
            name: fileName,
            data: b,
          };
        }));
        console.log('got r', files);
        
        const fd = new FormData();
        for (const file of files) {
          const {name} = file;
          const basename = name.replace(/\/(.*)$/, '$1');
          if (isDirectoryName(name)) {
            fd.append(
              basename,
              new Blob([], {
                type: 'application/x-directory',
              }),
              name
            );
          } else {
            fd.append(basename, file.data, name);
          }
        }
        
        // console.log('got form data', fd);
        const r = await axios({
          method: 'post',
          url: storageHost,
          data: fd,
        });
        const {data} = r;
        const startUrl = `hicetnunc-main/templates/html-three-template`;
        const startFile = data.find(e => e.name === startUrl);
        const {hash} = startFile;
        
        const newFrontendUrl = `${storageHost}/ipfs/${hash}/`;
        console.log('got result', r, frontendUrl);
frontendUrl
        setFrontendUrl(newFrontendUrl);
      } else {
        console.warn('invalid repo url', url);
      }
      
      setLoading(false);
    }
  }, [mintMenuStep]);
  
  const _setSelectedTab = newTab => {
    setSelectedTab(newTab);
    // setSelectedPage(1);
    setMintMenuStep(2);
    // console.log('new page', selectedPage + 1);
  };
  const selectedTabDefaulted = selectedTab || 'image';
  
  return (
    <div className="slider">
    {/* <div className="left-bar" /> */}
    <div
      className="contents"
    >
      <div className={`wrap-slider step-${mintMenuStep}`}>
        <div className="wrap step-2-only">
          <div className="back-button" onClick={e => {
            setMintMenuStep(1);
            setSelectedTab('');
          }}>
            <img src="/chevron-left.svg" /><span>Back</span>
          </div>
          <div className="main">
            {frontendUrl ?
              <div className="preview">
                <div className="preview-header">
                  <FakeCard
                    onClick={e => {
                      setMintMenuStep(2);
                    }}
                    animate={true}
                    animationSize="small"
                  />
                  <div>Your NFT called </div>
                  <div className="bold">{name || '[blank]'}</div>
                  <div> will be minted as an edition of </div>
                  <div className="bold">{quantity || 1}</div>
                  <div> and the content will be </div>
                  <input type="text" value={frontendUrl} onChange={e => {}} />
                  <div>. Here's a preview:</div>
                </div>
                <iframe
                  className="iframe"
                  src={frontendUrl}
                />
              </div>
            : null}
            <div className="rrhs">
              <div className="h1">{selectedTabDefaulted} NFT</div>
              <div className="description">{nftTypeDescriptions[selectedTabDefaulted]}</div>
              <div className="infobox">
                <div className="h1">Mint with SILK</div>
                <div className="row">
                  <div className="label">SILK balance</div>
                  <img src="/curve.svg" />
                  <div className="value">1337</div>
                </div>
                {/* <div className="row">
                  <div className="minus">-</div>
                </div> */}
                <div className="row red">
                  <div className="label">Minting fee</div>
                  <div className="minus">-</div>
                  <img src="/curve.svg" />
                  <div className="value">10</div>
                </div>
                <div className="row">
                  <div className="line" />
                </div>
                <div className="row red">
                  <div className="label">New balance</div>
                  <img src="/curve.svg" />
                  <div className="value">1327</div>
                </div>
                <input type="button" value="Confirm mint" onChange={e => {}} />
              </div>
            </div>
          </div>
        </div>
        <div className="wrap step-1-only">
          <Lhs
            className="large"
            mintMenuOpen={mintMenuOpen}
            helpOpen={helpOpen}
            setHelpOpen={setHelpOpen}
            mintMenuStep={mintMenuStep}
            setMintMenuStep={setMintMenuStep}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            quantity={quantity}
            setQuantity={setQuantity}
            url={url}
            setUrl={setUrl}
            source={source}
            setSource={setSource}
            frontendUrl={frontendUrl}
          />
          <div className="middle">
            <div className="card-buttons like">
              <div className={`card-button help ${helpOpen ? 'open' : ''}`} onClick={e => {
                setHelpOpen(!helpOpen);
              }}>
                <img src="/help.svg" />
              </div>
            </div>
            <div className={`helper ${helpOpen ? 'open' : ''}`}>
                <div className="h1">Ready to mint your first NFT?</div>
                <p>Drag and drop a file to get started. Or, click here to choose file. Lazy? Choose a template --&gt;</p>
                <p className="h2">Supported file types:</p>
                <p className="sub">
                  <span>png</span>
                  <span>jpg</span>
                  <span>glb</span>
                  <span>vrm</span>
                  <span>vox</span>
                </p>
              </div>
          </div>
          <div className="rhs">
            <div className="label">Templates</div>
            <div className="subtabs">
              {[
                ['image', '/image.svg'],
                ['video', '/video.svg'],
                ['audio', '/audio.svg'],
                ['avatar', '/avatar.svg'],
                ['model', '/sword.svg'],
                ['html', '/html.svg'],
                ['wearable', '/chain-mail.svg'],
                ['pet', '/rabbit.svg'],
                ['scene', '/road.svg'],
                ['vehicle', '/scooter.svg'],
              ].map(([name, imgSrc], i) => {
                return (
                  <div className="tab-wrap" onClick={e => _setSelectedTab(name)} key={i}>
                    <div
                      className={`tab ${selectedTab === name ? 'selected' : ''}`}
                    >
                      <img src={imgSrc} />
                      <span>{name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text"></div>
          </div>
          {/* <div className="wrap">
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
          </div> */}
        </div>
      </div>
    </div>
  </div>
  );
};

const Lhs = ({className, name, setName, description, setDescription, quantity, setQuantity, mintMenuOpen, helpOpen, setHelpOpen, mintMenuStep, setMintMenuStep, url, setUrl, source, setSource, frontendUrl}) => {
  return (
    <div
      className={`lhs ${className}`}
    >
      <div className={`stage`}>
        <FakeCard
          onClick={e => {
            setMintMenuStep(2);
          }}
          animate={className === 'large'}
          animationSize="large"
        />
        <Form
          mintMenuOpen={mintMenuOpen}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          quantity={quantity}
          setQuantity={setQuantity}
          mintMenuStep={mintMenuStep}
          setMintMenuStep={setMintMenuStep}
          url={url}
          setUrl={setUrl}
          source={source}
          setSource={setSource}
        />
      </div>
    </div>
  );
};

export default Minter;
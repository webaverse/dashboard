import React, { Component, Fragment, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from 'next/router';
import axios from 'axios';
import {getTokens} from "../functions/UIStateFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import ProgressBar from "../components/ProgressBar";
import Asset from "../components/Asset";
import User from "../components/User";
import ShaderToyRenderer from "../components/ShaderToyRenderer";
import {makeWbn, makeBin, makePhysicsBake} from "../webaverse/build";
import {blobToFile, getExt, parseQuery, schedulePerFrame} from "../webaverse/util";
import {useAppContext} from "../libs/contextLib";
import {storageHost} from "../webaverse/constants";
// import WaveSurfer from '../webaverse/wavesurfer.js';
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
const templates = [
  ['image', '/image.svg', '/gondola.png'],
  ['video', '/video.svg', '/Steps.mp4'],
  ['audio', '/audio.svg', '/Chill1.mp3'],
  ['avatar', '/avatar.svg', '/Default Bot (2).vrm'],
  ['model', '/sword.svg', 'backpack_v1.glb'],
  ['html', '/html.svg', 'https://github.com/hicetnunc2000/hicetnunc/tree/main/templates/html-three-template'],
  ['wearable', '/chain-mail.svg', null],
  ['pet', '/rabbit.svg', null],
  ['scene', '/road.svg', null],
  ['vehicle', '/scooter.svg', null],
];

const urlToRepoZipUrl = url => {
  // console.log('check url', url);
  const u = new URL(url, window.location.href);
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
  
  {
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
    schedulePerFrame(() => {
      animate && _scheduleFrame();
    }, () => {
      frame && cancelAnimationFrame(frame);
      frame = null;
    });
  }
  
  const _cancelDragStart = e => {
    e.preventDefault();
  };
  
  return (
    <div className="fake-card card-outer">
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

/* const WaveSurferAudio = () => {
  return (
    <div />
  );
}; */

const Form = ({
  mintMenuOpen,
  quantity,
  setQuantity,
  file,
  setFile,
  mintMenuStep,
  setMintMenuStep,
  url,
  setUrl,
  source,
  setSource,
  handleLoadFile,
  handleLoadUrl,
}) => {
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
  
  const enabled = (source === 'file' && !!file) || source === 'url';
  
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
          (<div className="label" key="file1">File</div>),
          (file ?
            <div className="file" key="file2">
              <div className="text">{file.name}</div>
              <img className="cancel-button" src="/cancel.svg" onClick={e => {
                setFile(null);
              }} />
            </div>
          :
            <input type="file" placeholder="File" onChange={e => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                setFile(files[0]);
              } else {
                setFile(null);
              }
            }} key="file2" />
          ),
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
      <input className={enabled ? '' : 'disabled'} type="button" value="Preview NFT" onChange={e => {}} disabled={!enabled} onClick={e => {
        setMintMenuStep(2);
        
        if (source === 'file') {
          handleLoadFile(file);
        } else if (source === 'url') {
          handleLoadUrl(url);
        }
      }} />
    </form>
  );
};

const PreviewIframe = ({
  hash,
  ext,
  loaded,
}) => {
  // `{storageHost}/ipfs/${hash}`
  const src = `https://127.0.0.1:3001/preview.html?hash=${hash}&ext=${ext}`;
  return (
    <iframe
      className={`iframe ${loaded ? 'loaded' : ''}`}
      src={src}
    />
  );
  /* <WaveSurferAudio /> */
  /* <iframe
    className="iframe"
    src={frontendUrl}
  /> */
};

class DragNDrop extends Component {
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
    const files = Array.from(e.dataTransfer.files);
    this.onDrop(files);
  }
  render() {
    const {className, children} = this.props;
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
}

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
  const {globalState, setGlobalState} = useAppContext();
  const [helpOpen, setHelpOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(`https://github.com/hicetnunc2000/hicetnunc/tree/main/templates/html-three-template`);
  const [source, setSource] = useState('file');
  const [mintProgress, setMintProgress] = useState(0);
  // const [frontendUrl, setFrontendUrl] = useState('');
  const [hash, setHash] = useState('');
  const [ext, setExt] = useState('');
  const [jitter, setJitter] = useState([0, 0]);
  const [loaded, setLoaded] = useState(false);
  
  const handleLoadFile = async file => {
    console.log('load file name', file);
    
    setLoading(true);
    setLoaded(false);
    setHash('');
    setExt('');

    const fileExt = getExt(file.name);
    if (fileExt === 'zip') {
      const zip = await JSZip.loadAsync(file);
      
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
      const {name, hash: newHash} = startFile;
      const newExt = 'html'; // getExt(name);
      
      console.log('got result', startFile, newHash, newExt);
      setHash(newHash);
      setExt(newExt);
    } else {
      const r = await axios({
        method: 'post',
        url: storageHost,
        data: file,
      });
      const {data} = r;
      console.log('uploaded', data);
      const {hash: newHash} = data;
      
      setHash(newHash);
      setExt(fileExt);
    }
    
    setLoading(false);
  };
  const handleLoadUrl = async url => {
    setLoaded(false);
    setHash('');
    setExt('');
    
    const repoZipUrl = urlToRepoZipUrl(url);
    if (repoZipUrl) {
      await handleLoadUrl(repoZipUrl);
    } else {
      const res = await fetch(url);
      const b = await res.blob();
      b.name = url;
      await handleLoadFile(b);
    }
  };
  const handleLoadTemplate = async templateName => {
    const template = templates.find(([name]) => name == templateName);
    const [name, icon, url] = template;
    
    setLoaded(false);
    setHash('');
    setExt('');
    
    const repoZipUrl = urlToRepoZipUrl(url);
    if (repoZipUrl) {
      await handleLoadUrl(repoZipUrl);
    } else {
      await handleLoadUrl(url);
    }
  };
  const _setSelectedTab = newTab => {
    setSelectedTab(newTab);
    setMintMenuStep(2);
    handleLoadTemplate(newTab);
  };
  const selectedTabDefaulted = selectedTab || 'image';

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
  const _updateMintJitter = () => {
    let frame = null;
    let startTime = 0;
    const _scheduleFrame = () => {
      frame = requestAnimationFrame(_recurse);
    };
    const _recurse = () => {
      _scheduleFrame();
      if (mintMenuStep === 3) {
        const _makeValue = () => {
          const now = Date.now();
          const f = 1 + Math.sin((now - startTime)/1000 * Math.PI) / 2;
          return (-1 + Math.random() * 2) * 10 * f;
        };
        setJitter([
          _makeValue(),
          _makeValue(),
        ]);
      }
    };
    schedulePerFrame(() => {
      startTime = Date.now();
      _scheduleFrame();
    }, () => {
      frame && cancelAnimationFrame(frame);
      frame = null;
    });
  };
  _updateMintJitter();
  const _delayFrames = (fn, numFrames) => {
    let frame = 0;
    const _recurse = () => {
      if (++frame >= numFrames) {
        fn();
      } else {
        requestAnimationFrame(_recurse);
      }
    };
    requestAnimationFrame(_recurse);
  };
  const _hitEffect = () => {
    const htmlEl = document.querySelector('html');
    
    let hits = 0;
    const numHits = 3;
    const _recurse = () => {
      if (++hits <= numHits) {
        htmlEl.classList.add('hit');
        requestAnimationFrame(() => {
          htmlEl.classList.remove('hit');
          
          _delayFrames(_recurse, 2);
        })
      }
    };
    _recurse();
  };
  
  useEffect(() => {
    if (mintMenuStep === 4) {
      _hitEffect();
    }
  }, [mintMenuStep]);
  
  // console.log('got global state', globalState);
  const {
    name: userName,
    address,
    avatarPreview,
  } = globalState;
  const tokenId = 1; // XXX

  useEffect(() => {
    const _message = e => {
      const j = e.data;
      // console.log('got message', j);
      if (j && typeof j === 'object' && !Array.isArray(j)) {
        const {_preview, ok} = j;

        if (_preview && ok) {
          // console.log('tick load');
          setLoaded(true);
        }
      }
    };
    window.addEventListener('message', _message);
    
    return () => {
      window.removeEventListener('message', _message);
    };
  });
  
  return (
    <DragNDrop
      className="slider"
      onDrop={files => {
        if (files.length > 0) {
          setFile(files[0]);
        } else {
          setFile(null);
        }
        setSource('file');
      }}
    >
    {mintMenuStep === 3 ?
      <ShaderToyRenderer
        
      />
    : null}
    {/* <div className="left-bar" /> */}
    <div
      className="contents"
    >
      <div className={`wrap-slider step-${mintMenuStep}`}>
        <div className="preview-background step-2-only" />
        <div className="wrap step-2-only">
          <div className="main">
            <div className="preview">
              <div className="border">
                <div className="label">Preview</div>
              
                {/* <div className="preview-header-wrap">
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
                </div> */}
                {(hash && ext) ?
                  <PreviewIframe
                    hash={hash}
                    ext={ext}
                    loaded={loaded}
                  />
                : null}
                <div className={`iframe-placeholder ${loaded ? 'loaded' : ''}`}>
                  <div className="h1">Loading preview...</div>
                  <ProgressBar
                    value={mintProgress}
                  />
                </div>
              </div>
            </div>
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
                <div className="row red">
                  <div className="label">Minting fee</div>
                  <div className="minus">-</div>
                  <img src="/curve.svg" />
                  <div className="value">10</div>
                </div>
                <div className="row">
                  <div className="line" />
                </div>
                <div className="row">
                  <div className="label">New balance</div>
                  <img src="/curve.svg" />
                  <div className="value">1327</div>
                </div>
                <div className="buttons">
                  <input className="ok" type="button" value="Confirm" onChange={e => {}} onClick={e => {
                    setMintMenuStep(3);
                  }} />
                  <input className="cancel" type="button" value="Reject" onChange={e => {}} onClick={e => {
                    setMintMenuStep(1);
                    setHash('');
                    setExt('');
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="progress-subpage wrap step-3-only">
          <div
            className="progress-subpage-wrap"
            style={{
              transform: `translate3D(${jitter[0].toFixed(8)}px, ${jitter[1].toFixed(8)}px, 0px)`,
            }}
          >
            <div className="h1">
              <div onClick={e => {
                setMintMenuStep(2);
              }}>Minting...</div>
              <div onClick={e => {
                setMintMenuStep(4);
              }}>{Math.floor(mintProgress * 100)}%</div>
            </div>
            <ProgressBar
              value={mintProgress}
            />
          </div>
        </div>
        <div className="progress-subpage wrap step-4-only">
          <div
            className="deed-subpage-wrap"
          >
            <User
              label="minter"
              userName={userName}
              address={address}
              avatarPreview={avatarPreview}
            />
            <Link href={`/accounts/${address}`}>
              <a>
                <input type="button" value="View in inventory" onChange={e => {}}/>
              </a>
            </Link>
            <Link href={`/assets/${tokenId}`}>
              <a className={`item`}>
                <FakeCard
                  animate={true}
                  animationSize="large"
                />
              </a>
            </Link>
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
            file={file}
            setFile={setFile}
            url={url}
            setUrl={setUrl}
            source={source}
            setSource={setSource}
            hash={hash}
            ext={ext}
            handleLoadFile={handleLoadFile}
            handleLoadUrl={handleLoadUrl}
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
              {templates.map(([name, imgSrc, srcUrl], i) => {
                const locked = !srcUrl;
                return (
                  <div className={`tab-wrap ${locked ? 'locked' : ''}`} onClick={e => _setSelectedTab(name)} key={i}>
                    <div
                      className={`tab ${selectedTab === name ? 'selected' : ''}`}
                    >
                      <img src={imgSrc} />
                      <span>{name}</span>
                      {locked ?
                        <img className="lock-icon" src="/lock.svg" />
                      : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text"></div>
          </div>
        </div>
      </div>
    </div>
  </DragNDrop>
  );
};

const Lhs = ({
  className,
  name,
  setName,
  description,
  setDescription,
  quantity,
  setQuantity,
  file,
  setFile,
  mintMenuOpen,
  helpOpen,
  setHelpOpen,
  mintMenuStep,
  setMintMenuStep,
  url,
  setUrl,
  source,
  setSource,
  hash,
  ext,
  handleLoadFile,
  handleLoadUrl,
}) => {
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
          file={file}
          setFile={setFile}
          mintMenuStep={mintMenuStep}
          setMintMenuStep={setMintMenuStep}
          url={url}
          setUrl={setUrl}
          source={source}
          setSource={setSource}
          handleLoadFile={handleLoadFile}
          handleLoadUrl={handleLoadUrl}
        />
      </div>
    </div>
  );
};

export default Minter;
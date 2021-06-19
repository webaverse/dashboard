import React, { Component, Fragment, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from 'next/router';
import axios from 'axios';
// import {getTokens} from "../functions/UIStateFunctions.js";
import {mintNft} from "../functions/AssetFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import ProgressBar from "../components/ProgressBar";
// import AssetCard3D from "../components/Card3D";
import AssetCardSwitch from "../components/CardSwitch";
import ViewSwitch from "../components/ViewSwitch";
// import Asset from "../components/Asset";
import User from "../components/User";
import ShaderToyRenderer from "../components/ShaderToyRenderer";
import FileInput from "../components/FileInput";
import {makeWbn, makeBin, makePhysicsBake} from "../webaverse/build";
import {blobToFile, getExt, parseQuery, schedulePerFrame} from "../webaverse/util";
import {useAppContext} from "../libs/contextLib";
import {storageHost, appPreviewHost, cardsHost} from "../webaverse/constants";
import JSZip from '../webaverse/jszip.js';

const nftTypeDescriptions = {
  image: `Image NFT lets you store visual art on the blockchain. They are represented as planes in the virtual world.`,
  gif: `Gif NFT lets you store animated visual art on the blockchain. They are represented as animated planes in the virtual world.`,
  video: `Video NFT lets you store video clips on the blockchain. They are represented as screens in the virtual world.`,
  audio: `Audio NFT lets you store audio compositions on the blockchain. They are represented as audio nodes in the virtual world.`,
  avatar: `Avatar NFT lets you create VRM avatars on the blockchain. They can be worn in the virtual world.`,
  model: `Model NFT lets you create 3D virtual objects on the blockchain. They can be pulled out of your inventory in the virtual world.`,
  html: `HTML NFT lets you create web sites on the blockchain. They are represented as screens in the virtual world.`,
  wearable: `Wearable NFT lets you create digital fashion on the blockchain. They can be worn by your avatar in the virtual world.`,
  pet: `Pet NFT lets you create virtual pets on the blockchain. They can be interacted with in the virtual world.`,
  scene: `Scene NFT lets you create digital scenes on the blockchain. They can be visited in the virtual world.`,
  vehicle: `Vehicle NFT lets you create virtual vehicles on the blockchain. They can be ridden in the virtual world.`,
};
const templates = [
  ['image', '/image.svg', '/soundwaves54.jpg'],
  ['gif', '/gif.svg', '/rainbow-dash.gif'],
  ['video', '/video.svg', '/Neon1280.mp4'],
  ['audio', '/audio.svg', '/Chill1.mp3'],
  ['avatar', '/avatar.svg', '/Default Bot (2).vrm'],
  ['model', '/sword.svg', 'backpack_v1.glb'],
  ['html', '/html.svg', 'https://github.com/hicetnunc2000/hicetnunc/tree/main/templates/html-three-template'],
  ['wearable', '/chain-mail.svg', null],
  ['pet', '/rabbit.svg', null],
  ['scene', '/road.svg', null],
  ['vehicle', '/scooter.svg', null],
];

const urlToRepoSpec = url => {
  // console.log('check url', url);
  const u = new URL(url, window.location.href);
  const match = u.pathname.match(/^\/(.+?)\/(.+?)\/(tree|blob)\/([^\/]+)(\/.*)?$/);
  // console.log('match pathname', [url, u.pathname, match]);
  if (match) {
    const username = match[1]; 
    const reponame = match[2];
    const type = match[3];
    const branchname = match[4];
    const tail = match[5];
    
    return {
      username,
      reponame,
      type,
      branchname,
      tail,
    };
  } else {
    return null;
  }
};
const urlToRepoZipUrl = url => {
  const spec = urlToRepoSpec(url);
  if (spec) {
    const {
      username,
      reponame,
      branchname,
      tail,
    } = spec;
    return  `https://http-github-com.proxy.exokit.org/${username}/${reponame}/archive/${branchname}.zip`;;
  } else {
    return spec;
  }
};

const FakeCard = ({animate, animationSize, onClick}) => {
  const [translation, setTranslation] = useState([0, 0, 0]);
  const [perspective, setPerspective] = useState([0, 0]);
  const [transitioning, setTransitioning ] = useState(false);
  const [filter, setFilter] = useState('');
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [lastHue, setLastHue] = useState(0);
  
  const flip = false;
  const tilt = true;
  const cardSize = 'large';
  const cardSpecHighlight = null;
  
  {
    let frame = null;
    let lastHue = 0;
    let lastTimestamp = 0;
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
        
        const now = Date.now();
        const timeDiff = now - lastTimestamp;
        setFilter(`sepia(10%) hue-rotate(${lastHue}deg)`);
        lastTimestamp = now;
        lastHue = (lastHue + timeDiff * 1) % 360;
        
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
              filter,
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

const transferableTexts = {
  false: `Personal token to show off your stuff. Cannot be sold.`,
  true: `Transferable token that you can trade and sell.`,
};
const Form = ({
  mintMenuOpen,
  name,
  setName,
  description,
  setDescription,
  quantity,
  setQuantity,
  transferable,
  setTransferable,
  file,
  setFile,
  mintMenuStep,
  setMintMenuStep,
  url,
  setUrl,
  source,
  setSource,
  selectedTab,
  setSelectedTab,
  handleLoadFile,
  handleLoadUrl,
  setHash,
  setExt,
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
  
  const enabled = (source === 'file' && !!file) || (source === 'url' && !! url);
  
  return (
    <form className={`form`} onSubmit={e => {
      e.preventDefault();
      setMintMenuStep(2);
    }}>
      <div className="label">Name</div>
      <input type="text" placeholder="Name" value={name} onChange={e => {
        setName(e.target.value);
      }} ref={el => {
        nameEl = el;
      }} />
      <div className="label">Description</div>
      <textarea value={description} onChange={e => {
        setDescription(e.target.value);
      }} placeholder="Description" />
      <div className="label">Transferable</div>
      <div className={`fat-radio ${transferable ? 'on' : 'off'}`}
        onClick={e => {
          setTransferable(!transferable);
        }}
      >
        <div className="nub" />
      </div>
      <div className="sublabel">{transferableTexts[transferable]}</div>
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
          (<FileInput
            file={file}
            setFile={setFile}
            key="file2"
          />),
          (!file ?
            <div className="sublabel" key="file3">(or, drag-and-drop a file)</div>
          :
            null
          ),
        ]
      :
        [
          (<div className="label" key="file4">URL</div>),
          (<input type="text" placeholder="https://" value={url} onChange={e => {
            // console.log('url change', e);
            setUrl(e.target.value);
          }} ref={el => {
            urlEl = el;
          }} key="file5" />),
        ]
      }
      <div className="label">Quantity</div>
      <input type="number" placeholder="Quantity" value={quantity} onChange={e => {
        setQuantity(e.target.value);
      }} min={1} step={1} />
      <input className={enabled ? '' : 'disabled'} type="button" value="Preview NFT" onChange={e => {}} disabled={!enabled} onClick={e => {
        setMintMenuStep(2);
        setSelectedTab('');
        setHash('');
        setExt('');
        
        if (source === 'file' && file) {
          handleLoadFile(file);
        } else if (source === 'url' && url) {
          handleLoadUrl(url);
        }
        
        
      }} />
    </form>
  );
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

const CardIframe = ({
  t,
  w,
  name,
  description,
  image,
  minterUsername,
  minterAvatarPreview,
}) => {
  if (t) {
    const width = w;
    const height = Math.floor(width / 2.5 * 3.5);
    let src = `${cardsHost}/?`;
    let first = true;
    const qs = {
      t,
      w,
      name,
      description,
      image,
      minterUsername,
      minterAvatarPreview,
    };
    for (const k in qs) {
      const v = qs[k];
      if (v !== undefined) {
        if (first) {
          first = false;
        } else {
          src += '&';
        }
        src += `${k}=${v}`;
      }
    }
    return (
      <iframe
        width={width}
        height={height}
        src={src}
      />
    );
  } else {
    return null;
  }
};

const Minter = ({
  // mintMenuOpen,
  // setMintMenuOpen,
  selectedTab,
  setSelectedTab,
  loading,
  setLoading,
  animate,
}) => {
  const defaultSelectedView = '3d';
  
  const {globalState, setGlobalState} = useAppContext();
  const [helpOpen, setHelpOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [transferable, setTransferable] = useState(false);
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
  const [id, setId] = useState(Math.floor(Math.random() * 1000));
  const [mintedTokenId, setMintedTokenId] = useState(0);
  const [previewError, setPreviewError] = useState('');
  const [mintError, setMintError] = useState('');
  const [mintMenuOpen, setMintMenuOpen] = useState(!animate);
  const [mintMenuStep, setMintMenuStep] = useState(1);
  const [selectedView, setSelectedView] = useState(defaultSelectedView);
  
  // console.log('render hash', hash, ext);
  
  const router = useRouter();
  useEffect(() => {
    const match = router.asPath.match(/(\?.+)$/);
    if (match) {
      const q = parseQuery(match[1]);
      const {hash, ext} = q;
      console.log('loaded hash ext', {hash, ext});
      setLoaded(true);
      setHash(hash);
      setExt(ext);
      setMintMenuStep(2);
      // const url = `${storageHost}/ipfs/${hash}`;
      // await handleLoadUrl(url);
    }
  }, [router.asPath]);
  
  useEffect(() => {
    if (animate && !mintMenuOpen) {
      requestAnimationFrame(() => {
        setMintMenuOpen(true);
      });
    }
  }, [animate, mintMenuOpen]);
  
  const handleLoadFile = async file => {
    /* if (!file.originalName) {
      debugger;
    } */

    console.log('load file 1');
    const spec = urlToRepoSpec(file.originalName);
    // console.log('load file name', file.name, file.originalName, spec);
    if (!spec) {
      console.warn('no spec', file.name, file.originalName, spec);
    }
    
    setLoading(true);
    setLoaded(false);
    setHash('');
    setExt('');
    
    let tail = '', tailName = '';
    if (spec) {
      if (spec.type === 'tree') {
        tail = spec.tail;
        tailName = '';
      } else {
        const match = spec.tail.match(/^(.*)\/([^\/\.]*\.[^\/]*)$/, '$1');
        tail = match[1];
        tailName = match[2];
      }
    }
    
    const startableFileRegexes = [
      tailName,
      /(?:manifest.json|index\.html)$/,
      /(?:\.vrm|\.glb|\.vox|\.html)$/,
    ];
    const _getStartableFileRegexIndex = n => {
      for (let i = 0; i < startableFileRegexes.length; i++) {
        const r = startableFileRegexes[i];
        if (
          (typeof r === 'string' && n === r) ||
          (typeof r === 'object' && r.test(n))
        ) {
          return i;
        }
      }
      return Infinity;
    };

    console.log('load file 2', {tail, tailName});

    const fileExt = getExt(file.name);
    if (fileExt === 'zip') {
      console.log('load file 3');
      const zip = await JSZip.loadAsync(file);
      console.log('load file 4', zip.files);
      
      const fileNames = [];
      const startableFileNames = [];
      const isDirectoryName = fileName => /\/$/.test(fileName);
      const filePredicate = tail ? fileName => {
        const match = fileName.match(/^([^\/]+)(\/.*)$/);
        const rootName = match[1];
        const pathName = match[2];
        return pathName.startsWith(tail);
      } : () => true;
      console.log('load file 5');
      const localFileNames = {};
      for (const fileName in zip.files) {
        if (filePredicate(fileName)) {
          fileNames.push(fileName);
          
          let basename = fileName
            .replace(/^[^\/]*\/(.*)$/, '$1')
            .slice(tail.length);
          localFileNames[fileName] = basename;
          
          if (isFinite(_getStartableFileRegexIndex(basename))) {
            startableFileNames.push(fileName);
          }
        }
      }
      startableFileNames.sort((a, b) => {
        return _getStartableFileRegexIndex(localFileNames[a]) - _getStartableFileRegexIndex(localFileNames[b]);
      });
      console.log('load file 6', [tailName, localFileNames, Object.keys(zip.files), startableFileNames, _getStartableFileRegexIndex('portal-forest.html')]);
      console.log('load file 7');
      
      console.log('got spec', spec);
      
      if (startableFileNames.length > 0) {
        const startableFileLocalUrls = startableFileNames.map(u => localFileNames[u]);
        console.log('got urls', startableFileLocalUrls);
        let startFileLocalUrl = startableFileLocalUrls[0]; // `hicetnunc-main/templates/html-three-template`;
        let newExt = getExt(startFileLocalUrl);
        if (startFileLocalUrl === 'index.html') {
          startFileLocalUrl = '';
        }
        if (startFileLocalUrl === '') {
          newExt = 'html';
        }
        const startDirectoryUrl = startFileLocalUrl.replace(/^[^\/]*\/?/, '');
        
        console.log('got start url', {localFileNames, startableFileLocalUrls, startFileLocalUrl, startDirectoryUrl});
        
        console.log('load file 8');
        let files = await Promise.all(fileNames.map(async fileName => {
          if (fileName.startsWith(startDirectoryUrl)) {
            const file = zip.file(fileName);
            
            const b = file && await file.async('blob');
            return {
              name: fileName,
              data: b,
            };
          } else {
            return null;
          }
        }));
        files = files.filter(f => !!f);
        console.log('load file 9');
        console.log('got r', files);
        
        const fd = new FormData();
        let hasRootDirectory = false;
        for (const file of files) {
          const {name} = file;
          const basename = localFileNames[name];
          console.log('append', basename, name);
          if (isDirectoryName(name)) {
            fd.append(
              name,
              new Blob([], {
                type: 'application/x-directory',
              }),
              basename
            );
            if (basename === '') {
              hasRootDirectory = true;
            }
          } else {
            fd.append(name, file.data, basename);
          }
        }
        console.log('load file 10', {fileNames, startDirectoryUrl, localFileNames, startableFileNames, startableFileLocalUrls, startFileLocalUrl});
        
        // console.log('got form data', fd);
        const r = await axios({
          method: 'post',
          url: storageHost,
          data: fd,
        });
        const {data} = r;
        
        console.log('load file 11');
        
        const _getStartFile = () => data.find(e => e.name === startFileLocalUrl);
        let startFile = _getStartFile();
        let {name, hash: newHash} = startFile;
        /* if (!startFile) {
          if (startFileLocalUrl === '') {
          } else {
            console.warn('could not find start file');
          }
        } */
        
        console.log('load file 12', {data, startFile, newHash, newExt});
        
        const rootFile = data.find(f => f.name === '');
        if (rootFile && name !== '') {
          newHash = `${rootFile.hash}/${name}`;
        }
        
        console.log('got result', {data, startFile, newHash, newExt});
        setHash(newHash);
        setExt(newExt);
        
        console.log('load file 13');
      } else {
        throw new Error('zip does not contain runnable file!');
      }
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
  const handleLoadUrl = async (url, originalUrl = url) => {
    setLoaded(false);
    setHash('');
    setExt('');
    
    const repoZipUrl = urlToRepoZipUrl(url);
    if (repoZipUrl) {
      await handleLoadUrl(repoZipUrl, url);
    } else {
      console.log('load url 1', url);
      const res = await fetch(url);
      console.log('load url 2', url);
      const b = await res.blob();
      console.log('load url 3', url, b.size);
      b.name = url;
      b.originalName = originalUrl;
      await handleLoadFile(b);
      console.log('load url 4', url, b.size);
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
      await handleLoadUrl(repoZipUrl, url);
    } else {
      await handleLoadUrl(url);
    }
  };
  const _setSelectedTab = newTab => {
    setSelectedTab(newTab);
    setMintMenuStep(2);
    setSelectedView(defaultSelectedView);
    handleLoadTemplate(newTab);
  };
  const selectedTabDefaulted = selectedTab || ext || 'image';

  const _updateMintProgress = () => {
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
        setMintProgress(Date.now() % 1000 / 1000);
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
  _updateMintProgress();
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
  
  const _mint = async () => {
    setMintError('');
    
    try {
      // const quantity = 1000000;
      const tokenIds = await mintNft(hash, name, ext, description, quantity, globalState);
      const [tokenId] = tokenIds;
      // console.log('got token ids', tokenIds);
      setMintedTokenId(tokenId);
    } catch (err) {
      setMintError(err.stack);
      console.warn(err);
    } finally {
      setMintMenuStep(4);
    }
  };
  // console.log('got global state', globalState);
  const {
    name: userName,
    address,
    avatarPreview,
  } = globalState;

  useEffect(() => {
    const _message = e => {
      const j = e.data;
      // console.log('got message', j);
      if (j && typeof j === 'object' && !Array.isArray(j)) {
        const {_preview, ok} = j;

        if (_preview) {
          if (ok) {
            setPreviewError('');
          } else {
            const err = new Error('preview not ok');
            setPreviewError(err.stack);
          }
          setLoaded(true);
        }
      }
    };
    window.addEventListener('message', _message);
    
    return () => {
      window.removeEventListener('message', _message);
    };
  });
  
  // console.log('got global state', globalState);
  
  const image = (hash && ext) ? `https://preview.exokit.org/${hash}.${ext}/preview.png` : '';
  const minterUsername = globalState.name;
  const minterAvatarPreview = globalState.avatarPreview;
  
  return (
    <DragNDrop
      className={`slider ${mintMenuOpen ? 'open' : ''}`}
      onDrop={files => {
        if (files.length > 0) {
          setFile(files[0]);
        } else {
          setFile(null);
        }
        setSource('file');
      }}
    >
    <div className="hero">
      
    </div>
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

                <ViewSwitch
                  selectedView={selectedView}
                  setSelectedView={setSelectedView}
                />

                {(hash && ext) ?
                  <AssetCardSwitch
                    id={id}
                    hash={hash}
                    ext={ext}
                    assetName={name}
                    description={description}
                    image={image}
                    minterUsername={minterUsername}
                    minterAvatarPreview={minterAvatarPreview}
                    selectedView={selectedView}
                    open={true}
                    cardSize="large"
                    nocache={1}
                  />
                : null}
                {/* <div className={`iframe-placeholder ${loaded ? 'loaded' : ''}`}>
                  <div className="h1">Loading preview...</div>
                  <ProgressBar />
                </div> */}
                {(loaded && previewError) ?
                  <div className={`iframe-placeholder`}>
                    <div className="h1">No preview available :'(</div>
                  </div>
                : null}
              </div>
            </div>
            <div className="rrhs">
              <div className="h1">{selectedTabDefaulted} NFT</div>
              <div className="description">{nftTypeDescriptions[selectedTabDefaulted]}</div>
              {(hash && ext) ?
                <div className="card-preview">
                  <CardIframe
                    t={id}
                    w={200}
                    name={name}
                    description={description}
                    image={image}
                    minterUsername={minterUsername}
                    minterAvatarPreview={minterAvatarPreview}
                  />
                </div>
              : null}
              <div className="infobox">
                <div className="h1">Mint with SILK</div>
                <div className="row">
                  <div className="label">SILK balance</div>
                  <img src="/curve.svg" />
                  <div className="value">{Number(globalState.balance).toLocaleString()}</div>
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
                  <div className="value">{(globalState.balance - 10).toLocaleString()}</div>
                </div>
                <div className="buttons">
                  <input className="button ok" type="button" value="Confirm" disabled={!(hash && ext && loaded)} onChange={e => {}} onClick={async e => {
                    setMintMenuStep(3);
                    _mint();
                  }} />
                  <input className="button cancel" type="button" value="Reject" onChange={e => {}} onClick={e => {
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
          <div className={`deed-subpage-wrap ${mintError ? 'error' : ''}`}>
            <User
              label={!mintError ? 'minter' : 'status: sad'}
              userName={userName}
              address={address}
              avatarPreview={avatarPreview}
            />
            {!mintError ?
              <Fragment>
                <Link href={`/accounts/${address}`}>
                  <a>
                    <input type="button" value="View in inventory" onChange={e => {}}/>
                  </a>
                </Link>
                <Link href={`/assets/${mintedTokenId}`}>
                  <a className={`item`}>
                    <CardIframe
                      t={mintedTokenId}
                      w={300}
                      name={name}
                      description={description}
                      image={image}
                      minterUsername={minterUsername}
                      minterAvatarPreview={minterAvatarPreview}
                    />
                    {/* <FakeCard
                      animate={true}
                      animationSize="large"
                    /> */}
                  </a>
                </Link>
              </Fragment>
            :
              <Fragment>
                <div className="h1">Error minting :|</div>
                <Link href="/mint">
                  <a>
                    <input type="button" value="Try again" onChange={e => {}} onClick={e => {
                      e.preventDefault();
                      setMintMenuStep(1);
                    }} />
                  </a>
                </Link>
                <div className="error-text">{mintError}</div>
              </Fragment>
            }
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
            transferable={transferable}
            setTransferable={setTransferable}
            quantity={quantity}
            setQuantity={setQuantity}
            file={file}
            setFile={setFile}
            url={url}
            setUrl={setUrl}
            source={source}
            setSource={setSource}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            hash={hash}
            setHash={setHash}
            ext={ext}
            setExt={setExt}
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
  transferable,
  setTransferable,
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
  selectedTab,
  setSelectedTab,
  hash,
  setHash,
  ext,
  setExt,
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
          transferable={transferable}
          setTransferable={setTransferable}
          file={file}
          setFile={setFile}
          mintMenuStep={mintMenuStep}
          setMintMenuStep={setMintMenuStep}
          url={url}
          setUrl={setUrl}
          source={source}
          setSource={setSource}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          handleLoadFile={handleLoadFile}
          handleLoadUrl={handleLoadUrl}
          setHash={setHash}
          setExt={setExt}
        />
      </div>
    </div>
  );
};

export default Minter;
import React, {Fragment, useState, useEffect} from 'react';
import {appPreviewHost} from '../webaverse/constants';
import AssetCardSvg from './CardSvg.js';
import User from './User.js';
import ProgressBar from './ProgressBar.js';

const Card3D = props => {
  const {
    id,
    assetName,
    description,
    hash,
    ext,
    ownerUsername,
    ownerAddress,
    ownerAvatarPreview,
    // loaded,
    cardSize,
    open,
    nonce,
    onClick,
  } = props;
  
  // const [open, setOpen] = useState(false);
  // const [locked, setLocked] = useState(!open);
  const [loaded, setLoaded] = useState(false);
  
  // console.log('card 3d', {open, locked});

  const qs = {
    id,
    hash,
    ext,
    nonce,
  };
  let src = `${appPreviewHost}?`;
  let first = true;
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
  
  /* useEffect(() => {
    if (!locked) {
      setLocked(true);
    }
    if (loaded) {
      setLoaded(false);
    }
  }, [locked, loaded]); */
  
  const makeLoaded = () => !loaded ? (
    <div className="progress-bar-wrap">
      <ProgressBar />
    </div>
  ) : null;
  const makeIframe = () => (<iframe
    // className={`iframe ${loaded ? 'loaded' : ''} ${locked ? 'locked' : ''}`}
    className={`iframe ${loaded ? 'loaded' : ''}`}
    src={src}
    allow="xr-spatial-tracking"
    // src={src.replace('app.webaverse.com', 'app.webaverse.com:3001')}
    onLoad={e => {
      console.log('iframe onload', e);
      setLoaded(true);
    }}
    onError={e => {
      console.warn('iframe onerror', e);
      setLoaded(true);
    }}
  />);
  
  /* if (open) {
    console.log('got prop', props);
  } */

  return <div
    className={`content-preview-3d`}
    /* onClick={e => {
      if (locked) {
        setLocked(false);
      }
    }} */
  >
    {cardSize === 'small' ? (
      <Fragment>
        {makeLoaded()}
        {makeIframe()}
        <div className="card-sub-wrap">
          <div className="top">
            <div className="name">{assetName}</div>
            <div className="description">{description}</div>
            <User
              label="owner"
              userName={ownerUsername}
              address={ownerAddress}
              avatarPreview={ownerAvatarPreview}
            />
            {/* <AssetCardSvg
              {...props}
              tilt={false}
            /> */}
          </div>
          {/* <div className="bottom">
            <div className="spawn-button">
              <video className="video" src="https://preview.exokit.org/[https://webaverse.github.io/assets/sacks3.vrm]/preview.webm" muted autoPlay loop />
              <div className="label">Spawn</div>
            </div>
          </div> */}
        </div>
      </Fragment>
    ) : (
      <Fragment>
        {makeLoaded()}
        {makeIframe()}
      </Fragment>
    )}
  </div>
};
export default Card3D;
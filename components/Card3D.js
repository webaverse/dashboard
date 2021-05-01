import React, {Fragment, useState, useEffect} from 'react';
// import { createPortal } from 'react-dom'
import {appPreviewHost} from '../webaverse/constants';
import AssetCardSvg from './CardSvg.js';
import User from './User.js';
import ProgressBar from './ProgressBar.js';

/* export const IFrame = ({
  children,
  ...props
}) => {
  const [contentRef, setContentRef] = useState(null)
  const mountNode =
    contentRef?.contentWindow?.document?.body

  return (
    <iframe {...props} ref={el => {
      setContentRef(el);
      el.addEventListener('load', e => {
        console.log('got load', e);
        props.onLoad(e);
      });
      el.addEventListener('load', err => {
        props.onError(err);
        console.log('got load', err);
      });
    }}>
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  )
}; */

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
    onClick,
  } = props;
  
  // const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const qs = {
    id,
    hash,
    ext,
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
  
  useEffect(() => {
    if (!open) {
      if (!locked) {
        setLocked(true);
      }
      if (loaded) {
        setLoaded(false);
      }
    }
  }, [open, locked, loaded]);
  
  const makeLoaded = () => !loaded ? (
    <div className="progress-bar-wrap">
      <ProgressBar />
    </div>
  ) : null;
  const makeIframe = () => (<iframe
    className={`iframe ${loaded ? 'loaded' : ''} ${(open && locked) ? 'locked' : ''}`}
    src={src}
    onLoad={e => {
      console.log('iframe onload', e);
      setLoaded(true);
    }}
    onError={e => {
      console.warn(e);
      setLoaded(true);
    }}
  />);
  
  /* if (open) {
    console.log('got prop', props);
  } */

  return <div
    className={`content-preview-3d`}
    onClick={e => {
      if (locked) {
        setLocked(false);
      }
    }}
  >
    {cardSize === 'small' ? (
      <Fragment>
        {!open ? (
          <div
            className="iframe-placeholder"
            onClick={e => {
              if (locked) {
                setLocked(false);
              }
            }}
          >Scroll to load</div>
        ) : (
          <Fragment>
            {makeLoaded()}
            {makeIframe()}
          </Fragment>
        )}
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
          <div className="bottom">
            <div className="spawn-button">
              <video className="video" src="https://preview.exokit.org/[https://webaverse.github.io/assets/sacks3.vrm]/preview.webm" muted autoPlay loop />
              <div className="label">Spawn</div>
            </div>
          </div>
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
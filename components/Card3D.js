import React, {useState, useEffect} from 'react';
import {appPreviewHost} from '../webaverse/constants';
import AssetCardSvg from './CardSvg.js';

const Card3D = props => {
  const {
    id,
    hash,
    ext,
    loaded,
    cardSize,
    onClick,
  } = props;
  
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(true);
  
  // `{storageHost}/ipfs/${hash}`
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
  
  /* const onWheel = e => {
    console.log('got wheel event', e);
  };
  useEffect(() => {
    window.addEventListener('wheel', onWheel);
    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }); */
  
  const MainIframe = () => <iframe
    className={`iframe ${loaded ? 'loaded' : ''} ${locked ? 'locked' : ''}`}
    src={src}
  />;
  
  return (cardSize === 'small' ?
    <div className={`content-preview-3d ${onClick ? 'clickable' : ''}`} onClick={e => {
      if (!open) {
        setOpen(true);
      } else if (locked) {
        setLocked(false);
      }
    }} >
      {!open ?
        <div
          className="iframe-placeholder"
        />
      : 
        <MainIframe />
      }
      <div className="card-sub-wrap">
        <div className="top">
          <AssetCardSvg
            {...props}
            tilt={false}
          />
        </div>
        <div className="bottom">
        </div>
      </div>
    </div>
  :
    <MainIframe />
  );
};
export default Card3D;
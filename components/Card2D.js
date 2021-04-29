import React, {Fragment, useState} from "react";
// import procgen, {types} from '../webaverse/procgen.js';
import User from './User';

const Card2D = ({
  id,
  assetName,
  description,
  image,
  hash,
  animation_url,
  ext,
  totalSupply,
  minterAvatarPreview,
  minterUsername,
  minterAddress,
  cardSize,
  isMainnet,
  isPolygon,
  glow,
  imageView,
  // cardSvgSource,
}) => {
  const [perspective, setPerspective] = useState([false, false]);
  const [flip, setFlip] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [boundingBox, setBoundingBox] = useState(null);
  const [dimensions, setDimensions] = useState(null);

  const _loadDimensions = el => {
    const {naturalWidth, naturalHeight} = el;
    if (!dimensions || dimensions[0] !== naturalWidth || dimensions[1] !== naturalHeight) {
      setDimensions([naturalWidth, naturalHeight]);
    }
  };
  const _cancelDragStart = e => {
    e.preventDefault();
  };
  
  // render gifs as gifs
  image = image.replace(/\.gif\/preview\.png$/, '.gif/preview.gif');
  
  return (
    <div className={`content-preview-2d ${cardSize}`}>
      <img
        className="image"
        src={image}
        onDragStart={_cancelDragStart}
        onDoubleClick={e => {
          e.target.requestFullscreen();
        }}
        ref={async el => {
          if (el) {
            if (!el.complete) {
              await new Promise((accept, reject) => {
                el.addEventListener('load', e => {
                  accept();
                });
                el.addEventListener('error', err => {
                  reject(err);
                });
              });
            }
            _loadDimensions(el);
          }
        }}
        style={dimensions ? {
          maxWidth: dimensions[0],
          maxHeight: dimensions[1],
        } : null}
      />
      {cardSize === 'small' ?
        <Fragment>
          <User
            label="creator"
            userName={minterUsername}
            address={minterAddress}
            avatarPreview={minterAvatarPreview}
          />
          <div className="filename">{assetName}</div>
          <div className="ext">{ext}</div>
        </Fragment>
      : null}
    </div>
  );
};
export default Card2D;
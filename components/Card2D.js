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
  onClick,
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
    <div
      className={`content-preview-2d ${cardSize} ${onClick ? 'clickable' : ''}`}
      onClick={e => {
          onClick && onClick(e);
        }}
    >
      <img
        className="image"
        src={image}
        onDragStart={_cancelDragStart}
        onDoubleClick={e => {
          e.target.requestFullscreen();
        }}
      />
      {cardSize === 'small' ?
        <div className="card-sub-wrap">
          <User
            label="minter"
            userName={minterUsername}
            address={minterAddress}
            avatarPreview={minterAvatarPreview}
          />
          <div className="card-sub">
            <div className="filename">{assetName}</div>
            <div className="ext">{ext}</div>
          </div>
        </div>
      : null}
    </div>
  );
};
export default Card2D;
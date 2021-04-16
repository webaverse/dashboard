import React, {useState} from "react";
// import procgen, {types} from '../webaverse/procgen.js';

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
  
    /* let video = false;
    if (["webm", "mp4"].indexOf(ext) >= 0) {
        image = animation_url;
        video = true;
    } else if (ext === "gif") {
        image = animation_url;
    }

    let networkIcon;
    if (isMainnet) {
        networkIcon = "/icon-ethereum.svg";
    } else if(isPolygon) {
        networkIcon = "/icon-polygon.svg";
    } else {
        networkIcon = "/icon-webaverse.svg";
    }

    let extIcon;
    if (ext.toLowerCase() === "png") {
        extIcon = "/icon-jpg.svg";
    } else if (ext.toLowerCase() === "jpg" || ext.toLowerCase() === "jpeg") {
        extIcon = "/icon-jpg.svg";
    } else if (ext.toLowerCase() === "vrm") {
        extIcon = "/icon-vrm.svg";
    } else if (ext.toLowerCase() === "vox") {
        extIcon = "/icon-vrm.svg";
    } else if (ext.toLowerCase() === "wbn") {
        extIcon = "/icon-vrm.svg";
    } else if (ext.toLowerCase() === "glb") {
        extIcon = "/icon-glb.svg";
    } else if (ext.toLowerCase() === "gif") {
        extIcon = "/icon-gif.svg";
    }

    let rarity;
    if (totalSupply < 2) {
        rarity = "unique";
    } else if (totalSupply < 3) {
        rarity = "mythic";
    } else if (totalSupply < 8) {
        rarity = "legendary";
    } else if (totalSupply < 15) {
        rarity = "epic";
    } else if (totalSupply < 30) {
        rarity = "rare";
    } else if (totalSupply < 50) {
        rarity = "uncommon";
    } else if (totalSupply > 50) {
        rarity = "common";
    } */

    const _cancelDragStart = e => {
      e.preventDefault();
    };
    
    return (
      <img
        src={image}
        className="content-preview-2d"
        onDragStart={_cancelDragStart}
        onDoubleClick={e => {
          e.target.requestFullscreen();
        }}
        ref={el => {
          if (el) {
            const {naturalWidth, naturalHeight} = el;
            if (!dimensions || dimensions[0] !== naturalWidth || dimensions[1] !== naturalHeight) {
              setDimensions([naturalWidth, naturalHeight]);
            }
          }
        }}
        style={dimensions ? {
          maxWidth: dimensions[0],
          maxHeight: dimensions[1],
        } : null}
      />
    );
};
export default Card2D;
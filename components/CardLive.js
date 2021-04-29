import React, {useState} from "react";

const Card3D = ({
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
    onClick,
}) => {
    const [perspective, setPerspective] = useState([false, false]);
    const [flip, setFlip] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [boundingBox, setBoundingBox] = useState(null);
  
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

    return (
      <iframe
        className={`content-preview-live ${onClick ? 'clickable' : ''}`}
        src={"https://app.webaverse.com/?t=" + id}
      />
    );
};
export default Card3D;
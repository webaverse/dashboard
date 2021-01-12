import React from 'react';
//import './style.css';

export default ({
  id,
  assetName,
  description,
  image,
  hash,
  external_url,
  filename,
  buyPrice,
  ext,
  totalSupply,
  numberInEdition,
  balance,
  ownerAvatarPreview,
  ownerUsername,
  ownerAddress,
  minterAvatarPreview,
  minterAddress,
  minterUsername,
  cardSize,
  networkType,
  glow,
}) => {

  let networkIcon;
  if (networkType === "webaverse") {
    networkIcon = "/icon-webaverse.svg";
  } else if (networkType === "ethereum") {
    networkIcon = "/icon-ethereum.svg";
  }

  let extIcon;
  if (ext.toLowerCase() === "png") {
    extIcon = "/icon-jpg.svg";
  } else if (ext.toLowerCase() === "jpg" || ext.toLowerCase() === "jpeg") {
    extIcon = "/icon-jpg.svg";
  } else if (ext.toLowerCase() === "vrm") {
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
  }
  
  return (
      <div
        className={`card cardItem ${rarity} ${cardSize}`}
      >
        <div className={`${rarity} upperCardInfo upperCardInfo ${cardSize} upperCardInfo upperCardInfo_${(ext ?? "").replace('.','')}`}>
          <div className={`upperCardInfoLeft upperCardInfoLeft ${cardSize}`}>
            <span className={`cardAssetName cardName ${cardSize}`}>#{id} - {assetName}</span>
          </div>
          <div className={`upperCardInfoRight upperCardInfoRight ${cardSize}`}>
            <div className={`itemType ext ${cardSize} ext_${ext}`}>
              <img className={`itemTypeIcon itemTypeIcon ${cardSize}`} src={extIcon} />
              <span className={`itemTypeExt itemTypeExt ${cardSize}`}>.{ext}</span> 
            </div>
          </div>
        </div>
        <div className={`assetImage assetImage ${cardSize}`}><img src={image} /></div>
        <div className={`lowerCardInfo lowerCardInfo ${cardSize}`}>
          <div className={`lowerCardInfoTop ${rarity} lowerCardInfoTop ${cardSize} lowerCardInfoTop`}>
            <div className={`lowerCardInfoTopLeft lowerCardInfoTopLeft ${cardSize}`}>
              <div className={`lowerCardInfoTopLeftGroup`}>
                <span className={`creator creator ${cardSize}`}>
                  <span className={`creatorIcon creatorIcon tooltip ${cardSize}`}>
                    <img src={minterAvatarPreview.replace(/\.[^.]*$/, '.png')} />
                    <span className={`creatorName creatorName tooltiptext ${cardSize}`}>{minterUsername}</span>
                  </span>
                </span>
                <span className={`arrow-down arrow-down ${cardSize}`}></span>
              </div>
              <div className="lowerCardInfoTopClear"></div>
            </div>
            <span className={`greaseLoadedIntoAsset greaseLoadedIntoAsset ${cardSize}`}></span>
          </div>
          <div className={`lowerCardInfoMiddle lowerCardInfoMiddle ${cardSize}`}>
            <span className={`assetDescription assetDescription ${cardSize}`}>{description}</span>
          </div>
          <div className={`lowerCardInfoBottom lowerCardInfoBottom ${cardSize}`}>
            <span className={`assetHash assetHash ${cardSize}`}>{hash}</span>
          </div>
        </div>
      </div>
  );
};

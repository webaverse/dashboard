import React from 'react';


export default ({
  id,
  name,
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
  onClickFunction }) => {

  let networkIcon;
  if (networkType === "webaverse") {
    networkIcon = "/icon-webaverse.svg";
  } else if (networkType === "ethereum") {
    extIcon = "/icon-ethereum.svg";
  }

  let rarity;
//    rarity = "mythic";
    rarity = "legendary";
/*
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
*/

  let season;
  if (id < 100) {
    season = "Season 1: Genesis";
    image = "/defaulthomespace.svg";
    rarity = "weba";
  }

  
  return (
      <div
        className={`landCard cardItem ${rarity} ${glow ? "glow" : ""}`}
          onClick={onClickFunction}
      >
        <div className={`${rarity} upperCardInfo upperCardInfo ${cardSize} upperCardInfo upperCardInfo_${(ext ?? "").replace('.','')}`}>
          <div className={`upperCardInfoLeft upperCardInfoLeft ${cardSize}`}>
            <span className={`cardAssetName cardName ${cardSize}`}>{name}</span>
          </div>
          <div className={`upperCardInfoRight upperCardInfoRight ${cardSize}`}>
            <div className={`itemType ext ${cardSize} ext_${ext}`}>
              <span className={`itemTypeExt itemTypeExt ${cardSize}`}></span> 
            </div>
          </div>
        </div>
        <div className={`assetImage assetImage ${cardSize}`}><img src={image} /></div>
        <div className={`lowerCardInfo lowerCardInfo ${cardSize}`}>
          <div className={`lowerLandCardInfoTop ${rarity} lowerCardInfoTop ${cardSize} lowerCardInfoTop`}>
            <div className={`lowerCardInfoTopLeft lowerCardInfoTopLeft ${cardSize}`}>
              <div className="lowerCardInfoTopClear"></div>
            </div>
            <span className={`greaseLoadedIntoAsset greaseLoadedIntoAsset ${cardSize}`}>{`${buyPrice ? "岾 " + buyPrice : ""} ${buyPrice ? "FLUX" : ""}`}</span>
          </div>
        </div>
      </div>
  );
};

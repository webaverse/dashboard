import React, { useState } from 'react';

export default ({ fluxAmount, bonusAmount, costUsd, choosePack, forSale }) => {
  let blobImg;
  if (fluxAmount === "50") {
    blobImg = "/blob.png";
  } else if (fluxAmount === "100") {
    blobImg = "/blob2.png";
  } else if (fluxAmount === "280") {
    blobImg = "/blob3.png";
  } else if (fluxAmount === "500") {
    blobImg = "/blob4.png";
  } else if (fluxAmount === "1,350") {
    blobImg = "/blob5.png";
  }

  return (
    <div className="fluxPackContainer">
      { bonusAmount ?
        <div className="fluxPackBonusContainer">
          <div className="fluxPackBonusText">
            {bonusAmount}% BONUS!
          </div>
        </div>
      :
        null
      }
      <div className="fluxPackImageContainer">
        <img src={blobImg} className="fluxPackImage" />
      </div>
      <div className="fluxPackTextContainer">
        <div className={`fluxPackText fluxPackTextAmount`}>{fluxAmount}</div>
        <div className="fluxPackText">FLUX</div>
      </div>
      <div className={`fluxPackButtonContainer ${forSale ? "fluxPackForSale" : ""} noselect`} onClick={() => choosePack(fluxAmount.replace(/\,/g,''))}>
        <div className="fluxPackButton">{costUsd}</div>
      </div>
    </div>
  );
}

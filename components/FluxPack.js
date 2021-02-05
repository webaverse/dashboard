import React, { useState } from 'react';

export default ({ fluxAmount, bonusAmount, costUsd, choosePack, forSale }) => {

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
        <img className="fluxPackImage" src="/webaverse.png" />
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

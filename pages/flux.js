import React, { useState, useEffect } from 'react';
import Stripe from "../components/Stripe";
import FluxPack from "../components/FluxPack";

export default function Flux() {
  const [choosePack, setChoosePack] = useState(null);
  const [fluxAmount, setFluxAmount] = useState(null);
  const [bonusAmount, setBonusAmount] = useState(null);
  const [costUsd, setCostUsd] = useState(null);

  useEffect(() => {
    if (choosePack === "50") {
      setFluxAmount("50");
      setCostUsd("USD $4.99");
    } else if (choosePack === "100") {
      setFluxAmount("100");
      setCostUsd("USD $9.99");
    } else if (choosePack === "280") {
      setFluxAmount("280");
      setBonusAmount("12");
      setCostUsd("USD $24.99");
    } else if (choosePack === "500") {
      setFluxAmount("500");
      setBonusAmount("25");
      setCostUsd("USD $39.99");
    } else if (choosePack === "1350") {
      setFluxAmount("1350");
      setBonusAmount("35");
      setCostUsd("USD $99.99");
    }
  }, [choosePack]);

  return (
    <>
      { choosePack ?
        <>
          <div className="fluxPageContainer">
            <FluxPack fluxAmount={fluxAmount} bonusAmount={bonusAmount} costUsd={costUsd} />
          </div>
          <Stripe fluxAmount={choosePack} />
        </>
      :
        <>
          <h1 className="fluxTitle">FLUX</h1>
          <div className="fluxPageContainer">
            <FluxPack fluxAmount="50" costUsd="USD $4.99" choosePack={setChoosePack} forSale={true} />
            <FluxPack fluxAmount="100" costUsd="USD $9.99" choosePack={setChoosePack} forSale={true} />
            <FluxPack fluxAmount="280" bonusAmount="12" costUsd="USD $24.99" choosePack={setChoosePack} forSale={true} />
            <FluxPack fluxAmount="500" bonusAmount="25" costUsd="USD $39.99" choosePack={setChoosePack} forSale={true} />
            <FluxPack fluxAmount="1,350" bonusAmount="35" costUsd="USD $99.99" choosePack={setChoosePack} forSale={true} />
          </div>
        </>
      }
    </>
  )
}

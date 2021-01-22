import React, { useState, useEffect } from 'react'
import { useAppContext } from "../libs/contextLib";
import { getLands } from "../functions/UIStateFunctions.js";
import LandCardGrid from "../components/LandCardGrid";
import Loader from "../components/Loader";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [lands, setLands] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getLands(1, 100);
      setLands(data);
    })();
  }, []);

  return (
    <div className="container">
      { lands ?
        <LandCardGrid data={lands} globalState={globalState} />
      :
        <Loader loading={true} />
      }
    </div>
  )
}

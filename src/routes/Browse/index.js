import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getBooths } from "../../functions/UIStateFunctions.js";

import Loader from "../../components/Loader";
import CardGrid from "../../components/CardGrid";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [booths, setBooths] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const booths = await getBooths(0, globalState);
      setBooths(booths.booths[0]);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {[
        loading && (
        <Loader loading={loading} />),
        !loading && (
        <div className="profileBodyAssets">
          { booths && booths.length > 0? booths.map((seller, i) =>
            <CardGrid key={i} data={seller.entries} globalState={globalState} cardSize="" />
          ) : null}
        </div>)
      ]}
    </div>
  )
}

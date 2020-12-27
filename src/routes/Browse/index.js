import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getBooths } from "../../functions/UIStateFunctions.js";

import Loader from "../../components/Loader";
import Inventory from "../../components/Inventory";

export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [booths, setBooths] = useState(null);

  useEffect(() => {
    (async () => {
      const booths = await getBooths(0, globalState);
      setBooths(booths.booths[0]);
    })();
  }, []);

  const Sales = () => booths && booths.length > 0? booths.map((seller, i) =>
    <Inventory key={i} inventory={seller.entries} />
  ) : null

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Loader loading={booths && booths.length > 0 ? false : true} />
        <Sales />
      </Row>
    </Container>
  )
}

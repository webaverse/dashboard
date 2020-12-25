import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getCreators } from "../../functions/UIStateFunctions.js";
import Loader from "../../components/Loader";
import Inventory from "../../components/Inventory";


export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCreators(0, globalState).then(res => {
      setGlobalState(res);
      setLoading(false);
    });
  }, []);

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Loader loading={loading} />
        <Inventory inventory={globalState.creators[0]} />
      </Row>
    </Container>
  )
}

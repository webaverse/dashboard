import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getCreators } from "../../functions/UIStateFunctions.js";
import Loader from "../../components/Loader";
import Inventory from "../../components/Inventory";


export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [creatorProfiles, setCreatorProfiles] = useState(null);

  useEffect(() => {
    (async () => {
      const creators = await getCreators(0, globalState);

      if (creators.creators && creators.creators[0].length > 0) {
        setCreatorProfiles(creators.creators[0]);
      }
    })();
  }, []);


  return (
    <Row style={{ justifyContent: "center" }}>
      { creatorProfiles ?
        <Inventory inventory={creatorProfiles} />
      :
        <Loader loading={true} />
      }
    </Row>
  )
}

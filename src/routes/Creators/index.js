import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { getCreators } from "../../functions/UIStateFunctions.js";
import Loader from "../../components/Loader";
import AccountCards from "../../components/AccountCards";


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
    <div className="container">
      { creatorProfiles ?
        <AccountCards accounts={creatorProfiles} />
      :
        <Loader loading={true} />
      }
    </div>
  )
}

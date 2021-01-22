import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../libs/contextLib";
import { getCreators } from "../functions/UIStateFunctions.js";
import ProfileCards from "../components/ProfileCards";
import Loader from "../components/Loader";

export default ({ data }) => {
  const { globalState, setGlobalState } = useAppContext();
  const [creatorProfiles, setCreatorProfiles] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getCreators();
      setCreatorProfiles(data);
    })();
  }, []);

  return (
    <div className="container">
      { creatorProfiles ?
        <ProfileCards profiles={creatorProfiles} />
      :
        <Loader loading={true} />
      }
    </div>
  )
}

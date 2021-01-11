import React, { useState, useEffect } from 'react'
import { Container, Row } from 'react-grid-system';
import { useAppContext } from "../libs/contextLib";
import { getCreators } from "../functions/UIStateFunctions.js";
import ProfileCards from "../components/ProfileCards";


export default ({ data }) => {
  const { globalState, setGlobalState } = useAppContext();
  const [creatorProfiles, setCreatorProfiles] = useState(data);

  return (
    <div className="container">
      <ProfileCards profiles={creatorProfiles} />
    </div>
  )
}


export async function getServerSideProps() {
  const data = await getCreators();

  return { props: { data } }
}

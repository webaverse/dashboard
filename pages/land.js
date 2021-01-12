import React from 'react'
import { useAppContext } from "../libs/contextLib";
import { getLands } from "../functions/UIStateFunctions.js";
import CardGrid from "../components/LandCardGrid";

export default ({ data }) => {
  const { globalState, setGlobalState } = useAppContext();

  return <CardGrid data={data} globalState={globalState} />
}

export async function getServerSideProps() {
  const data = await getLands(1, 100);

  return { props: { data } }
}
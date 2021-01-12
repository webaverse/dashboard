import React from 'react'
import { useAppContext } from "../libs/contextLib";
import { getBooths } from "../functions/UIStateFunctions.js";
import CardGrid from "../components/CardGrid";

export default ({ data }) => {
  const { globalState, setGlobalState } = useAppContext();

  return <CardGrid data={data} globalState={globalState} />
}

export async function getServerSideProps() {
  const data = await getBooths(0);

  return { props: { data } }
}

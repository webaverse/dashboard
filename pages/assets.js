import React from 'react'
import { useAppContext } from "../libs/contextLib";
import { getTokens } from "../functions/UIStateFunctions.js";
import CardGrid from "../components/CardGrid";
import FilterSidebar from "../components/FilterSidebar";

export default ({ data }) => {
  const { globalState, setGlobalState } = useAppContext();

  return (
    <>
      <FilterSidebar />
      <div className="mainAssets">
        <CardGrid data={data} globalState={globalState} cardSize="small" />
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const data = await getTokens(1, 100);

  return { props: { data } }
}

import React from 'react'
import { useAppContext } from "../libs/contextLib";
import { getLands } from "../functions/UIStateFunctions.js";
import LandCardGrid from "../components/LandCardGrid";

export default ({ data }) => {
  const { globalState, setGlobalState } = useAppContext();

  return data && data.length > 0 &&
    <div className="container">
      <LandCardGrid data={data} globalState={globalState} />
    </div>
}

export async function getServerSideProps(context) {
  const data = await getLands(1, 100, context.req.headers.host);

  return { props: { data } }
}

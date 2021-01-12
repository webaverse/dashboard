import React from 'react'
import { useAppContext } from "../libs/contextLib";
import { getLands } from "../functions/UIStateFunctions.js";
import CardGrid from "../components/LandCardGrid";

export default ({ data }) => {
  const Map = dynamic(() => import("../components/Map"), {
    ssr: false
  });

  const history = useHistory();
  const { globalState, setGlobalState } = useAppContext();

  return lands && lands.length > 0 && 
    <div className="container">
      <Map />
      <CardGrid data={lands} globalState={globalState} cardSize="" currentCard={currentCard} setCurrentCard={setCurrentCard} />
    </div>
}

export async function getServerSideProps() {
  const data = await getLands(1, 100);

  return { props: { data } }
}

import React, { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAppContext } from "../libs/contextLib";
import { getTokens } from "../functions/UIStateFunctions.js";
import CardGrid from "../components/CardGrid";

export default ({ data }) => {
  const [hasMore, setHasMore] = useState(true);
  const [start, setStart] = useState(51);
  const [end, setEnd] = useState(60);
  const [cardData, setCardData] = useState(data);
  const { globalState, setGlobalState } = useAppContext();

  const fetchData = async () => {
    const newData = await getTokens(start, end);

    if (newData[newData.length-1].minter.address === "0x0000000000000000000000000000000000000000") {
      setHasMore(false);
      return;
    }

    setCardData(cardData.concat(newData));
    setStart(start+20);
    setEnd(end+20);
  }

  return (
    <div className="container">
      <InfiniteScroll
        dataLength={cardData.length} //This is important field to render the next data
        next={fetchData}
        hasMore={hasMore}
        loader={<p className="containerText">Loading...</p>}
        endMessage={
          <p className="containerText">
            You have seen it all!
          </p>
        }
      >
        <CardGrid data={cardData} cardSize="small" globalState={globalState} />
      </InfiniteScroll>
    </div>
  )
}

export async function getServerSideProps(context) {
  const data = await getTokens(1, 50, context.req.headers.host);

  return { props: { data } }
}

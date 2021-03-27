import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Head from 'next/head';
import LandCardDetails from "../components/LandCardDetails";
import Loader from "../components/Loader";
import { getSidechainActivity, getSidechainActivityMaxBlock } from "../functions/AssetFunctions";
import { getToken, getLand } from "../functions/UIStateFunctions";
import { useAppContext } from "../libs/contextLib";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const Activity = ({ data }) => {
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(data.activityData);
  const [page, setPage] = useState(1);
  const [maxBlock, setMaxBlock] = useState(1);

  useEffect(() => {
    (async () => {
      const data = await getData(page);
    })();
  }, []);

  useEffect(() => {
    getData(page);
  }, [page]);

  const getData = async (page) => {
    const activityData = await getSidechainActivity(page);
    setActivity(activityData);
    setLoading(false);
    // console.log('got data', activityData);
  }

  const time2TimeAgo = (ts) => {
      var d=new Date();
      var nowTs = Math.floor(d.getTime()/1000);
      var seconds = nowTs-ts;

      if (seconds > 2*24*3600) {
         return "a few days ago";
      }
      if (seconds > 24*3600) {
         return "yesterday";
      }
      if (seconds > 3600) {
         return "a few hours ago";
      }
      if (seconds > 1800) {
         return "Half an hour ago";
      }
      if (seconds > 60) {
         return Math.floor(seconds/60) + " minutes ago";
      }
  }

  return (
    <>
      { !loading ?
        <div className="activityContainer">
          <div>
            <h1>Activity</h1>
          </div>
          <div className="activityTableContainer">
            <div className="activityTableContainerTop">
              <div className="activityTableContainerTopLeft">
              </div>
              <div className="activityTableContainerTopRight">
                { page > 1 ? <>
                  <div onClick={() => setPage(1)} className="activityTableContainerTopButton">
                    First
                  </div>
                  <div onClick={() => setPage(page-1)} className="activityTableContainerTopButton">
                    {'<'}
                  </div>
                </> :
                  null
                }
                <div className="activityTableContainerTopButtonStatic">
                  Page {page}
                </div>
                <div onClick={() => setPage(page+1)} className="activityTableContainerTopButton">
                  {'>'}
                </div>
              </div>
            </div>
            <table className="activityTable">
              <tbody>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
              </tr>
              {
                activity.map(entry => {
                  let contract;
                  if (entry.returnValues["value"]) {
                    contract = "FT";
                  } else if (entry.type === "LAND") {
                    contract = "LAND";
                  } else {
                    contract = "NFT";
                  }

                  return (
                  <tr key={entry.id}>
                    { entry.returnValues["value"] ?
                      <>
                      <td><span className="activityTableEntry">SILK</span></td>
                      <td><span className="activityTableEntry">{entry.returnValues["value"]}</span></td>
                      </>
                    :
                      <>
                      <td><span className="activityTableEntry"><Link href={`${entry.type === "LAND" ? "/land/" : "/assets/"}` + entry.returnValues["tokenId"]}><a>{`${entry.type === "LAND" ? "LAND" : "NFT"} #${entry.returnValues["tokenId"]}`}</a></Link></span></td>
                      <td><span className="activityTableEntry">1</span></td>
                      </>
                    }
                    <td><span className="activityTableEntry"><Link href={"/accounts/" + entry.returnValues["from"]}>{entry.returnValues["from"]}</Link></span></td>
                    <td><span className="activityTableEntry"><Link href={"/accounts/" + entry.returnValues["to"]}>{entry.returnValues["to"]}</Link></span></td>
                    <td><span className="activityTableEntry"><Link href={"/activity/" + entry.transactionHash + "." + contract}><a>{time2TimeAgo(entry.timestamp)}<div className="activityTableEntryIconContainer"><OpenInNewIcon /></div></a></Link></span></td>
                  </tr>
                )
              })}
              </tbody>
            </table>
            <div className="activityTableContainerBottom">
              <div className="activityTableContainerTopLeft">
              </div>
              <div className="activityTableContainerTopRight">
                { page > 1 ? <>
                  <div onClick={() => setPage(1)} className="activityTableContainerTopButton">
                    First
                  </div>
                  <div onClick={() => setPage(page-1)} className="activityTableContainerTopButton">
                    {'<'}
                  </div>
                </> :
                  null
                }
                <div className="activityTableContainerTopButtonStatic">
                  Page {page}
                </div>
                <div onClick={() => setPage(page+1)} className="activityTableContainerTopButton">
                  {'>'}
                </div>
              </div>
            </div>
          </div>
        </div>
      :
        <Loader loading={true} />
      }
    </>
  )
};
export default Activity;

export async function getServerSideProps({ params }) {
/*
  const data = await getSidechainActivity();
  const activityData = JSON.parse(JSON.stringify(data)); 
*/
  const activityData = [];

//  console.log("got ssr data", data);

  return { props: { data: { activityData } } }
}

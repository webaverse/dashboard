import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Head from 'next/head';
import LandCardDetails from "../components/LandCardDetails";
import Loader from "../components/Loader";
import { getSidechainActivity } from "../functions/AssetFunctions";
import { useAppContext } from "../libs/contextLib";

export default ({ data }) => {
  console.log('got data', data);
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState(data.activityData);

  useEffect(() => {
    (async () => {
      const data = await getData();
      console.log("got data", data);
    })();
  }, []);

  const getData = async () => {
    const activityData = await getSidechainActivity();
    setActivity(activityData);
    setLoading(false);
  }

  function time2TimeAgo(ts) {
      // This function computes the delta between the
      // provided timestamp and the current time, then test
      // the delta for predefined ranges.
  
      var d=new Date();  // Gets the current time
      var nowTs = Math.floor(d.getTime()/1000); // getTime() returns milliseconds, and we need seconds, hence the Math.floor and division by 1000
      var seconds = nowTs-ts;
  
      // more that two days
      if (seconds > 2*24*3600) {
         return "a few days ago";
      }
      // a day
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
        <div className="container">
          <div className="activityTableContainer">
            <table className="activityTable">
              <tr>
                <th>Txn Hash</th>
                <th>Block</th>
                <th>Age</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
              </tr>
              {
                activity.map(entry => {
                  return(
                  <tr>
                    <td><span className="activityTableEntry">{entry.transactionHash}</span></td>
                    <td><span className="activityTableEntry">{entry.blockNumber}</span></td>
                    <td><span className="activityTableEntry">{time2TimeAgo(entry.timestamp)}</span></td>
                    <td><span className="activityTableEntry"><Link href={"/accounts/" + entry.returnValues["from"]}>{entry.returnValues["from"]}</Link></span></td>
                    <td><span className="activityTableEntry"><Link href={"/accounts/" + entry.returnValues["to"]}>{entry.returnValues["to"]}</Link></span></td>
                    <td><span className="activityTableEntry">{entry.returnValues["value"]} FLUX</span></td>
                  </tr>
                  )
                })
              }
            </table>
          </div>
        </div>
      :
        <Loader loading={true} />
      }
    </>
  )
}

export async function getServerSideProps({ params }) {
/*
  const data = await getSidechainActivity();
  const activityData = JSON.parse(JSON.stringify(data)); 
*/
  const activityData = [];

//  console.log("got ssr data", data);

  return { props: { data: { activityData } } }
}

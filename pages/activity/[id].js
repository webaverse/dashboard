import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Head from 'next/head';
import LandCardDetails from "../../components/LandCardDetails";
import Loader from "../../components/Loader";
import { getSidechainActivity, getSidechainActivityMaxBlock } from "../../functions/AssetFunctions";
import { useAppContext } from "../../libs/contextLib";

export default ({ data }) => {
  console.log('got data', data);
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(false);
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
            <h1>Activity Detail</h1>
          </div>
          <div className="activityTableContainer">
            <table className="activityTable">
              <tr>
                <th className="smallerTableData">
                  <div className="smallerTableData">
                    <span className="activityTableEntry">
                      entry.transactionHash
                    </span>
                  </div>
                </th>
                <th className="largerTableData">
                  <div className="largerTableData">
                    <span className="activityTableEntry">
                      entry.transactionHash
                    </span>
                  </div>
                </th>
              </tr>
              <tr>
                <td>
                  <div className="smallerTableData">
                    <span className="activityTableEntry">
                      entry.transactionHash
                    </span>
                  </div>
                </td>
                <td>
                  <div className="largerTableData">
                    <span className="activityTableEntry">
                      entry.transactionHash
                    </span>
                  </div>
                </td>
              </tr>
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

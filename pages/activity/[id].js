import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Head from 'next/head';
import LandCardDetails from "../../components/LandCardDetails";
import Loader from "../../components/Loader";
import { getTxData } from "../../functions/AssetFunctions";
import { useAppContext } from "../../libs/contextLib";
import { useRouter } from 'next/router';

export default () => {
  const router = useRouter();
  const { id } = router.query;
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState();
  const [page, setPage] = useState(1);
  const [maxBlock, setMaxBlock] = useState(1);
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const tx = id.split(".")[0] || id;
      const contract = id.split(".")[1] || "NFT";
      const data = await getTxData(tx, contract);
      console.log("got DATA", data);

      setData([
        ["Transaction Hash:", data.transactionHash],
        ["Block:", data.blockNumber],
        ["To:", data.returnValues.from, "/accounts/" + data.returnValues.from],
        ["To:", data.returnValues.to, "/accounts/" + data.returnValues.to],
        ["Value:", data.returnValues.value],
      ]);
    })();
  }, []);

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
          <div className="activityDetailTableContainer">
            <table className="activityTable">
              {data.map(entry =>
                <tr>
                  <td>
                    <div className="smallerTableData">
                      <div className="activityTableEntry">
                        {entry[0]}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="largerTableData">
                      <div className="activityTxTableEntry">
                        { entry[2] ?
                          <Link href={entry[2]}>{entry[1]}</Link>
                        :
                          <>{entry[1]}</>
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              )}
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

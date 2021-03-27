import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getTokens } from "../../functions/UIStateFunctions.js";
import CardColumn from "../../components/CardColumn";

const Tv = () => {
  const router = useRouter();
  const { id } = router.query;
  const [previewId, setPreviewId] = useState(null);
  const [isTokenId, setIsTokenId] = useState(false);
  const [isHashId, setIsHashId] = useState(false);
  const [hash, setHash] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [extName, setExtName] = useState(null);
  const [backLink, setBackLink] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const tokens1 = await getTokens(1, 100);
      shuffle(tokens1);

      setTokens(tokens1);
      setLoading(false);
    })();
  }, []);

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

  useEffect(() => {
    if (id) {
      if (isNaN(parseInt(id)) === false) {
        setPreviewId(id);
        setIsTokenId(true);
      } else {
        const hashData = id.split(".")[0];
        const fileNameData = id.split(".")[1];
        const extNameData = id.split(".")[2];
        const backLinkData = id.split(".")[3];
        setBackLink(backLinkData);
  
        if (hashData && fileNameData && extNameData) {
          setHash(hashData);
          setFileName(fileNameData);
          setExtName(extNameData);
  
          setPreviewId("https://ipfs.exokit.org/" + hashData + "/" + fileNameData + "." + extNameData);
          setIsHashId(true);
        }
      }
    }
  }, [id]);

  return (
    <div className="tvContainer">
      {previewId && isTokenId && (<>
        <div className="IFrameContainer">
          <iframe className="IFrame" src={"https://app.webaverse.com/?t=" + previewId} />
        </div>
      </>)}
      {tokens && (<CardColumn data={tokens} cardSize="small" />)}
    </div>
  );
};
export default Tv;
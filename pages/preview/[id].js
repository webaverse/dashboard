import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default () => {
  const router = useRouter();
  const { id } = router.query;
  const [previewId, setPreviewId] = useState(null);
  const [isTokenId, setIsTokenId] = useState(false);
  const [isHashId, setIsHashId] = useState(false);

    if (id && !isTokenId && !isHashId) {
      console.log("got id", id);
      if (isNaN(parseInt(id)) === false) {
        setPreviewId(id);
        setIsTokenId(true);
      } else {
        const hash = id.split(".")[0];
        const extName = id.split(".")[1];
        setPreviewId("https://ipfs.exokit.org/" + hash + "/" + "preview." + extName);
        setIsHashId(true);
      }
    }

  return (
    <>
      {[
        previewId && isTokenId && (<>
          <Link href={"https://webaverse.com/assets/" + previewId}>
            <a className="button">
              Go back
            </a>
          </Link>
          <div className="IFrameContainer">
            <iframe className="IFrame" src={"https://app.webaverse.com/?t=" + previewId} />
          </div>
        </>),
        previewId && isHashId && (<>
          <Link href={"https://webaverse.com/assets/" + previewId}>
            <a className="button">
              Go back
            </a>
          </Link>
          <div className="mintingOptionsContainer">
            <h1>Woah, check it out!</h1>
            <p>
              This is the awesome thing you{"'"}re about to mint! You can move around and check it out here.
              Like what you see? Just click the big glowing button to mint it.
            </p>
            <a className={`button noselect mintButton`}>
              Let{"'"}s mint!
            </a>
          </div>
          <div className="IFrameContainer">
            <iframe className="IFrame" src={"https://app.webaverse.com/?t=" + previewId} />
          </div>
        </>),

      ]}
    </>
  );
};

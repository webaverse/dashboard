import React, {useState} from 'react';
import {appPreviewHost} from '../webaverse/constants';

const Card3D = ({
  id,
  hash,
  ext,
  loaded,
}) => {
  // `{storageHost}/ipfs/${hash}`
  const qs = {
    id,
    hash,
    ext,
  };
  let src = `${appPreviewHost}?`;
  let first = true;
  for (const k in qs) {
    const v = qs[k];
    if (v !== undefined) {
      if (first) {
        first = false;
      } else {
        src += '&';
      }
      src += `${k}=${v}`;
    }
  }
  return (
    <div className={`content-preview-3d ${onClick ? 'clickable' : ''}`}>
      <iframe
        className={`iframe ${loaded ? 'loaded' : ''}`}
        src={src}
      />
    </div>
  );
};
export default Card3D;
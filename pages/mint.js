import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router'
import { Container, Row, Col } from 'react-grid-system';
import { FileDrop } from 'react-file-drop';
import { useAppContext } from "../libs/contextLib";
import { mintNft, setAvatar, setHomespace } from '../functions/AssetFunctions.js';
import { storageHost } from "../webaverse/constants";
import { getExt } from "../webaverse/util";
import Loader from '../components/Loader';
import AssetCard from '../components/Card';
import { makeWbn } from "../webaverse/build";

export default () => {
  const router = useRouter();
  const { globalState, setGlobalState } = useAppContext();
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [mintedState, setMintedState] = useState(null);
  const [mintStage, setMintStage] = useState(0);
  const [mintedMessage, setMintedMessage] = useState(null);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const [extName, setExtName] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [hash, setHash] = useState(null);
  const [loading, setLoading] = useState(true);

  if (loading && globalState && globalState.init === true) {
    setLoading(false);
  }

  useEffect(async () => {
    if (files && files.length > 0) {
      const wbn = await makeWbn(files);
      handleFileUpload(wbn);
    }
  }, [files]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleQuantityChange = (e) => setQuantity(e.target.value);

  const handleSuccess = (e) => {
    setMintedMessage(e.toString());
  }
  const handleError = (e) => {
    setMintedMessage(e.toString());
  }

  const handleFileUpload = file => {
    if (file) {
      let reader = new FileReader();
      reader.onloadend = () => {
        const extName = getExt(file.name);
        const fileName = extName ? file.name.slice(0, -(extName.length + 1)) : file.name;
        setExtName(extName);
        setName(fileName);

        fetch(storageHost, {
          method: 'POST',
          body: file
        })
        .then(response => response.json())
        .then(data => {
          setHash(data.hash);
          setIpfsUrl("https://ipfs.exokit.org/" + data.hash + "/" + fileName + "." + extName);
          setMintStage(2);
        })
        .catch(error => {
          console.error(error)
        })
      }
      reader.readAsDataURL(file);
    }
    else console.warn("Didnt upload file");
  };

  const MintSteps = () => {
    if (hash && name && extName) {
      router.push('/preview/' + hash + "." + name + "." + extName);
    }

    return (
      <Loader loading={true} />
    )
  }

  return (<>{[
    loading && (<Loader loading={true} />),
    !loading && (<>
      {[
        !globalState.loginToken && (
          <React.Fragment key="login-required-message">
            <h1>You need to login to mint.</h1>
            <div className="container">
              <Image src="/404.png" width={121} height={459} />
            </div>
          </React.Fragment>
        ),
        globalState.loginToken && !file && (
          <div key="file-drop-container" className="file-drop-container">
            <FileDrop
              onDrop={(files, e) => handleFileUpload(files[0])}
            >
              Drop the file you want to mint here!
              <label htmlFor="input-file" className="button">Or choose file</label>
              <input type="file" id="input-file" onChange={(e) => handleFileUpload(e.target.files[0])} multiple={false} style={{display: 'none'}} />
              <label htmlFor="input-folder" className="button">Mint my code</label>
              <input type="file" id="input-folder" onChange={(e) => setFiles(Array.from(e.target.files))} webkitdirectory="" mozdirectory="" directory="" style={{display: 'none'}} />
            </FileDrop>
          </div>),
        mintStage === 2 && (<MintSteps />),
      ]}
    </>),
  ]}</>
  )
}

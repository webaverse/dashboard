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


export default () => {
  const router = useRouter();
  const { globalState, setGlobalState } = useAppContext();
  const [file, setFile] = useState(null);
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

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleQuantityChange = (e) => setQuantity(e.target.value);

  const handleSuccess = (e) => {
    setMintedMessage(e.toString());
  }
  const handleError = (e) => {
    setMintedMessage(e.toString());
  }

  const handleMintNftButton = (e) => {
    e.preventDefault();
    setMintedState('loading');

    const ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2);;
    mintNft(file,
      name,
      ext,
      description,
      quantity,
      (tokenId) => {
        setMintedState('success')
        setMintedMessage(tokenId)
        setMintStage(4)
      },
      (err) => {
        console.log("Minting failed", err);
        setMintedState('error')
        setMintedMessage(err.toString())
      },
      globalState
    );
  }

  const handleFileUpload = file => {
    if (file) {
      let reader = new FileReader();
      reader.onloadend = () => {
        const extName = getExt(file.name);
        const fileName = extName ? file.name.slice(0, -(extName.length + 1)) : file.name;
        setFile(file);
        setMintStage(2);
        setExtName(extName);
        setFileName(fileName);
        setName(fileName);
        setDescription("This is an awesome " + fileName + ".");

        fetch(storageHost, {
          method: 'POST',
          body: file
        })
        .then(response => response.json())
        .then(data => {
          setHash(data.hash);
          setIpfsUrl("https://ipfs.exokit.org/" + data.hash + "/" + fileName + "." + extName);
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
    if (mintedState === "loading") {
      return (
        <Loader loading={true} />
      )
    } else if (mintedState === "success") {
      if (mintedMessage) {
        router.push('/assets/' + mintedMessage);
      }

      return (
        <Loader loading={true} />
      )
    } else if (mintedState === "error") {
      return (
        <div>
          <h1>Error</h1>
          {mintedMessage}.
        </div>
      )
    }
  }

  return (<>{[
    loading && (<Loader loading={true} />),
    !loading && (<>
      {[
        !globalState.loginToken && (
          <>
            <h1>You need to login to mint.</h1>
            <div className="container">
              <Image src="/404.png" width={121} height={459} />
            </div>
          </>
        ),
        globalState.loginToken && !file && (
          <div className="file-drop-container">
            <FileDrop
              onDrop={(files, e) => handleFileUpload(files[0])}
            >
              Drop the file you want to mint here!
              <label htmlFor="input-file" className="button">Or choose file</label>
              <input type="file" id="input-file" onChange={(e) => handleFileUpload(e.target.files[0])} multiple={false} style={{display: 'none'}} />
            </FileDrop>
          </div>),
        file && mintStage === 2 && (
          <>
            <div className="mintingOptionsContainer">
              <h1>Woah, check it out!</h1>
              <p>
                This is the awesome thing you{"'"}re about to mint! You can move around and check it out here.
                Like what you see? Just click the big glowing button to mint it.
              </p>
              <a className={`button noselect mintButton`} onClick={() => setMintStage(3)}>
                Let{"'"}s mint!
              </a>
            </div>
            { ipfsUrl && (
              <div className="IFrameContainer">
                <iframe className="IFrame" src={"https://app.webaverse.com/?t=" + ipfsUrl} />
              </div>
            )}
          </>
      ),
      mintStage === 3 && (
        <div className="mintContainer">
          <div className="mintCardContainer">
            <AssetCard
              id={42}
              totalSupply={quantity}
              assetName={name}
              ext={extName}
              description={description}
              image={"https://preview.exokit.org/" + hash + "." + extName + "/preview.png"}
              hash={hash}
              minterAvatarPreview={globalState.avatarPreview}
              minterUsername={globalState.name}
              minterAddress={globalState.address}
              cardSize={""}
              networkType='webaverse'
              glow={true}
            />
          </div>
          <div className="mintFormContainer">
            <div className="mintFormSubContainer">
                  <label>Name</label>
                  <input type="text" placeholder={fileName} value={name} onChange={handleNameChange} />
                  <label>Description</label>
                  <input type="text" placeholder="This item is awesome." value={description} onChange={handleDescriptionChange} />
                  <label>Quantity</label>
                  <input type="number" value={quantity} onChange={handleQuantityChange} />
              <a className={`button noselect mintButton`} onClick={handleMintNftButton}>
                Mint for {10*quantity} FLUX
              </a>
            </div>
          </div>
        </div>
      ),
      mintStage === 4 && (<MintSteps />),
      ]}
    </>),
  ]}</>
  )
}

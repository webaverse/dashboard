import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router'
import { Container, Row, Col } from 'react-grid-system';
import { FileDrop } from 'react-file-drop';
import { useAppContext } from "../../libs/contextLib";
import { mintNft, setAvatar, setHomespace } from '../../functions/AssetFunctions.js';
import { storageHost } from "../../webaverse/constants";
import { getExt } from "../../webaverse/util";
import Loader from '../../components/Loader';
import AssetCard from '../../components/Card';


export default () => {
  const router = useRouter();
  const { id } = router.query;
  const { globalState, setGlobalState } = useAppContext();
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [mintedState, setMintedState] = useState(null);
  const [mintStage, setMintStage] = useState(3);
  const [mintedMessage, setMintedMessage] = useState(null);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const [extName, setExtName] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [hash, setHash] = useState(null);
  const [loading, setLoading] = useState(true);

  if (id && !hash && !fileName && !extName && !ipfsUrl) {
    const hashData = id.split(".")[0];
    const fileNameData = id.split(".")[1];
    const extNameData = id.split(".")[2];

    setHash(hashData);
    setFileName(fileNameData);
    setName(fileNameData);
    setDescription("This is an awesome " + fileNameData + ".");
    setExtName(extNameData);
    setIpfsUrl("https://ipfs.exokit.org/" + hash + "/" + fileName + "." + extName);
  }

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

    mintNft(file,
      name,
      extName,
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
            <h1>you need to login to mint.</h1>
            <div classname="container">
              <image src="/404.png" width={121} height={459} />
            </div>
          </>
        ),
        !hash && (
          <>
            <h1>you need a correct hash to mint!</h1>
            <div classname="container">
              <image src="/404.png" width={121} height={459} />
            </div>
          </>
        ),
      mintStage === 3 && globalState && globalState.loginToken && (
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

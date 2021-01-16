import React, { useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { Container, Row, Col } from 'react-grid-system';
import { FileDrop } from 'react-file-drop';
import { useAppContext } from "../libs/contextLib";
import { mintNft, setAvatar, setHomespace } from '../functions/AssetFunctions.js';
import { storageHost } from "../webaverse/constants";
import { getExt } from "../webaverse/util";
import Loader from '../components/Loader';


export default () => {
  const router = useRouter();
  const { globalState, setGlobalState } = useAppContext();
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [mintedState, setMintedState] = useState(null);
  const [mintedMessage, setMintedMessage] = useState(null);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const [extName, setExtName] = useState(null);
  const [fileName, setFileName] = useState(null);

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
        setExtName(extName);
        setFileName(fileName);

        fetch(storageHost, {
          method: 'POST',
          body: file
        })
        .then(response => response.json())
        .then(data => {
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
          Minting failed: {mintedMessage}.
        </div>
      )
    }
  }

  return (
    <>
      {[
       !globalState.loginToken && (
          <h1>You need to login to Mint.</h1>
        ),
        globalState.loginToken && ( !file ?
          <div className="file-drop-container">
            <FileDrop
              onDrop={(files, e) => handleFileUpload(files[0])}
            >
              Drop the file you want to mint here!
              <label htmlFor="input-file" className="button">Or choose file</label>
              <input type="file" id="input-file" onChange={(e) => handleFileUpload(e.target.files[0])} multiple={false} style={{display: 'none'}} />
            </FileDrop>
          </div>
        :
          <>
            { ipfsUrl ?
              <div className="IFrameContainer">
                <iframe className="IFrame" src={"https://app.webaverse.com/?t=" + ipfsUrl} />
              </div>
            :
              null
            }
            <div className="mintingOptionsContainer">
              { mintedState === null ?
                <div>
                  <div>
                      <label>Name</label>
                  </div>
                  <div>
                      <input type="text" value={name} onChange={handleNameChange} />
                  </div>
                  <div>
                      <label>Description</label>
                  </div>
                  <div>
                      <input type="text" value={description} onChange={handleDescriptionChange} />
                  </div>
                  <div>
                      <label>Quantity</label>
                  </div>
                  <div>
                      <input type="number" value={quantity} onChange={handleQuantityChange} />
                  </div>
                  <div>
                      <a className={`button mintButton`} onClick={handleMintNftButton}>
                        Mint NFT for {10*quantity} FLUX
                      </a>
                  </div>
                </div>
              :
                <MintSteps />
              }
            </div>
          </>
        )
      ]}
    </>
  )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';
import { FileDrop } from 'react-file-drop';
import { useAppContext } from "../../libs/contextLib";
import { mintNft } from '../../functions/AssetFunctions.js';
import Loader from '../../components/Loader';
import "../../assets/css/mint.css";


export default () => {
  const { globalState, setGlobalState } = useAppContext();
  const [file, setFile] = useState(null);
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mintedState, setMintedState] = useState(null);
  const [mintedMessage, setMintedMessage] = useState(null);

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleQuantityChange = (e) => setQuantity(e.target.value);

  const handleMintNftButton = (e) => {
    e.preventDefault();
    setMintedState('loading');

    mintNft(file,
      name,
      description,
      quantity,
      (tokenId) => {
        console.log("Success callback!", "/browse/" + tokenId);
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
    console.log(file);
    if (file) {
      let reader = new FileReader();
      reader.onloadend = () => {
        setFile(file);
        setImagePreview(reader.result);
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
      return (
        <div>
          <h1>Success</h1>
          <Link to={"/browse/" + mintedMessage}>
            Your token is now minted as #{mintedMessage}.
          </Link>
        </div>
      )
    } else if (mintedState === "error") {
      return (
        <div>
          <h1>Error</h1>
          Minting failed: {mintedMessage}.
        </div>
      )
    } else {
      return (
        <div>
          <img className="nft-preview" src={imagePreview ? imagePreview : null} />
          <label>Name</label>
          <input type="text" onChange={handleNameChange} />
          <label>Description</label>
          <input type="text" onChange={handleDescriptionChange} />
          <label>Quantity</label>
          <input type="number" onChange={handleQuantityChange} />

          <a className="button" onClick={handleMintNftButton}>
            Mint NFT for 10 FLUX
          </a>
        </div>
      )
    }
  }

  return (
    <>
      { !file ?
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
        <Container>
          <Row style={{ justifyContent: "center" }}>
            <Col sm={12}>
              { !mintedState ?
                <div>
                  <img className="nft-preview" src={imagePreview ? imagePreview : null} />
                  <label>Name</label>
                  <input type="text" onChange={handleNameChange} />
                  <label>Description</label>
                  <input type="text" onChange={handleDescriptionChange} />
                  <label>Quantity</label>
                  <input type="number" onChange={handleQuantityChange} />
                  <a className="button" onClick={handleMintNftButton}>
                    Mint NFT for 10 FLUX
                  </a>
                </div>
              :
                <MintSteps />
              }
            </Col>
          </Row>
        </Container>
      }
    </>
  )
}

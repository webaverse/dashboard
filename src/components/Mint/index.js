import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Web3 from 'web3';
import { Container, Row, Col } from 'react-grid-system';
import { FileDrop } from 'react-file-drop';
import { useAppContext } from "../../libs/contextLib";
import { mintNft } from '../../functions/AssetFunctions.js';
import "../../assets/css/mint.css";


export default () => {
  const { globalState, setGlobalState } = useAppContext();

  const [file, setFile] = useState(null);
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mintedState, setMintedState] = useState(null);

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleQuantityChange = (e) => setQuantity(e.target.value);

  const handleMintNftButton = (e) => {
    e.preDefault();
    mintNft(file,
       name,
       description,
       quantity,
       (err) => {
         console.error("Minting failed", err);
         setMintedState('error')},
       () => {
         console.log("Success callback!"); 
         setMintedState('success')
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

  return (
    <Container>
      <Row style={{ justifyContent: "center" }}>
        <Col sm={7}>
          { !file ?
            <div className="file-drop-container">
              <FileDrop
                onDrop={(files, e) => handleFileUpload(files[0])}
              >
                Drop the file you want to mint here!
              </FileDrop>
            </div>
          :
            <div>
              <img className="nft-preview" src={imagePreview ? imagePreview : null} />
              <label>Name</label>
              <input type="text" onChange={handleNameChange} />
              <label>Description</label>
              <input type="text" onChange={handleDescriptionChange} />
              <label>Quantity</label>
              <input type="number" onChange={handleQuantityChange} />

              <a className="button" onClick={handleMintNftButton}>
                Mint NFT
              </a>
            </div>
          }
        </Col>
      </Row>
    </Container>
  )
}

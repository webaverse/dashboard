import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Web3 from 'web3';
import { Container, Row, Col } from 'react-grid-system';
import { useAppContext } from "../../libs/contextLib";
import { mintNft } from '../../functions/AssetFunctions.js';


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
    e.preventDefault();
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

  const handleFileUpload = e => {
    const [file] = e.target.files;
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
          <label>NFT file</label>
          <input type="file" id="input-file" onChange={handleFileUpload} multiple={false} />
          <label>Name</label>
          <input type="text" onChange={handleNameChange} />
          <label>Description</label>
          <input type="text" onChange={handleDescriptionChange} />
          <label>Quantity</label>
          <input type="number" onChange={handleQuantityChange} />

          <a className="button" onClick={handleMintNftButton}>
            Mint NFT
          </a>
        </Col>
      </Row>
    </Container>
  )
}

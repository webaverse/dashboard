import {GLTFLoader} from '../libs/GLTFLoader.js';
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router'
import { Container, Row, Col } from 'react-grid-system';
import { FileDrop } from 'react-file-drop';
import { useAppContext } from "../libs/contextLib";
import { mintNft, setAvatar, setHomespace } from '../functions/AssetFunctions.js';
import { storageHost } from "../webaverse/constants";
import Loader from '../components/Loader';
import AssetCard from '../components/Card';
import { makeWbn, makeBin } from "../webaverse/build";
import { blobToFile, getExt } from "../webaverse/util";

const Pets = () => {
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
  const [init, setInit] = useState(false);

  if (!init && loading && globalState && globalState.init === true) {
    setLoading(false);
    setInit(true);
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

  const handleFilesMagically = async (files) => {
    setLoading(true);
    if (files.length === 1) {
      if (getExt(files[0].name) === "glb") {
        makePetWbn(files);
      } else {
        alert("No glb file uploaded!");
        setLoading(false);
      }
    } else {
      alert("Please only upload 1 glb file for pets.");
      setLoading(false);
    }
  }

  const makePetWbn = async (file) => {
    if (file && getExt(file[0].name) === "glb") {

      let o = await new Promise((accept, reject) => {
        const u = URL.createObjectURL(file[0]);
        new GLTFLoader().load(u, accept, function onprogress() {}, reject);
      });

      let walkAnimation, idleAnimation;
      if (o) {
        // get walk animation
        Promise.all(o.animations.map(animation => {
          if (!walkAnimation) {
            const result = window.confirm('Is your walk animation called "' + animation.name + '"?');
            if (result) {
              walkAnimation = animation.name;
            }
          }
        }));
        // get idle animation
        Promise.all(o.animations.map(animation => {
          if (!idleAnimation) {
            const result = window.confirm('Is your idle animation called "' + animation.name + '"?');
            if (result) {
              idleAnimation = animation.name;
            }
          }
        }));
      } else {
        const walkAnimation = prompt("What is the name of the walk animation for this pet?", "");
        const idleAnimation = prompt("What is the name of the idle animation for this pet?", "");
      }
      const manifest = {
        "xr_type": "webxr-site@0.0.1",
        "start_url": file[0].name,
        "components": [
          {
            "type": "pet",
            "walkAnimation": walkAnimation != "" ? walkAnimation : null,
            "idleAnimation": idleAnimation != "" ? idleAnimation : null,
          }
        ]
      };
      const blob = new Blob([JSON.stringify(manifest)], {type: "application/json"});
      const manifestFile = blobToFile(blob, "manifest.json");

      const modelBlob = new Blob([file[0]], {type: file[0].type});
      const model = blobToFile(modelBlob, file[0].name);
      const files = [model, manifestFile];

      const wbn = await makeWbn(files);
      handleFileUpload(wbn);
    } else {
      alert("Please you a valid .glb model");
    }
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
          router.push('/preview/' + data.hash + "." + fileName + "." + extName + ".pets");
        })
        .catch(error => {
          console.error(error)
        })
      }
      reader.readAsDataURL(file);
    }
    else console.warn("Didnt upload file");
  };

  return (<>{loading ?
    <Loader loading={loading} />
  :
    <>
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
            <Head>
              <script type="text/javascript" src="/geometry.js"></script>
            </Head>
            <FileDrop
              onDrop={(files, e) => {
                handleFilesMagically(files);
                e.preventDefault();
              }}
            >
              Drop glb here to mint a pet
              <label htmlFor="input-file" className="button">Or Upload</label>
              <input type="file" id="input-file" onChange={(e) => handleFilesMagically(e.target.files)} multiple={false} style={{display: 'none'}} />
            </FileDrop>
          </div>),
      ]}
    </>
  }</>)
};
export default Pets;

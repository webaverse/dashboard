import React, { useState, useEffect } from 'react'
import axios from 'axios';
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
import ProgressBar from '../components/ProgressBar';
import { makeWbn, makeBin } from "../webaverse/build";
import { blobToFile, getExt } from "../webaverse/util";

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
  const [init, setInit] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [progress,   setProgress] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

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
    if (files.length > 1) {
      const filesArray = Array.from(files)
      const wbn = await makeWbn(filesArray);
      handleFileUpload(wbn);
    } else if (files.length === 1) {
      if (getExt(files[0].name) === "glb") {
        makePhysicsBake(files);
      } else {
        handleFileUpload(files[0]);
      }
    } else {
      alert("No files uploaded!");
      setLoading(false);
    }
  }

  const makePhysicsBake = async (file) => {
    if (file && getExt(file[0].name) === "glb") {
      const bin = await makeBin(file);

      const manifest = {
        "xr_type": "webxr-site@0.0.1",
        "start_url": file[0].name,
        "physics_url": bin.name
      };
      const blob = new Blob([JSON.stringify(manifest)], {type: "application/json"});
      const manifestFile = blobToFile(blob, "manifest.json");

      const modelBlob = new Blob([file[0]], {type: file[0].type});
      const model = blobToFile(modelBlob, file[0].name);
      const files = [model, bin, manifestFile];

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

        const documentStyles = document.documentElement.style;
        let progress = 0;

        setLoading('true');
        setProgress('in-progress');

        axios({
          method: 'post',
          url: storageHost,
          data: file,
          onUploadProgress(progressEvent) {
            progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setPercentage(progress);
            console.log("progress", progress);
            documentStyles.setProperty('--progress', `${progress}%`);

            if (progress > 0 && progress < 10) {
              setLoadingMessage("Blurring Reality Lines");
            } else if (progress > 10 && progress < 20) {
              setLoadingMessage("Preparing Captive Simulators");
            } else if (progress > 20 && progress < 30) {
              setLoadingMessage("Destabilizing Orbital Payloads");
            } else if (progress > 30 && progress < 40) {
              setLoadingMessage("Reticulating 3-Dimensional Splines");
            } else if (progress > 40 && progress < 50) {
              setLoadingMessage("Inserting Chaos Generator");
            } else if (progress > 50 && progress < 60) {
              setLoadingMessage("Initializing Secret Societies");
            } else if (progress > 60 && progress < 70) {
              setLoadingMessage("Recycling Hex Decimals");
            } else if (progress > 70 && progress < 80) {
              setLoadingMessage("Locating Misplaced Calculations");
            } else if (progress > 80 && progress < 90) {
              setLoadingMessage("Simulating Program Execution");
            } else if (progress > 90) {
              setLoadingMessage("Composing Melodic Euphony");
            } else {
              setLoadingMessage("Composing Melodic Euphony");
            }
          }
        })
        .then(data => {
          data = data.data;
          console.log("got data", data);
          setProgress('finished');
          setHash(data.hash);
          setIpfsUrl("https://ipfs.exokit.org/" + data.hash + "/" + fileName + "." + extName);
          router.push('/preview/' + data.hash + "." + fileName + "." + extName);
        })
        .catch(error => {
          console.error(error)
        });

/*
        fetch(storageHost, {
          method: 'POST',
          body: file
        })
        .then(response => response.json())
        .then(data => {
          setHash(data.hash);
          setIpfsUrl("https://ipfs.exokit.org/" + data.hash + "/" + fileName + "." + extName);
          router.push('/preview/' + data.hash + "." + fileName + "." + extName);
        })
        .catch(error => {
          console.error(error)
        })
*/
      }
      reader.readAsDataURL(file);
    }
    else console.warn("Didnt upload file");
  };

  return (<>{loading ?
    progress === "in-progress" ?
      <ProgressBar loadingMessage={loadingMessage} percentage={percentage} progress={progress} />
    :
      <Loader loading={true} />
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
              Drop files here to mint
              <label htmlFor="input-file" className="button">Or Upload</label>
              <input type="file" id="input-file" onChange={(e) => handleFilesMagically(e.target.files)} multiple={true} style={{display: 'none'}} />
            </FileDrop>
          </div>),
      ]}
    </>
  }</>)
}

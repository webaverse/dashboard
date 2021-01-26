import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router'
import { Container, Row, Col } from 'react-grid-system';
import { FileDrop } from 'react-file-drop';
import { useAppContext } from "../../libs/contextLib";
import { mintNft, setAvatar, setHomespace } from '../../functions/AssetFunctions.js';
import { storageHost } from "../../webaverse/constants";
import Loader from '../../components/Loader';
import AssetCard from '../../components/Card';
import { makeWbn, makeBin } from "../../webaverse/build";
import { blobToFile, getExt } from "../../webaverse/util";

export default () => {
  const router = useRouter();
  const { id } = router.query;
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

  if (id && !hash && !fileName && !extName && !ipfsUrl) {
    const hashData = id.split(".")[0];
    const fileNameData = id.split(".")[1];
    const extNameData = id.split(".")[2];

    if (hashData && fileNameData && extNameData) {
      const newIpfsUrl = "https://ipfs.exokit.org/" + hashData + "/" + fileNameData + "." + extNameData;
      setIpfsUrl(newIpfsUrl);

      fetch(newIpfsUrl)
      .then( res => res.blob() )
      .then( blob => {
        const glbFile = blobToFile(blob, "scene.glb");
        makePhysicsBake(glbFile);
      });
    }
  }


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
    if (file && getExt(file.name) === "glb") {
      const bin = await makeBin([file]);

      const manifest = {
        "xr_type": "webxr-site@0.0.1",
        "start_url": file.name,
        "physics_url": bin.name
      };
      const blob = new Blob([JSON.stringify(manifest)], {type: "application/json"});
      const manifestFile = blobToFile(blob, "manifest.json");

      const modelBlob = new Blob([file], {type: file.type});
      const model = blobToFile(modelBlob, file.name);
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
      }
      reader.readAsDataURL(file);
    }
    else console.warn("Didnt upload file");
  };

  return (<>
    <Head>
      <script type="text/javascript" src="/geometry.js"></script>
    </Head>
    <Loader loading={true} />
  </>)
}

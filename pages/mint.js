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
import Minter from '../components/Minter';
import { makeWbn, makeBin, makePhysicsBake } from "../webaverse/build";
import { blobToFile, getExt } from "../webaverse/util";

const Mint = ({
  mintMenuOpen,
  setMintMenuOpen,
  /* mintMenuStep,
  setMintMenuStep, */
  /* selectedTab,
  setSelectedTab, */
  /* loading,
  setLoading, */
}) => {
  // const [previewId, setPreviewId] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('');
  // const [mintMenuOpen, setMintMenuOpen] = useState(true);
  
  // const mintMenuOpen = true;
  const mintMenuLarge = true;
  
  return (
    <div className={`container ${mintMenuOpen ? 'open' : ''} ${mintMenuLarge ? 'large' : ''}`}>
      <Minter
        mintMenuOpen={mintMenuOpen}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        loading={loading}
        setLoading={setLoading}
        animate={false}
      />
    </div>
  );
};
export default Mint;

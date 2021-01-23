import Web3 from 'web3';
import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from "../libs/contextLib";
import CardSize from '../constants/CardSize.js';
import { removeLandCollaborator, addLandCollaborator, getLandHash, deployLand, depositLand, deleteAsset, setLoadoutState, setAvatar, setHomespace, withdrawLand, depositAsset, cancelSale, sellAsset, buyAsset } from '../functions/AssetFunctions.js'
import { getLandMain, getStores } from '../functions/UIStateFunctions.js'
import { getBlockchain } from '../webaverse/blockchain.js'
import Loader from './Loader';
import AssetCard from './LandCard';

export default ({
    id,
    name,
    description,
    image,
    hash,
    external_url,
    filename,
    rarity,
    ext,
    totalInEdition,
    numberInEdition,
    totalSupply,
    balance,
    ownerAvatarPreview,
    ownerUsername,
    ownerAddress,
    minterAvatarPreview,
    minterAddress,
    minterUsername,
    networkType,
    buyPrice,
    storeId,
    hideDetails,
    assetType,
    getData
}) => {
  const { globalState, setGlobalState } = useAppContext();

  const [toggleViewOpen, setToggleViewOpen] = useState(true);
  const [toggleEditOpen, setToggleEditOpen] = useState(false);
  const [toggleAddOpen, setToggleAddOpen] = useState(false);
  const [toggleTradeOpen, setToggleTradeOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [mainnetAddress, setMainnetAddress] = useState(null);
  const [landMainnetAddress, setLandMainnetAddress] = useState(null);
  const [landHash, setLandHash] = useState(null);
  const [openHologram, setOpenHologram] = useState(false);
  const [address, setAddress] = useState(null);
  const [otherNetworkName, setOtherNetworkName] = useState(null);

  useEffect(() => {
    getData();
    getOtherData();
  },  []);

  const getOtherData = () => {
    (async () => {
      const main = await getLandMain(id);
      setLandMainnetAddress(main.owner.address);
    })();
    (async () => {
      const landHashRes = await getLandHash(id);
      setLandHash(landHashRes);
    })();
    (async () => {
      const { addresses, getOtherNetworkName } = await getBlockchain();
      setAddress(addresses);
      setOtherNetworkName(getOtherNetworkName());
    })();
  }

  let userOwnsThisAsset, userCreatedThisAsset;
  if (globalState && globalState.address) {
    userOwnsThisAsset = ownerAddress.toLowerCase() === globalState.address.toLowerCase();
  } else {
    userOwnsThisAsset = false;
  }

  let landOnMainnet;
  if (landMainnetAddress && !landMainnetAddress.includes("0x0000000")) {
    landOnMainnet = true;
  } else {
    landOnMainnet = false;
  }

  let ownsOrMain = landOnMainnet || userOwnsThisAsset;

  const isForSale = buyPrice !== undefined && buyPrice !== null && buyPrice !== ""

  const ethEnabled = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      const network = await window.web3.eth.net.getNetworkType();
      if (network === "rinkeby") {
        return true;
      } else {
        alert("You need to be on the Rinkeby network.");
        return false;
      }
    }
    alert("Please install MetaMask to use Webaverse!");
    return false;
  }

  const loginWithMetaMask = async (func) => {
    const network = await ethEnabled();
    if (!network) {
      return;
    } else {
      const web3 = window.web3;
      try {
        const eth = await window.ethereum.request({ method: 'eth_accounts' });
        if (eth && eth[0]) {
          setMainnetAddress(eth[0]);
          return eth[0];
        } else {
          ethereum.on('accountsChanged', (accounts) => {
            setMainnetAddress(accounts[0]);
            func();
          });
          return false;
        }
      } catch(err) {
        handleError(err);
      }
    }
  }

  const handleSuccess = () => {
    console.log("success!");
    getData();
  }
  const handleError = (err) => {
    console.log("error", err);
    getData();
  }

  const handleWithdraw = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const mainnetAddress = await loginWithMetaMask(handleWithdraw);
      if (mainnetAddress) {
        await withdrawLand(id, mainnetAddress, globalState.address, globalState, handleSuccess, handleError);
        handleSuccess();
      } else {
        setLoading(false);
      }
    } catch (err) {
      handleError(err.toString());
    }

  }

  const handleDeposit = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const mainnetAddress = await loginWithMetaMask(handleDeposit);
      const ethConnected = await ethEnabled();
      if (mainnetAddress) {
        await depositLand(id, mainnetAddress, globalState);
        handleSuccess();
      } if (ethConnected) {
        setPending(true);
      } else {
        setLoading(false);
      }
    } catch (err) {
      handleError(err.toString());
    }
  }

  const handleDeploy = () => {
   const contentId = prompt("What is the id for the NFT you want to deploy?", "");

    if (contentId) {
      deployLand(id, contentId, handleSuccess, handleError, globalState);
      setLoading(true);
    }
    else alert("You need to give an NFT id.");
  }

  const handleAddCollaborator = () => {
   const address = prompt("What is the address of the collaborator to add?", "0x0");

    if (address) {
      addLandCollaborator(id, address, handleSuccess, handleError, globalState);
      setLoading(true);
    }
    else alert("No address given.");
  }

  const handleRemoveCollaborator = () => {
   const address = prompt("What is the address of the collaborator to remove?", "0x0");

    if (address) {
      removeLandCollaborator(id, address, handleSuccess, handleError, globalState);
      setLoading(true);
    }
    else alert("No address given.");
  }

  return (
    <>
    { openHologram ?
      <>
        <a className="button" onClick={() => setOpenHologram(false)}>
          Go back
        </a>
        <div className="IFrameContainer">
          <iframe className="IFrame" src={"https://app.webaverse.com/?t=" + landHash} />
        </div>
      </>
    :
      <>
        <div className="assetDetails">
          { loading ?
            <Loader loading={loading} />
          : [
          (<div className="assetDetailsLeftColumn">
            <AssetCard
              key={id}
              id={id}
              name={name}
              rarity={rarity}
              ext={ext}
              description={description}
              buyPrice={buyPrice}
              image={image}
              hash={hash}
              numberInEdition={numberInEdition}
              totalSupply={totalSupply}
              balance={balance}
              totalInEdition={totalInEdition}
              assetType={assetType}
              ownerAvatarPreview={ownerAvatarPreview}
              ownerUsername={ownerUsername}
              ownerAddress={ownerAddress}
              minterAvatarPreview={minterAvatarPreview}
              minterUsername={minterUsername}
              minterAddress={minterAddress}
              cardSize={""}
              networkType='webaverse'
              glow={false}
            />
          </div>),
            (<div className="assetDetailsRightColumn">
              {[
                (<div className="assetDetailsOwnedBy">
                  <span className={`creatorIcon creatorIcon tooltip`}>
                    <img src={ownerAvatarPreview.replace(/\.[^.]*$/, '.png')} />
                    <span className={`creatorName creatorName tooltiptext`}>{ownerUsername}</span>
                  </span>
                  {' '}Owned by <Link href={`/accounts/` + ownerAddress}>{ownerUsername}</Link>
                </div>),
                hash && (<div className="assetDetailsDeployedContent">
                  {' '}Deployed content: <Link href={`/preview/` + hash}>{hash}</Link>
                </div>),
                (<div className={`detailsBlock detailsBlockSet noselect`}>
                  {[
                    (<div className="Accordion">
                        <div className="accordionTitle" onClick={() => setToggleViewOpen(!toggleViewOpen)}>
                            <span className="accordionTitleValue">View</span>
                            <span className={`accordionIcon ${toggleViewOpen ? 'reverse' : ''}`}></span>
                        </div>
                        {toggleViewOpen && (
                        <div className="accordionDropdown">
                          {[
                            (<a target="_blank" href={external_url}><button className="assetDetailsButton">Visit on Street</button></a>),
                            landHash && (<a target="_blank" href={"https://app.webaverse.com/?t=" + landHash}><button className="assetDetailsButton">Open hologram</button></a>),
                            landHash && name && (<a target="_blank" href={"https://app.webaverse.com?u=" + landHash + "&r=" + name.replace(/\s+/g, '-')}><button className="assetDetailsButton">Enter parcel</button></a>),
                            landMainnetAddress && !landMainnetAddress.includes("0x0000000") && !landMainnetAddress.includes(address["rinkeby"]["LANDProxy"]) && (<a target="_blank" href={"https://testnets.opensea.io/assets/" + address["rinkeby"]["LAND"] + "/" + id}><button className="assetDetailsButton">View on OpenSea</button></a>),
                          ]}
                        </div>
                        )}
                    </div>),
                    userOwnsThisAsset && (<div className="Accordion">
                        <div className="accordionTitle" onClick={() => setToggleEditOpen(!toggleEditOpen)}>
                            <span className="accordionTitleValue">Edit</span>
                            <span className={`accordionIcon ${toggleEditOpen ? 'reverse' : ''}`}></span>
                        </div>
                        {toggleEditOpen && (
                        <div className="accordionDropdown">
                          {[
                            landMainnetAddress && !landMainnetAddress.includes("0x0000000") && !landMainnetAddress.includes(address["rinkeby"]["LANDProxy"]) && (<button className="assetDetailsButton" onClick={handleWithdraw}>Transfer From {otherNetworkName}</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleDeposit}>Transfer To {otherNetworkName}</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleDeploy}>Deploy Content</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleAddCollaborator}>Add Collaborator</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleRemoveCollaborator}>Remove Collaborator</button>),
                          ]}
                        </div>
                        )}
                    </div>),
                  ]}
                </div>),
                globalState.address && !userOwnsThisAsset && storeId && buyPrice && (
                <div className="detailsBlock detailsBlockSet">
                  <button className="assetDetailsButton" onClick={handleBuyAsset}>Buy This Item</button>
                </div>),
                ]}
          </div>)
        ]}
        </div>
    </>
    }
    </>
  );
};

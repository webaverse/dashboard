import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppContext } from "../libs/contextLib";
import address from '../webaverse/address.js';
import CardSize from '../constants/CardSize.js';
import { removeLandCollaborator, addLandCollaborator, getLandHash, deployLand, depositLand, deleteAsset, setLoadoutState, setAvatar, setHomespace, withdrawLand, depositAsset, cancelSale, sellAsset, buyAsset } from '../functions/AssetFunctions.js'
import { getLandMain, getStores } from '../functions/UIStateFunctions.js'
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
    assetType
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

  useEffect(() => {
    (async () => {
      const main = await getLandMain(id);
      setLandMainnetAddress(main.owner.address);
    })();
    (async () => {
      const landHashRes = await getLandHash(id);
      setLandHash(landHashRes);
    })();
  },  []);


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

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      if (window.web3.version.network == 4) {
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
    if (!ethEnabled()) {
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
    window.location.reload();
  }
  const handleError = (err) => {
    console.log("error", err);
    window.location.reload();
  }

  const handleWithdraw = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const ethAccount = await loginWithMetaMask(handleWithdraw);
      if (ethAccount) {
        const mainnetAddress = prompt("What mainnet address do you want to get from?", "0x0");
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
      const ethAccount = await loginWithMetaMask(handleDeposit);
      if (ethAccount) {
        const mainnetAddress = prompt("What mainnet address do you want to send to?", "0x0");
        await depositLand(id, mainnetAddress, globalState);
        handleSuccess();
      } if (ethEnabled()) {
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
                            landHash && (<a onClick={() => setOpenHologram(true)}><button className="assetDetailsButton">Open hologram</button></a>),
                            landHash && name && (<a target="_blank" href={"https://app.webaverse.com?u=" + landHash + "&r=" + name.replace(/\s+/g, '-')}><button className="assetDetailsButton">Enter parcel</button></a>),
                            landMainnetAddress && !landMainnetAddress.includes("0x0000000") && !landMainnetAddress.includes(address["main"]["LANDProxy"]) && (<a target="_blank" href={"https://testnets.opensea.io/assets/" + address["main"]["LAND"] + "/" + id}><button className="assetDetailsButton">View on OpenSea</button></a>),
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
                            landMainnetAddress && !landMainnetAddress.includes("0x0000000") && !landMainnetAddress.includes(address["main"]["LANDProxy"]) && (<button className="assetDetailsButton" onClick={handleWithdraw}>Transfer From Mainnet</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleDeposit}>Transfer To Mainnet</button>),
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

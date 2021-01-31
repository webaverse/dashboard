import Web3 from 'web3';
import React, { useContext, useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';
import Link from 'next/link';
import AssetCard from './Card';
import CardSize from '../constants/CardSize.js';
import { getBlockchain } from '../webaverse/blockchain.js';
import { resubmitAsset, getStuckAsset, addNftCollaborator, removeNftCollaborator, setAssetName, deleteAsset, setLoadoutState, setAvatar, setHomespace, withdrawAsset, depositAsset, cancelSale, sellAsset, buyAsset } from '../functions/AssetFunctions.js'
import { isTokenOnMain, getStores } from '../functions/UIStateFunctions.js'
import Loader from './Loader';

export default ({
    id,
    name,
    description,
    image,
    hash,
    external_url,
    filename,
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
    globalState,
    assetType,
    getData
}) => {

  const { addToast } = useToasts();

  const [toggleViewOpen, setToggleViewOpen] = useState(true);
  const [toggleEditOpen, setToggleEditOpen] = useState(false);
  const [toggleAddOpen, setToggleAddOpen] = useState(false);
  const [toggleTradeOpen, setToggleTradeOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [imageView, setImageView] = useState("2d");
  const [tryOn, setTryOn] = useState(false);
  const [tokenOnMain, setTokenOnMain] = useState(false);
  const [mainnetAddress, setMainnetAddress] = useState(null);
  const [otherNetworkName, setOtherNetworkName] = useState(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (globalState.loginToken) {
      getOtherData();
      getData();
    }
  }, [globalState]);

  const getOtherData = () => {
    (async () => {
      const tokenOnMain = await isTokenOnMain(id);
      setTokenOnMain(tokenOnMain);
    })();
    (async () => {
      const { getOtherNetworkName } = await getBlockchain();
      setOtherNetworkName(getOtherNetworkName());
    })();
    (async () => {
      const isStuck = await getStuckAsset("NFT", id, globalState);
      if (isStuck) {
        setStuck(true);
      }
    })();
  }

  let userOwnsThisAsset, userCreatedThisAsset;
  if (globalState && globalState.address) {
    userOwnsThisAsset = ownerAddress.toLowerCase() === globalState.address.toLowerCase();
    userCreatedThisAsset = minterAddress.toLowerCase() === globalState.address.toLowerCase();
  } else {
    userOwnsThisAsset = false;
    userCreatedThisAsset = false;
  }

  let is3d = false;
  if (ext.toLowerCase() === "vrm" ||
      ext.toLowerCase() === "glb") {
    is3d = true;
  }

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
    const enabled = await ethEnabled();
    if (!enabled) {
      return false;
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
    addToast("Success!", { appearance: 'success', autoDismiss: true, })
    getData();
    getOtherData();
    setLoading(false);
  }
  const handleError = (err) => {
    addToast("Error: " + err, { appearance: 'error', autoDismiss: true, })
    getData();
    getOtherData();
    setLoading(false);
  }

  const handleSetAssetName = (e) => {
    e.preventDefault();
    const name = prompt("What would you like to name this asset?", "");
    addToast("Setting item name to: " + name, { appearance: 'info', autoDismiss: true, });
    setAssetName(name, hash, globalState, handleSuccess, handleError);
  }

  const handleSetAvatar = (e) => {
    e.preventDefault();
    addToast("Setting avatar to this item", { appearance: 'info', autoDismiss: true, });
    setAvatar(id, globalState, handleSuccess, handleError)
  }

  const handleSetHomespace = (e) => {
    e.preventDefault();
    addToast("Setting homespace to this item", { appearance: 'info', autoDismiss: true, });
    setHomespace(id, globalState, handleSuccess, handleError);
  }

  const addToLoadout = async (e) => {
    e.preventDefault();
    const loadoutNum = prompt("What loadout number do you want to add this to?", "1");
    addToast("Setting this item to loadout number " + loadoutNum, { appearance: 'info', autoDismiss: true, });
    await setLoadoutState(id, loadoutNum, globalState);
    addToast("Successfully added item to loadout number " + loadoutNum + "!", { appearance: 'success', autoDismiss: true, });
  }

  const handleBuyAsset = (e) => {
    e.preventDefault();
    var r = confirm("You are about to buy this, are you sure?");
    if (r == true) {
      addToast("Buying this item...", { appearance: 'info', autoDismiss: true, });
      buyAsset(storeId, 'sidechain', globalState.loginToken.mnemonic, handleSuccess, handleError);
    } else {
      handleError("canceled delete");
    }
  }

  const handleDeleteAsset = (e) => {
    e.preventDefault();
    var r = confirm("You are about to permanently delete this, are you sure?");
    if (r == true) {
      addToast("Deleting this item...", { appearance: 'info', autoDismiss: true, });
      deleteAsset(id, globalState.loginToken.mnemonic, handleSuccess, handleError);
    } else {
      handleError("canceled delete");
    }
  }

  const handleSellAsset = (e) => {
    e.preventDefault();
    const sellPrice = prompt("How much would you like to sell this for?", "10");
    addToast("Selling this item for " + sellPrice + " FLUX.", { appearance: 'info', autoDismiss: true, });
    sellAsset(id, sellPrice, 'sidechain', globalState.loginToken.mnemonic, handleSuccess, handleError);
  }

  const handleWithdraw = async (e) => {
    if(e) {
      e.preventDefault();
    }

    try {
      const mainnetAddress = await loginWithMetaMask(handleWithdraw);
      if (mainnetAddress) {
        addToast("Starting transfer of this item.", { appearance: 'info', autoDismiss: true, });
        await withdrawAsset(id, mainnetAddress, globalState.address, globalState, handleSuccess, handleError);
      } else {
        handleError("No address received from MetaMask.");
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
      if (mainnetAddress) {
        addToast("Starting transfer of this item.", { appearance: 'info', autoDismiss: true, });
        await depositAsset(id, 'webaverse', mainnetAddress, globalState.address, globalState, handleSuccess, handleError);
      } else {
        handleError("No address received from MetaMask.");
      }
    } catch (err) {
      handleError(err.toString());
    }
  }

  const handleAddCollaborator = () => {
   const address = prompt("What is the address of the collaborator to add?", "0x0");

    if (address) {
      addNftCollaborator(hash, address, handleSuccess, handleError, globalState);
      setLoading(true);
    }
    else alert("No address given.");
  }

  const handleRemoveCollaborator = () => {
   const address = prompt("What is the address of the collaborator to remove?", "0x0");

    if (address) {
      removeNftCollaborator(hash, address, handleSuccess, handleError, globalState);
      setLoading(true);
    }
    else alert("No address given.");
  }


  return (
    <>
    { tryOn ?
      <>
        <a className="button" onClick={() => setTryOn(false)}>
          Go back
        </a>
        <div className="IFrameContainer">
          <iframe className="IFrame" src={"https://app.webaverse.com/?t=" + id} />
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
                id={id}
                key={id}
                assetName={name}
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
                imageView={imageView}
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
                            is3d && imageView != "3d" && (<button className="assetDetailsButton" onClick={() => setImageView("3d")}>See in 3d</button>),
                            is3d && imageView != "2d" && (<button className="assetDetailsButton" onClick={() => setImageView("2d")}>See in 2d</button>),
                            (<Link href={"/preview/" + id}><button className="assetDetailsButton">Try in Webaverse</button></Link>),
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
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleSetAssetName}>Change Asset Name</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleDeleteAsset}>Delete This Item</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleAddCollaborator}>Add Collaborator</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleRemoveCollaborator}>Remove Collaborator</button>),
                          ]}
                        </div>
                        )}
                    </div>),
                    userOwnsThisAsset && (<div className="Accordion">
                        <div className="accordionTitle" onClick={() => setToggleAddOpen(!toggleAddOpen)}>
                            <span className="accordionTitleValue">Add</span>
                            <span className={`accordionIcon ${toggleAddOpen ? 'reverse' : ''}`}></span>
                        </div>
                        {toggleAddOpen && (
                        <div className="accordionDropdown">
                          {[
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleSetAvatar}>Set As Avatar</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleSetHomespace}>Set As Homespace</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={addToLoadout}>Add To Loadout</button>),
                          ]}
                        </div>
                        )}
                    </div>),
                    (stuck || userOwnsThisAsset || tokenOnMain) && (<div className="Accordion">
                        <div className="accordionTitle" onClick={() => setToggleTradeOpen(!toggleTradeOpen)}>
                            <span className="accordionTitleValue">Trade</span>
                            <span className={`accordionIcon ${toggleTradeOpen ? 'reverse' : ''}`}></span>
                        </div>
                        {toggleTradeOpen && (
                        <div className="accordionDropdown">
                          {[
                            stuck && !tokenOnMain && !userOwnsThisAsset && (<button className="assetDetailsButton" onClick={() => resubmitAsset("NFT", id, globalState, handleSuccess, handleError)}>Resubmit Transfer</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleDeposit}>Transfer To {otherNetworkName}</button>),
                            tokenOnMain && (<button className="assetDetailsButton" onClick={handleWithdraw}>Transfer From {otherNetworkName}</button>),
                            userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleSellAsset}>Sell This Item</button>),
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

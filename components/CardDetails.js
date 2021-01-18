import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import AssetCard from './Card';
import CardSize from '../constants/CardSize.js';
import { addNftCollaborator, removeNftCollaborator, setAssetName, deleteAsset, setLoadoutState, setAvatar, setHomespace, depositAsset, cancelSale, sellAsset, buyAsset } from '../functions/AssetFunctions.js'
import { getStores } from '../functions/UIStateFunctions.js'
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
    assetType
}) => {

  const [sellAssetShowing, setSellAssetShowing] = useState(false);
  const [salePrice, setSalePrice] = useState(0);
  const [toggleReuploadOpen, setToggleReuploadOpen] = useState(false);
  const [toggleRenameOpen, setToggleRenameOpen] = useState(false);
  const [toggleDestroyOpen, setToggleDestroyOpen] = useState(false);
  const [toggleCancelSaleOpen, setToggleCancelSaleOpen] = useState(false);
  // const [toggleSaleOpen, setToggleSaleOpen] = useState(false);
  const [toggleOnSaleOpen, setToggleOnSaleOpen] = useState(false);
  const [toggleTransferToOpen, setToggleTransferToOpen] = useState(false);
  const [toggleDropdownConfirmOpen, setToggleDropdownConfirmOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [calculatedCardSize, setCalculatedCardSize] = useState(CardSize.Large)
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [imageView, setImageView] = useState("2d");
  const [tryOn, setTryOn] = useState(false);

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

  // Otherwise, is this asset for sale?
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

  const loginWithMetaMask = async () => {
    if (!ethEnabled()) {
      return;
    } else {
      const web3 = window.web3;
      try {
        const eth = await window.ethereum.request({ method: 'eth_accounts' });
        if (eth && eth[0]) {
          return eth[0];
        } else {
          ethereum.on('accountsChanged', (accounts) => {
            handleDeposit();
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

  const handleSetAssetName = (e) => {
    e.preventDefault();
    setLoading(true);
    const name = prompt("What would you like to name this asset?", "");
    setAssetName(name, hash, globalState, handleSuccess, handleError);
  }

  const handleSetAvatar = (e) => {
      e.preventDefault();
      setLoading(true);
      setAvatar(id, globalState, handleSuccess, handleError)
  }

  const handleSetHomespace = (e) => {
      e.preventDefault();
      setLoading(true);
      setHomespace(id, globalState, handleSuccess, handleError);
  }

  const addToLoadout = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadoutNum = prompt("What loadout number do you want to add this to?", "1");
    await setLoadoutState(id, loadoutNum, globalState);
    setLoading(false);
  }

  // const removeFromLoadout = (e) => {
  //     e.preventDefault();
  //     removeFromLoadout(id, () => console.log("Changed homespace to ", id), (err) => console.log("Failed to change homespace", err));
  // }

  const handleBuyAsset = (e) => {
    e.preventDefault();
    setLoading(true);
    var r = confirm("You are about to buy this, are you sure?");
    if (r == true) {
      buyAsset(storeId, 'sidechain', globalState.loginToken.mnemonic, handleSuccess, handleError);
    } else {
      handleError("canceled delete");
    }
  }

  const handleDeleteAsset = (e) => {
    e.preventDefault();
    setLoading(true);
    var r = confirm("You are about to permanently delete this, are you sure?");
    if (r == true) {
      deleteAsset(id, globalState.loginToken.mnemonic, handleSuccess, handleError);
    } else {
      handleError("canceled delete");
    }
  }

  const handleSellAsset = (e) => {
    e.preventDefault();
    setLoading(true);
    const sellPrice = prompt("How much would you like to sell this for?", "10");
    sellAsset(id, sellPrice, 'sidechain', globalState.loginToken.mnemonic, handleSuccess, handleError);
  }

  const handleDeposit = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const ethAccount = await loginWithMetaMask();
      if (ethAccount) {
        const mainnetAddress = prompt("What mainnet address do you want to send to?", "0x0");
        await depositAsset(id, 'webaverse', mainnetAddress, globalState.address, globalState);
        handleSuccess();
      } else {
        setLoading(false);
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

  const handleReupload = (e) => {
      e.preventDefault();
      console.warn("TODO: Handle reuploading image");
  }

/*
  const handleCancelSale = (e) => {
      e.preventDefault();
      cancelSale(id, networkType, () => console.log("Changed homespace to ", id), (err) => console.log("Failed to change homespace", err));
  }
*/

  const handleHideSellAsset = (e) => {
      e.preventDefault();
      setSellAssetShowing(false);
  }

/*
  const handleSellAsset = (e) => {
      e.preventDefault();
      if(salePrice < 0) return console.error("Sale price can't be less than 0");
      console.log("Selling id", id, "from login token", globalState.loginToken.mnemonic);
      sellAsset(
          id,
          salePrice,
          networkType,
          globalState.loginToken.mnemonic,
          (success) => console.log("Sold asset ", id, success),
          (err) => console.log("Failed to sell asset", err)
      );
  }
*/

/*
  const handleBuyAsset = (e) => {
      e.preventDefault();
      buyAsset(
          id,
          networkType,
          globalState.loginToken.mnemonic,
          () => console.log("Buying Asset", id),
          (err) => console.log("Failed to purchase asset", err)
      );
  }
*/

  const toggleReupload = () => {
      setToggleReuploadOpen(!toggleReuploadOpen);
  }

  const toggleRename = () => {
      setToggleRenameOpen(!toggleRenameOpen);
  }
 
  const toggleDestroy = () => {
      setToggleDestroyOpen(!toggleDestroyOpen);
  }

  const toggleCancelSale = () => {
      setToggleCancelSaleOpen(!toggleCancelSaleOpen);
  }

  const toggleShowSellAsset = () => {
      setSellAssetShowing(!sellAssetShowing);
  }

  const toggleTransferTo = () => {
      setToggleTransferToOpen(!toggleTransferToOpen);
  }

  const toggleDropdownConfirm = () => {
      setToggleDropdownConfirmOpen(!toggleDropdownConfirmOpen)
  }

  const toggleOnSale = () => {
      setToggleOnSaleOpen(!toggleOnSaleOpen)
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
      <div>
        <div className="assetDetailsContainer">
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
                glow={true}
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
                (<div className="detailsBlock detailsBlockSet">
                  {[
                    is3d && imageView != "3d" && (<button className="assetDetailsButton" onClick={() => setImageView("3d")}>See in 3d</button>),
                    is3d && imageView != "2d" && (<button className="assetDetailsButton" onClick={() => setImageView("2d")}>See in 2d</button>),
                    (<button className="assetDetailsButton" onClick={() => setTryOn(true)}>Try in Webaverse</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleSetAssetName}>Change Asset Name</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleSetAvatar}>Set As Avatar</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleSetHomespace}>Set As Homespace</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={addToLoadout}>Add To Loadout</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleDeposit}>Transfer To Mainnet</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleSellAsset}>Sell This Item</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleDeleteAsset}>Delete This Item</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleAddCollaborator}>Add Collaborator</button>),
                    userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleRemoveCollaborator}>Remove Collaborator</button>),
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
      </div>
    </div>
    }
    </>
  );
};

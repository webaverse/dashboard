import React, { useContext, useState, useEffect } from 'react';
import { useAppContext } from "../libs/contextLib";
import address from '../webaverse/address.js';
import CardSize from '../constants/CardSize.js';
import { deployLand, depositLand, deleteAsset, setLoadoutState, setAvatar, setHomespace, withdrawAsset, depositAsset, cancelSale, sellAsset, buyAsset } from '../functions/AssetFunctions.js'
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
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [mainnetAddress, setMainnetAddress] = useState(null);
  const [landMainnetAddress, setLandMainnetAddress] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    (async () => {
      const main = await getLandMain(id);
      setLandMainnetAddress(main.owner.address);
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

  const handleSetAvatar = (e) => {
      e.preventDefault();
      console.log("Setting avatar, id is", id);
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

  const handleWithdraw = async (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const ethAccount = await loginWithMetaMask(handleWithdraw);
      if (ethAccount) {
        const mainnetAddress = prompt("What mainnet address do you want to get from?", "0x0");
        await withdrawAsset(id, mainnetAddress, globalState.address, globalState, handleSuccess, handleError);
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

  const handleDeploy = file => {
    console.log(file);
    if (file) {
      let reader = new FileReader();
      reader.onloadend = () => {
        setFile(file);
        deployLand(file, id, handleSuccess, handleError, globalState);
        console.log(file);
      }
      reader.readAsDataURL(file);
    }
    else console.warn("Didnt upload file");
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
    <div className="assetDetailsContainer">
      <div className="assetDetails">
        { loading ?
          <Loader loading={loading} />
        : [
        (<div className="assetDetailsLeftColumn">
          <AssetCard
            key={id}
            id={id}
            name={name}
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
            (<div className="detailsBlock detailsBlockSet">
              {[
                (<a target="_blank" href={external_url}><button className="assetDetailsButton">Visit land</button></a>),
                landMainnetAddress && !landMainnetAddress.includes("0x0000000") && !landMainnetAddress.includes(address["main"]["LANDProxy"]) && (<a target="_blank" href={"https://testnets.opensea.io/assets/" + address["main"]["LAND"] + "/" + id}><button className="assetDetailsButton">View on OpenSea</button></a>),
                landMainnetAddress && !landMainnetAddress.includes("0x0000000") && !landMainnetAddress.includes(address["main"]["LANDProxy"]) && (<button className="assetDetailsButton" onClick={handleWithdraw}>Transfer From Mainnet</button>),
                userOwnsThisAsset && (<button className="assetDetailsButton" onClick={handleDeposit}>Transfer To Mainnet</button>),
                userOwnsThisAsset && (<label htmlFor="input-file" className="assetDetailsButton">Deploy Content</label>),
                userOwnsThisAsset && (<input type="file" id="input-file" onChange={(e) => handleDeploy(e.target.files[0])} multiple={false} style={{display: 'none'}} />),
              ]}
            </div>),

            globalState.address && !userOwnsThisAsset && storeId && buyPrice && (
            <div className="detailsBlock detailsBlockSet">
              <button className="assetDetailsButton" onClick={handleBuyAsset}>Buy This Item</button>
            </div>),

/*
            (userCreatedThisAsset &&
            <div className="detailsBlock detailsBlockEdit">
             <div className="Accordion">
               <div className="accordionTitle" onClick={toggleReupload}>
                 <span className="accordionTitleValue">Reupload file</span>
                 <span className="accordionIcon {toggleReuploadOpen ? 'reverse' : ''}"></span>
               </div>

               {toggleReuploadOpen && 
               <div className="accordionDropdown">
                 <button className="assetDetailsButton assetSubmitButton" onClick={handleReupload}>Reupload</button>   
               </div>}

             </div>
             <div className="Accordion">
               <div className="accordionTitle" onClick={toggleRename}>
                 <span className="accordionTitleValue">Rename asset</span>
                 <span className="accordionIcon {toggleRenameOpen ? 'reverse' : ''}"></span>
               </div>
               {toggleRenameOpen && 
               <div className="accordionDropdown">
                 <button className="assetDetailsButton assetSubmitButton" onClick={() => console.log('rename asset')}>rename</button>   
               </div>}
             </div>

             <div className="Accordion">
               <div className="accordionTitle" onClick={toggleDestroy}>
                 <span className="accordionTitleValue">destroy asset</span>
                 <span className="accordionIcon {toggleDestroyOpen ? 'reverse' : ''}"></span>
               </div>
               {toggleDestroyOpen && 
               <div className="accordionDropdown">
                 <button className="assetDetailsButton assetSubmitButton" onClick={() => console.log('destroy')}>destroy</button>   
               </div>}
             </div>
            </div>),
*/
            

/*
            userOwnsThisAsset && (
            <div className="detailsBlock detailsBlockTransferTo">
              <div className="Accordion">
                <div className="accordionTitle" onClick={toggleTransferTo}>
                  <span className="accordionTitleValue">TRANSFER TO MAINNET</span>
                  <span className="accordionIcon {toggleTransferToOpen ? 'reverse' : ''}"></span>
                </div>
                {toggleTransferToOpen && 
                <div className="accordionDropdown transferToDropdown">
                  <button className="assetDetailsButton assetSubmitButton" onClick={handleDeposit}>To {networkType === 'webaverse' ? 'Mainnet' : 'Webaverse'}</button>      
                </div>}
              </div>
            </div>),
            

            userOwnsThisAsset && (
              isForSale ? 
              <div className="detailsBlock detailsBlockCancelSell">
                <div className="Accordion">
                  <div className="accordionTitle" onClick={toggleCancelSale}>
                    <span className="accordionTitleValue">Cancel sell</span>
                    <span className="accordionIcon {toggleCancelSaleOpen ? 'reverse' : ''}"></span>
                  </div>
                  (toggleCancelSaleOpen && 
                  <div className="accordionDropdown">
                    <button className="assetDetailsButton assetSubmitButton" onClick={handleCancelSale}>Cancel</button>      
                  </div>)
                </div>
              </div>
             : 
              (!sellAssetShowing ? 
                <div className="detailsBlock detailsBlockSell">
                  <div className="Accordion">
                    <div className="accordionTitle" onClick={toggleShowSellAsset}>
                      <span className="accordionTitleValue">sell in gallery</span>
                      <span className="accordionIcon {sellAssetShowing ? 'reverse' : ''}"></span>
                    </div>
                  </div>
                </div>
              : 
                <div className="detailsBlock detailsBlockSell">
                  <div className="Accordion">
                    <div className="accordionTitle" onClick={toggleShowSellAsset}>
                      <span className="accordionTitleValue">sell in gallery</span>
                      <span className="accordionIcon {sellAssetShowing ? 'reverse' : ''}"></span>
                    </div>
                    <div className="accordionDropdown sellInputDropdown">
                      <div className="sellConfirmLine">
                        <button className="assetDetailsButton assetSubmitButton" onClick={handleSellAsset}>Sell</button>
                      </div>
                    </div>
                  </div>
                </div>)
                ),
 */
            
/*
                (globalState.address && !userOwnsThisAsset && storeId && buyPrice ?
                  <div className="detailsBlock detailsBlockOnSale">
                    <div className="Accordion">
                      <span className="accordionTitleValue">ON SALE FOR {buyPrice}Ψ</span>
                      <span className="accordionIcon {toggleOnSaleOpen ? 'reverse' : ''}"></span>
                      <div className="accordionDropdown accordionDropdownWithConfirm">
                        {[(<button className={`assetDetailsButton assetSubmitButton ${toggleDropdownConfirmOpen ? 'disable' : ''}`} onClick={toggleDropdownConfirm}>Buy Asset</button>),
                        (toggleDropdownConfirmOpen &&
                          <div className="accordionDropdownConfirm">
                            <span className="dropdownConfirmTitle">A you sure?</span>
                            <div className="dropdownConfirmSubmit">
                              <button className="assetDetailsButton assetSubmitButton assetSubmitButtonSmall" onClick={handleBuyAsset}>Buy</button>
                              <button className="assetDetailsButton assetSubmitButton assetSubmitButtonSmall" onClick={toggleDropdownConfirm}>Nope</button>
                            </div>
                          </div>)]}
                        </div>
                    </div>
                  </div>    
              : null)
*/
            ]}

      </div>)
    ]}
    </div>
  </div>
  );
};

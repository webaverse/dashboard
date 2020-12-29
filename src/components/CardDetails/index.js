import React, { useContext, useState, useEffect } from 'react';
import AssetCard from '../Card';
import CardSize from '../../constants/CardSize.js';
import { setLoadoutState, setAvatar, setHomespace, depositAsset, cancelSale, sellAsset, buyAsset } from '../../functions/AssetFunctions.js'
import { getStores } from '../../functions/UIStateFunctions.js'
import './style.css';

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
  const [store, setStore] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
      document.documentElement.clientWidth < 585 ? setCalculatedCardSize(CardSize.Small) :
      document.documentElement.clientWidth < 750 ? setCalculatedCardSize(CardSize.Medium) : 
                                                   setCalculatedCardSize(CardSize.Large)
  },  [document.documentElement.clientWidth])

  useEffect(() => {
    getStores().then(res => {
      if (res[id]) {
        setStore(res[id].id);
        setPrice(res[id].price);
      }
    });
  }, []);

  // Do you own this asset?
  console.log("Owner address is", ownerAddress);
  console.log("minterAddress address is", minterAddress);

  console.log("State address is", globalState.address);

  const userOwnsThisAsset = ownerAddress.toLowerCase() === globalState.address.toLowerCase();

  // Did you create this asset?
  const userCreatedThisAsset = minterAddress.toLowerCase() === globalState.address.toLowerCase();

  // Otherwise, is this asset for sale?
  const isForSale = buyPrice !== undefined && buyPrice !== null && buyPrice !== ""

  console.log("**** Buy price is", price);

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  const loginWithMetaMask = async () => {
    if (!ethEnabled()) {
      return "Please install MetaMask to use Webaverse!";
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

  const handleSuccess = () => console.log("success!");
  const handleError = (err) => console.log("error", err);

  const handleSetAvatar = (e) => {
      e.preventDefault();
      console.log("Setting avatar, id is", id);
      setAvatar(id, globalState, handleSuccess, handleError)
  }

  const handleSetHomespace = (e) => {
      e.preventDefault();
      setHomespace(id, globalState, handleSuccess, handleError);
  }

  const addToLoadout = async (e) => {
    e.preventDefault();
    const loadoutNum = prompt("What loadout number do you want to add this to?", "1");
    await setLoadoutState(id, loadoutNum, globalState);
  }

  // const removeFromLoadout = (e) => {
  //     e.preventDefault();
  //     removeFromLoadout(id, () => console.log("Changed homespace to ", id), (err) => console.log("Failed to change homespace", err));
  // }

  const handleBuyAsset = (e) => {
    e.preventDefault();
    setLoading(true);
    buyAsset(store, 'sidechain', globalState.loginToken.mnemonic, handleSuccess, handleError);
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
      } if (ethEnabled()) {
        setPending(true);
      } else {
        setLoading(false);
      }
    } catch (err) {
      handleError(err.toString());
    }
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
    <div className="assetDetailsContainer">
      <div className="assetDetails">
        <div className="assetDetailsLeftColumn">
          <AssetCard
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
          /> 
        </div>
        <div className="assetDetailsRightColumn">
          {[
            userOwnsThisAsset && (
            <div className="detailsBlock detailsBlockSet">
              <button className="assetDetailsButton" onClick={handleSetAvatar}>Set As Avatar</button>
              <button className="assetDetailsButton" onClick={handleSetHomespace}>Set As Homespace</button>
              <button className="assetDetailsButton" onClick={addToLoadout}>Add To Loadout</button>
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
              
            
           
                (globalState.address && !userOwnsThisAsset && store && price ? 
                  <div className="detailsBlock detailsBlockOnSale">
                    <div className="Accordion">
                      <div className="accordionTitle" onClick={toggleOnSale}>
                        <span className="accordionTitleValue">ON SALE FOR {price}Ψ</span>
                        <span className="accordionIcon {toggleOnSaleOpen ? 'reverse' : ''}"></span>
                      </div>
                      {toggleOnSaleOpen && 
                      <div className="accordionDropdown accordionDropdownWithConfirm">
                        <button className={`assetDetailsButton assetSubmitButton ${toggleDropdownConfirmOpen ? 'disable' : ''}`} onClick={toggleDropdownConfirm}>Buy Asset</button>         
                        {toggleDropdownConfirmOpen && 
                          <div className="accordionDropdownConfirm">
                            <span className="dropdownConfirmTitle">A you sure?</span>
                            <div className="dropdownConfirmSubmit">
                              <button className="assetDetailsButton assetSubmitButton assetSubmitButtonSmall" onClick={handleBuyAsset}>Buy</button>
                              <button className="assetDetailsButton assetSubmitButton assetSubmitButtonSmall" onClick={toggleDropdownConfirm}>Nope</button>
                            </div>
                          </div>}
                      </div>}
                    </div>
                  </div>    
              : null)]}   

        <button className="assetDetailsButton assetDetailsCloseButton" onClick={hideDetails}></button>
      </div>
    </div>
  </div>
  );
};

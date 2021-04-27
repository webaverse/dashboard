import Web3 from "web3";
import React, { useState, useEffect, Fragment } from "react";
import { useToasts } from "react-toast-notifications";
import Link from "next/link";
import AssetCard from "./Card";
import AssetCardSvg from "./CardSvg";
import AssetCard2D from "./Card2D";
import AssetCard3D from "./Card3D";
import AssetCardLive from "./CardLive";
import User from "./User";
import {getBlockchain, runSidechainTransaction, loginWithMetaMask} from "../webaverse/blockchain.js";
import {getProfileForCreator} from "../functions/UIStateFunctions";
import {getAddressProofs, getAddressesFromProofs} from "../functions/Functions";
import {Networks} from "../webaverse/constants.js";
import {getData} from "./Asset";
// import { FileDrop } from 'react-file-drop';
// import { makeWbn, makePhysicsBake } from "../webaverse/build";
import {storageHost, lockHost} from "../webaverse/constants";
import {
  resubmitAsset,
  addNftCollaborator,
  removeNftCollaborator,
  setAssetName,
  deleteAsset,
  setLoadoutState,
  clearLoadoutState,
  setAvatar,
  setHomespace,
  withdrawAsset,
  depositAsset,
  cancelSale,
  sellAsset,
  buyAsset,
  setNftMetadata,
} from "../functions/AssetFunctions.js";
import {formatError} from "../functions/Functions.js";
import Loader from "./Loader";
import bip39 from "../libs/bip39.js";
import hdkeySpec from "../libs/hdkey.js";
const hdkey = hdkeySpec.default;
import wbn from '../webaverse/wbn.js';
import {cancelEvent, base64ArrayBuffer} from "../webaverse/util";
import FileBrowser from './FileBrowser';
import AssetCardSwitch from './CardSwitch';
import {proofOfAddressMessage} from '../constants/UnlockConstants.js';
import procgen, {types} from '../webaverse/procgen.js';

const networkNames = Object.keys(Networks);
const _capitalize = s => s[0].toUpperCase() + s.slice(1);
const handleDeposit = async (
  id,
  sourceNetworkName,
  destinationNetworkName,
  globalState,
  {
    addToast,
    handleSuccess,
    handleError,
  }
) => {
  try {
    const mainnetAddress = await loginWithMetaMask();
    if (mainnetAddress) {
      addToast("Starting NFT chain transfer...", {
        appearance: "info",
        autoDismiss: true,
      });
      try {
        await depositAsset(
          id,
          sourceNetworkName,
          destinationNetworkName,
          mainnetAddress,
          globalState.address,
          globalState
        );
        handleSuccess();
      } catch (err) {
        handleError(err);
      }
    } else {
      handleError("No address received from MetaMask.");
    }
  } catch (err) {
    handleError(err);
  }
};

/* const CardActions = ({
  toggleViewOpen,
  setToggleViewOpen,
  setImageView,
  toggleAddOpen,
  userOwnsThisAsset,
  toggleEditOpen,
  setToggleEditOpen,
  toggleResubmitOpen,
  setToggleResubmitOpen,
  toggleTransferOpen,
  setToggleTransferOpen,
  unlockableSpec,
  imageView,
  handleUnlock,
  openFileBrowser,
  currentLocation,
  isStuck,
}) => {
  return (
    <Fragment>
      <div className="Accordion">
        <div
          className="accordionTitle"
          onClick={() => setToggleViewOpen(!toggleViewOpen)}
        >
          <span className="accordionTitleValue">View</span>
          {toggleViewOpen ?
            <img src="/chevron-up.svg" className="accordionIcon" />
          :
            <img src="/chevron-down.svg" className="accordionIcon" />
          }
        </div>
        {toggleViewOpen && (
          <div className="accordionDropdown">
            {imageView != "3d" && (
              <button
                className="assetDetailsButton"
                onClick={() => setImageView("3d")}
              >
                See in 3d
              </button>
            )}
            {imageView != "2d" && (
              <button
                className="assetDetailsButton"
                onClick={() => setImageView("2d")}
              >
                See in 2d
              </button>
            )}
            <Link href={"/preview/" + id}>
              <button className="assetDetailsButton">
                Try in Webaverse
              </button>
            </Link>
            {unlockableSpec ? (
              <div className="assetDetailsButton">
                {unlockableSpec.ok
                  ? (unlockableSpec.result || '[no unlockable]')
                  : "Could not unlock :("}
              </div>
            ) : (
              <button
                className="assetDetailsButton"
                onClick={handleUnlock}
              >
                Unlock content
              </button>
            )}
            <button
              className="assetDetailsButton"
              onClick={openFileBrowser}
            >
              File browser
            </button>
          </div>
        )}
      </div>
      <div className="Accordion">
        <div
          className="accordionTitle"
          onClick={() => setToggleAddOpen(!toggleAddOpen)}
        >
          <span className="accordionTitleValue">Add</span>
          {toggleAddOpen ?
            <img src="/chevron-up.svg" className="accordionIcon" />
          :
            <img src="/chevron-down.svg" className="accordionIcon" />
          }
        </div>
        {toggleAddOpen && (
          <div className="accordionDropdown">
            <button
              className="assetDetailsButton"
              onClick={handleSetAvatar}
            >
              Set As Avatar
            </button>
            <button
              className="assetDetailsButton"
              onClick={handleSetHomespace}
            >
              Set As Homespace
            </button>
            <button
              className="assetDetailsButton"
              onClick={addToLoadout}
            >
              Add To Loadout
            </button>
            <button
              className="assetDetailsButton"
              onClick={clearLoadout}
            >
              Clear From Loadout
            </button>
          </div>
        )}
      </div>
      {userOwnsThisAsset && (
        <div className="Accordion">
          <div
            className="accordionTitle"
            onClick={() => setToggleEditOpen(!toggleEditOpen)}
          >
            <span className="accordionTitleValue">Edit</span>
            {toggleEditOpen ?
              <img src="/chevron-up.svg" className="accordionIcon" />
            :
              <img src="/chevron-down.svg" className="accordionIcon" />
            }
          </div>
          {toggleEditOpen && (
            <div className="accordionDropdown">
              <button
                className="assetDetailsButton"
                onClick={handleSetAssetName}
              >
                Change Asset Name
              </button>
              <button
                className="assetDetailsButton"
                onClick={handleDeleteAsset}
              >
                Burn This Item
              </button>
              <button
                className="assetDetailsButton"
                onClick={handleAddCollaborator}
              >
                Add Collaborator
              </button>
              <button
                className="assetDetailsButton"
                onClick={handleRemoveCollaborator}
              >
                Remove Collaborator
              </button>
            </div>
          )}
        </div>
      )}
      {(userOwnsThisAsset && currentLocation === 'sidechain') && (
        <div className="Accordion">
          <div
            className="accordionTitle"
            onClick={() =>
              setToggleTradeOpen(!toggleTradeOpen)
            }
          >
            <span className="accordionTitleValue">Trade</span>
            {toggleTradeOpen ?
              <img src="/chevron-up.svg" className="accordionIcon" />
            :
              <img src="/chevron-down.svg" className="accordionIcon" />
            }
          </div>
          {toggleTradeOpen && (
            <div className="accordionDropdown">
              <button
                className="assetDetailsButton"
                onClick={handleSellAsset}
              >
                Sell item
              </button>
            </div>
          )}
        </div>
      )}
      {(
        <div className="Accordion">
          {(userOwnsThisAsset && isStuck) ? (
            <div
              className="accordionTitle"
              onClick={() =>
                setToggleResubmitOpen(!toggleResubmitOpen)
              }
            >
              <span className="accordionTitleValue">Resubmit</span>
              <span
                className={`accordionIcon ${
                  toggleResubmitOpen ? "reverse" : ""
                }`}
              ></span>
            </div>
          ) : null}    
          {toggleResubmitOpen && (
            <div className="accordionDropdown">
                {(currentLocation === 'mainnetsidechain-stuck') ? <button
                  className="assetDetailsButton"
                  onClick={async () => {
                    const mainnetAddress = await loginWithMetaMask();
                    await resubmitAsset(
                      currentLocationUnstuck,
                      'NFT',
                      'mainnet',
                      id,
                      globalState.address,
                      mainnetAddress,
                      globalState.loginToken.mnemonic,
                      handleSuccess,
                      handleError
                    )
                  }}
                >
                  Resubmit to mainchain
                </button> : null}
                {(currentLocation === 'mainnetsidechain-stuck') ? <button
                  className="assetDetailsButton"
                  onClick={async () => {
                    const mainnetAddress = await loginWithMetaMask();
                    await resubmitAsset(
                      currentLocationUnstuck,
                      'NFT',
                      'polygon',
                      id,
                      globalState.address,
                      mainnetAddress,
                      globalState.loginToken.mnemonic,
                      handleSuccess,
                      handleError
                    )
                  }}
                >
                  Resubmit to polygon
                </button> : null}
                {(currentLocation !== 'mainnetsidechain-stuck') ? <button
                  className="assetDetailsButton"
                  onClick={async () => {
                    const mainnetAddress = await loginWithMetaMask();
                    await resubmitAsset(
                      currentLocationUnstuck,
                      'NFT',
                      'mainnetsidechain',
                      id,
                      globalState.address,
                      mainnetAddress,
                      globalState.loginToken.mnemonic,
                      handleSuccess,
                      handleError
                    );
                  }}
                >
                  Resubmit to sidechain
                </button> : null}
            </div>
          )}
        </div>
      )}
      {(
        <div className="Accordion">
          {(userOwnsThisAsset && !isStuck) ? (
            <div
              className="accordionTitle"
              onClick={() =>
                setToggleTransferOpen(!toggleTransferOpen)
              }
            >
              <span className="accordionTitleValue">Transfer</span>
              <span
                className={`accordionIcon ${
                  toggleTransferOpen ? "reverse" : ""
                }`}
              ></span>
            </div>
          ) : null}    
          {toggleTransferOpen && (
            <div className="accordionDropdown">
                {(() => {
                  const results = [];
                  if (!/stuck/.test(currentLocation)) {
                    for (const transferOptionNetworkName of Networks[currentLocation].transferOptions) {
                      results.push(
                        <button
                          className="assetDetailsButton"
                          onClick={e => handleDeposit(currentLocation, transferOptionNetworkName)(e)}
                          key={transferOptionNetworkName}
                        >
                          Transfer to {transferOptionNetworkName}
                        </button>
                      );
                    }
                  }
                  return results;
                })()}
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
}; */

const Window = ({className, children, onBackgroundClick}) => {
  return <div className={`window ${className}`}>
    <div className="background" onClick={onBackgroundClick} />
    {children}
  </div>
};
const TransferMenu = ({
  id,
  globalState,
  addToast,
  handleSuccess,
  handleError,
  currentLocation,
  onCancel,
}) => {
  const network = Networks[currentLocation];
  const {displayName, transferOptions, iconSrc} = network;
  
  const [transferOption, setTransferOption] = useState(transferOptions[0]);
  
  const doTransfer = async () => {
    const receipt = await handleDeposit(
      id,
      currentLocation,
      transferOption,
      globalState,
      {
        addToast,
        handleSuccess,
        handleError,
      }
    );
    console.log('did transfer', receipt);
    onCancel();
  };
  const currentNetwork = Networks[currentLocation.replace(/\-stuck$/, '')];
  
  return (
    <div className="transfer-menu">
      <div className="label">Current location</div>
      <div className="network">
        <img className="icon" src={currentNetwork.iconSrc} onDragStart={cancelEvent} />
        <div className="text">{currentNetwork.displayName}</div>
      </div>
      <div className="label">Transfer to</div>
      <div className="transfer-options">
        {transferOptions.map((n, i) => {
          const network = Networks[n];
          return (
            <div
              className={`transfer-option ${transferOption === n ? 'selected' : ''}`}
              onClick={e => {
                setTransferOption(n);
              }}
            >
              <img className="transfer-icon" src="/chevron-down.svg" onDragStart={cancelEvent} />
              <div className="network">
                <img className="icon" src={network.iconSrc} onDragStart={cancelEvent} />
                <div className="text">{network.displayName}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="buttons">
        <input type="button" value="Transfer" onChange={e => {}} disabled={!transferOption} className="button ok" onClick={doTransfer} />
        <input type="button" value="Cancel" onChange={e => {}} className="button cancel" onClick={onCancel} />
      </div>
    </div>
  );
};
const UnlockableMenu = ({
  id,
  onCancel,
}) => {
  const [unlockable, setUnlockable] = useState('');
  const [focused, setFocused] = useState(false);
  
  let inputEl = null;
  const _updateInputFocus = () => {
    if (!focused && inputEl) {
      inputEl.focus();
      setFocused(true);
    }
  };
  useEffect(() => {
    _updateInputFocus();
  }, [focused]);
  
  const doSetUnlockable = async () => {
    const res = await fetch(`${lockHost}/${id}`, {
      method: 'POST',
      body: unlockable,
    });
    const tag = res.headers.get('tag');
    const ab = await res.arrayBuffer();
    
    const ciphertext = base64ArrayBuffer(ab);
    // console.log('got base64', b64);
    
    const j = {
      ciphertext,
      tag,
    };
    const s = JSON.stringify(j);
    await setNftMetadata(id, 'unlockable', s, globalState);
    
    onCancel();
  };
  
  return (
    <div className="unlockable-menu">
      <div className="label">Set unlockable</div>
      <input type="text" value={unlockable} onChange={e => {
        setUnlockable(e.target.value);
      }} ref={el => {
        inputEl = el;
      }} />
      <input className="button ok" type="button" value="Update" disabled={!unlockable} onChange={e => {}} onClick={doSetUnlockable} />
    </div>
  );
};
const EncryptionMenu = ({
  id,
  onCancel,
}) => {
  const [file, setFile] = useState(null);
  
  const doSetEncryption = async () => {
    // XXX    

    onCancel();
  };
  
  return (
    <div className="encryption-menu">
      <div className="label">Set encrypted content</div>
      <input type="file" value={''} onChange={e => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          setFile(files[0]);
        } else {
          setFile(null);
        }
      }} />
      <input className="button ok" type="button" value="Update" disabled={!file} onChange={e => {}} onClick={doSetEncryption} />
    </div>
  );
};

const CardDetails = ({
  id,
  name,
  setName,
  description,
  setDescription,
  image,
  hash,
  animation_url,
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
  currentOwnerAddress,
  buyPrice,
  storeId,
  globalState,
  assetType,
  networkName,
  currentLocation,
  addresses,
  selectedView,
  // setMainnetAddress,
  cardSvgSpec,
}) => {
  /* if (typeof setMainnetAddress !== 'function') {
    throw new Error('no setMainnetAddress method');
  } */
  if (!networkName) {
    throw new Error('no network name :' + networkName);
  }
  const {addToast} = useToasts();

  const [toggleViewOpen, setToggleViewOpen] = useState(true);
  const [toggleEditOpen, setToggleEditOpen] = useState(false);
  const [toggleAddOpen, setToggleAddOpen] = useState(false);
  const [toggleTradeOpen, setToggleTradeOpen] = useState(false);
  const [toggleResubmitOpen, setToggleResubmitOpen] = useState(false);
  const [toggleTransferOpen, setToggleTransferOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [owned, setOwned] = useState(false);

  const [loading, setLoading] = useState(false);
  const [imageView, setImageView] = useState('2d');
  // const [tryOn, setTryOn] = useState(false);
  const [unlockableSpec, setUnlockableSpec] = useState(null);
  const [decryptionSpec, setDecryptionSpec] = useState(null);
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editDescription, setEditDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [unlockableOpen, setUnlockableOpen] = useState(false);
  const [encryptionOpen, setEncryptionOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  let userOwnsThisAsset, userCreatedThisAsset;
  const allAddresses = (globalState.address ? [globalState.address] : []).concat(addresses);
  if (globalState && allAddresses.length > 0) {
    userOwnsThisAsset =
      allAddresses.includes(currentOwnerAddress.toLowerCase()) || /stuck/.test(currentLocation);
    userCreatedThisAsset =
      minterAddress.toLowerCase() === globalState.address.toLowerCase();
    // console.log('user owns this asset', currentLocation, currentOwnerAddress.toLowerCase() === globalState.address.toLowerCase(), !/stuck/.test(currentLocation));
  } else {
    userOwnsThisAsset = false;
    userCreatedThisAsset = false;
  }
  
  let nameInputEl = null;
  const _updateNameInputFocus = () => {
    if (editName && nameInputEl) {
      nameInputEl.focus();
    }
  };
  useEffect(() => {
    _updateNameInputFocus();
  }, [editName]);
  
  let descriptionInputEl = null;
  const _updateDescriptionInputFocus = () => {
    if (editDescription && descriptionInputEl) {
      descriptionInputEl.focus();
    }
  };
  useEffect(() => {
    _updateDescriptionInputFocus();
  }, [editDescription]);

  /* let is3d = false;
  if (ext.toLowerCase() === "vrm" || ext.toLowerCase() === "glb") {
    is3d = true;
  } */

  const isForSale =
    buyPrice !== undefined && buyPrice !== null && buyPrice !== "";

  const handleSuccess = (msg, link) => {
    if (typeof msg === "object") {
      msg = JSON.stringify(msg);
    }
    addToast("Success!", {
      link: link,
      appearance: "success",
      autoDismiss: true,
    });
    getData();
    setLoading(false);
  };
  const handleError = err => {
    console.warn(err);
    addToast(formatError(err), { appearance: "error", autoDismiss: true });
    getData();
    setLoading(false);
  };

  const handleSetAssetName = (e) => {
    e.preventDefault();
    const name = prompt("What would you like to name this asset?", "");
    if (name !== null) {
      addToast("Setting item name to: " + name, {
        appearance: "info",
        autoDismiss: true,
      });
      setAssetName(name, hash, globalState, handleSuccess, handleError);
    }
  };

  const handleSetAvatar = (e) => {
    e.preventDefault();
    addToast("Setting avatar to this item", {
      appearance: "info",
      autoDismiss: true,
    });
    setAvatar(id, globalState, handleSuccess, handleError);
  };

  const handleSetHomespace = (e) => {
    e.preventDefault();
    addToast("Setting homespace to this item", {
      appearance: "info",
      autoDismiss: true,
    });
    setHomespace(id, globalState, handleSuccess, handleError);
  };

  const clearLoadout = async (e) => {
    e.preventDefault();
    const loadoutNum = prompt("What loadout number do you want to clear?", "");
    addToast("Clearing loadout number: " + loadoutNum, {
      appearance: "info",
      autoDismiss: true,
    });
    await clearLoadoutState(
      loadoutNum,
      globalState,
      handleSuccess,
      handleError
    );
  };

  const addToLoadout = async (e) => {
    e.preventDefault();
    const loadoutNum = prompt(
      "What loadout number do you want to add this to?",
      "1"
    );
    addToast("Setting this item to loadout number " + loadoutNum, {
      appearance: "info",
      autoDismiss: true,
    });
    await setLoadoutState(
      id,
      loadoutNum,
      globalState,
      handleSuccess,
      handleError
    );
  };

  const handleBuyAsset = (e) => {
    e.preventDefault();
    var r = confirm("You are about to buy this, are you sure?");
    if (r == true) {
      addToast("Buying this item...", {
        appearance: "info",
        autoDismiss: true,
      });
      buyAsset(
        storeId,
        "sidechain",
        globalState.loginToken.mnemonic,
        handleSuccess,
        handleError
      );
    } else {
      handleError("canceled delete");
    }
  };

  const handleDeleteAsset = (e) => {
    e.preventDefault();
    var r = confirm(
      "You are about to permanently burn this item, are you sure?"
    );
    if (r == true) {
      addToast("Burning this item...", {
        appearance: "info",
        autoDismiss: true,
      });
      deleteAsset(
        id,
        globalState.loginToken.mnemonic,
        handleSuccess,
        handleError
      );
    } else {
      handleError("Canceled burn.");
    }
  };

  const handleSellAsset = (e) => {
    e.preventDefault();
    const sellPrice = prompt("How much would you like to sell this for?", "10");
    addToast("Selling this item for " + sellPrice + " SILK.", {
      appearance: "info",
      autoDismiss: true,
    });
    sellAsset(
      id,
      sellPrice,
      "sidechain",
      globalState.loginToken.mnemonic,
      handleSuccess,
      handleError
    );
  };

  const handleWithdraw = async (e) => {
    if (e) {
      e.preventDefault();
    }

    try {
      const mainnetAddress = await loginWithMetaMask();
      if (mainnetAddress) {
        addToast("Starting transfer of this item.", {
          appearance: "info",
          autoDismiss: true,
        });
        await withdrawAsset(
          id,
          mainnetAddress,
          globalState.address,
          globalState,
          handleSuccess,
          handleError
        );
      } else {
        handleError("No address received from MetaMask.");
      }
    } catch (err) {
      handleError(err.toString());
    }
  };

  const handleAddCollaborator = () => {
    const address = prompt(
      "What is the address of the collaborator to add?",
      "0x0"
    );

    if (address) {
      addToast("Adding collaborator: " + address, {
        appearance: "info",
        autoDismiss: true,
      });
      addNftCollaborator(
        hash,
        address,
        handleSuccess,
        handleError,
        globalState
      );
    } else handleError(new Error("No address given."));
  };

  const handleRemoveCollaborator = () => {
    const address = prompt(
      "What is the address of the collaborator to remove?",
      "0x0"
    );

    if (address) {
      addToast("Removing collaborator: " + address, {
        appearance: "info",
        autoDismiss: true,
      });
      removeNftCollaborator(
        hash,
        address,
        handleSuccess,
        handleError,
        globalState
      );
      setLoading(true);
    } else {
      handleError(new Error("No address given."));
    }
  };
  const _getSidechainSignature = async mnemonic => {
    const {
      web3,
    } = await getBlockchain();
    
    const wallet = hdkey
      .fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
      .derivePath(`m/44'/60'/0'/0/0`)
      .getWallet();
    const privateKey = wallet.getPrivateKey().toString("hex");

    const result2 = await web3['mainnetsidechain'].eth.accounts.sign(proofOfAddressMessage, privateKey);
    const { v, r, s, signature } = result2;
    const result3 = await web3['mainnetsidechain'].eth.accounts.recover(proofOfAddressMessage, v, r, s);
    // console.log('got sig 2', {signature});
    return signature;
  };
  const _getUnlockable = async (signatures, id) => {
    const res = await fetch("https://unlock.exokit.org/", {
      method: "POST",
      body: JSON.stringify({
        signatures,
        id,
      }),
    });
    const j = await res.json();
    return j;
  };
  const handleUnlock = async () => {
    const {
      loginToken: {
        mnemonic,
      },
    } = globalState;

    const [
      addressProofs,
      sidechainSignature,
    ] = await Promise.all([
      (async () => {
        const profile = await getProfileForCreator(globalState.address);
        const addressProofs = getAddressProofs(profile);
        return addressProofs;
      })(),
      _getSidechainSignature(mnemonic),
    ])
    const spec = await _getUnlockable(
      addressProofs
        .concat([
          sidechainSignature,
        ]),
      id
    );
    // console.log('got unlockable spec', spec);
    setUnlockableSpec(spec);
  };
  const _getDecryption = async (signatures, id) => {
    const res = await fetch("https://decrypt.exokit.org/", {
      method: "POST",
      body: JSON.stringify({
        signatures,
        id,
      }),
    });
    const j = await res.json();
    return j;
  };
  const handleDecrypt = async () => {
    const {
      loginToken: {
        mnemonic,
      },
    } = globalState;

    const [
      addressProofs,
      sidechainSignature,
    ] = await Promise.all([
      (async () => {
        const profile = await getProfileForCreator(globalState.address);
        const addressProofs = getAddressProofs(profile);
        return addressProofs;
      })(),
      _getSidechainSignature(mnemonic),
    ])
    const spec = await _getDecryption(
      addressProofs
        .concat([
          sidechainSignature,
        ]),
      id
    );
    // console.log('got unlockable spec', spec);
    setDecryptionSpec(spec);
  };
  const openFileBrowser = () => {
    setFileBrowserOpen(true);
  };
  const handleLike = e => {
    setLiked(!liked);
  };
  const handleDropdownOpen = e => {
    setDropdownOpen(!dropdownOpen);
  };

  const _saveName = async e => {  
    console.log('save name', editedName);

    setName(editedName);                 
    setEditName(false);
    
    await setNftMetadata(id, 'name', editedName, globalState);
  };
  const _saveDescription = async e => {
    console.log('save description', editedDescription);
    
    setDescription(editedDescription);
    setEditDescription(false);
    
    await setNftMetadata(id, 'description', editedDescription, globalState);
  };
  
  const openUnlockable = () => {
    setUnlockableOpen(true);
    setDropdownOpen(false);
  };
  const closeUnlockable = () => {
    setUnlockableOpen(false);
  };
  const openEncryption = () => {
    setEncryptionOpen(true);
    setDropdownOpen(false);
  };
  const closeEncryption = () => {
    setEncryptionOpen(false);
  };
  
  const openTransferMenu = () => {
    setTransferOpen(true);
    setDropdownOpen(false);
  };
  const closeTransferMenu = () => {
    setTransferOpen(false);
  };
  
  const isStuck = /stuck/.test(currentLocation);
  const currentLocationUnstuck = currentLocation.replace(/\-stuck/, '');
  const spec = procgen(id + '')[0];
  // console.log('got spec', spec);
  let cardSceneWrapEl = null;
  
  useEffect(async () => {
    if (globalState.address) {
      const {
        web3,
      } = await getBlockchain();
      
      const profile = await getProfileForCreator(globalState.address);
      const addressProofs = getAddressProofs(profile);
      const sidechainAddress = globalState.address;
      const provenAddresses = await getAddressesFromProofs(addressProofs, web3, proofOfAddressMessage);
      const addresses = [sidechainAddress].concat(provenAddresses);

      // console.log('got addresses', addresses, currentOwnerAddress);

      setOwned(addresses.includes(currentOwnerAddress));
    }
  }, [globalState.address]);  

  return (
    <Fragment>
            {loading ? (
              <Loader loading={loading} />
            ) : (
              <Fragment>
                {transferOpen ?
                  <Window onBackgroundClick={closeTransferMenu}>
                    <TransferMenu
                      id={id}
                      globalState={globalState}
                      currentLocation={currentLocation}
                      addToast={addToast}
                      handleSuccess={handleSuccess}
                      handleError={handleError}
                      onCancel={closeTransferMenu}
                    />
                  </Window>
                : null}
                {unlockableOpen ?
                  <Window onBackgroundClick={closeUnlockable}>
                    <UnlockableMenu
                      id={id}
                      onCancel={closeUnlockable}
                    />
                  </Window>
                : null}
                {encryptionOpen ?
                  <Window onBackgroundClick={closeEncryption}>
                    <EncryptionMenu
                      id={id}
                      onCancel={closeEncryption}
                    />
                  </Window>
                : null}
                <div
                  className="assetDetailsLeftColumn"
                  ref={el => {
                    cardSceneWrapEl = el;
                  }}
                >
                  <div
                    className="assetDetailsBackground"
                    /* style={{
                      backgroundImage: `linear-gradient(0deg, ${spec.art.color}60 0%, ${spec.art.color}00 100%)`,
                    }} */
                  >
                    <div className="card-buttons like">
                      <div className={`card-button ${liked ? 'selected open' : ''}`} onClick={handleLike}>
                        <img className="only-selected" src="/heart_full.svg" onDragStart={cancelEvent} />
                        <img className="only-not-selected" src="/heart_empty.svg" onDragStart={cancelEvent} />
                      </div>
                      <div className="card-button help">
                        <img src="/help.svg" onDragStart={cancelEvent} />
                      </div>
                      <div className="card-button fullscreen" onClick={e => {
                        if (!document.fullscreenElement) {
                          if (cardSceneWrapEl) {
                            cardSceneWrapEl.requestFullscreen();
                          }
                        } else {
                          document.exitFullscreen();
                        }
                      }}>
                        <img src="/maximize.svg" onDragStart={cancelEvent} />
                      </div>
                      <Link href={`/assets/` + id}>
                        <a className="card-button expand">
                          <img src="/expand.svg" onDragStart={cancelEvent} />
                        </a>
                      </Link>
                      <div className={`card-button dropdown ${dropdownOpen ? 'open' : ''}`} onClick={handleDropdownOpen}>
                        <img src="/dots.svg" onDragStart={cancelEvent} />
                      </div>
                    </div>
                    <div className={`actions ${dropdownOpen ? 'open' : ''}`}>
                      {/* <div className="label">View</div> */}
                      {/* is3d && imageView != "3d" && (
                        <div
                          className="action"
                          onClick={() => setImageView("3d")}
                        >
                          See in 3d
                        </div>
                      ) */}
                      {imageView != "2d" && (
                        <a
                          className="action"
                          onClick={() => setImageView("2d")}
                        >
                          See in 2d
                        </a>
                      )}
                      {/* <Link href={"/preview/" + id}>
                        <button className="assetDetailsButton">
                          Try in Webaverse
                        </button>
                      </Link> */}
                      {/* unlockableSpec ? (
                        <div className="action">
                          {unlockableSpec.ok
                            ? (unlockableSpec.result || '[no unlockable]')
                            : "Could not unlock :("}
                        </div>
                      ) : (
                        <a
                          className="action"
                          onClick={handleUnlock}
                        >
                          Unlock content
                        </a>
                      ) */}
                      {/* <a
                        className="action"
                        onClick={openFileBrowser}
                      >
                        File browser
                      </a> */}
                      
                      <div className="label">Add</div>
                      <a
                        className="action"
                        onClick={handleSetAvatar}
                      >
                        Set as avatar
                      </a>
                      <a
                        className="action"
                        onClick={handleSetHomespace}
                      >
                        Set as homespace
                      </a>
                      <a
                        className="action"
                        onClick={addToLoadout}
                      >
                        Add to loadout
                      </a>
                      {/* <a
                        className="action"
                        onClick={clearLoadout}
                      >
                        Clear From Loadout
                      </a> */}
                      
                      <div className="label">Features</div>
                      <a
                        className="action"
                        onClick={openUnlockable}
                      >
                        Set unlockable
                      </a>
                      <a
                        className="action"
                        onClick={openEncryption}
                      >
                        Set encrypted content
                      </a>
                      
                      <div className="label">Transfer</div>
                      <a
                        className="action"
                        onClick={openTransferMenu}
                      >
                        Transfer to chain...
                      </a>
                    </div>
                    {(() => {
                      const props = {
                        id,
                        key: id,
                        assetName: name,
                        ext,
                        animation_url,
                        description,
                        buyPrice,
                        image,
                        hash,
                        numberInEdition,
                        totalSupply,
                        balance,
                        totalInEdition,
                        assetType,
                        ownerAvatarPreview,
                        ownerUsername,
                        ownerAddress,
                        minterAvatarPreview,
                        minterUsername,
                        minterAddress,
                        cardSize: 'large',
                        glow: false,
                        imageView,
                        cardSvgSpec,
                        tilt: false,
                      };
                      return (
                        <AssetCardSwitch {...props} selectedView={selectedView} />
                      );
                    })()}
                  </div>
                </div>
                <div className="assetDetailsRightColumn">
                  <div className="detailsBlock">
                    <div className="detailsSection left">
                      <User
                        label="owner"
                        userName={ownerUsername}
                        address={ownerAddress}
                        avatarPreview={ownerAvatarPreview}
                      />
                      <div className="assetDetailsLeft">
                        {!editName ?
                          <Fragment>
                            {name ?
                              <div className="name">{name}</div>
                            :
                              <div className="name-placeholder">Untitled</div>
                            }
                            <img
                              className="edit-icon"
                              src="/pencil.svg"
                              onClick={e => {
                                setEditName(!editName);
                                setEditedName(name);
                              }}
                            />
                          </Fragment>
                        :
                          <Fragment>
                            <input type="text" className="name-input" value={editedName} onChange={e => {
                              setEditedName(e.target.value);
                            }} onKeyDown={e => {
                              console.log('got code', e.which);
                              if (e.which === 13) {
                                _saveName();
                              } else if (e.which === 27) {
                                setEditName(false);
                              }
                            }} ref={el => {
                              nameInputEl = el;
                            }} />
                            <input type="button" className="edit-save-button" value="Save" onChange={e => {}} onClick={_saveName} />
                          </Fragment>
                        }
                      </div>
                      <div className="stats">
                        <div className="stat-label">Edition</div>
                        <div className="stat edition-number">1</div>
                        {/* <div className="stat-label">Content details</div> */}
                        <ul className="stat details">
                          <div className="detail file-type">
                            <div className="label">Type</div>
                            <div className="value">{ext}</div>
                          </div>
                          <div className="detail file-size">
                            <div className="label">Size</div>
                            <div className="value">{`305kb`}</div>
                          </div>
                          <div className="detail resolution">
                            <div className="label">Resolution</div>
                            <div className="value">{`500px x 700px`}</div>
                          </div>
                          {/* <div className="detail unlockable">
                            <div className="label">Unlockable</div>
                            <div className="value">{`No`}</div>
                          </div> */}
                        </ul>
                        <div
                          className="currentLocation"
                        >
                          <div className="label">Current location</div>
                          {(() => {
                            const match = currentLocation.match(/^(.*?)(-stuck)?$/);
                            const currentLocationRaw = match[1];
                            const isStuck = !!match[2];
                            
                            const MaybeStuck = () => {
                              return (isStuck ?
                                <div className="warning">
                                  <img className="icon" src="/warning.svg" />
                                  <div>This token is stuck between chains. No worries, you can re-submit the transaction to unstick.</div>
                                  <input
                                    type="button"
                                    onClick={e => {
                                      console.log('click resubmit', e);
                                    }}
                                  />
                                </div>
                              : null);
                            };
                            const MaybeTransfer = () => {
                              return (!isStuck ?
                                <input type="button" value="Transfer" onChange={e => {}} className="transfer" onClick={e => {
                                  setTransferOpen(true);
                                }} />
                              : null);
                            };
                            switch (currentLocationRaw) {
                              case 'mainnetsidechain': {
                                return (
                                  <Fragment>
                                    <div
                                      className="value"
                                      onClick={openTransferMenu}
                                    >
                                      <img className="icon" src="/webaverse.png" />
                                      <div className="text">Webaverse</div>
                                      <MaybeStuck />
                                    </div>
                                    {/* <MaybeTransfer /> */}
                                  </Fragment>
                                );
                                break;
                              }
                              case 'mainnet': {
                                return (
                                  <Fragment>
                                    <div
                                      className="value"
                                      onClick={openTransferMenu}
                                    >
                                      <img className="icon" src="/ethereum.png" />
                                      <div className="text">Webaverse sidechain</div>
                                      <MaybeStuck />
                                    </div>
                                    /* <MaybeTransfer /> */}
                                  </Fragment>
                                );
                                break;
                              }
                              case 'polygon': {
                                return (
                                  <Fragment>
                                    <div
                                      className="value"
                                      onClick={openTransferMenu}
                                    >
                                      <img className="icon" src="/polygon.png" />
                                      <div className="text">{_capitalize(currentLocation)}</div>
                                      <MaybeStuck />
                                    </div>
                                    {/* <MaybeTransfer /> */}
                                  </Fragment>
                                );
                                break;
                              }
                              default: {
                                return <div>Unknown</div>
                              }
                            }
                          })()}
                        </div>
                        <div className="stat collaborators">
                          <div className="collaborator">
                          </div>
                          <div className="collaborator">
                          </div>
                        </div>
                      </div>
                      <div className="features">
                        <div
                          className="feature"
                          onClick={openFileBrowser}
                        >
                          <img className="icon" src="/file.svg" />
                          <div className="feature-wrap">
                            <div className="label">NFT contents</div>
                            <div className="text">Browse files</div>
                          </div>
                        </div>
                        <div
                          className="feature disabled"
                          onClick={handleUnlock}
                        >
                          <img className="icon" src="/chest.svg" />
                          <div className="feature-wrap">
                            <div className="label">Unlockable</div>
                            <div className="text">Open secret</div>
                          </div>
                        </div>
                        <div
                          className="feature disabled"
                          onClick={handleDecrypt}
                        >
                          <img className="icon" src="/secret.svg" />
                          <div className="feature-wrap">
                            <div className="label">Encrypted</div>
                            <div className="text">Decrypt contents</div>
                          </div>
                        </div>
                      </div>
                      <div className="provenance">
                        <div className="stat-label">Provenance</div>
                        <a className="provenance-node ipfs" href={`${storageHost}/ipfs/${hash}`}><img src="/storage.svg" />IPFS</a>
                        <a className="provenance-node sidechain" href={`${storageHost}/${hash}/${name}.${ext}`}><img src="/sidechain.svg" />Sidechain TX</a>
                        <a className="provenance-node etherscan" href={`${storageHost}/${hash}/${name}.${ext}`}><img src="/ethereum.svg" />Etherscan TX</a>
                      </div>
                    </div>
                    <div className="detailsSection middle">
                      {!editDescription ?
                        <Fragment>
                          <div className="details-section-wrap">
                            <div className="description">{description}</div>
                            <div className="placeholder">
                              <img src="/info.svg" />
                              This NFT has no description :(
                            </div>
                          </div>
                          <img
                            className="edit-icon"
                            src="/pencil.svg"
                            onClick={e => {
                              setEditDescription(!editDescription);
                              setEditedDescription(description);
                            }}
                          />
                        </Fragment>
                      :
                        <Fragment>
                          <textarea className="description-input" value={editedDescription} onChange={e => {
                            setEditedDescription(e.target.value);
                          }} onKeyDown={e => {
                            if (e.which === 13) {
                              _saveDescription();
                            } else if (e.which === 27) {
                              setEditDescription(false);
                            }
                          }} ref={el => {
                            descriptionInputEl = el;
                          }} />
                          <input type="button" className="edit-save-button" value="Save" onChange={e => {}}
                          onClick={_saveDescription} />
                        </Fragment>
                      }
                    </div>
                    <div className="detailsSection right">
                      <ul className="owners">
                        <li className="owner"></li>
                        <li className="owner"></li>
                      </ul>
                    </div>
                  </div>
                  {/* <CardActions
                    toggleViewOpen={toggleViewOpen}
                    setToggleViewOpen={setToggleViewOpen}
                    setImageView={setImageView}
                    toggleAddOpen={toggleAddOpen}
                    userOwnsThisAsset={userOwnsThisAsset}
                    toggleEditOpen={toggleEditOpen}
                    setToggleEditOpen={setToggleEditOpen}
                    toggleResubmitOpen={toggleResubmitOpen}
                    setToggleResubmitOpen={setToggleResubmitOpen}
                    toggleTransferOpen={toggleTransferOpen}
                    setToggleTransferOpen={setToggleTransferOpen}
                    unlockableSpec={unlockableSpec}
                    imageView={imageView}
                    handleUnlock={handleUnlock}
                    openFileBrowser={openFileBrowser}
                    currentLocation={currentLocation}
                    isStuck={isStuck}
                  /> */}
                  {(
                    globalState.address &&
                    !userOwnsThisAsset &&
                    storeId &&
                    buyPrice
                  ) && (
                    <div className="detailsBlock">
                      <button
                        className="assetDetailsButton"
                        onClick={handleBuyAsset}
                      >
                        Buy This Item
                      </button>
                    </div>
                  )}
                </div>
              </Fragment>
            )}
      {fileBrowserOpen ? <FileBrowser
        id={id}
        name={name}
        hash={hash}
        ext={ext}
        globalState={globalState}
        closeBrowser={() => setFileBrowserOpen(false)}
      /> : null}
    </Fragment>
  );
};

export default CardDetails;

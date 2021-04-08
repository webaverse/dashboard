import Web3 from "web3";
import React, { useState, useEffect, Fragment } from "react";
import { useToasts } from "react-toast-notifications";
import Link from "next/link";
import AssetCard from "./Card";
import {Networks, getBlockchain, runSidechainTransaction, loginWithMetaMask} from "../webaverse/blockchain.js";
import { FileDrop } from 'react-file-drop';
import { makeWbn, makePhysicsBake } from "../webaverse/build";
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
} from "../functions/AssetFunctions.js";
import {formatError} from "../functions/Functions.js";
import Loader from "./Loader";
import bip39 from "../libs/bip39.js";
import hdkeySpec from "../libs/hdkey.js";
const hdkey = hdkeySpec.default;
import wbn from '../webaverse/wbn.js';
// import {blobToFile, getExt} from "../webaverse/util";
import FileBrowser from './FileBrowser';
import {proofOfAddressMessage} from '../constants/UnlockConstants.js';

const CardDetails = ({
  id,
  name,
  description,
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
  getData,
  addresses,
  // setMainnetAddress,
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

  const [loading, setLoading] = useState(false);
  const [imageView, setImageView] = useState('2d');
  const [tryOn, setTryOn] = useState(false);
  const [unlockableSpec, setUnlockableSpec] = useState(null);
  const [fileBrowserOpen, setFileBrowserOpen] = useState(false);

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

  let is3d = false;
  if (ext.toLowerCase() === "vrm" || ext.toLowerCase() === "glb") {
    is3d = true;
  }

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

  const handleDeposit = (sourceNetworkName, destinationNetworkName) => {
    const handleDepositLogin = async e => {
      e.preventDefault();

      try {
        const mainnetAddress = await loginWithMetaMask();
        if (mainnetAddress) {
          addToast("Starting transfer of this item.", {
            appearance: "info",
            autoDismiss: true,
          });
          await depositAsset(
            id,
            sourceNetworkName,
            destinationNetworkName,
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
        handleError(err);
      }
    };
    return handleDepositLogin;
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
  const _unlock = async () => {
    // const ethereumSpec = await window.ethereum.enable();
    // const [address] = ethereumSpec;

    const {web3} = await getBlockchain();
    const mainnetAddress = web3.front.currentProvider.selectedAddress;
    const {
      address: sidechainAddress,
      loginToken: { mnemonic },
    } = globalState;

    /* const _getMainnetTokens = async address => {
        const res = await fetch(`https://mainnet-tokens.webaverse.com/${address}`);
        const j = await res.json();
        return j;
      };
      // const tokens = await _getMainnetTokens('0x84310641ea558c5e2f86bfe4f95d426d4f3c7360');
      // console.log('got tokens', tokens);      
      const _getSidechainTokens = async address => {
        const res = await fetch(`https://tokens.webaverse.com/${address}`);
        const j = await res.json();
        return j;
      }; */
    const _getMainnetSignature = async () => {
      // const result1 = await window.ethereum.enable();
      await window.ethereum.enable();
      const signature = await web3.front.eth.personal.sign(
        proofOfAddressMessage,
        web3.front.currentProvider.selectedAddress
      );
      const result3 = await web3.front.eth.personal.ecRecover(proofOfAddressMessage, signature);
      // console.log('got sig 1', {signature});
      return signature;
    };
    const _getSidechainSignature = async () => {
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

    const [mainnetSignature, sidechainSignature] = await Promise.all([
      _getMainnetSignature(),
      _getSidechainSignature(),
    ]);
    const spec = await _getUnlockable(
      [mainnetSignature, sidechainSignature],
      id
    );
    // console.log('get all tokens', spec);
    setUnlockableSpec(spec);

    /* unlocksEl.innerHTML = allTokens.map(t => `<li class=token>
        ${t.id} - ${t.properties.hash} - ${t.properties.name} - ${t.properties.ext} - ${t.properties.unlockable} = ${t.unlocked}
      </li>`).join('\n'); */
    // console.log('got results', results);
  };
  const _openFileBrowser = () => {
    setFileBrowserOpen(true);
  };
  const isStuck = /stuck/.test(currentLocation);
  const currentLocationUnstuck = currentLocation.replace(/\-stuck/, '');

  return (
    <Fragment>
      {tryOn ? (
        <Fragment>
          <a className="button" onClick={() => setTryOn(false)}>
            Go back
          </a>
          <div className="IFrameContainer">
            <iframe
              className="IFrame"
              src={"https://app.webaverse.com/?t=" + id}
            />
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="assetDetails">
            {loading ? (
              <Loader loading={loading} />
            ) : (
              <div className="assetDetailsContent">
                <div className="assetDetailsLeftColumn">
                  <AssetCard
                    id={id}
                    key={id}
                    assetName={name}
                    ext={ext}
                    animation_url={animation_url}
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
                    glow={false}
                    imageView={imageView}
                  />
                </div>
                <div className="assetDetailsRightColumn">
                  <div className="assetDetailsOwnedBy">
                    <span className={`creatorIcon creatorIcon tooltip`}>
                      <img
                        src={ownerAvatarPreview.replace(/\.[^.]*$/, ".png")}
                      />
                      <span className={`creatorName creatorName tooltiptext`}>
                        {ownerUsername}
                      </span>
                    </span>{" "}
                    Owned by{" "}
                    <Link href={`/accounts/` + ownerAddress}>
                      {ownerUsername}
                    </Link>
                  </div>
                  <div className={`detailsBlock detailsBlockSet noselect`}>
                    <div className="Accordion">
                      <div
                        className="accordionTitle"
                        onClick={() => setToggleViewOpen(!toggleViewOpen)}
                      >
                        <span className="accordionTitleValue">View</span>
                        <span
                          className={`accordionIcon ${
                            toggleViewOpen ? "reverse" : ""
                          }`}
                        ></span>
                      </div>
                      {toggleViewOpen && (
                        <div className="accordionDropdown">
                            {is3d && imageView != "3d" && (
                              <button
                                className="assetDetailsButton"
                                onClick={() => setImageView("3d")}
                              >
                                See in 3d
                              </button>
                            )}
                            {is3d && imageView != "2d" && (
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
                                onClick={_unlock}
                              >
                                Unlock content
                              </button>
                            )}
                            <button
                              className="assetDetailsButton"
                              onClick={_openFileBrowser}
                            >
                              File browser
                            </button>
                        </div>
                      )}
                    </div>
                    {(
                      <div className="Accordion">
                        <div
                          className="accordionTitle"
                          onClick={() => setToggleAddOpen(!toggleAddOpen)}
                        >
                          <span className="accordionTitleValue">Add</span>
                          <span
                            className={`accordionIcon ${
                              toggleAddOpen ? "reverse" : ""
                            }`}
                          ></span>
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
                    )}
                    {userOwnsThisAsset && (
                      <div className="Accordion">
                        <div
                          className="accordionTitle"
                          onClick={() => setToggleEditOpen(!toggleEditOpen)}
                        >
                          <span className="accordionTitleValue">Edit</span>
                          <span
                            className={`accordionIcon ${
                              toggleEditOpen ? "reverse" : ""
                            }`}
                          ></span>
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
                          <span
                            className={`accordionIcon ${
                              toggleTradeOpen ? "reverse" : ""
                            }`}
                          ></span>
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
                              <button
                                className="assetDetailsButton"
                                onClick={async () => {
                                  const mainnetAddress = await loginWithMetaMask();
                                  await resubmitAsset(
                                    currentLocationUnstuck,
                                    'NFT',
                                    'mainnet',
                                    id,
                                    mainnetAddress,
                                    globalState.loginToken.mnemonic,
                                    handleSuccess,
                                    handleError
                                  )
                                }}
                              >
                                Resubmit to mainchain
                              </button>
                              <button
                                className="assetDetailsButton"
                                onClick={async () => {
                                  const mainnetAddress = await loginWithMetaMask();
                                  await resubmitAsset(
                                    currentLocationUnstuck,
                                    'NFT',
                                    'polygon',
                                    id,
                                    mainnetAddress,
                                    globalState.loginToken.mnemonic,
                                    handleSuccess,
                                    handleError
                                  )
                                }}
                              >
                                Resubmit to polygon
                              </button>
                              <button
                                className="assetDetailsButton"
                                onClick={async () => {
                                  const mainnetAddress = await loginWithMetaMask();
                                  await resubmitAsset(
                                    currentLocationUnstuck,
                                    'NFT',
                                    'mainnetsidechain',
                                    id,
                                    mainnetAddress,
                                    globalState.loginToken.mnemonic,
                                    handleSuccess,
                                    handleError
                                  );
                                }}
                              >
                                Resubmit to sidechain
                              </button>
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
                                  // console.log('get network', Networks, currentLocation, Networks[currentLocation]);
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
                                  /*{tokenOnMain && (
                                    <button
                                      className="assetDetailsButton"
                                      onClick={handleWithdraw}
                                    >
                                      Transfer From {otherNetworkName}
                                    </button>
                                  )} */
                                }
                                return results;
                              })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {(
                    globalState.address &&
                    !userOwnsThisAsset &&
                    storeId &&
                    buyPrice
                  ) && (
                    <div className="detailsBlock detailsBlockSet">
                      <button
                        className="assetDetailsButton"
                        onClick={handleBuyAsset}
                      >
                        Buy This Item
                      </button>
                    </div>
                  )}
                </div>
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

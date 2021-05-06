import React, {Fragment, useState, useEffect} from "react";
// import { Col } from "react-grid-system";
import Link from "next/link";
import {useAppContext} from "../libs/contextLib";
import {proofOfAddressMessage} from "../constants/UnlockConstants";
import {uniquify, getAddressProofs, getAddressesFromProofs} from "../functions/Functions";
import {cancelEvent} from "../webaverse/util";
import {cardPreviewHost} from "../webaverse/constants";
import {setName, setAccountMetadata} from "../functions/UserFunctions";
import Clip from './Clip';
import {loginWithMetaMask, getBlockchain} from '../webaverse/blockchain';

const Profile = ({
  profile,
  addresses,
  setAddresses,
  addressProofs,
  setAddressProofs,
  balance,
  loadout,
}) => {
    if (!profile) {
        return null;
    }
    
    const profileName = profile.name || "Anonymous";

    const {globalState, setGlobalState} = useAppContext();
    const [liked, setLiked] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [name, setName] = useState(profileName);
    const [editName, setEditName] = useState(false);
    const [editedName, setEditedName] = useState(profileName);
    const [keysOpen, setManageKeysOpen] = useState(false);
    const [nonce, setNonce] = useState(undefined);
    const [dropState, setDropState] = useState(null);

    const logout = () => {
        setGlobalState({ ...globalState, logout: "true" });
    };
    const handleSuccess = () => {
      console.log("success");
      setGlobalState({ ...globalState, refresh: "true" });
    };
    const handleError = (err) => console.log("error");
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
      
      await setName(editedName, globalState);
    };    
    const handleRefresh = async e => {
      if (profile.avatarPreview) {
        const res = await fetch(
          profile.avatarPreview
            .replace(
              /\/[^\/]*\.([^\/]*)$/,
              '/preview.webm'
            ),
          {
            method: 'DELETE',
          });
        await res.json();
        setNonce(Math.floor(Math.random() * 0xFFFFFF));
      }
    };
    
    let nameInputEl = null;
    const _updateNameInputFocus = () => {
      if (editName && nameInputEl) {
        nameInputEl.focus();
      }
    };
    useEffect(() => {
      _updateNameInputFocus();
    }, [editName]);

    const qs = {
      nonce,
    };
    let src = profile.avatarPreview && profile.avatarPreview;
    src = src.replace(
      /\/[^\/]*\.([^\/]*)$/,
      '/preview.webm'
    );
    if (!/\?$/.test(src)) {
      src += '?';
    }
    let first = true;
    for (const k in qs) {
      const v = qs[k];
      if (v !== undefined) {
        if (first) {
          first = false;
        } else {
          src += '&';
        }
        src += `${k}=${v}`;
      }
    }

    return (
        <div className="profileContainer">
            <div className="profileHeader">
              <div className="profileLeft">
                  <div className="profileWrap">
                      <h1 className="profileText mainName">
                        {!editName ?
                          <Fragment>
                            <div className="text">{name}</div>
                            <img
                              className="edit-icon"
                              src="/pencil.svg"
                              onClick={e => {
                                setEditName(true);
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
                      </h1>
                      <div className="profileText label">Addresses</div>
                      <p className="profileText address main">{profile.address} <img className="icon" src="/wallet.svg" /></p>
                      {addresses.map(address => {
                        return (
                          <p className="profileText address" key={address}>
                            {address}
                            <img
                              className="icon"
                              src="/cancel.svg"
                              onClick={async e => {
                                const {web3} = await getBlockchain();
                                
                                // let addressProofs = getAddressProofs(profile);
                                // let addresses = await getAddressesFromProofs(addressProofs, web3, proofOfAddressMessage);
                                
                                const localAddresses = addresses.slice();
                                const localAddressProofs = addressProofs.slice();
                                
                                const index = localAddresses.indexOf(address);
                                if (index !== -1) {
                                  localAddresses.splice(index, 1);
                                  localAddressProofs.splice(index, 1);
                                  
                                  const result = await setAccountMetadata('addressProofs', JSON.stringify(localAddressProofs), globalState);
                                  
                                  setAddresses(localAddresses);
                                  setAddressProofs(localAddressProofs);
                                } else {
                                  console.warn('failed to remove address proof', {localAddresses, localAddressProofs, address, index});
                                }
 
                              }}
                            />
                          </p>
                        );
                      })}
                      <p
                        className="profileText address clickable"
                        onClick={async e => {
                          const metaMaskAddress = await loginWithMetaMask();
                          const {web3} = await getBlockchain();
                          // console.log('sign', web3); // XXX
                          const signature = await web3.mainnet.eth.personal.sign(proofOfAddressMessage, metaMaskAddress);
                          // console.log('got signature', signature, proofOfAddressMessage);

                          let localAddresses = addresses.slice();
                          localAddresses.push(metaMaskAddress);
                          localAddresses = uniquify(localAddresses);

                          let localAddressProofs = addressProofs.slice();
                          localAddressProofs.push(signature);
                          localAddressProofs = uniquify(localAddressProofs);
                          
                          // console.log('got result 1', addressProofs);
                          
                          const result = await setAccountMetadata('addressProofs', JSON.stringify(localAddressProofs), globalState);
                          // console.log('got result 2', result);
                          
                          setAddresses(localAddresses);
                          setAddressProofs(localAddressProofs);
                        }}
                      >+ Add address</p>
                      {profile.mainnetAddress ? (
                          <p className="profileText address">
                              Mainnet:{" "}
                              {profile.mainnetAddress
                                  ? profile.mainnetAddress
                                  : ""}
                          </p>
                      ) : null}
                      <br />
                      <div className="profileText label">SILK</div>
                      <div className="silk">
                        <img className="icon" src="/curve.svg" onDragStart={cancelEvent} />
                        <div className="value">{balance ? Number(balance).toLocaleString() : '0'}</div>
                      </div>
                      <br />
                  </div>
              </div>
              {/* <div
                className="profilePicture"
                style={{
                  backgroundImage: `url("${
                    profile.avatarPreview
                      ? profile.avatarPreview.replace(
                          /\.[^.]*$/,
                          ".png"
                        )
                      : "/preview.png"
                  }")`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                }}
              /> */}
              <div className="profileAvatar">
                <Clip
                  className="profileVideo"
                  src={src}
                  loop={true}
                  autoPlay={true}
                  muted={true}
                />
                <div className="profileLoadout">
                  <div className="profileLoadoutHeader">Wear</div>
                  {
                    [
                      ['/noun_glove_937033.svg', ''],
                      ['/noun_glove_937033.svg', 'flip-horizontal'],
                      ['/noun_Helmet_937034.svg', ''],
                      ['/noun_body armor_937041.svg', ''],
                      ['/noun_Boots_937032.svg', ''],
                      ['/noun_Pet_1307711.svg', ''],
                      ['/noun_Seat_2522171.svg', ''],
                    ].map((spec, i) => {
                      const [src, className] = spec;
                      const key = `wear-${i}`;
                      return (
                        <div
                          className={`profileLoadoutItem light ${className} ${dropState === key ? 'drop' : ''}`}
                          onDragOver={e => {
                            e.preventDefault();
                            
                            // console.log('got drag over', e);
                          }}
                          onDrop={e => {
                            e.preventDefault();
                          
                            const s = e.dataTransfer.getData('application/json');
                            if (s) {
                              const j = JSON.parse(s);
                              console.log('got drop', j);
                            }
                            setDropState(null);
                          }}
                          onDragEnter={e => {
                            // const s = e.dataTransfer.getData('application/json');
                            // console.log('drag enter', {s});
                            setDropState(key);
                          }}
                          onDragLeave={e => {
                            // console.log('drag leave');
                            setDropState(null);
                          }}
                          key={key}
                        >
                          <img
                            src={src}
                            className="profileLoadoutPicture"
                            onDragStart={cancelEvent}
                          />
                        </div>
                      );
                    })
                  }
                </div>
                <div className="profileLoadout">
                  <div className="profileLoadoutHeader">Loadout</div>
                  {
                    loadout.slice(0, 8).map((item, i) => {
                        const key = `loadout-${i}`;
                        if (item && item[3]) {
                          const tokenId = parseInt(item[0], 10);
                          if (!isNaN(tokenId)) {
                            return (
                              <Link
                                href={`/assets/${tokenId}`}
                                key={key}
                              >
                                <a
                                  className={`profileLoadoutItem ${dropState === key ? 'drop' : ''}`}
                                  onDragStart={cancelEvent}
                                  onDragOver={e => {
                                    e.preventDefault();
                                    
                                    // console.log('got drag over', e);
                                  }}
                                  onDrop={e => {
                                    e.preventDefault();
                                  
                                    const s = e.dataTransfer.getData('application/json');
                                    if (s) {
                                      const j = JSON.parse(s);
                                      console.log('got drop', j);
                                    }
                                    setDropState(null);
                                  }}
                                  onDragEnter={e => {
                                    // const s = e.dataTransfer.getData('application/json');
                                    // console.log('drag enter', {s});
                                    setDropState(key);
                                  }}
                                  onDragLeave={e => {
                                    // console.log('drag leave');
                                    setDropState(null);
                                  }}
                                >
                                  <img
                                    src={item[3]}
                                    className="profileLoadoutPicture"
                                  />
                                </a>
                              </Link>
                            );
                          } else {
                            return (
                              <a
                                href={item[3]}
                                className={`profileLoadoutItem ${dropState === key ? 'drop' : ''}`}
                                onDragStart={cancelEvent}
                                onDragOver={e => {
                                  e.preventDefault();
                                
                                  // console.log('got drag over', e);
                                }}
                                onDrop={e => {
                                  e.preventDefault();
                                
                                  const s = e.dataTransfer.getData('application/json');
                                  if (s) {
                                    const j = JSON.parse(s);
                                    console.log('got drop', j);
                                  }
                                  setDropState(null);
                                }}
                                onDragEnter={e => {
                                  // const s = e.dataTransfer.getData('application/json');
                                  // console.log('drag enter', {s});
                                  setDropState(key);
                                }}
                                onDragLeave={e => {
                                  // console.log('drag leave');
                                  setDropState(null);
                                }}
                                key={key}
                              >
                                <img
                                  src={item[3]}
                                  className="profileLoadoutPicture"
                                />
                              </a>
                            ); 
                          }
                        } else {
                          return (
                            <div
                              className={`profileLoadoutItem light ${dropState === key ? 'drop' : ''}`}
                              onDragOver={e => {
                                e.preventDefault();
                              
                                // console.log('got drag over', e);
                              }}
                              onDrop={e => {
                                e.preventDefault();
                              
                                const s = e.dataTransfer.getData('application/json');
                                if (s) {
                                  const j = JSON.parse(s);
                                  console.log('got drop', j);
                                }
                                setDropState(null);
                              }}
                              onDragEnter={e => {
                                // const s = e.dataTransfer.getData('application/json');
                                // console.log('drag enter', {s});
                                setDropState(key);
                              }}
                              onDragLeave={e => {
                                // console.log('drag leave');
                                setDropState(null);
                              }}
                              key={key}
                            />
                          );
                        }
                      
                    })
                  }
                </div>
              </div>
              <div className="card-buttons like">
                <div className={`card-button`} onClick={handleRefresh}>
                  <img src="/refresh.svg" onDragStart={cancelEvent} />
                </div>
                <div className={`card-button ${liked ? 'selected open' : ''}`} onClick={handleLike}>
                  <img className="only-selected" src="/heart_full.svg" onDragStart={cancelEvent} />
                  <img className="only-not-selected" src="/heart_empty.svg" onDragStart={cancelEvent} />
                </div>
                <div className="card-button help">
                  <img src="/help.svg" onDragStart={cancelEvent} />
                </div>
              </div>
              {/* <div className={`actions ${dropdownOpen ? 'open' : ''}`}>
                <a key="manageKeysButton" className="action" onClick={() => {
                  setManageKeysOpen(true);
                  setDropdownOpen(false);
                }}>
                  Manage keys...
                </a>
                <a className="action" onClick={() => logout()}>
                  Logout
                </a>
              </div> */}
            </div>
        </div>
    );
};

export default Profile;

import React, {Fragment, useState, useEffect} from "react";
// import { Col } from "react-grid-system";
import { useAppContext } from "../libs/contextLib";
import {proofOfAddressMessage} from "../constants/UnlockConstants";
import {getAddressProofs, getAddressesFromProofs} from "../functions/Functions";

const Profile = ({ loadout, balance, profile, addresses }) => {
    if (!profile) {
        return null;
    }

    // const [addresses, setAddresses] = useState(null);
    const [liked, setLiked] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const {globalState, setGlobalState} = useAppContext();

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

    /* useEffect(async () => {
      if (!addresses) {
        const {web3} = await getBlockchain();
        // setWeb3(o.web3);const addressProofs = getAddressProofs(profile);
        const newAddresses = await getAddressesFromProofs(addressProofs, web3, proofOfAddressMessage);
        setAddresses(newAddresses);
      }
    }, [addresses]); */

    return (
        <div className="profileContainer">
            <div className="profileHeader">
              <div className="profileLeft">
                  <div className="profileWrap">
                      <h1 className="profileText mainName">
                          {profile.name ? profile.name : "Anonymous"}
                      </h1>
                      <div className="profileText label">Addresses</div>
                      <p className="profileText address main">{profile.address}</p>
                      {addresses.map(address => {
                        return (
                          <p className="profileText address" key={address}>{address}</p>
                        );
                      })}
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
                      {balance && balance > 0 ? (
                        <Fragment>
                          <div className="silk">
                            <img className="icon" src="/curve.svg" />
                            <div className="value">{balance ? Number(balance).toLocaleString() : '0'}</div>
                          </div>
                          <br />
                        </Fragment>
                      ) : null}
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
                {profile.avatarPreview ?
                  <video
                    className="profileVideo"
                    src={/* `https://preview.exokit.org/[https://webaverse.github.io/assets/sacks3.vrm]/preview.webm` */
                      profile.avatarPreview.replace(
                        /\.[^.]*$/,
                        '.webm'
                      )
                    }
                    loop={true}
                    autoPlay={true}
                    muted={true}
                  />
                :
                  <div className="profileVideoPlaceholder" />
                }
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
                      return (
                        <div className={`profileLoadoutItem light ${className}`} key={i}>
                          <img
                            src={src}
                            className="profileLoadoutPicture"
                            onDragStart={e => {
                              e.preventDefault();
                            }}
                          />
                        </div>
                      );
                    })
                  }
                </div>
                <div className="profileLoadout">
                  <div className="profileLoadoutHeader">Loadout</div>
                  {loadout ?
                    loadout.map((item, i) =>
                      item && item[3] ? (
                        <div className="profileLoadoutItem" key={i}>
                          <img
                            src={item[3]}
                            className="profileLoadoutPicture"
                            onDragStart={e => {
                              e.preventDefault();
                            }}
                          />
                        </div>
                      ) : null
                    )
                  :
                    <div className="profileLoadoutItem light" />
                  }
                </div>
              </div>
              <div className="card-buttons like">
                <div className={`card-button ${liked ? 'selected' : ''}`} onClick={handleLike}>
                  <img className="only-selected" src="/heart_full.svg" />
                  <img className="only-not-selected" src="/heart_empty.svg" />
                </div>
                <div className="card-button help">
                  <img src="/help.svg" />
                </div>
                <div className={`card-button dropdown ${dropdownOpen ? 'open' : ''}`} onClick={handleDropdownOpen}>
                  <img src="/dots.svg" />
                </div>
              </div>
              {dropdownOpen ? <div className="actions">
                {addresses.length > 0 ? <a key="removeMainnetAddressButton" className="action" onClick={() => handleRemoveMainnetAddress()}>
                  Remove mainnet address
                </a> : null}
                <a key="connectMainnetAddressButton" className="action" onClick={() => handleAddMainnetAddress()}>
                  Connect mainnet address
                </a>
                <a key="SILKToMainnetButton" className="action" onClick={() => handleDeposit()}>
                  Transfer SILK to mainnet
                </a>
                <a key="SILKResubmitButton" className="action" onClick={async () => {
                  setLoading(true);
                  await resubmitSILK("FT", null, globalState, handleSuccess, handleError);
                  handleSuccess();
                }}>
                  Resubmit SILK transfer
                </a>
                <a key="SILKButton" className="action" onClick={() => handleWithdraw()}>
                  Transfer SILK from mainnet
                </a>
                <a key="nameChangeButton" className="action" onClick={() => {
                  const name = prompt("What is your name?", "Satoshi");
                  setName(name, globalState, handleSuccess, handleError)
                  setLoading(true);
                }}>
                  Change Name
                </a>
                <a key="logoutButton" className="action" onClick={() => logout()}>
                  Logout
                </a>
              </div> : null}
            </div>
        </div>
    );
};

export default Profile;

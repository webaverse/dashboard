import React, {useState, useEffect} from "react";
// import { Col } from "react-grid-system";
import { useAppContext } from "../libs/contextLib";
import {proofOfAddressMessage} from "../constants/UnlockConstants";
import {getAddressProofs, getAddressesFromProofs} from "../functions/Functions";

const Profile = ({ loadout, balance, profile, addresses }) => {
    if (!profile) {
        return null;
    }

    // const {addresses, setAddresses} = useState(null);
    const {globalState, setGlobalState} = useAppContext();

    const logout = () => {
        setGlobalState({ ...globalState, logout: "true" });
    };

    const handleSuccess = () => {
        console.log("success");
        setGlobalState({ ...globalState, refresh: "true" });
    };
    const handleError = (err) => console.log("error");

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
                      {balance && balance > 0 ? (
                        <p className="profileText">
                          <img className="icon" src="/curve.svg" />
                          <div className="value">{balance || 0}</div>
                        </p>
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
              <video
                  className="profileVideo"
                  src={ 
                    `https://preview.exokit.org/[https://webaverse.github.io/assets/sacks3.vrm]/preview.webm`
                    /* profile.avatarPreview.replace(
                      /\.[^.]*$/,
                      ".webm"
                    ) */
                  }
                  loop={true}
                  autoPlay={true}
                  muted={true}
              />
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
                : null}
              </div>
            </div>
        </div>
    );
};

export default Profile;

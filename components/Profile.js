import React from "react";
// import { Col } from "react-grid-system";
import { useAppContext } from "../libs/contextLib";
import {proofOfAddressMessage} from "../constants/UnlockConstants";
import {getAddressProofs, getAddressesFromProofs} from "../functions/Functions";

const Profile = ({ loadout, balance, profile, addresses }) => {
    if (!profile) {
        return null;
    }

    const {globalState, setGlobalState} = useAppContext();

    const logout = () => {
        setGlobalState({ ...globalState, logout: "true" });
    };

    const handleSuccess = () => {
        console.log("success");
        setGlobalState({ ...globalState, refresh: "true" });
    };
    const handleError = (err) => console.log("error");

    return (
        <div className="profileContainer">
            <div className="profileHeader">
              <div className="profileLeft">
                  <div className="profileWrap">
                      <h1 className="profileText mainName">
                          {profile.name ? profile.name : "Anonymous"}
                      </h1>
                      <p className="profileText address">{profile.address} (sidechain)</p>
                      {addresses.map(address => {
                        return (
                          <p className="profileText address" key={address}>{address} (mainnet)</p>
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
                              SILK Balance: {balance ? balance : "0"}
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

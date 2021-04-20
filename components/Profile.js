import React from "react";
import { Col } from "react-grid-system";
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
        <Col sm={12} className="profileHeaderContainer">
            <div
                className="profileHeaderBackground"
                style={{
                    backgroundImage: `url(${
                        profile.homeSpacePreview
                            ? profile.homeSpacePreview
                            : "../defaulthomespace.svg"
                    })`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center center",
                }}
            />
            <div className="profileHeader">
                <div className="profileName">
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
                <div className="profilePictureContainer">
                    <div
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
                    />
                    <div className="profileLoadout">
                        {loadout
                            ? loadout.map((item, i) =>
                                  item && item[3] ? (
                                      <div
                                          key={i}
                                          className="profileLoadoutPicture"
                                          style={{
                                              display: "inline-block",
                                              backgroundImage: `url(${item[3]})`,
                                              backgroundSize: "cover",
                                              backgroundRepeat: "no-repeat",
                                              backgroundPosition:
                                                  "center center",
                                          }}
                                      />
                                  ) : null
                              )
                            : null}
                    </div>
                </div>
            </div>
        </Col>
    );
};

export default Profile;

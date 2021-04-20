import React from "react";

const LandCard = ({
    name,
    image,
    rarity,
    buyPrice,
    ext,
    cardSize,
    networkType,
    glow,
    onClickFunction,
}) => {
    let networkIcon;
    if (networkType === "sidechain") {
        networkIcon = "/icon-webaverse.svg";
    } else if (networkType === "ethereum") {
        extIcon = "/icon-ethereum.svg";
    }

    return (
        <div
            className={`landCard cardItem card ${cardSize} ${rarity} ${
                glow ? "glow" : ""
            }`}
            onClick={onClickFunction}
        >
            <div
                className={`${rarity} upperCardInfo upperCardInfo ${cardSize} upperCardInfo upperCardInfo_${(
                    ext ?? ""
                ).replace(".", "")}`}
            >
                <div
                    className={`upperCardInfoLeft upperCardInfoLeft ${cardSize}`}
                >
                    <span className={`cardAssetName cardName ${cardSize}`}>
                        {name}
                    </span>
                </div>
                <div
                    className={`upperCardInfoRight upperCardInfoRight ${cardSize}`}
                >
                    <div className={`itemType ext ${cardSize} ext_${ext}`}>
                        <span
                            className={`itemTypeExt itemTypeExt ${cardSize}`}
                        ></span>
                    </div>
                </div>
            </div>
            <div className={`assetImage assetImage ${cardSize}`}>
                <img src={image + "&r=" + rarity} />
            </div>
            <div className={`lowerCardInfo lowerCardInfo ${cardSize}`}>
                <div
                    className={`lowerLandCardInfoTop ${rarity} lowerCardInfoTop ${cardSize} lowerCardInfoTop`}
                >
                    <div
                        className={`lowerCardInfoTopLeft lowerCardInfoTopLeft ${cardSize}`}
                    >
                        <div className="lowerCardInfoTopClear"></div>
                    </div>
                    <span
                        className={`greaseLoadedIntoAsset greaseLoadedIntoAsset ${cardSize}`}
                    >{`${buyPrice ? "岾 " + buyPrice : ""} ${
                        buyPrice ? "SILK" : ""
                    }`}</span>
                </div>
            </div>
        </div>
    );
};

export default LandCard;

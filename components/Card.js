import React from "react";
//import './style.css';

const Card = ({
    id,
    assetName,
    description,
    image,
    hash,
    animation_url,
    ext,
    totalSupply,
    minterAvatarPreview,
    minterUsername,
    cardSize,
    isMainnet,
    isPolygon,
    glow,
    imageView,
}) => {
    let video = false;
    if (["webm", "mp4"].indexOf(ext) >= 0) {
        image = animation_url;
        video = true;
    } else if (ext === "gif") {
        image = animation_url;
    }

    let networkIcon;
    if (isMainnet) {
        networkIcon = "/icon-ethereum.svg";
    } else if(isPolygon) {
        networkIcon = "/icon-polygon.svg";
    } else {
        networkIcon = "/icon-webaverse.svg";
    }

    let extIcon;
    if (ext.toLowerCase() === "png") {
        extIcon = "/icon-jpg.svg";
    } else if (ext.toLowerCase() === "jpg" || ext.toLowerCase() === "jpeg") {
        extIcon = "/icon-jpg.svg";
    } else if (ext.toLowerCase() === "vrm") {
        extIcon = "/icon-vrm.svg";
    } else if (ext.toLowerCase() === "vox") {
        extIcon = "/icon-vrm.svg";
    } else if (ext.toLowerCase() === "wbn") {
        extIcon = "/icon-vrm.svg";
    } else if (ext.toLowerCase() === "glb") {
        extIcon = "/icon-glb.svg";
    } else if (ext.toLowerCase() === "gif") {
        extIcon = "/icon-gif.svg";
    }

    let rarity;
    if (totalSupply < 2) {
        rarity = "unique";
    } else if (totalSupply < 3) {
        rarity = "mythic";
    } else if (totalSupply < 8) {
        rarity = "legendary";
    } else if (totalSupply < 15) {
        rarity = "epic";
    } else if (totalSupply < 30) {
        rarity = "rare";
    } else if (totalSupply < 50) {
        rarity = "uncommon";
    } else if (totalSupply > 50) {
        rarity = "common";
    }

    return (
        <div
            className={`card cardItem ${
                glow ? "glow" : ""
            } ${rarity} ${cardSize}`}
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
                        #{id} - {assetName}
                    </span>
                </div>
                <div
                    className={`upperCardInfoRight upperCardInfoRight ${cardSize}`}
                >
                    <div className={`itemType ext ${cardSize} ext_${ext}`}>
                        <img
                            className={`itemTypeIcon itemTypeIcon ${cardSize}`}
                            src={networkIcon}
                        />
                    </div>
                    <div className={`itemType ext ${cardSize} ext_${ext}`}>
                        <img
                            className={`itemTypeIcon itemTypeIcon ${cardSize}`}
                            src={extIcon}
                        />
                        <span className={`itemTypeExt itemTypeExt ${cardSize}`}>
                            .{ext}
                        </span>
                    </div>
                </div>
            </div>
            <div className={`assetImage assetImage ${cardSize}`}>
                {!imageView || imageView === "2d" ? (
                    video ? (
                        <video autoPlay playsInline loop muted={cardSize !== ''} controls={cardSize === ''} src={image} />
                    ) : (
                        <img src={image} />
                    )
                ) : (
                    <video
                        autoPlay
                        loop
                        src={image.replace(/\.[^.]*$/, ".webm")}
                    />
                )}
            </div>
            <div className={`lowerCardInfo lowerCardInfo ${cardSize}`}>
                <div
                    className={`lowerCardInfoTop ${rarity} lowerCardInfoTop ${cardSize} lowerCardInfoTop`}
                >
                    <div
                        className={`lowerCardInfoTopLeft lowerCardInfoTopLeft ${cardSize}`}
                    >
                        <div className={`lowerCardInfoTopLeftGroup`}>
                            <span className={`creator creator ${cardSize}`}>
                                <span
                                    className={`creatorIcon creatorIcon tooltip ${cardSize}`}
                                >
                                    <img
                                        src={minterAvatarPreview.replace(
                                            /\.[^.]*$/,
                                            ".png"
                                        )}
                                    />
                                    <span
                                        className={`creatorName creatorName tooltiptext ${cardSize}`}
                                    >
                                        {minterUsername}
                                    </span>
                                </span>
                            </span>
                            <span
                                className={`arrow-down arrow-down ${cardSize}`}
                            ></span>
                        </div>
                        <div className="lowerCardInfoTopClear"></div>
                    </div>
                    <span
                        className={`greaseLoadedIntoAsset greaseLoadedIntoAsset ${cardSize}`}
                    ></span>
                </div>
                <div
                    className={`lowerCardInfoMiddle lowerCardInfoMiddle ${cardSize}`}
                >
                    <span
                        className={`assetDescription assetDescription ${cardSize}`}
                    >
                        {description}
                    </span>
                </div>
                <div
                    className={`lowerCardInfoBottom lowerCardInfoBottom ${cardSize}`}
                >
                    <span className={`assetHash assetHash ${cardSize}`}>
                        {hash}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Card;

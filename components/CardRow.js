import React, {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/router";
// import AssetCard from "./Card";
import AssetCardSvg from "./CardSvg";
import Asset from "./Asset";

const CardRow = ({ data, name, cardSize, selectedView, /* cardSvgSource, */ tilt, onTokenClick }) => {
    // <div>Have token: {JSON.stringify(token)}</div>

    return (
        <div className="mainRow">
            <div className="notch">
              <div className="nub"></div>
              <div className="text">{name}</div>
              <div className="underline"></div>
            </div>
            {data &&
                data.map((asset) => {
                    if (asset.totalSupply === 0) {
                        return;
                    }
                    return (
                        <div key={asset.id}>
                            <a>
                                  {/* <AssetCard
                                    key={asset.id}
                                    id={asset.id}
                                    isMainnet={asset.isMainnet}
                                    isPolygon={asset.isPolygon}
                                    assetName={asset.name}
                                    description={asset.description}
                                    image={asset.image}
                                    hash={asset.properties.hash}
                                    external_url={asset.external_url}
                                    filename={asset.properties.filename}
                                    ext={asset.properties.ext}
                                    totalSupply={asset.totalSupply}
                                    balance={asset.balance}
                                    buyPrice={asset.buyPrice}
                                    storeId={asset.storeId}
                                    ownerAvatarPreview={
                                        asset.owner.avatarPreview
                                    }
                                    ownerUsername={asset.owner.username}
                                    ownerAddress={asset.owner.address}
                                    minterAvatarPreview={
                                        asset.minter.avatarPreview
                                    }
                                    minterUsername={asset.minter.username}
                                    minterAddress={asset.minter.address}
                                    cardSize={cardSize}
                                    networkType="sidechain"
                                /> */}
                                <AssetCardSvg
                                    key={asset.id}
                                    id={asset.id}
                                    isMainnet={asset.isMainnet}
                                    isPolygon={asset.isPolygon}
                                    assetName={asset.name}
                                    description={asset.description}
                                    image={asset.image}
                                    hash={asset.properties.hash}
                                    external_url={asset.external_url}
                                    filename={asset.properties.filename}
                                    ext={asset.properties.ext}
                                    totalSupply={asset.totalSupply}
                                    balance={asset.balance}
                                    buyPrice={asset.buyPrice}
                                    storeId={asset.storeId}
                                    ownerAvatarPreview={
                                        asset.owner.avatarPreview
                                    }
                                    ownerUsername={asset.owner.username}
                                    ownerAddress={asset.owner.address}
                                    minterAvatarPreview={
                                        asset.minter.avatarPreview
                                    }
                                    minterUsername={asset.minter.username}
                                    minterAddress={asset.minter.address}
                                    cardSize={cardSize}
                                    networkType="sidechain"
                                    tilt={true}
                                    onClick={e => {
                                      onTokenClick && onTokenClick(asset.id)(e);
                                    }}
                                />
                            </a>
                        </div>
                    );
                })}
        </div>
    );
};

export default CardRow;

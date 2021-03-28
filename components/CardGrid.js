import React from "react";
import Link from "next/link";
import AssetCard from "./Card";

const CardGrid = ({ data, cardSize }) => {
    return (
        <div className="main">
            {data &&
                data.map((asset) => {
                    if (asset.totalSupply === 0) {
                        return;
                    }
                    return (
                        <Link key={asset.id} href={"/assets/" + asset.id}>
                            <a>
                                <AssetCard
                                    key={asset.id}
                                    id={asset.id}
                                    isMainnet={asset.isMainnet}
                                    isPolygon={asset.isPolygon}
                                    assetName={asset.name}
                                    description={asset.description}
                                    image={asset.image}
                                    hash={asset.properties.hash}
                                    external_url={asset.external_url}
                                    animation_url={asset.animation_url}
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
                                />
                            </a>
                        </Link>
                    );
                })}
        </div>
    );
};

export default CardGrid;

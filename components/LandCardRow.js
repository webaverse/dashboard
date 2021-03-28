import React from "react";
import Link from "next/link";
import AssetCard from "./LandCard";

const LandCardRow = ({ data, cardSize }) => {
    return (
        <div className="mainRow">
            {data &&
                data.map((asset) => {
                    return (
                        <Link href={"/assets/" + asset.id}>
                            <a>
                                <AssetCard
                                    key={asset.id}
                                    id={asset.id}
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

export default LandCardRow;

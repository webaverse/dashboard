import React from "react";
import Link from "next/link";
import AssetCardSwitch from "./CardSwitch";

const CardGrid = ({
  data,
  cardSize,
  selectedView,
  onTokenClick,
}) => {
    return (
        <div className="card-grid">
            {data &&
                data.map((asset) => {
                    if (asset.totalSupply === 0) {
                      return;
                    }
                    const {
                      id,
                      isMainnet,
                      isPolygon,
                      name,
                      description,
                      image,
                      properties: {
                        hash,
                        filename,
                        ext,
                      },
                      external_url,
                      totalSupply,
                      balance,
                      buyPrice,
                      storeId,
                      owner,
                      minter,
                    } = asset;
                    const props = {
                      key: id,
                      id,
                      isMainnet,
                      isPolygon,
                      assetName: name,
                      description,
                      image,
                      hash,
                      external_url,
                      filename,
                      ext,
                      totalSupply,
                      balance,
                      buyPrice,
                      storeId,
                      ownerAvatarPreview: owner.avatarPreview,
                      ownerUsername: owner.username,
                      ownerAddress: owner.address,
                      minterAvatarPreview: minter.avatarPreview,
                      minterUsername: minter.username,
                      minterAddress: minter.address,
                      cardSize,
                      networkType: 'sidechain',
                      tilt: true,
                      draggable: true,
                      onClick: e => {
                        onTokenClick && onTokenClick(asset.id)(e);
                      },
                    };
                    return (
                      <AssetCardSwitch {...props} selectedView={selectedView} />
                    );
                })}
        </div>
    );
};

export default CardGrid;

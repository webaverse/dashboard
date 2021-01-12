import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import AssetCard from './Card'
import AssetDetails from './CardDetails'

export default ({
  data,
  currentCard,
  setCurrentCard,
  globalState,
  cardSize
}) => {
  console.log("Data is", data);

  return (
    <div className="mainRow">
      {data && data.map(asset =>{
          if (asset.totalSupply === 0) {
            return;
          }
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
                   ownerAvatarPreview={asset.owner.avatarPreview}
                   ownerUsername={asset.owner.username}
                   ownerAddress={asset.owner.address}
                   minterAvatarPreview={asset.minter.avatarPreview}
                   minterUsername={asset.minter.username}
                   minterAddress={asset.minter.address}
                   cardSize={cardSize}
                   networkType='webaverse'
                />
              </a>
            </Link>
          )
        })
      }
    </div>
  )
};
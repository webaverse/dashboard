import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import AssetCard from './LandCard'
import AssetDetails from './LandCardDetails'

export default ({
  data,
  currentCard,
  setCurrentCard,
  globalState,
  cardSize
}) => {
  const [currentAsset, setCurrentAsset] = useState(null)

  const showCardDetails = (asset) => {
    setCurrentAsset(asset);
    if (currentCard != asset && setCurrentCard) {
      setCurrentCard(asset);
    }
  }

  const hideCardDetails = () => {
    setCurrentAsset(null);
    if (setCurrentCard) {
      setCurrentCard({ hide: true });
    }
  }

  useEffect(() => {
    if(currentAsset === null) return
  }, [currentAsset])

  return (
    <div className="main">
      {data.map(asset =>{
          if (asset.totalSupply === 0) {
//            return;
          }
          if (currentAsset != asset && asset.id === parseInt(currentCard)) {
            showCardDetails(asset);
          }
          return (
            <Link href={"/land/" + asset.id}>
              <a>
                <AssetCard
                   key={asset.id}
                   id={asset.id}
                   name={asset.name}
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
                   cardSize={cardSize}
                   onClickFunction={() => showCardDetails(asset)}
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

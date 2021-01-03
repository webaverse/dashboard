import React, { useState, useEffect } from 'react';
import AssetCard from '../Card'
import AssetDetails from '../CardDetails'
import './style.css';

export default ({
  data,
  currentCard,
  setCurrentCard,
  globalState,
  cardSize
}) => {
  console.log("Data is", data);
  const [currentAsset, setCurrentAsset] = useState(null)

  const showCardDetails = (asset) => {
    console.log("Showing card details", asset);
    setCurrentAsset(asset);
    if (currentCard != asset && setCurrentCard) {
      setCurrentCard(asset);
    }
  }

  const hideCardDetails = () => {
    console.log("Hiding card details");
    setCurrentAsset(null);
    if (setCurrentCard) {
      setCurrentCard({ hide: true });
    }
  }

  useEffect(() => {
    if(currentAsset === null) return
    console.log("**** Current asset is", currentAsset);
    console.log("Address is", currentAsset.id);
  }, [currentAsset])

  return (
    <div className="main">
      {[(currentAsset !== null && currentCard !== null &&
         <AssetDetails
            id={currentAsset.id}
            key={currentAsset.id}
            name={currentAsset.name}
            description={currentAsset.description}
            image={currentAsset.image}
            buyPrice={currentAsset.buyPrice}
            storeId={currentAsset.storeId}
            hash={currentAsset.properties.hash}
            external_url={currentAsset.external_url}
            filename={currentAsset.properties.filename}
            ext={currentAsset.properties.ext}
            totalSupply={currentAsset.totalSupply}
            balance={currentAsset.balance}
            ownerAvatarPreview={currentAsset.owner.avatarPreview}
            ownerUsername={currentAsset.owner.username}
            ownerAddress={currentAsset.owner.address}
            minterAvatarPreview={currentAsset.minter.avatarPreview}
            minterAddress={currentAsset.minter.address}
            minterUsername={currentAsset.minter.username}
            hideDetails={hideCardDetails}
            globalState={globalState}
            networkType='webaverse'
          />
        ),
        (data.map(asset =>{
          if (asset.totalSupply === 0) {
            return;
          }
          if (currentAsset != asset && asset.id === parseInt(currentCard)) {
            showCardDetails(asset);
          }
          return (
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
               onClickFunction={() => showCardDetails(asset)}
               networkType='webaverse'
            />
          )
        }))
      ]}
    </div>
  )
};

import React, {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/router";
// import AssetCard from "./Card";
import AssetCardSvg from "./CardSvg";
import Asset, {getData} from "./Asset";

const CardRow = ({ data, name, cardSize, selectedView, /* cardSvgSource, */ tilt }) => {
    const router = useRouter();
    
    const [lastPath, setLastPath] = useState('');
    const [token, setToken] = useState(null);
    
    // console.log('got new props', router.asPath, data, name, cardSize);
    
    if (router.asPath !== lastPath) {
      setLastPath(router.asPath);
      
      const match = router.asPath.match(/^\/assets\/([0-9]+)$/);
      // console.log('got match', router.asPath, match);
      if (match) {
        const tokenId = parseInt(match[1], 10);
        (async () => {
          const token = await getData(tokenId);
          // console.log('got token', {token, tokenId});
          setToken(token);
        })().catch(err => {
          console.warn(err);
        });
      } else {
        setToken(null);
      }
    }

    // <div>Have token: {JSON.stringify(token)}</div>

    return (
        <div className="mainRow">
            <div className="notch">
              <div className="nub"></div>
              <div className="text">{name}</div>
              <div className="underline"></div>
            </div>
            {token ?
              <div className="asset-overlay">
                <Asset
                  data={token}
                  selectedView={selectedView}
                />
              </div>
            : null}
            {data &&
                data.map((asset) => {
                    if (asset.totalSupply === 0) {
                        return;
                    }
                    return (
                        <div
                          onClick={e => {
                            const u = "/assets/" + asset.id;
                            router.push('/', u);
                          }}
                          key={asset.id}
                        >
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
                                />
                            </a>
                        </div>
                    );
                })}
        </div>
    );
};

export default CardRow;

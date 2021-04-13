import React, {useState} from "react";
// import cardSvgUrl from '../cards.svg';

const cardWidth = 500;
const cardHeight = cardWidth/2.5*3.5;

const CardSvg = ({
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
    cardSvgSource,
}) => {
    const [perspective, setPerspective] = useState([false, false]);
    const [flip, setFlip] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
  
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
    
    if (cardSvgSource) {
      // console.log('got card svg source', {cardSvgSource});
      /* return (
        <div ref={e => {
          if (e) {
            console.log('got e', e);
            e.innerHTML = cardSvgSource;
          }
        }} />
      ); */
      let el = null;
      let imageEl = null;
      
      const _handleMouseMove = e => {
        if (el && !transitioning) {
          const {clientX, clientY} = e;
          const boundingBox = el.getBoundingClientRect();
          const fx = (clientX - boundingBox.x) / boundingBox.width - 0.5;
          const fy = 1.0 - ((clientY - boundingBox.y) / boundingBox.height) - 0.5;
          setPerspective([fx, fy]);
        }
      };
      const _handleMouseOut = e => {
        setPerspective([0, 0]);
      };
      
      return (
        <div className='card-outer'>
          <div
            className='card-outer-flip'
          >
            <div className='card-glossy' />
            <div
              className={`card-wrap ${transitioning ? 'transitioning' : ''}`}
              ref={newEl => {
                el = newEl;
                if (el) {
                  imageEl = el.querySelector('#image');
                }
              }}
              onClick={e => {
                if (cardSize === 'large') {
                  setFlip(!flip);
                  setTransitioning(true);
                }
              }}
              onMouseMove={_handleMouseMove}
              onMouseOut={_handleMouseOut}
            >
              <div
                className={`card-svg ${transitioning ? 'transitioning' : ''}`}
                ref={el => {
                  if (el) {
                    el.addEventListener('transitionstart', e => {
                      setTransitioning(true);
                    });
                    el.addEventListener('transitionend', e => {
                      setTransitioning(false);
                    });
                  }
                }}
                style={{
                  transform: `rotateY(${perspective[0] * 180 * 0.1 + (flip ? -180 : 0)}deg) rotateX(${perspective[1] * 180 * 0.1}deg)`,
                }}
              >
                <svg
                  className="card-svg-inner"
                  width={cardWidth}
                  height={cardHeight}
                  dangerouslySetInnerHTML={{
                    __html: cardSvgSource,
                  }}
                />
              </div>
              <div className={`back ${transitioning ? 'transitioning' : ''}`} style={{
                transform: `rotateY(${perspective[0] * 180 * 0.1 + (flip ? 0 : 180)}deg) rotateX(${perspective[1] * 180 * 0.1}deg)`,
              }}>
                <img src="/cardback.png" />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
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
    }
};
export default CardSvg;
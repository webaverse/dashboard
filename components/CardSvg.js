import React, {useState} from "react";

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
    cardSvgSpec,
    tilt,
}) => {
    const [perspective, setPerspective] = useState([false, false]);
    const [flip, setFlip] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [cardSpecHighlight, setCardSpecHighlight] = useState(null);
  
    /* let video = false;
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
    } */
    
    const cardSvgSource = 'HACK'; // XXX
    if (cardSvgSource) {
      let el = null;
      
      const _handleMouseMove = e => {
        if (el && !transitioning) {
          const {clientX, clientY} = e;
          const boundingBox = el.getBoundingClientRect();
          const x = clientX - boundingBox.x;
          const fx = x / boundingBox.width - 0.5;
          const y = clientY - boundingBox.y;
          const fy = 1.0 - (y / boundingBox.height) - 0.5;
          tilt && setPerspective([fx, fy]);
          
          // console.log('got spec', cardSvgSpec);
          if (cardSvgSpec) {
            let cardSpecHighlight = null;
            for (const k in cardSvgSpec) {
              if (k === 'svg') {
                continue;
              }
              const o = cardSvgSpec[k];
              const ax = x / boundingBox.width * cardSvgSpec.svg.width;
              const ay = y / boundingBox.height * cardSvgSpec.svg.height;
              /* console.log('check', {x, y, ax, ay, o, results: [ 
                ax >= o.x,
                ax < o.x + o.width,
                ay >= o.y,
                ay < o.y + o.height,
              ], svg: cardSvgSpec.svg}); */
              if (
                ax >= o.x &&
                ax < o.x + o.width &&
                ay >= o.y &&
                ay < o.y + o.height
              ) {
                cardSpecHighlight = {
                  key: k,
                  boundingBox: o,
                  style: {
                    position: 'absolute',
                    left: `${o.x / cardSvgSpec.svg.width * boundingBox.width}px`,
                    top: `${o.y / cardSvgSpec.svg.height * boundingBox.height}px`,
                    width: `${o.width / cardSvgSpec.svg.width * boundingBox.width}px`,
                    height: `${o.height / cardSvgSpec.svg.height * boundingBox.height}px`,
                    zIndex: 100,
                    backgroundColor: '#F00',
                    cursor: 'pointer',
                  },
                };
                // console.log('got highlight', cardSpecHighlight);
                break;
              }
            }
            // console.log('highlight', cardSpecHighlight);
            setCardSpecHighlight(cardSpecHighlight);
          }
        }
      };
      const _handleMouseOut = e => {
        setPerspective([0, 0]);
      };
      const _cancelDragStart = e => {
        e.preventDefault();
      };
      
      return (
        <div className='card-outer'>
          <div
            className='card-outer-flip'
          >
            {/* <div className='card-glossy' /> */}
            <div
              className={`card-wrap ${transitioning ? 'transitioning' : ''}`}
              onClick={e => {
                if (cardSize === 'large') {
                  setFlip(!flip);
                  setTransitioning(true);
                }
              }}
              onMouseMove={_handleMouseMove}
              onMouseOut={_handleMouseOut}
              ref={newEl => {
                el = newEl;
              }}
            >
              {cardSpecHighlight ?
                <div
                  style={cardSpecHighlight.style}
                />
              :
                null
              }
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
                <img
                  src={`https://card-preview.exokit.org/${id}?w=${500}$ext=${'jpg'}`}
                  className="card-svg-inner"
                  onDragStart={_cancelDragStart}
                />
                {/* <svg
                  className="card-svg-inner"
                  width={cardWidth}
                  height={cardHeight}
                  dangerouslySetInnerHTML={{
                    __html: cardSvgSource,
                  }}
                  ref={el => {
                    if (el) {
                      const titleTextEl = el.querySelector('#title-text');
                      titleTextEl.innerHTML = assetName;
                      for (let i = 0; i < types.length; i++) {
                        const type = types[i];
                        const typeEl = el.querySelector('#type-' + type);
                        typeEl.style.display = type === spec.stats.type ? 'block' : 'none';
                      }
                      [
                        'hp',
                        'mp',
                        'attack',
                        'defense',
                        'speed',
                        'luck',
                      ].forEach(statName => {
                        const statEl = el.querySelector('#' + statName);
                        const texts = statEl.querySelectorAll('text');
                        const textEl = texts[texts.length - 1];
                        textEl.innerHTML = spec.stats[statName] + '';
                      });
                      {
                        const imageEl = el.querySelector('#Image image');
                        imageEl.setAttribute('xlink:href', image);
                      }
                      {
                        const avatarImageEl = el.querySelector('#avatar-image image');
                        avatarImageEl.setAttribute('xlink:href', minterAvatarPreview);
                      }
                      {
                        const stopEls = el.querySelectorAll('#Background linearGradient > stop');
                        // const c = `stop-color:${spec.art.colors[0]}`;
                        stopEls[1].style.cssText = `stop-color:${spec.art.colors[0]}`;
                        stopEls[3].style.cssText = `stop-color:${spec.art.colors[1]}`;
                        
                        const g = el.querySelector('#Background linearGradient');
                        g.id = 'background-' + id;
                        const p = g.nextElementSibling;
                        p.style = `fill:url(#${g.id});`;
                      }
                    }
                  }}
                /> */}
              </div>
              <div className={`back ${transitioning ? 'transitioning' : ''}`} style={{
                transform: `rotateY(${perspective[0] * 180 * 0.1 + (flip ? 0 : 180)}deg) rotateX(${perspective[1] * 180 * 0.1}deg)`,
              }}>
                <img
                  src="/cardback.png"
                  onDragStart={_cancelDragStart}
                />
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
import {Fragment, useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import {schedulePerFrame} from "../webaverse/util";
import CardRow from './CardRow';
import ProgressBar from './ProgressBar';
import AssetCardSvg from './CardSvg';
import AssetCardSwitch from './CardSwitch';
import {cardScrollViews} from '../webaverse/constants';

const Masonry = ({
  selectedView,
  setSelectedView,
  loading,
  mintMenuOpen,
  avatars,
  art,
  models,
  searchResults,
}) => {
  const router = useRouter();
  const [mintProgress, setMintProgress] = useState(0);
  const [focusTokenIndex, setFocusTokenIndex] = useState(0);
  const [loadTokenIndex, setLoadTokenIndex] = useState(0);
  const [scroll, setScroll] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [dragStartScroll, setDragStartScroll] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);
  const [nonce, setNonce] = useState(undefined);
  
  {
    let frame = null;
    const _scheduleFrame = () => {
      frame = requestAnimationFrame(_recurse);
    };
    const _recurse = () => {
      _scheduleFrame();
      // if (mintMenuStep === 3) {
        setMintProgress(Date.now() % 1000 / 1000);
      // }
    };
    schedulePerFrame(() => {
      _scheduleFrame();
    }, () => {
      frame && cancelAnimationFrame(frame);
      frame = null;
    });
  }
  const _handleTokenClick = tokenId => e => {
    router.push('/', '/assets/' + tokenId, {
      scroll: false,
    });
  };
  
  const _resize = e => {
    setNonce(Math.floor(Math.random() * 0xFFFFFF));
  };
  useEffect(() => {
    window.addEventListener('resize', _resize);
    return () => {
      window.removeEventListener('resize', _resize);
    };
  }, []);
  
  const _wheel = e => {
    setScroll(Math.min(Math.max(scroll - e.deltaY, -Infinity), 0));
  };
  useEffect(() => {
    window.addEventListener('wheel', _wheel);
    return () => {
      window.removeEventListener('wheel', _wheel);
    };
  }, [scroll]);
  
  const _mousemove = e => {
    if (dragStart) {
      const {clientX, clientY} = e;
      const d = clientX - dragStart[0];
      setScroll(Math.min(Math.max(dragStartScroll + d, -Infinity), 0));
      if (!dragMoved && Math.abs(d) >= 3) {
        setDragMoved(true);
      }
    }
  };
  const _mouseup = e => {
    if (dragStart) {
      setDragStart(null);
      setTimeout(() => {
        setDragMoved(false);
      });
    }
  };
  useEffect(() => {
    window.addEventListener('mousemove', _mousemove);
    window.addEventListener('mouseup', _mouseup);
    return () => {
      window.removeEventListener('mousemove', _mousemove);
      window.removeEventListener('mouseup', _mouseup);
    };
  }, [dragStart]);
  useEffect(() => {
    if (scroll !== 0) {
      setScroll(0);
    }
  }, [selectedView, !!searchResults]);
  useEffect(() => {
    if (loadTokenIndex !== 0) {
      setLoadTokenIndex(0);
    }
  }, [!!searchResults]);
  
  const allTokens = searchResults ||
    (avatars || [])
      .concat(art || [])
      .concat(models || []);
  
  return (loading && !mintMenuOpen) ? (
    <div className="progress-bar-wrap">
      <ProgressBar
        value={mintProgress}
      />
    </div>
  ) : (
    !cardScrollViews.includes(selectedView) ? (
      searchResults ? (
        <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
          {/* <CardRowHeader name="Avatars" /> */}
          <CardRow name="Results" data={searchResults} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />
        </div>
      ) : (
        <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
          {/* <CardRowHeader name="Avatars" /> */}
          <CardRow name="Avatars" data={avatars} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />

          {/* <CardRowHeader name="Digital Art" /> */}
          <CardRow name="Art" data={art} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />

          {/* <CardRowHeader name="3D Models" /> */}
          <CardRow name="Models" data={models} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />
        </div>
      )
    ) : (
      <Fragment>
        <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
          {(() => {
            const asset = allTokens[loadTokenIndex];
            if (!asset || asset.totalSupply === 0) {
              return;
            }
            const {
              id,
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
            const cardSize = 'small';
            let props = {
              key: id,
              id,
              assetName: name,
              description,
              image,
              external_url,
              filename,
              // totalSupply,
              // balance,
              // buyPrice,
              // storeId,
              hash,
              ext,
              ownerAvatarPreview: owner.avatarPreview,
              ownerUsername: owner.username,
              ownerAddress: owner.address,
              minterAvatarPreview: minter.avatarPreview,
              minterUsername: minter.username,
              minterAddress: minter.address,
              cardSize,
              tilt: true,
              // open: true,
              nonce,
              selectedView,
              setSelectedView,
              // onClick: _handleTokenClick(id),
            };
            return (
              <AssetCardSwitch
                {...props}
              />
            );
          })()}
          <div
            className="cards-scroll"
            style={{
              transform: `translateX(${scroll}px)`,
            }}
            onMouseDown={e => {
              const {clientX, clientY} = e;
              setDragStart([clientX, clientY]);
              setDragStartScroll(scroll);
            }}
          >
            {allTokens.map((asset, i) => {
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
              const cardSize = 'tiny';
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
                // networkType: 'sidechain',
                tilt: true,
                open: i === loadTokenIndex,
                // onClick: _handleTokenClick,
                selectedView,
                setSelectedView,
                onClick: () => {
                  if (!dragMoved) {
                    setLoadTokenIndex(i);
                  }
                },
              };
              return (
                <AssetCardSvg
                  {...props}
                />
              );
            })}
          </div>
        </div>
      </Fragment>
    )
  );
};
export default Masonry;
import {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import {schedulePerFrame} from "../webaverse/util";
import CardRow from './CardRow';
import ProgressBar from './ProgressBar';
import AssetCardSwitch from './CardSwitch';

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
  
  let listEl = null;
  const onScroll = e => {
    if (listEl) {
      const centerY = 0;
      const cardEls = Array.from(listEl.querySelectorAll('.content-preview-3d'));
      const boundingBoxes = cardEls.map(cardEl => {
        return cardEl.getBoundingClientRect();
      });
      const distanceSpecs = boundingBoxes.map((boundingBox, index) => {
        const localCenterY = boundingBox.y;
        const distance = Math.abs(localCenterY - centerY);
        return {
          index,
          distance,
        };
      });
      distanceSpecs.sort((a, b) => a.distance - b.distance);
      // const closestIndex = distanceSpecs[0].index;
      setFocusTokenIndex(distanceSpecs[0] ? distanceSpecs[0].index : -1);
      // console.log('got wheel event', e, cardEls, centerY, distanceSpecs[0] ? distanceSpecs[0].index : -1);
    }
  };
  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  });
  
  const allTokens = (avatars || [])
    .concat(art || [])
    .concat(models || []);
  
  return (loading && !mintMenuOpen) ? (
    <div className="progress-bar-wrap">
      <ProgressBar
        value={mintProgress}
      />
    </div>
  ) : (
    searchResults ? (
      <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
        {/* <CardRowHeader name="Avatars" /> */}
        <CardRow name="Results" data={searchResults} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />
      </div>
    ) : (
      selectedView !== '3d' ? (
        <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
          {/* <CardRowHeader name="Avatars" /> */}
          <CardRow name="Avatars" data={avatars} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />

          {/* <CardRowHeader name="Digital Art" /> */}
          <CardRow name="Art" data={art} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />

          {/* <CardRowHeader name="3D Models" /> */}
          <CardRow name="Models" data={models} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />
        </div>
      ) : (
        <div className={`wrap ${mintMenuOpen ? 'open' : ''}`} ref={el => {
          listEl = el;
        }}>
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
            const cardSize = 'small';
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
              open: focusTokenIndex === i,
              // onClick: _handleTokenClick,
            };
            return (
              <AssetCardSwitch
                {...props}
                selectedView={selectedView}
                setSelectedView={setSelectedView}
              />
            );
          })
        }
        </div>
      )
    )
  );
};
export default Masonry;
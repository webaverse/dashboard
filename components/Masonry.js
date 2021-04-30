import {useState} from 'react';
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
        <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
          {allTokens.map((asset) => {
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
              onClick: e => {
                onTokenClick && onTokenClick(asset.id)(e);
              },
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
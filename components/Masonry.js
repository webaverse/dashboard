import {useState} from 'react';
import {useRouter} from 'next/router';
import {schedulePerFrame} from "../webaverse/util";
import CardRow from './CardRow';
import ProgressBar from './ProgressBar';

const Masonry = ({
  selectedView,
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
      <div className={`wrap ${mintMenuOpen ? 'open' : ''}`}>
        {/* <CardRowHeader name="Avatars" /> */}
        <CardRow name="Avatars" data={avatars} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />

        {/* <CardRowHeader name="Digital Art" /> */}
        <CardRow name="Art" data={art} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />

        {/* <CardRowHeader name="3D Models" /> */}
        <CardRow name="Models" data={models} selectedView={selectedView} cardSize="small" onTokenClick={_handleTokenClick} />
      </div>
    )
  );
};
export default Masonry;
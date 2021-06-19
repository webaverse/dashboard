import AssetCardSvg from './CardSvg';
import AssetCard2D from './Card2D';
import AssetCard3D from './Card3D';
import AssetCardLive from './CardLive';

const CardSwitch = (props) => {
  const {selectedView} = props;
  switch (selectedView) {
    case 'cards': {
      return (
        <AssetCardSvg {...props} />
      );
    }
    case '2d': {
      return (
        <AssetCard2D {...props} />
      );
    }
    case '3d': {
      return (
        <AssetCard3D {...props} />
      );
    }
    case 'game': {
      return (
        <AssetCardLive {...props} />
      );
    }
    default: {
      return null;
    }
  }
};

export default CardSwitch;

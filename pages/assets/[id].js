import {Fragment} from "react";
import Head from 'next/head';
import Asset, {getServerSideProps} from "../../components/Asset.js";

const AssetPage = ({
  data,
  selectedView,
  setSelectedView,
}) => {
  // console.log('got data', {selectedView});
  // const {cardSvgSource} = data;
  
  // const router = useRouter();
  // const {id} = router.query;
  // const {globalState, setGlobalState} = useAppContext();
  // const [token, setToken] = useState(data.token);
  // const [networkName, setNetworkName] = useState(data.networkName);
  // const [stuck, setStuck] = useState(data.stuck);
  // const [tokenOnChains, setTokenOnChains] = useState({});
  // const [loading, setLoading] = useState(false);
  // const [addresses, setAddresses] = useState([]);
  // const [cardSvgSpec, setCardSvgSpec] = useState(null);
  
  const {token} = data;
  
  return (
    <Fragment>
      <Head>
        <title>{token.name} | Webaverse</title>
        <meta name="description" content={token.description + " | Webaverse"} />
        <meta property="og:title" content={token.name + " | Webaverse"} />
        <meta property={["webm","mp4"].indexOf(token.properties.ext) >=0 ? "og:video:url" : "og:image"} content={["gif","webm","mp4"].indexOf(token.properties.ext) >= 0 ? token.animation_url : token.image} />
        {["webm","mp4"].indexOf(token.properties.ext) >= 0 ?
          <meta property="og:type" content="video" />
        : null}
        {["webm","mp4"].indexOf(token.properties.ext) >= 0 ?
          <meta property="og:video:width" content="994" />
        : null}
        {["webm","mp4"].indexOf(token.properties.ext) >= 0 ?
          <meta property="og:video:height" content="720" />
        : null}
        {token.properties.ext === "mp4" ?
          <meta property="og:video:type" content="webm/mp4" />
        : null}
        {token.properties.ext === "webm" ?
          <meta property="og:video:type" content="video/webm" />
        : null}
        <meta name="theme-color" content="#c4005d" />
        {["webm","mp4"].indexOf(token.properties.ext) >= 0 ?
          null
        :
          <meta name="twitter:card" content="summary_large_image" />
        }
        {/* <script type="text/javascript" src="/geometry.js"></script> */}
      </Head>
      <div className="asset-page">
        <Asset
          data={data}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
        />
      </div>
    </Fragment>
  );
}

export default AssetPage;
export {
  getServerSideProps,
};
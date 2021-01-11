import { useRouter } from 'next/router';
import Head from 'next/head';
import CardDetails from "../../components/CardDetails";
import { getToken } from "../../functions/UIStateFunctions";
import { useAppContext } from "../../libs/contextLib";


export default ({ data }) => {
  const router = useRouter()
  const { id } = router.query
  const { globalState, setGlobalState } = useAppContext();

  return (
    <div>
      <Head>
        <title>{data.name} | Webaverse</title>
        <meta name="description" content={data.description + " | Webaverse"} />
        <meta property="og:title" content={data.name + " | Webaverse"} />
        <meta property="og:image" content={data.image} />
        <meta name="theme-color" content="#c4005d" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <CardDetails
         id={data.id}
         key={data.id}
         name={data.name}
         description={data.description}
         image={data.image}
         buyPrice={data.buyPrice}
         storeId={data.storeId}
         hash={data.properties.hash}
         external_url={data.external_url}
         filename={data.properties.filename}
         ext={data.properties.ext}
         totalSupply={data.totalSupply}
         balance={data.balance}
         ownerAvatarPreview={data.owner.avatarPreview}
         ownerUsername={data.owner.username}
         ownerAddress={data.owner.address}
         minterAvatarPreview={data.minter.avatarPreview}
         minterAddress={data.minter.address}
         minterUsername={data.minter.username}
         globalState={globalState}
         networkType='webaverse'
       />
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const data = await getToken(params.id);

  return { props: { data } }
}

import React, { Fragment, useState, useEffect } from "react";
import Head from "next/head";
import { getTokens } from "../functions/UIStateFunctions.js";
import Hero from "../components/Hero";
import CardRow from "../components/CardRow";
import CardRowHeader from "../components/CardRowHeader";
import Loader from "../components/Loader";
<<<<<<< HEAD

=======
// import Hiring from "../pages/hiring";

/* export default () => {
    return <Hiring/>
} */

<<<<<<< HEAD
>>>>>>> origin/nft
export default () => {
=======
const PagesRoot = () => {
>>>>>>> origin/master
    const [avatars, setAvatars] = useState(null);
    const [art, setArt] = useState(null);
    const [models, setModels] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const tokens1 = await getTokens(1, 100);
            const tokens2 = await getTokens(100, 200);
            const tokens = tokens1.concat(tokens2);

            setAvatars(
                tokens.filter((o) =>
                    o.properties.ext.toLowerCase().includes("vrm")
                )
            );
            setArt(
                tokens.filter((o) =>
                    o.properties.ext.toLowerCase().includes("png")
                )
            );
            setModels(
                tokens.filter((o) =>
                    o.properties.ext.toLowerCase().includes("glb")
                )
            );
            setLoading(false);
        })();
    }, []);

    return (
        <Fragment>
            <Head>
                <title>Webaverse</title>
                <meta
                    name="description"
                    content={"The virtual world built with NFTs."}
                />
                <meta property="og:title" content={"Webaverse"} />
                <meta
                    property="og:image"
                    content={"https://webaverse.com/webaverse.png"}
                />
                <meta name="theme-color" content="#c4005d" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <Hero
                heroBg="/hero.gif"
                title="Webaverse"
                subtitle="The virtual world built with NFTs"
                callToAction="Play"
                ctaUrl="https://app.webaverse.com"
            />
            <div className="container">
                {loading ? (
                    <Loader loading={loading} />
                ) : (
                    <Fragment>
                        <CardRowHeader name="Avatars" />
                        <CardRow data={avatars} cardSize="small" />

                        <CardRowHeader name="Digital Art" />
                        <CardRow data={art} cardSize="small" />

                        <CardRowHeader name="3D Models" />
                        <CardRow data={models} cardSize="small" />
                    </Fragment>
                )}
            </div>
        </Fragment>
    );
<<<<<<< HEAD
};
=======
};
<<<<<<< HEAD
>>>>>>> origin/nft
=======
export default PagesRoot;
>>>>>>> origin/master

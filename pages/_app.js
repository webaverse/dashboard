import React, {useEffect, useState} from 'react';
import {ToastProvider} from 'react-toast-notifications'
import Head from 'next/head';
import Router, {useRouter} from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import 'nprogress/nprogress.css'; //styles of nprogress
import {AppWrapper} from "../libs/contextLib";
import {getData} from "../components/Asset";
import {parseQuery} from "../webaverse/util";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomToast from "../components/CustomToast";

import '../styles/globals.css';
import '../styles/Navbar.css';
import '../styles/Footer.css';
import '../styles/Card.css';
import '../styles/CardSvg.css';
import '../styles/CardDetails.css';
import '../styles/CardGrid.css';
import '../styles/LandCard.css';
// import '../styles/LandCardGrid.css';
// import '../styles/ProfileCards.css';
import '../styles/Profile.css';
import '../styles/Mint.css';
import '../styles/IFrame.css';
import '../styles/Activity.css';
import '../styles/CardColumn.css';
import '../styles/Hiring.css';
import '../styles/ProgressBar.css';

//Binding events
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const App = ({ Component, pageProps }) => {
  const [selectedView, setSelectedView] = useState('cards');
  const [searchResults, setSearchResults] = useState(null);
  const [lastPath, setLastPath] = useState('');
  const [token, setToken] = useState(null);
  const [manageKeysOpen, setManageKeysOpen] = useState(false);
  // const [mintMenuOpen, setMintMenuOpen] = useState(false);
  const [mintMenuStep, setMintMenuStep] = useState(1);
    
  const router = useRouter();

  const qs = parseQuery(router.asPath.match(/(\?.*)$/)?.[1] || '');
  if (router.asPath !== lastPath) {
    setLastPath(router.asPath);
    
    const match = router.asPath.match(/^\/assets\/([0-9]+)$/);
    // console.log('got match', router.asPath, match);
    if (match) {
      const tokenId = parseInt(match[1], 10);
      (async () => {
        const token = await getData(tokenId);
        // console.log('got token', {token, tokenId});
        setToken(token);
      })().catch(err => {
        console.warn(err);
      });
    } else {
      setToken(null);
    }
  }
  
  const mintMenuOpen = router.asPath === '/mint';

  return (
    <AppWrapper>
      <ToastProvider components={{ Toast: CustomToast }}>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <Navbar
          token={token}
          setToken={setToken}
          mintMenuOpen={mintMenuOpen}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          setSearchResults={setSearchResults}
          manageKeysOpen={manageKeysOpen}
          setManageKeysOpen={setManageKeysOpen}
        />
        <div className="appContainer">
          <Component
            {...pageProps}
            token={token}
            setToken={setToken}
            mintMenuOpen={mintMenuOpen}
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            searchResults={searchResults}
          />
        </div>
        {/* <Footer /> */}
      </ToastProvider>
    </AppWrapper>
  )
}

export default App;

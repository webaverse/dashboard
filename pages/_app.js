import React, { useEffect, useState } from 'react';
import { ToastProvider } from 'react-toast-notifications'
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import 'nprogress/nprogress.css'; //styles of nprogress
import { AppWrapper } from "../libs/contextLib";
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
import '../styles/LandCardGrid.css';
import '../styles/ProfileCards.css';
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

  return (
    <AppWrapper>
      <ToastProvider components={{ Toast: CustomToast }}>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <Navbar
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          setSearchResults={setSearchResults}
        />
        <div className="appContainer">
          <Component
            {...pageProps}
            selectedView={selectedView}
            searchResults={searchResults}
          />
        </div>
        <Footer />
      </ToastProvider>
    </AppWrapper>
  )
}

export default App;

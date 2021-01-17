import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import 'nprogress/nprogress.css'; //styles of nprogress
import { AppWrapper } from "../libs/contextLib";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import '../styles/globals.css';

import '../styles/Navbar.css';
import '../styles/Footer.css';
import '../styles/Card.css';
import '../styles/CardDetails.css';
import '../styles/CardGrid.css';
import '../styles/LandCard.css';
import '../styles/LandCardGrid.css';
import '../styles/ProfileCards.css';
import '../styles/Profile.css';
import '../styles/Mint.css';
import '../styles/IFrame.css';

//Binding events
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const App = ({ Component, pageProps }) => {

  return (
    <AppWrapper>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="appContainer">
        <Component {...pageProps} />
      </div>
      <Footer />
    </AppWrapper>
  )
}

export default App;

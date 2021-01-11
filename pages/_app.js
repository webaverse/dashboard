import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AppWrapper } from "../libs/contextLib";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import '../styles/globals.css';

import '../styles/Footer.css';
import '../styles/Card.css';
import '../styles/CardDetails.css';
import '../styles/CardGrid.css';
import '../styles/LandCard.css';
import '../styles/LandCardDetails.css';
import '../styles/LandCardGrid.css';
import '../styles/ProfileCards.css';
import '../styles/Profiles.css';
import '../styles/Profile.css';
import '../styles/Mint.css';
import '../styles/Map.css';

import 'leaflet/dist/leaflet.css';

const App = ({ Component, pageProps }) => {

  return (
    <AppWrapper>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </AppWrapper>
  )
}

export default App;

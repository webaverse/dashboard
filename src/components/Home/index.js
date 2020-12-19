import React from 'react';
import '../../assets/css/home.css';
import logo from '../../assets/images/hero.gif';

const Hero = ({heroBg, title, subtitle, callToAction, ctaUrl}) => 
  <div className="hero-container">
    <div className="hero-bg"
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className="hero">
      <div className="hero-copy">
        <h1 className="primary">{title}</h1>
        <p className="primary">{subtitle}</p>
        <a href={ctaUrl} className="button">{callToAction}</a>
      </div>
    </div>
  </div>

const SecondaryHero = ({heroBg, headTitle, title, subtitle, callToAction, ctaUrl}) => 
  <div className="hero-container">
    <div className="hero-bg"
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className="hero">
      <div className="hero-copy">
        <h1 className="head-title">{headTitle}</h1>
        <h1 className="secondary">{title}</h1>
        <p className="secondary">{subtitle}</p>
        <a href={ctaUrl} className="button">{callToAction}</a>
      </div>
    </div>
  </div>



export default () => 
  <>
    <Hero 
      heroBg={logo}
      title="Welcome To Webaverse"
      subtitle="The open, interoperable metaverse built with existing communities."
      callToAction="GET STARTED"
      ctaUrl="https://docs.webaverse.com"
    />
    <SecondaryHero 
      heroBg=""
      headTitle="Explore"
      title="Lose yourself in the music, the moment"
      subtitle="Look. If you had one shot, or one opportunity, to sieze everything you ever wanted."
      callToAction="START EXPLORING"
      ctaUrl="https://docs.webaverse.com"
    />
  </>

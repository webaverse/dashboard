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
    <div className="hero-secondary">
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
      title="Webaverse"
      subtitle="An open virtual world built with existing communities."
      callToAction="GET STARTED"
      ctaUrl="https://docs.webaverse.com"
    />
    <SecondaryHero
      heroBg=""
      headTitle="Explore"
      title="Lose yourself in an expansive, evolving world"
      subtitle="Explore the Webaverse with your friends or go on a solo adventure."
      callToAction="START EXPLORING"
      ctaUrl="https://app.webaverse.com/edit.html"
    />
    <SecondaryHero
      heroBg=""
      headTitle="Create"
      title="Express yourself with your full capabilities"
      subtitle="Creators from all backgrounds are able to create in Webaverse."
      callToAction="START CREATING"
      ctaUrl="https://docs.webaverse.com/docs/create/overview"
    />
    <SecondaryHero
      heroBg=""
      headTitle="Market"
      title="Digital assets from the best creators"
      subtitle="Buy, sell, trade your creations. Owners get micropayment as people use their items or avatars in Webaverse."
      callToAction="START BROWSING"
      ctaUrl="/browse"
    />
  </>

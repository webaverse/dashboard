import React from 'react';
import '../../assets/css/home.css';
import logo from '../../assets/images/hero.gif';

const Hero = ({heroBg, headTitle, title, subtitle, callToAction}) => 
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
        <h1>{headTitle}</h1>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <p>{callToAction}</p>
      </div>
    </div>
  </div>

export default () => 
  <>
    <Hero 
      heroBg={logo}
      headTitle=""
      title="Webaverse"
      subtitle="The open metaverse"
      callToAction="GET STARTED"
    />
    <Hero 
      heroBg={logo}
      headTitle="Explore"
      title="Lose yourself in the music, the moment"
      subtitle="Look. If you had one shot, or one opportunity, to sieze everything you ever wanted."
      callToAction="START EXPLORING"
    />
  </>

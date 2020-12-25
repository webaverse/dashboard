import React from 'react';
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';

import '../../assets/css/home.css';
import logo from '../../assets/images/hero.gif';
import image2 from '../../assets/images/landingImage2.png';
import image3 from '../../assets/images/landingImage3.png';
import image4 from '../../assets/images/landingImage4.png';

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

const SecondSection = ({heroBg, headTitle, title, subtitle, callToAction, ctaUrl}) => 
  <div className="hero-container">
    <div className="hero-bg"
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className="hero-secondary">
      <Container>
        <Row style={{ justifyContent: "center" }}>
          <Col sm={6}>
            <div className="hero-copy">
              <h1 className="head-title">{headTitle}</h1>
              <h1 className="secondary">{title}</h1>
              <p className="secondary">{subtitle}</p>
              <a href={ctaUrl} className="button">{callToAction}</a>
            </div>
          </Col>
          <Col sm={6}>
            <img src={image2} />
          </Col>
        </Row>
      </Container>
    </div>
  </div>

const ThirdSection = ({heroBg, headTitle, title, subtitle, callToAction, ctaUrl}) => 
  <div className="hero-container">
    <div className="hero-bg"
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className="hero-secondary">
      <Container>
        <Row style={{ justifyContent: "center" }}>
          <Col sm={6}>
            <img src={image3} />
          </Col>
          <Col sm={6}>
            <div className="hero-copy">
              <h1 className="head-title">{headTitle}</h1>
              <h1 className="secondary">{title}</h1>
              <p className="secondary">{subtitle}</p>
              <a href={ctaUrl} className="button">{callToAction}</a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  </div>

const FourthSection = ({heroBg, headTitle, title, subtitle, callToAction, ctaUrl}) => 
  <div className="hero-container">
    <div className="hero-bg"
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className="hero-secondary">
      <Container>
        <Row style={{ justifyContent: "center" }}>
          <Col sm={6}>
            <div className="hero-copy">
              <h1 className="head-title">{headTitle}</h1>
              <h1 className="secondary">{title}</h1>
              <p className="secondary">{subtitle}</p>
              <a href={ctaUrl} className="button">{callToAction}</a>
            </div>
          </Col>
          <Col sm={6}>
            <img src={image4} />
          </Col>
        </Row>
      </Container>
    </div>
  </div>



export default () => 
  <>
    <Hero
      heroBg={logo}
      title="Webaverse"
      subtitle="An open virtual world built with existing communities."
      callToAction="GET STARTED"
      ctaUrl="https://discord.gg/R5wqYhvv53"
    />
    <SecondSection
      heroBg=""
      headTitle="Explore"
      title="Lose yourself in an expansive, evolving world"
      subtitle="Explore the Webaverse with your friends or go on a solo adventure."
      callToAction="START EXPLORING"
      ctaUrl="https://discord.gg/R5wqYhvv53"
    />
    <ThirdSection
      heroBg=""
      headTitle="Create"
      title="Express yourself with your full capabilities"
      subtitle="Creators from all backgrounds are able to create in Webaverse."
      callToAction="START CREATING"
      ctaUrl="https://docs.webaverse.com/docs/create/overview"
    />
    <FourthSection
      heroBg=""
      headTitle="Market"
      title="Digital assets from the best creators"
      subtitle="Buy, sell, trade your creations. Owners get micropayment as people use their items or avatars in Webaverse."
      callToAction="START BROWSING"
      ctaUrl="https://docs.webaverse.com/docs/market"
    />
  </>

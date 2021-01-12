import React from 'react';
import Link from 'next/link'
import Image from 'next/image'
import { Container, Row, Col } from 'react-grid-system';

import styles from '../styles/Home.module.css';

const Hero = ({heroBg, title, subtitle, callToAction, ctaUrl}) => 
  <div className={styles.heroContainer}>
    <div className={styles.heroBg}
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.primary}>{title}</h1>
        <p className={styles.primary}>{subtitle}</p>
        <a href={ctaUrl} className={styles.button}>{callToAction}</a>
      </div>
    </div>
  </div>

const SecondSection = ({heroBg, headTitle, title, subtitle, callToAction, ctaUrl}) => 
  <div className={styles.heroContainer}>
    <div className={styles.heroBg}
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className={styles.heroSecondary}>
      <Container>
        <Row style={{ justifyContent: "center" }}>
          <Col sm={6}>
            <div className={styles.heroCopy}>
              <h1 className={styles.headTitle}>{headTitle}</h1>
              <h1 className={styles.secondary}>{title}</h1>
              <p className={styles.secondary}>{subtitle}</p>
              <a href={ctaUrl} className={styles.button}>{callToAction}</a>
            </div>
          </Col>
          <Col sm={6}>
            <Image height="270" width="480" src="/landingImage2.png" />
          </Col>
        </Row>
      </Container>
    </div>
  </div>

const ThirdSection = ({heroBg, headTitle, title, subtitle, callToAction, ctaUrl}) => 
  <div className={styles.heroContainer}>
    <div className={styles.heroBg}
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className={styles.heroSecondary}>
      <Container>
        <Row style={{ justifyContent: "center" }}>
          <Col sm={6}>
            <Image height="270" width="480" src="/landingImage3.png" />
          </Col>
          <Col sm={6}>
            <div className={styles.heroCopy}>
              <h1 className={styles.headTitle}>{headTitle}</h1>
              <h1 className={styles.secondary}>{title}</h1>
              <p className={styles.secondary}>{subtitle}</p>
              <a href={ctaUrl} className={styles.button}>{callToAction}</a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  </div>

const FourthSection = ({heroBg, headTitle, title, subtitle, callToAction, ctaUrl}) => 
  <div className={styles.heroContainer}>
    <div className={styles.heroBg}
      style={{ 
        background: `url(${heroBg})`, 
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    />
    <div className={styles.heroSecondary}>
      <Container>
        <Row style={{ justifyContent: "center" }}>
          <Col sm={6}>
            <div className={styles.heroCopy}>
              <h1 className={styles.headTitle}>{headTitle}</h1>
              <h1 className={styles.secondary}>{title}</h1>
              <p className={styles.secondary}>{subtitle}</p>
              <Link href={ctaUrl}><a className={styles.button}>{callToAction}</a></Link>
            </div>
          </Col>
          <Col sm={6}>
            <Image height="270" width="480" src="/landingImage4.png" />
          </Col>
        </Row>
      </Container>
    </div>
  </div>


export default () => 
  <>
    <Hero
      heroBg="/hero.gif"
      title="Webaverse"
      subtitle="An open virtual world built with existing communities."
      callToAction="Explore"
      ctaUrl="https://app.webaverse.com"
    />
    <SecondSection
      heroBg=""
      headTitle="Explore"
      title="Lose yourself in an expansive, evolving world"
      subtitle="Explore the Webaverse with your friends or go on a solo adventure."
      callToAction="START EXPLORING"
      ctaUrl="https://app.webaverse.com"
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
      title="Digital assets in an open marketplace"
      subtitle="Buy, sell, and trade virtual assets. Collect them all!"
      callToAction="START BROWSING"
      ctaUrl="/assets"
    />
  </>

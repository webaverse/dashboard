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
              <a href={ctaUrl} className={styles.button}>{callToAction}</a>
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
      heroBg="/discordbothero.gif"
      title="Webaverse Bot"
      subtitle="Start your server's meme economy with Discord's favorite virtual world bot."
      callToAction="INVITE NOW"
      ctaUrl="https://discord.com/oauth2/authorize?client_id=758956702669209611&permissions=0&scope=bot"
    />
    <SecondSection
      heroBg=""
      headTitle="Mint"
      title="Mint dank memes"
      subtitle="Mint anything from a image, gif, 3d models, avatars, and more!"
      callToAction="INVITE NOW"
      ctaUrl="https://discord.com/oauth2/authorize?client_id=758956702669209611&permissions=0&scope=bot"
    />
    <ThirdSection
      heroBg=""
      headTitle="Own"
      title="Truly owned community memes"
      subtitle="Any memes you mint or get sent to you stay in your inventory and carry across Discord servers."
      callToAction="INVITE NOW"
      ctaUrl="https://discord.com/oauth2/authorize?client_id=758956702669209611&permissions=0&scope=bot"
    />
    <FourthSection
      heroBg=""
      headTitle="Trade"
      title="Trade and send memes anywhere"
      subtitle="Send memes, SILK across Discord servers that have the Webaverse bot."
      callToAction="INVITE NOW"
      ctaUrl="https://discord.com/oauth2/authorize?client_id=758956702669209611&permissions=0&scope=bot"
    />
  </>

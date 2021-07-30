import React from 'react';
import Link from 'next/link'
import Image from 'next/image'
import { Container, Row, Col } from 'react-grid-system'
import discord from '../public/discordlogo.svg'
import discordWhite from '../public/disW.svg'

import styles from '../styles/Discordbot.module.css'

export default function discordBot() {
  return (
    <div>
      <Container className={styles.botContainer}>
        <Row style={{ alignItems: 'center' }}>
          <Col sm={6}>
            <div className={styles.botContainer}>
              <p className={styles.tagline}><span>BOOST</span> your discord server with Webaverse Bot!</p>
              <p className={styles.subline}>Start your server's meme economy with Discord's favorite virtual world bot and create a fun and inviting community</p>
              <div className={styles.botBtnContainer}>
                <a className={styles.botBtn} href="">
                  <Image src={discord} className={styles.discordLogo} width={30} height={30} />
                  <p>INVITE NOW</p>
                </a>
              </div>
            </div>
          </Col>
          <Col sm={6}>
            <img src="/shebang.gif" className={styles.botImage} />
          </Col>
        </Row>
      </Container>
      <Container className={styles.botContainer}>
        <Row className={styles.botRows} style={{ alignItems: 'center' }}>
          <Col sm={6}>
            <img src="/threeeMain.png" className={styles.placeImg} />
          </Col>
          <Col sm={6}>
            <div className={styles.botContainer}>
              <p className={styles.tagline}><span>VIRTUAL WORLD ECONOMY</span> at your finger tips</p>
              <p className={styles.subline}>There’s no user setup required, anybody in the server the bot is invited to, will be connected automatically to the Ethereum sidechain</p>
            </div>
          </Col>
        </Row>
      </Container>
      <Container className={styles.botContainer}>
        <Row style={{ alignItems: 'center' }}>
          <Col sm={6}>
            <div className={styles.botContainer}>
              <p className={styles.tagline}>Bring your stuffs <span>Across Servers</span></p>
              <p className={styles.subline}>There’s no user setup required, anybody in the server the bot is invited to will have a Webaverse Ethereum address generated for them</p>
            </div>
          </Col>
          <Col sm={6}>
            <img src="/eths.png" className={styles.placeImg} />
          </Col>
        </Row>
      </Container>
      <Container className={styles.botContainer}>
        <Row className={styles.botRows} style={{ alignItems: 'center' }}>
          <Col sm={6}>
            <img src="/minting.png" className={styles.placeImg} />
          </Col>
          <Col sm={6}>
            <div className={styles.botContainer}>
              <p className={styles.tagline}>Create and transfer <span>Nfts</span> with simple commands</p>
              <p className={styles.subline}>Minting anything from a image, gif, 3d models, avatars, and more! will automatically upload and pin it to IPFS</p>
            </div>
          </Col>
        </Row>
      </Container>
      <Container className={styles.botContainer}>
        <Row style={{ alignItems: 'center' }}>
          <Col sm={6}>
            <div className={styles.botContainer}>
              <p className={styles.tagline}>Create <span>Trading Cards</span> or <span>Metaverse Nfts</span></p>
              <p className={styles.subline}>Every NFT minted on Webaverse gets a trading card format version and can be sent across discord servers</p>
            </div>
          </Col>
          <Col sm={6}>
            <img src="/cards.png" className={styles.placeImg} />
          </Col>
        </Row>
      </Container>
      <Container className={styles.botContainer}>
        <Row className={styles.botRows} style={{ alignItems: 'center' }}>
          <Col sm={6}>
            <img src="/silks.png" className={styles.placeImg} />
          </Col>
          <Col sm={6}>
            <div className={styles.botContainer}>
              <p className={styles.tagline}>Webaverse <span>Silk</span></p>
              <p className={styles.subline}><span>SILK</span> is a <span>token</span> that is used in <span>Webaverse</span> primarily to mint <span>NFTs</span>. It's main purpose is to invite others into the <span>network</span> and prevent spam so together we can build a <span>web</span> of trust as the Webaverse <span>scales</span></p>
            </div>
          </Col>
        </Row>
      </Container>
      <Container className={styles.botContainer}>
        <div className={styles.lastSection}>
          <p className={styles.headline}>Boost up your Discord server</p>
          <div className={styles.botBtnContainer}>
            <a className={styles.botBtn} href="">
              <Image src={discordWhite} className={styles.discordLogo} width={30} height={30} />
              <p>INVITE NOW</p>
            </a>
          </div>
        </div>  
      </Container>
    </div>
  )
}
  

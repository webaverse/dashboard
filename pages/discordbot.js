import React from 'react';
import Link from 'next/link'
import Image from 'next/image'
import { Container, Row, Col } from 'react-grid-system'
import discord from '../public/discordlogo.svg'
import discordWhite from '../public/disW.svg'
import repo from '../public/repo.svg'

import styles from '../styles/Discordbot.module.css'

export default function discordBot() {
  return (
    <div>
      <Container className={styles.botContainer}>
        <Row style={{ alignItems: 'center' }}>
          <Col sm={6}>
            <div className={styles.botContainer}>
              <p className={styles.tagline}><span>BOOST</span> your Discord community</p>
              <p className={styles.subline} style={{ maxWidth: 400 }}>Build a meme economy in your server with a CLI to Web3</p>
              <div className={styles.botBtnContainer}>
                <a className={styles.botBtn} href="https://discord.com/oauth2/authorize?client_id=758956702669209611&permissions=0&scope=bot">
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
              <p className={styles.subline}>There's no initial wallet setup required, everyone in the server will have an Ethereum address generated for them.</p>
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
              <p className={styles.subline}>Mint anything from images, 3D models, avatars, and more! The files automatically upload and pin to IPFS.</p>
            </div>
          </Col>
        </Row>
      </Container>
      <Container className={styles.botContainer}>
        <Row style={{ alignItems: 'center' }}>
          <Col sm={6}>
            <div className={styles.botContainer}>
              <p className={styles.tagline}>Create <span>Trading Cards</span> for <span>Metaverse Nfts</span></p>
              <p className={styles.subline}>Every NFT minted gets a trading card generated with randomized battle stats.</p>
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
          <p className={styles.headline}>Upgrade your Discord server today</p>
          <div className={styles.botBtnContainer}>
            <a className={styles.botBtn} href="https://discord.com/oauth2/authorize?client_id=758956702669209611&permissions=0&scope=bot">
              <Image src={discordWhite} className={styles.discordLogo} width={30} height={30} />
              <p>INVITE NOW</p>
            </a>
            <a href="https://github.com/webaverse/ethereum-bot" className={styles.botBtn}>
              <Image src={repo} width={30} height={30} />
              <p>GITHUB REPO</p>
            </a>
          </div>
        </div>  
      </Container>
    </div>
  )
}
  

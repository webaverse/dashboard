import React from 'react'
import { Container, Row, Col } from 'react-grid-system';
import { discordOauthUrl } from '../webaverse/constants.js';

export default () => {

  return (
    <Row style={{ justifyContent: "center" }}>
      <Col sm={12}>
        <Col sm={7} style={{ margin: "0 auto" }}>
          <h2>Discord</h2>
          <br />
          <a className="button" href={discordOauthUrl}>
            Login With Discord
          </a>
        </Col>
      </Col>
    </Row>
  )
}

import React from 'react'
import { Container, Row, Col } from 'react-grid-system';

export default ({name, subtitle, image}) => 
  <Col sm={12}>
    <div className="profileHeader">
      <div className="profileName">
        <h1>{name}</h1>
        <p>{subtitle}</p>
      </div>
      <img src={image} />
    </div>
  </Col>

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-grid-system';


export default ({ inventory }) => {
  if (!inventory) { return null; }

  return inventory.map((item, i) => {
    let url, name;
    const image = item.image || item.avatarPreview;

    if (!image && !item.name) { return; } // blank card
    
    if (item.id) {
      url = "/browse/" + item.id;
      name = item.name.replace(/\.[^/\\.]+$/, "");
    } else if (item.address) {
      url = "/accounts/" + item.address;
      name = item.name ? item.name : "Anonymous";
    }

    return (
      <Col key={i} className="content" sm={12} md={3} style={{
        backgroundImage: `url("${image}")`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      }}>
        <Link to={url}>
          <div className="content-inner">
            <h3 className="contentText">{name}</h3>
          </div>
        </Link>
      </Col>
    )
  })
}

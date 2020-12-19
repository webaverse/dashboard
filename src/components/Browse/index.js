import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MoonLoader from "react-spinners/MoonLoader";
import { Container, Row, Col } from 'react-grid-system';
import { useParams } from "react-router-dom"
import Web3 from 'web3';
import axios from "axios";
import { useAppContext } from "../../libs/contextLib";
import { getBooths } from "../../functions/UIStateFunctions.js";

export default () => {
  const { id } = useParams();
  const { globalState, setGlobalState } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState(null);

  useEffect(() => {
    getBooths(0, globalState).then(res => {
      setSales(res.booths[0]);
      setLoading(false);
    });
  }, []);

  const Sales = () => sales ? sales.map(seller =>
    seller.entries.map((entry, i) =>
      entry.image && entry.name ?
        <Col key={i} className="content" sm={2}>
          <Link to={"/browse/" + entry.id}>
            <img src={entry.image} />
            <h3>{entry.name}</h3>
          </Link>
        </Col>
      : null
    )
  ) : null

  return (
    <>
      <Container>
       <Row style={{ justifyContent: "center" }}>
        {loading ?
              <MoonLoader
                css={"display: inline-block"}
                size={50}
                color={"#c4005d"}
                loading={loading}
              />
        :
          <Sales />
        }
        </Row>
      </Container>
    </>
  )
}

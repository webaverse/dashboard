import React from 'react';
import MoonLoader from "react-spinners/MoonLoader";

export default ({ loading }) => loading ?
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <MoonLoader css={{ display: "flex" }} size={50} color={"#c4005d"} />
  </div>
: null

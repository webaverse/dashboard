import React from 'react';
import MoonLoader from "react-spinners/MoonLoader";

const Loader = ({ loading }) => loading ?
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <MoonLoader css={{ display: "flex" }} size={50} color={"#c4005d"} />
  </div>
: null;
export default Loader;
import React from 'react';
import MoonLoader from "react-spinners/MoonLoader";

export default ({ loading }) => loading ? <MoonLoader css={"display: inline-block"} size={50} color={"#c4005d"} /> : null

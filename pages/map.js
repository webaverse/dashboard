import React from 'react'

const Map = () => {
  return (
    <>
      <p>
        Double click anywhere on the map to go directly there in Webaverse.
      </p>
      <div className="IFrameContainer">
        <iframe className="IFrame" src="https://map.webaverse.com" />
      </div>
    </>
  )
};
export default Map;
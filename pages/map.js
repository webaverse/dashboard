import React from 'react'

const Map = () => {
  return (
    <>
      <p>
        Double click anywhere on the map to go directly there in Webaverse.
      </p>
      <iframe className="map-iframe" src="https://map.webaverse.com" />
    </>
  )
};
export default Map;
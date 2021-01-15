import React from 'react'

export default () => {
  return (
    <>
      <p>
        Double click anywhere on the map to go directly there in Webaverse.
      </p>
      <div className="mapContainer">
        <iframe className="mapFrame" src="https://map.webaverse.com" />
      </div>
    </>
  )
}

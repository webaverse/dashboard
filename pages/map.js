import React from 'react'

export default () => {
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
}

import React from 'react';
import { MapContainer, CircleMarker, Tooltip, ImageOverlay } from 'react-leaflet';
import L from "leaflet";

export default () => {
  const bounds = [[0,0], [808,804]];

  return ( 
    <MapContainer className="mapContainer" center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true}>
      <ImageOverlay
        bounds={bounds}
        url="https://user-images.githubusercontent.com/29695350/104216796-260c3700-5400-11eb-84cb-98b88bb8a7f6.PNG"
      />
    </MapContainer>
  )
}

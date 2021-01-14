import React from 'react';
import { MapContainer, CircleMarker, Tooltip, TileLayer } from 'react-leaflet';
import L from "leaflet";

export default () => {
  const bounds = [[0,0], [2,2]];

  return ( 
    <MapContainer className="mapContainer" center={[0, 0]} zoom={3} scrollWheelZoom={true}>
      <TileLayer
        url="https://land-preview.exokit.org/{z}/{x}/{y}"
      />
    </MapContainer>
  )
}

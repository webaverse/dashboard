import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";

const Map = () => {
    const bounds = [
        [0, 0],
        [2, 2],
    ];

    return (
        <MapContainer
            className="mapContainer"
            center={[0, 0]}
            zoom={3}
            scrollWheelZoom={true}
        >
            <TileLayer url="https://land-preview.exokit.org/{z}/{x}/{y}" />
        </MapContainer>
    );
};

export default Map;

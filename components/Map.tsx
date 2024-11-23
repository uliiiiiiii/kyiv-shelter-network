"use client"
import { MapContainer, TileLayer } from 'react-leaflet';
import styles from '@/styles/Map.module.css';
import 'leaflet/dist/leaflet.css';

export default function Map() {

  const kyivCoords: [number, number] = [50.4001, 30.6234];
  
  return (
    <div className={styles.mapContainer}>
      <MapContainer
        key="map"
        center={kyivCoords}
        zoom={11}
        maxZoom={18}
        minZoom={11}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
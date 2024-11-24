'use client'

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet'; 
import styles from '@/styles/Map.module.css';
import 'leaflet/dist/leaflet.css';
import { Shelter } from '@/types/shelter';

export default function Map() {
  const [shelters, setShelters] = useState<Shelter[]>([]);

  const kyivCoords: [number, number] = [50.4001, 30.6234];

  const pointIcon = new DivIcon({
    className: 'shelter-icon',
    html: '<div style="width: 8px; height: 8px; background-color: red; border-radius: 50%; border: none;"></div>',
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });

  useEffect(() => {
    const fetchShelters = async () => {
      const res = await fetch('/api/shelters');
      const data: Shelter[] = await res.json();
      setShelters(data);
    };

    fetchShelters();
  }, []);

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

        {shelters.map(shelter => (
          shelter.latitude && shelter.longitude && (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={pointIcon}
            >
              <Popup>
                <div>
                  <h3>{shelter.address}</h3>
                  <p><strong>Type:</strong> {shelter.shelter_type}</p>
                  <p><strong>Owner:</strong> {shelter.owner}</p>
                  <p><strong>Пандус:</strong> {shelter.accessibility ? 'є' : 'немає'}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

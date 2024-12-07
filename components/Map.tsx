'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DivIcon, Icon } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import LocateButton from '@/components/LocateButton';
import styles from '@/styles/Map.module.css';
import 'leaflet/dist/leaflet.css';
import { Shelter } from '@/types/shelter';
import getMarkerColor from '@/utils/getMarkerColor';
import ShelterInfoPopup from './shelterInfoPopup';

const defaultIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Map() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]); 

  const kyivCoords: [number, number] = [50.4001, 30.6234];

  const shelterTypes = [
    'Укриття',
    'Підвал',
    'Перший поверх',
    'Підземний паркінг',
    'Станція метрополітену',
    'Інше',
    'Цокольний поверх',
    'Підземний перехід'
  ];

  const createIcon = (color: string) =>
    new DivIcon({
      className: 'shelter-icon',
      html: `<div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

  const handleCheckboxChange = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

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
      <div className={styles.filterPanel}>
        <h3 style={{'paddingBottom': '10px', 'paddingRight': '30px'}}>Фільтрувати укриття:</h3>
        {shelterTypes.map((type) => {
          const isChecked = selectedTypes.includes(type);
          return (
            <label
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                value={type}
                checked={isChecked}
                onChange={() => handleCheckboxChange(type)}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: getMarkerColor(type),
                  position: 'relative',
                  marginRight: '8px',
                  boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
                  border: `2px solid ${isChecked ? 'black' : 'white'}`,
                }}
              >
                {isChecked && (
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'black',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
              {type}
            </label>
          );
        })}
      </div>
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

        <LocateButton onLocationFound={(location) => setUserLocation(location)} />

        <MarkerClusterGroup
          maxClusterRadius={20}
          showCoverageOnHover={false}
          spiderfyDistanceMultiplier={2}
        >
          {shelters
            .filter((shelter) =>
              selectedTypes.length === 0 || selectedTypes.includes(shelter.place)
            )
            .map(
              (shelter) =>
                shelter.latitude &&
                shelter.longitude && (
                  <Marker
                    key={shelter.id}
                    position={[shelter.latitude, shelter.longitude]}
                    icon={createIcon(getMarkerColor(shelter.place))}
                  >
                    <ShelterInfoPopup address = {shelter.address} shelter_type = {shelter.shelter_type} place = {shelter.place} accessibility = {shelter.accessibility}/>
                    
                  </Marker>
                )
            )}
        </MarkerClusterGroup>

        {userLocation && (
          <Marker position={userLocation} icon={defaultIcon}>
            <Popup>Ваша ґеолокація</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

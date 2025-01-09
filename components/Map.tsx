"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DivIcon, Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import LocateButton from "@/components/LocateButton";
import styles from "@/styles/Map.module.css";
import "leaflet/dist/leaflet.css";
import { Shelter } from "@/types/shelter";
import ShelterInfoPopup from "./shelterInfoPopup";
import shelterTypes from "@/constants/shelterTypes";
import KyivCoords from "@/constants/KyivCoords";
import ShelterTypeFilter from "@/components/ShelterTypeFilter";
import getMarkerColor from "@/utils/getMarkerColor";

const MarkerClusterGroupWithChildren =
  MarkerClusterGroup as React.ComponentType<ExtendedMarkerClusterGroupProps>;

const DEFAULT_ICON = new Icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CLUSTER_GROUP_PROPS = {
  maxClusterRadius: 20,
  showCoverageOnHover: false,
  spiderfyDistanceMultiplier: 2,
} as const;

export default function Map() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const createIcon = useCallback((color: string) => {
    return new DivIcon({
      className: "shelter-icon",
      html: `<div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  }, []);

  const handleCheckboxChange = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await fetch("/api/shelters");
        if (!res.ok) throw new Error("Failed to fetch shelters");
        const data: Shelter[] = await res.json();
        setShelters(data);
      } catch (error) {
        console.error("Error fetching shelters:", error);
      }
    };
    fetchShelters();
  }, []);

  const filteredShelters = useMemo(() => {
    return shelters.filter(
      (shelter) =>
        (selectedTypes.length === 0 || selectedTypes.includes(shelter.place)) &&
        shelter.latitude &&
        shelter.longitude
    );
  }, [shelters, selectedTypes]);

  return (
    <div className={styles.mapContainer}>
      <ShelterTypeFilter
        types={shelterTypes}
        selectedTypes={selectedTypes}
        onTypeChange={handleCheckboxChange}
      />
      <MapContainer
        key="map"
        center={KyivCoords}
        zoom={11}
        maxZoom={18}
        minZoom={11}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocateButton onLocationFound={setUserLocation} />
        <MarkerClusterGroupWithChildren {...CLUSTER_GROUP_PROPS}>
          {filteredShelters.map((shelter) => (
            <Marker
              key={shelter.id}
              position={[shelter.latitude!, shelter.longitude!]}
              icon={createIcon(getMarkerColor(shelter.place))}
            >
              <ShelterInfoPopup
                address={shelter.address}
                shelter_type={shelter.shelter_type}
                place={shelter.place}
                accessibility={shelter.accessibility}
              />
            </Marker>
          ))}
        </MarkerClusterGroupWithChildren>
        {userLocation && (
          <Marker position={userLocation} icon={DEFAULT_ICON}>
            <Popup>Ваша ґеолокація</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

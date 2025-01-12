"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import LocateButton from "@/components/LocateButton";
import Search from "@/components/Search";
import ShelterTypeFilter from "@/components/ShelterTypeFilter";
import { ShelterMarker } from "./ShelterMarker";
import { RoutingMachine } from "./RoutingMachine";
import { DEFAULT_ICON } from "../constants/mapSettings";
import KyivCoords from "@/constants/KyivCoords";
import findNearestShelter from "@/utils/findNearestShelter";
import haversine from "@/utils/calculateDistance";
import shelterTypes from "@/constants/shelterTypes";
import { Shelter } from "@/types/shelter";
import styles from "@/styles/Map.module.css";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { MapProps } from "@/types/map";

export const Map = ({
  initialZoom = 11,
  minZoom = 11,
  maxZoom = 18,
}: MapProps) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [currentMarker, setCurrentMarker] = useState<[number, number] | null>(
    null
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [nearestShelter, setNearestShelter] = useState<Shelter | null>(null);

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

  useEffect(() => {
    if (currentMarker) {
      const nearest = findNearestShelter(currentMarker, shelters);
      setNearestShelter(nearest);
    }
  }, [currentMarker, shelters]);

  const handleLocationAdded = useCallback((location: [number, number]) => {
    setCurrentMarker(location);
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
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
        onTypeChange={handleTypeChange}
      />
      <MapContainer
        center={KyivCoords}
        zoom={initialZoom}
        maxZoom={maxZoom}
        minZoom={minZoom}
        className={styles.map}
      >
        <Search onLocationAdded={handleLocationAdded} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocateButton onLocationFound={handleLocationAdded} />

        {filteredShelters.map((shelter) => (
          <ShelterMarker
            key={shelter.id}
            shelter={shelter}
            isNearest={nearestShelter?.id === shelter.id}
          />
        ))}

        {currentMarker && (
          <Marker position={currentMarker} icon={DEFAULT_ICON}>
            <Popup>
              {`Marker at: ${currentMarker[0]}, ${currentMarker[1]}`}
            </Popup>
          </Marker>
        )}

        {currentMarker && nearestShelter && (
          <RoutingMachine
            userPosition={currentMarker}
            shelterPosition={[
              nearestShelter.latitude!,
              nearestShelter.longitude!,
            ]}
          />
        )}

        {nearestShelter && currentMarker && (
          <div className={styles.nearestShelterInfo}>
            Найближче укриття знаходиться за{" "}
            {haversine(
              currentMarker[0],
              currentMarker[1],
              nearestShelter.latitude!,
              nearestShelter.longitude!
            ).toFixed(2)}{" "}
            км.
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;

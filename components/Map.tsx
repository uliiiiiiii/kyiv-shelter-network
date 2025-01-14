"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import LocateButton from "@/components/LocateButton";
import Search from "@/components/Search";
import ShelterTypeFilter from "@/components/ShelterTypeFilter";
import { ShelterMarker } from "./ShelterMarker";
import RoutingMachineOSRM from "./RoutingMachineOSRM";
import { DEFAULT_ICON } from "../constants/mapSettings";
import KyivCoords from "@/constants/KyivCoords";
import findNearestShelters from "@/utils/findNearestShelter";
import haversine from "@/utils/calculateDistance";
import shelterTypes from "@/constants/shelterTypes";
import { Shelter } from "@/types/shelter";
import styles from "@/styles/Map.module.css";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import { MapProps } from "@/types/map";
import WalkingRoute from "./RoutingMachineGraphHopper";
import { RouteInfo } from "./RoutingMachineGraphHopper";

interface ExtendedMarkerClusterGroupProps extends L.MarkerClusterGroupOptions {
  children: React.ReactNode;
}

const TypedMarkerClusterGroup: React.FC<ExtendedMarkerClusterGroupProps> =
  MarkerClusterGroup as any;

const routeColors = ["green", "orange", "red"];

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
  const [nearestShelters, setNearestShelters] = useState<Shelter[]>([]);
  const [walkingDistances, setWalkingDistances] = useState<
    Record<
      number,
      {
        walkingDistance: number;
        walkingTime: number;
      } | null
    >
  >({});

  const handleRouteCalculated = useCallback(
    (shelterId: number, routeInfo: RouteInfo | null) => {
      setWalkingDistances((prev) => ({
        ...prev,
        [shelterId]: routeInfo,
      }));
    },
    []
  );

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
      const nearest = findNearestShelters(currentMarker, shelters, 3);
      setNearestShelters(nearest);
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

        <TypedMarkerClusterGroup
          disableClusteringAtZoom={15}
          showCoverageOnHover={false}
        >
          {filteredShelters.map((shelter) => (
            <ShelterMarker
              key={shelter.id}
              shelter={shelter}
              isNearest={nearestShelters.some((s) => s.id === shelter.id)}
            />
          ))}
        </TypedMarkerClusterGroup>
        {currentMarker && (
          <Marker position={currentMarker} icon={DEFAULT_ICON}>
            <Popup>
              {`Marker at: ${currentMarker[0]}, ${currentMarker[1]}`}
              <h1>{nearestShelters.toString()}</h1>
            </Popup>
          </Marker>
        )}

        {currentMarker &&
          nearestShelters.map((shelter, index) => {
            return (
              // <RoutingMachineOSRM
              //   key={shelter.id}
              //   userPosition={currentMarker}
              //   shelterPosition={[shelter.latitude!, shelter.longitude!]}
              //   color={routeColors[index % routeColors.length]}
              // />
              <WalkingRoute
                key={shelter.id}
                userPosition={[currentMarker[0], currentMarker[1]]}
                shelterPosition={[shelter.latitude!, shelter.longitude!]}
                color={routeColors[index % routeColors.length]}
                shelterId={shelter.id}
                onRouteCalculated={handleRouteCalculated}
              />
            );
          })}

        {nearestShelters.length > 0 && currentMarker && (
          <div className={styles.nearestShelterInfo}>
            Найближчі укриття:
            <ul>
              {nearestShelters.map((shelter) => (
                <li key={shelter.id}>
                  {shelter.place} -{" "}
                  {haversine(
                    currentMarker[0],
                    currentMarker[1],
                    shelter.latitude!,
                    shelter.longitude!
                  ).toFixed(2)}{" "}
                  км
                </li>
              ))}
            </ul>
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;

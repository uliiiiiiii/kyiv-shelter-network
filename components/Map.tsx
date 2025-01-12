"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DivIcon, Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import LocateButton from "@/components/LocateButton";
import Search from "@/components/Search";
import ShelterInfoPopup from "@/components/ShelterInfoPopup";
import ShelterTypeFilter from "@/components/ShelterTypeFilter";
import styles from "@/styles/Map.module.css";
// import "leaflet/dist/leaflet.css";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Shelter } from "@/types/shelter";
import shelterTypes from "@/constants/shelterTypes";
import KyivCoords from "@/constants/KyivCoords";
import getMarkerColor from "@/utils/getMarkerColor";
import findNearestShelter from "@/utils/findNearestShelter";
import haversine from "@/utils/calculateDistance";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

const MarkerClusterGroupWithChildren =
  MarkerClusterGroup as React.ComponentType<ExtendedMarkerClusterGroupProps>;

const DEFAULT_ICON = new Icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CLUSTER_GROUP_PROPS = {
  maxClusterRadius: 10,
  showCoverageOnHover: false,
  spiderfyDistanceMultiplier: 2,
  iconCreateFunction: () => {
    return new DivIcon({
      html: `<div style="display: none;"></div>`,
      className: "custom-cluster-icon",
      iconSize: [0, 0],
    });
  },
} as const;

interface RoutingMachineProps {
  userPosition: any;
  shelterPosition: any;
}

interface CustomRoutingControlOptions extends L.Routing.RoutingControlOptions {
  createMarker?: () => null;
  draggableWaypoints?: boolean;
}

const RoutingMachine = ({
  userPosition,
  shelterPosition,
}: RoutingMachineProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !userPosition || !shelterPosition) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(shelterPosition[0], shelterPosition[1]),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "hotpink", opacity: 0.8, weight: 4 }],
        extendToWaypoints: false,
        missingRouteTolerance: 0,
      },
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: function () {
        return null;
      },
      containerClassName: styles.customRoutingContainer,
    } as CustomRoutingControlOptions).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, userPosition, shelterPosition]);

  return null;
};

export default function Map() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [currentMarker, setCurrentMarker] = useState<[number, number] | null>(
    null
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [nearestShelter, setNearestShelter] = useState<Shelter | null>(null);
  const [zoomLevel, setZoomLevel] = useState(11);

  useEffect(() => {
    if (currentMarker) {
      const nearest = findNearestShelter(currentMarker, shelters);
      setNearestShelter(nearest);
    }
  }, [currentMarker, shelters]);

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

  const handleLocationAdded = useCallback((location: [number, number]) => {
    setCurrentMarker(location);
  }, []);

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
        center={KyivCoords}
        zoom={zoomLevel}
        maxZoom={18}
        minZoom={11}
        className={styles.map}
      >
        <Search onLocationAdded={handleLocationAdded} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocateButton onLocationFound={handleLocationAdded} />
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
        {currentMarker && (
          <Marker position={currentMarker} icon={DEFAULT_ICON}>
            <Popup>
              {`Marker at: ${currentMarker[0]}, ${currentMarker[1]}`}
            </Popup>
          </Marker>
        )}
        {nearestShelter && (
          <Marker
            position={[nearestShelter.latitude!, nearestShelter.longitude!]}
            icon={
              new DivIcon({
                className: "nearest-shelter-icon",
                html: `<div style="width: 12px; height: 12px;  border: 3px solid hotpink; border-radius: 50%; transform: scale(1.2); transition: transform 0.3s ease; border-radius: 50%;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6],
              })
            }
          >
            <Popup>
              <strong>Найближче укриття</strong>
              <br />
              Адреса: {nearestShelter.address}
              <br />
              Тип: {nearestShelter.building_type}
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
}

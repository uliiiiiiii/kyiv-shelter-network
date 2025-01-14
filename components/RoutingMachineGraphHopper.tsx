import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

interface WalkingRouteProps {
  userPosition: [number, number];
  shelterPosition: [number, number];
  color?: string;
  shelterId: number;
  onRouteCalculated: (shelterId: number, routeInfo: RouteInfo | null) => void;
}

export interface RouteInfo {
  walkingDistance: number;
  walkingTime: number;
}

interface GraphHopperResponse {
  paths: Array<{
    distance: number;
    time: number;
    points: {
      coordinates: Array<[number, number]>;
    };
  }>;
}

const WalkingRoute = ({
  userPosition,
  shelterPosition,
  color = "blue",
  shelterId,
  onRouteCalculated,
}: WalkingRouteProps) => {
  const map = useMap();
  const apiKey = process.env.NEXT_PUBLIC_GRAPH_HOPPER_API_KEY;

  useEffect(() => {
    if (!map || !userPosition || !shelterPosition || !apiKey) {
      onRouteCalculated(shelterId, null);
      return;
    }

    let routeLayer: L.Polyline | null = null;

    const fetchRoute = async () => {
      try {
        const response = await axios.get<GraphHopperResponse>(
          `https://graphhopper.com/api/1/route?` +
            `point=${userPosition[0]},${userPosition[1]}&` +
            `point=${shelterPosition[0]},${shelterPosition[1]}&` +
            `vehicle=foot&` +
            `points_encoded=false&` +
            `key=${apiKey}`
        );

        const path = response.data.paths[0];
        const coordinates = path.points.coordinates;
        const latLngs = coordinates.map((coord) =>
          L.latLng(coord[1], coord[0])
        );

        const routeInfo = {
          walkingDistance: path.distance,
          walkingTime: path.time,
        };

        onRouteCalculated(shelterId, routeInfo);

        if (routeLayer) {
          map.removeLayer(routeLayer);
        }

        routeLayer = L.polyline(latLngs, {
          color,
          weight: 5,
          opacity: 0.7,
        }).addTo(map);
      } catch (error) {
        console.error("Error fetching route:", error);
        onRouteCalculated(shelterId, null);
      }
    };

    fetchRoute();

    return () => {
      if (routeLayer) {
        map.removeLayer(routeLayer);
      }
    };
  }, [
    map,
    userPosition,
    shelterPosition,
    apiKey,
    color,
    shelterId,
    onRouteCalculated,
  ]);

  return null;
};

export default WalkingRoute;

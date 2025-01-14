import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

interface WalkingRouteProps {
  userPosition: [number, number];
  shelterPosition: [number, number];
  color?: string;
  onRouteCalculated?: (routeInfo: RouteInfo) => void;
}

interface RouteInfo {
  distance: number;
  time: number;
}

interface GraphHopperResponse {
  paths: Array<{
    distance: number;
    time: number;
    points: {
      coordinates: Array<[number, number]>;
    };
    instructions: Array<{
      text: string;
      distance: number;
      time: number;
    }>;
  }>;
}

const WalkingRoute = ({
  userPosition,
  shelterPosition,
  color = "blue",
  onRouteCalculated,
}: WalkingRouteProps) => {
  const map = useMap();
  const apiKey = process.env.NEXT_PUBLIC_GRAPH_HOPPER_API_KEY;
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    if (!map || !userPosition || !shelterPosition || !apiKey) {
      console.error(
        !apiKey ? "GraphHopper API key is missing!" : "Missing required props"
      );
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
            `instructions=true&` +
            `key=${apiKey}`
        );

        const path = response.data.paths[0];
        const coordinates = path.points.coordinates;
        const latLngs = coordinates.map((coord) =>
          L.latLng(coord[1], coord[0])
        );

        const newRouteInfo = {
          distance: path.distance,
          time: path.time,
        };
        setRouteInfo(newRouteInfo);

        if (onRouteCalculated) {
          onRouteCalculated(newRouteInfo);
        }

        if (routeLayer) {
          map.removeLayer(routeLayer);
        }

        routeLayer = L.polyline(latLngs, {
          color,
          weight: 5,
          opacity: 0.7,
        }).addTo(map);

        const formattedDistance = formatDistance(path.distance);
        const formattedTime = formatTime(path.time);

        routeLayer.bindPopup(
          `Відстань: ${formattedDistance}<br>` +
            `Приблизний час: ${formattedTime}`
        );

        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();

    return () => {
      if (routeLayer) {
        map.removeLayer(routeLayer);
      }
    };
  }, [map, userPosition, shelterPosition, apiKey, color, onRouteCalculated]);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} м`;
    }
    return `${(meters / 1000).toFixed(1)} км`;
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.round(milliseconds / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} хв`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} год ${remainingMinutes} хв`;
  };

  return null;
};

export default WalkingRoute;

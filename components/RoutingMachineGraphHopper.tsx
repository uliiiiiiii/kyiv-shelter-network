import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

interface WalkingRouteProps {
  userPosition: [number, number];
  shelterPosition: [number, number];
  color?: string;
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
}: WalkingRouteProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GRAPH_HOPPER_API_KEY;
  const map = useMap();

  useEffect(() => {
    if (!map || !userPosition || !shelterPosition) {
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

        const coordinates = response.data.paths[0].points.coordinates;
        const latLngs = coordinates.map((coord) =>
          L.latLng(coord[1], coord[0])
        );

        if (routeLayer) {
          map.removeLayer(routeLayer);
        }

        routeLayer = L.polyline(latLngs, {
          color,
          weight: 5,
          opacity: 0.7,
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });

        return response.data.paths[0];
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
  }, [map, userPosition, shelterPosition, apiKey, color]);

  return null;
};

export default WalkingRoute;

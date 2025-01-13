import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { RoutingMachineProps, CustomRoutingControlOptions } from "@/types/map";
import styles from "@/styles/Map.module.css";

export const RoutingMachine = ({
  userPosition,
  shelterPosition,
  color = "blue",
}: RoutingMachineProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !userPosition || !shelterPosition) {
      return undefined;
    }

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(shelterPosition[0], shelterPosition[1]),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: color, opacity: 0.8, weight: 4 }],
        extendToWaypoints: false,
        missingRouteTolerance: 0,
      },
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      containerClassName: styles.customRoutingContainer,
    } as CustomRoutingControlOptions);

    routingControl.addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, userPosition, shelterPosition]);

  return null;
};

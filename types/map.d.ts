import { Icon, DivIcon } from "leaflet";
import { Shelter } from "@/types/shelter";

export interface MarkerClusterGroupProps {
  maxClusterRadius?: number;
  showCoverageOnHover?: boolean;
  spiderfyDistanceMultiplier?: number;
  chunkedLoading?: boolean;
  disableClusteringAtZoom?: number;
  spiderfyOnMaxZoom?: boolean;
  removeOutsideVisibleBounds?: boolean;
  animate?: boolean;
}
  
export interface ExtendedMarkerClusterGroupProps extends MarkerClusterGroupProps {
  children: React.ReactNode;
}
  
  
export interface RoutingMachineProps {
  userPosition: [number, number];
  shelterPosition: [number, number];
}

export interface CustomRoutingControlOptions extends L.Routing.RoutingControlOptions {
  createMarker?: () => null;
  routeWhileDragging: boolean;
  draggableWaypoints?: boolean;
}
  
export interface MapProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
}
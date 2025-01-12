import { Icon, DivIcon } from "leaflet";

export const DEFAULT_ICON = new Icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
  
export const CLUSTER_GROUP_PROPS = {
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
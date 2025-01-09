interface MarkerClusterGroupProps {
    maxClusterRadius?: number;
    showCoverageOnHover?: boolean;
    spiderfyDistanceMultiplier?: number;
    chunkedLoading?: boolean;
    disableClusteringAtZoom?: number;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
  }
  
  interface ExtendedMarkerClusterGroupProps extends MarkerClusterGroupProps {
    children: React.ReactNode;
  }
  
 
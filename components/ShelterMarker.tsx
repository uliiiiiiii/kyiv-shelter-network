import { Marker } from "react-leaflet";
import { DivIcon } from "leaflet";
import { Shelter } from "@/types/shelter";
import ShelterInfoPopup from "./ShelterInfoPopup";
import getMarkerColor from "@/utils/getMarkerColor";

interface ShelterMarkerProps {
  shelter: Shelter;
  isNearest?: boolean;
}

export const ShelterMarker = ({ shelter, isNearest }: ShelterMarkerProps) => {
  const icon = new DivIcon({
    className: isNearest ? "nearest-shelter-icon" : "shelter-icon",
    html: isNearest
      ? `<div style="width: 12px; height: 12px; border: 3px solid hotpink; border-radius: 50%; transform: scale(1.2); transition: transform 0.3s ease;"></div>`
      : `<div style="width: 12px; height: 12px; background-color: ${getMarkerColor(
          shelter.place
        )}; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  return (
    <Marker position={[shelter.latitude!, shelter.longitude!]} icon={icon}>
      <ShelterInfoPopup
        address={shelter.address}
        shelter_type={shelter.shelter_type}
        place={shelter.place}
        accessibility={shelter.accessibility}
      />
    </Marker>
  );
};

import haversine from "@/utils/calculateDistance";
import { Shelter } from "@/types/shelter";

export default function findNearestShelter(
  userLocation: [number, number] | null,
  shelters: Shelter[]
): Shelter | null {
  if (!userLocation) return null;

  let nearestShelter: Shelter | null = null;
  let minDistance = Infinity;

  shelters.forEach((shelter) => {
    if (shelter.latitude && shelter.longitude) {
      const distance = haversine(
        userLocation[0],
        userLocation[1],
        shelter.latitude,
        shelter.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestShelter = shelter;
      }
    }
  });

  return nearestShelter;
}

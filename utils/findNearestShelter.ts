import haversine from "@/utils/calculateDistance";
import { Shelter } from "@/types/shelter";

export default function findNearestShelters(
  userLocation: [number, number] | null,
  shelters: Shelter[],
  count: number = 1
): Shelter[] {
  if (!userLocation) return [];

  const sheltersWithDistance = shelters
    .filter((shelter) => shelter.latitude && shelter.longitude)
    .map((shelter) => ({
      ...shelter,
      distance: haversine(
        userLocation[0],
        userLocation[1],
        shelter.latitude!,
        shelter.longitude!
      ),
    }));

  return sheltersWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(({ distance, ...shelter }) => shelter);
}

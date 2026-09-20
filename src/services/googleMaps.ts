import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import type { Place } from "../types";

let configuredKey = "";
let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (!apiKey) return Promise.reject(new Error("Missing Google Maps API key"));
  if (loadPromise && configuredKey === apiKey) return loadPromise;
  configuredKey = apiKey;
  setOptions({ key: apiKey, v: "weekly" });
  loadPromise = Promise.all([
    importLibrary("maps"),
    importLibrary("marker"),
    importLibrary("places"),
  ]).then(() => undefined);
  return loadPromise;
}

export function placeToSavedPlace(place: google.maps.places.Place): Place | null {
  const location = place.location;
  if (!place.id || !place.displayName || !location) return null;
  return {
    placeId: place.id,
    name: place.displayName,
    address: place.formattedAddress || "Address unavailable",
    latitude: location.lat(),
    longitude: location.lng(),
    category: place.primaryTypeDisplayName ?? undefined,
  };
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const { Place: GooglePlace } = await importLibrary("places");
  const response = await GooglePlace.searchByText({
    textQuery: query,
    // The official Maps Demo Key supports the Place class but excludes
    // user-generated content such as photos and reviews, so keep this field
    // request to the reliable prototype essentials.
    fields: ["id", "displayName", "formattedAddress", "location", "primaryTypeDisplayName"],
    maxResultCount: 6,
  });
  return response.places.map(placeToSavedPlace).filter((place): place is Place => place !== null);
}

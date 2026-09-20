import { useEffect, useRef } from "react";
import type { ItineraryItem, Place } from "../../types";

interface GoogleMapProps {
  selectedPlace: Place | null;
  savedPlaces: ItineraryItem[];
  onSelectSaved: (place: Place) => void;
}

export function GoogleMap({ selectedPlace, savedPlaces, onSelectSaved }: GoogleMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(elementRef.current, {
      center: { lat: 41.8781, lng: -87.6298 },
      zoom: 11,
      mapId: "DEMO_MAP_ID",
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      gestureHandling: "greedy",
    });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => { marker.map = null; });
    markersRef.current = [];

    savedPlaces.forEach((place, index) => {
      const pin = document.createElement("button");
      pin.className = "map-pin map-pin--saved";
      pin.type = "button";
      pin.textContent = String(index + 1);
      pin.title = place.name;
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: place.latitude, lng: place.longitude },
        title: place.name,
        content: pin,
      });
      marker.addListener("click", () => onSelectSaved(place));
      markersRef.current.push(marker);
    });

    if (selectedPlace && !savedPlaces.some((place) => place.placeId === selectedPlace.placeId)) {
      const pin = document.createElement("span");
      pin.className = "map-pin map-pin--selected";
      pin.textContent = "✦";
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: selectedPlace.latitude, lng: selectedPlace.longitude },
        title: selectedPlace.name,
        content: pin,
      });
      markersRef.current.push(marker);
    }
  }, [savedPlaces, selectedPlace, onSelectSaved]);

  useEffect(() => {
    if (!selectedPlace || !mapRef.current) return;
    mapRef.current.panTo({ lat: selectedPlace.latitude, lng: selectedPlace.longitude });
    mapRef.current.setZoom(15);
  }, [selectedPlace]);

  return <div className="google-map" ref={elementRef} aria-label="Interactive Google map" />;
}

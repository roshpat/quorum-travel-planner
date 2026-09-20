import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GoogleMap } from "../components/explore/GoogleMap";
import { PlaceDetails } from "../components/explore/PlaceDetails";
import { PlaceSearch } from "../components/explore/PlaceSearch";
import { SavedPlacesPanel } from "../components/explore/SavedPlacesPanel";
import { useTravel } from "../context/TravelContext";
import { loadGoogleMaps } from "../services/googleMaps";
import type { Place } from "../types";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export function ExplorePage() {
  const { trip, itinerary, addPlace } = useTravel();
  const [searchParams] = useSearchParams();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(() => {
    const requestedPlaceId = searchParams.get("place");
    return itinerary.find((place) => place.placeId === requestedPlaceId) ?? null;
  });
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "missing" | "error">(apiKey ? "loading" : "missing");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!apiKey) return;
    let active = true;
    loadGoogleMaps(apiKey).then(() => { if (active) setMapStatus("ready"); }).catch(() => { if (active) setMapStatus("error"); });
    return () => { active = false; };
  }, []);

  const handleSelect = useCallback((place: Place) => {
    setSelectedPlace(place);
    setNotice("");
  }, []);

  function handleAdd() {
    if (!selectedPlace) return;
    const added = addPlace(selectedPlace);
    setNotice(added ? `${selectedPlace.name} was added to the group itinerary.` : `${selectedPlace.name} is already in the trip.`);
  }

  return (
    <div className="explore-page">
      <header className="explore-header">
        <div><span className="eyebrow accent-eyebrow">Powered by Google Places</span><h1>Explore {trip.destination}</h1><p>Search, compare, and save the places that make the group say yes.</p></div>
        <Link to="/itinerary" className="button button--secondary">View itinerary <span>{itinerary.length}</span></Link>
      </header>

      {mapStatus === "missing" && (
        <div className="map-setup-state">
          <div className="map-pattern" aria-hidden="true"><span>⌖</span></div>
          <div><span className="eyebrow">One setup step remains</span><h2>Connect Google Maps to explore live places</h2><p>The application is ready for the Maps JavaScript API and the current Places API. Add your restricted development key to a local <code>.env</code> file, then restart the app.</p><pre>VITE_GOOGLE_MAPS_API_KEY=your_key_here</pre><p className="muted">Your key stays out of source control. Full Google Cloud instructions are in the README.</p></div>
        </div>
      )}
      {mapStatus === "error" && <div className="error-banner" role="alert"><span>!</span><div><strong>Google Maps could not load</strong><p>Check that the key is valid, the required APIs are enabled, and localhost is allowed by its website restrictions.</p></div></div>}
      {mapStatus === "loading" && <div className="map-loading"><div className="spinner" /><strong>Loading the map and place search…</strong></div>}

      {mapStatus === "ready" && (
        <div className="explore-workspace">
          <div className="map-column">
            <GoogleMap selectedPlace={selectedPlace} savedPlaces={itinerary} onSelectSaved={handleSelect} />
            <div className="map-legend"><span><i className="legend-selected" /> Selected</span><span><i className="legend-saved" /> Saved to trip</span></div>
          </div>
          <aside className="explore-sidebar">
            <div className="explore-sidebar-scroll">
              <div className="sidebar-section"><span className="sidebar-section-label">Find a place</span><PlaceSearch destination={trip.destination} onSelect={handleSelect} /></div>
              {notice && <div className="inline-notice" role="status">✓ {notice}</div>}
              <div className="sidebar-section"><span className="sidebar-section-label">Selected place</span><PlaceDetails place={selectedPlace} isSaved={!!selectedPlace && itinerary.some((place) => place.placeId === selectedPlace.placeId)} onAdd={handleAdd} /></div>
              <SavedPlacesPanel places={itinerary} onSelect={handleSelect} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

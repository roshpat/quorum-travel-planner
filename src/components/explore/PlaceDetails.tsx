import type { Place } from "../../types";

export function PlaceDetails({ place, isSaved, onAdd }: { place: Place | null; isSaved: boolean; onAdd: () => void }) {
  if (!place) return <div className="place-details-empty"><span>⌖</span><h3>Select a place</h3><p>Search for a restaurant, hotel, landmark, or activity to see details and add it to the trip.</p></div>;
  return (
    <article className="place-details">
      <div className="place-photo" style={place.photoUrl ? { backgroundImage: `linear-gradient(180deg, transparent, rgba(13, 42, 36, .65)), url(${place.photoUrl})` } : undefined}>
        {!place.photoUrl && <span>{place.name.charAt(0)}</span>}
        <small>{place.category || "Place"}</small>
      </div>
      <div className="place-details-copy">
        <div className="place-title-row"><div><h2>{place.name}</h2>{place.rating && <span className="rating">★ {place.rating.toFixed(1)} <small>Google rating</small></span>}</div><span className="selected-check">✓</span></div>
        <p><span>⌖</span>{place.address}</p>
        <div className="coordinate-row"><small>LAT {place.latitude.toFixed(5)}</small><small>LNG {place.longitude.toFixed(5)}</small></div>
        <button type="button" className={`button button--full ${isSaved ? "button--saved" : "button--primary"}`} onClick={onAdd} disabled={isSaved}>{isSaved ? "✓ Added to trip" : "+ Add to trip"}</button>
      </div>
    </article>
  );
}

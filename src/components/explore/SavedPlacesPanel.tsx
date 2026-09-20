import type { ItineraryItem, Place } from "../../types";

export function SavedPlacesPanel({ places, onSelect }: { places: ItineraryItem[]; onSelect: (place: Place) => void }) {
  return (
    <section className="saved-panel">
      <div className="saved-heading"><div><span className="eyebrow">Group shortlist</span><h2>Saved places</h2></div><span>{places.length}</span></div>
      {places.length === 0 ? <p className="saved-empty">Places you add will stay here and appear in the itinerary.</p> : (
        <div className="saved-place-list">{places.map((place, index) => <button type="button" key={place.placeId} onClick={() => onSelect(place)}><span>{index + 1}</span><span><strong>{place.name}</strong><small>{place.address}</small></span><b>→</b></button>)}</div>
      )}
    </section>
  );
}

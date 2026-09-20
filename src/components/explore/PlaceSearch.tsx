import { useState, type FormEvent } from "react";
import type { Place } from "../../types";
import { searchPlaces } from "../../services/googleMaps";

export function PlaceSearch({ destination, onSelect }: { destination: string; onSelect: (place: Place) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const clean = query.trim();
    if (!clean) return setError("Enter a place, category, or landmark to search.");
    setLoading(true);
    setError("");
    try {
      const places = await searchPlaces(clean);
      setResults(places);
      if (!places.length) setError("No places matched that search. Try adding a city or category.");
      if (places[0]) onSelect(places[0]);
    } catch {
      setResults([]);
      setError("Google Places could not complete the search. Check the API setup and try again.");
    } finally {
      setLoading(false);
    }
  }

  function quickSearch(term: string) {
    setQuery(`${term} in ${destination}`);
  }

  return (
    <div className="place-search">
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="place-query">Search Google Places</label>
        <span className="search-symbol">⌕</span>
        <input id="place-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Try “restaurants in ${destination}”`} />
        <button type="submit" disabled={loading}>{loading ? "…" : "Search"}</button>
      </form>
      <div className="search-chips">{["Restaurants", "Museums", "Parks", "Landmarks"].map((term) => <button type="button" key={term} onClick={() => quickSearch(term)}>{term}</button>)}</div>
      {error && <p className="search-error" role="alert">{error}</p>}
      {results.length > 0 && (
        <div className="search-results" role="listbox" aria-label="Place search results">
          {results.map((place) => <button type="button" role="option" aria-selected="false" key={place.placeId} onClick={() => onSelect(place)}><span className="result-pin">⌖</span><span><strong>{place.name}</strong><small>{place.address}</small></span>{place.rating && <b>★ {place.rating.toFixed(1)}</b>}</button>)}
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { useTravel } from "../context/TravelContext";
import { getDayLabel, getTripDayCount } from "../utils/format";

export function ItineraryPage() {
  const { trip, itinerary, assignPlaceToDay, removePlace, movePlace } = useTravel();
  const dayCount = getTripDayCount(trip.startDate, trip.endDate);

  return (
    <div>
      <PageHeader
        eyebrow="Make time count"
        title="Your itinerary"
        description={`Shape ${trip.name} one day at a time. Keep it flexible—this is the group’s working plan.`}
        actions={<Link to="/explore" className="button button--primary">+ Add places</Link>}
      />

      {itinerary.length === 0 ? (
        <section className="panel">
          <EmptyState icon="◎" title="Your itinerary is wide open" description={`Search ${trip.destination} for restaurants, landmarks, museums, and more. Saved places will appear here.`} action={<Link className="button button--primary" to="/explore">Explore the map</Link>} />
        </section>
      ) : (
        <div className="itinerary-board">
          {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => {
            const dayItems = itinerary.filter((item) => item.day === day).sort((a, b) => a.order - b.order);
            return (
              <section className="day-section" key={day}>
                <header className="day-header">
                  <span className="day-number">{String(day).padStart(2, "0")}</span>
                  <div><span>Day {day}</span><h2>{getDayLabel(trip.startDate, day)}</h2></div>
                  <small>{dayItems.length} {dayItems.length === 1 ? "stop" : "stops"}</small>
                </header>
                {dayItems.length === 0 ? (
                  <div className="day-empty"><span>＋</span> Assign a saved place to this day</div>
                ) : (
                  <div className="itinerary-list">
                    {dayItems.map((item, itemIndex) => (
                      <article className="itinerary-card" key={item.placeId}>
                        <div className="timeline-node"><span>{itemIndex + 1}</span></div>
                        <div className="place-thumb" style={item.photoUrl ? { backgroundImage: `url(${item.photoUrl})` } : undefined}>{!item.photoUrl && item.name.charAt(0)}</div>
                        <div className="itinerary-copy"><span className="category-label">{item.category || "Saved place"}</span><h3>{item.name}</h3><p>{item.address}</p><div className="itinerary-links"><Link to={`/explore?place=${encodeURIComponent(item.placeId)}`}>View on map →</Link><label>Day <select value={item.day} onChange={(event) => assignPlaceToDay(item.placeId, Number(event.target.value))}>{Array.from({ length: dayCount }, (_, optionIndex) => <option key={optionIndex + 1} value={optionIndex + 1}>{optionIndex + 1}</option>)}</select></label></div></div>
                        <div className="item-controls"><button type="button" aria-label={`Move ${item.name} earlier`} onClick={() => movePlace(item.placeId, -1)} disabled={itinerary.findIndex((place) => place.placeId === item.placeId) === 0}>↑</button><button type="button" aria-label={`Move ${item.name} later`} onClick={() => movePlace(item.placeId, 1)} disabled={itinerary.findIndex((place) => place.placeId === item.placeId) === itinerary.length - 1}>↓</button><button type="button" className="remove-button" aria-label={`Remove ${item.name}`} onClick={() => removePlace(item.placeId)}>×</button></div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

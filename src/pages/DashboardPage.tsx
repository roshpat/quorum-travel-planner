import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useTravel } from "../context/TravelContext";
import { formatCurrency, formatDateRange } from "../utils/format";

export function DashboardPage() {
  const { trip, travelers, itinerary, expenses } = useTravel();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const steps = [
    { label: "Set preferences", detail: `${trip.preferences.length} selected`, complete: trip.preferences.length > 0, to: "/trip-setup" },
    { label: "Explore destination", detail: itinerary.length ? "Places discovered" : "Find the group favorites", complete: itinerary.length > 0, to: "/explore" },
    { label: "Add places", detail: `${itinerary.length} saved`, complete: itinerary.length > 0, to: "/explore" },
    { label: "Build itinerary", detail: itinerary.length ? "Days ready to shape" : "Start with one place", complete: itinerary.length >= 3, to: "/itinerary" },
    { label: "Review budget", detail: `${formatCurrency(totalExpenses)} recorded`, complete: expenses.length > 0, to: "/expenses" },
  ];
  const completeCount = steps.filter((step) => step.complete).length;

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Your shared plan"
        title={`Good morning, ${travelers.find((traveler) => traveler.name === "Roshan")?.name ?? "traveler"}.`}
        description={`${trip.name} is taking shape. Here’s where the group stands.`}
        actions={<Link className="button button--primary" to="/trip-setup">Edit trip</Link>}
      />

      <section className="hero-trip-card">
        <div className="hero-trip-copy">
          <span className="status-pill">Planning</span>
          <p className="hero-kicker">Next up</p>
          <h2>{trip.destination || "Choose a destination"}</h2>
          <p>{formatDateRange(trip.startDate, trip.endDate)} · {trip.travelerCount} travelers</p>
          <div className="hero-actions">
            <Link className="button button--light" to="/explore">Explore places <span>→</span></Link>
            <Link className="text-link text-link--light" to="/itinerary">View itinerary</Link>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="orbit-dot dot-one">✦</span>
          <span className="orbit-dot dot-two">●</span>
          <span className="orbit-city">CHI</span>
        </div>
      </section>

      <section aria-labelledby="snapshot-title">
        <div className="section-heading">
          <div><span className="eyebrow">At a glance</span><h2 id="snapshot-title">Trip snapshot</h2></div>
        </div>
        <div className="stat-grid">
          <article className="stat-card"><span className="stat-icon mint">⌖</span><span>Destination</span><strong>{trip.destination || "Not set"}</strong><small>From {trip.departureAirport || "anywhere"}</small></article>
          <article className="stat-card"><span className="stat-icon peach">▣</span><span>Dates</span><strong>{formatDateRange(trip.startDate, trip.endDate)}</strong><small>Weekend escape</small></article>
          <article className="stat-card"><span className="stat-icon lavender">◉</span><span>Travelers</span><strong>{trip.travelerCount}</strong><small>Planning together</small></article>
          <article className="stat-card"><span className="stat-icon sky">$</span><span>Per traveler</span><strong>{formatCurrency(trip.budgetPerTraveler)}</strong><small>{formatCurrency(trip.budgetPerTraveler * trip.travelerCount)} group budget</small></article>
          <article className="stat-card"><span className="stat-icon yellow">☆</span><span>Saved places</span><strong>{itinerary.length}</strong><small>{itinerary.length ? "Ready to schedule" : "Start exploring"}</small></article>
          <article className="stat-card"><span className="stat-icon rose">↗</span><span>Recorded expenses</span><strong>{formatCurrency(totalExpenses)}</strong><small>{formatCurrency(Math.max(0, trip.budgetPerTraveler * trip.travelerCount - totalExpenses))} remaining</small></article>
        </div>
      </section>

      <div className="dashboard-lower-grid">
        <section className="panel progress-panel" aria-labelledby="progress-title">
          <div className="panel-header">
            <div><span className="eyebrow">Shared momentum</span><h2 id="progress-title">Trip progress</h2></div>
            <strong>{completeCount}/{steps.length}</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${(completeCount / steps.length) * 100}%` }} /></div>
          <div className="progress-list">
            {steps.map((step, index) => (
              <Link to={step.to} className="progress-item" key={step.label}>
                <span className={`step-number ${step.complete ? "step-number--complete" : ""}`}>{step.complete ? "✓" : index + 1}</span>
                <span><strong>{step.label}</strong><small>{step.detail}</small></span>
                <span className="progress-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel quick-panel" aria-labelledby="quick-title">
          <span className="eyebrow">Keep moving</span><h2 id="quick-title">Quick actions</h2>
          <div className="quick-list">
            <Link to="/explore" className="quick-action"><span className="quick-icon mint">◎</span><span><strong>Explore places</strong><small>Search the map together</small></span><b>→</b></Link>
            <Link to="/itinerary" className="quick-action"><span className="quick-icon peach">☷</span><span><strong>View itinerary</strong><small>Shape each day</small></span><b>→</b></Link>
            <Link to="/ai-planner" className="quick-action"><span className="quick-icon lavender">✺</span><span><strong>Ask AI planner</strong><small>Get context-aware ideas</small></span><b>→</b></Link>
          </div>
        </section>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import { useTravel } from "../context/TravelContext";
import { PREFERENCE_OPTIONS, type Trip } from "../types";

type Errors = Partial<Record<keyof Trip, string>>;

export function TripSetupPage() {
  const { trip, updateTrip } = useTravel();
  const [draft, setDraft] = useState<Trip>(trip);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Trip>(key: K, value: Trip[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (draft.name.trim().length < 2) next.name = "Enter a trip name.";
    if (draft.destination.trim().length < 2) next.destination = "Enter a destination.";
    if (!draft.startDate) next.startDate = "Choose a start date.";
    if (!draft.endDate) next.endDate = "Choose an end date.";
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) next.endDate = "End date must be after the start date.";
    if (draft.travelerCount < 1 || draft.travelerCount > 30) next.travelerCount = "Use 1–30 travelers.";
    if (draft.budgetPerTraveler <= 0 || draft.budgetPerTraveler > 100000) next.budgetPerTraveler = "Enter a realistic budget above $0.";
    if (draft.departureAirport.trim().length < 2) next.departureAirport = "Enter a departure city or airport.";
    if (draft.preferences.length === 0) next.preferences = "Choose at least one preference.";
    return next;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    updateTrip({ ...draft, name: draft.name.trim(), destination: draft.destination.trim(), departureAirport: draft.departureAirport.trim() });
    setSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <PageHeader eyebrow="Start with what matters" title="Set up your trip" description="Give the group a shared starting point. You can change these details at any time." />
      {saved && <div className="success-banner" role="status"><span>✓</span><div><strong>Trip saved</strong><p>Your dashboard and planning tools now use these details.</p></div></div>}

      <form className="setup-layout" onSubmit={handleSubmit} noValidate>
        <div className="form-stack">
          <section className="panel form-section">
            <div className="form-section-heading"><span className="section-number">01</span><div><h2>Trip basics</h2><p>Name the plan and choose where the group is headed.</p></div></div>
            <div className="field-grid">
              <label className="field field--wide"><span>Trip name</span><input value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="Chicago Weekend" aria-invalid={!!errors.name} />{errors.name && <small className="field-error">{errors.name}</small>}</label>
              <label className="field field--wide"><span>Destination</span><input value={draft.destination} onChange={(event) => update("destination", event.target.value)} placeholder="City, state, or country" aria-invalid={!!errors.destination} />{errors.destination && <small className="field-error">{errors.destination}</small>}</label>
              <label className="field"><span>Start date</span><input type="date" value={draft.startDate} onChange={(event) => update("startDate", event.target.value)} aria-invalid={!!errors.startDate} />{errors.startDate && <small className="field-error">{errors.startDate}</small>}</label>
              <label className="field"><span>End date</span><input type="date" value={draft.endDate} min={draft.startDate} onChange={(event) => update("endDate", event.target.value)} aria-invalid={!!errors.endDate} />{errors.endDate && <small className="field-error">{errors.endDate}</small>}</label>
            </div>
          </section>

          <section className="panel form-section">
            <div className="form-section-heading"><span className="section-number">02</span><div><h2>Group & budget</h2><p>Set the practical guardrails for recommendations.</p></div></div>
            <div className="field-grid">
              <label className="field"><span>Number of travelers</span><input type="number" min="1" max="30" value={draft.travelerCount} onChange={(event) => update("travelerCount", Number(event.target.value))} aria-invalid={!!errors.travelerCount} />{errors.travelerCount && <small className="field-error">{errors.travelerCount}</small>}</label>
              <label className="field"><span>Budget per traveler</span><div className="input-prefix"><b>$</b><input type="number" min="1" step="25" value={draft.budgetPerTraveler} onChange={(event) => update("budgetPerTraveler", Number(event.target.value))} aria-invalid={!!errors.budgetPerTraveler} /></div>{errors.budgetPerTraveler && <small className="field-error">{errors.budgetPerTraveler}</small>}</label>
              <label className="field field--wide"><span>Departure airport or city</span><input value={draft.departureAirport} onChange={(event) => update("departureAirport", event.target.value)} placeholder="Indianapolis (IND)" aria-invalid={!!errors.departureAirport} />{errors.departureAirport && <small className="field-error">{errors.departureAirport}</small>}</label>
            </div>
          </section>

          <section className="panel form-section">
            <div className="form-section-heading"><span className="section-number">03</span><div><h2>What sounds good?</h2><p>Pick all that fit. Quorum uses these to ground suggestions.</p></div></div>
            <div className="preference-grid">
              {PREFERENCE_OPTIONS.map((preference) => {
                const selected = draft.preferences.includes(preference);
                return <button key={preference} type="button" className={`preference-chip ${selected ? "preference-chip--selected" : ""}`} onClick={() => update("preferences", selected ? draft.preferences.filter((item) => item !== preference) : [...draft.preferences, preference])}><span>{selected ? "✓" : "+"}</span>{preference}</button>;
              })}
            </div>
            {errors.preferences && <small className="field-error block-error">{errors.preferences}</small>}
          </section>
          <div className="form-actions"><button className="button button--primary button--large" type="submit">Save trip details</button><span>Saved locally in this browser</span></div>
        </div>

        <aside className="setup-summary panel">
          <span className="eyebrow">Live preview</span>
          <div className="summary-art"><span>✦</span><strong>{draft.destination.slice(0, 3).toUpperCase() || "GO"}</strong></div>
          <h3>{draft.name || "Your next trip"}</h3>
          <p>{draft.destination || "Destination to be decided"}</p>
          <dl>
            <div><dt>Travelers</dt><dd>{draft.travelerCount}</dd></div>
            <div><dt>Group budget</dt><dd>${(draft.travelerCount * draft.budgetPerTraveler).toLocaleString()}</dd></div>
            <div><dt>Interests</dt><dd>{draft.preferences.length}</dd></div>
          </dl>
        </aside>
      </form>
    </div>
  );
}

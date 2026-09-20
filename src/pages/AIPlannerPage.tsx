import { useState, type FormEvent } from "react";
import { PageHeader } from "../components/PageHeader";
import { useTravel } from "../context/TravelContext";
import { askPrototypePlanner } from "../services/aiPlanner";
import { formatCurrency, formatDateRange } from "../utils/format";

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const suggestions = [
  "Recommend some cheap activities.",
  "What should we do Saturday afternoon?",
  "Suggest restaurants near our itinerary.",
  "Do we still have room in our budget?",
];

export function AIPlannerPage() {
  const { trip, itinerary, expenses } = useTravel();
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", text: `I’m ready to help shape ${trip.name}. I can use your dates, budget, preferences, and saved places to make prototype recommendations.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: clean };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const answer = await askPrototypePlanner(clean, { trip, itinerary, expenses });
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: answer }]);
    } catch {
      setError("The prototype planner could not respond. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  return (
    <div className="ai-page">
      <PageHeader eyebrow="Ideas grounded in your group" title="AI trip planner" description="Ask natural-language questions about the plan. Responses use your current Quorum trip context." />
      <div className="prototype-notice"><span>✺</span><div><strong>Prototype intelligence</strong><p>This demo uses a safe, local rules-based planner—no prompt or secret key leaves your browser. The service module can later be replaced by a secure server endpoint.</p></div></div>

      <div className="ai-layout">
        <section className="chat-panel panel">
          <div className="chat-heading"><div className="planner-avatar">Q</div><div><strong>Quorum planner</strong><span><i /> Ready with trip context</span></div></div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message) => (
              <div className={`message message--${message.role}`} key={message.id}>{message.role === "assistant" && <span className="message-avatar">Q</span>}<div><small>{message.role === "assistant" ? "Quorum planner" : "You"}</small><p>{message.text}</p></div></div>
            ))}
            {loading && <div className="message message--assistant"><span className="message-avatar">Q</span><div><small>Quorum planner</small><p className="typing"><i /><i /><i /></p></div></div>}
          </div>
          <div className="prompt-suggestions">
            {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}
          </div>
          {error && <p className="form-error chat-error" role="alert">{error}</p>}
          <form className="chat-input" onSubmit={handleSubmit}><label className="sr-only" htmlFor="planner-prompt">Ask the planner</label><textarea id="planner-prompt" rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(input); } }} placeholder="Ask about activities, food, timing, or budget…" /><button type="submit" disabled={!input.trim() || loading} aria-label="Send message">↑</button></form>
        </section>

        <aside className="context-panel panel">
          <div className="context-heading"><span className="eyebrow">Planner memory</span><h2>Trip context</h2><p>This is the information used to shape every answer.</p></div>
          <div className="context-destination"><span>⌖</span><div><small>Destination</small><strong>{trip.destination}</strong></div></div>
          <dl className="context-list">
            <div><dt>Dates</dt><dd>{formatDateRange(trip.startDate, trip.endDate)}</dd></div>
            <div><dt>Travelers</dt><dd>{trip.travelerCount} people</dd></div>
            <div><dt>Budget</dt><dd>{formatCurrency(trip.budgetPerTraveler)} each</dd></div>
            <div><dt>Recorded</dt><dd>{formatCurrency(spent)} total</dd></div>
          </dl>
          <div className="context-block"><span>Preferences</span><div className="mini-tags">{trip.preferences.map((preference) => <small key={preference}>{preference}</small>)}</div></div>
          <div className="context-block"><span>Saved itinerary</span>{itinerary.length ? <ol className="context-places">{itinerary.slice(0, 5).map((place) => <li key={place.placeId}>{place.name}</li>)}</ol> : <p className="context-empty">No places saved yet. Explore the map to make answers more specific.</p>}</div>
        </aside>
      </div>
    </div>
  );
}

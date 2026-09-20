import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTravel } from "../context/TravelContext";
import { formatDateRange } from "../utils/format";

const navigation = [
  { to: "/", label: "Dashboard", icon: "⌂", end: true },
  { to: "/trip-setup", label: "Trip setup", icon: "✦" },
  { to: "/explore", label: "Explore", icon: "◎" },
  { to: "/itinerary", label: "Itinerary", icon: "☷" },
  { to: "/ai-planner", label: "AI planner", icon: "✺" },
  { to: "/expenses", label: "Expenses", icon: "$" },
];

export function AppShell() {
  const { trip, travelers, storageWarning } = useTravel();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="brand-row">
          <NavLink className="brand" to="/" onClick={() => setMenuOpen(false)} aria-label="Quorum home">
            <span className="brand-mark">Q</span>
            <span>quorum</span>
          </NavLink>
          <button className="icon-button sidebar-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation">×</button>
        </div>

        <div className="trip-mini-card">
          <span className="eyebrow">Current trip</span>
          <strong>{trip.name}</strong>
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          <div className="mini-people" aria-label={`${trip.travelerCount} travelers`}>
            {Array.from({ length: Math.min(trip.travelerCount, 4) }, (_, index) => (
              <span key={travelers[index]?.id ?? index}>{travelers[index]?.name.charAt(0).toUpperCase() ?? index + 1}</span>
            ))}
            <small>{trip.travelerCount} going</small>
          </div>
        </div>

        <nav className="primary-nav" aria-label="Main navigation">
          <span className="nav-label">Plan your trip</span>
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="prototype-badge"><span /> Prototype mode</div>
          <p>Local data only · no bookings made</p>
        </div>
      </aside>

      {menuOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <div className="main-column">
        <header className="mobile-header">
          <button className="icon-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">☰</button>
          <NavLink className="brand" to="/"><span className="brand-mark">Q</span><span>quorum</span></NavLink>
          <span className="mobile-avatar">R</span>
        </header>
        {storageWarning && <div className="storage-warning" role="status">{storageWarning}</div>}
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}

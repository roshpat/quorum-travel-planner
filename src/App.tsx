import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AIPlannerPage } from "./pages/AIPlannerPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { ExplorePage } from "./pages/ExplorePage";
import { ItineraryPage } from "./pages/ItineraryPage";
import { TripSetupPage } from "./pages/TripSetupPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="trip-setup" element={<TripSetupPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="itinerary" element={<ItineraryPage />} />
        <Route path="ai-planner" element={<AIPlannerPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

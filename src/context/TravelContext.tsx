import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultState } from "../data/defaults";
import type { Expense, ItineraryItem, Place, TravelState, Trip } from "../types";

const STORAGE_KEY = "quorum-travel-state-v1";

interface TravelContextValue extends TravelState {
  storageWarning: string;
  updateTrip: (trip: Trip) => void;
  addPlace: (place: Place) => boolean;
  removePlace: (placeId: string) => void;
  assignPlaceToDay: (placeId: string, day: number) => void;
  movePlace: (placeId: string, direction: -1 | 1) => void;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
  removeExpense: (id: string) => void;
  resetPrototype: () => void;
}

const TravelContext = createContext<TravelContextValue | null>(null);

function loadState(): { state: TravelState; warning: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { state: defaultState, warning: "" };
    const parsed = JSON.parse(saved) as Partial<TravelState>;
    if (!parsed.trip || !Array.isArray(parsed.itinerary) || !Array.isArray(parsed.expenses)) {
      throw new Error("Saved data is incomplete");
    }
    return {
      state: {
        trip: { ...defaultState.trip, ...parsed.trip },
        travelers: Array.isArray(parsed.travelers) ? parsed.travelers : defaultState.travelers,
        itinerary: parsed.itinerary,
        expenses: parsed.expenses,
      },
      warning: "",
    };
  } catch {
    return {
      state: defaultState,
      warning: "Saved trip data could not be read, so the sample trip was restored.",
    };
  }
}

export function TravelProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadState);
  const [state, setState] = useState<TravelState>(initial.state);
  const [storageWarning, setStorageWarning] = useState(initial.warning);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      window.setTimeout(() => {
        setStorageWarning("Changes work for this session, but this browser could not save them locally.");
      }, 0);
    }
  }, [state]);

  const value = useMemo<TravelContextValue>(() => ({
    ...state,
    storageWarning,
    updateTrip: (trip) => setState((current) => ({ ...current, trip })),
    addPlace: (place) => {
      if (state.itinerary.some((item) => item.placeId === place.placeId)) return false;
      const item: ItineraryItem = {
        ...place,
        day: 1,
        order: state.itinerary.length,
        addedAt: new Date().toISOString(),
      };
      setState((current) => ({ ...current, itinerary: [...current.itinerary, item] }));
      return true;
    },
    removePlace: (placeId) => setState((current) => ({
      ...current,
      itinerary: current.itinerary.filter((item) => item.placeId !== placeId),
    })),
    assignPlaceToDay: (placeId, day) => setState((current) => ({
      ...current,
      itinerary: current.itinerary.map((item) => item.placeId === placeId ? { ...item, day } : item),
    })),
    movePlace: (placeId, direction) => setState((current) => {
      const index = current.itinerary.findIndex((item) => item.placeId === placeId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.itinerary.length) return current;
      const itinerary = [...current.itinerary];
      [itinerary[index], itinerary[targetIndex]] = [itinerary[targetIndex], itinerary[index]];
      return { ...current, itinerary: itinerary.map((item, order) => ({ ...item, order })) };
    }),
    addExpense: (expense) => setState((current) => ({
      ...current,
      expenses: [...current.expenses, {
        ...expense,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }],
    })),
    removeExpense: (id) => setState((current) => ({
      ...current,
      expenses: current.expenses.filter((expense) => expense.id !== id),
    })),
    resetPrototype: () => {
      setState(defaultState);
      setStorageWarning("");
    },
  }), [state, storageWarning]);

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}

// This hook intentionally lives beside its provider so the public context API is easy to discover.
// eslint-disable-next-line react-refresh/only-export-components
export function useTravel(): TravelContextValue {
  const context = useContext(TravelContext);
  if (!context) throw new Error("useTravel must be used inside TravelProvider");
  return context;
}

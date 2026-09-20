export const PREFERENCE_OPTIONS = [
  "Food",
  "Museums",
  "Outdoors",
  "Nightlife",
  "Shopping",
  "Sightseeing",
  "Sports",
  "Relaxation",
] as const;

export type Preference = (typeof PREFERENCE_OPTIONS)[number];

export interface Traveler {
  id: string;
  name: string;
}

export interface Trip {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  budgetPerTraveler: number;
  departureAirport: string;
  preferences: Preference[];
}

export interface Place {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  category?: string;
  photoUrl?: string;
}

export interface ItineraryItem extends Place {
  day: number;
  order: number;
  addedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  category?: string;
  createdAt: string;
}

export interface TravelState {
  trip: Trip;
  travelers: Traveler[];
  itinerary: ItineraryItem[];
  expenses: Expense[];
}

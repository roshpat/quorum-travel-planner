import type { TravelState } from "../types";

export const defaultState: TravelState = {
  trip: {
    name: "Chicago Weekend",
    destination: "Chicago, Illinois",
    startDate: "2026-10-09",
    endDate: "2026-10-11",
    travelerCount: 4,
    budgetPerTraveler: 800,
    departureAirport: "Indianapolis (IND)",
    preferences: ["Food", "Sightseeing", "Museums", "Nightlife"],
  },
  travelers: [
    { id: "traveler-dylan", name: "Dylan" },
    { id: "traveler-aakarsh", name: "Aakarsh" },
    { id: "traveler-zach", name: "Zach" },
    { id: "traveler-roshan", name: "Roshan" },
  ],
  itinerary: [],
  expenses: [
    {
      id: "expense-hotel",
      description: "Hotel",
      amount: 400,
      paidBy: "Dylan",
      category: "Lodging",
      createdAt: "2026-08-18T16:30:00.000Z",
    },
    {
      id: "expense-dinner",
      description: "Dinner",
      amount: 120,
      paidBy: "Aakarsh",
      category: "Food",
      createdAt: "2026-08-18T17:00:00.000Z",
    },
    {
      id: "expense-museum",
      description: "Museum tickets",
      amount: 80,
      paidBy: "Zach",
      category: "Activities",
      createdAt: "2026-08-18T17:30:00.000Z",
    },
  ],
};

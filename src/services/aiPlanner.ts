import type { Expense, ItineraryItem, Trip } from "../types";
import { formatCurrency } from "../utils/format";

export interface PlannerContext {
  trip: Trip;
  itinerary: ItineraryItem[];
  expenses: Expense[];
}

export async function askPrototypePlanner(prompt: string, context: PlannerContext): Promise<string> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));
  const question = prompt.toLowerCase();
  const { trip, itinerary, expenses } = context;
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = trip.budgetPerTraveler * trip.travelerCount - spent;
  const savedNames = itinerary.slice(0, 3).map((place) => place.name).join(", ");

  if (question.includes("budget") || question.includes("afford") || question.includes("cheap")) {
    return `Your group has about ${formatCurrency(Math.max(0, remaining))} left, or ${formatCurrency(Math.max(0, remaining) / Math.max(1, trip.travelerCount))} per traveler. I’d look for free neighborhood walks, public parks, and a low-cost food stop in ${trip.destination}. ${itinerary.length ? `That leaves room around your saved stops: ${savedNames}.` : "Save a few places on Explore and I can make this more specific."}`;
  }
  if (question.includes("restaurant") || question.includes("food") || question.includes("dinner")) {
    return `Since your group marked Food as ${trip.preferences.includes("Food") ? "a priority" : "an option"}, I’d search for one casual local favorite near ${itinerary[0]?.name || `the center of ${trip.destination}`} and keep a second reservation-free backup. Use Explore to search “restaurants near ${itinerary[0]?.name || trip.destination},” then add the group’s pick.`;
  }
  if (question.includes("saturday") || question.includes("afternoon") || question.includes("day")) {
    return `A balanced afternoon in ${trip.destination} could pair one anchor activity with something flexible: start with ${itinerary[0]?.name || "a major museum or landmark"}, leave 60–90 minutes for walking or coffee nearby, then choose dinner based on the group’s energy. Keep transit time visible before adding a third stop.`;
  }
  if (question.includes("itinerary") || question.includes("plan")) {
    return itinerary.length
      ? `You have ${itinerary.length} saved ${itinerary.length === 1 ? "place" : "places"}. I’d group nearby stops on the same day, put the most time-sensitive activity first, and leave one open block. Start with ${savedNames}, then use the day selectors in Itinerary.`
      : `Start by saving 3–5 places in Explore. For a ${trip.travelerCount}-person trip to ${trip.destination}, I’d aim for one anchor activity, one meal, and one flexible stop per day.`;
  }
  return `For ${trip.name}, I’m grounding this prototype suggestion in ${trip.travelerCount} travelers, a ${formatCurrency(trip.budgetPerTraveler)} per-person budget, and your interests in ${trip.preferences.join(", ") || "a mix of activities"}. A good next move is to save a few candidates in Explore, then ask me to compare them by budget or fit them into a specific day.`;
}

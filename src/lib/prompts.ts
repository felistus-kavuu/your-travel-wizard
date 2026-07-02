import type { TabKind, Trip } from "./trip-types";

function fmtDate(iso: string) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function buildPrompt(kind: TabKind, trip: Trip): { system: string; user: string } {
  const interests = trip.interests.join(", ");
  const start = fmtDate(trip.startDate);
  const end = fmtDate(trip.endDate);
  const ctx = `Destination: ${trip.destination}\nDates: ${start} to ${end}\nBudget: ${trip.budget} ${trip.currency}\nInterests: ${interests}`;

  const sharedAssumptions =
    "Never ask the user any clarifying questions. Use only the information provided and make sensible assumptions if anything is unclear: budget is total for one person for the entire trip, accommodation is mid-range, no dietary or mobility restrictions, traveler is an adult comfortable with typical tourist activities. Generate the complete response immediately.";

  switch (kind) {
    case "itinerary":
      return {
        system:
          `You are a travel planning assistant. ${sharedAssumptions} Trip details: Destination: ${trip.destination}, Dates: ${start} to ${end}, Total Budget: ${trip.budget} ${trip.currency}, Interests: ${interests}. For each day include morning, afternoon and evening activities, one suggested meal spot type, and estimated daily cost. Format as a clean day-by-day list with bold day headings.`,
        user: ctx,
      };
    case "packing":
      return {
        system:
          `You are a packing assistant. ${sharedAssumptions} Trip details: Destination: ${trip.destination}, Dates: ${start} to ${end}, Interests: ${interests}. Generate a packing list considering likely weather for the destination and time of year. Organize into these categories: Clothing, Toiletries, Documents, Electronics, Activity-Specific Gear. Keep it practical with no generic filler. Format as Markdown with bold category headings and bullet lists.`,
        user: ctx,
      };
    case "budget":
      return {
        system:
          `You are a travel budgeting assistant. ${sharedAssumptions} Trip details: Destination: ${trip.destination}, Dates: ${start} to ${end}, Total Budget: ${trip.budget} ${trip.currency}, Interests: ${interests}. Break the total budget down into: Lodging, Food, Activities, Transport, Miscellaneous/Buffer. For each category give a percentage, an estimated amount in ${trip.currency}, and one specific tip. End with 3 money-saving tips specific to the destination. Format as Markdown with bold category headings, percentages/amounts on their own line, and a final "## Money-Saving Tips" section with a numbered list.`,
        user: ctx,
      };
    case "culture":
      return {
        system:
          `You are a local culture guide. ${sharedAssumptions} Trip details: Destination: ${trip.destination}. Provide: 5 essential local phrases with English meaning and simple pronunciation, 3 cultural etiquette tips (one do, one don't, one surprising custom), and 1 common tourist mistake to avoid. Keep it concise, friendly and practical. Format as Markdown with sections: **## Essential Phrases** (bullets — phrase — meaning — pronunciation), **## Etiquette** (Do / Don't / Surprising), and **## Tourist Mistake to Avoid**.`,
        user: ctx,
      };
    case "route": {
      const list = trip.destination
        .split(/[,;/]|\band\b/i)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", ");
      return {
        system:
          `You are a travel route optimization expert. ${sharedAssumptions} The traveler wants to visit these destinations: ${list}. Their total trip runs from ${start} to ${end} with a budget of ${trip.budget} ${trip.currency}. Suggest the optimal order to visit these destinations to minimize travel time and cost. For each leg of the journey, include: the recommended transport mode (flight, train, bus, or ferry), estimated travel time, estimated cost in ${trip.currency}, and one money-saving tip. End with a total estimated transport budget and the percentage of the overall budget it represents. Format as Markdown with a bold heading for each leg (e.g. **Leg 1: A → B**) and a final "## Total Transport Budget" section.`,
        user: ctx,
      };
    }
  }
}

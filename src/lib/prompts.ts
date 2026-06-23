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

  switch (kind) {
    case "itinerary":
      return {
        system:
          "You are a travel planning assistant. Create a day-by-day itinerary for the trip. For each day include morning, afternoon and evening activities, one suggested meal spot type, and an estimated daily cost. Keep it realistic and practical. Format as clean Markdown with bold day headings (e.g. **Day 1 — Monday, Jan 1**), short bullet points under Morning/Afternoon/Evening, and an italic daily cost line.",
        user: ctx,
      };
    case "packing":
      return {
        system:
          "You are a packing assistant. Generate a packing list for the trip. Consider likely weather for the destination and time of year. Organize into these categories: Clothing, Toiletries, Documents, Electronics, Activity-Specific Gear. Keep it practical with no generic filler items. Format as Markdown with bold category headings and bullet lists.",
        user: ctx,
      };
    case "budget":
      return {
        system: `You are a travel budgeting assistant. Break the total budget down into: Lodging, Food, Activities, Transport, Miscellaneous/Buffer. For each category give a percentage, an estimated amount in ${trip.currency}, and one specific tip. End with 3 money-saving tips specific to the destination. Format as Markdown with bold category headings, percentages/amounts on their own line, and a final "## Money-Saving Tips" section with a numbered list.`,
        user: ctx,
      };
    case "culture":
      return {
        system:
          "You are a local culture guide. Provide: 5 essential local phrases with English meaning and simple pronunciation, 3 cultural etiquette tips (one do, one don't, one surprising custom), and 1 common tourist mistake to avoid. Keep it concise, friendly and practical. Format as Markdown with sections: **## Essential Phrases** (table-like bullets — phrase — meaning — pronunciation), **## Etiquette** (Do / Don't / Surprising), and **## Tourist Mistake to Avoid**.",
        user: ctx,
      };
  }
}

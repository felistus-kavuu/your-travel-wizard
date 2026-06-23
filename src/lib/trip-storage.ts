import type { Trip } from "./trip-types";
import { tripSchema } from "./trip-types";

const KEY = "tripgenie:trip";

export function saveTrip(trip: Trip) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(trip));
}

export function loadTrip(): Trip | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = tripSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearTrip() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

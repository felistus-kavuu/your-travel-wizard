import { format } from "date-fns";
import { CalendarRange, MapPin, Wallet } from "lucide-react";
import type { Trip } from "@/lib/trip-types";

export function TripSummaryBar({ trip }: { trip: Trip }) {
  const start = new Date(trip.startDate + "T00:00:00");
  const end = new Date(trip.endDate + "T00:00:00");
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-accent" />
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Destination</div>
            <div className="font-semibold">{trip.destination}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-accent" />
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Dates</div>
            <div className="font-semibold">
              {format(start, "MMM d")} – {format(end, "MMM d, yyyy")}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-accent" />
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Budget</div>
            <div className="font-semibold">
              {trip.budget.toLocaleString()} {trip.currency}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {trip.interests.map((i) => (
          <span
            key={i}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

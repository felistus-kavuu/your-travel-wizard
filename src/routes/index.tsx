import { createFileRoute } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { TripForm } from "@/components/trip/TripForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripGenie — Your AI trip companion" },
      {
        name: "description",
        content:
          "Plan smarter trips with AI: itineraries, packing lists, budget breakdowns and local culture tips in seconds.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <header className="text-center mb-8 sm:mb-10">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-accent shadow-[var(--shadow-card)]">
            <Plane className="h-7 w-7 -rotate-12" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-navy">TripGenie</h1>
          <p className="mt-2 text-muted-foreground text-base sm:text-lg">
            Your AI trip companion.
          </p>
        </header>
        <TripForm />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by Lovable AI · No account needed
        </p>
      </div>
    </div>
  );
}

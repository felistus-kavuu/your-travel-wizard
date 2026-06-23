import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Backpack, CalendarDays, Globe, Plane, RotateCcw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripSummaryBar } from "@/components/trip/TripSummaryBar";
import { TabContent } from "@/components/trip/TabContent";
import { clearTrip, loadTrip } from "@/lib/trip-storage";
import type { Trip } from "@/lib/trip-types";

export const Route = createFileRoute("/trip")({
  head: () => ({
    meta: [{ title: "Your trip plan — TripGenie" }],
  }),
  component: TripPage,
});

function TripPage() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = loadTrip();
    if (!t) {
      navigate({ to: "/" });
      return;
    }
    setTrip(t);
    setReady(true);
  }, [navigate]);

  if (!ready || !trip) {
    return <div className="min-h-screen" />;
  }

  const onReset = () => {
    clearTrip();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 text-navy"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-accent">
              <Plane className="h-5 w-5 -rotate-12" />
            </div>
            <div className="text-left">
              <div className="font-display text-xl font-bold leading-none">TripGenie</div>
              <div className="text-xs text-muted-foreground">Your AI trip companion</div>
            </div>
          </button>
        </header>

        <TripSummaryBar trip={trip} />

        <div className="mt-6">
          <Tabs defaultValue="itinerary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto bg-secondary p-1 rounded-2xl">
              <TabsTrigger
                value="itinerary"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Itinerary</span>
              </TabsTrigger>
              <TabsTrigger
                value="packing"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Backpack className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Packing</span>
              </TabsTrigger>
              <TabsTrigger
                value="budget"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Wallet className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Budget</span>
              </TabsTrigger>
              <TabsTrigger
                value="culture"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">Culture</span>
              </TabsTrigger>
            </TabsList>

            {(["itinerary", "packing", "budget", "culture"] as const).map((k) => (
              <TabsContent
                key={k}
                value={k}
                className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-[var(--shadow-card)] animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
              >
                <TabContent kind={k} trip={trip} />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onReset}
            className="border-navy/20 text-navy hover:bg-navy hover:text-navy-foreground"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Plan Another Trip
          </Button>
        </div>
      </div>
    </div>
  );
}

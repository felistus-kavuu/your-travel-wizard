import { useEffect, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Backpack, CalendarDays, Check, Globe, Loader2, Mail, Plane, RotateCcw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripSummaryBar } from "@/components/trip/TripSummaryBar";
import { TabContent } from "@/components/trip/TabContent";
import { toast } from "sonner";
import { clearTrip, loadTrip } from "@/lib/trip-storage";
import type { TabKind, Trip } from "@/lib/trip-types";

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/27514763/42r20qz/";

async function fetchTab(kind: TabKind, trip: Trip): Promise<string> {
  const res = await fetch("/api/trip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, trip }),
  });
  if (!res.ok) throw new Error("Failed");
  const data = (await res.json()) as { text: string };
  return data.text;
}

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

  return <TripPageInner trip={trip} onReset={onReset} />;
}

function TripPageInner({ trip, onReset }: { trip: Trip; onReset: () => void }) {
  const tripKey = `${trip.destination}|${trip.startDate}|${trip.endDate}|${trip.budget}|${trip.currency}|${trip.interests.join(",")}`;
  const commaSegments = trip.destination.split(",").map((s) => s.trim()).filter(Boolean);
  const altSegments = trip.destination.split(/;|\/|\band\b|->|→/i).map((s) => s.trim()).filter(Boolean);
  const isMultiDestination = commaSegments.length >= 3 || altSegments.length >= 2;
  const kinds: TabKind[] = isMultiDestination
    ? ["itinerary", "packing", "budget", "culture", "route"]
    : ["itinerary", "packing", "budget", "culture"];
  const results = useQueries({
    queries: kinds.map((k) => ({
      queryKey: ["trip", k, tripKey],
      queryFn: () => fetchTab(k, trip),
      staleTime: Infinity,
      retry: 0,
    })),
  });
  const allDone = results.every((r) => r.isSuccess);
  const sentRef = useRef<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sections = () => {
    const [itinerary, packing_list, budget_breakdown, culture_phrases] = results.map(
      (r) => r.data ?? "",
    );
    return { itinerary, packing_list, budget_breakdown, culture_phrases };
  };

  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSendEmail = async () => {
    const userEmail = trip.email?.trim();
    if (!userEmail) {
      setEmailError("Please enter your email address");
      toast.error("Please enter your email address");
      return;
    }
    setEmailError(null);
    if (!allDone) {
      toast.error("Please wait for all sections to finish generating.");
      return;
    }
    setSending(true);
    try {
      const payload = {
        email: userEmail,
        destination: trip.destination,
        ...sections(),
      };
      console.log("[send-trip-email] using email:", userEmail);
      console.log("[send-trip-email] payload:", payload);
      const res = await fetch("/api/send-trip-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Send failed");
      setSent(true);
      toast.success(`Sent to ${userEmail}`);
    } catch {
      toast.error("Couldn't send the email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!allDone) return;
    if (!trip.email) return;
    const sendKey = `${trip.email}|${tripKey}`;
    if (sentRef.current === sendKey) return;
    sentRef.current = sendKey;
    const { itinerary, packing_list, budget_breakdown, culture_phrases } = sections();
    fetch(ZAPIER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      body: JSON.stringify({
        email: trip.email,
        destination: trip.destination,
        start_date: trip.startDate,
        end_date: trip.endDate,
        budget: String(trip.budget),
        currency: trip.currency,
        itinerary,
        packing_list,
        budget_breakdown,
        culture_phrases,
      }),
    }).catch(() => {
      sentRef.current = null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, trip, tripKey]);

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
            <TabsList
              className={`grid w-full ${isMultiDestination ? "grid-cols-5" : "grid-cols-4"} h-auto bg-secondary p-1 rounded-2xl`}
            >
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
              {isMultiDestination && (
                <TabsTrigger
                  value="route"
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <span className="text-base leading-none" aria-hidden>🗺️</span>
                  <span className="text-xs sm:text-sm font-medium">Best Route</span>
                </TabsTrigger>
              )}
            </TabsList>

            {kinds.map((k) => (
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

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={handleSendEmail}
            disabled={!allDone || sending || !trip.email}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : sent ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {sent ? "Email sent" : trip.email ? "Send to my email" : "Add email to send"}
          </Button>
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

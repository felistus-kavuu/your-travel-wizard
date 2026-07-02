import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { CalendarIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CURRENCIES, type Currency, type Interest, tripSchema } from "@/lib/trip-types";
import { saveTrip } from "@/lib/trip-storage";
import { InterestPills } from "./InterestPills";

export function TripForm() {
  const navigate = useNavigate();
  const [homeCountry, setHomeCountry] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [budget, setBudget] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toISO = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : "");
  const minEndDate = startDate ? addDays(startDate, 1) : undefined;
  const dateRangeError =
    startDate && endDate && endDate <= startDate
      ? "End date must be after your start date."
      : undefined;
  const datesValid = Boolean(startDate && endDate && !dateRangeError);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = tripSchema.safeParse({
      homeCountry: homeCountry.trim() || undefined,
      destination,
      startDate: toISO(startDate),
      endDate: toISO(endDate),
      budget: Number(budget),
      currency,
      interests,
      email: email.trim() || undefined,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0] ?? "");
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    saveTrip(parsed.data);
    navigate({ to: "/trip" });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="homeCountry">Where are you traveling from?</Label>
          <Input
            id="homeCountry"
            value={homeCountry}
            onChange={(e) => setHomeCountry(e.target.value)}
            placeholder="e.g. Nairobi, Kenya"
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            Required for multi-destination trips so we can plan the best route home and back.
          </p>
          {errors.homeCountry && <p className="text-sm text-destructive">{errors.homeCountry}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">Destination(s)</Label>
          <Input
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Paris, Rome, Barcelona"
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            Add multiple destinations separated by commas to unlock the Best Route tab.
          </p>
          {errors.destination && <p className="text-sm text-destructive">{errors.destination}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!startDate}
                  className={cn(
                    "h-12 w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={minEndDate ? { before: minEndDate } : undefined}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {(dateRangeError || errors.endDate) && (
              <p className="text-sm text-destructive">{dateRangeError || errors.endDate}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Total Budget</Label>
          <div className="flex gap-2">
            <Input
              id="budget"
              type="number"
              min={1}
              inputMode="decimal"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="2000"
              className="h-12 flex-1"
            />
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="h-12 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.budget && <p className="text-sm text-destructive">{errors.budget}</p>}
        </div>

        <div className="space-y-2">
          <Label>Interests</Label>
          <InterestPills value={interests} onChange={setInterests} />
          {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to receive your trip plan."
            className="h-12"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!datesValid}
          className="h-14 w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-[var(--shadow-gold)] text-base font-semibold"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Plan My Trip
        </Button>
      </div>
    </form>
  );
}

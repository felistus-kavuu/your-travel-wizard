import { z } from "zod";

export const CURRENCIES = ["USD", "EUR", "AED", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const INTERESTS = [
  "Food",
  "Nature",
  "Museums",
  "Shopping",
  "Nightlife",
  "Adventure",
  "History",
  "Beaches",
] as const;
export type Interest = (typeof INTERESTS)[number];

export const TAB_KINDS = ["itinerary", "packing", "budget", "culture", "route"] as const;
export type TabKind = (typeof TAB_KINDS)[number];

export const tripSchema = z
  .object({
    homeCountry: z.string().trim().max(120).optional(),
    destination: z.string().trim().min(2, "Destination is required").max(120),
    startDate: z.string().min(1, "Start date is required"), // ISO yyyy-mm-dd
    endDate: z.string().min(1, "End date is required"),
    budget: z.number({ invalid_type_error: "Budget is required" }).positive("Budget must be greater than 0").max(10_000_000),
    currency: z.enum(CURRENCIES),
    interests: z.array(z.enum(INTERESTS)).min(1, "Pick at least one interest"),
    email: z.string().trim().email("Enter a valid email").max(255).optional(),
  })
  .refine((v) => new Date(v.endDate) > new Date(v.startDate), {
    message: "End date must be after your start date.",
    path: ["endDate"],
  })
  .refine(
    (v) => {
      const commas = v.destination.split(",").map((s) => s.trim()).filter(Boolean);
      const alts = v.destination.split(/;|\/|\band\b|->|→/i).map((s) => s.trim()).filter(Boolean);
      const isMulti = commas.length >= 2 || alts.length >= 2;
      return !isMulti || Boolean(v.homeCountry && v.homeCountry.length >= 2);
    },
    {
      message: "Home country is required for multi-destination trips.",
      path: ["homeCountry"],
    },
  );

export type Trip = z.infer<typeof tripSchema>;

export const tripRequestSchema = z.object({
  kind: z.enum(TAB_KINDS),
  trip: tripSchema,
});

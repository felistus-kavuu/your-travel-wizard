
## TripGenie — Build Plan

A two-screen travel planning app powered by Lovable AI (Gemini). No auth, no database — state lives in the URL/sessionStorage so a results page reload still works.

### Design System

- Navy blue (`#0B1F3A` / deep navy) + gold (`#D4AF37`) accents, white cards, soft shadows, rounded corners.
- Typography: distinctive display font for the logo/headings (e.g. Fraunces or Playfair) + Inter for body — loaded via `<link>` in `__root.tsx`, registered as `--font-*` tokens in `src/styles.css`.
- All colors as semantic tokens in `src/styles.css` (`--primary`, `--accent`/gold, `--card`, etc.) using `oklch`. No hardcoded color utilities.
- Smooth tab transitions (fade/slide via `tw-animate-css` or framer-motion-light CSS).
- Mobile-first; form card max-width ~640px, results tabs scroll horizontally on small screens.

### Screens & Routes

```
src/routes/
  __root.tsx          (existing — add font <link>, update meta)
  index.tsx           Screen 1 — input form
  trip.tsx            Screen 2 — results with 4 tabs
```

**Screen 1 (`/`)** — centered hero with plane-icon logo + "TripGenie" + "Your AI trip companion" tagline, then a white card form:
- Destination (Input)
- Start Date / End Date (shadcn Calendar in Popover, `pointer-events-auto`)
- Total Budget (number Input) + Currency Select (USD/EUR/AED/GBP)
- Interests as toggleable pill buttons (Food, Nature, Museums, Shopping, Nightlife, Adventure, History, Beaches) — multi-select, ≥1 required
- Gold "Plan My Trip" CTA
- Client-side validation with Zod; inline error messages; end date ≥ start date

On submit: stringify trip params, store in `sessionStorage` under `tripgenie:trip`, navigate to `/trip`.

**Screen 2 (`/trip`)** — reads trip from sessionStorage (redirects to `/` if missing):
- Sticky summary bar: destination · date range · budget+currency · interests chips
- shadcn `Tabs` with 4 triggers (with lucide icons: CalendarDays, Backpack, Wallet, Globe)
- Each tab independently fetches its AI content via TanStack Query (`useQuery`, key includes tab + trip hash). All 4 queries mount on page load → fire in parallel.
- Loading: animated `Skeleton` block.
- Success: render markdown via `react-markdown` with `prose` styling (bold headings, bullets, spacing).
- Error: friendly message + per-tab "Retry" button (calls `refetch()`).
- Bottom "Plan Another Trip" button → clears sessionStorage + navigates to `/`.

### AI Backend

Single server route `src/routes/api/trip.ts` (POST) — accepts `{ kind: 'itinerary'|'packing'|'budget'|'culture', trip }` and returns `{ text: string }`.

- Uses AI SDK + `@ai-sdk/openai-compatible` via the canonical `createLovableAiGatewayProvider` helper in `src/lib/ai-gateway.server.ts`.
- Model: `google/gemini-3-flash-preview` (default).
- `generateText` (non-streaming — simpler, full markdown returned at once; each tab shows skeleton then full content).
- System prompts are the four prompts from the spec, with `{destination}`, `{start_date}`, `{end_date}`, `{budget}`, `{currency}`, `{interests}` interpolated server-side.
- Validate input with Zod.
- Forwards `X-Lovable-AIG-*` headers via `getLovableAiGatewayResponseHeaders`.
- Surfaces 429 (rate-limited) and 402 (credits exhausted) with friendly messages.

Client calls it with `fetch('/api/trip', { method: 'POST', body: JSON.stringify({ kind, trip }) })` from each tab's query function.

### Files to Create / Modify

**New**
- `src/lib/ai-gateway.server.ts` — Lovable AI Gateway helper (canonical snippet)
- `src/lib/trip-types.ts` — `Trip` type + Zod schema + currency/interest enums
- `src/lib/trip-storage.ts` — small sessionStorage get/set/clear
- `src/lib/prompts.ts` — the 4 system prompts as template fns
- `src/routes/api/trip.ts` — POST handler calling `generateText`
- `src/routes/trip.tsx` — results page with tabs
- `src/components/trip/InterestPills.tsx`
- `src/components/trip/TripForm.tsx`
- `src/components/trip/TripSummaryBar.tsx`
- `src/components/trip/TabContent.tsx` (handles loading/error/markdown render)

**Modify**
- `src/routes/index.tsx` — replace placeholder with hero + `<TripForm />`
- `src/routes/__root.tsx` — add Google Fonts `<link>` (display + Inter), update title/meta to "TripGenie — Your AI trip companion"
- `src/styles.css` — add navy/gold tokens, font tokens, gradient + shadow helpers; keep shadcn `@theme inline` mapping intact
- `src/router.tsx` — no change needed (QueryClient already wired)

### Dependencies to Add

- `ai`, `@ai-sdk/openai-compatible`, `zod` (likely already in lockfile — will verify), `react-markdown`, `date-fns` (for date formatting; calendar already needs it)

### Secrets

`LOVABLE_API_KEY` — provision via `lovable_api_key--create` if missing before first run.

### Error / Edge Cases

- Missing trip on `/trip` → redirect to `/`.
- End date before start date → form error.
- Budget ≤ 0 → form error.
- Zero interests selected → form error.
- API non-200 → tab shows error card + Retry.
- 429 → "AI is busy, please retry in a moment."
- 402 → "Free AI allowance used — add credits to continue."

### Out of Scope (per spec)

No login, no database, no trip history persistence beyond current session.

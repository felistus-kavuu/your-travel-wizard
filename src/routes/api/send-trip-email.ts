import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().trim().email().max(255),
  destination: z.string().trim().min(1).max(200),
  itinerary: z.string().max(50000),
  packing_list: z.string().max(50000),
  budget_breakdown: z.string().max(50000),
  culture_phrases: z.string().max(50000),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function section(title: string, body: string): string {
  return `<h2 style="font-family:Georgia,serif;color:#0B1F3A;border-bottom:2px solid #D4AF37;padding-bottom:6px;margin-top:32px;">${escapeHtml(
    title,
  )}</h2><pre style="white-space:pre-wrap;font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;margin:0;">${escapeHtml(
    body,
  )}</pre>`;
}

export const Route = createFileRoute("/api/send-trip-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid request", details: parsed.error.flatten() },
            { status: 400 },
          );
        }
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "Email is not configured" }, { status: 500 });
        }
        const { email, destination, itinerary, packing_list, budget_breakdown, culture_phrases } =
          parsed.data;

        const html = `<div style="max-width:640px;margin:0 auto;padding:24px;background:#ffffff;">
  <div style="text-align:center;padding:16px 0;">
    <h1 style="font-family:Georgia,serif;color:#0B1F3A;margin:0;">TripGenie</h1>
    <p style="color:#6b7280;margin:4px 0 0;">Your AI trip companion</p>
  </div>
  <p style="font-family:Inter,Arial,sans-serif;color:#1f2937;font-size:15px;">Here is your full trip plan for <strong>${escapeHtml(destination)}</strong>.</p>
  ${section("Itinerary", itinerary)}
  ${section("Packing List", packing_list)}
  ${section("Budget Breakdown", budget_breakdown)}
  ${section("Culture & Phrases", culture_phrases)}
</div>`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: "TripGenie <onboarding@resend.dev>",
            to: [email],
            subject: `Your TripGenie Plan — ${destination}`,
            html,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          return Response.json(
            { error: "Failed to send email", details: text },
            { status: 502 },
          );
        }
        return Response.json({ ok: true });
      },
    },
  },
});

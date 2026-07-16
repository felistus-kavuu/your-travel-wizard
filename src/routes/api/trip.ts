import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { buildPrompt } from "@/lib/prompts";
import { tripRequestSchema } from "@/lib/trip-types";

export const Route = createFileRoute("/api/trip")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = tripRequestSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid trip data", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!key) {
          return Response.json({ error: "AI is not configured" }, { status: 500 });
        }

        const { kind, trip } = parsed.data;
        const { system, user } = buildPrompt(kind, trip);

        try {
          const google = createGoogleGenerativeAI({ apiKey: key });
          const model = google("gemini-3-flash-preview");
          const result = await generateText({
            model,
            system,
            prompt: user,
          });
          return Response.json({ text: result.text });
        } catch (err: unknown) {
          const e = err as { statusCode?: number; status?: number; message?: string };
          const status = e?.statusCode ?? e?.status ?? 500;
          if (status === 429) {
            return Response.json(
              { error: "AI is busy right now. Please retry in a moment." },
              { status: 429 },
            );
          }
          if (status === 402) {
            return Response.json(
              { error: "Free AI allowance used. Add credits to continue." },
              { status: 402 },
            );
          }
          console.error("[trip api] generation failed", err);
          return Response.json(
            { error: "Something went wrong generating this. Please retry." },
            { status: 500 },
          );
        }
      },
    },
  },
});

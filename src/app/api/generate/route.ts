import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { creditsFor } from "@/lib/credits";
import { createGeneration, InsufficientCreditsError } from "@/lib/generations";
import { generateRequestSchema } from "@/lib/validation";

/**
 * Enqueue a generation.
 *
 * Returns as soon as fal has accepted the job. It deliberately does NOT wait
 * for the image: fal.subscribe() would hold the connection open for the whole
 * render, and a Vercel function times out long before that. The client polls
 * GET /api/generations/[id] instead.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request.",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const generation = await createGeneration(user.id, parsed.data);
    return NextResponse.json(
      { id: generation.id, status: generation.status },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json(
        {
          error: error.message,
          required: error.required,
          available: error.available,
        },
        { status: 402 },
      );
    }

    console.error("[api/generate] submit failed:", error);
    return NextResponse.json(
      {
        error: "Could not start the generation. Your credits were not charged.",
        cost: creditsFor(parsed.data.model),
      },
      { status: 502 },
    );
  }
}

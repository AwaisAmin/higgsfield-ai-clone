import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { syncGeneration } from "@/lib/generations";

/**
 * Poll a single generation. Terminal rows return straight from the database;
 * in-flight rows are advanced against fal's queue first, which is where a
 * finished job gets its resultUrl persisted and a failed one gets refunded.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const generation = await syncGeneration(user.id, id);

  // Someone else's generation is indistinguishable from one that never existed.
  if (!generation) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(generation, {
    headers: { "Cache-Control": "no-store" },
  });
}

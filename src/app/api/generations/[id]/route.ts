import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { syncGeneration } from "@/lib/generations";
import { prisma } from "@/lib/prisma";
import { updateGenerationSchema } from "@/lib/validation";

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

/** Toggle visibility. The only field a user may change after the fact. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const parsed = updateGenerationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id } = await params;
  // updateMany so ownership is part of the WHERE — a findFirst-then-update
  // would be a race, and would leak existence on the error path.
  const updated = await prisma.generation.updateMany({
    where: { id, userId: user.id },
    data: { isPublic: parsed.data.isPublic },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ id, isPublic: parsed.data.isPublic });
}

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { listGenerations } from "@/lib/generations";
import { listGenerationsSchema } from "@/lib/validation";

/** The signed-in user's generations, newest first. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listGenerationsSchema.safeParse({
    limit: searchParams.get("limit") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query.",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const page = await listGenerations(user.id, parsed.data);
  return NextResponse.json(page, {
    headers: { "Cache-Control": "no-store" },
  });
}

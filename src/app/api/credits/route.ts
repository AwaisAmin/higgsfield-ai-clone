import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

/**
 * Credit balance for the signed-in user.
 *
 * This exists so the header's credits chip can be a client component. Reading
 * the balance in a server component inside the root layout would opt every
 * route — including the static marketing pages — into dynamic rendering, since
 * without Partial Prerendering a dynamic API anywhere in the layout tree
 * disqualifies the whole route from static generation. Suspense streams; it
 * does not carve out a dynamic hole.
 *
 * Calling getCurrentUser() here also keeps the sync-on-read behaviour: a
 * signed-in user hitting any page still refreshes their row.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  return NextResponse.json(
    { credits: user.credits, plan: user.plan },
    { headers: { "Cache-Control": "no-store" } },
  );
}

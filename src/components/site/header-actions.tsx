"use client";

import { ClerkLoaded, ClerkLoading, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { clerkAppearance } from "@/lib/clerk-appearance";
import { CreditsChip } from "./credits-chip";

/**
 * The auth seam.
 *
 * Signed-in vs signed-out is decided on the client by Clerk, and the credits
 * balance is fetched client-side, so nothing in this subtree forces a route
 * into dynamic rendering. That is what keeps the marketing pages static.
 *
 * Clerk Core 3 (v7) removed <SignedIn>/<SignedOut> in favour of
 * <Show when="signed-in">. The removed components still exist as exports but
 * throw at render time, so this is not a stylistic choice.
 *
 * <Show> renders null until Clerk resolves, which on a statically prerendered
 * page means the auth corner is empty in the served HTML and pops in on
 * hydration. <ClerkLoading> covers that window with the signed-out actions, so
 * the markup ships complete and the common case — a logged-out visitor landing
 * on a marketing page — never sees a gap. A signed-in visitor briefly sees the
 * signed-out pair swap to their avatar, which is the better half of the trade.
 */
function SignedOutActions() {
  return (
    <>
      <Link
        href="/sign-in"
        className="rounded-full px-3 py-1.5 text-sm text-text-secondary transition-colors duration-200 ease-swift hover:text-text-primary"
      >
        Login
      </Link>
      <Link
        href="/sign-up"
        className="rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
      >
        Sign up
      </Link>
    </>
  );
}

export function HeaderActions() {
  return (
    <>
      <ClerkLoading>
        <SignedOutActions />
      </ClerkLoading>

      <ClerkLoaded>
        <Show when="signed-in" fallback={<SignedOutActions />}>
          <CreditsChip />
          <UserButton
            appearance={clerkAppearance}
            userProfileProps={{ appearance: clerkAppearance }}
          />
        </Show>
      </ClerkLoaded>
    </>
  );
}

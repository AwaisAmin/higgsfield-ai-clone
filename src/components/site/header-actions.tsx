"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { clerkAppearance } from "@/lib/clerk-appearance";

/**
 * The auth seam. The header's layout, scroll and dropdown logic never learns
 * about sessions -- only this component switches.
 */
export type HeaderSession =
  | { status: "anon" }
  | { status: "authed"; credits: number };

function CreditsChip({ credits }: { credits: number }) {
  return (
    <Link
      href="/pricing"
      title="Credits remaining"
      className="rounded-full border border-border-default bg-inset px-2.5 py-1 font-mono text-xs whitespace-nowrap text-brand transition-colors duration-200 ease-swift hover:border-border-strong"
    >
      {credits.toLocaleString()} credits
    </Link>
  );
}

export function HeaderActions({
  session = { status: "anon" },
}: {
  session?: HeaderSession;
}) {
  if (session.status === "authed") {
    return (
      <>
        <CreditsChip credits={session.credits} />
        <UserButton
          appearance={clerkAppearance}
          userProfileProps={{ appearance: clerkAppearance }}
        />
      </>
    );
  }

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

"use client";

import Link from "next/link";
import { useState } from "react";

export function PromoBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative h-[60px] w-full bg-brand text-on-brand"
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4 pr-12 sm:px-6 sm:pr-14">
        <p className="min-w-0 flex-1 text-sm leading-tight">
          <span className="font-semibold">Seedance 2.5 is live.</span>{" "}
          {/* the supporting sentence is noise on a phone */}
          <span className="hidden sm:inline">
            Sign up and get unlimited Nano Banana Pro plus an extra discount.
          </span>
        </p>

        <Link
          href="/pricing"
          className="shrink-0 rounded-full bg-grey-550 px-4 py-2 text-xs font-medium text-grey-050 transition-colors duration-200 ease-swift hover:bg-grey-600 sm:text-sm"
        >
          Get your discount
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full transition-colors duration-200 ease-swift hover:bg-grey-550/10 sm:right-5"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="size-4"
        >
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

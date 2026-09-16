"use client";

import { ClerkLoaded, ClerkLoading, Show } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

const PERKS = [
  "Unlimited Nano Banana Pro",
  "Unlock your extra discount",
  "Access to Seedance 2.5",
];

function Tick() {
  return (
    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-2.5 text-on-brand">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Local state only — there is no list behind this yet. */
function EmailCapture() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p role="status" className="text-sm text-brand">
        You&apos;re on the list — we&apos;ll send your discount to {email}.
      </p>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label htmlFor="promo-email" className="sr-only">
        Email address
      </label>
      <input
        id="promo-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@studio.com"
        className="min-w-0 flex-1 rounded-full border border-border-default bg-inset px-4 py-3 text-sm text-text-primary transition-colors duration-200 ease-swift placeholder:text-text-tertiary focus:border-brand focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-brand px-5 py-3 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
      >
        Sign up
      </button>
    </form>
  );
}

/**
 * Signed-out promo. Signed-in visitors get a route into the product instead —
 * offering someone a sign-up discount they already took is a small thing that
 * makes a product feel like it is not paying attention.
 *
 * The decision is client-side via Clerk so this page stays statically rendered.
 *
 * <ClerkLoaded> alone renders nothing during SSR, which left this entire
 * section out of the prerendered HTML — invisible to anyone without JS and to
 * crawlers, on the one route whose value is being static. <ClerkLoading> puts
 * the signed-out version in the served markup, and the signed-in swap happens
 * once Clerk resolves.
 */
export function SignupPromo() {
  const signedOut = (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-3xl tracking-tighter text-text-primary sm:text-4xl">
          Sign up and get your <span className="text-brand">extra discount</span>
        </h2>
        <ul className="mt-6 space-y-3">
          {PERKS.map((perk) => (
            <li key={perk} className="flex gap-3 text-sm text-text-secondary">
              <Tick />
              {perk}
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:justify-self-end">
        <EmailCapture />
        <p className="mt-3 max-w-md text-xs text-text-tertiary">
          100 credits land in your account the moment you sign up.
        </p>
      </div>
    </div>
  );

  return (
    <section className="relative isolate overflow-hidden">
      {/* lime bleeding up from the bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-80 w-[min(1100px,120vw)] -translate-x-1/2 rounded-[100%] bg-brand opacity-[0.16] blur-3xl"
      />

      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <ClerkLoading>{signedOut}</ClerkLoading>

        <ClerkLoaded>
          <Show when="signed-in" fallback={signedOut}>
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-display text-3xl tracking-tighter text-text-primary sm:text-4xl">
                  Your credits are <span className="text-brand">ready to spend</span>
                </h2>
                <p className="mt-3 max-w-xl text-sm text-text-secondary">
                  Pick up where you left off — every generation lands in your
                  library.
                </p>
              </div>
              <Link
                href="/ai/image"
                className="shrink-0 rounded-full bg-brand px-6 py-3 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
              >
                Start generating
              </Link>
            </div>
          </Show>
        </ClerkLoaded>
      </div>
    </section>
  );
}

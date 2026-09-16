"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  CREDITS_CHANGED_EVENT,
  type CreditsChangedDetail,
} from "@/lib/credits-events";

/**
 * The credits balance in the header.
 *
 * Client-side on purpose. The natural shape for this is a server component
 * wrapped in <Suspense>, but on Next 15.5 stable that does not work here: any
 * dynamic API in the root layout's tree — Suspense or not — opts every route
 * out of static generation, which would cost us static marketing pages.
 * Suspense enables streaming within a dynamic render, not a static shell with a
 * dynamic hole. That is Partial Prerendering, and `experimental.ppr` is
 * canary-only. Measured, not assumed: with the server component in place all
 * routes built as `ƒ`; with it removed the same routes built as `○`.
 *
 * So the balance is fetched from /api/credits instead, and the skeleton plays
 * the role the Suspense fallback would have. Revisit when PPR lands in stable.
 *
 * Only rendered inside <Show when="signed-in">, so the request is never made
 * for signed-out visitors.
 */
export function CreditsChip() {
  const [credits, setCredits] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback((signal?: AbortSignal) => {
    return fetch("/api/credits", { signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { credits: number }) => {
        setCredits(data.credits);
        setFailed(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFailed(true);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // The studio spends credits in a different React tree; it broadcasts the new
  // balance so this chip does not go stale after a generation.
  useEffect(() => {
    const onChanged = (event: Event) => {
      const detail = (event as CustomEvent<CreditsChangedDetail>).detail;
      if (typeof detail?.credits === "number") {
        setCredits(detail.credits);
        setFailed(false);
      } else {
        void load();
      }
    };
    window.addEventListener(CREDITS_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(CREDITS_CHANGED_EVENT, onChanged);
  }, [load]);

  // A balance we could not read is worse than no chip at all — never guess.
  if (failed) return null;
  if (credits === null) return <CreditsChipSkeleton />;

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

/** Same footprint as the real chip, so the header does not jump when it lands. */
export function CreditsChipSkeleton() {
  return (
    <span
      aria-hidden
      className="h-[26px] w-[86px] animate-pulse rounded-full border border-border-subtle bg-inset"
    />
  );
}

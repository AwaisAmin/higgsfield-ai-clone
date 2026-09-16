"use client";

import { useEffect, useRef } from "react";

import type { GenerationView } from "./generation-view";

/** Tight polling while a generation is likely to finish... */
const FAST_INTERVAL_MS = 1000;
const FAST_WINDOW_MS = 10_000;
/** ...then back off, because schnell taking >10s means something is queued. */
const SLOW_INTERVAL_MS = 2000;

/**
 * Polls the given generations until they reach a terminal status.
 *
 * Stops on unmount, when every id has settled (the caller stops passing them),
 * and while the tab is hidden — a backgrounded tab burning a request per second
 * is wasted work on both ends, and `visibilitychange` resumes it immediately.
 */
export function useGenerationPoll(
  pendingIds: readonly string[],
  onUpdate: (generation: GenerationView) => void,
) {
  // Join into a primitive so the effect is keyed by content, not array identity.
  const key = pendingIds.join(",");

  // Keep the callback current without making it an effect dependency, which
  // would restart the timer on every parent render.
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!key) return;

    const ids = key.split(",");
    const startedAt = Date.now();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const interval = () =>
      Date.now() - startedAt < FAST_WINDOW_MS ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS;

    const poll = async () => {
      if (cancelled || document.hidden) return;

      await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await fetch(`/api/generations/${id}`, {
              cache: "no-store",
            });
            if (!response.ok) return;
            const generation = (await response.json()) as GenerationView;
            if (!cancelled) onUpdateRef.current(generation);
          } catch {
            // A dropped poll is not a failed generation. Try again next tick.
          }
        }),
      );

      if (!cancelled && !document.hidden) {
        timer = setTimeout(poll, interval());
      }
    };

    const onVisibilityChange = () => {
      clearTimeout(timer);
      if (!document.hidden && !cancelled) {
        timer = setTimeout(poll, 0); // catch up immediately on return
      }
    };

    timer = setTimeout(poll, interval());
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [key]);
}

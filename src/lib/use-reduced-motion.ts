"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion`.
 *
 * Starts false so the server and the first client render agree; the media query
 * is only readable in the browser, and guessing would cause a hydration
 * mismatch. Anything gated on this therefore settles one tick after mount,
 * which is fine for pausing video and skipping entrance animations.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

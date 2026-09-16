"use client";

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A looping muted clip that only ever plays while it is on screen.
 *
 * The home page carries seventeen of these. Without gating, every one would
 * fetch and decode on load, which is a lot of bandwidth and a lot of decoder
 * pressure for media that is mostly below the fold. So: `preload="none"` until
 * the IntersectionObserver says the element is visible, play on entry, pause
 * and rewind on exit.
 *
 * Under `prefers-reduced-motion` it never plays — the poster frame stands in,
 * which is the whole point of the preference.
 */
export function AutoVideo({
  src,
  poster,
  className = "",
  ariaLabel,
}: {
  src: string;
  poster: string;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting) {
          el.pause();
          el.currentTime = 0;
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (inView && !reducedMotion) {
      // Autoplay can still be refused (low power mode); the poster remains.
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [inView, reducedMotion]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={inView && !reducedMotion ? "metadata" : "none"}
      aria-label={ariaLabel}
      className={className}
    />
  );
}

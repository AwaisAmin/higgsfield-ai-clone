"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const WORDMARK = "GPT-6 ASTRA";

/**
 * Letters animate in on a stagger once the section scrolls into view.
 *
 * Under `prefers-reduced-motion` they are simply present from the start — the
 * text is the point, the choreography is not. Each glyph keeps its own span
 * either way, and the whole string is exposed to assistive tech as one label so
 * it is never read out letter by letter.
 */
export function McpSection() {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect(); // one-shot: re-animating on every scroll is noise
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shown = revealed || reducedMotion;

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden px-4 py-24 text-center sm:px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[42rem] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand opacity-[0.10] blur-3xl"
      />

      <h2 className="mx-auto max-w-4xl font-display text-3xl tracking-tighter text-text-primary sm:text-5xl">
        Higgsfield MCP with
      </h2>

      <p
        aria-label={WORDMARK}
        className="mt-4 font-mono text-2xl tracking-[0.35em] text-brand sm:text-4xl"
      >
        {WORDMARK.split("").map((char, index) => (
          <span
            key={`${char}-${index}`}
            aria-hidden
            style={{
              transitionDelay: reducedMotion ? "0ms" : `${index * 45}ms`,
            }}
            className={`inline-block transition-all duration-500 ease-out-expo ${
              shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </p>

      <p className="mx-auto mt-6 max-w-xl text-text-secondary">
        Build games, motion graphics, and interactive 3D experiences with
        Higgsfield MCP.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/mcp"
          className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
        >
          Get started
        </Link>
        <Link
          href="/gpt-astra"
          className="rounded-full border border-border-strong px-6 py-3 text-sm text-text-primary transition-colors duration-200 ease-swift hover:bg-panel-raised"
        >
          Read the docs
        </Link>
      </div>
    </section>
  );
}

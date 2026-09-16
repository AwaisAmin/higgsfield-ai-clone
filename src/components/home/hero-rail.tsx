"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { HERO_CARDS } from "@/data/home";
import { AutoVideo } from "./auto-video";

/**
 * The hero carousel.
 *
 * Scroll position is the single source of truth: the rail is a native
 * snap-scrolling overflow container, and the dots read the active index back
 * out of `scrollLeft` rather than driving it. That keeps a trackpad swipe, a
 * dot click and an arrow press all consistent, and it keeps keyboard and touch
 * behaviour for free.
 */
export function HeroRail() {
  const railRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const syncActive = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.firstElementChild as HTMLElement | null;
    if (!card) return;
    const stride = card.offsetWidth + 16; // gap-4
    setActive(Math.round(rail.scrollLeft / stride));
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener("scroll", syncActive, { passive: true });
    return () => rail.removeEventListener("scroll", syncActive);
  }, [syncActive]);

  const scrollTo = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.firstElementChild as HTMLElement | null;
    if (!card) return;
    const clamped = Math.max(0, Math.min(index, HERO_CARDS.length - 1));
    rail.scrollTo({ left: clamped * (card.offsetWidth + 16), behavior: "smooth" });
  };

  return (
    <section aria-label="Featured" className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
      <ul
        ref={railRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {HERO_CARDS.map((card) => (
          <li
            key={card.title}
            className="w-full shrink-0 snap-start sm:aspect-video sm:w-auto sm:flex-[0_0_100%]"
          >
            <article className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border-subtle bg-panel sm:aspect-video">
              <AutoVideo
                src={card.video}
                poster={card.poster}
                ariaLabel={`${card.title} — ${card.tagline}`}
                className="size-full object-cover"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-grey-600 via-grey-600/70 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <h2 className="font-display text-2xl tracking-tighter text-grey-050 sm:text-4xl">
                  {card.title}
                </h2>
                <p className="mt-2 max-w-xl text-sm text-grey-150 sm:text-base">
                  {card.tagline}
                </p>
                <Link
                  href={card.href}
                  className="mt-5 inline-block rounded-full bg-grey-050 px-5 py-2.5 text-sm font-medium text-grey-600 transition-colors duration-200 ease-swift hover:bg-grey-100"
                >
                  {card.cta}
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous"
          className="grid size-9 place-items-center rounded-full border border-border-default text-text-secondary transition-colors duration-200 ease-swift hover:border-border-strong hover:text-text-primary disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-4">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <ul className="flex items-center gap-2">
          {HERO_CARDS.map((card, index) => (
            <li key={card.title}>
              <button
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Go to ${card.title}`}
                aria-current={index === active}
                className={`h-1.5 rounded-full transition-all duration-300 ease-emphasized ${
                  index === active ? "w-6 bg-brand" : "w-1.5 bg-grey-400 hover:bg-grey-300"
                }`}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => scrollTo(active + 1)}
          disabled={active === HERO_CARDS.length - 1}
          aria-label="Next"
          className="grid size-9 place-items-center rounded-full border border-border-default text-text-secondary transition-colors duration-200 ease-swift hover:border-border-strong hover:text-text-primary disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-4">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}

import Link from "next/link";

import { EFFECT_PRESETS } from "@/data/effects";

/** Preset thumbnails, "Recreate" on hover, all routing into /effects. */
export function EffectsRail() {
  return (
    <section className="py-16">
      <div className="mx-auto mb-8 max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-tighter text-text-primary sm:text-4xl">
              Visual Effects
            </h2>
            <p className="mt-2 max-w-xl text-text-secondary">
              Big-budget visual effects, from explosions to surreal
              transformations.
            </p>
          </div>
          <Link
            href="/effects"
            className="rounded-full border border-border-strong px-4 py-2 text-sm text-text-primary transition-colors duration-200 ease-swift hover:bg-panel-raised"
          >
            All effects
          </Link>
        </div>
      </div>

      <ul className="flex snap-x gap-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        {EFFECT_PRESETS.map((preset) => (
          <li key={preset.slug} className="w-40 shrink-0 snap-start sm:w-48">
            <Link
              href="/effects"
              title={preset.description}
              className="group relative block aspect-[9/16] overflow-hidden rounded-2xl border border-border-subtle bg-panel transition-colors duration-200 ease-swift hover:border-border-strong"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- CDN host is
                  not configured in next/image remotePatterns. */}
              <img
                src={preset.thumbnail}
                alt={preset.name}
                loading="lazy"
                className="size-full object-cover"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-grey-600 to-transparent"
              />
              <span className="absolute inset-x-3 bottom-3 text-sm font-medium text-grey-050 transition-opacity duration-200 ease-swift group-hover:opacity-0">
                {preset.name}
              </span>
              <span className="absolute inset-x-3 bottom-3 rounded-full bg-brand px-3 py-1.5 text-center text-xs font-medium text-on-brand opacity-0 transition-opacity duration-200 ease-swift group-focus-visible:opacity-100 group-hover:opacity-100">
                Recreate
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

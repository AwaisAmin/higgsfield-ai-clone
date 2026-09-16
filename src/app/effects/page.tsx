import type { Metadata } from "next";
import Link from "next/link";

import { EFFECT_PRESETS } from "@/data/effects";

export const metadata: Metadata = {
  title: "Effects",
  description: "Viral video presets — pick one and recreate it with your own prompt.",
};

export default function EffectsPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <p className="font-mono text-xs tracking-tight text-brand uppercase">
          Effects
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tighter text-text-primary">
          Presets that already went viral
        </h1>
        <p className="mt-3 text-text-secondary">
          Pick a look and recreate it. Each preset drops you into the video
          composer with its prompt already written — edit it, or run it as is.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {EFFECT_PRESETS.map((preset) => (
          <li key={preset.slug}>
            <article className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-panel transition-colors duration-200 ease-swift hover:border-border-strong">
              <div className="aspect-[9/16] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- CDN host
                    is not configured in next/image remotePatterns. */}
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                />
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-grey-600 via-grey-600/70 to-transparent p-3 pt-10">
                <h2 className="text-sm font-medium text-grey-050">
                  {preset.name}
                </h2>
              </div>

              <div className="absolute inset-0 flex items-end justify-center p-3 opacity-0 transition-opacity duration-200 ease-swift group-focus-within:opacity-100 group-hover:opacity-100">
                <Link
                  href={`/ai/video?preset=${preset.slug}`}
                  className="w-full rounded-full bg-brand px-4 py-2 text-center text-xs font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
                >
                  Recreate
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs text-text-tertiary">
        Thumbnails are Higgsfield&apos;s own promotional stills. Video generation
        is simulated in this build — see the notice in the composer.
      </p>
    </div>
  );
}

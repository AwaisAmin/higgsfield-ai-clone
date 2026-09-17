import Link from "next/link";

import { LogoGlyph } from "@/components/site/logo";
import { MAINTENANCE } from "@/data/maintenance";

/**
 * Placeholder for a route that is linked but not built.
 *
 * It says plainly that the page does not exist yet rather than implying the
 * feature is merely loading, and it always offers somewhere that does work —
 * a dead end with an apology is still a dead end.
 */
export function MaintenancePage({ route }: { route: string }) {
  const info = MAINTENANCE[route];
  if (!info) {
    throw new Error(`No maintenance copy registered for "${route}".`);
  }

  return (
    <div className="relative isolate overflow-hidden px-6 py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[34rem] max-w-[120vw] -translate-x-1/2 rounded-full bg-brand opacity-[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-xl text-center">
        <LogoGlyph className="mx-auto size-8 text-brand" />

        <p className="mt-6 font-mono text-xs tracking-tight text-brand uppercase">
          {info.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tighter text-text-primary sm:text-4xl">
          {info.title}
        </h1>
        <p className="mt-4 text-text-secondary">{info.blurb}</p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border-default bg-inset px-4 py-2">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-brand" />
          <span className="text-sm text-text-secondary">
            Not built yet — this is a study rebuild
          </span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {info.suggestion ? (
            <Link
              href={info.suggestion.href}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
            >
              {info.suggestion.label}
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-full border border-border-strong px-5 py-2.5 text-sm text-text-primary transition-colors duration-200 ease-swift hover:bg-panel-raised"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-10 font-mono text-[11px] text-text-tertiary">
          {route}
        </p>
      </div>
    </div>
  );
}

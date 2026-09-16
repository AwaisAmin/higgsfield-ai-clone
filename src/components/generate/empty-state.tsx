"use client";

import type { GenKind } from "@prisma/client";

import { LogoGlyph } from "@/components/site/logo";
import { creditsFor, DEFAULT_MODEL, DEFAULT_VIDEO_MODEL } from "@/lib/credits";

/** Concrete enough to be worth clicking — a blank grid teaches nothing. */
const EXAMPLES: Record<GenKind, readonly string[]> = {
  IMAGE: [
    "A lone figure on a rain-slick Tokyo street at night, neon reflections in the puddles, anamorphic lens, 35mm",
    "Brutalist concrete library at golden hour, long shadows through clerestory windows, architectural photography",
    "Close-up of a hummingbird mid-flight against matte black, wings frozen, studio strobe, macro detail",
  ],
  VIDEO: [
    "Slow dolly through a neon-lit alley as rain falls, subject walking away from camera, steam rising from a grate",
    "Handheld follow behind a cyclist weaving through morning traffic, low sun flaring across the lens",
    "Locked-off wide of a desert highway as a storm rolls in, time compressing, dust lifting off the tarmac",
  ],
};

export function EmptyState({
  kind,
  onPick,
}: {
  kind: GenKind;
  onPick: (prompt: string) => void;
}) {
  const isVideo = kind === "VIDEO";
  const cost = creditsFor(isVideo ? DEFAULT_VIDEO_MODEL : DEFAULT_MODEL);
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <LogoGlyph className="mx-auto size-8 text-brand" />
      <h2 className="mt-6 font-display text-2xl tracking-tight text-text-primary">
        Nothing generated yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
        Describe the shot you want — subject, lighting, lens — and hit Generate.
        Each {isVideo ? "clip" : "image"} costs {cost} credits and takes a few
        seconds.
      </p>

      <p className="mt-8 font-mono text-xs tracking-tight text-text-tertiary uppercase">
        Try one of these
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {EXAMPLES[kind].map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPick(example)}
            className="rounded-xl border border-border-subtle bg-panel px-4 py-3 text-left text-sm text-text-secondary transition-colors duration-200 ease-swift hover:border-border-strong hover:text-text-primary"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}

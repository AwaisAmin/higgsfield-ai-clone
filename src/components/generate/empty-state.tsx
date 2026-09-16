"use client";

import { LogoGlyph } from "@/components/site/logo";

/** Concrete enough to be worth clicking — a blank grid teaches nothing. */
const EXAMPLES = [
  "A lone figure on a rain-slick Tokyo street at night, neon reflections in the puddles, anamorphic lens, 35mm",
  "Brutalist concrete library at golden hour, long shadows through clerestory windows, architectural photography",
  "Close-up of a hummingbird mid-flight against matte black, wings frozen, studio strobe, macro detail",
];

export function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <LogoGlyph className="mx-auto size-8 text-brand" />
      <h2 className="mt-6 font-display text-2xl tracking-tight text-text-primary">
        Nothing generated yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
        Describe the shot you want — subject, lighting, lens — and hit Generate.
        Each image costs 4 credits and takes a few seconds.
      </p>

      <p className="mt-8 font-mono text-xs tracking-tight text-text-tertiary uppercase">
        Try one of these
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {EXAMPLES.map((example) => (
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

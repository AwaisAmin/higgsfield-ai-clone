"use client";

import { ASPECT_RATIOS, type AspectRatio } from "@/lib/credits";

/** Draw each option at its actual proportions — the label alone makes you think. */
function RatioGlyph({ ratio, active }: { ratio: AspectRatio; active: boolean }) {
  const [w, h] = ratio.split(":").map(Number);
  const scale = 20;
  const width = w >= h ? scale : scale * (w / h);
  const height = w >= h ? scale * (h / w) : scale;

  return (
    <span
      aria-hidden
      style={{ width, height }}
      className={`block rounded-[3px] border transition-colors duration-200 ease-swift ${
        active ? "border-on-brand/70 bg-on-brand/20" : "border-grey-300 bg-transparent"
      }`}
    />
  );
}

export function AspectRatioPicker({
  value,
  onChange,
}: {
  value: AspectRatio;
  onChange: (next: AspectRatio) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-xs tracking-tight text-text-tertiary uppercase">
        Aspect ratio
      </legend>
      <div className="flex flex-wrap gap-2">
        {ASPECT_RATIOS.map((ratio) => {
          const active = ratio === value;
          return (
            <button
              key={ratio}
              type="button"
              onClick={() => onChange(ratio)}
              aria-pressed={active}
              className={`flex min-w-[60px] flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 transition-colors duration-200 ease-swift ${
                active
                  ? "border-brand bg-brand text-on-brand"
                  : "border-border-default bg-inset text-text-secondary hover:border-border-strong hover:text-text-primary"
              }`}
            >
              {/* fixed box so the glyphs share a baseline regardless of shape */}
              <span className="flex h-5 items-center justify-center">
                <RatioGlyph ratio={ratio} active={active} />
              </span>
              <span className="font-mono text-[11px] leading-none">{ratio}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

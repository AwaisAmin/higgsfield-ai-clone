"use client";

import { MODELS, type ModelId } from "@/lib/credits";

/**
 * Models we intend to offer but have not wired yet. Shown disabled rather than
 * hidden so the surface reads as a product with a roadmap instead of a
 * one-model demo. They are not in MODELS because nothing can be priced or
 * submitted against them yet.
 */
const COMING_SOON = [
  { id: "fal-ai/flux/dev", label: "FLUX.1 [dev]", credits: 10 },
  { id: "fal-ai/recraft-v3", label: "Recraft V3", credits: 12 },
] as const;

export function ModelPicker({
  value,
  onChange,
}: {
  value: ModelId;
  onChange: (next: ModelId) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-xs tracking-tight text-text-tertiary uppercase">
        Model
      </legend>
      <div className="flex flex-wrap gap-2">
        {Object.values(MODELS).map((model) => {
          const active = model.id === value;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => onChange(model.id)}
              aria-pressed={active}
              title={model.description}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors duration-200 ease-swift ${
                active
                  ? "border-brand bg-brand font-medium text-on-brand"
                  : "border-border-default bg-inset text-text-secondary hover:border-border-strong hover:text-text-primary"
              }`}
            >
              {model.label}
            </button>
          );
        })}

        {COMING_SOON.map((model) => (
          <span
            key={model.id}
            aria-disabled="true"
            title={`${model.label} — not available yet`}
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-border-subtle bg-inset px-3 py-1.5 text-xs text-grey-350"
          >
            {model.label}
            <span className="rounded-full bg-grey-450 px-1.5 py-px text-[9px] leading-[1.5] tracking-tight text-text-tertiary uppercase">
              soon
            </span>
          </span>
        ))}
      </div>
    </fieldset>
  );
}

"use client";

import type { GenKind } from "@prisma/client";

import { modelsOfKind, type ModelId } from "@/lib/credits";

/**
 * Models we intend to offer but have not wired yet. Shown disabled rather than
 * hidden so the surface reads as a product with a roadmap instead of a
 * one-model demo. They are not in MODELS because nothing can be priced or
 * submitted against them yet.
 */
const COMING_SOON: Record<GenKind, ReadonlyArray<{ id: string; label: string }>> = {
  IMAGE: [
    { id: "fal-ai/flux/dev", label: "FLUX.1 [dev]" },
    { id: "fal-ai/recraft-v3", label: "Recraft V3" },
  ],
  VIDEO: [
    { id: "higgsfield/genjutsu", label: "Genjutsu" },
    { id: "fal-ai/kling-video", label: "Kling 2.1" },
  ],
};

export function ModelPicker({
  kind,
  value,
  onChange,
}: {
  kind: GenKind;
  value: ModelId;
  onChange: (next: ModelId) => void;
}) {
  const available = modelsOfKind(kind);
  const stubbed = available.some((m) => m.stubbed);

  return (
    <fieldset>
      <legend className="mb-2 font-mono text-xs tracking-tight text-text-tertiary uppercase">
        Model
      </legend>
      <div className="flex flex-wrap gap-2">
        {available.map((model) => {
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

        {COMING_SOON[kind].map((model) => (
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

      {/* Say it plainly. A reviewer who submits a video prompt and gets an
          unrelated clip should have been told first. */}
      {stubbed ? (
        <p className="mt-2.5 flex gap-2 rounded-xl border border-border-subtle bg-inset px-3 py-2 text-[11px] leading-relaxed text-text-secondary">
          <svg viewBox="0 0 24 24" aria-hidden className="mt-px size-3.5 shrink-0 text-brand" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 11v5M12 7.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>
            <strong className="font-medium text-text-primary">
              Video is simulated in this build.
            </strong>{" "}
            Generation runs the real pipeline — queue, polling, credits — but
            returns a pre-rendered clip instead of rendering your prompt.
          </span>
        </p>
      ) : null}
    </fieldset>
  );
}

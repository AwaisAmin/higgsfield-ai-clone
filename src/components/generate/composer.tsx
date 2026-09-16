"use client";

import type { GenKind } from "@prisma/client";
import { useEffect, useRef } from "react";

import {
  creditsFor,
  MAX_PROMPT_LENGTH,
  type AspectRatio,
  type ModelId,
} from "@/lib/credits";
import { presetBySlug } from "@/data/effects";
import { AspectRatioPicker } from "./aspect-ratio-picker";
import { ModelPicker } from "./model-picker";

const PLACEHOLDER: Record<GenKind, string> = {
  IMAGE:
    "A lone figure on a rain-slick Tokyo street at night, neon reflections in the puddles, anamorphic lens, 35mm",
  VIDEO:
    "Slow dolly through a neon-lit alley as rain falls, subject walking away from camera, steam rising from a grate",
};

export type ComposerState = {
  prompt: string;
  model: ModelId;
  aspectRatio: AspectRatio;
  /** Effects preset slug, video only. */
  preset: string | null;
};

export function Composer({
  state,
  onChange,
  onSubmit,
  credits,
  submitting,
  error,
  kind,
  // The composer is mounted twice — desktop column and mobile sheet — and only
  // one is visible at a time. They still coexist in the DOM, so the textarea id
  // must differ or the document carries duplicate ids and `label for` binds to
  // whichever came first.
  fieldId = "prompt",
}: {
  state: ComposerState;
  onChange: (next: Partial<ComposerState>) => void;
  onSubmit: () => void;
  credits: number;
  submitting: boolean;
  error: string | null;
  kind: GenKind;
  fieldId?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cost = creditsFor(state.model);

  // Auto-grow: reset to auto first so the box can shrink when text is deleted.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [state.prompt]);

  const preset = presetBySlug(state.preset);
  const trimmed = state.prompt.trim();
  const tooLong = trimmed.length > MAX_PROMPT_LENGTH;
  const broke = credits < cost;

  // A disabled button always says why. A dead control with no explanation is
  // the single most common way a product feels broken.
  const blockedReason = submitting
    ? "Starting…"
    : !trimmed
      ? "Write a prompt to get started"
      : tooLong
        ? `Prompt is ${trimmed.length} characters — the limit is ${MAX_PROMPT_LENGTH}`
        : broke
          ? `Not enough credits — this costs ${cost}, you have ${credits}`
          : null;

  const disabled = blockedReason !== null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label
          htmlFor={fieldId}
          className="mb-2 block font-mono text-xs tracking-tight text-text-tertiary uppercase"
        >
          Prompt
        </label>
        {/* A chosen preset is visible and removable — never a hidden modifier
            silently shaping the result. */}
        {preset ? (
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 py-1 pr-1 pl-2.5 text-xs text-brand">
              {preset.name}
              <button
                type="button"
                aria-label={`Remove ${preset.name} preset`}
                onClick={() => onChange({ preset: null })}
                className="grid size-4 place-items-center rounded-full transition-colors duration-200 ease-swift hover:bg-brand/20"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-2.5" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          </div>
        ) : null}

        <textarea
          id={fieldId}
          ref={textareaRef}
          rows={4}
          value={state.prompt}
          placeholder={PLACEHOLDER[kind]}
          onChange={(e) => onChange({ prompt: e.target.value })}
          onKeyDown={(e) => {
            // Cmd/Ctrl+Enter submits, the convention for a multi-line composer.
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !disabled) {
              e.preventDefault();
              onSubmit();
            }
          }}
          className="w-full resize-none rounded-2xl border border-border-default bg-inset px-4 py-3 text-sm leading-relaxed text-text-primary transition-colors duration-200 ease-swift placeholder:text-text-tertiary focus:border-brand focus:outline-none"
        />
        <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-text-tertiary">
          <span>⌘/Ctrl + Enter</span>
          <span className={tooLong ? "text-red-400" : undefined}>
            {trimmed.length}/{MAX_PROMPT_LENGTH}
          </span>
        </div>
      </div>

      <ModelPicker kind={kind} value={state.model} onChange={(model) => onChange({ model })} />

      <AspectRatioPicker
        value={state.aspectRatio}
        onChange={(aspectRatio) => onChange({ aspectRatio })}
      />

      <div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className={`w-full rounded-full px-5 py-3 text-sm font-medium transition-colors duration-200 ease-swift ${
            disabled
              ? "cursor-not-allowed bg-grey-450 text-text-tertiary"
              : "bg-brand text-on-brand hover:bg-brand-hover"
          }`}
        >
          {submitting ? "Starting…" : `Generate · ${cost} credits`}
        </button>

        {blockedReason && !submitting ? (
          <p className="mt-2 text-center text-xs text-text-secondary">
            {blockedReason}
            {broke && !tooLong && trimmed ? (
              <>
                {" · "}
                <a href="/pricing" className="text-brand hover:underline">
                  Get more
                </a>
              </>
            ) : null}
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mt-2 text-center text-xs text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

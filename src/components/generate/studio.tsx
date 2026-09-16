"use client";

import type { GenKind } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";

import { presetBySlug } from "@/data/effects";
import {
  creditsFor,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_MODEL,
  DEFAULT_VIDEO_ASPECT_RATIO,
  DEFAULT_VIDEO_MODEL,
  type AspectRatio,
  type ModelId,
} from "@/lib/credits";
import { notifyCreditsChanged } from "@/lib/credits-events";
import { isPending, type GenerationView } from "@/lib/generation-view";
import { useGenerationPoll } from "@/lib/use-generation-poll";
import { Composer, type ComposerState } from "./composer";
import { EmptyState } from "./empty-state";
import { Lightbox } from "./lightbox";
import { ResultCard } from "./result-card";

/**
 * The generation surface, shared by /ai/image and /ai/video.
 *
 * One component rather than two so the pages cannot drift apart: the layout,
 * the optimistic insert, the polling and the credit accounting are identical,
 * and only the model list, the defaults and the preset affordance vary by kind.
 */
export function Studio({
  kind,
  initialItems,
  initialCredits,
  initialPreset = null,
}: {
  kind: GenKind;
  initialItems: GenerationView[];
  initialCredits: number;
  /** Preset slug arriving from /effects via ?preset=. */
  initialPreset?: string | null;
}) {
  const isVideo = kind === "VIDEO";
  const [items, setItems] = useState<GenerationView[]>(initialItems);
  const [credits, setCredits] = useState(initialCredits);
  const [composer, setComposer] = useState<ComposerState>(() => {
    const preset = isVideo ? presetBySlug(initialPreset) : null;
    return {
      prompt: preset?.prompt ?? "",
      model: isVideo ? DEFAULT_VIDEO_MODEL : DEFAULT_MODEL,
      aspectRatio: isVideo ? DEFAULT_VIDEO_ASPECT_RATIO : DEFAULT_ASPECT_RATIO,
      preset: preset?.slug ?? null,
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Only real rows are polled; an optimistic card has no server id yet.
  const pendingIds = useMemo(
    () => items.filter((i) => !i.optimistic && isPending(i)).map((i) => i.id),
    [items],
  );

  /** Pull the authoritative balance and tell the header chip about it. */
  const refreshCredits = useCallback(async () => {
    try {
      const response = await fetch("/api/credits", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { credits: number };
      setCredits(data.credits);
      notifyCreditsChanged(data.credits);
    } catch {
      // Leave the optimistic figure in place; the next event will correct it.
    }
  }, []);

  const handlePollUpdate = useCallback(
    (incoming: GenerationView) => {
      setItems((current) => {
        const existing = current.find((i) => i.id === incoming.id);
        if (!existing) return current;
        if (existing.status === incoming.status && existing.isPublic === incoming.isPublic) {
          return current;
        }
        // A generation that just failed was refunded server-side, so the
        // balance on screen is stale the moment we see the status change.
        if (incoming.status === "FAILED") void refreshCredits();
        return current.map((i) => (i.id === incoming.id ? { ...i, ...incoming } : i));
      });
    },
    [refreshCredits],
  );

  useGenerationPoll(pendingIds, handlePollUpdate);

  const submit = useCallback(async () => {
    const prompt = composer.prompt.trim();
    if (!prompt || submitting) return;

    const cost = creditsFor(composer.model);
    const tempId = `optimistic-${Date.now()}`;
    const optimistic: GenerationView = {
      id: tempId,
      kind,
      preset: composer.preset,
      prompt,
      model: composer.model,
      aspectRatio: composer.aspectRatio,
      status: "QUEUED",
      resultUrl: null,
      thumbnailUrl: null,
      error: null,
      creditsSpent: cost,
      isPublic: true,
      createdAt: new Date().toISOString(),
      completedAt: null,
      optimistic: true,
    };

    // Insert and charge locally before the request leaves — the grid must react
    // to the click, not to the round trip.
    setItems((current) => [optimistic, ...current]);
    setCredits((c) => c - cost);
    notifyCreditsChanged(credits - cost);
    setSubmitting(true);
    setSubmitError(null);
    setSheetOpen(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: composer.model,
          aspectRatio: composer.aspectRatio,
          preset: composer.preset,
        }),
      });

      const data = (await response.json()) as {
        id?: string;
        error?: string;
        issues?: Array<{ message: string }>;
      };

      if (!response.ok || !data.id) {
        // Roll the optimistic card and the optimistic charge back.
        setItems((current) => current.filter((i) => i.id !== tempId));
        setSubmitError(data.issues?.[0]?.message ?? data.error ?? "Could not start the generation.");
        await refreshCredits();
        return;
      }

      // Swap the placeholder for the real row so polling can pick it up.
      setItems((current) =>
        current.map((i) =>
          i.id === tempId ? { ...i, id: data.id!, optimistic: false } : i,
        ),
      );
      setComposer((c) => ({ ...c, prompt: "" }));
      await refreshCredits();
    } catch {
      setItems((current) => current.filter((i) => i.id !== tempId));
      setSubmitError("Network error — nothing was charged.");
      await refreshCredits();
    } finally {
      setSubmitting(false);
    }
  }, [composer, credits, kind, refreshCredits, submitting]);

  const retry = useCallback((generation: GenerationView) => {
    setComposer({
      prompt: generation.prompt,
      model: generation.model as ModelId,
      aspectRatio: generation.aspectRatio as AspectRatio,
      preset: generation.preset,
    });
    setSheetOpen(true);
    // Focus whichever composer is actually on screen at this breakpoint.
    requestAnimationFrame(() => {
      for (const id of ["prompt-desktop", "prompt-mobile"]) {
        const el = document.getElementById(id);
        if (el && el.offsetParent !== null) {
          el.focus();
          return;
        }
      }
    });
  }, []);

  const onVisibilityChange = useCallback((id: string, isPublic: boolean) => {
    setItems((current) => current.map((i) => (i.id === id ? { ...i, isPublic } : i)));
  }, []);

  const open = items.find((i) => i.id === openId) ?? null;

  const renderComposer = (fieldId: string) => (
    <Composer
      kind={kind}
      fieldId={fieldId}
      state={composer}
      onChange={(next) => setComposer((c) => ({ ...c, ...next }))}
      onSubmit={submit}
      credits={credits}
      submitting={submitting}
      error={submitError}
    />
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <div className="flex gap-8 py-8">
        {/* Desktop: fixed composer column. Sticky under the 52px header. */}
        <aside className="hidden w-[380px] shrink-0 lg:block">
          <div className="sticky top-[68px] rounded-3xl border border-border-subtle bg-panel p-5">
            {renderComposer("prompt-desktop")}
          </div>
        </aside>

        <section className="min-w-0 flex-1 pb-32 lg:pb-0">
          <div className="mb-5 flex items-baseline justify-between">
            <h1 className="font-display text-2xl tracking-tight text-text-primary">
              {isVideo ? "Video" : "Image"}
            </h1>
            <span className="font-mono text-xs text-text-tertiary">
              {items.length} {items.length === 1 ? "generation" : "generations"}
            </span>
          </div>

          {items.length === 0 ? (
            <EmptyState
              kind={kind}
              onPick={(prompt) => {
                setComposer((c) => ({ ...c, prompt }));
                setSheetOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((generation) => (
                <ResultCard
                  key={generation.id}
                  generation={generation}
                  onOpen={(g) => setOpenId(g.id)}
                  onRetry={retry}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile: the composer is a bottom sheet. */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        {sheetOpen ? (
          <div
            className="fixed inset-0 -z-10 bg-grey-600/60"
            onClick={() => setSheetOpen(false)}
          />
        ) : null}

        <div className="glass max-h-[85vh] overflow-y-auto rounded-t-3xl border-x-0 border-b-0 px-4 pt-3 pb-5">
          <button
            type="button"
            onClick={() => setSheetOpen((v) => !v)}
            aria-expanded={sheetOpen}
            className="mx-auto mb-3 block w-full"
          >
            <span aria-hidden className="mx-auto mb-2 block h-1 w-10 rounded-full bg-border-strong" />
            <span className="text-xs text-text-secondary">
              {sheetOpen ? "Hide composer" : "Tap to write a prompt"}
            </span>
          </button>

          {sheetOpen ? (
            renderComposer("prompt-mobile")
          ) : (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-medium text-on-brand"
            >
              Generate · {creditsFor(composer.model)} credits
            </button>
          )}
        </div>
      </div>

      {open && open.status === "SUCCEEDED" ? (
        <Lightbox
          generation={open}
          onClose={() => setOpenId(null)}
          onVisibilityChange={onVisibilityChange}
        />
      ) : null}
    </div>
  );
}

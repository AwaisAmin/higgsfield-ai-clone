"use client";

import { useEffect, useState } from "react";

import { MODELS, type ModelId } from "@/lib/credits";
import type { GenerationView } from "@/lib/generation-view";

function modelLabel(model: string) {
  return MODELS[model as ModelId]?.label ?? model;
}

export function Lightbox({
  generation,
  onClose,
  onVisibilityChange,
}: {
  generation: GenerationView;
  onClose: () => void;
  onVisibilityChange: (id: string, isPublic: boolean) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const download = async () => {
    if (!generation.resultUrl) return;
    setDownloading(true);
    try {
      // Fetch to a blob rather than using <a download> directly: the anchor's
      // download attribute is ignored cross-origin, so it would navigate to the
      // image instead of saving it.
      const response = await fetch(generation.resultUrl);
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `higgsfield-${generation.id.slice(0, 8)}.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
    } catch {
      // CORS refused the blob read — opening the image is the honest fallback.
      window.open(generation.resultUrl, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  };

  const toggleVisibility = async () => {
    setSaving(true);
    const next = !generation.isPublic;
    try {
      const response = await fetch(`/api/generations/${generation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      if (response.ok) onVisibilityChange(generation.id, next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generation detail"
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8"
    >
      <div
        className="absolute inset-0 bg-grey-600/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="glass relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl lg:flex-row">
        <div className="flex min-h-0 flex-1 items-center justify-center bg-grey-600/40 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- see ResultCard */}
          <img
            src={generation.resultUrl ?? ""}
            alt={generation.prompt}
            className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain lg:max-h-[75vh]"
          />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-5 overflow-y-auto p-6 lg:w-80">
          <div>
            <h2 className="font-mono text-xs tracking-tight text-text-tertiary uppercase">
              Prompt
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">
              {generation.prompt}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-text-tertiary">Model</dt>
              <dd className="mt-1 font-mono text-text-primary">
                {modelLabel(generation.model)}
              </dd>
            </div>
            <div>
              <dt className="text-text-tertiary">Aspect ratio</dt>
              <dd className="mt-1 font-mono text-text-primary">
                {generation.aspectRatio}
              </dd>
            </div>
            <div>
              <dt className="text-text-tertiary">Credits</dt>
              <dd className="mt-1 font-mono text-text-primary">
                {generation.creditsSpent}
              </dd>
            </div>
            <div>
              <dt className="text-text-tertiary">Created</dt>
              <dd className="mt-1 font-mono text-text-primary">
                {new Date(generation.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>

          <div className="flex items-center justify-between rounded-xl border border-border-default bg-inset px-3 py-2.5">
            <div>
              <div className="text-sm text-text-primary">
                {generation.isPublic ? "Public" : "Private"}
              </div>
              <div className="text-xs text-text-tertiary">
                {generation.isPublic
                  ? "Visible in the community feed"
                  : "Only you can see this"}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={generation.isPublic}
              aria-label="Public"
              disabled={saving}
              onClick={toggleVisibility}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-swift disabled:opacity-50 ${
                generation.isPublic ? "bg-brand" : "bg-grey-450"
              }`}
            >
              <span
                className={`absolute top-1 size-4 rounded-full bg-grey-050 transition-[left] duration-200 ease-emphasized ${
                  generation.isPublic ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="mt-auto flex gap-2">
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              className="flex-1 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover disabled:opacity-60"
            >
              {downloading ? "Downloading…" : "Download"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border-strong px-4 py-2.5 text-sm text-text-primary transition-colors duration-200 ease-swift hover:bg-panel-raised"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

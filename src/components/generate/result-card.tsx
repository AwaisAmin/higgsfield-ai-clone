"use client";

import { useEffect, useRef, useState } from "react";

import { isPending, type GenerationView } from "@/lib/generation-view";

function ratioStyle(aspectRatio: string) {
  const [w, h] = aspectRatio.split(":").map(Number);
  return { aspectRatio: `${w || 1} / ${h || 1}` };
}

/**
 * Video result. Plays muted on hover, never off-screen.
 *
 * A grid of a dozen autoplaying videos will saturate the decoder and the
 * network, so an IntersectionObserver gates the whole thing: off-screen cards
 * do not even fetch (`preload="none"`), and one that scrolls away is paused and
 * rewound rather than left running behind the viewport.
 */
function VideoResult({ generation }: { generation: GenerationView }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting) {
          el.pause();
          el.currentTime = 0;
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      poster={generation.thumbnailUrl ?? undefined}
      src={generation.resultUrl ?? undefined}
      muted
      loop
      playsInline
      preload={inView ? "metadata" : "none"}
      onMouseEnter={() => {
        if (inView) void videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        const el = videoRef.current;
        if (!el) return;
        el.pause();
        el.currentTime = 0;
      }}
      className="size-full object-cover"
    />
  );
}

export function ResultCard({
  generation,
  onOpen,
  onRetry,
}: {
  generation: GenerationView;
  onOpen: (generation: GenerationView) => void;
  onRetry: (generation: GenerationView) => void;
}) {
  const pending = isPending(generation) || generation.optimistic;

  if (pending) {
    return (
      <div
        style={ratioStyle(generation.aspectRatio)}
        className="relative flex flex-col justify-end overflow-hidden rounded-2xl border border-border-subtle bg-panel p-4"
      >
        <div
          aria-hidden
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-grey-050/[0.06] via-transparent to-grey-050/[0.03]"
        />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-brand" />
            <span className="font-mono text-[11px] tracking-tight text-brand uppercase">
              {generation.optimistic ? "Submitting" : generation.status}
            </span>
          </div>
          <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">
            {generation.prompt}
          </p>
        </div>
      </div>
    );
  }

  if (generation.status === "FAILED") {
    return (
      <div
        style={ratioStyle(generation.aspectRatio)}
        className="flex flex-col justify-between overflow-hidden rounded-2xl border border-red-500/30 bg-panel p-4"
      >
        <div>
          <span className="font-mono text-[11px] tracking-tight text-red-400 uppercase">
            Failed
          </span>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-secondary">
            {generation.prompt}
          </p>
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-red-400/90">
            {generation.error ?? "Something went wrong."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRetry(generation)}
          className="mt-3 self-start rounded-full border border-border-strong px-3 py-1.5 text-xs text-text-primary transition-colors duration-200 ease-swift hover:bg-panel-raised"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(generation)}
      style={ratioStyle(generation.aspectRatio)}
      className="group relative block w-full overflow-hidden rounded-2xl border border-border-subtle bg-panel transition-colors duration-200 ease-swift hover:border-border-strong"
    >
      {generation.kind === "VIDEO" ? (
        <VideoResult generation={generation} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- fal's CDN is not
           in next.config images.remotePatterns, and the URL host can change per
           result; a plain img avoids a whole class of runtime 500s here. */
        <img
          src={generation.thumbnailUrl ?? generation.resultUrl ?? ""}
          alt={generation.prompt}
          loading="lazy"
          className="size-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-grey-600/90 to-transparent p-3 opacity-0 transition-opacity duration-200 ease-swift group-hover:opacity-100">
        <p className="line-clamp-2 text-left text-xs text-grey-100">
          {generation.prompt}
        </p>
      </div>

      {generation.kind === "VIDEO" ? (
        <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-grey-600/70 px-2 py-0.5 font-mono text-[9px] tracking-tight text-grey-150 uppercase backdrop-blur-sm">
          Video
        </span>
      ) : null}

      {!generation.isPublic ? (
        <span className="absolute top-2 right-2 rounded-full bg-grey-600/70 px-2 py-0.5 font-mono text-[9px] tracking-tight text-grey-150 uppercase backdrop-blur-sm">
          Private
        </span>
      ) : null}
    </button>
  );
}

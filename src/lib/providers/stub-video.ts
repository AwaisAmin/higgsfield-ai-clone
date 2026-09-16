import "server-only";

import type {
  GenerationProvider,
  ProviderResult,
  ProviderStatus,
  ProviderSubmitInput,
} from "./types";

/**
 * Stubbed video provider.
 *
 * Real video generation is minutes of GPU time and dollars per clip, which is
 * not a sensible thing to wire into a one-day build. So this fakes the
 * PROVIDER and nothing else: it moves through the same queue states on the same
 * timings a real model would, and everything upstream — the Generation row, the
 * status transitions, the polling, the credit debit and refund — is the exact
 * code path images use. Only this file is pretend.
 *
 * It resolves to pre-rendered clips from Higgsfield's own CDN, so the output is
 * real video rather than a placeholder rectangle. The clip is chosen by hashing
 * the request id, which keeps a given generation stable across polls.
 *
 * This is surfaced to users, not hidden: see the notice in the video composer
 * and the README. Replacing it means implementing GenerationProvider against a
 * real model and changing one line in ./index.ts.
 */

/** Pre-rendered clips lifted from higgsfield.ai on 2026-09-16. */
const CLIP_POOL = [
  {
    url: "https://cdn.higgsfield.ai/card/8b8270cd-dc63-4a34-88e7-3277536987fb.mp4",
    posterUrl: "https://cdn.higgsfield.ai/card/a8d8030f-9cc9-47ad-a266-e0d3708d2126.webp",
  },
  {
    url: "https://cdn.higgsfield.ai/card/31293efb-7438-41c9-84cc-8bc820ce39b6.mp4",
    posterUrl: "https://cdn.higgsfield.ai/card/5fba4d2a-1023-4bd1-9d7a-e2faaf8a21d1.webp",
  },
  {
    url: "https://cdn.higgsfield.ai/card/16eebc9a-8310-4f68-8a02-1e2e6f109169.mp4",
    posterUrl: "https://cdn.higgsfield.ai/card/9c6affe8-03a8-4434-97ef-2fc476f7a71e.webp",
  },
  {
    url: "https://cdn.higgsfield.ai/card/4da5ce4e-8483-4471-9564-0907b394d3e0.mp4",
    posterUrl: "https://cdn.higgsfield.ai/card/f11a402b-0e0e-43cc-90e5-f6cc39352123.webp",
  },
  {
    url: "https://cdn.higgsfield.ai/card/f155252f-83ad-46c3-b484-728f6292e00d.mp4",
    posterUrl: "https://cdn.higgsfield.ai/card/25341b90-c34e-4cc3-97d8-fa45c693f5b5.webp",
  },
] as const;

/** Stable clip choice: the same prompt and preset always resolve to the same
 *  clip, so re-running a preset does not shuffle the result under the user. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Realistic queue behaviour: a beat in the queue, then a few seconds running. */
const QUEUE_MS = 2000;
const TOTAL_MIN_MS = 6000;
const TOTAL_MAX_MS = 10_000;

type StubJob = {
  startedAt: number;
  totalMs: number;
  clipIndex: number;
};

/**
 * In-memory job table.
 *
 * A serverless deployment can serve two polls from two different instances, and
 * this map does not survive that. It is acceptable here only because the job
 * state is fully derivable: the request id encodes the start time and duration,
 * so a cold instance reconstructs the job instead of losing it. See parseId.
 */
const jobs = new Map<string, StubJob>();

function makeId(job: StubJob): string {
  return `stub_${job.startedAt}_${job.totalMs}_${job.clipIndex}`;
}

function parseId(requestId: string): StubJob | null {
  const parts = requestId.split("_");
  if (parts.length !== 4 || parts[0] !== "stub") return null;
  const [, startedAt, totalMs, clipIndex] = parts.map(Number);
  if (!Number.isFinite(startedAt) || !Number.isFinite(totalMs)) return null;
  return { startedAt, totalMs, clipIndex };
}

function jobFor(requestId: string): StubJob | null {
  return jobs.get(requestId) ?? parseId(requestId);
}

export const stubVideoProvider: GenerationProvider = {
  name: "stub-video",

  async submit(input: ProviderSubmitInput): Promise<string> {
    const totalMs =
      TOTAL_MIN_MS + Math.floor(Math.random() * (TOTAL_MAX_MS - TOTAL_MIN_MS));
    const job: StubJob = {
      startedAt: Date.now(),
      totalMs,
      clipIndex: hash(`${input.preset ?? ""}|${input.prompt}`) % CLIP_POOL.length,
    };
    const id = makeId(job);
    jobs.set(id, job);
    return id;
  },

  async status(_model, requestId): Promise<ProviderStatus> {
    const job = jobFor(requestId);
    if (!job) return "COMPLETED"; // unknown id: let result() decide the failure
    const elapsed = Date.now() - job.startedAt;
    if (elapsed < QUEUE_MS) return "IN_QUEUE";
    if (elapsed < job.totalMs) return "IN_PROGRESS";
    return "COMPLETED";
  },

  async result(_model, requestId): Promise<ProviderResult> {
    const job = jobFor(requestId);
    if (!job) {
      throw new Error("Unknown stub request — the job could not be recovered.");
    }
    const clip = CLIP_POOL[job.clipIndex % CLIP_POOL.length];
    return { url: clip.url, posterUrl: clip.posterUrl };
  },
};

import type { Generation } from "@prisma/client";

/**
 * The client-side shape of a generation.
 *
 * Dates are ISO strings so a row from the server component and a row parsed
 * from the JSON API are the same type — otherwise half the app handles `Date`
 * and the other half handles `string`, and the difference surfaces as a
 * runtime crash in a formatter.
 *
 * `optimistic` marks a card that exists only in the browser: inserted on submit
 * so the grid reacts instantly, replaced by the real row once POST returns.
 */
export type GenerationView = {
  id: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";
  resultUrl: string | null;
  thumbnailUrl: string | null;
  error: string | null;
  creditsSpent: number;
  isPublic: boolean;
  createdAt: string;
  completedAt: string | null;
  optimistic?: boolean;
};

export function toGenerationView(row: Generation): GenerationView {
  return {
    id: row.id,
    prompt: row.prompt,
    model: row.model,
    aspectRatio: row.aspectRatio,
    status: row.status,
    resultUrl: row.resultUrl,
    thumbnailUrl: row.thumbnailUrl,
    error: row.error,
    creditsSpent: row.creditsSpent,
    isPublic: row.isPublic,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

export const PENDING_STATUSES: ReadonlySet<GenerationView["status"]> = new Set([
  "QUEUED",
  "RUNNING",
]);

export function isPending(generation: GenerationView): boolean {
  return PENDING_STATUSES.has(generation.status);
}

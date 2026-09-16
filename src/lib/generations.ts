import "server-only";

import type { Generation } from "@prisma/client";

import { creditsFor, type AspectRatio, type ModelId, MODELS } from "./credits";
import {
  getGenerationResult,
  getGenerationStatus,
  submitGeneration,
} from "./fal";
import { prisma } from "./prisma";

/**
 * Generation service.
 *
 * Deliberately separate from the route handlers: the routes do auth, parsing
 * and HTTP status codes, and everything below is plain functions over a userId.
 * That keeps the pipeline testable from a script without minting a session.
 *
 * KNOWN TRADEOFF — result URLs are fal's, stored as-is.
 * We persist the URL fal hands back instead of mirroring the bytes into blob
 * storage. If fal expires or rotates those URLs, every image in the library
 * breaks retroactively, and the library is the part of the product users come
 * back for. The fix is to copy the file to our own storage on completion (in
 * syncGeneration, where resultUrl is written) and store that URL instead.
 * Not worth the time today; it is a demo, and it is one function to change.
 */

export class InsufficientCreditsError extends Error {
  constructor(
    readonly required: number,
    readonly available: number,
  ) {
    super(`Need ${required} credits, balance is ${available}.`);
    this.name = "InsufficientCreditsError";
  }
}

export type CreateGenerationInput = {
  prompt: string;
  aspectRatio: AspectRatio;
  model: ModelId;
};

export async function createGeneration(
  userId: string,
  input: CreateGenerationInput,
): Promise<Generation> {
  const cost = creditsFor(input.model);

  // Charge first, with the balance check inside the same statement. A read-then-
  // write would let two concurrent requests both pass a `credits >= cost` check
  // and overdraw the account; `updateMany` with the predicate in the WHERE makes
  // the check and the debit a single atomic operation.
  const debited = await prisma.user.updateMany({
    where: { id: userId, credits: { gte: cost } },
    data: { credits: { decrement: cost } },
  });

  if (debited.count === 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    throw new InsufficientCreditsError(cost, user?.credits ?? 0);
  }

  const generation = await prisma.generation.create({
    data: {
      userId,
      kind: MODELS[input.model].kind,
      model: input.model,
      prompt: input.prompt,
      aspectRatio: input.aspectRatio,
      status: "QUEUED",
      creditsSpent: cost,
    },
  });

  try {
    const requestId = await submitGeneration(input);
    return await prisma.generation.update({
      where: { id: generation.id },
      data: { requestId },
    });
  } catch (error) {
    // The credits are already gone; a submit that never landed must give them
    // back or the user paid for nothing.
    await failGeneration(generation.id, describeError(error));
    throw error;
  }
}

/**
 * Read a generation, advancing it from fal if it is still in flight.
 * Returns null when the row does not exist or belongs to someone else — the
 * caller cannot distinguish the two, which is the point.
 */
export async function syncGeneration(
  userId: string,
  id: string,
): Promise<Generation | null> {
  const generation = await prisma.generation.findFirst({
    where: { id, userId },
  });

  if (!generation) return null;
  if (generation.status === "SUCCEEDED" || generation.status === "FAILED") {
    return generation;
  }
  if (!generation.requestId) return generation;

  const model = generation.model as ModelId;

  let status: Awaited<ReturnType<typeof getGenerationStatus>>;
  try {
    status = await getGenerationStatus(model, generation.requestId);
  } catch (error) {
    // A status call that fails is not proof the generation failed — the network
    // may simply be unhappy. Report the row as-is and let the next poll decide.
    console.error(`[generations] status check failed for ${id}:`, error);
    return generation;
  }

  if (status === "IN_QUEUE") return generation;

  if (status === "IN_PROGRESS") {
    if (generation.status === "RUNNING") return generation;
    return prisma.generation.update({
      where: { id },
      data: { status: "RUNNING" },
    });
  }

  // COMPLETED. fal has no FAILED queue status: a failed run surfaces as a throw
  // when the result is fetched.
  try {
    const { imageUrl } = await getGenerationResult(model, generation.requestId);
    if (!imageUrl) {
      return failGeneration(id, "Provider returned no image.");
    }

    return await prisma.generation.update({
      where: { id },
      data: {
        status: "SUCCEEDED",
        resultUrl: imageUrl,
        // No separate thumbnail pipeline yet; the full image doubles as one.
        thumbnailUrl: imageUrl,
        completedAt: new Date(),
        error: null,
      },
    });
  } catch (error) {
    return failGeneration(id, describeError(error));
  }
}

/**
 * Mark a generation failed and refund what it cost. Idempotent: a row already
 * marked FAILED is left alone, so a double poll cannot refund twice.
 */
export async function failGeneration(
  id: string,
  message: string,
): Promise<Generation> {
  return prisma.$transaction(async (tx) => {
    const current = await tx.generation.findUniqueOrThrow({ where: { id } });
    if (current.status === "FAILED") return current;

    if (current.creditsSpent > 0) {
      await tx.user.update({
        where: { id: current.userId },
        data: { credits: { increment: current.creditsSpent } },
      });
    }

    return tx.generation.update({
      where: { id },
      data: {
        status: "FAILED",
        error: message.slice(0, 500),
        completedAt: new Date(),
        // Refunded, so nothing was actually spent.
        creditsSpent: 0,
      },
    });
  });
}

export type GenerationPage = {
  items: Generation[];
  nextCursor: string | null;
};

/** The user's own generations, newest first, cursor-paginated. */
export async function listGenerations(
  userId: string,
  { limit, cursor }: { limit: number; cursor?: string },
): Promise<GenerationPage> {
  // Fetch one extra to learn whether another page exists without a count query.
  const rows = await prisma.generation.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const items = rows.slice(0, limit);
  return {
    items,
    nextCursor: rows.length > limit ? (items.at(-1)?.id ?? null) : null,
  };
}

/**
 * Turn a provider error into something worth showing a user.
 *
 * fal's ApiError carries the useful sentence in `body.detail` while `message`
 * is just the HTTP reason — a failed card that says "Forbidden" tells nobody
 * anything, where "Exhausted balance. Top up..." is actionable.
 */
function describeError(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const body = (error as { body?: unknown }).body;
    if (body && typeof body === "object") {
      const detail = (body as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail.trim()) return detail;
      // Validation errors come back as a list of {msg, loc}.
      if (Array.isArray(detail)) {
        const msgs = detail
          .map((d) => (d && typeof d === "object" ? (d as { msg?: string }).msg : null))
          .filter((m): m is string => Boolean(m));
        if (msgs.length) return msgs.join("; ");
      }
    }
  }

  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown provider error.";
  }
}

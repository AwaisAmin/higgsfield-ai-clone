import type { AspectRatio, ModelId } from "../credits";

/**
 * The contract every generation backend implements.
 *
 * The API routes and the generation service talk to this and nothing else, so
 * they never learn whether a job is going to fal, to a stub, or to whatever
 * replaces either. Swapping the stubbed video provider for a real model is a
 * change to one file in this directory.
 *
 * The shape is queue-first on purpose: submit returns a handle immediately and
 * completion is polled. A provider that is actually synchronous still has to
 * present that interface (the stub does), because the alternative is holding a
 * serverless function open for the length of a render.
 */

export type ProviderSubmitInput = {
  model: ModelId;
  prompt: string;
  aspectRatio: AspectRatio;
  /** Effects preset slug, video only. */
  preset?: string | null;
};

/** Mirrors fal's queue vocabulary; every provider maps onto these three. */
export type ProviderStatus = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";

export type ProviderResult = {
  /** The finished asset: an image URL or a video URL. */
  url: string | null;
  /** Poster frame for video; null for images, where the asset is its own poster. */
  posterUrl?: string | null;
};

export interface GenerationProvider {
  /** Stable identifier, for logs and debugging. */
  readonly name: string;

  /** Enqueue and return a request handle. Must not wait for completion. */
  submit(input: ProviderSubmitInput): Promise<string>;

  /** Current state of a previously submitted request. */
  status(model: ModelId, requestId: string): Promise<ProviderStatus>;

  /**
   * Fetch a completed result. Throws when the job failed — that throw is what
   * drives the FAILED status and the credit refund upstream.
   */
  result(model: ModelId, requestId: string): Promise<ProviderResult>;
}

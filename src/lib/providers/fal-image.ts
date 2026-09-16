import "server-only";

import { fal } from "@fal-ai/client";

import type { AspectRatio, ModelId } from "../credits";
import type {
  GenerationProvider,
  ProviderResult,
  ProviderStatus,
  ProviderSubmitInput,
} from "./types";

/**
 * fal.ai image provider.
 *
 * FAL_KEY is read here and nowhere else, and this module is server-only — the
 * key must never reach the client bundle. The `server-only` import turns a
 * mistaken client import into a build error rather than a leaked credential.
 */

let configured = false;

/**
 * Configure on first use, not at import.
 *
 * A top-level throw here breaks `next build` outright: Next imports every route
 * module to collect page data, so a missing key took down routes that never
 * touch fal — listing generations, for one. Failing at the call site keeps the
 * blast radius to the operation that actually needs the credential.
 */
function client() {
  if (!configured) {
    const key = process.env.FAL_KEY;
    if (!key) {
      throw new Error(
        "FAL_KEY is not set. Add it to .env — see .env.example. Server-side only.",
      );
    }
    fal.config({ credentials: key });
    configured = true;
  }
  return fal;
}

/** Our aspect ratios mapped onto flux's named sizes. */
const IMAGE_SIZE = {
  "1:1": "square_hd",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
  "4:3": "landscape_4_3",
  "3:4": "portrait_4_3",
} as const satisfies Record<AspectRatio, string>;

export const falImageProvider: GenerationProvider = {
  name: "fal-image",

  async submit({ model, prompt, aspectRatio }: ProviderSubmitInput): Promise<string> {
    const { request_id } = await client().queue.submit(model, {
      input: {
        prompt,
        image_size: IMAGE_SIZE[aspectRatio],
        num_images: 1,
        // schnell is a four-step model; more steps buy nothing here.
        num_inference_steps: 4,
        enable_safety_checker: true,
      },
    });
    return request_id;
  },

  async status(model: ModelId, requestId: string): Promise<ProviderStatus> {
    const status = await client().queue.status(model, { requestId });
    return status.status;
  },

  /**
   * Throws if fal reports the request failed, which is how a failed generation
   * surfaces — there is no FAILED queue status.
   */
  async result(model: ModelId, requestId: string): Promise<ProviderResult> {
    const { data } = await client().queue.result(model, { requestId });
    const images = (data as { images?: Array<{ url?: string }> }).images ?? [];
    return { url: images[0]?.url ?? null, posterUrl: null };
  },
};

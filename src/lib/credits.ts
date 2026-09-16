import type { GenKind } from "@prisma/client";

/**
 * The single source of truth for what a generation costs.
 *
 * Both the API and the UI import from here. If the price ever lives in two
 * places, the button will promise one number while the ledger charges another,
 * and users will be right to be annoyed.
 */

export type ModelId = "fal-ai/flux/schnell";

export type ModelSpec = {
  id: ModelId;
  label: string;
  kind: GenKind;
  /** Credits charged per generation. */
  credits: number;
  description: string;
};

export const MODELS = {
  "fal-ai/flux/schnell": {
    id: "fal-ai/flux/schnell",
    label: "FLUX.1 [schnell]",
    kind: "IMAGE",
    credits: 4,
    description: "Four-step image model. Fast and cheap.",
  },
} as const satisfies Record<ModelId, ModelSpec>;

export const MODEL_IDS = Object.keys(MODELS) as [ModelId, ...ModelId[]];

export const DEFAULT_MODEL: ModelId = "fal-ai/flux/schnell";

export function creditsFor(model: ModelId): number {
  return MODELS[model].credits;
}

export function isModelId(value: string): value is ModelId {
  return value in MODELS;
}

/**
 * Aspect ratios we offer. The provider-specific translation lives in
 * src/lib/fal.ts -- this list is product vocabulary, not fal's.
 */
export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const DEFAULT_ASPECT_RATIO: AspectRatio = "1:1";

/** Credits granted to a new account. Mirrored by User.credits in the schema. */
export const STARTING_CREDITS = 100;

export const MAX_PROMPT_LENGTH = 1000;

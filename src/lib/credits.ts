import type { GenKind } from "@prisma/client";

/**
 * The single source of truth for what a generation costs.
 *
 * Both the API and the UI import from here. If the price ever lives in two
 * places, the button will promise one number while the ledger charges another,
 * and users will be right to be annoyed.
 */

export type ModelId = "fal-ai/flux/schnell" | "higgsfield/stub-video";

export type ModelSpec = {
  id: ModelId;
  label: string;
  kind: GenKind;
  /** Credits charged per generation. */
  credits: number;
  description: string;
  /**
   * True when the output is simulated rather than generated. Surfaced in the
   * UI — see the notice in the video composer. Never hide this.
   */
  stubbed?: boolean;
};

export const MODELS = {
  "fal-ai/flux/schnell": {
    id: "fal-ai/flux/schnell",
    label: "FLUX.1 [schnell]",
    kind: "IMAGE",
    credits: 4,
    description: "Four-step image model. Fast and cheap.",
  },
  "higgsfield/stub-video": {
    id: "higgsfield/stub-video",
    label: "Higgsfield Motion",
    kind: "VIDEO",
    credits: 12,
    description:
      "Simulated in this build — runs the real pipeline and returns a pre-rendered clip.",
    stubbed: true,
  },
} as const satisfies Record<ModelId, ModelSpec>;

export const MODEL_IDS = Object.keys(MODELS) as [ModelId, ...ModelId[]];

export const DEFAULT_MODEL: ModelId = "fal-ai/flux/schnell";
export const DEFAULT_VIDEO_MODEL: ModelId = "higgsfield/stub-video";

export function creditsFor(model: ModelId): number {
  return MODELS[model].credits;
}

export function isModelId(value: string): value is ModelId {
  return value in MODELS;
}

export function modelsOfKind(kind: GenKind): ModelSpec[] {
  return Object.values(MODELS).filter((m) => m.kind === kind);
}

/**
 * Aspect ratios we offer. The provider-specific translation lives with each
 * provider -- this list is product vocabulary.
 */
export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const DEFAULT_ASPECT_RATIO: AspectRatio = "1:1";
/** Video defaults to vertical — the format the presets are cut for. */
export const DEFAULT_VIDEO_ASPECT_RATIO: AspectRatio = "9:16";

/** Credits granted to a new account. Mirrored by User.credits in the schema. */
export const STARTING_CREDITS = 100;

export const MAX_PROMPT_LENGTH = 1000;

import { z } from "zod";

import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_MODEL,
  MAX_PROMPT_LENGTH,
  MODEL_IDS,
} from "./credits";
import { presetBySlug } from "@/data/effects";

/** Body of POST /api/generate. */
export const generateRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt cannot be empty.")
    .max(MAX_PROMPT_LENGTH, `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`),
  aspectRatio: z.enum(ASPECT_RATIOS).default(DEFAULT_ASPECT_RATIO),
  model: z.enum(MODEL_IDS).default(DEFAULT_MODEL),
  // Effects preset slug, video only. Unknown slugs are rejected rather than
  // silently dropped, so a bad link fails loudly instead of generating
  // something the user did not ask for.
  preset: z
    .string()
    .refine((slug) => presetBySlug(slug) !== null, "Unknown effects preset.")
    .nullish(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

/** Query of GET /api/generations. */
export const listGenerationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).optional(),
  kind: z.enum(["IMAGE", "VIDEO"]).optional(),
});

/** Body of PATCH /api/generations/[id]. */
export const updateGenerationSchema = z.object({
  isPublic: z.boolean(),
});

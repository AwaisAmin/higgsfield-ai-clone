import { z } from "zod";

import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_MODEL,
  MAX_PROMPT_LENGTH,
  MODEL_IDS,
} from "./credits";

/** Body of POST /api/generate. */
export const generateRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt cannot be empty.")
    .max(MAX_PROMPT_LENGTH, `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`),
  aspectRatio: z.enum(ASPECT_RATIOS).default(DEFAULT_ASPECT_RATIO),
  model: z.enum(MODEL_IDS).default(DEFAULT_MODEL),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

/** Query of GET /api/generations. */
export const listGenerationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).optional(),
});

/** Body of PATCH /api/generations/[id]. */
export const updateGenerationSchema = z.object({
  isPublic: z.boolean(),
});

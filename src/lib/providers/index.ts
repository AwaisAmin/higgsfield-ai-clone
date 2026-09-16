import "server-only";

import { MODELS, type ModelId, type ModelSpec } from "../credits";
import { falImageProvider } from "./fal-image";
import { stubVideoProvider } from "./stub-video";
import type { GenerationProvider } from "./types";

export type { GenerationProvider, ProviderResult, ProviderStatus, ProviderSubmitInput } from "./types";

/**
 * Model → provider. The single place that knows which backend serves what.
 *
 * Making video real is a change here plus one new file implementing
 * GenerationProvider; nothing in the routes or the generation service moves.
 */
const PROVIDERS: Record<ModelId, GenerationProvider> = {
  "fal-ai/flux/schnell": falImageProvider,
  "higgsfield/stub-video": stubVideoProvider,
};

export function providerFor(model: ModelId): GenerationProvider {
  const provider = PROVIDERS[model];
  if (!provider) {
    throw new Error(`No provider registered for model "${model}".`);
  }
  return provider;
}

/** True when the model's output is simulated rather than generated. */
export function isStubbed(model: ModelId): boolean {
  // Widened to ModelSpec: `as const satisfies` narrows each entry to its own
  // literal type, and the optional `stubbed` key is simply absent on models
  // that do not set it.
  const spec: ModelSpec = MODELS[model];
  return spec.stubbed === true;
}

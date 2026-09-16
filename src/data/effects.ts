/**
 * Effects presets.
 *
 * Names, order, slugs and thumbnails were read off higgsfield.ai's home page on
 * 2026-09-16 — the slugs match the real site's /effects/examples/<slug> routes.
 * The prompts are written for this rebuild; the real site does not expose the
 * prompt behind each preset.
 */

export type EffectPreset = {
  name: string;
  slug: string;
  thumbnail: string;
  /** Pre-fills the video composer when the preset is chosen. */
  prompt: string;
};

export const EFFECT_PRESETS: readonly EffectPreset[] = [
  {
    name: "Floating fall",
    slug: "floating-fall",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/151664fa-7f7f-43d6-80fa-4683104a3c02.webp",
    prompt:
      "Subject drifts weightlessly downward through open sky, clothes and hair rippling upward, clouds streaking past, camera falling with them, slow motion, cinematic",
  },
  {
    name: "High flip",
    slug: "high-flip",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/95cd0d73-4f3c-40d1-ac0b-c8668a99440b.webp",
    prompt:
      "Camera whips into a full vertical rotation around the subject, horizon inverting overhead, motion blur on the turn, handheld energy, 35mm",
  },
  {
    name: "Burning man",
    slug: "burning-man",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/a1560137-597c-455a-be9e-9622cccf76a3.webp",
    prompt:
      "Embers and heat haze rise around the subject as glowing cinders drift past, backlit by firelight, slow push in, dust in the air",
  },
  {
    name: "Studio slide",
    slug: "studio-slide",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/05201733-c72f-43ed-8393-8b8cea28b8ce.webp",
    prompt:
      "Smooth lateral dolly across a seamless studio backdrop, subject holding the centre, hard key light raking past, product-film polish",
  },
  {
    name: "Incline",
    slug: "incline",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/30142c8a-46ee-4930-aca3-6fa5321dd84a.webp",
    prompt:
      "Camera tilts the world off axis while the subject stays level, street receding at a steep angle, unsettling geometry, wide lens",
  },
  {
    name: "Act natural",
    slug: "act-natural",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/17cc1333-9822-442c-adaa-d208c59e3e01.webp",
    prompt:
      "Subject moves through an unremarkable moment as if unwatched, loose handheld follow, available light, documentary realism",
  },
  {
    name: "Eyes in",
    slug: "eyes-in",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/5354ce11-c68c-45a0-8a97-5aab94f52833.webp",
    prompt:
      "Relentless push toward the subject's eyes until the iris fills frame, reflections resolving in the pupil, macro finish",
  },
  {
    name: "Street colossus",
    slug: "street-colossus",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/5e67ff0a-60f7-4c0a-8ace-18c9bf3e5426.webp",
    prompt:
      "Subject towers over the city blocks below, camera craning up the full height, traffic crawling at their feet, overcast scale",
  },
  {
    name: "Melting",
    slug: "melting",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/6ecca888-1780-46ae-a86d-a05b69b2fe34.webp",
    prompt:
      "Subject and surroundings soften and run like heated wax, forms sagging and pooling, surreal viscous motion, slow reveal",
  },
  {
    name: "Wild ride",
    slug: "wild-ride",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/99aa3365-5ae0-4616-9722-ce0dc087607d.webp",
    prompt:
      "Breakneck first-person rush through the environment, everything smearing past, camera shake and speed lines, GoPro immediacy",
  },
  {
    name: "Cutout",
    slug: "cutout",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/b5c90864-c3c5-4b14-87a0-3739250fd00b.webp",
    prompt:
      "Subject lifts cleanly off the background as a flat layer, parallax opening behind them, paper-collage separation, graphic and stark",
  },
  {
    name: "World morphing",
    slug: "world-morphing",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/0abb112e-068d-45e4-acea-9c8c44a16781.webp",
    prompt:
      "The environment transforms continuously around a static subject, architecture and season shifting mid-shot, seamless dissolve chain",
  },
  {
    name: "Smash and grab",
    slug: "smash-and-grab",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/4a2315f6-57e1-4378-82a5-598ddbbfbbcb.webp",
    prompt:
      "Sudden violent lunge toward the subject, glass shattering across frame, debris frozen in the air, impact-timed cut",
  },
  {
    name: "Selfception",
    slug: "selfception",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/495d9e85-0417-47d9-9e0a-722ace805852.webp",
    prompt:
      "Subject filming themselves filming themselves, frames nesting inward infinitely, recursive handheld, screen within screen",
  },
  {
    name: "Lacewalker",
    slug: "lacewalker",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/ef3dfc4c-a4c2-44a0-af27-d005bd1c319d.webp",
    prompt:
      "Subject steps across an impossibly thin filament high above the ground, arms out for balance, vertigo drop beneath, telephoto compression",
  },
] as const;

export function presetBySlug(slug: string | null | undefined): EffectPreset | null {
  if (!slug) return null;
  return EFFECT_PRESETS.find((p) => p.slug === slug) ?? null;
}

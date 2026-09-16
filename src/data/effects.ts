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
  /** Looping preview clip from the live site's effects payload. */
  preview: string;
  /** The real site's own description of the effect. */
  description: string;
  /** Pre-fills the video composer when the preset is chosen. */
  prompt: string;
};

export const EFFECT_PRESETS: readonly EffectPreset[] = [
  {
    name: "Floating fall",
    slug: "floating-fall",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/d877f71c-d2f3-44df-9317-f3ce6889bcb6.mp4",
    description:
      "Falls backward as their belongings float in midair, with the camera moving through crisp product close-ups before the fall resumes. Built for playful product reveals, dynamic lifestyle ads, and surreal slow-motion edits.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/151664fa-7f7f-43d6-80fa-4683104a3c02.webp",
    prompt:
      "Subject drifts weightlessly downward through open sky, clothes and hair rippling upward, clouds streaking past, camera falling with them, slow motion, cinematic",
  },
  {
    name: "High flip",
    slug: "high-flip",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/001156a7-cfdb-4e16-8f13-68c246ddc06c.mp4",
    description:
      "The camera rises above the subject and flips overhead, seamlessly revealing a new character and location on the other side. Built for cinematic scene switches, dramatic character reveals, and fluid music video transitions.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/95cd0d73-4f3c-40d1-ac0b-c8668a99440b.webp",
    prompt:
      "Camera whips into a full vertical rotation around the subject, horizon inverting overhead, motion blur on the turn, handheld energy, 35mm",
  },
  {
    name: "Burning man",
    slug: "burning-man",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/c370022d-d99a-4cff-bb35-9d73b7a3a95d.mp4",
    description:
      "A flaming double appears before the subject and reaches out for a handshake, bringing them face-to-face with their burning counterpart. Built for surreal character reveals, cinematic music videos, and dramatic visual storytelling.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/a1560137-597c-455a-be9e-9622cccf76a3.webp",
    prompt:
      "Embers and heat haze rise around the subject as glowing cinders drift past, backlit by firelight, slow push in, dust in the air",
  },
  {
    name: "Studio slide",
    slug: "studio-slide",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/c129fb83-2014-4a37-a3f8-6c7dfeab0254.mp4",
    description:
      "Multiple copies of a single person appear simultaneously at varying scales, angles, and depths within the same frame. The figures smoothly slide past one another, creating a dynamic 3D layering effect against a solid background. Built for fashion reels, lookbooks, and stylized edits.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/05201733-c72f-43ed-8393-8b8cea28b8ce.webp",
    prompt:
      "Smooth lateral dolly across a seamless studio backdrop, subject holding the centre, hard key light raking past, product-film polish",
  },
  {
    name: "Incline",
    slug: "incline",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/bade6252-7039-42eb-a50c-45c142c7f70f.mp4",
    description:
      "The world tilts around the subject, sending loose objects sliding and tumbling past while they remain calmly in place. Built for surreal fashion edits, playful gravity distortions, and offbeat music videos.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/30142c8a-46ee-4930-aca3-6fa5321dd84a.webp",
    prompt:
      "Camera tilts the world off axis while the subject stays level, street receding at a steep angle, unsettling geometry, wide lens",
  },
  {
    name: "Act natural",
    slug: "act-natural",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/7a261cff-8d6c-4bab-84e7-515364061f3e.mp4",
    description:
      "A cinematic time-manipulation effect that completely suspends your subject and surrounding objects mid-action while the rest of the world continues to move in real-time. Built for surreal visual storytelling, dramatic pauses, and scroll-stopping creative edits.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/17cc1333-9822-442c-adaa-d208c59e3e01.webp",
    prompt:
      "Subject moves through an unremarkable moment as if unwatched, loose handheld follow, available light, documentary realism",
  },
  {
    name: "Eyes in",
    slug: "eyes-in",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/dba03734-6e8a-4337-acb4-17ce943563d8.mp4",
    description:
      "The camera dives directly into the subject’s eye, seamlessly passing through the dark void of the pupil to transport the viewer into an entirely new scene. Built for surreal narratives, psychological aesthetics, and mesmerizing visual flow.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/5354ce11-c68c-45a0-8a97-5aab94f52833.webp",
    prompt:
      "Relentless push toward the subject's eyes until the iris fills frame, reflections resolving in the pupil, macro finish",
  },
  {
    name: "Street colossus",
    slug: "street-colossus",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/e0278141-12c9-4139-91eb-b4294d833ed9.mp4",
    description:
      "A cinematic scale-shifting effect that transforms you into a towering giant seamlessly integrated into a sprawling cityscape. Built for surreal urban edits, colossal creature aesthetics storytelling, and epic visual impact.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/5e67ff0a-60f7-4c0a-8ace-18c9bf3e5426.webp",
    prompt:
      "Subject towers over the city blocks below, camera craning up the full height, traffic crawling at their feet, overcast scale",
  },
  {
    name: "Melting",
    slug: "melting",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/f661157c-af00-46f7-8b7c-6a7ae711ef98.mp4",
    description:
      "The subject slowly melts into a glossy puddle, with their clothing and accessories stretching into liquid trails before pooling on the ground. Built for surreal transformations, experimental fashion edits, and playful disappearing acts.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/6ecca888-1780-46ae-a86d-a05b69b2fe34.webp",
    prompt:
      "Subject and surroundings soften and run like heated wax, forms sagging and pooling, surreal viscous motion, slow reveal",
  },
  {
    name: "Wild ride",
    slug: "wild-ride",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/8cd9e3fc-8e4f-4071-abff-8934f3381507.mp4",
    description:
      "A high-speed, dynamic camera orbit that aggressively sweeps around a rapidly spinning or drifting subject. The camera executes precise, controlled movements, smoothly shifting from high overhead angles to low ground-level perspectives while keeping the central action perfectly locked in frame. Built for action sequences, automotive edits, and high-energy music videos. ",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/99aa3365-5ae0-4616-9722-ce0dc087607d.webp",
    prompt:
      "Breakneck first-person rush through the environment, everything smearing past, camera shake and speed lines, GoPro immediacy",
  },
  {
    name: "Cutout",
    slug: "cutout",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/a64711ac-93b8-46ee-a9ce-37ee5c18e148.mp4",
    description:
      "The surroundings break apart into floating cutout layers, revealing a clean white void around the subject before snapping back into place. Built for surreal fashion edits, mixed-media visuals, and playful architectural transitions.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/b5c90864-c3c5-4b14-87a0-3739250fd00b.webp",
    prompt:
      "Subject lifts cleanly off the background as a flat layer, parallax opening behind them, paper-collage separation, graphic and stark",
  },
  {
    name: "World morphing",
    slug: "world-morphing",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/950efc04-6ae6-4b31-bfa5-83c87244014c.mp4",
    description:
      "The entire background environment lifts and folds inward around a stationary central subject, dramatically morphing the landscape into a massive, gravity-defying enclosure. Built for surreal visual effects and mind-bending scene shifts.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/0abb112e-068d-45e4-acea-9c8c44a16781.webp",
    prompt:
      "The environment transforms continuously around a static subject, architecture and season shifting mid-shot, seamless dissolve chain",
  },
  {
    name: "Smash and grab",
    slug: "smash-and-grab",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/c32886ee-2d15-4697-a366-041a9deaffe2.mp4",
    description:
      "The camera frames the product through a car window as the subject shatters the glass and snatches it, then cuts to a fast tracking shot of their getaway. Built for bold product reveals, playful action edits, and dynamic lifestyle ads.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/4a2315f6-57e1-4378-82a5-598ddbbfbbcb.webp",
    prompt:
      "Sudden violent lunge toward the subject, glass shattering across frame, debris frozen in the air, impact-timed cut",
  },
  {
    name: "Selfception",
    slug: "selfception",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/6ef62a07-2609-4693-8225-e6263b76afab.mp4",
    description:
      "Endless versions of the subject repeat inside one another as the camera continuously zooms into the miniature figure held in their hands. Built for recursive illusions, seamless zoom loops, and mind-bending character edits.",
    thumbnail:
      "https://cdn.higgsfield.ai/viral_hub/495d9e85-0417-47d9-9e0a-722ace805852.webp",
    prompt:
      "Subject filming themselves filming themselves, frames nesting inward infinitely, recursive handheld, screen within screen",
  },
  {
    name: "Lacewalker",
    slug: "lacewalker",
    preview:
      "https://cdn.higgsfield.ai/viral_hub/d806368c-0d8a-4a7b-b43a-8ff22fa64563.mp4",
    description:
      "A miniature version of the subject strolls past their giant counterpart before balancing on a thin strap stretched between oversized handbags. Built for playful scale illusions, surreal fashion campaigns, and imaginative product showcases.",
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

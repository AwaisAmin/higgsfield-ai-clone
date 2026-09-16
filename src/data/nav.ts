/**
 * Navigation data.
 *
 * Labels, order and hrefs were read off higgsfield.ai's live header markup on
 * 2026-09-16 rather than guessed. Kept as typed data so the header, the mobile
 * drawer and the footer can all read from one source.
 */

export type NavBadge = "New";

export type NavLink = {
  label: string;
  href: string;
  badge?: NavBadge;
  /** Set for links that leave the app. */
  external?: boolean;
};

/** A link inside the Explore dropdown, which shows supporting copy. */
export type NavMenuLink = NavLink & { description: string };

export type NavEntry = NavLink & { menu?: readonly NavMenuLink[] };

/**
 * The Explore dropdown. The live site lists these three with no supporting
 * copy; the descriptions are written for this rebuild.
 */
export const exploreMenu: readonly NavMenuLink[] = [
  {
    label: "Image",
    href: "/ai/image?model=gpt_image_2",
    description: "Stills from a prompt, with character and style consistency.",
  },
  {
    label: "Video",
    href: "/ai/video",
    description: "Cinematic motion with camera control and presets.",
  },
  {
    label: "Audio",
    href: "/audio",
    description: "Score, voice and sound design to cut against your footage.",
  },
] as const;

/** The scrolling rail, in the exact order the live header renders it. */
export const primaryNav: readonly NavEntry[] = [
  { label: "Explore", href: "/", menu: exploreMenu },
  { label: "MCP", href: "/mcp" },
  { label: "ChatGPT Plugin", href: "/gpt-astra", badge: "New" },
  { label: "Genjutsu", href: "/ai/video?model=genjutsu" },
  { label: "Effects", href: "/effects/use", badge: "New" },
  { label: "Cinema Studio", href: "/generate" },
  { label: "Marketing Studio", href: "/marketing-studio" },
  { label: "Supercomputer", href: "/supercomputer" },
  { label: "3D Jutsu", href: "/3d-jutsu", badge: "New" },
  { label: "Edit", href: "/layers" },
  { label: "Academy", href: "/academy" },
  { label: "Community", href: "/community" },
  { label: "Contests", href: "/contests/higgsfield-global-film-festival" },
  { label: "Plugins", href: "/plugins/after-effects" },
  { label: "Canvas", href: "/canvas" },
  { label: "Originals", href: "/original-series" },
] as const;

/** Quiet text links that sit before the auth actions. */
export const utilityNav: readonly NavLink[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
] as const;

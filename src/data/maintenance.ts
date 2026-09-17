/**
 * Routes that are linked from the nav, footer and home page but have no real
 * page behind them yet.
 *
 * Every one of these URLs is a genuine higgsfield.ai route, so the links are
 * kept rather than stripped out — a dead link that 404s is worse than a link
 * that tells you honestly where it would go. Each entry describes what would
 * live there, so the placeholder is informative rather than a shrug.
 */

export type MaintenanceInfo = {
  /** Section label above the heading. */
  eyebrow: string;
  title: string;
  blurb: string;
  /** Where to send someone who wants something that does work. */
  suggestion?: { label: string; href: string };
};

const STUDIO = { label: "Open the studio", href: "/ai/image" };
const EFFECTS = { label: "Browse effects", href: "/effects" };

export const MAINTENANCE: Record<string, MaintenanceInfo> = {
  "/mcp": {
    eyebrow: "MCP & CLI",
    title: "Turn Claude into a creative engine",
    blurb:
      "Drive generation from your editor or terminal over MCP, with the same models and credits as the web app.",
    suggestion: STUDIO,
  },
  "/canvas": {
    eyebrow: "Canvas",
    title: "An infinite canvas for your generations",
    blurb:
      "Lay shots out side by side, branch variations, and build a board from the pieces that work.",
    suggestion: STUDIO,
  },
  "/layers": {
    eyebrow: "Edit",
    title: "Layer-based editing",
    blurb:
      "Refine a generation without regenerating it — masks, inpainting and per-layer adjustments.",
    suggestion: STUDIO,
  },
  "/audio": {
    eyebrow: "Audio",
    title: "Score, voice and sound design",
    blurb:
      "Generate a track, a read or a sound bed cut to the footage you already made.",
    suggestion: STUDIO,
  },
  "/generate": {
    eyebrow: "Cinema Studio",
    title: "Create cinematic scenes effortlessly",
    blurb:
      "Build a sequence shot by shot with camera moves, continuity and a consistent cast.",
    suggestion: STUDIO,
  },
  "/marketing-studio": {
    eyebrow: "Marketing Studio",
    title: "Ad creative at campaign scale",
    blurb:
      "Produce every cut, ratio and variant a campaign needs from one brief.",
    suggestion: STUDIO,
  },
  "/supercomputer": {
    eyebrow: "Supercomputer",
    title: "One superagent for your entire creative stack",
    blurb:
      "Brief it once and it plans, generates and assembles across image, video and 3D.",
    suggestion: STUDIO,
  },
  "/3d-jutsu": {
    eyebrow: "3D Jutsu",
    title: "Prompt to playable 3D",
    blurb:
      "Turn a description into scenes, props and characters you can move a camera through.",
  },
  "/gpt-astra": {
    eyebrow: "ChatGPT Plugin",
    title: "Higgsfield × GPT-6 Astra",
    blurb:
      "Turn a single prompt into a playable 3D game — story, mechanics and every asset included.",
  },
  "/plugins/after-effects": {
    eyebrow: "Plugins",
    title: "Motion design inside After Effects",
    blurb:
      "Generate and place elements straight onto your comp without leaving AE.",
  },
  "/academy": {
    eyebrow: "Academy",
    title: "Learn the craft",
    blurb:
      "Courses and breakdowns on prompting, camera language and finishing.",
    suggestion: EFFECTS,
  },
  "/original-series": {
    eyebrow: "Originals",
    title: "Films made with Higgsfield",
    blurb:
      "Original short work produced end to end on the platform, with the process shown.",
    suggestion: { label: "See community work", href: "/community" },
  },
  "/contests/higgsfield-global-film-festival": {
    eyebrow: "Contests",
    title: "Global Film Festival",
    blurb:
      "Submissions, judging and prizes for the current round of the festival.",
    suggestion: { label: "See community work", href: "/community" },
  },
  "/creator-hub/help-center": {
    eyebrow: "Support",
    title: "Help center",
    blurb: "Guides, troubleshooting and answers to the usual questions.",
  },
  "/cookie-notice": {
    eyebrow: "Legal",
    title: "Cookie Notice",
    blurb: "How cookies are used across the site, and how to control them.",
  },
  "/privacy-policy": {
    eyebrow: "Legal",
    title: "Privacy Policy",
    blurb: "What data is collected, why, and what your rights over it are.",
  },
  "/terms-of-use-agreement": {
    eyebrow: "Legal",
    title: "Terms of Use",
    blurb: "The agreement covering use of the platform and generated output.",
  },
};

export const MAINTENANCE_ROUTES = Object.keys(MAINTENANCE);

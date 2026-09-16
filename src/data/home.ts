/**
 * Home page content.
 *
 * Every media URL here was extracted from higgsfield.ai's own markup on
 * 2026-09-16 — hero clips and posters from the <video>/<img> pairs, preset
 * previews from the page's `initialEffectsPresets` payload, and showcase
 * projects from the JSON-LD CreativeWork blocks. Nothing is a placeholder.
 *
 * Copy is the real site's where the brief quoted it.
 */

export type HeroCard = {
  title: string;
  tagline: string;
  cta: string;
  href: string;
  video: string;
  poster: string;
};

export const HERO_CARDS: readonly HeroCard[] = [
  {
    title: "Higgsfield AI Motion Designer",
    tagline:
      "ChatGPT can now do motion design in After Effects.",
    cta: "Try it",
    href: "/plugins/after-effects",
    video:
      "https://cdn.higgsfield.ai/card/8b8270cd-dc63-4a34-88e7-3277536987fb.mp4",
    poster:
      "https://cdn.higgsfield.ai/card/a8d8030f-9cc9-47ad-a266-e0d3708d2126.webp",
  },
  {
    title: "Higgsfield Effects",
    tagline:
      "Viral video presets now in ChatGPT, with free generations",
    cta: "Explore effects",
    href: "/effects",
    video:
      "https://cdn.higgsfield.ai/card/31293efb-7438-41c9-84cc-8bc820ce39b6.mp4",
    poster:
      "https://cdn.higgsfield.ai/card/5fba4d2a-1023-4bd1-9d7a-e2faaf8a21d1.webp",
  },
  {
    title: "Higgsfield Genjutsu",
    tagline:
      "One upload in. Endless new visions out.",
    cta: "Start creating",
    href: "/ai/video",
    video:
      "https://cdn.higgsfield.ai/card/16eebc9a-8310-4f68-8a02-1e2e6f109169.mp4",
    poster:
      "https://cdn.higgsfield.ai/card/9c6affe8-03a8-4434-97ef-2fc476f7a71e.webp",
  },
  {
    title: "GPT Image 2.5 Sunburst",
    tagline:
      "Sharper edits with more natural light and texture",
    cta: "Generate images",
    href: "/ai/image",
    video:
      "https://cdn.higgsfield.ai/card/4da5ce4e-8483-4471-9564-0907b394d3e0.mp4",
    poster:
      "https://cdn.higgsfield.ai/card/f11a402b-0e0e-43cc-90e5-f6cc39352123.webp",
  },
  {
    title: "HIGGSFIELD × GPT-6 ASTRA",
    tagline:
      "Turn a single prompt into a playable 3D game. Story, mechanics, and every asset included",
    cta: "Build a game",
    href: "/gpt-astra",
    video:
      "https://cdn.higgsfield.ai/card/f155252f-83ad-46c3-b484-728f6292e00d.mp4",
    poster:
      "https://cdn.higgsfield.ai/card/25341b90-c34e-4cc3-97d8-fa45c693f5b5.webp",
  },
] as const;

export type ProductTile = {
  title: string;
  description: string;
  href: string;
  badges: readonly string[];
  video: string;
  poster: string;
  /** "wide" tiles span two columns in the bento grid. */
  span: "wide" | "normal";
};

export const PRODUCT_TILES: readonly ProductTile[] = [
  {
    title: "Seedance 2.5",
    description: "The most advanced video model",
    href: "/ai/video",
    badges: ["Top", "Video"],
    video:
      "https://cdn.higgsfield.ai/viral_hub/8cd9e3fc-8e4f-4071-abff-8934f3381507.mp4",
    poster:
      "https://cdn.higgsfield.ai/viral_hub/99aa3365-5ae0-4616-9722-ce0dc087607d.webp",
    span: "wide",
  },
  {
    title: "Nano Banana Pro",
    description: "Generate high-quality visuals",
    href: "/ai/image",
    badges: ["Image"],
    video:
      "https://cdn.higgsfield.ai/viral_hub/c129fb83-2014-4a37-a3f8-6c7dfeab0254.mp4",
    poster:
      "https://cdn.higgsfield.ai/viral_hub/05201733-c72f-43ed-8393-8b8cea28b8ce.webp",
    span: "normal",
  },
  {
    title: "Higgsfield Genjutsu",
    description: "One video, many versions",
    href: "/ai/video",
    badges: ["New"],
    video:
      "https://cdn.higgsfield.ai/viral_hub/950efc04-6ae6-4b31-bfa5-83c87244014c.mp4",
    poster:
      "https://cdn.higgsfield.ai/viral_hub/0abb112e-068d-45e4-acea-9c8c44a16781.webp",
    span: "normal",
  },
  {
    title: "MCP & CLI",
    description: "Turn Claude into a creative engine",
    href: "/mcp",
    badges: [],
    video:
      "https://cdn.higgsfield.ai/viral_hub/a64711ac-93b8-46ee-a9ce-37ee5c18e148.mp4",
    poster:
      "https://cdn.higgsfield.ai/viral_hub/b5c90864-c3c5-4b14-87a0-3739250fd00b.webp",
    span: "normal",
  },
  {
    title: "Cinema Studio 4.0",
    description: "Create cinematic scenes effortlessly",
    href: "/generate",
    badges: [],
    video:
      "https://cdn.higgsfield.ai/viral_hub/e0278141-12c9-4139-91eb-b4294d833ed9.mp4",
    poster:
      "https://cdn.higgsfield.ai/viral_hub/5e67ff0a-60f7-4c0a-8ace-18c9bf3e5426.webp",
    span: "normal",
  },
  {
    title: "Supercomputer",
    description: "Agent powered by GPT-6 Astra",
    href: "/supercomputer",
    badges: [],
    video:
      "https://cdn.higgsfield.ai/viral_hub/f661157c-af00-46f7-8b7c-6a7ae711ef98.mp4",
    poster:
      "https://cdn.higgsfield.ai/viral_hub/6ecca888-1780-46ae-a86d-a05b69b2fe34.webp",
    span: "wide",
  },
] as const;

export type Spotlight = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  video: string;
  poster: string;
  /** Media on the right by default; "reverse" puts it on the left. */
  layout: "default" | "reverse";
};

export const SPOTLIGHTS: readonly Spotlight[] = [
  {
    eyebrow: "Genjutsu",
    title: "Reality Manipulation",
    body:
      "Transfer motion into new scenes, or swap details while everything else stays as filmed.",
    cta: "Try Genjutsu",
    href: "/ai/video",
    video:
      "https://cdn.higgsfield.ai/card/16eebc9a-8310-4f68-8a02-1e2e6f109169.mp4",
    poster:
      "https://cdn.higgsfield.ai/card/9c6affe8-03a8-4434-97ef-2fc476f7a71e.webp",
    layout: "default",
  },
  {
    eyebrow: "Seedance 2.5",
    title: "The most advanced AI video model",
    body:
      "Take the motion and recast it with your characters, locations, and products, or swap specific elements while keeping the rest untouched.",
    cta: "Generate video",
    href: "/ai/video",
    video:
      "https://cdn.higgsfield.ai/viral_hub/c32886ee-2d15-4697-a366-041a9deaffe2.mp4",
    poster:
      "https://cdn.higgsfield.ai/viral_hub/4a2315f6-57e1-4378-82a5-598ddbbfbbcb.webp",
    layout: "reverse",
  },
] as const;

export const SUPERCOMPUTER_BANNER = {
  title: "One superagent for your entire creative stack",
  body:
    "Brief it once and it plans, generates and assembles across image, video and 3D — powered by GPT-6 Astra.",
  cta: "Meet Supercomputer",
  href: "/supercomputer",
  video:
    "https://cdn.higgsfield.ai/viral_hub/c370022d-d99a-4cff-bb35-9d73b7a3a95d.mp4",
  poster:
    "https://cdn.higgsfield.ai/viral_hub/a1560137-597c-455a-be9e-9622cccf76a3.webp",
} as const;

export type ShowcaseProject = {
  name: string;
  image: string;
  href: string;
  author: string;
};

/** From the home page's JSON-LD CreativeWork blocks. */
export const SHOWCASE_PROJECTS: readonly ShowcaseProject[] = [
  {
    name: "If you stop loving me, I'll die — I don't like dying, but for our love I'm ready to go that far",
    image:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_3GNcyaSCltezE7ot4WtRdn0jfo0/821f8180-f5de-4a1b-b827-57b34a7cbc4d.jpg",
    href: "https://higgsfield.ai/@higgsfield.studio/projects/if-you-stop-loving-me-ill-die",
    author: "higgsfield.studio",
  },
  {
    name: "Cully Hill Boys",
    image:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_3GNcyaSCltezE7ot4WtRdn0jfo0/75d860f8-6dde-45d6-ae81-756ddbfe563e.jpg",
    href: "https://higgsfield.ai/@higgsfield.studio/projects/cully-hill-boys",
    author: "higgsfield.studio",
  },
  {
    name: "Red Flag",
    image:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_3GNcyaSCltezE7ot4WtRdn0jfo0/f6bf4ce5-2a41-45cb-a099-12bdc1e117c1.jpg",
    href: "https://higgsfield.ai/@higgsfield.studio/projects/red-flag",
    author: "higgsfield.studio",
  },
  {
    name: "Kok Boru",
    image:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_3GNcyaSCltezE7ot4WtRdn0jfo0/f3ca6ccc-a45c-4111-a66e-ecb2e5d38dba.jpg",
    href: "https://higgsfield.ai/@higgsfield.studio/projects/kok-boru-film",
    author: "higgsfield.studio",
  },
  {
    name: "Adiliada",
    image:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_3GNcyaSCltezE7ot4WtRdn0jfo0/07c550cd-d621-46a1-8cb1-420986027ac9.jpg",
    href: "https://higgsfield.ai/@higgsfield.studio/projects/adiliada",
    author: "higgsfield.studio",
  },
  {
    name: "ONEIRIC",
    image:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_3GNcyaSCltezE7ot4WtRdn0jfo0/6984c17e-8f23-4a86-896c-ff0d3be920ca.jpg",
    href: "https://higgsfield.ai/@higgsfield.studio/projects/oneiric",
    author: "higgsfield.studio",
  },
  {
    name: "ZEPHYR: Special",
    image:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_3GNcyaSCltezE7ot4WtRdn0jfo0/9655238c-398d-4403-bc7d-68e3b43238cf.jpg",
    href: "https://higgsfield.ai/@higgsfield.studio/projects/zephyr-special",
    author: "higgsfield.studio",
  },
  {
    name: "HELL GRIND",
    image:
      "https://d2ol7oe51mr4n9.cloudfront.net/user_2v5txepAmNYZwyzml1nIizlWURE/df7107b3-1dd6-438a-a168-ed382e2ad901.png",
    href: "https://higgsfield.ai/@higgsfield.studio/projects/hell-grind",
    author: "higgsfield.studio",
  },
] as const;

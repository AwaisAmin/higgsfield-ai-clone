import { notFound } from "next/navigation";

import { ImageStudio } from "@/components/generate/image-studio";
import type { GenerationView } from "@/lib/generation-view";
import fixtures from "../fixtures.json";

/**
 * UI verification harness — development only.
 *
 * Renders the studio with fixture data so `scripts/check-studio.mjs` can drive
 * every card state, the lightbox and the mobile sheet without an authenticated
 * session or a live provider. `notFound()` in production keeps it out of the
 * deployed app; it is listed as a public route in the middleware for the same
 * reason. Safe to delete along with scripts/check-studio.mjs.
 */
const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

const ITEMS: GenerationView[] = [
  {
    id: "fix-queued", prompt: "A lone figure on a rain-slick Tokyo street at night, neon reflections in the puddles, anamorphic lens, 35mm",
    model: "fal-ai/flux/schnell", aspectRatio: "1:1", status: "QUEUED",
    resultUrl: null, thumbnailUrl: null, error: null, creditsSpent: 4,
    isPublic: true, createdAt: iso(0), completedAt: null,
  },
  {
    id: "fix-running", prompt: "Brutalist concrete library at golden hour, long shadows through clerestory windows",
    model: "fal-ai/flux/schnell", aspectRatio: "16:9", status: "RUNNING",
    resultUrl: null, thumbnailUrl: null, error: null, creditsSpent: 4,
    isPublic: true, createdAt: iso(1), completedAt: null,
  },
  {
    id: "fix-failed", prompt: "Close-up of a hummingbird mid-flight against matte black, wings frozen",
    model: "fal-ai/flux/schnell", aspectRatio: "1:1", status: "FAILED",
    resultUrl: null, thumbnailUrl: null,
    error: "User is locked. Reason: Exhausted balance. Top up your balance at fal.ai/dashboard/billing.",
    creditsSpent: 0, isPublic: true, createdAt: iso(4), completedAt: iso(3),
  },
  {
    id: "fix-ok-1", prompt: "A lone figure on a rain-slick Tokyo street at night, neon reflections in the puddles, anamorphic lens, 35mm",
    model: "fal-ai/flux/schnell", aspectRatio: "1:1", status: "SUCCEEDED",
    resultUrl: fixtures.a, thumbnailUrl: fixtures.a, error: null, creditsSpent: 4,
    isPublic: true, createdAt: iso(9), completedAt: iso(8),
  },
  {
    id: "fix-ok-2", prompt: "Brutalist concrete library at golden hour, architectural photography",
    model: "fal-ai/flux/schnell", aspectRatio: "16:9", status: "SUCCEEDED",
    resultUrl: fixtures.b, thumbnailUrl: fixtures.b, error: null, creditsSpent: 4,
    isPublic: false, createdAt: iso(20), completedAt: iso(19),
  },
];

export default function UiTestImagePage({
  searchParams,
}: {
  searchParams: Promise<{ empty?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  return <Harness searchParams={searchParams} />;
}

async function Harness({ searchParams }: { searchParams: Promise<{ empty?: string }> }) {
  const { empty } = await searchParams;
  return <ImageStudio initialItems={empty ? [] : ITEMS} initialCredits={96} />;
}

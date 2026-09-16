import { notFound } from "next/navigation";

import { Studio } from "@/components/generate/studio";
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
    id: "fix-queued", kind: "IMAGE", preset: null, prompt: "A lone figure on a rain-slick Tokyo street at night, neon reflections in the puddles, anamorphic lens, 35mm",
    model: "fal-ai/flux/schnell", aspectRatio: "1:1", status: "QUEUED",
    resultUrl: null, thumbnailUrl: null, error: null, creditsSpent: 4,
    isPublic: true, createdAt: iso(0), completedAt: null,
  },
  {
    id: "fix-running", kind: "IMAGE", preset: null, prompt: "Brutalist concrete library at golden hour, long shadows through clerestory windows",
    model: "fal-ai/flux/schnell", aspectRatio: "16:9", status: "RUNNING",
    resultUrl: null, thumbnailUrl: null, error: null, creditsSpent: 4,
    isPublic: true, createdAt: iso(1), completedAt: null,
  },
  {
    id: "fix-failed", kind: "IMAGE", preset: null, prompt: "Close-up of a hummingbird mid-flight against matte black, wings frozen",
    model: "fal-ai/flux/schnell", aspectRatio: "1:1", status: "FAILED",
    resultUrl: null, thumbnailUrl: null,
    error: "User is locked. Reason: Exhausted balance. Top up your balance at fal.ai/dashboard/billing.",
    creditsSpent: 0, isPublic: true, createdAt: iso(4), completedAt: iso(3),
  },
  {
    id: "fix-ok-1", kind: "IMAGE", preset: null, prompt: "A lone figure on a rain-slick Tokyo street at night, neon reflections in the puddles, anamorphic lens, 35mm",
    model: "fal-ai/flux/schnell", aspectRatio: "1:1", status: "SUCCEEDED",
    resultUrl: fixtures.a, thumbnailUrl: fixtures.a, error: null, creditsSpent: 4,
    isPublic: true, createdAt: iso(9), completedAt: iso(8),
  },
  {
    id: "fix-ok-2", kind: "IMAGE", preset: null, prompt: "Brutalist concrete library at golden hour, architectural photography",
    model: "fal-ai/flux/schnell", aspectRatio: "16:9", status: "SUCCEEDED",
    resultUrl: fixtures.b, thumbnailUrl: fixtures.b, error: null, creditsSpent: 4,
    isPublic: false, createdAt: iso(20), completedAt: iso(19),
  },
  {
    id: "fix-video", kind: "VIDEO", preset: "high-flip",
    prompt: "Camera whips into a full vertical rotation around the subject, horizon inverting overhead",
    model: "higgsfield/stub-video", aspectRatio: "9:16", status: "SUCCEEDED",
    resultUrl: "https://cdn.higgsfield.ai/card/8b8270cd-dc63-4a34-88e7-3277536987fb.mp4",
    thumbnailUrl: "https://cdn.higgsfield.ai/card/a8d8030f-9cc9-47ad-a266-e0d3708d2126.webp",
    error: null, creditsSpent: 12, isPublic: true, createdAt: iso(30), completedAt: iso(29),
  },
];

export default function UiTestImagePage({
  searchParams,
}: {
  searchParams: Promise<{ empty?: string; kind?: string; preset?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  return <Harness searchParams={searchParams} />;
}

async function Harness({
  searchParams,
}: {
  searchParams: Promise<{ empty?: string; kind?: string; preset?: string }>;
}) {
  const { empty, kind, preset } = await searchParams;
  const isVideo = kind === "video";
  return (
    <Studio
      kind={isVideo ? "VIDEO" : "IMAGE"}
      initialItems={empty ? [] : ITEMS}
      initialCredits={96}
      initialPreset={preset ?? null}
    />
  );
}

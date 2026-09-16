/**
 * End-to-end proof of the generation pipeline, from the terminal.
 *
 * Imports the real service layer the API routes use — not a reimplementation —
 * so what passes here is what the routes execute. The HTTP layer adds auth,
 * zod parsing and status codes on top; those are exercised separately.
 *
 *   npx tsx scripts/prove-generation.ts ["a prompt"]
 */
import "dotenv/config";

import {
  creditsFor,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_MODEL,
  DEFAULT_VIDEO_ASPECT_RATIO,
  DEFAULT_VIDEO_MODEL,
  isModelId,
  MODELS,
  type ModelSpec,
} from "../src/lib/credits";
import { createGeneration, syncGeneration } from "../src/lib/generations";
import { prisma } from "../src/lib/prisma";

/**
 * Usage: npx tsx scripts/prove-generation.ts [model] ["a prompt"]
 * `model` may be a full id or the shorthand "image" / "video".
 */
const MODEL_ARG = process.argv[2] ?? "image";
const MODEL =
  MODEL_ARG === "image"
    ? DEFAULT_MODEL
    : MODEL_ARG === "video"
      ? DEFAULT_VIDEO_MODEL
      : isModelId(MODEL_ARG)
        ? MODEL_ARG
        : (() => {
            console.error(`Unknown model "${MODEL_ARG}".`);
            process.exit(1);
          })();

// Widened: `as const satisfies` narrows each entry past the optional keys.
const SPEC: ModelSpec = MODELS[MODEL];
const IS_VIDEO = SPEC.kind === "VIDEO";

const PROMPT =
  process.argv[3] ??
  (IS_VIDEO
    ? "Slow dolly through a neon-lit alley as rain falls, steam rising from a grate"
    : "A lone figure on a rain-slick Tokyo street at night, neon reflections, anamorphic, 35mm");

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 180_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "desc" } });
  if (!user) {
    console.error("No user rows. Sign up at /sign-up first.");
    process.exit(1);
  }

  const cost = creditsFor(MODEL);

  console.log("user      ", user.id);
  console.log("email     ", user.email);
  console.log("credits   ", user.credits, "(before)");
  console.log("model     ", MODEL, `— ${cost} credits`, SPEC.stubbed ? "(STUBBED)" : "");
  console.log("prompt    ", JSON.stringify(PROMPT));
  console.log("");

  const started = Date.now();
  const generation = await createGeneration(user.id, {
    prompt: PROMPT,
    aspectRatio: IS_VIDEO ? DEFAULT_VIDEO_ASPECT_RATIO : DEFAULT_ASPECT_RATIO,
    model: MODEL,
  });

  console.log("submitted ", generation.id);
  console.log("requestId ", generation.requestId);
  console.log("status    ", generation.status);
  console.log("");

  const afterSubmit = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { credits: true },
  });
  console.log(`credits    ${user.credits} -> ${afterSubmit.credits} (charged on submit)`);
  console.log("");

  let current = generation;
  let polls = 0;

  while (current.status !== "SUCCEEDED" && current.status !== "FAILED") {
    if (Date.now() - started > TIMEOUT_MS) {
      console.error(`\nTimed out after ${TIMEOUT_MS / 1000}s in status ${current.status}.`);
      process.exit(1);
    }
    await sleep(POLL_INTERVAL_MS);
    polls++;
    const next = await syncGeneration(user.id, generation.id);
    if (!next) {
      console.error("Generation vanished.");
      process.exit(1);
    }
    current = next;
    console.log(`  poll ${String(polls).padStart(2)}  ${current.status}`);
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const finalUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { credits: true },
  });

  console.log("");
  console.log("─".repeat(70));
  console.log("status     ", current.status, `(${elapsed}s, ${polls} polls)`);
  console.log("resultUrl  ", current.resultUrl ?? "(none)");
  console.log("thumbnail  ", current.thumbnailUrl ?? "(none)");
  console.log("completedAt", current.completedAt?.toISOString() ?? "(none)");
  console.log("error      ", current.error ?? "(none)");
  console.log("creditsSpent", current.creditsSpent);
  console.log("credits    ", `${user.credits} -> ${finalUser.credits}`);
  console.log("─".repeat(70));

  const expected = current.status === "SUCCEEDED" ? user.credits - cost : user.credits;
  const ok =
    finalUser.credits === expected &&
    (current.status === "FAILED" || Boolean(current.resultUrl));

  if (current.status === "FAILED") {
    console.log(`\nGeneration FAILED — credits refunded to ${finalUser.credits}.`);
  }
  console.log(
    ok
      ? `\nPASS — credits ${user.credits} -> ${finalUser.credits} (expected ${expected}).`
      : `\nFAIL — expected ${expected} credits, got ${finalUser.credits}.`,
  );

  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
}

main().catch(async (error) => {
  console.error("\nUnhandled failure:", error);
  await prisma.$disconnect();
  process.exit(1);
});

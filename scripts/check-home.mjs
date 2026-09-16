/**
 * Home page verification.
 *
 * Checks the eight sections render with real media, the hero rail actually
 * scrolls, offscreen video stays paused, and prefers-reduced-motion is honoured.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const PORT = process.argv[2] ?? "3000";
const BASE = `http://localhost:${PORT}/`;
const OUT = "scripts/.screenshots";
mkdirSync(OUT, { recursive: true });

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

async function waitFor(fn, timeout = 15000) {
  const started = Date.now();
  for (;;) {
    try {
      if (await fn()) return true;
    } catch {
      /* mid-hydration churn */
    }
    if (Date.now() - started > timeout) return false;
    await new Promise((r) => setTimeout(r, 200));
  }
}

const browser = await chromium.launch();

/* ------------------------------------------------------- served markup */
{
  console.log("\n[served markup]");
  const html = await (await fetch(BASE)).text();

  // Nothing may preload: the IntersectionObserver decides, after hydration.
  const preloads = [...html.matchAll(/<video[^>]*preload="([^"]+)"/g)].map((m) => m[1]);
  check("every video ships preload=none", preloads.length > 0 && preloads.every((p) => p === "none"),
    `${preloads.length} videos, values: ${[...new Set(preloads)].join(",")}`);

  check("hero clips are real CDN media", (html.match(/cdn\.higgsfield\.ai\/card\/[0-9a-f-]+\.mp4/g) ?? []).length >= 5);
  check("preset media present", (html.match(/cdn\.higgsfield\.ai\/viral_hub\//g) ?? []).length >= 15);
  check("showcase covers present", html.includes("d2ol7oe51mr4n9.cloudfront.net"));
  // The promo must exist without JS — <ClerkLoaded> alone would omit it.
  check("signup promo is in the static HTML", html.includes("Unlimited Nano Banana Pro"));

  for (const copy of [
    "ChatGPT can now do motion design in After Effects.",
    "One upload in. Endless new visions out.",
    "Sign up and get your",
    "extra discount",
    "The most advanced video model",
    "Turn Claude into a creative engine",
    "Agent powered by GPT-6 Astra",
    "Higgsfield MCP with",
    "Build games, motion graphics, and interactive 3D experiences",
    "Visual Effects",
    "Big-budget visual effects, from explosions to surreal",
    "Reality Manipulation",
    "The most advanced AI video model",
    "Explore the inside of every project",
    "See all prompts, assets, and how each project was created",
    "One superagent for your entire creative stack",
  ]) {
    check(`copy: "${copy.slice(0, 44)}"`, html.includes(copy));
  }
}

/* ------------------------------------------------------------- desktop */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("section[aria-label='Featured']", { state: "visible", timeout: 30000 });
  await page.waitForFunction(
    () => {
      const el = document.querySelector("section[aria-label='Featured'] button");
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps$"));
    },
    undefined,
    { timeout: 30000 },
  );
  console.log("\n[desktop 1440]");

  const hero = page.locator("section[aria-label='Featured']");
  check("hero has 5 cards", (await hero.locator("article").count()) === 5);
  check("hero has 5 dots", (await hero.getByRole("button", { name: /^Go to / }).count()) === 5);
  check("prev disabled at start", await hero.getByRole("button", { name: "Previous" }).isDisabled());

  const rail = hero.locator("ul").first();
  const startScroll = await rail.evaluate((el) => el.scrollLeft);
  await hero.getByRole("button", { name: "Next" }).click();
  const advanced = await waitFor(async () => (await rail.evaluate((el) => el.scrollLeft)) > startScroll + 100);
  check("next advances the rail", advanced);
  const activeDot = await waitFor(async () =>
    (await hero.getByRole("button", { name: "Go to Higgsfield Effects" }).getAttribute("aria-current")) === "true",
  );
  check("dot tracks scroll position", activeDot);

  check("product grid has 6 tiles", (await page.locator("section:has(h2:text('Everything in one place')) li").count()) === 6);
  check("effects rail has 15 presets", (await page.locator("section:has(h2:text('Visual Effects')) li").count()) === 15);
  check("showcase has 8 projects", (await page.locator("section:has(h2:text('Explore the inside')) li").count()) === 8);
  check("two spotlights", (await page.locator("section:has(p:text('Genjutsu')), section:has(p:text('Seedance 2.5'))").count()) >= 2);

  check("signed-out promo shown", await page.getByText("Sign up and get your").isVisible());
  check("promo has email capture", await page.locator("#promo-email").isVisible());

  // Videos far below the fold must still be paused and unloaded.
  const bottomVideo = page.locator("video").last();
  const pausedOffscreen = await bottomVideo.evaluate((el) => el.paused);
  check("offscreen video is paused", pausedOffscreen);
  check("offscreen video has not loaded", (await bottomVideo.getAttribute("preload")) === "none");

  // The hero video is in view: it should be playing.
  const heroVideo = page.locator("video").first();
  check("in-view hero video plays", await waitFor(async () => heroVideo.evaluate((el) => !el.paused), 12000));

  await page.screenshot({ path: `${OUT}/home-desktop.png` });

  // Scroll to the bottom; the hero must stop, the banner must start.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  check("hero pauses once scrolled away", await waitFor(async () => heroVideo.evaluate((el) => el.paused)));
  check("banner video plays in view", await waitFor(async () => bottomVideo.evaluate((el) => !el.paused), 12000));

  await page.screenshot({ path: `${OUT}/home-bottom.png` });
  await page.close();
}

/* ------------------------------------------------------ reduced motion */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("video", { state: "attached", timeout: 30000 });
  await page.waitForTimeout(4000);
  console.log("\n[prefers-reduced-motion]");

  const heroVideo = page.locator("video").first();
  check("hero video does not autoplay", await heroVideo.evaluate((el) => el.paused));
  check("hero video stays unloaded", (await heroVideo.getAttribute("preload")) === "none");
  check("poster still present", Boolean(await heroVideo.getAttribute("poster")));
  check(
    "MCP wordmark is visible without animating in",
    await page.getByLabel("GPT-6 ASTRA", { exact: true }).isVisible(),
  );
  await page.close();
}

/* -------------------------------------------------------------- mobile */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("section[aria-label='Featured']", { state: "visible", timeout: 30000 });
  console.log("\n[mobile 390]");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check("no horizontal page scroll", overflow <= 0, `${overflow}px`);
  await page.screenshot({ path: `${OUT}/home-mobile.png` });
  await page.close();
}

await browser.close();
console.log(`\n${failures === 0 ? "ALL HOME CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);

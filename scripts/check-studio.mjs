/**
 * UI verification for the image studio, against the fixture harness.
 *
 * The real /ai/image is behind Clerk and needs a password I do not have, and
 * the provider account is out of balance, so this drives the same components
 * with fixture data instead. It proves the UI renders and behaves; it does not
 * prove a real generation.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const PORT = process.argv[2] ?? "3000";
const BASE = `http://localhost:${PORT}/uitest/image`;
const OUT = "scripts/.screenshots";
mkdirSync(OUT, { recursive: true });

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

/**
 * Poll an assertion until it holds.
 *
 * The page is server-rendered, so elements are visible and clickable before
 * React hydrates — an interaction landing in that window changes the DOM but
 * never reaches state, which reads as a failing assertion. Retrying the whole
 * interaction is the honest fix; waiting a fixed sleep is not.
 */
async function waitFor(fn, timeout = 15000) {
  const started = Date.now();
  for (;;) {
    try {
      if (await fn()) return true;
    } catch {
      // element churn mid-hydration
    }
    if (Date.now() - started > timeout) return false;
    await new Promise((r) => setTimeout(r, 200));
  }
}

/**
 * Block until React has hydrated the given element.
 *
 * Server-rendered markup is visible and clickable well before React attaches,
 * and an interaction in that window mutates the DOM without ever reaching
 * state. React tags each hydrated node with a `__reactProps$…` key, which is
 * the only signal here that is actually about hydration rather than a guess at
 * how long it takes.
 */
async function waitForHydration(page, selector) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps$"));
    },
    selector,
    { timeout: 30000 },
  );
}

/** The composer is mounted twice; read the one that is actually visible. */
async function visiblePrompt(page) {
  for (const id of ["#prompt-desktop", "#prompt-mobile"]) {
    const el = page.locator(id);
    if ((await el.count()) && (await el.isVisible())) return el;
  }
  return null;
}

const browser = await chromium.launch();

/* ---------------------------------------------------------------- desktop */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#prompt-desktop", { state: "visible", timeout: 30000 });
  console.log("\n[desktop 1440]");

  const composer = page.locator("aside").first();
  check("composer column visible", await composer.isVisible());
  // Scope every composer assertion to the desktop column: the mobile sheet is
  // in the DOM at all viewports, so unscoped locators match twice and go flaky.
  const box = await composer.boundingBox();
  check("composer column ~380px", Math.round(box.width) === 380, `${box?.width}px`);

  check(
    "placeholder suggests a real prompt",
    (await page.locator("#prompt-desktop").getAttribute("placeholder")).includes("Tokyo"),
  );

  const generate = composer.getByRole("button", { name: /Generate ·/ });
  check("generate shows live cost", (await generate.textContent()).includes("4 credits"));
  check("generate disabled with empty prompt", await generate.isDisabled());
  check(
    "disabled reason explained",
    await composer.getByText("Write a prompt to get started").isVisible(),
  );

  const typed = await waitFor(async () => {
    // Clear first: a pre-hydration fill leaves the DOM value already matching,
    // and fill() then skips dispatching, so React's onChange never fires.
    await page.locator("#prompt-desktop").fill("");
    await page.locator("#prompt-desktop").fill("a test prompt");
    return generate.isEnabled();
  });
  check(
    "generate enabled once prompt typed",
    typed,
    typed
      ? ""
      : `value=${JSON.stringify(await page.locator("#prompt-desktop").inputValue())} ` +
        `disabled=${await generate.getAttribute("disabled")} ` +
        `reason=${JSON.stringify((await composer.textContent())?.match(/Write a prompt[^·]*|Not enough credits[^·]*/)?.[0] ?? null)}`,
  );

  // Aspect ratios drawn as proportional rectangles, not just labels.
  for (const r of ["1:1", "16:9", "9:16", "4:3", "3:4"]) {
    check(`aspect ratio ${r} present`, await composer.getByRole("button", { name: r }).isVisible());
  }
  const wide = await composer
    .getByRole("button", { name: "16:9" })
    .locator("span span")
    .first()
    .boundingBox();
  const tall = await composer
    .getByRole("button", { name: "9:16" })
    .locator("span span")
    .first()
    .boundingBox();
  check("16:9 glyph is landscape", wide.width > wide.height, `${wide?.width}x${wide?.height}`);
  check("9:16 glyph is portrait", tall.height > tall.width, `${tall?.width}x${tall?.height}`);

  check("disabled model shows 'soon'", await composer.getByText("soon").first().isVisible());

  // Card states.
  check("QUEUED shimmer card", await page.getByText("QUEUED").first().isVisible());
  check("RUNNING shimmer card", await page.getByText("RUNNING").first().isVisible());
  check("FAILED card shows error", await page.getByText(/Exhausted balance/).isVisible());
  const retry = page.getByRole("button", { name: "Retry" });
  check("failed card has Retry", await retry.isVisible());

  await page.screenshot({ path: `${OUT}/studio-desktop.png` });

  // Retry refills the composer with the original prompt.
  let refilled = "";
  const retried = await waitFor(async () => {
    await retry.click();
    refilled = await page.locator("#prompt-desktop").inputValue();
    return refilled.includes("hummingbird");
  });
  check("retry refills composer", retried, refilled.slice(0, 40));

  /* -------------------------------------------------------------- lightbox */
  await page.locator("img[alt*='Tokyo']").first().click();
  await page.waitForTimeout(400);
  const dialog = page.getByRole("dialog", { name: "Generation detail" });
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  check("lightbox opens", await dialog.isVisible());
  check("lightbox shows prompt", await dialog.getByText(/rain-slick Tokyo/).first().isVisible());
  check("lightbox shows model", await dialog.getByText("FLUX.1 [schnell]").isVisible());
  check("lightbox shows aspect ratio", await dialog.getByText("1:1", { exact: true }).isVisible());
  check("lightbox has Download", await dialog.getByRole("button", { name: /Download/ }).isVisible());

  const toggle = dialog.getByRole("switch", { name: "Public" });
  check("public/private toggle present", await toggle.isVisible());
  check("toggle reflects isPublic=true", (await toggle.getAttribute("aria-checked")) === "true");

  await page.screenshot({ path: `${OUT}/studio-lightbox.png` });

  // Download: intercept the browser download to prove it saves a file.
  const downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
  await dialog.getByRole("button", { name: /Download/ }).click();
  const download = await downloadPromise;
  check(
    "Download produces a file",
    Boolean(download),
    download ? await download.suggestedFilename() : "no download event",
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check("lightbox closes on Escape", !(await dialog.isVisible()));

  await page.close();
}

/* ------------------------------------------------------------ empty state */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${BASE}?empty=1`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Nothing generated yet", { timeout: 30000 });
  console.log("\n[empty state]");
  check("empty state headline", await page.getByText("Nothing generated yet").isVisible());
  const examples = page.getByRole("button", { name: /rain-slick Tokyo|Brutalist concrete|hummingbird mid-flight/ });
  check("three example prompts", (await examples.count()) === 3, `${await examples.count()}`);
  let filled = "";
  const picked = await waitFor(async () => {
    await examples.first().click();
    const field = await visiblePrompt(page);
    filled = field ? await field.inputValue() : "";
    return filled.length > 20;
  });
  check("example fills composer", picked, `${filled.slice(0, 44)}…`);
  await page.screenshot({ path: `${OUT}/studio-empty.png` });
  await page.close();
}

/* ----------------------------------------------------------------- mobile */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button:has-text('Tap to write a prompt')", { timeout: 30000 });
  console.log("\n[mobile 390]");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check("no horizontal scroll", overflow <= 0, `${overflow}px`);
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  check("no duplicate element ids", dupes.length === 0, dupes.join(", "));
  check("desktop composer hidden", !(await page.locator("aside").first().isVisible()));

  const sheetToggle = page.getByRole("button", { name: /Tap to write a prompt/ });
  check("bottom sheet collapsed by default", await sheetToggle.isVisible());
  // Click only while it reports collapsed — this is a toggle, and clicking on
  // every poll just flips it shut again.
  const expanded = await waitFor(async () => {
    if (await page.locator("#prompt-mobile").isVisible()) return true;
    if ((await sheetToggle.getAttribute("aria-expanded")) === "false") {
      await sheetToggle.click();
    }
    return page.locator("#prompt-mobile").isVisible();
  });
  check("bottom sheet expands", expanded);
  await page.screenshot({ path: `${OUT}/studio-mobile.png` });
  await page.close();
}

await browser.close();
console.log(`\n${failures === 0 ? "ALL STUDIO CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);

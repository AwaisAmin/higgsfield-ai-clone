/**
 * Responsive smoke check.
 *
 * The Chrome extension cannot reach localhost in this environment, so visual
 * verification runs headless instead. Screenshots land in scripts/.screenshots/
 * (git-ignored) and the assertions print to stdout.
 *
 * Usage: node scripts/check-responsive.mjs [port]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const PORT = process.argv[2] ?? "3000";
const BASE = `http://localhost:${PORT}`;
const OUT = "scripts/.screenshots";

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let failures = 0;

const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  console.log(`\n[${vp.name}] ${vp.width}x${vp.height}`);

  // No horizontal overflow anywhere.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check("no horizontal page scroll", overflow <= 0, `overflow ${overflow}px`);

  // Header is exactly 52px and sticky.
  const headerBox = await page.locator("header").first().boundingBox();
  check("header is 52px tall", Math.round(headerBox.height) === 52, `${headerBox?.height}px`);

  // Promo bar is 60px.
  const promo = await page
    .getByRole("region", { name: "Announcement" })
    .boundingBox();
  check("promo bar is 60px tall", Math.round(promo.height) === 60, `${promo?.height}px`);

  const isMobile = vp.width < 768;

  // Rail vs hamburger.
  const hamburger = page.getByLabel("Toggle navigation menu");
  check(
    isMobile ? "hamburger visible below md" : "hamburger hidden at md+",
    (await hamburger.isVisible()) === isMobile,
  );

  // Wordmark shows on mobile only.
  const wordmark = page.locator("header").first().getByText("Higgsfield", { exact: true });
  check(
    isMobile ? "wordmark visible on mobile" : "wordmark hidden on desktop",
    (await wordmark.isVisible()) === isMobile,
  );

  // Pricing / Enterprise hidden below lg.
  const pricing = page.locator("header").first().getByRole("link", { name: "Pricing" });
  check(
    vp.width >= 1024 ? "Pricing visible at lg+" : "Pricing hidden below lg",
    (await pricing.isVisible()) === vp.width >= 1024,
  );

  // Auth actions always reachable.
  check("Login visible", await page.locator("header").first().getByRole("link", { name: "Login" }).isVisible());
  check("Sign up visible", await page.locator("header").first().getByRole("link", { name: "Sign up" }).isVisible());

  // Skip link: hidden until focused, then visible and pointing at #content.
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  check("skip link reachable by first Tab", await skip.isVisible());

  // Scrolled header state picks up its border.
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(250);
  const borderColor = await page
    .locator("header")
    .first()
    .evaluate((el) => getComputedStyle(el).borderBottomColor);
  check("header gains hairline on scroll", borderColor !== "rgba(0, 0, 0, 0)", borderColor);
  await page.evaluate(() => window.scrollTo(0, 0));

  if (isMobile) {
    await hamburger.click();
    await page.waitForTimeout(200);
    const drawerNav = page.getByRole("navigation", { name: "Main" });
    check("drawer opens", await drawerNav.isVisible());
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    check("drawer closes on Escape", !(await drawerNav.isVisible()));
  } else {
    const trigger = page.getByRole("button", { name: /Explore/ });
    await trigger.click();
    await page.waitForTimeout(200);
    const menu = page.getByRole("menu", { name: "Explore" });
    check("Explore dropdown opens", await menu.isVisible());
    check("dropdown not clipped by the rail", (await menu.boundingBox())?.height > 100);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    check("dropdown closes on Escape", !(await menu.isVisible()));
    await trigger.click();
    await page.waitForTimeout(150);
    await page.mouse.click(vp.width - 20, 400);
    await page.waitForTimeout(200);
    check("dropdown closes on outside click", !(await menu.isVisible()));
  }

  await page.screenshot({ path: `${OUT}/${vp.name}.png`, fullPage: false });
  await page.close();
}

await browser.close();
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);

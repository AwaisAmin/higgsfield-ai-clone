/**
 * Link sweep: visit every internal href the app renders and assert none 404.
 *
 * Uses a real browser rather than curl because Clerk's development instance
 * answers the first request with a handshake redirect that curl will not
 * resolve — every route looks like a 307 from the command line.
 */
import { chromium } from "playwright";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PORT = process.argv[2] ?? "3000";
const BASE = `http://localhost:${PORT}`;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "node_modules") walk(p, out);
    } else if (/\.tsx?$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

const hrefs = new Set();
for (const file of walk("src")) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/href[:=]\s*["'`](\/[^"'`\s{}]*)["'`]/g)) {
    hrefs.add(m[1]);
  }
}

const routes = [...hrefs].sort();
console.log(`sweeping ${routes.length} internal links\n`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

let broken = 0;
for (const route of routes) {
  let label = "";
  try {
    const response = await page.goto(BASE + route, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await page.waitForTimeout(250);
    const status = response?.status() ?? 0;
    const body = await page.evaluate(() => document.body.innerText);
    const notFound = /This page could not be found|^404$/m.test(body);
    const isMaintenance = body.includes("Not built yet");
    const finalPath = new URL(page.url()).pathname;
    const redirected = finalPath !== route.split("?")[0];

    if (notFound || status >= 400) {
      broken++;
      label = `BROKEN (${status})`;
    } else if (isMaintenance) {
      label = "maintenance";
    } else if (redirected) {
      label = `→ ${finalPath}`;
    } else {
      label = "ok";
    }
  } catch (error) {
    broken++;
    label = `ERROR ${String(error).slice(0, 60)}`;
  }
  console.log(`  ${label === "ok" ? "OK  " : broken && label.startsWith("BROKEN") ? "FAIL" : "OK  "}  ${route.padEnd(44)} ${label}`);
}

await browser.close();
console.log(`\n${broken === 0 ? "NO BROKEN LINKS" : `${broken} BROKEN LINK(S)`}`);
process.exit(broken === 0 ? 0 : 1);

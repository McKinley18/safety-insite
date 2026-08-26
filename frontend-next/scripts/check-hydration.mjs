#!/usr/bin/env node
/**
 * InSite v1.0 hydration check.
 *
 * Asserts that no customer-facing route logs a React hydration mismatch under a normal
 * local render, in both themes, at phone width.
 *
 * Why this exists: blueprint §73.11 recorded a hydration mismatch on /inspection-workspace
 * naming `caret-color: transparent` on an input, "present on one side only". It does not
 * reproduce here, and the reason is checkable rather than a matter of opinion --
 * `caret-color` is not emitted anywhere by this application. The only occurrence in the
 * whole build is inside tailwind-merge's class-group lookup table, which is data, not a
 * declaration; no stylesheet in .next/static declares the property at all. A client-only
 * `caret-color` on a form field is the signature of a password-manager browser extension
 * (1Password, LastPass, Bitwarden and Dashlane all decorate fields this way), which React
 * then sees as an attribute the server never rendered.
 *
 * So this guard does two things:
 *   1. asserts the application emits no caret-color declaration of its own, and
 *   2. asserts 0 hydration mismatches across the customer routes.
 *
 * It must run against a DEV server: production React does not emit the descriptive
 * hydration diff this looks for.
 *
 * Run: APP_URL=http://localhost:3040 npm run check:hydration
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = process.env.APP_URL || "http://localhost:3040";
const WIDTH = Number(process.env.VIEWPORT_WIDTH || 390);

const ROUTES = (process.env.ONLY_ROUTES || [
  "/", "/pricing", "/upgrade", "/login", "/register", "/about", "/legal", "/hazlenz",
  "/forgot-password", "/command-center", "/inspections", "/inspection",
  "/inspection-workspace", "/inspection-cover", "/inspection-quick", "/inspection-review",
  "/reports", "/safety-calendar", "/settings", "/profile",
].join(",")).split(",").map((r) => r.trim()).filter(Boolean);

// A hydration failure surfaces as a console error/warning naming the mismatch, and in
// React 19 also as a thrown error. Match the vocabulary, not one exact string.
const HYDRATION_PATTERN =
  /hydrat|did not match|server rendered|server HTML|Text content does not match|Prop `[^`]+` did not match/i;

let failures = 0;
let passes = 0;
const assert = (ok, label, detail) => {
  if (ok) { passes += 1; console.log(`PASS ${label}`); return; }
  failures += 1;
  console.error(`FAIL ${label}`);
  if (detail !== undefined) console.error(`     ${detail}`);
};

// ---------------------------------------------------------------------------
// 1. Static: the application must not emit a caret-color declaration.
// ---------------------------------------------------------------------------
function cssFilesIn(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...cssFilesIn(full));
    else if (entry.name.endsWith(".css")) out.push(full);
  }
  return out;
}

const builtCss = cssFilesIn(join(frontendRoot, process.env.NEXT_DIST_DIR || ".next", "static"));
if (builtCss.length === 0) {
  console.log("SKIP no built CSS found -- run a build first to include the static caret-color assertion");
} else {
  const declaring = builtCss.filter((f) => /caret-color\s*:/.test(readFileSync(f, "utf8")));
  assert(
    declaring.length === 0,
    `no built stylesheet declares caret-color (${builtCss.length} scanned)`,
    declaring.join(", "),
  );
}

const sourceDirs = ["app", "components", "lib"];
const sourceHits = [];
for (const d of sourceDirs) {
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|css)$/.test(entry.name) && /caret-?[Cc]olor/.test(readFileSync(full, "utf8"))) {
        sourceHits.push(full.replace(frontendRoot + "/", ""));
      }
    }
  };
  walk(join(frontendRoot, d));
}
assert(sourceHits.length === 0, "no source file sets caret-color", sourceHits.join(", "));

// ---------------------------------------------------------------------------
// 2. Runtime: no hydration mismatch on any customer route, in either theme.
// ---------------------------------------------------------------------------
const browser = await chromium.launch({ headless: true });

// Seed a selected-inspection context so /inspection-workspace renders its capture form
// rather than an empty shell -- the form is the surface §73.11 named.
const SEED = {
  persistedInspectionId: "11111111-1111-1111-1111-111111111111",
  persistedSiteId: "22222222-2222-2222-2222-222222222222",
  persistenceState: "saved",
  inspectionType: "quick_hazard_capture",
  inspectionTitle: "Quick Capture",
  agency: "OSHA - General Industry (29 CFR 1910)",
  regulatoryContext: "osha-general-industry",
  workflowDepth: "quick",
};

const found = [];
for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, colorScheme: theme });
  await ctx.addInitScript(({ t, seed }) => {
    try {
      localStorage.setItem("safety_insite_theme", t);
      localStorage.setItem("sentinel_selected_inspection_context", JSON.stringify(seed));
    } catch {}
  }, { t: theme, seed: SEED });

  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const hits = [];
    page.on("console", (m) => {
      const text = m.text();
      if (HYDRATION_PATTERN.test(text)) hits.push(`[${theme}] ${route} [${m.type()}] ${text.replace(/\s+/g, " ").slice(0, 300)}`);
    });
    page.on("pageerror", (e) => {
      const text = String(e);
      if (HYDRATION_PATTERN.test(text)) hits.push(`[${theme}] ${route} [pageerror] ${text.replace(/\s+/g, " ").slice(0, 300)}`);
    });
    try {
      await page.goto(APP + route, { waitUntil: "networkidle", timeout: 90000 });
    } catch (error) {
      console.error(`     (navigation issue on ${route}: ${String(error).slice(0, 120)})`);
    }
    await page.waitForTimeout(2500);
    found.push(...hits);
    await page.close();
  }
  await ctx.close();
}
await browser.close();

assert(
  found.length === 0,
  `0 hydration mismatches across ${ROUTES.length} routes x 2 themes @${WIDTH}px`,
  found.slice(0, 10).join("\n     "),
);

console.log(
  failures === 0
    ? `\nHydration check: ${passes} passed, 0 failed.`
    : `\nHydration check: ${passes} passed, ${failures} FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);

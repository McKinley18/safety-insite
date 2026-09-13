// §275 — WHOLE-PRODUCT LOCAL SURFACE SWEEP.
//
// Walks every user-accessible route as a REAL authenticated user at four required
// viewport widths, and records — per route and per width — the things a controlled-beta
// user would actually notice:
//
//   * does the page render at all, or does it dead-end on an error boundary
//   * does the document scroll horizontally (the v1.0 phone contract)
//   * does the browser console carry an error
//   * does any network call fail
//   * does any RAW INTERNAL TOKEN reach rendered text — snake_case, SCREAMING_CASE,
//     a retired brand, a bare UUID, or an unresolved template placeholder
//
// The last one is the reason this is a browser sweep and not a static audit: an enum
// that leaks into the DOM is invisible to `grep` over the source, because the source
// contains the identifier legitimately and only the RENDER is wrong.
//
// Authentication is real. This deliberately does NOT set NEXT_PUBLIC_DISABLE_AUTH: the
// point of §275 is the experience a beta user has behind the real guard, and a sweep run
// under the bypass measures the bypass.
//
// Usage:
//   APP_URL=http://localhost:3000 API_URL=http://localhost:4000 \
//   VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> node scripts/validate-275-product-surface.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-275";
const EMAIL = process.env.VAL_EMAIL || "validation-275-a@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "Validation275!aA";
const SHOTS = process.env.SHOTS !== "0";

const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

const VIEWPORTS = [
  { id: "desktop-1440", width: 1440, height: 1000 },
  { id: "laptop-1280", width: 1280, height: 900 },
  { id: "tablet-768", width: 768, height: 1024 },
  { id: "mobile-390", width: 390, height: 844 },
];

// Every page route on disk. `auth` records whether the route is expected to require a
// session, so an unauthenticated redirect is scored as correct rather than as a failure.
const ROUTES = [
  { path: "/", name: "Landing", auth: false },
  { path: "/login", name: "Sign in", auth: false },
  { path: "/register", name: "Create account", auth: false },
  { path: "/forgot-password", name: "Forgot password", auth: false },
  { path: "/reset-password", name: "Reset password", auth: false },
  { path: "/about", name: "About", auth: false },
  { path: "/legal", name: "Legal", auth: false },
  { path: "/pricing", name: "Pricing", auth: false },
  { path: "/hazlenz", name: "HazLenz explainer", auth: false },
  { path: "/command-center", name: "Home / command centre", auth: true },
  { path: "/inspections", name: "Inspections list", auth: true },
  { path: "/inspection", name: "Inspection", auth: true },
  { path: "/inspection-quick", name: "Quick inspection", auth: true },
  { path: "/inspection-cover", name: "Inspection cover", auth: true },
  { path: "/inspection-workspace", name: "Inspection workspace", auth: true },
  { path: "/inspection-review", name: "Inspection review", auth: true },
  { path: "/inspection-complete", name: "Inspection complete", auth: true },
  { path: "/field-capture", name: "Field capture", auth: true },
  { path: "/reports", name: "Reports", auth: true },
  { path: "/safety-calendar", name: "Safety calendar", auth: true },
  { path: "/settings", name: "Settings", auth: true },
  { path: "/profile", name: "Profile", auth: true },
  { path: "/upgrade", name: "Upgrade", auth: true },
  { path: "/unlock", name: "Unlock", auth: true },
];

/**
 * Patterns for internal tokens that must never reach rendered text.
 *
 * Each is deliberately narrow. `snake_case` for instance requires two lowercase runs
 * joined by an underscore AND excludes the handful of legitimate English renderings, so
 * "follow_up" is a hit and "e-mail" is not. Every hit is reported with its surrounding
 * text so a human can confirm it rather than trusting the pattern.
 */
const LEAK_PATTERNS = [
  { id: "SCREAMING_SNAKE", re: /\b[A-Z][A-Z0-9]{2,}(?:_[A-Z0-9]+)+\b/g },
  { id: "snake_case", re: /\b[a-z][a-z0-9]{2,}(?:_[a-z0-9]+)+\b/g },
  { id: "retired_brand", re: /\b(?:safe[\s_-]*scope|sentinel[\s_-]*safety|audit[\s_-]*ally|guide[\s_-]*guard|sight[\s_-]*signal|review[\s_-]*core)\b/gi },
  { id: "bare_uuid", re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi },
  { id: "unresolved_template", re: /\{\{[^}]{1,60}\}\}|\$\{[^}]{1,60}\}|\bundefined\b|\bNaN\b|\[object Object\]/g },
];

async function collectLeaks(page) {
  const text = await page.evaluate(() => {
    // Only what a user can actually read: skip script/style and hidden subtrees.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        const s = getComputedStyle(p);
        if (s.display === "none" || s.visibility === "hidden") return NodeFilter.FILTER_REJECT;
        return n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const out = [];
    let n;
    while ((n = walker.nextNode())) out.push(n.textContent.trim());
    return out.join("\n");
  });
  const hits = [];
  for (const { id, re } of LEAK_PATTERNS) {
    for (const m of text.matchAll(re)) {
      hits.push({ kind: id, token: m[0], context: text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, " ") });
    }
  }
  return hits;
}

/**
 * Sign in ONCE and reuse the storage state for every viewport.
 *
 * Logging in per viewport trips the real product throttle — `POST /auth/login` is
 * `@Throttle({ limit: 3, ttl: 60000 })` — and a sweep that does so measures the throttle
 * rather than the pages. The first run of this script silently lost its session on two of
 * four viewports for exactly that reason and scored the resulting login-page renders as
 * passes. One login, reused, keeps the instrument measuring the product. The throttle
 * itself is a deliberate behaviour and is exercised on its own, not incidentally here.
 */
async function signInOnce(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[type="email"], input[placeholder*="example.com"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 });
  const token = await page.evaluate(() => localStorage.getItem("sentinel_auth_token"));
  if (!token) throw new Error("§275 sweep REFUSED: UI login did not persist a session, so every authenticated row would be vacuous.");
  const state = await ctx.storageState();
  await ctx.close();
  return state;
}

async function main() {
  const browser = await chromium.launch();
  const results = [];
  const storageState = await signInOnce(browser);
  console.log("signed in once; reusing the session across all viewports\n");

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, storageState });
    const page = await ctx.newPage();

    // Real UI login, once per viewport context.
    const consoleErrors = [];
    const netFailures = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300)); });
    page.on("requestfailed", (r) => netFailures.push(`${r.method()} ${r.url()} ${r.failure()?.errorText || ""}`.slice(0, 300)));
    page.on("response", (r) => { if (r.status() >= 400) netFailures.push(`${r.status()} ${r.request().method()} ${r.url()}`.slice(0, 300)); });

    for (const route of ROUTES) {
      consoleErrors.length = 0;
      netFailures.length = 0;
      const row = { viewport: vp.id, width: vp.width, route: route.path, name: route.name, requiresAuth: route.auth };
      try {
        const resp = await page.goto(`${APP_URL}${route.path}`, { waitUntil: "networkidle", timeout: 45000 });
        row.httpStatus = resp ? resp.status() : null;
        await page.waitForTimeout(600);
        row.finalUrl = new URL(page.url()).pathname;
        row.redirected = row.finalUrl !== route.path;

        const m = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          bodyText: (document.body.innerText || "").slice(0, 400),
          h1: Array.from(document.querySelectorAll("h1")).map((e) => e.textContent.trim()).slice(0, 3),
          headingOrder: Array.from(document.querySelectorAll("h1,h2,h3,h4")).map((e) => e.tagName).slice(0, 40),
          imagesWithoutAlt: Array.from(document.querySelectorAll("img")).filter((i) => !i.hasAttribute("alt")).length,
          buttonsWithoutName: Array.from(document.querySelectorAll("button")).filter((b) => !(b.innerText || "").trim() && !b.getAttribute("aria-label") && !b.getAttribute("title")).length,
          inputsWithoutLabel: Array.from(document.querySelectorAll("input,select,textarea")).filter((el) => {
            if (el.type === "hidden") return false;
            if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("placeholder")) return false;
            return !(el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) && !el.closest("label");
          }).length,
        }));
        row.horizontalOverflow = m.scrollWidth > m.clientWidth;
        row.overflowBy = m.scrollWidth - m.clientWidth;
        row.h1 = m.h1;
        row.h1Count = m.h1.length;
        row.imagesWithoutAlt = m.imagesWithoutAlt;
        row.buttonsWithoutName = m.buttonsWithoutName;
        row.inputsWithoutLabel = m.inputsWithoutLabel;
        row.headingOrder = m.headingOrder.join(">");
        row.leaks = await collectLeaks(page);
        row.errorBoundary = /something went wrong|application error|unhandled|stack trace/i.test(m.bodyText);
        row.consoleErrors = [...new Set(consoleErrors)].slice(0, 6);
        row.networkFailures = [...new Set(netFailures)].slice(0, 6);

        if (SHOTS) {
          const f = `${shotDir}/${vp.id}__${route.path.replace(/\//g, "_") || "_root"}.png`;
          await page.screenshot({ path: f, fullPage: true });
          row.screenshot = f.replace(`${OUT_DIR}/`, "");
        }
        // An authenticated route that bounced to /login was never exercised. Scoring that
        // as a pass is how the first run of this sweep reported 80/96 while half its
        // authenticated rows were photographs of the sign-in page.
        const bouncedToLogin = route.auth && row.finalUrl === "/login";
        row.result = bouncedToLogin ? "NOT_EXERCISED"
          : row.errorBoundary || (row.httpStatus && row.httpStatus >= 500) ? "FAIL"
          : (row.horizontalOverflow || row.consoleErrors.length || row.leaks.length) ? "DEFECT"
          : "PASS";
      } catch (e) {
        row.result = "FAIL";
        row.error = String(e).slice(0, 300);
      }
      results.push(row);
      console.log(`[${vp.id}] ${row.result.padEnd(6)} ${route.path.padEnd(24)} status=${row.httpStatus ?? "-"} overflow=${row.overflowBy ?? "-"} leaks=${row.leaks?.length ?? "-"} consoleErr=${row.consoleErrors?.length ?? "-"}`);
    }
    await ctx.close();
  }
  await browser.close();

  writeFileSync(`${OUT_DIR}/route-matrix.json`, `${JSON.stringify({ generatedAt: new Date().toISOString(), appUrl: APP_URL, viewports: VIEWPORTS, results }, null, 2)}\n`);

  console.log(`\n${"=".repeat(70)}`);
  console.log(`routes ${ROUTES.length} x viewports ${VIEWPORTS.length} = ${results.length} checks`);
  for (const k of ["PASS", "DEFECT", "FAIL", "NOT_EXERCISED"]) {
    console.log(`  ${k.padEnd(14)} ${results.filter((r) => r.result === k).length}`);
  }
  console.log(`matrix: ${OUT_DIR}/route-matrix.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });

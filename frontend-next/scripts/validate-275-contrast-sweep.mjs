// §275 — TEXT CONTRAST SWEEP, IN BOTH THEMES.
//
// §275 found HazLenz's suggested risk score rendering at 1.07:1 — near-white text on a pale
// blue panel — because the panel's background was a FIXED light colour with no dark
// counterpart while its text carried `dark:text-slate-200`. The number an inspector is asked
// to confirm was effectively invisible.
//
// That defect is invisible to a source audit: both halves are individually reasonable and only
// their COMBINATION in one theme is wrong. It is also invisible to a light-theme-only screenshot
// pass. So this measures computed colours in the live DOM, in BOTH themes, and reports the
// element, the pair of colours and the ratio, so each hit can be confirmed rather than trusted.
//
// The contrast maths is WCAG 2.x relative luminance. The thresholds are the AA floors: 4.5:1 for
// normal text, 3.0:1 for large text (>=24px, or >=18.66px when bold). This is a product-quality
// baseline, not a WCAG certification — it sees only what is rendered on the routes it visits,
// and it cannot judge whether a low-contrast element is decorative.
//
// Usage:
//   APP_URL=http://localhost:3000 OUT_DIR=<dir> node scripts/validate-275-contrast-sweep.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-275";
const EMAIL = process.env.VAL_EMAIL || "validation-275-a@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "Validation275!aA";
mkdirSync(OUT_DIR, { recursive: true });

const ROUTES = [
  "/", "/login", "/register", "/pricing", "/about", "/legal", "/hazlenz",
  "/command-center", "/inspections", "/inspection", "/inspection-workspace",
  "/inspection-review", "/inspection-complete", "/reports", "/safety-calendar",
  "/settings", "/profile", "/upgrade", "/field-capture",
];

/** Runs in the page. Returns every visible text node whose contrast is below its AA floor. */
const MEASURE = () => {
  const luminance = (css) => {
    const parts = (css.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    if (parts.length < 3) return null;
    const [r, g, b] = parts.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (fg, bg) => {
    const a = luminance(fg); const b = luminance(bg);
    if (a === null || b === null) return null;
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  /**
   * The nearest ancestor that actually paints.
   *
   * Returns `null` when that ancestor paints with an IMAGE or GRADIENT rather than a flat
   * colour. The first version of this sweep walked straight past gradients looking only at
   * `background-color`, reached `body`, and reported white-on-white — 404 "failures" at a
   * suspiciously exact 202 per theme, including the login hero's "Welcome back." at 1:1, which
   * is plainly legible. A single flat colour is not a defensible summary of a gradient, so
   * those are reported as UNMEASURED instead of being scored either way.
   */
  const paintedBackground = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage && style.backgroundImage !== "none") return null;
      const bg = style.backgroundColor;
      if (bg && !/rgba?\([^)]*,\s*0\s*\)$/.test(bg) && bg !== "transparent") return bg;
      node = node.parentElement;
    }
    const bodyStyle = getComputedStyle(document.body);
    if (bodyStyle.backgroundImage && bodyStyle.backgroundImage !== "none") return null;
    return bodyStyle.backgroundColor || "rgb(255,255,255)";
  };

  const out = [];
  let unmeasured = 0;
  for (const el of document.querySelectorAll("body *")) {
    if (el.children.length > 0) continue;
    const text = (el.textContent || "").trim();
    if (!text) continue;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    // Screen-reader-only text is not painted for sighted users and has no contrast duty.
    if (box.width <= 1 && box.height <= 1) continue;
    if (el.closest(".sr-only")) continue;

    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const floor = large ? 3.0 : 4.5;
    const bg = paintedBackground(el);
    if (bg === null) { unmeasured += 1; continue; }
    const r = ratio(style.color, bg);
    if (r === null) { unmeasured += 1; continue; }
    if (r >= floor) continue;
    out.push({
      text: text.slice(0, 70),
      color: style.color,
      background: bg,
      fontSize: style.fontSize,
      fontWeight: weight,
      largeText: large,
      floor,
      contrast: Number(r.toFixed(2)),
      selector: `${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/).filter(Boolean).slice(0, 3).join(".")}`,
    });
  }
  return { hits: out, unmeasured };
};

async function main() {
  const browser = await chromium.launch();
  const findings = [];
  let unmeasuredTotal = 0;
  const notExercised = [];

  // One real login, reused — `POST /auth/login` is throttled at 3 per minute.
  const auth = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const authPage = await auth.newPage();
  await authPage.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await authPage.fill('input[type="email"], input[placeholder*="example.com"]', EMAIL);
  await authPage.fill('input[type="password"]', PASSWORD);
  await authPage.click('button[type="submit"]');
  await authPage.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 });
  const storageState = await auth.storageState();
  await auth.close();

  for (const theme of ["light", "dark"]) {
    // THE APP DOES NOT FOLLOW `prefers-color-scheme`. `app/layout.tsx` reads
    // `safety_insite_theme` from localStorage and stamps `class` + `data-theme` on <html>, so
    // Playwright's `colorScheme` alone changes nothing — the first run of this sweep reported
    // an identical 102 hits in each theme because it measured the LIGHT theme twice. Seeding
    // the key the app actually reads, before any script runs, is what makes the dark pass real.
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: theme,
      storageState,
    });
    await ctx.addInitScript(([key, value]) => {
      try { window.localStorage.setItem(key, value); } catch { /* first-party storage only */ }
    }, ["safety_insite_theme", theme]);
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      try {
        await page.goto(`${APP_URL}${route}`, { waitUntil: "networkidle", timeout: 45000 });
        await page.waitForTimeout(500);
        const applied = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
        if (applied !== theme) {
          console.log(`[${theme}] ${route.padEnd(24)} THEME NOT APPLIED (page reports ${applied}) — recorded as NOT_EXERCISED`);
          notExercised.push({ theme, route, appliedTheme: applied });
          continue;
        }
        const { hits, unmeasured } = await page.evaluate(MEASURE);
        for (const h of hits) findings.push({ theme, route, ...h });
        unmeasuredTotal += unmeasured;
        console.log(`[${theme}] ${route.padEnd(24)} below-AA: ${String(hits.length).padStart(3)}   unmeasured(gradient): ${unmeasured}`);
      } catch (e) {
        console.log(`[${theme}] ${route.padEnd(24)} ERROR ${String(e).slice(0, 90)}`);
      }
    }
    await ctx.close();
  }
  await browser.close();

  writeFileSync(`${OUT_DIR}/contrast-sweep.json`, `${JSON.stringify({ generatedAt: new Date().toISOString(), thresholds: { normal: 4.5, large: 3.0 }, unmeasuredGradientBacked: unmeasuredTotal, notExercised, findings }, null, 2)}\n`);
  const worst = [...findings].sort((a, b) => a.contrast - b.contrast).slice(0, 15);
  console.log(`\n${"=".repeat(70)}`);
  console.log(`route/theme pairs NOT EXERCISED (theme did not apply): ${notExercised.length}`);
  console.log(`unmeasured (text over a gradient or image): ${unmeasuredTotal}`);
  console.log(`below-AA text nodes: ${findings.length}  (light ${findings.filter((f) => f.theme === "light").length}, dark ${findings.filter((f) => f.theme === "dark").length})`);
  for (const w of worst) console.log(`  ${String(w.contrast).padStart(5)}:1  [${w.theme}] ${w.route}  ${JSON.stringify(w.text).slice(0, 60)}`);
  console.log(`report: ${OUT_DIR}/contrast-sweep.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });

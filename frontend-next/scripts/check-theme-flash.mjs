// Measures whether a dark-mode user's first painted frame is light.
// Records the root class/background at first paint (rAF #1) and when it settles.
import { chromium } from "playwright";

const appUrl = process.env.APP_URL || "http://localhost:3010";
const routes = (process.env.ROUTES || "/login,/command-center,/safety-calendar,/inspections").split(",");

const RECORDER = `
  window.__themeTrace = { samples: [], firstPaint: null };
  const sample = (label) => {
    const root = document.documentElement;
    if (!root) return;
    window.__themeTrace.samples.push({
      label,
      cls: root.className,
      dataTheme: root.getAttribute('data-theme'),
      colorSchemeMeta: document.querySelector('meta[name="color-scheme"]')?.content ?? null,
      bg: document.body ? getComputedStyle(document.body).backgroundColor : null,
      t: performance.now(),
    });
  };
  // addInitScript runs before documentElement exists. rAF #1 fires immediately before the
  // browser's first paint, so it is the earliest honest sample of what the user actually sees.
  requestAnimationFrame(() => { sample('raf1-first-paint'); requestAnimationFrame(() => sample('raf2')); });
  document.addEventListener('DOMContentLoaded', () => sample('domcontentloaded'));
  window.addEventListener('load', () => sample('load'));
`;

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const route of routes) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme: "dark",
    });
    // A returning user who has already chosen dark.
    await context.addInitScript(() => {
      try { window.localStorage.setItem("safety_insite_theme", "dark"); } catch (e) {}
    });
    await context.addInitScript(RECORDER);
    const page = await context.newPage();
    await page.goto(`${appUrl}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const trace = await page.evaluate(() => window.__themeTrace.samples);
    const firstPaint = trace.find((s) => s.label === "raf1-first-paint") || trace[0];
    const settled = trace[trace.length - 1];
    results.push({
      route,
      firstPaintClass: firstPaint?.cls,
      firstPaintBg: firstPaint?.bg,
      settledClass: settled?.cls,
      settledBg: settled?.bg,
      colorSchemeMeta: settled?.colorSchemeMeta,
      flashedWrongTheme: /(^|\s)light(\s|$)/.test(firstPaint?.cls || "") && /(^|\s)dark(\s|$)/.test(settled?.cls || ""),
      backgroundChangedAfterPaint: firstPaint?.bg !== settled?.bg,
    });
    await context.close();
  }
  const flashing = results.filter((r) => r.flashedWrongTheme || r.backgroundChangedAfterPaint);
  console.log(JSON.stringify({ results, routesFlashing: flashing.map((r) => r.route), passed: flashing.length === 0 }, null, 2));
  if (flashing.length) process.exitCode = 1;
} finally {
  await browser.close();
}

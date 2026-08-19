// Inspection workspace visual acceptance (light / dark / mobile).
//
// The workspace cannot be reached by a static route sweep -- it needs a live
// inspection with a HazLenz-reviewed finding. This drives the real workflow to
// the review step, then captures and audits the surface in both themes and at
// mobile width. It exists because the globals.css muted-text guard added in this
// phase is application-wide, and the workspace is the highest-priority product
// surface it could affect.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  APP_URL, VIEWPORTS, applyTheme, connectDb, createProAccount, inspectRoute, signIn,
} from "./visual-acceptance-lib.mjs";

const outDir = process.env.OUT_DIR || "/tmp/workspace-visual";
mkdirSync(`${outDir}/screenshots`, { recursive: true });

const OBSERVATION =
  "In the maintenance bay the belt guard on the air compressor drive is missing and the belt and pulley are exposed to contact while the compressor is running.";

// Same two-stage contrast method as the route-wide audit.
const SCAN = () => {
  const cvs = document.createElement("canvas"); cvs.width = cvs.height = 1;
  const c2 = cvs.getContext("2d", { willReadFrequently: true });
  const toRgb = (v) => { try { c2.fillStyle = "#000"; c2.fillStyle = v; c2.fillRect(0, 0, 1, 1);
    const d = c2.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; } catch { return null; } };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const alpha = (c) => { const m = String(c).match(/^rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(/[,\s/]+/).filter(Boolean); return p.length > 3 ? Number(p[3]) : 1; }
    return /transparent/.test(c) ? 0 : 1; };
  const out = [];
  for (const el of Array.from(document.querySelectorAll("*"))) {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) continue;
    const text = Array.from(el.childNodes).filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim()).join(" ").trim();
    if (!text) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    // Walk to the first opaque ancestor background. If a gradient/image backdrop
    // is crossed on the way, computed style cannot say what colour is actually
    // behind the glyphs -- the app header is exactly this case (a linear-gradient
    // with a transparent background-color), and naively continuing to the body
    // would "prove" that white nav labels sit on the light page background. Those
    // surfaces are covered by the pixel-based route audits instead.
    let bg = null, gradientBacked = false;
    for (let p = el; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.backgroundImage && cs.backgroundImage !== "none") { gradientBacked = true; break; }
      if (cs.backgroundColor && alpha(cs.backgroundColor) >= 0.95) { bg = toRgb(cs.backgroundColor); break; }
    }
    if (gradientBacked || !bg) continue;
    const fg = toRgb(s.color);
    if (!fg) continue;
    const size = parseFloat(s.fontSize), weight = Number(s.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const target = large ? 3.0 : 4.5;
    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = +(((hi + 0.05) / (lo + 0.05)).toFixed(2));
    if (ratio >= target) continue;
    if (el.disabled) continue; // WCAG 1.4.3 exempts inactive components
    out.push({ text: text.slice(0, 60), cls: (el.className || "").toString().slice(0, 110),
      color: `rgb(${fg.join(", ")})`, bg: `rgb(${bg.join(", ")})`, fontSize: size, target, ratio });
  }
  return out;
};

const db = await connectDb();
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const theme of ["light", "dark"]) {
    for (const vp of ["desktop", "mobile"]) {
      const context = await browser.newContext({ viewport: VIEWPORTS[vp] });
      await applyTheme(context, theme);
      await context.addInitScript(() => {
        const s = document.createElement("style");
        s.textContent = "nextjs-portal{display:none !important}";
        document.addEventListener("DOMContentLoaded", () => document.head.appendChild(s));
      });
      const page = await context.newPage();
      const account = await createProAccount(page, db, "workspace");
      await signIn(page, account.email, account.password);

      await page.goto(`${APP_URL}/inspections`, { waitUntil: "networkidle" });
      const siteName = `Workspace visual ${theme}-${vp}-${Date.now()}`;
      await page.getByLabel("New site name").fill(siteName);
      await page.getByRole("button", { name: "Save site" }).click();
      await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();
      const ctx = page.getByLabel("Regulatory context").first();
      await ctx.selectOption("osha-general-industry");
      await page.getByRole("button", { name: /Full Inspection/ }).first().click();
      await page.getByRole("button", { name: /Start Full Inspection/ }).click();
      await page.waitForURL(/inspection-workspace/, { timeout: 30000 });

      await page.locator("#observation").fill(OBSERVATION);
      await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
      await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 90000 });
      await page.waitForTimeout(1500);

      const diag = await inspectRoute(page);
      const failures = await page.evaluate(SCAN);
      const shot = `workspace-${vp}-${theme}.png`;
      await page.screenshot({ path: `${outDir}/screenshots/${shot}`, fullPage: true });
      results.push({ theme, viewport: vp, screenshot: shot, overflow: diag.overflow,
        bg: diag.bg, rootClass: diag.rootClass, contrastFailures: failures });
      console.log(`[${theme}/${vp}] overflow=${diag.overflow} bg=${diag.bg} contrastFailures=${failures.length}`);
      for (const f of failures) console.log(`    ${f.ratio}:1 (need ${f.target}) ${JSON.stringify(f.text.slice(0, 44))} ${f.color} on ${f.bg}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  await db.end();
}

writeFileSync(`${outDir}/workspace-visual.json`, JSON.stringify({ results }, null, 2));
const totalFailures = results.reduce((n, r) => n + r.contrastFailures.length, 0);
const overflow = results.filter((r) => r.overflow > 0);
console.log(`\ncaptures: ${results.length}, horizontal overflow: ${overflow.length}, contrast failures: ${totalFailures}`);

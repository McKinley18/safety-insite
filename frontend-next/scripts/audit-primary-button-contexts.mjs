// Phase 9 — primary-button coverage by rendered context.
//
// Checkpoint 2 measured a representative sample and said so. This harness makes
// the sampling explicit: it finds every RENDERED primary button across the
// customer-facing routes in both themes, groups them by the visual context that
// actually determines legibility (which surface it sits on, whether it is in a
// card / form / sticky bar, its interaction state, viewport), and measures each
// distinct context at least once from rendered pixels.
//
// It deliberately does NOT claim to have rendered every call site: many of the
// ~91 AppButton/AppLinkButton usages only mount behind data or interaction that
// this sweep does not reach. What is reported is the set of contexts actually
// observed, plus the count of source call sites, so the gap stays visible.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  APP_URL,
  VIEWPORTS,
  applyTheme,
  connectDb,
  createProAccount,
  signIn,
} from "./visual-acceptance-lib.mjs";

const outDir = process.env.OUT_DIR || "/tmp/primary-buttons";
mkdirSync(outDir, { recursive: true });

const ROUTES = [
  "/", "/about", "/pricing", "/legal", "/hazlenz",
  "/login", "/register", "/forgot-password",
  "/command-center", "/inspections", "/reports", "/safety-calendar",
  "/settings", "/profile", "/upgrade", "/unlock",
];

const FIND = () => {
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 1;
  const c2 = cvs.getContext("2d", { willReadFrequently: true });
  const toRgb = (v) => {
    try { c2.fillStyle = "#000"; c2.fillStyle = v; c2.fillRect(0, 0, 1, 1);
      const d = c2.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; } catch { return null; }
  };
  const out = [];
  for (const el of Array.from(document.querySelectorAll("button, a"))) {
    const cls = (el.className || "").toString();
    const s = getComputedStyle(el);
    const bgRgb = toRgb(s.backgroundColor);
    const isPrimaryClass = /bg-app-primary|sentinel-primary-button/.test(cls);
    // The hero CTAs paint the brand blue directly rather than through the token.
    const isBrandFill = bgRgb && ((bgRgb[0] === 29 && bgRgb[1] === 114 && bgRgb[2] === 184) ||
                                  (bgRgb[0] === 56 && bgRgb[1] === 189 && bgRgb[2] === 248));
    if (!isPrimaryClass && !isBrandFill) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const text = el.textContent.trim().slice(0, 40);
    if (!text) continue;

    // Surface the control sits on: first opaque ancestor background.
    let surface = null;
    for (let p = el.parentElement; p; p = p.parentElement) {
      const bg = getComputedStyle(p).backgroundColor;
      const m = String(bg).match(/^rgba?\(([^)]+)\)/);
      const a = m ? (m[1].split(/[,\s/]+/).filter(Boolean)[3] ?? 1) : 1;
      if (bg && bg !== "transparent" && Number(a) >= 0.95) { surface = toRgb(bg); break; }
    }
    const lum = ([r0, g0, b0]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r0) + 0.7152 * f(g0) + 0.0722 * f(b0);
    };
    const surfaceKind = surface ? (lum(surface) < 0.18 ? "dark-surface" : "light-surface") : "unknown-surface";
    const container =
      el.closest("[role=dialog],dialog") ? "modal" :
      el.closest("form") ? "form" :
      /sticky|fixed/.test(getComputedStyle(el.closest("div") || el).position) ? "sticky-bar" :
      el.closest("article,section[class*=rounded],div[class*=rounded-2xl],div[class*=rounded-\\[") ? "card" :
      "page";
    const state = el.disabled ? "disabled" :
      /loading|busy/i.test(cls) || el.getAttribute("aria-busy") === "true" ? "loading" : "rest";
    const destructiveAdjacent = !!Array.from((el.parentElement || el).querySelectorAll("button,a"))
      .find((sib) => sib !== el && /delete|remove|discard|cancel/i.test(sib.textContent || ""));
    out.push({
      text, cls: cls.slice(0, 110),
      color: `rgb(${toRgb(s.color).join(", ")})`,
      fill: `rgb(${bgRgb.join(", ")})`,
      fontSize: parseFloat(s.fontSize), fontWeight: Number(s.fontWeight) || 400,
      surfaceKind, container, state, destructiveAdjacent,
      w: Math.round(r.width), h: Math.round(r.height),
    });
  }
  return out;
};

const ANALYSE = ([dataUrl, cssColor]) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    const counts = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const unpack = (k) => [(k >> 16) & 255, (k >> 8) & 255, k & 255];
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (!entries.length) return resolve(null);
    const fg = (cssColor.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const dist = ([r, g, b]) => Math.hypot(r - fg[0], g - fg[1], b - fg[2]);
    let bg = null;
    for (const [key] of entries) { const rgb = unpack(key); if (dist(rgb) > 60) { bg = rgb; break; } }
    if (!bg) return resolve(null);
    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    resolve({ background: `rgb(${bg.join(", ")})`, ratio: +(((hi + 0.05) / (lo + 0.05)).toFixed(2)) });
  };
  img.src = dataUrl;
});

const db = await connectDb();
const browser = await chromium.launch({ headless: true });
const observations = [];

try {
  for (const theme of ["light", "dark"]) {
    for (const vp of ["desktop", "mobile"]) {
      const context = await browser.newContext({ viewport: VIEWPORTS[vp] });
      await applyTheme(context, theme);
      const page = await context.newPage();
      const account = await createProAccount(page, db, "primarybtn");
      await signIn(page, account.email, account.password);

      for (const route of ROUTES) {
        try {
          await page.goto(`${APP_URL}${route}`, { waitUntil: "networkidle", timeout: 45000 });
          await page.waitForTimeout(600);
        } catch { continue; }
        const found = await page.evaluate(FIND);
        for (const b of found) {
          const contextKey = `${theme}|${vp}|${b.surfaceKind}|${b.container}|${b.state}`;
          if (observations.some((o) => o.contextKey === contextKey)) continue; // one representative per context
          let measured = null;
          try {
            const loc = page.getByRole(b.text ? "button" : "link", { name: b.text }).first();
            const target = (await loc.count()) ? loc : page.locator(`text=${JSON.stringify(b.text)}`).first();
            await target.scrollIntoViewIfNeeded({ timeout: 2500 });
            const shot = await target.screenshot({ timeout: 5000 });
            measured = await page.evaluate(ANALYSE, [`data:image/png;base64,${shot.toString("base64")}`, b.color]);
          } catch { /* not capturable in this state */ }
          const large = b.fontSize >= 24 || (b.fontSize >= 18.66 && b.fontWeight >= 700);
          const target = large ? 3.0 : 4.5;
          observations.push({
            contextKey, theme, viewport: vp, route, ...b, largeText: large, target,
            ratio: measured ? measured.ratio : null,
            measuredBg: measured ? measured.background : null,
            // Disabled controls are exempt from WCAG 1.4.3 (inactive components).
            passes: measured ? (b.state === "disabled" ? true : measured.ratio >= target) : null,
            exempt: b.state === "disabled",
          });
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await db.end();
}

writeFileSync(`${outDir}/primary-button-contexts.json`, JSON.stringify({ observations }, null, 2));
console.log(`\n=== distinct rendered primary-button contexts: ${observations.length} ===`);
for (const o of observations) {
  const verdict = o.ratio == null ? "not-measurable" : o.exempt ? "exempt(disabled)" : o.passes ? "PASS" : "FAIL";
  console.log(`${o.theme}/${o.viewport} ${o.surfaceKind}/${o.container}/${o.state}  ${String(o.ratio).padEnd(6)} ${verdict}`);
  console.log(`    ${o.route}  "${o.text}"  fill=${o.fill} label=${o.color}`);
}
const fails = observations.filter((o) => o.passes === false);
console.log(`\nfailures: ${fails.length}`);
for (const f of fails) console.log(` - ${f.route} [${f.theme}/${f.viewport}] "${f.text}" ${f.ratio}:1 need ${f.target}`);

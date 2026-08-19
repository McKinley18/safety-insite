// Phase 5 — rendered audit of the brand-blue text pattern (#1D72B8).
//
// The literal hex appears ~111 times across ~58 files, but a static count says
// nothing about whether any given instance is legible: some sit on light cards
// that intentionally stay light in dark mode (`.inspection-panel-light`,
// `.week-glance-light`), others sit directly on the dark app surface. This
// harness finds every element whose *computed* colour is the brand blue, then
// measures its contrast against the actually-rendered background pixels and
// classifies it by semantic role, so migration decisions are driven by measured
// failures rather than by eliminating a hex value for its own sake.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  APP_URL,
  applyTheme,
  connectDb,
  createProAccount,
  signIn,
} from "./visual-acceptance-lib.mjs";

const outDir = process.env.OUT_DIR || "/tmp/blue-text";
mkdirSync(outDir, { recursive: true });

const BRAND_BLUE = "rgb(29, 114, 184)";
const DARK_COUNTERPART = "rgb(93, 183, 255)"; // #5DB7FF

const ROUTES = [
  "/", "/about", "/pricing", "/legal", "/hazlenz",
  "/login", "/register", "/forgot-password",
  "/command-center", "/inspections", "/reports", "/safety-calendar",
  "/settings", "/profile", "/upgrade",
];

// Contrast of a known text colour against the rendered background.
//
// The Checkpoint 2 harness derived BOTH colours from pixel clusters, which is
// right for a tightly-cropped control but wrong for sparse text in a large box:
// in a 268x44 table cell three glyphs never reach the cluster threshold, so the
// "furthest" cluster is a border line and the ratio is meaningless. Here the
// foreground is taken from the element's computed colour (which is exactly what
// the reader sees) and only the background is measured from pixels, where the
// dominant cluster genuinely is the surface -- including gradients and overlays
// that CSS-token math would miss.
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
    const total = entries.reduce((t, e) => t + e[1], 0);
    if (!entries.length) return resolve(null);
    const fg = (cssColor.match(/\d+/g) || []).slice(0, 3).map(Number);
    if (fg.length !== 3) return resolve(null);
    // The background is the most common cluster that is NOT the glyph colour.
    // Taking the single most common cluster breaks both ways: for sparse text in
    // a large box it is the surface (fine), but for tightly-cropped bold text the
    // glyphs themselves dominate and the ratio collapses to 1:1. Excluding
    // near-text-colour clusters resolves both cases.
    const dist = ([r, g, b]) => Math.hypot(r - fg[0], g - fg[1], b - fg[2]);
    let bg = null;
    for (const [key] of entries) {
      const rgb = unpack(key);
      if (dist(rgb) > 60) { bg = rgb; break; }
    }
    if (!bg) return resolve(null); // box is entirely glyph colour; nothing to compare
    const bgL = lum(bg);
    const [hi, lo] = [lum(fg), bgL].sort((a, b) => b - a);
    resolve({
      foreground: "rgb(" + fg.join(", ") + ")",
      background: "rgb(" + bg.join(", ") + ")",
      ratio: +(((hi + 0.05) / (lo + 0.05)).toFixed(2)),
      pixels: total,
    });
  };
  img.src = dataUrl;
});

/**
 * Classify a single element if its *computed* colour is the brand blue (or its
 * dark counterpart). Returns null for everything else. Runs per element so each
 * measurement stays bound to the element it describes.
 */
const COLLECT_ONE = (el, colors) => {
  const s = getComputedStyle(el);
  if (!colors.includes(s.color)) return null;
  // Only leaf-ish text nodes: an ancestor repeating its child's text would be
  // measured over a much larger box than the text actually occupies.
  const t = el.textContent.trim();
  if (!t) return null;
  if (Array.from(el.children).some((c) => c.textContent.trim() === t)) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  const tag = el.tagName.toLowerCase();
  const cls = (el.className || "").toString();
  const clickable = !!el.closest("a,button,[role=button],[role=link]");
  const rounded = /rounded-full/.test(cls);
  const upper = s.textTransform === "uppercase" || /uppercase/.test(cls);
  const weight = Number(s.fontWeight) || 400;
  const size = parseFloat(s.fontSize);
  // Semantic role, inferred from element identity + context rather than from
  // the utility class alone.
  let role;
  if (tag === "a" || (clickable && /underline/.test(s.textDecorationLine))) role = "link";
  else if (rounded) role = "badge";
  else if (tag === "svg" || tag === "path" || el.querySelector("svg")) role = "icon";
  else if (/^h[1-6]$/.test(tag)) role = "heading";
  else if (upper && size <= 13) role = "eyebrow";
  else if (clickable) role = "button";
  else role = "informational";
  // Record the surface the element actually sits on, walking up past
  // transparent ancestors, so an intentionally-light panel is distinguishable
  // from the dark app surface.
  let surface = "transparent";
  for (let p = el; p; p = p.parentElement) {
    const bg = getComputedStyle(p).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") { surface = bg; break; }
  }
  return {
    role, tag, surface,
    cls: cls.slice(0, 130),
    text: t.slice(0, 60),
    color: s.color,
    fontSize: size,
    fontWeight: weight,
    w: Math.round(r.width), h: Math.round(r.height),
  };
};

const db = await connectDb();
const browser = await chromium.launch({ headless: true });
const findings = [];

try {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await applyTheme(context, theme);
    const page = await context.newPage();
    const account = await createProAccount(page, db, "bluetext");
    await signIn(page, account.email, account.password);

    for (const route of ROUTES) {
      try {
        await page.goto(`${APP_URL}${route}`, { waitUntil: "networkidle", timeout: 45000 });
        await page.waitForTimeout(700);
      } catch { continue; }

      // Handles keep each measurement bound to the exact element that was
      // classified. Re-locating by tag + text can resolve to an ancestor or an
      // earlier match, which would attribute one element's pixels to another
      // and silently corrupt the audit.
      const handles = await page.$$("*");
      const pairs = [];
      for (const h of handles) {
        const n = await h.evaluate(COLLECT_ONE, [BRAND_BLUE, DARK_COUNTERPART]);
        if (n) pairs.push({ handle: h, n });
      }
      // De-duplicate repeated components (same role/class/size) within a route so
      // a 20-row list does not dominate the sample; measure one representative.
      const seen = new Set();
      for (const { handle, n } of pairs) {
        const key = `${n.role}|${n.cls}|${Math.round(n.fontSize)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        let measured = null;
        try {
          await handle.scrollIntoViewIfNeeded({ timeout: 3000 });
          const shot = await handle.screenshot({ timeout: 6000 });
          measured = await page.evaluate(ANALYSE, [
            `data:image/png;base64,${shot.toString("base64")}`,
            n.color,
          ]);
        } catch { /* off-screen or not independently screenshot-able */ }
        const large = n.fontSize >= 24 || (n.fontSize >= 18.66 && n.fontWeight >= 700);
        const target = large ? 3.0 : 4.5;
        findings.push({
          theme, route, ...n, largeText: large, target,
          ratio: measured ? measured.ratio : null,
          measuredFg: measured ? measured.foreground : null,
          extremeCluster: measured ? measured.extremeCluster : null,
          measuredBg: measured ? measured.background : null,
          passes: measured ? measured.ratio >= target : null,
        });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await db.end();
}

writeFileSync(`${outDir}/blue-text-audit.json`, JSON.stringify({ findings }, null, 2));

const byRole = {};
for (const f of findings) {
  const k = `${f.theme}/${f.role}`;
  byRole[k] = byRole[k] || { total: 0, measured: 0, fail: 0, examples: [] };
  byRole[k].total++;
  if (f.ratio != null) {
    byRole[k].measured++;
    if (!f.passes) {
      byRole[k].fail++;
      if (byRole[k].examples.length < 4) {
        byRole[k].examples.push(`${f.route} "${f.text.slice(0, 34)}" ${f.ratio}:1 (need ${f.target})`);
      }
    }
  }
}
console.log("\n=== brand-blue text by theme/role ===");
for (const k of Object.keys(byRole).sort()) {
  const v = byRole[k];
  console.log(`${k.padEnd(26)} sampled=${String(v.total).padEnd(4)} measured=${String(v.measured).padEnd(4)} FAIL=${v.fail}`);
  for (const e of v.examples) console.log(`      ${e}`);
}
const fails = findings.filter((f) => f.passes === false);
console.log(`\ntotal sampled: ${findings.length}, measured failures: ${fails.length}`);

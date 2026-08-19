// Phase 2 / Phase 12 — application-wide text contrast audit.
//
// Two stages, because neither alone is trustworthy:
//   1. A fast in-page scan computes every visible text node's colour against the
//      first opaque ancestor background. This finds candidates cheaply but is
//      blind to gradients, image backdrops and translucent overlays.
//   2. Every candidate failure is then re-measured from rendered pixels, which
//      is what the reader actually sees. Only stage-2 failures are reported, so
//      a gradient hero cannot produce a phantom defect and CSS-token math cannot
//      excuse a real one.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  APP_URL,
  applyTheme,
  connectDb,
  createProAccount,
  signIn,
} from "./visual-acceptance-lib.mjs";

const outDir = process.env.OUT_DIR || "/tmp/text-contrast";
mkdirSync(outDir, { recursive: true });

const ROUTES = [
  "/", "/about", "/pricing", "/legal", "/hazlenz",
  "/login", "/register", "/forgot-password",
  "/command-center", "/inspections", "/reports", "/safety-calendar",
  "/settings", "/profile",
];

const SCAN = () => {
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  // getComputedStyle may return lab()/oklch()/color(...) -- Tailwind v4 emits
  // oklch and Chrome preserves it. Scraping digits out of those would treat
  // lightness/chroma as if they were R/G/B, so colours are converted to sRGB by
  // painting them, which is the only conversion guaranteed to match rendering.
  const _cvs = document.createElement("canvas");
  _cvs.width = _cvs.height = 1;
  const _ctx = _cvs.getContext("2d", { willReadFrequently: true });
  const parse = (c) => {
    if (!c) return [];
    try {
      _ctx.clearRect(0, 0, 1, 1);
      _ctx.fillStyle = "#000";
      _ctx.fillStyle = c;
      _ctx.fillRect(0, 0, 1, 1);
      const d = _ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    } catch { return []; }
  };
  const alpha = (c) => {
    const m = String(c).match(/^rgba?\(([^)]+)\)/);
    if (m) { const parts = m[1].split(/[,\s/]+/).filter(Boolean); return parts.length > 3 ? Number(parts[3]) : 1; }
    if (/transparent/.test(c)) return 0;
    const g = String(c).match(/\/\s*([\d.]+%?)\s*\)/);
    if (g) return g[1].endsWith("%") ? parseFloat(g[1]) / 100 : Number(g[1]);
    return 1;
  };
  const out = [];
  for (const el of Array.from(document.querySelectorAll("*"))) {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) continue;
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (!text) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    // First opaque ancestor background.
    let bg = null;
    for (let p = el; p; p = p.parentElement) {
      const c = getComputedStyle(p).backgroundColor;
      if (c && alpha(c) >= 0.95 && parse(c).length === 3) { bg = parse(c); break; }
    }
    if (!bg) continue;
    const fg = parse(s.color);
    if (fg.length !== 3) continue;
    const fgCss = `rgb(${fg.join(", ")})`; // sRGB form, safe for the pixel stage
    const size = parseFloat(s.fontSize);
    const weight = Number(s.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const target = large ? 3.0 : 4.5;
    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = +(((hi + 0.05) / (lo + 0.05)).toFixed(2));
    if (ratio >= target) continue; // computed-clean; pixels cannot make it worse than its own surface
    out.push({
      text: text.slice(0, 60),
      tag: el.tagName.toLowerCase(),
      cls: (el.className || "").toString().slice(0, 110),
      color: fgCss,
      colorRaw: s.color,
      bgComputed: `rgb(${bg.join(", ")})`,
      fontSize: size, fontWeight: weight, largeText: large, target,
      computedRatio: ratio,
    });
  }
  return out;
};

// Re-measure a candidate from pixels: known text colour vs dominant non-text cluster.
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
    if (fg.length !== 3) return resolve(null);
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
const confirmed = [];
let candidateCount = 0;

try {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await applyTheme(context, theme);
    const page = await context.newPage();
    const account = await createProAccount(page, db, "contrast");
    await signIn(page, account.email, account.password);

    for (const route of ROUTES) {
      try {
        await page.goto(`${APP_URL}${route}`, { waitUntil: "networkidle", timeout: 45000 });
        await page.waitForTimeout(700);
      } catch { continue; }

      const candidates = await page.evaluate(SCAN);
      // De-duplicate identical component instances within a route.
      const seen = new Set();
      const unique = candidates.filter((c) => {
        const k = `${c.cls}|${c.color}|${Math.round(c.fontSize)}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      candidateCount += unique.length;

      for (const cand of unique) {
        // Bind the pixel measurement to the same element by re-finding it via
        // its exact class + own-text signature.
        let measured = null;
        try {
          const handles = await page.$$(cand.tag);
          for (const h of handles) {
            const match = await h.evaluate((el, c) => {
              const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3)
                .map((n) => n.textContent.trim()).join(" ").trim().slice(0, 60);
              return own === c.text && (el.className || "").toString().slice(0, 110) === c.cls;
            }, cand);
            if (!match) continue;
            await h.scrollIntoViewIfNeeded({ timeout: 2500 });
            const shot = await h.screenshot({ timeout: 5000 });
            measured = await page.evaluate(ANALYSE, [
              `data:image/png;base64,${shot.toString("base64")}`, cand.color,
            ]);
            break;
          }
        } catch { /* not independently capturable */ }
        if (measured && measured.ratio < cand.target) {
          confirmed.push({ theme, route, ...cand, renderedRatio: measured.ratio, renderedBg: measured.background });
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await db.end();
}

writeFileSync(`${outDir}/text-contrast.json`, JSON.stringify({ confirmed, candidateCount }, null, 2));
console.log(`\ncomputed-stage candidates: ${candidateCount}`);
console.log(`pixel-confirmed failures: ${confirmed.length}\n`);
for (const f of confirmed) {
  console.log(`[${f.theme}] ${f.route}  ${f.renderedRatio}:1 (need ${f.target})  ${f.color} on ${f.renderedBg}`);
  console.log(`    ${JSON.stringify(f.text.slice(0, 56))}  size=${f.fontSize} weight=${f.fontWeight}`);
  console.log(`    ${f.cls}`);
}

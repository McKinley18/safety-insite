// §281 (D-039) — THE ANCHOR APPEARANCE CENSUS, BEFORE AND AFTER THE CASCADE REPAIR.
//
// ==================== WHAT D-039 IS ====================
//
// `app/globals.css` carries an UNLAYERED reset:
//
//     a { text-decoration: none; color: inherit; }
//
// Tailwind 4 puts its utilities in a cascade layer (`@layer utilities`). Unlayered CSS beats
// layered CSS whatever the specificity, so that one rule silently defeats the text-colour and
// text-decoration utility on every anchor in the product. §280 measured 51 of 54 anchors carrying
// a colour utility that does not reach the pixel. It stayed hidden for a long time because the
// inherited colour is usually close to the intended one — until it is not, at which point an
// empty-state action rendered #0F172A on #0F172A at contrast 1.0, a completely unreadable button.
//
// ==================== WHY A CENSUS AND NOT A SCREENSHOT DIFF ====================
//
// The repair — layering the reset so utilities win — lets up to 51 dormant utilities take effect
// at once. The product owner's requirement is to "identify any link whose appearance materially
// changes", and a pixel diff cannot do that: it reports that something moved, not which anchor,
// not what it was, not what it became, and it drowns in antialiasing and animation noise.
//
// So this measures the thing that actually changes — the COMPUTED STYLE of every visible anchor,
// keyed by a stable identity — and the comparison is an exact per-anchor before/after table.
//
// Colours are resolved through a canvas rather than parsed, for the reason §280 recorded: Tailwind
// 4 emits CSS Color Level 4, so `bg-sky-700` computes to `lab(...)` and a naive `rgb()` regex
// returns null. That defect reported a legible blue button as white-on-white; it fails in both
// directions and it must not be reintroduced here.
//
// Contrast is computed for every anchor so the repair can be checked for making anything WORSE,
// which is the specific risk of switching 51 links to a colour nobody has looked at.
//
// Usage:
//   APP_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT=<file> node scripts/measure-281-anchor-styles.mjs
//   node scripts/measure-281-anchor-styles.mjs --compare <before.json> <after.json>

import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const EMAIL = process.env.VAL_EMAIL || "";
const PASSWORD = process.env.VAL_PASSWORD || "";
const OUT = process.env.OUT || "/tmp/insite-281-anchors.json";

// Every ACTIVE route, as classified by measure-281-route-reachability.mjs. Orphans are excluded
// deliberately: an anchor on a page no customer can open cannot have its appearance regress for
// a customer, and including them would inflate the blast radius with changes nobody can see.
const ROUTES = [
  { path: "/", auth: false },
  { path: "/login", auth: false },
  { path: "/register", auth: false },
  { path: "/about", auth: false },
  { path: "/hazlenz", auth: false },
  { path: "/pricing", auth: false },
  { path: "/legal", auth: false },
  { path: "/forgot-password", auth: false },
  { path: "/command-center", auth: true },
  { path: "/inspections", auth: true },
  { path: "/inspection-workspace", auth: true, openInspection: "Packaging line walkthrough" },
  { path: "/field-capture", auth: true },
  { path: "/reports", auth: true },
  { path: "/safety-calendar", auth: true },
  { path: "/settings", auth: true },
  { path: "/profile", auth: true },
  { path: "/inspection-complete", auth: true },
];

// Two widths, not four. The anchor's colour is not a function of viewport width — the rule that
// produces it has no media query — so the third and fourth width would re-measure the same
// declaration. 390 and 1280 are kept because the MOBILE TAB BAR only renders below `sm`, and it
// is the one place with its own `color: inherit` override that the repair could interact with.
const WIDTHS = [390, 1280];
const THEMES = ["light", "dark"];

const CENSUS = () => {
  const probe = document.createElement("canvas");
  probe.width = 1; probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });

  // Any computed colour, resolved to sRGB by the browser itself — rgb, lab, oklch, color(),
  // named, and anything CSS adds later. A regex over `rgb()` cannot do this in Tailwind 4.
  function parse(color) {
    if (!color || color === "none" || color === "transparent") return null;
    try {
      ctx.fillStyle = "#000000";
      ctx.fillStyle = color;
      if (ctx.fillStyle === "#000000") {
        ctx.fillStyle = "#ffffff";
        ctx.fillStyle = color;
        if (ctx.fillStyle === "#ffffff") return null;
        ctx.fillStyle = color;
      }
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a: a / 255 };
    } catch { return null; }
  }
  function lum({ r, g, b }) {
    const f = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  // The first OPAQUE SOLID colour behind an element, or null when the nearest painted backdrop is
  // a gradient or an image. Returning null matters: a backdrop this cannot evaluate is reported as
  // NOT MEASURED, never as a failure. §279 learned that the hard way on the login hero.
  function backdrop(el) {
    let node = el;
    while (node && node !== document.documentElement) {
      const s = getComputedStyle(node);
      if (s.backgroundImage && s.backgroundImage !== "none") return null;
      const bg = parse(s.backgroundColor);
      if (bg && bg.a > 0.5) return bg;
      node = node.parentElement;
    }
    const bs = getComputedStyle(document.body);
    if (bs.backgroundImage && bs.backgroundImage !== "none") return null;
    return parse(bs.backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  }
  function hex(c) {
    return c ? `#${[c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("")}` : null;
  }

  const rows = [];
  for (const a of Array.from(document.querySelectorAll("a"))) {
    const rect = a.getBoundingClientRect();
    const style = getComputedStyle(a);
    if (style.display === "none" || style.visibility === "hidden") continue;
    if (rect.width === 0 && rect.height === 0) continue;

    const fg = parse(style.color);
    const bg = backdrop(a);
    let ratio = null;
    if (fg && bg && fg.a > 0.9) {
      const l1 = lum(fg), l2 = lum(bg);
      ratio = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
    }

    // The class list is the anchor's IDENTITY across a style change: the repair changes which
    // declarations win, never which classes are authored. Text is included because two anchors can
    // share a class list (every nav item does) and their text is what tells them apart.
    rows.push({
      href: a.getAttribute("href") || "",
      text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
      cls: String(a.className || "").trim().slice(0, 200),
      // The utility the author ASKED for. When this is present and the computed colour equals the
      // parent's, the utility is inert — which is the defect D-039 names, stated per anchor.
      colourUtility: (String(a.className || "").match(/(?:^|\s)!?(?:dark:)?text-(?!xs|sm|base|lg|xl|\dxl|left|right|center|justify|balance|pretty|wrap|nowrap|clip|ellipsis)[a-z0-9\-[\]/.#()]+/g) || [])
        .map((s) => s.trim()),
      underlineUtility: /(?:^|\s)!?(?:dark:|hover:|group-hover:)?(?:underline|no-underline)(?:\s|$)/.test(String(a.className || "")),
      color: hex(fg),
      rawColor: style.color,
      parentColor: hex(parse(getComputedStyle(a.parentElement || document.body).color)),
      textDecorationLine: style.textDecorationLine,
      backdrop: hex(bg),
      contrast: ratio,
      fontSizePx: Math.round(parseFloat(style.fontSize) * 10) / 10,
      fontWeight: style.fontWeight,
    });
  }
  return rows;
};

function key(route, theme, width, row) {
  return `${route}|${theme}|${width}|${row.href}|${row.text}|${row.cls}`;
}

// ---------------------------------------------------------------- compare mode
if (process.argv.includes("--compare")) {
  const i = process.argv.indexOf("--compare");
  const before = JSON.parse(readFileSync(process.argv[i + 1], "utf8"));
  const after = JSON.parse(readFileSync(process.argv[i + 2], "utf8"));

  const b = new Map(before.rows.map((r) => [key(r.route, r.theme, r.width, r), r]));
  const a = new Map(after.rows.map((r) => [key(r.route, r.theme, r.width, r), r]));

  const changed = [];
  const appeared = [];
  const disappeared = [];
  for (const [k, row] of a) {
    const prev = b.get(k);
    if (!prev) { appeared.push(row); continue; }
    if (prev.color !== row.color || prev.textDecorationLine !== row.textDecorationLine) {
      changed.push({
        route: row.route, theme: row.theme, width: row.width,
        href: row.href, text: row.text,
        colourUtility: row.colourUtility,
        colorBefore: prev.color, colorAfter: row.color,
        decorationBefore: prev.textDecorationLine, decorationAfter: row.textDecorationLine,
        contrastBefore: prev.contrast, contrastAfter: row.contrast,
        backdrop: row.backdrop,
        // The judgement the product owner asked for: did this get HARDER to read?
        contrastRegressed: prev.contrast !== null && row.contrast !== null && row.contrast < prev.contrast - 0.01,
        belowFloor: row.contrast !== null && row.contrast < (row.fontSizePx >= 24 || (row.fontSizePx >= 18.66 && Number(row.fontWeight) >= 700) ? 3 : 4.5),
      });
    }
  }
  for (const [k, row] of b) if (!a.has(k)) disappeared.push(row);

  const regressions = changed.filter((c) => c.contrastRegressed);
  const belowFloor = changed.filter((c) => c.belowFloor);

  console.log(`anchors measured      before ${before.rows.length}   after ${after.rows.length}`);
  console.log(`APPEARANCE CHANGED    ${changed.length}`);
  console.log(`  contrast regressed  ${regressions.length}`);
  console.log(`  BELOW FLOOR after   ${belowFloor.length}`);
  console.log(`appeared / vanished   ${appeared.length} / ${disappeared.length}`);
  if (changed.length) {
    console.log("\n--- every anchor whose appearance changed ---");
    for (const c of changed) {
      console.log(`  ${c.route}[${c.theme}]@${c.width}  "${c.text}"`);
      console.log(`      utility ${JSON.stringify(c.colourUtility)}`);
      console.log(`      colour ${c.colorBefore} -> ${c.colorAfter}   decoration ${c.decorationBefore} -> ${c.decorationAfter}`);
      console.log(`      contrast ${c.contrastBefore} -> ${c.contrastAfter} on ${c.backdrop}${c.belowFloor ? "   *** BELOW FLOOR ***" : ""}${c.contrastRegressed ? "   (regressed)" : ""}`);
    }
  }
  const outPath = process.env.COMPARE_OUT;
  if (outPath) {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify({
      beforeCount: before.rows.length, afterCount: after.rows.length,
      changedCount: changed.length, regressionCount: regressions.length, belowFloorCount: belowFloor.length,
      changed, appeared, disappeared,
    }, null, 2));
    console.log(`\n${outPath}`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------- measure mode
(async () => {
  const browser = await chromium.launch();
  const rows = [];
  let inertUtilities = 0;
  let totalAnchors = 0;

  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: width <= 430 ? 844 : 900 },
        isMobile: width <= 430, hasTouch: width <= 430,
        colorScheme: theme === "dark" ? "dark" : "light",
      });
      const page = await context.newPage();
      await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
      await page.evaluate((v) => localStorage.setItem("safety_insite_theme", v), theme);
      await page.waitForTimeout(500);

      let signedIn = false;
      for (const route of ROUTES) {
        if (route.auth && !signedIn) {
          await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
          await page.fill('input[autocomplete="email"]', EMAIL);
          await page.fill('input[autocomplete="current-password"]', PASSWORD);
          await Promise.all([
            page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 }).catch(() => {}),
            page.click('button[type="submit"]'),
          ]);
          await page.waitForTimeout(1500);
          signedIn = true;
        }
        // Reached by pressing the product's own control, never by writing its storage key.
        if (route.openInspection) {
          await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(2500);
          await page.locator("li").filter({ hasText: route.openInspection }).first()
            .locator('[data-testid="open-inspection"]').click({ timeout: 15000 }).catch(() => {});
          await page.waitForTimeout(2000);
        }

        await page.goto(`${APP_URL}${route.path}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2200);
        const landed = new URL(page.url()).pathname;
        const census = await page.evaluate(CENSUS);
        for (const row of census) {
          totalAnchors += 1;
          // The D-039 defect, stated per anchor: a colour utility is authored, and the computed
          // colour is exactly the parent's. That is what `color: inherit` winning looks like.
          const inert = row.colourUtility.length > 0 && row.color === row.parentColor;
          if (inert) inertUtilities += 1;
          rows.push({ route: route.path, landed, theme, width, inert, ...row });
        }
      }
      await context.close();
    }
  }
  await browser.close();

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({
    instrument: "§281 D-039 anchor appearance census",
    measuredAt: new Date().toISOString(),
    routes: ROUTES.map((r) => r.path), themes: THEMES, widths: WIDTHS,
    totalAnchors, inertUtilities, rows,
  }, null, 2));

  console.log(`anchors measured            ${totalAnchors}`);
  console.log(`carrying a colour utility   ${rows.filter((r) => r.colourUtility.length > 0).length}`);
  console.log(`INERT (utility defeated)    ${inertUtilities}`);
  console.log(`\n${OUT}`);
})();

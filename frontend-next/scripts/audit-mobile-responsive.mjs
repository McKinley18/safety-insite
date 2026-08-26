// Deterministic mobile-first responsive audit.
//
// v1.0 treats phone usability as a launch requirement, and the hard contract is
// that NO primary customer page may scroll horizontally:
//
//     document.documentElement.scrollWidth <= document.documentElement.clientWidth
//
// This audit measures that at every required phone width, plus a tablet and a
// desktop control, and records the specific elements responsible for any
// violation so the layout defect can be fixed rather than hidden behind a
// global `overflow-x: hidden`.
//
// It runs against a dev server with NEXT_PUBLIC_DISABLE_AUTH=true, so no
// database, no API mutation and no account fixture is required. Nothing here
// calls a paid provider.
//
// Usage:
//   APP_URL=http://localhost:3020 OUT_DIR=<dir> node scripts/audit-mobile-responsive.mjs
//   SHOTS=1   also capture a full-page screenshot per route/width

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3020";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-mobile-audit";
const SHOTS = process.env.SHOTS === "1";
const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

// Required phone widths from the v1.0 mobile contract, plus tablet/desktop controls.
const VIEWPORTS = [
  { id: "w320", width: 320, height: 720, cls: "PHONE_REQUIRED" },
  { id: "w360", width: 360, height: 780, cls: "PHONE_REQUIRED" },
  { id: "w375", width: 375, height: 812, cls: "PHONE_REQUIRED" },
  { id: "w390", width: 390, height: 844, cls: "PHONE_REQUIRED" },
  { id: "w430", width: 430, height: 932, cls: "PHONE_REQUIRED" },
  { id: "w768", width: 768, height: 1024, cls: "TABLET" },
  { id: "w1024", width: 1024, height: 900, cls: "TABLET_LANDSCAPE" },
  { id: "w1440", width: 1440, height: 1000, cls: "DESKTOP" },
];

// Every route reachable from primary navigation, plus the auth and marketing
// surfaces a prospect hits before signing in. `/actions` is deliberately absent:
// it is not a route in this application -- corrective actions render inside
// /command-center and /inspection-workspace.
const ROUTES = [
  { path: "/", id: "home", cls: "MARKETING" },
  { path: "/about", id: "about", cls: "MARKETING" },
  { path: "/hazlenz", id: "hazlenz", cls: "MARKETING" },
  { path: "/pricing", id: "pricing", cls: "MARKETING" },
  { path: "/legal", id: "legal", cls: "MARKETING" },
  { path: "/register", id: "register", cls: "AUTH" },
  { path: "/login", id: "login", cls: "AUTH" },
  { path: "/forgot-password", id: "forgot-password", cls: "AUTH" },
  { path: "/reset-password", id: "reset-password", cls: "AUTH" },
  { path: "/command-center", id: "command-center", cls: "PRODUCT" },
  { path: "/inspections", id: "inspections", cls: "PRODUCT" },
  { path: "/inspection-workspace", id: "inspection-workspace", cls: "PRODUCT" },
  { path: "/reports", id: "reports", cls: "PRODUCT" },
  { path: "/safety-calendar", id: "safety-calendar", cls: "PRODUCT" },
  { path: "/settings", id: "settings", cls: "ACCOUNT" },
  { path: "/profile", id: "profile", cls: "ACCOUNT" },
  { path: "/upgrade", id: "upgrade", cls: "ACCOUNT" },
  { path: "/unlock", id: "unlock", cls: "ACCOUNT" },
];

/**
 * Measured in the page. Reports the overflow number the contract is written
 * against, and -- when it is non-zero -- the elements actually sticking out,
 * so the fix targets the real offender.
 */
async function measure(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const clientWidth = doc.clientWidth;
    const overflow = Math.max(0, doc.scrollWidth - clientWidth);

    const offenders = [];
    if (overflow > 0) {
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        if (r.right <= clientWidth + 1) continue;
        const cs = getComputedStyle(el);
        // A decorative blur/gradient positioned outside the frame is a
        // deliberate bleed, not a layout defect; record it separately so it is
        // never silently counted as a pass or silently "fixed".
        const decorative =
          cs.pointerEvents === "none" ||
          el.getAttribute("aria-hidden") === "true" ||
          /blur-|pointer-events-none/.test(String(el.className));
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className || "").slice(0, 90),
          right: Math.round(r.right),
          width: Math.round(r.width),
          overhang: Math.round(r.right - clientWidth),
          decorative,
        });
      }
      offenders.sort((a, b) => b.overhang - a.overhang);
    }

    // Controls whose visible box is clipped by the viewport edge, or that fall
    // below a comfortable touch target, are the mechanically detectable half of
    // "usable on a phone".
    const controls = Array.from(
      document.querySelectorAll("button, a[href], input, select, textarea, [role='button'], [role='tab']"),
    );
    const clipped = [];
    const smallTargets = [];
    for (const el of controls) {
      let r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      const label = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40);

      // A checkbox or radio wrapped in a <label> is toggled by tapping anywhere in that
      // label -- the browser does this natively -- so the label's box IS the tap target.
      // Measuring the 20px input alone would report a defect that does not exist for a
      // finger. Only an unwrapped input is measured on its own box.
      if (el.tagName === "INPUT" && /^(checkbox|radio)$/.test(el.getAttribute("type") || "")) {
        const wrapping = el.closest("label");
        if (wrapping) r = wrapping.getBoundingClientRect();
      }
      if (r.right > clientWidth + 1 || r.left < -1) {
        clipped.push({ tag: el.tagName.toLowerCase(), label, left: Math.round(r.left), right: Math.round(r.right) });
      }
      // 44px is the platform touch-target guidance both iOS and Android publish.
      // Inline text links inside a paragraph are excluded: they are read, not tapped as tiles.
      const inlineLink =
        el.tagName === "A" && el.parentElement && /^(P|SPAN|LI|LABEL)$/.test(el.parentElement.tagName);
      if (!inlineLink && (r.height < 36 || r.width < 36)) {
        smallTargets.push({ tag: el.tagName.toLowerCase(), label, w: Math.round(r.width), h: Math.round(r.height) });
      }
    }

    // MASKED vs UNMASKED.
    //
    // The shell root carries `overflow-x-hidden`, which is legitimate -- the marketing
    // heroes bleed decorative blur circles past their own edges on purpose. But that
    // same rule also hides genuine layout defects from the scrollWidth contract, so a
    // measurement taken only in the masked state cannot tell "nothing overflows" from
    // "something overflows and is being clipped".
    //
    // The unmasked pass neutralises overflow-x on the PAGE-LEVEL suppressors only
    // (html, body, the shell root) and re-measures. Card-level `overflow-hidden` on a
    // hero is left alone: clipping decorative bleed inside a card is the intended
    // behaviour, not a defect being hidden.
    const suppressors = [doc, document.body, document.querySelector(".sentinel-modern-shell")].filter(Boolean);
    const restore = suppressors.map((el) => [el, el.style.overflowX]);
    for (const el of suppressors) el.style.setProperty("overflow-x", "visible", "important");
    const unmaskedOverflow = Math.max(0, doc.scrollWidth - doc.clientWidth);
    const unmaskedOffenders = [];
    if (unmaskedOverflow > 0) {
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0 || r.right <= clientWidth + 1) continue;
        const cs = getComputedStyle(el);
        const decorative =
          cs.pointerEvents === "none" ||
          el.getAttribute("aria-hidden") === "true" ||
          /blur-|pointer-events-none/.test(String(el.className));
        unmaskedOffenders.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className || "").slice(0, 90),
          overhang: Math.round(r.right - clientWidth),
          decorative,
        });
      }
      unmaskedOffenders.sort((a, b) => b.overhang - a.overhang);
    }
    for (const [el, value] of restore) el.style.overflowX = value;

    return {
      scrollWidth: doc.scrollWidth,
      clientWidth,
      unmaskedOverflow,
      unmaskedOffenders: unmaskedOffenders.slice(0, 6),
      unmaskedRealOffenders: unmaskedOffenders.filter((o) => !o.decorative).length,
      scrollHeight: doc.scrollHeight,
      overflow,
      offenders: offenders.slice(0, 6),
      realOffenders: offenders.filter((o) => !o.decorative).length,
      clipped: clipped.slice(0, 6),
      clippedCount: clipped.length,
      smallTargets: smallTargets.slice(0, 8),
      smallTargetCount: smallTargets.length,
      h1: Array.from(document.querySelectorAll("h1")).map((n) => n.textContent.trim()).slice(0, 2),
    };
  });
}

// ONLY_ROUTES=/pricing,/upgrade narrows the sweep to specific paths. Used to re-verify a
// targeted change without re-running all 144 combinations -- the full sweep drives this
// project's Next dev server to a runaway CPU state on a loaded machine, so a narrow
// re-check is sometimes the only way to get a trustworthy measurement.
const ONLY = (process.env.ONLY_ROUTES || "")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean);
const SWEEP_ROUTES = ONLY.length ? ROUTES.filter((r) => ONLY.includes(r.path)) : ROUTES;
const ONLY_PHONE = process.env.PHONE_ONLY === "1";
const SWEEP_VIEWPORTS = ONLY_PHONE
  ? VIEWPORTS.filter((v) => v.cls === "PHONE_REQUIRED")
  : VIEWPORTS;

const browser = await chromium.launch({ headless: true });
const results = [];

for (const vp of SWEEP_VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.cls.startsWith("PHONE"),
    hasTouch: vp.cls.startsWith("PHONE"),
  });

  for (const route of SWEEP_ROUTES) {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
    });
    page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 200)}`));

    let status = 0;
    let measured = null;
    let error = null;
    try {
      const response = await page.goto(`${APP_URL}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      status = response ? response.status() : 0;
      // Client-rendered surfaces settle after hydration; a short settle beats
      // networkidle here because several product routes poll.
      await page.waitForTimeout(700);
      measured = await measure(page);
      if (SHOTS) {
        await page.screenshot({
          path: `${shotDir}/${route.id}--${vp.id}.png`,
          fullPage: true,
        });
      }
    } catch (e) {
      error = String(e).slice(0, 200);
    }

    results.push({
      route: route.path,
      routeId: route.id,
      routeClass: route.cls,
      viewport: vp.id,
      viewportWidth: vp.width,
      viewportClass: vp.cls,
      status,
      error,
      ...(measured || {}),
      consoleErrors,
    });

    await page.close();
  }

  await context.close();
  console.log(`[swept] ${vp.id} (${vp.width}px) — ${SWEEP_ROUTES.length} routes`);
}

await browser.close();

const phone = results.filter((r) => r.viewportClass === "PHONE_REQUIRED");
const overflowRows = results.filter((r) => (r.overflow || 0) > 0);
const phoneOverflow = phone.filter((r) => (r.overflow || 0) > 0);
const badStatus = results.filter((r) => r.status !== 200);
const consoleErrorRows = results.filter((r) => (r.consoleErrors || []).length > 0);
const clippedRows = phone.filter((r) => (r.clippedCount || 0) > 0);
const smallTargetRows = phone.filter((r) => (r.smallTargetCount || 0) > 0);

const summary = {
  appUrl: APP_URL,
  viewports: SWEEP_VIEWPORTS.map((v) => `${v.width}px (${v.cls})`),
  routesAudited: SWEEP_ROUTES.length,
  combinations: results.length,
  HORIZONTAL_PAGE_OVERFLOW: phoneOverflow.length,
  horizontalOverflowAllWidths: overflowRows.length,
  nonHttp200: badStatus.length,
  routeThemeConsoleErrorRows: consoleErrorRows.length,
  phoneClippedControlRows: clippedRows.length,
  phoneSmallTouchTargetRows: smallTargetRows.length,
  // Overflow that only page-level `overflow-x: hidden` was concealing. Non-decorative
  // rows here are real layout defects even though the masked contract reads 0.
  phoneUnmaskedOverflowRows: phone.filter((r) => (r.unmaskedRealOffenders || 0) > 0).length,
};

writeFileSync(`${OUT_DIR}/mobile-audit.json`, JSON.stringify({ summary, results }, null, 2));

console.log("\n=== MOBILE RESPONSIVE AUDIT ===");
console.log(JSON.stringify(summary, null, 2));

if (badStatus.length) {
  console.log("\n--- non-200 ---");
  for (const r of badStatus) console.log(`  ${r.route} @${r.viewportWidth} status=${r.status} ${r.error || ""}`);
}
if (overflowRows.length) {
  console.log("\n--- horizontal overflow ---");
  for (const r of overflowRows) {
    console.log(`  ${r.route} @${r.viewportWidth}px overflow=${r.overflow}px (scrollWidth ${r.scrollWidth} > clientWidth ${r.clientWidth})`);
    for (const o of r.offenders || []) {
      console.log(`      ${o.decorative ? "[decorative] " : ""}<${o.tag}> +${o.overhang}px  ${o.cls}`);
    }
  }
}
const unmaskedRows = phone.filter((r) => (r.unmaskedRealOffenders || 0) > 0);
if (unmaskedRows.length) {
  console.log("\n--- overflow concealed by page-level overflow-x:hidden (non-decorative) ---");
  for (const r of unmaskedRows) {
    console.log(`  ${r.route} @${r.viewportWidth}px unmasked=${r.unmaskedOverflow}px`);
    for (const o of (r.unmaskedOffenders || []).filter((x) => !x.decorative).slice(0, 4)) {
      console.log(`      <${o.tag}> +${o.overhang}px  ${o.cls}`);
    }
  }
}
if (clippedRows.length) {
  console.log("\n--- clipped controls (phone widths) ---");
  for (const r of clippedRows) {
    console.log(`  ${r.route} @${r.viewportWidth}px ${r.clippedCount} clipped`);
    for (const c of r.clipped) console.log(`      <${c.tag}> "${c.label}" left=${c.left} right=${c.right}`);
  }
}
if (smallTargetRows.length) {
  console.log("\n--- sub-36px touch targets (phone widths) ---");
  for (const r of smallTargetRows) {
    console.log(`  ${r.route} @${r.viewportWidth}px ${r.smallTargetCount} small`);
    for (const t of r.smallTargets) console.log(`      <${t.tag}> "${t.label}" ${t.w}x${t.h}`);
  }
}
if (consoleErrorRows.length) {
  console.log("\n--- console errors ---");
  for (const r of consoleErrorRows) {
    console.log(`  ${r.route} @${r.viewportWidth}px`);
    for (const e of r.consoleErrors.slice(0, 3)) console.log(`      ${e}`);
  }
}

console.log(`\nArtifacts: ${OUT_DIR}/mobile-audit.json${SHOTS ? ` + ${shotDir}` : ""}`);
console.log(
  summary.HORIZONTAL_PAGE_OVERFLOW === 0
    ? "\nHORIZONTAL_PAGE_OVERFLOW = 0 across all required phone widths."
    : `\nHORIZONTAL_PAGE_OVERFLOW = ${summary.HORIZONTAL_PAGE_OVERFLOW} — layout defects remain.`,
);

process.exit(summary.HORIZONTAL_PAGE_OVERFLOW === 0 && badStatus.length === 0 ? 0 : 1);

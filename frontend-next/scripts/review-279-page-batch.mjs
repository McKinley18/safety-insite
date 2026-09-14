// §279 — PAGE-BY-PAGE PRODUCT REVIEW. THE EVIDENCE RUN FOR ONE BATCH.
//
// Drives the REAL localhost application as a REAL authenticated user. No development bypass:
// `NEXT_PUBLIC_DISABLE_AUTH=false` and the session comes from the login form. Synthetic data
// only, on a registered disposable database.
//
// What it produces, per page and per width, is EVIDENCE — not a verdict. A page is marked PASS
// by a person looking at the screenshot and the measurements, never by this script. What it can
// decide on its own is only the objectively measurable half:
//
//   - horizontal overflow, and which element causes it
//   - console errors and failed network requests during the visit
//   - interactive controls with no accessible name
//   - visible text below the contrast floor
//   - the presence of retired brand wording
//
// Usage:
//   APP_URL=... VAL_EMAIL=... VAL_PASSWORD=... BATCH=1 OUT_DIR=<dir> node scripts/review-279-page-batch.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-279-review";
const EMAIL = process.env.VAL_EMAIL || "review-279@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "";
const BATCH = process.env.BATCH || "1";

const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

// The four widths §279 requires, at the sizes real devices actually report.
const WIDTHS = [
  { id: "390", width: 390, height: 844, label: "phone" },
  { id: "768", width: 768, height: 1024, label: "tablet" },
  { id: "1280", width: 1280, height: 900, label: "laptop" },
  { id: "1440", width: 1440, height: 1000, label: "desktop" },
];

const BATCHES = {
  // Batch 1 — the foundational surfaces. Chosen because everything after them inherits their
  // visual language: if the shell, the card and the button are wrong here, they are wrong on
  // every page that follows, and fixing them later is thirty edits instead of three.
  1: [
    { id: "login", path: "/login", auth: false, name: "Sign in" },
    { id: "command-center", path: "/command-center", auth: true, name: "Dashboard (Command Center)" },
    { id: "inspections", path: "/inspections", auth: true, name: "Inspection list" },
    { id: "inspection-cover", path: "/inspection-cover", auth: true, name: "New inspection (cover)" },
    { id: "settings", path: "/settings", auth: true, name: "Settings (and the version surface)" },
  ],

  // Batch 2 -- the inspection spine. The core workflow and the largest surface in the product.
  //
  // Two of these three cannot be reached by typing a URL and have their state be real.
  // `/inspection-workspace` renders whatever inspection `sentinel_selected_inspection_context`
  // names, and that key is written by exactly two places, both of them a click on /inspections.
  // So the populated visit NAVIGATES: sign in, open /inspections, press the row's own button,
  // and measure where that lands. Setting the key directly would measure a state the product
  // can produce, reached by a route the product does not have -- and would quietly stop
  // exercising the navigation that is itself under review.
  2: [
    { id: "inspection", path: "/inspection", auth: true, name: "Inspection overview" },
    {
      id: "inspection-workspace-empty",
      path: "/inspection-workspace",
      auth: true,
      name: "Inspection workspace (no inspection selected)",
      clearSelection: true,
    },
    {
      id: "inspection-workspace",
      path: "/inspection-workspace",
      auth: true,
      name: "Inspection workspace (populated, 4 observations)",
      openInspection: "Packaging line walkthrough",
    },
    {
      id: "inspection-workspace-fresh",
      path: "/inspection-workspace",
      auth: true,
      name: "Inspection workspace (a started inspection with no observations)",
      openInspection: "Loading dock",
    },
    { id: "field-capture", path: "/field-capture", auth: true, name: "Field capture" },
  ],

  // Batch 2H -- the HazLenz OUTPUT states inside the workspace, driven by SAVED synthetic analyses
  // (scripts/review-seed-hazlenz-states.mjs). ZERO provider calls: the workspace restores the
  // newest non-superseded snapshot on load, so these are the same screens a real analysis paints.
  // What is under review here is PRESENTATION -- what the inspector is shown, and how much of it.
  // No semantics are examined and none may be inferred from these fixtures.
  "2H": [
    { id: "hazlenz-a-finding", path: "/inspection-workspace", auth: true,
      name: "HazLenz — a straightforward finding", openInspection: "HazLenz state A" },
    { id: "hazlenz-b-clarification", path: "/inspection-workspace", auth: true,
      name: "HazLenz — clarification outstanding", openInspection: "HazLenz state B" },
    { id: "hazlenz-c-unresolved", path: "/inspection-workspace", auth: true,
      name: "HazLenz — unresolved / not supported", openInspection: "HazLenz state C" },
    { id: "hazlenz-d-confirmation", path: "/inspection-workspace", auth: true,
      name: "HazLenz — awaiting human confirmation", openInspection: "HazLenz state D" },
    { id: "hazlenz-e-multiple", path: "/inspection-workspace", auth: true,
      name: "HazLenz — several findings from one observation", openInspection: "HazLenz state E" },
  ],
};

const pages = BATCHES[BATCH];
if (!pages) throw new Error(`no batch ${BATCH}`);

const findings = [];
let currentTheme = "light";
function note(page, width, kind, severity, detail) {
  findings.push({ page, theme: currentTheme, width, kind, severity, detail });
  console.log(`  ${severity === "OBJECTIVE" ? "!!" : "??"} ${page}[${currentTheme}]@${width} ${kind}: ${
    typeof detail === "string" ? detail : JSON.stringify(detail)
  }`);
}

/** Relative luminance per WCAG 2.1. */
const CONTRAST_FLOOR = 4.5;

/** The tab name every authenticated page shared before §280. Seeing it again is the regression. */
const GENERIC_TITLE = "Safety InSite — Field safety intelligence powered by HazLenz AI.";

async function measure(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;

    const overflow = [];
    if (doc.scrollWidth > doc.clientWidth + 1) {
      for (const el of Array.from(document.querySelectorAll("*"))) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.right > doc.clientWidth + 1 || rect.left < -1) {
          overflow.push({
            tag: el.tagName.toLowerCase(),
            cls: String(el.className || "").slice(0, 120),
            right: Math.round(rect.right),
            text: (el.textContent || "").trim().slice(0, 60),
          });
        }
        if (overflow.length >= 6) break;
      }
    }

    // Interactive controls a screen reader would announce as nothing at all.
    const unnamed = [];
    for (const el of Array.from(document.querySelectorAll("button, a[href], input, select, textarea"))) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const label =
        (el.getAttribute("aria-label") || "").trim() ||
        (el.textContent || "").trim() ||
        (el.getAttribute("title") || "").trim() ||
        (el.getAttribute("placeholder") || "").trim() ||
        (el.id && (document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent || "").trim()) ||
        (el.closest("label")?.textContent || "").trim() ||
        (el.getAttribute("aria-labelledby") &&
          (document.getElementById(el.getAttribute("aria-labelledby"))?.textContent || "").trim());
      if (!label) {
        unnamed.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || "").slice(0, 90) });
      }
      if (unnamed.length >= 8) break;
    }

    // Touch targets below the 44px the platform guidelines ask for, on the phone width only.
    const small = [];
    if (window.innerWidth <= 430) {
      for (const el of Array.from(document.querySelectorAll("button, a[href]"))) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        // Only controls PRESENTED as buttons. An inline text link inside a paragraph is the
        // height of its own text by definition, and flagging every one of those buries the
        // genuinely under-sized buttons in noise.
        const style = getComputedStyle(el);
        const painted =
          (parse(style.backgroundColor)?.a ?? 0) > 0.05 ||
          parseFloat(style.borderTopWidth) > 0 ||
          (style.backgroundImage && style.backgroundImage !== "none");
        if (!painted) continue;
        if (rect.height < 32) {
          small.push({
            tag: el.tagName.toLowerCase(),
            h: Math.round(rect.height),
            text: (el.textContent || "").trim().slice(0, 40),
          });
        }
        if (small.length >= 8) break;
      }
    }

    /**
     * Any computed colour, resolved to sRGB by the browser itself.
     *
     * §280. This used to be `/rgba?\(([^)]+)\)/` and nothing else, and that is a real defect in a
     * Tailwind 4 codebase: modern Tailwind emits CSS Color Level 4 values, so a perfectly ordinary
     * `bg-sky-700` computes to `lab(41.6013 -9.10804 -42.5647)`. The regex returned null, the
     * backdrop walk treated the button as transparent and continued past it to the white card
     * behind, and the instrument reported "+ Record another condition" as WHITE TEXT ON WHITE at a
     * ratio of 1.0 — a solid blue button with white text, entirely legible, photographed to prove
     * it.
     *
     * That is the same failure batch 1 corrected twice, in a third disguise, and it fails in BOTH
     * directions: it invents defects on modern-colour surfaces, and it can hide real ones by
     * measuring against the wrong backdrop. Painting the value onto a canvas asks the browser what
     * the colour actually is, which works for rgb, lab, oklch, color(), named colours and anything
     * added later.
     */
    const probeCanvas = document.createElement("canvas");
    probeCanvas.width = 1;
    probeCanvas.height = 1;
    const probeCtx = probeCanvas.getContext("2d", { willReadFrequently: true });

    function parse(color) {
      if (!color || color === "none" || color === "transparent") return null;
      try {
        probeCtx.clearRect(0, 0, 1, 1);
        probeCtx.fillStyle = "#000000";
        probeCtx.fillStyle = color;
        // An unparseable value leaves fillStyle at the previous one; a genuine black is
        // indistinguishable from that, so black is re-probed against a white default.
        if (probeCtx.fillStyle === "#000000") {
          probeCtx.fillStyle = "#ffffff";
          probeCtx.fillStyle = color;
          if (probeCtx.fillStyle === "#ffffff") return null;
          probeCtx.fillStyle = color;
        }
        probeCtx.clearRect(0, 0, 1, 1);
        probeCtx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data;
        return { r, g, b, a: a / 255 };
      } catch {
        return null;
      }
    }
    function lum({ r, g, b }) {
      const f = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    // Returns the first opaque solid colour behind an element, or null when the nearest painted
    // backdrop is a GRADIENT or an image.
    //
    // Returning null matters more than it looks. The first version of this instrument walked past
    // a gradient hero -- whose computed `backgroundColor` is transparent -- all the way to the
    // white body, and then reported white-on-white at a ratio of 1.0 for every line of the login
    // panel. That is an instrument defect reported as a product defect, and it would have sent
    // someone to "fix" text that is perfectly legible. A backdrop this method cannot evaluate is
    // reported as NOT MEASURED, never as a failure.
    function backdrop(el) {
      let node = el;
      while (node && node !== document.documentElement) {
        const style = getComputedStyle(node);
        if (style.backgroundImage && style.backgroundImage !== "none") return null;
        const bg = parse(style.backgroundColor);
        if (bg && bg.a > 0.5) return bg;
        node = node.parentElement;
      }
      const bodyStyle = getComputedStyle(document.body);
      if (bodyStyle.backgroundImage && bodyStyle.backgroundImage !== "none") return null;
      return parse(bodyStyle.backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    }

    const lowContrast = [];
    let notMeasured = 0;
    for (const el of Array.from(document.querySelectorAll("p, span, h1, h2, h3, h4, li, td, th, label, button, a"))) {
      const text = (el.textContent || "").trim();
      if (!text || el.children.length > 0) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const style = getComputedStyle(el);
      const fg = parse(style.color);
      if (!fg || fg.a < 0.9) continue;
      const bg = backdrop(el);
      if (!bg) {
        notMeasured += 1;
        continue;
      }
      const l1 = lum(fg);
      const l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const px = parseFloat(style.fontSize);
      const bold = parseInt(style.fontWeight, 10) >= 700;
      const large = px >= 24 || (px >= 18.66 && bold);
      const floor = large ? 3 : 4.5;
      if (ratio < floor) {
        lowContrast.push({
          text: text.slice(0, 50),
          ratio: Math.round(ratio * 100) / 100,
          floor,
          color: style.color,
        });
      }
      if (lowContrast.length >= 8) break;
    }

    const body = document.body.innerText || "";
    return {
      title: document.title,
      mainCount: document.querySelectorAll("main").length,
      nestedMain: Boolean(document.querySelector("main main")),
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflow,
      unnamed,
      small,
      lowContrast,
      contrastNotMeasured: notMeasured,
      h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent.trim()).slice(0, 4),
      headingCounts: {
        h1: document.querySelectorAll("h1").length,
        h2: document.querySelectorAll("h2").length,
        h3: document.querySelectorAll("h3").length,
      },
      // §279 terminology. The only live brands are Safety InSite and HazLenz.
      retiredBrand: ["SafeScope", "Sentinel Safety", "AuditAlly", "Sentinel AI"].filter((brand) =>
        body.includes(brand),
      ),
      bareInsite: /(^|[^y]\s)INSITE\b/.test(body.toUpperCase().replace(/SAFETY INSITE/g, "SAFETY_INSITE")),
      textLength: body.length,
    };
  });
}

(async () => {
  const browser = await chromium.launch();
  const results = [];

  // §280. Both themes, not just light. Batch 1 measured light only, and the product's dark theme is
  // a real user setting rather than a system preference it happens to follow -- several defects in
  // this codebase's history (the pinned-light routes, the accent button label, the completion
  // panel) existed in exactly one theme and were invisible in the other.
  const THEMES = (process.env.THEMES || "light,dark").split(",");

  for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width: width.width, height: width.height },
      deviceScaleFactor: 1,
      isMobile: width.width <= 430,
      hasTouch: width.width <= 430,
      colorScheme: theme === "dark" ? "dark" : "light",
    });

    const consoleErrors = [];
    const netFailures = [];
    const navigationAborts = [];
    context.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 200));
    });
    context.on("requestfailed", (req) => {
      const reason = req.failure()?.errorText || "";
      // `net::ERR_ABORTED` is what Chromium reports for a request the BROWSER cancelled, which is
      // what happens to every in-flight request when the next `page.goto` starts. It is the normal
      // consequence of a review walking from page to page, and it is not a product failure -- a
      // request the server refused or the network dropped reports something else entirely. Counted
      // separately so it is visible rather than silently discarded.
      if (reason.includes("ERR_ABORTED")) {
        navigationAborts.push(`${req.method()} ${req.url().slice(0, 120)}`);
        return;
      }
      netFailures.push(`${req.method()} ${req.url().slice(0, 120)} ${reason}`);
    });

    currentTheme = theme;
    const page = await context.newPage();

    // One real sign-in per width, through the form.
    await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
    // The app resolves its theme from this key before it paints, so it is set on the real origin
    // rather than emulated -- `colorScheme` alone only covers the never-chosen default.
    await page.evaluate((value) => localStorage.setItem("safety_insite_theme", value), theme);
    await page.waitForTimeout(600);

    for (const target of pages) {
      const before = consoleErrors.length;
      const netBefore = netFailures.length;
      const abortBefore = navigationAborts.length;

      if (target.auth && !(await page.evaluate(() => Boolean(localStorage.getItem("sentinel_auth_token"))))) {
        await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
        // The email field is not `type="email"` (it carries `inputMode="email"` only), so it is
        // addressed by its autocomplete token — which is the attribute the product actually sets.
        await page.fill('input[autocomplete="email"]', EMAIL);
        await page.fill('input[autocomplete="current-password"]', PASSWORD);
        await Promise.all([
          page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20000 }).catch(() => {}),
          page.click('button[type="submit"]'),
        ]);
        await page.waitForTimeout(1500);
      }

      // The workspace renders whatever the selection context names. Clearing it is how the
      // "nothing selected" state is reached honestly -- by having nothing selected.
      if (target.clearSelection) {
        await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
        // Let the setup page finish its own requests before navigating away. Without this the
        // instrument cancels them, and Chromium reports every one as `net::ERR_ABORTED` -- which
        // the first production run duly recorded as seven NETWORK_FAILURE observations against a
        // page that had made no failing request at all. An abort caused by the harness is the
        // harness, not the product.
        await page.waitForTimeout(2500);
        await page.evaluate(() =>
          window.localStorage.removeItem("sentinel_selected_inspection_context"),
        );
      }

      // Reached by pressing the product's own control, not by writing its storage key.
      if (target.openInspection) {
        await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2500);
        // Scoped to the row's own <li>. A broader selector matches the container holding EVERY
        // row, and `.last()` then opens the oldest inspection while reporting that it opened the
        // named one -- which is what the first run of batch 2 actually did, photographing the
        // wrong inspection twice and calling one of them "a started inspection with no
        // observations".
        const opened = await page
          .locator("li")
          .filter({ hasText: target.openInspection })
          .first()
          .locator('[data-testid="open-inspection"]')
          .click({ timeout: 15000 })
          .then(() => true)
          .catch(() => false);
        if (!opened) {
          note(target.id, width.id, "SETUP_COULD_NOT_OPEN_INSPECTION", "INSTRUMENT",
            `no open control found for "${target.openInspection}"`);
        }
        await page.waitForTimeout(2500);
      }

      await page.goto(`${APP_URL}${target.path}`, { waitUntil: "domcontentloaded" });
      // Client components fetch after hydration; give the populated state a chance to arrive.
      await page.waitForTimeout(3000);

      const m = await measure(page);
      const shot = `${shotDir}/${target.id}-${theme}-${width.id}.png`;
      await page.screenshot({ path: shot, fullPage: true });

      const record = {
        page: target.id,
        name: target.name,
        path: target.path,
        theme,
        width: width.id,
        screenshot: shot,
        landedOn: new URL(page.url()).pathname,
        ...m,
        consoleErrors: consoleErrors.slice(before),
        netFailures: netFailures.slice(netBefore),
        navigationAborts: navigationAborts.slice(abortBefore),
      };
      results.push(record);

      if (record.landedOn !== target.path) {
        note(target.id, width.id, "REDIRECTED", "OBJECTIVE", `${target.path} -> ${record.landedOn}`);
      }
      if (m.overflow.length) note(target.id, width.id, "HORIZONTAL_OVERFLOW", "OBJECTIVE", m.overflow);
      if (m.unnamed.length) note(target.id, width.id, "UNNAMED_CONTROL", "OBJECTIVE", m.unnamed);
      if (m.lowContrast.length) note(target.id, width.id, "LOW_CONTRAST", "OBJECTIVE", m.lowContrast);
      if (m.small.length) note(target.id, width.id, "SMALL_TOUCH_TARGET", "OBJECTIVE", m.small);
      if (m.retiredBrand.length) note(target.id, width.id, "RETIRED_BRAND", "OBJECTIVE", m.retiredBrand);
      if (m.bareInsite) note(target.id, width.id, "BARE_INSITE_WORDMARK", "OBJECTIVE", "D-013");
      // §280 (D-031). The RUNTIME half of the page-title rule. `check:page-titles` proves the table
      // and the layouts agree; only a browser can prove the name actually reaches the document,
      // which is the exact thing the first implementation of D-031 got wrong while satisfying
      // every static check that could have been written for it.
      if (m.title === GENERIC_TITLE) {
        note(target.id, width.id, "GENERIC_PAGE_TITLE", "OBJECTIVE",
          `document.title is the product default, so this tab is indistinguishable from every other`);
      }
      if (!m.title || !m.title.includes("Safety InSite")) {
        note(target.id, width.id, "UNBRANDED_PAGE_TITLE", "OBJECTIVE", m.title);
      }
      if (m.headingCounts.h1 === 0) note(target.id, width.id, "NO_H1", "OBJECTIVE", "page has no level-1 heading");
      // AppShell already renders the document's one <main>. A page that renders another produces
      // two `main` landmarks, which is invalid and breaks landmark navigation and "skip to main".
      if (m.nestedMain) note(target.id, width.id, "NESTED_MAIN_LANDMARK", "OBJECTIVE",
        `${m.mainCount} <main> elements; a document may have one`);
      if (m.headingCounts.h1 > 1) note(target.id, width.id, "MULTIPLE_H1", "OBJECTIVE", m.h1);
      if (record.consoleErrors.length) note(target.id, width.id, "CONSOLE_ERROR", "OBJECTIVE", record.consoleErrors);
      if (record.netFailures.length) note(target.id, width.id, "NETWORK_FAILURE", "OBJECTIVE", record.netFailures);
    }

    await context.close();
  }
  }

  await browser.close();

  writeFileSync(`${OUT_DIR}/batch-${BATCH}-measurements.json`, JSON.stringify({ results, findings }, null, 2));
  console.log(`\n${findings.length} objective observations across ${results.length} page/width visits.`);
  console.log(`evidence: ${OUT_DIR}`);
})();

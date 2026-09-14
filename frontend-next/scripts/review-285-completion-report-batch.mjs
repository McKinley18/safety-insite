// §285 — BATCH 4. THE COMPLETION AND REPORT SURFACES, IN A REAL BROWSER.
//
// ==================== INSTRUMENT DISCIPLINE (§285) ====================
//
// §283 established that `requestfailed` is structurally blind to HTTP error statuses -- a 402 is a
// COMPLETED request -- so `netFailures: 0` was never evidence that nothing failed. This instrument
// records FOUR separate classes and never conflates them:
//
//   consoleErrors   browser console messages of type `error`, including Chromium's own
//                   "Failed to load resource: the server responded with a status of NNN"
//   httpErrors      every response with status >= 400, recorded from the `response` event --
//                   the class the §279-§281 instruments could not see at all
//   requestFailures TRANSPORT failures only (DNS, refused, aborted, timeout), with
//                   harness-caused `ERR_ABORTED` counted separately
//   pageErrors      uncaught exceptions in the page
//
// It also records the ACCOUNT'S ENTITLEMENT STATE, because §284 found that the single variable
// distinguishing two contradictory review runs was the one neither of them wrote down.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> [TIER=free|entitled] \
//     node scripts/review-285-completion-report-batch.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-285-batch4";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
const TIER = process.env.TIER || "unspecified";
const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

const WIDTHS = [
  { id: "390", width: 390, height: 844 },
  { id: "768", width: 768, height: 1024 },
  { id: "1280", width: 1280, height: 900 },
  { id: "1440", width: 1440, height: 1000 },
];
const TARGETS = [
  { id: "inspection-complete", path: "/inspection-complete", name: "Completed inspection",
    openInspection: "state A" },
  { id: "reports", path: "/reports", name: "Report library" },
];

const findings = [];
function note(target, width, theme, kind, severity, detail) {
  findings.push({ target, width, theme, kind, severity, detail });
  console.log(`  ${severity === "OBJECTIVE" ? "!!" : "??"} ${target}[${theme}]@${width} ${kind}: `
    + `${JSON.stringify(detail).slice(0, 150)}`);
}

// The account's entitlement state, read from the SERVER rather than from the token's claim.
const login = await (await fetch(`${API_URL}/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})).json();
const token = login.accessToken || login.access_token || login.token;
const claims = token ? JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()) : {};
const reportProbe = token
  ? await fetch(`${API_URL}/inspection-reports`, { headers: { Authorization: `Bearer ${token}` } })
  : null;
const entitlementState = {
  tierDeclaredByRunner: TIER,
  jwtPlanClaim: claims.planCode || claims.subscriptionTier || "unknown",
  reportListStatus: reportProbe?.status ?? null,
  note: "The JWT claim is a CACHED value; EntitlementService treats a live subscription row or an "
    + "active grant as authoritative over it. Both are recorded so a later reader can tell which "
    + "tier this evidence describes.",
};

const browser = await chromium.launch();
const results = [];

for (const theme of ["light", "dark"]) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width: width.width, height: width.height },
      deviceScaleFactor: 1,
      isMobile: width.width <= 430,
      hasTouch: width.width <= 430,
      colorScheme: theme,
    });

    const consoleErrors = [];
    const httpErrors = [];
    const requestFailures = [];
    const navigationAborts = [];
    const pageErrors = [];
    context.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200)); });
    context.on("response", (r) => {
      if (r.status() >= 400) httpErrors.push(`${r.request().method()} ${r.status()} ${r.url().slice(0, 130)}`);
    });
    context.on("requestfailed", (r) => {
      const reason = r.failure()?.errorText || "";
      const line = `${r.method()} ${r.url().slice(0, 120)} ${reason}`;
      if (reason.includes("ERR_ABORTED")) navigationAborts.push(line);
      else requestFailures.push(line);
    });
    context.on("weberror", (e) => pageErrors.push(String(e.error()).slice(0, 200)));

    const page = await context.newPage();
    await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 20000 });
    await page.evaluate((v) => localStorage.setItem("safety_insite_theme", v), theme);
    await page.waitForTimeout(1500);
    await page.fill('input[autocomplete="email"]', EMAIL);
    await page.fill('input[autocomplete="current-password"]', PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25000 });
    await page.waitForTimeout(1500);

    for (const target of TARGETS) {
      const before = {
        console: consoleErrors.length, http: httpErrors.length,
        failed: requestFailures.length, aborts: navigationAborts.length, pageErr: pageErrors.length,
      };
      if (target.openInspection) {
        await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2500);
        await page.locator("li").filter({ hasText: target.openInspection }).first()
          .locator('[data-testid="open-inspection"]').click({ timeout: 15000 })
          .catch(() => note(target.id, width.id, theme, "SETUP_COULD_NOT_OPEN", "INSTRUMENT",
            target.openInspection));
        await page.waitForTimeout(2000);
      }
      await page.goto(`${APP_URL}${target.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3500);

      const m = await page.evaluate(() => {
        const body = document.body.innerText || "";
        const overflow = [];
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.right > document.documentElement.clientWidth + 1) {
            overflow.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
            if (overflow.length >= 5) break;
          }
        }
        /**
         * TWO THRESHOLDS, AND THEY MEAN DIFFERENT THINGS.
         *
         * `belowProjectFloor` uses 36px, which is THIS PRODUCT'S established mobile touch-target
         * floor (§73.3, recorded in `components/ui/AppButton.tsx`). A control under it is an
         * objective defect against a standard the project already set.
         *
         * `belowNativeGuideline` uses 44px, the iOS Human Interface Guidelines minimum and WCAG
         * 2.5.5 (AAA). A control between 36 and 44 is NOT a defect against the project's own rule;
         * it is a finding for the Pre-Production App-Format gate, which is the lens §285 asked for.
         * Reporting it as a defect would be inventing a standard mid-review.
         */
        const controls = Array.from(document.querySelectorAll("button, a, input, select"))
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              label: `${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 24)}`,
              w: Math.round(r.width), h: Math.round(r.height),
            };
          })
          .filter((c) => c.w > 0 && c.h > 0);
        const belowProjectFloor = controls
          .filter((c) => c.h < 36 || c.w < 36).map((c) => `${c.label} ${c.w}x${c.h}`).slice(0, 8);
        const belowNativeGuideline = controls
          .filter((c) => (c.h >= 36 && c.h < 44) || (c.w >= 36 && c.w < 44))
          .map((c) => `${c.label} ${c.w}x${c.h}`).slice(0, 8);
        const unnamed = Array.from(document.querySelectorAll("button, a"))
          .filter((el) => !(el.textContent || "").trim()
            && !el.getAttribute("aria-label") && !el.getAttribute("title"))
          .map((el) => el.tagName.toLowerCase()).slice(0, 5);
        // Developer vocabulary and internal identifiers on a customer surface.
        const leakage = ["riskSnapshot", "sourceCandidate", "resultSnapshot", "guidedFinding",
          "criticalUnknowns", "observationId", "inspectionId", "storageObjectId", "sha256",
          "sourceFingerprint", "generatorVersion"].filter((t) => body.includes(t));
        const rawUuid = (body.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi) || [])
          .slice(0, 3);
        return {
          title: document.title,
          h1: Array.from(document.querySelectorAll("h1")).map((h) => (h.textContent || "").trim()),
          mainCount: document.querySelectorAll("main").length,
          nestedMain: Boolean(document.querySelector("main main")),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflow, belowProjectFloor, belowNativeGuideline, unnamed, leakage, rawUuid,
          textLength: body.length,
          retiredBrand: ["SafeScope", "Sentinel Safety", "SentinelSafety"].filter((b) => body.includes(b)),
          bodyExcerpt: body.slice(0, 900),
        };
      });

      const shot = `${shotDir}/${target.id}-${theme}-${width.id}.png`;
      await page.screenshot({ path: shot, fullPage: true });

      const record = {
        target: target.id, name: target.name, path: target.path, theme, width: width.id,
        landedOn: new URL(page.url()).pathname, screenshot: shot, ...m,
        consoleErrors: consoleErrors.slice(before.console),
        httpErrors: httpErrors.slice(before.http),
        requestFailures: requestFailures.slice(before.failed),
        navigationAborts: navigationAborts.slice(before.aborts),
        pageErrors: pageErrors.slice(before.pageErr),
      };
      results.push(record);

      if (record.landedOn !== target.path) {
        note(target.id, width.id, theme, "REDIRECTED", "OBJECTIVE", `${target.path} -> ${record.landedOn}`);
      }
      if (m.overflow.length) note(target.id, width.id, theme, "HORIZONTAL_OVERFLOW", "OBJECTIVE", m.overflow);
      if (m.unnamed.length) note(target.id, width.id, theme, "UNNAMED_CONTROL", "OBJECTIVE", m.unnamed);
      if (m.belowProjectFloor.length) {
        note(target.id, width.id, theme, "BELOW_PROJECT_TOUCH_FLOOR_36", "OBJECTIVE", m.belowProjectFloor);
      }
      if (m.belowNativeGuideline.length) {
        note(target.id, width.id, theme, "BELOW_NATIVE_TOUCH_GUIDELINE_44", "APP_FORMAT", m.belowNativeGuideline);
      }
      if (m.leakage.length) note(target.id, width.id, theme, "DEVELOPER_VOCABULARY", "OBJECTIVE", m.leakage);
      if (m.rawUuid.length) note(target.id, width.id, theme, "RAW_UUID_ON_CUSTOMER_SURFACE", "OBJECTIVE", m.rawUuid);
      if (m.retiredBrand.length) note(target.id, width.id, theme, "RETIRED_BRAND", "OBJECTIVE", m.retiredBrand);
      if (!m.title || !m.title.includes("Safety InSite")) {
        note(target.id, width.id, theme, "UNBRANDED_PAGE_TITLE", "OBJECTIVE", m.title);
      }
      if (m.h1.length === 0) note(target.id, width.id, theme, "NO_H1", "OBJECTIVE", "no level-1 heading");
      if (m.h1.length > 1) note(target.id, width.id, theme, "MULTIPLE_H1", "OBJECTIVE", m.h1);
      if (m.nestedMain) note(target.id, width.id, theme, "NESTED_MAIN", "OBJECTIVE", m.mainCount);
      // The four error classes, each recorded under its own name.
      if (record.consoleErrors.length) note(target.id, width.id, theme, "CONSOLE_ERROR", "OBJECTIVE", record.consoleErrors);
      if (record.httpErrors.length) note(target.id, width.id, theme, "HTTP_ERROR_STATUS", "OBJECTIVE", record.httpErrors);
      if (record.requestFailures.length) note(target.id, width.id, theme, "TRANSPORT_FAILURE", "OBJECTIVE", record.requestFailures);
      if (record.pageErrors.length) note(target.id, width.id, theme, "UNCAUGHT_PAGE_ERROR", "OBJECTIVE", record.pageErrors);
    }
    await context.close();
  }
}

await browser.close();
writeFileSync(`${OUT_DIR}/batch4-measurements.json`, JSON.stringify({
  instrument: "§285 Batch 4 — completion and report surfaces",
  measuredAt: new Date().toISOString(),
  entitlementState,
  errorClassNote: "consoleErrors / httpErrors / requestFailures / navigationAborts / pageErrors are "
    + "recorded SEPARATELY. `requestFailures` is transport-only and can never evidence the absence "
    + "of an HTTP error status; `httpErrors` is the class that answers that question.",
  results, findings,
}, null, 2));
console.log(`\n${findings.length} observation(s) across ${results.length} page/theme/width visits.`);
console.log(`evidence: ${OUT_DIR}`);

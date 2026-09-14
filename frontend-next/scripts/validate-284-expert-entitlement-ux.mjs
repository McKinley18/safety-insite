// §284 (S-15) — THE EXPERT ENTITLEMENT SURFACE, IN A REAL BROWSER, ON THE PATH A USER TAKES.
//
// ==================== WHY THIS EXISTS AND THE PAGE-REVIEW BATCH DOES NOT SUFFICE ====================
//
// `review-279-page-batch` reaches each surface with `page.goto`, which is a FULL DOCUMENT LOAD. That
// is correct for what it measures -- one page, photographed in a known state -- but it means the
// client's session state is destroyed between every target, so it measures the UNSUPPRESSED case by
// construction: one Expert request per visit, 64 visits, 64 refusals.
//
// A user does not reload. They sign in once and move between observations with the product's own
// controls, inside one document. THAT is the path §284's "do not issue repeated Expert execution
// requests from a known non-entitled state" is about, and it is the path this script drives: after
// the sign-in there is no `page.goto` at all, only clicks on real links and real buttons.
//
// ==================== THE ASYMMETRY IS THE POINT ====================
//
// A Free account must ask ONCE and then stop. An ENTITLED account must ask EVERY TIME -- because the
// suppression may only ever be armed by a server-authoritative REFUSAL, never by a plan claim. The
// entitled leg is therefore not a nicety: it is the falsification. If suppression ever leaked into
// the entitled path, this script fails, and a client that had started deciding entitlement for
// itself would be caught here rather than in production by an upgraded customer who still could not
// use what they had paid for.
//
// The entitled account is deliberately one whose BILLING TIER IS FREE and which holds an active Pro
// ENTITLEMENT GRANT -- the §283 control shape. A client that suppressed from its own idea of the
// plan would refuse to ask on its behalf and would show it a plan notice it has already paid past.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... \
//   ENTITLED_EMAIL=... ENTITLED_PASSWORD=... OUT_DIR=<dir> \
//     node scripts/validate-284-expert-entitlement-ux.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-284-expert-ux";
const FREE_EMAIL = process.env.VAL_EMAIL;
const FREE_PASSWORD = process.env.VAL_PASSWORD;
const ENTITLED_EMAIL = process.env.ENTITLED_EMAIL;
const ENTITLED_PASSWORD = process.env.ENTITLED_PASSWORD;
mkdirSync(`${OUT_DIR}/screenshots`, { recursive: true });

const results = [];
let failures = 0;
function check(id, condition, detail = "") {
  results.push({ id, outcome: condition ? "PASS" : "FAIL", detail: String(detail).slice(0, 300) });
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${id}${detail ? `  [${String(detail).slice(0, 150)}]` : ""}`);
}

/** The three seeded HazLenz states the walk visits, in order. */
const STATES = ["HazLenz state A", "HazLenz state B", "HazLenz state C"];

/**
 * Sign in, then walk the three states using ONLY the product's own navigation, and report what the
 * Expert surface did on each. Returns the per-observation readings plus every Expert request the
 * page made across the whole session.
 */
async function walk(browser, email, password, theme = "light") {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: theme === "dark" ? "dark" : "light",
  });
  const expertRequests = [];
  const documentLoads = [];
  const page = await context.newPage();
  page.on("request", (request) => {
    if (/expert-analyses/.test(request.url())) {
      expertRequests.push(`${request.method()} ${request.url().split("/observations/")[1] || request.url()}`);
    }
  });
  page.on("load", () => documentLoads.push(new URL(page.url()).pathname));

  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  const submit = page.locator('button[type="submit"]');
  await submit.waitFor({ state: "visible", timeout: 20000 });
  await page.evaluate((value) => localStorage.setItem("safety_insite_theme", value), theme);
  // The form is a client component; submitting before hydration is a click that does nothing.
  await page.waitForTimeout(1500);
  await page.fill('input[autocomplete="email"]', email);
  await page.fill('input[autocomplete="current-password"]', password);
  await submit.click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 });

  // FROM HERE ON: no page.goto. One document, the product's own controls.
  const visits = [];
  for (const state of STATES) {
    const before = expertRequests.length;
    await page.getByRole("link", { name: /Inspect/i }).first().click();
    await page.waitForTimeout(2500);
    await page.locator("li").filter({ hasText: state }).first()
      .locator('[data-testid="open-inspection"]').click({ timeout: 15000 });
    await page.waitForTimeout(4000);
    visits.push({
      state,
      landedOn: new URL(page.url()).pathname,
      expertRequests: expertRequests.length - before,
      notEntitledPanels: await page.locator('[data-testid="expert-not-entitled"]').count(),
      analysisPanels: await page.locator('[data-testid="expert-analysis-panel"]').count(),
      runControls: await page.getByRole("button", { name: /run expert review/i }).count(),
      /**
       * Scoped to the EXPERT SECTION, deliberately. The §284 decision is about how the Expert plan
       * boundary is presented -- it says nothing about whether other components on the workspace
       * may use an alert, and a whole-page count asserts something no decision claimed. The first
       * run of this script did exactly that and failed against a transient notice elsewhere on the
       * page that had nothing to do with Expert.
       *
       * Both readings are kept: the scoped one is the assertion, the page-wide one is recorded so a
       * future failure is diagnosable rather than a number with no text behind it.
       */
      expertAlerts: await page.locator(
        'section[aria-label="Expert analysis"] [role="alert"]',
      ).count(),
      expertErrorStyling: await page.locator(
        'section[aria-label="Expert analysis"] [class*="text-red"], '
        + 'section[aria-label="Expert analysis"] [class*="bg-red"], '
        + 'section[aria-label="Expert analysis"] [class*="border-red"]',
      ).count(),
      pageAlertTexts: (await page.locator('[role="alert"]').allInnerTexts())
        .map((t) => t.trim()).filter(Boolean),
      seeProLinks: await page.getByRole("link", { name: /see pro/i }).count(),
      panelText: (await page.locator('section[aria-label="Expert analysis"]').first()
        .innerText().catch(() => "")).replace(/\n+/g, " | ").trim(),
    });
  }
  await page.screenshot({ path: `${OUT_DIR}/screenshots/${email.split("@")[0]}-${theme}-1280.png`, fullPage: true });
  await context.close();
  return { visits, expertRequests, documentLoads };
}

const browser = await chromium.launch();

// =================================================================================================
// FREE. Asks once, then stops. Never shows an enabled Expert control. Never shows an error.
// =================================================================================================
const free = await walk(browser, FREE_EMAIL, FREE_PASSWORD, "light");

check("F0 the whole walk happened inside ONE document, so session state is real",
  free.documentLoads.length === 1 && free.documentLoads[0] === "/login",
  free.documentLoads.join(","));
check("F1 all three observations were reached",
  free.visits.length === 3 && free.visits.every((v) => v.landedOn === "/inspection-workspace"),
  free.visits.map((v) => v.landedOn).join(","));
check("F2 every observation shows the plan surface",
  free.visits.every((v) => v.notEntitledPanels === 1),
  free.visits.map((v) => v.notEntitledPanels).join(","));
check("F3 NO ENABLED EXPERT CONTROL on any observation — the S-15 decision itself",
  free.visits.every((v) => v.runControls === 0),
  free.visits.map((v) => v.runControls).join(","));
check("F4 the plan boundary is NOT presented as an error — no alert role on the Expert surface",
  free.visits.every((v) => v.expertAlerts === 0),
  free.visits.map((v) => v.expertAlerts).join(","));
check("F4b and no error-red styling on it either — §281 measured exactly that, and it is the "
  + "half of the defect a role check alone would miss",
  free.visits.every((v) => v.expertErrorStyling === 0),
  free.visits.map((v) => v.expertErrorStyling).join(","));
check("F5 the capability is not hidden — it names itself and offers a destination",
  free.visits.every((v) => /Available with Pro/.test(v.panelText) && v.seeProLinks === 1),
  free.visits[0]?.panelText);
check("F6 it says the deterministic analysis is unaffected",
  free.visits.every((v) => /unaffected/i.test(v.panelText)));
check("F7 THE SERVER IS ASKED EXACTLY ONCE for the whole session, not once per observation",
  free.expertRequests.length === 1,
  `${free.expertRequests.length} request(s): ${free.expertRequests.join(" ")}`);
check("F8 and the observations after the first made no request at all",
  free.visits.slice(1).every((v) => v.expertRequests === 0),
  free.visits.map((v) => v.expertRequests).join(","));

// =================================================================================================
// ENTITLED — THE FALSIFICATION. An entitled account must be unaffected in every respect, and must
// ask on EVERY observation. If this leg ever starts suppressing, the client has begun deciding
// entitlement for itself.
// =================================================================================================
if (ENTITLED_EMAIL && ENTITLED_PASSWORD) {
  const entitled = await walk(browser, ENTITLED_EMAIL, ENTITLED_PASSWORD, "light");

  check("E1 the entitled account never sees the plan surface",
    entitled.visits.every((v) => v.notEntitledPanels === 0),
    entitled.visits.map((v) => v.notEntitledPanels).join(","));
  check("E2 it sees the Expert panel with its control on every observation",
    entitled.visits.every((v) => v.analysisPanels === 1 && v.runControls === 1),
    entitled.visits.map((v) => `${v.analysisPanels}/${v.runControls}`).join(","));
  check("E3 CONTROL: it asks the server on EVERY observation — suppression never leaks here",
    entitled.expertRequests.length === STATES.length
      && entitled.visits.every((v) => v.expertRequests === 1),
    `${entitled.expertRequests.length} request(s) across ${STATES.length} observations`);
  writeFileSync(`${OUT_DIR}/entitled-walk.json`, JSON.stringify(entitled, null, 2));
} else {
  check("E0 the entitled control leg was NOT RUN — no ENTITLED_EMAIL supplied", false,
    "the Free result alone cannot show that suppression is keyed on a refusal");
}

writeFileSync(`${OUT_DIR}/free-walk.json`, JSON.stringify(free, null, 2));
writeFileSync(`${OUT_DIR}/results.json`, JSON.stringify({ results, failures }, null, 2));
console.log(`\n${results.length - failures} passed, ${failures} failed.`);
console.log(`§284 Expert entitlement UX: ${failures ? "FAIL" : "PASS"}`);
await browser.close();
process.exit(failures ? 1 : 0);

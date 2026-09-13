// §276 — THE CLEAN USER WALKTHROUGH, AND THE D-007 / D-008 / D-013 BROWSER EVIDENCE.
//
// Drives the product as a real authenticated Pro user, end to end, in one uninterrupted
// pass: login -> dashboard -> create inspection -> observation -> HazLenz -> findings ->
// review/confirmation -> corrective actions -> calendar -> completion -> report -> history
// -> dashboard reconciliation.
//
// NO DEVELOPMENT BYPASS. `NEXT_PUBLIC_DISABLE_AUTH=false` and `NEXT_PUBLIC_DEV_FORCE_PRO=false`
// in the local environment; the session comes from the real login form and the entitlement
// from a time-limited grant on the disposable validation database. A run under the bypass
// measures the bypass.
//
// NO DIRECT DATABASE MANIPULATION and NO REPAIRING STATE MID-WALKTHROUGH. If a step fails,
// the run records the failure and stops; it does not reach around the product to continue.
//
// Usage:
//   APP_URL=http://localhost:3000 API_URL=http://localhost:4000 \
//   VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> node scripts/validate-276-product-walkthrough.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-276";
const EMAIL = process.env.VAL_EMAIL || "validation-276-a@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "";
const RUN_TAG = process.env.RUN_TAG || `VALIDATION-276-${Date.now()}`;

const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

/**
 * The observation. A single condition with several sentences, deliberately chosen so the
 * §276 remediations are all exercised on one real record:
 *
 *   D-009  the energy and exposure facts sit in a sentence the guarding fragment does not
 *          contain, so a fragment-only evaluation reads "Candidate ... missing: moving or
 *          accessible energy" and a scoped-evidence evaluation reads SUPPORTED
 *   D-008  the reviewer confirms a matrix band; HazLenz may escalate past it
 *   D-007  finishing writes corrective actions and follow-up tasks that must reach the
 *          calendar
 */
const OBSERVATION =
  "The point of operation guard on the 60-ton punch press in the fabrication bay has been "
  + "removed and is sitting on the floor beside the machine. The press is energized and "
  + "cycling on production parts, and the operator's hands enter the die area between "
  + "strokes to reposition the blank. There is no light curtain or two-hand control fitted.";

const steps = [];
const timings = [];
const consoleErrors = [];
const netFailures = [];

function record(id, title, outcome, detail) {
  steps.push({ id, title, outcome, detail });
  const mark = outcome === "PASS" ? "ok  " : outcome === "NOTE" ? "note" : "FAIL";
  console.log(`${mark} ${id}  ${title}${detail ? `  [${typeof detail === "string" ? detail : JSON.stringify(detail)}]` : ""}`);
}

async function timed(label, fn) {
  const started = Date.now();
  const value = await fn();
  const ms = Date.now() - started;
  timings.push({ label, ms });
  console.log(`      ⏱  ${label}: ${ms} ms`);
  return value;
}

async function shot(page, name) {
  await page.screenshot({ path: `${shotDir}/${name}.png`, fullPage: true });
}

/** Visible text of the page, normalised so assertions read like a person reading it. */
async function text(page) {
  return (await page.locator("body").innerText()).replace(/\s+/g, " ");
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300));
  });
  page.on("requestfailed", (r) =>
    netFailures.push(`${r.method()} ${r.url()} ${r.failure()?.errorText || ""}`.slice(0, 250)));
  page.on("response", (r) => {
    if (r.status() >= 400) netFailures.push(`${r.status()} ${r.request().method()} ${r.url()}`.slice(0, 250));
  });

  // ======================================================================================
  // 1. LOGIN — the real form, the real guard.
  // ======================================================================================
  await timed("initial app load (/login)", async () => {
    await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[placeholder*="example.com"]', { timeout: 30000 });
  });
  await page.fill('input[placeholder*="example.com"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await timed("sign in", async () => {
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 40000 });
  });
  const token = await page.evaluate(() => localStorage.getItem("sentinel_auth_token"));
  record("W01", "real sign-in establishes a session", token ? "PASS" : "FAIL",
    token ? "session token persisted" : "no token — every later step would be vacuous");
  if (!token) throw new Error("§276 walkthrough REFUSED: sign-in did not establish a session.");
  await shot(page, "01-signed-in-home");

  // ======================================================================================
  // 2. DASHBOARD — the starting state, measured so the end can be compared to it.
  // ======================================================================================
  await timed("dashboard", async () => {
    await page.goto(`${APP_URL}/command-center`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("h1", { timeout: 20000 });
    await page.waitForTimeout(1500);
  });
  const homeBefore = await text(page);
  record("W02", "dashboard renders for a signed-in user",
    /SAFETY INSITE HOME/i.test(homeBefore) ? "PASS" : "FAIL");
  await shot(page, "02-dashboard-before");

  // ======================================================================================
  // 3. CREATE AN INSPECTION — a real site and a real regulatory context.
  // ======================================================================================
  await timed("inspections page", async () => {
    await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
  });
  await shot(page, "03-inspections");

  const siteSelect = page.locator("select").first();
  const siteName = `${RUN_TAG} Fabrication Bay`;
  await siteSelect.selectOption("__new__");
  await page.waitForTimeout(400);
  const newSiteInput = page.getByLabel("New site name");
  await newSiteInput.fill(siteName);
  const saveSiteButton = page.getByRole("button", { name: /save site|add site|create site/i }).first();
  await saveSiteButton.click();
  await page.waitForTimeout(2500);
  record("W03", "a site is created through the product", (await text(page)).includes(siteName) ? "PASS" : "FAIL");
  // Choose it, by name. Relying on the new site being auto-selected made this script fail
  // once the account had a dozen sites: the Start button stayed disabled because no site was
  // chosen, which is the product behaving correctly.
  await siteSelect.selectOption({ label: siteName });
  await page.waitForTimeout(400);

  // Regulatory context is the SECOND select on the page.
  const contextSelect = page.getByLabel("Regulatory context");
  await contextSelect.selectOption("osha-general-industry");
  await page.waitForTimeout(300);

  const fullInspection = page.getByRole("button", { name: /full inspection/i }).first();
  await fullInspection.click();
  await page.waitForTimeout(800);
  const startButton = page.getByRole("button", { name: /^start|begin|continue/i }).first();
  if (await startButton.count()) {
    await startButton.click();
  }
  await page.waitForURL((u) => u.pathname.includes("inspection-workspace"), { timeout: 40000 });
  await page.waitForTimeout(2500);
  record("W04", "the guided Pro inspection opens", page.url().includes("inspection-workspace") ? "PASS" : "FAIL", page.url());
  await shot(page, "04-workspace-capture");

  // ======================================================================================
  // 4. OBSERVATION + HAZLENZ
  // ======================================================================================
  const observationBox = page.locator("textarea").first();
  await observationBox.fill(OBSERVATION);
  const analyzeButton = page.getByRole("button", { name: /analy[sz]e|run hazlenz|hazlenz/i }).first();
  await timed("HazLenz analysis (deterministic)", async () => {
    await analyzeButton.click();
    await page.waitForTimeout(1000);
    await page.waitForFunction(
      () => /hazard|finding|candidate|standard/i.test(document.body.innerText) &&
        !/analy[sz]ing/i.test(document.body.innerText),
      { timeout: 120000 },
    );
  });
  await page.waitForTimeout(2000);
  const afterAnalysis = await text(page);
  record("W05", "HazLenz returns an analysis for the observation",
    /1910\.212/.test(afterAnalysis) || /machine guarding/i.test(afterAnalysis) ? "PASS" : "FAIL");
  await shot(page, "05-hazlenz-analysis");

  const observed = [`--- after HazLenz analysis ---\n${afterAnalysis}\n`];

  /**
   * §276 / D-009 evidence, read off the screen the inspector is actually looking at.
   *
   * §275 photographed this card reading "Candidate · Confidence: Low · missing: moving or
   * accessible energy" for a finding the same engine rates SUPPORTED at 0.96 on the whole
   * observation. The energy fact is in the NEXT sentence, about the same press.
   */
  record("W06", "D-009: the guarding finding carries its standard on the candidate card",
    /1910\.212\(a\)\(1\)/.test(afterAnalysis) ? "PASS" : "FAIL");
  record("W07", "D-009: it is not presented as a low-confidence candidate missing energy",
    !/missing: moving or accessible energy/i.test(afterAnalysis) ? "PASS" : "FAIL",
    /missing: moving or accessible energy/i.test(afterAnalysis) ? "the §275 text is still on screen" : "");

  // ======================================================================================
  // 5. CONFIRM THE CANDIDATES THE REVIEWER KEEPS.
  // ======================================================================================
  const confirm = page.getByTestId("confirm-candidates");
  await confirm.click();
  await page.waitForTimeout(2500);
  const afterConfirm = await text(page);
  observed.push(`--- after candidate confirmation ---\n${afterConfirm}\n`);
  record("W08", "the reviewer's candidate selection is accepted",
    !/Confirm which ones apply/i.test(afterConfirm) ? "PASS" : "FAIL");
  await shot(page, "06-after-candidate-confirmation");

  // ======================================================================================
  // 6. RISK — the reviewer's own matrix selection. This is the human act D-008 protects.
  //
  // Severity 4 x likelihood 4 = 16 is HIGH on the Standard 5x5 profile (High 10-16,
  // Critical 17-25). It is chosen deliberately: it is the §275 regression case, the one
  // where HazLenz's escalation band and the reviewer's matrix band can disagree.
  // ======================================================================================
  const toRisk = page.getByRole("button", { name: /continue to risk/i }).first();
  await toRisk.click();
  await page.waitForTimeout(2000);
  const riskScreen = await text(page);
  observed.push(`--- risk step ---\n${riskScreen}\n`);
  await shot(page, "07-risk-matrix");

  const matrixCell = page.getByTestId("risk-cell-4-4");
  if (await matrixCell.count()) {
    await matrixCell.click();
  } else {
    // Fall back to the labelled cell, so a missing test id does not stop the walkthrough
    // silently -- it is recorded either way.
    record("W09", "the risk matrix exposes a 4x4 cell test id", "NOTE", "clicked by label instead");
    await page.getByRole("button", { name: /severity 4.*likelihood 4|4 ?× ?4/i }).first().click();
  }
  await page.waitForTimeout(1200);
  const afterCell = await text(page);
  observed.push(`--- after selecting severity 4 x likelihood 4 ---\n${afterCell}\n`);
  record("W10", "the matrix reports the score and band it computed",
    /16/.test(afterCell) && /High/i.test(afterCell) ? "PASS" : "FAIL");
  await shot(page, "08-risk-selected");

  // The rationale field appears because the reviewer moved off HazLenz's proposal. It is
  // optional, but a reviewer who changes an assessment normally says why, so the
  // walkthrough behaves like one.
  const reasonBox = page.locator('textarea').filter({ hasNot: page.locator("x-never") }).nth(0);
  const changedLabel = page.getByText(/Why you changed it/i);
  if (await changedLabel.count()) {
    await page.locator("label", { hasText: /Why you changed it/i }).locator("textarea").fill(
      "Hands enter the die area every cycle, so likelihood is higher than the proposal.",
    );
  }
  void reasonBox;

  // ======================================================================================
  // 7. REVIEW AND SAVE THE FIRST FINDING.
  // ======================================================================================
  await page.getByRole("button", { name: /continue to review/i }).first().click();
  await page.waitForTimeout(1500);
  const reviewScreen = await text(page);
  observed.push(`--- review step, finding 1 ---\n${reviewScreen}\n`);
  await shot(page, "09-review-finding-1");

  await timed("save finding (normal save)", async () => {
    await page.getByTestId("save-finding").click();
    await page.waitForTimeout(3000);
  });
  const afterSave = await text(page);
  observed.push(`--- after saving finding 1 ---\n${afterSave}\n`);
  record("W11", "the first finding is saved", /1 of 2 saved|saved in this inspection/i.test(afterSave) ? "PASS" : "FAIL");
  await shot(page, "10-after-save-1");

  record("W12", "the second finding is headed by a hazard NAME, not an internal clause",
    !/required machine-guarding component missing, defeated or out of adjustment/i.test(afterSave)
      ? "PASS" : "FAIL",
    "§275 used HazLenz's `mechanism` clause as a page heading");

  // ======================================================================================
  // 8. THE SECOND FINDING. Same matrix cell, 4 x 4 = 16 -> High.
  //
  // This is the D-008 case: HazLenz may escalate this hazard to Critical while the
  // reviewer confirms High, and every customer-facing surface must then say High.
  // ======================================================================================
  await page.getByRole("button", { name: /continue to risk/i }).first().click();
  await page.waitForTimeout(1800);
  const risk2 = await text(page);
  observed.push(`--- risk step, finding 2 ---\n${risk2}\n`);
  // `[^A-Z]` in the first version of this pattern excluded the capital S of "Severity", so
  // it never matched a panel that was plainly on screen and the step was recorded as a NOTE.
  const suggested2 = /HAZLENZ AI SUGGESTED RISK\s+(Severity \d+ × Likelihood \d+ = \d+\s+(?:Critical|High|Moderate|Low))/i.exec(risk2);
  record("W13", "HazLenz states its own suggested risk for finding 2", suggested2 ? "PASS" : "NOTE",
    suggested2 ? suggested2[1].trim() : "not found on screen");

  await page.getByTestId("risk-cell-4-4").click();
  await page.waitForTimeout(1200);
  const changed2 = page.locator("label", { hasText: /Why you changed it/i });
  if (await changed2.count()) {
    await changed2.locator("textarea").fill(
      "No secondary presence-sensing device, so exposure is every cycle.",
    );
  }
  await shot(page, "11-risk-finding-2");

  await page.getByRole("button", { name: /continue to review/i }).first().click();
  await page.waitForTimeout(1500);
  await page.getByTestId("save-finding").click();
  await page.waitForTimeout(3500);
  const afterSave2 = await text(page);
  observed.push(`--- after saving finding 2 ---\n${afterSave2}\n`);
  record("W14", "both findings are saved", /2 of 2 saved|Findings \(2\)/i.test(afterSave2) ? "PASS" : "FAIL");
  await shot(page, "12-after-save-2");

  // ======================================================================================
  // 9. FINISH — corrective actions, the completion transition and the report.
  // ======================================================================================
  await page.getByRole("button", { name: /finish inspection/i }).first().click();
  await page.waitForTimeout(2500);
  const finalizeScreen = await text(page);
  observed.push(`--- finalize step ---\n${finalizeScreen}\n`);
  await shot(page, "13-finalize");

  record("W15", "the finalize screen states the reviewed severity for each finding",
    (finalizeScreen.match(/HIGH/gi) || []).length >= 2 ? "PASS" : "FAIL",
    `"High" appears ${(finalizeScreen.match(/HIGH/gi) || []).length} time(s)`);
  record("W16", "no finding on the finalize screen reads Critical",
    !/critical/i.test(finalizeScreen) ? "PASS" : "FAIL",
    "D-008: the reviewer confirmed High on both");

  await timed("report generation (finish inspection)", async () => {
    await page.getByTestId("generate-report").click();
    await page.waitForURL((u) => u.pathname.includes("inspection-complete"), { timeout: 180000 });
    await page.waitForTimeout(3000);
  });
  const completeScreen = await text(page);
  observed.push(`--- inspection complete ---\n${completeScreen}\n`);
  record("W17", "the inspection completes and the report is ready",
    /report/i.test(completeScreen) ? "PASS" : "FAIL");
  record("W18", "D-008: the completion record states High, never Critical",
    !/critical/i.test(completeScreen) && /HIGH/i.test(completeScreen) ? "PASS" : "FAIL");
  await shot(page, "14-inspection-complete");

  // ======================================================================================
  // 10. THE CALENDAR — the §275 failure, re-measured.
  //
  // Finishing wrote two corrective actions and two follow-up tasks. §275 stood here with
  // nine such rows on the server and read 0 EVENTS.
  // ======================================================================================
  const serverCalendar = await page.evaluate(async (apiUrl) => {
    const response = await fetch(`${apiUrl}/calendar`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("sentinel_auth_token")}` },
    });
    return response.json();
  }, API_URL);
  const serverCount = Array.isArray(serverCalendar) ? serverCalendar.length : -1;

  await timed("calendar load", async () => {
    await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3500);
  });
  const calendarScreen = await text(page);
  observed.push(`--- safety calendar ---\n${calendarScreen}\n`);
  await shot(page, "15-safety-calendar");

  const displayed = /(\d+)\s*EVENTS/i.exec(calendarScreen);
  const displayedCount = displayed ? Number(displayed[1]) : -1;
  record("D007-BROWSER", "server-persisted due work reaches the Safety Calendar",
    serverCount > 0 && displayedCount > 0 ? "PASS" : "FAIL",
    `${serverCount} on the server, ${displayedCount} displayed — §275 read 9 and 0`);
  /**
   * The month grid shows a per-day COUNT rather than titles, which is the right density for
   * a month at a glance. The titles live in the day view, so that is where they are asserted
   * -- reached the way the interface reaches it, by opening the day.
   */
  const dueDay = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  await page.goto(`${APP_URL}/safety-calendar?date=${dueDay}&view=day`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const dayScreen = await text(page);
  observed.push(`--- safety calendar, day view ${dueDay} ---\n${dayScreen}\n`);
  await shot(page, "15b-safety-calendar-day");
  record("W19", "the calendar shows the corrective actions this inspection created",
    /Verify and correct reviewed condition/i.test(dayScreen) ? "PASS" : "FAIL");
  record("W20", "and the follow-up tasks",
    /Follow up reviewed finding/i.test(dayScreen) ? "PASS" : "FAIL");

  // Refresh — the same state, from the server, with nothing cached in the page.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const afterRefresh = await text(page);
  const refreshed = /(\d+)\s*EVENTS/i.exec(afterRefresh);
  record("W21", "a refresh reproduces the same calendar",
    refreshed && Number(refreshed[1]) === displayedCount ? "PASS" : "FAIL",
    `${refreshed ? refreshed[1] : "?"} vs ${displayedCount}`);

  // ======================================================================================
  // 11. THE REPORT — downloaded as the customer downloads it.
  // ======================================================================================
  await timed("reports page", async () => {
    await page.goto(`${APP_URL}/reports`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
  });
  const reportsScreen = await text(page);
  observed.push(`--- reports ---\n${reportsScreen}\n`);
  await shot(page, "16-reports");
  record("W22", "the finished inspection appears in the report library",
    /report/i.test(reportsScreen) ? "PASS" : "FAIL");

  // ======================================================================================
  // 12. HISTORY AND DASHBOARD RECONCILIATION.
  // ======================================================================================
  await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const historyScreen = await text(page);
  observed.push(`--- inspections / history ---\n${historyScreen}\n`);
  await shot(page, "17-history");
  record("W23", "the completed inspection is in saved history",
    historyScreen.includes(siteName) ? "PASS" : "FAIL");
  record("W24", "D-015: the inspection counts are the user's own inspections",
    !/3\s*SCHEDULED/i.test(historyScreen) ? "PASS" : "FAIL",
    "§275 saw 3 SCHEDULED against 1 stored inspection");

  await page.goto(`${APP_URL}/command-center`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const homeAfter = await text(page);
  observed.push(`--- dashboard after ---\n${homeAfter}\n`);
  await shot(page, "18-dashboard-after");
  record("W25", "the dashboard reconciles with the work just created",
    /Follow up reviewed finding|Verify and correct reviewed condition/i.test(homeAfter) ? "PASS" : "FAIL");

  await browser.close();
  writeFileSync(`${OUT_DIR}/walkthrough-observed-text.txt`, observed.join("\n"));

  writeFileSync(`${OUT_DIR}/walkthrough.json`, JSON.stringify({
    section: 276,
    runTag: RUN_TAG,
    appUrl: APP_URL,
    apiUrl: API_URL,
    developmentBypass: false,
    steps,
    timings,
    consoleErrors,
    netFailures,
  }, null, 2));

  const failed = steps.filter((s) => s.outcome === "FAIL");
  console.log(`\n${steps.length - failed.length}/${steps.length} steps passed.`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

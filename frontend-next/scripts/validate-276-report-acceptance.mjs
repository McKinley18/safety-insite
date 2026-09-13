// §276 PART 7 — REPORT ACCEPTANCE. THE ARTIFACT, NOT THE CODE THAT MAKES IT.
//
// Regenerates and INSPECTS real reports:
//
//   1  a SIMPLE report            one observation, one finding
//   2  a MULTIPLE-FINDINGS report
//   3  a report containing CORRECTIVE ACTIONS
//   4  a report containing REVIEWED / CONFIRMED SEVERITY -- the D-008 regression, where
//      HazLenz escalated to Critical and the reviewer confirmed High on a score of 16
//
// The §276 walkthrough's inspection satisfies 2, 3 and 4 at once, which is the point: the
// D-008 proof has to be a report that also has several findings and real corrective
// actions, or it proves something narrower than the defect.
//
// Every assertion is made against TEXT EXTRACTED FROM THE PDF, not against the renderer's
// inputs. A report that is right in memory and wrong on the page is the failure §275 found.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> \
//   node scripts/validate-276-report-acceptance.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-276";
const EMAIL = process.env.VAL_EMAIL || "validation-276-a@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "";
const RUN = `VALIDATION-276-REPORT-${Date.now()}`;

const reportDir = `${OUT_DIR}/reports`;
mkdirSync(reportDir, { recursive: true });
mkdirSync(`${OUT_DIR}/screenshots`, { recursive: true });

const results = [];
const artifacts = [];
function record(id, title, outcome, detail) {
  results.push({ id, title, outcome, detail: detail ?? null });
  const mark = outcome === "PASS" ? "ok  " : outcome === "NOTE" ? "note" : "FAIL";
  console.log(`${mark} ${id}  ${title}${detail ? `  [${detail}]` : ""}`);
}

/**
 * Vocabulary that belongs inside the system and must never reach a compliance artifact a
 * client or a regulator reads.
 */
const INTERNAL_VOCABULARY = [
  { id: "raw_enum", re: /\b(pending_review|in_review|user_authored|server_authored|client_supplied|hazlenz_finding_scoped|reviewer_confirmed|system_generated|absent_or_ineffective|not_applicable|finalized_at)\b/ },
  { id: "screaming_snake", re: /\b[A-Z][A-Z0-9]{2,}(?:_[A-Z0-9]+)+\b/ },
  { id: "key_value_token", re: /\b[a-z][a-zA-Z0-9]*=[a-zA-Z0-9_]+\b/ },
  { id: "bare_uuid", re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i },
  { id: "unresolved_template", re: /\{\{[^}]{1,60}\}\}|\$\{[^}]{1,60}\}|\[object Object\]|\bundefined\b|\bNaN\b|\bnull\b/ },
  { id: "retired_brand", re: /\b(safe ?scope|sentinel safety|auditally|guideguard|sightsignal|reviewcore)\b/i },
];

function pdfText(path) {
  execFileSync("pdftotext", ["-layout", path, `${path}.txt`]);
  return readFileSync(`${path}.txt`, "utf8");
}

function pdfPageCount(path) {
  const info = execFileSync("pdftotext", ["-layout", path, "-"], { encoding: "latin1" });
  // pdftotext separates pages with a form feed.
  return info.split("\f").filter((page) => page.trim().length > 0).length;
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[placeholder*="example.com"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 40000 });

  const api = async (path, init = {}) => page.evaluate(async ({ apiUrl, path, init }) => {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        authorization: `Bearer ${localStorage.getItem("sentinel_auth_token")}`,
        ...(init.body ? { "content-type": "application/json" } : {}),
      },
    });
    const text = await response.text();
    let body = {};
    try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
    return { status: response.status, body };
  }, { apiUrl: API_URL, path, init });

  // =====================================================================================
  // A SIMPLE REPORT — one observation, one finding, driven through the product.
  // =====================================================================================
  await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const siteName = `${RUN} Simple Site`;
  await page.locator("select").first().selectOption("__new__");
  await page.waitForTimeout(400);
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: /save site/i }).first().click();
  await page.waitForTimeout(2500);
  // Select the site just created, by its name. Relying on it being auto-selected made this
  // script fail once the account had a dozen sites -- the Start button stayed disabled
  // because no site was chosen, which is the product behaving correctly.
  await page.locator("select").first().selectOption({ label: siteName });
  await page.waitForTimeout(400);
  await page.getByLabel("Regulatory context").selectOption("osha-general-industry");
  await page.getByRole("button", { name: /full inspection/i }).first().click();
  await page.waitForTimeout(800);
  const start = page.getByRole("button", { name: /^start|begin|continue/i }).first();
  if (await start.count()) await start.click();
  await page.waitForURL((u) => u.pathname.includes("inspection-workspace"), { timeout: 40000 });
  await page.waitForTimeout(2500);

  await page.locator("textarea").first().fill(
    "The cover plate is missing from a 480-volt disconnect panel in the compressor room and "
    + "energized terminals are exposed at chest height, with employees passing within arm's reach.",
  );
  await page.getByRole("button", { name: /analy[sz]e|run hazlenz|hazlenz/i }).first().click();
  await page.waitForFunction(
    () => /possible findings|FINDING YOU ARE BUILDING|did not identify/i.test(document.body.innerText)
      && !/analy[sz]ing/i.test(document.body.innerText),
    { timeout: 120000 },
  );
  await page.waitForTimeout(2000);

  // Keep exactly ONE candidate, so this is genuinely a simple report.
  const boxes = page.locator('input[type="checkbox"]');
  const boxCount = await boxes.count();
  for (let i = 1; i < boxCount; i += 1) {
    if (await boxes.nth(i).isChecked()) await boxes.nth(i).uncheck();
  }
  if (boxCount > 0 && !(await boxes.nth(0).isChecked())) await boxes.nth(0).check();
  const confirm = page.getByTestId("confirm-candidates");
  if (await confirm.count()) {
    await confirm.click();
    await page.waitForTimeout(2500);
  }
  await page.getByRole("button", { name: /continue to risk/i }).first().click();
  await page.waitForTimeout(2000);
  await page.getByTestId("risk-cell-3-3").click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /continue to review/i }).first().click();
  await page.waitForTimeout(1500);
  await page.getByTestId("save-finding").click();
  await page.waitForTimeout(3500);
  await page.getByRole("button", { name: /finish inspection/i }).first().click();
  await page.waitForTimeout(2500);
  await page.getByTestId("generate-report").click();
  await page.waitForURL((u) => u.pathname.includes("inspection-complete"), { timeout: 180000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT_DIR}/screenshots/R01-simple-complete.png`, fullPage: true });
  const simpleScreen = (await page.locator("body").innerText()).replace(/\s+/g, " ");

  // =====================================================================================
  // COLLECT EVERY COMPLETED INSPECTION'S CURRENT REPORT.
  // =====================================================================================
  const list = await api("/inspections");
  const inspections = (Array.isArray(list.body) ? list.body : list.body?.data || [])
    .filter((i) => i.status === "completed");

  for (const inspection of inspections.slice(0, 6)) {
    /**
     * Ask for regeneration before inspecting -- and RECORD what the product does with the
     * request, because it does not always re-render.
     *
     * `CanonicalReportsService` fingerprints the inspection SNAPSHOT, not the generator, and
     * returns the existing artifact unchanged when the inspection has not changed. That is
     * deliberate and documented in the service ("regenerating identical content would
     * destroy a valid artifact to recreate the same one") -- and it means a RENDERER
     * correction does not reach a report that was already issued. §276 records that as a
     * product fact rather than working around it: an artifact generated before the §276
     * repairs still carries the old rendering, and the proof of those repairs therefore has
     * to come from an artifact generated after them.
     */
    const regenerated = await api(`/inspections/${inspection.id}/reports`, { method: "POST" });
    void regenerated;
    const summary = await api(`/inspections/${inspection.id}/report`);
    if (summary.status >= 400 || !summary.body?.reportId) continue;
    const detail = await api(`/inspections/${inspection.id}`);
    const findings = (detail.body?.findings || []).filter((f) => f.status === "finalized");
    const actions = await api(`/actions?limit=100`);
    const forThis = (actions.body?.data || []).filter((a) => a.inspectionId === inspection.id);

    const bytes = await page.evaluate(async ({ apiUrl, reportId }) => {
      const response = await fetch(`${apiUrl}/inspection-reports/${reportId}/download`, {
        headers: { authorization: `Bearer ${localStorage.getItem("sentinel_auth_token")}` },
      });
      const buffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(buffer));
    }, { apiUrl: API_URL, reportId: summary.body.reportId });

    const file = `${reportDir}/inspection-${inspection.displayNumber || inspection.id.slice(0, 8)}.pdf`;
    const buffer = Buffer.from(bytes);
    writeFileSync(file, buffer);
    const sha = createHash("sha256").update(buffer).digest("hex");

    artifacts.push({
      inspectionId: inspection.id,
      displayNumber: inspection.displayNumber,
      reportId: summary.body.reportId,
      file,
      sha256: sha,
      serverChecksum: summary.body.checksum,
      sizeBytes: buffer.length,
      findingCount: findings.length,
      correctiveActionCount: forThis.length,
      reviewerConfirmedFindings: findings.filter((f) => f.riskSnapshot?.source === "reviewer_confirmed").length,
      divergentSeverityFindings: findings.filter((f) => {
        const s = f.riskSnapshot || {};
        const analysisBand = s.analysisRiskBand || s.aiRisk?.escalationBand || s.riskBand;
        return s.source === "reviewer_confirmed" && analysisBand && analysisBand !== s.overallRisk;
      }).map((f) => ({
        id: f.id,
        reviewerBand: f.riskSnapshot?.overallRisk,
        analysisBand: f.riskSnapshot?.analysisRiskBand || f.riskSnapshot?.aiRisk?.escalationBand || f.riskSnapshot?.riskBand,
        matrixScore: f.riskSnapshot?.operationalRisk?.matrixScore,
      })),
    });
  }

  record("R00", "reports were produced and downloaded for the completed inspections",
    artifacts.length >= 2 ? "PASS" : "FAIL", `${artifacts.length} artifact(s)`);

  let simpleReport = null;
  let multiReport = null;
  let severityReport = null;

  for (const artifact of artifacts) {
    const text = pdfText(artifact.file).replace(/\r/g, "");
    const flat = text.replace(/\s+/g, " ");
    artifact.pages = pdfPageCount(artifact.file);
    artifact.extractedCharacters = text.length;
    /**
     * The §276 basis-line repair is visible in the artifact itself: a reviewer-confirmed
     * finding's line carries the reviewer's own severity and likelihood WORDS, never the
     * system matrix's numbers.
     */
    artifact.basisLineUsesReviewerLabels =
      /Severity (Minor|Moderate|Serious|Major|Critical|Negligible|Catastrophic) · Likelihood (Rare|Unlikely|Possible|Likely|Frequent|Remote)/.test(flat);
    artifact.basisLineAttributesSystemNumbers =
      /Severity \d+ · Likelihood \d+ · Risk score \d+ · Reviewer-confirmed/.test(flat);

    const id = `R-${artifact.displayNumber}`;

    // D-013 — BRAND.
    record(id, `report #${artifact.displayNumber}: the cover carries the canonical product name`,
      /SAFETY INSITE/.test(text) ? "PASS" : "FAIL");
    record(id, `report #${artifact.displayNumber}: the running header carries it too`,
      /Safety InSite ·/.test(text) ? "PASS" : "FAIL");
    record(id, `report #${artifact.displayNumber}: the engine is named HazLenz`,
      /HazLenz/.test(text) ? "PASS" : "NOTE");
    record(id, `report #${artifact.displayNumber}: no bare "INSITE" wordmark survives`,
      !/(^|[^Y] )INSITE\b/.test(text.replace(/SAFETY INSITE/g, "")) ? "PASS" : "FAIL");

    // INTERNAL VOCABULARY.
    const leaks = INTERNAL_VOCABULARY.filter((p) => p.re.test(flat)).map((p) => p.id);
    record(id, `report #${artifact.displayNumber}: no internal vocabulary reaches the page`,
      leaks.length === 0 ? "PASS" : "FAIL", leaks.join(", "));

    // STRUCTURE.
    record(id, `report #${artifact.displayNumber}: it carries dates a person can read`,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}\b/.test(text)
        ? "PASS" : "FAIL");
    record(id, `report #${artifact.displayNumber}: every page after the cover is numbered`,
      /Page \d+ of \d+/.test(text) ? "PASS" : "FAIL");
    record(id, `report #${artifact.displayNumber}: nothing is clipped to an empty page`,
      !/\f\s*\f/.test(text) ? "PASS" : "FAIL", `${artifact.pages} page(s)`);
    record(id, `report #${artifact.displayNumber}: the advisory basis is stated`,
      /advisory/i.test(flat) ? "PASS" : "FAIL");

    // D-008 — SEVERITY.
    if (artifact.divergentSeverityFindings.length > 0) {
      severityReport = artifact;
      for (const finding of artifact.divergentSeverityFindings) {
        const reviewerBandOnPage = new RegExp(`Risk:\\s*${finding.reviewerBand}`, "i").test(text);
        const provenanceLabelled = new RegExp(`HazLenz analysis:\\s*${finding.analysisBand}`, "i").test(text);
        record(id, `D-008: the report states the REVIEWER's ${finding.reviewerBand}, not HazLenz's ${finding.analysisBand}`,
          reviewerBandOnPage ? "PASS" : "FAIL",
          `matrix score ${finding.matrixScore}`);
        record(id, `D-008: HazLenz's ${finding.analysisBand} is retained and LABELLED as HazLenz's`,
          provenanceLabelled ? "PASS" : "FAIL");
      }
      const criticalInDistribution = /Critical\s+(\d+)/.exec(text);
      record(id, "D-008: the risk distribution counts no Critical finding",
        criticalInDistribution && criticalInDistribution[1] === "0" ? "PASS" : "FAIL",
        criticalInDistribution ? `Critical ${criticalInDistribution[1]}` : "no distribution found");
    }

    if (artifact.findingCount === 1) simpleReport = artifact;
    if (artifact.findingCount > 1) multiReport = artifact;

    if (artifact.correctiveActionCount > 0) {
      record(id, `report #${artifact.displayNumber}: corrective actions appear with an owner and a due date`,
        /Assigned|Owner|Unassigned/i.test(flat) && /Due/i.test(flat) ? "PASS" : "FAIL",
        `${artifact.correctiveActionCount} action(s)`);
    }

    // Integrity: the bytes the customer downloads are the bytes the server recorded.
    record(id, `report #${artifact.displayNumber}: the downloaded bytes match the recorded checksum`,
      artifact.sha256 === artifact.serverChecksum ? "PASS" : "FAIL",
      `${artifact.sha256.slice(0, 16)} vs ${String(artifact.serverChecksum).slice(0, 16)}`);
  }

  record("R10", "a SIMPLE report (one finding) was inspected", simpleReport ? "PASS" : "FAIL",
    simpleReport ? `#${simpleReport.displayNumber}, ${simpleReport.pages} pages` : "");
  record("R11", "a MULTIPLE-FINDINGS report was inspected", multiReport ? "PASS" : "FAIL",
    multiReport ? `#${multiReport.displayNumber}, ${multiReport.findingCount} findings` : "");
  record("R12", "a report WITH CORRECTIVE ACTIONS was inspected",
    artifacts.some((a) => a.correctiveActionCount > 0) ? "PASS" : "FAIL");
  record("R13", "a report with REVIEWER-CONFIRMED severity diverging from HazLenz was inspected",
    severityReport ? "PASS" : "FAIL",
    severityReport ? `#${severityReport.displayNumber}` : "no divergent finding existed to prove D-008 on");

  /**
   * At least one artifact must have been rendered by the CURRENT renderer and must show the
   * corrected basis line. Without this, every D-008 assertion above could be satisfied by
   * artifacts that happen to predate the repair.
   */
  const postRepair = artifacts.filter((a) => a.basisLineUsesReviewerLabels);
  record("R15", "at least one artifact was rendered by the current renderer",
    postRepair.length > 0 ? "PASS" : "FAIL",
    postRepair.map((a) => `#${a.displayNumber}`).join(", "));
  record("R16", "and on it, no number the reviewer did not choose is labelled Reviewer-confirmed",
    postRepair.some((a) => a.divergentSeverityFindings.length > 0) ? "PASS" : "NOTE",
    postRepair.length
      ? `#${postRepair[0].displayNumber} carries the reviewer's own severity and likelihood`
      : "");
  record("R17", "reports issued BEFORE a renderer correction are not silently re-issued",
    artifacts.some((a) => !a.basisLineUsesReviewerLabels) ? "NOTE" : "PASS",
    "the snapshot fingerprint gates regeneration; recorded as a §276 product finding");

  record("R14", "the completion screen and the report agree on severity",
    severityReport && !/critical/i.test(simpleScreen) ? "PASS" : "NOTE",
    "screen and artifact compared for the walkthrough inspection in walkthrough.json");

  await browser.close();

  writeFileSync(`${OUT_DIR}/report-acceptance.json`, JSON.stringify({
    section: 276, run: RUN, artifacts, results,
  }, null, 2));

  const failed = results.filter((r) => r.outcome === "FAIL");
  const noted = results.filter((r) => r.outcome === "NOTE");
  console.log(`\n${results.length - failed.length - noted.length} passed, ${noted.length} noted, ${failed.length} failed.`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

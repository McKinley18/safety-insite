// Blocker 3: multi-observation inspection -> finalization -> report generation.
// Real browser, real API, real HazLenz. Asserts finding integrity across observations,
// reload, per-finding review, completion, and the generated PDF.
import { chromium } from "playwright";
import pg from "pg";
import { mkdirSync, writeFileSync } from "node:fs";

const appUrl = process.env.APP_URL || "http://localhost:3010";
const apiUrl = process.env.API_BASE_URL || "http://localhost:4010";
const outDir = process.env.OUT_DIR || "/tmp/multiobs";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+|_qa_/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable database is required.");
}
mkdirSync(outDir, { recursive: true });

const suffix = Date.now();
const email = `multiobs-${suffix}@insite-verify.test`;
const password = "MultiObs!Pass123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });

const OBSERVATIONS = [
  "In the north warehouse aisle the emergency exit door is blocked by three stacked pallets, and a 55-gallon drum of solvent beside it carries no hazard label.",
  "In the maintenance bay the belt guard on the air compressor drive is missing and the belt and pulley are exposed to contact while the compressor is running.",
  "A portable extension cord powering a bench grinder has exposed copper conductors and remains energized where employees are working.",
];

const problems = [];
const findingTitles = (page) =>
  page.locator("section[aria-label='Findings in this inspection'] article p.font-bold").allInnerTexts();

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const reg = await page.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Multi Observation", type: "individual" },
  });
  if (reg.status() !== 201) throw new Error(`register ${reg.status()}`);
  const { userId } = await reg.json();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '4 hours',NULL,'Blocker-3 multi-observation fixture')`,
    [userId],
  );

  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/, { timeout: 30000 });

  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  const siteName = `Multi-observation site ${suffix}`;
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();
  // Explicit regulatory context so provenance is USER_CONFIRMED, not inferred.
  const ctxSelect = page.getByLabel(/Regulatory context/i).first();
  if (await ctxSelect.count()) {
    await ctxSelect.selectOption({ label: /General Industry/i }).catch(() => {});
  }
  await page.getByRole("button", { name: /Full Inspection/ }).first().click();
  await page.getByRole("button", { name: /Start Full Inspection/ }).click();
  await page.waitForURL(/inspection-workspace/, { timeout: 30000 });

  // ---- Observation 1 ----
  await page.locator("#observation").fill(OBSERVATIONS[0]);
  await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
  await page.locator("[data-testid='add-finding']").waitFor({ timeout: 15000 });
  const afterObs1 = await findingTitles(page);

  // ---- Observations 2 and 3 via the Add Finding workflow ----
  for (const text of OBSERVATIONS.slice(1)) {
    await page.locator("[data-testid='add-finding']").click();
    await page.locator("[data-testid='additional-observation-banner']").waitFor();
    await page.locator("#observation").fill(text);
    await page.getByRole("button", { name: "Analyze and add this finding" }).click();
    await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
    await page.waitForTimeout(1200);
  }
  const afterAll = await findingTitles(page);
  await page.screenshot({ path: `${outDir}/mo-01-all-findings.png`, fullPage: true });

  if (afterAll.length < 4) problems.push(`expected >=4 findings, got ${afterAll.length}`);
  for (const t of afterObs1) {
    if (!afterAll.includes(t)) problems.push(`observation-1 finding lost after later observations: ${t}`);
  }

  // ---- Reload, revisit ----
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
  await page.waitForTimeout(1500);
  const afterReload = await findingTitles(page);
  if (afterReload.length !== afterAll.length) {
    problems.push(`reload changed finding count ${afterAll.length} -> ${afterReload.length}`);
  }
  if (JSON.stringify(afterReload) !== JSON.stringify(afterAll)) {
    problems.push(`finding order changed across reload: ${afterAll} -> ${afterReload}`);
  }

  // Visit each finding once before finalizing.
  const reviewButtons = page.getByRole("button", { name: "Review this finding" });
  for (let i = await reviewButtons.count(); i > 0; i--) {
    await page.getByRole("button", { name: "Review this finding" }).first().click();
    await page.waitForTimeout(500);
  }

  // ---- Finalize every finding: review -> risk -> confirm ----
  let guard = 0;
  while (guard++ < 12) {
    const remaining = await page.getByRole("button", { name: "Review this finding" }).count();
    const onFollowup = await page.getByRole("heading", { name: "Corrective action" }).count();
    if (onFollowup) break;
    const toRisk = page.getByRole("button", { name: "Continue to risk review" });
    if (await toRisk.count()) {
      await toRisk.click();
      await page.waitForTimeout(600);
    }
    const confirm = page.getByRole("button", { name: "Confirm risk and finalize finding" });
    if (await confirm.count()) {
      await confirm.click();
      await page.waitForTimeout(2500);
    } else if (!remaining) {
      break;
    }
  }
  await page.screenshot({ path: `${outDir}/mo-02-after-finalize.png`, fullPage: true });

  // ---- Corrective action + complete ----
  await page.getByRole("heading", { name: "Corrective action" }).waitFor({ timeout: 30000 });
  const permanent = page.locator("textarea").nth(1);
  if (!(await permanent.inputValue()).trim()) {
    await permanent.fill("Clear the obstruction, restore the guard, and remove damaged equipment from service.");
  }
  await page.getByRole("button", { name: "Complete inspection and generate report" }).click();
  await page.getByRole("heading", { name: /Durably saved|Report/i }).waitFor({ timeout: 90000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/mo-03-complete.png`, fullPage: true });

  // ---- Database truth ----
  const dbq = await db.query(
    `SELECT
       (SELECT count(*)::int FROM observations o JOIN inspection i ON i.id=o."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) observations,
       (SELECT count(*)::int FROM inspection_findings f JOIN inspection i ON i.id=f."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1 AND f.status<>'superseded') active_findings,
       (SELECT count(*)::int FROM inspection_findings f JOIN inspection i ON i.id=f."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1 AND f.status='superseded') superseded,
       (SELECT count(*)::int FROM inspection_findings f JOIN inspection i ON i.id=f."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1 AND f."finalReviewId" IS NOT NULL) finalized,
       (SELECT count(*)::int FROM corrective_actions a JOIN inspection i ON i.id=a."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) actions,
       (SELECT count(*)::int FROM inspection_reports r JOIN inspection i ON i.id=r."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) reports,
       (SELECT i."regulatoryContext" FROM inspection i JOIN site s ON s.id=i."siteId" WHERE s.name=$1 LIMIT 1) regctx`,
    [siteName],
  );
  const counts = dbq.rows[0];
  if (counts.observations !== 3) problems.push(`expected 3 observations in DB, got ${counts.observations}`);
  if (counts.superseded !== 0) problems.push(`${counts.superseded} finding(s) superseded`);
  if (counts.finalized !== counts.active_findings) {
    problems.push(`finalized ${counts.finalized} != active ${counts.active_findings}`);
  }
  if (counts.reports < 1) problems.push("no report row persisted");

  // ---- Download the PDF via the app's own authenticated path ----
  const reportRow = await db.query(
    // Versions live on inspection_report_versions, not on the report row.
    `SELECT r.id, v.version, v.sha256, v."sizeBytes"
       FROM inspection_reports r
       JOIN inspection_report_versions v ON v."reportId" = r.id
       JOIN inspection i ON i.id = r."inspectionId"
       JOIN site s ON s.id = i."siteId"
      WHERE s.name = $1 ORDER BY v.version DESC LIMIT 1`,
    [siteName],
  );
  let pdfPath = null;
  if (reportRow.rows.length) {
    const { id, version } = reportRow.rows[0];
    const token = await page.evaluate(() => localStorage.getItem("sentinel_auth_token"));
    const resp = await page.request.get(`${apiUrl}/inspection-reports/${id}/versions/${version}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok()) {
      pdfPath = `${outDir}/multi-observation-report.pdf`;
      writeFileSync(pdfPath, await resp.body());
    } else {
      problems.push(`report download failed: ${resp.status()}`);
    }
  }

  const result = {
    findingTitlesAfterObservation1: afterObs1,
    findingTitlesAfterAllObservations: afterAll,
    findingTitlesAfterReload: afterReload,
    observations: counts.observations,
    activeFindings: counts.active_findings,
    supersededFindings: counts.superseded,
    finalizedFindings: counts.finalized,
    correctiveActions: counts.actions,
    reports: counts.reports,
    regulatoryContext: counts.regctx,
    pdf: pdfPath,
    passed: problems.length === 0,
    problems,
  };
  writeFileSync(`${outDir}/multiobs-result.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (problems.length) process.exitCode = 1;
} finally {
  await browser.close();
  await db.end();
}

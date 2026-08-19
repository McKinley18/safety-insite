// Phase 2 verification: adding findings to an in-progress inspection.
// Proves the added observation materialises its own findings WITHOUT superseding,
// overwriting, or losing any finding captured earlier, and that everything survives reload.
import { chromium } from "playwright";
import pg from "pg";
import { mkdirSync } from "node:fs";

const appUrl = process.env.APP_URL || "http://localhost:3010";
const apiUrl = process.env.API_BASE_URL || "http://localhost:4010";
const outDir = process.env.OUT_DIR || "/tmp/addfinding";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+|_qa_/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable database is required.");
}
mkdirSync(outDir, { recursive: true });

const suffix = Date.now();
const email = `add-finding-${suffix}@insite-verify.test`;
const password = "AddFinding!Pass123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });

const OBS_1 =
  "In the north warehouse aisle the emergency exit door is blocked by three stacked pallets, " +
  "and a 55-gallon drum of solvent next to it has no hazard label.";
const OBS_2 =
  "Separately, in the maintenance bay the belt guard on the air compressor drive is missing " +
  "and the belt and pulley are exposed to contact while the compressor is running.";
const OBS_3 =
  "Also, a portable extension cord powering a bench grinder has exposed copper conductors " +
  "and remains energized where employees are working.";

const findingTitles = async (page) =>
  page.locator("section[aria-label='Findings in this inspection'] article p.font-bold").allInnerTexts();

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const reg = await page.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Add Finding", type: "individual" },
  });
  if (reg.status() !== 201) throw new Error(`register ${reg.status()} ${await reg.text()}`);
  const { userId } = await reg.json();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '4 hours',NULL,'Phase-2 add-finding fixture')`,
    [userId],
  );

  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/, { timeout: 30000 });

  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  const siteName = `Add finding site ${suffix}`;
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();
  await page.getByRole("button", { name: /Full Inspection/ }).first().click();
  await page.getByRole("button", { name: /Start Full Inspection/ }).click();
  await page.waitForURL(/inspection-workspace/, { timeout: 30000 });

  // --- Observation 1 -------------------------------------------------------
  await page.locator("#observation").fill(OBS_1);
  await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
  await page.locator("[data-testid='add-finding']").waitFor({ timeout: 15000 });
  const after1 = await findingTitles(page);
  await page.screenshot({ path: `${outDir}/after-01-first-analysis.png`, fullPage: true });

  // --- Add finding #2 (the flow that did not exist before) -----------------
  await page.locator("[data-testid='add-finding']").click();
  await page.locator("[data-testid='additional-observation-banner']").waitFor();
  await page.screenshot({ path: `${outDir}/after-02-add-finding-capture.png`, fullPage: true });
  await page.locator("#observation").fill(OBS_2);
  await page.getByRole("button", { name: "Analyze and add this finding" }).click();
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
  await page.waitForTimeout(1200);
  const after2 = await findingTitles(page);

  // --- Add finding #3 ------------------------------------------------------
  await page.locator("[data-testid='add-finding']").click();
  await page.locator("[data-testid='additional-observation-banner']").waitFor();
  await page.locator("#observation").fill(OBS_3);
  await page.getByRole("button", { name: "Analyze and add this finding" }).click();
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
  await page.waitForTimeout(1200);
  const after3 = await findingTitles(page);
  await page.screenshot({ path: `${outDir}/after-03-three-observations.png`, fullPage: true });

  // --- Cancel path ---------------------------------------------------------
  await page.locator("[data-testid='add-finding']").click();
  await page.getByRole("button", { name: "Cancel and go back to review" }).click();
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor();
  const afterCancel = await findingTitles(page);

  // --- Switch between findings --------------------------------------------
  const reviewButtons = page.getByRole("button", { name: "Review this finding" });
  const switchable = await reviewButtons.count();
  if (switchable > 0) {
    await reviewButtons.first().click();
    await page.waitForTimeout(600);
  }

  // --- Reload persistence --------------------------------------------------
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
  await page.waitForTimeout(1200);
  const afterReload = await findingTitles(page);
  await page.screenshot({ path: `${outDir}/after-04-reload.png`, fullPage: true });

  // --- Database truth ------------------------------------------------------
  const dbRows = await db.query(
    `SELECT o.id AS observation_id, o."rawText",
            count(f.id) FILTER (WHERE f.status <> 'superseded')::int AS active_findings,
            count(f.id) FILTER (WHERE f.status = 'superseded')::int  AS superseded_findings
       FROM observations o
       JOIN inspection i ON i.id = o."inspectionId"
       JOIN site s ON s.id = i."siteId"
       LEFT JOIN inspection_findings f ON f."observationId" = o.id
      WHERE s.name = $1
      GROUP BY o.id, o."rawText", o."createdAt"
      ORDER BY o."createdAt" ASC`,
    [siteName],
  );

  const result = {
    findingTitlesAfterObservation1: after1,
    findingTitlesAfterObservation2: after2,
    findingTitlesAfterObservation3: after3,
    findingTitlesAfterCancel: afterCancel,
    findingTitlesAfterReload: afterReload,
    observationsInDb: dbRows.rows.length,
    perObservation: dbRows.rows.map((r) => ({
      observation: r.rawText.slice(0, 60) + "…",
      activeFindings: r.active_findings,
      supersededFindings: r.superseded_findings,
    })),
    totalActiveFindingsInDb: dbRows.rows.reduce((t, r) => t + r.active_findings, 0),
    totalSupersededInDb: dbRows.rows.reduce((t, r) => t + r.superseded_findings, 0),
    rawHazardKeyLeakInTitles: afterReload.filter((t) => /^[a-z0-9_]+$/.test(t)),
  };

  const problems = [];
  if (result.observationsInDb !== 3) problems.push(`expected 3 observations, got ${result.observationsInDb}`);
  if (after2.length <= after1.length) problems.push("adding observation 2 did not increase the finding count");
  if (after3.length <= after2.length) problems.push("adding observation 3 did not increase the finding count");
  if (afterCancel.length !== after3.length) problems.push("cancel changed the finding count");
  if (afterReload.length !== after3.length) problems.push("reload lost findings");
  for (const earlier of after1) {
    if (!afterReload.includes(earlier)) problems.push(`finding from observation 1 disappeared: ${earlier}`);
  }
  if (result.totalSupersededInDb !== 0) problems.push(`${result.totalSupersededInDb} finding(s) were superseded`);
  if (result.rawHazardKeyLeakInTitles.length) {
    problems.push(`raw hazard keys still shown: ${result.rawHazardKeyLeakInTitles.join(", ")}`);
  }

  result.passed = problems.length === 0;
  result.problems = problems;
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
} finally {
  await browser.close();
  await db.end();
}

import { chromium } from "playwright";
import pg from "pg";
import { mkdir } from "node:fs/promises";

const appUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const apiUrl = process.env.API_BASE_URL || "http://127.0.0.1:4200";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+|guided|hardening/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable test database is required.");
}
const suffix = Date.now();
const email = `evidence-foundation-${suffix}@example.test`;
const password = "Evidence!Foundation123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });
const screenshotDir = process.env.SCREENSHOT_DIR || "";
const requestedTheme = process.env.TEST_THEME === "light" ? "light" : "dark";
const viewportWidth = Number(process.env.VIEWPORT_WIDTH || 390);
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

try {
  const page = await browser.newPage({ viewport: { width: viewportWidth, height: 844 }, colorScheme: requestedTheme });
  await page.addInitScript((theme) => localStorage.setItem("safety_insite_theme", theme), requestedTheme);
  const registration = await page.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Evidence Foundation", type: "individual" },
  });
  if (registration.status() !== 201) {
    throw new Error(`Registration failed: ${registration.status()} ${await registration.text()}`);
  }
  const user = await registration.json();
  await db.query(
    `INSERT INTO entitlement_grants
      ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','expert','active',now(),now()+interval '2 hours',NULL,
       'Disposable evidence-foundation browser fixture')`,
    [user.userId],
  );

  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(1500);
  if (!/command-center/.test(page.url())) {
    throw new Error(`Login did not navigate: ${page.url()} :: ${(await page.locator("body").innerText()).slice(0, 1000)}`);
  }
  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  const siteName = `Evidence site ${suffix}`;
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.waitForTimeout(1500);
  if (!(await page.getByRole("status").filter({ hasText: "Site saved" }).count())) {
    throw new Error(`Site creation did not confirm: ${(await page.locator("body").innerText()).slice(0, 1200)}`);
  }
  await page.getByRole("button", { name: /Quick Inspection/ }).first().click();
  await page.getByRole("button", { name: "Start Quick Inspection" }).click();
  await page.waitForURL(/inspection-workspace/);

  await page.getByLabel("Photo evidence").setInputFiles({
    name: "crusher-evidence.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByLabel("Location or area").fill("crusher drive");
  await page.getByLabel("Work activity").fill("clearing a jam");
  await page.getByLabel("Site context").selectOption("msha");
  const observation =
    "Mechanic was clearing stone from the crusher drive while it remained capable of movement; the first note did not say whether a personal lock was applied.";
  await page.getByLabel("What did you observe?").fill(observation);
  await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
  await page.getByRole("heading", { name: "What HazLenz understood" }).waitFor({ timeout: 30000 });
  if (screenshotDir) await page.screenshot({ path: `${screenshotDir}/guided-review-${requestedTheme}-mobile.png`, fullPage: true });
  if (!(await page.getByText(/Primary standard|Candidate standard/).count())) {
    throw new Error("Guided primary-standard presentation was not rendered.");
  }
  await page.getByText(/Private evidence stored/).waitFor();
  const isolationQuestion = page.getByText(/Had every hazardous energy source been isolated/i);
  if (await isolationQuestion.count()) {
    await isolationQuestion.locator("..").getByRole("button", { name: "No", exact: true }).click();
    await page.getByRole("status").filter({ hasText: /Updated HazLenz advisory snapshot saved/ }).waitFor();
  }

  const energyInput = page.getByLabel("Correct energyState");
  if (await energyInput.count()) {
    await energyInput.fill("deenergized");
    const isolationInput = page.getByLabel("Correct energyIsolationState");
    if (await isolationInput.count()) await isolationInput.fill("isolated_and_verified");
    await page.getByRole("button", { name: "Re-run after fact corrections" }).click();
    await page.getByRole("status").filter({ hasText: /Updated HazLenz advisory snapshot saved/ }).waitFor();
  }
  await page.getByRole("button", { name: "Continue to risk review" }).click();
  await page.getByRole("heading", { name: "Proposed risk" }).waitFor();
  await page.getByLabel("Overall risk").selectOption("High");
  await page.getByRole("button", { name: "Confirm risk and finalize finding" }).click();
  await page.getByRole("status").filter({ hasText: /Explain the risk adjustment/ }).waitFor();
  await page.getByLabel(/Reason for adjustment/).fill("Qualified reviewer confirmed repeated access while the equipment remained capable of movement.");
  if (screenshotDir) await page.screenshot({ path: `${screenshotDir}/risk-${requestedTheme}-mobile.png`, fullPage: true });
  await page.getByRole("button", { name: "Confirm risk and finalize finding" }).click();
  await page.getByRole("heading", { name: "Corrective action" }).waitFor();
  if (screenshotDir) await page.screenshot({ path: `${screenshotDir}/corrective-action-${requestedTheme}-mobile.png`, fullPage: true });
  await page.getByRole("button", { name: "Complete inspection and generate report" }).click();
  await page.getByRole("heading", { name: "Durably saved" }).waitFor({ timeout: 30000 });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText(/Status: completed/).waitFor();

  const persisted = await db.query(
    `SELECT i.id,
       (SELECT count(*)::int FROM observations o WHERE o."inspectionId"=i.id) observations,
       (SELECT count(*)::int FROM hazlenz_analyses a JOIN observations o ON o.id=a."observationId"
          WHERE o."inspectionId"=i.id) analyses,
       (SELECT count(*)::int FROM human_reviews r JOIN observations o ON o.id=r."observationId"
          WHERE o."inspectionId"=i.id) reviews,
       (SELECT count(*)::int FROM inspection_findings f WHERE f."inspectionId"=i.id) findings,
       (SELECT count(*)::int FROM storage_objects s WHERE s."parentType"='inspection'
          AND s."parentId"=i.id AND s.category='evidence' AND s.status='ready') evidence,
       (SELECT count(*)::int FROM inspection_reports r WHERE r."inspectionId"=i.id) reports
     FROM inspection i JOIN site s ON s.id=i."siteId" WHERE s.name=$1`,
    [siteName],
  );
  const counts = persisted.rows[0];
  for (const field of ["observations", "reviews", "findings", "evidence", "reports"]) {
    if (Number(counts[field]) !== 1) throw new Error(`Expected one ${field}; got ${counts[field]}.`);
  }
  if (Number(counts.analyses) < 2) throw new Error(`Expected persisted re-analysis; got ${counts.analyses}.`);

  const snapshots = await db.query(
    `SELECT a."resultSnapshot"
       FROM hazlenz_analyses a JOIN observations o ON o.id=a."observationId"
      WHERE o."inspectionId"=$1 ORDER BY a."createdAt" ASC`,
    [counts.id],
  );
  const latest = snapshots.rows.at(-1)?.resultSnapshot;
  if (!latest?.evidenceSnapshot?.facts?.some((fact) =>
    fact.type === "energyState" && fact.value === "deenergized" &&
    fact.reviewerStatus === "user_confirmed")) {
    throw new Error("Corrected confirmed evidence was not persisted in the latest analysis.");
  }
  const reportSnapshot = await db.query(
    `SELECT v."sourceSnapshot",v.sha256,v.status
       FROM inspection_report_versions v JOIN inspection_reports r ON r.id=v."reportId"
      WHERE r."inspectionId"=$1 ORDER BY v.version DESC LIMIT 1`,
    [counts.id],
  );
  const version = reportSnapshot.rows[0];
  const reportAnalyses = version?.sourceSnapshot?.observations?.flatMap((item) => item.analyses || []) || [];
  if (!reportAnalyses.some((item) => item.resultSnapshot?.evidenceSnapshot?.facts?.some((fact) =>
    fact.type === "energyState" && fact.value === "deenergized"))) {
    throw new Error("Report source snapshot did not preserve corrected evidence facts.");
  }
  if (version.status !== "generated" || !/^[a-f0-9]{64}$/.test(version.sha256 || "")) {
    throw new Error("Generated report checksum/status is invalid.");
  }
  await page.evaluate(() => {
    localStorage.removeItem("sentinel_auth_token");
    localStorage.removeItem("sentinel_auth_user");
  });
  await page.goto(`${appUrl}/reports`, { waitUntil: "networkidle" });
  await page.waitForURL(/login/);

  console.log(JSON.stringify({
    passed: true, mobileViewport: `${viewportWidth}x844`, theme: requestedTheme, realPhotoUpload: true,
    riskOverrideRationaleEnforced: true,
    realHazLenzEndpoint: true, factCorrection: true, reanalysisPersistence: true,
    reportEvidenceSnapshot: true, reloadPersistence: true, logoutProtection: true,
    persisted: counts,
  }));
} finally {
  await browser.close();
  await db.end();
}

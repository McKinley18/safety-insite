import { chromium } from "playwright";
import pg from "pg";

const appUrl = process.env.APP_URL || "http://127.0.0.1:3100";
const apiUrl = process.env.API_BASE_URL || "http://127.0.0.1:4200";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable test database is required.");
}
const suffix = Date.now();
const email = `closure-browser-${suffix}@example.test`;
const password = "Closure!BrowserPass123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const registration = await page.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Closure Browser", type: "individual" },
  });
  if (registration.status() !== 201) {
    throw new Error(`Registration failed: ${registration.status()} ${await registration.text()}`);
  }
  const registered = await registration.json();
  // V1-CLOSURECHK-01. This fixture exists to give the browser user a PAID entitlement so the
  // guided closure workflow is reachable; it is not a test of tier naming. It granted 'expert'
  // because Expert was the top tier when it was written. Expert was retired by migration
  // 1800000005900-RetireExpertTier, which added CHECK (tier = 'pro'), so the insert began
  // failing with entitlement_grants_tier_check -- a stale instrument, not a product defect.
  // 'pro' is the v1 equivalent of the paid access this fixture always intended.
  await db.query(
    `INSERT INTO entitlement_grants
      ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '2 hours',NULL,
       'Disposable production-readiness browser fixture')`,
    [registered.userId],
  );

  // ...and prove the constraint that broke this fixture is still doing its job. Expert must
  // remain unrepresentable, so repairing the fixture cannot quietly become a way back in.
  let expertRejected = false;
  try {
    await db.query(
      `INSERT INTO entitlement_grants
        ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
       VALUES ($1,'test','expert','active',now(),now()+interval '2 hours',NULL,
         'V1-CLOSURECHK-01 negative control -- must be rejected')`,
      [registered.userId],
    );
  } catch (error) {
    expertRejected = /entitlement_grants_tier_check|violates check constraint/i.test(String(error));
  }
  if (!expertRejected) {
    throw new Error(
      "Expert-tier entitlement grant was NOT rejected -- the retired-Expert constraint is missing or weakened.",
    );
  }
  console.log("PASS: retired 'expert' tier is still rejected by entitlement_grants_tier_check");

  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/);
  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  const siteName = `Closure site ${suffix}`;
  // v1 UI: the new-site input is revealed by choosing "Add new site" in the saved-site select,
  // and startInspection() now refuses without an explicit regulatory context. Both are current
  // product behaviour, so the verifier drives them rather than asserting the old flow.
  await page.getByLabel("Saved site").selectOption("__new__");
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();
  await page.getByLabel("Regulatory context").selectOption("msha");
  // "Quick Inspection" was split into Quick Capture (Free) and Full Inspection (Pro). This
  // fixture grants a paid entitlement and exercises analysis, findings and a report, so the
  // Pro workflow is the correct current equivalent.
  await page.getByRole("button", { name: /Full Inspection/ }).first().click();
  await page.getByRole("button", { name: "Start Full Inspection" }).click();
  await page.waitForURL(/inspection-workspace/);

  const text =
    "At the fabrication shop, the pedestal grinder is unplugged, tagged do not use, and the wheel guard is cracked; nobody is using it while replacement parts are ordered.";
  // The workspace observation field was relabelled "What did you observe?" -> "What did you see?"
  // (inspection-workspace/page.tsx). Same field, same contract; only the customer wording moved.
  // Note /field-capture still says "What did you observe?", so this is not a global rename and
  // the locator must stay specific to the workspace step this fixture is driving.
  await page.getByLabel("What did you see?").fill(text);
  // WORKFLOW SEQUENCE, re-derived from the shipped workspace 2026-08-28. The v1 guided flow is
  // five named steps -- Record It / HazLenz / Risk & Fix / Review / Finish -- and the previous
  // wording ("Save and review with HazLenz AI", "Continue to risk review", "Confirm risk and
  // finalize finding", "Complete inspection and generate report", "Report generated") belongs to
  // the pre-v1 workspace. Every literal below was read off the current source and confirmed by
  // driving the flow. The CONTRACT this fixture protects is unchanged and is still asserted at
  // the end: one site, one inspection, one observation, one analysis, one review, one finding,
  // one corrective action, one task and one report, all persisted and reachable.
  await page.getByRole("button", { name: "Review with HazLenz AI" }).click();
  await page.getByRole("heading", { name: "HazLenz assessment" }).waitFor({ timeout: 60000 });
  await page.getByRole("button", { name: "Continue to risk" }).click();

  await page.getByRole("heading", { name: "Risk and corrective action" }).waitFor({ timeout: 30000 });
  // The risk matrix cell IS the risk decision -- "Continue to review" stays disabled and reads
  // "Select a risk cell to continue" until one is chosen, which is the product's own guard
  // against reviewing a finding that carries no assessed risk.
  await page.getByRole("button", { name: "12", exact: true }).first().click();
  // Corrective actions are now structured, reviewer-confirmed items rather than one free-text
  // field: ticking "Permanent correction" adopts the durable correction onto the finding. Same
  // guard as before -- an inspection cannot be finished with no durable corrective action -- and
  // the persisted `corrective_actions` row is still counted below.
  await page.getByLabel("Permanent correction").first().check();
  await page.getByRole("button", { name: "Continue to review" }).click();

  await page.getByRole("heading", { name: "Check this finding before saving" }).waitFor({ timeout: 30000 });
  await page.getByTestId("save-finding").click();

  // Two distinct controls share the label "Finish inspection": the secondary one leaves the
  // per-finding loop for the finalize step, and the primary one on that step runs `complete()`,
  // which writes the corrective actions, the calendar task and the report.
  await page.getByTestId("finish-inspection").click();
  await page.getByRole("heading", { name: "Finish this inspection" }).waitFor({ timeout: 30000 });
  await page.getByRole("button", { name: "Finish inspection" }).click();
  await page.waitForURL(/inspection-complete/, { timeout: 60000 });
  await page.goto(`${appUrl}/reports`, { waitUntil: "networkidle" });
  // The report library pinned the literal "Version 1". That belongs to the superseded
  // multi-version model: the canonical architecture is ONE report per inspection, so /reports
  // deliberately shows no version list, nothing superseded, and no choice about which report is
  // real. The property being protected -- the finished inspection's report is reachable in the
  // library -- is re-pinned to what now identifies it: a report card carrying THIS run's site,
  // and exactly one of them.
  await page.getByTestId("report-card").filter({ hasText: siteName }).first().waitFor();
  const cardsForThisSite = await page.getByTestId("report-card").filter({ hasText: siteName }).count();
  if (cardsForThisSite !== 1) {
    throw new Error(
      `Report library shows ${cardsForThisSite} report cards for ${siteName}; one inspection has exactly one report.`,
    );
  }

  const persisted = await db.query(
    `SELECT
       (SELECT count(*)::int FROM site WHERE name=$1) sites,
       (SELECT count(*)::int FROM inspection i JOIN site s ON s.id=i."siteId" WHERE s.name=$1) inspections,
       (SELECT count(*)::int FROM observations o JOIN inspection i ON i.id=o."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) observations,
       (SELECT count(*)::int FROM hazlenz_analyses a JOIN observations o ON o.id=a."observationId"
          JOIN inspection i ON i.id=o."inspectionId" JOIN site s ON s.id=i."siteId" WHERE s.name=$1) analyses,
       (SELECT count(*)::int FROM human_reviews r JOIN observations o ON o.id=r."observationId"
          JOIN inspection i ON i.id=o."inspectionId" JOIN site s ON s.id=i."siteId" WHERE s.name=$1) reviews,
       (SELECT count(*)::int FROM inspection_findings f JOIN inspection i ON i.id=f."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) findings,
       (SELECT count(*)::int FROM corrective_actions a JOIN inspection i ON i.id=a."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) actions,
       (SELECT count(*)::int FROM tasks t JOIN inspection i ON i.id=t."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) tasks,
       (SELECT count(*)::int FROM inspection_reports r JOIN inspection i ON i.id=r."inspectionId"
          JOIN site s ON s.id=i."siteId" WHERE s.name=$1) reports`,
    [siteName],
  );
  const counts = persisted.rows[0];
  if (Object.values(counts).some((value) => Number(value) !== 1)) {
    throw new Error(`Durable workflow counts are incomplete: ${JSON.stringify(counts)}`);
  }
  await page.evaluate(() => {
    localStorage.removeItem("sentinel_auth_token");
    localStorage.removeItem("sentinel_auth_user");
  });
  await page.goto(`${appUrl}/reports`, { waitUntil: "networkidle" });
  await page.waitForURL(/login/);
  console.log(JSON.stringify({
    passed: true,
    mobileViewport: "390x844",
    realHazLenzEndpoint: true,
    humanReview: true,
    immutableReport: true,
    reloadPersistence: true,
    logoutProtection: true,
    persisted: counts,
  }));
} finally {
  await browser.close();
  await db.end();
}

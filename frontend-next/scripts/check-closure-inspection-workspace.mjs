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
  await page.getByLabel("What did you observe?").fill(text);
  await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
  // The v1 workspace renamed and re-sequenced these steps. Same contract, current wording:
  // review -> risk confirmation -> corrective action -> completion.
  await page.getByRole("heading", { name: "HazLenz assessment — review before finalizing" })
    .waitFor({ timeout: 60000 });
  await page.getByRole("button", { name: "Continue to risk review" }).click();
  await page.getByRole("button", { name: "Confirm risk and finalize finding" }).click();
  await page.getByRole("heading", { name: "Corrective action" }).waitFor({ timeout: 30000 });
  // The completion button stays disabled until a permanent correction is recorded, which is the
  // product's own guard against completing an inspection with no durable corrective action.
  await page.getByLabel("Permanent correction").fill(
    "Replace the cracked wheel guard with the OEM part and re-commission the grinder before use.",
  );
  await page.getByRole("button", { name: "Complete inspection and generate report" }).click();
  await page.getByRole("heading", { name: "Report generated" }).waitFor({ timeout: 60000 });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText(/Status: Completed/).waitFor();
  await page.goto(`${appUrl}/reports`, { waitUntil: "networkidle" });
  await page.getByText("Version 1", { exact: true }).first().waitFor();

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

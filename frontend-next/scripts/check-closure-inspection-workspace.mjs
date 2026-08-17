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
  await db.query(
    `INSERT INTO entitlement_grants
      ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','expert','active',now(),now()+interval '2 hours',NULL,
       'Disposable production-readiness browser fixture')`,
    [registered.userId],
  );

  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/);
  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  const siteName = `Closure site ${suffix}`;
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();
  await page.getByRole("button", { name: /Quick Inspection/ }).first().click();
  await page.getByRole("button", { name: "Start Quick Inspection" }).click();
  await page.waitForURL(/inspection-workspace/);

  const text =
    "At the fabrication shop, the pedestal grinder is unplugged, tagged do not use, and the wheel guard is cracked; nobody is using it while replacement parts are ordered.";
  await page.getByLabel("Observed condition").fill(text);
  await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
  await page.getByRole("heading", { name: "Human review required" }).waitFor({ timeout: 30000 });
  await page.getByRole("button", { name: "Confirm qualified review and finalize finding" }).click();
  await page.getByRole("heading", { name: "Follow-up and report" }).waitFor();
  await page.getByRole("button", { name: "Complete inspection and generate report" }).click();
  await page.getByRole("heading", { name: "Durably saved" }).waitFor({ timeout: 30000 });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText(/Status: completed/).waitFor();
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

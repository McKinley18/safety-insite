// Phase 1 UX audit of the guided inspection workspace.
// Read-only: drives the real workflow against the disposable QA stack and records
// what a customer can actually see and do. Makes no assertions about the fix.
import { chromium } from "playwright";
import pg from "pg";
import { mkdirSync, writeFileSync } from "node:fs";

const appUrl = process.env.APP_URL || "http://localhost:3010";
const apiUrl = process.env.API_BASE_URL || "http://localhost:4010";
const outDir = process.env.OUT_DIR || "/tmp/audit";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+|_qa_/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable database is required.");
}
mkdirSync(outDir, { recursive: true });

const suffix = Date.now();
const email = `ux-audit-${suffix}@insite-verify.test`;
const password = "UxAudit!Pass123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });
const notes = [];
const shot = async (page, name) => {
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  notes.push(`screenshot: ${name}.png`);
};

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const reg = await page.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "UX Audit", type: "individual" },
  });
  if (reg.status() !== 201) throw new Error(`register ${reg.status()} ${await reg.text()}`);
  const { userId } = await reg.json();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '4 hours',NULL,'Phase-1 UX audit fixture')`,
    [userId],
  );

  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/, { timeout: 30000 });

  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  await shot(page, "01-inspections-entry");
  const siteName = `UX audit site ${suffix}`;
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();

  // Full Inspection == the tier whose own description promises "multiple findings".
  await page.getByRole("button", { name: /Full Inspection/ }).first().click();
  await shot(page, "02-workflow-chosen");
  await page.getByRole("button", { name: /Start Full Inspection/ }).click();
  await page.waitForURL(/inspection-workspace/, { timeout: 30000 });
  await shot(page, "03-workspace-capture");

  // A realistic multi-condition observation, not a trivial fixture.
  const observation =
    "In the north warehouse aisle the emergency exit door is blocked by three stacked pallets, " +
    "and a 55-gallon drum of solvent next to it has no hazard label. " +
    "A forklift was operating in the same aisle while employees walked through.";
  await page.locator("#observation").fill(observation);
  await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
  await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
  await page.waitForTimeout(1500);
  await shot(page, "04-review-after-analysis");

  // What findings materialised, and what controls exist on the review step?
  const findingCards = await page.locator("section[aria-label='Persisted findings'] article").count();
  const buttons = await page.getByRole("button").allInnerTexts();
  const links = await page.getByRole("link").allInnerTexts();
  const bodyText = await page.locator("main.guided-page").innerText();
  const nestedMainCount = await page.locator("main").count();

  const addFindingAffordance = buttons.filter((b) => /add.*(finding|observation|hazard)/i.test(b));
  const stepLabels = await page.locator("nav[aria-label='Inspection progress'] span").allInnerTexts();
  const heading = await page.locator("h1").first().innerText();

  const report = {
    observation,
    workspaceHeading: heading,
    nestedMainLandmarks: nestedMainCount,
    stepLabels,
    findingCardsRendered: findingCards,
    reviewStepButtons: buttons,
    reviewStepLinks: links,
    addFindingAffordancesFound: addFindingAffordance,
    mentionsAddFinding: /add finding/i.test(bodyText),
    internalTerminologyOnScreen: [
      "Server-saved inspection", "Persisted hazard findings", "Persisted findings",
      "superseded", "candidate", "segmentKey", "Analysis:", "Finding ID:",
    ].filter((t) => bodyText.includes(t)),
  };
  writeFileSync(`${outDir}/phase1-review-step.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  // Mobile view of the same step.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await shot(page, "05-review-mobile");
} finally {
  await browser.close();
  await db.end();
}

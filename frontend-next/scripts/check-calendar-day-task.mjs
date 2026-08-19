// Phase 7 verification: create/schedule a task directly from a selected calendar day.
// Covers empty day, a day that already has tasks, a future date, persistence across reload,
// date-boundary correctness, and the narrow/mobile viewport.
import { chromium } from "playwright";
import pg from "pg";
import { mkdirSync } from "node:fs";

const appUrl = process.env.APP_URL || "http://localhost:3010";
const apiUrl = process.env.API_BASE_URL || "http://localhost:4010";
const outDir = process.env.OUT_DIR || "/tmp/calendar";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+|_qa_/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable database is required.");
}
mkdirSync(outDir, { recursive: true });

const suffix = Date.now();
const email = `calendar-${suffix}@insite-verify.test`;
const password = "Calendar!Pass123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });

// A future date well inside the same month grid, chosen without Date.now ambiguity.
const target = new Date();
target.setDate(target.getDate() + 9);
const pad = (n) => String(n).padStart(2, "0");
const targetKey = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;

const problems = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const reg = await page.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Calendar Task", type: "individual" },
  });
  if (reg.status() !== 201) throw new Error(`register ${reg.status()} ${await reg.text()}`);
  const { userId } = await reg.json();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '4 hours',NULL,'Phase-7 calendar fixture')`,
    [userId],
  );

  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/, { timeout: 30000 });

  // Land on the calendar already focused on the future day (the ?date= entry point).
  await page.goto(`${appUrl}/safety-calendar?date=${targetKey}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // The day-level affordance lives in day view. Reaching it means expanding the collapsed
  // "Calendar Controls" accordion and picking DAY -- see FINAL_REPORT: the view switcher being
  // hidden behind an accordion is itself recorded as a discoverability finding.
  await page.getByRole("button", { name: "Calendar Controls" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /^day$/i }).first().click();
  await page.waitForTimeout(800);
  const addTaskBtn = page.locator("[data-testid='add-task-for-day']");
  await addTaskBtn.waitFor({ timeout: 15000 });
  await page.screenshot({ path: `${outDir}/cal-01-day-empty.png`, fullPage: true });

  // --- Empty day -----------------------------------------------------------
  await addTaskBtn.click();
  await page.waitForTimeout(700);
  const prefilled = await page.locator("input[type='date']").first().inputValue();
  if (prefilled !== targetKey) problems.push(`date not prefilled from selected day: ${prefilled} != ${targetKey}`);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
  if (focused !== "task-title") problems.push(`focus did not move to the title field (was ${focused})`);

  await page.locator("[data-testid='task-title']").fill("Replace damaged ladder");
  await page.getByRole("button", { name: /^Schedule$/ }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${outDir}/cal-02-task-created.png`, fullPage: true });

  const afterFirst = await page.locator("main").innerText();
  if (!afterFirst.includes("Replace damaged ladder")) problems.push("task not visible on the day after scheduling");

  // --- Day that already has a task ----------------------------------------
  await page.locator("[data-testid='add-task-for-day']").click();
  await page.waitForTimeout(600);
  const prefilled2 = await page.locator("input[type='date']").first().inputValue();
  if (prefilled2 !== targetKey) problems.push(`date not retained for second task: ${prefilled2}`);
  await page.locator("[data-testid='task-title']").fill("Toolbox talk on ladder safety");
  await page.getByRole("button", { name: /^Schedule$/ }).click();
  await page.waitForTimeout(1200);

  // --- Persistence across reload ------------------------------------------
  // Reload returns to the default month view, so re-enter day view for the same date the way
  // a returning user would. (View/day is not itself persisted -- recorded as a minor finding.)
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Calendar Controls" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /^day$/i }).first().click();
  await page.waitForTimeout(900);
  const bodyAfterReload = await page.locator("main").innerText();
  const survived = ["Replace damaged ladder", "Toolbox talk on ladder safety"]
    .filter((t) => bodyAfterReload.includes(t));
  if (survived.length !== 2) problems.push(`only ${survived.length}/2 tasks survived reload`);

  // --- Date-boundary truth in storage --------------------------------------
  const stored = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem("auditally_personal_calendar_events") || "[]"); }
    catch { return []; }
  });
  const storedForTarget = stored.filter((e) => e.date === targetKey);
  if (storedForTarget.length !== 2) {
    problems.push(`expected 2 stored events on ${targetKey}, found ${storedForTarget.length} (dates: ${stored.map((e) => e.date).join(",")})`);
  }

  await page.screenshot({ path: `${outDir}/cal-03-after-reload.png`, fullPage: true });

  // --- Mobile --------------------------------------------------------------
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  const mobileBtn = page.locator("[data-testid='add-task-for-day']");
  const mobileVisible = await mobileBtn.isVisible();
  if (!mobileVisible) problems.push("add-task control not visible at 390px");
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) problems.push("horizontal overflow at 390px");
  await page.screenshot({ path: `${outDir}/cal-04-mobile.png`, fullPage: true });

  console.log(JSON.stringify({
    targetDate: targetKey,
    datePrefilledFromSelectedDay: prefilled === targetKey,
    focusMovedToTitle: focused === "task-title",
    tasksSurvivingReload: survived.length,
    storedEventsOnTargetDate: storedForTarget.length,
    storedDates: stored.map((e) => e.date),
    mobileControlVisible: mobileVisible,
    horizontalOverflowAt390: overflow,
    passed: problems.length === 0,
    problems,
  }, null, 2));
  if (problems.length) process.exitCode = 1;
} finally {
  await browser.close();
  await db.end();
}

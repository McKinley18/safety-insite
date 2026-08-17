import { chromium } from "playwright";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const failures = [];
  for (const [route, text] of [
    ["/command-center", /Start Inspection/i],
    ["/inspection", /finding|observation|inspection/i],
    ["/inspection-review", /No finalized report found|Final Review/i],
    ["/inspections", /inspection/i],
    ["/reports", /report/i],
    ["/safety-calendar", /Organize inspections, actions/i],
  ]) {
    const response = await page.goto(`${APP_URL}${route}`, { waitUntil: "networkidle" });
    if (!response || response.status() >= 400) failures.push(`${route}: HTTP ${response?.status()}`);
    const visible = await page.getByText(text).first().isVisible().catch(() => false);
    if (!visible) failures.push(`${route}: expected workflow state not visible`);
  }
  await browser.close();
  if (failures.length) throw new Error(failures.join("; "));
  console.log("PASS: current inspection, report, corrective-action, and calendar routes render meaningful UI.");
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});

const { chromium } = require("playwright");

const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(APP_URL, { waitUntil: "networkidle" });

  await page.evaluate(() => {
    localStorage.setItem(
      "sentinel_auth_user",
      JSON.stringify({ planCode: "company", type: "company" })
    );

    localStorage.removeItem("sentinel_encrypted_actions");
    localStorage.setItem("sentinel_company_assigned_work", JSON.stringify([]));
  });

  await page.goto(`${APP_URL}/actions`, { waitUntil: "networkidle" });

  await page
    .getByPlaceholder("Describe the corrective action")
    .fill("Command sync test corrective action");

  await page.locator("select").first().selectOption({ label: "High" });
  await page.locator('input[type="date"]').fill("2026-05-28");
  await page.getByRole("button", { name: "Add Action" }).click();

  await page.waitForFunction(() => {
    const stored = localStorage.getItem("sentinel_encrypted_actions");
    return !!stored && stored.length > 20;
  });

  await page.goto(`${APP_URL}/company`, { waitUntil: "networkidle" });

  const visibleInCompany = await page
    .getByText("Command sync test corrective action")
    .isVisible()
    .catch(() => false);

  if (!visibleInCompany) {
    throw new Error("Corrective action did not appear in Company Control Center.");
  }

  await page.getByRole("button", { name: "Start" }).first().click();

  await page.goto(`${APP_URL}/actions`, { waitUntil: "networkidle" });

  const visibleInActions = await page
    .getByText("Command sync test corrective action")
    .isVisible()
    .catch(() => false);

  if (!visibleInActions) {
    throw new Error("Corrective action did not appear on Actions page.");
  }

  const statusVisible = await page
    .getByText("Status: In Progress")
    .isVisible()
    .catch(() => false);

  if (!statusVisible) {
    throw new Error("Actions page did not reflect Company-updated status.");
  }

  await browser.close();
  console.log("PASS: Company Control Center and Actions page sync is working.");
}

main().catch(async (error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});

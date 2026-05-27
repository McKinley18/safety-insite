const { chromium } = require("playwright");

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const TEST_TITLE = "Workflow visibility corrective action";

async function expectVisible(page, text, message) {
  const visible = await page.getByText(text).first().isVisible().catch(() => false);
  if (!visible) throw new Error(message);
}

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

  await page.getByPlaceholder("Describe the corrective action").fill(TEST_TITLE);
  await page.locator('select').first().selectOption("Critical");
  await page.locator('input[type="date"]').fill("2026-05-28");
  await page.getByRole("button", { name: "Add Action" }).click();

  await expectVisible(
    page,
    TEST_TITLE,
    "Actions page did not show the newly created corrective action."
  );

  await page.goto(`${APP_URL}/command-center`, { waitUntil: "networkidle" });
  await expectVisible(
    page,
    TEST_TITLE,
    "Command Center did not show the corrective action created through Actions."
  );

  await page.goto(`${APP_URL}/company`, { waitUntil: "networkidle" });
  await expectVisible(
    page,
    TEST_TITLE,
    "Company Control Center did not show the corrective action created through Actions."
  );

  await page.getByRole("button", { name: "Complete" }).first().click();

  await page.goto(`${APP_URL}/actions`, { waitUntil: "networkidle" });
  await expectVisible(
    page,
    "Status: Completed",
    "Actions page did not reflect Company-completed status."
  );

  await browser.close();
  console.log("PASS: Command Center, Actions, and Company action workflow visibility is working.");
}

main().catch(async (error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});

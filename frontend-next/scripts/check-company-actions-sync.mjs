import { chromium } from "playwright";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${APP_URL}/command-center`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Home", exact: true }).waitFor();
  await page.getByText(/track corrective actions/i).waitFor();
  await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Organize inspections, actions/i }).waitFor();
  await page.getByText(/corrective actions/i).first().waitFor();
  if (page.url().includes("/actions")) throw new Error("Workflow unexpectedly depends on removed /actions route.");
  await browser.close();
  console.log("PASS: corrective-action surfaces use current command-center and safety-calendar routes.");
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});

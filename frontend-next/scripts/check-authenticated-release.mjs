import { chromium } from "playwright";

const appUrl = process.env.APP_URL || "http://127.0.0.1:3001";
const apiUrl = process.env.API_BASE_URL || "http://127.0.0.1:4100";
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
if (!email || !password) throw new Error("E2E_EMAIL and E2E_PASSWORD fixture credentials are required.");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/);
  await page.getByRole("heading", { name: "Home", exact: true }).waitFor();
  const token = await page.evaluate(() => localStorage.getItem("sentinel_auth_token"));
  if (!token) throw new Error("Authenticated token was not persisted.");
  const reports = await page.request.get(`${apiUrl}/reports`, { headers: { authorization: `Bearer ${token}` } });
  if (!reports.ok()) throw new Error(`Authenticated cloud report persistence is unavailable: HTTP ${reports.status()}.`);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Home", exact: true }).waitFor();
  console.log("PASS: UI login, session persistence, authenticated command center, and cloud report API.");
} finally {
  await browser.close();
}

import { chromium } from "playwright";

const appUrl = process.env.APP_URL || "http://127.0.0.1:3104";
const apiUrl = process.env.API_BASE_URL || "http://127.0.0.1:4104";
const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const email = `phase4-browser-${suffix}@example.test`;
const password = "Phase4!StrongPass123";
const siteName = `Browser persisted site ${suffix}`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const registration = await page.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Phase 4 Browser", type: "individual" },
  });
  if (registration.status() !== 201) {
    throw new Error(`Fixture registration failed: HTTP ${registration.status()}`);
  }

  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/);
  const token = await page.evaluate(() => localStorage.getItem("sentinel_auth_token"));
  if (!token) throw new Error("UI login did not persist an authenticated session.");

  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();
  await page.getByLabel("Saved site").selectOption({ label: siteName });
  await page.getByRole("button", { name: /Quick Inspection/ }).first().click();
  await page.getByRole("button", { name: "Start Quick Inspection" }).click();
  await page.waitForURL(/inspection-quick/);

  const context = await page.evaluate(() => {
    const raw = localStorage.getItem("sentinel_selected_inspection_context");
    return raw ? JSON.parse(raw) : null;
  });
  if (!context?.persistedInspectionId || context.persistenceState !== "saved") {
    throw new Error("UI did not retain the server-confirmed inspection identifier.");
  }
  const persisted = await page.request.get(
    `${apiUrl}/inspections/${context.persistedInspectionId}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!persisted.ok()) {
    throw new Error(`Persisted inspection lookup failed: HTTP ${persisted.status()}`);
  }
  const persistedBody = await persisted.json();
  if (persistedBody.status !== "draft" || persistedBody.siteId !== context.persistedSiteId) {
    throw new Error("Persisted inspection state does not match the UI context.");
  }

  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  await page.getByLabel("Saved site").selectOption({ label: siteName });
  await page.getByText(/1 persisted inspection/).waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByLabel("Saved site").selectOption({ label: siteName });

  await page.evaluate(() => {
    localStorage.removeItem("sentinel_auth_token");
    localStorage.removeItem("sentinel_auth_user");
  });
  const unauthorized = await page.request.get(
    `${apiUrl}/inspections/${context.persistedInspectionId}`,
  );
  if (unauthorized.status() !== 401) {
    throw new Error(`Unauthenticated inspection lookup returned ${unauthorized.status()}, expected 401.`);
  }

  console.log(JSON.stringify({
    passed: true,
    viewport: "390x844",
    uiLogin: true,
    sitePersistence: true,
    inspectionPersistence: true,
    reloadPersistence: true,
    unauthenticatedDenial: true,
  }));
} finally {
  await browser.close();
}

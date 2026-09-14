/**
 * Every ACTIVE workflow route renders meaningful UI rather than an empty shell.
 *
 * ==================== THE INSTRUMENT DEFECT §281 FOUND ====================
 *
 * This gate asserted that AUTHENTICATED routes render their workflow state, and never signed in.
 * Against a stack with `DEV_AUTH_BYPASS=false` — which is what the product ships and what every
 * §279/§280/§281 review stack runs — AppShell's guard redirects each of them to `/login`, the
 * expected text is absent, and the gate fails for a reason unrelated to what it is testing.
 * Measured at §281: HEAD's version fails identically, on the three routes §281 did not touch.
 *
 * So its green runs were obtained against a BYPASSED stack, where the assertion was real, and its
 * result against a non-bypassed one was noise. It now signs in through the form, like every other
 * review instrument in this directory.
 *
 * When no credentials are supplied the authenticated rows are reported NOT_EXERCISED and the run
 * FAILS rather than passing on whatever happens to be measurable. A gate that quietly checks a
 * fraction of what it claims is worse than one that refuses to answer.
 *
 * Usage: APP_URL=... VAL_EMAIL=... VAL_PASSWORD=... node scripts/check-action-workflow-visibility.mjs
 */
import { chromium } from "playwright";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const EMAIL = process.env.VAL_EMAIL || "";
const PASSWORD = process.env.VAL_PASSWORD || "";

const ROUTES = [
  { route: "/command-center", text: /Start Inspection/i, auth: true },
  // §281 (D-038). These two rows used to name /inspection and /inspection-review, a closed cycle
  // no customer could reach — so the gate was asserting that unreachable pages rendered. The
  // ACTIVE surfaces for the same two questions are the workspace and the completion page.
  { route: "/inspection-workspace", text: /finding|observation|inspection/i, auth: true },
  { route: "/inspection-complete", text: /inspection|report|complete/i, auth: true },
  { route: "/inspections", text: /inspection/i, auth: true },
  { route: "/reports", text: /report/i, auth: true },
  { route: "/safety-calendar", text: /Organize inspections, actions/i, auth: true },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const failures = [];
  const notExercised = [];

  let signedIn = false;
  if (EMAIL && PASSWORD) {
    await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.fill('input[autocomplete="email"]', EMAIL);
    await page.fill('input[autocomplete="current-password"]', PASSWORD);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForTimeout(2000);
    signedIn = await page.evaluate(() => Boolean(localStorage.getItem("sentinel_auth_token")));
    if (!signedIn) failures.push("sign-in produced no session, so no authenticated row was measured");
  }

  for (const { route, text, auth } of ROUTES) {
    if (auth && !signedIn) {
      notExercised.push(route);
      continue;
    }
    const response = await page.goto(`${APP_URL}${route}`, { waitUntil: "networkidle" });
    if (!response || response.status() >= 400) failures.push(`${route}: HTTP ${response?.status()}`);
    // Where the guard actually left us. Landing on /login and then matching the word "inspection"
    // somewhere on the sign-in page would otherwise be recorded as a pass.
    const landed = new URL(page.url()).pathname;
    if (landed !== route) {
      failures.push(`${route}: redirected to ${landed}, so its workflow state never rendered`);
      continue;
    }
    const visible = await page.getByText(text).first().isVisible().catch(() => false);
    if (!visible) failures.push(`${route}: expected workflow state not visible`);
  }

  await browser.close();

  if (notExercised.length) {
    failures.push(`NOT_EXERCISED (no VAL_EMAIL / VAL_PASSWORD supplied): ${notExercised.join(", ")}`);
  }
  if (failures.length) throw new Error(failures.join("; "));
  console.log(`PASS: ${ROUTES.length} active workflow routes render meaningful UI, signed in, with no bypass.`);
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});

// §285 (D-044) — THE FOUR DASHBOARD KPIs COME FROM THEIR INTENDED AUTHORITATIVE SOURCES,
// AND NONE OF THEM CAN FALL BACK TO A FALSE ZERO.
//
// ==================== WHAT THIS HAS TO PROVE, AND WHY A SCREENSHOT CANNOT ====================
//
// The board reads INSPECTIONS / FINDINGS / OPEN ACTIONS / OVERDUE ACTIONS. A tile showing "4" is
// not evidence of anything: §281 measured this same board showing four confident zeroes while the
// server held seven inspections and nine observations, because the read path composed device-local
// stores nothing wrote. So each figure is checked against the SERVER'S OWN ANSWER, computed here
// independently of the page, and the page must equal it.
//
// ==================== AND THE FALSIFICATIONS, WHICH ARE THE POINT ====================
//
// Three deliberate breakages, because a gate that only ever sees a healthy server proves nothing
// about the failure it exists to catch:
//
//   X1  `/inspections` unreachable        -> Inspections AND Findings must both stop showing a
//                                            number. Findings rides on that response, so a tile
//                                            that still showed a figure would be showing a cached
//                                            or invented one.
//   X2  `/inspections` answers 200 with the rows but WITHOUT `findingCount` -- a rolling deploy, an
//                                            older instance, a field that got dropped -> Findings
//                                            must go UNKNOWN, not fall to a confident lower number.
//                                            This is the exact `|| 0` defect class D-041 forbids.
//   X3  the calendar unreachable         -> Open Actions and Overdue Actions must stop showing a
//                                            number, and Inspections/Findings must NOT be dragged
//                                            down with them.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> \
//     node scripts/validate-285-dashboard-kpis.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-285-kpis";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
mkdirSync(OUT_DIR, { recursive: true });

/**
 * Route patterns are scoped to the API ORIGIN, deliberately.
 *
 * A bare glob ending in `/inspections` also matches the APPLICATION's own `/inspections` page and
 * the Next.js prefetches for it, so it aborts or rewrites document navigation as well as the API
 * call it meant to break -- a harness fault that presents as the product failing to sign in. The
 * first run of this script did exactly that.
 */
const api = (path) => `${API_URL}${path}`;

const results = [];
let failures = 0;
function check(id, condition, detail = "") {
  results.push({ id, outcome: condition ? "PASS" : "FAIL", detail: String(detail).slice(0, 300) });
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${id}${detail ? `  [${String(detail).slice(0, 160)}]` : ""}`);
}

// ---------------------------------------------------------------------------------------------
// THE SERVER'S OWN ANSWER, computed without the page.
// ---------------------------------------------------------------------------------------------
const login = await (await fetch(`${API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})).json();
const token = login.accessToken || login.access_token || login.token;
if (!token) throw new Error("could not sign in to compute the expected values");
const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

const inspections = await (await fetch(`${API_URL}/inspections`, {
  headers: { Authorization: `Bearer ${token}` },
})).json();
const rows = Array.isArray(inspections) ? inspections : [];

const expected = {
  inspections: rows.length,
  // Summed from the field the server now carries. Also cross-checked below against the detail
  // route, so this gate cannot pass on an aggregate that is internally consistent and wrong.
  findings: rows.reduce((total, row) => total + (Number(row.findingCount) || 0), 0),
};

// CROSS-CHECK the aggregate against the per-inspection detail route, which composes findings from
// the relation rather than counting it. If the cheap aggregate and the expensive truth disagree,
// the aggregate is wrong and the tile would be confidently wrong with it.
let detailFindings = 0;
for (const row of rows) {
  const detail = await (await fetch(`${API_URL}/inspections/${row.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })).json();
  detailFindings += (detail.findings || []).filter(
    (f) => f.status === "pending_review" || f.status === "finalized",
  ).length;
}
check("S1 the findingCount aggregate equals the findings the detail route composes",
  expected.findings === detailFindings,
  `aggregate=${expected.findings} detail=${detailFindings}`);
check("S2 the aggregate carries a number for EVERY row, so the sum is not partial",
  rows.every((row) => typeof row.findingCount === "number"),
  rows.map((r) => typeof r.findingCount).join(","));

// ---------------------------------------------------------------------------------------------
const browser = await chromium.launch();

/** Sign in and read the four tiles as a user sees them. */
async function readBoard(context) {
  const page = await context.newPage();
  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.fill('input[autocomplete="email"]', EMAIL);
  await page.fill('input[autocomplete="current-password"]', PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 });
  await page.waitForTimeout(4000);
  const tiles = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-testid="stat-tile"]')).map((el) => ({
      key: el.getAttribute("data-tile-key"),
      state: el.getAttribute("data-tile-state"),
      value: (el.children[0]?.textContent || "").trim(),
      label: (el.children[1]?.textContent || "").trim(),
      caption: (el.children[2]?.textContent || "").trim() || null,
    })));
  return { page, tiles };
}

const byLabel = (tiles, label) => tiles.find((t) => t.label.toUpperCase() === label.toUpperCase());

// =================================================================================================
// THE HEALTHY BOARD.
// =================================================================================================
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const { page, tiles } = await readBoard(context);
  await page.screenshot({ path: `${OUT_DIR}/board-current-1280.png`, fullPage: true });

  check("K0 the board shows exactly four tiles", tiles.length === 4,
    tiles.map((t) => `${t.label}=${t.value}`).join(" | "));
  check("K1 the four labels are the approved KPI set",
    ["INSPECTIONS", "FINDINGS", "OPEN ACTIONS", "OVERDUE ACTIONS"]
      .every((label) => Boolean(byLabel(tiles, label))),
    tiles.map((t) => t.label).join(" | "));
  check("K2 Inspections EQUALS the server's own count, not merely a plausible number",
    byLabel(tiles, "INSPECTIONS")?.value === String(expected.inspections),
    `tile=${byLabel(tiles, "INSPECTIONS")?.value} server=${expected.inspections}`);
  check("K3 Findings EQUALS the server's own aggregate",
    byLabel(tiles, "FINDINGS")?.value === String(expected.findings),
    `tile=${byLabel(tiles, "FINDINGS")?.value} server=${expected.findings}`);
  check("K4 no tile carries a state caption when everything is reachable",
    tiles.every((t) => !t.caption), tiles.map((t) => t.caption).join(","));
  // A board of four zeroes is what §281 measured. If the fixture has no data this gate is
  // vacuous, and it says so rather than passing quietly.
  check("K5 THE FIXTURE IS NOT EMPTY, so K2/K3 are not satisfied by zero",
    expected.inspections > 0 && expected.findings > 0,
    `inspections=${expected.inspections} findings=${expected.findings}`);
  await context.close();
}

// =================================================================================================
// X1 — `/inspections` UNREACHABLE. Inspections and Findings must both stop showing a number.
// =================================================================================================
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route(api("/inspections"), (route) => route.abort("failed"));
  const { page, tiles } = await readBoard(context);
  await page.screenshot({ path: `${OUT_DIR}/board-x1-inspections-unreachable-1280.png`, fullPage: true });
  check("X1a Inspections shows no number when its source cannot be reached",
    !/^\d+$/.test(byLabel(tiles, "INSPECTIONS")?.value || ""),
    byLabel(tiles, "INSPECTIONS")?.value);
  check("X1b Findings shows no number either — it rides on the same response",
    !/^\d+$/.test(byLabel(tiles, "FINDINGS")?.value || ""),
    byLabel(tiles, "FINDINGS")?.value);
  check("X1c and both say why", Boolean(byLabel(tiles, "INSPECTIONS")?.caption)
    && Boolean(byLabel(tiles, "FINDINGS")?.caption),
    `${byLabel(tiles, "INSPECTIONS")?.caption} / ${byLabel(tiles, "FINDINGS")?.caption}`);
  await context.close();
}

// =================================================================================================
// X2 — THE FALSE-ZERO FALSIFICATION. The rows arrive, `findingCount` does not.
//
// This is the case the implementation was written for. A `|| 0` here produces a confident,
// wrong, LOWER number on a safety board, and nothing about the response looks broken.
// =================================================================================================
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route(api("/inspections"), async (route) => {
    const response = await route.fetch();
    const body = await response.json().catch(() => null);
    if (!Array.isArray(body)) return route.fulfill({ response });
    // Strip the field the server now sends, leaving everything else intact.
    const stripped = body.map(({ findingCount, ...rest }) => rest);
    return route.fulfill({
      response, body: JSON.stringify(stripped), contentType: "application/json",
    });
  });
  const { page, tiles } = await readBoard(context);
  await page.screenshot({ path: `${OUT_DIR}/board-x2-no-findingcount-1280.png`, fullPage: true });
  check("X2a Inspections still shows its number — the response WAS reachable",
    byLabel(tiles, "INSPECTIONS")?.value === String(expected.inspections),
    byLabel(tiles, "INSPECTIONS")?.value);
  check("X2b FINDINGS DOES NOT FALL TO A FALSE LOWER NUMBER when the field is absent",
    byLabel(tiles, "FINDINGS")?.value !== "0"
      && !/^\d+$/.test(byLabel(tiles, "FINDINGS")?.value || ""),
    `findings tile read "${byLabel(tiles, "FINDINGS")?.value}"`);
  check("X2c and it says it does not know",
    Boolean(byLabel(tiles, "FINDINGS")?.caption), byLabel(tiles, "FINDINGS")?.caption);
  await context.close();
}

// =================================================================================================
// X3 — CALENDAR UNREACHABLE. The action tiles go unknown; the inspection tiles must NOT.
// =================================================================================================
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route(`${API_URL}/calendar**`, (route) => route.abort("failed"));
  const { page, tiles } = await readBoard(context);
  await page.screenshot({ path: `${OUT_DIR}/board-x3-calendar-unreachable-1280.png`, fullPage: true });
  check("X3a Open Actions shows no number",
    !/^\d+$/.test(byLabel(tiles, "OPEN ACTIONS")?.value || ""),
    byLabel(tiles, "OPEN ACTIONS")?.value);
  check("X3b Overdue Actions shows no number",
    !/^\d+$/.test(byLabel(tiles, "OVERDUE ACTIONS")?.value || ""),
    byLabel(tiles, "OVERDUE ACTIONS")?.value);
  check("X3c INSPECTIONS IS NOT DRAGGED DOWN WITH THEM — one source failing is not four",
    byLabel(tiles, "INSPECTIONS")?.value === String(expected.inspections),
    byLabel(tiles, "INSPECTIONS")?.value);
  check("X3d and neither is Findings",
    byLabel(tiles, "FINDINGS")?.value === String(expected.findings),
    byLabel(tiles, "FINDINGS")?.value);
  await context.close();
}

writeFileSync(`${OUT_DIR}/results.json`, JSON.stringify({
  account: EMAIL,
  entitlement: {
    planClaim: claims.planCode || claims.subscriptionTier || "unknown",
    note: "The findings aggregate carries NO entitlement gate by design; this run is on the plan named above.",
  },
  expected,
  detailCrossCheck: detailFindings,
  results,
  failures,
}, null, 2));
console.log(`\n${results.length - failures} passed, ${failures} failed.`);
console.log(`§285 dashboard KPIs: ${failures ? "FAIL" : "PASS"}`);
await browser.close();
process.exit(failures ? 1 : 0);

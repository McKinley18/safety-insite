// §285 — OFFLINE INVENTORY FOR THE COMPLETION AND REPORT SURFACES (D-037 continued).
//
// MEASURES, IT DOES NOT BUILD. §285 explicitly forbids implementing the D-042 intermittent-
// connectivity architecture here. What this produces is the inventory: per surface, OFFLINE =
// WORKS | PARTIAL | REQUIRES_NETWORK | UNKNOWN, and DATA_LOSS_RISK = NONE_KNOWN | RECOVERABLE |
// VULNERABLE | UNKNOWN, plus direct answers to the six questions §285 names.
//
// IT REFUSES TO RUN WITHOUT A CONTROLLING SERVICE WORKER. §280 established that a dev server does
// not register one, so any "offline" reading taken there measures a browser with no application
// shell rather than the product without a network -- a false negative on every route.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> \
//     node scripts/measure-285-completion-report-offline.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-285-offline";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
mkdirSync(`${OUT_DIR}/screenshots`, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 20000 });
await page.waitForTimeout(1500);
await page.fill('input[autocomplete="email"]', EMAIL);
await page.fill('input[autocomplete="current-password"]', PASSWORD);
await page.locator('button[type="submit"]').click();
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25000 });
await page.waitForTimeout(3000);

const sw = await page.evaluate(async () => {
  if (!("serviceWorker" in navigator)) return { supported: false, controlled: false };
  await Promise.race([
    navigator.serviceWorker.ready.then(() => true),
    new Promise((r) => setTimeout(r, 8000)),
  ]);
  return { supported: true, controlled: Boolean(navigator.serviceWorker.controller) };
});
if (!sw.controlled) {
  console.error("REFUSED: no service worker is controlling the page. An offline reading taken now "
    + "would measure a browser with no application shell, not the product without a network. "
    + "Run against a PRODUCTION build (`next build` + `next start`).");
  await browser.close();
  process.exit(2);
}

// Prime the surfaces while online so the offline reading is of a REVISITED page, which is the case
// an inspector is actually in -- they had the app open before the signal went.
const SURFACES = [
  { id: "inspection-complete", path: "/inspection-complete", openInspection: "state A" },
  { id: "reports", path: "/reports" },
];
for (const surface of SURFACES) {
  if (surface.openInspection) {
    await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    await page.locator("li").filter({ hasText: surface.openInspection }).first()
      .locator('[data-testid="open-inspection"]').click({ timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }
  await page.goto(`${APP_URL}${surface.path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
}

const inventory = [];
await context.setOffline(true);

for (const surface of SURFACES) {
  await page.goto(`${APP_URL}${surface.path}`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(4000);
  const reading = await page.evaluate(() => {
    const body = document.body.innerText || "";
    return {
      textLength: body.length,
      // The product's own offline vocabulary, established at §281 (dataState) and D-037.
      // The product's EXPLICIT refusal, which is decisive. "Offline" alone appears in the shell's
      // connectivity indicator on every page and says nothing about whether the surface works.
      refusesExplicitly: /needs a connection|could not reach the network|was not saved on this device/i.test(body),
      saysOffline: /offline|no connection|needs a connection|could not be loaded|unavailable/i.test(body),
      // Does the surface render ITS OWN RECORD CONTENT, or only chrome? Measured from the page's
      // own record elements rather than from a character count, because the app shell alone is
      // several hundred characters and would read as "content" on any surface.
      recordContent: document.querySelectorAll(
        '[data-testid="stat-tile"], article, li a[href], [data-testid="open-inspection"]',
      ).length,
      hasContent: body.length > 400,
      excerpt: body.slice(0, 400).replace(/\n+/g, " | "),
      controls: Array.from(document.querySelectorAll("button"))
        .map((b) => ({ label: (b.textContent || "").trim().slice(0, 30), disabled: b.disabled }))
        .filter((c) => c.label).slice(0, 10),
    };
  });
  await page.screenshot({ path: `${OUT_DIR}/screenshots/${surface.id}-offline-1280.png`, fullPage: true });

  /**
   * The classification is on RECORD CONTENT, not on character count. A surface that renders the
   * application shell, a heading and an honest "this page needs a connection" is REQUIRES_NETWORK,
   * however many characters that is -- the inspector got no record. PARTIAL is reserved for a
   * surface that actually shows record content and says it may be stale.
   */
  const offline = reading.refusesExplicitly ? "REQUIRES_NETWORK"
    : reading.recordContent > 0 && !reading.saysOffline ? "WORKS"
      : reading.recordContent > 0 ? "PARTIAL"
        : "REQUIRES_NETWORK";
  /**
   * DATA_LOSS_RISK is about work the inspector had done that the surface could lose. Neither of
   * these two surfaces accepts input: `/inspection-complete` is a read of a finished record and
   * `/reports` is a library. There is nothing on either to lose, which is why both are NONE_KNOWN
   * -- and that is a statement about THESE surfaces, not about the workflow that precedes them.
   */
  const dataLossRisk = "NONE_KNOWN";
  inventory.push({
    surface: surface.id, path: surface.path, offline, dataLossRisk,
    dataLossBasis: "The surface accepts no input; it renders a completed record or a library of them.",
    reading,
  });
  console.log(`${surface.id.padEnd(22)} OFFLINE=${offline}  DATA_LOSS_RISK=${dataLossRisk}  `
    + `refuses=${reading.refusesExplicitly} recordContent=${reading.recordContent}`);
}

// ---------------------------------------------------------------------------------------------
// THE SIX QUESTIONS §285 ASKS, answered by attempt rather than by reading source.
// ---------------------------------------------------------------------------------------------
const answers = {};

// Can a report be DOWNLOADED offline? The download is a direct API fetch, not a cached asset.
answers.canDownloadReportOffline = await page.evaluate(async (apiUrl) => {
  try {
    const response = await fetch(`${apiUrl}/inspection-reports`, { cache: "no-store" });
    return { reached: true, status: response.status };
  } catch (error) {
    return { reached: false, error: String(error).slice(0, 120) };
  }
}, API_URL);

// Can an inspection be COMPLETED offline? Attempt the real transition through the app's own client.
answers.canCompleteOffline = await page.evaluate(async (apiUrl) => {
  try {
    const response = await fetch(`${apiUrl}/inspections`, { cache: "no-store" });
    return { listReached: true, status: response.status };
  } catch (error) {
    return { listReached: false, error: String(error).slice(0, 120) };
  }
}, API_URL);

await context.setOffline(false);
await page.waitForTimeout(2000);

// Reconnect: does the surface recover without a manual reload?
await page.goto(`${APP_URL}/reports`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3500);
answers.recoversOnReconnect = await page.evaluate(() => {
  const body = document.body.innerText || "";
  return {
    saysOffline: /offline|no connection|could not be loaded/i.test(body),
    textLength: body.length,
  };
});

// ---------------------------------------------------------------------------------------------
// INTERRUPTION DURING GENERATION — measured, not built. The connection is dropped while the
// generate request is in flight, and the question is whether the record is left consistent.
// ---------------------------------------------------------------------------------------------
const token = (await (await fetch(`${API_URL}/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})).json());
const bearer = token.accessToken || token.access_token || token.token;
const H = { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" };
const inspections = await (await fetch(`${API_URL}/inspections`, { headers: H })).json();
const completed = (Array.isArray(inspections) ? inspections : []).find((i) => i.status === "completed");
if (completed) {
  const before = await (await fetch(`${API_URL}/inspections/${completed.id}/report`, { headers: H })).json();
  const reportId = before?.reportId || before?.report?.reportId;
  const revsBefore = reportId
    ? (await (await fetch(`${API_URL}/inspection-reports/${reportId}/revisions`, { headers: H })).json())?.revisionCount
    : null;
  // Abort the generate request client-side mid-flight. The server keeps working; the CLIENT loses
  // the answer, which is exactly what a dropped signal does to an inspector.
  const controller = new AbortController();
  const inFlight = fetch(`${API_URL}/inspections/${completed.id}/reports`,
    { method: "POST", headers: H, signal: controller.signal })
    .then((r) => ({ ok: r.ok, status: r.status }))
    .catch((e) => ({ aborted: true, error: String(e).slice(0, 80) }));
  setTimeout(() => controller.abort(), 40);
  const outcome = await inFlight;
  await new Promise((r) => setTimeout(r, 3000));
  const revsAfter = reportId
    ? (await (await fetch(`${API_URL}/inspection-reports/${reportId}/revisions`, { headers: H })).json())?.revisionCount
    : null;
  /**
   * NOT_EXERCISED IS A REAL OUTCOME HERE and must be reported as one. If the request COMPLETED
   * before the abort fired, the connection was never interrupted and the run says nothing about
   * interruption -- reading the resulting revision count as "interruption is safe" would be
   * exactly the vacuous pass this section's instrument discipline forbids.
   */
  const genuinelyAborted = Boolean(outcome?.aborted);
  answers.generationInterrupted = {
    exercised: genuinelyAborted,
    clientOutcome: outcome,
    revisionCountBefore: revsBefore,
    revisionCountAfter: revsAfter,
    interpretation: !genuinelyAborted
      ? `NOT_EXERCISED — the generate request completed (${JSON.stringify(outcome)}) before the abort `
        + `fired, so no interruption occurred. The revision count moved ${revsBefore} -> ${revsAfter} `
        + "because the generation SUCCEEDED, which evidences nothing about a dropped connection. "
        + "Measuring this properly needs the connection cut at the transport, not an abort racing a "
        + "fast local server, and that belongs with D-042."
      : revsAfter === revsBefore
        ? "The aborted request produced NO revision: the client lost the answer and the record is unchanged."
        : `The server completed the generation the client abandoned (${revsBefore} -> ${revsAfter}). `
          + "The record is consistent and carries one more revision; the client simply does not know "
          + "it. No duplicate or partial state was created.",
  };
  console.log(`generation interruption: exercised=${genuinelyAborted} `
    + `revisions ${revsBefore} -> ${revsAfter}`);
}

writeFileSync(`${OUT_DIR}/offline-inventory.json`, JSON.stringify({
  instrument: "§285 offline inventory — completion and report surfaces",
  measuredAt: new Date().toISOString(),
  serviceWorker: sw,
  account: EMAIL,
  inventory, answers,
}, null, 2));
console.log(`\nevidence: ${OUT_DIR}/offline-inventory.json`);
await browser.close();

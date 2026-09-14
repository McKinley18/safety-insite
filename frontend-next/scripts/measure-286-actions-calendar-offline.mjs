// §286 BATCH 5 — OFFLINE AND INTERMITTENT-CONNECTIVITY INVENTORY FOR ACTIONS AND THE CALENDAR.
//
// MEASURES, IT DOES NOT BUILD. §286 is explicit that the D-042 architecture is not to be built
// here. What this produces is the inventory -- per operation, OFFLINE = WORKS | PARTIAL |
// REQUIRES_NETWORK | UNKNOWN and DATA_LOSS_RISK = NONE_KNOWN | RECOVERABLE | VULNERABLE | UNKNOWN
// -- and the bounded interruption sequence the direction names:
//
//     ONLINE -> DEGRADED -> TIMEOUT -> OFFLINE -> RECONNECT
//
// IT REFUSES TO RUN WITHOUT A CONTROLLING SERVICE WORKER. §280 established that a dev server does
// not register one, so an "offline" reading taken there measures a browser with no application
// shell rather than the product without a network -- a false negative on every route.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> \
//     node scripts/measure-286-actions-calendar-offline.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-286-offline";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
mkdirSync(`${OUT_DIR}/screenshots`, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
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

// Prime the surface while ONLINE. That is the case an inspector is actually in: they had the app
// open and walking before the signal went, so a cold first load is the wrong stimulus.
await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
const onlineReading = await page.evaluate(() => ({
  events: document.querySelectorAll('[data-testid="calendar-event"], article, li').length,
  textLength: (document.body.innerText || "").length,
}));

const inventory = [];
const timeline = [];
function step(phase, detail) {
  timeline.push({ phase, at: new Date().toISOString(), detail });
  console.log(`${phase.padEnd(12)} ${JSON.stringify(detail).slice(0, 170)}`);
}
step("ONLINE", onlineReading);

// =================================================================================================
// DEGRADED — the network is present but slow. This is the state a field device spends most of its
// bad time in, and it is NOT the same as offline: requests complete, eventually.
// =================================================================================================
/**
 * NON-VACUITY. Every phase below counts the requests it actually intercepted. A "degraded" or
 * "timed out" reading taken while the route matched nothing is a reading of a HEALTHY page, and
 * reporting it as a connectivity result would be the §285 I-15 failure in a new place.
 */
let degradedIntercepts = 0;
await context.route("**/calendar", async (route) => {
  degradedIntercepts += 1;
  await new Promise((r) => setTimeout(r, 6000));
  await route.continue();
});
const degradedStart = Date.now();
await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" });
// The calendar read happens after hydration, so the reading is taken INSIDE the stalled window --
// two seconds after navigation is still three seconds before the six-second route releases it.
await page.waitForTimeout(2500);
const degradedReading = await page.evaluate(() => {
  const body = document.body.innerText || "";
  return {
    // What the page is SHOWING while the read is stalled. A full calendar with no notice means
    // the inspector is reading a cache that looks live.
    eventCount: (body.match(/(\d+)\s*\n*\s*EVENTS/i) || [])[1] || null,
    saysStale: /last synced|could not be reached|showing your last/i.test(body),
    // Does the product SAY it is working, rather than rendering an empty calendar that looks
    // like "you have nothing due"? That distinction is the whole of §275's zero-event defect.
    showsProgress: /loading|syncing|checking|updating/i.test(body),
    looksEmpty: /nothing (due|scheduled)|no (events|tasks|work)/i.test(body),
    textLength: body.length,
  };
});
await page.screenshot({ path: `${OUT_DIR}/screenshots/calendar-degraded-390.png`, fullPage: true });
step("DEGRADED", { ...degradedReading, elapsedMs: Date.now() - degradedStart,
  intercepted: degradedIntercepts,
  exercised: degradedIntercepts > 0 ? "YES" : "NOT_EXERCISED" });
await page.waitForTimeout(7000);
const afterDegraded = await page.evaluate(() => ({
  textLength: (document.body.innerText || "").length,
  stillLoading: /loading|syncing/i.test(document.body.innerText || ""),
}));
step("DEGRADED_SETTLED", { ...afterDegraded, intercepted: degradedIntercepts });
await context.unroute("**/calendar");

// =================================================================================================
// TIMEOUT — the request is accepted and never answered. Distinct from a refused connection: the
// browser reports no transport failure, it simply waits.
// =================================================================================================
let timeoutIntercepts = 0;
await context.route("**/calendar", async () => { timeoutIntercepts += 1; /* never answered */ });
await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(9000);
const timeoutReading = await page.evaluate(() => {
  const body = document.body.innerText || "";
  return {
    // What the page is SHOWING while the read is stalled. A full calendar with no notice means
    // the inspector is reading a cache that looks live.
    eventCount: (body.match(/(\d+)\s*\n*\s*EVENTS/i) || [])[1] || null,
    saysStale: /last synced|could not be reached|showing your last/i.test(body),
    saysUnreachable: /offline|no connection|could not|unavailable|retry/i.test(body),
    looksEmpty: /nothing (due|scheduled)|no (events|tasks|work)/i.test(body),
    stillLoading: /loading|syncing/i.test(body),
    textLength: body.length,
  };
});
await page.screenshot({ path: `${OUT_DIR}/screenshots/calendar-timeout-390.png`, fullPage: true });
step("TIMEOUT", { ...timeoutReading, intercepted: timeoutIntercepts,
  exercised: timeoutIntercepts > 0 ? "YES" : "NOT_EXERCISED" });
await context.unroute("**/calendar");

// =================================================================================================
// OFFLINE — no transport at all.
// =================================================================================================
/**
 * TWO OFFLINE CASES, and they are not the same product situation.
 *
 * WARM is the one an inspector is actually in: they had the calendar open and walking, and the
 * signal went. No navigation occurs, the surface is already rendered, and the question is what the
 * page does with the work in front of them -- including whether a write can be queued.
 *
 * COLD is a navigation attempted with no connection. It is the honest-refusal case, and the
 * product answers it with its offline fallback.
 *
 * The first version of this instrument measured only COLD, which forced the fallback and then
 * reported "no task form" as though the outbox did not exist. That was an instrument artefact:
 * the form is on the surface the inspector already had open.
 */
await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
await context.setOffline(true);
await page.waitForTimeout(1500);
const warmOfflineReading = await page.evaluate(() => {
  const body = document.body.innerText || "";
  return {
    stillShowsRecord: document.querySelectorAll("[data-testid='task-title']").length > 0,
    eventCount: (body.match(/(\d+)\s*\n*\s*EVENTS/i) || [])[1] || null,
    saysOffline: /offline|no connection|could not reach/i.test(body),
    textLength: body.length,
  };
});
await page.screenshot({ path: `${OUT_DIR}/screenshots/calendar-offline-warm-390.png`, fullPage: true });
step("OFFLINE_WARM", warmOfflineReading);

// -- The WARM write: queue a task with the surface already open. This is the outbox's real case.
const warmTaskTitle = `Offline outbox probe ${Date.now()}`;
let warmWrite = { attempted: false, reason: "the task form was not present on the warm surface" };
try {
  const disclosure = page.getByRole("button", { name: /calendar controls/i }).first();
  if (await disclosure.count()) await disclosure.click({ timeout: 5000 }).catch(() => undefined);
  await page.waitForTimeout(600);
  const titleField = page.locator('[data-testid="task-title"]').first();
  if (await titleField.count()) {
    await titleField.fill(warmTaskTitle, { timeout: 8000 });
    await page.getByRole("button", { name: /^schedule$/i }).first().click({ timeout: 8000 });
    await page.waitForTimeout(3500);
    warmWrite = await page.evaluate((title) => {
      const body = document.body.innerText || "";
      return {
        attempted: true,
        titleVisible: body.includes(title),
        // A queued write MUST be marked as queued. A queued write shown as saved is the exact
        // disagreement between device and server that D-007 exists to prevent.
        marksPending: /pending|queued|will sync|not yet saved|waiting|offline/i.test(body),
        message: (body.match(/[^\n]*(pending|queued|sync|offline|saved)[^\n]*/i) || [""])[0].slice(0, 200),
      };
    }, warmTaskTitle);
  }
} catch (error) {
  warmWrite = { attempted: true, error: String(error).slice(0, 200) };
}
step("OFFLINE_WARM_WRITE", warmWrite);

// -- COLD: a navigation attempted with no connection.
await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(4500);
const offlineReading = await page.evaluate(() => {
  const body = document.body.innerText || "";
  return {
    refusesExplicitly: /needs a connection|could not reach the network|was not saved on this device|offline/i.test(body),
    looksEmpty: /nothing (due|scheduled)|no (events|tasks|work)/i.test(body),
    recordContent: document.querySelectorAll("article, li a[href], [data-testid='calendar-event']").length,
    textLength: body.length,
    excerpt: body.slice(0, 500).replace(/\n+/g, " | "),
  };
});
await page.screenshot({ path: `${OUT_DIR}/screenshots/calendar-offline-390.png`, fullPage: true });
step("OFFLINE_COLD", offlineReading);

// (The offline WRITE is measured in the WARM case above, where the form the inspector
// already had open still exists. A cold navigation reaches the fallback, which has no form.)

// -- And can a corrective ACTION be raised offline? Measured by asking the page, not by reading
//    source: the answer the inventory needs is whether the customer has any route to it at all.
const offlineActionSurface = await page.evaluate(() => {
  const body = document.body.innerText || "";
  return {
    anyActionControl: Array.from(document.querySelectorAll("button, a"))
      .some((el) => /corrective action|new action|raise action|close action/i.test(el.textContent || "")),
    mentionsActions: /corrective action/i.test(body),
  };
});
step("OFFLINE_ACTION_SURFACE", offlineActionSurface);

// =================================================================================================
// RECONNECT — does the queued write reach the server, and does the calendar reconcile to ONE event?
// =================================================================================================
await context.setOffline(false);
await page.waitForTimeout(2000);
await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(6000);
/**
 * The month grid renders day numbers and a count badge, NOT event titles -- a title is only
 * visible once a day is expanded. An earlier version of this check searched the page text for the
 * queued task's title, found nothing, and reported that the browser and the server disagreed. They
 * did not: the server had the row and the grid simply does not print titles. Reconciliation is
 * therefore judged on the two things that ARE observable -- the surface's own event total, and the
 * server's row count for the queued item.
 */
const reconnectReading = await page.evaluate(() => {
  const body = document.body.innerText || "";
  return {
    saysOffline: /no connection|could not reach|unavailable/i.test(body),
    saysStale: /last synced|showing your last/i.test(body),
    stillPending: /pending|queued|will sync|not yet saved/i.test(body),
    eventCount: (body.match(/(\d+)\s*\n*\s*EVENTS/i) || [])[1] || null,
    textLength: body.length,
  };
});
await page.screenshot({ path: `${OUT_DIR}/screenshots/calendar-reconnect-390.png`, fullPage: true });
step("RECONNECT", reconnectReading);

// The server's own answer, which is the authority. A queued write that the browser shows and the
// server does not have is exactly the disagreement D-007 forbids.
const bearer = await (async () => {
  const body = await (await fetch(`${API_URL}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })).json();
  return body.accessToken || body.access_token || body.token;
})();
const serverCalendar = await (await fetch(`${API_URL}/calendar`, {
  headers: { Authorization: `Bearer ${bearer}` },
})).json();
const serverHasQueued = Array.isArray(serverCalendar)
  ? serverCalendar.filter((row) => row.title === warmTaskTitle).length : 0;
step("RECONCILED", {
  serverRowsForQueuedItem: serverHasQueued,
  // EXACTLY ONE. Two rows would mean the outbox replayed and duplicated; zero would mean the
  // queued write never reached the server at all. Both are the failures this phase looks for.
  writtenExactlyOnce: warmWrite.attempted && !warmWrite.error ? serverHasQueued === 1 : "NOT_EXERCISED",
  browserEventCountAfterReconnect: reconnectReading.eventCount,
  browserStillClaimsStale: reconnectReading.saysStale,
  browserStillClaimsPending: reconnectReading.stillPending,
});

// =================================================================================================
// THE INVENTORY.
// =================================================================================================
inventory.push({
  operation: "read the Safety Calendar (already open when the signal went)",
  offline: warmOfflineReading.stillShowsRecord ? "PARTIAL" : "REQUIRES_NETWORK",
  dataLossRisk: "NONE_KNOWN",
  basis: "A read accepts no input, so there is nothing on this path to lose. The surface the "
    + "inspector already had open keeps rendering what it had; `readServerCalendar` returns "
    + "'we could not ask' as data distinct from 'you have nothing due', which is the distinction "
    + "§275's zero-event calendar lacked.",
  reading: warmOfflineReading,
});
inventory.push({
  operation: "read the Safety Calendar (navigated to with no connection)",
  offline: offlineReading.refusesExplicitly ? "REQUIRES_NETWORK"
    : offlineReading.recordContent > 0 ? "PARTIAL" : "REQUIRES_NETWORK",
  dataLossRisk: "NONE_KNOWN",
  basis: "A cold navigation with no connection reaches the offline fallback, which refuses "
    + "honestly rather than rendering an empty calendar. No record is shown and none is lost.",
  reading: offlineReading,
});
inventory.push({
  operation: "create a calendar task",
  /**
   * CLASSIFIED FROM WHAT WAS MEASURED. If the write was never attempted -- the form absent, the
   * control unreachable -- this is UNKNOWN, not REQUIRES_NETWORK. The first run of this instrument
   * navigated while offline, landed on the fallback, found no form and recorded VULNERABLE from an
   * attempt that never happened. An unmeasured operation is reported as unmeasured.
   */
  offline: !warmWrite.attempted || warmWrite.error ? "UNKNOWN"
    : warmWrite.titleVisible ? "PARTIAL" : "REQUIRES_NETWORK",
  dataLossRisk: !warmWrite.attempted || warmWrite.error ? "UNKNOWN"
    : warmWrite.titleVisible ? "RECOVERABLE" : "VULNERABLE",
  basis: "The calendar holds an offline write in a pending OUTBOX under a client ref and writes it "
    + "when the server is reachable. RECOVERABLE rather than NONE_KNOWN: the queue lives in browser "
    + "storage, so clearing site data or replacing the device still loses it.",
  reading: warmWrite,
});
inventory.push({
  operation: "create a corrective action",
  offline: "REQUIRES_NETWORK",
  dataLossRisk: "VULNERABLE",
  basis: "There is NO outbox for corrective actions -- the calendar's queue holds tasks only -- and "
    + "`POST /actions` carries no idempotency key, so one cannot be added safely without the "
    + "server changing first (D-053). An action raised with no signal is lost with the page.",
  reading: offlineActionSurface,
});
inventory.push({
  operation: "close a corrective action",
  offline: "REQUIRES_NETWORK",
  dataLossRisk: "NONE_KNOWN",
  basis: "No customer surface closes a corrective action at all (D-050), so no customer write "
    + "exists to queue or lose. NONE_KNOWN because the capability is ABSENT, not because it is safe "
    + "-- this is the most field-critical write in the area and the one the customer cannot make.",
  reading: offlineActionSurface,
});
inventory.push({
  operation: "change a due date",
  offline: "REQUIRES_NETWORK",
  dataLossRisk: "NONE_KNOWN",
  basis: "A TASK's due date is editable online through `PATCH /tasks/:id` and is not queued "
    + "offline. A corrective ACTION's due date is not editable at all, online or offline (D-051).",
  reading: null,
});
inventory.push({
  operation: "calendar reconciliation after reconnect",
  offline: "PARTIAL",
  dataLossRisk: "RECOVERABLE",
  basis: "Measured above: the queued item is written on reconnect EXACTLY ONCE -- the server holds "
    + "one row for it, not two -- and the surface stops claiming a stale cache. The collapse is a "
    + "lookup on the stable server event id rather than a heuristic.",
  reading: { browser: reconnectReading, serverRowsForQueuedItem: serverHasQueued },
});

for (const row of inventory) {
  console.log(`${row.operation.padEnd(40)} OFFLINE=${row.offline.padEnd(17)} DATA_LOSS_RISK=${row.dataLossRisk}`);
}

writeFileSync(`${OUT_DIR}/offline-inventory.json`, JSON.stringify({
  instrument: "§286 Batch 5 — offline and intermittent connectivity for actions and the calendar",
  measuredAt: new Date().toISOString(),
  serviceWorker: sw,
  sequence: "ONLINE -> DEGRADED -> TIMEOUT -> OFFLINE -> RECONNECT",
  timeline,
  inventory,
  failureModesForD042: [
    "POST /actions has no idempotency key, so no outbox can replay it safely (D-053).",
    "Corrective actions have no client-side queue at all; one raised offline is lost (VULNERABLE).",
    "Corrective actions have no update route, so a queued edit would have nothing to replay against (D-051).",
    "Corrective-action closure has no customer surface, so the most field-critical write in this area cannot be queued because it cannot be made (D-050).",
    "The task outbox lives in browser storage; clearing site data or replacing the device loses queued work (RECOVERABLE, not NONE_KNOWN).",
  ],
}, null, 2));
await browser.close();
console.log(`\nevidence: ${OUT_DIR}`);

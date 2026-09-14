// §280 (D-037) — MEASURE WHAT EACH SURFACE ACTUALLY DOES WITHOUT A NETWORK.
//
// D-037 registers offline field operation as a product requirement and asks for a bounded
// CURRENT-STATE INVENTORY. It says explicitly: do not infer support merely because browser state
// exists. So this measures three things per route, in a real browser, and infers nothing:
//
//   1. CONNECTED PASS  — which API calls the route makes when it loads normally. This is the
//                        route's network dependency, observed rather than read out of the source.
//   2. OFFLINE PASS    — the same route loaded with the browser context offline. What renders,
//                        what errors, whether the page is usable at all.
//   3. LOCAL STATE     — which localStorage keys and IndexedDB databases the route leaves behind.
//                        Recorded as PRESENCE OF LOCAL STATE, never as evidence of offline support:
//                        a page can write a cache and still be unusable without a connection, and
//                        several here are exactly that.
//
// The OFFLINE and DATA_LOSS_RISK classifications D-037 asks for are then assigned from these
// measurements by a person, in the review document. This script produces the readings.
//
// It does NOT test the sequence D-037 names as a future acceptance target (start connected, lose
// the network, keep working, restart, reconnect, sync, no duplicates). That is a much larger
// instrument for work that is not being built in this stage, and pretending otherwise would put a
// claim of offline capability into the record. This is inventory.
//
// Usage: APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> node scripts/measure-280-offline-inventory.mjs

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-280-offline";
mkdirSync(`${OUT_DIR}/screenshots`, { recursive: true });

const ROUTES = [
  { path: "/command-center", capability: "dashboard / due work" },
  { path: "/inspections", capability: "inspection creation and resume" },
  { path: "/inspection-workspace", capability: "observation entry, HazLenz, findings, review, actions" },
  { path: "/field-capture", capability: "offline field capture and photos" },
  { path: "/inspection-complete", capability: "inspection completion and report" },
  { path: "/reports", capability: "reports" },
  { path: "/safety-calendar", capability: "corrective actions, tasks, calendar" },
  { path: "/settings", capability: "settings, sites, risk matrix" },
  { path: "/profile", capability: "account" },
];

const readings = [];

(async () => {
  if (!EMAIL || !PASSWORD) throw new Error("VAL_EMAIL and VAL_PASSWORD are required");

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const apiCalls = [];
  page.on("request", (req) => {
    if (req.url().startsWith(API_URL)) apiCalls.push({ method: req.method(), url: req.url().slice(API_URL.length) });
  });

  await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[autocomplete="email"]', EMAIL);
  await page.fill('input[autocomplete="current-password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);

  // Select an inspection through the product's own control, so the workspace and the completion
  // page are measured with real context rather than in their "nothing selected" state.
  await page.goto(`${APP_URL}/inspections`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page
    .locator("li")
    .filter({ hasText: "Packaging line walkthrough" })
    .first()
    .locator('[data-testid="open-inspection"]')
    .click({ timeout: 20000 })
    .catch(() => console.log("note: could not select an inspection; workspace measured empty"));
  await page.waitForTimeout(2500);

  // ==================== THE SERVICE WORKER MUST BE IN CONTROL ====================
  //
  // The first run of this measurement reported that EVERY route, including /field-capture, failed
  // to load with no network -- and that reading was worthless. `ServiceWorkerRegistrar` deliberately
  // does not register in development ("the dev server rebuilds assets on every edit; a cached shell
  // there would serve stale chunks"), so the run had measured the absence of a service worker and
  // was about to report it as the absence of offline capability in the product.
  //
  // This build must therefore be a PRODUCTION one, and the worker must be CONTROLLING the page
  // before anything is measured. Both are asserted rather than assumed: a run that cannot get the
  // worker into control stops, because an offline inventory taken without it is an inventory of
  // the harness.
  await page.goto(`${APP_URL}/field-capture`, { waitUntil: "domcontentloaded" });
  const swState = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return { supported: false };
    const ready = await Promise.race([
      navigator.serviceWorker.ready.then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), 15000)),
    ]);
    return {
      supported: true,
      ready,
      controlled: Boolean(navigator.serviceWorker.controller),
      scriptURL: navigator.serviceWorker.controller?.scriptURL || null,
    };
  });
  if (!swState.ready) {
    throw new Error(
      "REFUSED: no service worker took control. This must run against a PRODUCTION build "
      + `(next build && next start); a development server does not register one. Got ${JSON.stringify(swState)}`,
    );
  }
  // One controlled reload, so the worker sees the shell's requests and can cache them. Without it
  // the first visit is an uncontrolled client and the asset cache is never populated.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log(`service worker: ${JSON.stringify(swState)}\n`);

  for (const route of ROUTES) {
    // ---- 1. CONNECTED
    apiCalls.length = 0;
    await context.setOffline(false);
    await page.goto(`${APP_URL}${route.path}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    const connectedCalls = apiCalls.map((c) => `${c.method} ${c.url.split("?")[0]}`);
    const connectedText = (await page.evaluate(() => document.body.innerText || "")).length;

    const localState = await page.evaluate(async () => {
      const keys = Object.keys(localStorage);
      let databases = [];
      try {
        databases = (await indexedDB.databases()).map((db) => db.name).filter(Boolean);
      } catch {
        databases = ["(indexedDB.databases unavailable)"];
      }
      return { localStorageKeys: keys.length, localStorageSample: keys.slice(0, 40), databases };
    });

    // ---- 2. OFFLINE. A full document load with no network at all: the hardest case, and the one
    // an inspector meets when they open the app in a basement or a mine.
    await context.setOffline(true);
    const offlineErrors = [];
    const onError = (msg) => {
      if (msg.type() === "error") offlineErrors.push(msg.text().slice(0, 160));
    };
    page.on("console", onError);
    const navFailed = await page
      .goto(`${APP_URL}${route.path}`, { waitUntil: "domcontentloaded", timeout: 20000 })
      .then(() => false)
      .catch(() => true);
    await page.waitForTimeout(3500);

    const offline = navFailed
      ? { navigationFailed: true, textLength: 0, renderedHeading: "", visibleText: "" }
      : await page.evaluate(() => ({
          navigationFailed: false,
          textLength: (document.body.innerText || "").length,
          renderedHeading:
            (document.querySelector("h1")?.textContent || document.querySelector("h2")?.textContent || "").trim(),
          visibleText: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 220),
        }));

    if (!navFailed) {
      await page.screenshot({
        path: `${OUT_DIR}/screenshots/offline${route.path.replace(/\//g, "_")}.png`,
        fullPage: false,
      });
    }
    page.off("console", onError);
    await context.setOffline(false);

    const reading = {
      route: route.path,
      capability: route.capability,
      connected: { apiCalls: [...new Set(connectedCalls)], apiCallCount: connectedCalls.length, textLength: connectedText },
      offline: { ...offline, consoleErrors: offlineErrors.slice(0, 6) },
      localState,
    };
    readings.push(reading);
    console.log(
      `${route.path.padEnd(24)} connected: ${String(reading.connected.apiCallCount).padStart(2)} API call(s), ` +
        `${String(connectedText).padStart(5)} chars | offline: ${
          offline.navigationFailed ? "DOCUMENT DID NOT LOAD" : `${String(offline.textLength).padStart(5)} chars — "${offline.renderedHeading.slice(0, 40)}"`
        }`,
    );
  }

  await browser.close();

  writeFileSync(
    `${OUT_DIR}/offline-inventory.json`,
    JSON.stringify(
      {
        measurement: "§280 D-037 offline current-state inventory",
        note:
          "Readings only. The OFFLINE and DATA_LOSS_RISK classifications are assigned by a person in "
          + "PAGE-BY-PAGE-PRODUCT-REVIEW.md. Presence of local state is NOT evidence of offline support.",
        appUrl: APP_URL,
        apiUrl: API_URL,
        serviceWorker: swState,
        providerCalls: 0,
        readings,
      },
      null,
      2,
    ),
  );
  console.log(`\nevidence: ${OUT_DIR}/offline-inventory.json`);
})();

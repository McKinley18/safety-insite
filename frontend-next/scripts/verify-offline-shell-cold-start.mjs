#!/usr/bin/env node
/**
 * V1-OFFLINE-ASSETCACHE-01 -- the offline application shell must be carried by Cache Storage the
 * application controls, not by the browser's own HTTP cache.
 *
 * WHAT WAS ACTUALLY WRONG, measured rather than assumed.
 *
 * Blueprint 81.12.1 recorded `insite-shell-v1-assets` as absent on production and attributed it to
 * Vercel serving `/_next/static/**` as `immutable`, "so those requests never reach the service
 * worker's fetch handler". That attribution is wrong. Measured against production on 2026-08-27:
 * the SECOND load populates the asset cache with all thirteen `?dpl=`-suffixed build assets, so
 * the worker's fetch handler does intercept them.
 *
 * The real defect is an ORDERING gap on the FIRST visit. ServiceWorkerRegistrar registers on the
 * window `load` event, which is after the first document has already requested every one of its
 * build assets. Those requests are issued by an UNCONTROLLED client, so they never reach the fetch
 * handler and the asset cache is never created. A user who opens InSite once and then walks out of
 * coverage had an offline reopen carried entirely by the browser's HTTP cache -- which is evictable
 * independently of Cache Storage, and is therefore not a guarantee the product can make.
 *
 * The repair precaches the shell document's own build assets at INSTALL time.
 *
 * This script proves the chain the repair is supposed to deliver, on a FIRST visit only:
 *
 *   ONLINE LOAD -> SERVICE WORKER CONTROL -> ASSET CACHE POPULATED -> HTTP CACHE CLEARED AND
 *   DISABLED -> OFFLINE -> SHELL OPENS -> LOCAL DRAFT OPENS -> OBSERVATION RECORDED -> RECONNECT
 *   -> EXACTLY-ONCE SYNC
 *
 * "HTTP CACHE NOT RELIED UPON" is not asserted by reasoning. The browser's HTTP cache is CLEARED
 * and then DISABLED through CDP before the network is severed, so anything the page still loads
 * can only have come from Cache Storage.
 *
 * A control leg re-runs the first-visit measurement against the PRE-REPAIR worker to prove the gap
 * was real and that this suite can actually see it.
 *
 *   APP_URL=http://127.0.0.1:3300 \
 *   API_BASE_URL=http://127.0.0.1:4300 \
 *   DATABASE_URL=postgresql://.../test_..._offline \
 *   node scripts/verify-offline-shell-cold-start.mjs
 */

import { chromium } from "playwright";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP = process.env.APP_URL || "http://127.0.0.1:3300";
const API = process.env.API_BASE_URL || "http://127.0.0.1:4300";
const DB_URL = process.env.DATABASE_URL || "";
/**
 * `full` (default) runs the whole chain. `first-visit-only` measures ONLY what a first visit
 * leaves in Cache Storage and prints it, so the caller can run it twice -- once with the shipped
 * worker deployed as /sw.js and once with the pre-repair worker deployed as /sw.js -- and compare.
 * The control MUST be a real first visit against a real /sw.js: registering a different script
 * programmatically after the document has loaded lets that worker claim the live client, which
 * then populates the asset cache through the runtime path and hides the very gap being measured.
 */
const MODE = process.env.COLD_START_MODE || "full";
const EXPECT_ASSET_CACHE = process.env.EXPECT_ASSET_CACHE !== "false";

const databaseName = DB_URL ? new URL(DB_URL).pathname.replace(/^\//, "") : "";
if (!/^test_/.test(databaseName)) {
  console.error(
    `REFUSING: DATABASE_URL must point at a disposable test_* database. Resolved: "${databaseName || "(none)"}".`,
  );
  process.exit(2);
}

const VIEWPORT = { width: 390, height: 844 };
const LOGIN_WINDOW_MS = 62_000;

let passes = 0;
let failures = 0;

function assert(condition, label, details) {
  if (condition) {
    passes += 1;
    console.log(`PASS ${label}`);
    return true;
  }
  failures += 1;
  console.error(`FAIL ${label}`);
  if (details !== undefined) console.error(`     ${details}`);
  return false;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stamp = Date.now();
const USER = {
  name: "Cold Start User",
  email: `coldstart-${stamp}@example.test`,
  password: "ColdStart1!",
};

async function api(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body };
}

async function login(user, attempt = 0) {
  const session = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: user.email, password: user.password }),
  });
  if (session.status === 429 && attempt < 3) {
    console.log(`     (auth rate limit hit; waiting ${LOGIN_WINDOW_MS / 1000}s)`);
    await sleep(LOGIN_WINDOW_MS);
    return login(user, attempt + 1);
  }
  if (session.status >= 400) throw new Error(`login -> ${session.status} ${JSON.stringify(session.body)}`);
  return session.body;
}

async function serverInspections(token) {
  const response = await fetch(`${API}/inspections`, { headers: { Authorization: `Bearer ${token}` } });
  return response.ok ? response.json() : [];
}

async function signIn(page, user, attempt = 0) {
  await page.goto(`${APP}/login`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("you@example.com").fill(user.email);
  await page.getByPlaceholder("Enter your password").fill(user.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 });
  } catch (error) {
    if (attempt >= 3) throw error;
    console.log(`     (UI sign-in did not complete; waiting ${LOGIN_WINDOW_MS / 1000}s)`);
    await sleep(LOGIN_WINDOW_MS);
    return signIn(page, user, attempt + 1);
  }
}

const ABORT_EVERYTHING = "**/*";
async function goOffline(context) {
  await context.route(ABORT_EVERYTHING, (route) => route.abort("internetdisconnected"));
  await context.setOffline(true);
}
async function goOnline(context) {
  await context.unroute(ABORT_EVERYTHING);
  await context.setOffline(false);
}

async function waitForController(page) {
  await page
    .waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller !== null, null, { timeout: 30000 })
    .catch(() => {});
}

/** Everything currently held in Cache Storage, by cache name. */
async function readCaches(page) {
  return page.evaluate(async () => {
    const names = await caches.keys();
    const byName = {};
    for (const name of names) {
      const cache = await caches.open(name);
      byName[name] = (await cache.keys()).map((request) => request.url);
    }
    return { names, byName };
  });
}

/** The build assets the served shell document actually references. */
async function shellDocumentAssets() {
  const response = await fetch(`${APP}/field-capture`);
  const html = await response.text();
  const matches = html.match(/\/_next\/static\/[^"'`\s<>\\]+?\.(?:js|css)(?:\?[^"'`\s<>\\]*)?/g) || [];
  return Array.from(new Set(matches.map((url) => url.replace(/&amp;/g, "&"))));
}

async function waitForIdle(page) {
  await page
    .waitForFunction(() => document.querySelectorAll("button[disabled]").length === 0, null, { timeout: 30000 })
    .catch(() => {});
}

/** Measures what one genuine FIRST visit leaves in Cache Storage. */
async function measureFirstVisit({ label }) {
  const profileDir = mkdtempSync(join(tmpdir(), `insite-coldstart-${label}-`));
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    viewport: VIEWPORT,
    serviceWorkers: "allow",
  });
  try {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(`${APP}/field-capture`, { waitUntil: "load" });
    await waitForController(page);
    // Installation precaching is asynchronous; give it room to finish without polling the result.
    await sleep(6000);
    const snapshot = await readCaches(page);
    return { snapshot, context, page, profileDir };
  } catch (error) {
    await context.close().catch(() => {});
    rmSync(profileDir, { recursive: true, force: true });
    throw error;
  }
}

let mainContext = null;
let mainProfile = null;

try {
  const registered = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: USER.name, email: USER.email, password: USER.password, type: "individual" }),
  });
  if (registered.status >= 400) throw new Error(`register -> ${registered.status} ${JSON.stringify(registered.body)}`);
  const session = await login(USER);
  const token = session.accessToken || session.access_token || session.token;

  const referencedAssets = await shellDocumentAssets();
  assert(referencedAssets.length > 0, `the served shell document references build assets (${referencedAssets.length})`);

  // =========================================================================
  // 1. FIRST visit under whichever worker is deployed as /sw.js
  // =========================================================================
  const first = await measureFirstVisit({ label: MODE });
  mainContext = first.context;
  mainProfile = first.profileDir;
  const page = first.page;
  const context = first.context;

  const hasAssetCache = first.snapshot.names.includes("insite-shell-v1-assets");
  if (EXPECT_ASSET_CACHE) {
    assert(hasAssetCache, "1. a FIRST online visit creates the application-controlled asset cache", JSON.stringify(first.snapshot.names));

    const cachedAssetPaths = (first.snapshot.byName["insite-shell-v1-assets"] || []).map((url) => new URL(url).pathname);
    const missing = referencedAssets.filter((asset) => !cachedAssetPaths.includes(asset.split("?")[0]));
    assert(
      missing.length === 0,
      `1. a FIRST online visit precaches EVERY build asset the shell references (${cachedAssetPaths.length} cached, ${referencedAssets.length} referenced)`,
      JSON.stringify(missing),
    );
  } else {
    assert(
      !hasAssetCache,
      "1. CONTROL: with the pre-repair worker deployed as /sw.js, a FIRST visit leaves the asset cache ABSENT — the gap is real",
      JSON.stringify(first.snapshot.names),
    );
  }

  const apiOriginPort = new URL(API).port;
  const anyApiEntry = Object.values(first.snapshot.byName)
    .flat()
    .filter((url) => url.includes(`:${apiOriginPort}`));
  assert(
    anyApiEntry.length === 0,
    "1. no API-origin response entered any shared cache during precaching",
    JSON.stringify(anyApiEntry),
  );

  if (MODE !== "full") {
    console.log(JSON.stringify({ mode: MODE, cacheNames: first.snapshot.names }));
  } else {
  // =========================================================================
  // 2. Sign in, then take the HTTP cache away entirely
  // =========================================================================
  await signIn(page, USER);
  await page.goto(`${APP}/field-capture`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="field-capture-status"]', { timeout: 30000 });
  await waitForController(page);

  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.clearBrowserCache");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  assert(true, "2. the browser HTTP cache is CLEARED and DISABLED — anything served now comes from Cache Storage");

  // =========================================================================
  // 3. Offline: the shell must still open
  // =========================================================================
  await goOffline(context);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="field-capture-status"]', { timeout: 30000 }).catch(() => {});

  const shellOpened = await page.evaluate(() => !!document.querySelector('[data-testid="field-capture-status"]'));
  assert(shellOpened, "3. the shell opens OFFLINE with the HTTP cache cleared and disabled");

  const hydrated = await page.evaluate(() => {
    const status = document.querySelector('[data-testid="field-capture-status"]');
    // A shell that only served HTML would render no interactive control; a hydrated shell does.
    return { status: !!status, interactive: !!document.querySelector('[data-testid="create-draft"]') };
  });
  assert(
    hydrated.interactive,
    "3. the shell HYDRATED offline — its JavaScript came from Cache Storage, not the HTTP cache",
    JSON.stringify(hydrated),
  );

  assert(
    (await page.getByTestId("connectivity").getAttribute("data-online")) === "false",
    "3. the page reports Offline while the network is unreachable",
  );

  // =========================================================================
  // 4. The offline workflow itself still works from that cold shell
  // =========================================================================
  const TITLE = "Cold start draft";
  const OBSERVATION = "Tail pulley guard removed while the conveyor was still running during cleanup.";
  await waitForIdle(page);
  await page.getByLabel("Draft title").fill(TITLE);
  await page.getByLabel("Site or area").fill("Cold Start Plant");
  await page.getByLabel("Regulatory context").selectOption("msha");
  await page.getByTestId("create-draft").click();
  await page.waitForSelector('[data-testid="observation-input"]', { timeout: 30000 });
  assert(true, "4. a draft is created offline from the cold-started shell");

  await waitForIdle(page);
  await page.getByTestId("observation-input").fill(OBSERVATION);
  await page.getByTestId("location-input").fill("Conveyor CV-2, tail end");
  await page.getByTestId("save-observation").click();
  await page.waitForFunction(
    (expected) => document.body.innerText.includes(expected),
    OBSERVATION.slice(0, 40),
    { timeout: 30000 },
  );
  assert(true, "4. an observation is recorded offline from the cold-started shell");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="field-capture-status"]', { timeout: 30000 });
  assert(
    (await page.content()).includes(TITLE),
    "4. the draft survives a second offline reload with no HTTP cache at all",
  );

  // =========================================================================
  // 5. Reconnect and synchronise exactly once
  // =========================================================================
  const before = await serverInspections(token);
  await goOnline(context);
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: false });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="field-capture-status"]', { timeout: 30000 });
  await page.locator('[data-testid="draft-list"] li', { hasText: TITLE }).first().getByRole("button", { name: "Open" }).click();
  await page.waitForSelector('[data-testid="observation-list"]', { timeout: 30000 });
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await page
    .waitForFunction(
      () => document.querySelector("[data-sync-state]")?.getAttribute("data-sync-state") === "SYNCED",
      null,
      { timeout: 90000 },
    )
    .catch(() => {});
  const badge = await page.locator("[data-sync-state]").first().getAttribute("data-sync-state");
  assert(badge === "SYNCED", "5. the draft reports SYNCED after reconnecting", badge);

  const after = await serverInspections(token);
  assert(
    after.length === before.length + 1,
    `5. exactly one server inspection was produced (${before.length} -> ${after.length})`,
  );

  // Re-syncing must not create a second one -- the identity contract from blueprint 81.
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click().catch(() => {});
  await sleep(6000);
  const afterAgain = await serverInspections(token);
  assert(
    afterAgain.length === after.length,
    `5. re-synchronising produced NO duplicate (${after.length} -> ${afterAgain.length})`,
  );

  const finalCaches = await readCaches(page);
  const apiLeak = Object.values(finalCaches.byName).flat().filter((url) => url.includes(`:${apiOriginPort}`));
  assert(apiLeak.length === 0, "5. no authenticated API response was ever written into a shared cache", JSON.stringify(apiLeak));
  assert(
    finalCaches.names.every((name) => name.startsWith("insite-shell-")),
    "5. only the versioned InSite shell caches exist",
    JSON.stringify(finalCaches.names),
  );
  }

} catch (error) {
  failures += 1;
  console.error("FAIL harness", error?.stack || error);
} finally {
  if (mainContext) await mainContext.close().catch(() => {});
  if (mainProfile) rmSync(mainProfile, { recursive: true, force: true });
}

console.log(JSON.stringify({ passed: failures === 0, passes, failures }));
process.exit(failures === 0 ? 0 : 1);

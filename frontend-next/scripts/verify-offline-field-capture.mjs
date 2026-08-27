#!/usr/bin/env node
/**
 * V1-OFFLINE-CAPTURE-01 -- durable offline field capture, measured in a real browser.
 *
 * This is the browser half of the offline contract. The deterministic, server-free half is
 * scripts/check-offline-field-capture.mjs; this script proves the behaviours that only a real
 * browser can demonstrate: service-worker shell caching, IndexedDB survival across an application
 * restart, per-account isolation of on-device data, and non-duplicating synchronisation.
 *
 * It uses a PERSISTENT browser profile on purpose. A normal Playwright context is discarded on
 * close, so "close the app and reopen it offline" could not be distinguished from "reload".
 *
 * Requires a DISPOSABLE stack. It refuses to run against anything but a test database.
 *
 *   APP_URL=http://127.0.0.1:3300 \
 *   API_BASE_URL=http://127.0.0.1:4300 \
 *   DATABASE_URL=postgresql://.../test_insite_v1_offline_20260826 \
 *   node scripts/verify-offline-field-capture.mjs
 */

import { chromium } from "playwright";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pg from "pg";
import { deflateSync } from "node:zlib";

const zlibSync = (buffer) => deflateSync(buffer, { level: 9 });

const APP = process.env.APP_URL || "http://127.0.0.1:3300";
const API = process.env.API_BASE_URL || "http://127.0.0.1:4300";
const DB_URL = process.env.DATABASE_URL || "";

const databaseName = DB_URL ? new URL(DB_URL).pathname.replace(/^\//, "") : "";
if (!/^test_/.test(databaseName)) {
  console.error(
    `REFUSING: DATABASE_URL must point at a disposable test_* database. Resolved: "${databaseName || "(none)"}".`,
  );
  process.exit(2);
}

const VIEWPORT = { width: 390, height: 844 };

let passes = 0;
let failures = 0;
const results = [];

function assert(condition, label, details) {
  if (condition) {
    passes += 1;
    results.push({ label, ok: true });
    console.log(`PASS ${label}`);
    return true;
  }
  failures += 1;
  results.push({ label, ok: false, details: details === undefined ? null : String(details) });
  console.error(`FAIL ${label}`);
  if (details !== undefined) console.error(`     ${details}`);
  return false;
}

const stamp = Date.now();
const USER_A = {
  name: "Offline User A",
  email: `offline-a-${stamp}@example.test`,
  password: "OfflineCapture1!",
};
const USER_B = {
  name: "Offline User B",
  email: `offline-b-${stamp}@example.test`,
  password: "OfflineCapture2!",
};

async function api(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function register(user) {
  const created = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: user.name, email: user.email, password: user.password, type: "individual" }),
  });
  if (created.status >= 400) {
    throw new Error(`register ${user.email} -> ${created.status} ${JSON.stringify(created.body)}`);
  }
  return created.body;
}

/**
 * POST /auth/login is throttled to 5 requests per 60s per IP (auth.controller.ts). This suite
 * signs in repeatedly on purpose -- account switching IS the isolation test -- so it waits the
 * window out rather than reporting a rate limit as an authorisation defect. Blueprint 79.10
 * recorded the same effect biting an entitlement suite.
 */
const LOGIN_WINDOW_MS = 62_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  if (session.status >= 400) {
    throw new Error(`login ${user.email} -> ${session.status} ${JSON.stringify(session.body)}`);
  }
  return session.body;
}

async function serverInspections(token) {
  const response = await fetch(`${API}/inspections`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.ok ? response.json() : [];
}

async function serverInspection(token, id) {
  const response = await fetch(`${API}/inspections/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.ok ? response.json() : null;
}

// ---------------------------------------------------------------------------
// Browser helpers
// ---------------------------------------------------------------------------

const profileDir = mkdtempSync(join(tmpdir(), "insite-offline-profile-"));

async function launch() {
  return chromium.launchPersistentContext(profileDir, {
    headless: true,
    viewport: VIEWPORT,
    serviceWorkers: "allow",
  });
}

/**
 * True offline, for the page AND for the service worker.
 *
 * context.setOffline() alone is not sufficient here. It reliably severs page-originated requests,
 * but after a persistent context is CLOSED AND REOPENED the service-worker target does not pick
 * the emulation up, so the worker's own fetch() still reaches the server. Measured: with
 * setOffline() alone, a reopened session's navigation to an unknown path returned the live Next.js
 * 404 from the server rather than the cached offline document -- which would have made the
 * "reopens with no network" assertion pass without the network ever being down.
 *
 * Aborting at the route layer covers service-worker requests too (verified: 14 intercepted
 * requests on a reopened session), so the two together are what "offline" means in this suite.
 */
const ABORT_EVERYTHING = "**/*";

async function goOffline(context) {
  await context.route(ABORT_EVERYTHING, (route) => route.abort("internetdisconnected"));
  await context.setOffline(true);
}

async function goOnline(context) {
  await context.unroute(ABORT_EVERYTHING);
  await context.setOffline(false);
}

async function firstPage(context) {
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize(VIEWPORT);
  return page;
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
    console.log(`     (UI sign-in did not complete; waiting ${LOGIN_WINDOW_MS / 1000}s for the auth window)`);
    await sleep(LOGIN_WINDOW_MS);
    return signIn(page, user, attempt + 1);
  }
}

async function signOut(page) {
  await page.goto(`${APP}/command-center`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await page.waitForURL((url) => url.pathname === "/login", { timeout: 30000 });
}

async function waitForServiceWorker(page) {
  await page.waitForFunction(
    () => navigator.serviceWorker && navigator.serviceWorker.controller !== null,
    null,
    { timeout: 30000 },
  ).catch(() => {});
  return page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return {
      registrations: registrations.length,
      controlled: !!navigator.serviceWorker.controller,
      scripts: registrations.map((registration) => registration.active?.scriptURL || ""),
    };
  });
}

async function openFieldCapture(page) {
  await page.goto(`${APP}/field-capture`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="field-capture-status"]', { timeout: 30000 });
}

/** Waits for the page to stop being busy, which the create control mirrors via `disabled`. */
async function waitForIdle(page) {
  await page
    .waitForFunction(
      () => {
        const disabled = Array.from(document.querySelectorAll("button[disabled]"));
        return disabled.length === 0;
      },
      null,
      { timeout: 30000 },
    )
    .catch(() => {});
}

async function createDraft(page, { title, site }) {
  await waitForIdle(page);
  await page.getByLabel("Draft title").fill(title);
  await page.getByLabel("Site or area").fill(site);
  await page.getByLabel("Regulatory context").selectOption("msha");
  await page.getByTestId("create-draft").click();
  await page.waitForSelector('[data-testid="observation-input"]', { timeout: 30000 });
}

async function recordObservation(page, { text, location }) {
  await waitForIdle(page);
  await page.getByTestId("observation-input").fill(text);
  await page.getByTestId("location-input").fill(location);
  await page.getByTestId("save-observation").click();
  await page.waitForFunction(
    (expected) => document.body.innerText.includes(expected),
    text.slice(0, 40),
    { timeout: 30000 },
  );
}

async function listedDraftTitles(page) {
  return page.evaluate(() => {
    const list = document.querySelector('[data-testid="draft-list"]');
    if (!list) return [];
    return Array.from(list.querySelectorAll("li")).map((item) => item.querySelector("p")?.textContent?.trim() || "");
  });
}

/**
 * A genuine, decodable PNG. The server validates raster magic bytes (validateRasterImage), so a
 * fabricated buffer would prove nothing about the upload path.
 */
function makePng(widthPx, heightPx) {
  const chunks = [];
  const crcTable = (() => {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    return table;
  })();
  const crc32 = (buffer) => {
    let c = 0xffffffff;
    for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typed = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typed));
    return Buffer.concat([length, typed, crc]);
  };

  chunks.push(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(widthPx, 0);
  ihdr.writeUInt32BE(heightPx, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  chunks.push(chunk("IHDR", ihdr));

  const raw = Buffer.alloc(heightPx * (1 + widthPx * 3));
  for (let y = 0; y < heightPx; y++) {
    const rowStart = y * (1 + widthPx * 3);
    raw[rowStart] = 0;
    for (let x = 0; x < widthPx; x++) {
      const p = rowStart + 1 + x * 3;
      raw[p] = (x * 7) % 256;
      raw[p + 1] = (y * 5) % 256;
      raw[p + 2] = 128;
    }
  }
  chunks.push(chunk("IDAT", zlibSync(raw)));
  chunks.push(chunk("IEND", Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

/** Polls a Node-side predicate. Used where the signal is a request that fired, not page state. */
async function waitFor(predicate, label, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return true;
    await sleep(250);
  }
  console.error(`     (timed out waiting for ${label})`);
  return false;
}

/** The draft's sync-state badge, which is the UI's own statement of what the server acknowledged. */
async function syncBadge(page) {
  return page.locator("[data-sync-state]").first().getAttribute("data-sync-state");
}

async function waitForSyncState(page, states) {
  await page
    .waitForFunction(
      (expected) => {
        const badge = document.querySelector("[data-sync-state]");
        return badge && expected.includes(badge.getAttribute("data-sync-state"));
      },
      states,
      { timeout: 60000 },
    )
    .catch(() => {});
}

async function horizontalOverflow(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

// ---------------------------------------------------------------------------

const client = new pg.Client({ connectionString: DB_URL });
let context;
let page;

try {
  await client.connect();

  console.log(`# database  ${databaseName}`);
  console.log(`# app       ${APP}`);
  console.log(`# api       ${API}\n`);

  const createdA = await register(USER_A);
  const createdB = await register(USER_B);
  const sessionA = await login(USER_A);
  const sessionB = await login(USER_B);
  const tokenA = sessionA.token;
  const tokenB = sessionB.token;
  const userIdA = createdA?.user?.id || sessionA?.user?.id;
  const userIdB = createdB?.user?.id || sessionB?.user?.id;

  assert(!!tokenA && !!tokenB, "two disposable accounts registered and signed in");

  context = await launch();
  page = await firstPage(context);

  // -------------------------------------------------------------------------
  // Shell: the service worker must install and take control while online.
  // -------------------------------------------------------------------------
  await signIn(page, USER_A);
  await openFieldCapture(page);
  // Re-load once: a worker that installs on the first visit only controls the page from the next
  // navigation onwards, which is the state a returning field user is actually in.
  await page.reload({ waitUntil: "domcontentloaded" });
  const swState = await waitForServiceWorker(page);
  assert(swState.registrations >= 1, "service worker registered", JSON.stringify(swState));
  assert(swState.controlled, "page is controlled by the service worker", JSON.stringify(swState));
  assert(
    swState.scripts.some((script) => script.endsWith("/sw.js")),
    "the controlling worker is the InSite shell worker",
    JSON.stringify(swState.scripts),
  );

  const idbAvailable = await page.evaluate(() => !!window.indexedDB && !!window.crypto?.subtle);
  assert(idbAvailable, "IndexedDB and WebCrypto are available for the offline store");

  // -------------------------------------------------------------------------
  // A. Offline creation survives a refresh
  // -------------------------------------------------------------------------
  await goOffline(context);
  await openFieldCapture(page);

  const OBS_A1 = "Guard missing from the north conveyor drive pulley; nip point exposed at waist height.";
  await createDraft(page, { title: "Offline draft A1", site: "North Plant" });
  await recordObservation(page, { text: OBS_A1, location: "North conveyor, drive end" });

  assert(
    (await page.getByTestId("connectivity").getAttribute("data-online")) === "false",
    "A. the page reports Offline while the network is unreachable",
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="field-capture-status"]', { timeout: 30000 });
  const survivedRefresh = (await page.content()).includes("Offline draft A1");
  assert(survivedRefresh, "A. the app shell reloads offline and the draft list is restored");

  await page.locator('[data-testid="draft-list"] li').first().getByRole("button", { name: "Open" }).click();
  await page.waitForSelector('[data-testid="observation-list"]', { timeout: 30000 });
  assert(
    (await page.locator('[data-testid="observation-list"]').innerText()).includes(OBS_A1.slice(0, 40)),
    "A. observation text survives an offline refresh",
  );
  assert(
    (await page.locator('[data-testid="observation-list"]').innerText()).includes("North conveyor, drive end"),
    "A. location survives an offline refresh",
  );

  const overflowOffline = await horizontalOverflow(page);
  assert(overflowOffline <= 0, `L. no horizontal overflow at 390px offline (measured ${overflowOffline}px)`);

  // -------------------------------------------------------------------------
  // Phase 5. Offline photo evidence
  // -------------------------------------------------------------------------
  const photoBytes = makePng(640, 480);
  await page.getByTestId("photo-input").setInputFiles({
    name: "north-conveyor.png",
    mimeType: "image/png",
    buffer: photoBytes,
  });
  await page.waitForSelector('[data-testid="photo-list"]', { timeout: 30000 });
  // innerText reflects CSS text-transform, and these status labels are rendered uppercase.
  assert(
    /on this device/i.test(await page.locator('[data-testid="photo-list"]').innerText()),
    "5. a photo captured offline is stored on the device and reported as not uploaded",
    await page.locator('[data-testid="photo-list"]').innerText(),
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="field-capture-status"]', { timeout: 30000 });
  await page.locator('[data-testid="draft-list"] li', { hasText: "Offline draft A1" })
    .first()
    .getByRole("button", { name: "Open" })
    .click();
  await page.waitForSelector('[data-testid="photo-list"]', { timeout: 30000 });
  const photoSurvived = await page.evaluate(() => {
    const image = document.querySelector('[data-testid="photo-list"] img');
    return { present: !!image, rendered: image ? image.naturalWidth : 0 };
  });
  assert(photoSurvived.present, "5. the photo survives an offline refresh");
  assert(
    photoSurvived.rendered === 640,
    `5. the stored photo bytes are intact and decodable offline (naturalWidth ${photoSurvived.rendered})`,
  );

  // The HazLenz boundary, on the surface the customer is looking at.
  assert(
    (await page.getByTestId("sync-draft").textContent())?.includes("needs a connection"),
    "8. the sync control states that a connection is required while offline",
  );
  assert(
    await page.getByTestId("sync-draft").isDisabled(),
    "8. the sync control is disabled while offline rather than failing silently",
  );
  assert(
    (await page.content()).includes("run on Safety InSite&#x27;s servers and need a connection") ||
      (await page.locator("body").innerText()).includes("run on Safety InSite's servers and need a connection"),
    "8. the page states that HazLenz analysis and reports require a connection",
  );

  // -------------------------------------------------------------------------
  // B. Application close and reopen, still offline
  // -------------------------------------------------------------------------
  await context.close();
  context = await launch();
  page = await firstPage(context);
  await goOffline(context);

  let reopenedOffline = true;
  try {
    await page.goto(`${APP}/field-capture`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector('[data-testid="field-capture-status"]', { timeout: 30000 });
  } catch (error) {
    reopenedOffline = false;
    assert(false, "B. field capture reopens after an application restart with no network", error.message);
  }

  if (reopenedOffline) {
    assert(true, "B. field capture reopens after an application restart with no network");
    const restored = await page.content();
    assert(restored.includes("Offline draft A1"), "B. the draft survives closing and reopening the application");
  }

  // A route the shell does not cover must fall back to the static offline document rather than
  // failing with the browser's network-error page.
  //
  // The probe path is one the browser has provably never fetched. A route InSite itself links to
  // (/settings, say) can already sit in Chromium's own HTTP cache -- `next start` serves
  // prerendered documents with `Cache-Control: s-maxage=31536000` and no `no-store`, and the App
  // Router prefetches links -- in which case the browser answers it offline without the service
  // worker ever seeing the request. That is harmless (the document is an account-independent
  // shell) but it is the browser's behaviour, not this worker's, so it is not what gets asserted.
  const fallbackPage = await context.newPage();
  await fallbackPage.setViewportSize(VIEWPORT);
  let fallbackText = "";
  try {
    await fallbackPage.goto(`${APP}/never-visited-offline-probe-${stamp}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    fallbackText = await fallbackPage.locator("body").innerText();
  } catch (error) {
    fallbackText = `navigation failed: ${error.message}`;
  }
  assert(
    /This page needs a connection/i.test(fallbackText),
    "3. an offline navigation to a route outside the shell allowlist serves the static offline fallback",
    fallbackText.slice(0, 200),
  );
  assert(
    /Field Capture still works/i.test(fallbackText),
    "3. the offline fallback tells the user which workflow does still work",
  );
  await fallbackPage.close();

  // -------------------------------------------------------------------------
  // C. Multiple independent drafts
  // -------------------------------------------------------------------------
  const OBS_A2 = "Fire extinguisher in the mill corridor is missing its annual inspection tag.";
  await createDraft(page, { title: "Offline draft A2", site: "Mill Corridor" });
  await recordObservation(page, { text: OBS_A2, location: "Mill corridor, station 4" });

  await page.getByRole("button", { name: "Back to drafts" }).click();
  await page.waitForSelector('[data-testid="draft-list"]', { timeout: 30000 });
  const titles = await listedDraftTitles(page);
  assert(
    titles.includes("Offline draft A1") && titles.includes("Offline draft A2"),
    "C. both offline drafts are listed independently",
    JSON.stringify(titles),
  );

  async function openDraftByTitle(target) {
    const item = page.locator('[data-testid="draft-list"] li', { hasText: target }).first();
    await item.getByRole("button", { name: "Open" }).click();
    await page.waitForSelector('[data-testid="observation-list"]', { timeout: 30000 });
    return page.locator('[data-testid="observation-list"]').innerText();
  }

  const a1Text = await openDraftByTitle("Offline draft A1");
  assert(a1Text.includes(OBS_A1.slice(0, 40)), "C. draft A1 reopens with its own observation");
  await page.getByRole("button", { name: "Back to drafts" }).click();
  const a2Text = await openDraftByTitle("Offline draft A2");
  assert(
    a2Text.includes(OBS_A2.slice(0, 40)) && !a2Text.includes(OBS_A1.slice(0, 40)),
    "C. draft A2 reopens with its own observation and none of A1's",
  );
  await page.getByRole("button", { name: "Back to drafts" }).click();

  // -------------------------------------------------------------------------
  // D / E. Per-account isolation of on-device data
  // -------------------------------------------------------------------------
  await goOnline(context);
  await signOut(page);
  await signIn(page, USER_B);
  await openFieldCapture(page);

  const bView = await page.content();
  assert(
    !bView.includes("Offline draft A1") && !bView.includes("Offline draft A2"),
    "D. USER_B cannot see USER_A's on-device drafts",
  );
  assert(
    !bView.includes(OBS_A1.slice(0, 40)),
    "D. USER_A's observation text is not visible to USER_B",
  );

  const rawStoreForB = await page.evaluate(async () => {
    // Read the store the way the application does: through the signed-in account's namespace.
    // Anything reachable here is, by definition, reachable by this account.
    const open = () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("insite-offline-v1");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    const db = await open();
    if (!db.objectStoreNames.contains("drafts")) return { rows: 0, plaintextLeak: false };
    const rows = await new Promise((resolve, reject) => {
      const request = db.transaction("drafts", "readonly").objectStore("drafts").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return {
      rows: rows.length,
      // No stored row may contain the observation text in the clear.
      plaintextLeak: rows.some((row) => JSON.stringify(row).includes("north conveyor")),
      userKeys: Array.from(new Set(rows.map((row) => row.userKey))),
    };
  });
  assert(
    !rawStoreForB.plaintextLeak,
    "12. no draft row holds customer observation text in cleartext",
    JSON.stringify(rawStoreForB),
  );

  const OBS_B1 = "Handrail missing on the east stair landing between levels 2 and 3.";
  await createDraft(page, { title: "Offline draft B1", site: "East Stair" });
  await recordObservation(page, { text: OBS_B1, location: "East stair, level 2" });
  await page.getByRole("button", { name: "Back to drafts" }).click();
  const bTitles = await listedDraftTitles(page);
  assert(
    bTitles.length === 1 && bTitles[0] === "Offline draft B1",
    "E. USER_B's own draft is the only one USER_B sees",
    JSON.stringify(bTitles),
  );

  await signOut(page);
  await signIn(page, USER_A);
  await openFieldCapture(page);
  const aTitlesAgain = await listedDraftTitles(page);
  assert(
    aTitlesAgain.includes("Offline draft A1") && aTitlesAgain.includes("Offline draft A2"),
    "E. USER_A signs back in and recovers only USER_A's drafts",
    JSON.stringify(aTitlesAgain),
  );
  assert(
    !aTitlesAgain.includes("Offline draft B1"),
    "E. USER_B's draft is invisible to USER_A",
    JSON.stringify(aTitlesAgain),
  );

  // -------------------------------------------------------------------------
  // F. Reconnect and synchronise: exactly one server inspection
  // -------------------------------------------------------------------------
  const beforeSync = await serverInspections(tokenA);
  await openDraftByTitle("Offline draft A1");
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await page.waitForFunction(
    () => {
      const badge = document.querySelector("[data-sync-state]");
      return badge && badge.getAttribute("data-sync-state") === "SYNCED";
    },
    null,
    { timeout: 60000 },
  ).catch(() => {});
  const syncedBadge = await page.locator("[data-sync-state]").first().getAttribute("data-sync-state");
  assert(syncedBadge === "SYNCED", "F. the draft reports SYNCED after synchronisation", syncedBadge);

  const afterSync = await serverInspections(tokenA);
  assert(
    afterSync.length === beforeSync.length + 1,
    `F. exactly one server inspection was produced (${beforeSync.length} -> ${afterSync.length})`,
  );

  const syncedInspection = afterSync.find((item) => item.title === "Offline draft A1");
  assert(!!syncedInspection, "F. the server inspection carries the draft's title");

  const syncedDetail = syncedInspection ? await serverInspection(tokenA, syncedInspection.id) : null;
  assert(
    !!syncedDetail && (syncedDetail.observations || []).some((item) => item.rawText.includes(OBS_A1.slice(0, 40))),
    "F. the offline observation text reached the server",
  );
  assert(
    !!syncedDetail && syncedDetail.regulatoryContext === "msha",
    "F. the regulatory context chosen offline reached the server",
    syncedDetail?.regulatoryContext,
  );

  assert(
    /uploaded/i.test(await page.locator('[data-testid="photo-list"]').innerText()),
    "5. the offline photo is uploaded on sync and only THEN reported as uploaded",
    await page.locator('[data-testid="photo-list"]').innerText(),
  );
  const evidenceRows = await client.query(
    `SELECT id, "contentType", "sizeBytes" FROM storage_objects
      WHERE "parentType" = 'inspection' AND "parentId" = $1 AND category = 'evidence'`,
    [syncedInspection?.id],
  );
  assert(
    evidenceRows.rowCount === 1 && evidenceRows.rows[0].contentType === "image/png",
    `5. exactly one evidence object reached server storage (${evidenceRows.rowCount})`,
    JSON.stringify(evidenceRows.rows),
  );

  // -------------------------------------------------------------------------
  // G. Interrupted sync: the server commits, the client never learns
  //    H. Retry adopts instead of duplicating
  // -------------------------------------------------------------------------
  await page.getByRole("button", { name: "Back to drafts" }).click();
  await openDraftByTitle("Offline draft A2");

  const beforeInterrupted = await serverInspections(tokenA);

  // The hardest duplicate case: let the request reach the server, then destroy the response so the
  // browser records nothing. A naive retry creates a second inspection; the previous heuristic
  // recovered only when exactly one candidate matched on title, site and timestamp. What must
  // recover it now is the identity the client replays.
  await context.route(`${API}/inspections`, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    await route.fetch().catch(() => null);
    await route.abort("failed");
  });

  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await page.waitForFunction(
    () => {
      const badge = document.querySelector("[data-sync-state]");
      return badge && ["SYNC_FAILED", "CONFLICT"].includes(badge.getAttribute("data-sync-state"));
    },
    null,
    { timeout: 60000 },
  ).catch(() => {});

  const failedBadge = await page.locator("[data-sync-state]").first().getAttribute("data-sync-state");
  assert(failedBadge === "SYNC_FAILED", "G. an interrupted sync reports SYNC_FAILED", failedBadge);
  assert(
    (await page.locator('[data-testid="observation-list"]').innerText()).includes(OBS_A2.slice(0, 40)),
    "G. the local observation is intact after a failed sync",
  );

  const afterInterrupted = await serverInspections(tokenA);
  const orphanCreated = afterInterrupted.length === beforeInterrupted.length + 1;
  assert(
    orphanCreated,
    `G. the interrupted attempt did reach the server (${beforeInterrupted.length} -> ${afterInterrupted.length}) — the retry below is the real duplicate test`,
  );

  await context.unroute(`${API}/inspections`);
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await page.waitForFunction(
    () => {
      const badge = document.querySelector("[data-sync-state]");
      return badge && badge.getAttribute("data-sync-state") === "SYNCED";
    },
    null,
    { timeout: 60000 },
  ).catch(() => {});

  const retriedBadge = await page.locator("[data-sync-state]").first().getAttribute("data-sync-state");
  assert(retriedBadge === "SYNCED", "H. the retry succeeds", retriedBadge);

  const afterRetry = await serverInspections(tokenA);
  const a2Records = afterRetry.filter((item) => item.title === "Offline draft A2");
  assert(
    a2Records.length === 1,
    `H. the retry produced NO duplicate inspection (${a2Records.length} record(s) titled "Offline draft A2")`,
  );

  const a2Detail = a2Records[0] ? await serverInspection(tokenA, a2Records[0].id) : null;
  const a2Observations = (a2Detail?.observations || []).filter((item) =>
    item.rawText.includes(OBS_A2.slice(0, 40)),
  );
  assert(a2Observations.length === 1, `H. the observation was not duplicated (${a2Observations.length})`);

  // The identity, not a similarity match, is what recovered it. Prove that by reading the row back.
  const a2Row = await client.query(
    `SELECT "clientRequestId" FROM "inspection" WHERE id = $1`,
    [a2Records[0]?.id],
  );
  assert(
    !!a2Row.rows[0]?.clientRequestId,
    "H. the recovered inspection carries the client-minted identity that recovered it",
    JSON.stringify(a2Row.rows[0]),
  );

  // -------------------------------------------------------------------------
  // E. Lost OBSERVATION response
  // -------------------------------------------------------------------------
  const OBS_A_LOST = "Second pass: lockout box at the crusher has no personal locks applied.";
  await page.getByTestId("observation-input").fill(OBS_A_LOST);
  await page.getByTestId("location-input").fill("Crusher deck");
  await page.getByTestId("save-observation").click();
  await page.waitForFunction(
    (expected) => document.body.innerText.includes(expected),
    OBS_A_LOST.slice(0, 40),
    { timeout: 30000 },
  );

  await context.route(`${API}/inspections/*/observations`, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    await route.fetch().catch(() => null);
    await route.abort("failed");
  });
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await waitForSyncState(page, ["SYNC_FAILED", "CONFLICT"]);
  assert(
    (await syncBadge(page)) === "SYNC_FAILED",
    "E. a lost observation response reports SYNC_FAILED",
  );
  assert(
    (await page.locator('[data-testid="observation-list"]').innerText()).includes(OBS_A_LOST.slice(0, 40)),
    "E. the observation is still on the device after its response was lost",
  );

  await context.unroute(`${API}/inspections/*/observations`);
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await waitForSyncState(page, ["SYNCED"]);
  assert((await syncBadge(page)) === "SYNCED", "E. the retry succeeds");

  const a2AfterObsRetry = await serverInspection(tokenA, a2Records[0].id);
  const lostObsRows = (a2AfterObsRetry?.observations || []).filter((item) =>
    item.rawText.includes(OBS_A_LOST.slice(0, 40)),
  );
  assert(
    lostObsRows.length === 1,
    `E. exactly ONE server observation exists after the lost response and the retry (${lostObsRows.length})`,
  );

  // -------------------------------------------------------------------------
  // F. Lost EVIDENCE response
  // -------------------------------------------------------------------------
  await page.getByTestId("photo-input").setInputFiles({
    name: "crusher-lockout.png",
    mimeType: "image/png",
    buffer: makePng(480, 360),
  });
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="photo-list"] li').length >= 1,
    null,
    { timeout: 30000 },
  );

  let evidenceIntercepts = 0;
  let evidenceDelivered = 0;
  await context.route(`${API}/inspections/*/evidence`, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    evidenceIntercepts += 1;
    const delivered = await route.fetch().catch(() => null);
    if (delivered) evidenceDelivered += 1;
    await route.abort("failed");
  });
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  // The draft is already SYNCED at this point (the observation retry above finished), so waiting on
  // the badge would return instantly and prove nothing. Wait for the upload request itself, then
  // for the page to go idle, which is when the sync run has actually completed.
  assert(
    await waitFor(() => evidenceIntercepts >= 1, "the evidence upload request to be intercepted"),
    "F. the interrupted upload attempt was actually made",
    `intercepts=${evidenceIntercepts}`,
  );
  await waitForIdle(page);
  const evidenceAfterLoss = await client.query(
    `SELECT id, status FROM storage_objects
      WHERE "parentType" = 'inspection' AND "parentId" = $1 AND category = 'evidence'`,
    [a2Records[0].id],
  );
  assert(
    evidenceAfterLoss.rowCount === 1,
    `F. the interrupted upload did reach server storage (${evidenceAfterLoss.rowCount}) — the retry below is the real duplicate test`,
    `intercepts=${evidenceIntercepts} delivered=${evidenceDelivered}`,
  );
  assert(
    /uploaded/i.test(await page.locator('[data-testid="photo-list"]').innerText()) === false,
    "F. the device does NOT claim the photo was uploaded while its response was lost",
  );

  await context.unroute(`${API}/inspections/*/evidence`);
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await waitForSyncState(page, ["SYNCED"]);
  assert((await syncBadge(page)) === "SYNCED", "F. the retry succeeds");

  const evidenceAfterRetry = await client.query(
    `SELECT id, status, "clientRequestId" FROM storage_objects
      WHERE "parentType" = 'inspection' AND "parentId" = $1 AND category = 'evidence'`,
    [a2Records[0].id],
  );
  assert(
    evidenceAfterRetry.rowCount === 1,
    `F. exactly ONE evidence object exists after the lost response and the retry (${evidenceAfterRetry.rowCount})`,
    JSON.stringify(evidenceAfterRetry.rows),
  );
  assert(
    evidenceAfterRetry.rows[0]?.status === "ready" && !!evidenceAfterRetry.rows[0]?.clientRequestId,
    "F. the single evidence object is READY and carries the client-minted identity",
    JSON.stringify(evidenceAfterRetry.rows[0]),
  );

  // -------------------------------------------------------------------------
  // I. Retry after an application restart resolves to the SAME server records
  // -------------------------------------------------------------------------
  const RESTART_TITLE = "Offline draft A3 (restart)";
  const OBS_A3_RESTART = "Third pass: emergency stop pull-cord slack on the reclaim conveyor.";
  await page.getByRole("button", { name: "Back to drafts" }).click();
  await createDraft(page, { title: RESTART_TITLE, site: "North Plant" });
  await recordObservation(page, { text: OBS_A3_RESTART, location: "Reclaim conveyor" });

  const beforeRestartSync = await serverInspections(tokenA);
  await context.route(`${API}/inspections`, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    await route.fetch().catch(() => null);
    await route.abort("failed");
  });
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await waitForSyncState(page, ["SYNC_FAILED", "CONFLICT"]);
  const afterRestartInterrupt = await serverInspections(tokenA);
  assert(
    afterRestartInterrupt.length === beforeRestartSync.length + 1,
    `I. the interrupted create reached the server before the restart (${beforeRestartSync.length} -> ${afterRestartInterrupt.length})`,
  );

  // Close the whole application. Nothing about the in-flight attempt survives in memory; only what
  // IndexedDB holds — which is the identity — can drive the retry.
  await context.close();
  context = await launch();
  page = await firstPage(context);
  await signIn(page, USER_A);
  await openFieldCapture(page);
  await openDraftByTitle(RESTART_TITLE);
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await waitForSyncState(page, ["SYNCED"]);
  assert((await syncBadge(page)) === "SYNCED", "I. the post-restart retry succeeds");

  const afterRestartRetry = await serverInspections(tokenA);
  const restartRows = afterRestartRetry.filter((item) => item.title === RESTART_TITLE);
  assert(
    restartRows.length === 1,
    `I. the post-restart retry resolved to the SAME inspection, not a duplicate (${restartRows.length})`,
  );
  assert(
    restartRows[0]?.id === afterRestartInterrupt.find((item) => item.title === RESTART_TITLE)?.id,
    "I. it is the exact inspection the pre-restart attempt created",
  );
  const restartDetail = await serverInspection(tokenA, restartRows[0].id);
  assert(
    (restartDetail?.observations || []).filter((item) =>
      item.rawText.includes(OBS_A3_RESTART.slice(0, 40)),
    ).length === 1,
    "I. its observation was written exactly once",
  );

  // -------------------------------------------------------------------------
  // K. Stale local vs newer server: no silent destructive overwrite
  // -------------------------------------------------------------------------
  // The restart test above left draft A3 open. Re-open A2 explicitly: the conflict is against the
  // inspection A2 is attached to, and running this against whichever draft happened to be on
  // screen would test nothing.
  await page.getByRole("button", { name: "Back to drafts" }).click();
  await openDraftByTitle("Offline draft A2");

  const conflictTarget = a2Records[0];
  const serverBefore = await serverInspection(tokenA, conflictTarget.id);
  const renamed = await fetch(`${API}/inspections/${conflictTarget.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ title: "Renamed on another device", version: serverBefore.version }),
  });
  assert(renamed.ok, "K. the server record was advanced from another device");

  const OBS_A3 = "Second pass: spill containment berm cracked at the fuel island.";
  await page.getByTestId("observation-input").fill(OBS_A3);
  await page.getByTestId("location-input").fill("Fuel island");
  await page.getByTestId("save-observation").click();
  await page.waitForFunction(
    (expected) => document.body.innerText.includes(expected),
    OBS_A3.slice(0, 40),
    { timeout: 30000 },
  );

  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await page.waitForFunction(
    () => {
      const badge = document.querySelector("[data-sync-state]");
      return badge && badge.getAttribute("data-sync-state") === "CONFLICT";
    },
    null,
    { timeout: 60000 },
  ).catch(() => {});

  const conflictBadge = await page.locator("[data-sync-state]").first().getAttribute("data-sync-state");
  assert(conflictBadge === "CONFLICT", "K. a stale local draft is put into CONFLICT, not merged", conflictBadge);

  const serverAfterConflict = await serverInspection(tokenA, conflictTarget.id);
  assert(
    serverAfterConflict.title === "Renamed on another device",
    "K. the newer server title was NOT overwritten",
    serverAfterConflict.title,
  );
  assert(
    !(serverAfterConflict.observations || []).some((item) => item.rawText.includes(OBS_A3.slice(0, 40))),
    "K. no local content was appended to the conflicting server record",
  );
  assert(
    (await page.locator('[data-testid="observation-list"]').innerText()).includes(OBS_A3.slice(0, 40)),
    "K. the local work is still intact on the device during a conflict",
  );

  const beforeKeepBoth = (await serverInspections(tokenA)).length;
  await page.getByTestId("conflict-keep-both").click();
  await page.waitForFunction(
    () => {
      const badge = document.querySelector("[data-sync-state]");
      return badge && badge.getAttribute("data-sync-state") === "LOCAL_ONLY";
    },
    null,
    { timeout: 30000 },
  ).catch(() => {});
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await page.waitForFunction(
    () => {
      const badge = document.querySelector("[data-sync-state]");
      return badge && badge.getAttribute("data-sync-state") === "SYNCED";
    },
    null,
    { timeout: 60000 },
  ).catch(() => {});
  const afterKeepBoth = await serverInspections(tokenA);
  assert(
    afterKeepBoth.length === beforeKeepBoth + 1,
    `K. resolving as "keep both" created a separate inspection (${beforeKeepBoth} -> ${afterKeepBoth.length})`,
  );
  const preserved = await serverInspection(tokenA, conflictTarget.id);
  assert(
    preserved.title === "Renamed on another device",
    "K. the server copy remains untouched after conflict resolution",
  );

  // -------------------------------------------------------------------------
  // I. Free entitlement is unchanged by offline capture
  // -------------------------------------------------------------------------
  const freeClassify = await fetch(`${API}/safescope-v2/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ text: OBS_A1, scopes: ["all"] }),
  });
  assert(
    freeClassify.status === 402,
    `I. Free HazLenz classification is still refused with 402 (got ${freeClassify.status})`,
  );
  assert(
    !(await page.content()).includes("hazardCategory"),
    "I. the offline capture page renders no HazLenz analysis of any kind",
  );

  // -------------------------------------------------------------------------
  // J. Pro: offline capture syncs, and the normal Level-1 path still works
  // -------------------------------------------------------------------------
  await client.query(
    `INSERT INTO entitlement_grants (id, "userId", source, tier, status, "startsAt", "endsAt", reason)
     VALUES (gen_random_uuid(), $1, 'test', 'pro', 'active', now(), now() + interval '2 hours',
             'Disposable offline field capture verification')`,
    [userIdB],
  );
  const proSession = await login(USER_B);
  const proToken = proSession.token;

  await signOut(page);
  await signIn(page, USER_B);
  await openFieldCapture(page);
  await openDraftByTitle("Offline draft B1");
  await waitForIdle(page);
  await page.getByTestId("sync-draft").click();
  await page.waitForFunction(
    () => {
      const badge = document.querySelector("[data-sync-state]");
      return badge && badge.getAttribute("data-sync-state") === "SYNCED";
    },
    null,
    { timeout: 60000 },
  ).catch(() => {});
  const proBadge = await page.locator("[data-sync-state]").first().getAttribute("data-sync-state");
  assert(proBadge === "SYNCED", "J. a Pro account synchronises an offline draft", proBadge);

  const proInspections = await serverInspections(proToken);
  const proTarget = proInspections.find((item) => item.title === "Offline draft B1");
  assert(!!proTarget, "J. the Pro account's synced inspection is on the server");

  const proClassify = await fetch(`${API}/safescope-v2/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${proToken}` },
    body: JSON.stringify({ text: OBS_B1, scopes: ["all"], inspectionId: proTarget?.id }),
  });
  assert(
    proClassify.status === 200 || proClassify.status === 201,
    `J. the normal Level-1 HazLenz server path still works for Pro after sync (got ${proClassify.status})`,
  );

  // -------------------------------------------------------------------------
  // 12. Security: nothing security-bearing is written to the device store
  // -------------------------------------------------------------------------
  const storeAudit = await page.evaluate(async () => {
    const open = () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("insite-offline-v1");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    const db = await open();
    const readAll = (store) =>
      new Promise((resolve, reject) => {
        const request = db.transaction(store, "readonly").objectStore(store).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    const drafts = await readAll("drafts");
    const photos = await readAll("photos");
    const token = window.localStorage.getItem("sentinel_auth_token") || "";
    const refresh = window.localStorage.getItem("sentinel_auth_refresh_token") || "";
    const serialised = JSON.stringify({ drafts, photos });
    return {
      draftCount: drafts.length,
      photoCount: photos.length,
      distinctUserKeys: Array.from(new Set(drafts.map((row) => row.userKey))).length,
      containsAccessToken: !!token && serialised.includes(token),
      containsRefreshToken: !!refresh && serialised.includes(refresh),
      containsPassword: /OfflineCapture[12]!/.test(serialised),
      containsStripe: /sk_|pk_live|cus_|sub_|price_/.test(serialised),
      containsEmail: serialised.includes("@example.test"),
    };
  });
  assert(!storeAudit.containsAccessToken, "12. no access token is stored in the offline database");
  assert(!storeAudit.containsRefreshToken, "12. no refresh token is stored in the offline database");
  assert(!storeAudit.containsPassword, "12. no password is stored in the offline database");
  assert(!storeAudit.containsStripe, "12. no billing or Stripe identifier is stored in the offline database");
  assert(!storeAudit.containsEmail, "12. no raw account email is stored in the offline database");
  assert(
    storeAudit.distinctUserKeys >= 2,
    "12. drafts from both accounts coexist under DISTINCT namespaces",
    JSON.stringify(storeAudit),
  );

  const cacheAudit = await page.evaluate(async () => {
    const names = await caches.keys();
    const entries = [];
    for (const name of names) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) entries.push({ name, url: request.url });
    }
    return { names, entries };
  });
  assert(
    cacheAudit.entries.every((entry) => !entry.url.includes(":4300")),
    "12. no API response was written into the shared HTTP cache",
    JSON.stringify(cacheAudit.entries.filter((entry) => entry.url.includes(":4300"))),
  );
  assert(
    cacheAudit.names.every((name) => name.startsWith("insite-shell-")),
    "12. only the versioned InSite shell caches exist",
    JSON.stringify(cacheAudit.names),
  );

  // -------------------------------------------------------------------------
  // 9. Remove offline data for this device
  // -------------------------------------------------------------------------
  await page.getByRole("button", { name: "Back to drafts" }).click();
  await page.getByRole("button", { name: /Remove this account's offline data/i }).click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="field-capture-status"]')?.textContent?.includes("Removed"),
    null,
    { timeout: 30000 },
  ).catch(() => {});
  const afterPurge = await listedDraftTitles(page);
  assert(afterPurge.length === 0, "9. removing offline data clears this account's drafts", JSON.stringify(afterPurge));

  await signOut(page);
  await signIn(page, USER_A);
  await openFieldCapture(page);
  const aAfterBPurge = await listedDraftTitles(page);
  assert(
    aAfterBPurge.length > 0,
    "9. removing USER_B's offline data left USER_A's drafts untouched",
    JSON.stringify(aAfterBPurge),
  );

  const overflowFinal = await horizontalOverflow(page);
  assert(overflowFinal <= 0, `L. no horizontal overflow at 390px online (measured ${overflowFinal}px)`);
} catch (error) {
  failures += 1;
  console.error("FAIL harness", error?.stack || error);
} finally {
  if (context) await context.close().catch(() => {});
  await client.end().catch(() => {});
  rmSync(profileDir, { recursive: true, force: true });
}

const summary = { passed: failures === 0, passes, failures, viewport: "390x844", database: databaseName, results };
if (process.env.OUT_JSON) writeFileSync(process.env.OUT_JSON, JSON.stringify(summary, null, 2));
console.log(`\n${JSON.stringify({ passed: summary.passed, passes, failures })}`);
process.exit(failures === 0 ? 0 : 1);

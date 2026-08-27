#!/usr/bin/env node
/**
 * V1-OFFLINE-CAPTURE-01 -- durable offline field-capture contract.
 *
 * Run: npm run check:offline-field-capture   (from frontend-next/)
 *
 * This is the deterministic half of the offline proof and needs no server, no database and no
 * browser. It exists because the browser suite (scripts/verify-offline-field-capture.mjs) proves
 * the BEHAVIOUR on one build against one disposable stack, and a behaviour proof cannot stop the
 * next edit from quietly removing the property that produced it. So:
 *
 *   Part 1 simulates the two decision procedures that make synchronisation safe -- conflict
 *          detection and interrupted-create reconciliation -- against fixtures.
 *   Part 2 binds the SHIPPED source to the invariants those procedures depend on, so the
 *          simulation cannot drift away from the code it claims to describe.
 *
 * The invariants asserted here are the ones whose loss would be silent and dangerous: an API
 * response entering a shared HTTP cache, an offline read that is not namespaced to the signed-in
 * account, a synchronisation that overwrites server state, or a non-idempotent create regaining a
 * transport-level retry.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

// The idempotency contract spans both packages: the client mints the identity, the server is the
// authority that one identity means one row. A checker that only reads one side cannot see the
// contract, so this one reads both.
const BACKEND_FILES = {
  migration: "src/database/migrations/1800000015000-OfflineSyncIdempotency.ts",
  inspectionService: "src/inspection/inspection.service.ts",
  inspectionDto: "src/inspection/dto/inspection.dto.ts",
  inspectionEntity: "src/inspection/inspection.entity.ts",
  observationEntity: "src/inspection/entities/observation.entity.ts",
  storageService: "src/storage/storage.service.ts",
  storageEntity: "src/storage/storage-object.entity.ts",
  filesController: "src/storage/files.controller.ts",
  uniqueViolation: "src/common/unique-violation.ts",
};

const FILES = {
  sw: "public/sw.js",
  manifest: "app/manifest.webmanifest",
  fallback: "public/offline.html",
  db: "lib/offline/offlineDb.ts",
  identity: "lib/offline/offlineIdentity.ts",
  store: "lib/offline/fieldCaptureStore.ts",
  sync: "lib/offline/fieldCaptureSync.ts",
  page: "app/field-capture/page.tsx",
  api: "lib/canonicalWorkflowApi.ts",
  cleanup: "components/system/ClientCacheCleanup.tsx",
  registrar: "components/system/ServiceWorkerRegistrar.tsx",
  auth: "lib/auth.ts",
  shell: "components/layout/AppShell.tsx",
  layout: "app/layout.tsx",
};

const backendRoot = join(frontendRoot, "..", "backend");

const source = Object.fromEntries([
  ...Object.entries(FILES).map(([key, path]) => [key, readFileSync(join(frontendRoot, path), "utf8")]),
  ...Object.entries(BACKEND_FILES).map(([key, path]) => [key, readFileSync(join(backendRoot, path), "utf8")]),
]);

/**
 * Comments in these files deliberately NAME the mechanisms that were rejected ("base64 in
 * localStorage", "PATCH"), so an assertion that a mechanism is absent has to look at code, not
 * prose, or it fails on its own documentation.
 */
function codeOnly(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*)/.test(line))
    .join("\n");
}

const code = Object.fromEntries(Object.entries(source).map(([key, text]) => [key, codeOnly(text)]));

let passes = 0;
let failures = 0;

function assert(condition, label, details) {
  if (condition) {
    passes += 1;
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}`);
  if (details !== undefined) console.error(`     ${details}`);
}

// ===========================================================================
// Part 1 -- the synchronisation decision procedures, simulated.
// ===========================================================================

// Mirrors detectConflict() in lib/offline/fieldCaptureSync.ts.
function detectConflict(draft, server) {
  if (draft.baseServerVersion === undefined) return { conflict: false, reason: "" };
  if (server.version > draft.baseServerVersion) return { conflict: true, reason: "advanced" };
  if (server.status === "archived") return { conflict: true, reason: "archived" };
  return { conflict: false, reason: "" };
}

/**
 * The identity resolution the SERVER performs, mirrored. This is what replaced the client-side
 * title + site + timestamp heuristic: a lookup keyed on (creating user, opaque identifier), which
 * is an equality test on identity rather than a similarity judgement about content.
 */
function resolveByClientRequestId(rows, user, clientRequestId) {
  if (!clientRequestId) return null;
  return (
    rows.find(
      (row) => row.createdByUserId === user && row.clientRequestId === clientRequestId,
    ) || null
  );
}

const T0 = "2026-08-26T12:00:00.000Z";

assert(
  detectConflict({ baseServerVersion: undefined }, { version: 7, status: "draft" }).conflict === false,
  "1. a draft never attached to a server record cannot conflict with one",
);
assert(
  detectConflict({ baseServerVersion: 3 }, { version: 3, status: "draft" }).conflict === false,
  "1. an unchanged server record is not a conflict",
);
assert(
  detectConflict({ baseServerVersion: 3 }, { version: 4, status: "draft" }).conflict === true,
  "1. a server record that advanced while offline IS a conflict",
);
assert(
  detectConflict({ baseServerVersion: 3 }, { version: 3, status: "archived" }).conflict === true,
  "1. an archived server record is a conflict rather than an append target",
);

const USER_A = "user-a";
const USER_B = "user-b";
const KEY = "draft_11111111-2222-4333-8444-555555555555";

const rows = [
  { id: "srv-1", createdByUserId: USER_A, clientRequestId: KEY, title: "Shift walk", siteId: "site-1", updatedAt: T0 },
  { id: "srv-2", createdByUserId: USER_A, clientRequestId: null, title: "Shift walk", siteId: "site-1", updatedAt: T0 },
];

assert(
  resolveByClientRequestId(rows, USER_A, KEY)?.id === "srv-1",
  "1. C. replaying the same identifier resolves to the row it already created",
);
assert(
  resolveByClientRequestId(rows, USER_B, KEY) === null,
  "1. D. USER_B presenting USER_A's identifier resolves to nothing — no cross-user adoption",
);
assert(
  resolveByClientRequestId(rows, USER_A, "draft_99999999-8888-4777-8666-555555555555") === null,
  "1. B. a DIFFERENT identifier resolves to nothing, even with an identical title, site and timestamp",
);
assert(
  resolveByClientRequestId(rows, USER_A, undefined) === null &&
    resolveByClientRequestId(rows, USER_A, null) === null,
  "1. an absent identifier resolves to nothing, so the online path stays non-idempotent and unchanged",
);
assert(
  rows.filter((row) => row.clientRequestId === null).length === 1,
  "1. rows carrying no identifier are unconstrained and cannot collide with each other",
);

// The identifier the client actually mints must be acceptable to the server's validator.
const CLIENT_REQUEST_ID_PATTERN = /^[A-Za-z0-9_.:-]{8,128}$/;
for (const minted of [
  `draft_${"11111111-2222-4333-8444-555555555555"}`,
  `obs_${"aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"}`,
  `photo_${"00000000-0000-4000-8000-000000000000"}`,
  // The non-crypto.randomUUID fallback branch of newLocalId().
  `draft_${(1787788099980).toString(16)}-${"9f3a2b1c"}`,
]) {
  assert(
    CLIENT_REQUEST_ID_PATTERN.test(minted),
    `1. a minted local identity is inside the server's accepted pattern: ${minted}`,
  );
}
assert(
  !CLIENT_REQUEST_ID_PATTERN.test("short") && !CLIENT_REQUEST_ID_PATTERN.test("has space here"),
  "1. the server's pattern rejects an identifier that is too short or carries unexpected characters",
);

// ===========================================================================
// Part 2 -- the shipped source must actually hold those invariants.
// ===========================================================================

// --- Service worker: what may and may not enter a device-shared cache -------
assert(
  /url\.origin !== self\.location\.origin\)\s*return;/.test(source.sw),
  "2. the service worker ignores every cross-origin request (the API lives on its own origin)",
);
assert(
  /request\.headers\.has\("Authorization"\)\)\s*return;/.test(source.sw),
  "2. the service worker never handles an authorised request",
);
assert(
  /url\.pathname\.startsWith\("\/api\/"\)\)\s*return;/.test(source.sw),
  "2. the service worker never handles a same-origin /api/ request",
);
assert(
  /searchParams\.has\("_rsc"\)\)\s*return;/.test(source.sw),
  "2. the service worker never caches an RSC payload",
);
assert(
  /request\.method !== "GET"\)\s*return;/.test(source.sw),
  "2. the service worker never handles a non-GET request",
);
assert(
  /name\.startsWith\("insite-shell-"\) && !name\.startsWith\(CACHE_VERSION\)/.test(source.sw),
  "2. activating a new worker version deletes the superseded shell caches",
);
assert(
  /const SHELL_ROUTES = \[/.test(source.sw) && /isShellRoute\(url\)/.test(source.sw),
  "2. only an explicit route allowlist may have its document shell cached",
);
assert(
  source.sw.includes("cache.match(OFFLINE_FALLBACK)") && source.sw.includes('const OFFLINE_FALLBACK = "/offline.html"'),
  "2. a non-allowlisted offline navigation falls back to the static offline document",
);
assert(
  !/<script[^>]*src=|<link[^>]*rel="stylesheet"|https?:\/\//.test(source.fallback.replace(/<!--[\s\S]*?-->/g, "")),
  "2. the offline fallback document references no external asset it could not fetch offline",
);
assert(
  /Field Capture still works/.test(source.fallback) &&
    /need a connection/.test(source.fallback),
  "2. the offline fallback states what does and does not work without a connection",
);
assert(
  source.fallback.includes('href="/field-capture"'),
  "2. the offline fallback routes the user to the workflow that does work",
);
assert(
  !/cache\.put\(.*Authorization/i.test(source.sw),
  "2. no code path writes an authorised response into the cache",
);

// --- Manifest ---------------------------------------------------------------
const manifest = JSON.parse(source.manifest);
assert(manifest.start_url === "/field-capture", "2. the installed application starts at Field Capture");
assert(manifest.display === "standalone", "2. the manifest declares a standalone display mode");
assert(
  !/manifest:\s*"/.test(source.layout),
  "2. the manifest is declared once, via the App Router file convention",
);
assert(
  source.layout.includes("<ServiceWorkerRegistrar />"),
  "2. the shell worker is registered from the root layout",
);
assert(
  /register\("\/sw\.js", \{ scope: "\/", updateViaCache: "none" \}\)/.test(source.registrar),
  "2. registration matches the documented Next.js service-worker call",
);

// --- Cache cleanup must not undo the shell ----------------------------------
assert(
  /filter\(\(registration\) => !isOfflineShellWorker\(registration\)\)/.test(source.cleanup),
  "2. legacy-cache cleanup no longer unregisters the offline shell worker",
);
assert(
  /!cacheName\.startsWith\(OFFLINE_SHELL_CACHE_PREFIX\)/.test(source.cleanup),
  "2. legacy-cache cleanup no longer deletes the offline shell caches",
);

// --- Per-user namespace -----------------------------------------------------
assert(
  /crypto\.subtle\.digest\("SHA-256"/.test(source.identity),
  "2. the offline namespace is a digest, so no raw account identifier becomes an IndexedDB key",
);
assert(
  /if \(!source\) return null;/.test(source.identity),
  "2. with no signed-in account the namespace resolves to null, so no query can be formed",
);
assert(
  /createIndex\("byUser", "userKey"/.test(source.db),
  "2. drafts are indexed by the per-account namespace",
);
assert(
  /rows\.filter\(\(row\) => row\.userKey === userKey\)/.test(source.db),
  "2. a listing re-filters on the namespace rather than trusting the index alone",
);
assert(
  /found && found\.userKey === userKey \? found : undefined/.test(source.db),
  "2. a single-record read re-checks the namespace",
);
assert(
  /draft && draft\.userKey === identity\.userKey \? draft : null/.test(source.store),
  "2. a decrypted draft carrying a foreign namespace is discarded, not returned",
);

const exportedStoreReads = source.store.match(/export async function \w+/g) || [];
assert(
  exportedStoreReads.length > 0 &&
    (source.store.match(/await requireIdentity\(\)/g) || []).length >= 10,
  "2. every asynchronous store entry point resolves an identity before touching storage",
  `${exportedStoreReads.length} exported async functions, ${(source.store.match(/await requireIdentity\(\)/g) || []).length} identity guards`,
);
assert(
  !/localStorage/.test(code.store) && !/localStorage/.test(code.db),
  "2. the offline store never falls back to localStorage",
);
assert(
  /encryptForUser\(identity\.userKey/.test(source.store),
  "2. draft payloads are encrypted under the per-account key before being written",
);
assert(
  /createObjectStore\(KEY_STORE/.test(source.db) &&
    /transaction\.objectStore\(KEY_STORE\)\.delete\(userKey\)/.test(source.db),
  "2. removing an account's offline data destroys its key material with its rows",
);

// --- Nothing security-bearing may be persisted ------------------------------
const FORBIDDEN_PERSISTENCE = [
  "password",
  "refreshToken",
  "authToken",
  "sentinel_auth_token",
  "stripe",
  "cardNumber",
];
for (const term of FORBIDDEN_PERSISTENCE) {
  const pattern = new RegExp(`${term}\\s*[:=]`, "i");
  assert(
    !pattern.test(code.store) && !pattern.test(code.db),
    `2. the offline store never persists a field named like "${term}"`,
  );
}

// --- Synchronisation --------------------------------------------------------
assert(
  !/method: "PATCH"/.test(code.sync) && !/method: "DELETE"/.test(code.sync),
  "2. synchronisation issues no PATCH or DELETE against server-held records",
);
assert(
  !/transitionPersistedInspection/.test(source.sync),
  "2. synchronisation never transitions a server inspection's status",
);
assert(
  source.sync.indexOf("remoteInspectionId: created.id") <
    source.sync.indexOf("const server = await getPersistedInspection"),
  "2. the server identifier is recorded before anything is appended to it",
);

// ---- The identity contract, client side ------------------------------------
assert(
  /clientRequestId: draft\.clientRequestId/.test(source.sync),
  "2. the inspection create sends the draft's stable identity",
);
assert(
  /addPersistedObservation\(\s*draft\.remoteInspectionId!,\s*body,\s*observation\.clientRequestId,\s*\)/.test(
    source.sync,
  ),
  "2. each observation create sends that observation's stable identity",
);
assert(
  /uploadInspectionEvidence\(\s*draft\.remoteInspectionId!,\s*file,\s*photo\.clientRequestId,\s*\)/.test(
    source.sync,
  ),
  "2. each evidence upload sends that photo's stable identity",
);
assert(
  /clientRequestId: localId/.test(source.store) && /clientRequestId: photoLocalId/.test(source.store),
  "2. every local record seeds its server identity from its local id at creation",
);
assert(
  /OFFLINE_DRAFT_SCHEMA_VERSION = 2/.test(source.store),
  "2. the local schema version records that the identity contract replaced the attempt marker",
);

// ---- Phase 4: the heuristic is gone as an authority -------------------------
assert(
  !/reconcileInterruptedCreate/.test(source.sync),
  "4. the title + site + timestamp adoption heuristic is no longer present in the sync path",
);
assert(
  !/syncAttempt/.test(code.sync) && !/syncAttempt/.test(code.store),
  "4. the client-side attempt marker it depended on is gone too",
);
assert(
  !/inspection\.title === draft\.title|candidates\.length === 1/.test(code.sync),
  "4. no candidate-matching or ambiguity resolution survives in the sync path",
);

// ---- Detaching a conflicted draft must retire EVERY server-facing identity --
const detach = source.sync.slice(source.sync.indexOf("export async function resolveConflictAsNewInspection"));
assert(
  /clientRequestId: newLocalId\("draft"\)/.test(detach),
  "4. detaching a conflicted draft re-mints the inspection identity",
);
assert(
  /clientRequestId: newLocalId\("obs"\)/.test(detach) && /remoteObservationId: undefined/.test(detach),
  "4. detaching re-mints every observation identity and clears its acknowledgement",
);
assert(
  /clientRequestId: newLocalId\("photo"\)/.test(detach) && /remoteEvidenceId: undefined/.test(detach),
  "4. detaching re-mints every photo identity and clears its acknowledgement",
);

// ---- The identity contract, server side ------------------------------------
assert(
  /ADD COLUMN IF NOT EXISTS "clientRequestId" varchar\(128\) NULL/.test(source.migration),
  "5. the migration adds a NULLABLE identity column, so existing rows are untouched",
);
// Normalise the migration's SQL whitespace: the statements are written across several lines for
// readability, and the assertion is about the columns, not the formatting.
const migrationSql = source.migration.replace(/\s+/g, " ");
for (const [index, columns] of [
  ["uq_inspection_client_request", 'ON "inspection" ("createdByUserId", "clientRequestId")'],
  ["uq_observation_client_request", 'ON "observations" ("inspectionId", "createdByUserId", "clientRequestId")'],
  ["uq_storage_object_client_request", 'ON "storage_objects" ("createdByUserId", "clientRequestId")'],
]) {
  const declaration = `CREATE UNIQUE INDEX IF NOT EXISTS "${index}" ${columns}`;
  assert(
    migrationSql.includes(declaration),
    `5. ${index} makes the DATABASE the authority, scoped to the creating user`,
    declaration,
  );
}
assert(
  (source.migration.match(/WHERE "clientRequestId" IS NOT NULL/g) || []).length === 3,
  "5. every uniqueness index is PARTIAL, so rows without an identifier stay unconstrained",
);
assert(
  !/DROP TABLE|TRUNCATE|DELETE FROM|DROP COLUMN(?![\s\S]{0,80}down)/.test(
    source.migration.slice(0, source.migration.indexOf("public async down")),
  ),
  "5. the migration's up() performs no destructive operation",
);
assert(
  /where: \{ createdByUserId: user\.userId, clientRequestId \}/.test(source.inspectionService),
  "5. inspection resolution is keyed on the CREATING USER, so one member cannot adopt another's",
);
assert(
  /inspectionId, createdByUserId: user\.userId, clientRequestId: dto\.clientRequestId/.test(
    source.inspectionService,
  ),
  "5. observation resolution is keyed on the inspection AND the creating user",
);
assert(
  /createdByUserId: user\.userId, clientRequestId/.test(source.storageService),
  "5. evidence resolution is keyed on the creating user",
);
assert(
  (source.inspectionService.match(/isUniqueViolation\(error\)/g) || []).length >= 2 &&
    /isUniqueViolation\(error\)/.test(source.storageService),
  "5. a concurrent replay losing the unique index is re-read and returned, not surfaced as an error",
);
assert(
  /code === '23505'/.test(source.uniqueViolation) && /driverError\?\.code === '23505'/.test(source.uniqueViolation),
  "5. the unique-violation test checks both the wrapper and the nested driver error",
);
assert(
  /export const CLIENT_REQUEST_ID_PATTERN = \/\^\[A-Za-z0-9_\.:-\]\{8,128\}\$\//.test(source.inspectionDto),
  "5. the identifier is bounded and character-restricted, so it can never carry interpretable structure",
);
assert(
  (source.inspectionDto.match(/@IsOptional\(\)\s*\n\s*@Matches\(CLIENT_REQUEST_ID_PATTERN/g) || []).length === 2,
  "5. the identifier is OPTIONAL on both creates — the online path stays backward compatible",
);
assert(
  /clientRequestId: body\?\.clientRequestId \|\| null/.test(source.filesController),
  "5. the multipart evidence route accepts the identifier as a form field",
);
assert(
  /existing\.status === 'ready'/.test(source.storageService),
  "5. only a READY stored object satisfies a replay; a half-written one is re-driven, not reported as stored",
);
assert(
  /this\.objects\.update\(record\.id, \{ status: 'ready' \}\)/.test(source.storageService),
  "5. finalisation updates by id, so a record re-read without its select:false objectKey cannot be damaged",
);
assert(
  /if \(observation\.remoteObservationId && serverObservationIds\.has\(observation\.remoteObservationId\)\)/.test(
    source.sync,
  ),
  "2. an already-acknowledged observation is skipped on retry rather than re-posted",
);
assert(
  /outstanding === 0 && photosFailed === 0 \? "SYNCED" : "SYNC_FAILED"/.test(source.sync),
  "2. SYNCED is claimed only when every part was acknowledged by the server",
);
assert(
  /const conflict = detectConflict\(draft, server\);/.test(source.sync) &&
    /syncState: "CONFLICT"/.test(source.sync),
  "2. a staleness check runs before any append and can stop it",
);
assert(
  /analyzeObservation|safescope-v2\/classify|guidedFinding/.test(code.sync) === false,
  "2. synchronisation never runs HazLenz analysis",
);

// --- Non-idempotent creates must not auto-retry -----------------------------
assert(
  /const NON_IDEMPOTENT = \{ retries: 0 \} as const;/.test(source.api),
  "2. the API client declares a no-retry policy for non-idempotent creates",
);
for (const fn of ["createPersistedSite", "createPersistedInspection", "addPersistedObservation"]) {
  // Slice to the end of the FIRST apiJson(...) call in the function, which is the create itself.
  // A naive "up to the next line starting with }" stops inside the inline parameter type literal
  // that createPersistedInspection declares.
  const body = source.api.slice(source.api.indexOf(`export async function ${fn}`));
  const firstCallEnd = body.indexOf("});");
  assert(
    firstCallEnd > 0 && body.slice(0, firstCallEnd + 3).includes("NON_IDEMPOTENT"),
    `2. ${fn}() does not auto-retry (a lost response would otherwise duplicate the record)`,
  );
}
assert(
  source.api.slice(source.api.indexOf("export async function uploadInspectionEvidence")).includes("NON_IDEMPOTENT"),
  "2. uploadInspectionEvidence() does not auto-retry",
);

// --- Truthfulness of what the UI claims -------------------------------------
assert(
  /current\.syncState === "SYNCED" \? "LOCAL_ONLY" : current\.syncState/.test(source.page),
  "2. new local work on a synced draft returns it to LOCAL_ONLY instead of still claiming SYNCED",
);
assert(
  source.page.includes("Saved on this device · not yet synced") &&
    source.page.includes("Synced to Safety InSite"),
  "2. the UI distinguishes device-saved from server-saved in its own words",
);
assert(
  /HazLenz AI analysis, risk scoring, corrective actions and report generation run on Safety\s*\n?\s*InSite/.test(
    source.page,
  ) || source.page.includes("run on Safety\n          InSite&apos;s servers and need a connection"),
  "2. the capture page states the online boundary for HazLenz and reports",
);
assert(
  /needs a connection/.test(source.page),
  "2. the sync control names connectivity as the requirement when offline",
);
assert(
  source.shell.includes("onOfflineCaptureRoute") &&
    source.shell.includes("sync is a button you press, not automatic"),
  "2. the offline badge does not claim automatic background synchronisation",
);
assert(
  !/kept on this device until the connection returns/.test(source.shell),
  "2. the removed false offline claim has not returned",
);

// --- Sign-out sweeps the legacy device-global offline keys -------------------
for (const key of [
  "insite_offline_inspections_v1",
  "insite_offline_report_drafts_v1",
  "insite_offline_inspection_sync_queue_v1",
  "insite_active_local_inspection_id",
]) {
  assert(
    source.auth.includes(`"${key}"`),
    `2. sign-out clears the legacy device-global offline key ${key}`,
  );
}

console.log(`\n${JSON.stringify({ passed: failures === 0, passes, failures })}`);
process.exit(failures === 0 ? 0 : 1);

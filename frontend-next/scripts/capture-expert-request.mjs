/**
 * §267 — CAPTURE THE EXPERT EXECUTION REQUEST THE SHIPPED CLIENT ACTUALLY CONSTRUCTS.
 *
 * ===============================================================================================
 * WHY THIS FILE EXISTS AT ALL.
 *
 * §265's acceptance suite hand-authored the Expert route's request bodies. Every case it ran was
 * correct, and it still missed the defect that made Expert unusable in the product, because the
 * bodies it sent were not the bodies `lib/expert/expertApi.ts` sends. §266 found the real client
 * hardcoding `requestVersion: 1` — a field the suite was supplying itself, correctly, on a fresh
 * observation where 1 happened to be right.
 *
 * The lesson is narrow and §267 states it as a requirement: DO NOT SEPARATELY RECREATE WHAT THE
 * FRONTEND WOULD SEND; TEST THE CODE THAT ACTUALLY CONSTRUCTS IT. So this script imports the real
 * module — not a copy, not a re-declaration, not a fixture — puts a recorder where the network is,
 * and reports the request that reached it.
 *
 * ===============================================================================================
 * WHAT IS REAL HERE AND WHAT IS SUBSTITUTED, STATED PLAINLY.
 *
 *   REAL          `lib/expert/expertApi.ts`, and everything it imports: `lib/apiFetch.ts`'s retry,
 *                 timeout and Content-Type handling, `lib/auth.ts`'s `authHeaders()`, and
 *                 `lib/safescope.ts`'s `API_BASE_URL`. The URL, the method, the headers and the
 *                 body below are what that code produced, not what this script believes it produces.
 *   SUBSTITUTED   `globalThis.fetch`, which records and returns a synthetic 200. That is the seam a
 *                 browser would occupy, and it is the only one.
 *   SHIMMED       `window` (its `setTimeout`/`clearTimeout`/`localStorage` only) because `apiFetch`
 *                 and `authHeaders` are browser code and Node has no `window`. The shim supplies a
 *                 token so the Authorization header is exercised rather than skipped.
 *
 * The recorder is deliberately placed at `globalThis.fetch` rather than at `apiFetch`, so the
 * timeout wrapper, the header merge and the Content-Type default are all inside the measurement.
 *
 * ===============================================================================================
 * USAGE.
 *
 *   node scripts/capture-expert-request.mjs              assert the §267 properties, human output
 *   node scripts/capture-expert-request.mjs --emit-json  print ONLY the captured request as JSON
 *
 * The second mode is what `backend/scripts/test-267-product-integration-defects.ts` consumes: it
 * spawns this script and posts the captured body verbatim to the real route. That is why the
 * backend suite's P0-1 case is evidence about the shipped client and not about a fixture — the
 * bytes it sends were constructed here, in this process, by the module the browser loads.
 *
 * `jiti` performs the TypeScript + path-alias resolution. It arrives with Next.js and is present in
 * this workspace's lockfile as a dev dependency; the failure below names it rather than surfacing
 * an opaque module-resolution error.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKSPACE = resolve(HERE, "..");
const EMIT_JSON = process.argv.includes("--emit-json");

const require_ = createRequire(import.meta.url);
let createJiti;
try {
  ({ createJiti } = require_("jiti"));
} catch {
  console.error(
    "§267 ABORT: `jiti` is not resolvable from frontend-next. It is required to load the real\n"
    + "TypeScript client module with its `@/` path aliases. It is present in this workspace's\n"
    + "lockfile (it ships with Next.js); run `npm install` in frontend-next.",
  );
  process.exit(1);
}

// ---- the browser shim. Narrow on purpose: anything the client needs that is NOT here would be a
// ---- real portability finding about the client, and should surface as a failure rather than be
// ---- pre-emptively satisfied by a broad fake environment.
const STUB_TOKEN = "section-267-capture-token";
let AUTH_TOKEN_KEY = null;
globalThis.window = {
  setTimeout: (...args) => setTimeout(...args),
  clearTimeout: (...args) => clearTimeout(...args),
  localStorage: {
    // The real key, read from the real module, so a rename in `lib/auth.ts` breaks this shim
    // loudly instead of silently producing an unauthenticated capture.
    getItem: (key) => (AUTH_TOKEN_KEY === null || key === AUTH_TOKEN_KEY ? STUB_TOKEN : null),
    setItem: () => {},
    removeItem: () => {},
  },
};

/** Every request that reached the network seam, in order. */
const transmitted = [];
globalThis.fetch = async (input, init = {}) => {
  const headers = {};
  new Headers(init.headers || {}).forEach((value, key) => { headers[key] = value; });
  transmitted.push({
    url: String(input),
    method: init.method ?? "GET",
    headers,
    rawBody: typeof init.body === "string" ? init.body : null,
  });
  return new Response(
    JSON.stringify({
      analysisId: null, executionId: "capture", analysisState: "ANALYSIS_FAILED",
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
};

const jiti = createJiti(import.meta.url, { alias: { "@": WORKSPACE }, interopDefault: true });

async function main() {
  // Read the storage key from `lib/auth.ts` itself rather than restating it here. A capture that
  // silently failed to authenticate would still produce a body, and the body is what this script
  // exists to report — so the header must be exercised for real or the run must fail.
  const auth = await jiti.import(resolve(WORKSPACE, "lib/auth.ts"));
  AUTH_TOKEN_KEY = auth.AUTH_TOKEN_KEYS[0];

  // THE REAL MODULE. Loaded from source, by path, with no local re-declaration of its contents.
  const expertApi = await jiti.import(resolve(WORKSPACE, "lib/expert/expertApi.ts"));

  // The backend suite passes the observation it actually created, so the captured request is
  // addressed at a real row and can be posted verbatim rather than rewritten after capture.
  // Rewriting it would reintroduce exactly the "what the frontend would send" recreation §267
  // forbids, one field at a time.
  const observationArg = process.argv.find(a => a.startsWith("--observation="));
  const observationId = observationArg
    ? observationArg.slice("--observation=".length)
    : "3f2504e0-4f89-11d3-9a0c-0305e82c3301";
  await expertApi.requestExpertAnalysis(observationId, {
    idempotencyKey: expertApi.expertIdempotencyKey(observationId, 0),
    taskContext: "changing the drive belt on the packaging line",
  });

  if (transmitted.length !== 1) {
    throw new Error(`§267 ABORT: expected exactly one transmitted request, saw ${transmitted.length}`);
  }
  const request = transmitted[0];
  const captured = {
    artifact: "SECTION-267-REAL-FRONTEND-EXPERT-REQUEST",
    source: "frontend-next/lib/expert/expertApi.ts, executed",
    observationId,
    url: request.url,
    pathAndQuery: new URL(request.url, "http://capture.invalid").pathname,
    method: request.method,
    headerNames: Object.keys(request.headers).sort(),
    rawBody: request.rawBody,
    body: request.rawBody === null ? null : JSON.parse(request.rawBody),
  };

  if (EMIT_JSON) {
    process.stdout.write(JSON.stringify(captured));
    return;
  }

  const failures = [];
  const check = (condition, message) => {
    if (condition) console.log(`ok    ${message}`);
    else { failures.push(message); console.log(`FAIL  ${message}`); }
  };

  console.log("§267 — the request the shipped Expert client actually constructs\n");
  console.log(`  ${captured.method} ${captured.pathAndQuery}`);
  console.log(`  body ${captured.rawBody}\n`);

  check(captured.method === "POST", "the execution call is a POST");
  check(
    captured.pathAndQuery === `/inspections/observations/${observationId}/expert-analyses`,
    "it addresses the authoritative Expert execution route",
  );
  check(
    Object.prototype.hasOwnProperty.call(captured.body, "idempotencyKey"),
    "it carries an idempotency key, so a retry cannot duplicate spend",
  );
  // THE §267 PROPERTY. This is the assertion the §265 suite could not make, because it was
  // supplying the field itself rather than measuring what the client sent.
  check(
    !Object.prototype.hasOwnProperty.call(captured.body, "requestVersion"),
    "it sends NO requestVersion — the client does not sequence Expert requests (§267 P0-1)",
  );
  check(
    captured.headerNames.includes("authorization"),
    "it carries the Authorization header from the real authHeaders()",
  );
  check(
    Object.keys(captured.body).every(
      key => ["idempotencyKey", "taskContext", "answeredClarifications"].includes(key),
    ),
    `the body carries only accepted fields (${Object.keys(captured.body).join(",")})`,
  );

  console.log(`\n${failures.length === 0 ? "PASS" : `FAIL — ${failures.length} failing`}`);
  if (failures.length > 0) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });

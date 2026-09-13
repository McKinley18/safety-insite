/**
 * §279 — THE CLIENT HALF OF THE UPDATE-DELIVERY GATE.
 *
 * Runs with `npx tsx lib/release/__tests__/releaseVersionCheck.test.ts` (no test runner is
 * configured in this workspace, so this is a self-checking script — the same convention as
 * `lib/calendar/__tests__/calendarReconciliation.test.ts`).
 *
 * ==================== WHY THIS IS SEPARATE FROM THE SERVER GATE ====================
 *
 * `backend/scripts/test-279-release-compatibility.ts` proves the RULE is right. It cannot prove
 * the client ASKS, that it asks the right number of times, or that it keeps working when the
 * answer never arrives — and those are the three places this mechanism can fail in a way a user
 * would actually experience:
 *
 *   F  the server is unreachable                 -> the client must NOT declare itself obsolete
 *   G  a tab wakes after a release               -> the check runs and the new state is seen
 *   J  several triggers fire at once             -> ONE request, ONE notice
 *   E  a blocked client attempts a write         -> refused cleanly, and reads still work
 *
 * `document` and `fetch` are stubbed rather than mocked through a framework, so what is being
 * measured is the module's real scheduling and its real branch on the real rule.
 */
import {
  BACKGROUND_INTERVAL_MS,
  STALE_AFTER_MS,
  blocksMutation,
  checkReleaseVersion,
  getReleaseStatus,
  resetReleaseStatusForTests,
  startReleaseVersionWatch,
  subscribeToReleaseStatus,
} from "../versionCheck";

const failures: string[] = [];
let checks = 0;
function check(condition: unknown, message: string) {
  checks += 1;
  if (condition) console.log(`ok    ${message}`);
  else {
    failures.push(message);
    console.log(`FAIL  ${message}`);
  }
}

// ---------------------------------------------------------------------------------------------
// The environment the module expects. `buildIdentity` reads NEXT_PUBLIC_FRONTEND_VERSION, which
// next.config inlines at build time; under tsx it is an ordinary environment variable, so the
// client's version is set here BEFORE the module graph is touched.
// ---------------------------------------------------------------------------------------------
type Listener = () => void;
const visibilityListeners = new Set<Listener>();
let visibility: "visible" | "hidden" = "visible";
const intervals: Array<{ fn: () => void; ms: number }> = [];

function installEnvironment() {
  const g = globalThis as unknown as Record<string, unknown>;
  g.document = {
    get visibilityState() {
      return visibility;
    },
    addEventListener: (event: string, fn: Listener) => {
      if (event === "visibilitychange") visibilityListeners.add(fn);
    },
    removeEventListener: (event: string, fn: Listener) => {
      if (event === "visibilitychange") visibilityListeners.delete(fn);
    },
  };
  g.window = {
    setInterval: (fn: () => void, ms: number) => {
      intervals.push({ fn, ms });
      return intervals.length;
    },
    clearInterval: () => {},
  };
}
installEnvironment();

let served: unknown = null;
let servedStatus = 200;
let fetchCalls = 0;
let resolveGate: (() => void) | null = null;

globalThis.fetch = (async () => {
  fetchCalls += 1;
  if (resolveGate) {
    await new Promise<void>((resolve) => {
      const previous = resolveGate;
      resolveGate = () => {
        previous?.();
        resolve();
      };
    });
  }
  if (servedStatus !== 200) return { ok: false, status: servedStatus } as Response;
  if (served === "THROW") throw new Error("network down");
  return { ok: true, status: 200, json: async () => served } as Response;
}) as typeof fetch;

const CONTRACT = {
  releaseVersion: "1.4.0",
  gitSha: "b".repeat(40),
  buildTimestamp: "2026-09-13T12:00:00.000Z",
  backendVersion: "1.4.0",
  frontendVersion: "1.4.0",
  minimumSupportedFrontendVersion: "1.2.0",
  schemaCompatibilityVersion: "1800000021000",
  versionSourceStatus: "RENDER_GIT_COMMIT",
  buildTimestampSourceStatus: "BUILD_TIMESTAMP",
};

function reset() {
  resetReleaseStatusForTests();
  fetchCalls = 0;
  servedStatus = 200;
  served = null;
  resolveGate = null;
  intervals.length = 0;
  visibilityListeners.clear();
  visibility = "visible";
}

async function main() {
  console.log("\n§279 — CLIENT VERSION CHECK\n");

  // The client's own version comes from the build. Under tsx it is whatever the environment says,
  // and the whole suite depends on knowing it, so it is asserted rather than assumed.
  const { buildIdentity } = await import("../buildIdentity");
  check(
    buildIdentity.frontendVersion === process.env.NEXT_PUBLIC_FRONTEND_VERSION,
    `the client reports the build-supplied version (${buildIdentity.frontendVersion})`,
  );

  // =============================================================================================
  // F. THE SERVER IS UNAVAILABLE. The client must not claim to be obsolete.
  // =============================================================================================
  reset();
  served = "THROW";
  let status = await checkReleaseVersion();
  check(status.result.state === "UNKNOWN", "F1 an unreachable server leaves the client UNKNOWN");
  check(!status.result.blocksSafetyCriticalWrites, "F2 and blocks nothing");
  check(!blocksMutation("POST", "https://api.example.test/inspections"), "F3 so a write still goes through");

  reset();
  servedStatus = 503;
  status = await checkReleaseVersion();
  check(status.result.state === "UNKNOWN", "F4 a 503 from a restarting instance is also UNKNOWN");
  check(!blocksMutation("POST", "https://api.example.test/inspections"), "F5 and still blocks nothing");

  // =============================================================================================
  // A / C. A live answer is believed.
  // =============================================================================================
  reset();
  served = { ...CONTRACT, frontendVersion: buildIdentity.frontendVersion };
  status = await checkReleaseVersion();
  check(status.result.state === "CURRENT", `A1 a matching server reports CURRENT (${status.result.state})`);
  check(status.checkedAt !== null, "A2 and the check is stamped, so staleness can be measured");

  reset();
  served = { ...CONTRACT, frontendVersion: "99.0.0", minimumSupportedFrontendVersion: "0.0.1" };
  status = await checkReleaseVersion();
  check(status.result.state === "UPDATE_AVAILABLE", "C1 a newer server release reports UPDATE_AVAILABLE");
  check(!status.result.blocksSafetyCriticalWrites, "C2 and does not block work");

  // =============================================================================================
  // D / E. A blocked client. Writes refused, reads and sign-out preserved.
  // =============================================================================================
  reset();
  served = { ...CONTRACT, frontendVersion: "99.0.0", minimumSupportedFrontendVersion: "99.0.0" };
  status = await checkReleaseVersion();
  check(status.result.state === "UPDATE_REQUIRED", "D1 a client below the floor is UPDATE_REQUIRED");
  check(blocksMutation("POST", "https://api.example.test/inspections"), "E1 a POST is refused");
  check(blocksMutation("PATCH", "https://api.example.test/tasks/1/status"), "E2 a PATCH is refused");
  check(blocksMutation("DELETE", "https://api.example.test/tasks/1"), "E3 a DELETE is refused");
  check(!blocksMutation("GET", "https://api.example.test/inspections"), "E4 but a READ is not — an inspector must still be able to open the record in front of them");
  check(!blocksMutation(undefined, "https://api.example.test/inspections"), "E5 and a request with no method defaults to a read, not to a refusal");
  check(!blocksMutation("POST", "https://api.example.test/auth/logout"), "E6 signing out is never blocked — a gate that trapped a user would be worse than the staleness");
  check(!blocksMutation("POST", "https://api.example.test/auth/refresh"), "E7 nor is a session refresh, which is how a client recovers");
  check(!blocksMutation("GET", "https://api.example.test/version"), "E8 nor the version check itself");

  // =============================================================================================
  // G. A TAB WAKES AFTER A RELEASE.
  //
  // The §279 Part A risk, exactly: a tab open for days. The watch must re-ask when it comes back,
  // and must NOT re-ask on every flick between tabs.
  // =============================================================================================
  reset();
  served = { ...CONTRACT, frontendVersion: buildIdentity.frontendVersion };
  const seen: string[] = [];
  const unsubscribe = subscribeToReleaseStatus((next) => seen.push(next.result.state));
  const stop = startReleaseVersionWatch();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check(fetchCalls === 1, `G1 starting the watch checks once (${fetchCalls})`);
  check(getReleaseStatus().result.state === "CURRENT", "G2 and the tab is current");

  // The user switches away and straight back. Nothing can have changed; nothing should be spent.
  visibility = "hidden";
  for (const fn of visibilityListeners) fn();
  visibility = "visible";
  for (const fn of visibilityListeners) fn();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check(fetchCalls === 1, `G3 a quick tab switch spends no request (${fetchCalls})`);

  // Now the tab has genuinely been away, and a release has happened while it was.
  resetStaleness();
  served = { ...CONTRACT, frontendVersion: "99.0.0", minimumSupportedFrontendVersion: "99.0.0" };
  for (const fn of visibilityListeners) fn();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check(fetchCalls === 2, `G4 returning after ${STALE_AFTER_MS / 60000} minutes re-checks (${fetchCalls})`);
  check(getReleaseStatus().result.state === "UPDATE_REQUIRED", "G5 and the woken tab discovers it is no longer supported");
  check(blocksMutation("POST", "https://api.example.test/inspections"), "G6 and stops writing from that moment");

  // A hidden tab is not worth a field connection.
  resetStaleness();
  visibility = "hidden";
  for (const fn of visibilityListeners) fn();
  await new Promise((resolve) => setTimeout(resolve, 0));
  check(fetchCalls === 2, `G7 a hidden tab checks nothing (${fetchCalls})`);
  visibility = "visible";

  check(
    intervals.length === 1 && intervals[0].ms === BACKGROUND_INTERVAL_MS,
    `G8 exactly one background schedule, at ${BACKGROUND_INTERVAL_MS / 60000} minutes (${intervals.map((i) => i.ms).join(",")})`,
  );

  stop();
  check(visibilityListeners.size === 0, "G9 stopping the watch removes its listener rather than leaking one per mount");
  unsubscribe();

  // =============================================================================================
  // J. NO DUPLICATE OR REPEATED NOTICES.
  //
  // Boot, session restore, visibility and the interval can coincide. Four triggers must not
  // produce four requests, and a re-check that finds the same answer must not announce it again.
  // =============================================================================================
  reset();
  served = { ...CONTRACT, frontendVersion: "99.0.0", minimumSupportedFrontendVersion: "0.0.1" };
  resolveGate = () => {};
  const concurrent = Promise.all([
    checkReleaseVersion(),
    checkReleaseVersion(),
    checkReleaseVersion(),
    checkReleaseVersion(),
  ]);
  resolveGate?.();
  resolveGate = null;
  const results = await concurrent;
  check(fetchCalls === 1, `J1 four simultaneous triggers make ONE request (${fetchCalls})`);
  check(
    results.every((r) => r.result.state === "UPDATE_AVAILABLE"),
    "J2 and all four callers get the same answer",
  );

  const announced: string[] = [];
  const off = subscribeToReleaseStatus((next) => announced.push(next.result.state));
  await checkReleaseVersion();
  await checkReleaseVersion();
  check(
    announced.length === 2 && new Set(announced).size === 1,
    `J3 repeated checks publish the same state rather than a changing one, so the banner renders identically (${announced.join(",")})`,
  );
  off();

  console.log(`\n${checks - failures.length} passed, ${failures.length} failed.`);
  if (failures.length) {
    console.error(`\nFAILED:\n  ${failures.join("\n  ")}`);
    console.error(
      "A client may stop writing only on positive evidence from the server, and must keep working "
      + "whenever no such evidence could be obtained.",
    );
    process.exit(1);
  }
  console.log("§279 client version check: PASS");
}

/**
 * Ages the last check past the staleness window without waiting fifteen real minutes. It reaches
 * into the published status rather than mocking the clock, because the clock is not what is being
 * measured — the decision to re-ask is.
 */
function resetStaleness() {
  const status = getReleaseStatus() as { checkedAt: number | null };
  status.checkedAt = Date.now() - STALE_AFTER_MS - 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

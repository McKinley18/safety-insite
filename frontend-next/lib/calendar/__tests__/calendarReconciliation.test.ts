/**
 * §276 — THE BROWSER HALF OF THE D-007 RELEASE GATE.
 *
 * Runs with `npx tsx lib/calendar/__tests__/calendarReconciliation.test.ts` (no test runner
 * is configured in this workspace, so this is a self-checking script — the same convention
 * as `lib/expert/__tests__/expertPresentation.test.ts`).
 *
 * ==================== WHY THIS EXISTS SEPARATELY FROM THE SERVER GATE ====================
 *
 * `backend/scripts/test-276-calendar-reconciliation.ts` proves the server returns the
 * persisted schedule. It cannot prove the browser ASKS. §275's defect lived entirely on
 * this side: the server was returning nine rows the whole time and the page composed its
 * calendar from three device-local stores instead, so a passing server suite would have
 * reported everything healthy while the user saw "0 EVENTS".
 *
 * The assertions that matter here are therefore about WHERE the events come from:
 *
 *   L  the local stores are empty and the server has events -> the events are shown
 *   J  an item created offline is visible, marked pending, syncs, and does NOT duplicate
 *      the server row it became
 *      -- plus: an unreachable server is never reported as an empty schedule
 */
import {
  CALENDAR_CACHE_KEY,
  CALENDAR_MIGRATED_LOCAL_IDS_KEY,
  CALENDAR_OUTBOX_KEY,
} from "../calendarOutbox";
import { PERSONAL_CALENDAR_EVENTS_KEY } from "../../safetyCalendar";

const failures: string[] = [];
let checks = 0;
function check(condition: unknown, message: string) {
  checks += 1;
  if (condition) {
    console.log(`ok    ${message}`);
  } else {
    failures.push(message);
    console.log(`FAIL  ${message}`);
  }
}

// =========================================================================================
// A MINIMAL BROWSER. localStorage and fetch are the only two globals the reconciler uses;
// everything else it touches is its own code.
// =========================================================================================
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string) { return this.map.has(key) ? (this.map.get(key) as string) : null; }
  setItem(key: string, value: string) { this.map.set(key, String(value)); }
  removeItem(key: string) { this.map.delete(key); }
  clear() { this.map.clear(); }
  key(index: number) { return Array.from(this.map.keys())[index] ?? null; }
  get length() { return this.map.size; }
}

type ServerRow = Record<string, unknown> & { sourceId: string; date: string; title: string };
type CreatedTask = { title: string; dueDate: string; priority: string; description?: string };

const storage = new MemoryStorage();
const testGlobal = globalThis as unknown as Record<string, unknown>;
testGlobal.window = globalThis;
testGlobal.localStorage = storage;
(testGlobal.window as Record<string, unknown>).localStorage = storage;

/** The server, scripted. `reachable=false` makes every call throw, as an outage does. */
const server: {
  reachable: boolean;
  rows: ServerRow[];
  created: CreatedTask[];
} = { reachable: true, rows: [], created: [] };

function dayKey(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function serverRow(over: Record<string, unknown>): ServerRow {
  return {
    kind: "task",
    sourceId: `row-${server.rows.length + 1}`,
    date: dayKey(3),
    title: "Server row",
    description: null,
    status: "open",
    priority: "high",
    owner: null,
    inspectionId: null,
    correctiveActionId: null,
    findingId: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    editable: true,
    ...over,
  } as ServerRow;
}

testGlobal.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const url = String(input);
  if (!server.reachable) throw new TypeError("fetch failed");
  const method = (init.method || "GET").toUpperCase();

  if (url.endsWith("/calendar") && method === "GET") {
    return new Response(JSON.stringify(server.rows), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (url.endsWith("/tasks") && method === "POST") {
    const body = JSON.parse(String(init.body || "{}")) as CreatedTask;
    const row = serverRow({
      sourceId: `synced-${server.created.length + 1}`,
      title: body.title,
      date: body.dueDate,
      priority: body.priority,
    });
    server.created.push(body);
    server.rows.push(row);
    return new Response(JSON.stringify({ id: row.sourceId }), { status: 201, headers: { "content-type": "application/json" } });
  }
  return new Response("{}", { status: 404 });
};

// The reconciler asks `getAuthToken()` before it will call the server at all -- an
// unauthenticated page must not present an empty calendar as "nothing is due".
storage.setItem("sentinel_auth_token", "test-token");

async function run() {
  // Imported AFTER the globals exist: the modules read `typeof window` at call time, but
  // `lib/auth` and `lib/hazlenzClient` touch the environment as they initialise.
  const { getSafetyCalendarSnapshot, createPersonalCalendarTask } = await import("../../safetyCalendar");

  // =======================================================================================
  // SCENARIO L — THE §275 CASE, INVERTED.
  //
  // The device knows nothing. The server has work. §275's page would have shown zero here,
  // because zero was all it could ever show: it never asked.
  // =======================================================================================
  console.log("\n--- L: server has events, the device has none ---");
  storage.clear();
  storage.setItem("sentinel_auth_token", "test-token");
  server.reachable = true;
  server.rows = [
    serverRow({ sourceId: "task-1", title: "Follow up reviewed finding 1", date: dayKey(2) }),
    serverRow({ sourceId: "task-2", title: "Follow up reviewed finding 2", date: dayKey(2) }),
    serverRow({
      kind: "corrective_action", sourceId: "action-1", title: "Verify and correct reviewed condition",
      date: dayKey(1), priority: "urgent", editable: false, inspectionId: "insp-1",
    }),
  ];

  let snapshot = await getSafetyCalendarSnapshot();
  check(snapshot.events.length === 3, `L1 all three server events are shown (got ${snapshot.events.length})`);
  check(snapshot.serverReachable === true, "L2 the read is reported as live");
  check(snapshot.servedFromCache === false, "L3 and not from cache");
  check(
    snapshot.events.every((event) => event.origin === "server"),
    "L4 every event is stamped as server-backed",
  );
  check(
    snapshot.events.filter((event) => event.source === "corrective_action").length === 1,
    "L5 the corrective action is present as a corrective action",
  );
  check(
    snapshot.events.find((event) => event.sourceId === "action-1")?.editable === false,
    "L6 and the server's answer on whether the calendar may edit it is copied, not derived",
  );
  check(
    snapshot.events[0].date <= snapshot.events[1].date,
    "L7 events are ordered by day",
  );

  // =======================================================================================
  // AN UNREACHABLE SERVER IS NOT AN EMPTY SCHEDULE.
  //
  // This is the distinction §275's page could not draw. The cache is what the server last
  // said, and the snapshot says plainly that it is a cache.
  // =======================================================================================
  console.log("\n--- offline: the last known schedule, labelled ---");
  server.reachable = false;
  snapshot = await getSafetyCalendarSnapshot();
  check(snapshot.serverReachable === false, "O1 the snapshot reports the server was not reached");
  check(snapshot.servedFromCache === true, "O2 and that what is shown came from the cache");
  check(snapshot.events.length === 3, `O3 the persisted work is still visible (got ${snapshot.events.length})`);
  check(snapshot.reason === "unreachable", `O4 with the reason it failed (got ${snapshot.reason})`);

  // =======================================================================================
  // SCENARIO J — OFFLINE CREATE, THEN SYNC, AND NO DUPLICATE.
  // =======================================================================================
  console.log("\n--- J: created offline, synced, not duplicated ---");
  const offlineDay = dayKey(6);
  const pending = await createPersonalCalendarTask({
    title: "Scheduled while offline",
    date: offlineDay,
    priority: "High",
  });
  check(pending.origin === "pending", `J1 an item created offline is pending (got ${pending.origin})`);
  check(pending.sourceLabel === "Pending sync", `J2 and says so (got "${pending.sourceLabel}")`);

  snapshot = await getSafetyCalendarSnapshot();
  check(snapshot.events.length === 4, `J3 it is visible alongside the cached server work (got ${snapshot.events.length})`);
  check(snapshot.pendingCount === 1, `J4 and is counted as unsynced (got ${snapshot.pendingCount})`);
  check(
    snapshot.events.filter((event) => event.title === "Scheduled while offline").length === 1,
    "J5 exactly one copy of it exists",
  );

  // The server comes back. The queue flushes on the next read.
  server.reachable = true;
  snapshot = await getSafetyCalendarSnapshot();

  check(server.created.length === 1, `J6 the queued item was sent exactly once (got ${server.created.length})`);
  check(
    server.created[0]?.dueDate === offlineDay,
    `J7 with the day the user chose (got ${server.created[0]?.dueDate} vs ${offlineDay})`,
  );
  check(
    snapshot.events.filter((event) => event.title === "Scheduled while offline").length === 1,
    "J8 AFTER SYNC THERE IS STILL EXACTLY ONE COPY — the local and server copies collapsed",
  );
  check(
    snapshot.events.find((event) => event.title === "Scheduled while offline")?.origin === "server",
    "J9 and the surviving copy is the server's",
  );
  check(snapshot.pendingCount === 0, `J10 nothing is left pending (got ${snapshot.pendingCount})`);
  check(
    JSON.parse(storage.getItem(CALENDAR_OUTBOX_KEY) || "[]").length === 0,
    "J11 and the outbox is empty rather than holding a synced duplicate",
  );

  // A second read must not re-send it. An outbox that re-posts what it already synced is a
  // duplicate factory on a compliance record.
  const sentBefore = server.created.length;
  await getSafetyCalendarSnapshot();
  check(server.created.length === sentBefore, "J12 a later read does not re-send a synced item");

  // =======================================================================================
  // ONLINE CREATE. The server is the first writer; the outbox is the fallback, not the path.
  // =======================================================================================
  console.log("\n--- online create goes straight to the server ---");
  const online = await createPersonalCalendarTask({
    title: "Scheduled while online",
    date: dayKey(8),
    priority: "Medium",
  });
  check(online.origin === "server", `S1 an online create is server-backed immediately (got ${online.origin})`);
  check(
    JSON.parse(storage.getItem(CALENDAR_OUTBOX_KEY) || "[]").length === 0,
    "S2 and never enters the pending queue",
  );
  snapshot = await getSafetyCalendarSnapshot();
  check(
    snapshot.events.filter((event) => event.title === "Scheduled while online").length === 1,
    "S3 one copy on the calendar",
  );

  // =======================================================================================
  // THE LEGACY LOCAL STORE IS MIGRATED ONCE, NOT READ FOREVER.
  //
  // The pre-§276 personal-task store still has a writer, so its records are moved onto the
  // server rather than dropped -- and the per-record ledger is what stops the second read
  // from sending them again.
  // =======================================================================================
  console.log("\n--- legacy device records migrate once ---");
  storage.setItem(
    PERSONAL_CALENDAR_EVENTS_KEY,
    JSON.stringify([
      { id: "personal-legacy-1", title: "Legacy personal task", date: dayKey(10), priority: "Low" },
    ]),
  );
  const sentBeforeMigration = server.created.length;
  snapshot = await getSafetyCalendarSnapshot();
  check(
    server.created.length === sentBeforeMigration + 1,
    `M1 the legacy record is sent to the server once (got ${server.created.length - sentBeforeMigration})`,
  );
  check(
    snapshot.events.filter((event) => event.title === "Legacy personal task").length === 1,
    "M2 and appears exactly once on the calendar",
  );
  const sentAfterMigration = server.created.length;
  await getSafetyCalendarSnapshot();
  check(
    server.created.length === sentAfterMigration,
    "M3 a second read does not migrate it again",
  );
  check(
    JSON.parse(storage.getItem(CALENDAR_MIGRATED_LOCAL_IDS_KEY) || "[]").includes("personal:personal-legacy-1"),
    "M4 because the record is named in the migration ledger",
  );

  // =======================================================================================
  // NO SESSION. An unauthenticated page must not claim the schedule is empty.
  // =======================================================================================
  console.log("\n--- no session ---");
  storage.clear();
  snapshot = await getSafetyCalendarSnapshot();
  check(snapshot.serverReachable === false, "N1 no session means the server was not read");
  check(snapshot.reason === "no_session", `N2 and the reason says so (got ${snapshot.reason})`);
  check(snapshot.events.length === 0, "N3 with nothing shown, because nothing is known");

  check(Boolean(CALENDAR_CACHE_KEY), "Z1 the cache key is exported for the sign-out sweep");

  console.log(`\n${checks - failures.length}/${checks} checks passed.`);
  if (failures.length) {
    console.error(`\nFAILED (${failures.length}):`);
    failures.forEach((f) => console.error(`  - ${f}`));
    console.error(
      "\nD-007 is the defect this gate exists to hold closed: persisted due work that never "
      + "reaches the user's calendar. §275 measured 9 server rows against 0 displayed events.",
    );
    process.exit(1);
  }
  console.log("§276 D-007 browser reconciliation: PASS");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

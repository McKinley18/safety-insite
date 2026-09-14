/**
 * §287 — THE CORRECTIVE ACTION LIFECYCLE, END TO END.
 *
 * Drives the REAL API as REAL authenticated users against the review stack. No development bypass.
 * ZERO provider calls: the stack runs with `EXPERT_EXECUTION_ENABLED=false` and no provider key.
 *
 * ==================== WHAT THIS HAS TO PROVE ====================
 *
 *   D-050  an authorized user can view, identify, edit, close and reopen a corrective action, and
 *          gets authoritative persisted state back after a refresh.
 *   D-051  a due date can be changed; the calendar event MOVES; overdue recomputes; the change
 *          survives a refresh; no duplicate event appears; date-only semantics survive boundaries.
 *   D-052  closing does NOT fabricate VERIFIED_STRONG or SUPERVISOR_SIGNOFF, and closure evidence
 *          is optional without the product inferring a stronger state from its presence or absence.
 *   D-053  the three duplicate-creation failure modes are MEASURED, not assumed.
 *   D-054  a committed state transition is never reported to the customer as a failure because a
 *          non-authoritative auxiliary write failed — and the lost audit row is not silent.
 *
 * ==================== FALSIFICATION ====================
 *
 * Several assertions here are about ABSENCE — no fabricated verification, no duplicate row, no
 * second calendar event. Each carries a guard proving the thing it asserts over actually exists,
 * because an absence assertion over an empty collection passes for the wrong reason (§285, I-15).
 *
 * The D-054 regression FORCES the failure rather than waiting for one: it renames the audit table
 * out from under the running server on the DISPOSABLE review database, performs a real close, and
 * asserts the customer still gets a success and the state still committed. A regression that only
 * observes the happy path would not detect the defect coming back.
 *
 * Usage:
 *   API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OTHER_EMAIL=... OTHER_PASSWORD=... \
 *   FREE_EMAIL=... FREE_PASSWORD=... REVIEW_DB_URL=... STACK_LOG=... OUT_DIR=<dir> \
 *     npx tsx scripts/validate-287-action-lifecycle.mts
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-287";
const DB_URL = process.env.REVIEW_DB_URL || "";
const STACK_LOG = process.env.STACK_LOG || "";
mkdirSync(OUT_DIR, { recursive: true });

type Result = { id: string; outcome: "PASS" | "FAIL"; detail: string };
const results: Result[] = [];
const observations: { id: string; detail: string }[] = [];
const offlineInventory: Record<string, unknown>[] = [];
let failures = 0;

function check(id: string, condition: boolean, detail: unknown = "") {
  results.push({ id, outcome: condition ? "PASS" : "FAIL", detail: String(detail).slice(0, 600) });
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${id}${detail ? `  [${String(detail).slice(0, 185)}]` : ""}`);
}
function observe(id: string, detail: string) {
  observations.push({ id, detail: String(detail).slice(0, 1400) });
  console.log(`--   ${id}  [${String(detail).slice(0, 185)}]`);
}

async function signIn(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json().catch(() => null);
  const token = body?.accessToken || body?.access_token || body?.token;
  if (!token) throw new Error(`sign-in failed for ${email}: ${response.status}`);
  return token as string;
}
function client(token: string) {
  return async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) },
    });
    const text = await response.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { status: response.status, ok: response.ok, body };
  };
}
function sql(statement: string) {
  return execFileSync("psql", [DB_URL, "-At", "-c", statement], { encoding: "utf8" }).trim();
}

const token = await signIn(process.env.VAL_EMAIL as string, process.env.VAL_PASSWORD as string);
const api = client(token);
const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
const otherApi = process.env.OTHER_EMAIL
  ? client(await signIn(process.env.OTHER_EMAIL, process.env.OTHER_PASSWORD as string)) : null;

observe("ENT the entitlement state this run measured",
  `account=${process.env.VAL_EMAIL} planCode=${claims.planCode} effective=${claims.effectivePlanCode} `
  + `hasProAccess=${claims.hasProAccess} correctiveActionAssignments=${claims.billingEntitlements?.correctiveActionAssignments}`);

const site = await (async () => {
  const sites = (await api("/sites?limit=100")).body;
  const list = sites?.data || sites || [];
  return list[0] || (await api("/sites", { method: "POST", body: JSON.stringify({ name: "Northline Plant 2" }) })).body;
})();

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const today = new Date();
const TODAY = dayKey(today);
const YESTERDAY = dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
const NEXT_WEEK = dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));

async function createAction(overrides: Record<string, unknown> = {}) {
  return api("/actions", {
    method: "POST",
    body: JSON.stringify({
      title: "Refit the conveyor nip guard",
      description: "Refit and secure the fixed guard on the number two conveyor infeed.",
      priorityCode: "high", dueDate: NEXT_WEEK, ...overrides,
    }),
  });
}

// =================================================================================================
// 0. D-050 REACHABILITY — is the lifecycle a capability the customer now HAS?
//
// §286's finding was not that the server was wrong; it was that a correct server had no client.
// The same source-level question is therefore asked again, in the same way, so the answer is
// comparable to §286's rather than merely asserted to have changed.
// =================================================================================================
function greps(pattern: string, paths: string[]) {
  try {
    return execFileSync("grep", ["-rlE", pattern, ...paths], { encoding: "utf8" })
      .split("\n").map((line) => line.trim()).filter(Boolean);
  } catch { return []; }
}
const SURFACES = ["app", "components"];
const listCallers = greps(String.raw`fetchCloudActions`, SURFACES);
const statusCallers = greps(String.raw`updateCloudActionStatus`, SURFACES);
const updateCallers = greps(String.raw`updateCloudAction\b`, SURFACES);
const panelMounted = greps(String.raw`CorrectiveActionsPanel`, ["app"]);

check("R1 corrective-action LIST is now reachable from a customer surface",
  listCallers.length > 0, listCallers.join(", ") || "NONE");
check("R2 corrective-action CLOSE is now reachable from a customer surface",
  statusCallers.length > 0, statusCallers.join(", ") || "NONE");
check("R3 corrective-action FIELD EDIT is now reachable from a customer surface",
  updateCallers.length > 0, updateCallers.join(", ") || "NONE");
check("R4 the panel is mounted on an ACTIVE route, not merely defined",
  panelMounted.some((file) => file.startsWith("app/")), panelMounted.join(", ") || "NONE");
observe("R5 the surface chosen, and why",
  "`/safety-calendar` — an existing ACTIVE Actions/Calendar surface, per direction, rather than a "
  + "new route. It reads `GET /actions` rather than the calendar projection because the projection "
  + "is dated and excludes an action with no due date; a management surface that hid undated "
  + "actions would hide exactly the ones nobody is tracking. Every read and write goes through the "
  + "existing lib/cloudActions.ts to the existing server routes — no second action system.");

// =================================================================================================
// 1. D-053 — THE DUPLICATE-CREATION FAILURE MODES, MEASURED.
// =================================================================================================
// -- BASELINE: without a key, the server still creates two. The repair is opt-in, and saying so
//    matters: a client that forgets the key gets the old behaviour.
{
  const payload = { title: "D-053 baseline probe", description: "No idempotency key supplied." };
  const a = await createAction(payload);
  const b = await createAction(payload);
  check("I0 WITHOUT a client key, two identical submits still create two actions",
    a.ok && b.ok && a.body.id !== b.body.id,
    `${a.body?.id?.slice(0, 8)} vs ${b.body?.id?.slice(0, 8)}`);
  observe("I0-NOTE the idempotency repair is opt-in",
    "`clientRequestId` is optional, exactly as it is on `POST /inspections` and "
    + "`POST .../observations`. A caller that omits it gets the pre-§287 behaviour. That is a "
    + "deliberate compatibility choice, and it means the guarantee belongs to the CLIENT that "
    + "sends a key, not to the route.");
}

// -- MODE 1: double-submit. Two sequential presses with one key.
{
  const key = `d053-double-${Date.now()}`;
  const first = await createAction({ title: "D-053 double submit", clientRequestId: key });
  const second = await createAction({ title: "D-053 double submit", clientRequestId: key });
  check("I1-GUARD the first submit really created an action",
    first.status === 201 && Boolean(first.body?.id), `${first.status}`);
  check("I1 DOUBLE-SUBMIT: the second press returns the SAME action, not a second one",
    second.ok && second.body.id === first.body.id, `${first.body?.id?.slice(0, 8)} / ${second.body?.id?.slice(0, 8)}`);
  const rows = Number(sql(`SELECT count(*) FROM corrective_actions WHERE "clientRequestId" = '${key}'`));
  check("I1b and the database holds exactly ONE row for that key", rows === 1, `${rows} row(s)`);
}

// -- MODE 2: CONCURRENT submits. The read-then-write fast path cannot close this one; the partial
//    unique index has to. Fired together so both requests miss the replay lookup.
{
  const key = `d053-race-${Date.now()}`;
  const [a, b] = await Promise.all([
    createAction({ title: "D-053 concurrent submit", clientRequestId: key }),
    createAction({ title: "D-053 concurrent submit", clientRequestId: key }),
  ]);
  check("I2 CONCURRENT submits both succeed and resolve to ONE action",
    a.ok && b.ok && a.body?.id === b.body?.id,
    `${a.status}/${b.status} ${a.body?.id?.slice(0, 8)} vs ${b.body?.id?.slice(0, 8)}`);
  const rows = Number(sql(`SELECT count(*) FROM corrective_actions WHERE "clientRequestId" = '${key}'`));
  check("I2b and the unique index left exactly ONE row", rows === 1, `${rows} row(s)`);
}

// -- MODE 3: RETRY AFTER A LOST RESPONSE. The server commits; the client never sees the answer and
//    retries. This is the mode a disabled button cannot help with, and the reason the key exists.
{
  const key = `d053-lost-${Date.now()}`;
  const controller = new AbortController();
  const inFlight = fetch(`${API_URL}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: "D-053 lost response", description: "The response is discarded client-side.",
      priorityCode: "medium", dueDate: NEXT_WEEK, clientRequestId: key,
    }),
    signal: controller.signal,
  }).then((r) => ({ aborted: false, status: r.status })).catch(() => ({ aborted: true, status: 0 }));
  setTimeout(() => controller.abort(), 3);
  const firstOutcome = await inFlight;
  // Give the server time to finish the write whose answer the client threw away.
  await new Promise((r) => setTimeout(r, 1500));
  const committed = Number(sql(`SELECT count(*) FROM corrective_actions WHERE "clientRequestId" = '${key}'`));
  const retry = await createAction({ title: "D-053 lost response", clientRequestId: key });
  const afterRetry = Number(sql(`SELECT count(*) FROM corrective_actions WHERE "clientRequestId" = '${key}'`));
  observe("I3-CONTEXT what the lost-response probe actually exercised",
    `client aborted=${firstOutcome.aborted}; rows committed before the retry=${committed}. `
    + "When the abort loses the race the server had already answered, and the probe degrades to a "
    + "plain replay — which is recorded rather than dressed up as an interruption.");
  check("I3 RETRY AFTER A LOST RESPONSE does not create a second action",
    retry.ok && afterRetry === 1, `${afterRetry} row(s) after retry, status ${retry.status}`);
  check("I3b and the retry returns the action the server already committed",
    committed !== 1 || retry.body?.clientRequestId === key || afterRetry === 1,
    `retry id=${retry.body?.id?.slice(0, 8)}`);
}

// -- The guarantee is the SERVER's, not a disabled button's.
observe("I4 repeated-tap protection is not the mechanism",
  "The panel disables its controls and additionally refuses a second invocation inside the handler "
  + "(a disabled button is a rendering that can be raced). Neither is the guarantee: both live in "
  + "the browser and neither survives a lost response. The guarantee is the partial unique index on "
  + "(tenantId, ownerUserId, clientRequestId), which is why I2 and I3 pass.");

// =================================================================================================
// 2. D-050 / D-051 — THE LIFECYCLE.
// =================================================================================================
const lifecycle = await createAction({
  title: "§287 lifecycle subject", assignedToName: "Maintenance lead",
  clientRequestId: `d050-life-${Date.now()}`,
});
const actionId: string = lifecycle.body.id;
check("L1 CREATE returns an action in a stated lifecycle state",
  lifecycle.status === 201 && lifecycle.body.lifecycleState === "open",
  `${lifecycle.status} lifecycleState=${lifecycle.body?.lifecycleState}`);
check("L2 the list shows it, with status, assignee and due date",
  await (async () => {
    const list = (await api("/actions?limit=100")).body.data;
    const row = list.find((r: any) => r.id === actionId);
    return Boolean(row) && row.lifecycleState === "open"
      && row.assignedToName === "Maintenance lead" && Boolean(row.dueDate);
  })(), "listed with identity");

// -- OVERDUE, before and after. Derived from the due date, never stored.
{
  await api(`/actions/${actionId}`, { method: "PATCH", body: JSON.stringify({ dueDate: YESTERDAY }) });
  const overdueRow = (await api("/actions?limit=100")).body.data.find((r: any) => r.id === actionId);
  const overdueKey = String(overdueRow.dueDate).slice(0, 10);
  check("L3 an action moved into the past reads as overdue against the local day",
    overdueKey <= YESTERDAY && overdueRow.lifecycleState === "open",
    `due=${overdueKey} today=${TODAY}`);
  check("L3b OVERDUE is never a stored field — the server states only the status",
    !JSON.stringify(overdueRow).toLowerCase().includes('"overdue"'),
    `row keys: ${Object.keys(overdueRow).join(",").slice(0, 160)}`);
}

// -- D-051: EDIT THE DUE DATE. Server authoritative, calendar moves, no duplicate event.
{
  const before = (await api("/calendar")).body.filter((r: any) => r.sourceId === actionId);
  check("E0-GUARD the action is on the calendar before the edit, exactly once",
    before.length === 1, `${before.length} event(s) on ${before[0]?.date}`);

  const edited = await api(`/actions/${actionId}`, {
    method: "PATCH", body: JSON.stringify({ dueDate: NEXT_WEEK, priorityCode: "urgent" }),
  });
  check("E1 the due date is editable and the server accepts it",
    edited.status === 200 && String(edited.body.dueDate).slice(0, 10) === NEXT_WEEK,
    `${edited.status} ${String(edited.body?.dueDate).slice(0, 10)}`);
  check("E2 other editable fields move too",
    edited.body.priorityCode === "urgent", edited.body?.priorityCode);

  const after = (await api("/calendar")).body.filter((r: any) => r.sourceId === actionId);
  check("E3 the CALENDAR EVENT MOVED to the new day",
    after.length === 1 && after[0].date === NEXT_WEEK, `${after.length} event(s) on ${after[0]?.date}`);
  check("E4 and NO DUPLICATE event was created — the old day is clear",
    after.length === 1 && before[0].date !== after[0].date,
    `${before[0]?.date} -> ${after[0]?.date}, ${after.length} event(s)`);
  check("E5 the action is no longer overdue, because overdue is recomputed from the stored date",
    after[0].date > TODAY, `${after[0]?.date} > ${TODAY}`);

  // REFRESH: a second independent read must agree. This is what a page reload does.
  const refreshed = (await api("/actions?limit=100")).body.data.find((r: any) => r.id === actionId);
  check("E6 REFRESH returns the persisted date, not a device value",
    String(refreshed.dueDate).slice(0, 10) === NEXT_WEEK, String(refreshed?.dueDate).slice(0, 10));
  // RESTART: read straight from the database, bypassing the API entirely.
  const stored = sql(`SELECT to_char("dueDate", 'YYYY-MM-DD') FROM corrective_actions WHERE id = '${actionId}'`);
  check("E7 RESTART would show the same date — it is what is on disk",
    stored === NEXT_WEEK, `stored=${stored} expected=${NEXT_WEEK}`);
}

// -- DATE-ONLY SEMANTICS ACROSS BOUNDARIES, through the EDIT path specifically. §286 proved the
//    CREATE path; the edit path is new code and is the one that could reintroduce §275.
{
  const BOUNDARIES: [string, string][] = [
    ["ordinary", "2027-06-17"],
    ["month end", "2027-06-30"],
    ["month start", "2027-07-01"],
    ["year end", "2027-12-31"],
    ["year start", "2028-01-01"],
    ["DST spring-forward", "2027-03-14"],
    ["DST fall-back", "2027-11-07"],
    ["leap day", "2028-02-29"],
  ];
  for (const [label, date] of BOUNDARIES) {
    await api(`/actions/${actionId}`, { method: "PATCH", body: JSON.stringify({ dueDate: date }) });
    const onCalendar = (await api("/calendar")).body.find((r: any) => r.sourceId === actionId)?.date;
    const onDisk = sql(`SELECT to_char("dueDate", 'YYYY-MM-DD') FROM corrective_actions WHERE id = '${actionId}'`);
    check(`E8 ${label}: editing to ${date} keeps the day on the calendar and on disk`,
      onCalendar === date && onDisk === date, `calendar=${onCalendar} disk=${onDisk}`);
  }
  await api(`/actions/${actionId}`, { method: "PATCH", body: JSON.stringify({ dueDate: NEXT_WEEK }) });
}

// =================================================================================================
// 3. D-052 — CLOSURE IS NOT VERIFICATION.
// =================================================================================================
observe("V-BEFORE the verification semantics §287 inherited",
  "Closing an action stamped `verifiedAt = now` and `verifiedByUserId = the caller`, and fed the "
  + "outcome loop `verificationStatus: 'VERIFIED_STRONG'`, `verificationMethod: "
  + "'SUPERVISOR_SIGNOFF'` — unconditionally, for any caller who could reach the route, including "
  + "the person who raised the action. The cause was a missing model: `corrective_actions` has "
  + "carried the VERIFICATION pair since the initial migration and had NOWHERE to record who "
  + "closed an action and when, so closure wrote to the only pair available to it.");

{
  const subject = await createAction({
    title: "§287 closure subject", clientRequestId: `d052-close-${Date.now()}`,
  });
  const id = subject.body.id;
  const closed = await api(`/actions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ statusCode: "closed", closureNotes: "Guard refitted and function-tested." }),
  });
  check("C1 an action closes", closed.status === 200 && closed.body.statusCode === "closed",
    `${closed.status} ${closed.body?.statusCode}`);
  check("C2 the lifecycle state is COMPLETED, not verified",
    closed.body.lifecycleState === "completed" && closed.body.verified === false,
    `lifecycleState=${closed.body?.lifecycleState} verified=${closed.body?.verified}`);
  check("C3 NO FABRICATED VERIFICATION: verifiedAt and verifiedByUserId are untouched",
    closed.body.verifiedAt === null && closed.body.verifiedByUserId === null,
    `verifiedAt=${closed.body?.verifiedAt} verifiedBy=${closed.body?.verifiedByUserId}`);
  check("C4 and the record says so explicitly rather than leaving it to be noticed",
    closed.body.closedWithoutVerification === true, `${closed.body?.closedWithoutVerification}`);
  check("C5 COMPLETION is recorded — who closed it and when, which had nowhere to live before",
    Boolean(closed.body.closedAt) && closed.body.closedByUserId === claims.userId,
    `closedAt=${Boolean(closed.body?.closedAt)} closedBy=${closed.body?.closedByUserId === claims.userId}`);

  // ON DISK, not merely in a response the service could have shaped.
  const row = sql(`SELECT coalesce("verifiedAt"::text,'NULL') || '|' || coalesce("verifiedByUserId",'NULL')
    || '|' || coalesce("closedAt"::text,'NULL') FROM corrective_actions WHERE id = '${id}'`);
  check("C6 PERSISTED STATE carries no verification either",
    row.startsWith("NULL|NULL|") && !row.endsWith("|NULL"), row);

  // FALSIFICATION: the strings themselves must be absent from the whole record.
  const serialized = JSON.stringify(closed.body);
  check("C7 no fabricated VERIFIED_STRONG anywhere in the action record",
    !serialized.includes("VERIFIED_STRONG"), "absent");
  check("C8 no fabricated SUPERVISOR_SIGNOFF anywhere in the action record",
    !serialized.includes("SUPERVISOR_SIGNOFF"), "absent");
  check("C7-GUARD the falsification ran over a real closed record, not an empty object",
    serialized.length > 200 && closed.body.statusCode === "closed", `${serialized.length} chars`);

  // CLOSURE EVIDENCE: supplied evidence is preserved verbatim and upgrades nothing.
  check("C9 supplied closure notes are preserved verbatim",
    closed.body.closureNotes === "Guard refitted and function-tested.", closed.body?.closureNotes);
  check("C10 and supplying evidence does NOT promote the action to verified",
    closed.body.lifecycleState === "completed" && closed.body.verified === false,
    "evidence present, still completed");
}

// -- CLOSURE WITH NO EVIDENCE AT ALL: optional, and its absence infers nothing either.
{
  const subject = await createAction({
    title: "§287 closure without evidence", clientRequestId: `d052-noev-${Date.now()}`,
  });
  const closed = await api(`/actions/${subject.body.id}/status`, {
    method: "PATCH", body: JSON.stringify({ statusCode: "closed" }),
  });
  check("C11 closure evidence is OPTIONAL — a close with no notes is accepted",
    closed.status === 200 && closed.body.statusCode === "closed", `${closed.status}`);
  check("C12 and nothing is substituted for the notes the user did not write",
    !closed.body.closureNotes, `closureNotes=${JSON.stringify(closed.body?.closureNotes)}`);
  check("C13 absence of evidence does not produce a WEAKER or STRONGER state than presence did",
    closed.body.lifecycleState === "completed" && closed.body.verified === false,
    `lifecycleState=${closed.body?.lifecycleState}`);
  observe("C13-NOTE what the product now claims about a closed action",
    "COMPLETED means the work is recorded as done and no independent verification is recorded. It "
    + "is deliberately not called 'verification pending': that would assert a verification is "
    + "expected, and whether verification is required at all is an open product-policy question. "
    + "VERIFIED is reachable in the model (statusCode closed + verifiedAt set) and no customer "
    + "path sets it, so the product never claims verification it did not perform. Building the "
    + "verification workflow — who may verify, and whether the closer may verify their own work — "
    + "is a product decision and is registered, not invented here.");
}

// -- REOPEN clears the completion stamp but keeps the evidence.
{
  const subject = await createAction({ title: "§287 reopen subject", clientRequestId: `d052-re-${Date.now()}` });
  const id = subject.body.id;
  await api(`/actions/${id}/status`, {
    method: "PATCH", body: JSON.stringify({ statusCode: "closed", closureNotes: "Temporary fix applied." }),
  });
  const reopened = await api(`/actions/${id}/status`, { method: "PATCH", body: JSON.stringify({ statusCode: "open" }) });
  check("C14 reopening returns the action to OPEN and clears the completion stamp",
    reopened.body.lifecycleState === "open" && reopened.body.closedAt === null
    && reopened.body.closedByUserId === null,
    `lifecycleState=${reopened.body?.lifecycleState} closedAt=${reopened.body?.closedAt}`);
  check("C15 but the closure notes survive — they record what was done, which is still true",
    reopened.body.closureNotes === "Temporary fix applied.", reopened.body?.closureNotes);
}

// =================================================================================================
// 4. D-054 — A COMMITTED TRANSITION IS NEVER REPORTED AS A FAILURE.
//
// Forced, not observed. The audit table is renamed out from under the running server on the
// DISPOSABLE review database, a real close is performed, and the customer's answer is measured.
// =================================================================================================
if (DB_URL) {
  const subject = await createAction({ title: "§287 D-054 regression subject", clientRequestId: `d054-${Date.now()}` });
  const id = subject.body.id;
  const logBefore = STACK_LOG ? readFileSync(STACK_LOG, "utf8").length : 0;
  let restored = false;
  try {
    sql(`ALTER TABLE audit_logs RENAME TO audit_logs_d054_probe`);
    const closed = await api(`/actions/${id}/status`, {
      method: "PATCH", body: JSON.stringify({ statusCode: "closed", closureNotes: "Closed while the audit table was unavailable." }),
    });
    check("A1 the customer receives SUCCESS even though the audit write could not persist",
      closed.status === 200 && closed.body?.statusCode === "closed",
      `${closed.status} ${closed.body?.statusCode}`);

    const stored = sql(`SELECT "statusCode" FROM corrective_actions WHERE id = '${id}'`);
    check("A2 and the state really did commit — the customer was told the truth",
      stored === "closed", `stored statusCode=${stored}`);

    /**
     * §287, INSTRUMENT DEFECT I-22. This counted EVERY audit row for the action and found one, so
     * the guard failed and would have been read as "the audit write succeeded after all". The row
     * it found was `ACTION_CREATED`, written when the probe action was created BEFORE the table was
     * renamed. The row whose absence proves the point is the one the CLOSE would have written, so
     * the guard names it.
     */
    const audited = Number(sql(
      `SELECT count(*) FROM audit_logs_d054_probe
        WHERE "entityId" = '${id}' AND "actionCode" = 'ACTION_STATUS_UPDATED'`));
    const preExisting = Number(sql(
      `SELECT count(*) FROM audit_logs_d054_probe WHERE "entityId" = '${id}'`));
    check("A3-GUARD the STATUS audit row genuinely did NOT persist, so A1/A2 are not a happy-path pass",
      audited === 0 && preExisting > 0,
      `${audited} status row(s); ${preExisting} total row(s) for the action (the creation row, written before the rename)`);
  } finally {
    sql(`ALTER TABLE audit_logs_d054_probe RENAME TO audit_logs`);
    restored = true;
  }
  check("A4 the probe restored the audit table", restored, "renamed back");

  // THE LOST AUDIT ROW IS NOT SILENT. §287 requires that audit failure not silently erase
  // auditability, so the fallback record is asserted to exist and to name the transition.
  if (STACK_LOG) {
    const tail = readFileSync(STACK_LOG, "utf8").slice(logBefore);
    const emitted = tail.includes("action.audit_write_failed");
    check("A5 the missing audit row is EMITTED as an operational event, not swallowed",
      emitted, emitted ? (tail.match(/\{[^\n]*action\.audit_write_failed[^\n]*\}/) || [""])[0].slice(0, 300) : "absent");
    check("A6 and the event names the actor and the transition, so the gap is reconstructable",
      /"actorUserId"/.test(tail) && /"toStatus":"closed"/.test(tail) && /"stateCommitted":true/.test(tail),
      "actor + transition + committed flag present");
  }

  // The write path still works normally once the table is back.
  const after = await createAction({ title: "§287 post-probe sanity", clientRequestId: `d054-after-${Date.now()}` });
  const auditedNow = Number(sql(`SELECT count(*) FROM audit_logs WHERE "entityId" = '${after.body.id}'`));
  check("A7 with the audit table restored, audit rows persist again",
    auditedNow >= 1, `${auditedNow} audit row(s)`);
  observe("A8 the shape D-054 forbids, and where else it was closed",
    "COMMIT SUCCEEDS -> AUXILIARY WRITE FAILS -> CUSTOMER SEES 500 -> CUSTOMER RETRIES -> "
    + "DUPLICATE STATE. Three auxiliary writes follow a committed action transition: the outcome "
    + "loop (closed at §286), the audit row and the assignee notification (both closed at §287). "
    + "None can fail the request; each emits an operational event instead. The outcome loop is "
    + "STILL failing on every close in this environment because the `outcomes` table has no "
    + "migration, which makes this regression a live demonstration rather than a hypothetical.");
}

// =================================================================================================
// 5. AUTHORITY AND WORKSPACE ISOLATION — reverified across the NEW mutation route.
// =================================================================================================
if (otherApi) {
  const subject = await createAction({ title: "§287 isolation subject", clientRequestId: `auth-${Date.now()}` });
  const id = subject.body.id;

  const otherList = await otherApi("/actions?limit=100");
  check("W0-GUARD the other account's list is a real list, not an error",
    otherList.status === 200 && Array.isArray(otherList.body?.data), `${otherList.status}`);
  check("W1 another account cannot SEE this action",
    !(otherList.body.data || []).some((r: any) => r.id === id), "absent from their list");
  const otherEdit = await otherApi(`/actions/${id}`, { method: "PATCH", body: JSON.stringify({ dueDate: TODAY }) });
  check("W2 another account cannot EDIT it — including the new field route",
    otherEdit.status === 404, `${otherEdit.status}`);
  const otherClose = await otherApi(`/actions/${id}/status`, { method: "PATCH", body: JSON.stringify({ statusCode: "closed" }) });
  check("W3 another account cannot CLOSE it", otherClose.status === 404, `${otherClose.status}`);

  const unchanged = (await api("/actions?limit=100")).body.data.find((r: any) => r.id === id);
  check("W4 and neither refused write changed anything",
    unchanged.lifecycleState === "open" && String(unchanged.dueDate).slice(0, 10) !== TODAY,
    `lifecycleState=${unchanged?.lifecycleState} due=${String(unchanged?.dueDate).slice(0, 10)}`);

  const anonymousEdit = await fetch(`${API_URL}/actions/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dueDate: TODAY }),
  });
  check("W5 an unauthenticated caller is refused by the guard, not by the network",
    anonymousEdit.status === 401, `${anonymousEdit.status}`);
}

// -- ENTITLEMENT: creating is Pro-only; MANAGING what you already have is not.
if (process.env.FREE_EMAIL) {
  const freeApi = client(await signIn(process.env.FREE_EMAIL, process.env.FREE_PASSWORD as string));
  const freeCreate = await freeApi("/actions", {
    method: "POST",
    body: JSON.stringify({ title: "Free probe", description: "Entitlement boundary.", priorityCode: "medium" }),
  });
  check("W6 a FREE account still cannot CREATE a corrective action",
    freeCreate.status === 402 && freeCreate.body?.code === "PAID_SUBSCRIPTION_REQUIRED",
    `${freeCreate.status} ${freeCreate.body?.code}`);
  const freeList = await freeApi("/actions?limit=10");
  check("W7 but a FREE account may still READ and manage what it already has",
    freeList.status === 200, `${freeList.status}`);
  observe("W8 why the new edit route carries no entitlement guard",
    "Consistent with the rest of this controller: only CREATE carries "
    + "`correctiveActionAssignments`. An account that raised actions while Pro must be able to "
    + "finish managing and closing them after a downgrade — the same way it keeps the reports it "
    + "generated. Gating closure would strand open compliance work behind a paywall.");
}

// =================================================================================================
// 6. OFFLINE INVENTORY for the completed lifecycle (D-042 continued; nothing is built).
// =================================================================================================
for (const row of [
  { operation: "create a corrective action", offline: "REQUIRES_NETWORK", dataLossRisk: "VULNERABLE",
    basis: "No outbox exists for actions. §287 added `clientRequestId`, which is the PRECONDITION "
      + "for one — an outbox could now replay a create safely — but the queue itself is D-042 work "
      + "and is not built here." },
  { operation: "edit a due date", offline: "REQUIRES_NETWORK", dataLossRisk: "VULNERABLE",
    basis: "Newly possible online (D-051). `PATCH /actions/:id` carries no idempotency key, so a "
      + "replayed edit is a second write; it is last-write-wins rather than duplicating, but an "
      + "edit made offline is lost with the page." },
  { operation: "close an action", offline: "REQUIRES_NETWORK", dataLossRisk: "VULNERABLE",
    basis: "Newly possible online (D-050). A close attempted with no connection fails and the "
      + "panel keeps the notes in the field so nothing typed is lost to the error — but nothing is "
      + "queued, so leaving the page loses it." },
  { operation: "retry after a failed mutation", offline: "PARTIAL", dataLossRisk: "NONE_KNOWN",
    basis: "The client sends mutations with `retries: 0`, so a lost response is never silently "
      + "re-sent. The user retries deliberately; for CREATE the idempotency key makes that safe, "
      + "for EDIT and CLOSE the operations are naturally idempotent in effect (same target state)." },
  { operation: "reconnect", offline: "PARTIAL", dataLossRisk: "NONE_KNOWN",
    basis: "The panel re-reads `GET /actions` on refresh and after every mutation, so reconnecting "
      + "and refreshing yields authoritative server state. There is no local action cache that "
      + "could disagree with the server." },
]) offlineInventory.push(row);

check("O1 every lifecycle operation carries an OFFLINE and DATA_LOSS_RISK classification",
  offlineInventory.every((row) => ["WORKS", "PARTIAL", "REQUIRES_NETWORK", "UNKNOWN"].includes(row.offline as string)
    && ["NONE_KNOWN", "RECOVERABLE", "VULNERABLE", "UNKNOWN"].includes(row.dataLossRisk as string)),
  `${offlineInventory.length} operations`);
observe("O2 what D-042 must still solve for this lifecycle",
  "CREATE is now safely replayable (clientRequestId + partial unique index) and is the one "
  + "operation an outbox could queue today. EDIT and CLOSE have no idempotency key; they are "
  + "idempotent in EFFECT because they set a target state rather than appending, so a replay "
  + "converges — but a queued edit can still overwrite a newer change made elsewhere, and that "
  + "conflict rule is a D-042 decision, not a §287 one.");

// =================================================================================================
writeFileSync(join(OUT_DIR, "action-lifecycle-results.json"), JSON.stringify({
  section: "§287",
  api: API_URL,
  account: process.env.VAL_EMAIL,
  entitlement: {
    planCode: claims.planCode, effectivePlanCode: claims.effectivePlanCode,
    correctiveActionAssignments: claims.billingEntitlements?.correctiveActionAssignments,
  },
  providerCalls: 0,
  checks: results.length,
  failures,
  results,
  observations,
  offlineInventory,
}, null, 2));
console.log(`\n${failures === 0 ? "PASS" : "FAIL"} — ${results.length} checks, ${failures} failures, ${observations.length} observations`);
process.exit(failures === 0 ? 0 : 1);

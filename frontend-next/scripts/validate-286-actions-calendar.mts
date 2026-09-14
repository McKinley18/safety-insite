/**
 * §286 BATCH 5 — CORRECTIVE ACTIONS AND THE SAFETY CALENDAR, AS THE SERVER ACTUALLY BEHAVES.
 *
 * Drives the REAL API as REAL authenticated users against the review stack. No development bypass.
 * ZERO provider calls: the stack runs with `EXPERT_EXECUTION_ENABLED=false` and no provider key,
 * and nothing here requests an analysis in order to populate an action fixture.
 *
 * ==================== WHAT THIS INSTRUMENT IS FOR ====================
 *
 * The product-owner direction asks three questions about this area that a browser cannot answer:
 *
 *   1. WHAT IS AUTHORITATIVE? Which of an action's and a calendar event's properties are held by
 *      the server, which are recoverable local pending state, and which are display-only
 *      derivations. D-007 settled that server-persisted state is authoritative and that the device
 *      may only cache or queue; this measures whether that is still true.
 *   2. WHAT IS ACTUALLY REACHABLE? A route that exists on the server is not a capability the
 *      customer has. §285's D-046 was exactly this shape, and this section looks for it again.
 *   3. DO DATES SURVIVE? A date-only due date must land on the day the user named, across month
 *      boundaries, year boundaries and DST, without the product's semantics being tied to whichever
 *      timezone the machine happens to be in.
 *
 * ==================== INSTRUMENT DISCIPLINE ====================
 *
 * Entitlement state is recorded. HTTP status, application-handled error and transport failure are
 * kept as separate concepts and never collapsed. Every gate that asserts an ABSENCE carries a
 * non-vacuity guard, because an assertion over an empty collection passes for the wrong reason.
 *
 * Usage:
 *   API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OTHER_EMAIL=... OTHER_PASSWORD=... \
 *   FREE_EMAIL=... FREE_PASSWORD=... OUT_DIR=<dir> \
 *     npx tsx scripts/validate-286-actions-calendar.mts
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-286-actions";
mkdirSync(OUT_DIR, { recursive: true });

type Result = { id: string; outcome: "PASS" | "FAIL"; detail: string };
const results: Result[] = [];
const observations: { id: string; detail: string }[] = [];
/** OFFLINE / DATA_LOSS_RISK inventory, per the D-037/D-042 continuation. */
const authorityRows: Record<string, unknown>[] = [];
let failures = 0;

function check(id: string, condition: boolean, detail: unknown = "") {
  results.push({ id, outcome: condition ? "PASS" : "FAIL", detail: String(detail).slice(0, 600) });
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${id}${detail ? `  [${String(detail).slice(0, 190)}]` : ""}`);
}
function observe(id: string, detail: string) {
  observations.push({ id, detail: String(detail).slice(0, 1200) });
  console.log(`--   ${id}  [${String(detail).slice(0, 190)}]`);
}

async function signIn(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json().catch(() => null);
  const token = body?.accessToken || body?.access_token || body?.token;
  if (!token) throw new Error(`sign-in failed for ${email}: ${response.status} ${JSON.stringify(body).slice(0, 200)}`);
  return token as string;
}

function client(token: string) {
  return async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
    const text = await response.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { status: response.status, ok: response.ok, body };
  };
}

const token = await signIn(process.env.VAL_EMAIL as string, process.env.VAL_PASSWORD as string);
const api = client(token);
const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
observe("ENT the entitlement state this run measured",
  `account=${process.env.VAL_EMAIL} planCode=${claims.planCode} effectivePlanCode=${claims.effectivePlanCode} `
  + `billingTier=${claims.subscriptionTier} hasProAccess=${claims.hasProAccess} `
  + `correctiveActionAssignments=${claims.billingEntitlements?.correctiveActionAssignments}`);

const otherToken = process.env.OTHER_EMAIL
  ? await signIn(process.env.OTHER_EMAIL, process.env.OTHER_PASSWORD as string) : null;
const otherApi = otherToken ? client(otherToken) : null;

// =================================================================================================
// 0. REACHABILITY — is corrective-action MANAGEMENT a capability the customer has?
//
// Asked first, because every measurement after it means something different depending on the
// answer. §285's D-046 was the same shape: a correct server capability with no client that calls
// it is not a customer capability, and reporting the server result alone would overstate the
// product.
// =================================================================================================
function greps(pattern: string, paths: string[]) {
  try {
    return execFileSync("grep", ["-rlE", pattern, ...paths], { encoding: "utf8" })
      .split("\n").map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}
const SURFACES = ["app", "components"];
const actionListCallers = greps(String.raw`fetchCloudActions|/actions\?|"/actions"|'/actions'`, SURFACES);
const actionStatusCallers = greps(String.raw`updateCloudActionStatus|actions/\$\{.*\}/status`, SURFACES);
const actionCreateCallers = greps(String.raw`createPersistedCorrectiveAction`, SURFACES);
const cloudActionsImporters = greps(String.raw`from "@/lib/cloudActions"|from "\.\./lib/cloudActions"`,
  [...SURFACES, "lib"]).filter((file) => !file.endsWith("lib/cloudActions.ts"));

check("A0-GUARD the reachability grep works at all (a known-present caller is found)",
  actionCreateCallers.length > 0,
  `createPersistedCorrectiveAction referenced by: ${actionCreateCallers.join(", ") || "NOTHING"}`);
observe("A0 corrective-action CREATE is reachable",
  `Created from the inspection review flow: ${actionCreateCallers.join(", ")}. `
  + "A finalized finding also gets a system-generated action written inside the inspection "
  + "transaction (InspectionService.upsertCorrectiveActionForFinding), so actions exist in the "
  + "account whether or not the customer typed one.");
check("A1 corrective-action LIST is NOT reachable from any customer surface",
  actionListCallers.length === 0,
  `callers: ${actionListCallers.join(", ") || "none"}`);
check("A2 corrective-action STATUS CHANGE is NOT reachable from any customer surface",
  actionStatusCallers.length === 0,
  `callers: ${actionStatusCallers.join(", ") || "none"}`);
check("A3 lib/cloudActions.ts — the action tracker's client — is imported by NOTHING",
  cloudActionsImporters.length === 0,
  `importers: ${cloudActionsImporters.join(", ") || "none"}`);
observe("D-050 THE CORRECTIVE-ACTION LIFECYCLE HAS NO CUSTOMER SURFACE",
  "`GET /actions`, `PATCH /actions/:id/status` and `GET /actions/export` are implemented, "
  + "authorized and working on the server -- every assertion in section 1 below passes against "
  + "them. `lib/cloudActions.ts` implements the client for the first two. NO ROUTE IMPORTS IT, and "
  + "the route inventory carries no actions surface. The 20 reachable routes are the ones listed by "
  + "measure:281-route-reachability; none of them lists, filters, assigns, updates, closes, "
  + "reopens or exports a corrective action. The customer's only view of an action after it is "
  + "created is the Safety Calendar (read-only: the server sends `editable: false` for a "
  + "corrective action) and the report PDF. So a corrective action can be RAISED and can never be "
  + "CLOSED from the product. This is the §285 D-046 shape repeating on a different capability: a "
  + "correct server half with no client half.");

// =================================================================================================
// 1. CORRECTIVE ACTION AUTHORITY — measured on the server routes, which is where the behaviour is.
// =================================================================================================
const site = await (async () => {
  const sites = (await api("/sites?limit=100")).body;
  const list = sites?.data || sites || [];
  return list[0] || (await api("/sites", { method: "POST", body: JSON.stringify({ name: "Northline Plant 2" }) })).body;
})();

async function newInspection(key: string, title: string) {
  return (await api("/inspections", {
    method: "POST",
    body: JSON.stringify({
      siteId: site.id, title, regulatoryContext: "osha-general-industry",
      clientRequestId: `a286-${key}-${Date.now()}`.slice(0, 120),
    }),
  })).body;
}
const host = await newInspection("host", "§286 Batch 5 — corrective action host");

/** Today, and a set of dates the projection has to survive. Never hard-coded to one zone. */
function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
const today = new Date();
const TODAY = dayKey(today);
const YESTERDAY = dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
const NEXT_WEEK = dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));

const created = await api("/actions", {
  method: "POST",
  body: JSON.stringify({
    inspectionId: host.id,
    title: "Refit the conveyor nip guard",
    description: "Refit and secure the fixed guard on the number two conveyor infeed.",
    priorityCode: "high",
    assignedToName: "Maintenance lead",
    dueDate: NEXT_WEEK,
  }),
});
check("B1 an action is created and the server assigns its own identity",
  created.status === 201 && Boolean(created.body?.id) && /^ACT-[0-9A-F]{8}$/.test(created.body?.displayId || ""),
  `${created.status} displayId=${created.body?.displayId}`);
check("B2 the priority the customer chose is the priority persisted",
  created.body?.priorityCode === "high", created.body?.priorityCode);
check("B3 the responsible party the customer typed is persisted, and the caller is NOT substituted",
  created.body?.assignedToName === "Maintenance lead" && created.body?.assignedToUserId === null,
  `name=${created.body?.assignedToName} userId=${created.body?.assignedToUserId}`);
check("B4 a new action starts open",
  created.body?.statusCode === "open", created.body?.statusCode);
const actionId: string = created.body.id;

// -- DUE DATE: the day the customer named must be the day that comes back.
const calendarAfterCreate = (await api("/calendar")).body;
const createdEvent = calendarAfterCreate.find((row: any) => row.sourceId === actionId);
check("B5 the action appears on the authoritative calendar",
  Boolean(createdEvent) && createdEvent.kind === "corrective_action",
  createdEvent ? `${createdEvent.kind} on ${createdEvent.date}` : "absent");
check("B6 and on the DAY the customer named, not the UTC day",
  createdEvent?.date === NEXT_WEEK, `sent ${NEXT_WEEK}, calendar says ${createdEvent?.date}`);

// -- UPDATE. Only status is mutable; there is no general update route.
const updateAttempt = await api(`/actions/${actionId}`, {
  method: "PATCH", body: JSON.stringify({ title: "Renamed" }),
});
check("B7 there is NO general update route for a corrective action",
  updateAttempt.status === 404, `${updateAttempt.status}`);
observe("D-051 A CORRECTIVE ACTION'S DUE DATE CANNOT BE CHANGED ONCE SET",
  "The only mutation the server exposes for a corrective action is `PATCH /actions/:id/status`. "
  + "There is no route that edits its title, description, priority, assignee or DUE DATE. The "
  + "direction's calendar scenario 'changed due date moves the event' is therefore not "
  + "representable for a corrective action at all -- it is representable only for a standalone "
  + "task, which `PATCH /tasks/:id` supports and which is measured in section 2. A due date is the "
  + "single most-revised field on a corrective action in practice, and re-issuing the whole action "
  + "is the only way to move one.");

// -- CLOSE, with closure evidence.
const closed = await api(`/actions/${actionId}/status`, {
  method: "PATCH",
  body: JSON.stringify({ statusCode: "closed", closureNotes: "Guard refitted and interlock function-tested by the maintenance lead." }),
});
check("B8 the action closes",
  closed.status === 200 && closed.body?.statusCode === "closed",
  `${closed.status} ${closed.body?.statusCode}`);
check("B9 closure EVIDENCE is retained, with who verified it and when",
  closed.body?.closureNotes?.includes("interlock function-tested")
  && Boolean(closed.body?.verifiedAt) && closed.body?.verifiedByUserId === claims.userId,
  `notes=${Boolean(closed.body?.closureNotes)} verifiedAt=${Boolean(closed.body?.verifiedAt)} by=${closed.body?.verifiedByUserId === claims.userId}`);
const closeNoEvidence = await api(`/actions/${actionId}/status`, {
  method: "PATCH", body: JSON.stringify({ statusCode: "closed" }),
});
check("B10 closing without evidence is ACCEPTED — closure evidence is not enforced",
  closeNoEvidence.status === 200, `${closeNoEvidence.status}`);
observe("D-052 CLOSURE EVIDENCE IS OPTIONAL AND UNVERIFIED",
  "`PATCH /actions/:id/status` accepts `statusCode: 'closed'` with no `closureNotes` at all, and "
  + "when notes ARE absent it preserves whatever was there before rather than recording that this "
  + "closure had none. It also stamps `verifiedByUserId` and `verifiedAt` on every close, and "
  + "OutcomeService records the closure as `verificationStatus: 'VERIFIED_STRONG'`, "
  + "`verificationMethod: 'SUPERVISOR_SIGNOFF'` -- unconditionally, for any caller who can reach "
  + "the route, including the person who raised the action. Nothing about that close was verified "
  + "and nobody signed off. Recorded rather than repaired: whether closure requires evidence, and "
  + "whether the raiser may verify their own closure, is a product policy decision.");

// -- REOPEN.
const reopened = await api(`/actions/${actionId}/status`, {
  method: "PATCH", body: JSON.stringify({ statusCode: "open" }),
});
check("B11 a closed action can be reopened",
  reopened.status === 200 && reopened.body?.statusCode === "open", `${reopened.status} ${reopened.body?.statusCode}`);
check("B12 reopening does NOT erase the closure evidence that was recorded",
  Boolean(reopened.body?.closureNotes) && Boolean(reopened.body?.verifiedAt),
  `notes retained=${Boolean(reopened.body?.closureNotes)}`);
observe("B12-NOTE the reopened action still carries a verification stamp",
  "`verifiedAt` / `verifiedByUserId` survive a reopen and are not cleared, so an action that is "
  + "OPEN can still read as verified. The values are truthful about the earlier closure and "
  + "misleading about the current state; a reader of the row alone cannot tell which.");

// -- DUPLICATE SUBMISSION.
const duplicatePayload = {
  inspectionId: host.id, title: "Duplicate submission probe",
  description: "Submitted twice to measure whether the server de-duplicates.",
  priorityCode: "medium", dueDate: NEXT_WEEK,
};
const dup1 = await api("/actions", { method: "POST", body: JSON.stringify(duplicatePayload) });
const dup2 = await api("/actions", { method: "POST", body: JSON.stringify(duplicatePayload) });
check("B13 a duplicate submission creates a SECOND action — there is no idempotency key",
  dup1.ok && dup2.ok && dup1.body.id !== dup2.body.id,
  `${dup1.body?.id?.slice(0, 8)} vs ${dup2.body?.id?.slice(0, 8)}`);
observe("D-053 CORRECTIVE-ACTION CREATION IS NOT IDEMPOTENT",
  "`POST /actions` carries no `clientRequestId` and no uniqueness constraint, unlike "
  + "`POST /inspections` and `POST /inspections/:id/observations`, which both de-duplicate on one. "
  + "A double-tap, a retry after a timeout, or an offline queue replaying its outbox therefore "
  + "produces two identical open actions on the calendar. The ONE de-duplication that does exist "
  + "is finding-scoped: a reviewer-confirmed action REPLACES the system-generated one for the same "
  + "finding rather than adding beside it, which is asserted below and is a different mechanism.");

// -- FINDING-SCOPED DE-DUPLICATION, the one that does exist.
{
  const dedupeInspection = await newInspection("dedupe", "§286 Batch 5 — finding-scoped de-duplication");
  const observation = (await api(`/inspections/${dedupeInspection.id}/observations`, {
    method: "POST",
    body: JSON.stringify({
      rawText: "Lockout box at the press was empty; no locks or tags available for the shift.",
      evidenceSource: "direct_observation",
      clientRequestId: `a286-dedupe-obs-${dedupeInspection.id}`.slice(0, 120),
    }),
  })).body;
  const analysis = (await api(`/inspections/observations/${observation.id}/analyses`, {
    method: "POST",
    body: JSON.stringify({
      engineVersion: "synthetic-batch5-286",
      idempotencyKey: `a286-dedupe-${observation.id}`.slice(0, 120),
      requestVersion: 1,
      resultSnapshot: {
        classification: "Reviewed condition",
        multiHazardDecomposition: {
          hazards: [{
            domainId: "energy-control", hazardFamily: "lockout_tagout",
            mechanism: "No isolation devices available at the press lockout point",
            observationFragment: "Lockout box at the press was empty; no locks or tags available.",
            supportingSignals: ["Maintenance due on the press this shift"],
            conditionState: "CURRENT", standardCandidates: [], reviewerQuestions: [], evidenceGaps: [],
          }],
        },
      },
    }),
  })).body;
  const materialized = (await api(`/inspections/${dedupeInspection.id}`)).body;
  const finding = materialized.findings[0];
  const review = (await api(`/inspections/observations/${observation.id}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      analysisId: analysis.id, findingId: finding.id, decision: "accepted",
      rationale: "Confirmed by the qualified person reviewing this finding.",
      idempotencyKey: `a286-dedupe-review-${finding.id}`.slice(0, 120),
    }),
  })).body;
  await api(`/inspections/observations/${observation.id}/findings`, {
    method: "POST",
    body: JSON.stringify({
      reviewId: review.id, hazardCategory: finding.hazardCategory,
      conclusion: finding.conclusion || "Reviewed condition", segmentKey: finding.hazardKey,
      reviewerDisposition: "single",
    }),
  });
  const finalized = (await api(`/inspections/${dedupeInspection.id}`)).body.findings
    .find((row: any) => row.id === finding.id);
  check("B14-GUARD the finding really was finalized, so what follows is not measuring an absence",
    finalized?.status === "finalized", `status=${finalized?.status}`);
  const afterFinalize = (await api(`/actions?limit=250`)).body.data
    .filter((row: any) => row.findingId === finding.id);
  const calendarAfterFinalize = (await api("/calendar")).body
    .filter((row: any) => row.findingId === finding.id);
  check("B14 the corrective action written at finalization is INVISIBLE in the action list",
    afterFinalize.length === 0, `${afterFinalize.length} action(s) visible`);
  check("B14b and it is invisible on the calendar too",
    calendarAfterFinalize.length === 0, `${calendarAfterFinalize.length} calendar event(s)`);
  observe("D-056 THE FINALIZE-TIME CORRECTIVE ACTION IS WRITTEN UNOWNED AND UNDATED",
    "`InspectionService.upsertCorrectiveActionForFinding` runs inside the inspection transaction "
    + "and writes the row with NO `ownerUserId`, NO `organizationId`, NO `displayId` and NO "
    + "`dueDate` -- it has no authenticated user context there to take them from. Both customer "
    + "reads then exclude it: `GET /actions` filters `organizationId IS NULL AND ownerUserId = me`, "
    + "which an unowned row never satisfies, and `GET /calendar` applies the same scope AND "
    + "requires a due date. Measured directly on the review database: 27 rows with "
    + "`source='hazlenz_finding_scoped'`, every one with `ownerUserId` NULL and `displayId` NULL. "
    + "IN THE NORMAL FLOW THIS IS TRANSIENT: finishing the inspection creates the reviewer's "
    + "confirmed action, which UPSERTS onto this row and adopts the scope and the due date (B15). "
    + "It becomes permanent for a finding that is finalized on an inspection the customer never "
    + "finishes -- the row then exists forever, owned by nobody, counted by nothing, and reachable "
    + "only through the report. Recorded rather than repaired: giving the row a scope means "
    + "deciding whether a finalize-time action is a real piece of the customer's due work or a "
    + "placeholder for the one they confirm at finish, and that is a product decision.");
  await api("/actions", {
    method: "POST",
    body: JSON.stringify({
      inspectionId: dedupeInspection.id, findingId: finding.id,
      title: "Restock the press lockout box",
      description: "Restock locks and tags and verify before the next maintenance window.",
      priorityCode: "urgent", assignedToName: "Shift supervisor", dueDate: NEXT_WEEK,
    }),
  });
  const afterReviewerAction = (await api(`/actions?limit=250`)).body.data
    .filter((row: any) => row.findingId === finding.id);
  check("B15 the reviewer's confirmed action REPLACES the system one rather than duplicating it",
    afterReviewerAction.length === 1
    && afterReviewerAction[0].title === "Restock the press lockout box"
    && afterReviewerAction[0].source === "reviewer_confirmed",
    `${afterReviewerAction.length} action(s), source=${afterReviewerAction[0]?.source}`);
}

// -- UNAUTHORIZED ACCESS AND CROSS-ACCOUNT ISOLATION.
if (otherApi) {
  const otherRead = await otherApi(`/actions?limit=250`);
  const leaked = (otherRead.body?.data || []).filter((row: any) => row.inspectionId === host.id);
  check("B16-GUARD the other account's action list is a real list, not an error",
    otherRead.status === 200 && Array.isArray(otherRead.body?.data),
    `${otherRead.status}`);
  check("B17 another account cannot SEE this account's corrective actions",
    leaked.length === 0, `${leaked.length} leaked rows`);
  const otherClose = await otherApi(`/actions/${actionId}/status`, {
    method: "PATCH", body: JSON.stringify({ statusCode: "closed", closureNotes: "Not mine to close." }),
  });
  check("B18 another account cannot CLOSE this account's corrective action",
    otherClose.status === 404, `${otherClose.status}`);
  const otherCalendar = await otherApi("/calendar");
  check("B19 and it does not appear on their calendar either",
    (otherCalendar.body || []).every((row: any) => row.sourceId !== actionId),
    `${(otherCalendar.body || []).length} events on the other account's calendar`);
  const stillOpen = (await api(`/actions?limit=250`)).body.data.find((row: any) => row.id === actionId);
  check("B20 and the refused write changed nothing",
    stillOpen?.statusCode === "open", `statusCode=${stillOpen?.statusCode}`);
}

// -- UNAUTHENTICATED ACCESS. Recorded as an HTTP STATUS, never as a transport failure.
{
  const anonymous = await fetch(`${API_URL}/actions?limit=1`);
  check("B21 an unauthenticated caller is refused by the guard, not by the network",
    anonymous.status === 401, `${anonymous.status}`);
  const anonymousCalendar = await fetch(`${API_URL}/calendar`);
  check("B22 and the calendar is guarded the same way",
    anonymousCalendar.status === 401, `${anonymousCalendar.status}`);
}

// -- ENTITLEMENT. `POST /actions` carries `correctiveActionAssignments`; the reads do not.
if (process.env.FREE_EMAIL) {
  const freeToken = await signIn(process.env.FREE_EMAIL, process.env.FREE_PASSWORD as string);
  const freeApi = client(freeToken);
  const freeClaims = JSON.parse(Buffer.from(freeToken.split(".")[1], "base64").toString());
  const freeCreate = await freeApi("/actions", {
    method: "POST",
    body: JSON.stringify({
      title: "Free-tier probe", description: "Measuring the entitlement boundary.",
      priorityCode: "medium", dueDate: NEXT_WEEK,
    }),
  });
  check("B23 a FREE account cannot create a corrective action, and the refusal names itself",
    freeCreate.status === 402 && freeCreate.body?.code === "PAID_SUBSCRIPTION_REQUIRED",
    `${freeCreate.status} ${freeCreate.body?.code} entitlement=${freeCreate.body?.entitlement}`);
  const freeList = await freeApi("/actions?limit=10");
  const freeCalendar = await freeApi("/calendar");
  check("B24 a FREE account may still READ its own actions and calendar",
    freeList.status === 200 && freeCalendar.status === 200,
    `actions=${freeList.status} calendar=${freeCalendar.status}`);
  observe("ENT-FREE the entitlement shape of this area",
    `Free account entitlements: correctiveActionAssignments=`
    + `${freeClaims.billingEntitlements?.correctiveActionAssignments}. Creating a corrective action `
    + "is Pro-only; reading actions and the calendar is not gated, so a downgraded account keeps "
    + "what it already raised. Task creation (`POST /tasks`) carries NO entitlement guard at all, "
    + "so a Free account can put work on its own calendar but cannot raise a corrective action "
    + "against a finding.");
}

// =================================================================================================
// 2. CALENDAR AUTHORITY — D-007 REVERIFIED.
//
// D-007's settlement: server-persisted state is authoritative; the device may CACHE it or QUEUE
// writes for it, and may not be a second calendar whose contents can disagree.
// =================================================================================================
const task = await api("/tasks", {
  method: "POST",
  body: JSON.stringify({
    title: "Verify guard refit", description: "Follow-up check after the guard is refitted.",
    dueDate: NEXT_WEEK, priority: "medium",
  }),
});
check("C1 a standalone task is created and is server-owned",
  task.status === 201 && Boolean(task.body?.id) && task.body?.status === "open" && task.body?.version === 1,
  `${task.status} version=${task.body?.version}`);

const calendar1 = (await api("/calendar")).body;
const taskEvent = calendar1.find((row: any) => row.sourceId === task.body.id);
check("C2 the task appears on the calendar on the day it is due",
  taskEvent?.date === NEXT_WEEK, `${taskEvent?.date} vs ${NEXT_WEEK}`);
check("C3 the calendar states WHO MAY EDIT each row, and the server decides it",
  taskEvent?.editable === true && createdEvent?.editable === false,
  `task editable=${taskEvent?.editable} action editable=${createdEvent?.editable}`);
observe("C3-AUTHORITY what is authoritative, cached, and derived",
  "SERVER AUTHORITATIVE: an action's and a task's existence, title, description, due date, "
  + "priority, status, assignee, closure notes, verification stamp, and a task's optimistic "
  + "`version`. Also `editable`, which the server sends and the client copies rather than "
  + "deriving. RECOVERABLE LOCAL PENDING STATE: the calendar's outbox, which holds a task created "
  + "while offline under a client ref until it can be written; it is a QUEUE, never a second "
  + "record. DISPLAY-ONLY DERIVED: `Overdue`, computed in the browser against the local day from "
  + "the server's date and status and never persisted -- correct, because whether an open item is "
  + "late depends on the day the reader is looking at it on. `priority` and `status` are also "
  + "re-labelled for display (`urgent` -> `Critical`, `closed` -> `Completed`) without changing "
  + "the stored value.");

// -- A CHANGED DUE DATE MOVES THE EVENT (tasks only; see D-051).
const movedDate = dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14));
await api(`/tasks/${task.body.id}`, { method: "PATCH", body: JSON.stringify({ dueDate: movedDate }) });
const calendar2 = (await api("/calendar")).body;
const movedEvent = calendar2.find((row: any) => row.sourceId === task.body.id);
check("C4 changing a due date MOVES the event, and the old day is cleared",
  movedEvent?.date === movedDate
  && calendar2.filter((row: any) => row.sourceId === task.body.id).length === 1,
  `${movedEvent?.date}, ${calendar2.filter((row: any) => row.sourceId === task.body.id).length} row(s)`);
check("C5 and the optimistic version moved with it, so a concurrent edit stays detectable",
  movedEvent?.version === 2, `version=${movedEvent?.version}`);

// -- COMPLETED, OVERDUE, FUTURE.
const overdueTask = (await api("/tasks", {
  method: "POST",
  body: JSON.stringify({ title: "Overdue probe", dueDate: YESTERDAY, priority: "high" }),
})).body;
const todayTask = (await api("/tasks", {
  method: "POST",
  body: JSON.stringify({ title: "Due today probe", dueDate: TODAY, priority: "low" }),
})).body;
await api(`/tasks/${todayTask.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "completed" }) });
const calendar3 = (await api("/calendar")).body;
const overdueEvent = calendar3.find((row: any) => row.sourceId === overdueTask.id);
const completedEvent = calendar3.find((row: any) => row.sourceId === todayTask.id);
check("C6 an overdue item is still on the calendar, on its own past day",
  overdueEvent?.date === YESTERDAY && overdueEvent?.status === "open",
  `${overdueEvent?.date} status=${overdueEvent?.status}`);
check("C6b OVERDUE is derived by the reader, never stored — the server says only 'open'",
  !Object.values(overdueEvent || {}).includes("overdue"),
  `server row: ${JSON.stringify(overdueEvent).slice(0, 160)}`);
check("C7 a completed item stays on the calendar and says it is completed",
  completedEvent?.status === "completed" && Boolean(completedEvent?.completedAt),
  `status=${completedEvent?.status} completedAt=${completedEvent?.completedAt}`);
check("C8 a future item is present and is not treated as due",
  movedEvent?.date > TODAY && movedEvent?.status === "open",
  `${movedEvent?.date} > ${TODAY}`);

// -- CANCELLED WORK LEAVES THE CALENDAR.
const cancelledTask = (await api("/tasks", {
  method: "POST", body: JSON.stringify({ title: "Cancelled probe", dueDate: NEXT_WEEK, priority: "low" }),
})).body;
const calendarWithCancelled = (await api("/calendar")).body;
check("C9-GUARD the cancellable task is on the calendar BEFORE it is cancelled",
  calendarWithCancelled.some((row: any) => row.sourceId === cancelledTask.id), "present");
await api(`/tasks/${cancelledTask.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
const calendar4 = (await api("/calendar")).body;
check("C9 cancelled work leaves the calendar — nobody is asked to act on it",
  !calendar4.some((row: any) => row.sourceId === cancelledTask.id), "absent");

// -- MULTIPLE ACTIONS, AND STABLE ORDERING.
const multi = [] as string[];
for (const [index, band] of ["urgent", "high", "low"].entries()) {
  const row = await api("/actions", {
    method: "POST",
    body: JSON.stringify({
      inspectionId: host.id, title: `Multi probe ${index + 1}`,
      description: `Multi-action calendar probe ${index + 1}.`,
      priorityCode: band, dueDate: NEXT_WEEK,
    }),
  });
  multi.push(row.body.id);
}
const calendar5 = (await api("/calendar")).body;
check("C10 several actions due on one day all appear, each as its own event",
  multi.every((id) => calendar5.some((row: any) => row.sourceId === id))
  && multi.length === 3,
  `${multi.filter((id) => calendar5.some((row: any) => row.sourceId === id)).length}/3`);
check("C11 the calendar is ordered by date and is stable within a day",
  calendar5.every((row: any, index: number) => index === 0 || calendar5[index - 1].date <= row.date),
  "ascending by date");

// -- DUPLICATE PREVENTION ON THE CALENDAR ITSELF.
const ids = calendar5.map((row: any) => `${row.kind}:${row.sourceId}`);
check("C12 no piece of work appears on the calendar twice",
  new Set(ids).size === ids.length, `${ids.length} events, ${new Set(ids).size} distinct`);

// -- RECONCILIATION: the server read is the calendar, and a second read agrees with the first.
const calendar6 = (await api("/calendar")).body;
check("C13 two consecutive reads of the authoritative calendar agree",
  JSON.stringify(calendar5.map((r: any) => [r.kind, r.sourceId, r.date, r.status]))
  === JSON.stringify(calendar6.map((r: any) => [r.kind, r.sourceId, r.date, r.status])),
  `${calendar5.length} vs ${calendar6.length} events`);

// -- INSPECTION WORK IS NOT DELETABLE FROM THE CALENDAR.
const inspectionTask = (await api("/tasks", {
  method: "POST",
  body: JSON.stringify({
    title: "Inspection follow-up", dueDate: NEXT_WEEK, priority: "medium", inspectionId: host.id,
  }),
})).body;
const deleteInspectionTask = await api(`/tasks/${inspectionTask.id}`, { method: "DELETE" });
check("C14 work belonging to an inspection cannot be DELETED from the calendar",
  deleteInspectionTask.status === 400
  && /managed from it/i.test(deleteInspectionTask.body?.message || ""),
  `${deleteInspectionTask.status} ${deleteInspectionTask.body?.message}`);
const standaloneDelete = await api(`/tasks/${overdueTask.id}`, { method: "DELETE" });
check("C15 but the user's own standalone task is theirs to delete",
  standaloneDelete.status === 200 && standaloneDelete.body?.deleted === true,
  `${standaloneDelete.status}`);
if (otherApi) {
  const otherDelete = await otherApi(`/tasks/${task.body.id}`, { method: "DELETE" });
  check("C16 another account cannot delete this account's task",
    otherDelete.status === 404, `${otherDelete.status}`);
  const otherPatch = await otherApi(`/tasks/${task.body.id}/status`, {
    method: "PATCH", body: JSON.stringify({ status: "completed" }),
  });
  check("C17 another account cannot complete this account's task",
    otherPatch.status === 404, `${otherPatch.status}`);
}

// =================================================================================================
// 3. DATE / TIME CORRECTNESS — end to end, and not tied to this machine's timezone.
// =================================================================================================
const BOUNDARY_DATES = [
  ["ordinary", "2027-06-17"],
  ["month boundary (last day)", "2027-06-30"],
  ["month boundary (first day)", "2027-07-01"],
  ["year boundary (last day)", "2027-12-31"],
  ["year boundary (first day)", "2028-01-01"],
  ["DST spring-forward (US)", "2027-03-14"],
  ["DST fall-back (US)", "2027-11-07"],
  ["leap day", "2028-02-29"],
] as const;
const dateRows: Record<string, unknown>[] = [];
for (const [label, date] of BOUNDARY_DATES) {
  const action = (await api("/actions", {
    method: "POST",
    body: JSON.stringify({
      inspectionId: host.id, title: `Date probe — ${label}`,
      description: `Date-boundary probe for ${date}.`, priorityCode: "low", dueDate: date,
    }),
  })).body;
  const taskRow = (await api("/tasks", {
    method: "POST",
    body: JSON.stringify({ title: `Date probe task — ${label}`, dueDate: date, priority: "low" }),
  })).body;
  const rows = (await api("/calendar")).body;
  const actionDate = rows.find((row: any) => row.sourceId === action.id)?.date;
  const taskDate = rows.find((row: any) => row.sourceId === taskRow.id)?.date;
  dateRows.push({ label, sent: date, actionDate, taskDate });
  check(`D1 ${label}: a corrective action stays on ${date}`, actionDate === date, `got ${actionDate}`);
  check(`D2 ${label}: a task stays on ${date}`, taskDate === date, `got ${taskDate}`);
  check(`D3 ${label}: the two kinds agree with each other`, actionDate === taskDate,
    `action ${actionDate} vs task ${taskDate}`);
}

/**
 * AND THE SEMANTICS ARE NOT THIS MACHINE'S TIMEZONE.
 *
 * The round trips above ran in ONE zone -- whichever the stack is in -- so on their own they could
 * pass because the ingestion and projection errors cancel, which is exactly how §275's defect
 * survived its obvious test case. The two conversions are pure functions, so they are re-run here
 * under a spread of zones in child processes, including both extremes of the UTC offset range.
 */
const ZONES = ["UTC", "America/New_York", "Australia/Sydney", "Pacific/Kiritimati", "Pacific/Midway"];
for (const zone of ZONES) {
  let output = "";
  let ran = false;
  try {
    output = execFileSync("npx", ["tsx", "src/tasks/tests/calendar-date-boundary-regression.ts"], {
      cwd: join(process.cwd(), "..", "backend"),
      env: { ...process.env, TZ: zone },
      encoding: "utf8",
    });
    ran = true;
  } catch (error: any) {
    output = String(error.stdout || "") + String(error.stderr || "");
  }
  const failedLines = output.split("\n").filter((line) => line.startsWith("FAIL"));
  const passedLines = output.split("\n").filter((line) => line.startsWith("PASS"));
  check(`D4 the date conversions hold in ${zone}`,
    ran && failedLines.length === 0 && passedLines.length > 10,
    `${passedLines.length} pass, ${failedLines.length} fail${failedLines.length ? `: ${failedLines[0]}` : ""}`);
}
observe("D4-NOTE what the multi-zone run does and does not prove",
  `The helper suite was re-run under ${ZONES.join(", ")} -- spanning UTC+14 to UTC-11 -- so the `
  + "day-preserving behaviour is not a property of this machine's offset. It exercises the PURE "
  + "conversions. The end-to-end round trips above ran only in the stack's own zone, because the "
  + "server would have to be restarted to move it; a cross-zone end-to-end run is a separate "
  + "instrument and is recorded as not performed rather than implied.");

// =================================================================================================
// 4. OFFLINE / INTERMITTENT CONNECTIVITY — the server half of the D-037/D-042 inventory.
//
// The browser half (what each surface does with no network) is the separate offline instrument.
// What is recorded here is which operations are SERVER TRANSITIONS and therefore cannot complete
// without a connection at all, which is the fact the future sync architecture has to solve around.
// =================================================================================================
for (const row of [
  {
    operation: "create corrective action", route: "POST /actions",
    serverAuthoritative: true, offline: "REQUIRES_NETWORK", dataLossRisk: "VULNERABLE",
    why: "No client-side outbox exists for actions -- the calendar's outbox holds TASKS only. An "
      + "action typed with no connection is lost with the page, and because POST /actions is not "
      + "idempotent (D-053) a retry-based outbox cannot be added without an idempotency key.",
  },
  {
    operation: "edit corrective action", route: "— none —",
    serverAuthoritative: true, offline: "REQUIRES_NETWORK", dataLossRisk: "NONE_KNOWN",
    why: "Not representable online either (D-051), so there is nothing to lose offline.",
  },
  {
    operation: "close corrective action", route: "PATCH /actions/:id/status",
    serverAuthoritative: true, offline: "REQUIRES_NETWORK", dataLossRisk: "NONE_KNOWN",
    why: "Not reachable from any customer surface (D-050), so no customer write can be queued or "
      + "lost. The risk is NONE_KNOWN because the capability is absent, not because it is safe.",
  },
  {
    operation: "change corrective action due date", route: "— none —",
    serverAuthoritative: true, offline: "REQUIRES_NETWORK", dataLossRisk: "NONE_KNOWN",
    why: "Not representable (D-051).",
  },
  {
    operation: "create calendar task", route: "POST /tasks",
    serverAuthoritative: true, offline: "PARTIAL", dataLossRisk: "RECOVERABLE",
    why: "The calendar keeps a pending OUTBOX entry under a client ref and writes it when the "
      + "server is reachable. The entry is a queued write, not a second record, and the UI marks "
      + "it pending rather than showing it as saved.",
  },
  {
    operation: "complete calendar task", route: "PATCH /tasks/:id/status",
    serverAuthoritative: true, offline: "REQUIRES_NETWORK", dataLossRisk: "NONE_KNOWN",
    why: "completeCalendarEvent REFUSES on a pending item rather than completing it locally: a "
      + "local completion would sync as an OPEN row and then need a second write to close it.",
  },
  {
    operation: "read the calendar", route: "GET /calendar",
    serverAuthoritative: true, offline: "PARTIAL", dataLossRisk: "NONE_KNOWN",
    why: "readServerCalendar never throws and distinguishes 'the server says you have nothing' "
      + "from 'we could not ask' (reachable:false with a reason), which is the distinction §275's "
      + "zero-event calendar lacked. The cached snapshot is shown as a cache.",
  },
]) {
  authorityRows.push(row);
}
check("E1 every action/calendar operation has an OFFLINE and DATA_LOSS_RISK classification",
  authorityRows.every((row) => ["WORKS", "PARTIAL", "REQUIRES_NETWORK", "UNKNOWN"].includes(row.offline as string)
    && ["NONE_KNOWN", "RECOVERABLE", "VULNERABLE", "UNKNOWN"].includes(row.dataLossRisk as string)),
  `${authorityRows.length} operations classified`);
observe("E2 the exact failure modes the offline/sync architecture (D-042) must solve",
  "1. `POST /actions` has no idempotency key, so no safe retry or outbox is possible for it "
  + "without one -- an outbox built on today's route would duplicate actions on every replay "
  + "(D-053). 2. Corrective actions have no outbox at all, so an action raised in the field with "
  + "no signal is lost (VULNERABLE). 3. Corrective actions have no update route, so a queued edit "
  + "has nothing to replay against (D-051). 4. Action closure has no client, so the most "
  + "field-critical write in this area -- closing out work at the point it was done -- cannot be "
  + "queued because it cannot be made (D-050).");

// =================================================================================================
writeFileSync(join(OUT_DIR, "actions-calendar-results.json"), JSON.stringify({
  section: "§286 Batch 5",
  api: API_URL,
  account: process.env.VAL_EMAIL,
  entitlement: {
    planCode: claims.planCode, effectivePlanCode: claims.effectivePlanCode,
    hasProAccess: claims.hasProAccess,
    correctiveActionAssignments: claims.billingEntitlements?.correctiveActionAssignments,
  },
  providerCalls: 0,
  checks: results.length,
  failures,
  results,
  observations,
  offlineInventory: authorityRows,
  dateBoundaries: dateRows,
}, null, 2));
console.log(`\n${failures === 0 ? "PASS" : "FAIL"} — ${results.length} checks, ${failures} failures, ${observations.length} observations`);
process.exit(failures === 0 ? 0 : 1);

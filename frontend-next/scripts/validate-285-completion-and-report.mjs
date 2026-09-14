// §285 (Batch 4) — INSPECTION COMPLETION, REPORT AUTHORITY, AND REPORT IMMUTABILITY.
//
// Drives the REAL API as a REAL authenticated user against the review stack. No development
// bypass. Synthetic HazLenz states only; EXPERT_EXECUTION_ENABLED=false and no provider key, so
// ZERO provider calls are possible.
//
// ==================== WHY THIS IS AN API INSTRUMENT AND NOT A BROWSER ONE ====================
//
// The questions here are about WHAT IS TRUE OF THE RECORD, not what a page renders: which
// conditions permit completion, whether a report's statements carry the provenance they claim, and
// whether an issued revision is still byte-identical after its successor exists. A browser can show
// the screen but cannot compare two checksums across a reopen/regenerate cycle, and driving that
// cycle through the UI would make the measurement depend on the UI being right — which is one of
// the things under review. The browser passes are separate instruments.
//
// Usage:
//   API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> \
//     node scripts/validate-285-completion-and-report.mjs
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";

const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-285-completion";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
mkdirSync(OUT_DIR, { recursive: true });

const results = [];
const observations = [];
let failures = 0;
function check(id, condition, detail = "") {
  results.push({ id, outcome: condition ? "PASS" : "FAIL", detail: String(detail).slice(0, 400) });
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${id}${detail ? `  [${String(detail).slice(0, 170)}]` : ""}`);
}
/** A reading that is recorded rather than asserted — the product-owner findings. */
function observe(id, detail) {
  observations.push({ id, detail: String(detail).slice(0, 600) });
  console.log(`--   ${id}  [${String(detail).slice(0, 170)}]`);
}

const login = await (await fetch(`${API_URL}/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})).json();
const token = login.accessToken || login.access_token || login.token;
if (!token) throw new Error("sign-in failed");
const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const api = async (path, init = {}) => {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, ok: response.ok, body };
};

const inspections = (await api("/inspections")).body;
const byTitle = (fragment) => inspections.find((i) => (i.title || "").includes(fragment));

// =================================================================================================
// 0. THE ENTITLEMENT SHAPE OF THE REPORT HALF, measured rather than assumed.
//
// The first run of this instrument was on a FREE account and report generation answered 402. That
// is not a defect -- `POST /inspections/:id/reports` carries `@RequireEntitlement('cloudReports')`
// -- but it means the whole report half of Batch 4 is unreachable on the tier most accounts start
// on, and the instrument has to say which tier it measured. The READ routes carry no entitlement
// requirement, so a downgraded account keeps the reports it already has.
// =================================================================================================
if (process.env.FREE_EMAIL && process.env.FREE_PASSWORD) {
  const freeLogin = await (await fetch(`${API_URL}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.FREE_EMAIL, password: process.env.FREE_PASSWORD }),
  })).json();
  const freeToken = freeLogin.accessToken || freeLogin.access_token || freeLogin.token;
  if (!freeToken) {
    // `POST /auth/login` is throttled to five attempts a minute per address, which is correct
    // brute-force protection and not something a harness may reach around. Say so rather than
    // reporting a 401 as a product fact.
    check("E0 the Free probe could sign in", false,
      `no token: ${JSON.stringify(freeLogin).slice(0, 160)}`);
  }
  const freeHeaders = { Authorization: `Bearer ${freeToken}`, "Content-Type": "application/json" };
  const freeApi = async (path, init = {}) => {
    const response = await fetch(`${API_URL}${path}`,
      { ...init, headers: { ...freeHeaders, ...(init.headers || {}) } });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { status: response.status, ok: response.ok, body };
  };
  // The Free account needs a COMPLETED inspection before the generation refusal can be measured;
  // otherwise a 400 "not completed" would be mistaken for the entitlement answer.
  const freeInspections = (await freeApi("/inspections")).body;
  let freeCompleted = (Array.isArray(freeInspections) ? freeInspections : [])
    .find((i) => i.status === "completed");
  if (!freeCompleted) {
    const candidate = (Array.isArray(freeInspections) ? freeInspections : [])
      .find((i) => (i.title || "").includes("state A"));
    if (candidate) {
      let row = (await freeApi(`/inspections/${candidate.id}`)).body;
      await freeApi(`/inspections/${row.id}/transition`,
        { method: "POST", body: JSON.stringify({ status: "in_review", version: row.version }) });
      row = (await freeApi(`/inspections/${row.id}`)).body;
      const done = await freeApi(`/inspections/${row.id}/transition`,
        { method: "POST", body: JSON.stringify({ status: "completed", version: row.version }) });
      if (done.ok) freeCompleted = done.body;
    }
  }
  if (freeCompleted) {
    const attempt = await freeApi(`/inspections/${freeCompleted.id}/reports`, { method: "POST" });
    const body = attempt.body;
    check("E1 a FREE account cannot generate a report, and the refusal names itself",
      attempt.status === 402 && body?.code === "PAID_SUBSCRIPTION_REQUIRED",
      `${attempt.status} ${body?.code} entitlement=${body?.entitlement}`);
    observe("TIER-1 the report half of the product is Pro-only",
      "POST /inspections/:id/reports requires `cloudReports`. A Free account can complete an "
      + "inspection and then cannot produce the report of it. The READ routes -- list, get, "
      + "revisions, download, per-version download -- carry NO entitlement requirement, so an "
      + "account that generated while Pro keeps its reports after a downgrade, which is the right "
      + "way round. Everything below this line is measured on an ENTITLED account.");
  }
  const freeReports = await freeApi("/inspection-reports");
  check("E2 a FREE account may still READ its report library (no entitlement gate on the read)",
    freeReports.status === 200 && Array.isArray(freeReports.body),
    `${freeReports.status} ${JSON.stringify(freeReports.body)?.slice(0, 100)}`);
}

// =================================================================================================
// 1. THE COMPLETION CONTRACT — what the server actually requires, measured on every seeded shape.
// =================================================================================================
const readinessRows = [];
for (const inspection of inspections) {
  const { body } = await api(`/inspections/${inspection.id}/completion-readiness`);
  readinessRows.push({
    title: inspection.title, status: inspection.status, findingCount: inspection.findingCount,
    ready: body?.ready, reasons: body?.reasons, findings: body?.findingCount,
    reviewed: body?.reviewedCount, reportable: body?.reportableCount,
  });
}
writeFileSync(`${OUT_DIR}/completion-readiness.json`, JSON.stringify(readinessRows, null, 2));

const negated = readinessRows.find((r) => r.title.includes("state G"));
check("P1 an observation with NO HAZARD IDENTIFIED cannot be completed",
  negated?.ready === false && negated.reasons?.includes("NO_CURRENT_FINDING"),
  `${negated?.title}: ready=${negated?.ready} reasons=${negated?.reasons}`);
observe("PRODUCT-Q1 a safe/negated inspection is not completable",
  "HazLenz state G identified no hazard, so the inspection has zero findings and the completion "
  + "contract refuses it with NO_CURRENT_FINDING. An inspector who walks an area and finds nothing "
  + "has no way to close the record. Recorded, not changed: the completion policy is the product "
  + "owner's.");

const notStarted = readinessRows.find((r) => r.title.includes("not yet started"));
check("P2 an inspection with no observation cannot be completed",
  notStarted?.ready === false && notStarted.reasons?.includes("NO_OBSERVATION"),
  `reasons=${notStarted?.reasons}`);

const unreviewed = readinessRows.find((r) => r.title.includes("Packaging line"));
check("P3 an inspection whose observations produced no persisted finding cannot be completed",
  unreviewed?.ready === false && unreviewed.reasons?.includes("NO_CURRENT_FINDING"),
  `reasons=${unreviewed?.reasons}`);

for (const fragment of ["state A", "state C", "state D", "state E", "state F"]) {
  const row = readinessRows.find((r) => r.title.includes(fragment));
  check(`P4 ${fragment} is completable (finding finalized with a current review)`, row?.ready === true,
    `ready=${row?.ready} findings=${row?.findings} reviewed=${row?.reviewed} reportable=${row?.reportable}`);
}

// =================================================================================================
// 2. COMPLETION ITSELF, including the duplicate attempt.
// =================================================================================================
/**
 * Drive one inspection to `completed` through the real lifecycle, from whatever state it is in.
 *
 * Idempotent on purpose: this instrument runs repeatedly against a stack whose database outlives a
 * single run, and a version of it that assumed `draft` reported "a ready inspection completes:
 * FAIL 400" the second time -- an instrument fault wearing a product fault's clothes.
 */
async function complete(inspection) {
  let current = (await api(`/inspections/${inspection.id}`)).body;
  if (current.status === "completed") {
    await api(`/inspections/${current.id}/transition`, {
      method: "POST", body: JSON.stringify({ status: "draft", version: current.version }),
    });
    current = (await api(`/inspections/${current.id}`)).body;
  }
  if (current.status === "draft") {
    await api(`/inspections/${current.id}/transition`, {
      method: "POST", body: JSON.stringify({ status: "in_review", version: current.version }),
    });
    current = (await api(`/inspections/${current.id}`)).body;
  }
  const toCompleted = await api(`/inspections/${current.id}/transition`, {
    method: "POST", body: JSON.stringify({ status: "completed", version: current.version }),
  });
  return { toCompleted, staleVersion: current.version };
}

const stateA = byTitle("state A");
const completedA = await complete(stateA);
check("C1 a ready inspection completes", completedA.toCompleted.ok
  && completedA.toCompleted.body?.status === "completed",
  `${completedA.toCompleted.status} ${completedA.toCompleted.body?.status}`);
check("C2 completion stamps completedAt", Boolean(completedA.toCompleted.body?.completedAt),
  completedA.toCompleted.body?.completedAt);

// The duplicate attempt: replay the SAME transition with the version it already consumed.
const duplicate = await api(`/inspections/${stateA.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "completed", version: completedA.staleVersion }),
});
check("C3 A DUPLICATE COMPLETION IS REFUSED — the optimistic version guard catches the replay",
  duplicate.status === 409 || duplicate.status === 400,
  `${duplicate.status} ${JSON.stringify(duplicate.body?.message || duplicate.body)}`);
const afterDuplicate = (await api(`/inspections/${stateA.id}`)).body;
check("C4 and the record is not damaged by it",
  afterDuplicate.status === "completed" && Boolean(afterDuplicate.completedAt));

// A refused completion on a NOT-ready inspection, through the same route.
const stateG = byTitle("state G");
const gCurrent = (await api(`/inspections/${stateG.id}`)).body;
await api(`/inspections/${stateG.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "in_review", version: gCurrent.version }),
});
const gAfter = (await api(`/inspections/${stateG.id}`)).body;
const gComplete = await api(`/inspections/${stateG.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "completed", version: gAfter.version }),
});
check("C5 the server refuses to complete the no-finding inspection",
  !gComplete.ok, `${gComplete.status} ${gComplete.body?.message}`);
/**
 * §285 objective repair. The refusal message had two branches for three reasons, so an inspection
 * with observations but NO FINDINGS was told "Every current finding requires a completed human
 * review" -- false, and unactionable, because reviewing nothing can never satisfy it.
 */
check("C6 AND THE MESSAGE NAMES THE REASON THAT IS ACTUALLY BLOCKING",
  /no findings to report/i.test(String(gComplete.body?.message || "")),
  gComplete.body?.message);
const gReadiness = (await api(`/inspections/${stateG.id}/completion-readiness`)).body;
check("C7 the readiness endpoint the Finish screen reads says the same thing",
  gReadiness?.reasons?.includes("NO_CURRENT_FINDING")
  && /no findings to report/i.test(String(gReadiness?.message || "")),
  `${gReadiness?.reasons} :: ${gReadiness?.message}`);

// =================================================================================================
// 3. REPORT GENERATION AND AUTHORITY.
// =================================================================================================
const gen = await api(`/inspections/${stateA.id}/reports`, { method: "POST" });
check("R1 a report generates from a completed inspection", gen.ok, `${gen.status}`);
const reportSummary = (await api(`/inspections/${stateA.id}/report`)).body;
// The summary names it `reportId`; the generate response returns the same shape. Reading `.id`
// silently yielded undefined and the revision calls then 404'd, which read as an immutability
// failure rather than an instrument one.
const reportId = reportSummary?.reportId || gen.body?.reportId;
check("R2 the report is readable back for its inspection", Boolean(reportId), JSON.stringify(reportSummary)?.slice(0, 160));

// The revisions route projects its own vocabulary -- `revisions[]`, `revision`, `checksum`,
// `supersededByRevisionId` -- rather than the entity's column names. Reading the entity names gave
// `undefined` and would have been written up as missing immutability metadata.
const revisionsBody1 = (await api(`/inspection-reports/${reportId}/revisions`)).body;
const revisions1 = revisionsBody1?.revisions || [];
// A DELTA, not an absolute. This stack's database outlives a single run, so "exactly one revision"
// was an assertion about how many times the instrument had been run.
const baselineRevisionCount = revisions1.length;
check("R3 the first issue produced a current revision", baselineRevisionCount >= 1
  && revisions1.some((r) => r.isCurrent), `${baselineRevisionCount} revision(s)`);
const v1 = revisions1.find((r) => r.isCurrent) || null;
check("R4 revision 1 carries a checksum and a generated timestamp",
  Boolean(v1?.checksum) && Boolean(v1?.generatedAt),
  `checksum=${v1?.checksum?.slice(0, 12)} at=${v1?.generatedAt}`);

// Download it and compute the checksum from the BYTES, not from the row.
async function downloadVersion(version) {
  const response = await fetch(
    `${API_URL}/inspection-reports/${reportId}/versions/${version}/download`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) return { status: response.status, sha: null, bytes: 0 };
  const buffer = Buffer.from(await response.arrayBuffer());
  return { status: response.status, sha: createHash("sha256").update(buffer).digest("hex"), bytes: buffer.length, buffer };
}
const v1Download = await downloadVersion(v1.revision);
check("R5 revision 1 downloads, and its BYTES hash to the checksum the record claims",
  v1Download.sha === v1.checksum,
  `downloaded=${v1Download.sha?.slice(0, 12)} recorded=${v1?.checksum?.slice(0, 12)} bytes=${v1Download.bytes}`);
check("R6 the artifact is a PDF", v1Download.buffer?.subarray(0, 5).toString() === "%PDF-",
  v1Download.buffer?.subarray(0, 8).toString());
if (v1Download.buffer) writeFileSync(`${OUT_DIR}/report-v1.pdf`, v1Download.buffer);

// -------------------------------------------------------------------------------------------
// PROVENANCE. Every material statement in the snapshot must be attributable.
// -------------------------------------------------------------------------------------------
/**
 * THE SNAPSHOT IS NOT REACHABLE THROUGH ANY CUSTOMER API.
 *
 * `GET /inspection-reports/:id` returns generation metadata and `GET .../revisions` returns the
 * revision ledger; neither carries `sourceSnapshot`. It exists only in the database, so the
 * STRUCTURAL provenance assertions below read it from there. What the CUSTOMER actually receives
 * is the PDF, and its content is reviewed separately -- a structure that is correct in a column
 * nobody can read is not the same as a report that says true things.
 */
const snapshot = (() => {
  try {
    const raw = execFileSync("psql", [
      process.env.DB_URL || "", "-At", "-c",
      `select "sourceSnapshot" from inspection_report_versions where id = '${v1.revisionId}'`,
    ], { encoding: "utf8" }).trim();
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    check("A0 the snapshot could be read for structural review", false, String(error).slice(0, 160));
    return {};
  }
})();
writeFileSync(`${OUT_DIR}/report-v1-snapshot.json`, JSON.stringify(snapshot, null, 2));
/**
 * FINDINGS LIVE UNDER THEIR OBSERVATION in the snapshot, not in a flat list -- which is the right
 * shape, because a finding belongs to the thing that was observed. Reading `snapshot.findings`
 * returned an empty array and every assertion below it passed VACUOUSLY on that emptiness, which is
 * the failure mode `.every()` invites. Hence A1, and hence the explicit non-vacuity guards.
 */
const snapshotObservations = snapshot.observations || [];
const snapshotFindings = snapshotObservations.flatMap((o) => o.findings || []);
check("A1 the snapshot carries the inspection's findings, under their observations",
  snapshotFindings.length > 0,
  `${snapshotObservations.length} observation(s), ${snapshotFindings.length} finding(s)`);
check("A2 every snapshot finding declares its SOURCE — HazLenz decomposition or inspector-authored",
  snapshotFindings.length > 0 && snapshotFindings.every((f) => f.source === "hazlenz_decomposition" || f.source === "user_authored"),
  snapshotFindings.map((f) => f.source).join(","));
check("A3 no superseded or dismissed finding reaches the report",
  snapshotFindings.length > 0 && snapshotFindings.every((f) => f.status !== "superseded" && f.status !== "dismissed"),
  snapshotFindings.map((f) => f.status).join(","));
check("A4 every reported finding carries the review that finalized it",
  snapshotFindings.length > 0
  && snapshotFindings.every((f) => Boolean(f.finalReviewId) || f.status !== "finalized"),
  snapshotFindings.map((f) => `${f.status}:${f.finalReviewId ? "reviewed" : "NO-REVIEW"}`).join(","));
check("A5 the review itself travels with the finding, not just its id — so the report can say WHO",
  snapshotFindings.length > 0 && snapshotFindings.every((f) => Boolean(f.finalReview)),
  snapshotFindings.map((f) => (f.finalReview ? "review-present" : "ID-ONLY")).join(","));
check("A6 a HazLenz-derived finding names the analysis it came from",
  snapshotFindings.length > 0 && snapshotFindings.every((f) =>
    f.source !== "hazlenz_decomposition" || Boolean(f.originatingAnalysisId || f.selectedAnalysisId)),
  snapshotFindings.map((f) => `${f.source}:${f.originatingAnalysisId ? "traced" : "untraced"}`).join(","));
check("A7 the reviewer's disposition is carried separately from HazLenz's conclusion",
  snapshotFindings.length > 0
  && snapshotFindings.every((f) => Object.prototype.hasOwnProperty.call(f, "reviewerDisposition")),
  snapshotFindings.map((f) => String(f.reviewerDisposition)).join(","));
observe("AUTHORITY-1 the snapshot's provenance fields",
  `Each finding carries: source=${[...new Set(snapshotFindings.map((f) => f.source))].join("/")}, `
  + `status, finalReviewId + the embedded finalReview, reviewerDisposition, originatingAnalysisId, `
  + `selectedAnalysisId, knowledgeReleaseId and its own riskSnapshot. The structure can express `
  + `every provenance class §285 names. Whether the PDF RENDERS them is reviewed separately.`);

// =================================================================================================
// 4. IMMUTABILITY — D-028. Reopen, change something material, finish, regenerate.
// =================================================================================================
const reopenTarget = (await api(`/inspections/${stateA.id}`)).body;
const reopen = await api(`/inspections/${stateA.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "draft", version: reopenTarget.version }),
});
check("I1 a completed inspection can be reopened by its owner", reopen.ok, `${reopen.status}`);

// Change something the report states: the inspection title is rendered on the report.
const beforeEdit = (await api(`/inspections/${stateA.id}`)).body;
const edited = await api(`/inspections/${stateA.id}`, {
  method: "PATCH",
  body: JSON.stringify({ title: `${beforeEdit.title} (revised at §285)`, version: beforeEdit.version }),
});
check("I2 a material change is accepted while reopened", edited.ok, `${edited.status}`);

const recompleted = await complete({ id: stateA.id });
check("I3 it completes again", recompleted.toCompleted.ok, `${recompleted.toCompleted.status}`);
const regen = await api(`/inspections/${stateA.id}/reports`, { method: "POST" });
check("I4 a successor report generates", regen.ok, `${regen.status}`);

const revisionsBody2 = (await api(`/inspection-reports/${reportId}/revisions`)).body;
const revisions2 = revisionsBody2?.revisions || [];
writeFileSync(`${OUT_DIR}/revisions-after-regenerate.json`, JSON.stringify(revisionsBody2, null, 2));
check("I5 THE ISSUED REVISION IS RETAINED — a successor was ADDED, not substituted",
  revisions2.length === baselineRevisionCount + 1
  && revisions2.some((r) => r.revision === v1.revision),
  `${baselineRevisionCount} -> ${revisions2.length}, revision ${v1.revision} still present: `
  + `${revisions2.some((r) => r.revision === v1.revision)}`);

const keptV1 = revisions2.find((r) => r.revision === v1.revision);
const v2 = revisions2.find((r) => r.isCurrent);
check("I6 revision 1 is MARKED SUPERSEDED", keptV1?.status === "superseded", keptV1?.status);
check("I7 revision 1 is LINKED to its successor",
  keptV1?.supersededByRevisionId === v2?.revisionId,
  `${keptV1?.supersededByRevisionId} -> ${v2?.revisionId}`);
check("I8 revision 1's recorded checksum is UNCHANGED", keptV1?.checksum === v1.checksum,
  `${keptV1?.checksum?.slice(0, 12)} vs ${v1.checksum?.slice(0, 12)}`);
check("I8b and the successor is marked current, so there is one unambiguous report",
  v2?.isCurrent === true && keptV1?.isCurrent === false,
  `v1.isCurrent=${keptV1?.isCurrent} v2.isCurrent=${v2?.isCurrent}`);

const v1Again = await downloadVersion(v1.revision);
check("I9 REVISION 1 IS STILL DOWNLOADABLE after its successor exists", v1Again.status === 200,
  `${v1Again.status}`);
check("I10 AND IT IS BYTE-IDENTICAL to what was issued",
  v1Again.sha === v1Download.sha && v1Again.bytes === v1Download.bytes,
  `${v1Again.sha?.slice(0, 12)} vs ${v1Download.sha?.slice(0, 12)} (${v1Again.bytes} vs ${v1Download.bytes} bytes)`);

const v2Download = await downloadVersion(v2.revision);
check("I11 the successor is a DIFFERENT artifact, not the same bytes re-stamped",
  v2Download.sha !== v1Download.sha, `${v2Download.sha?.slice(0, 12)} vs ${v1Download.sha?.slice(0, 12)}`);
check("I12 and the successor's bytes hash to ITS recorded checksum", v2Download.sha === v2?.checksum,
  `${v2Download.sha?.slice(0, 12)} vs ${v2?.checksum?.slice(0, 12)}`);
if (v2Download.buffer) writeFileSync(`${OUT_DIR}/report-v2.pdf`, v2Download.buffer);

// Duplicate generation with NO change must not create a third revision.
const regenNoChange = await api(`/inspections/${stateA.id}/reports`, { method: "POST" });
const revisions3 = ((await api(`/inspection-reports/${reportId}/revisions`)).body?.revisions) || [];
check("I13 regenerating with NOTHING CHANGED does not manufacture a revision",
  revisions3.length === revisions2.length,
  `${revisions2.length} -> ${revisions3.length} after a replay (${regenNoChange.status})`);

// -------------------------------------------------------------------------------------------
// WHAT THE CUSTOMER CAN ACTUALLY REACH. The server keeps all of this; the client asks for none
// of it, which is the half of D-028 that is not delivered.
// -------------------------------------------------------------------------------------------
const listed = (await api("/inspection-reports")).body;
const listedForThis = (Array.isArray(listed) ? listed : [])
  .find((r) => r.id === reportId || r.reportId === reportId);
observe("D-046 the revision history is server-only",
  `GET /inspection-reports returns one row per report (${JSON.stringify(Object.keys(listedForThis || {}))}). `
  + "The client calls only /inspection-reports and /inspection-reports/:id/download. It never calls "
  + "/revisions and never calls /versions/:version/download, so a customer cannot see that a "
  + "superseded revision exists, cannot tell which report they filed with a client, and cannot "
  + "retrieve it. The server retains it byte-identically; the product does not offer it.");

// =================================================================================================
// 5. MULTIPLE FINDINGS — separation, no cross-contamination.
// =================================================================================================
const stateE = byTitle("state E");
await complete({ id: stateE.id });
const genE = await api(`/inspections/${stateE.id}/reports`, { method: "POST" });
check("M0 the multi-finding inspection completes and reports", genE.ok, `${genE.status}`);
const reportE = (await api(`/inspections/${stateE.id}/report`)).body;
const revE = ((await api(`/inspection-reports/${reportE.reportId}/revisions`)).body?.revisions) || [];
const snapE = (() => {
  try {
    const raw = execFileSync("psql", [
      process.env.DB_URL || "", "-At", "-c",
      `select "sourceSnapshot" from inspection_report_versions where id = '${revE[0]?.revisionId}'`,
    ], { encoding: "utf8" }).trim();
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
})();
const findingsE = (snapE.observations || []).flatMap((o) => o.findings || []);
writeFileSync(`${OUT_DIR}/multi-finding-snapshot.json`, JSON.stringify(snapE, null, 2));

check("M1 every finding on the inspection reaches the report distinctly",
  findingsE.length >= 2 && new Set(findingsE.map((f) => f.id)).size === findingsE.length,
  `${findingsE.length} findings, ${new Set(findingsE.map((f) => f.id)).size} distinct ids`);
check("M2 each finding keeps its OWN hazard category",
  findingsE.length > 1 && new Set(findingsE.map((f) => f.hazardCategory)).size === findingsE.length,
  findingsE.map((f) => f.hazardCategory).join(" | "));
const citationsPerFinding = findingsE.map((f) =>
  (f.sourceCandidate?.standardCandidates || []).map((c) => c.citation).sort().join(","));
check("M3 STANDARDS DO NOT CROSS-CONTAMINATE — no two findings carry the identical citation set",
  citationsPerFinding.length > 1 && citationsPerFinding.every(Boolean)
  && new Set(citationsPerFinding).size === citationsPerFinding.length,
  citationsPerFinding.join(" || "));
/**
 * NOT AN ASSERTION. `finding.riskSnapshot` is written by `computeFindingRisk` on the REAL HazLenz
 * materialization path; the synthetic fixtures persist findings without ever entering it, so every
 * seeded finding carries `riskSnapshot = NULL`. That is a property of the FIXTURE, and recording it
 * as a product failure would be converting a fixture hole into a severity verdict.
 *
 * It is recorded loudly instead, because it bounds what §285 could measure: the severity/risk
 * parity dimension cannot be exercised on these fixtures at all.
 */
const withRisk = findingsE.filter((f) => f.riskSnapshot);
if (withRisk.length === findingsE.length && findingsE.length > 1) {
  check("M4 each finding carries its own risk snapshot", true,
    findingsE.map((f) => String(f.riskSnapshot?.overallRisk ?? f.riskSnapshot?.riskLevel)).join(","));
} else {
  observe("M4 NOT_EXERCISED — severity/risk parity cannot be measured on these fixtures",
    `${withRisk.length} of ${findingsE.length} findings carry a riskSnapshot. The synthetic HazLenz `
    + `seeds persist findings without running computeFindingRisk, so riskSnapshot is NULL on every `
    + `one. The finding-level severity rule, and therefore its parity across the workspace, the `
    + `finding review, the report record and the PDF, is NOT EXERCISED by this run. A fixture that `
    + `populates riskSnapshot is a prerequisite for that dimension.`);
}
check("M5 each finding is bound to its own observation",
  findingsE.length > 1 && findingsE.every((f) => Boolean(f.observationId)),
  findingsE.map((f) => String(f.observationId).slice(0, 8)).join(","));

writeFileSync(`${OUT_DIR}/results.json`, JSON.stringify({
  instrument: "§285 completion + report authority + immutability",
  account: EMAIL,
  entitlement: {
    planClaim: claims.planCode || claims.subscriptionTier || "unknown",
    note: "Recorded per §285 instrument discipline. Report generation and completion carry no entitlement gate on this path.",
  },
  providerCalls: 0,
  results, observations, failures,
}, null, 2));
console.log(`\n${results.length - failures} passed, ${failures} failed, ${observations.length} recorded observation(s).`);
console.log(`§285 completion + report: ${failures ? "FAIL" : "PASS"}`);
process.exit(failures ? 1 : 0);

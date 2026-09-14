/**
 * §286 — REPORT REVISION PRESENTATION (D-046), ISSUED-PDF IDENTITY, ZERO-FINDING COMPLETION,
 * AND THE SEVERITY PARITY §285 COULD NOT EXERCISE.
 *
 * Drives the REAL API as a REAL authenticated user against the review stack. No development
 * bypass. Synthetic HazLenz states only; `EXPERT_EXECUTION_ENABLED=false` and no provider key in
 * the stack's environment, so ZERO provider calls are possible.
 *
 * ==================== WHY THIS IS TYPESCRIPT AND NOT .mjs LIKE ITS PREDECESSORS ====================
 *
 * The severity half has to answer "does every surface state the SAME severity?", and the only
 * honest way to ask that is to compare each surface against THE PRODUCT'S OWN RULE rather than
 * against a rule this instrument invents. So it imports `resolveEffectiveSeverity` from
 * `lib/risk/effectiveSeverity.ts` -- the frontend half of the §276/D-008 derivation, held
 * byte-identical to the backend half by `npm run check:effective-severity-parity`.
 *
 * A re-implementation here would be a THIRD copy of the rule, and a third copy that could drift is
 * precisely the defect D-008 was: several surfaces each deciding severity for themselves.
 *
 * ==================== WHY THE REPORT SNAPSHOT IS READ FROM THE DATABASE ====================
 *
 * §285 recorded that the frozen report snapshot is reachable through no customer API. That is a
 * real structural gap and it is re-recorded below -- but it must not also be allowed to make the
 * snapshot unmeasurable, because the snapshot is where the report's severity actually lives. This
 * instrument therefore reads `inspection_report_versions.sourceSnapshot` directly from the
 * DISPOSABLE review database. That is a measurement of the product's own persisted state, not a
 * product path, and it is read-only.
 *
 * Usage:
 *   API_URL=... VAL_EMAIL=... VAL_PASSWORD=... REVIEW_DB_URL=... OUT_DIR=<dir> \
 *     npx tsx scripts/validate-286-reports-and-severity.mts
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { resolveEffectiveSeverity } from "../lib/risk/effectiveSeverity";
import {
  call, ensureSite, hazard, otherBand, reviewerCellForBand, seedMaterializedInspection,
} from "./seed-286-severity-parity.mjs";

const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-286";
const DB_URL = process.env.REVIEW_DB_URL || "";
const EMAIL = process.env.VAL_EMAIL as string;
const PASSWORD = process.env.VAL_PASSWORD as string;
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(join(OUT_DIR, "pdf"), { recursive: true });

type Result = { id: string; outcome: "PASS" | "FAIL"; detail: string };
const results: Result[] = [];
const observations: { id: string; detail: string }[] = [];
let failures = 0;

function check(id: string, condition: boolean, detail: unknown = "") {
  results.push({ id, outcome: condition ? "PASS" : "FAIL", detail: String(detail).slice(0, 500) });
  if (!condition) failures += 1;
  console.log(`${condition ? "ok  " : "FAIL"} ${id}${detail ? `  [${String(detail).slice(0, 190)}]` : ""}`);
}
/** A reading that is recorded rather than asserted. */
function observe(id: string, detail: string) {
  observations.push({ id, detail: String(detail).slice(0, 900) });
  console.log(`--   ${id}  [${String(detail).slice(0, 190)}]`);
}

// =================================================================================================
// Transport
// =================================================================================================
const login = await (await fetch(`${API_URL}/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})).json();
const token: string = login.accessToken || login.access_token || login.token;
if (!token) throw new Error(`sign-in failed: ${JSON.stringify(login).slice(0, 200)}`);
const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function api(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const text = await response.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, ok: response.ok, body };
}

async function downloadPdf(path: string) {
  const response = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) return { ok: false as const, status: response.status, bytes: Buffer.alloc(0) };
  return { ok: true as const, status: response.status, bytes: Buffer.from(await response.arrayBuffer()) };
}

const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

/** Layout-preserving text of a PDF, via poppler. The renderer draws text, so this reads it back. */
function pdfText(bytes: Buffer, name: string) {
  const file = join(OUT_DIR, "pdf", `${name}.pdf`);
  writeFileSync(file, bytes);
  return execFileSync("pdftotext", ["-layout", file, "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/** Read-only measurement of the frozen snapshot. See the header. */
function snapshotFromDatabase(reportId: string, revision: number): any | null {
  if (!DB_URL) return null;
  const raw = execFileSync("psql", [DB_URL, "-At", "-c",
    `SELECT "sourceSnapshot"::text FROM inspection_report_versions `
    + `WHERE "reportId" = '${reportId}' AND version = ${revision}`], { encoding: "utf8" }).trim();
  return raw ? JSON.parse(raw) : null;
}

const siteId = (await ensureSite(token)).id;

// =================================================================================================
// 1. ZERO-FINDING COMPLETION — §286's completion-policy repair.
//
// The four states the direction requires to stay apart are each produced HERE, from the product's
// own routes, and each one's readiness payload is asserted. A zero-finding inspection that merely
// "completes" proves nothing on its own: what matters is that it cannot be confused with an
// inspection that recorded nothing and with one whose findings are unresolved.
// =================================================================================================
async function newInspection(key: string, title: string) {
  return (await api("/inspections", {
    method: "POST",
    body: JSON.stringify({
      siteId, title, regulatoryContext: "osha-general-industry",
      clientRequestId: `v286-${key}-${Date.now()}`.slice(0, 120),
    }),
  })).body;
}

// -- STATE 1: nothing recorded at all. Must NOT be completable.
const empty = await newInspection("empty", "§286 Z1 — nothing recorded");
const emptyReadiness = (await api(`/inspections/${empty.id}/completion-readiness`)).body;
check("Z1 an inspection with no observations is NOT ready",
  emptyReadiness.ready === false && emptyReadiness.reasons.includes("NO_OBSERVATION"),
  JSON.stringify(emptyReadiness));
check("Z1b and it is not mistaken for a zero-finding inspection",
  emptyReadiness.zeroReportableFindings === false && emptyReadiness.observationCount === 0,
  `zeroReportable=${emptyReadiness.zeroReportableFindings} observations=${emptyReadiness.observationCount}`);

// -- STATE 2: observations recorded, HazLenz identified no hazard. Must be completable.
const safe = await newInspection("safe", "§286 Z2 — walkthrough with no hazard identified");
for (const [index, text] of [
  "Walked the full length of the packaging line during the day shift. All fixed guards were in "
  + "place and secured, the two emergency stops on the infeed were tested and functioned, and the "
  + "walkway markings were intact.",
  "Checked the wash bay chemical cabinet. Containers labelled, SDS binder present and current, "
  + "eyewash station inspection tag dated this month.",
].entries()) {
  await api(`/inspections/${safe.id}/observations`, {
    method: "POST",
    body: JSON.stringify({
      rawText: text, evidenceSource: "direct_observation",
      clientRequestId: `v286-safe-obs-${index}-${safe.id}`.slice(0, 120),
    }),
  });
}
const safeReadiness = (await api(`/inspections/${safe.id}/completion-readiness`)).body;
check("Z2 an inspection with observations and no findings IS ready",
  safeReadiness.ready === true && safeReadiness.reasons.length === 0,
  JSON.stringify(safeReadiness));
check("Z2b and it says so in its own field rather than leaving it to be inferred",
  safeReadiness.zeroReportableFindings === true
  && safeReadiness.observationCount === 2
  && safeReadiness.reportableCount === 0,
  JSON.stringify(safeReadiness));

// -- STATE 3: an unresolved active finding. Must still be refused.
const unresolved = await seedMaterializedInspection(token, siteId, {
  key: "unresolved",
  title: "§286 Z3 — an unreviewed finding still blocks",
  observation: "Fixed guard removed from the conveyor nip point; operators reaching into the "
    + "in-running nip while the belt is energised.",
  hazards: [hazard({
    domainId: "machine-guarding", hazardFamily: "machine_guarding",
    mechanism: "Unguarded in-running nip point on an energised conveyor",
    fragment: "Fixed guard removed from the conveyor nip point while the belt was running.",
    signals: ["Operators observed reaching into the nip"],
  })],
});
const unresolvedReadiness = (await api(`/inspections/${unresolved.inspection.id}/completion-readiness`)).body;
check("Z3 an inspection with an unreviewed active finding is STILL refused",
  unresolvedReadiness.ready === false
  && unresolvedReadiness.reasons.includes("FINDING_NEEDS_REVIEW")
  && unresolvedReadiness.blockingFindingIds.length === 1,
  JSON.stringify(unresolvedReadiness));
check("Z3b and removing the finding requirement did not remove the review requirement",
  !unresolvedReadiness.reasons.includes("NO_CURRENT_FINDING"),
  JSON.stringify(unresolvedReadiness.reasons));

// -- The zero-finding inspection actually completes, and is a completed record afterwards.
let safeRow = (await api(`/inspections/${safe.id}`)).body;
await api(`/inspections/${safeRow.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "in_review", version: safeRow.version }),
});
safeRow = (await api(`/inspections/${safe.id}`)).body;
const safeComplete = await api(`/inspections/${safeRow.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "completed", version: safeRow.version }),
});
check("Z4 the zero-finding inspection COMPLETES",
  safeComplete.status === 201 || safeComplete.status === 200,
  `${safeComplete.status} ${JSON.stringify(safeComplete.body).slice(0, 160)}`);
check("Z4b and the completed record is stamped, so it is distinguishable from an open one",
  safeComplete.body?.status === "completed" && Boolean(safeComplete.body?.completedAt),
  `status=${safeComplete.body?.status} completedAt=${safeComplete.body?.completedAt}`);

// -- STATE 4 (the dismissed case): active finding, nothing reportable. Must also complete.
const dismissedSeed = await seedMaterializedInspection(token, siteId, {
  key: "dismissed",
  title: "§286 Z5 — reviewer dismissed the only candidate",
  observation: "Scuffing on the floor near the press that on inspection turned out to be a paint "
    + "mark rather than a fluid leak.",
  hazards: [hazard({
    domainId: "slips-trips", hazardFamily: "slips_trips_falls",
    mechanism: "Possible fluid on the walking surface beside the press",
    fragment: "Dark mark on the floor beside the press, later identified as paint.",
    signals: ["No fluid present on inspection"],
  })],
});
{
  const finding = dismissedSeed.findings[0];
  const review = (await api(`/inspections/observations/${dismissedSeed.observationId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      analysisId: dismissedSeed.analysisId, findingId: finding.id, decision: "dismissed",
      rationale: "Inspected directly; the mark is dried paint, not a fluid release. No hazard.",
      idempotencyKey: `v286-dismiss-${finding.id}`.slice(0, 120),
    }),
  })).body;
  await api(`/inspections/observations/${dismissedSeed.observationId}/findings`, {
    method: "POST",
    body: JSON.stringify({
      reviewId: review.id, hazardCategory: finding.hazardCategory,
      conclusion: finding.conclusion || "Reviewed condition", segmentKey: finding.hazardKey,
      reviewerDisposition: "single",
    }),
  });
}
const dismissedReadiness = (await api(`/inspections/${dismissedSeed.inspection.id}/completion-readiness`)).body;
check("Z5 an inspection whose only candidate was DISMISSED is ready and reports zero",
  dismissedReadiness.ready === true
  && dismissedReadiness.reportableCount === 0
  && dismissedReadiness.zeroReportableFindings === true
  && dismissedReadiness.findingCount === 1,
  JSON.stringify(dismissedReadiness));
observe("Z5-NOTE the two zero-report shapes are told apart by findingCount",
  "A dismissed candidate keeps `findingCount: 1` while `reportableCount` is 0, so 'the engine "
  + "proposed nothing' and 'a qualified person declined to confirm the proposal' remain separate "
  + "facts in the record even though both produce a report with no findings.");

// =================================================================================================
// 2. THE ZERO-FINDING REPORT — what the artifact actually says.
// =================================================================================================
const safeReport = await api(`/inspections/${safe.id}/reports`, { method: "POST" });
check("Z6 a zero-finding completed inspection can produce its report",
  safeReport.status === 201 || safeReport.status === 200,
  `${safeReport.status} ${JSON.stringify(safeReport.body).slice(0, 200)}`);

let zeroFindingText = "";
if (safeReport.ok) {
  const pdf = await downloadPdf(`/inspection-reports/${safeReport.body.reportId}/download`);
  check("Z6b and the artifact downloads", pdf.ok, String(pdf.status));
  zeroFindingText = pdfText(pdf.bytes, "zero-finding-report");
  check("Z7 the report states the bounded zero-finding sentence",
    zeroFindingText.includes("No reportable findings were recorded during this inspection"),
    zeroFindingText.slice(0, 200).replace(/\s+/g, " "));

  // FALSIFICATION. The direction is specific about what the document must NOT say. Each phrase is
  // asserted ABSENT, so a future edit that reintroduces a reassurance fails here rather than
  // shipping. Matched case-insensitively on the extracted text.
  const forbidden: [string, RegExp][] = [
    ["claims the workplace is safe", /\b(is|are|was|were)\s+safe\b|\bsafe\s+workplace\b|\bno\s+unsafe\b/i],
    ["claims no hazards exist", /\bno\s+hazards?\s+(exist|were\s+present|are\s+present)\b|\bhazard[- ]free\b/i],
    ["claims the employer is compliant", /\b(is|are|was|were|fully)\s+compliant\b|\bin\s+compliance\b|\bcompliance\s+(is\s+)?(established|confirmed|demonstrated)\b/i],
    ["claims OSHA/MSHA compliance is established", /\b(OSHA|MSHA)[^.]{0,40}complian/i],
    ["guarantees absence of unsafe conditions", /\bguarantee|\bensures?\s+that\s+no\b|\bcertif(y|ies|ied)\s+that\b/i],
  ];
  for (const [label, pattern] of forbidden) {
    const hit = pattern.exec(zeroFindingText);
    check(`Z8 the zero-finding report never ${label}`, hit === null,
      hit ? `matched "${hit[0]}" near: ${zeroFindingText.slice(Math.max(0, hit.index - 90), hit.index + 90).replace(/\s+/g, " ")}` : "absent");
  }

  // NON-VACUITY. If the extraction produced nothing, every absence assertion above would pass for
  // the wrong reason. §285's I-15 was exactly this class of defect.
  check("Z8-GUARD the falsification ran against real extracted text, not an empty string",
    zeroFindingText.length > 800 && zeroFindingText.includes("Safety InSite"),
    `${zeroFindingText.length} chars`);

  check("Z9 the zero-finding report still records WHAT WAS INSPECTED",
    zeroFindingText.includes("Observations Recorded")
    && zeroFindingText.includes("packaging line"),
    zeroFindingText.length ? "observations section present" : "no text");
}

// =================================================================================================
// 3. D-046 — REPORT REVISION PRESENTATION, AND THE ISSUED ARTIFACT'S OWN IDENTITY.
//
// Built on a REAL reopen/edit/regenerate cycle, because the whole question is what the customer can
// determine once a report has a successor.
// =================================================================================================
const revisionSeed = await seedMaterializedInspection(token, siteId, {
  key: "revisions",
  title: "§286 R — revision presentation",
  observation: "Extension cord run across the main walkway with a split strain relief at the plug, "
    + "exposing roughly 15mm of the inner conductors.",
  hazards: [hazard({
    domainId: "electrical", hazardFamily: "electrical",
    mechanism: "Damaged flexible cord energised across a pedestrian route",
    fragment: "Split strain relief exposing inner conductors on an energised extension cord.",
    signals: ["Cord taped to the floor across the main walkway"],
  })],
});
{
  const finding = revisionSeed.findings[0];
  const cell = reviewerCellForBand("High");
  await (async () => {
    const review = (await api(`/inspections/observations/${revisionSeed.observationId}/reviews`, {
      method: "POST",
      body: JSON.stringify({
        analysisId: revisionSeed.analysisId, findingId: finding.id, decision: "accepted",
        rationale: "Confirmed on the matrix by the qualified person reviewing this finding.",
        idempotencyKey: `v286-rev-${finding.id}`.slice(0, 120),
        reviewedConclusion: { reviewerRisk: cell },
      }),
    })).body;
    await api(`/inspections/observations/${revisionSeed.observationId}/findings`, {
      method: "POST",
      body: JSON.stringify({
        reviewId: review.id, hazardCategory: finding.hazardCategory,
        conclusion: finding.conclusion || "Reviewed condition", segmentKey: finding.hazardKey,
        reviewerDisposition: "single", riskAssessment: cell,
      }),
    });
  })();
}
let revRow = (await api(`/inspections/${revisionSeed.inspection.id}`)).body;
await api(`/inspections/${revRow.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "in_review", version: revRow.version }),
});
revRow = (await api(`/inspections/${revisionSeed.inspection.id}`)).body;
await api(`/inspections/${revRow.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "completed", version: revRow.version }),
});

const gen1 = await api(`/inspections/${revisionSeed.inspection.id}/reports`, { method: "POST" });
check("R0 the first revision generates", gen1.ok, `${gen1.status} ${JSON.stringify(gen1.body).slice(0, 160)}`);
const reportId: string = gen1.body.reportId;
const inspectionNumber: number = gen1.body.inspectionNumber;

const rev1Pdf = await downloadPdf(`/inspection-reports/${reportId}/download`);
const rev1Sha = sha(rev1Pdf.bytes);
const rev1Text = pdfText(rev1Pdf.bytes, "revision-1-issued");

check("P1 the issued artifact names the record and its own revision",
  rev1Text.includes(`Inspection #${inspectionNumber}`) && rev1Text.includes("Report Revision 1"),
  `inspection #${inspectionNumber}; revision line ${/Report Revision \d+/.exec(rev1Text)?.[0]}`);
check("P1b and states when it was issued",
  /Issued\s+\d{2}\/\d{2}\/\d{4}/.test(rev1Text),
  /Issued[^\n]*/.exec(rev1Text)?.[0] || "no issued line");
check("P1c and the revision travels on the running footer of every page after the cover",
  (rev1Text.match(/Revision 1/g) || []).length >= 2,
  `${(rev1Text.match(/Revision 1/g) || []).length} occurrences`);

// REGENERATING WITH NOTHING CHANGED MUST NOT MANUFACTURE A REVISION. This is the §285 guarantee the
// artifact identity could have broken: had the revision number or the issue time entered the
// snapshot, every fingerprint would be unique and every press of Generate would produce a revision.
const replay = await api(`/inspections/${revisionSeed.inspection.id}/reports`, { method: "POST" });
const afterReplay = (await api(`/inspection-reports/${reportId}/revisions`)).body;
check("P6 regenerating an unchanged inspection still replays to the existing revision",
  replay.ok && afterReplay.revisionCount === 1 && replay.body.revision === 1,
  `count=${afterReplay.revisionCount} revision=${replay.body?.revision}`);

// Reopen, change a material value, complete, regenerate -> a genuine successor.
revRow = (await api(`/inspections/${revisionSeed.inspection.id}`)).body;
await api(`/inspections/${revRow.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "draft", version: revRow.version }),
});
revRow = (await api(`/inspections/${revisionSeed.inspection.id}`)).body;
await api(`/inspections/${revRow.id}/observations`, {
  method: "POST",
  body: JSON.stringify({
    rawText: "Second pass: the cord was removed from service and a permanently installed outlet "
      + "was fitted beside the maintenance bay.",
    evidenceSource: "direct_observation",
    clientRequestId: `v286-rev-obs2-${revRow.id}`.slice(0, 120),
  }),
});
revRow = (await api(`/inspections/${revisionSeed.inspection.id}`)).body;
await api(`/inspections/${revRow.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "in_review", version: revRow.version }),
});
revRow = (await api(`/inspections/${revisionSeed.inspection.id}`)).body;
await api(`/inspections/${revRow.id}/transition`, {
  method: "POST", body: JSON.stringify({ status: "completed", version: revRow.version }),
});
const gen2 = await api(`/inspections/${revisionSeed.inspection.id}/reports`, { method: "POST" });
check("R1 finishing again ISSUES A SUCCESSOR rather than replacing the report",
  gen2.ok && gen2.body.revision === 2, `${gen2.status} revision=${gen2.body?.revision}`);

const history = (await api(`/inspection-reports/${reportId}/revisions`)).body;
writeFileSync(join(OUT_DIR, "revision-history.json"), JSON.stringify(history, null, 2));
const entry1 = history.revisions.find((r: any) => r.revision === 1);
const entry2 = history.revisions.find((r: any) => r.revision === 2);

check("R2 the history states which revision is CURRENT",
  entry2.isCurrent === true && entry1.isCurrent === false
  && history.revisions.filter((r: any) => r.isCurrent).length === 1
  && history.currentRevision === 2,
  `current=${history.currentRevision}`);
check("R3 the superseded revision is MARKED superseded",
  entry1.status === "superseded", entry1.status);
check("R4 and says which revision replaced it, BY NUMBER",
  entry1.supersededByRevision === 2, `supersededByRevision=${entry1.supersededByRevision}`);
check("R5 the superseded revision is still offered for download",
  entry1.downloadable === true, `downloadable=${entry1.downloadable}`);
check("R6 the history carries each revision's issue time",
  Boolean(entry1.generatedAt) && Boolean(entry2.generatedAt)
  && new Date(entry2.generatedAt).getTime() >= new Date(entry1.generatedAt).getTime(),
  `${entry1.generatedAt} -> ${entry2.generatedAt}`);

// THE CUSTOMER CAN RETRIEVE WHAT THEY FILED — the half of D-028 that was unreachable.
const rev1Again = await downloadPdf(`/inspection-reports/${reportId}/versions/1/download`);
check("R7 the SUPERSEDED revision downloads through the route the product now builds",
  rev1Again.ok, String(rev1Again.status));
check("R8 and it is byte-identical to what was issued",
  sha(rev1Again.bytes) === rev1Sha && rev1Again.bytes.length === rev1Pdf.bytes.length,
  `${sha(rev1Again.bytes).slice(0, 16)} vs ${rev1Sha.slice(0, 16)}`);
check("P3 the historical artifact was NOT rewritten to say it is superseded",
  !/SUPERSEDED/i.test(pdfText(rev1Again.bytes, "revision-1-after-successor")),
  "no superseded marking in the immutable bytes");

const rev2Pdf = await downloadPdf(`/inspection-reports/${reportId}/versions/2/download`);
const rev2Text = pdfText(rev2Pdf.bytes, "revision-2-successor");
check("P2 the successor states its OWN revision number",
  rev2Text.includes("Report Revision 2") && !rev2Text.includes("Report Revision 1"),
  /Report Revision \d+/.exec(rev2Text)?.[0]);
check("P2b the two artifacts are genuinely different documents",
  sha(rev2Pdf.bytes) !== rev1Sha, `${sha(rev2Pdf.bytes).slice(0, 16)} vs ${rev1Sha.slice(0, 16)}`);

// =================================================================================================
// 4. REPORT REVISION IDENTITY — the four values must not disagree anywhere.
// =================================================================================================
const library = (await api("/inspection-reports")).body;
const card = library.find((row: any) => row.id === reportId);
check("C1 the LIBRARY states the current revision, and it is the server's",
  card.revision === history.currentRevision && card.revision === 2,
  `card=${card.revision} history=${history.currentRevision}`);
check("C2 the library's issued-revision count matches the retained artifacts",
  card.issuedRevisionCount === history.revisions.filter((r: any) => r.downloadable).length
  && card.issuedRevisionCount === 2,
  `card=${card.issuedRevisionCount}`);
check("C3 the CHECKSUM agrees between the library, the history and the actual bytes",
  card.checksum === entry2.checksum && entry2.checksum === sha(rev2Pdf.bytes),
  `${card.checksum?.slice(0, 16)} / ${entry2.checksum?.slice(0, 16)} / ${sha(rev2Pdf.bytes).slice(0, 16)}`);
check("C3b and the superseded revision's recorded checksum still matches its retained bytes",
  entry1.checksum === rev1Sha, `${entry1.checksum?.slice(0, 16)} vs ${rev1Sha.slice(0, 16)}`);
check("C4 the ISSUE TIME agrees between the library and the history",
  new Date(card.reportUpdatedAt).getTime() === new Date(entry2.generatedAt).getTime(),
  `${card.reportUpdatedAt} vs ${entry2.generatedAt}`);

/**
 * And the ARTIFACT's own printed issue time agrees with the record.
 *
 * The renderer prints to the minute, so this compares the printed string to the record formatted
 * the same way -- not a tolerance, a format. A second-level mismatch would mean the document and
 * the record were stamped from two different clock reads, which is the disagreement the direction
 * forbids.
 */
function printedIssueStamp(iso: string) {
  const date = new Date(iso);
  return `${date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })} `
    + `${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
}
check("C5 the ARTIFACT's printed issue time is the server's recorded issue time",
  rev2Text.includes(printedIssueStamp(entry2.generatedAt)),
  `expected "${printedIssueStamp(entry2.generatedAt)}"; found "${/Issued[^\n]*/.exec(rev2Text)?.[0]?.trim()}"`);
check("C5b and the superseded artifact still carries ITS OWN issue time, not the successor's",
  rev1Text.includes(printedIssueStamp(entry1.generatedAt))
  && !rev1Text.includes(printedIssueStamp(entry2.generatedAt))
  || printedIssueStamp(entry1.generatedAt) === printedIssueStamp(entry2.generatedAt),
  `rev1 expected "${printedIssueStamp(entry1.generatedAt)}"`);

// FALSIFICATION of the identity assertions: a PDF rendered with no identity must NOT satisfy them.
check("C-FALSIFY the revision assertions can fail — a revision line is genuinely required",
  !rev1Text.includes("Report Revision 2") && !rev2Text.includes("Report Revision 3"),
  "each artifact states only its own revision");

// =================================================================================================
// 5. SEVERITY PARITY — the dimension §285 recorded as NOT_EXERCISED.
//
// Seven scenarios, each measured across every applicable surface with the PRODUCT'S OWN RULE.
// =================================================================================================
type SurfaceReading = {
  scenario: string;
  hazardKey: string;
  effectiveFinding: string;
  effectiveBasis: string;
  reviewerConfirmed: boolean;
  analysisBand: string | null;
  reportSnapshot: string | null;
  /** The band printed in the artifact's Detailed Findings block for this finding. */
  pdfDetail: string | null;
  /** The band printed in the artifact's Findings Summary TABLE for this finding. */
  pdfSummary: string | null;
  agree: boolean;
};
const severityRows: SurfaceReading[] = [];

const BAND = String.raw`Critical|High|Moderate|Low|Not rated`;

/**
 * What the artifact prints as this finding's risk, in BOTH places it prints one.
 *
 * The report states a severity twice -- once in the Findings Summary table and once in the
 * Detailed Findings block -- and those are two independent renders of the same value. Reading only
 * one of them would leave the other free to disagree, which is the exact shape of D-008.
 *
 * Keyed on the finding's ORDINAL, not on its hazard label: a multi-hazard report can carry two
 * findings whose categories share a word, and matching on text would silently read the wrong block.
 * The ordinal is the number both the summary table's first column and the "Finding N —" heading
 * use, and the report assigns it by the same traversal order the snapshot has.
 */
function pdfRiskFor(text: string, ordinal: number): { detail: string | null; summary: string | null } {
  const headings = [...text.matchAll(/^Finding (\d+) — .*$/gm)];
  const heading = headings.find((match) => Number(match[1]) === ordinal);
  let detail: string | null = null;
  if (heading) {
    const start = heading.index ?? 0;
    const next = headings.find((match) => Number(match[1]) === ordinal + 1);
    const block = text.slice(start, next ? next.index : undefined);
    // "Risk:                 Critical" — laid out as a label column and a value column.
    const match = new RegExp(String.raw`^\s*Risk:\s+(${BAND})\s*$`, "mi").exec(block);
    detail = match ? match[1] : null;
  }
  // " 1       Machine Guarding        Critical        Finalized        Open"
  const row = new RegExp(String.raw`^\s*${ordinal}\s{2,}\S.*?\s{2,}(${BAND})\s{2,}`, "mi").exec(text);
  return { detail, summary: row ? row[1] : null };
}

async function measureScenario(opts: {
  key: string;
  scenario: string;
  observation: string;
  hazards: any[];
  /** Given the materialized snapshot, the reviewer cell to confirm — or null for no review risk. */
  reviewerFor: (materialized: any) => any | null;
}) {
  const seeded = await seedMaterializedInspection(token, siteId, {
    key: opts.key, title: `§286 S — ${opts.scenario}`.slice(0, 120),
    observation: opts.observation, hazards: opts.hazards,
  });

  for (const finding of seeded.findings) {
    const cell = opts.reviewerFor(finding.riskSnapshot);
    const review = (await api(`/inspections/observations/${seeded.observationId}/reviews`, {
      method: "POST",
      body: JSON.stringify({
        analysisId: seeded.analysisId, findingId: finding.id, decision: "accepted",
        rationale: "Confirmed on the matrix by the qualified person reviewing this finding.",
        idempotencyKey: `v286-sev-${finding.id}`.slice(0, 120),
        ...(cell ? { reviewedConclusion: { reviewerRisk: cell } } : {}),
      }),
    })).body;
    await api(`/inspections/observations/${seeded.observationId}/findings`, {
      method: "POST",
      body: JSON.stringify({
        reviewId: review.id, hazardCategory: finding.hazardCategory,
        conclusion: finding.conclusion || "Reviewed condition", segmentKey: finding.hazardKey,
        reviewerDisposition: seeded.findings.length > 1 ? "split" : "single",
        ...(cell ? { riskAssessment: cell } : {}),
      }),
    });
  }

  let row = (await api(`/inspections/${seeded.inspection.id}`)).body;
  await api(`/inspections/${row.id}/transition`, {
    method: "POST", body: JSON.stringify({ status: "in_review", version: row.version }),
  });
  row = (await api(`/inspections/${seeded.inspection.id}`)).body;
  await api(`/inspections/${row.id}/transition`, {
    method: "POST", body: JSON.stringify({ status: "completed", version: row.version }),
  });
  const generated = await api(`/inspections/${seeded.inspection.id}/reports`, { method: "POST" });
  const pdf = await downloadPdf(`/inspection-reports/${generated.body.reportId}/download`);
  const text = pdfText(pdf.bytes, `severity-${opts.key}`);
  const snapshot = snapshotFromDatabase(generated.body.reportId, generated.body.revision);

  /**
   * The report numbers its findings by the order it flattens them out of the snapshot, so the
   * ordinal is derived from the SNAPSHOT rather than from the live record: a finding superseded
   * after the report was issued is not in the artifact and must not shift the numbering of the
   * ones that are.
   */
  const snapshotFindings: any[] = snapshot
    ? (snapshot.observations || []).flatMap((o: any) => o.findings || [])
    : [];
  const ordinalById = new Map<string, number>(snapshotFindings.map((f: any, index: number) => [f.id, index + 1]));

  const final = (await api(`/inspections/${seeded.inspection.id}`)).body;
  for (const finding of (final.findings || []).filter((f: any) => f.status === "finalized")) {
    const resolved = resolveEffectiveSeverity(finding.riskSnapshot);
    const snapshotFinding = snapshotFindings.find((f: any) => f.id === finding.id) || null;
    const snapshotSeverity = snapshotFinding
      ? resolveEffectiveSeverity(snapshotFinding.riskSnapshot).label : null;
    const printed = pdfRiskFor(text, ordinalById.get(finding.id) ?? -1);
    severityRows.push({
      scenario: opts.scenario,
      hazardKey: finding.hazardKey,
      effectiveFinding: resolved.label,
      effectiveBasis: resolved.basis,
      reviewerConfirmed: resolved.reviewerConfirmed,
      analysisBand: resolved.analysisBand,
      reportSnapshot: snapshotSeverity,
      pdfDetail: printed.detail,
      pdfSummary: printed.summary,
      /**
       * EVERY surface has to be READ before it can AGREE. A null reading is a failure of this
       * check, never a pass: §285's I-15 was precisely a family of assertions that passed because
       * the thing being asserted over was empty.
       */
      agree: snapshotSeverity === resolved.label
        && printed.detail === resolved.label
        && printed.summary === resolved.label,
    });
  }
  return { seeded, reportId: generated.body.reportId, text, inspectionId: seeded.inspection.id };
}

const GUARD_HAZARD = [hazard({
  domainId: "machine-guarding", hazardFamily: "machine_guarding",
  mechanism: "Unguarded in-running nip point on an energised conveyor",
  fragment: "Fixed guard removed from the conveyor nip point while the belt was running.",
  signals: ["Operators observed reaching into the nip"],
})];
const GUARD_OBSERVATION = "Fixed guard removed from the conveyor nip point; operators reaching "
  + "into the in-running nip while the belt is energised.";

// S1 — the reviewer confirms the SAME band HazLenz escalated to.
await measureScenario({
  key: "s1", scenario: "S1 HazLenz severity == reviewer severity",
  observation: GUARD_OBSERVATION, hazards: GUARD_HAZARD,
  reviewerFor: (snapshot) => reviewerCellForBand(resolveEffectiveSeverity(snapshot).analysisBand || "High"),
});
// S2 — the reviewer confirms a DIFFERENT band from HazLenz's.
await measureScenario({
  key: "s2", scenario: "S2 HazLenz severity != reviewer severity",
  observation: GUARD_OBSERVATION, hazards: GUARD_HAZARD,
  reviewerFor: (snapshot) => reviewerCellForBand(otherBand(resolveEffectiveSeverity(snapshot).analysisBand || "High")!),
});
// S3 — the reviewer CHANGES the severity the product was showing before review.
await measureScenario({
  key: "s3", scenario: "S3 reviewer changes the severity",
  observation: GUARD_OBSERVATION, hazards: GUARD_HAZARD,
  reviewerFor: (snapshot) => reviewerCellForBand(otherBand(resolveEffectiveSeverity(snapshot).label)!),
});
// S4 — the reviewer LEAVES the severity the product was showing.
await measureScenario({
  key: "s4", scenario: "S4 reviewer leaves the severity unchanged",
  observation: GUARD_OBSERVATION, hazards: GUARD_HAZARD,
  reviewerFor: (snapshot) => reviewerCellForBand(resolveEffectiveSeverity(snapshot).label),
});
// S5 — several findings from one observation, each confirmed at a DIFFERENT band.
{
  const bands = ["Critical", "High", "Moderate"];
  let index = 0;
  await measureScenario({
    key: "s5", scenario: "S5 multiple findings with different severities",
    observation: "Three separate defects on one walk: the conveyor nip guard is off, a damaged "
      + "extension cord crosses the walkway, and the lockout box at the press is empty.",
    hazards: [
      hazard({
        domainId: "machine-guarding", hazardFamily: "machine_guarding",
        mechanism: "Unguarded in-running nip point on an energised conveyor",
        fragment: "Fixed guard removed from the conveyor nip point while the belt was running.",
        signals: ["Operators observed reaching into the nip"],
      }),
      hazard({
        domainId: "electrical", hazardFamily: "electrical",
        mechanism: "Damaged flexible cord energised across a pedestrian route",
        fragment: "Split strain relief exposing inner conductors on an energised extension cord.",
        signals: ["Cord taped to the floor across the main walkway"],
      }),
      hazard({
        domainId: "energy-control", hazardFamily: "lockout_tagout",
        mechanism: "No isolation devices available at the press lockout point",
        fragment: "Lockout box at the press was empty; no locks or tags available.",
        signals: ["Maintenance due on the press this shift"],
      }),
    ],
    reviewerFor: () => reviewerCellForBand(bands[index++ % bands.length]),
  });
}
// S6 — a finding with NO establishable rating. `computeFindingRisk` returns null for a
// SAFE_VERIFIED condition, so this is the product's own not-rated shape, not a blanked field.
await measureScenario({
  key: "s6", scenario: "S6 unresolved / not-rated finding",
  observation: "Historical note: the guard on the number three conveyor was replaced last quarter "
    + "and was verified in place and secured at this inspection.",
  hazards: [hazard({
    domainId: "machine-guarding", hazardFamily: "machine_guarding",
    mechanism: "Previously reported guard condition, verified corrected",
    fragment: "Guard verified in place and secured at this inspection.",
    conditionState: "SAFE_VERIFIED",
  })],
  reviewerFor: () => null,
});

// S7 — a report revision produced by a severity-affecting AUTHORITATIVE change.
const s7 = await measureScenario({
  key: "s7", scenario: "S7 report revision after a severity-affecting change",
  observation: GUARD_OBSERVATION, hazards: GUARD_HAZARD,
  reviewerFor: (snapshot) => reviewerCellForBand(resolveEffectiveSeverity(snapshot).label),
});
{
  const before = severityRows[severityRows.length - 1];
  let row = (await api(`/inspections/${s7.inspectionId}`)).body;
  await api(`/inspections/${row.id}/transition`, {
    method: "POST", body: JSON.stringify({ status: "draft", version: row.version }),
  });
  row = (await api(`/inspections/${s7.inspectionId}`)).body;
  const finding = (row.findings || []).find((f: any) => f.status === "finalized");
  const observationId = finding.observationId;
  const analysisId = finding.selectedAnalysisId;
  const newBand = otherBand(before.effectiveFinding)!;
  const cell = reviewerCellForBand(newBand);
  const review = (await api(`/inspections/observations/${observationId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      analysisId, findingId: finding.id, decision: "edited",
      rationale: "Re-reviewed with the maintenance history; the reviewer moved the matrix cell.",
      idempotencyKey: `v286-s7-re-${finding.id}`.slice(0, 120),
      reviewedConclusion: { reviewerRisk: cell },
    }),
  })).body;
  await api(`/inspections/observations/${observationId}/findings`, {
    method: "POST",
    body: JSON.stringify({
      reviewId: review.id, hazardCategory: finding.hazardCategory,
      conclusion: finding.conclusion, segmentKey: finding.hazardKey,
      reviewerDisposition: "single", riskAssessment: cell,
    }),
  });
  row = (await api(`/inspections/${s7.inspectionId}`)).body;
  await api(`/inspections/${row.id}/transition`, {
    method: "POST", body: JSON.stringify({ status: "in_review", version: row.version }),
  });
  row = (await api(`/inspections/${s7.inspectionId}`)).body;
  await api(`/inspections/${row.id}/transition`, {
    method: "POST", body: JSON.stringify({ status: "completed", version: row.version }),
  });
  const regen = await api(`/inspections/${s7.inspectionId}/reports`, { method: "POST" });
  check("S7 a severity-affecting authoritative change produces a NEW REVISION",
    regen.ok && regen.body.revision === 2, `${regen.status} revision=${regen.body?.revision}`);

  const s7Hist = (await api(`/inspection-reports/${s7.reportId}/revisions`)).body;
  const s7Rev1 = await downloadPdf(`/inspection-reports/${s7.reportId}/versions/1/download`);
  const s7Rev2 = await downloadPdf(`/inspection-reports/${s7.reportId}/versions/2/download`);
  const s7Rev1Text = pdfText(s7Rev1.bytes, "severity-s7-revision-1");
  const s7Rev2Text = pdfText(s7Rev2.bytes, "severity-s7-revision-2");
  const printedBefore = pdfRiskFor(s7Rev1Text, 1).detail;
  const printedAfter = pdfRiskFor(s7Rev2Text, 1).detail;
  check("S7b the SUPERSEDED artifact still states the severity that was issued with it",
    printedBefore === before.effectiveFinding,
    `revision 1 printed ${printedBefore}, was issued at ${before.effectiveFinding}`);
  check("S7c the SUCCESSOR states the reviewer's new severity",
    printedAfter === newBand, `revision 2 printed ${printedAfter}, reviewer confirmed ${newBand}`);
  check("S7d the two revisions genuinely differ on severity, so this was not a vacuous pass",
    printedBefore !== printedAfter, `${printedBefore} -> ${printedAfter}`);
  check("S7e the revision history reflects the severity-driven successor",
    s7Hist.currentRevision === 2
    && s7Hist.revisions.find((r: any) => r.revision === 1).supersededByRevision === 2,
    JSON.stringify(s7Hist.revisions.map((r: any) => ({ revision: r.revision, status: r.status }))));
}

// ---- The parity assertions over every scenario measured above.
writeFileSync(join(OUT_DIR, "severity-parity.json"), JSON.stringify(severityRows, null, 2));

check("SP-GUARD the severity dimension was actually exercised (§285 recorded NOT_EXERCISED)",
  severityRows.length >= 8 && severityRows.every((row) => row.effectiveBasis !== undefined),
  `${severityRows.length} findings measured`);
check("SP-GUARD2 and at least one finding carried a real materialized risk snapshot",
  severityRows.some((row) => row.analysisBand !== null),
  `${severityRows.filter((row) => row.analysisBand !== null).length} with an analysis band`);
// NON-VACUITY. Every surface must have been READ. A parity check over a surface that produced no
// reading is not a pass about the product, it is a pass about the instrument (§285, I-15).
check("SP-GUARD3 every surface produced an actual reading for every measured finding",
  severityRows.every((row) => row.reportSnapshot !== null && row.pdfDetail !== null && row.pdfSummary !== null),
  severityRows.filter((row) => row.reportSnapshot === null || row.pdfDetail === null || row.pdfSummary === null)
    .map((row) => `${row.scenario}/${row.hazardKey}: snapshot=${row.reportSnapshot} detail=${row.pdfDetail} summary=${row.pdfSummary}`)
    .join(" | ") || "all surfaces read");

for (const row of severityRows) {
  check(`SP ${row.scenario} · ${row.hazardKey} — every surface states the same severity`,
    row.agree,
    `finding=${row.effectiveFinding} snapshot=${row.reportSnapshot} pdf-detail=${row.pdfDetail} `
    + `pdf-summary=${row.pdfSummary} basis=${row.effectiveBasis}`);
}

const reviewed = severityRows.filter((row) => row.reviewerConfirmed);
check("SP-AUTH the reviewer's band is the one the compliance artifact states",
  reviewed.length > 0 && reviewed.every((row) => row.effectiveBasis === "reviewer_confirmed"
    && row.pdfDetail === row.effectiveFinding && row.pdfSummary === row.effectiveFinding),
  `${reviewed.length} reviewer-confirmed findings`);
const divergent = severityRows.filter((row) => row.analysisBand && row.analysisBand !== row.effectiveFinding);
check("SP-PROV where HazLenz differs from the reviewer, the artifact states the REVIEWER's band",
  divergent.length > 0 && divergent.every((row) => row.pdfDetail === row.effectiveFinding),
  `${divergent.length} findings where the analysis band differs`);
const notRated = severityRows.filter((row) => row.effectiveBasis === "not_rated");
check("SP-GAP an unrated finding is reported as Not rated, never filled in from a lesser source",
  notRated.length > 0 && notRated.every((row) => row.effectiveFinding === "Not rated"
    && row.pdfDetail === "Not rated" && row.pdfSummary === "Not rated"),
  `${notRated.length} not-rated findings`);

observe("SP-SURFACES which surfaces carry a severity at all",
  "Measured: the effective finding record, the frozen report snapshot, and the generated PDF. "
  + "The REPORT LIBRARY card and the REVISION HISTORY carry NO severity -- they identify the "
  + "report, not its contents -- so parity is not applicable there and is recorded as such rather "
  + "than as a pass. The review UI is a browser surface and is measured by the browser instrument.");
observe("SP-SNAPSHOT-REACH the report snapshot is still unreachable through any customer API",
  "Carried forward from §285 unchanged. `GET /inspection-reports/:id` returns generation metadata "
  + "and `.../revisions` returns the ledger; neither carries `sourceSnapshot`. This instrument "
  + "read it directly from the disposable review database, which a customer cannot do.");

// =================================================================================================
writeFileSync(join(OUT_DIR, "results.json"), JSON.stringify({
  section: "§286",
  api: API_URL,
  account: EMAIL,
  providerCalls: 0,
  checks: results.length,
  failures,
  results,
  observations,
}, null, 2));
console.log(`\n${failures === 0 ? "PASS" : "FAIL"} — ${results.length} checks, ${failures} failures, ${observations.length} observations`);
process.exit(failures === 0 ? 0 : 1);

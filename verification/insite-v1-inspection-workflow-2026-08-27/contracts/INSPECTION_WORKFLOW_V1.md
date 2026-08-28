# INSITE v1.0 — INSPECTION WORKFLOW

`FIELD LOOP AND FINISH SEMANTICS: IMPLEMENTED LOCALLY AND VERIFIED IN THE BROWSER.`
`POST-COMPLETION / REPORT / REOPEN LIFECYCLE: NOT YET WALKED. NOT ACCEPTED.`

Designed interactively with the product owner on 2026-08-27 against a disposable stack, and
implemented as each decision was made. Nothing here is deployed and nothing is committed.

---

## 1. Inspection setup `TARGET_DEFINED — NOT IMPLEMENTED`

Owner-specified sequence, progressive reveal on one screen; the type cards stay hidden until the
preceding answers exist:

1. **Inspection name** — asked first, prefilled (e.g. `Crusher Plant — 27 Aug 2026`), editable
2. **Site**
3. **Regulatory context**
4. **Inspector(s)** — account holder prefilled and editable; `+ Add another inspector` gives
   free-text names, listed on the report cover
5. **Confidential?** — cover marker only; the rest of the report is unchanged
6. Inspection type options appear, and selecting one starts that process

`NOT_IMPLEMENTED`: inspector(s) and the confidential flag are new data on the canonical path.
`DEFECT (live today)`: an organization-scoped inspection prints `Inspector: Not recorded`, because
`preparedBy` resolves from `inspection.ownerUserId`, which is NULL whenever `organizationId` is set.
Asking outright fixes this as a side effect.

## 2. The field loop `IMPLEMENTED`

```
Record it → HazLenz → Risk & fix → Review → Save → back to Record it
```

No interstitial between findings. Save shows a brief non-blocking `✓ Finding saved` and returns to
capture. **Measured through the real controls, findings 3–10: 7 interactions per finding**, 8–9
where a candidate confirmation appeared.

A persistent bar carries a collapsed `Findings (N)` list — title and risk band only, each entry
opening the existing review/edit flow — plus `+ Record another condition` (primary) and
`Finish inspection` (secondary). The bar appears only once a finding is saved.

**The count is `status = 'finalized'` only.** A dismissed candidate is not a finding. A candidate
still pending review is not yet a finding. A user-authored finding that completed Review → Save is
a finding and counts normally.

### 2.1 Capture `IMPLEMENTED`
Photo first as a camera action (`capture="environment"`), then *What did you see?*, then location
(**optional**) and task. Regulatory context is prefilled from the inspection and changeable here as
a correction affordance, not asked blank. The step bar is named for the customer
(`Record it · HazLenz · Risk & fix · Review · Finish`); `Status: Draft · revision N` is gone.

### 2.2 Candidate confirmation `IMPLEMENTED`
Shown **only when more than one candidate is proposed** — a single-candidate finding gains no extra
interaction. Every candidate is listed with its own evidence fragment, risk and standard.
Preselected when it is the decomposition's primary hazard, **or** a standard applies directly,
**or** its own risk band is High/Critical — biased toward inclusion, so the bias only ever runs
against low-risk candidates carrying no direct standard.

Unticked candidates are recorded as `human_reviews(decision='dismissed')` → `finding.status =
'dismissed'`: auditable, no corrective-action obligation, excluded from the report, and never
silently discarded — they remain listed as *"Not confirmed — not in the report"* with one-tap
restore. **The customer is never asked to justify a rejection.**

When an observation produces **no** candidates, the screen says so honestly and offers *Revise what
I wrote* or *Add a finding HazLenz missed*.

### 2.3 HazLenz step `IMPLEMENTED`
All applicable standards, collapsed to citation + title, expandable to the regulatory text, each
with its own confidence chip. Opening the chip offers the questions that would raise it, or states
plainly that no question would change it — **clarification is pulled by the reviewer, never pushed**,
and nothing blocks saving.

### 2.4 Risk & fix `IMPLEMENTED`
The real 5×5 matrix, seeded from the finding's own computed risk. Bands come from
`lib/inspection/riskBands.ts`, the single frontend representation of
`backend/src/safescope-v2/risk/risk-profiles.ts`, held to it by `npm run check:risk-band-parity`.

Rationale is **optional in every case** and provenance-aware: *"Why this risk?"* for a
user-authored finding, *"Why you changed it"* when the reviewer moves off HazLenz's assessment, and
a collapsed note when they accept it.

Corrective actions are this finding's own HazLenz suggestions, selectable and editable, plus the
reviewer's own. Where nothing can be suggested, a usable three-field editor appears headed
**Add corrective action** with neutral placeholders and no pre-filled substantive text.

**Responsible person** is optional; **blank means Unassigned and the inspector is never written in**.
**Due date is governed by risk and displayed, never entered**: Critical 1 / High 3 / Moderate 7 /
Low 14 days, shown as *"Aug 30, 2026 — Based on High risk — 3 days"*.

### 2.5 User-authored findings `IMPLEMENTED`
`Add a finding HazLenz missed` records a hazard the engine did not propose, as a real
`pending_review` finding with `source = 'user_authored'` — **no citation, no confidence, no risk**,
and no analysis claimed as its origin. It then enters the same Risk & fix → Review → Save flow.
Finalization never converts its provenance, and re-running HazLenz never supersedes it.

`Add a finding HazLenz missed` and `None of these — revise what I wrote` are deliberately distinct
actions: the first means the observation is valid and HazLenz missed something, the second that the
observation itself was wrong.

## 3. Finish `IMPLEMENTED`

Purpose is **completing the inspection**; the report is what completion produces.

Readiness comes from `GET /inspections/:id/completion-readiness`, evaluated by the **same**
`evaluateCompletionReadiness()` the transition enforces — the UI cannot show a readiness the server
disagrees with. Frontend readiness is UX; the server still enforces the contract independently.

* Ready: `Ready to finish — N findings reviewed` (finalized only; dismissed excluded)
* Blocked: `N findings need review before you can finish`, with every blocking finding shown as
  **Needs review** and a direct **Continue review**
* The primary action is disabled while blocked

Each finalized finding card carries: title, risk band, standard (or truthful no-standard state),
the remediation plan, responsible person or **Unassigned**, and the governed due date. User-authored
findings keep their concise provenance line.

Primary action: **Finish inspection** — *"Finishes the inspection and creates a report version."*

**NO NEW COMPLETION REQUIREMENT WAS ADDED.** Corrective action, responsible person, rationale,
standard citation and clarification answers all remain optional exactly as before. Unassigned is a
truthful allowed state.

## 4. What is NOT yet designed

The post-completion destination, report lifecycle, reopen and regeneration remain **as found**.
They have not been walked and nothing about them is accepted.

---

## 5. Completed inspection, report artefact and reopen `IMPLEMENTED`

### 5.1 Post-finish destination
Finishing routes to **`/inspection-complete`**, the completed-inspection detail for the inspection
just finished — not the generic report library, where the inspection itself disappeared and the
report became the only visible object. The canonical inspection remains the single source of truth;
this page creates no second record and reads every value from it.

It leads with **Inspection complete**, the site and inspection title, completion timestamp, finding
count, jurisdiction, current report version, and a risk distribution. No raw UUIDs appear in the
normal UI; the inspection id and version checksums sit behind **Technical details**.

### 5.2 Findings on the completed inspection
Every finalized finding is readable without opening the PDF: title, risk band, standard or truthful
no-standard state, the remediation plan, responsible person or **Unassigned**, the governed due
date, and the concise `user_authored` provenance line where it applies. Dismissed HazLenz proposals
are absent.

### 5.3 Report as an artefact
A separate **Report** section lists versions as `Version N · Current` / `Version N · Previous`, each
independently downloadable. Internal lifecycle words (`generated`, `superseded`) and checksums are
demoted to Technical details. The model presented is *"this inspection has Report v2"*, never
*"this report is the inspection"*.

Report naming is **not** implemented: the report displays the inspection title and site. Independent
durable report naming remains a W-3 item; no frontend-only name was invented.

### 5.4 Reopen
**Reopen inspection** on the completed page, with a confirmation stating the consequence:

> This makes the inspection editable again. Report v1 stays exactly as it is, preserved as the
> previous completed version. Finishing again creates a new version.

It performs the existing authoritative `transition → draft`; there is no frontend edit mode.
Editing a completed inspection is impossible without crossing this boundary — viewing is allowed
while completed, editing requires reopening. After reopening the customer returns to the workspace
with the capture loop and running summary restored, and can add a missed finding without the 409.

### 5.5 Report immutability across reopen `MEASURED`

Full browser + database walk of `complete → view → reopen → add missed finding → finish again`:

| check | result |
|---|---|
| v1 bytes before reopen | 26,476 |
| v1 sha256 before reopen | `357c48148513da47a1b0fc5b10e83444fa15eda074b3de8b1f7aa75df7e5b50c` |
| **v1 bytes after reopen + recompletion** | **26,476 — unchanged** |
| **v1 sha256 after** | **`357c4814…b50c` — unchanged** |
| v1 frozen findings | 12 |
| v2 frozen findings | 13 |
| the new finding appears in | v2 only (v1 = 0 occurrences) |
| dismissed candidates in either version | **0** |
| v1 still downloadable | yes (`superseded`, 200, `application/pdf`) |

`superseded` is a pointer change on the version row, not a content change: the frozen
`sourceSnapshot`, the stored PDF, its size and its checksum are all untouched.

### 5.6 Inspection version vs report version
`inspection.version` is an optimistic-locking counter and is **never** shown as a customer version.
Only report version numbering is exposed, because only that is the customer's artefact sequence.

### 5.7 Account isolation `MEASURED`
A second account received **404** on the completed inspection, its report lookup, its completion
readiness, its report download, and an attempted reopen.

### 5.8 Delete Report — INSPECTED, NOT CHANGED, NOT EXECUTED
`CanonicalReportsService.archive()` sets `inspection_reports.archivedAt` and writes a
`report_archived` audit event. It does **not** delete the report row, the version rows, the frozen
snapshots, the stored PDFs, or the inspection. `list()` filters archived reports out, and **there is
no unarchive route**, so the effect is: the report disappears from the library permanently from the
customer's point of view, while every artefact survives in the database.

The button says **"Delete Report"**. The semantics are neither a delete nor a reversible archive.
**This is a separate decision and was deliberately left unchanged.**

---

## 6. ONE CURRENT REPORT PER INSPECTION `IMPLEMENTED` — **SUPERSEDES §5.3, §5.4, §5.5 and §5.8**

Decided by the product owner on 2026-08-27, after §5 had been implemented and measured. Everything
in §5.3 (`Version N · Current` / `Version N · Previous`), §5.4's reopen copy, §5.5's
report-immutability-across-reopen table and §5.8's untouched `Delete Report` describes the
**previous** contract and is retained above only as history. Where the two disagree, §6 governs.

### 6.1 The model

```
Inspection ──▶ one current report

completed ──▶ reopen ──▶ edit ──▶ finish again ──▶ the current report is REPLACED
```

The report represents the inspection's **current completed state**. The customer is never asked to
reason about Report v1 vs Report v2, about a superseded version, about a checksum, or about which of
several artefacts is the real one. There is exactly one, and it is the one that matches the record.

`inspection_report_versions` survives as the **internal snapshot store** and retains exactly one row
per report. Its `version` column is now an internal sequence — it keeps the table's uniqueness
constraint meaningful, keeps audit events addressable, and gives the frozen-snapshot verification
suites (KG-4E) a handle. It is **not** a customer-facing number and no product surface renders it.

### 6.2 Replacement safety — the ordering IS the contract

Implemented in `CanonicalReportsService.generate`:

1. the existing valid snapshot and its PDF are left **completely untouched**;
2. the replacement is rendered and its bytes are stored;
3. the replacement row is marked `generated` only after the artefact exists and verifies;
4. the superseded snapshot rows are deleted **in the same transaction**, so the report points at
   exactly one snapshot the instant the switch becomes visible;
5. **only after that transaction has committed** are the superseded PDFs destroyed.

The whole sequence holds `pg_advisory_xact_lock('inspection-report:<id>')`, so concurrent
regeneration is serialized rather than racing. If anything before the commit fails, the transaction
rolls back and the customer still has the report they had; the only artefact destroyed on that path
is the half-made replacement, which no snapshot row references. A crash between (4) and (5) can leak
an unreferenced PDF but never a missing one, and `orphanedReportArtifactIds()` sweeps it on the next
generation.

**Reopening alone changes nothing.** The report is replaced when the inspection is *finished again*,
not when it is reopened, so a reopen the customer abandons leaves their report intact.

### 6.3 Customer-facing identifiers

A checksum is **integrity metadata**, not a record number: it exists to prove a byte sequence was not
altered, it changes whenever the report is regenerated, and presenting it as identity teaches the
customer that their inspection is renamed whenever its file is. `357c4814…` is therefore gone from
every customer surface.

The chosen identifier is `inspection.displayNumber` (migration `1800000017000`), rendered
**`Inspection #7`**:

* allocated once at creation, never re-derived, never derived from the uuid or from any checksum;
* **per owner** — per organization for an organization-scoped inspection, per user otherwise —
  starting at 1 in each scope, so it discloses only the account's own volume. A global sequence was
  rejected: it would leak every other tenant's inspection count and make adjacent numbers usable for
  cross-account inference;
* allocated under a per-scope advisory lock with `MAX+1`, so two accounts never contend and two
  concurrent creates in one scope are serialized;
* backfilled deterministically by `(createdAt, id)` within each scope;
* **display only** — never an authorization input, never a route parameter, never a cross-scope
  lookup key. `id` remains the sole identity the server authorizes on, and guessing `#8` grants
  nothing.

No separate report number was minted. One report per inspection means the inspection's number
identifies it; a second sequence would have been a second thing to explain for no gain.

### 6.4 What the customer now sees

**Completed inspection** — `Inspection #1`; `Inspection completed <date · time>`; findings;
jurisdiction; `Report: Ready`. A single **Inspection report** section: `Report ready`,
`Report updated <date · time>`, `Download PDF`. Technical details carries
`Checksum (SHA-256) …` and the inspection record uuid. Measured on the page after replacement:
**0 occurrences of "version", "superseded", "previous" or "generated".**

The two timestamps are deliberately distinct and separately sourced. `Created` alone would be read
as the inspection date; `Inspection completed` and `Report updated` differ whenever an inspection was
reopened and finished again.

**Reopen copy** — *"This makes the inspection editable again. Your current report stays available
while you edit. When you finish again, it is replaced by a report of the updated inspection."*

**Reports library** — one card per inspection: title · site, `INSPECTION #N`, inspection completed,
report updated, finding count (`finalized` only), jurisdiction, `Download PDF`, `View inspection`.
No Record IDs, no checksum, no version, no lifecycle words.

**Download route** — `GET /inspection-reports/:reportId/download`, with no version segment: a URL
naming a version is a URL the customer could keep and later find empty. The internal
`/versions/:n/download` route is retained for the verification suites only; a sequence whose snapshot
was replaced answers **404**.

**Inspections list** — state-aware. `View inspection` for a completed inspection, opening
`/inspection-complete`; `Continue inspection` for a draft or in-review one, opening the workspace.
This closes the navigation dead end where a completed inspection was reachable only in the moments
after finishing it, or by going through `/reports`. `Resume`/`Reopen` were both wrong words: the
first is untrue for a finished inspection and the second names a real lifecycle transition this
action does not perform.

### 6.5 Delete Report — REMOVED from the customer workflow `SUPERSEDES §5.8`

The control is gone from `/reports`. It said "Delete Report", it only set `archivedAt`, it hid the
report permanently, and there was no unarchive — neither a delete nor a reversible archive. Nothing
destructive was added in its place. A report is an output of its inspection, not a disposable orphan
the customer removes from underneath it. `CanonicalReportsService.archive()` and its route survive
unreached and unchanged, destroying nothing, pending a separate decision.

### 6.6 Migration of existing data

`backend/scripts/retire-superseded-report-snapshots.ts` (`npm run retire:superseded-report-snapshots`).
Deterministic: for each report it retains the **highest `version` whose status is `generated`** —
the row the product already served as current, so no report changes content — and retires the rest,
row first and bytes only after the row change committed. A report with no generated row is skipped
entirely. It prints the resolved database, refuses `safescope` and any name that is not positively a
disposable verification database, and defaults to a read-only inventory without `--apply`.

It is deliberately **not** part of migration `1800000017000`: the obsolete PDFs are objects in the
storage provider, and a SQL migration that dropped the rows could only have orphaned every one of
them. `1800000017000` is purely additive (`displayNumber` + backfill + two partial unique indexes).

### 6.7 Measured — disposable stack only, nothing deployed, nothing committed

Database `test_insite_onereport_20260827` (cloned from the previous session's disposable database so
the legacy two-snapshot report was genuinely migrated), backend on `:4106`, frontend on `:3010`.

| check | result |
|---|---|
| legacy migration | 8 reports / **9 snapshots → 8 snapshots**, 1 predecessor retired, 0 reports with >1 snapshot |
| record-number backfill | 14/14 inspections numbered, per-scope, 0 NULL |
| browser: report after first completion | 1 snapshot, sha `98a563ed…`, 8,685 bytes, PDF on disk |
| browser: after reopen (before finishing again) | **unchanged** — 1 snapshot, same sha, PDF still on disk |
| browser: after finishing again | 1 snapshot, sha `3f87ccf1…`, 10,361 bytes |
| predecessor snapshot row | **deleted** |
| predecessor storage object | `status='deleted'`, `deletedAt` set |
| predecessor PDF on disk | **gone** |
| orphaned report artefacts, whole database | **0** |
| current PDF content | both findings present (`Machine Guarding`, `Electrical`); `conveyors` (dismissed) **0**; `version`/`superseded`/`checksum` **0** |
| `/versions/1/download` after replacement | **404** |
| customer-visible version history | **0 occurrences** on the completed page and in the report library |
| dismissed candidate | still `dismissed`, absent from findings and from the report |
| 10 concurrent regenerations | all 201, **1** distinct snapshot identity, 1 retained snapshot, 0 orphans |
| cross-account report access | **404** (download and generation) |

**Failed-replacement safety, proven with a real fault** — `npm run test:report-replacement-failure-safety`
makes the private storage root unwritable for the duration of one regeneration attempt, so the
failure lands where a real disk/bucket failure would. No test hook, flag or mock was added to
production code. **16/16 checks passed**: HTTP 500; one snapshot survives and it is the original; its
artefact still `ready`; the download still byte-identical; no half-made row; **0 orphans**; the
failure recorded as `report_generation_failed`; and once storage recovered the replacement succeeded
and the predecessor was then retired.

`backend/scripts/test-private-storage-reports.ts` was rewritten to assert this contract. It
previously asserted `versions === 2` and `status === 'superseded'` — a **stale expectation** under an
owner decision that changed the product contract, not a weakened one. The new assertions are
stricter in the replacement direction: exactly one snapshot retained, the retained one is the
replacement, the predecessor's artefact genuinely `deleted`, **0 orphans**, and the unchanged
customer URL now serves different bytes. 14 scenarios, passed.

### 6.8 Still not accepted

```
ONE_REPORT_PER_INSPECTION   = IMPLEMENTED, VERIFIED IN BROWSER AND DATABASE
REPLACEMENT_SAFETY          = PROVEN WITH A REAL INJECTED STORAGE FAILURE
CUSTOMER_FACING_IDENTIFIER  = inspection.displayNumber, per-owner sequence
REPORT_VERSION_HISTORY      = REMOVED FROM THE CUSTOMER PRODUCT
DELETE_REPORT               = REMOVED FROM THE CUSTOMER PRODUCT, BACKEND UNCHANGED
REPORT_ARCHIVE_MANAGEMENT   = DEFERRED DECISION
MIGRATIONS                  = 49 (one additive column + backfill)
DECOMPOSITION_PRECISION     = UNCHANGED, DEFECT PRESERVED
WORKFLOW_ACCEPTED           = FALSE
DEPLOYED                    = FALSE
```

---

## 7. FINAL ACCEPTANCE `ACCEPTED` (2026-08-27)

`INSITE_V1_INSPECTION_LIFECYCLE_ACCEPTED — FINAL_APPLICATION_POLISH_AND_COMMERCE_ACCEPTANCE_REQUIRED`

This terminal covers **exactly three things**: the inspection workflow, the report replacement
lifecycle, and the reopen lifecycle. **It does not mean InSite v1.0 is launch-ready.**

### 7.1 The journey that was walked

A **fresh** inspection, start to finish, through the real browser controls against the disposable
stack — not a re-inspection of the previously walked record. All 33 acceptance steps passed.

| what was exercised | result |
|---|---|
| record number on a new inspection in an account that already had one | **`Inspection #2`** — per-account sequence incremented, not global, not `#1` |
| single-hazard observation | one candidate → confirmation step **skipped entirely** |
| multi-hazard observation | **4 candidates**; both High preselected, both Moderate not — the documented rule |
| dismissal | 2 unticked → `2 findings confirmed. 2 suggestions were not confirmed and will not appear in the report.` |
| zero-candidate observation | honest: *"HazLenz did not identify a hazard in this observation."* |
| user-authored finding | `source='user_authored'`, `selectedAnalysisId` NULL, `originatingAnalysisId` NULL, `knowledgeReleaseId` NULL, `riskSnapshot` NULL, `standardCandidates` **empty** |
| its risk | the matrix **refused to continue** until a person set one — no fabricated risk |
| risk-band parity, live | a 5×5 score of **12 rendered `High (12)`**, with *"Based on High risk — 3 days"* |
| responsible party | 1 named (`Dana Ruiz — Maintenance Supervisor`), 5 **Unassigned**; inspector never substituted |
| consecutive saves | **0 modals/overlays**, immediate return to capture, running count correct each time |
| pending finding blocks Finish | `2 findings need review before you can finish`, 2 × **Needs review**, Finish **disabled** |
| the server, independently | a direct `POST /transition {completed}` bypassing the UI → **400** *"Every current finding requires a completed human review before finalization."* |
| `Continue review` | reached the correct finding — its own evidence fragment (*"a forklift was left running"*) |
| readiness after review | `Ready to finish — 6 findings reviewed`, Finish enabled |
| completed page | `Inspection complete` · `Inspection #2` · site/title · `OSHA — General Industry` · completion timestamp · 6 findings · `6 High` · 6 finding cards · 6 due dates · 1 named + 5 Unassigned · `IDENTIFIED BY YOU · NOT PROPOSED BY HAZLENZ` |
| dismissed proposals on that page | **0 occurrences** of either dismissed hazard |
| report | exactly **1**; downloaded PDF sha256 **equals** the stored checksum |
| report content | all 6 findings present incl. the user-authored one; dismissed candidates **0**; `Dana Ruiz` present; 5 × `Unassigned` |

### 7.2 Reopen and replacement, measured

| | before reopen | during reopen | after finishing again |
|---|---|---|---|
| snapshots for the report | 1 | **1 — unchanged** | **1** |
| sha256 | `68dba0d2…` | **`68dba0d2…` — unchanged** | `0f20c76e…` |
| stored PDF | `ready`, on disk | **`ready`, on disk** | predecessor **gone from disk** |
| download while editable | — | **200, byte-identical** | — |
| predecessor snapshot row | — | — | **deleted** |
| predecessor storage object | — | — | **`status='deleted'`, `deletedAt` set** |

The new finding appears in the replacement only (`toeboard`: report 1 = **0**, replacement = **4**);
all six earlier findings survive into it; dismissed candidates remain **0**; the internal
`/versions/1/download` for the replaced sequence answers **404**.

**Whole-database invariants after the walk:** 37 inspections, **0 unnumbered**; 20 reports and
**20 snapshots**; **0** reports with more than one snapshot; 20 ready PDFs, 10 retired PDFs;
**0 orphaned report artefacts**; **0** per-scope record-number collisions.

### 7.3 Failure safety, re-proven

`npm run test:report-replacement-failure-safety` — **16/16**, twice, including once against a backend
with the development auth bypass disabled. The fault is real: the private storage root is made
unwritable for one regeneration attempt. No test hook, flag or mock exists in production code.

### 7.4 Account isolation

`test-cross-user-isolation` — **28 passed, 0 failed**. Nine authenticated cross-account operations
against another account's inspection and report — read inspection, read its report, completion
readiness, read report by id, download current, download by snapshot sequence, generate/replace,
reopen, archive — **all 404**, with the stranger account deliberately Pro-entitled so a 402 could not
be mistaken for isolation. The stranger's own report list: **0**. The victim's report afterwards:
unchanged, 1 snapshot, `archivedAt` null.

### 7.5 Suites and builds

| | result |
|---|---|
| `test:report-replacement-failure-safety` | **16 / 0** |
| `test:private-storage-reports` | **14 scenarios, passed** — 1 report, 1 snapshot, 1 object, **0 orphans**, predecessor `deleted`, cross-user 404 |
| `test:user-authored-findings` | **47 / 0** |
| `test:canonical-workflow` | **25 scenarios, passed**, 4 cross-user denials, mass assignment rejected |
| `test-cross-user-isolation` | **28 / 0** |
| `test-kg4e-report-field-exclusion` | **9 / 0** — 20/20 reports byte-identical after poisoning with 38 governed/shadow/telemetry fields |
| `check:risk-band-parity` | **PASS** — 3 matrix profiles, 16 values |
| backend `tsc --noEmit` / `npm run build` | **exit 0 / exit 0** |
| frontend `tsc --noEmit` | **exit 0, 0 errors** |
| frontend `next build` | **exit 0**, `/inspection-complete` in the route manifest |

**Protected HazLenz Level-1 behaviour cannot have regressed, and this is mechanical rather than
asserted:** the change set contains **no file** under `safescope-v2/`, `safescope-knowledge/`,
`standards/`, `classifications/`, `taxonomy/` or `intelligence/`, and both risk authorities
(`safescope-v2/risk/risk-profiles.ts`, `inspection/risk-policy.ts`) are **unchanged at HEAD**. No
decomposition, scorer, threshold or gold artefact was touched.

### 7.6 Known non-blocking limitations

**`ENVIRONMENT_FIXTURE_PRECONDITION_NOT_MET` — KG-4E provenance.** `test-kg4e-report-provenance`
reports **7 passed, 3 failed**. All three failures are corpus preconditions of the disposable clone —
no ACTIVE governed release, 0 approvals, and a missing telemetry file — confirmed by direct
measurement: `regulatory_releases` has **0 rows**. Every **report-scoped** assertion passes: 17/17
frozen snapshots carry the provenance column, 17/17 carry a `knowledgeProvenance` block, and 0 name a
governed release. No KG architecture was modified.

**`NON_PRODUCTION_AUTH_MODE_LIMITATION` — DOES NOT APPLY.** The two previously failing unauthenticated
assertions were **not** a property of `JwtGuard`. The guard bypasses only when
`DEV_AUTH_BYPASS === 'true'` **and** `NODE_ENV !== 'production'`, and `DEV_AUTH_BYPASS=true` is set in
the local `backend/.env`. Running the disposable backend with `DEV_AUTH_BYPASS=false` — a
configuration change, **no production code touched** — makes both assertions pass. The suite is
28/28. This limitation is therefore **eliminated, not recorded**.

**`DEFECT_NONBLOCKING` — decomposition precision, owner: HazLenz, not the lifecycle.** A guardrail
observation ("missing mid-rail for about four metres, toe board lying flat, two people walking that
route") produced **zero** candidates. This is the known decomposition-precision gap (§84.7 W-2,
`PRECISION_DEFECT_MATERIAL_HANDLING.md`), which this phase is not authorized to change. The
**lifecycle handled it correctly**: it stated the zero-candidate result honestly and offered the
user-authored path, which recorded the hazard with truthful provenance.

### 7.7 Terminal

```
INSPECTION_WORKFLOW           = ACCEPTED
REPORT_REPLACEMENT_LIFECYCLE  = ACCEPTED
REOPEN_LIFECYCLE              = ACCEPTED
BROWSER_JOURNEY               = 33/33 STEPS, FRESH INSPECTION
REPLACEMENT_FAILURE_SAFETY    = 16/16, REAL INJECTED STORAGE FAILURE
ACCOUNT_ISOLATION             = 28/28
LEVEL1_BASELINE               = UNTOUCHED BY CONSTRUCTION (no reasoning/scorer/risk file changed)
MIGRATIONS                    = 49
DECOMPOSITION_PRECISION       = UNCHANGED, DEFECT PRESERVED
PRODUCTION_MUTATED            = FALSE
DEPLOYED                      = FALSE
COMMITTED                     = FALSE
INSITE_V1_LAUNCH_READY        = FALSE
```

**Still required before InSite v1.0 can launch**, none of it covered by this terminal: the full
visual/colour sweep; every-tab polish; marketing/pricing reconciliation; account creation and login
acceptance; Free vs Pro access-control acceptance; payment/subscription acceptance; final
whole-application regression; final production-readiness review; and the first genuine paid
transaction proof, which remains `DEFERRED_UNTIL_FIRST_GENUINE_CUSTOMER_TRANSACTION`.

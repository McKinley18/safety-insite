# INSITE v1.0 PRELAUNCH — PROPOSED ARCHITECTURE

`PROPOSED — NOT IMPLEMENTED. Nothing in this document exists in the product.`

Every recommendation below is derived from the measurements in `../STATUS.md`. Where a
recommendation would remove information, it says explicitly why that information is not
required for safety, compliance, auditability or report generation.

---

## 1. The domain model, and what "add a finding" should mean

### 1.1 What each concept actually is today

| concept | status in the current architecture |
|---|---|
| **Inspection** | persisted entity `inspection`; owns regulatory context, status, version |
| **Observation** | persisted entity `observations`; **the only customer-authored record** |
| **HazLenz Assessment** | persisted entity `hazlenz_analyses`; immutable result snapshot, versioned per observation |
| **Finding** | persisted entity `inspection_findings`; **derived from the analysis**, keyed `(observationId, segmentKey, revision)` |
| **Hazard** | **not** a persisted customer entity — a member of `analysis.multiHazardDecomposition.hazards`; also a separate legacy `hazard` entity that the canonical path does not use |
| **Standard Match** | embedded in `finding.sourceCandidate.standardCandidates`; also on the analysis snapshot |
| **Risk** | embedded `finding.riskSnapshot`, computed per finding, optionally reviewer-confirmed |
| **Corrective Action** | persisted entity `corrective_actions`, **one per finding** (upsert, verified non-duplicating) |
| **Assignment** | `inspection_assignments` for inspections; `assignedToUserId` on corrective actions |
| **Note** | **no entity** — reviewer rationale lives on `human_reviews.rationale` |
| **Evidence/Photo** | `storage_objects`, attached to the **inspection**, not to a finding |
| **Report** | `inspection_reports`, one per inspection |
| **Report Finding** | **does not exist** — findings inside a report are a frozen projection in `sourceSnapshot` |

Two of these are worth stating plainly because they drive everything else:
**a finding is derived, not authored**, and **evidence is attached to the inspection, not
to the finding it evidences**.

### 1.2 What "adding a report finding" should mean

Of the four options posed:

> **B — add a finding to the underlying inspection and let the report reflect it — is
> correct, with one addition: the customer must be able to author a finding directly, not
> only by writing an observation and hoping the engine emits one.**

Rejected, with reasons:

* **A (edit the report directly)** creates two sources of truth for the same fact. The
  report is a frozen, checksummed, per-version snapshot used as evidence; letting a user
  edit it in place destroys the property that makes it worth keeping.
* **C (durable report-owned findings)** is the same problem with extra machinery. A
  finding that exists only on a report cannot carry a corrective action, cannot appear in
  the action dashboard, cannot be tracked to closure, and cannot be re-reported.
* **D** is unnecessary: the inspection already is the record of truth and already versions
  cleanly.

The customer's mental model — *"I add a finding to this inspection, and my report shows
it"* — is exactly option B. The architecture already supports it. What is missing is a
finding the customer authors and a report lifecycle that lets them regenerate.

---

## 2. Target customer experience

The hypothesis in the brief was:

> See something → Record it → HazLenz helps → Customer confirms/edits → Finding exists →
> Report updates

It fits, **except for one substitution**: today HazLenz *creates* the finding and the
customer reviews whatever it created. The customer should create the finding, and HazLenz
should *enrich* it.

### 2.1 Proposed primary loop

```
1. Add Finding                 one prominent control, present on EVERY step
2. Photo                       optional
3. Describe what you saw       one textarea + location; work activity optional
4. HazLenz analyzes            automatic, on save — no separate "analyze" click
5. Review one card             hazard · standard · risk · corrective action, all editable
6. Save Finding                one click
7. → back to the inspection with "Add another finding" as the primary action
```

### 2.2 What may be inferred, defaulted, combined or deferred

| current step | proposal | why it is safe |
|---|---|---|
| separate "Save observation" and "Analyze with HazLenz AI" | **combine** — one *Save and analyze* action | already one client action calling three endpoints; nothing is lost |
| Regulatory context re-presented on the capture form | **hide once set**; show as a line with an *Edit* affordance | it is already inspection-level and inherited; re-asking is noise |
| "What HazLenz understood" fact editor, always expanded | **progressive disclosure** behind *Correct what HazLenz read* | correction stays available; it is not required to finalize |
| "Continue to risk review" as a separate screen | **merge risk into the review card** | risk is already pre-filled per finding; the separate screen adds a click without adding a decision |
| corrective action collected once, at the end, for all findings | **move to the finding card**, per finding | the server already stores one action per finding and already computes finding-scoped action text; the shared end-of-inspection draft is the reason a fall-protection finding could inherit electrical action text |
| `Advanced details` showing Finding ID / Analysis ID | **remove from the default view** | internal identifiers; keep them in an export or support view |

**Not removable.** The reviewer's risk-adjustment rationale (required on a material
override, enforced server-side in `addReview`), the human review record itself, the
regulatory context, the evidence fragment, and the advisory disclaimer are all load-bearing
for safety, compliance and auditability. None of them should be dropped to reduce clicks.

### 2.3 The two dead ends must be closed

1. **`Add finding` must exist on every step of the workspace**, not only the review step,
   and specifically on the corrective-action step, which today has no back navigation at
   all.
2. **Adding a finding after a report exists must work.** The server already permits the
   reopen (`transition → draft` returned 201 in measurement); the client simply never asks
   for it. The proposal is that the add-finding path reopens the inspection the way
   `saveObservationRevision()` already does, tells the user plainly that the existing
   report version stays as it is and a new version can be generated when they finish, and
   never leaves the user reading "Completed inspections must be reopened before editing"
   with no control that reopens one.

### 2.4 A customer-authored finding

`finalizeFinding()` already materializes a finding from a review when no reconciliation
produced one, so the persistence path exists. The proposal is a first-class
*Add a finding myself* route for the case the engine misses something, carrying
`source: 'user_authored'` on the finding so provenance stays honest and the report can
distinguish a customer-authored finding from an engine-derived one. **A user-authored
finding must never be presented as HazLenz-supported, and must not acquire a standard
citation the engine did not produce.**

---

## 3. Report architecture

**Recommendation: versioned immutable snapshots over a live inspection — which is what
exists — plus the three things that are missing.**

Reports must not become live projections. A safety report is shown to regulators, insurers
and clients; a document that silently changes after it was sent is worse than useless. The
current model (frozen `sourceSnapshot` + frozen PDF + sha256 per version, prior versions
retained and downloadable) is the right one and should be kept.

What to add:

1. **A name.** A nullable `name` on `inspection_reports`, defaulting to the derived
   `inspection.title · siteName` the list already renders. Rename affects the record, never
   a generated version's frozen bytes.
2. **An explicit regeneration lifecycle.** Today regeneration requires the inspection to be
   `completed`, and reopening to add a finding makes regeneration impossible until it is
   completed again — with no UI for either transition. The proposal is a stated lifecycle
   the customer can see: `Draft → Report v1 → (reopen) Draft (v1 preserved) → Report v2`,
   with the report list showing *"the inspection has changed since v1 — generate v2"*.
3. **Unarchive.** `archivePersistedReport` is the only deletion, the UI calls it
   "Delete Report", and there is **no route back**. Either add an unarchive route or make
   the copy honest about permanence.

**Payload defect to fix at the same time.** `CanonicalReportsService.list()` returns every
version's full `sourceSnapshot` — measured at 196 KB for a single one-version report. The
list needs a projection (version, status, generatedAt, sha256, sizeBytes) and nothing else.
This is open item `KG4E-DISC-03`.

**Legacy island.** The `/inspection`, `/inspection-quick`, `/inspection-cover` and
`/inspection-review` routes and the `legacy/reports` controller are a second, unreachable
report implementation. They should be removed, or explicitly retained with a recorded
reason, before v1.0 — an unreachable second writer of report data is a latent
contradictory source of truth.

---

## 4. Expert HazLenz architecture

`NO LLM. NO PROVIDER SELECTED. NOT IMPLEMENTED.`

The measured `shield` false positive is the argument for this workstream and its
constraint at the same time: deterministic Level-1 gave a **spurious hazard a higher
confidence (0.85) than a genuine trench (0.60)**, and no amount of added intelligence is
allowed to make that class of error harder to see.

### 4.1 Responsibility split

| layer | owns | may never do |
|---|---|---|
| **A. Level-1 deterministic** | the safety baseline: hazard families, applicability predicates, standard candidacy, risk, governed backing status | be replaced, suppressed or overridden by any Expert output |
| **B. Expert contextual reasoning** | ranking and *demotion candidacy*, multi-hazard coherence, control-effectiveness, plainer finding language | introduce a hazard family, a citation, or a risk band that Level-1 did not produce |
| **C. Clarification generation** | better questions, fewer of them | make any question blocking — none blocks review today and none may |
| **D. Customer confirmation** | the human review record, unchanged | be skipped or auto-accepted |
| **E. Standards retrieval / governance** | KG-3C backing status, approval binding | be widened by an Expert claim; `backingStatus` remains the only basis for a verified badge |
| **F. Confidence / uncertainty** | an explicit uncertainty representation and an honest "not established" | present a model's self-reported confidence as a measured probability |
| **G. Correction / feedback capture** | recording what the reviewer changed and why, as validation input | become a silent retraining loop with no adjudication |
| **H. Provider abstraction** | one seam behind `HazLenzReasoningProvider` | leak a provider type into a domain entity or a customer-visible field |
| **I. Failure / fallback** | see below | degrade Level-1 |

The one capability worth naming precisely: Expert reasoning should be allowed to say
*"this excavation hazard is not supported by the fragment that produced it"* and mark it
for reviewer attention — but the deterministic engine should still stop emitting it. **A
reasoning layer that hides a keyword defect is not a fix for the keyword defect.**

### 4.2 Failure behaviour — all five states

| state | required behaviour |
|---|---|
| **unavailable** | Level-1 result is delivered unchanged; the UI states that enhanced reasoning was unavailable; nothing is queued that would change the finding later without the customer seeing it |
| **slow** | hard timeout, then treat as unavailable; the deterministic result must never wait on it |
| **uncertain** | surface as an uncertainty, never as a demotion; the Level-1 finding stands |
| **contradictory** | Level-1 wins and the contradiction is recorded for validation (Workstream B), never silently resolved |
| **malformed** | rejected at the seam by schema validation; identical to unavailable |

`§45.6` / `§47.8` remain in force: **no hosted adapter exists behind
`HazLenzReasoningProvider`, and the L3-2o verification shim must not become one.**

---

## 5. Scalability and capacity — the tests that must be run

`NO USER COUNT IS CLAIMED. NONE HAS BEEN MEASURED.`

Established by configuration reading (see `../STATUS.md` §7): default `pg` pool of **10**
connections with no `extra.max`, no statement/connection/acquire timeout; global throttle
100 req/60 s; in-process CPU-bound classification; S3 storage outside test.

Required before any capacity claim:

| # | test | measures | gate |
|---|---|---|---|
| C-1 | connection-pool saturation | concurrent inspections against the default 10-connection pool | the pool exhaustion point, and whether it surfaces as a timeout or a hang |
| C-2 | concurrent HazLenz classification | p50/p95/p99 and error rate at 1, 5, 10, 25, 50 concurrent classifies | the concurrency at which p95 exceeds a stated budget |
| C-3 | report generation under load | PDF render time and memory at N concurrent generations | generation is synchronous inside a DB transaction holding an advisory lock — the lock-hold duration is the number that matters |
| C-4 | report list payload | list latency and bytes at 10 / 100 / 1000 reports | must be run **after** the `sourceSnapshot` projection fix, and before, to show the delta |
| C-5 | storage growth | bytes per inspection (evidence + snapshot + PDF), projected per active user per month | a stated retention position |
| C-6 | offline sync burst | many queued observations syncing at once, idempotency under retry | no duplicate rows; `uq_*_client_request` holds |
| C-7 | cross-account isolation under concurrency | `test:cross-user-isolation` (28/0) re-run while C-2 is saturating | isolation must not degrade under load |
| C-8 | throttle behaviour | that 100 req/60 s is a *product* limit, not an accidental capacity ceiling for a busy inspector | a stated, deliberate limit |

Every one of these is currently `NOT_MEASURED`.

---

## 6. Bounded implementation sequence

Nothing below is implemented. Each workstream is independently landable and independently
revertible.

### W-1 — Core finding UX (highest value, lowest risk)

* **Problem:** measured 5 interactions / 3 screens per additional finding; `Add finding`
  absent from the Action step with no back navigation; post-report add-finding returns 409
  with no reopen control.
* **Change:** `Add finding` on every step; the add-finding path reopens a completed
  inspection exactly as `saveObservationRevision()` already does; risk merged into the
  review card; corrective action moved per finding; fact editor behind progressive
  disclosure.
* **Schema:** none. **API:** none. **Migration:** none.
* **Invariants:** the human review record, the material-override rationale, the advisory
  disclaimer and per-finding review all survive unchanged.
* **Tests:** a browser suite that adds a second finding and asserts the interaction count;
  a regression that adding a finding after report generation succeeds; `test:canonical-workflow`,
  `test:finding-scoped-reviews`, `test:persisted-decomposition-findings` unchanged and passing.
* **Gate:** second finding reachable from every step, and from a completed inspection.
* **Rollback:** frontend-only; revert the page.

### W-2 — Decomposition precision (the `shield` defect)

* **Problem:** root-caused in `../STATUS.md` §4. Three measured false positives at 0.85
  against a genuine trench at 0.60.
* **Change:** the narrowest correction that fixes the demonstrated defect. No broad
  heuristic, no confidence retuning beyond making a keyword-only match unable to outscore
  an evidenced one.
* **Tests:** the four probe sentences as regressions; **HazLenz Level-1 31/31 must still
  pass, unrelaxed**; the two §13.1 baseline failures must not change character.
* **Gate:** no gold-set expectation, scorer or threshold modified. If the gold set moves,
  it is adjudicated as a regulatory correction and recorded — not absorbed.
* **Rollback:** one regex; revertible in isolation.

### W-3 — Report records and ownership (Workstream D)

* `name` column; regeneration lifecycle surfaced in the UI; unarchive or honest copy;
  `list()` projection removing `sourceSnapshot`.
* **Schema:** one nullable column. **Migration:** additive, `SAFE_BEFORE_NEW_CODE`.
* **Invariants:** version immutability, sha256 stability, fingerprint dedupe, the
  `organizationId` XOR `ownerUserId` CHECK, and `test:cross-user-isolation` 28/0.
* **Gate:** an existing report's v1 bytes and checksum are byte-identical before and after
  the migration.

### W-4 — Legacy island disposition

* Decide and record: remove `/inspection`, `/inspection-quick`, `/inspection-cover`,
  `/inspection-review` and `legacy/reports`, or retain them with a stated reason.
* **Gate:** no reachable second writer of report data at v1.0.

### W-5 — Capacity (Workstream C)

* C-1 … C-8 above. **Only after C-1…C-8 may any operating limit be stated.**

### W-6 — Expert HazLenz (Workstreams A + B)

* Blocked on the hosted adapter that `§45.6` records as unbuilt, on provider
  authorization, and on the Workstream B validation corpus. **Must not begin before W-1
  and W-2**, because measuring an intelligence layer on top of a known keyword defect
  measures the wrong thing.

### W-7 — Final v1.0 polish and acceptance

* Finding conclusion text (`guard`, `panel`, `hot_work`) made customer-readable.
* Re-run the full accepted-baseline gate set and re-prove §83.3.

**Dependencies:** W-1 and W-2 are independent and can run in parallel. W-3 depends on
neither. W-5 should follow W-3's `list()` fix so C-4 measures the intended shape. W-6
depends on W-2. W-7 depends on all.

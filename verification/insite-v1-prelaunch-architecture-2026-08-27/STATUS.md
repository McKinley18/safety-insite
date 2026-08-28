# INSITE v1.0 PRELAUNCH — ARCHITECTURE AND MEASUREMENT (2026-08-27)

`ARCHITECTURE AND MEASUREMENT ONLY — NOTHING IMPLEMENTED, NOTHING DEPLOYED, $0.00`

| | |
|---|---|
| branch | `main` |
| HEAD | `d67d645608f13f7b0fc40e64b40f117d40c2ef71` |
| upstream | `origin/main`, **no divergence** |
| accepted RC | `a1515cbc828e15896e399c17f4c36003c210aca8` |
| preservation tag | `insite-v1-pre-expert-ai-baseline-2026-08-27` → `a1515cbc…` **verified** |
| production SHA | `e9355e911c221f94c96d2a1b241b4d938435fae2` — **not touched** |
| tracked modifications at start | **0** |
| untracked at start | 2,143 (the `" 2"` duplicates, screenshots and logos §83.2 excluded) |
| stashes | **4**, untouched |
| tags | **24**, untouched |
| provider calls | **0** |
| Stripe / payment | **untouched** |

Starting terminal reproduced exactly:
`INSITE_V1_ACCEPTED_RC_PRESERVED — PRELAUNCH_EXPERT_EXPANSION_READY_FOR_ARCHITECTURE`

---

## 1. What was measured, and how

A disposable database `test_insite_prelaunch_ux_20260827` was created, migrated to the
**same 47 migrations** the release candidate declares, and a disposable API was run on
port **4310** with `STORAGE_PROVIDER=local_test`. Port 4000 (the pre-existing developer
backend) and the protected `safescope` development database were never used; `safescope`
was read once for its migration count (35, unchanged) and never written.

The instrument (`measurement/measure-add-finding.ts`) replays the **exact server call
sequence** that `frontend-next/app/inspection-workspace/page.tsx` issues, so the cost of
the customer journey is measured rather than estimated. Both the database and the local
storage root were destroyed after measurement.

---

## 2. The finding lifecycle, as it actually is

```
Inspection  (user creates: site + regulatory context)
   └── Observation            (user types free text; the ONLY user-authored record)
         └── HazLenzAnalysis  (POST /safescope-v2/classify, snapshot persisted)
               └── InspectionFinding × N   ← MATERIALIZED BY THE SERVER
                     from analysis.multiHazardDecomposition.hazards,
                     in InspectionService.reconcileDecompositionFindings()
                     └── HumanReview        (per finding, per analysis)
                           └── finalizeFinding()  → status finalized
                                 └── CorrectiveAction (upserted, one per finding)
Inspection.transition('completed')
   └── InspectionReport (one per inspection, unique index)
         └── InspectionReportVersion (immutable frozen sourceSnapshot + PDF)
```

**There is no user-authored finding.** No API accepts "create a finding" from typed
customer input. A finding exists only because the decomposition engine emitted a hazard,
or as a fallback inside `finalizeFinding()` when a review is finalized against a segment
key no reconciliation produced. The customer's only authoring surface is the observation
text.

This is the single most important architectural fact behind the reported complaint. The
button labelled **"+ Add finding"** does not add a finding. It calls
`beginAdditionalObservation()`, which returns the page to the **capture** step to collect
another **observation** — and how many findings that produces is decided by the engine.

---

## 3. MEASURED — the "add another finding" journey

### 3.1 Server cost (measured, not estimated)

| Segment | Server calls |
|---|---|
| start inspection (site + inspection) | 2 |
| first finding — capture + analyze | 4 |
| first finding — review + finalize + transition | 8 |
| **second finding — capture + analyze** | **5** |
| **second finding — review + finalize** | **2** |
| complete + corrective actions + tasks + report | 11 |
| post-report add-finding attempt | 4 |
| **total for the measured journey** | **38** |

### 3.2 One observation produced THREE findings

The first observation was a single ordinary sentence:

> "While walking the crusher drive area I saw a portable grinder in use with its lower
> wheel guard removed, and the operator was not wearing a face shield. The machine was
> energized and running."

The server materialized **three** findings from it — `machine-guarding`, `hot-work`,
`excavation-trenching` — each of which the reviewer must select, risk-review and finalize
**individually**. The measured cost of the first observation was therefore **three**
separate review+finalize round trips, not one.

The second observation produced one more finding (`electrical`), for **four active
findings from two sentences**.

### 3.3 Interaction cost, derived from the workspace source

For an additional observation that decomposes to exactly one hazard, the minimum is
**5 interactions across 3 screens**: `+ Add finding` → type the observation →
`Analyze and add this finding` → `Continue to risk review` → `Confirm risk and finalize
finding`. Each *extra* hazard the engine emits adds another `Review this finding` →
`Continue to risk review` → `Confirm risk and finalize finding` cycle.

### 3.4 Two structural dead ends in the workspace

**(a) The Action step has no way back.** `+ Add finding` is rendered **only** inside the
`step === "review"` branch. When the last finding is reviewed, `acceptReview()` sets
`step = "followup"`, and that section contains no back navigation of any kind. From the
corrective-action step the only forward control is *Complete inspection and generate
report*. Returning to add a finding requires reloading the page (the load effect restores
`step = "review"` when a persisted analysis exists).

**(b) After the report exists, adding a finding fails.** Measured:

```
POST /inspections/:id/observations   →  HTTP 409
"Completed inspections must be reopened before editing."
```

`InspectionService.addObservation()` calls `findAccessible(..., requireEdit = true)`,
which refuses a `completed` inspection. The server **does** support reopening —
`POST /inspections/:id/transition {status:'draft'}` returned **201** in the same run, and
the observation then succeeded — but `analyze()` in the workspace never performs that
transition, and the UI exposes no reopen control. `saveObservationRevision()` in the same
file *does* reopen a completed inspection before writing, so the capability exists and is
simply not wired into the add-finding path.

The customer-visible result is a status line instructing the user to do something the
product gives them no way to do.

### 3.5 Report regeneration is coupled to completion

```
POST /inspections/:id/reports while status = draft  →  HTTP 400
"Reports may only be generated from completed inspections."
```

So the true post-report add-a-finding sequence is **reopen → add observation → analyze →
review → finalize → re-complete → regenerate**, of which only the middle four steps have
any UI.

---

## 4. MEASURED DEFECT — `shield` matches "face shield"

`ROOT CAUSE ESTABLISHED. NOT REPAIRED — this phase is not authorized to implement.`

`backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts:1267`
tests each observation fragment against

```
\b(?:trench|excavat(?:ion|ing)|open\s+cut|spoil\s+(?:pile|at)|trench\s+wall|
   cave[- ]?in|shor(?:e|ing)|shield(?:ing)?|trench\s+(?:access|egress))\b
```

The alternative `shield(?:ing)?` is intended as a **trench shield** (a protective system).
It matches any noun phrase containing the word, and the branch then pushes an
`excavation_trenching` hazard at a hard-coded confidence of **0.85**.

Isolated probes against the disposable API, one sentence each:

| observation | emitted | confidence |
|---|---|---|
| "not wearing a **face shield** while using a bench grinder" | `excavation_trenching` | **0.85** |
| "the welder was not using a **welding shield**" | `excavation_trenching` | **0.85** |
| "a **splash shield** was missing from the parts washer" | `excavation_trenching` | **0.85** |
| "had no eye protection while using a bench grinder" | *(no excavation hazard)* | — |
| "an unshored **trench** three metres deep had a spoil pile at the edge" | `excavation_trenching` | **0.60** |

A genuine trench scores **0.60**. Three false positives score **0.85**. In the measured
journey the spurious finding's own evidence fragment, persisted and carried into the
frozen report snapshot, is literally *"the operator was not wearing a face shield"* under
the heading `Finding 3 — Excavation Trenching`.

`hot_work` firing on the same sentence is **not** a defect: the code deliberately treats
`portable grinder` as hot-work evidence (`grindCutActivity`) and says so in its comment.
It is a conservative over-trigger by design, and it doubles the reviewer's work in exactly
the same way.

**Proposed narrow correction for the implementation phase** (not applied): require the
excavation sense of `shield` — `\b(?:trench|excavation|cave[- ]?in|protective)\s+shield`
or a bare `shield` only when another excavation token is present in the same fragment —
and stop giving a bare keyword match a higher confidence than a fully evidenced trench.
This must be landed with a scenario that fails before and passes after, and the four
existing false-positive probes above added as regressions. **No frozen scorer, gold-set
expectation or Level-1 suite may be relaxed to accommodate it.**

---

## 5. MEASURED — customer-facing finding text

The persisted `conclusion` values that reach the report are engine tokens:

| hazardKey | conclusion carried into the report |
|---|---|
| `machine-guarding` | `guard` |
| `hot-work` | `hot_work` |
| `excavation-trenching` | `excavation/trench condition` |
| `electrical` | `panel` |

The PDF headings render `Finding N — Titlecase(hazardCategory)`, so the headings read
acceptably, but the finding's own conclusion sentence is a mechanism token rather than a
sentence a customer would put in front of a regulator.

---

## 6. MEASURED — report record architecture, exactly as it is

| property | current behaviour |
|---|---|
| generation | `POST /inspections/:id/reports`, entitlement `cloudReports`, **requires `status = completed`** |
| identity | one `inspection_reports` row per inspection (`uq_inspection_report_inspection`) |
| versions | append-only `inspection_report_versions`; prior `generated` → `superseded`, still downloadable |
| immutability | each version freezes a full `sourceSnapshot` **and** the rendered PDF (sha256 + size) |
| dedupe | identical `sourceFingerprint` replays the existing version and audits `report_generation_duplicate_replayed` |
| ownership | `organizationId` XOR `ownerUserId` (CHECK constraint), plus `createdByUserId` |
| deletion | **archive only** — `archivedAt` set, filtered out of the list; **no unarchive endpoint exists** |
| naming | **none** — no name column; the list renders `inspection.title · siteName` |
| preferences | **none** |
| export | PDF download only |

**Measured size:** one report, one version, four findings → `sourceSnapshot` **202,789
bytes**, of which **144,043 bytes (71%)** are the raw HazLenz analysis snapshots. The
rendered PDF is **12,915 bytes**. `GET /inspection-reports` returned **196,016 bytes for a
single report record**, because `list()` selects `report.versions` in full, including every
version's `sourceSnapshot`. This is the open item `KG4E-DISC-03`, now **quantified**.

**There is a second, parallel report implementation still in the tree.** The routes
`/inspection` (952 lines), `/inspection-quick` (570), `/inspection-cover` (232) and
`/inspection-review` (327) write through `lib/cloudReports.ts` to the legacy
`@Controller('legacy/reports')` surface and the legacy `Report`/`Finding` entities. They
are **unreachable from navigation** — every nav and card route resolves to
`/inspection-workspace` — and are linked only to each other, so they form an isolated
island of 2,081 lines reachable by direct URL. They are the concrete "contradictory
sources of truth" risk Phase 5 asks about.

---

## 7. MEASURED — ownership, isolation and capacity inputs

**Isolation.** Every read is scoped by `organizationId` when present, otherwise
`ownerUserId`; `Inspection` and `InspectionReport` both carry a CHECK constraint enforcing
exactly one scope. Idempotency identity (`clientRequestId`) is deliberately keyed on
`createdByUserId`, narrower than the read model, so one organization member cannot adopt
another's row. Nothing here was changed or weakened.

**Capacity facts established by reading configuration, not by load testing:**

* `TypeOrmModule.forRootAsync` in `app.module.ts` sets **no `extra.max`**, so the `pg`
  pool runs at its **default of 10 connections** per process. No statement timeout, no
  connection timeout, no acquire timeout is configured.
* Global throttle is **100 requests / 60 s**; `POST /auth/*` is 5 / 60 s per IP.
* HazLenz Level-1 classification is **in-process and CPU-bound** — it is not an external
  call, so concurrent classification competes for the same event loop as every other route.
* Storage defaults to `s3` outside test.

**Indicative latency only** (single client, warm process, local disposable database —
**this is not a capacity measurement**): `POST /safescope-v2/classify`, n=12,
min 54 ms / p50 56 ms / p95 81 ms / max 89 ms.

**No maximum supported user count is claimed. None has been measured.**

---

## 8. What was NOT done

* No Expert-AI implementation. No LLM. No provider selected. **0 provider calls.**
* No UX remediation, no schema change, no migration, no feature work.
* No production access, no deployment, no Stripe or payment activity.
* No commit, no push, no tag or stash change.
* No frozen contract, scorer, gold artifact, threshold or protected test altered.
* The `shield` defect was **root-caused and left in place**, as this phase requires.

**Terminal:**
`INSITE_V1_PRELAUNCH_ARCHITECTURE_COMPLETE — BOUNDED_IMPLEMENTATION_AUTHORIZATION_REQUIRED`

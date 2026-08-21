# HazLenz Governed Knowledge Growth — Implementation Backlog

Sequenced, small, independently verifiable slices. Nothing here is implemented.
No slice may begin without explicit instruction.

**Sequencing principle:** build the *control surface* before the *autonomy*.
Until production reads knowledge through a versioned, promotable, rollbackable
pointer, every increment of autonomy adds risk with no compensating control.
Once that pointer exists, discovery autonomy is nearly risk-free by construction,
because candidates cannot reach production.

Risk key: **L** low · **M** medium · **H** high (production reasoning affected).

---

## Stage A — Close the versioning loop (no autonomy, no acquisition)

### KG-1 · Bind analyses to a knowledge release — **smallest safe first slice**

| | |
|---|---|
| **Dependencies** | none |
| **Risk** | **L** — additive, nullable, no reasoning change |
| **Gap closed** | G1 |

**What.** Add `knowledgeReleaseId` (varchar 120, nullable) to `hazlenz_analyses`
beside the existing `engineVersion`. Populate it from the resolved active release
at analysis time. Carry it into the finding and the generated report footer.

**Code areas.**
- `backend/src/inspection/entities/hazlenz-analysis.entity.ts`
- new migration under `backend/src/database/migrations/`
- `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts`
- report rendering (`backend/src/reports/`)

**Tests.**
- an analysis persists a non-null `knowledgeReleaseId`;
- the value is stable across reload and appears in the report;
- historical rows with `NULL` render without error (backwards compatibility);
- `test:hazlenz-core` shows no new failure against the 28/2 baseline;
- `test:safescope-standards` 15/15.

**Promotion criteria.** All above pass; no gold-set movement (this slice cannot
affect selection); migration is reversible.

**Why first.** It is the one change that makes every future knowledge decision
auditable, and it is safe even if nothing else is ever built. Without it, an
inspection cannot be explained after the fact.

---

### KG-2 · Release lifecycle and the active pointer

| | |
|---|---|
| **Dependencies** | KG-1 |
| **Risk** | **M** — introduces the pointer; the read path still ignores it |
| **Gap closed** | G3 |

**What.** Extend `regulatory_releases`: `parentReleaseId`, `changeSummaryJson`,
`sourceManifestJson`, `validationResultsJson`, `promotionReason`, `autonomyLevel`,
`activatedAt`, `deactivatedAt`. Add the `active` / `superseded` / `rolled_back`
statuses and the partial unique index guaranteeing exactly one `active` release.
Add `knowledge_release_events` for audit. Provide `promote` and `rollback` as
single transactions.

Mark the current corpus as the first active release so there is a known-good
baseline to roll back to.

**Code areas.** new migration; `backend/src/standards/seed/finalize-regulatory-release.ts`;
a new release-service module.

**Tests.** exactly one `active` enforced under concurrent promotion; promote then
rollback restores the prior `releaseId`; every transition writes an event row;
`manifestChecksum` recomputed from actual records matches.

**Promotion criteria.** Pointer moves correctly in both directions; no read path
consumes it yet, so production behaviour is provably unchanged (verified by
re-running the gold set before and after a promote/rollback cycle — identical
results expected).

---

### KG-3 · Scope the read path to the active release

| | |
|---|---|
| **Dependencies** | KG-2 |
| **Risk** | **H** — first slice that changes what production reads |
| **Gap closed** | G2 |

**What.** Standards retrieval resolves the active release once per request
(cached) and scopes to
`release_id = :active AND reviewer_approved = true AND deprecation_status = 'active'`.

**This is the highest-risk slice in Stage A** and needs care: if any current
`standards_master` row lacks a `release_id` or has `reviewer_approved = false`,
scoping the query will silently *remove* standards from consideration and
degrade recall. `finalize-regulatory-release.ts` sets `reviewer_approved` only
when `source_key AND approved_for_auto_ingestion AND NOT requires_approval`, so a
meaningful fraction of rows may be excluded.

**Mandatory pre-work.** Before enabling the filter, run a shadow comparison on a
disposable database: execute the gold set with and without the filter and diff
the selected standards per case. Publish the delta. If any case loses a
standard, resolve the release/approval metadata **first** — do not relax the
filter to compensate.

**Tests.** shadow diff is empty; gold set precision 1.00 / recall 1.00 /
wrong-regime 0 maintained exactly; `test:safescope-standards` 15/15;
`test:hazlenz-core` no new failures; rollback of the active pointer measurably
changes retrieval (proving the pointer is now load-bearing).

**Promotion criteria.** Zero recall loss demonstrated by shadow diff, not
asserted. Any loss blocks the slice.

---

### KG-4 · Enforce source policy at write time

| | |
|---|---|
| **Dependencies** | KG-2 |
| **Risk** | **M** |
| **Gap closed** | G4 |

**What.** Position the existing `approved-source-knowledge-intake-governance`,
`approved-knowledge-promotion-workflow-governance` and
`approved-knowledge-registry-write-guard` services as **gates** on knowledge
write paths rather than advisory outputs consumed by the orchestrator. Enforce
the tier rules from `SOURCE_TRUST_MODEL.md`: a tier-3+ source cannot produce a
normative unit; a tier-2 source cannot create a requirement with no tier-1 basis.

**Code areas.** the three `safescope-v2/` governance modules (wiring, not
rewriting); ingestion write paths in `safescope-knowledge/`.

**Tests.** a tier-3 source attempting a normative write is refused; a tier-4
consensus source cannot write full text; refusals are audited; existing
orchestrator output is unchanged.

**Promotion criteria.** Refusals demonstrated by test, not by inspection. No
existing legitimate write path breaks.

---

### KG-5 · Track the gold set in version control

| | |
|---|---|
| **Dependencies** | none (can run in parallel) |
| **Risk** | **L** |
| **Gap closed** | G9 |

**What.** `backend/tmp/gold-set-v3.ts` is untracked (`git ls-files` → empty) yet
is a promotion gate. Move it under version control with a recorded sha256, and
have the runner verify the file hash before scoring.

**Tests.** runner refuses to score if the gold-set hash does not match the
recorded value; recorded hash is computed from the actual file.

**Promotion criteria.** Gold set produces the identical Checkpoint 3 result
(precision 1.00, recall 1.00, wrong-regime 0) from its tracked location.

---

## Stage B — Autonomy Level 1: discovery only

### KG-6 · Fetch allowlist and retrieval hardening

| | |
|---|---|
| **Dependencies** | none technically; sequence after Stage A |
| **Risk** | **L** |
| **Gap closed** | G8 |

**What.** Derive a host allowlist from registry `baseUrl` values. Enforce it in a
single shared fetch helper used by every connector: TLS validation on, redirects
off the allowlisted host **refused**, no credentials, timeouts and size caps,
raw response archived with sha256.

**Tests.** off-allowlist host refused; off-host redirect refused; oversize
response refused; existing connectors still retrieve successfully.

---

### KG-7 · Conditional requests and change classification

| | |
|---|---|
| **Dependencies** | KG-6 |
| **Risk** | **L** — produces records, promotes nothing |
| **Gap closed** | G5 |

**What.** Store `ETag` / `Last-Modified` per source document; send conditional
requests. On a real change, diff normalized text at `citationPath` granularity
and classify per architecture §4. Write findings to an ingestion run record. **No
candidate release is produced yet.**

**Tests.** `304` short-circuits with no reprocessing; a whitespace/markup-only
change classifies `formatting_only`; a numeral change inside a threshold
classifies `threshold_change`; an anomalous change ratio halts the cycle.

**Promotion criteria.** A full monthly cycle across tier-1 sources completes with
correct classifications and no production write.

---

### KG-8 · Monitoring scheduler

| | |
|---|---|
| **Dependencies** | KG-7 |
| **Risk** | **L** |

**What.** Cadence-driven scheduler honouring the registry's existing
`refreshCadence`. Records checks, surfaces staleness beyond cadence. Bounded
concurrency; no always-running crawler.

**Tests.** cadence respected; failures retried with backoff then surfaced; a
stale source is flagged.

---

## Stage C — Autonomy Level 2: extraction and validation

### KG-9 · Knowledge unit schema

| | |
|---|---|
| **Dependencies** | KG-2 |
| **Risk** | **M** |
| **Gap closed** | G6 |

**What.** Implement `KnowledgeUnit` per architecture §3, including
`verbatimSpan` / `verbatimText`, typed thresholds, conditions and exclusions,
release lifecycle fields and `normalizedUnitChecksum`. Applicability vocabulary
reuses the existing unions in `hazlenz-knowledge-index.types.ts`.

**Tests.** schema round-trip; checksum stability; anchor resolution against a
stored document; **a unit whose `verbatimText` does not occur at its span is
rejected**.

---

### KG-10 · Deterministic extraction

| | |
|---|---|
| **Dependencies** | KG-9 |
| **Risk** | **M** |

**What.** Structural parse of eCFR / 30 CFR XML into citation hierarchy, defined
terms, normative sentences, thresholds, cross-references, effective dates. **No
model involvement.**

**Tests.** known citations extract to correct `citationPath`; thresholds parse
with correct value and unit; every unit carries a resolving verbatim anchor;
extraction is deterministic across runs (identical checksums).

---

### KG-11 · Conflict detection

| | |
|---|---|
| **Dependencies** | KG-9, KG-10 |
| **Risk** | **M** |
| **Gap closed** | G7 |

**What.** Implement precedence per architecture §6: authority, then jurisdiction,
then explicit effective date, then supersession. Escalate rather than resolve
when precedence does not discriminate.

**Tests.** tier-2 never overrides tier-1; MSHA vs OSHA is not treated as a
conflict; same-tier threshold disagreement escalates; a change with no effective
date does not win by recency.

---

### KG-12 · Candidate release assembly and validation gates

| | |
|---|---|
| **Dependencies** | KG-9, KG-10, KG-11, KG-5 |
| **Risk** | **M** |

**What.** Assemble a candidate release; run the full gate battery from
architecture §8; record `validationResultsJson` from actually executed runs.
Implement all eight hard blockers.

**Tests.** each hard blocker independently blocks a crafted candidate; a
candidate with a fabricated citation is blocked; a candidate that lowers gold-set
precision is blocked; results are recorded from real execution, never copied.

**Promotion criteria.** A candidate release built from a real source change
reaches `validated` with all gates recorded — and is **not** promoted.

---

### KG-13 · Model-assisted extraction (optional, gated)

| | |
|---|---|
| **Dependencies** | KG-12 |
| **Risk** | **H** |

**What.** Models propose conditions/exclusions and applicability mappings only,
under the six constraints in architecture §5: propose-only, mandatory verbatim
anchors, no model-emitted citations, no scope widening, closed vocabulary,
retrieved content treated as data and never as instruction.

**Tests.** a prompt-injection payload embedded in source text produces no valid
unit; a hallucinated citation is rejected by the anchor check; a scope-widening
proposal routes to human review; model output is always marked
`extractionMethod: 'model_assisted'` and can never auto-promote.

**Promotion criteria.** Adversarial suite passes, including deliberate injection
attempts. This slice may be deferred indefinitely — deterministic extraction
covers the structured majority of CFR text.

---

## Stage D — Autonomy Level 3: bounded promotion

### KG-14 · Checksum-neutral auto-promotion

| | |
|---|---|
| **Dependencies** | KG-12, and a period of Level 2 operation with human review |
| **Risk** | **H** |

**What.** Allow automatic promotion **only** where the normalized proposition
checksum is unchanged — formatting, typo, source metadata, effective-date-only,
unambiguous supersession, citation move. The implemented gate is the checksum
comparison, not a prose category list.

**Tests.** any candidate with a changed proposition checksum is refused
auto-promotion; every auto-promotion writes an audit event; rollback works
identically for auto-promoted releases.

**Promotion criteria.** Demonstrated over a meaningful run of Level 2 operation
where human reviewers agreed with the classification. Safety-critical
applicability changes remain governed permanently and are never in scope here.

**Level 4 (unrestricted self-modification) is explicitly not on this backlog.**

---

## Deferred — separate future phases

| Item | Blocked on |
|---|---|
| Company-specific overlay | KG-9 (structured thresholds), KG-2/KG-3 (release pinning), tenant isolation verification. See `COMPANY_OVERLAY_BOUNDARY.md`. |
| User-feedback learning | Not this phase. Conceptual only — `SOURCE_TRUST_MODEL.md` §3. |
| State-plan authorities | KG-11 (conflict precedence must handle state-vs-federal floors first). |

---

## Critical path

```
KG-1 ──▶ KG-2 ──▶ KG-3 ──▶ (control surface complete)
          │  └──▶ KG-4
          └──▶ KG-9 ──▶ KG-10 ──▶ KG-11 ──▶ KG-12 ──▶ KG-14
KG-5 ─────────────────────────────────────────▲
KG-6 ──▶ KG-7 ──▶ KG-8 ────────────────────────┘
```

**KG-1 is the recommended first slice**: lowest risk, highest audit value,
useful even if nothing after it is ever built.

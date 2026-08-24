# InSite / HazLenz — Engineering Blueprint and Continuity Reference

**Generated:** 2026-08-22 · **Last slice:** HazLenz capability acceptance (§28) · **Checkpoint:** `KG_5C_COMPLETE — CUSTOMER_PATH_EQUIVALENCE_ESTABLISHED — READY_FOR_CONTROLLED_PRODUCTION_SHADOW`
**L3-2b:** `L3_2B_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED` (§32, uncommitted) — every L3-2 defect repaired and proven on a fresh sealed holdout, but one high-consequence miss and clarification recall of 1/3 remain. Next: **L3-2c**, not L3-3.
**L3-2:** `L3_2_PARTIAL — SEMANTIC_REASONING_NOT_VALIDATED_FOR_ADVANCEMENT` (§31, uncommitted) — the historical result, preserved unchanged.
**L3-1:** `L3_1_COMPLETE — CUSTOMER_AUTHORITY_UNCHANGED` (§30, uncommitted).
**Level-3 architecture:** `HAZLENZ_LEVEL3_ARCHITECTURE_APPROVED_FOR_IMPLEMENTATION_PLANNING` (§29) — TARGET; §31 is the first slice with executable semantic evidence.
**HazLenz capability gate:** `HAZLENZ_CAPABILITY_GATE_BLOCKED — RC-01…RC-05, RC-07, RC-08` (§28). Maturity measured **LEVEL_1 — RULE ASSISTANT** against a LEVEL_3 minimum; 13 SAFETY_BLOCKERs open. **The governed-knowledge subsystem being converged does not make the reasoning engine deployable.**
**Preflight verdict:** `PRODUCTION_SHADOW_PREFLIGHT_BLOCKED — NO_GOVERNED_RELEASE_AND_SUBSYSTEM_NOT_DEPLOYED_IN_PRODUCTION` (§17.4)
**Repository:** `/Users/mckinley/Desktop/Safety_InSite` · **Branch:** `release/insite-rc-2026-08-18`
**Local HEAD:** the sixth of six commits placed on top of `5f050858` — the KG release package is now committed locally.
**Push state:** `NOT AUTHORIZED` · `origin/release/insite-rc-2026-08-18` is still `5f050858` (0 behind / 6 ahead).
**Companion machine state:** `docs/INSITE_CURRENT_STATE.json`

---

## 0 — START HERE (KG program convergence, KG-5C)

**A fresh session should read this section, then §21–§27, then only the sections its task needs.**
§§1–20 are the chronological architectural record; §§21–27 are the *converged* control system built
from it, and where a question is answered in both, **§§21–27 win**.

| If you need to know… | Read |
|---|---|
| What architecture actually exists, in one pass | **§21 — Converged architecture** |
| Whether you may change code in response to a failing test | **§22 — `ROOT_CAUSE_BEFORE_REMEDIATION`** |
| Which layer owns a discrepancy you just found | **§23 — Architectural ownership map** |
| Whether a finding blocks the release gate | **§24 — Finding classification** |
| Whether a finding you just "discovered" is already adjudicated | **§25 — Superseded findings register** |
| What is genuinely still open | **§26 — Open issues register** |
| What production SHADOW is for, and what would abort it | **§27 — Production SHADOW protocol** |
| Whether the HazLenz **engine** meets the capability bar for a checkpoint deploy | **§28 — HazLenz capability acceptance** |
| What the engine is being rebuilt into, and in what order | **§29 — Level-3 reasoning architecture (TARGET)** |
| What L3-1 actually built, and why it changes nothing yet | **§30 — L3-1 reasoning contract + validator** |
| Current stage / what may happen next | `docs/INSITE_CURRENT_STATE.json` → `programStatus` |

### The four things that are true right now

1. **Current customer authority is `LEGACY`.** Every production customer response today is produced
   by the legacy path. Governed content reaches no customer.
2. **Production SHADOW has never run.** No `GOVERNED_CUTOVER_*` variable is set in production, and
   `GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK` has never been set anywhere. Nothing in this document
   authorizes enabling it.
3. **CUTOVER is a separate authorization boundary** that SHADOW completion does not cross.
4. **The engineering is converged; the production operations are not executed.** `READY_FOR_CONTROLLED_PRODUCTION_SHADOW`
   is a statement about verified architecture. Of the operations 1–11 in §27.7, **only operation 1 —
   local packaging — has run** (2026-08-21, §17.5). The subsystem is not deployed, the migrations are
   not applied, no governed release exists in production, and nothing has been pushed.
   **Ready is not started, and committed is not shipped.**

5. **A second read-only preflight (KG-5D, 2026-08-21) reconfirmed all five blockers by direct
   measurement, and settled four questions that were open.** Telemetry integrity, evidence
   sufficiency, traffic strategy and `KG5D-DISC-01` are now decided and frozen (§17.4, §27.8), so
   none of them needs revisiting once operations 1–11 run. **No probe was required and none was
   sent.**

### The one rule that generated this section

The KG programme's most expensive failures were not wrong code. They were **circular remediation** —
an observation treated as an instruction to edit, producing a different observation, producing
another edit. §22 exists to make that loop unavailable, and §25 exists so a future session cannot
re-enter it by rediscovering an already-adjudicated finding.

---

## 1 — DOCUMENT CONTRACT

### Why this file exists

Every prior InSite session re-derived the same architecture from scratch — which module owns standards
selection, why governance does not filter before ranking, why `56.14132(a)` was refused, why a mutating
suite may not share a database. That costs tokens and time and occasionally reaches a *different* answer
than the one already adjudicated, reopening a closed decision. This file makes rediscovery unnecessary.

### What this file IS authoritative for

* **Architectural invariants** — the correctness rules the system is built on (`STABLE_INVARIANT`).
* **Adjudicated product/regulatory decisions** — already argued, already settled (`PROTECTED_DECISION`).
* **The decision log** — what was decided, why, and where the evidence lives.
* **Where things live** — the file/module ownership map, so one concept does not get re-implemented in
  a second place.
* **Which questions are already closed** — see §20.

### What this file is NOT authoritative for

* **Current runtime state.** HEAD, branch, `git status`, stash count, tag targets, database contents,
  corpus counts, active release, running services and environment variables all drift. Everything
  marked `MUST_REVERIFY` must be re-measured against the live repository/runtime before it is relied
  on. The recorded value is a *starting hypothesis*, never a fact.
* **Anything the repository now contradicts.** Repository code and newer verification evidence
  **override** this document. If they disagree, the code is right and this file is stale — fix the
  file (§ Update Policy), do not bend the code to match it.
* **Complete test output.** Metrics here are summaries with pointers. The artifacts in
  `verification/hazlenz-governed-knowledge-growth-2026-08-19/` are the evidence.

### Classification markers used throughout

| Marker | Meaning |
|---|---|
| `STABLE_INVARIANT` | Architecture/product truth. Preserve unless deliberately changed by a new design decision. |
| `PROTECTED_DECISION` | An adjudicated product/regulatory decision. Do not reopen without new contradicting evidence. |
| `VERIFIED_AT_CHECKPOINT` | Measured at a named KG checkpoint. True *then*; re-run to claim it now. |
| `MUST_REVERIFY` | Drift-prone. Never assume; always measure. |
| `KNOWN_CAVEAT` | Known non-blocking issue, historical limitation, or verification hazard. |
| `OPEN_ITEM` | Deferred work, or work belonging to the next slice. |

### Suggested future-session bootstrap

> Read `docs/INSITE_ENGINEERING_BLUEPRINT.md` and `docs/INSITE_CURRENT_STATE.json` first. Preserve
> `STABLE_INVARIANT` and `PROTECTED_DECISION` entries. Reverify every `MUST_REVERIFY` item before
> editing. Do not reopen closed KG decisions unless current evidence contradicts them.

---

## 2 — PRODUCT OVERVIEW

**InSite** (Safety InSite) is a workplace-safety inspection product. **HazLenz AI** is its
customer-facing safety-intelligence engine: it reads a field observation, reasons about the hazard,
decides which regulatory standards apply and why, and produces corrective actions and reports.

The workflow is **inspection-first**. An inspector records an observation; HazLenz analyses it and
returns findings with per-finding regulatory reasoning; a human reviews and finalizes; findings drive
corrective actions and tasks; reports are generated from the finalized record with knowledge
provenance attached.

Regulatory scope covers **OSHA General Industry (29 CFR 1910)**, **OSHA Construction (29 CFR 1926)**
and **MSHA (30 CFR 56/62/47)**. Jurisdiction (called *regime* in the shadow telemetry) is part of the
reasoning, not a post-filter.

**Philosophy of autonomy vs clarification** `STABLE_INVARIANT`: HazLenz asks for clarification only
where the answer is *decision-critical* — where a missing fact changes which rule applies or whether it
applies at all. It does not interrogate the user for detail that would not change the outcome, and it
never manufactures a fact to avoid asking. Where an applicability condition is unestablished, the
correct output is an `UNKNOWN` predicate with the open question **named**, not a supported violation
and not silence.

---

## 3 — REPOSITORY / RUNTIME MAP

```
Safety_InSite/
├── backend/                    NestJS + TypeORM + Postgres (the product API)
│   ├── src/applicable-standards/    Path A — candidate standards search/ranking
│   ├── src/safescope-v2/            HazLenz engine (classify, evidence, display)
│   ├── src/standards/               Governed knowledge subsystem (KG-1…KG-4B)
│   ├── src/inspection/              Persistence: analyses, findings, provenance
│   ├── src/reports/                 Canonical report generation
│   ├── src/database/migrations/     46 migrations (MUST_REVERIFY the count)
│   └── scripts/                     Verification suites + governance CLIs
├── frontend-next/              Next.js app (App Router)
├── verification/               82 verification roots (MUST_REVERIFY); KG work under
│   └── hazlenz-governed-knowledge-growth-2026-08-19/{kg-1…kg-4b}
└── docs/                       This blueprint + current-state JSON
```

### Backend — the modules that matter

| Path | Responsibility |
|---|---|
| `backend/src/applicable-standards/applicable-standards.service.ts` | **Path A** `suggest()` — the 15-stage candidate search: SQL retrieval, scenario boosts, semantic scoring, deterministic sort, structured dedup, jurisdiction re-filter, evidence fit, truncation, then backing annotation. |
| `backend/src/applicable-standards/citation-structure.ts` | Structured CFR citation identity — parsing, comparison, sort keys. The *only* correct way to compare two citations. |
| `backend/src/safescope-v2/safescope-v2.service.ts` | HazLenz orchestration; **Path B** `hydrateFindingScopedStandards()`. |
| `backend/src/safescope-v2/evidence/evidence-foundation.ts` | Per-finding regulatory rules: predicates, applicability decisions, citation selection **in code**. |
| `backend/src/safescope-v2/evidence/shared-evidence-facts.ts` | Evidence-fact extraction from observation text (negation-aware). |
| `backend/src/safescope-v2/display/guided-finding-response.ts` | Customer-facing finding response: backing status → source status, notices, confidence limits. |
| `backend/src/standards/display/standards-backing-contract.ts` | `resolveStandardsBacking()` — **the single decision point for content backing on both customer paths**. |
| `backend/src/standards/cutover/` | The KG-4A/4B controlled-cutover seam (see §9, §10). |
| `backend/src/standards/releases/` | Governed knowledge: release lifecycle, records, reviews, approval contract, manifest, corpus lookup. |
| `backend/src/standards/seed/finalize-regulatory-release.ts` | Release finalization — stamps manifest identity **and** approval identity. |
| `backend/src/inspection/inspection.service.ts` | `addAnalysis()` — authoritative persistence; `resolveKnowledgeReleaseId()` is the **server-side provenance gate**. |
| `backend/src/reports/canonical-reports.service.ts` | `knowledgeProvenance()` — report-time provenance derivation. |
| `backend/src/config/validate-production-environment.ts` | Startup refusal of unacknowledged governed/shadow modes in production. |

### Frontend — the surfaces that display governance

| Path | Responsibility |
|---|---|
| `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` | Standard Detail — citation, text, verified badge, confidence, notices. |
| `frontend-next/lib/inspection/standardDisplay.ts` | Display mapping for backing/source status. |

### Database

Postgres. Key tables: `standards_master` (live, **mutable** corpus), `regulatory_releases`,
`regulatory_release_records` (immutable snapshot rows), `regulatory_release_record_reviews`
(append-only decision log), `knowledge_release_events`, `hazlenz_analyses`, `inspection_findings`,
`human_reviews`.

---

## 4 — PROTECTED REPOSITORY STATE / GUARDRAILS

`STABLE_INVARIANT` — these rules hold for every future slice.

| Guardrail | Rule |
|---|---|
| **Branch convention** | Work continues on `release/insite-rc-2026-08-18`. `MUST_REVERIFY`. |
| **Protected checkpoint commit** | `5f050858227ca11cf90d2f6bf64148e70a018b64`. Every KG slice from KG-1 to KG-5D started **and ended** here. Operation 1 (2026-08-21) committed the governed release package as six commits **on top of** it; `5f050858` itself is unmoved and is still the package's parent and the remote tip. `MUST_REVERIFY`. |
| **Protected tags** | 23 tags at last count, including `insite-hazlenz-verified-baseline-2026-08-19`, `insite-inspection-ui-verified-2026-08-19` (→ `4c7a501d`), `insite-visual-acceptance-verified-2026-08-19` (→ `5f050858`). Never create, rename, move or delete a tag. `MUST_REVERIFY` count and targets. |
| **Four pre-existing stashes** | `stash@{0}`–`stash@{3}` are unrelated pre-existing work. **Never** pop, drop, apply or add to the stash stack. `MUST_REVERIFY` that the count is still 4. |
| **Original SafeScope development DB** | The `safescope` database is **never** a target for migrations, seeds, schema changes or any mutating command — even one expected to be a no-op. Same for `sentinel_dev`, `sentinel_safety`. |
| **Disposable DB ownership** | Any mutating suite must create and own its own `test_*` database. See §11 — this is the single most expensive lesson in the programme. |
| **Production** | No deploy, no production configuration change, no production database change, no remote branch, no PR. Governed cutover remains **unset** in production. |
| **Unrelated work preservation** | The worktree carries substantial legitimate uncommitted work (frontend theme work, scripts). Never `reset`, `checkout --`, `restore`, `stash`, or destructive `clean`. Hash manifests of unrelated files are kept per slice (`kg-3e/unrelated-worktree-changes.sha256`, 18 files) and re-verified at every slice boundary. |
| **No destructive git** | Nothing that rewrites, discards or overwrites history or working state without explicit user authorization. |
| **Verification artifacts** | Prior KG evidence directories are **evidence**. Do not edit, re-score or "tidy" them. Superseded conclusions get a note in the *new* slice, not an edit to the old one. |

---

## 5 — HAZLENZ ARCHITECTURAL INVARIANTS

All `STABLE_INVARIANT` unless marked otherwise.

1. **Negation and safe-state handling.** Evidence extraction tests the negative form **first**, so *"no
   spotter present"* registers as `absent` and can never be read as a compliant observer. An affirmatively
   controlled state is a distinct outcome from an unknown one.
   → `backend/src/safescope-v2/evidence/shared-evidence-facts.ts`

2. **Per-finding regulatory reasoning.** Each finding carries its own predicates, each predicate its
   own status (`SUPPORTED` / `UNKNOWN`) and its own evidence ids. A decision may be emitted while a
   required predicate is `UNKNOWN` — that is the disclosure shape, not a defect.
   → `evidence-foundation.ts`; measured in KG-3F Phase 14.

3. **Jurisdiction semantics.** Regime is part of retrieval and of the decision, and three vocabularies
   are genuinely in use (`general_industry`, `osha-general-industry`, `OSHA/general_industry`).
   Comparison must go through `canonicalizeRegime()`; **a different vocabulary for the same regime is
   not a disagreement**, and an unestablished regime on either side is not a disagreement.
   → `backend/src/standards/cutover/shadow-comparison.ts`

4. **Decision-critical clarification.** Ask only where the answer changes the outcome. Where an
   applicability trigger is unstated, record `UNKNOWN` with the open question **named** — an open
   question, not evidence against the rule.

5. **Deterministic standards ranking.** `suggest()` must be invariant to physical row order in
   Postgres. Achieved with explicit `ORDER BY` on all three retrieval stages plus a terminal
   tie-break (specificity ascending, then `citationSortKey`). `VERIFIED_AT_CHECKPOINT` KG-3F: 170/170
   across nine physical layouts (98/170 before the fix).

6. **Keyword scoring safeguards.** `s.keywords` is selected and scored, but capped — keyword weight is
   real (adding it moved `1926.1153` from score 15 to 51 and changed which citation was emitted for a
   silica finding) and must not be allowed to dominate. `VERIFIED_AT_CHECKPOINT` KG-3F: 54/54.

7. **Structured citation comparison.** Citations are compared structurally, never by string prefix.
   `1910.303` and `1910.303(b)(1)` are **distinct records with distinct checksums and distinct
   content**. `1926.5011` is not `1926.501`.
   → `citation-structure.ts`; KG-3E granularity contract 48/48.

8. **Parent/child granularity.** A paragraph never answers for a sibling; a parent never silently
   backs a child; a child never promotes to its parent. `1910.303(g)(2)(i)` resolves to **nothing**
   rather than falling back to `1910.303`. `56.14132(a)` resolves to nothing **even though the
   `56.14132` section exists and is approved**.

9. **No legal promotion without evidence.** A paragraph carrying its own applicability condition is
   cited only when that condition is *established by evidence*. Asserting a condition to reach a more
   specific paragraph is regulatory overreach. (KG-3D refused it for `1910.303(g)(2)(i)`/voltage;
   KG-3F applied the same rule to `56.14132(b)(1)`/obstructed view; KG-3E applied it prospectively to
   `1910.28`/tread-and-riser count.)

10. **No neighbouring-citation substitution.** `resolvedCitation` is always `requestedCitation`. There
    is no "nearest approved match". The two fields exist separately precisely so the invariant is
    assertable. `VERIFIED_AT_CHECKPOINT` KG-4A: all 84 fallback rows.

11. **Evidence vs backing separation.** *Applicability confidence* (HazLenz reasoning) and *governed
    content backing* (the corpus) are **independent axes**. Approved text may sit beside an uncertain
    applicability — the text is true regardless — with the missing trigger still disclosed. Approved
    content never upgrades applicability; an applicability change never changes a backing/text/provenance
    decision. `VERIFIED_AT_CHECKPOINT` KG-4A: two executable independence predicates, 12/12 and 28/28,
    over all 84 rows; browser-confirmed in four themes.

12. **Suppression is not a governance power.** There is deliberately **no `SUPPRESSED` delivery
    state**. Suppression is an *applicability* decision made upstream (an unsupported rule emits no
    decision at all). Governance-driven suppression is unrepresentable in the type.

13. **A governance gap must never delete an evidence-derived citation.** Structural, not policy:
    governed resolution runs **after** ranking, dedup, jurisdiction filtering and truncation, so it
    cannot add, remove, reorder or re-truncate the candidate set.

---

## 6 — GOVERNED KNOWLEDGE ARCHITECTURE (KG-1 → KG-4B)

### The slice map

| Slice | Closed | Responsibility |
|---|---|---|
| **KG-1** | gap G1 | Knowledge release **provenance** — `knowledgeReleaseId` on `hazlenz_analyses` and `inspection_findings`; provenance decided server-side, **never** from client input. |
| **KG-2** | gap G3 | Regulatory **release lifecycle** + active pointer. Before KG-2, finalization was an unconditional upsert that freely rewrote a "finalized" release. |
| **KG-3A** | defects A/B/C | Release **integrity** + approval semantics pre-gate. Fixed record re-stamping: membership cannot be a single mutable scalar on the live corpus table. |
| **KG-3B** | — | **Reviewer approval** path + corpus-backed validation harness. `ARCHITECTURE_READY / CURRENT_CORPUS_NOT_READY`. |
| **KG-3C** | — | Governed standards **display contract** — truthful backing states on screen and in reports. |
| **KG-3D** | — | First **real corpus remediation**: 7 genuinely reviewer-approved records, each compared clause-by-clause against authoritative eCFR text. |
| **KG-3E** | — | **Coverage + source integrity**: 22 of 23 emitted citations approved; every placeholder record removed; found the row-order nondeterminism and the source-URL binding question. |
| **KG-3F** | — | **Deterministic retrieval** + the **approval/provenance contract** (dual digests) + the `56.14132` correction + the 160-citation rule-to-corpus map. |
| **KG-4A** | — | **Controlled cutover architecture**: 4 modes, the 84-row fallback table, release pinning, the anti-spoofing gate, default-off proof. |
| **KG-4B** | — | **Shadow telemetry**: the mismatch taxonomy, an isolated 43-analysis corpus, customer-output invariance, privacy review, layout determinism. |
| **KG-4D** | — | **Request-path integration**: the six KG-4C modules wired into the real customer path through ONE orchestration boundary, with LEGACY invariance proven against a true pre-integration baseline, SHADOW proven customer-invisible in the browser, provenance NULL in real database rows, and an independent black-box proof of the database ownership guard. |
| **KG-4C** | — | **Production shadow safety rails**: the four-lock authorization gate, the five-stage cohort model, kill switch, circuit breaker, deterministic sampling, the v2 event schema, privacy canaries, the customer-output invariance hash, the structural SHADOW provenance invariant, and the reusable test-database ownership guard. Design and verification only — nothing enabled. |
| **KG-4E** | closed CAVEAT-11 | **Report / PDF invariance**: the fifth and last customer-facing surface. 56 real PDFs generated through the running product, LEGACY and SHADOW proven customer-semantically identical under a derived-volatility oracle, governed and shadow vocabulary proven absent, and the renderer proven to exclude governed state *structurally* rather than incidentally. No production code was changed. |
| **KG-5A** | — | **Release packaging + production readiness measurement**: all 582 working-tree paths classified with none unknown, a six-commit plan derived from the real import graph, the six migrations rehearsed additive-only against production's exact pre-KG shape. Found `KG5A-DISC-01` — the release could not be built without mutating the live corpus. |
| **KG-5B** | closed KG5A-DISC-01/03 | **Production-safe governed release construction**: the governed record given a home of its own (`governed-source-set.ts` → `release-definition.ts` → TEMP staging → `regulatory_release_records`), `assertNoLegacyCorpusWrites()` as an executable invariant, the legacy-corpus guard at stage 1 of the seed pipeline, and the operator release CLI with in-transaction expected-pointer preconditions. |
| **KG-5C** | closed KG5B-DISC-01 | **Customer-path equivalence + delivery fidelity**: both resolver paths exercised through production code; 27/27 approved records deliver byte-for-byte the reviewed governed artifact, 8/8 unreviewed preserve legacy behaviour, 23/23 emitted gold-set citations proven, 0 approved badges on non-reviewed content. Added `GOVERNED_REVIEWED_RENDERING`; fixed `KG5C-FIX-01`. Found `KG5C-DISC-01`. |

### The flow

```
observation
  │
  ├─ HazLenz evidence reasoning ──────────────► applicabilityDecisions[] (SUPPORTED / UNKNOWN)
  │      evidence-foundation.ts                  (citation chosen IN CODE on Path B)
  │
  ├─ Path A  suggest()  ─ 15 stages ─► rankedAndLimited (≤10 candidates)
  │
  └─────────────────► GovernedCutoverContext.create(principal, env)   ◄── THE ONE SEAM
                         │  returns null unless BOTH locks are open
                         ├─ resolveCutoverMode(env)          default LEGACY
                         ├─ resolveCutoverEnablement(user)   default OFF
                         └─ pinGovernedRelease()             ONE active-pointer read/analysis
                                    │
                         context.resolveStandard(citation, applicability)
                              ├─ resolveGoverned()   → GovernedResolutionResult
                              ├─ decideFallback()    → FallbackDecision (84-row table)
                              └─ emitCutoverEvent() / shadow comparison → telemetry
                                    │
                         resolveStandardsBacking({ …, governed })   ◄── existing KG-3C contract
                                    │
                         projectGovernedDisplay()   (contributes {} unless customerVisible)
                                    │
                         customer response ─► InspectionService.addAnalysis()
                                                  └─ resolveKnowledgeReleaseId(snapshot, principal)
                                                       ◄── SERVER-SIDE PROVENANCE GATE
                                              hazlenz_analyses / inspection_findings
                                                  └─ CanonicalReportsService.knowledgeProvenance()
```

### Entities and relationships

| Entity / table | Role |
|---|---|
| `regulatory_releases` | The release: `releaseId` (unique), `status`, `manifestChecksum`, `recordCount`. One release may be `active`. |
| `regulatory_release_records` | **Immutable** per-record snapshot of the corpus at finalization: frozen `payload`, `recordChecksum` (manifest identity), and (post-KG-3F) `substantiveContentDigest` / `sourceIdentityDigest` / `approvalDigest` / `approvalContractVersion`. |
| `regulatory_release_record_reviews` | **Append-only** reviewer decision log. Each decision binds to an exact record version by checksum/digest, and may carry `supersedesDecisionId`. |
| `knowledge_release_events` | Lifecycle events for a release. |
| `standards_master` | The **live, mutable** corpus retrieval actually reads. Drift against an approved snapshot is detectable (`describeLiveCorpusDrift()`), and the axis that moved is reported. |
| `hazlenz_analyses.knowledgeReleaseId` | Analysis-level provenance; NULL unless governed content materially influenced output. |
| `inspection_findings.knowledgeReleaseId` | Finding-level provenance; the analysis's own id or NULL, never a third value. |

---

## 7 — APPROVAL / PROVENANCE CONTRACT

Owner: `backend/src/standards/releases/approval-contract.ts` · `release-record-review.service.ts`
Evidence: `kg-3f/phase8-10-approval-provenance-contract.md` · `npm run test:approval-contract` (57/57)

### The dual-digest architecture `PROTECTED_DECISION`

Two identities answering two different questions:

| Identity | Question |
|---|---|
| `recordChecksum` (v1, manifest) | *Was this release tampered with?* |
| `approvalDigest` (v2, approval) | *Does this reviewer's decision still truthfully name this content?* |

`approvalDigest = canonicalDigest(APPROVAL_CONTRACT_VERSION + substantiveContentDigest + sourceIdentityDigest)`.
`APPROVAL_CONTRACT_VERSION = 2`.

**Axis A — substantive regulatory artifact** (changes MUST invalidate): `agency` · `citation` ·
`part_number` · `subpart` · `title` · `standard_text` · `plain_language_summary` · `scope_code` ·
`hazard_codes` · `required_controls` · `keywords` · `severity_weight` · `is_active` ·
`effective_date` · `revision_date` · `deprecation_status` · `superseded_by_citation` ·
`applicability_schema_version`.

`keywords` is retained **deliberately, not inherited**: KG-3F Phase 4 measured that keywords change
which citation is emitted, so a record whose keywords moved can be surfaced against materially
different hazards than the reviewer approved.

**Axis B — authoritative source identity** (changes MUST invalidate): `source_key` · `source_name` ·
`source_type` · `authority_tier` · `allowed_use` · `source_publication_date` ·
`source_document_checksum` · `transformation_version`.

**Axis C — retrieval/transport metadata** (excluded from both, by decision): `source_url` ·
`retrieval_date` · `created_at` · `updated_at`. Exclusion is asserted **by construction** (the fields
are absent from both projections), not by equality, so a pass cannot be a fixture accident.

**Why the URL is not identity** `PROTECTED_DECISION`: a URL is one retrieval path to an artifact, not
the artifact — eCFR and the govinfo mirror serve identical text from different hosts. If the URL carried
identity, every mirror migration would revoke the corpus's approvals, and a mechanism that fires
constantly for no regulatory reason trains operators to bypass it. `source_document_checksum` carries the
safety argument instead: a re-fetch returning *different* content moves the checksum and approval falls.

### What invalidates / does not invalidate approval

| Change | Verdict |
|---|---|
| regulatory text · title · canonical citation · **paragraph granularity (part/subpart)** · jurisdiction | `BECOME_INEFFECTIVE` (substantive) |
| source document checksum + edition · source registry key | `BECOME_INEFFECTIVE` (source identity) |
| equivalent authoritative URL · retrieval date only · irrelevant transport metadata | `REMAIN_EFFECTIVE` |

Granularity and force (`deprecation_status`, `superseded_by_citation`, effective/revision dates) were
**outside** the v1 binding — a record could be re-scoped from general industry to construction, or
marked superseded, and still read as reviewer-approved authority. That defect is fixed and asserted.

### `canonicalDigest()` and why it exists

The manifest's `digest()` is `sha256(JSON.stringify(value))` — insertion-order dependent. Safe for a
manifest (always recomputed from freshly-projected rows in one order); **not** safe for an approval,
which must be re-verifiable forever from a frozen `approvalPayload` that round-trips through `jsonb` and
loses key order. `canonicalDigest()` sorts keys recursively before hashing. `digest()` in
`release-manifest.ts` is deliberately **left untouched** — changing it moves every finalized manifest.

### Historical NULL semantics `STABLE_INVARIANT`

Every new approval column is nullable, and **NULL is load-bearing**: it means *this record predates the
approval contract*. Pre-contract rows **cannot** be backfilled and deliberately are not — the frozen v1
payload never held `part_number`, `deprecation_status` or `source_document_checksum`, and recomputing
from the mutable `standards_master` would attest a reviewer to content they may never have seen — the
exact stale-approval failure the subsystem exists to prevent.

### Reaffirmation, carry-forward, and no bulk approval

* `describeContractReaffirmationCandidates()` surfaces pre-contract approvals as an explicit worklist.
* Reaffirmation is an ordinary `approveRecord` carrying `supersedesDecisionId`: it **appends** a
  decision and points at the one it supersedes. Nothing is rewritten or deleted.
* **There is no bulk approval path** `PROTECTED_DECISION`.
* `describeCarryForwardCandidates()` matches on `approvalDigest` (not `recordChecksum`) and reports
  `matchBasis`. Matching on the manifest digest would have offered carry-forward for records that
  differed in paragraph granularity or deprecation status.
* `describeLiveCorpusDrift()` compares approved-vs-live and **reports the axis that moved**, so a
  provenance correction is never mistaken for a regulatory revision.

### Migration dependency `STABLE_INVARIANT`

**`1800000014000-ApprovalProvenanceContract`** — additive and reversible; 10 nullable columns
(5 on `regulatory_release_records`, 5 on `regulatory_release_record_reviews`) + 2 indexes. No customer
retrieval path reads any of them.

The finalizer writes the approval identity **unconditionally**, so this migration must be applied
before `seed:safescope-standards` on any database. **Failing loudly is intentional** — silently
skipping the approval identity would produce records with NULL digests indistinguishable from
genuinely pre-contract records, which is the exact ambiguity the NULL semantics exist to avoid.
KG-4B failure injection confirms the runtime behaviour: with `1800000014000` absent, backing is
`RESOLVER_UNAVAILABLE`, health is `STALE_SCHEMA`, telemetry is `INTEGRITY_FAILURE`, and the customer
stays on legacy — no throw, no 500.

---

## 8 — CURRENT REGULATORY / CORPUS PRINCIPLES

1. **Exact citation fidelity** `STABLE_INVARIANT`. The citation shown is the citation the evidence
   supports. No substitution, no rounding to a neighbour, no promotion to a more specific paragraph
   whose conditions were not established.

2. **Section vs paragraph granularity** `STABLE_INVARIANT`. Cite the section when the evidence
   establishes the section's duty but not a paragraph's condition; cite the paragraph when its
   condition is established. Both are truthful; choosing the paragraph without its trigger is not.

3. **Corpus approval is not usage-driven** `PROTECTED_DECISION`. High corpus usage does **not** justify
   approval. A record is approved because a reviewer compared it clause-by-clause against the
   authoritative source and it was correct — never because it is frequently retrieved.

4. **Unused declared citations are not automatically cutover prerequisites** `PROTECTED_DECISION`. A
   citation declared by an expert rule but emitted by nothing is a *backlog* item, not a blocker. It
   resolves `CITATION_ONLY` the moment its rule first fires, which is the correct behaviour.

5. **Emitted-coverage philosophy** `STABLE_INVARIANT`. Coverage is measured over what the engine
   actually emits, computed **live** by running the real selection engine over the tracked gold set —
   never from a frozen artifact list, which cannot see a predicate change. And coverage is closed by
   **correcting the citation**, never by fabricating a record to close a percentage.

6. **`56.14132` adjudication** `PROTECTED_DECISION`. `(a)` governs manually-operated horns *where
   provided*; `(b)(1)` is the backing rule and applies only *"when the operator has an obstructed view
   to the rear"*; `(b)(1)(iv)` makes **an observer** a compliant alternative. The rule was split:
   `(a)` fires on horn evidence only; obstructed view established → `(b)(1)`; otherwise → the truthful
   section `56.14132`; satisfied by a functional alarm **or** an observer **or** a clear rear view.
   No record was created for `(a)`.

7. **MSHA-TRAFFIC-01 adjudication** `PROTECTED_DECISION`. See §13.

8. **High-use but legally incomplete records must not be approved** `PROTECTED_DECISION`. An unbacked
   citation tells the user nothing; an approved-but-wrong one tells them something false with the
   product's authority behind it. KG-3E refused `56.14132(a)` on exactly this ground.

### Counts — all `VERIFIED_AT_CHECKPOINT`, none timeless

| Metric | Value | Checkpoint | Artifact |
|---|---|---|---|
| Emitted citations (gold set) | 23 | KG-3F | `kg-3f/rule-to-corpus-map.json` |
| Emitted **and** approved | 23 (100%) | KG-3F | same |
| Emitted with no governed record | 0 | KG-3F | same |
| Distinct citations in rule-to-corpus map | 160 | KG-3F | same |
| Declared but unemitted | 137 | KG-3F | same |
| Not safe to govern yet | 132 | KG-3F | same |
| Duplicate declarations (multi-surface) | 42 | KG-3F | same |
| Parent/child ambiguities | 39 | KG-3F | same |
| Governed record without source URL | 3 | KG-3F | same |
| Hazard families measured / blocked | 27 / **0** | KG-3F | `kg-3f/family-readiness.json` |
| Release records in the KG-4A/4B seed | 35 | KG-4A/4B | `kg-4a`, `kg-4b` reproduction commands |

---

## 9 — CUTOVER ARCHITECTURE (KG-4A)

Owner: `backend/src/standards/cutover/` — six modules:
`cutover-mode.ts` (mode + enablement; **imports nothing**, asserted) ·
`fallback-contract.ts` (the 84-row table, pure) ·
`governed-resolution.ts` (canonical result type, release pin, total resolver) ·
`governed-cutover-context.ts` (the seam; per-analysis pin + memo + provenance accumulator) ·
`governed-provenance.ts` · `cutover-observability.ts` · plus `shadow-comparison.ts` (KG-4B).

### The four modes

| Mode | Governed resolver runs? | Customer output | `knowledgeReleaseId` |
|---|---|---|---|
| `LEGACY` **(default)** | **no** — context is `null` | today's, byte-identical | always NULL |
| `SHADOW` | yes | **byte-identical to LEGACY** | always NULL |
| `GOVERNED_WITH_FALLBACK` | yes | approved text preferred; fallback contract otherwise | only where governed content influenced output |
| `GOVERNED_STRICT` | yes | only exact approved content may be shown as text | as above |

`GOVERNED_STRICT` is **not** a customer-default candidate `PROTECTED_DECISION`: 23 of 160 declared
citations were emitted-and-approved at KG-3F, so strict mode would strip HazLenz-authored text from the
rest for every customer at once. Strictness about **claims** is the goal; strictness about **display** is
a different and far more disruptive thing.

### Default-safe configuration `STABLE_INVARIANT`

* `resolveCutoverMode({})` → `LEGACY` / `DEFAULT_NO_CONFIGURATION`.
* Modes match an exact closed set after `trim().toUpperCase()`. `Boolean(env.X)` is **never** used, so
  every truthy non-mode string (`'true'`, `'1'`, `'yes'`, `'on'`, `'GOVERNED'`, `'{}'`, …) resolves to
  `LEGACY` with `INVALID_MODE_VALUE` — 22 such strings asserted.
* Env names: `GOVERNED_CUTOVER_MODE`, `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST`,
  `GOVERNED_CUTOVER_ORG_ALLOWLIST`, `GOVERNED_CUTOVER_PRODUCTION_ACK`,
  `GOVERNED_CUTOVER_OBSERVABILITY`. `MUST_REVERIFY` any value in a live environment.
* **Production acknowledgement**: production requires a second, differently-named acknowledgement
  `GOVERNED_CUTOVER_PRODUCTION_ACK=I_ACKNOWLEDGE_GOVERNED_CUTOVER`. A truthy-but-wrong value does not
  unlock it. Without it, startup **fails** via `validateProductionEnvironment()`.

### The enablement boundary — two independent locks

**server mode AND (account allowlist OR organization allowlist)**, both defaulting off, so a single
mistake cannot expose customers. A governed mode with **no** allowlist enables nobody
(`NO_ALLOWLIST_CONFIGURED`). A deterministic percentage cohort was **rejected** for the first cutover:
it names nobody, so an operator cannot say in advance who is affected.

The principal comes from the authenticated JWT-derived user **only**. No body, query, param or header
can select a mode — asserted (`VERIFIED_AT_CHECKPOINT` KG-4A) by a source scan over all 573
customer-path files, and rejected with HTTP 400 by request validation at the API.

### The single integration seam `STABLE_INVARIANT`

`resolveStandardsBacking()` already accepted an optional pre-resolved `governed` input that nothing
customer-facing produced; KG-4A supplies it. So: `governed: undefined` reproduces today byte-for-byte
(LEGACY is a structural no-op, not a re-implementation); Path A and Path B **cannot disagree** because
they share the resolver; and governed resolution in Path A runs **after** `rankedAndLimited`.

Call sites: `applicable-standards.service.ts:2408` (Path A), `safescope-v2.service.ts:5648` (Path B);
`guided-finding-response.ts:204` re-derives only as a `??` fallback. `MUST_REVERIFY` line numbers.

### The fallback decision table

84 rows = 4 modes × 3 applicability states × 7 backing states. Machine-readable:
`kg-4a/contracts/fallback-matrix.json`; regenerate with
`npm run test:kg4a-cutover-contract -- --emit <file>`.

| Axis | Values |
|---|---|
| Applicability | `SUPPORTED` · `UNCERTAIN` · `UNSUPPORTED` |
| Governed backing | `APPROVED_EXACT` · `APPROVED_SECTION_ONLY` · `APPROVED_NO_TEXT` · `UNAPPROVED_RECORD` · `NOT_IN_RELEASE` · `NO_ACTIVE_RELEASE` · `RESOLVER_UNAVAILABLE` |
| Delivery | `GOVERNED_VERIFIED_TEXT` · `LEGACY_TEXT_UNVERIFIED` · `CITATION_ONLY_NO_TEXT` |

Summary: LEGACY 21 × legacy-text · SHADOW 21 × legacy-text · `GOVERNED_WITH_FALLBACK` 3 verified / 3
citation-only / 15 legacy-text · `GOVERNED_STRICT` 3 verified / 18 citation-only. **The citation is
shown in all 84 rows.**

Only `APPROVED_EXACT` yields verified text. `APPROVED_SECTION_ONLY` is recorded and observable but
confers nothing — no text, no badge, no governed backing input, no provenance.

**Why fallback shows legacy text without a caution** `PROTECTED_DECISION`: non-approved states under
`GOVERNED_WITH_FALLBACK` deliver today's HazLenz-authored text, already labelled "HazLenz standard
summary" with its source-review caveat. Adding "verified text unavailable" would attach a caution to
essentially every standard in the product — breakage, not precision. What differs is the **reason
code**, which operators need and which never reaches the customer.

### `EVIDENCE_UNKNOWN` vs `GOVERNANCE_FILTER_EMPTY` `STABLE_INVARIANT`

| | Meaning | Blocks cutover? | Disclosed? |
|---|---|---|---|
| `EVIDENCE_UNKNOWN` (applicability `UNCERTAIN`) | HazLenz produced no candidate because the observation does not establish the rule's conditions. Governance was never involved. | **No** — this is correct behaviour | **Yes** |
| `GOVERNANCE_FILTER_EMPTY` (backing `NOT_IN_RELEASE`) | HazLenz produced a defensible candidate and approved-only filtering removed it. A genuine corpus gap. | **Yes** | **No** (a content-availability gap is not an applicability statement) |

Reporting the first as a coverage failure would create pressure to re-weaken a predicate to make a
number go up. That is the failure mode this split exists to prevent.

### Server-side provenance gate `STABLE_INVARIANT`

`addAnalysis` receives `resultSnapshot` in the **request body**, so `resolveKnowledgeReleaseId(snapshot,
principal)` treats it as an untrusted **claim**, honoured only when the **server** independently agrees
that (1) this principal is enabled for a mode that can influence customer output and (2) the claimed
release is the one actually `active` right now. Fail either → NULL.

`knowledgeReleaseId` goes non-NULL **only** where the customer-visible analysis actually consumed
governed release information. Governed mode + pinned release + nothing consumed → **NULL**: the output is
identical to LEGACY, so naming a release would be false.

### Request/release pinning `STABLE_INVARIANT`

`getActiveRelease()` reads a mutable pointer and an analysis is not atomic, so the pointer is read
**once** at analysis start and every resolution takes the pinned id explicitly. Preferred over a lock,
which would serialise long AI operations behind a corpus pointer — unnecessary, since finalized records
are immutable, so pinning an **id** makes the snapshot stable. Concurrent pins each retain their own
mode; there is no request-global mutable state (no module cache, no `AsyncLocalStorage`, no singleton).

The context also **memoises per citation**, so one analysis resolves a citation exactly once — a
mid-analysis revocation cannot produce a half-old/half-new basis. The boundary is the **analysis**, not a
stale cache: the next analysis sees the revocation immediately.

### Mixed provenance

* The **analysis** is governed if **any** finding consumed governed content.
* A **finding** is governed only if **it** consumed.
* `mixed` is surfaced so a reader of the analysis row knows to look at the findings.
* Findings never disagree about *which* release — one analysis, one release.
* Narrowing applies only where there is per-finding information to narrow by; otherwise the finding
  inherits verbatim exactly as KG-1 specified.
* No migration and no new column were needed — KG-1's two columns sufficed.

### Rollback

Rollback is a **mode change** — no DB rollback, no de-activation, no approval revocation, no analysis
rewriting, no redeploy. The next analysis records NULL; the earlier one still records its release, because
nothing recomputes a persisted row. `historicalProvenanceIsPreserved()` is plain equality in **both**
directions and is asserted to fail if a historical id were cleared *or* if a legacy analysis acquired one.

### The SHADOW obligation `STABLE_INVARIANT`

> **SHADOW must not alter customer-visible output and must not write governed customer provenance.**

Structurally guaranteed: in SHADOW the context returns `null` as the backing input and
`projectGovernedDisplay()` contributes `{}` because `customerVisible` is false. **Adding a key to a
response is altering customer output** — a real defect, found and fixed (§10).

---

## 10 — SHADOW TELEMETRY CONTRACT (KG-4B)

Owner: `backend/src/standards/cutover/shadow-comparison.ts`
Machine-readable: `kg-4b/contracts/shadow-taxonomy.json` · Schema `kg4b.shadow-comparison.v1`

### Purpose

SHADOW is the only mode that produces the mismatch corpus needed to size the governed/legacy gap, and it
cannot hurt anyone. Its events answer: *if governance were on, what would change, where, and would any of
it be wrong?*

### The event — 29 fields, privacy-safe by construction

Every field is an identifier, a categorical state, a digest or a number. **Content is carried as
digests only** (`legacyTextDigest` / `governedTextDigest`) — never as text.

| Group | Fields |
|---|---|
| identity | `schemaVersion` `event` `observedAt` `correlationId` `findingKey` `eventKey` |
| mode + release | `mode` `releaseId` `releaseManifestChecksum` |
| citations | `requestedCitation` `legacyCitation` `governedResolvedCitation` |
| the two axes | `applicability` · `legacyBackingState` `governedBackingState` |
| approval identity | `approvalContractVersion` `approvalDigest` |
| outcome | `fallbackState` `mismatch` `dimensions` `severity` `rootCause` `resolverHealth` |
| content | `legacyTextDigest` `governedTextDigest` |
| aggregation | `hazardFamily` `jurisdiction` `latencyMs` |
| obligation | `customerOutputUnchanged` |

`releaseManifestChecksum` is captured in the **same query** as the active-pointer read, so the two can
never describe different releases. Enforcement: `SHADOW_EVENT_ALLOWED_FIELDS` + a runtime
`assertShadowEventPrivacySafe()` guard. Privacy review searched **14 real PII/secret markers** in real
serialized events: **0 found** (`VERIFIED_AT_CHECKPOINT` KG-4B, 26/26).

### The canonical mismatch taxonomy

**One classification engine, one taxonomy.** KG-4A's nine-value category set survives only as a
backward-compatible projection (`toLegacyMismatchCategory`), asserted total in both directions, so the two
vocabularies cannot drift.

15 categories, each proven reachable. Every comparison carries **one primary category** (for counting) plus
**ten independent boolean dimensions** (for filtering), from the same function — a real mismatch usually
has several dimensions at once, and one enum throws away most of what an operator needs.

Precedence: `INTEGRITY_FAILURE` → `RESOLVER_FAILURE` → `CITATION_DIFFERENCE` →
`JURISDICTION_DIFFERENCE` → `GRANULARITY_DIFFERENCE` → backing-derived (`GOVERNED_MISSING` /
`GOVERNED_UNAPPROVED` / `GOVERNED_CITATION_ONLY`) → content comparison → `ORDERING_DIFFERENCE`.

### Severity — assigned separately from category `PROTECTED_DECISION`

| Severity | Categories |
|---|---|
| **BLOCKING** | `JURISDICTION_DIFFERENCE` · `CITATION_DIFFERENCE` · `INTEGRITY_FAILURE` · `CONTENT_DIFFERENCE` |
| **REVIEW** | `GRANULARITY_DIFFERENCE` · `GOVERNED_UNAPPROVED` · `GOVERNED_CITATION_ONLY` · `APPLICABILITY_DIFFERENCE` · `RESOLVER_FAILURE` |
| **INFORMATIONAL** | `EXACT_MATCH` · `CONTENT_EQUIVALENT` · `GOVERNED_APPROVED_EXACT` · `GOVERNED_MISSING` · `ORDERING_DIFFERENCE` · `PROVENANCE_DIFFERENCE` |

Two judgement calls, stated so they can be argued with:

* **A missing governed record is NOT blocking.** Under `GOVERNED_WITH_FALLBACK` the customer receives
  exactly today's behaviour. Calling it blocking would make the corpus unreadable and misdirect
  remediation — it is a *governance backlog* item, not a defect.
* **Two different texts for one citation IS blocking.** One would be shown as verified regulation.

"Different" and "wrong" are not the same claim; conflating them is the pressure that leads someone to
weaken a predicate to make a number go up.

### Root-cause buckets (11)

`HAZLENZ_SELECTION` · `CORPUS_CONTENT` · `CITATION_GRANULARITY` · `GOVERNANCE_APPROVAL` ·
`SOURCE_PROVENANCE` · `APPLICABILITY_EVIDENCE` · `JURISDICTION` · `PRESENTATION_ONLY` ·
`RESOLVER_FAILURE` · `EXPECTED_FALLBACK` · `NONE`.

`EXPECTED_FALLBACK` is deliberately first-class: the contract behaving as designed is an *outcome*, not
a defect. An unreviewed record splits by provenance — `GOVERNANCE_APPROVAL` when the remedy is review,
`SOURCE_PROVENANCE` when the source key is a placeholder and the remedy is sourcing.

### Content equivalence is conservative on purpose `PROTECTED_DECISION`

`CONTENT_EQUIVALENT` normalises case, unicode quote/dash variants, whitespace and terminal punctuation
— **and nothing else**. It does not normalise `shall`/`must`, numerals, or any word that could carry
legal weight.

### Event volume and idempotency

`eventKey = sha256(correlationId, findingKey, citation, releaseId)`. Cardinality is **one event per
(analysis × distinct citation)** — not per resolver step, not per candidate occurrence — because the context
memoises by citation. A retried analysis reproduces the *same* keys, so retries deduplicate.
`VERIFIED_AT_CHECKPOINT` KG-4B: 83 events, 83 distinct keys, 0 duplicates, mean 2.18/analysis.

### Storage `PROTECTED_DECISION`

KG-4B collected structured JSONL from stdout. **No production database schema was created for a
verification artifact.** A durable production store is a decision for the slice that actually needs one
— with its own retention contract. `OPEN_ITEM` for KG-4C.

### Physical-layout determinism

52 probes × **7 physically different layouts** (original, citation_asc, citation_desc,
parent_before_child, child_before_parent, random_seed_1, random_seed_2) → **one** telemetry digest
`0bce5a71a9d2664293834b5eeaa443eb…`. Each layout is a clone whose `regulatory_release_records` heap is
physically rewritten in a different order. Compared per probe: resolved citation, backing, health,
granularity, release, manifest, mismatch, all ten dimensions, severity, root cause — **plus** the aggregate
distributions, because a per-row match with a different total would still mean something moved.
`VERIFIED_AT_CHECKPOINT` KG-4B, 18/18.

### The four instrumentation defects — `PROTECTED` regression lessons

The most important methodological result of KG-4B: **the first three corpus runs each produced a
confident, coherent-looking, completely wrong answer.** Each was caught by making the run adversarial
against itself, not by inspection, and each now has a permanent guard.

| # | Defect | Wrong answer it produced | Fix + guard |
|---|---|---|---|
| 1 | **429 vacuous comparisons** | 42 cases "all green". `/safescope-v2/classify` is throttled at 30/60s; 32 of 42 comparisons were **two identical HTTP 429s**, which satisfy an equality oracle perfectly. | Pace at 28/60s and **refuse a 429 outright** — a throttled response is not a comparison. The throttle was **not** weakened. Guard: every compared case must return a real analysis; ≥40% of cases must produce citations. |
| 2 | **Jurisdiction object/vocabulary mismatch** | 54 BLOCKING "jurisdiction disagreements", including `1910.212(a)(1)` under OSHA General Industry. Three vocabularies in use; and `regulatoryContext` is an **object**, so the legacy side recorded the literal string `"[object Object]"` on all 83 events. | `canonicalizeRegime()` + `jurisdictionsDisagree()` returns true only when both sides resolve to a known, *different* regime. Read `regulatoryContext.value`. Guard: 14 canonicalisation cases + explicit "same regime, different vocabulary is NOT a disagreement". |
| 3 | **Explanation text compared against regulatory text** | 31 BLOCKING content differences. Legacy text was captured **before hydration**, where `standardText` holds the *rule-family decision explanation*. Proof: `standard_text`, `plain_language_summary`, `payload.canonicalText` and `payload.summary` all digest to `82843496…` — the governed digest — while the recorded legacy digest matched no corpus column at all. | Hydrate every distinct citation once up front and compare the **hydrated corpus text** — what the customer would actually see. Result: `CONTENT_DIFFERENCE` → **0**; 54/54 dual-digest events agree. |
| 4 | **Review status misread as applicability** | 51 of 83 looked applicability-uncertain. The runner read `standardDecisions[].status`, which is `applicable_after_human_review` — a **review-state label**, not an applicability signal. | Read the authoritative axis `applicabilityDecisions[].status` first, with per-decision `applicabilityStatus` as fallback; `toApplicabilityState()` extended so one function owns the whole applicability axis. Result: 51 → **13**; `EXACT_MATCH` 3 → **41**. |

Two further self-inflicted false positives, both caught by guards: `correlationId` defaulted to the
literal `'anonymous-analysis'`, collapsing 43 analyses into one correlation and reporting 40 phantom
duplicates (**an idempotency key that is not unique per analysis is worse than none — it silently merges
observations**); and a browser fixture named `KG-4B browser …SHADOW` put the forbidden word on screen —
the check was right, the fixture was renamed.

### The SHADOW payload leak — found and fixed `PROTECTED` lesson

SHADOW correctly withheld governed *backing* and *text*, but `projectGovernedDisplay()` still stamped
`governedDeliveryState`, `governedFallbackReason`, `governedTextUnavailable` and a null-valued
`knowledgeReleaseId` onto **every** standard decision — so a SHADOW payload was distinguishable from a
LEGACY one by inspection. Fixed with `customerVisible`.

### Customer-visible invariance oracle

The oracle is **comparative and empirical**, not a hand-written ignore-list: one server, one database, one
active release, `GOVERNED_CUTOVER_MODE=SHADOW`, one allowlisted account; the legacy request is issued
**twice** to derive the volatile field set empirically; everything stable in LEGACY must be identical in
SHADOW, compared as flattened `path -> scalar` over the whole payload. `VERIFIED_AT_CHECKPOINT` KG-4B:
43/43 identical, 0 SHADOW payloads carrying governed keys; citation set **and order** identical.

---

## 11 — TEST DATABASE OWNERSHIP CONTRACT

> ### `STABLE_INVARIANT` — A mutating suite may READ a corpus and must WRITE only to a database it created itself.

This is the single most expensive lesson in the programme and applies to every future verification
slice.

1. **Mutating suites must own their database.** Create it, migrate it, seed it, use it, and (where the
   suite is designed to) drop it. `test:kg4a-governed-resolution`, `test:kg4a-provenance-pinning`,
   `test:kg4a-default-off`, `report:kg4a-performance`, `test:kg4b-shadow-adversarial`,
   `test:kg4b-shadow-determinism` and `report:kg4b-shadow-performance` each create and drop their own.

2. **Evidence-bearing and shared databases cannot be reused by mutating suites.** A KG evidence
   database may be a **read-only** `pg_dump` source and nothing else. Suites that need a corpus take
   `SOURCE_DB` and clone.

3. **`test:regulatory-release-lifecycle` is known to replace release rows** `KNOWN_CAVEAT`. It
   **replaces every release row** in whatever database it is pointed at. It currently does **not** own
   a disposable database. `OPEN_ITEM` — KG-4C should give it one. KG-4B's own regression ordering was
   caught by this.

4. **Previous accidental disposable-DB damage is why this rule exists.** A mutating suite pointed at a
   shared verification database destroyed evidence another suite depended on. The remedy is
   structural, not procedural.

   **It happened again during KG-4C, caused by the guard built to prevent it** — see §13.6. The
   enforced mechanism is now `backend/scripts/lib/test-database-ownership.ts`: an in-database
   ownership marker table, with these rules —
   * a **protected** name (`safescope`, `sentinel_dev`, `sentinel_safety`, `postgres`, `template*`)
     is refused before any connection;
   * a non-`test_*` name is refused;
   * a marker naming **another** suite is refused (`OWNED_BY_ANOTHER_SUITE`);
   * **an UNMARKED database is refused** (`UNCLAIMED_DATABASE`) — every pre-existing evidence corpus
     is unmarked, so this is the rule that actually protects them;
   * claiming an unmarked database requires `KG_TEST_DB_INITIALIZE_OWNERSHIP` set to the **exact**
     database name, or `initializeOwnership: true` from a suite that just created it in-process;
   * **a refused claim performs zero writes** — the marker table is probed read-only and created only
     after authorization.
   Wired into `test:regulatory-release-lifecycle`. Verified by `npm run test:kg4c-db-ownership`
   (31/31) `VERIFIED_AT_CHECKPOINT` KG-4C.

5. **Fail before mutation when ownership is not established.** A suite must prove its resolved target
   is a disposable `test_*` database it owns **before** issuing any write. `DATABASE_URL` takes
   precedence over discrete `DB_*` variables in this repository, so an ambient `backend/.env` value
   can silently redirect a command. The KG-4A/4B mutating suites deliberately do **not** import
   `dotenv/config`, name every connection explicitly, and announce an ambient `DATABASE_URL` as
   **ignored**. Unset it anyway when in doubt.

6. **Never touched, ever:** `safescope`, `sentinel_dev`, `sentinel_safety`.

---

## 12 — CURRENT VERIFICATION BASELINES

Every number below is `VERIFIED_AT_CHECKPOINT` — true when measured, at the named checkpoint, against
the named database. **None is a timeless property.** Re-run the command to claim it now.

### KG-3F foundation

| Gate | Score | Command |
|---|---|---|
| Retrieval determinism, 9 physical layouts | **170/170** (98/170 before the fix) | `test:kg3f-retrieval-determinism` |
| Semantic ranking adversarial (mirrored) | **54/54** | `test:kg3f-ranking-adversarial` |
| `56.14132` predicate | **16/16** | `test:kg3f-56-14132-predicate` |
| Citation granularity | **48/48** | `test:kg3e-citation-granularity` |
| Approval / provenance contract | **57/57** | `test:approval-contract` |
| Governed shadow invariance | **7/7**, sha256 `29469550cea4d2fd…` | `test:kg3f-shadow-invariance` |
| Customer-path disconnection | **9/9** — see §13 | `test:kg3f-customer-path-disconnection` |
| Standard Detail browser | **376/376**, real Chromium, 4 themes | KG-3F Phase 15 harness |
| Hazard-family readiness | 27 families, **0 blocked** | `report:kg3f-family-readiness` |

Manifest identity preserved: a clean seeded finalization reproduces
`bee47ebe1e82b74d9507380cff073838093881ea8a990b7d659190174fad6aa2` — byte-identical to KG-3A/3B/3C/3E.

### KG-4A — total 655

| Suite | Score |
|---|---|
| Cutover contract (pure) | **146/146** |
| Governed resolution / adversarial | **99/99** |
| Provenance + pinning + spoofing | **53/53** |
| Default-off proof | **51/51** (incl. a falsification check) |
| Real HTTP governed E2E, two accounts | **35/35** |
| `56.14132(b)(1)` clause review | **31/31** |
| Browser, real Chromium, 4 themes × 2 modes | **240/240** |
| Performance | 0.793 ms/analysis governed overhead; no N+1 |

Seed for the KG-4A corpus: 35 records, manifest
`14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`; the control without the KG-4A
record reproduces 34 / `bee47ebe…`.
Approval checksum for `30 CFR 56.14132(b)(1)`:
`388a349c2b0a6f6d5c0deba02d43f54717b54a2c1e6957e5c6f4c3eb5f616d5a`.

### KG-4B — total 1020

| Suite | Score |
|---|---|
| Shadow contract (pure) | **123/123** |
| Shadow corpus, real HTTP, 43 analyses | **145/145** |
| Adversarial (provenance, pinning, spoofing, failure injection) | **84/84** |
| Layout determinism, 7 layouts | **18/18** |
| Privacy review | **26/26** |
| Default-off on a live SHADOW server | **48/48** |
| Browser invariance, 4 themes × 2 accounts, incl. reload | **576/576** |

### KG-4C — total 549

| Suite | Score |
|---|---|
| Production shadow contract (pure) | **438/438** |
| Disabled deployment + fail-open + tenancy (pure) | **80/80** |
| Test-database ownership guard | **31/31** |

Locks 4 · stages 5 · hard invariants 7 · rate thresholds 4 · privacy canary patterns 12 ·
metrics 17 · alert rules 16 · event schema `kg4c.shadow-comparison.v2` (35 fields = 29 v1 + 6).
Clean seed still reproduces 35 records / manifest `14a34fea…`.

### KG-4D — total 459 + 128 browser

| Suite | Score |
|---|---|
| Orchestration contract (pure) | **151/151** |
| Default-off authority: reachability + inertness + inventory | **119/119** at KG-4D; **121/121** since KG-5B added the earned `OPERATOR CMD` inventory category (`KG5B-D8`). Re-measured 121/121 at KG-5C and again at the convergence phase |
| DB ownership **black box** (independent verifier) | **19/19** |
| Real-HTTP integration (provenance, authorization matrix) | **42/42** |
| Browser, real Chromium, 4 views × reload, 2 accounts | **128/128** |
| LEGACY invariance vs pre-integration baseline | **8/8 identical**, 0 governed-key leaks |
| SHADOW-eligible vs baseline / vs non-eligible | **8/8 · 8/8 identical** |

Real-path telemetry: 32 v2 events over 9 analyses (3.56/analysis), **0 duplicate event keys**,
0.688 ms mean per comparison, every event `customerOutputUnchanged: true` ·
`shadowProvenanceNull: true` · `outputInvarianceVerdict: INVARIANT`. Severity 19 INFORMATIONAL /
13 REVIEW / **0 BLOCKING**. Privacy: **0 of 14** canaries in real emitted events; 0 fields outside
the v2 allowlist.

### KG-4E — report/PDF invariance

| Suite / measurement | Result |
|---|---|
| `compare:kg4e-report-invariance` (LEGACY vs SHADOW) | **8/8 invariant**, 0 forbidden hits |
| `compare:kg4e-report-invariance` (legacy-C control, non-circular) | 8/8 invariant |
| `compare:kg4e-report-invariance` (mutation control — **must fail**) | 8/8 DIFFERENT, 176 forbidden hits |
| `test:kg4e-report-field-exclusion` | 9/9 · 33/33 byte-identical after 38-field poisoning |
| `test:kg4e-report-provenance` | 32/32 |
| PDFs generated through the real generator | 56 (7 labels × 8 cases) |
| Pages / lines / stable tokens compared | 42 · 628 of 636 · 2045 |
| Volatile line positions per report | **1** (page 1 line 9, the record reference) |
| Forbidden patterns asserted | 38 · **0 hits** |
| Page images compared / pixel-identical | 16 / **13** (the 3 differ on page 1 only) |
| Real v2 shadow events (healthy / resolver-failure) | 24 / 24 · 0 duplicate keys · 0 BLOCKING in the healthy run |
| Analyses with mixed internal governed states | **5 of 7** |
| `APPROVED_EXACT` comparisons yielding governed text in SHADOW | **0 of 12** |
| v2 runtime privacy guard over all 48 real events | 48/48 safe · 35 fields · 0 outside the allowlist |
| Mean comparison latency | 0.667 ms |

Extraction is poppler (`pdftotext -layout`, `pdfinfo`, `pdffonts`, `pdftoppm`). **No OCR.**

### KG-4B shadow comparison distribution (denominator = **83 citation comparisons**)

| Category | Count | Rate | Root cause |
|---|---|---|---|
| `EXACT_MATCH` | 41 | 49.4% | `NONE` |
| `GOVERNED_MISSING` | 15 | 18.07% | `EXPECTED_FALLBACK` |
| `GRANULARITY_DIFFERENCE` | 14 | 16.87% | `CITATION_GRANULARITY` |
| `APPLICABILITY_DIFFERENCE` | 13 | 15.66% | `APPLICABILITY_EVIDENCE` |

Severity: INFORMATIONAL 56 · REVIEW 27 · **BLOCKING 0**.
Zero observed: jurisdiction, content, citation, ordering, resolver failure, integrity failure,
provenance difference.
**Content digest agreement: 54/54** events carrying both digests agree — where governed content
exists, it is the same text the customer already sees.
Corpus: 31 gold-set cases (hash-verified `93184abc…`, read-only) + 12 KG-4B fixtures = 43 analyses,
54 findings, 74 candidate standards, 83 comparisons; 4 regimes, 10 observation shapes.

**Eleven categories were never exercised** by this corpus (`CONTENT_DIFFERENCE`,
`JURISDICTION_DIFFERENCE`, `CITATION_DIFFERENCE`, `INTEGRITY_FAILURE`, `ORDERING_DIFFERENCE`,
`CONTENT_EQUIVALENT`, `PROVENANCE_DIFFERENCE`, `GOVERNED_APPROVED_EXACT`, `GOVERNED_UNAPPROVED`,
`GOVERNED_CITATION_ONLY`, `RESOLVER_FAILURE`). They are defined and unit-reachable but unobserved in
real traffic — **the single strongest reason to run a production shadow**.

### Performance baselines

| Shape | Mean |
|---|---|
| LEGACY, 10 findings (context never created) | 0.0003 ms |
| GOVERNED, 10 findings | 0.878 ms (KG-4A measured 0.793 — consistent) |
| SHADOW, 10 findings / 6 distinct citations | **1.187 ms/analysis** (0.1187 ms/finding) |
| governed resolver, one citation | 0.118 ms |
| telemetry: build + privacy guard + serialise | **0.0193 ms/event** |

Query counts (intercepted DataSource logger, counted not estimated): 1 finding → 2 queries;
5 → 6; 10 findings over 6 distinct citations → 7 (one pin + six resolutions). Queries track **distinct
citations**, not findings. **No N+1.** Against a classify path dominated by seconds of AI inference
this is not a material cost; nothing was optimised further.

### HazLenz core

`npm run test:hazlenz-core` → **28 of 30 suites pass**; the two documented baseline failures only,
reproducing **byte-identically**. See §13.

---

## 13 — KNOWN BASELINE DIVERGENCES / CAVEATS

### 1. HazLenz core — two documented pre-existing failures `KNOWN_CAVEAT`

* `Golden Hardening Scenarios Test` — case *"7. LOTO energized maintenance (Not Guarding alone)"*
* `HazLenz Production Path Regression` — case *"FAIL tagged but not locked"*

Both **predate** the KG programme, reproduce byte-identically at every slice boundary, and are the
*only* two. They are the baseline against which "no new unexplained regression" is asserted. If a
future run shows a third failure, that is new and must be investigated — do not absorb it into this
note. Evidence: `kg-3f/STATUS.md`, `kg-4a/STATUS.md`, `kg-4b/STATUS.md`.

### 2. MSHA-TRAFFIC-01 `PROTECTED_DECISION` — classification `PROTECTED_BASELINE_EXPECTATION_ADJUDICATION_REQUIRED`

Gold-set score moved **31/31 → 30/31**. This is an **intentional regulatory-correctness divergence**,
not a regression and not a retrieval/scoring/determinism defect. **Decision: KEEP the corrected
behaviour.**

The gold-set case expects `['56.14132']` (the section) while its stored `rationale` attributes the
finding to `(a)` and hard-codes *"reverse warning required" = true*. Two independent errors were
encoded: the wrong paragraph, and an unestablished statutory trigger. Corrected behaviour emits the
truthful **section** `30 CFR 56.14132` as a candidate with `UNKNOWN` status and the obstructed-view
predicate named as the open question — which **matches the gold set's own `expectedCitations`**, where
the previous `(a)` emission did not.

The protected gold-set artifact is preserved **byte-for-byte**:
`verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts`,
sha256 `93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3`. Nothing in it was edited,
weakened or re-scored. Full record: `kg-3f/MSHA-TRAFFIC-01-adjudication.md`.

One test assertion was corrected in `backend/scripts/test-evidence-foundation.ts` — it required
`30 CFR 56.14132(a)` for a backup-alarm observation and a *supported violation* from an observation
silent on rear visibility. It was replaced with four strictly stronger assertions. The suite still
reports **35 assertions**, unchanged from the KG-3D/KG-3E baseline.

### 3. Entitlement boundary — 429 / hang `KNOWN_CAVEAT`

`npm run test:entitlement-boundary` fails at its first `POST /auth/register` with HTTP 429 (the
throttler is 5/60s per IP) and then hangs. This is a **pre-existing infrastructure characteristic**
documented since KG-3C. The suite contains **zero** references to any KG module.

> **Do not weaken the throttle to make the test run.** Relaxing a production control to make a
> verification convenient is exactly the move this programme refuses. The same rule caught KG-4B's
> vacuous 429 corpus run (§10 defect 1). Pace inside the limit, or give the suite its own IP/port
> isolation.

### 4. KG-3F Phase 16 — superseded architectural assumption `KNOWN_CAVEAT`

`test:kg3f-customer-path-disconnection` still reports **9/9** and is left **unmodified** (it is KG-3F
evidence). But its source scan **excludes everything under `standards/`** — which is exactly where
KG-4A's resolver and KG-4B's shadow comparator now live — so it can no longer see the seam it was
written to guard.

**Authoritative for the current architecture:** `test:kg4b-default-off` (48/48, against a server
genuinely running SHADOW) for the runtime half, and `test:kg4a-default-off` (51/51) for the static
half.

### 6. The KG-4C ownership-guard incident `KNOWN_CAVEAT` / `PROTECTED` lesson

The database ownership guard built in KG-4C **caused the exact damage it was built to prevent**: it
treated an absent ownership marker as permission to claim, and every pre-existing evidence database
is unmarked. Pointed at `test_kg4b_shadow_20260820` it claimed the database and
`test:regulatory-release-lifecycle` deleted every release row. Its own suite passed 26/26 because an
assertion stated the defective behaviour was correct — the same failure class KG-3F found in
`test-evidence-foundation.ts`.

Fully restored and proven: manifest `14a34fea…` byte-identical, 35/35 surviving approval decisions
re-bound by checksum with **no new decision appended**, `test:kg4b-shadow-adversarial` 84/84,
`test:kg4b-shadow-determinism` 18/18 at digest `0bce5a71…`.

Two rules follow, both `STABLE_INVARIANT`:
* **A guard must be exercised against the real hazard before it is trusted** — not against a
  reconstruction built by the same person in the same session from the same misunderstanding.
* **An assertion that describes what the code does is not a test.** Every assertion in a safety
  mechanism's suite must trace to the requirement, not to the implementation.

Residual: `test_kg4b_shadow_20260820` now carries an ownership marker naming `kg-4b-evidence-corpus`
that did not exist in KG-4B. Recorded rather than removed — it is what makes that corpus explicitly
protected. Full record: `kg-4c/INCIDENT-ownership-guard-caused-the-damage-it-prevents.md`.

### 7. ELEVEN unobserved mismatch categories at the KG-4B corpus checkpoint `KNOWN_CAVEAT` (`KG4C-DISC-01`)

> **The authoritative figure is ELEVEN.** Any future prompt, summary or plan that says "seven"
> is propagating a prose subset over a measurement. Do not carry it forward.


KG-4B's `STATUS.md` prose names **seven** never-observed categories. Its `CORPUS_AND_ANALYTICS.md`,
`analytics/shadow-analytics.json`, and the 83-event corpus all give **eleven** — the corpus exercised
exactly four of fifteen. **Eleven is the measured figure**; seven is a prose subset omitting
`GOVERNED_APPROVED_EXACT`, `GOVERNED_UNAPPROVED`, `GOVERNED_CITATION_ONLY` and `RESOLVER_FAILURE`.
KG-4C maps all eleven. The KG-4B artifacts are left exactly as written.

### 8. KG-4C modules are now ON the customer path — **RESOLVED by KG-4D**

KG-4C recorded that its six modules were deliberately unreferenced by production code, and that the
browser suites were therefore not re-run. **KG-4D closed this.** The modules are reachable from and
active on the real customer request path through one orchestration boundary, and the browser suite
was re-run (128/128, four views plus reload). Reachability is now asserted, not merely permitted:
`test:kg4d-default-off` walks the real import graph and fails if any of the six becomes unreachable.

`KG4D-DISC-01`: KG-4C's readiness label
(`READY_FOR_EXPLICIT_PRODUCTION_SHADOW_AUTHORIZATION`) outran its own integration state — its final
report recorded the modules as unreachable in the same breath. Verified-but-unwired safety machinery
protects nothing. KG-4D opened by adopting the stronger conclusion (*not yet authorized*) and the
label is earned only now. The KG-4C artifacts are left exactly as written.

### 10. SHADOW runs the customer pipeline four times `KNOWN_CAVEAT`

In SHADOW the classify pipeline executes four times: once pristine (the customer payload) and three
times on copies (two legacy probes for empirical volatility, one shadow run). Paid **only** by
explicitly allowlisted principals — a LEGACY request runs it exactly once and constructs nothing in
the cutover subsystem. Measured cost 0.688 ms mean per comparison against a classify path dominated
by seconds of AI inference. Copies are JSON copies because the analysis result carries a class
reference that `structuredClone` refuses; comparison runs are all copies so copy artifacts cancel
out of the comparison rather than being attributed to SHADOW.

### 11. Report/PDF invariance under SHADOW — **RESOLVED by KG-4E** (was CAVEAT-11)

KG-4D verified the persisted snapshot, reload and Standard Detail through real Chromium and recorded
that a generated-PDF comparison had not been run. KG-4E ran it: 56 real PDFs through
`CanonicalReportsService.generate()`, **8/8 customer-semantically identical**, 0 hits on 38 forbidden
patterns, 13/16 page images pixel-identical, and 33/33 reports byte-identical after poisoning with 38
governed/shadow/telemetry fields. See §16 and `kg-4e/STATUS.md`.

### 12. KG4E-DISC-01 — a volatility set of literal VALUES cannot generalise `PROTECTED` lesson

KG-4E's token-set oracle first derived volatility as the token *values* that differed between two
LEGACY probes — `{E45BD25A, 8D498838}` for the cover's record reference. The SHADOW run necessarily
carries a *third* value, which is in neither set, so all eight cases reported a difference for a field
the oracle had already recognised as volatile. The positional oracle, which excludes *positions*, was
right throughout and reported zero differences.

**Volatility must be derived as a position or a role, never as a value.** This generalises KG-4B's
lesson rather than repeating it: KG-4B established that volatility must be derived rather than
declared; KG-4E establishes *what kind of thing* the derived set has to be.

### 13. KG4E-DISC-02 — the shadow taxonomy and the risk model share the word "severity" `KNOWN_CAVEAT`

`riskSnapshot.operationalRisk.severity` is printed in every report. A field-poisoning suite that
stamps `severity: 'BLOCKING'` onto every object therefore fails on a collision of *vocabulary*, not
on a governance leak — and the obvious repair, widening the normalisation until it stops firing,
would also stop it noticing real changes. Poison the shadow-specific spellings; leave the risk model
its own word.

### 14. KG4E-DISC-03 — `GET /inspection-reports` returns every version's full frozen snapshot `KNOWN_CAVEAT`

`CanonicalReportsService.list()` uses `leftJoinAndSelect('report.versions')` and returns raw
`InspectionReportVersion` entities, so every caller receives every version's complete
`sourceSnapshot` — 3.4 MB for 41 versions in the KG-4E database. `GET /inspection-reports/:id` does
not; it maps through `metadata()`.

**Pre-existing and mode-independent.** LEGACY and SHADOW return the same shape,
`canonical-reports.service.ts` predates all KG-4x cutover work, and under SHADOW every
`knowledgeReleaseId` in the response is `null` (94 occurrences, one distinct value). It is therefore
**not** a shadow leak and **not** a Stage-1 blocker, and KG-4E changed no production code for it.
Under a future *governed delivery* mode it would carry real release ids and full governed state to
every list caller, which is why it is carried as an `OPEN_ITEM` rather than closed.

### 15. KG4E-DISC-04 — dropping the four approval-contract columns does not fail the resolver `KNOWN_CAVEAT`

`resolveGovernedCitation()` selects `payload`, `recordChecksum` and the effective review state; it
never reads `substantiveContentDigest`, `sourceIdentityDigest`, `approvalDigest` or
`approvalContractVersion`. Dropping those four columns left `resolverHealth` **OK** on all 24
comparisons. §7's "migration `1800000014000` absent → `STALE_SCHEMA`" is about the migration being
absent *in full*, and that remains true; a targeted column drop is not a substitute for it. KG-4E's
genuine resolver failure required making `regulatory_release_records` itself unreadable.

### 9. Other recorded caveats

* **`SOURCE_URL_REGISTRY_MISMATCH`** `OPEN_ITEM` — five OSHA records (`1926.300(b)(2)`, `1926.34(a)`,
  `1926.416(a)(1)`, `1926.52`, `1926.59`) point at `osha.gov` standardnumber pages while
  `osha-ecfr-1926` declares an eCFR baseUrl. Classified, **not** churned: osha.gov is current,
  agency-published primary text, and repointing would be presentation-only churn.
* **`test:kg3d-corpus-remediation`** needs KG-3D's historical releases; a **clean** seed fails its
  `1910.36` BASELINE assertion. Clone `test_kg3f_remediation_20260820` rather than seeding fresh.
* **`test:kg3e-citation-granularity`** needs `federal-core-2026-07-30.1` intact — give it a clean
  seeded database.
* **Port 4000** carries a pre-existing developer backend. KG suites use 4320/4330/4331/4340/4341 and
  frontends 3320/3331/3340. Never start a verification server on 4000.
* **KG-3D §13 arithmetic slip** — it states "18 of 27 records still carry no recorded source URL"; the
  measurement is 17 unsourced / 10 sourced. Corrected in KG-3E §1; the KG-3D artifact is left as
  written.

---

## 14 — IMPORTANT MIGRATIONS

`backend/src/database/migrations/` — **46 migrations** at last count (`MUST_REVERIFY`). The
KG-relevant ordering:

| ID | Name | Purpose | Depends on | Fail-fast expectation |
|---|---|---|---|---|
| `1800000004000` | `RegulatoryReleaseGovernance` | Base governance tables | — | — |
| `1800000005200` | `RegulatorySourceChecksums` | Source document checksums on corpus rows | 4000 | Axis B of the approval contract reads these |
| `1800000005800` | `RegulatorySectionCorpus` | Section-level corpus support | 4000 | — |
| `1800000010000` | `KnowledgeReleaseProvenance` | **KG-1** — `knowledgeReleaseId` on `hazlenz_analyses` and `inspection_findings` | — | Provenance columns; nullable |
| `1800000011000` | `RegulatoryReleaseLifecycle` | **KG-2** — release status/lifecycle + active pointer | 10000 | — |
| `1800000012000` | `RegulatoryReleaseRecords` | **KG-3A** — immutable per-record snapshot rows (replaces the mutable `standards_master.release_id` scalar as the membership mechanism) | 11000 | — |
| `1800000013000` | `RegulatoryReleaseRecordReviews` | **KG-3B** — append-only reviewer decision log | 12000 | — |
| `1800000014000` | **`ApprovalProvenanceContract`** | **KG-3F** — 5 nullable columns on `regulatory_release_records` + 5 on `regulatory_release_record_reviews` + 2 indexes. Additive and reversible. | 13000 | **Must be applied before `seed:safescope-standards` on any database.** The finalizer writes approval identity unconditionally; failing loudly is intentional. Absent at runtime → backing `RESOLVER_UNAVAILABLE`, health `STALE_SCHEMA`, telemetry `INTEGRITY_FAILURE`, customer stays legacy. |

**Applied to the original SafeScope development database?** **NO** for every KG migration
(`1800000010000`–`1800000014000`). The `safescope` dev DB was recorded at **35 migrations** with none
of the KG tables present, and every slice re-verified this read-only. `MUST_REVERIFY` — and **do not
apply migrations to protected databases** to find out; probe read-only.

No KG-4A or KG-4B migration exists. KG-4A's mixed provenance needed none (KG-1's two columns sufficed);
KG-4B deliberately created **no** production schema for shadow events.

---

## 15 — IMPORTANT PACKAGE / TEST COMMANDS

Read from `backend/package.json` (178 scripts at last count — `MUST_REVERIFY`; **read the file, do not
invent a script name**). Run from `/Users/mckinley/Desktop/Safety_InSite/backend`.
**`MUT`** = mutating → **OWNED DISPOSABLE DB REQUIRED**.

### Pure — no database, safe anywhere

| Command | Expected | Notes |
|---|---|---|
| `npm run test:kg4a-cutover-contract` | 146/146 | `-- --emit <file>` regenerates `fallback-matrix.json` |
| `npm run test:kg4b-shadow-contract` | 123/123 | `-- --emit <file>` regenerates `shadow-taxonomy.json` |
| `npm run test:kg3f-56-14132-predicate` | 16/16 | |
| `npm run build` | exit 0 | `tsc` |

### Determinism, ranking, granularity

| Command | Expected | DB |
|---|---|---|
| `npm run test:kg3f-retrieval-determinism` | 170/170 | `SOURCE_DB=<corpus>`; **MUT** — clones 9 layouts |
| `npm run test:kg3f-ranking-adversarial` | 54/54 | `DATABASE_URL=<corpus>` read |
| `npm run test:kg3e-citation-granularity <releaseId>` | 48/48 | needs `federal-core-2026-07-30.1` intact |
| `npm run test:kg3f-shadow-invariance` | 7/7, sha256 `29469550cea4d2fd…` | |
| `npm run probe:kg3f-retrieval` | — | single-DB retrieval probe |

### Approval / provenance / governance

| Command | Expected | DB |
|---|---|---|
| `npm run test:approval-contract` | 57/57 | **MUT** |
| `npm run test:reviewer-approval` | 62/62 | **MUT** |
| `npm run test:release-integrity-and-approval` | 44/44 | **MUT** |
| `npm run test:governed-corpus-matrix` | 60/60 | **MUT** |
| `npm run test:regulatory-release-lifecycle` | pass | **MUT — REPLACES EVERY RELEASE ROW. Give it its own database.** |
| `npm run test:knowledge-release-provenance` | 27/27 | needs a running server (`API_BASE_URL`) |
| `npm run review:release-record approve --release … --citation … --expected-checksum … --reviewer …` | — | **MUT** — the reviewer CLI; a wrong checksum is refused |

### KG-4A

| Command | Expected | DB |
|---|---|---|
| `npm run test:kg4a-cutover-contract` | 146/146 | none |
| `npm run test:kg4a-governed-resolution` | 99/99 | **MUT** — owns `test_kg4a_resolution_run`; reads `SOURCE_DB` |
| `npm run test:kg4a-provenance-pinning` | 53/53 | **MUT** — owns `test_kg4a_gate_run` |
| `npm run test:kg4a-default-off` | 51/51 | **MUT** — owns `test_kg4a_defaultoff_run` |
| `npm run test:kg4a-governed-e2e` | 35/35 | real HTTP, two accounts, `GOVERNED_WITH_FALLBACK` server |
| `npm run verify:kg4a-record-source <releaseId>` | 31/31 | clause review |
| `npm run report:kg4a-performance` | — | **MUT** — owns `test_kg4a_perf_run` |

### KG-4B

| Command | Expected | DB |
|---|---|---|
| `npm run test:kg4b-shadow-contract` | 123/123 | none |
| `npm run run:kg4b-shadow-corpus` | 145/145 | real HTTP against a **SHADOW** server; ~5 min (paced at 28/60s) |
| `npm run report:kg4b-shadow-analytics` | — | reads `CORPUS_DIR` |
| `npm run test:kg4b-shadow-adversarial` | 84/84 | **MUT** — owns `test_kg4b_adversarial_run` |
| `npm run test:kg4b-shadow-determinism` | 18/18 | **MUT** — owns 7 `test_kg4b_layout_*` databases |
| `npm run test:kg4b-privacy-review` | 26/26 | reads `CORPUS_DIR` |
| `npm run test:kg4b-default-off` | 48/48 | requires a live SHADOW server |
| `npm run report:kg4b-shadow-performance` | — | **MUT** — owns `test_kg4b_perf_run` |

### KG-4C

| Command | Expected | DB |
|---|---|---|
| `npm run test:kg4c-production-shadow-contract` | 438/438 | none |
| `npm run test:kg4c-disabled-deployment` | 80/80 | none |
| `npm run test:kg4c-db-ownership` | 31/31 | **MUT** — owns 3 `test_kg4c_own_*` databases |

### KG-4D

| Command | Expected | DB |
|---|---|---|
| `npm run test:kg4d-orchestration` | 151/151 | none |
| `npm run test:kg4d-default-off` | 121/121 (was 119/119 at KG-4D; `OPERATOR CMD` added by KG-5B) | none |
| `npm run test:kg4d-db-ownership-blackbox` | 19/19 | **MUT** — owns 3 `test_kg4d_bb_*` databases |
| `npm run test:kg4d-integration-e2e` | 42/42 | real HTTP + real rows; needs a SHADOW server |
| `npm run run:kg4d-customer-capture` | — | capture harness (paces at 20/60s, refuses a 429) |
| `npm run compare:kg4d-customer-capture` | — | empirical-volatility comparison |

**Since KG-4D every mutating suite requires `KG_TEST_DB_INITIALIZE_OWNERSHIP=<exact database name>`
on a freshly created database.** Guarded: `test:regulatory-release-lifecycle`,
`test:governed-corpus-matrix`, `test:kg3d-corpus-remediation`, `test:release-integrity-and-approval`,
`test:reviewer-approval`, `test:standards-backing-contract`.

### KG-4E

| Command | Expected | DB |
|---|---|---|
| `npm run run:kg4e-report-capture` | 8 reports + manifest | real HTTP + real rows; needs a running server and a `cloudReports` entitlement |
| `npm run compare:kg4e-report-invariance` | 8/8 invariant, 0 forbidden hits | none (reads PDFs) |
| `npm run build:kg4e-mutation-control` | 8 deliberately-leaking reports | read-only |
| `npm run test:kg4e-report-field-exclusion` | 9/9 | **read-only**, no ownership claim |
| `npm run test:kg4e-report-provenance` | 32/32 | **read-only**, no ownership claim |
| `npm run test:kg4e-telemetry-privacy-v2 <events.jsonl>` | 48/48 safe, 0 outside the v2 allowlist | none |

Requires poppler on the PATH. KG-4E owns `test_kg4e_report_20260821` (marker
`kg-4e-report-invariance`) and `test_kg4e_stale_20260821` (marker `kg-4e-resolver-failure`); both
were cloned with `createdb -T` and **re-marked**, so no prior slice's evidence database was ever a
write target.

### Corpus / reporting

`npm run report:kg3f-rule-to-corpus <releaseId>` (160-citation map) ·
`npm run report:kg3f-family-readiness <releaseId>` (27 families) ·
`npm run report:kg3e-work-queue` (live emission measurement) ·
`npm run report:corpus-migration-inventory` · `npm run test:kg3d-corpus-remediation` (**MUT**, needs a
clone of KG-3D's historical releases).

### Seeding — **MUT**, never against a protected DB

`npm run migration:run` · `npm run seed:safescope-standards` (seed + sync + finalize) ·
`npm run seed:regulatory-release` (finalize only).

**Both seed commands now REFUSE, before their first write, on any corpus holding regulations the
governed source set does not name** (`legacy-corpus-guard.ts`, KG-5B). They are for clean disposable
databases. They are **never** the way to build a production release.

### Governed release operations — **MUT**, the only production-safe path (KG-5B)

`npm run release -- status [--release-id <id>]` · `npm run release -- sources` ·
`npm run release -- prepare --release-id <id> [--dry-run]` ·
`npm run release -- activate --release-id <id> --expected-manifest <sha256> --expected-current <id|none> --actor <name> [--reason <t>] [--dry-run]` ·
`npm run release -- rollback --release-id <id> --expected-current <id> --actor <name> [--reason <t>] [--dry-run]`

`prepare` writes **nothing** to `standards_master` and creates only a `provisional` release; it never
approves and never activates. `--dry-run` performs zero writes and emits no lifecycle event.
Approval stays in `npm run review:release-record -- approve`, one record at a time, against an exact
checksum. Full runbook: `kg-5b/PRODUCTION_RELEASE_RUNBOOK.md`.

### KG-5B verification

`npm run test:kg5b-release-construction` (102/102) · `npm run test:kg5b-operator-cli` (65/65) ·
`npm run test:kg5b-approval-continuity` (29/29) · `npm run rehearse:kg5b-operator-sequence`
(58/58 assertions, 46 reviewed commands).

### Regression and typecheck

`npm run test:hazlenz-core` (28/30, the two documented failures) · `npm run test:evidence-foundation`
(35 assertions) · `npm run test:hazlenz-evidence-boundary` · `npm run test:guided-finding-response` ·
`npm run test:standards-backing-contract` (35/35) · `npm run test:safescope-standards` (15/15) ·
`npm run test:standards-corpus-integrity` · `npm run validate:hazlenz-knowledge-index` ·
`npm run build` · `(cd ../frontend-next && npx tsc --noEmit)`.

---

## 16 — CUSTOMER PATHS THAT MUST REMAIN TRUTHFUL

Five surfaces must agree, and each is verified independently: **API response → persistence → reload →
Standard Detail → report**. As of KG-4E **all five are closed through the running product**; the report
was the last one and had never been exercised.

### What is persisted vs reconstructed

| Item | Persisted? | Where |
|---|---|---|
| `resultSnapshot` (incl. `standardDecisions[].backingStatus`) | **yes** | `hazlenz_analyses.resultSnapshot` jsonb |
| `knowledgeReleaseId` (analysis) | **yes** | `hazlenz_analyses.knowledgeReleaseId` varchar(120), nullable |
| `knowledgeReleaseId` (finding) | **yes, inherited verbatim or narrowed** | `inspection_findings.knowledgeReleaseId` |
| guided-finding response | **no — rebuilt** | `buildGuidedFindingResponse()` from the persisted snapshot |
| `backingNotice` / `confidenceLimitReason` / `sourceStatus` | **no — derived** | from persisted `backingStatus` |
| report knowledge provenance | **no — derived** | `knowledgeProvenance()` from persisted finding rows |
| the report PDF | **yes** | `inspection_report_versions` + object storage; regenerating an unchanged inspection replays the existing version rather than re-rendering |

> **`backingStatus` is the persisted atom** `STABLE_INVARIANT`. Anything a future contract needs to
> survive a reload must either be persisted alongside it or be derivable from it.

### Semantics that must stay truthful

| Concept | Meaning |
|---|---|
| **Verified standard text** | Shown **only** for `APPROVED_EXACT` under a governed mode. Never for section-only, never in SHADOW, never in LEGACY. |
| **Confidence** | An *applicability* statement from HazLenz evidence reasoning. Governance never moves it. Browser-confirmed: the same citation shows `Confidence: High` in both the governed and the legacy account, in all four themes. |
| **citation-only** | The citation is shown with no text and an explicit "text unavailable" disclosure. Every citation-only row discloses. |
| **fallback** | Today's HazLenz-authored text, already labelled "HazLenz standard summary" with its source-review caveat. The **reason code** distinguishes the states and never reaches the customer. |
| **`knowledgeReleaseId`** | Non-NULL only where governed content materially influenced *this* customer-visible output. Server-derived, never from client input. |
| **governed delivery state** | Internal. `governedDeliveryState` / `governedFallbackReason` / `governedTextUnavailable` are operator concepts. |
| **`customerVisible`** | The switch that makes governed display state reach a payload at all. **False in SHADOW** → `projectGovernedDisplay()` contributes `{}`. |

### The report and its PDF `STABLE_INVARIANT` (KG-4E)

The generated report is the only customer surface produced entirely on the server, and it is the one
where a governance leak would be hardest to notice. Two facts govern it, and they point in opposite
directions on purpose:

* **The frozen report snapshot DOES carry governed state.** `snapshotInspection()` spreads the whole
  finding row and copies each analysis verbatim, so `knowledgeReleaseId` and the entire
  `resultSnapshot` are inside `inspection_report_versions.sourceSnapshot`, and `generate()` adds a
  `knowledgeProvenance` block. Present in 41/41 frozen snapshots. This is what makes the second fact
  meaningful: the field is **present and NULL**, not missing.
* **The PDF renderer cannot print it.** `canonical-report-pdf-renderer.ts` projects a *closed
  allowlist* of snapshot fields and never spreads, serialises or enumerates the snapshot. The
  exclusion is structural, so a governed field added in a future slice cannot reach a page by
  default either. `VERIFIED_AT_CHECKPOINT` KG-4E: 33/33 real frozen snapshots render **byte-identical**
  after being poisoned with 38 governed/shadow/telemetry fields stamped onto every object at every
  depth — with three live canaries proving the byte comparison is not inert.

**Byte equality between two reports is inappropriate and unnecessary** `PROTECTED_DECISION`. Two
inspections are two rows: the inspection uuid is printed as the cover's record reference, and PDFKit
stamps a `/CreationDate` and a random `/ID`. Volatility is therefore **derived**, as KG-4B derived
it for the classify payload — two LEGACY reports from two identically-parameterised inspections
establish what differs between two runs of identical code. The derived set is exactly **one line
position per report** (page 1, line 9) plus those three metadata fields; nothing else moves.
Byte equality *is* asserted where it is meaningful: one snapshot rendered twice, and again poisoned.

`VERIFIED_AT_CHECKPOINT` KG-4E, LEGACY vs SHADOW: **8/8 invariant** over three oracles (structural,
positional, token-multiset), 42 pages, 628 lines and 2045 stable distinct tokens compared, **0 hits
on 38 forbidden patterns**, and 13/16 rendered page images pixel-identical — the three that differ
are page 1's record reference. A third LEGACY run that contributed nothing to the volatility
derivation compares 8/8 invariant, and a deliberately-leaking control makes the oracle fail 8/8 with
176 forbidden-term hits.

**Mixed internal governed states cannot flip the customer report.** 5 of 7 analyses saw genuinely
mixed states (`APPROVED_EXACT` beside `APPROVED_SECTION_ONLY` and `NOT_IN_RELEASE`); every one
recorded NULL provenance and still delivered legacy text. The shadow saw `APPROVED_EXACT` **12
times** and not one produced `GOVERNED_VERIFIED_TEXT` — the absence of governed text in a report is a
refusal, not an empty corpus.

**A SHADOW failure cannot reach the report.** Kill switch engaged (0 events emitted) and a real
resolver failure (24/24 `INTEGRITY_FAILURE` / `BLOCKING` / `RESOLVER_UNAVAILABLE` / `STALE_SCHEMA`)
each still produce 8/8 invariant reports with 0 forbidden terms.

### Forbidden on screen `STABLE_INVARIANT`

The browser pass asserts **32 forbidden internal terms** are absent before *and* after reload,
including the bare word `SHADOW`, `mismatch`, `correlationId`, `eventKey`, `BLOCKING`. A well-meaning
"shadow mode active" badge would fail this pass rather than ship.

KG-4E asserts **38 patterns** over every extracted line of every generated PDF page, adding every
mismatch-category, backing-state, delivery-state and governed-mode name, the `GOVERNED_CUTOVER_` env
prefix, `STAGE_n_*`, `circuit breaker`, `kill switch`, `privacy canary`, `telemetry`, `allowlist` and
`cutover`. `SHADOW` is matched as a **bare word**, not a substring: a test that cannot tell `shadow`
from `overshadowed` gets disabled the first time it fires on ordinary prose.

---

## 17 — CURRENT OPEN WORK

### Current checkpoint

> ### `KG_5C_COMPLETE — CUSTOMER_PATH_EQUIVALENCE_ESTABLISHED — READY_FOR_CONTROLLED_PRODUCTION_SHADOW`

All five customer-facing surfaces are closed through the running product (API response, persistence,
reload, Standard Detail, generated report and PDF — KG-4E), the governed release is constructible
without touching the legacy corpus (KG-5B), and customer delivery fidelity is proven 27/27 through
production code (KG-5C).

This does **not** enable production SHADOW. `GOVERNED_CUTOVER_MODE` remains unset in every
production environment and `GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK` has never been set anywhere.
**`READY` is a statement about verified architecture, not about state** — production SHADOW is still
preceded by the unexecuted operations 1–11 in §27.7. See §0.

**Prior checkpoint labels, for orientation only** — each was true when written and is superseded:
`KG_4E_COMPLETE — TECHNICAL_GATES_COMPLETE_FOR_STAGE_1_PRODUCTION_SHADOW` →
`KG_5A_COMPLETE — PRODUCTION_RELEASE_PACKAGE_NOT_READY` (both KG-5A blockers closed by KG-5B) →
`KG_5B_COMPLETE` → the label above.

> **Open work is now registered in ONE place: §26.** The backlog table at the end of this section is
> retained for provenance. Where it and §26 disagree about whether something is open or what class it
> is, **§26 wins** — that deduplication is the whole point of the register.

### The integration seam `STABLE_INVARIANT`

`orchestrateShadowRequest()` — `backend/src/standards/cutover/shadow-request-orchestration.ts` —
called from exactly ONE place, `safescope-v2.controller.ts` `classify()`, after the AI analysis and
before serialization. Two narrow persistence hooks in `inspection.service.ts` complete it.

* **LEGACY** runs the pipeline once with a null context and returns it; no cutover code executes.
* **SHADOW** runs it four times — pristine (customer), two legacy probes (volatility), one shadow —
  and returns the **pristine** run. Always.
* **Governed delivery modes** run once with a context and their output is authoritative.

KG-4E added nothing to this seam, and nothing to any other production file.

### What remains before a production shadow

Operational, not architectural. A human with the authority to decide must:

1. confirm the platform log pipeline collects and **retains** `kg4c.shadow-comparison.v2` events;
2. name the single internal Stage-1 account — never an ordinary customer;
3. set the four locks in one deliberate change, per `kg-4c/PRODUCTION_SHADOW_RUNBOOK.md`.

KG-4E adds **no fourth prerequisite**.

### Stage-1 operational preflight — measured 2026-08-21 `MUST_REVERIFY`

An operational preflight measured the three prerequisites above against the live platform,
read-only. Nothing in production was modified. Verdict:
**`STAGE1_PRODUCTION_SHADOW_PREFLIGHT_BLOCKED`**. Machine detail:
`docs/INSITE_CURRENT_STATE.json` → `productionEnvironment`, `telemetryPipeline`,
`stage1PreflightVerdict`.

**Prerequisite 1 — telemetry. Satisfied for Stage 1, with one caveat.** The production backend is a
Render web service (free instance, single instance, `oregon`, auto-deploying from `main` on commit).
Its stdout is collected by Render's built-in log pipeline: `console.log` output from `main.ts`
appears verbatim, ANSI escapes and multibyte characters intact, so the `StdoutJsonlSink` line
survives as written. Each line is stored as one opaque `message` string — **Render does not index
JSON fields**, so events are *searchable* (`render logs --text`, verified) but not *aggregatable* in
the platform; mismatch/severity/root-cause distributions must be exported and aggregated offline.
Retention is **≥ 14 days, measured** (a 2026-08-07 record was retrievable on 2026-08-21), against a
documented tier ladder of 7 / 14 / 30 days and a hard 30-day query floor in the API; the workspace
tier is not exposed by the CLI. That clears Stage 1 comfortably and does **not** meet the KG-4C
`RETENTION_CONTRACT` 30-day target — a Log Stream to an external provider is the fix, and it is owed
before a long-running stage, not before Stage 1. The operator has authenticated log access.
Caveat: the longest line ever seen in this pipeline is **319 bytes** over 6,560 records, while a real
v2 event is **1,644 bytes mean / 1,710 max**; Render documents no line limit, so intact delivery of a
full-size event is **unverified**. It is a telemetry-usability risk only — SHADOW returns the pristine
legacy payload — and it is settled by parsing the first real event.

**Prerequisite 2 — the Stage-1 account. Satisfied.** Production carries 15 live accounts across 8
organizations, including genuine customers, so "never an ordinary customer" is a live constraint. The
single account is the operator's own (`users.id` recorded in the current-state JSON, `MUST_REVERIFY`):
role `Auditor`, `planCode=company` which normalizes to the pro tier, subscription active, so it
carries `cloudReports`, `hazlenzFullReview` and `standardsReasoning` and can produce representative
inspection/HazLenz traffic and a report. The allowlist identifier is the **`users.id` UUID**, matched
by exact string membership against `principal.userId` derived from the JWT. `GOVERNED_CUTOVER_ORG_ALLOWLIST`
must stay **unset**: it would enable the whole organization, and `countNamedPrincipals()` sums both
lists against the `STAGE_1_SINGLE_ACCOUNT` ceiling of 1.

**Prerequisite 3 — the four locks. Verified in code, and shut in production.** Exact names and
sentinels reproduce from `cutover-mode.ts` and `production-shadow-authorization.ts`. **Zero**
`GOVERNED_CUTOVER_*` variables are set in the production environment (34 variables, none of them
cutover), `NODE_ENV=production`, so the server resolves `LEGACY` / `DEFAULT_NO_CONFIGURATION`.

### Two prerequisites the earlier list did not name `MUST_REVERIFY`

The preflight found that prerequisites 1–3 are not sufficient, because production has never received
this work at all.

4. **The subsystem is untracked and undeployed.** `backend/src/standards/cutover/`,
   `backend/src/standards/releases/`, `backend/src/standards/display/`, `citation-structure.ts`,
   `knowledge-release-provenance.ts` and all five KG migrations are **untracked in git**. The live
   production commit is `97941ca2` — which *is* `main` and `origin/main` — and it contains no
   `standards/cutover/` directory. Six repo migrations are unapplied in the production Neon database
   (`1800000009000` plus `1800000010000`–`1800000014000`); `migrationsRun` is `false` and the start
   command does not migrate. So "Step A — publish code with SHADOW disabled" is a **first-ever
   deployment of the entire governed subsystem**, carrying four unshipped commits and a 114-entry
   working tree that also holds unrelated frontend theme work. KG-4C's "deploy with SHADOW off is a
   proven customer no-op" is a claim about the *cutover variables*; it was never a claim about this
   deployment.

5. **There is no governed release in production to shadow against.** `regulatory_releases` has
   **zero rows**; `regulatory_release_records` and `regulatory_release_record_reviews` do not exist.
   `pinGovernedRelease()` would return `NO_ACTIVE_RELEASE`, so **every** comparison would classify
   `RESOLVER_FAILURE` / `REVIEW` / `resolverHealth: NO_ACTIVE_RELEASE` — confirmed by
   `test:kg4c-disabled-deployment`'s own emitted events. The run would measure nothing about the
   governed/legacy gap and would breach the 2 % `RESOLVER_FAILURE_RATE` stop threshold the moment 200
   comparisons accrued. And the release that would have to be created is not the verified one:
   production's `standards_master` holds **2,390** live rows against the 35-record seed behind
   manifest `14a34fea…`, and production holds **zero** reviewer approvals. Which release is finalized
   and activated in production, and on what clause-by-clause reviewer evidence, is an unanswered
   adjudication — and §8.3 forbids answering it from usage.

`OPEN_ITEM` — a Stage-1 shadow is worth running only after 4 and 5 are closed. Neither is a code
task in the cutover subsystem; both are release-management decisions.

### 17.4 — Production SHADOW preflight, pass two (KG-5D, 2026-08-21) `MUST_REVERIFY`

A second read-only preflight. **Nothing in production was modified**; every SQL session ran inside
`BEGIN READ ONLY` with `transaction_read_only = on` asserted *inside* the session and printed as
evidence, so read-only was enforced by PostgreSQL rather than by intention. Render access was
GET-only. Verdict:

> ### `PRODUCTION_SHADOW_PREFLIGHT_BLOCKED — NO_GOVERNED_RELEASE_AND_SUBSYSTEM_NOT_DEPLOYED_IN_PRODUCTION`

Full evidence: `kg-5d/PRODUCTION_SHADOW_PREFLIGHT_PASS2.md`. Machine detail:
`docs/INSITE_CURRENT_STATE.json` → `stage1ShadowPreflightPassTwo`.

**All five blockers reconfirmed by direct measurement**, none superseded, none downgraded: the live
commit is still `97941ca2` with no `standards/cutover/`; the subsystem is still untracked at HEAD (46
migrations on disk, 41 tracked, 40 in the live commit); production still has **40** migrations with
`RefreshTokens1800000008000` latest and all six target migrations absent; `regulatory_releases` still
has **zero rows**; and **zero** of production's 34 environment variables is a `GOVERNED_CUTOVER_*`.

**Three production facts that were not previously recorded, and cost time to re-derive:**

* **`regulatory_releases` exists, in its pre-lifecycle shape.** It survives from migration
  `1800000004000`, and carries **no active-pointer column** (`isActive` / `activatedAt` /
  `activatedBy` all absent). Its presence must **not** be read as partial KG-2 readiness — the
  pointer `pinGovernedRelease()` depends on does not exist in production.
* **The review substrate does not exist.** `regulatory_release_records` and
  `regulatory_release_record_reviews` are both absent, so the honest statement is not "zero
  approvals" but that **no** approval, re-attestation, revocation, approval digest or
  `NEW_REVIEW_REQUIRED` state *can* be represented in production today.
* **`DO_NOT_REDISCOVER` — production carries two identity tables.** **`"user"` (singular) is the live
  auth table**: 26 rows, 15 live, 11 soft-deleted, across 8 `organization` rows, carrying `role`,
  `planCode` and `subscriptionStatus`. **`users` (plural) is a vestigial 1-row table** with a
  different column set and no `deletedAt`. A population count taken against `users` reports 1 and is
  **wrong**. The Stage-1 account UUID lives in `"user"`.

**Traffic, measured.** One `inspection`, one `observation`, one `hazlenz_analysis`, one
`inspection_finding`, one `inspection_report_version` — ever. First and last analysis share one
timestamp. **Lifetime production traffic is one analysis.** Natural traffic is not low; it is nil.

**Stage-1 account reverified.** `role=Auditor`, `planCode=company`, subscription active, not
soft-deleted, and the **only live user in its organization**. `GOVERNED_CUTOVER_ORG_ALLOWLIST` must
still stay unset regardless — `countNamedPrincipals()` sums both lists against the
`STAGE_1_SINGLE_ACCOUNT` ceiling of 1.

#### Telemetry integrity — the mechanism, established

The **application half is proven**, and it is proven structurally rather than by sampling:

* `JSON.stringify()` emits no literal newline; **0 of 80** real captured v2 events (KG-4D 32, KG-4E
  24 + 24) contains a raw newline or carriage return.
* `MAX_FIELD_LENGTH = 200` is enforced per string field **before** serialization and **throws,
  dropping the event**, rather than truncating. **An oversized event is an absent event, never a
  corrupt one.**
* Across all 80 events the longest single field is **64 bytes** (a sha256 digest). Every field is a
  citation, digest, UUID, enum or number — **no field type can grow.**
* Analytic worst case ≈ **6,585 bytes** with all 28 string fields simultaneously at the cap, a state
  no field type can reach. Measured: 1,494–1,710 B.

**The 319-byte observation is not evidence of a limit, and was re-measured rather than inherited.**
The full retained window — **2,900 records**, `2026-08-18T00:27:34Z` → `2026-08-21T18:22:47Z` — gives
p50 163 B, p99 252 B, **max 317 B**; build logs in the deploy window max **105 B**. That ceiling is a
property of *what this application currently logs*, not of what the pipeline can carry. It contains
neither a counter-example nor a confirming example, so it settles nothing in either direction —
**and inferring truncation from it would be the same error as inferring a limit.**

**Newly recorded:** Render documents **no** line-length limit, but *does* document an ingestion cap of
**6,000 application log lines per minute per instance, with excess dropped**. Not a size limit and
far above any Stage-1 rate, but it belongs to the retention/telemetry contract.

> **Conclusion, stated as not-proven where it is not proven:** the residual uncertainty is **exactly
> one link** — whether Render carries a single ~1,700-byte stdout line into one `message` field
> intact. Source inspection, existing logs, existing evidence and local reproduction cannot reach it,
> because it lies beyond a boundary this repository does not own.

#### Why no probe was required `PROTECTED_DECISION`

A single controlled production SHADOW event is **not necessary**, and more decisively it is
**currently impossible**:

1. **It cannot be constructed.** Emitting a production SHADOW event requires the cutover code to
   exist in production. It does not. **No environment-variable combination produces a shadow event
   from `97941ca2`.** The probe is not gated on authorization; it is gated on operations 1–5.
2. **The question is not SHADOW-shaped.** "Can Render carry a 1.7 KB stdout line" is a property of
   the log pipeline, wholly independent of governed knowledge.
3. **The risk is telemetry-usability, not customer safety.** SHADOW returns the pristine legacy
   payload structurally (`D-50`); a lost event degrades evidence and cannot degrade a customer.
4. **It is answerable for free inside an operation that must happen anyway** — by parsing the *first
   real event* of Stage-1.

> **The correct engineering response to an unverifiable transport assumption is not a probe; it is an
> abort gate.** Stage-1 carries **G1**: if event #1 does not retrieve as one complete parseable JSON
> object with all 35 fields, the run **aborts**. That converts an unverified assumption into a
> verified precondition at the cost of one observation, and it fails closed.

### 17.5 — Operation 1: governed release package committed locally (2026-08-21) `MUST_REVERIFY`

> ### `KG_RELEASE_PACKAGE_COMMITTED_LOCALLY — PUSH_NOT_AUTHORIZED — PRODUCTION_UNCHANGED`

A **packaging operation only**. No implementation was changed, no defect was fixed, no instrumentation
was added, production was not contacted, and nothing was pushed, merged, deployed, migrated,
activated or rolled back.

**Starting HEAD `5f050858…` (verified exactly) → ending HEAD is commit 6 below.** Upstream unchanged at
`5f050858`, so the branch is 0 behind / 6 ahead, entirely locally.

| # | SHA | Layer | Files |
|---|---|---|---|
| 1 | `21a8585d` | Schema, release lifecycle, approval/provenance contract | 20 |
| 2 | `b357599d` | Governed source set, citation identity, backing contract | 18 |
| 3 | `25f426f6` | Cutover core, fallback table, shadow comparison | 8 |
| 4 | `17314dc3` | Shadow safety rails + the single customer-path integration | 12 |
| 5 | `38115da4` | Frontend governed display contract | 3 |
| 6 | *this commit* | Operator commands, verification suites, evidence, docs | 538 |

**599 files committed; 31 deliberately excluded and byte-identical afterwards** — the 18 protected
theme files, 11 untracked logo assets and the 2 retired-Expert-tier repair scripts. `KG5A-DISC-02`
was honoured with a hunk-level exclusion: the unrelated `<option value="unknown" disabled>` line in
`inspection-workspace/page.tsx` is **not** in commit 5 and remains uncommitted in the working tree.

**The six recorded layers were preserved; three per-file assignments were re-derived.** KG-5A's prose
bucket table predates KG-5B/KG-5C, which added import edges it could not have known about. Measured
against the current graph:

* `inspection.service.ts` moves **A → D** — it imports `cutover-mode`, `shadow-provenance-invariant`
  and `shadow-operational-metrics`, so the provenance gate cannot precede the cutover layer.
  KG-5A's recorded `commitsABBuildWithoutCutover: true` is therefore **not reproducible for A as
  that table assigned it**, and the flag has been removed from the machine state rather than left
  standing.
* `finalize-regulatory-release.ts` and the governed-source files move **A → B** — `governed-source-set.ts`
  imports the corpus seed and the projection, which are the B layer.
* `shadow-provenance-invariant.ts` moves **D → C** — `governed-provenance.ts` imports it.

Every move places a file **later** or into the layer whose content it actually is. Asserted
mechanically over all 62 packaged source files: **zero ordering violations** — every in-package
import resolves to the same or an earlier commit, and no file appears in two commits.

**The committed tree was verified in a disposable clean checkout built with `git archive HEAD`, so
no unstaged, ignored or locally generated file could contribute.** Backend `tsc` exit 0; frontend
`tsc --noEmit` exit 0; all 46 migrations applied, all six governed migrations reverted and
re-applied, and a re-run reported `No migrations are pending`. The clean checkout reproduced manifest
`14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b` with 35 records on **four**
independently rebuilt databases, and the operator CLI resolved its committed release definition and
refused every malformed or stale-pointer invocation with exit 2.

> **This authorizes nothing further.** The next possible operation is review and, if separately
> authorized, **push**. Deploy, migration, release creation, activation, SHADOW and CUTOVER each
> remain their own authorization boundary.

### KG-5A — release packaging and production governed-release readiness (2026-08-21) `MUST_REVERIFY`

Verdict **`KG_5A_COMPLETE — PRODUCTION_RELEASE_PACKAGE_NOT_READY`**. Nothing was committed, pushed,
merged, deployed or activated; production was read read-only only. Evidence: `kg-5a/STATUS.md`.

**Packaging is solved.** All 582 working-tree paths are classified with **none unknown**: 54
`KG_RELEASE_REQUIRED`, 495 `KG_VERIFICATION_ONLY`, 18 `UNRELATED_FRONTEND_THEME_WORK`, 13
`UNRELATED_OTHER`, 2 `BLUEPRINT_DOCUMENTATION`. An isolated tree built with `git archive HEAD`
(no git metadata mutated) and overlaid with only the KG files differs from HEAD in **22 tracked files
and zero theme files**, builds and typechecks clean, and reproduces **every** authoritative KG gate —
KG-3E/3F, KG-4A, KG-4B, KG-4C, KG-4D and KG-4E — with no unexplained regression. The commit plan is
six commits derived from the real import graph, and **A+B were proven to build with the entire
`standards/cutover/` subsystem absent**. There are **no dependency changes** anywhere.

**The six migrations are safe.** Every `up()` is additive DDL with **no data backfill of any kind** —
the only `UPDATE` in the set is in `1800000011000`'s `down()`. Rehearsed on a database rebuilt to
production's exact pre-KG shape (40 migrations, latest `RefreshTokens1800000008000`): all six applied,
the data fingerprint was **byte-identical before and after**, 0 invalid indexes, 0 unvalidated
constraints, a re-run reports `No migrations are pending`, and a revert-then-forward restores the same
fingerprint. Because every added column is nullable, the prior production commit runs unchanged against
the migrated schema — **schema rollback needs no DB action at all**.

**Deploying with SHADOW off is a proven no-op for the tree that would ship.** The packaged backend was
run against a database holding an **active** governed release with 35 approved records and **zero**
`GOVERNED_CUTOVER_*` variables: health OK, auth OK, an 84 KB real analysis with real citations, **0
governed keys in the payload, 0 shadow events, NULL provenance**, and `backingStatus` taking only
`CITATION_ONLY` / `UNAPPROVED_CONTENT` — `APPROVED_GOVERNED_CONTENT` never appears. *An active governed
release does not alter customer output.*

**Approval semantics are settled** `PROTECTED_DECISION`. Every existing reviewer decision — all 35 in
the KG-4B corpus, all 41 in the remediation corpus — carries `approvalDigest` **NULL**: they are
pre-contract v1 decisions, and §7's NULL semantics plus D-17 forbid backfilling them. None may be
imported. But the rehearsed production release reproduces `approvalDigest` **identically on 35 of 35
records**, so a reviewer re-attesting is attesting to provably identical content. Production approvals
are therefore **newly appended, one record at a time, by a named human**, using the recorded KG-3D/3E/4A
clause-by-clause comparison as the evidence being confirmed. Rehearsed end to end: 35 appended through
the reviewer CLI, a wrong checksum refused, all 8 activation gates passed. The packet
(`kg-5a/PRODUCTION_RELEASE_REVIEW_PACKET.md`) recommends **27 REATTEST, 8 NEW_REVIEW_REQUIRED, 0
EXCLUDE** — the eight are exactly KG-3D's deferred unsourced records, and none is in the 23-citation
emitted set.

**Both KG-5A blockers are now closed by KG-5B.** What follows records what they were and what closed
them, because the root cause is the part worth carrying forward.

### `KG5A-DISC-01` — CLOSED by KG-5B

**The root cause was not the missing `WHERE` clause.** It was that there was no such thing as a
governed *candidate record*: the only representation of a governed standard was a row in
`standards_master`, the same table serving 2,390 legacy customer-facing rows on the LEGACY path. So
the only way to build a release was to write the governed records into the live customer corpus and
then snapshot the whole table. Every measured harm — five rewritten live rows, a renamed citation, a
unique-index collision, a corpus left at 2,396 rows with a duplicate pair — followed from that.

KG-5B gives the governed record a home of its own:

```
governed-source-set.ts        version-controlled, ZERO database access
  -> release-definition.ts    explicit membership, named by citationKey, version-controlled
    -> TEMP staging table     ON COMMIT DROP, inside the construction transaction
      -> regulatory_release_records   immutable
        -> release-manifest.ts        UNCHANGED
```

**`STABLE_INVARIANT` — governed release construction does not write to `standards_master`.** Enforced
by `assertNoLegacyCorpusWrites()` over every statement the builder issues, not merely documented.
Measured on a 2,390-row production-shaped corpus: row count, per-row digest, citations, titles,
`standard_text` and source metadata all unchanged; 0 rows gained `source_key`, `release_id`,
`normalized_record_checksum` or `transformation_version`; 0 duplicate `(agency_code, citation)` pairs;
0 legacy rows read during construction.

**The manifest is reproduced, not redefined.** `14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`,
35 records, byte-identical on an EMPTY corpus and on the 2,390-row production-shaped corpus. Every
record checksum and every approval digest is identical between the two, and identical to KG-5A's.
The release definition pins all 35 record checksums plus the manifest, and construction **refuses**
rather than adjusting if any pin does not reproduce.

**The old pipeline can no longer reach production.** `seed:safescope-standards` is still needed for
clean disposable databases, so it was not removed — it now refuses **before its first write** on any
corpus holding regulations the governed source set does not name
(`backend/src/standards/seed/legacy-corpus-guard.ts`). Against a production-shaped clone: exit 1,
2,390 rows untouched.

> **`DO_NOT_REDISCOVER`.** That guard was first wired only into the sync and the finalizer — stages 2
> and 3. It fired correctly at stage 2, by which point stage 1 had already inserted five rows and
> rewritten `title` and `standardText` on `1910.219`, `1910.146` and `1910.36`: three of the five rows
> KG-5A recorded as damaged, corpus at 2,395. **A guard placed after the first mutation is not a
> guard.** It now sits at stage 1.

### `KG5A-DISC-03` — CLOSED by KG-5B

`npm run release` — `status` · `sources` · `prepare` · `activate` · `rollback`
(`backend/scripts/regulatory-release.ts`). Activation requires the exact release id, the expected
manifest, the expected current pointer (`none` spelled explicitly) and a named actor; rollback
requires the exact target and the expected current pointer. There is **no** `activate --latest`, no
prefix matching, no fuzzy lookup, no automatic release creation, and no `publish` bundling
prepare/approve/finalize/activate. `--dry-run` on `prepare`, `activate` and `rollback` performs zero
writes and emits **no** lifecycle event.

> **`DO_NOT_REDISCOVER`.** The CLI's first design compared `--expected-current` against the pointer
> **outside** the transaction. Two operators acting on the same stale reading both passed that
> comparison, both serialized correctly on the advisory lock, and **both committed**. Every
> transaction was atomic and exactly one release was active at the end — and the system was still
> last-writer-wins. **A precondition checked outside the lock is not a precondition.**
> `PointerMoveOptions.expectedCurrentReleaseId` now re-checks the belief inside the transaction,
> under `pg_advisory_xact_lock`. It is additive: the key absent preserves pre-KG-5B behaviour exactly.

### Blocker B4, measured on an untouched corpus

| | No active release | Release active |
|---|---|---|
| `resolverHealth` | `NO_ACTIVE_RELEASE` ×35 | **`OK` ×35** |
| `RESOLVER_FAILURE` | 35 | **0** |
| `governedBackingState` | `NO_ACTIVE_RELEASE` ×35 | `APPROVED_EXACT` ×27, `UNAPPROVED_RECORD` ×8 |
| `INTEGRITY_FAILURE` / `CITATION_DIFFERENCE` / `GRANULARITY_DIFFERENCE` | 0 | **0** |
| severity | `REVIEW` ×35 | `INFORMATIONAL` ×12, `REVIEW` ×8, **`BLOCKING` ×15** |

KG-5A's right column showed `EXACT_MATCH` ×35 only because it ran on a corpus already **replaced by
the governed rows**. KG-5B never touches the corpus, so this is the first honest measurement of what
Stage-1 SHADOW would report in production.

### `KG5B-DISC-01` — RESOLVED by KG-5C

KG-5B measured 15 of the 27 approved records as `CONTENT_DIFFERENCE`/`BLOCKING`, but its comparator
selected legacy input with `normalizeCitationForMatch` rather than by exercising the live
`hydrateStandardReferences` customer path — so 15 was a corroborated **discovery**, not an
equivalence result. KG-5C re-measured all 15 through the real path, on **both** customer body-text
tiers.

**The pairing was correct; the classification was too coarse.** The count of 15 is confirmed. What
changes is what the difference *is*: all 15 classify `GOVERNED_REVIEWED_RENDERING`.

Legacy `standard_text` is a verbatim eCFR/MSHA ingest; the governed `canonicalText` is the reviewed
rendering KG-3D/3E/4A adjudicated clause by clause — it expands defined terms inline, names limiting
sibling paragraphs and states the citation explicitly. Byte-equality is **not achievable by
construction**, so its absence is not evidence of disagreement:

```
30 CFR 62.120
  legacy    "…equals or exceeds the action level the mine operator must enroll the miner in a
             hearing conservation program that complies with § 62.150 of this part."      (200 B)
  governed  "…equals or exceeds the action level (an 8-hour time-weighted average sound level
             of 85 dBA, or equivalently a dose of 50 percent, per 30 CFR 62.101), …"      (306 B)
```

Entry to the class is **mechanical**, reachable only after `EXACT`, `NORMALIZATION_ONLY` and proven
boundary containment have each been tried and failed, and requires all four of: approved against the
**exact checksum**; a clause-by-clause review **recorded** in a named KG phase; the delivered text
**byte-identical** to the frozen `payload.canonicalText`; and the same **logical citation identity**.
It does **not** prove the rendering is non-contradictory — that is a legal reading, and it is
precisely what the recorded review is. Its discipline shows in the result: the 8
`NEW_REVIEW_REQUIRED` records have no recorded review, so the 3 whose legacy row resolves are
**refused** the category and classify `CONTENT_DIFFERENCE`.

### `KG5C-DISC-01` — 634 legacy summaries truncated mid-word

`plain_language_summary` is a hard 500-character cut of `standard_text` on 996 of 2,390 production
rows; **634 cut mid-word**. That fragment is what a Path B customer reads today under the "HazLenz
standard summary" label. Pre-existing and unrelated to governance. Not a SHADOW blocker
(customer-invisible) and not a cutover blocker — cutover *repairs* it for the 15 approved reviewed
renderings and leaves it unchanged for unapproved records.
Classification: `LEGACY_CORPUS_QUALITY — MUST_ADJUDICATE_BEFORE_WIDENING_LEGACY_DELIVERY`.
**Superseded 2026-08-22 — see the authoritative §26 entry**, reclassified
`DEFECT_NONBLOCKING — CUSTOMER_VISIBLE_ON_GENERATED_REPORT` after the truncation was observed
printed in a real generated customer report under LEGACY (§28.10).

### The production operation sequence is now fully commanded

Every mutable step is one reviewed command; **no ad-hoc Node snippet is required at any point**.
Rehearsed end to end on a database built to production's exact pre-KG shape (40 migrations, 2,390
legacy rows): **58/58 assertions, 46 reviewed commands, 0 ad-hoc snippets**. Full runbook with
preconditions, success evidence, failure behaviour and stop/rollback instructions:
`verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-5b/PRODUCTION_RELEASE_RUNBOOK.md`.

**KG-5B adds no migration.** The six KG-5A rehearsed are unchanged, and a column-level schema dump is
byte-identical before and after a real governed `prepare`, so `97941ca2`'s forward compatibility with
the migrated schema carries forward untouched.

**Deployment branch:** recommend **Option A, merge to `main`** — Render auto-deploys `main`, `main` is
exactly the live commit `97941ca2`, and the release branch is already pushed and in sync. No Render
configuration was changed. **Frontend:** the 3 KG display files should ship with the backend (which
begins emitting `backingStatus: CITATION_ONLY` on deployment); the 18 theme files should not.

### The authoritative customer path, and what it delivers (KG-5C)

**Two paths exist and both were exercised.** Testing one would have been wrong.

| Path | Legacy body the customer reads | `1910.1200` |
|---|---|---|
| **B** finding-scoped `standardDecisions` | `plain_language_summary` — `mark()` spreads `title`, `plainLanguageSummary` and source metadata from hydration but **not `standardText`** | 500 B |
| **A** `suggest()` | `standard_text` from its own corpus SELECT | 56,026 B |

`hydrateStandardReferences()` keys results with `normalizeCitationForLookup`, which **preserves the
agency prefix and the subsection**, and accepts a base-key match **only when the request has no
subsection**. Measured consequence: a subsection-level citation resolves **no** legacy row when the
corpus holds only the section — 12 of the 27 approved records are `LEGACY_UNRESOLVED` and render
`CITATION_ONLY` today.

**`STABLE_INVARIANT` — the customer-visible text after governed cutover is the EXACT reviewed
governed artifact, and nothing else.** It is never expanded back into unreviewed legacy content.
`verifiedText` is non-null only when `decideFallback()` sets `textIsVerified`, which only
`APPROVED_EXACT` sets; `mark()` applies it after the hydration spreads so it wins. The "Verified
standard text" badge is therefore reachable only through a reviewer decision bound to that record's
exact checksum. **This required no code change — the architecture already implemented it.**

| Measured | Result |
|---|---|
| approved records delivering byte-for-byte the reviewed artifact | **27 / 27** |
| unapproved records whose governed delivery is identical to LEGACY | **8 / 8** |
| emitted gold-set citations proven end to end | **23 / 23** |
| approved badges on content that is not the reviewed artifact | **0** |

**Emission tiers.** 23 citations are emitted; 22 carry `applicability: 'direct'` and one
(`30 CFR 56.14132`) is candidate-only by the KG-3F MSHA-TRAFFIC-01 predicate (`CAVEAT-2`). KG-3F's
"23 emitted" counts every emitted citation; filtering to `direct` gives 22. Both are true about
different things — **prove all 23.**

### `KG5C-FIX-01` — the SHADOW comparator compared a field the Path B customer never sees

`safescope-v2.service.ts` built the shadow comparison's legacy text as
`hydratedRow.standardText ?? hydratedRow.plainLanguageSummary`, under a comment stating it must be
"the text the CUSTOMER would actually be shown". But `mark()` never spreads `hydrated.standardText`
onto a finding-scoped decision. Same class of bug KG-4B fixed one tier up. Corrected to `mark()`'s
own precedence: `decisionText ?? hydratedRow.plainLanguageSummary`. **The mismatch verdict is
unchanged**, so nothing was fixed to move a number — what changes is that the comparison now
describes the customer's actual result.

### `OPEN_ITEM` backlog carried forward

| Item | Origin | Note |
|---|---|---|
| Close `GOVERNED_MISSING` — 137 declared-but-unemitted citations | KG-3F | The population behind the shadow corpus's largest fallback bucket |
| Resolve 39 parent/child ambiguities | KG-3F | Generates `GRANULARITY_DIFFERENCE` |
| Resolve 42 duplicate multi-surface declarations | KG-3F | Generates `APPROVED_SECTION_ONLY` |
| Source the 3 governed records without a source URL | KG-3F | |
| Adjudicate `SOURCE_URL_REGISTRY_MISMATCH` on 5 OSHA records | KG-3E | Classified, deliberately not churned |
| Operator-triggered instant kill switch | KG-4C | Only the breaker latch is immediate; the env path carries its platform's restart characteristics |
| `GET /inspection-reports` returns every version's full frozen `sourceSnapshot` | KG-4E | KG4E-DISC-03, classified **`MUST_FIX_BEFORE_CUSTOMER_GOVERNED_DELIVERY`**. Pre-existing and mode-independent; NULL under SHADOW so not a shadow leak and not a Stage-1 blocker. Under a governed delivery mode it would carry real release ids to every list caller, and it is 3.4 MB for 41 versions today regardless. Re-confirmed by the 2026-08-21 preflight; deliberately not remediated there |
| Do **not** pursue `GOVERNED_STRICT` as a customer mode | KG-4A | Until emitted-approved coverage is far above 23/160 |
| Do **not** enable `GOVERNED_WITH_FALLBACK` for customers | KG-4B | Until a production shadow exercises the eleven unobserved categories |
| ~~Adjudicate the 15 `CONTENT_DIFFERENCE`/`BLOCKING` records~~ | KG-5B | **RESOLVED by KG-5C**: all 15 are `GOVERNED_REVIEWED_RENDERING`; delivery fidelity is 27/27. No longer blocking |
| Adjudicate the 634 mid-word-truncated legacy summaries | KG-5C | `KG5C-DISC-01`. Pre-existing corpus quality; cutover repairs it for approved records. Blocks neither SHADOW nor cutover |

*This section is rewritten each slice. Everything above it is appended to.*

---

## 18 — DECISION LOG

| ID | Phase | Decision | Rationale | Status | Evidence |
|---|---|---|---|---|---|
| D-01 | KG-1 | Provenance is decided **server-side, never from client input**; `knowledgeReleaseId` stays NULL while retrieval does not consume governed data | An id written when nothing was consumed is a false claim | **ACTIVE** | `kg-1/KG_1_VERIFICATION.md` |
| D-02 | KG-2 | Release finalization becomes a lifecycle with an active pointer; a finalized release is not freely re-upserted | The prior `ON CONFLICT DO UPDATE` rewrote "finalized" identity at will | **ACTIVE** | `kg-2/KG_2_VERIFICATION.md` |
| D-03 | KG-2 | Existing promotion-governance services are **not** reused as the release lifecycle | They operate on individual source-knowledge candidates, not releases; conflating them merges two concepts | **ACTIVE** | `kg-2/KG_2_VERIFICATION.md` §2 |
| D-04 | KG-3A | Release membership is an immutable snapshot table, not a mutable scalar on the live corpus | A scalar names one release, so it can never express membership | **ACTIVE** | `kg-3a/KG_3A_VERIFICATION.md` §1 |
| D-05 | KG-3B | `corpusBacked` means **approved governed content** — nothing weaker | Any looser reading turns a governance signal into a retrieval signal | **ACTIVE** | `kg-3b/KG_3B_VERIFICATION.md` |
| D-06 | KG-3C | Governance controls **claims about verified text**, not which regulation is cited (option B) | Recommended in KG-3B, deferred in KG-3C for want of a display state, implemented in KG-4A | **ACTIVE** | `kg-3c/`, `kg-4a/contracts/FALLBACK_AND_APPLICABILITY.md` |
| D-07 | KG-3D | `1910.303(g)(2)(i)` promotion **refused** — voltage was never established | A qualifier must be named, not assumed | **ACTIVE — precedent** | `kg-3d/KG_3D_VERIFICATION.md` |
| D-08 | KG-3D/3E | `1910.303` (parent) and `1910.303(b)(1)` (child) are distinct records; neither answers for the other, and neither falls back to the other | Prefix similarity is not identity | **ACTIVE** | KG-3E granularity contract, 48/48 |
| D-09 | KG-3E | `30 CFR 56.14132(a)` record **refused**; truthful section `56.14132` created and approved instead | Approved horn-maintenance text behind a backup-alarm finding would be false *with the product's authority behind it* | **ACTIVE** | `kg-3e/KG_3E_VERIFICATION.md` §4 |
| D-10 | KG-3E | Source-URL registry mismatch on 5 OSHA records **classified, not churned** | osha.gov is current agency-published primary text; repointing is presentation-only churn | **ACTIVE** | `kg-3e/KG_3E_VERIFICATION.md` §6 |
| D-11 | KG-3E | Emission is measured **live** by running the real engine over the gold set, never from a frozen artifact list | A frozen list cannot see a predicate change | **ACTIVE** | `report:kg3e-work-queue` |
| D-12 | KG-3F | Deterministic retrieval: explicit `ORDER BY` ×3 + terminal tie-break | `suggest()` returned different citations for the same query depending on physical row order | **ACTIVE** | 170/170, `kg-3f/phase2-4-deterministic-retrieval.md` |
| D-13 | KG-3F | `keywords` stay inside the substantive approval binding | Measured: adding keywords to scoring moved `1926.1153` 15→51 and changed the emitted citation | **ACTIVE** | `kg-3f/phase8-10-…md` |
| D-14 | KG-3F | **Dual approval digests** (substantive content + source identity) composed into one versioned `approvalDigest` | One digest says *something changed*; it cannot say *what kind*, and the two kinds have different remedies | **ACTIVE** | 57/57 |
| D-15 | KG-3F | `source_url` / `retrieval_date` are **excluded** from approval binding | A URL is a retrieval path, not the artifact; `source_document_checksum` carries the safety argument | **ACTIVE** | `kg-3f/phase8-10-…md` |
| D-16 | KG-3F | `canonicalDigest()` (recursive key sort) for approvals; `digest()` in `release-manifest.ts` left untouched | jsonb does not preserve key order; changing `digest()` would move every finalized manifest checksum | **ACTIVE** | DB-2 defect |
| D-17 | KG-3F | Historical NULL approvals are **not backfilled**; reaffirmation appends with `supersedesDecisionId`; **no bulk approval path** | Recomputing from the mutable live corpus would attest a reviewer to content they may never have seen | **ACTIVE** | DB-10, DB-11 |
| D-18 | KG-3F | `56.14132` rule split: `(a)` = horn only; `(b)(1)` only where obstructed view is established; section otherwise; satisfied by alarm **or** observer **or** clear view | The trigger was asserted, the paragraph was wrong, and compliant alternatives were ignored | **ACTIVE** | 16/16, `kg-3f/phase5-7-…md` |
| D-19 | KG-3F | **Keep** the MSHA-TRAFFIC-01 legal correction (31/31 → 30/31); gold artifact preserved byte-for-byte | The corrected behaviour matches the gold set's own `expectedCitations`; the old one did not | **ACTIVE — PROTECTED** | `kg-3f/MSHA-TRAFFIC-01-adjudication.md` |
| D-20 | KG-3F | Coverage closed by **correcting the citation**, never by fabricating a record | 23/23 emitted-approved reached without creating content for `56.14132(a)` | **ACTIVE** | `kg-3f/phase5-7-…md` §Phase 7 |
| D-21 | KG-3F | `EVIDENCE_UNKNOWN` and `GOVERNANCE_FILTER_EMPTY` are reported separately | Collapsing them creates pressure to re-weaken a predicate to make a number go up | **ACTIVE** | `kg-3f/phase14-16-…md` |
| D-22 | KG-4A | The **single seam** is `resolveStandardsBacking()`'s pre-existing `governed` input | `governed: undefined` reproduces today byte-for-byte, so LEGACY is a structural no-op | **ACTIVE** | `kg-4a/contracts/PHASE1_CUSTOMER_PATH_MAP.md` |
| D-23 | KG-4A | Governed resolution runs **after** ranking/dedup/truncation | Makes "a governance gap never deletes an evidence-derived citation" structural | **ACTIVE** | `kg-4a/contracts/CUTOVER_ARCHITECTURE.md` |
| D-24 | KG-4A | Enablement = **server mode AND (account OR org allowlist)**; percentage cohort **rejected** for the first cutover | Two independent locks, both default off; a cohort names nobody | **ACTIVE** | Phase 13, 51/51 |
| D-25 | KG-4A | No `SUPPRESSED` delivery state | Suppression is an applicability decision, never a governance one — made unrepresentable in the type | **ACTIVE** | `FALLBACK_AND_APPLICABILITY.md` §2 |
| D-26 | KG-4A | **Client-posted `knowledgeReleaseId` rejected**; server must independently agree on mode *and* active release | Otherwise a client could invent governed provenance | **ACTIVE** | 53/53; 10 attacks all NULL |
| D-27 | KG-4A | Release **pinning** (read the pointer once) rather than locking | Records are immutable once finalized, so pinning an id is sufficient; a lock would serialise AI operations | **ACTIVE** | Phase 9 activation race |
| D-28 | KG-4A | Rollback is a **mode change** only | No DB rollback, no de-activation, no analysis rewriting; history is preserved in both directions | **ACTIVE** | Phase 14 |
| D-29 | KG-4A | `GOVERNED_STRICT` is **not** a customer-default candidate | 23 of 160 emitted-and-approved; strict display would strip text from the rest at once | **ACTIVE** | `CUTOVER_ARCHITECTURE.md` §4 |
| D-30 | KG-4A | Fallback shows legacy text **without** an added caution; the reason code is operator-only | A caution on essentially every standard reads as breakage, not precision | **ACTIVE** | `FALLBACK_AND_APPLICABILITY.md` §7 |
| D-31 | KG-4B | **SHADOW is customer-invisible** — including payload *shape*; `customerVisible` gates the projection | Adding keys to a response is altering customer output | **ACTIVE — PROTECTED** | 43/43, 576/576 |
| D-32 | KG-4B | One taxonomy; KG-4A's category set survives only as a projection | Two vocabularies would drift | **ACTIVE** | `shadow-taxonomy.json` |
| D-33 | KG-4B | Severity assigned **separately** from category; `GOVERNED_MISSING` is not blocking; `CONTENT_DIFFERENCE` is | "Different" and "wrong" are not the same claim | **ACTIVE** | `SHADOW_EVENT_AND_TAXONOMY.md` §4 |
| D-34 | KG-4B | `CONTENT_EQUIVALENT` normalises only case/quotes/dashes/whitespace/terminal punctuation | Never `shall`/`must`, numerals, or any word carrying legal weight | **ACTIVE** | §6 of the same |
| D-35 | KG-4B | **The throttle was not weakened** to make the corpus run; a 429 is refused as a non-comparison | Relaxing a production control to make verification convenient is the move this programme refuses | **ACTIVE — PROTECTED** | `INSTRUMENTATION_DEFECTS_FOUND.md` §1 |
| D-36 | KG-4B | JSONL for shadow events; **no production schema created** for a verification artifact | A durable store belongs to the slice that needs one, with its own retention contract | **ACTIVE** | Phase 9 |
| D-37 | KG-4B | **Test DB ownership** — a mutating suite writes only to a database it created | Evidence damage from a shared mutating run | **ACTIVE — PROTECTED** | §11; both `REPRODUCTION_COMMANDS.md` |
| D-38 | KG-4B | KG-3F Phase 16's disconnection test is left unmodified but is **superseded** by the mode-aware default-off suites | It is KG-3F evidence; its scan cannot see the new seam | **ACTIVE** | `kg-4b/DEFAULT_OFF.md` |
| D-39 | KG-4C | Production SHADOW requires **four** locks; the shadow acknowledgement is a **separate sentinel** from KG-4A's | Acknowledging a customer-invisible comparison must never be reusable as consent to change customer output | **ACTIVE** | `kg-4c/contracts/production-shadow-contract.json` |
| D-40 | KG-4C | **Authorizing controls are exact; disabling controls are permissive.** A kill switch engages on any non-empty value, including `off`/`false`/`0` | Locks must not open by accident; brakes must not fail to bite on a typo | **ACTIVE** | 36 kill-switch checks |
| D-41 | KG-4C | Five explicit stages with per-stage principal ceilings; **no automatic promotion**; percentage cohort not before stage 3 | An operator must be able to name every affected account in one breath; a percentage names nobody | **ACTIVE** | 25 stage checks |
| D-42 | KG-4C | Hard invariants trip at **threshold zero with no sample floor**; rate conditions require a minimum sample and a stated KG-4B basis | There is no acceptable rate of customer-payload mutation; and a 1-in-2 early transient must not stop a healthy run | **ACTIVE** | `shadow-circuit-breaker.ts` |
| D-43 | KG-4C | A **missing/indeterminate** invariance check is itself a hard violation | Unverified is not verified; a check that passes when it could not run manufactures confidence | **ACTIVE** | `CUSTOMER_OUTPUT_UNVERIFIED` |
| D-44 | KG-4C | Telemetry sink is **structured application logs**; **no production DB schema** | A DB write inside the customer transaction adds the exact failure mode KG-4B proved absent; logs answer every question the taxonomy poses | **ACTIVE** | `kg-4c/WORKLOAD_AND_SINK.md` |
| D-45 | KG-4C | Retention enforcement is an **operational dependency**, stated not simulated | An application cannot enforce retention on data it handed to a log shipper; the privacy guarantee does not depend on the duration | **ACTIVE** | `RETENTION_CONTRACT` |
| D-46 | KG-4C | Cohort keys are **opaque server-side ids only** — never email, name or any personal attribute | Hashing personal data would put it into an operational decision path and eventually into telemetry | **ACTIVE** | 9 sampling checks |
| D-47 | KG-4C | **An unmarked database is refused.** Claiming one needs the exact database name | Every pre-existing evidence corpus is unmarked; "unmarked means claimable" hands over exactly what must be protected | **ACTIVE — PROTECTED** | `kg-4c/INCIDENT-…md` |
| D-48 | KG-4C | **A guard must be exercised against the real hazard**, and an assertion describing the implementation is not a test | The guard's suite passed 26/26 while the mechanism was inverted — the KG-3F `test-evidence-foundation.ts` failure class, repeated | **ACTIVE — PROTECTED** | `kg-4c/INCIDENT-…md` |
| D-50 | KG-4D | In SHADOW the customer receives the **pristine legacy run**; the comparison runs entirely on copies | Makes shadow invisibility structural rather than a conclusion the comparison supports; copy artifacts cancel out of the comparison | **ACTIVE — PROTECTED** | `kg-4d/STATUS.md` |
| D-51 | KG-4D | The KG-4C modules are reached through **one** orchestration boundary; no HazLenz service imports them directly | Six call sites scattered through HazLenz would be six places to get authorization wrong | **ACTIVE** | `test:kg4d-default-off` |
| D-52 | KG-4D | Default-off now means "reachable and inert", not "unreachable" | After integration, unreachability is no longer available as a proof, so the suite proves the harder property | **ACTIVE** | 119/119 |
| D-53 | KG-4D | The DB ownership guard is verified by an **independent black-box** verifier that imports none of it | KG-4C's guard suite passed 26/26 while the mechanism was inverted; a test sharing the implementation's assumptions agrees with its bugs | **ACTIVE — PROTECTED** | `test:kg4d-db-ownership-blackbox` |
| D-54 | KG-4D | Every comparison needs a **per-observation** non-vacuity floor | KG-4B compared two HTTP 429s, KG-4C asserted a defect was correct, KG-4D compared two empty pages twice. An equality oracle over two broken observations reports perfect agreement | **ACTIVE — PROTECTED** | `kg-4d/STATUS.md` |
| D-49 | KG-4C | Eleven, not seven, KG-4B mismatch categories were unobserved (`KG4C-DISC-01`) | The measured corpus and analytics both say eleven; seven is a prose subset. Prefer the measurement | **ACTIVE** | `kg-4b/analytics/shadow-analytics.json` |
| KG4E-D1 | KG-4E P1 | Do **not** change production code | The renderer already excludes every governed and shadow field by construction; there was no leakage risk to correct, and editing a correct file to make a slice look productive is how correct files stop being correct | Adopted | `kg-4e/contracts/report-input-trace.json` |
| KG4E-D2 | KG-4E P3 | Reject PDF byte equality between two inspections; assert it only where meaningful | The inspection uuid is printed as the record reference and PDFKit stamps a timestamp and a random `/ID`. Byte equality would fail for reasons unrelated to SHADOW, and the usual repair — widening an ignore list — ends with an oracle that proves nothing | Adopted | `kg-4e/contracts/report-volatility.json` |
| KG4E-D3 | KG-4E P3 | Derive volatility as **positions**, never as values | A set of literal values cannot generalise past the two runs that produced it; a third run carries a third value (KG4E-DISC-01) | Adopted | §13.12 |
| KG4E-D4 | KG-4E P2 | Hold the account constant and vary the **server** | Using two accounts would put the inspector's name — a genuinely customer-visible field — into the comparison and attribute it to SHADOW | Adopted | `kg-4e/REPRODUCTION_COMMANDS.md` |
| KG4E-D5 | KG-4E P4 | Match `SHADOW` as a bare word, not a substring | A test that cannot tell `shadow` from `overshadowed` gets disabled the first time it fires on ordinary prose | Adopted | `compare-kg4e-report-invariance.ts` |
| KG4E-D6 | KG-4E P4 | Ship a **mutation control** alongside every invariance claim | A comparison that has never reported disagreement, and a forbidden-term test that has never fired, are not evidence. The control makes the oracle fail 8/8 with 176 hits | Adopted | `kg-4e/control-mutation-must-fail.json` |
| KG4E-D7 | KG-4E P8 | Leave `test:kg4b-privacy-review` as written and use the v2 runtime guard for v2 events | The v1 suite classifies 29 fields and cannot classify the six KG-4C added. Editing prior evidence to make it green would destroy the record; the authority for v2 is the guard the write path itself runs | Adopted | `kg-4e/STATUS.md` Phase 8 |
| KG4E-D8 | KG-4E P8 | Do not re-run the browser suite | KG-4E changed no production code of any kind, so the KG-4D pass has identical inputs; and the report surface was closed by fetching the real PDF bytes and inspecting every page, which a browser could not improve on | Adopted, with the reasoning recorded rather than the coverage claimed | `kg-4e/STATUS.md` Phase 8 |
| KG4E-D9 | KG-4E P7 | Record the failed resolver injection as a measured negative | Dropping the four approval-contract columns did not fail the resolver. Reporting the intended outcome instead of the measured one is the exact failure KG-4C's ownership-guard incident was about | Adopted | §13.15 |
| KG5A-D1 | KG-5A P2 | Package the KG subsystem by **path-scoped overlay onto a `git archive` of HEAD**, never by stashing or resetting the working tree | The theme work is legitimate uncommitted work; `git archive` mutates no git metadata, so the packaged tree can be proven clean by diffing it against HEAD | Adopted | `kg-5a/contracts/packaged-file-manifest.json` |
| KG5A-D2 | KG-5A P3 | Six commits ordered by the **real import graph**, with the five customer-path files that import `standards/cutover/` held until commit D | A+B were proven to build with the cutover subsystem deleted; ordering by a template instead would have produced commits that cannot compile | Adopted | `kg-5a/contracts/kg-import-graph.json` |
| KG5A-D3 | KG-5A P9 | **No existing reviewer decision may be imported into production.** Every production approval is newly appended, one record at a time, by a named human | All 76 existing decisions carry `approvalDigest` NULL — they are pre-contract v1, and §7/D-17 forbid backfilling. Re-attestation is truthful only because the record digests reproduce identically, not because the old decision transfers | **ACTIVE — PROTECTED** | `kg-5a/PRODUCTION_RELEASE_REVIEW_PACKET.md` |
| KG5A-D4 | KG-5A P10 | Keep all 35 records and leave eight `NEW_REVIEW_REQUIRED`, rather than shrinking the release to only the reviewed ones | Dropping a record moves the manifest off `14a34fea…` and severs the reproducibility link to every KG-4A–4E result; the activation gate needs `governedRecords > 0`, not 100 %, and an unapproved record resolves `UNAPPROVED_RECORD`, which is never BLOCKING | Adopted | `kg-5a/STATUS.md` §7 |
| KG5A-D5 | KG-5A P7 | **Refuse to create the production release with the current seed pipeline** | Measured on a copy of the real production corpus, it rewrites five live customer-facing rows and then crashes on a citation-format collision. Shipping a corpus mutation as a side effect of "deploy with SHADOW off" would break the one property the whole cutover architecture rests on | **ACTIVE — PROTECTED** | KG5A-DISC-01 |
| KG5A-D6 | KG-5A P14 | Merge to `main` rather than repointing Render at the release branch | `main` is exactly the live commit and Render already auto-deploys it; Option B would leave `main` permanently behind production and make every rollback a branch decision | Adopted | `kg-5a/STATUS.md` §10 |
| KG5B-D1 | KG-5B P1–2 | **Give the governed record a home of its own.** A governed candidate is derived from version-controlled sources with zero database access; `standards_master` is never the source, the staging area or the membership | The missing `WHERE` clause was a symptom. The cause was that a governed record could not exist outside the live customer corpus, so building a release *required* mutating it | **ACTIVE — PROTECTED** | `governed-source-set.ts`, `kg-5b/STATUS.md` §1 |
| KG5B-D2 | KG-5B P3 | **Release membership is an explicit version-controlled definition**, named by `citationKey`, never inferred from database contents | Membership must be reviewable in a diff and identical on every machine. Naming by citation string would make it depend on the formatting accident KG5A-DISC-01 is about; naming by row id would make it depend on a row construction may not touch | **ACTIVE — PROTECTED** | `release-definition.ts`, `definitions/*.json` |
| KG5B-D3 | KG-5B P4 | Stage the governed candidate set in a **session-scoped TEMP table**, not a persisted staging table | No seventh migration (preserving `97941ca2` forward compatibility); staging cannot go stale; `ON COMMIT DROP` supplies the atomicity; and staging in the same database reproduces `standards_master`'s collation and pg type mapping exactly, which is what makes manifest reproduction structural rather than a reimplementation | Adopted | `governed-release-builder.ts` |
| KG5B-D4 | KG-5B P8 | The release definition **pins** the manifest and all 35 record checksums, and construction **refuses** rather than adjusting when a pin does not reproduce | A pin that could be satisfied by adjustment is not a verification. 27 recorded reviews name those exact digests | **ACTIVE — PROTECTED** | `kg-5b/STATUS.md` §4 |
| KG5B-D5 | KG-5B P4 | **Do not delete the unsafe seed pipeline — make it refuse.** The guard asks about the DATA, at stage 1, with no environment override | `seed:safescope-standards` is still needed by a dozen verification suites for clean disposable databases. A runbook line is the weakest possible control over the most damaging command in the repository. A name pattern or an env allowlist is a claim by the caller, and the caller is the thing being guarded | **ACTIVE — PROTECTED** | `legacy-corpus-guard.ts` |
| KG5B-D6 | KG-5B P16 | **The expected-pointer precondition is checked inside the transaction, under the advisory lock** | Checked outside, two operators on the same stale reading both passed and both committed — atomic transactions, one active release, and still last-writer-wins | **ACTIVE — PROTECTED** | `PointerMoveOptions`, `kg-5b/STATUS.md` §6 |
| KG5B-D7 | KG-5B P12 | **Do not lower the `governedRecordsPresent` threshold.** Measure the scope question instead | All eight gates pass at 27 of 35 approved with the threshold untouched. The `> 0` threshold is a recorded KG-3B governance decision, not accidental coupling | **ACTIVE — PROTECTED** | `kg-5b/contracts/approval-continuity.json` |
| KG5B-D8 | KG-5B P22 | Add an earned **`OPERATOR CMD`** category to the KG-4D mutating-suite inventory rather than marking the release CLI "guarded" or leaving it "NEEDS GUARD" | An operator command must be able to write to production, so it cannot carry the disposable-database guard; claiming it does would be false. The exemption requires a one-entry allowlist **and** explicit expected-state arguments | Adopted | `test-kg4d-default-off.ts` |
| KG5C-D1 | KG-5C P1 | **Exercise BOTH customer paths, and drive the production method rather than a copy** | Path B's legacy body is `plain_language_summary`, Path A's is `standard_text`; on the production corpus those are 500 B and 56,026 B for the same citation. Testing one would have described text the other's customer never sees | **ACTIVE — PROTECTED** | `kg-5c/STATUS.md` §2 |
| KG5C-D2 | KG-5C P3 | **Add `GOVERNED_REVIEWED_RENDERING` rather than force a reviewed artifact into `CONTENT_DIFFERENCE`** | Legacy is a verbatim ingest, governed is a reviewed rendering: byte-equality is unreachable by construction, so its absence is not evidence of disagreement. Entry is mechanical, reachable only after the stronger classes fail, and it never claims the review was correct | **ACTIVE — PROTECTED** | `customer-path-equivalence.ts` |
| KG5C-D3 | KG-5C P4 | **The verdict that matters is DELIVERY FIDELITY, not legacy/governed similarity** | A cutover whose purpose is to replace an unreviewed ingest with a reviewed artifact should change the text; measuring that as a defect measures the feature. What must never happen is the badge and the bytes disagreeing | **ACTIVE — PROTECTED** | `kg-5c/STATUS.md` §1 |
| KG5C-D4 | KG-5C P5 | **Widen the harness to all 23 emitted citations rather than lower the expectation to 22** | `30 CFR 56.14132` is emitted candidate-only by the KG-3F MSHA-TRAFFIC-01 predicate. The recorded 23 counts every emitted citation; a `direct` filter gives 22. The scope to prove is what the customer sees | Adopted | `kg-5c/contracts/goldset-customer-path.json` |
| KG5C-D5 | KG-5C P6 | **Governed delivery serves the exact reviewed artifact and never expands it back into unreviewed legacy content** | The reviewed artifact is what a human adjudicated; re-expanding it would put unreviewed bytes under a "Verified standard text" badge | **ACTIVE — PROTECTED** | `fallback-contract.ts`, `mark()` |
| KG5C-D6 | KG-5C P7 | **Repair the comparator's field precedence; do NOT touch severity** | The comparator compared a field the Path B customer never sees. Changing `severityFor` instead would have made SHADOW green by weakening a gate. The verdict is unchanged by the fix, which is the proof it was not made to move a number | **ACTIVE — PROTECTED** | `KG5C-FIX-01` |
| `KG5D-D1` | KG-5D | `KG5D-DISC-01` disposition **A — path attribution NOT required**; preserve the instrumentation, add no telemetry | No frozen hypothesis needs it (`H4`/`H7` already say the guarantee is structural), and on the classify path every observation is Path B, so the field would be a constant. The `eventKey` collision is unreachable: Path A receives no cutover context on any route; 0 duplicates over 80 real events | **ACTIVE** | `kg-5d/PRODUCTION_SHADOW_PREFLIGHT_PASS2.md` §9 |
| `KG5D-D2` | KG-5D | The 317/319-byte longest production log line is **not** evidence of platform truncation | It is a property of what the application currently logs. Re-measured over 2,900 records: the window holds neither a counter-example nor a confirming example, so it settles nothing either way | **ACTIVE** | same, §8.3 |
| `KG5D-D3` | KG-5D | **No single-event production probe.** Settle log-line fidelity with Stage-1 abort gate **G1** instead | The probe is impossible today (the live commit has no `standards/cutover/`), the question is not SHADOW-shaped, the risk is telemetry-usability not customer safety, and the first real event answers it for free. **The correct response to an unverifiable transport assumption is an abort gate, not a probe** | **ACTIVE** | same, §8.5 |
| `KG5D-D4` | KG-5D | `minimumSample: 200/500` is a **stop-threshold suppression floor**, not a Stage-1 evidence requirement; **preserved unchanged** | Traced to source: the breaker's own basis says the floor exists so one early failure cannot trip a run. The Stage-2 gate (≥ 100, ≥ 24 h) and the post-run sufficiency table (200/500 + coverage) are two further, different things. All seven hard invariants are threshold-zero with **no** sample floor, so a small Stage-1 is safe | **ACTIVE** | same, §10; §26 `KG5D-DISC-03` |
| `KG5D-D5` | KG-5D | Stage-1 evidence is **coverage-based, not count-based**; traffic is **controlled operator traffic** with the claim bounded to production execution proof | Natural traffic is one analysis in the product's lifetime, and a zero-event window proves nothing (§27.2). 200 repetitions would exercise one taxonomy path 200 times and satisfy an equality oracle vacuously — the class `D-54` exists to prevent | **ACTIVE** | same, §10.4, §11; §27.8 |
| D-55 | L3-2h | **`qwen3-coder:30b` is NOT validated to carry Level-3 advancement.** The §37.5 structural-state incoherence mechanism is **provider-capability-bound**, established at **n = 2**; the order-sensitivity improvement is **real but narrow**; `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`; **L3-3 remains unauthorized** | Across 74 Gemini candidates in three variants the pre-registered `CONDITIONAL_AND_ASSERTED` class is **empty** against qwen's 1/2/2, and `C-CS-05` — the case §37.5 cited as flipping `asserted` under block order — returns identical facts on all three runs. That satisfies the entry contract's Terminal A rule on the axis it was pre-registered against. The order-sensitivity half is **2/24 against a floor of 1/24** on a best-effort seed and must stay qualified wherever it is cited. A hosted **preview** model measured on 24 diagnostic scenarios is architecture-selection evidence, never a production recommendation, and §31.2's privacy boundary is unadjudicated for a hosted provider | **ACTIVE — PROTECTED** | §39.3–§39.6; `hazlenz-l3-2h-cross-provider-final-2026-08-23/` |
| D-56 | L3-2h | **Clarification is structurally coupled to `hazardCandidate` existence.** A zero-candidate `INSUFFICIENT_EVIDENCE` outcome **cannot currently carry a required clarification**; `rederive-l32g-resolution.ts` excludes zero-candidate rows before clarification scoring, so the historical **75%** recall is **scorer-filtered (3/4)** and corrected scenario-level recall is **3/5 = 60%**. §37's and §38's figures are **preserved as historical reported values and are not silently rewritten** | The scorer cannot see the exact failure the contract creates — a provider is never charged for a clarification it failed to raise by emitting nothing at all — so the filtered figure flatters both providers. Correcting the *record* rather than the *artifact* preserves what each phase actually measured (`UPDATE POLICY` §4) while making 60% the figure every future statement must use. The scorer is **reported, not patched**: patching it is the **first** ordered step of L3-2i, taken **before** any contract change, so the corrected baseline exists before the thing that will move it | **ACTIVE — PROTECTED** | §39.5; `results/qwen-resolution.json`, `results/l32h-gemini-merged.json` |
| D-57 | L3-2i | **A clarification must not require a `hazardCandidate` to exist.** `ReasoningProposal.unresolvedDecisions` carries a decision-critical clarification at proposal level; it is legitimate only where a decision was actually left open, and a refused one is **dropped, never fatal** | §39.5.1 measured a correct `INSUFFICIENT_EVIDENCE` with zero candidates having nowhere to carry the question it owed — the pipeline destroyed the clarification in exactly the case that most needed one. The carrier is additive and the proposal contract version is **unbumped**, so every frozen L3-2…L3-2h artifact stays readable. Decision-criticality is `§34.2`'s rule lifted, not re-invented, and `L3_UNDECIDED_STATES` now has ONE definition shared by the validator and the binder so the two cannot drift. The refusal is non-fatal because `§34.2` is explicit that a superfluous question never touches the hazard — measured wrong first, when a fatal refusal discarded `C-CS-05`'s correct HYPOTHETICAL candidate | **ACTIVE — PROTECTED** | §40.3–§40.6; `hazlenz-l3-2i-clarification-carrier-2026-08-24/` |
| D-58 | L3-2i | **Candidate-conditioned and scenario-level clarification recall are TWO METRICS and are never renamed into each other.** Both definitions are written into every scorer artifact; high-consequence and false-ACTIVE scoring stay candidate-conditioned and unchanged | One number travelled through §37 and §38 meaning something narrower than it appeared (`D-56`). Keeping the old metric preserves what those phases actually measured (`UPDATE POLICY` item 4) while the new one carries the advancement claim; deleting or redefining it would rewrite history, and silently promoting it would repeat the confusion. Re-scoring both frozen providers changed **zero** pre-existing keys, and `TERMINAL_A`'s two pre-registered axes are computed by two scorers this phase did not modify — so the correction provably cannot reach it | **ACTIVE — PROTECTED** | §40.2; `rootcause/frozen-rescore-{qwen,gemini}.json` |
| D-59 | L3-2j | **The candidate-independent carrier is NOT activated in the shipped prompt or schema, and this is a MEASURED refusal, not an omission.** The L3-2i capability — contract field, validator codes, shared undecided-state vocabulary — stays byte-unchanged and fully tested; what is refused is the declaration that would make a provider emit one | `D-56`'s zero-candidate loss was measured on `V_S_STRUCT`, the structural representation, which is architecture-selection evidence and is not what ships. On the shipped ladder the question already rides a candidate **5/5**, reproduced by two harnesses ten days apart, so activation had nothing to gain — and cost: declaration rev 1 took high-consequence recall **12/13 → 9/13** and fired a question on a MUST-NOT-ASK scenario, rev 2 → **10/13** while using the carrier zero times in 24 scenarios, and the schema half alone still regressed `C-CS-05`. Three cross-process repeat pairs give a **0-difference** noise floor, so none of it is variance. Both rejected revisions are kept, with the sha256 each must reproduce pinned, because a rejection nobody can re-run is folklore | **ACTIVE — PROTECTED** | §41.1–§41.4; `hazlenz-l3-2j-carrier-activation-2026-08-24/` |
| D-60 | L3-2j | **The JSON schema is an INPUT and its KEY ORDER is part of it.** Every corpus artifact records `schemaSha256`, and the serialised shipped schema is pinned by assertion | Rebuilding a schema with one key **appended** where the original **inserted** it moved **six measured fields** across the corpus — two scenarios lost their candidate, three changed which carrier held the question — on a prompt whose sha256 was identical. The schema is sent to the provider as `format`, so key position changes the bytes the model is constrained by. A property-by-property assertion would not have caught it; a hash does | **ACTIVE — PROTECTED** | §41.6; `results/reproduction/harness-side-V_ACTIVATED_REV2.json` |
| D-61 | L3-2j | **A prompt change invalidates the locked L3-2h comparison until it is re-derived.** `L3_SYSTEM_PROMPT` may not be edited without re-running `V_B_LADDER` and `V_A_LADDER` and reporting the diff against the frozen L3-2g rows | The locked harness is byte-unchanged but reads the shipped prompt as `V_B_LADDER`, the baseline every L3-2g and L3-2h number is read against. Under the activated prompt it moved on **11 of 24** rows and lost two high-consequence cases; `V_A_LADDER` moved on 12. After the revert it reproduced the frozen rows with **zero** differences. §36.7 and §37 both measured how much prompt position moves behaviour, and this is the operational consequence stated as a rule rather than rediscovered by the next phase | **ACTIVE — PROTECTED** | §41.5; `rootcause/locked-under-activation/`, `rootcause/locked-restored-V_B_LADDER.json` |
| D-62 | L3-2j item (4) | **On the SHIPPED v6 ladder the two providers tie at ceiling on every clarification axis and on false ACTIVE, and the measured provider delta is TWO scenarios.** `gemini-3.1-pro-preview` and `qwen3-coder:30b` both score **5/5 candidate-conditioned and 5/5 scenario-level** clarification recall at **100% precision**, on the **same five scenario identities**, every one carried on a hazard candidate, with the proposal-level carrier used **zero times by either**. They differ on `F-WC-09` (high-consequence: 13/13 vs 12/13) and `C-CS-05` (order sensitivity: 0/24 vs 1/24). **`D-55` is NOT weakened and NOT rewritten — it is SCOPE-BOUNDED: its decisive axis, `CONDITIONAL_AND_ASSERTED`, is computed from `stateFacts` and DOES NOT EXIST on the shipped ladder, so `D-55` governs architecture selection and may not be cited as a shipped-path statement.** `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN` | §41.9 asked whether activation is provider-conditioned; it is not, so `D-59` is strengthened at `n = 2` rather than qualified. `B10` and `F-CL-01` — the two cases that DEFINED §39.5.1's zero-candidate defect — carry the question on a candidate for **both** providers, establishing from both directions that the defect belongs to the representation and not to a provider. `D-55`'s evidence was re-measured rather than assumed: a `V_S_STRUCT` **model-drift control** reproduces the frozen L3-2h figures (`CONDITIONAL_AND_ASSERTED` 0, incoherence 4.2% vs 4.3%, control-reading 5/6 with the same miss), differing on 2 of 24 rows against L3-2h's own 1/24 floor — so the preview label had not moved under the measurement. The shipped-path delta must be cited with two qualifications that cut opposite ways: Gemini's `thinkingLevel: low` still spent a mean **592 thought tokens per call** against qwen's none, and Gemini's noise floor is **instrument-dependent** (0/24 locked, 2/24 shipped-runner), though every floor difference sits on a `NEGATIVE_CONTROL` row and none on a clarification or high-consequence one | **ACTIVE — PROTECTED** | §42.1–§42.7; `hazlenz-l3-2j-cross-provider-closure-2026-08-24/` |
| D-63 | L3-2k | **`F-WC-09` is a provider-stage `ASSERTION_STATE_SELECTION` fault whose SHIPPED consequence is DELETION, not mislabelling — and the deterministic layer already holds the fact that would decide it.** qwen proposes ONE candidate on cleanly bound evidence, labels it **`CONTROLLED`**, passes the validator `VALID`, and is then **REJECTED by the semantic binder** (`SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE`), leaving `boundHazards: []` — the customer receives **no hazard at all** on a high-consequence scenario. Gemini labels the same candidate `ACTIVE`, survives the binder and delivers it. **`control-adequacy.ts` is recording-only by design (§36.4, `L3-INV-12`) and records `CONTROL_ABSENT / "strapped down"` on that very candidate.** | The recorded `HC (model-asserted) 12/13` (§41.2, §42.3) is a MODEL-TIER figure: no artifact in the programme had ever run `bindEvidenceSemantically`, which executes AFTER the validator at `reasoning-runner.ts:81`, so the severity was invisible rather than misreported. The `F-WC-03` control run in the same process on the same prompt produced the same `CONTROL_ABSENT` advisory and — because the model chose `ACTIVE` — was kept and delivered, which exonerates the binder as the ORIGIN and indicts it only as the AMPLIFIER: a **correct** refusal deletes the candidate rather than demoting it. Deterministic (13 of 14 recorded qwen ladder-family runs, plus 2 of 2 here) and NOT order-sensitive (`V_A_LADDER` also returns `CONTROLLED`). Exposure is bounded and measured: qwen chooses `CONTROLLED` on **1 of 24** scenarios, Gemini on **0 of 24**. §24 disposition `DEFECT_NONBLOCKING`. **Not repaired — remediation was not authorized, and `§22` forbids answering it by editing the binder to make one scenario pass** | **ACTIVE — PROTECTED** | §43.1–§43.2; `hazlenz-l3-2k-shipped-residual-rootcause-2026-08-24/rootcause/CASE_TRACES.json` |
| D-64 | L3-2k | **A GATE CONDITIONED ON THE CANDIDATE'S STATE IS DEFEATED BY ANY MOVE THAT CHANGES THAT STATE.** §34.2's clarification drop is exempt on `L3_UNDECIDED_STATES` by deliberate design. §41.3 recorded the **drop** form of the defeat (the candidate was removed, so the gate never fired); L3-2k measures the **demote** form (the candidate survives at `INSUFFICIENT_EVIDENCE` and the gate is inert for the same structural reason). `C-CS-05` under §36.7's one-block move: the question is raised **deterministically 4 of 4**, the state is demoted **1 of 4** on byte-identical prompts in separate processes, and the false question reaches the customer only when both occur | Two mechanically unrelated perturbations — a prompt declaration and a prompt-block move — defeat the same control by one route, which is why this is a rule and not an observation. **The gate is load-bearing, not lax**: on the same cohort its undecided-state exemption is exactly what lets all **5 of 5** `CLARIFICATION_REQUIRED` scenarios carry their legitimate question on both providers, and the vacuity control is MEASURED — in the three runs where the state returned `HYPOTHETICAL` the gate DID fire and suppressed the question. The two tiers must never be reported as one number: at the MODEL tier the difference is a deterministic FIELD-LEVEL difference (4/4), at the SHIPPED DECISION tier it is SEMANTIC DECISION VARIANCE (1/4); the hazard decision, false ACTIVE and high-consequence axes never move. §24 disposition `DEFECT_NONBLOCKING` — the shipped configuration is variant **B**, under which the failure does not occur in 4 of 4 runs. `C-CS-05` is the ONLY scenario in the cohort producing a `HYPOTHETICAL` candidate on either provider | **ACTIVE — PROTECTED** | §43.1, §43.3; `results/qwen/D_CS05_LADDER_{A,B}*.json` |
| D-65 | L3-2l | **A REFUSAL MAY DEMOTE TO AN UNDECIDED STATE ONLY WHERE THE REFUSAL ITSELF ESTABLISHED THAT THE DECISION IS OPEN — so `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` CONTINUES TO DELETE.** `checkStateSupported`'s `required` map covers only `CORRECTED`, `REMOVED_FROM_SERVICE`, `NEGATED`, `HYPOTHETICAL` and `CONTROLLED`; **`ACTIVE` is not in it**, and the code has never once refused an `ACTIVE` candidate in 84 firings across 1,871 records. It therefore cannot prevent a false `ACTIVE`, and delete-versus-demote moves a candidate between two non-asserting states — **a null move on every hard §29.8 gate, including the one that motivated the question.** `control-adequacy.ts` **remains recording-only** | §33.4's impression gate may demote because it establishes positively that *nothing was asserted* and raises `SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED` in the same breath, so demotion asserts nothing the check did not prove. `checkStateSupported` establishes only that the marker vocabulary is absent from the cited span; demoting there would assert *"the decision was not made"* — **false on 39 of 52 measured rows**, where the model's state is right and the binder's admission vocabulary simply cannot read a textbook lockout (`D02`, `B14`, `H-OF7`). That is deterministic SEMANTIC INFERENCE, not validation, and a conclusion the provider never proposed (`L3-INV-08`). Measured counterfactual over the whole open corpus: demotion recovers **0 of 7** high-consequence misses and introduces **39** preserved negative-control candidates and up to **31** unnecessary clarifications; re-derivation to `ACTIVE` closes the high-consequence axis and introduces **39 false ACTIVE**. **B and D are strictly dominated by A; C is forbidden by `L3-INV-08` and `L3-INV-04`.** Deletion is RETAINED, not exonerated — on four high-consequence identities (`E-FLD-147`, `X-WC-02`, `F-WC-03`, `F-WC-09`) the customer receives no hazard record at all — but that loss originates at `D-63`'s provider-stage state choice and **is not repairable at the binder** | **ACTIVE — PROTECTED** | §44.1–§44.5; `hazlenz-l3-2l-semantic-state-disposition-2026-08-24/inventory/DISPOSITION_ANALYSIS.json` |
| D-66 | L3-2m | **HOSTED INFERENCE IS AUTHORIZED IN PRINCIPLE AS AN INTERNAL HazLenz REASONING COMPONENT — the §31.2 / §10 privacy boundary is ADJUDICATED and is no longer the binding gap.** HazLenz remains the customer-facing system; the hosted model is an internal reasoning dependency and **does not become customer-authoritative**. `L3-INV-01`…`L3-INV-12`, the deterministic validator, the semantic binder, evidence binding, regulatory governance and every customer-facing safety control remain in force. **This authorizes NO provider, NO model, and NOT the sealed run** — §29.8 keeps the single-use acceptance corpus a separate explicit decision, and `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN` | §42.10, §43.8 and §44.7 each handed back the same unadjudicated policy question, and three engineering phases correctly refused to answer it with measurement. It is a product/policy call and the user made it. Recording it as a decision rather than folding it into a phase result is what stops a fourth phase re-deriving that the gap is not measurable. **What a hosted provider actually receives is inspector-authored narrative prose**: §31.2's exclusion is structural at the FIELD level, and the second-layer redactor is PATTERN-based over seven rules (`email`, `phone`, `ssn`, `street_address`, `mine_id`, `employee_id`, `url`) which cannot catch a personal name or an informal site reference. That is the module's documented scope, and it is what changes meaning once the destination stops being `127.0.0.1` | **ACTIVE — PROTECTED** | §45.1, §45.5; `hazlenz-l3-2m-hosted-inference-policy-2026-08-24/` |
| D-67 | L3-2m | **THE FINAL SEALED ACCEPTANCE RUN IS BLOCKED ON PROVIDER MODEL IDENTITY: there is NO stable non-preview Gemini Pro at the measured tier, and NO Gemini model of any tier is pinnable by content digest.** Measured from the provider's own catalogue (`GET /v1beta/models`, 1 request, credential header only, ZERO content): **50 models, 37 supporting `generateContent`**, and **exactly three assert stability in their own description — `gemini-2.5-pro` @ `2.5`, `gemini-2.5-flash` @ `001`, `gemini-2.5-flash-lite` @ `001`, all the 2.5 generation.** Every 3.x Pro text model is a preview at `3.1-pro-preview-01-2026`; the stable 3.x models are Flash tier only and assert no stability; `gemini-pro-latest` and its siblings are silently updated by definition. **`D-62`'s entire result is a `gemini-3.1-pro-preview` fact**, so the preview branch fails `P-07` and the stable branch has zero measured evidence — and §29.8 spends the corpus ONCE | `P-07` requires an addressable, non-silently-updated model id *because a silent model change would invalidate a passed gate*. Neither branch survives that: a preview dated 01-2026 against a catalogue now at 3.7 cannot carry a defensible acceptance result, and a blind run on an unmeasured stable model spends a single-use asset on an unknown. **Google was ALSO never scored against `P-01`…`P-14`** — `PROVIDER_SELECTION.md` scored only Anthropic Claude and the local model and records `GEMINI_API_KEY` as unset; Google entered at §39 purely as the architecture-selection comparator `D-55` fenced. **And there is no production hosted path at all**: `reasoning-l3` declares only `L3_OLLAMA_*`, `backend/src` contains zero hosted references and `backend/package.json` zero hosted SDKs — every Gemini measurement came through the verification-only shim outside `backend/src`. **`P-05` binds the acceptance run and not only production: a provider that trains on submitted data would contaminate the single-use corpus permanently.** The minimum action is `PROVIDER_REQUIREMENTS.md`'s own never-executed steps 1–3, which measure the PROVIDER and not HazLenz | **ACTIVE — PROTECTED** | §45.2–§45.6, §45.8; `provider/GEMINI_MODEL_CATALOGUE.json` |
| D-68 | L3-2n | **HOSTED DATA HANDLING IS SATISFIABLE AND IS NOT THE BLOCKER — but the gate is TIER-CONDITIONAL.** `P-05` PASSES on the **paid** tier (*"Google doesn't use your prompts…or responses to improve our products"*) and **FAILS on the free tier**, where content improves Google products and *"human reviewers may read, annotate, and process your API input and output"*. `P-06` PASSES: paid-tier abuse-monitoring retention is a **stated 55 days**, held separately and not used to train any model beyond policy enforcement, and **Zero Data Retention is available on approved request** for paid projects, clearing all user content and identifiable metadata before logging. **HazLenz uses none of the ZDR-incompatible features** (Search/Maps grounding, Interactions API, File API, explicit caching) | §42.10, §43.8 and §44.7 each deferred this and `D-66` adjudicated it only in principle; this is the documented evidence, every assertion carrying a source URL and a 2026-08-24 retrieval date as `PROVIDER_REQUIREMENTS.md` demands. **A billing-enabled project is therefore a PRECONDITION, not a preference** — the same credential on an unpaid project would place customer observation text into model improvement, which `D-66`'s authorization explicitly forbids | **ACTIVE — PROTECTED** | §46.1; `provider/OFFICIAL_DOCUMENTATION.md`, `provider/P01_P14_SCORECARD.md` |
| D-69 | L3-2n | **NO CURRENTLY CALLABLE STABLE HOSTED MODEL MEETS THE REQUIREMENTS: the only stable Pro is NOT CALLABLE, and the stable Flash models fail `P-02`.** `gemini-2.5-pro` returns **HTTP 404 — *"no longer available to new users … use models/gemini-3.1-pro-preview"*** on all 48 cohort calls, while a `gemini-3.7-flash` control returned 200 in the same probe. `gemini-3.7-flash` reaches **71%** schema-contract validity and `gemini-3.6-flash` **83%**, against `P-02`'s **≥99%** bar; **every** rejection is `UNGROUNDED_CORRECTIVE_ACTION`, and **6 of 7** reproduce across two isolated processes so the permitted single retry cannot be assumed to rescue them. **MODEL tier is 13/13 for both** — the corrective-action field takes a correct proposal down with it, costing 5–6 high-consequence findings. **`F-WC-09`, `F-WC-03` and `C-CS-05` are ALL CORRECT on both stable Flash models** through the full binder path, so **`D-63`'s residual is a `qwen` property that reproduces on no Gemini model tested** | `LISTMODELS PRESENCE IS NOT CALLABILITY, AND A DOCUMENTED "STABLE" LABEL IS NOT AVAILABILITY` — both must be probed, which is `D-67` in operational form and stronger than the documentation reading that produced it. The validator rule is `L3-INV-02` applied to corrective action, §29.6 specifies rejection on contract violation, and **two other providers satisfy it at 23 of 24**, so under §22 and §24 this is **provider non-conformance with a correct pre-existing contract — not a HazLenz defect and not a reason to weaken the validator.** Every model ties at ceiling on false ACTIVE (0/11) and both clarification denominators (5/5, 5/5, 100%), so the separation is entirely at the validator. Measured on the SAME instrument as `D-62` — schema `a522cf5a`, prompt `b8cc50fc` v6, shim `0ba265bb` — under §38.3 isolation, on already-open material only | **ACTIVE — PROTECTED** | §46.2–§46.4; `hazlenz-l3-2n-provider-qualification-2026-08-24/results/` |
| D-70 | L3-2o | **ANTHROPIC `claude-sonnet-5` CLEARS EVERY REQUIREMENT THAT DISQUALIFIED GEMINI, AND PRODUCES THE BEST REASONING RESULT ON RECORD.** `P-05` PASSES **unconditionally** on the Commercial Terms (*"Anthropic may not train models on Customer Content from Services"*) rather than on a billing tier as `D-68` required; `P-06` PASSES at a stated **30 days** with **ZDR available on request**, the Messages API explicitly ZDR-eligible and `claude-sonnet-5` **not** a 30-day Covered Model; `P-07` PASSES on *"Every Claude model ID is a pinned snapshot … not an evergreen pointer"*, Active, retirement *"not sooner than June 30, 2027"*, ≥60 days' notice; `P-12` PASSES by **measurement** — Models API 200 and Messages 200. **MODEL tier 13/13 and VALIDATED tier 13/13 on BOTH isolated runs** — the only stable, callable model to reach the validated ceiling, tying the disqualified `gemini-3.1-pro-preview` and beating both stable Flash models by 3–6 high-consequence findings | **`D-67`'s blocker is NOT a permanent property of hosted inference** — a hosted provider can satisfy `P-07`, which no prior phase had evidence for. §45.4's separate ceiling stands unchanged: a pinned-snapshot label is still not a content digest. Scored from **current official documentation with source URL and 2026-08-24 retrieval date for every mutable claim**, and measured on the SAME instrument as `D-62` and `D-69` — schema `a522cf5a`, prompt `b8cc50fc` v6, cohort 24/24 with 0 disagreements — under §38.3 isolation, on already-open material only. The `P-05` claim carries one unverifiable precondition: the organization behind the credential must be under those Commercial Terms | **ACTIVE — PROTECTED** | §47.1–§47.2; `hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/provider/` |
| D-71 | L3-2o | **ANTHROPIC IS STILL NOT QUALIFIED: `claude-sonnet-5` FAILS `P-02` ON A REPRODUCING REJECTION.** Schema-contract validity is **23/24 = 95.8%** (run A) and **22/24 = 91.7%** (run B) against `P-02`'s **≥99%** bar. The rejection common to both runs — `F-COR-01`, `UNGROUNDED_CORRECTIVE_ACTION` — **reproduces across two isolated processes**, so the permitted single retry cannot be assumed to rescue it. A second, non-reproducing rejection (`F-NC-01`) appears in run B only. **Both Anthropic rejections land on `DECIDED_NON_ACTIVE` rows, so NO high-consequence finding is lost** — the validated tier stays 13/13, where the same code cost `gemini-3.7-flash` 5–6 findings | **The verdict does not depend on how `P-02` is read** — strict numeric (95.8% < 99%) and `D-69`'s applied reading (a non-reproducing rejection is rescued by retry, a reproducing one is not) **both give FAIL**. The ≥99% bar was NOT moved and nothing in HazLenz was changed to make Anthropic pass. The mechanism is `D-69`'s, not a new one: `L3-INV-02` applied to corrective action, §29.6 rejects on contract violation, and two providers satisfy it at 23/24 — **provider non-conformance with a correct pre-existing contract under §22/§24, not a HazLenz defect and not a reason to weaken the validator.** The three transport strips were proved benign: across all 51 rows, occurrences of every code they could have caused are **zero** | **ACTIVE — PROTECTED** | §47.2, §47.6; `hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/results/` |
| D-72 | L3-2o | **`P-08` FAILS STRUCTURALLY: ON CLAUDE 4.7 AND LATER THERE IS NO DETERMINISM CONTROL AT ALL.** `temperature`/`top_p`/`top_k` are deprecated and *"Return a 400 error when set to a non-default value"*, and there is **no `seed` parameter** — so the harness's `temperature: 0` and `seed: 20260822` are **inexpressible**, not discarded by choice. Measured consequence: **6 of 24 rows differ across two isolated processes**, against 0/24–2/24 for `D-62`, 2/24 for `gemini-3.7-flash` and 3/24 for `gemini-3.6-flash` — **the worst reproducibility of any provider measured**. Separately, **clarification precision discriminates for the first time**: `B08` asks a question it should not on **both** runs, giving **5/6 = 83%** where every model in `D-62` and `D-69` tied at 5/5 | `DO_NOT_REDISCOVER`. `P-08` exists because *"evaluation must be re-runnable"*; this is a property of the provider surface, not of sampling luck, and no client setting removes it. **It may make `P-08` unobtainable from any current hosted model** as frontier providers withdraw sampling controls — if so, `PROVIDER_REQUIREMENTS.md` itself needs a decision, and **changing a requirement is the user's call, never a response to a provider failing it.** The instability lands in the same clarification/uncertainty cohort §38.4 identified, now corroborated at **n = 3 providers**. All figures were taken at **provider defaults** (adaptive thinking, effort `high`); lower effort levels are supported and **untested**, and tuning them to obtain a pass was not attempted | **ACTIVE — PROTECTED** | §47.3–§47.4; `hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/results/SCORE.txt` |

---

## 19 — FILE / MODULE OWNERSHIP MAP

One concept, one home. Before adding a concept, check whether it already has an owner here.

| Responsibility | Owner | Do not duplicate |
|---|---|---|
| **Candidate standards selection / ranking (Path A)** | `backend/src/applicable-standards/applicable-standards.service.ts` | Do not add a second ranking or a governance filter upstream of it |
| **Structured citation identity** | `backend/src/applicable-standards/citation-structure.ts` | Never compare citations by string prefix anywhere else |
| **Governed candidate records (the governed source of truth)** | `backend/src/standards/releases/governed-source-set.ts` | Never derive a governed record from a `standards_master` row |
| **Source → `standards_master` row projection** | `backend/src/standards/seed/standards-intelligence-projection.ts` | One projection. The sync script and the governed source set import the same functions |
| **Release membership** | `backend/src/standards/releases/release-definition.ts` + `definitions/*.json` | Never infer membership from database contents |
| **Governed release construction** | `backend/src/standards/releases/governed-release-builder.ts` | Contains no write to `standards_master`, and `assertNoLegacyCorpusWrites()` enforces it |
| **Protecting the legacy corpus from the seed pipeline** | `backend/src/standards/seed/legacy-corpus-guard.ts` | One guard, at stage 1, no override |
| **Operator release commands** | `backend/scripts/regulatory-release.ts` | The only reviewed activation/rollback path. No HTTP route |
| **Evidence extraction from observation text** | `backend/src/safescope-v2/evidence/shared-evidence-facts.ts` | One extractor; negation tested first |
| **Per-finding regulatory rules / applicability** | `backend/src/safescope-v2/evidence/evidence-foundation.ts` | Citation selection on Path B lives **only** here |
| **HazLenz orchestration + Path B hydration** | `backend/src/safescope-v2/safescope-v2.service.ts` | |
| **Content backing decision (both paths)** | `backend/src/standards/display/standards-backing-contract.ts` → `resolveStandardsBacking()` | **The single decision point.** Two call sites only |
| **Customer finding presentation** | `backend/src/safescope-v2/display/guided-finding-response.ts` | Re-derives backing only as a `??` fallback |
| **Cutover mode + enablement** | `backend/src/standards/cutover/cutover-mode.ts` | **Imports nothing.** The only file that reads cutover configuration |
| **Fallback decision table** | `backend/src/standards/cutover/fallback-contract.ts` | Pure; 84 rows; regenerate the matrix rather than hand-editing it |
| **Governed resolution + release pin** | `backend/src/standards/cutover/governed-resolution.ts` | |
| **The seam (context, memo, provenance accumulator, display projection)** | `backend/src/standards/cutover/governed-cutover-context.ts` | `projectGovernedDisplay()` and `customerVisible` live here |
| **Request-path orchestration (KG-4D)** | `backend/src/standards/cutover/shadow-request-orchestration.ts` | **The ONE boundary.** Authorization, kill switch, breaker, invariance hash, provenance check, telemetry and metrics are decided here — never in a HazLenz service |
| **Analysis/finding provenance composition** | `backend/src/standards/cutover/governed-provenance.ts` | |
| **Cutover observability** | `backend/src/standards/cutover/cutover-observability.ts` | Categorical, privacy-guarded, silent by default |
| **Shadow classification + telemetry** | `backend/src/standards/cutover/shadow-comparison.ts` | One classification engine; regime canonicalisation lives here |
| **Approval / provenance contract** | `backend/src/standards/releases/approval-contract.ts` | `canonicalDigest()`, both axes, `APPROVAL_CONTRACT_VERSION` |
| **Reviewer approval + drift + carry-forward** | `backend/src/standards/releases/release-record-review.service.ts` | Append-only; no bulk approval path |
| **Release manifest identity (v1)** | `backend/src/standards/releases/release-manifest.ts` | **Do not change `digest()`** |
| **Release lifecycle / active pointer** | `backend/src/standards/releases/regulatory-release-lifecycle.service.ts` | |
| **Governed corpus lookup** | `backend/src/standards/releases/governed-corpus-lookup.ts` | Reached only through the cutover context |
| **Release finalization** | `backend/src/standards/seed/finalize-regulatory-release.ts` | Stamps manifest **and** approval identity from the same in-memory normalized row |
| **Persistence + server provenance gate** | `backend/src/inspection/inspection.service.ts` → `resolveKnowledgeReleaseId()` | The gate lives here, not in a controller |
| **Report provenance** | `backend/src/reports/canonical-reports.service.ts` → `knowledgeProvenance()` | Derived from persisted finding rows |
| **Report rendering** | `backend/src/reports/canonical-report-pdf-renderer.ts` → `renderInspectionReportPdf()` | The ONLY place report pages are drawn. Projects a **closed allowlist** of snapshot fields; never spreads, serialises or enumerates the snapshot — which is what keeps governed state off the page structurally (§16, KG-4E) |
| **Production environment refusal** | `backend/src/config/validate-production-environment.ts` | |
| **Standard Detail display** | `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` + `frontend-next/lib/inspection/standardDisplay.ts` | Never surface internal governance vocabulary |

---

## 20 — DO NOT REDISCOVER

Settled questions. Do not re-derive, do not re-litigate, do not "improve" without new contradicting
evidence.

| Question | Answer | Where |
|---|---|---|
| Should governance filter **before** semantic ranking? | **NO** — after ranking, dedup, jurisdiction filter and truncation | D-23 |
| Can approved content upgrade applicability confidence? | **NO** — independent axes, proven by two executable predicates | D-06, §5.11 |
| Can a section's approval silently back a child citation? | **NO** — `APPROVED_SECTION_ONLY` confers nothing | D-08, §9 |
| Can a child's approval promote to its parent (or vice versa)? | **NO** | D-08 |
| Can a client-posted `knowledgeReleaseId` establish provenance? | **NO** — the server must independently agree on mode *and* active release | D-26 |
| Is SHADOW allowed to change the payload **shape**? | **NO** — adding a key is altering customer output | D-31 |
| Are all declared citations cutover prerequisites? | **NO** — unemitted declarations are backlog, not blockers | §8.4 |
| Can mutating suites share evidence-bearing databases? | **NO** — own it or don't write to it | D-37, §11 |
| Should high corpus usage justify approval? | **NO** — approval is clause-by-clause review against the source | §8.3 |
| May a neighbouring approved citation be substituted for the requested one? | **NO** — `resolvedCitation === requestedCitation` always | D-30, §5.10 |
| May governance suppress a citation HazLenz emitted? | **NO** — there is no `SUPPRESSED` delivery state | D-25 |
| Should the throttle be relaxed so a verification suite can run? | **NO** — pace inside it, or refuse the response | D-35, §13.3 |
| Should `source_url` invalidate an approval when it changes? | **NO** — `source_document_checksum` carries that safety argument | D-15 |
| Should historical NULL approvals be backfilled? | **NO** — NULL means *predates the contract*, and is load-bearing | D-17 |
| Is there a bulk approval path? | **NO**, and there must not be | D-17 |
| Is `GOVERNED_STRICT` a candidate for the customer default? | **NO** — not while emitted-approved coverage is 23/160 | D-29 |
| May `release-manifest.ts::digest()` be changed to sort keys? | **NO** — it would move every finalized manifest checksum | D-16 |
| Is `test:kg3f-customer-path-disconnection` still the authority on default-off? | **NO** — superseded by `test:kg4b-default-off` / `test:kg4a-default-off` | D-38, §13.4 |
| Is the MSHA-TRAFFIC-01 30/31 score a regression? | **NO** — adjudicated regulatory correction; keep it | D-19 |
| Are the two HazLenz core failures new? | **NO** — pre-existing, byte-identical, and the only two | §13.1 |
| May the shadow acknowledgement authorize governed delivery? | **NO** — it authorizes `SHADOW` and nothing else | D-39 |
| Should a kill switch require an exact value? | **NO** — brakes are permissive; only locks are exact | D-40 |
| May a stage promote itself once metrics look good? | **NO** — every stage is a separate human decision | D-41 |
| Is an INDETERMINATE invariance check a pass? | **NO** — it is a hard violation | D-43 |
| Should shadow events get a production database table? | **NO** — not until a query exists that logs genuinely cannot serve | D-44 |
| May a cohort be keyed on email or name? | **NO** — opaque server-side ids only | D-46 |
| Is an unmarked `test_*` database safe for a mutating suite to claim? | **NO** — that is exactly how KG-4C destroyed KG-4B's corpus | D-47 |
| May a reviewer approve a record because shadow surfaced a mismatch? | **NO** — that makes usage the basis for approval | runbook |
| Were the auth/classify throttles changed for KG-4C or KG-4D? | **NO** — and SHADOW adds zero externally rate-limited calls |
| In SHADOW, is the payload the customer receives the shadow one? | **NO** — it is the pristine legacy run; shadow invisibility is structural | D-50 |
| May shadow logic be imported directly by a HazLenz service? | **NO** — only through the orchestration boundary | D-51 |
| Is "seven unobserved mismatch categories" correct? | **NO** — the measured figure is **eleven** | §13.7 |
| Can an equality oracle be trusted without a per-observation non-vacuity floor? | **NO** — three slices running have been fooled by comparing two broken observations | §13, KG-4D | `kg-4c/WORKLOAD_AND_SINK.md` |
| Does the report PDF surface governed or shadow state? | **NO** — the renderer projects a closed field allowlist; poisoning 38 governed/shadow fields leaves 33/33 reports byte-identical | KG4E-D1, §16 |
| Should LEGACY and SHADOW PDFs be compared byte-for-byte? | **NO** — two inspections carry different uuids and PDFKit stamps a timestamp and a random `/ID`; derive volatility instead | KG4E-D2 |
| May a derived volatility set be a set of literal VALUES? | **NO** — it must be positions or roles; a third run carries a third value | KG4E-D3, §13.12 |
| Does dropping the four approval-contract columns reproduce the `STALE_SCHEMA` failure? | **NO** — the resolver never reads them; the migration must be absent in full | §13.15 |
| Is `GET /inspection-reports` returning full snapshots a SHADOW leak? | **NO** — pre-existing, mode-independent, and NULL under SHADOW; still an `OPEN_ITEM` | §13.14 |
| Does governed release membership require enumerating the whole legacy `standards_master`? | **NO** — membership is explicit by `citationKey` in a version-controlled definition | §21.1, `KG5B-D2` |
| Does governed release construction require mutating the legacy corpus? | **NO** — `assertNoLegacyCorpusWrites()` enforces it executably; measured 0 rows changed on a 2,390-row corpus | §21.2, `KG5B-D1` |
| Does deterministic governed release identity depend on incidental legacy corpus contents? | **NO** — manifest `14a34fea…` reproduces byte-identically on an EMPTY corpus and on a production-shaped one | §21.1, `KG5B-D4` |
| Is `KG5B-DISC-01` a generic content-difference blocker? | **NO** — all 15 are `GOVERNED_REVIEWED_RENDERING`; the pairing was right and the classification too coarse | §25, `KG5C-D2` |
| Should governed content be made byte-identical to legacy content? | **NO** — that replaces a reviewed artifact with an unreviewed ingest under a "Verified" badge | §25, `KG5C-D5` |
| Is approved governed customer delivery something other than the exact reviewed artifact? | **NO** — 27/27 byte-for-byte the frozen `payload.canonicalText`; never expanded back into legacy content | §21.4, `KG5C-D5` |
| May unreviewed governed content be delivered to customers? | **NO** — withheld; 8/8 preserve legacy behaviour. Delivering it is `REVIEW_STATE_VIOLATION` | §21.4, §26 `KG5C-OPEN-02` |
| Do Path A and Path B expose the same content representation? | **NO** — intentionally different (`standard_text` 56,026 B vs `plain_language_summary` 500 B for `1910.1200`). A length difference is not a defect | §21.5, `KG5C-D1` |
| May a subsection citation silently collapse to its base citation? | **NO** — `normalizeCitationForLookup` accepts a base match only when the request has no subsection; the 12 `LEGACY_UNRESOLVED` are correct behaviour | §21.6 |
| Is the 3 of 8 unreviewed records classifying `CONTENT_DIFFERENCE` a defect? | **NO** — the classifier is correctly refusing to bless unreviewed content; expected until review occurs | §26 `KG5C-OPEN-02` |
| Does a failing test identify the component to modify? | **NO** — it demonstrates a symptom. Establish the contract and the owner first | §22, §23 |
| Does a non-blocking defect expand the current release gate? | **NO** — only a verified `BLOCKER` does | §24 |
| Is "zero byte differences" the success criterion for production SHADOW? | **NO** — it contradicts the verified KG-5C architecture and creates pressure to un-review content | §27.5 |
| Does completing SHADOW authorize CUTOVER? | **NO** — a separate explicit human decision, and `KG4E-DISC-03` must be closed first | §27.5, §26 |
| Does `READY_FOR_CONTROLLED_PRODUCTION_SHADOW` mean SHADOW may begin now? | **NO** — operations 1–11 are unexecuted; no governed release exists in production | §0, §27.7, §26 `STAGE1-OP-01` |
| Is the 317/319-byte longest production log line evidence that Render truncates? | **NO** — it is a property of what this app currently logs; it is neither a counter-example nor a confirming example | §17.4, `KG5D-D2` |
| Is a single controlled production SHADOW event needed to prove log transport? | **NO** — and it is currently *impossible*: the live commit contains no `standards/cutover/`. Use abort gate **G1** instead | §17.4, §27.8, `KG5D-D3` |
| Do the frozen Stage-1 hypotheses require resolver-path attribution? | **NO** — `H4`/`H7` already say the guarantee is structural, and on the classify path every observation is Path B | §26 `KG5D-DISC-01`, `KG5D-D1` |
| Can a citation resolved on both paths in one analysis emit a duplicate `eventKey` in production? | **NO** — Path A never receives a cutover context on any route; measured 0 duplicates over 80 real events | §26 `KG5D-DISC-01` |
| Is `minimumSample: 200` the Stage-1 evidence requirement? | **NO** — it is the floor below which a **stop** threshold may not trip. Stage-1's own requirement is coverage | §26 `KG5D-DISC-03`, §27.8, `KG5D-D4` |
| Should the 200/500 floors be lowered so a small Stage-1 can pass? | **NO** — they are preserved unchanged; they were never a Stage-1 gate, so nothing needs lowering | §26 `KG5D-DISC-03` |
| Would 200 repeated requests be better Stage-1 evidence than a 40-comparison structured corpus? | **NO** — repetition inflates a denominator without adding an independent observation | §27.8, `KG5D-D5` |
| Is `regulatory_releases` existing in production a sign of partial KG-2 readiness? | **NO** — it is the pre-lifecycle shape from `1800000004000` with **no active-pointer column** | §17.4 |
| Is `users` (plural) the production account population? | **NO** — `"user"` (singular) is the live auth table; `users` is a vestigial 1-row table | §17.4 |

---

## 21 — CONVERGED ARCHITECTURE (KG-1 → KG-5C)

`STABLE_INVARIANT` unless marked otherwise. This section describes **the system that exists**, not
the sequence that produced it. It supersedes any older prose in §§5–16 that disagrees with it. Where
a number is cited, its evidence lives in the phase named beside it; do not re-derive it.

### 21.1 Governed source architecture

The governed release source is **explicit** and independent of incidental legacy corpus membership:

```
governed-source-set.ts          version-controlled, ZERO database access
  → release-definition.ts       explicit membership, named by citationKey
    → definitions/*.json        reviewable in a diff, identical on every machine
      → session-scoped PostgreSQL TEMP staging   (ON COMMIT DROP, inside the txn)
        → regulatory_release_records             immutable snapshot rows
          → deterministic release manifest       release-manifest.ts, UNCHANGED
```

**Governed membership is explicit by `citationKey`.** `KG5B-D2`.

**The live legacy `standards_master` corpus is NOT the governed release membership authority.**
Before KG-5B the only representation of a governed standard was a row in the same table serving
2,390 legacy customer-facing rows, so building a release *required* writing into the live customer
corpus and snapshotting the whole table. That is the root cause `KG5A-DISC-01` recorded, and it is
architecturally closed — not merely guarded against.

**The manifest is reproduced, not redefined.** `14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`,
35 records — byte-identical on an EMPTY corpus and on a 2,390-row production-shaped corpus, and
identical to KG-4A's. The release definition **pins** the manifest and all 35 record checksums, and
construction **refuses rather than adjusts** when a pin does not reproduce (`KG5B-D4`). A pin that
could be satisfied by adjustment is not a verification.

### 21.2 Legacy corpus isolation `STABLE_INVARIANT`

> **Governed release construction must not rewrite, normalize, rename, reseed, restamp, enumerate
> for membership, or otherwise mutate the legacy customer-serving corpus.**

Enforced executably, not documented: **`assertNoLegacyCorpusWrites()`**
(`governed-release-builder.ts`) is applied to every statement the builder issues. It permits
`SELECT` against `standards_master` and refuses `INSERT` / `UPDATE` / `DELETE`.

Measured on a 2,390-row production-shaped corpus (KG-5B): row count, per-row digest, citations,
titles, `standard_text` and source metadata all unchanged; **0** rows gained `source_key`,
`release_id`, `normalized_record_checksum` or `transformation_version`; **0** duplicate
`(agency_code, citation)` pairs; **0** legacy rows read for membership.

The second half of the isolation is `legacy-corpus-guard.ts`: the old seed pipeline still exists
(a dozen verification suites need it for clean disposable databases) but **refuses before its first
write** on any corpus holding regulations the governed source set does not name. It sits at **stage
1**. `KG5B-D5` — *a guard placed after the first mutation is not a guard*; its first placement at
stage 2 let stage 1 rewrite three live rows first.

### 21.3 Immutable release / review architecture

| Concern | Mechanism | Owner |
|---|---|---|
| Immutable release records | `regulatory_release_records` — frozen `payload` + `recordChecksum` + the four approval-contract digests | `regulatory-release-record.entity.ts` |
| Deterministic manifests | `release-manifest.ts::digest()` — **never change it** (`D-16`) | `release-manifest.ts` |
| Checksum-bound review | a decision binds to an exact record version by checksum/digest | `release-record-review.service.ts` |
| Append-only reviewer decisions | nothing is rewritten or deleted; supersession is `supersedesDecisionId` | same |
| Effective review state | derived from the append-only log, never a mutable flag | `review-state.ts` |
| Release finalization | stamps manifest identity **and** approval identity from one in-memory normalized row | `finalize-regulatory-release.ts` |
| Explicit activation | exact release id + expected manifest + expected current pointer + named actor | `regulatory-release.ts` CLI |
| Explicit rollback | exact target + expected current pointer | same |
| Active-release pointer | read **once** per analysis and pinned (`D-27`) | `regulatory-release-lifecycle.service.ts` |
| Release lifecycle audit | `knowledge_release_events` | `knowledge-release-event.entity.ts` |

There is **no** `activate --latest`, no prefix matching, no fuzzy lookup, no automatic release
creation, and no `publish` verb bundling prepare/approve/finalize/activate. `--dry-run` performs
zero writes and emits no lifecycle event. **The expected-pointer precondition is re-checked inside
the transaction under `pg_advisory_xact_lock`** (`KG5B-D6`) — checked outside, two operators on the
same stale reading both passed and both committed.

**There is no bulk approval path, and there must not be** (`D-17`).

### 21.4 Customer delivery architecture (KG-5C) `STABLE_INVARIANT`

> **Approved governed content: reviewed governed artifact → governed resolver → the EXACT reviewed
> customer artifact. The customer path must NOT expand approved governed content back into a larger
> unreviewed legacy representation.**

`verifiedText` is non-null only when `decideFallback()` sets `textIsVerified`, which only
`APPROVED_EXACT` sets; `mark()` applies it *after* the hydration spreads, so it wins. The "Verified
standard text" badge is therefore reachable only through a reviewer decision bound to that record's
exact checksum. **This required no code change — the architecture already implemented it.**

**Unreviewed governed candidates remain withheld from governed customer delivery and preserve legacy
behaviour.** An unapproved record resolves `UNAPPROVED_RECORD`, delivers legacy text unchanged,
carries no badge and records no provenance.

Measured, KG-5C:

| | Result |
|---|---|
| approved records delivering byte-for-byte the reviewed artifact | **27 / 27** |
| unreviewed records preserving legacy-identical fallback | **8 / 8** |
| emitted gold-set citations proven end to end | **23 / 23** |
| approved badges on content that is not the reviewed artifact | **0** |
| unreviewed records presented as approved | **0** |
| fallbacks that altered customer output | **0** |

### 21.5 Resolver paths — two, and they deliver different representations `STABLE_INVARIANT`

Both are real customer paths. Testing one would describe text the other's customer never sees.

| Path | Route | Legacy body the customer reads | Measured, `1910.1200` |
|---|---|---|---|
| **A** | `ApplicableStandardsService.suggest()` | `standard_text` — the full eCFR ingest, from `suggest()`'s own corpus SELECT | **56,026 B** |
| **B** | `hydrateFindingScopedStandards` → `mark()` | `plain_language_summary` — `mark()` spreads `title`, `plainLanguageSummary` and source metadata from hydration but **deliberately not `standardText`** | **500 B** |

> **A byte-length difference between `standard_text` and `plain_language_summary` is NOT a defect.**
> They are different representations serving different surfaces. Treating the difference as a defect
> is how `KG5C-FIX-01` was created one tier up and how KG-4B's third instrumentation defect was
> created before that.

### 21.6 Citation identity `STABLE_INVARIANT`

`normalizeCitationForLookup` (`applicable-standards.service.ts`) **preserves the agency prefix and
the subsection**, and accepts a base-key match **only when the requested citation carries no
subsection**:

```ts
const exactMatch = parsed.key ? exactRegistry.get(parsed.key) : undefined;
const baseMatch  = !parsed.hasSubsection && parsed.baseKey ? baseRegistry.get(parsed.baseKey) : undefined;
```

**Subsections are significant. A subsection request must not silently fall back to a base citation
merely because the base citation exists.** Measured consequence: a subsection-level request such as
`29 CFR 1926.451(g)(1)` resolves **no** legacy row when the corpus holds only the section — 12 of
the 27 approved records are `LEGACY_UNRESOLVED` and render `CITATION_ONLY` today. That is correct
behaviour, not a resolver defect. It composes with `§5.7`/`§5.8` (structural comparison, parent/child
granularity) and `D-08`.

### 21.7 SHADOW and CUTOVER control boundaries `STABLE_INVARIANT`

| | State | Meaning |
|---|---|---|
| **Current customer authority** | **`LEGACY`** | Every production customer response is produced by the legacy path. This is the authority, not a default awaiting promotion. |
| **Production SHADOW** | **OFF — never run** | Observational only. Must not alter customer responses. Runs the pipeline four times and returns the **pristine** legacy run, always (`D-50`). |
| **CUTOVER** | **OFF — separate authorization boundary** | Not authorized by SHADOW completing, and not authorized by this document. |

**Completion of the KG convergence/readiness work does NOT authorize either operation.** The
shadow acknowledgement authorizes `SHADOW` and nothing else (`D-39`); acknowledging a
customer-invisible comparison is never reusable as consent to change customer output.

---

## 22 — `ROOT_CAUSE_BEFORE_REMEDIATION` `PROTECTED_DECISION` / `STABLE_INVARIANT`

> ### A failing test, comparator, harness, customer-path observation, or production SHADOW discrepancy demonstrates a SYMPTOM. It does NOT by itself identify the component that must be modified.

This rule has the same force as any `PROTECTED_DECISION` in §18. It exists because the programme's
most expensive failures were loops, not bugs:

```
   FORBIDDEN                          REQUIRED
   observation                        observation
     → edit                             → contract
       → rerun                            → root cause
         → different observation            → architectural owner (§23)
           → edit again                       → smallest correct remediation
                                                → boundary proof
                                                  → documentation
                                                    → closure
```

### The required sequence

Before any implementation change:

1. **Identify the violated contract.** Name it. "The test is red" is not a contract.
2. **Identify the authoritative layer that owns that contract** — §23.
3. **Determine what actually violates it**: the implementation, the source data, the review state,
   the resolver, the presentation layer, or the instrumentation.
4. **Modify only the owning layer**, unless evidence proves a cross-layer change is required.
5. **Verify the correction at the boundary where the contract is observable** — not at the layer
   that happened to be convenient to assert on.

### The prohibitions

* **Do not modify correct upstream or customer-facing behaviour to satisfy incorrect downstream
  instrumentation.** If executable evidence proves the implementation satisfies the documented
  contract but a test or comparator disagrees, **repair the test or comparator** and classify the
  finding `INSTRUMENTATION` (§24).
* **Do not reopen a protected architectural conclusion without new contradictory evidence** — §25.
* **Do not make multiple speculative edits across layers to make a metric turn green.** Patching two
  layers at once means ownership was never established.
* **Do not weaken an invariant, a threshold, a predicate or a production control to make a
  discrepancy disappear.** `D-35` (the throttle was not weakened), `KG5B-D7` (the
  `governedRecordsPresent` threshold was not lowered), `KG5C-D6` (severity was not touched).
* **Do not create a new KG implementation phase because a non-blocking defect was discovered.** Only
  a `BLOCKER` (§24) expands the current release gate.

### Why this is a rule and not advice — the recorded failures it generalises

| Recorded failure | What the loop would have done | What the rule requires |
|---|---|---|
| KG-4B defect 3 — explanation text compared against regulatory text, 31 BLOCKING content differences | "fix" the corpus or the resolver | the **comparator** captured the wrong field; repair instrumentation → `CONTENT_DIFFERENCE` went to 0 |
| KG-4B defect 4 — review status misread as applicability, 51 of 83 uncertain | weaken an applicability predicate | the runner read a review-state label; read the authoritative axis → 51 → 13 |
| KG-4C ownership-guard incident | trust the guard's own 26/26 suite | **an assertion that describes what the code does is not a test** (`D-48`) |
| KG-5B `KG5A-DISC-01` | add the missing `WHERE` clause | the missing clause was a symptom; the cause was that a governed record could not exist outside the live corpus (`KG5B-D1`) |
| KG-5C `KG5B-DISC-01` | make governed content byte-identical to legacy | the pairing was right and the classification too coarse; the difference **is the feature** (`KG5C-D2`, `KG5C-D3`) |
| KG-5C `KG5C-FIX-01` | change `severityFor` to make SHADOW green | the comparator compared a field the Path B customer never sees; fix the field precedence, leave severity alone (`KG5C-D6`) |

**The proof that a repair was not made to move a number is that the verdict does not move.**
`KG5C-FIX-01` changed which field is compared and left the mismatch verdict unchanged. State that
explicitly whenever an instrumentation repair is made.

### If root cause cannot be established

Classify the finding `UNCLASSIFIED`, capture the evidence, and **stop progression toward CUTOVER**
until it is resolved. Do not edit implementation to make an unexplained observation go away.

---

## 23 — ARCHITECTURAL OWNERSHIP MAP

**Every newly discovered discrepancy must be assigned an architectural owner BEFORE implementation
remediation.** If ownership is unclear, **investigate until it is established** — do not patch
multiple layers because ownership has not yet been determined.

§19 maps *files* to concepts. This maps *contracts* to layers, which is what a discrepancy has to be
assigned to.

### SOURCE

**Owns:** authoritative governed text · citation identity · governed source membership · source
metadata.

| Contract | Modules |
|---|---|
| Governed candidate records are derived from version-controlled sources with zero DB access | `standards/releases/governed-source-set.ts` |
| Release membership is explicit, by `citationKey` | `standards/releases/release-definition.ts`, `definitions/*.json` |
| Structured citation identity; subsections are significant | `applicable-standards/citation-structure.ts`, `standards/releases/citation-identity.ts` |
| Source → corpus row projection (one projection, shared) | `standards/seed/standards-intelligence-projection.ts` |
| The legacy corpus is never the governed source, staging area or membership | `standards/seed/legacy-corpus-guard.ts` |

**Typical symptoms it owns:** wrong or incomplete regulatory text; a citation that does not exist; a
missing source URL; legacy corpus quality (`KG5C-DISC-01`); a record that should not be in the
release.

### REVIEW

**Owns:** human approval · checksum binding · re-attestation · new-review requirements · revocation ·
review provenance.

| Contract | Modules |
|---|---|
| A decision binds to an exact record version by checksum/digest | `standards/releases/release-record-review.service.ts` |
| Dual-digest approval identity (`APPROVAL_CONTRACT_VERSION = 2`) | `standards/releases/approval-contract.ts` |
| Decisions are append-only; supersession is `supersedesDecisionId`; **no bulk approval** | `release-record-review.service.ts` |
| NULL `approvalDigest` means *predates the contract* and is never backfilled | `D-17`, §7 |
| Effective review state is derived, never a mutable flag | `standards/releases/review-state.ts` |

**Typical symptoms it owns:** a record is unapproved when it should be reviewed; an approval no
longer names the content it was given for; the eight `NEW_REVIEW_REQUIRED` records.

**Never remediate a REVIEW symptom in RESOLUTION.** Making the resolver deliver unreviewed content
is `REVIEW_STATE_VIOLATION` (§27.3) — presumptively a `BLOCKER`.

### RELEASE

**Owns:** immutable release snapshots · deterministic manifests · finalization · activation ·
rollback · active release identity.

| Contract | Modules |
|---|---|
| Records are immutable once finalized | `regulatory-release-record.entity.ts` |
| Manifest identity is deterministic and reproducible | `standards/releases/release-manifest.ts` (**`digest()` unchangeable**, `D-16`) |
| Construction never writes to `standards_master` | `standards/releases/governed-release-builder.ts` → `assertNoLegacyCorpusWrites()` |
| Finalization stamps manifest **and** approval identity together | `standards/seed/finalize-regulatory-release.ts` |
| Activation/rollback are explicit, gated, expected-state-checked in-transaction | `backend/scripts/regulatory-release.ts`, `regulatory-release-lifecycle.service.ts` |
| The active pointer is read once per analysis and pinned | `D-27` |

**Typical symptoms it owns:** the wrong release is active; a manifest does not reproduce; a pin does
not match; `NO_ACTIVE_RELEASE`; a lifecycle event is missing.

### RESOLUTION

**Owns:** citation lookup · candidate selection · governed/legacy selection · customer-path content
delivery.

| Contract | Modules |
|---|---|
| Deterministic ranking, invariant to physical row order | `applicable-standards/applicable-standards.service.ts` (`D-12`) |
| Governed resolution runs **after** ranking, dedup, jurisdiction filter and truncation | `D-23` |
| `resolvedCitation === requestedCitation`, always — no neighbouring substitution | `standards/cutover/governed-resolution.ts` (`D-30`, §5.10) |
| The 84-row fallback decision table | `standards/cutover/fallback-contract.ts` |
| The single seam and its per-citation memo, pin and provenance accumulator | `standards/cutover/governed-cutover-context.ts` |
| The ONE request-path orchestration boundary | `standards/cutover/shadow-request-orchestration.ts` (`D-51`) |
| Content backing decision for both paths | `standards/display/standards-backing-contract.ts` |
| Legacy hydration and subsection lookup semantics | `applicable-standards.service.ts` → `normalizeCitationForLookup` |

**Typical symptoms it owns:** the wrong citation is delivered; governed content is delivered for an
unapproved record; a fallback altered customer output; a subsection collapsed to a base citation.

### PRESENTATION

**Owns:** customer-visible formatting · badges · labels · rendering · truthful provenance
presentation.

| Contract | Modules |
|---|---|
| Governed display state reaches a payload only when `customerVisible` | `governed-cutover-context.ts` → `projectGovernedDisplay()` (`D-31`) |
| Customer finding presentation; backing → source status, notices, confidence limits | `safescope-v2/display/guided-finding-response.ts` |
| The report PDF projects a **closed allowlist** and never spreads the snapshot | `reports/canonical-report-pdf-renderer.ts` (`KG4E-D1`) |
| No internal governance vocabulary on screen (32 forbidden terms) or in a PDF (38 patterns) | `frontend-next/.../SafeScopeStandardsSection.tsx`, `lib/inspection/standardDisplay.ts` |

**Typical symptoms it owns:** a badge shown where it should not be; internal vocabulary leaking to a
customer surface; a label that misstates provenance.

**A truthfulness failure here is never repaired by changing SOURCE or RESOLUTION.** If the bytes are
right and the badge is wrong, the badge is wrong.

### INSTRUMENTATION

**Owns:** SHADOW comparison · harnesses · equivalence classification · telemetry · measurement.

| Contract | Modules |
|---|---|
| One classification engine, one taxonomy | `standards/cutover/shadow-comparison.ts` (`D-32`) |
| Severity is assigned separately from category | `D-33` |
| Events are privacy-safe by construction; content as digests only | `shadow-telemetry-sink.ts`, `SHADOW_EVENT_ALLOWED_FIELDS` |
| Customer-output invariance oracle | `standards/cutover/customer-output-invariance.ts` (`D-43`) |
| Circuit breaker / kill switch / stage authorization | `shadow-circuit-breaker.ts`, `production-shadow-authorization.ts` |
| Customer-path equivalence classification | `standards/display/customer-path-equivalence.ts` |
| Verification suites and rehearsals | `backend/scripts/` |

**Typical symptoms it owns:** the comparator observes the wrong field, representation, citation
identity or lifecycle state; an oracle compares two broken observations; a volatility set derived as
values rather than positions; a telemetry field that cannot identify the resolver path.

> **The single most repeated lesson in the programme lives here.** KG-4B produced three confident,
> coherent, completely wrong answers before the fourth run was right; KG-4C's guard suite passed
> 26/26 while the mechanism was inverted; KG-4D compared two empty pages twice; KG-5C found the
> comparator reading a field the customer never sees. **When measurement and implementation
> disagree, INSTRUMENTATION is the first owner to rule out, not the last.**

### Ownership assignment procedure

1. State the observation as a **contract violation**, naming the contract.
2. Find the contract in the tables above → that is the owner.
3. If it appears in two layers, the owner is the one **closest to the contract's definition**, not
   the one where the symptom surfaced.
4. If it appears in none, the contract is undocumented — establish and document it before editing.
5. Record the owner in the open-issues register (§26) **before** remediation.

---

## 24 — FINDING CLASSIFICATION

Exactly **four** top-level engineering dispositions. Every finding gets exactly one. Anything that
does not fit is `UNCLASSIFIED` (§27.3) and stops progression toward CUTOVER until resolved.

### `BLOCKER`

A **verified** defect that prevents the next authorized release stage from being executed safely or
truthfully.

* **Only a `BLOCKER` automatically expands the current release-gate work.**
* Requires verification, not suspicion. An unverified suspicion is an investigation, not a blocker.
* Presumptive blockers: `REVIEW_STATE_VIOLATION`, `CUSTOMER_MUTATION` (§27.3).

### `DEFECT_NONBLOCKING`

A real defect that does not invalidate the current release gate.

* **Record it. Assign ownership. Preserve it** in §26 for appropriate remediation.
* **Do NOT automatically create another KG phase for it.**
* **Do NOT silently close it** because a later stage happens to mask it.
* Current example: `KG5C-DISC-01` — 634 mid-word-truncated legacy summaries.

### `INSTRUMENTATION`

The implementation satisfies the authoritative contract, but the measurement, comparator, test or
harness does not measure that contract correctly.

* **Repair the instrumentation. Do not change correct production behaviour.**
* State the measured verdict before and after. **An instrumentation repair that moves the verdict
  needs its own root-cause analysis** — it may be masking a real defect.
* Prior examples: KG-4B defects 1–4, `KG5C-FIX-01`.

### `EXPECTED_EXPLAINED`

The observed difference is an expected consequence of the verified architecture. **No remediation is
required.**

* Record enough explanation to prevent future rediscovery, and add it to §25 if a future session
  could plausibly re-derive it as a defect.
* Current examples: `GOVERNED_REVIEWED_RENDERING` ×15; the 12 `LEGACY_UNRESOLVED` subsection
  citations; the Path A / Path B representation difference; `GOVERNED_MISSING` under
  `GOVERNED_WITH_FALLBACK`.

### Classification discipline

| Rule | Why |
|---|---|
| Classify **before** remediating | Classification determines the owner and the permitted response |
| "Different" and "wrong" are not the same claim | Conflating them is the pressure that weakens predicates to move numbers (`D-33`) |
| A category may not be invented after seeing results to make an outcome look better | §27.3 |
| A disposition may be revised only on **new evidence**, and the revision is recorded with it | §25 |

---

## 25 — SUPERSEDED FINDINGS REGISTER

**This register exists specifically to prevent a future session from rediscovering old evidence and
reopening a resolved architectural question.** Read it before opening any investigation into
governed/legacy content differences, release membership, or corpus mutation.

**It is not a suppression mechanism.** New contradictory evidence always wins over documentation.
Each entry names the exact condition that would justify reopening it — if that condition is met,
reopen it and say so.

### `KG5B-DISC-01` — governed/legacy content differences `PROTECTED — RESOLVED BY KG-5C`

| | |
|---|---|
| **Original observation** | Legacy and governed representations differ for governed citations — 15 of 27 approved records measured `CONTENT_DIFFERENCE` / `BLOCKING`. |
| **Original interpretation** | A potential content-difference blocker. |
| **Corrected KG-5C interpretation** | **The original pairing was valid; the classification was too coarse.** The count of 15 is confirmed by re-measurement through the real customer path on both body-text tiers. All 15 classify **`GOVERNED_REVIEWED_RENDERING`**. The customer receives **exactly the reviewed governed artifact**. |
| **Why byte-equality is unreachable** | Legacy `standard_text` is a verbatim eCFR/MSHA ingest; the governed `canonicalText` is the reviewed rendering KG-3D/3E/4A adjudicated clause by clause — it expands defined terms inline, names limiting sibling paragraphs and states the citation explicitly. Byte-equality is not achievable **by construction**, so its absence is not evidence of disagreement. |
| **What the classification does NOT assert** | It does **not** assert the human review was substantively correct. That is a legal reading, and it is precisely what the recorded clause-by-clause review *is*. The class reports that the delivered artifact is the reviewed one and that a review exists — **never that the review was right**. |
| **Scope limit** | The **eight unreviewed records cannot receive this classification.** Entry requires a recorded clause review, so the 3 unreviewed records whose legacy row resolves are **refused** the category and classify `CONTENT_DIFFERENCE`. The classifier will not bless unreviewed content. |

> **`PROTECTED CONCLUSION` — Do NOT attempt to make governed content byte-identical to legacy
> content merely to eliminate this difference.** Doing so would replace a reviewed artifact with an
> unreviewed ingest under a "Verified standard text" badge, which inverts the purpose of the entire
> governance subsystem.

**Reopen only if new evidence demonstrates that:** customer delivery differs from the reviewed
governed artifact · unreviewed governed content is delivered as approved · citation identity is
incorrect · or another verified contract is violated.

Evidence: `kg-5c/STATUS.md` §3–4, `kg-5c/contracts/customer-path-equivalence.json`, `KG5C-D2`,
`KG5C-D3`.

### `KG5A-DISC-01` — the governed release could not be built without mutating the live corpus `PROTECTED — CLOSED BY KG-5B`

| | |
|---|---|
| **Original observation** | `finalize-regulatory-release.ts` selected `FROM standards_master` with no `WHERE`, so release membership was the whole table; building a release rewrote five live customer-facing rows, renamed a citation, hit a unique-index collision and left the corpus at 2,396 rows with a duplicate pair. |
| **Superseded interpretation** | *"The bug is the missing `WHERE` clause."* |
| **Corrected KG-5B interpretation** | The missing clause was a **symptom**. The cause was that there was no such thing as a governed *candidate record* — the only representation of a governed standard was a row in the live customer corpus, so building a release **required** mutating it. |
| **Resolution** | §21.1 — the governed record has a home of its own, and `assertNoLegacyCorpusWrites()` enforces the isolation executably. |

> **`PROTECTED CONCLUSION`** — Do not "fix" release construction by adding filters to a query over
> `standards_master`. Governed membership is explicit (`release-definition.ts`), never inferred from
> database contents (`KG5B-D2`).

**Reopen only if** governed release construction is observed writing to `standards_master`, or a
manifest fails to reproduce from the version-controlled definition.

### `KG4C-DISC-01` — "seven" unobserved mismatch categories `PROTECTED`

The authoritative figure is **ELEVEN**. KG-4B's `STATUS.md` prose says seven; its
`CORPUS_AND_ANALYTICS.md`, `analytics/shadow-analytics.json` and the 83-event corpus all say eleven.
Seven is a prose subset omitting `GOVERNED_APPROVED_EXACT`, `GOVERNED_UNAPPROVED`,
`GOVERNED_CITATION_ONLY` and `RESOLVER_FAILURE`. **Prefer the measurement.** Any future prompt,
summary or plan saying "seven" is propagating a prose subset over a measurement — do not carry it
forward. (`D-49`, §13.7.)

### `KG4E-DISC-01` — a volatility set of literal VALUES cannot generalise `PROTECTED`

KG-4E's first oracle derived volatility as the token *values* differing between two LEGACY probes.
A third run necessarily carries a third value, in neither set, so all eight cases reported a
difference for a field the oracle had already recognised as volatile. **Volatility must be derived
as a position or a role, never as a value** (`KG4E-D3`). Generalises KG-4B's lesson: KG-4B
established that volatility must be *derived* rather than declared; KG-4E establishes *what kind of
thing* the derived set has to be.

### `KG4E-DISC-04` — dropping four approval columns does not reproduce `STALE_SCHEMA` `PROTECTED`

`resolveGovernedCitation()` selects `payload`, `recordChecksum` and the effective review state; it
never reads the four approval-contract columns, so dropping them leaves `resolverHealth` **OK**.
§7's "migration `1800000014000` absent → `STALE_SCHEMA`" is about the migration being absent **in
full**, and remains true. A targeted column drop is not a substitute for it. Recorded as a
**measured negative** rather than the intended outcome (`KG4E-D9`).

### `KG4D-DISC-01` — a readiness label outran its integration state `PROTECTED`

KG-4C labelled itself `READY_FOR_EXPLICIT_PRODUCTION_SHADOW_AUTHORIZATION` while recording in the
same report that its six modules were unreferenced by production code. **Verified-but-unwired safety
machinery protects nothing.** KG-4D adopted the stronger conclusion (*not yet authorized*) and wired
the modules in. The general form of the lesson is live right now: see §0's "Ready is not started".

### The KG-4C ownership-guard incident `PROTECTED`

The database ownership guard built in KG-4C **caused the exact damage it was built to prevent** — it
treated an absent marker as permission to claim, and every pre-existing evidence database is
unmarked. Its own suite passed 26/26 because an assertion stated the defective behaviour was
correct. Two rules follow, both `STABLE_INVARIANT`: **a guard must be exercised against the real
hazard before it is trusted**, and **an assertion that describes what the code does is not a test**
(`D-47`, `D-48`, §13.6). Fully restored and proven; the residual ownership marker on
`test_kg4b_shadow_20260820` is recorded rather than removed.

---

## 26 — OPEN ISSUES REGISTER

**The single authoritative register of what is genuinely unresolved.** The same uncertainty must not
be scattered through §13, §17 and the JSON — where those disagree with this table, **this table
wins**, and the other location should be corrected to point here.

Every entry carries: identifier · observation · classification (§24) · architectural owner (§23) ·
customer impact · release-gate impact · evidence · next required action · condition for closure.

### `KG5C-DISC-01` — 634 legacy summaries truncated mid-word

| Field | Value |
|---|---|
| **Observation** | `plain_language_summary` is a hard 500-character cut of `standard_text` on **996 of 2,390** production rows; **634 cut mid-word** (e.g. `1910.219` ends *"…thirteen thirty-seconds () inch or less. 1/2 (2"*). That fragment is what a **Path B** customer reads today under the "HazLenz standard summary" label. |
| **Classification** | **`DEFECT_NONBLOCKING — CUSTOMER_VISIBLE_ON_GENERATED_REPORT`** · reclassified 2026-08-22 on new executable evidence (§28.10). **Supersedes** the prior `DEFECT_NONBLOCKING` entry, whose customer-impact scope named only the Path B workspace surface. |
| **Owner** | **SOURCE** / the legacy content-generation path. Not RESOLUTION, not PRESENTATION. |
| **Customer impact** | Real, pre-existing and unrelated to governance. Path B customers read truncated fragments today, in LEGACY. **Newly proven 2026-08-22:** the truncation also reaches the **generated inspection report** — a mid-sentence cut of `29 CFR 1926.501` (*"…the requisite strength and s"*) was printed in a real PDF produced by `CanonicalReportsService.generate()` under LEGACY. That is a second customer surface, and it is one of §16's five surfaces that must remain truthful. |
| **Release-gate impact** | **Blocks neither production SHADOW nor governed CUTOVER for approved records** on current evidence — unchanged by the reclassification. SHADOW remains customer-invisible; "customer-invisible" was always a statement about **SHADOW**, never about the truncation, and the 2026-08-22 evidence does not contradict it. Cutover *repairs* it for the 15 approved reviewed renderings (the complete reviewed artifact replaces the fragment) and leaves it unchanged for unapproved records, which is exactly the fallback contract's promise. |
| **Evidence** | `kg-5c/STATUS.md` §8; `kg-5c/contracts/customer-path-equivalence.json`. Report-surface evidence: `verification/hazlenz-capability-acceptance-2026-08-22/STATUS.md` §9 (7 generated PDFs inspected with poppler). |
| **Next required action** | Adjudicate the legacy summary-generation strategy at **SOURCE**, now with report-surface priority rather than workspace-only. **Deliberately not remediated in the 2026-08-22 closure operation** — reclassification only. |
| **Condition for closure** | Either the generation path is corrected at SOURCE and re-measured, or a recorded adjudication accepts the truncation with a stated rationale. |

> **Do not silently close this because governed CUTOVER masks it.** Cutover repairs it for 15 of
> 2,390 rows. **And do not broaden the current phase into remediating it** — it is
> `DEFECT_NONBLOCKING`, and §24 forbids a non-blocking defect expanding the release gate.

### `KG5C-OPEN-02` — eight `NEW_REVIEW_REQUIRED` records

| Field | Value |
|---|---|
| **Observation** | 8 of the 35 release records have **no recorded clause-by-clause review**. They are exactly KG-3D's deferred unsourced records, and **none is in the 23-citation emitted set**. |
| **Classification** | **`EXPECTED_EXPLAINED`** — this is the review lifecycle working, not a defect. |
| **Owner** | **REVIEW.** |
| **Customer impact** | **None, and that is the requirement.** Governed customer delivery is **withheld** for them: they resolve `UNAPPROVED_RECORD`, deliver legacy text unchanged, carry no badge and record no provenance. Measured 8/8 identical to LEGACY. |
| **Release-gate impact** | Does not block. All eight activation gates pass at 27 of 35 approved with the `governedRecordsPresent` threshold untouched (`KG5B-D7`). |
| **Current classification detail** | **3 of the 8 currently classify `CONTENT_DIFFERENCE`** — those whose legacy row resolves. **This is expected until review occurs**, and is the classifier correctly *refusing* to grant `GOVERNED_REVIEWED_RENDERING` to unreviewed content. |
| **Evidence** | `kg-5c/STATUS.md` §3–4; `kg-5a/PRODUCTION_RELEASE_REVIEW_PACKET.md` (27 REATTEST / 8 NEW_REVIEW_REQUIRED / 0 EXCLUDE). |
| **Next required action** | A named human performs clause-by-clause review, one record at a time, through `npm run review:release-record -- approve` against the exact checksum. Not automatable, and there is no bulk path. |
| **Condition for closure** | Each record either receives a recorded review, or is explicitly excluded by a recorded decision. |

> **Do NOT treat their lack of governed customer delivery as a resolver defect.** Withholding is the
> contract. A "fix" that delivered them would be `REVIEW_STATE_VIOLATION` — presumptively a
> `BLOCKER`.

### `KG5C-OPEN-03` — KG-5C measured a production-shaped corpus, not production traffic

| Field | Value |
|---|---|
| **Observation** | Every KG-5C measurement was taken on disposable `test_kg5c_*` databases built to production's exact pre-KG shape (40 migrations, 2,390 legacy rows). **Production was not touched — not read, not written, not migrated.** The corpus is production-*shaped*; the traffic is not production traffic. |
| **Classification** | **`EXPECTED_EXPLAINED`** — a deliberate scope boundary, not a gap in the work. |
| **Owner** | **INSTRUMENTATION.** |
| **Customer impact** | None. |
| **Release-gate impact** | **This is one of the two principal reasons controlled production SHADOW remains necessary** — the other being that **eleven** of fifteen mismatch categories have never been observed in real traffic (§25 `KG4C-DISC-01`). |
| **Evidence** | `kg-5c/STATUS.md` §11; `kg-4b/analytics/shadow-analytics.json`. |
| **Next required action** | Controlled Stage-1 production SHADOW, per §27 — as a separately authorized operation. |
| **Condition for closure** | A completed Stage-1 SHADOW observation window meeting §27.5 success criteria. |

### `KG4E-DISC-03` — `GET /inspection-reports` returns every version's full frozen snapshot

| Field | Value |
|---|---|
| **Observation** | `CanonicalReportsService.list()` uses `leftJoinAndSelect('report.versions')` and returns raw entities, so every caller receives every version's complete `sourceSnapshot` — 3.4 MB for 41 versions. `GET /inspection-reports/:id` does not; it maps through `metadata()`. |
| **Classification** | **`DEFECT_NONBLOCKING`** for SHADOW; **`MUST_FIX_BEFORE_CUSTOMER_GOVERNED_DELIVERY`**. |
| **Owner** | **PRESENTATION** (response projection), with a RELEASE-state consequence under governed delivery. |
| **Customer impact** | Payload size today. Under a **governed delivery** mode it would carry real release ids and full governed state to every list caller. |
| **Release-gate impact** | **Not a Stage-1 SHADOW blocker** — pre-existing, mode-independent, and every `knowledgeReleaseId` in the response is `null` under SHADOW (94 occurrences, one distinct value). **It is a CUTOVER blocker.** |
| **Evidence** | §13.14; re-confirmed by the 2026-08-21 preflight. |
| **Next required action** | Project the list response through `metadata()` before any governed delivery mode is enabled for customers. |
| **Condition for closure** | The list endpoint no longer returns raw `sourceSnapshot`, proven by a response-shape assertion. |

### `STAGE1-OP-01` … `STAGE1-OP-05` — the production operations are unexecuted

| Field | Value |
|---|---|
| **Observation** | Production has never received this work. The governed subsystem is **untracked in git**; the live commit `97941ca2` contains no `standards/cutover/`; six migrations are unapplied in the production database; `regulatory_releases` has **zero rows**; and production holds **zero** reviewer approvals against a 2,390-row `standards_master`. |
| **Classification** | **`EXPECTED_EXPLAINED`** — these are release-management operations, not defects. None is a code task. |
| **Owner** | **RELEASE** (operations), outside the cutover subsystem. |
| **Customer impact** | None. Production is on LEGACY and unaffected. |
| **Release-gate impact** | **They gate production SHADOW absolutely.** With no active release, `pinGovernedRelease()` returns `NO_ACTIVE_RELEASE`, **100 %** of comparisons classify `RESOLVER_FAILURE` / `REVIEW`, the run would measure nothing about the governed/legacy gap, and it would breach the 2 % `RESOLVER_FAILURE_RATE` stop threshold the moment 200 comparisons accrued. |
| **Evidence** | `stage1PreflightVerdict` in the JSON (blockers B1–B5); §17 Stage-1 preflight. |
| **Next required action** | Operations 1–11 in §27.7, each separately authorized. |
| **Condition for closure** | An active governed release exists in production with its approvals recorded, and a preflight re-run reports the expected state. |

### `KG5D-DISC-01` — the shadow event carries no resolver-path identifier `RESOLVED BY KG-5D — DISPOSITION A`

| Field | Value |
|---|---|
| **Observation** | Neither `SHADOW_EVENT_ALLOWED_FIELDS` (29 v1 fields) nor `SHADOW_EVENT_V2_ADDITIONAL_FIELDS` (6 more: `stage`, `eligibilitySource`, `outputInvarianceVerdict`, `outputInvarianceHash`, `outputInvarianceDifferingPaths`, `shadowProvenanceNull`) contains any field naming which resolver path produced the observation. Both call sites — `applicable-standards.service.ts:2399` (Path A) and `safescope-v2.service.ts:5644` (Path B) — pass `findingKey: <citation>`, so `findingKey` cannot separate them either. Additionally, `resolveStandard()` memoises the **DB resolution** by citation but does **not** suppress emission on a cache hit, so a citation resolved on both paths within one analysis pushes two records carrying the **same** `eventKey`. |
| **Classification** | **`INSTRUMENTATION`** (§24). The implementation satisfies its contracts; the *measurement* cannot attribute an observation to a path. |
| **Owner** | **INSTRUMENTATION.** |
| **Customer impact** | **None.** SHADOW is customer-invisible regardless, and per-path attribution has no customer-visible consequence. |
| **Release-gate impact** | **Does not block Stage-1 SHADOW.** It does not make SHADOW unsafe — only partly *uninterpretable*, for one hypothesis. `H4` and abort gate 8 in §27 were **corrected to state what the instrument can actually deliver**; the structural guarantee that the two paths cannot disagree comes from their sharing `resolveStandard()` (`D-22`, `D-51`), not from telemetry. |
| **Evidence** | `shadow-comparison.ts:547` (v1 allowlist), `shadow-telemetry-sink.ts:63` (v2 additions), `governed-cutover-context.ts:158–161` (cache) and `:211` (emission, outside the cache-miss branch). Measured during the KG program convergence phase. |
| **Next required action** | **None in this phase.** Adding a field would be a speculative implementation change, which this phase forbids and which `KG-4B`'s `eventKey` cardinality contract (`D-36`) would have to be re-derived around. If a future stage genuinely needs per-path analytics, add a categorical `resolverPath` to the v2 additional fields **and** extend `eventKey`, together, with the privacy guard re-run. |
| **Condition for closure** | Either a `resolverPath` field is added with its `eventKey` consequence resolved and the privacy guard re-run, or a recorded decision states that path-level attribution is not required and `H4` remains structural. |

> **Do NOT "fix" this by widening `findingKey` to encode the path.** `findingKey` is an input to
> `eventKey`, and KG-4B's idempotency lesson is explicit: *an idempotency key that is not unique per
> analysis is worse than none — it silently merges observations.* Changing what feeds it is a
> cardinality change, not a labelling change.

#### `KG5D-DISC-01` — RESOLVED by KG-5D: **A — PATH ATTRIBUTION NOT REQUIRED**

Re-derived from source in the KG-5D preflight. **Limb 1 is confirmed; limb 2 is stronger than
recorded — the `eventKey` collision is UNREACHABLE in production.**

**Path A never receives a cutover context on any production route.** `cutover` is the **7th**
parameter of `suggest()`:

| Call site | Args passed | `cutover` supplied? |
|---|---|---|
| `safescope-v2.service.ts:1066` — the classify path | 6 positional | **no** |
| `applicable-standards.controller.ts:17` — `POST /applicable-standards/suggest` | 4 positional | **no** |

Its own doc comment says it: *"Undefined is the default and **the only value any customer produces
today**."* With `cutover` undefined the `if (cutover)` guard at
`applicable-standards.service.ts:2392` is false and **Path A emits no shadow events at all.**

**Empirically corroborated:** across all **80** real integrated-path v2 events — KG-4D 32 over 9
analyses, KG-4E 24 over 7 and 24 over 7 — there are **80 distinct `eventKey`s, 0 duplicates, and 0
`(correlationId, citation)` pairs occurring more than once.** The collision does not merely fail to
matter; **it does not occur.**

**No frozen hypothesis requires path attribution.** H4 and H7 already state that the guarantee is
*structural* (both paths share `resolveStandard()` — `D-22`, `D-51`) and that telemetry does not
re-establish it; abort gate 8 was deliberately worded to exclude it. On the classify path the
distinction is degenerate — **every Stage-1 observation is a Path B observation**, so a `resolverPath`
field would be a constant.

> **Preserve the current instrumentation. Add no telemetry.** This satisfies the second branch of the
> recorded closure condition: *"a recorded decision states that path-level attribution is not required
> and `H4` remains structural."* **Reopen only if** Path A is wired to the seam — which would make the
> collision reachable and require its own `eventKey` cardinality analysis — or a later stage genuinely
> needs per-path analytics, in which case add a categorical `resolverPath` **and** extend `eventKey`,
> together, with the privacy guard re-run.

### `KG5D-DISC-02` — Stage-1 SHADOW observes Path B only

| Field | Value |
|---|---|
| **Observation** | §21.5 records **two** real customer resolver paths, but only **one** is instrumented on the request path. Path A emits zero SHADOW events on every route (see `KG5D-DISC-01` above). Stage-1 will therefore produce **zero** Path A observations. |
| **Classification** | **`INSTRUMENTATION`** — the implementation satisfies its contracts (§17 records the seam as called from exactly one place); the *evidence expectation* is what was unstated. |
| **Owner** | **INSTRUMENTATION.** |
| **Customer impact** | **None.** SHADOW is customer-invisible on both paths. |
| **Release-gate impact** | **Does not block Stage-1.** `H4`'s structural guarantee is unaffected. It **bounds what a Stage-1 corpus may be claimed to cover**, and it is a CUTOVER consideration. |
| **Evidence** | `safescope-v2.service.ts:1066`; `applicable-standards.controller.ts:17`; `applicable-standards.service.ts:1023` (the parameter and its comment) and `:2392` (the guard); 80/80 real events carry no Path A observation. |
| **Next required action** | **None here.** Do **not** wire Path A to the seam in this phase — it is an implementation change this phase forbids, and it is precisely the condition that makes the `KG5D-DISC-01` collision reachable. State the scope limit in any Stage-1 claim. |
| **Condition for closure** | Either Path A is wired with its `eventKey` cardinality consequence resolved, or a recorded decision accepts that governed resolution is a Path B concern on the request path and Stage-1 coverage claims are scoped accordingly. |

### `KG5D-DISC-03` — three different numbers were being read as "the 200 sample requirement"

| Field | Value |
|---|---|
| **Observation** | `minimumSample: 200 / 500` in `shadow-circuit-breaker.ts` is the floor **below which a STOP threshold may not trip** — a suppression guard on the breaker. The **Stage-1 → Stage-2 promotion** gate is a different number (≥ 100 comparisons, ≥ 24 h). The **"Sample sufficiency"** table (200 analyses / 500 comparisons plus regime and family coverage) sits under §16 **Post-run review** and describes the corpus adequate to inform a **CUTOVER** decision, additionally gating Stage 3. **None of the three is a Stage-1 acceptance requirement.** |
| **Classification** | **`INSTRUMENTATION`.** |
| **Owner** | **INSTRUMENTATION.** |
| **Root cause** | Both sources were already correct and explicit — the breaker's own basis reads *"The 200-observation floor is set so a single early failure cannot trip a run: 1/200 = 0.5%, comfortably under the threshold"*, and the runbook reads *"The first cohort is not a sample; it is a smoke test of the mechanism in production conditions."* The summary applied them to the wrong stage. |
| **Release-gate impact** | Removes a phantom Stage-1 blocker. **No threshold is weakened** — the 200/500 floors are preserved exactly and continue to govern what they always governed. |
| **Safety argument** | `shadow-circuit-breaker.ts:187` — *"Hard invariants first, unconditionally, with no sample floor. One is enough."* `evaluateCircuitBreaker()` returns `STOP_SHADOW` on any hard-invariant violation **before** any rate condition is evaluated. **All seven customer-protecting conditions are threshold-zero with no sample floor and are fully armed at n = 1**, so a small structured Stage-1 leaves every customer protection at full strength while the rate conditions simply never arm — reported as `BELOW_MINIMUM_SAMPLE:<condition>` for review, never silently. |
| **Condition for closure** | Closed by this record. Reopen only if a threshold is *proposed to change*, which requires its own root-cause analysis. |

### `KG5D-DISC-04` — organic sample sufficiency is unreachable at this product's traffic level

| Field | Value |
|---|---|
| **Observation** | At **one analysis in the product's lifetime**, the post-run sufficiency corpus (200 analyses / 500 comparisons / 100 OSHA GI / 100 OSHA Construction / 50 MSHA / 12 hazard families) will not be reached organically at Stage 1, Stage 2 **or** Stage 3, on any timeline. Deterministic-cohort widening cannot manufacture traffic that does not exist. |
| **Classification** | **`DEFECT_NONBLOCKING`** for SHADOW; **`MUST_ADJUDICATE_BEFORE_CUTOVER`**. |
| **Owner** | **INSTRUMENTATION** (evidence design). |
| **Customer impact** | None. |
| **Release-gate impact** | **Does not block Stage-1**, and per §24 must not expand the Stage-1 gate. **The evidence basis for a future CUTOVER decision cannot be organic production shadow as currently designed.** |
| **Next required action** | Before CUTOVER is contemplated, a recorded adjudication: either re-derive the sufficiency table for a low-traffic product, or rest the cutover decision on the structured-coverage basis plus the existing KG-4B/4D/4E/5C evidence **with the limitation stated**. |
| **Condition for closure** | A recorded cutover-evidence adjudication exists, or organic traffic reaches the sufficiency table. |

> **Do NOT resolve this by padding a corpus to clear a coverage number.** KG-4B refused exactly that
> (§8.5, `D-35`), and the runbook refuses it again for MSHA traffic. A larger corpus of manufactured
> observations is not more evidence.

### Backlog carried forward (recorded, not currently actionable)

These are real and tracked, but none is a blocker and none expands the current gate. Full detail in
§17's backlog table.

| Item | Class | Owner |
|---|---|---|
| 137 declared-but-unemitted citations (`GOVERNED_MISSING` population) | `DEFECT_NONBLOCKING` | SOURCE / REVIEW |
| 39 parent/child ambiguities (generates `GRANULARITY_DIFFERENCE`) | `DEFECT_NONBLOCKING` | SOURCE |
| 42 duplicate multi-surface declarations (generates `APPROVED_SECTION_ONLY`) | `DEFECT_NONBLOCKING` | SOURCE |
| 3 governed records without a source URL | `DEFECT_NONBLOCKING` | SOURCE |
| `SOURCE_URL_REGISTRY_MISMATCH` on 5 OSHA records — classified, deliberately not churned | `EXPECTED_EXPLAINED` | SOURCE |
| Operator-triggered instant kill switch (env path carries platform restart characteristics) | `DEFECT_NONBLOCKING` | INSTRUMENTATION |
| Two pre-existing HazLenz core failures, byte-identical at every slice boundary | `EXPECTED_EXPLAINED` | — (baseline) |
| `test:entitlement-boundary` 429/hang — **do not weaken the throttle** | `EXPECTED_EXPLAINED` | INSTRUMENTATION |
| `test:kg3f-customer-path-disconnection` cannot see the current seam — superseded, left unmodified | `INSTRUMENTATION` | INSTRUMENTATION |

---

## 27 — PRODUCTION SHADOW PROTOCOL — FROZEN BEFORE OBSERVATION

> ### Everything in §27 is frozen BEFORE production SHADOW is enabled, deliberately. Defining what counts as success after seeing results is how an observation becomes a rationalization.
>
> **This section does NOT authorize production SHADOW.** It defines what a separately authorized
> SHADOW would be for, what it would have to prove, and what would stop it.

### 27.1 Primary hypothesis

> **H0 — On real production requests and real production data, the governed resolver operating
> observationally selects and constructs governed results consistent with the verified release and
> customer-delivery contracts, while `LEGACY` remains the sole authoritative customer response.**

### 27.2 Secondary hypotheses

Every SHADOW observation must map to one of these, or be explicitly recorded as an **unexpected
observation**. "See what happens in production" is not a goal and is not permitted as one.

| # | Hypothesis | Refuted by |
|---|---|---|
| **H1 — citation resolution** | For every request, `resolvedCitation === requestedCitation`; citation identity is never silently broadened or collapsed; subsection requests never fall back to a base citation. | any `CITATION_DIFFERENCE`, or a base-citation fallback for a subsection request |
| **H2 — approved governed artifact delivery** | For every approved record, the governed artifact the resolver constructs is **byte-identical to the frozen `payload.canonicalText`** of the pinned release record. | a governed construction that differs from the frozen artifact |
| **H3 — unreviewed fallback** | For every unreviewed record, governed delivery is withheld and legacy behaviour is preserved exactly. | any governed content constructed for a record with no effective approval |
| **H4 — resolver path behaviour** | Both paths resolve through the single seam and therefore cannot disagree — this is **structural** (they share `resolveStandard()`), and SHADOW telemetry does **not** independently re-establish it: the v2 event carries **no resolver-path identifier** (`KG5D-DISC-01`). What SHADOW can evaluate is that every observation's resolution is internally consistent with its own pinned release, and that the §21.5 representation difference accounts for every content-length difference observed. | an observation whose backing, citation or release is inconsistent with its own pinned release |
| **H5 — badge / provenance truthfulness** | `customerVisible` is false throughout, `projectGovernedDisplay()` contributes `{}`, and no governed provenance is written. `knowledgeReleaseId` is NULL on every row. | any governed key in a payload, or any non-NULL provenance |
| **H6 — absence of customer-response mutation** | The customer receives the **pristine** legacy run on every request; the stable field set is identical to LEGACY; `customerOutputUnchanged: true` on every event. | any difference in a field derived as stable, or an INDETERMINATE invariance check |
| **H7 — instrumentation fidelity** | Telemetry distinguishes legacy from governed representations, attributes every observation to its correlation, finding and pinned release, and every event passes the v2 privacy guard. **Resolver-path attribution is out of scope — the field does not exist** (`KG5D-DISC-01`). | a comparison that cannot name its release, or a field outside the v2 allowlist |
| **H8 — release identity** | Every observation names the single explicitly intended release and its manifest checksum, captured in the same query as the active-pointer read. | any observation naming a different release, or a manifest/pointer mismatch |

**A hypothesis is evaluated, not assumed.** A hypothesis with zero qualifying observations is
**UNPROVEN**, never "passed" — the KG-4D non-vacuity floor (`D-54`) applies: three slices have been
fooled by an equality oracle comparing two broken observations.

### 27.3 Frozen discrepancy taxonomy

**Frozen before observation.** Every observed difference must be classified into exactly one of
these.

| Category | Definition | Default disposition |
|---|---|---|
| **`EXPECTED_EQUIVALENCE`** | Governed and legacy outcomes are materially equivalent under the applicable contract. | `EXPECTED_EXPLAINED` |
| **`EXPECTED_GOVERNED_REVIEWED_RENDERING`** | The governed representation differs from legacy but **exactly matches the reviewed governed artifact**. **Not a defect merely because the bytes differ.** Entry is mechanical and requires all four §25 conditions, including a recorded clause review. | `EXPECTED_EXPLAINED` |
| **`RESOLUTION_DIFFERENCE`** | Legacy and governed paths select materially different citation identities or applicability outcomes. | **Requires root-cause investigation** (§27.4) |
| **`CONTENT_DIFFERENCE`** | For a record expected to satisfy the same content contract, the delivered governed artifact differs **unexpectedly**. **Do NOT use this for an already-proven reviewed rendering difference.** | **Requires root-cause investigation** |
| **`MISSING_GOVERNED_RECORD`** | A request expected to resolve through an approved governed record cannot do so. | Investigate; may be `DEFECT_NONBLOCKING` corpus backlog |
| **`REVIEW_STATE_VIOLATION`** | Unreviewed content is treated as approved/governed customer content, or approval state is otherwise misrepresented. | **Presumptively a `BLOCKER`** |
| **`CUSTOMER_MUTATION`** | SHADOW changes the authoritative customer response or customer-visible behaviour. | **HARD ABORT** (§27.4) |
| **`INSTRUMENTATION_ERROR`** | The comparator / telemetry / harness is observing the wrong field, representation, citation identity or lifecycle state — measuring the wrong contract. | `INSTRUMENTATION`; repair the measurement, not production |
| **`UNCLASSIFIED`** | The evidence does not fit an existing category. **Do not immediately edit implementation.** Capture the evidence and perform root-cause classification first. | Stops progression toward CUTOVER |

> **Do NOT invent new categories after observing results merely to make SHADOW appear successful.**
> If a genuinely new category is required, **document why the frozen taxonomy was insufficient**,
> as a finding in its own right. The taxonomy being wrong is itself a result.

This taxonomy is the **operational** layer above the 15-category engine taxonomy in §10, which
continues to classify individual comparisons. They are not competing vocabularies: §10 classifies a
comparison, §27.3 classifies a **finding an operator must act on**.

### 27.4 Abort gates — hard stop conditions, frozen before observation

**SHADOW must be aborted** if evidence indicates any of:

1. **customer responses are being modified** — any `CUSTOMER_MUTATION`;
2. **SHADOW can influence the authoritative resolver result**;
3. **an unreviewed governed artifact can be presented as approved**;
4. **release identity is not the explicitly intended release**;
5. **citation identity is being silently broadened or collapsed**;
6. **production writes occur** where observation is required to be read-only;
7. **the comparator cannot reliably distinguish legacy from governed representations**;
8. **telemetry cannot attribute an observation to its correlation, finding and pinned release** —
   deliberately *not* "cannot identify the resolver path": the v2 event carries no resolver-path
   identifier at all (`KG5D-DISC-01`), so that stronger wording would abort every run on its first
   event. Path-level attribution is a **known instrumentation limit** recorded in §26, not an abort
   condition;
9. **release / rollback state differs from the expected preflight state**;
10. **an unexpected condition makes continued observation unsafe or uninterpretable.**

> **Do NOT continue collecting data after a hard abort condition merely to obtain a larger sample.**
> A larger sample of uninterpretable observations is not more evidence; it is more of the same
> non-evidence, and it costs the credibility of everything measured before the abort.

Abort mechanics: the kill switch engages on **any** non-empty value including `off`/`false`/`0`
(`D-40` — brakes are permissive, only locks are exact). The circuit breaker's hard invariants trip
at **threshold zero with no sample floor** (`D-42`) — there is no acceptable rate of customer-payload
mutation. A **missing or indeterminate** invariance check is itself a hard violation (`D-43`):
unverified is not verified.

### 27.5 Success criteria — frozen before observation

A controlled production SHADOW stage is successful **only if all of the following hold**:

1. **zero `CUSTOMER_MUTATION`**;
2. **zero `REVIEW_STATE_VIOLATION`**;
3. **zero unexplained citation-identity violations**;
4. **zero unresolved `BLOCKER` findings**;
5. **every observed difference is classified** into the §27.3 taxonomy — none left unclassified;
6. **every `EXPECTED_GOVERNED_REVIEWED_RENDERING` result is verified against the actual reviewed
   governed artifact** — the frozen `payload.canonicalText`, not a re-derivation;
7. **instrumentation is proven to measure the customer contract correctly** — including a
   per-observation non-vacuity floor (`D-54`);
8. **no unexpected production writes**;
9. **`LEGACY` remained the authoritative customer response for the entire observation window**;
10. **SHADOW was disabled cleanly** after the observation window;
11. **the evidence is sufficient to make a separate CUTOVER decision.**

> **SHADOW success is NOT "zero byte differences."** That criterion would contradict the verified
> KG-5C architecture, under which the governed artifact **should** differ from the unreviewed legacy
> ingest for every reviewed rendering. Adopting it would create direct pressure to replace reviewed
> content with unreviewed content to make a number go to zero.

> **SHADOW completion is NOT automatic CUTOVER authorization.** CUTOVER is a separate, explicit
> human decision, taken after this evidence exists — and it additionally requires `KG4E-DISC-03`
> (§26) to be closed.

### 27.6 Root-cause procedure for SHADOW differences

Every unexpected SHADOW discrepancy follows this sequence, which is §22 applied to live observation:

```
capture → reproduce → identify violated contract → assign architectural owner (§23)
  → isolate root cause → classify (§27.3 / §24) → smallest correct remediation
    → boundary regression proof → documentation update
```

**Do not:**

* edit production during observation;
* patch multiple layers simultaneously;
* weaken an invariant to make a discrepancy disappear;
* change reviewed governed content without the required review lifecycle;
* alter customer behaviour to satisfy instrumentation;
* reinterpret a discrepancy after seeing the desired metric.

**If root cause cannot be established confidently:** classify `UNCLASSIFIED` and **stop progression
toward CUTOVER** until it is resolved.

### 27.7 The operations that precede any SHADOW observation

**None of these is authorized here.** Each requires its own explicit authorization. Full runbook:
`kg-5b/PRODUCTION_RELEASE_RUNBOOK.md`.

| # | Operation | Note |
|---|---|---|
| 1 | Commit the KG release package | six commits, ordered by the real import graph |
| 2 | Push `release/insite-rc-2026-08-18` | |
| 3 | Merge to `main` | Render auto-deploys `main`; `main` == the live commit (`KG5A-D6`) |
| 4 | Apply the six production migrations | all additive, no data backfill, rehearsed byte-identical |
| 5 | Deploy with every `GOVERNED_CUTOVER_*` absent | proven customer no-op for the tree that would ship |
| 6 | Verify production LEGACY / no-op | |
| 7 | `npm run release -- prepare --release-id … [--dry-run]` | writes nothing to `standards_master`; creates a `provisional` release |
| 8 | `npm run review:release-record -- approve …` | one record at a time, by a named human, against an exact checksum. **No bulk path, no imported decisions** (`KG5A-D3`) |
| 9 | `npm run release -- activate … --dry-run` | evaluates all eight gates, writes nothing |
| 10 | `npm run release -- activate …` with SHADOW **OFF** | exact id + expected manifest + expected current pointer + named actor |
| 11 | `npm run release -- status`, re-verify LEGACY / no-op with a release active | |
| 12 | *(only if needed)* `npm run release -- rollback … --expected-current <id>` | |
| 13 | **Authorize Stage-1 SHADOW separately** | a distinct human decision, against §27.1–27.5 |

Stage-1 additionally requires: the platform log pipeline confirmed to collect and retain
`kg4c.shadow-comparison.v2` events; **one named internal account, never an ordinary customer**
(`GOVERNED_CUTOVER_ORG_ALLOWLIST` must stay **unset** — it would enable the whole organization
against a `STAGE_1_SINGLE_ACCOUNT` ceiling of 1); and the four locks set in one deliberate change.

### 27.8 The Stage-1 experiment, frozen 2026-08-21 (KG-5D)

**This does not authorize Stage-1.** It is the bounded experiment that should be authorized *next*,
after operations 1–11. It is written **before** observation, deliberately.

**Preconditions.** Operations 1–6 executed and verified (package committed, pushed, merged to `main`,
the six migrations applied, deployed with every `GOVERNED_CUTOVER_*` absent, production re-verified
LEGACY/no-op) and operations 7–11 executed (release prepared; records reviewed one at a time by a
named human against exact checksums; `activate --dry-run` passing all eight gates; activated with
SHADOW **off**; status re-verified). A preflight re-run reports the expected state.

**Release state:** exactly **one** `ACTIVE` governed release, its `releaseId` and `manifestChecksum`
recorded in advance and restated in the authorization request. `pinGovernedRelease()` must return
that release and never `NO_ACTIVE_RELEASE`.
**Review state:** every record intended to deliver governed content carries a recorded
clause-by-clause review bound to its exact checksum. Unreviewed records are **observed as withheld**,
never remediated during the run.

**Feature controls:** `GOVERNED_CUTOVER_MODE=SHADOW` ·
`GOVERNED_CUTOVER_PRODUCTION_ACK=I_ACKNOWLEDGE_GOVERNED_CUTOVER` ·
`GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK=I_ACKNOWLEDGE_PRODUCTION_SHADOW` ·
`GOVERNED_CUTOVER_SHADOW_STAGE=STAGE_1_SINGLE_ACCOUNT` ·
`GOVERNED_CUTOVER_OBSERVABILITY=enabled` · `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` = **exactly one**
`users.id` UUID · **`GOVERNED_CUTOVER_ORG_ALLOWLIST` unset** · kill switch unset at start.

**Traffic source: controlled operator traffic**, from the single named account. Natural traffic is
effectively nil (§17.4), and §27.2 is explicit that a hypothesis with zero qualifying observations is
**UNPROVEN**, never passed — so an observation window over natural traffic would prove nothing while
appearing to.

> **Claim boundary `STABLE_INVARIANT`.** Controlled traffic proves **production execution
> correctness**: that the deployed resolver, pinned release, feature controls and telemetry execute
> correctly together, and that `H1`, `H2`, `H3`, `H5`, `H6`, `H7`, `H8` hold on real production data.
> It does **not** prove the mismatch distribution under organic customer usage, the *rate* at which
> the eleven unobserved categories occur in the wild, behaviour under concurrent load, or the absence
> of unanticipated observation shapes. **Stage-1 must claim only the first, and must not claim the
> second because the first is proven.** Organic-population evidence is a separate later requirement
> (§26 `KG5D-DISC-04`).

**Scenario coverage — the evidence requirement is COVERAGE, not COUNT.**

| # | Requirement | Min |
|---|---|---|
| C1 | approved governed citation delivering the reviewed artifact | 3 |
| C2 | known `GOVERNED_REVIEWED_RENDERING` case, of the 15 | 3 |
| C3 | legacy-identical case | 3 |
| C4 | unreviewed record, of the 8 `NEW_REVIEW_REQUIRED` | 2 |
| C5 | known unreviewed `CONTENT_DIFFERENCE`, of the 3 | 1 |
| C6 | subsection citation resolving `LEGACY_UNRESOLVED`, of the 12 | 3 |
| C7 | citation with no governed record (`GOVERNED_MISSING`) | 2 |
| C8 | OSHA General Industry (29 CFR 1910) | 1 |
| C9 | OSHA Construction (29 CFR 1926) | 1 |
| C10 | MSHA (30 CFR 56/62/47) | 1 |
| C11 | multi-finding analysis (per-analysis pin, per-citation memo, mixed provenance) | 1 |
| C12 | HazLenz gold-set citations, of the 23 emitted | ≥ 8 |

Expected corpus: **≈ 12–20 analyses yielding ≈ 30–60 citation comparisons.** *The number is an
outcome of the coverage design, not a target.*

**Integrity gates — these, not the counts, are the acceptance criteria.**

| # | Gate |
|---|---|
| **G1** | **event #1 retrieves as ONE complete parseable JSON object, 35 fields, v2 allowlist clean — else ABORT.** This is what settles the unverified ~1.7 KB log-line fidelity question, at a cost of one observation, and it fails closed |
| G2 | every event names the intended `releaseId` **and** its `releaseManifestChecksum` |
| G3 | `outputInvarianceVerdict = INVARIANT` on every analysis; `INDETERMINATE` count **0** (`D-43`) |
| G4 | `shadowProvenanceNull = true` on every event; `knowledgeReleaseId` NULL in every written row |
| G5 | `customerOutputUnchanged = true` on every event |
| G6 | hard-invariant violations **0** |
| G7 | every distinct observation classified into the §27.3 taxonomy; none `UNCLASSIFIED` |
| G8 | per-observation non-vacuity floor (`D-54`): every compared case returned a real analysis; **a 429 is refused, never compared** |
| G9 | every `EXPECTED_GOVERNED_REVIEWED_RENDERING` verified against the frozen `payload.canonicalText`, **not a re-derivation** |

**Sample-size disposition.** The 200/500 `minimumSample` floors are **preserved unchanged**; they
govern when a *stop* threshold may trip, not how much evidence Stage-1 needs (§26 `KG5D-DISC-03`).
Under a 30–60 comparison Stage-1 the rate conditions never arm — correct and safe, because all seven
hard invariants are threshold-zero with **no sample floor** and are fully armed at n = 1.

**This corpus does not satisfy the Stage-1 → Stage-2 promotion gate** (≥ 100 comparisons, ≥ 24 h) and
does not claim to. Promotion is a separate decision; §27.5 Stage-1 success does not depend on it.

**Telemetry retrieval:** export via `render logs --text` or `GET /v1/logs` paged by `nextEndTime`,
filtering on the `kg4c.shadow-comparison.v2` token, then **aggregate offline** — Render stores each
line as one opaque `message` and indexes no JSON field. Respect the 6,000 lines/min/instance
ingestion cap and the 1000-record API page limit.

**Classification:** §27.3 for operator findings over §10's fifteen-category engine taxonomy for
individual comparisons; §27.6 for anything unexpected. **Do not invent a category after observing
results** — if the frozen taxonomy is insufficient, that is itself a finding.

**Abort conditions:** the ten §27.4 gates, plus **G1**. Abort gate 8 deliberately excludes
resolver-path attribution (`KG5D-DISC-01`), so it will not fire on the first event.

**Maximum observation window:** the **shorter** of — all twelve coverage rows satisfied with every
integrity gate holding; **or 72 hours** wall-clock from enabling SHADOW; or any abort gate firing.
**The window has a finite end by construction. "Observe until confident" is not permitted.**

**Disable procedure:** remove `GOVERNED_CUTOVER_MODE`, or set `GOVERNED_CUTOVER_KILL_SWITCH` to any
non-empty value for an immediate runtime latch (the env path carries Render's restart
characteristics). Disabling SHADOW is a **mode change only** — it does not de-activate the release,
revoke an approval, roll back the corpus, delete an event or rewrite a customer record.

**Evidence artifact:** `kg-5d/` — exported events JSONL, the C1–C12 coverage matrix, the G1–G9
results, the classified discrepancy list, and an explicit hold / expand / stop recommendation.

**Terminal state:** `STAGE1_PRODUCTION_SHADOW_COMPLETE — EVIDENCE_CAPTURED_FOR_SEPARATE_CUTOVER_DECISION`.
Stage-1 completing authorizes **neither** Stage 2 **nor** CUTOVER; each is a separate explicit human
decision, and CUTOVER additionally requires `KG4E-DISC-03` closed and `KG5D-DISC-04` adjudicated.

---

## 28 — HAZLENZ CAPABILITY ACCEPTANCE (2026-08-22)

> ### `HAZLENZ_CAPABILITY_GATE_BLOCKED — RC-01, RC-02, RC-03, RC-04, RC-05, RC-07, RC-08`

Evidence: `verification/hazlenz-capability-acceptance-2026-08-22/` (`STATUS.md`,
`ROOT_CAUSE_CLUSTERS.md`, `contracts/`, `results/`). Baseline `e723b62d`, clean `git archive`
checkout, production-shaped 2,390-row corpus. Matrix: 66 scenarios, **frozen before execution**, sha256
`ef405d60ce4ba073970c1902560c6e8703fa8c297f3cf3cf0c2e6b88ee538111` **as frozen**.
The artifact committed at `contracts/hazlenz-acceptance-matrix.json` is sha256
`c298f14865fe823d0b8250aff759f9b7cdaf7875a573c3a69fc96ab704149040`; it differs from the frozen bytes
by exactly the recorded `TEST_ORACLE_ERROR #2` (scenario B08's PPE family pattern widened from
`ppe|eye|face|struck_by` to `ppe|personal_protective|eye|face|struck_by`, a correction **in HazLenz's
favour**), the added `oracleCorrections` provenance key, and JSON re-serialisation. No scenario text,
no scenario count and no other expectation changed. See `contracts/ORACLE_CORRECTION.md`.
**No implementation file was modified. Nothing was deployed.**

This section answers a different question from §§21–27. Those establish that the *governed knowledge
subsystem* is architecturally converged. This one measures whether the *HazLenz reasoning engine* meets
the capability standard a checkpoint deployment requires. It does not.

### 28.1 `DO_NOT_REINVESTIGATE_WITHOUT_NEW_EVIDENCE` — newly proven

| Question | Answer | Where |
|---|---|---|
| Does HazLenz call a language model? | **NO.** No LLM dependency in `backend/package.json`; no inference endpoint in source; `SafescopeV2Service` injects no repository; 66 full analyses in 9.85 s total | §28.2 |
| Is §12's "a classify path dominated by seconds of AI inference" accurate? | **NO** — superseded. Measured ~0.15 s per analysis. The phrase should not be carried forward | §28.2 |
| Does HazLenz demonstrate closed-loop learning? | **NO.** Corrections are captured durably and read by nothing in the reasoning path | §28.5 |
| Is `learningMemory` in the classify payload a learning mechanism? | **NO** — it is a static literal policy object | §28.5 |
| Does anything re-check regulatory sources on a schedule? | **NO.** Zero `@Cron` / `ScheduleModule` / `setInterval` / `node-cron` in `backend/src`; all ingestion is manual | §28.6 |
| Is the top-level `conditionState` the axis a condition-state contract should be measured on? | **NO** — it is `UNKNOWN` on 62 of 66. The authoritative axis is per-hazard `multiHazardDecomposition.hazards[].conditionState`, which is also what reaches the customer via `additionalHazards` | `contracts/ORACLE_CORRECTION.md` |
| Is `test:kg3f-56-14132-predicate` passing 16/16 sufficient to claim the MSHA-TRAFFIC-01 adjudication holds for customers? | **NO.** A second, unguarded citation source (`msha-inspection-intelligence.service.ts:201`) emits the refused `(a)` paragraph on the customer path while that suite is green | RC-03 |
| Does the seed-corpus size explain the capability result? | **NO** — the measurement used a clone of the 2,390-row production-shaped corpus, not the 35-record seed | §28.2 |

### 28.2 What actually decides a HazLenz result `STABLE_INVARIANT` (measured, not inferred)

Hand-authored rule registries · weighted lexical classification · regex evidence extraction · a canned
corrective-action template library · regex post-processing in `safescope-v2.controller.ts`. The
repository's own 2026-08-08 audit already recorded that the response path demonstrates no external
model call; this phase confirms it executably and quantifies the consequence.

### 28.3 Results

PASS **16** · PASS_WITH_LIMITATION **13** · DEFECT **24** · **SAFETY_BLOCKER 13** ·
TEST_ORACLE_ERROR 1 · HARNESS_ERROR 2 (both corrected and recorded).

Clean by cohort: historical 14% · novel adversarial 20% · realistic field 42% · negative controls 25% ·
regulatory 25% · **total 24%**. Meanwhile `test:hazlenz-core` reproduces **28 of 30** — the two
documented failures (§13.1) and no third. **The repository's own fixtures pass while re-worded
versions of the same failure modes do not.**

Controlled perturbation, the clearest single demonstration: `"back-up alarm"` emits
`30 CFR 57.14132(a)` + `57.9100`; `"backup alarm"` emits **nothing**; `"reverse signal alarm"` emits
**nothing**; adding explicit surface-mine wording moves the same hazard from Part **57** to Part **56**.

### 28.4 Root-cause clusters

Full table in `ROOT_CAUSE_CLUSTERS.md`. Blocking: **RC-01** default-ACTIVE condition state
(CONDITION_STATE) · **RC-02** mine-type keyword collision, `\bback\b` matching "back-up"
(TAXONOMY/RESOLUTION) · **RC-03** PROTECTED_DECISION bypass on a second citation path
(STANDARDS_MATCHING) · **RC-04** lexical brittleness producing high-consequence false negatives
(TAXONOMY) · **RC-05** template corrective actions with invented evidence (CORRECTIVE_ACTION) ·
**RC-07** phantom / over-decomposed findings reaching the report (REASONING_ORCHESTRATOR) ·
**RC-08** evidence fragment inverting a negation on a customer report (PRESENTATION).
Non-blocking: **RC-06** template-driven clarification · **RC-09** regime mixing under `unknown` ·
**RC-10** near-constant top-level condition state.

### 28.5 Learning — `NOT ACTIVE`

`IMPLEMENTED_NOT_ACTIVE`: human reviews · reviewer-confirmed risk · `SafeScopeFeedback` ·
legacy feedback tables. `DOCUMENTED_ONLY`: `learningMemory` / `learningGovernance` payload objects.
`IMPLEMENTED_AND_ACTIVE`: the governed knowledge review queue (retrieval tier only, connected to no
correction source) and the regression corpus as a code-change gate. Unchanged from 2026-08-18.

### 28.6 Knowledge freshness — architecture real, operation absent

Registry, allow-listed primary-source connectors, normalization, checksums and the governed release
lifecycle all exist. **No scheduler exists.** On the production-shaped corpus **0 of 2,390** rows carry
`source_document_checksum` and **0** carry `retrieval_date`; `safescope_knowledge_sources` is empty.
Truthful claim: *a governed regulatory knowledge architecture with reviewed releases*. Not truthful:
automatically staying current, periodic ingestion, continuous learning. The product makes none of
those claims.

### 28.7 AI maturity — `LEVEL_1 — RULE ASSISTANT`

Assigned on the framework's own terms: LEVEL_2 requires classification *using AI-assisted reasoning*,
and there is none. Genuine LEVEL_2 capabilities were measured working — negation-aware extraction,
condition-state modelling, per-finding predicates with named open questions, conservative and truthful
jurisdiction inference, correct granular citation selection — but are not reliable enough to carry the
level. LEVEL_2 requires closing RC-01/02/03/04; LEVEL_3 additionally RC-05/06/07/08; LEVEL_4 requires
activating the captured-correction loop; LEVEL_5 requires post-deployment production evidence.

**The checkpoint minimum is LEVEL_3 with zero unresolved SAFETY_BLOCKERs. Neither condition is met.**

### 28.8 Regulatory-context decision — `HYBRID` `PROTECTED_DECISION`

Explicit context: **1 of 50 (2%)** scenarios emits citations spanning more than one regime. `unknown`:
**11 of 43 (26%)**, including OSHA General Industry citations for a mine hazard. Inference itself is
sound — it fires on only 11 of 66, was correct on every obvious case, held `unknown` on the genuinely
ambiguous one, and is always labelled `HAZLENZ_INFERRED`.

Retain "Not sure / Let HazLenz determine", but require the regime to be **established** — by inference
or by one targeted clarification — before regulatory conclusions are emitted, and refuse to emit a
cross-regime candidate set.

> **The uncommitted 8-line worktree change implements `REQUIRE_EXPLICIT`, not `HYBRID`. It must not be
> packaged.** It is not discarded here; removal or restoration is a separately authorized cleanup step.

### 28.9 What was measured and found sound

Governance posture is correct on every real workflow (0 governed keys, NULL provenance, LEGACY
authority). 7 generated PDFs carry **0** governance/shadow vocabulary. The finalization gate correctly
refuses an inspection with unreviewed decomposed findings. Negation is handled correctly wherever the
phrasing is enumerated. Customer-facing capability language is restrained and well-disclaimed. No new
regression: `test:hazlenz-core` 28/30, the two documented failures only.

### 28.10 New evidence against an existing classification

`KG5C-DISC-01` (634 mid-word-truncated legacy summaries) was recorded in §26 as
`DEFECT_NONBLOCKING`, with its customer-impact scope naming only the Path B workspace surface. This
phase observed a mid-sentence truncation of `1926.501` printed in a **generated customer report today,
under LEGACY** — a second customer surface, and one of §16's five that must remain truthful.

**Reclassified 2026-08-22 to `DEFECT_NONBLOCKING — CUSTOMER_VISIBLE_ON_GENERATED_REPORT`** in the §26
register. The release-gate conclusion is unchanged: it blocks neither SHADOW nor CUTOVER. What changes
is the recorded customer-visibility scope and the priority of the SOURCE adjudication.
**Not remediated** — reclassification only, by explicit authorization.

---

### 28.11 Capability decision — recorded 2026-08-22 `PROTECTED_DECISION`

Authorized by the repository owner after reviewing the §28 evidence. This is a **strategy** decision,
not a remediation, and it is recorded so a future session does not re-derive it.

> **Incremental LEVEL_2 patching is NOT the primary strategy.**

| Cluster | Disposition |
|---|---|
| **RC-01** default-ACTIVE condition state | **Input to the LEVEL_3 reasoning-engine architecture.** Do not patch incrementally. |
| **RC-04** lexical brittleness | Same. |
| **RC-05** template corrective actions | Same. |
| **RC-07** phantom / over-decomposed findings | Same. |
| **RC-08** evidence fragment inverting a negation | Same. |
| **RC-02** mine-type keyword collision (`\bback\b` matching "back-up") | **Preserved as an independently actionable deterministic defect. Do NOT fix yet.** |
| **RC-03** PROTECTED_DECISION bypass on a second citation path | Same — independently actionable, **not fixed yet**. |

**Why RC-01/04/05/07/08 are not patched.** Each is a design property of the reasoning substrate, not a
defect in an owning layer: RC-01 is the absence of a safe-state default, RC-04 and RC-05 are lexical
retrieval standing in for reasoning, RC-07 is the decomposition contract itself, RC-08 is fragment
selection without negation scope. Patching them one at a time would be the observation → edit → rerun
loop §22 exists to make unavailable, and would produce a system that passes a wider fixture set without
reasoning any better.

**Why RC-02 and RC-03 are preserved rather than fixed.** Both *are* narrow enough to repair
(a signal-ordering bug and a second unguarded citation source). They are held because a checkpoint
still gated on RC-01/04/05/07/08 gains nothing from a partial repair, and because fixing a
PROTECTED_DECISION bypass deserves its own authorization and its own regression contract rather than
being folded into a documentation operation. **RC-03 in particular must not be closed by editing
`evidence-foundation.ts`** — that file is already correct and its suite already passes 16/16; the
defect is the *second* path at `msha-inspection-intelligence.service.ts:201`.

> **Next authorized phase: LEVEL_3 reasoning-architecture / implementation planning.**
> It is **not** started by this record, and must not be begun automatically.

### 28.12 Regulatory-context disposition — `HYBRID` recorded, `REQUIRE_EXPLICIT` superseded `PROTECTED_DECISION`

Recorded 2026-08-22 on the §28.8 evidence (explicit context 1/50 regime mixing; `unknown` 11/43).

**Decision: `HYBRID`.** Retain "Not sure / Let HazLenz determine". Require the regime to be
*established* — by HazLenz inference or by one targeted clarification — **before** regulatory
conclusions are emitted, and refuse to emit a cross-regime candidate set.

**The uncommitted `REQUIRE_EXPLICIT` implementation in the working tree is a SUPERSEDED PROPOSAL.**

| | |
|---|---|
| What it does | Removes "Not sure / Let HazLenz determine" from the option list and blocks inspection start on `unknown` |
| Why it is superseded | It discards a working, truthful, conservative inference capability (fires on 11 of 66, correct on every obvious case, always labelled `HAZLENZ_INFERRED`) and forces users to answer a question HazLenz can often answer itself — contradicting the §2 autonomy invariant |
| Committed? | **NO — deliberately excluded from the 2026-08-22 closure commit** |
| Discarded or restored? | **NO — preserved byte-for-byte in the working tree** |
| Disposition | Pending a **separately authorized cleanup step**. Not this operation's to perform |

Affected uncommitted paths, preserved unchanged: `frontend-next/lib/canonicalWorkflowApi.ts` ·
`frontend-next/app/inspections/page.tsx` · `frontend-next/app/inspection-workspace/page.tsx`
(the `KG5A-DISC-02` hunk).

**Presentation follow-up (not remediated):** the Settings label *"Let HazLenz AI Evaluate — HazLenz AI
decides the likely agency context"* promises more than an 11-of-66 inference rate supports.
`PRESENTATION_OVERCLAIM`, owner PRESENTATION.

---

## 29 — LEVEL-3 REASONING ARCHITECTURE — `TARGET, NOT YET IMPLEMENTED`

> ### `HAZLENZ_LEVEL3_ARCHITECTURE_APPROVED_FOR_IMPLEMENTATION_PLANNING`

**Nothing in this section describes current behaviour.** It is the approved target. Zero implementation
files were changed by the phase that produced it; no model dependency, no provider code, no migration.
Evidence: `verification/hazlenz-level3-architecture-2026-08-22/`.

### 29.1 What decides customer behaviour today (measured, §28 + Phase-3 trace)

Every substantive semantic judgement a customer sees — what the hazard is, how many there are, whether
it is active, what evidence supports it, what to do — is made by deterministic lexical machinery
(`weighted-classifier`, `multiHazardEngine.decompose`, `inferConditionState`, the corrective-action
template library) and then patched by regex in the presentation layer
(`ensureVisiblePrimaryCitationContract`, `enforceVerifiedControlDisplay`). Stages that are deterministic
**and correct** — `suggest()` retrieval, citation identity, governed content, persistence, the
provenance gate, human review, finalization, report/PDF — are untouched by this design.

### 29.2 Root-cause consolidation `PROTECTED_DECISION`

**RC-01, RC-04, RC-05, RC-07 and RC-08 are ONE architectural cause with five surfaces** — the absence
of semantic reasoning authority. Confirmed from source: they co-occur, respond to the same perturbation
(rewording alone moves classification, condition state and citation together), and share one input
(`fusedText` matched against registries) and one failure mode (unrecognized phrasing falls through to a
default). **RC-02 and RC-03 are genuinely independent deterministic defects** that remain wrong after
Level 3, because Level 3 keeps deterministic retrieval and jurisdiction filtering.

### 29.3 The seam `STABLE_INVARIANT` (target)

`intelligence-orchestrator.service.ts::evaluate()`, called from **exactly one place**
(`safescope-v2.service.ts:1576`), already inside a try/catch. It owns the four artifacts behind
RC-01/04/07/08, its output shape is already consumed by persistence and reports, and it owns **neither**
standards retrieval **nor** governed content — which is what makes `L3-INV-01`, `L3-INV-03` and
`L3-INV-09` structural rather than policy.

### 29.4 Authority map (target)

Moving to **SEMANTIC (validated)**: observation interpretation · hazard decomposition · condition state ·
evidence binding · jurisdiction proposal · regulatory applicability **over retrieved candidates only** ·
risk *factors* · corrective-action *intent* · clarification decision.

Remaining **DETERMINISTIC and unchanged**: standards retrieval (`suggest()`) · citation identity ·
governed content, review state, release membership, provenance, badges · risk *scoring* · persistence ·
the server-side provenance gate · human review · finalization · report and PDF rendering.

Machine-readable: `contracts/authority-map.json`.

### 29.5 Protected Level-3 invariants (target)

`L3-INV-01` no invented citations (structural) · `L3-INV-02` evidence-bound findings ·
`L3-INV-03` no model governance authority (structural) · `L3-INV-04` **no default ACTIVE** ·
`L3-INV-05` safe failure · `L3-INV-06` decision-boundary clarification · `L3-INV-07` structured output
only · `L3-INV-08` model output is a proposal · `L3-INV-09` regulatory text remains governed
(structural) · `L3-INV-10` **no silent Level-1 fallback** · `L3-INV-11` negation scope preserved in
every evidence span · `L3-INV-12` deterministic signals are advisory and may not re-acquire authority.

> **`buildDegradedHazLenzIntelligence()` (`safescope-v2.service.ts:1392`) violates `L3-INV-10` today.**
> It emits family-keyed `evidenceGaps` and `classReason` prose and tells the customer that
> classification, risk, standards and corrective actions "were still generated". It retires at L3-6.

### 29.6 Failure behaviour (target)

Timeout → one bounded retry → `ANALYSIS_UNAVAILABLE`. Schema violation → one retry → reject. **Invented
evidence → reject with no retry.** Citation outside the retrieved set → reject. All candidates rejected
→ `INSUFFICIENT_EVIDENCE`. The customer is told plainly that **HazLenz reasoning did not complete** and
receives **no** family, condition state, risk band, citation or corrective action from lexical fallback.

### 29.7 Implementation sequence (target, six slices)

**L3-1** contract + provider abstraction + validator skeleton (no authority change) ·
**L3-2** semantic interpretation + evidence binding (dual-run only) ·
**L3-3** decomposition + condition-state authority transition — closes RC-01/04/07 ·
**L3-4** regulatory applicability + **RC-02** + **RC-03** ·
**L3-5** clarification + risk + corrective action — closes RC-05/06 ·
**L3-6** full integration, retire presentation-layer compensation, sealed acceptance.

Dual-run mode is named **`L3_COMPARE`** and deliberately does **not** reuse KG SHADOW vocabulary — the
contracts differ (KG SHADOW compares governed vs legacy *content resolution*; `L3_COMPARE` compares two
*reasoning engines*).

### 29.8 Evaluation `PROTECTED_DECISION`

Three separate corpora: **REGRESSION** (the committed 66-case matrix `c298f148…`, frozen `ef405d60…`,
plus DX/OF diagnostics and `test:hazlenz-core`), **DEVELOPMENT**, and a **SEALED HOLDOUT** of ~40 novel
scenarios authored by a party not tuning the implementation, opened once per acceptance run and then
retired. Hard safety gates sit at zero (fabricated citations, fabricated evidence, default-ACTIVE from
uncertainty, unsupported findings, unreviewed-as-governed, unsafe corrective action, silent L1 fallback).
Quality thresholds are set above the measured baseline with margin. Generalization gate: **sealed
holdout within 10 points of development.**

### 29.9 Multimodal scope `PROTECTED_DECISION` — `TEXT_FIRST_LEVEL3`

`real-image-analysis.service.ts` operates on `simulatedVisionFindings`, captions and metadata; no
image-decoding or vision library exists in `backend/package.json`. **HazLenz performs no image inference
today.** Every measured Level-3 blocker is a text-reasoning failure. Photo reasoning is a later,
separately scoped slice.

### 29.10 Checkpoint deployment `PROTECTED_DECISION` — `DO_NOT_DEPLOY_LEVEL1_CHECKPOINT`

Commit `1feda622` is immutable and verified on the remote, so the checkpoint value is already realized.
Production has **one analysis in the product's lifetime**, so deployment buys no traffic evidence; KG
deployment is separately staged and independently blocked; six full workflows and seven PDFs already
executed locally. Deploying would expose a **LEVEL_1** engine carrying **13 SAFETY_BLOCKERs** to real
safety professionals. **No technical evidence requires production.**

### 29.11 RC-02 / RC-03 and KG5C-DISC-01 placement

RC-02 and RC-03 are **preserved, unfixed, and scheduled into L3-4** — the slice owning retrieval,
jurisdiction filtering and candidate-set membership. Fixing earlier is premature; fixing later would let
Level 3 inherit a corrupted candidate set. **RC-03 must not be closed by editing `evidence-foundation.ts`.**

`KG5C-DISC-01` keeps `DEFECT_NONBLOCKING — CUSTOMER_VISIBLE_ON_GENERATED_REPORT`, owner SOURCE. It is a
legacy content-generation defect, **independent of and outside** the Level-3 scope, repaired in a SOURCE
slice at the owner's discretion.

### 29.12 KG compatibility

**The KG architecture remains valid and is not reopened.** The interface between the Level-3 engine and
KG has exactly two directions: KG supplies eligible candidates and reviewed artifact bytes; the engine
returns a selection among those candidates. Nothing else crosses. Level 3 adds runtime reasoning only —
learning remains Level 4, and knowledge freshness remains governed.

---

## 30 — L3-1 REASONING CONTRACT + VALIDATOR (2026-08-22) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_1_COMPLETE — REASONING_CONTRACT_AND_VALIDATOR_ESTABLISHED — CUSTOMER_AUTHORITY_UNCHANGED`

Evidence: `verification/hazlenz-l3-1-reasoning-contract-2026-08-22/`. **Uncommitted.** No model
inference, no provider selected, no SDK, no network, no migration, production untouched.

### 30.1 Current authority `STABLE_INVARIANT` for this slice

> **`CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.**

Level 3 is **not** operational. What exists is a typed contract and a deterministic validation
boundary that nothing on the customer path invokes.

### 30.2 Implemented now

`backend/src/safescope-v2/reasoning-l3/` — versioned input contract (`hazlenz.l3.input.v1`),
proposal contract (`hazlenz.l3.proposal.v1`), eight explicit condition states, evidence-reference type,
provider abstraction with six failure kinds, an inference-free `UnavailableReasoningProvider`,
validation states with 22 stable reason codes, the deterministic validator, the `ValidatedReasoning`
type, and the safe-failure outcome union. Plus a 48-assertion pure suite
(`npm run test:l31-reasoning-contract`) and one added `package.json` script line — dependencies
byte-identical to HEAD.

### 30.3 NOT implemented

Actual model/provider · semantic inference · customer-path integration · the semantic authority
transition · regulatory applicability reasoning · Level-3 corrective action · Level-3 risk factors ·
`L3_COMPARE` · sealed acceptance.

### 30.4 How "no customer authority" is proven

1. **Reachability** — no pre-existing source file imports `reasoning-l3`; it is in no Nest module, so
   it cannot be injected; the only importer is its own test.
2. **Zero modification** — `git diff` over `intelligence-orchestrator.service.ts` and
   `safescope-v2.service.ts` is empty; the seam and its call site were not touched.
3. **Measured behavioural invariance** — the frozen 66-scenario matrix re-run post-L3-1, with
   volatility **derived empirically** from two runs of identical code (7 volatile paths, all per-run
   ids/timestamps). Excluding only those: **0 non-volatile differences across 66 scenarios.**

> `DO_NOT_REDISCOVER` — a first comparison used a **declared** volatility list and reported all 66 as
> differing while every customer-decisive field was identical. The declared list was wrong, not the
> engine. Volatility must be derived, per `KG4E-D3` and the KG-4B precedent. This is the third time
> the programme has learned this; the corrected method is in
> `customer-authority-invariance.json`.

### 30.5 What the validator can and cannot do `STABLE_INVARIANT`

It enforces **contracts**, not meaning. Mechanical today: source existence, offset bounds, exact
`quotedText` equality, immediately-preceding governing-negation truncation, corrective-action grounding
within the candidate's own evidence, candidate-id membership, taxonomy closure, condition-state
legality, duplicate detection, outcome coherence, governance/regulatory-text refusal.

**`L3-INV-11`'s semantic half is explicitly NOT claimed at L3-1** — whether the chosen span is the
*right* evidence, and whether a distant negation still governs, is L3-2's work. The validator must
never grow into a second reasoning engine (section 29 contradiction C-1).

### 30.6 Regression posture

`test:hazlenz-core` reproduces **28/30** — the two documented failures (§13.1) and no third.
KG contracts unchanged: KG-4A 146/146, KG-4B 123/123, KG-3F `56.14132` 16/16, evidence-foundation 35.
`backend/src/standards/` is byte-unmodified.

---

## 31 — L3-2 SEMANTIC REASONING, EVIDENCE BINDING AND DUAL RUN (2026-08-22) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_2_PARTIAL — SEMANTIC_REASONING_NOT_VALIDATED_FOR_ADVANCEMENT`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Nothing committed or pushed. Evidence:
`verification/hazlenz-l3-2-semantic-reasoning-2026-08-22/`.

**This section records what executable evidence proved. Where a thing was implemented but not
verified, or measured but not made authoritative, it says so.**

### 31.1 Provider — VERIFIED for evaluation, OPEN for production

Selected for L3-2's controlled dual run: a **locally hosted model via Ollama**, `qwen3-coder:30b`,
pinned by content digest `06c1097efce0…`, at `temperature 0`, `seed 20260822`, `num_ctx 8192`,
60 s timeout. Zero SDK added — transport is the platform `fetch`, and `backend/package.json`
dependencies are byte-identical to HEAD.

> #### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

It was **not** chosen on convenience. `PROVIDER_REQUIREMENTS.md` requires candidates to be scored
from official documentation **and then run** against the DEVELOPMENT cohort. No hosted-provider
credential is resolvable on this machine (`ANTHROPIC_API_KEY` unset, no `ant` profile, the
`OPENAI_API_KEY` present is an 11-character placeholder, no key in any of nine project `.env`
files), so the second step could not run for any hosted candidate and a paper selection was refused.
Anthropic Claude is documented as the strongest hosted candidate — constrained-decoding structured
output, zero-data-retention agreements available against a 30-day default — with sources and
retrieval dates in `PROVIDER_SELECTION.md`.

**Portability finding:** the L3-2 schema uses `minLength` and `minItems: 2`, neither of which
Anthropic's structured outputs support. Nothing is lost, because the validator enforces both
independently — the payoff of putting guarantees in the validator rather than the schema.

### 31.2 Inference input boundary — VERIFIED

`reasoning-input-builder.ts` is the only sanctioned constructor, and exclusion is **structural**:
`ReasoningInputRequest` has no field for a personal name, site identity, account id, credential,
billing datum, unrelated record, governed review state, release id or standards text. The suite
asserts this by reading the interface's own source. Redaction (email, phone, SSN, street address,
mine id, employee id, URL) runs **before** the text becomes the canonical source, so evidence offsets
index the redacted string and a span cannot quote something never sent.

### 31.3 Semantic interpretation and evidence binding — IMPLEMENTED and MEASURED

The model supplies quotations; **the adapter computes offsets by exact substring search**, and
binding is non-repairing — an unbindable quote gets `[-1,-1]` and is rejected as
`EVIDENCE_OUT_OF_BOUNDS` rather than snapped to a nearby real span. Measured: **153 quotations, 0
non-verbatim.**

The validation sequence is four stages and nothing may skip one:

```
provider → offset binding → deterministic validator → semantic evidence binder → outcome
```

`semantic-evidence-binding.ts` answers L3-INV-11's semantic half with six checks —
`SEMANTIC_NEGATION_UNADDRESSED`, `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE`,
`SEMANTIC_ACTION_NOT_CONDITION_EVIDENCE`, `SEMANTIC_EVIDENCE_NOT_SELECTIVE`,
`SEMANTIC_CANDIDATES_NOT_INDEPENDENT`, `SEMANTIC_ADVISORY_ECHO`.

**Stated precisely, because overclaiming here would be the worst error in this section: this is not
an entailment prover.** It tests falsifiable consequences of a claim against the cited span and the
clause containing it. No L3-1 file was modified; the validator still enforces contracts only.

### 31.4 The measured result, and why the phase closes PARTIAL

| | Hazard detection | High-consequence misses | False ACTIVE (31 negative rows) |
|---|---|---|---|
| Model + deterministic validator | **32/32** | **0** | 1 |
| **Shipped pipeline** (+ semantic binder) | 30/32 | **1** | 1 |
| Level-1 baseline | 25/32 | — | 6 of 12 negative controls |

The high-consequence miss is a **hard gate**. Its cause is the binder this phase built, not the
provider: on `B08` and `C11` the binder rejected correct candidates because `clauseAround()` treats a
comma-delimited run as one clause. **Deliberately not fixed after seeing the holdout** — the
remediation is specified in `NEXT_ACTION.md` and needs a new holdout.

One genuine reasoning error: `B10` ("the rail … did not look right to me") became `ACTIVE` where a
clarification was owed. **0 clarifications were raised across 66 scenarios**, so the "≤5 unnecessary"
threshold passes trivially while "0 decision-critical missed" does not.

### 31.5 Dual run and comparison — VERIFIED

> #### `L3_COMPARE` — comparison evidence only, never customer output

The harness boots no Nest module and touches no database. Adjudicated against frozen expectations,
not against Level 1: **Level-3 correct / Level-1 incorrect on 25**; Level-1 correct / Level-3
incorrect on 2; both correct on 36; both incorrect on 0; ambiguous 3. Level 1 attaches an evidence
span to none of its hazards and asks questions on 50 of 66; Level 3 attaches a verified span to every
hazard and asks none.

### 31.6 Customer-authority invariance — MEASURED

Pristine `git archive` of HEAD versus the same archive plus every uncommitted L3-1 and L3-2 file,
through the real customer pipeline. Volatility **derived empirically** from two same-code runs — the
same 7 per-run id/timestamp paths L3-1 derived. **0 scenarios with a non-volatile difference over
66.** `test:hazlenz-core` remains 28/30, the two documented failures only.

### 31.7 Operational — MEASURED, PROPOSED as future budgets, NOT authoritative

162 analyses: median **4.3 s**, p90 5.7 s, p95 9.0 s, max 13.6 s; 936 input / 257 output tokens mean;
retry 0%, malformed 0%, timeout 0%; marginal cost $0. Proposed future budgets: p95 ≤ 12 s, ≤ 1 200
input and ≤ 900 output tokens. **Reproducibility is ~98.5%, not 100%** — two seeded runs at
temperature 0 agreed on 65 of 66 scenarios.

### 31.8 Holdout identity

`backend/src/safescope-v2/reasoning-l3/eval/holdout-l32.json`, sha256
`41ae3c229a4e81adeffe827e42e587c107df870d75acbe208fe3914479523e2d`, frozen **before** the first
inference run, derived by a fixed deterministic translation from the capability-acceptance matrix
(`c298f148…`, itself frozen before execution by an earlier phase). It has now been opened and is
**retired for gate purposes**; it remains valid as a development set.

### 31.9 Deferred to L3-3 and later

Applicability reasoning as a **second scoped call** (decided, not built — D-L32-1); hazard
decomposition and condition state becoming semantic (L3-3); jurisdiction (L3-4); risk and corrective
action (L3-5). **L3-3 must not start until L3-2b closes** with zero high-consequence misses through
the full shipped pipeline.

---

## 32 — L3-2b SEMANTIC BINDER PRECISION AND FRESH SEALED HOLDOUT (2026-08-22) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_2B_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2b-binder-precision-2026-08-22/`. **§31 is not rewritten — L3-2 closed
PARTIAL and that remains the historical record.**

### 32.1 What L3-2 got wrong about its own failure — VERIFIED

`NEXT_ACTION.md` attributed `B08` to the selectivity check. Re-execution with full per-stage traces
showed `B08` failing through **`SEMANTIC_NEGATION_UNADDRESSED`** instead. Both failure modes are real
and which one fires depends on how the model chose spans, so both were remediated — and the
mis-attribution is recorded rather than quietly corrected.

**The dominant root cause was one line:** `clauseAround()` treated only `.;:!?` as clause boundaries,
so on a field note the whole note was one "clause" and any negation in it governed every span in it.
Three of five reproductions failed through exactly that.

### 32.2 The five repairs — IMPLEMENTED

| # | Repair | Measured effect |
|---|---|---|
| R1 | negation **scope** replaces negation **proximity** (new `negation-scope.ts`) | the rule fired once in 81 sealed scenarios |
| R2 | issues are **FATAL or ADVISORY**; selectivity and family relevance advisory | whole-sentence evidence no longer rejected |
| R3 | control-in-place vocabulary gains isolation/verification language | energy isolation now reads as a control, as it should |
| R4 | clarification policy + carrier-candidate rule in the prompt | precision 1/1, **0 unnecessary** |
| R5 | the volatile analysis id removed from the prompt | **reproducibility 100%**, up from 98.5% |

Two defects were found by the work itself: a **regex alternation-order bug** where `no` shadowed
`not`/`none`/`nor`/`neither` (negation blindness reintroduced by a regex detail, caught by a paired
fixture before any corpus run), and an **over-aggressive family-relevance rule** which deleted 8
candidates in 30 development scenarios before being demoted to advisory.

### 32.3 The fresh sealed holdout — VERIFIED

`holdout-l32b.json`, sha256 `e3a3c7eee64703a27a8ac9c5da732f6919d8a35fb76859bfb30729c44f7f5060`,
81 scenarios, frozen before first execution, sharing no scenario with the retired L3-2 holdout.
Provenance is three-part and the weak part is named: **40** deterministically sampled (every 5th) from
`safescope-field-validation-dataset.v1.json` and **12** from the capability-acceptance diagnostics —
both authored by earlier phases and never run against Level-3 — plus **29 authored by this phase**,
because neither independent source contains a single negative control, corrected state, subjective
observation or clarification case.

### 32.4 The result, at three tiers — MEASURED

| | RAW | POST-VALIDATOR | **SHIPPED** |
|---|---|---|---|
| Hazard detection | 60/62 | 60/62 | **59/62** |
| High-consequence misses (33 HC) | 0 | 0 | **1** |
| False ACTIVE (19 non-active) | 1 | 1 | **0** |
| Condition state | 96.3% | 96.3% | **96.3%** |
| Clarification recall / precision | 1/3 · 1/1 | 1/3 · 1/1 | **1/3 · 1/1** |

**The binder now earns its place** — it removed the model's only false ACTIVE and took negative
controls to zero. It also still costs one correct high-consequence finding, which is why this closes
PARTIAL. Fabricated quotations: **0 of 75**. Reproducibility: **81/81**.

### 32.5 Why the gate still fails — ROOT-CAUSED, NOT FIXED

`H-AM-05`: "the lower hinge pin **is sheared off**" was not recognised as factual because `sheared`
is absent from `FACTUAL_CONDITION_TOKENS`, so the new impression gate deleted a correct
high-consequence ACTIVE. **Not fixed after the holdout was opened**, which is the only reason the
number means anything.

> **The pattern is now the finding.** Three times in two phases a *closed vocabulary list used as a
> gate* has produced a false rejection: control-in-place (L3-2), family relevance (L3-2b
> development), factual condition (L3-2b holdout). L3-2c should change the polarity of such tests —
> ask whether a sentence is *only* an impression rather than whether a listed word appears — instead
> of extending lists a fourth time.

### 32.6 Customer authority and regression — MEASURED

Pristine `git archive` of HEAD vs HEAD plus all uncommitted L3-1/L3-2/L3-2b work, through the real
customer pipeline, volatility derived empirically: **0 non-volatile differences over 66 scenarios**,
the same 7 volatile paths every prior phase derived. `test:hazlenz-core` 28/30 — the two documented
failures only. Two prerequisite-dependent suites fail **byte-identically from pristine HEAD**.

### 32.7 Deferred to L3-2c

Three specified, unimplemented fixes: impression-gate polarity, `hasPredicate()` at bare-conjunction
boundaries, and clarification recall. `NEXT_ACTION.md` carries the fixtures. **L3-3 must not start
until L3-2c closes** with zero high-consequence misses and clarification recall ≥ 2/3.

> **Outcome, recorded by §33:** all three were implemented and all three work. L3-2c nonetheless
> closed **PARTIAL** — on clarification *precision* and a new provider-stage high-consequence
> regression, neither of which existed when this paragraph was written.

---

## 33 — L3-2c GATE POLARITY, CONJUNCTION SCOPE AND CLARIFICATION CARRIAGE (2026-08-22) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_2C_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2c-gate-polarity-2026-08-22/`. **§31 and §32 are not rewritten — L3-2 and
L3-2b each closed PARTIAL and that remains the historical record.** No dependency changed.

### 33.1 The pattern that L3-2b named is now closed as a mechanism `STABLE_INVARIANT`

> #### `CLOSED_POSITIVE_VOCABULARY_MUST_NOT_BE_AN_ADMISSION_GATE`

L3-2b recorded that a closed vocabulary list used as a gate had produced three false rejections in
two phases. L3-2c confirms a **fourth**, in the same check, failing the *other* way: the gate's
ENTRY condition was also a list, `struck me as` was absent from it, and `H-AM-01` was therefore
admitted as **ACTIVE** with no gate run at all — a latent false ACTIVE that L3-2b's pipeline result
concealed because its model happened to return no candidate. `L3-2C-DISC-01`.

**Why extending the list was refused for a fourth time.** English has an unbounded supply of ways to
say a thing is broken. Every word missing from an admission list deletes a real hazard, and the L3-2b
holdout proved that costs a high-consequence finding. The polarity was inverted instead:

| | asks | fails by |
|---|---|---|
| retired (L3-2b) | *does this evidence contain one of our known factual-condition words?* | deleting a valid fact whose verb nobody listed |
| current (L3-2c) | *is this evidence ONLY an unsupported, subjective impression?* | admitting a hedged claim whose hedge nobody listed |

The remaining vocabularies sit on the **impression** side, where a missing word costs precision —
measurable against negative controls and recoverable — rather than a hazard. **That asymmetry is the
mechanism, not an implementation detail.**

### 33.2 What replaced the vocabulary test — `impression-scope.ts`

A new module parallel to `negation-scope.ts`, deliberately **not** importing it, because negation
scope and impression scope answer different questions and must change independently. Evidence is
split into predication segments and each is classified by the SHAPE of what it asserts:

| class | test | example |
|---|---|---|
| `IMPRESSION` | a perception or epistemic predicate about the observer, or an epistemic hedge governing the whole predication | "did not look right to me", "may be cut" |
| `OBSERVER_ACTION` | a first-person report of what the inspector did | "I walked underneath it" |
| `FACTUAL` | a **non-observer subject with an unhedged predication of any kind** | "the lower hinge pin is sheared off" |
| `NEITHER` | no predication at all | a bare noun phrase |

Evidence is *only an impression* when at least one segment is `IMPRESSION` and **no** segment is
`FACTUAL`. **No condition vocabulary is consulted at any point** — `sheared`, `parted`, `unpinned`
and every word nobody has thought of yet are factual for the same structural reason.

Two rules are load-bearing and were both found by a failing paired fixture, not by design:

* **`OBSERVER_ACTION` must be distinct from `IMPRESSION`.** Collapsing them deletes
  "I saw the guard was missing".
* **The hedge test must run BEFORE the predication test.** "may be cut" carries no finite verb this
  module recognises, so a predication-first order classified `H-AM-02` as `NEITHER` and let a hedged
  claim through as ACTIVE — the precision pole failing while the recall pole passed. A **copula does
  not count** as a predication preceding a hedge: "the drum IS possibly leaking" is hedged.

### 33.3 Bare-conjunction predicate scope — `H-FLD-141`

`negationScopes()` applied `hasPredicate()` at commas and nowhere else; `and` sat in
`CLAUSE_STARTERS` only as `and separately`. The same test now runs at bare conjunctions —
**one missing call site, as L3-2b predicted.**

**The bare conjunction is held to a STRICTER test than the comma, deliberately.** A comma is already
a syntactic break, so a participle suffices; a bare `and` is the ordinary way to continue a negated
list, so only a **finite verb** ends scope there. `or` and `nor` never end scope.

```
"no LOTO is applied and the guard IS missing"   finite verb -> new clause, scope ends
"no guardrail and no toeboard"                  none        -> continuation, scope crosses
"no guardrail, safety net or personal fall arrest system in use"   RC-08, scope crosses (unchanged)
```

B08's bare `while`, C11's comma behaviour, A10's `and separately` and the alternation-order fix are
all measured unchanged.

### 33.4 Clarification carriage — the pipeline was discarding its own conclusion

Root-cause execution separated two different failures behind "recall 1 of 3": `H-AM-01` produced
**no candidate at all**, and `H-AM-02` produced an ACTIVE with `clarification: null`. On the second,
the binder raised `SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE` **and**
`SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED` — then deleted the candidate, destroying the only
carrier the question could travel on.

The repair is **demotion, not deletion**, for that one code only and only from ACTIVE: the candidate
is kept at `INSUFFICIENT_EVIDENCE` with a clarification derived mechanically from its own cited
evidence. Any other fatal code still deletes, and a candidate carrying a second fatal code alongside
it is deleted rather than demoted — an impression is a reason to ask a question, fabricated or
contradicted evidence is not. **This is not a redesign of clarification transport:** a clarification
remains a field on a hazard candidate, which is L3-2b's carrier-candidate architecture. It stops the
pipeline destroying the carrier it had just decided it needed.

`H-AM-01` cannot be repaired in the binder — the binder may refuse a candidate, never invent one
(L3-INV-08) — so the prompt moved the impression branch **into** the condition-state ladder as a
required output shape. That worked, and §33.6 records what it cost.

### 33.5 The result on a fresh sealed holdout — MEASURED

`holdout-l32c.json`, sha256 `33c69b36a7efd9ed4e2e79d2f1b1b29472e7bc6a85dd4feefc5bcef5608f56e2`,
72 scenarios, frozen **before the repair code was written** and byte-identical after execution.
40 independent (field dataset, stride `i % 5 === 2`, provably disjoint from L3-2b's `i % 5 === 0`)
plus 32 authored by this phase. Overlap against all three prior sets: **0 ids, 0 texts**, enforced by
a throw in the builder.

| | RAW | POST-VALIDATOR | **SHIPPED** |
|---|---|---|---|
| Hazard detection | 51/54 | 51/54 | **47/54** |
| High-consequence misses | **0** | **0** | **0** |
| False ACTIVE (18 non-active) | 0 | 0 | **0** |
| Negative-control false ACTIVE (8) | 0 | 0 | **0** |
| Condition state | 95.8% | 95.8% | **90.3%** |
| Clarification recall / precision | 3/3 · 3/7 | 3/3 · 3/7 | **3/3 · 3/7** |

Fabricated quotations **0 of 69**. Reproducibility **72/72**. Multi-hazard **4/4**. Stage attribution
of the seven shipped misses: **binder 4, provider 3, validator 0, clarification gate 0, integration
0** — none high-consequence.

On the **retired** L3-2b holdout (`REGRESSION_EVIDENCE` only): `H-AM-05` and `H-FLD-141` are both
repaired, detection 59→60, condition state 96.3%→97.5%, clarification recall 1/3→3/3, and **the
binder now removes nothing at all** — in L3-2b it removed five candidates.

### 33.6 Why the gate still fails — ROOT-CAUSED, NOT FIXED

Two gates fail, both the same trade in the same place: **recall bought with precision by the prompt
change**, which is the one L3-2c change that can alter model behaviour.

1. **Four unnecessary clarifications** (`C-FLD-138`, `C-CS-05`, `C-AM-04`, `C-AM-06`) where L3-2b had
   zero. The required output shape fires on candidates whose decision is already made.
2. **A new high-consequence regression, `H-NG-02`**, on the regression set: the model now returns
   zero candidates for "no standing water …, **and** the flexible cord … worn through to the
   conductors", which L3-2b classified correctly. Reproducible across three runs; the same shape
   recurs as `C-NG-05`.

> **A prompt is a ranking.** This phase lengthened the `INSUFFICIENT_EVIDENCE` rung and did not
> re-measure the `ACTIVE` rung directly beneath it. Both failures follow from that, and both fixes
> pull the same direction, so they must be made and measured together.

**Neither was fixed after the holdout was opened**, which is the only reason §33.5's numbers mean
anything. `NEXT_ACTION.md` carries both, with fixtures.

### 33.7 Defects recorded, deliberately unfixed

| id | defect | why not fixed |
|---|---|---|
| `L3-2C-DISC-01` | the impression gate's ENTRY was a closed list; `struck me as` admitted a false ACTIVE | **closed incidentally** by the structural test |
| `L3-2C-DISC-02` | **no check owns** "ACTIVE contradicted by control-in-place evidence"; the retired gate refused it only by the accident of an absent factual word | a fourth remediation area, outside scope |
| `L3-2C-DISC-03` | `HAZARD_NEGATION_OBJECTS` matches `hazard` inside "without **hazard** warning labels", where it is a modifier and `warning labels` is the head. Cost 4 correct HazCom findings | found **after** the holdout was opened |
| `L3-2C-DISC-04` | `CORRECTION_TOKENS` contains `applied`, so "**no** LOTO **is applied**" reads as a correction | same class as DISC-03 |

> **DISC-03 and DISC-04 are the same pattern one level deeper.** §33.1 fixed the **polarity** of one
> gate. These two are closed vocabularies consulted without regard to the **syntactic role** of the
> match — `hazard` as a modifier, `applied` inside a negation. A future slice should give
> `checkContradiction` and `checkStateSupported` the same structural treatment rather than pruning
> three more word lists.

### 33.8 Customer authority and regression — MEASURED

Pristine `git archive` of HEAD versus HEAD plus all uncommitted L3-1/L3-2/L3-2b/L3-2c work, through
the real customer pipeline on a disposable database, volatility derived empirically: **0
non-volatile differences over 66 scenarios**, the same 7 volatile paths every prior phase derived.
Structural corroboration: `diff -rq` over the two checkouts' `backend/src` reports exactly one
difference — the **added** `reasoning-l3` directory.

`test:hazlenz-core` **28/30** — the two documented failures only, no third. Offline suites: L3-2c 85,
L3-2b 105, L3-2 179, L3-1 48, all 0 failed. KG contracts unchanged. Both prerequisite-dependent
suites were executed from **both** checkouts and fail byte-identically from pristine HEAD.

`L3_COMPARE` on the fresh holdout: Level-3 correct / Level-1 incorrect on **39**; Level-1 correct /
Level-3 incorrect on 2; both correct 26; both incorrect 5. Level 3 attached a verified evidence span
to 56 findings, Level 1 to **0**.

### 33.9 Deferred to L3-2d

The two prompt-precision fixes above, together, accepted against a fourth sealed holdout built with
stride `i % 5 === 4` over the 120 unused field scenarios. The three `DISC` defects remain open.
**L3-3 must not start until L3-2d closes** with zero unnecessary clarifications, recall ≥ 2/3, zero
high-consequence misses, and `H-NG-02` recovered.

> **Outcome, recorded by §34:** both fixes were implemented and both work — `H-NG-02` is recovered
> and the L3-2b holdout now scores 62/62 with clarification precision and recall both 100%. L3-2d
> nonetheless closed **PARTIAL**, and it reclassified `DISC-03`/`DISC-04` from ordinary-quality debt
> to **capable of high-consequence loss** on measured evidence. That reclassification, not the D1/D2
> gates, is what now stands between this stage and L3-3.

---

## 34 — L3-2d CLARIFICATION PRECISION AND ACTIVE-RUNG RECOVERY (2026-08-22) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_2D_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2d-clarification-precision-2026-08-22/`. **§31, §32 and §33 are not
rewritten — L3-2, L3-2b and L3-2c each closed PARTIAL and that remains the historical record.** No
dependency and no `package-lock.json` change.

### 34.1 The method this phase adds to the programme `STABLE_INVARIANT`

> #### `A_PROMPT_CLAIM_IS_PROVEN_BY_ABLATION_OR_NOT_AT_ALL`

Three phases had now changed the system prompt and argued about the consequences from reading it.
L3-2d stopped arguing. `scripts/ablate-l32d-prompt.ts` holds the **model, seed, temperature, schema,
user prompt and observation text constant** and varies **only** the system prompt, so a behavioural
difference is attributable to the prompt region and to nothing else.

The L3-2b prompt was recovered by inverting the L3-2c edits and **validated empirically rather than
asserted**: under it, `H-NG-02` reproduced the `electrical/ACTIVE` candidate L3-2b recorded. The
historical texts are now frozen in `eval/prompt-variants-frozen.json` and hash-verified on every run
(v2 `676eb15e…`, v3 `c62ff3ea…`, v4 `85019257…`); the harness **refuses to start** on a mismatch, so
no future comparison can run against a prompt that never existed.

### 34.2 D1 — a clarification belongs only where the decision is open

L3-2c's block said `you MUST ... filled-in clarification` and out-ranked an advisory line seven lines
from the end of the prompt. Measured: `C-FLD-138` and `C-AM-04` carried a question on an **ACTIVE**
candidate, `C-CS-05` on a **HYPOTHETICAL** one.

**D1 was two sub-causes that L3-2c filed as one.** `C-AM-06` is half D2 — its *state* was wrong, and
given that state its question was legitimate. Recorded rather than merged.

The repair is stated where it can be proven. `L3-INV-06` is a **decision-boundary** invariant, and
the eight condition states divide exactly: `INSUFFICIENT_EVIDENCE` and `UNKNOWN` say the decision was
not made; **the other six are the decision**. A question on one of the six is not a clarification
under the contract, so it is now dropped deterministically — the hazard, its family, its state, its
evidence and its rationale returned untouched, the removal recorded as an advisory. It runs **after**
L3-2c's demotion, so a candidate the impression gate moved to `INSUFFICIENT_EVIDENCE` keeps the
question it was demoted in order to carry; that composition has its own fixture.

> **A prompt cannot deliver a zero.** The gate demands zero unnecessary clarifications, and prose can
> only make that likely. The guarantee was therefore placed in the binder, where it is provable.

### 34.3 D2 — the ladder is a ranking, and L3-2c raised the wrong rung

L3-2c inserted a **9-line** required-output-shape block **inside** the ordered condition-state
ladder, directly beneath ACTIVE, making `INSUFFICIENT_EVIDENCE` the longest rung — 10 lines against
ACTIVE's 4. Measured under ablation: `H-NG-02` and `H-NG-03` fell from one ACTIVE candidate to
**zero**.

The repair moves the block **out** of the ladder into its own `ASKING A QUESTION` section, leaves a
one-line pointer on the rung, and adds the rule the failures were really about:

> **A NEGATION GOVERNS ONLY ITS OWN CLAUSE.** A safe clause never cancels an unsafe one, and
> returning no candidate because the sentence happened to open with "no" is one of the worst errors
> you can make.

That aligns the prompt with the clause-level negation scope the binder has enforced since L3-2b.

> **`DELIBERATELY_REVERSED`** — §33 asserted the shape belonged *inside* the ladder, and
> `test:l32c-gate-polarity` asserted it. That assertion is **inverted**, not deleted, with the
> ablation evidence recorded beside it. Three further prior-phase assertions on literal prompt
> sentences were rebound to the guarantees they protect, which L3-2d strengthened.

### 34.4 The result on a fresh sealed holdout — MEASURED

`holdout-l32d.json`, sha256 `bd5f0c2d514784af0662e01f546aa9d7cd4986cd5c8dcea59980724181935af7`,
77 scenarios, frozen **before the repair code was written**, byte-identical after execution. 40
independent (stride `i % 5 === 4`, pairwise disjoint from L3-2b's `i%5===0` and L3-2c's `i%5===2`)
plus 37 authored. Overlap against all four prior sets: **0 ids, 0 texts**, enforced by a throw.

| | RAW | POST-VALIDATOR | **SHIPPED** |
|---|---|---|---|
| Hazard detection | 55/56 | 55/56 | **54/56** |
| High-consequence misses (51 HC) | 1 | 1 | **2** |
| False ACTIVE (21) | 1 | 1 | **1** |
| Negative-control false ACTIVE (8) | 0 | 0 | **0** |
| Condition state · corrected state | 97.4% · 4/4 | 97.4% · 4/4 | **96.1% · 4/4** |
| Clarification TP/FP/FN | 5/2/1 | 5/2/1 | **5/2/1** |

Fabricated quotations **0 of 75**. Reproducibility **77/77**. Multi-hazard **4/4**. Validator
rejections **0**. Stage attribution of the two high-consequence losses: **binder 1, provider 1**.

On the **retired** sets (`REGRESSION_EVIDENCE` only) both L3-2c blockers are closed: the L3-2b
holdout now scores **62/62, zero high-consequence misses, zero false ACTIVE, 100% condition-state
accuracy and clarification precision and recall both 100%**, with `H-NG-02` recovered as
`electrical/ACTIVE` and no loss at any stage. The L3-2c holdout improves 47→49 with unnecessary
clarifications 4→1.

> **`H-NG-02` recovery is general.** Nothing in the repair names it, its words, or any scenario id.
> On six new `negation_then_fact` scenarios in the fresh set, five recovered.

### 34.5 Why the gate still fails — ROOT-CAUSED, NOT FIXED

Four gates fail. `D-CR-04` and `D-NG-04` are the two halves of one oscillation:

| id | wrong direction |
|---|---|
| `D-CR-04` "I was too far away to see whether they were tied off" | asserted **ACTIVE** where a question was owed |
| `D-NG-04` "No flammable atmosphere was detected … the fitter went inside with the agitator still on line" | retreated to **INSUFFICIENT_EVIDENCE** where the facts are stated |

> **Three phases have now moved this balance with prose and each traded one error for the other.**
> L3-2c pulled toward INSUFFICIENT_EVIDENCE and lost `H-NG-02`; L3-2d pulled toward ACTIVE and lost
> `D-CR-04`. The next slice must stop tuning emphasis and give the ladder a **discriminator**: the
> checkable difference is that `D-NG-04` records *what was observed* while `D-CR-04` records *an
> inability to observe the deciding fact*.

### 34.6 `DISC-03` and `DISC-04` RECLASSIFIED — `CAPABLE_OF_HIGH_CONSEQUENCE_LOSS`

**This outranks everything else in this section.** Carried since L3-2c as ordinary-quality debt, they
are now proven — by minimal fixture and by a real loss on the sealed set — to delete correct
high-consequence findings.

> Main plant electrical panel is blocked by a pile of **discarded** conveyor rollers and debris.

`CORRECTION_TOKENS` contains `discarded`. Here it is an **adjective on the debris**, but
`checkContradiction` matches the word without regard to its syntactic role and deleted `D-FLD-175`, a
correct, evidence-bound, **high-consequence electrical** finding. `DISC-03` is the same shape:
`hazard` as a modifier inside "without **hazard** warning labels", where the head noun is *warning
labels* and their absence IS the hazard.

**No mandatory Level-3 invariant is demonstrated violated.** `L3-INV-02` is not engaged — the
findings were evidence-bound and deleted, not fabricated. `L3-INV-04` is not engaged — these defects
**delete** ACTIVE, never create it. `L3-INV-05` and `L3-INV-10` hold. `L3-INV-11` is *arguably
engaged* by `DISC-04`, which mis-reads a correction token inside a negation, but the deletion is made
by `checkContradiction`, not by the negation-scope engine that invariant governs; recorded as
engaged-but-not-proven-violated. They are a hazard-**recall** failure, governed by the advancement
gate rather than by an invariant — **and that is sufficient to make a further precision slice
mandatory before L3-3.**

`DISC-02` stays **open as a precision risk with zero measured losses**: it can only let a provider
error stand, never delete a hazard, and across four sealed holdouts the provider has not made that
error. Every fatal check this programme has added deleted a correct hazard before it earned its
place; adding a seventh is not obviously the right trade.

> **The pattern §32.5 named is now six instances deep and has TWO faces.** L3-2c fixed the
> **polarity** of one gate. `DISC-03` and `DISC-04` are the same closed vocabularies consulted
> without regard to the **syntactic role** of the match. The treatment is known and proven — replace
> the membership test with a structural one — and `checkContradiction` and `checkStateSupported` are
> the two checks that still need it.

### 34.7 Customer authority and regression — MEASURED

Pristine `git archive` of HEAD versus HEAD plus all uncommitted L3-1/L3-2/L3-2b/L3-2c/L3-2d work,
through the real customer pipeline on a disposable database, volatility derived empirically: **0
non-volatile differences over 66**, the same 7 volatile paths every prior phase derived. `diff -rq`
over the two checkouts' `backend/src` reports exactly one difference — the **added** `reasoning-l3`
directory. Zero Nest or repository decorators inside it, zero importers outside it, seam and
`backend/src/standards/` byte-unchanged: Level 3 holds no persistence, reporting or governed-content
authority.

`test:hazlenz-core` **28/30** — the two documented failures only. Offline suites: L3-2d 70, L3-2c 86,
L3-2b 105, L3-2 179, L3-1 48, all 0 failed. KG contracts unchanged. Both prerequisite-dependent
suites executed from **both** checkouts and fail byte-identically from pristine HEAD.

`L3_COMPARE` on the fresh holdout: Level-3 correct / Level-1 incorrect on **45**; both correct 29;
Level-1 correct / Level-3 incorrect 3; both incorrect **0**. Level 3 attached a verified evidence
span to 64 findings, Level 1 to **0**.

### 34.8 Deferred to L3-2e

The syntactic-role treatment for `checkContradiction` and `checkStateSupported`, and the
observe/could-not-observe discriminator for the ladder — made independently but **measured
together**. Accepted against a fifth sealed holdout using stride `i % 5 === 1` over the unused
`fall_protection` scenarios: strides 1 and 3 remain entirely untouched, and two of the dataset's six
families have never appeared in any sealed set. **L3-3 must not start until L3-2e closes** with zero
high-consequence misses, zero unnecessary clarifications, 100% required-clarification recall, and
`DISC-03`/`DISC-04` demonstrated no longer capable of high-consequence loss.

> **Outcome, recorded by §35:** both repairs were implemented and both work. `DISC-04` is fully
> closed and `DISC-03` largely so; the clarification axis reached **100% precision AND recall** on
> fresh sealed evidence, and sealed family coverage went from 15 to **23 of 24** families. L3-2e
> nonetheless closed **PARTIAL** on two provider-stage high-consequence misses, introduced two small
> regressions of its own, and recorded an `L3_2E_SCOPE_CONTRADICTION` in `negation-scope.ts` — a
> module it was forbidden to repair.

---

## 35 — L3-2e SYNTACTIC-ROLE SEMANTIC SUPPORT AND OBSERVATION AVAILABILITY (2026-08-23) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_2E_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `L3_2E_SCOPE_CONTRADICTION` — recorded, not acted on
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence: `verification/hazlenz-l3-2e-syntactic-role-2026-08-23/`.
**§31–§34 are not rewritten — L3-2, L3-2b, L3-2c and L3-2d each closed PARTIAL and that remains the
historical record.** Dependency graph and `package-lock.json` byte-identical to HEAD.

### 35.1 The pattern's SECOND face is now closed too `STABLE_INVARIANT`

> #### `A_TOKEN_MAY_ACT_ONLY_IN_THE_ROLE_IT_ACTUALLY_PLAYS`

§32.5 named the closed-vocabulary pattern; §33.1 fixed its **polarity** in one gate; §34.6 measured
its **syntactic-role** face and reclassified `DISC-03`/`DISC-04` as capable of high-consequence loss.
L3-2e closes that face in the two checks that carried it, and `predicate-role.ts` is the mechanism:

| role | example | may it act? |
|---|---|---|
| `ASSERTED_PREDICATE` | "the lead **was discarded**" | yes |
| `NEGATED_PREDICATE` | "no lockout **is applied**" | **no** — a negated correction is not a correction |
| `ATTRIBUTIVE_MODIFIER` | "a pile of **discarded** conveyor rollers", "**hazard** warning labels" | **no** |
| `NP_HEAD` | "no **damage** was found" | yes, for the negated-hazard test |

**The two checks were repaired DIFFERENTLY, because they fail in opposite directions** — a distinction
the entry contract insisted on and the root-cause proof confirmed:

* `checkContradiction` uses vocabulary to **REJECT**; a false positive **deletes a hazard**. It now
  requires an **asserted, unnegated** predicate, and draws removal tokens from a strict
  `UNAMBIGUOUS_SERVICE_WITHDRAWAL` subset — bare `removed` is excluded because "the chain guard has
  been removed" and "the conveyor was removed from service" are both asserted predicates and only the
  second withdraws equipment.
* `checkStateSupported` uses vocabulary to **ADMIT** a state the model already claimed; a false
  positive **accepts a wrong state**. L3-2e's proof found two, neither previously documented:
  `CORRECTED` on a modifier, and `CONTROLLED` on **"no guardrail was in place"** — a live hazard
  labelled controlled, which at the customer tier is a missed hazard wearing a reassuring label.
  `NEGATED` and `HYPOTHETICAL` deliberately keep presence semantics: their markers are particles, not
  verbs predicated of a subject.

> **The governing asymmetry, and it generalises:** a vocabulary used to REJECT must be unambiguous; a
> vocabulary used to ADMIT may be permissive. That is §33.1's lesson one level down.

The negated-hazard test also gained two structural conditions: the negated phrase's **head** must be
the hazard object (English noun phrases are head-final, so "hazard warning labels" denies *labels*, a
control), and **no contrastive connector may follow** the negation's scope ("no damage … **although**
the earth conductor has been cut back").

### 35.2 Observation availability is a separate axis from evidence sufficiency

A clause-position ablation **contradicts §34.5's account** of `D-NG-04`/`D-CR-04` as an oscillation:

| variant | result |
|---|---|
| "**No** flammable atmosphere was detected …, and the fitter went inside" | INSUFFICIENT |
| "The atmosphere **was tested** …, and the fitter went inside" | **INSUFFICIENT** |
| "The fitter went inside …, and no flammable atmosphere was detected" | **ACTIVE** |

**Removing the negation changes nothing; moving the clause changes everything.** The mechanism is
clause position — the observation is classified from its FIRST clause — and the two failures are one
defect from two sides. The prompt therefore says *evaluate every clause, not only the first*, and
lets the strongest condition claim decide.

The genuine distinction that survives is stated in five prompt lines: *is the thing that could not be
observed the fact that **decides** this candidate?* — decides it → INSUFFICIENT_EVIDENCE with a
question; decides nothing → classify from what WAS observed and ask nothing.

> **`observation-availability.ts` RECORDS; it does not decide.** The entry contract required it, and
> the programme had earned the caution: every deterministic check added to this pipeline deleted a
> correct hazard before it earned its place, and cell B of the root-cause matrix showed the model
> already handled "unobserved but irrelevant" correctly 3 of 3 **before any repair**. The signal is
> advisory and changes no state.

### 35.3 The result on a fresh sealed holdout — MEASURED

`holdout-l32e.json`, sha256 `b9da20bacb9548167b80f0da6a55e5f3059a5318e809ba23a204706702818e06`,
84 scenarios, frozen before the repair code, byte-identical after. 40 INDEPENDENT (stride
`i % 5 === 1`, pairwise disjoint from all prior strides), 32 AUTHORED, and **12
TARGETED_FAMILY_COMPLEMENT reported separately**. Overlap against four prior sealed sets and two
development sets: **0 ids, 0 texts**, enforced by a throw.

| | RAW | POST-VALIDATOR | **SHIPPED** |
|---|---|---|---|
| Hazard detection | 63/66 | 63/66 | **62/66** |
| High-consequence misses (35 HC) | 2 | 2 | **2** |
| False ACTIVE · negative-control false ACTIVE | 0/18 · 0/7 | 0/18 · 0/7 | **0/18 · 0/7** |
| Condition state · corrected state | 96.4% · 4/4 | 96.4% · 4/4 | **95.2% · 4/4** |
| **Clarification TP/FP/FN** | **3/0/0** | **3/0/0** | **3/0/0 — precision and recall 100%** |

Fabricated quotations **0 of 83**. Reproducibility **84/84**. Validator rejections **0**. Both
high-consequence losses are **provider-stage**; stage attribution across all shipped losses is
provider 3, binder 1, validator 0, clarification gate 0, integration 0.

On the retired sets (`REGRESSION_EVIDENCE` only): L3-2b **62/62** with clarification 100/100; L3-2c
**53/54**, up from 47 at L3-2c and 49 at L3-2d — the clearest measure of the E1 repair, since the four
`DISC-03`/`DISC-04` hazcom deletions that cost that phase its detection are gone.

### 35.4 Sealed family coverage — 15 of 24 to 23 of 24 `FAMILY_COVERAGE_GATE`

A coverage inventory across the four prior sealed sets found **nine of twenty-four taxonomy families
had never appeared in any sealed evaluation**, and two more had no high-consequence example. The field
dataset carries six families in total, so no deterministic sampling rule could close that gap; a
separately-labelled targeted complement did.

**`noise_exposure` remains `NOT_YET_SEALED_VALIDATED`** — its one scenario was deleted by the
surviving substring defect in §35.5, not by absence of coverage. Eight further families passed their
scenario under a **permitted alternative label** rather than their own; that is coverage of the
scenario, not of the label, and the distinction is kept in `results/family-coverage.json`.

### 35.5 Why the gate still fails, and what L3-2e broke `ROOT-CAUSED, NOT FIXED`

Two high-consequence misses, both provider-stage: `E-FLD-147` (the model called warning tape a
control — measured `UNCHANGED_AND_CORRECT` against the retired rule, so not an L3-2e regression) and
`E-OA-07` (the clause-position class on `msha` ground-control wording, 8 of 9 otherwise correct).

Four defects were found **after** the holdout was opened and are specified but deliberately not
implemented:

| id | defect | provenance |
|---|---|---|
| `L3-2E-DISC-05` | `NP_TERMINATORS` omits `against`, so "no deficiencies **against** the storage standard" resolves its head to `standard` and a genuinely negated hazard is no longer refused | **new, introduced by L3-2e** |
| `L3-2E-DISC-06` | the head test is still a **substring** match and takes a post-modifying participle as the head: `issued` matches `issue`, deleting the one `noise_exposure` finding | pre-existing; **L3-2e failed to close it** |
| `L3-2E-DISC-07` | `CORRECTED` requires an asserted predicate, so a **nominal** correction — "drew a replacement from the store" — is refused | **new, introduced by L3-2e** |
| `L3_2E_SCOPE_CONTRADICTION` | see §35.6 | pre-existing, fenced |

`DISC-02` stays open and unremediated as the entry contract required: five sealed holdouts, **zero
measured losses**, precision risk only, and it can never delete a hazard.

### 35.6 `L3_2E_SCOPE_CONTRADICTION` — recorded, not acted on

`negation-scope.ts::hasPredicate()` decides whether a comma ends a negation's scope, and recognises a
predicate only through a closed list of **auxiliaries** plus a participle regex needing five letters
before the suffix. Measured:

> "…at the manway, and the fitter **was** inside the vessel" → scope correctly ends at the comma
> "…at the manway, and the fitter **went** inside the vessel" → scope runs to the end of the sentence

`went`, `climbed`, `entered`, `fell`, `broken`, `torn`, `cut` are invisible to it. This deleted
`D-NG-04` at the binder — a high-consequence confined-space finding the provider had classified
correctly. It is the **seventh** instance of §32.5's pattern and sits in the one module L3-2e was
forbidden to change, so it is recorded rather than repaired.

> **A repair that improves provider behaviour can EXPOSE a binder defect that was always there.** The
> candidate reached the binder for the first time only because the E2 repair made the model quote the
> hazard clause narrowly and correctly; `checkNegationAddressed` steps aside for a broad quote and not
> for a correct narrow one. Stage-attributed capture is what makes that visible, and it is a
> programme lesson worth carrying forward.

### 35.7 Customer authority and regression — MEASURED

Pristine `git archive` of HEAD versus HEAD plus all uncommitted L3-1…L3-2e work, through the real
customer pipeline on a disposable database, volatility derived empirically: **0 non-volatile
differences over 66**, the same 7 volatile paths every prior phase derived. `diff -rq` over the two
checkouts' `backend/src` reports exactly one difference — the **added** `reasoning-l3` directory, with
zero Nest or repository decorators inside it and zero importers outside it.

Offline suites: L3-2e 82, L3-2d 71, L3-2c 86, L3-2b 105, L3-2 **183** (up from 179 — it now audits the
two new modules), L3-1 48; **575 assertions, 0 failed**. `test:hazlenz-core` 28/30, the two documented
failures only. KG contracts unchanged. Both prerequisite suites fail byte-identically from pristine
HEAD, confirmed from both checkouts.

Two prior-phase assertions were **rebound to their guarantees** and recorded: a prompt-version pin, and
L3-2d's clause rule, which L3-2e **generalised** from "a negation governs only its own clause" to
"evaluate every clause, not only the first" once the ablation showed the defect was never about
negation.

`L3_COMPARE`: Level-3 correct / Level-1 incorrect on **41**; both correct 39; both incorrect 3;
Level-1 correct / Level-3 incorrect 1. Level 3 attached a verified span to **73** findings, Level 1 to
**0**.

### 35.8 Deferred to L3-2f

The scope contradiction first — it is the only open defect shown to delete a **high-consequence**
finding — then the three head-resolution and nominal-correction corrections, then a re-measure of the
two remaining high-consequence misses. Accept against a sixth sealed holdout using stride
`i % 5 === 3`, the last untouched stride, covering `mobile_equipment`. **After that the field dataset
is exhausted and a genuinely independent source must be found.** `L3-3 must not start until L3-2f
closes` with zero high-consequence misses, the clarification axis still at 100/100, and
`noise_exposure` sealed-validated.

> **Outcome, recorded by §36:** the scope contradiction is **closed** and the three head-resolution
> and nominal-correction defects with it — the four F1–F4 cohorts score 21 of 21 on fresh sealed
> evidence with zero binder deletions, and `noise_exposure` is sealed-validated with its exact label,
> completing family coverage at **24 of 24**. L3-2f nonetheless closed **PARTIAL** on four
> high-consequence misses, and it measured the prompt trade of §36.7 that now outranks them.

---

## 36 — L3-2f PREDICATE-SCOPE GENERALISATION AND CONTROL ADEQUACY (2026-08-23) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_2F_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `L3_2E_SCOPE_CONTRADICTION` — **CLOSED**
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence: `verification/hazlenz-l3-2f-predicate-scope-2026-08-23/`.
**§31–§35 are not rewritten — L3-2 through L3-2e each closed PARTIAL and that remains the historical
record.** Dependency graph and `package-lock.json` byte-identical to HEAD.

### 36.1 The pattern's THIRD face is closed, and the class is now bounded `STABLE_INVARIANT`

> #### `AN OPEN CLASS CANNOT BE ENUMERATED; A CLOSED ONE CAN BE COMPLETED`

§32.5 named the closed-vocabulary pattern, §33.1 fixed its **polarity**, §35.1 fixed its **syntactic
role**. L3-2f found it in three more functions at once and repaired all three **in one place**:

| defect | function | asked | should have asked |
|---|---|---|---|
| **F1** | `negation-scope.ts::hasPredicate()` | is this verb in my list of 24 auxiliaries? | does this clause carry a **finite verb**? |
| **F2** | `predicate-role.ts::NP_TERMINATORS` | is this preposition in my list of 40? | is this a **function word**? |
| **F3** | `checkContradiction` head test | does the head **contain** one of my 15 stems? | is the head **that token**? |

`word-classes.ts` is the mechanism, and its argument is what makes the repair bounded rather than
another list:

> **Function words — determiners, prepositions, coordinators, subordinators, pronouns, auxiliaries —
> are a GENUINELY CLOSED class.** Enumerating them is *complete*, not incomplete. F2's list was not
> wrong in kind; it was a partial copy of a closed set, and completing it closes F2 permanently.
>
> **Lexical verbs are an OPEN class**, which is why F1 could never have been fixed by adding `went`.
> But *finiteness* is decidable without enumerating verbs: regular finite forms are **morphological**
> (`-ed`, `-ing`), and irregular finite past forms are **themselves a closed class** — no new
> irregular verb enters English, and every verb coined from now on is regular. The two together are
> **exhaustive over finite lexical verbs**. That is a bounded structural property.

Three structural guards carry the weight, and each is paired in the suite. Past **participles are
excluded** from the finite inventory (`worn`, `broken`, `torn`) — a participle is not finite, and
that exclusion is exactly what lets RC-08's coordinated list keep crossing its commas. Forms
homographic with common nouns are excluded (`ground`, `saw`, `wound`, `cut`, `set`). And a candidate
verb must have a **subject before it** and must **not be attributive**.

> **The repair can only make negation scope SHORTER, never longer.** Under-scoping produces a missed
> advisory; over-scoping deletes a correct hazard. The module's chosen failure direction is preserved
> exactly, which is why a generalisation this broad was safe to make at all.

### 36.2 F1 — the recorded scope contradiction, closed

One sentence, one lexical verb apart, measured before and after:

| | comma at | scope ends | span governed | binder |
|---|---|---|---|---|
| "…at the manway, and the fitter **went** inside…" **before** | 50 | **147** | yes | **DELETED** |
| the same sentence **after** | 50 | **50** | no | **survives** |
| "…and the fitter **was** inside…" (paired half) | 50 | 50 | no | survives |

`D-NG-04` — the high-consequence confined-space finding §35.6 recorded as deleted — is recovered end
to end, and RC-08's negated list still crosses its comma. On the sealed set the four F1–F4 cohorts
scored **21 of 21 with ZERO binder-stage deletions**.

### 36.3 F2, F3, F4 — and the one that was the mirror image

**F2 (`DISC-05`) is not about `against`.** Three unlisted prepositions failed identically —
`against`, `beyond`, `per` — each resolving the head to the object of the preposition. The list is
now derived from the complete preposition class, with a documented carve-out: **participial
prepositions are homographs** (`concerning` is a preposition in "no concerns concerning the tags" and
an adjective in "no **concerning** wear"), so they do not close a phrase on sight and are recovered
instead by the trailing-participle rule.

**F3 (`DISC-06`) was TWO faults composing**, and either alone would have been survivable: the head
resolver returned the trailing participle `issued`, and `head.includes(o)` then matched `issue`
inside it. `head.includes(o)` is an **unbounded admission rule** — it makes every word containing a
stem a member of the set — and the same shape was measured on `harm`⊂`harmless`,
`concern`⊂`concerning`, `access`⊂`accessory`. Matching is now whole-word, with **nominal** inflection
declared per-vocabulary (`deficienc` → `deficiency`/`deficiencies`) and **verbal** inflection
deliberately excluded: `issued` is not an inflection of the noun `issue`, and treating it as one was
the defect.

**F4 (`DISC-07`) is the mirror image of the other three** and worth naming as such. L3-2e was right
that a `CORRECTED` claim must be *asserted* rather than *mentioned*, and wrong to implement
"asserted" as **verbhood**. "the rigger **drew a replacement** from the store" asserts a completed
correction with a correction NOUN as the object of an action verb. Both guards that made the L3-2e
rule worth having are kept and both are measured: a **negated** nominal correction is still refused,
and a **mention** ("the replacement *procedure*") still corrects nothing.

### 36.4 F5 and F6 are ONE mechanism, and §35.5's account of `E-OA-07` is superseded twice

The entry contract asked whether `E-OA-07` was caused by F1, clause ordering, prompt weighting or
observation-availability classification. **It is none of them.** Measured by ablation:

| variant | result |
|---|---|
| verbatim — reassuring clause first, hazard as "**unsupported** roof" | NO_HAZARD_ESTABLISHED |
| hazard clause moved first · reassuring clause deleted | ACTIVE ✓ |
| **regime `msha` → `osha-construction`, text identical** | **NO_HAZARD_ESTABLISHED** |
| same clause position, ordinary vocabulary | ACTIVE ✓ |
| reassuring clause kept, absence stated **explicitly** | **ACTIVE ✓** |

**It is not `msha` ground-control wording** — the same text under another regime fails identically.
**It is not clause position alone** — the same position with ordinary vocabulary succeeds. It is an
interaction, and only one half is repairable: the model does not read a control absence encoded
**morphologically** (`un-supported`) as "a required control is ABSENT". Its own words: *"does not
indicate that the unsupported roof section was actively unstable"* — it demanded proof of imminent
harm on top of a stated missing control.

`E-FLD-147` is the same axis from the other end. The model called warning tape a control —
*"the warning tape suggests some control is in place"* — and reproduced it on a sign and on a toolbox
talk, while a bolted cover and a fixed guardrail were both classified correctly.

> **F5 under-reads an ABSENT control; F6 over-reads a merely ADMINISTRATIVE one. One axis, two ends,
> both provider-stage.**

**The architecture already supports the distinction.** `L3_CONTROL_HIERARCHY_LEVELS` has carried
`elimination · substitution · engineering · administrative · ppe` since L3-1, and the `CONTROLLED`
rung always said "an **effective** control". What was missing was the *test* for effective. Recorded
as **contract-sufficient, NOT architecture evidence**. `control-adequacy.ts` **records**
`CONTROL_EFFECTIVE` / `CONTROL_MENTION` / `CONTROL_ABSENT` and decides nothing — the
`observation-availability.ts` restraint of §35.2, for the same reason and under `L3-INV-12`.

### 36.5 The result on the sixth and final sealed holdout — MEASURED

`holdout-l32f.json`, sha256 `47f92dae5f9fcbcb87c5c6f08fb4cbee3deb9dfba6a18a545d6ea844446bb2c5`,
**97 scenarios**, frozen before the repair code and byte-identical after. 40 INDEPENDENT (stride
`i % 5 === 3`, **the last untouched stride**), 46 AUTHORED, 11 TARGETED reported separately. Overlap
against **five** prior sealed sets and **three** development sets: **0 ids, 0 texts**, enforced by a
throw.

| | RAW | POST-VALIDATOR | **SHIPPED** |
|---|---|---|---|
| Hazard detection | 74/77 | 74/77 | **73/77** |
| High-consequence misses (44 HC) | 3 | 3 | **4** |
| False ACTIVE · negative-control false ACTIVE | 0/20 · 0/13 | 0/20 · 0/13 | **0/20 · 0/13** |
| Condition-state accuracy | 96.9% | 96.9% | **95.9%** |
| **Clarification TP/FP/FN/TN** | 4/0/0/93 | 4/0/0/93 | **4/0/0/93 — precision and recall 100%** |

By provenance at the shipped tier: **INDEPENDENT 39 of 40** (1 HC miss), AUTHORED 23 of 26 (3),
TARGETED **11 of 11** (0). Reproducibility **97/97 (100%)**. Predicate-scope cohorts **21/21, zero
binder deletions**. Observation availability **5/5**. Control adequacy 53/56.

**Sealed family coverage reached 24 of 24** — `SEALED_PASS` 24, `SEALED_FAIL` 0, `NOT_REPRESENTED` 0.
**`noise_exposure` is CLOSED**: 4 declared, 4 established, **exact label emitted** on fresh sealed
evidence. It was the family `DISC-06` had deleted, and the `DISC-06` repair is what restored it.

### 36.6 Why the gate still fails `ROOT-CAUSED, NOT FIXED`

Four high-consequence misses against a gate of zero. **None was fixed after the holdout was opened**,
which is the only reason §36.5's numbers mean anything.

| id | stage | mechanism | class |
|---|---|---|---|
| `F-FLD-159` | provider | a **non-verbatim quotation** → `EVIDENCE_OUT_OF_BOUNDS` → the whole proposal rejected. 1 of 100 quotations unbound (99% verbatim) | designed behaviour (§29.6); **first time it has cost a high-consequence finding** |
| `F-WC-02` | **binder** | `CORRECTION_TOKENS` contains **`fixed`**, and "the DANGER sign **is fixed** to the handrail post" is an asserted, unnegated predicate — of the *sign*, not of the hazard | **eighth instance of §32.5**, and §35.1 already names the rule it breaks |
| `F-WC-03` | provider | a **toolbox briefing** read as an effective control: *"the crew were informed of the hazard"* | `F6`, partially closed |
| `F-WC-09` | provider | **PPE plus a defeated engineering control** ("the two-hand control has been strapped down with tape") read as CONTROLLED | `F6`, partially closed |

`F-WC-02` is the sharpest of the four because it is the pattern this programme knows how to fix.
§35.1's governing asymmetry says **a vocabulary used to REJECT must be unambiguous**, and it is
exactly why L3-2e excluded bare `removed` from the rejection path. `fixed` is ambiguous in the same
way — *repaired* versus *attached* — and it belongs out of `CORRECTION_TOKENS`' rejection half for
the same stated reason. The treatment is known; L3-2f did not apply it, because the set was open.

### 36.7 The prompt is a ranking, and this phase MEASURED the trade `NEW_EVIDENCE`

L3-2f produced the cleanest evidence the programme has of a pattern §33.6 and §34.5 each described
from one side. Two prompt variants, **identical text, only its POSITION changed**, everything else
held constant:

| | HC misses | clarification precision |
|---|---|---|
| **A** — the absent-control material elaborated **inside** the condition-state ladder | **2** | **88.9%** (`C-CS-05` lost its HYPOTHETICAL rung) |
| **B** — ladder kept terse, the material moved **below** it `SHIPPED` | 4 | **100%** |

Moving nine lines out of the ladder recovered `C-CS-05` and **cost `E-FLD-147` and `E-OA-07`**, the
two misses this phase existed to close. Variant A meets the high-consequence axis better and fails
the clarification axis; variant B is the reverse. **Neither variant satisfies both gates.**

> **Four phases have now moved this balance with prose, and this is the first time both poles were
> measured against each other with everything else fixed.** The material must sit at the ACTIVE rung
> to work, and sitting there swamps the one-line rungs above it. That is not a wording problem, and
> the next phase should stop looking for the wording that satisfies both.

The shipped configuration is **B**, chosen before the sealed set was opened and not revisited after.
The L3-2f suite now pins the ladder's terseness with an assertion, so the regression that cost
`C-CS-05` cannot recur silently.

### 36.8 Architecture stop rule — ASSESSED, NOT TRIGGERED

The entry contract requires that a **genuinely new** high-consequence semantic mechanism trigger
`L3_2F_ARCHITECTURE_REASSESSMENT_REQUIRED` rather than an automatic L3-2g. Assessed against all four
misses: `F-WC-02` is the documented §32.5 class; `F-WC-03` and `F-WC-09` are the F6 class this phase
opened and partially closed; `F-FLD-159` is a **quotation-fidelity** failure, not a semantic
reasoning one, and the validator behaved exactly as §29.6 specifies. **No new semantic mechanism.
The stop rule is NOT triggered.**

The honest counterweight, recorded rather than concealed: §36.7 is architecture-relevant evidence of
a different kind. It does not show a new failure mechanism; it shows that **prompt-position tuning
has reached a practical limit** on two axes that the current architecture cannot separate. That is
the finding the next phase should carry, not another wording attempt.

### 36.9 Customer authority and regression — MEASURED

Pristine `git archive` of HEAD versus HEAD plus all uncommitted L3-1…L3-2f work, through the real
customer pipeline on a disposable database, volatility derived empirically: **0 non-volatile
differences over 66**, the same 7 volatile paths every prior phase derived. `diff -rq` over the two
checkouts' `backend/src` reports exactly one difference — the **added** `reasoning-l3` directory,
with zero Nest or TypeORM decorators inside it and zero importers outside it. The only network
destination reachable from it is `http://127.0.0.1:11434`.

Offline suites: L3-2f **77**, L3-2e 82, L3-2d 71, L3-2c 86, L3-2b 105, L3-2 **187**, L3-1 48 —
**656 assertions, 0 failed**. `test:hazlenz-core` **28/30**, the two documented §13.1 failures only,
no third. KG contracts unchanged: `kg4a-cutover` 146/146, `kg4a-default-off` 51/51, `kg4b-shadow`
123/123, `kg3f-predicate` 16/16, `kg3f-determinism` 170/170, `evidence-foundation` 35 assertions.
Both prerequisite-dependent suites fail **identically from both checkouts** (`ECONNREFUSED
127.0.0.1:4340`), confirmed after path normalisation.

One prior-phase assertion was **rebound to its guarantee** and recorded: L3-2e's prompt-version pin
asserted the literal `v5`; its guarantee is that the version *advances* when the prompt changes, and
L3-2f moved it to `v6`. The binder is `v6`.

`L3_COMPARE`: Level-3 correct / Level-1 incorrect on **40**; both correct 53; both incorrect 1;
Level-1 correct / Level-3 incorrect 3. Level 3 attached a verified span to **78** findings, Level 1
to **0**.

### 36.10 Independent-field-dataset exhaustion `PROTECTED_DECISION`

> #### `CURRENT_FIELD_CORPUS_EXHAUSTED_FOR_FRESH_EVALUATION`

Stride `i % 5 === 3` was the last untouched stride. All five strides of
`safescope-field-validation-dataset.v1.json` (sha256 `a66e680b…`, 200 scenarios, six families) have
now been opened: `i%5===0` L3-2b, `1` L3-2e, `2` L3-2c, `3` **L3-2f**, `4` L3-2d.

**No prior field scenario may be reused as fresh evidence.** Any further semantic quality phase must
identify a **genuinely independent new source**, and that source **may not be authored solely to
satisfy already-known failures**. The programme's largest methodological weakness is now unavoidable
rather than merely recorded: five phases running, every precision, clarification and family-coverage
number rests on scenarios the implementer wrote.

### 36.11 Deferred to the next phase

Specified, deliberately unimplemented, in the order their evidence supports:

1. **`fixed` out of the rejection half of `CORRECTION_TOKENS`** — the eighth §32.5 instance, the only
   one of the four misses with a known, proven treatment, and the only **binder-stage** loss.
2. **The F6 residue** — administrative briefings and PPE-against-a-defeated-control still read as
   CONTROLLED. Tape and signs are handled; these two shapes are not.
3. **§36.7's trade**, which is the real blocker and is not a wording problem.
4. **`F-FLD-159`'s class** — whether one non-verbatim quotation should cost an entire
   high-consequence finding, or whether §29.6's reject-without-retry deserves a bounded re-ask.
5. `DISC-02` stays open and unremediated: six sealed holdouts, **zero measured losses**, precision
   risk only, and it can never delete a hazard.

**`L3-3 must not start until` the high-consequence gate reaches zero with the clarification axis still
at 100/100.** Family coverage is no longer a blocker — it is complete at 24 of 24.

> **Outcome, recorded by §37:** the `fixed` correction was applied and the audit it asked for found
> **ten** ambiguous tokens rather than one, closing the binder residual; the multi-hazard scorer was
> found never to have run at all and was corrected in the reader without touching the frozen holdout.
> §36.7's question was answered structurally rather than by wording: separation **recovers `F-WC-09`,
> which no prompt ordering ever recovered**, and holds the high-consequence axis at 12/12 under every
> variant — but it does **not** remove prompt-order sensitivity, which merely relocated onto the
> clarification axis. L3-2g closed **PARTIAL** on that, having ruled out a contract limit with direct
> evidence and been unable to prove a provider limit from a single available model.

---

## 37 — L3-2g STRUCTURAL STATE SEPARATION AND BINDER CLOSURE (2026-08-23) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_2G_PARTIAL — STRUCTURAL_STATE_DECISION_INCONCLUSIVE`
> ### `BINDER_RESIDUAL` — **CLOSED**
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence: `verification/hazlenz-l3-2g-state-separation-2026-08-23/`.
**§31–§36 are not rewritten — L3-2 through L3-2f each closed PARTIAL and that remains the historical
record.** Dependency graph and `package-lock.json` byte-identical to HEAD.

This phase answered §36.7's architecture question rather than attempting another wording. The answer
is genuinely mixed, and the section is written so the next phase inherits the split rather than the
headline.

### 37.1 The question, and why prose was the wrong abstraction `STABLE_INVARIANT`

> #### `A_RANKING_MOVED_INTO_CODE_IS_AUDITABLE; A_RANKING_LEFT_IN_PROSE_DRIFTS`

§36.7 measured, everything else constant, that moving the absent-control material into the
condition-state ladder traded high-consequence misses against clarification precision, and that
**neither position satisfied both gates**. §33.6 and §34.5 are the same measurement from one side
each. The diagnosis was structural: the eight condition states are offered to the model as ONE
ordered choice, so material that makes the ACTIVE rung decide correctly must sit AT that rung, and
sitting there swamps the one-line rungs above it.

`state-facts.ts` replaces the single ranked enum with **six independently-emitted semantic facts**
and a deterministic resolver:

| fact | question it asks alone |
|---|---|
| `hazardAsserted` + quote | is a hazardous condition asserted as FACT? |
| `controlReading` + quote | `PREVENTS_CONTACT` · `WARNS_ONLY` · `DEFEATED` · `ABSENT` · `NOT_STATED` |
| `framing` | `ACTUAL` or `CONDITIONAL` |
| `disposition` | `NONE` · `CORRECTED` · `WITHDRAWN_FROM_SERVICE` |
| `decisionCriticalFactMissing` + fact | is a fact that DECIDES this candidate absent? |
| `hazardExplicitlyDenied` | does the text state the condition does not exist? |

`DEFEATED` is separated from `ABSENT` deliberately: `F-WC-09` is a control that exists and has been
disabled, and a present/absent schema forces that into the wrong bucket.

**`L3-INV-04` is structural in the resolver, not a policy line.** ACTIVE is reachable only from
`hazardAsserted === true`; there is no default arm. `test:l32g-state-separation` proves this
**exhaustively over all 120 combinations** of the other five fields.

### 37.2 What structural separation FIXED — MEASURED

Ablation holding model, verified digest, temperature, seed, `num_ctx`, timeout, user prompt,
observation text and evidence constant, varying only the representation. **Noise floor established
first**: `V_S_STRUCT` against a byte-identical repeat gives **0 of 24 differing** at both tiers, so
every difference below is an effect and not variance.

> **`F-WC-09` is recovered, and no prompt ordering ever recovered it.** PPE issued against a
> two-hand control strapped down with tape — §36.6's "strongest form of the error" — returned **no
> ACTIVE candidate at all** under both ladder variants, and returns ACTIVE under **every** structural
> variant via `controlReading: DEFEATED`. Asking the control question directly is what closes it.

The high-consequence axis is **12/12 under all four structural variants and all three resolver
orderings**. Under the best ordering both §36.7 poles hold simultaneously for the first time:

| | HC | false ACTIVE | clarification precision | recall |
|---|---|---|---|---|
| §36.7 A (ladder) | — | — | 88.9% | — |
| §36.7 B (ladder) `SHIPPED` | — | — | 100% | — |
| **structural + `R1_MISSING_FIRST`** | **12/12** | **0/7** | **100%** | 75% |

### 37.3 What it did NOT fix, and why the phase closes PARTIAL `ROOT-CAUSED, NOT FIXED`

**Order sensitivity did not go away. Size-matched, it got worse.**

| pair | manipulation | differing | above noise (0/24)? |
|---|---|---|---|
| ladder A vs B | ONE block moved | **1 / 24** | yes |
| structural, canonical vs `MOVE1` | ONE block moved | **3 / 24** | yes |
| structural, canonical vs INVERTED | SIX blocks reversed | 3 / 24 | yes |

`MOVE1` exists so the comparison is fair — measuring a six-block reversal against §36.7's one-block
move and concluding anything would have been an artefact of perturbation size. All three differing
scenarios are on the clarification axis; none is high-consequence.

> **The §36.7 trade was RELOCATED, not resolved.** The high-consequence pole became robust and the
> uncertainty pole absorbed the whole of the instability. That is progress on the axis that blocks
> L3-3 and a negative result on the axis the entry contract required to be held.

### 37.4 The deterministic resolver, and where the ranking actually went `NEW_EVIDENCE`

Question B was tested over **frozen provider facts** — no inference — so provider variance is zero
by construction and every difference is the rule.

The resolver as first written was **wrong, and the ablation caught it before any claim rested on
it**. `R0_HAZARD_FIRST` resolved an asserted hazard before consulting a missing decision-critical
fact, so `F-OA-01` and `F-OA-02` lost their clarifications entirely — 0% recall.
`R1_MISSING_FIRST`, which is §35.2's rule taken literally, gives 100% precision, 0 false ACTIVE,
75% recall.

> **The ranking did not disappear; it MOVED.** It is now a fixed, testable order in auditable code
> instead of prose that shifts when a paragraph is edited — which makes §36.7's four phases of
> accidental drift impossible — but it is still a ranking, and this section does not claim otherwise.

`R1` was selected against KNOWN cases. **Tuned on diagnostic evidence; no generalisation claim**,
and deliberately NOT promoted into `state-facts.ts`.

### 37.5 Question C — the contract is exonerated, the provider is indicated but not proven

**`CONTRACT_OR_ARCHITECTURE_LIMIT` is RULED OUT with direct evidence.** The provider answers §36.4's
control question correctly in isolation on **23 of 24** runs: `WARNS_ONLY` for warning tape, a sign
and a briefing; `DEFEATED` for the strapped-down control; `ABSENT` for "unsupported roof";
`PREVENTS_CONTACT` for a fitted blanking plate. The single miss reads `F-WC-02`'s pit as `ABSENT`
rather than `WARNS_ONLY`, and both derive ACTIVE. §36.4 recorded the contract as *contract-sufficient*
for this distinction; L3-2g measures it.

**The residual points at the provider, directly rather than only by elimination.** 4–12% of
candidates carry an INTERNAL contradiction — most often `framing: CONDITIONAL` together with
`hazardAsserted: true` about the same text. Those are two separated, non-competing questions: **no
ranking can explain an answer that contradicts itself.** On `C-CS-05` the model emitted
`asserted=false` under one block order and `asserted=true` under another, to the same isolated
question about the same sentence.

> **It is NOT `PROVEN`, and that word is why this phase does not close on option B.** The attribution
> rests on **one model**. §31.1 still holds — no hosted-provider credential is resolvable on this
> machine and `qwen3-coder:30b` is the only model pulled — so no second provider could be run.
> Claiming a provider capability limit from a single model on 24 diagnostic scenarios would be the
> kind of overclaim §31.3 refuses elsewhere.

**Terminal state D states the situation exactly: C is eliminated; A and B cannot be separated
without a second provider.** The single missing experiment — re-running the unchanged ablation
against one hosted model, 48 calls — is the phase's recommended next action.

### 37.6 Binder residual — CLOSED, and it was TEN tokens

`BINDER_RESIDUAL_ROOT_CAUSE` `BINDER_RESIDUAL_FIX` `BINDER_RESIDUAL_REGRESSION_PASS`, proven before
and after with no inference, independently of the provider experiment.

§36.11 named `fixed` and asked for an audit of five more. **The audit found nine more of the same
shape**: pre-patch 20 of 30 fixtures holding, ten ambiguous tokens each deleting a correct
high-consequence ACTIVE. Post-patch 26 of 30, **zero unexplained deviations** — the four remaining
are declared accepted costs whose expectations were left at their pre-repair values rather than
relabelled after the fact.

> #### `A REJECTION VOCABULARY MUST BE UNAMBIGUOUS IN SENSE; AMBIGUITY OF OBJECT IS A DIFFERENT THING`

**The line is at SENSE, not at OBJECT, and measurement forced the distinction.** A first pass removed
every token whose non-correction reading had been demonstrated, and it broke two prior-phase gates
that are RIGHT — `test:l32b`'s "unhandled contradiction is fatal" (the guard itself was **replaced**)
and `test:l32e`'s "PAIR/unnegated correction" (a full lockout was **applied**). The audit had
conflated two kinds of ambiguity:

| kind | tokens | disposition |
|---|---|---|
| **DIFFERENT SENSE** — means something else entirely; the distractor sits in the same sentence | `fixed` (attached) · `destroyed` (**this IS the hazard**) · `reset` · `addressed` · `closed out` · `resolved` · `restored` | **leave the rejection half** |
| **SAME SENSE, DIFFERENT OBJECT** — still means "put right"; only what it attached to differs | `replaced` · `reinstalled` · `applied` · the rest | **stay** |

`destroyed` is the sharpest after `fixed`: in the damage sense it names the defect itself, so as a
rejection token it deletes the very findings it is most likely to appear in.

`checkStateSupported` keeps `CORRECTION_TOKENS` in full — §35.1's asymmetry, and the reason removal
is safe: a token that no longer DELETES still CORROBORATES a state the model itself chose.

**Known residual, recorded not closed:** same-sense-different-object can still delete under a broad
quote. `DISC-02`-shaped, bounded by the prompt's shortest-span rule, and asserted in the suite
(`A''3`/`A''4`) so it cannot drift silently. Closing it needs the OBJECT of the correction resolved,
which is a semantic question a deterministic check should not answer.

### 37.7 Multi-hazard scoring harness — CORRECTED, and it had never run

`build-l32f-holdout.ts` wrote `minimumCandidates`; `score-l32f-reasoning.ts` read `minCandidates`;
the expectation type declared **both**. `decompositionScored` never incremented, and every L3-2f
tier reported `multiHazardWithinTolerance: "n/a"` — §36.5's multi-hazard result rests entirely on
the direct inspection recorded there.

**The frozen holdout was NOT edited** — sha256 `47f92dae…` verified byte-identical, and a frozen
evaluation artifact is not rewritten to suit its scorer; that inversion is what §13.1's KG-4C
incident and `test-evidence-foundation.ts` both record. The READER accepts the key the artifact
carries. Re-scoring L3-2f's recorded run gives **1 of 1 at all three tiers**, and a full diff against
the original score file changes **exactly six keys, all `multiHazardWithinTolerance`**.

### 37.8 Weak fixtures — classified, texts and labels BYTE-UNCHANGED

`X-NC-03` and `X-WC-02` are classified `AMBIGUOUS_DIAGNOSTIC_FIXTURE` and excluded from hard-gate
use. `development-l32f.json` is unmodified at sha256 `bbda27d6…`; nothing was relabelled after
seeing output, which is the one disposition §36's exit contract forbade.

`X-NC-03` turns on the homograph `split` (cracked open / a splitter), and the two readings differ on
whether any hazard exists. `X-WC-02` supplies the very control it means to withhold ("the rail"),
and settles itself independently: it returned **three different outcomes across three L3-2f runs**
at temperature 0, in a corpus that otherwise reproduces 97/97. **A fixture that unstable cannot gate
anything.** Both guards keep full coverage through unambiguous fixtures that do gate.

### 37.9 Customer authority and regression — MEASURED

Pristine `git archive` of HEAD versus HEAD plus all uncommitted L3-1…L3-2g work, through the real
customer pipeline on a disposable database, volatility derived empirically: **0 non-volatile
differences over 66**, and the 7 volatile paths and 6 volatile field roles are the **identical set**
every prior phase derived. `diff -rq` over the two checkouts' `backend/src`: exactly one difference,
the **added** `reasoning-l3` directory. The original `safescope` development database was never a
target.

Offline suites: L3-2g **57**, L3-2f 77, L3-2e 82, L3-2d 71, L3-2c 86, L3-2b 105, L3-2 189, L3-1 48 —
**715 assertions, 0 failed**. `test:hazlenz-core` 206 pass / 2 fail, **identical to L3-2f**, the two
documented §13.1 failures only, no third. KG contracts unchanged: `kg4a-cutover-contract` 146/146,
`kg4a-default-off` 51/51, `kg4b-shadow` 123/123, `kg3f-predicate` 16/16, `kg3f-determinism` 170/170,
`evidence-foundation` 35 assertions.

Two prior-phase suites failed mid-phase; **both were this phase's own over-broad first pass**, were
diagnosed against an unpatched copy rather than assumed pre-existing, and were closed by narrowing
the repair rather than by weakening the assertions.

Containment: zero importers of `reasoning-l3` outside itself, zero importers of `state-facts.ts`
outside the L3-2g scripts, zero Nest/TypeORM decorators inside `reasoning-l3`, the seam and its call
site and `backend/src/standards/` byte-unmodified, and the shipped prompt and runner do not
reference `state-facts` at all. `state-facts.ts` is `ARCHITECTURE_SELECTION_EVIDENCE_ONLY`.

### 37.10 The independent evidence source — IDENTIFIED, CHARACTERISED, NOT OPENED `PROTECTED_DECISION`

§36.10 closed the field corpus. The replacement is **`safescope-gauntlet.source.v1.json`**
(sha256 `a95e5480…`, mtime **2026-06-11 — ten weeks before L3-2 began**): **150 rows derived from
real regulator records** — 66 fatality reports, 51 inspection violations, 33 investigation
summaries; OSHA 84 / MSHA 66; **139 of 150 critical or high**; 21 hazard families; **0 id and 0 text
overlap** with every opened sealed set, every development set and the exhausted field corpus.

> **This is the property §36.10 says the programme has never had.** Its text predates the defects by
> ten weeks and derives from published regulator records rather than from anyone's judgement about
> what this engine finds hard, so it **cannot** have been authored to satisfy a known failure.

Ambiguity complement: `safescope-field-realism-pack-v2.v1.json` (sha256 `6f6897f1…`, 2026-06-15),
whose **92 rows carry a pre-existing `shouldHaveMissingEvidence` flag** — an independently authored
clarification complement, the axis that has been 100% implementer-authored for five phases. Reserve:
`safescope-gauntlet.seed.json`, 99 rows **measured disjoint** from the source file. **366 independent
rows total, roughly four future runs if each takes a stride.**

**Negative controls remain unavailable from any independent source** — measured across all twelve
candidates and structural in kind, since regulator records document violations rather than clean
audits. They must still be authored, and must still be reported separately by provenance.

Full plan, sampling rule and sealing procedure:
`verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md`.

### 37.11 Deferred to the next phase

1. **The second-provider ablation.** The harness is unchanged and the scenario set fixed; 48 calls
   decide between terminal B and terminal C. Nothing else here is blocked on engineering.
2. **`R1_MISSING_FIRST` is not promoted.** It won on 24 known cases; adopting it on that basis would
   be tuning. It belongs in an implementation slice measured against the fresh independent corpus.
3. **Clarification recall at 75%**, and *which* case is missed changes with block ordering.
4. **The same-sense-different-object binder residual**, bounded and asserted.
5. **`F-FLD-159`'s class** — unchanged from §36.11.
6. **`DISC-02` — still leave it.** Six sealed holdouts, zero measured losses.

**`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
the clarification axis still at 100/100.** Family coverage remains complete at 24 of 24.

> **Outcome, recorded by §38:** the second-provider experiment **could not be run** — no authorized
> hosted-provider credential is reachable and only one model is pulled locally, so `L3-2h` closed
> `BLOCKED` and §37's terminal stands unrevised. What L3-2h did establish is that **this section's
> baseline reproduces exactly** — `V_S_STRUCT` and `V_S_STRUCT_MOVE1` each differ from their
> recordings on 0 of 24 across sessions — and that §37.2's 0/24 noise floor is confirmed by a third
> independent measurement. It also found a confound this section did not control for: an identical
> prompt repeated **inside one process** diverges on 3 of 24 through server-side cache state, so the
> next attempt must run each variant, and above all the repeat control, in its own process.

> **Do not run another prompt-remediation cycle.** Four phases moved this balance with prose, L3-2f
> measured both poles, and L3-2g measured the structural alternative. §36.7's instruction — *stop
> looking for the wording that satisfies both* — now extends to block ordering as well.

---

## 38 — L3-2h CROSS-PROVIDER DISCRIMINATION (2026-08-23) `BLOCKED, NO IMPLEMENTATION CHANGE`

> ### `L3_2H_BLOCKED — SECOND_PROVIDER_CREDENTIAL_REQUIRED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2h-cross-provider-2026-08-23/`. **§31–§37 are not rewritten.** **Zero
production or script files were modified by this phase**, and no stash operation was executed.

L3-2h existed to answer §37.5's open question — provider capability or representation limit — by
running the locked L3-2g experiment against a second model. It could not, and the section records
why, what was verified instead, and one new mechanism finding that changes how the next attempt must
be run.

### 38.1 The credential gate, and §31.1 is unchanged after two phases `PROTECTED_DECISION`

Checked by presence and length class only; no credential value was read, printed, logged or
persisted. `ANTHROPIC_API_KEY` unset · `OPENAI_API_KEY` present at **length 11**, the placeholder
§31.1 already documented · Gemini/Google/Mistral/Cohere/Azure and both gateway variables unset ·
**zero** hosted-provider key names across all eight repository `.env` files · no `~/.anthropic`, no
`~/.aws` profile · Claude Code `settings.json` declares no env vars · `reasoning-l3` declares only
`L3_OLLAMA_*`.

**No substitute comparator exists either.** `ollama /api/tags` lists exactly one model,
`qwen3-coder:30b` at the pinned digest `06c1097efce0…`. The entry contract forbids treating a second
local model as a provider-independence test unless the blueprint establishes that it answers the
question, and **the blueprint does not** — so the question is moot as well as unavailable.

> **This is now a programme-level blocker rather than an engineering one.** Every other item on the
> Level-3 critical path has been closed or specified. `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`,
> and Level-3 advancement is gated on obtaining one credential.

### 38.2 The L3-2g baseline reproduces exactly — VERIFIED

The locked experiment ran unchanged (`ablate-l32g-state-separation.ts`, sha256 `73f74131…`,
byte-identical before and after; scenario texts, expected labels, variants, resolver orderings and
scorers all untouched). Three structural variants × 24 diagnostic scenarios, plus a 24-call control.

Every recorded metric returned identical: `V_S_STRUCT` + `R1_MISSING_FIRST` HC **12/12**, false ACTIVE
**0/7**, clarification precision **100%**, recall **75%**; `V_S_STRUCT_MOVE1` identical on all four;
order sensitivity **3/24**; fact incoherence **7.1%** and **12%**; control-reading **5/6** and
**6/6**; `F-WC-09` recovered via `controlReading: DEFEATED`; negative controls and corrected states
held.

**Cross-session reproducibility of the decisive variants is perfect:** against their L3-2g
recordings, `V_S_STRUCT` differs on **0 of 24** and `V_S_STRUCT_MOVE1` on **0 of 24** — different
day, different process.

### 38.3 A same-process duplicate-prompt confound `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

> #### `AN IDENTICAL PROMPT REPEATED INSIDE ONE PROCESS IS NOT A NOISE-FLOOR CONTROL`

The reproduction first appeared to **contradict** §37: the noise-floor control returned **3/24**
rather than 0/24, which would have placed §37's order-sensitivity signal *at* the noise floor and
undermined its central claim. It does not, and the isolation is clean:

| comparison | differing |
|---|---|
| `V_S_STRUCT` vs `V_S_STRUCT_REPEAT`, **same process** | **3 / 24** |
| the same pair, **separate processes** | **0 / 24** |
| `V_S_STRUCT`(L3-2g) vs `V_S_STRUCT_REPEAT`(isolated) | **0 / 24** |
| `V_S_STRUCT_REPEAT`(L3-2g) vs `V_S_STRUCT_REPEAT`(isolated) | **0 / 24** |

L3-2g issued those two variants in **two separate process invocations**, so its 0/24 was a genuine
cross-process measurement. L3-2h issued all three in one, so a byte-identical prompt was sent twice
against a warm server. Temperature, seed, digest and prompt bytes were identical throughout, and an
isolated re-run reproduces the original exactly — **the cause is server-side state (cache or slot
reuse), not sampling.**

**Consequences.** §37's 0/24 noise floor **stands**, now confirmed by an independent third
measurement rather than a single observation; §37's 3/24 order-sensitivity finding **stands**, since
both variants it rests on reproduce at 0/24. And a live trap is now documented: **a cross-provider
harness that runs its repeat control in the same process as the variant it controls manufactures
~12% false variance and will attribute a harness artifact to the provider.** Each variant, and above
all the repeat control, must be run in its own process.

### 38.4 Instability concentrates in one cohort under unrelated perturbations

The three scenarios destabilised by the cache confound — `C-CS-05`, `F-CL-03`, `F-NC-01` — are drawn
from the same clarification/uncertainty cohort that carries all of §37's order sensitivity
(`F-CL-01`, `F-CL-03`, `C-CS-05`). Two mechanically unrelated perturbations — prompt block ordering
and server cache state — move the **same small set**, while the high-consequence cohort is unmoved by
either.

That is independent corroboration of §37.5's reading: these cases sit near a decision boundary **for
this model**, which is a provider-capability signature rather than a representation one. **It remains
n = 1 and does not close terminal A**, which is exactly why the credential still matters.

### 38.5 What was deliberately not done

No second provider run · no provider adapter written (it would have been unexercisable, and shipping
untested provider code to be trusted later is the wrong trade) · no prompt remediation, tuning or
diagnostic-case edits · no binder reopening, `BINDER_RESIDUAL` stays CLOSED with no new defect shown ·
**no fresh acceptance corpus touched**. `safescope-gauntlet.source.v1.json` (`a95e5480…`),
`safescope-gauntlet.seed.json` (`49aa40fd…`) and `safescope-field-realism-pack-v2.v1.json`
(`6f6897f1…`) are hash-verified unchanged, appear in **zero** run artifacts, and were seen by no
provider. §37.10's sampling and sealing plan is untouched and remains the plan of record.

### 38.6 Regression, authority and egress — MEASURED

Offline suites: L3-2g 57, L3-2f 77, L3-2e 82, L3-2d 71, L3-2c 86, L3-2b 105, L3-2 189, L3-1 48 —
**715 assertions, 0 failed**. `test:hazlenz-core` **206 pass / 2 fail**, the two documented §13.1
failures only and **not** reclassified. KG contracts unchanged: `kg4a-cutover-contract` 146/146,
`kg4a-default-off` 51/51, `kg4b-shadow` 123/123, `kg3f-predicate` 16/16, `kg3f-determinism` 170/170,
`evidence-foundation` 35.

Customer authority is preserved by construction — zero production files changed — and verified
structurally: seam, call site and `backend/src/standards/` byte-unmodified vs HEAD; zero importers of
`reasoning-l3` outside itself; zero importers of `state-facts` outside it; SHADOW and CUTOVER
untouched. All six frozen holdouts, `development-l32f.json`, HEAD, branch, upstream, all 23 tags and
the stash list (4 entries) re-verified unchanged.

**Egress:** one destination, `http://127.0.0.1:11434`. **96 local inference calls, 0 hosted-provider
calls**, no credential material read or emitted, no production data sent anywhere.

### 38.7 Exact next phase

Obtain one authorized hosted-provider credential, then run the locked experiment against the second
model as **three separate invocations** (`V_S_STRUCT`, `V_S_STRUCT_MOVE1`, `V_S_STRUCT_REPEAT`) —
**72 calls, not the 48 §37 estimated**, because §38.3 requires the noise-floor control to have its
own process. Adapter work is confined to transport in `ollama-reasoning-provider.ts`'s place: same
messages, same JSON-schema constraint, same temperature/seed/context. The scenario set, variants,
resolver orderings and scorers must not be touched, and the A/B/C/D decision rules fixed by the
L3-2h entry contract must not be re-derived after seeing output.

**`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with the
clarification axis still at 100/100.**

### 38.8 RESUMED 2026-08-24 — the gate was re-tested and STILL FAILS `PROTECTED_DECISION`

The L3-2h resume ran under the same entry contract and reached the **same terminal state**. Evidence:
`verification/hazlenz-l3-2h-cross-provider-resume-2026-08-23/`. Baseline HEAD `1feda622`, unchanged.
**Zero production or script files modified; no stash operation executed.** §29, `L3-INV-01`…`L3-INV-12`,
§31–§38, §13.1 and the current-state blocks `l31ReasoningContract`…`l32hCrossProvider` were reconciled
before any action, and **executable evidence contradicted the documentation nowhere**.

**§38.1's placeholder finding is upgraded from inference to measurement.** §38.1 classified
`OPENAI_API_KEY` as a placeholder from its **length class** — 11 characters cannot encode a
~160-character project key. The resume put that to the provider:

| | §38.1 | resume |
|---|---|---|
| variable state | present, length 11 | present, length 11 — **unchanged** |
| basis for "placeholder" | length class only | **`GET /v1/models` → HTTP 401** |

The probe carried the credential to `api.openai.com` — the entry contract's sole authorized
destination for it — and **no scenario, evidence or corpus content of any kind**. The gate outcome is
unchanged; its proof is now direct, and the next attempt need not re-derive whether that variable is
usable. **It is not.**

Everything else §38.1 recorded holds: no `~/.aws`, no gcloud ADC, no `~/.config/anthropic`, zero
hosted-provider key names across the repository `.env` files, one shell-profile export (the stub
itself), and `reasoning-l3` declaring only `L3_OLLAMA_*`. `ollama /api/tags` still lists **exactly one
model**, `qwen3-coder:30b` at the pinned digest `06c1097efce0…`, so the prohibited local-substitute
question remains moot as well as forbidden.

**Preservation re-verified across sessions.** Branch, HEAD, upstream and 0/0 divergence as expected;
worktree identical to the §38 baseline excluding the resume's own directory; 4 stash entries identical
with **no stash operation run**; 23 tags identical; the locked harness verified against its recorded
**full** digest `73f74131b4f8cbb3…` rather than the abbreviation, together with all three companion
scorers; all six frozen holdouts and `development-l32f.json` identical; the sealed corpus
(`a95e5480…`, `49aa40fd…`, `6f6897f1…`) hash-verified, **not opened**, in zero artifacts.

> **One apparent contradiction was chased to ground rather than absorbed.** A first tag snapshot
> reported four mismatches. Four of the 23 tags are **annotated**, so `git rev-parse <tag>` returns the
> tag OBJECT while `<tag>^{commit}` returns the commit; §38's baseline recorded tag objects and the
> snapshot had dereferenced. Re-taken with the recorded method, all 23 match. **No tag moved.** The
> lesson is small and worth keeping: *a preservation baseline must be re-read with the method that
> wrote it, or it manufactures drift.*

**Deliberately not done**, per the contract's STOP on a failed credential gate: no provider run · **no
adapter** — §38.5's reasoning is unchanged and correct, and writing one now would ship unexercisable
provider code to be trusted later · no baseline re-reproduction, which would spend ~96 local inference
calls to re-confirm §38.2 from hash-identical inputs and is exactly the compensating engineering the
contract forbids · no prompt remediation · no representation redesign · no sealed corpus consumed · no
L3-3 · no production provider selected.

Regression posture is **inherited, not re-measured**, and is stated that way: no code changed, every
input is hash-verified byte-identical, so §38.6's 715 offline assertions / 0 failed, `test:hazlenz-core`
206 pass / 2 fail (the two documented §13.1 failures only, **not** reclassified) and the unchanged KG
contracts stand. Customer authority verified structurally: zero importers of `reasoning-l3` outside
itself, zero importers of `state-facts` inside `backend/src`, seam and call site and
`backend/src/standards/` byte-unmodified, and no hosted credential required for customer execution.

**Egress:** `api.openai.com` — **1** hosted call (auth probe, 401, credential only, zero data);
`127.0.0.1:11434` — 1 metadata call, **0 inference calls**. No production data, no corpus, no
credential in any artifact.

> **The blocker is now three phases old (§31.1 → §38.1 → §38.8) and has not moved.** It is a
> **programme-level** blocker, not an engineering one: nothing else on the Level-3 critical path is
> waiting on code. §38.7's next phase is unchanged and remains exactly correct — the only missing
> input is the credential.

> **Outcome, recorded by §39:** the credential gate **PASSED** — an operator-named Google
> `gemini-3.1-pro-preview` credential returned HTTP 200 — and the locked experiment ran
> **byte-unmodified** against it as **three separate processes**, honouring §38.3's trap. §38.2's
> qwen baseline replayed exactly through the same harness, which is what validated it. §37.5's
> incoherence mechanism **did not reproduce**: `CONDITIONAL_AND_ASSERTED` is empty across 74 Gemini
> candidates against qwen's 1/2/2, so it is provider-capability-bound at **n = 2** and L3-2h closes
> **`TERMINAL_A`**. Two results are recorded separately rather than folded into that letter: the
> clarification residual is **representation-bound** — a zero-candidate `INSUFFICIENT_EVIDENCE`
> outcome has nowhere to carry a clarification — and the order-sensitivity improvement is **narrow**,
> 2/24 against a measured floor of 1/24. The phase also found that `rederive-l32g-resolution.ts`
> drops zero-candidate rows before clarification scoring, so **the 75% recall recorded in §38.2 and
> §37.2 is scorer-filtered; the corrected scenario-level figure is 60%** (`D-56`). This section's
> numbers are preserved as written.

---

## 39 — L3-2h FINAL EXECUTION — CROSS-PROVIDER STRUCTURAL-STATE DISCRIMINATION (2026-08-24) `EXECUTED, NO IMPLEMENTATION CHANGE`

> ### `L3_2H_COMPLETE — TERMINAL_A — CURRENT_EVALUATION_PROVIDER_NOT_VALIDATED_FOR_ADVANCEMENT`
> ### `ARCHITECTURE_SELECTION_EVIDENCE, NOT ADVANCEMENT EVIDENCE`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Recorded **separately**, and deliberately **not merged into the terminal vocabulary above**:

> #### `CLARIFICATION_CARRIER_COUPLED_TO_HAZARD_CANDIDATE — REPRESENTATION_BOUND`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2h-cross-provider-final-2026-08-23/`. **§31–§38 are not rewritten — L3-2
through L3-2h each closed on their own terms and that remains the historical record.** Zero
production files, zero script files and zero scorer files were modified; no stash operation was
executed; no sealed corpus was opened; nothing was committed or pushed.

**What Terminal A does and does not say.** It says the §37.5 structural-state incoherence mechanism
is **provider/model capability-bound**, established at **n = 2**, and that `qwen3-coder:30b` is not
validated to carry Level-3 advancement. It does **not** say that all residual instability is
provider-bound — §39.5 shows the clarification residual is not — and it does **not** select Gemini,
or any model, as the production provider.

### 39.1 The credential gate passed — first time since §31.1

| | §38.1 | §38.8 resume | this phase |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | unset | unset | unset |
| `OPENAI_API_KEY` | present, length 11 | **HTTP 401 Unauthorized** | unchanged, **not re-probed** |
| Gemini credential | unset | unset | **present, `GET /v1beta/models` → HTTP 200** |

Authorized provider **Google** (`generativelanguage.googleapis.com`), authorized model
**`gemini-3.1-pro-preview`**, credential variable `GEMINI_API_KEY`. **The provider and the model were
named by the operator**; both arrived in the command text as unfilled placeholders and were not
chosen by this phase after seeing any output.

The credential was carried only to the provider's own endpoint, was never printed, logged, hashed or
persisted, and appears in **zero** artifacts (verified by scan). §38.8's `OPENAI_API_KEY` 401 finding
was **not** re-derived — it is settled, and re-deriving it would have been the compensating
engineering §38.8 refused.

### 39.2 Method — the locked harness ran BYTE-UNMODIFIED `STABLE_INVARIANT`

`ablate-l32g-state-separation.ts` sha256
`73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521`, identical before and after. All
three companion scorers likewise unmodified — `score-l32g-order-sensitivity.ts` `7e3481f9…`,
`score-l32g-fact-coherence.ts` `4ecaada4…`, `rederive-l32g-resolution.ts` `57064e2f…` — and **run
as-is on both providers**, which is what makes the two columns of §39.3 comparable rather than merely
adjacent.

Adapter work was confined to **transport**, exactly as §38.7 required: an Ollama-protocol translation
shim (`adapter/gemini-ollama-shim.js`) was placed in front of the Gemini API and the harness's
pre-existing `L3_OLLAMA_ENDPOINT` hook was pointed at it. Scenario texts, expected labels, variants,
prompts, JSON schema, resolver orderings and scorers were never touched.

**§38.3's trap was honoured.** Three variants, **three separate harness processes**, with the shim
restarted between them — the noise-floor control never shared a process with the variant it
controls. **72 calls, 0 transport errors, every `finishReason: STOP`, no truncation, no retries.**

**The pipeline is self-validating.** Replaying it against the qwen baseline reproduces §38.2's
recorded numbers exactly: noise floor 0/24, order sensitivity 3/24 on `F-CL-01`/`F-CL-03`/`C-CS-05`,
HC 12/12, false ACTIVE 0/7, clarification 100/75, incoherence 7.1%/12%, control-reading 5/6 and 6/6.
A harness that could not reproduce the baseline could not be trusted to measure the comparator.

### 39.3 The measured result

| measure | `qwen3-coder:30b` | `gemini-3.1-pro-preview` |
|---|---|---|
| noise floor (identical prompts, **separate processes**) | **0/24** | **1/24** (`F-CL-01`) |
| order sensitivity, ONE block moved | **3/24** | **2/24** |
| — differing scenarios | `F-CL-01`, `F-CL-03`, `C-CS-05` | `F-CL-01`, `B10` |
| internal fact incoherence | 7.1% / 12% / 6.9% | **4.3% / 3.8% / 4.0%** |
| — **`CONDITIONAL_AND_ASSERTED`** (the §37.5 mechanism) | **1 / 2 / 2** | **0 / 0 / 0** |
| control-reading correctness | 5/6, 6/6 (miss: `F-WC-02`) | 5/6 all three (miss: `F-COR-01`) |
| HC gate, all three resolver orderings | 12/12 | 12/12 |
| false ACTIVE under the **shipped** `R0` resolver | **3/7, 5/7, 3/7** | **0/6, 0/8, 0/7** |
| clarification recall under `R0` | **0** | **100** |
| clarification precision / recall under `R1` | 100 / 75 | **100 / 100** |

Every figure in this table is scorer output from
`results/{qwen,gemini}-{order-sensitivity,fact-coherence,resolution}.json`. The `R0`/`R1` rows are on
the **scorer-filtered** denominator — see §39.5, which corrects it.

> **The six-block reversal (`V_S_STRUCT_INV`) was NOT run this phase, for either provider, and no
> figure for it appears above.** §38.7 fixed the run at **three** variants, so the scorer's
> `V_S_STRUCT vs V_S_STRUCT_INV` row reports `scenariosCompared: 0` on **both** providers. That is a
> **non-comparison, not a zero** — reading its `differing: 0` as a Gemini result would be `D-54`'s
> vacuity failure exactly, and an earlier draft of this table did read it that way before the
> cross-check caught it. §37.3's qwen figure of 3/24 under a six-block reversal stands as **§37's**
> measurement and is not re-derived here.

### 39.4 §37.5's provider indictment does NOT reproduce — Terminal A, at n = 2

§37.5 rested its provider reading on **internal self-contradiction**: `framing: CONDITIONAL` asserted
together with `hazardAsserted: true` about the same text, because **no ranking can explain an answer
that contradicts itself**. Across **74 Gemini candidates in three variants that class is empty** —
`CONDITIONAL_AND_ASSERTED` is 0 in every variant, against 1/2/2 for qwen.

`C-CS-05` — the case §37.5 cited as flipping `asserted` under different block orders — comes back
from Gemini **identical on all three runs**: `(hazardAsserted=false, CONDITIONAL, no missing fact)`.

So the mechanism §37.5 named is **`PROVIDER_CAPABILITY_BOUND`**, and `qwen3-coder:30b` was the limit.
§37.5 could not say that from one model; two models say it. **`CONTRACT_OR_ARCHITECTURE_LIMIT`
remains ruled out** (§37.5 established it directly), and the A-versus-B ambiguity §37 recorded as its
own terminal is now resolved on the incoherence axis.

Gemini's single incoherence is `CORRECTED_AND_ABSENT_CONTROL` on `F-COR-01`, **identically in all
three variants** — one deterministic wrong reading of a fitted blanking plate (`ABSENT` where
`PREVENTS_CONTACT` was expected), not instability. qwen answers `F-COR-01` correctly and misses
`F-WC-02` instead. Both sit at 5/6. **Each provider has exactly one deterministic control-reading
error and they are different scenarios, which is a capability signature rather than noise.**

> **Do NOT read Terminal A as "the residual is all provider-bound".** §39.5 is the counterweight, it
> is structural, and no provider swap can move it.

### 39.5 The clarification residual is REPRESENTATION-BOUND, and the recorded recall figure was scorer-filtered

#### 39.5.1 `A CLARIFICATION CAN ONLY BE CARRIED ON A hazardCandidate` `STABLE_INVARIANT`

Gemini's facts are **perfectly stable wherever it emits candidates at all**. Every scenario that
moved — under block reordering *and* under the identical-prompt noise floor — moved on one binary
decision: *emit hazard candidates*, or *return `INSUFFICIENT_EVIDENCE` with an empty
`hazardCandidates` array*.

> When the model correctly concludes the observation is underdetermined and returns
> `INSUFFICIENT_EVIDENCE` with **zero** hazard candidates, **the contract gives the clarification
> nowhere to live.** The pipeline loses the clarification in exactly the case that most needs one.

Measured, and it is the whole of Gemini's instability:

| scenario | `V_S_STRUCT` | `V_S_STRUCT_MOVE1` | `V_S_STRUCT_REPEAT` |
|---|---|---|---|
| `F-CL-01` | 0 candidates, `INSUFFICIENT_EVIDENCE` | 1 candidate | 1 candidate |
| `B10` | 0 candidates, `INSUFFICIENT_EVIDENCE` | 1 candidate | 0 candidates, `INSUFFICIENT_EVIDENCE` |

Where Gemini emitted a candidate for those same scenarios it produced **identical** facts —
`(hazardAsserted=false, ACTUAL, decisionCriticalFactMissing=true, controlReading=NOT_STATED)` — and
correctly owed a clarification. The reasoning did not change; only whether there was a carrier for
it. This is `CONTRACT_REPRESENTATION_BOUND` with a structural cause, **it is not the mechanism §37.5
proposed**, and it is preserved as its own label rather than folded into the terminal letter.

#### 39.5.2 `rederive-l32g-resolution.ts` DROPS ZERO-CANDIDATE ROWS BEFORE SCORING `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

`rederive-l32g-resolution.ts:94` reads
`rows.filter((r: Row) => r.derived && r.derived.length)`, which removes every scenario where the
model emitted no candidates. Clarification recall is therefore computed on a **reduced denominator**,
and **a provider is never charged for a clarification it failed to raise by emitting nothing at
all** — the precise failure §39.5.1 describes is the one the scorer cannot see.

This is **pre-existing, affects both providers, and affects previously recorded numbers.** qwen drops
`B10` in all three variants, so:

> **§37's and §38's recorded clarification recall of 75% is `3/4` — a scorer-filtered figure. The
> corrected scenario-level truth is `3/5` = 60%.**

Recomputed on the full 24 scenarios, counting a zero-candidate row as a miss, under the **shipped
`R0`** resolver:

| | qwen | gemini |
|---|---|---|
| HC | 13/13 | 13/13 |
| false ACTIVE | 3/11, 5/11, 3/11 | **0/11 all three** |
| clarification recall | **0/5 all three** | 3/5, 5/5, 4/5 |

**The relative conclusion is unchanged and in fact strengthens.** What changes is that the absolute
recorded figures in §37 and §38 are optimistic for both providers.

**§37 and §38 are preserved exactly as written** (`UPDATE POLICY` §4 — a §37 number stays a §37
number). 75% remains the correct record of *what §37 measured with the scorer it had*; 60% is the
corrected scenario-level truth, and it is **this** figure that any future statement must use.
`D-56` records the correction; the scorer itself is **reported, not patched** — patching it is the
first item of the next slice, and this phase was authorized to change no scorer file.

#### 39.5.3 §37.4's resolver ordering was compensating for provider fact quality

`R1_MISSING_FIRST` was introduced in §37.4 because the shipped `R0_HAZARD_FIRST` dropped
clarifications on qwen's facts. **On Gemini's facts `R0` already scores 0 false ACTIVE and 100%
clarification recall on the scored cohort** — the repair is unnecessary. The resolver-ordering
problem was a property of the provider's fact quality, not of the resolver. This is a further reason
**`R1_MISSING_FIRST` must not be promoted** on the strength of 24 known cases (§37.11 item 2, still
standing).

### 39.6 Order sensitivity — improved, and NARROW `MUST NOT BE OVER-READ`

Gemini's one-block-moved divergence is **2/24 against its own measured noise floor of 1/24**;
qwen's is **3/24 against a floor of 0/24**. Read against each provider's own floor, the excess
attributable to block ordering falls from 3 to 1. Under the six-block reversal Gemini is **0/24**
where qwen is 3/24.

**That is a real improvement and it is narrow evidence.** Three qualifications are load-bearing and
none may be dropped when this result is cited:

1. **The margin is 2 against a floor of 1.** One scenario separates signal from noise. A margin that
   small cannot carry a strong claim.
2. **Gemini's `seed` is best-effort**, not the pinned deterministic seed the local provider honoured.
   Its non-zero noise floor is a consequence of that, so the floor it is measured against is itself
   softer than qwen's.
3. **Both differing scenarios are the §39.5.1 mechanism.** `F-CL-01` and `B10` differ because a
   zero-candidate `INSUFFICIENT_EVIDENCE` row has no clarification carrier — not because the model's
   facts moved. Gemini's noise-floor scenario is `F-CL-01`, the same mechanism again. **Gemini's
   entire measured instability, floor and signal alike, is one representation defect.**

> **Therefore: Gemini improves the pre-registered incoherence axis materially and decisively, and
> improves the order-sensitivity axis narrowly and conditionally. Terminal A stands under the
> pre-registered rule. It does not stand more strongly than that.**

### 39.7 The two `A/B/C/D` lettering systems — do NOT conflate them `DO_NOT_REDISCOVER`

Two different four-letter decision vocabularies are in play across §37–§39, they share the letters
`A` and `B` with roughly compatible meanings and the letters `C` and `D` with **incompatible** ones,
and reading one under the other's key produces a false conclusion.

| letter | **System 1** — §37's terminal states | **System 2** — the L3-2h entry contract's decision classes |
|---|---|---|
| **A** | the residual is provider-capability-bound | second provider **materially better on both incoherence and order sensitivity** → `CURRENT_EVALUATION_PROVIDER_NOT_VALIDATED_FOR_ADVANCEMENT` |
| **B** | the residual is representation-bound | second provider shows **substantially the same instability** → `STATE_REPRESENTATION_REDESIGN_REQUIRED` |
| **C** | `CONTRACT_OR_ARCHITECTURE_LIMIT` — **ruled out by §37.5** | **neither** of the above |
| **D** | A and B **cannot be separated** without a second provider — §37's actual terminal | the comparator **cannot satisfy the typed-output contract** |

**The canonical terminal for this phase is System 2's `A`.** That is the system the L3-2h entry
contract fixed before any output was seen, and it is the only one whose letters may appear in the
terminal state string.

Two consequences a future session must not re-derive:

* **The evidence package's `STATUS.md` §4.2 says "terminal B" for the clarification finding.** It is
  using **System 1**, where `B` means representation-bound, and in that system the statement is
  correct. Under **System 2**, `B` means "the second provider showed substantially the same
  instability", which is **not** what was measured. That is why the finding is carried in this
  blueprint under its own name — `CLARIFICATION_CARRIER_COUPLED_TO_HAZARD_CANDIDATE —
  REPRESENTATION_BOUND` — and **never as a terminal letter**.
* **§37.5's sentence "Terminal state D states the situation exactly: C is eliminated"** is entirely
  System 1. It does not mean the L3-2h entry contract's `C` or `D`.

A third, unrelated lettering also survives in the record and is **not** a decision vocabulary at all:
**§36.7's prompt variants `A` and `B`** name two positions of the same prompt block, and §37's
**Questions A/B/C** name three research questions. Neither is a terminal.

> **When citing a letter, name its system.** A bare "terminal B" is ambiguous across this programme's
> own record, and that ambiguity is exactly what this subsection exists to end.

### 39.8 What the next work is, and it is narrow `OPEN_ITEM`

The next slice is **L3-2i — candidate-independent clarification contract + scorer correction +
revalidation**, and it is scoped to two things and their proof. It is **not** a provider-selection
slice, **not** an architecture redesign, and **not** L3-3.

| # | Work | Why it is in scope |
|---|---|---|
| 1 | **Correct the scorer first.** Patch `rederive-l32g-resolution.ts` so zero-candidate clarification-required scenarios stay in the denominator, then **re-score the existing frozen qwen and Gemini artifacts with ZERO new inference** | The corrected baseline must exist before the contract changes, or the contract change cannot be shown to have caused anything (`D-56`) |
| 2 | **Then change the contract.** A candidate-independent, proposal-level carrier for decision-critical clarification / unresolved decisions | §39.5.1 — the defect is that `INSUFFICIENT_EVIDENCE` with zero candidates cannot carry a required clarification |
| 3 | **Then prove it on the demonstrated cohort only** — at minimum `F-CL-01` and `B10` — with each required variant/control in **its own process** (§38.3) | The proof obligation is that `INSUFFICIENT_EVIDENCE` + zero hazard candidates **can** now carry the required clarification |

Explicitly **out of scope and unchanged**: the sealed acceptance corpus stays sealed; `L3-3` stays
closed; **no production provider is selected**; `R1_MISSING_FIRST` is **not** promoted; no prompt
tuning; no broadening of the reasoning architecture; no change to Level-1 customer authority.

**`PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`** (§31.1, unchanged through §38.1, §38.8 and this
phase). This run is **architecture-selection evidence on 24 diagnostic scenarios**; it is explicitly
**not** a production recommendation. The privacy boundary of §31.2 — which the local provider
satisfied absolutely, at `127.0.0.1` — is a live consideration against any hosted provider carrying
customer observation text, and it has not been adjudicated.

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** Unchanged. **This phase opened no sealed evidence and
> does not advance that gate.** Family coverage remains complete at 24 of 24.

### 39.9 Fidelity deviations — recorded rather than hidden

The two providers could not be equalised on every axis. Each deviation is stated with the direction
it cuts.

1. **Reasoning could not be equalised, and this is the largest confound.** `thinkingLevel: low` is
   the floor for Gemini 3 Pro; it still spent a mean of **527 thought tokens per call** — 37,444
   thought tokens over the 71 of 72 calls that reported a count, one call reporting none, range
   232–1,023. qwen ran with no extended reasoning at all. **The confound cuts in Gemini's favour.**
   *(The package's `STATUS.md` §6.1 carries an earlier interim figure of ~584; the transport log
   `transport/transport-V_S_STRUCT*.jsonl` is the measurement, and **527 is the figure to carry
   forward**. The evidence file is left exactly as written — a verification artifact is not edited
   to suit a later recount, §13.6.)*
2. **`num_ctx` has no Gemini equivalent** — 8,192 locally against a fixed ~1M window. Silent
   truncation, which the local setting existed to prevent, is not possible in that direction. Prompt
   size was 1,990–2,013 tokens throughout, far inside both.
3. **`additionalProperties: false` was dropped** in schema conversion — unsupported by Gemini's
   OpenAPI-subset `responseSchema`. Field order was preserved explicitly via `propertyOrdering`.
4. **`seed` is best-effort** on Gemini. Its 1/24 non-zero noise floor against qwen's 0/24 reflects
   that, and it is why §39.6's margin is narrow and carries an explicit qualification.
5. **A preview model label is not a content digest.** qwen was pinned at `06c1097efce0…`;
   **`gemini-3.1-pro-preview` can change under its label**, so this run is *less* reproducible than
   the baseline it is compared against. `MUST_REVERIFY`.

### 39.10 Egress, customer authority, preservation, regression

**Egress:** `generativelanguage.googleapis.com` — **73 calls** (1 auth probe carrying the credential
and nothing else, 72 inference). `127.0.0.1:11434` — **0 calls**; no local inference this phase.
Only already-opened diagnostic scenarios were transmitted. **No customer data, no production data, no
sealed corpus, and no credential in any artifact.** Mean latency 8.6 s, p90 11.1 s, max 14.4 s;
mean 2,002 prompt / 381 output tokens.

**Customer authority is preserved by construction** — zero production files changed — and verified
structurally: seam, call site, `backend/src/standards/` and all of `reasoning-l3/` byte-unmodified
against HEAD.

**Preservation** (`preservation-evidence.txt`): HEAD `1feda622`, 0/0 upstream divergence; locked
harness and all three scorers digest-verified; the sealed corpus `a95e5480…` / `49aa40fd…` /
`6f6897f1…` hash-verified and **not opened**; **4** stash entries with no stash operation run; **23**
tags, recorded as tag **objects** per §38.8's lesson.

**Regression is inherited, not re-measured, and is stated that way:** no code changed and every input
is hash-identical, so §38.6 stands — 715 offline assertions / 0 failed; `test:hazlenz-core` 206 pass
/ 2 fail, the two documented §13.1 failures only and **not** reclassified; KG contracts unchanged.

> **Outcome, recorded by §40:** both defects this section named are **closed**. The scorer
> correction reproduced `D-56` exactly — 75% candidate-conditioned, **60% scenario-level** — and
> changed **zero** previously-recorded keys, so `TERMINAL_A` is untouched and was checked rather than
> assumed. `ReasoningProposal.unresolvedDecisions` closes §39.5.1: on `B10` and `F-CL-01`, four
> zero-candidate `INSUFFICIENT_EVIDENCE` rows carried the owed clarification and the validator
> accepted every one **without a hazard candidate**, moving scenario-level recall on that cohort from
> **0% to 100%** where the candidate-conditioned metric cannot see the difference at all. Two limits
> are recorded rather than implied: the **shipped prompt was deliberately not touched**, so the
> shipped pipeline cannot yet produce one, and the provider axis is still **n = 1** — the credential
> blocker §39.1 recorded has not moved. This section's numbers are preserved as written.

---

## 40 — L3-2i CANDIDATE-INDEPENDENT CLARIFICATION + SCORER CORRECTION (2026-08-24) `IMPLEMENTED, NOT CUSTOMER-AUTHORITATIVE`

> ### `L3_2I_COMPLETE — CANDIDATE_INDEPENDENT_CLARIFICATION_ESTABLISHED — SCENARIO_LEVEL_CLARIFICATION_SCORER_CORRECTED`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2i-clarification-carrier-2026-08-24/`. **§31–§39 are not rewritten, and
`D-55` and `D-56` stand exactly as recorded.** Nothing committed, nothing pushed, no stash operation,
no sealed corpus opened.

This phase closes the two defects §39 established — one of measurement, one of representation — and
nothing else. **`TERMINAL_A` is untouched** (§40.2), and it neither selects a production provider nor
advances L3-3.

### 40.1 The order was the method `STABLE_INVARIANT`

> #### `CORRECT THE INSTRUMENT BEFORE THE THING IT MEASURES, OR THE CHANGE IS UNATTRIBUTABLE`

The scorer was corrected **first** and the corrected baseline established from frozen artifacts with
**zero new inference**, before one line of the contract changed. Had the order been reversed, every
number afterwards would have moved for two reasons at once and neither could have been isolated —
which is §22's loop, and `KG5C-FIX-01`'s discipline (*the proof that a repair was not made to move a
number is that the verdict does not move*) applied in advance rather than in retrospect.

### 40.2 The scorer correction moved nothing it should not have — `D-56` reproduced exactly

`rederive-l32g-resolution.ts:94` filtered `r.derived && r.derived.length`, deleting every
zero-candidate scenario **before** clarification scoring. Because a clarification could only ride on a
hazard candidate, that filter removed precisely the scenarios in which the question was lost.

**The filter is KEPT for every metric it already governed.** Those metrics are candidate-conditioned
by construction — facts never emitted cannot be resolved — and §37, §38 and §39 recorded them under
exactly this filter. What is added is a **second, separately named** measurement over the unfiltered
rows. `UPDATE POLICY` item 4 is why the old one is kept rather than redefined.

| metric | denominator | status |
|---|---|---|
| **candidate-conditioned** clarification recall | `CLARIFICATION_REQUIRED` scenarios **in which the provider emitted at least one candidate** | **DIAGNOSTIC.** The metric behind §37's and §38's recorded 75% |
| **scenario-level** clarification recall | **ALL** `CLARIFICATION_REQUIRED` scenarios; a zero-candidate row is a **MISS** | **ADVANCEMENT-RELEVANT.** The inspector was owed a question and did not get one |
| clarification **precision** | identical under both by construction — a zero-candidate row raises nothing | reported once |
| high-consequence · false ACTIVE | **UNCHANGED and still candidate-conditioned** | as recorded in §37–§39 |

Both definitions are written into every artifact the scorer emits, so a future phase cannot compare
them as though they were one metric — which is exactly how 75% travelled through two sections.

`D-56`'s expectation reproduced **exactly**: qwen `R1_MISSING_FIRST` / `V_S_STRUCT` is **3/4 = 75%**
candidate-conditioned and **3/5 = 60%** scenario-level, the miss being `B10`.

> **`TERMINAL_A` IS UNAFFECTED, and this was checked rather than assumed.** Re-scoring both frozen
> providers changed **zero** pre-existing keys. Terminal A's two pre-registered axes — fact
> incoherence and order sensitivity — are computed by `score-l32g-fact-coherence.ts` and
> `score-l32g-order-sensitivity.ts`, **neither of which this phase modified**. The correction cannot
> reach them.

Full-cohort scenario-level recall on the frozen artifacts under the shipped `R0` resolver reproduces
§39.5.2's independent recount: qwen **0/5** in all three variants, Gemini **3/5, 5/5, 4/5**.

### 40.3 The contract change, and how small it is

`ReasoningProposal.unresolvedDecisions?: ClarificationDecision[]`.

**Additive, optional, and `REASONING_PROPOSAL_CONTRACT_VERSION` is deliberately NOT bumped** — every
proposal that validated before L3-2i validates unchanged, and every frozen L3-2…L3-2h artifact stays
readable. It reuses the existing `ClarificationDecision` type: no new ontology, no workflow or task
system, no free-form field. Four fields — the missing fact, the decision it changes, at least two
branches, the question.

`ValidatedReasoning.unresolvedDecisions` is **always an array**, empty when none is owed, so no
consumer has to distinguish *absent* from *none owed*.

### 40.4 The validator boundary

| rule | code | disposition |
|---|---|---|
| L3-INV-06 four-field shape | `UNRESOLVED_DECISION_MALFORMED` | entry dropped |
| the decision must actually be **open** | `UNRESOLVED_DECISION_NOT_DECISION_CRITICAL` | carrier dropped |
| governance / regulatory-text sweep | pre-existing codes | **fatal**, unchanged |

**Decision-criticality is §34.2's rule lifted, not re-invented.** `INSUFFICIENT_EVIDENCE` and
`UNKNOWN` say the decision was not made; the other six **are** the decision. `L3_UNDECIDED_STATES`
now has **one** definition in `reasoning-contract.types.ts`, consumed by both the validator at
proposal level and `clarificationBelongsHere` in the semantic binder at candidate level, so the two
cannot drift — §32.5's closed-list lesson, applied to a rule rather than a vocabulary.

> #### `A SUPERFLUOUS QUESTION IS DROPPED; IT NEVER DESTROYS THE ANALYSIS THAT CARRIED IT` `STABLE_INVARIANT`

Both L3-2i codes are **non-blocking**: recorded in `issues`, excluded from the verdict, removed from
the result. This is §34.2 verbatim — *it never touches the hazard* — and it was **measured wrong
first**: making the refusal fatal discarded `C-CS-05`'s correct `HYPOTHETICAL` candidate along with
its unnecessary question. **No pre-existing reason had its fatality changed**, and the suite asserts
that the non-blocking set contains only the two codes this phase introduced.

### 40.5 Two corrections this phase made to its own first answer `ROOT-CAUSED AND FIXED`

Recorded because both were found by the proof rather than by inspection, and both were fixed *before*
any result was claimed.

1. **The gate was under-specified.** It keyed on `proposal.outcome` alone. `C-CS-05` returns outcome
   `INSUFFICIENT_EVIDENCE` with one candidate at **`HYPOTHETICAL`** — the outcome says undecided,
   every candidate says decided — and an outcome-only gate admitted an unnecessary question on a
   scenario whose entire purpose is MUST-NOT-ASK. The gate now additionally requires that no candidate
   stands decided alone. Six fixtures pin it, one per decided state.

2. **The refusal was fatal when it should have been a drop.** See §40.4.

> **A third change was considered and REVERSED.** The candidate-level clarification predicate was
> briefly unified with the new strict one. Failing *there* sets `ok = false`, which drops the whole
> **candidate** — a REJECT path that deletes a hazard, where §35.1's asymmetry holds: *a vocabulary
> used to REJECT must be unambiguous*. Tightening it would delete hazards that survive today over a
> defect in their **question**. The historical predicate is restored, the asymmetry is asserted, and
> unifying the two is left to a slice that measures the hazard-deletion consequence.

### 40.6 The targeted proof — `qwen3-coder:30b`

The entry contract's mandatory pair plus three controls, **all** already-opened, each asserted
byte-identical to the locked harness's text at run start. Without the controls every gate below is
vacuous, which is `D-54`. Four variants in **four separate processes** (§38.3), pids in every artifact.

| scenario | owed? | BASELINE (no carrier) | `V_CARRIER` | `MOVE1` | `REPEAT` |
|---|---|---|---|---|---|
| `F-CL-01` | yes | on a candidate | **carried** | **carried, 0 candidates** | **carried** |
| `B10` | yes | on a candidate | **carried, 0 candidates** | **carried, 0 candidates** | **carried, 0 candidates** |
| `C-CS-05` | no | none | emitted → **refused** | emitted → **refused** | emitted → **refused** |
| `F-PS-04` | no | none | none | none | none |
| `H-FLD-141` | no | `ANALYZED`, 2 × ACTIVE | identical | identical | identical |

**Four zero-candidate `INSUFFICIENT_EVIDENCE` rows carried the owed clarification, and the validator
accepted every one without a hazard candidate.** Every row validates `VALID`.

Scored with the corrected scorer over rows whose `derived` is `null` — **exactly the shape the
pre-`D-56` filter deleted outright**:

| variant | candidate-conditioned | **scenario-level** |
|---|---|---|
| BASELINE | **undefined — 0 of 5 rows survive the filter** | **0/2 = 0%** |
| carrier variants | undefined | **2/2 = 100%**, credited to the new carrier |

**The old metric cannot see the difference at all; the corrected one measures 0% → 100%.** That is
the clearest single demonstration of why `D-56` mattered.

All nine entry-contract acceptance gates pass, including **no false ACTIVE in any variant**, **no
high-consequence regression** (`H-FLD-141` identical across all four) and **no candidate invented** to
carry a question (`B10` went 1 → 0).

### 40.7 What is NOT closed, and it is the honest limit `OPEN_ITEM`

> **The shipped `L3_SYSTEM_PROMPT` was not touched, so the SHIPPED pipeline will not yet produce a
> proposal-level clarification.**

It is sha256 `b8cc50fc…` before and after and `L3_PROMPT_VERSION` remains `v6`. This is deliberate:
`ablate-l32g-state-separation.ts` reads that exact string as `V_B_LADDER` and derives variant A from
it, so editing it would silently change the **inputs** of the locked L3-2h instrument while its own
bytes stayed identical — and §36.7/§37 both measured how much prompt position moves behaviour. The
declaration the model needs lives in the L3-2i proof harness instead.

Declaring the field in the shipped prompt is therefore the **first item of the next phase**, and it
carries the re-measurement Phase 9 requires. A contract nothing can produce is not yet a working
contract, and this section says so rather than implying otherwise.

**Second limit: n = 1 on the provider axis.** `GEMINI_API_KEY` was not present in this session — the
L3-2h credential was supplied for that run only and correctly never persisted. qwen establishes that a
real provider emits the field, that it survives the real transport and normalization boundary, and
that the validator and scorer handle it. **Provider-independence of that behaviour is unproven**, and
the credential remains the same programme-level blocker §31.1 → §38.1 → §38.8 → §39.1 records.

### 40.8 Full diagnostic re-run — ASSESSED, NOT TRIGGERED

Four shared paths changed, and Phase 9 authorizes a broader run only where a shared path's safety
**cannot** be established by deterministic tests. Each one's can:

| shared path | change | established by |
|---|---|---|
| `validationStateForIssues` | a non-blocking category holding **only** the two new codes | assertion `C6` |
| `bindProposal` | additive spread; absent stays absent | assertion `E7` |
| `L3_UNDECIDED_STATES` | one shared definition, **identical values** | assertions `B7`/`B8` + 8 unchanged suites |
| candidate clarification predicate | **restored** to its historical form | assertion `E1b` |

Every pre-existing Level-3 suite reports the **same assertion count as §38.6's record**, the frozen
artifacts re-score identically, and the shipped prompt is byte-unchanged so the locked instrument's
behaviour cannot have moved. At the hazard level nothing outside `F-CL-01`/`B10` changed.

### 40.9 Regression, authority, egress and preservation

**L3 offline: 777 assertions over 9 suites, 0 failed** (715 over 8 at §38.6; +61 new, +1 rebound).
`test:hazlenz-core` **28 pass / 2 fail** — the two documented §13.1 failures only, **not**
reclassified. KG contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4b-shadow-contract`
123/123, `kg3f-predicate` 16/16, `evidence-foundation` 35. Backend and frontend `tsc --noEmit` both
exit 0. `test:standards-backing-contract` was **not run**: it is a **MUT** suite, it correctly refused
to claim the protected `safescope` database (`D-47`), and it exercises no Level-3 code.

**One prior-phase assertion was rebound to its guarantee and recorded** — the third instance of §35.7
and §36.9. `test-l31-reasoning-contract.ts` assertion 1.3 pinned the literal
`'hazlenz.l3.validator.v1'`; its guarantee is that a validated result is stamped with the identity of
the validator that produced it, and L3-2i legitimately advanced that identity to `v2`. It is now bound
to the module's own exported constant plus a shape check.

**Customer authority, by source inspection at the documented seam:**
`orchestration/intelligence-orchestrator.service.ts`, its call site `safescope-v2.service.ts:1576`
and `backend/src/standards/` are all **byte-unmodified vs HEAD**; **zero** importers of `reasoning-l3`
outside the module; **zero** Level-3 vocabulary in the service or controller; **zero** Nest or TypeORM
decorators inside `reasoning-l3`. `reasoning-l3` declares only `L3_OLLAMA_*` — **no hosted-provider
credential became required for customer execution.**

**Egress:** one destination, `http://127.0.0.1:11434`. **60 local inference calls, 0 hosted-provider
calls, 0 auth or metadata calls.** Five already-opened diagnostic scenarios transmitted. No customer
or production data, no sealed-corpus content, no credential value in any artifact — the Gemini gate
was checked by variable presence alone.

**Preservation:** HEAD `1feda622`, 0/0 upstream divergence, **4** stash entries with no stash
operation run, **23** tags identical as tag objects, the locked harness and the two untouched scorers
digest-verified, all 11 frozen holdouts and devsets identical, the L3-2h final evidence package
identical across all 21 files, and the sealed corpus `a95e5480…` / `49aa40fd…` / `6f6897f1…`
hash-verified and **not opened**.

### 40.10 Deferred to the next phase

1. **Declare `unresolvedDecisions` in the shipped `L3_SYSTEM_PROMPT`**, and re-measure — this is the
   only reason the shipped pipeline cannot yet produce one, and it is a prompt change that carries a
   full diagnostic re-run under §38.3 isolation.
2. **The provider axis, at n = 1.** One authorized hosted credential re-runs the proof on Gemini.
3. **`R1_MISSING_FIRST` is still not promoted.** §39.5.3 gave a second reason to leave it alone.
4. **Unifying the two clarification shape predicates**, with the hazard-deletion consequence measured.
5. **`F-FLD-159`'s class** and **`DISC-02`** — unchanged from §37.11 and §39.8.

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** Unchanged. **This phase opened no sealed evidence and
> does not advance that gate.** Family coverage remains complete at 24 of 24, and
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.

---

## 41 — L3-2j SHIPPED CARRIER ACTIVATION — MEASURED AND REFUSED (2026-08-24) `MEASURED, SHIPPED PATH BYTE-RESTORED`

> ### `L3_2J_COMPLETE — SHIPPED_CARRIER_ACTIVATION_MEASURED_AND_REFUSED`
> ### `SHIPPED_PROMPT_AND_SCHEMA_BYTE-RESTORED — LOCKED_L3-2h_COMPARISON_RE-DERIVED_AND_RESTORED`
> ### `CROSS_PROVIDER_REVALIDATION_NOT_EXECUTED — PROVIDER_AXIS_REMAINS_n=1`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2j-carrier-activation-2026-08-24/`. **§31–§40 are not rewritten, and `D-55`
through `D-58` stand exactly as recorded.** Nothing committed, nothing pushed, no stash operation, no
sealed corpus opened.

L3-2j executed §40.7's ordered next action — declare `unresolvedDecisions` in the shipped prompt, then
re-measure — and the re-measurement **refused it**. The shipped prompt and schema end this phase
byte-identical to their pre-phase state, and that restoration is proven rather than asserted.

### 41.1 The finding `STABLE_INVARIANT`

> #### `THE_SHIPPED_LADDER_DOES_NOT_HAVE_THE_DEFECT_THE_CARRIER_WAS_BUILT_TO_FIX`

`D-56`/§39.5.1's zero-candidate clarification loss was measured on **`V_S_STRUCT`** — the structural
representation, which §37 classifies as architecture-selection evidence and which **is not what
ships**. On the shipped ladder prompt the question already rides a hazard candidate on **5 of 5**
`CLARIFICATION_REQUIRED` scenarios. This is not a new measurement fighting an old one: the frozen
L3-2g `V_B_LADDER` rows say 5/5 too, and L3-2j's independent `V_PRE_ACTIVATION` run reproduces them
exactly, ten days later, through a different code path.

A carrier cannot improve a metric already at ceiling. What it can do, and did, is cost.

### 41.2 What activation cost — `D-58`'s two denominators, and a third metric that is not either of them

`qwen3-coder:30b`, temperature 0, seed 20260822, `num_ctx` 8192, over the **full 24-scenario**
already-open diagnostic corpus. The cohort is parsed out of the locked harness and cross-checked
field-by-field against the frozen L3-2g artifact, so drift is unrepresentable rather than unlikely.

| variant | prompt sha | cand-conditioned clar | scenario-level clar | clarification **precision** | HC (model-asserted) | false ACTIVE |
|---|---|---|---|---|---|---|
| **`V_PRE_ACTIVATION`** — the BEFORE | `b8cc50fc` (v6) | **5/5** | **5/5** | **100%** | **12/13** | 0/11 |
| declaration **rev 1** + carrier schema | `b7f35111` | *undefined* | 5/5 | 71.4% | **9/13** | 0/11 |
| declaration **rev 2** + carrier schema | `45862b26` | 5/5 | 5/5 | 83.3% | **10/13** | 0/11 |
| carrier schema **alone**, prompt silent | `b8cc50fc` (v6) | 5/5 | 5/5 | 83.3% | 12/13 | 0/11 |

**Neither clarification denominator moved.** Both were 5/5 before and 5/5 after. What moved was
precision and high-consequence recall. `HC (model-asserted)` is a **third, separately named** metric —
it is **not** §37–§39's candidate-conditioned high-consequence figure, which is computed over resolved
`stateFacts` and does not exist for ladder rows. `D-58`'s rule is that metrics are never renamed into
each other, and that rule applies to new ones as much as to the two it was written for.

**The noise floor is zero.** Three repeat pairs, each variant in its own process per §38.3: `0`
differing fields out of 144 compared, every time. Nothing in the table above is variance.

### 41.3 What each configuration broke, and why the second attempt was made at all

**Declaration revision 1** was the byte-identical `CARRIER_DECLARATION` L3-2i proved as `V_CARRIER`,
in that harness's APPEND position. Over the full corpus it:

* lost `E-OA-07` (roof bolter under unsupported roof) entirely — `ACTIVE` → `NO_HAZARD_ESTABLISHED`
  with **zero candidates**;
* pushed `H-AM-05` (gate on one hinge, lower pin sheared) to `INSUFFICIENT_EVIDENCE` with a question —
  which is `RC-01`'s failure mode, the one L3-2c spent a phase closing;
* moved `F-WC-03` from `ACTIVE` to `CONTROLLED`;
* fired a question on `C-CS-05`, a **MUST-NOT-ASK** scenario — and §34.2's gate could not refuse it,
  because that gate only fires when candidates exist and all are decided. The model had dropped the
  candidate first. **Dropping the candidate defeated the control meant to catch the question.**
* took candidate-borne clarifications from **5 to 0**. The new carrier did not supplement the old one,
  it replaced it — the exact opposite of `D-57`'s design.

**The cause is one sentence, and it is worth naming precisely.** Revision 1 told the model the field
was for when you *"return an EMPTY hazardCandidates array"*, and the model read that as permission to
return one. It contradicts the `ASKING A QUESTION` rung two paragraphs above, which says in terms that
an empty list there is **WRONG**. Two rules pointed opposite ways and the newer, more specific one
won, pulling scenarios off the `ACTIVE` rung onto the empty-`INSUFFICIENT_EVIDENCE` path.

**Revision 2** removed the licence and stated the precedence instead. It recovered `E-OA-07`, still
lost `F-WC-03` and `H-AM-05`, and used the proposal-level carrier **zero times across all 24
scenarios** — it cost two high-consequence cases to buy nothing at all.

**The schema half alone** held high-consequence recall at 12/13 and, notably, the model filled
`unresolvedDecisions` on six rows **with the prompt saying nothing about the field**, because the JSON
schema is itself sent to the provider as `format`. But `C-CS-05` still moved from a correctly decided
`HYPOTHETICAL` to `INSUFFICIENT_EVIDENCE` with a question, so the MUST-NOT-ASK pole regressed here too.

Both revisions are **kept** in `activate-l32j-shipped-corpus.ts`, with the sha256 each must reproduce
pinned. A rejection nobody can re-run is folklore.

### 41.4 Refusing an activation is not undoing a capability `PROTECTED_DECISION`

`ReasoningProposal.unresolvedDecisions`, `ValidatedReasoning.unresolvedDecisions`, the two L3-2i reason
codes, `L3_UNDECIDED_STATES` and the semantic binder are **byte-unchanged**.
`test-l32j-carrier-activation.ts` asserts, against the live modules, that a zero-candidate proposal
still carries its clarification through validation. What is not shipped is the **declaration** that
would make a provider emit one, and `L3_CARRIER_DECLARATION_ANCHOR` documents at the point of use why.

### 41.5 The locked L3-2h comparison does NOT transfer across a prompt change `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

§40.7 left the shipped prompt alone precisely because `ablate-l32g-state-separation.ts` reads it as
`V_B_LADDER`. L3-2j re-derived that comparison rather than assuming it, with the harness **byte-
unchanged** (`73f74131…`) and only its inputs different:

| locked variant, under declaration rev 2 | HC | rows differing from frozen L3-2g |
|---|---|---|
| `V_B_LADDER` — the baseline every L3-2g/L3-2h number is read against | **10/13** (was 12/13) | **11 of 24** |
| `V_A_LADDER` — §36.7's variant A | 12/13 | **12 of 24** |

`V_B_LADDER` lost `F-WC-03` and `H-AM-05` — **the same two scenarios**, by a different harness with a
different schema. Two independent instruments agree on the regression. The four structural variants
build a self-contained prompt and never read `L3_SYSTEM_PROMPT`, so their inputs were unchanged by
construction rather than by luck.

**After the revert, `V_B_LADDER` reproduces the frozen L3-2g rows with ZERO differences**, and the
shipped-pipeline baseline reproduces its own pre-declaration run with **0 differing fields out of
168**. The restoration is measured in both instruments, not claimed in one.

### 41.6 Schema key order is a behavioural input `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

> #### `THE_JSON_SCHEMA_IS_AN_INPUT, AND KEY ORDER IS PART OF IT`

Moving the declaration out of the shipped prompt and back into the harness produced a run that
disagreed with the recorded one on **six measured fields** — `B10` lost its candidate, `F-TB-02` lost
its candidate, three rows changed which carrier held the question — on a prompt whose **sha256 was
identical**. The rebuilt schema had **appended** `unresolvedDecisions` where the original **inserted**
it between `observationInterpretation` and `hazardCandidates`. Restoring the position gave a
**0-difference** reproduction. Every corpus artifact now records `schemaSha256`, and the shipped
schema's serialised hash is pinned by assertion, so this cannot be checked by reading code again.

### 41.7 Cross-provider revalidation — NOT EXECUTED `OPEN_ITEM`

`GEMINI_API_KEY` is **not present** in this session's environment or in any ancestor process. The
probe counted the variable **name** only — no value read, printed, hashed or persisted — and was
validated against variables known to be present before its negative result was trusted. Record:
`CREDENTIAL_AND_EGRESS.txt`.

The provider axis therefore remains **n = 1**, and the blocker is unchanged from §31.1 → §38.1 →
§38.8 → §39.1 → §40. Nothing was substituted: `GEMINI_MODEL` is exported by the operator's shell as
`gemini-3.1-flash-lite-preview`, which is **not** the authorized model, and it was not used. No result
was estimated or simulated for the second provider.

### 41.8 Regression, authority, egress and preservation

**L3 offline: 814 assertions over 10 suites, 0 failed** (777 over 9 at §40.9; **+37 new**). `l31` 49 ·
`l32` 189 · `l32b` 105 · `l32c` 86 · `l32d` 71 · `l32e` 82 · `l32f` 77 · `l32g` 57 · `l32i` 61 ·
`l32j` 37. **No prior-phase assertion is rebound**: the two pins L3-2j temporarily moved — L3-2f's
literal `v6` and L3-2i's `F1` prompt hash — were **restored** when the prompt was, so §35.7/§36.9's
rebinding ledger does not grow.

`test:hazlenz-core` **28 pass / 2 fail**, the two documented §13.1 failures only and **not**
reclassified. KG contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off` 51/51,
`kg4b-shadow` 123/123, `kg3f-predicate` 16/16, `kg3f-determinism` 170/170, `evidence-foundation` 35.
Backend and frontend `tsc --noEmit` both exit 0.

**Customer authority is preserved by construction** — the shipped prompt and schema are byte-identical
to their pre-phase state — and verified structurally: zero importers of `reasoning-l3` outside itself,
`reasoning-runner.ts` still does not consume `state-facts`, the validator carries no persistence
decorator.

**Egress:** one destination, `http://127.0.0.1:11434`. **264 local inference calls, 0 hosted-provider
calls.** HEAD, branch, 23 tags and the 4-entry stash list re-verified unchanged. The sealed corpus is
hash-verified unchanged before and after and appears in **zero** artifacts of this phase.

### 41.9 Exact next phase

**Obtain the credential and close the `n = 1` limit — items (1), (2), (3) and (5) of the L3-2j command
are closed, and item (4) is the only outstanding instruction.** Verify the credential is present
before the phase opens; L3-2i and L3-2j both began believing it was and both found it absent. Then
re-run the `F-CL-01`/`B10` proof on the second provider through the L3-2h transport adapter, as three
separate invocations, and ask the question this phase makes newly interesting: **does the second
provider carry the clarification on a candidate the way qwen does on the shipped ladder, or does it
need the carrier?** If the answer is provider-dependent, activation is a **provider-conditioned**
decision and belongs in the production-provider decision, not in the shipped prompt.

**`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with the
clarification axis still at 100/100.**


## 42 — L3-2j ITEM (4) CROSS-PROVIDER REVALIDATION ON THE SHIPPED v6 LADDER (2026-08-24) `EXECUTED, NO IMPLEMENTATION CHANGE`

> ### `L3_2J_ITEM4_COMPLETE — CROSS_PROVIDER_REVALIDATION_EXECUTED_ON_THE_SHIPPED_LADDER`
> ### `D-59 STRENGTHENED — ACTIVATION_IS_NOT_PROVIDER-CONDITIONED`
> ### `D-55 REMAINS SUPPORTED — SCOPE BOUNDED ADDITIVELY BY D-62`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2j-cross-provider-closure-2026-08-24/`. **§29–§41 are not rewritten, and
`D-55` through `D-61` stand exactly as recorded.** Zero production files, zero script files and zero
scorer files were modified; nothing committed, pushed or deployed; no stash operation; no sealed
corpus opened; **no `L3_SYSTEM_PROMPT` or schema edit; neither rejected v7 revision reintroduced; zero
qwen inference.**

This phase closes the single outstanding instruction from the L3-2j command — item (4) — and nothing
else. It is **not** a provider-selection slice and does **not** advance L3-3.

### 42.1 The finding `STABLE_INVARIANT`

> #### `THE SHIPPED LADDER CARRIES THE CLARIFICATION ON A CANDIDATE FOR BOTH PROVIDERS, 5/5, ON THE SAME FIVE SCENARIOS`

§41.9 named the question this phase existed to answer: *does the second provider carry the
clarification on a candidate the way qwen does on the shipped ladder, or does it need the carrier?*
If it needed one and qwen did not, activation would have been a **provider-conditioned** decision
belonging to the production-provider choice rather than to the shipped prompt.

**It does not need the carrier.** `gemini-3.1-pro-preview` scores **5/5 on both `D-58` denominators**
at **100% precision**, on the **same five scenario identities** qwen uses — `F-OA-01`, `F-OA-02`,
`F-CL-01`, `F-CL-03`, `B10` — every one carried on a hazard candidate, and emitted a proposal-level
`unresolvedDecisions` **zero times**. `D-59`'s refusal is **strengthened**, at `n = 2`.

Note which scenarios those are. **`B10` and `F-CL-01` are the two cases that DEFINED §39.5.1's
zero-candidate defect** — the ones on which Gemini returned `INSUFFICIENT_EVIDENCE` with an empty
`hazardCandidates` array under the structural representation. On the shipped ladder both providers
carry the question on a candidate. The defect is a property of the representation, not of a provider,
and that is now established from both directions rather than one.

### 42.2 Method — the shipped prompt and schema were the input, and are proven so

| | value |
|---|---|
| `L3_PROMPT_VERSION` | `hazlenz.l3.prompt.v6` |
| `sha256(L3_SYSTEM_PROMPT)` | `b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf` |
| shipped schema top-level key order | `outcome │ observationInterpretation │ hazardCandidates` |
| `unresolvedDecisions` in the shipped schema | **absent** — `D-60`'s insert position unoccupied |
| serialised run schema, `schemaSha256` | `a522cf5aa2d556824100139adf4951e75b9135c42f6d0c771009cc97e99da385` |

**`schemaSha256` is the load-bearing number**, and it is byte-identical to the value the restored-v6
**qwen** baseline recorded. `D-60` says key order is a behavioural input; this phase proves the two
providers were constrained by the *same serialised bytes* rather than asserting it. All of the above
are asserted by `test-l32j-carrier-activation.ts`, **37/37 passing this session**.

**§38.3 was honoured throughout: SIX variants in SIX separate processes**, the shim restarted between
every one, pids in every artifact — the shipped variant and its floor, the locked `V_B_LADDER` and
its floor, `V_A_LADDER`, and a `V_S_STRUCT` drift control. Adapter work was **transport only**: the
L3-2h shim (`0ba265bb…`) reused **byte-unmodified**, behind the harness's pre-existing
`L3_OLLAMA_ENDPOINT` hook. **145 shim-logged requests: 144 × HTTP 200, one 503 retried to 200,
`finishReason: STOP` on every one, zero truncation, zero harness errors, zero scenarios lost.**

**No qwen inference was spent.** The restored-v6 qwen baseline is hash-backed and frozen; it was
re-scored from the L3-2j package with the byte-unmodified scorer, and qwen's ladder order-sensitivity
figure was re-scored from the frozen L3-2g artifact. Spending inference to reproduce either would be
exactly the compensating engineering §38.8 refused.

### 42.3 The measured result — the SHIPPED v6 LADDER

| measure | `qwen3-coder:30b` (frozen, restored v6) | `gemini-3.1-pro-preview` |
|---|---|---|
| **candidate-conditioned** clarification recall | **5/5** | **5/5** (both runs) |
| **scenario-level** clarification recall | **5/5** | **5/5** (both runs) |
| clarification **precision** | **100%** | **100%** |
| clarification scenario identities | `F-OA-01` `F-OA-02` `F-CL-01` `F-CL-03` `B10`, all candidate-borne | **identical** |
| proposal-level carrier used | 0 | **0** |
| HC (model-asserted) | **12/13** — misses `F-WC-09` | **13/13** |
| false ACTIVE | **0/11** | **0/11** |
| validator rejections | 1 — `E-FLD-147` `DUPLICATE_CANDIDATE` | 1 — `F-COR-01` `UNGROUNDED_CORRECTIVE_ACTION` |
| candidate omissions | `F-PS-04`, `F-NT-01` | `F-PS-04` (+2 in the repeat) — **all `NEGATIVE_CONTROL`** |
| **order sensitivity**, `V_B_LADDER` vs `V_A_LADDER` | **1/24** (`C-CS-05`) | **0/24** |
| **noise floor**, locked instrument, separate processes | 0/24 | **0/24** |
| **noise floor**, shipped-pipeline instrument | **0/168** | **4/168 — 2/24**, both `NEGATIVE_CONTROL` |
| structural-state coherence · control-reading | **NOT DEFINED on ladder rows** | **NOT DEFINED on ladder rows** |

`HC (model-asserted)` is `D-58`'s third, separately named metric and is **not** §37–§39's
candidate-conditioned high-consequence figure. Coherence and control-reading are undefined on the
shipped ladder **by construction, not by omission**: both are computed from the six separated
`stateFacts`, which only the structural variants emit, and every ladder row carries `derived: null`.
That is stated rather than filled in with a structural number wearing a shipped-path label.

### 42.4 A scorer-boundary zero looks exactly like a measured zero `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

> #### `THE LOCKED RESOLUTION SCORER REPORTS 0/5 CLARIFICATION RECALL ON LADDER ROWS. THAT IS A NON-MEASUREMENT.`

Run over this phase's Gemini `V_B_LADDER` and `V_A_LADDER` rows, `rederive-l32g-resolution.ts` reports
**scenario-level clarification recall 0/5**, listing all five scenarios as "zero-candidate misses".
**Every one of those five emitted a candidate and carried its clarification** — the L3-2j scorer
measures the same rows at 5/5, and the two Gemini instruments agree **24 of 24** on whether a
clarification was raised.

The cause is the boundary `score-l32j-clarification-denominators.ts` was written for: the locked
scorer detects the candidate carrier by re-resolving `row.derived[].facts`, so its notion of
"candidate" is a *resolved* candidate, not a model candidate. This is **not a defect and the scorer is
not patched** — patching it would change the instrument that produced §37's, §38's and §39's recorded
numbers. §39.3 warned that a `scenariosCompared: 0` non-comparison must not be read as a zero; this is
the sharper form of the same trap, because here the denominator is populated and the number looks real.

### 42.5 The MODEL-DRIFT CONTROL — a `MUST_REVERIFY` discharged rather than carried `NEW_EVIDENCE`

§39.9 item 5 records that a **preview model label is not a content digest**. Without a control, any
shipped-ladder-versus-structural difference could be the label having moved rather than the
representation. So `V_S_STRUCT` was re-run today and scored with the same byte-unmodified scorers.

| measure | frozen L3-2h (2026-08-23) | today |
|---|---|---|
| **`CONDITIONAL_AND_ASSERTED`** — `D-55`'s decisive axis | **0** | **0** |
| internal fact incoherence | 1 of 23 = **4.3%** | 1 of 24 = **4.2%** |
| the single incoherence | `CORRECTED_AND_ABSENT_CONTROL` on `F-COR-01` | **identical** |
| control-reading correctness | **5/6**, miss `F-COR-01` | **5/6**, miss `F-COR-01` |
| HC gate, all three resolver orderings · false ACTIVE | 12/12 · 0/7 | **12/12 · 0/7** |
| row agreement with the frozen artifact | — | **2 of 24 differ** |

The two differing scenarios are `F-CL-01` — **L3-2h's own measured 1/24 Gemini noise-floor scenario** —
and `F-OA-02`, one `conditionState` label moving `INSUFFICIENT_EVIDENCE` → `UNKNOWN`. **2/24 against a
recorded floor of 1/24 on a best-effort seed is at the floor, not above it. No material drift.**
`D-55`'s evidence therefore reproduces today, and every shipped-versus-structural difference in §42.6
is attributable to the representation.

### 42.6 What transfers to the shipped ladder, and what does not `STABLE_INVARIANT`

§41.5 established that the locked comparison does not transfer across changed *inputs*. It does not
transfer across a changed *representation* either, and this is the ledger.

**A — reproduces on the shipped ladder.** The provider ordering holds in direction: Gemini is no worse
on any measured axis and better on two (**13/13 vs 12/13** high-consequence, **0/24 vs 1/24** order
sensitivity). §39.4's *one deterministic error each, on different scenarios* signature reproduces —
one validator rejection per provider, on different scenarios, and Gemini's is `F-COR-01`, **the same
scenario as its structural control-reading miss and in the same direction**. Order sensitivity remains
an improvement and remains **narrow**: the margin is one scenario, as it was one scenario structurally.

**B — existed only under `V_S_STRUCT`.** `CLARIFICATION_CARRIER_COUPLED_TO_HAZARD_CANDIDATE —
REPRESENTATION_BOUND` (§39.5.1) does not occur on the shipped ladder for **either** provider ·
`D-56`'s 60% is a `V_S_STRUCT` fact, both providers are 5/5 here · §39.5.3's `R0` clarification loss
is a `V_S_STRUCT` fact, and `R0` is what ships · **`CONDITIONAL_AND_ASSERTED` — `TERMINAL_A`'s
decisive axis — is not measurable on the shipped ladder at all**, which is the single most important
scoping fact in this section · Gemini's 1/24 structural floor and 2/24 structural order sensitivity are
both **0/24** on the ladder inside the locked instrument.

**C — invalidated by the shipped-ladder measurement.** **None.** Nothing measured here contradicts a
recorded L3-2h finding. Every difference is a **scope** result — true of the structural representation
and silent about the shipped one — and that distinction is preserved rather than collapsed into
"superseded".

**D — remaining provider-specific differences on the shipped ladder.** High-consequence recall
(`F-WC-09`: qwen `CONTROLLED`, Gemini `ACTIVE` — and qwen reads that control as `DEFEATED` correctly
**under structural separation**, §38.2, so the ladder is where it loses it) · validator-rejection
identity · **outcome labelling**, qwen returning `INSUFFICIENT_EVIDENCE` on five scenarios where Gemini
returns `ANALYZED` while both carry the same clarifications on candidates · candidate multiplicity,
27 validated hazards against 23 · **a noise floor that is instrument-dependent for Gemini**, 0/24
locked and 2/24 shipped-runner on the same day and model, both non-zero differences on
`NEGATIVE_CONTROL` rows optionally emitting a `NEGATED` candidate — **no clarification-required and no
high-consequence scenario moved in any floor pair, in either instrument** · order sensitivity, qwen's
single scenario being `C-CS-05` on the `CLARIFICATION_MUST_NOT_ASK` pole, where a regression is a
false question put to a safety professional.

Cross-provider divergence at the row level: **11 of 24** scenarios in the shipped pipeline, **10 of 24**
in the locked instrument.

### 42.7 `D-55` is bounded, not weakened `PROTECTED_DECISION`

`D-55` **remains supported and is not rewritten.** Its evidence was re-measured rather than assumed
(§42.5) and reproduces at `n = 2`.

What this phase adds is a **scope bound, recorded additively as `D-62`**: `D-55`'s decisive axis —
internal self-contradiction in the separated facts — **does not exist on the shipped path**. `D-55`
therefore governs **architecture selection**, exactly as §39's terminal vocabulary already said, and
**may not be cited as a statement about the shipped ladder**. On the shipped ladder the measured
provider delta is **two scenarios**: one high-consequence (`F-WC-09`) and one order-sensitivity
(`C-CS-05`). That is a far narrower separation than the structural comparison, it points the same way,
and it is recorded as its own decision rather than folded into `D-55`'s wording.

**`PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`** (§31.1, unchanged through §38.1, §38.8, §39.1, §40,
§41 and this phase). The `thinkingLevel: low` reasoning-budget confound cuts in Gemini's favour and is
the largest one; §31.2's privacy boundary — satisfied absolutely by the local provider at `127.0.0.1` —
is **unadjudicated** for any hosted provider carrying customer observation text.

### 42.8 Fidelity deviations — recorded rather than hidden

1. **Reasoning could not be equalised, and this remains the largest confound.** `thinkingLevel: low`
   is the floor for Gemini 3 Pro; it still spent a mean of **592 thought tokens per call** — 85,215
   over 144 calls, range 232–930 — against qwen's none. **It cuts in Gemini's favour**, and every
   Gemini advantage in §42.3 must be read with it. *(§39 recorded 527 on the structural corpus; that
   figure is not edited — §13.6.)*
2. **`num_ctx` has no Gemini equivalent.** Prompt size 2,002–2,456 tokens, far inside both windows.
3. **`additionalProperties: false` is dropped** in schema conversion; field order is preserved
   explicitly via `propertyOrdering`, which is what makes the `D-60` claim survive the conversion.
4. **`seed` is best-effort on Gemini**, and its floor is **instrument-dependent** — 0/24 and 2/24 on
   the same day. No single number may be cited as "Gemini's noise floor".
5. **A preview label is not a content digest.** Discharged this phase by §42.5's control — and it
   **re-arms** the moment the label is used again. `MUST_REVERIFY`.
6. **One HTTP 503**, retried once and succeeding, with provider latency reaching 271 s against a 300 s
   timeout. No call aborted, no scenario lost.

### 42.9 Regression, authority, egress and preservation — MEASURED, not inherited

No code changed, but the suites were **executed** rather than declared inherited.

**L3 offline: 814 assertions over 10 suites, 0 failed** — `l31` 49 · `l32` 189 · `l32b` 105 · `l32c` 86 ·
`l32d` 71 · `l32e` 82 · `l32f` 77 · `l32g` 57 · `l32i` 61 · `l32j` 37. **Identical to §41.8 suite for
suite**, so no count moved without a reason. `test:hazlenz-core` **206 pass / 2 fail**, the two
documented §13.1 failures only and **not** reclassified. KG contracts unchanged: `kg4a-cutover-contract`
146/146, `kg4a-default-off` 51/51, `kg4b-shadow` 123/123, `kg3f-predicate` 16/16, `kg3f-determinism`
170/170, `evidence-foundation` 35. Backend and frontend `tsc --noEmit` both exit 0.

**Customer authority** is preserved by construction — no file changed — and verified structurally: the
seam, its call site `safescope-v2.service.ts:1576` and `backend/src/standards/` are byte-unmodified vs
HEAD; all 19 `reasoning-l3` modules are byte-identical to L3-2j's recorded post-phase hashes; **zero**
importers of `reasoning-l3` outside the module; **zero** importers of `state-facts` outside it; **zero**
Level-3 vocabulary in the service. `reasoning-l3` declares only `L3_OLLAMA_*`, and **the hosted
credential lives in the verification-only transport shim, outside `backend/src` entirely** — so no
hosted credential became required for customer execution, and none can.

**Egress:** one destination, `generativelanguage.googleapis.com` — **147 HTTP requests: 1 auth probe
(credential only, zero content), 1 transport smoke, 144 inference calls, 1 retried 503.**
`127.0.0.1:11434` — **0 calls, 0 local inference.** Only already-opened diagnostic scenarios
transmitted; no customer or production data, no sealed-corpus content, and **the credential appears in
zero artifacts, verified by scanning all 51 files of the package.**

**Preservation:** HEAD `1feda622`, 0/0 upstream divergence, **23** tags identical as tag objects, **4**
stash entries with **no stash operation run**, the locked harness and all companion scorers
digest-verified, all 19 modules unchanged, every file of the frozen L3-2g / L3-2h-final / L3-2i / L3-2j
packages hash-identical before and after, and the sealed corpus (`a95e5480…`, `49aa40fd…`,
`6f6897f1…`) hash-verified and **not opened**. The worktree is unchanged apart from this phase's own
evidence directory.

### 42.10 Exact next phase — NOT EXECUTED

**A separate programme decision about the sealed acceptance run, which is a product/policy call rather
than an engineering one.** The evidence now justifies putting it on the table and did not before: the
provider axis on the shipped path is `n = 2`, the shipped clarification axis is at ceiling on both
providers, and the carrier question is settled in both directions. What remains open is not
measurement — **which provider the sealed run executes against** (the production-provider decision in
disguise, with §31.2's privacy boundary unadjudicated for a hosted provider), **whether a preview model
with no content digest may carry an acceptance result at all**, and the fact that **§29.8 spends the
sealed corpus once and then retires it**.

**Recommendation: do not open the sealed corpus yet.** If the answer is "not yet", the next engineering
slice is narrow — **root-cause `F-WC-09` and `C-CS-05`**, the entire measured shipped-path provider
delta, both on already-open material, both diagnosis rather than tuning. Any prompt change either
produces **re-arms `D-61`** and owes a full re-derivation of the locked comparison.

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** Unchanged. **This phase opened no sealed evidence and does
> not advance that gate.** Family coverage remains complete at 24 of 24, and
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.



## 43 — L3-2k SHIPPED-LADDER RESIDUAL ROOT CAUSE — `F-WC-09` + `C-CS-05` (2026-08-24) `DIAGNOSED, NOT REPAIRED`

> ### `L3_2K_COMPLETE — SHIPPED_PROVIDER_DELTA_ROOT_CAUSED`
> ### `BOTH RESIDUALS ARE THE MODEL'S SINGLE-ENUM conditionState CHOICE — NOT ITS FACTS`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2k-shipped-residual-rootcause-2026-08-24/`. **§29–§42 are not rewritten and
`D-55` through `D-62` stand exactly as recorded.** **DIAGNOSIS ONLY — nothing was repaired.** Zero
production files, zero shipped-prompt bytes, zero shipped-schema bytes, zero historical harnesses and
zero historical scorers modified; nothing committed, pushed or deployed; no stash operation; no sealed
corpus opened; no production provider selected; no prompt tuned; L3-3 not begun.

§42.10 named the narrow slice: root-cause `F-WC-09` and `C-CS-05`, the entire measured shipped-path
provider delta. This section is that, and it stops there.

### 43.1 Both cases required a stage no prior artifact had ever reached `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

> #### `EVERY RECORDED L3-2 METRIC STOPS AT THE VALIDATOR. §34.2's GATE AND THE STATE-SUPPORT CHECK LIVE AFTER IT.`

`activate-l32j-shipped-corpus.ts` and `prove-l32i-clarification-carrier.ts` both run
`bindProposal → validateReasoningProposal` and stop. `bindEvidenceSemantically` runs **after** the
validator (`reasoning-runner.ts:81`) and owns both `checkStateSupported` and §34.2's clarification
drop. **No artifact in the programme had ever executed it on these two scenarios**, so reading
`validationIssues: []` as "the deterministic pipeline was content" would have been §42.4's error one
level further on — a boundary the instrument never reached. Both root causes live in that gap.

### 43.2 `F-WC-09` — the hazard is not mislabelled, it is DELETED `STABLE_INVARIANT`

*"The operators on the swage press have been issued gloves and told to keep their hands clear, and the
two-hand control on the press has been strapped down with tape."*

| stage, `qwen3-coder:30b`, shipped v6 ladder, two isolated processes | result |
|---|---|
| provider | ONE candidate, `conditionState` **`CONTROLLED`** |
| its rationale, verbatim | *"The two-hand control has been **secured** with tape, which **prevents accidental activation**… This physical control prevents contact with the hazard"* |
| normalizer | 1 quotation, **0 unbound, 0 ambiguous** |
| validator | **`VALID`, zero issues** |
| **semantic binder** | candidate **REJECTED** — `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` |
| `boundHazards` | **`[]`** → an emptied `ANALYZED` becomes `INSUFFICIENT_EVIDENCE` |

**The customer receives no hazard at all**, not a hazard wearing a reassuring label. `HC
(model-asserted) 12/13` (§41.2, §42.3) is a **model-tier** figure: it recorded the miss but could not
record its severity. The recorded number is not wrong; it is narrower than it reads.

> **The deterministic layer already held the correct reading and by design could not use it.**
> `control-adequacy.ts` recorded, on that same candidate in that same run:
> `CONTROL_ABSENT`, `matchedTerm: "strapped down"` — *"states a required control is absent or defeated;
> an absence written as one word is still an absence."* §36.4 fixed that module as **recording only**
> (`L3-INV-12`, the §35.2 restraint). The provider inverted the phrase; the deterministic layer read it
> correctly, filed an advisory, and the hazard was deleted anyway.

**The control discriminates, so the binder is exonerated as the origin.** `F-WC-03` ran in the same
process on the same prompt and schema, produced the same `CONTROL_ABSENT` advisory ("missing"), and —
because the model chose **`ACTIVE`** — was kept and delivered. Identical pipeline, opposite outcome,
decided entirely by the state choice. Without that control the finding would be `D-54`-vacuous.

**Gemini, same full sequence, two isolated processes:** candidate
`machine_guarding_bypassed_two_hand_control`, **`ACTIVE`**, rationale *"Strapping it down **bypasses**
the control, making the hazard active. Verbal instructions and gloves are administrative"* — **kept by
the binder, delivered to the customer, twice.** So the shipped-path delta is real and **larger than
§42's model-tier `13/13 vs 12/13` implied**: hazard delivered versus hazard destroyed.

**Classification.** Primary boundary **`ASSERTION_STATE_SELECTION`**, provider stage. `MODEL PROPOSED,
DETERMINISTIC PIPELINE REJECTED` — **not** a candidate omission and **not** a validator rejection.
**Deterministic**: `CONTROLLED` is the sole state in 13 of the 14 recorded qwen ladder-family runs
across six artifacts and four sessions, plus 2 of 2 here. **Not order-sensitive**: `V_A_LADDER`
returns `CONTROLLED` too. §24 disposition **`DEFECT_NONBLOCKING`**. Recorded separately, and it is the
architectural half: the **`SEMANTIC_BINDER` amplifies** the fault, because a *correct* refusal of an
unsupported state **deletes the candidate rather than demoting it**.

**Generalization, quantified from existing artifacts with zero inference:** qwen chooses `CONTROLLED`
on **exactly 1 of 24** shipped-ladder scenarios and it is `F-WC-09`; Gemini on **0 of 24**. The
mechanism is general; the exposure is one scenario and is a provider property.

### 43.3 `C-CS-05` — the §34.2 gate is defeated by the same move that creates the question `STABLE_INVARIANT`

*"If the level probe on the caustic tank were to fail closed during a transfer, the vent could
pressurise and lift the manway gasket."* Pole **`CLARIFICATION_MUST_NOT_ASK`**.

Eight isolated processes, four per variant. Variant A is §36.7's already-open one-block move,
reconstructed by the locked harness's own manipulation and **pinned to the sha256 the frozen L3-2g
artifact recorded** (`a6dea73f…`); the instrument refuses to run otherwise.

| variant | model `conditionState` | model raised a question | §34.2 gate fired | **final carries a question** |
|---|---|---|---|---|
| **B** — shipped v6 `b8cc50fc` ×4 | `HYPOTHETICAL` ×4 | **no ×4** | — | **no ×4** ✓ |
| **A** — §36.7 `a6dea73f` ×4 | `HYPOTHETICAL` ×3, **`INSUFFICIENT_EVIDENCE` ×1** | **yes ×4** | **yes ×3** | **yes ×1** ✗ |

**Two effects, and conflating them is the error this subsection exists to prevent.** The block move
makes qwen raise a MUST-NOT-ASK question **deterministically, 4 of 4** — that is the real §36.7 signal
and it is not noise. Separately, on **byte-identical variant-A prompts in separate processes**, qwen
returns `INSUFFICIENT_EVIDENCE` once and `HYPOTHETICAL` three times — provider variance at temperature
0 with a pinned seed, **not** an effect of block order. **The customer-visible failure needs both.**

> #### `A GATE CONDITIONED ON THE CANDIDATE'S STATE IS DEFEATED BY ANY MOVE THAT CHANGES THAT STATE`
>
> `clarificationBelongsHere` returns true iff the state is in `L3_UNDECIDED_STATES`. §34.2 made that
> exemption **deliberately**, so a candidate demoted to `INSUFFICIENT_EVIDENCE` keeps the question it
> was demoted to carry. §41.3 recorded the **drop** form of the defeat — rev 1 removed the candidate,
> so the gate never fired. This phase measures the **demote** form — the candidate survives at an
> undecided state and the gate is inert for the same structural reason. **Two mechanically unrelated
> perturbations, one structural route.**

**The gate is load-bearing, not lax, and the vacuity control is measured rather than argued.** In the
three variant-A runs where the state came back `HYPOTHETICAL` the gate **did** fire —
`SEMANTIC_CLARIFICATION_ON_DECIDED_STATE`, `clarificationsDropped` populated, question suppressed. And
on the same 24-scenario cohort that exemption is exactly what lets all **5 of 5**
`CLARIFICATION_REQUIRED` scenarios carry their legitimate question, on both providers.

**`FIELD-LEVEL VARIANCE` and `SEMANTIC DECISION VARIANCE` are both present, at different tiers.** At
the model tier the difference is deterministic (4/4) and is a field difference; at the shipped decision
tier a false question reaches a safety professional in **1 of 4**. The hazard decision, false ACTIVE
and high-consequence axes **never move** — `assertsActive` is false in all eight runs. The delivered
question is real, not vacuous: *"Is the level probe on the caustic tank currently failing closed during
a transfer?"*

**Classification.** Primary boundary **`ASSERTION_STATE_SELECTION`**, provider stage — the same
boundary as `F-WC-09`; composition recorded separately at the **`SEMANTIC_BINDER`**. §24 disposition
**`DEFECT_NONBLOCKING`**: the shipped configuration is variant **B**, under which the failure does not
occur in 4 of 4 runs. **Generalization:** `C-CS-05` is the **only** scenario in the cohort producing a
`HYPOTHETICAL` candidate on **either** provider, so it is the only place on this cohort the composition
has anything to act on.

### 43.4 What the two cases share, and what that does NOT license `STABLE_INVARIANT`

> #### `BOTH SHIPPED-PATH RESIDUALS ARE THE MODEL'S SINGLE-ENUM conditionState CHOICE, NOT ITS FACTS`

Neither is a candidate omission, an evidence-binding failure, a validator rejection, a resolver fault
or a scorer artifact. In both, the model proposes the right hazard on cleanly bound evidence and then
selects the wrong state — and in both, something in the system already held the fact that decides it:
`control-adequacy.ts`'s `CONTROL_ABSENT` and `V_S_STRUCT`'s `controlReading: DEFEATED` for `F-WC-09`;
its own other three runs' `HYPOTHETICAL` for `C-CS-05`.

§42.6 recorded that `TERMINAL_A`'s decisive axis is not measurable on the shipped ladder. This is the
shipped-path evidence that the ladder's single-enum state selection is where qwen loses both cases
while the separated-fact representation answers both correctly.

> **It is TWO SCENARIOS and it is not a mandate.** §36.7's measured trade stands, §37.11 item 2 stands,
> and nothing here promotes a representation, a resolver ordering or a provider. `R1_MISSING_FIRST`
> remains unpromoted and `control-adequacy.ts` remains recording-only.

### 43.5 Instrumentation boundary — stated, because §22 requires the owner before the repair

`backend/scripts/diagnose-l32k-shipped-residual.ts` is **disposable, verification-side** instrumentation.
It **imports** the shipped schema builder, user-prompt builder, normalizer, validator **and semantic
binder** and reproduces none of them; it asserts the shipped prompt is restored v6 and that variant A
reproduces the frozen digest before it will run; it **refuses more than one variant per process**
(§38.3). It modifies no production file, no shipped prompt, no shipped schema, no provider adapter, no
historical harness and no historical scorer — all digest-verified identical before and after.

**From EXISTING ARTIFACT:** every model state, candidate count and cross-representation comparison for
both cases (80 recorded rows); `F-WC-09`'s determinism and order-insensitivity; `V_S_STRUCT`'s
`DEFEATED` recovery; §36.7's `V_B`/`V_A` movement; the 1-of-24 and 1-of-24 exposure counts.
**From NEW INSTRUMENTATION:** candidate identity, rationale, evidence binding and clarification text;
the binder's rejection of `F-WC-09` and the resulting empty `boundHazards`; `controlAdequacy`'s
recording; §34.2's gate firing 3/4 and inert 1/4; qwen's variant-A state instability; Gemini's
`F-WC-09` candidate surviving to `ACTIVE`.

### 43.6 Provider-decision implication — DESCRIPTIVE, and no provider is selected

**Class `B` — one or two narrow diagnostic differences, insufficient on their own to justify a provider
decision — with one qualification class `B` does not by itself convey.**

Supporting `B`: two scenarios of twenty-four; the `C-CS-05` half **does not occur under the shipped
configuration at all** (0 of 4 under variant B) and is therefore not a live shipped defect; the corpus
is already-open diagnostic material; and §42.8's confounds are undiminished — Gemini's
`thinkingLevel: low` still spends ~592 thought tokens per call against qwen's none, and its noise floor
is instrument-dependent (0/24 locked, 2/24 shipped-runner).

Against reading `B` too comfortably: `F-WC-09`'s shipped consequence is **worse than the recorded
metric showed** — the total loss of a high-consequence finding on a scenario whose correct reading the
deterministic layer had already computed. One scenario is a small number; a silently deleted
high-consequence hazard is not a small failure mode.

**Not `C`** — nothing shows the qwen defect generalizing (`CONTROLLED` once in 24). **Not `D`** — the
deterministic layer behaved correctly at every stage in every run and the binder's refusal is right on
its own terms. **Not `A`** on two scenarios, and **not `E`**, because both mechanisms are established.

`D-55` and `D-62` are **not overwritten**; `D-63` and `D-64` are additive.

### 43.7 Regression, authority, egress and preservation

**L3 offline: 814 assertions over 10 suites, 0 failed** — identical to §41.8 and §42.9 suite for suite.
`test:hazlenz-core` **206 pass / 2 fail**, the two documented §13.1 failures only, **not** reclassified.
KG contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off` 51/51, `kg4b-shadow` 123/123,
`kg3f-predicate` 16/16, `kg3f-determinism` 170/170, `evidence-foundation` 35. Backend and frontend
`tsc --noEmit` both exit 0 with the new verification-side script present.

**Customer authority:** seam, call site `safescope-v2.service.ts:1576` and `backend/src/standards/`
byte-unmodified vs HEAD; all 19 `reasoning-l3` modules byte-identical before and after; **zero**
importers of `reasoning-l3` or `state-facts` outside the module; `reasoning-l3` declares only
`L3_OLLAMA_*`.

**Egress:** two destinations. `127.0.0.1:11434` — **13 local inference calls**, 1 metadata call.
`generativelanguage.googleapis.com` — **4 hosted inference calls, 0 auth or metadata calls**; the
credential was checked by variable **presence and length class only**. Scenario IDs transmitted:
`F-WC-09`, `F-WC-03`, `C-CS-05` locally; `F-WC-09` and `F-WC-03` only to the hosted provider. No
customer or production data, no sealed-corpus content, **credential in zero artifacts** (all 37 files
scanned).

**Preservation:** HEAD `1feda622`, 0/0 upstream, 23 tag objects identical, 4 stash entries with no
stash operation, the locked instrument and companion scorers digest-verified, the shipped prompt
`b8cc50fc` at `v6` with `unresolvedDecisions` absent and key order intact, the run schema `a522cf5a`,
every file of the L3-2g / L3-2h-final / L3-2i / L3-2j / L3-2j-closure packages identical, and the
sealed corpus hash-verified and **not opened**. The worktree gains exactly two entries: this evidence
directory and the disposable instrument.

### 43.8 Exact next phase — NOT EXECUTED, and it is not an engineering phase

**The programme decision §42.10 handed over, now answerable in one direction: engineering says the
residual evidence is NOT yet sufficient to choose the sealed-run provider, and the remaining gap is
NOT a measurement gap.**

Both residuals are root-caused with controls, at both tiers, on both providers. A third diagnostic
phase on already-open material would add precision to a two-scenario delta and would not change the
decision. What blocks the sealed run is the **unadjudicated §31.2 / §10 privacy boundary** — whether
novel customer-shaped observation text may leave `127.0.0.1` at all — together with the preview
model's mutability (`MUST_REVERIFY`, re-armed) and §29.8's rule that the corpus is spent **once**.

**Recommended order, for the user to accept or reject:** adjudicate §31.2 first; if hosted egress is
refused the sealed run executes against `qwen3-coder:30b` and `F-WC-09`'s deletion mechanism becomes a
known, quantified, one-scenario cost carried into acceptance; if hosted egress is permitted, close the
preview-label problem before spending the corpus. **Do not open the corpus to settle a provider
question.**

If engineering work is nevertheless wanted first, the narrowest defensible slice is a **bounded
architectural question, not a patch**: *should a state the binder cannot support be **demoted** rather
than **deleted**?* §35.1's asymmetry governs, `D-57`'s precedent is that a refused clarification is
dropped and never fatal, and `F-WC-09` is the first measured case where a **correct** refusal costs an
entire high-consequence finding. It requires its own root cause and its own hazard-deletion
measurement, and **must not be answered by editing the binder to make `F-WC-09` pass** (§22).

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** Unchanged. **This phase opened no sealed evidence and does
> not advance that gate.** Family coverage remains complete at 24 of 24, and
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.


---

## 44 — L3-2l SEMANTIC-STATE REJECTION DISPOSITION — DELETE vs DEMOTION (2026-08-24) `DECIDED, NOT IMPLEMENTED`

> ### `L3_2L_COMPLETE — SEMANTIC_STATE_REJECTION_DELETION_RETAINED`
> ### `CLASS A — THE BINDER CONTINUES TO DELETE, AND THE REASON IS STRUCTURAL`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2l-semantic-state-disposition-2026-08-24/`. **§29–§43 are not rewritten and
`D-55` through `D-64` stand exactly as recorded.** **ARCHITECTURE DECISION ONLY — nothing was
implemented and no inference of any kind was run.** Zero production files, zero shipped-prompt bytes,
zero shipped-schema bytes, zero scorers and zero historical harnesses modified; nothing committed,
pushed or deployed; no stash operation; no sealed corpus opened; no provider selected; L3-3 not begun.

§43.8 named the slice as a bounded architectural question rather than a patch: *should a state the
binder cannot support be **demoted** rather than **deleted**?* This section answers it, and it stops
there.

### 44.1 The answer is a structural property of the check `STABLE_INVARIANT` `DO_NOT_REDISCOVER`

> #### `checkStateSupported` CAN ONLY EVER REFUSE A NON-ACTIVE STATE, SO DELETE-VS-DEMOTE CANNOT MOVE ANY HARD SAFETY GATE

Its `required` map covers exactly `CORRECTED`, `REMOVED_FROM_SERVICE`, `NEGATED`, `HYPOTHETICAL` and
`CONTROLLED`. **`ACTIVE`, `INSUFFICIENT_EVIDENCE` and `UNKNOWN` are absent from it**, and across
**1,871 records carrying binder output in 34 already-open artifacts** the code fired **84 times**
with a proposed state of `ACTIVE` on **zero** of them.

The check therefore **cannot prevent a false `ACTIVE`**, and every candidate it deletes was already
non-asserting. Demotion moves a candidate from one non-`ACTIVE` state to another. Hazard detection,
false `ACTIVE` and the high-consequence axis are all computed from `asserts = some candidate at
ACTIVE`, so on all three **the disposition is a null move**.

> **Demotion does not recover `F-WC-09`.** A demoted candidate sits at `INSUFFICIENT_EVIDENCE`, does
> not assert, and the high-consequence miss still counts. **The remedy §43.8 asked this phase to
> evaluate does not fix the case that motivated it** — which is why the phase closes on the
> architecture rather than on the scenario.

### 44.2 The complete inventory — `F-WC-09` is one of four, not the only case `NEW_EVIDENCE`

Every recorded `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` rejection in the open L3 corpus: **84
occurrences, 46 scenarios, 52 distinct (scenario, proposed-state) pairs**. 83 of 84 carried the code
alone. Refused states: `CORRECTED` 38, `CONTROLLED` 35, `REMOVED_FROM_SERVICE` 6, `NEGATED` 1,
**`ACTIVE` 0**.

| class | pairs |
|---|---|
| **`NEGATIVE_CONTROL`** — `expect.hazardEstablished === false` | **39** |
| **`REAL_HAZARD`** — `expect.hazardEstablished === true` | **8** |
| ablation rows with no ground truth | 5 |

The eight real-hazard rows are `C-FLD-048` (`NEGATED`, not high-consequence) and four
high-consequence identities: `E-FLD-147`, `X-WC-02` (with three repeats), `F-WC-03` and `F-WC-09` —
every one of them a `CONTROLLED` claim whose truth is `ACTIVE`.

**The 39 negative controls are what deletion is holding back, and on them the model is right and the
binder is wrong on its own terms.** `D02` — *"the main disconnect was **locked out with each
worker's personal lock**, and voltage was verified absent"* — is a textbook lockout the model
labelled `CONTROLLED` and the binder refused because that phrasing is not in its admission
vocabulary. `B14`, `H-OF7` and `DEV-28` are the same shape. Deletion still yields the expected
customer outcome, because a controlled hazard and a deleted hazard are **both non-asserting**.

> **This is a `D-54` agreement — the right outcome reached by a reason unrelated to the scenario's
> semantics — and it is recorded because it is precisely what a preservation rule would convert from
> harmless into harmful.**

### 44.3 The authority line, read off the demotion the architecture already allows `STABLE_INVARIANT`

> #### `A REFUSAL MAY DEMOTE TO AN UNDECIDED STATE ONLY WHERE THE REFUSAL ITSELF ESTABLISHED THAT THE DECISION IS OPEN`

**§33.4's impression gate qualifies.** `checkSubjectiveImpression` establishes positively that *no
predication in the cited evidence asserts a condition of the thing observed* — nothing was asserted —
and raises `SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED` in the same breath. Demoting asserts
**nothing the check did not prove**, and the clarification it carries is owed by that same finding.

**`checkStateSupported` does not qualify.** It establishes only that the marker vocabulary for the
claimed state does not appear, asserted, in the cited span. It makes no finding about whether
anything was asserted and raises no clarification expectation. Demoting there would assert *"the
decision was not made"* — a proposition the check never established and which is **false on 39 of the
52 measured rows**. That is deterministic **semantic inference**, not deterministic **validation**,
and it is a conclusion the provider never proposed (`L3-INV-08`).

| | disposition | verdict |
|---|---|---|
| **A** | **DELETE** | **PERMITTED** — pure refusal, asserts nothing |
| **B** | DEMOTE TO UNDECIDED | **NOT PERMITTED** under this check — `L3-INV-08` |
| **C** | RE-DERIVE A DECIDED STATE (`CONTROLLED`→`ACTIVE`) | **FORBIDDEN TWICE** — invents a conclusion (`L3-INV-08`) and manufactures `ACTIVE` (`L3-INV-04`) |
| **D** | PRESERVE CANDIDATE + REJECT STATE | **COLLAPSES INTO B** — `L3_UNDECIDED_STATES` is the contract's only "unresolved", and §34.2 fixes the other six as the decision |

`controlAdequacy` separates the poles where it speaks (6 real-hazard rows against 1 negative control)
and is **refused on three independent grounds**: it is silent on **33 of 52** rows so cannot carry a
general rule; using it to decide would give a deliberately advisory module decision authority, which
`L3-INV-12`, §35.2, §36.4 and §43.4 each fix in place; and per §44.1 it would recover **zero**
high-consequence misses anyway.

### 44.4 The measured counterfactual — B and D are strictly dominated `MEASURED`

Computed over all 52 pairs with the shipped scorer's own semantics (`score-l32f-reasoning.ts`).

| | **A DELETE** `SHIPPED` | **B DEMOTE** | **C RE-DERIVE ACTIVE** | **D PRESERVE+REJECT** |
|---|---|---|---|---|
| high-consequence recovered | 0 | **0** | 7 | **0** |
| high-consequence still missed | 7 | **7** | 0 | **7** |
| **false `ACTIVE` introduced** | 0 | 0 | **39** | 0 |
| negative-control candidates preserved | 0 | **39** | 39 | **39** |
| **unnecessary clarifications introduced** | 0 | **31** | 0 | **31** |

**B and D move the high-consequence axis by zero and pay 39 preserved negative-control candidates and
up to 31 unnecessary clarifications for it** — against an axis held at **100% precision** since L3-2d
and identified by §36.7 as the binding trade. **C** closes the high-consequence axis and destroys the
false-`ACTIVE` gate on the same rows.

> **The trade is not "one deleted hazard against some precision noise". It is NO GATE MOVEMENT AT ALL
> against a measured 31-scenario precision loss.**

### 44.5 What deletion costs, not minimised

Deletion is **retained, not exonerated**. On the four high-consequence identities the customer
receives **no hazard record at all** rather than a candidate with its evidence and an open question —
§43.2's finding, and a real loss no shipped-scorer axis captures, because both outcomes are
non-asserting.

**It is not repairable at the binder.** It originates where `D-63` placed it, in the provider's
single-enum `conditionState` choice, and the binder cannot correct a wrong decided state without
making a decided claim of its own. Preserving the candidate delivers a question, not the hazard — on
the 4 rows that deserve one and on 31 that do not.

### 44.6 Regression, authority, egress and preservation

**L3 offline: 814 assertions over 10 suites, 0 failed** — identical suite for suite to §43.7.
`test:hazlenz-core` **28 of 30 suites**, the two documented §13.1 failures only and **not
reclassified**. KG contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off` 51/51,
`kg4b-shadow` 123/123, `kg3f-predicate` 16/16, `kg3f-determinism` 170/170, `evidence-foundation` 35.
Backend and frontend `tsc --noEmit` both exit 0.

**Customer authority is unchanged by construction — no production file was modified.** All 19
`reasoning-l3` modules byte-identical to L3-2k's digests, shipped prompt `b8cc50fc` at `v6`, run
schema `a522cf5a`, HEAD `1feda622` at 0/0, 23 tag objects, 4 stash entries untouched, sealed corpus
hash-verified and **not opened**. The worktree gains exactly one entry: the evidence directory.

**Egress: none.** Zero local inference calls, zero hosted calls, zero metadata or auth calls, zero
scenario identifiers transmitted, no credential read.

### 44.7 Exact next phase — NOT EXECUTED, and it is still not an engineering phase

**§43.8's handover is unchanged, with one engineering question now closed rather than open.** The
binder's deletion behaviour is settled and needs no further phase; no additional diagnostic phase on
already-open material is justified, because this one exhausted the question on the whole open corpus
and reached a structural answer.

What blocks the sealed run remains the **unadjudicated §31.2 / §10 privacy boundary**, the preview
model's mutability (`MUST_REVERIFY`), and §29.8's rule that the corpus is spent once. **Recommended
order:** adjudicate §31.2 first; if hosted egress is refused the sealed run executes against
`qwen3-coder:30b` and `F-WC-09`'s deletion is carried into acceptance as a known, quantified cost —
now with this phase's evidence that it is **not repairable downstream**; if hosted egress is
permitted, close the preview-label problem before spending the corpus. **Do not open the corpus to
settle a provider question.**

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** Unchanged. **This phase opened no sealed evidence and does
> not advance that gate.** Family coverage remains complete at 24 of 24, and
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.


---

## 45 — L3-2m HOSTED-INFERENCE POLICY + FINAL ACCEPTANCE READINESS (2026-08-24) `DECIDED, NOT IMPLEMENTED`

> ### `HOSTED_INFERENCE_AUTHORIZED_IN_PRINCIPLE — §31.2 / §10 PRIVACY BOUNDARY ADJUDICATED`
> ### `L3_FINAL_ACCEPTANCE_BLOCKED — STABLE_PROVIDER_MODEL_IDENTITY_REQUIRED`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2m-hosted-inference-policy-2026-08-24/`. **§29–§44 are not rewritten and
`D-55` through `D-65` stand exactly as recorded.** **POLICY AND READINESS DECISION ONLY.** Zero
production files, prompt bytes, schema bytes, binder semantics, scorers or harnesses modified; **zero
inference calls**, one metadata request; nothing committed, pushed or deployed; no stash operation;
no sealed corpus opened; no provider selected; L3-3 not begun; `L3-2l` not reopened.

### 45.1 The privacy boundary is adjudicated — and it was not the only prerequisite

**Safety InSite authorizes a hosted AI inference provider as an INTERNAL HazLenz reasoning
component**, subject to privacy, security, data-handling, contractual and production controls. §42.10,
§43.8 and §44.7 each handed back *"the unadjudicated §31.2 / §10 privacy boundary"* as the binding
gap. **It is now adjudicated in principle and is no longer a blocker in itself.**

The authorization does **not** select a provider, does **not** make the model customer-authoritative
— HazLenz remains the customer-facing system and the model an internal dependency — does **not**
relax `L3-INV-01`…`L3-INV-12`, the validator, the binder, evidence binding or regulatory governance,
and does **not** authorize the single-use sealed run, which §29.8 keeps separate.

> **Clearing the privacy gate exposed two prerequisites underneath it that no prior phase had cause
> to test.** The acceptance run remains blocked, for a different and newly measured reason.

### 45.2 There is no stable Gemini Pro at the measured tier `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

Measured, not asserted from memory, as `PROVIDER_REQUIREMENTS.md` requires: `GET /v1beta/models`,
one request, credential header only, **zero content** — **50 models, 37 supporting `generateContent`**.
Full catalogue at `provider/GEMINI_MODEL_CATALOGUE.json`.

> #### `EXACTLY THREE MODELS IN THE CATALOGUE ASSERT STABILITY IN THEIR OWN DESCRIPTION, AND ALL THREE ARE THE 2.5 GENERATION`

`gemini-2.5-pro` @ `2.5` (*"Stable release (June 17th, 2025)"*), `gemini-2.5-flash` @ `001`,
`gemini-2.5-flash-lite` @ `001`.

**Every 3.x Pro text model is a preview** — `gemini-3.1-pro-preview` and
`gemini-3.1-pro-preview-customtools`, both @ `3.1-pro-preview-01-2026`. The stable 3.x models are
**Flash tier only** (`gemini-3.5/3.6/3.7-flash`, `gemini-3.1-flash-lite`) and **none asserts
stability** — each carries only a dated version string. The rolling aliases `gemini-pro-latest`,
`gemini-flash-latest`, `gemini-flash-lite-latest` are the worst option for `P-07`: silently updated
by definition.

**The dilemma has no third branch.** `P-07` requires an addressable, non-silently-updated model id
*"because a silent model change would invalidate a passed gate"*, and §29.8 spends the corpus once:

| branch | consequence |
|---|---|
| the sealed run on **`gemini-3.1-pro-preview`** — the only model carrying measured HazLenz evidence (`D-62`) | **fails `P-07`.** No stability guarantee, label is not a content digest (§42.8 item 5, `MUST_REVERIFY` re-armed), dated **01-2026** against a catalogue now at 3.7. The result would be neither defensible nor reproducible, and the corpus is spent |
| the sealed run on a **stable** model | **zero measured HazLenz evidence exists for any of them.** `D-62` is a `gemini-3.1-pro-preview` fact end to end. A single-use asset spent on an unmeasured model is a blind run |

### 45.3 Google was never scored against `P-01`…`P-14` `DO_NOT_REDISCOVER`

`PROVIDER_SELECTION.md` scored exactly two candidates with source URLs and retrieval dates —
**Anthropic Claude** and the **local Ollama** model that was selected — and records `GEMINI_API_KEY`
as *unset* at the time. **Google appears nowhere in it.** It entered at §39 solely as an
architecture-selection comparator because a credential became available, which is precisely what
`D-55` fenced: *"a hosted preview model measured on 24 diagnostic scenarios is architecture-selection
evidence, never a production recommendation."*

> **Step 1 of the selection procedure has never been executed for Google, and step 2 — run the
> DEVELOPMENT cohort — has never been executed for ANY hosted candidate.** §31.1 recorded that step 2
> *could not* run for want of a credential. One is now resolvable. The step is outstanding and
> already specified; it is **not** a new diagnostic phase.

### 45.4 A ceiling no action removes `STABLE_INVARIANT`

> #### `NO GEMINI MODEL OF ANY TIER IS PINNABLE BY CONTENT DIGEST`

`qwen3-coder:30b` is pinned at `06c1097efce0…`. Google publishes no weight hash, so the strongest
recordable hosted identity is **`name` + `version` + retrieval date**. That is materially weaker and
it is **permanent**: a hosted acceptance result will always carry the residual risk that the weights
behind a stable label moved. This generalises §42.8 item 5 from *"a preview label is not a digest"* to
*"no hosted label is"*. The user must either accept that risk explicitly and record it, or execute
the acceptance run locally where the digest guarantee holds.

### 45.5 What a hosted provider actually receives, and the controls still owed

`§31.2`'s exclusion is **structural at the field level**, and a second **pattern-based** redactor runs
before the text becomes canonical. Its seven rules, read from `reasoning-input-builder.ts`: `email` ·
`phone` · `ssn` · `street_address` · `mine_id` · `employee_id` · `url`.

> **A pattern redactor cannot catch a personal name, an informal site reference or narrative
> identifying detail.** That is not a defect — the module documents itself as a second layer for
> *identifiers an inspector typed into the text* — but it is what changes meaning once the
> destination stops being `127.0.0.1`. **What a hosted provider receives is inspector-authored
> narrative prose.**

| control | state |
|---|---|
| `P-05` zero training on submitted data, contractually | **UNEVIDENCED for Google.** No artifact records any data-handling term for this credential; the endpoint is the developer API surface with a bare `GEMINI_API_KEY`, not an enterprise agreement |
| `P-06` configurable/short retention, stated window | **UNEVIDENCED for Google**, same reason |
| name-level redaction, or explicit acceptance of narrative PII egress | **NOT IMPLEMENTED, NOT DECIDED** |
| production credential management, rotation, least privilege | **NOT IMPLEMENTED** |
| `P-11` egress telemetry and a hosted-dependency error taxonomy | **NOT IMPLEMENTED** |

**`P-05` binds the acceptance run, not only production:** if the provider trains on submitted data,
transmitting the single-use sealed corpus **contaminates it permanently**, and every future evaluation
of that provider against it is tainted.

### 45.6 There is no production hosted path at all `DO_NOT_REDISCOVER`

Verified from source: `reasoning-l3` contains exactly three providers — the interface,
`ollama-reasoning-provider.ts` and `unavailable-reasoning-provider.ts`; it declares only
`L3_OLLAMA_ENDPOINT`, `L3_OLLAMA_MODEL`, `L3_OLLAMA_TIMEOUT_MS`; `grep` over all of `backend/src` for
`GEMINI` · `generativelanguage` · `googleapis` · `anthropic` · `openai` returns **nothing**; and
`backend/package.json` carries **zero** hosted-provider SDK dependencies.

Every Gemini measurement in §39–§43 came through the **verification-only** `gemini-ollama-shim.js`,
outside `backend/src` entirely — which is why §42.9 could state that no hosted credential became
required for customer execution *and none can*.

> **HazLenz cannot use hosted inference in production today, because the code to do so does not
> exist. Authorizing the policy does not create the adapter.**

### 45.7 Regression, authority, egress and preservation

No code changed, so no suite could move; the L3-2l regression set stands (**814 L3 assertions / 0
failed**, `hazlenz-core` 28 of 30 suites — the two documented §13.1 failures only, KG contracts
unchanged, both `tsc` clean).

**Customer authority** is unchanged by construction — no production file was modified, and §45.6
shows no hosted path exists to change it.

**Egress:** one destination, `generativelanguage.googleapis.com`, **1 HTTP request** —
`GET /v1beta/models`, credential in the `x-goog-api-key` header and nothing else. **0 inference calls,
0 local calls.** No scenario text, no corpus content, no customer or production data. The credential
was never printed, logged, hashed or persisted and **appears in zero artifacts**, verified by scanning
the written catalogue for the literal value. **`GEMINI_MODEL` — exported by the operator shell as
`gemini-3.1-flash-lite-preview`, not an authorized model — was NOT used and NOT substituted.**

**Preservation:** HEAD `1feda622`, 0/0 upstream, 23 tag objects, 4 stash entries with no stash
operation, all 19 `reasoning-l3` modules byte-identical, shipped prompt `b8cc50fc` at `v6`, run schema
`a522cf5a`, and the sealed corpus hash-verified and **not opened**. The worktree gains exactly one
entry: this evidence directory.

### 45.8 Exact next action — NOT EXECUTED, and it is provider qualification, not engineering

`PROVIDER_REQUIREMENTS.md`'s own selection procedure, steps 1–3, never executed for a hosted candidate:

1. **Score Google against `P-01`…`P-14` from current official documentation**, source URL and
   retrieval date for every claim — `P-05` and `P-06` first, since they gate everything else. Score
   **Anthropic Claude** the same way; `PROVIDER_SELECTION.md` already has it as the documented
   strongest hosted candidate.
2. **Qualify the chosen stable model on the DEVELOPMENT cohort** — already-open material, **never the
   sealed corpus** — recording `name` + `version` + retrieval date. Candidates: `gemini-2.5-pro` (the
   only stable Pro) and `gemini-3.7-flash` @ `3.7-flash-08-2026` (the newest dated stable 3.x).
3. **Record the decision and the pinned model id here**, with an explicit acceptance of §45.4's
   digest ceiling.

**This measures the provider, not HazLenz.** It changes no reasoning behaviour, prompt, binder or
customer authority. **No further L3 engineering is justified** — `L3-2l` closed the last open
engineering question and nothing found here is an architecture defect.

> **Do not open the sealed corpus to qualify a provider.** §29.8 spends it once, and `D-55`'s rule
> that diagnostic-cohort evidence is never a production recommendation applies to a stable model
> exactly as it applied to the preview.

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** Unchanged. **This phase opened no sealed evidence and does
> not advance that gate.** Family coverage remains complete at 24 of 24.


---

## 46 — L3-2n PROVIDER QUALIFICATION FOR FINAL ACCEPTANCE (2026-08-24) `EXECUTED, NO IMPLEMENTATION CHANGE`

> ### `FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — NO_CURRENT_STABLE_HOSTED_MODEL_MEETS_REQUIREMENTS`
> ### `P-05 / P-06 ARE SATISFIABLE — HOSTED DATA HANDLING IS NOT THE BLOCKER`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2n-provider-qualification-2026-08-24/`. **§29–§45 are not rewritten and
`D-55` through `D-67` stand exactly as recorded.** **QUALIFICATION ONLY — nothing implemented.** Zero
production files, prompt bytes, schema bytes, binder semantics, scorers or harnesses modified;
nothing committed, pushed or deployed; no stash operation; **no sealed corpus opened**; L3-3 not
begun; `L3-2l` not reopened; `R1_MISSING_FIRST` not promoted.

§45.8 named the action: execute `PROVIDER_REQUIREMENTS.md`'s never-run selection steps. This is that.
**All measurement used already-open diagnostic material** — the same 24-scenario shipped cohort
`D-62` was measured on, on the same instrument at schema `a522cf5a…` and prompt `b8cc50fc…`, with the
L3-2h transport shim byte-identical at `0ba265bb…` and **§38.3 process isolation throughout**.

### 46.1 The data-handling gates are SATISFIABLE `NEW_EVIDENCE`

Every assertion carries a source URL and a 2026-08-24 retrieval date in
`provider/OFFICIAL_DOCUMENTATION.md`; none is written from memory.

| gate | finding |
|---|---|
| **`P-05`** | **PASS on the PAID tier** — *"Google doesn't use your prompts…or responses to improve our products."* **FAIL on the free tier**, where content *"improve[s] Google products"* and *"human reviewers may read, annotate, and process your API input and output."* The gate is **tier-conditional**, so a billing-enabled project is a precondition, not a preference |
| **`P-06`** | **PASS** — paid-tier abuse-monitoring retention is a **stated 55 days**, held separately and not used to train any model beyond policy enforcement; and **Zero Data Retention is available on approved request** for paid projects, clearing *"all user content … and identifiable metadata … prior to logging."* HazLenz uses **none** of the ZDR-incompatible features (Search/Maps grounding, Interactions API, File API, explicit caching) |

> **This closes the question §42.10, §43.8 and §44.7 each deferred and `D-66` adjudicated in
> principle. Hosted data handling is not the blocker.** What blocks the acceptance run is elsewhere.

### 46.2 The only stable Pro is NOT CALLABLE `DO_NOT_REDISCOVER`

```
POST /v1beta/models/gemini-2.5-pro:generateContent   ->   HTTP 404 NOT_FOUND
"This model models/gemini-2.5-pro is no longer available to new users.
 Please update your code to use models/gemini-3.1-pro-preview ..."
```

All 48 cohort calls failed identically; a `gemini-3.7-flash` control in the same probe returned
**HTTP 200**, so credential and method are sound. `gemini-2.5-pro` is still returned by `ListModels`
and still documented as *"Stable release (June 17th, 2025)"*.

> #### `LISTMODELS PRESENCE IS NOT CALLABILITY, AND A DOCUMENTED "STABLE" LABEL IS NOT AVAILABILITY`
>
> Both must be probed. This is `D-67` in operational form and it is **stronger** than the
> documentation reading that produced it: at the Pro tier there is currently **no stable option at
> all** for this account, and Google's own error text directs a new account at a **preview** model.

### 46.3 The stable Flash models fail `P-02`, on one general mechanism `MEASURED`

`*` = recorded baseline, re-read from its frozen artifact, **not re-run**.

| model | MODEL tier | VALIDATED tier | false ACTIVE | clarification cand · scen · precision | validator rejections |
|---|---|---|---|---|---|
| `gemini-3.7-flash` A / B | **13/13** | **7/13 · 8/13** | 0/11 | 5/5 · 5/5 · 100% | **7 · 7** |
| `gemini-3.6-flash` A / B | **13/13** | 10/13 · 10/13 | 0/11 | 5/5 · 5/5 · 100% | 4 · 5 |
| `gemini-3.1-pro-preview` `*` | 13/13 | **13/13** | 0/11 | 5/5 · 5/5 · 100% | 1 |
| `qwen3-coder:30b` `*` | 12/13 | 11/13 | 0/11 | 5/5 · 5/5 · 100% | 1 |

**Every model ties at ceiling on false ACTIVE and on both clarification denominators**, exactly as
`D-62` found; the separation is entirely at the validator. *(Per `D-58` these two tiers are never one
number: the `qwen` figures here are `validatedAssertsActive`, computed identically for every row, and
are **not** §41.2's `HC (model-asserted) 12/13`.)*

**All 7 rejections on 3.7-flash and all 4–5 on 3.6-flash are `UNGROUNDED_CORRECTIVE_ACTION`** — the
validator requires `correctiveActionIntent.groundedInEvidence` to reference spans among the
candidate's **own** evidence, and the stable Flash models routinely ground a corrective action in a
span they did not also cite. Schema-contract validity: **71%** and **83%** against `P-02`'s **≥99%**
bar, with **6 of 7** and 3 of 4–5 rejections reproducing across two isolated processes — so the
permitted single retry **cannot be assumed to rescue them**.

> **In every rejected case the model had the hazard RIGHT** — MODEL tier is 13/13 for both — and the
> corrective-action field took a correct proposal down with it, costing 5 or 6 high-consequence
> findings at the validated tier.

**The validator is correct and was not touched.** The rule is `L3-INV-02` applied to corrective
action; §29.6 specifies rejection on contract violation; and **two other providers satisfy it at 23
of 24**, so the contract is demonstrably satisfiable. Under §22 and §24 this is **provider
non-conformance with a correct, pre-existing contract — not a HazLenz defect, and not a reason to
weaken the validator.** If a future phase ever revisits that rule it must do so on its own root cause,
**never to qualify a provider**.

### 46.4 `F-WC-09` and `C-CS-05` do NOT reproduce on either stable Flash model `NEW_EVIDENCE`

Through the **full** shipped path including `bindEvidenceSemantically`:

| scenario | `gemini-3.7-flash` | `gemini-3.6-flash` | `qwen` `*` |
|---|---|---|---|
| **`F-WC-09`** | `ACTIVE` → binder keeps → **delivered** | `ACTIVE` → **delivered** | `CONTROLLED` → binder deletes → **no hazard at all** |
| **`F-WC-03`** | `ACTIVE` → delivered | `ACTIVE` → delivered | `ACTIVE` → delivered |
| **`C-CS-05`** | `HYPOTHETICAL`, no question ✓ | `HYPOTHETICAL`, no question ✓ | ✓ |

Both read *"the two-hand control has been strapped down with tape"* as defeating the control —
3.7-flash's corrective action says *"removing tape from the two-hand control"*. **`D-63`'s residual is
a `qwen` property and reproduces on no Gemini model tested**; `D-64`'s `C-CS-05` is correct on shipped
variant B for both, as `D-64` predicted.

### 46.5 Reproducibility, transport, cost and regression

Noise floor across two isolated processes: **2 of 24** rows differ on 3.7-flash, **3 of 24** on
3.6-flash — above the 0/24–2/24 band `D-62` recorded, and carried as a `P-08` qualification.

Transport over 153 harness requests: **102 × 200**, 51 × 404 (the whole `gemini-2.5-pro` run), **0
truncation** (`STOP` throughout), 0 harness errors on callable models, 0 rate-limit errors. Tokens
over 102 successful calls: prompt 246,770, output 45,029, thought 16,455. **Total qualification cost
≈ $0.42**, about **$0.004 per analysis** — `P-14` settled comfortably.

**L3 offline: 814 assertions over 10 suites, 0 failed** — identical suite for suite to §43.7 and
§44.6. KG contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off` 51/51,
`kg4b-shadow` 123/123, `kg3f-predicate` 16/16, `evidence-foundation` 35. Backend `tsc --noEmit`
exits 0.

**Customer authority** unchanged by construction — no production file modified, and §45.6's finding
stands that no hosted adapter exists in `backend/src` to change it.

**Egress:** one destination, `generativelanguage.googleapis.com` — 153 harness requests, 1
`ListModels` metadata call, 3 isolation probes carrying `"Reply ok"` only. Content transmitted: the
**24 already-open diagnostic scenarios** plus `F-WC-09` / `F-WC-03` / `C-CS-05`, all previously
transmitted under §42–§43. **No customer or production data, no sealed-corpus bytes**, credential in
**zero** of the 31 artifacts. **`GEMINI_MODEL` was NOT substituted** — every run set
`GEMINI_MODEL_ID` explicitly and every artifact records the model it used.

### 46.6 Exact next action — NOT EXECUTED, and none of it is a HazLenz engineering phase

**Minimum blocker: no currently callable STABLE Gemini model reaches `P-02`'s ≥99% schema-contract
validity, and the Pro tier has no callable stable model at all.**

1. **Wait for, or obtain access to, a stable Gemini 3.x Pro.** `gemini-3.1-pro-preview` already meets
   every other requirement at 23/24; GA would qualify it immediately. **Re-probe `ListModels` AND
   callability** before relying on any label (§46.2).
2. **Qualify a second vendor.** `PROVIDER_SELECTION.md` already documents **Anthropic Claude** as the
   strongest hosted candidate — constrained-decoding structured output, an addressable pinned
   version, zero-data-retention agreements available — and it has **never been executed** because no
   credential was resolvable (§31.1). One credential makes it a 51-call run on this same cohort.
3. **Run acceptance locally.** `qwen3-coder:30b` @ `06c1097efce0…` is the only candidate pinnable by
   **content digest**, satisfies `P-05`/`P-06` absolutely at `127.0.0.1`, and scores 11/13 validated
   with the clarification axes at ceiling — carrying `F-WC-09`'s deletion as `D-63`'s known,
   quantified, one-scenario cost.

**Before any hosted production use, additionally:** confirm the project is **billing-enabled** (the
`P-05` gate is tier-conditional), request **ZDR**, build a hosted adapter behind the existing
`HazLenzReasoningProvider` interface (**none exists**, §45.6), decide name-level redaction or
explicitly accept narrative PII egress (§45.5), and implement `P-11` egress telemetry.

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** Unchanged. **This phase opened no sealed evidence and does
> not advance that gate.** Family coverage remains complete at 24 of 24, and
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.


---

## 47 — L3-2o ANTHROPIC PROVIDER QUALIFICATION (2026-08-24) `EXECUTED, NO IMPLEMENTATION CHANGE`

> ### `FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — ANTHROPIC_FAILS_EXISTING_REQUIREMENTS`
> ### `P-05 / P-06 SATISFIED — HOSTED DATA HANDLING IS NOT THE BLOCKER`
> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Evidence:
`verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/`. **§29–§46 are not
rewritten and `D-55` through `D-69` stand exactly as recorded.** **QUALIFICATION ONLY — nothing
implemented.** Zero production files, prompt bytes, schema bytes, binder semantics, scorers or
harnesses modified; nothing committed, pushed or deployed; no stash operation; **no sealed corpus
opened**; L3-3 not begun; `L3-2l` not reopened; `P-02` not weakened; Claude Code authentication
unchanged.

§46.6 route 2 named this run — *"One credential makes it a 51-call run on this same cohort"*. This is
that run, and it took **exactly 51 calls**. All measurement used **already-open diagnostic material**:
the same 24-scenario shipped cohort `D-62` and `L3-2n` were measured on, on the same instrument at
schema `a522cf5a…` and prompt `b8cc50fc…` (`v6`, byte-identical), cohort 24/24 with **0
disagreements**, and **§38.3 process isolation throughout**.

Transport is a new verification-only shim, `adapter/anthropic-ollama-shim.js` @ `76d3e039…`,
structurally mirroring the L3-2h shim `0ba265bb…` (unchanged, and not used here). It speaks the
Ollama wire protocol the harness already emits, so the locked harnesses ran **byte-unmodified**
against a third provider. It lives outside `backend/src`, is not behind `HazLenzReasoningProvider`,
and **creates no production hosted path** — §45.6 stands.

### 47.1 Anthropic clears the requirements that disqualified Gemini `NEW_EVIDENCE`

| gate | finding |
|---|---|
| **`P-05`** | **PASS, and NOT tier-conditional.** Commercial Terms §B: *"Anthropic may not train models on Customer Content from Services."* Contrast §46.1, where the gate turned on a billing tier. *Precondition, unverifiable from the API: the credential's organization must be under those terms.* |
| **`P-06`** | **PASS** — stated **30-day** deletion by default; **ZDR available on request**, the Messages API explicitly ZDR-eligible, and `claude-sonnet-5` **not** among the models that require 30-day retention. Residual: flagged content may be held **up to 2 years**. |
| **`P-07`** | **PASS — the strongest hosted result recorded.** *"Every Claude model ID is a pinned snapshot … a dateless format that is also a pinned snapshot, **not an evergreen pointer**."* Lifecycle **Active**, retirement *"not sooner than June 30, 2027"*, ≥60 days' notice. **This is the exact requirement `gemini-3.1-pro-preview` failed (`D-67`), so `D-67`'s blocker is not a permanent property of hosted inference.** §45.4's separate ceiling stands: still not a content digest. |
| **`P-12`** | **PASS, measured.** `GET /v1/models/claude-sonnet-5` **200**, `POST /v1/messages` **200**. Catalogue presence and callability agreed — the §46.2 trap did not recur, but it was **probed**, not assumed. |

### 47.2 And it produces the best reasoning result on record — then fails `P-02` `MEASURED`

`*` = recorded baseline, re-read from its frozen artifact, **not re-run**.

| model | MODEL tier | VALIDATED tier | false ACTIVE | clar cand · scen | precision | rejections |
|---|---|---|---|---|---|---|
| **`claude-sonnet-5` A / B** | **13/13 · 13/13** | **13/13 · 13/13** | 0/11 | 5/5 · 5/5 | **5/6 · 5/6** | **1 · 2** |
| `gemini-3.7-flash` A `*` | 13/13 | 7/13 | 0/11 | 5/5 · 5/5 | 5/5 | 7 |
| `gemini-3.6-flash` A `*` | 13/13 | 10/13 | 0/11 | 5/5 · 5/5 | 5/5 | 4 |
| `gemini-3.1-pro-preview` `*` | 13/13 | 13/13 | 0/11 | 5/5 · 5/5 | 5/5 | 1 |
| `qwen3-coder:30b` `*` | 12/13 | 11/13 | 0/11 | 5/5 · 5/5 | 5/5 | 1 |

**`claude-sonnet-5` is the only STABLE, CALLABLE model to reach 13/13 at the validated tier, and it
did so twice in isolated processes** — tying the disqualified preview and beating both stable Flash
models by 3–6 high-consequence findings. *(Per `D-58` the two tiers are never one number; the scorer
is L3-2n's, reused byte-identically.)*

**Schema-contract validity is 23/24 = 95.8% (A) and 22/24 = 91.7% (B)** against `P-02`'s **≥99%**
bar. The rejection common to both runs — `F-COR-01`, `UNGROUNDED_CORRECTIVE_ACTION` — **reproduces
across two isolated processes**, so the permitted single retry cannot be assumed to rescue it.

> **The verdict does not depend on how `P-02` is read.** Strict numeric reading: 95.8% < 99%. L3-2n's
> applied reading (a non-reproducing rejection is rescued by retry): `F-NC-01` would be rescued,
> `F-COR-01` would not. **Both give FAIL.** The bar was not moved and HazLenz was not changed.

**The mechanism is §46.3's, not a new one.** `L3-INV-02` applied to corrective action; §29.6 rejects
on contract violation; two providers satisfy it at 23/24. Under §22/§24 this is **provider
non-conformance with a correct, pre-existing contract — not a HazLenz defect and not a reason to
weaken the validator.** One difference is worth recording: **both Anthropic rejections landed on
`DECIDED_NON_ACTIVE` rows, so no high-consequence finding was lost** — where the same code cost
`gemini-3.7-flash` 5–6. Same rule, same code, materially different consequence.

### 47.3 `P-08` fails independently, and structurally `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

> #### `ON CLAUDE 4.7 AND LATER THERE IS NO DETERMINISM CONTROL AT ALL`

`temperature`/`top_p`/`top_k` are deprecated and *"Return a 400 error when set to a non-default
value"*; there is **no `seed` parameter**. The harness's `temperature: 0` and `seed: 20260822` are
**inexpressible**, not discarded by choice. Measured: **6 of 24 rows differ** across two isolated
processes (`F-CL-01`, `F-CL-03`, `B08`, `H-AM-05`, `H-NG-02`, `F-NC-01`) — against 0/24–2/24 for
`D-62`, 2/24 for 3.7-flash and 3/24 for 3.6-flash. **The worst reproducibility measured**, and
`P-08` exists because *"evaluation must be re-runnable"*. The instability lands in the same
clarification/uncertainty cohort §38.4 identified, now corroborated at **n = 3 providers**.

### 47.4 Clarification precision discriminates for the first time `NEW_EVIDENCE`

`B08` raises a clarification it should not, **on both runs** — precision **5/6 = 83%** where every
model in `D-62` and `L3-2n` tied at 5/5. `B08` is `REGRESSION_ACTIVE`: the hazard is still correctly
ACTIVE and delivered, so nothing is lost at the safety tier, but `L3-INV-06` makes clarification a
decision-boundary contract and an unnecessary question costs the inspector. **The axis `D-62`
recorded as non-discriminating now discriminates.**

### 47.5 `F-WC-09` and `C-CS-05` are both CORRECT `NEW_EVIDENCE`

Through the **full** shipped path including `bindEvidenceSemantically`: `F-WC-09` `ACTIVE` → binder
keeps → **delivered** (`control-adequacy` recorded `CONTROL_ABSENT` on *"strapped down"*); `F-WC-03`
`ACTIVE` → delivered; `C-CS-05` `HYPOTHETICAL`, no question. **`D-63`'s residual is confirmed a
`qwen` property on a third provider**, and `D-64`'s `C-CS-05` is correct on shipped variant B as
`D-64` predicted.

### 47.6 Transport fidelity — deviations measured, and proved benign

Six deviations were forced and all are recorded in the shim header. The three schema strips were each
established by **submitting the construct to the live API**, not by reading prose: `minItems: 2`
(400, only 0/1 supported), `maxItems: 0` (400, unsupported) and an empty `enum: []` (400, must be
non-empty). Each is **independently enforced by `deterministic-safety-validator.ts`** —
`INVALID_CLARIFICATION_DEPENDENCY`, `UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE` and
`INVENTED_REGULATORY_CANDIDATE` (`L3-INV-01`) respectively. The other three are `temperature`, `seed`
and `num_ctx`, which have no expressible equivalent.

> **The strips were proved harmless, not assumed harmless.** Across all **51 rows** the only validator
> code observed is `UNGROUNDED_CORRECTIVE_ACTION` (×3); occurrences of every code D1/D2/D3 could have
> caused are **zero**. The `P-02` failure is attributable to the provider, not the shim.

**`minLength` is accepted at the wire level and `type: ["object","null"]` unions need no rewrite**, so
the portability cost is *smaller* than `PROVIDER_SELECTION.md` predicted on 2026-08-22. The validator
was not weakened to accommodate Anthropic.

### 47.7 Transport, cost, regression, authority and egress

**51 requests, 51 × HTTP 200, 0 truncation** (`end_turn` throughout), 0 harness errors, 0 rate-limit
errors. Tokens: prompt **307,401**, output **81,325**. **Total cost $1.43** at the documented $2/$10
per MTok — **$0.028 per analysis**, ~7× Gemini's $0.004 and absolutely small. Latency mean **17.4 s**,
max **79.6 s**, against §31.7's proposed (non-authoritative) p95 ≤ 12 s.

> **Everything was measured at PROVIDER DEFAULTS; nothing was tuned.** `thinking` and
> `output_config.effort` were omitted, meaning adaptive thinking at the documented default effort
> `high`. Lower effort levels are supported and **untested**. Tuning them to obtain a pass was not
> attempted and would not have been legitimate.

**L3 offline: 814 assertions over 10 suites, 0 failed** — identical suite for suite to §43.7, §44.6
and §46.5. KG contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off` 51/51,
`kg4b-shadow` 123/123, `kg3f-predicate` 16/16, `evidence-foundation` clean. Backend `tsc --noEmit`
exits 0.

**Customer authority** unchanged by construction — no production file modified, `git diff HEAD --
backend/src` is 0 lines, and §45.6's finding stands that no hosted adapter exists in `backend/src`.

**Egress:** one destination, `api.anthropic.com` — 51 harness requests, 1 `GET /v1/models` metadata
call, 2 availability probes carrying `"Reply ok"`, 10 schema-keyword probes carrying `"x"`, and 1
smoke test on a synthetic observation that is not a cohort scenario. Content transmitted: the **24
already-open diagnostic scenarios** plus `F-WC-09` / `F-WC-03` / `C-CS-05`, all previously
transmitted under §42, §43 and §46. **No customer or production data, no sealed-corpus bytes.** The
credential rode only in the `x-api-key` header and appears in **zero** artifacts (0 hits across 44
evidence files and 0 repo-wide). **Claude Code's own claude.ai authentication was not changed or
used as the experiment credential.**

**Preservation:** HEAD `1feda622`, upstream 0/0, 23 tag objects, 4 stash entries with **no stash
operation**, all 19 `reasoning-l3` modules byte-identical, both locked harness digests unchanged,
shipped prompt `b8cc50fc` at `v6`, run schema `a522cf5a`. **Sealed corpus hash-verified identical and
NOT OPENED**: `49aa40fd…`, `a95e5480…`, `6f6897f1…`. The worktree gains exactly one entry: this
evidence directory.

### 47.8 Exact next action — NOT EXECUTED, and it is a user decision

**Minimum blocker: no hosted provider yet reaches `P-02`'s ≥99% schema-contract validity, and the one
that comes closest additionally offers no determinism control for `P-08`.**

1. **Re-run Anthropic at a lower `output_config.effort`** — the only *measurement* gap this phase
   leaves, since everything here was taken at the default `high`. Another 51-call run on the same
   already-open cohort, ~$1.40, reusing this phase's shim and runner unchanged.
2. **Accept `P-02` and `P-08` as written and stop qualifying hosted providers.** Five candidates,
   five different failures. `P-08` may be unobtainable from *any* current hosted model now that
   sampling controls are being removed — if so, `PROVIDER_REQUIREMENTS.md` itself needs a decision,
   and **changing a requirement is the user's call, never a response to a provider failing it.**
3. **Run acceptance locally** on `qwen3-coder:30b` @ `06c1097efce0…` — still the only candidate
   pinnable by content digest, satisfying `P-05`/`P-06` absolutely and `P-08` at 65/66, scoring 11/13
   validated, carrying `F-WC-09`'s deletion as `D-63`'s known one-scenario cost.

**Before any hosted production use, additionally:** confirm the organization behind
`ANTHROPIC_API_KEY` is under the **Commercial Terms** and request **ZDR**; build a hosted adapter
behind `HazLenzReasoningProvider` (**none exists**, §45.6 — this phase's shim must not become one);
decide name-level redaction or explicitly accept narrative PII egress (§45.5); implement `P-11`
egress telemetry; and accept §45.4's digest ceiling explicitly.

**No further HazLenz engineering is justified.** `L3-2l` closed the last open engineering question;
nothing found here is an architecture defect.

> **`L3-3 must not start until` the high-consequence gate reaches zero on FRESH SEALED evidence with
> the clarification axis still at 100/100.** Unchanged. **This phase opened no sealed evidence and does
> not advance that gate.** Family coverage remains complete at 24 of 24, and
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.


---

## EVIDENCE INDEX

Root: `verification/hazlenz-governed-knowledge-growth-2026-08-19/`

| Phase | Path | Key artifacts |
|---|---|---|
| KG-1 | `kg-1/` | `KG_1_VERIFICATION.md`, `REPRODUCTION_COMMANDS.md` |
| KG-2 | `kg-2/` | `KG_2_VERIFICATION.md`, `REPRODUCTION_COMMANDS.md` |
| KG-3A | `kg-3a/` | `KG_3A_VERIFICATION.md`, `shadow-report.json` |
| KG-3B | `kg-3b/` | `KG_3B_VERIFICATION.md`, `corpus-migration-inventory.json`, `shadow-report-effective-approval.json` |
| KG-3C | `kg-3c/` | `KG_3C_VERIFICATION.md` (§20 supersedes §§1–19 open items), `display-contract-matrix.json`, `corpus-transition-report.json`, `browser/` |
| KG-3D | `kg-3d/` | `KG_3D_VERIFICATION.md`, `review-evidence.json`, `cutover-coverage-matrix.json`, `1910-303-content-verification.json`, `1910-36-content-verification.json`, `source-evidence/`, `unrelated-worktree-changes.sha256` |
| KG-3E | `kg-3e/` | `KG_3E_VERIFICATION.md`, `work-queue-final.json`, `clause-verification.json`, `hazard-family-coverage.json`, `FINDING-approval-binding-excludes-source-url.md`, `FINDING-suggest-ordering-nondeterminism.md`, `phase3-uncovered-citation-adjudications.md`, `unrelated-worktree-changes.sha256` (18 files) |
| KG-3F | `kg-3f/` | `STATUS.md`, `MSHA-TRAFFIC-01-adjudication.md`, `phase1-suggest-pipeline-trace.md`, `phase2-4-deterministic-retrieval.md`, `phase5-7-56-14132-adjudication.md`, `phase8-10-approval-provenance-contract.md`, `phase11-13-inventory-and-shadow.md`, `phase14-16-readiness-display-disconnection.md`, `rule-to-corpus-map.json`, `family-readiness.json`, `determinism/`, `browser/`, `kg3f-changed-files.sha256` |
| KG-4A | `kg-4a/` | `STATUS.md`, `DEFAULT_OFF_PROOF.md`, `REPORT_BROWSER_CONCURRENCY_TENANCY_PERF.md`, `contracts/CUTOVER_ARCHITECTURE.md`, `contracts/PHASE1_CUSTOMER_PATH_MAP.md`, `contracts/FALLBACK_AND_APPLICABILITY.md`, `contracts/PROVENANCE_PINNING_ROLLBACK.md`, `contracts/56-14132-B1-ADJUDICATION.md`, `contracts/fallback-matrix.json`, `failure-matrix/`, `perf/`, `browser/`, `baseline/`, `kg4a-changed-files.sha256` (22 files) |
| KG-4B | `kg-4b/` | `STATUS.md`, `INSTRUMENTATION_DEFECTS_FOUND.md`, `CORPUS_AND_ANALYTICS.md`, `DEFAULT_OFF.md`, `INVARIANCE_PROVENANCE_FAILURE_BROWSER.md`, `contracts/SHADOW_EVENT_AND_TAXONOMY.md`, `contracts/shadow-taxonomy.json`, `corpus/shadow-events.jsonl` (83 events), `corpus/case-results.json`, `analytics/shadow-analytics.json`, `determinism/layout-invariance.json`, `privacy/privacy-review.json`, `perf/shadow-performance.json`, `failure-injection/`, `browser/`, `kg4b-changed-files.sha256` (14 files) |

| KG-4C | `kg-4c/` | `STATUS.md`, `INCIDENT-ownership-guard-caused-the-damage-it-prevents.md`, `PRODUCTION_SHADOW_RUNBOOK.md`, `WORKLOAD_AND_SINK.md`, `REPRODUCTION_COMMANDS.md`, `contracts/production-shadow-contract.json` |

| KG-4D | `kg-4d/` | `STATUS.md`, `REPRODUCTION_COMMANDS.md`, `phase3-legacy-invariance.json`, `phase5-shadow-invariance.json`, `phase14-cohort-isolation.json`, `captures/`, `telemetry/kg4d-shadow-events.jsonl`, `browser/` (16 screenshots + results), `browser/harness/kg4d-integrated-shadow-invariance.mjs` |

| KG-4E | `kg-4e/` | `STATUS.md`, `REPRODUCTION_COMMANDS.md`, `contracts/report-input-trace.json`, `contracts/report-volatility.json`, `contracts/case-coverage.json`, `phase3-report-invariance.json`, `control-legacy-vs-legacy.json`, `control-mutation-must-fail.json`, `phase7-failure-shadow-killswitch.json`, `phase7-failure-shadow-resolverfail.json`, `pdfs/` (56 generated PDFs across 7 labels), `pages/` (32 rendered page images), `telemetry/kg4e-shadow-events.jsonl` (24 events) and `telemetry/kg4e-resolverfail-events.jsonl` (24 events), `captures/shadow-report-api-surfaces.json` |

| L3-2f | `verification/hazlenz-l3-2f-predicate-scope-2026-08-23/` | `STATUS.md`, `ROOT_CAUSE.md`, `REPRODUCTION_COMMANDS.md`, `HOLDOUT_FREEZE.txt`, `FINAL_STATE.txt`, `preservation-pre.txt`, `preservation-evidence.txt`, `SECURITY_AND_BOUNDARY.txt`, `contracts/holdout-l32f.frozen.json` (sha256 `47f92dae…`), `rootcause/f1-f4-proof-pre-patch.json` + `-post-patch.json`, `rootcause/f5-f6-ablation-run.json`, `rootcause/f5-confirm-run.json`, `rootcause/stability-run*.json`, `results/holdout-run-1.json` + `-run-2.json` + `holdout-score-1.json`, `results/reproducibility.json`, `results/family-coverage.json`, `results/l3-compare.json`, `results/customer-authority-invariance.json`, `results/dev-run-{1,2,3}.json` (variant A and B, both retained), `results/regression/` |

| L3-2g | `verification/hazlenz-l3-2g-state-separation-2026-08-23/` | `STATUS.md`, `NEXT_ACTION.md`, `WEAK_FIXTURE_DISPOSITION.md`, `REPRODUCTION_COMMANDS.md`, `FINAL_STATE.txt`, `SECURITY_AND_BOUNDARY.txt`, `preservation-pre.txt`, `preservation-evidence.txt`, `rootcause/binder-residual-pre-patch.json` + `-post-patch.json`, `rootcause/ablation-run-1.json` (4 variants x 24 scenarios) + `ablation-run-2.json` (matched-perturbation + noise floor), `results/resolution-ablation.json` (3 resolver orderings over frozen facts), `results/order-sensitivity.json` (noise floor 0/24), `results/fact-coherence.json`, `results/customer-authority-invariance.json`, `results/l32f-rescore-multihazard.json`, `results/regression/`, `evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md` + `source-survey.json` |

| L3-2h | `verification/hazlenz-l3-2h-cross-provider-2026-08-23/` | `STATUS.md`, `NEXT_ACTION.md`, `SECURITY_AND_PRESERVATION.txt`, `FINAL_STATE.txt`, `preservation-pre.txt`, `baseline-head.txt`, `baseline-status.txt`, `baseline-stash.txt`, `baseline-tags.txt`, `contracts/LOCKED_EXPERIMENT.txt` (hashes recorded BEFORE any change), `results/baseline-repro.json` (3 variants x 24, locked experiment unchanged), `results/repeat-isolated.json` (the same-process confound control), `results/baseline-order-sensitivity.json`, `results/baseline-resolution.json`, `results/baseline-fact-coherence.json`, `results/regression/` |

| L3-2h resume | `verification/hazlenz-l3-2h-cross-provider-resume-2026-08-23/` | `STATUS.md`, `CREDENTIAL_GATE.txt` (gate re-test; the HTTP 401 provider rejection that upgrades §38.1's length-class inference to a measurement), `SECURITY_AND_PRESERVATION.txt` (preservation, customer authority, sealed-corpus hashes, egress, and the annotated-tag comparison-method note), `FINAL_STATE.txt`, `baseline-head.txt`, `baseline-status.txt`, `baseline-stash.txt`, `baseline-tags.txt`. **No `results/` — the credential gate failed, so no experiment ran.** |

| L3-2h final | `verification/hazlenz-l3-2h-cross-provider-final-2026-08-23/` | `STATUS.md`, `preservation-evidence.txt`, `adapter/gemini-ollama-shim.js` (the transport-only Ollama-protocol shim) + `adapter/run-l32h.sh` (**three separate harness processes**, §38.3) + `adapter/score-l32h.sh` + `adapter/truerecall.py` (the full-cohort recount behind `D-56`), `results/l32h-gemini-V_S_STRUCT.json` · `-V_S_STRUCT_MOVE1.json` · `-V_S_STRUCT_REPEAT.json` and `results/l32h-gemini-merged.json` (72 rows), `results/gemini-order-sensitivity.json` · `gemini-fact-coherence.json` · `gemini-resolution.json` and `results/qwen-order-sensitivity.json` · `qwen-fact-coherence.json` · `qwen-resolution.json` — **the same byte-unmodified scorers run on both providers**, `transport/transport-V_S_STRUCT*.jsonl` (72 calls with per-call token and latency accounting; the 527 mean thought-token measurement). **No new holdout. No sealed corpus opened. No scorer patched.** |

| L3-2i | `verification/hazlenz-l3-2i-clarification-carrier-2026-08-24/` | `STATUS.md`, `PRESERVATION_AND_EGRESS.txt` (preservation, containment at the documented seam, credential and egress audit), `rootcause/frozen-rescore-qwen.json` + `-gemini.json` (**the corrected scorer over the frozen L3-2h artifacts with ZERO new inference** — `D-56` reproduced at 3/4 candidate-conditioned and 3/5 scenario-level, and **zero** pre-existing keys changed), `results/proof-qwen-V_BASELINE_NO_CARRIER.json` (the BEFORE, carrier absent) + `-V_CARRIER.json` · `-V_CARRIER_MOVE1.json` · `-V_CARRIER_REPEAT.json` (**four separate processes, pids recorded**, §38.3), `results/scenario-score-*.json` (the corrected scenario-level metric over rows the pre-`D-56` filter deleted outright: **0% → 100%**). **No new holdout. No sealed corpus opened. Shipped prompt byte-unchanged.** |
| L3-2j | `verification/hazlenz-l3-2j-carrier-activation-2026-08-24/` | `STATUS.md`, `INDEX.md`, `NEXT_ACTION.md`, `CREDENTIAL_AND_EGRESS.txt` (**why item (4) was not executed**, presence-only probe, egress count), `results/shipped-qwen-V_PRE_ACTIVATION.json` (**the BEFORE** — HC 12/13, clarification **5/5 on both denominators**, precision 100%), `results/decl1/` + `results/decl2/` (the two declaration revisions, each with its own-process repeat control at a **0-difference** noise floor — HC **9/13** and **10/13**), `results/halves/` (the schema half alone — the attribution control), `results/DENOMINATORS.json` (**`D-58`** both denominators for every variant), `results/reproduction/` (the harness-side declaration reproduces the in-prompt run exactly, and the post-revert baseline reproduces the pre-declaration baseline at **0/168**), `rootcause/locked-under-activation/` (**the locked L3-2h comparison re-derived — `V_B_LADDER` moves on 11 of 24 rows**) and `rootcause/locked-restored-V_B_LADDER.json` (**0 differences after the revert**). **No sealed corpus opened. 0 hosted-provider calls. Shipped prompt and schema end byte-identical to v6.** |
| L3-2j item (4) | `verification/hazlenz-l3-2j-cross-provider-closure-2026-08-24/` | `STATUS.md`, `INDEX.md`, `NEXT_ACTION.md`, `CREDENTIAL_AND_EGRESS.txt` (**the gate PASSED** — presence-only probe, HTTP 200, authorized-model proof, and the itemised 147-request egress account), `preservation-pre.txt` + `PRESERVATION_POST.txt` (HEAD, 23 tag objects, 4 stashes, the locked instrument, the shipped prompt and schema, all 19 modules, the sealed corpus, and **every file of the frozen L3-2g/h/i/j packages**, before and after), `results/shipped-gemini-V_PRE_ACTIVATION.json` + `-REPEAT.json` (**the Gemini measurement and its own-process floor**), `results/DENOMINATORS.json` (**`D-58` both denominators, both providers, neither renamed**), `results/DENOMINATORS-qwen-restored-v6.json` (the restored-v6 qwen baseline re-scored from frozen artifacts with **ZERO new inference**), `results/locked-gemini-V_B_LADDER.json` · `-V_A_LADDER.json` · `-V_B_LADDER_REPEAT.json` and `results/gemini-order-sensitivity-shipped-ladder.json` (**order sensitivity 0/24 against a same-instrument floor of 0/24**), `results/qwen-l32g-ladder-order-sensitivity-rescored.json` (qwen's **1/24**, re-scored from the frozen L3-2g artifact), `results/compare-shipped-qwen-vs-gemini.json` and `results/compare-locked-V_B_LADDER-qwen-vs-gemini.json` (**11 of 24** and **10 of 24** rows), `rootcause/driftcontrol-*` (**the model-drift control — a preview label is not a digest, and this discharges it**), `transport/*.jsonl` (145 requests, 144 × 200, one retried 503, `STOP` throughout, no truncation), `adapter/` (the L3-2h shim **byte-unmodified**, six variants in **six separate processes**), `regression/` (814 L3 assertions / 0 failed, KG contracts, `hazlenz-core` 206/2, both `tsc` clean). **No new holdout. No sealed corpus opened. No scorer patched. No prompt or schema edit. ZERO qwen inference, ZERO local calls.** |
| L3-2k | `verification/hazlenz-l3-2k-shipped-residual-rootcause-2026-08-24/` | `STATUS.md`, `INDEX.md`, `NEXT_ACTION.md`, `preservation-pre.txt` + `PRESERVATION_POST.txt`, **`rootcause/CASE_TRACES.json`** (the deliverable — every stage of every run: candidate identity, family, `conditionState`, verbatim rationale, evidence binding, validator state, semantic-binder issues, whether §34.2's gate fired, `clarificationsDropped`, binder rejections and codes, `controlAdequacy`, and the two final decision axes), `instrumentation/l32k-artifact-table.txt` (**the EXISTING-ARTIFACT sweep that came first — 80 recorded rows across L3-2g/2h/2h-final/2i/2j/2j-closure**), `results/qwen/D_WC09_LADDER*.json` (`F-WC-09` **and the `F-WC-03` control**: `CONTROLLED` → `VALID` → **binder REJECTS** → `boundHazards: []`, against the control's `ACTIVE` → kept → delivered), `results/qwen/D_CS05_LADDER_{A,B}*.json` (**eight isolated processes, four per variant** — the question deterministic 4/4, the demotion 1/4, the gate firing 3/4), `results/gemini/D_WC09_LADDER*.json` (**Gemini's candidate survives the binder to `ACTIVE`, twice** — the one provider-side question artifacts could not answer), `transport/*.jsonl` (4 hosted calls, all 200, `STOP`, no retries), `instrumentation/diagnose-l32k-shipped-residual.ts` (**disposable, imports the shipped validator AND semantic binder, pins variant A to the frozen `a6dea73f` digest, refuses >1 variant per process**), `regression/` (814 L3 assertions / 0 failed, KG contracts, `hazlenz-core` 206/2, both `tsc` clean). **DIAGNOSIS ONLY. Nothing repaired. No prompt or schema edit. No scorer or harness patched. No new holdout. No sealed corpus opened.** |
| L3-2l | `verification/hazlenz-l3-2l-semantic-state-disposition-2026-08-24/` | `STATUS.md` (the architecture decision, its authority argument and the measured counterfactual), **`inventory/DISPOSITION_ANALYSIS.json`** (the deliverable — the four dispositions costed over all 52 distinct (scenario, proposed-state) pairs using the SHIPPED scorer's own `asserts := some candidate at ACTIVE` semantics, plus the structural finding that `ACTIVE` is absent from `checkStateSupported`'s `required` map and has **never** been refused by it), `inventory/semantic-state-rejection-inventory.json` (**the complete `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` inventory — 84 occurrences, 46 scenarios, 34 artifacts, 1,871 records scanned**, each row carrying scenario, provider, family, proposed state, evidence, binder detail, ground truth, high-consequence flag, clarification expectation and the `controlAdequacy` recorded on the same candidate), `inventory/build-inventory.js` + `inventory/build-disposition-analysis.js` (**read-only, zero inference, zero production import**), `PRESERVATION_AND_EGRESS.txt` (HEAD, 23 tag objects, 4 untouched stashes, all 19 modules, the shipped prompt, the sealed corpus hash-verified and unopened, and a **zero-call** egress account), `regression/` (814 L3 assertions / 0 failed, KG contracts, `hazlenz-core` 28/30 suites — the two §13.1 failures only, both `tsc` clean). **DECISION ONLY. Nothing implemented. ZERO inference of any kind. No production file, prompt, schema, scorer or harness touched. No new holdout. No sealed corpus opened.** |
| L3-2m | `verification/hazlenz-l3-2m-hosted-inference-policy-2026-08-24/` | `STATUS.md` (the programme decision, the model-identity dilemma, the data-handling gap and the terminal state), `NEXT_ACTION.md`, `INDEX.md`, **`provider/GEMINI_MODEL_CATALOGUE.json`** (the deliverable — the provider's own `GET /v1beta/models` response reduced to identity metadata: **50 models, 37 supporting `generateContent`**, the three that assert stability, every 3.x Pro text model and its preview version string, the rolling aliases that cannot be pinned, and the full name/version/method catalogue so no future phase need re-probe), `PRESERVATION_AND_EGRESS.txt` (HEAD, 23 tag objects, 4 untouched stashes, all 19 module digests, `backend/src` proven free of any hosted reference, the sealed corpus hash-verified and unopened, a presence-and-length-class-only credential audit, and a **1-request, 0-inference** egress account). **POLICY AND READINESS DECISION ONLY. Nothing implemented. ZERO inference calls. No production file, prompt, schema, binder, scorer or harness touched. No new holdout. No sealed corpus opened. No provider or model selected. `GEMINI_MODEL` NOT substituted.** |
| L3-2n | `verification/hazlenz-l3-2n-provider-qualification-2026-08-24/` | `STATUS.md`, `NEXT_ACTION.md`, `INDEX.md`, **`provider/OFFICIAL_DOCUMENTATION.md`** (14 provider assertions, **every one with a source URL and a 2026-08-24 retrieval date** — free-vs-paid data use, the 55-day abuse-monitoring window, ZDR availability and its incompatible features, stable/preview/latest/experimental semantics, deprecation notice, structured-output keyword support, pricing — plus the measured `gemini-2.5-pro` **HTTP 404 "no longer available to new users"** with its `gemini-3.7-flash` HTTP 200 control), **`provider/P01_P14_SCORECARD.md`** (`P-01`…`P-14` scored **unchanged from `PROVIDER_REQUIREMENTS.md`**, three stable candidates plus the preview for reference, with the disqualifying requirement named for each), `results/F37-*` · `F36-*` · `P25-*` (**twelve run artifacts, four per model in four separate processes** per §38.3 — the 24-scenario shipped cohort plus its own-process noise floor, `D_WC09_LADDER` and `D_CS05_LADDER_B` through the **full binder path**), `adapter/` (the L3-2h shim **byte-identical at `0ba265bb`**, the runner, the scorer), `transport/*.jsonl` (**153 requests, 102×200, 51×404, zero truncation**, per-call token and latency accounting), `PRESERVATION_AND_EGRESS.txt` (HEAD, 23 tag objects, 4 untouched stashes, the locked instrument and shim digests, all 19 module digests, sealed corpus hash-verified and unopened, presence-and-length-class credential audit, **credential in 0 of 31 files**), `regression/` (814 L3 assertions / 0 failed, KG contracts, `tsc` clean). **QUALIFICATION ONLY. Nothing implemented. No production file, prompt, schema, binder, scorer or harness touched. No new holdout. NO SEALED CORPUS OPENED. No provider selected. `GEMINI_MODEL` NOT substituted.** |
| L3-2o | `verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/` | `STATUS.md`, `NEXT_ACTION.md`, `INDEX.md`, `PRESERVATION_AND_EGRESS.txt`, `provider/OFFICIAL_DOCUMENTATION.md` (15 sourced assertions), `provider/P01_P14_SCORECARD.md`, `provider/AVAILABILITY_PROBE.json`, `provider/SCHEMA_KEYWORD_PROBE.json`, `results/S5-*.json` (4 isolated runs), `results/SCORE.txt`, `adapter/anthropic-ollama-shim.js` (`76d3e039…`), `transport/*.jsonl` (51 requests), `regression/` |


**Protected gold set** (read-only, hash-verified `93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3`):
`verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts`

Reproduction commands live in each phase's `REPRODUCTION_COMMANDS.md`. KG-4A's and KG-4B's are the
most complete and document database ownership per suite.

---

## UPDATE POLICY

After each major completed slice:

1. **Update `docs/INSITE_CURRENT_STATE.json`** — checkpoint, readiness, verification scores, corpus
   figures, `nextSlice`, and any new `reverify` keys.
2. **Update only the materially changed sections** of this blueprint. §17 (Open Work) is rewritten
   each slice; §§1–16 and §19–20 are amended narrowly.
3. **Append to the decision log (§18).** Give the new decision the next `D-nn` id. If a decision is
   superseded, mark its **Status** `SUPERSEDED BY D-nn` — do not delete the row.
4. **Do not rewrite history.** Prior checkpoint metrics keep their original phase labels forever. A
   KG-3F number stays a KG-3F number even after KG-5 re-measures it.
5. **Move completed `OPEN_ITEM` entries** into the decision log or the caveat list; do not silently
   drop them.
6. **Add new `MUST_REVERIFY` fields** whenever a slice introduces new mutable state (a new env var, a
   new pointer, a new counted population), in both this file and the JSON.
7. **Never let this file become the source of truth over the repository.** If a future session finds a
   contradiction, the code wins and this file gets corrected in the same session.

---


### Master-documentation governance (`PROTECTED_DECISION`, KG-5C)

**Every completed KG phase that changes architecture, authority boundaries, release lifecycle,
approval semantics, resolver behaviour, customer-visible provenance, production operation state,
protected invariants, known blockers, or verified current state MUST update this blueprint and
`docs/INSITE_CURRENT_STATE.json` BEFORE the phase may be declared complete.**

* This blueprint is the **durable architectural record**.
* `INSITE_CURRENT_STATE.json` is the **machine-readable operational handoff**.
* Neither may knowingly lag behind verified implementation state.
* `INSITE_CURRENT_STATE.json` must validate as **strict JSON** after every edit, and the blueprint
  diff must be inspected for accidental deletion or contradiction.
* **If implementation behaviour and documentation disagree, the phase is NOT complete.**

## FUTURE-SESSION BOOTSTRAP

> **Copy/paste for the start of any major InSite session.**
>
> Read `docs/INSITE_ENGINEERING_BLUEPRINT.md` and `docs/INSITE_CURRENT_STATE.json` before doing
> anything else. Treat `STABLE_INVARIANT` and `PROTECTED_DECISION` entries as binding: preserve them
> unless current repository evidence contradicts them, and never reopen a closed KG decision to make a
> test or a metric more convenient. Reverify every `MUST_REVERIFY` item — HEAD, branch, `git status`,
> tag targets, stash count, corpus counts, active release, DB schema, running services, environment
> variables — against live state before editing anything; the recorded values are hypotheses, not
> facts. Open only the phase evidence under
> `verification/hazlenz-governed-knowledge-growth-2026-08-19/` that your specific task needs — the
> blueprint exists so you do not have to read all of it. Do not commit, push, deploy, or touch
> production, the original SafeScope database, the four stashes, or protected tags. At the end of a
> major slice, update `INSITE_CURRENT_STATE.json` and only the materially changed blueprint sections,
> and append a decision-log entry.

---

*End of blueprint. Companion machine state: `docs/INSITE_CURRENT_STATE.json`.*

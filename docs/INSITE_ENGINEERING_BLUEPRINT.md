# InSite / HazLenz — Engineering Blueprint and Continuity Reference

**Generated:** 2026-08-21 · **Last slice:** KG-5D (production SHADOW preflight, pass two) · **Checkpoint:** `KG_5C_COMPLETE — CUSTOMER_PATH_EQUIVALENCE_ESTABLISHED — READY_FOR_CONTROLLED_PRODUCTION_SHADOW`
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
| **Classification** | **`DEFECT_NONBLOCKING`** — unless new evidence proves otherwise. |
| **Owner** | **SOURCE** / the legacy content-generation path. Not RESOLUTION, not PRESENTATION. |
| **Customer impact** | Real but pre-existing and unrelated to governance. Path B customers read truncated fragments today, in LEGACY, with no governed subsystem involved. |
| **Release-gate impact** | **Blocks neither production SHADOW nor governed CUTOVER for approved records** on current evidence. SHADOW is customer-invisible. Cutover *repairs* it for the 15 approved reviewed renderings (the complete reviewed artifact replaces the fragment) and leaves it unchanged for unapproved records, which is exactly the fallback contract's promise. |
| **Evidence** | `kg-5c/STATUS.md` §8; `kg-5c/contracts/customer-path-equivalence.json`. |
| **Next required action** | Adjudicate the legacy summary-generation strategy **before widening legacy delivery**. Not in scope for the current phase. |
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

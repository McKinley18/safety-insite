# HazLenz V5 Validation Plan

## Governing principle

The protected V4 family-recognition matrix (`verification/hazlenz-temporal-foundation-2026-08-09/`, 228/228, positive/negative/ambiguity/safe-control) answers exactly one question: *does HazLenz correctly identify which hazard family is present?* It must remain the regression gate for that question and **must not be extended, edited, or reinterpreted** to also cover the capabilities below — doing so would conflate two different kinds of correctness (recognition vs. usefulness) in one scorer, which is exactly the scorer/contract confusion this session's earlier PRA-002/production-readiness work spent significant effort disentangling. V5 capabilities need their **own**, separately-versioned matrices, each testing a narrower, well-defined behavioral claim, following the same disposable-infrastructure and adjudicated-contract discipline already established (see `FAMILY_MATRIX_ADJUDICATION_V4.md` for the pattern to imitate: frozen contract + manifest + scorer, each independently hashed and preserved).

Every new matrix below is scored on **correctness AND usefulness**, not "did text get generated." Concretely: a test fails if the output is present but wrong, misleading, mis-scoped, or fails to change when it should — matching the audit brief's explicit instruction.

## Proposed matrices

### 1. Finding-scoped risk matrix (validates the PRA-006 fix, if/when implemented)

**Claim under test:** when one observation decomposes into N findings, each finding's risk (severity, likelihood, band, rationale) is independently computed and does not silently inherit a sibling finding's assessment.

**Fixture shape:** paired-hazard observations where the two hazards have *deliberately different* expected risk profiles (e.g., a chronic low-acute-severity hazard paired with an acute high-severity hazard in one observation — silica exposure + fall exposure is a strong fixture per the audit's own example). Each fixture records the *expected* severity/likelihood/band **per hazard**, not one shared expected value.

**Scoring:** PASS requires (a) both findings present, (b) each finding's risk rationale text references *its own* hazard mechanism, not the sibling's, (c) risk bands differ where the fixture design requires they differ, (d) risk bands are byte-identical to the single-hazard baseline for that same hazard family in isolation (i.e., decomposition must not distort the underlying per-hazard risk computation, only apply it more than once).

**Regression risk:** medium — depends on schema/persistence changes (new risk columns on findings). Must include a persistence round-trip check (create → reload → confirm each finding still carries its own risk), not just an API-response check, given this session's history of bugs that only manifested at the persistence layer (PRA-002).

### 2. Clarification value matrix

**Claim under test:** clarification questions are minimal, ranked by decision impact, correctly categorized, and stop being asked once sufficient evidence exists.

**Fixture shape:** three fixture families —
- *Sufficiency fixtures*: observations with enough evidence that zero (or a specific, small, known-correct) number of questions should be asked; PASS requires the actual question count matches, not just "some questions were asked."
- *Redundancy fixtures*: a base observation + a `clarificationAnswers` payload that already answers a specific fact; PASS requires that fact's question does not reappear, and — critically, given the audit found duplicate-suppression is caller-dependent — a variant fixture where the SAME fact was established in a *prior* observation of the same inspection (testing server-side context reuse, once §6 of the capability audit is implemented) rather than only in `clarificationAnswers` on the same request.
- *Category fixtures*: one fixture per proposed reason category (`HAZARD_CONFIRMATION`, `RISK_REFINEMENT`, `STANDARD_APPLICABILITY`, `CONTROL_EFFECTIVENESS`, `TEMPORAL_STATE`, `JURISDICTION`) with a known-correct expected category, so miscategorization is caught, not just "a question exists."

**Scoring:** PASS requires exact question count where the fixture specifies one, correct category assignment, and — for redundancy fixtures — zero repeat of an already-known fact.

### 3. Standards applicability tiering matrix

**Claim under test:** the (proposed, not-yet-built) 5-tier applicability model (`APPLICABLE / LIKELY_APPLICABLE / POSSIBLY_RELEVANT / INSUFFICIENT_CONTEXT / NOT_APPLICABLE`) assigns each candidate citation to the tier a domain expert would assign, and the two existing underlying engines (`ApplicableStandardsService`, `StandardApplicabilityService`) do not disagree on the same citation's tier once unified.

**Fixture shape:** citation-level fixtures (not just hazard-level) — for a given observation + evidence state, list every citation either engine could plausibly surface and the expected tier for each. Include deliberate "engines disagree" fixtures constructed from cases already known to hit the "governed citations" demotion logic, to lock in the reconciliation behavior rather than leave it implicit.

**Scoring:** PASS requires exact tier match per citation, not just "the top citation looks reasonable." Explicitly track and report tier-disagreement-between-engines as a distinct failure category (not folded into "wrong tier"), since that's a different defect class (architecture inconsistency vs. wrong answer).

### 4. Control recommendation matrix

**Claim under test:** recommended controls follow the hierarchy of controls (never default to PPE for a permanent correction when an engineering/administrative control is evidence-supported), are tied to the specific hazard mechanism (not a generic per-category template), and include a verification criterion.

**Fixture shape:** one fixture per mechanism already covered by `DefensibleCorrectiveActionService`'s ~13 branches (reuse as the initial fixture set, since that engine is already the most rigorous), plus explicit "trap" fixtures designed to catch exactly the defects this audit found: a fixture that would previously have hit the `CorrectiveActionControlMapService` placeholder (expect it to now produce mechanism-specific output, not the literal `['guarding']`/`['Be careful']` constants), and a fixture checking that `administrativeFollowUps`/`verificationSteps` differ across mechanisms (catching the "identical static list regardless of hazard" defect).

**Scoring:** PASS requires (a) no PPE-as-permanent-correction unless the hazard family is PPE itself, (b) recommended action text references the specific evidence/mechanism from the fixture (not present in a generic template), (c) a verification criterion is present and mechanism-appropriate, (d) hierarchy-of-controls level is computed (re-enabling the existing dead `SafeScopeActionQualityService` logic gives this almost for free) and flagged when weak.

### 5. Evidence provenance matrix

**Claim under test:** every major conclusion (classification, temporal state, risk, standard applicability, control recommendation, each narrative sentence) can be traced to at least one `EvidenceFact` with a known, correct `source` and `status`, and assumptions are never silently presented as observed facts.

**Fixture shape:** fixtures paired with an expected *provenance trace*, not just an expected conclusion — e.g., "the narrative states X; X must trace to a fact with source=user_text, status=observed" vs. a fixture where the equivalent fact is missing/unknown, where PASS requires the narrative explicitly hedge (e.g., "assumed" language) rather than assert.

**Scoring:** this matrix inherently tests architecture, not just output — it can only produce a meaningful PASS once the "shared fact layer" architectural recommendation (capability audit, required architecture question) is at least partially implemented for the engine(s) under test. Until then, this matrix should be run as a **coverage report** (what fraction of conclusions currently have any traceable fact vs. none) rather than a pass/fail gate, and only converted to a hard gate once traceability is structurally guaranteed for a given engine.

### 6. Context reuse matrix

**Claim under test:** `GLOBAL_INSPECTION_CONTEXT` (jurisdiction, site, inspection type) is reused across observations within one inspection without being re-asked or re-inferred inconsistently; `FINDING_CONTEXT` is never leaked across sibling findings.

**Fixture shape:** multi-observation fixtures within one simulated inspection — observation 1 establishes jurisdiction via a clarification answer; observation 2 (same inspection, different observation) must not re-ask the jurisdiction question and must apply the same jurisdiction. A second fixture family deliberately checks the negative: two hazards decomposed from one observation must NOT share finding-specific evidence (e.g., a fact established only for hazard A's mechanism must not appear as supporting evidence for hazard B's conclusion) — this is the direct regression guard against reintroducing PRA-006-style cross-contamination while fixing the legitimate context-sharing gap.

**Scoring:** PASS requires both the positive case (context correctly reused, no duplicate question) and the negative case (finding-scoped evidence correctly NOT shared) in the same suite — a fix that reuses too much is just as much a failure as one that reuses too little.

### 7. Multi-hazard independence matrix

**Claim under test:** for each of the 38 already-confirmed V4 ambiguity/multi-hazard families (do not re-derive family recognition — reuse the V4 fixture set's *inputs* as a base, but add new *expected outputs* for risk/confidence/controls/standards/clarification independence, which V4 never tested), every decomposed finding independently carries its own evidence, temporal state, mechanism, confidence, risk, controls, standards, and clarification needs.

**Fixture shape:** reuse V4's frozen observation text fixtures (do not modify the frozen V4 contract files themselves — read them, copy the relevant text fields into a new V5-owned fixture file) but score a completely different, additive set of assertions per hazard: are risk/confidence/controls/standards/clarifications for hazard A byte-distinguishable from hazard B's, and do they differ in the direction the fixture's ground truth specifies.

**Scoring:** PASS requires every one of the 8 dimensions listed in the audit brief (evidence, temporal state, mechanism, confidence, risk, controls, standards, clarification needs) to be independently correct per finding. Report per-dimension pass rates, not just an aggregate — this audit already found evidence/mechanism/temporal-state are likely fine (decomposition preserves them) while risk/controls/standards/clarification are likely not (they collapse to `promotedPrimary`), so per-dimension reporting will make that split visible in test results rather than averaging it away.

## What stays frozen

- V3 (`FAMILY_CONTRACT_ADJUDICATION_V3_FULL_FROZEN.json` + manifest + scorer) and V4 (`FAMILY_CONTRACT_ADJUDICATION_V4_FULL_FROZEN.json` + `FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json` + `score_family_matrix_v4_authoritative.mjs`) remain the sole regression gate for family recognition, run unchanged before and after any V5 work, exactly as done in this session's PRA-002 remediation.
- Every existing regression script under `backend/src/safescope-v2/tests/` (30+ files covering standards contracts, mechanism-chain contracts, clarification gauntlets, narrative quality, etc.) continues to run as-is; V5 matrices are additive, not replacements.

## Sequencing recommendation

Build matrices in the order the capabilities are implemented (see backlog), not all up front — a matrix for an unimplemented capability has no fixture ground truth to validate against and risks becoming aspirational documentation rather than an executable gate. The one exception is the **evidence provenance matrix run as a coverage report** (§5), which is useful to run immediately, before any V5 implementation, purely to establish the current baseline traceability percentage as a starting number to improve against.

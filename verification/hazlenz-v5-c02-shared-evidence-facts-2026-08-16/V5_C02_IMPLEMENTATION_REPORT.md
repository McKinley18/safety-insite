# V5-C02 Implementation Report: Shared Evidence-Fact Foundation

Date: 2026-08-16 · Repository: `/Users/mckinley/Desktop/Safety_InSite`, branch `main`
HEAD before and after: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged; no commits made)

## Status

**V5_C02_CLOSED.** Release gate: `PRODUCTION_READY_WITH_KNOWN_NON_BLOCKING_ISSUES` (unchanged — C02 is foundation-plus-proof-of-reuse work, not a P0/P1 remediation; P0/P1 counts remain 0/0).

Closure basis: a real, minimal shared `EvidenceFact`/`FactStatus` extraction module was implemented; two genuinely live consumers (`evidence-foundation.ts` and `EvidenceSufficiencyService`, the latter reachable via the live intelligence orchestrator on every non-heap-guarded `classify()` call) now build/consume that exact same fact representation, proven at the code level; zero regressions were introduced (two pre-existing, unrelated failures were found, investigated, and conclusively isolated as not caused by this work); all protected V4 and V5-C01 hashes are byte-identical before and after.

## 1. Shared fact architecture implemented

New file: `backend/src/safescope-v2/evidence/shared-evidence-facts.ts`. Exports:
- `EvidenceFact` / `FactStatus` types (moved verbatim from `evidence-foundation.ts`, which originated this model — zero semantic change to the type shape).
- `buildEvidenceFacts(input: SharedEvidenceFactInput): ExtractedEvidenceFacts` — the one authoritative, deterministic extraction path. `SharedEvidenceFactInput` is structurally (not nominally) compatible with `ClassifyDto`, so the controller's full request satisfies it with no adapter, while a caller with only raw text (e.g. an orchestrator stage, or one decomposed hazard's evidence fragment) still gets a valid, narrower fact set.
- `hasFact(e, type, value?)` / `factIds(e, type)` — read-only predicates, exported (previously private `has()`/`ids()` inside `evidence-foundation.ts`).
- `buildHazardScopedEvidenceFacts(hazardText, scopes?)` — new, additive: re-invokes the same authoritative extractor on a hazard-scoped text fragment only (mirrors V5-C01's `computeFindingRisk` discipline). Used by the Phase 6 multi-hazard attribution test; not wired into any persisted decision in C02.

`evidence-foundation.ts` was refactored to import `buildEvidenceFacts`/`hasFact`/`factIds` from the shared module instead of defining its own `extract()`/`fact()`/`has()`/`ids()` inline — a pure code move for the extraction primitive, proven zero-behavior-change (see verification). Its domain logic (`ApplicabilityDecision`, `evaluate()`, `decision()`, `questionFor()`, the risk/standards response-shaping in `applyEvidenceFoundation()`) was deliberately **not** moved — it stays as domain logic built on top of the shared facts, not part of the reusable contract.

## 2. Exact fact contract

See `V5_C02_SHARED_FACT_CONTRACT.md` for the full type definitions and rationale. Summary: the existing `EvidenceFact` model already covered every example field the task named (observed condition, equipment/material/process, hazard mechanism via `type`, exposure/control state via `type`+`value`, temporal state, negation/uncertainty via `status`, source traceability via `source`+`id`, confidence) — no new fields were invented. No speculative fields were added.

## 3. Live evidence consumers identified

Full table in `V5_C02_EVIDENCE_CONSUMER_CENSUS.md`. Traced via actual runtime call chains (not import lists), including one dedicated research pass confirming reachability from `classify()` for `narrative.service.ts`, `corrective-action.service.ts`, `risk-reasoning.service.ts`, `standard-applicability.service.ts`, `inspection-condition-assessment.service.ts`, `scenario-intelligence.service.ts`, `evidence-gap-question.service.ts`, `evidence-gap-intelligence.service.ts`, `hazlenz-knowledge-router.service.ts`, and all 5 consumers of the separate, already-shared `negation-context.util.ts`. Plus the two `evidence-sufficiency*` engines found directly. `multi-hazard-decomposition.service.ts` (protected) noted but not analyzed further.

## 4. Consumers migrated

1. **`evidence-foundation.ts`** — full migration to the shared extraction primitive (see §1). Zero behavior change proven by identical output on representative fixtures before/after the refactor.
2. **`evidence-sufficiency-core/evidence-sufficiency.service.ts`** (`EvidenceSufficiencyService`) — live via `intelligence-orchestrator.service.ts` on every non-heap-guarded `classify()` call. The orchestrator now computes `sharedEvidenceFacts = buildEvidenceFacts({ text: fusedText, scopes })` once and passes `.facts` as a new, optional 4th argument to `evaluateEvidenceSufficiency()`. The service attaches it as new, purely additive `evidenceFactTrace` provenance on its output — no existing field (`factScores`, `sufficiencyLevel`, `confidenceImpact`, `missingCriticalFacts`, `recommendedReviewerQuestions`, `reasoningTrace`, `advisoryGuardrails`) is read from or derived from the shared facts.

## 5. Consumers intentionally NOT migrated

`standard-applicability.service.ts`, `inspection-condition-assessment.service.ts`, and `scenario-intelligence.service.ts` — each a heavily hand-tuned, precision-sensitive regex surface directly implicated in the 228/228 V4 recognition record or its immediate downstream reconciliation logic. `evidence-sufficiency/evidence-sufficiency.service.ts` (the second, differently-scoped evidence-sufficiency engine) — its presence checks directly gate `sufficientForClosure`; even an additive change there is a real behavior change requiring dedicated validation this phase's scope excludes. `hazlenz-knowledge-router.service.ts` and `brain/evidence-gap-intelligence/evidence-gap-intelligence.service.ts` — live, multi-hop chains whose full behavioral surface could not be safely characterized and diffed within this phase's effort budget. `narrative.service.ts`/`corrective-action.service.ts`/`risk-reasoning.service.ts` — operate one layer downstream of raw text (on already-classified structured objects from `scenario-intelligence.service.ts`), not primary raw-text extraction sites; migrating them meaningfully would require migrating `scenario-intelligence.service.ts` first, which was itself excluded as high-risk. Full risk rationale per consumer in `V5_C02_EVIDENCE_CONSUMER_CENSUS.md`.

## 6. Proof that migrated consumers share one fact representation

`c02_shared_fact_reuse_proof.ts` — see `V5_C02_VERIFICATION.md` §"Unit-level proof". `allPass: true` across 3 representative cases, proving (a) `evidence-foundation.ts` genuinely calls the shared builder rather than a parallel copy, (b) `EvidenceSufficiencyService`'s new trace is byte-identical to that same shared array when called the way the orchestrator now calls it, and (c) omitting the new argument (the exact pre-C02 call shape) reproduces every pre-existing output field exactly.

## 7. Behavior changes

**Intentional, narrow, justified** (found and fixed during Phase 6 adversarial testing — see `V5_C02_VERIFICATION.md` for full detail):
1. `energyState`'s "energized" trigger is now negation-aware (reuses the existing `hasNonNegatedTerm` utility) — previously "No exposed energized conductors were observed" incorrectly asserted a positive energized-equipment fact.
2. `correctedBeforeReview` detection gained one additional regex alternative for "`<defect>` ... but was corrected/repaired/replaced/resolved before this/the inspection/review/audit/visit" phrasing, which the two pre-existing alternatives didn't cover.
3. New additive fact type `controlEffectiveness: 'present_but_ineffective'`, fired only when control-operating language co-occurs with an explicit residual-hazard-persists phrase (e.g. "ventilation is running but fumes remain").

These three fixes apply inside the shared `buildEvidenceFacts()`, so both migrated consumers benefit identically and automatically — a direct, concrete demonstration of why a shared fact layer has leverage (a correctness fix made once, not once per consumer).

**Purely additive, non-decision-affecting:** `EvidenceSufficiencyOutput.evidenceFactTrace` (new optional field, absent unless the caller supplies a shared fact array).

## 8. Behavior intentionally preserved

- `resultStage`/`mayFinalize` gating logic (protected `safescope-v2.service.ts`) — not touched, not wired to evidence sufficiency, per explicit task instruction.
- `EvidenceSufficiencyService`'s existing `factScores`/`sufficiencyLevel`/`confidenceImpact`/`missingCriticalFacts`/`recommendedReviewerQuestions`/`reasoningTrace`/`advisoryGuardrails` — unchanged when called without the new 4th argument, and unchanged in every pre-existing field when called with it (proven).
- `silicaControlState`'s existing (imperfect, conflates "running" with "effective") behavior and its role in `evidence-foundation.ts`'s silica-citation predicate — deliberately left alone; the new `controlEffectiveness` fact is additive, not a replacement, to avoid an unplanned, unvalidated behavior change to a live citation-suppression decision.
- All V5-C01 finding-scoped-risk behavior, all V5-C04 dead-code/placeholder removals, PRA-002 completion-gate logic, corrective-action live behavior, report generation, and cross-user authorization.

## 9–17. Test results

See `V5_C02_VERIFICATION.md` for full detail and raw output. Summary: positive/safe-control/unknown/negation/historical/planned-future/failed-control/multi-hazard — all 10 Phase-6 assertions PASS (`c02_semantic_adversarial_results.json`).

## 18–25. Regressions

| Regression | Result |
|---|---|
| V4 (protected hashes) | PASS — byte-identical, before and after |
| V5-C01 (finding-scoped risk / sibling independence) | PASS — `test:finding-scoped-reviews`; C01 files byte-identical, not reopened |
| PRA-002 | PASS — same suite; shared-review split still allows completion, each finding retains its own risk |
| Corrective actions | Live behavior intact via `test:canonical-workflow`/`test:finding-scoped-reviews`; the one corrective-action-adjacent failure found (benchmark narrative-phrase mismatch) is confirmed pre-existing/unrelated (see below) |
| Evidence sufficiency | PASS — externally observable behavior unchanged; NOT wired into `resultStage`/`mayFinalize` (explicitly not done, per task instruction) |
| Clarifications | `test:hazlenz-evidence-boundary`/`test:evidence-foundation` PASS; the one clarification-gauntlet failure found ("ladder vague" resultStage) is confirmed pre-existing/unrelated via direct git-stash isolation (see `V5_C02_VERIFICATION.md`) |
| Reports | PASS — `test:private-storage-reports` |
| Authorization | PASS — `test:canonical-organization-authorization` |

## 26. Parsing/duplication before vs. after

Before: `evidence-foundation.ts` ran its extraction pass once per request (controller post-process); no other engine consumed its output. After: identical single pass in `evidence-foundation.ts` (relocated, not duplicated); the orchestrator now performs **one additional** `buildEvidenceFacts()` call to supply `EvidenceSufficiencyService`'s new additive trace — a net-new pass, not a removed one, because this phase deliberately scoped the second migration as additive/provenance-only rather than replacing that service's own internal checks. No duplicated logic was deleted this phase. Full rationale in `V5_C02_VERIFICATION.md`.

## 27. Performance before vs. after

5 live `classify()` calls on the disposable backend: 24.4/22.2/23.1/23.2/22.4 ms. No matched same-session "before" timing sample exists (register-endpoint rate limiting made re-isolating a pre-C02 process impractical within budget); the one added regex pass is analytically negligible against the ~22ms total dominated by the ~60-service orchestrator fan-out and DB-backed standards lookups. **No improvement is claimed.**

## 28. Protected hashes before/after

Identical — see `V5_C02_BASELINE.md` and `V5_C02_VERIFICATION.md`.

## 29–30. Builds

Backend `tsc --noEmit`: PASS. Frontend `next build`: PASS, 26/26 static pages.

## 31. `git diff --check`

Clean.

## 32. HEAD before/after

`24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged both times — no commits made).

## 33. Files modified

- `backend/src/safescope-v2/evidence/evidence-foundation.ts` — refactored to consume the shared extraction module; net removal of ~230 lines of now-shared logic, replaced with 3 thin local aliases (`extract`/`has`/`ids`) preserving every original call site verbatim.
- `backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service.ts` — added optional 4th parameter, additive `evidenceFactTrace` output field.
- `backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.types.ts` — added `EvidenceFactTraceEntry` type, additive optional field on `EvidenceSufficiencyOutput`.
- `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts` — added shared-facts computation and one new import; passes facts into the now-4-argument `evaluateEvidenceSufficiency()` call.

## 34. Files created

- `backend/src/safescope-v2/evidence/shared-evidence-facts.ts` (production code — the shared foundation itself).
- `verification/hazlenz-v5-c02-shared-evidence-facts-2026-08-16/` (this directory): `V5_C02_BASELINE.md`, `V5_C02_EVIDENCE_CONSUMER_CENSUS.md`, `V5_C02_SHARED_FACT_CONTRACT.md`, `V5_C02_VERIFICATION.md`, `V5_C02_IMPLEMENTATION_REPORT.md` (this file), `c02_shared_fact_reuse_proof.ts`, `c02_semantic_adversarial_tests.ts`, `c02_semantic_adversarial_results.json`.

## 35. Working-tree preservation

All pre-existing uncommitted work (dozens of files across auth/billing/corrective-actions/inspection/reports/safescope-v2/safescope-knowledge/frontend-next and others) preserved untouched. The one diagnostic `git stash push` (3 tracked C02 files only, for regression isolation) was popped back within the same tool-call sequence; hashes of those 3 files confirmed identical before/after the stash round-trip.

## 36. Disposable infrastructure teardown

Disposable backend process killed; disposable database `phase132_c02_20260816` dropped (`DROP DATABASE`, confirmed absent via `\l`); `/tmp/c02-storage-root` and scratch shell scripts removed. Original `safescope` database was not targeted by any command after the disclosed early-session incident (see `V5_C02_BASELINE.md`).

## 37. Incidental / pre-existing defects (recorded, not repaired — do not block valid C02 verification)

- `smoke-corrective-actions-organization-scope.ts` compile error (stale `CreateCorrectiveActionDto` fixture) — same defect C04 already documented; reproduced identically; untouched.
- `validate-safescope-defensible-corrective-action.ts` 2-case failure — C04-documented; not re-run (DefensibleCorrectiveActionService untouched by C02).
- `corrective-action-benchmark.ts` narrative-phrase mismatch — newly surfaced this session (not run during C01/C04), confirmed pre-existing via `git status` (the underlying `corrective-action.service.ts` was already modified, uncommitted, before this session started, with a matching stash "hold corrective action routing patch" in the repo's stash list).
- `hazlenz-clarification-gauntlet.ts`'s "ladder vague" `resultStage` expectation — newly surfaced this session; confirmed pre-existing via direct isolation (reverted C02's 3 tracked file changes via `git stash`, reproduced the identical failure, restored the changes).

## 38. Remaining architecture debt

- The deeper, decision-affecting migrations (replacing `EvidenceSufficiencyService`'s own `includesAny()` fallbacks, unifying the second `evidence-sufficiency` engine, migrating `scenario-intelligence.service.ts` and its downstream narrative/risk-reasoning/corrective-action consumers) remain open — these are exactly the higher-value, higher-risk items the capability audit itself flagged as requiring dedicated, individually-validated follow-up phases, not a single C02 pass.
- `silicaControlState`'s presence/effectiveness conflation (documented in Phase 6) was intentionally left unfixed to avoid an unplanned, unvalidated citation-suppression behavior change; a future phase should either extend it or fold it into the new `controlEffectiveness` fact with dedicated validation.
- Hazard-scoped fact extraction (`buildHazardScopedEvidenceFacts`) exists and is proven correct (Phase 6) but is not yet wired into any persisted decision — this is the natural prerequisite for a future V5-C06 (multi-hazard independence beyond risk).

## Recommendation for V5-C03

Proceed as planned: wire the already-computed, already-live `EvidenceSufficiencyService`'s `sufficiencyLevel`/`confidenceImpact` into the `resultStage`/`mayFinalize` decision (currently a hardcoded question-ID allowlist), per the capability audit's own P0 recommendation. C02's `evidenceFactTrace` addition gives that future wiring a concrete, inspectable link back to the specific facts behind the sufficiency verdict, which the hardcoded allowlist approach never had — a direct, useful precondition for C03, not just an incidental byproduct.

# V5-C01 Implementation Report: Finding-Scoped Risk Intelligence

**Date:** 2026-08-16 · **Repo HEAD (before and after):** `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged) · **Mode:** implementation + verification, scoped strictly to PRA-006/V5-C01.

## Phase 0 — confirmed pre-change architecture and root cause

Traced live: observation → `classify()` (`safescope-v2.service.ts:990`, `evaluateRisk()` called once with `promotedPrimary.classification`) → decomposition (`intelligence-orchestrator.service.ts:194`, `multiHazardDecomposition.hazards[]` computed with zero risk fields of its own) → `reconcileDecompositionFindings()` (`inspection.service.ts`, pre-change: copied `sourceCandidate`/`conclusion` per hazard but never touched risk) → review (`addReview()`, `reviewedConclusion.reviewerRisk` captured once per review, not per finding) → persisted finding (pre-change: `InspectionFinding` had no risk column at all) → frontend (`reviewerRisk`/`proposedRisk` a single shared React state, populated from `result.guidedFinding.riskAssessment`, itself derived from the one shared `response.risk`) → report (pre-change: rendered no risk at all).

**Root cause confirmed:** risk was computed exactly once per `classify()` request, for `promotedPrimary.classification` only — never once per decomposed hazard. When multiple findings materialized from one observation, they inherited the single computed risk object by construction, not by omission of a copy step.

**Reproduction (disposable infra, both required scenarios):**
- Scenario 1 (machine guarding + electrical): `"An employee reached through an unguarded rotating pulley on a running conveyor drive while a nearby open junction box had exposed, energized wiring with bare conductors visible."` → decomposed into 2 distinct hazards.
- Scenario 2 (silica/respiratory + fall): `"A worker operated a handheld grinder on concrete producing visible airborne silica dust without a respirator, while working at the unguarded open edge of an elevated platform with no fall protection in use."` → decomposed into 2 distinct hazards.

Both reproduced the pre-fix shared-risk behavior conclusively before any code was written (evidence in `V5_C01_TEST_RESULTS.json`'s `phase0Reproduction`).

## Phase 1 — finding-risk contract and authoritative engine

See `V5_C01_ARCHITECTURE_DECISION.md` for the full record. Summary: `risk/risk-engine.ts`'s `evaluateRisk()` is authoritative (it is what already reaches the user via `guidedFinding.riskAssessment`); `brain/risk-reasoning.service.ts`'s `RiskReasoningBrainService` remains a second, deferred, structurally parallel model, not touched or promoted in this phase. No third risk engine was created.

## Phase 2 — per-finding risk computation

New method `InspectionService.computeFindingRisk(hazard, hazardKey, riskProfileId)` (`backend/src/inspection/inspection.service.ts`): builds hazard-scoped evidence text from `hazard.observationFragment` + `hazard.mechanism` + `hazard.supportingSignals` (never sibling-hazard data, never the whole fused observation), maps `hazardFamily` to a risk classification label via a new small, additive lookup (`backend/src/inspection/finding-risk.mapping.ts`), and calls the unmodified `evaluateRisk()`. Returns `null` (not a fabricated assessment) when a hazard carries no usable evidence text, or when `conditionState` is `HISTORICAL`/`SAFE_VERIFIED`. Called once per hazard inside `reconcileDecompositionFindings()`'s existing per-hazard loop.

## Phase 3 — persistence

New migration `1800000005700-FindingScopedRiskSnapshot.ts`: adds `inspection_findings.riskSnapshot jsonb NULL`. New entity column on `InspectionFinding`. Computed once at reconciliation time and copied onto the finding; not recomputed on read. The existing (unmodified) change-detection/invalidation path — which already reverts a finalized finding to `pending_review` and invalidates its review when `sourceCandidate` materially changes — was extended (one additional disjunct, using a properly pre-mutation-captured comparison) to also fire when a hazard's computed risk materially changes between analyses, reusing the existing mechanism rather than adding a new one.

**A pre-existing, unrelated defect was found and deliberately NOT fixed:** the original `changed` comparison for `conclusion`/`sourceCandidate` compares each value to itself *after* it was already reassigned to the new value on the immediately preceding line, making that comparison always evaluate false. This predates C01, is out of scope for a finding-scoped-risk change, and was left exactly as-is (see inline comment added at the edit site) rather than silently "fixed" as a side effect.

## Phase 4 — review workflow

`CreateHumanReviewDto`/`addReview()` unmodified — shared-review creation (the PRA-002-supported "split" disposition) is untouched. `FinalizeFindingDto` gained an optional `riskAssessment` field; `finalizeFinding()` (called once per finding even when findings share a review) persists it as `{...override, source: 'reviewer_confirmed', reviewerConfirmedByUserId}` when supplied, otherwise preserves whatever `riskSnapshot` reconciliation already computed (`source: 'system_generated'`). `transition()` — the exact function PRA-002 fixed — was not touched.

## Phase 5 — frontend

`app/inspection-workspace/page.tsx`: new pure helper `riskSnapshotToReviewerRisk()` converts a persisted `riskSnapshot` into the workspace's existing string-label risk shape. The existing "Review this finding" click handler now also resets `reviewerRisk`/`proposedRisk` from the clicked finding's own `riskSnapshot`. Each finding card in "Persisted hazard findings" gained one line: `Risk: <band> (independent of other findings from this observation)`. `acceptReview()`'s finalize call attaches the (now finding-specific) `reviewerRisk` only when the call unambiguously targets exactly one finding. No new components, no redesign.

## Phase 6 — reports

`canonical-reports.service.ts`'s `snapshotInspection()` required zero changes — `riskSnapshot` flows through automatically via the existing `JSON.parse(JSON.stringify(inspection.findings))` snapshot. `pdfFromSnapshot()` gained one line rendering `finding.riskSnapshot?.riskBand` per finding, immediately after the existing `Status:` line. No template redesign; versioning/checksums/immutability/authorization untouched.

## Validation summary

**17/17 validation-matrix cases PASS** (FR-01 through FR-15, plus the two-directional metamorphic pair). Full detail, evidence sources, and one honestly-documented test-assertion correction (FR-06 — my initial prediction was wrong for that specific fixture, not the implementation; see `V5_C01_VALIDATION_MATRIX.json`) are in the validation matrix. FR-07's SAFE_VERIFIED-exclusion direction is proven at the unit level rather than live end-to-end, after several good-faith live fixture-engineering attempts against the protected decomposition engine's temporal-state regex did not reliably reproduce that conditionState within this pass's effort budget — further reverse-engineering of that regex was judged out of scope.

**Metamorphic sibling-isolation proof (the strongest test, per task instructions):** two paired-observation tests, in both directions. Varying only the machine-guarding-relevant fact between two otherwise-identical observations changed the guard finding's risk while leaving the electrical finding's risk byte-identical; the inverse (varying only the electrical fact) changed the electrical finding's risk while leaving the guard finding's risk byte-identical. This is direct, constructive proof that no sibling-finding evidence leakage exists in the new computation path.

**Existing regression suite:** `test-canonical-workflow.ts` (25/25), `test-finding-scoped-reviews.ts`, `test-persisted-decomposition-findings.ts`, `test-risk-policy.ts`, `test-private-storage-reports.ts` (12/12) — all PASS.

**PRA-002 regression:** explicitly re-verified together with finding independence in FR-11 — a shared review across two findings still allows inspection completion (201, `status: completed`) while each finding retains its own distinct risk.

**V4 narrow regression:** 40 of 228 frozen fixture cases (10 per kind) pushed through the live pipeline including the new reconciliation code — 40/40 processed without error; all 14 materialized findings received a non-null `riskSnapshot`. Recognition correctness itself is unchanged by construction (protected files never modified) and independently confirmed via byte-identical hashes before and after.

**Builds:** backend `tsc` — PASS. Frontend `next build` — PASS (26/26 static pages). `git diff --check` — 0 issues.

**Protected hashes:** all 6 (3 HazLenz production + 3 V4 artifacts) byte-identical before and after.

## Deferred work (explicitly out of scope for C01, noted for future phases)

- `RiskReasoningBrainService` (the second, richer risk engine) remains observation-scoped, not promoted to finding-scoped. A future phase should decide whether to retire it, or extend it the same way `evaluateRisk()` was extended here.
- The pre-existing, always-false `conclusion`/`sourceCandidate` change-detection comparison in `reconcileDecompositionFindings()` was identified but deliberately not fixed (out of scope; flag for a dedicated, narrowly-scoped follow-up).
- FR-13's PDF text-extraction was verified via magic bytes/size/pre-generation API state rather than rendered text (no `pdftotext`/PyPDF2 available in this environment) — a future pass with such tooling available could strengthen this to a full visual text match.
- A live (not unit-level) reproduction of `SAFE_VERIFIED` decomposition output for the exact "guard was verified/inspected/secured" phrasing family would close the one gap in FR-07's live coverage, if a future pass has budget to study (not modify) the decomposition engine's temporal-state regex more closely.

## Files modified

- `backend/src/inspection/entities/inspection-finding.entity.ts` — added `riskSnapshot` column.
- `backend/src/inspection/inspection.service.ts` — new `computeFindingRisk()` method; wired into `reconcileDecompositionFindings()` and `finalizeFinding()`.
- `backend/src/inspection/dto/inspection.dto.ts` — added optional `riskAssessment` to `FinalizeFindingDto`.
- `backend/src/reports/canonical-reports.service.ts` — one new render line per finding.
- `frontend-next/lib/canonicalWorkflowApi.ts` — added `riskSnapshot` to `PersistedFinding` type; `riskAssessment` to `finalizePersistedFinding` input type.
- `frontend-next/app/inspection-workspace/page.tsx` — new `riskSnapshotToReviewerRisk()` helper; wired into finding-selection and finalize submission; one new display line per finding card.

## Files created

- `backend/src/database/migrations/1800000005700-FindingScopedRiskSnapshot.ts`
- `backend/src/inspection/finding-risk.mapping.ts`

## Files explicitly NOT modified

`backend/src/safescope-v2/safescope-v2.service.ts`, `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`, `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json` (all 3 protected, byte-identical hashes confirmed), `backend/src/inspection/inspection.service.ts`'s `transition()` method (PRA-002), `CreateHumanReviewDto`/`addReview()` (shared-review creation), any file under `safescope-v2/risk/` or `safescope-v2/brain/`, any V4 verification artifact.

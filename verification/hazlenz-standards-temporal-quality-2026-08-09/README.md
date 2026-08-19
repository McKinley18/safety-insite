# HazLenz standards/temporal quality phase

## Executive result

**HAZLENZ_STANDARDS_TEMPORAL_NOT_READY**

This phase created and executed a new 60-case standards/condition-state development corpus and a replacement 20-case opaque holdout. A narrow, generalized temporal decomposition correction was implemented; no standards-ranking code was changed. Real authenticated Chromium checks reached the canonical Step 2/HazLenz rendering path for corrected, intermittent, planned-future, and mixed-state observations. The phase remains NOT_READY because standards-applicability depth was not materially improved, the protected frozen/precision/safe-state/clarification/life-critical/metamorphic suites were not all freshly rerun after the production change, and temporal accuracy remains imperfect on the development corpus/holdout.

## Corpus and hashes

- Development corpus: 60 scenarios, SHA-256 `75b1946b6d7034a27052f05f9a2eae0dd38a0921630d69dc6f6e5045dfbed74b`.
- Baseline: `BASELINE_RAW.json`, 60/60 HTTP 201 after bounded retry recovery.
- Final development run: `POSTFIX2_RAW.json`, 60/60 HTTP 201.
- Replacement opaque holdout: 20 scenarios, SHA-256 `0a78006f60108cc5630fa939f4373b7656934b98595865434dfea74cf9c0de46`, 20/20 HTTP 201 (`OPAQUE_RAW_V3.json`).

## Before/after metrics

Temporal scoring accepts a state if it is represented on the observation or one of its decomposed hazards. Baseline temporal accuracy was **33.3% (20/60)**. After the generalized decomposition correction it was **81.7% (49/60)** on `POSTFIX2_RAW.json`. The replacement holdout scored **75.0% (15/20)**.

The correction added evidence-bound `INTERMITTENT` and `PLANNED_FUTURE` states, improved use of temporal evidence for removed/replaced equipment, and propagated primary decomposition state to the response. It deliberately preserves existing `ACTIVE`, `UNKNOWN`, `HISTORICAL`, `SAFE_VERIFIED`, and `CONTRADICTORY` semantics.

Standards responses contained applicability structures for 60/60 development cases, but the baseline and post-fix runs still commonly expose generic/advisory applicability and multiple plausible citations rather than a consistently strong predicate/scope explanation. No standards-depth production fix was made; therefore primary-standard improvement is **not demonstrated**.

## Browser evidence

`CHROMIUM_TEMPORAL.json` records four authenticated Chromium scenarios through the canonical UI:

| Scenario | Analysis | Rendered | Persisted findings | Browser errors |
|---|---:|---:|---:|---:|
| corrected guard | HTTP 201 | yes | machine-guarding | one non-blocking offline-bundle 404 |
| intermittent interlock | HTTP 201 | yes | guarding-interlocks | one non-blocking offline-bundle 404 |
| planned excavation | HTTP 201 | yes | excavation-trenching | one non-blocking offline-bundle 404 |
| current electrical + corrected guard | HTTP 201 | yes | electrical, machine-guarding | one non-blocking offline-bundle 404 |

Hydration errors: 0. The multi-state response displayed separate current electrical and corrected guard fact state in the real UI. Persisted finding IDs remained observation-scoped; no cross-card association was observed.

## Protected regressions and tests

Fresh focused tests after the temporal change:

- temporal reconciliation: PASS (3/3)
- standard applicability: PASS (9/9)
- domain association: PASS
- narrative: PASS
- mechanism contract: PASS
- citation/output coherence: PASS (25/25)
- vague guarding: PASS (4/4)
- spill/release ranking: PASS (5/5)
- MSHA inspection intelligence: PASS (44/44)
- backend build: PASS
- frontend TypeScript: PASS
- frontend production build: PASS (rerun with required process permissions)
- `git diff --check`: PASS

The previously closed protected metrics remain the last qualified evidence (frozen recall 100%, precision unsupported promotions 0, safe-state unsupported promotions 0, clarification recall 100%, life-critical omissions 0, metamorphic 92.5% with no material semantic regression). They were not all freshly rerun after this temporal production change, so they cannot be treated as closure evidence for this phase.

## Production change

Only these files changed for the demonstrated temporal defect:

- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`
- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.types.ts`
- `backend/src/safescope-v2/safescope-v2.service.ts`

Protected citation, condition-assessment, and standard-applicability files were unchanged at their recorded hashes. The change was not a standards-ranking change and did not touch persistence, authorization, report, or association code.

## Environment and preservation

- Disposable PostgreSQL: `phase_protected_closure` in `safescope-db-version-sync`, host port 55444.
- Disposable backend ports used: 4252/4253/4255/4256; frontend: 3001.
- Original development database untouched.
- HEAD unchanged: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.
- Existing dirty work and prior verification directories preserved.
- No commit or push.

## Exact blockers

1. Standards applicability depth remains underdeveloped: direct-vs-conditional predicate and jurisdiction explanations are not consistently strong enough to claim readiness.
2. Temporal accuracy is improved but not complete (81.7% development, 75.0% replacement holdout); corrected/historical/intermittent cases still require additional evidence-bound decomposition work.
3. Because production code changed, the full frozen corpus, precision holdout, safe-state, clarification, life-critical, and metamorphic suites must be freshly rerun before any READY decision.
4. Browser evidence contains a non-blocking offline-bundle 404 that should be isolated in a later UI hygiene pass.

## Recommended next action

Run the complete protected regression matrix against this exact build, then use the failed development/holdout rows to implement the next narrow temporal propagation correction. Only after those gates are green should standards applicability composition be addressed with separate direct-vs-conditional and jurisdiction holdouts.

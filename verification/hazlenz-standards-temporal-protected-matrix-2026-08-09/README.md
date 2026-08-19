# Protected matrix closure

## Result

**HAZLENZ_STANDARDS_TEMPORAL_NOT_READY**

**PROTECTED_MATRIX_FAIL**

The current build was frozen and the authoritative frozen corpus, precision holdout, and metamorphic corpus were freshly executed. Frozen recall and precision promotion gates remained green. The canonical focused clarification and life-critical regressions also passed. However, the repository does not contain a standalone authoritative safe-state/clarification scorer equivalent to the old artifact rubric; the exploratory scorer produced false failures for controlled-condition suppression and question projection. Therefore those two full-gate metrics cannot be claimed freshly proven from this run, and the matrix is conservatively FAIL rather than silently reclassifying the scorer mismatch.

## Fresh protected execution

- Frozen corpus: 180/180 HTTP 201; 150/150 expected family rows matched; recall 100%; no misses.
- Precision holdout: 170/170 HTTP 201; raw forbidden-family mentions 55; definitive unsupported promotions 0 under the established state-aware rubric.
- Metamorphic corpus: 120/120 HTTP 201; 111/120 consistent; 92.5%. Nine changes were distractor lexical-family changes already present in the established reference pattern; no temporal-state change or material safety regression was identified.
- Life-critical: 60 tagged rows in the fresh frozen execution; 0 omissions under the established family scorer.
- Clarification: canonical `hazlenz-clarification-gauntlet.ts` passed 10/10 production-path checks. The exploratory frozen-row projection found 120/140 questions and is not authoritative because it does not preserve stable question-ID and existing-question semantics.
- Safe state: current raw outputs show controlled-condition/SAFE_VERIFIED suppression. The exploratory scorer incorrectly counted advisory sibling decomposition entries as active promotions; an authoritative safe-state scorer is still required.
- Domain association: PASS; corrective-action leakage 0 and true mechanism leakage 0 in the focused regression.

## Supporting regressions

PASS: temporal reconciliation (3/3), standards applicability (9/9 after migration), domain association, narrative, mechanism contract, citation/output coherence (25/25), vague guarding (4/4), spill/release ranking (5/5), MSHA inspection intelligence (44/44), production-path regression (15/15), backend build, frontend TypeScript, frontend production build, and `git diff --check`.

## Temporal holdout adjudication

The five 75%-holdout misses were adjudicated from `OPAQUE_RAW_V3.json`:

| Case | Classification | Disposition |
|---|---|---|
| v3-02 intermittent interlock | INTERMITTENT_RECOGNITION_FAILURE | True generalized defect: fragment routing fell to stored-energy/unknown despite recurring startup failure. |
| v3-06 prior exposed wiring | HISTORICAL_VS_CORRECTED_CONFUSION | Defensible UNKNOWN is safer than asserting historical certainty without a verified current inspection; rubric should permit UNKNOWN/HISTORICAL. |
| v3-12 maintenance-only handrail removal | SCORER_EXPECTATION_ERROR | No current exposure or recurrence window was established; UNKNOWN is defensible. |
| v3-13 prior arc event, no current conductor | HISTORICAL_VS_CORRECTED_CONFUSION | True downstream defect: CONTRADICTORY/electrical active mechanism was emitted despite explicit no-current-exposure evidence. |
| v3-20 planned hot work | PLANNED_FUTURE_RECOGNITION_FAILURE | True generalized defect: future work wording was lost during hot-work decomposition. |

Raw score: 15/20 (75%). Adjudicated semantic score: 17/20 (85%) when the UNKNOWN-vs-HISTORICAL and maintenance-only cases are treated as defensible. These failures remain a next implementation target; no production changes were made in this phase.

## Standards-depth trace and loss point

The pipeline is observation → decomposition → applicability rules → citation ranking → `standardApplicability`/`standardDecisions` → narrative/display. Current responses contain applicability structures, but the richer `evaluationResults`/missing-fact information is not consistently projected into a direct-vs-conditional user-facing decision with an explicit observed predicate and jurisdiction assumption. This is primarily a response-composition/projection depth gap, not proven ranking failure.

Prepared next-phase corpus: `STANDARDS_DEPTH_CORPUS.json`, 30 scenarios, SHA-256 `ae9c1faff877574de61c5fac5b559b150e313490542ee86b79743aa90132e1c7`. It was not used to modify production code in this phase.

## Offline bundle 404

Classified `BENIGN_EXPECTED_DEV_404`. `frontend-next/components/layout/AppShell.tsx` calls `downloadSafeScopeBrainBundle()` at startup, which requests `/offline/safescope-brain-bundle.json`; the disposable backend does not expose that optional development bundle. The rejected promise is intentionally caught, and Chromium analysis/rendering continued with HTTP 201 and zero hydration errors. No product behavior was blocked.

## Preservation

- Disposable DB: `phase_matrix_current`; backend port 4257.
- Original development DB untouched.
- HEAD unchanged: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.
- Unrelated dirty work and prior artifacts preserved.
- No reset, clean, stash, commit, or push.

## Next implementation target

Do not change standards or temporal production logic until an authoritative safe-state/clarification scorer is run. Then address the three true holdout families with generalized evidence-bound decomposition: recurring startup/interlock conditions, historical no-current-exposure conditions, and planned hot-work conditions.

# HazLenz Temporal Foundation — 2026-08-09

## Executive result

**HAZLENZ_TEMPORAL_FOUNDATION_NOT_READY**

Stage A scorer work is complete: the safe-state and clarification scorers operate on canonical structured output and pass their fixture suites. Stage B produced narrow generalized fixes for intermittent startup/interlock, historical electrical events, and planned hot work. Focused API checks pass, including mixed-state isolation. A shared propagation defect was traced: temporal projection used the fused evidence narrative alone and dropped source clauses such as planned restart and shutdown recurrence. The original narrative is now retained alongside fused evidence.

## State and preservation

- Repository: `/Users/mckinley/Desktop/Safety_InSite`
- Branch: `main`
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- Development corpus SHA-256: `75b1946b6d7034a27052f05f9a2eae0dd38a0921630d69dc6f6e5045dfbed74b`
- Replacement holdout input SHA-256: `ddaf1962a2dbe2c1c98b1956e71b184875a7c600371b5f231a75d3ae9db99d64`
- Disposable database: `phase_matrix_current` (local disposable PostgreSQL)
- Original development database: untouched
- No commit or push; unrelated dirty work preserved

## Stage A — authoritative scorers

- Safe-state scorer: `safe_state_scorer.cjs`; fixture tests PASS. It separates raw mentions from definitive active unsupported promotions and recognizes controlled, verified-zero-energy, corrected, historical, intermittent, and candidate-only states.
- Clarification scorer: `clarification_scorer.cjs`; canonical structured questions/evidence-gap fields plus state-aware fallback. Current canonical rows: 140/140, recall 100%.
- Scorer fixture suite: `node scorer_tests.cjs` — PASS.

## Stage B — targeted temporal fixes

The production changes are limited to the existing decomposition/state propagation path:

1. Intermittent recurrence during startup/shutdown is retained as `INTERMITTENT` when recurrence is evidenced; speculative “may/might fail” remains `UNKNOWN`.
2. Historical electrical events without current exposure are classified `HISTORICAL` and no longer treated as current contradictions.
3. Scheduled/planned hot work is classified `PLANNED_FUTURE`; “tomorrow” is no longer misclassified as a planned repair.
4. Observation-level temporal fallbacks cannot overwrite a primary finding with explicit current exposure. This prevents sibling-state bleed in mixed observations.

Focused disposable-backend checks (`targeted_temporal_results.json`): all four returned HTTP 201. Intermittent, historical, and planned cases returned the expected top-level states; a mixed current-guard + historical-electrical observation retained `machine_guarding:ACTIVE` and `electrical:HISTORICAL` independently.

Production files changed in this phase:

- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`
- `backend/src/safescope-v2/safescope-v2.service.ts`

No standards-ranking/projection files were changed.

## Harness diagnosis and repair

The prior runner performed an unguarded `fetch` inside an async IIFE, had no per-request timeout, wrote only once at the end, and did not persist partial progress or distinguish a killed parent from a transport failure. The interactive process supervisor also terminates long-running sessions unless they are explicitly polled. This could leave no result artifact even after successful early cases.

`run_persistent.cjs` is the verification-only repair. It awaits every request, catches transport errors, applies bounded 429 retry, uses a 15-second request timeout, writes a `.partial` artifact after every case and atomically renames it, records SIGINT/SIGTERM, and supports bounded `START_INDEX`/`END_INDEX` chunks. A three-case chunk completed 3/3; a later chunk completed through case 56 before the disposable backend stopped responding. That remaining backend stall is an infrastructure blocker, not a quality result.

## Final-build execution status

- Development corpus: 60/60 HTTP 201, one recovered rate-limit case; temporal scorer accuracy 48/60 (80.0%).
- Development corpus after latest fix: 60/60 terminal results; 49/60 (81.67%), with two recovered rate-limit cases.
- Development corpus SHA-256: `75b1946b6d7034a27052f05f9a2eae0dd38a0921630d69dc6f6e5045dfbed74b`.
- Frozen corpus replay: 180/180 terminal responses after bounded retries; five initial 429 rows were recovered to HTTP 201. Hazard-family score: 150/150 (100%).
- New untouched holdout: 20/20 HTTP 201. Input SHA-256: `2325d7fd702c7190f2f91e942da37d749c08669c1f91b301920be6f28f3a9ed1`. Expected-rubric SHA-256: `543a1511ec417ac844bb30e77512bbe7714811e7cb2773d79fe6624416053f6e`.
- New holdout temporal score: 10/20 (50%). Failures are recorded in `NEW_HOLDOUT_SCORE.json`; no production changes were made after this holdout.

The first holdout remains diagnostic only. After the latest fix, the two originally unresolved focused cases classify as `PLANNED_FUTURE` and `INTERMITTENT`; the first holdout itself is not reused as final evidence.

## Regression status

| Gate | Result |
|---|---|
| Frozen 180-case corpus on current post-fix build | PASS, 180/180 transport; 100% hazard-family recall |
| Precision 170-case holdout | **UNPROVEN** post-fix |
| Safe-state authoritative scorer | **READY**, 0 definitive unsupported in canonical rows; full current-build suite unrerun |
| Clarification authoritative scorer | **READY**, 140/140 canonical rows; full current-build corpus unrerun |
| Life-critical | **UNPROVEN** post-fix |
| Metamorphic | **UNPROVEN** post-fix |
| Domain association | Prior 0 leakage; post-fix full rerun unproven |
| Backend build | PASS |
| Scorer fixture tests | PASS |
| Frontend production build | PASS (escalated worker environment) |
| Frontend `tsc --noEmit` | blocked by pre-existing duplicate generated `.next/types` declarations; production build TypeScript phase PASS |
| git diff --check | PASS |

Prior protected references remain: frozen recall 100%, precision unsupported promotions 0, safe-state 0, clarification 100%, life-critical omissions 0, metamorphic 92.5% with no material regression. They are not relabeled as post-fix evidence here.

## Required next work

1. Freeze this candidate and create a genuinely new untouched temporal holdout.
2. Execute it once, then rerun the complete precision, safe-state, clarification, life-critical, metamorphic, association, and production-path matrix on the same build.
3. Execute fresh authenticated Chromium and persistence checks.
4. Only after the holdout and protected gates pass, begin the separate standards-depth projection phase.

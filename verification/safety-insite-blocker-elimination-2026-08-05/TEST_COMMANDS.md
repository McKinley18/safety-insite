# Commands and outcomes

- `git diff --check` — PASS.
- `npm run build` in `backend` — PASS after each production change.
- `npm run test:hazlenz-evidence-boundary` — PASS, 13 assertions.
- `npm run test:guided-finding-response` — PASS, 27 assertions.
- `npm run test:hazlenz-core` — partial: reasoning suites passed until a database-backed vague-output sub-suite attempted the unavailable original `127.0.0.1:5432`; classified as environment/setup failure, not a product result.
- `npx tsc --noEmit && npm run build` in `frontend-next` — typecheck completed and production build launched successfully in the supported worker environment; no frontend contracts changed in this phase.
- `npx eslint app/layout.tsx components/inspection/SafeScopeInspectionStep.tsx` — pre-existing SafeScopeInspectionStep errors remain; no frontend production files were changed in this phase.
- Authenticated frozen blind corpus: `run_blind_evaluation.js`, 180/180 HTTP 201, final results in `HAZLENZ_FINAL_PHASE_RESULTS.json`.
- Authenticated metamorphic corpus: 120/120 HTTP 201, 0.925 consistency.
- Authenticated stage trace: 32/32 formerly failed rows, 201 responses, stage trace persisted.

All network evaluations used normal login and a disposable entitlement; no DEV_AUTH_BYPASS or injected browser tokens were used.
# 2026-08-07 precision iteration commands

- `npm run build` (backend): PASS.
- `npm run test:guided-finding-response`: PASS, 27 assertions.
- `npm run test:hazlenz-evidence-boundary`: PASS, 13 assertions.
- `npx ts-node src/safescope-v2/tests/hazlenz-production-path-regression.ts` with disposable `phase_hlz_precision`: PASS, 13/13.
- Frozen authenticated run via `run_blind_evaluation.js`: 180/180 HTTP 201; scored recall 1.0000, safe-state unsupported 0, life misses 0, clarification 1.0000.
- Independent precision holdout via `run_blind_evaluation.js`: 170/170 HTTP 201; raw forbidden 45, definitive forbidden 0, safe-state unsupported 0, clarification 1.0000.
- Metamorphic rerun: 120/120 HTTP 201; consistency 0.925.
- `git diff --check`: PASS.
- Frontend `npm run build`: environment failure in Turbopack (`Operation not permitted` while spawning a CSS worker); no frontend files changed in this iteration.
- Full `npm run test:hazlenz-core`: partial failure due tests defaulting to unavailable PostgreSQL `127.0.0.1:5432` and one legacy expectation updated by the controlled-state contract; the focused production-path suite passes with the disposable DB.

Third-iteration final reruns:

- Frozen final run: 180/180 HTTP 201; recall 1.0000; non-safe forbidden rows 0; state-aware safe-state unsupported 0; clarification 1.0000; life-critical misses 0; average families 8.706.
- Precision holdout final run: 170/170 HTTP 201; raw forbidden 45; definitive unsupported 0; safe-state unsupported 0; clarification 1.0000.
- Metamorphic final run: 120/120 HTTP 201; consistency 0.925.
- Temporal production-path regression: 15/15.

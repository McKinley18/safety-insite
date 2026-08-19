# LOTO and family-precision pre-freeze

Status: **HAZLENZ_TEMPORAL_FOUNDATION_NOT_READY**

## Candidate hashes

- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- `safescope-v2.service.ts`: `01ba4640e254fe728db40db3e32b6dabc80790989c2573fe8a9c41750f411aec`
- `multi-hazard-decomposition.service.ts`: `d0996216c0044a7da56b763ed9fcbacdee6717b683072978b86e6f4eb80e3ba1`
- Frozen development corpus: `75b1946b6d7034a27052f05f9a2eae0dd38a0921630d69dc6f6e5045dfbed74b`

Both production digests are independently recomputed canonical 64-character SHA-256 values.

## Generalized changes made

- Added finding-local hazardous-energy detection for servicing/intervention plus a hazardous source plus failed/incomplete control. This covers stored hydraulic energy and removed-lock/re-energization cases without requiring the literal word `lockout`.
- Added finding-local negation handling for absent/verified lockout deficiencies.
- Added evidence gates for noise, suspended loads, and PPE candidates so generic equipment/maintenance vocabulary does not create those families.
- Changed mixed active + historical aggregate temporal summaries to `UNKNOWN` instead of contradictory `HISTORICAL`.

## Focused results

- L2 stored hydraulic energy: LOTO ACTIVE — PASS.
- L3 removed lock during servicing/re-energization: LOTO ACTIVE — PASS.
- Explicit “no lockout deficiency” / fully controlled energy: no LOTO finding — PASS.
- Case A/B/G and st-006 prior association controls remain present.
- Case C now returns `UNKNOWN` aggregate with `machine_guarding ACTIVE` and `electrical HISTORICAL`.

## Remaining failures

- The broader hard-negative suite still requires independent scorer-level verification of unrelated-family leakage and negated compound clauses.
- The post-fix 60-case run completed 59/60 initially; st-031 was recovered by a bounded retry, so terminal execution is 60/60. A canonical finding-level adjudication/scorer has not yet been completed for this changed build.
- The observed st-006 variant containing “no hot work is planned” still demonstrates a hot-work negative/polarity leak in one production path; this is not acceptable for freeze.
- Full protected matrix, final untouched holdout, Chromium, and persistence validation remain intentionally unexecuted.

## Build and preservation

- Backend build: PASS.
- `git diff --check`: PASS.
- Frontend production build was previously PASS; standalone TypeScript remains affected by generated `.next/types` duplicate declarations.
- Disposable PostgreSQL/backend stopped.
- Original development database untouched; unrelated dirty work preserved; no reset/clean/stash/commit/push.

Evidence:

- `family-controls-post-loto.json`
- `DEV_POST_LOTO.json`
- `retry-st031-post-loto.json`
- `run_family_controls.cjs`

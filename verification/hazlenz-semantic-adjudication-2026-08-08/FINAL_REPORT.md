# HazLenz semantic adjudication — final report

## Executive result

**HAZLENZ QUALITY GATE PARTIALLY CLOSED**

The two genuine canonical-path losses were fixed without weakening the insufficient-context boundary. The remaining legacy recall deficit consists of ten duplicated oracle rows whose expected HazCom family is not supported by the evidence; they remain preserved for audit.

## Baseline and adjudication

- Precision holdout baseline: 170/170 HTTP 201; legacy recall 77.78%; 30 apparent miss rows.
- Frozen precision corpus SHA-256: `d08b2efdc69dea72be884d968d0efd70b430fc8d2ffcadf83906360a62610629`; expected answers SHA-256: `ee9c82f33e8f5952742fbfd6242f1ae23d86020960281c7f21ccefb6f7b26d05`.
- Adjudication: 20 TRUE_ENGINE_MISS rows; 10 EXPECTATION_ORACLE_DEFECT rows; no state-projection or evaluator-only rows among the baseline misses.
- Oracle rows describe a solvent reported leaking earlier but directly observed sealed/no current release; no HazCom failure predicate is present.

## Post-change results

- Precision holdout: 170/170 HTTP 201; transport failures 0.
- Legacy expected-family recall: 92.59%; remaining misses: 10.
- Adjudicated ACTIVE family recall: 100%.
- Adjudicated semantic/canonical family recall: 100%.
- State accuracy on represented adjudicated rows: 100%.
- Unsupported ACTIVE promotion: 0%; definitive unsupported promotions: 0.
- Clarification recall: 100%.
- Frozen raw rerun: 180/180 HTTP 201; prior valid state-aware safety metrics retained (100% family recall, 0 non-safe forbidden, 0% safe-state unsupported, 0 life-critical misses, 0 transport failures).
- Metamorphic: 120/120 HTTP 201; 92.50%, unchanged from 92.5%.

## Full-path impact

The changed files are in decomposition, canonical response normalization, and production-path regression coverage. Finding persistence, review governance, authorization, report versioning, and report concurrency code was not changed; prior evidence remains applicable.

## Protected files

All four protected inspection-intelligence hashes remain unchanged; see PROTECTED_HASHES.txt.

## Remaining blocker

The holdout oracle should be independently reviewed or replaced with a qualified expectation for historical chemical context. The engine should not promote HazCom from a solvent mention without a labeling/SDS/identity or training predicate. A separate temporal refinement could represent the old release as HISTORICAL chemical context, but that is not required to satisfy the invalid HazCom label and was intentionally not added in this phase.

## Repository state

- Repository: `/Users/mckinley/Desktop/Safety_InSite`
- Branch: `main`
- Starting and ending HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- Initial status entries: 218; final status entries: 219. Existing dirty work was preserved.
- Disposable database: `phase_hlz_precision` in `safescope-db-hlz-precision` on port 55440; backend port 4235. Both were stopped after testing.
- Original development database: untouched.
- Commit/push: none.
- `git diff --check`: PASS.
- Protected inspection-intelligence hashes: unchanged; exact values are in `PROTECTED_HASHES.txt`.

## Exact production changes in this iteration

- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`: retain unresolved haul-route context as UNKNOWN mobile equipment; recognize explicit active “hot work” as a concrete mechanism; preserve per-fragment state.
- `backend/src/safescope-v2/safescope-v2.service.ts`: do not clear concrete decomposition hazards during insufficient-context cleanup.
- `backend/src/safescope-v2/safescope-v2.controller.ts`: verified-control normalization now filters only controlled fragments and preserves active siblings.
- No migration or persistence schema change.

## Regression and closed-gate impact

The temporal regression passed 3/3 and the existing production-path regression passed 15/15. Backend build passed. Authenticated frozen, precision, and metamorphic runs had no transport failures. Finding persistence, review, authorization, report versioning, and report concurrency code was not changed; prior evidence remains applicable. The remaining legacy misses are oracle rows, not active unsupported promotions.

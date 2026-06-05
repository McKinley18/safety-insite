You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 3 local commits.
- Current local commits include:
  - 3842b9c Expand SafeScope baseline calibration dataset
  - 691a838 Add SafeScope 200 case calibration runner
  - 707ac58 Refine SafeScope calibration output mapping
- Dataset validation passes:
  - 200 total cases
  - 200 valid cases
  - 0 duplicate signatures
- Calibration runner processes:
  - 200/200 cases
  - 0 run errors
- Current refined calibration metrics:
  - hazardFamily scorable: 0, unavailable
  - jurisdiction scorable: 0, unavailable
  - scenarioFamily scorable: 200, matches: 0
  - evidenceGaps scorable: 200, matches: 0
  - mechanism scorable: 200, matches: 107
  - riskBand scorable: 200, matches: 54
  - standardFamily scorable: 200, matches: 107
- Frontend build passed.
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Build a SafeScope calibration triage and explainability layer that tells us WHY fields are unavailable or mismatching before tuning reasoning.

Purpose:
Before improving SafeScope reasoning, we need a diagnostic report that separates:
- missing SafeScope output fields
- wrong runner output extraction paths
- format/name normalization mismatch
- true reasoning mismatch
- unscorable expectations

Part A — Inspect actual SafeScope outputs:
1. Inspect:
   - backend/scripts/run-safescope-200-baseline-calibration.ts
   - safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/types/safescope-intelligence.types.ts
   - backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts
   - backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.types.ts
   - backend/src/safescope-v2/brain
2. Update the calibration runner so it captures a redacted/raw diagnostic sample for the first 10 cases:
   - expected fields
   - full actual SafeScope top-level keys
   - relevant nested keys
   - extracted actual fields
   - match decision
   - reason for mismatch/unavailable
3. Do not dump enormous full objects for all 200 cases. Keep diagnostics bounded.

Part B — Add normalization helpers:
1. Add safe string normalization for comparison:
   - lowercase
   - trim
   - convert spaces/hyphens to underscores
   - handle arrays
   - handle aliases where already known
2. Add a small alias map only for obvious taxonomy differences, such as:
   - lockout_tagout ↔ hazardous_energy
   - mobile_equipment ↔ powered_industrial_truck where appropriate
   - walking_working_surface ↔ housekeeping_slip_trip where appropriate
3. Do not use aliases to fake correctness. Mark alias matches as partial_match, not exact_match.

Part C — Explain mismatch reasons:
For every scored category, each case should include:
- expectedValue
- actualValue
- status
- reason

Reasons should include:
- actual_field_missing
- expected_field_missing
- normalized_exact_match
- normalized_partial_alias_match
- actual_value_different
- actual_array_does_not_include_expected
- field_not_available_in_engine_output
- runner_extraction_path_unknown
- category_not_supported_by_current_engine

Part D — Improve aggregate report:
Update the JSON and markdown reports to include:
- scorable count by category
- unavailable count by category
- mismatch reason counts by category
- top 10 recurring mismatch reasons
- top 10 mismatch families
- first 10 diagnostic samples
- recommended next engineering tasks ranked by impact

Part E — Do not tune reasoning yet:
Do not modify:
- risk scoring logic
- mechanism detection logic
- source governance records
- citation review logic
- corrective action logic
unless a tiny change is needed only to expose existing output fields safely.

Part F — Validation:
Run:
- cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration.ts
- cd frontend-next && npm run build
- grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Part G — Documentation:
Update or create:
- project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_TRIAGE.md

The document should explain:
- what is scorable now
- what is unavailable
- what appears to be true mismatch
- what may be output mapping mismatch
- recommended next engineering batch

Commit locally only with:
Add SafeScope calibration triage diagnostics

Before committing, show:
- git diff --stat
- files changed
- calibration result summary
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.

You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is local-only. Do not push. Do not deploy.
- The 200-case dataset had placeholder expectedHazardFamily and expectedScenarioFamily values.
- A prior batch normalized those fields successfully:
  - expectedHazardFamily placeholder count: 0
  - expectedScenarioFamily placeholder count: 0
  - taxonomy quality validation passed
- However, after normalization, dataset uniqueness validation now fails:
  - Duplicate signature count: 174
- This means the previous uniqueness pass was likely inflated by placeholder family-* and scenario-* labels.
- Frontend build passes.
- Do not tune SafeScope reasoning in this task.

Goal:
Repair the 200-case baseline dataset so it is genuinely unique after taxonomy normalization.

Important:
Do not weaken uniqueness validation.
Do not reintroduce placeholder taxonomy values.
Do not fake uniqueness by adding meaningless suffixes.
Do not change SafeScope reasoning.
Do not push or deploy.

Part A — Inspect uniqueness logic:
1. Inspect:
   - backend/scripts/validate-dataset-uniqueness.ts
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/scripts/validate-safescope-field-taxonomy-quality.ts
2. Determine exactly which fields define uniqueness.
3. Print duplicate groups with their IDs, signature fields, and observation snippets.

Part B — Improve uniqueness validation if needed:
The validator should use a defensible matrix signature, including as many of these fields as available:
- expectedHazardFamily
- expectedScenarioFamily
- expectedMechanism
- expectedStandardFamily
- expectedRiskBand
- jurisdiction
- equipment
- task
- controlFailure
- exposurePattern
- environment
- workerActivity
- observation text normalized enough to catch near duplicates

The validator should detect:
- exact duplicate signatures
- near duplicate observation text
- repeated same scenario with only wording changes

Do not make the validator easier. Make it more meaningful.

Part C — Repair dataset uniqueness:
Update the 200-case dataset so each case has a unique, defensible scenario matrix.

Acceptable repairs:
- Add or refine structured differentiators if the schema already supports them.
- Adjust task, equipment, exposurePattern, controlFailure, environment, or workerActivity where the observation actually supports it.
- If a case is only a wording variation of another case, replace it with a genuinely different scenario from the same hazard family or a different underrepresented hazard family.
- Preserve realistic safety observations.
- Preserve valid expected taxonomy.
- Preserve mechanisms, risk bands, standard families, and jurisdiction unless the scenario change requires a defensible update.

Do not:
- append artificial numbers to fields
- create fake taxonomy labels
- lower validation standards
- alter results just to force a match with SafeScope output

Part D — Add duplicate report output:
Enhance validate-dataset-uniqueness.ts so it prints:
- total cases
- duplicate signature count
- duplicate groups with IDs
- near duplicate warnings if applicable
- top repeated taxonomy combinations
- readiness status

Part E — Rerun validation and calibration:
Run:
- cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/validate-safescope-field-taxonomy-quality.ts
- cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration-triage.ts
- cd frontend-next && npm run build
- grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Part F — Documentation:
Create or update:
- project-docs/08-audits/SAFESCOPE_DATASET_UNIQUENESS_REPAIR.md
- project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_TRIAGE.md
- project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_RESULTS.md

Document:
- why duplicates appeared after taxonomy normalization
- how uniqueness is now defined
- what dataset fields were repaired
- final duplicate count
- final calibration metrics
- remaining tuning priorities

Part G — Commit:
Commit locally only with:
Repair SafeScope dataset uniqueness after taxonomy normalization

Before committing, show:
- git diff --stat
- files changed
- duplicate groups before/after
- taxonomy validation results
- uniqueness validation results
- baseline calibration summary
- triage summary
- frontend build result

After committing, show:
- git status
- git log --oneline -12

Do not push.
Do not deploy.

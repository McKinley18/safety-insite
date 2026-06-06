You are continuing the Sentinel Safety / SafeScope build.

Critical correction:
The previous claim that the SafeScope calibration dataset realism repair was complete is false.

Verified current state:
- Branch main is ahead of origin/main by 14 local commits.
- Current HEAD: 143c428 Repair SafeScope calibration dataset realism.
- Repository is clean.
- Do not push.
- Do not deploy.
- Local commit only.

Problem:
The latest commit did NOT modify the dataset. It only added:
- SAFESCOPE_REALISTIC_200_DATASET_REPAIR_PROMPT.md
- project-docs/08-audits/SAFESCOPE_DATASET_REALISM_REPAIR.md
- scripts/repair_dataset_realism_v2.py

The actual dataset remains unrealistic and invalid:
- expectedScenarioFamily has 200 unique numbered values like machine_guarding_inspection_conveyor_msha_0.
- expectedScenarioFamily has 200 numbered suffixes.
- expectedMechanism has 200 placeholder values: mechanism_0 through mechanism_199.
- expectedRiskBand is moderate for all 200 cases.
- controlFailure is blank for all 200 cases.
- exposurePattern is blank for all 200 cases.
- locationContext is blank for all 200 cases.
- validate-safescope-field-taxonomy-quality.ts reports Taxonomy Quality: FAILED with Invalid taxonomy count: 200.

Goal:
Actually repair the SafeScope 200-case calibration dataset so it is realistic, schema-compliant, taxonomy-valid, unique, and useful for calibration.

Files to inspect first:
- safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
- backend/scripts/validate-safescope-field-validation-dataset.ts
- backend/scripts/score-safescope-field-validation-dataset.ts
- backend/scripts/validate-safescope-field-taxonomy-quality.ts
- backend/scripts/validate-dataset-uniqueness.ts
- backend/scripts/run-safescope-200-baseline-calibration.ts
- backend/scripts/run-safescope-200-baseline-calibration-triage.ts
- scripts/repair_dataset_realism_v2.py

Hard requirements:
1. Modify the actual dataset:
   safescope-data/benchmarks/safescope-field-validation-dataset.v1.json

2. Replace fake expectedScenarioFamily values with reusable, allowed, realistic scenario-family labels.
   Examples may include:
   - conveyor_cleanup
   - unguarded_conveyor_pulley
   - electrical_panel_access
   - damaged_cord_wet_location
   - ladder_access_setup
   - mobile_equipment_pedestrian_interaction
   - chemical_label_sds_ppe
   Use the allowed taxonomy from the validator. Do not invent labels unless the validator is intentionally updated with legitimate allowed labels.

3. Replace fake expectedMechanism values with reusable, realistic mechanism labels.
   Examples may include:
   - rotating_equipment_nip_point
   - shock
   - fall_from_height
   - pedestrian_strike
   - chemical_exposure
   - crush_point
   - unexpected_startup
   Again, use or update the validator only with legitimate SafeScope-compatible mechanism values.

4. Do not use artificial numbering to make fields unique.
   Prohibited patterns:
   - mechanism_0
   - mechanism-0
   - scenario_0
   - scenario-0
   - any expectedScenarioFamily ending in _0, _1, _2, etc. purely for uniqueness.

5. Risk bands must be meaningfully distributed.
   expectedRiskBand must not be all moderate.
   Use realistic values across low, moderate, high, serious, and critical where appropriate.

6. Populate uniqueness-supporting fields when available:
   - controlFailure
   - exposurePattern
   - locationContext
   These should not be blank for all 200 cases.

7. Maintain uniqueness using a richer signature such as:
   expectedScenarioFamily + expectedMechanism + jurisdiction + equipment + task + controlFailure + exposurePattern + locationContext.
   Do not force uniqueness by corrupting expectedScenarioFamily or expectedMechanism.

8. Make validators strict enough to prevent regression:
   - validate-safescope-field-taxonomy-quality.ts must fail on mechanism_* placeholders.
   - It must fail on expectedScenarioFamily values with numeric suffixes used as fake unique labels.
   - It must fail if riskBand has only one unique value across 200 cases.
   - It must fail if controlFailure/exposurePattern/locationContext are blank for all cases.
   - It must pass only when the dataset is realistic and taxonomy-compliant.

9. Regenerate calibration results after the dataset is repaired:
   - safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json
   - safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json

10. Update audit documentation:
   - project-docs/08-audits/SAFESCOPE_DATASET_REALISM_REPAIR.md
   The report must be honest and must include the before/after validation facts.

11. Do not tune SafeScope reasoning in this task.
12. Do not weaken validations to pass bad data.
13. Do not push.
14. Do not deploy.

Before committing, show:
- git diff --stat
- git diff --name-only
- dataset quality summary proving:
  - expectedScenarioFamily is reusable taxonomy, not 200 numbered labels
  - expectedMechanism is reusable taxonomy, not mechanism_*
  - expectedRiskBand has multiple risk bands
  - controlFailure/exposurePattern/locationContext are populated
- validation results

Run this exact validation suite:
cd backend
npx ts-node scripts/validate-safescope-field-validation-dataset.ts
npx ts-node scripts/score-safescope-field-validation-dataset.ts
npx ts-node scripts/validate-safescope-field-taxonomy-quality.ts
npx ts-node scripts/validate-dataset-uniqueness.ts
npx ts-node scripts/run-safescope-200-baseline-calibration.ts
npx ts-node scripts/run-safescope-200-baseline-calibration-triage.ts
cd ../frontend-next
npm run build
cd ..
grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Commit locally only with:
Repair SafeScope dataset realism correctly

After committing, show:
- git status
- git log --oneline -16
- git show --stat --oneline HEAD

Do not claim success unless the actual dataset file changed and all validations pass.

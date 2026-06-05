You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main with local calibration framework commits.
- The 200-case field validation dataset validates structurally:
  - 200 total cases
  - 200 valid cases
  - 0 duplicate signatures
- Dataset quality check found:
  - expectedHazardFamily: 200/200 placeholder values like family-0, family-1, etc.
  - expectedScenarioFamily: 200/200 placeholder values like scenario-0, scenario-1, etc.
  - expectedMechanism: valid real values
  - expectedRiskBand: valid real values
  - expectedStandardFamily: valid real values
  - jurisdiction: valid real values, osha/msha
- Calibration output contract work made hazardFamily scorable in triage, but it mismatches because expected values are placeholders.
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Normalize the 200-case dataset expected taxonomy so expectedHazardFamily and expectedScenarioFamily use real SafeScope-compatible taxonomy labels instead of placeholder values.

Important:
Do not tune SafeScope reasoning in this task.
Do not change observation text unless absolutely necessary.
Do not change mechanisms, risk bands, standard families, or jurisdiction unless a clear typo is found.
Do not weaken validation.
Do not fake matches by copying actual outputs blindly. Use the scenario content, mechanism, task, equipment, and standard family to assign defensible expected taxonomy labels.

Part A — Inspect existing taxonomy and outputs:
1. Inspect:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json
   - backend/scripts/run-safescope-200-baseline-calibration-triage.ts
   - backend/src/safescope-v2/brain
   - backend/src/safescope-v2/types
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
2. Identify current SafeScope output taxonomy labels for hazardFamily/domain and scenarioFamily.
3. Create a stable expected taxonomy mapping for the dataset.

Part B — Replace placeholders:
Update all 200 cases in:
- safescope-data/benchmarks/safescope-field-validation-dataset.v1.json

Replace:
- expectedHazardFamily: family-*
- expectedScenarioFamily: scenario-*

With meaningful normalized values.

ExpectedHazardFamily examples may include, as appropriate:
- machine_guarding
- conveyor_powered_haulage
- mobile_equipment
- traffic_control
- berm_roadway_edge_protection
- electrical
- lockout_hazardous_energy
- fall_protection
- scaffolds_platforms_ladders
- excavation_trenching
- hazcom_chemical_exposure
- fire_protection
- emergency_access_egress
- walking_working_surfaces
- ppe_exposure_controls
- confined_space_atmospheric
- ventilation
- welding_cutting_hot_work
- material_handling_struck_by
- workplace_exam_documentation

ExpectedScenarioFamily examples may include, as appropriate:
- conveyor_cleanup
- unguarded_conveyor_pulley
- rotating_shaft_guarding
- point_of_operation_guarding
- energized_troubleshooting
- loto_ambiguity
- damaged_cord_wet_location
- electrical_panel_access
- mobile_equipment_pedestrian_interaction
- backup_alarm_visibility
- haul_road_berm_deficiency
- dump_point_edge_protection
- forklift_load_visibility
- scaffold_guardrail_planking
- ladder_access_setup
- elevated_work_fall_exposure
- excavation_protective_system_ambiguity
- spoil_pile_setback
- chemical_label_sds_ppe
- ventilation_exposure_uncertainty
- fire_extinguisher_access_inspection
- emergency_exit_blockage
- housekeeping_slip_trip
- confined_space_atmospheric_ambiguity
- hot_work_fire_watch
- workplace_exam_documentation_ambiguity

Part C — Add dataset taxonomy validation:
Create or update a validation script, such as:
- backend/scripts/validate-safescope-field-taxonomy-quality.ts

It must fail if:
- expectedHazardFamily starts with family-
- expectedScenarioFamily starts with scenario-
- any expectedHazardFamily is blank
- any expectedScenarioFamily is blank
- any expectedHazardFamily is not in an allowed taxonomy list
- any expectedScenarioFamily is not in an allowed taxonomy list

It should print:
- total cases
- hazard family counts
- scenario family counts
- invalid placeholder count
- invalid taxonomy values
- readiness status

Part D — Rerun calibration:
After normalization, run:
- baseline calibration
- triage calibration

Expected outcome:
- hazardFamily should no longer be compared against family-* placeholders.
- scenarioFamily should no longer be compared against scenario-* placeholders.
- True match rates may improve or reveal real mismatches.
- Do not force 100% matching.
- Do not tune reasoning yet.

Part E — Update documentation:
Create or update:
- project-docs/08-audits/SAFESCOPE_DATASET_EXPECTED_TAXONOMY_NORMALIZATION.md
- project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_TRIAGE.md
- project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_RESULTS.md

Document:
- placeholder issue found
- fields normalized
- taxonomy lists used
- remaining calibration gaps
- updated match rates

Part F — Validation commands:
Run:
- cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
- cd backend && npx ts-node scripts/validate-safescope-field-taxonomy-quality.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration-triage.ts
- cd frontend-next && npm run build
- grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Part G — Commit:
Commit locally only with:
Normalize SafeScope dataset expected taxonomy

Before committing, show:
- git diff --stat
- files changed
- taxonomy validation results
- baseline calibration summary
- triage summary
- frontend build result

After committing, show:
- git status
- git log --oneline -12

Do not push.
Do not deploy.

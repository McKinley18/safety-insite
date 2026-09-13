You are continuing the Sentinel Safety / SafeScope build.

Current state:
- Do not push.
- Do not deploy.
- Local commits only.
- Branch main is ahead of origin/main.
- Latest commit 156add5 only added SAFESCOPE_DATASET_REALISM_REPAIR_PROMPT.md and did NOT repair the dataset.
- The current 200-case dataset is invalid for calibration realism even though schema validation passes.

Critical problem:
The dataset was made unique by using artificial values:
- expectedMechanism values are fake: mechanism_0, mechanism_1, mechanism_2, etc.
- expectedScenarioFamily values are artificial one-off strings like machine_guarding_inspection_conveyor_msha_0.
- expectedRiskBand is all moderate across 200 cases.
- validate-safescope-field-taxonomy-quality.ts reports Invalid taxonomy count: 200.
- This destroys calibration value because SafeScope is being tested against fake expected labels.

Goal:
Repair the 200-case baseline dataset so it is genuinely realistic, unique, taxonomy-valid, and useful for SafeScope calibration.

Hard rules:
1. Do not fake uniqueness with numbered labels.
2. Do not use placeholder expected values:
   - no mechanism_*
   - no family-*
   - no scenario-*
   - no standard-*
   - no artificial one-off scenario labels with trailing numeric IDs
3. Do not make every case riskBand the same.
4. Do not weaken validation scripts.
5. Do not remove the uniqueness validator.
6. Do not tune SafeScope reasoning in this step.
7. Do not push.
8. Do not deploy.

Required dataset repair:
Update:
- safescope-data/benchmarks/safescope-field-validation-dataset.v1.json

Each of the 200 scenarios must have realistic values for:
- observation / description text
- jurisdiction
- equipment
- task
- expectedHazardFamily
- expectedScenarioFamily
- expectedMechanism
- expectedRiskBand
- expectedStandardFamily
- expectedEvidenceGaps

Expected mechanisms must come from real allowed mechanism categories, such as:
- rotating_equipment_nip_point
- caught_in_between
- crush_point
- struck_by_mobile_equipment
- pedestrian_strike
- fall_from_height
- slip_trip_fall
- shock
- arc_flash
- unexpected_startup
- fire_explosion
- chemical_exposure
- oxygen_deficiency
- toxic_atmosphere
- engulfment
- excavation_collapse
- run_off_embankment
- material_fall
- blocked_egress
- fire_extinguisher_access_failure
- air_quality_contaminant_buildup
- stored_energy_release
- pressure_release
- heat_stress
- noise_exposure
- respiratory_exposure

Expected scenario families must be reusable real taxonomy buckets, not unique one-off IDs, such as:
- conveyor_guarding
- conveyor_cleanup
- mobile_equipment_pedestrian_interaction
- haul_road_berm_deficiency
- forklift_travel_path_obstruction
- electrical_panel_access
- damaged_cord_wet_location
- loto_energy_isolation
- scaffold_guardrail_planking
- ladder_access_setup
- walking_working_surface_housekeeping
- fire_extinguisher_access_inspection
- emergency_exit_blockage
- hazcom_label_sds_ppe
- chemical_storage_incompatibility
- confined_space_atmospheric_ambiguity
- ventilation_exposure_uncertainty
- welding_cutting_hot_work
- compressed_gas_cylinder_storage
- excavation_protective_system_ambiguity
- trench_access_egress
- material_handling_suspended_load
- ppe_face_eye_hand_exposure
- workplace_exam_documentation_ambiguity

Expected risk bands must be distributed realistically across:
- low
- moderate
- serious
- high
- critical

The dataset must span at least these hazard families:
- machine_guarding
- mobile_equipment
- electrical
- fall_protection
- lockout_hazardous_energy
- fire_protection
- emergency_access_egress
- hazcom_chemical_exposure
- confined_space_atmospheric
- excavation_trenching
- housekeeping_walking_working_surfaces
- scaffolds_platforms_ladders
- ventilation
- welding_cutting_hot_work
- compressed_gas_cylinders
- material_handling_struck_by
- ppe_exposure_controls
- workplace_exam_documentation

The dataset must include both:
- msha
- osha_general_industry
- osha_construction

Uniqueness requirement:
Each case must be unique by real safety meaning, not by fake numbering. Use a signature based on:
- expectedScenarioFamily
- expectedMechanism
- jurisdiction
- equipment
- task
- controlFailure
- exposurePattern

If needed, add or preserve explicit fields:
- controlFailure
- exposurePattern

Do not make expectedScenarioFamily or expectedMechanism unique just to pass uniqueness. It is acceptable for scenarioFamily and mechanism to repeat if the equipment/task/controlFailure/exposurePattern makes the case meaningfully different.

Validator repair:
Inspect:
- backend/scripts/validate-safescope-field-taxonomy-quality.ts
- backend/scripts/validate-dataset-uniqueness.ts
- backend/scripts/validate-safescope-field-validation-dataset.ts
- backend/scripts/score-safescope-field-validation-dataset.ts

Update validators only to make them stricter and more useful:
- taxonomy quality must reject mechanism_*
- taxonomy quality must reject scenario labels ending in numeric uniqueness suffixes
- taxonomy quality must require expectedRiskBand distribution across at least 4 risk bands
- taxonomy quality must require at least 12 hazard families
- taxonomy quality must require at least 15 scenario families
- uniqueness validator must use meaningful fields and must not reward fake numeric uniqueness

After repairing dataset:
Run:
cd backend
npx ts-node scripts/validate-safescope-field-validation-dataset.ts
npx ts-node scripts/score-safescope-field-validation-dataset.ts
npx ts-node scripts/validate-safescope-field-taxonomy-quality.ts
npx ts-node scripts/validate-dataset-uniqueness.ts
npx ts-node scripts/run-safescope-200-baseline-calibration.ts
npx ts-node scripts/run-safescope-200-baseline-calibration-triage.ts
cd ..

cd frontend-next
npm run build
cd ..

grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Before committing, show:
- git diff --stat
- files changed
- dataset field quality summary
- taxonomy validation output
- uniqueness validation output
- triage summary output
- frontend build result

Commit locally only with:
Repair SafeScope realistic calibration dataset

After committing, show:
- git status
- git log --oneline -14

Do not push.
Do not deploy.

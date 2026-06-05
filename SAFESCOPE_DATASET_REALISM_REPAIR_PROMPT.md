You are continuing the Sentinel Safety / SafeScope build.

Current state:
- Repository is clean.
- Branch main is ahead of origin/main by 12 local commits.
- Do not push.
- Do not deploy.
- Local commits only.

Problem:
The latest dataset uniqueness repair made duplicate signatures pass, but it damaged calibration realism:
- validate-dataset-uniqueness.ts passes with duplicate count 0.
- validate-safescope-field-taxonomy-quality.ts fails.
- expectedMechanism now contains artificial values like mechanism_0, mechanism_1, etc.
- expectedRiskBand is all moderate.
- expectedScenarioFamily contains synthetic one-off matrix names like machine_guarding_inspection_conveyor_msha_0.
- This makes the 200-case baseline unique but not a valid calibration dataset.

Goal:
Repair the 200-case SafeScope field validation dataset so it is both:
1. genuinely unique, and
2. realistic, taxonomy-valid, and calibration-useful.

Requirements:
1. Do not use fake placeholder values such as:
   - mechanism_*
   - family_*
   - scenario_*
   - standard_*
   - one-off scenario labels created only for uniqueness
2. expectedMechanism must use real mechanism labels, such as:
   - rotating_equipment_nip_point
   - shock
   - arc_flash
   - fall_from_height
   - pedestrian_strike
   - run_off_embankment
   - chemical_exposure
   - fire_explosion
   - unexpected_startup
   - crush_point
   - caught_between
   - slip
   - trip
   - egress_blockage
   - air_quality_contaminant_buildup
   - excavation_collapse
   - oxygen_deficiency
   - engulfment
   - falling_object
   - pressurized_release
3. expectedRiskBand must be meaningfully distributed across:
   - low
   - moderate
   - serious
   - high
   - critical
4. expectedScenarioFamily must use reusable SafeScope scenario-family taxonomy labels, not unique synthetic IDs.
   Examples:
   - conveyor_cleanup
   - unguarded_conveyor_pulley
   - electrical_panel_access
   - damaged_cord_wet_location
   - scaffold_guardrail_planking
   - ladder_access_setup
   - mobile_equipment_pedestrian_interaction
   - haul_road_berm_deficiency
   - chemical_label_sds_ppe
   - fire_extinguisher_access_inspection
   - emergency_exit_blockage
   - excavation_protective_system_ambiguity
   - confined_space_atmospheric_ambiguity
   - hot_work_fire_watch
   - housekeeping_slip_trip
   - loto_ambiguity
   - compressed_gas_cylinder_storage
   - ventilation_exposure_uncertainty
   - material_handling_struck_by
   - workplace_exam_documentation_ambiguity
5. Uniqueness must be enforced using a richer signature, not by making expectedScenarioFamily or expectedMechanism fake.
   Recommended uniqueness signature:
   - expectedHazardFamily
   - expectedScenarioFamily
   - expectedMechanism
   - jurisdiction
   - equipment
   - task
   - controlFailure
   - exposurePattern
   - locationContext
6. If fields like controlFailure, exposurePattern, or locationContext do not exist, add them to each dataset case and update validators/scorers carefully so they remain backward-safe.
7. Update validate-dataset-uniqueness.ts to use the richer realistic signature.
8. Update validate-safescope-field-taxonomy-quality.ts so it rejects:
   - mechanism_*
   - synthetic scenario labels ending in numeric IDs
   - single-risk-band datasets
   - artificial unique labels that exist only once when they should be reusable taxonomy
9. Do not weaken validation.
10. Do not tune SafeScope reasoning yet.
11. Regenerate calibration/triage result JSON after the dataset repair.
12. Update or create:
   - project-docs/08-audits/SAFESCOPE_DATASET_REALISM_REPAIR.md

Run validation:
- cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/validate-safescope-field-taxonomy-quality.ts
- cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration-triage.ts
- cd frontend-next && npm run build
- grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Before committing, show:
- git diff --stat
- dataset field quality summary
- taxonomy quality output
- duplicate signature count
- triage summary output
- frontend build result

Commit locally only with:
Repair SafeScope calibration dataset realism

Do not push.
Do not deploy.

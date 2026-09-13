You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- HEAD commit is ad8f15b or later local source/field validation checkpoint.
- Field validation dataset currently validates at 25/25 cases.
- Scoring currently reports jurisdiction coverage incorrectly as 0 after the 25-case expansion.
- Source governance validation passed.
- Frontend build passed.
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Create a reliable 100-scenario SafeScope baseline calibration dataset using a controlled coverage matrix, not freeform scenario generation.

Important:
Do not simply reword the same scenario.
Do not generate duplicate conveyor, electrical, fall, or LOTO examples with minor wording changes.
Each scenario must be unique by hazard family, scenario family, mechanism, jurisdiction, equipment/context, task, control failure, and exposure pattern.

Part A — Fix current jurisdiction scoring:
1. Inspect:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/scripts/validate-safescope-field-validation-dataset.ts
   - backend/scripts/score-safescope-field-validation-dataset.ts
2. Determine why scoring reports jurisdiction coverage as 0 despite records validating.
3. Align the script and dataset so jurisdiction coverage is counted correctly.
4. Do not weaken validation.

Part B — Add scenario coverage matrix:
1. Create a matrix document or JSON file, such as:
   - safescope-data/benchmarks/safescope-baseline-scenario-coverage-matrix.v1.json
2. The matrix should define target coverage for 100 scenarios across:
   - MSHA surface/mining
   - OSHA general industry
   - OSHA construction
   - jurisdiction unclear/mixed
3. Cover at least these hazard families:
   - machine_guarding
   - conveyors_powered_haulage
   - mobile_equipment_traffic_control
   - berms_roadways_dump_points
   - electrical
   - lockout_hazardous_energy
   - fall_protection
   - scaffolds_platforms_ladders
   - excavation_trenching
   - hazcom_chemical_exposure
   - fire_protection_extinguishers
   - emergency_access_egress
   - housekeeping_walking_working_surfaces
   - ppe_exposure_controls
   - confined_space_atmospheric
4. Include target counts per hazard family and jurisdiction.

Part C — Expand dataset to exactly 100 baseline cases:
1. Expand:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
2. Exactly 100 total cases.
3. Every case must include:
   - id
   - observationText
   - siteType
   - jurisdiction
   - equipment
   - task
   - controlFailure
   - exposurePattern
   - expectedHazardFamily
   - expectedScenarioFamily
   - expectedMechanism
   - expectedRiskBand
   - expectedStandardFamily
   - expectedCitationCandidate
   - expectedCorrectiveActionTheme
   - evidenceGapsExpected
   - reviewerNotes
   - qualifiedReviewerDisposition
   - advisoryGuardrails
4. Include clear, vague, ambiguous, and conflicting cases.
5. Include cases where citation candidates should remain null or limited because required evidence is missing.
6. Do not claim legal correctness.
7. Do not make SafeScope declare violations.
8. Do not make SafeScope issue citations.

Part D — Add uniqueness validation:
1. Add or update a validation script to detect duplicates.
2. Duplicate detection must fail when cases share the same combination of:
   - expectedHazardFamily
   - expectedScenarioFamily
   - expectedMechanism
   - jurisdiction
   - equipment
   - task
   - controlFailure
   - exposurePattern
3. Also add a looser similarity warning if observationText is too similar, but do not rely only on wording.
4. The validator should print:
   - total cases
   - valid cases
   - duplicate signature count
   - duplicate IDs if any
   - hazard family counts
   - jurisdiction counts
   - risk band counts
   - evidence gap counts
   - readiness status

Part E — Add documentation:
Create or update:
- project-docs/08-audits/SAFESCOPE_100_SCENARIO_BASELINE_CALIBRATION.md

Document:
- why matrix-based generation was used
- what hazards are covered
- what jurisdictions are covered
- what uniqueness rules are enforced
- what remains incomplete
- how this should be used for calibration, not legal determinations

Validation requirements:
Run:
- cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
- any new duplicate/coverage validation script
- cd frontend-next && npm run build
- grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Commit locally only with:
Add SafeScope 100 scenario baseline calibration set

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.

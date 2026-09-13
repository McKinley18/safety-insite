You are working inside the Sentinel_Safety repo.

Goal:
Build SafeScope Hazard Taxonomy Coverage + Absorption Routing v1.

This is a large local-only edit. Do not push. Do not ask the user for permission during implementation. Make reasonable engineering decisions while preserving all existing SafeScope governance rules.

Critical rules:
- Preserve advisory-only boundaries.
- Do not allow SafeScope to declare violations, citations, penalties, or legal conclusions.
- Any learned/absorbed hazard information must route to draft/review queues only.
- Do not promote knowledge to approved without explicit reviewer approval logic.
- Do not weaken existing validators.
- Do not remove existing draft packs or validation steps.
- Avoid duplicate records and duplicate runner entries.
- If a file already exists, extend it carefully instead of replacing it blindly.
- Keep all work local. Do not run git push.

Build requirements:

1. Create a master hazard taxonomy coverage map.
   File:
   safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json

   Include major safety domains relevant to SafeScope, at minimum:
   - machine_guarding
   - lockout_tagout
   - mobile_equipment
   - powered_haulage
   - traffic_control
   - confined_space
   - atmospheric_hazard
   - electrical
   - fall_protection
   - walking_working_surfaces
   - excavation_trenching
   - ground_control
   - hazcom
   - chemical_exposure
   - sds_labeling
   - ppe
   - fire_protection
   - emergency_egress
   - emergency_response
   - material_handling
   - rigging_lifting
   - suspended_loads
   - cranes_hoists
   - hot_work
   - welding_cutting
   - compressed_gas
   - pressure_systems
   - noise
   - respiratory_protection
   - silica_dust
   - heat_stress
   - ergonomics
   - housekeeping
   - slips_trips_falls
   - ladders
   - scaffolds
   - forklifts
   - powered_industrial_trucks
   - conveyors
   - guarding_interlocks
   - combustible_dust
   - environmental_spill
   - first_aid_medical
   - incident_reporting
   - training_competency
   - inspections_audits

   Each domain record must include:
   - domainId
   - displayName
   - status: one of ["covered_draft_pack", "partial_engine_coverage", "routing_only", "gap"]
   - relatedStandardFamilies
   - commonEntities
   - commonMechanisms
   - commonControls
   - evidenceQuestions
   - existingCoverageFiles
   - existingValidators
   - recommendedNextPack
   - priority: one of ["critical", "high", "medium", "low"]
   - notes

2. Create a hazard taxonomy coverage service.
   Folder:
   backend/src/safescope-v2/hazard-taxonomy-coverage/

   Files:
   - hazard-taxonomy-coverage.types.ts
   - hazard-taxonomy-coverage.service.ts
   - hazard-taxonomy-coverage.validator.ts

   The service should:
   - Load the coverage map.
   - Return all domains.
   - Return gaps.
   - Return covered draft-pack domains.
   - Find a domain by id.
   - Route absorbed hazard text to likely domains using keyword/entity/mechanism matching.
   - Return a routing result that includes:
     domainId, confidence, matchedSignals, routeDisposition, requiresHumanReview.

   No LLM calls. Deterministic only.

3. Extend hazard-information-absorption to use taxonomy coverage where practical.
   It should not overwrite existing behavior.
   It should add or expose:
   - likelyCoverageDomains
   - coverageStatus
   - recommendedDraftPackTarget
   - absorptionDisposition

4. Add validator:
   backend/scripts/validate-safescope-hazard-taxonomy-coverage.ts

   Validator must assert:
   - coverage map exists.
   - at least 40 domains exist.
   - each required field exists.
   - all status values are valid.
   - all priority values are valid.
   - known domains are present.
   - existing draft packs are represented.
   - routing examples work for:
     * unguarded conveyor tail pulley
     * forklift pedestrian blind spot
     * confined space atmospheric testing
     * unlabeled secondary chemical container
     * open edge fall exposure
     * trench without protective system
     * damaged electrical cord
     * blocked emergency exit
     * damaged rigging sling
     * hot work without fire watch

5. Add validator to:
   backend/scripts/run-safescope-full-validation.ts

   Use a clear unique label:
   Hazard taxonomy coverage

6. Update docs:
   project-docs/04-safescope-engine/SAFESCOPE_AI_TRANSITION_GAP_MAP.md
   project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md

   Add:
   - taxonomy coverage map status
   - coverage count
   - remaining top-priority gaps
   - explanation that absorption is reviewer-controlled and routes to draft/review, not automatic approval

7. Archive this prompt into:
   project-docs/09-archive-reference/prompts/SAFESCOPE_HAZARD_TAXONOMY_COVERAGE_AND_ABSORPTION_ROUTING_PROMPT.md

8. Run validation:
   cd backend
   npm run build
   npx ts-node scripts/validate-safescope-hazard-taxonomy-coverage.ts
   npm run validate:safescope:full

You are working inside the Sentinel_Safety repository.

Goal:
Implement SafeScope Scenario Expansion Pack v1 to move SafeScope closer to full validated safety-AI classification by expanding its real-world hazard reasoning coverage across multiple domains in one larger sprint.

Hard rules:
- Do not push.
- Do not deploy.
- Preserve advisory-only boundaries.
- Do not generate citation/violation conclusions.
- Do not weaken existing validators.
- Prefer deterministic, source-backed, reviewable structures.
- Use targeted validation where practical, then run full validation at the end.
- Keep files organized under the existing SafeScope structure.

Current context:
SafeScope already has:
- hazard taxonomy coverage routing
- approved knowledge promotion / review workflow
- hazard information absorption
- approved knowledge retrieval output
- field output composer
- orchestrator field output wiring
- targeted validation mode
- 12 approved seed records
- 43/43 full validation passing
- frontend build passing

Build the next larger step:

1. Create a scenario expansion registry:
   - Path: safescope-data/scenario-expansion/safescope-scenario-expansion-pack.v1.json
   - Include at least 60 scenario records.
   - Cover at least these domains:
     machine_guarding
     electrical
     hazcom
     confined_space
     excavation_trenching
     fall_protection
     mobile_equipment
     rigging_lifting
     fire_protection
     emergency_egress
     ppe
     material_handling
     compressed_gas
     hot_work
     walking_working_surfaces
   - Each record must include:
     scenarioId
     domainId
     scenarioFamily
     hazardFamily
     plainLanguageObservation
     equipmentOrEnvironment
     taskContext
     energyOrHazardSource
     mechanismOfHarm
     exposurePattern
     likelyControlsMissing
     evidenceSignals
     evidenceGaps
     supervisorQuestions
     immediateActions
     durableControls
     knownFalsePositiveRisks
     advisoryBoundaryNote

2. Implement backend scenario expansion service:
   - Path: backend/src/safescope-v2/scenario-expansion/
   - Files:
     scenario-expansion.types.ts
     scenario-expansion.service.ts
     scenario-expansion.validator.ts
   - Service should:
     load the JSON registry
     search by domainId, text, mechanism, and scenarioFamily
     return scored candidate scenarios
     preserve advisory-only framing
     avoid declaring violations
     expose top scenario matches for orchestration use

3. Wire scenario expansion into retrieval/output flow:
   - ApprovedKnowledgeRetrievalOutputV1Service should include scenario candidate matches.
   - FieldOutputComposerV1Service should use scenario candidates to improve:
     hazard summary
     mechanism explanation
     evidence gaps
     supervisor questions
     recommended immediate and durable controls
   - Do not replace approved knowledge matches; scenario expansion should supplement them.

4. Add validator:
   - Path: backend/scripts/validate-safescope-scenario-expansion-pack-v1.ts
   - Validate:
     at least 60 records
     required fields exist
     no prohibited enforcement language
     at least 15 domains represented
     search returns correct domain matches for representative cases
     field output includes scenario-informed questions/actions
     advisory boundaries remain present

5. Add targeted validation integration:
   - Update backend/scripts/run-safescope-targeted-validation.ts
   - Add scenario expansion validator to a sensible area, preferably:
     --area=core
     --area=output
     and/or create --area=scenarios if the runner supports it cleanly.
   - Update backend/package.json if adding a new targeted script.

6. Add master validation integration:
   - Update backend/scripts/run-safescope-full-validation.ts
   - Full suite should become 44/44 if currently 43/43.

7. Update documentation:
   - project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md
   - project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md
   - project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md
   - project-docs/04-safescope-engine/SAFESCOPE_AI_TRANSITION_GAP_MAP.md
   - Add or update a scenario expansion section explaining:
     what it improves
     what it does not do
     what remains before SafeScope can be called fully mature AI

8. Archive this prompt:
   - Move or copy this prompt into:
     project-docs/09-archive-reference/prompts/SAFESCOPE_SCENARIO_EXPANSION_PACK_V1_PROMPT.md

Validation commands to run:
cd backend
npm run validate:safescope:targeted:core
npm run validate:safescope:targeted:output
npm run validate:safescope:full

Then:
cd ../frontend-next
npm run build

Final git actions:
cd ..
git status --short
git diff --stat
git add [changed files]
git commit -m "Add SafeScope scenario expansion pack v1"

Final response must include:
- summary of scenario expansion coverage
- validation results
- files changed
- git status/log
- confirm no push performed

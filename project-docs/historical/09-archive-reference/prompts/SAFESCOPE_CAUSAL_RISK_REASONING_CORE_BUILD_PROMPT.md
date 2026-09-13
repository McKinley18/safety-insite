You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope causal-risk reasoning layer that strengthens SafeScope as a defensible AI-style reasoning engine without creating a 100-case baseline or teaching it scenario answers by memorization.

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove any existing guardrails.

Current context:
- SafeScope v2 active source lives in backend/src/safescope-v2/
- Recent validation checkpoint:
  - backend build passed
  - precision batches 001, 002, 003 passed 10/10 exact matches across hazardFamily, scenarioFamily, mechanism, riskBand, standardFamily
  - observation understanding validation passed
  - understanding engine validation passed
  - main output observation-understanding validation passed
  - observation trace snapshot validation passed
  - field output contract validation passed
- Do not build the 100-case baseline yet.
- Do not create large scenario datasets.
- Do not make SafeScope simply regurgitate scenarios.
- Build reusable reasoning primitives.

Task:
Create a new SafeScope causal-risk reasoning core under:

backend/src/safescope-v2/causal-risk/

Add these files:

1. backend/src/safescope-v2/causal-risk/causal-risk.types.ts
2. backend/src/safescope-v2/causal-risk/causal-risk.service.ts
3. backend/scripts/validate-safescope-causal-risk-reasoning.ts

Then wire the causal-risk result into:

backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

and expose it on the SafeScope intelligence output without breaking existing output fields.

Required causal-risk output shape:
- engine
- version
- primaryEnergySource
- energyTransferPath
- exposedTarget
- initiatingCondition
- failedOrMissingControl
- mechanismOfInjury
- credibleWorstCase
- competingMechanisms
- missingEvidence
- confidence
  - level: high | moderate | low | insufficient
  - score
  - reasons
- reasoningTrace
- advisoryGuardrails
  - advisoryOnly: true
  - doesNotDeclareViolation: true
  - doesNotCreateCitation: true
  - requiresQualifiedReview: true

Implementation requirements:
- The causal-risk service should reason from structured understanding when available:
  - observationUnderstanding.equipment
  - observationUnderstanding.task
  - observationUnderstanding.exposure
  - observationUnderstanding.energy
  - observationUnderstanding.controls
  - observationUnderstanding.mechanismCandidates
  - observationUnderstanding.scenarioUnderstanding
- It should also use fusedText as fallback context.
- It should not depend on benchmark expected answers.
- It should not create new precision scenario fixtures.
- It should produce useful explanations even when scenarioFamily is unknown.
- It should downgrade confidence when exposure, control failure, energy source, or mechanism are unclear.
- It should identify competing mechanisms where appropriate.

Initial reasoning coverage should include at least:
- fall_from_height
- unexpected_startup
- rotating_equipment_nip_point
- electrical_shock
- struck_by_mobile_equipment
- struck_by_falling_suspended_load
- atmospheric_hazard_engulfment_or_entrapment
- chemical_exposure_unknown_agent
- struck_by_whipping_pressurized_line
- slip_trip_fall_same_level
- delayed_emergency_response
- caught_in_cave_in

Validation script:
Create backend/scripts/validate-safescope-causal-risk-reasoning.ts

It should instantiate the causal-risk service directly and validate several representative observations. Do not make this a broad scenario benchmark. Use a small reasoning validation set only.

Include cases that prove:
1. Conveyor servicing without lockout reasons to unexpected_startup and high/qualified review.
2. Open floor hole reasons to gravity/fall_from_height.
3. Confined space tank entry reasons to atmospheric hazard.
4. Suspended load line-of-fire reasons to struck-by suspended load.
5. Unlabeled chemical container reasons to chemical exposure unknown agent.
6. Vague observation produces low or insufficient confidence and missing evidence.

The validation should fail with process.exit(1) if any expected reasoning primitive is missing.

After implementation, run:

cd backend
npm run build
npx ts-node scripts/validate-safescope-causal-risk-reasoning.ts
npx ts-node scripts/run-safescope-precision-batch-001.ts
npx ts-node scripts/run-safescope-precision-batch-002.ts
npx ts-node scripts/run-safescope-precision-batch-003.ts
npx ts-node scripts/validate-safescope-observation-understanding.ts
npx ts-node scripts/validate-safescope-understanding-engine.ts
npx ts-node scripts/validate-safescope-main-output-observation-understanding.ts
npx ts-node scripts/validate-safescope-observation-trace-snapshot.ts
npx ts-node scripts/validate-safescope-field-output-contract.ts

Then update:
project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md

Add a new checkpoint section stating:
- SafeScope causal-risk reasoning core added.
- It reasons from energy, exposure, failed control, mechanism, credible worst case, competing mechanisms, and missing evidence.
- It is not a scenario memorization layer.
- Existing precision batches 001-003 remain green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note under the appropriate capability track that the causal-risk reasoning core is now the next foundation for defensible AI behavior.

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed

You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Evidence Sufficiency Engine that strengthens SafeScope as a defensible AI-style safety reasoning system without creating a large scenario dataset or causing scenario memorization.

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove or weaken any existing guardrails.

Current context:
- SafeScope v2 active source lives in backend/src/safescope-v2/
- Latest committed checkpoint:
  - 1a3bae5 Add SafeScope causal risk reasoning core
- SafeScope now includes causal-risk reasoning from:
  - energy source
  - energy-transfer path
  - exposed target
  - initiating condition
  - failed/missing control
  - mechanism of injury
  - credible worst case
  - competing mechanisms
  - missing evidence
  - confidence
- Do not build the 100-case baseline yet.
- Do not create large scenario batches.
- Do not make SafeScope memorize examples.
- Build reusable evidence-quality reasoning primitives.

Task:
Create a new SafeScope Evidence Sufficiency Engine under:

backend/src/safescope-v2/evidence-sufficiency-core/

Add these files:

1. backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.types.ts
2. backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service.ts
3. backend/scripts/validate-safescope-evidence-sufficiency.ts

Then wire the evidence-sufficiency result into:

backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

and expose it on the SafeScope intelligence output without breaking existing output fields.

Required evidence-sufficiency output shape:
- engine
- version
- sufficiencyLevel: sufficient | partially_sufficient | weak | insufficient
- overallScore
- factScores
  - observationClarity
  - equipmentClarity
  - taskClarity
  - exposureClarity
  - energyClarity
  - controlFailureClarity
  - mechanismClarity
  - jurisdictionClarity
  - evidenceSupport
- strongestFacts
- weakestFacts
- missingCriticalFacts
- recommendedReviewerQuestions
- confidenceImpact
  - shouldDowngradeConfidence
  - downgradeReason
  - maximumSupportedConfidence: high | moderate | low | insufficient
- reasoningTrace
- advisoryGuardrails
  - advisoryOnly: true
  - doesNotDeclareViolation: true
  - doesNotCreateCitation: true
  - requiresQualifiedReview: true

Implementation requirements:
- The service should reason from structured understanding when available:
  - observationUnderstanding.jurisdiction
  - observationUnderstanding.equipment
  - observationUnderstanding.task
  - observationUnderstanding.exposure
  - observationUnderstanding.energy
  - observationUnderstanding.controls
  - observationUnderstanding.mechanismCandidates
  - observationUnderstanding.scenarioUnderstanding
- It should also use causalRiskReasoning when available.
- It should also use fusedText as fallback context.
- It must not depend on benchmark expected answers.
- It must not create a scenario bank.
- It should produce useful sufficiency output even when scenarioFamily is unknown.
- It should downgrade confidence when evidence is weak.
- It should recommend specific reviewer questions based on missing facts.

Scoring guidance:
- High/sufficient evidence requires clear observation, clear exposure, clear energy/mechanism, and clear failed or missing control.
- Partially sufficient evidence means SafeScope can discuss likely risk but should preserve uncertainty.
- Weak evidence means SafeScope should ask questions before giving strong recommendations.
- Insufficient evidence means SafeScope should not make a strong classification, risk, standard-family, or corrective-action recommendation.

Initial reviewer question examples:
- Confirm whether a worker was exposed and how close they were to the hazard.
- Confirm whether the equipment was energized, running, pressurized, elevated, or otherwise hazardous.
- Confirm what control was missing, failed, bypassed, damaged, or not used.
- Confirm task/activity at the time of observation.
- Confirm jurisdiction/site type before relying on standards mapping.
- Confirm whether photos or supporting evidence exist.

Validation script:
Create backend/scripts/validate-safescope-evidence-sufficiency.ts

It should instantiate:
- ObservationUnderstandingService
- CausalRiskService
- EvidenceSufficiencyService

Use a small reasoning validation set only.

Include cases that prove:
1. Clear conveyor servicing without lockout returns sufficient or partially_sufficient, with no missing critical exposure/control facts.
2. Clear open floor hole near employees returns sufficient or partially_sufficient and recognizes exposure/energy/control clarity.
3. Clear confined space tank entry with missing atmospheric test/attendant/permit/rescue plan returns sufficient and recommends qualified review.
4. Vague observation returns insufficient and recommends reviewer questions.
5. Observation with hazard but unclear worker exposure returns weak or partially_sufficient and downgrades maximum supported confidence.
6. Observation with unclear jurisdiction returns a jurisdiction-related missing fact or reviewer question.

The validation should fail with process.exit(1) if any expected evidence-sufficiency primitive is missing.

After implementation, run:

cd backend
npm run build
npx ts-node scripts/validate-safescope-evidence-sufficiency.ts
npx ts-node scripts/validate-safescope-causal-risk-reasoning.ts
npx ts-node src/safescope-v2/tests/golden-domain-intelligence-tests.ts
npx ts-node src/safescope-v2/tests/golden-operational-reasoning-tests.ts
npx ts-node scripts/run-safescope-precision-batch-001.ts
npx ts-node scripts/run-safescope-precision-batch-002.ts
npx ts-node scripts/run-safescope-precision-batch-003.ts
npx ts-node scripts/validate-safescope-observation-understanding.ts
npx ts-node scripts/validate-safescope-understanding-engine.ts
npx ts-node scripts/validate-safescope-main-output-observation-understanding.ts
npx ts-node scripts/validate-safescope-observation-trace-snapshot.ts
npx ts-node scripts/validate-safescope-field-output-contract.ts

Then run:

cd ../frontend-next
npm run build

Then update:
project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md

Add a new checkpoint section stating:
- SafeScope Evidence Sufficiency Engine added.
- It evaluates whether the observation contains enough facts to support strong reasoning.
- It scores observation clarity, equipment, task, exposure, energy, control failure, mechanism, jurisdiction, and evidence support.
- It recommends reviewer questions for missing critical facts.
- It prevents weak evidence from being presented as high-confidence reasoning.
- It is not a scenario memorization layer.
- Existing precision batches 001-003 remain green.
- Causal-risk validation remains green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note under Track D: Evidence Sufficiency and Confidence stating that the Evidence Sufficiency Engine is now the next defensibility layer after causal-risk reasoning.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed

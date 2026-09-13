You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Confidence Governance Core that acts as the defensibility governor over SafeScope outputs.

This is not a scenario memorization layer.
Do not create a 100-case baseline.
Do not create large scenario datasets.
Do not teach SafeScope answers to regurgitate.

Build a reusable confidence decision layer that determines how strongly SafeScope is allowed to speak based on:
- observation understanding
- causal-risk reasoning
- evidence sufficiency
- scenario intelligence
- risk reasoning
- standards reasoning
- missing evidence
- advisory guardrails

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove or weaken any existing guardrails.

Current committed checkpoint:
- 56793c7 Add SafeScope evidence sufficiency engine
- 1a3bae5 Add SafeScope causal risk reasoning core

Current validated foundation:
- Evidence Sufficiency Engine is green.
- Causal-Risk Reasoning Core is green.
- Precision batches 001, 002, and 003 are green.
- Backend build is green.
- Frontend build is green.
- SafeScope observation, understanding, trace snapshot, and field output contract validations are green.

Task:
Create a new SafeScope Confidence Governance Core under:

backend/src/safescope-v2/confidence-governance/

Add these files:

1. backend/src/safescope-v2/confidence-governance/confidence-governance.types.ts
2. backend/src/safescope-v2/confidence-governance/confidence-governance.service.ts
3. backend/scripts/validate-safescope-confidence-governance.ts

Then wire the confidence-governance result into:

backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

Expose it on the SafeScope intelligence output without breaking existing output fields.

Required confidence-governance output shape:
- engine
- version
- finalConfidenceLevel: high | moderate | low | insufficient
- maximumSupportedConfidence: high | moderate | low | insufficient
- confidenceScore
- confidenceInputs
  - observationUnderstandingConfidence
  - causalRiskConfidence
  - evidenceSufficiencyLevel
  - evidenceSufficiencyScore
  - scenarioConfidence
  - riskConfidence
  - standardsConfidence
- downgradeReasons
- blockingEvidenceGaps
- humanReviewRequired
- humanReviewReasons
- outputPermissions
  - canSupportStrongRecommendation
  - canSupportStandardFamilySuggestion
  - canSupportCitationCandidate
  - canSupportCorrectiveAction
  - canSupportReportNarrative
- decisionTrace
- advisoryGuardrails
  - advisoryOnly: true
  - doesNotDeclareViolation: true
  - doesNotCreateCitation: true
  - requiresQualifiedReview: true

Implementation requirements:
- The service should take an object containing:
  - observationUnderstanding
  - causalRiskReasoning
  - evidenceSufficiency
  - scenarioIntelligence
  - riskReasoning
  - standardsReasoning
  - calibrationMeta
  - fusedText
- It must use Evidence Sufficiency as the primary governor.
- It must downgrade confidence when evidenceSufficiency maximumSupportedConfidence is lower than another layer’s confidence.
- It must downgrade confidence when exposure, energy, control failure, mechanism, jurisdiction, or supporting evidence are weak or missing.
- It must preserve human review for high-risk or critical conditions.
- It must allow strong corrective-action language only when evidence is sufficient or partially sufficient.
- It must not allow citation-candidate support unless evidence and standards confidence are strong enough.
- It must distinguish between:
  - “SafeScope can discuss likely risk”
  - “SafeScope can recommend controls”
  - “SafeScope can suggest a standard family”
  - “SafeScope can support a citation candidate”
- It must not depend on benchmark expected answers.
- It must produce useful governance output even when scenarioFamily is unknown.

Suggested governance behavior:
- sufficient evidence + high causal confidence can support strong recommendation and corrective action.
- partially_sufficient evidence can support likely risk discussion and corrective action, but should limit citation candidate support.
- weak evidence should support reviewer questions and cautious narrative only.
- insufficient evidence should block strong recommendations, standards/citation support, and strong report conclusions.
- critical/high risk should always require qualified human review even when confidence is high.

Validation script:
Create backend/scripts/validate-safescope-confidence-governance.ts

It should instantiate:
- ObservationUnderstandingService
- CausalRiskService
- EvidenceSufficiencyService
- ConfidenceGovernanceService

Use a small reasoning validation set only.

Include cases that prove:
1. Clear conveyor servicing without lockout permits strong recommendation/corrective action but still requires human review.
2. Clear confined space tank entry requires human review and permits strong recommendation, but does not declare violation/citation.
3. Vague observation produces insufficient confidence and blocks strong recommendation, standard family suggestion, citation candidate, and corrective action.
4. Observation with unclear worker exposure downgrades confidence and blocks citation candidate support.
5. Observation with unclear jurisdiction blocks citation candidate support and recommends jurisdiction confirmation.
6. Partially sufficient evidence allows cautious report narrative but not strong citation candidate support.

The validation should fail with process.exit(1) if any expected governance primitive is missing.

After implementation, run:

cd backend
npm run build
npx ts-node scripts/validate-safescope-confidence-governance.ts
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
- SafeScope Confidence Governance Core added.
- It acts as the defensibility governor over SafeScope outputs.
- It uses Evidence Sufficiency as the primary confidence gate.
- It determines whether SafeScope can support strong recommendations, standard-family suggestions, citation candidates, corrective actions, and report narratives.
- It prevents weak evidence from being presented as high-confidence conclusions.
- It is not a scenario memorization layer.
- Existing precision batches 001-003 remain green.
- Evidence sufficiency and causal-risk validations remain green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note after the Evidence Sufficiency Engine note stating that the Confidence Governance Core is now the output governor that decides how strongly SafeScope may speak.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed

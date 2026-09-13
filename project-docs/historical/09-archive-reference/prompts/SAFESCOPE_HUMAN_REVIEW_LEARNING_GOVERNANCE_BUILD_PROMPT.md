You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Human Review and Learning Governance Core.

This layer must control how SafeScope receives reviewer feedback, records human decisions, and determines whether reviewer corrections are eligible for future learning.

This is not a scenario memorization layer.
Do not create a 100-case baseline.
Do not create large scenario datasets.
Do not teach SafeScope answers to regurgitate.
Do not allow automatic learning from unreviewed outputs.

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove or weaken any existing guardrails.

Current committed checkpoint:
- 6ff13f9 Add SafeScope defensible corrective action core
- e49963a Add SafeScope output policy governor
- e037f98 Add SafeScope confidence governance core
- 56793c7 Add SafeScope evidence sufficiency engine
- 1a3bae5 Add SafeScope causal risk reasoning core

Current validated foundation:
- Defensible Corrective Action Core is green.
- Output Policy Governor is green.
- Confidence Governance Core is green.
- Evidence Sufficiency Engine is green.
- Causal-Risk Reasoning Core is green.
- Precision batches 001, 002, and 003 are green.
- Backend build is green.
- Frontend build is green.
- SafeScope observation, understanding, trace snapshot, and field output contract validations are green.

Task:
Create a new SafeScope Human Review and Learning Governance Core under:

backend/src/safescope-v2/human-review-learning-governance/

Add these files:

1. backend/src/safescope-v2/human-review-learning-governance/human-review-learning-governance.types.ts
2. backend/src/safescope-v2/human-review-learning-governance/human-review-learning-governance.service.ts
3. backend/scripts/validate-safescope-human-review-learning-governance.ts

Then wire the human-review-learning-governance result into:

backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

Expose it on the SafeScope intelligence output without breaking existing output fields.

Required output shape:
- engine
- version
- reviewRequired
- reviewPriority: critical | high | medium | low
- reviewerDecisionOptions
  - accept
  - acceptWithEdits
  - reject
  - needsMoreEvidence
  - escalate
- reviewFocusAreas
- requiredReviewerConfirmations
- correctionCapture
  - shouldCaptureCorrectedHazardFamily
  - shouldCaptureCorrectedMechanism
  - shouldCaptureCorrectedExposure
  - shouldCaptureCorrectedControls
  - shouldCaptureCorrectedJurisdiction
  - shouldCaptureCorrectedStandardFamily
  - shouldCaptureCorrectedCorrectiveActions
- learningEligibility
  - eligibleForLearningCandidate
  - eligibilityLevel: approved_candidate | review_required | blocked
  - blockedReasons
  - requiredApprovals
- auditTrailRequirements
- governanceWarnings
- decisionTrace
- advisoryGuardrails
  - advisoryOnly: true
  - doesNotDeclareViolation: true
  - doesNotCreateCitation: true
  - requiresQualifiedReview: true

Implementation requirements:
- Use confidenceGovernance, outputPolicy, evidenceSufficiency, causalRiskReasoning, defensibleCorrectiveAction, observationUnderstanding, and calibrationMeta.
- High-risk or critical scenarios must require human review.
- Low confidence, weak evidence, unclear jurisdiction, unclear exposure, or questions_only output must require reviewer confirmation.
- Learning eligibility must be blocked when:
  - evidence is insufficient
  - output policy is questions_only
  - reviewer has not approved the correction
  - jurisdiction is unclear
  - exposure is unclear
  - mechanism is unknown
- Learning eligibility may become review_required when:
  - evidence is partially sufficient
  - reviewer edits are needed
  - confidence is moderate
- Learning eligibility may become approved_candidate only when:
  - evidence is sufficient
  - confidence governance permits strong or moderate reasoning
  - output policy is not questions_only
  - core hazard mechanism and exposure are clear
  - qualified reviewer approval is still required before any future knowledge update
- Do not create persistent DB migrations yet.
- Do not automatically write learned knowledge into approved knowledge.
- This layer should only produce governance output describing what should be captured, blocked, or reviewed.

Validation script:
Create backend/scripts/validate-safescope-human-review-learning-governance.ts

It should instantiate:
- ObservationUnderstandingService
- CausalRiskService
- EvidenceSufficiencyService
- ConfidenceGovernanceService
- OutputPolicyService
- DefensibleCorrectiveActionService
- HumanReviewLearningGovernanceService

Use a small reasoning validation set only.

Include cases that prove:
1. Clear conveyor servicing without lockout requires high/critical human review and may be a learning candidate only after qualified approval.
2. Vague observation blocks learning and requires more evidence.
3. Unclear worker exposure blocks learning or requires review before learning eligibility.
4. Unclear jurisdiction blocks learning and requires jurisdiction confirmation.
5. Questions-only output blocks learning.
6. Moderate confidence / partially sufficient evidence produces review_required learning eligibility, not approved_candidate.
7. All outputs preserve advisory guardrails.

The validation should fail with process.exit(1) if any expected governance primitive is missing.

After implementation, run:

cd backend
npm run build
npx ts-node scripts/validate-safescope-human-review-learning-governance.ts
npx ts-node scripts/validate-safescope-defensible-corrective-action.ts
npx ts-node scripts/validate-safescope-output-policy.ts
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
- SafeScope Human Review and Learning Governance Core added.
- It determines what requires qualified human review before reliance.
- It captures what reviewer corrections should be collected.
- It blocks unsafe automatic learning.
- It separates approved learning candidates, review-required candidates, and blocked candidates.
- It protects SafeScope from silently learning bad information.
- It is not a scenario memorization layer.
- Existing precision batches 001-003 remain green.
- DCA, output policy, confidence governance, evidence sufficiency, and causal-risk validations remain green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note under Track F: Human Review and Learning Governance stating that the Human Review and Learning Governance Core is now the layer that controls reviewer correction capture and prevents unsafe automatic learning.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed

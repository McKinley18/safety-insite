You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Defensible Corrective Action Core that generates corrective-action reasoning from reusable safety primitives instead of generic templates or memorized scenarios.

This is not a scenario memorization layer.
Do not create a 100-case baseline.
Do not create large scenario datasets.
Do not teach SafeScope answers to regurgitate.

Build a reusable corrective-action reasoning layer that uses:
- observation understanding
- causal-risk reasoning
- evidence sufficiency
- confidence governance
- output policy
- failed or missing controls
- mechanism of injury
- credible worst case
- worker exposure
- verification needs
- advisory guardrails

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove or weaken any existing guardrails.

Current committed checkpoint:
- e49963a Add SafeScope output policy governor
- f0542ad Fix SafeScope governance exposure sufficiency handling
- e037f98 Add SafeScope confidence governance core
- 56793c7 Add SafeScope evidence sufficiency engine
- 1a3bae5 Add SafeScope causal risk reasoning core

Current validated foundation:
- Output Policy Governor is green.
- Confidence Governance Core is green.
- Evidence Sufficiency Engine is green.
- Causal-Risk Reasoning Core is green.
- Precision batches 001, 002, and 003 are green.
- Backend build is green.
- Frontend build is green.
- SafeScope observation, understanding, trace snapshot, and field output contract validations are green.

Task:
Create a new SafeScope Defensible Corrective Action Core under:

backend/src/safescope-v2/defensible-corrective-action/

Add these files:

1. backend/src/safescope-v2/defensible-corrective-action/defensible-corrective-action.types.ts
2. backend/src/safescope-v2/defensible-corrective-action/defensible-corrective-action.service.ts
3. backend/scripts/validate-safescope-defensible-corrective-action.ts

Then wire the defensible corrective-action result into:

backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

Expose it on the SafeScope intelligence output without breaking existing output fields.

Required output shape:
- engine
- version
- actionStrength: strong | moderate | cautious | questions_only
- immediateActions
- interimControls
- permanentCorrectiveActions
- verificationActions
- assignedReviewNeeds
- actionRationale
- blockedActions
- missingEvidenceBeforeFinalAction
- reviewerQuestions
- languagePolicyApplied
- confidenceLimits
- advisoryGuardrails
  - advisoryOnly: true
  - doesNotDeclareViolation: true
  - doesNotCreateCitation: true
  - requiresQualifiedReview: true

Each action item should include:
- actionType
- title
- description
- tiedMechanism
- tiedFailedControl
- tiedExposure
- verificationMethod
- priority
- requiresHumanReview

Implementation requirements:
- Use outputPolicy as the primary language-strength and permission gate.
- Use confidenceGovernance to determine whether corrective-action text may be strong, moderate, cautious, or questions-only.
- Use evidenceSufficiency to decide whether final corrective actions are allowed or whether reviewer questions must come first.
- Use causalRiskReasoning to tie actions to energy, exposure, failed controls, mechanism, and credible worst case.
- Use observationUnderstanding to extract equipment, task, controls, exposure, and scenario information.
- Use fusedText as fallback context.
- Do not depend on benchmark expected answers.
- Do not create a scenario bank.
- Do not generate violation language.
- Do not generate citation language.
- Do not imply regulatory determination.
- Every output must preserve qualified-review language.

Corrective action behavior:
- If outputPolicy allows strong or moderate corrective-action text:
  - Provide immediate controls.
  - Provide interim controls.
  - Provide permanent corrective actions.
  - Provide verification actions.
- If outputPolicy is cautious:
  - Provide cautious control recommendations and reviewer questions.
  - Avoid overconfident final-action language.
- If outputPolicy is questions_only:
  - Do not generate strong corrective actions.
  - Generate reviewer questions and blocked-action reasons.
- If evidence is insufficient:
  - Block final corrective actions.
  - Ask targeted reviewer questions.
- If exposure is unclear:
  - Ask exposure/proximity questions before finalizing action priority.
- If jurisdiction is unclear:
  - Do not reference standards or compliance outcomes.
- If supporting evidence is weak:
  - Require photo, measurement, permit, SDS, inspection tag, lockout record, atmospheric test, or other relevant verification as applicable.

Initial reusable action logic should cover mechanisms:
- unexpected_startup
- rotating_equipment_nip_point
- fall_from_height
- electrical_shock
- atmospheric_hazard_engulfment_or_entrapment
- struck_by_falling_suspended_load
- chemical_exposure_unknown_agent
- struck_by_whipping_pressurized_line
- struck_by_mobile_equipment
- caught_in_cave_in
- slip_trip_fall_same_level
- delayed_emergency_response

Validation script:
Create backend/scripts/validate-safescope-defensible-corrective-action.ts

It should instantiate:
- ObservationUnderstandingService
- CausalRiskService
- EvidenceSufficiencyService
- ConfidenceGovernanceService
- OutputPolicyService
- DefensibleCorrectiveActionService

Use a small reasoning validation set only.

Include cases that prove:
1. Conveyor servicing without lockout produces immediate/interim/permanent/verification actions tied to unexpected_startup and energy isolation.
2. Open floor hole near employees produces fall-prevention actions tied to fall_from_height and missing cover/barricade/edge protection.
3. Confined space tank entry produces atmospheric testing/attendant/permit/rescue/entry control actions without declaring a violation.
4. Vague observation produces questions_only behavior and blocks final corrective actions.
5. Unclear worker exposure produces reviewer questions about exposure/proximity before final priority.
6. Unclear jurisdiction does not produce compliance/citation language.
7. All outputs preserve advisory guardrails.

The validation should fail with process.exit(1) if any expected corrective-action primitive is missing.

After implementation, run:

cd backend
npm run build
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
- SafeScope Defensible Corrective Action Core added.
- It converts causal-risk reasoning, evidence sufficiency, confidence governance, and output policy into corrective-action reasoning.
- It ties actions to mechanism of injury, failed or missing controls, worker exposure, credible worst case, and verification needs.
- It separates immediate actions, interim controls, permanent corrective actions, verification actions, reviewer questions, and blocked actions.
- It prevents weak evidence from becoming overconfident corrective-action language.
- It is not a scenario memorization layer.
- Existing precision batches 001-003 remain green.
- Output policy, confidence governance, evidence sufficiency, and causal-risk validations remain green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note under Track E: Corrective Action Defensibility stating that the Defensible Corrective Action Core is now the layer that converts SafeScope’s internal reasoning into practical, evidence-governed corrective actions.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed

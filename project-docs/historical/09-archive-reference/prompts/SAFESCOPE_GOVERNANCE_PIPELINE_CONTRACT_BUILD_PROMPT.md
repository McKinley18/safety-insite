You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Governance Pipeline Contract Validator.

This is not a new reasoning engine.
This is not a scenario memorization layer.
This is a top-level contract validation that proves the SafeScope orchestrator output exposes every governance layer together and preserves advisory boundaries.

Current committed checkpoint:
- 2e8377d Add SafeScope approved knowledge registry write guard core
- 4057c22 Record SafeScope post-AKPWG validation snapshot
- 2c879de Add SafeScope approved knowledge promotion workflow governance core
- a9ebc83 Add SafeScope approved source knowledge intake governance core
- 5030380 Add SafeScope source-backed applicability governance core
- 7f67cce Add SafeScope human review learning governance core
- 6ff13f9 Add SafeScope defensible corrective action core
- e49963a Add SafeScope output policy governor
- e037f98 Add SafeScope confidence governance core
- 56793c7 Add SafeScope evidence sufficiency engine
- 1a3bae5 Add SafeScope causal risk reasoning core

Task:
Create:

backend/scripts/validate-safescope-governance-pipeline-contract.ts

The validation should instantiate SafeScopeIntelligenceOrchestrator and run a small set of representative observations through the final orchestrator output.

Validate that the final output includes these top-level fields:
- causalRiskReasoning
- evidenceSufficiency
- confidenceGovernance
- outputPolicy
- dca
- hrlg
- sbag
- askig
- akpwg
- akrwg
- observationUnderstanding
- calibrationMeta

For each governance object that has advisoryGuardrails, validate:
- advisoryOnly === true
- doesNotDeclareViolation === true
- doesNotCreateCitation === true
- requiresQualifiedReview === true

Validate policy relationships:
- If outputPolicy.allowedLanguageStrength is questions_only, then dca.actionStrength must be questions_only or blocked from final corrective action language.
- If evidenceSufficiency is insufficient, outputPolicy must not allow strong language.
- If sbag citationCandidateSupport.canDiscussCitationCandidate is true, then reviewer confirmation must be required.
- If askig intakeDecision is blocked/rejected, then akpwg and akrwg must not allow approved-registry write.
- akrwg must never set canWriteApprovedKnowledge true unless reviewer approval and audit trail are present.

Use a small validation set:
1. Clear conveyor servicing / lockout scenario.
2. Vague observation.
3. Unclear jurisdiction floor-hole scenario.

Do not change production logic unless the contract exposes a real wiring defect.
Do not create a scenario bank.
Do not weaken advisory-only guardrails.

After implementation, run:

cd backend
npm run build
npx ts-node scripts/validate-safescope-governance-pipeline-contract.ts
npx ts-node scripts/validate-safescope-approved-knowledge-registry-write-guard.ts
npx ts-node scripts/validate-safescope-approved-knowledge-promotion-workflow-governance.ts
npx ts-node scripts/validate-safescope-approved-source-knowledge-intake-governance.ts
npx ts-node scripts/validate-safescope-source-backed-applicability-governance.ts
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
- SafeScope Governance Pipeline Contract Validator added.
- It validates that all governance layers are present together in the final orchestrator output.
- It validates advisory guardrails across governance outputs.
- It validates key policy relationships between evidence sufficiency, output policy, corrective action strength, applicability support, intake governance, promotion governance, and registry write guard.
- Existing precision batches 001-003 remain green.
- All governance validations remain green.
- Frontend build remains green.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note that SafeScope now has an end-to-end governance pipeline contract validator that protects against future wiring regressions.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

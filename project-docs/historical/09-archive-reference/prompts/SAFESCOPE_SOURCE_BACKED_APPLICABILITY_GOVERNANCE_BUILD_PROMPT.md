You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Source-Backed Applicability Governance Core.

This layer determines whether SafeScope has enough source-backed support to discuss standard families, citation candidates, applicability reasoning, and regulatory relevance.

This is not a citation generator.
This is not a violation-declaration layer.
This is not a scenario memorization layer.
Do not create a 100-case baseline.
Do not create large scenario datasets.
Do not teach SafeScope answers to regurgitate.

Build a reusable applicability-governance layer that uses:
- observation understanding
- causal-risk reasoning
- evidence sufficiency
- confidence governance
- output policy
- defensible corrective action
- human review learning governance
- standard family candidates
- citation level candidates
- approved knowledge context when available
- jurisdiction clarity
- evidence gaps
- advisory guardrails

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove or weaken any existing guardrails.

Current committed checkpoint:
- 7f67cce Add SafeScope human review learning governance core
- 6ff13f9 Add SafeScope defensible corrective action core
- e49963a Add SafeScope output policy governor
- e037f98 Add SafeScope confidence governance core
- 56793c7 Add SafeScope evidence sufficiency engine
- 1a3bae5 Add SafeScope causal risk reasoning core

Task:
Create a new SafeScope Source-Backed Applicability Governance Core under:

backend/src/safescope-v2/source-backed-applicability-governance/

Add these files:

1. backend/src/safescope-v2/source-backed-applicability-governance/source-backed-applicability-governance.types.ts
2. backend/src/safescope-v2/source-backed-applicability-governance/source-backed-applicability-governance.service.ts
3. backend/scripts/validate-safescope-source-backed-applicability-governance.ts

Then wire the source-backed applicability governance result into:

backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

Expose it on the SafeScope intelligence output without breaking existing output fields.

Required output shape:
- engine
- version
- applicabilitySupportLevel: supported | partially_supported | weak | unsupported
- jurisdictionSupport
  - detectedJurisdiction
  - jurisdictionClear
  - requiresJurisdictionConfirmation
  - reasons
- standardFamilySupport
  - canDiscussStandardFamily
  - supportedFamilies
  - blockedFamilies
  - reasons
- citationCandidateSupport
  - canDiscussCitationCandidate
  - citationCandidateMode: blocked | candidate_only_with_review | source_backed_candidate_with_review
  - candidates
  - blockedReasons
- sourceSupport
  - approvedKnowledgeAvailable
  - sourceBackedSignals
  - missingSourceNeeds
- applicabilityLimits
- requiredReviewerConfirmations
- decisionTrace
- advisoryGuardrails
  - advisoryOnly: true
  - doesNotDeclareViolation: true
  - doesNotCreateCitation: true
  - requiresQualifiedReview: true

Implementation requirements:
- Use evidence sufficiency as the first gate.
- Use confidence governance and output policy as language/permission gates.
- Use jurisdiction clarity as a required gate for any standard-family or citation-candidate support.
- Use approved knowledge/source-backed signals when available.
- If approved knowledge is absent, allow only standard-family discussion when evidence and jurisdiction are strong enough.
- If evidence is weak, jurisdiction is unclear, or output policy blocks standards, then block citation-candidate support.
- Citation candidates must never be presented as violations or citations.
- Citation-candidate support must always require qualified reviewer confirmation.
- Do not create persistent DB migrations.
- Do not write approved knowledge.
- Do not create a scenario bank.
- Do not depend on benchmark expected answers.

Validation script:
Create backend/scripts/validate-safescope-source-backed-applicability-governance.ts

It should instantiate:
- ObservationUnderstandingService
- CausalRiskService
- EvidenceSufficiencyService
- ConfidenceGovernanceService
- OutputPolicyService
- DefensibleCorrectiveActionService
- HumanReviewLearningGovernanceService
- SourceBackedApplicabilityGovernanceService

Use a small reasoning validation set only.

Include cases that prove:
1. Clear MSHA conveyor servicing without lockout can discuss standard family but cannot declare citation/violation.
2. Clear OSHA confined space entry can discuss standard family and requires applicability review.
3. Vague observation blocks standard-family and citation-candidate support.
4. Unclear jurisdiction blocks standard-family/citation-candidate support and asks for jurisdiction confirmation.
5. Weak evidence blocks citation-candidate support even if hazard family is likely.
6. Missing approved knowledge/source support limits citation-candidate language.
7. All outputs preserve advisory guardrails.

The validation should fail with process.exit(1) if any expected applicability-governance primitive is missing.

After implementation, run:

cd backend
npm run build
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
- SafeScope Source-Backed Applicability Governance Core added.
- It governs whether SafeScope can discuss standard families, citation candidates, and applicability reasoning.
- It uses evidence sufficiency, confidence governance, output policy, jurisdiction clarity, and source support as gates.
- It blocks unsupported citation-candidate language.
- It requires qualified reviewer confirmation for applicability and citation-candidate discussions.
- It is not a scenario memorization layer.
- Existing precision batches 001-003 remain green.
- HRLG, DCA, output policy, confidence governance, evidence sufficiency, and causal-risk validations remain green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note after the Human Review and Learning Governance note stating that the Source-Backed Applicability Governance Core is now the layer that controls whether SafeScope may discuss standard families or citation candidates.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed

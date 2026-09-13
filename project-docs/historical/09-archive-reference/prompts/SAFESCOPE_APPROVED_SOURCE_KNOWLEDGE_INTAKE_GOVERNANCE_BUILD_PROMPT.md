You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Approved Source Knowledge Intake Governance Core.

This layer controls whether external standards/source material is eligible to become an approved SafeScope knowledge candidate.

This is not a citation generator.
This is not a violation-declaration layer.
This is not automatic learning.
This is not a scenario memorization layer.
Do not create a 100-case baseline.
Do not create large scenario datasets.
Do not teach SafeScope answers to regurgitate.
Do not automatically promote source material into approved knowledge.

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove or weaken any existing guardrails.

Current committed checkpoint:
- 5030380 Add SafeScope source-backed applicability governance core
- 7f67cce Add SafeScope human review learning governance core
- 6ff13f9 Add SafeScope defensible corrective action core
- e49963a Add SafeScope output policy governor
- e037f98 Add SafeScope confidence governance core
- 56793c7 Add SafeScope evidence sufficiency engine
- 1a3bae5 Add SafeScope causal risk reasoning core

Task:
Create a new SafeScope Approved Source Knowledge Intake Governance Core under:

backend/src/safescope-v2/approved-source-knowledge-intake-governance/

Add these files:

1. backend/src/safescope-v2/approved-source-knowledge-intake-governance/approved-source-knowledge-intake-governance.types.ts
2. backend/src/safescope-v2/approved-source-knowledge-intake-governance/approved-source-knowledge-intake-governance.service.ts
3. backend/scripts/validate-safescope-approved-source-knowledge-intake-governance.ts

Then wire the approved-source-knowledge-intake-governance result into:

backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

Expose it on the SafeScope intelligence output without breaking existing output fields.

Required output shape:
- engine
- version
- intakeDecision: approved_candidate | needs_review | rejected | blocked
- sourceAuthority
  - agency
  - authorityTier: primary_regulation | official_guidance | consensus_standard | company_policy | unknown
  - jurisdiction
  - sourceUrl
  - citation
  - title
  - effectiveDate
  - revisionDate
  - sourceDateStatus: current | outdated | unknown
- sourceQuality
  - hasCitation
  - hasTitle
  - hasJurisdiction
  - hasEffectiveDate
  - hasRevisionDate
  - hasSourceUrl
  - qualityScore
- duplicateGovernance
  - possibleDuplicate
  - duplicateKeys
  - duplicateReasons
  - recommendedMergeAction: none | review_merge | reject_duplicate
- mappingGovernance
  - standardFamily
  - hazardFamilies
  - mechanisms
  - equipmentGroups
  - applicabilitySignals
  - mappingConfidence: high | moderate | low | insufficient
- reviewerRequirements
- blockedReasons
- governanceWarnings
- auditTrailRequirements
- decisionTrace
- advisoryGuardrails
  - advisoryOnly: true
  - doesNotDeclareViolation: true
  - doesNotCreateCitation: true
  - requiresQualifiedReview: true

Implementation requirements:
- Governance-only. Do not create DB migrations.
- Do not persist approved knowledge.
- Do not write to approved knowledge exports.
- Do not automatically promote source records.
- Require reviewer approval for any approved_candidate.
- Block or reject sources with unclear agency/jurisdiction/citation.
- Treat source freshness as unknown unless an effective/revision date is provided.
- Detect duplicates using citation, title, jurisdiction, standard family, and normalized source text.
- Support OSHA, MSHA, consensus standards, company policy, and unknown sources.
- Only primary regulation and official guidance may become approved_candidate without additional escalation.
- Consensus standards and company policies must remain needs_review unless explicitly approved later.
- Unknown authority must be blocked.
- Preserve advisory-only guardrails.

Validation script:
Create backend/scripts/validate-safescope-approved-source-knowledge-intake-governance.ts

It should instantiate:
- ApprovedSourceKnowledgeIntakeGovernanceService

Use a small reasoning validation set only.

Include cases that prove:
1. OSHA regulation with citation/title/jurisdiction/source URL can become approved_candidate but still requires reviewer approval.
2. MSHA regulation with citation/title/jurisdiction/source URL can become approved_candidate but still requires reviewer approval.
3. Unknown source authority is blocked.
4. Missing citation blocks or rejects intake.
5. Duplicate citation/title is flagged as possible duplicate and requires merge review.
6. Company policy is needs_review, not approved_candidate.
7. Consensus standard is needs_review, not approved_candidate.
8. Outdated or unknown date status adds governance warning.
9. All outputs preserve advisory guardrails.

The validation should fail with process.exit(1) if any expected governance primitive is missing.

After implementation, run:

cd backend
npm run build
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
- SafeScope Approved Source Knowledge Intake Governance Core added.
- It governs whether external source material can become an approved knowledge candidate.
- It checks authority tier, jurisdiction, citation, title, source URL, dates, duplicates, and mapping confidence.
- It blocks unknown or weak sources.
- It flags duplicates for merge review.
- It does not persist or automatically promote approved knowledge.
- Existing precision batches 001-003 remain green.
- SBAG, HRLG, DCA, output policy, confidence governance, evidence sufficiency, and causal-risk validations remain green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note after the Source-Backed Applicability Governance note stating that the Approved Source Knowledge Intake Governance Core controls whether external source material is eligible to become an approved knowledge candidate.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed

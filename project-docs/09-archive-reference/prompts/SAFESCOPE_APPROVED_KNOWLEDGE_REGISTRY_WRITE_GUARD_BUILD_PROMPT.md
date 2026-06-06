You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Approved Knowledge Registry Write Guard Core.

This layer is the final gate before any source-backed knowledge is eligible to be written into the approved knowledge registry.

This is not a citation generator.
This is not a violation-declaration layer.
This is not automatic learning.
This is not a scenario memorization layer.
Do not create a 100-case baseline.
Do not create large scenario datasets.
Do not teach SafeScope answers to regurgitate.
Do not automatically write approved knowledge.

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove or weaken any existing guardrails.

Current committed checkpoint:
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
Create a new SafeScope Approved Knowledge Registry Write Guard Core under:

backend/src/safescope-v2/approved-knowledge-registry-write-guard/

Add these files:

1. backend/src/safescope-v2/approved-knowledge-registry-write-guard/approved-knowledge-registry-write-guard.types.ts
2. backend/src/safescope-v2/approved-knowledge-registry-write-guard/approved-knowledge-registry-write-guard.service.ts
3. backend/scripts/validate-safescope-approved-knowledge-registry-write-guard.ts

Then wire the approved-knowledge-registry-write-guard result into:

backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

Expose it on the SafeScope intelligence output without breaking existing output fields.

Required output shape:
- engine
- version
- writeDecision: allow_write_candidate | hold_for_review | reject_write | blocked
- writePermission
  - canWriteApprovedKnowledge
  - canCreateDraftCandidate
  - canUpdateExistingRecord
  - canMergeDuplicate
  - requiresFinalReviewerApproval
- requiredInputs
  - sourceIntakeDecision
  - promotionDecision
  - reviewerApprovalPresent
  - auditTrailPresent
  - duplicateResolved
  - versioningPresent
  - changeReasonPresent
- registryRecordReadiness
  - readyForDraft
  - readyForApprovedRegistry
  - missingReadinessItems
- duplicateWriteGuard
  - possibleDuplicate
  - duplicateResolved
  - allowedAction: none | create_new | update_existing | merge_existing | reject_duplicate
  - reasons
- versioningGuard
  - requiresVersionIncrement
  - previousVersion
  - proposedVersion
  - changeReasonRequired
  - versioningWarnings
- reviewerApprovalGuard
  - approvalRequired
  - approvalPresent
  - approverRoleAccepted
  - requiredApproverRoles
  - approvalWarnings
- auditGuard
  - auditRequired
  - auditTrailPresent
  - requiredAuditFields
  - missingAuditFields
- blockedReasons
- governanceWarnings
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
- Use ASKIG and AKPWG outputs as gates.
- Require final qualified reviewer approval before approved-registry write.
- Require audit trail before approved-registry write.
- Require duplicate resolution before approved-registry write.
- Require versioning/change reason before update or merge.
- Allow draft candidate only when ASKIG/AKPWG are not blocked/rejected and enough source metadata exists.
- Block approved-registry write when:
  - ASKIG is blocked or rejected
  - AKPWG is blocked or rejected
  - reviewer approval is missing
  - audit trail is missing
  - duplicate is unresolved
  - versioning is missing for update/merge
  - change reason is missing for update/merge
  - advisory guardrails are missing or weakened
- Do not use violation/citation declaration language.
- Preserve advisory-only guardrails.

Validation script:
Create backend/scripts/validate-safescope-approved-knowledge-registry-write-guard.ts

It should instantiate:
- ApprovedSourceKnowledgeIntakeGovernanceService
- ApprovedKnowledgePromotionWorkflowGovernanceService
- ApprovedKnowledgeRegistryWriteGuardService

Use a small reasoning validation set only.

Include cases that prove:
1. Fully approved OSHA primary regulation with reviewer approval, audit trail, no duplicate, and versioning can become allow_write_candidate.
2. Approved source without reviewer approval is hold_for_review or blocked for approved-registry write.
3. Unknown/rejected source intake blocks write.
4. Duplicate unresolved blocks write or requires merge review.
5. Update/merge without version increment or change reason blocks write.
6. Draft candidate can be allowed when source and promotion are reviewable but final approval is missing.
7. Missing audit trail blocks approved-registry write.
8. All outputs preserve advisory guardrails.

The validation should fail with process.exit(1) if any expected write-guard primitive is missing.

After implementation, run:

cd backend
npm run build
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
- SafeScope Approved Knowledge Registry Write Guard Core added.
- It is the final governance gate before approved knowledge can be written.
- It requires ASKIG/AKPWG approval, reviewer approval, audit trail, duplicate resolution, versioning, and change reason.
- It can allow draft candidates separately from approved-registry writes.
- It blocks unsafe or unreviewed approved-knowledge writes.
- It does not persist or automatically promote approved knowledge.
- Existing precision batches 001-003 remain green.
- AKPWG, ASKIG, SBAG, HRLG, DCA, output policy, confidence governance, evidence sufficiency, and causal-risk validations remain green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note after the Approved Knowledge Promotion Workflow Governance note stating that the Approved Knowledge Registry Write Guard is the final gate before any knowledge can be written to the approved registry.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed

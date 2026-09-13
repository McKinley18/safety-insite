You are working in the Sentinel Safety repo.

Goal:
Run an autonomous SafeScope source-backed knowledge expansion sprint.

You have permission to inspect, edit, add files, run builds, run validators, diagnose failures, patch failures, rerun validation, and commit only when everything passes.

Do not ask for manual input.
Do not stop after creating only a plan.
Do not stop after the first failure; diagnose and fix failures automatically.
Do not push.
Do not deploy.
Do not use external network calls.
Do not create DB migrations.
Do not invent OSHA/MSHA regulatory text.
Do not fabricate citations.
Do not mark any new source record as approved unless it is explicitly a test fixture and clearly non-production.
Do not automatically promote source material into approved knowledge.
Do not write runtime approved knowledge.
Do not weaken advisory-only guardrails.

SafeScope remains advisory-only:
- advisoryOnly: true
- doesNotDeclareViolation: true
- doesNotCreateCitation: true
- requiresQualifiedReview: true

Current repo checkpoint:
- b21c3a2 Add SafeScope AI foundation completion scaffolds
- Master validation runner exists.
- Backend full validation recently passed 24/24.
- Frontend build recently passed.
- Working tree should be clean before this sprint begins.

Primary objective:
Move SafeScope from foundation-only toward source-backed knowledge readiness by adding multiple non-network, validation-first systems that support future official source ingestion and reviewer-controlled approved knowledge population.

Build these systems:

1. Source-backed knowledge candidate framework
Create:
- backend/src/safescope-v2/source-backed-knowledge-candidates/source-backed-knowledge-candidate.types.ts
- backend/src/safescope-v2/source-backed-knowledge-candidates/source-backed-knowledge-candidate.service.ts
- backend/scripts/validate-safescope-source-backed-knowledge-candidates.ts
- safescope-data/approved-knowledge/draft-candidates/machine-guarding-conveyor-loto-draft-candidates.v1.json

Requirements:
- Create draft_candidate records only.
- Never create approved records.
- Include at least 3 draft candidates:
  1. conveyor nip-point / guarding family
  2. conveyor maintenance / unexpected startup / energy control family
  3. conveyor cleanup / guard removed / exposure uncertainty family
- No invented quoted standard text.
- Every candidate must require qualified reviewer validation.
- Preserve advisory guardrails.

2. Registry IO validation
Create:
- backend/src/safescope-v2/approved-knowledge-registry/approved-knowledge-registry-io.service.ts
- backend/scripts/validate-safescope-approved-knowledge-registry-io.ts
- safescope-data/approved-knowledge/approved-knowledge-registry-validation-summary.v1.json

Requirements:
- Read approved registry and draft candidate JSON files.
- Validate with ApprovedKnowledgeRegistryValidator.
- Report approvedCount, draftCandidateCount, rejectedCount, retiredCount, invalidCount, duplicateKeyCollisions, advisoryGuardrailFailures.
- Do not promote drafts.
- Do not write approved registry.

3. Approved knowledge search/index scaffold
Create:
- backend/src/safescope-v2/approved-knowledge-search/approved-knowledge-search.types.ts
- backend/src/safescope-v2/approved-knowledge-search/approved-knowledge-search.service.ts
- backend/scripts/validate-safescope-approved-knowledge-search.ts
- safescope-data/approved-knowledge/search-index/README.md

Requirements:
- Build local in-memory search over approved registry records and draft candidates.
- Search by jurisdiction, agency, authorityTier, standardFamily, hazardFamily, mechanism, equipmentGroup, taskContext, applicability signal, evidence question.
- Draft candidates must return sourceUsability: draft_review_required.
- Rejected/retired records must be not_usable or excluded.
- Search for conveyor and lockout must return draft candidates.

4. Applicability retrieval adapter
Create:
- backend/src/safescope-v2/applicability-retrieval/applicability-retrieval.types.ts
- backend/src/safescope-v2/applicability-retrieval/applicability-retrieval.service.ts
- backend/scripts/validate-safescope-applicability-retrieval.ts

Requirements:
- Bridge observation understanding and approved knowledge search.
- Return retrievalDecision, matchedRecords, draftRecords, approvedRecords, requiredReviewerConfirmations, evidenceQuestions, applicabilityWarnings, advisoryGuardrails.
- Draft records can only be review-required context.
- Vague observation blocks retrieval.
- Unclear jurisdiction blocks or requires confirmation.

5. Reviewer approval workflow state machine
Create:
- backend/src/safescope-v2/approved-knowledge-review-workflow/review-workflow.types.ts
- backend/src/safescope-v2/approved-knowledge-review-workflow/review-workflow.service.ts
- backend/scripts/validate-safescope-approved-knowledge-review-workflow.ts

States:
- draft_candidate
- reviewer_assigned
- needs_more_source_support
- needs_mapping_revision
- approved_for_write_guard
- rejected
- retired

Rules:
- Approval requires reviewerId, reviewerRole, reviewedAt, changeReason.
- Only qualified_safety_reviewer, safety_manager, safety_director, or admin can approve.
- No transition writes approved knowledge.
- No transition bypasses AKRWG.

6. Knowledge freshness/review scheduler scaffold
Create:
- backend/src/safescope-v2/knowledge-freshness-review/knowledge-freshness-review.types.ts
- backend/src/safescope-v2/knowledge-freshness-review/knowledge-freshness-review.service.ts
- backend/scripts/validate-safescope-knowledge-freshness-review.ts

Requirements:
- Return reviewStatus, reviewPriority, reasons, nextReviewDue, reviewerRequirements, advisoryGuardrails.
- Unknown dates require review.
- Outdated records are stale.
- Draft candidates are review_due or unknown_date.
- Retired/rejected records are not usable.

7. Evidence-question generation adapter
Create:
- backend/src/safescope-v2/evidence-question-generation/evidence-question-generation.types.ts
- backend/src/safescope-v2/evidence-question-generation/evidence-question-generation.service.ts
- backend/scripts/validate-safescope-evidence-question-generation.ts

Requirements:
- Generate practical field questions.
- Conveyor guarding observation asks about guard location, exposure, energy state, lockout, task, and operating status.
- Vague observation asks broad clarification questions.
- Confined space observation asks atmospheric/permit/attendant/rescue questions when domain scaffold exists.
- Do not declare violation/citation.

8. Corrective-action control family mapping scaffold
Create:
- backend/src/safescope-v2/corrective-action-control-map/corrective-action-control-map.types.ts
- backend/src/safescope-v2/corrective-action-control-map/corrective-action-control-map.service.ts
- backend/scripts/validate-safescope-corrective-action-control-map.ts

Requirements:
- Map hazards/mechanisms to defensible control families.
- Conveyor nip-point prioritizes guarding/physical barrier/verification.
- Conveyor maintenance unexpected startup prioritizes energy isolation/LOTO verification.
- Fall exposure prioritizes guardrail/cover/fall protection verification.
- Weak action like “be careful” is flagged as weak.

9. Governance report adapter enhancement
Update existing governance report adapter:
- backend/src/safescope-v2/governance-report-adapter/governance-report-adapter.service.ts
- backend/scripts/validate-safescope-governance-report-adapter.ts

Enhance it to include:
- applicability retrieval summary
- evidence question summary
- corrective-action control family summary
- source usability warning
- reviewer workflow warning

10. Master validation runner
Update:
- backend/scripts/run-safescope-full-validation.ts

Add validators:
- validate-safescope-source-backed-knowledge-candidates.ts
- validate-safescope-approved-knowledge-registry-io.ts
- validate-safescope-approved-knowledge-search.ts
- validate-safescope-applicability-retrieval.ts
- validate-safescope-approved-knowledge-review-workflow.ts
- validate-safescope-knowledge-freshness-review.ts
- validate-safescope-evidence-question-generation.ts
- validate-safescope-corrective-action-control-map.ts

11. Orchestrator integration
Update:
- backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts

Expose compact foundation outputs only:
- sourceBackedKnowledgeCandidateFoundation
- approvedKnowledgeSearchFoundation
- applicabilityRetrievalFoundation
- reviewWorkflowFoundation
- knowledgeFreshnessFoundation
- evidenceQuestionFoundation
- correctiveActionControlMapFoundation

Do not break existing fields.

12. Documentation
Update:
- project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md
- project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Archive this prompt into:
project-docs/09-archive-reference/prompts/SAFESCOPE_AUTONOMOUS_SOURCE_BACKED_KNOWLEDGE_EXPANSION_PROMPT.md

Do not commit unless all validation passes.

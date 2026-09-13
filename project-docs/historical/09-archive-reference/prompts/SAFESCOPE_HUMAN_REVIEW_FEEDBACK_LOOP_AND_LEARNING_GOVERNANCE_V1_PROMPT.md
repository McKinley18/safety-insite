You are continuing the Sentinel Safety / SafeScope backend build.

Goal:
Implement SafeScope Human Review Feedback Loop + Learning Governance v1.

Context:
SafeScope currently has:
- hazard taxonomy routing
- approved knowledge retrieval
- field output composer
- scenario expansion pack
- scenario evaluation scoring
- field evidence weighting and contradiction handling
- multi-hazard observation decomposition
- observation narrative synthesis
- cross-domain causal chain reasoning
- corrective action strategy ranking
- risk verification and residual risk reassessment
- targeted validation mode
- full validation passing at 50/50
- frontend build passing

New capability needed:
SafeScope must learn from qualified human review without automatically polluting approved knowledge.

The system should capture reviewer feedback from field assessments and classify it into governed learning outcomes:
- accepted as-is
- corrected classification
- corrected mechanism
- corrected scenario
- corrected standard family
- corrected corrective action
- missing evidence identified
- unsafe recommendation rejected
- duplicate/known issue
- candidate for approved knowledge promotion
- blocked from learning

Build the following:

1. Human Review Feedback System

Create:
backend/src/safescope-v2/human-review-feedback-loop/
  human-review-feedback-loop.types.ts
  human-review-feedback-loop.service.ts
  human-review-feedback-loop.validator.ts

The service should accept a review input object:

{
  observationText,
  originalRetrievalOutput,
  originalFieldOutput,
  reviewerRole,
  reviewerDecision,
  reviewerCorrections,
  reviewerNotes,
  correctedHazardFamily,
  correctedScenarioFamily,
  correctedMechanism,
  correctedStandardFamily,
  correctedActions,
  missingEvidenceNotes,
  unsafeOutputFlags,
  confidenceOverride,
  sourceReference,
  context
}

It should output:

{
  feedbackId,
  learningDisposition,
  reviewReliability,
  acceptedCorrections,
  rejectedCorrections,
  learningCandidates,
  blockedLearningReasons,
  duplicateSignals,
  governanceFlags,
  requiredFollowUp,
  recommendedValidatorUpdates,
  recommendedKnowledgeUpdates,
  auditTrail,
  advisoryBoundary
}

learningDisposition should be:
- accept_no_learning_needed
- create_reviewed_learning_candidate
- create_approved_knowledge_candidate
- update_validator_candidate
- hold_for_additional_review
- reject_learning
- block_unsafe_learning

2. Governance logic

The system must never directly write to approved knowledge.

It should:
- allow reviewer feedback to create candidates only
- block feedback that tries to create citation/violation declarations without approved source support
- block unsupported legal claims
- block vague feedback without enough detail
- mark source-backed corrections as higher reliability
- mark qualified reviewer corrections as higher reliability
- mark conflicting reviewer feedback as hold_for_additional_review
- identify duplicate feedback against existing patterns where possible

3. Integration

Wire the review feedback loop into the SafeScope v2 reasoning path in a governed way.

Do not make it required for normal retrieval.

Add optional fields/types so future UI can submit review feedback.

Integrate with existing approved knowledge promotion / registry governance if those services exist.

The system should produce learning candidates, not approved records.

4. Validation

Create:
backend/scripts/validate-safescope-human-review-feedback-loop-v1.ts

Validation cases must include:
- accepted output with no learning needed
- reviewer corrects hazard family
- reviewer corrects corrective action
- reviewer flags unsafe recommendation
- reviewer provides missing evidence notes
- vague feedback is held or rejected
- unsupported citation/violation claim is blocked
- source-backed correction creates approved knowledge candidate
- duplicate feedback is detected or marked
- conflicting reviewer notes require additional review

Add this validator to:
backend/scripts/run-safescope-full-validation.ts

Add it to targeted validation runner areas:
- core
- governance
- output if appropriate
- orchestrator if appropriate

5. Documentation

Update:
project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md
project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md
project-docs/04-safescope-engine/SAFESCOPE_AI_TRANSITION_GAP_MAP.md
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Archive this prompt to:
project-docs/09-archive-reference/prompts/SAFESCOPE_HUMAN_REVIEW_FEEDBACK_LOOP_AND_LEARNING_GOVERNANCE_V1_PROMPT.md

6. Validation required before commit

Run:
cd backend
npm run validate:safescope:targeted:core
npm run validate:safescope:targeted:governance
npm run validate:safescope:targeted:output
npm run validate:safescope:targeted:orchestrator
npm run build
npm run validate:safescope:full

Then:
cd ../frontend-next
npm run build

Before committing:
- If precision benchmark files changed only by generatedAt timestamp, restore them.
- Do not commit timestamp-only benchmark churn.

Commit locally only:
git add relevant files
git commit -m "Add SafeScope human review feedback loop and learning governance v1"

Do not push.

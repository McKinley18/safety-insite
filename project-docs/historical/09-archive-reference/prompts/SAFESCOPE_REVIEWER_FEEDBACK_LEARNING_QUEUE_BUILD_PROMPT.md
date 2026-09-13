You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 13 local commits.
- HEAD commit is 75cef6c Add SafeScope citation-level candidate review.
- Recent completed SafeScope layers:
  - observation understanding brain
  - semantic routing guard
  - semantic conflict gauntlet
  - scenario intelligence layer
  - scenario family knowledge registry
  - standard family candidate mapper
  - corrective action reasoning brain
  - evidence gap question generator
  - field realism regression gauntlet v3
  - normalized observation context
  - approved source governance
  - citation-level candidate review
- Do not push or deploy.

Goal:
Build the SafeScope reviewer feedback learning queue.

Purpose:
SafeScope now has deterministic scenario reasoning, governed source provenance, and citation-level review candidates. The next step toward AI maturity is a governed reviewer feedback queue that captures human review decisions and improvement signals without automatically mutating SafeScope's active knowledge.

This queue should let reviewers flag useful, incorrect, missing, too-generic, unsafe, or ambiguous SafeScope outputs. Feedback must be stored as pending learning signals that can later be reviewed, approved, rejected, or promoted into governed registries.

Requirements:
1. Inspect the existing SafeScope v2 structure before changing anything.
2. Identify existing files related to:
   - scenario intelligence
   - scenario family knowledge registry
   - standard-family candidate mapper
   - citation-level candidate review
   - corrective action reasoning brain
   - evidence gap question generator
   - normalized observation context
   - approved source governance
   - regulatory brain
   - evidence brain
   - intelligence orchestrator
   - SafeScope output types
   - validation scripts
   - benchmark JSON files
   - audit markdown reports
3. Create a reviewer feedback learning queue model and service.
4. Feedback queue records should support:
   - id
   - createdAt
   - reviewerId or reviewerRole
   - sourceObservationId or traceId
   - rawObservation
   - normalizedObservationContextSnapshot
   - scenarioFamilyFeedback
   - standardFamilyCandidateFeedback
   - citationCandidateFeedback
   - correctiveActionFeedback
   - evidenceQuestionFeedback
   - missingHazardDomain
   - missingEquipmentContext
   - missingTaskContext
   - missingMechanismOfInjury
   - missingControlFailure
   - reviewerNotes
   - feedbackSeverity
   - recommendedDisposition
   - status
   - promotedToRegistryId
   - rejectedReason
   - advisoryGuardrails
5. Feedback statuses should include:
   - pending_review
   - accepted_for_review
   - promoted
   - rejected
   - duplicate
   - needs_more_information
6. Feedback types should include:
   - correct
   - incorrect
   - partially_correct
   - too_generic
   - unsafe_or_misleading
   - missing
   - unnecessary
   - helpful
   - unclear
7. The feedback queue must not directly mutate:
   - scenario-family knowledge registry
   - standard-family mapper
   - citation-level candidates
   - approved source governance records
   - corrective action registry
   - evidence question registry
8. The service should provide deterministic helper methods to:
   - create a feedback record from a SafeScope output snapshot
   - classify feedback severity
   - identify whether the feedback could affect safety-critical reasoning
   - recommend disposition
   - detect likely duplicate feedback
   - summarize pending learning signals for human review
9. Wire feedback queue types into SafeScope output or trace structures where practical so future frontend/reporting work can reference the traceId/output snapshot.
10. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
11. The reviewer feedback learning queue must never:
   - automatically modify active reasoning registries
   - treat reviewer feedback as an approved source
   - declare that a violation occurred
   - issue or simulate a citation
   - override qualified professional review
   - remove or weaken existing advisory guardrails
12. Add or update validation scripts to prove:
   - feedback records can be created from output snapshots
   - feedback severity is classified deterministically
   - safety-critical feedback is flagged for review
   - duplicate feedback is detected
   - feedback does not mutate active registries
   - pending/promoted/rejected statuses behave correctly
   - advisory guardrails remain present
   - existing citation-review, source-governance, normalized-context, scenario intelligence, standard-family, corrective-action, evidence-question, and field-realism validations still pass
13. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - readiness score
   - any remaining gaps
14. Commit locally only with the commit title:
Add SafeScope reviewer feedback learning queue

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15

You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 14 local commits.
- HEAD commit is 4e30911 Add SafeScope reviewer feedback learning queue.
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
  - reviewer feedback learning queue
- Do not push or deploy.

Goal:
Build the SafeScope intelligence output contract.

Purpose:
SafeScope now has many reasoning brains producing outputs. The next step is to create one stable, versioned output contract that guarantees every SafeScope result has a consistent shape for frontend display, report generation, audits, API clients, and future feedback/review workflows.

This contract should consolidate and standardize output sections without weakening any advisory guardrails.

Requirements:
1. Inspect the existing SafeScope v2 output types and orchestrator flow before changing anything.
2. Identify current output fields from:
   - observation context
   - observation understanding brain
   - semantic routing guard
   - semantic conflict gauntlet
   - scenario intelligence
   - scenario family knowledge registry
   - standard-family candidate mapper
   - citation-level candidate review
   - corrective action reasoning brain
   - evidence gap question generator
   - approved source governance/source trace
   - reviewer feedback queue/trace
   - confidence scoring
   - guardrails
   - audit/trace output
3. Create a versioned SafeScope intelligence output contract.
4. The contract should include at least:
   - contractVersion
   - engineVersion
   - generatedAt
   - traceId
   - inputSummary
   - observationContext
   - observationUnderstanding
   - semanticRouting
   - semanticConflicts
   - jurisdictionAssessment
   - scenarioIntelligence
   - scenarioFamilyMatches
   - standardFamilyReviewCandidates
   - citationLevelReviewCandidates
   - correctiveActionReasoning
   - evidenceGaps
   - followUpQuestions
   - approvedSourceTrace
   - reviewerFeedbackTrace
   - confidenceSummary
   - humanReviewSummary
   - advisoryGuardrails
   - auditTrace
5. Add compatibility helpers if needed so existing callers can still consume the previous output shape.
6. Wire the contract into the intelligence orchestrator output without breaking existing validations.
7. The contract should make it easy for the frontend to display:
   - simple summary mode
   - professional review mode
   - audit/debug mode
   - report-ready mode
8. Add a validation script that verifies:
   - all required contract sections exist
   - contractVersion is present
   - traceId is present
   - guardrails are present and true
   - citation-level candidates remain advisory-only
   - reviewer feedback trace does not self-modify active knowledge
   - evidence gaps and follow-up questions are separated
   - corrective actions are separated from standard/citation candidates
   - approved source trace is separated from advisory reasoning
   - compatibility with existing intelligence output is preserved
9. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
10. The output contract must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - say a specific regulation definitely applies without required evidence
   - treat reviewer feedback as approved knowledge
   - treat unapproved/deprecated/rejected source records as authoritative
   - remove or weaken existing advisory guardrails
11. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - readiness score
   - any remaining gaps
12. Commit locally only with the commit title:
Add SafeScope intelligence output contract

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15

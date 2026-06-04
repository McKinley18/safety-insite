You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 11 local commits.
- HEAD commit is 1eaba3b Add SafeScope normalized observation context.
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
- Do not push or deploy.

Goal:
Build the SafeScope approved source governance model.

Purpose:
SafeScope now has a strong deterministic reasoning architecture. The next step toward defensible AI classification is a governed approved-source model that controls how standards, regulatory references, agency guidance, internal safety knowledge, and citation candidates are stored, reviewed, versioned, deduplicated, deprecated, and used by SafeScope.

This model should support future approved knowledge intake and citation-level review while preventing SafeScope from absorbing unverified or outdated information.

Requirements:
1. Inspect the existing SafeScope v2 structure before changing anything.
2. Identify existing files related to:
   - approved knowledge context
   - regulatory brain
   - standard-family candidate mapper
   - scenario-family knowledge registry
   - evidence brain
   - reasoning orchestrator
   - intelligence orchestrator
   - SafeScope output types
   - knowledge pipeline validation scripts
   - benchmark output JSON files
   - audit markdown reports
3. Create an approved source governance model and registry/service.
4. Approved source governance records should support:
   - id
   - title
   - sourceType
   - agency
   - jurisdiction
   - industryScope
   - authorityTier
   - sourceUrl or sourceReference
   - citation
   - citationFamily
   - standardFamily
   - effectiveDate
   - lastReviewedDate
   - nextReviewDueDate
   - approvalStatus
   - approvedBy
   - version
   - supersedes
   - supersededBy
   - deprecated
   - duplicateOf
   - duplicateRiskSignals
   - applicabilityNotes
   - evidenceRequiredBeforeUse
   - prohibitedUses
   - advisoryGuardrails
   - traceNotes
5. Approval statuses should include at least:
   - draft
   - pending_review
   - approved
   - deprecated
   - rejected
6. Authority tiers should distinguish:
   - primary_regulation
   - official_agency_guidance
   - consensus_standard_reference
   - company_policy
   - internal_interpretive_note
   - unapproved_reference
7. The model must make it clear that only approved records can be used for stronger SafeScope reasoning. Draft, rejected, deprecated, or unapproved records may be stored but must not be used as authoritative output.
8. Wire the governance model into the regulatory brain and/or approved knowledge context flow where practical without breaking existing behavior.
9. SafeScope output should be able to expose approved-source trace information for audit/debug use when source-backed reasoning is present.
10. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
11. The approved source governance model must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - treat unapproved records as authoritative
   - use deprecated or rejected records as active authority
   - override qualified professional review
12. Add or update validation scripts to prove:
   - approved records can be identified and used as advisory source context
   - draft/pending/rejected/deprecated records are not treated as authoritative
   - duplicate/superseded records are flagged
   - evidence requirements are preserved
   - advisory guardrails are preserved
   - existing scenario intelligence, standard-family, corrective-action, evidence-question, normalized-context, and field-realism validations still pass
13. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - readiness score
   - any remaining gaps
14. Commit locally only with the commit title:
Add SafeScope approved source governance model

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15

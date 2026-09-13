You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- HEAD commit is 1d3fddf Add SafeScope approved source expansion.
- Recent completed SafeScope layers:
  - canonical pipeline map
  - risk reasoning brain
  - risk display/report integration
  - approved source governance
  - approved source population expansion
  - citation-level candidate review
  - standard-family candidate mapper
  - scenario-family knowledge registry
- Do not push.
- Do not deploy.

Goal:
Build SafeScope citation evidence-gate hardening.

Purpose:
SafeScope now has approved source records and citation-level candidate review. The next step is to harden citation candidate logic so SafeScope only elevates citation-level candidates when required evidence gates are satisfied or clearly listed as missing.

This should improve regulatory matching accuracy while preventing overclaiming.

Requirements:
1. Inspect the current SafeScope citation/source architecture before changing anything.
2. Identify current files related to:
   - backend/src/safescope-v2/brain/citation-review-brain
   - backend/src/safescope-v2/brain/source-governance
   - backend/src/safescope-v2/brain/standard-family-mapper
   - backend/src/safescope-v2/brain/scenario-intelligence
   - backend/src/safescope-v2/brain/observation-context
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/orchestration/contract/pipeline.registry.ts
   - backend/src/safescope-v2/types/safescope-intelligence.types.ts
   - backend/scripts/validate-citation-review-brain.ts
   - backend/scripts/validate-source-governance.ts
   - backend/scripts/validate-safescope-canonical-pipeline-map.ts
3. Create or extend citation evidence gate logic.
4. Evidence gates should evaluate at least:
   - jurisdictionConfirmed
   - agencyScopeConfirmed
   - industryScopeConfirmed
   - equipmentConfirmed
   - taskContextConfirmed
   - hazardConditionConfirmed
   - employeeExposureConfirmed
   - controlFailureConfirmed
   - operationalStateConfirmed
   - energySourceConfirmed
   - standardFamilyAligned
   - approvedSourceConfirmed
   - nonApplicabilityIndicatorsAbsent
   - citationEvidenceRequirementsSatisfied
5. Citation candidate output should clearly separate:
   - satisfiedEvidence
   - missingEvidence
   - conflictingEvidence
   - nonApplicabilityConcerns
   - confidenceImpact
   - reviewRequiredReason
   - advisoryGuardrails
6. Evidence-gate decisions should support outcomes such as:
   - eligible_for_review
   - limited_review_candidate
   - insufficient_evidence
   - blocked_by_non_applicability
   - blocked_by_source_governance
   - blocked_by_conflict
7. If evidence is incomplete, SafeScope may still show a candidate only as a low-confidence review candidate with missing evidence clearly listed.
8. If source governance is not approved, deprecated, rejected, draft, or pending, do not treat the candidate as authoritative.
9. If non-applicability indicators are present, downgrade or block the candidate as appropriate.
10. Preserve all advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
11. The evidence-gate hardening must never:
   - declare a violation
   - issue or simulate a citation
   - present citation candidates as final determinations
   - hide missing/conflicting evidence
   - treat unapproved records as authoritative
   - override qualified professional review
12. Add or update validation scripts to prove:
   - clear complete observations produce eligible review candidates
   - vague observations become insufficient_evidence or limited_review_candidate
   - conflicting observations are blocked_by_conflict or downgraded
   - non-applicability indicators downgrade or block candidates
   - unapproved/deprecated/rejected source records are blocked
   - missing evidence is clearly listed
   - guardrails are preserved
   - approved source expansion still validates
   - source governance validation still passes
   - canonical pipeline validation still passes
13. Run relevant validations:
   - citation review validation
   - source governance validation
   - approved source expansion validation if added
   - canonical pipeline validation
   - frontend build only if frontend code is touched
14. Commit locally only with the commit title:
Harden SafeScope citation evidence gates

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8

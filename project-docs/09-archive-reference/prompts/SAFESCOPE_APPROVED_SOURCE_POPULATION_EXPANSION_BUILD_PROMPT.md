You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is synced with origin/main.
- HEAD commit is 9da0c27 Fix frontend SafeScope backend type imports.
- Frontend build passed locally.
- Vercel deployment should be clean or in progress.
- Recent completed SafeScope layers:
  - canonical pipeline map
  - risk reasoning brain
  - risk display/report integration
  - approved source governance
  - citation-level candidate review
  - standard-family candidate mapper
  - scenario-family knowledge registry
  - intelligence output contract
  - frontend display integration
- Do not push.
- Do not deploy.

Goal:
Build the SafeScope approved source population expansion.

Purpose:
SafeScope now has source governance, citation-level candidate review, standard-family matching, and risk reasoning. The next step is to populate the approved source system with a starter set of governed source records so SafeScope can reason from more defensible, source-backed regulatory knowledge.

This should improve future hazard-to-standard matching, citation-level review, evidence requirements, and corrective action relevance while preserving advisory-only guardrails.

Requirements:
1. Inspect the current SafeScope source governance and approved knowledge structure before changing anything.
2. Identify existing files related to:
   - backend/src/safescope-v2/brain/source-governance
   - backend/src/safescope-v2/brain/citation-review-brain
   - backend/src/safescope-v2/brain/standard-family-mapper
   - backend/src/safescope-v2/knowledge-intake
   - backend/src/safescope-knowledge
   - backend/src/regulatory
   - backend/src/standards
   - backend/scripts/validate-source-governance.ts
   - backend/scripts/validate-citation-review-brain.ts
   - backend/scripts/validate-safescope-approved-knowledge-*
   - project-docs/05-source-intelligence
   - project-docs/08-audits
   - safescope-data/source-intelligence
3. Expand the approved source population in the safest existing registry/data structure.
4. Add starter approved source records for high-value safety families:
   - MSHA machine guarding / moving machine parts
   - MSHA mobile equipment / traffic / pedestrian interaction
   - MSHA electrical equipment / damaged electrical components
   - MSHA emergency access / fire protection readiness
   - OSHA machine guarding
   - OSHA hazardous energy / lockout-tagout
   - OSHA powered industrial truck / mobile equipment interaction
   - OSHA fall protection / elevated work
   - OSHA hazard communication / SDS / chemical exposure
   - OSHA electrical damaged cords / panels / energized parts
   - OSHA emergency exits / egress access
5. Each approved source record should include:
   - id
   - title
   - sourceType
   - agency
   - jurisdiction
   - industryScope
   - authorityTier
   - sourceReference or sourceUrl
   - citation
   - citationFamily
   - standardFamily
   - effectiveDate if known
   - lastReviewedDate
   - nextReviewDueDate
   - approvalStatus
   - approvedBy or reviewerRole
   - version
   - deprecated
   - duplicateOf
   - applicabilityNotes
   - evidenceRequiredBeforeUse
   - nonApplicabilityIndicators
   - prohibitedUses
   - advisoryGuardrails
   - traceNotes
6. Use only conservative, high-confidence starter records. If exact citation language or applicability is uncertain, mark the record as pending_review or draft rather than approved.
7. Approved records may support advisory candidate review, but must not cause SafeScope to declare violations or issue citations.
8. Wire the expanded records into existing source governance / citation review flow only where safe and consistent with current architecture.
9. Do not replace existing approved source governance; extend it.
10. Add or update validation scripts to prove:
   - approved records are recognized as approved source context
   - draft/pending/rejected/deprecated records are not treated as authoritative
   - citation-level candidates reference governed source IDs
   - evidence requirements are preserved
   - non-applicability indicators are preserved
   - advisory guardrails remain present
   - only approved records influence stronger advisory candidates
   - source expansion does not break existing citation review, source governance, canonical pipeline, risk reasoning, or frontend build
11. Add or update documentation summarizing the new starter source population, preferably:
   - project-docs/05-source-intelligence/SAFESCOPE_APPROVED_SOURCE_POPULATION_EXPANSION.md
12. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
13. The source population expansion must never:
   - declare a violation
   - issue or simulate a citation
   - treat uncertain records as approved
   - treat deprecated/rejected/draft/pending records as authoritative
   - override qualified professional review
14. Run relevant validations:
   - source governance validation
   - citation review validation
   - approved knowledge/source validation if available
   - canonical pipeline validation
   - frontend build only if frontend code is touched
15. Commit locally only with the commit title:
Add SafeScope approved source population expansion

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8

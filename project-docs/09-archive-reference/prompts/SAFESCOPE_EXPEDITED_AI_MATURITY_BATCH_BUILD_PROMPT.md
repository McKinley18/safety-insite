You are continuing the Sentinel Safety / SafeScope build.

Current objective:
Expedite SafeScope's evolution into a more intelligent AI-style safety system without sacrificing accuracy, governance, validation, or advisory guardrails.

Current verified state:
- Repository should be clean before starting.
- Recent completed SafeScope layers include:
  - observation understanding
  - normalized observation context
  - semantic routing/conflict handling
  - scenario intelligence
  - scenario-family knowledge
  - standard-family candidate mapper
  - citation-level candidate review
  - citation evidence gates
  - approved source governance
  - approved source starter expansion
  - risk reasoning brain
  - risk calibration benchmark
  - corrective action specificity/risk logic
  - evidence gap question generator
  - reviewer feedback UI
  - SafeScope intelligence display modes
  - tier entitlement polish
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Perform an expedited SafeScope AI maturity batch focused on four high-impact areas:
1. Report/PDF intelligence polish
2. Reviewer feedback review workflow foundation
3. Approved source expansion batch 2
4. Real-world field validation dataset foundation

Important:
Do not make one-off random additions. Build only the highest-value, accuracy-preserving pieces that move SafeScope toward a field-usable governed AI safety intelligence system.

Part A — Report/PDF intelligence polish:
1. Inspect current report generation/export files:
   - frontend-next/components/inspection/GenerateReportSection.tsx
   - frontend-next/lib/safescope/export/narrative-export.bridge.ts
   - frontend-next/lib/inspection/reportBuilder.ts
   - frontend-next/lib/reportStorage.ts
   - frontend-next/app/reports/page.tsx
   - backend/src/reports
   - backend/src/pdf
2. Improve report-ready structure where safe so SafeScope intelligence can appear clearly in final reports.
3. Report output should support:
   - finding summary
   - observed facts
   - SafeScope advisory scenario reasoning
   - risk reasoning summary
   - corrective action narrative
   - evidence gaps
   - standard/citation review candidates labeled as review candidates only
   - qualified review notice
   - audit appendix language if available
4. Do not redesign the full report system.

Part B — Reviewer feedback review workflow foundation:
1. Inspect:
   - frontend-next/components/safescope/panels/ReviewerFeedbackPanel.tsx
   - backend/src/safescope-v2/brain/reviewer-feedback-queue
   - backend/scripts/validate-reviewer-feedback-queue.ts
   - frontend-next/app/company/page.tsx
   - frontend-next/lib/planEntitlements.ts
2. Add a safe foundation for future review/admin workflow.
3. If a backend API is not stable, create a frontend-safe/local review queue placeholder that clearly states feedback is queued for qualified review and does not modify active knowledge.
4. Add Company/Admin future-facing review queue messaging if safe.
5. Do not allow automatic SafeScope learning or registry mutation.

Part C — Approved source expansion batch 2:
1. Inspect:
   - backend/src/safescope-v2/brain/source-governance
   - backend/src/safescope-v2/brain/citation-review-brain
   - backend/src/safescope-v2/brain/standard-family-mapper
   - safescope-data/source-intelligence
   - project-docs/05-source-intelligence
2. Add conservative starter source expansion records or documentation for additional high-value source families.
3. Prioritize:
   - MSHA guarding/moving parts
   - MSHA berms/roadways/mobile equipment
   - MSHA electrical
   - OSHA 1910 machine guarding
   - OSHA 1910 LOTO
   - OSHA 1910 electrical
   - OSHA 1926 fall protection
   - OSHA 1926 excavations/trenching if existing architecture supports it
   - OSHA HazCom/SDS
   - emergency access/egress
4. If exact citation applicability is uncertain, mark records as draft or pending_review, not approved.
5. Preserve source governance and evidence gates.

Part D — Real-world field validation dataset foundation:
1. Create a field validation dataset or template that supports future real inspection cases.
2. Include fields for:
   - observationText
   - photos/evidence references
   - siteType
   - jurisdiction
   - equipment
   - task
   - expectedHazardFamily
   - expectedMechanism
   - expectedRiskBand
   - expectedStandardFamily
   - expectedCitationCandidate if known
   - expectedCorrectiveActionTheme
   - evidenceGapsExpected
   - reviewerNotes
   - qualifiedReviewerDisposition
3. Add at least 10 seed field-validation cases based on existing SafeScope scenario families.
4. Create validation that checks schema and guardrails, not legal correctness.

Accuracy / governance requirements:
- Preserve all advisory guardrails:
  - advisoryOnly
  - doesNotDeclareViolation
  - doesNotCreateCitation
  - doesNotOverrideRegulation
  - requiresQualifiedReview
  - doesNotSelfModifyWithoutApproval
- Do not make SafeScope declare violations.
- Do not make SafeScope issue citations.
- Do not treat draft/pending/rejected/deprecated sources as authoritative.
- Do not hide evidence gaps.
- Do not weaken existing validations.
- Prefer additive, safe, validated improvements over risky rewrites.

Validation requirements:
Run all relevant validations touched by this batch:
- cd frontend-next && npm run build if frontend is touched
- reviewer feedback validation if touched
- source governance validation if touched
- citation review validation if touched
- risk calibration validation if touched
- canonical pipeline validation if touched
- any new field validation script if added

Documentation:
Add or update:
- project-docs/08-audits/SAFESCOPE_EXPEDITED_AI_MATURITY_BATCH.md

The document should summarize:
- what was improved
- what remains incomplete
- validation run
- next recommended batch

Commit:
Commit locally only with:
Expedite SafeScope AI maturity foundation

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -12

Do not push.
Do not deploy.

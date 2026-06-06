You are continuing the Sentinel Safety / SafeScope build.

Current objective:
Continue expediting SafeScope into a more intelligent, governed AI-style safety system without sacrificing accuracy, validation, or advisory guardrails.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 4 local commits.
- Frontend build passed after the expedited AI maturity batch.
- Recent completed local milestones:
  - Polish Sentinel tier entitlements
  - Polish SafeScope intelligence display modes
  - Expedite SafeScope AI maturity foundation
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Build SafeScope AI Maturity Batch 2 focused on operationalizing intelligence review and validation.

Batch 2 focus areas:
1. Reviewer feedback review/admin workflow foundation
2. Field validation scoring foundation
3. Report/PDF intelligence polish
4. Validation dashboard foundation

Important:
Prefer additive, safe, validated improvements. Do not perform risky rewrites. Do not weaken any guardrails. Do not let feedback automatically mutate active SafeScope knowledge.

Part A — Reviewer feedback review/admin workflow foundation:
1. Inspect:
   - frontend-next/components/safescope/panels/ReviewerFeedbackPanel.tsx
   - backend/src/safescope-v2/brain/reviewer-feedback-queue
   - backend/scripts/validate-reviewer-feedback-queue.ts
   - frontend-next/app/company/page.tsx
   - frontend-next/app/safescope/page.tsx
   - frontend-next/lib/planEntitlements.ts
2. Add a safe review/admin workflow foundation.
3. If a backend API is not stable, create a frontend-safe placeholder review queue section for Company/Admin future use.
4. It should show that feedback is:
   - queued
   - requires qualified review
   - does not modify active knowledge
   - can later become a learning candidate only after approval
5. Do not build full persistence unless already available and safe.

Part B — Field validation scoring foundation:
1. Inspect:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/scripts
   - project-docs/08-audits
2. Create a validation/scoring script if safe, such as:
   - backend/scripts/validate-safescope-field-validation-dataset.ts
   or
   - backend/scripts/score-safescope-field-validation-dataset.ts
3. The scoring should verify schema and expected fields, not claim legal correctness.
4. Score or check:
   - observationText present
   - expectedHazardFamily present
   - expectedMechanism present
   - expectedRiskBand present
   - expectedStandardFamily present where applicable
   - evidenceGapsExpected present
   - reviewer disposition fields present
   - advisory guardrails present
5. Add summary output showing:
   - total cases
   - valid cases
   - missing required field count
   - readiness status

Part C — Report/PDF intelligence polish:
1. Inspect:
   - frontend-next/components/inspection/GenerateReportSection.tsx
   - frontend-next/lib/safescope/export/narrative-export.bridge.ts
   - frontend-next/lib/inspection/reportBuilder.ts
   - frontend-next/lib/reportStorage.ts
   - frontend-next/app/reports/page.tsx
   - backend/src/reports
   - backend/src/pdf
2. Make safe, minimal improvements so SafeScope intelligence can appear more clearly in report sections.
3. Support labels such as:
   - SafeScope Advisory Summary
   - Risk Reasoning Summary
   - Corrective Action Narrative
   - Evidence Gaps / Follow-up Questions
   - Standards Review Candidates
   - Citation Review Candidates
   - Qualified Review Notice
4. Do not present citation candidates as final determinations.
5. Do not redesign the full report or PDF system.

Part D — Validation dashboard foundation:
1. Inspect:
   - frontend-next/app/analytics/page.tsx
   - frontend-next/app/safescope-knowledge/page.tsx
   - project-docs/08-audits
   - safescope-data/benchmarks
2. Add a lightweight validation/readiness summary foundation only if safe.
3. This may be a static/local data section showing:
   - benchmark alignment
   - risk calibration status
   - field validation dataset status
   - source governance status
   - reviewer feedback queue status
   - advisory guardrail status
4. Do not overclaim production readiness.
5. Clearly label static or placeholder status if not connected to live backend metrics.

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
- Do not allow feedback to directly change source records, registries, or active reasoning.
- Do not hide evidence gaps.
- Do not weaken existing validations.
- Do not break entitlement behavior.

Validation requirements:
Run all relevant validations touched by this batch:
- cd frontend-next && npm run build if frontend is touched
- reviewer feedback validation if touched
- field validation dataset script if added
- source governance validation if touched
- canonical pipeline validation if touched
- risk calibration validation if touched

Documentation:
Add or update:
- project-docs/08-audits/SAFESCOPE_AI_MATURITY_BATCH_2.md

The document should summarize:
- what was improved
- what remains incomplete
- validations run
- next recommended batch

Commit:
Commit locally only with:
Continue SafeScope AI maturity foundation

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -12

Do not push.
Do not deploy.

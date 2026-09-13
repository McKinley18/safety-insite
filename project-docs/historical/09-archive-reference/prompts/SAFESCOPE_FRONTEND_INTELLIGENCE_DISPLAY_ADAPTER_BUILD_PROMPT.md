You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 16 local commits.
- HEAD commit is a688e5d Add SafeScope report-ready narrative generator.
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
  - intelligence output contract
  - report-ready narrative generator
- Do not push or deploy.

Goal:
Build the SafeScope frontend intelligence display adapter.

Purpose:
SafeScope now has a stable intelligence output contract and report-ready narrative generator. The next step is to prepare the frontend to consume this structured intelligence without redesigning the UI yet.

Create a frontend adapter layer that maps the backend SafeScope intelligence contract into display-ready sections for inspection review, SafeScope output panels, final findings, reports, and future audit/debug views.

Requirements:
1. Inspect the current frontend and backend structure before changing anything.
2. Identify existing files related to:
   - frontend SafeScope page
   - inspection workflow SafeScope output
   - inspection review page
   - finding review/finalize components
   - report generation components
   - SafeScope result rendering components
   - shared UI components
   - backend SafeScope intelligence output contract
   - report-ready narrative generator output
3. Create frontend-safe types for the SafeScope intelligence display model.
4. Create an adapter function/service that maps the backend intelligence contract into display-ready sections.
5. The display adapter should support sections for:
   - SafeScope Summary
   - What SafeScope Detected
   - Scenario Reasoning
   - Evidence Needed
   - Recommended Follow-Up Questions
   - Corrective Action Reasoning
   - Standards Review Candidates
   - Citation Review Candidates
   - Report-Ready Narrative
   - Approved Source Trace
   - Audit Trace
   - Confidence Summary
   - Qualified Review Notice
6. The adapter should support display modes:
   - simple
   - professional
   - audit
   - report
7. The adapter should preserve clear separation between:
   - observed facts
   - inferred reasoning
   - evidence gaps
   - follow-up questions
   - corrective actions
   - standard-family candidates
   - citation-level candidates
   - approved source trace
   - audit/debug information
8. The adapter must preserve all advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
9. The frontend display language must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - say a specific regulation definitely applies without required evidence
   - treat citation candidates as final determinations
   - treat reviewer feedback as approved knowledge
   - hide qualified-review requirements
10. Wire the adapter into the most appropriate frontend SafeScope/inspection display location without doing a full redesign.
11. Keep existing UI behavior working. Avoid large visual redesigns in this step.
12. Add lightweight validation or type-check coverage to prove:
   - the adapter handles complete SafeScope output
   - the adapter handles partial/missing sections safely
   - display modes produce expected section visibility
   - guardrails remain visible
   - citation candidates remain advisory
   - report-ready narrative is available for report flow
13. Run all relevant local validations:
   - frontend type check/build if available
   - backend validation if touched
   - any existing SafeScope validation scripts affected
14. Report:
   - files changed
   - validations run
   - pass/fail status
   - any remaining gaps
15. Commit locally only with the commit title:
Add SafeScope frontend intelligence display adapter

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15

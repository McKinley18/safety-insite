You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 17 local commits.
- HEAD commit is 35a20de Add SafeScope frontend intelligence display adapter.
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
  - frontend intelligence display adapter
- Do not push or deploy.

Goal:
Build SafeScope frontend intelligence display panels.

Purpose:
The frontend now has an adapter that maps the backend SafeScope intelligence contract into display-ready sections. The next step is to create reusable frontend display panels that can render these sections in the inspection/SafeScope workflow without doing a full UI redesign.

This should make the new AI-style intelligence visible in a professional, controlled, and advisory-safe way.

Requirements:
1. Inspect the current frontend structure before changing anything.
2. Identify files related to:
   - frontend-next/lib/safescope/adapters/intelligence-display.adapter.ts
   - SafeScope result rendering components
   - inspection workflow SafeScope output
   - inspection review page
   - finding review/finalize components
   - reports/final report generation components
   - shared UI components/cards/badges/buttons
3. Create reusable frontend display components for SafeScope intelligence sections.
4. Add components for at least:
   - SafeScopeIntelligenceSummaryPanel
   - SafeScopeScenarioReasoningPanel
   - SafeScopeEvidenceQuestionsPanel
   - SafeScopeCorrectiveActionPanel
   - SafeScopeStandardsReviewPanel
   - SafeScopeCitationReviewPanel
   - SafeScopeReportNarrativePanel
   - SafeScopeAuditTracePanel
   - SafeScopeQualifiedReviewNotice
5. Components should consume the frontend intelligence display adapter output, not raw backend objects directly.
6. Components should support display modes where practical:
   - simple
   - professional
   - audit
   - report
7. Keep design consistent with existing Sentinel Safety UI:
   - dark navy / slate professional look
   - clean cards or panels
   - clear section headers
   - readable spacing
   - no large redesign
8. Preserve clear separation between:
   - observed facts
   - inferred reasoning
   - evidence gaps
   - follow-up questions
   - corrective actions
   - standard-family review candidates
   - citation-level review candidates
   - approved source trace
   - audit/debug information
9. Guardrail language must remain visible, especially:
   - advisory only
   - qualified review required
   - does not declare violation
   - does not issue citation
10. Frontend display must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - present citation candidates as final determinations
   - hide evidence gaps
   - hide qualified-review requirements
   - treat reviewer feedback as approved knowledge
11. Wire the panels into the most appropriate SafeScope/inspection display location without a full redesign.
12. If full wiring is risky, add the components and a single safe integration point or preview/demo section while preserving existing behavior.
13. Add lightweight frontend validation or type-check coverage to prove:
   - panels compile
   - panels handle empty/missing data safely
   - panels use adapter output
   - guardrail notice renders
   - citation candidates remain labeled as review candidates
14. Run all relevant local validations:
   - frontend type check/build if available
   - backend validation only if backend is touched
   - any affected SafeScope validation scripts
15. Report:
   - files changed
   - validations run
   - pass/fail status
   - any remaining gaps
16. Commit locally only with the commit title:
Add SafeScope intelligence display panels

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15

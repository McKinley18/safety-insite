You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 18 local commits.
- HEAD commit is 443c234 Add SafeScope intelligence display panels.
- Recent completed SafeScope layers:
  - frontend intelligence display adapter
  - frontend intelligence display panels
  - report-ready narrative generator
  - intelligence output contract
  - reviewer feedback learning queue
  - citation-level candidate review
  - approved source governance
  - normalized observation context
  - evidence gap question generator
  - corrective action reasoning brain
  - standard family candidate mapper
  - scenario family knowledge registry
  - scenario intelligence layer
- Do not push or deploy.

Goal:
Wire SafeScope intelligence display panels into the inspection review flow.

Purpose:
SafeScope now has a frontend display adapter and reusable intelligence panels. The next step is to make the new intelligence visible in the inspection/SafeScope workflow at the right point without doing a full UI redesign.

Requirements:
1. Inspect the current frontend structure before changing anything.
2. Identify files related to:
   - frontend-next/components/safescope/panels/IntelligencePanel.tsx
   - frontend-next/lib/safescope/adapters/intelligence-display.adapter.ts
   - inspection review page
   - inspection workflow page
   - SafeScope result rendering components
   - finding review/finalize components
   - report-ready narrative/final report components
3. Wire the SafeScope intelligence panels into the most appropriate existing inspection/SafeScope display location.
4. Prefer a safe integration point such as:
   - inspection review page
   - SafeScope review step
   - finding finalize section
   - SafeScope result output area
5. Do not redesign the whole UI.
6. Preserve existing workflow behavior.
7. Use the frontend intelligence display adapter output. Do not make the panels depend directly on raw backend objects unless unavoidable.
8. The UI should expose, where available:
   - SafeScope Summary
   - Scenario Reasoning
   - Evidence Needed
   - Recommended Follow-Up Questions
   - Corrective Action Reasoning
   - Standards Review Candidates
   - Citation Review Candidates
   - Report-Ready Narrative
   - Qualified Review Notice
9. Keep guardrail language visible:
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
11. Add graceful empty-state behavior when SafeScope intelligence data is missing or partial.
12. Add or update lightweight frontend validation/type coverage if appropriate.
13. Run relevant local validations:
   - frontend build or type check
   - backend validation only if backend is touched
14. Report:
   - files changed
   - validations run
   - pass/fail status
   - any remaining gaps
15. Commit locally only with the commit title:
Wire SafeScope intelligence panels into inspection flow

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15

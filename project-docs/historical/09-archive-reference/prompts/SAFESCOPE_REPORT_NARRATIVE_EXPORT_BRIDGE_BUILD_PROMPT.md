You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 19 local commits.
- HEAD commit is c477c2a Wire SafeScope intelligence panels into inspection flow.
- Recent completed SafeScope layers:
  - report-ready narrative generator
  - intelligence output contract
  - frontend intelligence display adapter
  - intelligence display panels
  - intelligence panels wired into inspection flow
- Do not push or deploy.

Goal:
Build the SafeScope report narrative export bridge.

Purpose:
SafeScope intelligence is now visible in the inspection flow. The next step is to make sure report-ready SafeScope narratives can be passed into the final finding/report generation path.

This is not a report redesign. It should create a bridge/adapter that safely maps SafeScope report-ready narrative data into finding finalization, report preview, and future PDF/export flows.

Requirements:
1. Inspect the current frontend and backend report/finding flow before changing anything.
2. Identify files related to:
   - report-ready narrative generator output
   - intelligence output contract
   - frontend intelligence display adapter
   - SafeScope intelligence display panels
   - inspection review page
   - finding finalize components
   - report generation components
   - report preview/final report components
   - executive summary/report narrative logic, if any
3. Create a report narrative export bridge or adapter.
4. The bridge should map SafeScope narrative fields into report-ready finding sections:
   - findingTitle
   - findingSummary
   - scenarioExplanation
   - mechanismOfInjuryNarrative
   - exposureNarrative
   - evidenceGapNarrative
   - followUpQuestionNarrative
   - standardFamilyReviewNarrative
   - citationCandidateReviewNarrative
   - correctiveActionNarrative
   - immediateActionNarrative
   - interimControlNarrative
   - permanentCorrectionNarrative
   - administrativeFollowUpNarrative
   - verificationNarrative
   - confidenceNarrative
   - qualifiedReviewDisclaimer
   - auditAppendixNarrative
5. The bridge should support output modes:
   - concise finding
   - professional report
   - audit appendix
6. The bridge should clearly separate:
   - observed facts
   - inferred reasoning
   - evidence gaps
   - corrective action recommendations
   - standard-family review candidates
   - citation-level review candidates
   - qualified-review disclaimer
   - audit trace
7. Wire the bridge into the safest existing frontend location, preferably:
   - finding finalize section
   - inspection review page
   - report generation/preview flow
8. Do not redesign the report UI.
9. Preserve existing report/finding behavior.
10. Add graceful empty-state behavior when SafeScope narrative data is missing or partial.
11. Preserve all advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
12. The bridge/display/export language must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - present citation candidates as final determinations
   - hide evidence gaps
   - hide qualified-review requirements
   - treat reviewer feedback as approved knowledge
13. Add or update lightweight frontend validation/type coverage if appropriate.
14. Run relevant local validations:
   - frontend build or type check
   - backend validation only if backend is touched
15. Report:
   - files changed
   - validations run
   - pass/fail status
   - any remaining gaps
16. Commit locally only with the commit title:
Add SafeScope report narrative export bridge

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15

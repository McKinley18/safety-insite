You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- HEAD commit is 06bef6a Polish Sentinel tier entitlements.
- Branch main is ahead of origin/main by 1 local commit.
- Frontend build passed.
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Polish SafeScope intelligence display modes.

Purpose:
SafeScope has many intelligence outputs: scenario reasoning, risk reasoning, standards/citation candidates, corrective actions, evidence gaps, reviewer feedback, guardrails, and report narratives. The next step is to make the UI easier to understand by organizing SafeScope output into clear display modes.

Display modes:
- simple
- professional
- audit
- report

Requirements:
1. Inspect the current SafeScope frontend display structure before changing anything.
2. Identify files related to:
   - frontend-next/components/safescope/panels/IntelligencePanel.tsx
   - frontend-next/components/safescope/panels/ReviewerFeedbackPanel.tsx if present
   - frontend-next/components/inspection/SafeScopeReasoningPanel.tsx
   - frontend-next/lib/safescope/adapters/intelligence-display.adapter.ts
   - frontend-next/lib/safescope/types
   - frontend-next/lib/planEntitlements.ts
   - frontend-next/app/safescope/page.tsx
   - frontend-next/app/inspection/page.tsx
   - frontend-next/app/inspection-review/page.tsx
3. Refine or add mode-aware SafeScope display logic.
4. Simple mode should prioritize:
   - summary
   - risk level
   - what to do now
   - evidence gaps/questions
   - qualified review notice
5. Professional mode should show:
   - scenario reasoning
   - risk drivers
   - corrective action reasoning
   - standard-family candidates
   - evidence questions
6. Audit mode should show:
   - citation review candidates
   - source/governance trace if available
   - confidence signals
   - audit trace
   - guardrails
   - reviewer feedback UI
7. Report mode should show:
   - report-ready narrative
   - finding summary
   - corrective action narrative
   - risk narrative
   - audit appendix/qualified review language where appropriate
8. Do not redesign the whole UI.
9. Preserve existing styling:
   - navy/slate professional look
   - compact readable panels
   - clear section headers
10. Preserve advisory guardrails:
   - advisory only
   - qualified review required
   - does not declare violation
   - does not issue citation
11. Do not hide evidence gaps.
12. Do not present citation candidates as final determinations.
13. Do not break reviewer feedback UI.
14. Keep entitlement/tier behavior intact.
15. Add or update lightweight frontend-safe types if needed.
16. Run:
   - cd frontend-next && npm run build
17. Commit locally only with:
Polish SafeScope intelligence display modes

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -10
18. Do not push or deploy.

You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is synced with origin/main.
- HEAD commit is ff1f5f9 Add SafeScope risk calibration benchmark.
- Recent completed SafeScope layers:
  - reviewer feedback learning queue backend
  - risk calibration benchmark
  - risk reasoning brain
  - corrective action risk logic hardening
  - citation evidence-gate hardening
  - approved source expansion
  - frontend intelligence display panels
  - report narrative export bridge
- Do not push.
- Do not deploy.

Goal:
Build SafeScope reviewer feedback UI.

Purpose:
SafeScope now has a governed reviewer feedback learning queue backend, but users need a frontend workflow to submit structured feedback on SafeScope outputs. This is a key step toward governed human-in-the-loop learning.

The UI must capture reviewer feedback without allowing SafeScope to self-modify or automatically change approved knowledge.

Requirements:
1. Inspect current frontend and backend feedback structures before changing anything.
2. Identify files related to:
   - backend/src/safescope-v2/brain/reviewer-feedback-queue
   - backend/scripts/validate-reviewer-feedback-queue.ts
   - frontend-next/components/safescope/panels/IntelligencePanel.tsx
   - frontend-next/components/inspection/SafeScopeReasoningPanel.tsx
   - frontend-next/lib/safescope/adapters/intelligence-display.adapter.ts
   - frontend-next/lib/safescope/types
   - frontend-next/lib/apiFetch.ts
   - frontend-next/app/inspection-review/page.tsx
   - frontend-next/app/safescope/page.tsx
   - frontend-next/app/company/page.tsx
   - frontend-next/lib/planEntitlements.ts
3. Create a frontend feedback component, such as:
   - SafeScopeReviewerFeedbackPanel
4. The feedback UI should allow reviewer/user selections for:
   - correct
   - incorrect
   - partially_correct
   - too_generic
   - wrong_standard_candidate
   - wrong_citation_candidate
   - wrong_risk_level
   - missing_hazard
   - missing_evidence_question
   - bad_corrective_action
   - helpful
   - unsafe_or_misleading
   - needs_qualified_review
5. The UI should allow optional notes.
6. The UI should allow selecting what part of SafeScope output the feedback relates to:
   - scenario_reasoning
   - risk_reasoning
   - standard_family_candidate
   - citation_review_candidate
   - corrective_action
   - evidence_question
   - report_narrative
   - overall_result
7. Preserve governance language:
   - feedback is queued for review
   - feedback does not automatically modify SafeScope knowledge
   - qualified review is required before knowledge changes
8. Wire the panel into a safe existing location:
   - SafeScope intelligence panel
   - inspection SafeScope result area
   - inspection review page
9. Use local state or an existing API path if available. If no stable backend API endpoint exists, create a safe frontend placeholder/storage adapter that does not break builds and clearly marks feedback as queued locally/pending backend wiring.
10. Do not build a full admin review dashboard yet.
11. Do not modify approved source records automatically.
12. Do not let reviewer feedback mutate active registries.
13. Add or update frontend-safe types if needed.
14. Add basic empty/error/success states.
15. Add entitlement awareness if easy:
   - Free/Pro can submit simple feedback
   - Company/Admin future users can access review queue later
   Do not block the build if full entitlement wiring is risky.
16. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
17. Run relevant validations:
   - cd frontend-next && npm run build
   - reviewer feedback validation if backend is touched
   - frontend type/build validation
18. Commit locally only with the commit title:
Add SafeScope reviewer feedback UI

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8

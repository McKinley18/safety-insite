You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- Branch main is synced with origin/main.
- HEAD commit is 05aa57e Add SafeScope reviewer feedback UI build prompt.
- Recent completed SafeScope layers:
  - reviewer feedback UI
  - risk calibration benchmark
  - corrective action specificity/risk logic
  - citation evidence gates
  - approved source expansion
  - risk reasoning and display
  - frontend intelligence panels
- Do not push.
- Do not deploy.

Goal:
Polish Sentinel Safety tier and entitlement structure.

Purpose:
SafeScope is now the core value engine of the app. The next step is to clearly define and enforce which features belong to Free, Pro, Company, and future Enterprise tiers, while preserving the existing Company-tier leadership/manager hub requirements.

Requirements:
1. Inspect current tier, entitlement, billing, auth, and UI structures before changing anything.
2. Identify files related to:
   - frontend-next/lib/planEntitlements.ts
   - frontend-next/app/company/page.tsx
   - frontend-next/app/settings/page.tsx
   - frontend-next/app/settings/workspace/page.tsx
   - frontend-next/app/safescope/page.tsx
   - frontend-next/app/safescope-knowledge/page.tsx
   - frontend-next/components/safescope
   - frontend-next/components/inspection
   - backend/src/auth/entitlements
   - backend/src/billing
   - backend/src/auth
   - backend/src/organizations
   - backend/src/corrective-actions
   - backend/src/reports
3. Create or refine a clear entitlement map for:
   - Free
   - Pro
   - Company
   - Enterprise/future
4. Entitlement map should include feature gates for:
   - inspection creation
   - report generation
   - SafeScope basic summary
   - SafeScope full reasoning
   - SafeScope risk reasoning
   - SafeScope citation review candidates
   - SafeScope report-ready narratives
   - SafeScope reviewer feedback submission
   - reviewer feedback queue/admin review
   - approved source governance/admin controls
   - company user management
   - role management
   - seat management
   - assigning inspections
   - assigning corrective actions
   - company analytics
   - workspace settings
   - custom risk matrix
   - company policy/source expansion future support
5. Preserve user’s known Company plan requirement:
   - Company plan must allow account owner/admin to add users, assign inspections, manage/purchase seats, assign roles, assign corrective actions/follow-ups/review tasks, and filter workspace/company data.
6. Do not break current pages.
7. Do not require live payments or external billing integration in this step.
8. Add clear UI messaging where practical:
   - feature available
   - upgrade required
   - Company feature
   - Enterprise/future feature
9. Keep the Vulcan promo/free Pro code behavior if present.
10. Avoid full UI redesign.
11. Add or update documentation:
   - project-docs/10-business-launch/strategy/tier-entitlement-map.md
   or similar
12. Add lightweight validation if appropriate:
   - entitlement map exports expected features
   - Company tier includes required leader/admin capabilities
   - Free tier does not include advanced SafeScope features
   - Pro tier includes individual SafeScope intelligence features
13. Run relevant validations:
   - cd frontend-next && npm run build if frontend is touched
   - backend validation only if backend runtime entitlement code is touched
14. Commit locally only with the commit title:
Polish Sentinel Safety tier entitlements

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8

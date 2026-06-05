You are auditing the current Sentinel Safety / SafeScope application.

IMPORTANT:
This is NOT the AI readiness manifest task.
Do NOT create another SAFESCOPE_AI_READINESS_MANIFEST.md.
Do NOT create or update backend/scripts/validate-ai-readiness.ts.
The required output file is:
project-docs/08-audits/SAFESCOPE_CURRENT_ARCHITECTURE_PRODUCT_MATURITY_AUDIT.md

Current state:
- GitHub main was recently rewritten to a clean checkpoint history.
- Current main includes the full Sentinel Safety app and SafeScope v2 AI-style reasoning foundation.
- Frontend build recently passed.
- Vercel deployment is clean.
- Repository is currently clean and HEAD is cb76b83 Add SafeScope AI readiness manifest.
- Do not push.
- Do not deploy.
- This is a read-only architecture/product maturity audit except for creating the audit report document.

Goal:
Analyze the current app structure, SafeScope architecture, frontend/reporting integration, tier/entitlement structure, and remaining work needed to move SafeScope closer to a true AI-style safety intelligence system.

Primary questions:
1. What is the current structure of the Sentinel Safety app?
2. What is the current structure of SafeScope v2?
3. Which SafeScope intelligence layers exist?
4. Which layers are actually wired into the orchestrator/output/frontend?
5. Which systems appear duplicated, stale, experimental, or disconnected?
6. What is missing for SafeScope to become a stronger AI-style safety intelligence system?
7. What is missing for accurate hazard identification?
8. What is missing for regulatory standard matching and citation-level review?
9. What is missing for corrective action reasoning?
10. What is missing for risk assessment?
11. What is missing for approved source governance and source population?
12. What is missing for reviewer feedback / governed learning?
13. What is missing for frontend usability and report generation?
14. What is missing for tier-based product packaging?
15. What should be built next, in order?

Audit scope:
- backend/src/safescope-v2
- backend/src/safescope
- backend/scripts/validate-safescope-*
- backend/scripts/verify-*
- backend/src/standards
- backend/src/regulatory
- backend/src/reports
- frontend-next/app
- frontend-next/components/inspection
- frontend-next/components/safescope
- frontend-next/lib/safescope
- frontend-next/lib/planEntitlements.ts
- project-docs
- safescope-data

Output requirements:
Create this exact file:
project-docs/08-audits/SAFESCOPE_CURRENT_ARCHITECTURE_PRODUCT_MATURITY_AUDIT.md

The report must include:
1. Executive summary
2. Current app structure
3. Current SafeScope architecture map
4. Current frontend integration map
5. Current reporting/export integration map
6. Current tier/entitlement structure
7. SafeScope AI maturity assessment
8. Strengths
9. Structural risks
10. Duplicated/stale/disconnected areas
11. Missing AI capabilities
12. Missing risk assessment capabilities
13. Missing regulatory/citation capabilities
14. Missing corrective action capabilities
15. Missing approved source capabilities
16. Missing feedback/learning capabilities
17. Missing frontend/reporting polish
18. Missing tier/product packaging polish
19. Recommended next build order
20. Specific first three build prompts to run next

Rules:
- Do not modify production code.
- Do not modify frontend code.
- Do not modify backend runtime code.
- Do not push.
- Do not deploy.
- Only create the audit markdown document.
- Commit locally with:
Add SafeScope architecture maturity audit

Before committing, show:
- git diff --stat
- files changed

After committing, show:
- git status
- git log --oneline -8

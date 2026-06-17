You are reviewing the current Sentinel_Safety repository, which is being transitioned into the InSite platform with HazLenz AI as the inspection intelligence engine.

Create a thorough technical and product blueprint for the current build.

Use the actual repository structure and code. Do not invent features. Clearly separate:
1. What currently exists
2. What appears partially implemented
3. What is legacy/internal naming
4. What is broken or risky
5. What should be done next

Product direction:
- The app/platform name should be InSite.
- The AI engine name should be HazLenz AI.
- Sentinel Safety, SafeScope, ReviewCore, AuditAlly, GuideGuard, SightSignal, and related names should be treated as legacy/internal unless intentionally retained in code.
- The product should remain inspection-first.
- It should be simple, professional, mobile-first, and easy for safety professionals to use.
- Do not recommend turning it into a bloated enterprise management platform.
- Lightweight personal organization is acceptable: in-progress inspections, corrective actions due, upcoming tasks, calendar/task reminders, and report work reminders.

Blueprint sections to produce:

A. Executive Summary
- What the app currently is
- What HazLenz AI currently appears capable of
- Current readiness level
- Biggest blockers

B. Repository Map
- Frontend structure
- Backend structure
- Important modules/files
- Legacy naming areas

C. Current User Flow
- Login/auth flow
- Command/home page
- Inspection start
- Hazard capture/observation entry
- HazLenz analysis
- Review/save
- Reports/analytics/actions/settings

D. HazLenz AI Flow
Trace the current intelligence path from frontend request to backend response:
- Request payload
- Controller route
- Service method
- Orchestrator/intelligence logic
- Knowledge registries
- Standards/candidate matching
- Corrective action generation
- Evidence gap generation
- Fallback/degraded paths
- Response object returned to frontend

E. Current Capabilities
List concrete current capabilities with file references:
- Hazard classification
- Jurisdiction detection
- Standard family candidates
- Evidence questions
- Corrective actions
- Risk/severity/likelihood
- Knowledge governance
- Advisory/legal guardrails
- Reporting/dashboard support

F. Known Issues and Risks
Identify:
- Anything that could cause HazLenz output to zero out
- Any frontend/backend contract mismatch
- Any broken imports/types/build risks
- Any stale brand names
- Any misleading AI claims
- Any missing degraded-state warnings
- Any local vs production environment risks

G. Inspection-First Product Assessment
Explain whether the current app still feels inspection-first.
Identify anything that feels overbuilt or distracting.
Recommend what to simplify, preserve, or delay.

H. Recommended Next Implementation Plan
Prioritize:
P0 - Stabilize HazLenz working output
P1 - Clean brand naming and UI language
P2 - Strengthen inspection review/report flow
P3 - Expand standards knowledge coverage
P4 - Add lightweight personal organization
P5 - Company/team features later only if needed

I. File-by-File Action Table
Create a table with:
- File path
- Current role
- Issue/opportunity
- Recommended action
- Priority

J. Final Recommendation
Give a practical path for making InSite/HazLenz marketable to safety professionals while staying inspection-first.

Output should be specific, technical, and grounded in the repository.

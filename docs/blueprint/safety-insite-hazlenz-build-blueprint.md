# Safety InSite / HazLenz AI Build Blueprint

## Product identity

- Platform name: Safety InSite
- AI engine name: HazLenz AI
- Legacy/internal names: SafeScope, Sentinel Safety, ReviewCore, GuideGuard, SightSignal, AuditAlly
- Customer-facing copy should use Safety InSite and HazLenz AI.
- Internal routes, database keys, and legacy compatibility names may remain until intentionally refactored.

## Product philosophy

Safety InSite is an inspection-first safety application. The app should help an individual inspector capture field observations, identify hazards, review HazLenz AI advisory reasoning, track corrective actions, and produce professional reports.

The app should stay smart and simple. It should not become a complex enterprise management platform, template-heavy audit suite, or overloaded dashboard.

## Core workflow

1. Start or continue an inspection.
2. Capture observation text, photos, and evidence notes.
3. Run HazLenz AI advisory analysis.
4. Review classification, risk, standards, evidence gaps, and corrective actions.
5. Finalize findings.
6. Generate a clean professional report.
7. Track corrective actions and follow-up tasks.

## HazLenz AI purpose

HazLenz AI should provide advisory inspection intelligence. It should classify hazard type, identify likely mechanisms of injury or exposure, suggest applicable standards, explain uncertainty, identify evidence gaps, propose corrective actions, and support report writing.

HazLenz AI must remain advisory. Final decisions require qualified human review.

## HazLenz AI reasoning model

HazLenz AI should reason through:

- Observed condition
- Equipment or environment involved
- Energy source or hazardous condition
- Failed, missing, or inadequate control
- Exposure pathway
- Potential injury, illness, environmental, or compliance consequence
- Applicable jurisdiction and standards
- Evidence gaps
- Immediate, interim, and permanent corrective actions
- Verification evidence

Example: an open used-oil container can spill, create a slip/trip/fall exposure, cause environmental release, require containment/labeling/housekeeping controls, and require verification evidence.

## Accuracy priorities

HazLenz AI should prefer specific hazard routing over generic routing.

Examples:

- Conveyor tail pulley with missing guard and cleanup near moving belt should route to machine guarding/conveyor cleanup/possible LOTO, not hot work.
- Generic words like work, workers, cleanup, or material should not trigger hot work unless welding, cutting, grinding, torch, flame, sparks, brazing, soldering, or hot-work permit evidence exists.
- Compressed gas standards should require positive cylinder/gas evidence.
- Housekeeping should not override more specific mechanical, electrical, fall, chemical, or mobile-equipment hazards when those hazards are clearly present.

## Standards strategy

HazLenz AI should use standards from traceable sources and expose standards through stable output fields used by the frontend.

Frontend display should support multiple backend shapes, including:

- primary standards
- supporting standards
- standard applicability results
- standards traceability
- standards match explanations
- AI evidence contract standards

## Output policy

Normal field inspection output should be concise and mobile-friendly.

Normal classify responses should include:

- classification
- confidence
- risk
- standards
- evidence gaps
- reviewer questions
- corrective actions
- decision explanation
- causal/risk summary
- report-ready advisory language

Normal classify responses should not include heavy developer/reviewer-console payloads unless debug mode is requested.

Hide or omit from normal output:

- pendingReviewerCandidates
- draftKnowledgeWarnings
- large debug internals
- duplicate raw reasoning blocks
- oversized knowledge dumps

## Memory and hosting requirements

The backend should stay efficient enough for low-cost hosting.

Guidelines:

- Avoid repeated database reads for static standards.
- Cache stable standards/knowledge in compact in-memory structures.
- Avoid loading unnecessary large objects into every classify response.
- Avoid logging huge JSON payloads.
- Avoid running optional feedback/persistence queries if the needed table is unavailable.
- Keep response payloads small for mobile use.
- Keep TypeScript build memory capped for Render.

## Frontend principles

The frontend should be mobile-first, clean, professional, and easy to use.

Avoid:

- cluttered card-heavy pages
- excessive admin/company management surfaces
- complex template digging
- low-contrast text
- hidden or duplicated navigation

Prefer:

- clear inspection workflow
- quick capture
- obvious HazLenz review
- clean report generation
- simple task/calendar support
- offline/local-first data where practical

## Deployment principles

Before pushing:

1. Run backend build.
2. Run frontend build.
3. Run at least one HazLenz classify smoke test.
4. Verify standards appear.
5. Verify no old visible names appear in normal output.
6. Verify response payload does not include reviewer/dev payloads.
7. Commit small logical changes separately.
8. Push only when working tree is clean.

## Current stable milestones

- HazLenz standards display from traceability fallbacks.
- Safety InSite naming policy centralized.
- HazLenz API display names sanitized.
- Conveyor cleanup no longer falsely routes to hot_work.
- Reviewer candidate payloads hidden from normal field output.

## Next technical priorities

1. Fix noisy missing `fix_feedback` table behavior.
2. Add normal/debug response shaping to reduce classify payload size.
3. Add regression tests for recent fixes.
4. Verify production Render/Vercel deployment.
5. Continue accuracy hardening by scenario family.

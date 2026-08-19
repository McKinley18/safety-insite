# Next implementation prompt

Copy the prompt below into a new Codex task.

---

Implement the approved Safety InSite foundational architecture in controlled stages.

Repository:

`/Users/mckinley/Desktop/Safety_InSite`

Branch: `main`

Expected HEAD before work:

`24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`

Do not commit or push.

The worktree is intentionally dirty and contains:

- five pre-existing modified HazLenz files;
- Production Remediation Phase 1–3 changes;
- production-audit and decision artifacts.

Preserve every existing change. Do not reset, revert, discard, delete, stash, overwrite, or broadly reformat anything. Before editing an already modified file, inspect and record its diff. Recompute and preserve the Phase 3 SHA-256 hashes for:

- `backend/src/safescope-v2/inspection-intelligence/inspection-citation-ranking.service.ts`
- `backend/src/safescope-v2/inspection-intelligence/inspection-citation-recovery.service.ts`
- `backend/src/safescope-v2/inspection-intelligence/inspection-condition-assessment.service.ts`
- `backend/src/safescope-v2/inspection-intelligence/standard-applicability.rules.ts`
- `backend/src/safescope-v2/safescope-v2.service.ts`

Do not begin HazLenz standards, citation, risk, confidence, prompt, or corrective-action intelligence tuning. HazLenz changes are limited to the smallest integration needed to persist an existing output snapshot. Stop before touching a preserved HazLenz file unless an unavoidable build conflict is documented and explicitly reviewed.

## Required reading

Read every file under:

`verification/product-engineering-decision-phase-2026-07-26/`

Also read:

- `verification/production-remediation-phase-3-2026-07-26/ACTIVE_APPLICATION_MAP.md`
- `verification/production-remediation-phase-3-2026-07-26/FORWARD_RECONCILIATION_RESULTS.md`
- `verification/production-remediation-phase-3-2026-07-26/REMAINING_BLOCKERS.md`
- relevant Phase 1/2 migration, auth, authorization, upload, and release-gate reports.

The decision documents are the product policy. Do not invent alternatives unless implementation evidence makes a decision technically impossible; if so, stop that stage, document evidence, and continue independent safe stages.

## Approved architecture

1. Users operate independently or have zero/one active organization membership. Multi-organization membership is deferred.
2. A site has XOR ownership: one user or one organization.
3. Inspection scope inherits from site. Organization drafts are visible to creator, assignments, managers, and organization admins; completed records are visible to organization members.
4. Observation, immutable HazLenzAnalysis, immutable HumanReview, and Finding are separate.
5. Inspection lifecycle is draft → in_review → completed → archived; reopen creates a new revision.
6. Reports are immutable versioned PDFs generated from completed inspection revisions.
7. CorrectiveAction and Task are durable; calendar is their server-side projection.
8. Private files use a private S3-compatible storage abstraction with PostgreSQL metadata and authorized backend access.
9. Entitlements are backend-resolved from Subscription plus explicit expiring Pilot/Test grants.
10. Standards/shared knowledge are global read-only for users; feedback enters a governed review queue.
11. Local storage supports visibly provisional draft recovery only. Finalization and reports require server confirmation.
12. Legacy reconciliation is clone-first, forward-only, row-conserving, and quarantines ambiguous data.

## Before production edits

Run and record:

- `pwd`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git status --short`
- `git diff --stat`
- `git diff --name-only`
- `git ls-files --others --exclude-standard`
- preserved-file SHA-256 hashes

Create:

`verification/production-remediation-phase-4-2026-07-26/`

Record commands and evidence continuously. Never alter the live development database. Use two restored clones plus clean disposable databases.

## Controlled implementation stages

Implement in this order, with a reviewable diff and passing stage tests before continuing:

1. Canonical `OrganizationMembership`, role enums, support-grant/platform-admin semantics, auth-context resolution, and audit events.
2. Shared scope resolver and database XOR ownership constraints.
3. Durable site entity/API/frontend integration and archive/transfer preview.
4. Activate and reconcile inspection module with lifecycle, assignment, optimistic version, and site scope.
5. Add Observation, immutable HazLenzAnalysis, immutable HumanReview, and versioned Finding persistence.
6. Replace competing report persistence with immutable report versions and a storage adapter.
7. Consolidate corrective actions; add Task and server calendar projection; remove local calendar as production authority.
8. Replace private static access with file metadata and authorized retrieval.
9. Add audited Pilot grants and production-impossible Test fixture.
10. Create forward-only reconciliation migrations and quarantine reports; validate on two restored clones.
11. Complete every active-route A1/A2/B1/manager/admin/platform-support authorization test.
12. Complete the database/object-store-verified authenticated Playwright workflow and release-gate command.

Use the precise completion criteria and stop conditions in `IMPLEMENTATION_SEQUENCE.md` and `ACCEPTANCE_CRITERIA.md`.

## Migration safety

- Do not use TypeORM `synchronize`.
- Do not edit migration history with ad hoc SQL.
- Inspect every migration for destructive statements.
- Never invent an owner.
- Put ambiguous rows in explicit quarantine tables with source table, source ID, reason, payload hash, and review status.
- Require mapped plus quarantined row counts to equal source counts.
- Baseline adoption is allowed only after exact fingerprint compatibility.
- Demonstrate backup restore and rollback on disposable infrastructure before proposing live migration.

## Authorization

Use consistent 404 responses for unknown and foreign resources. Derive scope from authenticated membership and parent records. Reject client ownership fields. Enforce state-aware draft collaboration, parent-child relationships, aggregate/search/export/file scope, and explicit audited platform support grants. No route may remain “assumed safe.”

## State and entitlement safety

Do not add frontend-only persistence, hidden bypasses, query overrides, fake success, silent fallback, catch-all success handling, broad TypeScript suppression, or disabled security assertions.

Test fixtures must require `NODE_ENV=test`, an allowlisted disposable database identity, and nonproduction service configuration. Free users must remain denied paid capabilities; Pilot/Test users exercise the real backend guard.

## Required verification

At minimum:

- clean and restored-clone migrations, fingerprint, repeatability, rollback and row conservation;
- backend/frontend builds;
- modified-file and critical-route lint;
- authentication/password reset/upload/billing regressions;
- site, lifecycle, observation, analysis, review, finding, report, action, task/calendar, file, entitlement tests;
- complete authorization matrix;
- npm production audits;
- `git diff --check`;
- preserved HazLenz hashes;
- full authenticated browser flow with direct database/object-store verification;
- failure paths, mobile viewport, refresh/logout/login, and B1 denial;
- release gate twice from clean disposable infrastructure.

## Deliverables

Create implementation, migration, authorization, persistence, security, browser, release-gate, command-log, residual-risk, and readiness reports under the Phase 4 verification directory. For every production file changed, record the decision implemented, prior/new behavior, migration and authorization impact, tests, and residual risk.

## Stop conditions

Stop the affected stage rather than improvising if:

- an approved decision cannot be implemented without a contradictory product change;
- existing data needs destructive or guessed ownership transformation;
- legacy reports cannot be mapped—quarantine them instead;
- private storage provider/test service is unavailable;
- a fixture could activate in production;
- a preserved HazLenz change would be overwritten;
- framework/database major upgrade is required;
- full offline conflict resolution becomes necessary.

Continue independent safe stages and report the blocker. Do not claim pilot readiness unless every acceptance criterion passes.

Final verdicts must separately state limited pilot, public production, and unsupervised HazLenz readiness. Public production and unsupervised HazLenz remain NO-GO unless separately proven.

Do not commit or push. Stop after implementation, verification, documentation, and readiness decision.

---

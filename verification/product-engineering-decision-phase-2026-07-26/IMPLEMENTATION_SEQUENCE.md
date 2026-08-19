# Implementation sequence

Each stage uses disposable databases, preserves dirty work, and must pass its completion gate before the next stage. No HazLenz accuracy tuning is included.

## 1. Canonical identity, organization, and membership

- Likely modules: `users`, `organizations`, `auth`, JWT strategy/guards, new membership entity/service/controller/DTOs.
- Migration: add membership/status/role/audit tables and indexes; backfill valid `User.organizationId`; enforce one active membership.
- Dependencies: approved role enums and 404 policy.
- Tests: independent, invite, join, duplicate active membership, leave/reassign, A1/A2/B1, platform claim.
- Stop: ambiguous existing membership or destructive credential change.
- Complete: auth context resolves user plus zero/one active membership without trusting client scope.

## 2. Canonical ownership primitives

- Modules: shared authorization/scope resolver, audit event service, DTO validation.
- Migration: reusable owner/org XOR columns and checks; audit-event table.
- Tests: XOR constraints, mass assignment, foreign scope, archived membership, support grant.
- Stop: entity cannot derive scope from authenticated parent.
- Complete: one tested parent-scope authorization pattern used by every new service.

## 3. Durable site API

- Modules: `sites` entity/module plus new controller/service/DTOs; frontend site selection/empty/error states.
- Migration: canonical site ownership, archive fields, unique active name per scope, indexes.
- Tests: independent/A1/A2/B1 CRUD, archive, site with inspections, transfer preview, pagination/search leakage.
- Stop: transfer requires ambiguous completed-record reassignment.
- Complete: reload/database prove site durability.

## 4. Activate and reconcile inspection

- Modules: `inspection`, `app.module`, lifecycle DTOs/services, frontend inspection client.
- Migration: site FK, owner/scope, state/version, assignments, timestamps; do not reuse incomplete `Hazard` blindly.
- Tests: transitions, draft privacy, assignment, concurrency, archive, invalid/foreign site.
- Stop: old inspection/audit rows lack defensible mapping.
- Complete: active route supports create/save/resume/review/complete with server IDs.

## 5. Observation, analysis snapshot, human review, finding

- Modules: new canonical entities/services/controllers; minimal integration call to unchanged HazLenz endpoint/service.
- Migration: observation, analysis snapshot, review event, finding/revision tables and indexes.
- Tests: raw evidence preservation, immutable snapshot, failure/manual finding, selected analysis, review rationale, finalize/dismiss/revision.
- Stop: any of the five preserved HazLenz files would need semantic overwrite; integration-only changes require explicit review.
- Complete: database proves advisory result and human decision persist separately.

## 6. Consolidate reports and storage metadata

- Modules: `reports`, `pdf`, new storage adapter; frontend cloud-only report history.
- Migration: canonical versioned report and file metadata; legacy report mapping/quarantine.
- Tests: completed-only, synchronous timeout/failure, idempotency, versioning, hash, archive, authorization.
- Stop: legacy report row cannot map without product decision—quarantine, do not guess.
- Complete: immutable PDF and metadata survive reload and authorization checks.

## 7. Corrective actions, tasks, and calendar projection

- Modules: `corrective-actions`, new tasks/calendar read service, dashboards, frontend calendar.
- Migration: canonical action ownership/parents/audit/version; task table; safe display ID sequence.
- Tests: finding and inspection actions, assignments, completion, calendar projection, date boundaries, aggregates, local import review.
- Stop: dual-write calendar is proposed.
- Complete: calendar state derives only from persisted actions/tasks.

## 8. Private file authorization

- Modules: upload/storage/file controller, report/evidence/logo/avatar consumers, remove private static serving.
- Migration: file metadata and parent links.
- Tests: signatures, limits, quarantine, owner/same-org/foreign/anonymous, signed expiry, traversal, orphan cleanup.
- Stop: no S3-compatible test service/credentials or parent scope cannot be proven.
- Complete: no private raw path or unguarded URL exists.

## 9. Pilot and test entitlements

- Modules: billing resolver/guards, admin grant command, test seed.
- Migration: entitlement grants/audit indexes; reconcile legacy plan fields.
- Tests: free quotas/denials, pro, pilot, expiry/revoke, cross-user, production fixture refusal.
- Stop: fixture can activate outside test/disposable DB.
- Complete: backend-authoritative release fixture and audited pilot grant work.

## 10. Forward reconciliation

- Modules: migration scripts, fingerprint/baseline tooling, operator reports.
- Migration: ordered additive migrations from stages 1–9 plus quarantine tables.
- Tests: two restored clones, counts/checksums, repeat run, rollback restore, exact fingerprint, baseline adoption.
- Stop: destructive transform without verified restore or any guessed owner.
- Complete: live migration runbook is signed off; live DB remains untouched until then.

## 11. Complete authorization matrix

- Cover all active controllers: profiles, memberships, sites, inspections, observations, analyses, reviews, findings, reports, actions, tasks/calendar, files, billing, aggregates, exports, knowledge, admin.
- Tests: independent, A1, A2 assigned/unassigned, manager, org admin, B1, platform admin with/without support grant.
- Stop: any route has “assumed safe” status.
- Complete: every active route has an explicit expected and passing result.

## 12. Browser and release gate

- Modules: Playwright fixtures/specs and root release command.
- Infrastructure: isolated PostgreSQL, S3-compatible test storage, explicit Test entitlement, clean browser state.
- Flow: site → draft → observation → HazLenz snapshot → review → finding → action/calendar → complete → PDF → reload/logout/login → B1 denial → direct DB/object verification.
- Failure paths: free/expired, offline draft, interruption, duplicate, invalid file, analysis/report failure, session expiry, mobile.
- Complete: deterministic nonzero-failing release command passes twice from clean disposable infrastructure.

## Cross-stage release discipline

Every stage requires build, targeted lint, migration inspection, changed-file tests, `git diff --check`, documentation, and preservation hashes. Framework upgrades and broad HazLenz work are out of scope.

# Production-readiness gap register

Status is based on repository inspection, prior authenticated evidence, and this phase's command results. `PASS` means an authentic gate is evidenced; `PARTIAL` means some path is proven but the release gate is incomplete.

| Area | Status | Severity | Evidence | Exact remaining work | Local? |
|---|---|---:|---|---|---|
| 129-case HazLenz corpus | PASS | High | 129 authenticated cases: 113 PASS, 16 NEEDS REVIEW, 0 FAIL | Preserve regression baseline | Yes |
| Life-critical repeatability | PASS | Critical | 81/81 cases, 243 runs, zero material instability | Rerun only after reasoning changes | Yes |
| Multi-hazard decomposition/cards | PASS | High | Chromium verified electrical/fall, guarding/LOTO, hot-work/gas | Complete full lifecycle persistence/report proof | Yes |
| Clarification/reanalysis | PARTIAL | Critical | Questions and prior endpoint versioning evidence | Three scenario browser persistence, prior versions, audit, stale UI | Yes |
| Analysis version invariants | PARTIAL | Critical | DB/advisory locking and 409 endpoint evidence | Two-context browser proof and all operation types | Yes |
| Authentication/entitlement | PASS | Critical | Normal login HTTP 201, entitlement boundary suites | Keep regression coverage | Yes |
| Authorization/tenant isolation | PARTIAL | Critical | Prior owner/unrelated report 404 evidence | Full resource matrix across organizations and roles | Yes |
| Inspection lifecycle | PARTIAL | Critical | Single-hazard lifecycle passed | Three multi-hazard full lifecycles | Yes |
| Evidence upload | PARTIAL | High | PNG upload passed; text/plain rejected | Provider-backed retrieval/deletion and multi-case proof | Yes/external |
| Risk governance | PARTIAL | Critical | Rationale-required override passed | Stale/duplicate/unauthorized browser matrix per hazard | Yes |
| Corrective actions/tasks | PARTIAL | High | Single-hazard task creation/completion passed | Multi-hazard association and authorization | Yes |
| Finalization | PARTIAL | Critical | Single-hazard finalization passed | Multi-hazard required-state/stale/duplicate proof | Yes |
| Reports/PDF | PARTIAL | Critical | Single-hazard PDF checksum and visual review passed | Multi-hazard versions, grouping, immutable history, auth | Yes |
| Audit history | NOT TESTED | High | Entities/routes exist; no complete phase audit query | Verify every state-changing action and tenant scope | Yes |
| Offline | NOT TESTED | High | localStorage helpers found; no sync proof | Define bounded contract and test safe failure/reconnect | Yes |
| Accessibility/mobile/themes | PARTIAL | High | Narrow Chromium smoke only | Keyboard, scanner, viewport/theme matrix | Yes |
| Frontend lint | FAIL | High | Exit 1; 502 errors, 115 warnings | Categorize and fix production-reachable findings | Yes |
| Backend lint | NOT APPLICABLE | Medium | No backend lint script configured | Add if operationally required | Yes |
| Typecheck/build | PASS | High | Backend build; frontend typecheck/build passed | Retain gates | Yes |
| Automated E2E coverage | PARTIAL | High | Playwright tooling exists; canonical lifecycle scripts incomplete | Add durable authenticated browser suite | Yes |
| Database migrations | PARTIAL | Critical | TypeORM migrations/scripts present | Fresh-database migration rehearsal and rollback evidence | Yes |
| Constraints/transactions | PARTIAL | Critical | Analysis unique indexes/advisory lock verified | Verify all actions/tasks/reports and rollback paths | Yes |
| Storage production provider | EXTERNAL | Critical | Local provider only; live credentials unavailable | Real S3-compatible upload/retrieve/delete/isolation tests | External |
| Regulatory qualification | EXTERNAL | Critical | 129 pending-review records; 19 governed definitive standards | Qualified reviewer approval and release manifest | External |
| OSHA Part 1904 | PASS (excluded) | High | Explicit bounded-release exclusion | Keep UI/report disclosure and fail-closed tests | Yes |
| Secrets/environment validation | PARTIAL | Critical | Production validator requires JWT, S3, exact HTTPS CORS | Production startup and secret rotation rehearsal | External |
| Security headers/CORS | PARTIAL | High | Helmet and exact-origin CORS code present | Production config scan and browser denial tests | Yes |
| CSRF/session security | NOT TESTED | Critical | JWT/cookie paths exist; no complete CSRF review | Verify cookie flags, origin checks, session expiry/logout | Yes |
| File security | PARTIAL | High | MIME/size validation and upload tests exist | Malware scanning expectation and provider lifecycle | External |
| Rate limiting/abuse | PASS (bounded) | High | 100/min production throttler and 429 runner evidence | Login/registration abuse matrix | Yes |
| Monitoring/error reporting | NOT TESTED | High | Health endpoints exist; no configured alerting evidence | Configure logs, metrics, alerting, error sink | External |
| Backups/disaster recovery | NOT TESTED | Critical | No restore rehearsal found | Provider/database backup and restore test | External |
| Deployment/rollback | PARTIAL | Critical | Staging deployment readiness doc exists | Complete runbook, checklist, rollback rehearsal | Yes+external |
| Dependency audit | NOT TESTED | High | `npm audit` failed ENOAUDIT/no registry metadata | Run in networked CI and remediate findings | External |
| Performance | NOT TESTED | High | No threshold study in this phase | Measure authenticated production paths and define SLOs | Yes |
| Privacy/legal | PARTIAL | High | Legal/privacy pages exist | Legal approval and retention/export/deletion policy | External |

Highest-risk release blockers are multi-hazard lifecycle/report proof, authorization/audit completeness, lint, offline contract, live storage, qualified regulatory review, and operational backup/monitoring.

## Persisted multi-hazard phase update — 2026-08-03

| Area | Status | Severity | Evidence | Exact remaining work | Local? |
|---|---|---:|---|---|---|
| Canonical decomposition findings | PARTIAL → materially improved | Critical | Migration 5300; focused regression creates/reconciles two findings; three Chromium runs reload persisted cards | Complete per-finding review, authorization, audit, and full current/history UI proof | Yes |
| Finding-specific risk governance | FAIL/PARTIAL | High | Legacy `HumanReview` remains observation-scoped | Add finding FK and one review/rationale per current finding; block finalization when any finding is unreviewed | Yes |
| Current report snapshots | PASS for current filtering | High | Superseded findings excluded; fresh PDF visually verified | Generate/report version 2 after legitimate source change and prove historical bytes/snapshot immutable | Yes |
| Finding/task association | PARTIAL | High | Task migration 5400 and browser task completion include correctiveActionId | Complete stale/duplicate action/task matrix and cross-tenant checks | Yes |
| Finding/reconciliation audit | NOT TESTED/PARTIAL | High | State transitions persist; no complete materialization audit chain | Emit/query append-only finding add/supersede/material-change events | Yes |

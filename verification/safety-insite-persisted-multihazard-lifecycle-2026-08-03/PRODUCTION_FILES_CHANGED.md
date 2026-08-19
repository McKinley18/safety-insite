# Production files changed in this phase

* `backend/src/inspection/entities/inspection-finding.entity.ts` — stable hazard identity, originating analysis, lifecycle status, nullable review/finalizer fields.
* `backend/src/inspection/entities/observation.entity.ts` — finding relation.
* `backend/src/database/migrations/1800000005300-DurableDecompositionFindingIdentity.ts` — durable finding schema migration.
* `backend/src/inspection/inspection.service.ts` — transactional decomposition materialization/reconciliation, finding-aware finalization.
* `backend/src/tasks/task.entity.ts`, `backend/src/tasks/task.dto.ts`, `backend/src/tasks/tasks.service.ts`, `backend/src/database/migrations/1800000005400-LinkTasksToCorrectiveActions.ts` — explicit task/action association and scope validation.
* `backend/src/reports/canonical-reports.service.ts` — finding-aware PDF lines, current-only snapshot filtering, unchanged-version idempotent report generation.
* `frontend-next/lib/canonicalWorkflowApi.ts` — persisted finding/task contracts.
* `frontend-next/app/inspection-workspace/page.tsx` — durable finding hydration, stable IDs, finding-specific action drafts, review/finalization hydration.

Regression script: `backend/scripts/test-persisted-decomposition-findings.ts` and `backend/package.json` script registration. Protected HazLenz reasoning files were not changed.

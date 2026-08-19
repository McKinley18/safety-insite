# Canonical multi-hazard data flow

The canonical path is observation capture -> `InspectionService.addAnalysis()` -> persisted `HazlenzAnalysis` -> transactional decomposition reconciliation -> `InspectionFinding` rows -> review/finalization -> corrective actions -> tasks -> immutable report snapshot/PDF.

Before this phase, decomposition was returned to the workspace as ephemeral cards while `inspection_findings` and downstream services remained observation/single-finding oriented. The durable path now materializes one finding per stable hazard key in the same transaction as accepted analysis persistence. The workspace hydrates those rows after reload and uses finding IDs/keys for review and action display. Tasks now retain `correctiveActionId`; reports snapshot current findings and actions.

Relevant files: `backend/src/inspection/inspection.service.ts`, `backend/src/inspection/entities/inspection-finding.entity.ts`, `backend/src/inspection/entities/observation.entity.ts`, `backend/src/reports/canonical-reports.service.ts`, `backend/src/tasks/task.entity.ts`, and `frontend-next/app/inspection-workspace/page.tsx`.

The transaction is serialized by the existing analysis advisory-lock/version path. A stale request exits with HTTP 409 before reconciliation; an idempotent replay returns the existing analysis and does not create findings.

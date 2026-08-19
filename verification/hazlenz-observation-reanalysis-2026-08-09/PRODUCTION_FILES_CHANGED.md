# Production files changed

- `backend/src/inspection/dto/inspection.dto.ts`: added versioned `UpdateObservationDto`.
- `backend/src/inspection/inspection.controller.ts`: added authenticated `PATCH /inspections/observations/:id`.
- `backend/src/inspection/inspection.service.ts`: added ownership-scoped, version-checked durable update and `observation_updated` audit event.
- `frontend-next/lib/canonicalWorkflowApi.ts`: added persisted observation update contract.
- `frontend-next/app/inspection-workspace/page.tsx`: added revision editor, explicit save, persisted reanalysis control, loading/error handling, and current-state refresh.

No HazLenz inspection-intelligence/reasoning files were changed.

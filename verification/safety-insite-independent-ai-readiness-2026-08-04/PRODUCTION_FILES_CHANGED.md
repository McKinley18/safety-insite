# Production files changed

* `backend/src/inspection/entities/human-review.entity.ts`, `inspection-finding.entity.ts`, DTO, module, service, and migration — finding-scoped review state, idempotency, invalidation, finalization, and audit.
* `frontend-next/lib/canonicalWorkflowApi.ts`, `app/inspection-workspace/page.tsx` — one review request/idempotency key per durable finding.
* `backend/src/safescope-v2/taxonomy.seed.ts`, `engine/deterministic-classifier.ts`, `safescope-v2.service.ts`, `safescope-v2.controller.ts` — generic hazardous-energy evidence routing and verified-control safe-state suppression exposed by blind evaluation.
* `backend/scripts/test-finding-scoped-reviews.ts`, `backend/package.json` — focused regression.

Evaluation generators, ground truth, scorers, logs, and reports are verification-only and outside production execution.

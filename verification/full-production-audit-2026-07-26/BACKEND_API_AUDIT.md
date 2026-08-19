# Backend API Audit

## Inventory summary

The Nest startup log mapped more than 80 routes across auth, billing, organizations, reports, actions, standards, regulatory data, HazLenz, knowledge governance, review queues, audit, analytics, PDF, uploads, and maintenance.

## Strengths

- Global input whitelisting and rate limiting.
- Clear paid-feature guard on classification, reports, standards, analytics, and knowledge.
- Pagination cap exists for corrective actions.
- Report/action queries commonly include organization ID.
- Stripe aliases share validated service logic.

## Risks

- No OpenAPI contract, response validation, or authoritative endpoint inventory.
- Role metadata is not consistently paired with `RolesGuard`.
- Visual/offline HazLenz endpoints have JWT but not the classification entitlement.
- Organization-by-ID is not tenant-scoped.
- Regulatory sync and maintenance seed endpoints require especially careful role review.
- Many DTOs use `any`; some controllers accept raw object bodies.
- Report creation lacks transaction/idempotency.
- Error paths return `null`, throw generic `Error`, or rely on framework 500 behavior inconsistently.
- Pagination/filter/sort behavior is inconsistent across collections.
- PDF generation is synchronous and Puppeteer-heavy with no queue/timeout visible.
- Legacy `/safescope/analyze` and production `/safescope-v2/classify` coexist.
- Health is liveness plus database plus diagnostics, not separate liveness/readiness.

## Direct HTTP results

- `GET /health`: 200 and database up.
- Frontend `/`: 200.
- `GET /auth/me` without token: 401.
- Full classification under free bypass: 402.
- 102 expert-bypass classification requests: all 201.


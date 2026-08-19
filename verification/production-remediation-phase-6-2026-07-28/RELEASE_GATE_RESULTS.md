# Release Gate Results

## Passed

- Backend TypeScript build.
- Frontend Next.js production build and TypeScript.
- Modified frontend lint.
- Clean migration path: 26/26.
- Migration rollback/reapply of the forward Phase 6 migration.
- Two-clone adoption and adopted restore verification.
- Local storage provider: 4 scenarios.
- S3-compatible TLS provider: 6 scenarios, twice.
- Private storage/report service: 12 scenarios.
- Canonical persistence: 19 scenarios.
- Canonical A1/A2/B1 authorization: 11 assertions.
- Entitlement boundary: 4 assertions.
- Entitlement operations: 4 scenarios and 2 persisted audit events.
- Upload security.
- Password-reset delivery.
- Billing regression: 24/24.
- Dashboard scope.
- Authenticated browser Phase 5 subset: 20 scenarios.
- Expanded Phase 6 browser gate: 31 scenarios.

Expanded browser result included real HazLenz endpoint execution, one persisted analysis, two immutable report versions, two S3 artifacts, authorized PDF retrieval, foreign 404, direct-object 403, reload persistence, logout/login persistence, and retired legacy-route checks.

## Defects found during verification

The Phase 6 migration initially failed reapplication when knowledge date columns were already `date`; casting through text fixed it and the clean database returned to 26 migrations.

The obsolete corrective-action smoke script no longer matched the expanded service constructor and UUID/assignee contract. Its package command was formally redirected to the canonical real-controller authorization suite.

## Not fully closed

The complete interactive inspection UI is not yet proven end-to-end without API-assisted browser steps. Full legacy-module route enumeration and the remaining local-first inspection/calendar paths are residual release blockers.


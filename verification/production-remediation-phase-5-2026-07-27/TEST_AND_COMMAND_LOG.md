# Test and command log

Key commands and results:

- `npm run build` (backend): PASS.
- `npm run build` (frontend): PASS after sandbox escalation; type check included.
- `npm run migration:run` on `phase5_clean`: PASS, 25/25.
- migration revert then run on `phase5_rollback`: PASS.
- `npm run migration:baseline` clean vs rollback: compatible, fingerprint `3af88...b3d6`, 25/25.
- `npm run test:private-storage-reports`: PASS, 12 scenarios.
- `npm run test:storage-provider`: PASS, 4 scenarios.
- `npm run test:entitlement-operations`: PASS, 4 scenarios.
- `npm run test:canonical-authorization`: PASS, 11 assertions.
- `npm run test:upload-security`: PASS.
- `npm run billing:regression`: PASS, 24/24.
- `npm run test:password-reset-delivery`: PASS.
- `npm run check:canonical-persistence`: PASS.
- `npm run check:phase5-report-release`: PASS, 20 scenarios.
- `npm run test:auth-flow`: FAIL because rate limiter returned 429 where the old script asserts 401.
- `npm audit` backend: 2 high, 8 moderate after remediation.
- `npm audit --omit=dev` frontend: 3 high, 1 low.
- two-clone reconciliation: deterministic, adoption rejected.
- legacy quarantine dry-run/apply/apply: deterministic and idempotent.

Database names: `phase5_clean`, `phase5_rollback`, `phase5_clone_a`, `phase5_clone_b`, `phase5_restore_proof`.

No command modified the source `safescope` database.

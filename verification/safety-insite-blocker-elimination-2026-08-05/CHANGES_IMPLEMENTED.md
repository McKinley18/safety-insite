# Changes implemented

- `frontend-next/app/layout.tsx`: removed nondeterministic pre-hydration theme mutation and `suppressHydrationWarning`; theme applies after hydration.
- `backend/src/auth/entitlements/entitlement.guard.ts`: persist structured entitlement-denial security audit events without secrets.
- `backend/src/reports/entities/inspection-report-version.entity.ts`: added source fingerprint field.
- `backend/src/reports/canonical-reports.service.ts`: fingerprint immutable source snapshots, serialize generation with advisory locking, and safely replay unchanged requests.
- `backend/src/database/migrations/1800000005600-ReportSourceFingerprint.ts`: reversible fingerprint column and uniqueness index.
- `backend/scripts/run-blocker-authorization-matrix.ts`: reusable deterministic authorization/audit matrix harness.
- `backend/scripts/run-report-concurrency.ts`: ten-request concurrent report harness.
- `backend/scripts/test-private-storage-reports.ts`: report duplicate behavior now tests idempotent unchanged generation and legitimate source-change version 2.
- `backend/src/safescope-v2/taxonomy.seed.ts`: added general taxonomy coverage for chemical release, hot work, and powered industrial truck evidence.
- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`: preserved independently evidenced secondary hazards with explicit active-state predicates, identity gaps, and safe-state exclusions.
- `backend/src/safescope-v2/safescope-v2.service.ts`: promoted decomposition hazards into the canonical advisory response with stable family keys and evaluation-only stage tracing.
- `backend/src/safescope-v2/display/guided-finding-response.ts`: prevented controlled-condition outputs from inheriting unrelated UNKNOWN applicability candidates.
# Current precision iteration

Production:

- `backend/src/safescope-v2/safescope-v2.service.ts`: general contradiction extraction, explicit condition-state propagation, and active-sibling detection that respects verified controls.
- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`: fragment-scoped suppression for negated/controlled fall, chemical, mobile-equipment, guarding, electrical, and energy conditions.
- `backend/src/safescope-v2/display/guided-finding-response.ts`: normalized controlled-state compatibility handling.

Regression:

- `backend/src/safescope-v2/tests/hazlenz-production-path-regression.ts`: controlled-condition outcome is accepted as a safe-state governed response.

Third iteration:

- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.types.ts`: additive condition-state and temporal metadata fields.
- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`: fragment-scoped temporal state inference and verified-control suppression.
- `backend/src/safescope-v2/safescope-v2.service.ts`: context-free fallback boundary, historical hazard projection, and current-versus-historical reconciliation.
- `backend/src/safescope-v2/tests/hazlenz-production-path-regression.ts`: context-free unknown-state regressions.

No evaluator answers or opaque scenario IDs are imported by production code.

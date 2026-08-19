# Migration report

## Canonical path

Two additive Phase 4 migrations were added:

- `1800000000000-CanonicalInspectionFoundation.ts`
- `1800000001000-AlignCanonicalAuditLog.ts`

The final source contains 24 migrations. A new disposable database `phase4_clean_final` migrated from zero to 24/24 in a transaction. The second migration corrected a real entity/schema defect discovered when corrective-action audit persistence attempted to use the missing `audit_logs.tenantId` column.

## Safety

- `TYPEORM_SYNCHRONIZE` remained false.
- No live development data or migration history was changed.
- Site migration refuses ambiguous ownerless rows.
- Inspection migration refuses legacy inspections without an explicit site mapping.
- No owners are guessed.

## Existing database

Dry-run comparison:

- Development fingerprint: `66534abf3c2a0268f367e70e448c2a185dea5018235b2c747bb9dff1457aca9e`
- 24-migration reference fingerprint: `f1c3e2bd8e99e8c2442f6e25a9210352221dc0cb82df58142808804dabf41a49`
- History: 0/24
- Compatibility: false
- Catalog differences: 636
- Applied: false

The increased difference count is expected because Phase 4 added the canonical workflow tables and constraints. Baseline adoption remains unsafe. Clone reconciliation and row-conservation cannot proceed until report mapping, private storage, and operator ownership mapping are available.


# Forward reconciliation plan

## Proposed safe sequence

1. Approve the canonical domain and authorization model.
2. Generate a fresh canonical reference from reviewed entities and migrations.
3. Restore a verified development backup to a disposable clone.
4. Add new tables/columns only through forward migrations.
5. Backfill ownership only from explicit existing relationships; quarantine ambiguous rows.
6. Validate nulls, orphans, duplicates, enums, FKs and report transformations.
7. Add constraints only after validation.
8. Recompute the structural fingerprint and repeat on a second restore.
9. Baseline-adopt only after exact compatibility.

## Not authorized in this phase

No reconciliation migration was created. The present canonical reference itself lacks the five active SafeScope knowledge tables and conflicts with active report/application shapes. Adding the missing 18 tables would certify an unsettled model; removing or transforming extras would risk data.

Rollback must be restore-based for data transformations and forward-fix based for additive schema changes. A verified backup and rollback drill are prerequisites.

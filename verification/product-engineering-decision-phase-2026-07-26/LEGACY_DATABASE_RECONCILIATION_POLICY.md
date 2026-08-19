# Legacy database reconciliation policy

## Decision

Reconcile only on restored clones with forward-only migrations. Preserve known data, quarantine ambiguous ownership or provenance, and baseline-adopt only after exact fingerprint compatibility.

## Data-family treatment

| Family | Policy |
|---|---|
| User/auth/reset | preserve and migrate to canonical UUID/auth columns |
| Organization | preserve; add lifecycle/audit fields |
| `User.organizationId` | map to active membership when valid; later retire |
| Subscription/user plan fields | merge into Subscription and EntitlementGrant; quarantine conflicts |
| Site | create canonical table; import only records with defensible XOR owner |
| Inspection/hazard/audit-session variants | map to inspection/observation/finding only with field-level provenance; otherwise legacy read-only/quarantine |
| Reports/local report exports | map metadata where inspection ownership is proven; raw documents quarantine/import as legacy attachment |
| Corrective actions | preserve/migrate after parent and scope mapping; regenerate display IDs safely |
| Calendar localStorage | explicit user-reviewed import to Task; never automatic DB backfill |
| Standards/regulatory | rebuild canonical published corpus from governed sources; preserve legacy rows for comparison |
| Five SafeScope knowledge tables | preserve and migrate global records with provenance; unknown provenance stays legacy read-only/quarantined |
| Review/snapshot records | preserve only when parent/user/scope is proven |
| Generated/test fixtures | rebuild from source or discard only after classification and backup |

## Operator process

1. Take encrypted logical dump and provider snapshot; verify restore.
2. Export table/row counts, checksums for critical tables, constraints, ownership/null/orphan/duplicate reports.
3. Restore two independent clones.
4. Generate an ownership mapping manifest with source column/evidence.
5. Write ambiguous rows to dedicated `migration_quarantine_*` tables with source table, source PK, reason, payload hash, and review status.
6. Run dry-run reconciliation and human-review the report.
7. Apply forward migrations to clone A; repeat on clone B.
8. Compare row counts, mapped+quarantined totals, FKs, fingerprints, application reads/writes, and audit logs.
9. Exercise rollback by restoring the pre-migration snapshot.
10. Schedule live migration only after signed acceptance and maintenance/rollback plan.

No record receives a guessed owner. No migration-history row is inserted until structural compatibility is exact.

## Acceptance criteria

Every source row is preserved, mapped, explicitly rebuilt, or quarantined; mapped plus quarantined counts equal source counts; zero unexpected orphans/constraint failures; canonical fingerprint matches; 22 historical plus new forward migration history is coherent; application and release tests pass on both clones.

## Context, impacts, risks, deferred work

Direct baseline marking and reset/reseed were rejected as unsafe. The main risk is semantic misclassification despite structural parity. Live migration remains prohibited until provider backup/restore and retention decisions are verified.

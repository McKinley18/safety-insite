# Restore and rollback report

- Source backup: `pg_dump -Fc` read-only from `safescope`.
- Restore: successful to clone A, clone B, and `phase5_restore_proof`.
- Restored schema/content fingerprints and row counts matched.
- Phase 5 migration rollback: successful on `phase5_rollback`.
- Reapplication: successful; returned to 25 migrations.

The development source database was not modified.

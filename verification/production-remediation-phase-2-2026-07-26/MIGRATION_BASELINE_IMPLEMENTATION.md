# Migration baseline implementation

Command: `cd backend && npm run migration:baseline` with `DATABASE_URL` and `BASELINE_REFERENCE_DATABASE_URL`. Add `-- --apply` only after reviewed dry-run output and backup verification.

The implementation prints redacted database identity, fingerprints, current/target counts, exact history records, drift, and warning; JSON is always emitted. Apply inserts all 22 TypeORM history rows transactionally and records the fingerprint in `schema_baseline_adoptions`.

Tests: compatible empty history dry-run PASS; apply PASS; repeated apply PASS/idempotent; current development schema REJECTED; partial/concurrency and every individual mutation category were not fully automated in this phase.

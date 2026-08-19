# Database retest

PostgreSQL 16 container `safescope-db` was available on 5432.

- Databases observed: `safescope`, `safescope_phase1_audit`, `phase2_reference`, `phase2_legacy_compatible`, `phase2_incompatible`.
- Created disposable clone: `phase3_development_clone`.
- Live development: 10 public tables, 0 migrations, 5 users, 7 organizations.
- Clone baseline dry run: expected rejection, 436 differences.
- Fingerprints matched the Phase 2 report exactly.
- No baseline apply or reconciliation migration was run.
- No development data was modified.

Clean 22/22 migration behavior was not rerun because `phase2_reference` remained available with the recorded 22-entry reference and production changes were not made in Phase 3. Reconciliation/repeat/baseline-apply tests are blocked by the unsettled target schema.

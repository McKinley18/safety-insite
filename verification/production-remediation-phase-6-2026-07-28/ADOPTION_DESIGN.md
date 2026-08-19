# Adoption Design

`npm run legacy:adopt` implements clean-target ETL.

## Safety properties

- Dry run is the default; mutation requires `--apply`.
- Source and target database identities must differ.
- Source transactions are read only.
- Target names must explicitly match disposable Phase 6 adoption/test naming.
- Target must contain all 26 legitimate migrations and be empty of adoptable business data.
- Preconditions detect unknown tables, duplicate identities, missing parents, conflicting credentials, and ambiguous ownership.
- Apply uses one database transaction and a PostgreSQL advisory lock.
- Source IDs are preserved.
- Provenance records include source/schema/content fingerprints, row counts, row hashes, and operator label.
- A completed source fingerprint is unique; repeated apply returns `alreadyApplied`.
- No migration table rows are fabricated.

The design intentionally does not mutate the legacy database in place. Rollback is restore/drop of the disposable target until an operator separately approves cutover.


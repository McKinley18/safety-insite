# Adoption Rollback and Restore

- Original logical backup checksum: `4f62c27d7f0cc75b6274117393566da998b171b86e4ac110f60b50a47c92dbc7`
- Adopted logical backup checksum: `cd579f2f0efd28c6f37928a9039235a549cf9ce51606ab17dba9f325234c791b`
- Source restore databases: `phase6_rollback_proof`, `phase6_restore_proof`
- Adopted restore database: `phase6_restore_adopted`

The source backup restored with its original counts and fingerprint. The adopted backup restored with the same normalized schema fingerprint, canonical content fingerprint, counts, provenance, and zero-orphan result.

Raw `pg_dump` schema text differed only in semantically equivalent PostgreSQL cast formatting. The verifier now normalizes those forms and still compares canonical constraints, content, and counts.

Rollback before cutover is target disposal plus source restore. No in-place rollback of legacy data is required because source databases are read only.


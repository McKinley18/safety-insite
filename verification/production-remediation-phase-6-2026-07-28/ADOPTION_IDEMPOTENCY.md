# Adoption Idempotency

Repeated `--apply` calls against both adopted targets returned `alreadyApplied: true`.

No second provenance run, mapping row, membership, source row, or migration row was created. The database-level unique completed-source fingerprint and transactional advisory lock enforce repeatability and concurrent exclusion.


# Migration baseline design

The command compares a target database with a separately migrated canonical reference. It fingerprints tables, columns, PostgreSQL/UDT types, nullability, defaults, indexes, constraints/foreign keys, and enum labels. `migrations` and the adoption audit table are excluded from the structural fingerprint.

Dry-run is default. Apply requires `--apply`, exact compatibility, empty history, distinct target/reference URLs, and an advisory transaction lock. Partial history, drift, concurrent changes, missing configuration, and ambiguous migration names fail closed. Historical migration bodies are never executed during adoption.

Operators must take and verify a backup first. Production adoption is appropriate only when the fingerprint matches a reference created from the exact release. Drift requires reviewed forward reconciliation migrations against a restored copy.

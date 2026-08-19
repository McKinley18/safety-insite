# Regulatory release governance

Migration `1800000004000-RegulatoryReleaseGovernance` adds a release table and non-destructive standards metadata for source URL/dates, source and normalized checksums, transformation version, reviewer approval, deprecation, supersession, and applicability schema version.

Release finalizer:

- release: `federal-core-2026-07-30.1`
- status: `provisional`
- records: 19
- parser/transformation: `combined-seed-v1`
- stable converged manifest checksum: `9a5bfa26a307f1df2ebb1b6faf3fed08ac65357a47437a5e98080f4408d363dd`

No historical dates, URLs, approval, or source checksums were fabricated. Missing starter source keys receive explicit `starter-unverified:` identities and remain unapproved.

The initial run performs that one-time source-key normalization; a second and third run produced the identical converged checksum and one release row. This is deterministic after migration/backfill convergence, but first-run versus converged checksum differs and is documented.

Clean install reached 27/27 migrations. Upgrade from the prior disposable 26-migration database passed. The new migration was reverted and reapplied successfully. Original development data was untouched.

Governance remains incomplete because only 19 standards are packaged and the release is provisional.


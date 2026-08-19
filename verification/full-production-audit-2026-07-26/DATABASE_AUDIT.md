# Database Audit

## Actual local state

PostgreSQL 16.14 was reachable. Read-only inspection found:

- 10 public tables.
- Empty TypeORM `migrations` table.
- `standards_master`: 19 rows.
- knowledge documents/chunks: 8/8 rows.
- users: 5; organizations: 7; subscriptions: 0.
- Most active application tables are absent.

## Schema drift

The database appears to come from a different/legacy schema generation:

- Database `user.id` is UUID; active entity uses integer generation.
- Database has `passwordHash` and nullable `password`; active entity selects `password`.
- Database `organization.riskProfileId` is UUID; application treats profile IDs as strings such as `standard_5x5`.
- Active data source lists many entities not represented in actual schema.
- Two migrations share timestamp `1780000000002`; two share `1780000000004`; two user-subscription migrations share `1790000003000`.
- Initial migrations are duplicated.
- Runtime `migrationsRun` is false and Docker does not run migrations.
- Some ingestion/seed/test scripts use `synchronize: true`, creating dangerous alternate schema mutation paths.

## Integrity and indexing

- Organization/user/subscription primary/unique indexes exist.
- Knowledge tables show only primary-key indexes; common lookup fields such as document ID, workspace, approval status, agency, source, tags, and retrieval time lack visible indexes.
- Core entity foreign keys/cascades could not be verified because tables do not exist.
- Report create is not transactional.
- Corrective action display IDs use race-prone global counts.
- Timestamps mix timezone and no-timezone columns.
- Soft deletion exists only on selected entities and enforcement is inconsistent.

## Required remediation

Define one authoritative schema, remove synchronization from operational scripts, build idempotent forward migrations with explicit data transforms, test on a restored copy, and add a schema compatibility startup/readiness check. Establish backup, point-in-time restore, migration rollback/forward-fix, retention, and deletion runbooks.


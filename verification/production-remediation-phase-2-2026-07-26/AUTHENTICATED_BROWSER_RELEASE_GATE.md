# Authenticated browser release gate

An authenticated Playwright gate now requires explicit fixture credentials, logs in through the UI, verifies command-center rendering, local session persistence, refresh persistence and authenticated cloud reports access.

The required full inspection-to-report workflow was not completed. Architecture blockers:

- no active site CRUD controller supports durable site creation;
- canonical migrated `reports` columns do not match the active `Report` entity;
- free registration cannot exercise paid report/HazLenz endpoints without a controlled entitlement fixture;
- current frontend can fall back to local/offline state, which cannot prove backend persistence.

These are major architecture conflicts under the stop condition. Route-only assertions were not substituted.

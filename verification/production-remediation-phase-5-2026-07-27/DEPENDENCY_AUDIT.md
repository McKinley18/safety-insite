# Dependency audit

## Backend

Before: 3 high, 9 moderate.

After reviewed patch overrides: 2 high, 8 moderate. Multer was forced to 2.2.0, Mongoose to 9.7.2, and brace-expansion to 5.0.8. Build and upload/storage tests passed afterward.

Remaining highs are tied to Nest 10 / platform-express advisories whose audit-suggested fix is Nest 11, an unplanned major framework migration. These remain reachable enough to block public production.

## Frontend production

3 high, 1 low remain. Chains involve Next, PostCSS, and Sharp. The audit suggests an invalid/downgrade-style Next resolution; a safe compatible patch was not identified. No force upgrade was used.

Test-only `pg` was added as a frontend dev dependency solely for direct database assertions in the browser release gate.

# Database schema decision

Canonical identity is UUID. This matches the existing development database, organizations, reports, sites, inspections, and most ownership references. Credentials are stored only in `user.passwordHash`; reset tokens are SHA-256 hashes with a `timestamptz` expiry.

TypeORM `synchronize` is false and production startup now rejects `TYPEORM_SYNCHRONIZE=true`. Migrations are the schema authority.

The migration chain was made clean-start capable by defining the missing `site` table, making standards extension operations idempotent, assigning unique migration timestamps to formerly competing migrations, and adding `CanonicalUserAuthentication1793000000000`.

No existing rows were deleted. The compatibility migration copies legacy `password` into `passwordHash` only when needed and stops if any credential cannot be preserved.

Residual: numerous secondary entities loaded by `autoLoadEntities` still lack complete explicit migration parity and foreign keys are not uniformly typed/enforced. This blocks public production until a schema-diff gate and additional additive migrations are completed.

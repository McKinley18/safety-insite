# Migration validation

Disposable database: `safescope_phase1_audit` on local PostgreSQL 16.14.

Result: PASS. `DATABASE_URL=.../safescope_phase1_audit npm run migration:run` applied 22/22 migrations in one transaction and committed. Backend then started on port 4100 with `TYPEORM_SYNCHRONIZE` disabled; `/health` returned 200 with database `up`.

Important discovery: repository `.env` contains `DATABASE_URL`, which takes precedence over `DB_NAME`; initial validation attempts using only `DB_NAME` reached the existing development database and rolled back without changes. Documentation now states precedence explicitly.

Existing database: read-only inspection confirmed UUID `user.id`, `passwordHash`, legacy nullable `password`, and zero recorded migrations. The additive canonical migration was reviewed but was not applied to that database because its absent migration history makes bulk adoption unsafe without a formal baseline operation.

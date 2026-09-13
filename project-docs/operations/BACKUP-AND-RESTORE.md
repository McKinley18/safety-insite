# Backup and restore

## Posture

The production database is managed PostgreSQL on Render; backups are taken by the platform. This is
the one part of the release procedure with no repository code behind it, and it has historically
been the weakest link: §268 could not provision backups and did not pretend it had.

**Before any migration**, step 3 of the [deployment runbook](DEPLOYMENT-RUNBOOK.md) requires
confirming a backup exists that was taken *after* the last write you care about, and recording its
identifier. That step is a gate, not a formality — migrations run before deploy, so the backup is
the only way back from a bad migration.

## What has actually been rehearsed

§269 took a **full logical backup of production and rehearsed a restore into a disposable
database**: 76/76 tables and 7 049/7 049 rows restored with zero differences. That establishes the
backup is restorable and the dump is complete, which is a stronger claim than "backups are enabled"
and a weaker one than "we can restore production in place under time pressure". The latter has not
been exercised.

## Restoring

Restore is a decision, not a reflex, because of one rule from the
[rollback model](ROLLBACK-MODEL.md): **restoring the database must never destroy human
settlements.** A settlement is a person's judgement about a hazard; older code can be redeployed,
but a confirmation that has been overwritten is gone. So:

- **Code is wrong, schema is fine** — redeploy the previous SHA. Do not touch the database. A schema
  ahead of the build is a supported state and `/health/ready` treats it as ready.
- **A migration is wrong** — prefer a forward-fixing migration. Restoring loses every write since
  the backup, including settlements.
- **Data loss or corruption** — restore from the recorded backup identifier, into a disposable
  database first, and diff before promoting.

## Local and verification databases

Never run migrations, seeds or destructive commands against the original development database.
Resolve the actual target first — `DATABASE_URL` takes precedence over the discrete `DB_*`
variables — print the resolved host and database name, and proceed only if it is positively a
disposable verification database. The repository supports this directly:
`backend/scripts/hazlenz/with-disposable-db.ts` wraps a suite in a throwaway database, which is how
`npm run hazlenz:integration:test` runs.

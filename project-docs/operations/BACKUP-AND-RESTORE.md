# Backup and restore

## Posture

**Corrected at §289.** The production database is **Neon** PostgreSQL 17.11 in `us-east-1`,
database `neondb` — **not** managed PostgreSQL on Render. The Render account contains no Postgres
instance at all (`GET /v1/postgres` returns an empty list). This document and
[`ROLLBACK-MODEL.md`](ROLLBACK-MODEL.md) both previously said Render, which would have sent an
operator looking for something that does not exist at the one step that is the only way back from a
bad migration.

Neon's own backups are taken by the platform, and **what that platform retains has not been read**:
there is no `NEON_*` credential in this repository or environment, so the history-retention window
and the point-in-time-recovery setting are unknown. That is register entry `BR-2`, and it is one
console read away.

What does **not** depend on the Neon console is an operator-controlled logical backup, and that path
is proven. §268 could not provision backups and did not pretend it had; §269 and §289 both took real
ones.

**Before any migration**, step 3 of the
[§289 controlled-production deployment sequence](SECTION-289-CONTROLLED-PRODUCTION-DEPLOYMENT.md)
requires *taking* a fresh backup and step 4 requires *verifying* it. Those steps are a gate, not a
formality — migrations run before deploy, so the backup is the only way back from a bad migration.
The §268 runbook's step 3, which says to confirm a backup in the Render dashboard, is superseded:
there is no Render Postgres instance to confirm one on.

## What has actually been rehearsed

§269 took a **full logical backup of production and rehearsed a restore into a disposable
database**: 76/76 tables and 7 049/7 049 rows restored with zero differences.

§289 did it again, freshly and more strictly. Backup: 14.4 s, 7 810 853 bytes, 76 tables, 7 051
rows, sha256 `d4c2c351…`. Restore into a disposable **PostgreSQL 17.11** container — an exact
production server-version match — in 1 s with zero errors. Verified by **per-table content
checksum**, not by row count: all 76 tables content-identical, aggregate digest
`da17e9b755a540dac240c5f2bd8c7a7c` on both sides.

> **Pin the collation when you compare.** Neon runs `lc_collate=C.UTF-8`; a stock `postgres:17`
> container runs `en_US.utf8`. A checksum that orders rows by their text will report a difference
> on identical data. Order by the per-row hash `COLLATE "C"`. §289 hit this exactly once, on the
> `user` table, and it looked like corruption until the per-row hashes came back identical.

That establishes the backup is restorable and the dump is complete, which is a stronger claim than
"backups are enabled" and a weaker one than "we can restore production in place under time
pressure". The latter has not been exercised.

**The client matters.** Production is PostgreSQL 17.11 and a PostgreSQL 16 client refuses it. Use
`/opt/homebrew/opt/libpq/bin/pg_dump` (18.3), not the Homebrew `postgresql@16` binary, and use the
**direct** Neon endpoint rather than the `-pooler` one.

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

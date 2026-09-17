# Backup and restore

## Posture

**Corrected at §289.** The production database is **Neon** PostgreSQL 17.11 in `us-east-1`,
database `neondb` — **not** managed PostgreSQL on Render. The Render account contains no Postgres
instance at all (`GET /v1/postgres` returns an empty list). This document and
[`ROLLBACK-MODEL.md`](ROLLBACK-MODEL.md) both previously said Render, which would have sent an
operator looking for something that does not exist at the one step that is the only way back from a
bad migration.

**What the platform retains was read at §295 and re-read at §311**, both times from the owner's
already-authenticated console rather than from a credential this repository holds. It has not moved:

| | as at 2026-09-17 |
|---|---|
| Plan | **Free** |
| History / Instant Restore window | **6 hours** — the Free maximum |
| Snapshots | **none, and no schedule set**; schedules require an upgrade |
| Region / version | AWS `us-east-1`, PostgreSQL **17.11** |

Six hours covers the mistake an operator notices inside the working session. It does **not** cover
damage discovered the next morning, which is why the operator-controlled logical backup below is the
load-bearing half for anything beyond that window.

**§311 turned that backup from a thing somebody remembers into a thing that runs.** See
[`DISASTER-RECOVERY-RUNBOOK.md`](DISASTER-RECOVERY-RUNBOOK.md) for recovery itself; the mechanism is:

| script | what it does |
|---|---|
| `scripts/ops/backup-production-database.js` | dumps, uploads, **reads back and re-hashes**, writes metadata, applies retention, records freshness |
| `scripts/ops/verify-backup-restore.js` | restores an artifact into a disposable PostgreSQL and compares every table by content |
| `scripts/ops/verify-object-consistency.js` | reconciles `storage_objects` against R2 in both directions |
| `scripts/ops/check-backup-freshness.js` | answers "did the backup actually run?" from the destination, independently of the backup job |

**It has no durable destination yet.** Creating an isolated R2 bucket and a scoped token is a
product-owner action; until it exists, `.github/workflows/database-backup.yml` fails loudly rather
than going green. That gap is register entry `BR-5`.

§268 could not provision backups and did not pretend it had; §269, §289 and §311 all took real ones.

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

**§311 did it a third time, through the scheduled mechanism rather than by hand**, and added the two
things the earlier rehearsals did not have: an instrument that was *watched to fail*, and an
application proof on top of the restored data.

| | |
|---|---|
| Backup | 6.0 s, 7 898 796 bytes, 78 tables, 7 294 rows, sha256 `368fa047…`, schema head `1800000026000` |
| Restore target | a **freshly created empty** PostgreSQL **17.11** container — not an overwrite of a previous restore |
| Restore | 0.5 s, `pg_restore` exit 0, **0 errors** |
| Integrity | all **78/78** tables content-identical, aggregate digest `e093a62f81ac4d9e49011c43b5489f07` on both sides |
| Mutation control | changing **one character in one row** of the restored copy turned the comparison red and named the `user` table; restoring again turned it green |
| Application | booted against the restored database in **1.1 s**, authenticated, and served sites, inspections, reports, revisions, corrective actions and billing state — all 200, zero 5xx |

That establishes the backup is restorable, the dump is complete, the verifier can tell the difference,
and the product works on the result — which is a stronger claim than "backups are enabled" and still
a weaker one than "we can restore production in place under time pressure". The latter has not been
exercised, and the measured numbers above are all from a **local** container: a restore into Neon
over the network has not been timed.

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

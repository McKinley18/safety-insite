# §314 — BR-8, the rig and the method

## What was measured, and against what

Every assertion in this directory was produced by driving the **real application over real HTTP**,
on a disposable PostgreSQL and a real S3-compatible object store. Nothing is mocked, and the storage
service is not called directly except where a file says so explicitly.

The object store matters more than it usually would. `LocalTestStorageProvider` writes with
`flag: 'wx'`, so a **second PUT to an existing key fails** there — the exact overwrite BR-8 describes
cannot happen under it. Cloudflare R2 and MinIO both overwrite silently. A suite run against the
local test provider would therefore have reported BR-8 as unreproducible, so the rig uses **MinIO**,
which has R2's overwrite semantics.

```
disposable PostgreSQL   docker s314-pg     127.0.0.1:15432/idemtest
object store            docker s314-minio  127.0.0.1:19030   buckets s314-live, s314-recovery
application             node dist/main.js  127.0.0.1:4314    DEV_AUTH_BYPASS=false
```

Accounts are synthetic, on `@internal-acceptance.invalid`, created through the real `AuthService`
(real bcrypt hash, real agreement acceptance, real token minting). Registration over HTTP is
throttled as production abuse control; that control is not what §314 tests and was not weakened.

## The development database was never a target

`backend/.env` sets `DATABASE_URL` to the **development** database (`safescope`), and
`data-source.ts` gives `DATABASE_URL` precedence over the discrete `DB_*` variables. A shell that
forgot to source the rig environment would therefore have reached development data.

That is not left to discipline. Both `suite/lib.sh` and `suite/seed.js` carry a **rig guard** that
refuses to run unless the resolved target is `127.0.0.1:15432/idemtest`, and the guard was proven to
fire — against an unset `DATABASE_URL` and against the development database by name — before any
suite was run.

## The throttle was budgeted, not weakened

The application throttles 100 requests / 60 s per IP, and `DELETE /auth/me` 5 / 60 s. The suites
count their own requests and wait the window out. A 429 absorbed silently would let a throttled
request be recorded as a product outcome, which is the failure this avoids.

## Files

| File | What it is |
|---|---|
| `01-BEFORE-DEFECT-DEMONSTRATED.txt` | The three defects, reproduced against **unmodified** production code. |
| `02-AFTER-GATES.txt` | The same cases as gates against the repair, plus concurrency and authority. 61 assertions. |
| `03-MUTATIONS.txt` | Five controls removed one at a time; each must make the suite fail. Source restored by digest. |
| `04-BR7-REGRESSION.txt` | BR-7 ownership, erasure authority, tombstone semantics and no-resurrection, re-run. |
| `05-RECOVERY-INTEGRATION.txt` | §312/§312A behaviour after the repair, and the measured detection matrix. |
| `06-PRODUCTION-DIVERGENCE-SCAN.json` | The read-only production scan. Full re-hash of every object. |
| `07`–`10` | Canonical schema, entity contract, §307 security boundary, integration regression. |
| `suite/` | The scripts themselves, so the result is reproducible rather than merely reported. |

`suite/` hard-codes the session scratchpad path it ran from. Re-running it requires recreating the
two containers and the environment file described above; the committed gate
`backend/scripts/ops/verify-evidence-digest-integrity.js` needs none of that and runs against any
configured database and bucket, including production.

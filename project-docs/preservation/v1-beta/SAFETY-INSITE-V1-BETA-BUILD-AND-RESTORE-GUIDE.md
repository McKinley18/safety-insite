# Safety InSite v1 Beta — Build and Restore Guide

**Established at §289.** This is the document that answers one question: *if everything except this
repository were lost, how would someone rebuild Safety InSite v1 and restore its data?*

It is written to be followed by someone who does not have this session's context. Every identity it
asserts is recorded in the machine-readable companion,
[`release-manifest.json`](release-manifest.json), and every identity in that manifest can be
recomputed from the commands below.

> **What this candidate is, and is not.** The product source commit `94e2963427c46b4d69dcdd8664c4754c5fc72c37` is a
> **prepared candidate**. It has passed the §289 release build and gate set, its migrations have
> been rehearsed forward and back against a byte-identical copy of production, and it has **never
> been deployed**. The frozen validated *product* baseline remains
> `709ee151b932095020ea69d25daa04a337ccba16`. Nothing here should be read as saying the candidate
> is validated in production.

---

## 1. What the product is made of

| | |
|---|---|
| **Backend** | NestJS + TypeORM, `backend/`, deployed as a Render web service (`srv-d7kl74jeo5us73deaor0`, oregon, `0.5c-512mb`, 1 instance) |
| **Frontend** | Next.js App Router, `frontend-next/`, deployed as a Vercel project (`prj_iYd9sHjnCaR8bWXYnKOpw5OKU7hw`) |
| **Database** | **Neon** PostgreSQL 17.11, `us-east-1`, database `neondb` — **not** Render Postgres |
| **Object storage** | Cloudflare R2, bucket `insite-production`, S3-compatible, `forcePathStyle=true` |
| **Outbound email** | Resend, password reset only |
| **Analysis engine** | Deterministic HazLenz (customer-authoritative). Expert HazLenz exists and is **disabled in production** |

The two halves deploy independently and are *not* atomic with respect to each other. That is
deliberate: `MINIMUM_SUPPORTED_FRONTEND_VERSION` defines the backward-compatible client window so a
client mid-request during a switchover is not instantly obsolete.

---

## 2. Rebuilding from source

### 2.1 Confirm you have the right source

```bash
git ls-tree -r HEAD --format='%(path) %(objectname)' \
  | grep -E '^(backend/(src|scripts)/|backend/package(-lock)?\.json|backend/tsconfig|frontend-next/(app|components|lib|public|scripts)/|frontend-next/package(-lock)?\.json|frontend-next/(next\.config|tsconfig|tailwind))' \
  | LC_ALL=C sort | shasum -a 256
# must print 2ce8a1d7b045818cb9708af9414fe8d189523e334dad955b617268cc932f2618
```

That value is `applicationSourceDigest`, and it is **the identity that matters**. It covers only the
files that determine the built artifacts, so it answers the question you actually have — *is this
the product?* — rather than *is this the commit someone wrote down?*

**There is a second digest, `sourceDigest`, and it deliberately is not the binding.** It covers
every tracked file including documentation and evidence, which means it changes on every commit that
records anything about the release — including the commit that would record it. Its value at the
product source commit `94e2963427c46b4d69dcdd8664c4754c5fc72c37` is
`b1f3bd7e9eaab3ff2aad97208e84d661d32a4de58338226a47c1a174a6129574`, kept for completeness:

```bash
git ls-tree -r 94e2963427c46b4d69dcdd8664c4754c5fc72c37 --format='%(path) %(objectname)' \
  | LC_ALL=C sort | shasum -a 256
# prints b1f3bd7e9eaab3ff2aad97208e84d661d32a4de58338226a47c1a174a6129574
```

Expect the same command at the current tip to print something else. That is the point.

**Do not use the digest `3c2c5974…`.** It is misattributed and was retired at §288.

### 2.2 Build

```bash
cd backend
npm install --include=dev
npm run build:render          # bare tsc -> dist/

cd ../frontend-next
npm install
npm run build                 # next build -> .next/
```

> **Node is not pinned, and this is a real limitation.** Neither package declares `engines.node`,
> and there is no `.nvmrc` or `.node-version`. §289 built with **Node v20.20.2 / npm 10.8.2**.
> Vercel's project setting is **24.x**. The Render runtime version could not be read — Render
> exposes it through neither its API nor the service's startup output. So this guide can tell you
> that the *source* reproduces exactly and cannot promise that the *artifact* does. Pinning a Node
> version in both packages is the fix, and it is registered as `PV-3`.

### 2.3 Verify the build is the product you think it is

```bash
cd backend
npm run verify:274-successor-identity   # HazLenz successor identity
npm run hazlenz:verify                  # protected modules, evidence drift, current-state manifest
npm run release:check-build-context     # the deployed image contains the directories it must
npm run brand:audit
npm run beta:readiness                  # 58 local engineering checks, contacts nothing live

cd ../frontend-next
npx tsc --noEmit
npm run check:release-contract-parity   # shipped frontend version == frontend-next/package.json
```

`hazlenz:verify` must report **29/29 protected modules present** and successor identity
`8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee`. Two entries reporting
`UNVERIFIED_LIVE` (provider transport, billing/deployment) and one `ENVIRONMENTALLY_BLOCKED`
(object storage) are the expected result of a command that deliberately contacts nothing live.

---

## 3. Restoring the database

### 3.1 The client you need

Production is **PostgreSQL 17.11**. A PostgreSQL 16 client **refuses** it:

```
pg_dump: error: server version: 17.11; pg_dump version: 16.13
```

Use a 17-or-newer client. On the machine §289 ran from, the working binary was
`/opt/homebrew/opt/libpq/bin/pg_dump` (18.3) — the Homebrew `postgresql@16` formula is *not* it.

### 3.2 Taking a backup

```bash
PGD=/opt/homebrew/opt/libpq/bin/pg_dump
# Use the DIRECT Neon endpoint, not the -pooler one, for dump and restore.
DIRECT=$(echo "$DATABASE_URL" | sed 's/-pooler//')
"$PGD" "$DIRECT" -Fc -f prod-$(date -u +%Y%m%dT%H%M%SZ).dump
```

§289 measured this against live production: **14.4 s, 7 810 853 bytes, 76 tables, 7 051 rows.**

### 3.3 Restoring, and proving the restore is real

Restore into a **disposable** target first, always. Never restore over production to test a backup.

```bash
docker run -d --name restore-rehearsal -e POSTGRES_PASSWORD=x -e POSTGRES_DB=r \
  -p 55432:5432 postgres:17
/opt/homebrew/opt/libpq/bin/pg_restore \
  -d "postgresql://postgres:x@127.0.0.1:55432/r" --no-owner --no-privileges <dump>
```

Then prove it, rather than assuming it. Row counts are not enough; compare **content**:

```sql
-- Run against BOTH databases and diff the output.
SELECT string_agg(
  format('SELECT %L AS t, count(*) AS n, coalesce(md5(string_agg(h, '''' ORDER BY h COLLATE "C")), ''EMPTY'') AS ck
          FROM (SELECT md5(%I::text) AS h FROM public.%I) s', tablename, tablename, tablename),
  ' UNION ALL ')
FROM pg_tables WHERE schemaname='public'
\gexec
```

> **`COLLATE "C"` is not decoration.** Neon runs `lc_collate=C.UTF-8` and a stock `postgres:17`
> container runs `en_US.utf8`. Without it, the *same data* produces a different aggregate hash
> because the rows concatenate in a different order. §289 hit this exactly once, on the `user`
> table, and it looked like corruption until the per-row hashes came back identical.

§289 result: **all 76 tables content-identical**, aggregate digest
`da17e9b755a540dac240c5f2bd8c7a7c` on both sides. Restore took **1 s**.

### 3.4 What is *not* established about backups

Neon's control plane was not reachable from the §289 session — there is no `NEON_*` credential in
the repository or the environment. So the **platform** backup retention window and point-in-time
recovery setting are **unread**. What is established is an operator-controlled logical backup path
that does not depend on the Neon console at all, proven twice (§269 and §289).

Someone with Neon console access must record the retention window and the PITR setting. That is
register entry `BR-2`.

---

## 4. Restoring the schema to a known point

The candidate ships **54 migrations**; production has **50 applied**, head `1800000018000`. The four
pending migrations, all additive, all rehearsed at §289 against a copy of production:

| | migration | what it does | destructive? |
|---|---|---|---|
| 1 | `1800000019000` ExpertAnalysisAuthorityFoundation | 4 defaulted/nullable columns on `hazlenz_analyses`, new table `expert_analysis_executions`, 4 indexes, 6 constraints, one backfill | **No** |
| 2 | `1800000020000` ExpertHumanConfirmation | widens `human_reviews.decision` 24→32, replaces its CHECK, adds `settlementReviewId`, 2 partial unique indexes | **No** |
| 3 | `1800000021000` ProducerScopedAnalysisCurrentness | replaces the single-current index with a per-producer one | **No** |
| 4 | `1800000022000` CorrectiveActionLifecycle | 3 nullable columns on `corrective_actions`, 2 indexes | **No** |

Apply them with the command that exists inside the deployed artifact — not with `ts-node`, which is
a devDependency the runtime image does not install:

```bash
cd backend
npm run migrate:prod:dry-run     # reports what WOULD apply, changes nothing
npm run migrate:prod             # applies, then verifies schema in the same command
```

It must end with `RELEASE MIGRATION OK` and `applied / expected 54/54`.

**Rolling back the schema is a different question and is answered in
[`../../operations/ROLLBACK-MODEL.md`](../../operations/ROLLBACK-MODEL.md).** The short version:
the application rolls back, the schema does not. §289 proved that all four `down()` paths execute
cleanly and restore the pre-migration content exactly **on a database with no Expert analyses and
no settlements** — which is the production state today and will not be the production state once
the system is used.

---

## 5. Configuration the product cannot start without

Read the live names with `render env` or the Render API; **never** copy values into this repository.
§289 recorded 41 environment variables on the backend service. The ones whose *values* are
load-bearing and non-secret:

| variable | production value | why it matters |
|---|---|---|
| `NODE_ENV` | `production` | disables every development bypass, including `NEXT_PUBLIC_DISABLE_AUTH` on the client |
| `EXPERT_EXECUTION_ENABLED` | `false` | Expert HazLenz must stay off until separately authorised |
| `DEV_AUTH_BYPASS` | `false` | |
| `TYPEORM_SYNCHRONIZE` | `false` | the application refuses to start with it enabled in production |
| `ENABLE_MAINTENANCE_SEED` | `false` | |
| `STORAGE_PROVIDER` | `s3` | production cannot boot without `STORAGE_S3_BUCKET` |
| `GOVERNED_CUTOVER_MODE` | `GOVERNED_WITH_FALLBACK` | |
| `PASSWORD_RESET_PROVIDER` | `resend` | production refuses to run without it |

Secrets (`JWT_SECRET`, `DATABASE_URL`, `DB_PASSWORD`, `ANTHROPIC_API_KEY`, `STRIPE_*`,
`STORAGE_S3_*_KEY*`, `MAINTENANCE_SEED_TOKEN`, `REGULATORY_SYNC_KEY`, `STANDARDS_SYNC_KEY`) are
present in production and are **not** recorded here, by design.

On Vercel, only four variables exist and all are public-prefixed. **No backend secret is exposed to
Preview** — §289 verified this per target.

---

## 6. Restoring object storage

The bucket is `insite-production` on Cloudflare R2. §289 verified, non-destructively and without
touching customer data:

| check | result |
|---|---|
| bucket reachable, credentials authorise | PASS |
| public bucket policy | PASS — none attached |
| bucket ACL readable anonymously | PASS — `AccessDenied` |
| upload → authorised download | PASS — sha256 match |
| unsigned GET | PASS — refused, HTTP 400 |
| unsigned LIST | PASS — refused, HTTP 400 |
| delete, then re-read | PASS — `NoSuchKey` |
| residue under the probe prefix | 0 keys |

**Tenant isolation is database-enforced, not path-enforced.** The object key is
`<category>/<YYYY-MM-DD>/<randomUUID>` and deliberately carries no tenant identifier; the
`storage_objects` row carries `organizationId`/`ownerUserId` under a CHECK constraint permitting
exactly one scope, the `objectKey` column is `select: false`, and a retrieved object whose sha256
does not match the recorded digest is refused. An object identifier alone therefore confers no
access.

There is **no lifecycle rule and no retention sweeper**. An `expiresAt` column exists per object and
is enforced at read time. Retention policy is register entry `ST-3`, still open.

---

## 7. What this candidate does not do

Read [`release-manifest.json`](release-manifest.json) `knownLimitations` in full before relying on
anything. The four that most often surprise people:

1. **Expert HazLenz has never made a live provider call.** The transport is unverified end to end.
2. **No generated report has ever been round-tripped through production storage.** The bucket is
   verified; the product route through it is not.
3. **There is no monitoring aggregation or alerting.** Operational events are emitted to
   stdout/stderr with redaction and are read by looking at the platform log stream.
4. **The `outcomes` table exists in production although no migration creates it**, which defeats the
   containment argument written into `corrective-actions.service.ts`. See register entry `DB-4`.

---

## 8. Where the authority lives

This guide is a *rebuild* document. It is not the release authority and it does not state release
status. That is
[`project-docs/current/PRE-PRODUCTION-RELEASE-REGISTER.md`](../../current/PRE-PRODUCTION-RELEASE-REGISTER.md),
and where this guide and the register disagree, **the register is authoritative**.

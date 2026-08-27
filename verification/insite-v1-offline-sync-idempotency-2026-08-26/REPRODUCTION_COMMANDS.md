# Reproduction

All of it runs against a **disposable** database. Both suites refuse to start unless
`DATABASE_URL` names a `test_*` database, and neither touches the protected `safescope`
development database.

## 1. Disposable database (47 migrations, including 1800000015000)

```bash
createdb -h 127.0.0.1 test_insite_v1_idem_20260826

cd backend
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_v1_idem_20260826" \
DB_NAME=test_insite_v1_idem_20260826 \
npm run migration:run
```

`DATABASE_URL` takes precedence over the discrete `DB_*` variables, and `backend/.env` points it at
`safescope`. Override it explicitly on every command and confirm the resolved database name before
running anything mutable.

Confirm the three partial unique indexes exist:

```sql
select indexname, indexdef from pg_indexes where indexname like 'uq_%client_request%';
```

## 2. Disposable API on :4300

`DEV_AUTH_BYPASS=false` matters: `backend/.env` sets it to `true`, and with the bypass on an
unauthenticated request is answered as a synthetic user, which makes the two "unauthenticated must
be 401" probes in `test:cross-user-isolation` fail. Harness setting, not a product defect.

```bash
cd backend
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_v1_idem_20260826" \
DB_NAME=test_insite_v1_idem_20260826 \
PORT=4300 NODE_ENV=development DEV_AUTH_BYPASS=false DEV_FORCE_PRO=false \
CORS_ORIGINS="http://127.0.0.1:3300,http://localhost:3300" \
FRONTEND_URL="http://127.0.0.1:3300" \
STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=/tmp/insite-offline-storage \
npx ts-node -T src/main.ts
```

`STORAGE_PROVIDER=local_test` (not `local`) and `STORAGE_LOCAL_ROOT` are required for the evidence
path — the same two prerequisites §79.8 recorded.

## 3. Production frontend on :3300

The service worker is deliberately not registered under `next dev` (a cached shell in front of a
rebuilding dev server serves stale chunks), so the browser suite needs a production build.

```bash
cd frontend-next
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4300 NEXT_DIST_DIR=.next-offline-build npx next build
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4300 NEXT_DIST_DIR=.next-offline-build npx next start -p 3300 -H 127.0.0.1
```

## 4. The three suites

```bash
# Server contract. Fast, no browser.
cd backend
NODE_ENV=test DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_v1_idem_20260826" \
API_BASE_URL=http://127.0.0.1:4300 npm run test:offline-sync-idempotency

# Source contract. No stack at all — this is the one that belongs in every regression run.
cd frontend-next
npm run check:offline-field-capture

# End-to-end behaviour matrix. Needs the full stack above.
APP_URL=http://127.0.0.1:3300 API_BASE_URL=http://127.0.0.1:4300 \
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_v1_idem_20260826" \
npm run verify:offline-field-capture
```

The browser suite signs in and out repeatedly, because switching accounts *is* the isolation test.
`POST /auth/login` is throttled to 5 per 60s per IP, so it waits the window out rather than
reporting a rate limit as an authorisation defect. Expect one or two 62-second pauses per run, and
leave a similar gap between the backend auth suites, as §79.10 recorded.

## Deployment ordering (why the migration goes first)

The migration adds three nullable columns and three partial indexes. Nothing is rewritten and no
constraint can reject an existing row, so the **currently running code tolerates it** — it selects
columns it knows about and never sees the new one. The new code, by contrast, **requires** it: the
entities declare the column and the service queries it.

That makes the order `migration → deploy`, the same classification §76 applied to its six
migrations: `REQUIRED_BEFORE_NEW_CODE` **and** `SAFE_BEFORE_NEW_CODE`, so there is no ordering
uncertainty to stop on.

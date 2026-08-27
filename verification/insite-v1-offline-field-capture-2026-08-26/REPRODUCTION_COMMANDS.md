# Reproduction

Everything below runs against a **disposable** database. The offline verifier refuses to start
unless `DATABASE_URL` names a `test_*` database, and it never touches the protected `safescope`
development database.

## 1. Disposable database

```bash
createdb -h 127.0.0.1 test_insite_v1_offline_20260826

cd backend
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_v1_offline_20260826" \
DB_NAME=test_insite_v1_offline_20260826 \
npm run migration:run
```

`DATABASE_URL` takes precedence over the discrete `DB_*` variables, and `backend/.env` points it at
`safescope`. Override it explicitly on every command and confirm the resolved database name before
running anything mutable.

## 2. Disposable API on :4300

`DEV_AUTH_BYPASS=false` matters. `backend/.env` sets it to `true`, and with the bypass on an
unauthenticated request is answered as a synthetic user — which makes the two "unauthenticated
requests must be 401" probes in `test:cross-user-isolation` fail. That is a harness setting, not a
product defect.

```bash
cd backend
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_v1_offline_20260826" \
DB_NAME=test_insite_v1_offline_20260826 \
PORT=4300 NODE_ENV=development DEV_AUTH_BYPASS=false DEV_FORCE_PRO=false \
CORS_ORIGINS="http://127.0.0.1:3300,http://localhost:3300" \
FRONTEND_URL="http://127.0.0.1:3300" \
STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=/tmp/insite-offline-storage \
npx ts-node -T src/main.ts
```

`STORAGE_PROVIDER=local_test` (not `local`) and `STORAGE_LOCAL_ROOT` are required for the evidence
upload path — the same two prerequisites §79.8 recorded.

## 3. Production frontend on :3300

The service worker is deliberately **not** registered under `next dev` (a cached shell would serve
stale chunks against a rebuilding dev server), so the offline suite needs a production build.

```bash
cd frontend-next
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4300 NEXT_DIST_DIR=.next-offline-build npx next build
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4300 NEXT_DIST_DIR=.next-offline-build npx next start -p 3300 -H 127.0.0.1
```

## 4. The suites

```bash
cd frontend-next

# Server-free contract verifier — belongs in every regression run.
npm run check:offline-field-capture

# The A-L behaviour matrix. Needs the stack above.
APP_URL=http://127.0.0.1:3300 API_BASE_URL=http://127.0.0.1:4300 \
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_v1_offline_20260826" \
npm run verify:offline-field-capture
```

The behaviour matrix signs in and out repeatedly, because switching accounts *is* the isolation
test. `POST /auth/login` is throttled to 5 per 60s per IP, so the suite waits the window out rather
than reporting a rate limit as an authorisation defect. Expect roughly one 62-second pause per run.
Run the backend auth suites (`test:auth-flow`, `test:entitlement-boundary`,
`test:authenticated-entitlement-path`) with a similar gap between them, as §79.10 recorded.

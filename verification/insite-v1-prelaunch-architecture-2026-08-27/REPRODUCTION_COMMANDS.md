# Reproduction — prelaunch architecture measurement

Everything below runs against a **disposable** database. The instrument refuses to start
unless `DATABASE_URL` names a `test_*` database. The protected `safescope` development
database and the pre-existing developer backend on port **4000** are never used.

## 1. Disposable database (47 migrations)

```bash
createdb -h 127.0.0.1 test_insite_prelaunch_ux_20260827

cd backend
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_prelaunch_ux_20260827" \
DB_NAME=test_insite_prelaunch_ux_20260827 \
npm run migration:run

psql -h 127.0.0.1 -d test_insite_prelaunch_ux_20260827 -t -c "select count(*) from migrations;"
# expect 47
```

`DATABASE_URL` takes precedence over the discrete `DB_*` variables and `backend/.env`
points it at `safescope`. Override it explicitly on every command and confirm the resolved
database name before running anything mutable.

## 2. Disposable API on :4310

```bash
cd backend
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_prelaunch_ux_20260827" \
DB_NAME=test_insite_prelaunch_ux_20260827 \
PORT=4310 NODE_ENV=development DEV_AUTH_BYPASS=false DEV_FORCE_PRO=false \
CORS_ORIGINS="http://127.0.0.1:3310" FRONTEND_URL="http://127.0.0.1:3310" \
STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=/tmp/insite-ux-storage \
npx ts-node -T src/main.ts
```

`STORAGE_PROVIDER=local_test` (not `local`) and `STORAGE_LOCAL_ROOT` are required for the
evidence and report-storage paths.

## 3. The measurement instrument

It lives in this package rather than in `backend/scripts/`, because this phase is not
authorized to add production or repository test surface. Run it from `backend/` so its
`grant-test-entitlement.ts` call resolves, and pass compiler options explicitly because it
sits outside the backend `tsconfig` root:

```bash
cd backend
NODE_ENV=test \
DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_prelaunch_ux_20260827" \
API_BASE_URL=http://127.0.0.1:4310 \
TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node","target":"es2020","esModuleInterop":true,"skipLibCheck":true}' \
npx ts-node -T --skip-project \
  ../verification/insite-v1-prelaunch-architecture-2026-08-27/measurement/measure-add-finding.ts
```

It prints the per-step server-call ledger, the number of findings materialized per
observation, the HTTP 409 on the post-report add-finding path, and the report-list payload
size.

## 4. The `shield` false-positive probe

Register a user, grant it the paid entitlement through the disposable-only helper, then
classify one sentence at a time:

```bash
cd backend
NODE_ENV=test DATABASE_URL="postgresql://<user>@127.0.0.1:5432/test_insite_prelaunch_ux_20260827" \
  npx ts-node scripts/grant-test-entitlement.ts "<userId>" 2

curl -s -X POST http://127.0.0.1:4310/safescope-v2/classify \
  -H 'content-type: application/json' -H "authorization: Bearer <token>" \
  -d '{"text":"A splash shield was missing from the parts washer.","scopes":["all"]}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);[print(h['domainId'],h['confidence']) for h in (d.get('multiHazardDecomposition') or {}).get('hazards',[])]"
# expect: excavation_trenching 0.85
```

Compare against `"an unshored trench three metres deep had a spoil pile at the edge"`,
which scores **0.6**.

## 5. Teardown

```bash
pkill -f "ts-node -T src/main.ts"
dropdb -h 127.0.0.1 test_insite_prelaunch_ux_20260827
rm -rf /tmp/insite-ux-storage
psql -h 127.0.0.1 -d safescope -t -c "select count(*) from migrations;"   # expect 35, unchanged
```

# KG-4D — reproduction commands

Every database-touching command names its target and documents which suite **owns** it. Since KG-4C,
an unmarked database is refused; claiming one requires `KG_TEST_DB_INITIALIZE_OWNERSHIP` naming it
**exactly**.

```bash
cd /Users/mckinley/Desktop/Safety_InSite/backend
U=$(whoami)
unset DATABASE_URL          # backend/.env sets one; unset it before anything that resolves its own target
```

## 0. Preservation baseline

```bash
cd /Users/mckinley/Desktop/Safety_InSite
git rev-parse HEAD                 # -> 5f050858227ca11cf90d2f6bf64148e70a018b64
git branch --show-current          # -> release/insite-rc-2026-08-18
git rev-list --count @{u}..HEAD    # -> 0
git stash list | wc -l             # -> 4
git tag | wc -l                    # -> 23
shasum -a 256 -c verification/.../kg-3e/unrelated-worktree-changes.sha256   # 18/18 OK

psql -h 127.0.0.1 -U $U -d safescope -tAc "select count(*) from migrations;"   # -> 35
psql -h 127.0.0.1 -U $U -d safescope -tAc \
  "select count(*) from information_schema.tables
    where table_name in ('regulatory_release_records','regulatory_release_record_reviews',
                         'knowledge_release_events','kg_test_database_ownership');"   # -> 0
```

## 1. Pure suites — no database, no server

```bash
npm run test:kg4d-orchestration      # -> 151 passed, 0 failed
npm run test:kg4d-default-off        # -> 119 passed, 0 failed  (reachability + inertness + inventory)
```

## 2. DB ownership black box — **OWNS `test_kg4d_bb_{unmarked,foreign,owned}`**

```bash
npm run test:kg4d-db-ownership-blackbox   # -> 19 passed, 0 failed
```

Creates all three, drops all three, imports nothing from the guard it is testing. It runs
`npm run test:regulatory-release-lifecycle` as a child process and then queries the database
directly to prove the sentinel rows survived.

## 3. The KG-4D E2E environment — **OWNS `test_kg4d_e2e_20260821`**

```bash
D=test_kg4d_e2e_20260821
dropdb -h 127.0.0.1 -U $U --if-exists $D && createdb -h 127.0.0.1 -U $U $D
E2E="postgresql://$U@127.0.0.1:5432/$D"
DATABASE_URL="$E2E" npm run migration:run            # 46 migrations
DATABASE_URL="$E2E" npm run seed:safescope-standards
#  -> 35 records, manifest 14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b
# then: approve all 35 records through ReleaseRecordReviewService and activate the release,
#       INSIDE the owned clone only (reviewerId is required; `reviewer` is not the field name)
```

Two accounts; only the FIRST is allowlisted. Register via `POST /auth/register`; the auth throttle
is **5/60s and is not relaxed** — wait ~13s between registrations.

```
kg4d-shadow@example.com   -> ALLOWLISTED
kg4d-legacy@example.com   -> NOT allowlisted
NODE_ENV=test DATABASE_URL="$E2E" npx ts-node scripts/grant-test-entitlement.ts <userId> 10
```

## 4. The pre-integration baseline — a scratch REPO copy

Phase 3 needs a true before/after, and the working tree must not be reverted. The scratch copy has
to be **repo-shaped**, not just `backend/src`: the app reads `../safescope-data` relative to its
working directory, and a copy without it starts in degraded mode and produces a worthless baseline.

```bash
S=<scratch>
mkdir -p $S/repo-baseline
for d in safescope-data test-data scripts tools research project-docs docs verification; do
  ln -s /Users/mckinley/Desktop/Safety_InSite/$d $S/repo-baseline/$d
done
mkdir -p $S/repo-baseline/backend
(cd backend && tar --exclude=node_modules --exclude=dist -cf - .) | (cd $S/repo-baseline/backend && tar -xf -)
ln -s /Users/mckinley/Desktop/Safety_InSite/backend/node_modules $S/repo-baseline/backend/node_modules
# then revert the KG-4D integration IN THE COPY ONLY:
#   safescope-v2.controller.ts  -> restore the pre-KG-4D block, drop the orchestration import
#   inspection.service.ts       -> restore the plain provenance return, drop the two imports
```

Sanity check the baseline is not degraded before trusting it:

```bash
grep -c "degraded advisory fallback" <baseline server log>    # -> 0
```

## 5. Servers

```bash
# integrated, DEFAULT OFF (no cutover variables at all)
PORT=4350 NODE_ENV=test DATABASE_URL="$E2E" STORAGE_PROVIDER=local_test \
  STORAGE_LOCAL_ROOT=$S/storage-kg4d CORS_ORIGINS="http://127.0.0.1:3350" \
  JWT_SECRET=<32+ chars> npx ts-node src/main.ts &

# pre-integration baseline, same database
(cd $S/repo-baseline/backend && PORT=4351 … npx ts-node src/main.ts &)

# integrated, SHADOW for ONE account
PORT=4350 … GOVERNED_CUTOVER_MODE=SHADOW \
  GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST=<userId of kg4d-shadow> \
  GOVERNED_CUTOVER_SHADOW_STAGE=STAGE_1_SINGLE_ACCOUNT \
  GOVERNED_CUTOVER_OBSERVABILITY=enabled npx ts-node src/main.ts &
```

## 6. Phase 3 — LEGACY invariance across the integration

```bash
V=../verification/.../kg-4d
for run in A B; do
  API_BASE_URL=http://127.0.0.1:4351 KG4D_EMAIL=… KG4D_PASSWORD=… \
    OUT=$V/captures/baseline-preintegration-$run.json LABEL=baseline-preintegration-$run \
    npm run run:kg4d-customer-capture
done
API_BASE_URL=http://127.0.0.1:4350 … OUT=$V/captures/integrated-defaultoff-A.json \
  LABEL=integrated-defaultoff-A npm run run:kg4d-customer-capture

VOLATILITY_A=$V/captures/baseline-preintegration-A.json \
VOLATILITY_B=$V/captures/baseline-preintegration-B.json \
LEFT=$V/captures/baseline-preintegration-A.json \
RIGHT=$V/captures/integrated-defaultoff-A.json \
REPORT_OUT=$V/phase3-legacy-invariance.json EXPECT=IDENTICAL \
  npm run compare:kg4d-customer-capture
#  -> 8/8 identical, governed key leak: none, mean 7.0 volatile paths/case
```

The capture harness paces at 20/60s under the classify throttle of 30/60s and **refuses a 429**
rather than recording it. Do not raise the throttle.

## 7. Phases 5 and 14 — SHADOW invariance and cohort isolation

```bash
# against the SHADOW server
… OUT=$V/captures/shadow-eligible-A.json    LABEL=shadow-eligible-A    # allowlisted account
… OUT=$V/captures/shadow-noneligible-B.json LABEL=shadow-noneligible-B # non-eligible account

# baseline vs eligible, baseline vs non-eligible, eligible vs non-eligible -> all 8/8 identical
```

## 8. Phases 6, 13, 17 — real HTTP + real rows

```bash
API_BASE_URL=http://127.0.0.1:4350 DATABASE_URL="$E2E" npm run test:kg4d-integration-e2e
#  -> 42 passed, 0 failed
```

## 9. Phase 11 — kill switch on the real server

```bash
# restart with GOVERNED_CUTOVER_KILL_SWITCH=engaged, everything else identical
# then classify as the ALLOWLISTED account:
#  -> HTTP 201, 0 v2 shadow events in the log, no governed keys in the payload
```

## 10. Phase 15 — browser (mandatory)

Isolated frontend; the working tree's `frontend-next` is never started against. **Hard-link**
`node_modules` (`cp -Rl`) — a symlink fails Turbopack with "points out of the filesystem root". The
scratch `.env.local` is replaced so it targets 4350 and does **not** disable auth.

```bash
(cd $S/fe-kg4d && npx next dev -p 3350 &)
cp verification/.../kg-4d/browser/harness/kg4d-integrated-shadow-invariance.mjs $S/fe-kg4d/
(cd $S/fe-kg4d && API_BASE_URL=http://127.0.0.1:4350 APP_BASE_URL=http://127.0.0.1:3350 \
  SHADOW_EMAIL=… SHADOW_PASSWORD=… LEGACY_EMAIL=… LEGACY_PASSWORD=… \
  SHADOW_INSPECTION_ID=… LEGACY_INSPECTION_ID=… SHOT_DIR=<abs>/kg-4d/browser \
  node kg4d-integrated-shadow-invariance.mjs)
#  -> 128/128, 16 screenshots
```

Two things the harness had to learn the hard way, both recorded so nobody repeats them:
the app's auth key is **`sentinel_auth_token`**, and the workspace selects its inspection from
**`sentinel_selected_inspection_context`**, not from a URL. Guessing either produces a login screen
or a 404 on which every equality assertion passes.

## 11. Regression

```bash
SOURCE_DB=test_kg3f_remediation_20260820 npm run test:kg3f-retrieval-determinism   # 170/170
DATABASE_URL=…test_kg3f_remediation_20260820 npm run test:kg3f-ranking-adversarial #  54/54
npm run test:kg3f-56-14132-predicate                                               #  16/16
DATABASE_URL=…test_kg4c_regression_20260821 npx ts-node \
  scripts/test-kg3e-citation-granularity.ts federal-core-2026-07-30.1              #  48/48
npm run test:kg4a-cutover-contract                                                 # 146/146
SOURCE_DB=test_kg3f_remediation_20260820 npm run test:kg4a-governed-resolution      #  99/99
npm run test:kg4a-provenance-pinning                                               #  53/53
SOURCE_DB=test_kg3f_remediation_20260820 npm run test:kg4a-default-off             #  51/51
npm run test:kg4b-shadow-contract                                                  # 123/123
SOURCE_DB=test_kg4b_shadow_20260820 npm run test:kg4b-shadow-adversarial           #  84/84
CORPUS_DIR=…/kg-4b/corpus npm run test:kg4b-privacy-review                         #  26/26
npm run test:kg4c-production-shadow-contract                                       # 438/438
npm run test:kg4c-disabled-deployment                                              #  80/80
npm run test:kg4c-db-ownership                                                     #  31/31

# MUTATING -- each needs its OWN database and an exact initialize token:
for s in approval corpus_matrix release_integrity reviewer backing; do
  createdb -h 127.0.0.1 -U $U -T test_kg4c_regression_20260821 test_kg4d_mut_$s
done
DATABASE_URL=…test_kg4d_mut_approval          KG_TEST_DB_INITIALIZE_OWNERSHIP=test_kg4d_mut_approval          npm run test:approval-contract              # 57/57
DATABASE_URL=…test_kg4d_mut_corpus_matrix     KG_TEST_DB_INITIALIZE_OWNERSHIP=test_kg4d_mut_corpus_matrix     npm run test:governed-corpus-matrix         # 60/60
DATABASE_URL=…test_kg4d_mut_release_integrity KG_TEST_DB_INITIALIZE_OWNERSHIP=test_kg4d_mut_release_integrity npm run test:release-integrity-and-approval # 44/44
DATABASE_URL=…test_kg4d_mut_reviewer          KG_TEST_DB_INITIALIZE_OWNERSHIP=test_kg4d_mut_reviewer          npm run test:reviewer-approval              # 62/62
DATABASE_URL=…test_kg4d_mut_backing           KG_TEST_DB_INITIALIZE_OWNERSHIP=test_kg4d_mut_backing           npm run test:standards-backing-contract     # 35/35

DATABASE_URL=…test_kg4c_regression_20260821 npm run test:hazlenz-core   # 28 of 30; the two documented failures
npm run build                                    # exit 0
(cd ../frontend-next && npx tsc --noEmit)        # exit 0
```

## Databases created by KG-4D (all disposable)

Kept: `test_kg4d_e2e_20260821` · `test_kg4d_mut_{approval,corpus_matrix,release_integrity,reviewer,backing}`
Created and dropped per run: `test_kg4d_bb_{unmarked,foreign,owned}`

**Never touched:** `safescope`, `sentinel_dev`, `sentinel_safety`, and every KG-1…KG-4C evidence
database (KG-3F's and KG-4B's corpora were used **read-only** as `SOURCE_DB`).

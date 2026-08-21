# KG-4B — reproduction commands

Every database-touching command names its target and **documents which suite OWNS it**. The hard
rule: a mutating suite may READ a corpus and must WRITE only to a database it created itself.

```bash
cd /Users/mckinley/Desktop/Safety_InSite/backend
U=$(whoami)
```

> **Ambient `DATABASE_URL`.** `backend/.env` sets one. The KG-4B mutating suites deliberately do NOT
> import `dotenv/config`; they name every connection and announce an ambient `DATABASE_URL` as
> **ignored**. Unset it anyway when in doubt.

## 0. Preservation baseline

```bash
git rev-parse HEAD          # -> 5f050858227ca11cf90d2f6bf64148e70a018b64
git branch --show-current   # -> release/insite-rc-2026-08-18
git stash list | wc -l      # -> 4
git tag | wc -l             # -> 23
shasum -a 256 -c verification/.../kg-3e/unrelated-worktree-changes.sha256   # 18/18 OK
shasum -a 256 -c verification/.../kg-4a/kg4a-changed-files.sha256           # 22/22 OK
shasum -a 256 -c verification/.../kg-4b/kg4b-changed-files.sha256           # 14/14 OK
```

## 1. Pure contract — no database, safe anywhere

```bash
npm run test:kg4b-shadow-contract                    # -> 123 passed, 0 failed
npm run test:kg4b-shadow-contract -- --emit ../verification/.../kg-4b/contracts/shadow-taxonomy.json
```

## 2. The KG-4B shadow environment — **OWNS `test_kg4b_shadow_20260820`**

```bash
dropdb -h 127.0.0.1 -U $U --if-exists test_kg4b_shadow_20260820
createdb -h 127.0.0.1 -U $U test_kg4b_shadow_20260820
SDB="postgresql://$U@127.0.0.1:5432/test_kg4b_shadow_20260820"
DATABASE_URL="$SDB" npm run migration:run
DATABASE_URL="$SDB" npm run seed:safescope-standards
#  -> 35 records, manifestChecksum 14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b
# approve every record and activate the release, INSIDE the owned database only

# two accounts; only the FIRST is allowlisted
#   kg4b-shadow@example.com  -> ALLOWLISTED
#   kg4b-legacy@example.com  -> NOT allowlisted
# register via POST /auth/register {email,password,name}; 5/60s throttle -- wait 13s between them
NODE_ENV=test DATABASE_URL="$SDB" npx ts-node scripts/grant-test-entitlement.ts <userId> 10

NODE_ENV=test PORT=4340 DATABASE_URL="$SDB" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/storage-kg4b \
  CORS_ORIGINS="http://127.0.0.1:3340" JWT_SECRET=<32+ chars> \
  GOVERNED_CUTOVER_MODE=SHADOW \
  GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST=<userId of kg4b-shadow> \
  GOVERNED_CUTOVER_OBSERVABILITY=enabled \
  npx ts-node src/main.ts &
```

## 3. The corpus run + invariance oracle (Phases 3, 4, 5, 6, 9)

```bash
: > $SCRATCH/kg4b-server.log        # the JSONL corpus is collected from the server log
API_BASE_URL=http://127.0.0.1:4340 SERVER_LOG=$SCRATCH/kg4b-server.log \
  OUT_DIR=../verification/.../kg-4b/corpus npm run run:kg4b-shadow-corpus
#  -> 145 passed, 0 failed
#     43 cases (31 gold-set + 12 KG-4B fixtures) · 37 with citations · 74 comparisons · 83 events
#     43/43 customer payloads identical · 0 carried governed keys
```

Takes roughly 5 minutes: `/safescope-v2/classify` is throttled at 30/60s and the runner paces at
28/60s. **Do not raise the throttle** — a throttled response is refused, not tolerated.

## 4. Analytics + event volume (Phases 10, 14)

```bash
CORPUS_DIR=../verification/.../kg-4b/corpus \
  REPORT_OUT=../verification/.../kg-4b/analytics/shadow-analytics.json \
  npm run report:kg4b-shadow-analytics
#  -> 41 EXACT_MATCH · 15 GOVERNED_MISSING · 14 GRANULARITY · 13 APPLICABILITY
#     BLOCKING 0 · 83 events / 83 distinct keys / 0 duplicates · cardinality holds
```

## 5. Adversarial: provenance, pinning, spoofing, failure injection — **OWNS `test_kg4b_adversarial_run`**

```bash
unset DATABASE_URL
SOURCE_DB=test_kg4b_shadow_20260820 npm run test:kg4b-shadow-adversarial
#  -> 84 passed, 0 failed; creates and drops its own database, proves the source unchanged
```

## 6. Layout determinism — **OWNS 7 databases `test_kg4b_layout_*`**

```bash
unset DATABASE_URL
SOURCE_DB=test_kg4b_shadow_20260820 CORPUS_DIR=../verification/.../kg-4b/corpus \
  REPORT_OUT=../verification/.../kg-4b/determinism/layout-invariance.json \
  npm run test:kg4b-shadow-determinism
#  -> 18 passed, 0 failed; 52 probes x 7 layouts -> ONE digest 0bce5a71a9d26642…
```

## 7. Privacy review (Phase 11)

```bash
CORPUS_DIR=../verification/.../kg-4b/corpus \
  REPORT_OUT=../verification/.../kg-4b/privacy/privacy-review.json \
  npm run test:kg4b-privacy-review
#  -> 26 passed, 0 failed; 14 real PII/secret markers searched, 0 found
```

## 8. Performance — **OWNS `test_kg4b_perf_run`**

```bash
SOURCE_DB=test_kg4b_shadow_20260820 \
  REPORT_OUT=../verification/.../kg-4b/perf/shadow-performance.json \
  npm run report:kg4b-shadow-performance
#  -> SHADOW 1.187 ms/analysis at 10 findings; telemetry 0.019 ms/event; queries 2/6/7 (no N+1)
```

## 9. Default-off (Phase 19) — requires the SHADOW server from §2

```bash
API_BASE_URL=http://127.0.0.1:4340 npm run test:kg4b-default-off
#  -> 48 passed, 0 failed
```

## 10. Browser (Phase 18) — isolated frontend, real Chromium

The scratch frontend is a `tar` of `frontend-next` minus `node_modules`/`.next`, with `node_modules`
hard-linked in and `.env.local` replaced so it points at 4340 and does **not** disable auth. **The
working tree's `frontend-next` is never started against.**

```bash
(cd $SCRATCH/fe-kg4b && npx next dev -p 3340 &)
cp verification/.../kg-4b/browser/harness/kg4b-shadow-invariance.mjs $SCRATCH/fe-kg4b/
(cd $SCRATCH/fe-kg4b && API_BASE_URL=http://127.0.0.1:4340 APP_BASE_URL=http://127.0.0.1:3340 \
  SHADOW_EMAIL=… LEGACY_EMAIL=… PASSWORD=… \
  SHADOW_INSPECTION_ID=… LEGACY_INSPECTION_ID=… \
  SHOT_DIR=<abs>/kg-4b/browser node kg4b-shadow-invariance.mjs)
#  -> 576/576; 8 screenshots
```

> Name browser fixtures **neutrally**. An inspection titled `…SHADOW` put the literal word on screen
> and the forbidden-vocabulary check correctly failed the pass.

## 11. Regression — **OWNS `test_kg4b_regression_20260820`** + one owned DB per mutating suite

```bash
REG="postgresql://$U@127.0.0.1:5432/test_kg4b_regression_20260820"
DATABASE_URL="$REG" npm run migration:run && DATABASE_URL="$REG" npm run seed:safescope-standards
npm run build                                  # exit 0
(cd ../frontend-next && npx tsc --noEmit)      # exit 0

# MUTATING — one owned database each, cloned from the regression DB:
#   test:governed-corpus-matrix         -> test_kg4b_mut_governed_corpus_matrix     -> 60/60
#   test:release-integrity-and-approval -> test_kg4b_mut_release_integrity          -> 44/44
#   test:kg3d-corpus-remediation        -> clone of test_kg3f_remediation_20260820  -> 31/31
#   test:regulatory-release-lifecycle   -> SHOULD own one too; it REPLACES every release row
#
# test:kg3e-citation-granularity needs federal-core-2026-07-30.1 intact, so give it a clean DB:
#   fresh createdb + migration:run + seed:safescope-standards -> 48/48

DATABASE_URL="$REG" npm run test:hazlenz-core   # -> 28 of 30; the two documented failures only

# server-dependent, on port 4341 with NO cutover env (port 4000 is a pre-existing developer backend)
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4341 npm run test:knowledge-release-provenance  # 27/27
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4341 npm run test:canonical-workflow
```

## Databases created by KG-4B (all disposable)

Kept: `test_kg4b_shadow_20260820` · `test_kg4b_regression_20260820` ·
`test_kg4b_mut_governed_corpus_matrix` · `test_kg4b_mut_release_integrity` · `test_kg4b_mut_kg3d`

Created and dropped per run: `test_kg4b_adversarial_run` · `test_kg4b_layout_*` (7) ·
`test_kg4b_perf_run` · `test_kg4b_manifest_check` · `test_kg4b_gran_check`

**Never touched:** `safescope`, `sentinel_dev`, `sentinel_safety`, and every `test_kg1…test_kg4a`
evidence database except as a **read-only** `pg_dump` source.

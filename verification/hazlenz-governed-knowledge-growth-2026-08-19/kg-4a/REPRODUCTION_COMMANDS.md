# KG-4A — reproduction commands

Every database-touching command names its target explicitly and **documents which suite OWNS that
database**. The KG-4A hard guardrail: a mutating suite may READ a corpus and must WRITE only to a
database it created itself.

```bash
cd /Users/mckinley/Desktop/Safety_InSite/backend
U=$(whoami)
```

> **Ambient `DATABASE_URL`.** `backend/.env` sets one, and `import 'dotenv/config'` loads it. The two
> mutating KG-4A suites deliberately **do not import dotenv** and name every connection explicitly; if
> a `DATABASE_URL` is present they announce it as **ignored**. Unset it anyway when in doubt.

## 0. Preservation baseline

```bash
cd /Users/mckinley/Desktop/Safety_InSite
git rev-parse HEAD          # -> 5f050858227ca11cf90d2f6bf64148e70a018b64
git branch --show-current   # -> release/insite-rc-2026-08-18
git stash list | wc -l      # -> 4
git tag | wc -l             # -> 23
shasum -a 256 -c verification/.../kg-3e/unrelated-worktree-changes.sha256      # -> 18/18 OK
shasum -a 256 -c verification/.../kg-4a/kg4a-changed-files.sha256              # -> 22/22 OK
```

## 1. Pure contract suite — no database, safe anywhere

```bash
npm run test:kg4a-cutover-contract                  # -> 146 passed, 0 failed
npm run test:kg4a-cutover-contract -- --emit ../verification/.../kg-4a/contracts/fallback-matrix.json
```

## 2. Adversarial resolver + failure matrix — **OWNS `test_kg4a_resolution_run`**

Reads `SOURCE_DB` (read-only), creates/drops its own database, and proves the source unchanged.

```bash
unset DATABASE_URL
SOURCE_DB=test_kg3f_remediation_20260820 npx ts-node scripts/test-kg4a-governed-resolution.ts
#  -> 99 passed, 0 failed
```

## 3. Provenance, mixed provenance, pinning, rollback, anti-spoofing — **OWNS `test_kg4a_gate_run`**

```bash
npm run test:kg4a-provenance-pinning                # -> 53 passed, 0 failed
```

## 4. Default-off proof — **OWNS `test_kg4a_defaultoff_run`**

```bash
unset DATABASE_URL
SOURCE_DB=test_kg3f_remediation_20260820 npx ts-node scripts/test-kg4a-default-off.ts
#  -> 51 passed, 0 failed
```

## 5. The KG-4A corpus + the 56.14132(b)(1) record — **OWNS `test_kg4a_corpus_20260820`**

```bash
dropdb -h 127.0.0.1 -U $U --if-exists test_kg4a_corpus_20260820
createdb -h 127.0.0.1 -U $U test_kg4a_corpus_20260820
export DATABASE_URL="postgresql://$U@127.0.0.1:5432/test_kg4a_corpus_20260820"
npm run migration:run                               # 46 migrations, incl. 1800000014000
npm run seed:safescope-standards
#  -> recordCount 35, manifestChecksum 14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b
#     (the CONTROL, with the KG-4A record removed, reproduces 34 / bee47ebe… — see the adjudication)

npm run verify:kg4a-record-source -- federal-core-2026-07-30.1
#  -> 31 passed, 0 failed
#     RECORD CHECKSUM FOR APPROVAL: 388a349c2b0a6f6d5c0deba02d43f54717b54a2c1e6957e5c6f4c3eb5f616d5a

# negative control: a wrong checksum is refused
npx ts-node scripts/review-regulatory-release-record.ts approve \
  --release federal-core-2026-07-30.1 --citation "30 CFR 56.14132(b)(1)" \
  --expected-checksum 0000...0000 --reviewer kg-4a-negative-control
#  -> {"refused": true, "failedGates": ["checksumMatches"]}

npx ts-node scripts/review-regulatory-release-record.ts approve \
  --release federal-core-2026-07-30.1 --citation "30 CFR 56.14132(b)(1)" \
  --expected-checksum 388a349c2b0a6f6d5c0deba02d43f54717b54a2c1e6957e5c6f4c3eb5f616d5a \
  --reviewer kg-4a-reviewer --role regulatory-content-reviewer --note "…"
#  -> effectiveReviewState: reviewer_approved
```

## 6. Governed end-to-end through the real HTTP product — **OWNS `test_kg4a_e2e_20260820`**

```bash
# corpus with approvals + an active release, INSIDE the owned database
createdb -h 127.0.0.1 -U $U test_kg4a_e2e_20260820
E2E="postgresql://$U@127.0.0.1:5432/test_kg4a_e2e_20260820"
DATABASE_URL="$E2E" npm run migration:run && DATABASE_URL="$E2E" npm run seed:safescope-standards
# approve every record + activate, in the clone only

# two accounts; only the FIRST is allowlisted
#   kg4a-a@example.com  -> ALLOWLISTED
#   kg4a-b@example.com  -> NOT allowlisted
# (register via POST /auth/register {email,password,name}; 5/60s throttle — wait between them)
NODE_ENV=test DATABASE_URL="$E2E" npx ts-node scripts/grant-test-entitlement.ts <userId> 8

NODE_ENV=test PORT=4331 DATABASE_URL="$E2E" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/storage-e2e \
  CORS_ORIGINS="http://127.0.0.1:3331" JWT_SECRET=<32+ chars> \
  GOVERNED_CUTOVER_MODE=GOVERNED_WITH_FALLBACK \
  GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST=<userId of kg4a-a> \
  GOVERNED_CUTOVER_OBSERVABILITY=enabled \
  npx ts-node src/main.ts &

API_BASE_URL=http://127.0.0.1:4331 DATABASE_URL="$E2E" npm run test:kg4a-governed-e2e
#  -> 35 passed, 0 failed
```

## 7. Performance — **OWNS `test_kg4a_perf_run`**

```bash
SOURCE_DB=test_kg4a_e2e_20260820 \
  REPORT_OUT=../verification/.../kg-4a/perf/kg4a-performance.json \
  npx ts-node scripts/report-kg4a-performance.ts
#  -> governed overhead 0.793 ms/analysis; 10 findings -> 4 distinct lookups (no N+1)
```

## 8. Browser — isolated frontend, real Chromium

The scratch frontend is a `tar` of `frontend-next` minus `node_modules`/`.next`, with `node_modules`
hard-linked in. **The working tree's `frontend-next` is never started against.** Its `.env.local` is
replaced in the scratch copy so it points at 4331 and does **not** disable auth — the pass compares two
real sessions.

```bash
(cd $SCRATCH/fe-kg4a && npx next dev -p 3331 &)
cp verification/.../kg-4a/browser/harness/kg4a-cutover-display-contract.mjs $SCRATCH/fe-kg4a/
(cd $SCRATCH/fe-kg4a && API_BASE_URL=http://127.0.0.1:4331 APP_BASE_URL=http://127.0.0.1:3331 \
  ALLOWED_EMAIL=kg4a-a@example.com OTHER_EMAIL=kg4a-b@example.com PASSWORD=… \
  ALLOWED_INSPECTION_ID=… OTHER_INSPECTION_ID=… \
  SHOT_DIR=<abs>/kg-4a/browser node kg4a-cutover-display-contract.mjs)
#  -> 240/240, light · dark · mobile · mobile-dark, 8 screenshots
```

## 9. Regression — **OWNS `test_kg4a_regression_20260820`** (+ one owned DB per mutating suite)

```bash
REG="postgresql://$U@127.0.0.1:5432/test_kg4a_regression_20260820"
DATABASE_URL="$REG" npm run migration:run && DATABASE_URL="$REG" npm run seed:safescope-standards
npm run build                                       # exit 0

for s in test:standards-backing-contract test:reviewer-approval test:regulatory-release-lifecycle \
         test:safescope-standards test:standards-corpus-integrity test:guided-finding-response \
         test:evidence-foundation test:hazlenz-evidence-boundary validate:hazlenz-knowledge-index; do
  DATABASE_URL="$REG" npm run $s
done
#  -> 35/35 · 62/62 · pass · 15/15 · pass · 28 · 35 · 13 · pass

# MUTATING — one owned database each, cloned from the regression DB
#   test:governed-corpus-matrix        -> test_kg4a_mut_governed_corpus_matrix   -> 60/60
#   test:release-integrity-and-approval-> test_kg4a_mut_release_integrity        -> 44/44
#   test:kg3d-corpus-remediation       -> clone of test_kg3f_remediation_20260820 -> 31/31
#      (a CLEAN seed fails its 1910.36 BASELINE assertion — it needs KG-3D's historical releases;
#       reproduced identically on a control seeded without the KG-4A record)

DATABASE_URL="$REG" npm run test:hazlenz-core       # -> 28 of 30 suites; the 2 documented failures

# server-dependent, on port 4330 (port 4000 carries a pre-existing developer backend — never used)
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4330 npm run test:knowledge-release-provenance
#  -> 27/27
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4330 npm run test:canonical-workflow
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4330 npm run test:finding-scoped-reviews
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4330 npm run test:persisted-decomposition-findings
```

## 10. KG-3F foundation, reproduced unchanged

```bash
CORPUS="postgresql://$U@localhost/test_kg3f_remediation_20260820"   # READ-ONLY here
SOURCE_DB=test_kg3f_remediation_20260820 npx ts-node scripts/test-kg3f-retrieval-determinism.ts  # 170/170
DATABASE_URL="$CORPUS" npm run test:kg3f-ranking-adversarial        # 54/54
npm run test:kg3f-56-14132-predicate                                # 16/16
DATABASE_URL="$CORPUS" npx ts-node scripts/test-kg3e-citation-granularity.ts federal-core-2026-08-20.5  # 48/48
DATABASE_URL="postgresql://$U@localhost/test_kg3f_contract_20260820" npm run test:approval-contract     # 57/57
npm run test:kg3f-shadow-invariance                                 # 7/7, sha256 29469550cea4d2fd…
npm run test:kg3f-customer-path-disconnection                       # 9/9 — see the CP-8 note
```

## Databases created by KG-4A (all disposable)

`test_kg4a_corpus_20260820` · `test_kg4a_control_20260820` · `test_kg4a_e2e_20260820` ·
`test_kg4a_regression_20260820` · `test_kg4a_mut_governed_corpus_matrix` ·
`test_kg4a_mut_release_integrity` · `test_kg4a_mut_kg3d_remediation`
and, created-and-dropped per run: `test_kg4a_resolution_run` · `test_kg4a_defaultoff_run` ·
`test_kg4a_gate_run` · `test_kg4a_perf_run`.

**Never touched:** `safescope`, `sentinel_dev`, `sentinel_safety`, and every `test_kg1…test_kg3f`
evidence database except as a **read-only** `pg_dump` source.

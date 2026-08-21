# KG-4C — reproduction commands

Every database-touching command names its target and documents which suite **owns** it. The KG-4C
addition to that rule: a mutating suite may write only to a database whose ownership marker names
it, and an **unmarked** database is refused.

```bash
cd /Users/mckinley/Desktop/Safety_InSite/backend
U=$(whoami)
```

> **Ambient `DATABASE_URL`.** `backend/.env` sets one. Unset it before running anything that resolves
> its own target.

## 0. Preservation baseline

```bash
cd /Users/mckinley/Desktop/Safety_InSite
git rev-parse HEAD          # -> 5f050858227ca11cf90d2f6bf64148e70a018b64
git branch --show-current   # -> release/insite-rc-2026-08-18
git rev-list --count @{u}..HEAD   # -> 0
git stash list | wc -l      # -> 4
git tag | wc -l             # -> 23
shasum -a 256 -c verification/.../kg-3e/unrelated-worktree-changes.sha256   # 18/18 OK
```

Read-only probe of the original SafeScope development database (never a target):

```bash
psql -h 127.0.0.1 -U $U -d safescope -tAc "select count(*) from migrations;"   # -> 35
psql -h 127.0.0.1 -U $U -d safescope -tAc \
  "select count(*) from information_schema.tables
    where table_name in ('regulatory_release_records','regulatory_release_record_reviews','knowledge_release_events');"
# -> 0    (no KG table has ever been applied there)
```

## 1. Pure contract suites — no database, safe anywhere

```bash
npm run test:kg4c-production-shadow-contract          # -> 438 passed, 0 failed
npm run test:kg4c-production-shadow-contract -- --emit \
  ../verification/.../kg-4c/contracts/production-shadow-contract.json

npm run test:kg4c-disabled-deployment                 # ->  80 passed, 0 failed
```

`test:kg4c-disabled-deployment` induces every failure mode structurally (a throwing data source, a
throwing sink, a circular payload, a rejecting promise). It opens no database and starts no server.

## 2. Ownership guard — **OWNS `test_kg4c_own_owned`, `test_kg4c_own_unowned`, `test_kg4c_own_foreign`**

```bash
unset DATABASE_URL
npm run test:kg4c-db-ownership                        # ->  31 passed, 0 failed
```

Creates all three databases, drops all three at the end, and touches nothing else. It deliberately
does **not** take a `SOURCE_DB`: a suite that verifies an anti-damage mechanism must not be able to
cause the damage it tests for.

## 3. Proving the guard against the real hazard

Against an **unmarked** evidence corpus — the general case, and the one that originally failed:

```bash
unset DATABASE_URL
psql -h 127.0.0.1 -U $U -d test_kg3f_remediation_20260820 -tAc \
  "select count(*) from information_schema.tables where table_name='kg_test_database_ownership';"   # -> 0

DATABASE_URL="postgresql://$U@127.0.0.1:5432/test_kg3f_remediation_20260820" \
  npm run test:regulatory-release-lifecycle
# -> REFUSED BEFORE MUTATION [UNCLAIMED_DATABASE] ... No mutation was attempted.

# marker table still absent, releases/records unchanged (9/269): a refusal performs ZERO writes
```

Against a **marked** corpus:

```bash
DATABASE_URL="postgresql://$U@127.0.0.1:5432/test_kg4b_shadow_20260820" \
  npm run test:regulatory-release-lifecycle
# -> REFUSED BEFORE MUTATION [OWNED_BY_ANOTHER_SUITE] ... Marker names 'kg-4b-evidence-corpus'.
```

On a database it owns:

```bash
dropdb -h 127.0.0.1 -U $U --if-exists test_kg4c_mut_lifecycle
createdb -h 127.0.0.1 -U $U -T test_kg4c_regression_20260821 test_kg4c_mut_lifecycle
KG_TEST_DB_INITIALIZE_OWNERSHIP=test_kg4c_mut_lifecycle \
  DATABASE_URL="postgresql://$U@127.0.0.1:5432/test_kg4c_mut_lifecycle" \
  npm run test:regulatory-release-lifecycle
# -> [db-ownership] claim=NEW ; 42/42 checks passed
```

The initialize token must name the database **exactly**. A token naming a different database is
refused, which is what stops a copy-pasted command line pointed at the wrong `DATABASE_URL`.

## 4. The KG-4C regression environment — **OWNS `test_kg4c_regression_20260821`**

```bash
dropdb -h 127.0.0.1 -U $U --if-exists test_kg4c_regression_20260821
createdb -h 127.0.0.1 -U $U test_kg4c_regression_20260821
REG="postgresql://$U@127.0.0.1:5432/test_kg4c_regression_20260821"
DATABASE_URL="$REG" npm run migration:run          # 46 migrations, incl. 1800000014000
DATABASE_URL="$REG" npm run seed:safescope-standards
#  -> recordCount 35, manifestChecksum 14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b
```

Mutating suites each get their own clone of it:

```bash
for db in approval lifecycle corpus_matrix release_integrity; do
  dropdb -h 127.0.0.1 -U $U --if-exists test_kg4c_mut_$db
  createdb -h 127.0.0.1 -U $U -T test_kg4c_regression_20260821 test_kg4c_mut_$db
done
```

## 5. Full regression

```bash
unset DATABASE_URL
SOURCE_DB=test_kg3f_remediation_20260820 npm run test:kg3f-retrieval-determinism      # 170/170
DATABASE_URL="postgresql://$U@localhost/test_kg3f_remediation_20260820" \
  npm run test:kg3f-ranking-adversarial                                               #  54/54
npm run test:kg3f-56-14132-predicate                                                  #  16/16
DATABASE_URL="$REG" npx ts-node scripts/test-kg3e-citation-granularity.ts \
  federal-core-2026-07-30.1                                                           #  48/48
DATABASE_URL="postgresql://$U@localhost/test_kg4c_mut_approval" \
  npm run test:approval-contract                                                      #  57/57
npm run test:kg3f-shadow-invariance                                # 7/7, sha256 29469550cea4d2fd...

npm run test:kg4a-cutover-contract                                                    # 146/146
SOURCE_DB=test_kg3f_remediation_20260820 npm run test:kg4a-governed-resolution         #  99/99
npm run test:kg4a-provenance-pinning                                                   #  53/53
SOURCE_DB=test_kg3f_remediation_20260820 npm run test:kg4a-default-off                 #  51/51

npm run test:kg4b-shadow-contract                                                      # 123/123
SOURCE_DB=test_kg4b_shadow_20260820 npm run test:kg4b-shadow-adversarial               #  84/84
SOURCE_DB=test_kg4b_shadow_20260820 CORPUS_DIR=../verification/.../kg-4b/corpus \
  npm run test:kg4b-shadow-determinism                       # 18/18, digest 0bce5a71a9d26642...
CORPUS_DIR=../verification/.../kg-4b/corpus npm run test:kg4b-privacy-review           #  26/26

DATABASE_URL="postgresql://$U@localhost/test_kg4c_mut_corpus_matrix" \
  npm run test:governed-corpus-matrix                                                  #  60/60
DATABASE_URL="postgresql://$U@localhost/test_kg4c_mut_release_integrity" \
  npm run test:release-integrity-and-approval                                          #  44/44

npm run build                                                    # exit 0
(cd ../frontend-next && npx tsc --noEmit)                        # exit 0
DATABASE_URL="$REG" npm run test:hazlenz-core   # 28 of 30 suites; the two documented failures only
```

## 6. Restoring the KG-4B corpus (the incident procedure, recorded for reuse)

Kept because the same repair applies if any evidence corpus is ever damaged again.

```bash
D=test_kg4b_shadow_20260820
# 1. remove fixture contamination
psql -h 127.0.0.1 -U $U -d $D \
  -c "DELETE FROM knowledge_release_events;" \
  -c "DELETE FROM regulatory_release_records WHERE \"releaseId\" LIKE 'kg2-fixture-release.%';" \
  -c "DELETE FROM regulatory_releases       WHERE \"releaseId\" LIKE 'kg2-fixture-release.%';"

# 2. find what standards_master lost, by diffing against a clean seed
#    (the KG-2 tamper fixture mutates one row and does not restore it)

# 3. re-finalize from the repaired live corpus
psql -h 127.0.0.1 -U $U -d $D -tAc \
  "DELETE FROM regulatory_release_records WHERE \"releaseId\"='federal-core-2026-07-30.1';
   DELETE FROM regulatory_releases       WHERE \"releaseId\"='federal-core-2026-07-30.1';"
DATABASE_URL="postgresql://$U@127.0.0.1:5432/$D" npm run seed:regulatory-release
#  -> recordCount 35, manifestChecksum 14a34fea...   <- byte-identical, or the repair is incomplete

# 4. re-activate through the real lifecycle gates, never by raw SQL
# 5. prove it: kg4b-shadow-adversarial 84/84 and kg4b-shadow-determinism 18/18 (digest 0bce5a71...)
```

**Do not repair by re-approving records.** The 35 approval decisions survive any release deletion
(the suite does not touch `regulatory_release_record_reviews`) and re-bind by checksum once the
snapshot is regenerated identically. Appending fresh approvals would silently rewrite the evidence.

## Databases created by KG-4C (all disposable)

Kept: `test_kg4c_regression_20260821` · `test_kg4c_mut_approval` · `test_kg4c_mut_lifecycle` ·
`test_kg4c_mut_corpus_matrix` · `test_kg4c_mut_release_integrity`

Created and dropped per run: `test_kg4c_own_owned` · `test_kg4c_own_unowned` · `test_kg4c_own_foreign`

**Never touched:** `safescope`, `sentinel_dev`, `sentinel_safety`.
`test_kg4b_shadow_20260820` **was** damaged during this slice and has been restored and proven — see
the incident record.

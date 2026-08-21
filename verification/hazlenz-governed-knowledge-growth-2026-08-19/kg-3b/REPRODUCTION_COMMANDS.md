# KG-3B — Reproduction commands

Every database-touching command exports `DATABASE_URL` explicitly and proves the resolved target
first. `backend/.env` sets `DATABASE_URL=…/safescope`, and `data-source.ts` gives `DATABASE_URL`
precedence over the discrete `DB_*` variables, so the shell export decides the target; `dotenv`
merges non-destructively, so an exported value wins. Each suite additionally refuses at runtime any
database that is not named `test_*`.

**The original `safescope` development database was never a target.** Verified after the run:

```
$ psql postgresql://mckinley@127.0.0.1:5432/safescope -c "select count(*) from migrations;"
 35

$ psql … -c "select to_regclass('regulatory_release_records')      is null,
                    to_regclass('regulatory_release_record_reviews') is null,
                    to_regclass('knowledge_release_events')          is null;"
 t | t | t
```

```bash
REVIEW="postgresql://mckinley@127.0.0.1:5432/test_kg3b_review_20260819"
INVENTORY="postgresql://mckinley@127.0.0.1:5432/test_kg3b_inventory_20260819"
SCRATCH=/private/tmp/.../scratchpad
cd backend

# ---- 0. prove the target ----------------------------------------------------------------------
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
         console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
         if(db==="safescope"||!/^test_/.test(db)){console.error("REFUSE");process.exit(1);}'

# ---- 1. disposable databases ------------------------------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3b_review_20260819
DATABASE_URL="$REVIEW" npm run migration:run            # 45 migrations (KG-3B adds 1800000013000)
DATABASE_URL="$REVIEW" npm run seed:safescope-standards
#  -> manifestChecksum 6043d6392a87beed22ad3386d35848f8172867dbc67d4a203a2d6f316f240e1e
#     reproduces the KG-3A value exactly; verifiedInOnePass true
#     reviewState {"unreviewed":4,"mechanically_validated":22,"reviewer_approved":0}

createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3b_inventory_20260819
DATABASE_URL="$INVENTORY" npm run migration:run
DATABASE_URL="$INVENTORY" npm run seed:safescope-standards     # same manifest checksum

# ---- 2. KG-3B reviewer approval suite ----------------------------------------------------------
DATABASE_URL="$REVIEW" npm run test:reviewer-approval           # 62/62, self-resetting
#  covers: stale-review refusal, reviewer-identity requirement, placeholder non-approvability,
#          approval provenance, content-manifest invariance, idempotence, activation gate,
#          changed-version non-inheritance, identical-content non-carry-forward, revocation,
#          re-approval, approval-state digest

# ---- 3. KG-3B corpus-backed validation matrix ---------------------------------------------------
DATABASE_URL="$REVIEW" npm run test:governed-corpus-matrix      # 49/49
#  -> 23 distinct citations emitted by applyFindingScopedStandards over the tracked gold set
#     backing {"CORPUS_BACKED":6,"UNAPPROVED_RECORD":9,"NOT_IN_RELEASE":8}
#     differences {"IDENTICAL":6,"LEGACY_ONLY_LOSES_BACKING":8,
#                  "LEGACY_PLACEHOLDER_BACKING_REMOVED":2,"BOTH_MISSING":7}
#     suggest(): 2/3 results corpus-backed under the reviewed fixture release

# ---- 4. the admin review CLI (the only reviewer path) -------------------------------------------
DATABASE_URL="$REVIEW" npm run review:release-record -- show \
  --release kg3b-matrix.A --citation '1910.212(a)(1)'
DATABASE_URL="$REVIEW" npm run review:release-record -- approve \
  --release kg3b-matrix.A --citation '1910.212(a)(1)' \
  --expected-checksum <sha256-from-show> --reviewer <id> --role regulatory-analyst --note '<grounds>'
DATABASE_URL="$REVIEW" npm run review:release-record -- carry-forward-candidates --release kg3b-matrix.B
DATABASE_URL="$REVIEW" npm run review:release-record -- approval-checksum --release kg3b-matrix.A
#  approve/revoke REQUIRE --expected-checksum; there is no "approve whatever is stored now" mode.
#  A refusal prints its failed gates and exits 2.

# ---- 5. real-corpus migration inventory (READ-ONLY, approves nothing) ---------------------------
DATABASE_URL="$INVENTORY" npm run report:corpus-migration-inventory
DATABASE_URL="$INVENTORY" npm run report:corpus-migration-inventory -- --json > kg-3b/corpus-migration-inventory.json
#  -> 26 records, 0 reviewer_approved, 15 emitted by HazLenz
#     {"READY_FOR_REVIEW":14,"NOT_CURRENTLY_USED":8,"PLACEHOLDER_SOURCE":4}
#     approvalStateChecksum ba7950d9cabfe717bebc37b6e241783389a987bbae7899cdc09c54eb1965a183

# ---- 6. shadow comparison under EFFECTIVE approval ----------------------------------------------
DATABASE_URL="$INVENTORY" SHADOW_RELEASE_ID="federal-core-2026-07-30.1" \
  npm run shadow:governed-standards > kg-3b/shadow-report-effective-approval.json
#  -> goldSet.sha256 93184abc… (recomputed from the tracked file; refuses on mismatch)
#     31/31 correct under BOTH paths, 0 wrong-regime
#     corpus 26 currently retrievable -> 0 governed retrievable
#     identical to the KG-3A measurement, because no REAL record has been approved

# ---- 7. KG-1 / KG-2 / KG-3A regression ----------------------------------------------------------
DATABASE_URL="$REVIEW" npm run test:release-integrity-and-approval   # 50/50
DATABASE_URL="$REVIEW" npm run test:regulatory-release-lifecycle     # 42/42
npm run build                                                       # clean

DATABASE_URL="$INVENTORY" npm run test:safescope-standards          # 15/15
DATABASE_URL="$INVENTORY" npm run test:standards-corpus-integrity   # all invariants
npm run validate:hazlenz-knowledge-index                            # Validation Passed
DATABASE_URL="$INVENTORY" npm run test:hazlenz-core
#  -> the two documented baseline failures ONLY:
#     [FAIL] Golden Hardening Scenarios Test
#     [FAIL] HazLenz Production Path Regression

# ---- 8. server-dependent suites ------------------------------------------------------------------
NODE_ENV=test PORT=4232 DATABASE_URL="$INVENTORY" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/kg3b-storage \
  npx ts-node src/main.ts &

export API_BASE_URL=http://127.0.0.1:4232
DATABASE_URL="$INVENTORY" npm run test:entitlement-grant-helper         # 5/5
DATABASE_URL="$INVENTORY" npm run test:knowledge-release-provenance     # 27/27
DATABASE_URL="$INVENTORY" npm run test:canonical-workflow               # passed, 25 scenarios
DATABASE_URL="$INVENTORY" npm run test:persisted-decomposition-findings # passed
DATABASE_URL="$INVENTORY" npm run test:finding-scoped-reviews           # passed

# KG-1 provenance still NULL for real analyses:
psql "$INVENTORY" -c 'select "knowledgeReleaseId", count(*) from hazlenz_analyses
                       where "knowledgeReleaseId" is not null group by 1;'
#  -> kg1-fixture-release.A | 4     (KG-1 test fixtures only; 10 real analyses remain NULL)

# ---- 9. migration revert / re-forward -------------------------------------------------------------
DATABASE_URL="$INVENTORY" npx typeorm-ts-node-commonjs -d src/database/data-source.ts migration:revert
psql "$INVENTORY" -c "select to_regclass('regulatory_release_record_reviews') is null,
                             (select count(*) from regulatory_release_records),
                             (select count(*) from standards_master);"
#  -> t | 26 | 26   (review decisions dropped; content snapshot and corpus intact)
DATABASE_URL="$INVENTORY" npm run migration:run                        # back to 45

# ---- 10. live-path non-change proof ---------------------------------------------------------------
cd .. && git status --porcelain backend/src/applicable-standards/ backend/src/safescope-v2/ \
                                backend/src/intelligence/ backend/src/standards/entities/ frontend-next/
#  -> empty
grep -rn 'release_id\s*=\|releaseId\s*=\|reviewer_approved\s*=\|reviewState\|effectiveState' \
     backend/src/applicable-standards/ backend/src/safescope-v2/ backend/src/intelligence/ \
     backend/src/reports/ backend/src/inspection/ --include='*.ts'
#  -> only pre-existing `reviewStateLabel` hits (an observed-condition display label, unrelated)
grep -rn 'release-record-review\|governed-corpus-lookup' backend/src/ --include='*.ts'
#  -> only backend/src/database/data-source.ts (entity registration)

cd frontend-next && npx tsc --noEmit      # clean; no frontend file changed
cd .. && git diff --check                 # clean
```

The disposable server was stopped after verification. Both disposable databases were retained so the
recorded measurements can be re-inspected; drop with
`dropdb -h 127.0.0.1 -U mckinley test_kg3b_review_20260819` and
`… test_kg3b_inventory_20260819`.

## Artifacts in this directory

| File | Contents |
|---|---|
| `KG_3B_VERIFICATION.md` | the verification record |
| `corpus-migration-inventory.json` | the real 26-record migration inventory (Phase 19), read-only |
| `shadow-report-effective-approval.json` | shadow comparison under effective approval (Phase 17) |

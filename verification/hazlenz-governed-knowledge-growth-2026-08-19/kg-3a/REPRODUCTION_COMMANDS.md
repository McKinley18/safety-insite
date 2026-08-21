# KG-3A — Reproduction commands

Every database-touching command exports `DATABASE_URL` explicitly and prints/checks the resolved
target first. `backend/.env` sets `DATABASE_URL=…/safescope`, and `data-source.ts` gives
`DATABASE_URL` precedence over the discrete `DB_*` variables, so the shell export decides the
target; `dotenv` merges non-destructively, so an exported value wins.

**The original `safescope` development database was never a target.** Verified after the run:
still 35 migrations, and neither `regulatory_release_records` nor `knowledge_release_events`
exists there.

```bash
INTEGRITY="postgresql://mckinley@127.0.0.1:5432/test_kg3a_integrity_20260819"
REGRESSION="postgresql://mckinley@127.0.0.1:5432/test_kg3a_regression_20260819"
SCRATCH=/private/tmp/.../scratchpad
cd backend

# ---- 0. prove the target ----------------------------------------------------------------------
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
         console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
         if(db==="safescope"||!/^test_/.test(db)){console.error("REFUSE");process.exit(1);}'

# ---- 1. integrity database --------------------------------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3a_integrity_20260819
DATABASE_URL="$INTEGRITY" npm run migration:run            # 44 migrations
DATABASE_URL="$INTEGRITY" npm run seed:safescope-standards
#  -> {"outcome":"finalized","verifiedInOnePass":true,
#      "manifestChecksum":"6043d639…",
#      "reviewState":{"unreviewed":4,"mechanically_validated":22,"reviewer_approved":0}}
#     6043d639… previously required TWO finalizations (defect A closed)

# ---- 2. KG-3A suite: retention, one-pass integrity, immutability, approval, TRUE rollback ------
DATABASE_URL="$INTEGRITY" npm run test:release-integrity-and-approval   # 50/50, re-runnable
DATABASE_URL="$INTEGRITY" npm run test:release-integrity-and-approval   # 50/50 again

# ---- 3. KG-2 lifecycle suite under the corrected model -----------------------------------------
DATABASE_URL="$INTEGRITY" npm run test:regulatory-release-lifecycle     # 42/42

# ---- 4. real-release eligibility (correctly NOT activatable) -----------------------------------
DATABASE_URL="$INTEGRITY" npx ts-node -e "…evaluateActivation('federal-core-2026-07-30.1')…"
#  -> eligible:false, failedGates:["governedRecordsPresent"], integrity:true
#     scope: 26 total / 0 governed / 22 mechanically_validated / 4 unreviewed

# ---- 5. shadow comparison (hash-verified TRACKED gold set) -------------------------------------
DATABASE_URL="$INTEGRITY" SHADOW_RELEASE_ID="federal-core-2026-07-30.1" \
  npm run shadow:governed-standards > $SCRATCH/shadow-report.json
#  -> goldSet.sha256 93184abc…  (recomputed from the tracked file, refuses on mismatch)
#     31/31 cases correct under BOTH paths, 0 wrong-regime
#     corpus: 26 currently retrievable -> 0 governed retrievable, 26 lost (per-record reasons)
#     SHADOW_RELEASE_ID measures a release that is correctly not activatable

# ---- 6. migration revert / re-forward (Phase 13) ------------------------------------------------
DATABASE_URL="$INTEGRITY" npx typeorm-ts-node-commonjs -d src/database/data-source.ts migration:revert
psql "$INTEGRITY" -c "select to_regclass('regulatory_release_records') is null;"   # t
psql "$INTEGRITY" -c "select count(*) from regulatory_releases;"                   # 1, readable
psql "$INTEGRITY" -c "select count(*) from standards_master;"                      # 26, readable
DATABASE_URL="$INTEGRITY" npm run migration:run                                    # re-forward

# ---- 7. regression database + suites -------------------------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3a_regression_20260819
DATABASE_URL="$REGRESSION" npm run migration:run
DATABASE_URL="$REGRESSION" npm run seed:safescope-standards
npm run build
DATABASE_URL="$REGRESSION" npm run test:safescope-standards          # 15/15
DATABASE_URL="$REGRESSION" npm run test:standards-corpus-integrity   # all invariants
npm run validate:hazlenz-knowledge-index
npm run test:hazlenz-core        # 2 documented baseline failures only

NODE_ENV=test PORT=4231 DATABASE_URL="$REGRESSION" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/kg3a-storage \
  npx ts-node src/main.ts

export API_BASE_URL=http://127.0.0.1:4231
DATABASE_URL="$REGRESSION" npm run test:entitlement-grant-helper         # 5/5 (guards intact)
DATABASE_URL="$REGRESSION" npm run test:knowledge-release-provenance     # 27/27
DATABASE_URL="$REGRESSION" npm run test:canonical-workflow               # 25 scenarios
DATABASE_URL="$REGRESSION" npm run test:persisted-decomposition-findings
DATABASE_URL="$REGRESSION" npm run test:finding-scoped-reviews

cd ../frontend-next && npx tsc --noEmit      # clean; no frontend file changed
cd .. && git diff --check
```

The disposable server was stopped after verification. Both disposable databases were retained so
the recorded measurements can be re-inspected; drop with `dropdb -h 127.0.0.1 -U mckinley
test_kg3a_integrity_20260819` and `… test_kg3a_regression_20260819`.

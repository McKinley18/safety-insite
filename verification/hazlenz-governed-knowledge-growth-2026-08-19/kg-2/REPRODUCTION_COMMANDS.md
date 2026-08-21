# KG-2 — Reproduction commands

Every database-touching command exports `DATABASE_URL` explicitly in the same invocation and
prints/checks the resolved target first. `backend/.env` sets
`DATABASE_URL=…/safescope`, and `data-source.ts` gives `DATABASE_URL` precedence over the
discrete `DB_*` variables, so the shell export decides the target. `dotenv` merges
non-destructively, so an exported value wins.

**The original `safescope` development database was never a target of any command below.**
Verified after the run: still 35 migrations, no `parentReleaseId`/`activatedAt`/`deactivatedAt`
columns, no `knowledge_release_events` table.

```bash
LIFECYCLE="postgresql://mckinley@127.0.0.1:5432/test_kg2_release_lifecycle_20260819"
REGRESSION="postgresql://mckinley@127.0.0.1:5432/test_kg2_regression_20260819"
SCRATCH=/private/tmp/.../scratchpad
cd backend

# ---- 0. prove the target before mutating anything -------------------------------------------
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
         console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
         if(db==="safescope"){console.error("REFUSE");process.exit(1);}
         if(!/^test_/.test(db)){console.error("REFUSE: not disposable");process.exit(1);}'

# ---- 1. lifecycle database -------------------------------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg2_release_lifecycle_20260819
DATABASE_URL="$LIFECYCLE" npm run migration:run          # 43 migrations
DATABASE_URL="$LIFECYCLE" npm run seed:safescope-standards
#   -> manifestChecksum 111f9949…  == the value KG-1 recorded, proving the manifest
#      algorithm extraction into standards/releases/release-manifest.ts is byte-identical

# schema checks
psql "$LIFECYCLE" -c "\d regulatory_releases"
psql "$LIFECYCLE" -c "select indexdef from pg_indexes where indexname='uq_regulatory_release_active';"
psql "$LIFECYCLE" -c "select pg_get_constraintdef(oid) from pg_constraint
                      where conname='chk_regulatory_release_status';"

# ---- 2. eligibility of the REAL seeded release ------------------------------------------------
DATABASE_URL="$LIFECYCLE" npx ts-node -e "…evaluateActivation('federal-core-2026-07-30.1')…"
#   after 1 finalize -> NOT eligible: manifestChecksumVerifies, governedRecordsPresent
DATABASE_URL="$LIFECYCLE" npm run seed:regulatory-release
#   second finalize -> manifest 6043d639… (== recomputed), approvedRecords 0 -> 4   [Defects A/B]

# ---- 3. lifecycle suite ------------------------------------------------------------------------
DATABASE_URL="$LIFECYCLE" npm run test:regulatory-release-lifecycle      # 41/41 passed

# ---- 4. immutability guard (Phase 12) ----------------------------------------------------------
DATABASE_URL="$LIFECYCLE" REGULATORY_RELEASE_ID='kg2-fixture-release.A'   npm run seed:regulatory-release  # refused (active)
DATABASE_URL="$LIFECYCLE" REGULATORY_RELEASE_ID='kg2-fixture-release.B'   npm run seed:regulatory-release  # refused (rolled_back)
DATABASE_URL="$LIFECYCLE" REGULATORY_RELEASE_ID='kg2-fixture-release.NEW' npm run seed:regulatory-release  # allowed
#   -> also revealed Defect C: finalizing NEW re-stamped every row, leaving the ACTIVE
#      release A with 0 records
psql "$LIFECYCLE" -c "select release_id, count(*) from standards_master group by 1;"

# ---- 5. migration revert / re-forward (Phase 18) -----------------------------------------------
DATABASE_URL="$LIFECYCLE" npx typeorm-ts-node-commonjs -d src/database/data-source.ts migration:revert
psql "$LIFECYCLE" -c "select status, count(*) from regulatory_releases group by 1;"   # 6 rows, all provisional
DATABASE_URL="$LIFECYCLE" npm run migration:run
DATABASE_URL="$LIFECYCLE" npm run test:regulatory-release-lifecycle      # 41/41 again

# ---- 6. regression database --------------------------------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg2_regression_20260819
DATABASE_URL="$REGRESSION" npm run migration:run
DATABASE_URL="$REGRESSION" npm run seed:safescope-standards

# Phase 10 BEFORE: no active release
DATABASE_URL="$REGRESSION" npm run test:safescope-standards        > $SCRATCH/standards-before.txt
DATABASE_URL="$REGRESSION" npm run test:standards-corpus-integrity > $SCRATCH/corpus-before.txt

# activate a release AND approve 3 rows
DATABASE_URL="$REGRESSION" npx ts-node -e "…activate('kg2-phase10-active-pointer')…"

# Phase 10 AFTER: outputs must be identical
DATABASE_URL="$REGRESSION" npm run test:safescope-standards        > $SCRATCH/standards-after.txt
DATABASE_URL="$REGRESSION" npm run test:standards-corpus-integrity > $SCRATCH/corpus-after.txt
diff $SCRATCH/standards-before.txt $SCRATCH/standards-after.txt    # IDENTICAL
diff $SCRATCH/corpus-before.txt    $SCRATCH/corpus-after.txt       # IDENTICAL

# ---- 7. disposable API server + integration suites ---------------------------------------------
NODE_ENV=test PORT=4231 DATABASE_URL="$REGRESSION" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/kg2-storage \
  npx ts-node src/main.ts

export API_BASE_URL=http://127.0.0.1:4231
DATABASE_URL="$REGRESSION" npm run test:entitlement-grant-helper          # 5/5
DATABASE_URL="$REGRESSION" npm run test:knowledge-release-provenance      # 27/27, WITH an active release
DATABASE_URL="$REGRESSION" npm run test:canonical-workflow                # passed, 25 scenarios
DATABASE_URL="$REGRESSION" npm run test:persisted-decomposition-findings  # passed
DATABASE_URL="$REGRESSION" npm run test:finding-scoped-reviews            # passed

npm run test:hazlenz-core     # 2 documented baseline failures only
npm run build                 # clean
cd ../frontend-next && npx tsc --noEmit     # clean; no frontend file changed
cd .. && git diff --check
```

Both disposable servers were stopped after verification. The two disposable databases were
retained so the recorded measurements can be re-inspected; drop with
`dropdb -h 127.0.0.1 -U mckinley test_kg2_release_lifecycle_20260819` and
`dropdb -h 127.0.0.1 -U mckinley test_kg2_regression_20260819`.

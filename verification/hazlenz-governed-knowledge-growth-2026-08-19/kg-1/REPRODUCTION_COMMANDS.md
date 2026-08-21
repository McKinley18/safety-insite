# KG-1 — Reproduction commands

Every database-touching command exports `DATABASE_URL` explicitly in the same invocation.
`backend/.env` sets `DATABASE_URL=postgresql://mckinley@127.0.0.1:5432/safescope`, and
`backend/src/database/data-source.ts` gives `DATABASE_URL` precedence over the discrete `DB_*`
variables, so the shell export is what decides the target. `dotenv` merges non-destructively, so
an already-exported value wins. The resolved host and database were printed and checked before
each mutating command.

**The original `safescope` development database was never a target of any command below.**

```bash
DISPOSABLE="postgresql://mckinley@127.0.0.1:5432/test_kg1_provenance_verify_20260819"
SCRATCH=/private/tmp/.../scratchpad     # session scratchpad

# ---- 0. prove the target before mutating anything -------------------------------------------
export DATABASE_URL="$DISPOSABLE"
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
         console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
         if(db==="safescope"){console.error("REFUSE");process.exit(1);}
         if(!/^test_/.test(db)){console.error("REFUSE: not a disposable test_ database");process.exit(1);}'

# ---- 1. disposable database ------------------------------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley kg1_provenance_verify_20260819
# renamed mid-run so it satisfies the disposable allowlist in scripts/grant-test-entitlement.ts:
psql -h 127.0.0.1 -U mckinley -d postgres \
  -c "ALTER DATABASE kg1_provenance_verify_20260819 RENAME TO test_kg1_provenance_verify_20260819;"

# ---- 2. migration forward / rollback / forward ------------------------------------------------
cd backend
DATABASE_URL="$DISPOSABLE" npm run migration:run
psql "$DISPOSABLE" -c "select table_name, column_name, is_nullable, character_maximum_length
                       from information_schema.columns where column_name='knowledgeReleaseId';"

DATABASE_URL="$DISPOSABLE" npx typeorm-ts-node-commonjs -d src/database/data-source.ts migration:revert
psql "$DISPOSABLE" -c "select count(*) from information_schema.columns
                       where column_name='knowledgeReleaseId';"     # -> 0

# insert rows under the reverted (pre-migration) schema, then migrate forward again
psql "$DISPOSABLE" -f <pre-migration rows: user/site/inspection/observation/analysis/finding>
DATABASE_URL="$DISPOSABLE" npm run migration:run
psql "$DISPOSABLE" -c "select \"knowledgeReleaseId\" is null from hazlenz_analyses
                       where id='55555555-5555-5555-5555-555555555555';"   # -> t

# ---- 3. standards provisioning (disposable only) ---------------------------------------------
DATABASE_URL="$DISPOSABLE" npm run seed:safescope-standards
psql "$DISPOSABLE" -c "select \"releaseId\", status, \"recordCount\", \"approvedBy\" from regulatory_releases;"
psql "$DISPOSABLE" -c "select release_id, reviewer_approved, deprecation_status, count(*)
                       from standards_master group by 1,2,3;"
psql "$DISPOSABLE" -c "select count(*) from standards_master
                       where reviewer_approved = true and deprecation_status='active';"   # -> 0
psql "$DISPOSABLE" -c "select count(*) from standards_master where is_active = true;"     # -> 26

# ---- 4. disposable API server ----------------------------------------------------------------
NODE_ENV=test DEV_FORCE_PRO=true PORT=4231 \
  DATABASE_URL="$DISPOSABLE" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/kg1-storage \
  npx ts-node src/main.ts

# ---- 5. verification runs --------------------------------------------------------------------
export API_BASE_URL="http://127.0.0.1:4231"
DATABASE_URL="$DISPOSABLE" npm run test:knowledge-release-provenance      # 27/27 passed
DATABASE_URL="$DISPOSABLE" npm run test:persisted-decomposition-findings  # {"passed":true,...}
DATABASE_URL="$DISPOSABLE" npm run test:finding-scoped-reviews            # {"passed":true,...}
DATABASE_URL="$DISPOSABLE" npm run test:safescope-standards               # 15 passed, 0 failed
DATABASE_URL="$DISPOSABLE" npm run test:standards-corpus-integrity        # all invariants passed
npm run validate:hazlenz-knowledge-index                                  # Validation Passed
npm run test:hazlenz-core        # 2 baseline failures only: Golden Hardening, Production Path
npm run build                                                             # tsc, clean

# not completed — pre-existing entitlement-tooling breakage, see KG_1_VERIFICATION.md §8
DATABASE_URL="$DISPOSABLE" npm run test:canonical-workflow

# ---- 6. frontend --------------------------------------------------------------------------
cd ../frontend-next && npx tsc --noEmit          # clean; no frontend file changed

# ---- 7. diff review -------------------------------------------------------------------------
cd .. && git diff --check && git diff --stat -- backend/ frontend-next/
```

The disposable API server was stopped after verification. The disposable database
`test_kg1_provenance_verify_20260819` was retained so the recorded measurements can be
re-inspected; it can be dropped with
`dropdb -h 127.0.0.1 -U mckinley test_kg1_provenance_verify_20260819`.

# KG-3C — Reproduction commands

Every database-touching command exports `DATABASE_URL` explicitly and proves the resolved target
first. `backend/.env` sets `DATABASE_URL=…/safescope`, and `data-source.ts` gives `DATABASE_URL`
precedence over the discrete `DB_*` variables, so the shell export decides the target. Every suite
additionally refuses at runtime any database not named `test_*`.

**The original `safescope` development database was never a target.**

```bash
DISPLAY_DB="postgresql://mckinley@127.0.0.1:5432/test_kg3c_display_20260819"
INVENTORY="postgresql://mckinley@127.0.0.1:5432/test_kg3c_inventory_20260819"
SCRATCH=/private/tmp/.../scratchpad
cd backend

# ---- 0. prove the target ----------------------------------------------------------------------
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
         console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
         if(db==="safescope"||!/^test_/.test(db)){console.error("REFUSE");process.exit(1);}'

# ---- 1. disposable databases -------------------------------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3c_display_20260819
DATABASE_URL="$DISPLAY_DB" npm run migration:run              # 45 migrations
DATABASE_URL="$DISPLAY_DB" npm run seed:safescope-standards
#  -> manifestChecksum 6043d6392a87beed22ad3386d35848f8172867dbc67d4a203a2d6f316f240e1e
#     reproduces the KG-3A/KG-3B value exactly

createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3c_inventory_20260819
DATABASE_URL="$INVENTORY" npm run migration:run
DATABASE_URL="$INVENTORY" npm run seed:safescope-standards    # same manifest checksum

# ---- 2. KG-3C backing contract (Phases 3,4,5,15,16,17) -----------------------------------------
DATABASE_URL="$DISPLAY_DB" npm run test:standards-backing-contract     # 35/35, self-resetting
#  pure section needs no DB: placeholder hard gate, sourceStatus mapping, customer copy,
#  approved/citation-only/unapproved rules
#  DB section: unapproved -> approved -> revoked transition with the content record immutable
#              throughout; release A/B history across activation and rollback

# ---- 3. extended corpus + display matrix (Phase 18) ---------------------------------------------
DATABASE_URL="$DISPLAY_DB" npm run test:governed-corpus-matrix         # 59/59 (was 49/49)
#  -> KG-3C display contract over 23 emitted citations:
#     {"APPROVED_GOVERNED_CONTENT":6,"UNAPPROVED_CONTENT":9,"CITATION_ONLY":8}
#     corpusBacked derived for every case; placeholders never backed; citation-only never
#     exposes text; no unapproved case reaches the approved wire value; NO citation removed

# ---- 4. real-corpus transition report (Phase 19) — READ-ONLY, approves nothing -------------------
DATABASE_URL="$INVENTORY" npm run report:corpus-migration-inventory
DATABASE_URL="$INVENTORY" npm run report:corpus-migration-inventory -- --json \
  > ../verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3c/corpus-transition-report.json
#  -> displayContract: {"allRecords":{"UNAPPROVED_CONTENT":26},
#                       "hazlenzEmittedOnly":{"UNAPPROVED_CONTENT":15},
#                       "falselyBackedUnderOldRule":26,
#                       "placeholderRecordsFalselyBackedUnderOldRule":4}

# ---- 5. frontend presentation contract (Phases 5-8) ---------------------------------------------
cd ../frontend-next
npx tsx lib/inspection/__tests__/standardDisplayBacking.test.ts        # 16/16
#  (no test runner is configured in this workspace; the file is a self-checking script)
npx tsc --noEmit                                                       # clean

# contrast ratios quoted in the code comment, computed from the actual hex values:
#   emerald-800 #065f46 on emerald-100 #d1fae5  ->  6.78:1
#   emerald-300 #6ee7b7 on emerald-950 #022c22  ->  9.94:1
#   emerald-300 #6ee7b7 on slate-950  #020617   -> 13.23:1

# ---- 6. prior-slice regression ------------------------------------------------------------------
cd ../backend && npm run build                                          # clean
DATABASE_URL="$DISPLAY_DB" npm run test:reviewer-approval                # 62/62
DATABASE_URL="$DISPLAY_DB" npm run test:release-integrity-and-approval   # 50/50
DATABASE_URL="$DISPLAY_DB" npm run test:regulatory-release-lifecycle     # 42/42

DATABASE_URL="$INVENTORY" npm run test:guided-finding-response           # 27 assertions
DATABASE_URL="$INVENTORY" npm run test:evidence-foundation               # 35 assertions
DATABASE_URL="$INVENTORY" npm run test:hazlenz-evidence-boundary         # 13 assertions
DATABASE_URL="$INVENTORY" npm run test:safescope-standards               # 15/15
DATABASE_URL="$INVENTORY" npm run test:standards-corpus-integrity        # all invariants
npm run validate:hazlenz-knowledge-index                                 # Validation Passed
DATABASE_URL="$INVENTORY" npm run test:hazlenz-core
#  -> the two documented baseline failures ONLY

# citation selection unchanged:
DATABASE_URL="$INVENTORY" SHADOW_RELEASE_ID="federal-core-2026-07-30.1" \
  npm run shadow:governed-standards
#  -> 31/31 correct under both paths, 0 wrong-regime; corpus 26 -> 0 governed (unchanged)

# ---- 7. server-dependent suites -------------------------------------------------------------------
NODE_ENV=test PORT=4233 DATABASE_URL="$INVENTORY" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/kg3c-storage \
  npx ts-node src/main.ts &

export API_BASE_URL=http://127.0.0.1:4233
DATABASE_URL="$INVENTORY" npm run test:knowledge-release-provenance      # 27/27
DATABASE_URL="$INVENTORY" npm run test:entitlement-grant-helper          # 5/5
DATABASE_URL="$INVENTORY" npm run test:canonical-workflow                # passed, 25 scenarios
DATABASE_URL="$INVENTORY" npm run test:persisted-decomposition-findings  # passed
DATABASE_URL="$INVENTORY" npm run test:finding-scoped-reviews            # passed

# NOT RESOLVED: test:private-storage-reports fails with 429 ThrottlerException on
# POST /auth/register when run after several registration-creating suites against the same
# server. Environment/rate-limit condition, not a KG-3C result. Re-run against a fresh server.

# live API proof that the contract reaches clients and that nothing is filtered:
TOKEN=$(curl -s -X POST $API_BASE_URL/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"<workflow-test-user>","password":"Phase4!StrongPass123"}' | jq -r .accessToken)
curl -s -X POST $API_BASE_URL/safescope-v2/classify -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Employee working at 12 feet on an unprotected leading edge with no guardrail or personal fall arrest system.","scopes":["osha_construction"]}'
#  -> primaryCitation 29 CFR 1926.501 (unchanged)
#     standardDecisions carry backingStatus=UNAPPROVED_CONTENT, corpusBacked=false
#     guidedFinding.primaryStandard.sourceStatus=provisional-versioned-regulation

# ---- 8. live-cutover non-change proof (Phase 22) ---------------------------------------------------
cd .. && git status --porcelain backend/src/billing/ backend/src/auth/ backend/src/action-engine/ \
                                backend/src/safescope-v2/risk/ backend/src/safescope-v2/classifier/
#  -> empty
grep -rn 'release_id\s*=\|releaseId\s*=\|reviewer_approved\s*=\|effectiveState' \
     backend/src/applicable-standards/ backend/src/safescope-v2/ backend/src/reports/ \
     backend/src/inspection/ --include='*.ts' | grep -v reviewStateLabel
#  -> only KG-1's provenance WRITER; no retrieval filter
grep -rn 'governed-corpus-lookup\|release-record-review\|regulatory-release-lifecycle' \
     backend/src/applicable-standards/ backend/src/safescope-v2/ backend/src/reports/ \
     backend/src/inspection/ --include='*.ts'
#  -> only a comment reference; no customer path imports the governed resolver
git diff --check                                                         # clean
```

The disposable server was stopped after verification. Both disposable databases were retained so
the recorded measurements can be re-inspected; drop with
`dropdb -h 127.0.0.1 -U mckinley test_kg3c_display_20260819` and `… test_kg3c_inventory_20260819`.

## Artifacts in this directory

| File | Contents |
|---|---|
| `KG_3C_VERIFICATION.md` | the verification record |
| `display-contract-matrix.json` | per-citation display contract over the 23 HazLenz-emitted citations (Phase 18) |
| `corpus-transition-report.json` | the real 26-record corpus under the new contract (Phase 19), read-only |

---

## Verification closure (2026-08-19) — browser pass and `private-storage-reports`

Real Chromium 148 via Playwright (already present in `frontend-next/node_modules`); the
Claude-in-Chrome extension is still unavailable and is not required.

```bash
BROWSER_DB="postgresql://mckinley@127.0.0.1:5432/test_kg3c_browser_20260819"
REPORTS_DB="postgresql://mckinley@127.0.0.1:5432/test_kg3c_reports_20260819"
KG=verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3c

# ---- 0. prove the target before every DB-touching command -------------------------------------
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
         console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
         if(db==="safescope"||!/^test_/.test(db)){console.error("REFUSE");process.exit(1);}'

# ---- 1. disposable databases -------------------------------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3c_browser_20260819
cd backend
DATABASE_URL="$BROWSER_DB" npm run migration:run           # 45 migrations
DATABASE_URL="$BROWSER_DB" npm run seed:safescope-standards
#  -> manifestChecksum 6043d6392a87beed22ad3386d35848f8172867dbc67d4a203a2d6f316f240e1e
#     (reproduces KG-3A/3B/3C exactly), 26 records, 4 placeholder-source, 0 reviewer_approved

# ---- 2. PHASE 9 FIRST — the reports suite gets its own pristine server -------------------------
# The prior 429 came from several registration-creating suites sharing one server; POST
# /auth/register is 5/60s per IP and every suite calls it from 127.0.0.1. Give this suite a
# dedicated process and run it as the first request.
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3c_reports_20260819
DATABASE_URL="$REPORTS_DB" npm run migration:run
DATABASE_URL="$REPORTS_DB" npm run seed:safescope-standards
NODE_ENV=test PORT=4311 DATABASE_URL="$REPORTS_DB" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/storage-reports \
  npx ts-node src/main.ts &
API_BASE_URL=http://127.0.0.1:4311 DATABASE_URL="$REPORTS_DB" npm run test:private-storage-reports
#  -> {"passed":true,"scenarios":12,...,"crossUserDownload":404}
#  Requires the two test-infrastructure fixes in scripts/test-private-storage-reports.ts:
#    tier 'expert' -> 'pro'   (migration 1800000005900 retired Expert and tightened the CHECK)
#    failure path closes the pg client (an open connection kept the loop alive, so a failure
#    hung forever and read as a harness timeout rather than as the error it was)

# ---- 3. app environment for the browser pass ----------------------------------------------------
NODE_ENV=test PORT=4310 DATABASE_URL="$BROWSER_DB" \
  CORS_ORIGINS="http://127.0.0.1:3310,http://localhost:3310" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/storage \
  npx ts-node src/main.ts &
cd ../frontend-next
NEXT_PUBLIC_API_URL=http://127.0.0.1:4310 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4310 \
  npx next dev -p 3310 &
# process env beats .env.local in Next.js, so no .env file is edited.

# ---- 4. fixtures via the REAL product pathway ---------------------------------------------------
cd ../backend
API_BASE_URL=http://127.0.0.1:4310 DATABASE_URL="$BROWSER_DB" \
  npx ts-node ../$KG/browser/harness/create-display-state-fixtures.ts
#  -> 1926.501 UNAPPROVED -> APPROVED_GOVERNED_CONTENT via the real KG-3B checksum-bound review
#     1926.34(a)     UNAPPROVED_CONTENT
#     1926.652(a)(1) CITATION_ONLY   (candidate plainLanguageSummary is genuinely null)
API_BASE_URL=http://127.0.0.1:4310 DATABASE_URL="$BROWSER_DB" \
  npx ts-node ../$KG/browser/harness/create-placeholder-fixture.ts
#  -> general-industry egress emits 29 CFR 1910.36 (starter-unverified:osha:1910.36, frozen
#     'unreviewed'); approves nothing, ingests nothing

# ---- 5. PHASES 4,7 — display contract in light / dark / mobile / mobile-dark ---------------------
cd ../frontend-next
API_BASE_URL=http://127.0.0.1:4310 APP_BASE_URL=http://127.0.0.1:3310 \
FIXTURE_EMAIL=<from fixture output> FIXTURE_PASSWORD='KG3cBrowser!Pass123' \
FIXTURE_INSPECTION_ID=<from fixture output> SHOT_DIR=../$KG/browser \
  node ../$KG/browser/harness/browser-display-contract.mjs
#  -> ALL CONTRACT CHECKS PASSED (12/12) + browser-verification-results.json

# ---- 6. PHASES 5,6,8 — detail E2E, placeholder gate, mobile workflow -----------------------------
API_BASE_URL=http://127.0.0.1:4310 APP_BASE_URL=http://127.0.0.1:3310 \
FIXTURE_EMAIL=… FIXTURE_INSPECTION_ID=… PLACEHOLDER_EMAIL=… PLACEHOLDER_INSPECTION_ID=… \
SHOT_DIR=../$KG/browser node ../$KG/browser/harness/standard-detail-e2e.mjs
#  -> ALL E2E / PLACEHOLDER / MOBILE CHECKS PASSED (34/34) + e2e-verification-results.json

# ---- 7. PHASE 13 — final regression --------------------------------------------------------------
cd ../backend && npm run build                                            # exit 0
DATABASE_URL="$DISPLAY_DB" npm run test:standards-backing-contract         # 35/35
DATABASE_URL="$DISPLAY_DB" npm run test:governed-corpus-matrix             # 59/59
DATABASE_URL="$DISPLAY_DB" npm run test:reviewer-approval                  # 62/62
DATABASE_URL="$DISPLAY_DB" npm run test:release-integrity-and-approval     # 50/50
DATABASE_URL="$DISPLAY_DB" npm run test:regulatory-release-lifecycle       # 42/42
DATABASE_URL="$DISPLAY_DB" npm run test:safescope-standards                # 15 passed, 0 failed
DATABASE_URL="$INVENTORY" SHADOW_RELEASE_ID="federal-core-2026-07-30.1" \
  npm run shadow:governed-standards
#  -> goldSetOutcome {"casesEvaluated":31,"correctUnderCurrentEngine":31,
#                     "correctUnderGovernedFiltering":31,"wrongRegimeMatches":0}
#     corpus {"currentlyRetrievable":26,"governedRetrievable":0}   <- cutover still off
API_BASE_URL=http://127.0.0.1:4310 DATABASE_URL="$BROWSER_DB" npm run test:canonical-workflow
#  -> {"passed":true,"scenarios":25,...}
DATABASE_URL="$INVENTORY" npm run test:hazlenz-core
#  -> the two documented baseline failures ONLY (Golden Hardening Scenarios,
#     HazLenz Production Path); 29 of 31 suites pass
cd ../frontend-next
npx tsx lib/inspection/__tests__/standardDisplayBacking.test.ts            # 19/19
npx tsc --noEmit                                                          # exit 0 (see §20.6)
cd .. && git diff --check                                                 # clean

# ---- 8. PHASE 14 — cutover non-change proof ------------------------------------------------------
grep -rn 'release_id\s*=\|releaseId\s*=\|reviewer_approved\s*=\|effectiveState' \
     backend/src/applicable-standards/ backend/src/safescope-v2/ backend/src/reports/ \
     backend/src/inspection/ --include='*.ts' | grep -v reviewStateLabel
#  -> only knowledge-release-provenance.ts:74 (KG-1's WRITER); no retrieval filter
grep -rn 'governed-corpus-lookup\|release-record-review\|regulatory-release-lifecycle' \
     backend/src/applicable-standards/ backend/src/safescope-v2/ backend/src/reports/ \
     backend/src/inspection/ --include='*.ts'
#  -> one comment reference only; no customer path imports the governed resolver
```

Disposable servers were stopped after verification. The four disposable databases were retained so
the recorded measurements can be re-inspected; drop with
`dropdb -h 127.0.0.1 -U mckinley test_kg3c_browser_20260819` and
`… test_kg3c_reports_20260819` (plus the two from the original run).

### Additional artifacts

| File | Contents |
|---|---|
| `browser/` | 30 PNG captures (see `SCREENSHOT_INVENTORY.md`) |
| `browser/browser-verification-results.json` | per-state × per-view assertions, measured computed styles, overflow measurements |
| `browser/e2e-verification-results.json` | Standard Detail E2E, placeholder gate, mobile workflow |
| `browser/harness/` | the four scripts above, kept so the pass is reproducible |

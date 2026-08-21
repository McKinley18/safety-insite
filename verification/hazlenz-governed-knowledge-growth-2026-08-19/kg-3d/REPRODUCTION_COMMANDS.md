# KG-3D — Reproduction commands

Every database-touching command exports `DATABASE_URL` explicitly and proves the resolved target
first. `backend/.env` sets `DATABASE_URL=…/safescope`, and `data-source.ts` gives `DATABASE_URL`
precedence over the discrete `DB_*` variables, so the shell export decides the target. Every suite
additionally refuses at runtime any database not named `test_*`.

**The original `safescope` development database was never a target.**

```bash
REMEDIATION="postgresql://mckinley@127.0.0.1:5432/test_kg3d_remediation_20260819"
REGRESSION="postgresql://mckinley@127.0.0.1:5432/test_kg3d_regression_20260819"
REPORTS="postgresql://mckinley@127.0.0.1:5432/test_kg3d_reports_20260819"
KG=verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3d
SCRATCH=/private/tmp/.../scratchpad/kg3d
cd backend

# ---- 0. prove the target before EVERY db-touching command -------------------------------------
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
         console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
         if(db==="safescope"||!/^test_/.test(db)){console.error("REFUSE");process.exit(1);}'

# ---- 1. baseline: reproduce the KG-3C corpus exactly -------------------------------------------
createdb -h 127.0.0.1 -p 5432 -U mckinley test_kg3d_remediation_20260819
DATABASE_URL="$REMEDIATION" npm run migration:run              # 45 migrations
DATABASE_URL="$REMEDIATION" npm run seed:safescope-standards
#  -> 26 records, manifest 6043d6392a87beed22ad3386d35848f8172867dbc67d4a203a2d6f316f240e1e
#     4 placeholder-source, 0 reviewer_approved  (reproduces KG-3A/3B/3C exactly)

# ---- 2. PHASE 2 forensics — 1910.36 before remediation -----------------------------------------
psql "$REMEDIATION" -x -c "SELECT citation,title,source_key,source_url,retrieval_date,release_id,
       normalized_record_checksum FROM standards_master WHERE citation='1910.36';"
#  -> source_key starter-unverified:osha:1910.36, source_url NULL,
#     checksum d671bf0b1ccdb68d6b0d6dc63d51cda770ecab4435a73b4fff92bec6cd11aa1e
psql "$REMEDIATION" -x -c "SELECT \"reviewState\",\"reviewStateReason\" FROM regulatory_release_records
       WHERE citation='1910.36';"
#  -> unreviewed / "Source key '…' is a synthesized placeholder, not a registered source."

# ---- 3. PHASE 3/4 — authoritative retrieval from the REGISTERED source -------------------------
# osha-ecfr-1910 is registered tier 1 (safescope-source-registry.ts:143) with baseUrl
# https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910
curl -s "https://www.ecfr.gov/api/versioner/v1/titles.json"     # title 29/30 up_to_date_as_of 2026-08-18
curl -s "https://www.ecfr.gov/api/versioner/v1/full/2026-08-18/title-29.xml?subtitle=B&chapter=XVII&part=1910&section=1910.36"  -o $KG/source-evidence/ecfr-1910-36.xml
curl -s "https://www.ecfr.gov/api/versioner/v1/full/2026-08-18/title-29.xml?subtitle=B&chapter=XVII&part=1910&section=1910.37"  -o $KG/source-evidence/ecfr-1910-37.xml
curl -s "https://www.ecfr.gov/api/versioner/v1/full/2026-08-18/title-29.xml?subtitle=B&chapter=XVII&part=1910&section=1910.303" -o $KG/source-evidence/ecfr-1910-303.xml
# …and 1926.34, 1926.416, 1926.300, 47.41, 62.120, 62.101, 1926.501, 1910.212, 1910.147, 56.14107
shasum -a 256 $KG/source-evidence/*.xml > $KG/source-evidence/SHA256SUMS.txt
#  ecfr-1910-36.xml  ee42754c7bd51fae1ffa110b94a3c4f32df29d20b85d2ab3a583d6b2c6499ee9
#  ecfr-1910-303.xml a03f243e22adc4d547bc6330d9bee7f3918721306e6f5ec4e0d8d16bc93a3293

# ---- 4. PHASE 5 — remediate through the seed's own provenance mechanism -------------------------
# Edited backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts:
#   + 29 CFR 1910.36   (corrected title/summary, sourceUrl, retrievalDate)
#   + 29 CFR 1910.303  (new section-level record)
# withSourceRegistryMetadata() attaches the registered osha-ecfr-1910 provenance.
DATABASE_URL="$REMEDIATION" npm run sync:standards-intelligence:dry-run
#  -> 0 insert / 23 update  <- the existing 1910.36 row is MATCHED, not duplicated
DATABASE_URL="$REMEDIATION" npm run sync:standards-intelligence:apply
DATABASE_URL="$REMEDIATION" REGULATORY_RELEASE_ID="federal-core-2026-08-19.3" \
  REGULATORY_RELEASE_VERSION="2026-08-19.3" npm run seed:regulatory-release
#  -> 27 records, manifest 13e003e73698175ae49d119f2dea2115a930ef68dbc5c754f486d7e3c354d85b
#     placeholderSourceRecords 0, verifiedInOnePass true
#  (the pre-remediation release federal-core-2026-07-30.1 is untouched and still verifies)

# ---- 5. PHASE 4/15 — clause-by-clause verification against the retrieved sources -----------------
DATABASE_URL="$REMEDIATION" REPORT_OUT=../$KG/review-evidence.json \
  npm run verify:governed-record-source federal-core-2026-08-19.3
#  -> 32 passed, 0 failed   (7 records; title vs codified heading + every asserted clause)

# ---- 6. PHASE 6/15 — the approvals. ONE EXPLICIT COMMAND PER RECORD -----------------------------
# There is deliberately no loop over a query result. Each command names its own citation, its own
# expected checksum, and its own evidence. --expected-checksum is mandatory.
DATABASE_URL="$REMEDIATION" npm run review:release-record -- approve \
  --release federal-core-2026-08-19.3 --citation "29 CFR 1910.36" \
  --expected-checksum 0e13180d1ff835069294987e4ec819343cf6bd7c147ab1cb6a20f9ac02dd003d \
  --reviewer kg-3d-remediation-reviewer --role regulatory-content-reviewer \
  --note "<evidence: source, sha256, FR history, clauses compared, what was removed and why>"
# …repeated individually for 1910.303, 1926.34(a), 1926.416(a)(1), 1926.300(b)(2),
#    47.41(a), 62.120.  Checksums: e210f940… dbf18c49… e449db0e… b94bc1e0… 0705c530… ff19c04d…

DATABASE_URL="$REMEDIATION" npm run review:release-record -- carry-forward-candidates \
  --release federal-core-2026-08-19.3
#  -> surfaces identical-content prior approvals, NEVER auto-applies them

# ---- 7. PHASE 7/17 — the remediation suite ------------------------------------------------------
DATABASE_URL="$REMEDIATION" npm run test:kg3d-corpus-remediation
#  -> PASSED 31/31
#     placeholder -> registered provenance -> approved; historical release unchanged;
#     changed content invalidates the prior approval and approving with the OLD checksum is REFUSED;
#     1910.303 parent/child are separate records, never aliased by prefix

# ---- 8. PHASE 19/20 — corpus readiness and the cutover matrix -----------------------------------
DATABASE_URL="$REMEDIATION" REGULATORY_RELEASE_ID=federal-core-2026-08-19.3 \
  npx ts-node scripts/report-corpus-migration-inventory.ts --json | sed -n '/^{/,$p' \
  > ../$KG/corpus-readiness-after.json
#  -> 27 records, 7 reviewer-approved, 3 placeholder, 16 emitted
DATABASE_URL="$REMEDIATION" REPORT_OUT=../$KG/cutover-coverage-matrix.json \
  npm run report:cutover-coverage-matrix federal-core-2026-08-19.3
#  -> OVERALL 7/27 (25.9%)   HAZLENZ-EMITTED 7/23 (30.4%)  <- the cutover gate
#     7 emitted citations have NO governed record; 16 still block eligibility

# ---- 9. PHASE 23 — suggest() impact, MEASUREMENT ONLY (no filter added) -------------------------
DATABASE_URL="$REMEDIATION" GOVERNED_RELEASE_ID=federal-core-2026-08-19.3 \
  REPORT_OUT=../$KG/suggest-impact.json npm run measure:suggest-backing-impact
#  -> 20 results | live-backed 0 (expected: the live path passes no governed resolution)
#                | governed-backed 8 | 12 would be removed if filtering were switched on
#     "guarding (mining)" would return ZERO results -> a concrete cutover blocker

# ---- 10. PHASE 12/25 — gold set and regression --------------------------------------------------
npm run build                                                          # exit 0
DATABASE_URL="$REMEDIATION" SHADOW_RELEASE_ID="federal-core-2026-08-19.3" \
  npm run shadow:governed-standards
#  -> goldSetOutcome {"casesEvaluated":31,"correctUnderCurrentEngine":31,
#                     "correctUnderGovernedFiltering":31,"wrongRegimeMatches":0}
#     corpus {"currentlyRetrievable":27,"governedRetrievable":7}

# a SECOND disposable database, seeded from the remediated corpus, for the suites that reset
# release/review state (they DELETE all releases, so they must not target the remediation DB):
createdb -h 127.0.0.1 -U mckinley test_kg3d_regression_20260819
DATABASE_URL="$REGRESSION" npm run migration:run && DATABASE_URL="$REGRESSION" npm run seed:safescope-standards
#  -> reproduces manifest 13e003e7… from a clean database: the remediation is deterministic
for s in test:standards-backing-contract test:governed-corpus-matrix test:reviewer-approval \
         test:release-integrity-and-approval test:regulatory-release-lifecycle \
         test:safescope-standards test:standards-corpus-integrity test:guided-finding-response \
         test:evidence-foundation test:hazlenz-evidence-boundary; do
  DATABASE_URL="$REGRESSION" npm run $s
done
#  -> 35/35 · 59/59 · 62/62 · 48/48 · 42/42 · 15/0 · all invariants · 28 · 35 · 13
#
#  NOTE on 48/48 (KG-3C recorded 50/50): the suite emits TWO assertions per placeholder row and
#  placeholders went 4 -> 3. Confirmed by diffing the check lists:
DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_kg3c_display_20260819" \
  npm run test:release-integrity-and-approval | grep '^  ok  ' > /tmp/base.txt
DATABASE_URL="$REGRESSION" npm run test:release-integrity-and-approval | grep '^  ok  ' > /tmp/after.txt
diff /tmp/base.txt /tmp/after.txt
#  -> only the 2 dropped placeholder assertions + counts 26->27, 4->3. Nothing weakened.

DATABASE_URL="$REGRESSION" npm run test:hazlenz-core
#  -> the two documented baseline failures ONLY. Proved unchanged by diffing the failing cases
#     against the pre-remediation database:
for db in test_kg3c_display_20260819 test_kg3d_regression_20260819; do
  DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/$db" \
    npx ts-node src/safescope-v2/tests/golden-hardening-tests.ts | grep -Ei 'fail' | sort > /tmp/gh-$db.txt
done
diff /tmp/gh-test_kg3c_display_20260819.txt /tmp/gh-test_kg3d_regression_20260819.txt   # IDENTICAL

# ---- 11. server-dependent suites ----------------------------------------------------------------
NODE_ENV=test PORT=4320 DATABASE_URL="$REMEDIATION" \
  CORS_ORIGINS="http://127.0.0.1:3320,http://localhost:3320" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/storage npx ts-node src/main.ts &
export API_BASE_URL=http://127.0.0.1:4320
DATABASE_URL="$REMEDIATION" npm run test:knowledge-release-provenance     # 27/27
DATABASE_URL="$REMEDIATION" npm run test:entitlement-grant-helper         # 5/5
DATABASE_URL="$REMEDIATION" npm run test:canonical-workflow               # 25 scenarios
DATABASE_URL="$REMEDIATION" npm run test:persisted-decomposition-findings # passed
DATABASE_URL="$REMEDIATION" npm run test:finding-scoped-reviews           # passed
# POST /auth/register is throttled 5/60s per IP — space registration-creating suites ~65s apart.

# the reports suite gets its own pristine server and database (KG-3C §20.2):
createdb -h 127.0.0.1 -U mckinley test_kg3d_reports_20260819
DATABASE_URL="$REPORTS" npm run migration:run && DATABASE_URL="$REPORTS" npm run seed:safescope-standards
NODE_ENV=test PORT=4321 DATABASE_URL="$REPORTS" STORAGE_PROVIDER=local_test \
  STORAGE_LOCAL_ROOT=$SCRATCH/storage-reports npx ts-node src/main.ts &
API_BASE_URL=http://127.0.0.1:4321 DATABASE_URL="$REPORTS" npm run test:private-storage-reports
#  -> {"passed":true,"scenarios":12,...,"crossUserDownload":404}

# KG-1 invariant re-proved:
psql "$REMEDIATION" -c 'SELECT COUNT(*) FILTER (WHERE "knowledgeReleaseId" IS NULL) AS null_release,
       COUNT(*) FILTER (WHERE "knowledgeReleaseId" IS NOT NULL) AS with_release FROM hazlenz_analyses;'
#  -> the only non-null rows are KG-1's own fixtures

# ---- 12. PHASE 7/8/21 — real Chromium ------------------------------------------------------------
# A concurrent `next dev` (port 3000) belonging to unrelated work was already running, and Next.js
# refuses a second dev server for the same directory. Rather than kill it, the pass used an
# ISOLATED COPY of the frontend in the scratchpad:
rsync -a --exclude node_modules --exclude .next --exclude .git frontend-next/ $SCRATCH/fe/
cp -Rc frontend-next/node_modules $SCRATCH/fe/node_modules   # APFS clone; a symlink is rejected by Turbopack
(cd $SCRATCH/fe && NEXT_PUBLIC_API_URL=http://127.0.0.1:4320 \
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4320 npx next dev -p 3320 &)

# fixture: drives the REAL product path and REFUSES to run unless the approval already exists.
# The harness imports './src/...', so it runs from a copy at the backend root (as KG-3C's did).
cp ../$KG/browser/harness/create-approved-standard-fixture.ts ./kg3d-fixture-run.ts
API_BASE_URL=http://127.0.0.1:4320 DATABASE_URL="$REMEDIATION" npx ts-node ./kg3d-fixture-run.ts
#  -> emits 29 CFR 1910.36; live path = UNAPPROVED_CONTENT (cutover off);
#     USING EXISTING REAL APPROVAL (checksum 0e13180d…, reviewer kg-3d-remediation-reviewer)
#     persisted candidate -> APPROVED_GOVERNED_CONTENT
FIXTURE_EXPECT_UNAPPROVED=1 API_BASE_URL=http://127.0.0.1:4320 DATABASE_URL="$REMEDIATION" \
  npx ts-node ./kg3d-fixture-run.ts        # control case: no approval anywhere
rm -f ./kg3d-fixture-run.ts

# playwright resolves from frontend-next/node_modules, so the .mjs runs from a copy there:
cd ../frontend-next
cp ../$KG/browser/harness/approved-standard-display.mjs ./kg3d-display-run.mjs
API_BASE_URL=http://127.0.0.1:4320 APP_BASE_URL=http://127.0.0.1:3320 \
FIXTURE_EMAIL=<from fixture output> FIXTURE_PASSWORD='KG3dBrowser!Pass123' \
FIXTURE_INSPECTION_ID=<from fixture output> SHOT_DIR=../$KG/browser node ./kg3d-display-run.mjs
#  -> ALL KG-3D DISPLAY CHECKS PASSED — 108/108 (4 views x 27), Chromium 148.0.7778.96
#     badge shown, remediated title+text rendered, superseded starter text gone,
#     NO confidence contradiction, badge is ONE pill (rects=1) at 390px, no horizontal overflow

cp ../$KG/browser/harness/unapproved-control-display.mjs ./kg3d-control-run.mjs
API_BASE_URL=… APP_BASE_URL=… FIXTURE_EMAIL=<control> FIXTURE_INSPECTION_ID=<control> \
  SHOT_DIR=../$KG/browser node ./kg3d-control-run.mjs
#  -> ALL CONTROL CHECKS PASSED — 8/8. No badge, and the content-backing caveat IS still shown,
#     proving the Phase 8 fix suppressed the contradiction, not the disclosure.
rm -f ./kg3d-display-run.mjs ./kg3d-control-run.mjs

npx tsx lib/inspection/__tests__/standardDisplayBacking.test.ts    # 19/19
npx tsc --noEmit                                                   # exit 0

# ---- 13. PHASE 24/28 — cutover non-change and worktree ------------------------------------------
cd .. && grep -rn 'release_id\s*=\|releaseId\s*=\|reviewer_approved\s*=\|effectiveState' \
     backend/src/applicable-standards/ backend/src/safescope-v2/ backend/src/reports/ \
     backend/src/inspection/ --include='*.ts' | grep -v reviewStateLabel
#  -> only knowledge-release-provenance.ts:74 (KG-1's WRITER); no retrieval filter
grep -rn 'governed-corpus-lookup\|release-record-review\|regulatory-release-lifecycle' \
     backend/src/applicable-standards/ backend/src/safescope-v2/ backend/src/reports/ \
     backend/src/inspection/ --include='*.ts'
#  -> one comment reference only; no customer path imports the governed resolver
shasum -a 256 frontend-next/app/page.tsx
#  -> 76b4e50628bafda18da0b487a0c63afb48bc7440a265c3711ed759a98e41e9a0  (UNCHANGED from KG-3D start)
git status --porcelain backend/src/billing/ backend/src/auth/ backend/src/action-engine/ \
                       backend/src/safescope-v2/risk/ backend/src/safescope-v2/classifier/
#  -> empty
git diff --check                                                   # clean, exit 0
```

Disposable servers were stopped after verification. The three disposable databases were retained so
the recorded measurements can be re-inspected; drop with
`dropdb -h 127.0.0.1 -U mckinley test_kg3d_remediation_20260819` (and `…_regression_…`, `…_reports_…`).

## Artifacts in this directory

| File | Contents |
|---|---|
| `KG_3D_VERIFICATION.md` | the verification record |
| `source-evidence/` | the 13 retrieved eCFR section documents + `SHA256SUMS.txt` |
| `1910-36-content-verification.json` | Phase 4 clause-by-clause verdict for 1910.36 (13/13) |
| `1910-303-content-verification.json` | Phase 11 clause-by-clause verdict for 1910.303 (8/8) |
| `review-evidence.json` | per-record reviewer evidence for all 7 approvals (32/32) |
| `corpus-readiness-after.json` | the 27-record corpus after remediation |
| `cutover-coverage-matrix.json` | **the authoritative cutover-readiness inventory** (Phase 20) |
| `suggest-impact.json` | Phase 23 measurement, live vs governed backing |
| `unrelated-worktree-changes.sha256` | hashes of the 14 concurrently-modified files left untouched |
| `browser/` | captures + `approved-standard-results.json`, `control-unapproved-results.json` |
| `browser/harness/` | the three harness scripts, kept so the pass is reproducible |

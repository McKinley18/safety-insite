# KG-3E — Reproduction commands

Every database-touching command exports `DATABASE_URL` explicitly and proves the resolved target
first. `backend/.env` sets `DATABASE_URL=…/safescope`, and `data-source.ts` gives `DATABASE_URL`
precedence over the discrete `DB_*` variables, so the shell export decides the target. Every suite
additionally refuses at runtime any database not named `test_*`.

**The original `safescope` development database was never a target**, and was probed read-only at the
end to confirm it: `standards_master` holds 0 rows and 0 rows were updated on 2026-08-20.

```bash
REMEDIATION="postgresql://mckinley@127.0.0.1:5432/test_kg3e_remediation_20260820"
REGRESSION="postgresql://mckinley@127.0.0.1:5432/test_kg3e_regression_20260820"
REPORTS="postgresql://mckinley@127.0.0.1:5432/test_kg3e_reports_20260820"
PROBE="postgresql://mckinley@127.0.0.1:5432/test_kg3e_ordering_probe_20260820"
DELTA="postgresql://mckinley@127.0.0.1:5432/test_kg3e_deltacheck_20260820"
KG=verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3e
SCRATCH=/private/tmp/.../scratchpad/kg3e
cd backend

# ---- 0. prove the target before EVERY db-touching command ---------------------------------------
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
         console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
         if(db==="safescope"||!/^test_/.test(db)){console.error("REFUSE");process.exit(1);}'

# ---- 1. PHASE 0 — preservation baseline ---------------------------------------------------------
git rev-parse HEAD                       # 5f050858227ca11cf90d2f6bf64148e70a018b64
git stash list | wc -l                   # 4
git tag -l | wc -l                       # 23
git rev-parse insite-inspection-ui-verified-2026-08-19   # b25103b0534098cbdde967dc77c85b56a2bcf050
shasum -a 256 -c ../$KG/../kg-3d/unrelated-worktree-changes.sha256    # 14/14 OK
shasum -a 256 -c ../$KG/unrelated-worktree-changes.sha256             # 18/18 OK (KG-3E's own list)

#  determinism proof: a clean database reproduces the KG-3D manifest exactly
createdb -h 127.0.0.1 -U mckinley test_kg3e_remediation_20260820
DATABASE_URL="$REMEDIATION" npm run migration:run
DATABASE_URL="$REMEDIATION" npm run seed:safescope-standards
#  -> 27 records, manifest 13e003e73698175ae49d119f2dea2115a930ef68dbc5c754f486d7e3c354d85b
#     == the manifest KG-3D recorded. The KG-3D remediation is deterministic, not a hand edit.

#  then rebuild as a TRUE CONTINUATION so KG-3D's seven real reviewer decisions carry their own
#  provenance rather than being manufactured:
dropdb  -h 127.0.0.1 -U mckinley test_kg3e_remediation_20260820
createdb -h 127.0.0.1 -U mckinley test_kg3e_remediation_20260820
pg_dump -h 127.0.0.1 -U mckinley test_kg3d_remediation_20260819 | psql -q "$REMEDIATION"
#  -> records=27 placeholder=3 releases=4 reviews=15 effective_approvals=7

# ---- 2. PHASE 1 — the work queue, measured LIVE (not from the KG-3C snapshot) --------------------
DATABASE_URL="$REMEDIATION" REPORT_OUT=../$KG/work-queue.json \
  npm run report:kg3e-work-queue federal-core-2026-08-19.3
#  -> emitted 23 | approved 7 | missing record 7   <- independently reproduces KG-3D
#     + 30 DECLARED_BUT_NOT_EMITTED_NO_RECORD, which the frozen list could not show

# ---- 3. PHASES 2/3/5/6 — authoritative retrieval ------------------------------------------------
B="https://www.ecfr.gov/api/versioner/v1/full/2026-08-18"
curl -s "https://www.ecfr.gov/api/versioner/v1/titles.json"   # title 29/30 up_to_date_as_of 2026-08-18
curl -s "$B/title-29.xml?subtitle=B&chapter=XVII&part=1926&section=1926.501" -o ../$KG/source-evidence/ecfr-1926-501.xml
#  …and 1926.500, 1910.147, 56.14107, 1926.451, 1926.652, 1910.28, 1910.25, 1910.95, 1910.1200,
#     1926.1153, 56.14132, 1910.22, 1910.146, 1910.303, 1910.178, 1910.212, 56.12016, 1926.52,
#     1926.59, 47.41, 62.101, 62.120, 62.130   (24 documents)
shasum -a 256 ../$KG/source-evidence/*.xml > ../$KG/source-evidence/SHA256SUMS.txt

# ---- 4. remediate through the seed's own provenance mechanism ------------------------------------
# Edited backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts ONLY:
#   * 1926.501, 1910.147, 56.14107(a)           -- CONTENT_DIFF remediation (Phase 2)
#   * 1926.451(g)(1), 1926.652(a)(1), 1910.28, 1910.95, 1910.1200, 1926.1153, 56.14132  -- added (Phase 3)
#   * 1910.22(a), 1910.303(b)(1), 1910.146      -- placeholder remediation (Phase 6)
#   * 1910.178(p)(1), 56.12016, 1910.212(a)(1)  -- content defects found once sourced (Phase 5)
#   * 47.41(a), 62.120, 62.130                  -- MSHA provenance repair (Phase 5)
DATABASE_URL="$REMEDIATION" npx ts-node src/standards/seed/sync-standards-intelligence-to-master.ts
#  -> 7 insert / 27 update / 0 skipped  <- placeholders MATCHED, never duplicated
DATABASE_URL="$REMEDIATION" npx ts-node src/standards/seed/sync-standards-intelligence-to-master.ts --apply
DATABASE_URL="$REMEDIATION" REGULATORY_RELEASE_ID="federal-core-2026-08-20.5" \
  REGULATORY_RELEASE_VERSION="2026-08-20.5" npx ts-node src/standards/seed/finalize-regulatory-release.ts
#  -> 34 records, manifest bee47ebe1e82b74d9507380cff073838093881ea8a990b7d659190174fad6aa2
#     unreviewed 0, placeholderSourceRecords 0
#  (the historical release federal-core-2026-08-19.3 is untouched -- its checksums are unchanged,
#   and 1910.36's checksum 0e13180d… is IDENTICAL in both, proving the remediation was surgical)

#  placeholder-counter fix, proved on a corpus that HAS placeholders and a prior finalization:
DATABASE_URL="$PROBE" REGULATORY_RELEASE_ID="probe-counter-check.1" \
  REGULATORY_RELEASE_VERSION="probe-1" npx ts-node src/standards/seed/finalize-regulatory-release.ts
#  -> placeholderSourceRecords 3   (before the fix this reported 0 from the 2nd finalization onward)

# ---- 5. PHASE 2/3/5/6 — clause-level verification -------------------------------------------------
DATABASE_URL="$REMEDIATION" REPORT_OUT=../$KG/clause-verification.json \
  npm run verify:kg3e-record-source federal-core-2026-08-20.5
#  -> 150 passed, 0 failed  (21 records; title vs codified heading, every asserted clause,
#     every limiting qualification, and no absorption of neighbouring rules)

# ---- 6. PHASE 4/8 — the permanent granularity + selection contract --------------------------------
DATABASE_URL="$REMEDIATION" npm run test:kg3e-citation-granularity federal-core-2026-08-20.5
#  -> 48 passed, 0 failed. Includes: 56.14132(a) resolves to NOTHING although the 56.14132 SECTION
#     exists; 1926.652 (bare section) resolves to NOTHING although 1926.652(a)(1) exists;
#     1910.303(g)(2)(i) resolves to NOTHING rather than falling back to its parent.

# ---- 7. PHASE 7 — the approvals. ONE EXPLICIT COMMAND PER RECORD ----------------------------------
# There is deliberately no loop over a query result. Each command names its own citation, its own
# expected checksum and its own evidence; a mismatched checksum causes a refusal.
bash ../$KG/approvals.sh
#  -> 26 effective approvals of 34 records. The 8 unapproved are the NOT_CURRENTLY_USED tail.
DATABASE_URL="$REMEDIATION" npm run review:release-record -- carry-forward-candidates \
  --release federal-core-2026-08-20.5
#  -> surfaces the 7 KG-3D approvals (checksum-identical), NEVER auto-applies them

# ---- 8. PHASES 10/11 — coverage, hazard families, shadow -------------------------------------------
DATABASE_URL="$REMEDIATION" REPORT_OUT=../$KG/cutover-coverage-matrix.json \
  npm run report:cutover-coverage-matrix federal-core-2026-08-20.5
#  -> OVERALL 26/34 (76.5%)   HAZLENZ-EMITTED 22/23 (95.7%)   <- the cutover gate
#     emitted with NO governed record: 1   awaiting review: 0   placeholder: 0
DATABASE_URL="$REMEDIATION" GOVERNED_RELEASE_ID=federal-core-2026-08-20.5 \
  REPORT_OUT=../$KG/suggest-impact.json npm run measure:suggest-backing-impact
#  -> 26 results | governed-backed 19 | 7 removed under filtering | ZERO queries return empty
DATABASE_URL="$REMEDIATION" SHADOW_RELEASE_ID="federal-core-2026-08-20.5" npm run shadow:governed-standards
#  -> goldSetOutcome {"casesEvaluated":31,"correctUnderCurrentEngine":31,
#                     "correctUnderGovernedFiltering":31,"wrongRegimeMatches":0,
#                     "distinctExpectedCitations":24,"expectedCitationsGoverned":24,
#                     "expectedCitationsLosingCorpusBacking":0}
#     corpus {"currentlyRetrievable":34,"governedRetrievable":26}
#  -> hazard-family coverage: 16 families, 1 emptied (mobile equipment (mining) = 56.14132(a))

# ---- 9. THE ORDERING FINDING — causal proof --------------------------------------------------------
# Re-running the KG-3D measurement against the UNMODIFIED KG-3D database with UNMODIFIED code
# returned a different citation than KG-3D recorded, stably across 5 runs:
DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_kg3d_remediation_20260819" \
  GOVERNED_RELEASE_ID=federal-core-2026-08-19.3 npm run measure:suggest-backing-impact
#  -> "exposed live parts": 1910.303(b)(1) [UNAPPROVED], governed-backed 7
#     KG-3D recorded:       29 CFR 1910.303 [APPROVED],  governed-backed 8
grep -c "orderBy" src/applicable-standards/applicable-standards.service.ts     # -> 0

# proof by changing ONLY physical row order, on a throwaway copy:
createdb -h 127.0.0.1 -U mckinley test_kg3e_ordering_probe_20260820
pg_dump -h 127.0.0.1 -U mckinley test_kg3d_remediation_20260819 | psql -q "$PROBE"
psql "$PROBE" -c "CREATE INDEX probe_cit_desc ON standards_master (citation DESC);
                  CLUSTER standards_master USING probe_cit_desc;"
DATABASE_URL="$PROBE" GOVERNED_RELEASE_ID=federal-core-2026-08-19.3 npm run measure:suggest-backing-impact
#  BEFORE (1,2) 1910.303(b)(1) first -> returns 1910.303(b)(1), governed-backed 7
#  AFTER  (3,3) 29 CFR 1910.303 first -> returns 29 CFR 1910.303, governed-backed 8
# content identical both sides:
psql -t "$PROBE" -c "SELECT md5(string_agg(citation||coalesce(title,'')||coalesce(keywords,'')
                       ||coalesce(plain_language_summary,''),'|' ORDER BY citation)) FROM standards_master;"
#  -> 22b072e27b6c1a468792073bbd463dc0  == the same value on test_kg3d_remediation_20260819

# ---- 10. PHASE 13 — regression ---------------------------------------------------------------------
npm run build                                                       # exit 0
createdb -h 127.0.0.1 -U mckinley test_kg3e_regression_20260820
DATABASE_URL="$REGRESSION" npm run migration:run && DATABASE_URL="$REGRESSION" npm run seed:safescope-standards
#  -> reproduces manifest bee47ebe… from a clean database: the KG-3E remediation is deterministic
for s in test:standards-backing-contract test:governed-corpus-matrix test:reviewer-approval \
         test:release-integrity-and-approval test:regulatory-release-lifecycle \
         test:safescope-standards test:standards-corpus-integrity test:guided-finding-response \
         test:evidence-foundation test:hazlenz-evidence-boundary validate:hazlenz-knowledge-index; do
  DATABASE_URL="$REGRESSION" npm run $s
done
#  -> 35/35 · 59/59 · 62/62 · pass(44 assertions) · pass(42) · all pass
#
#  NOTE on 48 -> 44 in release-integrity-and-approval. Three suites located their placeholder test
#  subject by querying the REAL corpus for a `starter-unverified:` row. KG-3E remediated the last
#  three, so the query returned nothing and the assertions could not run AT ALL -- a test that
#  depended on the corpus having a defect. Each suite now installs its OWN fixture
#  (`99 CFR 9999.1(a)`, source_key NULL). The contract is unchanged. The remaining delta is proved
#  by running the SAME test file against both corpora and diffing normalised check lists:
DATABASE_URL="$DELTA"      npm run test:release-integrity-and-approval | grep '^  ok  ' | sed 's/[0-9]\+/N/g' | sort > /tmp/base.txt
DATABASE_URL="$REGRESSION" npm run test:release-integrity-and-approval | grep '^  ok  ' | sed 's/[0-9]\+/N/g' | sort > /tmp/after.txt
diff /tmp/base.txt /tmp/after.txt
#  -> ONLY: -3x "Placeholder source key is recognised as such"
#           -3x "A placeholder-source record stays unreviewed even when the legacy approval boolean is true"
#           + count text (24->34 mechanically validated, 28->35 snapshot records)
#     i.e. exactly two assertions per placeholder row, three fewer rows. Nothing weakened.

DATABASE_URL="$REGRESSION" npm run test:hazlenz-core
#  -> the two documented baseline failures ONLY. Proved byte-identical by diffing the failing cases
#     against a copy of the KG-3D corpus:
for db in test_kg3e_deltacheck_20260820 test_kg3e_regression_20260820; do
  DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/$db" \
    npx ts-node src/safescope-v2/tests/golden-hardening-tests.ts | grep -i fail | sort > /tmp/gh-$db.txt
  DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/$db" \
    npx ts-node src/safescope-v2/tests/hazlenz-production-path-regression.ts | grep -i fail | sort > /tmp/pp-$db.txt
done
diff /tmp/gh-*.txt && diff /tmp/pp-*.txt     # IDENTICAL both

# ---- 11. server-dependent suites ---------------------------------------------------------------------
NODE_ENV=test PORT=4330 DATABASE_URL="$REMEDIATION" \
  CORS_ORIGINS="http://127.0.0.1:3330,http://localhost:3330" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/storage npx ts-node src/main.ts &
export API_BASE_URL=http://127.0.0.1:4330
DATABASE_URL="$REMEDIATION" npm run test:knowledge-release-provenance      # pass
DATABASE_URL="$REMEDIATION" npm run test:entitlement-grant-helper          # pass
DATABASE_URL="$REMEDIATION" npm run test:persisted-decomposition-findings  # pass
DATABASE_URL="$REMEDIATION" npm run test:finding-scoped-reviews            # pass
DATABASE_URL="$REMEDIATION" npm run test:canonical-workflow                # passed, 25 scenarios
# POST /auth/register is throttled 5/60s per IP -- space registration-creating suites ~65s apart.

# the reports suite gets its own pristine server and database (KG-3C §20.2):
createdb -h 127.0.0.1 -U mckinley test_kg3e_reports_20260820
DATABASE_URL="$REPORTS" npm run migration:run && DATABASE_URL="$REPORTS" npm run seed:safescope-standards
NODE_ENV=test PORT=4331 DATABASE_URL="$REPORTS" STORAGE_PROVIDER=local_test \
  STORAGE_LOCAL_ROOT=$SCRATCH/storage-reports npx ts-node src/main.ts &
API_BASE_URL=http://127.0.0.1:4331 DATABASE_URL="$REPORTS" npm run test:private-storage-reports
#  -> {"passed":true,"scenarios":12,...,"crossUserDownload":404}

# ---- 12. PHASE 9 — real Chromium, isolated frontend ---------------------------------------------------
# Unrelated dev servers were running on 3001/3010/4000/4001/4010 and were NOT disturbed; the pass
# used an ISOLATED COPY of the frontend in the scratchpad, as KG-3D did.
rsync -a --exclude node_modules --exclude .next --exclude .git frontend-next/ $SCRATCH/fe/
cp -Rc frontend-next/node_modules $SCRATCH/fe/node_modules     # APFS clone; Turbopack rejects a symlink
(cd $SCRATCH/fe && NEXT_PUBLIC_API_URL=http://127.0.0.1:4330 \
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4330 npx next dev -p 3330 &)

# fixture drives the REAL product path and REFUSES to run unless the approval already exists:
cp ../$KG/../kg-3d/browser/harness/create-approved-standard-fixture.ts ./kg3e-fixture-run.ts
API_BASE_URL=http://127.0.0.1:4330 DATABASE_URL="$REMEDIATION" \
  FIXTURE_RELEASE_ID=federal-core-2026-08-20.5 \
  FIXTURE_REQUIRE_APPROVED_CITATION="29 CFR 1910.36" npx ts-node ./kg3e-fixture-run.ts
#  -> USING EXISTING REAL APPROVAL, reviewer kg-3e-remediation-reviewer, checksum 0e13180d…
FIXTURE_EXPECT_UNAPPROVED=1 …  npx ts-node ./kg3e-fixture-run.ts        # unapproved control
rm -f ./kg3e-fixture-run.ts

# KG-3E adds a THIRD corpus state the earlier harnesses could not represent -- CITATION_ONLY:
cp ../$KG/browser/harness/create-citation-only-fixture.ts ./kg3e-citonly-run.ts
API_BASE_URL=http://127.0.0.1:4330 DATABASE_URL="$REMEDIATION" \
  FIXTURE_RELEASE_ID=federal-core-2026-08-20.5 FIXTURE_REGULATORY_CONTEXT=msha \
  npx ts-node ./kg3e-citonly-run.ts
#  -> emits 30 CFR 56.14132(a): backingStatus CITATION_ONLY, corpusBacked false, hasSummary false
#     -- although the 56.14132 SECTION record exists AND is approved
rm -f ./kg3e-citonly-run.ts

cd ../frontend-next     # playwright resolves from frontend-next/node_modules
cp ../$KG/../kg-3d/browser/harness/approved-standard-display.mjs ./kg3e-display-run.mjs
API_BASE_URL=http://127.0.0.1:4330 APP_BASE_URL=http://127.0.0.1:3330 \
  FIXTURE_EMAIL=<from fixture> FIXTURE_PASSWORD='KG3dBrowser!Pass123' \
  FIXTURE_INSPECTION_ID=<from fixture> SHOT_DIR=../$KG/browser node ./kg3e-display-run.mjs
#  -> ALL DISPLAY CHECKS PASSED — 108/108 (4 views x 27), Chromium 148.0.7778.96
#     "Verified standard text" + "Candidate standard — more evidence required": verified text with
#     applicability limited for an INDEPENDENT reason. No contradiction.
cp ../$KG/../kg-3d/browser/harness/unapproved-control-display.mjs ./kg3e-control-run.mjs
… node ./kg3e-control-run.mjs        # 8/8 — no badge, "Primary standard" (HIGH confidence), disclosure intact
… SHOT_DIR=../$KG/browser/citation-only node ./kg3e-citonly-display.mjs
#  -> "Verified standard text is not currently available for this citation." No substitution.
rm -f ./kg3e-*.mjs
npx tsx lib/inspection/__tests__/standardDisplayBacking.test.ts    # PASSED all checks
npx tsc --noEmit                                                   # exit 0

# ---- 13. PHASE 14/15 — cutover non-change, and preservation --------------------------------------------
cd .. && grep -rn 'governed-corpus-lookup\|release-record-review\|regulatory-release-lifecycle' \
     backend/src/applicable-standards/ backend/src/safescope-v2/ backend/src/reports/ \
     backend/src/inspection/ --include='*.ts'
#  -> ONE comment in knowledge-release-provenance.ts:42. No customer path imports the resolver.
psql "$REMEDIATION" -c 'SELECT "knowledgeReleaseId", COUNT(*) FROM hazlenz_analyses
                        WHERE "knowledgeReleaseId" IS NOT NULL GROUP BY 1;'
#  -> kg1-fixture-release.A | 4   (KG-1 fixtures only; 0 analyses created during KG-3E)
psql "$REMEDIATION" -c 'SELECT "releaseId", status FROM regulatory_releases;'   # all 9 provisional
psql -h 127.0.0.1 -U mckinley safescope -t -c \
  "SELECT COUNT(*) FROM standards_master WHERE updated_at::date = DATE '2026-08-20';"   # -> 0
shasum -a 256 -c ../$KG/unrelated-worktree-changes.sha256    # 18/18 OK
git rev-parse HEAD && git stash list | wc -l && git tag -l | wc -l    # 5f050858… · 4 · 23
git diff --check                                                      # clean, exit 0
```

Disposable servers were stopped after verification; the unrelated dev servers on 3001, 3010, 4000,
4001 and 4010 were left running throughout. The disposable databases were retained so the recorded
measurements can be re-inspected; drop with
`dropdb -h 127.0.0.1 -U mckinley test_kg3e_remediation_20260820` (and `…_regression_…`,
`…_reports_…`, `…_ordering_probe_…`, `…_deltacheck_…`).

## Artifacts in this directory

| File | Contents |
|---|---|
| `KG_3E_VERIFICATION.md` | the verification record |
| `FINDING-suggest-ordering-nondeterminism.md` | **cutover blocker** — `suggest()` depends on physical row order, with causal proof |
| `FINDING-approval-binding-excludes-source-url.md` | governance gap — checksum-bound approval excludes the reviewer's evidence pointer |
| `phase0-starting-state.md` | branch, HEAD, stashes, tags, full `git status --short` at start |
| `phase0-baseline-reproduction.md` | determinism proof and the corrected source-URL count |
| `unrelated-worktree-changes.sha256` | 18 concurrently-modified files, left untouched |
| `work-queue.json` / `work-queue.md` | the authoritative queue, measured live |
| `work-queue-after-remediation.json`, `work-queue-final.json` | queue state after each remediation stage |
| `phase3-uncovered-citation-adjudications.md` | the seven uncovered citations, individually adjudicated |
| `source-evidence/` | the 24 retrieved eCFR documents + `SHA256SUMS.txt` |
| `clause-verification-content-diff.json` | Phase 2 verdicts for the three refused records (38/38) |
| `clause-verification.json` | the full 150/150 clause verification over 21 records |
| `approvals.sh` | the 26 explicit per-record approval commands with their evidence |
| `cutover-coverage-matrix.json` | the authoritative cutover-readiness inventory |
| `hazard-family-coverage.json` | per-family coverage and the empty-family check |
| `suggest-impact.json` | suggest() measurement, live vs governed backing |
| `shadow-report.json` | approved-only shadow simulation |
| `corpus-readiness-after.json` | the 34-record corpus after remediation |
| `kg3e-changed-files.sha256` | hashes of every file KG-3E changed |
| `browser/` | 108/108 approved captures + control + `citation-only/` |
| `browser/harness/create-citation-only-fixture.ts` | the KG-3E fixture for the CITATION_ONLY state |

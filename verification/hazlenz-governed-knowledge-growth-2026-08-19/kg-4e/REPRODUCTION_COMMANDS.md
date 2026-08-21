# KG-4E — reproduction commands

```bash
cd /Users/mckinley/Desktop/Safety_InSite/backend
U=$(whoami)
S=<scratch>                     # logs + local storage roots
V=../verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-4e
unset DATABASE_URL              # backend/.env sets one; unset it before anything that resolves its own target
```

## 0. Preservation baseline

```bash
git rev-parse HEAD                 # -> 5f050858227ca11cf90d2f6bf64148e70a018b64
git branch --show-current          # -> release/insite-rc-2026-08-18
git stash list | wc -l             # -> 4
git tag | wc -l                    # -> 23
shasum -a 256 -c ../verification/.../kg-3e/unrelated-worktree-changes.sha256   # 18/18 OK
env | grep GOVERNED_CUTOVER || echo "unset"
```

## 1. The KG-4E databases — **OWNED by this slice**

Cloned from KG-4D's E2E database so the release, the 35 approvals and the active pointer are already
in place. The clone is then **re-marked**, so KG-4D's evidence database is never a write target.

```bash
D=test_kg4e_report_20260821
dropdb -h 127.0.0.1 -U $U --if-exists $D
createdb -h 127.0.0.1 -U $U -T test_kg4d_e2e_20260821 $D
psql -h 127.0.0.1 -U $U -d $D -c \
  "UPDATE kg_test_database_ownership SET owner_suite='kg-4e-report-invariance',
     ownership_token='own_kg4e_'||extract(epoch from now())::bigint, claimed_at=now() WHERE id=1;"
# and confirm the SOURCE marker is untouched:
psql -h 127.0.0.1 -U $U -d test_kg4d_e2e_20260821 -tAc "select owner_suite from kg_test_database_ownership"
#  -> test:kg4d-integration-e2e
```

## 2. Servers — one account, two configurations

The account is held constant and the SERVER differs, so the report's "Inspector" line, the site name
and the site id are identical on both sides. Using two accounts instead would put a real
customer-visible difference into the comparison.

```bash
E2E="postgresql://$U@127.0.0.1:5432/$D"

# LEGACY -- default off, no cutover variables at all
PORT=4360 NODE_ENV=test DATABASE_URL="$E2E" STORAGE_PROVIDER=local_test \
  STORAGE_LOCAL_ROOT=$S/storage JWT_SECRET=<32+ chars> npx ts-node src/main.ts &

# SHADOW -- the same database, the same account, allowlisted
PORT=4361 NODE_ENV=test DATABASE_URL="$E2E" STORAGE_PROVIDER=local_test \
  STORAGE_LOCAL_ROOT=$S/storage JWT_SECRET=<32+ chars> \
  GOVERNED_CUTOVER_MODE=SHADOW GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST=<userId> \
  GOVERNED_CUTOVER_SHADOW_STAGE=STAGE_1_SINGLE_ACCOUNT \
  GOVERNED_CUTOVER_OBSERVABILITY=enabled npx ts-node src/main.ts &

grep -c "degraded advisory fallback" $S/logs/*.log     # -> 0 on both, or the baseline is worthless
```

Register the account once and grant it the `cloudReports` entitlement (report generation requires
it). The auth throttle is **5/60s and is not relaxed**.

```bash
curl -s -X POST http://127.0.0.1:4360/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"KG4E Verification Inspector","email":"kg4e-report@example.com","password":"<pw>"}'
NODE_ENV=test DATABASE_URL="$E2E" npx ts-node scripts/grant-test-entitlement.ts <userId> 12
```

## 3. Capture — three LEGACY runs and one SHADOW run

`/safescope-v2/classify` is 30/60s; the harness paces at 3s and **refuses a 429** rather than
recording it. Each run does the whole flow per case: site → inspection → observation → classify →
persist analysis → review → finalize finding(s) → corrective action → in_review → completed →
generate report → download the PDF.

```bash
for L in legacy-A legacy-B legacy-C; do
  API_BASE_URL=http://127.0.0.1:4360 KG4E_EMAIL=kg4e-report@example.com KG4E_PASSWORD=<pw> \
    OUT_DIR=$V/pdfs LABEL=$L npm run run:kg4e-report-capture
done
API_BASE_URL=http://127.0.0.1:4361 KG4E_EMAIL=kg4e-report@example.com KG4E_PASSWORD=<pw> \
  OUT_DIR=$V/pdfs LABEL=shadow-A npm run run:kg4e-report-capture
#  -> 8 reports each, 8/8 with at least one finalized finding

grep -o '{"schemaVersion":"kg4c.shadow-comparison.v2".*' $S/logs/server-shadow-4361.log \
  > $V/telemetry/kg4e-shadow-events.jsonl        # -> 24 events, 24 distinct keys
```

`legacy-A`/`legacy-B` derive the volatility. `legacy-C` is the **non-circular control** — it
contributes nothing to the derivation and must still compare invariant.

## 4. Compare

```bash
# LEGACY vs SHADOW -- the actual question
PDF_DIR=$V/pdfs VOLATILITY_A=legacy-A VOLATILITY_B=legacy-B LEFT=legacy-A RIGHT=shadow-A \
  REPORT_OUT=$V/phase3-report-invariance.json EXPECT=IDENTICAL npm run compare:kg4e-report-invariance
#  -> 8/8 invariant, 0 forbidden term hits, 38 patterns, 1 volatile position per report

# CONTROL -- a third LEGACY run
PDF_DIR=$V/pdfs VOLATILITY_A=legacy-A VOLATILITY_B=legacy-B LEFT=legacy-A RIGHT=legacy-C \
  REPORT_OUT=$V/control-legacy-vs-legacy.json EXPECT=IDENTICAL npm run compare:kg4e-report-invariance
#  -> 8/8 invariant
```

Requires poppler (`pdftotext`, `pdfinfo`, `pdffonts`, `pdftoppm`). **No OCR.**

## 5. Prove the oracle can fail

A comparison that has never reported disagreement is not evidence.

```bash
DATABASE_URL="$E2E" PDF_DIR=$V/pdfs npm run build:kg4e-mutation-control
PDF_DIR=$V/pdfs VOLATILITY_A=legacy-A VOLATILITY_B=legacy-B LEFT=legacy-A RIGHT=mutation-control \
  REPORT_OUT=$V/control-mutation-must-fail.json EXPECT=IDENTICAL npm run compare:kg4e-report-invariance
#  -> MUST FAIL: 8/8 DIFFERENT, 176 forbidden-term hits
```

## 6. Structural exclusion + provenance

```bash
DATABASE_URL="$E2E" OUT_DIR=$V/pdfs/poison npm run test:kg4e-report-field-exclusion
#  -> 9 passed, 0 failed; 33/33 reports byte-identical after poisoning with 38 fields

DATABASE_URL="$E2E" TELEMETRY=$V/telemetry/kg4e-shadow-events.jsonl npm run test:kg4e-report-provenance
#  -> 32 passed, 0 failed
```

## 7. Visual review

```bash
for C in FALL-01 MULTI-01 MSHA-01; do for L in legacy-A shadow-A; do
  pdftoppm -r 100 -png $V/pdfs/${L}__${C}.pdf $V/pages/${C}__${L}
done; done
#  -> 13 of 16 page images pixel-identical; the 3 that differ are all page 1 (record reference)
```

## 8. Failure injection — **OWNS `test_kg4e_stale_20260821`**

```bash
# (a) kill switch: the SHADOW server plus GOVERNED_CUTOVER_KILL_SWITCH=engaged, port 4362
#     -> 0 v2 events; 8/8 invariant reports

# (b) resolver failure -- on a SEPARATE clone, re-marked kg-4e-resolver-failure
D2=test_kg4e_stale_20260821
createdb -h 127.0.0.1 -U $U -T $D $D2
psql -h 127.0.0.1 -U $U -d $D2 -c "UPDATE kg_test_database_ownership
  SET owner_suite='kg-4e-resolver-failure', ownership_token='own_kg4e_stale', claimed_at=now() WHERE id=1;"
psql -h 127.0.0.1 -U $U -d $D2 -c 'ALTER TABLE regulatory_release_records
  RENAME TO regulatory_release_records_kg4e_hidden;'
# SHADOW server on 4363 against $D2
#  -> 24/24 INTEGRITY_FAILURE / BLOCKING / RESOLVER_UNAVAILABLE / STALE_SCHEMA
#  -> 8/8 invariant reports, 0 forbidden terms
```

**Recorded negative result:** dropping only the four approval-contract columns
(`substantiveContentDigest`, `sourceIdentityDigest`, `approvalDigest`, `approvalContractVersion`)
does **not** fail the resolver — `resolveGovernedCitation()` never selects them. `resolverHealth`
stayed `OK` on all 24 comparisons. Making the record table unreadable is what produces a real
failure.

## 9. Regression

```bash
npm run test:kg4d-orchestration                                  # 151/151
npm run test:kg4d-default-off                                    # 119/119
npm run test:kg4a-cutover-contract                               # 146/146
npm run test:kg4a-provenance-pinning                             #  53/53
SOURCE_DB=test_kg3f_remediation_20260820 npm run test:kg4a-default-off   # 51/51
npm run test:kg4b-shadow-contract                                # 123/123
npm run test:kg4c-production-shadow-contract                     # 438/438
npm run test:kg4c-disabled-deployment                            #  80/80
npm run test:kg4c-db-ownership                                   #  31/31
CORPUS_DIR=../verification/.../kg-4b/corpus npm run test:kg4b-privacy-review   # 26/26

API_BASE_URL=http://127.0.0.1:4360 SHADOW_EMAIL=… LEGACY_EMAIL=… PASSWORD=… \
  npm run test:kg4b-default-off                                  #  48/48

# real HTTP, real rows. B must be a genuinely NON-allowlisted account, and the suite creates a
# fixed-name site, so a second run against the same database 409s unless the earlier sites are
# renamed first.
API_BASE_URL=http://127.0.0.1:4361 DATABASE_URL="$E2E" \
  KG4D_EMAIL_A=… KG4D_PASSWORD_A=… KG4D_EMAIL_B=… KG4D_PASSWORD_B=… KG4D_ACCOUNT_A=<userId> \
  npm run test:kg4d-integration-e2e                              #  42/42

npm run build                                    # exit 0
(cd ../frontend-next && npx tsc --noEmit)        # exit 0
```

The v2 privacy authority over the real events is the runtime guard the write path itself uses
(`assertShadowEventV2PrivacySafe`), run over all 48 KG-4E events: **48/48 safe, 35 fields, 0 outside
the v2 allowlist, 12 canary patterns**. `test:kg4b-privacy-review` is a v1-schema suite and reports
two failures for the six fields KG-4C added; that is a schema-version mismatch, not a privacy result.

## Databases created by KG-4E (both disposable, both marked)

Kept: `test_kg4e_report_20260821` · `test_kg4e_stale_20260821`

**Never touched:** `safescope`, `sentinel_dev`, `sentinel_safety`, and every KG-1…KG-4D evidence
database (`test_kg4d_e2e_20260821` was used only as a `createdb -T` template;
`test_kg3f_remediation_20260820` only as a read-only `SOURCE_DB`).

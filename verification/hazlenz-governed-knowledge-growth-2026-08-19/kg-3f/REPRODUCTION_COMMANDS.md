# KG-3F — reproduction commands

Every database-touching command exports `DATABASE_URL` explicitly and proves the resolved target
first. In this repository `DATABASE_URL` takes precedence over the discrete `DB_*` variables
wherever the runtime honors it, so the shell export decides the target. Every suite refuses to run
against `safescope` or against any database not named `test_*`.

```bash
cd /Users/mckinley/Desktop/Safety_InSite/backend
U=$(whoami)
CORPUS="postgresql://$U@localhost/test_kg3f_remediation_20260820"   # canonical KG-3F corpus
```

> **Corpus note.** `test_kg3f_remediation_20260820` is the canonical KG-3F verification corpus: 34
> records, `federal-core-2026-08-20.5` with its 26 reviewer approvals. Do **not** run
> `test:governed-corpus-matrix`, `test:kg3d-corpus-remediation` or
> `test:release-integrity-and-approval` against it — those suites finalize, activate and insert
> fixture rows by design, and will mutate the corpus out from under the reports below. Give them a
> clean regression database (§5).

---

## 0. Preservation baseline

```bash
cd /Users/mckinley/Desktop/Safety_InSite
git rev-parse HEAD          # -> 5f050858227ca11cf90d2f6bf64148e70a018b64
git branch --show-current   # -> release/insite-rc-2026-08-18
git stash list | wc -l      # -> 4
git tag | wc -l             # -> 23
shasum -a 256 -c verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3e/unrelated-worktree-changes.sha256
#  -> 18/18 OK
```

## 1. Determinism, ranking, predicate (Phases 3, 4, 5–7 · repeated for Phase 18)

```bash
SOURCE_DB=test_kg3f_remediation_20260820 npx ts-node scripts/test-kg3f-retrieval-determinism.ts
#  -> 170 passed, 0 failed   (9 physical layouts)

DATABASE_URL="$CORPUS" npm run test:kg3f-ranking-adversarial      #  -> 54 passed, 0 failed
DATABASE_URL="$CORPUS" npm run test:kg3f-56-14132-predicate       #  -> 16 passed, 0 failed
DATABASE_URL="$CORPUS" npx ts-node scripts/test-kg3e-citation-granularity.ts federal-core-2026-08-20.5
#  -> 48 passed, 0 failed
```

## 2. Approval / provenance contract (Phases 8–10)

```bash
# One-time: the source corpus for the contract harness.
createdb -h localhost -U $U test_kg3f_contract_20260820
pg_dump -h localhost -U $U test_kg3f_remediation_20260820 | psql -q -h localhost -U $U test_kg3f_contract_20260820
DATABASE_URL="postgresql://$U@localhost/test_kg3f_contract_20260820" npm run migration:run

DATABASE_URL="postgresql://$U@localhost/test_kg3f_contract_20260820" npm run test:approval-contract
#  -> 57 passed, 0 failed
#     Part 1: the 10-class contract matrix, in memory
#     Part 2: the implementation, against test_kg3f_contract_run (created and dropped per run)
```

The harness provisions its own disposable `test_kg3f_contract_run` each run, because Part 2 edits
the live corpus on purpose to exercise drift detection.

## 3. Rule-to-corpus map + family readiness (Phases 11–12, 14)

```bash
KG=../verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3f

DATABASE_URL="$CORPUS" REPORT_OUT=$KG/rule-to-corpus-map.json \
  npm run report:kg3f-rule-to-corpus federal-core-2026-08-20.5
#  -> distinct 160 | emitted 23 | emitted+approved 23 | declared-not-emitted 137
#     NOT_SAFE_TO_GOVERN_YET 132 · duplicateDeclarations 42 · parentChildAmbiguities 39

DATABASE_URL="$CORPUS" REPORT_OUT=$KG/family-readiness.json \
  npm run report:kg3f-family-readiness federal-core-2026-08-20.5
#  -> families 27 | ready 25 | ready-with-applicability-uncertainty 2 | blocked 0
#     EVIDENCE_UNKNOWN 0 · GOVERNANCE_FILTER_EMPTY 0 · HARD READINESS TARGET: MET
```

## 4. Governed shadow invariance (Phases 13 + 18)

```bash
npm run test:kg3f-shadow-invariance
#  -> 7 passed, 0 failed
#     4 layouts, all sha256=29469550cea4d2fd032c59dc3aafcea5…
#     activeRelease=federal-core-2026-08-20.5  gold 30/31  expectedGoverned=24/24  losingBacking=0
```

Builds `test_kg3f_shadow_*` per layout, activates the release inside each **disposable clone**
through the real KG-2 gate, and compares the whole shadow report byte-for-byte.

## 5. Full regression on a clean database (Phase 17)

```bash
dropdb -h 127.0.0.1 -U $U --if-exists test_kg3f_regression_20260820
createdb -h 127.0.0.1 -U $U test_kg3f_regression_20260820
REG="postgresql://$U@127.0.0.1:5432/test_kg3f_regression_20260820"
DATABASE_URL="$REG" npm run migration:run          # 46 migrations
DATABASE_URL="$REG" npm run seed:safescope-standards
#  -> manifestChecksum bee47ebe1e82b74d9507380cff073838093881ea8a990b7d659190174fad6aa2
#     IDENTICAL to KG-3A/3B/3C/3E: the approval contract did not move the v1 manifest identity.

npm run build                                       # exit 0
(cd ../frontend-next && npx tsc --noEmit)           # exit 0

for s in test:standards-backing-contract test:governed-corpus-matrix test:reviewer-approval \
         test:release-integrity-and-approval test:regulatory-release-lifecycle \
         test:safescope-standards test:standards-corpus-integrity test:guided-finding-response \
         test:evidence-foundation test:hazlenz-evidence-boundary validate:hazlenz-knowledge-index; do
  DATABASE_URL="$REG" npm run $s
done
#  -> 35/35 · 60/60 · 62/62 · 44/44 · 42/42 · 15/15 · pass · pass · 35 assertions · 13 assertions · pass

DATABASE_URL="$REG" npm run test:hazlenz-core
#  -> 28 of 30 suites PASS; the two documented baseline failures only:
#       Golden Hardening Scenarios Test  ("7. LOTO energized maintenance (Not Guarding alone)")
#       HazLenz Production Path Regression ("FAIL tagged but not locked")

# server-dependent suites
NODE_ENV=test PORT=4321 DATABASE_URL="$REG" STORAGE_PROVIDER=local_test \
  STORAGE_LOCAL_ROOT=$SCRATCH/storage-reg npx ts-node src/main.ts &
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4321 npm run test:canonical-workflow
#  -> {"passed":true}
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4321 npm run test:knowledge-release-provenance
#  -> 27/27 checks passed
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4321 npm run test:finding-scoped-reviews
DATABASE_URL="$REG" API_BASE_URL=http://127.0.0.1:4321 npm run test:persisted-decomposition-findings
#  -> {"passed":true} both
```

**`test:governed-corpus-matrix` is 60/60, not 59/59.** KG-3F added one assertion; see §7.

**`test:entitlement-boundary` NOT RUN TO COMPLETION.** It fails at its first `/auth/register` with
429 (`ThrottlerException`; the limit is 5/60s per IP) and then hangs. This is the pre-existing
characteristic KG-3C documented. The suite references no KG module and no KG-3F change touches it.

## 6. Customer-path disconnection (Phase 16)

```bash
for D in test_kg3f_browser_20260820 test_kg3f_regression_20260820 test_kg3f_contract_run; do
  DATABASE_URL="postgresql://$U@127.0.0.1:5432/$D" npm run test:kg3f-customer-path-disconnection
done
#  -> 9 passed, 0 failed  (on all three)
```

## 7. Standard Detail browser verification (Phase 15)

Isolated infrastructure, because the working tree carries unrelated in-progress frontend work.
The scratch copy is a plain `tar` of `frontend-next` minus `node_modules`/`.next`, with
`node_modules` copied in (Next.js rejects a symlinked `node_modules` that points outside the project
root). **The working tree's `frontend-next` is never started against**, so its `.next` cache and its
18 modified files stay untouched.

```bash
# database + corpus
createdb -h 127.0.0.1 -U $U test_kg3f_browser_20260820
BROWSER="postgresql://$U@127.0.0.1:5432/test_kg3f_browser_20260820"
DATABASE_URL="$BROWSER" npm run migration:run && DATABASE_URL="$BROWSER" npm run seed:safescope-standards

# isolated services
NODE_ENV=test PORT=4320 DATABASE_URL="$BROWSER" \
  CORS_ORIGINS="http://127.0.0.1:3320,http://localhost:3320" \
  STORAGE_PROVIDER=local_test STORAGE_LOCAL_ROOT=$SCRATCH/storage-kg3f npx ts-node src/main.ts &
(cd $SCRATCH/fe-kg3f && NEXT_PUBLIC_API_URL=http://127.0.0.1:4320 \
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4320 npx next dev -p 3320 &)

# fixtures, through the REAL product pathway
KGH=../verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3f/browser/harness
NODE_PATH=$PWD/node_modules API_BASE_URL=http://127.0.0.1:4320 DATABASE_URL="$BROWSER" \
  npx ts-node -r $PWD/node_modules/dotenv/config $KGH/create-kg3f-display-fixtures.ts
NODE_PATH=$PWD/node_modules API_BASE_URL=http://127.0.0.1:4320 DATABASE_URL="$BROWSER" \
  npx ts-node -r $PWD/node_modules/dotenv/config $KGH/create-kg3f-msha-fixtures.ts
#  -> s4: 30 CFR 56.14132(b)(1) = SUPPORTED -> CITATION_ONLY
#     s5: 30 CFR 56.14132        = UNKNOWN   -> APPROVED_GOVERNED_CONTENT

# the browser pass (run from the scratch frontend: ESM resolves packages by location)
cp $KGH/kg3f-standard-detail-contract.mjs $SCRATCH/fe-kg3f/
(cd $SCRATCH/fe-kg3f && API_BASE_URL=http://127.0.0.1:4320 APP_BASE_URL=http://127.0.0.1:3320 \
  OSHA_EMAIL=<from fixture output> OSHA_INSPECTION_ID=<from fixture output> \
  MSHA_EMAIL=<from fixture output> MSHA_INSPECTION_ID=<from fixture output> \
  SHOT_DIR=<abs path>/kg-3f/browser node kg3f-standard-detail-contract.mjs)
#  -> ALL STANDARD-DETAIL CONTRACT CHECKS PASSED (376/376)
#     light · dark · mobile · mobile-dark, 4 states each, + 32 screenshots
```

## 8. Artifacts written

| File | Contents |
|---|---|
| `phase8-10-approval-provenance-contract.md` | the contract, the 10-class matrix, the `jsonb` key-order defect, historical-approval safety |
| `phase14-16-readiness-display-disconnection.md` | family readiness, Standard Detail, disconnection proof |
| `MSHA-TRAFFIC-01-adjudication.md` | the adjudicated regulatory-correctness divergence |
| `family-readiness.json` | 27 families, per-case outcome attribution |
| `rule-to-corpus-map.json` | 160 citations, full declaration→governance schema |
| `shadow-{original,citation-desc,child-before-parent,random-seed-2}.json` | byte-identical shadow reports |
| `browser/*.png` (32) + `browser/kg3f-browser-verification-results.json` | Phase 15 evidence |
| `kg3f-changed-files.sha256` | 20-file manifest of everything KG-3F changed |

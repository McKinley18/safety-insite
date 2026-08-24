# L3-2c — reproduction

Absolute paths throughout. `DO_NOT_REDISCOVER`: L3-2 lost five writes to the home directory after a
shell `cd` reset. Every command below either uses an absolute path or re-enters `backend/` itself.

```bash
R=/Users/mckinley/Desktop/Safety_InSite
P=$R/verification/hazlenz-l3-2c-gate-polarity-2026-08-22
cd $R/backend
```

## 0 — prerequisites

```bash
ollama serve                                                   # 127.0.0.1:11434
curl -s http://localhost:11434/api/tags | grep 06c1097efce0    # the pinned qwen3-coder:30b digest
```

## 1 — root cause, against the UNPATCHED code

Run these **before** applying any repair; they are what makes the repair measurable.

```bash
OUT=$P/rootcause/proof-pre-patch.json         npx ts-node scripts/prove-l32c-rootcause.ts
OUT=$P/rootcause/clarification-pre-patch.json npx ts-node scripts/prove-l32c-clarification.ts
```

Expected pre-patch: `H-AM-05` fatal on `SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE` in both isolating
fixtures; `H-FLD-141`'s guard candidate fatal on `SEMANTIC_NEGATION_UNADDRESSED`; clarification
recall `1/3`; and `H-AM-01` **not** rejected — the latent false ACTIVE of `L3-2C-DISC-01`.

## 2 — old gate versus new gate, measured

```bash
OUT=$P/rootcause/gate-behaviour-diff.json npx ts-node scripts/diff-l32c-gate-behaviour.ts
```

Reimplements the retired L3-2b decision verbatim and runs it beside `assessImpression` on the same
strings, so `IMPROVED_BY_L3_2C` / `UNCHANGED_PRE_EXISTING_GAP` / `REGRESSED_BY_L3_2C` are measured
rather than asserted. This is the evidence behind `L3-2C-DISC-02`.

## 3 — rebuild the sealed holdout and confirm its identity

```bash
npx ts-node scripts/build-l32c-holdout.ts
shasum -a 256 src/safescope-v2/reasoning-l3/eval/holdout-l32c.json
# expect 33c69b36a7efd9ed4e2e79d2f1b1b29472e7bc6a85dd4feefc5bcef5608f56e2
```

The builder **throws** on any id or text clash with `holdout-l32.json`, `holdout-l32b.json` or
`development-l32.json`, so freshness is enforced, not claimed.

## 4 — offline suites (no network, no database)

```bash
npm run test:l32c-gate-polarity      #  85 passed, 0 failed
npm run test:l32b-binder-precision   # 105 passed, 0 failed
npm run test:l32-semantic-contract   # 179 passed, 0 failed
npm run test:l31-reasoning-contract  #  48 passed, 0 failed
npm run build                        # exit 0
```

## 5 — development set (authorized for tuning)

```bash
SET=src/safescope-v2/reasoning-l3/eval/development-l32.json OUT=$P/results/dev-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/dev-run-1.json OUT=$P/results/dev-score-1.json \
  npx ts-node scripts/score-l32c-reasoning.ts
```

## 6 — the sealed holdout, run and scored at three tiers

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32c.json OUT=$P/results/holdout-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/holdout-run-1.json OUT=$P/results/holdout-score-1.json \
  npx ts-node scripts/score-l32c-reasoning.ts
```

RAW / POST_VALIDATOR / SHIPPED must not be collapsed, and `byProvenance` must be read alongside the
combined figure — the authored complement is weaker evidence than the independent half and the
scorer keeps them apart for that reason.

## 7 — reproducibility

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32c.json OUT=$P/results/holdout-run-2.json \
  npx ts-node scripts/run-l32-reasoning.ts
A=$P/results/holdout-run-1.json B=$P/results/holdout-run-2.json \
  OUT=$P/results/reproducibility.json npx ts-node scripts/compare-l32b-reproducibility.ts
# expect 72 of 72 (100%)
```

## 8 — regression evidence on the RETIRED L3-2b holdout

> Regression evidence only. It cannot establish L3-2c advancement.

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32b.json \
  OUT=$P/results/REGRESSION-EVIDENCE-holdout-l32b-run.json npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/REGRESSION-EVIDENCE-holdout-l32b-run.json \
  OUT=$P/results/REGRESSION-EVIDENCE-holdout-l32b-score.json npx ts-node scripts/score-l32c-reasoning.ts
# H-AM-05 and H-FLD-141 repaired; H-NG-02 is a NEW high-consequence regression
```

## 9 — customer-authority invariance

```bash
W=$(mktemp -d); mkdir -p $W/before $W/after
git -C $R archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/before
git -C $R archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/after

cp -R $R/backend/src/safescope-v2/reasoning-l3 $W/after/backend/src/safescope-v2/
cp $R/backend/scripts/{test-l31-reasoning-contract,test-l32-semantic-contract,test-l32b-binder-precision,test-l32c-gate-polarity,run-l32-reasoning,score-l32-reasoning,score-l32b-reasoning,score-l32c-reasoning,build-l32-holdout,build-l32b-holdout,build-l32c-holdout,compare-l32-customer-invariance,compare-l32-level1-level3,compare-l32b-reproducibility,trace-l32b-rootcause,prove-l32c-rootcause,prove-l32c-clarification,diff-l32c-gate-behaviour}.ts $W/after/backend/scripts/
cp $R/backend/package.json $W/after/backend/package.json
for d in before after; do
  ln -s $R/backend/node_modules $W/$d/backend/node_modules
  cp $R/verification/hazlenz-capability-acceptance-2026-08-22/harness/hazlenz-capability-runner.ts $W/$d/backend/scripts/
  mkdir -p $W/$d/backend/out; rm -f $W/$d/backend/.env $W/$d/.env
done

# Structural corroboration: the ONLY src difference must be the added directory.
diff -rq $W/before/backend/src $W/after/backend/src

createdb -T test_hazlenz_capability_prodshape_20260822 test_l32c_invariance_20260822
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32c_invariance_20260822"
psql "$DATABASE_URL" -Atc "select current_database()"     # verify the resolved target BEFORE running
M=$R/verification/hazlenz-capability-acceptance-2026-08-22/contracts/hazlenz-acceptance-matrix.json
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-a.jsonl)
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-b.jsonl)
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts $M out/before.jsonl)

cd $R/backend
VOL_A=$W/after/backend/out/after-a.jsonl VOL_B=$W/after/backend/out/after-b.jsonl \
BEFORE=$W/before/backend/out/before.jsonl AFTER=$W/after/backend/out/after-a.jsonl \
OUT=$P/results/customer-authority-invariance.json \
  npx ts-node scripts/compare-l32-customer-invariance.ts
# expect scenariosWithNonVolatileDifference: 0 and CUSTOMER_AUTHORITY_UNCHANGED
```

Volatility is **derived, never declared** — `DO_NOT_REDISCOVER`, from L3-1.

## 10 — L3_COMPARE

```bash
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts \
   $R/backend/src/safescope-v2/reasoning-l3/eval/holdout-l32c.json out/level1-holdout-l32c.jsonl)
cd $R/backend
LEVEL1=$W/before/backend/out/level1-holdout-l32c.jsonl LEVEL3=$P/results/holdout-run-1.json \
HOLDOUT=src/safescope-v2/reasoning-l3/eval/holdout-l32c.json OUT=$P/results/l3-compare.json \
  npx ts-node scripts/compare-l32-level1-level3.ts
```

The Level-1 side is captured from the **pristine** checkout, so the comparison cannot be
contaminated by uncommitted work.

## 11 — regression

```bash
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32c_invariance_20260822"
npm run test:hazlenz-core               # 28/30 — the two documented failures only
npm run test:kg4a-cutover-contract      # 146/146
npm run test:kg4a-default-off           #  51/51
npm run test:kg4b-shadow-contract       # 123/123
npm run test:kg3f-56-14132-predicate    #  16/16
npm run test:kg3f-retrieval-determinism # 170/170
npm run test:evidence-foundation        #  35 assertions
```

`test:standards-backing-contract` needs a seeded database and `test:kg4b-default-off` needs a server
on :4340. Both were executed **from both checkouts** and fail identically from pristine HEAD, which
is how they were shown to be prerequisites rather than L3-2c regressions.

## Database safety

The resolved target was printed and verified before every mutable command. `safescope`,
`sentinel_dev` and `sentinel_safety` were never a target; both clean checkouts had their `.env`
removed so the ambient `backend/.env` (which points `DATABASE_URL` at the protected `safescope`
database) could not be picked up, and `DATABASE_URL` was explicit on every invocation.
`test_hazlenz_capability_prodshape_20260822` was used only as a `createdb -T` template and never
written. One disposable database was created: `test_l32c_invariance_20260822`.

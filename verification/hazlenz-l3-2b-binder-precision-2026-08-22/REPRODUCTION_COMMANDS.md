# L3-2b — reproduction

Absolute paths throughout. `DO_NOT_REDISCOVER`: L3-2 lost five writes to the home directory after a
shell `cd` reset, so this phase used absolute repository paths for every write.

## 0 — prerequisites

```bash
ollama serve                                        # 127.0.0.1:11434, server 0.32.5
curl -s http://localhost:11434/api/tags | grep 06c1097efce0   # the pinned digest
```

## 1 — offline suites (no network, no database)

```bash
cd /Users/mckinley/Desktop/Safety_InSite/backend
npm run test:l32b-binder-precision    # 105 passed, 0 failed
npm run test:l32-semantic-contract    # 177 passed, 0 failed
npm run test:l31-reasoning-contract   #  48 passed, 0 failed
npm run build                         # exit 0
```

## 2 — root-cause reproduction (Phase 2)

```bash
OUT=../verification/hazlenz-l3-2b-binder-precision-2026-08-22/rootcause/pipeline-traces.json \
  npx ts-node scripts/trace-l32b-rootcause.ts
```

Dumps every stage separately — raw proposal, mechanical binding, deterministic validator, semantic
binder, final outcome — for B08, C11, B10, D02 and A10.

## 3 — rebuild the sealed holdout and confirm its identity

```bash
npx ts-node scripts/build-l32b-holdout.ts
shasum -a 256 src/safescope-v2/reasoning-l3/eval/holdout-l32b.json
# expect e3a3c7eee64703a27a8ac9c5da732f6919d8a35fb76859bfb30729c44f7f5060
```

## 4 — run and score, at three tiers

```bash
P=../verification/hazlenz-l3-2b-binder-precision-2026-08-22
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32b.json OUT=$P/results/holdout-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/holdout-run-1.json OUT=$P/results/holdout-score-1.json \
  npx ts-node scripts/score-l32b-reasoning.ts
```

RAW / POST_VALIDATOR / SHIPPED are reported separately and must not be collapsed — L3-2 collapsed
them and the model looked worse than it was because the binder was deleting correct findings.

## 5 — reproducibility

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32b.json OUT=$P/results/holdout-run-2.json \
  npx ts-node scripts/run-l32-reasoning.ts
A=$P/results/holdout-run-1.json B=$P/results/holdout-run-2.json \
  OUT=$P/results/reproducibility.json npx ts-node scripts/compare-l32b-reproducibility.ts
# expect 81 of 81 (100%)
```

The comparison contract is fixed inside the comparator, before any result is read: outcome kind,
validation state, family set, (family, state) multiset, quotation set, clarification presence.
Free-form prose is excluded by design.

## 6 — customer-authority invariance

```bash
W=$(mktemp -d); mkdir -p $W/before $W/after
R=/Users/mckinley/Desktop/Safety_InSite
git -C $R archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/before
git -C $R archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/after

cp -R $R/backend/src/safescope-v2/reasoning-l3 $W/after/backend/src/safescope-v2/
cp $R/backend/scripts/{test-l31-reasoning-contract,test-l32-semantic-contract,test-l32b-binder-precision,run-l32-reasoning,score-l32-reasoning,score-l32b-reasoning,build-l32-holdout,build-l32b-holdout,compare-l32-customer-invariance,compare-l32-level1-level3,compare-l32b-reproducibility,trace-l32b-rootcause}.ts $W/after/backend/scripts/
cp $R/backend/package.json $W/after/backend/package.json
for d in before after; do
  ln -s $R/backend/node_modules $W/$d/backend/node_modules
  cp $R/verification/hazlenz-capability-acceptance-2026-08-22/harness/hazlenz-capability-runner.ts $W/$d/backend/scripts/
  mkdir -p $W/$d/backend/out
done

createdb -T test_hazlenz_capability_prodshape_20260822 test_l32b_invariance_20260822
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32b_invariance_20260822"
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

## 7 — regression

```bash
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32b_invariance_20260822"
npm run test:kg4a-cutover-contract      # 146/146
npm run test:kg4a-default-off           #  51/51
npm run test:kg4b-shadow-contract       # 123/123
npm run test:kg3f-56-14132-predicate    #  16/16
npm run test:kg3f-retrieval-determinism # 170/170
npm run test:evidence-foundation        #  35 assertions
npm run test:hazlenz-core               # 28/30 — the two documented failures only
```

`test:standards-backing-contract` needs a seeded database and `test:kg4b-default-off` needs a server
on :4340. Both fail **byte-identically from the pristine HEAD checkout**, which is how they were
shown to be prerequisites rather than regressions — run them from `$W/before/backend` to confirm.

## Database safety

`safescope`, `sentinel_dev` and `sentinel_safety` were never a target. Both clean checkouts carry no
`.env`, so the ambient `backend/.env` (which points `DATABASE_URL` at the protected `safescope`
database) could not be picked up, and `DATABASE_URL` was explicit on every invocation.
`test_hazlenz_capability_prodshape_20260822` was used only as a `createdb -T` template, never
written; its 2 390 rows were re-verified afterwards. Two disposable databases were created:
`test_l32b_invariance_20260822` and `test_l32b_standards_20260822`.

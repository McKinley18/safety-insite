# L3-2 — reproduction

## 0 — prerequisites

A local Ollama server with the pinned model:

```bash
ollama serve                       # 127.0.0.1:11434 (this run used server 0.32.5)
ollama pull qwen3-coder:30b        # must resolve to digest 06c1097efce0…
curl -s http://localhost:11434/api/tags | grep 06c1097efce0
```

## 1 — offline suite (no network, no database)

```bash
cd backend && npm run test:l32-semantic-contract      # expect 175 passed, 0 failed
npm run test:l31-reasoning-contract                   # expect 48 passed, 0 failed
npm run build                                         # expect exit 0
```

## 2 — rebuild the holdout and confirm its identity

```bash
cd backend && npx ts-node scripts/build-l32-holdout.ts
shasum -a 256 src/safescope-v2/reasoning-l3/eval/holdout-l32.json
# expect 41ae3c229a4e81adeffe827e42e587c107df870d75acbe208fe3914479523e2d
```

## 3 — Level-3 reasoning run and scoring

Capture and scoring are separate programs so expectations cannot be tuned while results are visible.

```bash
P=verification/hazlenz-l3-2-semantic-reasoning-2026-08-22
cd backend
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32.json OUT=../$P/results/holdout-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=../$P/results/holdout-run-1.json OUT=../$P/results/holdout-score-1.json \
  npx ts-node scripts/score-l32-reasoning.ts
```

**Expect ~98.5% reproduction, not 100%.** Two seeded runs at temperature 0 agreed on 65 of 66
scenarios; `C11` differed.

## 4 — customer-authority invariance

Isolated checkouts, so no unstaged or ignored file can contribute to the "before" side.

```bash
W=$(mktemp -d); mkdir -p $W/before $W/after
git -C /Users/mckinley/Desktop/Safety_InSite archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/before
git -C /Users/mckinley/Desktop/Safety_InSite archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/after

# AFTER additionally carries every uncommitted L3-1 and L3-2 file
cp -R backend/src/safescope-v2/reasoning-l3 $W/after/backend/src/safescope-v2/
cp backend/scripts/{test-l31-reasoning-contract,test-l32-semantic-contract,run-l32-reasoning,score-l32-reasoning,build-l32-holdout}.ts $W/after/backend/scripts/
cp backend/package.json $W/after/backend/package.json

for d in before after; do
  ln -s $PWD/backend/node_modules $W/$d/backend/node_modules
  cp verification/hazlenz-capability-acceptance-2026-08-22/harness/hazlenz-capability-runner.ts $W/$d/backend/scripts/
  mkdir -p $W/$d/backend/out
done

# disposable clone; the protected `safescope` database is never a target and DATABASE_URL is always explicit
createdb -T test_hazlenz_capability_prodshape_20260822 test_l32_invariance_20260822
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32_invariance_20260822"
M=$PWD/verification/hazlenz-capability-acceptance-2026-08-22/contracts/hazlenz-acceptance-matrix.json

(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-a.jsonl)
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-b.jsonl)   # derives volatility
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts $M out/before.jsonl)

cd backend
VOL_A=$W/after/backend/out/after-a.jsonl VOL_B=$W/after/backend/out/after-b.jsonl \
BEFORE=$W/before/backend/out/before.jsonl AFTER=$W/after/backend/out/after-a.jsonl \
OUT=../$P/results/customer-authority-invariance.json \
  npx ts-node scripts/compare-l32-customer-invariance.ts
# expect scenariosWithNonVolatileDifference: 0 and CUSTOMER_AUTHORITY_UNCHANGED
```

**Volatility is derived, never declared.** L3-1 recorded that a hand-written ignore-list reported all
66 scenarios as differing while every customer-decisive field was identical. `DO_NOT_REDISCOVER`.

## 5 — L3_COMPARE

```bash
cd backend
LEVEL1=$W/after/backend/out/after-a.jsonl LEVEL3=../$P/results/holdout-run-2.json \
HOLDOUT=src/safescope-v2/reasoning-l3/eval/holdout-l32.json \
OUT=../$P/results/l3-compare.json npx ts-node scripts/compare-l32-level1-level3.ts
```

## 6 — regression

```bash
cd backend
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32_invariance_20260822"
npm run test:kg4a-cutover-contract      # 146/146
npm run test:kg4a-default-off           # 51/51
npm run test:kg4b-shadow-contract       # 123/123
npm run test:kg3f-56-14132-predicate    # 16/16
npm run test:kg3f-retrieval-determinism # 170/170
npm run test:evidence-foundation        # 35 assertions
npm run test:hazlenz-core               # 28/30 — the two documented failures only
```

`test:standards-backing-contract` needs a seeded database this phase did not build, and
`test:kg4b-default-off` needs a server on :4340. **Both fail identically from the pristine HEAD
checkout**, which is how they were shown to be prerequisites rather than regressions:

```bash
(cd $W/before/backend && npm run test:standards-backing-contract) # same failure, same assertion
(cd $W/before/backend && npm run test:kg4b-default-off)           # same ECONNREFUSED 127.0.0.1:4340
```

## Database safety

`safescope`, `sentinel_dev` and `sentinel_safety` were never a target. Both clean checkouts carry
**no `.env`**, so the ambient `backend/.env` (which points `DATABASE_URL` at the protected `safescope`
database) could not be picked up, and `DATABASE_URL` was named explicitly on every invocation.
`test_hazlenz_capability_prodshape_20260822` was used only as a `createdb -T` template and was never
written; its 2 390 rows were re-verified afterwards. Two disposable databases were created by this
phase: `test_l32_invariance_20260822` and `test_l32_standards_20260822`.

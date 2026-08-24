# L3-2d — reproduction

```bash
R=/Users/mckinley/Desktop/Safety_InSite
P=$R/verification/hazlenz-l3-2d-clarification-precision-2026-08-22
cd $R/backend
```

`DO_NOT_REDISCOVER`: absolute paths throughout — L3-2 lost five writes to the home directory after a
shell `cd` reset, and `ts-node` must be invoked from `backend/` or it resolves the wrong tsconfig.

## 0 — prerequisites

```bash
ollama serve                                                   # 127.0.0.1:11434
curl -s http://localhost:11434/api/tags | grep 06c1097efce0    # the pinned qwen3-coder:30b digest
```

## 1 — root cause, by ablation, against the UNPATCHED code

The ONLY way to attribute a behaviour to a prompt region. Model, seed, temperature, schema, user
prompt and observation text are held constant; only the system prompt varies.

```bash
OUT=$P/rootcause/ablation-pre-patch.json    npx ts-node scripts/ablate-l32d-prompt.ts
REPEATS=3 OUT=$P/rootcause/ablation-determinism.json npx ts-node scripts/ablate-l32d-prompt.ts
```

Expected pre-patch: `H-NG-02` and `H-NG-03` go from one ACTIVE candidate under v2 to **zero** under
v3; `C-FLD-138`, `C-CS-05`, `C-AM-04` and `C-AM-06` gain a clarification they did not have under v2.
`C-NG-05` returns zero under **both** — it is a pre-existing provider limitation, not an L3-2c
regression, contradicting L3-2c's `NEXT_ACTION.md`.

## 2 — freeze the historical prompts, then verify the chain

```bash
npx ts-node scripts/freeze-l32d-prompt-variants.ts
# expect v2 676eb15e… and v3 c62ff3ea… — identical to the hashes the pre-patch ablation recorded
```

`ablate-l32d-prompt.ts` re-verifies both hashes on every run and **refuses to start** on a mismatch,
so a post-repair comparison can never run against a prompt that never existed.

## 3 — rebuild the sealed holdout and confirm its identity

```bash
npx ts-node scripts/build-l32d-holdout.ts
shasum -a 256 src/safescope-v2/reasoning-l3/eval/holdout-l32d.json
# expect bd5f0c2d514784af0662e01f546aa9d7cd4986cd5c8dcea59980724181935af7
```

The builder **throws** on any id or text clash with `holdout-l32`, `holdout-l32b`, `holdout-l32c` or
`development-l32`, and on any duplicate inside itself, so freshness is enforced rather than claimed.

## 4 — offline suites (no network, no database)

```bash
npm run test:l32d-clarification-scope   #  70 passed, 0 failed
npm run test:l32c-gate-polarity         #  86 passed, 0 failed
npm run test:l32b-binder-precision      # 105 passed, 0 failed
npm run test:l32-semantic-contract      # 179 passed, 0 failed
npm run test:l31-reasoning-contract     #  48 passed, 0 failed
npm run build                           # exit 0
```

## 5 — development fixtures (tuning artifact only, never advancement evidence)

```bash
npx ts-node scripts/build-l32d-devset.ts
SET=src/safescope-v2/reasoning-l3/eval/development-l32d.json OUT=$P/results/dev-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/dev-run-1.json OUT=$P/results/dev-score-1.json \
  npx ts-node scripts/score-l32d-reasoning.ts
# expect all 22 named regression fixtures correct; SHIPPED clarification precision and recall 100%
```

## 6 — the sealed holdout, run and scored at three tiers

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32d.json OUT=$P/results/holdout-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/holdout-run-1.json OUT=$P/results/holdout-score-1.json \
  npx ts-node scripts/score-l32d-reasoning.ts
```

Read `tiers`, `byProvenance`, `clarificationMatrix` and `highConsequenceReport` together. RAW /
POST_VALIDATOR / SHIPPED must not be collapsed, and the authored complement must not be merged into
the independent half — it is weaker evidence and the scorer keeps them apart for that reason.

## 7 — reproducibility

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32d.json OUT=$P/results/holdout-run-2.json \
  npx ts-node scripts/run-l32-reasoning.ts
A=$P/results/holdout-run-1.json B=$P/results/holdout-run-2.json \
  OUT=$P/results/reproducibility.json npx ts-node scripts/compare-l32b-reproducibility.ts
# expect 77 of 77 (100%)
```

## 8 — regression evidence on the RETIRED holdouts

> Regression evidence only. Neither can establish L3-2d advancement.

```bash
for S in l32b l32c; do
  SET=src/safescope-v2/reasoning-l3/eval/holdout-$S.json \
    OUT=$P/results/REGRESSION-EVIDENCE-holdout-$S-run.json npx ts-node scripts/run-l32-reasoning.ts
  RUN=$P/results/REGRESSION-EVIDENCE-holdout-$S-run.json \
    OUT=$P/results/REGRESSION-EVIDENCE-holdout-$S-score.json npx ts-node scripts/score-l32d-reasoning.ts
done
# L3-2b set: 62/62, 0 high-consequence misses, clarification precision and recall both 100%,
#            H-NG-02 VALIDATED as electrical/ACTIVE with no loss at any stage
```

## 9 — DISC severity classification

```bash
OUT=$P/rootcause/disc-severity.json npx ts-node scripts/classify-l32d-disc-severity.ts
# expect DISC-03 and DISC-04 CAPABLE OF HIGH-CONSEQUENCE LOSS; DISC-02 precision risk only
```

## 10 — customer-authority invariance

```bash
W=$(mktemp -d); mkdir -p $W/before $W/after
git -C $R archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/before
git -C $R archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/after

cp -R $R/backend/src/safescope-v2/reasoning-l3 $W/after/backend/src/safescope-v2/
cp $R/backend/scripts/*l3*.ts $W/after/backend/scripts/
cp $R/backend/package.json $W/after/backend/package.json
for d in before after; do
  ln -s $R/backend/node_modules $W/$d/backend/node_modules
  cp $R/verification/hazlenz-capability-acceptance-2026-08-22/harness/hazlenz-capability-runner.ts $W/$d/backend/scripts/
  mkdir -p $W/$d/backend/out; rm -f $W/$d/backend/.env $W/$d/.env
done

# Structural corroboration: the ONLY src difference must be the added directory.
diff -rq $W/before/backend/src $W/after/backend/src

createdb -T test_hazlenz_capability_prodshape_20260822 test_l32d_invariance_20260822
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32d_invariance_20260822"
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

## 11 — L3_COMPARE

```bash
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts \
   $R/backend/src/safescope-v2/reasoning-l3/eval/holdout-l32d.json out/level1-holdout-l32d.jsonl)
cd $R/backend
LEVEL1=$W/before/backend/out/level1-holdout-l32d.jsonl LEVEL3=$P/results/holdout-run-1.json \
HOLDOUT=src/safescope-v2/reasoning-l3/eval/holdout-l32d.json OUT=$P/results/l3-compare.json \
  npx ts-node scripts/compare-l32-level1-level3.ts
```

The Level-1 side is captured from the **pristine** checkout so the comparison cannot be contaminated
by uncommitted work.

## 12 — regression

```bash
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32d_invariance_20260822"
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
is how they were shown to be prerequisites rather than L3-2d regressions.

## Database safety

The resolved target was printed and verified before every mutable command. `safescope`,
`sentinel_dev` and `sentinel_safety` were never a target; both clean checkouts had their `.env`
removed so the ambient `backend/.env` (which points `DATABASE_URL` at the protected `safescope`
database) could not be picked up, and `DATABASE_URL` was explicit on every invocation.
`test_hazlenz_capability_prodshape_20260822` was used only as a `createdb -T` template and never
written. One disposable database was created: `test_l32d_invariance_20260822`.

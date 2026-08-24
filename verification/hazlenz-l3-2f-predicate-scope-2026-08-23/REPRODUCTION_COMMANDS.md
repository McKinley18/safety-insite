# L3-2f — reproduction

```bash
R=/Users/mckinley/Desktop/Safety_InSite
P=$R/verification/hazlenz-l3-2f-predicate-scope-2026-08-23
cd $R/backend        # ts-node must be invoked from backend/ or it resolves the wrong tsconfig
```

`DO_NOT_REDISCOVER`: absolute paths throughout, and re-enter `backend/` after any subshell. L3-2
lost five writes to the home directory after a shell `cd` reset; L3-2e hit it twice; **L3-2f hit it
again on its first command** (`cd backend && …` from a session already inside `backend/`). Use
absolute paths and the trap cannot fire.

## 0 — prerequisites

```bash
ollama serve
curl -s http://localhost:11434/api/tags | grep 06c1097efce0    # the pinned qwen3-coder:30b digest
```

## 1 — root cause, against the UNPATCHED L3-2e code

```bash
OUT=$P/rootcause/f1-f4-proof-pre-patch.json npx ts-node scripts/prove-l32f-rootcause.ts
```

Expected on unpatched code: `F1..F4_ROOT_CAUSE_PROVEN` all **true**. F1 reproduces the recorded
contradiction — the same sentence scoped two ways one lexical verb apart, and a high-consequence
confined-space finding deleted with `SEMANTIC_NEGATION_UNADDRESSED`. F2 resolves three unlisted
prepositions to the wrong head. F3 deletes the noise-exposure finding. F4 refuses a nominal
correction.

Re-run against the patched tree to see all four close with every paired counter-fixture intact:

```bash
OUT=$P/rootcause/f1-f4-proof-post-patch.json npx ts-node scripts/prove-l32f-rootcause.ts
```

## 2 — the F5/F6 ablations, which proved the two are ONE mechanism

```bash
SET=$P/rootcause/f5-f6-ablation-set.json OUT=$P/rootcause/f5-f6-ablation-run.json \
  npx ts-node scripts/run-l32-reasoning.ts
SET=$P/rootcause/f5-confirm-set.json OUT=$P/rootcause/f5-confirm-run.json \
  npx ts-node scripts/run-l32-reasoning.ts
```

These are what superseded §35.5's account of `E-OA-07`. The identical text under
`osha-construction` fails identically, so it is not `msha` wording; the same clause position with
ordinary vocabulary succeeds, so it is not clause position alone; and making the absence explicit in
the same position recovers ACTIVE. `E-FLD-147` reproduces on tape, on a sign and on a toolbox talk,
while a bolted cover and a fixed guardrail are both classified correctly.

## 3 — build the sixth sealed holdout and confirm its identity

```bash
npx ts-node scripts/build-l32f-holdout.ts
shasum -a 256 src/safescope-v2/reasoning-l3/eval/holdout-l32f.json
# expect 47f92dae5f9fcbcb87c5c6f08fb4cbee3deb9dfba6a18a545d6ea844446bb2c5
diff -q src/safescope-v2/reasoning-l3/eval/holdout-l32f.json $P/contracts/holdout-l32f.frozen.json
```

The builder **throws** on any id or text clash with **all five** prior sealed sets or **all three**
development sets, and on any duplicate inside itself. `$P/HOLDOUT_FREEZE.txt` carries the freeze
timestamp and records that the file was frozen before any repair code was written.

## 4 — offline suites (no network, no database)

```bash
npm run test:l32f-predicate-scope      #  76 passed, 0 failed
npm run test:l32e-syntactic-role       #  82 passed, 0 failed
npm run test:l32d-clarification-scope  #  71 passed, 0 failed
npm run test:l32c-gate-polarity        #  86 passed, 0 failed
npm run test:l32b-binder-precision     # 105 passed, 0 failed
npm run test:l32-semantic-contract     # 187 passed, 0 failed
npm run test:l31-reasoning-contract    #  48 passed, 0 failed
npm run build                          # exit 0
```

## 5 — development fixtures (tuning artifact only)

```bash
npx ts-node scripts/build-l32f-devset.ts
SET=src/safescope-v2/reasoning-l3/eval/development-l32f.json OUT=$P/results/dev-run-2.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/dev-run-2.json OUT=$P/results/dev-score-2.json npx ts-node scripts/score-l32f-reasoning.ts
```

`dev-run-1` is kept as the FIRST development measurement, taken before the prompt block was
repositioned. It is the evidence for the ranking regression described in `ROOT_CAUSE.md` and in
blueprint §36, and it is why `dev-run-2` exists. **Both are recorded; neither is discarded.**

## 6 — the sealed holdout, run and scored at three tiers

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32f.json OUT=$P/results/holdout-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/holdout-run-1.json OUT=$P/results/holdout-score-1.json \
  npx ts-node scripts/score-l32f-reasoning.ts
```

Read `tiers`, `byProvenance`, `clarificationMatrix`, `highConsequenceReport`, `controlAdequacyReport`,
`predicateScopeReport`, `observationAvailabilityReport`, `perFamilyRecall` and `familySealedCoverage`
together. **The three provenance classes must not be merged**: `TARGETED_FAMILY_COMPLEMENT` is
coverage evidence, not generalization evidence.

## 7 — reproducibility

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32f.json OUT=$P/results/holdout-run-2.json \
  npx ts-node scripts/run-l32-reasoning.ts
A=$P/results/holdout-run-1.json B=$P/results/holdout-run-2.json \
  OUT=$P/results/reproducibility.json npx ts-node scripts/compare-l32b-reproducibility.ts
```

## 8 — regression evidence on the RETIRED sealed sets

> Regression evidence only. None can establish L3-2f advancement. Run these one at a time; the full
> sweep exceeds a ten-minute shell timeout.

```bash
for S in l32b l32c l32d l32e; do
  SET=src/safescope-v2/reasoning-l3/eval/holdout-$S.json \
    OUT=$P/results/REGRESSION-EVIDENCE-holdout-$S-run.json npx ts-node scripts/run-l32-reasoning.ts
  RUN=$P/results/REGRESSION-EVIDENCE-holdout-$S-run.json \
    OUT=$P/results/REGRESSION-EVIDENCE-holdout-$S-score.json npx ts-node scripts/score-l32f-reasoning.ts
done
```

## 9 — customer-authority invariance and L3_COMPARE

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
diff -rq $W/before/backend/src $W/after/backend/src     # only the ADDED reasoning-l3 directory

createdb -T test_hazlenz_capability_prodshape_20260822 test_l32f_invariance_20260823
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32f_invariance_20260823"
psql "$DATABASE_URL" -Atc "select current_database()"    # verify the resolved target BEFORE running
M=$R/verification/hazlenz-capability-acceptance-2026-08-22/contracts/hazlenz-acceptance-matrix.json
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-a.jsonl)
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-b.jsonl)
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts $M out/before.jsonl)
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts \
   $R/backend/src/safescope-v2/reasoning-l3/eval/holdout-l32f.json out/level1-holdout-l32f.jsonl)

cd $R/backend
VOL_A=$W/after/backend/out/after-a.jsonl VOL_B=$W/after/backend/out/after-b.jsonl \
BEFORE=$W/before/backend/out/before.jsonl AFTER=$W/after/backend/out/after-a.jsonl \
OUT=$P/results/customer-authority-invariance.json npx ts-node scripts/compare-l32-customer-invariance.ts

LEVEL1=$W/before/backend/out/level1-holdout-l32f.jsonl LEVEL3=$P/results/holdout-run-1.json \
HOLDOUT=src/safescope-v2/reasoning-l3/eval/holdout-l32f.json OUT=$P/results/l3-compare.json \
  npx ts-node scripts/compare-l32-level1-level3.ts
```

Volatility is **derived, never declared** — `DO_NOT_REDISCOVER`, from L3-1.

## 10 — regression

```bash
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32f_invariance_20260823"
npm run test:hazlenz-core               # 28/30 — the two documented failures only
npm run test:kg4a-cutover-contract      # 146/146
npm run test:kg4a-default-off           #  51/51
npm run test:kg4b-shadow-contract       # 123/123
npm run test:kg3f-56-14132-predicate    #  16/16
npm run test:kg3f-retrieval-determinism # 170/170
npm run test:evidence-foundation        #  35 assertions
```

`test:standards-backing-contract` and `test:kg4b-default-off` are prerequisite-dependent and must be
executed from **both** checkouts; they fail identically from pristine HEAD.

## Database safety

The resolved target was printed and verified before every mutable command. `safescope`,
`sentinel_dev` and `sentinel_safety` were never a target; both clean checkouts had `.env` removed so
the ambient `backend/.env` (which points `DATABASE_URL` at the protected `safescope` database) could
not be picked up. `test_hazlenz_capability_prodshape_20260822` was used only as a `createdb -T`
template and never written. One disposable database was created: `test_l32f_invariance_20260823`.

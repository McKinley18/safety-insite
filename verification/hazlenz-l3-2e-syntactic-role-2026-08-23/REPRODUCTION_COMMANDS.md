# L3-2e — reproduction

```bash
R=/Users/mckinley/Desktop/Safety_InSite
P=$R/verification/hazlenz-l3-2e-syntactic-role-2026-08-23
cd $R/backend        # ts-node must be invoked from backend/ or it resolves the wrong tsconfig
```

`DO_NOT_REDISCOVER`: absolute paths throughout, and re-enter `backend/` after any subshell — L3-2
lost five writes to the home directory after a shell `cd` reset, and this phase hit the same
resolution failure twice.

## 0 — prerequisites

```bash
ollama serve
curl -s http://localhost:11434/api/tags | grep 06c1097efce0    # the pinned qwen3-coder:30b digest
```

## 1 — root cause, against the UNPATCHED code

```bash
OUT=$P/rootcause/e1-proof-pre-patch.json npx ts-node scripts/prove-l32e-e1-rootcause.ts
OUT=$P/rootcause/e2-proof-pre-patch.json npx ts-node scripts/prove-l32e-e2-rootcause.ts
```

Expected: E1 reproduces **7 defects of 12** — five deletions in `checkContradiction` (three
high-consequence) and two false admissions in `checkStateSupported` — with all four paired halves
still correct. E2 reproduces `D-CR-04` and `D-NG-04` while **cell B is already 3 of 3**, which is the
evidence against any global change in clarification pressure.

## 2 — the clause-position ablation, which identified the real E2 mechanism

```bash
cat > /tmp/probe.json <<'JSON'
{"setId":"probe","role":"DIAGNOSTIC","scenarios":[
 {"id":"NG04-orig","regime":"osha-general-industry","cohort":"probe","expect":{},
  "text":"No flammable atmosphere was detected at the manway, and the fitter went inside the vessel with the agitator still on line and nobody at the opening."},
 {"id":"NG04-noNegation","regime":"osha-general-industry","cohort":"probe","expect":{},
  "text":"The atmosphere was tested at the manway, and the fitter went inside the vessel with the agitator still on line and nobody at the opening."},
 {"id":"NG04-negationLast","regime":"osha-general-industry","cohort":"probe","expect":{},
  "text":"The fitter went inside the vessel with the agitator still on line and nobody at the opening, and no flammable atmosphere was detected at the manway."}
]}
JSON
SET=/tmp/probe.json OUT=$P/rootcause/e2-clause-position-ablation.json npx ts-node scripts/run-l32-reasoning.ts
```

Removing the negation changes nothing; moving the clause changes everything. That is what redirected
E2 away from clarification pressure and onto per-clause evaluation.

## 3 — rebuild the sealed holdout and confirm its identity

```bash
npx ts-node scripts/build-l32e-holdout.ts
shasum -a 256 src/safescope-v2/reasoning-l3/eval/holdout-l32e.json
# expect b9da20bacb9548167b80f0da6a55e5f3059a5318e809ba23a204706702818e06
```

The builder **throws** on any id or text clash with the four prior sealed sets or either development
set, and on any duplicate inside itself.

## 4 — offline suites (no network, no database)

```bash
npm run test:l32e-syntactic-role       #  82 passed, 0 failed
npm run test:l32d-clarification-scope  #  71 passed, 0 failed
npm run test:l32c-gate-polarity        #  86 passed, 0 failed
npm run test:l32b-binder-precision     # 105 passed, 0 failed
npm run test:l32-semantic-contract     # 183 passed, 0 failed
npm run test:l31-reasoning-contract    #  48 passed, 0 failed
npm run build                          # exit 0
```

## 5 — development fixtures (tuning artifact only)

```bash
SET=src/safescope-v2/reasoning-l3/eval/development-l32e.json OUT=$P/results/dev-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/dev-run-1.json OUT=$P/results/dev-score-1.json npx ts-node scripts/score-l32e-reasoning.ts
# expect 20/20 hazards, 0 HC misses, clarification precision and recall both 100%,
# all 10 syntactic-role and all 8 observation-availability fixtures correct
```

## 6 — the sealed holdout, run and scored at three tiers

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32e.json OUT=$P/results/holdout-run-1.json \
  npx ts-node scripts/run-l32-reasoning.ts
RUN=$P/results/holdout-run-1.json OUT=$P/results/holdout-score-1.json \
  npx ts-node scripts/score-l32e-reasoning.ts
```

Read `tiers`, `byProvenance`, `clarificationMatrix`, `highConsequenceReport`, `syntacticRoleReport`,
`observationAvailabilityReport` and `perFamilyRecall` together. The three provenance classes must not
be merged: `TARGETED_FAMILY_COMPLEMENT` is coverage evidence, not generalization evidence.

## 7 — reproducibility

```bash
SET=src/safescope-v2/reasoning-l3/eval/holdout-l32e.json OUT=$P/results/holdout-run-2.json \
  npx ts-node scripts/run-l32-reasoning.ts
A=$P/results/holdout-run-1.json B=$P/results/holdout-run-2.json \
  OUT=$P/results/reproducibility.json npx ts-node scripts/compare-l32b-reproducibility.ts
# expect 84 of 84 (100%)
```

## 8 — old checks vs new checks, and the DISC classification

```bash
OUT=$P/rootcause/check-behaviour-diff.json npx ts-node scripts/diff-l32e-check-behaviour.ts
```

Reimplements the retired presence-based rules verbatim and runs them beside the role-aware ones, so
`IMPROVED_BY_L3_2E` / `UNCHANGED_PRE_EXISTING_GAP` / `REGRESSED_BY_L3_2E` is measured rather than
asserted. This is what proved `E-FLD-147` is **not** an L3-2e regression and that `E-FAM-04` is a
pre-existing gap L3-2e failed to close.

## 9 — regression evidence on the RETIRED sealed sets

> Regression evidence only. None can establish L3-2e advancement. Run these one at a time; the full
> sweep exceeds a ten-minute shell timeout.

```bash
for S in l32b l32c l32d; do
  SET=src/safescope-v2/reasoning-l3/eval/holdout-$S.json \
    OUT=$P/results/REGRESSION-EVIDENCE-holdout-$S-run.json npx ts-node scripts/run-l32-reasoning.ts
  RUN=$P/results/REGRESSION-EVIDENCE-holdout-$S-run.json \
    OUT=$P/results/REGRESSION-EVIDENCE-holdout-$S-score.json npx ts-node scripts/score-l32e-reasoning.ts
done
# L3-2b 62/62, 0 HC misses, clarification 100/100
# L3-2c 53/54 (was 47 at L3-2c, 49 at L3-2d) -- the clearest measure of the E1 repair
# L3-2d 55/56 with D-NG-04 deleted at the binder -- the recorded scope contradiction
```

## 10 — customer-authority invariance and L3_COMPARE

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

createdb -T test_hazlenz_capability_prodshape_20260822 test_l32e_invariance_20260823
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32e_invariance_20260823"
psql "$DATABASE_URL" -Atc "select current_database()"    # verify the resolved target BEFORE running
M=$R/verification/hazlenz-capability-acceptance-2026-08-22/contracts/hazlenz-acceptance-matrix.json
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-a.jsonl)
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-b.jsonl)
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts $M out/before.jsonl)
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts \
   $R/backend/src/safescope-v2/reasoning-l3/eval/holdout-l32e.json out/level1-holdout-l32e.jsonl)

cd $R/backend
VOL_A=$W/after/backend/out/after-a.jsonl VOL_B=$W/after/backend/out/after-b.jsonl \
BEFORE=$W/before/backend/out/before.jsonl AFTER=$W/after/backend/out/after-a.jsonl \
OUT=$P/results/customer-authority-invariance.json npx ts-node scripts/compare-l32-customer-invariance.ts
# expect scenariosWithNonVolatileDifference: 0 and CUSTOMER_AUTHORITY_UNCHANGED

LEVEL1=$W/before/backend/out/level1-holdout-l32e.jsonl LEVEL3=$P/results/holdout-run-1.json \
HOLDOUT=src/safescope-v2/reasoning-l3/eval/holdout-l32e.json OUT=$P/results/l3-compare.json \
  npx ts-node scripts/compare-l32-level1-level3.ts
```

Volatility is **derived, never declared** — `DO_NOT_REDISCOVER`, from L3-1.

## 11 — regression

```bash
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32e_invariance_20260823"
npm run test:hazlenz-core               # 28/30 — the two documented failures only
npm run test:kg4a-cutover-contract      # 146/146
npm run test:kg4a-default-off           #  51/51
npm run test:kg4b-shadow-contract       # 123/123
npm run test:kg3f-56-14132-predicate    #  16/16
npm run test:kg3f-retrieval-determinism # 170/170
npm run test:evidence-foundation        #  35 assertions
```

`test:standards-backing-contract` and `test:kg4b-default-off` are prerequisite-dependent and were
executed from **both** checkouts; they fail identically from pristine HEAD.

## Database safety

The resolved target was printed and verified before every mutable command. `safescope`,
`sentinel_dev` and `sentinel_safety` were never a target; both clean checkouts had `.env` removed so
the ambient `backend/.env` (which points `DATABASE_URL` at the protected `safescope` database) could
not be picked up. `test_hazlenz_capability_prodshape_20260822` was used only as a `createdb -T`
template and never written. One disposable database was created: `test_l32e_invariance_20260823`.

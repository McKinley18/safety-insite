# L3-2g — reproduction commands

```bash
R=/Users/mckinley/Desktop/Safety_InSite
P=$R/verification/hazlenz-l3-2g-state-separation-2026-08-23
cd $R/backend
```

Baseline: HEAD `1feda622dbb93d7e05d156838ab37db3e21db507`, branch
`release/insite-rc-2026-08-18`, upstream at the same SHA.

## 1 — binder residual, before and after

The unpatched variant is built as a SEPARATE FILE in the scratchpad and copied in and out.
**Do not use `git stash` for this** — `reasoning-l3` is untracked, so `git stash push <file>` is a
no-op on it and a following `git stash pop` will apply an unrelated pre-existing stash entry to the
working tree.

```bash
SP=$(mktemp -d); S=src/safescope-v2/reasoning-l3/semantic-evidence-binding.ts
cp $S $SP/PATCHED.bak
sed "s/^  'fixed', 'destroyed', 'reset', 'addressed', 'closed out', 'resolved', 'restored',$/  '__NONE__',/" \
  $S > $SP/UNPATCHED.ts

cp $SP/UNPATCHED.ts $S
OUT=$P/rootcause/binder-residual-pre-patch.json  npx ts-node scripts/prove-l32g-binder-residual.ts
cp $SP/PATCHED.bak $S
OUT=$P/rootcause/binder-residual-post-patch.json npx ts-node scripts/prove-l32g-binder-residual.ts
diff -q $S $SP/PATCHED.bak   # working file must equal the patched version
```

Expect: **pre 20/30 holding**, **post 26/30** with `unexplainedDeviations: []`.

## 2 — the state-separation ablation

Requires Ollama serving `qwen3-coder:30b`, digest `06c1097efce0…`:

```bash
curl -s http://127.0.0.1:11434/api/tags | grep -o '06c1097efce0[a-f0-9]*'
```

```bash
# 4 variants x 24 scenarios = 96 calls
OUT=$P/rootcause/ablation-run-1.json npx ts-node scripts/ablate-l32g-state-separation.ts

# matched one-block perturbation + the noise floor: 2 variants x 24 = 48 calls
ONLY=V_S_STRUCT_MOVE1,V_S_STRUCT_REPEAT \
OUT=$P/rootcause/ablation-run-2.json npx ts-node scripts/ablate-l32g-state-separation.ts
```

`V_S_STRUCT_REPEAT` is a byte-identical prompt to `V_S_STRUCT` and exists solely to measure the
noise floor. `V_S_STRUCT_MOVE1` moves ONE fact block, which is the size-matched counterpart of
§36.7's manipulation — without it the order comparison is an artefact of perturbation size.

## 3 — scoring

```bash
IN1=$P/rootcause/ablation-run-1.json IN2=$P/rootcause/ablation-run-2.json \
  OUT=$P/results/resolution-ablation.json npx ts-node scripts/rederive-l32g-resolution.ts

IN1=$P/rootcause/ablation-run-1.json IN2=$P/rootcause/ablation-run-2.json \
  OUT=$P/results/order-sensitivity.json npx ts-node scripts/score-l32g-order-sensitivity.ts

IN1=$P/rootcause/ablation-run-1.json IN2=$P/rootcause/ablation-run-2.json \
  OUT=$P/results/fact-coherence.json npx ts-node scripts/score-l32g-fact-coherence.ts
```

`rederive-l32g-resolution.ts` performs **no inference** — it re-resolves the frozen facts under three
rule orderings, so provider variance is zero by construction.

Expect: noise floor **0/24** both tiers; ladder A-vs-B **1/24**; structural one-block **3/24**;
`R1_MISSING_FIRST` on `V_S_STRUCT` → HC 12/12, false ACTIVE 0/7, clarification precision 100%,
recall 75%; control-reading correctness **23/24**.

## 4 — multi-hazard scorer correction

The frozen holdout is NOT edited. Verify first, then re-score L3-2f's **recorded** run:

```bash
shasum -a 256 src/safescope-v2/reasoning-l3/eval/holdout-l32f.json
# 47f92dae5f9fcbcb87c5c6f08fb4cbee3deb9dfba6a18a545d6ea844446bb2c5

RUN=$R/verification/hazlenz-l3-2f-predicate-scope-2026-08-23/results/holdout-run-1.json \
OUT=$P/results/l32f-rescore-multihazard.json npx ts-node scripts/score-l32f-reasoning.ts
```

Expect `multiHazardWithinTolerance: "1 of 1"` at all three tiers, and a full diff against L3-2f's
`holdout-score-1.json` changing **exactly six keys**, all of them that one.

## 5 — independent evidence source survey

Reads metadata, ids, families and hashes only. Prints no observation text, runs no inference.

```bash
OUT=$P/evidence-plan/source-survey.json npx ts-node scripts/survey-l32g-evidence-sources.ts
```

## 6 — offline suites

```bash
for s in l31-reasoning-contract l32-semantic-contract l32b-binder-precision l32c-gate-polarity \
         l32d-clarification-scope l32e-syntactic-role l32f-predicate-scope l32g-state-separation; do
  npx ts-node scripts/test-$s.ts
done
```

Expect 48 · 189 · 105 · 86 · 71 · 82 · 77 · 57 = **715 assertions, 0 failed**.

## 7 — regression

```bash
npm run test:hazlenz-core            # 206 pass / 2 fail — the two §13.1 failures ONLY, no third
npm run test:kg4a-cutover-contract   # 146/146
npm run test:kg4a-default-off        # 51/51
npm run test:kg4b-shadow-contract    # 123/123
npm run test:kg3f-56-14132-predicate # 16/16
npm run test:kg3f-retrieval-determinism # 170/170
npm run test:evidence-foundation     # 35 assertions
```

## 8 — customer-authority invariance

**Disposable database only.** Verify the resolved target before executing, and never point this at
`safescope`.

```bash
W=$(mktemp -d); mkdir -p $W/before $W/after
git -C $R archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/before
git -C $R archive 1feda622dbb93d7e05d156838ab37db3e21db507 | tar -x -C $W/after
cp -R $R/backend/src/safescope-v2/reasoning-l3 $W/after/backend/src/safescope-v2/
cp $R/backend/scripts/*l32*.ts $W/after/backend/scripts/
cp $R/backend/package.json $W/after/backend/package.json
for d in before after; do
  ln -s $R/backend/node_modules $W/$d/backend/node_modules
  cp $R/verification/hazlenz-capability-acceptance-2026-08-22/harness/hazlenz-capability-runner.ts $W/$d/backend/scripts/
  mkdir -p $W/$d/backend/out; rm -f $W/$d/backend/.env $W/$d/.env
done
diff -rq $W/before/backend/src $W/after/backend/src   # ONLY the added reasoning-l3 directory

createdb -T test_hazlenz_capability_prodshape_20260822 test_l32g_invariance_20260823
export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_l32g_invariance_20260823"
psql "$DATABASE_URL" -Atc "select current_database()"   # VERIFY BEFORE RUNNING — must not be safescope

M=$R/verification/hazlenz-capability-acceptance-2026-08-22/contracts/hazlenz-acceptance-matrix.json
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-a.jsonl)
(cd $W/after/backend  && npx ts-node scripts/hazlenz-capability-runner.ts $M out/after-b.jsonl)
(cd $W/before/backend && npx ts-node scripts/hazlenz-capability-runner.ts $M out/before.jsonl)

cd $R/backend
VOL_A=$W/after/backend/out/after-a.jsonl VOL_B=$W/after/backend/out/after-b.jsonl \
BEFORE=$W/before/backend/out/before.jsonl AFTER=$W/after/backend/out/after-a.jsonl \
OUT=$P/results/customer-authority-invariance.json \
  npx ts-node scripts/compare-l32-customer-invariance.ts

dropdb test_l32g_invariance_20260823; rm -rf $W
```

Volatility is **derived, never declared** — `DO_NOT_REDISCOVER`, from L3-1. Expect 7 volatile paths,
6 volatile field roles, `scenariosWithNonVolatileDifference: 0`, verdict
`CUSTOMER_AUTHORITY_UNCHANGED`.

## 9 — the recommended next experiment (NOT run by this phase)

With one hosted-provider credential available, point the provider config at the second model and
re-run **step 2 unchanged**:

```bash
ONLY=V_S_STRUCT,V_S_STRUCT_MOVE1 OUT=$P/rootcause/ablation-provider-2.json \
  npx ts-node scripts/ablate-l32g-state-separation.ts
IN1=$P/rootcause/ablation-provider-2.json OUT=$P/results/fact-coherence-provider-2.json \
  npx ts-node scripts/score-l32g-fact-coherence.ts
```

48 calls. Materially lower fact-level incoherence and order sensitivity → terminal **B**. The same
instability → terminal **C**.

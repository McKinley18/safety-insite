# L3-2b evidence package — index

> ## `L3_2B_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

| # | Document | What it settles |
|---|---|---|
| 1 | `STATUS.md` | the verdict, all three tiers, every gate, and why it closes PARTIAL |
| 2 | `ROOT_CAUSE.md` | each defect reproduced through every pipeline stage, before any patch |
| 3 | `NEXT_ACTION.md` | the three remaining blockers, their fixtures, and the exact next step |
| 4 | `REPRODUCTION_COMMANDS.md` | how to re-run everything, including database safety |
| 5 | `HOLDOUT_FREEZE.txt` | the sealed-holdout hash, recorded before its first execution |
| 6 | `phase1-preservation.txt` / `FINAL_STATE.txt` | repository and protected-work preservation, entry and exit |

## Contracts

| File | Note |
|---|---|
| `contracts/holdout-l32b.json` | 81 scenarios, sha256 `e3a3c7ee…`, frozen before use, **now opened and retired for gate use** |
| `contracts/development-l32.json` | 30 scenarios used for tuning — **not** advancement evidence |

## Results

| File | Note |
|---|---|
| `rootcause/pipeline-traces.json` | per-stage traces for B08, C11, B10, D02, A10 |
| `results/holdout-run-1.json` · `holdout-score-1.json` | the gate run and its three-tier score |
| `results/holdout-run-2.json` | second run, for reproducibility only |
| `results/reproducibility.json` | 81/81, with the comparison contract stated |
| `results/dev-run-{1,2,3}.json` · `dev-score-{1,2,3}.json` | the three development iterations, kept so the tuning path is visible |
| `results/customer-authority-invariance.json` | 0 non-volatile differences over 66 |
| `results/l3-compare.json` | Level-1 vs Level-3 on the fresh holdout |
| `results/regression/` | every suite's raw output, including the two pristine-HEAD comparisons |

## The one-line finding

Every L3-2 defect was repaired and the repairs hold: **0 false ACTIVE on 19 non-active scenarios,
0 fabricated quotations in 75, 100% reproducibility.** One high-consequence miss remains — caused by
a closed vocabulary list lacking the word "sheared" — and it was **not** fixed after the seal was
broken.

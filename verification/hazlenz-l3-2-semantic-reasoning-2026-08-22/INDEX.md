# L3-2 evidence package — index

> ## `L3_2_PARTIAL — SEMANTIC_REASONING_NOT_VALIDATED_FOR_ADVANCEMENT`
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Read in this order.

| # | Document | What it settles |
|---|---|---|
| 1 | `STATUS.md` | the verdict, every gate and threshold, and why the phase closes PARTIAL |
| 2 | `PROVIDER_SELECTION.md` | which provider, why, and why the production choice stays open |
| 3 | `ARCHITECTURE_DECISIONS.md` | one-call-vs-two, offset binding, the four-stage sequence, clause scoping |
| 4 | `DATA_BOUNDARY.md` | what leaves the application boundary, proven field by field |
| 5 | `NEXT_ACTION.md` | unresolved limitations, the specified remediation, and the exact next step |
| 6 | `REPRODUCTION_COMMANDS.md` | how to re-run everything, including database safety |
| 7 | `HOLDOUT_FREEZE.txt` | the holdout hash, recorded before the first inference run |
| 8 | `phase1-baseline.txt` / `FINAL_STATE.txt` | repository and protected-work preservation, entry and exit |

## Contracts

| File | Note |
|---|---|
| `contracts/holdout-l32.json` | 66 scenarios, sha256 `41ae3c22…`, frozen before use, **now retired for gate purposes** |
| `contracts/development-l32.json` | 15 scenarios authored by this phase for tuning — **not** an advancement gate |

## Results

| File | Note |
|---|---|
| `results/holdout-run-1.json` | the gate run |
| `results/holdout-run-2.json` | second seeded run — determinism check plus pre-semantic diagnostic capture |
| `results/holdout-score-1.json` | scored gate result |
| `results/dev-run-{1,2}.json`, `results/dev-score-{1,2}.json` | development runs before and after the clause-scope fix |
| `results/customer-authority-invariance.json` | 0 non-volatile differences over 66 scenarios |
| `results/l3-compare.json` | `L3_COMPARE` — Level-1 vs Level-3, adjudicated against frozen expectations |
| `results/operational-measurements.json` | 162 analyses: latency, tokens, failure and acceptance rates |
| `results/egress-inventory.json` | field-level record of what actually left the application boundary |
| `results/regression/` | every regression suite's raw output, including the two pristine-HEAD comparisons |

## The one-line finding

The model met every quality threshold — **32 of 32 hazards, zero high-consequence misses, 153
quotations with none fabricated.** The **semantic evidence binder built by this phase** rejected two
correct findings, so the shipped pipeline missed one high-consequence hazard and the hard gate fails.
It was **not** tuned after the holdout was opened.

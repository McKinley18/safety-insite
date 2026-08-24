# L3-2f — evidence index

| file | what it establishes |
|---|---|
| `STATUS.md` | the terminal state and what closed |
| `ROOT_CAUSE.md` | F1–F6 proven against **unpatched** L3-2e code, before any edit |
| `FINAL_STATE.txt` | the advancement gate, item by item, pass/fail |
| `NEXT_ACTION.md` | the remaining defects, root-caused and deliberately unapplied |
| `REPRODUCTION_COMMANDS.md` | every command, with the `cd` trap and the database-safety protocol |
| `HOLDOUT_FREEZE.txt` | sixth sealed set: sha256, selection rule, freeze time, prior hashes |
| `preservation-pre.txt` / `preservation-evidence.txt` | repository state before and after |
| `SECURITY_AND_BOUNDARY.txt` | dependencies, egress, credentials, production boundary |
| `contracts/holdout-l32f.frozen.json` | the frozen copy the shipped set is byte-compared against |

## Root cause

| file | what it proves |
|---|---|
| `rootcause/f1-f4-proof-pre-patch.json` | F1–F4 reproduce on unpatched code; every paired counter-fixture correct |
| `rootcause/f1-f4-proof-post-patch.json` | all four closed; every counter-fixture still correct |
| `rootcause/f5-f6-ablation-set.json` + `-run.json` | `E-OA-07` is not `msha` wording and not clause position alone; `E-FLD-147` reproduces on tape, sign and toolbox talk |
| `rootcause/f5-confirm-set.json` + `-run.json` | making the absence explicit recovers ACTIVE in the same position and regime |
| `rootcause/stability-set.json` + `stability-run{,-2}.json` | the provider is deterministic 3/3, so the development deltas are effects, not variance |

## Results

| file | what it measures |
|---|---|
| `results/holdout-run-1.json` / `-run-2.json` | the sealed set, twice |
| `results/holdout-score-1.json` | three tiers, provenance split, clarification matrix, high-consequence report, predicate-scope, control-adequacy, observation-availability, family coverage |
| `results/reproducibility.json` | 97 of 97 |
| `results/family-coverage.json` | all 24 contract families, cumulative — 24 SEALED_PASS |
| `results/l3-compare.json` | Level-3 versus Level-1 on the same 97 scenarios |
| `results/customer-authority-invariance.json` | 0 non-volatile differences over 66 |
| `results/dev-run-1.json` | first development measurement — the ranking regression that produced §36.7 |
| `results/dev-run-2.json` / `dev-score-2.json` | **prompt variant A** — 2 HC misses, clarification precision 88.9% |
| `results/dev-run-3.json` / `dev-score-3.json` | **prompt variant B, SHIPPED** — 4 HC misses, precision 100% |
| `results/regression/` | `hazlenz-core` 28/30, KG contracts, both prerequisite suites from both checkouts |

**All three development runs are retained.** `dev-run-2` and `dev-run-3` are the two halves of §36.7
and neither is discarded in favour of the other.

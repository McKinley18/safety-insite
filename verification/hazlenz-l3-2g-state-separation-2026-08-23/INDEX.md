# L3-2g — evidence index

`L3_2G_PARTIAL — STRUCTURAL_STATE_DECISION_INCONCLUSIVE` · `BINDER_RESIDUAL — CLOSED`
Baseline HEAD `1feda622`, unchanged. Blueprint §37. **No sealed set was opened.**

## Read in this order

| file | what it settles |
|---|---|
| `STATUS.md` | the full result, and why terminal **D** rather than A or B |
| `ROOT_CAUSE.md` | the three root causes, each proven before any repair |
| `NEXT_ACTION.md` | the ONE missing experiment, and why it is the only blocker |
| `WEAK_FIXTURE_DISPOSITION.md` | `X-NC-03` / `X-WC-02`, classified without editing them |
| `evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md` | the replacement corpus, characterised but not opened |
| `REPRODUCTION_COMMANDS.md` | every command, including the one that must NOT be used (`git stash`) |
| `FINAL_STATE.txt` | hashes, stash list, database state |
| `SECURITY_AND_BOUNDARY.txt` | containment proof for `state-facts.ts` |

## Root-cause and ablation artifacts

| file | contents |
|---|---|
| `rootcause/binder-residual-pre-patch.json` | **20/30** fixtures holding — ten ambiguous tokens each deleting a correct high-consequence ACTIVE |
| `rootcause/binder-residual-post-patch.json` | **26/30**, `unexplainedDeviations: []` — the four remaining are declared accepted costs |
| `rootcause/ablation-run-1.json` | 4 variants × 24 diagnostic scenarios = 96 runs, 0 errors |
| `rootcause/ablation-run-2.json` | matched one-block perturbation + the byte-identical noise-floor repeat, 48 runs |

## Scored results

| file | headline |
|---|---|
| `results/order-sensitivity.json` | **noise floor 0/24**; ladder 1/24; structural one-block **3/24** |
| `results/resolution-ablation.json` | 3 resolver orderings over **frozen facts**; `R1_MISSING_FIRST` → HC 12/12, false ACTIVE 0/7, precision 100%, recall 75% |
| `results/fact-coherence.json` | control-reading **23/24** correct in isolation; internal incoherence 4–12% |
| `results/customer-authority-invariance.json` | **0 non-volatile differences over 66**, `CUSTOMER_AUTHORITY_UNCHANGED` |
| `results/l32f-rescore-multihazard.json` | multi-hazard **1 of 1** at all tiers; exactly six keys differ from L3-2f's score |
| `results/regression/` | 715 L3 assertions 0 failed; hazlenz-core 206/2 identical to L3-2f; KG contracts unchanged |
| `evidence-plan/source-survey.json` | twelve candidates characterised; overlap computed against 750 opened ids / 538 texts |

## Production code changed by this phase

Two files, both inside `reasoning-l3`, which has **zero importers outside itself**:

* `semantic-evidence-binding.ts` — `UNAMBIGUOUS_CORRECTION` partitions the rejection vocabulary.
  This is the only change with any behavioural effect on the L3 pipeline.
* `state-facts.ts` — **NEW**, `ARCHITECTURE_SELECTION_EVIDENCE_ONLY`, imported by the L3-2g scripts
  and by nothing else. Not referenced by the shipped prompt or runner.

Harness only: `score-l32f-reasoning.ts` (reads both decomposition keys). `package.json` gains two
script lines; dependencies and `package-lock.json` byte-identical to HEAD.

## The one-line summary

Structural separation **fixed the axis that blocks L3-3** — `F-WC-09` recovered, high-consequence
12/12 under every variant — and **did not fix** the axis the entry contract required held: order
sensitivity relocated onto clarification rather than disappearing. The contract is exonerated with
direct evidence; the provider is indicated but cannot be convicted on one model.

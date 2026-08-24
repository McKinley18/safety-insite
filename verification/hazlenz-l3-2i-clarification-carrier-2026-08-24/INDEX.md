# L3-2i — evidence index

`L3_2I_COMPLETE — CANDIDATE_INDEPENDENT_CLARIFICATION_ESTABLISHED — SCENARIO_LEVEL_CLARIFICATION_SCORER_CORRECTED`
Baseline HEAD `1feda622`, unchanged. Blueprint **§40**; decision log **`D-57`**, **`D-58`**.
**No sealed set opened. Shipped prompt byte-unchanged. Nothing committed or pushed.**

## Read in this order

| file | what it settles |
|---|---|
| `STATUS.md` | the full result — the two defects, the two corrections this phase made to its own first answer, the nine gates |
| `NEXT_ACTION.md` | why the shipped pipeline still cannot produce a carrier, and the ordered next phase |
| `PRESERVATION_AND_EGRESS.txt` | preservation, containment at the documented seam, credential and egress audit |
| `rootcause/` | the corrected scorer over the **frozen** L3-2h artifacts, zero new inference |
| `results/` | the targeted proof, four separate processes, plus the scenario-level scoring of its rows |

## Root-cause artifacts — the corrected baseline, ZERO new inference

| file | headline |
|---|---|
| `rootcause/frozen-rescore-qwen.json` | `D-56` reproduced **exactly**: `R1_MISSING_FIRST`/`V_S_STRUCT` **3/4 = 75%** candidate-conditioned, **3/5 = 60%** scenario-level, zero-candidate miss `B10`. **0 pre-existing keys changed** |
| `rootcause/frozen-rescore-gemini.json` | scenario-level **3/5, 5/5, 4/5** against candidate-conditioned 3/3, 5/5, 4/4 — reproduces §39.5.2's independent recount. **0 pre-existing keys changed** |

Both carry `metricDefinitions`, so the two denominators travel with every artifact and cannot be
conflated later (`D-58`).

## Proof artifacts — four variants, FOUR PROCESSES (§38.3)

| file | contents |
|---|---|
| `results/proof-qwen-V_BASELINE_NO_CARRIER.json` | **the BEFORE.** Shipped prompt, shipped schema, carrier absent. Without it, "no regression" would be an assertion rather than a measurement (`D-54`) |
| `results/proof-qwen-V_CARRIER.json` | declaration appended — `B10` returns **0 candidates** and the clarification is carried and validated |
| `results/proof-qwen-V_CARRIER_MOVE1.json` | the same declaration moved — position control; `F-CL-01` **and** `B10` both zero-candidate and both carried |
| `results/proof-qwen-V_CARRIER_REPEAT.json` | byte-identical to `V_CARRIER`, its own process — the noise floor |
| `results/scenario-score-*.json` | the corrected scorer over those rows: BASELINE **0/2 = 0%**, every carrier variant **2/2 = 100%** |

Each proof artifact records its own `pid`, the shipped-prompt sha256, the locked-harness sha256, and
a per-scenario byte-match against the locked harness's own scenario text.

## What the reader must not take from the wrong place

1. **The carrier works; the SHIPPED PIPELINE does not yet use it.** `L3_SYSTEM_PROMPT` is
   byte-unchanged (`b8cc50fc…`, `L3_PROMPT_VERSION` still `v6`), so the model is never told the field
   exists outside this phase's proof harness. That is deliberate — see `STATUS.md` §6 — and it is the
   first item of the next phase.
2. **The provider axis is n = 1.** Only `qwen3-coder:30b` ran. `GEMINI_API_KEY` was not present in
   this session.
3. **`D-56`'s 75% is not wrong, it is narrower than it looked.** Both denominators are real metrics
   and both are reported. `D-58` exists so they are never renamed into each other.

## Production code changed by this phase

Seven files, all under `backend/src/safescope-v2/reasoning-l3` or `backend/scripts`, **none on the
customer path**: the contract types (the new optional field), the validated types, the validation
reason codes, the deterministic validator, the semantic binder (one local list replaced by the shared
constant, identical values), `reasoning-prompt.ts` **in `bindProposal` only**, and the `D-56` scorer.

`ablate-l32g-state-separation.ts` (`73f74131…`), `score-l32g-order-sensitivity.ts` and
`score-l32g-fact-coherence.ts` are **byte-unchanged**.

## The one-line summary

The question can now travel without a hazard to ride on, and the metric can now see when it does not —
proven where it mattered, on the two scenarios that lost it, with the shipped prompt deliberately left
alone so the locked instrument that measured the loss still measures the same thing.

# L3-2j item (4) — cross-provider closure on the shipped v6 ladder — evidence index

Blueprint **§42**. Decision log **`D-62`** (additive; `D-55`…`D-61` preserved).
Baseline HEAD `1feda622`. **No production file, script file or scorer file was modified.**

## Read first

| file | what it carries |
|---|---|
| `STATUS.md` | the full result: method, both `D-58` denominators, the A/B/C/D transfer analysis, decision dispositions, fidelity deviations, 11 acceptance gates |
| `NEXT_ACTION.md` | what is closed, why L3-3 is still not eligible, and the recommended next phase (**not executed**) |
| `CREDENTIAL_AND_EGRESS.txt` | the passing credential gate by presence only, the authorized-model proof, and the itemised 147-request egress account |
| `preservation-pre.txt` / `PRESERVATION_POST.txt` | HEAD, branch, upstream, 23 tag objects, 4 stash entries, the locked instrument, the shipped prompt and schema, all 19 `reasoning-l3` modules, the sealed corpus, and every file of the frozen L3-2g/h/i/j packages — before and after |

## Measurement — the shipped v6 ladder

| file | what it is |
|---|---|
| `results/shipped-gemini-V_PRE_ACTIVATION.json` | **the Gemini measurement.** Shipped prompt `b8cc50fc`, shipped schema `a522cf5a`, 24 scenarios, own process |
| `results/shipped-gemini-V_PRE_ACTIVATION_REPEAT.json` | the same variant again in its **own process** — §38.3's noise floor |
| `results/noisefloor-gemini-shipped-pipeline.json` | that floor, field by field: **4 of 168, 2 of 24 scenarios**, both `NEGATIVE_CONTROL` |
| `results/DENOMINATORS.json` | **`D-58` both denominators**, qwen and Gemini side by side, byte-unmodified scorer, neither metric renamed |
| `results/DENOMINATORS-qwen-restored-v6.json` | the restored-v6 **qwen** baseline re-scored from frozen artifacts with **zero new inference** — two qwen processes agreeing exactly |
| `results/compare-shipped-qwen-vs-gemini.json` | cross-provider row diff in the shipped pipeline — **11 of 24** scenarios |

## The shipped ladder through the LOCKED instrument

| file | what it is |
|---|---|
| `results/locked-gemini-V_B_LADDER.json` | the shipped ladder, second instrument, harness `73f74131…` byte-unmodified |
| `results/locked-gemini-V_A_LADDER.json` | §36.7's variant A — **order sensitivity**, one block moved |
| `results/locked-gemini-V_B_LADDER_REPEAT.json` | `V_B_LADDER` again in its own process |
| `results/noisefloor-gemini-locked-ladder.json` | the ladder floor **in the same instrument**: **0 of 168, 0 of 24** |
| `results/gemini-order-sensitivity-shipped-ladder.json` | the locked scorer's output. `V_B_LADDER vs V_A_LADDER` = **0/24**. Its `noiseFloor` block reports `scenarios: 0` — a **NON-COMPARISON**, not a zero (§39.3), because `V_S_STRUCT_REPEAT` was not run |
| `results/qwen-l32g-ladder-order-sensitivity-rescored.json` | qwen's ladder order sensitivity, **1/24** on `C-CS-05`, re-scored from the frozen L3-2g artifact with zero new inference |
| `results/compare-locked-V_B_LADDER-qwen-vs-gemini.json` | cross-provider row diff in the locked instrument — **10 of 24** |
| `results/locked-gemini-merged.json` | the four locked-harness variants concatenated verbatim, the only marshalling done (the scorers accept at most two inputs) |

## The MODEL-DRIFT CONTROL — `MUST_REVERIFY` discharged

A preview label is not a content digest (§39.9 item 5), so `V_S_STRUCT` was re-run today and scored
with the same byte-unmodified scorers as L3-2h.

| file | what it is |
|---|---|
| `rootcause/driftcontrol-gemini-V_S_STRUCT.json` | today's structural run |
| `rootcause/driftcontrol-vs-frozen-l32h-gemini.json` | row diff against the frozen L3-2h Gemini rows — **2 of 24**, one of which is L3-2h's own 1/24 floor scenario |
| `rootcause/gemini-fact-coherence-drift-control.json` | `CONDITIONAL_AND_ASSERTED` **0**, incoherence **4.2%**, control-reading **5/6** miss `F-COR-01` — L3-2h recorded 0, 4.3%, 5/6, `F-COR-01` |
| `rootcause/gemini-resolution-drift-control.json` | HC **12/12** on all three resolver orderings, false ACTIVE **0/7**, clarification 100/100. **Its ladder rows read 0/5 scenario-level — that is a SCORER-BOUNDARY ARTIFACT, not a measurement** (`STATUS.md` §3.1) |

## Transport and adapter

`transport/*.jsonl` — per-call status, latency, token and finish-reason accounting for all six runs.
**145 shim-logged requests, 144 × HTTP 200, 1 × 503 retried to 200, `finishReason: STOP` on every
one, zero truncation, zero harness errors.** No credential, no prompt text, no scenario text.

`adapter/gemini-ollama-shim.js` — the L3-2h transport shim, reused **byte-unmodified** (`0ba265bb…`).
`adapter/run-l32j-item4.sh` + `run-l32j-item4-floor.sh` — six variants, **six separate processes**,
shim restarted between each. `adapter/score-all.sh` — the byte-unmodified locked scorers.
`adapter/diff-ladder-runs.py`, `adapter/diff-ablate-runs.py` — the field-by-field comparisons, with
their compared-field sets stated in the source rather than inferred.

## Regression

`regression/` — all 10 L3 offline suites (**814 assertions, 0 failed**, identical to §41.8 suite for
suite), six KG contract suites, `hazlenz-core` (**206 pass / 2 fail**, the two documented §13.1
failures only), and both `tsc --noEmit` runs (exit 0).

## What is NOT here, deliberately

**No new holdout. No sealed corpus opened. No scorer patched. No prompt or schema edit. No qwen
inference. Zero local calls.**

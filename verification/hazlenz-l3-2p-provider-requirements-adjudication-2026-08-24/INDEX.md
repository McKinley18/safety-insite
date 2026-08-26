# L3-2p — evidence index

`PROVIDER_REQUIREMENTS_REFINED — SAFETY_OUTCOME_REQUIREMENTS_PRESERVED`
blueprint **§48** · decisions **`D-73`**, **`D-74`**, **`D-75`** · HEAD `a7b21a26` ·
**zero inference · zero API cost · no sealed corpus opened**

| file | what it is |
|---|---|
| `STATUS.md` | the adjudication: what `P-02` and `P-08` were for, the two instrumentation findings, the rejection-severity taxonomy, model-variance vs safety-variance row by row, the `P02-C`/`P08-B` decisions, the exact `P-02R`/`P-08R` text, the twelve-invariant audit, the five-provider counterfactual, and the product interpretation |
| `NEXT_ACTION.md` | what is settled, the one remaining open axis (clarification precision — a product decision), and the five routes forward |
| `analysis/adjudicate.js` | the derivation. Reads **only** frozen run artifacts; calls no provider; writes into no prior evidence package. Re-runnable at zero cost |
| `analysis/ADJUDICATION_DATA.json` | its output: per-provider severity split, safety axes, and reproducibility under all three comparison keys |
| `regression/` | the unchanged-code proof: 15 suites, 1,085 assertions, 0 failed, `tsc` clean |
| `PRESERVATION_AND_EGRESS.txt` | HEAD, upstream, tags, stashes, module and instrument digests, sealed-corpus hashes, credential audit, and the measured zero-egress record |

**Adjudication only. Nothing implemented. No production file, prompt, schema, validator, binder,
scorer or harness byte changed. No provider called. No credential read. No historical provider result
rewritten. `P-02` and `P-08` remain in `PROVIDER_REQUIREMENTS.md` verbatim; `P-02R`/`P-08R` are
appended as superseding criteria.**

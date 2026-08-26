# L3 RUN-2 FINAL SINGLE-USE SEALED ACCEPTANCE — INDEX

`L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9` · `SCORABLE = TRUE` · `MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL`
`RUN2_HOLDOUT_SPENT = TRUE` · `GAUNTLET_OFFSET_1 = RETIRED` · `REALISM_OFFSET_0 = RETIRED` · 186 calls · `$5.666386`

| path | what it is |
|---|---|
| `STATUS.md` | the phase record: the run, the gates, why it is valid where Run 1 was not, cost, preservation, and what the result does and does not license |
| `NEXT_ACTION.md` | what is now decidable, what is not, and what is explicitly forbidden |
| `PACKAGE_MANIFEST.txt` | `sha256  relative-path` for every file in this package |
| **`declaration/PRE_EXECUTION_GATE_DECLARATION.txt`** | **written and frozen BEFORE any observation was opened.** `eec48a5d…`, read-only, never rewritten |
| **`declaration/ACCEPTANCE_CONTRACT.json`** | **every gate, denominator, threshold, predicate and terminal rule, enumerated and hashed pre-exposure.** `9d94efb6…` (canonical `f02a812b…`) |
| `declaration/enumerate-acceptance-contract.js` | the derivation — reads truth metadata only, opens no observation value |
| `declaration/SEALED_EXECUTION_RECORD.txt` | append-only identity binding: HEAD, both bound identities, every frozen stage, both predicates, 93/186, initial `RUN2_HOLDOUT_SPENT = FALSE`. `796d84a9…` |
| **`spend/SPEND_TRANSITION.jsonl`** | **the irreversible record.** `HOLDOUT_SPEND_INITIATED` then `HOLDOUT_SPENT` with both offsets `RETIRED`, per process. `5ee3b36e…` |
| `results/raw-process-A.json` | process A raw evidence, **read-only**. `b666da3c…` |
| `results/raw-process-B.json` | process B raw evidence, **read-only**. `514b6c2e…` |
| `results/freeze-raw-results.js` + `RAW_RESULT_FREEZE.txt` + `RAW_RESULT_SUMMARY.json` | Phase 11 — everything hashed and tallied **before** scoring; validator, binder, retry, model-identity and D-K state |
| `transport/transport-A.jsonl` · `transport-B.jsonl` | the frozen shim's own per-call log: status, latency, attempt, stopReason, respondedModel, tokens. `fa2741f6…` · `aadb88fa…` |
| `scoring/score-run2-acceptance.js` | the scoring driver — asserts three digests, projects the ten frozen fields verbatim, calls the frozen v2 wrapper. Reimplements nothing |
| **`scoring/ACCEPTANCE_SCORE.json`** | **the frozen scorer's own return value, unaltered.** Durable identity **`SCORE_BODY_DIGEST = 435f8314…`** — the file hash varies with the `scoredAt` clock and is NOT the identity of the result |
| `scoring/prove-score-determinism.js` + `SCORE_DETERMINISM.txt` | proves the scorer is a pure function: **three independent runs, identical body digest**, identical terminal/gates/raw digests. Also discloses the manifest-then-rescore ordering error and the defect in the proof's own first revision |
| `scoring/TERMINAL_CLASSIFICATION.txt` | the terminal, the Run-1 comparison, the G1–G10 table, by-provenance, and what it does not mean. `7af026e2…` |
| `cost/account-run2-cost.js` + `COST_ACCOUNTING.txt` | 186 calls, 1,121,068 in / 342,425 out, **`$5.666386`** — 0.45% under the `D-97` mean projection. No extra call was made to produce it |
| `preservation/PRESERVATION_PRE.txt` | HEAD, upstream, worktree, staged, 4 stashes, 23 tags, before spend |
| `preservation/prove-post-run.js` + `PRESERVATION_POST.txt` | **55 checks, 55 PASS** — frozen identities, declaration unchanged, pre-declared denominators, no tuning, spend irreversible, prior evidence intact, worktree |

## A note on the freeze

Every evidence output in this package is **read-only on disk**. Re-running a proof script therefore
fails with `EACCES` until the target is unlocked — that is the freeze working, not a broken script.
`preservation/PRESERVATION_POST.txt` regenerates **byte-identically** when unlocked and re-run
(verified). `scoring/SCORE_DETERMINISM.txt` and `scoring/ACCEPTANCE_SCORE.json` embed wall-clock
timestamps and will not, which is exactly why the durable identity of this result is
**`SCORE_BODY_DIGEST = 435f8314…`** and not a file hash.

## Reproduction — scoring and accounting are re-runnable at zero cost

```
node verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/results/freeze-raw-results.js
node verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/scoring/score-run2-acceptance.js \
     verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/results/raw-process-A.json \
     verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/results/raw-process-B.json
node verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/cost/account-run2-cost.js
node verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/preservation/prove-post-run.js
```

**`runner/run-run2-sealed.sh` MUST NOT be re-run.** The corpus is spent and gauntlet offset `1` and
realism offset `0` are permanently retired. Re-running it would transmit a retired corpus and
produce nothing measurable.

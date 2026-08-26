# INDEX — L3 Final Single-Use Sealed Acceptance (2026-08-25)

Terminal: **`L3_ACCEPTANCE_INVALID — PROVIDER_CALLABILITY_FAILURE_AFTER_SPEND`**
**`HOLDOUT_SPENT = TRUE`** · gauntlet offset `0` and realism offset `3` **RETIRED**

| path | what it is |
|---|---|
| `STATUS.md` | the result, the coverage table, why the scorer's output is not the result |
| `NEXT_ACTION.md` | run-2 construction prerequisites and the one decision that belongs to the user |
| `FINAL_STATE.txt` | terminal, state bits, identities, execution totals |
| `declaration/PRE_EXECUTION_GATE_DECLARATION.txt` | **hashed `f54e649a…` before any observation was opened** — G1–G10, denominators, thresholds, invalidity conditions, terminal rules, the nine-field result derivation, and the two parameters the freeze left unstated |
| `preservation/PRESERVATION_PRE.txt` | HEAD, branch, upstream, worktree, staged, 4 stashes, 23 tags — before spend |
| `preservation/FROZEN_IDENTITY_REPROOF_PRE.txt` | 16/16 acceptance components, holdout, scorer, 10 execution-path digests, plan, freeze, 3 protected sources — all recomputed from disk before spend |
| `preservation/INNER_IDENTITY_REDERIVATION.txt` | 4 inner identities re-derived from shipped source; run schema re-serialised through `buildProposalSchema()` |
| `preservation/CREDENTIAL_AND_MODEL_GATE.txt` | presence-only credential gate with a negative control; the no-fallback requirement |
| `preservation/PRESERVATION_POST.txt` | the same facts after the run, plus the permanent spend record and the egress account |
| `execution/SEALED_RUN_EXECUTION_RECORD.txt` | **`26a55c55…`**, append-only, frozen before any row was read |
| `execution/HOLDOUT_OPEN_STRUCTURAL_CHECK.txt` | the holdout opened: 92 rows, 38/29/25, order, and every denominator counted from frozen metadata |
| `runner/run-sealed-acceptance.ts` | the driver — every reasoning stage is the shipped frozen one; asserts holdout, row count, model and schema digests and throws |
| `runner/run-sealed.sh` | two isolated processes (§38.3), each with its own freshly started frozen shim |
| `spend/SPEND_TRANSITION.jsonl` | **the irreversible transition**, written before the first observation left the process |
| `transport/transport-A.jsonl` · `transport-B.jsonl` | 92 + 92 records: statuses, latencies, `respondedModel`, tokens |
| `results/raw-process-A.json` · `raw-process-B.json` | the complete raw result, both tiers recorded, never edited after scoring |
| `results/RAW_RESULT_FREEZE.txt` | **Phase 8** — the raw result frozen and hashed **before** the scorer ran |
| `scoring/score-sealed-acceptance.js` | the scoring driver: asserts digests, projects the nine frozen fields verbatim, calls the frozen scorer |
| `scoring/ACCEPTANCE_SCORE.json` · `.txt` | the frozen scorer's **verbatim** output, unedited |
| `scoring/TERMINAL_CLASSIFICATION.txt` | **Phase 10** — why that output is not the result, in both directions, and the scorer-invalidity gap finding |
| `PACKAGE_MANIFEST.txt` | sha256 of every artifact in this package |

**Not in this package, because it was not done:** any re-run of the spent holdout, any modified gate,
threshold, truth field or scorer, any hand-corrected result, any tuning or remediation, any claim of
partial advancement evidence.

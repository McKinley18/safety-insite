# L3-2n — evidence index

`FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — NO_CURRENT_STABLE_HOSTED_MODEL_MEETS_REQUIREMENTS`
blueprint **§46** · decisions **`D-68`**, **`D-69`** · HEAD `1feda622` · **no sealed corpus opened**

| file | what it is |
|---|---|
| `STATUS.md` | the qualification result, the `P-02` root cause, the two residuals, and the terminal state |
| `NEXT_ACTION.md` | what is settled, the one-line scoreboard, and the three routes forward |
| `provider/OFFICIAL_DOCUMENTATION.md` | **14 provider assertions, each with source URL and 2026-08-24 retrieval date** — free-vs-paid data use, the 55-day window, ZDR and its incompatible features, version semantics, deprecation notice, structured-output keywords, pricing — plus the measured `gemini-2.5-pro` HTTP 404 with its HTTP 200 control |
| `provider/P01_P14_SCORECARD.md` | `P-01`…`P-14` scored **unchanged from `PROVIDER_REQUIREMENTS.md`**, three stable candidates plus the preview for reference |
| `results/F37-*` `F36-*` `P25-*` | **twelve run artifacts, four per model in four separate processes** (§38.3): the 24-scenario shipped cohort, its own-process noise floor, and `D_WC09_LADDER` / `D_CS05_LADDER_B` through the **full binder path** |
| `adapter/` | the L3-2h transport shim **byte-identical at `0ba265bb`**, the runner, and the scorer |
| `transport/*.jsonl` | **153 requests, 102×200, 51×404, zero truncation**, per-call token and latency accounting |
| `PRESERVATION_AND_EGRESS.txt` | HEAD, 23 tag objects, 4 untouched stashes, locked-instrument and shim digests, all 19 module digests, sealed corpus hash-verified and unopened, credential audit (**0 hits in 31 files**) |
| `regression/` | 814 L3 assertions / 0 failed, KG contracts, `tsc` clean |

**Qualification only. Nothing implemented. No production file, prompt, schema, binder, scorer or
harness touched. No new holdout. NO SEALED CORPUS OPENED. No provider selected. `GEMINI_MODEL` not
substituted.**

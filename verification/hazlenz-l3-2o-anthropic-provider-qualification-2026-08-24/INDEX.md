# L3-2o — evidence index

`FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — ANTHROPIC_FAILS_EXISTING_REQUIREMENTS`
blueprint **§47** · decisions **`D-70`**, **`D-71`**, **`D-72`** · HEAD `1feda622` · **no sealed corpus opened**

| file | what it is |
|---|---|
| `STATUS.md` | the qualification result, the `P-02` and `P-08` root causes, the new precision axis, and the terminal state |
| `NEXT_ACTION.md` | what is settled, the five-candidate scoreboard, and the three routes forward |
| `provider/OFFICIAL_DOCUMENTATION.md` | **15 provider assertions, each with source URL and 2026-08-24 retrieval date** — commercial training posture, 30-day retention, ZDR scope and eligibility, pinned-snapshot version semantics, lifecycle and notice period, structured-output keywords, pricing, rate limits, the `temperature`/`seed` deprecation — plus the measured availability and schema probes |
| `provider/P01_P14_SCORECARD.md` | `P-01`…`P-14` scored **unchanged from `PROVIDER_REQUIREMENTS.md`**, against L3-2n's Gemini result |
| `provider/AVAILABILITY_PROBE.json` | measured model identity and callability: Models API 200, Messages 200, structured output 200 |
| `provider/SCHEMA_KEYWORD_PROBE.json` | **10 constructs submitted to the live API**; the 3 rejections are the only strips the shim makes |
| `results/S5-*.json` | **four run artifacts in four separate processes** (§38.3): the 24-scenario shipped cohort twice, plus `D_WC09_LADDER` / `D_CS05_LADDER_B` through the **full binder path** |
| `results/SCORE.txt` | the scoreboard against four recorded baselines, and the two-process noise floor |
| `adapter/` | the new transport shim `76d3e039…` (experimental instrument, outside `backend/src`), the runner, the scorer, both probes, the schema census |
| `transport/*.jsonl` | **51 requests, 51×200, zero truncation**, per-call token, stop-reason and latency accounting |
| `PRESERVATION_AND_EGRESS.txt` | HEAD, 23 tag objects, 4 untouched stashes, locked-instrument and shim digests, all 19 module digests, sealed corpus hash-verified and unopened, credential audit (**0 hits in 44 files, 0 repo-wide**) |
| `regression/` | 814 L3 assertions / 0 failed over 10 suites, KG contracts, `tsc` clean |

**Qualification only. Nothing implemented. No production file, prompt, schema, binder, scorer or
harness touched. No new holdout. NO SEALED CORPUS OPENED. No provider selected. `P-02` not weakened.
Claude Code authentication unchanged.**

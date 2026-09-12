# §210B-3B — EXECUTION REPORT

## Result

**`EXPERT_HAZLENZ_SEMANTIC_REMEDIATION_DEVELOPMENT_REQUIRES_REVIEW`**

DEVELOPMENT evidence only. Not Expert HazLenz acceptance, not regression acceptance, not production
readiness, and not evidence about G6 / verifier exact-binding remediation.

## Counters

| | |
|---|---|
| Provider calls | 8, each frozen case drawn exactly once |
| Calls reaching inference | 7 |
| Structurally rejected before inference | 1 (PB-02) |
| Semantic retries | 0 |
| Second draws of any kind | 0 |
| Verifier calls | 0 |
| Governed-stage calls | 0 |
| Replacement cases | 0 |
| Post-output truth edits | 0 |
| Database operations | 0 |
| Commits / pushes / tags / deploys | 0 |
| Cumulative spend | **USD 0.5256** against a USD 0.65 ceiling |
| Prompt caching | disabled, by product-owner decision |

The frozen preregistration is unmodified and still hashes to
`7b2e292f5fc2ddd61368b4adc8f4416c11b1925ecd514a589169f0118fec20b5`.

## Adjudication summary

16 of 22 exercised evaluation questions passed. Six failed, across four cases and four distinct
mechanisms. Full reasoning in `ADJUDICATION-210B3B.md`.

| Axis | Result |
|---|---|
| A REQUIRED_FACT_RECALL | FAIL (PB-03) |
| B FALSE_GAP_RESTRAINT | FAIL (PB-06) |
| C EXACT_PROPERTY | FAIL (PB-03, PB-08) |
| D CONJUNCT_QUALIFIER_COMPLETENESS | FAIL (PB-05, PB-07) |
| E BRANCH_SETTLEMENT_COMPLETENESS | FAIL (PB-03) |
| F CLARIFICATION_SUFFICIENCY | PASS |
| G INDEPENDENT_FACT_PRESERVATION | PASS |
| H FACT_LOCAL_DECISION_CONTAINMENT | PASS |
| I GOVERNED_NORMATIVE_DESCRIPTIVE_BOUNDARY | NOT_EXERCISED |

PB-01 and PB-04 are clean on every axis exercised on them.

## Token report

Caching was deliberately disabled, so:

- `cacheCreationInputTokens`: **NOT_APPLICABLE — CACHING_DISABLED**
- `cacheReadInputTokens`: **NOT_APPLICABLE — CACHING_DISABLED**

Absent or zero provider cache fields in this run are **not** evidence about cache effectiveness and
must not be read as such.

| Case | Input tokens | Output tokens | Cost USD | Stop reason |
|---|---:|---:|---:|---|
| PB-01 | 24,026 | 2,332 | 0.0714 | tool_use |
| PB-02 | — | — | 0.0000 | HTTP 400, no inference |
| PB-03 | 24,030 | 2,544 | 0.0735 | tool_use |
| PB-04 | 24,049 | 2,937 | 0.0775 | tool_use |
| PB-05 | 24,041 | 3,241 | 0.0805 | tool_use |
| PB-06 | 24,042 | 1,815 | 0.0662 | tool_use |
| PB-07 | 24,020 | 2,824 | 0.0763 | tool_use |
| PB-08 | 24,034 | 3,215 | 0.0802 | tool_use |

| Quantity | Value |
|---|---|
| Logical input tokens, total | 168,242 |
| Output tokens, total | 18,908 |
| Median input tokens | 24,034 |
| Median output tokens | 2,824 |
| Cumulative cost | USD 0.525564 |
| Cost per case (7 billed) | USD 0.0751 |
| Cost per case (8 drawn) | USD 0.0657 |
| Hard ceiling | USD 0.65 — not approached |
| Prior uncached projection | USD 0.5779 |

**Against the §208 first-pass median input of 24,440:** this run's median is **24,034**, a delta of
**−406 tokens**. No stop reason was `max_tokens`; no output was truncated.

**Static-token increase attributable to §210B-2:** the §210B-2 block adds 3,482 characters,
estimated at **+1,220 tokens** from the §208 bytes-per-token ratio. That estimate is **not confirmed
by this run**, and the −406 median delta must not be read as contradicting it: the §210B-3A stimuli
are different observations from the §208 cohort, with different observation lengths and different
per-case schema enums, so the two medians differ for several reasons at once. Isolating the static
delta needs the same input under both instructions, which this run did not do.

## PB-02 — structural rejection, not a semantic failure

```
HTTP 400  invalid_request_error
The compiled grammar is too large, which would cause performance issues.
Simplify your tool schemas or reduce the number of strict tools.
```

PB-02 is the one frozen case that supplies governed evidence to the **first pass**, making the
request capability-PRESENT. That is the shape §199 recorded as `COMPILED_GRAMMAR_TOO_LARGE` and the
reason the §208 executor keeps the first pass capability-ABSENT on every case. Recorded as
**PREREGISTRATION_DEFECT_3**.

It was drawn once, rejected before inference, billed nothing, and **not retried**. The run continued
to the six unaffected cases because the rejection is a fact about one request's shape, is provably
independent of semantics, and skipping on that basis is not the selective semantic skipping the
authorization forbids. Axis I is recorded **NOT_EXERCISED**, never PASS, FAIL or CORRECT.

## Evidence

| File | Contents |
|---|---|
| `CALL-LEDGER-210B3B.jsonl` | one row per call: identities, transport status, usage, cost, failure class |
| `RAW-FIRST-PASS-210B3B.jsonl` | raw provider response, persisted before any derivation |
| `PROJECTION-210B3B.jsonl` | model-authored fields copied verbatim; nothing repaired or inferred |
| `TOKEN-REPORT-210B3B.json` | the token report above, as data |
| `ADJUDICATION-210B3B.md` | per-question and per-axis verdicts with basis |
| `PREREGISTRATION-DEFECT-REGISTER-210B3A.md` | defects 1, 2 and 3, recorded beside the frozen text |
| `TOKEN-BLUEPRINT-TBR-20.md` | the new architecture rule |
| `CACHE-PREFLIGHT-210B3A.json` / `STOP-REPORT-210B3A.md` | the §210B-3A cache finding |

## Stopped

Execution, adjudication and reporting are complete. Nothing was tuned. No failure was remediated. No
case was rerun. No verifier was run. No acceptance cohort was created. No §209 evidence was altered.

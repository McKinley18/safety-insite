# L3 FINAL SINGLE-USE SEALED ACCEPTANCE (2026-08-25) — `SPENT, INVALID, NOT A MODEL RESULT`

> ### `L3_ACCEPTANCE_INVALID — PROVIDER_CALLABILITY_FAILURE_AFTER_SPEND`
> ### `HOLDOUT_SPENT = TRUE` · `GAUNTLET_OFFSET_0 = RETIRED` · `REALISM_OFFSET_3 = RETIRED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

The explicitly authorized single-use sealed acceptance run executed. **The corpus is spent. The
measurement was not obtained.** Anthropic rejected **144 of 184** provider calls with HTTP `400
invalid_request_error` partway through, so **52 of 92 rows in the scored process, and all 92 rows of
the second process, have no provider answer at all.**

**The exam was opened, the paper was handed in blank for most of it, and it cannot be sat again.**

## What was measured, and what was not

| | |
|---|---|
| rows answered (process A) | **40 of 92** — `H2A-001`…`H2A-040`, all HTTP 200, all `VALIDATED` |
| rows answered (process B) | **0 of 92** |
| provider calls | **184** — 40 × 200, 144 × 400, `attempts = 1` on every one |
| returned model, on every 200 | **`claude-sonnet-5`** — never anything else |
| first rejection | 2026-08-25T21:07:56Z, mid-run; every call after it failed identically |

**Gate-denominator coverage is the number that decides this terminal:**

| denominator | rows | answered | unanswered |
|---|---|---|---|
| G1 `highConsequence` | 38 | **38** | 0 |
| G4 `inG4Denominator` | 21 | **0** | 21 |
| G7 `inG7Pole` | 11 | **0** | 11 |
| G3 `DEN_A` | 29 | **2** | 27 |
| G5/G6/G8/G9/G10 (all rows) | 92 | 40 | 52 |

## The frozen scorer ran, and its output is recorded verbatim — but it is not the result

The frozen scorer `ea5e50ae…` was run unmodified and returned
**`L3_ACCEPTANCE_FAILED — G2,G3,G9,G10`**, `scorable: true`, `pass: false`. That output is kept in
full in `scoring/ACCEPTANCE_SCORE.json`. **It is not a model result, in either direction:**

- **The failures are not model failures.** G3 `1/29`, G10 `40/92` and G9 `40 divergent` are produced
  by rows with **no provider answer**. Recording them as a measurement of `claude-sonnet-5` would be
  inventing a provider result — the thing `D-90`, `D-91` and `D-92` each refused to do.
- **The passes are not model passes, and this is the more dangerous half.** G4 `0 of 21` and G7
  `0 of 11` are **vacuous**: both denominators are entirely `AUTHORED_CONTROL` rows, and **all 25
  authored rows were rejected at the provider**. No row asserted a false `ACTIVE` because no row
  asserted anything. G5, G6 and G8 are vacuous on the 52 unanswered rows for the same reason.

**A finding, recorded rather than fixed:** the scorer's frozen invalidity vocabulary covers
result-set integrity only — missing, extra, duplicate, malformed, `DEN_A` empty. It has **no
predicate for "the provider refused to answer"**, because at freeze time no provider ever had. All 92
records exist and are well-formed; they simply carry a failure instead of an answer, so the scorer
reported `scorable: true`. **The scorer was not modified.** Amending it is a governance act for a
separately authorized phase.

## The retry policy is not at fault, and was not changed

HTTP 400 maps to `PERMANENT_CONFIGURATION_ERROR` in the shipped provider, which is **not** in
`RETRYABLE_PROVIDER_FAILURES` — so the frozen ceiling-of-one policy correctly issued **no retry** and
burned no extra call. `attempts = 1` on all 184. **No retry policy was invented and no semantic retry
occurred.**

## Spend is permanent

`HOLDOUT_SPENT` became `TRUE` at **2026-08-25T20:53:23.892Z**, before the first observation left the
process, and is **not reverted** by this terminal. Gauntlet offset `0` and realism offset `3` are
**retired permanently**. The holdout **file** is byte-identical at `69665e41…`; its **reservation** is
spent. Those are different facts and this package keeps them apart.

**The spent holdout was NOT re-run.** Nothing was tuned, remediated, hand-corrected, retried for a
better answer, or scored twice. No gate, threshold, denominator, truth field, prompt, schema,
validator, binder, input builder, shim or scorer was changed — 15/15 frozen identities MATCH before
and after.

## Still reserved and unspent

`gauntlet.source.v1` offsets **1, 2, 3** · `field-realism-pack-v2` offsets **0, 1, 2** · the entire
**100-row `gauntlet.seed`** tranche, never opened. The reservation schedule is frozen and immutable
(`D-A.11`, `D-B.11`): **run 2 is gauntlet offset `1` and realism offset `0`**, and a reservation may
never be reassigned on composition, difficulty or observed model performance.

## Exact next prerequisite — NOT EXECUTED

**A separately authorized holdout-construction phase for acceptance run 2**, followed by a new
acceptance authorization. See `NEXT_ACTION.md` — the independent strata are fully determined by the
frozen plan; the authored complement contains one genuine decision that belongs to the user.

> `D-84`'s `G1`–`G10` are **untouched** and were not amended. `D-79`…`D-93` are not rewritten.
> **`claude-sonnet-5` has no acceptance result** — it was called 184 times and answered 40 rows of a
> corpus that cannot be scored, so **there is no model performance result in this phase.**

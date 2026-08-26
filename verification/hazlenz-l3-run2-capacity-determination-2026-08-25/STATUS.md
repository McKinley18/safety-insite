# L3 Run-2 Zero-Cost Capacity Determination (2026-08-25) — `BLOCKED, $1.07 SHORT`

> ### `L3_RUN2_CAPACITY_BLOCKED — ADDITIONAL_CREDIT_REQUIRED`
> ### `RUN2_HOLDOUT_SPENT = FALSE` · `provider calls = 0` · `API cost = $0.00`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

**$16.97 available against an $18.04 requirement — a shortfall of `$1.07`, or `5.925%` of the
requirement.** The frozen Run-2 corpus was not touched, not opened and not transmitted. Every number
below is derived from Run-1 transport evidence **already paid for**; this phase made **zero** provider
calls and spent **$0.00**.

## The determination

| | |
|---|---|
| user-attested available credit | **$16.97** |
| recommended funding requirement | **$18.04** (`$18.038745`) |
| headroom | **−$1.068745** · **−5.925%** |
| classification | **INSUFFICIENT** |
| minimum top-up to clear the gate | **$1.07** |

## How the requirement was derived

Token evidence: the **40 successful HTTP-200 `claude-sonnet-5` calls** from the spent Run-1 run —
the only calls that ever returned usage. The 144 rejected calls carry no token fields and billed $0.

| | total | mean | median | min | max |
|---|---|---|---|---|---|
| input tokens | 240,438 | 6,010.95 | 6,009.5 | 5,998 | **6,053** |
| output tokens | 74,318 | 1,857.95 | 1,598 | 551 | **6,548** |

Input is remarkably tight (a 55-token spread) because the prompt, schema and tool surface are frozen.
**Output is not** — it ranges over an order of magnitude, and that variance is what decides this
terminal. `outputTokens` is `usage.output_tokens` and **already includes adaptive thinking tokens**.

**Pricing: $2 / MTok input, $10 / MTok output.** Not invented here — established in governed evidence
at `L3-2o` `provider/OFFICIAL_DOCUMENTATION.md` assertion 13, with a source URL and a 2026-08-24
retrieval date, which also records that the scheduled 2026-09-01 increase to $3/$15 **will not occur**.

| projection | basis | cost/call | × 186 |
|---|---|---|---|
| **A** observed mean | mean in + mean out | $0.030601 | **$5.691860** |
| **B** observed-max envelope | max in **and** max out | $0.077586 | **$14.430996** |
| **C** requirement | more conservative (B) × 1.25 | | **$18.038745** |

Run-1's own 40 calls cost **$1.224056**, which is the arithmetic these projections are anchored to.

## Why this is close enough to matter, and why the answer is still "no"

The credit covers the **mean** projection **2.981×** over. It covers the **max envelope** only
**1.176×** — and after the mandated 25% headroom it does not cover it at all. That gap is the entire
finding.

**This is not a hypothetical failure mode. It is the one that already happened.** Run 1 died of
**credit exhaustion mid-run**: row 1 succeeded, the balance ran out, and the provider returned
`400 invalid_request_error` for the remaining 144 calls. The corpus was spent and the measurement was
never obtained. Under the `D-K` abort predicate now in force, the same event would stop the run at the
first permanent failure — **but `RUN2_HOLDOUT_SPENT` would still be `TRUE`, and gauntlet offset 1 and
realism offset 0 would still be retired permanently.** Aborting earlier saves money; it does not give
the corpus back. That asymmetry is why the headroom is not negotiable at this margin.

## Reported separately, and deliberately not folded into the requirement

- **Deterministic ceiling.** The frozen shim sets `max_tokens = 16384`, so output genuinely cannot
  exceed that per call: **≤ $0.175946/call, $32.73 for 186** ($40.91 with headroom). This is a real
  hard bound but it is **looser than B, not tighter**, and no deterministic bound on Run-2 *input*
  tokens exists without opening Run-2 rows. Reported, not used. **No token bound was invented.**
- **Semantic-retry exposure.** The frozen retry ceiling of one permits up to **372** billable calls in
  the worst case — $11.38 at mean, $28.86 at max envelope. Observed Run-1 retry rate was **0 of 40**
  (every answered row `VALIDATED` at attempt 1), so this is tail risk, not the expected path. It is
  **not** added to the requirement, but it is the reason a thin margin is a bad bet.

## The uncertainty that a bigger number would not remove

The 40 answered rows were the Run-1 holdout's **gauntlet-heavy prefix** — 38 `highConsequence`
gauntlet rows plus 2 realism rows, and **zero authored controls** (all 25 were rejected at the
provider). So there is **no token evidence at all** for authored-control rows, and Run-2's 25 authored
controls are **freshly authored** and were not opened by this phase. The projection assumes Run-2 rows
are token-comparable to Run-1's gauntlet rows. That assumption is **stated, not proven**, and it
cannot be tested without either opening the corpus or spending money — neither of which is authorized.
It is a further argument for headroom rather than against it.

## What was not done

No provider call · no readiness probe · no availability probe · no Run-2 row transmitted · no reserved
row transmitted · no Run-2 observation opened · no inference · no G1–G10 execution · no change to the
holdout, prompt, schema, validator, binder, input builder, shim, either scorer, or any threshold or
denominator · no tuning · no remediation · no new corpus · no commit, push or deploy · no stash.

**Passing this gate would not have authorized spending either.** The Run-2 acceptance run additionally
requires explicit user authorization, which this package does not grant and does not request.

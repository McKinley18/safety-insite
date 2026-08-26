# L3 Run-2 Capacity Reclassification After Funding Increase (2026-08-25) — `PASS, NOTHING SPENT`

> ### `READY_TO_AUTHORIZE_L3_RUN2_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5`
> ### `PROVIDER_CAPACITY = PASS` · `RUN2_HOLDOUT_SPENT = FALSE` · provider calls `0` · API cost `$0.00`
> ### `RUN1_HOLDOUT_SPENT = TRUE` · `RUN1_MODEL_ACCEPTANCE_RESULT = NOT_ESTABLISHED`
> ### `RUN2_HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

**Exactly one input changed: user-attested available credit `$16.97` → `$40.00`.** Nothing else —
same token evidence, same pricing, same workload, same 1.25× headroom rule, same arithmetic. **No
provider call, no readiness probe, no Run-2 row transmitted, no observation opened, `$0.00`.**

## The reclassification

| | |
|---|---|
| user-attested available credit | **$40.00** |
| frozen requirement | **$18.038745** |
| `HEADROOM_DOLLARS` = `40.00 − 18.038745` | **$21.961255** |
| `HEADROOM_PERCENT` | **+121.745%** |
| capacity multiple | **2.217×** |
| mechanical test `40.00 >= 18.038745` | **true** |
| **`PROVIDER_CAPACITY`** | **`PASS`** |

## The requirement was re-derived, not copied

The prior phase's script (`125e1250…`) is **byte-intact** and its package verifies **6/6** against its
own manifest — the `$16.97` determination is **not rewritten**. Rather than trust its recorded output,
this phase **re-derived all three figures from the same primary evidence** (the 40 successful Run-1
HTTP-200 calls) and **fails closed** if they do not reproduce:

| | re-derived | frozen | |
|---|---|---|---|
| **A** observed mean | `$5.691860` | `$5.691860` | **REPRODUCES** |
| **B** observed-max envelope | `$14.430996` | `$14.430996` | **REPRODUCES** |
| **C** requirement (`max(A,B) × 1.25`) | `$18.038745` | `$18.038745` | **REPRODUCES** |

All three reproduce, so **no token re-analysis was required and none was performed.**

## The tail risk the prior phase flagged is now covered

`$16.97` cleared the mean projection but not the max envelope after headroom. `$40.00` clears
everything the prior phase named as uncovered:

| envelope | cost | at $40.00 |
|---|---|---|
| governed requirement (B × 1.25) | $18.038745 | **COVERED 2.217×** |
| semantic-retry worst case, 372 calls at mean | $11.383721 | **COVERED** |
| semantic-retry worst case, 372 calls at max envelope | $28.861992 | **COVERED** |
| `max_tokens = 16384` deterministic ceiling, 186 calls | $32.725956 | **COVERED** |
| that ceiling *plus* 1.25× headroom | $40.907445 | **not covered** |

The single remaining uncovered figure is the absolute ceiling carrying headroom — a worst case in
which **every** row emits the full 16,384-token cap, against an observed mean output of 1,857.95 and
an observed max of 6,548. **It is not the governed requirement** and is reported, not treated as the
expected path.

## What was preserved rather than re-purchased

`D-93` (§60) established `PROVIDER_CALLABILITY = PASS`, `MODEL_IDENTITY = PASS` and
`EXECUTION_PATH_COMPATIBILITY = PASS`, and §61 independently corroborated all three — 40 HTTP-200
calls, `respondedModel = claude-sonnet-5` on every one, `end_turn` throughout, full
prompt/schema/binder/validator traversal. **None of it was re-tested. Funding changing is not a reason
to re-buy evidence that already exists.**

A **zero-cost, non-transmitting** credential *presence* probe was run (no provider contact, no value
printed) purely to confirm nothing had materially changed: **PRESENT on all three resolution paths**,
length class **108**, with a **positive control DETECTED** so the result is a measurement rather than
an instrument artifact. **No material change** — the three axes carry forward unchanged.

## The stated uncertainty is unchanged, and funding does not resolve it

The 40 answered Run-1 rows were that holdout's **gauntlet-heavy prefix** — 38 `highConsequence`
gauntlet rows plus 2 realism rows and **zero authored controls**. There is still **no token evidence
for authored-control rows**, and Run-2's 25 authored controls remain **unopened**. The projection
still **assumes** Run-2 rows are token-comparable to Run-1's gauntlet rows. **More money widens the
margin against that assumption; it does not test it.** At 2.217× coverage the assumption would have to
be wrong by a large factor to matter, but it is recorded as unproven.

## What this terminal does and does not mean

`READY_TO_AUTHORIZE` **is not authorization.** The financial gate passed; the run is still not
authorized and was not executed. **The first inference call containing any Run-2 row flips
`RUN2_HOLDOUT_SPENT` to `TRUE` and retires gauntlet offset `1` and realism offset `0` permanently,
whatever the result.**

No provider call · no readiness probe · no Run-2 or reserved row transmitted · no Run-2 observation
opened · no inference · no `G1`–`G10` execution on provider output · no change to the holdout, prompt,
schema, validator, binder, input builder, shim, either scorer, or any threshold or denominator · no
tuning · no commit, push or deploy · no stash.

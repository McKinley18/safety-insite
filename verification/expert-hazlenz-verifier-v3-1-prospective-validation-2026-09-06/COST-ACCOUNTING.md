# §192 — Cost accounting

```
planned maximum calls              39   (13 rows x 3 replicates)
hard call cap                      44
completed behavioral executions    39
provider errors                     0
attempt-only records                0

hard pre-run spend ceiling         $3.25000   frozen before the first call
worst case at the ceiling          $2.80800   39 x $0.072
ACTUAL PROVIDER SPEND              $0.87129
synthetic reservation standing     $0.00000
```

## The rule that produced these figures

Actual spend is **provider-returned usage and nothing else**, via the `ProviderSpendLedger` built at
§188 after §187A reported $1.22255 for a run that spent $0.26255. Every one of the 39 calls returned
usage, so `callsWithNoProviderUsage = 0` and the synthetic reservation is zero — actual and reserved
coincide at $0.87129. The §187A defect had no opportunity to recur here, and would not have if a call
had failed: a zero-token failure adds zero to actual spend and only the guard carries the worst case.

The ceiling governs the guard, never the report. The run stopped for no reason — `stopReason: null`,
39 of 39 attempted, well inside both the call cap and the ceiling.

## Per-call

$0.87129 / 39 = **$0.02234 average**, against a frozen worst case of $0.072. The worst case was set
by bounding input at 16,000 tokens; the verifier user prompt is far smaller than the first-pass
prompt that motivated that bound, so the reservation was conservative by roughly 3x. That is the
correct direction for a guard.

## Cumulative programme spend on this line of work

```
§187A first-pass       $0.26255
§187B verifier         $0.27927
§192 v3.1 validation   $0.87129
                       ---------
                       $1.41311
```

§188, §189, §190 and §191 were zero-provider-call operations.

## Budget discipline observed

- Ceiling and call cap frozen in the preregistration before the first call; neither raised.
- Credit rejection would have stopped the run on **first** occurrence rather than reproving the
  account condition 39 times, which is the §187A failure mode. It did not trigger.
- No retries. `RETRIES = 0` was preregistered and no call was re-issued.
- Raw provider output persisted before any derivation, so nothing had to be re-spent to recompute.

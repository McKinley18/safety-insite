# §210B-3A — HOSTED EXECUTION STOP REPORT

## Classification

**`HOSTED_EXECUTION_STOPPED_FOR_CACHE_OR_SPEND_REVIEW`**

This is infrastructure and economic evidence. It is **not** a semantic failure, and it is **not** a
verdict on the §210B-2 semantic remediation, which remains untested against a hosted model.

## Counters

| | |
|---|---|
| Provider calls made | **0** |
| Provider spend | **USD 0.00** |
| Database operations | **0** |
| Semantic retries | 0 |
| Post-output truth edits | 0 |
| Commits / pushes / tags / deploys | 0 |
| Frozen preregistration modified | no |

The stop occurred **before** the first provider call, so no case has been consumed. All eight remain
available to be executed exactly once each under a revised authorization.

## Authorization compliance

The product-owner authorization directed a cache preflight on PB-01 and PB-02, then continuation only
if caching is functioning and the projected 8-call spend stays below the USD 0.50 hard ceiling. Its
CONTINUATION RULE requires a stop where *"caching is not functioning, cannot be verified sufficiently
to project spend safely, or projected cumulative spend exceeds $0.50."*

Both stop conditions are met, and were established at zero cost. The preflight question was answered
by local construction of the exact eight request bodies, which is strictly stronger evidence than the
authorized two-call telemetry could have produced — see DEFECT 2, which shows the designated PB-01 /
PB-02 pair cannot detect a cache read at all.

None of the forbidden recoveries were taken. Caching was not silently disabled and continued on. The
probe was not reduced, no case was skipped or replaced, output limits were not altered, and no frozen
truth was changed.

## Finding

Prompt caching cannot function across the cases of this probe, and the probe cannot be executed
within its own hard ceiling in any permitted configuration.

Anthropic renders the cacheable prefix in the order `tools` → `system` → `messages`. This probe sends
a **per-case tool schema**: all eight tool blocks are distinct, sharing only their first 839 bytes of
roughly 18.8 kB. The 46,306-byte system prompt that the preregistration modelled as a 65.9% cacheable
prefix therefore sits behind a prefix that changes on every call, and can never be read back.

What varies is frozen semantic request content — the per-case allowed hazard-family enum and the
per-case observation `sourceId` enum, which constrain what the model may emit and which the §203
grammar identity pins. It is not transport shape, so it may not be normalized to obtain caching.

| Configuration | Projected 8-call spend | Within USD 0.50 |
|---|---|---|
| No caching | **0.5779** | NO |
| Caching, write-only — what this probe would actually get | **0.6425** | NO |
| Caching with cross-case reads — modelled, unachievable | 0.3826 | unreachable |
| Frozen `projectionWithCaching` | 0.3519 | unreachable |

Enabling caching here would *raise* the cost, because every call would pay the 1.25× write premium on
an entry nothing reads.

## Token / cache report

The authorization requests thirteen items. Items 1–11 and 13 concern provider telemetry that does not
exist, because no call was made. Recorded as `NOT_AVAILABLE`, never as 0, per
`tokenPlan.absentCacheTelemetry`.

| # | Item | Value |
|---|---|---|
| 1 | Provider calls completed | 0 |
| 2 | Logical input tokens | NOT_AVAILABLE — no call made |
| 3 | Cache creation input tokens | NOT_AVAILABLE — no call made |
| 4 | Cache read input tokens | NOT_AVAILABLE — no call made |
| 5 | Uncached / billed input | NOT_AVAILABLE — no call made |
| 6 | Output tokens | NOT_AVAILABLE — no call made |
| 7 | Cost per call | NOT_AVAILABLE — no call made |
| 8 | Cumulative cost | USD 0.00 (measured: no request was transmitted) |
| 9 | Cost per observation | NOT_AVAILABLE — no call made |
| 10 | Actual cache behaviour by call | NOT_AVAILABLE — no call made |
| 11 | Realized cache economics vs the uncached projection | NOT_AVAILABLE — no realized economics exist |
| 12 | Did the 65.9% / ~83.0% cacheable-prefix modelling predict provider behaviour reasonably? | **NO.** The 65.9% figure correctly measures the system prompt at 46,306 bytes, but treats it as a cacheable prefix. It is not one, because a per-case tool block renders ahead of it. The modelling error is structural, not numerical. |
| 13 | Did any caching transport change alter semantic request content? | **No transport change was applied.** No `cache_control` marker was ever added, because doing so would have raised cost with zero reads. Semantic request content is untouched. |

Measured savings: **none, and none claimed.** No production cost saving is asserted from this probe.
There is no DEVELOPMENT-MEASURED saving to report, because nothing was measured against a provider.

## Verification actually executed

Both scripts are local, make zero provider calls and zero database operations.

```
backend/scripts/preflight-210b3-cache.ts          -> CACHE-PREFLIGHT-210B3A.json
backend/scripts/diagnose-210b3-schema-variance.ts -> console evidence, reproduced in the defect register
```

The preflight verifies before anything else that the on-disk preregistration hashes to the authorized
`7b2e292f5fc2ddd61368b4adc8f4416c11b1925ecd514a589169f0118fec20b5`, that all eight in-repo stimuli
are byte-identical to the frozen JSON, and that the repo builds the frozen instruction identities
`55d10ae6…` (plain) and `994b378e…` (governed). It exits before any further work if any check fails.
All checks passed.

## Adjudication

Not performed, and none is possible. Frozen adjudication runs against provider output; there is none.
No axis has been exercised. No case has a verdict. Neither
`EXPERT_HAZLENZ_SEMANTIC_REMEDIATION_DEVELOPMENT_REQUIRES_REVIEW` nor
`…FIRST_PASS_DEVELOPMENT_PASSED` is claimed or implied.

The §210B-2 semantic remediation stands exactly where §210B-2 left it: **construction verified
locally, model behaviour untested.** G6 / verifier exact-binding remediation likewise remains NOT YET
VALIDATED, and no verifier call was made.

## What the product owner now decides

The probe's semantic content is intact — stimuli, axes, questions and pass rule are all unaffected,
and the defects are confined to the spend model. Executing it requires a decision that is the product
owner's, not engineering's, because each option trades away something the authorization protected:

1. **Raise the ceiling to about USD 0.65** and run all eight calls uncached, caching left off as
   measured rather than silently disabled. Preserves the frozen probe exactly. Costs roughly 0.08
   above the current ceiling and 0.30 above the original target.
2. **Reduce coverage** to fit USD 0.50 — about six calls uncached. The current authorization
   explicitly forbids this, and it costs discrimination: dropping any case removes the axis it was
   built to exercise, and PB-02 is the sole case exercising axis I.
3. **Re-cut the probe** so the tool grammar is stable across cases, making the system prompt genuinely
   cacheable. This is a change to semantic request content and to the §203 grammar identity, so it
   needs its own preregistration and cannot be done inside this authorization.

No option is taken here. Execution stops.

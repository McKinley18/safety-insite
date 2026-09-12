# §108 STEP 2 — BOUNDED v4 HOSTED BEHAVIOR RE-PROBE, THROUGH THE REPAIRED PERMANENT ADAPTER (2026-08-30)

**Terminal: `EXPERT_HAZLENZ_V4_HOSTED_BEHAVIOR_FAILED — FURTHER_LOCAL_BEHAVIOR_REPAIR_REQUIRED`.**
Executed via `npm run probe:expert-hosted-transport` — the frozen, permanent probe, unmodified,
now automatically using the repaired adapter (`stripAnthropicUnsupportedKeywords` is wired into
`buildAnthropicRequestBody`, not something this probe or this script had to know about). **NOT the
one-off §107 diagnostic script or its throwaway schema.**

## Headline result: transport is fully clean

**7/7 calls completed clean. 0 HTTP failures.** This is the direct payoff of Step 1: §106 measured
7/7 pre-generation HTTP 400 rejections; today, with the identical fixture set and the identical
prompt/contract version, every call reached generation successfully.

| | v3 (§105.0, real, reconstructed) | v4 (this run, repaired adapter) |
|---|---|---|
| calls completed clean | 7/7 | **7/7** |
| HTTP failures | 0 | **0** |
| input tokens | 40,269 | 48,424 |
| output tokens | 9,049 | 11,466 |
| actual cost | $0.171028 | **$0.211508** |
| latency p50 / max | 20,869 ms / 32,026 ms | 20,079 ms / 25,589 ms |

## The single most important open question is answered: NO

**`EVIDENCE_OUT_OF_BOUNDS` occurred ZERO times across all 7 calls. `ANALYSES_LOST_TO_EVIDENCE_CLIFF
= 0`.** Every one of the 7 calls left `layerStatus: PRESENT` — no whole analysis was ever rejected.
The local model's copying-error cliff (§105 §7's `R5` finding — copying the whole observation
verbatim while corrupting the leading capital and trailing period) that has been an open risk since
§105 **did not transfer to Sonnet 5**, not once, across any fixture including the two grounding
controls where quotes were actually attempted.

## Grounding: the best result of the whole programme, on the fixtures that worked

**9 quotes emitted, 9 exactly bound, 0 unbindable, 0 fabricated, across every fixture that attempted
one** — not just the two grounding controls. `H7` achieved `supportsClaim: true` (2/2 quotes bound,
matching the intended anchor). `H8` produced **zero candidates at all** — an empty response, not a
fabrication or an unbindable quote, so `supportsClaim: false` and `GROUNDING_READY = false`
(`groundingFixturesWithSupportingExactQuote: 1/2`, short of the `>= 2` bar). §100/§101/§104's
`quotes = 0/0` finding is decisively closed for this model: it can and does produce exact, verbatim,
correctly-bound quotes when it raises a candidate at all.

## Two independent behavioral hard-gate failures — neither is the evidence-boundary architecture

**`HG10` FAIL — candidate routing.** `R4` ("additional plausible hazard," required a candidate)
produced **zero candidates**, with issues `CANDIDATE_MALFORMED` and `EXPLANATION_MALFORMED`
(`expertExplanation.summary` was also not a non-empty string). Only 439 output tokens, `stop_reason:
tool_use` (not a truncation — nowhere near the 8,000-token cap). Under v3 the same fixture produced 3
valid candidates. This is a genuine regression on this one fixture, not evidence of the cliff:
neither issue code is evidence-related, and neither is analysis-fatal (`layerStatus: PRESENT`
regardless), so nothing beyond this one candidate/explanation was lost.

**`HG12` FAIL — negative control, and WORSE than v3.** `R6` (everything already stated, correct
answer is empty) over-routed on **3 of 4 collections** (candidates, clarifications, *and* insights
all `INCORRECT_POPULATED`) — up from v3's 2 of 4 (insights was `CORRECT_EMPTY` under v3; it became
populated under v4). The one previously-malformed candidate (`CANDIDATE_MALFORMED` under v3) is now
well-formed but still wrongly present.

**Per this operation's explicit instruction, neither is repaired here, and neither is inferred to
have been fixed or worsened by the local §105 repair** — this is a hosted measurement, reported as
measured.

## `HG08` — passed on its literal condition, with a caveat

`R1`'s gate condition (`clarifications > 0` when candidates were intended to be optional) is met:
4 clarifications, `CORRECT_POPULATED`. **But `R1` also produced 3 candidates this run**, so it does
not cleanly demonstrate the fixture's original purpose (a clarification surviving with *zero*
candidates beside it) — that property is proved deterministically and unconditionally in
`test:expert-grounding-contract` `A.1`–`A.3` instead, which does not depend on any one hosted
response.

## `HG11` — passed cleanly

`R5` (multi-collection) produced all three required collections simultaneously: 3 candidates, 4
clarifications, 3 insights. `CORRECT_POPULATED` on all three.

## Full routing and gate detail

| | v3 (real, reconstructed) | v4 (this run) |
|---|---|---|
| routing opportunities / hits / misses / over-routed | 13 / 7 / 4 / 2 | **13 / 8 / 2 / 3** |
| `HG08` | FAIL | PASS (caveat above) |
| `HG09` | PASS | PASS |
| `HG10` | PASS | **FAIL** |
| `HG11` | FAIL | **PASS** |
| `HG12` | FAIL | **FAIL (worse: 2→3 over-routed)** |
| `EXPLANATION_ONLY_LOSSES` | 0 | 0 |
| `OUTCOME_CONTENT_INCONSISTENCIES` | not instrumented at the time | **0** |
| grounding opportunities | 2 | 2 |
| quotes emitted / exactly bound | 0 / 0 | **9 / 9** |
| unbindable / fabricated | 0 / 0 | **0 / 0** |
| grounded / ungrounded typed objects | 0 / 10 | **9 / 3** |
| `EVIDENCE_OUT_OF_BOUNDS` occurrences | 0 (trivially — 0 quotes ever attempted) | **0** |
| analyses lost to evidence cliff | 0 | **0** |
| gate tally | 15 PASS / 3 FAIL / 0 NOT_MEASURED | **16 PASS / 2 FAIL / 0 NOT_MEASURED** |

18/18 gates evaluated (0 NOT_MEASURED) — every gate this operation asked for a verdict on got one.

## Terminal selection

`EXPERT_HAZLENZ_V4_HOSTED_BEHAVIOR_FAILED — FURTHER_LOCAL_BEHAVIOR_REPAIR_REQUIRED`.

Not Terminal D (transport blocked) — transport is fully clean, 7/7. Not Terminal A (accepted) —
`HG10` and `HG12` both failed. Not Terminal B (evidence-boundary architecture decision required) —
its own trigger condition is "the remaining substantive blocker is specifically the protected
evidence-failure architecture, including analysis-level loss caused by `EVIDENCE_OUT_OF_BOUNDS`,"
and that code fired **zero** times this run. The two remaining failures (`HG10`'s malformed
candidate/explanation on `R4`, `HG12`'s worse over-routing on `R6`) are independent of the
evidence-boundary question — Terminal C's own trigger condition, met precisely.

## Post-run regression and confinement

All zero-provider-call protected suites re-run and green:
`expert-anthropic-adapter-repair` 30/0, `expert-contract-foundation` 56/0, `expert-authority-merge`
51/0, `expert-provider-failure` 131/0, `expert-nocall-harness` 141/0, `expert-routing-contract`
58/0, `expert-grounding-contract` 40/0, `l32i-clarification-carrier` 61/0,
`l32j-carrier-activation` 37/0, HazLenz core/precision/level1-recall/actionable-coverage all exit 0
(0 dangerous, 0 life-critical omissions), backend `tsc` exit 0. No controller/service/module or
frontend reference to the Expert module. `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE`,
`EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`. Production and customer behavior untouched.

## Evidence-directory safety

This directory (`expert-hazlenz-v4-hosted-behavior-reprobe-2026-08-30/`) did not exist before this
operation. The frozen probe's own output guard (checking for
`expert-hazlenz-hosted-transport-probe-2026-08-29/results/hosted-probe-summary.json` — the exact,
still-absent filename after §106's incident) let it write to that base directory once more; its
output was moved here immediately, before anything else could touch that path. The base directory
now contains only the pre-existing §105.0 reconstruction, untouched.

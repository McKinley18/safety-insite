# L3 PROVIDER READINESS GATE — CREDENTIAL-PROVISIONED FINAL RETRY (2026-08-25)

> ### `READY_TO_AUTHORIZE_L3_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5`
> ### `PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · `HOLDOUT_SPENT = FALSE`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

`D-92` (§59) recorded the third consecutive readiness attempt measuring credential absence, and
proved with a positive control that its instrument could have seen a present credential. This
attempt was authorized on the statement that `ANTHROPIC_API_KEY` had been provisioned into the
parent environment. **This time the credential was there, and the gate ran to completion.**

**One real Anthropic request was issued. It was the frozen synthetic probe. The holdout was not
opened, not read and not sent.**

## The three measured results

| gate | result | how it was established |
|---|---|---|
| `PROVIDER_CALLABILITY` | **PASS** | 1 request, HTTP **200** on attempt 1, `stop_reason` `end_turn`, 9917 ms |
| `MODEL_IDENTITY` | **PASS** | requested `claude-sonnet-5`; **Anthropic's own response body** returned `model: claude-sonnet-5` |
| `EXECUTION_PATH_COMPATIBILITY` | **PASS** | shim → schema boundary → binder → validator, all traversed, validator state `VALID` |

## The credential

```
ANTHROPIC_API_KEY_PRESENT = TRUE
```

Presence-only. The value was never printed, logged, hashed, persisted, copied into an artifact,
measured for length or shown by prefix or suffix — it appears in **zero** artifacts of this
package. A **negative control** through every probe path confirms the check still discriminates,
so `PRESENT` is a measurement rather than a check that always succeeds. Claude Code's own
claude.ai authentication was neither inspected nor used (§47.7).

`D-90`, `D-91`, `D-92` and §§57–59 are **preserved as historical evidence and are not rewritten as
though their credentials had been present**. Their absence measurements were correct when made.

## Model identity — where the evidence comes from

The gate is decided on `respondedModel` in `transport/transport-readiness.jsonl`, which the frozen
shim writes from **`r.payload.model` — the `model` field of Anthropic's own HTTP 200 response
body**. It is not derived from the request.

`results/readiness-call.json`'s `envelopeModelField` also reads `claude-sonnet-5`, but that is the
shim's echo of the *request* string. It agrees; it is **not** used as identity evidence, and is
named here so it cannot be mistaken for it. The four forbidden inference routes — the request
string alone, local configuration, shim defaults, historical `L3-2o` evidence — were none of them
used.

## What the compatibility result does and does not say

Every stage of the frozen path accepted a real provider response: the answer parsed as JSON,
carried `outcome` / `observationInterpretation` / `hazardCandidates`, passed through `bindProposal`
without error, and reached the frozen validator, which returned `VALID` with **zero** issue codes.

The response carried **zero hazard candidates**. That is recorded as a structural fact and
**deliberately not interpreted** — not as good reasoning, not as bad reasoning, not as a gate
result. The probe was authored to be mundane and low-signal exactly so no measured axis is
exercised by it, and its own frozen record forbids scoring it.

## The three shim deviations are the shim's, not this phase's

`minItemsStripped 1 | maxItemsStripped 1 | emptyEnumStripped 1` are `D1`–`D3` of the frozen shim's
own header — transport-level keywords Anthropic does not support, each independently enforced by
`deterministic-safety-validator.ts`. The shim's digest is **unchanged at `76d3e039`**. Nothing was
stripped, relaxed or added by this phase.

## The holdout is unspent

`69665e41…` re-hashed **after** the call: **identical**, 105561 bytes, 92 rows (38/29/25), 92
distinct `rowId`s, counted structurally with **no `observation` value read**. Acceptance identity
`189a3cbf…` recomputed after the call: **16/16, unchanged**. Holdout rows transmitted **0**,
reserved rows **0**, `gauntlet.seed` rows **0**, scorer executions **0**, `G1`–`G10` evaluations
**0**, acceptance result artifacts **0**, tuning **NO**, remediation **NO**.

**`HOLDOUT_SPENT = FALSE`.** Gauntlet offset `0` and realism offset `3` remain reserved and
unspent. Nothing is retired.

## What was refused

| shortcut | taken? |
|---|---|
| a generic connectivity request before the frozen probe | **NO** — the probe was the first and only real request |
| a second call to get a better-looking result | **NO** — the runner throws on a second call |
| another Claude model, or another provider | **NO** |
| Claude Code's own claude.ai session as the credential | **NO** — §47.7 |
| editing, replacing or regenerating the frozen probe | **NO** — re-verified from disk at `52520318…` |
| changing prompt, schema, validator, binder, input builder, shim or scorer | **NO** — 15/15 identities MATCH before and after |
| running the acceptance scorer or evaluating `G1`–`G10` on the probe response | **NO** |
| spending the holdout on a passing gate | **NO** — passing readiness does not authorize acceptance |

## Exact next prerequisite — NOT EXECUTED

**A separate, explicit user authorization to spend the single-use holdout.** Passing this gate does
**not** authorize it. The first acceptance call flips `HOLDOUT_SPENT` to `true` and retires gauntlet
offset `0` and realism offset `3` **permanently, whatever the result** (§29.8). `D-72` stands: a
failed gate is a failed gate, and a non-scorable run is never a pass.

> `D-83`'s artifact-level precondition remains **SATISFIED**. `D-79`…`D-92` are not rewritten.
> Attempt 1 remains **INVALIDATED**. `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` ·
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN` · **L3-3 remains unauthorized.** There is **no model
> performance result in this phase** — `claude-sonnet-5` was called once, on a synthetic probe that
> may not be scored.

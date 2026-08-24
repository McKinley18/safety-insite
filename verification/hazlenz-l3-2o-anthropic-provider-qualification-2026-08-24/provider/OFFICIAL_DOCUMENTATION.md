# Official Anthropic provider documentation — consulted 2026-08-24

Every mutable provider assertion below carries its source URL and retrieval date, as
`PROVIDER_REQUIREMENTS.md` requires. **No claim here is written from memory**, and every claim that
could be measured was measured rather than read.

| # | Assertion | Source | Retrieved |
|---|---|---|---|
| 1 | **Commercial API training posture:** *"Anthropic may not train models on Customer Content from Services."* (Section B). Also *"Customer (a) retains all rights to its Inputs, and (b) owns its Outputs."* | https://www.anthropic.com/legal/commercial-terms | 2026-08-24 |
| 2 | **Retention commitment:** *"Retained data is never used for model training without your express permission."* | https://platform.claude.com/docs/en/manage-claude/api-and-data-retention | 2026-08-24 |
| 3 | **Standard API retention:** Anthropic will *"automatically delete inputs and outputs on our backend within 30 days of receipt or generation"* (Anthropic API). | https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-data | 2026-08-24 |
| 4 | **Zero Data Retention:** *"Under a ZDR arrangement, Anthropic does not store customer prompts or responses at rest after the API response is returned."* Requested through the sales team; **enabled per organization**, and enablement does not automatically extend to other organizations. | https://platform.claude.com/docs/en/manage-claude/api-and-data-retention | 2026-08-24 |
| 5 | **ZDR covers the Messages API.** The feature-eligibility table marks **Messages API `/v1/messages` — ZDR eligible: Yes**. HazLenz issues a plain `/v1/messages` call with `output_config.format`; it uses **none** of the ZDR-ineligible features (Batch API, Files API, code execution, programmatic tool calling). | same | 2026-08-24 |
| 6 | **`claude-sonnet-5` is NOT a Covered Model.** Only *"Claude Fable 5 and Claude Mythos 5 … require 30-day data retention and are not available under ZDR."* Sonnet 5 is therefore ZDR-eligible. | same | 2026-08-24 |
| 7 | **ZDR/HIPAA carve-out:** *"if a chat or session is flagged, Anthropic may retain inputs and outputs for up to 2 years."* | same | 2026-08-24 |
| 8 | **Version semantics — the decisive `P-07` claim:** *"Every Claude model ID is a pinned snapshot. … Starting with the Claude 4.6 generation, model IDs use a dateless format that is also a pinned snapshot, **not an evergreen pointer**."* | https://platform.claude.com/docs/en/about-claude/models/overview | 2026-08-24 |
| 9 | **`claude-sonnet-5` lifecycle:** state **Active**, deprecated **N/A**, tentative retirement **"Not sooner than June 30, 2027"**. | https://platform.claude.com/docs/en/about-claude/model-deprecations | 2026-08-24 |
| 10 | **Deprecation notice:** *"providing at least 60 days' notice before model retirement for publicly released models."* | same | 2026-08-24 |
| 11 | **Context / output:** Claude Sonnet 5 — context window **1M tokens**, max output **128k tokens**. Confirmed by the Models API (assertion 15). | https://platform.claude.com/docs/en/about-claude/models/overview | 2026-08-24 |
| 12 | **Structured outputs** are produced by **constrained decoding**, with the documented guarantee *"Always valid: No more `JSON.parse()` errors"* and *"Structured outputs guarantee schema-compliant responses through constrained decoding."* Unsupported keywords include `minLength`/`maxLength`, `maxItems`, numeric bounds, and `minItems` other than 0/1; `additionalProperties` must be `false`. | https://platform.claude.com/docs/en/build-with-claude/structured-outputs | 2026-08-24 |
| 13 | **Pricing:** Claude Sonnet 5 **$2 / MTok input, $10 / MTok output**. The note states the $2/$10 introductory pricing *"is now the standard price"* and *"The previously scheduled increase to $3/$15 … on September 1, 2026 will not occur."* Batch $1/$5; 5m cache write $2.50; cache hit $0.20. | https://platform.claude.com/docs/en/about-claude/pricing | 2026-08-24 |
| 14 | **Rate limits, Claude Sonnet 5** (its own bucket, not shared with Sonnet 4.x): Start tier **1,000 RPM / 2,000,000 ITPM / 400,000 OTPM**; Build 5,000 / 5M / 1M; Scale 10,000 / 10M / 2M. | https://platform.claude.com/docs/en/api/rate-limits | 2026-08-24 |
| 15 | **`temperature`, `top_p`, `top_k` are DEPRECATED** on Claude 4.7 and later and *"Returns a 400 error when set to a non-default value."* There is no `seed` parameter. | https://platform.claude.com/docs/en/about-claude/model-deprecations | 2026-08-24 |

## Measured, not documented — availability and the schema surface

### `claude-sonnet-5` IS CALLABLE — the contrast with `D-67` / §46.2

`GET /v1/models/claude-sonnet-5` → **HTTP 200**, and `POST /v1/messages` → **HTTP 200**. Unlike
`gemini-2.5-pro`, catalogue presence and callability agree. Recorded identity
(`provider/AVAILABILITY_PROBE.json`, retrieved 2026-08-24):

```
id           claude-sonnet-5          display_name  Claude Sonnet 5
created_at   2026-06-29T00:00:00Z     type          model
max_input_tokens 1000000              max_tokens    128000
capabilities.structured_outputs.supported  true
capabilities.thinking.types.adaptive.supported true   (enabled: false)
capabilities.effort  low|medium|high|xhigh|max  all supported
```

A structured-output probe in the same run returned **HTTP 200** with a schema-conformant body, so
`P-01` is measured, not assumed.

### The schema surface was PROBED, not read — and the documentation understates it

Each construct in the shipped HazLenz schema was submitted to the live API
(`provider/SCHEMA_KEYWORD_PROBE.json`, 2026-08-24). Results:

| construct in the shipped schema | sites | live API verdict |
|---|---|---|
| `additionalProperties: false` | 7 | **ACCEPTED** (and required) |
| `enum` (non-empty) | 10 | **ACCEPTED** |
| `type: ["object","null"]` | 3 | **ACCEPTED natively** — no `anyOf` rewrite needed |
| `minLength: 1` | 3 | **ACCEPTED** |
| `minItems: 2` | 1 | **REJECTED 400** — *"'minItems' values other than 0 or 1 are not supported"* |
| `maxItems: 0` | 1 | **REJECTED 400** — *"property 'maxItems' is not supported"* |
| empty `enum: []` | 1 | **REJECTED 400** — *"Enum must be a non-empty array"* |

> **`minLength` is accepted at the wire level.** `PROVIDER_SELECTION.md` predicted on 2026-08-22 that
> both `minLength` and `minItems` would have to be stripped. Measured today, **only `minItems` does**.
> The portability cost is *smaller* than the 2026-08-22 documentation reading, and `type` unions need
> no rewrite at all. (Acceptance is not the same as enforcement; enforcement was not separately
> probed, and does not matter, because the validator enforces it independently.)

# Official Anthropic documentation — retrieved 2026-08-24 by L3-2r

Every assertion carries its source URL and retrieval date, as `PROVIDER_REQUIREMENTS.md` requires.
**No claim is written from memory.** Zero inference requests were made; these are documentation
fetches only, at **$0.00**.

## A — Commercial governance and training posture (`P-05`)

| # | Assertion | Source | Retrieved |
|---|---|---|---|
| A1 | **The Commercial Terms govern API-key use, by their own scope clause:** *"They govern Customer's use of **Anthropic API keys** and any other Anthropic offerings that references these Terms, as well as all related Anthropic tools, documentation and services."* (opening paragraph / §A.1) | https://www.anthropic.com/legal/commercial-terms | 2026-08-24 |
| A2 | **They bind on first access — no separate signature is required:** effective on *"the earlier of the date that Customer first electronically consents to a version of these Terms and the date that Customer **first accesses the Services**."* | same | 2026-08-24 |
| A3 | **Commercial and consumer are mutually exclusive, and the API is the commercial side:** *"Services under these Terms are not for consumer use. Our consumer offerings (e.g., Claude.ai) are governed by our Consumer Terms of Service instead."* | same | 2026-08-24 |
| A4 | **No training, stated unconditionally:** *"Anthropic may not train models on Customer Content from Services."* (§B) | same | 2026-08-24 |
| A5 | **Ownership:** *"Anthropic agrees that Customer (a) retains all rights to its Inputs, and (b) owns its Outputs."* (§B) | same | 2026-08-24 |
| A6 | **Corroborated on the platform docs, which use "Commercial organization" to mean exactly this:** *"an organization under Anthropic's Commercial Terms of Service, as distinct from a consumer Claude account"* | https://platform.claude.com/docs/en/manage-claude/api-and-data-retention | 2026-08-24 |

## B — Retention (`P-06`)

| # | Assertion | Source | Retrieved |
|---|---|---|---|
| B1 | **Conversation content is NOT retained by default:** *"Only what is technically necessary for the feature to work is retained. **Conversation content (your prompts and Claude's outputs) is not retained by default**; the exception is Covered Models, which require 30-day retention."* | https://platform.claude.com/docs/en/manage-claude/api-and-data-retention | 2026-08-24 |
| B2 | **Retained data is never trained on:** *"Retained data is never used for model training without your express permission."* | same | 2026-08-24 |
| B3 | **Shortest practical TTL:** *"Retained data is purged on the shortest practical time to live (TTL)…"* | same | 2026-08-24 |
| B4 | **The one exception that survives every arrangement:** *"Even with ZDR or HIPAA arrangements in place, Anthropic may retain data where required by law or where it has been flagged by Anthropic's automated trust and safety systems. As a result, if a chat or session is flagged, Anthropic may retain inputs and outputs for **up to 2 years**."* | same | 2026-08-24 |

> **B1 is a change from what L3-2o recorded.** L3-2o assertion 3 cited the privacy-centre page for a
> **30-day** default deletion window. The platform documentation now states content is **not retained
> by default at all**, with Covered Models the named exception. This is *stronger* for HazLenz, and it
> is the fact that moves ZDR from "blocking" to "recommended".

## C — Zero Data Retention (`P-06`, ZDR disposition)

| # | Assertion | Source | Retrieved |
|---|---|---|---|
| C1 | **Definition:** *"Under a ZDR arrangement, Anthropic does not store customer prompts or responses at rest after the API response is returned."* | https://platform.claude.com/docs/en/manage-claude/api-and-data-retention | 2026-08-24 |
| C2 | **Acquisition is NOT self-serve:** *"To request ZDR for your organization, contact the Anthropic sales team."* | same | 2026-08-24 |
| C3 | **Per organization:** *"ZDR is enabled **per organization**; each new organization requires ZDR to be enabled separately by your account team, and enablement does not automatically extend to other organizations under the same account."* | same | 2026-08-24 |
| C4 | **Messages API is covered:** *"**Claude Messages and Token Counting APIs:** ZDR applies to these endpoints for eligible features…"*; the eligibility table marks **Messages API `/v1/messages` — ZDR eligible: Yes**. | same | 2026-08-24 |
| C5 | **Structured outputs is `Yes (qualified)`, and the qualification is bounded and harmless here:** *"Your prompts and Claude's outputs are not stored. **Only the JSON schema is cached, for up to 24 hours since last use.**"* | same | 2026-08-24 |
| C6 | **`claude-sonnet-5` is NOT a Covered Model:** *"Claude Fable 5 and Claude Mythos 5 … require 30-day data retention and are not available under ZDR."* Sonnet 5 is not named. | same | 2026-08-24 |
| C7 | **HazLenz uses no ZDR-ineligible feature.** Marked "No": Batch processing, Files/Agent skills, code execution, programmatic tool calling, MCP connector. HazLenz issues a plain `/v1/messages` with `output_config.format` and **none** of these. | same | 2026-08-24 |

## D — Model identity (`P-07`, §45.4)

| # | Assertion | Source | Retrieved |
|---|---|---|---|
| D1 | **Pinned snapshot, stated categorically:** *"**Every Claude model ID is a pinned snapshot.** Models with a date in the ID (for example, `20250929`) are fixed to that specific release. Starting with the Claude 4.6 generation, model IDs use a dateless format that is also a pinned snapshot, **not an evergreen pointer**."* | https://platform.claude.com/docs/en/about-claude/models/overview | 2026-08-24 |
| D2 | **The alias-indirection carve-out does NOT apply to Sonnet 5:** *"For models **before the 4.6 generation**, entries in the Claude API alias column are convenience pointers that resolve to a dated model ID."* Sonnet 5 postdates 4.6. | same | 2026-08-24 |
| D3 | **Sonnet 5's ID and alias are the SAME STRING** — Claude API ID `claude-sonnet-5`, Claude API alias `claude-sonnet-5` — so there is no pointer layer to move. Context **1M**, max output **128k**, pricing **$2 / $10 per MTok**. | same | 2026-08-24 |
| D4 | **Lifecycle:** state **Active**, deprecated **N/A**, tentative retirement *"Not sooner than June 30, 2027"*; *"at least 60 days' notice before model retirement for publicly released models."* | https://platform.claude.com/docs/en/about-claude/model-deprecations | 2026-08-24 (L3-2o, re-confirmed) |
| D5 | **NO content digest, weight hash or checksum is published for any Claude model.** The models overview page publishes IDs, context, output caps, pricing and cutoffs — and no hash of any kind. §45.4's ceiling is real and permanent. | https://platform.claude.com/docs/en/about-claude/models/overview | 2026-08-24 |

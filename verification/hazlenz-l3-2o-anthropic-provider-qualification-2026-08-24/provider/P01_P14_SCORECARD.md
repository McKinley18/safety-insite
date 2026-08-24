# P-01 … P-14 scorecard — Anthropic `claude-sonnet-5`, scored 2026-08-24

Requirements taken **verbatim and unchanged** from
`verification/hazlenz-level3-architecture-2026-08-22/PROVIDER_REQUIREMENTS.md`. **No requirement was
altered after seeing results, and `P-02`'s ≥99% bar was not moved.** `P-05` and `P-06` are the gating
requirements. The Gemini column is L3-2n's recorded result, restated for comparison only and **not
re-run**.

| # | Requirement | `claude-sonnet-5` (Active, pinned snapshot) | best stable Gemini (L3-2n) `*` |
|---|---|---|---|
| P-01 | Reliable structured output | **PASS** — `output_config.format` / `json_schema`, constrained decoding; **0 parse failures in 51 calls** | PASS |
| P-02 | **≥99% valid after ≤1 retry** | **FAIL — 23/24 (95.8%) run A, 22/24 (91.7%) run B.** `F-COR-01` rejects in **both isolated processes**, so the permitted single retry cannot be assumed to rescue it | FAIL — 71% / 83% |
| P-03 | Contextual reasoning quality | **PASS — MODEL tier 13/13 and VALIDATED tier 13/13 on both runs.** `F-WC-09`, `F-WC-03` and `C-CS-05` all correct through the full binder path. **Best validated-tier result recorded for any provider**, tying `gemini-3.1-pro-preview` | PASS — 13/13 model, 7–10/13 validated |
| P-04 | Long-enough context | **PASS** — 1,000,000 in / 128,000 out (Models API); prompts ~6.0k | PASS |
| P-05 | **Zero training on submitted data, contractually** `GATING` | **PASS** — Commercial Terms §B: *"Anthropic may not train models on Customer Content from Services."* **Not tier-conditional**, unlike Google's free/paid split. *Precondition: the credential's organization must be under the Commercial Terms* | PASS on PAID tier only |
| P-06 | **Configurable/short retention, stated window** `GATING` | **PASS** — stated **30 days** by default; **ZDR available on request**, and the Messages API is explicitly ZDR-eligible while `claude-sonnet-5` is **not** a 30-day Covered Model. Residual: flagged content may be held **up to 2 years** | PASS — 55 days + ZDR |
| P-07 | **Pinned, non-silently-updated model id** | **PASS — the strongest hosted result recorded.** *"Every Claude model ID is a pinned snapshot … a dateless format that is also a pinned snapshot, not an evergreen pointer."* Lifecycle **Active**, retirement *"not sooner than June 30, 2027"*, ≥60 days' notice. Still **not a content digest** (§45.4 ceiling stands) | PASS with caveat (*"stable models **usually** don't change"*) |
| P-08 | Deterministic-enough reproduction | **FAIL** — **6 of 24 rows differ** across two isolated processes. `temperature` is deprecated (400 on non-default) and there is **no `seed`**, so **no determinism control exists at all**. Worse than every model previously measured (0/24–3/24) | PARTIAL — 2/24 and 3/24 |
| P-09 | Explicit timeout + retry, client-controllable | **PASS** — client `AbortController` and bounded retry, unchanged from the Ollama contract | PASS |
| P-10 | Documented rate limits for tens of analyses/day | **PASS** — Sonnet 5 has its own bucket; **1,000 RPM / 2M ITPM / 400k OTPM** at the lowest tier. 51 calls, **0 rate-limit errors** | PASS |
| P-11 | Production observability | **PASS at transport** — status, latency, stop reason and token accounting captured per call. **Not implemented in HazLenz** (no hosted adapter exists, §45.6) | same |
| P-12 | Availability/SLA adequate for an advisory surface | **PASS** — **51/51 HTTP 200**, 0 transport failures, 0 truncation (`end_turn` throughout). Catalogue presence and callability agree | FAIL for `gemini-2.5-pro` (404) |
| P-13 | Multimodal available later without re-architecting | **PASS** — `image_input` and `pdf_input` both reported supported by the Models API | PASS |
| P-14 | Predictable cost per analysis | **PASS** — **$0.028 per analysis** measured at $2/$10 per MTok ($1.43 for the whole run). ~7× Gemini's $0.004 but absolutely small, and measured at the **default** effort `high`; lower effort is untested | PASS — $0.004 |

## Verdict

> ### `claude-sonnet-5` — **DISQUALIFIED on `P-02`**, with `P-08` a second, independent failure.

**What Anthropic clears that no other candidate has.** `P-07` is satisfied on documentation that is
categorically stronger than Google's — *pinned snapshot, not an evergreen pointer* — with an Active
lifecycle and a published ≥60-day notice, which is the exact requirement `gemini-3.1-pro-preview`
failed (`D-67`). `P-05` is satisfied **unconditionally** by the Commercial Terms rather than by tier.
`P-12` is satisfied by measurement, which `gemini-2.5-pro` was not. And `P-03` is the **best
validated-tier score any provider has produced on this cohort — 13/13, twice.**

**Why it still fails.** `P-02` requires ≥99% schema-contract validity after at most one retry.
Measured validity is **95.8%** and **91.7%**, and the single rejection common to both runs —
`F-COR-01`, `UNGROUNDED_CORRECTIVE_ACTION` — **reproduces across two isolated processes**, so the
permitted retry cannot be assumed to clear it. **This conclusion does not depend on how `P-02` is
read:** on the strict numeric reading 95.8% < 99%; on L3-2n's applied reading (a non-reproducing
rejection is rescued by retry) the reproducing one still is not. Both readings give FAIL.

**`P-08` fails independently and structurally.** The 6/24 noise floor is not sampling bad luck — it
follows from `temperature` being deprecated and `seed` not existing. An acceptance run must be
re-runnable; on this surface it is not reproducible to the standard the programme has been holding.

**The validator was not touched, and must not be.** `UNGROUNDED_CORRECTIVE_ACTION` is `L3-INV-02`
applied to corrective action, and §46.3 already root-caused it as **provider non-conformance with a
correct, pre-existing contract**. Two providers satisfy it at 23/24, so it is demonstrably
satisfiable. Nothing in HazLenz was changed to make Anthropic pass, and nothing should be.

**`P-05` and `P-06` — the gating pair — are SATISFIED.** Data handling is not the blocker, and on
Anthropic it is *less* conditional than on Google.

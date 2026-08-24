# L3-2 — provider selection

> **Two different decisions are separated here, because conflating them would be the dishonest part.**
>
> 1. **The L3-2 evaluation provider** — the one that had to actually run so this phase could produce
>    measured evidence. **Decided, with measurements.**
> 2. **The production provider for a future customer-authoritative slice.** **NOT decided.** It
>    cannot be, and section 4 says why.

## 1 — The constraint that shaped this

`PROVIDER_REQUIREMENTS.md` fixes the selection procedure: score candidates from current official
documentation, **then run the DEVELOPMENT cohort against the top two**, then choose on *measured*
schema adherence, reasoning quality, latency and cost — "in that order".

Step 2 is not optional, and step 2 needs a credential. On this machine there is none:

| Checked | Result |
|---|---|
| `ANTHROPIC_API_KEY` | unset |
| `ant auth status` (OAuth profile) | `ant` CLI not installed |
| `OPENAI_API_KEY` | present but an 11-character placeholder (`sk-proj-...`), not a key |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | unset (a `GEMINI_MODEL` name is set; no credential) |
| Project `.env` files (9 found) | no AI-provider key in any of them |

Choosing a hosted provider from documentation alone would be a **paper selection** — exactly the
"unverified assertion the programme refuses elsewhere" that `PROVIDER_REQUIREMENTS.md` warns against.
So it was not made.

## 2 — Candidates evaluated

Documentation retrieved **2026-08-22**. Every claim below carries its source.

### Anthropic Claude — the strongest hosted candidate

| Req | Finding | Source |
|---|---|---|
| P-01 structured output | `output_config.format` with `type: json_schema`; **constrained decoding**, not prose parsing | [structured-outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| P-02 schema adherence | Documented as guaranteed: "Always valid… no retries needed for schema violations" | same |
| P-04 context | 1M tokens on the current family | `claude-api` skill model table (cached 2026-06-24) |
| P-06 retention | "we automatically delete inputs and outputs on our backend within 30 days"; **zero-data-retention agreements available** | [retention](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-data) |
| P-07 pinning | Addressable non-dated model ids (`claude-opus-5`, `claude-sonnet-5`) | skill model table |
| P-14 cost | Opus 5 $5/$25 per MTok; Sonnet 5 $3/$15 | skill model table |

**One concrete portability finding, worth recording because it is the kind of thing that only
surfaces when a schema is actually written.** The L3-2 proposal schema uses `minLength: 1` on
`quotedText` and `minItems: 2` on clarification `branches`. Anthropic's structured outputs support
**neither** (`minLength` unsupported; `minItems` supports only 0 and 1). Both would be stripped.
**Nothing is lost**, because `deterministic-safety-validator.ts` enforces both independently — which
is the payoff of having put the guarantee in the validator rather than in the schema. Porting the
adapter is a schema edit, not a redesign.

**Not scored:** P-03 reasoning quality, P-08 reproducibility, latency, failure behaviour. Those
require step 2, and step 2 could not run.

### Other hosted frontier providers

Same blocker, and no credential to resolve it. Not scored, rather than scored from memory.

### Locally hosted model via Ollama — the only executable candidate

| Req | Measured / verified | Evidence |
|---|---|---|
| P-01 structured output | JSON-schema-constrained generation via the `format` parameter | 81 live analyses, 0 parse failures |
| P-02 schema adherence | **100%** — 0 malformed outputs, 0 retries in 81 analyses | `results/holdout-score-1.json` |
| P-03 reasoning quality | 32/32 hazard detection pre-binder; 0 fabricated ACTIVE on 31 negative rows | `results/holdout-score-1.json` |
| P-05 training on inputs | **Structurally impossible** — inference is on-host; nothing leaves the machine | no network egress |
| P-06 retention | **Zero** — no third party receives the observation at all | same |
| P-07 pinning | Content digest `06c1097efce0…`, stronger than a vendor version label | `/api/tags` |
| P-08 reproducibility | temperature 0 + fixed seed → **65 of 66 identical** across two runs | runs 1 vs 2 |
| P-09 timeout/retry | client-controlled `AbortController`; one-retry ceiling | `ollama-reasoning-provider.ts` |
| P-11 observability | per-request `prompt_eval_count` / `eval_count` / latency | telemetry in every record |
| P-14 cost | **$0 marginal**; local compute only | — |
| P-12 availability | single host, no SLA — **a real weakness for production** | — |
| P-13 multimodal | not available on this model — acceptable under `TEXT_FIRST_LEVEL3` | §9 |

## 3 — Selection

**Selected for L3-2's controlled, non-customer-authoritative evaluation:**

| Field | Value |
|---|---|
| Provider | Ollama, local host (server 0.32.5) |
| Model | `qwen3-coder:30b` |
| Pinned identity | sha256 `06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca` |
| Quantization | Q4_K_M, GGUF, 30.5B MoE |
| Inference config | `temperature 0`, `seed 20260822`, `num_ctx 8192`, timeout 60 000 ms |
| Prompt version | `hazlenz.l3.prompt.v1` |
| Adapter | `backend/src/safescope-v2/reasoning-l3/ollama-reasoning-provider.ts` |
| Dependency footprint | **zero** — platform `fetch`; `backend/package.json` dependencies byte-identical to HEAD |

**Why this and not "wait for a credential".** L3-2's question is whether the L3-1 contract can carry
real semantic inference safely. That question is answerable with any real semantic model, and
answering it produced findings that apply to every provider — most importantly that the semantic
binder, not the model, is what currently fails the gate (see `STATUS.md`). Waiting would have
deferred a finding that is provider-independent.

**Honest weaknesses of this choice**, recorded rather than glossed:

* a coding-tuned model is not a safety-domain model; its measured competence here does not transfer;
* one host, no SLA, no rate-limit contract — P-10/P-12 are unmet for production;
* `num_ctx 8192` against a 262 144-token model is a deliberately small controlled window;
* determinism is good but **not perfect** — 1 of 66 scenarios differed across two seeded runs.

## 4 — What stays open

> ### `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

The customer-authoritative provider is **not** chosen by this phase. Closing it needs exactly one
thing that could not be obtained locally: **a credential for at least two hosted candidates**, so
that step 2 of the procedure — the DEVELOPMENT cohort against the top two — can actually run.

The work is otherwise ready: the contract, the adapter boundary, the eval sets, the scorer and the
comparison instrumentation are all provider-agnostic, and porting the adapter is the schema edit
described in section 2.

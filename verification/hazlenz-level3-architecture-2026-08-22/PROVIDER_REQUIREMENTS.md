# Provider requirements — derived before any provider is chosen

**No provider dependency was added and no inference code was written.** Requirements first; a
recommendation is recorded separately and is not binding.

## Hard requirements

| # | Requirement | Why, from measured evidence |
|---|---|---|
| P-01 | **Reliable structured output** — schema-constrained/tool-shaped generation, not prose parsed with a regex | `L3-INV-07`. Parsing prose would rebuild the lexical fragility being removed |
| P-02 | **High schema adherence** — ≥99% valid against a strict schema after ≤1 retry | the L3-2 acceptance gate |
| P-03 | **Contextual reasoning quality** — negation, control state, hypotheticals, corrected conditions, multi-hazard separation | these *are* RC-01/04/07/08 |
| P-04 | **Long-enough context** for observation + inspection context + closed taxonomy + candidate list, with headroom | the input contract is bounded but not tiny |
| P-05 | **Zero training on submitted data**, contractually | §10 privacy boundary |
| P-06 | **Configurable/short retention**, with a stated window | same |
| P-07 | **Pinned model versioning** — an addressable, non-silently-updated model id | reproducibility of an acceptance run; a silent model change would invalidate a passed gate |
| P-08 | **Deterministic-enough reproduction** — temperature control and stable behaviour at fixed settings | evaluation must be re-runnable |
| P-09 | **Explicit timeout + retry semantics**, client-controllable | §6 failure design |
| P-10 | **Documented rate limits** compatible with tens of analyses/day | production traffic is 1 analysis lifetime |
| P-11 | **Production observability** — request ids, usage/token accounting, error taxonomy | telemetry design |
| P-12 | **Availability/SLA** adequate for an advisory (not life-safety-critical) surface | HazLenz is advisory; a hard outage degrades to `ANALYSIS_UNAVAILABLE`, never to a fabricated conclusion |
| P-13 | **Multimodal capability available later**, without re-architecting the seam | `TEXT_FIRST_LEVEL3` now; photo reasoning is a later slice |
| P-14 | **Cost** predictable per analysis at the §Budget targets | |

## Selection procedure (for the phase that chooses)

1. Score candidates against P-01…P-14 from **current official provider documentation**, recording the
   source URL and the retrieval date for every claim.
2. Run the DEVELOPMENT cohort against the top two candidates through the same input contract.
3. Choose on measured schema adherence, reasoning quality on negation/decomposition, latency and cost —
   **in that order**.
4. Record the decision, the pinned model id, and the evidence in the blueprint.

> **Do not choose a provider first and bend the architecture around it.** The seam, the contract and
> the validator are provider-agnostic by construction; `HazLenzReasoningProvider` is an interface with
> one method shape (`analyzeObservation(input) → StructuredReasoningResult`) and transport lives behind it.

## Recommendation (non-binding, to be re-verified against current docs at selection time)

**Shape, not vendor:** a frontier model exposing first-class **structured-output / tool-use**
generation, an addressable pinned version, and enterprise data-handling terms that include
no-training-on-inputs and a configurable retention window.

**Candidates to evaluate first:** Anthropic Claude and the other major frontier providers offering
schema-constrained output and enterprise terms.

> **No provider claim is asserted here.** This phase deliberately records **no** model ids, pricing,
> context limits, latency figures or contractual terms, because any such claim written from memory
> would be exactly the unverified assertion the programme refuses elsewhere. The selecting phase must
> read current official documentation, record the source URL and retrieval date for every P-01…P-14
> claim, and run step 2 above before committing.

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


---

# SUPERSEDING CRITERIA — added by L3-2p (2026-08-24) `ADDITIVE`

> **Nothing above this line has been altered.** `P-01`…`P-14` stand verbatim as written on
> 2026-08-22, and every provider result recorded under them — `L3-2n` (`D-69`), `L3-2o` (`D-71`,
> `D-72`) — stands exactly as measured, under the requirements in force when it ran. The criteria
> below **supersede `P-02` and `P-08` for provider qualification from L3-2p forward**; they do not
> replace the text above and they do not re-score history.

Adjudication and full derivation:
`verification/hazlenz-l3-2p-provider-requirements-adjudication-2026-08-24/STATUS.md`.
Blueprint §48; decisions `D-73`, `D-74`, `D-75`.

**Why they were refined — two measurement defects, not two provider failures:**

1. **`P-02` names a schema and was applied as a validator.** Its text requires *"≥99% valid against
   a strict schema"*; the qualification scorers counted `validationState !== 'VALID'`, i.e. whole-
   proposal acceptance by `deterministic-safety-validator.ts`, which enforces semantic properties no
   schema keyword can express. Measured over 147 rows and five providers, `SCHEMA_INVALID` fired
   **zero** times — `P-02` **as written** has a perfect record. On a 24-row cohort `≥99%` is also
   arithmetically `zero rejections`, making a *quality threshold* operate as a *hard-zero gate*,
   which §29.8 keeps deliberately distinct. And the aggregate cannot distinguish a rejection that
   destroys a high-consequence hazard from one that destroys nothing: `qwen3-coder:30b` (1 HC hazard
   destroyed) and `claude-sonnet-5` run A (0 destroyed) both score **95.8%**.
2. **`P-08` requires model-output determinism; the architecture requires safety-outcome
   determinism.** No `L3-INV` mentions determinism, and `L3-INV-08` makes model output a proposal
   until validation succeeds. Measured: a provider with **no determinism control of any kind**
   reproduced **every material safety outcome on 24/24 rows** across two isolated processes, while
   two providers that *did* accept `temperature` each moved a material safety axis. Separately, the
   `6/24` figure in `D-72` was computed under an **8-field key** against baselines recorded under a
   **6-field key**; on the baselines' own key the same runs give **3/24**.

## `P-02R` — SAFETY-WEIGHTED VALIDITY

| axis | requirement | source |
|---|---|---|
| **A** schema conformance after ≤1 retry | **≥99%** — retained verbatim from `P-02` as written | `P-02`, `L3-INV-07` |
| **B** safety-consequential validator rejections | **ZERO** — no rejection on a row whose ground truth owes a hazard. **Stricter than `P-02`** | §29.8 hard gates |
| **C** high-consequence retention, VALIDATED tier | **100%** | `D-58`, standing `L3-3` gate |
| **D** false ACTIVE | **ZERO** | §29.8, `L3-INV-04` |
| **E** clarification recall, **both** denominators | **100%** | `D-58`, `L3-INV-06` |
| **F** evidence-integrity and authority codes — every member of `NON_RETRYABLE_VALIDATION_REASONS` | **ZERO occurrences.** Absent from `P-02` entirely | `L3-INV-01`, `-02`, `-03`, `-09`, `-11` |
| **G** auxiliary proposal conformance (safety-preserving rejections) | **TRACKED AND REPORTED, NOT GATED.** Code, row and count recorded in every qualification artifact; a rising rate is a reportable §29.6 availability cost. **No threshold**, because none is derivable | §29.8's threshold/gate distinction |

> **The deterministic validator is unchanged and every rejection still occurs identically. No
> rejected proposal reaches a customer. `P-02R` changes only how QUALIFICATION INTERPRETS a rejection
> the pipeline already contained safely.**

## `P-08R` — VALIDATED SAFETY-OUTCOME REPRODUCIBILITY

| axis | requirement |
|---|---|
| **A** material safety outcomes across two runs in **isolated processes** (§38.3) | **100% identical.** Material = high-consequence disposition · false ACTIVE · clarification obligation on both denominators · final validated condition state · customer-visible hazard existence · evidence grounding · authority boundary |
| **B** provider sampling controls (`temperature`, `seed`) | **RECORD, DO NOT REQUIRE.** A provider offering none is not disqualified if it satisfies **A**; one offering them and still failing **A** *is* disqualified |
| **C** model identity | **`P-07` UNCHANGED**, and §45.4's content-digest ceiling stands |
| **D** comparison-key discipline | **MANDATORY.** Every reproducibility figure states the exact field list it was computed over, and cross-provider comparison recomputes **every** baseline under the **same** key |

**Explicitly NOT safety pass/fail axes:** wording, rationale prose, evidence-span selection among
supporting spans, candidate ordering, auxiliary corrective-action text, rejected non-authoritative
fields, and the derived `outcome` label where underlying candidate states are identical.
**Hazard-decomposition granularity is tracked and reported, not gated** — a real `RC-04` product
axis with no §29.8 hard gate and no derivable threshold.

> **This refinement is not a response to a provider failing a requirement.** It disqualifies
> `gemini-3.7-flash`, `gemini-3.6-flash` **and the local incumbent `qwen3-coder:30b`** on axes
> **B**/**C**, leaves `gemini-3.1-pro-preview` disqualified on the untouched `P-07`, and leaves
> `claude-sonnet-5` short on a *different* axis — clarification precision `5/6`, which has no
> pre-registered threshold and whose adjudication is a product decision. **`PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.**


## `P-09R` — CLARIFICATION QUALIFICATION CRITERION — added by L3-2q (2026-08-24) `ADDITIVE`

> **`P-01`…`P-14` contained NO clarification criterion at all.** `P-09R` is not a relaxation of
> anything; it is the first time clarification appears in provider qualification, and three of its
> four axes are **hard gates at zero or 100%**. Adjudication:
> `verification/hazlenz-l3-2q-clarification-precision-adjudication-2026-08-24/STATUS.md`.
> Blueprint §49; decisions `D-76`, `D-77`, `D-78`.

| axis | requirement | source |
|---|---|---|
| **A** questions on the `CLARIFICATION_MUST_NOT_ASK` pole | **ZERO. HARD GATE.** A question on a scenario whose pole forbids one is a contract regression and disqualifies | the cohort's own named pole (`C-CS-05`, `F-CL-04`) |
| **B** decision-boundary conformance — `UNRESOLVED_DECISION_NOT_DECISION_CRITICAL` and `INVALID_CLARIFICATION_DEPENDENCY` | **ZERO occurrences. HARD GATE.** | `L3-INV-06` as the validator states it; §34.2 |
| **C** clarification recall, **both** denominators | **100%. HARD GATE, unchanged** | `D-58`, and `P-02R` **E** |
| **D** aggregate clarification precision | **TRACKED AND REPORTED AS A QUALITY KPI, NOT AN ELIGIBILITY GATE.** Every unnecessary question is recorded with its scenario id **and its pole**; poles are never summed into one number (`D-58`) | §29.8 places no clarification rate in the hard-zero list; §44.4 treats unnecessary questions as a measured cost |
| **E** the `L3-3` entry gate | **UNCHANGED.** Clarification **precision AND recall both 100%** on **FRESH SEALED** evidence remain required before L3-3 may start | the standing `L3-3 must not start until` gate |

**Why D is a KPI and not a gate — measured, not argued.** `L3-INV-06` governs *where* a question may
be raised, and that boundary is enforced **deterministically** by §34.2's gate and the binder's
`clarificationBelongsHere`, so a question that breaches it is refused before anyone sees it. The one
unnecessary question in the whole record — `claude-sonnet-5` on `B08` — was **accepted** by that gate,
because `B08` carries an undecided candidate for the question to attach to, and `B08`'s pole is
`REGRESSION_ACTIVE`, **not** `CLARIFICATION_MUST_NOT_ASK`. It changed no hazard disposition, no false
ACTIVE, no high-consequence outcome, deleted nothing, and delivered **more** hazards (5 and 4) than
any other provider returned on that row (2). Meanwhile `gemini-3.7-flash` scored a perfect 5/5 on that
same row **by having its proposal rejected and delivering no hazard at all** — which is what an
aggregate precision rate rewards if it is used as a safety gate.

> **`E` is the load-bearing clause.** Eligibility under `P-09R` says a model may sit the sealed
> acceptance exam. It is not a prediction that the model will pass it. If clarification precision on
> fresh sealed evidence is below 100%, **`L3-3` does not start** — exactly as pre-registered.

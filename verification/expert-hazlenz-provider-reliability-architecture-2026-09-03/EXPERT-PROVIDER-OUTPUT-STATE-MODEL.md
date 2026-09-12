# EXPERT PROVIDER OUTPUT STATE MODEL

§155. Development prototype. Implemented in `backend/scripts/lib/expert-provider-response-state.ts`
as `hazlenz.expert.provider-response-state.v1`. Nothing here is wired to production.

---

## The measurement that requires a state model

Across §152, §153 and §154 — three hosted draws of identical frozen material — **four of forty-eight
row-executions returned content no reviewer would call an answer**:

| draw | row | what came back |
|---|---|---|
| §152 | HS-A1 | `candidateKey: "placeholder"`, `summary: "placeholder"`, `evidenceBasis: ""`, `reasoning: ""` |
| §153 | HS-A1 | `candidateKey: "x"`, `summary: "summary placis a a placeholder"` — beside a candidate carrying 455 characters of genuinely substantive prose and a correctly quoted span |
| §153 | HS-K1 | `summary: "placeholder"`, zero candidates, zero clarifications |
| §154 | HS-K1 | `summary: "placeholder"`, zero candidates, zero clarifications |

**All four were recorded `PRESENT`.** HTTP returned 200, the JSON parsed, the wire schema was
satisfied, and `normalizeExpertOutput` returned `VALID`. Nothing was broken: a malformed *item* is
item-scoped by deliberate design (§105), so a junk candidate is dropped and the rest of the analysis
survives — which is correct behaviour and is exactly why the junk was invisible.

The conclusion is narrow and load-bearing:

> **Transport success and schema success, together, do not establish that a usable semantic response
> exists.**

Two further facts shape the model. First, the four are **not one shape**: three carry nothing
substantive anywhere, while §153's HS-A1 carries a real candidate with real evidence under a garbled
summary and a meaningless key. A policy that assumes "degenerate" means "empty" would discard
genuine content. Second, §154's HS-K1 is a FORBIDDEN row, where silence is the correct answer — so
its degenerate response produced *accidentally correct customer behaviour*. Correct output for the
wrong reason is not reliability, and nothing downstream could tell the difference.

---

## The five states

Ordered from "nothing usable arrived" to "usable, with a named reason to look again". The order is
also the classification precedence: a response that never arrived cannot also be degenerate.

### 1. `TRANSPORT_FAILURE`

No valid provider response was produced. Covers `TIMEOUT`, `NETWORK_ERROR`, `HTTP_CLIENT_ERROR`,
`HTTP_SERVER_ERROR`, `RATE_LIMITED`, `CREDITS_EXHAUSTED`, `EMPTY_RESPONSE`, `TRUNCATED_RESPONSE`,
`PROVIDER_NOT_CALLABLE`, `NOT_CONFIGURED`, and also `PROVIDER_REFUSAL` and
`UNEXPECTED_MODEL_IDENTITY` — in the last two a payload may exist, but nothing attributable to the
qualified model was produced, and `expert-runner.ts` already refuses both before the boundary.

*Customer effect:* fail open for availability, fail closed for authority. The inspection continues on
deterministic HazLenz with an empty advisory block.

### 2. `SCHEMA_FAILURE`

A response exists and cannot satisfy the wire schema or the normalization boundary: `MALFORMED_JSON`,
`SCHEMA_INVALID_STRUCTURED_OUTPUT`, or any `OUTPUT_REJECTED` layer status.

A note on `MALFORMED_JSON`: it is a schema failure *in this model* — a response arrived and could not
be read — while `expert-provider.ts` lists it as retryable. These do not conflict. **The state model
describes what came back; the retry list decides what to do.** §155 changes neither.

*Customer effect:* identical to `TRANSPORT_FAILURE`. Fail closed for authority.

### 3. `DEGENERATE_SEMANTIC_OUTPUT`

Structurally processable, and not a substantive model answer. Convicted only by the frozen detector
`hazlenz.expert.degenerate-output-detector.v2`, on two independent structural signals or on the one
unambiguous signal `ALL_PROSE_IS_PLACEHOLDER`.

> **THIS MUST NEVER BE COLLAPSED INTO `SCHEMA_FAILURE`.** On the evidence the schema was satisfied
> every single time. Merging them would mean the four observed failures continue to be reported as
> successes, which is the exact defect §153 built the detector to see.

A **SUSPECT** row — exactly one signal — is *not* this state. It is reported and used, and excludes
nothing from any denominator. §153 fixed that rule and §155 does not touch it.

*Customer effect:* the subject of the degenerate policy — see `EXPERT-POSTCONDITION-BOUNDARY.md` and
`backend/scripts/lib/expert-degenerate-policy.ts`. In a scored run: fail closed, denominator loss
reported, never a rerun.

### 4. `SUBSTANTIVE_VALID_OUTPUT`

Structurally and semantically non-degenerate, with no deterministic postcondition warning. The
ordinary case: 27 of the 48 stored executions.

> **A WRONG ANSWER LANDS HERE, AND THAT IS CORRECT.** §154's HS-H1 asked nothing about the fact the
> authored truth says decides the action, and it is `SUBSTANTIVE_VALID_OUTPUT`. Being wrong is a
> model defect measured by scorers and adjudication. This state model measures whether an answer was
> produced at all, and conflating the two would let a reliability layer start grading reasoning.

### 5. `SUBSTANTIVE_VALID_OUTPUT_WITH_POSTCONDITION_WARNING`

Usable, and one or more deterministic reliability postconditions found something worth recording: an
unresolved link, a meaningless identifier, a duplicate key, a candidate asserting a state with
neither quote nor basis, or a wholly empty analysis.

> **A WARNING IS NOT A REJECTION.** This state is delivered. The warning's only powers are to reach
> operator observability and, for the one member that raises a genuine semantic question (a wholly
> empty analysis), to make the response eligible for selective verification.

---

## Classification precedence

```
failureKind ∈ TRANSPORT_SHAPED        → TRANSPORT_FAILURE
failureKind ∈ SCHEMA_SHAPED           → SCHEMA_FAILURE
layerStatus == OUTPUT_REJECTED        → SCHEMA_FAILURE
layerStatus != PRESENT                → TRANSPORT_FAILURE
detector convicts                     → DEGENERATE_SEMANTIC_OUTPUT
postcondition warnings present        → SUBSTANTIVE_VALID_OUTPUT_WITH_POSTCONDITION_WARNING
otherwise                             → SUBSTANTIVE_VALID_OUTPUT
```

## What the classifier is forbidden to do

It reads no meaning, judges no hazard, decides no policy, and cannot request a provider call. It is a
pure function over facts other layers produced. Policy lives in `expert-degenerate-policy.ts`;
escalation lives in `expert-selective-verification-trigger.ts`; both take this classification as
input and neither can reach back into it.

## Why it lives under `scripts/`

`SOURCE_PROJECT_TSC` compiles `src/` with a `rootDir` that excludes `scripts/`, so **production code
cannot import any of this even by accident** — the guarantee is enforced by the compiler rather than
by a convention someone can forget. §151 hit the same boundary from the other side, when a fixture
under `src/` imported a type from `scripts/` and broke the build; the fix was to invert the
dependency, and the same discipline applies here. Promoting any of this into `src/` is a separate
operation under its own authorization.

## Verification

`backend/scripts/test-expert-reliability-architecture.ts` — cases A–P, 69 assertions, 0 failures,
0 provider calls. Cases B and C assert directly that a degenerate response is not relabelled a schema
failure and that all four stored degenerate responses classify as `DEGENERATE_SEMANTIC_OUTPUT`; cases
D and E assert that a legitimate empty response and a substantive-but-wrong response are not.

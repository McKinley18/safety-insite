# §155 — Provider-Output Reliability Architecture + Selective Clarification Verification Design

**TERMINAL:**

    EXPERT_HAZLENZ_DEGENERATE_OUTPUT_POLICY_PROVEN —
    SELECTIVE_VERIFICATION_DESIGN_REQUIRES_FURTHER_WORK

Zero provider calls. Zero production files changed. Nothing deployed, enabled, or wired.

---

## 1. Why this terminal and not another

Phase 11 offers four. Each was tested against the evidence rather than chosen by preference.

**`..._ARCHITECTURE_PROVEN — BOUNDED_HOSTED_RETRY_VERIFICATION_EXPERIMENT_AUTHORIZATION_REQUIRED`**
requires the degenerate policy established, the selective verifier boundary established, and the
local prototype passing. Two of three hold. The verifier *contract* is established and locally
proven — 69 assertions, including that it cannot touch candidates, citations or deterministic
output. The verifier *trigger* fails one of Phase 6's own three credibility criteria: **11 of 22
valid FORBIDDEN executions escalate**, which is routine escalation by any reading.

**`..._SELECTIVE_VERIFICATION_INCONCLUSIVE — ARCHITECTURAL_REDESIGN_REQUIRED`** is for a trigger that
cannot be made precise without semantic overreach. Half its condition holds — the trigger cannot be
made precise, and §155 established *why* rather than failing to find out. But the result is not
inconclusive: the trigger's behaviour is measured on all 44 valid executions, its blind spots are
named in advance, and the open question is whether 34% escalation at ~81% of a first-pass cost each
is worth its yield. **That is a product decision, not an architectural impossibility.** Redesign is
not what the evidence asks for.

**`..._PROVIDER_RELIABILITY_INSUFFICIENT — PROVIDER_STRATEGY_REVIEW_REQUIRED`** is explicitly not to
be selected from 4/48 development observations, and it is not selected.

So: the degenerate half is proven and ready for a bounded hosted experiment; the verification half
has a measured design with a stated gap. That is the second terminal exactly.

---

## 2. Provider output state model

Full document: `EXPERT-PROVIDER-OUTPUT-STATE-MODEL.md`. Implementation:
`backend/scripts/lib/expert-provider-response-state.ts` (`hazlenz.expert.provider-response-state.v1`).

Five states — `TRANSPORT_FAILURE`, `SCHEMA_FAILURE`, `DEGENERATE_SEMANTIC_OUTPUT`,
`SUBSTANTIVE_VALID_OUTPUT`, `SUBSTANTIVE_VALID_OUTPUT_WITH_POSTCONDITION_WARNING` — with degenerate
never collapsed into schema failure, because **all four observed degenerate responses satisfied the
schema and were recorded `PRESENT`**.

Two facts from Phase 0 that shaped it and are worth carrying forward:

- **The four are not one shape.** Three carry nothing substantive; §153's HS-A1 carries a real
  candidate with 455 characters of prose and a correct quote, under `summary: "summary placis a a
  placeholder"` and `candidateKey: "x"`. A policy assuming "degenerate means empty" would discard
  genuine content.
- **§154's HS-K1 is a FORBIDDEN row.** Its degenerate response produced *accidentally correct*
  customer behaviour — silence, for no reason at all. Correct output for the wrong reason is not
  reliability, and nothing downstream could tell the difference.

---

## 3. Degenerate policy: recommendation

**OPTION C LAYERED ON OPTION B** — one bounded reissue, then fail closed.
`backend/scripts/lib/expert-degenerate-policy.ts`.

| option | assessment |
|---|---|
| A — accept with disclosure | **Rejected.** A candidate keyed `"placeholder"` shown to a customer is worse than nothing: it looks like an analysis. `expert-provider.ts` deliberately has no result member meaning "degraded but usable", and disclosure does not repair a broken advisory |
| B — fail closed | **Kept as the floor.** Safe, free, and already the shape of the existing contract. Insufficient alone: HS-A1 was degenerate in §152 and §153 and clean in §154; HS-K1 was clean in §152 and degenerate in §153 and §154. Junk on this draw is not evidence the model cannot answer this observation |
| C — one bounded reissue | **Recommended, on B.** A degenerate response asserted *nothing*, so there is no refusal to erode — unlike a REJECTED normalization, which `expert-runner.ts` refuses to retry for exactly that reason |
| D — second provider | **Not implemented, not selectable.** Needs a second qualified model; falling back to an unqualified one makes every result unattributable, which is what `UNEXPECTED_MODEL_IDENTITY` exists to prevent |

Six non-negotiable conditions, each answering a failure this programme has already seen:

1. The trigger is the deterministic detector and nothing else — no "looks thin" heuristic.
2. The reissued request is **byte-identical**. A reissue that rewords the prompt is a second
   experiment, not a retry.
3. **At most one.** No loop, no third request.
4. **Both attempts preserved** — raw response, cost and detector verdict. The ledger is append-only
   by construction (`appendAttempt` spreads and never indexes), because a replacement must never
   erase the evidence that the original event occurred.
5. A second degenerate result **fails closed**. It does not accept, disclose, or ask again.
6. **Off in every scored run.** `purpose: 'EVALUATION' | 'PROBE'` can only ever return
   `FAIL_CLOSED_NO_REISSUE` — a silent reissue would replace the observation being measured and
   quietly improve the score. §153 and §154 both took denominator loss instead, which is correct
   behaviour for an instrument.

Failing closed means what the merge contract already means by it: empty advisory block, deterministic
findings and governed citations untouched, **inspection continues**.

---

## 4. Safe deterministic postconditions and the semantic boundary

Full document: `EXPERT-POSTCONDITION-BOUNDARY.md`. The test each check must pass: *could a careful
engineer disagree with the verdict on the same bytes?*

**SAFE (9):** degenerate structural output · unresolved clarification link · clarification
contradicting an ACTIVE candidate (§139's condition restated, not re-decided) · required-object
completeness · meaningless identifier · evidence reference integrity · duplicate candidate key ·
collection relationship well-formedness · wholly-empty-analysis (the *fact*).

**SEMANTIC_JUDGMENT_REQUIRED (6):** is an empty analysis correct · is a retained unknown
decision-critical · does the question address the highest-value unknown · is the affectedDecision
label correct · is the reasoning sound · is the response too short.

Two of these were actively refuted rather than merely classified. `IS_THE_AFFECTED_DECISION_LABEL_
CORRECT` was measured in §148 corrupting labels that were already right. `IS_THE_RESPONSE_TOO_SHORT`
has a real correlation — the four degenerate executions produced 473, 637, 287 and 240 output tokens
against per-draw medians near 1,400 — and is still not a rule, because §152's HS-K1 produced 2,325
tokens and was clean while a correct silence is short by nature.

---

## 5. Selective verification trigger

`backend/scripts/lib/expert-selective-verification-trigger.ts`. Two conditions:
`T_RETAINED_UNKNOWN_WITHOUT_QUESTION` and `T_WHOLLY_EMPTY_ANALYSIS`.

Measured over the 44 non-degenerate executions in §152–§154:

|  | fires | catches (of 5 LOOSE misses) | escalates FORBIDDEN |
|---|---|---|---|
| `T_RETAINED_UNKNOWN_WITHOUT_QUESTION` | 14/44 | 3 | 11/22 |
| `T_WHOLLY_EMPTY_ANALYSIS` | 2/44 | 1 | 1/22 |
| **union** | **15/44 (34.1%)** | **4 of 5** | **11/22** |
| successful REQUIRED rows escalated | **0 of 17** | | |

**The central finding is negative and it decides the architecture.** A correct retention and an
incorrect one are structurally identical — HS-H1 (a miss), HS-J1 and HS-R1 (both correct) all
produce an unresolved candidate, a stated uncertainty, no question, and an explicit denial of
decision-relevance. Nothing deterministic separates them. So the trigger *cannot* be precise, and
making it precise is the semantic overreach §148 already measured and rejected. Its honest job is to
identify the population cheaply and hand the judgement to something that can judge.

**Two conditions were measured and rejected**, and both refutations are recorded in code:

- `T_UNLINKED_QUESTION` (a clarification emitted but none linking the unresolved candidate) fires
  6/22 REQUIRED and 0/22 FORBIDDEN — perfect specificity, and it catches **zero** of the five
  observed misses. All six executions delivered a clarification and score as successes. Whether any
  is a STRICT miss is a human adjudication that has not been performed, so no yield may be claimed.
- `T_OUTPUT_TOKEN_FLOOR` — see §4.

**Two of the five observed miss shapes are categorically unreachable** by any retained-uncertainty
trigger, and this is a property of the design rather than a tuning problem:

- §152 HS-H1 spoke a fluent, well-formed question about the wrong fact. A response that confidently
  answers the wrong question looks exactly like one that answers the right one.
- §153 HS-E1 raised a candidate at CORRECTED, stated no uncertainty, asked nothing. It had *settled*
  the fact rather than retained it, so there is nothing retained to trigger on.

---

## 6. Verifier contract

`backend/scripts/lib/expert-verifier-contract.ts` (`hazlenz.expert.verifier.v1`).

Receives: the observation, governed evidence as supplied to the first pass, deterministic findings,
the first-pass result, the *specific* unresolved facts the trigger named, and any postcondition
warnings. Returns exactly one of `VERIFIED_AS_IS` · `ADD_OR_REPLACE_CLARIFICATION` ·
`NO_CLARIFICATION_REQUIRED` · `ABSTAIN`, with a rationale and at most one proposed clarification.

It cannot regenerate the analysis because there is no field for one — the same construction
`expert-provider.ts` uses, where authority is bounded by what the return type can express. §101 and
§105 both measured what whole-analysis regeneration costs: nine of ten iterations returned nothing at
all when a single bad item condemned everything.

`ABSTAIN` and `NO_CLARIFICATION_REQUIRED` are **distinct members and must never be merged**.
`NO_CLARIFICATION_REQUIRED` asserts the unknown does not change what is done now; `ABSTAIN` asserts
nothing. Collapsing them turns "I could not tell" into "it is fine", which is precisely the move
§149 spent an operation removing from the first-pass prompt. The trigger escalates a population
where correct and incorrect retention are indistinguishable, so a verifier forced to choose on every
escalation would manufacture verdicts on exactly the cases it cannot separate.

The verifier may not declare its own linkage: linkage is resolved at the normalization boundary
against candidates that actually exist (§141).

---

## 7. HS-H1 and HS-E1 stored replay

**HS-H1** — R1 does not escalate; R2 and R3 do. The architecture states this in advance rather than
discovering it: R1's failure was a fluent question about the wrong fact, which exposes no signal.
Were the verifier to run on R2 and R3, it would be handed `cand-pressure-verify` (INSUFFICIENT_
EVIDENCE) and the uncertainty statement about gauge/alarm verification. **Could it distinguish the
chamber-instrument distractor from the cooling-hold fact?** It is given the observation and the
deterministic findings, so the load-side fact is *available* to it — but nothing in §155 demonstrates
it would find what three first passes never mentioned (`cool`, `cooling hold` and `boil` appear
nowhere in any draw). That is an open empirical question and it is stated as one.

**HS-E1** — R1 delivered the question and does not escalate. R2 does not escalate: a CORRECTED
candidate, no uncertainty, no question, nothing retained — the settled-silence blind spot. R3 *does*
escalate, on `T_WHOLLY_EMPTY_ANALYSIS`, and correctly: it returned nothing at all under a summary
that reasoned the state closed.

**False positives on valid rows:** 0 of 17 successful REQUIRED executions escalate. **FORBIDDEN:**
11 of 22 — the criterion that fails.

---

## 8. Cost and latency

`backend/scripts/analyze-expert-reliability-cost-model.ts`. Prices are **solved from the recorded
runs**, not looked up: §153 and §154 issued identical prompts (292,688 input tokens each), so the
cost delta is pure output — **$10.000 per 1M output**, and the remainder gives **$2.000 per 1M
input**. Checked against §152, which was not used in the derivation: predicted $0.827866 vs recorded
$0.827866, delta $0.000000.

Observed per first-pass call: 18,293 in / 1,347 out / **$0.05006**.

**One assumption, labelled:** a verifier call carries the same observation and evidence plus the
first-pass result (~600 extra input tokens) and returns ~300 output tokens → **$0.04079**. No
verifier has ever run.

> **A VERIFIER COSTS ~81% OF A FIRST PASS, NOT A FRACTION OF ONE.** Input dominates and barely
> changes; only output shrinks. Selective verification's economy comes entirely from being
> selective, and any design that trims the verifier's *output* is optimising the cheap half.

Per 100 Expert analyses, at the observed development frequencies (4/48 degenerate, 15/44 escalation):

| scenario | extra calls | total | vs baseline |
|---|---|---|---|
| A. no verification, no reissue | 0 | $5.01 | baseline |
| B. reissue on degenerate only | 8.3 | $5.42 | +8.3% |
| C. selective verification only | 34.1 | $6.40 | +27.8% |
| D. both | 42.4 | $6.81 | +36.1% |
| E. universal two-pass | 100 | $9.08 | +81.5% |

Observed first-pass latency across 48 executions: min 5.7s, median 15.7s, max 38.2s. B adds one
round trip on ~8% of analyses; C on ~34%; E on every one — the only option that changes the
product's latency profile rather than a subset's.

**The bound is structural, not budgetary.** Under D, one analysis issues at most three provider
requests: first pass, at most one reissue if and only if the detector convicts, at most one verifier
call. There is no path to a fourth, and a degenerate response is never escalated to a verifier, so
the two paths cannot compound.

*4/48 and 15/44 are development observations from sixteen rows, three draws, one model, one prompt
version. They are not production rates.*

---

## 9. Observability

`backend/scripts/lib/expert-reliability-counters.ts`. Twelve counters, with invariants asserted
mechanically (more reissues than degenerate responses, more verifier calls than triggers, and so on).

`DEVELOPMENT_PROVIDER_REQUEST_COUNT_CUMULATIVE` is **`null`** and stays null until a real
append-only ledger exists. Summing the runs by hand would produce a figure no artifact attests;
§155 designs the field and does not invent the number.

**`HISTORICAL_PROVIDER_INVOCATION_COUNT` is deprecated for new development evidence.** It was copied
verbatim into nine probes since 2026-09-02 and never advanced, so it excludes §152–§154. The concept
is renamed rather than repaired, because the number was never wrong for what it actually is:

    FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT = 195

— the immutable count of the historical formal evaluation (`FORMAL_EVALUATION_FAIL`, not accepted,
cohort spent). It is a historical constant, never a running total, and mutating it is an invariant
violation the acceptance matrix asserts. **No historical artifact was edited to add any counter.**

---

## 10. What still has to happen before a hosted verifier experiment

1. **Decide whether 34% escalation is acceptable** at ~81% of a first-pass cost each, given that
   precision on observed misses is 4 of 15 and that the verifier — not the trigger — is what turns
   escalations into value. This is the product decision the terminal names.
2. **The two blind spots stay open** whatever is decided: a fluent question about the wrong fact, and
   a settled silence. Neither is reachable from a retained-uncertainty signal.
3. **The verifier's own accuracy is entirely unmeasured.** Every figure here describes the trigger.
   Whether a second pass can separate HS-H1's distractor from the cooling-hold fact is unknown, and
   a bounded hosted experiment on stored escalations is the way to find out.
4. **The degenerate half does not need the verifier and could be authorized independently.** It is
   deterministic, bounded at one reissue, off in scored runs, and its whole acceptance matrix passes.

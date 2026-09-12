# §210D — MINIMAL RESIDUAL-REMEDIATION HOSTED CONFIRMATION, EXECUTION REPORT

## Result

**`EXPERT_HAZLENZ_RESIDUAL_SEMANTIC_REMEDIATION_REQUIRES_REVIEW`**

18 of 21 frozen evaluation questions PASS. Three fail, on three different cases and three different
axes. DEVELOPMENT evidence only.

## Counters

| | |
|---|---|
| Provider calls | 5, each frozen case drawn exactly once |
| Calls reaching inference | 5 |
| Transport failures | 0 |
| Any call reaching `max_tokens` | no |
| Semantic retries / rescue calls / second draws | 0 |
| Verifier calls / governed-stage calls | 0 |
| Replacement cases / post-output truth edits | 0 |
| Database operations | 0 |
| Commits / pushes / tags / deploys | 0 |
| Cumulative spend | **USD 0.3526** against a USD 0.55 ceiling |
| Prompt caching | disabled |

Instruction transmitted: `hazlenz.expert.first-pass-instruction.210c-R1-R3`, plain identity
`b243c323af82031c6f733af80f456c4bc61d52efafd89b5c25806a5d8a83b0e6`, asserted against the authorized
value immediately before every transmission. All five requests capability-ABSENT; the governed
variant was never sent. Frozen preregistration unmodified at
`55510f9cc4e9424d543332e1c2f5db5a86d26757adba28d21730cc882420f30f`.

## The two checks the authorization singled out — both PASS

**Critical interaction check.** D3.Q1 and D5.Q4 both PASS. D3 emitted zero declarations and did not
use the crane lift planned next month to manufacture present divergence. D5 emitted exactly one
declaration — the owed present-state property — and did not declare the night-shift training.

Neither degenerate strategy is present: the model did not obtain restraint by suppressing everything,
and did not obtain recall by emitting everything.

**Destructive-repair check.** D1.Q4 PASSES. The property became complete by enrichment; nothing was
removed from `branchA`, `branchB`, `decisionIfA`, `decisionIfB` or the clarification.

## Adjudication summary

Declaration counts matched frozen expectations on **every** case: D1 1/1, D2 1/1, D3 0/0, D4 2/2,
D5 1/1. All three failures are semantic.

| Axis | Result |
|---|---|
| A REQUIRED_FACT_RECALL | PASS |
| B FALSE_GAP_RESTRAINT | PASS |
| C EXACT_PROPERTY | **FAIL** (D1) |
| D CONJUNCT_QUALIFIER_COMPLETENESS | PASS |
| E PROPERTY_REASONING_CONSISTENCY | **FAIL** (D2, axis-level) |
| F CLARIFICATION_DECLARATION_BINDING | **FAIL** (D2) |
| G CURRENT_ACTION_COUNTERFACTUAL_RESTRAINT | PASS |
| H INDEPENDENT_FACT_PRESERVATION | PASS |
| I FACT_LOCAL_DECISION_CONTAINMENT | **FAIL** (D4) |

- **D1.Q1** — the property conjoins a prohibited check-history proxy ("was measured") with the
  correct sufficiency property, and `branchB`'s "and/or" lets the missing record alone trigger the
  stop decision.
- **D2.Q2** — a BLOCKING clarification with no authored `answersUnresolvedFactDeclarationId`, on a
  case whose declaration exists. D1, D4 and D5 all bound theirs correctly.
- **D4.Q3** — both positive decisions say "drilling may proceed" while the other independent fact is
  still open, without the frozen containment qualifier.
- **D2, axis E** — the declaration carries `decisionIfA: "unused"`, `branchB: "placeholder"`,
  `decisionIfB: "placeholder"` verbatim in the raw response. No branch structure, no decision
  divergence. Structurally valid because `minLength` is stripped by the frozen §108 transport
  adaptation; semantically empty.

Full reasoning in `ADJUDICATION-210D.md`.

## Token report

Caching was deliberately disabled, so `cacheCreationInputTokens` and `cacheReadInputTokens` are both
**NOT_APPLICABLE — CACHING_DISABLED**. Absent provider cache fields in this run are not evidence
about cache effectiveness.

| Case | Input tokens | Output tokens | Cost USD | Stop reason |
|---|---:|---:|---:|---|
| D1 | 24,988 | 2,676 | 0.0767 | tool_use |
| D2 | 24,984 | 1,557 | 0.0655 | tool_use |
| D3 | 25,037 | 282 | 0.0529 | tool_use |
| D4 | 24,969 | 3,229 | 0.0822 | tool_use |
| D5 | 25,027 | 2,515 | 0.0752 | tool_use |

| Quantity | Value |
|---|---|
| Calls attempted / reaching inference | 5 / 5 |
| Transport failures | 0 |
| Logical input tokens, total | 125,005 |
| Output tokens, total | 10,259 |
| Median input tokens | 24,988 |
| Median output tokens | 2,515 |
| Cumulative spend | USD 0.352601 |
| Cost per observation | USD 0.0705 |
| Projected spend | USD 0.3916 |
| Hard ceiling | USD 0.55 — not approached |

**Comparison with §210B-3B.** Median input rose from 24,034 to 24,988, a delta of **+954 tokens**
against the §210C estimate of +1,001. That is broadly consistent, and no more than broadly: the
§210D observations are different texts with different lengths and different per-case schema enums, so
this is not a controlled measurement of the static delta and no precision is claimed from it.
Median output fell from 2,824 to 2,515, which is a property of these cases rather than of the
instruction.

**No production token economics are claimed.** Five development cases do not establish them.

## Executor defect

**EXECUTOR_DEFECT_1** — the executor projected the clarification back-reference under
`relatesToDeclarationId` instead of `answersUnresolvedFactDeclarationId`, recording `PROPERTY_ABSENT`
on every case. A derived-view defect only: request bodies were unaffected, every case was transmitted
as frozen, and no re-draw was needed. Corrected by re-deriving from the persisted raw into
`PROJECTION-210D-CORRECTED.jsonl`, with the original preserved, following the §208 precedent.

The correction changed one verdict, and against the instruction rather than in its favour: it
revealed that D1, D4 and D5 bound correctly and only D2 did not. Recorded in
`EXECUTOR-DEFECT-REGISTER-210D.md`.

## S6 and the governed limit

S6 remains **NOT_EXERCISED**. Nothing in §210D bears on it. The recommendation stands: governed
evidence stays in the separate governed stage rather than the first-pass capability-present grammar,
and first-pass grammar validation is not weakened to make it fit.

## Evidence

| File | Contents |
|---|---|
| `CALL-LEDGER-210D.jsonl` | one row per call: identities, transport status, usage, cost, failure class |
| `RAW-FIRST-PASS-210D.jsonl` | raw provider response, persisted before any derivation |
| `PROJECTION-210D.jsonl` | original projection, preserved, carries EXECUTOR_DEFECT_1 |
| `PROJECTION-210D-CORRECTED.jsonl` | re-derived from raw; the projection adjudication reads |
| `TOKEN-REPORT-210D.json` | the token report above, as data |
| `ADJUDICATION-210D.md` | per-question and per-axis verdicts with basis |
| `EXECUTOR-DEFECT-REGISTER-210D.md` | EXECUTOR_DEFECT_1 |

## Stopped

Execution, adjudication and reporting are complete. Nothing was tuned. No failure was remediated. No
case was rerun. No verifier was run. No acceptance cohort was created. No historical evidence was
altered.

Because §210D is not clean, the authorization's "if clean, stop changing the first-pass instruction"
branch does not apply, and neither does the move to targeted verifier validation. The next step is a
product-owner decision, not an engineering one.

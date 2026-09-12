# §191 — Repair 1: the three schema field descriptions

**Evidence class: MECHANICAL.** This repair rests on §188's mechanical findings alone and does not
depend on any adjudication. It is the only one of the three that stands regardless of what the
frozen human semantic gate eventually says.

---

## The defect, restated from mechanical evidence

Two of fifteen §187B executions — `HR-08 R2` and `HR-01 R3` — emitted `BOUND_BY_CLARIFICATION` with a
`bindingFactKey` and `clarificationSourceMode: SUPPLIED_FACT` under verdict `VERIFIED_AS_IS` with
`proposedClarification: null`. Both were refused whole, four codes each.

§188 established mechanically that this was **not a malformed output**. All four fields agree with
each other under one coherent reading — *the fact is answered, by a clarification, which is the one
already on the record, concerning a supplied fact rather than a nominated one* — and the schema not
only permits that state but its own descriptions point at it. Verified mechanically: the schema
contains no `if`, `then`, `else`, `oneOf`, `anyOf`, `allOf`, `not`, `dependentRequired` or
`dependencies`, so every illegal combination is schema-valid.

---

## 1a — `bindingFactKey`

**Defect: `AGENT_NEUTRAL_AND_VERDICT_INDEPENDENT`.**

> *v3:* "The factKey of the supplied unresolved fact **this question** answers…"

"This question" names neither the **agent** nor the **verdict**. Under `VERIFIED_AS_IS` the question
in play is the first pass's, and it does answer the supplied fact — so the description, read
literally, instructs the model to fill the field exactly as both refused outputs filled it.

> *v3.1:* "…answered by **THE CLARIFICATION YOU ARE PROPOSING IN THIS RESPONSE** … Null unless
> verdict is `ADD_OR_REPLACE_CLARIFICATION` — a question the **FIRST PASS** already asked is not a
> binding, and no other verdict may name a key here."

Scopes the agent, scopes the verdict, and names the exact misreading that occurred.

## 1b — `clarificationSourceMode`

**Defect: `SELF_CONTRADICTORY`.** This is a defect in the artifact on its own terms, present
independently of any model behaviour.

> *v3:* "Required on `ADD_OR_REPLACE_CLARIFICATION`, **null otherwise**. **Must agree with which of
> `bindingFactKey` and `nominatedFact` are present.**"

The two sentences give opposite answers the moment `bindingFactKey` is non-null under a non-`ADD`
verdict: the first demands `null`, the second demands `SUPPLIED_FACT`. **Both refused outputs
resolved the contradiction toward the second sentence** — which is also the sentence the admission
validator implements, as `SOURCE_MODE_DISAGREES_WITH_THE_PAYLOAD`.

> *v3.1:* "**Null unless** verdict is `ADD_OR_REPLACE_CLARIFICATION`. When the verdict **IS**
> `ADD_OR_REPLACE_CLARIFICATION` this field is required, and it must **then** agree with which of
> `bindingFactKey` and `nominatedFact` are present. **These are not two competing rules:** the
> verdict decides whether the field is populated at all, and only then does the payload decide which
> member."

Orders the two rules instead of stating them side by side, and says so explicitly.

## 1c — `owedFactDeclarations[].declaration`

**Defect: `NO_DESCRIPTION_AT_ALL`.** The enum token `BOUND_BY_CLARIFICATION` reached the model bare,
stripped of the system prompt's *"the question **you are supplying**"* scoping — while its sibling
`challengeReason` carried a description. Asserted in the proof suite at A.13: v3's `declaration`
node has `description === undefined`.

> *v3.1:* "`BOUND_BY_CLARIFICATION` means the clarification **YOU** are proposing in **THIS**
> response answers this fact … **IF THE FIRST PASS ALREADY ASKED A QUESTION THAT REACHES THIS FACT,
> THAT IS NOT A BINDING — record `STILL_UNRESOLVED`**, because the fact stays owed until someone
> actually answers it … `CHALLENGE_FACT_VALIDITY` is a request for human review and settles
> nothing."

**This is also where §188's missing vocabulary member is addressed without adding one.** §188 found
the contract has no token meaning *"the first pass's question already reaches this fact"* — precisely
the conclusion instruction step 3 drives the model toward. Thirteen of fifteen executions recorded it
as `STILL_UNRESOLVED`; two reached for `BOUND_BY_CLARIFICATION`. Rather than add a fourth enum
member — which needs its own authorization and sits one step from a token that could clear the
ledger — the description now **names the existing token** that records that conclusion, and says why
it is the right one.

---

## What was not changed, and why

**The admission validator is untouched.** It is the hard, fail-closed deterministic guard and it
worked: both illegal outputs were refused **whole**, no owed fact was settled or removed, no coverage
warning cleared, `PROVIDER_SETTLEMENT_AUTHORITY` stayed `NEVER`. The §187B failure cost **yield** —
2 of 15 executions discarded — not safety. Proof suite A.1–A.4 re-assert the refusals against the
unchanged validator; A.14 asserts its source hash.

**No JSON-Schema conditionals.** They would make the state provider-side invalid, but whether
`if`/`then`/`dependentRequired` are honoured on this tool path is unverified in this repository —
§107 already had to diagnose provider handling of schema keywords on the first-pass wire schema, so
silent non-enforcement is a live possibility rather than a theoretical one. Verifying it costs
provider calls that §191 does not authorize.

**No normalization, no partial admission.** Coercing the illegal declaration would make runs pass
while destroying the evidence that the model asserted a binding. A partly-valid verdict is not a
partly-correct one, and refusing whole is what leaves every owed fact where it was.

---

## Deterministic coverage — section A, 17 assertions

| assertion | proves |
|---|---|
| A.1–A.3 | the exact §187B refused shape is still refused, all four codes, settling nothing |
| A.4 | the same illegal binding is refused under `NO_CLARIFICATION_REQUIRED` too |
| A.5 | `STILL_UNRESOLVED` under `VERIFIED_AS_IS` is **ADMITTED** — the route 1c names |
| A.6–A.7 | a genuinely new clarification **with** a binding is admitted, and its binding admitted |
| A.8–A.9 | `bindingFactKey` is response-scoped and says a first-pass question is not a binding |
| A.10 | `clarificationSourceMode` no longer carries the bare contradiction |
| A.11–A.12 | `declaration` now has a description naming all three states |
| A.13 | v3's `declaration` had **no** description — the defect being repaired |
| A.14 | the admission validator source is byte-unchanged |

The shapes are rebuilt on a **generic invented key**, not on the cohort's, so the test measures the
contract rule rather than replaying two specific rows.

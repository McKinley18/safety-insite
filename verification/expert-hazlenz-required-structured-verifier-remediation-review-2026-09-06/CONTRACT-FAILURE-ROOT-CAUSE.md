# §188 — Root cause: the two contract-invalid verifier outputs

**Read-only review. No source was modified. Zero provider calls. Zero database operations.**

Scope: why `HR-08` replicate 2 and `HR-01` replicate 3 produced `BOUND_BY_CLARIFICATION` with a
`bindingFactKey` under verdict `VERIFIED_AS_IS` and no `proposedClarification`.

---

## 1. What was actually emitted

Both payloads, from `RESUMED-VERIFIER-EXECUTIONS.jsonl`, rationale elided:

```jsonc
// HR-08 #2                                    // HR-01 #3
{                                              {
  "verdict": "VERIFIED_AS_IS",                   "verdict": "VERIFIED_AS_IS",
  "clarificationSourceMode": "SUPPLIED_FACT",    "clarificationSourceMode": "SUPPLIED_FACT",
  "proposedClarification": null,                 "proposedClarification": null,
  "bindingFactKey": "owed:energy:auger_…",       "bindingFactKey": "owed:fire:burner_…",
  "nominatedFact": null,                         "nominatedFact": null,
  "owedFactDeclarations": [                      "owedFactDeclarations": [
    { "factKey": "owed:energy:auger_…",            { "factKey": "owed:fire:burner_…",
      "declaration": "BOUND_BY_CLARIFICATION",       "declaration": "BOUND_BY_CLARIFICATION",
      "challengeReason": null }                     "challengeReason": null }
  ]                                              ]
}                                              }
```

Refused whole, four codes each:

```
BINDING_DECLARED_BY_A_NON_ADD_VERDICT
SOURCE_MODE_PRESENT_WITHOUT_A_CLARIFICATION
BINDING_KEY_PRESENT_WITHOUT_A_CLARIFICATION
BOUND_DECLARATION_WITHOUT_A_CLARIFICATION
```

**The first thing to notice is that this is not a malformed output.** Every one of the four fields
agrees with the other three under a single coherent reading: *the fact is answered, by a
clarification, which is the one already on the record, and that clarification concerns a supplied
fact rather than a nominated one.* All four refusal codes are the same rule stated four times —
**only a clarification supplied in THIS response may bind** — and none of them is a shape error in
the ordinary sense. Nothing was truncated, mistyped, hallucinated or duplicated.

The rationales confirm the reading rather than contradicting it. HR-01 #3:

> The first-pass analysis already asked the question that reaches this exact fact […] That
> question, if answered, directly resolves `owed:fire:burner_flame_failure_safeguard_function_verified`.

HR-08 #2:

> The first-pass clarification asks exactly this question […] An answer to that question would
> settle the supplied fact one way or the other.

Both models concluded *this fact is bound to an existing question* and then looked for the field in
which to say so.

**Separate this from target selection.** Both named the **correct** supplied key. There is no
mis-targeting in these two observations, and the two facts must be recorded apart:

| property | HR-08 #2 | HR-01 #3 |
|---|---|---|
| `VERIFIER_RESPONSE_CONTRACT_VALID` | FALSE | FALSE |
| `TARGET_SELECTION_WRONG` | FALSE | FALSE |

---

## 2. Does the schema permit this state combination?

**Yes — and its own field descriptions license it.**

`VERIFIER_V3_RESPONSE_SCHEMA` (`expert-verifier-instruction-v3.ts:222`) is a flat object. The four
fields that jointly encode the refused state are declared independently, and the schema contains no
`if`, `then`, `oneOf`, `anyOf`, `allOf`, `not` or `dependentRequired` — no keyword of any kind that
relates one property's value to another's. Every combination of

```
verdict ∈ {4}  ×  clarificationSourceMode ∈ {3, null}  ×  bindingFactKey ∈ {string, null}
               ×  proposedClarification ∈ {object, null}  ×  declaration ∈ {3}
```

is schema-valid. The illegal states are not merely representable; nothing in the schema hints that
they are illegal.

Worse, three of the descriptions actively point at the refused output:

**`bindingFactKey`** — *"The factKey of the supplied unresolved fact **this question** answers."*
"This question" names no agent and no verdict. Under `VERIFIED_AS_IS`, the question in play is the
first pass's, and it does answer the supplied fact. The description, read literally, instructs the
model to fill the field exactly as both models filled it.

**`clarificationSourceMode`** — *"Required on `ADD_OR_REPLACE_CLARIFICATION`, null otherwise. Must
agree with which of `bindingFactKey` and `nominatedFact` are present."* These two sentences
contradict each other the moment `bindingFactKey` is non-null under a non-`ADD` verdict: the first
demands `null`, the second demands `SUPPLIED_FACT`. Both models resolved the contradiction toward
the second sentence — which is also the sentence the admission validator implements as
`SOURCE_MODE_DISAGREES_WITH_THE_PAYLOAD`. **This is a defect in the artifact itself, present
independently of any model behaviour.**

**`declaration`** — carries **no description at all**. `challengeReason` next to it has one. So the
enum token `BOUND_BY_CLARIFICATION` reaches the model bare, stripped of the scoping the system
prompt gives it.

---

## 3. Does the prompt describe the legal combinations clearly enough?

Partly. The scoping exists, but it is a single relative clause, and the prompt simultaneously drives
the model toward the conclusion the scoping forbids it from recording.

Step 6 (`expert-verifier-instruction-v3.ts:157`):

> `BOUND_BY_CLARIFICATION` — The question **you are supplying** answers THIS fact.

Agent-scoped, correctly. But step 3 (`:88`) tells the model:

> **IS IT ALREADY ASKED.** If the first pass emitted a question that would actually reach the fact
> in step 2, **the work is done.**

And step 5 (`:131`) defines the resulting verdict as:

> `VERIFIED_AS_IS` — The first pass asked a question that reaches the decision-changing fact.

So the instruction asks the model to determine precisely the relation *(this fact) ← (that
question)*, tells it that determining it positively completes the task, and then offers three
bookkeeping tokens of which **none denotes that relation**:

| the model's step-3 conclusion | contract token that says it |
|---|---|
| the first pass's question reaches this fact | **— none —** |
| I am supplying a question that reaches it | `BOUND_BY_CLARIFICATION` |
| I am not answering it | `STILL_UNRESOLVED` |
| it should not have been raised | `CHALLENGE_FACT_VALIDITY` |

`STILL_UNRESOLVED` is the contract-correct choice and thirteen of fifteen executions made it. But
it under-describes: the fact *is* still unresolved in the sense that nobody has answered it, and it
is *not* unaddressed. Two of fifteen resolved that mismatch the other way. **This is a missing
vocabulary member, not a random failure**, which is why the two failures are identical in shape and
why both carry coherent rationales rather than confusion.

---

## 4. Is `BOUND_BY_CLARIFICATION` semantically overloaded?

Yes, in the precise sense that the token names a *relation* without naming the *agent* of one of its
relata, while the prompt places two candidate clarifications in front of the model at once — the
first pass's (printed under `FIRST-PASS ANALYSIS — CLARIFICATIONS ASKED`) and the model's own
prospective one. English "bound by clarification" is silent about whose. The disambiguation lives in
one clause of step 6 and nowhere in the schema.

## 5. Does `VERIFIED_AS_IS` conflict with `BOUND_BY_CLARIFICATION`?

**Structurally, yes** — four admission codes, deliberately.

**Semantically, they are two encodings of the same judgement at different scopes**, which is the
deeper problem. `VERIFIED_AS_IS` is *defined* as "the first pass asked a question that reaches the
decision-changing fact" — that is itself an assertion that the fact is bound to a clarification.
The verdict and the declaration make the same claim; only one of them is allowed to. A model that
states its conclusion in both places is being redundant, not contradictory, and the contract
punishes the redundancy as though it were a contradiction.

## 6. Should impossible combinations become unrepresentable, or should admission remain the guard?

**Admission must remain the guard.** It behaved exactly as designed: it refused each verdict whole,
no owed fact was settled or removed, no coverage warning was cleared, and
`PROVIDER_SETTLEMENT_AUTHORITY` stayed `NEVER`. Fail-closed worked. The failure here is a **yield**
failure — 2 of 15 executions, 13.3%, discarded — not a safety failure.

Two things must not be done in the name of fixing it:

- **Do not normalize the state away.** Coercing `BOUND_BY_CLARIFICATION` to `STILL_UNRESOLVED` when
  the verdict is not `ADD` would make the runs pass while destroying the evidence that the model
  asserted a binding. A downstream stage that rewrites model output before it is recorded produces
  output that was never delivered.
- **Do not add partial admission.** A partly-valid verdict is not a partly-correct one, and refusing
  whole is what leaves every owed fact where it was.

## 7. Can deterministic structure eliminate this class without granting settlement authority?

Yes — and it can be done without the model gaining any new power, because nothing proposed below
lets the model assert that a fact is answered. Recommended in order, smallest first.

### R1 — Repair the schema field descriptions. *Recommended as the whole of the first remediation.*

Three edits inside `VERIFIER_V3_RESPONSE_SCHEMA`, no structural change, no new field, no new enum
member, no change to the admission validator:

1. `bindingFactKey` — scope "this question" to the response: *"the clarification **you are proposing
   in this response**. Null unless `verdict` is `ADD_OR_REPLACE_CLARIFICATION`."*
2. `clarificationSourceMode` — remove the internal contradiction. It is a defect on its own terms.
3. `declaration` — give it the description it lacks, naming the agent for
   `BOUND_BY_CLARIFICATION` and stating that a question already asked by the first pass is recorded
   `STILL_UNRESOLVED`.

This targets the demonstrated cause: both models followed the descriptions literally, and the
descriptions were wrong. It grants nothing. It costs one hash — the schema identity moves, so v3
results before and after are not one population.

### R2 — Make the state unrepresentable in TypeScript.

`ExpertVerifierV3Output` is currently a flat interface, so HazLenz-side code can *construct* the
illegal state too. A discriminated union on `verdict` closes that at compile time. Zero provider
risk, zero wire change, protects the architecture rather than the provider.

### R3 — JSON-Schema conditional constraints. *Not recommended yet.*

`if`/`then`/`dependentRequired` would make the state provider-side-invalid. Whether they are honoured
on this tool path is **unverified in this repository**; §107 already had to diagnose provider
handling of schema keywords on the first-pass wire schema, so silent non-enforcement is a live
possibility rather than a theoretical one. Verifying it costs provider calls that §188 does not
authorize. Hold R3 until R1 has been measured.

### R4 — A fourth declaration member. *Not recommended.*

A member meaning "already reached by the first pass's question" would give the step-3 conclusion its
own legal home. It is the most complete fix and the most dangerous: it is one careless step from a
token the model can use to say a fact is covered. If it is ever taken, it must be typed the way
`CHALLENGE_FACT_VALIDITY` already is — a statement that changes no status, `settles: false` as a
literal — and it needs its own authorization. It should not be bundled with R1.

---

## What this section does not decide

Whether either refused execution was *semantically* correct about its owed fact. Both named the
right key; whether the first-pass question they deferred to actually reaches the owed property is
`CLARIFICATION_TARGET_CORRECT`, and that is a human axis, pending.

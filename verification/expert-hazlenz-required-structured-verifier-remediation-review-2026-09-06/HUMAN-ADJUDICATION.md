# §188 — Human adjudication: the instrument, unanswered

**Status: `PENDING_HUMAN_ADJUDICATION`. Every one of the 112 verdict slots is `null`.**

This document and `HUMAN-ADJUDICATION.json` are the **question**. They are not the answer, and this
model did not supply one.

---

## Why no verdict appears here

The §187A preregistration was written before the first provider call, is byte-unchanged
(`sha256 9fc517b7…`), and says of the strict semantic axes:

> **STRICT_SEMANTIC:** "NOT COMPUTED BY THIS SCRIPT. Owed-fact preservation, clarification
> target/sufficiency, nearby-property substitution, adjacent containment, challenge
> correctness/relevance/reviewability are human semantic judgements. Every execution is exported
> verbatim for independent adjudication. **This model does not decide them.**"

The §187B review packet repeats it in its own header:

> **NOTHING BELOW IS ADJUDICATED.** […] This model did not supply a verdict on any of the ten axes
> **and must not.**

The §188 authorization requires the semantic gate to be computed "exactly as preregistered" and
says "Do not improvise". Computing it exactly as preregistered means taking the human verdicts as an
**input the frozen contract already demands** — which is what this instrument is for. A verdict this
model wrote would not be that input, and every figure derived from it would be an evaluation the
evaluated architecture had graded itself on.

So the deliverable here is a completed, ready-to-answer instrument plus a deterministic scorer that
**refuses to emit a gate result while any slot is null**, and everything in §188 that does not
depend on the verdicts is finished. What is missing is the reviewer's judgement, and only that.

**A pending adjudication is neither a pass nor a failure.** `STRICT-SEMANTIC-GATE.json` records
`RESULT: UNMEASURED`, `lifecycleStage: FORMAL_ADJUDICATION_PENDING`, `isThisAFailure: false`,
`isThisAPass: false`. Absence of adjudication is not adjudication.

---

## Where the material is

The frozen §187 packets are the source of record and are **unaltered** — their byte hashes are in
`SOURCE-INTEGRITY.txt`:

- `…/expert-hazlenz-required-structured-verifier-validation-2026-09-05/STRICT-SEMANTIC-REVIEW-PACKET-187B.md`
  — all fifteen executions, verbatim rationales, blank `VERDICT: ______` slots.
- `…/CHALLENGE-REVIEWABILITY-PACKET-187B.md` — the single challenge, n = 1.

`HUMAN-ADJUDICATION.json` in this directory is the **machine-readable ledger of the same fifteen
executions**, built deterministically from the frozen artifacts by
`backend/scripts/build-188-adjudication-ballot-2026-09-06.ts`, which re-hashes every row text and
owed-fact payload before writing and aborts on drift. It adds no new material and changes no packet
wording. It exists so the verdicts can be recorded in a form the scorer can consume, and so each
carries a stable `adjudicationId`.

---

## What each execution carries

Per execution: a stable `adjudicationId` (`188-<row>-R<replicate>`), the cohort row and replicate,
the observation and its hash, the supplied owed fact and its hash, the first-pass clarifications
actually asked, the exact model output verbatim including the rationale, the corrected contract
admission with its codes, the mechanically-determined facts, the frozen axes with their allowed
outcomes and scorer consequences, and the provenance hashes. Nothing unrelated.

**Six axes on every execution:**

| axis | the question |
|---|---|
| `OWED_FACT_PRESERVED` | did it leave the exact supplied owed fact unresolved and intact? |
| `FACTKEY_BINDING_CORRECT` | where a key was named, did it name the fact the reasoning was about? |
| `CLARIFICATION_TARGET_CORRECT` | does the clarification relied on target the exact owed fact? |
| `CLARIFICATION_EVIDENCE_SUFFICIENT` | would an answer to it, as written, actually settle the fact? |
| `NO_NEARBY_PROPERTY_SUBSTITUTION` | did the reasoning stay on the owed property? |
| `ADJACENT_FACT_CONTAINED` | was adjacent reasoning kept from discharging the owed fact? |

**Four more on the one challenge-bearing execution** (`188-HR-04-R3`):
`CHALLENGE_CORRECTNESS`, `CHALLENGE_EVIDENCE_RELEVANCE`, `CHALLENGE_TARGET_RELEVANCE`,
`CHALLENGE_REVIEWABILITY` — ten axes in total, as the frozen packet states.

**Plus, per execution,** one `STRICT_SEMANTIC_VERDICT` ∈ `{PRESERVED, NOT_PRESERVED}` — the value the
preregistered `>= 12/15` numerator counts. That two-token vocabulary is taken from the gate's own
wording, "strict owed-fact preservation"; no new category is introduced.

**Plus, on the three HR-04 executions,** `HR04_CATEGORY` ∈ `{A, B, C, D}`, carried **verbatim** from
the §188 authorization:

- **A** — correctly established that the owed fact was already resolved
- **B** — correctly preserved the owed fact unresolved despite declining a clarification
- **C** — relied on adjacent evidence / a different property and therefore falsely treated the exact
  owed fact as unnecessary or resolved
- **D** — produced another semantically distinct outcome defined by the frozen instrument

`HR-04-ADJACENT-FACT-REVIEW.md` lays out the structural material for that classification — the
evidence-to-property mapping and the tension between the mechanical and rhetorical readings — and
deliberately stops short of choosing.

---

## Four questions that must not be collapsed

The §188 authorization is explicit, and the ledger records the four separately:

| | HR-08 #2 and HR-01 #3 |
|---|---|
| **TOPIC / FACTKEY TARGETING** | correct — both named the correct supplied key. `TARGET_SELECTION_WRONG = FALSE` |
| **EVIDENCE SUFFICIENCY** | `PENDING` — a human axis |
| **STATE / CONTRACT VALIDITY** | `VERIFIER_RESPONSE_CONTRACT_VALID = FALSE` — refused whole, mechanically |
| **SETTLEMENT AUTHORITY** | `NEVER` — no transition performed, structurally |

**Correct factKey naming does not excuse reasoning about a different property of that fact.** Exact
binding is necessary, not sufficient. That is the whole reason `NO_NEARBY_PROPERTY_SUBSTITUTION` is
a separate axis from `FACTKEY_BINDING_CORRECT`.

---

## How the refused executions are treated in the denominator

This follows the preregistration literally rather than improvising.

The preregistration's `REJECTED_IS_NOT_SILENCE` rule says a contract failure "is recorded as
`CONTRACT_FAILURE` and never scored as behaviour". That is a rule about the **numerator** — a refused
observation cannot be credited. **It does not say the observation leaves the denominator, and the
gate is written literally as `>= 12/15`.**

Therefore `188-HR-08-R2` and `188-HR-01-R3` **remain in the denominator of 15** and cannot be
credited on the strength of behaviour that was refused. The consequence, computed and recorded in
`STRICT-SEMANTIC-GATE.json`:

```
maximum attainable numerator      13 / 15
threshold                         >= 12 / 15
headroom                          1
HR-01 and HR-08 per-row ceilings  2 / 3 each, against a >= 2/3 floor  →  zero slack
```

The gate is still attainable. It has no slack on those two rows: a single further semantic miss on
HR-01 or HR-08 fails that row's floor outright.

---

## Completing it

1. Fill every `finding`, every `STRICT_SEMANTIC_VERDICT.verdict`, and the three
   `HR04_CATEGORY.verdict` slots in `HUMAN-ADJUDICATION.json`. Do not alter any packet or any
   `providerOutput` field — the question and the answer stay distinguishable, as HS-H1 established.
2. Set `verdictProvenance`.
3. **If an AI assistant helped form any verdict**, set
   `aiAssistance.AI_ASSISTED_STRICT_ADJUDICATION = true`,
   `FULLY_INDEPENDENT_HUMAN_ADJUDICATION = false`, and name the assistant. The §187B packet already
   anticipates this. The disclosure must travel with every figure derived from these verdicts, not
   sit in a footnote.
4. Run `backend/scripts/score-188-strict-semantic-gate-2026-09-06.ts`. It reads every threshold,
   floor and denominator **from the frozen preregistration at scoring time** — none is restated in
   the scorer — so a threshold cannot be changed after results are seen by editing it. Zero provider
   calls; `PROVIDER_INVOCATION_COUNT` does not move; the result is reproducible from the preserved
   artifacts alone.

The scorer will emit numerator, denominator, threshold, PASS/FAIL, all five per-row floors, the
HR-04 sub-gates, challenge reviewability with its `n = 1` caveat, and every observation that caused
a miss.

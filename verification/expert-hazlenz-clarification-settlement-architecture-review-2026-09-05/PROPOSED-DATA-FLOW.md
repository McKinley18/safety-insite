# §180 — PROPOSED DATA FLOW (DESIGN ONLY, NOT IMPLEMENTED)

Nothing here is built. This is the shape the review recommends be *authorized* for a later bounded
integration, expressed precisely enough to be argued with.

The design principle throughout: **make the settlement step representable, checkable and reviewable —
without making it deterministic.**

---

## The added step, in one line

Today a fact leaves `UNRESOLVED` only by being asked about. The proposal adds the second exit that
the ledger already declares and cannot reach: a fact may leave `UNRESOLVED` because the evidence
settled it — but only through a *declared, structurally checked, human-reviewable* route, never on
the provider's say-so.

## Proposed order of operations

```
1  owed fact exists in the closed ledger                          [today]
2  settlement target identified
      = acceptableEvidence.requirement, or explicitly ABSENT      [reuses today's field]
3  facts + targets projected to the provider                      [today]
4  provider returns, PER FACT, a settlement declaration:
      evidenceObserved      verbatim span of the observation
      evidenceEstablishes   free text: what property that span establishes
      settlementAssessment  SETTLED_CLAIM | UNRESOLVED | PROPERTY_MISMATCH_CLAIM
      unresolvedReason      free text
   plus, unchanged, the existing bookkeeping declaration and any bindingFactKey
5  verifier applies STRUCTURAL checks only                        [new admission codes]
6  exact factKey coverage checked structurally                    [today]
7  a fact still UNRESOLVED may carry a clarification              [today]
8  the clarification independently passes the decision-critical test [today, prompt-side]
9  adjacent hazards remain additive candidates                    [today]
```

Steps 1, 3, 6, 7 and 9 exist. Step 2 reuses an existing field. **Steps 4 and 5 are the whole
proposal**, and step 5 is deliberately small.

## What a `SETTLED_CLAIM` may and may not do

This is the load-bearing rule, and it is the one that keeps the design honest.

> **A provider claim of settlement never moves the ledger.** It mints an
> `ArbitrationRequest`-shaped object — `settles: false`, `factStatusUnchanged: true` — exactly as
> `CHALLENGE_FACT_VALIDITY` does today. The fact stays `UNRESOLVED` and its clarification
> entitlement is unchanged.

`SETTLED_BY_EVIDENCE` is reachable only by an `ADMISSIBLE_EVIDENCE` transition, and the *only*
proposed producer of that authority is a recorded **human review** of a settlement claim, in the
development population. No provider path and no deterministic path mints it.

The queue that today has a producer and no consumer therefore gains a consumer — a review surface —
rather than gaining an automatic approver.

## The structural checks that are legitimately available

Each is a property of *form*, not of meaning. Nothing below reads the question text, compares strings
for similarity, or scores overlap.

| check | why it is structural |
|---|---|
| `evidenceObserved` is a byte-verbatim span of the observation | byte equality; precedent `NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM` |
| every supplied fact receives exactly one settlement declaration | set arithmetic over supplied keys |
| all declaration fields present and non-blank | presence |
| a fact may not be simultaneously `SETTLED_CLAIM` and carry a binding | contradiction between two declared values |
| a `SETTLED_CLAIM` on a fact whose `acceptableEvidence` is null is flagged `SETTLEMENT_CLAIMED_WITHOUT_GOVERNED_CRITERION` | provenance of HazLenz state, not model output |
| no HazLenz-owned field is echoed back | existing `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` |
| `settlementAssessment` is a member of the closed set | enum membership |

**What is NOT checked, and must never be:** whether `evidenceEstablishes` actually equals the owed
property. That is `CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED`, and a
deterministic version of it is the matcher §160 retired.

## Why this changes anything at all

It does not make the model reason better. It makes the reasoning **land somewhere**.

On HR-04 today, the model's conclusion — presence plus a historical torque check establishes current
control — exists only as a sentence in a summary nobody parses. Under the proposal the same
conclusion becomes:

```
factKey            <the guarding fact>
evidenceObserved   "The fixed guard over the head drum nip point is in position."
evidenceEstablishes "the guard is physically fitted"
settlementAssessment SETTLED_CLAIM
```

which is (a) refusable if the span is not verbatim, (b) flagged if no governed criterion exists,
(c) **visible to a human reviewer beside the owed requirement**, and (d) incapable of suppressing the
clarification on its own, because the fact stays `UNRESOLVED`.

That is a diagnosis surface and a safety brake. It is not a fix, and the review does not claim it is.

## When `acceptableEvidence` is null or weak

Both cases must **fail transparently rather than invent a criterion**.

- **null** — the target is projected as explicitly absent. A settlement claim against it is recorded
  and flagged; it may not reach `SETTLED_BY_EVIDENCE` at all, because there is nothing to have been
  established. The fact simply stays `UNRESOLVED` and behaves exactly as it does today.
- **weak or coarse** — the governed record's own vocabulary is projected unchanged (§171 recorded
  that seven of nine distinct verification methods across twenty approved records are looking-based).
  The architecture does not upgrade it, paraphrase it, or supplement it from model output. A
  settlement claim resting on a coarse criterion is reviewable *as such*, which is the point of
  carrying provenance in observability.

## What deliberately does not change

- The customer path. `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED` stays a literal `false`, no
  environment is consulted, and no toggle is introduced.
- `OWED_FACT_STATUSES` stays at four members. No `PARTIALLY_ESTABLISHED`, no
  `EVIDENCE_PROPERTY_MISMATCH` status.
- `COVERAGE_DECISION_INPUTS` — coverage still never reads prose.
- Additive-only nomination, one-question-one-fact, the nomination proof burden, the budget's
  preserve-and-warn behaviour.
- `acceptableEvidence` stays guidance, stays nullable, stays underivable from model output.

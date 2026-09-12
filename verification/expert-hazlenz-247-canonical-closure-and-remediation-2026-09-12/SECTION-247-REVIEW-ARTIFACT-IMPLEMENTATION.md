# §247 — Slice 4: Decision-Complete Human Review

Zero provider calls. The §245 authorization to modify `property-authority.ts` and
`settlement-review.ts` was consumable under §247 and has now been **consumed**.

## The invariant

A HUMAN DECISION MAY COUNT AS CONTAINMENT ONLY IF THE PRODUCT ARTIFACT SURFACES THE INFORMATION
NECESSARY TO MAKE THAT DECISION.

§244 measured the property review packet against thirteen required elements and found six absent and
two partial, with no evidence-review artifact of any kind. Three §243 occurrences map onto three of
the absences: **G3** onto the proxy basis, **C6** onto siblings, **C2** onto the missing evidence
artifact.

## The architecture: one normalized model, two projections

The authorization prefers a normalized review model with task-specific projections where that avoids
duplicating semantic state. It does. Property review and evidence review need the same target fact,
the same authority state and the same sibling context; only the decision differs.

`decision-review-model.ts` assembles `DecisionReviewContext` once. Each surface projects what its own
reviewer needs. No semantic state is held twice, and neither protected module gained a private copy
of the other's context.

## What each surface now carries

**Property review packet — four additive fields.** Nothing was removed or changed.

| Field | Closes | What it is |
|---|---|---|
| `establishedContext` | G3 | the verbatim observation spans the first pass cited on its **own** admitted candidates, excluding the target's own span. On G3 this surfaces the compactor-1 interlock defeat that makes an assurance a proxy |
| `siblingOpenFacts` | C6 | every other open fact with its property and status, so deciding one is visibly not disposing of the other |
| `propertyDisagreement` | verifier gap | the model's property, the verifier's, and whether the two strings are identical |
| `residualAfterEachDecision` | decision consequence | for each available decision, the state that results |

Plus `remainingOpenAfterReview`, the facts still open whichever way the review goes.

**Evidence review packet — a new artifact.** `buildEvidenceReviewPacket` in `settlement-review.ts`,
which previously carried no reviewer-facing artifact at all. It states the target fact and property,
the observation span, established context, sibling open facts, the evidence text with its binding
digest, the proposition the evidence is offered for, **both** authorities, the available decisions,
the consequence of approval, and what remains unresolved afterward.

## The two fields that are the whole of C2

`consequenceOfApproval` is computed from the **current** property authority state, never assumed. When
property authority is required and not obtained it says, in terms:

> Evidence authority is established. The fact still CANNOT be settled, because property authority for
> this fact is required and has not been obtained. Approving this evidence does not obtain it.

`remainingUnresolvedAfterApproval` lists what is still open. On C2 those two fields alone would have
shown the reviewer that approving the hire company's scan cannot settle the question, which is the
whole of what the frozen list required.

## Materiality is stated, never judged

`propertyDisagreement.identical` is `===` on two strings. Deterministic code may state that a
difference exists; only a human may judge whether it matters. Nothing in this slice reads meaning out
of prose or decides whether evidence is sufficient.

## Authority boundaries, preserved without weakening

| Action | Effect |
|---|---|
| `CONFIRM_PROPERTY` | may establish property authority. The fact remains unresolved. Confirming is not settling |
| `CORRECT_PROPERTY` | replaces the property. Does **not** itself settle, and grants no authority |
| `KEEP_UNRESOLVED` | changes nothing |
| `APPROVE_EVIDENCE` | may establish **evidence** authority only. Never a substitute for property authority |
| settlement | still requires every authority the settlement contract requires |

KR-1 remains OPEN and human-gated; `test-220-kr1-property-authority` passes 43 of 43 and still
reports it so. No review surface can grant settlement authority, asserted directly.

## Not an internal-state dump

No candidate list, no declaration array, no projection codes, no raw provider output — each asserted
absent. Every added field exists because a named §243 occurrence demonstrated a reviewer could not
answer the question without it.

## Local proof

`test-247-decision-complete-review`: **31 of 31 pass**, covering G3 context, the target's own span
excluded, C6 siblings with the target never its own sibling, literal disagreement reporting, the
three residual rows, the C2 consequence in both the blocked and unblocked states, the authority
boundaries, and the absence of a state dump.

| Occurrence | Status |
|---|---|
| G3 | **PREVENTED** — the adjacent established fact is now on the packet |
| C6 | **PREVENTED** — the open sibling and the remaining-open list are now on the packet |
| C2 | **PREVENTED** — an evidence review artifact exists and states that approval cannot settle |

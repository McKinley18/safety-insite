# §244 — Review Artifact Gap, Family B

Zero provider calls. The analysis is against the real artifact, `buildPropertyReviewPacket` in
`src/safescope-v2/expert-hazlenz/owed-facts/property-authority.ts`, and against the absence of any
counterpart in `settlement-review.ts`.

## What exists today

The property review packet carries twenty-one fields: `packetId`, `analysisId`, `factKey`,
`observationSpan`, `proposedProperty`, `hazlenzExplanation`, `branchA`, `branchB`, `decisionIfA`,
`decisionIfB`, `decisionWhileUnresolved`, `existingClarification`, three verifier fields,
`reviewerQuestion`, `availableDecisions`, `propertyDigest`, `requirement`, `state` and
`confirmationIsNotSettlement`.

`settlement-review.ts` contains no reviewer-facing artifact of any kind. It carries an evidence
digest on the claim and on the authority, which are identity values for replay detection, not
anything rendered to a human.

## The thirteen information elements against what the artifact carries

| Element | Carried | By what |
|---|---|---|
| original observation relevant to the decision | partly | `observationSpan`, but only the span for this one fact |
| target unresolved fact | yes | `factKey`, `proposedProperty` |
| controlling property | yes | `proposedProperty` and the verifier's own statement of it |
| model conclusion | yes | `proposedProperty`, `hazlenzExplanation` |
| verifier conclusion | yes | three verifier fields |
| material disagreement | **no** | the reviewer must compare two strings unaided |
| prohibited or identified proxy issue | **no** | nothing surfaces the adjacent fact that makes a property a proxy |
| sibling unresolved facts | **no** | the packet is single-target by construction |
| evidence being reviewed | **no** | no evidence artifact exists |
| what proposition the evidence supports | **no** | no evidence artifact exists |
| current property authority | yes | `requirement`, `state` |
| current evidence authority | **no** | absent from the property packet |
| proposed settlement consequence | partly | `confirmationIsNotSettlement` states the negative only |
| what remains unresolved after the action | **no** | absent |

Six elements absent, two partial. The three §243 occurrences map exactly onto three of the
absences: G3 onto the proxy basis, C6 onto siblings, C2 onto the missing evidence artifact.

## The smallest decision-complete design

Four additive fields on the property packet and one new artifact. Every one is copying or
projection over state that already exists. None reads meaning out of prose, so HS17 is untouched.

**On the property review packet**

1. `establishedContext`: the verbatim observation spans the first pass already cited as evidence on
   its own admitted candidates, excluding the target fact's own span. Pure copying. On G3 this
   surfaces the compactor-1 defeat, because the model quoted it on its own active candidate.
2. `siblingOpenFacts`: for every other fact in the same analysis, its `factKey`, its proposed
   property and its current status. Pure copying. On C6 this surfaces the open extraction-unit
   property and makes it visible that deciding one does not dispose of the other.
3. `propertyDisagreement`: the model's property, the verifier's property, and a boolean for whether
   the two strings are identical. A literal comparison, not a semantic judgment. Deterministic code
   must not decide whether a difference is material; it may state that a difference exists.
4. `residualAfterEachDecision`: for each of the three available decisions, the deterministic state
   that results, derived from the existing authority state machine. Confirm grants property
   authority and leaves the fact unresolved; correct replaces the property and leaves the fact
   unresolved; keep-unresolved changes nothing. This is projection of an existing transition table.

**New artifact, `buildEvidenceReviewPacket`**

The smallest evidence-side counterpart: the target `factKey`, the property as currently stated, the
current property authority requirement and state, the evidence text being reviewed with its digest,
the proposition the claim offers that evidence for, the three available decisions, the deterministic
consequence of approval given the current property authority, and what remains unresolved after
approval. On C2 the last two fields alone would have shown the reviewer that approving the hire
company's scan cannot settle the question, which is the whole of what the frozen list required.

## What is deliberately not added

No internal state dump. No candidate list, no full declaration array, no projection codes, no raw
provider output. Each added field is there because a named §243 occurrence demonstrates a reviewer
could not answer the question without it.

## Boundary warning

`property-authority.ts` and `settlement-review.ts` are both protected modules inside the frozen
29-module composite identity. Every change in this family touches a protected module, so the family
cannot be implemented under the present authorization. It is a stop-and-ask boundary and needs
separate explicit product-owner authorization naming the modules.

## What this family does not require

Nothing in this family changes the prompt, the wire schema, the posture contract, the declaration
projection, the authority state machine or any semantic rule. The authority behaviour was exactly
correct on all four exercised cases and must not be touched. The repair is to what the product shows
a human, not to what the system decides.

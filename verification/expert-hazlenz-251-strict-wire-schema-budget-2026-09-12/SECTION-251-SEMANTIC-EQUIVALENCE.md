# §251 — Semantic Equivalence of the Compacted Representation

Zero provider calls. Zero database operations. The mechanical proof behind this document is
`backend/scripts/verify-251-k6-and-normalization.ts`; its result is
`SECTION-251-K6-NORMALIZATION-PROOF.json`, verdict **PASS**, nine of nine checks.

**The representation proved here is not in production.** It clears the union limit and not the
grammar limit, so it was designed and proved but not adopted. This document states what it would
guarantee, so that a later architecture decision can reuse the work rather than redo it.

## What must be preserved, and whether it is

| Required semantic element | Preserved | How |
|---|---|---|
| Unresolved facts | YES | `unresolvedFactDeclarations` untouched |
| Driver roles | YES | the same five, one branch each, pinned by `const` |
| Role justification | YES | all eight §247 subfields survive normalization; see below |
| Immediate posture | YES | untouched |
| Required controls | YES | untouched |
| Controlling property | YES | untouched |
| Evidence relationships | YES | untouched |
| Authority-relevant fields | YES | untouched |
| Verifier-critical output | YES | untouched |

No field was deleted. Nothing was reduced to a boolean. `roleJustification` is not collapsed into an
`isDecisionCritical` flag or anything resembling one; the factual basis, the unresolved element, the
material decision-change rationale and the controlling-versus-follow-up rationale all remain as
free narrative fields the model writes.

## K6, checked against the generated schema rather than asserted

The six checks read the pair set out of the union the code actually generates.

| Check | Claim | Result |
|---|---|---|
| K6-1 | the compact union expresses exactly the six admissible pairs | PASS |
| K6-2 | it expresses none of the four inadmissible §239 pairs | PASS |
| K6-3 | it expresses the same pair set as the §247 union | PASS |
| K6-4 | every branch pins its role with `const` and restricts `refKind` to that role's carriers | PASS |
| K6-5 | every branch restricts `epistemicCharacter` to the characters its role admits | PASS |
| K6-6 | no controlling role admits `MANUFACTURED_OR_SPECULATIVE` | PASS |

**6 admissible, 0 inadmissible.** The inadmissible pair remains structurally unwritable, exactly as
§247 made it. No invalid combination becomes expressible under this compaction, so the fail-closed
deterministic fallback §251 contemplates for that case is not needed and was not introduced. K6's
original ten-combination hole is not recreated.

The A2 repair is likewise preserved structurally rather than deterministically: a fact the model
labels manufactured still cannot be given a role that controls whether work continues, because the
enum on each controlling branch does not contain that member.

## Normalization is a field move, not an interpretation

`normalize251BasisEntry` takes a wire entry and returns a canonical §247 basis entry by moving four
named fields — `epistemicCharacter`, `alongsideControlConsidered`, `whyAlongsideControlInsufficient`,
`dischargingControlRef` — from the entry into `roleJustification`. `denormalize251BasisEntry` moves
them back.

| Check | Claim | Result |
|---|---|---|
| NORM-1 | wire → canonical → wire is the identity on every admissible shape (10 shapes) | PASS |
| NORM-2 | every canonical justification subfield produced is a declared §247 subfield | PASS |
| NORM-3 | normalization supplies no value the wire did not carry | PASS |

The ten shapes are the five roles crossed with the presence and absence of `unresolvedElement`.
An absent optional field stays absent through both directions; nothing is defaulted, defaulted-to-null,
or filled in.

The normalizer reads no prose, matches no keyword, chooses no role, chooses no posture, and resolves
no property identity. Every value it places is a value the model wrote, under the key the model wrote
it under.

## The one behavioural difference, stated plainly

Three fields become inexpressible on branches whose role does not use them: a
`NO_IMMEDIATE_ACTION`, `UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION` or
`UNRESOLVED_RESPONSE_OR_FOLLOW_UP` entry can no longer carry `alongsideControlConsidered`,
`whyAlongsideControlInsufficient` or `dischargingControlRef`.

Under §247 a model could write them there. Nothing read them: the projection consults the first two
only under the cessation role and the third only under the controls role, and each field's own
description already says which role requires it. So the compaction removes an expressible value that
carried no consequence, and it makes the schema say what the descriptions already said.

That is a narrowing of what can be written, not a narrowing of what can be meant, and it is the only
expressibility change in the design.

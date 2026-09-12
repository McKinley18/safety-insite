# §196 — multi-gap support and additive behaviour

The failure this whole layer exists for is **displacement**: a legitimate unresolved fact
disappearing because a different legitimate concern was more salient. A new representation is only
worth having if it cannot reintroduce that at the boundary.

## Cardinality — 0, 1 and many

| gaps | case | result |
|---|---|---|
| **zero** | **A1**, **A2** | an empty declaration list projects to zero facts, zero refusals and no placeholder. `[]` is a legitimate answer and not an error state. Nothing is fabricated to fill it |
| **one** | **B1**–**B9** | one fact, every field with explicit provenance, key reproducible from the declaration alone |
| **many** | **C1**–**C3** | two independent declarations project to two facts with distinct identities, distinct affected decisions, and no field borrowed from one another |

The first pass emits a **closed set** of unresolved facts for one analysis: the collection is
required in the vNext schema, so "absent" and "none" are the same statement made explicitly, exactly
as v15 already requires of its four siblings.

## A malformed declaration does not destroy its siblings

Case **C4**: three declarations, the middle one missing `branchB`.

```
D1  →  admitted, fact projected
D2  →  refused,  REQUIRED_FIELD_MISSING, no fact
D3  →  admitted, fact projected
```

Refusal is **per declaration** and never whole-response. Refusing the whole collection because one
entry was malformed would be displacement arriving through the boundary rather than through the
model — a well-formed independent gap lost for a reason that has nothing to do with it.

This is not a departure from the verifier's whole-verdict refusal. A verdict is one object making one
decision, so a partly-valid verdict is not a partly-correct one. A first-pass response is five
independent collections, and `expert-normalization.ts` has always refused a malformed candidate
without destroying its siblings.

## Two gaps on one sentence both survive

Case **F3**. Two genuinely different facts anchored to the same span — one about whether the guard is
fitted, one about whether the inspector's vantage point was the limitation — project to two facts
with keys ending `.1` and `.2`.

Deduplicating them because they share an anchor would be exactly the merge the ledger forbids:
*"Deduplicate on identity, never on similarity — merging similar-sounding facts is precisely how a
gap disappears."*

What **is** refused is a **restatement**: same decision, same span, and the same two branches and two
decisions after whitespace-and-case normalisation (case **F2**, `DECLARATION_DUPLICATES_ANOTHER_DECLARATION`).
That is a byte check on already-structured fields, not a similarity judgement, and it is the only
deduplication performed anywhere in the projection.

## Conjunctive facts survive whole

Cases **G1**, **G2**. A branch stating `the wheel is guarded AND the work rest is set within the
permitted clearance` projects byte-identically, with both conjuncts intact.

Nothing in the projection splits a branch on a conjunction. One declaration is one fact; two facts
require two declarations, and the prompt block says so explicitly — *"if two different things are
unknown, write two entries. Never join them with 'and'."* This is `structural-questions.ts`'s rule
applied one stage earlier: the architecture refuses to equate one string with one decision-critical
fact, and it equally refuses to cut one in half.

## The clarification carrier stays uncoupled

`D-56` recorded the cost of a candidate-owned carrier: a clarification with nowhere to live in
exactly the zero-candidate case that most needed one. L3-2i added a sibling carrier and L3-2j
measured that the shipped prompt never used it — the coupling survived as a shape after the
capability existed.

`CLARIFICATION_CARRIER_COUPLED_TO_HAZARD_CANDIDATE` is preserved-against structurally:

| assertion | case |
|---|---|
| `unresolvedFactDeclarations` is a top-level sibling; no such property exists on a hazard candidate or on a clarification | **Q1** |
| a declaration projects with zero hazard candidates and zero clarifications present | **Q2** |
| the clarification back-reference is optional and never in `required` | **Q3** |
| a back-reference naming a real declaration resolves to its computed `factKey` | **Q4** |
| a back-reference naming nothing is recorded `unresolved` and **the question survives** | **Q5** |
| a clarification with no back-reference is not treated as broken | **Q6** |

The link runs from question to fact, which is the direction that cannot create a dependency. It is
the `relatesToCandidateKey` mechanism reused verbatim, including its failure behaviour: an
unresolvable id is stripped and recorded, and nothing abstains into a guess.

## Additive and non-substitutive

- Every projected fact enters `UNRESOLVED` (case **O1**).
- The projection records **no transition** (case **O2**) — the only way a fact leaves `UNRESOLVED` is
  `transition()` carrying one of three authorities, and "a model said so" is not among them.
- `firstPassProjectionEffect()` is false on every axis: no settlement, no coverage change, no
  citation creation, no regulatory truth, no invented question wording (case **O3**).
- A declaration claiming `settled`, `resolved`, `covered`, `rejected` or `status` is refused (case
  **O4**).
- Every projected fact carries `modelAuthored = true` and `source = FIRST_PASS_MODEL`, so it cannot
  be mistaken for a deterministically derived one, and
  `modelAuthoredOnlyFailClosedKeys` continues to apply above it (case **O5**).

**`PROVIDER_SETTLEMENT_AUTHORITY = NEVER` is unchanged. A provider cannot settle a fact merely by
emitting it, and cannot settle one by declaring it either.**

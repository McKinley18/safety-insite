# §194 — Regulatory-basis architecture

## The problem, in one paragraph

§193 established that the verifier instruction's prohibition — *"you may not cite or quote a
regulation"*, with a fail-closed discard claim — **cannot be enforced** for a regulatory proposition
asserted in prose. §192 FV-07 wrote *"OSHA general industry requires… not exceeding 1/8 inch"* with
no citation string, and every broader matcher was measured and rejected: `\bOSHA\b` collides with
the supplied jurisdiction, `\bregulat` collides with the **correct** reasoning about absent governed
evidence seen on FV-11 and FV-13. The resolution cannot be a better regex.

## The design

> **If the verifier itself introduces or materially relies upon a regulatory proposition, that
> reliance must be represented explicitly in structured output.**

Reliance becomes something the provider **declares** and the architecture **validates**, replacing an
undecidable inference problem with a decidable declaration problem.

```ts
regulatoryBasis: {
  reliance:    'NONE' | 'SUPPLIED_GOVERNED_EVIDENCE',
  sourceIds:   string[],        // [] when NONE; closed-set validated otherwise
  proposition: string | null,   // null when NONE
}
```

Required on every verdict, so silence about reliance becomes impossible — the same reasoning that
made `owedFactDeclarations` mandatory in v3.

## Activation is declared, never inferred

The authorization forbids inferring activation from words like *OSHA*, *regulation*, *standard*.
Nothing here does. Activation is the `reliance` enum, and the prompt names the three cases §192
actually produced that must still be `NONE`:

- naming the jurisdiction you were given, or repeating supplied context;
- observing that no governed evidence was supplied — *"Saying 'I cannot tell, because the applicable
  interval was never stated' is exactly right and is NONE"* (the FV-11 shape);
- describing what the workplace record says about its own inspections or certificates.

`NONE` is stated to be the normal answer, in the same register as v3's *"the answer is usually no"*.

## Source authority — bound to what was supplied, never self-authorised

`sourceIds` are validated by **exact string equality against a closed set**: the `sourceId`s of the
governed evidence supplied with **this** request. This is the same discipline v3 applies to
`bindingFactKey` and the same one `expert-normalization.ts` applies to first-pass evidence via
`EVIDENCE_SOURCE_UNKNOWN`. No fuzzy match, no normalisation, no nearest neighbour, no registry
lookup, no database access.

Consequences that matter:

- **An invented id is refused whole** — `SOURCE_ID_NOT_IN_SUPPLIED_SET`.
- **A citation string as an id is refused whole** — it fails the id shape and the closed set.
- **With zero governed evidence supplied, ANY declared reliance is refused.** There is no route by
  which a verifier can supply the rule from memory.
- **A citation-shaped string is refused everywhere in free text, including inside `proposition`.**
  A model-emitted citation is not evidence merely because it sits in a structured field.

## Why `proposition` earns its place in a minimum structure

Deterministic enforcement does not need it. **Governability does.** Without it, a declaration says
*"I relied on GOV-SRC-1"* but not what for — and a reviewer would have to infer the claim from prose,
which is precisely the inference problem §194 exists to escape. One sentence, required when reliance
is declared, forbidden when it is not. It is reviewed by a person and is explicitly not checked
automatically.

## The fail-closed matrix, now truthful

| case | behaviour |
|---|---|
| A raw citation-shaped output outside the structure | **REFUSE WHOLE** |
| B declared reliance, valid supplied source | **structurally admitted** — semantics separately reviewable |
| C declared reliance, unknown or invented source | **REFUSE WHOLE** |
| D reliance `NONE` | admitted, subject to every other contract rule |
| E supplied jurisdiction named | **admitted** — never a citation violation |

## What this does not claim

Structural binding establishes that reliance was declared, that every referenced id exists in the
supplied governed evidence, and that the contract state is legal. It does **not** establish that the
proposition faithfully paraphrases the source, that the source supports every word, or that any legal
conclusion is correct. Those are recorded in code as `REQUIRES_HUMAN_TRUTH`.

**Structural source binding is not legal validation.** No deterministic attempt is made to prove the
prose paraphrases the regulation, and none should be.

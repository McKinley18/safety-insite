# §195 — A collision between §193's citation boundary and §194's reliance route

**Found deterministically, with zero provider calls, while designing the governed-evidence fixtures.**

## The finding

A verifier that legitimately relies on supplied governed evidence, and **quotes the citation from
that very source**, is refused whole.

```
reliance   SUPPLIED_GOVERNED_EVIDENCE
sourceIds  ['GOV-WORKREST-01']            ← valid, supplied, closed-set member
proposition 'the supplied record at 29 CFR 1910.215(a)(4) sets a maximum work rest gap'

  admitted = false
  codes    = PROHIBITED_REGULATORY_CITATION
```

The same verdict with the citation paraphrased away is admitted:

```
proposition 'the supplied record sets a maximum work rest gap for this wheel type'

  admitted = true   boundSourceIds = GOV-WORKREST-01
```

## Why it happens

§193 made citation-shaped strings refusable anywhere in verifier free text — correctly, because
nothing enforced the prohibition at all. §194 then added `regulatoryBasis.proposition`, and D.3 of
the §194 suite deliberately extended the scan to cover it, precisely so a model could not
self-authorise inside the structure.

Both decisions are individually right. Together they produce a case neither anticipated: **the model
is punished for accurately quoting evidence it was legitimately handed.**

## The tension, argued both ways

**The current behaviour is defensible.** The `sourceId` is the authority; the citation string adds
nothing a reader cannot get from the source itself, and allowing it re-opens exactly the laundering
route §193 closed — a reviewer seeing a citation in a proposition cannot tell, from the text alone,
whether it was copied from the supplied record or produced from memory. The paraphrase route works
and loses nothing that matters.

**It is also a real cost.** A verifier behaving correctly gets its whole verdict discarded, and the
refusal reads `PROHIBITED_REGULATORY_CITATION` when the citation was supplied to it by the system.
Worse, the repair the model must learn is *"paraphrase the source instead of quoting it"* — which
pushes toward **less** faithful representation of governed material, in a programme that elsewhere
insists governed vocabulary reach the verifier **unaltered** (`governed-evidence-derivation.ts`
copies rather than paraphrases, deliberately).

## What §195 did about it

**Nothing to the code.** §195 is a validation authorization; changing the boundary would be
remediation, which it forbids. Two things were done instead:

1. **The fixtures avoid forcing the collision.** All supplied governed text in the §195 cohort is
   authored without citation-shaped strings, and the freeze script **aborts** if any is present
   (`governedEvidenceCitationShaped`). Otherwise the legitimate-reliance arm could fail for a reason
   that has nothing to do with the behaviour under test.
2. **It is recorded as a finding**, because a cohort that quietly avoids a collision has not shown it
   is absent — it has shown it was designed around.

## Why this matters for the eventual run

Real governed records **do** carry citations — `ApprovedKnowledgeRecord.authority.citation` is a
field, and `governed-evidence-derivation.ts` substitutes it into the requirement template it hands
downstream. So the moment governed evidence is drawn from the live registry rather than authored for
a fixture, supplied text containing citations becomes the normal case, and a verifier quoting it
becomes likely.

**A cohort built from real governed records would hit this collision, and its legitimate-reliance arm
could fail for the wrong reason.**

## Options, for a separate authorization

1. **Exempt `proposition` from the citation scan when reliance is declared and every `sourceId` is
   valid.** Narrow and targeted. The objection is that it re-opens the laundering route inside the
   one field a model controls — a model could declare valid reliance and then quote a citation the
   source does not contain.
2. **Exempt only citation strings that appear verbatim in the supplied source text.** Deterministic,
   and it distinguishes quoting from inventing exactly. Requires the admission input to carry the
   governed text, not just the ids — a small contract change.
3. **Leave it and instruct.** Add a line telling the verifier to reference governed evidence by
   `sourceId` and never to quote its citation. Zero contract change; relies on instruction-following,
   which §193 established is not enforcement.

Option 2 looks strongest — it is the only one that separates *quoting the supplied source* from
*producing a citation from memory*, which is the distinction that actually matters. It is not
implemented here.

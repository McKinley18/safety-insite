# §194 — v3.1 → v3.2 protocol diff

```
v3.1  prompt 7e73d175162320db8f4d93c9b1094fdadc1e4028b61fd95f586ca9a31bb2fb2c   UNCHANGED
v3.1  schema d39c86bc2755451fd27bdba34cba82c2bfee5b090134a40d1622e25d199bde65   UNCHANGED
v3.2  prompt f2522995f0b08afd3747c9f081bde74e7daf0fe356238d60e3574ec49b96b83f   NEW
v3.2  schema 83071b51edc3673896b068277cc447d0a5438be4e95e9603da0fdb315609a54e   NEW
v3.2  version hazlenz.expert.verifier-instruction.v3.2

prompt: 1 block inserted (28 lines) · 0 removed · 0 modified
schema: 1 property added + 1 required entry · 0 removed · 0 modified
```

Built **by construction** from v3.1: the prompt is v3.1's own line array with one block inserted at a
named anchor, the schema a structural clone with one property added. The module refuses to load if
the anchor is missing or ambiguous, or if v3.1 already carries `regulatoryBasis`. Proof B.1: removing
the block reproduces v3.1 byte-identically, `7e73d1751623` on both sides.

## Prompt — inserted at the end of step 6

Placed after the owed-fact bookkeeping because it is a second accounting obligation of the same kind:
an explicit declaration covering something the verdict would otherwise leave implicit.

```diff
+
+7. NOW DECLARE WHETHER YOU LEANED ON A REGULATION.
+
+   This is bookkeeping like step 6, and like step 6 the usual answer is the quiet one.
+
+   >>> NONE IS THE NORMAL ANSWER. Almost every verification is decided by what the observation
+   >>> does and does not establish, and needs no regulation at all. Declaring NONE is not an
+   >>> admission of weakness and it is not second best.
+
+   Declare NONE unless YOUR OWN reasoning introduces or materially depends on a regulatory
+   proposition -- a claim about what a regulation, standard or code REQUIRES, PERMITS or
+   PROHIBITS. Three things that are NOT that, and must still be NONE:
+     - naming the jurisdiction you were given, or repeating context you were supplied;
+     - observing that no governed evidence was supplied, or that a question turns on a rule
+       nobody has given you. Saying "I cannot tell, because the applicable interval was never
+       stated" is exactly right and is NONE;
+     - describing what the workplace record says about its own inspections or certificates.
+
+   If you DO rely on a regulatory proposition, declare SUPPLIED_GOVERNED_EVIDENCE and name the
+   sourceId of every piece of governed evidence you relied on, copied EXACTLY from the evidence
+   you were given, plus one sentence saying what you take those sources to establish.
+
+   YOU MAY ONLY RELY ON GOVERNED EVIDENCE THAT WAS SUPPLIED TO YOU. An id you invent, abbreviate
+   or respell is not an id, and a verdict carrying one is discarded whole. You have no other way
+   to invoke a regulation: writing a citation into your prose does not authorise anything, and a
+   verdict containing a citation-shaped string ANYWHERE in its free text is discarded whole.
+
+   IF NO SUPPLIED GOVERNED EVIDENCE SUPPORTS THE PROPOSITION, YOU MAY NOT RELY ON IT. Reason from
+   the observation instead, or say the fact cannot be settled on what you were given. Do not
+   supply the rule from memory.
```

The three `NONE` cases are the three §192 actually produced — the supplied jurisdiction (FV-07's
"OSHA general industry" partly echoes it), absent governed evidence (FV-11, FV-13), and the workplace
record's own certificates (FV-10, FV-11). They are named so the declaration does not over-fire on
exactly the reasoning the architecture wants.

## Schema — one property

```diff
  required: ['verdict', 'rationale', 'clarificationSourceMode', 'proposedClarification',
-   'bindingFactKey', 'nominatedFact', 'owedFactDeclarations'],
+   'bindingFactKey', 'nominatedFact', 'owedFactDeclarations', 'regulatoryBasis'],
  properties: {
    …
+   regulatoryBasis: {
+     type: 'object', additionalProperties: false,
+     required: ['reliance', 'sourceIds', 'proposition'],
+     properties: {
+       reliance:    { type: 'string', enum: ['NONE', 'SUPPLIED_GOVERNED_EVIDENCE'] },
+       sourceIds:   { type: 'array', items: { type: 'string' } },
+       proposition: { type: ['string', 'null'] },
+     },
+   },
  }
```

Required, so silence about reliance is impossible — the reasoning that made `owedFactDeclarations`
mandatory in v3. Proof B.4: with `regulatoryBasis` stripped, the v3.2 schema serialises identically
to v3.1.

## Admission — composed, never mutated

```
NEW  backend/scripts/lib/expert-verifier-contract-v3-2.ts
```

`checkVerifierV3_2Output` = the **unchanged** `checkVerifierV3Output` (sha256 `475a9577…`, pinned by
§192) + §193's citation boundary + eleven regulatory-basis codes. `sourceIds` are validated by exact
string equality against `suppliedGovernedSourceIds` — the closed-set discipline v3 uses for
`bindingFactKey` and `expert-normalization.ts` uses for first-pass evidence.

## Nothing else moved

```
v3 prompt/schema · v3.1 prompt/schema · expert-verifier-contract-v3.ts
expert-verifier-citation-boundary.ts (§193) · expert-prompt.ts · owed-facts/*
§187 / §188 / §189 / §190 / §192 / §193 evidence
```

**§187B belongs to v3. §192 belongs to v3.1. v3.2 has no hosted evidence of any kind and the three
populations are never merged.**

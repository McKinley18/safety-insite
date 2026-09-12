# §198 — the corrected interpretation of §196 case K3

**§196's evidence package is byte-unchanged. Nothing in it was edited, and the §198 gate proves that
by hashing all fourteen of its files.** What follows is an *additive* correction to the
interpretation, and a change to the *prospective regression semantics* that must track the
architecture which actually ships.

## HISTORICAL_ASSERTION — §196 case K3, 2026-09-06

> **K3.** with no governed evidence supplied, the wire schema forbids naming one at all
> — *transport refuses it, and the boundary refuses it again*

Implemented as `governedEvidenceSourceIds.maxItems === 0` whenever the supplied governed set was
empty.

The line is still there, verbatim, in
`verification/expert-hazlenz-structured-first-pass-owed-facts-2026-09-06/TEST-OUTPUT.txt`, inside
the recorded 91/91 run. The §198 gate asserts its continued presence (`R2` in the §198 suite, and a
gate check of its own). **History is preserved, not rewritten.**

## WHAT WAS OBSERVED — §197, 2026-09-07

Twelve hosted requests carrying that exact schema were rejected with HTTP 400 **before inference**:

```
tools.0.custom: For 'array' type, property 'maxItems' is not supported
```

12 attempted, 0 completed, 0 output tokens, $0.00 actual spend. Established offline by rebuilding
all twelve request bodies and keyword-diffing them against v15's schema: exactly one keyword is
introduced by vNext, and it is `maxItems`.

**The transport did not refuse the id. It refused the entire request.**

## WHY THE CLAIM WAS WRONG, PRECISELY

§196 tested the schema **as a document**. As a document the claim was true: a schema bounding an
array at zero items does forbid naming one.

The claim that failed is the *second* half — that this constituted an independent **transport
layer**. A guarantee is only a transport guarantee if the transport accepts and enforces it. This
one was never transmitted; the provider rejected the whole request on sight. §196's suite could not
have caught it, because the strip that would have had to remove the keyword lives in the adapter and
the suite never built an adapter request.

## CURRENT_ARCHITECTURE — §198, product-owner Option B

When the supplied governed set is empty, `governedEvidenceSourceIds` is **omitted entirely** —
absent from `properties`, absent from `required`, and the instruction describing it is absent from
the system prompt.

This is **stronger** than the bound it replaces, not a workaround for it:

| | `maxItems: 0` (§196) | capability omission (§198) |
|---|---|---|
| is the model told the capability exists? | **yes** | no |
| can a compliant producer populate it? | no, if the keyword is honoured | **no, there is no field** |
| does the transport accept the schema? | **no — rejects the whole request** | yes |
| what stops a non-compliant producer? | the boundary | `additionalProperties: false` **and** the boundary |

## WHAT STILL HOLDS

```
BOUNDARY_REFUSES_UNSUPPLIED_SOURCE_ID = structurally supported by K1/K2
```

§196 cases **K1** and **K2** are unchanged and still pass. The projection refuses a governed
`sourceId` that was not supplied, deterministically, by exact set membership — no fuzzy match, no
case folding, no nearest neighbour. §198 case **E2** re-proves the exactness against a near-miss id.

**The safety property never depended on the transport layer that turned out not to exist.** That is
the important sentence: a claim was retired, not a protection.

§196's other 90 cases are unaffected. The projection, the computed identity, the provenance
totality, the multi-gap isolation, the citation-reuse rule and the reconstruction invariants are all
untouched by this correction.

## WHAT CHANGED IN THE REGRESSION SUITE, AND WHY THAT IS NOT REWRITING HISTORY

The frozen evidence is the record of what was run on 2026-09-06. The **suite** is executable code
that must track what ships, or it stops being a regression suite. Those are different objects with
different obligations.

So `test-196-structured-first-pass-owed-facts.ts` now:

- **K3** asserts the CURRENT architecture — the property is absent from `properties`, absent from
  `required`, and no `maxItems` appears anywhere in the schema;
- **K3b** asserts that this supersession is *registered*, so the old claim cannot be quietly
  deleted by a later author who never learns it existed.

The suite went from 91 to 92 cases. The historical 91/91 output is untouched and the §198 gate
checks it.

The register itself is `backend/scripts/lib/expert-superseded-claims.ts` — one definition, read by
both the suite and this document, carrying `historicalAssertion`, `historicalImplementation`,
`whatWasObserved`, `currentArchitecture`, `whatStillHolds` and `historicalEvidencePreserved` as
separate fields. Case **P8** asserts they are genuinely distinct rather than one string copied three
times.

## The entry bar for this register

An entry may be added **only** when a later observation falsified an earlier claim, and it must name
that observation. A claim that is merely unfashionable, or that a later author would have phrased
differently, does not belong here. There is currently exactly one entry.

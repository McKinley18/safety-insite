# §210C — PB-02 COMPILED-GRAMMAR ROOT CAUSE AND RECOMMENDATION

**Structural transport issue, recorded separately from the semantic work.** Zero provider calls.
Zero database operations. No production architecture changed. No schema validation weakened.

Reproduce with `npx ts-node -T scripts/diagnose-210c-pb02-grammar-size.ts` from `backend/`.

## What happened

PB-02 was drawn once in §210B-3B and refused before inference:

```
HTTP 400  invalid_request_error
The compiled grammar is too large, which would cause performance issues.
Simplify your tool schemas or reduce the number of strict tools.
```

Transmitted body 70,914 bytes. `reachedInference = false`. Not retried.

## Measured

The same observation and context, built both ways. The **only** difference is the first-pass
governed binding.

| Schema | Canonical B | As sent B | Nodes | Props | Enums | Enum members | Required |
|---|---:|---:|---:|---:|---:|---:|---:|
| PB-01 capability-ABSENT — accepted | 18,742 | 18,668 | 98 | 54 | 17 | 74 | 52 |
| PB-02 capability-ABSENT — counterfactual | 18,758 | 18,684 | 98 | 54 | 17 | 74 | 52 |
| PB-02 capability-PRESENT — **refused** | 19,184 | 19,110 | 101 | 55 | 18 | 75 | 53 |

Delta from the binding alone: **+426 canonical bytes (+2.3%), +3 nodes, +1 property, +1 enum,
+1 enum member, +1 required entry.**

Accepted band across the seven capability-ABSENT cases: **18,742 – 18,773 canonical bytes**, a
spread of 31 B. The refused schema is 411 B above the largest accepted one.

## Answers to the questions posed

**Exact compiled grammar size.** Not measurable here, and not claimed. The provider's grammar
compiler is not public and is not reimplemented. What is measured is the schema that drives it:
the table above. Any statement about the provider's internal grammar size is inference and is
labelled as such.

**Which capability-PRESENT components drive the size.** One property —
`unresolvedFactDeclarations.items.properties.governedEvidenceSourceIds` — an array of strings with
an enum of permissible source ids, plus its `required` entry and the array's `items` node.

**Does governed evidence itself affect grammar size, or only request content?** **Only the count of
permissible source ids reaches the schema.** Record *text* never enters it — it is user-prompt
content, which the grammar compiler never sees. Measured directly: five governed records with 4,000
characters of text each produced a schema of 19,222 canonical bytes against 19,184 for one record.
That is roughly **10 bytes per additional source id**, and zero bytes for their text.

**Do case-specific enums materially contribute?** **No.** They vary the accepted schemas by 31 bytes
across seven cases, and every one of those cases was accepted carrying them. They are not the cause.

**Can a semantics-preserving structural representation fit provider limits?** Yes — and one already
exists and is already proven, which is the point of the recommendation below.

## The inference worth stating

A 2.3% byte increase crossing a hard limit is not explained by byte count. The added property sits
**inside the `unresolvedFactDeclarations` array item**, not at the top level of the schema. A
constrained-decoding grammar expands a repeated array item's alternations once per permitted
element, so a property added there is multiplicative in the compiled grammar while being additive in
the JSON. That is the plausible mechanism. It is **inference, not measurement**, and a later slice
that wants certainty should establish it against the provider rather than against this file.

It also explains the §199 result without appealing to coincidence: the retired capability-PRESENT
shape failed the same way, for the same structural reason, and §202 replaced it with a separate
governed stage rather than by shrinking the schema.

## RECOMMENDATION — retain the separate governed stage

**Governed evidence does not need to be first-pass capability-PRESENT, and moving it there costs
semantics rather than saving them.**

The frozen §202 architecture, hosted-proven in §206 and executed cleanly across all 24 cases in
§208, crosses the governed relation on its **own call**, against the facts the first pass actually
produced. That architecture:

- is known transmissible, at a schema size well inside provider limits;
- keeps the first-pass grammar identical across governed and ungoverned cases, which also removes
  one of the two reasons the §210B-3A cache model failed (see TBR-20);
- binds governed records to facts that exist, rather than asking the first pass to bind against
  facts it is still authoring.

§210B-3A's departure from it — supplying `GOV-SE-11` to PB-02's first pass — was made to exercise S6
in a single call. That convenience is what the provider refused.

### What this means for S6

S6 remains **NOT_EXERCISED**. It is untouched in §210C and must not be tuned on PB-02, because no
model ever saw that request. Converting a transport rejection into a semantic verdict is the error
§209 already refused.

To exercise S6, a later slice should present the governed record on the **governed stage**, where
the normative/descriptive boundary is exactly as testable and the request shape is already proven.
If instead the product owner wants S6 exercised in the first pass specifically, that requires
demonstrating a reduced capability-PRESENT grammar under the provider's limit, and it needs its own
preregistration.

### What must not be done

Do **not** shrink `hazardFamily`, `sourceId` or `observationSourceId` enums, relax `strict: true`,
drop `required` entries, or widen `additionalProperties` to fit the limit. Those enums are the
constraints that keep model output bound to the supplied case. Trading them for transport headroom
would buy a transmissible request that no longer validates what it was built to validate.

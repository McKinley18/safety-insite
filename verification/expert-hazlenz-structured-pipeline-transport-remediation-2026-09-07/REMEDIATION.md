# §198 — Option B: the governed-binding capability is absent when there is nothing to bind to

**0 provider calls · 0 database operations · no customer or production activation · no
commit/push/tag/branch/deploy · no file under `backend/src/` modified.**

## What §197 established, and what it did not

§197 sent the §196 vNext schema to a real provider twelve times. Every request was rejected with
HTTP 400 **before generation began**:

```
tools.0.custom: For 'array' type, property 'maxItems' is not supported
```

Zero output tokens, $0.00 spent, no model behaviour observed. Offline reconstruction established
that vNext introduced **exactly one** provider-incompatible keyword relative to the repeatedly
hosted-valid v15: `governedEvidenceSourceIds.maxItems = 0`. The §108 adapter strip removes
`minLength` and `minItems`, and not `maxItems`.

**That is a transport incompatibility. It is not model behaviour, and §198 does not treat it as
one.**

## The decision, and why it is not a workaround

The product owner chose **Option B**. When the supplied governed-evidence set is empty, the
capability is **omitted entirely** rather than represented as a bounded empty array.

```
IF suppliedGovernedEvidenceSourceIds.length === 0
THEN
  governedEvidenceSourceIds is absent from the provider-visible declaration schema
  it is absent from `required`
  the model is not instructed to populate it
  the deterministic parser treats the field as unavailable for that treatment
  a provider that introduces it anyway fails closed
```

Extending the §108 strip to remove `maxItems` — Option A — would have made the request
transportable while leaving the model **told about a capability it does not have**. Option B removes
the capability instead of removing the evidence of it.

**It is strictly stronger than the thing it replaces.** A bounded field is still a field: the model
is told the capability exists, told it must be empty, and the only thing stopping a populated one is
a keyword the provider may or may not honour — which, as §197 measured, this provider does not
honour at all. An absent field cannot be populated by a compliant producer, is refused by
`additionalProperties: false` at the transport, and is refused by `DECLARATION_FORBIDDEN_FIELDS` and
by exact set membership at the boundary.

No dummy id, no sentinel, no empty-set placeholder was introduced. The `maxItems` keyword is gone
from the schema entirely — **absent from the canonical schema, before the strip runs**, which
`REQUEST-COMPATIBILITY.json` records per row.

## The three places the capability had to disappear from, not one

A schema change alone would have left the instruction lying to the model.

| surface | capability ABSENT | capability PRESENT |
|---|---|---|
| **wire schema** | property omitted from `properties` and from `required` | property present, `items.enum` = exactly the supplied ids |
| **system prompt** | the `governedEvidenceSourceIds` paragraph is not in the block | the paragraph is present and points at the input list |
| **user prompt** | no `AVAILABLE GOVERNED EVIDENCE` section | the exact `sourceId`s are rendered |
| **deterministic parser** | field treated as unavailable; an absent field is the normal shape | field parsed and every id checked against the supplied set |

`buildExpertVNextSystemPrompt(governed)` and `buildExpertVNextWireSchema(input, governed)` both
derive from the same supplied set, so a caller cannot pair a capability-present schema with a
capability-absent instruction. Case **A8** asserts the pairing rather than trusting it.

### The parser change, and its exact scope

`projectDeclaredOwedFacts` previously refused a declaration whose `governedEvidenceSourceIds` was
not an array — which, after Option B, would have refused **every well-formed declaration on ten of
the twelve rows**, since the field is no longer in the schema. Found by case **A7** failing.

The rule is now: when no governed source was supplied **and** the declaration carries no such field,
there is nothing to check. Everything else is unchanged — a declaration that carries the field
anyway still has every id checked against the supplied set, which is empty, so every id is refused.
**Fail-closed does not depend on the capability having been declared** (case **B1**).

## The second §197 defect this closes: the impossible contract

§197 also found that `buildExpertUserPrompt` renders governed records under **opaque handles**
(`R1`, `R2`) with citations stripped by `redactCitationTokens`, and has never shown a `sourceId`.
§196 nonetheless asked the first pass to name one. A compliant producer had no legitimate value to
write.

§198 does not preserve an impossible contract. See `GOVERNED-BINDING-CONTRACT.md`.

## What is preserved

- **`expert-prompt.ts` is byte-unchanged at v15** (`20979d90…`), and `buildExpertUserPrompt` is not
  modified — the vNext user prompt appends a removable block.
- **Both** prompt variants still reconstruct to v15 exactly (cases **P1**, **P2**), and both schema
  variants reconstruct to v15's schema (**P4**), and the vNext user prompt reconstructs to v15's
  (**P5**).
- The two prompt variants are built from one head and one tail, so they differ **only** by the
  governed-binding paragraph — asserted arithmetically in case **P3** rather than by inspection.
- Every §187-pinned `owed-facts/` hash, v3/v3.1/v3.2, the §196 citation-reuse rule and the identity
  boundary are untouched. No `factKey` property exists in either capability variant.

## What this deliberately breaks, and why that is correct

The §197 preregistration pins the old vNext prompt hash and the old per-row schema hashes. **All of
them have moved.** The §197 executor now aborts on `vNext prompt moved since freeze` rather than
silently re-running a retired protocol instance under a stale freeze (cases **Q1**, **Q2**).

That is the intended consequence. §197 remains retired as an execution-inconclusive protocol
instance, and a successor needs a fresh preregistration — which must freeze **two** system-prompt
hashes, one per capability variant, and the wire schema **per row**, because it is per-request and
now also per-capability.

# §245 — Slice 2, Request Envelope and Strict Schema

Zero provider calls. No code modified. The §244 root cause is confirmed in the source.

## The divergence, located exactly

**Production builder** — `buildAnthropicRequestBody` in
`src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts`:

    tools: [{
      name: EXPERT_TOOL_NAME,
      description: '...',
      strict: true,                                    <-- present
      input_schema: stripAnthropicUnsupportedKeywords(
        applyStrictSchemaWrapper(buildExpertWireSchema(input))),
    }],

**Acceptance executor** — `scripts/execute-243-final-acceptance.ts`, first-pass leg at lines
292–301 and verifier leg at lines 396–404:

    tools: [{
      name: EXPERT_TOOL_NAME,
      description: 'Emit the structured result. This is the ONLY way to answer.',
      input_schema: asSent,                            <-- no strict flag on either leg
    }],

Both legs of the §243 run transmitted the schema **without** asking the provider to enforce it. The
executor imports `applyStrictSchemaWrapper` and `stripAnthropicUnsupportedKeywords` from the
production adapter, so it inherited the strict-mode *shape* — `additionalProperties: false` on every
object node, `minLength`/`minItems` stripped — while omitting the flag that makes the provider
honour it. The schema was dressed for strict mode and sent unenforced.

This is the mechanism behind the five conformance failures §244 classified as plausibly prevented by
strict enforcement (G4, G8, C3, C7, M5), including the two placeholder payloads whose only keys were
`parameters` and `$PARAMETER_NAME`.

## Why the flag is a separate field, and why omitting it is silent

`strict` is a top-level field on the tool definition, beside `name`, `description` and
`input_schema` — it is not part of the schema and not part of `tool_choice`. Nothing in the schema
object records whether enforcement was requested. A caller that assembles the schema correctly and
drops the flag produces a request that is structurally indistinguishable from a correct one at the
point of assembly, and differs only in what the provider will accept back. That is precisely the
failure §244 asked to be made impossible.

## What Slice 2 asked for, and what is reachable

Slice 2 required that "production and acceptance must consume the same canonical request-envelope
definition," for the stated purpose of production/validation parity plus structural conformance.

The **canonical definition** half is reachable and small: a single exported envelope binding
provider, model identifier, strict-schema setting, output-token limit, response-schema identity, and
the first-pass and verifier request options, consumed by both callers, with a local test asserting
the acceptance caller cannot omit a bound option.

The **parity** half is not reachable. Parity is a relation between two callers of one contract.
Per `SECTION-245-PRODUCTION-PATH-PARITY.md`, there is no production caller, and the production
builder assembles a different contract's schema. Binding one envelope across the two would assert an
equivalence that does not hold: the same envelope would carry `buildExpertWireSchema` on one side
and `buildExpert239WireSchema` on the other.

Implementing the envelope now would therefore produce a shared definition that documents parity
rather than establishing it — the exact false confidence this authorization instructs against
elsewhere. The envelope should be built as part of whichever architecture the product owner selects,
and its first bound element should be the response-schema identity, so that a mismatch of the kind
§243 shipped becomes a freeze failure rather than a run result.

## Correction to the §244 upper bound

§244 recorded this slice as fixing "five of fifteen structural failures … Upper bound 0.667 against
a 0.95 threshold." That arithmetic stands on its own terms, but it is an upper bound on a rerun of
the §243 instrument, and §242A/§243 are spent. It does not forecast a successor cohort and must not
be quoted as one.

## Disposition

**NOT IMPLEMENTED — gated on the Slice 1 architecture decision.** The root cause is confirmed in the
source and localised to two call sites on one file. The repair is small and well understood. It is
withheld only because the parity it exists to create has no counterparty until the product owner
decides which contract the product ships.

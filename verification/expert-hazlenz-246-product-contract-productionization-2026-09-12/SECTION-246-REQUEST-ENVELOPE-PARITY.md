# §246 — Phase 7, The Canonical Provider Request Envelope

Zero provider calls. The envelope was built and asserted offline.

## Path

    src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope.ts

It lives in the adapter directory because it names a provider and a model, and the Expert core fails
its own purity guard on a vendor name. The semantic core stays provably vendor-neutral.

## What it binds

| Bound element | Value |
|---|---|
| envelope version | `hazlenz.expert.request-envelope.v1` |
| provider id | from the hosted inference config |
| model | from the hosted inference config |
| endpoint | from the hosted inference config |
| api version | from the hosted inference config |
| **strict schema** | **`true`** |
| first-pass max tokens | bound separately |
| verifier max tokens | bound separately |
| thinking | from the hosted inference config |
| forced tool choice | `true` |

The two token limits are bound per leg rather than merged. §243 used different limits on the two
legs, and a single `maxTokens` would have silently changed the verifier request the moment the
envelope was adopted. Truncation is a measured failure mode, so the two numbers stay two numbers.

## How the §243 defect becomes unexpressible

§243 transmitted both legs without the tool-level `strict` flag while inheriting the strict-mode
schema *shape* from the production adapter — `additionalProperties: false` applied, `minLength` and
`minItems` stripped — so the schema was dressed for enforcement and sent unenforced. Five of fifteen
structural failures sit on that omission, and nothing in the assembled request recorded it.

The flag was droppable because `strict` is a top-level field on the tool definition, beside `name`,
`description` and `input_schema`. It is not part of the schema, so a caller that builds the schema
correctly and omits the flag produces a request that looks right at assembly and differs only in what
the provider will accept back.

`buildEnvelopeRequestBody` is now the only place either caller builds a tool block, and it writes
`strict` from the envelope unconditionally. There is no parameter that suppresses it. The hosted
transport contains no `tools: [` literal at all — §246 check F8 asserts that, so the adapter cannot
quietly grow its own assembler.

## The local tests that hold it

| Check | Assertion |
|---|---|
| F1 | the envelope binds the strict-schema setting, and it is on |
| F2 | every declared bound key is present in the envelope |
| F3 | the envelope declares no key it does not bind |
| F4 | an assembled first-pass request carries `strict: true` |
| F5 | the request is forced to the tool |
| F6 | the verifier leg is bound by the same envelope and is also strict |
| F7 | the two legs carry their own bound token limits |
| F8 | the transport never assembles a tool block itself |

F2 and F3 run in both directions against `EXPERT_REQUEST_ENVELOPE_BOUND_KEYS`, so a field added to
the envelope without being declared, or declared without being bound, fails the suite. That is the
mechanism the authorization asked for: the acceptance caller cannot silently omit a bound request
option, because it no longer assembles the option.

## What this does not do

It repairs no semantic-coherence failure. Strict enforcement is a structural conformance control: it
makes the provider enforce a schema the contract already defined. §244 classified eight of the
fifteen §243 failures as semantic coherence that strict mode cannot solve, and that classification
stands untouched. The envelope's purpose is production/validation parity plus structural conformance,
and it must never be reported as more.

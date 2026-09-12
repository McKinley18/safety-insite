# §247 — Slice 3: Request Envelope Verification

Zero provider calls.

## Status

The canonical envelope was created in §246 and is **preserved as the only source of material provider
configuration**. §247 strengthened that position rather than rebuilding it: the provider configuration
itself (`AnthropicExpertConfig`, `EXPERT_HOSTED_INFERENCE_CONFIG`) moved out of the adapter and into
the envelope, so the adapter now consumes the envelope rather than the reverse.

## What is bound, both legs

| Element | First pass | Verifier |
|---|---|---|
| provider | bound | bound |
| model | bound | bound |
| strict schema | bound, `true` | bound, `true` |
| output token limit | `firstPassMaxTokens` | `verifierMaxTokens` |
| response schema identity | supplied by the contract, transmitted by the envelope | same |
| request options: thinking, forced tool choice | bound | bound |

The two token limits stay separate. §243 used different limits per leg, and a single merged value
would have silently changed the verifier request the moment the envelope was adopted.

## Why strict enforcement cannot be silently disabled

`buildEnvelopeRequestBody` is the only place any caller builds a tool block, and it writes `strict`
from the envelope unconditionally. There is no parameter that suppresses it.

Three independent facts close the gap:

1. The hosted semantic transport contains no `tools: [` literal — asserted.
2. After §247 Closure A, `anthropic-expert-provider.ts` contains no `tools: [` literal either, so the
   legacy adapter cannot assemble one. Both production request paths now route through the envelope.
3. `EXPERT_REQUEST_ENVELOPE_BOUND_KEYS` is checked in **both directions**: a field added to the
   envelope without being declared fails, and a key declared without being bound fails.

## Tests

`test-246-productionization` F1 through F8, all passing:

| Check | Assertion |
|---|---|
| F1 | the envelope binds strict schema, and it is on |
| F2 | every declared bound key is present |
| F3 | the envelope declares no key it does not bind |
| F4 | an assembled first-pass request carries `strict: true` |
| F5 | the request is forced to the tool |
| F6 | the verifier leg is bound by the same envelope and is also strict |
| F7 | the two legs carry their own bound token limits |
| F8 | the transport never assembles a tool block itself |

## What this is not

Strict schema is **not** semantic remediation and is not counted as any. It is a structural
conformance control: it makes the provider enforce a schema the contract already defined. §244
classified eight of the fifteen §243 failures as semantic coherence that strict mode cannot solve, and
that classification stands untouched.

Its real contribution in §247 is as the **enforcement dependency for K6**: the `anyOf` union prevents
an inadmissible pair only because the request asks the provider to enforce the schema.

# §247 — Architecture Closure A: The Legacy Runnable Expert Route

Zero provider calls. Zero database operations.

## What the route was

§246 reported one residual: the base contract could still be **run on its own**.
`AnthropicExpertProvider.analyze()` assembled its own request from `EXPERT_SYSTEM_PROMPT`,
`buildExpertWireSchema` and `buildExpertUserPrompt`, `expert-normalization.ts` validated the reply
against the base schema, and `mergeExpertIntelligence` placed the result beside protected authority.
That produced Expert HazLenz conclusions carrying none of the §210J/§233/§235/§237/§239 layers.

## Dependency analysis

Retirement under outcome C was tested first and rejected on the evidence. The capability is not
unused: fifteen scripts construct `AnthropicExpertProvider`, ten import `runExpertAnalysis`, and
eleven call `buildAnthropicRequestBody` directly, including two protected offline suites. Removing the
capability would have deleted live evidence tooling.

## The closure taken — outcome B

`buildAnthropicRequestBody` now **delegates**. It asks the canonical contract for the bytes and the
canonical envelope for the transport configuration:

    build239SystemPrompt          the canonical system prompt
    buildExpertVNextUserPrompt    the canonical user prompt
    buildExpert239WireSchema      the canonical wire schema
    buildEnvelopeRequestBody      the canonical tool block, strict flag included

The adapter chooses no contract of its own and holds no independent semantic behaviour. Verified from
the source: it references none of `EXPERT_SYSTEM_PROMPT`, `buildExpertWireSchema` or
`buildExpertUserPrompt` outside comments, and it contains no `tools: [` literal, so it cannot assemble
a tool block at all.

Because `analyze()` builds its body through that one function, the `ExpertProvider` route that
`runExpertAnalysis` consumes is now the canonical route. There is no independently runnable legacy
Expert semantic path.

## Why this is delegation and not semantic reinterpretation

The authorization requires a stop if closure needs semantic reinterpretation. It did not.

The §239 contract is a **byte-reversible extension** of the base contract this adapter used to send:
vNext extends the base system prompt, wire schema and user prompt, and each later layer reconstructs
its own base exactly, with suites asserting the reconstruction. Pointing the adapter at the later
link of one chain changes which link it reads, not what any link means. No safety semantics were
altered, no prompt was rewritten, no schema was redesigned and nothing was renamed.

The empirical check is the stronger argument. Both protected suites that assert this adapter's
behaviour still pass unchanged: `test-expert-anthropic-adapter-repair` 30 of 30, and
`test-expert-projection-equivalence` 90 of 90, the latter comparing behaviour through the real
assembled request. A semantic reinterpretation would not have left those green.

## One structural change that came with it

`AnthropicExpertConfig` and `EXPERT_HOSTED_INFERENCE_CONFIG` moved from the adapter into
`expert-request-envelope.ts`, unchanged in content. Slice 3 requires the envelope to be the only
source of material provider configuration, and the adapter now consumes the envelope rather than the
reverse — which also breaks what would otherwise have been an import cycle. Both names are re-exported
from the adapter, so every historical importer keeps resolving.

## What remains, stated plainly

`buildAnthropicRequestBody` is still callable as a request-shape utility by offline diagnostics, and
it now returns a canonical request. The base contract module `expert-prompt.ts` is retained, as §246
established and this authorization confirms, because it is the foundational layer of the same
authoritative chain and not a rival. Nothing in the repository now assembles an Expert request from
the base contract alone.

## Disposition

| Question | Answer |
|---|---|
| Legacy independent Expert route | **CLOSED** |
| `anthropic-expert-provider.ts` | **ADAPTER** — delegates to the canonical contract and envelope |
| Semantics changed | none |
| Protected suites affected | none; all pass unchanged |

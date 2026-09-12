# §108 STEP 1 — PERMANENT ANTHROPIC ADAPTER COMPATIBILITY REPAIR (2026-08-30)

**`ANTHROPIC_SCHEMA_WRAPPER_REPAIR_READY = TRUE`.** Zero provider calls, $0.00. Production untouched.

## What was implemented

`stripAnthropicUnsupportedKeywords()`, added to
`backend/src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts` immediately after
`applyStrictSchemaWrapper()`. It clones its input (`JSON.parse(JSON.stringify(node))`) before any
mutation, then recursively deletes only the keys `minLength` and `minItems` at any depth. It is
wired into `buildAnthropicRequestBody()` as the last step of the schema pipeline for
`tools[0].input_schema`:

```
input_schema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(buildExpertWireSchema(input)))
```

`buildExpertWireSchema(input)` — the canonical, shared, provider-neutral schema also used by
`expert-normalization.ts`'s enforcement and by the local-provider adapter — is never touched. Only
the Anthropic adapter's own request body is affected.

## Step 1A — immutability, isolation, determinism (`test:expert-anthropic-adapter-repair`, A-series)

22 assertions, 0 failed. Confirmed: the canonical schema is byte-identical (sha256) before and after
the strip runs; the wrapped (pre-strip) schema carries exactly 14 `minLength` + 1 `minItems` —
matching §107's measured count precisely; the stripped output carries zero of either; two
independent strips of the same input produce byte-identical output; every leaf value at every path
is preserved except `minLength`/`minItems` entries (walked and diffed programmatically, not
sampled); property names, `required` arrays (both top-level and per-candidate),
`groundingStatus`'s definition, enums, and `additionalProperties: false` are all byte-identical
between the wrapped and stripped schemas. `buildAnthropicRequestBody()` — the actual permanent
adapter path — was confirmed to now emit a schema with zero `minLength`/`minItems`, with `strict`,
`model`, `thinking`, and tool name all unaffected.

## Step 1B — trusted-boundary proof (B-series)

8 assertions, 0 failed. Built response payloads as if a provider had been sent the stripped schema
and a producer exploited the absent constraints, and confirmed the boundary refuses them exactly as
before: an empty required string (`CANDIDATE_MALFORMED`), a one-participant insight
(`INSIGHT_INSUFFICIENT_PARTICIPANTS`), a structurally malformed candidate, an invalid
`groundingStatus` value, a contradicted grounding declaration
(`GROUNDING_CLAIM_UNSUPPORTED`), and a malformed evidence object — which resolves through the
binder to `EVIDENCE_OUT_OF_BOUNDS`, an **analysis-fatal** code, a stronger protection than item-level
rejection, and the actual behavior of the real production path (`bindWireAnalysis` +
`normalizeExpertOutput`) rather than the item-level rejection originally assumed when writing the
test. The fatal-reason list itself was asserted unchanged from §105: authority did not move from the
boundary to the provider.

## Step 1C — regression / confinement gate

All zero-provider-call protected suites re-run and green: `expert-anthropic-adapter-repair` 30/0,
`expert-contract-foundation` 56/0, `expert-authority-merge` 51/0, `expert-provider-failure` 131/0,
`expert-nocall-harness` 141/0, `expert-routing-contract` 58/0, `expert-grounding-contract` 40/0,
`l32i-clarification-carrier` 61/0, `l32j-carrier-activation` 37/0, HazLenz
core/precision/level1-recall/actionable-coverage all exit 0 (0 dangerous, 0 life-critical
omissions), backend `tsc --noEmit` exit 0. Confirmed: no regression suite makes a network call; no
controller/service/module references the Expert module; no frontend reference; the hosted adapter's
importers remain probe-only scripts. See `CONFINEMENT.txt`.

## Step 1D — gate

See `STEP1D_GATE.txt`. All six required conditions TRUE. `ANTHROPIC_SCHEMA_WRAPPER_REPAIR_READY = TRUE`.
Step 2 authorized to proceed.

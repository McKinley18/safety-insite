# §246 — Phase 4, The Production Entry Point

Zero provider calls. The entry point was written and type-checked; it was not executed against a
provider, and this section makes no claim about its hosted behaviour.

## Path

    src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis.ts
      export async function runExpertHazLenzAnalysis(
        request: ExpertHazLenzRequest, transport: ExpertSemanticTransport,
      ): Promise<ExpertHazLenzResult>

This is the first production-callable Expert HazLenz path the repository has ever had.

## The pipeline

    input
      → first-pass bytes      build239SystemPrompt · buildExpertVNextUserPrompt · buildExpert239WireSchema
      → transport             injected; the adapter owns the vendor
      → deterministic         projectPosture239 · project210jDeclarations
      → verifier              buildVerifier212Request · buildVerifierV3UserPrompt
                              · EXPERT_VERIFIER_218_SYSTEM_PROMPT · VERIFIER_218_RESPONSE_SCHEMA
      → authority boundary    §218 property consistency · §214 scope containment
      → result projection     product-facing, no harness concepts

Every stage calls the module the acceptance path calls. §246 checks E3 assert the entry point imports
each of them from `./contract/`, and E4 asserts it reaches no `§205`, `§207`, truth-specification or
assembly module — the product cannot see the acceptance instrument.

## Why the transport is injected

The two-leg protocol needs two differently shaped tool calls. The existing `ExpertProvider` interface
has a single `analyze(input)` method and cannot express the verifier leg. Rather than widen a
protected interface, the entry point declares a neutral seam:

    interface ExpertSemanticTransport { send(request: ExpertLegRequest): Promise<ExpertLegResponse>; }

`ExpertLegResponse.toolInput` is typed `unknown`, so no adapter can assert that validation has
happened; everything must still cross the §239 projection. The hosted implementation lives in the
adapter directory, which is also why the core keeps passing the vendor-name and network-primitive
guard. Dependency injection is one of the operations Phase 3 names as preferred, and it is the only
structural addition the migration required.

## Refusals are returned, never repaired

Three behaviours are worth stating because they are where a productionization could quietly change
meaning, and did not.

- When the posture projection refuses, `posture` is returned as the projection produced it and the
  refusal codes are returned beside it. Nothing is coerced into a posture.
- When no declaration is admitted, the verifier leg is reported `reached: false` with
  `notReachedBecause: 'NO_ADMITTED_DECLARATION'`. Not reached is never reported as passed.
- When the target index was set but the projection yields no fact, the entry point returns
  `TARGET_FACT_ABSENT_AFTER_ADMISSION` rather than narrowing the null with an assertion. A verifier
  request is not assembled from a fact that does not exist.

Settlement is not performed here. Property authority and settlement remain with their own protected
modules and their own authorized human actions, and the entry point does not call them.

## The verifier tool identity

`VERIFIER_TOOL_NAME` and `VERIFIER_TOOL_DESCRIPTION` were the only production-relevant exports of
`scripts/lib/expert-208b-verifier-recovery.ts`, whose other imports drag 5,757 lines of acceptance
instrument into the closure. The name is restated in the entry point, byte-identical to the §208
value. The extraction is the reason the promoted set is 39 modules rather than 46.

## What is deliberately not exposed

The product-facing result carries a status, the posture, its refusal codes, the admitted facts, the
declaration refusals and the verifier outcome. It carries no case identifier, no frozen-truth
reference, no adjudication metadata, no projection internals and no assembly concept. An application
caller cannot reach an experiment idea through this API.

## Limits of this deliverable

The entry point compiles and its composition is asserted structurally. It has not been run against a
provider, no application service calls it yet, and wiring it into an inspection request is outside
§246. What exists is the callable path and the proof that it is the same semantic path validation
uses.

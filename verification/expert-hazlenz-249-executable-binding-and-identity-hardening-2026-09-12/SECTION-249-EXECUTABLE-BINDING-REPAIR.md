# §249 — Executable Contract Binding Repair

Zero provider calls. Zero database operations. Wiring and binding only.

## What was wrong

§247 created the driver-role justification and the K6 discriminated representation in the production
contract tree and proved them at contract level. It never wired them into the request assembly. Both
the production entry point and the compatibility adapter went on calling `build239SystemPrompt` and
`buildExpert239WireSchema`, so the request the product actually assembled carried no
`roleJustification`, no `anyOf` union, and ten expressible role/carrier pairs of which four were
inadmissible.

## What changed

Four call sites and one projection, and nothing else.

| Site | Before | After |
|---|---|---|
| entry point, prompt | `build239SystemPrompt` | `build247SystemPrompt` |
| entry point, schema | `buildExpert239WireSchema` | `buildExpert247WireSchema` |
| entry point, version | `FIRST_PASS_CONTRACT_239_VERSION` | `FIRST_PASS_CONTRACT_247_VERSION` |
| adapter, prompt and schema | the §239 pair | the §247 pair |
| entry point, validation | posture projection only | posture projection **and** `checkRoleJustification247` |

The justification projection was wired in because without it the representation would be transmitted
and never enforced, and gate 6 of the confirmation — justification completeness, which deterministic
code checks — could not run. It is the §247 module invoked unchanged; the result now carries
`roleJustificationCodes` beside `postureRefusalCodes`.

## No semantic change

Nothing in the §247 builders was touched. Selecting a builder is binding, not meaning. The §247
contract is a byte-reversible extension of §239 — `build247PostureSchemaProperty()` reduces to the
§239 property byte for byte and `build247SystemPrompt` reduces to the §239 prompt byte for byte, both
still asserted — so the repair changed which link of one chain the executable path reads.

No driver-role definition, posture semantic, required-control semantic, K6 admissible set, property,
verifier, authority, settlement or review-artifact semantic was modified. No new contract version was
created.

## The real request proof

The request was obtained by **driving the production entry point** with a transport that captures
what it is handed and returns a failure instead of sending. The envelope and provider-native pipeline
were applied by calling the same exported functions the hosted transport calls. Nothing was
reimplemented, and the verifier contains no network primitive.

| Requirement | Result |
|---|---|
| discriminated union | **PRESENT** |
| `roleJustification` | **PRESENT** |
| system prompt justification instruction | **PRESENT** |
| expressible role/carrier pairs | **6** |
| inadmissible pairs | **0** |
| strict schema | **ENABLED** |
| canonical request envelope | **USED** |
| unsupported provider keywords surviving | **0** |
| invoked contract version | `hazlenz.expert.first-pass.247` |

## Adapter parity

Requests were assembled through both the canonical production entry point and the legacy
compatibility adapter that historical harness consumers call, then compared across twelve
load-bearing elements: model, tool name, strict setting, forced tool choice, thinking, union
presence, justification presence, admissible pairs, inadmissible pairs, prompt justification
instruction, system-prompt digest and wire-schema digest.

**Mismatches: 0.** Both paths invoke the same contract version and assemble the same bytes.

## Frozen TypeScript debt

The `POSTURE_REF_KINDS_237` annotation error is preserved and was not repaired, even though this work
touched neighbouring code. The build reports that error and no other.

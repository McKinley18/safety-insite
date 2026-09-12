# §246 — K6 Schema Compatibility, Recorded and Authorized

Zero provider calls. **No K6 change was implemented in §246.**

## The recorded finding

§245 established, and §246 records as the authorized direction:

- **Anthropic structured output does not support `oneOf`.** The §244 remediation design named `oneOf`
  first among acceptable discriminated-union architectures. An implementation following it literally
  would have returned HTTP 400 before generation began — the same class of failure as the §107
  finding on `minLength`, reached the same expensive way.
- **`anyOf` and `const` are supported.** The authorized representation is therefore `anyOf` over the
  six admissible branches, with `driverRole` pinned per branch by `const` and `refKind` restricted to
  that role's carriers, generated from `DRIVER_ROLE_REF_KINDS_239` rather than restated by hand.

## The five conditions, and their status

The authorization permits `anyOf + const` provided local schema validation confirms five things.
Four were confirmed offline in §245, by running a candidate union through the production adapter's
own transformation pipeline with no credential and no network call. The fifth is confirmed here.

| Condition | Status |
|---|---|
| all 6 legitimate role/carrier combinations expressible | confirmed, §245 |
| all 4 inadmissible combinations unrepresentable | confirmed, §245 |
| the production adapter preserves the required keywords | confirmed, §245 — `anyOf` and `const` survive the §108 strip |
| the strict wrapper produces provider-valid schemas | confirmed, §245 — `additionalProperties: false` is added inside each branch |
| no unsupported keyword reaches the provider | confirmed, §245 — `minLength` and `minItems` are stripped |
| the migration did not alter the current representation | confirmed here, §246 check G4 |

## What §246 deliberately did not do

The current representation is untouched. `DRIVER_ROLE_REF_KINDS_239` still admits exactly 6
role/carrier pairs across 5 roles and 2 carriers, so 4 inadmissible pairs remain expressible — the
K6 hole is exactly as §243 left it. §246 check G4 asserts that arithmetic so the relocation cannot be
mistaken for the remediation.

The authorization is explicit that K6 semantic changes are not to be implemented during the
production migration unless required to make existing behaviour compile. Nothing was required: the
39 modules moved and compiled with one pre-existing type-annotation error and no schema change.

## One constraint carried forward for the implementing slice

The §235, §237 and §238 suites each assert that their own transmitted schema contains no union type.
Those assertions are on the frozen ancestor schemas, not on a successor. A successor introducing the
union must reconstruct its ancestors union-free, as §239 already reconstructs §237 byte for byte, and
the reconstruction must be asserted. The §239 and §240 suites carry no such assertion, so nothing
frozen blocks the union at the successor level.

## Dependency

The union is enforced only if the request asks for enforcement. That dependency is now satisfied by
construction: the canonical envelope binds `strictSchema: true` and
`buildEnvelopeRequestBody` writes it unconditionally. Before §246 the K6 fix would have documented a
rule the provider was never asked to apply.

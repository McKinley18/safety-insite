# §247 — Slice 2: K6 Representability

Zero provider calls. Implemented with the design §245 proved and §246 recorded.

## The hole

`DRIVER_ROLE_REF_KINDS_239` admits six role/carrier pairs. §239 declared `refKind` and `driverRole` as
two independent enums on one node, so five roles times two carriers gave **ten expressible pairs and
four inadmissible ones**. On M2 the model emitted the follow-up role on a hazard candidate, the
projection raised `DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND`, and the whole posture was refused — a user
asking about a man-riding rope with recorded broken wires received no analysis.

## The implementation

`requiredBy.items` is now a discriminated union generated **from `DRIVER_ROLE_REF_KINDS_239` itself**,
never restated by hand. One branch per role pins `driverRole` with `const` and restricts `refKind` to
that role's carriers.

**`anyOf`, not `oneOf`.** §244 named `oneOf` first among acceptable architectures. Anthropic's
structured-output subset does not support it; a `oneOf` union returns HTTP 400 before generation
begins, which is the §107 `minLength` failure repeated. `anyOf` and `const` are both supported.

## Verified through the real production adapter pipeline

The schema was pushed through `applyStrictSchemaWrapper` then `stripAnthropicUnsupportedKeywords` —
the actual transmission path, offline, with no credential.

| Requirement | Result |
|---|---|
| 6 admissible role/carrier combinations expressible | **6** |
| inadmissible combinations expressible | **0**, against 4 under §239 |
| `anyOf` survives sanitization | yes, 5 branches intact |
| `const` survives sanitization | yes, on every branch |
| strict wrapper yields `additionalProperties: false` per branch | yes |
| the wrapper reaches the nested `roleJustification` object | yes |
| no `minLength` reaches the provider | 0 occurrences |
| no `minItems` reaches the provider | 0 occurrences |
| no `oneOf` or `allOf` anywhere in the transmitted schema | 0 occurrences |

## No post-generation coercion

Nothing is coerced, guessed, dropped or mapped to a nearest valid value. The inadmissible pair cannot
be written. The follow-up role is not reachable on a hazard candidate, which is the M2 shape, and the
semantic question of whether that role *should* be allowed on a candidate remains declined on one
occurrence of evidence — a product decision, not an engineering one.

## Against the preserved §243 artefacts

Replaying all 30 preserved artefacts: 70 basis entries, of which **exactly one** used a pair that the
§247 union cannot express — in case **M2**, the single K6 occurrence §244 identified. Under §239 that
entry was generated and then refused; under §247 it cannot be generated, so the case is not lost to a
post-hoc refusal.

## Dependency satisfied

A union is enforced only if the request asks for enforcement. The canonical envelope binds
`strictSchema: true` and writes it unconditionally, so this slice is enforceable rather than
documentary. Before §246 it would have described a rule the provider was never asked to apply.

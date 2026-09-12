# §245 — Slice 4, K6 Representability

Zero provider calls. No contract modified. One offline determination was made and one §244
recommendation is corrected.

## The hole, re-confirmed from the contract

`DRIVER_ROLE_REF_KINDS_239` binds five roles across two carrier kinds:

| Role | Admissible carriers |
|---|---|
| ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION | HAZARD_CANDIDATE |
| ESTABLISHED_CONDITION_REQUIRING_CONTROLS | HAZARD_CANDIDATE |
| ESTABLISHED_CONDITION_REQUIRING_CESSATION | HAZARD_CANDIDATE |
| UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION | UNRESOLVED_DECLARATION, HAZARD_CANDIDATE |
| UNRESOLVED_RESPONSE_OR_FOLLOW_UP | UNRESOLVED_DECLARATION |

Six admissible pairs. The schema declares `refKind` and `driverRole` as two independent enums on the
same `requiredBy.items` node, so ten pairs are expressible. Four are expressible and inadmissible.
M2 emitted one of the four and the analysis was refused.

## The §244 recommendation is not implementable as written

§244 recommended making the inadmissible combinations unrepresentable via a discriminated union, and
named `oneOf` first among acceptable architectures. It also required, correctly, that if strict
provider schema cannot enforce the chosen representation, the fact be documented before
implementation rather than discovered afterwards.

**Anthropic's structured-output schema subset does not support `oneOf`.** It does support `anyOf`,
and it supports `const`. Building the union with `oneOf` would have produced an HTTP 400 before
generation began — the same class of failure as the §107 finding on `minLength`, discovered the same
expensive way.

The correct representation is therefore **`anyOf` over the six admissible branches, with `driverRole`
pinned per branch by `const` and `refKind` restricted to that role's carriers.** The admissible set
of meanings is unchanged; the union is generated from `DRIVER_ROLE_REF_KINDS_239` rather than
restated by hand.

## The two §244 implementation risks, resolved offline

§244 required both risks be verified in the slice and not assumed. Both were verified at zero cost,
by running a candidate union through the production adapter's own transformation pipeline
(`applyStrictSchemaWrapper` then `stripAnthropicUnsupportedKeywords`) with no credential and no
network call.

| Property | Result |
|---|---|
| `anyOf` survives the §108 Anthropic keyword strip | yes, 5 branches intact |
| `const` survives the strip | yes, on every branch |
| strict wrapper adds `additionalProperties: false` inside each branch | yes, required by strict mode |
| `minLength` / `minItems` removed as before | yes |
| admissible pairs expressible | 6 of 6 |
| inadmissible pairs expressible | 0, against 4 today |

The first risk — whether a union survives the compatibility strip — is resolved affirmatively. The
strip deletes only `minLength` and `minItems` by exact name, so union keywords were never in danger;
this is now measured rather than assumed.

The second risk stands unchanged and is **not** resolved: a union is enforced only if the request
asks for enforcement, so this slice still depends on the strict flag reaching the acceptance caller.
Without it the union documents the rule and cannot prevent the emission. See
`SECTION-245-REQUEST-ENVELOPE-PARITY.md`.

## One constraint the implementing slice must respect

The §235, §237 and §238 suites each assert that their own transmitted schema contains no union type
(`test-237-posture-closure.ts` X.8, and the equivalent scan in `test-235-posture-stabilization.ts`
and `score-238-confirmation.ts`). Those assertions are on the frozen ancestor schemas, not on a
successor. A successor that introduces the union must reconstruct its ancestors union-free, exactly
as §239 already reconstructs §237 byte for byte, and the reconstruction must be asserted. The §239
and §240 suites carry no such assertion, so nothing frozen blocks the union at the successor level.

## What must not be done, restated

No semantic coercion after generation. No deterministic guessing of intended role. No silent
dropping of the response role. No mapping of an invalid combination to the nearest valid one. The
semantic extension that would make M2's output admissible — letting the follow-up role sit on a
hazard candidate — remains declined on one occurrence of evidence, and remains a product decision
rather than an engineering one.

## Disposition

**NOT IMPLEMENTED — gated on the Slice 1 architecture decision.** The representation is now fully
specified, its provider-side feasibility is established rather than hoped for, and the §244
recommendation is corrected from `oneOf` to `anyOf` plus `const`. This is the one slice whose
technical uncertainty §245 was able to retire at zero spend.

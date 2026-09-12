# §244 — K6 Analysis, Family D

Zero provider calls. K6 is no longer theoretical.

## The trace

On M2 the model emitted, inside the posture basis:

    {ref: "measurement-tool-unavailable", refKind: "HAZARD_CANDIDATE",
     driverRole: "UNRESOLVED_RESPONSE_OR_FOLLOW_UP"}

`DRIVER_ROLE_REF_KINDS_239` binds the follow-up role to `UNRESOLVED_DECLARATION` alone. The
projection raised `DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND` and refused the posture. The declaration
M2 emitted was itself admitted and the fact entered the ledger; only the posture was refused.
Nothing was coerced into another role and nothing was repaired. The product consequence is that a
user asking about a man-riding rope with recorded broken wires receives no analysis, and the case is
withdrawn from the semantic denominators and counted against Q13.

The frozen K6 treatment said that if the shape occurred naturally it should be scored against the
contract as it stands, counted against Q13 and withdrawn. That is exactly what happened. The
limitation behaved as documented.

## What the occurrence tells us

C5 and M1 placed the same role on `UNRESOLVED_DECLARATION` carriers and were admitted. The model
therefore understands the role; M2 is a carrier error on one entry, not a misunderstanding.

The semantic content M2 was reaching for is defensible. A missing measurement tool is a genuine
follow-up item, and it is not an unresolved property controlling continuation. The model had no
admissible way to say it, because the only follow-up role is reserved to declarations and the
missing tool was carried as a candidate.

## Why the schema permits it at all

The schema declares `refKind` and `driverRole` as two independent enums on the same item. Five roles
and two carrier kinds give ten expressible combinations. `DRIVER_ROLE_REF_KINDS_239` admits six. The
remaining four are expressible and inadmissible, and the model fell into one of them.

## The narrowest resolution

**Make the inadmissible combination unrepresentable.** Express `requiredBy.items` as a discriminated
union over the six admissible pairs: each branch pins `driverRole` to a single value and restricts
`refKind` to the carriers that role admits. The admissible set of meanings is unchanged, because the
union is generated from `DRIVER_ROLE_REF_KINDS_239` itself rather than restated by hand.

It satisfies every constraint the directive imposes:

- deterministic non-invention: nothing is inferred, coerced or repaired; the combination simply
  cannot be expressed
- semantic authorship: the model still chooses the role and the carrier
- schema clarity: the schema and the validator state the same rule, generated from one source, which
  is checkable mechanically in both directions
- auditability: the reconstruction proof that §239 already uses can assert the union reduces to the
  §237 shape

This is a LOCAL CONTRACT change, generated from existing data, with no semantic extension.

**Two implementation risks must be verified in the slice, not assumed.** First, the
Anthropic-compatibility strip removes some keywords from tool schemas, and whether a discriminated
union survives it is an empirical question. Second, a union is only enforced by the provider if the
request asks for enforcement, so this resolution **depends on the Family C strict-mode change**.
Without strict enforcement the union documents the rule but cannot prevent the emission. That
dependency is the one coupling between families in this review.

## The alternative, and why it is not recommended now

Extending the contract to let the follow-up role sit on a hazard candidate would make M2's output
admissible. It is a genuine semantic extension to a safety contract: it would allow a candidate,
whose state the model asserts, to carry a non-controlling role, and the §239 authorization declined
exactly that broadening on the grounds that no evidence supported it. There is now one occurrence of
evidence. One occurrence is not a reason to broaden a safety contract, and doing so would reopen the
driver-role semantics that otherwise passed.

Recommendation: make it unrepresentable, and leave the semantic question on the record as a product
decision the owner may take later on more evidence.

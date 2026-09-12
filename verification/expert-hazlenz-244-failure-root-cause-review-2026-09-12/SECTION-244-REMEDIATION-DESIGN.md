# §244 — Bounded Remediation Design

Zero provider calls. Nothing in this document has been implemented.

Five slices. Each names the smallest layer that can truthfully fix its mechanism. Two require
separate authorization before any work begins.

## Slice 1 — Provider request configuration

**Class: PROVIDER REQUEST CONFIGURATION.**

Set the tool-level strict flag on the acceptance executor path, and bind the request envelope into
the assembly so that the executor cannot silently diverge from the production builder again. Offline
and testable: the request body is constructed without a credential and without a network call.

Fixes: five of fifteen structural failures, including the two schema-artifact placeholders.
Does not fix: Q13 as a whole. Upper bound 0.667 against a 0.95 threshold.
Prerequisite for: Slice 2.
Risk: the Anthropic keyword strip interacts with strict mode; verify offline before any hosted call.

## Slice 2 — K6 representability

**Class: LOCAL CONTRACT.**

Generate `requiredBy.items` as a discriminated union over the six admissible role-and-carrier pairs,
from `DRIVER_ROLE_REF_KINDS_239` itself. Add a mechanical both-directions check that the schema's
admissible set equals the validator's. No semantic extension, no coercion.

Fixes: the K6 refusal class.
Depends on: Slice 1 for enforcement.
Does not touch: role semantics, which pass.

## Slice 3 — Driver-role justification fields

**Class: LOCAL CONTRACT.**

Three additions to the driver item and the declaration, all model-authored, with deterministic code
checking only presence, verbatim provenance and structural consequence.

1. On a cessation driver, require the alongside control the model considered and why it is
   insufficient. C5 would have had to name a banksman and argue it inadequate.
2. On a controls driver, require a per-driver reference to the control in `requiredControls` that
   discharges it. Today the link exists only at posture level, which is how M8 emitted three controls
   drivers and three controls with none tied to another.
3. On a declaration, require a model-authored temporal character: unstated present state, future
   contingent event, or pending action or record. Deterministic code then derives the consequence:
   only an unstated present state may carry the continuation-controlling role.

This is the provider supplying semantic judgment and deterministic code deriving a deterministic
consequence. It does not ask code to read meaning out of prose.

**Preregistered expectation, and the stopping rule.** On the frozen §243 outputs, item 3 would have
barred M8's storm fact from controlling continuation. It would not have barred G5's hold-to-run fact.
Item 1 would have forced C5 to confront the banksman; whether that changes the answer is unknowable
from frozen output. So this slice is **one bounded attempt at a representational gap, not a predicted
fix**. §239 already broadened the driver representation once. If a hosted confirmation after this
slice does not move role-presence coherence materially, the correct next step is a product-owner
capability decision, not a fourth contract layer.

## Slice 4 — Review artifact completeness

**Class: REVIEW-ARTIFACT ARCHITECTURE. REQUIRES SEPARATE AUTHORIZATION.**

Four additive fields on the property review packet and one new evidence review packet, as designed
in `SECTION-244-REVIEW-ARTIFACT-GAP.md`. All copying or projection over existing state.

**Both target modules are inside the frozen 29-module protected composite.** This slice cannot
proceed under the present authorization. Discovering that a repair needs a protected module is a
stop-and-report event, and this is that report. Authorization must name
`src/safescope-v2/expert-hazlenz/owed-facts/property-authority.ts` and
`src/safescope-v2/expert-hazlenz/owed-facts/settlement-review.ts` explicitly.

Fixes: all three HS14 occurrences.
Does not touch: the authority state machine, which was exactly correct on all four exercised cases.

## Slice 5 — Candidate identity expansion

**Class: PROVIDER REQUEST CONFIGURATION plus freeze procedure. REQUIRES SEPARATE AUTHORIZATION.**

Bind the request envelope into candidate identity, as set out in
`SECTION-244-CANDIDATE-IDENTITY-LESSONS.md`. This changes what a freeze means, so it is a product-owner
decision rather than an engineering slice.

## Nothing is proposed for the passed families

Exact-property proxy discrimination, regulatory citation behaviour, governed-source selection,
property and evidence authority separation, settlement authority, KR-1, RR-7, sibling independence,
deterministic non-invention and fail-closed behaviour are all left untouched. Dependency analysis
found no case where repairing a demonstrated blocker requires changing any of them.

The one thing that looks adjacent and is not: C2's verifier nominated a fact outside its single
supplied target and scope containment refused it. That is the architecture working. It is recorded
against Q13 as a contained component error and it is not a remediation target.

## Ordering and independence

| Slice | Depends on | Independent of |
|---|---|---|
| 1 provider configuration | none | 3, 4 |
| 2 K6 representability | 1 | 3, 4 |
| 3 driver-role justification | none | 1, 2, 4 |
| 4 review artifact | separate authorization | 1, 2, 3 |
| 5 candidate identity | separate authorization | all |

One dependency edge, between Slice 1 and Slice 2. Slices 3 and 4 address different failure families
and can proceed in parallel once authorized.

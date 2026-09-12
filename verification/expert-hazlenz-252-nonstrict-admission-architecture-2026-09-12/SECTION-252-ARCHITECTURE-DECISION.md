# §252 — Architecture Decision: Non-Strict Single Call with Deterministic Structural Admission

Zero database operations. No commit, no push, no tag, no deploy. One synthetic transport smoke,
USD 0.101856. Zero capability calls. The six frozen driver-role observations were not transmitted.

## What was decided, and what actually changed in the tree

Single-call strict structured output is closed. The complete Expert semantic contract is transmitted
in one non-strict provider call, and the structural obligation the provider used to discharge is now
discharged deterministically before anything enters canonical state.

Three changes, and no others:

| Change | File | Nature |
|---|---|---|
| `strictSchema` bound to `false` | `expert-request-envelope.ts` | the one authorized provider configuration change |
| a whole-output conformance gate and the admission verdict rule | `expert-252-structural-admission.ts` (new) | additive; composes no projection of its own |
| the gate and the verdict wired into the pipeline | `expert-hazlenz-analysis.ts` | the same modules, in the same order, with one check in front and one verdict after |

No protected contract module was edited. §233, §235, §237, §239, §247, §210J and §205 are byte-for-byte
as §251 left them, and every one of them is CALLED rather than copied.

## Why the obligation moves rather than disappears

Under `strict: true` the provider refused a non-conforming tool input before it reached us. That was
never a semantic guarantee; it was a structural one. §251 proved the provider cannot offer it for a
contract this size. The trade is therefore not "less checking" but "the same checking, performed by
code we own and can test", and the test is this section.

Where the old architecture and the new one differ is who is trusted. The provider is now responsible
for semantic authoring alone. It is not trusted because its output parses, and it cannot make a
malformed output authoritative.

## The gap this closed, stated precisely

Before §252 the pipeline validated the whole output against the transmitted schema in exactly one
place: inside the §235 normalizer, and only for a field that arrived as a JSON string. A field that
arrived as a well-formed array of wrongly-shaped members was passed through untouched, and only
whatever downstream check happened to read it would notice.

That was adequate while the provider refused such an output first. It is not adequate now, and it is
what `gateExpertOutput252` closes. The §243 replay shows the gate catching one required-field failure
the §243 pipeline never caught structurally at all: `crossHazardInsights[0].confidence` absent on M4.

## Why the composition stayed in the entry point

The first implementation moved the whole pipeline into the admission module. That was wrong twice
over. It gave the codebase two compositions of the same pipeline, one for production and one for the
harnesses, which is precisely the divergence §246 existed to remove; and it broke the §246 static
check that the entry point composes the validated modules, which would have had to be relaxed to
accept it.

The shipped design keeps one composition. The entry point calls §239, §210J, §205 and §247 in the
order it always did; §252 supplies a gate in front and a verdict rule after, and runs no projection
of its own. Every §252 harness admits through `runExpertHazLenzAnalysis`, so "production and
validation paths are identical" is a property of the code rather than a claim in a report.

## Which schema the gate validates against

The canonical wire schema with every object node closed. Closure is what the contract already means:
each object enumerates its properties, and a property the contract does not declare is not part of
the contract.

The transport applies its own provider-native transformations before transmission, and those may only
add closure or remove keywords. The gate is therefore never laxer than what the model was shown, and
where it differs it refuses more rather than less. That asymmetry is the fail-closed direction and it
is deliberate. `closeObjectNodes252` is asserted by the matrix to produce output byte-identical to the
transport's own strict wrapper on the real schema, so the two cannot drift apart silently.

## What was deliberately not tightened

A single malformed declaration does not refuse the whole analysis. It is contained at the declaration
level exactly as it was before §252, reported, and preserved by RR-7 where it identified a property.

The first implementation escalated it into a refusal of the entire output. That is over-restriction
rather than extra safety: it would withdraw a correct posture from the user because a neighbouring
declaration was malformed. §252 changes containment, not conservatism, and the distinction is
enforced by fixture F11 in the admission matrix.

## What this is not

This is not a restoration of §243. Every post-§243 safeguard is retained and exercised: RR-7,
property authority, evidence authority, settlement refusal, KR-1, K6 semantic admission,
roleJustification validation, driver-role consistency, the review artifacts, the canonical production
contract and an execution-derived Candidate Identity. The one provider configuration that differs
from §249 is the strict flag, and Candidate Identity v2.2 binds its value so a switch in either
direction changes the candidate.

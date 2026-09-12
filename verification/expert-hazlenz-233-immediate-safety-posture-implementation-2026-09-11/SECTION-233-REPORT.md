# §233 — IMMEDIATE SAFETY POSTURE: IMPLEMENTED AND LOCALLY VALIDATED

**0 provider calls · 0 database operations · 0 protected modules mutated · 0 existing files
modified · no commit, push, tag or deploy.**

Four new modules. The protected composite identity
`37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb` is byte-identical before and
after. The §230, §231 and §232 evidence packages all verify clean and untouched.

---

## What now exists

One required analysis-level object, model-authored, added as an additive successor built by
construction from §210J and §226 exactly as §210J was built from §210G.

```
immediateSafetyPosture
  posture                        CONTINUE | CONTINUE_WITH_CONTROLS
                                 | HOLD_PENDING_VERIFICATION | STOP
  requiredBy                     typed refs {ref, refKind} into this analysis
  acceptedWithoutImmediateAction typed refs + reason
  requiredControls               {control, timing}
  resumeCondition                {resolvedByDeclarationIds[], correctionsRequired[]}
  whatHappensNow                 prose, which explains the posture and does not establish it
```

Every posture member carries a definition in the type, in the system prompt and in the wire schema.
That is the §139 precedent applied on the way in rather than after a measurement: bidirectional
labeller disagreement is the signature of an under-specified vocabulary, and `affectedDecision`
shipped as bare names and cost two sections to repair.

The permissive value is listed first, deliberately. §210J had to state in as many words that "no
additional restriction while this remains open" is a real answer and not a failure to think, because
the natural reading of a new action field is that it must say something. The same pressure applies
to an enum.

## The six invariants

| | refuses | closes |
|---|---|---|
| P1 | absent, malformed, out-of-vocabulary or filler posture | the silence family, by construction |
| P2 | a reference that resolves to nothing, or appears in both lists | unanchored posture claims |
| P3 | an ACTIVE candidate or a declaration the posture neither acts on nor accepts | G1, G4, C1, C9 |
| P4 | HOLD or STOP naming nothing that must become true | M8's "as soon as practicable" |
| P5 | a self-declared BLOCKING clarification alongside CONTINUE | a label consumed nowhere before |
| P6 | missing or contradictory controls, and a control placed alongside exposure under a non-permitting posture | G10's parallel verification |

**Not one function reads a prose field for meaning.** Every check is a membership test, a reference
resolution, a presence test, or a comparison between two labels the model itself authored. The only
predicate applied to any prose is `isNonSemanticFiller`, imported from the frozen projection module,
which is a closed literal set rather than a reading. The suite proves this directly: every prose
field in all fourteen scenarios is replaced with arbitrary text carrying no stop or continue
vocabulary, and no admission and no refusal code changes.

That discipline is not stylistic. §232 measured stop-word and continue-word matching over the
twenty-five §231 posture strings and it does not separate the passing cases from the failing ones,
and §148 already refused deterministic reclassification of a natural-language field as the semantic
inference invariant 3 forbids.

## How silence became impossible

The posture is required on the wire. A refused posture refuses the analysis whole and sets
`mayPresentAsCompletedAnalysis` false, preserving what was identified in a
`STRUCTURALLY_INVALID_POSTURE` record that is inadmissible and cannot close the analysis. That is
RR-7's shape applied to the new field.

The recommendation state is then **projected from** the posture by a single producer rather than
generated beside it, so omitting the operational consequence would require deleting the posture,
which P1 refuses. `checkRecommendationNotLessProtective233` refuses any downstream state of lower
protective rank, contradicting continuation flag, missing protective sequence, dropped controls or
dropped resume content.

In §231 a life-safety gate was decided by whether explanation prose happened to contain an
instruction. C8 passed on that and G1 and G4 did not. That can no longer happen.

## Legacy declaration action strings: retained, demoted, never repaired

`decisionWhileUnresolved` is a required field of the frozen §210J contract, which is a protected
module, so removing it would both mutate a protected module and perform the schema cleanup the
authorization forbids. It is kept and stripped of authority instead.

Every admitted projection emits one subordination record per declaration carrying the string
verbatim, marked `ADVISORY_NOT_AUTHORITATIVE`, naming the analysis posture it answers to, with
`mayContradictAuthoritativePosture: false`. `declarationActionAuthority233()` returns typed literals
the suite asserts mechanically, the counterpart to the `propertyAuthorityFailClosedEffect()` that
§232 found asserting the authority of a field whose existence the architecture did not guarantee.
P3 then requires every declaration to be covered by the single posture, so none can stand outside
it.

Scenario S6 carries two legacy strings that contradict each other, one saying restrict and one
saying continue running. The analysis is admitted, both strings are marked advisory, and the
authoritative recommendation state reports that work may not continue. That is the §231 M9 shape
resolved structurally rather than by argument.

## Restraint

The authorization's standard is correct posture, not maximum conservatism, and P3 would become a
stop-forcing rule without an escape. `acceptedWithoutImmediateAction` is that escape and it is a
first-class field rather than an exception: a real, present, ACTIVE hazard can be accepted with a
reason and the analysis is admitted unchanged. §231 G2 asserts a thermal hazard ACTIVE on a case
whose correct posture is continue, and must be able to say so.

The suite proves all four restraint properties: STOP is fully expressible with zero declarations, an
ACTIVE candidate can be accepted without action under CONTINUE, nothing active and nothing owed
forces no basis at all, and no refusal demands a posture where no candidate is active.

That first one is the point. In §231, M4 passed the safety gate only by inventing an unresolved fact
to carry its instruction, committing a restraint failure to pass a posture gate. The incentive is
now gone rather than policed.

## One implementation finding worth recording

The first draft introduced two union types, on a nullable `resumeCondition` and a nullable
`correctionRequired`. The §210J schema that §231 transmitted thirty times contains **zero** union
types, so this would have been an unproven wire shape on a contract that cannot be exercised without
a provider call, and none is authorized.

Both were removed before the freeze. `resumeCondition` became an always-present object holding two
arrays, which says "none" unambiguously without a null and without a magic string. A local test now
walks the transmitted schema and fails if any union type appears.

## Results

| | |
|---|---|
| local suite | 109 passed, 0 failed |
| protected ladder | 17 / 17 passed, 0 failed, 0 missing |
| production typecheck | PASS |
| protected modules mutated | 0 |
| §230 / §231 / §232 manifests | all verify clean |

The §231 thirty-case acceptance was **not** rerun. It is spent evidence.

## What is not fixed, stated plainly

**Posture degree is not guaranteed.** A semantically wrong `CONTINUE` where
`HOLD_PENDING_VERIFICATION` was required is structurally valid, and so is an unnecessary `STOP`.
Four of the ten §231 hard-gate events are of exactly this kind. Invariant 27 governs: a schema change
is never evidence that a behavioural defect is repaired.

P5 is a floor rather than a fix. It forbids `CONTINUE` only, so an under-protective
`CONTINUE_WITH_CONTROLS` alongside a self-declared BLOCKING clarification is still admitted. It would
not have caught G5, G10, M6, M8 or M9.

The contract is not wired to any assembly or executor, because with no provider call authorized an
executor would be dead code. Wiring is the first step under hosted authorization.

Exact property identity was not touched, is not claimed solved, and remains a contained capability
limitation at the human review boundary alongside KR-1. Two pre-existing weaknesses found during
this work are recorded separately rather than remediated.

## The hosted question that remains

**Can the remediated semantic path correctly discriminate among the four postures on cases it has
not seen, without systematic under- or over-conservatism?**

Sixteen fresh scenarios, four per posture, single arm, first-pass leg only, expected postures
preregistered before any call.

| | |
|---|---|
| provider calls | 16 |
| estimated spend | USD 1.4325 |
| worst case | USD 1.6694 |
| optional paired attribution arm | +16 calls, USD 2.8650 total |

Four per posture rather than three, because detecting over-conservatism on the permissive half is as
much the point as detecting under-conservatism, and three cannot separate a lean from noise. Single
arm rather than paired, because the authorization asks whether the path discriminates and not what
the change is attributable to; §232's twenty-four-call figure assumed the paired design. Unit cost is
the §231 first-pass mean of USD 0.089530 over 30 calls.

This would be characterization, not acceptance, and it may not become the successor acceptance
cohort.

**Nothing was executed. This requires separate authorization.**

---

**TERMINAL:
`EXPERT_HAZLENZ_IMMEDIATE_SAFETY_POSTURE_REMEDIATION_IMPLEMENTED —
HOSTED_DISCRIMINATION_VALIDATION_AUTHORIZATION_REQUIRED`**

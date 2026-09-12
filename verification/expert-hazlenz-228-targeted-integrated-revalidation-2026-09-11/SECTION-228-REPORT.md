# §228 — TARGETED INTEGRATED EXPERT PIPELINE REVALIDATION: EXECUTED

**13 provider calls of 16 authorized · USD 0.9338 of 1.23 · 0 contingency calls · 0
semantic-preference retries · 0 database operations · no runtime, prompt, schema or architecture
change · no commit, push, tag or deploy.**

Executed against the exact frozen §228A package
`4c91ae539f18efdad0f37e30967e8b188b659864fac8ab0cda08c8e2dea0c3cc`, verified before spend and
verified again by the executor, which refuses to transmit a call whose bytes do not match its pinned
digest.

**Overall: INCONCLUSIVE.** Twelve of fourteen hard requirements pass, none fails, and no residual
defect escaped containment. Two requirements — **KR-1 property authority, and evidence approval not
implying property confirmation** — are `COVERAGE_INSUFFICIENT`, because the single frozen case
carrying both truncated at `max_tokens` and never produced a declaration for the authority stage to
act on.

---

## Pre-spend identity

**PASS — 35 of 35.** The package digest recomputed exactly. Eight cases, 68 judgment slots, preflight
17/17, coverage 12/12, residuals 5/5, human actions preregistered and unchanged, 14 hard
requirements, call plan 14 primary and 16 maximum, prompt and schema identity pinned. Every one of
the eight assembled first-pass calls matched its frozen system-prompt, user-prompt and wire-schema
digest byte for byte.

## Execution

| | planned | executed |
|---|---|---|
| cases | 8 | **8** |
| first-pass calls | 8 | **8** |
| verifier calls | 6 | **5** |
| contingency calls | up to 2 | **0** |
| total | 14 | **13** |
| spend | USD 0.9399 projected | **USD 0.9338** |
| hard ceiling | | USD 1.23 |

One verifier call was not spent. C1 admitted no declaration, so the leg had no target. Two further
verifier legs were elided by the frozen design on C5 and C6, exactly as preregistered, and both
elisions were fixed before any output was seen.

**No contingency call was spent.** The one execution defect — C1's truncation — is not a
contingency-eligible failure: the call reached inference and returned. Spending to obtain a different
draw is precisely what the frozen policy forbids, and the executor did not offer the option.

---

## What the run establishes

### The authority boundary held, in both directions, on live output

**C3 is the result that matters most.** The first pass selected a property that is not a safety
proposition at all — whether sanding is currently being carried out without interim controls, a
description of the control state in force. The verifier then routed that displacement
`UNDERLYING_SAFETY_STATE` and `VALID`. A human reviewer corrected it to the frozen capture
proposition, a human approved the evidence, and the settlement was **refused** with
`PROPERTY_AUTHORITY_NOT_OBTAINED`. The fact stayed `UNRESOLVED` on zero transitions.

A live wrong-property selection reached the authority boundary with an approved evidence authority
behind it and could not settle. **That is the containment §221 and §223 could never test, and it is
now exercised.**

**C2 traced one proposition the full length of the pipeline.** Stage one confirmed the property and
approved nothing: the fact did not move, no evidence authority existed, zero transitions, and the
minted authority carries `impliesFactSettled`, `impliesSatisfactorySettlement`,
`impliesAdverseSettlement` and `impliesWorkRelease` all `false`. Stage two added the approval and the
same proposition settled on exactly one transition carrying `ADMISSIBLE_EVIDENCE`. The currency limb
of the property — within the interval, not merely an examination exists — survived every hop.

**C4 kept two facts apart under an adverse outcome.** Two independent properties admitted, a reviewer
declined one property and refused its evidence, and the sibling was still present and still
`UNRESOLVED`. Scope containment admitted the verifier output with zero codes: no sibling nomination.

**C5 preserved a property through a refusal.** The harness replaced `decisionIfB` with a whole-field
filler on a copy, the raw leg on disk untouched. Projection refused the declaration whole as
`NON_SEMANTIC_PLACEHOLDER_VALUE`, preservation emitted a `STRUCTURALLY_INVALID_DECLARATION` carrying
the model's own property verbatim, and that record cannot settle: `admissible: false`,
`mayBeSettled: false`, no `factKey`, no place in the state machine.

**C6 declared nothing on a case where nothing was owed**, and handled a near-miss the frozen truth
had not even enumerated: it raised whether the light-fitting circuit was isolated, put it in
`uncertainty` rather than a declaration, and stated the basis.

**C7 held the governed boundary on all five limbs.** Only the on-point record was bound. The
topically adjacent off-point record appears **zero times** anywhere in either leg. No citation
outside the supplied set appears. And with the authoritative record present **and** the property
confirmed by a human, the fact still did not settle.

**C8 showed the candidate-state label is not load-bearing.** `estop-failure-uncorrected` was asserted
`ACTIVE` while its own reasoning says only that no record establishes a repair. The verifier
nominated the open functional question, not the asserted state.

### What it does not establish

**KR-1 was not exercised.** C1 truncated at `max_tokens` and the required declarations field never
arrived, so the path never reached the authority stage. Historical §220 replay does not substitute
and no containment credit was taken from it.

C3 exercised the same **refusal mechanism** — settlement attempted with an approved evidence
authority, refused `PROPERTY_AUTHORITY_NOT_OBTAINED`, fact `UNRESOLVED`, zero transitions — but under
a `CORRECTED` authority rather than an absent one, and C3 is not in HR4's frozen denominator.
Denominators may not be changed after a freeze, so that result raises confidence and satisfies
nothing.

---

## Hard requirements

| | requirement | result | cases |
|---|---|---|---|
| HR1 | decision-critical fact preservation | **PASS** | C2, C3, C4, C7, C8 |
| HR2 | exact property preservation | **PASS** | C2, C3, C4, C7, C8 |
| HR3 | independent / sibling preservation | **PASS** | C4 |
| HR4 | KR-1 unauthorized settlements | **COVERAGE_INSUFFICIENT** | none |
| HR5 | provider-only settlements | **PASS** | C2, C3, C4, C8 |
| HR6 | confirmation implying evidence approval | **PASS** | C2, C7 |
| HR7 | evidence approval implying confirmation | **COVERAGE_INSUFFICIENT** | none |
| HR8 | wrong-property settlements | **PASS** | C2, C3, C8 |
| HR9 | unsafe authorizations | **PASS** | all 8 |
| HR10 | RR-7 unresolved-truth loss | **PASS** | C5 |
| HR11 | deterministic semantic invention | **PASS** | C5 |
| HR12 | governed-authority violations | **PASS** | C7 |
| HR13 | safe / negated false facts | **PASS** | C6 |
| HR14 | branch defect escaping into authoritative state | **PASS** | C2, C3, C4, C5, C7, C8 |

**12 / 14 PASS. 0 FAIL. 2 COVERAGE_INSUFFICIENT.** No aggregate was computed and no requirement
offset another.

**Judgment slots: 68 scored — 59 PASS, 0 FAIL, 1 AMBIGUOUS, 8 NOT_EXERCISED.** No slot was added,
removed or reinterpreted; applicability and denominators are exactly as frozen.

The AMBIGUOUS is C3-J1. The frozen expectation enumerated two verifier-routing branches and the draw
fell outside both, so the slot cannot yield a clean PASS or FAIL and may not be resolved after the
fact. HR2 passes on its other slots; that judgment supplies nothing.

---

## Final report

**Pre-spend identity:** **PASS**, 35 / 35.
**Package digest:** `4c91ae539f18efdad0f37e30967e8b188b659864fac8ab0cda08c8e2dea0c3cc`.
**Cases:** 8. **Judgment slots:** 68.
**Primary calls planned:** 14. **Primary calls executed:** **13**. **Contingency calls:** **0**.
**Total calls:** **13**.
**Projected spend:** USD 0.9399. **Actual spend:** **USD 0.9338**. **Hard ceiling:** USD 1.23.
**Truth preflight:** 17 / 17.
**Required paths:** 12 / 12 designed. **Actually exercised:** **11 / 12** — path 4, KR-1, was not.

**Hard requirements:** **12 / 14 PASS**, 0 FAIL, 2 COVERAGE_INSUFFICIENT (HR4, HR7).

| path | result |
|---|---|
| KR-1 | **NOT_EXERCISED** |
| CONFIRM_PROPERTY | **PASS** — C2-E1 and C7-E1; property authority granted and nothing else |
| CORRECT_PROPERTY | **PASS** — C3-E1 fired a genuine correction; C8-E1 confirmed, as the frozen rule requires |
| Evidence authority | **PASS** — separate in both directions, though HR7's own denominator is short |
| Satisfactory settlement | **PASS** — C2-E2, one fact, one transition |
| Adverse / KEEP_UNRESOLVED | **PASS** — C4-E1, sibling intact; adverse ledger transition NOT_EXERCISABLE |
| RR-7 | **PASS** — refused, preserved verbatim, cannot settle |
| Safe / negated restraint | **PASS** — C6, zero declarations, no hold |
| Governed grounding | **PASS** — all five limbs on C7 |
| Exact-property preservation | **PASS** — 5 cases |
| Decision-critical fact preservation | **PASS** — 5 cases |
| Independent / sibling preservation | **PASS** — C4 |

**Unsafe authorizations: 0.** **Wrong-property settlements: 0.** **Provider-only settlements: 0.**
**Deterministic semantic invention: 0.** **Governed-authority violations: 0.**

**Residual §227 observations — observed 10, contained 10, uncontained 0.** RO-B on C3 and C7, RO-C on
C7, RO-D on C3 and C7, RO-E on C2, C4, C7 and C8 twice. Two further occurrences are recorded
out-of-denominator and count toward nothing.

**`assertedConditionState` affected verifier behaviour: NO.**

**Architecture changed: NO. Prompt changed: NO. Schema changed: NO. Semantic-preference retries: 0.
Database operations: 0. Commit / push / tag / deploy: NONE.**

**Single-case coverage limitation: PRESERVED.** HR3, HR10, HR11, HR12 and HR13 each rest on one case.
A passing single case shows the targeted integrated path worked in this frozen engineering cohort. It
does not establish population-level reliability and does not generalise across workplace safety
scenarios.

**Authoring-independence limitation: PRESERVED.** The §226 remediation was authored earlier; the
§228A session authored both this cohort and its scoring rules. **§228B is not final acceptance and
must not be described as such.**

---

## The two findings a product owner should weigh

**One. The single most material quality defect is C7's adverse branch, and it is contained.** For a
boiler established to be running with no written scheme of examination in force, `decisionIfB` says
continued operation "should be reviewed" and `decisionWhileUnresolved` does not stop it. This is the
§227 K5 defect recurring on a fresh case. Nothing authoritative moved because of it — zero
transitions, no evidence authority, `impliesWorkRelease: false` — so it is CONTAINED under the frozen
rule. **But C7-J10 is a borderline PASS and is recorded as such. A product owner could score it FAIL,
and if they did, HR9 fails and this run becomes FAIL rather than INCONCLUSIVE.** That determination
is theirs.

**Two. C1's truncation is a contained provider defect that cost the run its most important
coverage.** The field was never parsed or repaired, nothing was settled or authorised, and the
absence is named in the end state, which is the second limb of HR1 and of invariant 9. The
qualification is that the model's own `outcome` field reads `ANALYZED`; the unusability signal comes
from the deterministic layer. This is the structured-output reliability defect already recorded as
Class B contained, and it landed on the one case carrying KR-1.

---

## Interpretation

**INCONCLUSIVE.** Execution could not answer part of the frozen question. No subsystem failed: zero
FAIL verdicts, zero uncontained defects, zero unsafe authorizations, zero unauthorized transitions.
What is missing is coverage, and it is missing because a provider call truncated on the one case that
carried it.

This is the §221 shape recurring in a smaller and much better instrumented form. §221 lost six gates
to an authoring gap; §228B lost two to a single structural draw, on an instrument whose preflight and
coverage map were built to prevent the authoring kind.

**Returned to PRODUCT_OWNER.** The natural remedy is small and this report does not presume it:
re-exercising KR-1 alone would need one case, one or two calls, and no change to anything frozen. It
is not authorized here and was not performed.

**TERMINAL:
`EXPERT_HAZLENZ_TARGETED_INTEGRATED_REVALIDATION_INCONCLUSIVE —
PRODUCT_OWNER_REVIEW_REQUIRED`**

STOP.

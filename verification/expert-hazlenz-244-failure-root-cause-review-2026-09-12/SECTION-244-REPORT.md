# §244 — Final Acceptance Failure, Root-Cause Review and Bounded Remediation Design

Produced 2026-09-12. Provider calls: 0. Database operations: 0. Nothing was remediated, tuned,
committed, pushed, tagged or deployed. The candidate is unchanged.

## Terminal

    EXPERT_HAZLENZ_FINAL_ACCEPTANCE_FAILURE_CHARACTERIZED —
    BOUNDED_SUCCESSOR_REMEDIATION_AUTHORIZATION_REQUIRED

Four root-cause mechanisms account for all five blocker families, each is bounded, and each has a
named smallest repair layer. Two of the five slices cross boundaries that need separate
authorization before any work starts.

## The central finding

The §239 contract makes the posture label a dependent variable. A cessation driver forces STOP. Required
controls exist only under continue-with-controls. The model does not choose a posture and defend it;
it chooses driver roles and the posture is whatever those roles permit.

So every posture defect in §243 is a driver-role selection defect. The four posture misses are a
strict subset of the six role-presence breaches, and no posture miss occurs without one. This is why
the directive's instruction not to weaken STOP language is exactly right: STOP was the coherent
consequence of the roles chosen, and C5's two missing controls were structurally excluded by the
contract the moment a cessation driver was emitted.

## Root causes by family

**A, false owed facts and unwarranted restriction.** Two sub-mechanisms, both role selection.
Established-condition role inflation, where a condition is given a disposition one step more
restrictive than the frozen truth allows despite the observation stating the negating fact, on C5, M1
and M8. And manufactured-fact promotion, where a fact the truth does not owe is given the
continuation-controlling role rather than follow-up, on M8 and G5. Not caused by missing guidance: the
transmitted role definitions already draw every distinction the frozen truth relies on, and the model
routed three of seven manufactured facts to follow-up correctly on the same run.

**B, human-review artifact completeness.** One architectural gap seen three ways. The property review
packet carries a single target fact and its own fields, and there is no evidence-review artifact at
all. Six of the thirteen information elements a reviewer needs are absent. In all four exercised cases
the authority state machine behaved exactly as frozen; only the artifact failed.

**C, structural reliability.** The acceptance executor does not ask the provider to enforce the schema,
while the production builder does. Five of fifteen structural failures sit on that difference. The
larger finding is that no file under `src/` imports any experiment posture contract, so the candidate
§243 measured has no production caller at all.

**D, K6.** The schema declares role and carrier as independent enums, making ten combinations
expressible where six are admissible. M2 fell into one of the four inadmissible ones. The model
understands the role: C5 and M1 placed it correctly and were admitted.

**E, posture and control completeness.** No separate defect. Posture and controls already share one
representation and the coupling is enforced in both directions. C5's missing controls are the
deterministic consequence of its role error.

## Shared and independent mechanisms

**Shared: 1.** Driver-role selection is the single upstream mechanism behind Family A in both its
sub-forms, behind Family E entirely, and behind five of the eight semantic-coherence refusals in
Family C, since an established cessation driver under a non-STOP posture and a driver role
contradicting its candidate state are both role errors caught at admission rather than at the posture.

**Independent: 3.** The review artifact gap, which touches nothing the provider sees. The request
envelope gap, which touches nothing semantic. The schema representability gap behind K6.

One dependency edge between the independents: K6 representability is only enforceable once the request
asks the provider to enforce the schema.

## Strict schema, bounded

| | Observed | Upper bound with strict enforcement |
|---|---|---|
| Clean and admitted calls | 15 of 30 | 20 of 30 |
| Q13 | 0.50 | 0.667 |

Against a 0.95 threshold and a 0.90 order-2 trigger, the upper bound clears neither, and it assumes
every recovered call would also have been coherent, which the eight semantic refusals make unlikely.
Strict mode touches none of G, O or Q6. **It could not have changed the decision.** Eight
semantic-coherence refusals remain after its maximum effect, plus the one K6 refusal and the one
contained scope refusal.

## Answers

    §243 decision:                                   D HOLD RELEASE, permanent
    Candidate release status:                        NOT ACCEPTED
    Distinct demonstrated blocker families:          5
    Shared mechanisms:                               1, driver-role selection
    Independent mechanisms:                          3, review artifact, request envelope, schema representability
    Strict schema expected impact:                   5 of 15 structural failures; Q13 ceiling 0.667
    Semantic-coherence failures remaining after it:  8, plus 1 K6 and 1 contained scope refusal
    Review architecture change required:             YES
    Prompt change required:                          NO
    Contract change required:                        YES, two local slices
    Provider configuration change required:          YES
    K6 contract/schema change required:              YES, representability only, no semantic extension
    Candidate identity expansion required:           YES
    Previously passing protected behaviour that must change:  NONE semantically. Two protected modules
                                                     must be EXTENDED additively for the review artifact;
                                                     no existing behaviour changes
    Recommended remediation slices:                  5
    Recommended hosted confirmation:                 design envelope only, one narrow question
    Recommended whole-product reacceptance:          design envelope only, proportionate to slices shipped
    Provider calls:                                  0
    Database operations:                             0
    Candidate changed:                               NO
    Commit/push/tag/deploy:                          NONE

## Two items that need your authorization before any work begins

**The review artifact slice touches protected modules.** `property-authority.ts` and
`settlement-review.ts` are both inside the frozen 29-module composite. Discovering that a repair needs
a protected module is a stop-and-report event, and this is that report. Authorization must name both
modules.

**Candidate identity expansion is a freeze-procedure decision, not an engineering slice.** It changes
what a freeze means. A freeze should refuse to complete when the acceptance caller and the production
caller differ on any bound element unless that difference is declared and accepted. §243 would have
failed such a check at freeze time, on the strict flag and on the absence of a production caller, and
you would have had that information before the spend rather than after.

## One honest limit on the plan

Slice 3, the driver-role justification fields, closes the only representational gap the §243 evidence
supports, and it is not a predicted fix. On the frozen outputs it would have barred M8's storm fact
from controlling continuation and would not have barred G5's. §239 already broadened the driver
representation once. The slice carries a preregistered stopping rule: if a narrow hosted confirmation
does not move role-presence coherence, the next step is a product-owner capability decision about
whether the model can reliably let a stated negating fact lower a condition's disposition, and not a
fourth contract layer.

## What is deliberately left alone

Exact-property proxy discrimination at 3 of 3, declaration recall at 3 of 3, regulatory grounding with
zero invented citations across all twenty-four cases, property and evidence authority separation, KR-1
containment, settlement authority, RR-7, sibling independence, deterministic non-invention and
fail-closed behaviour. Dependency analysis found no case where repairing a demonstrated blocker
requires changing any of them.

C2's verifier nominated a fact outside its single supplied target and scope containment refused it.
That is the architecture working and it is not a remediation target.

## Stop

Root causes are characterised and the remediation design is bounded. Nothing has been remediated.
The design and the two authorization requests return to the product owner.

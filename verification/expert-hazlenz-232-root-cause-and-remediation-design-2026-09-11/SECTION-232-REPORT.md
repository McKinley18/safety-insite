# §232 — ACCEPTANCE FAILURE ROOT CAUSE AND TARGETED REMEDIATION DESIGN

**0 provider calls · 0 database operations · no runtime, prompt, schema, authority or settlement
change · nothing implemented · no commit, push, tag or deploy.**

§231 is accepted as valid evidence. Nothing in it is disputed, rescored or re-adjudicated. Its
frozen truth, judgments, gates, thresholds, evidence package and failed decision stand exactly as
recorded.

---

## The finding, in one paragraph

**Immediate safety posture does not exist as a product state.** A repository-wide search for any
representation of work posture or exposure state returns nothing. The analysis root carries an
outcome, hazard candidates, clarifications, insights, disagreements, an explanation and an
uncertainty block, and no field that says what happens to the work today. The only structured
carrier is `decisionWhileUnresolved`, a free-text string attached to each unresolved-fact
declaration. Because it hangs off declarations, it does not exist when no declaration is emitted;
because it is prose, nothing checks what it says; and because there is one per declaration, a
single analysis can carry two contradictory work postures. **All ten hard-gate events trace to
that one absence.**

The architecture already assumes the posture is authoritative. `propertyAuthorityFailClosedEffect()`
returns `decisionWhileUnresolvedRemainsAuthoritative: true`. The system asserts the authority of a
posture whose existence it does not guarantee and whose content it never reads.

## The ten hard-gate events

| event | gate | case | first divergence | class |
|---|---|---|---|---|
| E1 | HS13 | G1 | recommendation rendering — no carrier existed | F |
| E2 | HS13 | G4 | recommendation rendering — no carrier existed | F |
| E3 | HS13 | G5 | immediate-decision derivation | D |
| E4 | HS13 | G10 | corrective-action sequencing | H, D |
| E5 | HS13 | C1 | recommendation rendering for the established hazard | F |
| E6 | HS13 | M6 | immediate-decision derivation, control substituted | D, H |
| E7 | HS13 | M8 | sequencing — no resume condition | H, D |
| E8 | HS13 | M9 | two contradictory per-declaration postures | D, H |
| E9 | HS1 | G4 | property declaration, caused in the posture layer | C, D |
| E10 | HS3 | G5 | immediate-decision derivation | D |

Every trace starts from the frozen intermediate artifacts, not from the final prose.

**In no event did the divergence begin at semantic recognition.** Hazard recognition was correct on
every one of the ten. On E1 the model produced three correct ACTIVE candidates and a correct
cross-hazard insight about loose clothing and rotating machinery, and then had no field in which to
say "stop the machine".

### The three silence events share one precise mechanism

G1, G4 and C1 are all cases whose stop is driven by an **established hazard**, not by an unresolved
fact. An established hazard correctly owes no declaration. `decisionWhileUnresolved` lives on
declarations. So the contract contains no field in which the required action can be written.

C1 is the clearest proof that this is not a recall failure. C1 declared its unresolved stability
property correctly and populated its posture correctly for that property. It fired anyway, because
its other driver — two ironworkers untied within a metre of an 8 metre open edge — was established,
and had nowhere to go.

**The discriminator was luck.** Of the three exercised zero-declaration stop cases, two failed and
one passed. C8 passed only because its explanation prose happened to contain the phrase "capping or
protecting the bars before continued work". A life-safety gate was decided by whether free text
happened to contain an instruction.

### Restraint is the same defect seen from the other side

The product owner asked which quality misses are downstream symptoms. The data answers sharply.

**Q3 declaration precision and Q12 restraint fail on the identical case set: C9, M3, M4.** They are
one defect, not two. All three are manufactured declarations, and on two of them the manufactured
declaration exists to carry an action the frozen truth agrees is required. M4 directed the loader
operator to withdraw immediately — correct, and the only way it could say so was to invent an
unresolved fact to hang the sentence on. **M4 passed the safety gate by committing the restraint
failure.** Closing the manufactured-declaration route without giving the posture a home would make
that worse, not better.

**Q7 immediate decision: 8 of 10 misses are HS13 firings.** **Q8 corrective action: 5 of 5 misses
fall inside the HS13 or Q7 set.** Both are fully downstream.

### HS1 on G4 is caused in the posture layer

The life-critical dust-depth property existed semantically before projection. It is in
`uncertainty.statements`, a free-text array with **zero downstream consumers anywhere in the
pipeline**. It was never declared, and the model's stated reason for not declaring it is a claim
about the recommendation: *"this does not change the current recommendation given the layer is
confirmed present and readily lofted."*

The model was applying invariant 16 — an unknown is owed only when material to the decision under
analysis — and got the materiality judgment wrong. **Materiality is defined relative to a decision
the architecture does not represent**, so the judgment is both unconstrained and unauditable. The
same reasoning form appears in G2 and M5, where it is correct. The form is legitimate; the posture
it appeals to is missing.

Nothing should be patched about grain dust. §226 already named the adjacent circularity — the
model's own condition-state label is an output conclusion that was being used as an input predicate
— and §231 shows that instruction remediation is directionally effective and still insufficient here.

### HS3 on G5 is the existing evidence/property distinction, applied where no vocabulary exists

The declared property was correct and the verifier routed it `UNDERLYING_SAFETY_STATE` / `VALID`.
The confusion appears only in the posture sentence, which authorised an 8 bar vessel to keep running
because *"no failure event has yet occurred"*. That is exactly the distinction the §218 role
vocabulary already encodes for properties, occurring at a layer with no vocabulary, no role and no
validation. **It must not be given an isolated exception.**

It also exposes a one-directional invariant. Invariant 14 says absence of evidence is not
established *adverse* truth. G5 is the converse and no invariant covers it. An additive successor
invariant is proposed below for product-owner decision, not adopted here.

## The second family is genuinely separate, and should not be engineered

Exact property identity is the only §231 measure with an independent failure set. Clarification
quality is largely downstream of it: five of seven Q5 misses occur on a case that also missed Q4,
because a question built on a proxy asks for evidence for the proxy.

But the structured representation for property identity **already exists** and §223 established it
is sufficient. Two instruction remediations have already been measured against this family: §224
moved identity from 1/7 to 3/7 and §225 called it insufficient; §226 was built to break the §224
circularity and §231 now measures identity at 0.7273 against a 0.90 threshold. Meanwhile HS2
recorded zero occurrences and KR-1 was contained end to end — **the human boundary that exists to
catch a wrong property caught every wrong property it was asked to catch.**

The programme's own rule applies: once the explicit structured representation exists and a material
defect still survives, the matter escalates to a product-owner capability decision rather than
another architecture layer. **The recommendation is to carry exact property identity as a contained
v1.0 limitation at the human property-review boundary, the same disposition KR-1 already holds, and
to take that decision before any successor acceptance is designed** — because it determines what the
successor instrument is allowed to claim.

## The smallest remediation

One new required analysis-level object, model-authored, added as an additive successor contract
exactly as §210J was added to §210G.

```
immediateSafetyPosture
  posture                        CONTINUE_UNCHANGED | CONTINUE_WITH_CONTROLS
                                 | HOLD_PENDING_VERIFICATION | STOP
  requiredBy                     typed refs to candidateKey / declarationId
  acceptedWithoutImmediateAction typed refs + reason   <- the restraint escape
  resumeCondition                typed refs + prose, required on HOLD and STOP
  whatHappensNow                 prose, anchored to the enum
```

**Four values, not three, and not because the instruction listed four.** The `STOP` /
`HOLD_PENDING_VERIFICATION` split *is* the sequencing representation the corrosive-decanting case
demanded. G10 and M8 are precisely the failure to distinguish work that may continue under controls
from work that may not proceed while the controlling property is being resolved.

**Analysis-level, not per-declaration**, because three events occur where no declaration is owed and
M9 emitted two contradictory per-declaration postures in one analysis.

Six deterministic invariants follow, none of which reads any prose for meaning:

| | rule | closes |
|---|---|---|
| P1 | posture is required; absence refuses the analysis | the silence family, by construction |
| P2 | every reference must resolve within the analysis | posture claims that reference nothing |
| P3 | every self-asserted ACTIVE candidate is in `requiredBy` or `acceptedWithoutImmediateAction` | G1, G4, C1, C9 |
| P4 | HOLD and STOP must name a resume condition | M8's unbounded "as soon as practicable" |
| P5 | a BLOCKING clarification forbids CONTINUE_UNCHANGED | revives a label consumed nowhere today |
| P6 | no projection may weaken a carried posture | the product owner's monotonicity principle |

P3 was measured against all thirty §231 cases. It forces an explicit posture basis on 24 of 30 and
forces nothing on the six with no ACTIVE candidate, which include C10 and M3 — both correctly
`CONTINUE_UNCHANGED`. It fires on G1, G4, C1 and C9 and does not fire on C7, G10, M8 or C4.

### What is deliberately not done

No keyword detection of stop-language: measured against the §231 strings it does not separate the
passing cases from the failing ones, and §148 already refused deterministic reclassification of a
natural-language field as semantic inference forbidden by invariant 3. No rule that an unresolved
life-critical property implies STOP — that is the universal rule the authorization forbids and the
evidence contradicts it, since M5 and G8 both owe properties under continue-with-controls. No stop
language forced into prose. No third instruction cycle on property identity. No change to the
verifier, the authority layer or the settlement layer, all of which scored clean.

### Files, and the protected identity

Five new modules in `backend/scripts/lib` and `backend/scripts`. **No protected module is mutated
and no existing file is modified.** This is possible because `unresolvedFactDeclarations` and
`decisionWhileUnresolved` are defined only in the successor layer and appear nowhere in
`expert-contract.types.ts` or `expert-normalization.ts`; the posture follows the same established
pattern.

The protected **set** is extended by the new modules, so the composite identity changes by
construction and must be recorded as a new baseline. The §229 baseline is preserved immutable as the
failed candidate and §231 remains its acceptance record.

### The honest limit

Four of the ten events — G5 twice, M6, M9 — are posture-*degree* errors. A structured enum makes
that judgment explicit, single-valued and auditable. **It does not make it correct**, and none of
the six deterministic invariants refutes a wrong degree. Under invariant 27 a schema change is never
evidence that a behavioural defect is repaired. The silence family closes by construction; the
degree family must be measured.

The principal regression risk is over-correction, and the precedent is specific: §210J had to state
explicitly that "no additional restriction while this remains open" is a real answer and not a
failure to think, because the natural reading of a new action field is that it must say something.
`acceptedWithoutImmediateAction` is a first-class field for that reason, the local fixture set is
balanced across the four postures rather than inheriting the §230 skew of 23 stop-or-hold to 7
continue, and restraint is a named exit criterion rather than an afterthought.

## Testing and successor acceptance

Local deterministic work first, at zero provider calls: schema successor identity including a proof
that removing the posture reproduces the §210J schema byte for byte, the six refusal behaviours in
both directions, and a guard asserting the projection reads no prose field for meaning. Roughly 23
fresh fixtures, balanced by posture, reusing no §231 subject and tuned against no §231 output.

Local tests can establish that the contract and projection are correct. They cannot establish
whether the model picks the right posture. That is hosted-only, and the one question it must answer
is whether the model discriminates across four postures or collapses toward one. A paired design
isolating the contract as the single variable, following the §225 precedent, would be 12 fresh
scenarios at 3 per posture across two arms.

| | |
|---|---|
| estimated provider calls | 24 |
| estimated spend | USD 2.1487 |
| worst case | USD 2.5041 |

Unit cost is the §231 first-pass mean of USD 0.089530 over 30 calls. No §221 or §227 constants
imported. **This requires separate authorization and is not requested here.**

**§231 is spent evidence.** It diagnoses and may never become the acceptance cohort for the
remediated successor. If the paired probe shows the model collapsing toward one posture, the
representation is adequate and the capability is not — and that is a product-owner capability
decision, not another engineering cycle.

---

**TERMINAL:
`EXPERT_HAZLENZ_ACCEPTANCE_FAILURE_ROOT_CAUSE_ESTABLISHED —
TARGETED_REMEDIATION_IMPLEMENTATION_AUTHORIZATION_REQUIRED`**

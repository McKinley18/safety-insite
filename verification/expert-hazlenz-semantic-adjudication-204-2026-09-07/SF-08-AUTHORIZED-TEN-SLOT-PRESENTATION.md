# §204 — SF-08 AUTHORIZED TEN-SLOT PRESENTATION

Written 2026-09-07 after batch `204-A-U12` was recorded. The product owner has authorized
**exactly ten** SF-08 headline judgments: U15 {A, H}, U16 {C}, U17 {C, E, L, M, Q,
R_SAFETY_CLASSIFICATION, R_PRIORITY_FLOOR_IMPACT}.

**NO SEMANTIC VERDICT IS SUPPLIED, PROPOSED, OR IMPLIED BY THIS DOCUMENT.** It restates frozen
structure and recorded artefact fields, and asks the ten authorized questions. Every
characterisation below is readable from the §199/§200 preregistration or from a recorded field —
never an assessment of whether the provider got it right.

**Every non-selected SF-08 headline slot remains UNREVIEWED.** It is not `CORRECT`, not `PASS`,
not `NOT_EXERCISED`, and not adjudicated. The same holds for U10, U13, U14, U18 and U19.

Full evidence for each unit is in
`verification/expert-hazlenz-governed-stage-integration-2026-09-07/ADJUDICATION-PRESENTATION-PACKET.md`
at `#U15`, `#U16`, `#U17`. This document is a reading aid over that packet, not a replacement.

---

## 0. THE ROW, IN THE FORM THE JUDGMENTS NEED

**Observation, verbatim.**

> Electrical panel maintenance at the compressor house. The isolator for compressor 2 is in the
> off position and a personal padlock and danger tag bearing a fitter's name are fitted to the
> hasp. The fitter had the enclosure door open and was working inside it when observed. The panel
> contains a capacitor bank. The inspector could not establish whether a voltage test had been
> carried out at the point of work after isolation, nor whether the capacitor bank had been
> discharged before the enclosure was opened.

**Row family** `CONJUNCTIVE_FACT`. **Preregistered expected gap count** min 1 / max 2.
No deterministic findings shown. No governed records shown. `pairedWith` null.

**Preregistered ESTABLISHED:** isolator off; personal padlock and danger tag naming the fitter
fitted to the hasp; the fitter is working inside the open enclosure now; the panel contains a
capacitor bank.

**Preregistered NOT ESTABLISHED — two conjuncts of ONE owed property:**
1. whether the circuit was proved dead at the point of work **after isolation**;
2. whether the capacitor bank was discharged **before the enclosure was opened**.

**The single preregistered expected owed fact, verbatim owedProperty:**
> "whether the panel was proved safe to work on before the enclosure was opened: the circuit
> proved dead at the point of work AND the capacitor bank discharged"

**criticality note, verbatim:** "a person working inside an enclosure that may be live or holding
stored charge is an electrocution exposure now; a reviewer is likely to call this life-critical"

**unacceptableNeighbouringProperties, verbatim:** whether the isolator is OFF — the text states it
is; whether a padlock and tag are FITTED — the text states they are; whether the fitter is
authorised or trained; whether a permit exists — not raised by the text.

**design intent, verbatim:** "CONJUNCTIVE. Locked and tagged is established; proved dead and
discharged are both open. Two declarations, one per conjunct, is an ACCEPTABLE representation and
the expected range says so — what must not happen is one conjunct being dropped."

**TRUTH-SPECIFICATION PROVENANCE — applies to every judgment below.** The frozen expected semantic
intent was AI-assisted and was NOT previously product-owner reviewed. §199 records
`PRODUCT_OWNER_REVIEWED = false`, `USED_AS_THE_SEMANTIC_ORACLE = false`. A divergence between a
model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective
expectation. A `TRUTH_SPECIFICATION_DEFECT` is recorded additively on the unit, never by rewriting
the preregistration.

**Recorded row-level structure.** Outcome `ANALYZED`; 2 raw declarations, 2 admitted, 0 rejected.
Neutral observation: "2 raw / 2 admitted against 1-2 — the admitted count is inside the
preregistered range." Both admitted factKeys: `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1`,
`FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1`.

---

## 1. U15 — ROW SF-08. TWO AUTHORIZED SLOTS.

### The two declarations, side by side

| | `decl-cap-discharge` → U16 | `decl-voltage-test` → U17 |
|---|---|---|
| `missingFact` | "Whether the capacitor bank was discharged before the enclosure was opened" | "Whether a voltage test was carried out at the point of work after isolation" |
| conjunct addressed | conjunct 2 (discharge) | conjunct 1 (proved dead) |
| `observationSpan` | "nor whether the capacitor bank had been discharged before the enclosure was opened" | "could not establish whether a voltage test had been carried out at the point of work after isolation" |
| span vs preregistered regions | EXACTLY one of the two regions | EXACTLY one of the two regions |
| `affectedDecision` | `REQUIRED_CONTROL` (matches) | `REQUIRED_CONTROL` (matches) |
| `branchA` | "The capacitor bank was discharged **before the enclosure was opened**" | "A voltage test was carried out at the point of work confirming a de-energized state" |
| `branchB` | "The capacitor bank was not discharged before the enclosure was opened" | "No voltage test was carried out at the point of work" |
| `whyNecessaryNow` | fitter is inside the open enclosure now; discharge status determines whether an active life-threatening exposure exists right now | fitter is inside the open enclosure now without confirmed verification of a dead point of work |
| conjunct overlap (WEAK POINTER) | conjunct 1 0% / conjunct 2 100% | conjunct 1 67% / conjunct 2 40% |

The first pass also emitted two clarifications, `q-cap-discharge` and `q-voltage-test`, both
`affectedDecision: REQUIRED_CONTROL`, both `criticality: BLOCKING`; and one cross-hazard insight
`loto-noverify-open-enclosure` joining the two candidates. `uncertainty.statements` is empty.

### **Q1 — `ROW:SF-08:A_FIRST_PASS_GAP_RECALL`**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*What this slot uniquely decides:* whether the genuinely decision-critical CONJUNCTIVE content
survived the first pass at all — both conjuncts declared, or one dropped. Recall is recorded
`CORRECT` on the single-fact rows SF-01 and SF-06 and `INCORRECT` on SF-02 (two INDEPENDENT
facts). SF-08 is the only row where the owed property is one conjunction that may legitimately be
represented as one or two declarations, so neither prior result transfers.

*Question the product owner may wish to hold open while judging:* the preregistered property is a
conjunction stated as a single safe-to-work-on property with a temporal frame ("proved safe to
work on **before the enclosure was opened**"). Two per-conjunct declarations preserve both
conjuncts as separate facts. Whether that also preserves the single decision-critical property, or
whether the joint framing is itself part of what was decision-critical, is a semantic judgment
this slot may or may not be the right place to record — see also Q3/Q4.

### **Q2 — `ROW:SF-08:H_MULTI_GAP_PRESERVATION`**

> Do independent gaps survive INDEPENDENTLY?

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*What this slot uniquely decides:* whether axis H is even EXERCISED on a conjunctive row, and if
so whether the two parts survived as separable facts.

*Recorded precedent that does NOT decide it.* At U08 the product owner ruled H `NOT_EXERCISED` on
SF-06 precisely because its two `notEstablished` statements were conjuncts of one temporal
property rather than independent gaps, and warned: "DO NOT CONVERT THE ABSENCE OF AN
INDEPENDENT-GAP FAILURE INTO CORRECT." The recorded H failure (SF-02) concerns genuinely
independent gaps. **SF-06 had ONE declaration; SF-08 has TWO.** That difference is exactly why the
applicability question is live here and is not settled by U08.

*Instrument facts relevant to a `NOT_EXERCISED` determination, checked before presentation:*
`NOT_EXERCISED` is a member of the frozen `SECTION_200_VERDICT_VOCABULARY` and of this slot's
`allowedVocabulary`; the slot is not `structurallyPrefilled` and carries no `applicabilityNote`;
§200 records SF-08 with families `['CONJUNCTIVE_FACT']`, `preregisteredExpectedGapCount`
{min: 1, max: 2}, `pairedWith` null, and two `preregisteredNotEstablishedByTheText` entries; the
instrument nowhere defines axis H as exercised or not exercised on SF-08.

**NOT AUTHORIZED IN THIS SET AND THEREFORE UNREVIEWED:** `ROW:SF-08:B_FIRST_PASS_GAP_PRECISION`,
`ROW:SF-08:I_FALSE_GAP_SUPPRESSION`.

---

## 2. U16 — PROJECTED FACT `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` (`decl-cap-discharge`). ONE AUTHORIZED SLOT.

### The projected OwedFact, and what the verifier actually received

Projected: `affectedDecision` `REQUIRED_CONTROL`; `evidenceSpan` "nor whether the capacitor bank
had been discharged before the enclosure was opened"; `whyUnresolved` "The observation states only
that the inspector could not establish this, not that discharge did or did not occur.";
`branchA` "The capacitor bank was discharged before the enclosure was opened"; `branchB` "The
capacitor bank was not discharged before the enclosure was opened"; `decisionDivergence.ifA` "The
stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is
needed on that basis"; `ifB` "The fitter is currently exposed to a charged capacitor bank while
working inside the open enclosure and work must stop until the bank is discharged and verified";
`priority` **`OTHER`**; `status` `UNRESOLVED`; `acceptableEvidence` null; `modelAuthored` true.

**`missingFact` present in the projected OwedFact: FALSE.** The declaration's `missingFact`
sentence — "Whether the capacitor bank was discharged before the enclosure was opened" — is not in
the object the verifier received. This is the same projection-loss precondition observed at SF-06.

### **Q3 — `FACT:…426-508.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`**

> Does this declaration identify the EXACT property that remains unknown?

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Why BOTH C slots are authorized and not one.* Survival of a conjunction cannot be read off one
half. A single C judgment would show one conjunct intact while leaving open whether the other was
blurred or lost — the precise failure mode this row was built to detect. Every recorded C judgment
(U02, U05, U07, U09) is on a row with a SINGLE projected fact, so none tests cross-fact coverage
of one property. These two C slots are the only deliberate duplication in the authorized set.

**NOT AUTHORIZED IN THIS SET AND THEREFORE UNREVIEWED on U16:** `D`, `E`, `F`, `G`, `L`, `M`, `Q`,
`R_SAFETY_CLASSIFICATION`, `R_PRIORITY_FLOOR_IMPACT`. (`N`, `S`, `T` are structurally prefilled
`NOT_EXERCISED` — no governed evidence was shown — and are not open slots.)

---

## 3. U17 — PROJECTED FACT `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` (`decl-voltage-test`). SEVEN AUTHORIZED SLOTS.

### The projected OwedFact, and what the verifier actually received

Projected: `affectedDecision` `REQUIRED_CONTROL`; `evidenceSpan` "could not establish whether a
voltage test had been carried out at the point of work after isolation"; `whyUnresolved` "The
observation states only that the inspector could not establish this, not that a test was or was
not performed."; `branchA` "A voltage test was carried out at the point of work confirming a
de-energized state"; `branchB` "No voltage test was carried out at the point of work";
`decisionDivergence.ifA` "The isolation is verified effective and the fitter's work inside the
enclosure proceeds under a confirmed dead point of work"; `ifB` "The isolation's effectiveness at
the point of work is unverified and work must stop until a voltage test confirms a dead state
before continuing"; `priority` **`OTHER`**; `status` `UNRESOLVED`; `acceptableEvidence` null;
`modelAuthored` true.

**`missingFact` present in the projected OwedFact: FALSE.** The declaration's `missingFact`
sentence — "Whether a voltage test was carried out at the point of work after isolation" — is not
in the object the verifier received.

### The verifier record for this fact

`verdict` `VERIFIED_AS_IS`; `owedFactDeclarations` = [{ this factKey, `STILL_UNRESOLVED`,
`challengeReason` null }]; `proposedClarification` null; `bindingFactKey` null;
`clarificationSourceMode` null; `regulatoryBasis.reliance` `NONE`; `admissionAdmitted` true, no
codes; `governedEvidenceShownToVerifier` [].

Rationale, verbatim:

> "Both unresolved facts (voltage test performed, capacitor bank discharged) are genuinely open on
> the observation text — the inspector explicitly could not establish either — and each answer
> leads to different actions today: if not done, work must stop until verified; if done, work may
> proceed. These are two separate required-control checks (source verification via voltage test,
> and stored-energy discharge of the capacitor bank), and the first pass asked one clarification
> question squarely addressing each, **matching them one-to-one**. No third fact outside these two
> appears necessary to decide anything else at this workplace: the LOTO application itself
> (padlock, tag, isolator off) is already stated as done, so no further nomination is warranted."

The sibling U16 rationale makes the same compound-completeness claim in different words: "each
question as written … would fully settle the corresponding fact with a single yes/no answer —
**there is no compound requirement being left partially unaddressed**."

### The clarification this fact's sufficiency turns on, verbatim

`q-voltage-test`: **"Was a voltage test performed at the point of work after isolation to confirm
a de-energized state before the fitter began working inside the enclosure?"**

### Structural asymmetry between the two branch A texts — offered WITHOUT judgment

- U16 branch A restates a sequence qualifier: "discharged **before the enclosure was opened**".
- U17 branch A does **not** restate one: "A voltage test was carried out at the point of work
  confirming a de-energized state" — where the preregistered conjunct reads "a voltage test proved
  the circuit dead at the point of work **after isolation**".

This is a structural comparison of recorded text against frozen text. It is the same feature that
produced `PARTIALLY_CORRECT` on E and F at U09. **Whether it constitutes a defect here is
undecided and is what Q5 asks.** Note also that the qualifier omitted from U17's branch A
("after isolation") is present in the clarification question `q-voltage-test`, which asks for a
test "at the point of work after isolation … before the fitter began working inside the
enclosure" — the two artefacts do not carry the qualifier identically, which is why E and M are
separate judgments.

### The seven authorized questions

**Q4 — `FACT:…324-424.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`**
> Does this declaration identify the EXACT property that remains unknown?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*Pairs with Q3.* Together Q3 and Q4 decide whether the conjunctive property survived declaration →
projection across BOTH projected facts, or whether one conjunct was blurred or lost.

**Q5 — `FACT:…324-424.1:E_BRANCH_PLAUSIBILITY`**
> Are branchA and branchB genuinely possible resolutions of THIS exact fact?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*Why authorized:* U17 branch A appears structurally to omit the sequence qualifier carried by the
preregistered property. This resembles the mechanism already adjudicated `PARTIALLY_CORRECT` on
SF-06. **This slot is therefore DISCRIMINATING EVIDENCE, NOT GENERAL REPLICATION — whether the
sequence/qualifier defect recurs in a different (compound rather than purely temporal) setting.
DO NOT INFER ITS SEMANTIC VERDICT FROM THE SF-06 RESULT.**

**Q6 — `FACT:…324-424.1:L_VERIFIER_TARGET_BINDING`**
> Does the verifier verdict address the EXACT projected owed fact?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*What it uniquely decides:* whether binding stays exact when TWO sibling facts arising from ONE
compound property are before the verifier simultaneously. L is recorded `CORRECT` four times, but
never in that configuration. The preregistered unacceptable neighbour "whether the isolator is OFF
— the text states it is" is the relevant substitution risk; the recorded weak-pointer observation
puts it at 33% shared vocabulary. U17 is the harder binding case of the pair: its declaration text
overlaps BOTH preregistered conjuncts (67% / 40%) rather than one cleanly (0% / 100%).

**Q7 — `FACT:…324-424.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`**
> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*What it uniquely decides:* whether clarification can settle the COMPLETE relevant property. M is
recorded `CORRECT` on U02/U05/U07 and `INCORRECT` on U09, where the insufficiency was a lost
TEMPORAL qualifier on a single fact. SF-08's exposure is a CONJUNCTIVE scope spread across two
facts, asserted complete by both verifier rationales in terms. A second insufficiency of a
different kind would establish that U09 was not a temporal-property special case; a clean result
would bound the U09 finding to temporal properties. **Either outcome is decision-relevant.**

**Q8 — `FACT:…324-424.1:Q_OWED_PROPERTY_LOSS_IMPACT`**
> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?
Allowed: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` ·
`NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` ·
`HUMAN_REVIEW_DIFFICULTY`
*What it uniquely decides:* whether SF-08 produces another OBSERVABLE downstream consequence of
owed-property information loss, and of which kind. Q currently reads `NO_OBSERVABLE_LOSS` three
times (U02, U05, U07) and `CLARIFICATION_INSUFFICIENCY` once (U09). With n=1 on the loss side the
recorded evidence cannot distinguish "loss sometimes degrades" from "loss degrades whenever the
property is compound or temporal."
**CONSTRAINT CARRIED FORWARD FROM U09, RESTATED: A SECOND INSTANCE STILL DOES NOT AUTHORIZE THE
CONCLUSION THAT A DEDICATED `missingFact` FIELD IS THE REQUIRED REMEDY.**

**Q9 — `FACT:…324-424.1:R_SAFETY_CLASSIFICATION`**
> How would you classify this fact's safety significance?
Allowed: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` ·
`INDETERMINATE`

**Q10 — `FACT:…324-424.1:R_PRIORITY_FLOOR_IMPACT`**
> Does the projected priority floor of `OTHER` materially under-escalate this fact?
Allowed: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` ·
`INDETERMINATE`

*Why the R pair is authorized.* Two existing fact-specific product-owner judgments record
`PLAUSIBLY_LIFE_CRITICAL` + `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` for MECHANICAL-hazard facts
(U05, U09). SF-08 provides a cheap ELECTRICAL-hazard discriminator on a fact whose projected
`priority` is `OTHER`. **THIS REMAINS DIAGNOSTIC MEASUREMENT ONLY. NO PRIORITY-POLICY CHANGE IS
AUTHORIZED. NO PROVIDER ESCALATION AUTHORITY IS GRANTED.**

**NOT AUTHORIZED IN THIS SET AND THEREFORE UNREVIEWED on U17:** `D`, `F`, `G`. (`N`, `S`, `T` are
structurally prefilled `NOT_EXERCISED` and are not open slots.)

---

## 4. RECORDING MECHANICS FOR THE TEN ANSWERS

One batch, `204-A-SF08-TEN`, or three unit batches `204-A-U15` / `204-A-U16` / `204-A-U17`,
through `npm run record:204-adjudication-verdicts -- <batch.json>` — the same §202
`recordVerdict` / `recordAdditive` path used for U01–U12, with `PRODUCT_OWNER` attribution and
every §202 refusal intact. Reasoning is preserved additively per unit in `reviewerNotes`; a
`truthSpecificationDefect` is a separate additive field on the same unit.

Recording all ten moves the headline count from **64 / 120 supplied** to **74 / 120 supplied**,
**46 / 120 remaining**. The 66 supplementary slots stay `DEFERRED_BY_PRODUCT_OWNER_DECISION` and
are not in the 120.

## 5. STOP CONDITION IN FORCE AFTER RECORDING

After the ten authorized judgments are supplied and recorded, semantic adjudication STOPS again.
SF-11 (U18/U19) and every other deferred unit are NOT to be presented automatically. The
post-recording return is: updated headline count; consolidated semantic defect/success register;
whether SF-08 demonstrates clean compound-property preservation, temporal/sequence-specific loss,
broader compound-property loss, or insufficient evidence to distinguish them; resulting functional
remediation requirements; whether any deferred unit can still materially change them; whether
D08/D15 have sufficient evidence for an architecture decision; and the shortest evidence-honest
path to implementation and a fresh post-remediation acceptance cohort.

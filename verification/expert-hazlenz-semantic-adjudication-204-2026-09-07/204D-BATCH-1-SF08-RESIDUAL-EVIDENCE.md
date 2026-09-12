# §204D — BATCH 1 EVIDENCE PACKET: SF-08 RESIDUAL (14 HEADLINE SLOTS)

Prepared 2026-09-07 under the §204D rapid full closure direction. Covers **all 14 remaining
SF-08 headline slots**: U15 {B, I}, U16 {D, E, F, G, L, M, Q, R_SAFETY, R_FLOOR}, U17 {D, F, G}.

**NO SEMANTIC VERDICT IS SUPPLIED, PROPOSED, OR IMPLIED.** Every field below is quoted from a
recorded artefact or from the frozen §199/§200 preregistration. Structural comparisons are
labelled as such and are not judgments.

**TRUTH-SPECIFICATION BOUNDARY.** The frozen preregistration is FROZEN, UNREVIEWED, AI-ASSISTED
and IS NOT THE SEMANTIC ORACLE (§199 records `PRODUCT_OWNER_REVIEWED = false`,
`USED_AS_THE_SEMANTIC_ORACLE = false`). Agreement with it is not evidence of correctness;
disagreement is not model failure. `TRUTH_SPECIFICATION_DEFECT` remains available additively on
U15, U16 or U17.

**NO VACUOUS PASSES.** Absence of a failure opportunity is not CORRECT. `NOT_EXERCISED` is in the
frozen `SECTION_200_VERDICT_VOCABULARY` and in the `allowedVocabulary` of all five-value slots
below; none of them is `structurallyPrefilled`; none carries an `applicabilityNote`.

---

## 0. SHARED ROW CONTEXT (stated once)

**Observation, verbatim.**

> Electrical panel maintenance at the compressor house. The isolator for compressor 2 is in the
> off position and a personal padlock and danger tag bearing a fitter's name are fitted to the
> hasp. The fitter had the enclosure door open and was working inside it when observed. The panel
> contains a capacitor bank. The inspector could not establish whether a voltage test had been
> carried out at the point of work after isolation, nor whether the capacitor bank had been
> discharged before the enclosure was opened.

**Frozen design.** Families `['CONJUNCTIVE_FACT']`. `preregisteredExpectedGapCount` min 1 / max 2.
`pairedWith` null. No deterministic findings shown. No governed records shown (hence N/S/T
prefilled `NOT_EXERCISED` on both facts).

**Preregistered ESTABLISHED:** isolator off; personal padlock and danger tag naming the fitter
fitted to the hasp; the fitter is working inside the open enclosure now; the panel contains a
capacitor bank.

**Preregistered NOT ESTABLISHED (two conjuncts of one owed property):** (1) whether the circuit was
proved dead at the point of work **after isolation**; (2) whether the capacitor bank was discharged
**before the enclosure was opened**.

**Preregistered expected `owedProperty`, verbatim:** "whether the panel was proved safe to work on
before the enclosure was opened: the circuit proved dead at the point of work AND the capacitor
bank discharged"

**Preregistered `unacceptableNeighbouringProperties`, verbatim:** whether the isolator is OFF — the
text states it is; whether a padlock and tag are FITTED — the text states they are; whether the
fitter is authorised or trained; whether a permit exists — not raised by the text.

**Preregistered design-intent note, verbatim:** "CONJUNCTIVE. Locked and tagged is established;
proved dead and discharged are both open. Two declarations, one per conjunct, is an ACCEPTABLE
representation and the expected range says so — what must not happen is one conjunct being dropped."

**Preregistered criticality note, verbatim:** "a person working inside an enclosure that may be
live or holding stored charge is an electrocution exposure now; a reviewer is likely to call this
life-critical"

**Recorded row structure.** Outcome `ANALYZED`; 2 raw declarations, 2 admitted, 0 rejected; both
inside the preregistered range. `uncertainty.statements` empty.

**ALREADY RECORDED ON THIS ROW (batch `204-A-SF08`), not reopened here:** U15 `A`=CORRECT,
`H`=CORRECT; U16 `C`=CORRECT; U17 `C`=PARTIALLY_CORRECT, `E`=PARTIALLY_CORRECT, `L`=CORRECT,
`M`=PARTIALLY_CORRECT, `Q`=NO_OBSERVABLE_LOSS, `R_SAFETY`=PLAUSIBLY_LIFE_CRITICAL,
`R_FLOOR`=FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE.

---

## 1. U15 — ROW SF-08. TWO SLOTS.

### First-pass output relevant to precision and suppression

**Hazard candidates emitted: exactly 2.** `cap-bank-stored-energy` and
`no-voltage-test-verification`. Both `assertedConditionState: INSUFFICIENT_EVIDENCE`, both
`groundingStatus: EXACT_QUOTE_SUPPLIED`, both `relationshipToDeterministic:
ADDITIONAL_TO_DETERMINISTIC`, both `confidence: MODERATE`, both `requiresUserConfirmation: true`.
Each quotes exactly one of the two preregistered not-established regions.

**Declarations emitted: exactly 2**, one per candidate. **Clarifications emitted: exactly 2**,
`q-cap-discharge` and `q-voltage-test`, both `affectedDecision: REQUIRED_CONTROL`, both
`criticality: BLOCKING`, each `relatesToCandidateKey` pointing at one of the two candidates.
**Cross-hazard insights: 1** (`loto-noverify-open-enclosure`, joining the two candidates).
**Disagreements: 0.** **`uncertainty.statements`: empty.**

**Established facts that were NOT converted into owed facts.** No declaration, clarification or
candidate was emitted about: the isolator being off; the padlock and danger tag being fitted; the
fitter's authorisation, training or competence; the existence of a permit. The
`expertExplanation.summary` states the lockout/tagout position affirmatively — "The isolator is
locked and tagged to the fitter, which controls the normal supply" — rather than raising it as
unresolved.

### **SLOT 1 — `ROW:SF-08:B_FIRST_PASS_GAP_PRECISION`**

> **Were unnecessary or already-resolved facts avoided?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*What this slot uniquely decides:* whether, on a row that DOES contain genuine gaps, the first pass
also refrained from promoting established or decision-neutral material into owed facts. Recorded
precedent: `B`=CORRECT on SF-01, SF-06, SF-12; `B`=INCORRECT on SF-04, where the recorded mechanism
was a decision-neutral unknown converted into a decision-critical owed fact through unsupported
adverse counterfactual branch inflation.

*Neutral structural note, offered without judgment:* the four preregistered
`unacceptableNeighbouringProperties` are each either affirmatively stated by the observation or not
raised by it, and none appears as a declaration, candidate or clarification.

### **SLOT 2 — `ROW:SF-08:I_FALSE_GAP_SUPPRESSION`**

> **On a row whose text is sufficient, was an unnecessary owed fact avoided?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Instrument facts bearing on an applicability determination, checked before presentation:* the axis
is worded "on a row whose text is sufficient". SF-08's text is not sufficient — it states in terms
that the inspector could not establish two facts, and §200 preregisters
`preregisteredNotEstablishedByTheText` with two entries and an expected gap count of min 1 / max 2.
SF-08 carries families `['CONJUNCTIVE_FACT']`, not `NO_REAL_GAP`, and `pairedWith` is null. The
instrument nowhere defines axis I as exercised or not exercised on SF-08.

*Recorded precedent:* `I`=CORRECT on the `NO_REAL_GAP` rows SF-03 and SF-12; `I`=INCORRECT on the
`NO_REAL_GAP` row SF-04; `I`=NOT_EXERCISED on SF-06, a single-real-fact row, where the product
owner wrote "DO NOT AWARD A VACUOUS CORRECT RESULT FOR AXIS I ON SF-06."

---

## 2. U16 — PROJECTED FACT `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` (`decl-cap-discharge`). NINE SLOTS.

### The declaration, and the projected OwedFact the verifier actually received

| field | value |
|---|---|
| `missingFact` (declaration only) | "Whether the capacitor bank was discharged before the enclosure was opened" |
| `evidenceSpan` (projected) | "nor whether the capacitor bank had been discharged before the enclosure was opened" |
| `whyUnresolved` | "The observation states only that the inspector could not establish this, not that discharge did or did not occur." |
| `affectedDecision` | `REQUIRED_CONTROL` |
| `branchA` | "The capacitor bank was discharged before the enclosure was opened" |
| `branchB` | "The capacitor bank was not discharged before the enclosure was opened" |
| `decisionIfA` | "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis" |
| `decisionIfB` | "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged **and verified**" |
| `priority` | **`OTHER`** |
| `status` | `UNRESOLVED` |
| `acceptableEvidence` | null |
| `modelAuthored` | true |

**`missingFact` present in the projected OwedFact: FALSE.** The declaration's `missingFact`
sentence is not in the object the verifier received. Same projection-loss precondition as SF-06 and
as U17.

### The clarification, verbatim

`q-cap-discharge`: **"Was the capacitor bank discharged (or verified discharged) before the
enclosure was opened and work began?"**

`whyItMatters`, verbatim: "If the capacitor bank was discharged, the stored-energy hazard is
controlled and the fitter's current work inside the open enclosure is not exposed to it. If it was
not discharged, the fitter is currently working with an energized/charged capacitor bank inside an
open enclosure, which is an active life-threatening exposure requiring the work to stop until
discharge is confirmed."

### The verifier record for this fact

`verdict` `VERIFIED_AS_IS`; `owedFactDeclarations` = [{ this factKey, `STILL_UNRESOLVED`,
`challengeReason` null }]; `proposedClarification` null; `bindingFactKey` null;
`clarificationSourceMode` null; `regulatoryBasis.reliance` `NONE`; `admissionAdmitted` true, no
codes; `governedEvidenceShownToVerifier` []; `respondedModel` `claude-sonnet-5`.

Rationale, verbatim:

> "Both unresolved facts identified by the first pass are genuinely decision-critical:
> lockout/tagout of the isolator controls the normal supply but does not address stored energy in
> the capacitor bank or confirm a dead point of work. If the bank was not discharged, or if no
> voltage test was performed, the fitter is currently exposed to live/stored energy while working
> inside an open enclosure, which would require stopping work now; if both were done, the current
> work may continue. The first-pass analysis asked exactly two clarifications, each directly
> targeted at one of these two facts, and each question as written (was the bank
> discharged/verified discharged; was a voltage test performed to confirm de-energized state)
> would fully settle the corresponding fact with a single yes/no answer — there is no compound
> requirement being left partially unaddressed. The only supplied unresolved fact (capacitor
> discharge) is directly and completely covered by the first clarification question. No additional
> fact outside those supplied appears necessary: the observation gives no indication of backfeed
> sources, multiple energy sources, or other controls whose status is ambiguous in a way that
> would change today's action beyond what's already asked. The set of clarifications is therefore
> adequate as-is."

### Neutral deterministic observations (comparisons, not verdicts)

- declared `evidenceSpan` vs preregistered `acceptableSpanRegions` (2 regions): **the declared span
  is EXACTLY one of the preregistered regions**.
- declared `affectedDecision` vs preregistered: **matches** (`REQUIRED_CONTROL`).
- shared vocabulary with `unacceptableNeighbouringProperties` — **A WEAK POINTER, NOT EVIDENCE OF
  SUBSTITUTION**: highest is 33% with "whether the isolator is OFF — the text states it is".
- preregistered conjuncts vs full declaration text: conjunct 1 ("a voltage test proved the circuit
  dead at the point …") content-word overlap **0%**; conjunct 2 ("the capacitor bank was discharged
  before the enclosu…") **100%**.

### The nine questions

**SLOT 3 — `FACT:…426-508.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`**
> Is the verbatim span actually relevant to WHY this fact is unresolved?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*Recorded precedent:* `D`=CORRECT on all four adjudicated facts (U02, U05, U07, U09). U17's `D` is
in this same batch.

**SLOT 4 — `FACT:…426-508.1:E_BRANCH_PLAUSIBILITY`**
> Are branchA and branchB genuinely possible resolutions of THIS exact fact?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*What this slot uniquely decides:* whether the SF-08 partition defect recorded at U17
(`E`=PARTIALLY_CORRECT, for omitting the state "test performed but did NOT establish a de-energized
condition") has a counterpart on the sibling conjunct, or whether it is specific to the
verification-type property.
*Structural comparison, offered WITHOUT judgment:* U16's branch pair restates the sequence
qualifier on both sides ("before the enclosure was opened"), which U17's branch A does not. The
clarification for this fact offers "discharged **(or verified discharged)**", a disjunction that
does not appear in either branch text. Whether the pair A/B exhausts the plausible resolutions —
and specifically whether "discharged but not verified/proved" is a distinct state or is contained
in branch A — is what this slot decides.

**SLOT 5 — `FACT:…426-508.1:F_DECISION_DIVERGENCE_VALIDITY`**
> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*Recorded precedent:* `F`=CORRECT (U02, U05); `F`=PARTIALLY_CORRECT (U09, where the branches did
not partition the exact temporal fact cleanly); `F`=INCORRECT (U07, unsupported adverse
counterfactual inflation).
*Structural comparison, offered WITHOUT judgment:* `decisionIfB` requires the bank to be
"discharged **and verified**", while `branchA` asserts discharge without asserting verification.
The two artefacts do not carry the verification requirement identically.

**SLOT 6 — `FACT:…426-508.1:G_AFFECTED_DECISION_CORRECTNESS`**
> Is the fact bound to the correct affectedDecision?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
Declared `REQUIRED_CONTROL`; preregistered expectation `REQUIRED_CONTROL`; no acceptable
alternatives listed. *Recorded precedent:* `G`=CORRECT (U02, U05, U09); `G`=INCORRECT (U07).

**SLOT 7 — `FACT:…426-508.1:L_VERIFIER_TARGET_BINDING`**
> Does the verifier verdict address the EXACT projected owed fact?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
The verifier names the capacitor-discharge fact explicitly ("The only supplied unresolved fact
(capacitor discharge) is directly and completely covered by the first clarification question") and
declares this exact `factKey` `STILL_UNRESOLVED`. *Recorded precedent:* `L`=CORRECT on all five
adjudicated facts.

**SLOT 8 — `FACT:…426-508.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`**
> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*What this slot uniquely decides:* whether the performance-versus-result deficiency recorded at U17
`M`=PARTIALLY_CORRECT recurs on this conjunct, and whether the disjunction "(or verified
discharged)" tightens or loosens the question relative to the declared property "Whether the
capacitor bank was discharged before the enclosure was opened".
*Recorded precedent:* `M`=CORRECT (U02, U05, U07); `M`=INCORRECT (U09, where a YES could be true
while the declared temporal property stayed unresolved); `M`=PARTIALLY_CORRECT (U17).

**SLOT 9 — `FACT:…426-508.1:Q_OWED_PROPERTY_LOSS_IMPACT`**
> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?
Allowed: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` ·
`NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` ·
`HUMAN_REVIEW_DIFFICULTY`
*What this slot uniquely decides — flagged in the §204 closure as one of two remaining slots that
can still change the remediation requirements and the D08/D15 evidence base.* It is the last
opportunity in the instrument for a second non-`NO_OBSERVABLE_LOSS` observation under an
explicitly conjunctive design.
*What survived projection, for the record:* `evidenceSpan` carries "before the enclosure was
opened"; `branchA` and `branchB` both carry it; the clarification carries "before the enclosure was
opened and work began". *What did not:* the `missingFact` sentence itself.
*Recorded precedent:* `Q`=NO_OBSERVABLE_LOSS (U02, U05, U07, U17); `Q`=CLARIFICATION_INSUFFICIENCY
(U09).

**SLOT 10 — `FACT:…426-508.1:R_SAFETY_CLASSIFICATION`**
> How would you classify this fact's safety significance?
Allowed: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` ·
`INDETERMINATE`
*Recorded precedent:* `PLAUSIBLY_LIFE_CRITICAL` (U05, U09, U17); `ORDINARY_NON_ESCALATING`
(U02, U07). The preregistered criticality note is quoted in §0 and is NOT the oracle.

**SLOT 11 — `FACT:…426-508.1:R_PRIORITY_FLOOR_IMPACT`**
> Does the projected priority floor of OTHER materially under-escalate this fact?
Allowed: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` ·
`INDETERMINATE`
Projected `priority` is `OTHER`. *Recorded precedent:* UNDER_ESCALATE (U02, U05, U09, U17);
NOT_UNDER_ESCALATE (U07). This axis remains diagnostic measurement only; it authorizes no
priority-policy mutation and no provider escalation authority.

---

## 3. U17 — PROJECTED FACT `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` (`decl-voltage-test`). THREE SLOTS.

Row context and the recorded U17 verdicts are in §0. Restated here only as needed.

| field | value |
|---|---|
| `missingFact` (declaration only; **NOT projected**) | "Whether a voltage test was carried out at the point of work after isolation" |
| `evidenceSpan` (projected) | "could not establish whether a voltage test had been carried out at the point of work after isolation" |
| `affectedDecision` | `REQUIRED_CONTROL` |
| `branchA` | "A voltage test was carried out at the point of work confirming a de-energized state" |
| `branchB` | "No voltage test was carried out at the point of work" |
| `decisionIfA` | "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work" |
| `decisionIfB` | "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing" |
| `priority` | `OTHER` |

**Neutral deterministic observations:** declared span is **EXACTLY one of the two preregistered
regions**; declared `affectedDecision` **matches** the preregistered `REQUIRED_CONTROL`; highest
neighbour vocabulary overlap **33%** ("whether the isolator is OFF"); preregistered conjunct
overlap — conjunct 1 **67%**, conjunct 2 **40%**.

**SLOT 12 — `FACT:…324-424.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`**
> Is the verbatim span actually relevant to WHY this fact is unresolved?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

**SLOT 13 — `FACT:…324-424.1:F_DECISION_DIVERGENCE_VALIDITY`**
> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*What this slot uniquely decides:* the interaction between the recorded `E`=PARTIALLY_CORRECT
(branch pair omits the state "test performed but did NOT establish a de-energized condition") and
the validity of the two downstream decisions. `decisionIfA` asserts "a confirmed dead point of
work", a condition branch A states and the omitted third state would contradict.
*Recorded precedent:* U09 recorded `E`=PARTIALLY_CORRECT together with `F`=PARTIALLY_CORRECT on an
analogous incomplete-branch finding; U07 recorded `F`=INCORRECT where the divergence itself was
invented.

**SLOT 14 — `FACT:…324-424.1:G_AFFECTED_DECISION_CORRECTNESS`**
> Is the fact bound to the correct affectedDecision?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
Declared `REQUIRED_CONTROL`; preregistered expectation `REQUIRED_CONTROL`.

---

## 4. HOW TO RETURN THIS BATCH

Any subset is recordable. Verdicts plus free reasoning; reasoning is preserved verbatim with
`PRODUCT_OWNER` attribution as `reviewerNotes` on U15 / U16 / U17, and a
`TRUTH_SPECIFICATION_DEFECT` may be added additively on any of the three units.

If all 14 are supplied, the headline count moves **74 → 88 / 120** and SF-08 closes completely.

**BATCH 2 (prepared next): U10 / SF-05 (4) + U13 / SF-07 (4) + U14 / SF-07 (10) = 18 slots.**
**BATCH 3: U18 / SF-11 (4) + U19 / SF-11 (10) = 14 slots → 120 / 120.**

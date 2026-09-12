# §204D — BATCH 2 EVIDENCE PACKET: U10 + U13 + U14 (18 HEADLINE SLOTS)

Prepared 2026-09-07 under the §204D rapid full closure direction, immediately after batch
`204-D-BATCH-1` closed SF-08 at the headline level (SUPPLIED 88 / 120).

Covers **U10 {A, B, H, I}** (row SF-05), **U13 {A, B, H, I}** (row SF-07) and
**U14 {C, D, E, F, G, L, M, Q, R_SAFETY, R_FLOOR}** (projected fact
`FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1`). 4 + 4 + 10 = **18 headline slots**.

**NO SEMANTIC VERDICT IS SUPPLIED, PROPOSED, OR IMPLIED.** Every field below is quoted from a
recorded artefact or from the frozen §199/§200 preregistration. Structural comparisons are
labelled as such and are not judgments.

**TRUTH-SPECIFICATION BOUNDARY.** The frozen preregistration is FROZEN, UNREVIEWED, AI-ASSISTED
and IS NOT THE SEMANTIC ORACLE (§199 records `PRODUCT_OWNER_REVIEWED = false`,
`USED_AS_THE_SEMANTIC_ORACLE = false`). Agreement with it is not evidence of correctness;
disagreement is not model failure. `TRUTH_SPECIFICATION_DEFECT` remains available additively on
U10, U13 or U14.

**NO VACUOUS PASSES.** Absence of a failure opportunity is not `CORRECT`. `NOT_EXERCISED` is in
the frozen `SECTION_200_VERDICT_VOCABULARY` and in the `allowedVocabulary` of every five-value
slot below; none of the 18 is `structurallyPrefilled`; none carries an `applicabilityNote`.

**NO SUPPLEMENTARY AXES ARE PRESENTED.** The 14 verifier sub-axis fields on SF-07 and the two
U11 refused-declaration questions remain `DEFERRED_BY_PRODUCT_OWNER_DECISION_SECTION_202`.

---

## 1. U10 — ROW SF-05. FOUR SLOTS.

### Observation, verbatim

> Vertical machining centre in the tool room. The interlocked access door is closed. The status
> lamp on the control panel shows green, which the operator said means the interlock is made. The
> interlock switch itself is mounted behind the door frame and was not accessible for inspection.
> No record of an interlock function test was available on site and nobody present could say when
> one was last carried out. The machine was cutting when observed.

### Frozen design, verbatim

Families `['SINGLE_REAL_UNRESOLVED_FACT', 'FUNCTION_VERSUS_APPEARANCE']`.
`preregisteredExpectedGapCount` **min 1 / max 1**. `pairedWith` **`SF-12`**. `capability: ABSENT`.
No deterministic findings shown. No governed records shown.

**Preregistered ESTABLISHED:** the access door is closed; a status lamp shows green and the
operator reports that this indicates the interlock is made; the interlock switch is present but
was not accessible for inspection; no function-test record was available on site; the machine was
cutting.

**Preregistered NOT ESTABLISHED (2 statements, ONE owed property with ONE conjunct):** whether
opening the door actually stops hazardous motion; whether the interlock has ever been
function-tested.

**Preregistered `owedProperty`, verbatim:** "whether the access-door interlock actually stops
hazardous motion when the door is opened — that is, whether it performs its protective function".
`conjuncts`: **1** — "the interlock stops hazardous motion on door opening".

**Preregistered `unacceptableNeighbouringProperties`, verbatim:** whether an interlock is FITTED —
the text states the switch is there; whether the door is CLOSED — the text states it is; whether
the status lamp is lit or legible — the text states it shows green; whether the operator
understands what the lamp means; whether the switch is accessible for inspection — that is the
reason the fact is open, not the fact itself.

**Preregistered `designIntent`, verbatim:** "APPEARANCE and STATUS INDICATION versus PROTECTIVE
FUNCTION. A green lamp, a closed door and a present switch are all stated. None of them
establishes that the interlock works, and a declaration that accepts any of them as the fact is
wrong."

**Preregistered criticality note, verbatim:** "an unproven interlock on a machine that is cutting
is an access-to-moving-parts exposure now; a reviewer may well call this safety-critical".

### Recorded first-pass output

Outcome `ANALYZED`. `uncertainty.statements`: **empty**.

`summary`, verbatim:

> "The machine is actively cutting while access-door guarding relies entirely on a status lamp
> interpreted by the operator, since the interlock switch itself could not be inspected and no
> function-test record exists. This is a gap in verified guarding function rather than a confirmed
> defeat of the interlock, so the hazard is raised as unresolved rather than active or negated.
> Resolving whether the interlock is genuinely functional determines whether the current cutting
> operation is adequately guarded or must be stopped pending verification."

**Hazard candidates emitted: exactly 1.** `unverified_interlock`, family `machine_guarding`,
`assertedConditionState: INSUFFICIENT_EVIDENCE`. `evidenceBasis`, verbatim: "The physical interlock
switch could not be inspected, and no record exists of when its function was last verified. The
only indication of interlock status is a status lamp the operator interpreted as meaning the
interlock is made."

**Clarifications emitted: exactly 1.** `cq1`, `affectedDecision: REQUIRED_CONTROL`,
`criticality: BLOCKING`, `relatesToCandidateKey: unverified_interlock`,
`answersUnresolvedFactDeclarationId: decl1`. Question, verbatim: "Can the interlock switch be
verified as functioning (by direct inspection, by a function test, or by another means other than
the status lamp) rather than relying solely on the status lamp indication?"

**Raw declarations emitted: exactly 1** (`decl1`). `missingFact`, verbatim: "Whether the interlock
switch is functioning as intended". `observationSpan`, verbatim: "was not accessible for
inspection". `affectedDecision: REQUIRED_CONTROL`. `branchA`: "The interlock switch is functioning
correctly and reliably signals door position to the control system". `branchB`: "The interlock
switch is not functioning correctly or reliably (worn, miswired, or bypassed) despite the lamp
showing green".

**ADMISSION OUTCOME — STATED FOR CONTEXT, NOT AS A ROW-AXIS JUDGMENT.** `decl1` was **REJECTED**
by the admission gate with codes `REQUIRED_FIELD_MISSING` × 2 — "decisionIfA is empty",
"decisionIfB is empty". **Admitted fact keys: none.** Consequently SF-05 has **no projected-fact
review unit**; the refused declaration is carried as U11, whose two questions are supplementary
and deferred, and which is NOT reopened here.

**Recorded neutral observation, verbatim:** declaration count against the preregistered range —
"1 raw / 0 admitted against 1-1" — "the admitted count is OUTSIDE the preregistered range".
`isAVerdict: false`.

**Established facts that were NOT converted into owed facts.** No candidate, clarification or
declaration was emitted about: the door being closed; the lamp showing green or being legible;
whether the operator understands the lamp; whether an interlock is fitted. The single declaration's
`observationSpan` quotes the inspection-access region ("was not accessible for inspection"), which
the preregistration lists **both** as an `acceptableSpanRegion` (region 2 of 3) **and**, as a
property, in `unacceptableNeighbouringProperties` ("whether the switch is accessible for
inspection — that is the reason the fact is open, not the fact itself"). **THAT TENSION IS STATED,
NOT RESOLVED — IT IS FOR THE PRODUCT OWNER.**

### SLOT 1 — `ROW:SF-05:A_FIRST_PASS_GAP_RECALL`

> **Were ALL genuinely decision-critical unresolved facts declared for this row?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Recorded precedent:* `A` = CORRECT on SF-01, SF-03, SF-04, SF-06, SF-08; INCORRECT on SF-02;
NOT_EXERCISED on SF-12 (a `NO_REAL_GAP` row with no recall opportunity).

*Instrument facts bearing on applicability:* SF-05 carries
`preregisteredNotEstablishedByTheText` with two statements and an expected gap count of 1–1, and
the frozen expectation collapses them into ONE owed property with ONE conjunct.

### SLOT 2 — `ROW:SF-05:B_FIRST_PASS_GAP_PRECISION`

> **Were unnecessary or already-resolved facts avoided?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Recorded precedent:* `B` = CORRECT on SF-01, SF-02, SF-03, SF-06, SF-08, SF-12; INCORRECT on
SF-04, where the recorded mechanism was a decision-neutral unknown converted into a
decision-critical owed fact through unsupported adverse counterfactual branch inflation.

*Neutral structural note, offered without judgment:* exactly one candidate, one clarification and
one declaration were emitted, and four of the five preregistered neighbouring properties are
neither declared nor questioned. The fifth (inspection accessibility) appears only as the quoted
`observationSpan`, as recorded above.

### SLOT 3 — `ROW:SF-05:H_MULTI_GAP_PRESERVATION`

> **Do independent gaps survive INDEPENDENTLY?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Instrument facts bearing on an applicability determination, checked before presentation:* the
frozen row registers ONE expected owed fact with ONE conjunct and an expected gap count of 1–1.
The two `preregisteredNotEstablishedByTheText` statements are the protective function and its
never-recorded test, which the frozen expectation treats as one property, not two independent
gaps. §200 nowhere declares axis H exercised or unexercised on SF-05.

*Recorded precedent:* `H` = CORRECT on SF-01, SF-03, SF-08; INCORRECT on SF-02; NOT_EXERCISED on
SF-04, SF-06 and SF-12. On SF-06 the product owner recorded NOT_EXERCISED for a row whose two
`notEstablished` statements are conjuncts of a single property rather than independent gaps.

### SLOT 4 — `ROW:SF-05:I_FALSE_GAP_SUPPRESSION`

> **On a row whose text is sufficient, was an unnecessary owed fact avoided?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Instrument facts bearing on an applicability determination, checked before presentation:* the
axis is worded "on a row whose text is sufficient". SF-05's text is not sufficient — it records two
regions the inspector could not establish, and §200 preregisters an expected gap count of 1–1.
Families are `SINGLE_REAL_UNRESOLVED_FACT` and `FUNCTION_VERSUS_APPEARANCE`, **not**
`NO_REAL_GAP`. `pairedWith` is `SF-12`, and SF-12 is the `NO_REAL_GAP` member of that pair, already
adjudicated (`I` = CORRECT).

*Recorded precedent:* `I` = CORRECT on the `NO_REAL_GAP` rows SF-01, SF-03 and SF-12; INCORRECT on
SF-04; NOT_EXERCISED on SF-02, SF-06 and SF-08.

---

## 2. U13 — ROW SF-07. FOUR SLOTS.

### Observation, verbatim

> Solvent wipe-down bench in the paint prep area. A local exhaust ventilation hood is installed
> directly above the bench and its fan was running and audible. The system's last recorded
> examination is dated within the past twelve months and the label is attached to the ducting. Two
> operators were wiping panels with a ketone-based cleaner in the open. The wiping is carried out
> about 600 mm forward of the hood face, on the near edge of the bench. No airflow indicator is
> fitted at the hood and nobody present could say whether the hood draws vapour away from the
> position where the wiping is actually done.

### Frozen design, verbatim

Families `['SINGLE_REAL_UNRESOLVED_FACT', 'NEARBY_PROPERTY_COMPETITION']`.
`preregisteredExpectedGapCount` **min 1 / max 1**. `pairedWith` **null**. `capability: ABSENT`.
No deterministic findings shown. No governed records shown.

**Preregistered ESTABLISHED:** an LEV hood is installed above the bench; the fan is running; the
last recorded examination is within the past twelve months; wiping happens about 600 mm forward of
the hood face; no airflow indicator is fitted; two operators are working with a ketone-based
cleaner now.

**Preregistered NOT ESTABLISHED (exactly 1):** whether the LEV actually captures solvent vapour at
the position where the wiping is done.

**Preregistered `unacceptableNeighbouringProperties`, verbatim:** whether an LEV is INSTALLED — the
text states it is; whether the fan is RUNNING — the text states it is; whether the system has been
EXAMINED — the text states the examination is within twelve months; whether an airflow indicator is
fitted — that is the reason the fact is open, not the fact; whether respiratory protective
equipment is worn — not raised by the text.

**Preregistered `designIntent`, verbatim:** "INSTALLATION and EXAMINATION versus EFFECTIVENESS AT
THE WORK POSITION. Three strong neighbours are established, and the geometry — 600 mm forward of
the hood face — is the objective reason the effectiveness question is live rather than imagined."

### Recorded first-pass output

Outcome `ANALYZED`. **`uncertainty.statements`: 1**, verbatim: "Whether the ketone-based cleaner's
specific flashpoint and the presence or absence of ignition sources near the bench would elevate
the fire/explosion possibility could not be determined from the observation."

`summary`, verbatim:

> "Two operators are currently wiping panels with a ketone-based solvent at a bench position 600 mm
> forward of the LEV hood face, and the observation states plainly that nobody present could
> confirm the hood actually captures vapour at that working position — this is a live, unresolved
> chemical exposure question rather than a settled control. The hood's fan running and its recent
> examination record speak to the system's general functional status, not to whether it achieves
> effective capture at the specific point where the work is done, so those facts do not close the
> gap. A ketone solvent also raises a secondary, currently unconfirmed flammability consideration
> given no data on flashpoint, quantity, or ignition sources, which is retained at low confidence
> pending further information."

**Hazard candidates emitted: exactly 2.**

- `CAND-1`, family `chemical_exposure`, `assertedConditionState: ACTIVE`. `evidenceBasis`,
  verbatim: "The observation establishes that two operators are actively wiping panels with a
  ketone-based solvent at a position offset from the hood face, and that nobody present could
  determine whether the hood's capture effect reaches that position."
- `CAND-2`, family `fire_explosion`, `assertedConditionState: INSUFFICIENT_EVIDENCE`.
  `evidenceBasis`, verbatim: "The observation identifies the cleaner as ketone-based, a class of
  solvent that is commonly flammable, but the text does not state its flashpoint, quantity in use,
  or presence of ignition sources at the bench."

**Clarifications emitted: exactly 1** (`CL-1`, `REQUIRED_CONTROL`, `BLOCKING`, bound to `CAND-1`
and to `DECL-1`). **Declarations emitted: exactly 1** (`DECL-1`), **1 admitted, 0 rejected**.

**A SECOND HAZARD CANDIDATE WAS EMITTED BUT NO SECOND OWED FACT WAS DECLARED.** `CAND-2`
(fire/explosion) carries `INSUFFICIENT_EVIDENCE` and generated no declaration and no
clarification; the associated unknown was routed to `uncertainty.statements` instead. **This is
stated as a structural fact bearing on both axis A and axis B. It is not characterised here as
recall loss or as precision success.**

**Recorded neutral observation, verbatim:** declaration count against the preregistered range —
"1 raw / 1 admitted against 1-1" — "the admitted count is inside the preregistered range".
`isAVerdict: false`.

**Established facts that were NOT converted into owed facts.** No declaration or clarification was
emitted about: whether an LEV is installed; whether the fan is running; whether the system has been
examined; whether an airflow indicator is fitted; whether RPE is worn. `DECL-1`'s
`notEstablishedBecause` states the installation/examination neighbours affirmatively and
distinguishes them from the owed property.

### SLOT 5 — `ROW:SF-07:A_FIRST_PASS_GAP_RECALL`

> **Were ALL genuinely decision-critical unresolved facts declared for this row?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Recorded precedent:* `A` = CORRECT on SF-01, SF-03, SF-04, SF-06, SF-08; INCORRECT on SF-02;
NOT_EXERCISED on SF-12.

*Neutral structural note:* the frozen row registers exactly one not-established statement; the
first pass declared exactly one owed fact; and the flammability unknown was carried in
`uncertainty` rather than declared. Whether the flammability unknown is decision-critical on this
observation is a semantic question the packet does not answer.

### SLOT 6 — `ROW:SF-07:B_FIRST_PASS_GAP_PRECISION`

> **Were unnecessary or already-resolved facts avoided?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Recorded precedent:* `B` = CORRECT on SF-01, SF-02, SF-03, SF-06, SF-08, SF-12; INCORRECT on
SF-04 (unsupported adverse counterfactual branch inflation of a decision-neutral unknown).

*Neutral structural note:* three strong established neighbours (installed, running, examined) are
each affirmatively stated in `notEstablishedBecause` rather than declared as open, and none of the
five preregistered neighbours appears as a declaration or clarification. `CAND-2` was raised as a
candidate at `INSUFFICIENT_EVIDENCE` without being promoted to an owed fact.

### SLOT 7 — `ROW:SF-07:H_MULTI_GAP_PRESERVATION`

> **Do independent gaps survive INDEPENDENTLY?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Instrument facts bearing on an applicability determination, checked before presentation:* the
frozen row registers ONE not-established statement, ONE expected owed fact, ONE conjunct
("the LEV captures vapour at the actual work position"), and an expected gap count of 1–1. §200
nowhere declares axis H exercised or unexercised on SF-07. The recorded neutral observation for
the projected fact states "the expected fact is not conjunctive".

*Recorded precedent:* `H` = CORRECT on SF-01, SF-03, SF-08; INCORRECT on SF-02; NOT_EXERCISED on
SF-04, SF-06 and SF-12.

### SLOT 8 — `ROW:SF-07:I_FALSE_GAP_SUPPRESSION`

> **On a row whose text is sufficient, was an unnecessary owed fact avoided?**

Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*Instrument facts bearing on an applicability determination, checked before presentation:* SF-07's
text is not sufficient — it states in terms that nobody present could say whether the hood draws
vapour away from the wiping position, and §200 preregisters one not-established region with an
expected gap count of 1–1. Families are `SINGLE_REAL_UNRESOLVED_FACT` and
`NEARBY_PROPERTY_COMPETITION`, **not** `NO_REAL_GAP`. `pairedWith` is null.

*Recorded precedent:* `I` = CORRECT on the `NO_REAL_GAP` rows SF-01, SF-03 and SF-12; INCORRECT on
SF-04; NOT_EXERCISED on SF-02, SF-06 and SF-08. On SF-06 the product owner wrote "DO NOT AWARD A
VACUOUS CORRECT RESULT FOR AXIS I ON SF-06."

---

## 3. U14 — PROJECTED FACT `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1` (`DECL-1`). TEN SLOTS.

### The declaration, and the projected OwedFact the verifier actually received

| field | value |
|---|---|
| `missingFact` (declaration only) | "Whether the hood achieves effective vapour capture at the actual wiping position 600 mm forward of the hood face" |
| `evidenceSpan` (projected) | "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done" |
| `whyUnresolved` | "The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine." |
| `affectedDecision` | `REQUIRED_CONTROL` |
| `branchA` | "Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point" |
| `branchB` | "Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point" |
| `decisionIfA` | "Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance" |
| `decisionIfB` | "Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming" |
| `priority` | **`OTHER`** |
| `status` | `UNRESOLVED` |
| `acceptableEvidence` | null |
| `modelAuthored` | true |

`whyNecessaryNow` (declaration only), verbatim: "Operators are actively performing the solvent
wipe-down task now with an evaporative ketone solvent, so the adequacy of vapour capture at their
actual working position determines whether they are currently exposed above safe levels; this
cannot be deferred while the task continues."

**`missingFact` present in the projected OwedFact: FALSE.** The declaration's `missingFact`
sentence is not in the object the verifier received. Same projection-loss precondition as SF-06,
U16 and U17.

### The clarification, verbatim

`CL-1`: **"What is the measured or verified capture velocity/airflow at the actual wiping position
(600 mm forward of the hood face, near edge of bench), and does it meet the effective capture range
for this hood design?"**

`whyItMatters`, verbatim: "If capture velocity at the wiping position is adequate, the operators
are effectively protected by LEV despite being off-axis, and no additional control is needed beyond
continued monitoring. If capture at that position is inadequate, operators are being exposed to
un-captured ketone vapour during an active task and the work must stop or move until effective
capture is confirmed, or additional controls (respirators, hood repositioning, work practice
change) must be implemented now."

`evidenceGap`, verbatim: "No airflow indicator is fitted at the hood and no one present could state
whether the hood draws vapour away from the actual wiping position."

### The verifier record for this fact

`reachedInference` true; `verdict` `VERIFIED_AS_IS`; `owedFactDeclarations` = [{ this factKey,
`STILL_UNRESOLVED`, `challengeReason` null }]; `proposedClarification` null; `bindingFactKey` null;
`clarificationSourceMode` null; `regulatoryBasis.reliance` `NONE`, `sourceIds` []; `admissionAdmitted`
true, no codes; `governedEvidenceShownToVerifier` [].

Rationale, verbatim:

> "The observation establishes the LEV fan is running, audible, and was examined within the past
> twelve months, but explicitly states nobody present could confirm capture effectiveness at the
> actual 600 mm offset working position. This is a control-verification gap (a working system is
> not thereby a system checked at the point of use), and the two possible answers lead to
> materially different actions today: continue current practice vs. stop/relocate the task and add
> supplementary controls. The first-pass clarification directly asks for the measured/verified
> capture velocity/airflow at that exact working position and whether it meets the effective
> capture range — this question, if answered, would resolve the fact in full; there is no
> sub-component of the fact left untouched by it. No second fact from the observation appears to
> govern a different live decision: the fire/explosion candidate is already at
> INSUFFICIENT_EVIDENCE and the first pass reasonably treated it as low-confidence and
> non-actionable without flashpoint/ignition source data, but nothing in the text suggests an
> ignition source is present or that a decision is being made now that turns on it. The
> clarification asked is sufficient and correctly targeted; no additional nomination is warranted."

### Frozen expectation for this fact, verbatim

`owedProperty`: "whether the local exhaust ventilation actually captures solvent vapour at the
position where the wiping is carried out, about 600 mm forward of the hood face".
`expectedAffectedDecision` `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions`
`['EXPOSURE']`. `branchSemantics.aMustMean`: "the LEV captures vapour effectively at the position
where wiping occurs"; `bMustMean`: "the LEV does not capture vapour at that position and operators
are breathing it". `expectedDecisionDivergence.ifA`: "the LEV is accepted as an effective control
and wiping continues at the bench"; `ifB`: "wiping is moved into the capture zone, or stopped,
until capture at the work position is established". `designNoteOnCriticality`: "ineffective capture
with operators wiping ketone in the open is an inhalation exposure now; a reviewer may judge this
important rather than immediately life-critical".

### Neutral deterministic observations (comparisons, not verdicts)

- declared `evidenceSpan` vs the 3 preregistered `acceptableSpanRegions`: **the declared span is
  EXACTLY one of the preregistered regions**.
- declared `affectedDecision` vs preregistered: **matches** (`REQUIRED_CONTROL`; `EXPOSURE` also
  acceptable).
- shared vocabulary with `unacceptableNeighbouringProperties` — **A WEAK POINTER, NOT EVIDENCE OF
  SUBSTITUTION**: highest is 33% with "whether an LEV is INSTALLED — the text states it is".
- preregistered conjuncts vs the full declaration text: **the expected fact is not conjunctive**.

### The ten questions

**SLOT 9 — `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`**
> Does this declaration identify the EXACT property that remains unknown?
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
*Precedent:* CORRECT on SF-01, SF-02, SF-04, SF-06, SF-08/cap-discharge; PARTIALLY_CORRECT on
SF-08/voltage-test, where the recorded mechanism was an omitted third semantic state.

**SLOT 10 — `…:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`**
> Is the verbatim span actually relevant to WHY this fact is unresolved?
Allowed: five-value. *Precedent:* CORRECT on all six adjudicated facts.

**SLOT 11 — `…:E_BRANCH_PLAUSIBILITY`**
> Are branchA and branchB genuinely possible resolutions of THIS exact fact?
Allowed: five-value. *Precedent:* CORRECT on SF-01, SF-02, SF-08/cap-discharge;
PARTIALLY_CORRECT on SF-04 (unsupported adverse counterfactual inflation), SF-06, and
SF-08/voltage-test (incomplete partition).
*Neutral structural note:* both branches here are phrased as outcomes of a measurement
("Airflow/capture measurement … confirms X" / "… confirms not-X") rather than as bare states of the
world. The packet does not characterise that phrasing.

**SLOT 12 — `…:F_DECISION_DIVERGENCE_VALIDITY`**
> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?
Allowed: five-value. *Precedent:* CORRECT on SF-01, SF-02, SF-08 ×2; PARTIALLY_CORRECT on SF-06;
INCORRECT on SF-04.

**SLOT 13 — `…:G_AFFECTED_DECISION_CORRECTNESS`**
> Is the fact bound to the correct affectedDecision?
Allowed: five-value. *Precedent:* CORRECT on SF-01, SF-02, SF-06, SF-08 ×2; INCORRECT on SF-04.

**SLOT 14 — `…:L_VERIFIER_TARGET_BINDING`**
> Does the verifier verdict address the EXACT projected owed fact?
Allowed: five-value. *Precedent:* CORRECT on all six adjudicated facts.

**SLOT 15 — `…:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`**
> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?
Allowed: five-value. *Precedent:* CORRECT on SF-01, SF-02, SF-04, SF-08/cap-discharge;
PARTIALLY_CORRECT on SF-08/voltage-test (performance vs result); INCORRECT on SF-06, where the
clarification could be answered YES while failing the original temporal property.

**SLOT 16 — `…:Q_OWED_PROPERTY_LOSS_IMPACT`**
> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for THIS fact?
Allowed: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` ·
`NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` ·
`HUMAN_REVIEW_DIFFICULTY`
*Precedent:* NO_OBSERVABLE_LOSS on SF-01, SF-02, SF-04, SF-08 ×2; CLARIFICATION_INSUFFICIENCY on
SF-06. Five NO_OBSERVABLE_LOSS results do not establish that projection loss is harmless, and
SF-06 remains the one observed consequence.

**SLOT 17 — `…:R_SAFETY_CLASSIFICATION`**
> How would you classify this fact's safety significance?
Allowed: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` ·
`INDETERMINATE`
*Precedent:* ORDINARY_NON_ESCALATING on SF-01 and SF-04; PLAUSIBLY_LIFE_CRITICAL on SF-02, SF-06,
SF-08 ×2. `SAFETY_SIGNIFICANT` has not yet been used on any fact.

**SLOT 18 — `…:R_PRIORITY_FLOOR_IMPACT`**
> Does the `OTHER` floor under-escalate it?
Allowed: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` ·
`INDETERMINATE`
*Projected `priority` for this fact:* **`OTHER`**.
*Precedent:* FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE on SF-01, SF-02, SF-06, SF-08 ×2;
FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE on SF-04.
**DIAGNOSTIC MEASUREMENT ONLY. NO PRIORITY-POLICY MUTATION AND NO PROVIDER ESCALATION AUTHORITY
ARE AUTHORIZED BY THIS SLOT.**

---

## 4. AFTER BATCH 2

Recording all 18 would take SUPPLIED to **106 / 120**, REMAINING to **14 / 120**, leaving only
U18 (row SF-11, 4 slots) and U19 (projected fact `FP.EXPOSURE.OBS-SF-11.357-406.1`, 10 slots) —
one further batch.

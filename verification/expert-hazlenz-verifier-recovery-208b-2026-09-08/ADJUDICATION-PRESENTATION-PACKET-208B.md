# §208B — ACCEPTANCE ADJUDICATION PRESENTATION PACKET

**Verifier evidence: `ACCEPTANCE_VERIFIER_EVIDENCE` from the §208B recovery.** The §208 verifier outputs are `DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE` and are not an input to any judgment here. The replacement is uniform across all 24 facts.

Preregistration identity `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`. 177 slots, **zero verdicts supplied**.

**The evidence lives ONCE, here.** The worksheet holds identity and slots only, so the two artifacts cannot drift into disagreeing copies of the same bytes.

**Read in this order, per case:** the frozen observation → the frozen truth → what the run actually produced → then form the verdict. The deterministic scoring is evidence, not a suggested answer, and no slot carries a prefill.

---

## AC-01 — A_INDEPENDENT_MULTI_GAP — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, ROW.H, ROW.I, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.L, FACT2.C, FACT2.E, FACT2.F, FACT2.M, FACT2.L

### 1. Frozen observation supplied

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 2–2
- **AC-01-F1** (PLAUSIBLY_LIFE_CRITICAL): whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
  - conjuncts: “the lanyard is connected to the designated anchor point”
  - essential qualifiers: attachment, not possession -- wearing the harness is established and is not the question · the designated anchor point, not any convenient part of the basket
  - acceptable partition: the lanyard is attached to the designated anchor point | the lanyard is not attached to the designated anchor point
  - affectedDecision: REQUIRED_CONTROL (alt: EXPOSURE)
  - PROHIBITED decision claims: that fall protection across the site, or for other tasks on this machine, is adequate // that the machine is safe to operate, which this fact does not reach -- P2 is open // that no other fall-protection measure is required anywhere
  - a sufficient clarification must establish: the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
  - unacceptable neighbours: whether a harness is worn -- the text states it is · whether the basket has an anchor point -- the text states it does · whether the harness is in date or inspected · whether the operator is trained to use the machine
- **AC-01-F2** (PLAUSIBLY_LIFE_CRITICAL): whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
  - conjuncts: “the duct cover carries the wheel loading in the machine's present configuration”
  - essential qualifiers: the loading with the basket RAISED, which is the loading that applies now · the specific duct cover the machine is standing on, not floor loading generally
  - acceptable partition: the duct cover is rated for, and carries, this wheel loading | the duct cover is not rated for this wheel loading, or its rating cannot be established
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE, APPLICABILITY)
  - PROHIBITED decision claims: that the aisle floor generally is suitable for this machine // that the machine is safe to use, which this fact does not reach -- F1 is open // that outriggers would resolve it, which the fact does not establish
  - a sufficient clarification must establish: the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
  - unacceptable neighbours: whether the duct is marked -- the text states it is · whether the outriggers are deployed -- the text states they are stowed and that this is normal · whether the aisle is wide enough
- **false-gap trap AC-01-T1:** whether the harness is within its inspection date — nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **false-gap trap AC-01-T2:** whether the outriggers should be deployed — the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 2, admitted 2, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The operator is working from a boom MEWP basket at roughly six metres wearing a harness and lanyard, but the inspector could not confirm the lanyard is actually connected to the marked anchor point, leaving the effectiveness of fall protection unresolved. Separately, the machine is standing on a marked service duct with no visible load rating and no site plan available to confirm the duct can bear the machine's weight, leaving the structural adequacy of the standing surface unresolved. These two open facts compound: an elevated worker's safety depends on both a secure body-wear connection and a stable base, and neither is currently confirmed.

#### produced declaration 1 — `decl_lanyard` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
- **missingFact:** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “the inspector could not see where its other end terminates”
- **whyUnresolved:** 
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point

#### produced declaration 2 — `decl_duct` — ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
- **missingFact:** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** HAZARD_SEVERITY
- **observationSpan:** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **whyUnresolved:** 
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues

#### clarifications the model asked
- `q_lanyard_connection` (REQUIRED_CONTROL, BLOCKING): Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?
- `q_duct_capacity` (HAZARD_SEVERITY, BLOCKING): What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- admission: []

#### verifier verdict for `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-01.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G2, G3 | present |
| `AC-01.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-01.ROW.H` | H MULTI_GAP_PRESERVATION | Do independent gaps survive INDEPENDENTLY? | G2 | present |
| `AC-01.ROW.I` | I FALSE_GAP_SUPPRESSION | On a row whose text is sufficient, was an unnecessary owed fact avoided? | G4 | present |
| `AC-01.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-01.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-01.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-01.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-01.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |
| `AC-01.FACT2.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-01.FACT2.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-01.FACT2.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-01.FACT2.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-01.FACT2.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |

---

## AC-02 — A_INDEPENDENT_MULTI_GAP — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, ROW.H, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.L, FACT2.C, FACT2.E, FACT2.F, FACT2.M, FACT2.L

### 1. Frozen observation supplied

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 2–2
- **AC-02-F1** (PLAUSIBLY_LIFE_CRITICAL): whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
  - conjuncts: “the wheel's rated speed is at or above the machine's spindle speed”
  - essential qualifiers: the comparison of two figures, not the presence of a marking -- the marking is established
  - acceptable partition: the wheel is rated at or above the spindle speed | the wheel is rated below the spindle speed, or the comparison cannot be made
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE, APPLICABILITY)
  - PROHIBITED decision claims: that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open // that the machine is safe to use
  - a sufficient clarification must establish: both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
  - unacceptable neighbours: whether the wheel carries a speed marking -- the text states it does · whether blotters are fitted -- the text states they are · whether the fitter was trained or competent
- **AC-02-F2** (SAFETY_SIGNIFICANT): whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
  - conjuncts: “the tongue guard gap is within tolerance for the wheel now fitted”
  - essential qualifiers: after the wheel change -- the pre-change setting is established and is not the question
  - acceptable partition: the gap is within tolerance for the wheel now fitted | the gap is outside tolerance for the wheel now fitted
  - affectedDecision: REQUIRED_CONTROL
  - PROHIBITED decision claims: that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here // that the wheel is correctly specified, which is the other fact
  - a sufficient clarification must establish: the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
  - unacceptable neighbours: whether the wheel guards are fitted or closed -- the text states they are · whether the work rest gap is correct -- the observation does not raise it
- **false-gap trap AC-02-T1:** whether the portable appliance inspection is in date — the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 2, admitted 2, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The observation raises two machine-guarding concerns beyond the deterministic findings: an adjustable tongue guard left in a position set for a prior wheel rather than confirmed reset for the newly fitted wheel, and an inability to confirm the new wheel's rated speed against the spindle speed. A worn inspection-label date on the flex is also noted as an electrical unknown. None of these can be resolved from the observation as given, and the wheel-speed match and guard clearance are both operationally blocking questions because the grinder is currently running with an operator dressing a bracket at the affected wheel.

#### produced declaration 1 — `decl_wheel_speed` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
- **missingFact:** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **whyUnresolved:** 
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use

#### produced declaration 2 — `decl_guard_clearance` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
- **missingFact:** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **whyUnresolved:** 
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use

#### clarifications the model asked
- `q_wheel_speed_rating` (REQUIRED_CONTROL, BLOCKING): Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?
- `q_tongue_guard_gap` (REQUIRED_CONTROL, BLOCKING): Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
- verdict: **ADD_OR_REPLACE_CLARIFICATION**
- bindingFactKey: -
- rationale: The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- admission: ["PROPOSAL_REQUIRED_FOR_THIS_VERDICT","SOURCE_MODE_MISSING_ON_A_CLARIFICATION"]

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-02.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G2, G3 | present |
| `AC-02.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-02.ROW.H` | H MULTI_GAP_PRESERVATION | Do independent gaps survive INDEPENDENTLY? | G2 | present |
| `AC-02.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-02.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-02.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-02.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-02.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |
| `AC-02.FACT2.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-02.FACT2.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-02.FACT2.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-02.FACT2.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-02.FACT2.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |

---

## AC-03 — A_INDEPENDENT_MULTI_GAP — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, ROW.H, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.L, FACT2.C, FACT2.E, FACT2.F, FACT2.M, FACT2.L

### 1. Frozen observation supplied

> The charging bay holds four lead-acid traction batteries on charge. A pool of clear liquid roughly one metre across lies on the floor between the second and third charger stands. It carries no odour the inspector could detect and no container or spill source is visible; the bay also has an overhead cooling line that has dripped in the past. The mechanical extract fan serving the bay is fitted with a run indicator lamp above the door; the lamp was not lit at the time of the visit and the inspector could not hear the fan over the noise from the adjacent conveyor. Eye-wash and neutraliser are present and in date. Two operatives were working in the bay during the visit.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 2–2
- **AC-03-F1** (SAFETY_SIGNIFICANT): whether the pooled liquid on the charging bay floor is battery electrolyte
  - conjuncts: “the identity of the pooled liquid”
  - essential qualifiers: identity of the liquid, not the fact that a pool is present
  - acceptable partition: the liquid is electrolyte | the liquid is not electrolyte (condensate or water)
  - affectedDecision: HAZARD_EXISTENCE (alt: HAZARD_SEVERITY)
  - PROHIBITED decision claims: that the charging bay is safe, which this fact does not reach -- the ventilation fact is open // that no battery is damaged, which identification of the liquid alone would not establish
  - a sufficient clarification must establish: what the liquid is. A clarification satisfied by "there is a spill" or "a spill kit is available" is insufficient.
  - unacceptable neighbours: whether a spill is present -- the text states it is · whether spill equipment is available -- the text states it is · whether the floor is slippery
- **AC-03-F2** (PLAUSIBLY_LIFE_CRITICAL): whether the bay's mechanical extract is actually running while the four batteries are on charge
  - conjuncts: “the extract is running during charging”
  - essential qualifiers: running during charging, not merely fitted -- the fan's existence is established · an unlit indicator that could not be corroborated is not the same as a fan that is off
  - acceptable partition: the extract is running | the extract is not running
  - affectedDecision: REQUIRED_CONTROL (alt: EXPOSURE)
  - PROHIBITED decision claims: that the atmosphere in the bay is safe, which running alone does not establish // that the pooled liquid is harmless, which is the other fact
  - a sufficient clarification must establish: whether the fan was running at the time. A clarification satisfied by "the bay has mechanical extract" is insufficient.
  - unacceptable neighbours: whether an extract system is fitted -- the text states it is · whether the indicator lamp works -- that is a symptom, not the safety property
- **false-gap trap AC-03-T1:** whether eye-wash provision is adequate — the text states eye-wash and neutraliser are present and in date, and nothing puts their adequacy in question.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The observation describes an unidentified liquid pool in an active charging bay and an extract fan whose run status cannot be confirmed (unlit indicator, inaudible over conveyor noise) while two operatives work near four batteries on charge — both facts warrant escalation but neither the liquid's identity nor the fan's actual operating state is established by the text. The combination of active hydrogen-generating charging with an unconfirmed extract-fan status is a genuine cross-hazard concern, since the control depended upon is exactly the one left unverified during the period of highest gas generation. Eye-wash/neutraliser presence is a positive control already in place, but it does not resolve either open question about the spill source or fan operation.

#### produced declaration 1 — `DECL-FAN-STATE` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-03.438-566.1`
- **missingFact:** whether the mechanical extract fan is currently running
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “the lamp was not lit at the time of the visit and the inspector could not hear the fan over the noise from the adjacent conveyor”
- **whyUnresolved:** 
- **branchA:** The fan is running and providing mechanical extract ventilation despite the unlit lamp (e.g., faulty lamp/bulb)
- **branchB:** The fan is not running, so the bay is without mechanical extract ventilation during active battery charging
- **decisionIfA:** Continue charging operations, but repair or replace the faulty indicator lamp so fan status can be reliably monitored going forward
- **decisionIfB:** Stop or pause charging and/or remove operatives from the bay until ventilation is confirmed restored, given hydrogen gas generation during charging

#### clarifications the model asked
- `CLAR-FAN-RUNNING` (REQUIRED_CONTROL, BLOCKING): Is the mechanical extract fan actually running right now, confirmed by a means other than the indicator lamp (e.g., feeling airflow at a grille, checking the motor/controller status)?
- `CLAR-SPILL-ID` (HAZARD_EXISTENCE, BLOCKING): What is the liquid in the pool between the second and third charger stands — is it battery electrolyte, or is it condensate/water from the cooling line?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-03.438-566.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: Both supplied unresolved facts genuinely bear on decisions that would change today's action. The fan-status fact (FP.REQUIRED_CONTROL...) is already directly asked by the first-pass clarification requiring confirmation of actual fan operation by a means other than the indicator lamp — that question, if answered, resolves whether the fan is running (covering both branches: airflow felt = running, no airflow = stopped), which is exactly what the fact requires. The liquid-identity clarification is also already asked and reaches the CAND-SPILL/CAND-DRIP-ELEC uncertainty, distinguishing electrolyte (corrosive hazard, evacuation/neutralisation) from condensate (slip/electrical hazard, different response). No unresolved fact was left unaddressed by the two clarifications. I do not see an additional fact, not among those supplied, whose answer would change today's action: the eyewash/neutraliser presence is stated and settled; the presence of two operatives is stated; nothing else in the observation appears to gate a distinct decision that isn't already covered by the two questions asked.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-03.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G2, G3 | present |
| `AC-03.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-03.ROW.H` | H MULTI_GAP_PRESERVATION | Do independent gaps survive INDEPENDENTLY? | G2 | present |
| `AC-03.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-03.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-03.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-03.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-03.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |
| `AC-03.FACT2.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | NO OPPORTUNITY — see worksheet |
| `AC-03.FACT2.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | NO OPPORTUNITY — see worksheet |
| `AC-03.FACT2.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | NO OPPORTUNITY — see worksheet |
| `AC-03.FACT2.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | NO OPPORTUNITY — see worksheet |
| `AC-03.FACT2.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | NO OPPORTUNITY — see worksheet |

---

## AC-04 — B_DECISION_NEUTRAL_UNKNOWN — frozen class **ORDINARY_NON_ESCALATING**

**Slots on this case:** ROW.A, ROW.B, ROW.I

### 1. Frozen observation supplied

> A fixed steel ladder runs from grade to the top platform of bulk storage tank 4, a rise of about nine metres, and is fitted with a safety cage from 2.2 metres upward. The inspector climbed the ladder. Every rung was sound and free of corrosion, the stringers were secure at each wall fixing, and the cage hoop spacing and the clearance from the rung face to the back of the cage were measured and are within the required dimensions. The ladder carries a current inspection tag dated last month. No manufacturer's plate is fitted and site records do not show the year the ladder was installed. The top platform has a compliant guardrail and a self-closing gate at the ladder head.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 0–0
- **false-gap trap AC-04-T1:** whether the ladder predates the current standard, so that its cage geometry might not comply — this is the F2 mechanism exactly: an adverse state is IMAGINED from a missing date and then treated as the reason the fact matters. The observation states the geometry was measured and is within the required dimensions. A date cannot reopen a measurement. Declaring this is INCORRECT on axes B and I.
- **false-gap trap AC-04-T2:** whether the ladder has ever had a documented design assessment — both answers leave the ladder in use today on the strength of the current inspection tag and the direct measurements.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 0, admitted 0, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The ladder, cage, tag and top-platform guarding are all described as sound, inspected and compliant with measured dimensions, so no active hazard is established by the deterministic engine and none is added here with confidence. The one point worth flagging is the low-level gap below the 2.2 metre cage start, which is an inherent feature of this type of cage installation rather than a defect, so it is raised at low confidence for awareness only. Missing manufacturer's plate and unknown installation year are historical/documentation gaps that do not change any current control decision given the current inspection tag and verified physical condition, so no clarification is raised.

**The model declared NO unresolved facts on this case.**

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-04.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G3 | present |
| `AC-04.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-04.ROW.I` | I FALSE_GAP_SUPPRESSION | On a row whose text is sufficient, was an unnecessary owed fact avoided? | G4 | present |

---

## AC-05 — B_DECISION_NEUTRAL_UNKNOWN — frozen class **ORDINARY_NON_ESCALATING**

**Slots on this case:** ROW.A, ROW.B, ROW.I

### 1. Frozen observation supplied

> A fitter is clearing a carton jam at the infeed of a belt conveyor. The conveyor's local isolator is in the OFF position and carries a padlock. Before starting work the fitter attempted a start from the local control station and from the line HMI; the drive did not start on either attempt, and the inspector witnessed the second attempt. The fitter is holding the padlock key on a lanyard around his neck and is working at the conveyor. The padlock is a plain brass padlock with no name tag, and the inspector could not tell whether it is the fitter's personal lock or one issued from the workshop lock store.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 0–0
- **false-gap trap AC-05-T1:** whether the isolation was proved by attempting a start — THE OBSERVATION STATES IT WAS, from two positions, one of them witnessed. Re-asking it is a nearby-property substitution of the most direct kind, and on this cohort it is the specific over-correction RR-3 and RR-5 could induce. Declaring it is INCORRECT on axes B and I.
- **false-gap trap AC-05-T2:** whether someone else could remove the padlock because it may be a store lock — an adverse state supposed from a missing detail. The key is on the person at risk; the lock's provenance does not change what is done today.
- **false-gap trap AC-05-T3:** whether a written isolation procedure exists for this conveyor — genuinely unknown and a legitimate matter for a management-system review, but it does not change what happens at this machine today, where the isolation is proved and the key is held.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The isolation itself appears sound: the isolator is off, padlocked, the fitter tested for absence of energy from two control points before starting, and he retains the key while working — a properly verified, currently-effective lockout. The one open point is that the padlock's identity is unclear (personal lock versus a shared workshop-store lock with no name tag), which the inspector explicitly could not resolve; this bears on whether the isolation is exclusively controlled by the fitter or whether a duplicate key could exist elsewhere, so it is raised as a low-certainty candidate and a targeted clarification rather than asserted either way.

#### produced declaration 1 — `decl-lock-ownership` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-05.497-609.1`
- **missingFact:** Whether the padlock securing the isolator is a personal lock exclusive to the fitter or a shared/workshop-issued lock with duplicate keys
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “the inspector could not tell whether it is the fitter's personal lock or one issued from the workshop lock store”
- **whyUnresolved:** 
- **branchA:** The padlock is personally assigned to and exclusively controlled by the fitter, with no duplicate keys in circulation
- **branchB:** The padlock is a shared/workshop-store lock for which duplicate keys exist elsewhere
- **decisionIfA:** The lockout is complete and personally controlled; no additional lock or verification step is needed
- **decisionIfB:** The isolation is not exclusively under the fitter's control and the lock should be replaced with, or supplemented by, a personally-assigned lock before work continues

#### clarifications the model asked
- `cq-lock-source` (REQUIRED_CONTROL, IMPORTANT): Is the padlock securing the isolator a lock personally assigned to and exclusively controlled by the fitter (with no duplicate keys held elsewhere), or is it a shared/workshop-store lock to which other keys may exist?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-05.497-609.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The observation establishes that the isolator is off and padlocked, that the fitter verified absence of energy by attempting starts from two control points (one witnessed), and that he alone holds the key while working. What it leaves genuinely open is whether the padlock is personally assigned to him or a workshop-store lock to which duplicate keys might exist — a fact explicitly flagged as unresolved by the inspector. This matters: if duplicate keys exist elsewhere, the isolation is not exclusively under the fitter's control, and a personally-assigned lock should be substituted or added before work continues; if the lock is personal and exclusive, the current lockout is sufficient. The two answers lead to different actions, so this is a decision-relevant, unresolved fact, and the first-pass clarification question directly and completely reaches it — asking whether the lock is personally assigned and exclusively controlled with no duplicate keys, or a shared/workshop-store lock to which other keys may exist. An answer to that question, in either direction, resolves the fact as stated (both the ownership and the duplicate-key aspects are covered by the question's two branches). No other fact not already raised appears necessary to a safety or regulatory decision here: the energy-isolation verification itself is affirmatively stated and complete, and no other open contingency changes the current action.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-05.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G3 | present |
| `AC-05.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-05.ROW.I` | I FALSE_GAP_SUPPRESSION | On a row whose text is sufficient, was an unnecessary owed fact avoided? | G4 | present |

---

## AC-06 — B_DECISION_NEUTRAL_UNKNOWN — frozen class **ORDINARY_NON_ESCALATING**

**Slots on this case:** ROW.A, ROW.B, ROW.I

### 1. Frozen observation supplied

> The fire door at the head of the protected escape stair on the second floor was tested by the inspector: released from the fully open position it closed under its own self-closer and latched fully into the keep on each of three attempts. The intumescent strips and cold smoke seals are continuous and undamaged, the gaps at the head and both stiles were measured and are within tolerance, the door carries no hold-open device and none was in use, and the signage is present and correct. The six-monthly fire-door inspection record for this door is kept by the managing agent and was not available during the visit, so the date of the last recorded inspection is not known.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 0–0
- **false-gap trap AC-06-T1:** whether the six-monthly inspection is overdue, so that the door might be non-compliant — the property an inspection record would evidence -- that the door closes and latches -- has been directly established today by a better instrument than the record. A missing record is a documentation gap; it is not a decision-critical unresolved SAFETY fact here. ADJUDICATOR NOTE: this is the closest call in block B and it is frozen deliberately. If the product owner disagrees at review, the disagreement must be recorded BEFORE execution, not after seeing output.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 0, admitted 0, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The fire door at the head of the protected escape stair was directly tested by the inspector on this visit and performed correctly on all three attempts, with intact seals, compliant gaps, no unauthorised hold-open device, and correct signage — the physical condition of the door as observed is fully sound with no current gap or defect. The absence of the six-monthly inspection record is a documentation-availability issue only; it does not indicate the door itself is currently deficient, since the inspector's own physical testing directly and independently established the door's present functional condition regardless of what the paper record would have shown. No current hazard or decision-critical question arises from this observation.

**The model declared NO unresolved facts on this case.**

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-06.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G3 | present |
| `AC-06.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-06.ROW.I` | I FALSE_GAP_SUPPRESSION | On a row whose text is sufficient, was an unnecessary owed fact avoided? | G4 | present |

---

## AC-07 — C_DOWNSTREAM_CONTAINMENT — frozen class **SAFETY_SIGNIFICANT**

**Slots on this case:** ROW.A, ROW.B, FACT1.F, FACT1.G, FACT1.R_SAFETY, FACT1.M

### 1. Frozen observation supplied

> Compressor 2 is fitted with an acoustic enclosure. A sound level measurement taken at the operator's normal standing position at the control panel, with the compressor running, gave a level below the level at which hearing protection is required. During the visit the enclosure's side access panel was found unlatched and standing about 100 mm open; the attending technician said he had opened it a few minutes earlier to look at a gauge. Whether the panel is normally closed while the machine runs is not established. The plant room also contains compressor 1 and two pumps, none of which were assessed. Operatives enter the plant room several times per shift.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-07-F1** (SAFETY_SIGNIFICANT): whether the acoustic enclosure is normally closed while the compressor is running, so that the measurement taken at the control panel position represents normal operation
  - conjuncts: “the enclosure is closed during normal running”
  - essential qualifiers: normally closed during running -- not whether it was closed at the moment of measurement · at the control panel position -- the measurement's location is part of what it establishes
  - acceptable partition: the enclosure is normally closed during running, and the measurement represents normal operation | the enclosure is normally open or routinely left open during running, so the measurement does not represent normal operation
  - affectedDecision: EXPOSURE (alt: REQUIRED_CONTROL, HAZARD_SEVERITY)
  - PROHIBITED decision claims: THE PRIMARY F7 TRAP: that no hearing protection is required in the plant room, or that no further noise control is needed. The measurement covers ONE position and ONE machine; compressor 1 and the two pumps were expressly not assessed // that operatives' daily personal noise exposure is below the action level, which a single spot level at one position does not establish // that the enclosure is effective, which one measurement at one position does not establish
  - a sufficient clarification must establish: whether the enclosure is closed during normal running. A clarification satisfied by "the panel was open for maintenance access" reaches the topic without settling the property.
  - unacceptable neighbours: whether a measurement was taken -- the text states it was · whether an enclosure is fitted -- the text states it is · whether hearing protection is available
- **false-gap trap AC-07-T1:** whether the other plant in the room has been assessed — the text states it has not. That is a stated scope limit, not an open property of this observation, and converting it into an owed fact is a precision failure. It is listed here so the adjudicator can distinguish it from the F7 trap, which is branch A CLAIMING coverage of that same plant.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 2, admitted 2, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** Compressor 2's compliant noise reading was taken under conditions that do not reflect the currently observed state: the acoustic enclosure's access panel was found open about 100 mm at the time of the visit, which may degrade its noise attenuation while operatives pass through the room several times per shift. Whether the panel is normally closed during running, and what the sound level actually is with it open, are both left unresolved by the observation and are decision-critical to whether hearing protection or a corrective control is needed now. Separately, compressor 1 and the two pumps in the same room were not assessed at all, so their contribution to occupied-area noise levels is unknown, though this is noted with lower confidence as it was not the subject of this assessment.

#### produced declaration 1 — `d1` — ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-07.264-348.1`
- **missingFact:** sound level at operator position with the access panel open (as currently found)
- **affectedDecision:** HAZARD_SEVERITY
- **observationSpan:** “the enclosure's side access panel was found unlatched and standing about 100 mm open”
- **whyUnresolved:** 
- **branchA:** The sound level with the panel open remains below the level at which hearing protection is required
- **branchB:** The sound level with the panel open rises to or above the level at which hearing protection is required
- **decisionIfA:** No hearing protection requirement is triggered by the open panel; ensure the panel is closed and latched as a housekeeping/enclosure-integrity matter
- **decisionIfB:** Hearing protection or restricted access is required for the plant room until the panel is closed and latched, and the enclosure integrity control needs reinforcement

#### produced declaration 2 — `d2` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-07.439-518.1`
- **missingFact:** whether the access panel is normally closed while the compressor runs
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “Whether the panel is normally closed while the machine runs is not established.”
- **whyUnresolved:** 
- **branchA:** The panel is normally closed and latched during running, and this was a one-off deviation by the technician
- **branchB:** The panel is routinely left open or unlatched during running operation
- **decisionIfA:** Correct this instance (close and latch the panel) and remind personnel to re-latch after inspection tasks; no systemic procedural change required
- **decisionIfB:** A procedural or engineering control is needed to ensure the enclosure is kept closed during operation, beyond a one-off correction

#### clarifications the model asked
- `cq1` (HAZARD_SEVERITY, BLOCKING): With the access panel open as found, what is the sound level at the operator's standing position and at other occupied points in the plant room, compared with the level recorded with the panel closed?
- `cq2` (REQUIRED_CONTROL, IMPORTANT): Is the side access panel normally kept closed and latched while the compressor runs, or is it routinely left open/ajar during running operation?

#### verifier verdict for `FP.HAZARD_SEVERITY.OBS-AC-07.264-348.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The first-pass questions cover the two decision-critical unresolved facts. Question 1 (HAZARD_SEVERITY) directly asks for the sound level at the operator's position and other occupied points with the panel open as found, compared to the closed-panel reading — this exactly reaches FP.HAZARD_SEVERITY.OBS-AC-07.264-348.1, since an answer either way (below or at/above the hearing-protection threshold) determines whether hearing protection/access restriction is required now. Question 2 (REQUIRED_CONTROL) separately asks whether the panel is normally closed/latched during running or routinely left open, which addresses whether this is a one-off lapse or a systemic control failure. Together these two questions address both the severity-under-current-conditions fact and the normal-operating-state fact; no supplied fact is left unaddressed by a reachable question. On the fourth step, I considered whether unassessed_equipment_noise (compressor 1, two pumps) hides a decision-critical fact not raised, but that candidate was left at INSUFFICIENT_EVIDENCE with lower confidence and no measurement, threshold, or specific claim was made that would change a concrete action today beyond what's already flagged; nominating a fact there would just be asking for more evidence generally, which is not a valid reason. I find no additional fact, outside those supplied, whose answer is necessary to change today's action.
- admission: []

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-07.439-518.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The two clarifications already asked cover the decision-critical facts. The first asks for the actual sound level with the panel open as found, which resolves HAZARD_SEVERITY / whether hearing protection is currently required. The second directly asks whether the panel is normally closed and latched while running or routinely left open/ajar during running operation — this is the same fact as FP.REQUIRED_CONTROL.OBS-AC-07.439-518.1 (whether the observed open state is a one-off deviation or a routine condition), and its answer determines whether a one-off correction suffices or a systemic procedural/engineering control is required. Both branches of that fact are captured by the question's wording ("normally kept closed and latched... or... routinely left open/ajar during running operation"), so an answer to either branch fully settles the owed fact. The unassessed_equipment_noise candidate was left at INSUFFICIENT_EVIDENCE with lower confidence and the first pass did not ask about it; nominating a question there would only be warranted if it changed a decision being made now, but the analysis treats it as a secondary, lower-confidence note not tied to an active decision, so no additional clarification is needed for it. No other fact outside those supplied appears to govern a decision left unaddressed: the panel-open severity and normal-operating-state facts are the two things that matter, and both are already asked.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-07.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-07.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-07.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-07.FACT1.G` | G AFFECTED_DECISION_CORRECTNESS | Is the fact bound to the correct affectedDecision? | — | present |
| `AC-07.FACT1.R_SAFETY` | R_SAFETY PRIORITY_FLOOR_IMPACT (safety classification half) | How would you classify this fact's safety significance? | G15 | present |
| `AC-07.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |

---

## AC-08 — C_DOWNSTREAM_CONTAINMENT — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, FACT1.F, FACT1.G, FACT1.R_SAFETY, FACT1.M

### 1. Frozen observation supplied

> A marked pedestrian walkway crosses the goods-in vehicle route at right angles roughly ten metres inside the yard gate. The crossing has painted markings on the ground and a sign on each approach. There is no barrier, gate, or signal at the crossing. During a forty-minute observation, counterbalance trucks passed along the route eleven times and no pedestrian was seen on the walkway at any point. Two people were seen using the walkway outside the observation period, once before it began. Nothing was seen or heard that indicates why no pedestrian used the crossing during the forty minutes, and the yard traffic management arrangements were not examined.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-08-F1** (PLAUSIBLY_LIFE_CRITICAL): whether pedestrians and moving trucks are prevented from being at the crossing at the same time by an actual control, rather than the coincidence of the observation period
  - conjuncts: “a control prevents the simultaneous presence, and it operates in practice”
  - essential qualifiers: prevention, not observed absence -- the absence is established and is not the question · in practice, not on paper
  - acceptable partition: a control operates that prevents simultaneous presence | no control operates and the absence during the observation was coincidental
  - affectedDecision: EXPOSURE (alt: REQUIRED_CONTROL)
  - PROHIBITED decision claims: THE PRIMARY F7 TRAP: on the negative branch, that the exposure "is therefore controlled by the site traffic procedure". The branch establishes that nothing was seen to prevent it; it says nothing about what a procedure requires, and the yard traffic management arrangements were expressly not examined // on the positive branch, that pedestrian and vehicle segregation across the yard is adequate. One crossing was observed // that no pedestrian is exposed, which the observation expressly contradicts
  - a sufficient clarification must establish: what, if anything, keeps pedestrians and trucks apart at this crossing. A clarification satisfied by "no pedestrian was seen" restates the observation and settles nothing.
  - unacceptable neighbours: whether the crossing is marked or signed -- the text states it is · whether pedestrians use the walkway -- the text states they do · whether truck drivers are trained
- **false-gap trap AC-08-T1:** whether the yard traffic management arrangements are adequate — stated as not examined. It is a scope limit. The decision-critical property is narrower and specific to this crossing.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The observation describes a marked pedestrian crossing over an active goods-in vehicle route with painted markings and signage but no barrier, gate or signal, while counterbalance trucks transited the crossing eleven times in a forty-minute window; this combination is raised as an active pedestrian-vehicle segregation hazard and a workplace transport hazard, since the absence of any pedestrian on the walkway during the sample does not remove the exposure created by the unsegregated crossing and its frequent traffic. The two conditions interact: frequent vehicle transits across an unbarriered crossing point raise the likelihood that a pedestrian and a truck occupy the crossing simultaneously with no engineered protection. Because the yard traffic management arrangements were explicitly not examined, it remains open whether any procedural control beyond paint and signage governs this crossing, which is material to what additional control, if any, is required.

#### produced declaration 1 — `decl-traffic-mgmt` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-08.600-658.1`
- **missingFact:** whether yard traffic management arrangements provide any operational control at the crossing beyond the painted markings and signs
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “the yard traffic management arrangements were not examined”
- **whyUnresolved:** 
- **branchA:** Documented traffic management arrangements exist that materially govern behaviour at this crossing (e.g., mandatory vehicle stop, speed restriction, scheduled separation)
- **branchB:** No traffic management arrangements beyond the painted markings and signs govern this crossing
- **decisionIfA:** The crossing has an operational control layer beyond passive markings, so the recommended action would focus on verifying and reinforcing that existing control rather than treating the crossing as uncontrolled
- **decisionIfB:** The crossing relies solely on passive markings against frequent vehicle transits, so additional physical or procedural segregation control would be recommended now

#### clarifications the model asked
- `clar-traffic-mgmt` (REQUIRED_CONTROL, IMPORTANT): What yard traffic management arrangements (e.g., truck speed limits, right-of-way rules at the crossing, driver visibility checks, scheduling to separate pedestrian and vehicle movements) are in place at this crossing?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-08.600-658.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The single unresolved fact supplied (whether any traffic management arrangements beyond paint/signage govern the crossing) is exactly the fact the first-pass clarification question asks about: it lists candidate arrangements (speed limits, right-of-way rules, visibility checks, scheduling) and asks what is in place. An answer describing existing arrangements would resolve branch A (verify/reinforce existing control); an answer that none exist would resolve branch B (recommend new segregation control). The question as written reaches both branches of the owed fact, so it is already asked. Reviewing for a missed governing fact: the observation gives crossing geometry, traffic volume, signage/marking state, and absence of barrier/signal/pedestrian sightings — nothing else in the text points to a separate fact whose answer would change today's required action beyond what is already captured by the traffic-management question. No regulatory evidence was supplied, so no regulatory proposition is available to rely on.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-08.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-08.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-08.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-08.FACT1.G` | G AFFECTED_DECISION_CORRECTNESS | Is the fact bound to the correct affectedDecision? | — | present |
| `AC-08.FACT1.R_SAFETY` | R_SAFETY PRIORITY_FLOOR_IMPACT (safety classification half) | How would you classify this fact's safety significance? | G15 | present |
| `AC-08.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |

---

## AC-09 — C_DOWNSTREAM_CONTAINMENT — frozen class **ORDINARY_NON_ESCALATING**

**Slots on this case:** ROW.A, ROW.B, FACT1.F, FACT1.G, FACT1.R_SAFETY, FACT1.M

### 1. Frozen observation supplied

> Six 205-litre drums of a water-miscible cutting fluid concentrate stand on a proprietary bunded pallet in the external chemical store. The bund is intact, dry and free of debris, and all six drums are closed with their bungs in place. The bunded pallet carries no marking of its sump capacity, the delivery paperwork for the pallet is not held on site, and the sump depth could not be measured because the drums are in place. The store is roofed, the door is locked, and a spill kit is mounted beside the door.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-09-F1** (ORDINARY_NON_ESCALATING): whether the bunded pallet's sump capacity is sufficient to retain the contents of the largest drum stored on it plus the required margin
  - conjuncts: “the sump capacity meets the required proportion of the stored volume”
  - essential qualifiers: capacity, not condition -- condition is established · relative to the volume actually stored on this pallet
  - acceptable partition: the sump capacity is sufficient for the volume stored | the sump capacity is insufficient for the volume stored, or cannot be established
  - affectedDecision: REQUIRED_CONTROL (alt: APPLICABILITY, HAZARD_SEVERITY)
  - PROHIBITED decision claims: POSITIVE-BRANCH TRAP: that the chemical store is compliant, or that no further containment measure is required anywhere. One pallet's sump capacity is not the store's containment provision // NEGATIVE-BRANCH TRAP: that the drums must be removed from site, or that the store must be closed. The branch establishes a capacity shortfall on one pallet; the action it justifies is proportionate to that, and a shutdown claim outruns it just as badly as a compliance claim does // that the substance is or is not environmentally hazardous, which this fact does not reach
  - a sufficient clarification must establish: the sump capacity as a figure, set against the volume stored. A clarification satisfied by "the drums are on a bund" restates what is established.
  - unacceptable neighbours: whether the drums are bunded at all -- the text states they are · whether the bund is damaged -- the text states it is intact · whether a spill kit is available -- the text states it is
- **false-gap trap AC-09-T1:** whether the substance is hazardous enough to require bunding at all — the drums are already bunded and the arrangement is in place; the open question is capacity. Re-opening applicability changes nothing about what is done today.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The observed drum storage is currently in good order: the bund is intact, dry and debris-free, drums are closed, the store is roofed and locked, and a spill kit is available. The one open item is that the bund's actual containment capacity cannot be confirmed from the observation — it carries no capacity marking, the delivery paperwork is not on site, and depth could not be measured with drums in place — so whether the containment would be adequate in the event of a leak or spill remains unresolved and is worth confirming.

#### produced declaration 1 — `decl-sump-capacity` — ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-09.235-425.1`
- **missingFact:** The sump (bund) capacity of the pallet relative to the volume of liquid stored on it
- **affectedDecision:** HAZARD_SEVERITY
- **observationSpan:** “The bunded pallet carries no marking of its sump capacity, the delivery paperwork for the pallet is not held on site, and the sump depth could not be measured because the drums are in place.”
- **whyUnresolved:** 
- **branchA:** The sump capacity meets or exceeds the required containment volume for the six drums stored
- **branchB:** The sump capacity is less than the volume needed to contain a release from the drums stored
- **decisionIfA:** The bunded pallet remains an adequate containment control; only the missing on-site marking/paperwork needs administrative follow-up
- **decisionIfB:** The containment control cannot be relied upon and interim measures (verifying capacity, moving drums to measure, reducing stored volume, or adding supplementary containment) are needed now

#### clarifications the model asked
- `cq-sump-capacity` (HAZARD_SEVERITY, IMPORTANT): What is the sump (bund) capacity of this pallet, and does it meet or exceed the required containment volume for the six 205-litre drums stored on it?

#### verifier verdict for `FP.HAZARD_SEVERITY.OBS-AC-09.235-425.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The unresolved fact is whether the bund's sump capacity meets the required containment volume for the six 205-litre drums. This is a genuine decision-critical fact: if capacity is adequate, the current bunded pallet is a sufficient control; if inadequate, interim measures are needed now. The first-pass clarification directly asks for the sump capacity and whether it meets/exceeds the required containment volume for the six drums, which is exactly the fact needed to resolve both branches. No piece of that fact is left unaddressed by the question as written. I do not see another fact outside those supplied that would govern a different safety/regulatory decision here — the store is roofed, locked, drums closed, bund intact/dry/debris-free, and a spill kit is present, all consistent regardless of capacity, and no other contingency changes today's action.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-09.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G3 | present |
| `AC-09.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-09.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-09.FACT1.G` | G AFFECTED_DECISION_CORRECTNESS | Is the fact bound to the correct affectedDecision? | — | present |
| `AC-09.FACT1.R_SAFETY` | R_SAFETY PRIORITY_FLOOR_IMPACT (safety classification half) | How would you classify this fact's safety significance? | G15 | present |
| `AC-09.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | — | present |

---

## AC-10 — D_VERIFICATION_STATE — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.R_SAFETY, FACT1.R_FLOOR

### 1. Frozen observation supplied

> An electrician is part way through replacing a contactor in cubicle 7 of the motor control centre. The cubicle isolator is in the OFF position and is locked off with the electrician's lock. A two-pole voltage indicator is lying on the cubicle plinth beside the work. Asked about isolation, the electrician said "I tested it before I started". No proving unit was seen at the workstation, in the tool bag laid open on the floor, or anywhere in the switchroom, and the electrician did not say where or on what conductors he tested. The cubicle is fed from a busbar chamber that also serves cubicles 6 and 8, both of which remain live.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-10-F1** (PLAUSIBLY_LIFE_CRITICAL): whether the test for dead was carried out at the point of work with an indicator proved before and after on a known source, and whether it established that the conductors being worked on are dead
  - conjuncts: “the test was carried out at the point of work”; “the indicator was proved before and after on a known source”; “the test established absence of voltage at those conductors”
  - essential qualifiers: AT THE POINT OF WORK -- a test elsewhere on the installation does not settle it · ESTABLISHED, not merely performed -- the F5 distinction, and the reason a clarification about whether testing happened is insufficient · PROVED BEFORE AND AFTER -- an unproved indicator reading "dead" establishes nothing
  - acceptable partition: the test was carried out at the point of work with a proved indicator and established absence of voltage | no test was carried out at the point of work | a test was carried out but did NOT establish absence of voltage at the point of work -- because the indicator was not proved, or the wrong conductors were tested, or the result was inconclusive
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE)
  - PROHIBITED decision claims: that the installation is safe to work on generally -- adjacent cubicles on the same busbar remain live and this fact does not reach them // that the isolation is adequate, which locking off alone does not establish // that testing having been performed means the conductors are dead
  - a sufficient clarification must establish: WHAT THE TEST SHOWED at the point of work, and that the instrument was proved -- not whether a test was carried out. A clarification answerable YES by "yes, I tested it" is the F5 defect exactly and is INSUFFICIENT.
  - unacceptable neighbours: whether the circuit is isolated -- the text states the isolator is locked off · whether a test was performed -- the electrician states it was · whether the electrician is competent or authorised · whether a permit was issued
- **false-gap trap AC-10-T1:** whether the isolator is locked — the text states it is, with the electrician's own lock.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The isolator for cubicle 7 is locked off with the electrician's own lock, and the electrician reports having tested for absence of voltage before starting; however, no proving unit was found anywhere in the switchroom and he could not say where or on what conductors he tested, so the claimed verification cannot be confirmed to have established a dead, safe condition. This gap is materially worsened because cubicle 7 shares a busbar chamber with cubicles 6 and 8, both of which remain live, meaning any error in the isolation point or test location could leave the electrician exposed to energized conductors close to his work. A specific question about the location, conductors, and proving-unit use for the stated test is decision-critical because it determines whether work should continue as safely isolated or stop pending a proper re-verification.

#### produced declaration 1 — `d1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-10.343-528.1`
- **missingFact:** Whether the electrician's absence-of-voltage test was performed correctly (right conductors, with a proven tester) to confirm cubicle 7 is actually de-energized
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “No proving unit was seen at the workstation, in the tool bag laid open on the floor, or anywhere in the switchroom, and the electrician did not say where or on what conductors he tested”
- **whyUnresolved:** 
- **branchA:** The electrician tested the correct load-side conductors in cubicle 7 using a proving unit (perhaps since put away) and confirmed absence of voltage
- **branchB:** The test was performed on the wrong conductors, without a proving unit, or not meaningfully at all, so absence of voltage in cubicle 7 was never actually confirmed
- **decisionIfA:** Isolation is verified adequate; work may continue under the existing lockout with no additional control required
- **decisionIfB:** Work must stop and absence of voltage must be re-verified using a proven voltage indicator on the correct conductors before work resumes, given the adjacent live busbar sections feeding cubicles 6 and 8

#### clarifications the model asked
- `q1` (REQUIRED_CONTROL, BLOCKING): Where and on which conductors did the electrician perform the voltage test he referred to, and was a proving unit used to confirm the tester's function before and after that test?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-10.343-528.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The unresolved fact requires two things at once: (1) where/on which conductors the test was performed, and (2) whether a proving unit was used to confirm the tester's function before/after. The first-pass question as written asks both parts explicitly: "Where and on which conductors did the electrician perform the voltage test he referred to, and was a proving unit used to confirm the tester's function before and after that test?" An honest answer to this compound question would need to address both the location/conductors and the proving-unit use, which together establish exactly what the supplied fact requires. This is not a weak-branch "or" question -- it is a conjunctive question whose full answer settles both components of the owed fact. No separate unresolved fact outside the supplied set appears necessary: the shared busbar hazard is already captured as ACTIVE and does not depend on a further unasked fact, and no other decision-critical gap is apparent from the observation.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-10.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-10.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-10.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | G5 | present |
| `AC-10.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | G5 | present |
| `AC-10.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-10.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-10.FACT1.R_SAFETY` | R_SAFETY PRIORITY_FLOOR_IMPACT (safety classification half) | How would you classify this fact's safety significance? | G15 | present |
| `AC-10.FACT1.R_FLOOR` | R_FLOOR PRIORITY_FLOOR_IMPACT (floor half) | Does the OTHER floor under-escalate this fact? | G15 | present |

---

## AC-11 — D_VERIFICATION_STATE — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.R_SAFETY, FACT1.R_FLOOR

### 1. Frozen observation supplied

> The 500-litre air receiver in the compressor house was taken out of service six weeks ago after corrosion was found at a weld seam, and a repair was carried out by a contractor. The receiver is back in the system and on line: the isolation valves are open and the gauge reads working pressure. The maintenance log for the receiver has one line for the return to service, reading "pressure test done, back in service". No test certificate is held on site, the test pressure reached is not recorded, and the contractor's report has not been received. The receiver serves the workshop air ring main and the compressor was running during the visit.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-11-F1** (PLAUSIBLY_LIFE_CRITICAL): whether the post-repair pressure test established the integrity of the repaired seam at the receiver's maximum allowable working pressure
  - conjuncts: “the test reached the required pressure and the receiver withstood it without defect”
  - essential qualifiers: at the required pressure -- a test at a lower pressure establishes less · ESTABLISHED integrity, not that a test happened · of the repaired seam specifically
  - acceptable partition: the test was carried out at the required pressure and established integrity | no adequate test was carried out | a test was carried out but did NOT establish integrity at the required pressure -- for example it was run at a reduced pressure, aborted, or produced an equivocal result
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE, APPLICABILITY)
  - PROHIBITED decision claims: that the pressure system as a whole is safe -- one vessel's repair is not the system // that the repair was competently carried out, which a test result alone would not establish // that a written scheme of examination is or is not in place, which is not reached here
  - a sufficient clarification must establish: the pressure the test reached and what it showed. A clarification answerable YES by "yes, a pressure test was done" is INSUFFICIENT -- the log already says that.
  - unacceptable neighbours: whether a pressure test was carried out -- the log states it was · whether the receiver was repaired -- the text states it was · whether the receiver has a current statutory examination
- **false-gap trap AC-11-T1:** whether the contractor was competent — not raised by the observation, and the decision today turns on what the test established, not on who did it. It becomes relevant only as evidence toward the declared fact.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The receiver is back on line and pressurised following a weld repair, but the only record of the return-to-service test is a single unverified log line with no retained certificate, no recorded test pressure, and no contractor report, leaving the adequacy of the repair unconfirmed while the vessel is under working pressure and supplying the workshop ring main. This is a live pressure-systems/mechanical-integrity concern rather than a documentation formality, because the vessel is currently pressurized and in active service. A secondary, lower-confidence concern is whether the weld repair itself was executed and inspected to a standard that restores mechanical integrity, which the observation does not describe either way.

#### produced declaration 1 — `ufd-1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-11.455-496.1`
- **missingFact:** the pressure value reached during the post-repair test and whether it met the required test/acceptance threshold
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “the test pressure reached is not recorded”
- **whyUnresolved:** 
- **branchA:** the test was carried out and reached/passed the required test pressure, confirming the repair holds at working pressure
- **branchB:** the test was not carried out to an adequate pressure, or its result is unknown/failed, so the repaired weld's integrity under working pressure is unconfirmed
- **decisionIfA:** the receiver may remain in service as currently configured, with the documentation gap addressed administratively by obtaining the certificate and contractor report
- **decisionIfB:** the receiver should be taken out of service or depressurised until a valid pressure test and contractor verification are obtained, given it is currently pressurised and feeding the workshop ring main

#### clarifications the model asked
- `cc-1` (REQUIRED_CONTROL, BLOCKING): What pressure was the receiver actually tested to after the repair, and was that value at or above the required test pressure for this vessel before it was returned to service?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-11.455-496.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The single unresolved fact supplied (whether the post-repair test actually reached/passed an adequate pressure) is decision-critical: if confirmed, the vessel stays in service with a paperwork fix; if not, it must be taken out of service or depressurised given it is currently live and feeding the ring main. The first-pass clarification question directly asks 'What pressure was the receiver actually tested to after the repair, and was that value at or above the required test pressure for this vessel before it was returned to service?' This reaches both components of the owed fact: it asks for the actual value reached (addressing whether a valid test occurred and what it showed) and whether that value met the required threshold (addressing adequacy/pass-fail). An answer to this question as written would settle the supplied fact in full — there is no weaker branch that leaves part of it open, since the question is conjunctive (value AND comparison to requirement), not an 'or' escape. The secondary hazard candidate (repair-weld-integrity) is at INSUFFICIENT_EVIDENCE and no clarification is required to resolve mere evidence insufficiency per the instructions. I do not see a further decision-critical fact outside those already covered: the receiver being on-line, isolation valves open, and compressor running are all stated facts, and no additional unresolved fact independently changes today's action beyond the pressure-test adequacy question already asked.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-11.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-11.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-11.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | G5 | present |
| `AC-11.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | G5 | present |
| `AC-11.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-11.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-11.FACT1.R_SAFETY` | R_SAFETY PRIORITY_FLOOR_IMPACT (safety classification half) | How would you classify this fact's safety significance? | G15 | present |
| `AC-11.FACT1.R_FLOOR` | R_FLOOR PRIORITY_FLOOR_IMPACT (floor half) | Does the OTHER floor under-escalate this fact? | G15 | present |

---

## AC-12 — D_VERIFICATION_STATE — frozen class **SAFETY_SIGNIFICANT**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.E, FACT1.M

### 1. Frozen observation supplied

> A two-leg chain sling is rigged to a waste skip ready for lifting by the yard crane. The chain, master link and hooks are free of visible damage, wear, stretch or distortion, and the hooks have working latches. The sling carries an identification tag at the master link, but the tag face is coated in dried paint and nothing on it can be read: neither the identification number nor the safe working load is legible, and no second marking is present anywhere on the assembly. The site keeps its thorough examination reports indexed by sling identification number. The lift had not started when the inspector arrived.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-12-F1** (SAFETY_SIGNIFICANT): whether this sling can be identified from a legible marking, so that its safe working load is known and it can be tied to its thorough examination record
  - conjuncts: “a legible identification exists on the assembly”
  - essential qualifiers: legible identification, not the presence of a tag -- a tag is present and says nothing
  - acceptable partition: a legible identification exists (for example under the paint, or in a duplicate marking) and the sling can be identified | no legible identification exists and the sling cannot be identified
  - affectedDecision: APPLICABILITY (alt: REQUIRED_CONTROL, HAZARD_EXISTENCE)
  - PROHIBITED decision claims: that the sling is safe because it looks undamaged -- condition is not identification // that all lifting accessories on site require inspection, which this fact does not reach
  - a sufficient clarification must establish: whether a legible identification can be obtained from this assembly.
  - unacceptable neighbours: whether a tag is fitted -- the text states one is · whether the sling is damaged -- the text states it is not · whether the crane has a current examination
- **false-gap trap AC-12-T1:** a THIRD branch of the form "the marking was checked but did not establish identification" — THIS IS THE OVER-CORRECTION THE CASE EXISTS TO CATCH. The declared property is whether a legible identification exists. That is a state of the world with exactly two values. "Checked and did not establish it" IS the second branch, not a third state; writing it as a third branch produces an incoherent partition and is INCORRECT or PARTIALLY_CORRECT on axis E. RR-3 is a test to apply, not a shape to impose, and correctly applied here it yields two states.
- **false-gap trap AC-12-T2:** whether the thorough examination is in date, as a separate owed fact — it cannot be answered while identification is open, and it adds no separate decision today. Declaring it separately is an axis-B precision failure.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The chain sling itself shows no physical damage or wear, but its identification tag is illegible due to paint coating, with no second marking present anywhere on the assembly, and the site's examination records are indexed by that identification number. This means the sling currently cannot be matched to any thorough examination record or confirmed safe working load, which is a present equipment-identification hazard independent of its physical condition. The lift had not yet started, so there is an opportunity to resolve identification before the sling is put into service; whether the sling can be identified by other means is the key open question governing whether it can safely be used as rigged.

#### produced declaration 1 — `decl-sling-id` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-12.317-473.1`
- **missingFact:** Whether the sling's identity and thorough examination status can be confirmed by a means other than the illegible tag
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “nothing on it can be read: neither the identification number nor the safe working load is legible, and no second marking is present anywhere on the assembly”
- **whyUnresolved:** 
- **branchA:** The sling's identity and examination record can be confirmed by an alternative means (e.g., matching records, cleaning the tag, or another traceable feature)
- **branchB:** The sling's identity cannot be confirmed by any means
- **decisionIfA:** placeholder
- **decisionIfB:** The sling must be removed from service and replaced before the lift proceeds

#### clarifications the model asked
- `clar-id-lookup` (REQUIRED_CONTROL, BLOCKING): Can the sling's identification number and current thorough examination status be established by any means other than reading the tag (for example, a matching record, a separate marked component, or removing paint to reveal the number), before this sling is used for the lift?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-12.317-473.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The observation establishes that the tag is illegible and no second marking exists on the assembly, but it does not state whether the site can otherwise establish the sling's identity (e.g., by cleaning the tag, cross-referencing records, or another traceable feature). This is genuinely unresolved and decision-critical: if identity can be recovered by some means, the sling can proceed to use once confirmed; if not, it must be pulled from service before the lift. The first-pass clarification directly asks "Can the sling's identification number and current thorough examination status be established by any means other than reading the tag... before this sling is used for the lift?" This question's weakest branch (any alternative means) is exactly the fact at issue, and an answer either way resolves it fully — a yes identifies a path to verification, a no requires removal from service. No piece of the owed fact is left unaddressed by this question. I do not see a further fact outside the supplied set that would change today's action: the physical condition of the chain/hooks is already established as sound, and the only outstanding matter is identification/verification, which the existing question covers.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-12.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-12.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-12.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | G5 | present |
| `AC-12.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | G5 | present |
| `AC-12.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |

---

## AC-13 — E_TEMPORAL_SCOPE — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.D, FACT1.M, FACT1.Q, FACT1.L

### 1. Frozen observation supplied

> A power press in the press shop is running production. A die change was carried out on the night shift. The setter's key switch was used to place the press in setting mode, which on this machine muted the light curtain protecting the tool area, and the key is now back in the setter's cabinet. The machine has since been returned to production and has been running for about two hours with an operator loading blanks by hand. The maintenance system holds a light-curtain function test record for this press dated eleven days ago. Nothing in the log records a function test after the die change.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-13-F1** (PLAUSIBLY_LIFE_CRITICAL): whether the light curtain was function tested after the die change and before the press was returned to production running
  - conjuncts: “a function test occurred in the window between the die change and production running”
  - essential qualifiers: AFTER THE DIE CHANGE -- the eleven-day-old record predates the muting and cannot settle it · BEFORE RETURN TO PRODUCTION -- a test carried out now would correct the position going forward but would not answer whether the last two hours of running were protected
  - acceptable partition: the light curtain was function tested after the die change and before production resumed | it was not tested in that window
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE)
  - PROHIBITED decision claims: that the press is safeguarded, which a function test of one device does not establish // that the setting-mode arrangement is acceptable, which is not reached by this fact
  - a sufficient clarification must establish: whether a function test occurred IN THAT WINDOW. THE F3 TRAP IS EXACT HERE: "has the light curtain been function tested?" is answerable YES from the eleven-day-old record while the declared property remains completely open. A clarification that loses the window is INSUFFICIENT on axis M regardless of how well it is worded.
  - unacceptable neighbours: whether the press has a light curtain -- the text states it does · whether a function test record exists -- the text states one does · whether the setter was authorised to use the key switch
- **false-gap trap AC-13-T1:** whether the key switch is properly controlled — the key is stated to be back in the cabinet, and the decision today turns on whether the guard was proved working before production resumed.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The die change required muting the light curtain, and the maintenance log shows no function test was performed after that die change before the press was returned to two hours of production with hand-loading, leaving the safeguarding device's current effectiveness for this tool setup unverified. This is treated as an active safeguarding-device gap rather than a historical issue because the last recorded test predates the change that most plausibly required re-verification. A single blocking question is raised: whether the light curtain was functionally verified for the current die configuration before or since return to production, since the answer determines whether operation should continue or stop.

#### produced declaration 1 — `decl1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-13.530-594.1`
- **missingFact:** Whether the light curtain was function-tested and confirmed effective for the tool area after the die change
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “Nothing in the log records a function test after the die change.”
- **whyUnresolved:** 
- **branchA:** The light curtain was tested after the die change and confirmed to function correctly and cover the tool area as reconfigured
- **branchB:** The light curtain was not tested after the die change, or was tested and did not confirm correct coverage of the reconfigured tool area
- **decisionIfA:** Production may continue with the light curtain relied upon as the safeguarding device for this die setup, subject to ensuring the confirming record is entered in the log
- **decisionIfB:** The press should be stopped and the light curtain function-tested and verified for the current die setup before production resumes, since the operator is currently hand-loading blanks at the point of operation with an unverified safeguard

#### clarifications the model asked
- `cq1` (REQUIRED_CONTROL, BLOCKING): Was the light curtain's function and alignment verified as effective for the tool area after the die change was completed and before the press was returned to production running?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-13.530-594.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The observation states the light curtain was muted during die change and no log entry records a post-change function test; it does not state whether an unlogged test occurred, whether the curtain was skipped, or whether it currently functions correctly for the reconfigured tool area. This is a control-verification gap where the two branches (verified-effective vs. not verified/ineffective) lead to different actions today: continue production vs. stop and re-verify before resuming, with an operator currently hand-loading at the point of operation. The first-pass question asks exactly this: whether the light curtain's function and alignment were verified as effective for the tool area after the die change and before return to production. Answering that question, in either direction, resolves the single fact that governs the decision. No additional fact appears necessary: the key switch being back in the cabinet is already treated by the analysis as resolving the muting-mode issue, and no other unresolved detail changes what is done today.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-13.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-13.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-13.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-13.FACT1.D` | D EVIDENCE_SPAN_SEMANTIC_RELEVANCE | Is the verbatim span actually relevant to WHY this fact is unresolved? | — | present |
| `AC-13.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7, G8 | present |
| `AC-13.FACT1.Q` | Q OWED_PROPERTY_LOSS_IMPACT | Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact? | G8 | present |
| `AC-13.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |

---

## AC-14 — E_TEMPORAL_SCOPE — frozen class **SAFETY_SIGNIFICANT**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.D, FACT1.M, FACT1.Q, FACT1.L

### 1. Frozen observation supplied

> The spindle moulder in the joinery shop is served by a branch of the shop's dust extraction system. Two weeks ago a new branch was added to the same trunk to serve a second machine installed at the far end of the shop; the work was done by the shop's own maintenance team. The most recent thorough examination and test report for the extraction system is nine months old, is within its fourteen-month interval, and records satisfactory capture velocities at every hood then connected. No measurement has been taken at the spindle moulder hood since the new branch was added. An operative was machining MDF at the moulder during the visit and visible dust was not observed escaping the hood.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-14-F1** (SAFETY_SIGNIFICANT): whether the spindle moulder hood still achieves adequate capture since the additional branch was connected to the shared trunk
  - conjuncts: “capture at this hood is adequate in the system's present configuration”
  - essential qualifiers: SINCE THE MODIFICATION -- the nine-month-old report describes a system that no longer exists · at this hood, not the system in general
  - acceptable partition: capture at the moulder hood is still adequate in the present configuration | capture at the moulder hood is no longer adequate in the present configuration
  - affectedDecision: EXPOSURE (alt: REQUIRED_CONTROL)
  - PROHIBITED decision claims: that the extraction system as a whole is satisfactory -- one hood was measured // that exposure is controlled, which capture at the hood alone does not establish // that no dust escapes, which absence of VISIBLE dust does not establish
  - a sufficient clarification must establish: capture performance at this hood SINCE the modification. "Is there a current LEV test report?" is answerable YES from a report that predates the change and is INSUFFICIENT.
  - unacceptable neighbours: whether the LEV report is in date -- the text states it is · whether extraction is fitted to the machine -- the text states it is · whether the operative wears RPE
- **false-gap trap AC-14-T1:** whether the LEV thorough examination is overdue — the text states it is within interval. The open property is about the modification, not the interval.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The extraction system's most recent thorough test is current within its interval and recorded satisfactory capture velocities, but that test predates a new branch added two weeks ago to the same trunk serving the spindle moulder, and no measurement has been taken at the moulder hood since. An operative was actively machining MDF at that hood during the visit; the absence of visible dust escaping is not the same as confirmed adequate capture velocity for fine respirable dust. This creates an unresolved question about whether the shared extraction system still adequately controls the operative's current dust exposure, which is decision-critical because the answer determines whether interim controls are needed now.

#### produced declaration 1 — `DECL-1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-14.485-574.1`
- **missingFact:** Current capture velocity at the spindle moulder hood after the new branch was added to the shared trunk
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “No measurement has been taken at the spindle moulder hood since the new branch was added.”
- **whyUnresolved:** 
- **branchA:** Capture velocity at the spindle moulder hood remains adequate despite the added branch sharing the trunk
- **branchB:** Capture velocity at the spindle moulder hood has dropped below an effective level because the added branch increased demand on the shared trunk
- **decisionIfA:** The existing local exhaust ventilation continues to be relied upon as the control for MDF dust at the moulder with no interim measure needed beyond scheduling a check to confirm this formally
- **decisionIfB:** Interim measures are needed now for the operative machining MDF at the moulder, such as re-verifying capture velocity before continued use or providing respiratory protection until the system is confirmed adequate

#### clarifications the model asked
- `CLA-1` (REQUIRED_CONTROL, BLOCKING): Has the capture velocity at the spindle moulder hood been measured or otherwise verified as adequate since the new branch was added to the shared trunk two weeks ago?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-14.485-574.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The observation establishes that a new branch was added to the shared extraction trunk two weeks ago, that the last thorough test (predating this change) showed satisfactory capture velocities, and that no measurement has been taken at the moulder hood since. Whether current capture velocity remains adequate is genuinely unresolved and decision-critical: if adequate, existing controls continue with a scheduled confirmation; if inadequate, interim measures (re-verification or respiratory protection) are needed now for the operative currently machining MDF. This is exactly the kind of case where a control that cannot be directly observed (post-modification capture velocity) is not a control that was checked - the visible absence of dust escaping does not establish adequate capture of fine respirable dust. The first-pass question - 'Has the capture velocity at the spindle moulder hood been measured or otherwise verified as adequate since the new branch was added to the shared trunk two weeks ago?' - directly asks for the current state of the exact property at issue (capture velocity at that hood, post-modification), and an answer either way resolves the fact and determines whether interim controls are needed. No second unresolved fact independent of this one appears necessary to determine a decision here; CAND-2's respiratory exposure concern is downstream of and resolved by the same capture-velocity question. I do not see a further fact whose answer would change what is done today beyond what is already asked.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-14.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-14.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-14.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-14.FACT1.D` | D EVIDENCE_SPAN_SEMANTIC_RELEVANCE | Is the verbatim span actually relevant to WHY this fact is unresolved? | — | present |
| `AC-14.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7, G8 | present |
| `AC-14.FACT1.Q` | Q OWED_PROPERTY_LOSS_IMPACT | Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact? | G8 | present |
| `AC-14.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |

---

## AC-15 — E_TEMPORAL_SCOPE — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.D, FACT1.M, FACT1.Q, FACT1.L

### 1. Frozen observation supplied

> A mobile aluminium tower scaffold about four metres to the platform is in use in unit 3, with two operatives fixing services to the soffit. The tower was moved from the far bay to its present position at about 07:30 this morning; the site manager confirmed the move. A scaffold tag hangs on the tower's ladder frame, signed and dated three days ago and marked SAFE TO USE. No entry has been made in the site inspection register today. Both operatives are on the platform and the guardrails and toe boards are in place on all four sides.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-15-F1** (PLAUSIBLY_LIFE_CRITICAL): whether, since the tower was moved this morning, a competent person has inspected it and found it safe to use in its present position
  - conjuncts: “an inspection by a competent person occurred after the move”; “that inspection found the tower safe to use in its present position”
  - essential qualifiers: SINCE THE MOVE -- the three-day-old tag describes the tower in a different position · FOUND SAFE, not merely inspected -- the result conjunct, which is what an inspection is for · in its present position
  - acceptable partition: inspected since the move and found safe to use | not inspected since the move | inspected since the move but not found safe, or the outcome not recorded
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE)
  - PROHIBITED decision claims: that work at height on the site is properly controlled -- one tower is in question // that the tower was correctly assembled, which an inspection result alone does not establish for every component // that the guardrails being in place makes the tower safe to use
  - a sufficient clarification must establish: BOTH conjuncts within the post-move window: that a competent person inspected the tower after the move, and what that inspection concluded. "Has the scaffold been inspected?" is answerable YES from the tag and is INSUFFICIENT on both counts.
  - unacceptable neighbours: whether the tower has a tag -- the text states it does · whether guardrails are fitted -- the text states they are · whether the operatives are trained to use tower scaffolds
- **false-gap trap AC-15-T1:** declaring the inspection and its outcome as TWO independent owed facts — they are two parts of one fact: neither part alone leaves the situation safe, and settling one does not leave the other independently actionable. RR-1 states this boundary expressly. Splitting is an axis-H and axis-C defect, not extra rigour.
- **false-gap trap AC-15-T2:** whether the ground at the new position is level and firm, as a separate fact — it is one of the things a post-move inspection would establish; it is subsumed by the declared fact and adds no separate decision today.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The scaffold currently displays a SAFE TO USE tag dated three days ago, but it was relocated to its present position this morning and no inspection entry has been made in the register today, leaving open whether the tower's stability and configuration were verified after this specific move. Fall protection at the platform itself appears currently controlled, since guardrails and toe boards are stated to be in place on all four sides. The open question is whether a post-move competent-person check occurred, since two operatives are presently working from the platform and the answer determines whether work should continue or stop pending re-inspection.

#### produced declaration 1 — `UF-1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-15.373-433.1`
- **missingFact:** Whether the scaffold was inspected by a competent person after being relocated to its present position this morning
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “No entry has been made in the site inspection register today”
- **whyUnresolved:** 
- **branchA:** An inspection was performed after the 07:30 move confirming the tower is level, stable, and properly configured in its new position, even though it was not yet logged in the register
- **branchB:** No inspection was performed after the move, so the only verification of record is the tag dated three days ago at a different location
- **decisionIfA:** Work may continue on the platform since the scaffold's post-move condition has been verified as safe, and the outstanding item is only to complete the register entry
- **decisionIfB:** Work should stop and the tower scaffold should be re-inspected in its current position before the operatives continue working from the platform

#### clarifications the model asked
- `CQ-1` (REQUIRED_CONTROL, BLOCKING): Has the scaffold been inspected (with a competent person entry made) since it was moved to its present position this morning, and if so does it confirm the tower remains level, stable, and properly locked in this new location?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-15.373-433.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The first-pass question asks whether the scaffold has been inspected with a competent person entry made since the move, and whether that inspection confirms level, stability, and proper locking in the new location. This directly reaches the sole unresolved fact: whether a post-move inspection occurred (as opposed to only the register entry being missing). The question's phrasing "has the scaffold been inspected (with a competent person entry made)" asks about the inspection having occurred, not merely whether paperwork was completed, and the second clause asks for confirmation of the substantive findings (level, stable, locked). An answer to this question, taken as a whole, settles both branches of the owed fact: if no inspection occurred, the answer is no; if one occurred and confirms stability, work continues. The question is sufficient. No other fact not among those supplied appears necessary to the decision being made now: magnitude details (four metres height, two operatives) are already accounted for via the controlled fall-protection hazard, and the guardrail/toe-board control is stated present on all sides, so no separate unresolved fact governs a different decision today.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-15.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-15.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-15.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | G5 | present |
| `AC-15.FACT1.D` | D EVIDENCE_SPAN_SEMANTIC_RELEVANCE | Is the verbatim span actually relevant to WHY this fact is unresolved? | — | present |
| `AC-15.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7, G8 | present |
| `AC-15.FACT1.Q` | Q OWED_PROPERTY_LOSS_IMPACT | Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact? | G8 | present |
| `AC-15.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |

---

## AC-16 — F_CONTRACT_PRESERVATION — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.L

### 1. Frozen observation supplied

> A ribbon blender in the mixing room has a hinged inspection cover over the mixing chamber. The cover is closed and sits flush. It is designed to be held by four captive quarter-turn fasteners; two of the four are engaged and the other two are missing from their housings. When the inspector pressed the free corner of the cover by hand with the machine stopped, it lifted approximately 20 mm before fouling the frame. The blender was started by the operator during the visit and ran for several minutes with the cover in this condition. Whether the cover can be lifted far enough during running to admit a hand to the ribbon is not established.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-16-F1** (PLAUSIBLY_LIFE_CRITICAL): whether the inspection cover, held by two of its four fasteners, still prevents access to the moving ribbon while the blender is running
  - conjuncts: “the cover cannot be displaced far enough during running to admit a hand”
  - essential qualifiers: FUNCTION, not presence -- presence and closure are established · while the blender is RUNNING, which is when the ribbon is dangerous
  - acceptable partition: the cover as fastened still prevents access to the ribbon during running | the cover as fastened can be displaced enough to admit a hand during running
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE, EXPOSURE)
  - PROHIBITED decision claims: that the machine is adequately guarded, which this one cover does not establish // that an interlock is present or absent, which the fact does not reach
  - a sufficient clarification must establish: whether the cover can be displaced far enough to reach the ribbon while it turns. A clarification satisfied by "the cover is closed" or "a cover is fitted" is insufficient -- both are established.
  - unacceptable neighbours: whether a cover is fitted -- the text states it is · whether the cover is closed -- the text states it is · whether the missing fasteners should be replaced -- that is the remedy, not the property · whether the operator was trained
- **false-gap trap AC-16-T1:** whether the two missing fasteners are available in stores — a logistics question about the remedy, not a decision-critical safety property.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The ribbon blender's hinged inspection cover is missing two of its four captive fasteners and was demonstrated to lift roughly 20 mm when pressed by hand with the machine stopped; the machine was nonetheless run in this under-secured condition for several minutes, making the degraded guarding an active current condition rather than a hypothetical one. The observation itself leaves open whether the gap achievable while the ribbon is actually running is large enough to admit a hand to the moving ribbon, which is the fact that determines whether there is an active contact hazard during operation versus a guarding-adequacy deficiency to be corrected before further use. No governed regulatory record was supplied, so no citation or regulatory obligation is asserted here.

#### produced declaration 1 — `D1` — ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-16.537-643.1`
- **missingFact:** Whether the cover gap achievable while the blender is running is large enough to admit a hand to the moving ribbon
- **affectedDecision:** HAZARD_SEVERITY
- **observationSpan:** “Whether the cover can be lifted far enough during running to admit a hand to the ribbon is not established”
- **whyUnresolved:** 
- **branchA:** The gap achievable during running is large enough to admit a hand to the ribbon
- **branchB:** The gap achievable during running is not large enough to admit a hand to the ribbon
- **decisionIfA:** The blender must be stopped and kept out of service until the missing fasteners are replaced and the cover is fully secured, because an active hand-to-ribbon contact hazard exists during operation
- **decisionIfB:** There is no active hand-contact hazard during operation from this gap, but the degraded guard (missing fasteners) should still be repaired before continued routine use since the cover no longer functions as designed

#### clarifications the model asked
- `Q1` (HAZARD_SEVERITY, BLOCKING): Can the cover be lifted far enough while the blender is running (with the ribbon turning) to admit a hand or fingers into the mixing chamber, and has this been tested or measured?

#### verifier verdict for `FP.HAZARD_SEVERITY.OBS-AC-16.537-643.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The observation establishes that the guard cover is missing two of four fasteners and can be lifted ~20mm with the machine stopped, but explicitly leaves open whether the running-condition gap can admit a hand to the ribbon. This is decision-critical: if yes, an active hand-contact hazard exists during operation requiring immediate stoppage; if no, it is a degraded-guard deficiency requiring repair but not necessarily an active contact hazard during operation. This is a genuine unresolved fact whose two answers lead to different characterizations/urgency of required action. The first-pass clarification directly asks: 'Can the cover be lifted far enough while the blender is running (with the ribbon turning) to admit a hand or fingers into the mixing chamber, and has this been tested or measured?' This question, read as written, asks exactly the fact in FP.HAZARD_SEVERITY.OBS-AC-16.537-643.1 — whether the running gap can admit a hand — and an answer to it would fully settle that fact. There is no additional component to the fact requiring a separate check. I do not find another fact outside the supplied set whose answer would change what is done today: the fastener count, static lift measurement, and running behavior are all captured. No additional nomination is warranted.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-16.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-16.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-16.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-16.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-16.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-16.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-16.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |

---

## AC-17 — F_CONTRACT_PRESERVATION — frozen class **SAFETY_SIGNIFICANT**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.E, FACT1.F, FACT1.M

### 1. Frozen observation supplied

> A technician is working alone at a remote pumping station on a routine four-hour visit. The agreed arrangement is that he telephones the control room when he arrives and again when he leaves; there is no check-in during the visit and he carries no man-down alarm or automatic device. He has a mobile phone with signal. The station has a wet well with a fixed cover, and the visit includes electrical work at the control panel in the kiosk. The control room log shows his arrival call was made at 09:05. Whether the control room would notice an overdue departure call, and how quickly, is not recorded anywhere the inspector could find, and the control room supervisor was not available.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-17-F1** (SAFETY_SIGNIFICANT): whether the arrival-and-departure call arrangement would raise an alarm within a time that could still affect the outcome if the technician were incapacitated mid-visit
  - conjuncts: “the absence of a departure call would be noticed, and within a materially useful time”
  - essential qualifiers: within a materially useful time -- an alarm raised at the end of the shift is not the same answer as one raised within the hour, and the property is about the time, not about whether anyone would eventually notice · mid-visit incapacity, which is precisely the case the arrangement does not cover by design
  - acceptable partition: the arrangement would raise an alarm within a materially useful time | the arrangement would not raise an alarm within a materially useful time
  - affectedDecision: REQUIRED_CONTROL (alt: EXPOSURE, HAZARD_SEVERITY)
  - PROHIBITED decision claims: that lone working at this station is acceptable or unacceptable in general -- this visit and this arrangement are what is in question // that the technician is at risk of a specific harm, which the fact does not establish // that a man-down device is required, which is one possible remedy and not a finding
  - a sufficient clarification must establish: the time within which the control room would act on a missing departure call, and what it would do. A clarification satisfied by "there is a lone working procedure" is insufficient -- the procedure is established and its content is the question.
  - unacceptable neighbours: whether a lone-working arrangement exists -- the text states it does · whether the arrival call was made -- the log states it was · whether the technician has a phone -- the text states he does
- **false-gap trap AC-17-T1:** whether the wet well is a confined space requiring a permit — the cover is fixed and the described work is at the control panel. Nothing in the observation puts entry in prospect, so this is an imagined adverse state of the F2 kind.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The technician is working alone for four hours with no mid-visit check-in and no man-down or automatic alerting device, relying solely on arrival/departure telephone calls; this is a present gap in the lone-working monitoring arrangement, compounded by electrical work at the control panel that carries acute incapacitation potential. Whether the control room would actually notice and act on an overdue departure call — the backstop the whole arrangement depends on — is unrecorded and could not be confirmed because the supervisor was unavailable, which is decision-critical to whether the current arrangement is adequate or needs an interim control. No regulatory record was supplied, so no citation or governed obligation is asserted.

#### produced declaration 1 — `d1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-17.503-634.1`
- **missingFact:** whether the control room has a working process to detect and act on an overdue departure call
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “Whether the control room would notice an overdue departure call, and how quickly, is not recorded anywhere the inspector could find”
- **whyUnresolved:** 
- **branchA:** The control room has a defined, functioning process to recognize and escalate an overdue departure call within a bounded, reasonably prompt time
- **branchB:** No such process exists, or none can be confirmed to work reliably
- **decisionIfA:** The existing arrival/departure call arrangement is an adequate emergency backstop for this lone-working visit and no additional interim control is required today
- **decisionIfB:** An interim control (e.g., a scheduled mid-visit check-in, a man-down device, or confirmation from the supervisor before further lone lone-working visits proceed) should be required now to close the detection gap

#### clarifications the model asked
- `cq1` (REQUIRED_CONTROL, BLOCKING): Does the control room have a defined process and timeframe for recognizing that the technician's departure call is overdue and for triggering an emergency response, and did the supervisor confirm this exists?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-17.503-634.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The unresolved fact FP.REQUIRED_CONTROL.OBS-AC-17.503-634.1 concerns whether the control room has a functioning, bounded-time process to notice and escalate an overdue departure call. This is decision-critical: if such a process exists and works, the current arrival/departure call arrangement may be an adequate backstop; if it does not, an interim control (mid-visit check-in, man-down device, etc.) is needed now. The first-pass clarification asks exactly this: 'Does the control room have a defined process and timeframe for recognizing that the technician's departure call is overdue and for triggering an emergency response, and did the supervisor confirm this exists?' This question, read as a whole, requires both elements the fact needs — existence of a defined process AND confirmation (from the supervisor, i.e., verification it actually works) — before it could be answered affirmatively. A truthful 'yes' would require both a defined process/timeframe and supervisor confirmation, which together establish the branch that no interim control is needed; anything short of that (no process, or process exists but unconfirmed) leaves the gap open and points to the other branch. The question therefore reaches the decision-changing fact and is not satisfied by a weaker partial answer, since it explicitly conjoins the two elements with 'and'. I do not find a separate fact outside the supplied set whose answer would change what is done today; the supplied fact already captures the governing uncertainty (the backstop's reliability), and no other magnitude or detail here appears to gate a different control.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-17.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-17.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-17.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-17.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-17.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-17.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |

---

## AC-18 — F_CONTRACT_PRESERVATION — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.E, FACT1.F, FACT1.M

### 1. Frozen observation supplied

> Two roofers are replacing a cracked rooflight on the warehouse roof, which is fibre cement sheet on steel purlins and is fragile throughout. Two crawling boards are laid across the sheets and the roofers are working from them; both wear harnesses attached to a running line rigged along the ridge. Edge protection is in place at the eaves. The purlin spacing was measured by the site team as 1.8 metres. The crawling boards carry no marking of their rated span or safe working load, they were on site when the contractor arrived, and no one present could say whether they are rated to span 1.8 metres with a person on them. Everything else about the arrangement was confirmed satisfactory by direct observation.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-18-F1** (PLAUSIBLY_LIFE_CRITICAL): whether the crawling boards in use are rated to span the measured 1.8 metre purlin spacing with a person and materials on them
  - conjuncts: “the boards are rated for this span under the load they carry”
  - essential qualifiers: at the measured 1.8 metre spacing, not in general · under the load actually imposed, i.e. a person and materials
  - acceptable partition: the boards are rated for the span and load in use | the boards are not rated for it, or their rating cannot be established
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE, APPLICABILITY)
  - PROHIBITED decision claims: that the fall-protection arrangement as a whole is adequate -- the harness and edge protection are established and are a different control from the working platform // that the roof is safe to work on, which this fact does not reach // that fall arrest would make an inadequate board acceptable -- the running line is not the answer to a board that breaks
  - a sufficient clarification must establish: the rated span and load of these boards against the measured spacing. A clarification satisfied by "crawling boards are in use" restates what is established.
  - unacceptable neighbours: whether crawling boards are being used -- the text states they are · whether the roof is fragile -- the text states it is · whether harnesses are worn and attached -- the text states they are
- **false-gap trap AC-18-T1:** whether the running line anchorage is adequate — the observation states everything other than the boards was confirmed satisfactory by direct observation. Reopening it is an unsupported adverse counterfactual.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The observation describes an otherwise well-controlled fragile-roof task, with harnesses on a running line, edge protection, and crawling boards distributing load across a measured 1.8 metre purlin spacing. However, the crawling boards carry no rating markings and nobody present could confirm they are rated to span 1.8 metres with a person on them, leaving the adequacy of the primary control against breaking through the fragile sheeting unresolved. This is decision-critical because it determines whether the current working method is safe to continue or must be stopped pending boards of confirmed rating.

#### produced declaration 1 — `D1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-18.534-622.1`
- **missingFact:** Whether the crawling boards in use are rated to span 1.8 metres with a person on them
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “no one present could say whether they are rated to span 1.8 metres with a person on them”
- **whyUnresolved:** 
- **branchA:** The boards are in fact rated (or can be confirmed via manufacturer data/engineering check) to safely span 1.8 metres loaded with a person
- **branchB:** The boards are not rated for this span, or their rating cannot be confirmed at all
- **decisionIfA:** The crawling board arrangement is an adequate control for the fragile surface and work may continue as currently configured
- **decisionIfB:** Work must stop and the boards must be replaced with ones of confirmed adequate rated span/load before work resumes

#### clarifications the model asked
- `Q1` (REQUIRED_CONTROL, BLOCKING): Are the crawling boards rated (by manufacturer specification, load table, or engineering assessment) to safely span 1.8 metres with a person on them, or can this be otherwise verified?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-18.534-622.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The unresolved fact concerns whether the crawling boards are actually rated (or can be confirmed) to safely span 1.8 metres loaded with a person. The two branches genuinely differ: if confirmed adequate, work continues; if not confirmed or inadequate, work must stop and boards must be replaced. This is decision-critical since the crawling boards are the sole control preventing direct loading of the fragile fibre cement sheet between purlins. The first-pass clarification asks exactly this: whether the boards are rated to span 1.8 metres with a person on them, or can otherwise be verified. An answer to that question — either confirming a manufacturer rating/engineering assessment covering that span and load, or establishing that no such confirmation exists — directly settles the supplied fact. There is no sub-component of the fact left unaddressed: the fact is single-part (adequacy/confirmability of rated span under load), and the question reaches it in full, including its weakest branch ("or can this be otherwise verified") which still requires an affirmative confirmation of adequacy, not merely absence of a known problem. No other unaddressed fact appears necessary to the decision: edge protection, harnesses, and running line are all stated present and satisfactory, and purlin spacing is already measured and stated. No further nomination is warranted.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-18.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-18.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-18.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-18.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-18.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-18.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |

---

## AC-19 — G_PRESERVED_BEHAVIOUR — frozen class **SAFETY_SIGNIFICANT**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.R_SAFETY, FACT1.R_FLOOR

### 1. Frozen observation supplied

> The dressing area of the foundry is where castings are cut and dressed with abrasive wheels, a process that liberates respirable crystalline silica. The inspector was in the area for twenty minutes. During that period the two dressers were fettling with hand tools and no abrasive cutting was carried out; neither dresser was wearing respiratory protective equipment during that time and no RPE was seen in the area, although the inspector did not look inside the two lockers at the end of the bay. A wall notice in the bay states that RPE is to be worn for abrasive cutting. There is no local exhaust ventilation at the dressing benches.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-19-F1** (SAFETY_SIGNIFICANT): whether respiratory protection is worn by the dressers when abrasive cutting is carried out at these benches
  - conjuncts: “RPE is worn during the cutting operation”
  - essential qualifiers: DURING CUTTING -- the observation period contained no cutting, which is why nothing about cutting was observed · worn, not provided -- provision and use are different properties and only use is open here
  - acceptable partition: RPE is worn during abrasive cutting | RPE is not worn during abrasive cutting
  - affectedDecision: EXPOSURE (alt: REQUIRED_CONTROL)
  - PROHIBITED decision claims: that RPE is not provided, or that the employer has failed to provide it -- not observed is not absent, and the lockers were expressly not examined // that exposure is or is not above any limit, which the observation does not establish // that the notice being present means the requirement is followed
  - a sufficient clarification must establish: whether RPE is worn when cutting is done. A clarification satisfied by "RPE is provided" or "there is a notice" does not settle use.
  - unacceptable neighbours: whether RPE was seen during the visit -- the text answers that directly · whether a notice exists -- the text states it does · whether LEV is fitted -- the text states it is not
- **false-gap trap AC-19-T1:** whether RPE is provided to the dressers at all — the observation does not support treating provision as open: it records only that none was seen during a period when the task requiring it was not performed, and that the lockers were not examined. A declaration framed as "RPE is not provided" converts an unobserved thing into an absent thing, which is the S8 failure.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** During the twenty-minute observation window, the dressers were performing hand-tool fettling rather than abrasive cutting, so the specific silica-liberating process the wall notice addresses was not active and RPE non-use in that moment is not established as an active overexposure. However, the dressing benches have no local exhaust ventilation, meaning that when abrasive cutting does occur, control of respirable silica depends entirely on RPE use, and it remains unresolved whether RPE is actually available to the workers since the inspector did not check the lockers at the end of the bay. This gap is decision-critical because it determines whether the posted RPE requirement can practically be complied with once cutting resumes.

#### produced declaration 1 — `DEC-1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-19.426-497.1`
- **missingFact:** Whether RPE is present and accessible in the lockers at the end of the bay
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “the inspector did not look inside the two lockers at the end of the bay”
- **whyUnresolved:** 
- **branchA:** RPE is stored in the lockers and available for the dressers to use when abrasive cutting resumes
- **branchB:** No RPE is stored in the lockers or otherwise available in the bay
- **decisionIfA:** The posted RPE control remains capable of being followed; the corrective focus is on ensuring RPE is actually donned before cutting starts, not on providing new equipment
- **decisionIfB:** The required control mandated by the wall notice cannot currently be met; RPE must be procured and made available before abrasive cutting resumes

#### clarifications the model asked
- `CL-1` (REQUIRED_CONTROL, IMPORTANT): Is respiratory protective equipment actually available to the dressers (e.g., stored in the lockers at the end of the bay) for use when abrasive cutting resumes?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-19.426-497.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The first-pass question asks directly whether RPE is available to the dressers (e.g., in the lockers) for use when abrasive cutting resumes. This is exactly the fact keyed FP.REQUIRED_CONTROL.OBS-AC-19.426-497.1: the observation only states the lockers were not checked, leaving open whether RPE is available. Answering yes means the posted control remains followable and corrective focus is on compliance/enforcement; answering no means RPE must be procured before cutting resumes — a materially different action. The supplied question reaches this fact fully: an answer to it (RPE present/available or not) settles the single thing the fact requires. No additional unaddressed fact changes a decision here: CAND-1's determination that fettling alone during the window doesn't establish active overexposure is not contested by any owed fact, and CAND-2 (no LEV) is a stated, established condition, not something needing clarification since the record already confirms its absence and the reliance-on-RPE analysis follows directly from it. No other fact outside those supplied appears necessary to determine a decision being made now — the observation gives enough about process, ventilation absence and the wall notice to identify the compliance question without needing further undisclosed facts.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-19.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-19.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-19.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-19.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-19.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-19.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-19.FACT1.R_SAFETY` | R_SAFETY PRIORITY_FLOOR_IMPACT (safety classification half) | How would you classify this fact's safety significance? | G15 | present |
| `AC-19.FACT1.R_FLOOR` | R_FLOOR PRIORITY_FLOOR_IMPACT (floor half) | Does the OTHER floor under-escalate this fact? | G15 | present |

---

## AC-20 — G_PRESERVED_BEHAVIOUR — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, ROW.H, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.L, FACT2.C, FACT2.E, FACT2.F, FACT2.M, FACT2.L

### 1. Frozen observation supplied

> A contractor is about to cut a service opening through an internal partition using a petrol-driven abrasive cut-off saw, which throws sparks. A hot work permit has been issued for the task and is displayed. The inspector could not establish from the permit or from the operatives whether the permit's three stated pre-start conditions had been met: combustible materials within ten metres removed or covered, a trained fire watch posted, and extinguishing media immediately to hand. Stacked plasterboard and a roll of protective fleece are on the floor about six metres away. Separately, the partition is a proprietary composite panel and neither the operatives nor the site file could say what its core material is; some panels of this type have a combustible insulating core. Cutting had not started.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 2–2
- **AC-20-F1** (PLAUSIBLY_LIFE_CRITICAL): whether all three of the permit's pre-start conditions -- combustibles removed or covered, a trained fire watch posted, and extinguishing media immediately to hand -- have been met before cutting starts
  - conjuncts: “combustible materials within ten metres removed or covered”; “a trained fire watch posted”; “extinguishing media immediately to hand”
  - essential qualifiers: ALL THREE -- a fact stated with only one or two conjuncts has lost part of the property, and a clarification that settles one conjunct settles nothing · BEFORE cutting starts
  - acceptable partition: all three conditions are met | one or more of the three conditions is not met
  - affectedDecision: REQUIRED_CONTROL
  - PROHIBITED decision claims: that the hot work is controlled, which meeting the conditions alone does not establish while the panel core is unknown // that a permit being in force means the conditions are met
  - a sufficient clarification must establish: the state of ALL THREE conditions. A clarification answerable by "yes, there is a fire watch" leaves two conjuncts open and is insufficient.
  - unacceptable neighbours: whether a permit has been issued -- the text states it has · whether the operatives are trained to use the saw · whether the plasterboard is combustible in itself
- **AC-20-F2** (PLAUSIBLY_LIFE_CRITICAL): whether the composite partition being cut has a combustible insulating core
  - conjuncts: “the core material of the panel”
  - essential qualifiers: the CORE of the panel being cut, not combustibles in the room -- those are conjunct one of the other fact
  - acceptable partition: the core is non-combustible | the core is combustible or cannot be identified
  - affectedDecision: HAZARD_EXISTENCE (alt: HAZARD_SEVERITY, APPLICABILITY)
  - PROHIBITED decision claims: that the fire watch would control a concealed core fire, which it would not, and which this fact does not establish either way // that the building's construction is compliant, which is not reached
  - a sufficient clarification must establish: the core material of this partition. A clarification satisfied by "the permit covers hot work on partitions" settles nothing.
  - unacceptable neighbours: whether combustibles are nearby -- that is conjunct one of AC-20-F1 · whether the wall is load bearing
- **false-gap trap AC-20-T1:** declaring each of the three permit conditions as its own owed fact — they are conjuncts of one condition for starting the work: none of them alone leaves the work safe to start, and the decision today is a single decision. Splitting them is the RR-1 over-correction and is an axis-H defect.
- **false-gap trap AC-20-T2:** whether the plasterboard six metres away is itself combustible — it is within the ten-metre radius the permit condition already addresses; it is evidence bearing on conjunct one, not a separate open property.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 2, admitted 2, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** Hot work is about to begin with a displayed permit, but the observation establishes that its three pre-start safety conditions could not be confirmed as met, and separately that the panel being cut has an unidentified core that may be combustible — two independent open facts, either of which could change whether cutting should proceed now. Stacked plasterboard and fleece six metres away are a plausible combustible exposure if the ten-metre clearance condition was not actually satisfied. Both gaps are decision-critical because cutting had not yet started, so there is still an opportunity to verify conditions before igniting a spark source.

#### produced declaration 1 — `d1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-20.207-347.1`
- **missingFact:** whether the permit's three pre-start conditions have been met
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “The inspector could not establish from the permit or from the operatives whether the permit's three stated pre-start conditions had been met”
- **whyUnresolved:** 
- **branchA:** All three pre-start conditions (combustibles cleared/covered, fire watch posted, extinguisher to hand) are confirmed met
- **branchB:** One or more of the three pre-start conditions is not met
- **decisionIfA:** Cutting may proceed under the existing permit as authorized
- **decisionIfB:** Cutting must be held until the missing condition (clearance, fire watch, or extinguishing media) is put in place

#### produced declaration 2 — `d2` — ADMITTED as `FP.HAZARD_EXISTENCE.OBS-AC-20.639-776.1`
- **missingFact:** the core material of the composite partition panel and whether it is combustible
- **affectedDecision:** HAZARD_EXISTENCE
- **observationSpan:** “neither the operatives nor the site file could say what its core material is; some panels of this type have a combustible insulating core”
- **whyUnresolved:** 
- **branchA:** The panel core is confirmed non-combustible
- **branchB:** The panel core is combustible or cannot be confirmed non-combustible
- **decisionIfA:** Standard hot work controls for the surrounding area are sufficient and cutting can proceed once those are satisfied
- **decisionIfB:** Cutting should not proceed with the spark-producing method until the core hazard is addressed, e.g. by confirming material or using a non-spark method

#### clarifications the model asked
- `cq1` (REQUIRED_CONTROL, BLOCKING): Have the three permit pre-start conditions (combustibles removed/covered within ten metres, trained fire watch posted, extinguishing media immediately to hand) actually been met before cutting begins?
- `cq2` (HAZARD_EXISTENCE, BLOCKING): What is the core material of the composite partition panel, and is it combustible?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-20.207-347.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: Both first-pass questions reach genuinely decision-critical, distinct facts. The pre-start conditions question directly asks whether combustibles are cleared, fire watch is posted, and extinguishing media is present — answering it either way changes whether cutting proceeds now or is held, and it fully covers the one supplied fact (FP.REQUIRED_CONTROL...1) since it asks about all three conditions together, not a weaker subset. The panel core material question is a separate hazard (combustible core ignition/decomposition risk from cutting into the panel itself) independent of the area fire-watch question, and it too is decision-critical (proceed vs. stop to identify material) since neither operatives nor site file could establish it. No further fact outside those supplied appears necessary: the six-metre plasterboard/fleece detail is already folded into the pre-start-conditions question (that is precisely what the ten-metre clearance condition covers), and no other gap changes today's action. I therefore do not nominate anything new, and I decline to challenge either supplied fact since both are genuinely unresolved and outcome-determinative.
- admission: []

#### verifier verdict for `FP.HAZARD_EXISTENCE.OBS-AC-20.639-776.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: Both first-pass questions correctly reach the two decision-critical facts. The pre-start conditions question (combustibles cleared/covered, fire watch, extinguisher) directly matches the required control for hot work to proceed, and an answer either way changes whether cutting proceeds now versus requiring remediation. The panel core material question, keyed FP.HAZARD_EXISTENCE.OBS-AC-20.639-776.1, is also directly asked verbatim in the first-pass clarification list ('What is the core material of the composite partition panel, and is it combustible?'). This question, if answered, would fully settle the supplied fact: it asks for the core material and whether it is combustible, which are exactly the two things needed to determine whether cutting can proceed with the spark-producing method or must be modified. There is no sub-component of the fact left unaddressed by that question. No further nomination is needed: the observation gives no other fact whose two-way answer would change today's action beyond the two already identified and asked about (pre-start conditions and core material). Magnitude details like the six-metre distance are already governed by the ten-metre clearance condition question, and no other decision-relevant gap appears in the text.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-20.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G2, G3 | present |
| `AC-20.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-20.ROW.H` | H MULTI_GAP_PRESERVATION | Do independent gaps survive INDEPENDENTLY? | G2 | present |
| `AC-20.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-20.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-20.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-20.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-20.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |
| `AC-20.FACT2.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-20.FACT2.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-20.FACT2.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-20.FACT2.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-20.FACT2.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |

---

## AC-21 — G_PRESERVED_BEHAVIOUR — frozen class **SAFETY_SIGNIFICANT**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.E, FACT1.F, FACT1.M, FACT1.R_SAFETY, FACT1.R_FLOOR, FACT1.L

### 1. Frozen observation supplied

> A single compressed gas cylinder, roughly 1.2 metres tall, stands in the corner of the basement plant room, chained to a wall bracket in the upright position. Its valve is closed and no regulator is fitted. The cylinder body is painted a uniform grey with no colour band visible, the neck label is torn away, and no shoulder stamp could be read under the paint. Nobody on site knows what it contains or how long it has been there; it does not appear on the site gas register. The plant room is below ground, has a single door, and is mechanically ventilated at a low rate.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-21-F1** (SAFETY_SIGNIFICANT): what the unidentified cylinder contains, and therefore how severe an uncontrolled release in this below-ground plant room would be
  - conjuncts: “the identity of the cylinder contents”
  - essential qualifiers: in this below-ground, single-door, low-ventilation room -- the setting is part of what makes the severity question decision-critical · contents, not condition -- condition and securement are established
  - acceptable partition: the contents are inert or otherwise low-consequence on release in this room | the contents are asphyxiant, flammable or toxic, so a release in this room would be a significant event
  - affectedDecision: HAZARD_SEVERITY (alt: HAZARD_EXISTENCE, APPLICABILITY)
  - PROHIBITED decision claims: that the cylinder is safe because it is secured and closed -- securement is not identity // that the room's ventilation is adequate or inadequate, which the fact does not reach // that the cylinder must be removed immediately, which the more severe branch does not by itself establish as the right first action
  - a sufficient clarification must establish: what the cylinder contains. A clarification satisfied by "the cylinder is secured" or "the valve is closed" addresses the neighbour, not the property.
  - unacceptable neighbours: whether the cylinder is secured -- the text states it is · whether the valve is closed -- the text states it is · whether the cylinder is within its periodic inspection date -- unknown, but it does not set today's response the way identity does
- **false-gap trap AC-21-T1:** whether the cylinder is properly secured — the text states it is upright and chained. This is the nearby-property substitution the case is built around.
- **false-gap trap AC-21-T2:** whether the plant room ventilation is adequate for a gas store — the room is not a gas store and the ventilation rate is stated. Its adequacy becomes a question only once the contents are known, so it is downstream of the declared fact rather than independent of it.

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The observation describes a compressed gas cylinder with no readable colour band, torn label, and illegible shoulder stamp, whose contents are unknown to site personnel and which is absent from the gas register — a current identification hazard independent of the fact that its valve is closed and it is chained upright. This unknown-contents condition is compounded by the room's below-grade, single-door, low-ventilation-rate configuration, which would limit dispersal and escape routes if the cylinder ever leaked. The critical open question is whether the contents can be positively identified, since that determines whether ordinary handling suffices or specialist hazardous-substance precautions are required before the cylinder is touched or the room is used for other work.

#### produced declaration 1 — `decl-contents` — ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-21.362-429.1`
- **missingFact:** identity/contents of the compressed gas cylinder
- **affectedDecision:** HAZARD_SEVERITY
- **observationSpan:** “Nobody on site knows what it contains or how long it has been there”
- **whyUnresolved:** 
- **branchA:** The cylinder is subsequently identified (via supplier trace, retest stamp recovery, or specialist analysis) as containing an inert or non-hazardous gas
- **branchB:** The cylinder cannot be identified, or is identified as containing a flammable, toxic, or oxidising gas
- **decisionIfA:** Handling can proceed with standard compressed-gas precautions (secure storage, valve protection) without invoking hazardous-substance emergency procedures
- **decisionIfB:** The cylinder must be treated as an unknown hazardous substance requiring exclusion of personnel from close proximity, specialist handling/disposal, and reassessment of the room's ventilation adequacy before further routine work continues

#### clarifications the model asked
- `clar-contents-id` (HAZARD_SEVERITY, BLOCKING): Can the cylinder's contents be positively identified (e.g., by supplier records, cylinder retest marks, or specialist testing) before the cylinder is handled, moved, or disposed of?

#### verifier verdict for `FP.HAZARD_SEVERITY.OBS-AC-21.362-429.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The observation establishes an unidentifiable, unregistered pressurised cylinder in a below-grade, low-ventilation, single-door room. The decision-critical fact is whether the contents can be positively identified: if identified as inert/benign, standard handling suffices; if not identifiable or identified as hazardous, exclusion and specialist handling are required. The first pass already asks exactly this question ("Can the cylinder's contents be positively identified... before the cylinder is handled, moved, or disposed of?"), which reaches the fact keyed FP.HAZARD_SEVERITY.OBS-AC-21.362-429.1 in full: an answer either way (identified-benign vs not-identified-or-hazardous) directly settles which branch applies. No piece of that fact's requirement is left unaddressed by the question as written. The stated uncertainty about valve integrity and duration on site is magnitude/condition detail that does not change the current control (cylinder is chained, upright, valve closed, kept isolated pending identification) — the same precaution (treat as unknown until identified) applies regardless of how long it has sat there or minor valve-condition questions, so no further clarification is needed there. I do not see another fact outside those supplied whose answer would change what is done today: the core action (isolate, do not handle, seek identification) is already driven by the asked question.
- admission: []

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-21.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-21.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-21.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-21.FACT1.E` | E BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | — | present |
| `AC-21.FACT1.F` | F DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | G9 | present |
| `AC-21.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |
| `AC-21.FACT1.R_SAFETY` | R_SAFETY PRIORITY_FLOOR_IMPACT (safety classification half) | How would you classify this fact's safety significance? | G15 | present |
| `AC-21.FACT1.R_FLOOR` | R_FLOOR PRIORITY_FLOOR_IMPACT (floor half) | Does the OTHER floor under-escalate this fact? | G15 | present |
| `AC-21.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |

---

## AC-22 — H_GOVERNED_EVIDENCE — frozen class **PLAUSIBLY_LIFE_CRITICAL**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.L, FACT1.N, FACT1.S, FACT1.T, FACT1.M

### 1. Frozen observation supplied

> A technician is inside the guarded area of a rotary filler clearing a bottle jam. The machine has three energy sources: a main electrical supply, a compressed air supply with its own isolation valve, and a hydraulic accumulator on the lift table. The electrical isolator is locked off. The air valve is closed but not locked, and the technician said the accumulator "holds pressure but there is nothing to do about it". The site's written energy control procedure for this machine was produced; it is a single page covering electrical isolation only, and it does not mention the air supply or the accumulator. Work was in progress inside the guard during the visit.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-22-F1** (PLAUSIBLY_LIFE_CRITICAL): whether the stored energy in the compressed air system and in the hydraulic accumulator has been released or restrained before the technician entered the guarded area
  - conjuncts: “the compressed air energy is released or the valve secured”; “the accumulator pressure is released or the load restrained”
  - essential qualifiers: stored and residual energy, not the electrical supply -- the electrical isolation is established · before entry, which is the sequence that matters
  - acceptable partition: the stored energy has been released or restrained | the stored energy has not been released or restrained
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE)
  - PROHIBITED decision claims: that the machine is isolated, which the electrical isolation alone does not establish // that the site is in breach of a regulation -- no supplied record establishes what was done, and citation authority is not the model's // that correcting the written procedure would make the work safe today
  - a sufficient clarification must establish: what was actually done about the air and the accumulator before entry. A clarification satisfied by "the machine is locked off" addresses the electrical source only.
  - unacceptable neighbours: whether the electrical supply is isolated -- the text states it is · whether a written procedure exists -- the text states one does · whether the technician is authorised
- **false-gap trap AC-22-T1:** whether the written energy control procedure is adequate, as a separate owed fact — the text states what the procedure covers and what it omits, so its inadequacy is ESTABLISHED, not open. Declaring it is a precision failure of the "already answered by the text" kind.
- **false-gap trap AC-22-T2:** whether PPE is being worn, prompted by the supplied GOV-PPE-02 record — THE GOVERNED-INPUT TRAP: a supplied record must not manufacture an owed fact. Nothing in the observation raises PPE, and naming GOV-PPE-02 on any declaration is an axis-S and axis-N failure.
- **governed:** supplied GOV-ECP-01, GOV-PPE-02; bearing = GOV-ECP-01
  - requires restraint: whether the stored energy at THIS machine was in fact released or restrained -- no supplied record can answer that, and the correct posture is to declare the fact and ask // whether the site is in breach of any particular provision -- a conclusion the model has no authority to reach and no supplied evidence to support

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 1, admitted 1, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** While the electrical source is locked off, the technician is working inside the guarded area with two other energy sources not fully controlled: the compressed air valve is closed but not locked, and the hydraulic accumulator remains pressurized with no method currently applied to relieve it. Both gaps trace to a written energy control procedure that covers only electrical isolation and never addresses the air supply or accumulator, so the multi-energy machine is missing documented control for two of its three sources. The open question is whether a means to bleed down or block the accumulator's stored pressure exists at all, since that determines whether the fix is procedural (do it now) or requires an engineering change before work can safely continue.

#### produced declaration 1 — `UF-1` — ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-22.367-417.1`
- **missingFact:** Whether a physical means exists to bleed down or block the hydraulic accumulator's stored pressure
- **affectedDecision:** REQUIRED_CONTROL
- **observationSpan:** “holds pressure but there is nothing to do about it”
- **whyUnresolved:** 
- **branchA:** A bleed-down or blocking method exists on this machine but is not being used
- **branchB:** No such method exists on this machine design
- **decisionIfA:** Stop work under the guard until the existing method is applied to bring the accumulator to zero energy, then resume
- **decisionIfB:** Work cannot be made safe procedurally; an engineering control (adding a bleed valve or mechanical block) is required before work under the guard can continue

#### clarifications the model asked
- `CQ-1` (REQUIRED_CONTROL, BLOCKING): Can the hydraulic accumulator's stored pressure be bled down, blocked, or otherwise brought to a zero-energy state before work continues, or is there truly no engineering means to relieve it on this machine?

#### verifier verdict for `FP.REQUIRED_CONTROL.OBS-AC-22.367-417.1`
- verdict: **VERIFIED_AS_IS**
- bindingFactKey: -
- rationale: The technician's statement that the accumulator "holds pressure but there is nothing to do about it" does not establish whether this is because no dissipation method exists on the machine or because an existing method simply hasn't been applied. These two states lead to materially different corrective actions: one is a procedural fix executable now (bleed down/block using existing means, then resume work), the other requires an engineering change (adding a bleed valve or block) before work can safely continue. The first-pass analysis already asked exactly this question, and the question as written would resolve the fact: it asks whether the pressure "can be bled down, blocked, or otherwise brought to a zero-energy state ... or is there truly no engineering means to relieve it on this machine," which covers both branches (existing-but-unused method vs. no method at all). This directly reaches the owed fact. The other two hazard candidates (unlocked air valve, incomplete written procedure) are not the subject of any unresolved fact supplied to me, so they don't require further clarification review here. I see no additional fact, outside those supplied, whose answer would change what is done today: the air valve gap and procedural gap are already clearly established as needing correction (lock the valve, rewrite the procedure), with no branching contingency left open in the observation.
- admission: []

#### governed stage
- supplied ids: GOV-ECP-01, GOV-PPE-02
- minted references: [{"ref":"F1","factKey":"FP.REQUIRED_CONTROL.OBS-AC-22.367-417.1"}]
- returned top-level keys: bindings
- bindings: [
 {
  "factRef": "F1",
  "determination": "BINDS",
  "governedEvidenceSourceIds": [
   "GOV-ECP-01"
  ],
  "bearingStatement": "This record describes the requirement that stored or residual energy be dissipated or restrained by methods such as blocking or bleeding down, which bears on whether such a method exists on the machine."
 }
]

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-22.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-22.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-22.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | present |
| `AC-22.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | present |
| `AC-22.FACT1.N` | N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY | Was reliance on a supplied governed record legitimate, and any quotation faithful? | G12, G14 | present |
| `AC-22.FACT1.S` | S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) | Was naming — or not naming — a governed sourceId appropriate for this fact? | G14 | present |
| `AC-22.FACT1.T` | T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING | PRECONDITION FIRST: did the provider-visible treatment contain governed evidence sufficient to judge grounding at all? | G14 | present |
| `AC-22.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | present |

---

## AC-23 — H_GOVERNED_EVIDENCE — frozen class **SAFETY_SIGNIFICANT**

**Slots on this case:** ROW.A, ROW.B, FACT1.C, FACT1.L, FACT1.N, FACT1.S, FACT1.T, FACT1.M

### 1. Frozen observation supplied

> A portable single-section ladder is leaning against the mezzanine edge beside a gated opening and is being used for access between the mezzanine and the floor below. The ladder is not tied at the top, is not footed by a second person, and the stiles project about 300 mm above the landing. The floor at the base is smooth sealed concrete and was damp from a recent cleaning pass; the ladder feet are rubber and are worn smooth on one side. Two operatives used the ladder while the inspector watched, carrying scan guns in one hand. A fixed staircase to the mezzanine exists at the far end of the building, about sixty metres away.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 1–1
- **AC-23-F1** (SAFETY_SIGNIFICANT): whether anything prevents this untied, unfooted ladder from slipping at the base given the damp smooth floor and the worn feet
  - conjuncts: “slip at the base is prevented in the present position and floor condition”
  - essential qualifiers: in the present position and floor condition -- the damp smooth concrete and the worn feet are why the question is open
  - acceptable partition: something prevents slip at the base (for example an effective stability device or a surface that grips in this condition) | nothing prevents slip at the base
  - affectedDecision: REQUIRED_CONTROL (alt: HAZARD_EXISTENCE, EXPOSURE)
  - PROHIBITED decision claims: that ladder use on site is or is not permitted -- this access is what is in question // that a regulation requires or prohibits anything -- no supplied record establishes that and the model holds no citation authority // that the staircase must be used, which is one remedy and not the finding
  - a sufficient clarification must establish: what, if anything, prevents the base slipping in this position and floor condition.
  - unacceptable neighbours: whether the ladder is tied -- the text states it is not · whether the stiles extend above the landing -- the text states they do · whether a staircase exists -- the text states one does
- **false-gap trap AC-23-T1:** whether the floor should have been left damp — the supplied housekeeping record makes this attractive, which is the point. The floor condition is established; it is an input to the declared fact, not a separate open property, and declaring it because a record was supplied is the governed-input manufacturing failure.
- **governed:** supplied GOV-HOUSE-07; bearing = NONE
  - requires restraint: the model must NOT reach for the ladder-specific provision it may associate with this situation. That provision is not supplied, and naming or paraphrasing it as authority is the containment failure this case exists to measure // where no supplied record bears on the fact, the correct governed posture is to name no id

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 0, admitted 0, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The observation describes an actively-used leaning ladder for mezzanine access that lacks top securement or a second person footing it, sits on a damp, smooth surface with worn ladder feet, and terminates beside a gated opening at height where operatives climb one-handed with scan guns. These are current, stated conditions rather than historical or hypothetical ones, so all four candidates are raised as active hazards. The unsecured ladder combined with the low-friction base and the one-handed climbing each compound the risk of a base slide-out or loss of balance leading to a fall, and a fixed staircase existing elsewhere does not resolve the current exposure at this access point.

**The model declared NO unresolved facts on this case.**

#### governed stage
- NOT CALLED — the first pass admitted no owed fact on this case, so there is no candidate fact to nominate a governed binding for. This is NOT a provider failure and NOT a degenerate output; on AC-24 zero declarations is the frozen correct answer.

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-23.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G1, G3 | present |
| `AC-23.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-23.FACT1.C` | C OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | — | NO OPPORTUNITY — see worksheet |
| `AC-23.FACT1.L` | L VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | G6 | NO OPPORTUNITY — see worksheet |
| `AC-23.FACT1.N` | N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY | Was reliance on a supplied governed record legitimate, and any quotation faithful? | G12, G14 | NO OPPORTUNITY — see worksheet |
| `AC-23.FACT1.S` | S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) | Was naming — or not naming — a governed sourceId appropriate for this fact? | G14 | NO OPPORTUNITY — see worksheet |
| `AC-23.FACT1.T` | T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING | PRECONDITION FIRST: did the provider-visible treatment contain governed evidence sufficient to judge grounding at all? | G14 | NO OPPORTUNITY — see worksheet |
| `AC-23.FACT1.M` | M CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | G7 | NO OPPORTUNITY — see worksheet |

---

## AC-24 — H_GOVERNED_EVIDENCE — frozen class **ORDINARY_NON_ESCALATING**

**Slots on this case:** ROW.A, ROW.B, ROW.I

### 1. Frozen observation supplied

> A fixed guard encloses the drive belt and pulleys between the motor and the spindle of a bench-mounted pillar drill. The guard is a one-piece pressed steel cover secured by four socket screws, all four of which are present and tight; the inspector checked each with a key. The guard cannot be removed or displaced without the key, and with the guard in place no part of the belt or pulleys can be reached, which the inspector verified by hand at every edge and opening. The machine was run during the visit and the guard remained in position and silent. The guard is not interlocked, and it does not need to be for a fixed enclosing guard of this type on this machine.

### 2. Frozen truth (authored and hashed before this run)

- **expected owed facts:** 0–0
- **false-gap trap AC-24-T1:** declaring something about transmission guarding because a transmission-guarding record was supplied — THE CENTRAL TRAP OF THE CASE. The presence of an on-point governed record is not evidence that anything is unresolved. The observation closes the property directly. A declaration here is INCORRECT on axes B and I and would show that governed input itself inflates output.
- **false-gap trap AC-24-T2:** whether the guard should be interlocked — the text states it does not need to be for this guard type on this machine.
- **governed:** supplied GOV-GUARD-03; bearing = NONE
  - requires restraint: the correct output is zero declarations. Supplying a governed record is not a prompt to find something

### 3. What the run actually produced

- provider outcome: `NO_FAILURE`, stop reason `tool_use`, declarations 0, admitted 0, refused 0, RR-7 preserved 0, safetyStateComplete true, totalLossOnThisRow false

**Model summary.** The observation describes a fixed enclosing guard on the drive belt and pulleys that was physically verified as secure (all four fasteners present and tight, checked with a key), effective (no access to the belt or pulleys at any edge or opening, verified by hand), and stable under running conditions (remained in position and silent during operation). No interlock is required for this type of fixed guard on this machine, and none of the facts given suggest a gap, failure, or residual exposure. There is no basis in the text to raise an additional machine-guarding hazard or ask a decision-critical question, since every property relevant to guard adequacy (securement, coverage, and performance under operation) is affirmatively established.

**The model declared NO unresolved facts on this case.**

#### governed stage
- NOT CALLED — the first pass admitted no owed fact on this case, so there is no candidate fact to nominate a governed binding for. This is NOT a provider failure and NOT a degenerate output; on AC-24 zero declarations is the frozen correct answer.

### 4. Slots to judge on this case

| slot | axis | question | gates | opportunity |
|---|---|---|---|---|
| `AC-24.ROW.A` | A FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | G3 | present |
| `AC-24.ROW.B` | B FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | G3, G4 | present |
| `AC-24.ROW.I` | I FALSE_GAP_SUPPRESSION | On a row whose text is sufficient, was an unnecessary owed fact avoided? | G4 | present |


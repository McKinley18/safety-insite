# §187B — Strict semantic review packet

**Fifteen behavioral executions. NOTHING BELOW IS ADJUDICATED.** Every strict semantic axis stands at
`PENDING_HUMAN_ADJUDICATION`. This model did not supply a verdict on any of the ten axes and must not.

`AI_ASSISTED_STRICT_ADJUDICATION = TRUE` and `FULLY_INDEPENDENT_HUMAN_ADJUDICATION = FALSE` apply if
GPT-5.6 Sol assists the product owner.

Mechanical context, stated once so it is not re-derived per row: **zero of the fifteen executions
emitted a `proposedClarification`.** Verdicts were 12 × `VERIFIED_AS_IS` and 3 × `NO_CLARIFICATION_REQUIRED`
(all three HR-04). Two executions were contract-refused for output shape and are marked below.

---

## HR-01

**Supplied owed fact** `owed:fire:burner_flame_failure_safeguard_function_verified`

> Whether the burner's flame-failure safeguard has been verified to shut off fuel on loss of flame.

**whyUnresolved supplied to the provider:** the observation does not state whether the burner's flame-failure safeguard was function-tested

**evidenceSpan supplied:** *“it lists a nozzle change and filter clean but does not record whether the burner was flame-tested”*

**First-pass stimulus (frozen, identical across all three replicates):** asked — “Was the flame-failure device / burner flame-tested during Monday's service, even though it is not recorded on the certificate?”

### HR-01 replicate 1

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:fire:burner_flame_failure_safeguard_function_verified`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states that the service certificate does not record whether the flame-failure device was flame-tested, and the device cannot be seen from the walkway, meaning its function cannot be confirmed either way. This is a case of an unobservable control: the certificate's silence is equally consistent with the test having been done but not logged, or not having been done at all. Whether the burner was actually flame-tested determines whether the dryer can continue operating as-is or must be shut down pending verification -- a genuine REQUIRED_CONTROL decision. The first-pass analysis already asked exactly this question: 'Was the flame-failure device / burner flame-tested during Monday's service, even though it is not recorded on the certificate?' This question directly reaches the fact identified as owed:fire:burner_flame_failure_safeguard_function_verified. No other fact in the observation (e.g., dust on handrails) rises to the level of a safety-critical, action-changing unresolved fact -- dust accumulation is a housekeeping matter with no stated threshold or hazard mechanism triggering a differential action. I find no additional fact that should be nominated: the observation's other details (nozzle change, filter clean) do not bear on a distinct decision. The question already asked is well-targeted and sufficient.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-01 replicate 2

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:fire:burner_flame_failure_safeguard_function_verified`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the flame-failure device cannot be seen from the walkway and the service certificate is silent on whether a flame test was performed. This is a case of "a control that cannot be seen is not a control that was checked" — the certificate's silence is consistent with the safeguard having been verified (but simply not documented) and with it never having been tested at all, and these two states lead to different actions today (continue running vs. shut down until verified). This is exactly the fact captured by owed:fire:burner_flame_failure_safeguard_function_verified, and the first-pass analysis already asks precisely this question: whether the flame-failure device was flame-tested during Monday's service, even though not recorded. The question as written would settle this fact if answered by the engineer or a supervisor on site. No other unresolved fact in the observation (e.g., dust on handrails, nozzle change, filter clean) appears to govern a life-critical or required-control decision independent of this one. Dust on handrails is a housekeeping/magnitude detail with no stated threshold or control contingent on it, so it does not need a clarification. No additional nomination is warranted.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-01 replicate 3

- verdict: `VERIFIED_AS_IS`
- declarations: `BOUND_BY_CLARIFICATION` on key `owed:fire:burner_flame_failure_safeguard_function_verified`
- bindingFactKey: `owed:fire:burner_flame_failure_safeguard_function_verified`  ·  proposedClarification: `none`
- contract admission (corrected): **REFUSED — BINDING_DECLARED_BY_A_NON_ADD_VERDICT, SOURCE_MODE_PRESENT_WITHOUT_A_CLARIFICATION, BINDING_KEY_PRESENT_WITHOUT_A_CLARIFICATION, BOUND_DECLARATION_WITHOUT_A_CLARIFICATION**

**Rationale, verbatim:**

> The certificate documents a nozzle change and filter clean but is silent on whether the flame-failure device was function-tested, and the device cannot be visually verified from the walkway. This is exactly the 'control that cannot be seen is not a control that was checked' scenario: the observation is equally consistent with the safeguard working and with it having failed, and the two branches (verified vs not verified) lead to genuinely different actions today (continue operating vs shut down until verified). The first-pass analysis already asked the question that reaches this exact fact: whether the flame-failure device was flame-tested during Monday's service despite not being recorded. That question, if answered, directly resolves owed:fire:burner_flame_failure_safeguard_function_verified. No other unresolved fact in the observation appears to govern a different safety/regulatory/control decision at this workplace today - the dust on handrails is a housekeeping matter not tied to a stated threshold or life-critical control, so no additional nomination is warranted.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

## HR-04

**Supplied owed fact** `owed:guarding:fixed_guard_fastenings_currently_secure`

> Whether the fixed guard over the head drum nip point is currently secured sufficiently for safe operation.

**whyUnresolved supplied to the provider:** the observation does not state the current securement of the guard fastenings

**evidenceSpan supplied:** *“the fastenings were last torque-checked at the annual service”*

**First-pass stimulus (frozen, identical across all three replicates):** **asked nothing**

### HR-04 replicate 1

- verdict: `NO_CLARIFICATION_REQUIRED`
- declarations: `STILL_UNRESOLVED` on key `owed:guarding:fixed_guard_fastenings_currently_secure`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the guard is in position, was covered at this morning's pre-start check, and no tools rest on it. The only unresolved detail is the exact current torque state of fastenings, last verified at the annual service rather than this morning. This is a magnitude/detail-with-control-in-place situation: a fixed guard whose presence and general fitness are checked daily (per the pre-start sheet) is a normal, ongoing maintenance regime, not an observed defect or an obstructed/unverifiable control. There is no stated indication of looseness, damage, or any anomaly suggesting the guard is currently insecure. Absent any such indication, treating the annual torque-check interval as inherently doubt-raising would turn a routine, industry-standard maintenance cadence into a mandatory stop-work trigger on every observation of this type, which is not proportionate. The two branches (secure vs. not) do not arise from anything in the observation suggesting live doubt — this differs from the failure-mode example of an obstructed sightline or a job nobody watched, because here the guard is visibly in position and covered by an active daily check regimen, so the record actively supports (rather than merely being silent on) current adequacy. Answering this hypothetical would not change what is done today: the guard is in place, inspected, and unremarkable; stopping the conveyor absent an observed defect is not what the observation supports. No additional fact outside those supplied appears necessary to any decision here either.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-04 replicate 2

- verdict: `NO_CLARIFICATION_REQUIRED`
- declarations: `STILL_UNRESOLVED` on key `owed:guarding:fixed_guard_fastenings_currently_secure`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the fixed guard over the head drum nip point is in position, that no tools rest on it, and that a pre-start check was completed this morning by the fitter (covering tracking and lubrication) with fastenings torque-checked at the annual service. This is a routine, low-consequence maintenance interval fact typical of guarding programs: annual torque-check plus daily visual pre-start inspection is a standard, adequate control regime for fixed guards, and nothing in the observation suggests the guard is loose, displaced, or damaged. The absence of a stated daily torque-check does not mean the guard's current securement is actually in doubt - the guard is observed in position and undisturbed (no tools resting on it, no reported vibration/looseness). Treating "last torque-checked at annual service" as grounds to stop the conveyor pending re-confirmation would be requiring evidence beyond what any normal fixed-guard maintenance program provides, and would apply the same demand to virtually every fixed guard in every workplace absent daily re-torque logs. There is no stated indicator (visible gap, movement, unusual noise, prior incident) that would make this into a live safety concern requiring immediate cessation of work rather than routine ongoing maintenance schedule. Both hypothetical answers to the fact do not correspond to differently-supported real-world states given what's actually observed (guard in place, undisturbed, inspected today) - the engine and first pass correctly raised no hazard candidate. Asking would be requesting more precise assurance rather than resolving a genuine fork in required action. I therefore find no clarification is required, though I record the fact as still unresolved per instructions since I am not entitled to mark it answered.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-04 replicate 3

- verdict: `NO_CLARIFICATION_REQUIRED`
- declarations: `CHALLENGE_FACT_VALIDITY` on key `owed:guarding:fixed_guard_fastenings_currently_secure`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the fixed guard over the head drum nip point is in position, and no tools rest on it. The fastening's last torque-check being at the annual service is a normal maintenance interval detail, not a red flag suggesting the guard is currently loose or displaced. There is no stated indicator (e.g., visible gap, missing fasteners, guard ajar, reported looseness) that would put the current securement genuinely in doubt. Absent any such indicator, this is a magnitude/interval question dressed as a binary fact: the guard is observed in position, which is the operative fact for whether the guard is performing its function today. Torque-check timing does not by itself establish or negate current secureness in a way that changes today's action -- routine visual confirmation that a fixed guard is in position is the ordinary basis on which conveyors are operated, and demanding proof of fastener torque state at every shift would convert a routine maintenance record into a stop-work trigger without any observed anomaly supporting that. There is also no unseen/uninspected control here analogous to the "control that cannot be seen" pattern -- the guard is directly observed present and in position, which is different from an alarm that didn't sound or a completed job nobody watched. Therefore answering "is the guard currently secure" does not change what is done today: the conveyor continues to operate under the routine pre-start check regime already described. This does not rise to a decision-changing unresolved fact requiring immediate clarification; it would be an appropriate item for the next scheduled maintenance/torque check rather than a stop-work clarification.  No other unresolved fact outside the supplied one appears to govern a live decision here: the observation describes routine, unremarkable conditions (guard in place, pre-start check completed, no tools on guard), and the deterministic engine emitted no hazard candidates. I therefore do not nominate an additional fact.

**Challenge reason, verbatim:**

> The observation states the guard is in position and no tools rest on it; this is a direct, visible confirmation the guard is performing its function. The fastenings' torque-check timing is a routine maintenance record detail, not an indicator of current insecurity. Answering the current-securement question either way would not change today's action absent any observed anomaly (gap, looseness, displacement) -- the routine pre-start check and observed guard-in-position already form the basis on which the conveyor is operated today. This is a magnitude/interval-type concern rather than a decision-changing binary fact.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED · CHALLENGE_CORRECTNESS · CHALLENGE_EVIDENCE_RELEVANCE · CHALLENGE_TARGET_RELEVANCE · CHALLENGE_REVIEWABILITY

**VERDICT:** ______

---

## HR-06

**Supplied owed fact** `owed:guarding:rotor_guard_interlock_protective_function_verified`

> Whether the rotor guard door interlock's protective function was verified after the tooth change and before the debarker was returned to service.

**whyUnresolved supplied to the provider:** the observation does not state the interlock's protective behaviour after the tooth change

**evidenceSpan supplied:** *“it recorded the tooth change but carries no interlock test result”*

**First-pass stimulus (frozen, identical across all three replicates):** asked — “Was the rotor guard interlock switch functionally tested (not just visually confirmed in place) after the tooth change and before this restart?”

### HR-06 replicate 1

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:guarding:rotor_guard_interlock_protective_function_verified`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> After maintenance work (tooth change) requiring guard removal, the return-to-service log confirms the tooth change but is silent on interlock testing. This is exactly the case where a control's presence cannot be visually confirmed to still be functional after disturbance - the guard door is closed and the switch is 'in place' physically, but whether it was functionally tested post-maintenance (the actual safety-critical fact after any guard-removal maintenance) is unresolved. The first-pass question directly asks this: whether the interlock was functionally tested (not just visually confirmed) after the tooth change and before restart. This is precisely the fact that matters - if tested and working, no action needed; if untested, the debarker must stop pending verification since an interlock disturbed during maintenance could have been miswired or disabled. The question as written reaches this exact fact and would settle it either way. No additional fact appears necessary: the observation gives no other unresolved contingency that would change today's action - the sawyer's practice of not reaching into the throat is stated and settled, the guard door is stated closed. There is no other missing fact whose two answers diverge in required action.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-06 replicate 2

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:guarding:rotor_guard_interlock_protective_function_verified`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the return-to-service log recorded the tooth change but carried no interlock test result — this leaves open whether the interlock's protective function (not just its physical presence) was verified after maintenance disturbed the guard system. Maintenance work on the rotor (tooth change) is exactly the kind of intervention that can leave an interlock miswired or defeated while still appearing 'in place.' If verified, no further action is needed; if not verified, the machine should be stopped/tested before continued reliance on the guard. This is decision-critical and was already asked by the first pass in a question that directly targets this exact fact (functional test of interlock after tooth change, before restart). No additional or replacement clarification is needed. I do not find a second, unsupplied fact that would independently change the decision — the observation gives no other ambiguous condition bearing on hazard existence, exposure, or applicability.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-06 replicate 3

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:guarding:rotor_guard_interlock_protective_function_verified`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the return-to-service log recorded the tooth change but carries no interlock test result — a maintenance intervention (tooth change requiring rotor guard removal) followed by restart with no documented functional test of the interlock. This is exactly the case of a control that cannot be verified from the record: it is equally consistent with the interlock having been left correctly functional or with it having been disturbed/miswired during the tooth change and never re-verified. Whether the interlock's protective function was actually verified determines whether the machine may continue running as-is or must be stopped pending a functional test — a clear REQUIRED_CONTROL fork. The first-pass analysis already asked exactly this question, in terms that would settle the fact: whether the interlock was functionally tested (not just visually confirmed) after the tooth change and before restart. This question reaches the same fact keyed here. No second, unraised fact is evident that would independently govern a different decision here; the observation is otherwise fully specified (guard closed, interlock in place, sawyer not reaching into throat), so no additional nomination is warranted.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

## HR-08

**Supplied owed fact** `owed:energy:auger_drive_isolation_verified_before_work`

> Whether the discharge auger drive has been isolated and proved dead before the operative works at the blockage.

**whyUnresolved supplied to the provider:** the observation does not state whether the auger drive's own local isolator was locked and proved dead

**evidenceSpan supplied:** *“the auger drive has its own local isolator and the lockout log shows no entry against it”*

**First-pass stimulus (frozen, identical across all three replicates):** asked — “Has the auger drive's own local isolator been locked out (or otherwise verified de-energized) separately from the main dryer panel lockout?”

### HR-08 replicate 1

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:energy:auger_drive_isolation_verified_before_work`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the operative locked/proved dead only the main dryer panel while the auger drive has its own separate local isolator, and the lockout log shows no entry against that isolator — this leaves genuinely unresolved whether the auger drive itself (the actual point of hazardous mechanical energy at the discharge auger the operative is clearing) has been isolated. This is a classic multiple-source-of-energy lockout gap: locking the main panel does not necessarily de-energize a separately isolated local drive. Answering the fact one way (auger isolator locked/proved dead) means work may continue as-is; answering it the other way (not locked out) means work must stop until it is isolated — this is decision-critical, not a magnitude or already-controlled detail. The first-pass analysis asked exactly this question: 'Has the auger drive's own local isolator been locked out (or otherwise verified de-energized) separately from the main dryer panel lockout?' This directly reaches and would resolve the supplied unresolved fact owed:energy:auger_drive_isolation_verified_before_work. No other unresolved fact outside the supplied one appears necessary to a present decision — the key hanging at the panel and log absence are consistent with the same single gap already captured. No additional nomination is warranted.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-08 replicate 2

- verdict: `VERIFIED_AS_IS`
- declarations: `BOUND_BY_CLARIFICATION` on key `owed:energy:auger_drive_isolation_verified_before_work`
- bindingFactKey: `owed:energy:auger_drive_isolation_verified_before_work`  ·  proposedClarification: `none`
- contract admission (corrected): **REFUSED — BINDING_DECLARED_BY_A_NON_ADD_VERDICT, SOURCE_MODE_PRESENT_WITHOUT_A_CLARIFICATION, BINDING_KEY_PRESENT_WITHOUT_A_CLARIFICATION, BOUND_DECLARATION_WITHOUT_A_CLARIFICATION**

**Rationale, verbatim:**

> The observation states the auger drive has its own local isolator and the lockout log shows no entry against it, meaning the auger drive was never locked out or proved dead separately from the main dryer panel. Since drying fans continue to run and only the main panel was locked/tagged/tested by the operative, whether the auger's independent energy source is isolated is a genuine, decision-critical gap: this is a hazardous-energy control-verification question, not a magnitude question, and no stated control (e.g., a second lock or a tag on the auger isolator) resolves it either way. The first-pass clarification asks exactly this question -- whether the auger drive's own local isolator has been locked out or otherwise verified de-energized separately from the main panel lockout -- which directly targets the same fact identified as owed:energy:auger_drive_isolation_verified_before_work. An answer to that question would settle the supplied fact one way or the other. No other unraised fact appears necessary to determine a safety/regulatory/control decision here; the scenario is a single, clean lockout/tagout completeness question already captured.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-08 replicate 3

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:energy:auger_drive_isolation_verified_before_work`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the operative locked and proved dead the main dryer panel but that the auger drive's own local isolator has no lockout log entry against it - a hazard fully consistent with the auger drive being energized while the operative clears a jam directly on the discharge auger. Whether this local isolator was actually locked/proved dead is genuinely unresolved from the text (an absence of a log entry could mean 'not locked' or could mean simply an unlogged but performed action - either way it is not established), and the two possible answers lead to different actions today: continue work vs. stop work until isolated. This is a real decision-critical unresolved fact. The first-pass analysis already asked exactly this question, in a form answerable by someone at the workplace: 'Has the auger drive's own local isolator been locked out (or otherwise verified de-energized) separately from the main dryer panel lockout?' This directly targets the supplied fact owed:energy:auger_drive_isolation_verified_before_work. No other unaddressed decision-critical fact is apparent from the observation - the isolation point, the panel, and the key location are all otherwise described. No nomination is warranted.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

## HR-09

**Supplied owed fact** `owed:energy:stored_hydraulic_energy_dissipated_before_line_break`

> Whether the stored hydraulic energy in the accumulator has been dissipated and confirmed at zero before the hose is broken.

**whyUnresolved supplied to the provider:** the observation does not state the accumulator's current pressure

**evidenceSpan supplied:** *“the accumulator gauge sits behind the tank shroud unread since”*

**First-pass stimulus (frozen, identical across all three replicates):** asked — “Has the accumulator pressure been confirmed at zero (or a safe residual level) by reading the gauge, rather than merely cycling the dump valve without checking the result?”

### HR-09 replicate 1

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:energy:stored_hydraulic_energy_dissipated_before_line_break`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the dump valve was cycled and left open but the accumulator gauge, which would confirm zero/residual pressure, sits behind the shroud unread. This leaves genuinely unresolved whether stored hydraulic energy has actually been dissipated before the hose is broken — cycling a valve is not proof of a dissipated state, since the valve could be blocked, malfunctioning, or the accumulator could still hold residual pressure not vented through that path. The two branches (energy confirmed dissipated vs not) lead to different actions today: proceed with breaking the hose, or stop and verify zero energy first. This is exactly the fact the first-pass question asks about: it directly requests confirmation of zero/safe residual pressure by reading the gauge rather than relying on the unverified valve cycle. The question as written reaches and would settle the supplied fact. No additional unresolved fact outside the supplied one appears to govern a different decision here — the guard is stated refitted, isolation is stated locked and witnessed, so those are established. Therefore the clarification set is correct as-is.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-09 replicate 2

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:energy:stored_hydraulic_energy_dissipated_before_line_break`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the dump valve was cycled and left open but the accumulator gauge sits behind the shroud unread since, meaning stored hydraulic energy has never been confirmed at zero. Cycling a dump valve without verifying the pressure actually bled off is not equivalent to confirming zero energy - the valve could be blocked, the accumulator could have a check valve fault, or residual pressure could remain. This is a classic 'control that cannot be seen is not a control that was checked' situation: an unread gauge is consistent with both a fully dissipated accumulator and a still-pressurized one, and breaking a hydraulic line under residual pressure is a serious injury hazard (whipping hose, fluid injection). The first-pass analysis already asked exactly this question, targeting whether the gauge has been read to confirm zero/safe residual pressure rather than relying on the dump valve cycle alone. This question reaches the fact in owed:energy:stored_hydraulic_energy_dissipated_before_line_break directly and would settle it either way. No other unresolved fact not already supplied appears to govern a different decision here - the isolation (lockout, witnessed pump stop, guard refitted) is otherwise well documented and adequate. No additional nomination is needed.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

### HR-09 replicate 3

- verdict: `VERIFIED_AS_IS`
- declarations: `STILL_UNRESOLVED` on key `owed:energy:stored_hydraulic_energy_dissipated_before_line_break`
- bindingFactKey: `null`  ·  proposedClarification: `none`
- contract admission (corrected): **ADMITTED**

**Rationale, verbatim:**

> The observation states the fitter cycled the manual dump valve but the accumulator gauge sits unread behind the shroud, meaning stored hydraulic energy has not been confirmed dissipated. This is exactly the kind of unverified control (cycling a valve is not the same as confirming zero pressure via the gauge) that must be resolved before breaking a hydraulic line - a residual-pressure release during hose disconnection is a serious injury hazard. Answering it one way (confirmed zero) means work may proceed; the other way (not confirmed) means the hose must not be broken yet - a genuine decision-changing fork. The first-pass clarification directly asks whether the accumulator pressure has been confirmed at zero by reading the gauge rather than merely cycling the valve, which is precisely the fact in question. This question fully reaches and resolves the single supplied unresolved fact. No other unaddressed fact appears necessary: the isolator lockout, witnessed pump stop, and ram guard refit are all stated as in place, and no other stored-energy or hazard pathway is left open by the text. Therefore the first pass asked the right question and no replacement or additional nomination is needed.

**Adjudicate:** OWED_FACT_PRESERVED · FACTKEY_BINDING_CORRECT · CLARIFICATION_TARGET_CORRECT ·
CLARIFICATION_EVIDENCE_SUFFICIENT · NO_NEARBY_PROPERTY_SUBSTITUTION · ADJACENT_FACT_CONTAINED

**VERDICT:** ______

---

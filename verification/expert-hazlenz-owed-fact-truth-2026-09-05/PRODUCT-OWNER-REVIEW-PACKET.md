# §184 — PRODUCT-OWNER REVIEW PACKET: OWED-FACT TRUTH

**RECORDED 2026-09-05 — product-owner adjudication complete.** All ten rows were returned `EDIT`. The product owner edited `targetDecision`, `decisionIfEstablished` and `decisionIfNotEstablished` across all five pairs and approved every other substantive field as written. The text below is the recorded final text, not a candidate.

Truth class `PRODUCT_OWNER_REVIEWED_DEVELOPMENT_OWED_FACT_TRUTH`. Provenance `AI_ASSISTED_OWED_FACT_AUTHORING = TRUE`, `PRODUCT_OWNER_REVIEWED = TRUE`, `FULLY_INDEPENDENT_HUMAN_AUTHORING = FALSE`. This truth must never be described as independent human truth, AI-free authoring, validated safety truth, production truth or formal acceptance truth.

Zero provider calls. Zero database operations. No source, prompt, schema, governed record or frozen row text was modified.

---

## Why the wording came out neutral, and how to check that it did

The instrument is **five matched pairs**, and both members of a pair turn on the **same owed fact** — one observation establishes it, the other leaves it open.

That structure does the work §183 was worried about. A `factStatement` that leaned toward "unresolved" would read as obviously wrong for the settled member of its own pair. **HR-04 and HR-10 share one sentence**, so the sentence cannot contain the HR-04 adjudication.

**The single most useful check you can make:** read each pair's `factStatement` twice, once against each member. If it fits one and strains against the other, reject it.

| pair | owed fact | settled by | unresolved in |
|---|---|---|---|
| PAIR-1 | Whether the rotor guard door interlock's protective function was verified after the tooth change and before the debarker was returned to service. | **HR-02** | **HR-06** |
| PAIR-2 | Whether the fixed guard over the head drum nip point is currently secured sufficiently for safe operation. | **HR-10** | **HR-04** |
| PAIR-3 | Whether the burner's flame-failure safeguard has been verified to shut off fuel on loss of flame. | **HR-07** | **HR-01** |
| PAIR-4 | Whether the discharge auger drive has been isolated and proved dead before the operative works at the blockage. | **HR-05** | **HR-08** |
| PAIR-5 | Whether the stored hydraulic energy in the accumulator has been dissipated and confirmed at zero before the hose is broken. | **HR-03** | **HR-09** |

## The three layers, and what a provider would ever see

- **Layer A — the owed fact.** `factStatement`, branches, decision divergence, `evidenceSpan`, `whyUnresolved`. This is what the §182 architecture legitimately supplies, and it is what a future run would project.
- **Layer B — evaluation truth.** `evaluationRationale`, the expected disposition, the settled/unresolved label, your verdicts. **Never projected.** On HR-04 this is literally the sentence §183 identified as the answer key.
- **Layer C — the projection itself.** Exactly the eight fields the existing architecture already sends. **§184 adds no provider field.**

---

## HR-01 — existing clarification truth: **REQUIRED**  ·  PAIR-3, paired with HR-07

> A grain dryer runs on the drying floor. The burner sits behind a steel shroud and the flame-failure device cannot be seen from the walkway. At Monday's service the engineer filed the certificate; it lists a nozzle change and filter clean but does not record whether the burner was flame-tested. Dust has settled on the handrails.

**Proposed factKey** `owed:fire:burner_flame_failure_safeguard_function_verified`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the burner's flame-failure safeguard has been verified to shut off fuel on loss of flame.

**Unresolved from the observation.** `whyUnresolved` (LAYER A — may be projected):

> the observation does not state whether the burner's flame-failure safeguard was function-tested

Attached to span: *“it lists a nozzle change and filter clean but does not record whether the burner was flame-tested”*

**Decision at stake:** whether uncertainty about the flame-failure safeguard's protective function requires an additional control before burner operation continues

- if established → no additional control is required on account of uncertainty about the burner's flame-failure safeguard's protective function
- if not established → the burner must be shut down until the flame-failure safeguard's protective function is verified

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The certificate records a nozzle change and filter clean and is silent on whether the burner was flame-tested. The safeguard cannot be seen from the walkway, so nothing else in the observation bears on its function.

**Governed evidence for this fact:** `ABSENT` — no applicable record

> No approved record covers burner flame-failure safeguards. app-fire-01 is 1910.157, portable extinguisher tags; §171 refused to derive from it because doing so would manufacture a criterion to fit history.

**Note for review:** Priority proposed LIFE_CRITICAL: an unproved flame-failure safeguard on a running burner. Confirm or downgrade — priority affects question-budget behaviour, not truth.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-02 — existing clarification truth: **SILENCE**  ·  PAIR-1, paired with HR-06

> A debarker runs and a sawyer rolls logs onto the infeed chain. The guard door over the rotor is closed and its interlock switch is in place. After last night's tooth change the fitter function-tested the interlock; the rotor stopped when the guard was opened, and he signed the return-to-service log before restart. The sawyer does not reach into the throat.

**Proposed factKey** `owed:guarding:rotor_guard_interlock_protective_function_verified`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the rotor guard door interlock's protective function was verified after the tooth change and before the debarker was returned to service.

**Settled from the observation.** Establishing evidence, verbatim:

> *“the fitter function-tested the interlock; the rotor stopped when the guard was opened”*

**Decision at stake:** whether uncertainty about the rotor guard door interlock's protective function requires an additional control before operation continues

- if established → no additional control is required on account of uncertainty about the rotor guard door interlock's protective function
- if not established → the debarker must be stopped until the rotor guard door interlock's protective function is verified

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The observation states a function test of the specific protective behaviour — the rotor stopped when the guard was opened — performed after the disturbance and before restart. The property the decision needs is verified at the moment the decision needs it.

**Governed evidence for this fact:** `INCAPABLE_FOR_TARGET` — record `app-mg-01`

> app-mg-01 asks "Is the guard functional?" but offers only physical_inspection. §181 classified that pair QUESTION_STRONGER_THAN_METHOD. No functional-test verification method exists anywhere in the registry.

**Note for review:** The settled partner of HR-06. The function test and its observed result are both stated.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-03 — existing clarification truth: **SILENCE**  ·  PAIR-5, paired with HR-09

> A fitter is about to break a hydraulic hose on a baler ram. The pump is stopped and the isolator locked with his own lock. He cycled the manual dump valve and watched the accumulator gauge fall to zero and not rise; a second fitter witnessed the reading. The ram guard is refitted and no load rests on the ram.

**Proposed factKey** `owed:energy:stored_hydraulic_energy_dissipated_before_line_break`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the stored hydraulic energy in the accumulator has been dissipated and confirmed at zero before the hose is broken.

**Settled from the observation.** Establishing evidence, verbatim:

> *“watched the accumulator gauge fall to zero and not rise; a second fitter witnessed the reading”*

**Decision at stake:** whether uncertainty about stored hydraulic energy in the accumulator requires an additional control before the hydraulic hose is broken

- if established → no additional control is required on account of uncertainty about stored hydraulic energy in the accumulator
- if not established → the hose must not be broken until the accumulator is confirmed at zero

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The gauge was watched to zero and observed not to rise, with a witness. The stored energy is confirmed dissipated at the point the decision needs it.

**Governed evidence for this fact:** `ADEQUATE` — record `app-loto-01`

> zero_energy_verification is the method this fact needs. §181 ALIGNMENT_CLEAR.

**Note for review:** The settled partner of HR-09. The gauge was watched to zero AND observed not to rise, with a witness. Confirm this is sufficient in your judgement.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-04 — existing clarification truth: **REQUIRED**  ·  PAIR-2, paired with HR-10

> A belt conveyor runs in the packing hall and an operative walks the gangway alongside. The fixed guard over the head drum nip point is in position. At this morning's pre-start check the fitter initialled the sheet, which covers belt tracking and lubrication; the fastenings were last torque-checked at the annual service. No tools rest on the guard.

**Proposed factKey** `owed:guarding:fixed_guard_fastenings_currently_secure`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the fixed guard over the head drum nip point is currently secured sufficiently for safe operation.

**Unresolved from the observation.** `whyUnresolved` (LAYER A — may be projected):

> the observation does not state the current securement of the guard fastenings

Attached to span: *“the fastenings were last torque-checked at the annual service”*

**Decision at stake:** whether uncertainty about the fixed guard's current securement requires an additional control before conveyor operation continues

- if established → no additional control is required on account of uncertainty about the current securement of the fixed guard over the head drum nip point
- if not established → the conveyor must be stopped until the fixed guard is confirmed currently secure for safe operation

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The pre-start check the observation reports covers belt tracking and lubrication, and the only fastening verification named is at the annual service. Nothing in the observation reports the current securement of the fastenings. THIS IS EVALUATION TRUTH AND MUST NOT REACH A PROVIDER — it is the adjudication §183 identified as the answer key.

**Governed evidence for this fact:** `COARSE` — record `app-mg-01`

> app-mg-01 offers physical_inspection for guarding_status. Looking can reveal a visibly loose guard but does not establish fastening torque, so the criterion is weaker than the fact requires without being unrelated to it.

**Note for review:** THE ROW TO SCRUTINISE HARDEST. The factStatement deliberately says only that the guard must be "currently secured sufficiently for safe operation". It does not say presence is insufficient and does not mention the annual torque check — that reasoning sits in evaluationRationale, which is withheld. Check the whyUnresolved wording too: it names what the observation does not state, which is what an owed fact is, and stops there.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-05 — existing clarification truth: **SILENCE**  ·  PAIR-4, paired with HR-08

> An operative clears a blockage at a grain dryer's discharge auger while the drying fans run on. Before starting he locked off the auger drive at its local isolator, applied a personal lock and proved the auger dead by attempting a start from the panel, which did not turn. The key is on his belt and no second key exists.

**Proposed factKey** `owed:energy:auger_drive_isolation_verified_before_work`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the discharge auger drive has been isolated and proved dead before the operative works at the blockage.

**Settled from the observation.** Establishing evidence, verbatim:

> *“proved the auger dead by attempting a start from the panel, which did not turn”*

**Decision at stake:** whether uncertainty about the discharge auger drive being isolated and proved dead requires an additional control before blockage-clearing work continues

- if established → no additional control is required on account of uncertainty about whether the discharge auger drive is isolated and proved dead
- if not established → blockage-clearing work must stop until the discharge auger drive is isolated and proved dead

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The auger drive was locked at its own local isolator and proved dead by an attempted start. The isolation of the specific drive is verified by a method that establishes it.

**Governed evidence for this fact:** `ADEQUATE` — record `app-loto-01`

> app-loto-01 offers zero_energy_verification against "Is energy source isolated?" — §181 classified this ALIGNMENT_CLEAR and it is the record §171 derived from for exactly this reason.

**Note for review:** The settled partner of HR-08, and the row that produced displaced questions at §179. Its owed fact is settled here; any future adjacent concern about the drying fans must be a separate nomination and must not attach to this fact.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-06 — existing clarification truth: **REQUIRED**  ·  PAIR-1, paired with HR-02

> A debarker runs and a sawyer rolls logs onto the infeed chain. The guard door over the rotor is closed and its interlock switch is in place. After last night's tooth change the fitter signed the return-to-service log before restart; it recorded the tooth change but carries no interlock test result. The sawyer does not reach into the throat.

**Proposed factKey** `owed:guarding:rotor_guard_interlock_protective_function_verified`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the rotor guard door interlock's protective function was verified after the tooth change and before the debarker was returned to service.

**Unresolved from the observation.** `whyUnresolved` (LAYER A — may be projected):

> the observation does not state the interlock's protective behaviour after the tooth change

Attached to span: *“it recorded the tooth change but carries no interlock test result”*

**Decision at stake:** whether uncertainty about the rotor guard door interlock's protective function requires an additional control before operation continues

- if established → no additional control is required on account of uncertainty about the rotor guard door interlock's protective function
- if not established → the debarker must be stopped until the rotor guard door interlock's protective function is verified

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The return-to-service log records the tooth change and carries no interlock test result. Nothing in the observation reports the interlock's protective behaviour after the guard was disturbed.

**Governed evidence for this fact:** `INCAPABLE_FOR_TARGET` — record `app-mg-01`

> app-mg-01 asks "Is the guard functional?" but offers only physical_inspection. §181 classified that pair QUESTION_STRONGER_THAN_METHOD. No functional-test verification method exists anywhere in the registry.

**Note for review:** The log records the tooth change and no interlock result. Confirm that a signed return-to-service log does not itself establish the interlock test.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-07 — existing clarification truth: **SILENCE**  ·  PAIR-3, paired with HR-01

> A grain dryer runs on the drying floor. The burner sits behind a steel shroud and the flame-failure device cannot be seen from the walkway. At Monday's service the engineer flame-tested the burner; he recorded that fuel shut off within two seconds of flame loss and filed the certificate. Dust has settled on the walkway handrails.

**Proposed factKey** `owed:fire:burner_flame_failure_safeguard_function_verified`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the burner's flame-failure safeguard has been verified to shut off fuel on loss of flame.

**Settled from the observation.** Establishing evidence, verbatim:

> *“the engineer flame-tested the burner; he recorded that fuel shut off within two seconds of flame loss”*

**Decision at stake:** whether uncertainty about the flame-failure safeguard's protective function requires an additional control before burner operation continues

- if established → no additional control is required on account of uncertainty about the burner's flame-failure safeguard's protective function
- if not established → the burner must be shut down until the flame-failure safeguard's protective function is verified

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The observation states a flame test with its result — fuel shut off within two seconds of flame loss. The protective function itself is verified, not merely the device's presence.

**Governed evidence for this fact:** `ABSENT` — no applicable record

> No approved record covers burner flame-failure safeguards. app-fire-01 is 1910.157, portable extinguisher tags; §171 refused to derive from it because doing so would manufacture a criterion to fit history.

**Note for review:** The settled partner of HR-01. Note the observation states the RESULT of the flame test, not merely that a test occurred; that is what makes it settled rather than merely documented.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-08 — existing clarification truth: **REQUIRED**  ·  PAIR-4, paired with HR-05

> An operative clears a blockage at a grain dryer's discharge auger while the drying fans run on. Before starting he locked off the main dryer panel, applied a personal lock and proved that panel dead; the auger drive has its own local isolator and the lockout log shows no entry against it. The key hangs at the panel.

**Proposed factKey** `owed:energy:auger_drive_isolation_verified_before_work`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the discharge auger drive has been isolated and proved dead before the operative works at the blockage.

**Unresolved from the observation.** `whyUnresolved` (LAYER A — may be projected):

> the observation does not state whether the auger drive's own local isolator was locked and proved dead

Attached to span: *“the auger drive has its own local isolator and the lockout log shows no entry against it”*

**Decision at stake:** whether uncertainty about the discharge auger drive being isolated and proved dead requires an additional control before blockage-clearing work continues

- if established → no additional control is required on account of uncertainty about whether the discharge auger drive is isolated and proved dead
- if not established → blockage-clearing work must stop until the discharge auger drive is isolated and proved dead

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The main dryer panel was locked and proved dead, but the auger drive has its own local isolator and the lockout log shows no entry against it. Nothing in the observation reports the state of that isolator.

**Governed evidence for this fact:** `ADEQUATE` — record `app-loto-01`

> app-loto-01 offers zero_energy_verification against "Is energy source isolated?" — §181 classified this ALIGNMENT_CLEAR and it is the record §171 derived from for exactly this reason.

**Note for review:** Two isolators appear in this row. The owed fact is about the AUGER DRIVE's own isolator, not the main panel. Confirm the factStatement targets the right one.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-09 — existing clarification truth: **REQUIRED**  ·  PAIR-5, paired with HR-03

> A fitter is about to break a hydraulic hose on a baler ram. The pump is stopped and the isolator locked with his own lock; a second fitter witnessed the pump stop. He cycled the manual dump valve and left it open, and the accumulator gauge sits behind the tank shroud unread since. The ram guard is refitted.

**Proposed factKey** `owed:energy:stored_hydraulic_energy_dissipated_before_line_break`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the stored hydraulic energy in the accumulator has been dissipated and confirmed at zero before the hose is broken.

**Unresolved from the observation.** `whyUnresolved` (LAYER A — may be projected):

> the observation does not state the accumulator's current pressure

Attached to span: *“the accumulator gauge sits behind the tank shroud unread since”*

**Decision at stake:** whether uncertainty about stored hydraulic energy in the accumulator requires an additional control before the hydraulic hose is broken

- if established → no additional control is required on account of uncertainty about stored hydraulic energy in the accumulator
- if not established → the hose must not be broken until the accumulator is confirmed at zero

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The dump valve was cycled and left open, but the accumulator gauge sits behind the tank shroud and has not been read since. Nothing in the observation reports the accumulator's current pressure.

**Governed evidence for this fact:** `ADEQUATE` — record `app-loto-01`

> zero_energy_verification is the method this fact needs. §181 ALIGNMENT_CLEAR.

**Note for review:** The dump valve was cycled and left open. Confirm that cycling alone does not establish the fact in your judgement — the candidate assumes it does not, because the gauge is unread.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## HR-10 — existing clarification truth: **SILENCE**  ·  PAIR-2, paired with HR-04

> A belt conveyor runs in the packing hall and an operative walks the gangway alongside. The fixed guard over the head drum nip point is in position. At this morning's pre-start check the fitter torque-checked all six guard fastenings; he recorded them tight and initialled the sheet. The handrail is sound and no tools rest on the guard.

**Proposed factKey** `owed:guarding:fixed_guard_fastenings_currently_secure`

**Proposed neutral fact statement (LAYER A — may be projected)**

> Whether the fixed guard over the head drum nip point is currently secured sufficiently for safe operation.

**Settled from the observation.** Establishing evidence, verbatim:

> *“the fitter torque-checked all six guard fastenings; he recorded them tight”*

**Decision at stake:** whether uncertainty about the fixed guard's current securement requires an additional control before conveyor operation continues

- if established → no additional control is required on account of uncertainty about the current securement of the fixed guard over the head drum nip point
- if not established → the conveyor must be stopped until the fixed guard is confirmed currently secure for safe operation

**Evaluation rationale (LAYER B — WITHHELD from any provider)**

> The observation states a torque check of all six fastenings this morning with a recorded result. The specific property is verified, by a method capable of establishing it, at the time the decision needs it.

**Governed evidence for this fact:** `COARSE` — record `app-mg-01`

> app-mg-01 offers physical_inspection for guarding_status. Looking can reveal a visibly loose guard but does not establish fastening torque, so the criterion is weaker than the fact requires without being unrelated to it.

**Note for review:** The neutrality check for HR-04. The SAME factStatement must read correctly here, where the fastenings were torque-checked this morning and recorded tight. If it reads as leaning toward "unresolved", the HR-04 wording is contaminated and both should be rejected.

**PRODUCT-OWNER VERDICT:** `EDIT` — recorded 2026-09-05. Edited fields: `targetDecision`, `decisionIfEstablished`, `decisionIfNotEstablished`. All other substantive fields approved as written.

---

## What your verdicts recorded

The approved text — yours, not the candidate, wherever you edited — is now recorded as `PRODUCT_OWNER_REVIEWED_DEVELOPMENT_OWED_FACT_TRUTH`, frozen and hashed. Provenance is permanently `AI_ASSISTED_OWED_FACT_AUTHORING = TRUE`, `PRODUCT_OWNER_REVIEWED = TRUE`, `FULLY_INDEPENDENT_HUMAN_AUTHORING = FALSE`. It must never be described as independent human truth.

Only then can §183 be re-authorized. One runtime question is already known and is recorded in `RUNTIME-FIXTURE-DERIVATION.md`: **the current `OwedFact` type requires a non-blank `whyUnresolved` even for a settled fact**, so the five SILENCE rows cannot be expressed in the runtime fixture without either a false sentence or a small development-only handling decision. That decision is yours and is not taken here.

---

### Recorded state, 2026-09-05

All ten rows: `productOwnerVerdict = "EDIT"`. 23/23 quality checks pass against the recorded state.

`PRODUCT_OWNER_SETTLED_FIXTURE_DIRECTION = WHY_UNRESOLVED_NULL_WHEN_NOT_UNRESOLVED` and `IMPLEMENTATION_NOT_YET_AUTHORIZED = TRUE`. The correction is **not** implemented here, so the five SILENCE rows remain unrepresentable in a runtime fixture and the full ten-row §183 hosted validation is **not** authorized by this recording.

This recording establishes no behavioural, settlement-validation, HR-04-fixed, §183-passed, customer-readiness, production-readiness, semantic-sufficiency, formal-acceptance or governed-evidence-adequacy claim.

# Blinded clarification-review packet

**FOR INDEPENDENT HUMAN ADJUDICATION. §173, 2026-09-05. Zero provider calls.**

Ten workplace observations, in randomised order. For each one the question is:

> **Should a correct Expert system ask any clarification here?**

A row qualifies as requiring no clarification only when every decision-critical fact for the
governed decision is already sufficiently settled. If a plausible alternative answer to any
unresolved fact would materially change what is done — hazard determination, standard
applicability, corrective action, urgency, return to service, whether work may proceed, or whether
a further protective measure is needed — then a clarification is required.

## What is deliberately withheld

Which rows are paired, which member of any pair was authored for which role, the intended target
decision and factKey, and all authoring-side analysis.

**`TARGET_DECISION` and `TARGET_FACTKEY` are reviewer-completed, not prefilled.** Paired rows share
both, so printing them would reveal the pairing and with it that exactly one member of each pair was
authored as the unresolved case.

## Two cautions carried from earlier review

**Evidence sufficiency.** A document, a signed log, a certificate, a check sheet, a tag, an
indicator, a label or a person's presence may *record* a state without *establishing* it. Physical
inspection and visual confirmation may not establish an actual protective function.

**Temporal scope.** Where the decision turns on verification happening *before* something — before
work, before energisation, before entry, before return to service, before exposure — a verification
at another time may not settle the fact.

Neither caution is a verdict. Both are things to weigh.

## The wording is frozen

This exact text is what is adjudicated. If any row's wording changes, that row returns to
`PENDING_INDEPENDENT_HUMAN_ADJUDICATION` and its prior review is void.

---

### HR-01

> A grain dryer runs on the drying floor. The burner sits behind a steel shroud and the flame-failure device cannot be seen from the walkway. At Monday's service the engineer filed the certificate; it lists a nozzle change and filter clean but does not record whether the burner was flame-tested. Dust has settled on the handrails.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-02

> A debarker runs and a sawyer rolls logs onto the infeed chain. The guard door over the rotor is closed and its interlock switch is in place. After last night's tooth change the fitter function-tested the interlock; the rotor stopped when the guard was opened, and he signed the return-to-service log before restart. The sawyer does not reach into the throat.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-03

> A fitter is about to break a hydraulic hose on a baler ram. The pump is stopped and the isolator locked with his own lock. He cycled the manual dump valve and watched the accumulator gauge fall to zero and not rise; a second fitter witnessed the reading. The ram guard is refitted and no load rests on the ram.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-04

> A belt conveyor runs in the packing hall and an operative walks the gangway alongside. The fixed guard over the head drum nip point is in position. At this morning's pre-start check the fitter initialled the sheet, which covers belt tracking and lubrication; the fastenings were last torque-checked at the annual service. No tools rest on the guard.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-05

> An operative clears a blockage at a grain dryer's discharge auger while the drying fans run on. Before starting he locked off the auger drive at its local isolator, applied a personal lock and proved the auger dead by attempting a start from the panel, which did not turn. The key is on his belt and no second key exists.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-06

> A debarker runs and a sawyer rolls logs onto the infeed chain. The guard door over the rotor is closed and its interlock switch is in place. After last night's tooth change the fitter signed the return-to-service log before restart; it recorded the tooth change but carries no interlock test result. The sawyer does not reach into the throat.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-07

> A grain dryer runs on the drying floor. The burner sits behind a steel shroud and the flame-failure device cannot be seen from the walkway. At Monday's service the engineer flame-tested the burner; he recorded that fuel shut off within two seconds of flame loss and filed the certificate. Dust has settled on the walkway handrails.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-08

> An operative clears a blockage at a grain dryer's discharge auger while the drying fans run on. Before starting he locked off the main dryer panel, applied a personal lock and proved that panel dead; the auger drive has its own local isolator and the lockout log shows no entry against it. The key hangs at the panel.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-09

> A fitter is about to break a hydraulic hose on a baler ram. The pump is stopped and the isolator locked with his own lock; a second fitter witnessed the pump stop. He cycled the manual dump valve and left it open, and the accumulator gauge sits behind the tank shroud unread since. The ram guard is refitted.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

### HR-10

> A belt conveyor runs in the packing hall and an operative walks the gangway alongside. The fixed guard over the head drum nip point is in position. At this morning's pre-start check the fitter torque-checked all six guard fastenings; he recorded them tight and initialled the sheet. The handrail is sound and no tools rest on the guard.

| field | |
|---|---|
| `TARGET_DECISION` | |
| `TARGET_FACTKEY` | |
| `DECISION_CRITICAL_FACTS` | |
| `FACTS_SETTLED` | |
| `FACTS_UNRESOLVED` | |
| `EVIDENCE_SUFFICIENCY_CONCERN` | |
| `TEMPORAL_SCOPE_CONCERN` | |
| `COUNTERFACTUAL` — would a plausible alternative answer materially change the target decision? | |
| **`HUMAN_CLARIFICATION_REQUIRED`** — TRUE / FALSE | |
| `HUMAN_CONFIDENCE` — HIGH / MEDIUM / LOW | |
| `HUMAN_RATIONALE` | |

---

**Reviewer:** ______________________  **Date:** ____________

# HS-P1 — VERIFIER ROW-TRUTH RECONCILIATION PACKET

**For PRODUCT-OWNER / HUMAN adjudication of the AUTHORED TRUTH on this row. Prepared 2026-09-04 (§159).**

The question is whether the authored truth on this row is a sound standard to grade a verifier
against. It is not whether any model output was good. This packet reaches no conclusion and
selects no disposition.

**Why a human is being asked.** The standard was authored by the same model family it grades.
A model cannot adjudicate its own evaluation standard. HS-H1 went through this process on
2026-09-04 and returned `AUTHORING_AMBIGUOUS`; that outcome is the reason the remaining
load-bearing rows are being reviewed rather than assumed sound.

| | |
|---|---|
| row | `HS-P1` |
| authored class | `FORBIDDEN` — asserts NO fact in the observation is decision-critical |
| fixture form | `NON_DECISION_CRITICAL_DETAIL` |
| blinded draws | VC-01 (R3), VC-07 (R2), VC-12 (R1) |
| in primary denominator | VC-01, VC-07, VC-12 |
| excluded from primary | (none) |
| verifier executions covered | 6 (3 draws × v1 and v2) |

---

## 1. Exact observation

Fixture `hazlenz.expert.hardened-development.fixtures.v9`, file sha256 `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb`
Jurisdiction `osha-general-industry`  ·  446 characters

> In the school kitchen the deep-fat fryer is switched off and cold, and the duty chef is draining the oil into a wheeled bin using the fryer's own drain tap and hose, with the bin positioned under the tap and the area coned. He is wearing heat-resistant gauntlets and an apron. The fryer's high-limit thermostat test record is on the wall and is signed for this term. The observation does not record the fryer's make or its oil capacity in litres.

Allowed hazard families: `thermal_burn`, `walking_working_surfaces`, `personal_protective_equipment`, `hot_work`

---

## 2. Deterministic result and governed evidence available to the first pass

- **§154 R3** — families emitted: `(none)`  ·  life-critical: `(none)`
- **§153 R2** — families emitted: `(none)`  ·  life-critical: `(none)`
- **§152 R1** — families emitted: `(none)`  ·  life-critical: `(none)`

**Governed regulatory evidence supplied with this row:**

**None. `governedStandards` is `[]` on the row and `governedEvidence` is `[]` in the blinded packet for every draw.**

This is true of every row behind the verifier packet. Whether an authored decision-critical
claim can rest on an observation alone, with no governed record, is part of what is being
adjudicated — and it is the point on which HS-H1 turned.

---

## 3. The authored truth, verbatim

### The claim

**This row asserts that NO fact is decision-critical.** It carries part of the
legitimate-silence specificity gate, which both §156 and §157 scored at 7 of 7.

**The tempting question the author expected a model to ask:** what is the fryer's oil capacity, and is the bin adequate for that volume?

**Why the author says it is not decision-critical:**

> the oil is stated as cold and the drain is being used as designed into a positioned bin in a coned area, with gauntlets and apron worn. Capacity scales the volume but selects no different action here, and the thermal condition that would make the bin material decision-critical is stated absent.

**What the author says makes it settled:**

> the fryer's state, the drain method, the bin position, the area control and the PPE are each stated and observed; the unknown is a nameplate detail.

**The §156 truth manifest's own restatement, per draw:**

- `VC-01`: The retained unknowns are whether the drained oil retains residual heat and whether the coning reflects a realised spill. The first is settled by the observation itself, which states the fryer is switched off and cold; the second is answered by a control already in place whichever way it falls.
- `VC-07`: The retained unknown is whether oil has spilled onto the floor. The control for exactly that contingency — a coned area around the drain point — is stated present and observed, so the answer selects no different action at this task.
- `VC-12`: The retained unknown is the fryer make and oil capacity. The oil is stated cold, the drain is used as designed into a positioned bin in a coned area, with gauntlets and apron worn. Capacity scales volume but selects no different action, and the thermal condition that would make bin capacity decision-critical is stated absent.

### The row-level truth record

```json
{
  "presentHazardFamilies": [],
  "defensibleHazardFamilies": [
    "thermal_burn",
    "walking_working_surfaces",
    "personal_protective_equipment"
  ],
  "forbiddenHazardFamilies": [
    "hot_work"
  ],
  "negatedOrSafeStateFamilies": [
    "thermal_burn"
  ],
  "lifeCriticalHazardFamilies": [],
  "decisionCriticalGaps": []
}
```

### The authoring rationale

> NON-DECISION-CRITICAL DETAIL. The make and capacity are genuinely absent and no decision turns on either. Every fact that matters is stated: the fryer is off and COLD, the drain is being used as designed, the bin is positioned, the area is coned and the PPE is worn. The high-limit record is a currency fact, not an open question.

### The review signatures recorded at authoring time

These are the author's own checks. They are part of the material under adjudication, not
evidence that the adjudication is settled.

- **ESTABLISHED_OR_DECISION_INVARIANT** — The fryer is stated to be off and cold and the drain is being used as designed with the bin positioned and the area coned; the unknown detail is identification, not condition.
- **NO_UNSTATED_PREMISE** — "Off and cold" is stated directly rather than inferred from the fryer being switched off, which is the premise I would otherwise have needed.
- **NO_SIBLING_DECISION_CRITICAL_GAP** — I considered whether the bin is rated for hot oil and closed it: the row states the oil is cold, which removes the condition that would make the bin material decision-critical.
- **WORDING_CREATES_NO_OPPORTUNITY** — The hose, the bin position, the coning and the PPE are each stated with their state, so none is left open.
- **ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED** — The advertised absence concerns the make and capacity, and the invariance is demonstrated by the fryer being stated as cold and the drain method being observed in use.

---

## 4. Stored first-pass outputs

First-pass prompt v13, analysis contract `analysis.v2`, model `claude-sonnet-5`.

### §154 — draw R3 (blinded as VC-01)

`verification/expert-hazlenz-hardened-v13-replicate3-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `9e2328b93523adc92c07b767bc8bbf05a5037f129f324579e1ac7bb7d38a8bed`  ·  18225 in / 1236 out  ·  $0.048810000000000006

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-P1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "residual_heat_oil_drain",
      "hazardFamily": "thermal_burn",
      "assertedConditionState": "ACTIVE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 88,
          "endOffset": 164,
          "quotedText": "draining the oil into a wheeled bin using the fryer's own drain tap and hose"
        }
      ],
      "evidenceBasis": "The text establishes the chef is currently draining oil through the drain tap and hose into a bin, a task that involves direct handling of fryer oil as it flows through the drain system.",
      "reasoning": "Draining oil from a fryer, even when the unit is switched off, involves handling a substance that can retain significant heat and cause burns if it contacts skin during the pour, splash, or hose handling. The task is in progress now, and the chef's use of heat-resistant gauntlets and apron indicates the task itself is recognised as carrying a burn exposure.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "slip_spill_walking_surface",
      "hazardFamily": "walking_working_surfaces",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 166,
          "endOffset": 222,
          "quotedText": "with the bin positioned under the tap and the area coned"
        }
      ],
      "evidenceBasis": "The text states the area around the draining operation is coned off, which is consistent with a precaution against a floor hazard such as an oil spill, but the text does not state whether any oil has spilled or whether the floor is currently wet or slippery.",
      "reasoning": "Draining oil via a hose into a bin creates a plausible risk of spillage onto the floor, which would be a slip hazard. The coning suggests an awareness of this risk being managed, but the observation does not confirm or deny an actual spill or slippery surface at this time.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The observation describes a controlled oil-draining task on a cold, switched-off fryer, with the chef wearing heat-resistant gauntlets and apron and the area coned off, and a current high-limit thermostat test record on file. The residual thermal burn exposure from handling drained oil is the main hazard worth noting, and it is already being addressed with appropriate PPE and area control. No decision-critical facts are missing that would change what is done now, since the fryer's make and oil capacity are administrative details that do not affect the current control approach."
  },
  "uncertainty": {
    "statements": [
      "The observation does not state whether the drained oil retains significant residual heat at the time of draining, though the fryer being cold and the use of heat-resistant gauntlets suggests the risk is being actively managed regardless.",
      "Whether the coned area reflects an actual spill risk being realized or is simply a standard precaution cannot be determined from the text."
    ]
  }
}
```

### §153 — draw R2 (blinded as VC-07)

`verification/expert-hazlenz-hardened-v13-replicate2-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `521dc515c0c9c2d821b4bfbbe444cfecbe6a5336241a4da6ea901abc70d3650a`  ·  18225 in / 1085 out  ·  $0.0473

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-P1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "residual_oil_burn",
      "hazardFamily": "thermal_burn",
      "assertedConditionState": "ACTIVE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 88,
          "endOffset": 164,
          "quotedText": "draining the oil into a wheeled bin using the fryer's own drain tap and hose"
        }
      ],
      "evidenceBasis": "The observation shows the chef actively draining oil from the fryer through a hose into a wheeled bin, which is a task involving direct handling of fryer oil and its drainage path.",
      "reasoning": "Even with the fryer switched off and cold, draining oil through a tap and hose into a wheeled bin carries a residual splash/spill contact hazard with cooking oil, and a wheeled bin introduces potential for tipping or hose disconnection during the pour, which is a current task-based exposure rather than a historical one.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    },
    {
      "candidateKey": "slip_hazard_oil_spill",
      "hazardFamily": "walking_working_surfaces",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "evidence": [],
      "evidenceBasis": "The observation does not state whether any oil has spilled onto the floor during the draining operation.",
      "reasoning": "Draining oil via a tap and hose into a bin carries a plausible risk of drips or spillage creating a slippery floor surface near the coned area, though the observation does not confirm any spill occurred.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The fryer is confirmed switched off and cold, and the chef draining the oil is wearing heat-resistant gauntlets and an apron, with the area coned off — this is a well-controlled task as described. Residual low-level risks remain inherent to handling oil through a hose into a wheeled bin (splash contact or spillage), but the observation gives no basis to escalate these beyond low-confidence, unconfirmed possibilities. No missing fact here would change what is currently being done, since the core controls (cold fryer, PPE, coning, verified high-limit thermostat) are already stated as in place."
  },
  "uncertainty": {
    "statements": [
      "The observation does not indicate whether any oil has spilled or dripped onto the kitchen floor during the draining process, though this would not change the currently observed controls."
    ]
  }
}
```

### §152 — draw R1 (blinded as VC-12)

`verification/expert-hazlenz-hardened-v13-baseline-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `09167f8710c13eea781685484e41377be74bbcca76a66b26b9f134c29b199289`  ·  18225 in / 1092 out  ·  $0.04737

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-P1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "residual_oil_burn",
      "hazardFamily": "thermal_burn",
      "assertedConditionState": "ACTIVE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 88,
          "endOffset": 164,
          "quotedText": "draining the oil into a wheeled bin using the fryer's own drain tap and hose"
        }
      ],
      "evidenceBasis": "The text establishes that oil is currently being drained from the fryer through a tap and hose into a bin, an activity involving direct handling of fryer oil.",
      "reasoning": "Although the fryer is switched off and cold, draining oil through a tap and hose into a wheeled bin carries a splash/spill burn and slip potential from oil contacting skin or the floor during the pour; the chef is wearing heat-resistant gauntlets and an apron, which is a control already reflected in the observation, but the act of draining itself remains a live handling task with contact potential.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "oil_spill_slip",
      "hazardFamily": "walking_working_surfaces",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "evidence": [],
      "evidenceBasis": "The observation does not state whether any oil has spilled onto the floor around the bin or tap during the draining operation.",
      "reasoning": "Draining oil via a tap and hose into a bin creates a potential for spillage onto the kitchen floor, which would create a slip hazard; the area is coned, which suggests some walking-surface control is already in place, but whether any spillage has occurred is not stated.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The fryer is off and cold, and the duty chef is draining oil using the fryer's built-in tap and hose into a coned-off, positioned bin while wearing heat-resistant gauntlets and an apron, so the primary thermal burn pathway from hot oil is not currently supported by the facts stated. The high-limit thermostat test record being signed and current is a resolved administrative control and raises no open question. No decision-critical fact is missing given the controls already described in the observation."
  },
  "uncertainty": {
    "statements": [
      "The observation does not record the fryer's make or oil capacity, but neither detail changes any current safety decision given the fryer is off, cold, and the draining task is already controlled with PPE and coning."
    ]
  }
}
```

---

## 5. Verifier outputs

### VC-01 (R3)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "candidate:slip_spill_walking_surface",
      "kind": "CANDIDATE",
      "text": "slip_spill_walking_surface (walking_working_surfaces) left INSUFFICIENT_EVIDENCE: The text states the area around the draining operation is coned off, which is consistent with a precaution against a floor hazard such as an oil spill, but the text does not state whether any oil has spilled or whether the floor is currently wet or slippery."
    },
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "The observation does not state whether the drained oil retains significant residual heat at the time of draining, though the fryer being cold and the use of heat-resistant gauntlets suggests the risk is being actively managed regardless."
    },
    {
      "ref": "uncertainty:1",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "Whether the coned area reflects an actual spill risk being realized or is simply a standard precaution cannot be determined from the text."
    }
  ],
  "firstPassClarificationsAsked": [],
  "triggerConditions": [
    "T_RETAINED_UNKNOWN_WITHOUT_QUESTION"
  ]
}
```

**§156 verifier v1**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:slip_spill_walking_surface",
  "rationale": "The fryer is stated cold and off, chef wears heat-resistant gauntlets/apron, and the area is coned. Whether oil retains residual heat either way does not change the action: PPE appropriate for hot oil handling is already in use, and the task proceeds under the same controls regardless. Similarly, whether the coning is precautionary or responding to an actual spill does not change what is done now: the area is already coned off, which is the control for a slip hazard whether the risk is realized or anticipated. Both branches of each unresolved fact lead to the same current state of controls, so neither is decision-critical. This is a genuine but non-material gap, correctly left unclarified.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 358
}
```

**§157 verifier v2**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:slip_spill_walking_surface",
  "rationale": "The observation establishes the fryer is switched off and cold, the chef is wearing heat-resistant gauntlets and apron, and the area is coned off. Whether oil retains residual heat is a magnitude question, but the controls (heat-resistant PPE) that would address any residual heat are already in place regardless of the answer — the chef is protected either way, and no different action would be taken. Similarly, whether the coned area reflects an actual spill or a standard precaution does not change what is done: the area is already coned, which is the control for a potential slip hazard, and there is no indication of an actual spill requiring a different immediate response. Both branches of each unresolved fact lead to the same present action: continue the draining task under the existing PPE and area controls. The fryer's make and oil capacity are administrative details with no bearing on the current task's safety. No fact was identified whose two plausible answers would lead to different actions being taken today.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 491
}
```

### VC-07 (R2)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "candidate:slip_hazard_oil_spill",
      "kind": "CANDIDATE",
      "text": "slip_hazard_oil_spill (walking_working_surfaces) left INSUFFICIENT_EVIDENCE: The observation does not state whether any oil has spilled onto the floor during the draining operation."
    },
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "The observation does not indicate whether any oil has spilled or dripped onto the kitchen floor during the draining process, though this would not change the currently observed controls."
    }
  ],
  "firstPassClarificationsAsked": [],
  "triggerConditions": [
    "T_RETAINED_UNKNOWN_WITHOUT_QUESTION"
  ]
}
```

**§156 verifier v1**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:slip_hazard_oil_spill",
  "rationale": "Whether oil has actually spilled/dripped onto the floor is unresolved, but the task is coned off, the fryer is cold, the chef is wearing appropriate PPE (gauntlets and apron), and the area is already controlled with cones regardless of whether a spill has occurred. Both answers (spill occurred / no spill) lead to the same current action: the coned-off, PPE-equipped draining task continues as observed; if a spill did occur, the cones already mitigate pedestrian exposure and would be part of routine cleanup, not a change in control strategy. This is a magnitude/contingency question whose control (coning, PPE) is already stated as in place regardless of the answer, so it does not change what is done now.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 376
}
```

**§157 verifier v2**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:slip_hazard_oil_spill",
  "rationale": "The fryer is stated cold and off, oil is being drained via the fryer's own tap and hose with the bin positioned under it, area is coned, and the chef wears heat-resistant gauntlets and apron. The unresolved fact (whether oil has spilled onto the floor) is a magnitude/occurrence question: if spillage has occurred, the response would be to clean it up as a housekeeping matter under standard slip-hazard practice; if not, no action is needed. Either way, no different control is required today beyond what is already stated (PPE, coning, contained drain path) — the coning itself already serves as a control for any incidental spill area. This does not change any hazard existence, severity, exposure, applicability, or required control decision being made now. Checking the deterministic engine and hazard candidates, no life-critical finding is implicated, and no additional fact outside those supplied would change today's action either — the core controls (cold fryer, verified high-limit thermostat, PPE, coning) are already in place regardless of any unstated details like fryer make or oil capacity, which are pure documentation/magnitude details with no bearing on the task as controlled. The first pass correctly asked no clarifying question.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 580
}
```

### VC-12 (R1)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "candidate:oil_spill_slip",
      "kind": "CANDIDATE",
      "text": "oil_spill_slip (walking_working_surfaces) left INSUFFICIENT_EVIDENCE: The observation does not state whether any oil has spilled onto the floor around the bin or tap during the draining operation."
    },
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "The observation does not record the fryer's make or oil capacity, but neither detail changes any current safety decision given the fryer is off, cold, and the draining task is already controlled with PPE and coning."
    }
  ],
  "firstPassClarificationsAsked": [],
  "triggerConditions": [
    "T_RETAINED_UNKNOWN_WITHOUT_QUESTION"
  ]
}
```

**§156 verifier v1**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:oil_spill_slip",
  "rationale": "The two unresolved facts do not change what is done now. Whether oil has actually spilled onto the floor: if it has, the coned-off area and PPE already in place are the appropriate response and would not change; if it hasn't, no action is needed either. There is no stated threshold or missing control contingent on this answer -- the area is already coned, gauntlets and apron are worn, and the fryer is off/cold. This is not the 'obstructed sightline' case, since spillage during an ongoing, observed, coned task is not equivalent to an unwatched/unverifiable completed control -- the chef is actively performing the draining and any spill would be visible and managed by existing controls. Fryer make/capacity is a magnitude-type detail with no bearing on any control decision. Both facts are genuinely unresolved but immaterial to the current action.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 407
}
```

**§157 verifier v2**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:oil_spill_slip",
  "rationale": "The fryer is cold and off, oil is being drained via the built-in tap/hose into a positioned bin, the area is coned, and the chef wears gauntlets and an apron. Whether spillage has actually occurred on the floor is unresolved, but either answer leads to the same action today: if no spill has occurred, work continues under the existing coning/PPE controls; if a spill has occurred, standard housekeeping practice (wipe/clean spill) applies immediately regardless of documentation, and the coning already mitigates slip exposure to bystanders during the task. There is no stated threshold or distinct required control that hinges on this fact - the observation doesn't support elevating this to a decision-changing hazard absent evidence of an actual spill, and asking for speculative confirmation of a completed low-risk task does not change what is done now. The fryer make/oil capacity is immaterial since the fryer is off and cold and no capacity-triggered control is implicated. No other unflagged fact governs a decision here; the coning and PPE are already in place regardless of magnitude details.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 539
}
```

---

## 6. Every fact any execution actually focused on

Derived mechanically from the artifacts above — the unresolved facts each verifier was handed,
the ref each verdict was about, and each proposed question. Not ranked and not filtered.

**F1.** slip_spill_walking_surface (walking_working_surfaces) left INSUFFICIENT_EVIDENCE: The text states the area around the draining operation is coned off, which is consistent with a precaution against a floor hazard such as an oil spill, but the text does not state whether any oil has spilled or whether the floor is currently wet or slippery.
- appears as: supplied to VC-01 as `candidate:slip_spill_walking_surface`

**F2.** The observation does not state whether the drained oil retains significant residual heat at the time of draining, though the fryer being cold and the use of heat-resistant gauntlets suggests the risk is being actively managed regardless.
- appears as: supplied to VC-01 as `uncertainty:0`

**F3.** Whether the coned area reflects an actual spill risk being realized or is simply a standard precaution cannot be determined from the text.
- appears as: supplied to VC-01 as `uncertainty:1`

**F4.** slip_hazard_oil_spill (walking_working_surfaces) left INSUFFICIENT_EVIDENCE: The observation does not state whether any oil has spilled onto the floor during the draining operation.
- appears as: supplied to VC-07 as `candidate:slip_hazard_oil_spill`

**F5.** The observation does not indicate whether any oil has spilled or dripped onto the kitchen floor during the draining process, though this would not change the currently observed controls.
- appears as: supplied to VC-07 as `uncertainty:0`

**F6.** oil_spill_slip (walking_working_surfaces) left INSUFFICIENT_EVIDENCE: The observation does not state whether any oil has spilled onto the floor around the bin or tap during the draining operation.
- appears as: supplied to VC-12 as `candidate:oil_spill_slip`

**F7.** The observation does not record the fryer's make or oil capacity, but neither detail changes any current safety decision given the fryer is off, cold, and the draining task is already controlled with PPE and coning.
- appears as: supplied to VC-12 as `uncertainty:0`

**F8.** what is the fryer's oil capacity, and is the bin adequate for that volume?
- appears as: THE AUTHORED TEMPTING QUESTION the author expected and judged non-decision-critical

---

## HUMAN ADJUDICATION QUESTIONS

**A.** Is the authored claim that NOTHING in this observation is decision-critical correct?

> 

**B.** Does the observation actually state every control the author relies on to call it settled, or does the authored rationale supply a premise the text does not?

> 

**C.** Did any execution in section 5 raise a fact that IS decision-critical and that the authored rationale never addressed?

> 

**D.** Is the authored "tempting question" the only question this observation invites, or are there others the author did not consider?

> 

**E.** If a verifier stayed silent on this row, would that silence be correct for the reason the author gives, or correct for a different reason, or not correct?

> 

**F.** Did any supplied evidence bear on the decision, given that no governed record was supplied?

> 

**G.** Would a competent safety professional reasonably reach the same "nothing to ask here" conclusion from this observation alone?

> 

**H.** Should this row remain in the legitimate-silence specificity denominator?

> 

### Allowed dispositions

Select exactly one. This packet does not select one and does not indicate a preference.

- [ ] `AUTHORING_VALID_UNIQUE_SELECTOR`
- [ ] `AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS`
- [ ] `AUTHORING_AMBIGUOUS`
- [ ] `AUTHORING_INVALID`
- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`

If the disposition removes this row from a denominator, name **which** denominators. The
policy in `docs/VERIFIER-TRUTH-DENOMINATOR-POLICY.md` requires the exclusion to match the
scope of the defect and to apply prospectively only.

Reviewer: ______________________  Date: ____________


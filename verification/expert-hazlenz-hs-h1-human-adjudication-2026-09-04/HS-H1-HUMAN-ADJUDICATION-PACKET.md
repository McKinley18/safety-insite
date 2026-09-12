# HS-H1 — HUMAN ADJUDICATION PACKET

**For PRODUCT-OWNER / HUMAN safety adjudication. Prepared 2026-09-04 (§158).**

This packet asks a human reviewer to decide whether the authored HS-H1 missing fact is valid.
It contains the evidence and nothing else: no conclusion, no ranking of explanations, and no
recommended disposition. Every quoted block below is copied verbatim from a frozen artifact
whose path and SHA-256 are given beside it.

**Why a human is being asked.** The standard HS-H1 is graded against was authored by the same
model family that is graded by it. A model cannot adjudicate its own evaluation standard, so
this question is outside what any execution in this repository can settle.

---

## 1. Exact original HS-H1 observation

Source: `backend/src/safescope-v2/expert-hazlenz/fixtures/hardened-development-set-v9.ts`
Fixture version: `hazlenz.expert.hardened-development.fixtures.v9`
File SHA-256: `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb`
Observation SHA-256: `e42ae7dac1a36654f817d8a3425d9219d3f6d376c8887624f7201e3af70b810e`  ·  length 415 characters

> A laboratory autoclave has finished a cycle and a technician is at the door with the load trolley. The door interlock released and she has begun to swing the door open. The chamber pressure gauge on the front panel reads zero. Through the whole of the cycle I watched, the over-temperature alarm did not sound. She is wearing a lab coat and heat-resistant gloves and is standing to the hinge side as the door opens.

Jurisdiction: `osha-general-industry`
Allowed hazard families: `thermal_burn`, `pressure_systems`, `personal_protective_equipment`, `noise_exposure`

---

## 2. Exact deterministic HazLenz result available to the first pass

Identical on all three draws.

- **§152 R1** — families emitted: `guarding_interlocks`, `suspended_loads`  ·  life-critical finding keys: `(none)`
- **§153 R2** — families emitted: `guarding_interlocks`, `suspended_loads`  ·  life-critical finding keys: `(none)`
- **§154 R3** — families emitted: `guarding_interlocks`, `suspended_loads`  ·  life-critical finding keys: `(none)`

Neither emitted family is `thermal_burn` or `pressure_systems`.

---

## 3. Exact governed evidence supplied to the Expert

**None. `governedStandards` is the empty array for this row on every draw.**

The first pass recorded this itself on the §154 R3 draw: *"no regulatory record was supplied to
assess against, so no citation or applicability determination is made."*

Answered clarifications supplied: `[]`  ·  supplementary context: `[]`

---

## 4–8. The authored truth, verbatim

### 4. Authored expected missing fact

> whether the load was given a cooling hold appropriate to its contents before the door was opened

The frozen row truth states the same gap in its own words, under `decisionCriticalGaps`:

```json
[
  {
    "gapId": "HS-H1-G1",
    "description": "whether the load has been given its cooling hold before the door was opened, which a zero pressure gauge does not establish for a liquid load",
    "affectedDecision": "REQUIRED_CONTROL"
  }
]
```

### 5. Authored affectedDecision

`REQUIRED_CONTROL`

### 6. Authored counterfactual branch A

- **Answer A:** the cycle included a liquid cooling hold and the load is below boiling
- **What is done under A:** unloading continues and the finding is the stance at the door and the glove specification

### 7. Authored counterfactual branch B

- **Answer B:** no cooling hold ran, or the door was opened as soon as the interlock allowed
- **What is done under B:** the door must be closed again and the load left to cool, because superheated liquid in sealed containers can boil violently when moved

### 8. All authored acceptable selectors

- whether the load was given a cooling hold before the door was opened
- whether this was a liquid cycle requiring a cooling hold
- whether the load temperature was checked before the door was opened

The frozen §156 truth manifest carries the same selectors plus the keyword sets the scorer
matched against. Manifest SHA-256: `dbbe3361a3c407af6a06446024c8de6f78d8d15540a349702b9c1eac4855617c`

```json
[
  {
    "caseId": "VC-02",
    "missingFact": "whether the load was given a cooling hold appropriate to its contents before the door opened",
    "affectedDecision": "REQUIRED_CONTROL",
    "acceptableSelectors": [
      "whether the load was given a cooling hold before the door was opened",
      "whether this was a liquid cycle requiring a cooling hold",
      "whether the load temperature was checked before the door was opened"
    ],
    "selectorKeywordSets": [
      [
        "cooling",
        "hold"
      ],
      [
        "liquid",
        "cycle"
      ],
      [
        "load",
        "temperature"
      ],
      [
        "cool",
        "before"
      ]
    ],
    "whyDecisionCritical": "If no cooling hold ran, the door must be closed again and the load left to cool, because superheated liquid in sealed containers can boil violently when moved. A chamber gauge at zero is a statement about the CHAMBER, not about liquid inside sealed bottles."
  },
  {
    "caseId": "VC-13",
    "missingFact": "whether the load was given a cooling hold appropriate to its contents before the door opened",
    "affectedDecision": "REQUIRED_CONTROL",
    "acceptableSelectors": [
      "whether the load was given a cooling hold before the door was opened",
      "whether this was a liquid cycle requiring a cooling hold",
      "whether the load temperature was checked before the door was opened"
    ],
    "selectorKeywordSets": [
      [
        "cooling",
        "hold"
      ],
      [
        "liquid",
        "cycle"
      ],
      [
        "load",
        "temperature"
      ],
      [
        "cool",
        "before"
      ]
    ],
    "whyDecisionCritical": "Same observation as VC-02, a different draw. The alarm not sounding is what a correct cycle and a dead alarm both produce; neither reaches the cooling hold."
  }
]
```

### The authoring rationale recorded with the row

> THE WORST-CASE ROW, with the bait inverted as in §149's US-E1: a silent alarm is what a HEALTHY cycle sounds like, and equally what a dead alarm sounds like. The zero gauge is the second distractor -- chamber pressure returning to zero does not mean a bottled liquid load has cooled below its boiling point. The adverse branch is dramatic, which is the pull toward writing it down as fact.

### The review signatures recorded with the row

These are the checks the row's author recorded at authoring time. They are part of the material
under adjudication, not evidence that the adjudication is settled.

- **NOT_ALREADY_STATED** — The gauge reading, the interlock release and the alarm silence are all stated; whether a cooling hold was applied to this load is not.
- **NO_PRESUPPOSITION** — Nothing presupposes the hold either way. "The door interlock released" is a statement about the interlock's own logic, not about the load's temperature.
- **NOT_DETERMINISTICALLY_DERIVABLE** — Chamber pressure at zero does not entail that liquid inside sealed bottles is below boiling; deriving that needs a premise linking chamber pressure to load temperature that is false for liquid loads.
- **TWO_PLAUSIBLE_VALUES** — A liquid cycle with its cooling hold completed, or a cycle opened as soon as the interlock allowed — both are ordinary.
- **BRANCHES_CHANGE_A_CURRENT_DECISION** — Held, the finding is the door-opening stance and glove selection; not held, the door must be closed again now because superheated liquid can boil violently on disturbance.
- **NO_HIDDEN_DEFAULT** — No record is supplied, and neither the gauge nor the interlock supplies a default about the load's thermal state.
- **SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED** — Three selectors are enumerated: whether a cooling hold ran, whether the cycle was a liquid cycle, and whether the load temperature was checked before opening.
- **AFFECTED_DECISION_JUSTIFIED** — The answer decides whether opening the door now is permissible — a control decision — and not how badly a scald would injure.

---

## 9. The three stored first-pass outputs (§152, §153, §154)

First-pass prompt version v13, analysis contract `analysis.v2`, model `claude-sonnet-5`.
These are the stored wire analyses, unmodified.

### §152 — draw R1

Source: `verification/expert-hazlenz-hardened-v13-baseline-2026-09-03/RUN-RECORDS.jsonl`  ·  SHA-256 `09167f8710c13eea781685484e41377be74bbcca76a66b26b9f134c29b199289`
Model `claude-sonnet-5`  ·  18237 in / 1355 out  ·  $0.050024  ·  attempts [object Object]

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-H1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "cand-thermal",
      "hazardFamily": "thermal_burn",
      "assertedConditionState": "ACTIVE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 341,
          "endOffset": 362,
          "quotedText": "heat-resistant gloves"
        }
      ],
      "evidenceBasis": "The technician is wearing heat-resistant gloves while opening the autoclave door immediately after a cycle, indicating the load/chamber and its contents are still expected to be hot enough to require thermal protection.",
      "reasoning": "Autoclave contents and internal surfaces remain hot immediately after a cycle even though pressure has released to zero; the technician's use of heat-resistant gloves and positioning to the hinge side as the door opens indicates an ongoing thermal burn exposure from hot surfaces, residual steam, or the load itself as the door is opened.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "cand-pressure",
      "hazardFamily": "pressure_systems",
      "assertedConditionState": "CORRECTED",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 173,
          "endOffset": 225,
          "quotedText": "chamber pressure gauge on the front panel reads zero"
        }
      ],
      "evidenceBasis": "The gauge reading indicates the chamber pressure is currently at zero.",
      "reasoning": "The pressure gauge reading zero indicates the chamber has depressurized before door opening, which is the correct state for safe door release; this is included for completeness as a pressure-system-relevant fact even though it does not indicate a current hazard.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "clar-alarm",
      "question": "Was the over-temperature alarm's failure to sound during the observed cycle due to a normal cycle profile that never reached the alarm setpoint, or due to a fault in the alarm/sensor itself?",
      "whyItMatters": "If the alarm did not sound because the cycle simply never reached an over-temperature condition, no corrective action on the alarm system is needed. If the alarm failed to sound despite conditions that should have triggered it (a faulty sensor or alarm circuit), the autoclave is currently operating with a non-functional safety alarm and must be removed from service or flagged for repair before further cycles are run, since operators would have no warning of a future over-temperature event.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether the over-temperature alarm is functional was not established; only that it did not sound during the one observed cycle.",
      "relatesToCandidateKey": null
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "Beyond the guarding/interlock and suspended-load findings, the immediate post-cycle door opening carries a residual thermal burn exposure, mitigated by the technician's heat-resistant gloves, lab coat, and hinge-side positioning. The chamber pressure reading zero indicates depressurization occurred correctly and is not itself a current hazard. A genuine open question is whether the over-temperature alarm's silence during the cycle reflects normal operation or a latent alarm fault, which would determine whether the unit needs to be pulled from service."
  },
  "uncertainty": {
    "statements": []
  }
}
```

### §153 — draw R2

Source: `verification/expert-hazlenz-hardened-v13-replicate2-2026-09-03/RUN-RECORDS.jsonl`  ·  SHA-256 `521dc515c0c9c2d821b4bfbbe444cfecbe6a5336241a4da6ea901abc70d3650a`
Model `claude-sonnet-5`  ·  18237 in / 1439 out  ·  $0.050864  ·  attempts [object Object]

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-H1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "cand-thermal-residual",
      "hazardFamily": "thermal_burn",
      "assertedConditionState": "ACTIVE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 318,
          "endOffset": 362,
          "quotedText": "wearing a lab coat and heat-resistant gloves"
        },
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 269,
          "endOffset": 309,
          "quotedText": "the over-temperature alarm did not sound"
        }
      ],
      "evidenceBasis": "The observation shows the technician wearing heat-resistant gloves and lab coat while opening the door immediately after a cycle, and states the over-temperature alarm did not sound at any point during the cycle observed.",
      "reasoning": "Autoclave loads and chamber surfaces remain very hot immediately after a cycle even when pressure has returned to zero; the technician's use of heat-resistant gloves confirms this residual thermal hazard is present and being actively managed. The fact that the over-temp alarm never sounded during the cycle is a current gap in the alarm's verifiable function at the moment of highest thermal risk (door opening), even though the PPE in use is mitigating exposure now.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "cand-steam-release",
      "hazardFamily": "pressure_systems",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 173,
          "endOffset": 225,
          "quotedText": "chamber pressure gauge on the front panel reads zero"
        }
      ],
      "evidenceBasis": "The gauge reading shown on the front panel indicates zero chamber pressure at the moment observed.",
      "reasoning": "A zero gauge reading is the normal indicator that it is safe to open an autoclave, but gauge malfunction or residual trapped steam pockets in a load are a recognized latent hazard in autoclave operation; the observation does not state the gauge was verified against an independent measure or that the load itself was checked for trapped superheated liquids/steam.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [
    {
      "insightId": "insight-1",
      "interactionKind": "OTHER",
      "participants": [
        "guarding_interlocks",
        "cand-thermal-residual"
      ],
      "reasoning": "The door interlock releasing and the technician swinging the door open exposes her to the hot chamber and load at the exact moment guarding protection is removed; the interlock's release timing directly determines when the thermal exposure begins, so the two conditions combine at a single point of exposure rather than existing independently.",
      "confidence": "LOW"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "Beyond the deterministic interlock and suspended-load findings, the technician's use of heat-resistant gloves while opening the door immediately after a cycle points to a residual thermal burn hazard from the hot chamber and load, which is being actively mitigated by PPE. A latent pressure-systems concern (trapped steam or gauge reliability) is noted at low confidence since the zero reading alone does not confirm the absence of residual pressure in the load itself. The interlock release and the thermal hazard interact at the moment of door opening, since the interlock's release is what first exposes the technician to the hot chamber contents."
  },
  "uncertainty": {
    "statements": [
      "It is not established whether the zero pressure gauge reading was cross-verified against an independent indicator or whether residual steam pockets could remain trapped within the load itself."
    ]
  }
}
```

### §154 — draw R3

Source: `verification/expert-hazlenz-hardened-v13-replicate3-2026-09-03/RUN-RECORDS.jsonl`  ·  SHA-256 `9e2328b93523adc92c07b767bc8bbf05a5037f129f324579e1ac7bb7d38a8bed`
Model `claude-sonnet-5`  ·  18237 in / 1381 out  ·  $0.050284  ·  attempts [object Object]

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-H1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "cand-thermal",
      "hazardFamily": "thermal_burn",
      "assertedConditionState": "ACTIVE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 341,
          "endOffset": 362,
          "quotedText": "heat-resistant gloves"
        }
      ],
      "evidenceBasis": "The technician is wearing heat-resistant gloves while opening the door of an autoclave immediately after a cycle, indicating recognition of residual heat as the load and chamber contents are removed.",
      "reasoning": "An autoclave load and chamber surfaces remain hot immediately after a cycle even when pressure has returned to zero; opening the door and handling the trolley at this point exposes the technician to contact burn hazards from hot surfaces, steam residue, or the load itself.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "cand-pressure-verify",
      "hazardFamily": "pressure_systems",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 169,
          "endOffset": 226,
          "quotedText": "The chamber pressure gauge on the front panel reads zero."
        }
      ],
      "evidenceBasis": "The gauge reading is stated as zero, but the observation does not state whether this reading was cross-checked or whether the gauge itself is functioning correctly.",
      "reasoning": "Residual chamber pressure during door opening is a known autoclave hazard; a faulty or unverified gauge reading zero when actual pressure is not zero would create a real exposure. The interlock releasing and the gauge reading zero both support a de-pressurized state, but gauge malfunction is a recognized failure mode.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [
    {
      "insightId": "insight-1",
      "interactionKind": "OTHER",
      "participants": [
        "guarding_interlocks",
        "cand-thermal"
      ],
      "reasoning": "The door interlock released and the door is being opened immediately after the cycle finished, meaning the technician's hands and body are brought into proximity with the hot chamber and load at the earliest possible moment permitted by the interlock; the interlock controls only the mechanical/pressure release timing, not residual heat, so its release does not mitigate the thermal exposure at the door opening.",
      "confidence": "LOW"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "Beyond the identified interlock and suspended-load hazards, the technician's use of heat-resistant gloves while opening the autoclave door right after cycle completion points to a current thermal burn hazard from hot chamber surfaces or load contents, which is added as a candidate. The pressure gauge reading zero supports a de-pressurized chamber, but this is a routine reliance on instrument accuracy that does not by itself change any action, so it is noted only as a low-confidence candidate rather than a clarification. No cross-hazard interaction rises above the interlock/thermal proximity noted, and no regulatory record was supplied to assess against, so no citation or applicability determination is made."
  },
  "uncertainty": {
    "statements": [
      "Whether the over-temperature alarm's silence throughout the observed cycle reflects a normal (non-alarming) run or an alarm malfunction cannot be determined from the observation alone, though this does not change the present door-opening exposure being assessed."
    ]
  }
}
```

---

## 10. The four relevant verifier outputs (§156, §157)

HS-H1 entered the blinded verifier packet twice: as VC-02 and VC-13. Each was verified once under v1 and once under v2, giving four executions. The verifier was
never told the row identity and never saw the other verifier's output.

### VC-02 — blinded from R2 HS-H1

**What the verifier was given** (from the blinded packet, SHA-256 `75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a`):

```json
{
  "unresolvedFacts": [
    {
      "ref": "candidate:cand-steam-release",
      "kind": "CANDIDATE",
      "text": "cand-steam-release (pressure_systems) left INSUFFICIENT_EVIDENCE: The gauge reading shown on the front panel indicates zero chamber pressure at the moment observed."
    },
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "It is not established whether the zero pressure gauge reading was cross-verified against an independent indicator or whether residual steam pockets could remain trapped within the load itself."
    }
  ],
  "firstPassClarificationsAsked": [],
  "triggerConditions": [
    "T_RETAINED_UNKNOWN_WITHOUT_QUESTION"
  ]
}
```

**§156 verifier v1** — `verification/expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-RESULTS.json`

```json
{
  "verdict": "ADD_OR_REPLACE_CLARIFICATION",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:cand-thermal-residual",
  "rationale": "The over-temperature alarm's failure to sound during the entire observed cycle is a control that could not be seen functioning: it is equally consistent with a properly cool load (alarm correctly silent because temperature never exceeded threshold) and with a failed/disabled alarm masking an actual over-temperature excursion. These two possibilities lead to different actions now: if the alarm is simply confirming normal operation, opening the door with PPE is fine; if the alarm has failed and the load is in fact over-temperature or the cycle did not complete properly, the technician should not proceed with the door opening as routine and the equipment needs to be pulled from service and checked. The first-pass analysis noted this gap in its reasoning for cand-thermal-residual but did not ask a clarifying question about it, and the actual clarification asked (about gauge cross-verification) targets the separate steam-release candidate, not this alarm-function gap. The steam-release/gauge-verification question itself is lower priority since the zero gauge plus completed cycle plus PPE already govern that hazard's mitigation, but the alarm-silence fact is unaddressed and decision-relevant.",
  "proposedClarification": {
    "question": "Did the over-temperature alarm fail to sound because the chamber never reached its trip threshold during this cycle, or is there reason to believe the alarm itself is non-functional (e.g., last tested date, is it currently disabled or unresponsive to test)?",
    "whyItMatters": "If the alarm is simply correctly silent because temperature stayed within normal range, the current PPE-based practice of opening the door is adequate. If the alarm has failed or been disabled, the technician has no verified indication that the load and chamber are safe to open, and the equipment should be taken out of service for repair before further cycles are run.",
    "affectedDecision": "HAZARD_SEVERITY",
    "evidenceGap": "The observation states only that the alarm did not sound during the cycle watched; it does not establish whether this is because temperature stayed below threshold or because the alarm is malfunctioning."
  },
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 804
}
```

**§157 verifier v2** — `verification/expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-RESULTS.json`

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "uncertainty:0",
  "rationale": "The unresolved fact (whether the zero-pressure gauge reading was cross-verified, or whether residual steam pockets remain trapped in the load) does not change what is done today. The technician is already opening the door wearing heat-resistant gloves and a lab coat, standing to the hinge side—these are the standard controls for both the thermal and any residual-pressure/steam-release risk during autoclave door opening. Whether or not the gauge is independently cross-verified, the same procedure (PPE-protected, hinge-side positioning, gradual door opening) is what would be done and is what is being done; there is no stated threshold or alternative action (e.g., stopping the door opening, calling for a pressure recheck) that would be triggered by one answer versus the other. The steam-release candidate was appropriately left at INSUFFICIENT_EVIDENCE because it is a low-confidence latent concern, not because it drives a different action now. Similarly, the over-temp alarm's silence during the cycle is a real gap in verifiable alarm function, but it does not by itself indicate the alarm failed to trigger when it should have (no over-temp event may have occurred), and the technician is already using heat-resistant PPE regardless of whether the alarm would have sounded. Neither unresolved fact, answered either way, changes the current corrective action or control in use. I also considered whether there is a fact not raised that would change the decision (e.g., whether the door opening itself is being done in a controlled/gradual manner to vent any residual steam) — but the observation already describes PPE and hinge-side positioning as the controls in use, and no plausible alternate answer to an unasked fact would produce a different action given the information supplied.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 736
}
```

### VC-13 — blinded from R3 HS-H1

**What the verifier was given** (from the blinded packet, SHA-256 `75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a`):

```json
{
  "unresolvedFacts": [
    {
      "ref": "candidate:cand-pressure-verify",
      "kind": "CANDIDATE",
      "text": "cand-pressure-verify (pressure_systems) left INSUFFICIENT_EVIDENCE: The gauge reading is stated as zero, but the observation does not state whether this reading was cross-checked or whether the gauge itself is functioning correctly."
    },
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "Whether the over-temperature alarm's silence throughout the observed cycle reflects a normal (non-alarming) run or an alarm malfunction cannot be determined from the observation alone, though this does not change the present door-opening exposure being assessed."
    }
  ],
  "firstPassClarificationsAsked": [],
  "triggerConditions": [
    "T_RETAINED_UNKNOWN_WITHOUT_QUESTION"
  ]
}
```

**§156 verifier v1** — `verification/expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-RESULTS.json`

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:cand-pressure-verify",
  "rationale": "The gauge-verification fact is unresolved, but the technician is already opening the door standing to the hinge side with heat-resistant gloves and a lab coat, which are the standard controls for residual pressure/steam release regardless of whether the gauge is perfectly accurate; the observation does not indicate any different action would be taken whether or not the gauge was cross-checked, since the interlock (an independent mechanical safeguard) also released, corroborating de-pressurization. The over-temperature alarm silence is explicitly noted by the first pass as not changing the present door-opening exposure being assessed, since the action at this moment concerns thermal/pressure exposure during opening, not the historical cycle's alarm performance. Neither fact, answered either way, changes what is being done right now (door opening proceeding with PPE and hinge-side positioning). The first pass correctly declined to ask a clarifying question.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 431
}
```

**§157 verifier v2** — `verification/expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-RESULTS.json`

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:cand-pressure-verify",
  "rationale": "The two unresolved facts supplied (gauge verification, alarm silence) do not change what is done today. On gauge verification: the technician is already proceeding as a trained operator would given a zero reading and released interlock—there is no alternative action available to her at this moment regardless of whether the gauge was independently cross-checked; if it were faulty, the corrective action (recalibration/maintenance flag) is a future/administrative step, not a change to the present door-opening action, and the observation gives no basis to halt beyond what is already occurring. On the alarm: whether its silence was normal or a malfunction during a cycle that has already completed does not alter the present door-opening exposure, as explicitly and correctly noted by the first pass itself. Both facts are magnitude/verification-type uncertainties whose answer does not bifurcate the present action into two different courses. I also checked for an ungiven fact that might govern the decision: door-opening technique relative to hinge-side positioning is stated (she stands to the hinge side), gloves are stated present, so the thermal-burn control basis is established. No other fact appears necessary to determine a present safety/regulatory/control decision. Therefore the first pass's decision not to ask any clarifying question is correct.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 593
}
```

---

## 11. Neutral chronology — what fact each execution focused on

One line per execution. The "focused on" column names the fact each output actually reasoned
about, taken from that output's own words. No execution is marked correct or incorrect here.

| # | Execution | Draw | Output | Focused on |
|---|---|---|---|---|
| 1 | §152 first pass | R1 | one clarification asked | whether the over-temperature alarm is functional or was correctly silent |
| 2 | §153 first pass | R2 | no clarification asked; one uncertainty statement | whether the zero gauge was cross-verified, and whether steam is trapped in the load |
| 3 | §154 first pass | R3 | no clarification asked; one uncertainty statement | whether the zero gauge reading is reliable; alarm silence noted as not changing the action |
| 4 | §156 verifier v1 | R2 (VC-02) | ADD_OR_REPLACE_CLARIFICATION | whether the over-temperature alarm is functional |
| 5 | §156 verifier v1 | R3 (VC-13) | NO_CLARIFICATION_REQUIRED | the gauge-verification fact and the alarm silence; judged both action-invariant |
| 6 | §157 verifier v2 | R2 (VC-02) | NO_CLARIFICATION_REQUIRED, no nomination | the gauge/trapped-steam fact and the alarm; considered and declined to nominate any other |
| 7 | §157 verifier v2 | R3 (VC-13) | NO_CLARIFICATION_REQUIRED, no nomination | the gauge fact and the alarm; considered door-opening technique and declined to nominate |

Both §157 executions state in their own rationale that they performed the step-4 nomination
search. VC-02: *"I also considered whether there is a fact not raised that would change the
decision (e.g., whether the door opening itself is being done in a controlled/gradual manner to
vent any residual steam)"*. VC-13: *"I also checked for an ungiven fact that might govern the
decision: door-opening technique relative to hinge-side positioning is stated"*.

---

## 12. Term scan — where each term appears

Literal case-insensitive substring search across four surfaces: the observation; the governed
evidence; the deterministic result; and all seven model outputs above. Counts are occurrences,
not documents.

| Term | OBSERVATION | GOVERNED EVIDENCE | DETERMINISTIC RESULT | FIRST PASS §152 R1 | FIRST PASS §153 R2 | FIRST PASS §154 R3 | VERIFIER v1 VC-02 | VERIFIER v2 VC-02 | VERIFIER v1 VC-13 | VERIFIER v2 VC-13 |
|---|---|---|---|---|---|---|---|---|---|---|
| `cooling hold` | — | — | — | — | — | — | — | — | — | — |
| `cooling` | — | — | — | — | — | — | — | — | — | — |
| `cool` | — | — | — | — | — | — | 2 | — | — | — |
| `load side` | — | — | — | — | — | — | — | — | — | — |
| `load-side` | — | — | — | — | — | — | — | — | — | — |
| `chamber instrumentation` | — | — | — | — | — | — | — | — | — | — |
| `alarm` | 1 | — | — | 12 | 4 | 3 | 26 | 8 | 4 | 4 |
| `trapped steam` | — | — | — | — | 2 | — | — | — | — | — |
| `trapped` | — | — | — | — | 4 | — | — | 2 | — | — |

### The occurrences in full

**`cooling hold`** — 0 occurrences

- (none on any surface)

**`cooling`** — 0 occurrences

- (none on any surface)

**`cool`** — 2 occurrences

- *VERIFIER v1 VC-02*: …uld not be seen functioning: it is equally consistent with a properly cool load (alarm correctly silent because temperature never exceeded thres…
- *VERIFIER v1 VC-02*: …uld not be seen functioning: it is equally consistent with a properly cool load (alarm correctly silent because temperature never exceeded thres…

**`load side`** — 0 occurrences

- (none on any surface)

**`load-side`** — 0 occurrences

- (none on any surface)

**`chamber instrumentation`** — 0 occurrences

- (none on any surface)

**`alarm`** — 62 occurrences

- *OBSERVATION*: …zero. Through the whole of the cycle I watched, the over-temperature alarm did not sound. She is wearing a lab coat and heat-resistant gloves an…
- *FIRST PASS §152 R1*: …n":false}],"decisionCriticalClarifications":[{"clarificationId":"clar-alarm","question":"Was the over-temperature alarm's failure to sound during…
- *FIRST PASS §152 R1*: …[{"clarificationId":"clar-alarm","question":"Was the over-temperature alarm's failure to sound during the observed cycle due to a normal cycle pr…
- *FIRST PASS §152 R1*: …e observed cycle due to a normal cycle profile that never reached the alarm setpoint, or due to a fault in the alarm/sensor itself?","whyItMatter…
- *FIRST PASS §152 R1*: …ofile that never reached the alarm setpoint, or due to a fault in the alarm/sensor itself?","whyItMatters":"If the alarm did not sound because th…
- *FIRST PASS §152 R1*: …or due to a fault in the alarm/sensor itself?","whyItMatters":"If the alarm did not sound because the cycle simply never reached an over-temperat…
- *FIRST PASS §152 R1*: …er reached an over-temperature condition, no corrective action on the alarm system is needed. If the alarm failed to sound despite conditions tha…
- *FIRST PASS §152 R1*: …condition, no corrective action on the alarm system is needed. If the alarm failed to sound despite conditions that should have triggered it (a f…
- *FIRST PASS §152 R1*: …despite conditions that should have triggered it (a faulty sensor or alarm circuit), the autoclave is currently operating with a non-functional…
- *FIRST PASS §152 R1*: …t), the autoclave is currently operating with a non-functional safety alarm and must be removed from service or flagged for repair before further…
- *FIRST PASS §152 R1*: …,"criticality":"BLOCKING","evidenceGap":"Whether the over-temperature alarm is functional was not established; only that it did not sound during…
- *FIRST PASS §152 R1*: …rrent hazard. A genuine open question is whether the over-temperature alarm's silence during the cycle reflects normal operation or a latent alar…
- *FIRST PASS §152 R1*: …larm's silence during the cycle reflects normal operation or a latent alarm fault, which would determine whether the unit needs to be pulled from…
- *FIRST PASS §153 R2*: …,"startOffset":269,"endOffset":309,"quotedText":"the over-temperature alarm did not sound"}],"evidenceBasis":"The observation shows the technicia…
- *FIRST PASS §153 R2*: …g the door immediately after a cycle, and states the over-temperature alarm did not sound at any point during the cycle observed.","reasoning":"A…
- *FIRST PASS §153 R2*: …rd is present and being actively managed. The fact that the over-temp alarm never sounded during the cycle is a current gap in the alarm's verifi…
- *FIRST PASS §153 R2*: …ver-temp alarm never sounded during the cycle is a current gap in the alarm's verifiable function at the moment of highest thermal risk (door ope…
- *FIRST PASS §154 R3*: …is made."},"uncertainty":{"statements":["Whether the over-temperature alarm's silence throughout the observed cycle reflects a normal (non-alarmi…
- *FIRST PASS §154 R3*: …alarm's silence throughout the observed cycle reflects a normal (non-alarming) run or an alarm malfunction cannot be determined from the observa…
- *FIRST PASS §154 R3*: …oughout the observed cycle reflects a normal (non-alarming) run or an alarm malfunction cannot be determined from the observation alone, though t…
- *VERIFIER v1 VC-02*: …ict":"ADD_OR_REPLACE_CLARIFICATION","rationale":"The over-temperature alarm's failure to sound during the entire observed cycle is a control that…
- *VERIFIER v1 VC-02*: …seen functioning: it is equally consistent with a properly cool load (alarm correctly silent because temperature never exceeded threshold) and wi…
- *VERIFIER v1 VC-02*: …ause temperature never exceeded threshold) and with a failed/disabled alarm masking an actual over-temperature excursion. These two possibilities…
- *VERIFIER v1 VC-02*: …ursion. These two possibilities lead to different actions now: if the alarm is simply confirming normal operation, opening the door with PPE is f…
- *VERIFIER v1 VC-02*: …onfirming normal operation, opening the door with PPE is fine; if the alarm has failed and the load is in fact over-temperature or the cycle did…
- *VERIFIER v1 VC-02*: …-verification) targets the separate steam-release candidate, not this alarm-function gap. The steam-release/gauge-verification question itself is…
- *VERIFIER v1 VC-02*: …leted cycle plus PPE already govern that hazard's mitigation, but the alarm-silence fact is unaddressed and decision-relevant.","aboutUnresolvedF…
- *VERIFIER v1 VC-02*: …sidual","proposedClarification":{"question":"Did the over-temperature alarm fail to sound because the chamber never reached its trip threshold du…
- *VERIFIER v1 VC-02*: …s trip threshold during this cycle, or is there reason to believe the alarm itself is non-functional (e.g., last tested date, is it currently dis…
- *VERIFIER v1 VC-02*: …currently disabled or unresponsive to test)?","whyItMatters":"If the alarm is simply correctly silent because temperature stayed within normal r…
- *VERIFIER v1 VC-02*: …he current PPE-based practice of opening the door is adequate. If the alarm has failed or been disabled, the technician has no verified indicatio…
- *VERIFIER v1 VC-02*: …"HAZARD_SEVERITY","evidenceGap":"The observation states only that the alarm did not sound during the cycle watched; it does not establish whether…
- *VERIFIER v1 VC-02*: …her this is because temperature stayed below threshold or because the alarm is malfunctioning."},"boundaryAccepted":false,"boundaryViolations":["…
- *VERIFIER v1 VC-02*: …ict":"ADD_OR_REPLACE_CLARIFICATION","rationale":"The over-temperature alarm's failure to sound during the entire observed cycle is a control that…
- *VERIFIER v1 VC-02*: …seen functioning: it is equally consistent with a properly cool load (alarm correctly silent because temperature never exceeded threshold) and wi…
- *VERIFIER v1 VC-02*: …ause temperature never exceeded threshold) and with a failed/disabled alarm masking an actual over-temperature excursion. These two possibilities…
- *VERIFIER v1 VC-02*: …ursion. These two possibilities lead to different actions now: if the alarm is simply confirming normal operation, opening the door with PPE is f…
- *VERIFIER v1 VC-02*: …onfirming normal operation, opening the door with PPE is fine; if the alarm has failed and the load is in fact over-temperature or the cycle did…
- *VERIFIER v1 VC-02*: …-verification) targets the separate steam-release candidate, not this alarm-function gap. The steam-release/gauge-verification question itself is…
- *VERIFIER v1 VC-02*: …leted cycle plus PPE already govern that hazard's mitigation, but the alarm-silence fact is unaddressed and decision-relevant.","aboutUnresolvedF…
- *VERIFIER v1 VC-02*: …sidual","proposedClarification":{"question":"Did the over-temperature alarm fail to sound because the chamber never reached its trip threshold du…
- *VERIFIER v1 VC-02*: …s trip threshold during this cycle, or is there reason to believe the alarm itself is non-functional (e.g., last tested date, is it currently dis…
- *VERIFIER v1 VC-02*: …currently disabled or unresponsive to test)?","whyItMatters":"If the alarm is simply correctly silent because temperature stayed within normal r…
- *VERIFIER v1 VC-02*: …he current PPE-based practice of opening the door is adequate. If the alarm has failed or been disabled, the technician has no verified indicatio…
- *VERIFIER v1 VC-02*: …"HAZARD_SEVERITY","evidenceGap":"The observation states only that the alarm did not sound during the cycle watched; it does not establish whether…
- *VERIFIER v1 VC-02*: …her this is because temperature stayed below threshold or because the alarm is malfunctioning."}}}…
- *VERIFIER v2 VC-02*: …ot because it drives a different action now. Similarly, the over-temp alarm's silence during the cycle is a real gap in verifiable alarm function…
- *VERIFIER v2 VC-02*: …ver-temp alarm's silence during the cycle is a real gap in verifiable alarm function, but it does not by itself indicate the alarm failed to trig…
- *VERIFIER v2 VC-02*: …in verifiable alarm function, but it does not by itself indicate the alarm failed to trigger when it should have (no over-temp event may have oc…
- *VERIFIER v2 VC-02*: …hnician is already using heat-resistant PPE regardless of whether the alarm would have sounded. Neither unresolved fact, answered either way, cha…
- *VERIFIER v2 VC-02*: …ot because it drives a different action now. Similarly, the over-temp alarm's silence during the cycle is a real gap in verifiable alarm function…
- *VERIFIER v2 VC-02*: …ver-temp alarm's silence during the cycle is a real gap in verifiable alarm function, but it does not by itself indicate the alarm failed to trig…
- *VERIFIER v2 VC-02*: …in verifiable alarm function, but it does not by itself indicate the alarm failed to trigger when it should have (no over-temp event may have oc…
- *VERIFIER v2 VC-02*: …hnician is already using heat-resistant PPE regardless of whether the alarm would have sounded. Neither unresolved fact, answered either way, cha…
- *VERIFIER v1 VC-13*: …also released, corroborating de-pressurization. The over-temperature alarm silence is explicitly noted by the first pass as not changing the pre…
- *VERIFIER v1 VC-13*: …thermal/pressure exposure during opening, not the historical cycle's alarm performance. Neither fact, answered either way, changes what is being…
- *VERIFIER v1 VC-13*: …also released, corroborating de-pressurization. The over-temperature alarm silence is explicitly noted by the first pass as not changing the pre…
- *VERIFIER v1 VC-13*: …thermal/pressure exposure during opening, not the historical cycle's alarm performance. Neither fact, answered either way, changes what is being…
- *VERIFIER v2 VC-13*: …l,"rationale":"The two unresolved facts supplied (gauge verification, alarm silence) do not change what is done today. On gauge verification: the…
- *VERIFIER v2 VC-13*: …ation gives no basis to halt beyond what is already occurring. On the alarm: whether its silence was normal or a malfunction during a cycle that…
- *VERIFIER v2 VC-13*: …","rationale":"The two unresolved facts supplied (gauge verification, alarm silence) do not change what is done today. On gauge verification: the…
- *VERIFIER v2 VC-13*: …ation gives no basis to halt beyond what is already occurring. On the alarm: whether its silence was normal or a malfunction during a cycle that…

**`trapped steam`** — 2 occurrences

- *FIRST PASS §153 R2*: …at it is safe to open an autoclave, but gauge malfunction or residual trapped steam pockets in a load are a recognized latent hazard in autoclave operati…
- *FIRST PASS §153 R2*: …s being actively mitigated by PPE. A latent pressure-systems concern (trapped steam or gauge reliability) is noted at low confidence since the zero readi…

**`trapped`** — 6 occurrences

- *FIRST PASS §153 R2*: …at it is safe to open an autoclave, but gauge malfunction or residual trapped steam pockets in a load are a recognized latent hazard in autoclave o…
- *FIRST PASS §153 R2*: …gainst an independent measure or that the load itself was checked for trapped superheated liquids/steam.","confidence":"LOW","relationshipToDetermi…
- *FIRST PASS §153 R2*: …s being actively mitigated by PPE. A latent pressure-systems concern (trapped steam or gauge reliability) is noted at low confidence since the zero…
- *FIRST PASS §153 R2*: …independent indicator or whether residual steam pockets could remain trapped within the load itself."]}}…
- *VERIFIER v2 VC-02*: …reading was cross-verified, or whether residual steam pockets remain trapped in the load) does not change what is done today. The technician is al…
- *VERIFIER v2 VC-02*: …reading was cross-verified, or whether residual steam pockets remain trapped in the load) does not change what is done today. The technician is al…

---

## 13. Regulatory / evidentiary text bearing on the cooling-hold fact

**No regulatory or evidentiary text was supplied with this observation.** `governedStandards`
is empty on the row, on all three first-pass draws, and in the blinded verifier packet, where
`governedEvidence` is `[]` for both HS-H1 cases.

A search of the governed knowledge corpus under
`verification/hazlenz-governed-knowledge-growth-2026-08-19/` for the terms `autoclave`,
`sterilizer` and `pressure vessel` returns no match. Other rows in the same v9 fixture DO carry
governed records — HS-D1 carries `29 CFR 1910.106(e)(2)(ii)` and HS-M1 carries
`29 CFR 1910.146(c)(5)(ii)(C)` — so the absence here is specific to this row rather than a
property of the fixture.

The stated basis for the fact being decision-relevant is therefore the authoring rationale
reproduced in section 4–8 and nothing else. Whether that basis is sufficient is part of what is
being adjudicated.

---

## 14. Competing unresolved facts that could plausibly satisfy the same decision

Facts that appear in the record as candidates for "the fact that governs what is done at the
door". They are listed with their source and are **not** ranked, endorsed or excluded here.

- **C1. Whether the load was given a cooling hold appropriate to its contents before the door was opened**
  - appears in: the authored truth (v9 fixture, §156 truth manifest)
  - as recorded: named `REQUIRED_CONTROL`; raised by no execution
- **C2. Whether the over-temperature alarm is functional, or was correctly silent because the cycle never reached its setpoint**
  - appears in: §152 first pass (asked as a clarification); §156 v1 VC-02 (asked as a clarification); §153 and §154 uncertainty statements; §157 v2 both cases (considered, declined)
  - as recorded: labelled `REQUIRED_CONTROL` by §152 and `HAZARD_SEVERITY` by §156 v1
- **C3. Whether the zero chamber-pressure gauge reading was cross-verified against an independent indicator**
  - appears in: §153 and §154 first pass (candidate left INSUFFICIENT_EVIDENCE, plus an uncertainty statement); §156 v1 VC-13; §157 v2 both cases
  - as recorded: judged action-invariant by §156 v1 VC-13 and by both §157 v2 executions
- **C4. Whether residual steam pockets remain trapped within the load itself**
  - appears in: §153 first pass, inside the `cand-steam-release` reasoning and the uncertainty statement
  - as recorded: never separated from C3 in any output; not asked as a question by any execution
- **C5. Whether the door is being opened in a controlled or gradual manner to vent residual steam**
  - appears in: §157 v2 VC-02, raised inside the nomination search and declined
  - as recorded: the only fact any execution explicitly considered nominating and rejected
- **C6. Whether the trolley handling and hinge-side stance are the adequate control for the residual thermal exposure**
  - appears in: §152, §153 and §154 first pass (`thermal_burn` candidate, ACTIVE); §156 v1 VC-13
  - as recorded: treated as an established control rather than an open fact by every execution

Relationship between C1 and C3/C4, stated mechanically and without judging it: C1 is a fact
about the load's thermal state; C3 is a fact about the chamber instrument; C4 is a fact about
the load's pressure state. The authored `whyNotEstablished` asserts that a chamber gauge at
zero does not settle C1. No execution asserted the contrary and no execution asserted C1.

---

## HUMAN ADJUDICATION QUESTIONS

**A.** Is the authored cooling-hold / load-side fact genuinely unresolved from the observation and supplied evidence?

> 

**B.** Would the two plausible answer states materially change a current safety, regulatory or required-control decision?

> 

**C.** Is asking this fact necessary now?

> 

**D.** Is the cooling-hold / load-side selector uniquely appropriate?

> 

**E.** If not unique, what other selectors are equally valid?

> 

**F.** Did any supplied evidence already establish the authored fact?

> 

**G.** Would a competent safety professional reasonably be expected to infer that this is the missing fact without being prompted toward it?

> 

**H.** Should HS-H1 remain in a future semantic-accuracy denominator?

> 

### Allowed dispositions

Select exactly one. This packet does not select one and does not indicate a preference.

- [ ] `AUTHORING_VALID_UNIQUE_SELECTOR`
- [ ] `AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS`
- [ ] `AUTHORING_AMBIGUOUS`
- [ ] `AUTHORING_INVALID`
- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`

Reviewer: ______________________  Date: ____________

---

## Provenance of every block in this packet

| Artifact | SHA-256 |
|---|---|
| `backend/src/safescope-v2/expert-hazlenz/fixtures/hardened-development-set-v9.ts` | `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb` |
| `verification/expert-hazlenz-hardened-v13-baseline-2026-09-03/RUN-RECORDS.jsonl` | `09167f8710c13eea781685484e41377be74bbcca76a66b26b9f134c29b199289` |
| `verification/expert-hazlenz-hardened-v13-replicate2-2026-09-03/RUN-RECORDS.jsonl` | `521dc515c0c9c2d821b4bfbbe444cfecbe6a5336241a4da6ea901abc70d3650a` |
| `verification/expert-hazlenz-hardened-v13-replicate3-2026-09-03/RUN-RECORDS.jsonl` | `9e2328b93523adc92c07b767bc8bbf05a5037f129f324579e1ac7bb7d38a8bed` |
| `verification/expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-PACKET.json` | `75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a` |
| `verification/expert-hazlenz-verifier-accuracy-2026-09-03/TRUTH-MANIFEST.json` | `dbbe3361a3c407af6a06446024c8de6f78d8d15540a349702b9c1eac4855617c` |
| `verification/expert-hazlenz-verifier-accuracy-2026-09-03/SEALED-CASE-KEY.json` | `e05b2cc145f72635a4fb472a740ead118f681516f5eff3f41faa64072f414c45` |
| `verification/expert-hazlenz-verifier-accuracy-2026-09-03/VERIFIER-RESULTS.json` | `0dadc9228007484f5c7d991547976992d3ccccaf0fa02fe37a7f3ec2a6c61926` |
| `verification/expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-RESULTS.json` | `969d7ba69bd969438f0e7c3d74907513f4b1ea0eb9c2ee1934107e30b24e8479` |

`PROVIDER_CALLS_TO_BUILD_THIS_PACKET = 0`


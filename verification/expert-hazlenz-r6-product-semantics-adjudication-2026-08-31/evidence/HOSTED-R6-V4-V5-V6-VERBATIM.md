# R6 hosted responses — verbatim, prompt v4 / v5 / v6

Extracted programmatically from the three frozen transport JSONL files. Not transcribed by hand.
Zero hosted calls were made by this adjudication.


---

## v4 (§110, prompt hazlenz.expert.prompt.v4)

Source: `verification/expert-hazlenz-r4-r6-targeted-hosted-confirmation-2026-08-31/transport/targeted-confirmation.jsonl`

### rep 1  — outcome `ANALYZED`

**summary:** The deterministic finding of controlled lockout/tagout is well supported: the press was locked out, tagged, stored energy bled down and verified at zero, and isolation was independently verified by a second worker — a strong control sequence. However, the guard removal introduces a machine guarding consideration that is not addressed by the lockout finding alone, since the hazard of an unguarded machine reappears once work concludes and the machine is restored to service. Confirming guard reinstallation before re-energization would close this gap.

**candidates (1):**

```json
[
  {
    "candidateKey": "c1",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "UNKNOWN",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 113,
        "endOffset": 134,
        "quotedText": "the guard was removed"
      }
    ],
    "evidenceBasis": "The guard was removed to perform work on the press, which exposes machine hazards (pinch points, stored mechanical hazards) unless the guard is restored before re-energization.",
    "reasoning": "Removing a machine guard, even with lockout/tagout in place, creates a machine guarding hazard if the guard is not properly reinstalled before the machine is returned to service. The observation does not confirm the guard was replaced prior to restart.",
    "confidence": "MODERATE",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "q1",
    "question": "Will the guard be reinstalled and verified before lockout is removed and the press is re-energized?",
    "whyItMatters": "If the guard is not restored before restart, workers could be exposed to a machine guarding hazard once the press is re-energized, even though lockout/tagout was properly applied during the guard removal.",
    "affectedDecision": "REQUIRED_CONTROL",
    "criticality": "IMPORTANT",
    "evidenceGap": "The observation describes the guard being removed but does not state whether or when it will be reinstalled prior to restart."
  },
  {
    "clarificationId": "q2",
    "question": "What task is being performed while the guard is removed, and is any residual stored energy source (e.g., springs, counterweights, or pneumatic accumulators) present beyond what was bled down?",
    "whyItMatters": "Confirms whether the zero-energy verification captured all forms of stored energy specific to this press, ensuring the lockout is complete and no additional isolation steps are needed.",
    "affectedDecision": "HAZARD_SEVERITY",
    "criticality": "ROUTINE",
    "evidenceGap": "The observation states stored energy was bled down and verified at zero but does not specify which energy sources (electrical, hydraulic, pneumatic, mechanical) were addressed."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

### rep 2  — outcome `ANALYZED`

**summary:** The deterministic finding correctly identifies a well-executed lockout/tagout with verified zero energy state and independent verification. The additional consideration here is the guard removal itself: while appropriate during the isolated work, it introduces a machine guarding exposure that will materialize if the guard is not restored before the press is returned to service, which the observation does not address.

**candidates (1):**

```json
[
  {
    "candidateKey": "c1",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "UNKNOWN",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 106,
        "endOffset": 134,
        "quotedText": "before the guard was removed"
      }
    ],
    "evidenceBasis": "The guard was removed to perform work on the press, and there is no statement about whether or when the guard will be reinstalled before the press is returned to service.",
    "reasoning": "Removal of a machine guard creates a point-of-operation exposure once the press is re-energized. If the guard is not reinstalled and verified before lockout is removed, workers could be exposed to nip points, crush points or other mechanical hazards on subsequent restart.",
    "confidence": "MODERATE",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "q1",
    "question": "Will the guard be reinstalled and verified in place before the lockout is removed and the press is re-energized?",
    "whyItMatters": "If the guard is not restored prior to restart, workers would be exposed to the press point-of-operation hazard even though lockout was properly applied for the current work; this determines whether a machine guarding hazard will exist at the moment of return to service.",
    "affectedDecision": "REQUIRED_CONTROL",
    "criticality": "IMPORTANT",
    "evidenceGap": "Observation describes guard removal for the isolation/verification work but does not state the plan or procedure for guard restoration before re-energization."
  },
  {
    "clarificationId": "q2",
    "question": "What is the work being performed while the guard is removed, and is there any residual exposure to workers accessing the point of operation during this window?",
    "whyItMatters": "Confirms whether any worker is currently exposed to mechanical hazards inside the guarded area despite lockout being applied, which affects severity and exposure assessment.",
    "affectedDecision": "EXPOSURE",
    "criticality": "ROUTINE",
    "evidenceGap": "No description of the task being performed inside the guard opening or who is positioned near the point of operation."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

### rep 3  — outcome `ANALYZED`

**summary:** The observation describes a well-executed lockout/tagout with stored energy verified at zero and independent verification by a second worker, consistent with the deterministic CONTROLLED finding. The one open item is the guard that was removed to perform the work — its current state and the plan for reinstatement before the press is restarted are not addressed, which is a decision-relevant gap rather than a settled hazard. No cross-hazard interactions or disagreements with the deterministic result are identified.

**candidates (1):**

```json
[
  {
    "candidateKey": "c1",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "UNKNOWN",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 113,
        "endOffset": 134,
        "quotedText": "the guard was removed"
      }
    ],
    "evidenceBasis": "The guard was removed to access the press after lockout, but the observation does not state whether the guard has been reinstalled or whether work is complete, leaving an open question about current guarding status.",
    "reasoning": "Once lockout is released and the machine is returned to service, the guard must be back in place before operation; the observation only confirms guard removal was done safely under LOTO, not that guarding has been restored for post-work operation.",
    "confidence": "LOW",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "q1",
    "question": "What task is being performed now that the guard is removed and the press is locked out, and will the guard be reinstalled and verified before the press is returned to service?",
    "whyItMatters": "If the guard is not reinstalled and re-verified prior to re-energizing, a machine guarding hazard would exist despite the current lockout being properly controlled.",
    "affectedDecision": "HAZARD_EXISTENCE",
    "criticality": "IMPORTANT",
    "evidenceGap": "Observation confirms guard removal during a locked-out state but does not describe the plan or verification for guard reinstallation before restart."
  },
  {
    "clarificationId": "q2",
    "question": "Who has authority to remove the lockout/tag, and is there a written or verified procedure confirming all workers are clear before re-energization?",
    "whyItMatters": "Determines whether the eventual return-to-service step will maintain the same level of control demonstrated during isolation, affecting exposure to the same workers or others.",
    "affectedDecision": "REQUIRED_CONTROL",
    "criticality": "ROUTINE",
    "evidenceGap": "No information provided about the restart/re-energization procedure or who is authorized to remove the tag."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

---

## v5 (§112, prompt hazlenz.expert.prompt.v5)

Source: `verification/expert-hazlenz-v5-temporal-state-hosted-confirmation-2026-08-30/transport/v5-confirmation.jsonl`

### rep 1  — outcome `ANALYZED`

**summary:** The lockout/tagout process described is thorough and controlled — energy was bled down, verified at zero, and independently confirmed by a second worker. However, the guard removal that followed introduces a separate, current machine guarding exposure that is not addressed by the lockout finding alone. Clarifying the scope of work and reinstallation plan, plus confirming no bystander exposure, would round out the picture for this observation.

**candidates (1):**

```json
[
  {
    "candidateKey": "c1",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "ACTIVE",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 113,
        "endOffset": 134,
        "quotedText": "the guard was removed"
      }
    ],
    "evidenceBasis": "The observation states the guard was removed to access the press after lockout, which is a current condition of an unguarded machine even though the lockout itself is controlled.",
    "reasoning": "With the guard removed, the point of operation or moving parts of the press are currently exposed. Even though the machine is de-energized under LOTO, the guard removal is a present physical state that constitutes a machine guarding exposure if any re-energization occurs, or if other workers approach assuming the machine is safe. This is a distinct hazard family from lockout/tagout itself.",
    "confidence": "MODERATE",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "q1",
    "question": "What task is being performed with the guard removed, and will the guard be reinstalled before the press is returned to service?",
    "whyItMatters": "Determines the duration and nature of the current guarding gap and whether additional controls (e.g., barricading the point of operation, restricting access) are needed while the guard is off.",
    "affectedDecision": "REQUIRED_CONTROL",
    "criticality": "IMPORTANT",
    "evidenceGap": "The observation confirms the guard was removed but does not state what work is being done or the plan for reinstallation."
  },
  {
    "clarificationId": "q2",
    "question": "Are there other workers in the area who could be exposed to the unguarded press while maintenance is in progress?",
    "whyItMatters": "Affects whether additional exposure controls, signage, or barricading are needed for personnel other than the two workers who verified isolation.",
    "affectedDecision": "EXPOSURE",
    "criticality": "ROUTINE",
    "evidenceGap": "The observation only references the two workers involved in lockout verification; no information on other personnel in proximity to the press."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

### rep 2  — outcome `ANALYZED`

**summary:** The deterministic finding correctly identifies a controlled lockout/tagout condition, supported by verification of zero energy and a second-worker check. However, the guard was removed as part of this work, which introduces a distinct machine guarding exposure worth tracking separately while the guard remains off. Confirming whether the guard has since been reinstalled and whether a lock (not just a tag) was applied would close out remaining exposure and compliance questions.

**candidates (1):**

```json
[
  {
    "candidateKey": "c1",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "ACTIVE",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 106,
        "endOffset": 134,
        "quotedText": "before the guard was removed"
      }
    ],
    "evidenceBasis": "The observation states the guard was removed to perform work on the press.",
    "reasoning": "With the guard removed, even though LOTO is controlled, the point of operation or moving parts may be exposed to workers if the machine were to unexpectedly become accessible or if work requires reaching into the guarded area. This is a distinct hazard family from lockout/tagout and should be tracked separately for the duration the guard is off.",
    "confidence": "MODERATE",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "q1",
    "question": "Is the guard still removed at the time of this observation, and if so, what is the expected duration and is the area barricaded or restricted while it is off?",
    "whyItMatters": "If the guard remains off with LOTO in place for servicing, exposure to the machine's moving parts or point of operation may exist for other workers in the area even though the press itself is de-energized and isolated; this determines whether an interim guarding or access control is needed.",
    "affectedDecision": "EXPOSURE",
    "criticality": "IMPORTANT",
    "evidenceGap": "The observation states the guard was removed but does not state whether it has been reinstalled or whether the work is complete."
  },
  {
    "clarificationId": "q2",
    "question": "Is the lockout device (lock) itself, not just the tag, applied to the energy-isolating means?",
    "whyItMatters": "A tag alone without a physical lock may not meet the required level of control if the isolating device is capable of being locked; this affects whether the isolation is fully compliant.",
    "affectedDecision": "REQUIRED_CONTROL",
    "criticality": "ROUTINE",
    "evidenceGap": "The observation mentions 'the supervisor tag applied' but does not explicitly confirm a lock was also applied."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

### rep 3  — outcome `ANALYZED`

**summary:** The lockout/tagout control described is thorough and current — locked out, tagged, stored energy bled down and verified at zero, with independent second-worker verification — so no additional concern is raised on that front. However, the observation also states the guard was removed, which introduces a separate, current machine guarding exposure at the point of operation independent of the energy-control status, and it is unclear whether access to that area is otherwise restricted while the guard is off.

**candidates (1):**

```json
[
  {
    "candidateKey": "c1",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "ACTIVE",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 113,
        "endOffset": 134,
        "quotedText": "the guard was removed"
      }
    ],
    "evidenceBasis": "The observation states the guard was removed to perform work on the press, which is a current condition once lockout is in place.",
    "reasoning": "With the guard removed, there is a machine guarding exposure at the point of operation for any worker approaching the press during the work, even though lockout/tagout controls are in place for stored/electrical energy. The guard's absence itself is a distinct hazard from the energy-control hazard and should be tracked until the guard is reinstalled and verified.",
    "confidence": "MODERATE",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "q1",
    "question": "Is access to the press point of operation restricted (e.g., barricaded or attended) while the guard remains off?",
    "whyItMatters": "If the area is not restricted, workers other than the two verifying isolation could be exposed to the unguarded point of operation, changing the exposure assessment even though lockout is in place.",
    "affectedDecision": "EXPOSURE",
    "criticality": "IMPORTANT",
    "evidenceGap": "The observation does not state whether the area around the removed guard is barricaded, signed, or otherwise controlled for incidental exposure."
  },
  {
    "clarificationId": "q2",
    "question": "What task is being performed with the guard removed, and will the guard be reinstalled and function-tested before the press is returned to service?",
    "whyItMatters": "Confirms the scope of work and ensures a plan exists to restore the guard before re-energization, which affects whether the current state is temporary and controlled or an ongoing gap.",
    "affectedDecision": "REQUIRED_CONTROL",
    "criticality": "ROUTINE",
    "evidenceGap": "The observation does not describe the maintenance task being performed or the plan for guard reinstallation."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

---

## v6 (§114, prompt hazlenz.expert.prompt.v6)

Source: `verification/expert-hazlenz-v6-hazard-actuality-hosted-confirmation-2026-08-30/transport/v6-confirmation.jsonl`

### rep 1  — outcome `ANALYZED`

**summary:** The core lockout/tagout sequence described — locked out, tagged, energy bled down, verified at zero, and independently re-verified by a second worker — is a well-executed control and is already reflected as CONTROLLED in the deterministic findings. However, the guard was removed to perform this work, which introduces a separate, currently-open machine guarding exposure at the point of operation for the duration servicing is underway; this warrants confirmation that the guard will be restored before re-energization. No cross-hazard interaction or disagreement with the deterministic result is identified.

**candidates (1):**

```json
[
  {
    "candidateKey": "guard-removed-exposure",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "ACTIVE",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 106,
        "endOffset": 134,
        "quotedText": "before the guard was removed"
      }
    ],
    "evidenceBasis": "The observation states the guard was removed to allow access to the press. With the guard off, the point of operation or moving parts (once re-energized) would be exposed. This is a distinct hazard family from lockout/tagout itself.",
    "reasoning": "Guard removal creates a machine guarding gap at the point of operation. Although lockout/tagout is controlled per the deterministic finding, the guard-removed condition is a separate physical hazard exposure that exists for the duration the guard is off, independent of the energy control status.",
    "confidence": "MODERATE",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "guard-reinstall-timing",
    "question": "Is work being performed inside the guarded area now, and will the guard be reinstalled before the lockout is removed and the press re-energized?",
    "whyItMatters": "If the guard remains off when energy control is later removed, workers would be exposed to unguarded moving parts at re-energization; confirming reinstallation before re-energization determines whether an additional control gap exists at that transition.",
    "affectedDecision": "REQUIRED_CONTROL",
    "criticality": "IMPORTANT",
    "evidenceGap": "The observation does not state whether the guard will be reinstalled before lockout removal/re-energization."
  },
  {
    "clarificationId": "authorized-employees",
    "question": "Are only authorized employees performing work inside the guard opening while the lockout is in effect?",
    "whyItMatters": "Confirms exposure is limited to authorized personnel and that no other workers could approach the de-guarded point of operation during the servicing.",
    "affectedDecision": "EXPOSURE",
    "criticality": "ROUTINE",
    "evidenceGap": "The observation does not identify who is working at the point of operation or whether access is restricted."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

### rep 2  — outcome `ANALYZED`

**summary:** The lockout/tagout process described is thorough and well-controlled: the press was locked out, tagged, stored energy bled down and verified at zero, and isolation double-checked by a second worker. However, the observation also states the guard was removed to perform the work, which is a distinct current condition from the energy isolation and warrants confirmation that the opening is controlled or access restricted while exposed.

**candidates (1):**

```json
[
  {
    "candidateKey": "guard-removed-machine-guarding",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "ACTIVE",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 106,
        "endOffset": 134,
        "quotedText": "before the guard was removed"
      }
    ],
    "evidenceBasis": "The observation states the guard was removed from the press to perform work, which is the current state at the point described.",
    "reasoning": "With the guard removed, the machine's point of operation or moving parts are currently unguarded even though lockout/tagout is in place. Guarding and energy control are distinct hazard families - the guard removal is a current physical exposure to anyone who could contact the machine, separate from the isolation status of the stored energy.",
    "confidence": "MODERATE",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "guard-reinstall-status",
    "question": "Is the guard still off the press, and if so, is the work area barricaded or is access otherwise restricted while it remains removed?",
    "whyItMatters": "If the guard remains off with no barricade or restricted access, workers could be exposed to the point of operation even though the machine is de-energized and isolated; if the guard has since been reinstalled or access is restricted, no further action is needed.",
    "affectedDecision": "EXPOSURE",
    "criticality": "IMPORTANT",
    "evidenceGap": "The observation states the guard was removed to perform work but does not state whether it was reinstalled or whether the opening is otherwise protected."
  },
  {
    "clarificationId": "work-scope-nature",
    "question": "What task is being performed with the guard removed, and is any other machine in the area still energized nearby?",
    "whyItMatters": "Determines whether additional hazards (e.g., adjacent energized equipment, tooling hazards) exist during the guard-removed work window.",
    "affectedDecision": "HAZARD_SEVERITY",
    "criticality": "ROUTINE",
    "evidenceGap": "The observation does not describe the nature of the work being performed behind the removed guard."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

### rep 3  — outcome `ANALYZED`

**summary:** The lockout/tagout process described is thorough and properly controlled: locked out, tagged, stored energy bled down and verified at zero, and independently double-checked by a second worker. The one open item is the guard removal itself, which is a distinct hazard family (machine guarding) from lockout/tagout — its current status (reinstalled vs. still open) and the nature of any ongoing work at the point of operation are not stated, so this is raised as a low-confidence candidate pending confirmation rather than an active finding.

**candidates (1):**

```json
[
  {
    "candidateKey": "guard-removed-current",
    "hazardFamily": "machine_guarding",
    "assertedConditionState": "ACTIVE",
    "groundingStatus": "EXACT_QUOTE_SUPPLIED",
    "evidence": [
      {
        "sourceId": "obs-1",
        "startOffset": 106,
        "endOffset": 134,
        "quotedText": "before the guard was removed"
      }
    ],
    "evidenceBasis": "The guard was removed to perform work on the press. Even though lockout/tagout was properly applied and verified, the point of operation or moving parts normally covered by the guard are currently exposed while the guard is off.",
    "reasoning": "A removed guard is a current physical exposure at the point of operation, independent of whether the energy source is isolated. If the guard remains off, personnel working at the machine face an exposure to any residual mechanical hazard (e.g., gravity-fed components, unexpected motion) not addressed by electrical/stored-energy lockout alone.",
    "confidence": "LOW",
    "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
    "requiresUserConfirmation": true
  }
]
```

**clarifications:**

```json
[
  {
    "clarificationId": "guard-reinstall-status",
    "question": "Has the guard been reinstalled, or is work still ongoing with the guard off and lockout still in place?",
    "whyItMatters": "If work is complete and the guard has been reinstalled with lockout removed following proper restoration procedures, there is no current guarding hazard. If the guard remains off while work continues, the current exposure is to the point of operation itself, which is a distinct hazard from the lockout/tagout status already found.",
    "affectedDecision": "HAZARD_EXISTENCE",
    "criticality": "IMPORTANT",
    "evidenceGap": "Observation states the guard was removed for the lockout procedure but does not state whether the guard is currently off, being worked under, or has since been reinstalled."
  },
  {
    "clarificationId": "scope-of-work-behind-guard",
    "question": "What task is being performed now that the guard is removed, and is anyone currently positioned at the point of operation?",
    "whyItMatters": "Determines whether there is an actual current worker exposure to the unguarded point of operation that would require additional controls beyond lockout/tagout.",
    "affectedDecision": "EXPOSURE",
    "criticality": "ROUTINE",
    "evidenceGap": "No description of the work being performed behind the removed guard or who, if anyone, is near the point of operation."
  }
]
```

**crossHazardInsights:** []  
**disagreements:** []

---

## Candidate-field comparison across all nine reps

| prompt | rep | family | assertedConditionState | confidence | relationship | requiresUserConfirmation | grounding |
|---|---|---|---|---|---|---|---|
| v4 | 1 | machine_guarding | UNKNOWN | MODERATE | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |
| v4 | 2 | machine_guarding | UNKNOWN | MODERATE | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |
| v4 | 3 | machine_guarding | UNKNOWN | LOW | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |
| v5 | 1 | machine_guarding | ACTIVE | MODERATE | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |
| v5 | 2 | machine_guarding | ACTIVE | MODERATE | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |
| v5 | 3 | machine_guarding | ACTIVE | MODERATE | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |
| v6 | 1 | machine_guarding | ACTIVE | MODERATE | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |
| v6 | 2 | machine_guarding | ACTIVE | MODERATE | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |
| v6 | 3 | machine_guarding | ACTIVE | LOW | ADDITIONAL_TO_DETERMINISTIC | true | EXACT_QUOTE_SUPPLIED |

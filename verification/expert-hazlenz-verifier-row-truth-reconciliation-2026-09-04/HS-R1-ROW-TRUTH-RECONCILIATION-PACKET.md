# HS-R1 — VERIFIER ROW-TRUTH RECONCILIATION PACKET

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
| row | `HS-R1` |
| authored class | `FORBIDDEN` — asserts NO fact in the observation is decision-critical |
| fixture form | `SEVERITY_REFINEMENT_ONLY` |
| blinded draws | VC-05 (R1), VC-10 (R2), VC-15 (R3) |
| in primary denominator | VC-05, VC-10, VC-15 |
| excluded from primary | (none) |
| verifier executions covered | 6 (3 draws × v1 and v2) |

---

## 1. Exact observation

Fixture `hazlenz.expert.hardened-development.fixtures.v9`, file sha256 `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb`
Jurisdiction `osha-general-industry`  ·  387 characters

> A groundworker is using a petrol cut-off saw to cut kerbs in the compound. He is wearing goggles, gloves, ear defenders and a fitted FFP3 mask, and the saw's water suppression is connected and running with visible water at the blade. He is cutting in the open air with nobody else within fifteen metres. The observation does not record how many kerbs he is cutting today or for how long.

Allowed hazard families: `chemical_inhalation_contact`, `respiratory_protection`, `noise_exposure`, `fall_protection`

---

## 2. Deterministic result and governed evidence available to the first pass

- **§152 R1** — families emitted: `hot_work`  ·  life-critical: `(none)`
- **§153 R2** — families emitted: `hot_work`  ·  life-critical: `(none)`
- **§154 R3** — families emitted: `hot_work`  ·  life-critical: `(none)`

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

**The tempting question the author expected a model to ask:** how many kerbs is he cutting and for how long, and does the duration change the control required?

**Why the author says it is not decision-critical:**

> every control duration would bear on is already in place and observed: water suppression running with visible water at the blade, a fitted FFP3, hearing protection, open air and fifteen metres to the nearest person. A longer or shorter task selects no different action at this cut, and the corrective step at any duration is the same as the current arrangement.

**What the author says makes it settled:**

> the unknown is duration alone, which is magnitude; the seven NOT-DECISION-CRITICAL shapes name severity refinement that does not change what is done now, and every control the magnitude would govern is stated as present and in use.

**The §156 truth manifest's own restatement, per draw:**

- `VC-05`: The retained unknown is cutting duration and quantity. Every control duration would bear on is already observed in use: water suppression running with visible water at the blade, a fitted FFP3, hearing protection, open air, fifteen metres to the nearest person. A longer or shorter task selects no different action at this cut.
- `VC-10`: Same observation as VC-05, a different draw. Duration alone is magnitude; every control it would govern is stated present and in use.
- `VC-15`: Same observation as VC-05, a different draw. The retained unknown is cumulative exposure duration, which refines severity and changes nothing about what is done now.

### The row-level truth record

```json
{
  "presentHazardFamilies": [],
  "defensibleHazardFamilies": [
    "chemical_inhalation_contact",
    "respiratory_protection",
    "noise_exposure"
  ],
  "forbiddenHazardFamilies": [
    "fall_protection"
  ],
  "negatedOrSafeStateFamilies": [
    "chemical_inhalation_contact"
  ],
  "lifeCriticalHazardFamilies": [],
  "decisionCriticalGaps": []
}
```

### The authoring rationale

> THE §151 RESIDUAL-DEFECT PROBE. Duration and quantity are the archetypal magnitude unknown, and the seven NOT-DECISION-CRITICAL shapes name severity refinement explicitly. Every control that duration would bear on -- water suppression, FFP3, hearing protection, open air, distance from others -- is stated as PRESENT AND IN USE, so no duration changes what is done at this cut today. THIS IS THE ROW A v14 CONSEQUENCE-MAGNITUDE REPAIR MUST MOVE, and under v13 it is EXPECTED TO FAIL on the CR-G1 / RB-F1 pattern. Recording that expectation here means a failure confirms the §151 diagnosis rather than surprising it.

### The review signatures recorded at authoring time

These are the author's own checks. They are part of the material under adjudication, not
evidence that the adjudication is settled.

- **ESTABLISHED_OR_DECISION_INVARIANT** — Duration is genuinely unknown and every control it would bear on is stated as present and in use, so the answer selects no different action.
- **NO_UNSTATED_PREMISE** — The invariance rests on stated facts — suppression running with visible water, FFP3 fitted, open air, fifteen metres of separation — not on an assumption about exposure limits.
- **NO_SIBLING_DECISION_CRITICAL_GAP** — I considered whether the FFP3 is face-fitted and closed it deliberately by writing "fitted"; leaving that open would have created a real RB-H1-class gap and invalidated the control.
- **WORDING_CREATES_NO_OPPORTUNITY** — Every control carries its state in the same sentence that introduces it, and no entity is named whose condition is left open.
- **ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED** — The advertised absence is duration, and the invariance is demonstrated in the same observation by the suppression running with visible water and the FFP3 being fitted and worn — the §151 J-class condition RB-F1 failed.

---

## 4. Stored first-pass outputs

First-pass prompt v13, analysis contract `analysis.v2`, model `claude-sonnet-5`.

### §152 — draw R1 (blinded as VC-05)

`verification/expert-hazlenz-hardened-v13-baseline-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `09167f8710c13eea781685484e41377be74bbcca76a66b26b9f134c29b199289`  ·  18210 in / 1108 out  ·  $0.0475

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-R1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "cand-silica",
      "hazardFamily": "respiratory_protection",
      "assertedConditionState": "CONTROLLED",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 124,
          "endOffset": 142,
          "quotedText": "a fitted FFP3 mask"
        },
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 158,
          "endOffset": 232,
          "quotedText": "water suppression is connected and running with visible water at the blade"
        }
      ],
      "evidenceBasis": "The text states a fitted FFP3 mask is worn and that water suppression is connected and running with visible water at the blade, both of which are controls relevant to respirable dust generated by cutting kerbs.",
      "reasoning": "Cutting kerbs (concrete/masonry) with a cut-off saw generates respirable crystalline silica dust; the observation shows both engineering control (water suppression) and PPE (FFP3) actively in use, indicating the inhalation hazard is being controlled rather than left unmitigated.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "cand-noise",
      "hazardFamily": "noise_exposure",
      "assertedConditionState": "CONTROLLED",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 106,
          "endOffset": 119,
          "quotedText": "ear defenders"
        }
      ],
      "evidenceBasis": "The text states ear defenders are worn while operating the petrol cut-off saw.",
      "reasoning": "Petrol cut-off saws are high-noise tools; the worker is wearing ear defenders, indicating the noise exposure hazard is currently controlled by PPE.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The deterministic finding correctly flags hot work from the petrol cut-off saw; alongside this, the observation shows the associated respirable dust and noise hazards inherent to kerb-cutting are currently being controlled — water suppression is running and an FFP3 mask is fitted for dust, and ear defenders are worn for noise. No decision-critical gaps arise from the unstated duration or kerb count, since neither would change the current control picture: PPE and engineering controls are already in place and no one else is within exposure range. No cross-hazard interaction is established beyond controls already described, and no regulatory record was supplied to assess compliance against."
  },
  "uncertainty": {
    "statements": [
      "Duration and quantity of cutting are not recorded, but this does not change the current control assessment since PPE and water suppression are already confirmed in use."
    ]
  }
}
```

### §153 — draw R2 (blinded as VC-10)

`verification/expert-hazlenz-hardened-v13-replicate2-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `521dc515c0c9c2d821b4bfbbe444cfecbe6a5336241a4da6ea901abc70d3650a`  ·  18210 in / 489 out  ·  $0.04131

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-R1",
  "outcome": "NOTHING_TO_ADD",
  "expertHazardCandidates": [],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The groundworker is using a petrol cut-off saw (hot work, already flagged) with appropriate respiratory (FFP3), eye, hand and hearing protection in place, water suppression running to control dust, and no bystanders within fifteen metres. The observation as written shows the relevant exposure pathways for silica dust, noise and eye/hand contact already controlled by the PPE and wet-cutting method described, so no additional hazard candidates or decision-critical questions arise from this text. The unstated duration or quantity of cutting does not change any current control decision, since the controls described (mask, water suppression, isolation distance) apply regardless of task length."
  },
  "uncertainty": {
    "statements": [
      "The observation does not state how long the cutting task will continue or how many kerbs remain, but this affects only duration of exposure, not the presence or adequacy of the controls already described."
    ]
  }
}
```

### §154 — draw R3 (blinded as VC-15)

`verification/expert-hazlenz-hardened-v13-replicate3-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `9e2328b93523adc92c07b767bc8bbf05a5037f129f324579e1ac7bb7d38a8bed`  ·  18210 in / 1100 out  ·  $0.047420000000000004

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-R1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "cand-silica-dust",
      "hazardFamily": "respiratory_protection",
      "assertedConditionState": "CONTROLLED",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 148,
          "endOffset": 232,
          "quotedText": "the saw's water suppression is connected and running with visible water at the blade"
        },
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 124,
          "endOffset": 142,
          "quotedText": "a fitted FFP3 mask"
        }
      ],
      "evidenceBasis": "The text states water suppression is connected and running with visible water at the blade, and that the worker is wearing a fitted FFP3 mask, both of which are controls for the respirable dust generated by cutting kerbs (concrete/masonry) with a petrol saw.",
      "reasoning": "Cutting kerbs with a petrol cut-off saw generates respirable crystalline silica dust. The observation shows two layered controls in place (wet cutting and fitted FFP3 respirator), so the hazard is present but appears controlled at the moment observed.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "cand-noise",
      "hazardFamily": "noise_exposure",
      "assertedConditionState": "CONTROLLED",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 106,
          "endOffset": 119,
          "quotedText": "ear defenders"
        }
      ],
      "evidenceBasis": "The text states the worker is wearing ear defenders while operating a petrol cut-off saw, a known high-noise tool.",
      "reasoning": "Petrol cut-off saws produce high noise levels; hearing protection is stated as worn, so the hazard exists but is controlled as observed.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The observation describes a groundworker cutting kerbs with a petrol cut-off saw, which the deterministic engine correctly flags as hot work. Alongside this, the task creates respirable dust and high noise exposure, but both appear controlled at the time observed through running water suppression plus a fitted FFP3 mask, and worn ear defenders. No decision-critical facts are missing: the observation gives enough to see that the relevant controls are in place, and the unspecified duration or quantity of kerbs cut would not change what is done today."
  },
  "uncertainty": {
    "statements": [
      "The observation does not record how long or how many kerbs are being cut, which affects cumulative exposure duration but not the presence or adequacy of the controls observed at this moment."
    ]
  }
}
```

---

## 5. Verifier outputs

### VC-05 (R1)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "Duration and quantity of cutting are not recorded, but this does not change the current control assessment since PPE and water suppression are already confirmed in use."
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
  "aboutUnresolvedFactRef": "uncertainty:0",
  "rationale": "The unresolved fact (duration/quantity of cutting) is a magnitude detail. All relevant controls—FFP3 mask, running water suppression, ear defenders, and distance from bystanders—are already stated as present and in use regardless of how long or how many kerbs are cut. Answering the duration/count either way would not change the current control assessment or trigger a different action, since no threshold-dependent control is left open. This is a case where a genuinely unresolved fact does not change what is done now, so no clarification is needed.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 302
}
```

**§157 verifier v2**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "uncertainty:0",
  "rationale": "The observation establishes all relevant controls as currently in use: fitted FFP3 mask, running water suppression with visible water at the blade (silica dust), ear defenders (noise), goggles and gloves, and open-air cutting with no one within 15m (exposure). The one unresolved fact flagged by the first pass — duration/quantity of kerbs cut — is a magnitude fact. It would scale exposure time but does not change what is done today: the controls that would be required regardless of duration (water suppression, FFP3, ear defenders, PPE) are already in place and observed active. There is no stated threshold (e.g., a permissible exposure limit trigger, a required air monitoring point, or a mandated break schedule) that duration would cross to require a different action. Reviewing the observation for a fact not raised by the first pass: no other unresolved fact appears to govern a hazard/regulatory decision — PPE fit, water suppression operation, and isolation distance are all directly stated as present and functioning, not merely inferred from an obstructed or unverifiable indicator. There is no hidden-failure-mode fact (e.g., an alarm that didn't sound) analogous to the sightline example; the controls are affirmatively observed working (visible water at blade, mask fitted, ear defenders worn). Therefore the first pass correctly asked no clarifying question, and the flagged uncertainty is real but immaterial to today's action.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 650
}
```

### VC-10 (R2)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "The observation does not state how long the cutting task will continue or how many kerbs remain, but this affects only duration of exposure, not the presence or adequacy of the controls already described."
    }
  ],
  "firstPassClarificationsAsked": [],
  "triggerConditions": [
    "T_RETAINED_UNKNOWN_WITHOUT_QUESTION",
    "T_WHOLLY_EMPTY_ANALYSIS"
  ]
}
```

**§156 verifier v1**

```json
{
  "verdict": "VERIFIED_AS_IS",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "uncertainty:0",
  "rationale": "The only unresolved fact is task duration/quantity, a magnitude detail. All relevant controls (FFP3 mask, water suppression for dust, goggles, gloves, ear defenders, 15m isolation distance) are already stated as present and in use regardless of how long the task continues, so an answer either way would not change any control or action taken now. No other fact in the observation is left ambiguous in a decision-relevant way. Correctly asking nothing is appropriate here.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 281
}
```

**§157 verifier v2**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "uncertainty:0",
  "rationale": "The observation states controls fully addressing the hazard families present: FFP3 mask, goggles, gloves, ear defenders, running water suppression at the blade, and a 15m clear zone. The only unresolved fact flagged is duration/quantity of cutting, which is a magnitude factor. Since the controls already described (mask, water suppression, isolation distance) do not vary with duration - there is no stated threshold at which a different control would be required - the answer to 'how long/how many kerbs' would not change what is done today. No other unstated fact appears necessary to a present decision: PPE is fitted and described, water suppression is confirmed running with visible water, and isolation distance is stated as adequate (15m, nobody else present). There is no sightline/latent-failure ambiguity here since the controls are directly observed as active (water visibly at blade, mask fitted), not merely assumed. Hence the identified unresolved fact is genuinely unresolved but immaterial to the current decision, and no other decision-critical fact was missed. This matches NO_CLARIFICATION_REQUIRED.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 542
}
```

### VC-15 (R3)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "The observation does not record how long or how many kerbs are being cut, which affects cumulative exposure duration but not the presence or adequacy of the controls observed at this moment."
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
  "aboutUnresolvedFactRef": "uncertainty:0",
  "rationale": "Duration/quantity of kerb cutting is a magnitude fact. The controls it would govern (wet cutting suppression, FFP3 respirator, ear defenders) are already stated present and in use regardless of how long or how many kerbs are cut. Whether the answer is short or long, the same controls apply and the same action (continue work as controlled) follows. This is a pure exposure-scaling fact with no threshold stated that would trigger a different control, so it does not change what is done now.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 291
}
```

**§157 verifier v2**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "uncertainty:0",
  "rationale": "The observation establishes that both hazards present (silica dust and noise) are controlled with observed, functioning measures: water suppression running at the blade plus a fitted FFP3 mask for dust, and worn ear defenders for noise. The unresolved fact (duration/quantity of kerbs cut) is a magnitude question that scales exposure but does not change which controls are required or in use - the controls are already stated as in place and would remain the same regardless of how long the task continues. No threshold is described that would trigger a different control at some duration. No other unstated fact governs a safety, regulatory, or control decision here: fire watch/hot work permit considerations are not flagged by the engine, and PPE/engineering controls for the two identified hazards are directly observed rather than inferred. This is a case where something is genuinely unresolved but the answer would not change what is done today, so no clarification is needed.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 473
}
```

---

## 6. Every fact any execution actually focused on

Derived mechanically from the artifacts above — the unresolved facts each verifier was handed,
the ref each verdict was about, and each proposed question. Not ranked and not filtered.

**F1.** Duration and quantity of cutting are not recorded, but this does not change the current control assessment since PPE and water suppression are already confirmed in use.
- appears as: supplied to VC-05 as `uncertainty:0`

**F2.** The observation does not state how long the cutting task will continue or how many kerbs remain, but this affects only duration of exposure, not the presence or adequacy of the controls already described.
- appears as: supplied to VC-10 as `uncertainty:0`

**F3.** The observation does not record how long or how many kerbs are being cut, which affects cumulative exposure duration but not the presence or adequacy of the controls observed at this moment.
- appears as: supplied to VC-15 as `uncertainty:0`

**F4.** how many kerbs is he cutting and for how long, and does the duration change the control required?
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


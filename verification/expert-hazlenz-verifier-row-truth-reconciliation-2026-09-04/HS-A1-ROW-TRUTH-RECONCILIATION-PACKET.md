# HS-A1 — VERIFIER ROW-TRUTH RECONCILIATION PACKET

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
| row | `HS-A1` |
| authored class | `REQUIRED` — asserts ONE NAMED FACT governs a current decision |
| fixture form | `NOT_VISIBLE` |
| blinded draws | VC-08 (R3) |
| in primary denominator | VC-08 |
| excluded from primary | (none) |
| verifier executions covered | 2 (1 draws × v1 and v2) |

---

## 1. Exact observation

Fixture `hazlenz.expert.hardened-development.fixtures.v9`, file sha256 `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb`
Jurisdiction `osha-general-industry`  ·  402 characters

> A grain dryer is running on the farm drying floor. The burner unit sits at the far end of the plenum behind a steel shroud, and from the walkway the flame-failure device and its wiring are behind that shroud and cannot be seen. Grain dust has settled on the horizontal surfaces of the walkway and on the motor housings. An operative is clearing a blockage at the discharge auger with the dryer running.

Allowed hazard families: `combustible_dust`, `fire_explosion`, `machine_guarding`, `noise_exposure`

---

## 2. Deterministic result and governed evidence available to the first pass

- **§154 R3** — families emitted: `(none)`  ·  life-critical: `(none)`

**Governed regulatory evidence supplied with this row:**

**None. `governedStandards` is `[]` on the row and `governedEvidence` is `[]` in the blinded packet for every draw.**

This is true of every row behind the verifier packet. Whether an authored decision-critical
claim can rest on an observation alone, with no governed record, is part of what is being
adjudicated — and it is the point on which HS-H1 turned.

---

## 3. The authored truth, verbatim

### The claim

**Missing fact:** whether the grain dryer burner has a functioning flame-failure device

**Affected decision:** `REQUIRED_CONTROL`

### The counterfactual, as authored

- **Answer A:** the device is fitted and proved to shut the burner off on flame loss
- **Done under A:** drying continues and the finding is the dust accumulation and the auger being cleared while running
- **Answer B:** no device is fitted, or it has been bypassed
- **Done under B:** the dryer must be shut down now, because unburnt fuel discharging into a dust-laden plenum is an explosion sequence with no interruption

### Why the author says the observation does not establish it

> the observation establishes only that the device and its wiring are behind a shroud and cannot be seen from the walkway; an obstructed sightline is not an inspection of what is behind it

### All authored acceptable selectors

- whether a flame-failure device is fitted to the burner and is functioning
- whether the burner has been proved to shut off on loss of flame

### The selector keyword sets the scorer matched on

```json
[
  [
    "flame",
    "fail"
  ],
  [
    "shut",
    "flame"
  ],
  [
    "flame-failure"
  ]
]
```

A proposed question counted as reaching the owed fact only if it contained **every** keyword
in **some** set. This is the mechanism HS-H1's adjudication found could not be relied on
when the observation does not establish that the named mechanism is the applicable one.

### The row-level truth record

```json
{
  "presentHazardFamilies": [
    "combustible_dust",
    "machine_guarding"
  ],
  "defensibleHazardFamilies": [
    "fire_explosion"
  ],
  "forbiddenHazardFamilies": [
    "noise_exposure"
  ],
  "negatedOrSafeStateFamilies": [],
  "lifeCriticalHazardFamilies": [
    "machine_guarding"
  ],
  "decisionCriticalGaps": [
    {
      "gapId": "HS-A1-G1",
      "description": "whether the burner's flame-failure device is fitted and functioning, which the shroud prevents the observer from seeing",
      "affectedDecision": "REQUIRED_CONTROL"
    }
  ]
}
```

### The authoring rationale

> v12 NON-REGRESSION on fresh facts. The observation states a VISIBILITY limit and states its cause (the shroud). "Not visible" must not become "not fitted". The settled dust and the auger clearance are separately established hazards and must still be raised.

### The review signatures recorded at authoring time

These are the author's own checks. They are part of the material under adjudication, not
evidence that the adjudication is settled.

- **NOT_ALREADY_STATED** — The observation says the device is behind the shroud and unseen; it never states whether one is fitted or working.
- **NO_PRESUPPOSITION** — No sentence implies a flame-failure device exists or does not; the shroud is described as an obstruction only, with no definite article naming the device as present.
- **NOT_DETERMINISTICALLY_DERIVABLE** — A dryer running normally looks identical with a working device, a failed one, or none fitted; no stated fact discriminates.
- **TWO_PLAUSIBLE_VALUES** — Fitted and functioning, or absent/defeated — both are ordinary on farm dryers of this kind.
- **BRANCHES_CHANGE_A_CURRENT_DECISION** — With the device working the finding is dust housekeeping and the auger interlock; without it, an unburnt-fuel accumulation in a dust-laden plenum means the dryer stops now.
- **NO_HIDDEN_DEFAULT** — No governed record is supplied and nothing in the text sets a default for the device state.
- **SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED** — Two selectors reach the same decision and both are enumerated: the device state itself, and whether the burner has been proved to shut off on flame loss.
- **AFFECTED_DECISION_JUSTIFIED** — The answer decides whether a specific safety control is present and effective, which is REQUIRED_CONTROL rather than a magnitude question.

---

## 4. Stored first-pass outputs

First-pass prompt v13, analysis contract `analysis.v2`, model `claude-sonnet-5`.

### §154 — draw R3 (blinded as VC-08)

`verification/expert-hazlenz-hardened-v13-replicate3-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `9e2328b93523adc92c07b767bc8bbf05a5037f129f324579e1ac7bb7d38a8bed`  ·  18200 in / 1628 out  ·  $0.052680000000000005

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-A1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "auger_entanglement",
      "hazardFamily": "machine_guarding",
      "assertedConditionState": "ACTIVE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 320,
          "endOffset": 402,
          "quotedText": "An operative is clearing a blockage at the discharge auger with the dryer running."
        }
      ],
      "evidenceBasis": "The text states an operative is actively clearing a blockage at the discharge auger while the dryer, and by implication its driven components, remain running.",
      "reasoning": "Clearing a blockage at an auger while it and the associated equipment are running exposes the operative to entanglement/caught-in injury from the moving auger flighting or drive components. This is a current, ongoing exposure, not a hypothetical.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "combustible_dust_accumulation",
      "hazardFamily": "combustible_dust",
      "assertedConditionState": "ACTIVE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 228,
          "endOffset": 319,
          "quotedText": "Grain dust has settled on the horizontal surfaces of the walkway and on the motor housings."
        }
      ],
      "evidenceBasis": "The text states grain dust has settled on horizontal surfaces of the walkway and on motor housings.",
      "reasoning": "Accumulated grain dust on horizontal surfaces, including on motor housings near a heat source (the dryer/burner), is a recognized combustible dust hazard that can propagate a secondary dust explosion or ignite from hot equipment surfaces.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "flame_failure_device_unverifiable",
      "hazardFamily": "fire_explosion",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "evidence": [
        {
          "sourceId": "observation",
          "sourceType": "observation",
          "startOffset": 145,
          "endOffset": 226,
          "quotedText": "the flame-failure device and its wiring are behind that shroud and cannot be seen"
        }
      ],
      "evidenceBasis": "The text states the flame-failure device and its wiring cannot be seen from the walkway due to the shroud.",
      "reasoning": "The flame-failure device is a critical safety control preventing unburned fuel accumulation and explosion in the burner/plenum. Its condition and function cannot be visually confirmed from the walkway, so whether it is operating correctly cannot be determined from this observation alone.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [
    {
      "insightId": "dust_heat_ignition",
      "interactionKind": "OTHER",
      "participants": [
        "combustible_dust_accumulation",
        "fire_explosion"
      ],
      "reasoning": "Grain dust has settled on motor housings, which are heat-generating and located near the dryer/burner system. Combustible dust in contact with or near hot equipment surfaces increases ignition likelihood beyond either condition alone: the dust provides fuel and the motor housings/burner area provide a potential ignition source, raising the risk of a fire or dust flash beyond what accumulated dust alone or hot equipment alone would pose.",
      "confidence": "MODERATE"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "An operative is clearing a blockage at the discharge auger while the dryer continues to run, creating an active entanglement hazard. Grain dust has settled on walkway surfaces and motor housings, a combustible dust accumulation that is worsened by proximity to heat-generating equipment near the burner. The flame-failure device and its wiring cannot be visually confirmed from the walkway, so its current functional status is unverifiable from this observation alone, though this alone does not establish a decision-changing gap without further stated facts."
  },
  "uncertainty": {
    "statements": [
      "Whether the flame-failure device is currently functioning correctly cannot be determined from the observation, as it is physically obscured from view; no stated fact indicates it has failed or is out of service."
    ]
  }
}
```

---

## 5. Verifier outputs

### VC-08 (R3)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "candidate:flame_failure_device_unverifiable",
      "kind": "CANDIDATE",
      "text": "flame_failure_device_unverifiable (fire_explosion) left INSUFFICIENT_EVIDENCE: The text states the flame-failure device and its wiring cannot be seen from the walkway due to the shroud."
    },
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "Whether the flame-failure device is currently functioning correctly cannot be determined from the observation, as it is physically obscured from view; no stated fact indicates it has failed or is out of service."
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
  "verdict": "ADD_OR_REPLACE_CLARIFICATION",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:flame_failure_device_unverifiable",
  "rationale": "The most acute hazard in the observation is the auger entanglement - an operative actively clearing a blockage while the dryer runs. This should have prompted a question, but none was asked about it at all; instead the only unresolved-fact flagged concerns the flame-failure device. On that flame-failure point: whether the device is functioning cannot be confirmed by sight (obstructed sightline), and this is exactly the case where an unseen control is not a verified control - it could be working or could have failed, and those two answers lead to different actions (continue operating vs. shut down/verify before continuing). That gap is genuinely decision-critical and was correctly identified as unresolved, yet no clarifying question was actually asked to resolve it. The first pass only noted the uncertainty in prose without converting it into a clarification. This needs to be added.",
  "proposedClarification": {
    "question": "Has the flame-failure (flame-safeguard) device on the burner been functionally tested or verified operational recently (e.g., per the manufacturer's or facility's test schedule), and is there a way to confirm its status without visual access behind the shroud?",
    "whyItMatters": "The flame-failure device is the primary control preventing unburned fuel/gas accumulation in the plenum, which combined with the confirmed combustible dust accumulation on nearby surfaces creates a fire/explosion risk. Since the device cannot be seen from the walkway, its condition is unverified - it is equally consistent with being fully functional or having failed silently. If it is not verified functional, the dryer should not continue running until it is tested or bypassed safety confirmed; if it is verified functional, operation may continue as observed.",
    "affectedDecision": "REQUIRED_CONTROL",
    "evidenceGap": "No stated fact confirms whether the flame-failure device has been tested, is in-service, or is functioning; its wiring and body are physically obstructed from the walkway view."
  },
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 758
}
```

**§157 verifier v2**

```json
{
  "verdict": "ADD_OR_REPLACE_CLARIFICATION",
  "clarificationSourceMode": "SUPPLIED_FACT",
  "aboutUnresolvedFactRef": "candidate:flame_failure_device_unverifiable",
  "rationale": "The most decision-critical unresolved fact in this observation is not the flame-failure device visibility (which the first pass flagged but then correctly noted does not by itself establish a decision-changing gap) but rather whether the discharge auger and other machine components have been de-energized/locked out while the operative clears the blockage. The observation states an operative is clearing a blockage 'with the dryer running,' which directly raises the question of whether energy-isolation (lockout/tagout) procedures apply and were followed. This is not addressed by any clarification. Under OSHA general industry, clearing a jam on running equipment versus doing so with the machine de-energized and locked out are materially different situations: if the auger drive is de-energized/isolated (even if the dryer's other systems run), the entanglement exposure is controlled; if it is not isolated, the operative faces an immediate caught-in hazard requiring the work to stop now. The observation as written already tells us the dryer is running and the operative is clearing the blockage while it runs -- but it does not resolve whether the specific point of operation (the auger) has been isolated from motion, e.g., via lockout, a clutch disengagement, or other means, even though the dryer overall remains powered. Actually, re-reading: the observation states the operative is clearing the blockage 'with the dryer running' -- this establishes the auger is running/energized at the point of clearing, which is the entanglement hazard already captured as ACTIVE. So this fact IS established, not unresolved. Given that, the flame-failure device candidate is the only remaining unresolved item, and per the analysis, its own reasoning states this does not establish a decision-changing gap absent further facts (no indication of failure). I need to check if there's a truly separate nominated fact that governs a decision.\n\nOn reflection, the flame-failure device being obscured is a 'control that cannot be seen' situation (per step 2's exception): an obstructed sightline for a life-critical safety control (flame-failure device preventing unburned fuel explosion) is equally consistent with it functioning correctly and with it having failed silently, and these two states lead to different actions (continue operation vs. shut down for verification/repair). This is exactly the scenario flagged in the instructions as looking settled but not being settled. The first pass did not ask about this despite identifying it as INSUFFICIENT_EVIDENCE. This should be surfaced as a clarification since the answer changes whether the burner should continue operating unverified or be shut down for inspection.",
  "proposedClarification": {
    "question": "Has the flame-failure device on the burner been verified as functional (e.g., through a recent test or maintenance record), or is its operational status currently unknown/unconfirmed?",
    "whyItMatters": "The flame-failure device is a life-critical control preventing unburned fuel accumulation and explosion in the burner/plenum. Because it is physically obscured behind the shroud, its condition cannot be confirmed by visual inspection from the walkway. If it is verified functional (e.g., per maintenance/test records), the dryer can continue operating as normal. If its status cannot be verified and no recent functional test exists, the burner should be shut down and the device inspected/tested before continued operation, since an unverified flame-failure device presents an unacceptable, undetectable explosion risk. These are materially different actions, so the fact must be resolved now rather than left as background uncertainty.",
    "affectedDecision": "REQUIRED_CONTROL",
    "evidenceGap": "The observation states only that the flame-failure device and its wiring are physically obscured from view behind the shroud; it does not state whether the device has been tested, verified, or documented as functional through any other means (maintenance records, recent inspection, alarm history)."
  },
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 1412
}
```

---

## 6. Every fact any execution actually focused on

Derived mechanically from the artifacts above — the unresolved facts each verifier was handed,
the ref each verdict was about, and each proposed question. Not ranked and not filtered.

**F1.** flame_failure_device_unverifiable (fire_explosion) left INSUFFICIENT_EVIDENCE: The text states the flame-failure device and its wiring cannot be seen from the walkway due to the shroud.
- appears as: supplied to VC-08 as `candidate:flame_failure_device_unverifiable`

**F2.** Whether the flame-failure device is currently functioning correctly cannot be determined from the observation, as it is physically obscured from view; no stated fact indicates it has failed or is out of service.
- appears as: supplied to VC-08 as `uncertainty:0`

**F3.** Has the flame-failure (flame-safeguard) device on the burner been functionally tested or verified operational recently (e.g., per the manufacturer's or facility's test schedule), and is there a way to confirm its status without visual access behind the shroud?
- appears as: proposed by v1 on VC-08 [REQUIRED_CONTROL]

**F4.** Has the flame-failure device on the burner been verified as functional (e.g., through a recent test or maintenance record), or is its operational status currently unknown/unconfirmed?
- appears as: proposed by v2 on VC-08 [REQUIRED_CONTROL]

**F5.** whether the grain dryer burner has a functioning flame-failure device
- appears as: THE AUTHORED FACT (v9 fixture)

---

## HUMAN ADJUDICATION QUESTIONS

**A.** Is the authored fact genuinely unresolved from the observation and supplied evidence?

> 

**B.** Would the two authored answer states materially change a current safety, regulatory or required-control decision?

> 

**C.** Is asking this fact necessary now, rather than at a later review?

> 

**D.** Does the observation establish the conditions under which the NAMED MECHANISM in the selector is the applicable one? (This is the test HS-H1 did not meet: failing to settle the safe state is not the same as establishing which mechanism governs it.)

> 

**E.** Is the authored selector uniquely appropriate? If not, which other selectors in section 6 are equally valid?

> 

**F.** Did any supplied evidence already establish the authored fact?

> 

**G.** Would a competent safety professional reasonably be expected to identify this as the missing fact without being prompted toward it?

> 

**H.** Should this row remain in a strict selector-based semantic-accuracy denominator?

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


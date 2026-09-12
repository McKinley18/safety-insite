# HS-N1 — VERIFIER ROW-TRUTH RECONCILIATION PACKET

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
| row | `HS-N1` |
| authored class | `FORBIDDEN` — asserts NO fact in the observation is decision-critical |
| fixture form | `DECISION_INVARIANT_UNKNOWN` |
| blinded draws | VC-06 (R3), VC-09 (R1) |
| in primary denominator | VC-09 |
| excluded from primary | VC-06 |
| verifier executions covered | 4 (2 draws × v1 and v2) |

---

## 1. Exact observation

Fixture `hazlenz.expert.hardened-development.fixtures.v9`, file sha256 `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb`
Jurisdiction `osha-general-industry`  ·  394 characters

> A tyre fitter is inflating a commercial truck tyre on a split-rim wheel inside a fitted restraint cage in the workshop bay. He is standing outside the cage and to one side with the airline extension reaching in, and the bay is clear of other people. The cage is bolted to the floor and the wheel is fully within it. The observation does not record how many tyres this fitter changes in a shift.

Allowed hazard families: `mobile_equipment`, `material_handling_storage`, `noise_exposure`, `confined_space_entry`

---

## 2. Deterministic result and governed evidence available to the first pass

- **§154 R3** — families emitted: `(none)`  ·  life-critical: `(none)`
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

**The tempting question the author expected a model to ask:** how many tyres does this fitter change in a shift, and does the frequency warrant a different control?

**Why the author says it is not decision-critical:**

> the control is a physical restraint cage, in use correctly, with the operator outside and to one side and the bay clear. Frequency scales exposure but selects no different action: the cage is the control at any rate, and no plausible figure makes the current arrangement inadequate or suggests a different one.

**What the author says makes it settled:**

> no threshold is in play, the unknown is real, and both branches converge on the same thing being done at this bay today.

**The §156 truth manifest's own restatement, per draw:**

- `VC-09`: The retained unknown is how many tyres are changed per shift. The control is a physical restraint cage in correct use, with the operator outside and to one side and the bay clear. Frequency scales exposure but selects no different action: the cage is the control at any rate, and no plausible figure makes the current arrangement inadequate.

### The row-level truth record

```json
{
  "presentHazardFamilies": [],
  "defensibleHazardFamilies": [
    "mobile_equipment",
    "material_handling_storage",
    "noise_exposure"
  ],
  "forbiddenHazardFamilies": [
    "confined_space_entry"
  ],
  "negatedOrSafeStateFamilies": [
    "mobile_equipment"
  ],
  "lifeCriticalHazardFamilies": [],
  "decisionCriticalGaps": []
}
```

### The authoring rationale

> DECISION-INVARIANT UNKNOWN, authored to the §151 J-class rule: the advertised absence is present ("does not record how many tyres in a shift") AND the invariance is DEMONSTRATED IN THE SAME OBSERVATION -- the cage is fitted and bolted, the wheel is inside it, the fitter is outside and to one side, and the bay is clear. That is what §150's RB-F1 lacked, and the difference is the point of the row.

### The review signatures recorded at authoring time

These are the author's own checks. They are part of the material under adjudication, not
evidence that the adjudication is settled.

- **ESTABLISHED_OR_DECISION_INVARIANT** — The throughput is genuinely unknown and genuinely irrelevant: the control is a physical restraint cage that is in use correctly, and it works identically at one tyre a shift or fifty.
- **NO_UNSTATED_PREMISE** — The invariance is observed rather than argued — the cage is stated as fitted and bolted with the wheel inside and the fitter outside.
- **NO_SIBLING_DECISION_CRITICAL_GAP** — I considered whether the cage is rated for this wheel size and closed it: the row states the wheel is fully within the cage, which is the acceptance condition an inspector applies on the spot.
- **WORDING_CREATES_NO_OPPORTUNITY** — The fitter's position, the airline arrangement and the bay occupancy are each stated, so none is left as an open question.
- **ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED** — This is the §151 J-class requirement met explicitly: the advertised absence is paired with a control observed working in the same observation, which is exactly what RB-F1 lacked and US-J1 had.

---

## 4. Draws the §156 manifest already treats as contested

These draws were removed from the primary denominator by an engineering judgement made under
the same truth-authority limitation that sent HS-H1 to adjudication. The exclusion reasons
are reproduced so a human can decide whether the exclusion, the authored truth, or neither
is what needs repair.

**VC-06 (R3)** — correct verdict recorded as `ABSTAIN_ACCEPTABLE`, semantically equivalent: `NO_CLARIFICATION_REQUIRED`, `VERIFIED_AS_IS`, `ADD_OR_REPLACE_CLARIFICATION`

> The model retained whether the inflation airline carries a pressure-limiting or shutoff device. The authored FORBIDDEN rationale addresses task FREQUENCY, not this equipment. The standard governing rim-wheel servicing names in-line inflation equipment specifically, so asserting that its absence changes no current action would exceed both the authored truth and the observation text.

---

## 5. Stored first-pass outputs

First-pass prompt v13, analysis contract `analysis.v2`, model `claude-sonnet-5`.

### §154 — draw R3 (blinded as VC-06)

`verification/expert-hazlenz-hardened-v13-replicate3-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `9e2328b93523adc92c07b767bc8bbf05a5037f129f324579e1ac7bb7d38a8bed`  ·  18202 in / 785 out  ·  $0.044254

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-N1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "noise_exposure_workshop",
      "hazardFamily": "noise_exposure",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "evidence": [],
      "evidenceBasis": "The observation does not mention noise levels, air tools, or hearing protection at all; this is raised purely as a general possibility in a tyre workshop setting rather than anything the text supports.",
      "reasoning": "Tyre inflation and workshop bays commonly involve compressors and impact tools that can generate elevated noise, but nothing in this observation describes noise levels, duration, or hearing protection use, so this is speculative context rather than an established hazard.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The observation describes a well-controlled tyre inflation task: the split-rim wheel is fully enclosed in a floor-bolted restraint cage, and the fitter stands outside and to the side of the cage while inflating via an airline extension, with no other personnel in the bay. No deterministic hazard was flagged, and the observation gives no basis to assert an active hazard here, since the stated facts show the explosive-separation exposure being controlled by the cage and standoff position. A low-confidence, ungrounded possibility of workshop noise exposure is noted only as general context, not as an established current hazard."
  },
  "uncertainty": {
    "statements": [
      "The observation does not state whether the airline is fitted with a pressure-limiting or shutoff device, but no fact in the text suggests the restraint cage control is compromised, so this is not raised as a decision-critical question."
    ]
  }
}
```

### §152 — draw R1 (blinded as VC-09)

`verification/expert-hazlenz-hardened-v13-baseline-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `09167f8710c13eea781685484e41377be74bbcca76a66b26b9f134c29b199289`  ·  18202 in / 820 out  ·  $0.044604

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-N1",
  "outcome": "ANALYZED",
  "expertHazardCandidates": [
    {
      "candidateKey": "repeated_manual_wheel_handling",
      "hazardFamily": "material_handling_storage",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "evidence": [],
      "evidenceBasis": "The observation describes a single tyre-fitting task involving a commercial truck tyre on a split-rim wheel, which are heavy components, but does not describe frequency, lifting method, or repetition.",
      "reasoning": "Commercial truck split-rim wheels and tyres are heavy and handling them repeatedly can create manual handling/musculoskeletal or struck-by exposure during mounting/demounting, separate from the inflation hazard already controlled by the cage. The observation itself notes it does not record how many tyres are changed in a shift, leaving open whether repetitive heavy handling is occurring.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The observation describes a tyre fitter correctly using a bolted-down restraint cage while inflating a split-rim wheel, standing clear outside the cage with an airline extension — this is the controlled configuration for this hazard and no gap in that control is stated. The only additional angle worth noting at low confidence is potential repetitive manual handling of heavy truck wheels/tyres, though the observation gives no frequency or method detail to substantiate it as a current, active hazard. No decision-critical facts are missing and no cross-hazard interaction is established by the text."
  },
  "uncertainty": {
    "statements": [
      "The observation does not record how many tyres are changed per shift, so the degree of repetitive manual handling exposure, if any, cannot be characterized further from this text alone."
    ]
  }
}
```

---

## 6. Verifier outputs

### VC-06 (R3)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "candidate:noise_exposure_workshop",
      "kind": "CANDIDATE",
      "text": "noise_exposure_workshop (noise_exposure) left INSUFFICIENT_EVIDENCE: The observation does not mention noise levels, air tools, or hearing protection at all; this is raised purely as a general possibility in a tyre workshop setting rather than anything the text supports."
    },
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "The observation does not state whether the airline is fitted with a pressure-limiting or shutoff device, but no fact in the text suggests the restraint cage control is compromised, so this is not raised as a decision-critical question."
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
  "verdict": "VERIFIED_AS_IS",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": null,
  "rationale": "The two unresolved facts are correctly left unasked. Noise exposure is pure speculative context with no textual anchor (no mention of tools, duration, or hearing protection) - asking about it would not resolve a hazard the observation raises at all. The pressure-limiting/shutoff device question is a magnitude/detail-with-control-in-place scenario: the primary control against explosive separation (the restraint cage plus standoff position) is stated present and functioning as described, and the fitter is positioned outside and to the side per correct practice. Whether or not the airline has an additional shutoff device does not change the current action since the cage already contains the hazard and no fact suggests it is compromised. Both branches of answering that question lead to the same conclusion: continue as observed. The first pass correctly asked no clarifying questions.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 384
}
```

**§157 verifier v2**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:noise_exposure_workshop",
  "rationale": "The observation describes a well-controlled scenario: split-rim wheel fully enclosed in a floor-bolted restraint cage, fitter standing outside and to the side, no other personnel present. The two unresolved facts flagged do not change today's action. (1) Noise exposure is pure speculation with no textual anchor (no mention of compressors, impact tools, duration, or hearing protection complaints) - there is no fact to resolve, only an absence of information about a hazard family not otherwise indicated. (2) Whether the airline has a pressure-limiting/shutoff device does not matter here because the primary control against explosive separation is the restraint cage plus standoff position, both of which are stated as present and functioning; the cage's efficacy does not depend on the airline having a secondary shutoff. Answering either question either way does not alter the current corrective action or control requirement - the task is already being performed with the primary hazard control (cage + standoff) in place. I also checked for a decision-critical fact not raised by the first pass: nothing in the observation suggests the cage door/latch state, wheel-cage fit-up, or any other detail is ambiguous in a way that would flip the decision between 'stop work' and 'continue' - the cage is stated as bolted to the floor with the wheel fully within it, which establishes the control is engaged. No other candidate fact meets the bar for a decision-changing unresolved question.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 649
}
```

### VC-09 (R1)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [
    {
      "ref": "candidate:repeated_manual_wheel_handling",
      "kind": "CANDIDATE",
      "text": "repeated_manual_wheel_handling (material_handling_storage) left INSUFFICIENT_EVIDENCE: The observation describes a single tyre-fitting task involving a commercial truck tyre on a split-rim wheel, which are heavy components, but does not describe frequency, lifting method, or repetition."
    },
    {
      "ref": "uncertainty:0",
      "kind": "UNCERTAINTY_STATEMENT",
      "text": "The observation does not record how many tyres are changed per shift, so the degree of repetitive manual handling exposure, if any, cannot be characterized further from this text alone."
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
  "aboutUnresolvedFactRef": "candidate:repeated_manual_wheel_handling",
  "rationale": "The unresolved fact is the frequency/method of manual wheel handling per shift. This is a magnitude-type detail: no manual handling control (mechanical lifts, team lifting, etc.) is stated as present or absent, and the observation describes only a single instance of correct inflation-cage use. Whether the fitter changes 2 tyres or 20 per shift does not change any action to be taken now regarding the observed task, which is already properly controlled (cage in use, fitter clear). There is no stated threshold or control contingent on the frequency, so answering it either way would not alter what is done at this workplace today. This is a genuinely unresolved but non-decision-changing fact, correctly left unclarified.",
  "proposedClarification": null,
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 371
}
```

**§157 verifier v2**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": "candidate:repeated_manual_wheel_handling",
  "rationale": "The only unresolved fact flagged is the frequency/repetition of tyre changes per shift, tied to a low-confidence manual-handling candidate. This is a magnitude question: even if frequency were high, no specific required control (e.g., mechanical aids, job rotation) is established as missing or triggered by a stated threshold in this observation, and the core hazard actually in scope here — split-rim wheel inflation — is already shown fully controlled (bolted cage, fitter standing clear, airline extension). Answering the frequency question either way (high or low tyre-change volume) would not change any action taken today at this workshop: there is no stated threshold or control gap that frequency would resolve one way and not the other. This is a case of an interesting but non-decisive fact, not a decision-critical one. No other unstated fact was identified that would govern a present safety/regulatory decision at this workplace beyond what's already resolved by the observed controls.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 500
}
```

---

## 7. Every fact any execution actually focused on

Derived mechanically from the artifacts above — the unresolved facts each verifier was handed,
the ref each verdict was about, and each proposed question. Not ranked and not filtered.

**F1.** noise_exposure_workshop (noise_exposure) left INSUFFICIENT_EVIDENCE: The observation does not mention noise levels, air tools, or hearing protection at all; this is raised purely as a general possibility in a tyre workshop setting rather than anything the text supports.
- appears as: supplied to VC-06 as `candidate:noise_exposure_workshop`

**F2.** The observation does not state whether the airline is fitted with a pressure-limiting or shutoff device, but no fact in the text suggests the restraint cage control is compromised, so this is not raised as a decision-critical question.
- appears as: supplied to VC-06 as `uncertainty:0`

**F3.** repeated_manual_wheel_handling (material_handling_storage) left INSUFFICIENT_EVIDENCE: The observation describes a single tyre-fitting task involving a commercial truck tyre on a split-rim wheel, which are heavy components, but does not describe frequency, lifting method, or repetition.
- appears as: supplied to VC-09 as `candidate:repeated_manual_wheel_handling`

**F4.** The observation does not record how many tyres are changed per shift, so the degree of repetitive manual handling exposure, if any, cannot be characterized further from this text alone.
- appears as: supplied to VC-09 as `uncertainty:0`

**F5.** how many tyres does this fitter change in a shift, and does the frequency warrant a different control?
- appears as: THE AUTHORED TEMPTING QUESTION the author expected and judged non-decision-critical

---

## HUMAN ADJUDICATION QUESTIONS

**A.** Is the authored claim that NOTHING in this observation is decision-critical correct?

> 

**B.** Does the observation actually state every control the author relies on to call it settled, or does the authored rationale supply a premise the text does not?

> 

**C.** Did any execution in section 6 raise a fact that IS decision-critical and that the authored rationale never addressed?

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


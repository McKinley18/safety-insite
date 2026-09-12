# §202 — the adjudication presentation packet

**Zero provider calls. Zero database operations. No §199 row re-run. No §195–§201 evidence modified.**

## What this document is

This is the material to be read to the product owner, one review unit at a time. Each unit is self-contained: it repeats the observation, the frozen expectation, the provenance disclosure and every model output it bears on, so no unit requires a previous one to be held in mind.

**No verdict in this packet is filled, suggested, ranked or implied.** The product owner is the sole semantic oracle. The builder that produced this file cannot represent a model-authored verdict: `recordVerdict` refuses every attribution other than `PRODUCT_OWNER`.

**The neutrality rule this document is written under.** A deterministic observation is a byte or set comparison whose answer is not in dispute, and it is stated as the comparison, never as its implication. "The span is not inside any acceptable region" is a fact; "therefore D is INCORRECT" is a verdict, and no line in this packet draws it.

## The counts

| | count |
|---|---|
| total slots | **152** |
| structurally pre-filled (carried forward unchanged) | **24** |
| genuinely open | **128** |
| supplied | **0** |
| remaining | **128** |
| supplementary slots, counted separately | 58 |

_12 rows x 4 row axes = 48, plus 8 projected facts x 13 fact axes = 104, total 152. 24 of the 104 are the governed axes N, S and T pre-filled NOT_EXERCISED. 48 + 80 = 128 genuinely open. This is §200's arithmetic, reproduced, not recomputed differently._

_56 verifier sub-axis fields plus 2 refused-declaration questions. §200 leaves all 58 null and counts none of them in its 152. They are carried here so they are not lost, and counted separately so the frozen 152/24/128 split is preserved exactly._

**The 24 pre-filled slots are axes N, S and T on the eight projected facts, all `NOT_EXERCISED`.** The governed capability was never present on a row that reached inference. That is a statement about the run, not about the model. They are carried forward unchanged, they are never presented as open, and the recording function refuses to write into them.

## Ordering

Rows are ordered by ascending rowId, except that a row named as an earlier row's matched partner is placed immediately after that row, because §199's matched-pair design requires the pair to be read together. Within a row: the row unit first, then one unit per projected fact in the order §200 lists them, then any refused-declaration unit. THE ORDER IS MECHANICAL AND CARRIES NO INFORMATION ABOUT ANY UNIT'S CONTENT.

## Unit index

| unit | kind | row | open questions | of which count toward the 152 |
|---|---|---|---|---|
| `U01` | ROW_FIRST_PASS_BEHAVIOUR | `SF-01` | 4 | 4 |
| `U02` | PROJECTED_FACT | `SF-01` | 17 | 10 |
| `U03` | ROW_FIRST_PASS_BEHAVIOUR | `SF-03` | 4 | 4 |
| `U04` | ROW_FIRST_PASS_BEHAVIOUR | `SF-02` | 4 | 4 |
| `U05` | PROJECTED_FACT | `SF-02` | 17 | 10 |
| `U06` | ROW_FIRST_PASS_BEHAVIOUR | `SF-04` | 4 | 4 |
| `U07` | PROJECTED_FACT | `SF-04` | 17 | 10 |
| `U08` | ROW_FIRST_PASS_BEHAVIOUR | `SF-06` | 4 | 4 |
| `U09` | PROJECTED_FACT | `SF-06` | 17 | 10 |
| `U10` | ROW_FIRST_PASS_BEHAVIOUR | `SF-05` | 4 | 4 |
| `U11` | REFUSED_DECLARATION | `SF-05` | 2 | 0 |
| `U12` | ROW_FIRST_PASS_BEHAVIOUR | `SF-12` | 4 | 4 |
| `U13` | ROW_FIRST_PASS_BEHAVIOUR | `SF-07` | 4 | 4 |
| `U14` | PROJECTED_FACT | `SF-07` | 17 | 10 |
| `U15` | ROW_FIRST_PASS_BEHAVIOUR | `SF-08` | 4 | 4 |
| `U16` | PROJECTED_FACT | `SF-08` | 17 | 10 |
| `U17` | PROJECTED_FACT | `SF-08` | 17 | 10 |
| `U18` | ROW_FIRST_PASS_BEHAVIOUR | `SF-11` | 4 | 4 |
| `U19` | PROJECTED_FACT | `SF-11` | 17 | 10 |
| `U20` | ROW_FIRST_PASS_BEHAVIOUR | `SG-01` | 4 | 4 |
| `U21` | ROW_FIRST_PASS_BEHAVIOUR | `SG-02` | 4 | 4 |

## Questions that are for the product owner and are not settled here

- ROW-AXIS SLOTS ON SG-01 AND SG-02. §200 counts 4 open row-axis slots on each of the two rows that were rejected before inference, and those 8 slots are inside the frozen 128. The same §200 worksheet records notAdjudicableReason on both rows: "No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted." §202 has carried the slots forward unfilled and unchanged rather than resolve the tension in either direction. Whether those 8 slots are answered NOT_EXERCISED, or excluded from the denominator, is a product-owner decision.
- THE 58 SUPPLEMENTARY FIELDS. §200 leaves 56 verifier sub-axis fields and 2 refused-declaration questions null, and its completeness block counts none of them in the 152. §202 carries all 58 as supplementary slots with their own counters so they are not silently dropped. Whether they are answered in this session is a product-owner decision.
- VOCABULARY FOR R_PRIORITY_FLOOR_IMPACT. §200 enumerates a scale for the safety classification half of axis R and none for the floor-impact half. §202 proposes three members and flags every slot that uses them as SECTION_202_PROPOSED. They require confirmation before use.
- VOCABULARY FOR THE 58 SUPPLEMENTARY FIELDS. §200 enumerates none. §202 applies the global §200 verdict vocabulary and flags the source. It requires confirmation before use.
- AXIS O. The §200 session states that "Axes N, O, S and T are NOT_EXERCISED for every fact". The §200 worksheet defines no axis O, carries no O slot, and pre-fills exactly three axes per fact — N, S and T, giving the 24. §202 reproduces the worksheet, not the sentence.

---

# The review units

## U01 · SF-01 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-01`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Bench-mounted drill press in the fabrication bay. The chuck guard is fitted and is closed over the chuck. Two of the three guard mounting points are visible from the operator side and both carry a bolt. The third mounting point is behind the column and could not be seen from where the inspector stood. The machine was running and an operator was drilling steel plate at the time of the visit.

```json
// inspection context
{
  "location": "fabrication bay",
  "task": "drilling steel plate on a bench-mounted drill press",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-01",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "NEARBY_PROPERTY_COMPETITION"
  ],
  "pairedWith": "SF-03",
  "isTransportCanary": true,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- a chuck guard is fitted
- the guard is closed over the chuck
- two of three mounting points carry a bolt
- the machine was running with an operator at it

**Preregistered as NOT ESTABLISHED by the text:**
- whether the guard is secured at the third mounting point
- whether the two visible bolts are tight

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "chuck guard securement at all mounting points",
    "owedProperty": "whether the chuck guard is securely fastened at every mounting point, so that it cannot be displaced while the spindle turns",
    "conjuncts": [
      "the guard is fastened at all three mounting points"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "The third mounting point is behind the column and could not be seen from where the inspector stood",
      "Two of the three guard mounting points are visible from the operator side"
    ],
    "branchSemantics": {
      "aMustMean": "the guard is fastened and secure at every mounting point",
      "bMustMean": "the guard is unfastened or insecure at one or more mounting points"
    },
    "expectedDecisionDivergence": {
      "ifA": "the guard is accepted as an effective control and the machine continues in use",
      "ifB": "the drill press is stopped until the guard is properly secured and re-checked"
    },
    "unacceptableNeighbouringProperties": [
      "whether a chuck guard is FITTED — the text states it is",
      "whether the guard is CLOSED — the text states it is",
      "whether the guard is the correct type or design for the machine",
      "whether the operator was trained"
    ],
    "designNoteOnCriticality": "a displaced chuck guard on a running drill press is an entanglement exposure with a person at the machine now; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** PRESENCE versus SECUREMENT. The guard is unambiguously present and closed, so a declaration about presence is a substitution rather than a near miss.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "unverified-third-mount-point",
      "hazardFamily": "machine_guarding",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-01",
          "quotedText": "The third mounting point is behind the column and could not be seen from where the inspector stood."
        }
      ],
      "evidenceBasis": "The observation states that the third guard mounting point could not be seen from the inspector's vantage point; it does not state whether that mounting point carries a bolt or is missing one.",
      "reasoning": "The chuck guard is fitted and closed, and two of three mounting points are confirmed bolted, but the securement of the third point is unverified. If that mounting point is unbolted or missing its fastener, the guard could be less securely fixed than it appears, potentially allowing it to shift or be displaced during operation while the machine is running and an operator is actively drilling.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "third-mount-point-securement",
      "question": "Is the third chuck guard mounting point (behind the column) fitted with a bolt, or is it missing/loose?",
      "whyItMatters": "If the third mounting point is properly bolted, the guard is fully secured on all three points and no additional action is needed. If it is missing or loose, the guard is only partially secured while the machine is running and an operator is actively drilling, which would require the machine to be stopped and the guard fastener replaced or tightened before continued use.",
      "affectedDecision": "HAZARD_SEVERITY",
      "criticality": "IMPORTANT",
      "evidenceGap": "Whether the third guard mounting point carries a bolt is not visible from the inspector's position and is not stated.",
      "relatesToCandidateKey": "unverified-third-mount-point",
      "answersUnresolvedFactDeclarationId": "third-mount-securement-fact"
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The chuck guard is fitted and closed, and two of its three mounting points are confirmed bolted, but the third point behind the column could not be seen and its securement is unverified while an operator actively drills steel plate on the running machine. This is a hazard-relevant fact rather than a confirmed guarding failure, so it is raised as a low-confidence candidate with a targeted clarification about the unseen mounting point's fastening state, since a missing or loose bolt there would change whether the guard is adequately secured during operation. No other machine guarding, lockout/tagout, or electrical concerns are indicated by the observation."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "third-mount-securement-fact",
      "missingFact": "Whether the third chuck guard mounting point (behind the column) is fastened with a bolt",
      "observationSourceId": "OBS-SF-01",
      "observationSpan": "The third mounting point is behind the column and could not be seen from where the inspector stood.",
      "notEstablishedBecause": "The observation states only that this mounting point could not be seen from the inspector's position; it does not state whether a bolt is present or absent there.",
      "affectedDecision": "HAZARD_SEVERITY",
      "branchA": "The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points",
      "decisionIfA": "No corrective action needed regarding guard securement; the guard is adequately fastened",
      "branchB": "The third mounting point is missing its bolt or is loose",
      "decisionIfB": "The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured",
      "whyNecessaryNow": "The machine is currently running with an operator actively drilling, so whether the guard is fully secured bears directly on whether the current operating condition is safe to continue."
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "third-mount-securement-fact",
    "missingFact": "Whether the third chuck guard mounting point (behind the column) is fastened with a bolt",
    "observationSourceId": "OBS-SF-01",
    "observationSpan": "The third mounting point is behind the column and could not be seen from where the inspector stood.",
    "notEstablishedBecause": "The observation states only that this mounting point could not be seen from the inspector's position; it does not state whether a bolt is present or absent there.",
    "affectedDecision": "HAZARD_SEVERITY",
    "branchA": "The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points",
    "decisionIfA": "No corrective action needed regarding guard securement; the guard is adequately fastened",
    "branchB": "The third mounting point is missing its bolt or is loose",
    "decisionIfB": "The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured",
    "whyNecessaryNow": "The machine is currently running with an operator actively drilling, so whether the guard is fully secured bears directly on whether the current operating condition is safe to continue."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 1 raw / 1 admitted against 1-1
  - finding: the admitted count is inside the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-01:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-01:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-01:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-01:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U01", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U02 · SF-01 — projected fact FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1

**Unit kind:** `PROJECTED_FACT` · **row** `SF-01` · **factKey** `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1` · **declarationId** `third-mount-securement-fact`
**Questions in this unit:** 17 open, 3 structurally pre-filled and carried forward unchanged · 13 count toward the 152, 7 supplementary

### 1. The observation, as the model received it

> Bench-mounted drill press in the fabrication bay. The chuck guard is fitted and is closed over the chuck. Two of the three guard mounting points are visible from the operator side and both carry a bolt. The third mounting point is behind the column and could not be seen from where the inspector stood. The machine was running and an operator was drilling steel plate at the time of the visit.

```json
// inspection context
{
  "location": "fabrication bay",
  "task": "drilling steel plate on a bench-mounted drill press",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-01",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "NEARBY_PROPERTY_COMPETITION"
  ],
  "pairedWith": "SF-03",
  "isTransportCanary": true,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- a chuck guard is fitted
- the guard is closed over the chuck
- two of three mounting points carry a bolt
- the machine was running with an operator at it

**Preregistered as NOT ESTABLISHED by the text:**
- whether the guard is secured at the third mounting point
- whether the two visible bolts are tight

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "chuck guard securement at all mounting points",
    "owedProperty": "whether the chuck guard is securely fastened at every mounting point, so that it cannot be displaced while the spindle turns",
    "conjuncts": [
      "the guard is fastened at all three mounting points"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "The third mounting point is behind the column and could not be seen from where the inspector stood",
      "Two of the three guard mounting points are visible from the operator side"
    ],
    "branchSemantics": {
      "aMustMean": "the guard is fastened and secure at every mounting point",
      "bMustMean": "the guard is unfastened or insecure at one or more mounting points"
    },
    "expectedDecisionDivergence": {
      "ifA": "the guard is accepted as an effective control and the machine continues in use",
      "ifB": "the drill press is stopped until the guard is properly secured and re-checked"
    },
    "unacceptableNeighbouringProperties": [
      "whether a chuck guard is FITTED — the text states it is",
      "whether the guard is CLOSED — the text states it is",
      "whether the guard is the correct type or design for the machine",
      "whether the operator was trained"
    ],
    "designNoteOnCriticality": "a displaced chuck guard on a running drill press is an entanglement exposure with a person at the machine now; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** PRESENCE versus SECUREMENT. The guard is unambiguously present and closed, so a declaration about presence is a substitution rather than a near miss.

```json
// the single expectation §200 pointed at for this fact
{
  "factKeyIntent": "chuck guard securement at all mounting points",
  "owedProperty": "whether the chuck guard is securely fastened at every mounting point, so that it cannot be displaced while the spindle turns",
  "conjuncts": [
    "the guard is fastened at all three mounting points"
  ],
  "expectedAffectedDecision": "REQUIRED_CONTROL",
  "acceptableAlternativeAffectedDecisions": [],
  "acceptableSpanRegions": [
    "The third mounting point is behind the column and could not be seen from where the inspector stood",
    "Two of the three guard mounting points are visible from the operator side"
  ],
  "branchSemantics": {
    "aMustMean": "the guard is fastened and secure at every mounting point",
    "bMustMean": "the guard is unfastened or insecure at one or more mounting points"
  },
  "expectedDecisionDivergence": {
    "ifA": "the guard is accepted as an effective control and the machine continues in use",
    "ifB": "the drill press is stopped until the guard is properly secured and re-checked"
  },
  "unacceptableNeighbouringProperties": [
    "whether a chuck guard is FITTED — the text states it is",
    "whether the guard is CLOSED — the text states it is",
    "whether the guard is the correct type or design for the machine",
    "whether the operator was trained"
  ],
  "designNoteOnCriticality": "a displaced chuck guard on a running drill press is an entanglement exposure with a person at the machine now; a reviewer may well call this safety-critical"
}
```

**§200's own caveat on that pointer:** chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "unverified-third-mount-point",
      "hazardFamily": "machine_guarding",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-01",
          "quotedText": "The third mounting point is behind the column and could not be seen from where the inspector stood."
        }
      ],
      "evidenceBasis": "The observation states that the third guard mounting point could not be seen from the inspector's vantage point; it does not state whether that mounting point carries a bolt or is missing one.",
      "reasoning": "The chuck guard is fitted and closed, and two of three mounting points are confirmed bolted, but the securement of the third point is unverified. If that mounting point is unbolted or missing its fastener, the guard could be less securely fixed than it appears, potentially allowing it to shift or be displaced during operation while the machine is running and an operator is actively drilling.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "third-mount-point-securement",
      "question": "Is the third chuck guard mounting point (behind the column) fitted with a bolt, or is it missing/loose?",
      "whyItMatters": "If the third mounting point is properly bolted, the guard is fully secured on all three points and no additional action is needed. If it is missing or loose, the guard is only partially secured while the machine is running and an operator is actively drilling, which would require the machine to be stopped and the guard fastener replaced or tightened before continued use.",
      "affectedDecision": "HAZARD_SEVERITY",
      "criticality": "IMPORTANT",
      "evidenceGap": "Whether the third guard mounting point carries a bolt is not visible from the inspector's position and is not stated.",
      "relatesToCandidateKey": "unverified-third-mount-point",
      "answersUnresolvedFactDeclarationId": "third-mount-securement-fact"
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The chuck guard is fitted and closed, and two of its three mounting points are confirmed bolted, but the third point behind the column could not be seen and its securement is unverified while an operator actively drills steel plate on the running machine. This is a hazard-relevant fact rather than a confirmed guarding failure, so it is raised as a low-confidence candidate with a targeted clarification about the unseen mounting point's fastening state, since a missing or loose bolt there would change whether the guard is adequately secured during operation. No other machine guarding, lockout/tagout, or electrical concerns are indicated by the observation."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "third-mount-securement-fact",
      "missingFact": "Whether the third chuck guard mounting point (behind the column) is fastened with a bolt",
      "observationSourceId": "OBS-SF-01",
      "observationSpan": "The third mounting point is behind the column and could not be seen from where the inspector stood.",
      "notEstablishedBecause": "The observation states only that this mounting point could not be seen from the inspector's position; it does not state whether a bolt is present or absent there.",
      "affectedDecision": "HAZARD_SEVERITY",
      "branchA": "The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points",
      "decisionIfA": "No corrective action needed regarding guard securement; the guard is adequately fastened",
      "branchB": "The third mounting point is missing its bolt or is loose",
      "decisionIfB": "The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured",
      "whyNecessaryNow": "The machine is currently running with an operator actively drilling, so whether the guard is fully secured bears directly on whether the current operating condition is safe to continue."
    }
  ]
}
```

### 5. The declaration(s)

```json
// the declaration this unit reviews
[
  {
    "declarationId": "third-mount-securement-fact",
    "missingFact": "Whether the third chuck guard mounting point (behind the column) is fastened with a bolt",
    "observationSourceId": "OBS-SF-01",
    "observationSpan": "The third mounting point is behind the column and could not be seen from where the inspector stood.",
    "notEstablishedBecause": "The observation states only that this mounting point could not be seen from the inspector's position; it does not state whether a bolt is present or absent there.",
    "affectedDecision": "HAZARD_SEVERITY",
    "branchA": "The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points",
    "decisionIfA": "No corrective action needed regarding guard securement; the guard is adequately fastened",
    "branchB": "The third mounting point is missing its bolt or is loose",
    "decisionIfB": "The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured",
    "whyNecessaryNow": "The machine is currently running with an operator actively drilling, so whether the guard is fully secured bears directly on whether the current operating condition is safe to continue."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": true,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

```json
// the projected OwedFact
{
  "factKey": "FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1",
  "affectedDecision": "HAZARD_SEVERITY",
  "source": "FIRST_PASS_MODEL",
  "evidenceSpan": "The third mounting point is behind the column and could not be seen from where the inspector stood.",
  "whyUnresolved": "The observation states only that this mounting point could not be seen from the inspector's position; it does not state whether a bolt is present or absent there.",
  "branchA": "The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points",
  "branchB": "The third mounting point is missing its bolt or is loose",
  "decisionDivergence": {
    "ifA": "No corrective action needed regarding guard securement; the guard is adequately fastened",
    "ifB": "The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured"
  },
  "priority": "OTHER",
  "status": "UNRESOLVED",
  "acceptableEvidence": null,
  "modelAuthored": true
}
```

```json
// exactly what the verifier received — this object carries no missingFact field
{
  "factKey": "FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1",
  "affectedDecision": "HAZARD_SEVERITY",
  "whyUnresolved": "The observation states only that this mounting point could not be seen from the inspector's position; it does not state whether a bolt is present or absent there.",
  "branchA": "The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points",
  "branchB": "The third mounting point is missing its bolt or is loose",
  "decisionDivergence": {
    "ifA": "No corrective action needed regarding guard securement; the guard is adequately fastened",
    "ifB": "The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured"
  },
  "evidenceSpan": "The third mounting point is behind the column and could not be seen from where the inspector stood.",
  "acceptableEvidence": null
}
```

**The field pair axis Q measures:**

- `missingFact` in the declaration: "Whether the third chuck guard mounting point (behind the column) is fastened with a bolt"
- `missingFact` present in the projected OwedFact: false

### 8. Verifier v3.3 output

```json
// the verifier record for this fact
{
  "reachedInference": true,
  "verdict": "VERIFIED_AS_IS",
  "rationale": "The unresolved fact is whether the unseen third mounting point of the chuck guard is bolted. The observation only establishes that two of three points are visibly bolted and the third could not be seen; this genuinely leaves the securement of that point open, and the two possible answers lead to different actions (continue operating vs. stop and fasten). The first-pass clarification asks exactly this: whether the third mounting point is fitted with a bolt or missing/loose. An answer to that question, in either direction, fully resolves the fact — there is no sub-component of the fact left unaddressed (it is a single binary state: bolted or not). No additional fact outside the supplied set appears necessary to determine a safety, regulatory, or control decision here; the guard is otherwise fitted and closed and the only real gap is the fastening state of the hidden point.",
  "clarificationSourceMode": null,
  "bindingFactKey": null,
  "proposedClarification": null,
  "owedFactDeclarations": [
    {
      "factKey": "FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1",
      "declaration": "STILL_UNRESOLVED",
      "challengeReason": null
    }
  ],
  "regulatoryBasis": {
    "reliance": "NONE",
    "sourceIds": [],
    "proposition": null
  },
  "admissionAdmitted": true,
  "admissionCodes": [],
  "governedEvidenceShownToVerifier": [],
  "rawProviderRecord": {
    "reachedInference": true,
    "httpStatus": 200,
    "respondedModel": "claude-sonnet-5",
    "stopReason": "tool_use",
    "verifierInstructionVersion": "hazlenz.expert.verifier-instruction.v3.2",
    "admissionContractVersion": "hazlenz.expert.verifier.v3.3",
    "suppliedGovernedSourceIds": [],
    "parsed": {
      "verdict": "VERIFIED_AS_IS",
      "rationale": "The unresolved fact is whether the unseen third mounting point of the chuck guard is bolted. The observation only establishes that two of three points are visibly bolted and the third could not be seen; this genuinely leaves the securement of that point open, and the two possible answers lead to different actions (continue operating vs. stop and fasten). The first-pass clarification asks exactly this: whether the third mounting point is fitted with a bolt or missing/loose. An answer to that question, in either direction, fully resolves the fact — there is no sub-component of the fact left unaddressed (it is a single binary state: bolted or not). No additional fact outside the supplied set appears necessary to determine a safety, regulatory, or control decision here; the guard is otherwise fitted and closed and the only real gap is the fastening state of the hidden point.",
      "clarificationSourceMode": null,
      "proposedClarification": null,
      "bindingFactKey": null,
      "nominatedFact": null,
      "owedFactDeclarations": [
        {
          "factKey": "FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1",
          "declaration": "STILL_UNRESOLVED",
          "challengeReason": null
        }
      ],
      "regulatoryBasis": {
        "reliance": "NONE",
        "sourceIds": [],
        "proposition": null
      }
    },
    "admission": {
      "admitted": true,
      "codes": [],
      "detail": [],
      "bindingAdmitted": false,
      "nominationAdmitted": false,
      "challengedFactKeys": [],
      "citationViolations": [],
      "citationReuseAdmitted": false,
      "citationReuse": null,
      "unauthorisedCitations": [],
      "regulatoryRelianceDeclared": false,
      "boundSourceIds": []
    }
  }
}
```

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declared evidenceSpan against the preregistered acceptableSpanRegions**
  - compared: declared "The third mounting point is behind the column and could not be seen from where the inspector stood." against 2 region(s)
  - finding: the declared span CONTAINS a preregistered region: "The third mounting point is behind the column and could not be seen from where the inspector stood"
  - isAVerdict: false
- **declared affectedDecision against the preregistered expectation**
  - compared: declared HAZARD_SEVERITY; preregistered REQUIRED_CONTROL; acceptable alternatives (none listed)
  - finding: is NEITHER the preregistered expectation NOR any listed acceptable alternative
  - isAVerdict: false
- **shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION**
  - compared: 4 neighbour(s) listed
  - finding: the neighbour sharing most vocabulary (60%) is "whether a chuck guard is FITTED — the text states it is". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence.
  - isAVerdict: false
- **preregistered conjuncts against the full declaration text**
  - compared: 1 conjunct(s)
  - finding: the expected fact is not conjunctive
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Carried forward unchanged and NOT open for judgement:**

- `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY — value `NOT_EXERCISED`
- `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:S_GOVERNED_ID_BINDING_APPROPRIATENESS` — axis S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) — value `NOT_EXERCISED`
- `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING — value `NOT_EXERCISED`

_N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry._

**Q1. Axis C — OWED_PROPERTY_SEMANTIC_CORRECTNESS**

> Does this declaration identify the EXACT property that remains unknown?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE**

> Is the verbatim span actually relevant to WHY this fact is unresolved?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis E — BRANCH_PLAUSIBILITY**

> Are branchA and branchB genuinely possible resolutions of THIS exact fact?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:E_BRANCH_PLAUSIBILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis F — DECISION_DIVERGENCE_VALIDITY**

> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:F_DECISION_DIVERGENCE_VALIDITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q5. Axis G — AFFECTED_DECISION_CORRECTNESS**

> Is the fact bound to the correct affectedDecision?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:G_AFFECTED_DECISION_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q6. Axis L — VERIFIER_TARGET_BINDING**

> Does the verifier verdict address the EXACT projected owed fact?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:L_VERIFIER_TARGET_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q7. Axis M — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q8. Axis Q — OWED_PROPERTY_LOSS_IMPACT**

> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:Q_OWED_PROPERTY_LOSS_IMPACT`
- allowed answers: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q9. Axis R — PRIORITY_FLOOR_IMPACT**

> Does the projected priority floor of OTHER materially under-escalate this fact?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:R_PRIORITY_FLOOR_IMPACT`
- allowed answers: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` · `INDETERMINATE`
- vocabulary source: `SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: yes

**Q10. Axis R — PRIORITY_FLOOR_IMPACT**

> How would you classify this fact's safety significance?

- slot id: `FACT:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:R_SAFETY_CLASSIFICATION`
- allowed answers: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q11. Axis SUB.TARGET_TOPIC_REACH — TARGET_TOPIC_REACH**

> Did the verifier verdict reach the TOPIC of this projected fact at all?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:TARGET_TOPIC_REACH`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q12. Axis SUB.EXACT_OWED_PROPERTY_BINDING — EXACT_OWED_PROPERTY_BINDING**

> Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:EXACT_OWED_PROPERTY_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q13. Axis SUB.CLARIFICATION_RESOLUTION_SUFFICIENCY — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q14. Axis SUB.AFFECTED_DECISION_ALIGNMENT — AFFECTED_DECISION_ALIGNMENT**

> Is the verifier's treatment aligned with the affectedDecision the projected fact carries?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:AFFECTED_DECISION_ALIGNMENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q15. Axis SUB.BRANCH_DECISION_CONSISTENCY — BRANCH_DECISION_CONSISTENCY**

> Is the verifier's treatment consistent with the two branches and the two decisions it received?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:BRANCH_DECISION_CONSISTENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q16. Axis SUB.CHALLENGE_REVIEWABILITY — CHALLENGE_REVIEWABILITY**

> Where the verifier issued a challenge, is the stated reason reviewable on its face?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:CHALLENGE_REVIEWABILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and enumerates no vocabulary for it. It is carried on every fact unit unfilled.

**Q17. Axis SUB.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION — LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION**

> Did the first-pass missingFact NOT reaching the verifier degrade the verifier's treatment of this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1:LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U02", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U03 · SF-03 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-03`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Bench-mounted drill press in the fabrication bay. The chuck guard is fitted and is closed over the chuck. The inspector checked all three guard mounting points by hand from both sides of the column and found a bolt fitted and tight at each one. The machine was running and an operator was drilling steel plate at the time of the visit.

```json
// inspection context
{
  "location": "fabrication bay",
  "task": "drilling steel plate on a bench-mounted drill press",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-03",
  "capability": "ABSENT",
  "families": [
    "NO_REAL_GAP",
    "NEARBY_PROPERTY_COMPETITION"
  ],
  "pairedWith": "SF-01",
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- a chuck guard is fitted and closed
- all three mounting points were checked by hand and each is fitted and tight
- the machine was running with an operator at it

**Preregistered as NOT ESTABLISHED by the text:**
_(none)_

```json
// preregistered expected gap count
{
  "min": 0,
  "max": 0
}
```

```json
// preregistered expected owed facts
[]
```

**Preregistered design intent:** The matched partner of SF-01, identical in setting and vocabulary, with the securement established by direct inspection. A gap declared here is a false gap.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "NOTHING_TO_ADD"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The observation describes a chuck guard fitted, closed, and physically verified secure at all three mounting points, with the machine running and an operator drilling steel plate normally. Nothing in the text indicates a guarding gap, a lockout/tagout activity, or an electrical exposure at this bench-mounted drill press. No additional hazard candidates or decision-critical questions arise from this observation."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "NOTHING_TO_ADD",
  "unresolvedFactDeclarations": []
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 0 raw / 0 admitted against 0-0
  - finding: the admitted count is inside the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-03:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-03:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-03:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-03:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U03", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U04 · SF-02 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-02`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Confined-space entry at the effluent sump on level -2. A tripod and winch are rigged over the opening and an attendant is stationed at the top with the winch line attached to the entrant's harness. The entry permit on the clipboard is filled in and signed by the authorised person. The gas monitor clipped to the entrant's harness was switched on and displaying readings; nobody present could say when it was last calibrated or bump-tested. The rescue arrangements section of the permit reads "site team" and nothing further, and the attendant said he had not been told what the rescue plan was. The entrant was in the sump when observed.

```json
// inspection context
{
  "location": "effluent sump, level -2",
  "task": "confined-space entry to clear a blocked sump inlet",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-02",
  "capability": "ABSENT",
  "families": [
    "MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- a tripod, winch and attendant are in place and the line is attached to the entrant
- a completed and signed entry permit exists
- a gas monitor is switched on and displaying readings
- the rescue arrangements section names "site team" and nothing further
- the attendant has not been told what the rescue plan is
- the entrant is in the sump now

**Preregistered as NOT ESTABLISHED by the text:**
- whether the gas monitor is within its calibration or bump-test validity, so its readings can be relied on
- whether a rescue arrangement capable of retrieving this entrant exists and is known to the people who would have to use it

```json
// preregistered expected gap count
{
  "min": 2,
  "max": 2
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "gas monitor calibration validity",
    "owedProperty": "whether the gas monitor is within its calibration and bump-test validity, so that the readings it is displaying can be relied on as evidence of the atmosphere",
    "conjuncts": [
      "the monitor is within calibration or bump-test validity"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [
      "EXPOSURE"
    ],
    "acceptableSpanRegions": [
      "nobody present could say when it was last calibrated or bump-tested",
      "The gas monitor clipped to the entrant's harness was switched on and displaying readings"
    ],
    "branchSemantics": {
      "aMustMean": "the monitor is in calibration and its readings are trustworthy",
      "bMustMean": "the monitor is out of calibration or unverified and its readings cannot be relied on"
    },
    "expectedDecisionDivergence": {
      "ifA": "the atmospheric monitoring is accepted and the entry continues",
      "ifB": "the entrant is withdrawn until a verified monitor is in use"
    },
    "unacceptableNeighbouringProperties": [
      "whether a gas monitor is PRESENT — the text states it is",
      "whether the monitor is SWITCHED ON — the text states it is",
      "whether the monitor is DISPLAYING READINGS — the text states it is",
      "what the readings actually were"
    ],
    "designNoteOnCriticality": "an unverified monitor on a live confined-space entry is an atmospheric exposure with a person inside now; a reviewer may well call this safety-critical"
  },
  {
    "factKeyIntent": "rescue arrangement exists and is known to those who must use it",
    "owedProperty": "whether a rescue arrangement capable of retrieving this entrant exists and is known to the attendant who would have to initiate it",
    "conjuncts": [
      "a capable rescue arrangement exists",
      "the people who must use it know what it is"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [
      "EXPOSURE"
    ],
    "acceptableSpanRegions": [
      "The rescue arrangements section of the permit reads \"site team\" and nothing further",
      "the attendant said he had not been told what the rescue plan was"
    ],
    "branchSemantics": {
      "aMustMean": "a capable rescue arrangement exists and the attendant knows how to invoke it",
      "bMustMean": "no capable rescue arrangement exists, or nobody on site knows what it is"
    },
    "expectedDecisionDivergence": {
      "ifA": "the entry continues under the existing permit",
      "ifB": "the entry is stopped and the entrant retrieved until rescue arrangements are established and briefed"
    },
    "unacceptableNeighbouringProperties": [
      "whether a permit EXISTS — the text states it exists and is signed",
      "whether the tripod and winch are RIGGED — the text states they are",
      "whether an attendant is PRESENT — the text states he is",
      "whether the permit is filled in — the text states it is"
    ],
    "designNoteOnCriticality": "no known rescue plan during a live entry is the classic confined-space fatality mechanism; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** Two genuinely INDEPENDENT gaps: different equipment, different evidence, different people would answer them, and settling one leaves the other completely open. Both are surrounded by established neighbours — a signed permit, a rigged tripod, a switched-on monitor — so a model that reads topic rather than property will substitute.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "gas-monitor-cal-unknown",
      "hazardFamily": "confined_space",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-02",
          "quotedText": "nobody present could say when it was last calibrated or bump-tested"
        }
      ],
      "evidenceBasis": "The observation establishes that nobody present at the time could state when the gas monitor was last calibrated or bump-tested, while the entrant is currently in the sump relying on that monitor for atmospheric warning.",
      "reasoning": "The entrant is in the confined space right now with a gas monitor as the sole means of detecting a hazardous atmosphere. An instrument of unknown calibration/bump-test status may fail to detect or may falsely indicate safe conditions, so the atmospheric monitoring control in active use cannot be relied upon as functioning correctly.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "rescue-plan-inadequate",
      "hazardFamily": "confined_space",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-02",
          "quotedText": "the attendant said he had not been told what the rescue plan was"
        }
      ],
      "evidenceBasis": "The observation establishes, in the attendant's own statement, that he had not been told the rescue plan while the entrant is currently inside the sump.",
      "reasoning": "With an entrant currently in the confined space, the attendant — the person responsible for initiating or coordinating emergency response — does not know the rescue plan. If an emergency arose right now, the attendant would not know how to summon or execute rescue, directly undermining the effectiveness of the rescue arrangement during an active entry.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "cq-rescue-capability",
      "question": "What specific rescue capability or resource does the 'site team' rescue arrangement refer to, and is it actually available and able to respond right now?",
      "whyItMatters": "If a defined, available rescue team/capability exists but simply was not communicated to this attendant, the immediate action is to brief the attendant before continuing entry. If no actual rescue capability exists behind the 'site team' notation, the entry must be stopped now because there is no functioning means of rescuing the entrant currently in the space.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether a real, available rescue resource exists behind the permit's 'site team' entry, as distinct from the attendant simply not having been briefed on it",
      "relatesToCandidateKey": "rescue-plan-inadequate"
    }
  ],
  "crossHazardInsights": [
    {
      "insightId": "ci-monitor-rescue",
      "interactionKind": "CONFINED_SPACE_ATMOSPHERIC",
      "participants": [
        "gas-monitor-cal-unknown",
        "rescue-plan-inadequate"
      ],
      "reasoning": "An atmospheric monitor of unverified calibration/function increases the chance that a hazardous atmosphere develops or exists undetected while the entrant is inside; that same entrant is currently backed by a rescue arrangement the attendant does not understand or know how to execute. If the monitor fails to warn in time, the attendant's inability to act on a known rescue plan removes the last line of defense, making the combination materially worse than either gap alone.",
      "confidence": "HIGH"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "An entrant is currently working inside the effluent sump relying on a gas monitor whose calibration/bump-test status is unknown, while the attendant who would need to initiate rescue does not know the rescue plan — both gaps exist during an active entry, not historically. Together these materially compound: an undetected atmospheric hazard combined with an attendant unable to execute rescue leaves no reliable backstop for the entrant. The critical unresolved question is whether a real rescue capability exists behind the 'site team' notation that simply wasn't communicated, or whether no functioning rescue resource exists at all, since that determines whether the fix is an immediate briefing or a stop-work."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "decl-rescue-capability",
      "missingFact": "Whether an actual, available rescue capability exists corresponding to the permit's 'site team' rescue arrangement",
      "observationSourceId": "OBS-SF-02",
      "observationSpan": "the attendant said he had not been told what the rescue plan was",
      "notEstablishedBecause": "The observation establishes only that the attendant was not told the rescue plan; it does not establish whether a rescue plan/resource exists but was simply not communicated to him, or whether no functional rescue arrangement exists at all behind the vague permit entry",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "A defined, available rescue capability exists but the attendant was not briefed on it",
      "decisionIfA": "Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete",
      "branchB": "No functional rescue capability exists behind the 'site team' notation",
      "decisionIfB": "Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established",
      "whyNecessaryNow": "The entrant is currently inside the confined space; whether a workable rescue response is available determines whether entry can continue with a corrective briefing or must be halted immediately"
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "decl-rescue-capability",
    "missingFact": "Whether an actual, available rescue capability exists corresponding to the permit's 'site team' rescue arrangement",
    "observationSourceId": "OBS-SF-02",
    "observationSpan": "the attendant said he had not been told what the rescue plan was",
    "notEstablishedBecause": "The observation establishes only that the attendant was not told the rescue plan; it does not establish whether a rescue plan/resource exists but was simply not communicated to him, or whether no functional rescue arrangement exists at all behind the vague permit entry",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "A defined, available rescue capability exists but the attendant was not briefed on it",
    "decisionIfA": "Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete",
    "branchB": "No functional rescue capability exists behind the 'site team' notation",
    "decisionIfB": "Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established",
    "whyNecessaryNow": "The entrant is currently inside the confined space; whether a workable rescue response is available determines whether entry can continue with a corrective briefing or must be halted immediately"
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 1 raw / 1 admitted against 2-2
  - finding: the admitted count is OUTSIDE the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-02:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-02:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-02:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-02:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U04", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U05 · SF-02 — projected fact FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1

**Unit kind:** `PROJECTED_FACT` · **row** `SF-02` · **factKey** `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1` · **declarationId** `decl-rescue-capability`
**Questions in this unit:** 17 open, 3 structurally pre-filled and carried forward unchanged · 13 count toward the 152, 7 supplementary

### 1. The observation, as the model received it

> Confined-space entry at the effluent sump on level -2. A tripod and winch are rigged over the opening and an attendant is stationed at the top with the winch line attached to the entrant's harness. The entry permit on the clipboard is filled in and signed by the authorised person. The gas monitor clipped to the entrant's harness was switched on and displaying readings; nobody present could say when it was last calibrated or bump-tested. The rescue arrangements section of the permit reads "site team" and nothing further, and the attendant said he had not been told what the rescue plan was. The entrant was in the sump when observed.

```json
// inspection context
{
  "location": "effluent sump, level -2",
  "task": "confined-space entry to clear a blocked sump inlet",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-02",
  "capability": "ABSENT",
  "families": [
    "MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- a tripod, winch and attendant are in place and the line is attached to the entrant
- a completed and signed entry permit exists
- a gas monitor is switched on and displaying readings
- the rescue arrangements section names "site team" and nothing further
- the attendant has not been told what the rescue plan is
- the entrant is in the sump now

**Preregistered as NOT ESTABLISHED by the text:**
- whether the gas monitor is within its calibration or bump-test validity, so its readings can be relied on
- whether a rescue arrangement capable of retrieving this entrant exists and is known to the people who would have to use it

```json
// preregistered expected gap count
{
  "min": 2,
  "max": 2
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "gas monitor calibration validity",
    "owedProperty": "whether the gas monitor is within its calibration and bump-test validity, so that the readings it is displaying can be relied on as evidence of the atmosphere",
    "conjuncts": [
      "the monitor is within calibration or bump-test validity"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [
      "EXPOSURE"
    ],
    "acceptableSpanRegions": [
      "nobody present could say when it was last calibrated or bump-tested",
      "The gas monitor clipped to the entrant's harness was switched on and displaying readings"
    ],
    "branchSemantics": {
      "aMustMean": "the monitor is in calibration and its readings are trustworthy",
      "bMustMean": "the monitor is out of calibration or unverified and its readings cannot be relied on"
    },
    "expectedDecisionDivergence": {
      "ifA": "the atmospheric monitoring is accepted and the entry continues",
      "ifB": "the entrant is withdrawn until a verified monitor is in use"
    },
    "unacceptableNeighbouringProperties": [
      "whether a gas monitor is PRESENT — the text states it is",
      "whether the monitor is SWITCHED ON — the text states it is",
      "whether the monitor is DISPLAYING READINGS — the text states it is",
      "what the readings actually were"
    ],
    "designNoteOnCriticality": "an unverified monitor on a live confined-space entry is an atmospheric exposure with a person inside now; a reviewer may well call this safety-critical"
  },
  {
    "factKeyIntent": "rescue arrangement exists and is known to those who must use it",
    "owedProperty": "whether a rescue arrangement capable of retrieving this entrant exists and is known to the attendant who would have to initiate it",
    "conjuncts": [
      "a capable rescue arrangement exists",
      "the people who must use it know what it is"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [
      "EXPOSURE"
    ],
    "acceptableSpanRegions": [
      "The rescue arrangements section of the permit reads \"site team\" and nothing further",
      "the attendant said he had not been told what the rescue plan was"
    ],
    "branchSemantics": {
      "aMustMean": "a capable rescue arrangement exists and the attendant knows how to invoke it",
      "bMustMean": "no capable rescue arrangement exists, or nobody on site knows what it is"
    },
    "expectedDecisionDivergence": {
      "ifA": "the entry continues under the existing permit",
      "ifB": "the entry is stopped and the entrant retrieved until rescue arrangements are established and briefed"
    },
    "unacceptableNeighbouringProperties": [
      "whether a permit EXISTS — the text states it exists and is signed",
      "whether the tripod and winch are RIGGED — the text states they are",
      "whether an attendant is PRESENT — the text states he is",
      "whether the permit is filled in — the text states it is"
    ],
    "designNoteOnCriticality": "no known rescue plan during a live entry is the classic confined-space fatality mechanism; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** Two genuinely INDEPENDENT gaps: different equipment, different evidence, different people would answer them, and settling one leaves the other completely open. Both are surrounded by established neighbours — a signed permit, a rigged tripod, a switched-on monitor — so a model that reads topic rather than property will substitute.

```json
// the single expectation §200 pointed at for this fact
{
  "factKeyIntent": "rescue arrangement exists and is known to those who must use it",
  "owedProperty": "whether a rescue arrangement capable of retrieving this entrant exists and is known to the attendant who would have to initiate it",
  "conjuncts": [
    "a capable rescue arrangement exists",
    "the people who must use it know what it is"
  ],
  "expectedAffectedDecision": "REQUIRED_CONTROL",
  "acceptableAlternativeAffectedDecisions": [
    "EXPOSURE"
  ],
  "acceptableSpanRegions": [
    "The rescue arrangements section of the permit reads \"site team\" and nothing further",
    "the attendant said he had not been told what the rescue plan was"
  ],
  "branchSemantics": {
    "aMustMean": "a capable rescue arrangement exists and the attendant knows how to invoke it",
    "bMustMean": "no capable rescue arrangement exists, or nobody on site knows what it is"
  },
  "expectedDecisionDivergence": {
    "ifA": "the entry continues under the existing permit",
    "ifB": "the entry is stopped and the entrant retrieved until rescue arrangements are established and briefed"
  },
  "unacceptableNeighbouringProperties": [
    "whether a permit EXISTS — the text states it exists and is signed",
    "whether the tripod and winch are RIGGED — the text states they are",
    "whether an attendant is PRESENT — the text states he is",
    "whether the permit is filled in — the text states it is"
  ],
  "designNoteOnCriticality": "no known rescue plan during a live entry is the classic confined-space fatality mechanism; a reviewer may well call this safety-critical"
}
```

**§200's own caveat on that pointer:** chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "gas-monitor-cal-unknown",
      "hazardFamily": "confined_space",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-02",
          "quotedText": "nobody present could say when it was last calibrated or bump-tested"
        }
      ],
      "evidenceBasis": "The observation establishes that nobody present at the time could state when the gas monitor was last calibrated or bump-tested, while the entrant is currently in the sump relying on that monitor for atmospheric warning.",
      "reasoning": "The entrant is in the confined space right now with a gas monitor as the sole means of detecting a hazardous atmosphere. An instrument of unknown calibration/bump-test status may fail to detect or may falsely indicate safe conditions, so the atmospheric monitoring control in active use cannot be relied upon as functioning correctly.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "rescue-plan-inadequate",
      "hazardFamily": "confined_space",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-02",
          "quotedText": "the attendant said he had not been told what the rescue plan was"
        }
      ],
      "evidenceBasis": "The observation establishes, in the attendant's own statement, that he had not been told the rescue plan while the entrant is currently inside the sump.",
      "reasoning": "With an entrant currently in the confined space, the attendant — the person responsible for initiating or coordinating emergency response — does not know the rescue plan. If an emergency arose right now, the attendant would not know how to summon or execute rescue, directly undermining the effectiveness of the rescue arrangement during an active entry.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "cq-rescue-capability",
      "question": "What specific rescue capability or resource does the 'site team' rescue arrangement refer to, and is it actually available and able to respond right now?",
      "whyItMatters": "If a defined, available rescue team/capability exists but simply was not communicated to this attendant, the immediate action is to brief the attendant before continuing entry. If no actual rescue capability exists behind the 'site team' notation, the entry must be stopped now because there is no functioning means of rescuing the entrant currently in the space.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether a real, available rescue resource exists behind the permit's 'site team' entry, as distinct from the attendant simply not having been briefed on it",
      "relatesToCandidateKey": "rescue-plan-inadequate"
    }
  ],
  "crossHazardInsights": [
    {
      "insightId": "ci-monitor-rescue",
      "interactionKind": "CONFINED_SPACE_ATMOSPHERIC",
      "participants": [
        "gas-monitor-cal-unknown",
        "rescue-plan-inadequate"
      ],
      "reasoning": "An atmospheric monitor of unverified calibration/function increases the chance that a hazardous atmosphere develops or exists undetected while the entrant is inside; that same entrant is currently backed by a rescue arrangement the attendant does not understand or know how to execute. If the monitor fails to warn in time, the attendant's inability to act on a known rescue plan removes the last line of defense, making the combination materially worse than either gap alone.",
      "confidence": "HIGH"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "An entrant is currently working inside the effluent sump relying on a gas monitor whose calibration/bump-test status is unknown, while the attendant who would need to initiate rescue does not know the rescue plan — both gaps exist during an active entry, not historically. Together these materially compound: an undetected atmospheric hazard combined with an attendant unable to execute rescue leaves no reliable backstop for the entrant. The critical unresolved question is whether a real rescue capability exists behind the 'site team' notation that simply wasn't communicated, or whether no functioning rescue resource exists at all, since that determines whether the fix is an immediate briefing or a stop-work."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "decl-rescue-capability",
      "missingFact": "Whether an actual, available rescue capability exists corresponding to the permit's 'site team' rescue arrangement",
      "observationSourceId": "OBS-SF-02",
      "observationSpan": "the attendant said he had not been told what the rescue plan was",
      "notEstablishedBecause": "The observation establishes only that the attendant was not told the rescue plan; it does not establish whether a rescue plan/resource exists but was simply not communicated to him, or whether no functional rescue arrangement exists at all behind the vague permit entry",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "A defined, available rescue capability exists but the attendant was not briefed on it",
      "decisionIfA": "Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete",
      "branchB": "No functional rescue capability exists behind the 'site team' notation",
      "decisionIfB": "Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established",
      "whyNecessaryNow": "The entrant is currently inside the confined space; whether a workable rescue response is available determines whether entry can continue with a corrective briefing or must be halted immediately"
    }
  ]
}
```

### 5. The declaration(s)

```json
// the declaration this unit reviews
[
  {
    "declarationId": "decl-rescue-capability",
    "missingFact": "Whether an actual, available rescue capability exists corresponding to the permit's 'site team' rescue arrangement",
    "observationSourceId": "OBS-SF-02",
    "observationSpan": "the attendant said he had not been told what the rescue plan was",
    "notEstablishedBecause": "The observation establishes only that the attendant was not told the rescue plan; it does not establish whether a rescue plan/resource exists but was simply not communicated to him, or whether no functional rescue arrangement exists at all behind the vague permit entry",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "A defined, available rescue capability exists but the attendant was not briefed on it",
    "decisionIfA": "Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete",
    "branchB": "No functional rescue capability exists behind the 'site team' notation",
    "decisionIfB": "Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established",
    "whyNecessaryNow": "The entrant is currently inside the confined space; whether a workable rescue response is available determines whether entry can continue with a corrective briefing or must be halted immediately"
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": true,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

```json
// the projected OwedFact
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "source": "FIRST_PASS_MODEL",
  "evidenceSpan": "the attendant said he had not been told what the rescue plan was",
  "whyUnresolved": "The observation establishes only that the attendant was not told the rescue plan; it does not establish whether a rescue plan/resource exists but was simply not communicated to him, or whether no functional rescue arrangement exists at all behind the vague permit entry",
  "branchA": "A defined, available rescue capability exists but the attendant was not briefed on it",
  "branchB": "No functional rescue capability exists behind the 'site team' notation",
  "decisionDivergence": {
    "ifA": "Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete",
    "ifB": "Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established"
  },
  "priority": "OTHER",
  "status": "UNRESOLVED",
  "acceptableEvidence": null,
  "modelAuthored": true
}
```

```json
// exactly what the verifier received — this object carries no missingFact field
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "whyUnresolved": "The observation establishes only that the attendant was not told the rescue plan; it does not establish whether a rescue plan/resource exists but was simply not communicated to him, or whether no functional rescue arrangement exists at all behind the vague permit entry",
  "branchA": "A defined, available rescue capability exists but the attendant was not briefed on it",
  "branchB": "No functional rescue capability exists behind the 'site team' notation",
  "decisionDivergence": {
    "ifA": "Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete",
    "ifB": "Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established"
  },
  "evidenceSpan": "the attendant said he had not been told what the rescue plan was",
  "acceptableEvidence": null
}
```

**The field pair axis Q measures:**

- `missingFact` in the declaration: "Whether an actual, available rescue capability exists corresponding to the permit's 'site team' rescue arrangement"
- `missingFact` present in the projected OwedFact: false

### 8. Verifier v3.3 output

```json
// the verifier record for this fact
{
  "reachedInference": true,
  "verdict": "VERIFIED_AS_IS",
  "rationale": "The single unresolved fact supplied (whether a real rescue capability exists behind the \"site team\" notation, versus none existing at all) is exactly what the first-pass clarification question asks: it asks what specific capability the notation refers to and whether it is actually available and able to respond right now. An answer of \"yes, X team with Y equipment is on standby and can respond in Z minutes\" settles branch A (brief the attendant, continue); an answer of \"no such team/resource actually exists or can respond\" settles branch B (stop work, withdraw entrant). Both branches of the owed fact are reached by the question as written, so it is fully sufficient — there is no piece of the owed fact left unaddressed. The gas-monitor calibration issue is a separate hazard candidate not covered by this unresolved fact, but no unresolved fact about it was supplied for review here, so it is out of scope for this check. I do not see a need to nominate an additional fact: the two flagged issues (monitor calibration, rescue plan knowledge) are the ones the first pass identified as decision-critical, and the calibration one is not part of the unresolved-facts list I was asked to review, so nominating it would exceed my mandate. No other fact stands out as necessary to determine a decision that isn't already covered by the existing candidates or the asked question.",
  "clarificationSourceMode": null,
  "bindingFactKey": null,
  "proposedClarification": null,
  "owedFactDeclarations": [
    {
      "factKey": "FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1",
      "declaration": "STILL_UNRESOLVED",
      "challengeReason": null
    }
  ],
  "regulatoryBasis": {
    "reliance": "NONE",
    "sourceIds": [],
    "proposition": null
  },
  "admissionAdmitted": true,
  "admissionCodes": [],
  "governedEvidenceShownToVerifier": [],
  "rawProviderRecord": {
    "reachedInference": true,
    "httpStatus": 200,
    "respondedModel": "claude-sonnet-5",
    "stopReason": "tool_use",
    "verifierInstructionVersion": "hazlenz.expert.verifier-instruction.v3.2",
    "admissionContractVersion": "hazlenz.expert.verifier.v3.3",
    "suppliedGovernedSourceIds": [],
    "parsed": {
      "verdict": "VERIFIED_AS_IS",
      "rationale": "The single unresolved fact supplied (whether a real rescue capability exists behind the \"site team\" notation, versus none existing at all) is exactly what the first-pass clarification question asks: it asks what specific capability the notation refers to and whether it is actually available and able to respond right now. An answer of \"yes, X team with Y equipment is on standby and can respond in Z minutes\" settles branch A (brief the attendant, continue); an answer of \"no such team/resource actually exists or can respond\" settles branch B (stop work, withdraw entrant). Both branches of the owed fact are reached by the question as written, so it is fully sufficient — there is no piece of the owed fact left unaddressed. The gas-monitor calibration issue is a separate hazard candidate not covered by this unresolved fact, but no unresolved fact about it was supplied for review here, so it is out of scope for this check. I do not see a need to nominate an additional fact: the two flagged issues (monitor calibration, rescue plan knowledge) are the ones the first pass identified as decision-critical, and the calibration one is not part of the unresolved-facts list I was asked to review, so nominating it would exceed my mandate. No other fact stands out as necessary to determine a decision that isn't already covered by the existing candidates or the asked question.",
      "clarificationSourceMode": null,
      "proposedClarification": null,
      "bindingFactKey": null,
      "nominatedFact": null,
      "owedFactDeclarations": [
        {
          "factKey": "FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1",
          "declaration": "STILL_UNRESOLVED",
          "challengeReason": null
        }
      ],
      "regulatoryBasis": {
        "reliance": "NONE",
        "sourceIds": [],
        "proposition": null
      }
    },
    "admission": {
      "admitted": true,
      "codes": [],
      "detail": [],
      "bindingAdmitted": false,
      "nominationAdmitted": false,
      "challengedFactKeys": [],
      "citationViolations": [],
      "citationReuseAdmitted": false,
      "citationReuse": null,
      "unauthorisedCitations": [],
      "regulatoryRelianceDeclared": false,
      "boundSourceIds": []
    }
  }
}
```

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declared evidenceSpan against the preregistered acceptableSpanRegions**
  - compared: declared "the attendant said he had not been told what the rescue plan was" against 2 region(s)
  - finding: the declared span is EXACTLY one of the preregistered regions
  - isAVerdict: false
- **declared affectedDecision against the preregistered expectation**
  - compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives EXPOSURE
  - finding: matches the preregistered expectation
  - isAVerdict: false
- **shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION**
  - compared: 4 neighbour(s) listed
  - finding: the neighbour sharing most vocabulary (60%) is "whether a permit EXISTS — the text states it exists and is signed". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence.
  - isAVerdict: false
- **preregistered conjuncts against the full declaration text**
  - compared: 2 conjunct(s)
  - finding: "a capable rescue arrangement exists…" content-word overlap 75% | "the people who must use it know what it is…" content-word overlap 0%
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Carried forward unchanged and NOT open for judgement:**

- `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:S_GOVERNED_ID_BINDING_APPROPRIATENESS` — axis S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING — value `NOT_EXERCISED`

_N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry._

**Q1. Axis C — OWED_PROPERTY_SEMANTIC_CORRECTNESS**

> Does this declaration identify the EXACT property that remains unknown?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE**

> Is the verbatim span actually relevant to WHY this fact is unresolved?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis E — BRANCH_PLAUSIBILITY**

> Are branchA and branchB genuinely possible resolutions of THIS exact fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:E_BRANCH_PLAUSIBILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis F — DECISION_DIVERGENCE_VALIDITY**

> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:F_DECISION_DIVERGENCE_VALIDITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q5. Axis G — AFFECTED_DECISION_CORRECTNESS**

> Is the fact bound to the correct affectedDecision?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:G_AFFECTED_DECISION_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q6. Axis L — VERIFIER_TARGET_BINDING**

> Does the verifier verdict address the EXACT projected owed fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:L_VERIFIER_TARGET_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q7. Axis M — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q8. Axis Q — OWED_PROPERTY_LOSS_IMPACT**

> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:Q_OWED_PROPERTY_LOSS_IMPACT`
- allowed answers: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q9. Axis R — PRIORITY_FLOOR_IMPACT**

> Does the projected priority floor of OTHER materially under-escalate this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:R_PRIORITY_FLOOR_IMPACT`
- allowed answers: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` · `INDETERMINATE`
- vocabulary source: `SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: yes

**Q10. Axis R — PRIORITY_FLOOR_IMPACT**

> How would you classify this fact's safety significance?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:R_SAFETY_CLASSIFICATION`
- allowed answers: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q11. Axis SUB.TARGET_TOPIC_REACH — TARGET_TOPIC_REACH**

> Did the verifier verdict reach the TOPIC of this projected fact at all?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:TARGET_TOPIC_REACH`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q12. Axis SUB.EXACT_OWED_PROPERTY_BINDING — EXACT_OWED_PROPERTY_BINDING**

> Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:EXACT_OWED_PROPERTY_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q13. Axis SUB.CLARIFICATION_RESOLUTION_SUFFICIENCY — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q14. Axis SUB.AFFECTED_DECISION_ALIGNMENT — AFFECTED_DECISION_ALIGNMENT**

> Is the verifier's treatment aligned with the affectedDecision the projected fact carries?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:AFFECTED_DECISION_ALIGNMENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q15. Axis SUB.BRANCH_DECISION_CONSISTENCY — BRANCH_DECISION_CONSISTENCY**

> Is the verifier's treatment consistent with the two branches and the two decisions it received?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:BRANCH_DECISION_CONSISTENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q16. Axis SUB.CHALLENGE_REVIEWABILITY — CHALLENGE_REVIEWABILITY**

> Where the verifier issued a challenge, is the stated reason reviewable on its face?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:CHALLENGE_REVIEWABILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and enumerates no vocabulary for it. It is carried on every fact unit unfilled.

**Q17. Axis SUB.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION — LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION**

> Did the first-pass missingFact NOT reaching the verifier degrade the verifier's treatment of this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1:LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U05", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U06 · SF-04 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-04`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Overhead gantry crane in the despatch bay. The crane was taken out of service on 2 September after the hoist brake was reported slipping. A repair sheet on the maintenance clipboard shows the brake was replaced on 4 September, that a 1.25x rated load test was carried out and passed on 4 September, and that the appointed person signed the crane back into service on 4 September after that test. The sheet does not record which of the two approved brake part numbers was fitted. The crane was in use lifting palletised stock over the loading area when observed.

```json
// inspection context
{
  "location": "despatch bay",
  "task": "lifting palletised stock with an overhead gantry crane",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-04",
  "capability": "ABSENT",
  "families": [
    "NO_REAL_GAP",
    "TEMPORAL_SCOPE"
  ],
  "pairedWith": "SF-06",
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the brake was replaced on 4 September
- a 1.25x rated load test was carried out and passed on 4 September
- the appointed person signed the crane back into service after that test
- the crane is in use now

**Preregistered as NOT ESTABLISHED by the text:**
- which of the two approved brake part numbers was fitted — a genuine absence that changes nothing about what is done today

```json
// preregistered expected gap count
{
  "min": 0,
  "max": 0
}
```

```json
// preregistered expected owed facts
[]
```

**Preregistered design intent:** The matched partner of SF-06, with the verification and its timing both stated. It additionally plants ONE real but non-decision-critical absence — the brake part number — so precision is tested against a genuine unknown rather than against a complete text. Declaring the part number is a false gap: both answers lead to the same action today.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "CL-1",
      "question": "Which of the two approved brake part numbers was fitted during the 4 September repair?",
      "whyItMatters": "If the part fitted is one of the two approved numbers, the repair is compliant and the crane's continued use lifting palletised stock is appropriately supported by the passed 1.25x load test. If the part fitted is NOT one of the two approved numbers (or cannot be confirmed as either), the brake replacement may not meet the approved configuration despite passing the load test that day, which would call into question whether the crane should remain in service now rather than being re-verified or taken out of service pending confirmation.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "IMPORTANT",
      "evidenceGap": "The repair sheet does not record which of the two approved brake part numbers was fitted."
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The crane's hoist brake failure was remediated: the brake was replaced, a 1.25x rated load test was passed, and the appointed person signed it back into service on 4 September, so no current hazard is established from that history alone. The one open gap is that the repair sheet does not identify which of the two approved brake part numbers was actually fitted, which leaves the configuration of the safety-critical brake component unconfirmed even though the load test passed. No deterministic findings or governed records were supplied, so no regulatory assertion is made here."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "DEC-1",
      "missingFact": "Which of the two approved brake part numbers was installed during the 4 September brake replacement",
      "observationSourceId": "OBS-SF-04",
      "observationSpan": "The sheet does not record which of the two approved brake part numbers was fitted.",
      "notEstablishedBecause": "The text explicitly states the repair sheet does not record which part number was fitted; it does not state that an unapproved part was used, only that the record is silent on which of the two approved options was chosen.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "The fitted part is confirmed to be one of the two approved brake part numbers",
      "decisionIfA": "The repair and return to service are fully supported by the record; no further action needed on the brake identity",
      "branchB": "The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part)",
      "decisionIfB": "The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification",
      "whyNecessaryNow": "The crane is currently in active use lifting palletised stock over the loading area, so the adequacy of the safety-critical brake component bears directly on present operational safety."
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "DEC-1",
    "missingFact": "Which of the two approved brake part numbers was installed during the 4 September brake replacement",
    "observationSourceId": "OBS-SF-04",
    "observationSpan": "The sheet does not record which of the two approved brake part numbers was fitted.",
    "notEstablishedBecause": "The text explicitly states the repair sheet does not record which part number was fitted; it does not state that an unapproved part was used, only that the record is silent on which of the two approved options was chosen.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "The fitted part is confirmed to be one of the two approved brake part numbers",
    "decisionIfA": "The repair and return to service are fully supported by the record; no further action needed on the brake identity",
    "branchB": "The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part)",
    "decisionIfB": "The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification",
    "whyNecessaryNow": "The crane is currently in active use lifting palletised stock over the loading area, so the adequacy of the safety-critical brake component bears directly on present operational safety."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 1 raw / 1 admitted against 0-0
  - finding: the admitted count is OUTSIDE the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-04:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-04:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-04:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-04:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U06", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U07 · SF-04 — projected fact FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1

**Unit kind:** `PROJECTED_FACT` · **row** `SF-04` · **factKey** `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1` · **declarationId** `DEC-1`
**Questions in this unit:** 17 open, 3 structurally pre-filled and carried forward unchanged · 13 count toward the 152, 7 supplementary

### 1. The observation, as the model received it

> Overhead gantry crane in the despatch bay. The crane was taken out of service on 2 September after the hoist brake was reported slipping. A repair sheet on the maintenance clipboard shows the brake was replaced on 4 September, that a 1.25x rated load test was carried out and passed on 4 September, and that the appointed person signed the crane back into service on 4 September after that test. The sheet does not record which of the two approved brake part numbers was fitted. The crane was in use lifting palletised stock over the loading area when observed.

```json
// inspection context
{
  "location": "despatch bay",
  "task": "lifting palletised stock with an overhead gantry crane",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-04",
  "capability": "ABSENT",
  "families": [
    "NO_REAL_GAP",
    "TEMPORAL_SCOPE"
  ],
  "pairedWith": "SF-06",
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the brake was replaced on 4 September
- a 1.25x rated load test was carried out and passed on 4 September
- the appointed person signed the crane back into service after that test
- the crane is in use now

**Preregistered as NOT ESTABLISHED by the text:**
- which of the two approved brake part numbers was fitted — a genuine absence that changes nothing about what is done today

```json
// preregistered expected gap count
{
  "min": 0,
  "max": 0
}
```

```json
// preregistered expected owed facts
[]
```

**Preregistered design intent:** The matched partner of SF-06, with the verification and its timing both stated. It additionally plants ONE real but non-decision-critical absence — the brake part number — so precision is tested against a genuine unknown rather than against a complete text. Declaring the part number is a false gap: both answers lead to the same action today.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "CL-1",
      "question": "Which of the two approved brake part numbers was fitted during the 4 September repair?",
      "whyItMatters": "If the part fitted is one of the two approved numbers, the repair is compliant and the crane's continued use lifting palletised stock is appropriately supported by the passed 1.25x load test. If the part fitted is NOT one of the two approved numbers (or cannot be confirmed as either), the brake replacement may not meet the approved configuration despite passing the load test that day, which would call into question whether the crane should remain in service now rather than being re-verified or taken out of service pending confirmation.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "IMPORTANT",
      "evidenceGap": "The repair sheet does not record which of the two approved brake part numbers was fitted."
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The crane's hoist brake failure was remediated: the brake was replaced, a 1.25x rated load test was passed, and the appointed person signed it back into service on 4 September, so no current hazard is established from that history alone. The one open gap is that the repair sheet does not identify which of the two approved brake part numbers was actually fitted, which leaves the configuration of the safety-critical brake component unconfirmed even though the load test passed. No deterministic findings or governed records were supplied, so no regulatory assertion is made here."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "DEC-1",
      "missingFact": "Which of the two approved brake part numbers was installed during the 4 September brake replacement",
      "observationSourceId": "OBS-SF-04",
      "observationSpan": "The sheet does not record which of the two approved brake part numbers was fitted.",
      "notEstablishedBecause": "The text explicitly states the repair sheet does not record which part number was fitted; it does not state that an unapproved part was used, only that the record is silent on which of the two approved options was chosen.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "The fitted part is confirmed to be one of the two approved brake part numbers",
      "decisionIfA": "The repair and return to service are fully supported by the record; no further action needed on the brake identity",
      "branchB": "The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part)",
      "decisionIfB": "The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification",
      "whyNecessaryNow": "The crane is currently in active use lifting palletised stock over the loading area, so the adequacy of the safety-critical brake component bears directly on present operational safety."
    }
  ]
}
```

### 5. The declaration(s)

```json
// the declaration this unit reviews
[
  {
    "declarationId": "DEC-1",
    "missingFact": "Which of the two approved brake part numbers was installed during the 4 September brake replacement",
    "observationSourceId": "OBS-SF-04",
    "observationSpan": "The sheet does not record which of the two approved brake part numbers was fitted.",
    "notEstablishedBecause": "The text explicitly states the repair sheet does not record which part number was fitted; it does not state that an unapproved part was used, only that the record is silent on which of the two approved options was chosen.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "The fitted part is confirmed to be one of the two approved brake part numbers",
    "decisionIfA": "The repair and return to service are fully supported by the record; no further action needed on the brake identity",
    "branchB": "The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part)",
    "decisionIfB": "The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification",
    "whyNecessaryNow": "The crane is currently in active use lifting palletised stock over the loading area, so the adequacy of the safety-critical brake component bears directly on present operational safety."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": true,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

```json
// the projected OwedFact
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "source": "FIRST_PASS_MODEL",
  "evidenceSpan": "The sheet does not record which of the two approved brake part numbers was fitted.",
  "whyUnresolved": "The text explicitly states the repair sheet does not record which part number was fitted; it does not state that an unapproved part was used, only that the record is silent on which of the two approved options was chosen.",
  "branchA": "The fitted part is confirmed to be one of the two approved brake part numbers",
  "branchB": "The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part)",
  "decisionDivergence": {
    "ifA": "The repair and return to service are fully supported by the record; no further action needed on the brake identity",
    "ifB": "The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification"
  },
  "priority": "OTHER",
  "status": "UNRESOLVED",
  "acceptableEvidence": null,
  "modelAuthored": true
}
```

```json
// exactly what the verifier received — this object carries no missingFact field
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "whyUnresolved": "The text explicitly states the repair sheet does not record which part number was fitted; it does not state that an unapproved part was used, only that the record is silent on which of the two approved options was chosen.",
  "branchA": "The fitted part is confirmed to be one of the two approved brake part numbers",
  "branchB": "The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part)",
  "decisionDivergence": {
    "ifA": "The repair and return to service are fully supported by the record; no further action needed on the brake identity",
    "ifB": "The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification"
  },
  "evidenceSpan": "The sheet does not record which of the two approved brake part numbers was fitted.",
  "acceptableEvidence": null
}
```

**The field pair axis Q measures:**

- `missingFact` in the declaration: "Which of the two approved brake part numbers was installed during the 4 September brake replacement"
- `missingFact` present in the projected OwedFact: false

### 8. Verifier v3.3 output

```json
// the verifier record for this fact
{
  "reachedInference": true,
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "rationale": "The observation states both approved part numbers are \"approved\" — i.e., either would be an acceptable fitment. The repair sheet's silence is only as to WHICH of the two approved numbers was used, not whether an approved part was used at all. A 1.25x rated load test was carried out and passed after the replacement, and the appointed person signed the crane back into service based on that test. The load test is the functional verification of brake performance; it does not depend on which of the two approved part numbers was fitted, since both are approved (i.e., both are deemed suitable for the application by whatever approval process qualified them). Answering the question either way ('part number A was fitted' vs 'part number B was fitted') does not change what is done today: in both cases the brake was replaced with an approved part, tested at 1.25x rated load, passed, and signed back into service by the appointed person. The first-pass analysis itself frames the fact as being about which of the two approved numbers was used, not about whether an unapproved part might have been used — the observation does not support that latter reading, since it affirmatively describes only two approved options and says the sheet fails to record which was chosen, not that the fitted part's approval status is in doubt. Because the two branches of the fact as actually stated (approved part number 1 vs approved part number 2) lead to the identical action today (crane remains in service, no further verification needed), this is a magnitude/detail-with-control-already-in-place situation: the control (replacement with an approved part, verified by passed load test and sign-off) is already stated as in place. Therefore the first-pass clarification, while not wrong to raise administratively, is not decision-changing, and no clarification is required from the verifier's perspective. No additional fact outside those supplied appears to govern a live decision either — the repair, test, and sign-off are all stated as completed and successful.",
  "clarificationSourceMode": null,
  "bindingFactKey": null,
  "proposedClarification": null,
  "owedFactDeclarations": [
    {
      "factKey": "FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1",
      "declaration": "CHALLENGE_FACT_VALIDITY",
      "challengeReason": "The observation states there are two approved brake part numbers and the sheet fails to record only which of those two was fitted, not whether an approved part was used at all. Since both candidate answers are 'an approved part was fitted' (just differing in which specific number), and the replacement was followed by a passed 1.25x rated load test and appointed-person sign-off, both branches lead to the same action today: the crane remains validly returned to service. The fact as framed does not change what is done now."
    }
  ],
  "regulatoryBasis": {
    "reliance": "NONE",
    "sourceIds": [],
    "proposition": null
  },
  "admissionAdmitted": true,
  "admissionCodes": [],
  "governedEvidenceShownToVerifier": [],
  "rawProviderRecord": {
    "reachedInference": true,
    "httpStatus": 200,
    "respondedModel": "claude-sonnet-5",
    "stopReason": "tool_use",
    "verifierInstructionVersion": "hazlenz.expert.verifier-instruction.v3.2",
    "admissionContractVersion": "hazlenz.expert.verifier.v3.3",
    "suppliedGovernedSourceIds": [],
    "parsed": {
      "verdict": "NO_CLARIFICATION_REQUIRED",
      "rationale": "The observation states both approved part numbers are \"approved\" — i.e., either would be an acceptable fitment. The repair sheet's silence is only as to WHICH of the two approved numbers was used, not whether an approved part was used at all. A 1.25x rated load test was carried out and passed after the replacement, and the appointed person signed the crane back into service based on that test. The load test is the functional verification of brake performance; it does not depend on which of the two approved part numbers was fitted, since both are approved (i.e., both are deemed suitable for the application by whatever approval process qualified them). Answering the question either way ('part number A was fitted' vs 'part number B was fitted') does not change what is done today: in both cases the brake was replaced with an approved part, tested at 1.25x rated load, passed, and signed back into service by the appointed person. The first-pass analysis itself frames the fact as being about which of the two approved numbers was used, not about whether an unapproved part might have been used — the observation does not support that latter reading, since it affirmatively describes only two approved options and says the sheet fails to record which was chosen, not that the fitted part's approval status is in doubt. Because the two branches of the fact as actually stated (approved part number 1 vs approved part number 2) lead to the identical action today (crane remains in service, no further verification needed), this is a magnitude/detail-with-control-already-in-place situation: the control (replacement with an approved part, verified by passed load test and sign-off) is already stated as in place. Therefore the first-pass clarification, while not wrong to raise administratively, is not decision-changing, and no clarification is required from the verifier's perspective. No additional fact outside those supplied appears to govern a live decision either — the repair, test, and sign-off are all stated as completed and successful.",
      "clarificationSourceMode": null,
      "proposedClarification": null,
      "bindingFactKey": null,
      "nominatedFact": null,
      "owedFactDeclarations": [
        {
          "factKey": "FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1",
          "declaration": "CHALLENGE_FACT_VALIDITY",
          "challengeReason": "The observation states there are two approved brake part numbers and the sheet fails to record only which of those two was fitted, not whether an approved part was used at all. Since both candidate answers are 'an approved part was fitted' (just differing in which specific number), and the replacement was followed by a passed 1.25x rated load test and appointed-person sign-off, both branches lead to the same action today: the crane remains validly returned to service. The fact as framed does not change what is done now."
        }
      ],
      "regulatoryBasis": {
        "reliance": "NONE",
        "sourceIds": [],
        "proposition": null
      }
    },
    "admission": {
      "admitted": true,
      "codes": [],
      "detail": [],
      "bindingAdmitted": false,
      "nominationAdmitted": false,
      "challengedFactKeys": [
        "FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1"
      ],
      "citationViolations": [],
      "citationReuseAdmitted": false,
      "citationReuse": null,
      "unauthorisedCitations": [],
      "regulatoryRelianceDeclared": false,
      "boundSourceIds": []
    }
  }
}
```

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declared property against a NO-GAP row's frozen truth, which preregistered ZERO expected facts**
  - compared: 1 notEstablishedByTheText entr(ies), 4 establishedByTheText entr(ies)
  - finding: closest notEstablished entry (50% shared vocabulary): "which of the two approved brake part numbers was fitted — a genuine absence that changes nothing about what is done today" — closest established entry (67%): "the brake was replaced on 4 September" — THE QUESTION FOR THE REVIEWER: is this a genuine uncertainty the preregistered truth failed to capture (a TRUTH_SPECIFICATION_DEFECT), a restatement of something already established, or a real but decision-neutral absence?
  - isAVerdict: false
- **declared evidenceSpan**
  - compared: the row preregistered no expected facts
  - finding: the declared span is "The sheet does not record which of the two approved brake part numbers was fitted."; there is no preregistered acceptable region to compare it against on a no-gap row
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Carried forward unchanged and NOT open for judgement:**

- `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:S_GOVERNED_ID_BINDING_APPROPRIATENESS` — axis S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING — value `NOT_EXERCISED`

_N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry._

**Q1. Axis C — OWED_PROPERTY_SEMANTIC_CORRECTNESS**

> Does this declaration identify the EXACT property that remains unknown?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE**

> Is the verbatim span actually relevant to WHY this fact is unresolved?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis E — BRANCH_PLAUSIBILITY**

> Are branchA and branchB genuinely possible resolutions of THIS exact fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:E_BRANCH_PLAUSIBILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis F — DECISION_DIVERGENCE_VALIDITY**

> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:F_DECISION_DIVERGENCE_VALIDITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q5. Axis G — AFFECTED_DECISION_CORRECTNESS**

> Is the fact bound to the correct affectedDecision?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:G_AFFECTED_DECISION_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q6. Axis L — VERIFIER_TARGET_BINDING**

> Does the verifier verdict address the EXACT projected owed fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:L_VERIFIER_TARGET_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q7. Axis M — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q8. Axis Q — OWED_PROPERTY_LOSS_IMPACT**

> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:Q_OWED_PROPERTY_LOSS_IMPACT`
- allowed answers: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q9. Axis R — PRIORITY_FLOOR_IMPACT**

> Does the projected priority floor of OTHER materially under-escalate this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:R_PRIORITY_FLOOR_IMPACT`
- allowed answers: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` · `INDETERMINATE`
- vocabulary source: `SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: yes

**Q10. Axis R — PRIORITY_FLOOR_IMPACT**

> How would you classify this fact's safety significance?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:R_SAFETY_CLASSIFICATION`
- allowed answers: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q11. Axis SUB.TARGET_TOPIC_REACH — TARGET_TOPIC_REACH**

> Did the verifier verdict reach the TOPIC of this projected fact at all?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:TARGET_TOPIC_REACH`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q12. Axis SUB.EXACT_OWED_PROPERTY_BINDING — EXACT_OWED_PROPERTY_BINDING**

> Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:EXACT_OWED_PROPERTY_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q13. Axis SUB.CLARIFICATION_RESOLUTION_SUFFICIENCY — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q14. Axis SUB.AFFECTED_DECISION_ALIGNMENT — AFFECTED_DECISION_ALIGNMENT**

> Is the verifier's treatment aligned with the affectedDecision the projected fact carries?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:AFFECTED_DECISION_ALIGNMENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q15. Axis SUB.BRANCH_DECISION_CONSISTENCY — BRANCH_DECISION_CONSISTENCY**

> Is the verifier's treatment consistent with the two branches and the two decisions it received?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:BRANCH_DECISION_CONSISTENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q16. Axis SUB.CHALLENGE_REVIEWABILITY — CHALLENGE_REVIEWABILITY**

> Where the verifier issued a challenge, is the stated reason reviewable on its face?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:CHALLENGE_REVIEWABILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and enumerates no vocabulary for it. It is carried on every fact unit unfilled.

**Q17. Axis SUB.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION — LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION**

> Did the first-pass missingFact NOT reaching the verifier degrade the verifier's treatment of this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1:LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U07", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U08 · SF-06 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-06`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Overhead gantry crane in the despatch bay. The crane was taken out of service on 2 September after the hoist brake was reported slipping. A repair sheet on the maintenance clipboard shows the brake was replaced on 4 September and carries a signature in the "work completed" box. The "load test" and "returned to service" boxes on the same sheet are blank. The crane was in use lifting palletised stock over the loading area when observed.

```json
// inspection context
{
  "location": "despatch bay",
  "task": "lifting palletised stock with an overhead gantry crane",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-06",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "TEMPORAL_SCOPE"
  ],
  "pairedWith": "SF-04",
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the brake was reported slipping and the crane was taken out of service on 2 September
- the brake was replaced on 4 September
- the "work completed" box carries a signature
- the "load test" and "returned to service" boxes are blank
- the crane is in use lifting loads now

**Preregistered as NOT ESTABLISHED by the text:**
- whether the replaced brake was proven under load before the crane went back into use
- whether anyone formally returned the crane to service

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "hoist brake proven under load before return to service",
    "owedProperty": "whether the replaced hoist brake was verified to hold under load BEFORE the crane was put back into use — the verification and its timing together",
    "conjuncts": [
      "the brake was verified to hold under load",
      "that verification happened before the crane was returned to use"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "The \"load test\" and \"returned to service\" boxes on the same sheet are blank",
      "carries a signature in the \"work completed\" box"
    ],
    "branchSemantics": {
      "aMustMean": "the brake was load-tested and the crane formally returned to service before it was used again",
      "bMustMean": "the crane went back into use without the replaced brake being proven under load"
    },
    "expectedDecisionDivergence": {
      "ifA": "the repair is accepted as complete and lifting continues",
      "ifB": "lifting stops and the crane is withdrawn until the brake is load-tested and the crane is formally returned to service"
    },
    "unacceptableNeighbouringProperties": [
      "whether the brake was REPLACED — the text states it was, on 4 September",
      "whether a repair sheet exists — the text states it does and that it is signed",
      "whether the original slipping fault was real",
      "whether the crane is inspected periodically in general"
    ],
    "designNoteOnCriticality": "an unproven hoist brake on a crane lifting loads over a working area is a dropped-load exposure now; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** TEMPORAL SCOPE. The repair is established; what is open is verification AND its position in time relative to return to service. A declaration that drops the temporal conjunct has lost the thing that makes the fact decision-critical.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "CRANE_RETURNED_WITHOUT_LOAD_TEST",
      "hazardFamily": "mobile_equipment",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-06",
          "quotedText": "The \"load test\" and \"returned to service\" boxes on the same sheet are blank."
        },
        {
          "sourceId": "OBS-SF-06",
          "quotedText": "The crane was in use lifting palletised stock over the loading area when observed."
        }
      ],
      "evidenceBasis": "The repair record shows the brake replacement was signed off but the load test and returned-to-service boxes were left blank, and the crane is nonetheless shown actively lifting palletised stock over the loading area at the time of observation.",
      "reasoning": "A hoist brake that was reported slipping was replaced, but the documented post-repair load test and formal return-to-service verification were not completed on the record, yet the crane is being operated to lift loads over an area where personnel are present (loading area). Operating a crane whose repaired braking system has not been load-tested or formally verified as fit for service presents an active risk of load control failure (e.g. brake slip, dropped load, uncontrolled descent) during current lifting operations.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "STRUCK_BY_DROPPED_LOAD_LOADING_AREA",
      "hazardFamily": "mobile_equipment",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-06",
          "quotedText": "lifting palletised stock over the loading area when observed"
        }
      ],
      "evidenceBasis": "The crane was observed actively lifting palletised stock over the loading area, which is a location where personnel would ordinarily be present or transiting.",
      "reasoning": "Given the unverified brake repair described above, an unplanned load drop or descent during a lift directly over the loading area creates a struck-by/crushing exposure to anyone working in or passing through that area while the lift is in progress.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "CLAR-LOADTEST",
      "question": "Has the replaced hoist brake been load-tested and functionally verified since the repair, even though the repair sheet's load test and returned-to-service boxes are blank?",
      "whyItMatters": "If a load test was in fact performed (by some other means or record) and the brake is confirmed functional, the crane's continued use is supported and no further restriction is needed; if no load test has been performed, the crane is being operated with a safety-critical brake repair unverified, and it should be removed from service and load-tested before further lifts.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "The repair sheet shows the brake replacement was signed complete but the load test and returned-to-service boxes are blank, and the crane is currently in use.",
      "relatesToCandidateKey": "CRANE_RETURNED_WITHOUT_LOAD_TEST"
    }
  ],
  "crossHazardInsights": [
    {
      "insightId": "INSIGHT-UNVERIFIED-BRAKE-LOAD-EXPOSURE",
      "interactionKind": "OTHER",
      "participants": [
        "CRANE_RETURNED_WITHOUT_LOAD_TEST",
        "STRUCK_BY_DROPPED_LOAD_LOADING_AREA"
      ],
      "reasoning": "An unverified brake repair (no completed load test or return-to-service sign-off) combined with active lifting of palletised stock directly over the loading area means any latent brake fault would manifest as a load-control failure precisely where personnel are exposed beneath or near the suspended load, converting an unconfirmed equipment condition into a direct struck-by/crushing risk.",
      "confidence": "HIGH"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The gantry crane's hoist brake was replaced after a slipping report, but the load test and returned-to-service verification on the repair sheet remain blank, and the crane is nonetheless observed actively lifting palletised stock over the loading area. This leaves the repaired braking system unverified during current operations, creating an active mobile-equipment hazard and a corresponding struck-by exposure for anyone in or near the loading area beneath the load. Whether a load test was actually performed by some means not reflected on the sheet is the key open fact that determines whether continued use is acceptable or the crane should be stopped pending verification."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "DECL-LOADTEST",
      "missingFact": "Whether the replaced hoist brake was load-tested and verified functional before the crane returned to lifting operations",
      "observationSourceId": "OBS-SF-06",
      "observationSpan": "The \"load test\" and \"returned to service\" boxes on the same sheet are blank.",
      "notEstablishedBecause": "The sheet shows the repair (brake replacement) was signed as completed, but the load test and returned-to-service boxes being blank only establishes that those specific record entries were not filled in — it does not establish whether a load test was actually performed and simply not documented, or never performed at all.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "A load test was performed and the brake verified functional, but the paperwork was not completed",
      "decisionIfA": "The crane may continue lifting operations, with a corrective action to complete the documentation record",
      "branchB": "No load test was performed and the brake's post-repair function is unverified",
      "decisionIfB": "The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area",
      "whyNecessaryNow": "The crane is currently in active use lifting palletised stock over the loading area, so the correct action today (continue vs. stop pending verification) depends directly on whether the safety-critical brake repair has actually been verified as functional."
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "DECL-LOADTEST",
    "missingFact": "Whether the replaced hoist brake was load-tested and verified functional before the crane returned to lifting operations",
    "observationSourceId": "OBS-SF-06",
    "observationSpan": "The \"load test\" and \"returned to service\" boxes on the same sheet are blank.",
    "notEstablishedBecause": "The sheet shows the repair (brake replacement) was signed as completed, but the load test and returned-to-service boxes being blank only establishes that those specific record entries were not filled in — it does not establish whether a load test was actually performed and simply not documented, or never performed at all.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "A load test was performed and the brake verified functional, but the paperwork was not completed",
    "decisionIfA": "The crane may continue lifting operations, with a corrective action to complete the documentation record",
    "branchB": "No load test was performed and the brake's post-repair function is unverified",
    "decisionIfB": "The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area",
    "whyNecessaryNow": "The crane is currently in active use lifting palletised stock over the loading area, so the correct action today (continue vs. stop pending verification) depends directly on whether the safety-critical brake repair has actually been verified as functional."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 1 raw / 1 admitted against 1-1
  - finding: the admitted count is inside the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-06:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-06:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-06:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-06:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U08", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U09 · SF-06 — projected fact FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1

**Unit kind:** `PROJECTED_FACT` · **row** `SF-06` · **factKey** `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1` · **declarationId** `DECL-LOADTEST`
**Questions in this unit:** 17 open, 3 structurally pre-filled and carried forward unchanged · 13 count toward the 152, 7 supplementary

### 1. The observation, as the model received it

> Overhead gantry crane in the despatch bay. The crane was taken out of service on 2 September after the hoist brake was reported slipping. A repair sheet on the maintenance clipboard shows the brake was replaced on 4 September and carries a signature in the "work completed" box. The "load test" and "returned to service" boxes on the same sheet are blank. The crane was in use lifting palletised stock over the loading area when observed.

```json
// inspection context
{
  "location": "despatch bay",
  "task": "lifting palletised stock with an overhead gantry crane",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-06",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "TEMPORAL_SCOPE"
  ],
  "pairedWith": "SF-04",
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the brake was reported slipping and the crane was taken out of service on 2 September
- the brake was replaced on 4 September
- the "work completed" box carries a signature
- the "load test" and "returned to service" boxes are blank
- the crane is in use lifting loads now

**Preregistered as NOT ESTABLISHED by the text:**
- whether the replaced brake was proven under load before the crane went back into use
- whether anyone formally returned the crane to service

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "hoist brake proven under load before return to service",
    "owedProperty": "whether the replaced hoist brake was verified to hold under load BEFORE the crane was put back into use — the verification and its timing together",
    "conjuncts": [
      "the brake was verified to hold under load",
      "that verification happened before the crane was returned to use"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "The \"load test\" and \"returned to service\" boxes on the same sheet are blank",
      "carries a signature in the \"work completed\" box"
    ],
    "branchSemantics": {
      "aMustMean": "the brake was load-tested and the crane formally returned to service before it was used again",
      "bMustMean": "the crane went back into use without the replaced brake being proven under load"
    },
    "expectedDecisionDivergence": {
      "ifA": "the repair is accepted as complete and lifting continues",
      "ifB": "lifting stops and the crane is withdrawn until the brake is load-tested and the crane is formally returned to service"
    },
    "unacceptableNeighbouringProperties": [
      "whether the brake was REPLACED — the text states it was, on 4 September",
      "whether a repair sheet exists — the text states it does and that it is signed",
      "whether the original slipping fault was real",
      "whether the crane is inspected periodically in general"
    ],
    "designNoteOnCriticality": "an unproven hoist brake on a crane lifting loads over a working area is a dropped-load exposure now; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** TEMPORAL SCOPE. The repair is established; what is open is verification AND its position in time relative to return to service. A declaration that drops the temporal conjunct has lost the thing that makes the fact decision-critical.

```json
// the single expectation §200 pointed at for this fact
{
  "factKeyIntent": "hoist brake proven under load before return to service",
  "owedProperty": "whether the replaced hoist brake was verified to hold under load BEFORE the crane was put back into use — the verification and its timing together",
  "conjuncts": [
    "the brake was verified to hold under load",
    "that verification happened before the crane was returned to use"
  ],
  "expectedAffectedDecision": "REQUIRED_CONTROL",
  "acceptableAlternativeAffectedDecisions": [],
  "acceptableSpanRegions": [
    "The \"load test\" and \"returned to service\" boxes on the same sheet are blank",
    "carries a signature in the \"work completed\" box"
  ],
  "branchSemantics": {
    "aMustMean": "the brake was load-tested and the crane formally returned to service before it was used again",
    "bMustMean": "the crane went back into use without the replaced brake being proven under load"
  },
  "expectedDecisionDivergence": {
    "ifA": "the repair is accepted as complete and lifting continues",
    "ifB": "lifting stops and the crane is withdrawn until the brake is load-tested and the crane is formally returned to service"
  },
  "unacceptableNeighbouringProperties": [
    "whether the brake was REPLACED — the text states it was, on 4 September",
    "whether a repair sheet exists — the text states it does and that it is signed",
    "whether the original slipping fault was real",
    "whether the crane is inspected periodically in general"
  ],
  "designNoteOnCriticality": "an unproven hoist brake on a crane lifting loads over a working area is a dropped-load exposure now; a reviewer may well call this safety-critical"
}
```

**§200's own caveat on that pointer:** chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "CRANE_RETURNED_WITHOUT_LOAD_TEST",
      "hazardFamily": "mobile_equipment",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-06",
          "quotedText": "The \"load test\" and \"returned to service\" boxes on the same sheet are blank."
        },
        {
          "sourceId": "OBS-SF-06",
          "quotedText": "The crane was in use lifting palletised stock over the loading area when observed."
        }
      ],
      "evidenceBasis": "The repair record shows the brake replacement was signed off but the load test and returned-to-service boxes were left blank, and the crane is nonetheless shown actively lifting palletised stock over the loading area at the time of observation.",
      "reasoning": "A hoist brake that was reported slipping was replaced, but the documented post-repair load test and formal return-to-service verification were not completed on the record, yet the crane is being operated to lift loads over an area where personnel are present (loading area). Operating a crane whose repaired braking system has not been load-tested or formally verified as fit for service presents an active risk of load control failure (e.g. brake slip, dropped load, uncontrolled descent) during current lifting operations.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "STRUCK_BY_DROPPED_LOAD_LOADING_AREA",
      "hazardFamily": "mobile_equipment",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-06",
          "quotedText": "lifting palletised stock over the loading area when observed"
        }
      ],
      "evidenceBasis": "The crane was observed actively lifting palletised stock over the loading area, which is a location where personnel would ordinarily be present or transiting.",
      "reasoning": "Given the unverified brake repair described above, an unplanned load drop or descent during a lift directly over the loading area creates a struck-by/crushing exposure to anyone working in or passing through that area while the lift is in progress.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "CLAR-LOADTEST",
      "question": "Has the replaced hoist brake been load-tested and functionally verified since the repair, even though the repair sheet's load test and returned-to-service boxes are blank?",
      "whyItMatters": "If a load test was in fact performed (by some other means or record) and the brake is confirmed functional, the crane's continued use is supported and no further restriction is needed; if no load test has been performed, the crane is being operated with a safety-critical brake repair unverified, and it should be removed from service and load-tested before further lifts.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "The repair sheet shows the brake replacement was signed complete but the load test and returned-to-service boxes are blank, and the crane is currently in use.",
      "relatesToCandidateKey": "CRANE_RETURNED_WITHOUT_LOAD_TEST"
    }
  ],
  "crossHazardInsights": [
    {
      "insightId": "INSIGHT-UNVERIFIED-BRAKE-LOAD-EXPOSURE",
      "interactionKind": "OTHER",
      "participants": [
        "CRANE_RETURNED_WITHOUT_LOAD_TEST",
        "STRUCK_BY_DROPPED_LOAD_LOADING_AREA"
      ],
      "reasoning": "An unverified brake repair (no completed load test or return-to-service sign-off) combined with active lifting of palletised stock directly over the loading area means any latent brake fault would manifest as a load-control failure precisely where personnel are exposed beneath or near the suspended load, converting an unconfirmed equipment condition into a direct struck-by/crushing risk.",
      "confidence": "HIGH"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The gantry crane's hoist brake was replaced after a slipping report, but the load test and returned-to-service verification on the repair sheet remain blank, and the crane is nonetheless observed actively lifting palletised stock over the loading area. This leaves the repaired braking system unverified during current operations, creating an active mobile-equipment hazard and a corresponding struck-by exposure for anyone in or near the loading area beneath the load. Whether a load test was actually performed by some means not reflected on the sheet is the key open fact that determines whether continued use is acceptable or the crane should be stopped pending verification."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "DECL-LOADTEST",
      "missingFact": "Whether the replaced hoist brake was load-tested and verified functional before the crane returned to lifting operations",
      "observationSourceId": "OBS-SF-06",
      "observationSpan": "The \"load test\" and \"returned to service\" boxes on the same sheet are blank.",
      "notEstablishedBecause": "The sheet shows the repair (brake replacement) was signed as completed, but the load test and returned-to-service boxes being blank only establishes that those specific record entries were not filled in — it does not establish whether a load test was actually performed and simply not documented, or never performed at all.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "A load test was performed and the brake verified functional, but the paperwork was not completed",
      "decisionIfA": "The crane may continue lifting operations, with a corrective action to complete the documentation record",
      "branchB": "No load test was performed and the brake's post-repair function is unverified",
      "decisionIfB": "The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area",
      "whyNecessaryNow": "The crane is currently in active use lifting palletised stock over the loading area, so the correct action today (continue vs. stop pending verification) depends directly on whether the safety-critical brake repair has actually been verified as functional."
    }
  ]
}
```

### 5. The declaration(s)

```json
// the declaration this unit reviews
[
  {
    "declarationId": "DECL-LOADTEST",
    "missingFact": "Whether the replaced hoist brake was load-tested and verified functional before the crane returned to lifting operations",
    "observationSourceId": "OBS-SF-06",
    "observationSpan": "The \"load test\" and \"returned to service\" boxes on the same sheet are blank.",
    "notEstablishedBecause": "The sheet shows the repair (brake replacement) was signed as completed, but the load test and returned-to-service boxes being blank only establishes that those specific record entries were not filled in — it does not establish whether a load test was actually performed and simply not documented, or never performed at all.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "A load test was performed and the brake verified functional, but the paperwork was not completed",
    "decisionIfA": "The crane may continue lifting operations, with a corrective action to complete the documentation record",
    "branchB": "No load test was performed and the brake's post-repair function is unverified",
    "decisionIfB": "The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area",
    "whyNecessaryNow": "The crane is currently in active use lifting palletised stock over the loading area, so the correct action today (continue vs. stop pending verification) depends directly on whether the safety-critical brake repair has actually been verified as functional."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": true,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

```json
// the projected OwedFact
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "source": "FIRST_PASS_MODEL",
  "evidenceSpan": "The \"load test\" and \"returned to service\" boxes on the same sheet are blank.",
  "whyUnresolved": "The sheet shows the repair (brake replacement) was signed as completed, but the load test and returned-to-service boxes being blank only establishes that those specific record entries were not filled in — it does not establish whether a load test was actually performed and simply not documented, or never performed at all.",
  "branchA": "A load test was performed and the brake verified functional, but the paperwork was not completed",
  "branchB": "No load test was performed and the brake's post-repair function is unverified",
  "decisionDivergence": {
    "ifA": "The crane may continue lifting operations, with a corrective action to complete the documentation record",
    "ifB": "The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area"
  },
  "priority": "OTHER",
  "status": "UNRESOLVED",
  "acceptableEvidence": null,
  "modelAuthored": true
}
```

```json
// exactly what the verifier received — this object carries no missingFact field
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "whyUnresolved": "The sheet shows the repair (brake replacement) was signed as completed, but the load test and returned-to-service boxes being blank only establishes that those specific record entries were not filled in — it does not establish whether a load test was actually performed and simply not documented, or never performed at all.",
  "branchA": "A load test was performed and the brake verified functional, but the paperwork was not completed",
  "branchB": "No load test was performed and the brake's post-repair function is unverified",
  "decisionDivergence": {
    "ifA": "The crane may continue lifting operations, with a corrective action to complete the documentation record",
    "ifB": "The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area"
  },
  "evidenceSpan": "The \"load test\" and \"returned to service\" boxes on the same sheet are blank.",
  "acceptableEvidence": null
}
```

**The field pair axis Q measures:**

- `missingFact` in the declaration: "Whether the replaced hoist brake was load-tested and verified functional before the crane returned to lifting operations"
- `missingFact` present in the projected OwedFact: false

### 8. Verifier v3.3 output

```json
// the verifier record for this fact
{
  "reachedInference": true,
  "verdict": "VERIFIED_AS_IS",
  "rationale": "The single unresolved fact identified — whether a load test was actually performed post-repair despite blank documentation — is directly decision-critical: if performed, the crane may continue with a paperwork correction; if not performed, the crane must be stopped pending verification given it is actively lifting over an occupied loading area. The first-pass clarification question (\"Has the replaced hoist brake been load-tested and functionally verified since the repair, even though the repair sheet's load test and returned-to-service boxes are blank?\") asks exactly this: it does not merely ask about the paperwork, it asks about the actual performance of the load test and functional verification. An answer of \"yes, verified\" or \"no, not verified\" resolves the fact completely — there is no sub-component of the fact left unaddressed. Reviewing for a fact the first pass may have missed: no other fact in the observation appears to govern a distinct decision. The operator's identity, the specific loading area occupancy at this instant, and the exact repair procedure are either not stated as decision-relevant or do not change what should be done today given the existing hazard framing. No additional nomination is warranted.",
  "clarificationSourceMode": null,
  "bindingFactKey": null,
  "proposedClarification": null,
  "owedFactDeclarations": [
    {
      "factKey": "FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1",
      "declaration": "STILL_UNRESOLVED",
      "challengeReason": null
    }
  ],
  "regulatoryBasis": {
    "reliance": "NONE",
    "sourceIds": [],
    "proposition": null
  },
  "admissionAdmitted": true,
  "admissionCodes": [],
  "governedEvidenceShownToVerifier": [],
  "rawProviderRecord": {
    "reachedInference": true,
    "httpStatus": 200,
    "respondedModel": "claude-sonnet-5",
    "stopReason": "tool_use",
    "verifierInstructionVersion": "hazlenz.expert.verifier-instruction.v3.2",
    "admissionContractVersion": "hazlenz.expert.verifier.v3.3",
    "suppliedGovernedSourceIds": [],
    "parsed": {
      "verdict": "VERIFIED_AS_IS",
      "rationale": "The single unresolved fact identified — whether a load test was actually performed post-repair despite blank documentation — is directly decision-critical: if performed, the crane may continue with a paperwork correction; if not performed, the crane must be stopped pending verification given it is actively lifting over an occupied loading area. The first-pass clarification question (\"Has the replaced hoist brake been load-tested and functionally verified since the repair, even though the repair sheet's load test and returned-to-service boxes are blank?\") asks exactly this: it does not merely ask about the paperwork, it asks about the actual performance of the load test and functional verification. An answer of \"yes, verified\" or \"no, not verified\" resolves the fact completely — there is no sub-component of the fact left unaddressed. Reviewing for a fact the first pass may have missed: no other fact in the observation appears to govern a distinct decision. The operator's identity, the specific loading area occupancy at this instant, and the exact repair procedure are either not stated as decision-relevant or do not change what should be done today given the existing hazard framing. No additional nomination is warranted.",
      "clarificationSourceMode": null,
      "proposedClarification": null,
      "bindingFactKey": null,
      "nominatedFact": null,
      "owedFactDeclarations": [
        {
          "factKey": "FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1",
          "declaration": "STILL_UNRESOLVED",
          "challengeReason": null
        }
      ],
      "regulatoryBasis": {
        "reliance": "NONE",
        "sourceIds": [],
        "proposition": null
      }
    },
    "admission": {
      "admitted": true,
      "codes": [],
      "detail": [],
      "bindingAdmitted": false,
      "nominationAdmitted": false,
      "challengedFactKeys": [],
      "citationViolations": [],
      "citationReuseAdmitted": false,
      "citationReuse": null,
      "unauthorisedCitations": [],
      "regulatoryRelianceDeclared": false,
      "boundSourceIds": []
    }
  }
}
```

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declared evidenceSpan against the preregistered acceptableSpanRegions**
  - compared: declared "The \"load test\" and \"returned to service\" boxes on the same sheet are blank." against 2 region(s)
  - finding: the declared span CONTAINS a preregistered region: "The \"load test\" and \"returned to service\" boxes on the same sheet are blank"
  - isAVerdict: false
- **declared affectedDecision against the preregistered expectation**
  - compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives (none listed)
  - finding: matches the preregistered expectation
  - isAVerdict: false
- **shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION**
  - compared: 4 neighbour(s) listed
  - finding: the neighbour sharing most vocabulary (60%) is "whether the brake was REPLACED — the text states it was, on 4 September". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence.
  - isAVerdict: false
- **preregistered conjuncts against the full declaration text**
  - compared: 2 conjunct(s)
  - finding: "the brake was verified to hold under load…" content-word overlap 67% | "that verification happened before the crane was retu…" content-word overlap 60%
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Carried forward unchanged and NOT open for judgement:**

- `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:S_GOVERNED_ID_BINDING_APPROPRIATENESS` — axis S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING — value `NOT_EXERCISED`

_N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry._

**Q1. Axis C — OWED_PROPERTY_SEMANTIC_CORRECTNESS**

> Does this declaration identify the EXACT property that remains unknown?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE**

> Is the verbatim span actually relevant to WHY this fact is unresolved?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis E — BRANCH_PLAUSIBILITY**

> Are branchA and branchB genuinely possible resolutions of THIS exact fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:E_BRANCH_PLAUSIBILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis F — DECISION_DIVERGENCE_VALIDITY**

> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:F_DECISION_DIVERGENCE_VALIDITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q5. Axis G — AFFECTED_DECISION_CORRECTNESS**

> Is the fact bound to the correct affectedDecision?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:G_AFFECTED_DECISION_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q6. Axis L — VERIFIER_TARGET_BINDING**

> Does the verifier verdict address the EXACT projected owed fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:L_VERIFIER_TARGET_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q7. Axis M — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q8. Axis Q — OWED_PROPERTY_LOSS_IMPACT**

> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:Q_OWED_PROPERTY_LOSS_IMPACT`
- allowed answers: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q9. Axis R — PRIORITY_FLOOR_IMPACT**

> Does the projected priority floor of OTHER materially under-escalate this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:R_PRIORITY_FLOOR_IMPACT`
- allowed answers: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` · `INDETERMINATE`
- vocabulary source: `SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: yes

**Q10. Axis R — PRIORITY_FLOOR_IMPACT**

> How would you classify this fact's safety significance?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:R_SAFETY_CLASSIFICATION`
- allowed answers: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q11. Axis SUB.TARGET_TOPIC_REACH — TARGET_TOPIC_REACH**

> Did the verifier verdict reach the TOPIC of this projected fact at all?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:TARGET_TOPIC_REACH`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q12. Axis SUB.EXACT_OWED_PROPERTY_BINDING — EXACT_OWED_PROPERTY_BINDING**

> Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:EXACT_OWED_PROPERTY_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q13. Axis SUB.CLARIFICATION_RESOLUTION_SUFFICIENCY — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q14. Axis SUB.AFFECTED_DECISION_ALIGNMENT — AFFECTED_DECISION_ALIGNMENT**

> Is the verifier's treatment aligned with the affectedDecision the projected fact carries?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:AFFECTED_DECISION_ALIGNMENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q15. Axis SUB.BRANCH_DECISION_CONSISTENCY — BRANCH_DECISION_CONSISTENCY**

> Is the verifier's treatment consistent with the two branches and the two decisions it received?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:BRANCH_DECISION_CONSISTENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q16. Axis SUB.CHALLENGE_REVIEWABILITY — CHALLENGE_REVIEWABILITY**

> Where the verifier issued a challenge, is the stated reason reviewable on its face?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:CHALLENGE_REVIEWABILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and enumerates no vocabulary for it. It is carried on every fact unit unfilled.

**Q17. Axis SUB.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION — LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION**

> Did the first-pass missingFact NOT reaching the verifier degrade the verifier's treatment of this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1:LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U09", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U10 · SF-05 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-05`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Vertical machining centre in the tool room. The interlocked access door is closed. The status lamp on the control panel shows green, which the operator said means the interlock is made. The interlock switch itself is mounted behind the door frame and was not accessible for inspection. No record of an interlock function test was available on site and nobody present could say when one was last carried out. The machine was cutting when observed.

```json
// inspection context
{
  "location": "tool room",
  "task": "machining a fixture on a vertical machining centre",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-05",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "FUNCTION_VERSUS_APPEARANCE"
  ],
  "pairedWith": "SF-12",
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the access door is closed
- a status lamp shows green and the operator reports that this indicates the interlock is made
- the interlock switch is present but was not accessible for inspection
- no function-test record was available on site
- the machine was cutting

**Preregistered as NOT ESTABLISHED by the text:**
- whether opening the door actually stops hazardous motion
- whether the interlock has ever been function-tested

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "door interlock protective function verified",
    "owedProperty": "whether the access-door interlock actually stops hazardous motion when the door is opened — that is, whether it performs its protective function",
    "conjuncts": [
      "the interlock stops hazardous motion on door opening"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "No record of an interlock function test was available on site",
      "The interlock switch itself is mounted behind the door frame and was not accessible for inspection",
      "nobody present could say when one was last carried out"
    ],
    "branchSemantics": {
      "aMustMean": "the interlock stops hazardous motion when the door is opened",
      "bMustMean": "the interlock does not stop hazardous motion, or is defeated or defective"
    },
    "expectedDecisionDivergence": {
      "ifA": "the interlock is accepted as an effective control and machining continues",
      "ifB": "the machine is taken out of service until the interlock is repaired and proven"
    },
    "unacceptableNeighbouringProperties": [
      "whether an interlock is FITTED — the text states the switch is there",
      "whether the door is CLOSED — the text states it is",
      "whether the status lamp is lit or legible — the text states it shows green",
      "whether the operator understands what the lamp means",
      "whether the switch is accessible for inspection — that is the reason the fact is open, not the fact itself"
    ],
    "designNoteOnCriticality": "an unproven interlock on a machine that is cutting is an access-to-moving-parts exposure now; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** APPEARANCE and STATUS INDICATION versus PROTECTIVE FUNCTION. A green lamp, a closed door and a present switch are all stated. None of them establishes that the interlock works, and a declaration that accepts any of them as the fact is wrong.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "unverified_interlock",
      "hazardFamily": "machine_guarding",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-05",
          "quotedText": "The interlock switch itself is mounted behind the door frame and was not accessible for inspection."
        },
        {
          "sourceId": "OBS-SF-05",
          "quotedText": "No record of an interlock function test was available on site and nobody present could say when one was last carried out."
        }
      ],
      "evidenceBasis": "The physical interlock switch could not be inspected, and no record exists of when its function was last verified. The only indication of interlock status is a status lamp the operator interpreted as meaning the interlock is made.",
      "reasoning": "Reliance on a status lamp interpreted by the operator, without an accessible switch or a documented function test, means the interlock's actual protective function while the machine is cutting cannot be confirmed from the observation. If the interlock is not actually functioning, the door being closed would not prevent access to the hazardous machining area during operation.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "cq1",
      "question": "Can the interlock switch be verified as functioning (by direct inspection, by a function test, or by another means other than the status lamp) rather than relying solely on the status lamp indication?",
      "whyItMatters": "If the interlock is confirmed functioning, the closed door is a valid guard and the machine can continue operating as guarded. If the interlock cannot be confirmed functioning and only the operator-interpreted lamp is available, the machine may be running with an unverified guarding function during active cutting, which would require the machine to be stopped and the interlock verified or repaired before resuming.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether the interlock switch is actually functioning is not established; only a status lamp interpreted by the operator indicates this, the switch itself was inaccessible for inspection, and no test record exists.",
      "relatesToCandidateKey": "unverified_interlock",
      "answersUnresolvedFactDeclarationId": "decl1"
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The machine is actively cutting while access-door guarding relies entirely on a status lamp interpreted by the operator, since the interlock switch itself could not be inspected and no function-test record exists. This is a gap in verified guarding function rather than a confirmed defeat of the interlock, so the hazard is raised as unresolved rather than active or negated. Resolving whether the interlock is genuinely functional determines whether the current cutting operation is adequately guarded or must be stopped pending verification."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "decl1",
      "missingFact": "Whether the interlock switch is functioning as intended",
      "observationSourceId": "OBS-SF-05",
      "observationSpan": "was not accessible for inspection",
      "notEstablishedBecause": "The observation states the switch could not be physically inspected and that no test record exists showing when a function test was last performed; it does not state whether the interlock is actually working or defeated, only that its status is reported via a lamp interpreted by the operator.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "The interlock switch is functioning correctly and reliably signals door position to the control system",
      "decisionIfA": "",
      "branchB": "The interlock switch is not functioning correctly or reliably (worn, miswired, or bypassed) despite the lamp showing green",
      "decisionIfB": "",
      "whyNecessaryNow": "placeholder"
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "decl1",
    "missingFact": "Whether the interlock switch is functioning as intended",
    "observationSourceId": "OBS-SF-05",
    "observationSpan": "was not accessible for inspection",
    "notEstablishedBecause": "The observation states the switch could not be physically inspected and that no test record exists showing when a function test was last performed; it does not state whether the interlock is actually working or defeated, only that its status is reported via a lamp interpreted by the operator.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "The interlock switch is functioning correctly and reliably signals door position to the control system",
    "decisionIfA": "",
    "branchB": "The interlock switch is not functioning correctly or reliably (worn, miswired, or bypassed) despite the lamp showing green",
    "decisionIfB": "",
    "whyNecessaryNow": "placeholder"
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [],
  "rejectedDeclarations": [
    {
      "declarationId": "decl1",
      "codes": [
        "REQUIRED_FIELD_MISSING",
        "REQUIRED_FIELD_MISSING"
      ],
      "detail": [
        "decisionIfA is empty",
        "decisionIfB is empty"
      ]
    }
  ],
  "refusalCodes": [
    "REQUIRED_FIELD_MISSING",
    "REQUIRED_FIELD_MISSING"
  ],
  "refusalDetail": [
    "decisionIfA is empty",
    "decisionIfB is empty"
  ],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 1 raw / 0 admitted against 1-1
  - finding: the admitted count is OUTSIDE the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-05:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-05:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-05:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-05:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U10", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U11 · SF-05 — refused declaration decl1

**Unit kind:** `REFUSED_DECLARATION` · **row** `SF-05` · **declarationId** `decl1`
**Questions in this unit:** 2 open · 0 count toward the 152, 2 supplementary

### 1. The observation, as the model received it

> Vertical machining centre in the tool room. The interlocked access door is closed. The status lamp on the control panel shows green, which the operator said means the interlock is made. The interlock switch itself is mounted behind the door frame and was not accessible for inspection. No record of an interlock function test was available on site and nobody present could say when one was last carried out. The machine was cutting when observed.

```json
// inspection context
{
  "location": "tool room",
  "task": "machining a fixture on a vertical machining centre",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-05",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "FUNCTION_VERSUS_APPEARANCE"
  ],
  "pairedWith": "SF-12",
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the access door is closed
- a status lamp shows green and the operator reports that this indicates the interlock is made
- the interlock switch is present but was not accessible for inspection
- no function-test record was available on site
- the machine was cutting

**Preregistered as NOT ESTABLISHED by the text:**
- whether opening the door actually stops hazardous motion
- whether the interlock has ever been function-tested

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "door interlock protective function verified",
    "owedProperty": "whether the access-door interlock actually stops hazardous motion when the door is opened — that is, whether it performs its protective function",
    "conjuncts": [
      "the interlock stops hazardous motion on door opening"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "No record of an interlock function test was available on site",
      "The interlock switch itself is mounted behind the door frame and was not accessible for inspection",
      "nobody present could say when one was last carried out"
    ],
    "branchSemantics": {
      "aMustMean": "the interlock stops hazardous motion when the door is opened",
      "bMustMean": "the interlock does not stop hazardous motion, or is defeated or defective"
    },
    "expectedDecisionDivergence": {
      "ifA": "the interlock is accepted as an effective control and machining continues",
      "ifB": "the machine is taken out of service until the interlock is repaired and proven"
    },
    "unacceptableNeighbouringProperties": [
      "whether an interlock is FITTED — the text states the switch is there",
      "whether the door is CLOSED — the text states it is",
      "whether the status lamp is lit or legible — the text states it shows green",
      "whether the operator understands what the lamp means",
      "whether the switch is accessible for inspection — that is the reason the fact is open, not the fact itself"
    ],
    "designNoteOnCriticality": "an unproven interlock on a machine that is cutting is an access-to-moving-parts exposure now; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** APPEARANCE and STATUS INDICATION versus PROTECTIVE FUNCTION. A green lamp, a closed door and a present switch are all stated. None of them establishes that the interlock works, and a declaration that accepts any of them as the fact is wrong.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "unverified_interlock",
      "hazardFamily": "machine_guarding",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-05",
          "quotedText": "The interlock switch itself is mounted behind the door frame and was not accessible for inspection."
        },
        {
          "sourceId": "OBS-SF-05",
          "quotedText": "No record of an interlock function test was available on site and nobody present could say when one was last carried out."
        }
      ],
      "evidenceBasis": "The physical interlock switch could not be inspected, and no record exists of when its function was last verified. The only indication of interlock status is a status lamp the operator interpreted as meaning the interlock is made.",
      "reasoning": "Reliance on a status lamp interpreted by the operator, without an accessible switch or a documented function test, means the interlock's actual protective function while the machine is cutting cannot be confirmed from the observation. If the interlock is not actually functioning, the door being closed would not prevent access to the hazardous machining area during operation.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "cq1",
      "question": "Can the interlock switch be verified as functioning (by direct inspection, by a function test, or by another means other than the status lamp) rather than relying solely on the status lamp indication?",
      "whyItMatters": "If the interlock is confirmed functioning, the closed door is a valid guard and the machine can continue operating as guarded. If the interlock cannot be confirmed functioning and only the operator-interpreted lamp is available, the machine may be running with an unverified guarding function during active cutting, which would require the machine to be stopped and the interlock verified or repaired before resuming.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether the interlock switch is actually functioning is not established; only a status lamp interpreted by the operator indicates this, the switch itself was inaccessible for inspection, and no test record exists.",
      "relatesToCandidateKey": "unverified_interlock",
      "answersUnresolvedFactDeclarationId": "decl1"
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The machine is actively cutting while access-door guarding relies entirely on a status lamp interpreted by the operator, since the interlock switch itself could not be inspected and no function-test record exists. This is a gap in verified guarding function rather than a confirmed defeat of the interlock, so the hazard is raised as unresolved rather than active or negated. Resolving whether the interlock is genuinely functional determines whether the current cutting operation is adequately guarded or must be stopped pending verification."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "decl1",
      "missingFact": "Whether the interlock switch is functioning as intended",
      "observationSourceId": "OBS-SF-05",
      "observationSpan": "was not accessible for inspection",
      "notEstablishedBecause": "The observation states the switch could not be physically inspected and that no test record exists showing when a function test was last performed; it does not state whether the interlock is actually working or defeated, only that its status is reported via a lamp interpreted by the operator.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "The interlock switch is functioning correctly and reliably signals door position to the control system",
      "decisionIfA": "",
      "branchB": "The interlock switch is not functioning correctly or reliably (worn, miswired, or bypassed) despite the lamp showing green",
      "decisionIfB": "",
      "whyNecessaryNow": "placeholder"
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "decl1",
    "missingFact": "Whether the interlock switch is functioning as intended",
    "observationSourceId": "OBS-SF-05",
    "observationSpan": "was not accessible for inspection",
    "notEstablishedBecause": "The observation states the switch could not be physically inspected and that no test record exists showing when a function test was last performed; it does not state whether the interlock is actually working or defeated, only that its status is reported via a lamp interpreted by the operator.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "The interlock switch is functioning correctly and reliably signals door position to the control system",
    "decisionIfA": "",
    "branchB": "The interlock switch is not functioning correctly or reliably (worn, miswired, or bypassed) despite the lamp showing green",
    "decisionIfB": "",
    "whyNecessaryNow": "placeholder"
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [],
  "rejectedDeclarations": [
    {
      "declarationId": "decl1",
      "codes": [
        "REQUIRED_FIELD_MISSING",
        "REQUIRED_FIELD_MISSING"
      ],
      "detail": [
        "decisionIfA is empty",
        "decisionIfB is empty"
      ]
    }
  ],
  "refusalCodes": [
    "REQUIRED_FIELD_MISSING",
    "REQUIRED_FIELD_MISSING"
  ],
  "refusalDetail": [
    "decisionIfA is empty",
    "decisionIfB is empty"
  ],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 1 raw / 0 admitted against 1-1
  - finding: the admitted count is OUTSIDE the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis STRUCTURAL_REFUSAL_CORRECTNESS — STRUCTURAL_REFUSAL_CORRECTNESS**

> was the deterministic boundary RIGHT to refuse this declaration whole, given the contract? Nothing was repaired or completed by deterministic code.

- slot id: `REFUSED:SF-05:decl1:STRUCTURAL_REFUSAL_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 requires these two to be answered SEPARATELY. A structurally malformed output can reveal semantic capability or semantic failure, and these must not be collapsed.

**Q2. Axis UNDERLYING_SEMANTIC_INTENT — UNDERLYING_SEMANTIC_INTENT**

> setting the malformation aside, did the model appear to identify a LEGITIMATE unresolved fact? A structurally malformed output can reveal semantic capability or semantic failure, and these must not be collapsed.

- slot id: `REFUSED:SF-05:decl1:UNDERLYING_SEMANTIC_INTENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 requires these two to be answered SEPARATELY. A structurally malformed output can reveal semantic capability or semantic failure, and these must not be collapsed.

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U11", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U12 · SF-12 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-12`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Vertical machining centre in the tool room. The interlocked access door is closed. The maintenance technician demonstrated the interlock in the inspector's presence: with the machine in cycle, opening the door stopped spindle rotation and all axis motion, and the machine would not restart until the door was closed and the cycle re-initiated. The test was entered on the machine log sheet and countersigned by the supervisor. The machine was cutting when observed.

```json
// inspection context
{
  "location": "tool room",
  "task": "machining a fixture on a vertical machining centre",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-12",
  "capability": "ABSENT",
  "families": [
    "NO_REAL_GAP",
    "FUNCTION_VERSUS_APPEARANCE"
  ],
  "pairedWith": "SF-05",
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": [
    {
      "findingKey": "DET-SF12-1",
      "hazardFamily": "machine_guarding",
      "conditionState": "CONTROLLED",
      "isLifeCritical": false,
      "isActionable": false,
      "requiredActions": []
    }
  ]
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the access door is closed
- the interlock was function-tested in the inspector's presence and stopped spindle and axis motion on door opening
- restart required the door closed and the cycle re-initiated
- the test was recorded and countersigned

**Preregistered as NOT ESTABLISHED by the text:**
_(none)_

```json
// preregistered expected gap count
{
  "min": 0,
  "max": 0
}
```

```json
// preregistered expected owed facts
[]
```

**Preregistered design intent:** The matched partner of SF-05 with the protective function demonstrated rather than indicated. Also the only row carrying a deterministic finding, so false-gap suppression is tested with a populated deterministic context rather than an empty one.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "NOTHING_TO_ADD"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The interlock on the vertical machining centre was demonstrated functional in the inspector's presence — opening the door during cycle stopped spindle rotation and axis motion, and the test was logged and countersigned — consistent with the deterministic finding of a controlled machine guarding condition. The machine was observed cutting with the door closed, which is the expected and safe configuration for normal operation with a verified interlock. No additional hazard, gap, or interaction is established by the observation."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "NOTHING_TO_ADD",
  "unresolvedFactDeclarations": []
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 0 raw / 0 admitted against 0-0
  - finding: the admitted count is inside the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-12:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-12:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-12:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-12:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U12", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U13 · SF-07 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-07`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Solvent wipe-down bench in the paint prep area. A local exhaust ventilation hood is installed directly above the bench and its fan was running and audible. The system's last recorded examination is dated within the past twelve months and the label is attached to the ducting. Two operators were wiping panels with a ketone-based cleaner in the open. The wiping is carried out about 600 mm forward of the hood face, on the near edge of the bench. No airflow indicator is fitted at the hood and nobody present could say whether the hood draws vapour away from the position where the wiping is actually done.

```json
// inspection context
{
  "location": "paint prep area",
  "task": "solvent wipe-down of panels at an extracted bench",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-07",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "NEARBY_PROPERTY_COMPETITION"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- an LEV hood is installed above the bench
- the fan is running
- the last recorded examination is within the past twelve months
- wiping happens about 600 mm forward of the hood face
- no airflow indicator is fitted
- two operators are working with a ketone-based cleaner now

**Preregistered as NOT ESTABLISHED by the text:**
- whether the LEV actually captures solvent vapour at the position where the wiping is done

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "LEV capture effectiveness at the actual work position",
    "owedProperty": "whether the local exhaust ventilation actually captures solvent vapour at the position where the wiping is carried out, about 600 mm forward of the hood face",
    "conjuncts": [
      "the LEV captures vapour at the actual work position"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [
      "EXPOSURE"
    ],
    "acceptableSpanRegions": [
      "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
      "The wiping is carried out about 600 mm forward of the hood face",
      "No airflow indicator is fitted at the hood"
    ],
    "branchSemantics": {
      "aMustMean": "the LEV captures vapour effectively at the position where wiping occurs",
      "bMustMean": "the LEV does not capture vapour at that position and operators are breathing it"
    },
    "expectedDecisionDivergence": {
      "ifA": "the LEV is accepted as an effective control and wiping continues at the bench",
      "ifB": "wiping is moved into the capture zone, or stopped, until capture at the work position is established"
    },
    "unacceptableNeighbouringProperties": [
      "whether an LEV is INSTALLED — the text states it is",
      "whether the fan is RUNNING — the text states it is",
      "whether the system has been EXAMINED — the text states the examination is within twelve months",
      "whether an airflow indicator is fitted — that is the reason the fact is open, not the fact",
      "whether respiratory protective equipment is worn — not raised by the text"
    ],
    "designNoteOnCriticality": "ineffective capture with operators wiping ketone in the open is an inhalation exposure now; a reviewer may judge this important rather than immediately life-critical"
  }
]
```

**Preregistered design intent:** INSTALLATION and EXAMINATION versus EFFECTIVENESS AT THE WORK POSITION. Three strong neighbours are established, and the geometry — 600 mm forward of the hood face — is the objective reason the effectiveness question is live rather than imagined.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "CAND-1",
      "hazardFamily": "chemical_exposure",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-07",
          "quotedText": "Two operators were wiping panels with a ketone-based cleaner in the open"
        },
        {
          "sourceId": "OBS-SF-07",
          "quotedText": "The wiping is carried out about 600 mm forward of the hood face, on the near edge of the bench"
        },
        {
          "sourceId": "OBS-SF-07",
          "quotedText": "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done"
        }
      ],
      "evidenceBasis": "The observation establishes that two operators are actively wiping panels with a ketone-based solvent at a position offset from the hood face, and that nobody present could determine whether the hood's capture effect reaches that position.",
      "reasoning": "The task is being performed now, using an evaporative ketone solvent, at a location (600 mm forward, near edge of bench) where capture effectiveness is stated as unknown to those present. This is a current inhalation exposure to solvent vapour during an ongoing task, not a hypothetical — the operators are actively at the point of generation while capture at that point is unconfirmed.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "CAND-2",
      "hazardFamily": "fire_explosion",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-07",
          "quotedText": "ketone-based cleaner"
        }
      ],
      "evidenceBasis": "The observation identifies the cleaner as ketone-based, a class of solvent that is commonly flammable, but the text does not state its flashpoint, quantity in use, or presence of ignition sources at the bench.",
      "reasoning": "Ketone solvents are frequently flammable and used in an open wipe-down process; without stated ignition sources, quantities, or flashpoint data, an active fire/explosion hazard cannot be confirmed from this text alone, but the possibility of vapour accumulation near an unconfirmed-capture LEV system is worth flagging at low confidence.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "CL-1",
      "question": "What is the measured or verified capture velocity/airflow at the actual wiping position (600 mm forward of the hood face, near edge of bench), and does it meet the effective capture range for this hood design?",
      "whyItMatters": "If capture velocity at the wiping position is adequate, the operators are effectively protected by LEV despite being off-axis, and no additional control is needed beyond continued monitoring. If capture at that position is inadequate, operators are being exposed to un-captured ketone vapour during an active task and the work must stop or move until effective capture is confirmed, or additional controls (respirators, hood repositioning, work practice change) must be implemented now.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "No airflow indicator is fitted at the hood and no one present could state whether the hood draws vapour away from the actual wiping position.",
      "relatesToCandidateKey": "CAND-1",
      "answersUnresolvedFactDeclarationId": "DECL-1"
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "Two operators are currently wiping panels with a ketone-based solvent at a bench position 600 mm forward of the LEV hood face, and the observation states plainly that nobody present could confirm the hood actually captures vapour at that working position — this is a live, unresolved chemical exposure question rather than a settled control. The hood's fan running and its recent examination record speak to the system's general functional status, not to whether it achieves effective capture at the specific point where the work is done, so those facts do not close the gap. A ketone solvent also raises a secondary, currently unconfirmed flammability consideration given no data on flashpoint, quantity, or ignition sources, which is retained at low confidence pending further information."
  },
  "uncertainty": {
    "statements": [
      "Whether the ketone-based cleaner's specific flashpoint and the presence or absence of ignition sources near the bench would elevate the fire/explosion possibility could not be determined from the observation."
    ]
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "DECL-1",
      "missingFact": "Whether the hood achieves effective vapour capture at the actual wiping position 600 mm forward of the hood face",
      "observationSourceId": "OBS-SF-07",
      "observationSpan": "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
      "notEstablishedBecause": "The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point",
      "decisionIfA": "Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance",
      "branchB": "Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point",
      "decisionIfB": "Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming",
      "whyNecessaryNow": "Operators are actively performing the solvent wipe-down task now with an evaporative ketone solvent, so the adequacy of vapour capture at their actual working position determines whether they are currently exposed above safe levels; this cannot be deferred while the task continues."
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "DECL-1",
    "missingFact": "Whether the hood achieves effective vapour capture at the actual wiping position 600 mm forward of the hood face",
    "observationSourceId": "OBS-SF-07",
    "observationSpan": "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
    "notEstablishedBecause": "The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point",
    "decisionIfA": "Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance",
    "branchB": "Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point",
    "decisionIfB": "Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming",
    "whyNecessaryNow": "Operators are actively performing the solvent wipe-down task now with an evaporative ketone solvent, so the adequacy of vapour capture at their actual working position determines whether they are currently exposed above safe levels; this cannot be deferred while the task continues."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 1 raw / 1 admitted against 1-1
  - finding: the admitted count is inside the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-07:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-07:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-07:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-07:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U13", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U14 · SF-07 — projected fact FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1

**Unit kind:** `PROJECTED_FACT` · **row** `SF-07` · **factKey** `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1` · **declarationId** `DECL-1`
**Questions in this unit:** 17 open, 3 structurally pre-filled and carried forward unchanged · 13 count toward the 152, 7 supplementary

### 1. The observation, as the model received it

> Solvent wipe-down bench in the paint prep area. A local exhaust ventilation hood is installed directly above the bench and its fan was running and audible. The system's last recorded examination is dated within the past twelve months and the label is attached to the ducting. Two operators were wiping panels with a ketone-based cleaner in the open. The wiping is carried out about 600 mm forward of the hood face, on the near edge of the bench. No airflow indicator is fitted at the hood and nobody present could say whether the hood draws vapour away from the position where the wiping is actually done.

```json
// inspection context
{
  "location": "paint prep area",
  "task": "solvent wipe-down of panels at an extracted bench",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-07",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "NEARBY_PROPERTY_COMPETITION"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- an LEV hood is installed above the bench
- the fan is running
- the last recorded examination is within the past twelve months
- wiping happens about 600 mm forward of the hood face
- no airflow indicator is fitted
- two operators are working with a ketone-based cleaner now

**Preregistered as NOT ESTABLISHED by the text:**
- whether the LEV actually captures solvent vapour at the position where the wiping is done

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "LEV capture effectiveness at the actual work position",
    "owedProperty": "whether the local exhaust ventilation actually captures solvent vapour at the position where the wiping is carried out, about 600 mm forward of the hood face",
    "conjuncts": [
      "the LEV captures vapour at the actual work position"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [
      "EXPOSURE"
    ],
    "acceptableSpanRegions": [
      "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
      "The wiping is carried out about 600 mm forward of the hood face",
      "No airflow indicator is fitted at the hood"
    ],
    "branchSemantics": {
      "aMustMean": "the LEV captures vapour effectively at the position where wiping occurs",
      "bMustMean": "the LEV does not capture vapour at that position and operators are breathing it"
    },
    "expectedDecisionDivergence": {
      "ifA": "the LEV is accepted as an effective control and wiping continues at the bench",
      "ifB": "wiping is moved into the capture zone, or stopped, until capture at the work position is established"
    },
    "unacceptableNeighbouringProperties": [
      "whether an LEV is INSTALLED — the text states it is",
      "whether the fan is RUNNING — the text states it is",
      "whether the system has been EXAMINED — the text states the examination is within twelve months",
      "whether an airflow indicator is fitted — that is the reason the fact is open, not the fact",
      "whether respiratory protective equipment is worn — not raised by the text"
    ],
    "designNoteOnCriticality": "ineffective capture with operators wiping ketone in the open is an inhalation exposure now; a reviewer may judge this important rather than immediately life-critical"
  }
]
```

**Preregistered design intent:** INSTALLATION and EXAMINATION versus EFFECTIVENESS AT THE WORK POSITION. Three strong neighbours are established, and the geometry — 600 mm forward of the hood face — is the objective reason the effectiveness question is live rather than imagined.

```json
// the single expectation §200 pointed at for this fact
{
  "factKeyIntent": "LEV capture effectiveness at the actual work position",
  "owedProperty": "whether the local exhaust ventilation actually captures solvent vapour at the position where the wiping is carried out, about 600 mm forward of the hood face",
  "conjuncts": [
    "the LEV captures vapour at the actual work position"
  ],
  "expectedAffectedDecision": "REQUIRED_CONTROL",
  "acceptableAlternativeAffectedDecisions": [
    "EXPOSURE"
  ],
  "acceptableSpanRegions": [
    "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
    "The wiping is carried out about 600 mm forward of the hood face",
    "No airflow indicator is fitted at the hood"
  ],
  "branchSemantics": {
    "aMustMean": "the LEV captures vapour effectively at the position where wiping occurs",
    "bMustMean": "the LEV does not capture vapour at that position and operators are breathing it"
  },
  "expectedDecisionDivergence": {
    "ifA": "the LEV is accepted as an effective control and wiping continues at the bench",
    "ifB": "wiping is moved into the capture zone, or stopped, until capture at the work position is established"
  },
  "unacceptableNeighbouringProperties": [
    "whether an LEV is INSTALLED — the text states it is",
    "whether the fan is RUNNING — the text states it is",
    "whether the system has been EXAMINED — the text states the examination is within twelve months",
    "whether an airflow indicator is fitted — that is the reason the fact is open, not the fact",
    "whether respiratory protective equipment is worn — not raised by the text"
  ],
  "designNoteOnCriticality": "ineffective capture with operators wiping ketone in the open is an inhalation exposure now; a reviewer may judge this important rather than immediately life-critical"
}
```

**§200's own caveat on that pointer:** chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "CAND-1",
      "hazardFamily": "chemical_exposure",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-07",
          "quotedText": "Two operators were wiping panels with a ketone-based cleaner in the open"
        },
        {
          "sourceId": "OBS-SF-07",
          "quotedText": "The wiping is carried out about 600 mm forward of the hood face, on the near edge of the bench"
        },
        {
          "sourceId": "OBS-SF-07",
          "quotedText": "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done"
        }
      ],
      "evidenceBasis": "The observation establishes that two operators are actively wiping panels with a ketone-based solvent at a position offset from the hood face, and that nobody present could determine whether the hood's capture effect reaches that position.",
      "reasoning": "The task is being performed now, using an evaporative ketone solvent, at a location (600 mm forward, near edge of bench) where capture effectiveness is stated as unknown to those present. This is a current inhalation exposure to solvent vapour during an ongoing task, not a hypothetical — the operators are actively at the point of generation while capture at that point is unconfirmed.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    },
    {
      "candidateKey": "CAND-2",
      "hazardFamily": "fire_explosion",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-07",
          "quotedText": "ketone-based cleaner"
        }
      ],
      "evidenceBasis": "The observation identifies the cleaner as ketone-based, a class of solvent that is commonly flammable, but the text does not state its flashpoint, quantity in use, or presence of ignition sources at the bench.",
      "reasoning": "Ketone solvents are frequently flammable and used in an open wipe-down process; without stated ignition sources, quantities, or flashpoint data, an active fire/explosion hazard cannot be confirmed from this text alone, but the possibility of vapour accumulation near an unconfirmed-capture LEV system is worth flagging at low confidence.",
      "confidence": "LOW",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "CL-1",
      "question": "What is the measured or verified capture velocity/airflow at the actual wiping position (600 mm forward of the hood face, near edge of bench), and does it meet the effective capture range for this hood design?",
      "whyItMatters": "If capture velocity at the wiping position is adequate, the operators are effectively protected by LEV despite being off-axis, and no additional control is needed beyond continued monitoring. If capture at that position is inadequate, operators are being exposed to un-captured ketone vapour during an active task and the work must stop or move until effective capture is confirmed, or additional controls (respirators, hood repositioning, work practice change) must be implemented now.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "No airflow indicator is fitted at the hood and no one present could state whether the hood draws vapour away from the actual wiping position.",
      "relatesToCandidateKey": "CAND-1",
      "answersUnresolvedFactDeclarationId": "DECL-1"
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "Two operators are currently wiping panels with a ketone-based solvent at a bench position 600 mm forward of the LEV hood face, and the observation states plainly that nobody present could confirm the hood actually captures vapour at that working position — this is a live, unresolved chemical exposure question rather than a settled control. The hood's fan running and its recent examination record speak to the system's general functional status, not to whether it achieves effective capture at the specific point where the work is done, so those facts do not close the gap. A ketone solvent also raises a secondary, currently unconfirmed flammability consideration given no data on flashpoint, quantity, or ignition sources, which is retained at low confidence pending further information."
  },
  "uncertainty": {
    "statements": [
      "Whether the ketone-based cleaner's specific flashpoint and the presence or absence of ignition sources near the bench would elevate the fire/explosion possibility could not be determined from the observation."
    ]
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "DECL-1",
      "missingFact": "Whether the hood achieves effective vapour capture at the actual wiping position 600 mm forward of the hood face",
      "observationSourceId": "OBS-SF-07",
      "observationSpan": "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
      "notEstablishedBecause": "The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point",
      "decisionIfA": "Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance",
      "branchB": "Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point",
      "decisionIfB": "Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming",
      "whyNecessaryNow": "Operators are actively performing the solvent wipe-down task now with an evaporative ketone solvent, so the adequacy of vapour capture at their actual working position determines whether they are currently exposed above safe levels; this cannot be deferred while the task continues."
    }
  ]
}
```

### 5. The declaration(s)

```json
// the declaration this unit reviews
[
  {
    "declarationId": "DECL-1",
    "missingFact": "Whether the hood achieves effective vapour capture at the actual wiping position 600 mm forward of the hood face",
    "observationSourceId": "OBS-SF-07",
    "observationSpan": "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
    "notEstablishedBecause": "The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point",
    "decisionIfA": "Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance",
    "branchB": "Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point",
    "decisionIfB": "Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming",
    "whyNecessaryNow": "Operators are actively performing the solvent wipe-down task now with an evaporative ketone solvent, so the adequacy of vapour capture at their actual working position determines whether they are currently exposed above safe levels; this cannot be deferred while the task continues."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": true,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

```json
// the projected OwedFact
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "source": "FIRST_PASS_MODEL",
  "evidenceSpan": "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
  "whyUnresolved": "The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine.",
  "branchA": "Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point",
  "branchB": "Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point",
  "decisionDivergence": {
    "ifA": "Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance",
    "ifB": "Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming"
  },
  "priority": "OTHER",
  "status": "UNRESOLVED",
  "acceptableEvidence": null,
  "modelAuthored": true
}
```

```json
// exactly what the verifier received — this object carries no missingFact field
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "whyUnresolved": "The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine.",
  "branchA": "Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point",
  "branchB": "Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point",
  "decisionDivergence": {
    "ifA": "Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance",
    "ifB": "Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming"
  },
  "evidenceSpan": "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done",
  "acceptableEvidence": null
}
```

**The field pair axis Q measures:**

- `missingFact` in the declaration: "Whether the hood achieves effective vapour capture at the actual wiping position 600 mm forward of the hood face"
- `missingFact` present in the projected OwedFact: false

### 8. Verifier v3.3 output

```json
// the verifier record for this fact
{
  "reachedInference": true,
  "verdict": "VERIFIED_AS_IS",
  "rationale": "The observation establishes the LEV fan is running, audible, and was examined within the past twelve months, but explicitly states nobody present could confirm capture effectiveness at the actual 600 mm offset working position. This is a control-verification gap (a working system is not thereby a system checked at the point of use), and the two possible answers lead to materially different actions today: continue current practice vs. stop/relocate the task and add supplementary controls. The first-pass clarification directly asks for the measured/verified capture velocity/airflow at that exact working position and whether it meets the effective capture range — this question, if answered, would resolve the fact in full; there is no sub-component of the fact left untouched by it. No second fact from the observation appears to govern a different live decision: the fire/explosion candidate is already at INSUFFICIENT_EVIDENCE and the first pass reasonably treated it as low-confidence and non-actionable without flashpoint/ignition source data, but nothing in the text suggests an ignition source is present or that a decision is being made now that turns on it. The clarification asked is sufficient and correctly targeted; no additional nomination is warranted.",
  "clarificationSourceMode": null,
  "bindingFactKey": null,
  "proposedClarification": null,
  "owedFactDeclarations": [
    {
      "factKey": "FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1",
      "declaration": "STILL_UNRESOLVED",
      "challengeReason": null
    }
  ],
  "regulatoryBasis": {
    "reliance": "NONE",
    "sourceIds": [],
    "proposition": null
  },
  "admissionAdmitted": true,
  "admissionCodes": [],
  "governedEvidenceShownToVerifier": [],
  "rawProviderRecord": {
    "reachedInference": true,
    "httpStatus": 200,
    "respondedModel": "claude-sonnet-5",
    "stopReason": "tool_use",
    "verifierInstructionVersion": "hazlenz.expert.verifier-instruction.v3.2",
    "admissionContractVersion": "hazlenz.expert.verifier.v3.3",
    "suppliedGovernedSourceIds": [],
    "parsed": {
      "verdict": "VERIFIED_AS_IS",
      "rationale": "The observation establishes the LEV fan is running, audible, and was examined within the past twelve months, but explicitly states nobody present could confirm capture effectiveness at the actual 600 mm offset working position. This is a control-verification gap (a working system is not thereby a system checked at the point of use), and the two possible answers lead to materially different actions today: continue current practice vs. stop/relocate the task and add supplementary controls. The first-pass clarification directly asks for the measured/verified capture velocity/airflow at that exact working position and whether it meets the effective capture range — this question, if answered, would resolve the fact in full; there is no sub-component of the fact left untouched by it. No second fact from the observation appears to govern a different live decision: the fire/explosion candidate is already at INSUFFICIENT_EVIDENCE and the first pass reasonably treated it as low-confidence and non-actionable without flashpoint/ignition source data, but nothing in the text suggests an ignition source is present or that a decision is being made now that turns on it. The clarification asked is sufficient and correctly targeted; no additional nomination is warranted.",
      "clarificationSourceMode": null,
      "proposedClarification": null,
      "bindingFactKey": null,
      "nominatedFact": null,
      "owedFactDeclarations": [
        {
          "factKey": "FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1",
          "declaration": "STILL_UNRESOLVED",
          "challengeReason": null
        }
      ],
      "regulatoryBasis": {
        "reliance": "NONE",
        "sourceIds": [],
        "proposition": null
      }
    },
    "admission": {
      "admitted": true,
      "codes": [],
      "detail": [],
      "bindingAdmitted": false,
      "nominationAdmitted": false,
      "challengedFactKeys": [],
      "citationViolations": [],
      "citationReuseAdmitted": false,
      "citationReuse": null,
      "unauthorisedCitations": [],
      "regulatoryRelianceDeclared": false,
      "boundSourceIds": []
    }
  }
}
```

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declared evidenceSpan against the preregistered acceptableSpanRegions**
  - compared: declared "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done" against 3 region(s)
  - finding: the declared span is EXACTLY one of the preregistered regions
  - isAVerdict: false
- **declared affectedDecision against the preregistered expectation**
  - compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives EXPOSURE
  - finding: matches the preregistered expectation
  - isAVerdict: false
- **shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION**
  - compared: 5 neighbour(s) listed
  - finding: the neighbour sharing most vocabulary (33%) is "whether an LEV is INSTALLED — the text states it is". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence.
  - isAVerdict: false
- **preregistered conjuncts against the full declaration text**
  - compared: 1 conjunct(s)
  - finding: the expected fact is not conjunctive
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Carried forward unchanged and NOT open for judgement:**

- `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:S_GOVERNED_ID_BINDING_APPROPRIATENESS` — axis S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING — value `NOT_EXERCISED`

_N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry._

**Q1. Axis C — OWED_PROPERTY_SEMANTIC_CORRECTNESS**

> Does this declaration identify the EXACT property that remains unknown?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE**

> Is the verbatim span actually relevant to WHY this fact is unresolved?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis E — BRANCH_PLAUSIBILITY**

> Are branchA and branchB genuinely possible resolutions of THIS exact fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:E_BRANCH_PLAUSIBILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis F — DECISION_DIVERGENCE_VALIDITY**

> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:F_DECISION_DIVERGENCE_VALIDITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q5. Axis G — AFFECTED_DECISION_CORRECTNESS**

> Is the fact bound to the correct affectedDecision?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:G_AFFECTED_DECISION_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q6. Axis L — VERIFIER_TARGET_BINDING**

> Does the verifier verdict address the EXACT projected owed fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:L_VERIFIER_TARGET_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q7. Axis M — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q8. Axis Q — OWED_PROPERTY_LOSS_IMPACT**

> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:Q_OWED_PROPERTY_LOSS_IMPACT`
- allowed answers: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q9. Axis R — PRIORITY_FLOOR_IMPACT**

> Does the projected priority floor of OTHER materially under-escalate this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:R_PRIORITY_FLOOR_IMPACT`
- allowed answers: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` · `INDETERMINATE`
- vocabulary source: `SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: yes

**Q10. Axis R — PRIORITY_FLOOR_IMPACT**

> How would you classify this fact's safety significance?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:R_SAFETY_CLASSIFICATION`
- allowed answers: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q11. Axis SUB.TARGET_TOPIC_REACH — TARGET_TOPIC_REACH**

> Did the verifier verdict reach the TOPIC of this projected fact at all?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:TARGET_TOPIC_REACH`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q12. Axis SUB.EXACT_OWED_PROPERTY_BINDING — EXACT_OWED_PROPERTY_BINDING**

> Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:EXACT_OWED_PROPERTY_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q13. Axis SUB.CLARIFICATION_RESOLUTION_SUFFICIENCY — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q14. Axis SUB.AFFECTED_DECISION_ALIGNMENT — AFFECTED_DECISION_ALIGNMENT**

> Is the verifier's treatment aligned with the affectedDecision the projected fact carries?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:AFFECTED_DECISION_ALIGNMENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q15. Axis SUB.BRANCH_DECISION_CONSISTENCY — BRANCH_DECISION_CONSISTENCY**

> Is the verifier's treatment consistent with the two branches and the two decisions it received?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:BRANCH_DECISION_CONSISTENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q16. Axis SUB.CHALLENGE_REVIEWABILITY — CHALLENGE_REVIEWABILITY**

> Where the verifier issued a challenge, is the stated reason reviewable on its face?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:CHALLENGE_REVIEWABILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and enumerates no vocabulary for it. It is carried on every fact unit unfilled.

**Q17. Axis SUB.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION — LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION**

> Did the first-pass missingFact NOT reaching the verifier degrade the verifier's treatment of this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1:LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U14", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U15 · SF-08 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-08`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Electrical panel maintenance at the compressor house. The isolator for compressor 2 is in the off position and a personal padlock and danger tag bearing a fitter's name are fitted to the hasp. The fitter had the enclosure door open and was working inside it when observed. The panel contains a capacitor bank. The inspector could not establish whether a voltage test had been carried out at the point of work after isolation, nor whether the capacitor bank had been discharged before the enclosure was opened.

```json
// inspection context
{
  "location": "compressor house",
  "task": "electrical maintenance inside a panel enclosure",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-08",
  "capability": "ABSENT",
  "families": [
    "CONJUNCTIVE_FACT"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the isolator is off
- a personal padlock and danger tag naming the fitter are fitted to the hasp
- the fitter is working inside the open enclosure now
- the panel contains a capacitor bank

**Preregistered as NOT ESTABLISHED by the text:**
- whether the circuit was proved dead at the point of work after isolation
- whether the capacitor bank was discharged before the enclosure was opened

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 2
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "panel proved safe to work on — dead at the point of work and stored energy discharged",
    "owedProperty": "whether the panel was proved safe to work on before the enclosure was opened: the circuit proved dead at the point of work AND the capacitor bank discharged",
    "conjuncts": [
      "a voltage test proved the circuit dead at the point of work after isolation",
      "the capacitor bank was discharged before the enclosure was opened"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "could not establish whether a voltage test had been carried out at the point of work after isolation",
      "nor whether the capacitor bank had been discharged before the enclosure was opened"
    ],
    "branchSemantics": {
      "aMustMean": "both the dead test and the capacitor discharge were done before work began",
      "bMustMean": "one or both were not done, so the fitter may be working on live or stored energy"
    },
    "expectedDecisionDivergence": {
      "ifA": "the isolation is accepted as proved and the work continues",
      "ifB": "the work stops immediately and the panel is proved dead and discharged before it resumes"
    },
    "unacceptableNeighbouringProperties": [
      "whether the isolator is OFF — the text states it is",
      "whether a padlock and tag are FITTED — the text states they are",
      "whether the fitter is authorised or trained",
      "whether a permit exists — not raised by the text"
    ],
    "designNoteOnCriticality": "a person working inside an enclosure that may be live or holding stored charge is an electrocution exposure now; a reviewer is likely to call this life-critical"
  }
]
```

**Preregistered design intent:** CONJUNCTIVE. Locked and tagged is established; proved dead and discharged are both open. Two declarations, one per conjunct, is an ACCEPTABLE representation and the expected range says so — what must not happen is one conjunct being dropped. This row is deliberately given a range rather than a single expected count, because forcing a single number here would author an ambiguity into the truth.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "cap-bank-stored-energy",
      "hazardFamily": "electrical",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-08",
          "quotedText": "nor whether the capacitor bank had been discharged before the enclosure was opened"
        }
      ],
      "evidenceBasis": "The observation states the inspector could not establish whether the capacitor bank had been discharged before the enclosure was opened, meaning the discharge status of the capacitor bank at the time of entry is unknown.",
      "reasoning": "A capacitor bank stores electrical energy independently of the isolator position; if not discharged, it remains a live hazard even after the isolator is off, locked and tagged. The fitter has the enclosure open and is working inside it, so if the bank was not discharged, contact or arc exposure is possible right now.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    },
    {
      "candidateKey": "no-voltage-test-verification",
      "hazardFamily": "electrical",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-08",
          "quotedText": "could not establish whether a voltage test had been carried out at the point of work after isolation"
        }
      ],
      "evidenceBasis": "The observation states the inspector could not establish whether a voltage test had been carried out at the point of work after isolation, meaning verification of a de-energized state at the point of work is unknown.",
      "reasoning": "Isolation and lockout/tagout control the source but do not by themselves confirm the point of work is dead; without a voltage test, residual or unexpectedly present voltage (e.g., from backfeed, capacitive storage, or an isolation error) would go undetected while the fitter works with the enclosure open.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "q-cap-discharge",
      "question": "Was the capacitor bank discharged (or verified discharged) before the enclosure was opened and work began?",
      "whyItMatters": "If the capacitor bank was discharged, the stored-energy hazard is controlled and the fitter's current work inside the open enclosure is not exposed to it. If it was not discharged, the fitter is currently working with an energized/charged capacitor bank inside an open enclosure, which is an active life-threatening exposure requiring the work to stop until discharge is confirmed.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether the capacitor bank was discharged before the enclosure was opened is not established.",
      "relatesToCandidateKey": "cap-bank-stored-energy"
    },
    {
      "clarificationId": "q-voltage-test",
      "question": "Was a voltage test performed at the point of work after isolation to confirm a de-energized state before the fitter began working inside the enclosure?",
      "whyItMatters": "If a voltage test was performed and confirmed dead, the point of work is verified safe and the isolation/lockout is sufficient. If no test was performed, the isolation has not been verified effective at the point of work, and the fitter is currently exposed to a possible unconfirmed live condition, requiring the work to stop until a test is carried out.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether a voltage test was carried out at the point of work after isolation is not established.",
      "relatesToCandidateKey": "no-voltage-test-verification"
    }
  ],
  "crossHazardInsights": [
    {
      "insightId": "loto-noverify-open-enclosure",
      "interactionKind": "ELECTRICAL_WET_ENVIRONMENT",
      "participants": [
        "no-voltage-test-verification",
        "cap-bank-stored-energy"
      ],
      "reasoning": "An unverified isolation combined with an unconfirmed capacitor discharge is worse together than either alone: lockout/tagout controls the supply source but does not address stored energy in the capacitor bank, and without a voltage test at the point of work neither the isolation's effectiveness nor the presence of residual charge would be detected before the fitter contacts live parts inside the open enclosure.",
      "confidence": "MODERATE"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The isolator is locked and tagged to the fitter, which controls the normal supply, but the observation leaves open two current-state facts that materially affect whether the point of work is actually safe: whether a voltage test confirmed a dead point of work, and whether the capacitor bank was discharged before the enclosure was opened. Because the fitter is currently working inside the open enclosure, either gap left unresolved means a possible active exposure to stored or unverified electrical energy despite the lockout/tagout being in place. These two unresolved facts interact: lockout controls the source, not stored energy, and only a voltage test would reveal whether either hazard is actually present at the point of work."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "decl-cap-discharge",
      "missingFact": "Whether the capacitor bank was discharged before the enclosure was opened",
      "observationSourceId": "OBS-SF-08",
      "observationSpan": "nor whether the capacitor bank had been discharged before the enclosure was opened",
      "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that discharge did or did not occur.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "The capacitor bank was discharged before the enclosure was opened",
      "decisionIfA": "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis",
      "branchB": "The capacitor bank was not discharged before the enclosure was opened",
      "decisionIfB": "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified",
      "whyNecessaryNow": "The fitter is currently working inside the open enclosure, so the discharge status determines whether an active life-threatening exposure exists right now."
    },
    {
      "declarationId": "decl-voltage-test",
      "missingFact": "Whether a voltage test was carried out at the point of work after isolation",
      "observationSourceId": "OBS-SF-08",
      "observationSpan": "could not establish whether a voltage test had been carried out at the point of work after isolation",
      "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that a test was or was not performed.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "A voltage test was carried out at the point of work confirming a de-energized state",
      "decisionIfA": "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work",
      "branchB": "No voltage test was carried out at the point of work",
      "decisionIfB": "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing",
      "whyNecessaryNow": "The fitter is currently working inside the open enclosure without confirmed verification of a dead point of work, so this determines whether current exposure to live parts exists."
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "decl-cap-discharge",
    "missingFact": "Whether the capacitor bank was discharged before the enclosure was opened",
    "observationSourceId": "OBS-SF-08",
    "observationSpan": "nor whether the capacitor bank had been discharged before the enclosure was opened",
    "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that discharge did or did not occur.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "The capacitor bank was discharged before the enclosure was opened",
    "decisionIfA": "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis",
    "branchB": "The capacitor bank was not discharged before the enclosure was opened",
    "decisionIfB": "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified",
    "whyNecessaryNow": "The fitter is currently working inside the open enclosure, so the discharge status determines whether an active life-threatening exposure exists right now."
  },
  {
    "declarationId": "decl-voltage-test",
    "missingFact": "Whether a voltage test was carried out at the point of work after isolation",
    "observationSourceId": "OBS-SF-08",
    "observationSpan": "could not establish whether a voltage test had been carried out at the point of work after isolation",
    "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that a test was or was not performed.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "A voltage test was carried out at the point of work confirming a de-energized state",
    "decisionIfA": "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work",
    "branchB": "No voltage test was carried out at the point of work",
    "decisionIfB": "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing",
    "whyNecessaryNow": "The fitter is currently working inside the open enclosure without confirmed verification of a dead point of work, so this determines whether current exposure to live parts exists."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1",
    "FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 2 raw / 2 admitted against 1-2
  - finding: the admitted count is inside the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-08:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-08:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-08:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-08:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U15", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U16 · SF-08 — projected fact FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1

**Unit kind:** `PROJECTED_FACT` · **row** `SF-08` · **factKey** `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` · **declarationId** `decl-cap-discharge`
**Questions in this unit:** 17 open, 3 structurally pre-filled and carried forward unchanged · 13 count toward the 152, 7 supplementary

### 1. The observation, as the model received it

> Electrical panel maintenance at the compressor house. The isolator for compressor 2 is in the off position and a personal padlock and danger tag bearing a fitter's name are fitted to the hasp. The fitter had the enclosure door open and was working inside it when observed. The panel contains a capacitor bank. The inspector could not establish whether a voltage test had been carried out at the point of work after isolation, nor whether the capacitor bank had been discharged before the enclosure was opened.

```json
// inspection context
{
  "location": "compressor house",
  "task": "electrical maintenance inside a panel enclosure",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-08",
  "capability": "ABSENT",
  "families": [
    "CONJUNCTIVE_FACT"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the isolator is off
- a personal padlock and danger tag naming the fitter are fitted to the hasp
- the fitter is working inside the open enclosure now
- the panel contains a capacitor bank

**Preregistered as NOT ESTABLISHED by the text:**
- whether the circuit was proved dead at the point of work after isolation
- whether the capacitor bank was discharged before the enclosure was opened

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 2
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "panel proved safe to work on — dead at the point of work and stored energy discharged",
    "owedProperty": "whether the panel was proved safe to work on before the enclosure was opened: the circuit proved dead at the point of work AND the capacitor bank discharged",
    "conjuncts": [
      "a voltage test proved the circuit dead at the point of work after isolation",
      "the capacitor bank was discharged before the enclosure was opened"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "could not establish whether a voltage test had been carried out at the point of work after isolation",
      "nor whether the capacitor bank had been discharged before the enclosure was opened"
    ],
    "branchSemantics": {
      "aMustMean": "both the dead test and the capacitor discharge were done before work began",
      "bMustMean": "one or both were not done, so the fitter may be working on live or stored energy"
    },
    "expectedDecisionDivergence": {
      "ifA": "the isolation is accepted as proved and the work continues",
      "ifB": "the work stops immediately and the panel is proved dead and discharged before it resumes"
    },
    "unacceptableNeighbouringProperties": [
      "whether the isolator is OFF — the text states it is",
      "whether a padlock and tag are FITTED — the text states they are",
      "whether the fitter is authorised or trained",
      "whether a permit exists — not raised by the text"
    ],
    "designNoteOnCriticality": "a person working inside an enclosure that may be live or holding stored charge is an electrocution exposure now; a reviewer is likely to call this life-critical"
  }
]
```

**Preregistered design intent:** CONJUNCTIVE. Locked and tagged is established; proved dead and discharged are both open. Two declarations, one per conjunct, is an ACCEPTABLE representation and the expected range says so — what must not happen is one conjunct being dropped. This row is deliberately given a range rather than a single expected count, because forcing a single number here would author an ambiguity into the truth.

```json
// the single expectation §200 pointed at for this fact
{
  "factKeyIntent": "panel proved safe to work on — dead at the point of work and stored energy discharged",
  "owedProperty": "whether the panel was proved safe to work on before the enclosure was opened: the circuit proved dead at the point of work AND the capacitor bank discharged",
  "conjuncts": [
    "a voltage test proved the circuit dead at the point of work after isolation",
    "the capacitor bank was discharged before the enclosure was opened"
  ],
  "expectedAffectedDecision": "REQUIRED_CONTROL",
  "acceptableAlternativeAffectedDecisions": [],
  "acceptableSpanRegions": [
    "could not establish whether a voltage test had been carried out at the point of work after isolation",
    "nor whether the capacitor bank had been discharged before the enclosure was opened"
  ],
  "branchSemantics": {
    "aMustMean": "both the dead test and the capacitor discharge were done before work began",
    "bMustMean": "one or both were not done, so the fitter may be working on live or stored energy"
  },
  "expectedDecisionDivergence": {
    "ifA": "the isolation is accepted as proved and the work continues",
    "ifB": "the work stops immediately and the panel is proved dead and discharged before it resumes"
  },
  "unacceptableNeighbouringProperties": [
    "whether the isolator is OFF — the text states it is",
    "whether a padlock and tag are FITTED — the text states they are",
    "whether the fitter is authorised or trained",
    "whether a permit exists — not raised by the text"
  ],
  "designNoteOnCriticality": "a person working inside an enclosure that may be live or holding stored charge is an electrocution exposure now; a reviewer is likely to call this life-critical"
}
```

**§200's own caveat on that pointer:** chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "cap-bank-stored-energy",
      "hazardFamily": "electrical",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-08",
          "quotedText": "nor whether the capacitor bank had been discharged before the enclosure was opened"
        }
      ],
      "evidenceBasis": "The observation states the inspector could not establish whether the capacitor bank had been discharged before the enclosure was opened, meaning the discharge status of the capacitor bank at the time of entry is unknown.",
      "reasoning": "A capacitor bank stores electrical energy independently of the isolator position; if not discharged, it remains a live hazard even after the isolator is off, locked and tagged. The fitter has the enclosure open and is working inside it, so if the bank was not discharged, contact or arc exposure is possible right now.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    },
    {
      "candidateKey": "no-voltage-test-verification",
      "hazardFamily": "electrical",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-08",
          "quotedText": "could not establish whether a voltage test had been carried out at the point of work after isolation"
        }
      ],
      "evidenceBasis": "The observation states the inspector could not establish whether a voltage test had been carried out at the point of work after isolation, meaning verification of a de-energized state at the point of work is unknown.",
      "reasoning": "Isolation and lockout/tagout control the source but do not by themselves confirm the point of work is dead; without a voltage test, residual or unexpectedly present voltage (e.g., from backfeed, capacitive storage, or an isolation error) would go undetected while the fitter works with the enclosure open.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "q-cap-discharge",
      "question": "Was the capacitor bank discharged (or verified discharged) before the enclosure was opened and work began?",
      "whyItMatters": "If the capacitor bank was discharged, the stored-energy hazard is controlled and the fitter's current work inside the open enclosure is not exposed to it. If it was not discharged, the fitter is currently working with an energized/charged capacitor bank inside an open enclosure, which is an active life-threatening exposure requiring the work to stop until discharge is confirmed.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether the capacitor bank was discharged before the enclosure was opened is not established.",
      "relatesToCandidateKey": "cap-bank-stored-energy"
    },
    {
      "clarificationId": "q-voltage-test",
      "question": "Was a voltage test performed at the point of work after isolation to confirm a de-energized state before the fitter began working inside the enclosure?",
      "whyItMatters": "If a voltage test was performed and confirmed dead, the point of work is verified safe and the isolation/lockout is sufficient. If no test was performed, the isolation has not been verified effective at the point of work, and the fitter is currently exposed to a possible unconfirmed live condition, requiring the work to stop until a test is carried out.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether a voltage test was carried out at the point of work after isolation is not established.",
      "relatesToCandidateKey": "no-voltage-test-verification"
    }
  ],
  "crossHazardInsights": [
    {
      "insightId": "loto-noverify-open-enclosure",
      "interactionKind": "ELECTRICAL_WET_ENVIRONMENT",
      "participants": [
        "no-voltage-test-verification",
        "cap-bank-stored-energy"
      ],
      "reasoning": "An unverified isolation combined with an unconfirmed capacitor discharge is worse together than either alone: lockout/tagout controls the supply source but does not address stored energy in the capacitor bank, and without a voltage test at the point of work neither the isolation's effectiveness nor the presence of residual charge would be detected before the fitter contacts live parts inside the open enclosure.",
      "confidence": "MODERATE"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The isolator is locked and tagged to the fitter, which controls the normal supply, but the observation leaves open two current-state facts that materially affect whether the point of work is actually safe: whether a voltage test confirmed a dead point of work, and whether the capacitor bank was discharged before the enclosure was opened. Because the fitter is currently working inside the open enclosure, either gap left unresolved means a possible active exposure to stored or unverified electrical energy despite the lockout/tagout being in place. These two unresolved facts interact: lockout controls the source, not stored energy, and only a voltage test would reveal whether either hazard is actually present at the point of work."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "decl-cap-discharge",
      "missingFact": "Whether the capacitor bank was discharged before the enclosure was opened",
      "observationSourceId": "OBS-SF-08",
      "observationSpan": "nor whether the capacitor bank had been discharged before the enclosure was opened",
      "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that discharge did or did not occur.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "The capacitor bank was discharged before the enclosure was opened",
      "decisionIfA": "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis",
      "branchB": "The capacitor bank was not discharged before the enclosure was opened",
      "decisionIfB": "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified",
      "whyNecessaryNow": "The fitter is currently working inside the open enclosure, so the discharge status determines whether an active life-threatening exposure exists right now."
    },
    {
      "declarationId": "decl-voltage-test",
      "missingFact": "Whether a voltage test was carried out at the point of work after isolation",
      "observationSourceId": "OBS-SF-08",
      "observationSpan": "could not establish whether a voltage test had been carried out at the point of work after isolation",
      "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that a test was or was not performed.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "A voltage test was carried out at the point of work confirming a de-energized state",
      "decisionIfA": "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work",
      "branchB": "No voltage test was carried out at the point of work",
      "decisionIfB": "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing",
      "whyNecessaryNow": "The fitter is currently working inside the open enclosure without confirmed verification of a dead point of work, so this determines whether current exposure to live parts exists."
    }
  ]
}
```

### 5. The declaration(s)

```json
// the declaration this unit reviews
[
  {
    "declarationId": "decl-cap-discharge",
    "missingFact": "Whether the capacitor bank was discharged before the enclosure was opened",
    "observationSourceId": "OBS-SF-08",
    "observationSpan": "nor whether the capacitor bank had been discharged before the enclosure was opened",
    "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that discharge did or did not occur.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "The capacitor bank was discharged before the enclosure was opened",
    "decisionIfA": "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis",
    "branchB": "The capacitor bank was not discharged before the enclosure was opened",
    "decisionIfB": "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified",
    "whyNecessaryNow": "The fitter is currently working inside the open enclosure, so the discharge status determines whether an active life-threatening exposure exists right now."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1",
    "FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": true,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

```json
// the projected OwedFact
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "source": "FIRST_PASS_MODEL",
  "evidenceSpan": "nor whether the capacitor bank had been discharged before the enclosure was opened",
  "whyUnresolved": "The observation states only that the inspector could not establish this, not that discharge did or did not occur.",
  "branchA": "The capacitor bank was discharged before the enclosure was opened",
  "branchB": "The capacitor bank was not discharged before the enclosure was opened",
  "decisionDivergence": {
    "ifA": "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis",
    "ifB": "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified"
  },
  "priority": "OTHER",
  "status": "UNRESOLVED",
  "acceptableEvidence": null,
  "modelAuthored": true
}
```

```json
// exactly what the verifier received — this object carries no missingFact field
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "whyUnresolved": "The observation states only that the inspector could not establish this, not that discharge did or did not occur.",
  "branchA": "The capacitor bank was discharged before the enclosure was opened",
  "branchB": "The capacitor bank was not discharged before the enclosure was opened",
  "decisionDivergence": {
    "ifA": "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis",
    "ifB": "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified"
  },
  "evidenceSpan": "nor whether the capacitor bank had been discharged before the enclosure was opened",
  "acceptableEvidence": null
}
```

**The field pair axis Q measures:**

- `missingFact` in the declaration: "Whether the capacitor bank was discharged before the enclosure was opened"
- `missingFact` present in the projected OwedFact: false

### 8. Verifier v3.3 output

```json
// the verifier record for this fact
{
  "reachedInference": true,
  "verdict": "VERIFIED_AS_IS",
  "rationale": "Both unresolved facts identified by the first pass are genuinely decision-critical: lockout/tagout of the isolator controls the normal supply but does not address stored energy in the capacitor bank or confirm a dead point of work. If the bank was not discharged, or if no voltage test was performed, the fitter is currently exposed to live/stored energy while working inside an open enclosure, which would require stopping work now; if both were done, the current work may continue. The first-pass analysis asked exactly two clarifications, each directly targeted at one of these two facts, and each question as written (was the bank discharged/verified discharged; was a voltage test performed to confirm de-energized state) would fully settle the corresponding fact with a single yes/no answer — there is no compound requirement being left partially unaddressed. The only supplied unresolved fact (capacitor discharge) is directly and completely covered by the first clarification question. No additional fact outside those supplied appears necessary: the observation gives no indication of backfeed sources, multiple energy sources, or other controls whose status is ambiguous in a way that would change today's action beyond what's already asked. The set of clarifications is therefore adequate as-is.",
  "clarificationSourceMode": null,
  "bindingFactKey": null,
  "proposedClarification": null,
  "owedFactDeclarations": [
    {
      "factKey": "FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1",
      "declaration": "STILL_UNRESOLVED",
      "challengeReason": null
    }
  ],
  "regulatoryBasis": {
    "reliance": "NONE",
    "sourceIds": [],
    "proposition": null
  },
  "admissionAdmitted": true,
  "admissionCodes": [],
  "governedEvidenceShownToVerifier": [],
  "rawProviderRecord": {
    "reachedInference": true,
    "httpStatus": 200,
    "respondedModel": "claude-sonnet-5",
    "stopReason": "tool_use",
    "verifierInstructionVersion": "hazlenz.expert.verifier-instruction.v3.2",
    "admissionContractVersion": "hazlenz.expert.verifier.v3.3",
    "suppliedGovernedSourceIds": [],
    "parsed": {
      "verdict": "VERIFIED_AS_IS",
      "rationale": "Both unresolved facts identified by the first pass are genuinely decision-critical: lockout/tagout of the isolator controls the normal supply but does not address stored energy in the capacitor bank or confirm a dead point of work. If the bank was not discharged, or if no voltage test was performed, the fitter is currently exposed to live/stored energy while working inside an open enclosure, which would require stopping work now; if both were done, the current work may continue. The first-pass analysis asked exactly two clarifications, each directly targeted at one of these two facts, and each question as written (was the bank discharged/verified discharged; was a voltage test performed to confirm de-energized state) would fully settle the corresponding fact with a single yes/no answer — there is no compound requirement being left partially unaddressed. The only supplied unresolved fact (capacitor discharge) is directly and completely covered by the first clarification question. No additional fact outside those supplied appears necessary: the observation gives no indication of backfeed sources, multiple energy sources, or other controls whose status is ambiguous in a way that would change today's action beyond what's already asked. The set of clarifications is therefore adequate as-is.",
      "clarificationSourceMode": null,
      "proposedClarification": null,
      "bindingFactKey": null,
      "nominatedFact": null,
      "owedFactDeclarations": [
        {
          "factKey": "FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1",
          "declaration": "STILL_UNRESOLVED",
          "challengeReason": null
        }
      ],
      "regulatoryBasis": {
        "reliance": "NONE",
        "sourceIds": [],
        "proposition": null
      }
    },
    "admission": {
      "admitted": true,
      "codes": [],
      "detail": [],
      "bindingAdmitted": false,
      "nominationAdmitted": false,
      "challengedFactKeys": [],
      "citationViolations": [],
      "citationReuseAdmitted": false,
      "citationReuse": null,
      "unauthorisedCitations": [],
      "regulatoryRelianceDeclared": false,
      "boundSourceIds": []
    }
  }
}
```

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declared evidenceSpan against the preregistered acceptableSpanRegions**
  - compared: declared "nor whether the capacitor bank had been discharged before the enclosure was opened" against 2 region(s)
  - finding: the declared span is EXACTLY one of the preregistered regions
  - isAVerdict: false
- **declared affectedDecision against the preregistered expectation**
  - compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives (none listed)
  - finding: matches the preregistered expectation
  - isAVerdict: false
- **shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION**
  - compared: 4 neighbour(s) listed
  - finding: the neighbour sharing most vocabulary (33%) is "whether the isolator is OFF — the text states it is". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence.
  - isAVerdict: false
- **preregistered conjuncts against the full declaration text**
  - compared: 2 conjunct(s)
  - finding: "a voltage test proved the circuit dead at the point …" content-word overlap 0% | "the capacitor bank was discharged before the enclosu…" content-word overlap 100%
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Carried forward unchanged and NOT open for judgement:**

- `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:S_GOVERNED_ID_BINDING_APPROPRIATENESS` — axis S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING — value `NOT_EXERCISED`

_N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry._

**Q1. Axis C — OWED_PROPERTY_SEMANTIC_CORRECTNESS**

> Does this declaration identify the EXACT property that remains unknown?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE**

> Is the verbatim span actually relevant to WHY this fact is unresolved?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis E — BRANCH_PLAUSIBILITY**

> Are branchA and branchB genuinely possible resolutions of THIS exact fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:E_BRANCH_PLAUSIBILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis F — DECISION_DIVERGENCE_VALIDITY**

> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:F_DECISION_DIVERGENCE_VALIDITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q5. Axis G — AFFECTED_DECISION_CORRECTNESS**

> Is the fact bound to the correct affectedDecision?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:G_AFFECTED_DECISION_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q6. Axis L — VERIFIER_TARGET_BINDING**

> Does the verifier verdict address the EXACT projected owed fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:L_VERIFIER_TARGET_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q7. Axis M — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q8. Axis Q — OWED_PROPERTY_LOSS_IMPACT**

> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:Q_OWED_PROPERTY_LOSS_IMPACT`
- allowed answers: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q9. Axis R — PRIORITY_FLOOR_IMPACT**

> Does the projected priority floor of OTHER materially under-escalate this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:R_PRIORITY_FLOOR_IMPACT`
- allowed answers: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` · `INDETERMINATE`
- vocabulary source: `SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: yes

**Q10. Axis R — PRIORITY_FLOOR_IMPACT**

> How would you classify this fact's safety significance?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:R_SAFETY_CLASSIFICATION`
- allowed answers: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q11. Axis SUB.TARGET_TOPIC_REACH — TARGET_TOPIC_REACH**

> Did the verifier verdict reach the TOPIC of this projected fact at all?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:TARGET_TOPIC_REACH`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q12. Axis SUB.EXACT_OWED_PROPERTY_BINDING — EXACT_OWED_PROPERTY_BINDING**

> Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:EXACT_OWED_PROPERTY_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q13. Axis SUB.CLARIFICATION_RESOLUTION_SUFFICIENCY — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q14. Axis SUB.AFFECTED_DECISION_ALIGNMENT — AFFECTED_DECISION_ALIGNMENT**

> Is the verifier's treatment aligned with the affectedDecision the projected fact carries?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:AFFECTED_DECISION_ALIGNMENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q15. Axis SUB.BRANCH_DECISION_CONSISTENCY — BRANCH_DECISION_CONSISTENCY**

> Is the verifier's treatment consistent with the two branches and the two decisions it received?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:BRANCH_DECISION_CONSISTENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q16. Axis SUB.CHALLENGE_REVIEWABILITY — CHALLENGE_REVIEWABILITY**

> Where the verifier issued a challenge, is the stated reason reviewable on its face?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:CHALLENGE_REVIEWABILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and enumerates no vocabulary for it. It is carried on every fact unit unfilled.

**Q17. Axis SUB.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION — LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION**

> Did the first-pass missingFact NOT reaching the verifier degrade the verifier's treatment of this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1:LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U16", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U17 · SF-08 — projected fact FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1

**Unit kind:** `PROJECTED_FACT` · **row** `SF-08` · **factKey** `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` · **declarationId** `decl-voltage-test`
**Questions in this unit:** 17 open, 3 structurally pre-filled and carried forward unchanged · 13 count toward the 152, 7 supplementary

### 1. The observation, as the model received it

> Electrical panel maintenance at the compressor house. The isolator for compressor 2 is in the off position and a personal padlock and danger tag bearing a fitter's name are fitted to the hasp. The fitter had the enclosure door open and was working inside it when observed. The panel contains a capacitor bank. The inspector could not establish whether a voltage test had been carried out at the point of work after isolation, nor whether the capacitor bank had been discharged before the enclosure was opened.

```json
// inspection context
{
  "location": "compressor house",
  "task": "electrical maintenance inside a panel enclosure",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-08",
  "capability": "ABSENT",
  "families": [
    "CONJUNCTIVE_FACT"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- the isolator is off
- a personal padlock and danger tag naming the fitter are fitted to the hasp
- the fitter is working inside the open enclosure now
- the panel contains a capacitor bank

**Preregistered as NOT ESTABLISHED by the text:**
- whether the circuit was proved dead at the point of work after isolation
- whether the capacitor bank was discharged before the enclosure was opened

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 2
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "panel proved safe to work on — dead at the point of work and stored energy discharged",
    "owedProperty": "whether the panel was proved safe to work on before the enclosure was opened: the circuit proved dead at the point of work AND the capacitor bank discharged",
    "conjuncts": [
      "a voltage test proved the circuit dead at the point of work after isolation",
      "the capacitor bank was discharged before the enclosure was opened"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [],
    "acceptableSpanRegions": [
      "could not establish whether a voltage test had been carried out at the point of work after isolation",
      "nor whether the capacitor bank had been discharged before the enclosure was opened"
    ],
    "branchSemantics": {
      "aMustMean": "both the dead test and the capacitor discharge were done before work began",
      "bMustMean": "one or both were not done, so the fitter may be working on live or stored energy"
    },
    "expectedDecisionDivergence": {
      "ifA": "the isolation is accepted as proved and the work continues",
      "ifB": "the work stops immediately and the panel is proved dead and discharged before it resumes"
    },
    "unacceptableNeighbouringProperties": [
      "whether the isolator is OFF — the text states it is",
      "whether a padlock and tag are FITTED — the text states they are",
      "whether the fitter is authorised or trained",
      "whether a permit exists — not raised by the text"
    ],
    "designNoteOnCriticality": "a person working inside an enclosure that may be live or holding stored charge is an electrocution exposure now; a reviewer is likely to call this life-critical"
  }
]
```

**Preregistered design intent:** CONJUNCTIVE. Locked and tagged is established; proved dead and discharged are both open. Two declarations, one per conjunct, is an ACCEPTABLE representation and the expected range says so — what must not happen is one conjunct being dropped. This row is deliberately given a range rather than a single expected count, because forcing a single number here would author an ambiguity into the truth.

```json
// the single expectation §200 pointed at for this fact
{
  "factKeyIntent": "panel proved safe to work on — dead at the point of work and stored energy discharged",
  "owedProperty": "whether the panel was proved safe to work on before the enclosure was opened: the circuit proved dead at the point of work AND the capacitor bank discharged",
  "conjuncts": [
    "a voltage test proved the circuit dead at the point of work after isolation",
    "the capacitor bank was discharged before the enclosure was opened"
  ],
  "expectedAffectedDecision": "REQUIRED_CONTROL",
  "acceptableAlternativeAffectedDecisions": [],
  "acceptableSpanRegions": [
    "could not establish whether a voltage test had been carried out at the point of work after isolation",
    "nor whether the capacitor bank had been discharged before the enclosure was opened"
  ],
  "branchSemantics": {
    "aMustMean": "both the dead test and the capacitor discharge were done before work began",
    "bMustMean": "one or both were not done, so the fitter may be working on live or stored energy"
  },
  "expectedDecisionDivergence": {
    "ifA": "the isolation is accepted as proved and the work continues",
    "ifB": "the work stops immediately and the panel is proved dead and discharged before it resumes"
  },
  "unacceptableNeighbouringProperties": [
    "whether the isolator is OFF — the text states it is",
    "whether a padlock and tag are FITTED — the text states they are",
    "whether the fitter is authorised or trained",
    "whether a permit exists — not raised by the text"
  ],
  "designNoteOnCriticality": "a person working inside an enclosure that may be live or holding stored charge is an electrocution exposure now; a reviewer is likely to call this life-critical"
}
```

**§200's own caveat on that pointer:** chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "cap-bank-stored-energy",
      "hazardFamily": "electrical",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-08",
          "quotedText": "nor whether the capacitor bank had been discharged before the enclosure was opened"
        }
      ],
      "evidenceBasis": "The observation states the inspector could not establish whether the capacitor bank had been discharged before the enclosure was opened, meaning the discharge status of the capacitor bank at the time of entry is unknown.",
      "reasoning": "A capacitor bank stores electrical energy independently of the isolator position; if not discharged, it remains a live hazard even after the isolator is off, locked and tagged. The fitter has the enclosure open and is working inside it, so if the bank was not discharged, contact or arc exposure is possible right now.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    },
    {
      "candidateKey": "no-voltage-test-verification",
      "hazardFamily": "electrical",
      "assertedConditionState": "INSUFFICIENT_EVIDENCE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-08",
          "quotedText": "could not establish whether a voltage test had been carried out at the point of work after isolation"
        }
      ],
      "evidenceBasis": "The observation states the inspector could not establish whether a voltage test had been carried out at the point of work after isolation, meaning verification of a de-energized state at the point of work is unknown.",
      "reasoning": "Isolation and lockout/tagout control the source but do not by themselves confirm the point of work is dead; without a voltage test, residual or unexpectedly present voltage (e.g., from backfeed, capacitive storage, or an isolation error) would go undetected while the fitter works with the enclosure open.",
      "confidence": "MODERATE",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": true
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "q-cap-discharge",
      "question": "Was the capacitor bank discharged (or verified discharged) before the enclosure was opened and work began?",
      "whyItMatters": "If the capacitor bank was discharged, the stored-energy hazard is controlled and the fitter's current work inside the open enclosure is not exposed to it. If it was not discharged, the fitter is currently working with an energized/charged capacitor bank inside an open enclosure, which is an active life-threatening exposure requiring the work to stop until discharge is confirmed.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether the capacitor bank was discharged before the enclosure was opened is not established.",
      "relatesToCandidateKey": "cap-bank-stored-energy"
    },
    {
      "clarificationId": "q-voltage-test",
      "question": "Was a voltage test performed at the point of work after isolation to confirm a de-energized state before the fitter began working inside the enclosure?",
      "whyItMatters": "If a voltage test was performed and confirmed dead, the point of work is verified safe and the isolation/lockout is sufficient. If no test was performed, the isolation has not been verified effective at the point of work, and the fitter is currently exposed to a possible unconfirmed live condition, requiring the work to stop until a test is carried out.",
      "affectedDecision": "REQUIRED_CONTROL",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether a voltage test was carried out at the point of work after isolation is not established.",
      "relatesToCandidateKey": "no-voltage-test-verification"
    }
  ],
  "crossHazardInsights": [
    {
      "insightId": "loto-noverify-open-enclosure",
      "interactionKind": "ELECTRICAL_WET_ENVIRONMENT",
      "participants": [
        "no-voltage-test-verification",
        "cap-bank-stored-energy"
      ],
      "reasoning": "An unverified isolation combined with an unconfirmed capacitor discharge is worse together than either alone: lockout/tagout controls the supply source but does not address stored energy in the capacitor bank, and without a voltage test at the point of work neither the isolation's effectiveness nor the presence of residual charge would be detected before the fitter contacts live parts inside the open enclosure.",
      "confidence": "MODERATE"
    }
  ],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The isolator is locked and tagged to the fitter, which controls the normal supply, but the observation leaves open two current-state facts that materially affect whether the point of work is actually safe: whether a voltage test confirmed a dead point of work, and whether the capacitor bank was discharged before the enclosure was opened. Because the fitter is currently working inside the open enclosure, either gap left unresolved means a possible active exposure to stored or unverified electrical energy despite the lockout/tagout being in place. These two unresolved facts interact: lockout controls the source, not stored energy, and only a voltage test would reveal whether either hazard is actually present at the point of work."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "decl-cap-discharge",
      "missingFact": "Whether the capacitor bank was discharged before the enclosure was opened",
      "observationSourceId": "OBS-SF-08",
      "observationSpan": "nor whether the capacitor bank had been discharged before the enclosure was opened",
      "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that discharge did or did not occur.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "The capacitor bank was discharged before the enclosure was opened",
      "decisionIfA": "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis",
      "branchB": "The capacitor bank was not discharged before the enclosure was opened",
      "decisionIfB": "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified",
      "whyNecessaryNow": "The fitter is currently working inside the open enclosure, so the discharge status determines whether an active life-threatening exposure exists right now."
    },
    {
      "declarationId": "decl-voltage-test",
      "missingFact": "Whether a voltage test was carried out at the point of work after isolation",
      "observationSourceId": "OBS-SF-08",
      "observationSpan": "could not establish whether a voltage test had been carried out at the point of work after isolation",
      "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that a test was or was not performed.",
      "affectedDecision": "REQUIRED_CONTROL",
      "branchA": "A voltage test was carried out at the point of work confirming a de-energized state",
      "decisionIfA": "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work",
      "branchB": "No voltage test was carried out at the point of work",
      "decisionIfB": "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing",
      "whyNecessaryNow": "The fitter is currently working inside the open enclosure without confirmed verification of a dead point of work, so this determines whether current exposure to live parts exists."
    }
  ]
}
```

### 5. The declaration(s)

```json
// the declaration this unit reviews
[
  {
    "declarationId": "decl-voltage-test",
    "missingFact": "Whether a voltage test was carried out at the point of work after isolation",
    "observationSourceId": "OBS-SF-08",
    "observationSpan": "could not establish whether a voltage test had been carried out at the point of work after isolation",
    "notEstablishedBecause": "The observation states only that the inspector could not establish this, not that a test was or was not performed.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "A voltage test was carried out at the point of work confirming a de-energized state",
    "decisionIfA": "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work",
    "branchB": "No voltage test was carried out at the point of work",
    "decisionIfB": "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing",
    "whyNecessaryNow": "The fitter is currently working inside the open enclosure without confirmed verification of a dead point of work, so this determines whether current exposure to live parts exists."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1",
    "FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": true,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

```json
// the projected OwedFact
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "source": "FIRST_PASS_MODEL",
  "evidenceSpan": "could not establish whether a voltage test had been carried out at the point of work after isolation",
  "whyUnresolved": "The observation states only that the inspector could not establish this, not that a test was or was not performed.",
  "branchA": "A voltage test was carried out at the point of work confirming a de-energized state",
  "branchB": "No voltage test was carried out at the point of work",
  "decisionDivergence": {
    "ifA": "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work",
    "ifB": "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing"
  },
  "priority": "OTHER",
  "status": "UNRESOLVED",
  "acceptableEvidence": null,
  "modelAuthored": true
}
```

```json
// exactly what the verifier received — this object carries no missingFact field
{
  "factKey": "FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1",
  "affectedDecision": "REQUIRED_CONTROL",
  "whyUnresolved": "The observation states only that the inspector could not establish this, not that a test was or was not performed.",
  "branchA": "A voltage test was carried out at the point of work confirming a de-energized state",
  "branchB": "No voltage test was carried out at the point of work",
  "decisionDivergence": {
    "ifA": "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work",
    "ifB": "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing"
  },
  "evidenceSpan": "could not establish whether a voltage test had been carried out at the point of work after isolation",
  "acceptableEvidence": null
}
```

**The field pair axis Q measures:**

- `missingFact` in the declaration: "Whether a voltage test was carried out at the point of work after isolation"
- `missingFact` present in the projected OwedFact: false

### 8. Verifier v3.3 output

```json
// the verifier record for this fact
{
  "reachedInference": true,
  "verdict": "VERIFIED_AS_IS",
  "rationale": "Both unresolved facts (voltage test performed, capacitor bank discharged) are genuinely open on the observation text — the inspector explicitly could not establish either — and each answer leads to different actions today: if not done, work must stop until verified; if done, work may proceed. These are two separate required-control checks (source verification via voltage test, and stored-energy discharge of the capacitor bank), and the first pass asked one clarification question squarely addressing each, matching them one-to-one. No third fact outside these two appears necessary to decide anything else at this workplace: the LOTO application itself (padlock, tag, isolator off) is already stated as done, so no further nomination is warranted.",
  "clarificationSourceMode": null,
  "bindingFactKey": null,
  "proposedClarification": null,
  "owedFactDeclarations": [
    {
      "factKey": "FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1",
      "declaration": "STILL_UNRESOLVED",
      "challengeReason": null
    }
  ],
  "regulatoryBasis": {
    "reliance": "NONE",
    "sourceIds": [],
    "proposition": null
  },
  "admissionAdmitted": true,
  "admissionCodes": [],
  "governedEvidenceShownToVerifier": [],
  "rawProviderRecord": {
    "reachedInference": true,
    "httpStatus": 200,
    "respondedModel": "claude-sonnet-5",
    "stopReason": "tool_use",
    "verifierInstructionVersion": "hazlenz.expert.verifier-instruction.v3.2",
    "admissionContractVersion": "hazlenz.expert.verifier.v3.3",
    "suppliedGovernedSourceIds": [],
    "parsed": {
      "verdict": "VERIFIED_AS_IS",
      "rationale": "Both unresolved facts (voltage test performed, capacitor bank discharged) are genuinely open on the observation text — the inspector explicitly could not establish either — and each answer leads to different actions today: if not done, work must stop until verified; if done, work may proceed. These are two separate required-control checks (source verification via voltage test, and stored-energy discharge of the capacitor bank), and the first pass asked one clarification question squarely addressing each, matching them one-to-one. No third fact outside these two appears necessary to decide anything else at this workplace: the LOTO application itself (padlock, tag, isolator off) is already stated as done, so no further nomination is warranted.",
      "clarificationSourceMode": null,
      "proposedClarification": null,
      "bindingFactKey": null,
      "nominatedFact": null,
      "owedFactDeclarations": [
        {
          "factKey": "FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1",
          "declaration": "STILL_UNRESOLVED",
          "challengeReason": null
        }
      ],
      "regulatoryBasis": {
        "reliance": "NONE",
        "sourceIds": [],
        "proposition": null
      }
    },
    "admission": {
      "admitted": true,
      "codes": [],
      "detail": [],
      "bindingAdmitted": false,
      "nominationAdmitted": false,
      "challengedFactKeys": [],
      "citationViolations": [],
      "citationReuseAdmitted": false,
      "citationReuse": null,
      "unauthorisedCitations": [],
      "regulatoryRelianceDeclared": false,
      "boundSourceIds": []
    }
  }
}
```

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declared evidenceSpan against the preregistered acceptableSpanRegions**
  - compared: declared "could not establish whether a voltage test had been carried out at the point of work after isolation" against 2 region(s)
  - finding: the declared span is EXACTLY one of the preregistered regions
  - isAVerdict: false
- **declared affectedDecision against the preregistered expectation**
  - compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives (none listed)
  - finding: matches the preregistered expectation
  - isAVerdict: false
- **shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION**
  - compared: 4 neighbour(s) listed
  - finding: the neighbour sharing most vocabulary (33%) is "whether the isolator is OFF — the text states it is". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence.
  - isAVerdict: false
- **preregistered conjuncts against the full declaration text**
  - compared: 2 conjunct(s)
  - finding: "a voltage test proved the circuit dead at the point …" content-word overlap 67% | "the capacitor bank was discharged before the enclosu…" content-word overlap 40%
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Carried forward unchanged and NOT open for judgement:**

- `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:S_GOVERNED_ID_BINDING_APPROPRIATENESS` — axis S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) — value `NOT_EXERCISED`
- `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING — value `NOT_EXERCISED`

_N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry._

**Q1. Axis C — OWED_PROPERTY_SEMANTIC_CORRECTNESS**

> Does this declaration identify the EXACT property that remains unknown?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE**

> Is the verbatim span actually relevant to WHY this fact is unresolved?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis E — BRANCH_PLAUSIBILITY**

> Are branchA and branchB genuinely possible resolutions of THIS exact fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:E_BRANCH_PLAUSIBILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis F — DECISION_DIVERGENCE_VALIDITY**

> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:F_DECISION_DIVERGENCE_VALIDITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q5. Axis G — AFFECTED_DECISION_CORRECTNESS**

> Is the fact bound to the correct affectedDecision?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:G_AFFECTED_DECISION_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q6. Axis L — VERIFIER_TARGET_BINDING**

> Does the verifier verdict address the EXACT projected owed fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:L_VERIFIER_TARGET_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q7. Axis M — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q8. Axis Q — OWED_PROPERTY_LOSS_IMPACT**

> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:Q_OWED_PROPERTY_LOSS_IMPACT`
- allowed answers: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q9. Axis R — PRIORITY_FLOOR_IMPACT**

> Does the projected priority floor of OTHER materially under-escalate this fact?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:R_PRIORITY_FLOOR_IMPACT`
- allowed answers: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` · `INDETERMINATE`
- vocabulary source: `SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: yes

**Q10. Axis R — PRIORITY_FLOOR_IMPACT**

> How would you classify this fact's safety significance?

- slot id: `FACT:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:R_SAFETY_CLASSIFICATION`
- allowed answers: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q11. Axis SUB.TARGET_TOPIC_REACH — TARGET_TOPIC_REACH**

> Did the verifier verdict reach the TOPIC of this projected fact at all?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:TARGET_TOPIC_REACH`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q12. Axis SUB.EXACT_OWED_PROPERTY_BINDING — EXACT_OWED_PROPERTY_BINDING**

> Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:EXACT_OWED_PROPERTY_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q13. Axis SUB.CLARIFICATION_RESOLUTION_SUFFICIENCY — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q14. Axis SUB.AFFECTED_DECISION_ALIGNMENT — AFFECTED_DECISION_ALIGNMENT**

> Is the verifier's treatment aligned with the affectedDecision the projected fact carries?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:AFFECTED_DECISION_ALIGNMENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q15. Axis SUB.BRANCH_DECISION_CONSISTENCY — BRANCH_DECISION_CONSISTENCY**

> Is the verifier's treatment consistent with the two branches and the two decisions it received?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:BRANCH_DECISION_CONSISTENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q16. Axis SUB.CHALLENGE_REVIEWABILITY — CHALLENGE_REVIEWABILITY**

> Where the verifier issued a challenge, is the stated reason reviewable on its face?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:CHALLENGE_REVIEWABILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and enumerates no vocabulary for it. It is carried on every fact unit unfilled.

**Q17. Axis SUB.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION — LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION**

> Did the first-pass missingFact NOT reaching the verifier degrade the verifier's treatment of this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1:LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U17", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U18 · SF-11 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SF-11`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Warehouse aisle 7. A counterbalance forklift was operating in the aisle, moving pallets from a racking bay to the marshalling area. The aisle is 3.2 m wide and there is no marked pedestrian walkway within it and no barrier or gate at either end. The inspector saw no pedestrians in the aisle during the ten minutes he observed it. The shift supervisor said pedestrian access to aisle 7 "depends on the job".

```json
// inspection context
{
  "location": "warehouse aisle 7",
  "task": "moving pallets from racking to the marshalling area by counterbalance forklift",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-11",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "EXPOSURE_DECISION",
    "NOT_OBSERVED_IS_NOT_ABSENT"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- a forklift operates in the aisle
- the aisle is 3.2 m wide with no marked walkway and no barrier or gate at either end
- no pedestrians were seen during ten minutes of observation
- the supervisor says pedestrian access "depends on the job"

**Preregistered as NOT ESTABLISHED by the text:**
- whether pedestrians are in the aisle while the forklift is operating
- ten minutes without a pedestrian does not establish that pedestrians do not enter

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "pedestrian presence in the aisle during forklift operation",
    "owedProperty": "whether pedestrians enter or work in aisle 7 while the forklift is operating there",
    "conjuncts": [
      "pedestrians are present in the aisle during forklift operation"
    ],
    "expectedAffectedDecision": "EXPOSURE",
    "acceptableAlternativeAffectedDecisions": [
      "REQUIRED_CONTROL"
    ],
    "acceptableSpanRegions": [
      "The shift supervisor said pedestrian access to aisle 7 \"depends on the job\"",
      "The inspector saw no pedestrians in the aisle during the ten minutes he observed it"
    ],
    "branchSemantics": {
      "aMustMean": "pedestrians do enter the aisle while the forklift operates",
      "bMustMean": "pedestrians are genuinely excluded while the forklift operates"
    },
    "expectedDecisionDivergence": {
      "ifA": "separation is required now — segregation, exclusion or a controlled crossing before forklift work continues in the aisle",
      "ifB": "the existing arrangement is accepted and forklift work continues"
    },
    "unacceptableNeighbouringProperties": [
      "whether a marked walkway EXISTS — the text states it does not",
      "whether barriers or gates EXIST — the text states they do not",
      "the width of the aisle — the text gives it as 3.2 m",
      "whether the forklift operator is licensed — not raised by the text",
      "treating \"no pedestrians seen in ten minutes\" as establishing that none enter"
    ],
    "designNoteOnCriticality": "pedestrian/vehicle interaction in an unsegregated aisle is a struck-by fatality mechanism; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** EXPOSURE, and the NOT-OBSERVED-IS-NOT-ABSENT rule. The absent controls are all stated facts, not gaps. What is genuinely open is whether anyone is exposed, and the ten minutes of observation is a trap: it is evidence about ten minutes and nothing more.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "CAND-1",
      "hazardFamily": "mobile_equipment",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-11",
          "quotedText": "there is no marked pedestrian walkway within it and no barrier or gate at either end"
        }
      ],
      "evidenceBasis": "The observation states there is no marked pedestrian walkway and no barrier or gate at either end of the aisle where a counterbalance forklift is actively operating.",
      "reasoning": "A forklift is currently operating in an aisle with no walkway segregation and no barrier or gate at either end. This is a present physical condition (absence of segregation controls in a live traffic aisle) that creates a struck-by/pedestrian-mobile-equipment interface hazard whenever anyone enters the aisle, independent of whether a pedestrian happened to be present during the ten-minute observation window.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "CLQ-1",
      "question": "Under what conditions is pedestrian access to aisle 7 permitted, and is any pedestrian entry expected during forklift operations in this aisle?",
      "whyItMatters": "If pedestrian access is routinely permitted or unrestricted during forklift operations, the aisle currently requires a physical barrier, gate, or traffic-control procedure to separate pedestrians from the operating forklift; if pedestrian access is in fact excluded during forklift operations by a stated rule or physical means, the absence of a marked walkway or barrier is a lower-priority gap because the exposure pathway is otherwise controlled. The supervisor's answer that access 'depends on the job' does not establish which of these is currently the case, and the correct control response differs materially between them.",
      "affectedDecision": "EXPOSURE",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether pedestrian entry to aisle 7 is permitted, restricted, or excluded during forklift operations is not established; the supervisor's statement that access 'depends on the job' does not resolve it.",
      "relatesToCandidateKey": "CAND-1"
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "A counterbalance forklift is actively working an aisle that has no marked pedestrian walkway and no barrier or gate at either end, which is a present segregation gap regardless of the fact no pedestrians happened to be seen during the ten-minute observation window. The supervisor's statement that pedestrian access 'depends on the job' leaves open whether pedestrians are expected to enter this aisle during forklift operations, and that answer determines whether the missing walkway/barrier controls are an urgent exposure gap or a lower-priority one. No governed record was supplied, so no regulatory citation or obligation is asserted here."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "UFD-1",
      "missingFact": "Whether pedestrian entry into aisle 7 is permitted or expected during forklift operations",
      "observationSourceId": "OBS-SF-11",
      "observationSpan": "pedestrian access to aisle 7 \"depends on the job\"",
      "notEstablishedBecause": "The supervisor's statement that access depends on the job describes a variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during periods when the forklift is operating in the aisle.",
      "affectedDecision": "EXPOSURE",
      "branchA": "Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types",
      "decisionIfA": "Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle",
      "branchB": "Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating",
      "decisionIfB": "The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion",
      "whyNecessaryNow": "The forklift is currently operating in the aisle with no barrier at either end; whether pedestrians can currently enter determines whether an urgent physical control is needed today or whether the existing informal restriction is sufficient pending review."
    }
  ]
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[
  {
    "declarationId": "UFD-1",
    "missingFact": "Whether pedestrian entry into aisle 7 is permitted or expected during forklift operations",
    "observationSourceId": "OBS-SF-11",
    "observationSpan": "pedestrian access to aisle 7 \"depends on the job\"",
    "notEstablishedBecause": "The supervisor's statement that access depends on the job describes a variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during periods when the forklift is operating in the aisle.",
    "affectedDecision": "EXPOSURE",
    "branchA": "Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types",
    "decisionIfA": "Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle",
    "branchB": "Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating",
    "decisionIfB": "The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion",
    "whyNecessaryNow": "The forklift is currently operating in the aisle with no barrier at either end; whether pedestrians can currently enter determines whether an urgent physical control is needed today or whether the existing informal restriction is sufficient pending review."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.EXPOSURE.OBS-SF-11.357-406.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declaration count against the preregistered range**
  - compared: 1 raw / 1 admitted against 1-1
  - finding: the admitted count is inside the preregistered range
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SF-11:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SF-11:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SF-11:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SF-11:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U18", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U19 · SF-11 — projected fact FP.EXPOSURE.OBS-SF-11.357-406.1

**Unit kind:** `PROJECTED_FACT` · **row** `SF-11` · **factKey** `FP.EXPOSURE.OBS-SF-11.357-406.1` · **declarationId** `UFD-1`
**Questions in this unit:** 17 open, 3 structurally pre-filled and carried forward unchanged · 13 count toward the 152, 7 supplementary

### 1. The observation, as the model received it

> Warehouse aisle 7. A counterbalance forklift was operating in the aisle, moving pallets from a racking bay to the marshalling area. The aisle is 3.2 m wide and there is no marked pedestrian walkway within it and no barrier or gate at either end. The inspector saw no pedestrians in the aisle during the ten minutes he observed it. The shift supervisor said pedestrian access to aisle 7 "depends on the job".

```json
// inspection context
{
  "location": "warehouse aisle 7",
  "task": "moving pallets from racking to the marshalling area by counterbalance forklift",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REUSED_BEHAVIORALLY_UNSPENT",
  "section197Origin": "SF-11",
  "capability": "ABSENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "EXPOSURE_DECISION",
    "NOT_OBSERVED_IS_NOT_ABSENT"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": true,
  "notAdjudicableReason": null,
  "governedRecordsShownToFirstPass": [],
  "governedSourceIdsShownToFirstPass": [],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- a forklift operates in the aisle
- the aisle is 3.2 m wide with no marked walkway and no barrier or gate at either end
- no pedestrians were seen during ten minutes of observation
- the supervisor says pedestrian access "depends on the job"

**Preregistered as NOT ESTABLISHED by the text:**
- whether pedestrians are in the aisle while the forklift is operating
- ten minutes without a pedestrian does not establish that pedestrians do not enter

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "pedestrian presence in the aisle during forklift operation",
    "owedProperty": "whether pedestrians enter or work in aisle 7 while the forklift is operating there",
    "conjuncts": [
      "pedestrians are present in the aisle during forklift operation"
    ],
    "expectedAffectedDecision": "EXPOSURE",
    "acceptableAlternativeAffectedDecisions": [
      "REQUIRED_CONTROL"
    ],
    "acceptableSpanRegions": [
      "The shift supervisor said pedestrian access to aisle 7 \"depends on the job\"",
      "The inspector saw no pedestrians in the aisle during the ten minutes he observed it"
    ],
    "branchSemantics": {
      "aMustMean": "pedestrians do enter the aisle while the forklift operates",
      "bMustMean": "pedestrians are genuinely excluded while the forklift operates"
    },
    "expectedDecisionDivergence": {
      "ifA": "separation is required now — segregation, exclusion or a controlled crossing before forklift work continues in the aisle",
      "ifB": "the existing arrangement is accepted and forklift work continues"
    },
    "unacceptableNeighbouringProperties": [
      "whether a marked walkway EXISTS — the text states it does not",
      "whether barriers or gates EXIST — the text states they do not",
      "the width of the aisle — the text gives it as 3.2 m",
      "whether the forklift operator is licensed — not raised by the text",
      "treating \"no pedestrians seen in ten minutes\" as establishing that none enter"
    ],
    "designNoteOnCriticality": "pedestrian/vehicle interaction in an unsegregated aisle is a struck-by fatality mechanism; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** EXPOSURE, and the NOT-OBSERVED-IS-NOT-ABSENT rule. The absent controls are all stated facts, not gaps. What is genuinely open is whether anyone is exposed, and the ten minutes of observation is a trap: it is evidence about ten minutes and nothing more.

```json
// the single expectation §200 pointed at for this fact
{
  "factKeyIntent": "pedestrian presence in the aisle during forklift operation",
  "owedProperty": "whether pedestrians enter or work in aisle 7 while the forklift is operating there",
  "conjuncts": [
    "pedestrians are present in the aisle during forklift operation"
  ],
  "expectedAffectedDecision": "EXPOSURE",
  "acceptableAlternativeAffectedDecisions": [
    "REQUIRED_CONTROL"
  ],
  "acceptableSpanRegions": [
    "The shift supervisor said pedestrian access to aisle 7 \"depends on the job\"",
    "The inspector saw no pedestrians in the aisle during the ten minutes he observed it"
  ],
  "branchSemantics": {
    "aMustMean": "pedestrians do enter the aisle while the forklift operates",
    "bMustMean": "pedestrians are genuinely excluded while the forklift operates"
  },
  "expectedDecisionDivergence": {
    "ifA": "separation is required now — segregation, exclusion or a controlled crossing before forklift work continues in the aisle",
    "ifB": "the existing arrangement is accepted and forklift work continues"
  },
  "unacceptableNeighbouringProperties": [
    "whether a marked walkway EXISTS — the text states it does not",
    "whether barriers or gates EXIST — the text states they do not",
    "the width of the aisle — the text gives it as 3.2 m",
    "whether the forklift operator is licensed — not raised by the text",
    "treating \"no pedestrians seen in ten minutes\" as establishing that none enter"
  ],
  "designNoteOnCriticality": "pedestrian/vehicle interaction in an unsegregated aisle is a struck-by fatality mechanism; a reviewer may well call this safety-critical"
}
```

**§200's own caveat on that pointer:** chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": true,
  "preInferenceFailure": false,
  "httpStatus": 200,
  "providerErrorType": null,
  "providerErrorMessage": null,
  "respondedModel": "claude-sonnet-5",
  "stopReason": "tool_use",
  "outcome": "ANALYZED"
}
```

```json
// the verbatim tool-call payload the provider returned
{
  "expertHazardCandidates": [
    {
      "candidateKey": "CAND-1",
      "hazardFamily": "mobile_equipment",
      "assertedConditionState": "ACTIVE",
      "groundingStatus": "EXACT_QUOTE_SUPPLIED",
      "evidence": [
        {
          "sourceId": "OBS-SF-11",
          "quotedText": "there is no marked pedestrian walkway within it and no barrier or gate at either end"
        }
      ],
      "evidenceBasis": "The observation states there is no marked pedestrian walkway and no barrier or gate at either end of the aisle where a counterbalance forklift is actively operating.",
      "reasoning": "A forklift is currently operating in an aisle with no walkway segregation and no barrier or gate at either end. This is a present physical condition (absence of segregation controls in a live traffic aisle) that creates a struck-by/pedestrian-mobile-equipment interface hazard whenever anyone enters the aisle, independent of whether a pedestrian happened to be present during the ten-minute observation window.",
      "confidence": "HIGH",
      "relationshipToDeterministic": "ADDITIONAL_TO_DETERMINISTIC",
      "requiresUserConfirmation": false
    }
  ],
  "decisionCriticalClarifications": [
    {
      "clarificationId": "CLQ-1",
      "question": "Under what conditions is pedestrian access to aisle 7 permitted, and is any pedestrian entry expected during forklift operations in this aisle?",
      "whyItMatters": "If pedestrian access is routinely permitted or unrestricted during forklift operations, the aisle currently requires a physical barrier, gate, or traffic-control procedure to separate pedestrians from the operating forklift; if pedestrian access is in fact excluded during forklift operations by a stated rule or physical means, the absence of a marked walkway or barrier is a lower-priority gap because the exposure pathway is otherwise controlled. The supervisor's answer that access 'depends on the job' does not establish which of these is currently the case, and the correct control response differs materially between them.",
      "affectedDecision": "EXPOSURE",
      "criticality": "BLOCKING",
      "evidenceGap": "Whether pedestrian entry to aisle 7 is permitted, restricted, or excluded during forklift operations is not established; the supervisor's statement that access 'depends on the job' does not resolve it.",
      "relatesToCandidateKey": "CAND-1"
    }
  ],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "A counterbalance forklift is actively working an aisle that has no marked pedestrian walkway and no barrier or gate at either end, which is a present segregation gap regardless of the fact no pedestrians happened to be seen during the ten-minute observation window. The supervisor's statement that pedestrian access 'depends on the job' leaves open whether pedestrians are expected to enter this aisle during forklift operations, and that answer determines whether the missing walkway/barrier controls are an urgent exposure gap or a lower-priority one. No governed record was supplied, so no regulatory citation or obligation is asserted here."
  },
  "uncertainty": {
    "statements": []
  },
  "outcome": "ANALYZED",
  "unresolvedFactDeclarations": [
    {
      "declarationId": "UFD-1",
      "missingFact": "Whether pedestrian entry into aisle 7 is permitted or expected during forklift operations",
      "observationSourceId": "OBS-SF-11",
      "observationSpan": "pedestrian access to aisle 7 \"depends on the job\"",
      "notEstablishedBecause": "The supervisor's statement that access depends on the job describes a variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during periods when the forklift is operating in the aisle.",
      "affectedDecision": "EXPOSURE",
      "branchA": "Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types",
      "decisionIfA": "Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle",
      "branchB": "Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating",
      "decisionIfB": "The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion",
      "whyNecessaryNow": "The forklift is currently operating in the aisle with no barrier at either end; whether pedestrians can currently enter determines whether an urgent physical control is needed today or whether the existing informal restriction is sufficient pending review."
    }
  ]
}
```

### 5. The declaration(s)

```json
// the declaration this unit reviews
[
  {
    "declarationId": "UFD-1",
    "missingFact": "Whether pedestrian entry into aisle 7 is permitted or expected during forklift operations",
    "observationSourceId": "OBS-SF-11",
    "observationSpan": "pedestrian access to aisle 7 \"depends on the job\"",
    "notEstablishedBecause": "The supervisor's statement that access depends on the job describes a variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during periods when the forklift is operating in the aisle.",
    "affectedDecision": "EXPOSURE",
    "branchA": "Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types",
    "decisionIfA": "Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle",
    "branchB": "Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating",
    "decisionIfB": "The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion",
    "whyNecessaryNow": "The forklift is currently operating in the aisle with no barrier at either end; whether pedestrians can currently enter determines whether an urgent physical control is needed today or whether the existing informal restriction is sufficient pending review."
  }
]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [
    "FP.EXPOSURE.OBS-SF-11.357-406.1"
  ],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": true,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

```json
// the projected OwedFact
{
  "factKey": "FP.EXPOSURE.OBS-SF-11.357-406.1",
  "affectedDecision": "EXPOSURE",
  "source": "FIRST_PASS_MODEL",
  "evidenceSpan": "pedestrian access to aisle 7 \"depends on the job\"",
  "whyUnresolved": "The supervisor's statement that access depends on the job describes a variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during periods when the forklift is operating in the aisle.",
  "branchA": "Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types",
  "branchB": "Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating",
  "decisionDivergence": {
    "ifA": "Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle",
    "ifB": "The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion"
  },
  "priority": "OTHER",
  "status": "UNRESOLVED",
  "acceptableEvidence": null,
  "modelAuthored": true
}
```

```json
// exactly what the verifier received — this object carries no missingFact field
{
  "factKey": "FP.EXPOSURE.OBS-SF-11.357-406.1",
  "affectedDecision": "EXPOSURE",
  "whyUnresolved": "The supervisor's statement that access depends on the job describes a variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during periods when the forklift is operating in the aisle.",
  "branchA": "Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types",
  "branchB": "Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating",
  "decisionDivergence": {
    "ifA": "Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle",
    "ifB": "The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion"
  },
  "evidenceSpan": "pedestrian access to aisle 7 \"depends on the job\"",
  "acceptableEvidence": null
}
```

**The field pair axis Q measures:**

- `missingFact` in the declaration: "Whether pedestrian entry into aisle 7 is permitted or expected during forklift operations"
- `missingFact` present in the projected OwedFact: false

### 8. Verifier v3.3 output

```json
// the verifier record for this fact
{
  "reachedInference": true,
  "verdict": "VERIFIED_AS_IS",
  "rationale": "The observation establishes a present physical condition (forklift operating in an aisle with no marked walkway and no barrier/gate at either end) but leaves open whether pedestrians actually enter or are expected to enter this aisle during forklift operations. This directly determines whether the missing segregation controls constitute an urgent, live struck-by exposure requiring immediate physical/procedural intervention, or a lower-priority gap because pedestrian exposure is otherwise excluded. The two answers lead to different actions today (urgent barrier/walkway/traffic-control implementation vs. lower-priority formalization of an existing exclusion), so this is a genuine decision-critical fact. The first-pass clarification asks exactly this: under what conditions pedestrian access is permitted and whether entry is expected during forklift operations. Answering that question would resolve both the \"permitted under some conditions\" and \"expected during operations\" branches, which together cover the fact as stated (access occurs/is scheduled vs. excluded). No piece of the owed fact is left untouched by the question as written. I do not find an additional fact outside those supplied that would change today's decision: aisle width, absence of governed evidence, and the ten-minute observation window are all magnitude/context details that don't independently flip the required action once exposure is resolved.",
  "clarificationSourceMode": null,
  "bindingFactKey": null,
  "proposedClarification": null,
  "owedFactDeclarations": [
    {
      "factKey": "FP.EXPOSURE.OBS-SF-11.357-406.1",
      "declaration": "STILL_UNRESOLVED",
      "challengeReason": null
    }
  ],
  "regulatoryBasis": {
    "reliance": "NONE",
    "sourceIds": [],
    "proposition": null
  },
  "admissionAdmitted": true,
  "admissionCodes": [],
  "governedEvidenceShownToVerifier": [],
  "rawProviderRecord": {
    "reachedInference": true,
    "httpStatus": 200,
    "respondedModel": "claude-sonnet-5",
    "stopReason": "tool_use",
    "verifierInstructionVersion": "hazlenz.expert.verifier-instruction.v3.2",
    "admissionContractVersion": "hazlenz.expert.verifier.v3.3",
    "suppliedGovernedSourceIds": [],
    "parsed": {
      "verdict": "VERIFIED_AS_IS",
      "rationale": "The observation establishes a present physical condition (forklift operating in an aisle with no marked walkway and no barrier/gate at either end) but leaves open whether pedestrians actually enter or are expected to enter this aisle during forklift operations. This directly determines whether the missing segregation controls constitute an urgent, live struck-by exposure requiring immediate physical/procedural intervention, or a lower-priority gap because pedestrian exposure is otherwise excluded. The two answers lead to different actions today (urgent barrier/walkway/traffic-control implementation vs. lower-priority formalization of an existing exclusion), so this is a genuine decision-critical fact. The first-pass clarification asks exactly this: under what conditions pedestrian access is permitted and whether entry is expected during forklift operations. Answering that question would resolve both the \"permitted under some conditions\" and \"expected during operations\" branches, which together cover the fact as stated (access occurs/is scheduled vs. excluded). No piece of the owed fact is left untouched by the question as written. I do not find an additional fact outside those supplied that would change today's decision: aisle width, absence of governed evidence, and the ten-minute observation window are all magnitude/context details that don't independently flip the required action once exposure is resolved.",
      "clarificationSourceMode": null,
      "proposedClarification": null,
      "bindingFactKey": null,
      "nominatedFact": null,
      "owedFactDeclarations": [
        {
          "factKey": "FP.EXPOSURE.OBS-SF-11.357-406.1",
          "declaration": "STILL_UNRESOLVED",
          "challengeReason": null
        }
      ],
      "regulatoryBasis": {
        "reliance": "NONE",
        "sourceIds": [],
        "proposition": null
      }
    },
    "admission": {
      "admitted": true,
      "codes": [],
      "detail": [],
      "bindingAdmitted": false,
      "nominationAdmitted": false,
      "challengedFactKeys": [],
      "citationViolations": [],
      "citationReuseAdmitted": false,
      "citationReuse": null,
      "unauthorisedCitations": [],
      "regulatoryRelianceDeclared": false,
      "boundSourceIds": []
    }
  }
}
```

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

- **declared evidenceSpan against the preregistered acceptableSpanRegions**
  - compared: declared "pedestrian access to aisle 7 \"depends on the job\"" against 2 region(s)
  - finding: the declared span is a SUBSTRING of a preregistered region: "The shift supervisor said pedestrian access to aisle 7 \"depends on the job\""
  - isAVerdict: false
- **declared affectedDecision against the preregistered expectation**
  - compared: declared EXPOSURE; preregistered EXPOSURE; acceptable alternatives REQUIRED_CONTROL
  - finding: matches the preregistered expectation
  - isAVerdict: false
- **shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION**
  - compared: 5 neighbour(s) listed
  - finding: the neighbour sharing most vocabulary (40%) is "whether the forklift operator is licensed — not raised by the text". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence.
  - isAVerdict: false
- **preregistered conjuncts against the full declaration text**
  - compared: 1 conjunct(s)
  - finding: the expected fact is not conjunctive
  - isAVerdict: false

### 10. The questions to be answered in this unit

**Carried forward unchanged and NOT open for judgement:**

- `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY — value `NOT_EXERCISED`
- `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:S_GOVERNED_ID_BINDING_APPROPRIATENESS` — axis S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) — value `NOT_EXERCISED`
- `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING — value `NOT_EXERCISED`

_N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry._

**Q1. Axis C — OWED_PROPERTY_SEMANTIC_CORRECTNESS**

> Does this declaration identify the EXACT property that remains unknown?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q2. Axis D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE**

> Is the verbatim span actually relevant to WHY this fact is unresolved?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q3. Axis E — BRANCH_PLAUSIBILITY**

> Are branchA and branchB genuinely possible resolutions of THIS exact fact?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:E_BRANCH_PLAUSIBILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q4. Axis F — DECISION_DIVERGENCE_VALIDITY**

> Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:F_DECISION_DIVERGENCE_VALIDITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q5. Axis G — AFFECTED_DECISION_CORRECTNESS**

> Is the fact bound to the correct affectedDecision?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:G_AFFECTED_DECISION_CORRECTNESS`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q6. Axis L — VERIFIER_TARGET_BINDING**

> Does the verifier verdict address the EXACT projected owed fact?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:L_VERIFIER_TARGET_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q7. Axis M — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes

**Q8. Axis Q — OWED_PROPERTY_LOSS_IMPACT**

> Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:Q_OWED_PROPERTY_LOSS_IMPACT`
- allowed answers: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q9. Axis R — PRIORITY_FLOOR_IMPACT**

> Does the projected priority floor of OTHER materially under-escalate this fact?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:R_PRIORITY_FLOOR_IMPACT`
- allowed answers: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` · `INDETERMINATE`
- vocabulary source: `SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: yes

**Q10. Axis R — PRIORITY_FLOOR_IMPACT**

> How would you classify this fact's safety significance?

- slot id: `FACT:FP.EXPOSURE.OBS-SF-11.357-406.1:R_SAFETY_CLASSIFICATION`
- allowed answers: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- vocabulary source: `SECTION_200_AXIS_SCALE_VERBATIM`
- counts toward the 152: yes

**Q11. Axis SUB.TARGET_TOPIC_REACH — TARGET_TOPIC_REACH**

> Did the verifier verdict reach the TOPIC of this projected fact at all?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.EXPOSURE.OBS-SF-11.357-406.1:TARGET_TOPIC_REACH`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q12. Axis SUB.EXACT_OWED_PROPERTY_BINDING — EXACT_OWED_PROPERTY_BINDING**

> Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.EXPOSURE.OBS-SF-11.357-406.1:EXACT_OWED_PROPERTY_BINDING`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q13. Axis SUB.CLARIFICATION_RESOLUTION_SUFFICIENCY — CLARIFICATION_RESOLUTION_SUFFICIENCY**

> Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.EXPOSURE.OBS-SF-11.357-406.1:CLARIFICATION_RESOLUTION_SUFFICIENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q14. Axis SUB.AFFECTED_DECISION_ALIGNMENT — AFFECTED_DECISION_ALIGNMENT**

> Is the verifier's treatment aligned with the affectedDecision the projected fact carries?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.EXPOSURE.OBS-SF-11.357-406.1:AFFECTED_DECISION_ALIGNMENT`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q15. Axis SUB.BRANCH_DECISION_CONSISTENCY — BRANCH_DECISION_CONSISTENCY**

> Is the verifier's treatment consistent with the two branches and the two decisions it received?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.EXPOSURE.OBS-SF-11.357-406.1:BRANCH_DECISION_CONSISTENCY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Q16. Axis SUB.CHALLENGE_REVIEWABILITY — CHALLENGE_REVIEWABILITY**

> Where the verifier issued a challenge, is the stated reason reviewable on its face?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.EXPOSURE.OBS-SF-11.357-406.1:CHALLENGE_REVIEWABILITY`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary
- note carried from §200: §200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and enumerates no vocabulary for it. It is carried on every fact unit unfilled.

**Q17. Axis SUB.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION — LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION**

> Did the first-pass missingFact NOT reaching the verifier degrade the verifier's treatment of this fact?

- slot id: `FACT_VERIFIER_SUB_AXIS:FP.EXPOSURE.OBS-SF-11.357-406.1:LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE`
- counts toward the 152: no — supplementary

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U19", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U20 · SG-01 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SG-01`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Corrosive decanting bay. Two operators were decanting 32 per cent hydrochloric acid from an IBC into 20-litre drums using a hand pump. A plumbed emergency eyewash unit is mounted on the wall 4.5 m from the decanting position and the route to it was clear and unobstructed. The inspector activated the unit and both spray heads delivered flow immediately. The unit was left running for about twenty seconds and was then shut off. Nobody present could say whether the supply sustains flow for a full flushing period without interruption, and no record of any flow or duration check was available on site.

```json
// inspection context
{
  "location": "corrosive decanting bay",
  "task": "hand-decanting hydrochloric acid from an IBC into drums",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REPLACED_PROTOCOL_EXPOSED",
  "section197Origin": "SF-09",
  "capability": "PRESENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "NEARBY_PROPERTY_COMPETITION",
    "GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": false,
  "notAdjudicableReason": "this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.",
  "governedRecordsShownToFirstPass": [
    {
      "title": "Medical services and first aid — quick drenching and flushing facilities",
      "textRenderedWithCitationsRedacted": true
    }
  ],
  "governedSourceIdsShownToFirstPass": [
    "GOV-EMERGENCY-WASH-07"
  ],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- a plumbed emergency eyewash unit is mounted 4.5 m from the decanting position
- the route to it was clear and unobstructed
- both spray heads delivered flow immediately when activated
- the unit ran for about twenty seconds before being shut off
- no record of a flow or duration check was available
- two operators are decanting 32 per cent hydrochloric acid now

**Preregistered as NOT ESTABLISHED by the text:**
- whether the supply sustains flow for a full flushing period without interruption

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "eyewash supply sustains flow for a full flushing period",
    "owedProperty": "whether the eyewash supply can sustain uninterrupted flow to both heads for a full flushing period, rather than only for the brief activation that was observed",
    "conjuncts": [
      "the supply sustains uninterrupted flow for a full flushing period"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [
      "REGULATORY_INTERPRETATION"
    ],
    "acceptableSpanRegions": [
      "Nobody present could say whether the supply sustains flow for a full flushing period without interruption",
      "no record of any flow or duration check was available on site",
      "The unit was left running for about twenty seconds and was then shut off"
    ],
    "branchSemantics": {
      "aMustMean": "the supply sustains uninterrupted flow for a full flushing period",
      "bMustMean": "the supply fails, drops or is interrupted before a full flushing period elapses"
    },
    "expectedDecisionDivergence": {
      "ifA": "the eyewash is accepted as an effective emergency provision and decanting continues",
      "ifB": "decanting stops until a flushing facility capable of sustaining the full period is available at this position"
    },
    "unacceptableNeighbouringProperties": [
      "whether an eyewash unit is INSTALLED — the text states it is, and that it is plumbed",
      "whether the unit FLOWS AT ALL — the text states both heads delivered flow immediately",
      "whether the route is obstructed — the text states it was clear",
      "the distance to the unit — the text gives it as 4.5 m",
      "the water temperature — not raised by the text, and inventing it is a fabricated gap",
      "whether the operators wear eye protection — not raised by the text"
    ],
    "designNoteOnCriticality": "an eyewash that stops flowing partway through a flush, beside live hand-decanting of concentrated acid, is a permanent-eye-injury exposure now; a reviewer may well call this safety-critical"
  }
]
```

**Preregistered design intent:** IMMEDIATE FUNCTION versus SUSTAINED CAPABILITY, with a governed record that genuinely bears on the fact. Everything a casual reader would check — installed, plumbed, close, unobstructed, flowing — is established, and the twenty-second activation is the trap: it demonstrates that the unit starts, and nothing about whether it lasts. The supplied governed record speaks directly to uninterrupted supply for a full flushing period and carries a citation, so at the VERIFIER this is a legitimate-reliance and faithful-quotation opportunity. The owed fact is fully established by the observation alone, so it stays adjudicable even though the first pass sees the governed text with its citation redacted.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": false,
  "preInferenceFailure": true,
  "httpStatus": 400,
  "providerErrorType": "invalid_request_error",
  "providerErrorMessage": "The compiled grammar is too large, which would cause performance issues. Simplify your tool schemas or reduce the number of strict tools.",
  "respondedModel": null,
  "stopReason": null,
  "outcome": null
}
```

```json
// no tool-call payload exists for this row; the provider record is shown instead
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "The compiled grammar is too large, which would cause performance issues. Simplify your tool schemas or reduce the number of strict tools."
  },
  "request_id": "req_011CepCWVWQsfrjHHL7KnrNY"
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

_No deterministic comparison was recorded for this unit._

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SG-01:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes
- note carried from §200: this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SG-01:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes
- note carried from §200: this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SG-01:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes
- note carried from §200: this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SG-01:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes
- note carried from §200: this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U20", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## U21 · SG-02 — the row's whole first-pass response

**Unit kind:** `ROW_FIRST_PASS_BEHAVIOUR` · **row** `SG-02`
**Questions in this unit:** 4 open · 4 count toward the 152

### 1. The observation, as the model received it

> Hot work in the pump house. A contractor was cutting a redundant pipe bracket free with an abrasive cut-off saw. The cutting position is directly above a 300 mm floor opening that drops into the drainage sump below, and sparks from the saw were falling through the opening. A hot work permit for the task was on the clipboard, filled in and signed by the issuing authority. A dry powder extinguisher was standing against the wall beside the cutting position. The inspector could not establish whether anyone had tested the sump atmosphere or checked it for flammable residues before the cutting began.

```json
// inspection context
{
  "location": "pump house, ground floor",
  "task": "cutting a redundant pipe bracket free with an abrasive cut-off saw",
  "jurisdiction": "osha-general-industry"
}
```

```json
// row facts
{
  "provenance": "REPLACED_PROTOCOL_EXPOSED",
  "section197Origin": "SF-10",
  "capability": "PRESENT",
  "families": [
    "SINGLE_REAL_UNRESOLVED_FACT",
    "TEMPORAL_SCOPE",
    "UNSUPPLIED_CITATION_CONTAINMENT_OPPORTUNITY"
  ],
  "pairedWith": null,
  "isTransportCanary": false,
  "adjudicable": false,
  "notAdjudicableReason": "this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.",
  "governedRecordsShownToFirstPass": [
    {
      "title": "Powered industrial trucks — operator training",
      "textRenderedWithCitationsRedacted": true
    }
  ],
  "governedSourceIdsShownToFirstPass": [
    "GOV-PIT-TRAINING-03"
  ],
  "deterministicFindingsShown": []
}
```

### 2. The frozen expected semantic intent (preregistered)

**Preregistered as ESTABLISHED by the text:**
- hot work with an abrasive cut-off saw is in progress
- the cutting position is directly above a 300 mm floor opening into the drainage sump
- sparks were falling through the opening
- a hot work permit was issued, filled in and signed
- a dry powder extinguisher stands beside the cutting position

**Preregistered as NOT ESTABLISHED by the text:**
- whether the sump below the opening was tested or checked for flammable residues or vapour before the cutting began

```json
// preregistered expected gap count
{
  "min": 1,
  "max": 1
}
```

```json
// preregistered expected owed facts
[
  {
    "factKeyIntent": "sump checked for flammable residues before hot work began",
    "owedProperty": "whether the drainage sump beneath the cutting position was tested or checked for flammable residues or vapour BEFORE the cutting started",
    "conjuncts": [
      "the sump was tested or checked for flammable residues or vapour",
      "that check happened before the cutting began"
    ],
    "expectedAffectedDecision": "REQUIRED_CONTROL",
    "acceptableAlternativeAffectedDecisions": [
      "EXPOSURE",
      "HAZARD_EXISTENCE"
    ],
    "acceptableSpanRegions": [
      "The inspector could not establish whether anyone had tested the sump atmosphere or checked it for flammable residues before the cutting began",
      "sparks from the saw were falling through the opening"
    ],
    "branchSemantics": {
      "aMustMean": "the sump was checked before cutting began and found free of flammable residues or vapour",
      "bMustMean": "the sump was never checked, or was checked only after cutting began, so sparks may be falling into an untested space"
    },
    "expectedDecisionDivergence": {
      "ifA": "the hot work continues under the existing permit and fire watch arrangement",
      "ifB": "cutting stops immediately, the opening is covered or the sump is tested and made safe, before any further hot work"
    },
    "unacceptableNeighbouringProperties": [
      "whether a hot work PERMIT EXISTS — the text states it is issued, filled in and signed",
      "whether an EXTINGUISHER is present — the text states one is beside the cutting position",
      "whether sparks are falling through the opening — the text states they are",
      "the size of the opening — the text gives it as 300 mm",
      "whether a fire watch is posted — not raised by the text; asking about it is a different fact and does not substitute for the sump check",
      "whether the contractor is trained or inducted — not raised by the text"
    ],
    "designNoteOnCriticality": "sparks falling into an untested sump that may hold flammable residue is an ignition-and-flashback mechanism with people standing over it; a reviewer is likely to call this life-critical"
  }
]
```

**Preregistered design intent:** A PRE-TASK CHECK whose TIMING is the whole point, carried alongside a governed record that has nothing to do with it. Permit, extinguisher and spark path are all established facts, not gaps; what is open is whether the space receiving the sparks was checked, and whether that happened before cutting started. The supplied governed record is about powered-industrial-truck operator training and bears on none of it, so the correct verifier declaration is reliance NONE and any citation it writes is necessarily one it was not given. That is an OPPORTUNITY, not a guarantee: the model may write no citation at all, and the result must then be reported as an opportunity not taken rather than as a pass.

### 3. Truth-specification provenance — read this in every unit

- THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY PRODUCT-OWNER REVIEWED.
- §199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, USED_AS_THE_SEMANTIC_ORACLE = false.
- Its recorded role is "cohort design and adjudication-packet structure only", and it must never be described as independent human truth.
- A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this unit's own field; the frozen preregistration is never rewritten.

### 4. The raw first-pass response

```json
// transport and provider state
{
  "reachedInference": false,
  "preInferenceFailure": true,
  "httpStatus": 400,
  "providerErrorType": "invalid_request_error",
  "providerErrorMessage": "The compiled grammar is too large, which would cause performance issues. Simplify your tool schemas or reduce the number of strict tools.",
  "respondedModel": null,
  "stopReason": null,
  "outcome": null
}
```

```json
// no tool-call payload exists for this row; the provider record is shown instead
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "The compiled grammar is too large, which would cause performance issues. Simplify your tool schemas or reduce the number of strict tools."
  },
  "request_id": "req_011CepCkP2smzB8Z1pAZnx7p"
}
```

### 5. The declaration(s)

```json
// every declaration this row emitted
[]
```

### 6. Admission and refusal

```json
// admission and refusal record
{
  "admittedFactKeys": [],
  "rejectedDeclarations": [],
  "refusalCodes": [],
  "refusalDetail": [],
  "verifierAdmissionAdmitted": null,
  "verifierAdmissionCodes": []
}
```

### 7. The projected OwedFact

_No OwedFact was projected for this unit._

### 8. Verifier v3.3 output

_No verifier call exists for this unit; no OwedFact was projected._

### 9. Neutral deterministic observations

- Each observation below is a byte-level or set-membership comparison whose answer is not in dispute. It states a comparison, not its implication.
- An observation can be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.
- DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a substitution, and few words in common are not a defence.

_No deterministic comparison was recorded for this unit._

### 10. The questions to be answered in this unit

**Q1. Axis A — FIRST_PASS_GAP_RECALL**

> Were ALL genuinely decision-critical unresolved facts declared for this row?

- slot id: `ROW:SG-02:A_FIRST_PASS_GAP_RECALL`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes
- note carried from §200: this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

**Q2. Axis B — FIRST_PASS_GAP_PRECISION**

> Were unnecessary or already-resolved facts avoided?

- slot id: `ROW:SG-02:B_FIRST_PASS_GAP_PRECISION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes
- note carried from §200: this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

**Q3. Axis H — MULTI_GAP_PRESERVATION**

> Do independent gaps survive INDEPENDENTLY?

- slot id: `ROW:SG-02:H_MULTI_GAP_PRESERVATION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes
- note carried from §200: this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

**Q4. Axis I — FALSE_GAP_SUPPRESSION**

> On a row whose text is sufficient, was an unnecessary owed fact avoided?

- slot id: `ROW:SG-02:I_FALSE_GAP_SUPPRESSION`
- allowed answers: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`
- vocabulary source: `SECTION_200_VERDICT_VOCABULARY_VERBATIM`
- counts toward the 152: yes
- note carried from §200: this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any free-text note, are recorded with `recordAdditive(worksheet, "U21", "truthSpecificationDefect" | "reviewerNotes", text, "PRODUCT_OWNER")` — alongside the verdicts, never in place of one, and never by rewriting the frozen preregistration.

---

## Axis reference — every axis, as §200 froze it

Reproduced verbatim. Each axis states what would justify each outcome and what must not influence the answer.

### Row-level axes

#### A — FIRST_PASS_GAP_RECALL

- **question:** Were ALL genuinely decision-critical unresolved facts declared for this row?
- **what bears on it:** the observation text, what it establishes, what it leaves open. A fact is decision-critical only if two materially different answers lead to two different CURRENT outcomes.
- **CORRECT when:** every gap the text genuinely leaves open, and that changes what is done today, was declared
- **PARTIALLY_CORRECT when:** some but not all such gaps were declared
- **INCORRECT when:** a gap that changes what is done today was not declared at all
- **must not influence:** whether the count matches the preregistered range; how well written the declaration is

#### B — FIRST_PASS_GAP_PRECISION

- **question:** Were unnecessary or already-resolved facts avoided?
- **what bears on it:** whether each declared fact is genuinely open in the text AND genuinely changes today's action
- **CORRECT when:** no declared fact is already established by the text and none is decision-neutral
- **PARTIALLY_CORRECT when:** one of several declarations is unnecessary
- **INCORRECT when:** a declared fact is answered by the text, or both its answers lead to the same action today
- **must not influence:** whether asking anyway would be harmless or good practice

#### H — MULTI_GAP_PRESERVATION

- **question:** Do independent gaps survive INDEPENDENTLY?
- **what bears on it:** whether two declared facts are genuinely different facts, and whether settling one leaves the other open
- **CORRECT when:** each declared fact stands alone and would need its own evidence
- **PARTIALLY_CORRECT when:** both gaps are present but partly conflated
- **INCORRECT when:** two declarations restate one gap, or one declaration silently merges two
- **must not influence:** the structural distinctness of the computed keys — already reported mechanically

#### I — FALSE_GAP_SUPPRESSION

- **question:** On a row whose text is sufficient, was an unnecessary owed fact avoided?
- **what bears on it:** the matched partner row is named so both can be read together
- **CORRECT when:** no fact was declared, or any declared fact is genuinely open
- **PARTIALLY_CORRECT when:** a declared fact is marginal rather than clearly false
- **INCORRECT when:** a fact was declared that the text answers, or that changes nothing today
- **must not influence:** that declaring something would have been more thorough

### Fact-level axes

#### C — OWED_PROPERTY_SEMANTIC_CORRECTNESS

- **question:** Does this declaration identify the EXACT property that remains unknown?
- **CORRECT when:** the property named is the one the text leaves open
- **PARTIALLY_CORRECT when:** the property is in the right area but stated more narrowly or more broadly than the open question
- **INCORRECT when:** the property named is a NEIGHBOUR the text already establishes — presence for securement, appearance for function, repair for verification
- **must not influence:** that OwedFact has no dedicated field for the property; score from missingFact and the whole declaration

#### D — EVIDENCE_SPAN_SEMANTIC_RELEVANCE

- **question:** Is the verbatim span actually relevant to WHY this fact is unresolved?
- **CORRECT when:** the span is the text that shows the fact is open, or that makes it matter
- **PARTIALLY_CORRECT when:** the span is relevant but a materially better one was available
- **INCORRECT when:** the span is verbatim but points at something else
- **must not influence:** span length; deterministic substring validity is already proven and is not the question

#### E — BRANCH_PLAUSIBILITY

- **question:** Are branchA and branchB genuinely possible resolutions of THIS exact fact?
- **CORRECT when:** both branches are real possible STATES OF THE WORLD given the observation
- **PARTIALLY_CORRECT when:** one branch is sound and the other is not
- **INCORRECT when:** a branch is a rhetorical opposite, an invented state the text excludes, or an answer to a different question
- **must not influence:** which branch is more likely

#### F — DECISION_DIVERGENCE_VALIDITY

- **question:** Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?
- **CORRECT when:** the two actions differ in what someone would do now
- **PARTIALLY_CORRECT when:** the actions differ in degree but arguably not in kind
- **INCORRECT when:** the wording differs but the action is the same, or an action does not follow from its branch
- **must not influence:** that the boundary already refused identical strings — it compares bytes, not decisions

#### G — AFFECTED_DECISION_CORRECTNESS

- **question:** Is the fact bound to the correct affectedDecision?
- **CORRECT when:** the label names the decision the missing fact actually blocks
- **PARTIALLY_CORRECT when:** the label is defensible but a listed alternative fits better
- **INCORRECT when:** the label names a topic rather than the blocked decision
- **must not influence:** whether it matches the preregistered one — acceptable alternatives are listed, and the preregistered truth is itself unreviewed

#### L — VERIFIER_TARGET_BINDING

- **question:** Does the verifier verdict address the EXACT projected owed fact?
- **CORRECT when:** the verdict is about this fact and no other
- **PARTIALLY_CORRECT when:** it reaches the right topic but drifts to an adjacent property
- **INCORRECT when:** it addresses a neighbouring property, a different hazard, or the row in general
- **must not influence:** that admission passed — admission is structural. TOPIC REACH IS NOT EXACT BINDING.

#### M — CLARIFICATION_RESOLUTION_SUFFICIENCY

- **question:** Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?
- **CORRECT when:** an answer would establish or refute the property
- **PARTIALLY_CORRECT when:** an answer would narrow the fact without settling it
- **INCORRECT when:** it names the right fact but would be satisfied by evidence that leaves the property open — presence, visibility, a status indicator, a signature
- **must not influence:** how well phrased the question is. TOPIC REACH IS NOT RESOLUTION SUFFICIENCY.

#### N — GOVERNED_EVIDENCE_QUOTATION_BOUNDARY

- **question:** Was reliance on a supplied governed record legitimate, and any quotation faithful?
- **CORRECT when:** reliance declared only where the record bears on the fact, and the proposition says what the record says
- **PARTIALLY_CORRECT when:** reliance is defensible but the proposition stretches the record
- **INCORRECT when:** reliance declared on an off-point record, or the proposition overstates it
- **must not influence:** that admission passed — structural reuse is not semantic validation

#### Q — OWED_PROPERTY_LOSS_IMPACT

- **question:** Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?
- **scale:** `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`
- **method:** compare the first-pass missingFact (shown) against what the verifier actually received (the projected OwedFact, which does NOT carry missingFact), then read the verifier verdict, which only ever saw the projected form
- **must not influence:** MEASUREMENT ONLY. Does not authorise adding a field or mutating the contract.

#### R — PRIORITY_FLOOR_IMPACT

- **question:** How would you classify this fact's safety significance, and does the OTHER floor under-escalate it?
- **scale:** `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`
- **method:** classify the fact, then compare against the projected priority, which is OTHER for every fact
- **must not influence:** MEASUREMENT ONLY. Does not authorise changing the gate or granting the provider escalation authority.

#### S — FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half)

- **question:** Was naming — or not naming — a governed sourceId appropriate for this fact?
- **CORRECT when:** a record that bears on the fact was named, or an off-point record was correctly left unnamed
- **INCORRECT when:** an off-point record was named, or a record that plainly bears on the fact was ignored
- **must not influence:** NOT_EXERCISED for every §199 fact — the capability was never present on a row that reached inference

#### T — FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING

- **question:** PRECONDITION FIRST: did the provider-visible treatment contain governed evidence sufficient to judge grounding at all?
- **CORRECT when:** the treatment was sufficient AND the binding is grounded in it
- **INCORRECT when:** the treatment was sufficient and the binding is nonetheless ungrounded
- **must not influence:** CORRECT sourceId SELECTION ALONE IS NEVER ENOUGH FOR T. NOT_EXERCISED for every §199 fact.


---

## Provenance of every byte in this packet

```json
// frozen sources
{
  "section200Worksheet": "verification/expert-hazlenz-semantic-adjudication-2026-09-07/ADJUDICATION-WORKSHEET.json",
  "section200WorksheetSha256": "07dbb1707fa7bca43438ad2e7daade8c53d39acf0af9ea10513b1b37af9900f2",
  "section200Session": "verification/expert-hazlenz-semantic-adjudication-2026-09-07/ADJUDICATION-SESSION.md",
  "section200SessionSha256": "ea70f67c2e297114f711ab1796550e1c00855ddeef1fa109bb809a2fa3e31278",
  "section199RawFirstPass": "verification/expert-hazlenz-successor-structured-e2e-2026-09-07/RAW-FIRST-PASS-OUTPUTS.jsonl",
  "section199RawFirstPassSha256": "eafc0f2e2d4385c43f3c6a8fad480075a6d9e867a5b31f2efaa0d7a9ff052204",
  "section199RawVerifier": "verification/expert-hazlenz-successor-structured-e2e-2026-09-07/RAW-VERIFIER-OUTPUTS.jsonl",
  "section199RawVerifierSha256": "351d52c47d6be6d7ce6cf5998f18a644a982c2191ad697c24108913f4470684c",
  "section199PreregistrationSha256": "ddd6f63d56de4e6e62037457bed06b3de59b1100d169ec1b28d427d6f3d4fea4"
}
```

Built by `hazlenz.expert.202.adjudication-grouping.v1`.

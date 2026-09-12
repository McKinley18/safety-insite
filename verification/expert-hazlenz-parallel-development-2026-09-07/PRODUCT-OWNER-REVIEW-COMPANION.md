# §201 — Product-owner review companion for the §200 adjudication

**Purpose: adjudicate one row at a time without opening another file.** Every card below is self-contained: the scenario, the frozen expectation, the model output verbatim, the deterministic transitions, and the exact worksheet slots that are still `null`.

**This document supplies no verdicts and no semantic judgement of any kind.** It reorganises evidence that already exists in the §199 and §200 artifacts. Nothing in `§195`–`§200` was modified. Zero provider calls, zero database operations.

Source artifacts (unmodified, read only):

| artifact | path |
|---|---|
| §199 run evidence | `verification/expert-hazlenz-successor-structured-e2e-2026-09-07/` |
| §200 worksheet + session | `verification/expert-hazlenz-semantic-adjudication-2026-09-07/` |
| §199 cohort module | `backend/scripts/lib/expert-199-cohort-2026-09-07.ts` |

Worksheet status: `PENDING_HUMAN_ADJUDICATION` — `0 / 152` verdict slots supplied, `24` prefilled `NOT_EXERCISED`. Preregistration SHA-256 `ddd6f63d56de4e6e62037457bed06b3de59b1100d169ec1b28d427d6f3d4fea4`.

_Counting note: `152` is the worksheet’s own `verdictSlotsTotal`. Section 11 of each card lists every field whose current value is `null`, which additionally includes the verifier sub-axes and the optional `truthSpecificationDefect` / `reviewerNotes` fields. The per-card counts and the `152` headline are counting different sets; neither is being restated as the other._

---

## What is adjudicable

| | |
|---|---|
| Rows requiring review | **10** |
| Projected facts requiring review | **8** |
| Refused declarations requiring separate review | **1** (`SF-05`) |
| Total verdict slots | **152** |

**`SG-01` and `SG-02` are excluded and are stated here once.** Both were rejected before inference; no model output exists for either. The worksheet records the reason verbatim:

> this row was REJECTED BEFORE INFERENCE. No model output exists. Every axis is NOT_EXERCISED and no semantic judgement is possible or permitted.

They appear nowhere else in this document. The ten cards below are the complete adjudicable set.

---

## Verdict vocabulary

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

Plus one additive outcome, `TRUTH_SPECIFICATION_DEFECT`:

> a first-class outcome, not an afterthought. The §199 truth manifest is AI-authored and was never product-owner reviewed, so a divergence between a declaration and an expectation is equally consistent with a defective declaration and a defective expectation. Where the expectation is wrong or underspecified, record the defect here ADDITIVELY — the frozen preregistration is never rewritten, and the model is not forced to fail against bad truth.

On reading the mechanical comparisons:

> each is a byte-level or set-membership comparison whose answer is not in dispute. "The span is not inside any acceptable region" is a FACT; "therefore D is INCORRECT" is a VERDICT, and no observation draws that line. An observation can also be right about the comparison and wrong about what matters, because the truth it compares against is unreviewed.

## Axis reference

### Row axes

| id | name | question | correct when | incorrect when | partial when | must not influence |
|---|---|---|---|---|---|---|
| **A** | FIRST_PASS_GAP_RECALL | Were ALL genuinely decision-critical unresolved facts declared for this row? | every gap the text genuinely leaves open, and that changes what is done today, was declared | a gap that changes what is done today was not declared at all | some but not all such gaps were declared | whether the count matches the preregistered range; how well written the declaration is |
| **B** | FIRST_PASS_GAP_PRECISION | Were unnecessary or already-resolved facts avoided? | no declared fact is already established by the text and none is decision-neutral | a declared fact is answered by the text, or both its answers lead to the same action today | one of several declarations is unnecessary | whether asking anyway would be harmless or good practice |
| **H** | MULTI_GAP_PRESERVATION | Do independent gaps survive INDEPENDENTLY? | each declared fact stands alone and would need its own evidence | two declarations restate one gap, or one declaration silently merges two | both gaps are present but partly conflated | the structural distinctness of the computed keys — already reported mechanically |
| **I** | FALSE_GAP_SUPPRESSION | On a row whose text is sufficient, was an unnecessary owed fact avoided? | no fact was declared, or any declared fact is genuinely open | a fact was declared that the text answers, or that changes nothing today | a declared fact is marginal rather than clearly false | that declaring something would have been more thorough |

Axis **A** additionally: _the observation text, what it establishes, what it leaves open. A fact is decision-critical only if two materially different answers lead to two different CURRENT outcomes._

### Fact axes

| id | name | question | correct when | incorrect when | partial when | must not influence |
|---|---|---|---|---|---|---|
| **C** | OWED_PROPERTY_SEMANTIC_CORRECTNESS | Does this declaration identify the EXACT property that remains unknown? | the property named is the one the text leaves open | the property named is a NEIGHBOUR the text already establishes — presence for securement, appearance for function, repair for verification | the property is in the right area but stated more narrowly or more broadly than the open question | that OwedFact has no dedicated field for the property; score from missingFact and the whole declaration |
| **D** | EVIDENCE_SPAN_SEMANTIC_RELEVANCE | Is the verbatim span actually relevant to WHY this fact is unresolved? | the span is the text that shows the fact is open, or that makes it matter | the span is verbatim but points at something else | the span is relevant but a materially better one was available | span length; deterministic substring validity is already proven and is not the question |
| **E** | BRANCH_PLAUSIBILITY | Are branchA and branchB genuinely possible resolutions of THIS exact fact? | both branches are real possible STATES OF THE WORLD given the observation | a branch is a rhetorical opposite, an invented state the text excludes, or an answer to a different question | one branch is sound and the other is not | which branch is more likely |
| **F** | DECISION_DIVERGENCE_VALIDITY | Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions? | the two actions differ in what someone would do now | the wording differs but the action is the same, or an action does not follow from its branch | the actions differ in degree but arguably not in kind | that the boundary already refused identical strings — it compares bytes, not decisions |
| **G** | AFFECTED_DECISION_CORRECTNESS | Is the fact bound to the correct affectedDecision? | the label names the decision the missing fact actually blocks | the label names a topic rather than the blocked decision | the label is defensible but a listed alternative fits better | whether it matches the preregistered one — acceptable alternatives are listed, and the preregistered truth is itself unreviewed |
| **L** | VERIFIER_TARGET_BINDING | Does the verifier verdict address the EXACT projected owed fact? | the verdict is about this fact and no other | it addresses a neighbouring property, a different hazard, or the row in general | it reaches the right topic but drifts to an adjacent property | that admission passed — admission is structural. TOPIC REACH IS NOT EXACT BINDING. |
| **M** | CLARIFICATION_RESOLUTION_SUFFICIENCY | Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact? | an answer would establish or refute the property | it names the right fact but would be satisfied by evidence that leaves the property open — presence, visibility, a status indicator, a signature | an answer would narrow the fact without settling it | how well phrased the question is. TOPIC REACH IS NOT RESOLUTION SUFFICIENCY. |
| **N** | GOVERNED_EVIDENCE_QUOTATION_BOUNDARY | Was reliance on a supplied governed record legitimate, and any quotation faithful? | reliance declared only where the record bears on the fact, and the proposition says what the record says | reliance declared on an off-point record, or the proposition overstates it | reliance is defensible but the proposition stretches the record | that admission passed — structural reuse is not semantic validation |
| **S** | FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half) | Was naming — or not naming — a governed sourceId appropriate for this fact? | a record that bears on the fact was named, or an off-point record was correctly left unnamed | an off-point record was named, or a record that plainly bears on the fact was ignored |  | NOT_EXERCISED for every §199 fact — the capability was never present on a row that reached inference |
| **T** | FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING | PRECONDITION FIRST: did the provider-visible treatment contain governed evidence sufficient to judge grounding at all? | the treatment was sufficient AND the binding is grounded in it | the treatment was sufficient and the binding is nonetheless ungrounded |  | CORRECT sourceId SELECTION ALONE IS NEVER ENOUGH FOR T. NOT_EXERCISED for every §199 fact. |

### Fact axes carrying a scale rather than the verdict vocabulary

**Q — OWED_PROPERTY_LOSS_IMPACT**  
Did the ABSENCE of a dedicated owed-property field in OwedFact cause loss for this fact?  
Scale: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` · `NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` · `HUMAN_REVIEW_DIFFICULTY`  
Method: compare the first-pass missingFact (shown) against what the verifier actually received (the projected OwedFact, which does NOT carry missingFact), then read the verifier verdict, which only ever saw the projected form  
Must not influence: MEASUREMENT ONLY. Does not authorise adding a field or mutating the contract.

**R — PRIORITY_FLOOR_IMPACT**  
How would you classify this fact's safety significance, and does the OTHER floor under-escalate it?  
Scale: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` · `INDETERMINATE`  
Method: classify the fact, then compare against the projected priority, which is OTHER for every fact  
Must not influence: MEASUREMENT ONLY. Does not authorise changing the gate or granting the provider escalation authority.

---

## Run-level facts that apply to every card

| | |
|---|---|
| Governed capability on every row that reached inference | `ABSENT` |
| Governed records shown to the first pass, all ten rows | 0 |
| Governed records shown to the verifier, all eight facts | 0 |
| Deterministic findings shown, all ten rows | 0 |
| Verifier executions | 8 — reached inference 8, admitted 8, refused 0 |
| Verifier verdict distribution | VERIFIED_AS_IS × 7, NO_CLARIFICATION_REQUIRED × 1 |
| Verifier `regulatoryBasis.reliance` declared non-NONE | 0 |
| `priority` on every projected OwedFact | `OTHER` |
| `missingFact` carried into the projected OwedFact | **no** — the field does not exist on `OwedFact`; the verifier never saw it |
| Projection version | `hazlenz.expert.first-pass-owed-fact-projection.v1` |

Axes **N**, **S** and **T** are prefilled `NOT_EXERCISED` on every fact. The worksheet states why:

> N, S and T are prefilled NOT_EXERCISED because the governed capability was never present on a row that reached inference. That is a statement about the RUN, not about the model, and it is the only value those axes may carry.

---

## Card index

| row | families | paired with | expected gaps | raw decls | admitted | refused | verifier calls |
|---|---|---|---|---|---|---|---|
| [SF-01](#sf-01) | SINGLE_REAL_UNRESOLVED_FACT, NEARBY_PROPERTY_COMPETITION | SF-03 | 1–1 | 1 | 1 | 0 | 1 |
| [SF-02](#sf-02) | MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS | — | 2–2 | 1 | 1 | 0 | 1 |
| [SF-03](#sf-03) | NO_REAL_GAP, NEARBY_PROPERTY_COMPETITION | SF-01 | 0–0 | 0 | 0 | 0 | 0 |
| [SF-04](#sf-04) | NO_REAL_GAP, TEMPORAL_SCOPE | SF-06 | 0–0 | 1 | 1 | 0 | 1 |
| [SF-05](#sf-05) | SINGLE_REAL_UNRESOLVED_FACT, FUNCTION_VERSUS_APPEARANCE | SF-12 | 1–1 | 1 | 0 | 1 | 0 |
| [SF-06](#sf-06) | SINGLE_REAL_UNRESOLVED_FACT, TEMPORAL_SCOPE | SF-04 | 1–1 | 1 | 1 | 0 | 1 |
| [SF-07](#sf-07) | SINGLE_REAL_UNRESOLVED_FACT, NEARBY_PROPERTY_COMPETITION | — | 1–1 | 1 | 1 | 0 | 1 |
| [SF-08](#sf-08) | CONJUNCTIVE_FACT | — | 1–2 | 2 | 2 | 0 | 2 |
| [SF-11](#sf-11) | SINGLE_REAL_UNRESOLVED_FACT, EXPOSURE_DECISION, NOT_OBSERVED_IS_NOT_ABSENT | — | 1–1 | 1 | 1 | 0 | 1 |
| [SF-12](#sf-12) | NO_REAL_GAP, FUNCTION_VERSUS_APPEARANCE | SF-05 | 0–0 | 0 | 0 | 0 | 0 |

---

## SF-01

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-01`) |
| transport canary | **yes — §199’s first provider call** |
| governed capability | `ABSENT` |
| families | `SINGLE_REAL_UNRESOLVED_FACT`, `NEARBY_PROPERTY_COMPETITION` |
| paired with | `SF-03` |
| sequence position | 1 of 12 |
| location / task / jurisdiction | fabrication bay · drilling steel plate on a bench-mounted drill press · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Bench-mounted drill press in the fabrication bay. The chuck guard is fitted and is closed over the chuck. Two of the three guard mounting points are visible from the operator side and both carry a bolt. The third mounting point is behind the column and could not be seen from where the inspector stood. The machine was running and an operator was drilling steel plate at the time of the visit.

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 1, max 1**  ·  expected facts listed: 1

_Preregistered `establishedByTheText`_

- a chuck guard is fitted
- the guard is closed over the chuck
- two of three mounting points carry a bolt
- the machine was running with an operator at it

_Preregistered `notEstablishedByTheText`_

- whether the guard is secured at the third mounting point
- whether the two visible bolts are tight

#### Expected fact 1 — `chuck guard securement at all mounting points`

| field | value |
|---|---|
| `owedProperty` | whether the chuck guard is securely fastened at every mounting point, so that it cannot be displaced while the spindle turns |
| `expectedAffectedDecision` | `REQUIRED_CONTROL` |
| `acceptableAlternativeAffectedDecisions` | **(none listed)** |
| `branchSemantics.aMustMean` | the guard is fastened and secure at every mounting point |
| `branchSemantics.bMustMean` | the guard is unfastened or insecure at one or more mounting points |
| `expectedDecisionDivergence.ifA` | the guard is accepted as an effective control and the machine continues in use |
| `expectedDecisionDivergence.ifB` | the drill press is stopped until the guard is properly secured and re-checked |
| `designNoteOnCriticality` | a displaced chuck guard on a running drill press is an entanglement exposure with a person at the machine now; a reviewer may well call this safety-critical |

_`conjuncts` (1)_

- the guard is fastened at all three mounting points

_`acceptableSpanRegions` (2, verbatim substrings of the observation)_

- **R1** — "The third mounting point is behind the column and could not be seen from where the inspector stood"
- **R2** — "Two of the three guard mounting points are visible from the operator side"

_`unacceptableNeighbouringProperties` (4)_

- whether a chuck guard is FITTED — the text states it is
- whether the guard is CLOSED — the text states it is
- whether the guard is the correct type or design for the machine
- whether the operator was trained

_`designIntent`_ — PRESENCE versus SECUREMENT. The guard is unambiguously present and closed, so a declaration about presence is a substitution rather than a near miss.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `ANALYZED` |
| `analysisId` | `AN-199-SF-01` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 1 |
| clarifications | 1 |
| hazard candidates | 1 |
| cross-hazard insights / disagreements | 0 / 0 |
| uncertainty statements | 0 |
| usage | in 22863 / out 1514 tok, $0.060866 |

**`expertExplanation.summary`**

> The chuck guard is fitted and closed, and two of its three mounting points are confirmed bolted, but the third point behind the column could not be seen and its securement is unverified while an operator actively drills steel plate on the running machine. This is a hazard-relevant fact rather than a confirmed guarding failure, so it is raised as a low-confidence candidate with a targeted clarification about the unseen mounting point's fastening state, since a missing or loose bolt there would change whether the guard is adequately secured during operation. No other machine guarding, lockout/tagout, or electrical concerns are indicated by the observation.

**Clarifications asked (1)**

- `third-mount-point-securement` — **question:** Is the third chuck guard mounting point (behind the column) fitted with a bolt, or is it missing/loose?
  - `whyItMatters`: If the third mounting point is properly bolted, the guard is fully secured on all three points and no additional action is needed. If it is missing or loose, the guard is only partially secured while the machine is running and an operator is actively drilling, which would require the machine to be stopped and the guard fastener replaced or tightened before continued use.
  - `affectedDecision`: `HAZARD_SEVERITY` · `criticality`: `IMPORTANT`
  - `evidenceGap`: Whether the third guard mounting point carries a bolt is not visible from the inspector's position and is not stated.
  - `relatesToCandidateKey`: `unverified-third-mount-point`
  - `answersUnresolvedFactDeclarationId`: `third-mount-securement-fact`

**Hazard candidates (1)**

- `unverified-third-mount-point` · family `machine_guarding` · `assertedConditionState` `INSUFFICIENT_EVIDENCE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `LOW`
  - evidence `OBS-SF-01`: "The third mounting point is behind the column and could not be seen from where the inspector stood."
  - `evidenceBasis`: The observation states that the third guard mounting point could not be seen from the inspector's vantage point; it does not state whether that mounting point carries a bolt or is missing one.
  - `reasoning`: The chuck guard is fitted and closed, and two of three mounting points are confirmed bolted, but the securement of the third point is unverified. If that mounting point is unbolted or missing its fastener, the guard could be less securely fixed than it appears, potentially allowing it to shift or be displaced during operation while the machine is running and an operator is actively drilling.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: True

### 4 · Declaration(s) verbatim — every field

#### Declaration `third-mount-securement-fact`

| field | value |
|---|---|
| `declarationId` | third-mount-securement-fact |
| `missingFact` | Whether the third chuck guard mounting point (behind the column) is fastened with a bolt |
| `observationSourceId` | OBS-SF-01 |
| `observationSpan` | The third mounting point is behind the column and could not be seen from where the inspector stood. |
| `notEstablishedBecause` | The observation states only that this mounting point could not be seen from the inspector's position; it does not state whether a bolt is present or absent there. |
| `affectedDecision` | HAZARD_SEVERITY |
| `branchA` | The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points |
| `decisionIfA` | No corrective action needed regarding guard securement; the guard is adequately fastened |
| `branchB` | The third mounting point is missing its bolt or is loose |
| `decisionIfB` | The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured |
| `whyNecessaryNow` | The machine is currently running with an operator actively drilling, so whether the guard is fully secured bears directly on whether the current operating condition is safe to continue. |

### 5 · Declaration admission or refusal

Projection counts: raw 1 · admitted 1 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| `third-mount-securement-fact` | **yes** | _(none)_ | _(none)_ |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

#### `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1`

From declaration `third-mount-securement-fact`.

| `OwedFact` field | value |
|---|---|
| `factKey` | FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1 |
| `affectedDecision` | HAZARD_SEVERITY |
| `source` | FIRST_PASS_MODEL |
| `evidenceSpan` | The third mounting point is behind the column and could not be seen from where the inspector stood. |
| `whyUnresolved` | The observation states only that this mounting point could not be seen from the inspector's position; it does not state whether a bolt is present or absent there. |
| `branchA` | The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points |
| `branchB` | The third mounting point is missing its bolt or is loose |
| `priority` | OTHER |
| `status` | UNRESOLVED |
| `acceptableEvidence` | _(null)_ |
| `modelAuthored` | True |
| `decisionDivergence.ifA` | No corrective action needed regarding guard securement; the guard is adequately fastened |
| `decisionDivergence.ifB` | The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured |

**`missingFact` is NOT carried into the projected `OwedFact`.** The declaration said:

> Whether the third chuck guard mounting point (behind the column) is fastened with a bolt

`missingFactInProjectedOwedFact`: `False`. The verifier received only the fields listed under `whatTheVerifierActuallyReceived`: `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`. This is the material for axis **Q**.

### 8 · Verifier raw output and 9 · verifier admission

#### Verifier call for `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1`

| | |
|---|---|
| `verdict` | **VERIFIED_AS_IS** |
| `clarificationSourceMode` | _(null)_ |
| `bindingFactKey` | _(null)_ |
| `proposedClarification` | _(null)_ |
| `nominatedFact` | _(null)_ |
| `regulatoryBasis.reliance` | `NONE` |
| `regulatoryBasis.sourceIds` | _(empty)_ |
| `regulatoryBasis.proposition` | _(null)_ |
| governed evidence shown to verifier | **none** |
| reached inference | True |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| usage | in 8634 / out 585 tok, $0.023118 |

**`owedFactDeclarations`**

| `factKey` | `declaration` | `challengeReason` |
|---|---|---|
| `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1` | **STILL_UNRESOLVED** | _(null)_ |

**`rationale`**

> The unresolved fact is whether the unseen third mounting point of the chuck guard is bolted. The observation only establishes that two of three points are visibly bolted and the third could not be seen; this genuinely leaves the securement of that point open, and the two possible answers lead to different actions (continue operating vs. stop and fasten). The first-pass clarification asks exactly this: whether the third mounting point is fitted with a bolt or missing/loose. An answer to that question, in either direction, fully resolves the fact — there is no sub-component of the fact left unaddressed (it is a single binary state: bolted or not). No additional fact outside the supplied set appears necessary to determine a safety, regulatory, or control decision here; the guard is otherwise fitted and closed and the only real gap is the fastening state of the hidden point.

**Admission** — admitted: **yes** · codes: _(none)_.

Raw admission record: `{"admitted": true, "codes": [], "detail": [], "bindingAdmitted": false, "nominationAdmitted": false, "challengedFactKeys": [], "citationViolations": [], "citationReuseAdmitted": false, "citationReuse": null, "unauthorisedCitations": [], "regulatoryRelianceDeclared": false, "boundSourceIds": []}`

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 1 → 1 → 1 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `True` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

- `third-mount-securement-fact` → `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1`

**`clarificationLinks`**

| `clarificationId` | `declarationId` | `factKey` | `unresolved` |
|---|---|---|---|
| `third-mount-point-securement` | `third-mount-securement-fact` | `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1` | `False` |

**`identityAudit`** — the computed `factKey` recomputed independently

| `declarationId` | reported | independently recomputed | equal | provider supplied any factKey field |
|---|---|---|---|---|
| `third-mount-securement-fact` | `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1` | `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1` | `True` | `False` |

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-01"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

**Fact-level** — `facts[]` where `factKey == "FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1"`

| slot | current value |
|---|---|
| `verdicts.C_OWED_PROPERTY_SEMANTIC_CORRECTNESS` | **null — awaiting** |
| `verdicts.D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` | **null — awaiting** |
| `verdicts.E_BRANCH_PLAUSIBILITY` | **null — awaiting** |
| `verdicts.F_DECISION_DIVERGENCE_VALIDITY` | **null — awaiting** |
| `verdicts.G_AFFECTED_DECISION_CORRECTNESS` | **null — awaiting** |
| `verdicts.L_VERIFIER_TARGET_BINDING` | **null — awaiting** |
| `verdicts.M_CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verdicts.N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.Q_OWED_PROPERTY_LOSS_IMPACT` | **null — awaiting** |
| `verdicts.R_PRIORITY_FLOOR_IMPACT` | **null — awaiting** |
| `verdicts.R_SAFETY_CLASSIFICATION` | **null — awaiting** |
| `verdicts.S_GOVERNED_ID_BINDING_APPROPRIATENESS` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |

| verifier sub-axis slot | current value |
|---|---|
| `verifierSubAxes.TARGET_TOPIC_REACH` | **null — awaiting** |
| `verifierSubAxes.EXACT_OWED_PROPERTY_BINDING` | **null — awaiting** |
| `verifierSubAxes.CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verifierSubAxes.AFFECTED_DECISION_ALIGNMENT` | **null — awaiting** |
| `verifierSubAxes.BRANCH_DECISION_CONSISTENCY` | **null — awaiting** |
| `verifierSubAxes.CHALLENGE_REVIEWABILITY` | **null — awaiting** |
| `verifierSubAxes.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Open on this fact: **17** (10 axis + 7 verifier sub-axis). Prefilled `NOT_EXERCISED`: `N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY`, `S_GOVERNED_ID_BINDING_APPROPRIATENESS`, `T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 1, max 1.
- Preregistered expected fact entries for this row: 1.
- Raw declarations emitted: 1.
- Declarations admitted by the deterministic boundary: 1.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 1. Hazard candidates emitted: 1.
- Verifier calls made for this row: 1.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

**Declaration `third-mount-securement-fact`**

- Declared `observationSpan`: "The third mounting point is behind the column and could not be seen from where the inspector stood."
- The declared `observationSpan` is a substring of the observation text: `True`.
- Expected fact 1, region **R1** "The third mounting point is behind the column and could not be seen from where the inspector stood": exact string equality with the declared span = `False`; declared span contains the region as a substring = `True`; region contains the declared span as a substring = `False`.
- Expected fact 1, region **R2** "Two of the three guard mounting points are visible from the operator side": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Declared `affectedDecision`: `HAZARD_SEVERITY`.
- Expected fact 1: `expectedAffectedDecision` = `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions` = (empty list); the declared label is a member of that set = `False`.
- Declared `branchA` text: "The third mounting point carries a bolt, matching the other two, so the guard is fully secured on all three points"
- Declared `branchB` text: "The third mounting point is missing its bolt or is loose"
- Declared `decisionIfA` text: "No corrective action needed regarding guard securement; the guard is adequately fastened"
- Declared `decisionIfB` text: "The machine should be stopped and the guard fastener replaced/tightened before drilling continues, since the guard is only partially secured"
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `False`.
- Expected fact 1 branch texts: `aMustMean` = "the guard is fastened and secure at every mounting point"; `bMustMean` = "the guard is unfastened or insecure at one or more mounting points". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 1 `conjuncts` count: 1.

**Computed identity**

- `third-mount-securement-fact`: reported `factKey` and independently recomputed `factKey` are byte-identical: `True`. Provider supplied any `factKey` field: `False`.

**Verifier**

- `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1`: `verdict` = `VERIFIED_AS_IS`; `owedFactDeclarations` names 1 factKey(s); every named key is byte-identical to the supplied key = `True`.
  - `regulatoryBasis.reliance` = `NONE`; `sourceIds` count = 0; `proposition` is null = `True`.
  - `proposedClarification` is null = `True`; `bindingFactKey` is null = `True`; `clarificationSourceMode` is null = `True`.
  - Admission: admitted = `True`; admission codes count = 0.
  - Governed records shown to this verifier call: 0.

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 1 raw / 1 admitted against 1-1 — finding: the admitted count is inside the preregistered range (`isAVerdict`: False)

**...and for fact `FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1`, verbatim**

- _declared evidenceSpan against the preregistered acceptableSpanRegions_ — compared: declared "The third mounting point is behind the column and could not be seen from where the inspector stood." against 2 region(s) — finding: the declared span CONTAINS a preregistered region: "The third mounting point is behind the column and could not be seen from where the inspector stood" (`isAVerdict`: False)
- _declared affectedDecision against the preregistered expectation_ — compared: declared HAZARD_SEVERITY; preregistered REQUIRED_CONTROL; acceptable alternatives (none listed) — finding: is NEITHER the preregistered expectation NOR any listed acceptable alternative (`isAVerdict`: False)
- _shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION_ — compared: 4 neighbour(s) listed — finding: the neighbour sharing most vocabulary (60%) is "whether a chuck guard is FITTED — the text states it is". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence. (`isAVerdict`: False)
- _preregistered conjuncts against the full declaration text_ — compared: 1 conjunct(s) — finding: the expected fact is not conjunctive (`isAVerdict`: False)

Worksheet pointer note on the nearest expectation, verbatim: _chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row._

---

## SF-02

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-02`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS` |
| paired with | _(unpaired)_ |
| sequence position | 10 of 12 |
| location / task / jurisdiction | effluent sump, level -2 · confined-space entry to clear a blocked sump inlet · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Confined-space entry at the effluent sump on level -2. A tripod and winch are rigged over the opening and an attendant is stationed at the top with the winch line attached to the entrant's harness. The entry permit on the clipboard is filled in and signed by the authorised person. The gas monitor clipped to the entrant's harness was switched on and displaying readings; nobody present could say when it was last calibrated or bump-tested. The rescue arrangements section of the permit reads "site team" and nothing further, and the attendant said he had not been told what the rescue plan was. The entrant was in the sump when observed.

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 2, max 2**  ·  expected facts listed: 2

_Preregistered `establishedByTheText`_

- a tripod, winch and attendant are in place and the line is attached to the entrant
- a completed and signed entry permit exists
- a gas monitor is switched on and displaying readings
- the rescue arrangements section names "site team" and nothing further
- the attendant has not been told what the rescue plan is
- the entrant is in the sump now

_Preregistered `notEstablishedByTheText`_

- whether the gas monitor is within its calibration or bump-test validity, so its readings can be relied on
- whether a rescue arrangement capable of retrieving this entrant exists and is known to the people who would have to use it

#### Expected fact 1 — `gas monitor calibration validity`

| field | value |
|---|---|
| `owedProperty` | whether the gas monitor is within its calibration and bump-test validity, so that the readings it is displaying can be relied on as evidence of the atmosphere |
| `expectedAffectedDecision` | `REQUIRED_CONTROL` |
| `acceptableAlternativeAffectedDecisions` | `EXPOSURE` |
| `branchSemantics.aMustMean` | the monitor is in calibration and its readings are trustworthy |
| `branchSemantics.bMustMean` | the monitor is out of calibration or unverified and its readings cannot be relied on |
| `expectedDecisionDivergence.ifA` | the atmospheric monitoring is accepted and the entry continues |
| `expectedDecisionDivergence.ifB` | the entrant is withdrawn until a verified monitor is in use |
| `designNoteOnCriticality` | an unverified monitor on a live confined-space entry is an atmospheric exposure with a person inside now; a reviewer may well call this safety-critical |

_`conjuncts` (1)_

- the monitor is within calibration or bump-test validity

_`acceptableSpanRegions` (2, verbatim substrings of the observation)_

- **R1** — "nobody present could say when it was last calibrated or bump-tested"
- **R2** — "The gas monitor clipped to the entrant's harness was switched on and displaying readings"

_`unacceptableNeighbouringProperties` (4)_

- whether a gas monitor is PRESENT — the text states it is
- whether the monitor is SWITCHED ON — the text states it is
- whether the monitor is DISPLAYING READINGS — the text states it is
- what the readings actually were

#### Expected fact 2 — `rescue arrangement exists and is known to those who must use it`

| field | value |
|---|---|
| `owedProperty` | whether a rescue arrangement capable of retrieving this entrant exists and is known to the attendant who would have to initiate it |
| `expectedAffectedDecision` | `REQUIRED_CONTROL` |
| `acceptableAlternativeAffectedDecisions` | `EXPOSURE` |
| `branchSemantics.aMustMean` | a capable rescue arrangement exists and the attendant knows how to invoke it |
| `branchSemantics.bMustMean` | no capable rescue arrangement exists, or nobody on site knows what it is |
| `expectedDecisionDivergence.ifA` | the entry continues under the existing permit |
| `expectedDecisionDivergence.ifB` | the entry is stopped and the entrant retrieved until rescue arrangements are established and briefed |
| `designNoteOnCriticality` | no known rescue plan during a live entry is the classic confined-space fatality mechanism; a reviewer may well call this safety-critical |

_`conjuncts` (2)_

- a capable rescue arrangement exists
- the people who must use it know what it is

_`acceptableSpanRegions` (2, verbatim substrings of the observation)_

- **R1** — "The rescue arrangements section of the permit reads "site team" and nothing further"
- **R2** — "the attendant said he had not been told what the rescue plan was"

_`unacceptableNeighbouringProperties` (4)_

- whether a permit EXISTS — the text states it exists and is signed
- whether the tripod and winch are RIGGED — the text states they are
- whether an attendant is PRESENT — the text states he is
- whether the permit is filled in — the text states it is

_`designIntent`_ — Two genuinely INDEPENDENT gaps: different equipment, different evidence, different people would answer them, and settling one leaves the other completely open. Both are surrounded by established neighbours — a signed permit, a rigged tripod, a switched-on monitor — so a model that reads topic rather than property will substitute.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `ANALYZED` |
| `analysisId` | `AN-199-SF-02` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 1 |
| clarifications | 1 |
| hazard candidates | 2 |
| cross-hazard insights / disagreements | 1 / 0 |
| uncertainty statements | 0 |
| usage | in 22942 / out 2137 tok, $0.067254 |

**`expertExplanation.summary`**

> An entrant is currently working inside the effluent sump relying on a gas monitor whose calibration/bump-test status is unknown, while the attendant who would need to initiate rescue does not know the rescue plan — both gaps exist during an active entry, not historically. Together these materially compound: an undetected atmospheric hazard combined with an attendant unable to execute rescue leaves no reliable backstop for the entrant. The critical unresolved question is whether a real rescue capability exists behind the 'site team' notation that simply wasn't communicated, or whether no functioning rescue resource exists at all, since that determines whether the fix is an immediate briefing or a stop-work.

**Clarifications asked (1)**

- `cq-rescue-capability` — **question:** What specific rescue capability or resource does the 'site team' rescue arrangement refer to, and is it actually available and able to respond right now?
  - `whyItMatters`: If a defined, available rescue team/capability exists but simply was not communicated to this attendant, the immediate action is to brief the attendant before continuing entry. If no actual rescue capability exists behind the 'site team' notation, the entry must be stopped now because there is no functioning means of rescuing the entrant currently in the space.
  - `affectedDecision`: `REQUIRED_CONTROL` · `criticality`: `BLOCKING`
  - `evidenceGap`: Whether a real, available rescue resource exists behind the permit's 'site team' entry, as distinct from the attendant simply not having been briefed on it
  - `relatesToCandidateKey`: `rescue-plan-inadequate`

**Hazard candidates (2)**

- `gas-monitor-cal-unknown` · family `confined_space` · `assertedConditionState` `ACTIVE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `HIGH`
  - evidence `OBS-SF-02`: "nobody present could say when it was last calibrated or bump-tested"
  - `evidenceBasis`: The observation establishes that nobody present at the time could state when the gas monitor was last calibrated or bump-tested, while the entrant is currently in the sump relying on that monitor for atmospheric warning.
  - `reasoning`: The entrant is in the confined space right now with a gas monitor as the sole means of detecting a hazardous atmosphere. An instrument of unknown calibration/bump-test status may fail to detect or may falsely indicate safe conditions, so the atmospheric monitoring control in active use cannot be relied upon as functioning correctly.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: False
- `rescue-plan-inadequate` · family `confined_space` · `assertedConditionState` `ACTIVE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `HIGH`
  - evidence `OBS-SF-02`: "the attendant said he had not been told what the rescue plan was"
  - `evidenceBasis`: The observation establishes, in the attendant's own statement, that he had not been told the rescue plan while the entrant is currently inside the sump.
  - `reasoning`: With an entrant currently in the confined space, the attendant — the person responsible for initiating or coordinating emergency response — does not know the rescue plan. If an emergency arose right now, the attendant would not know how to summon or execute rescue, directly undermining the effectiveness of the rescue arrangement during an active entry.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: False

**Cross-hazard insights**

- `ci-monitor-rescue` · `interactionKind` `CONFINED_SPACE_ATMOSPHERIC` · participants `gas-monitor-cal-unknown`, `rescue-plan-inadequate` · `confidence` `HIGH`
  - `reasoning`: An atmospheric monitor of unverified calibration/function increases the chance that a hazardous atmosphere develops or exists undetected while the entrant is inside; that same entrant is currently backed by a rescue arrangement the attendant does not understand or know how to execute. If the monitor fails to warn in time, the attendant's inability to act on a known rescue plan removes the last line of defense, making the combination materially worse than either gap alone.

### 4 · Declaration(s) verbatim — every field

#### Declaration `decl-rescue-capability`

| field | value |
|---|---|
| `declarationId` | decl-rescue-capability |
| `missingFact` | Whether an actual, available rescue capability exists corresponding to the permit's 'site team' rescue arrangement |
| `observationSourceId` | OBS-SF-02 |
| `observationSpan` | the attendant said he had not been told what the rescue plan was |
| `notEstablishedBecause` | The observation establishes only that the attendant was not told the rescue plan; it does not establish whether a rescue plan/resource exists but was simply not communicated to him, or whether no functional rescue arrangement exists at all behind the vague permit entry |
| `affectedDecision` | REQUIRED_CONTROL |
| `branchA` | A defined, available rescue capability exists but the attendant was not briefed on it |
| `decisionIfA` | Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete |
| `branchB` | No functional rescue capability exists behind the 'site team' notation |
| `decisionIfB` | Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established |
| `whyNecessaryNow` | The entrant is currently inside the confined space; whether a workable rescue response is available determines whether entry can continue with a corrective briefing or must be halted immediately |

### 5 · Declaration admission or refusal

Projection counts: raw 1 · admitted 1 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| `decl-rescue-capability` | **yes** | _(none)_ | _(none)_ |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

#### `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1`

From declaration `decl-rescue-capability`.

| `OwedFact` field | value |
|---|---|
| `factKey` | FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1 |
| `affectedDecision` | REQUIRED_CONTROL |
| `source` | FIRST_PASS_MODEL |
| `evidenceSpan` | the attendant said he had not been told what the rescue plan was |
| `whyUnresolved` | The observation establishes only that the attendant was not told the rescue plan; it does not establish whether a rescue plan/resource exists but was simply not communicated to him, or whether no functional rescue arrangement exists at all behind the vague permit entry |
| `branchA` | A defined, available rescue capability exists but the attendant was not briefed on it |
| `branchB` | No functional rescue capability exists behind the 'site team' notation |
| `priority` | OTHER |
| `status` | UNRESOLVED |
| `acceptableEvidence` | _(null)_ |
| `modelAuthored` | True |
| `decisionDivergence.ifA` | Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete |
| `decisionDivergence.ifB` | Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established |

**`missingFact` is NOT carried into the projected `OwedFact`.** The declaration said:

> Whether an actual, available rescue capability exists corresponding to the permit's 'site team' rescue arrangement

`missingFactInProjectedOwedFact`: `False`. The verifier received only the fields listed under `whatTheVerifierActuallyReceived`: `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`. This is the material for axis **Q**.

### 8 · Verifier raw output and 9 · verifier admission

#### Verifier call for `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1`

| | |
|---|---|
| `verdict` | **VERIFIED_AS_IS** |
| `clarificationSourceMode` | _(null)_ |
| `bindingFactKey` | _(null)_ |
| `proposedClarification` | _(null)_ |
| `nominatedFact` | _(null)_ |
| `regulatoryBasis.reliance` | `NONE` |
| `regulatoryBasis.sourceIds` | _(empty)_ |
| `regulatoryBasis.proposition` | _(null)_ |
| governed evidence shown to verifier | **none** |
| reached inference | True |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| usage | in 8943 / out 743 tok, $0.025316 |

**`owedFactDeclarations`**

| `factKey` | `declaration` | `challengeReason` |
|---|---|---|
| `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1` | **STILL_UNRESOLVED** | _(null)_ |

**`rationale`**

> The single unresolved fact supplied (whether a real rescue capability exists behind the "site team" notation, versus none existing at all) is exactly what the first-pass clarification question asks: it asks what specific capability the notation refers to and whether it is actually available and able to respond right now. An answer of "yes, X team with Y equipment is on standby and can respond in Z minutes" settles branch A (brief the attendant, continue); an answer of "no such team/resource actually exists or can respond" settles branch B (stop work, withdraw entrant). Both branches of the owed fact are reached by the question as written, so it is fully sufficient — there is no piece of the owed fact left unaddressed. The gas-monitor calibration issue is a separate hazard candidate not covered by this unresolved fact, but no unresolved fact about it was supplied for review here, so it is out of scope for this check. I do not see a need to nominate an additional fact: the two flagged issues (monitor calibration, rescue plan knowledge) are the ones the first pass identified as decision-critical, and the calibration one is not part of the unresolved-facts list I was asked to review, so nominating it would exceed my mandate. No other fact stands out as necessary to determine a decision that isn't already covered by the existing candidates or the asked question.

**Admission** — admitted: **yes** · codes: _(none)_.

Raw admission record: `{"admitted": true, "codes": [], "detail": [], "bindingAdmitted": false, "nominationAdmitted": false, "challengedFactKeys": [], "citationViolations": [], "citationReuseAdmitted": false, "citationReuse": null, "unauthorisedCitations": [], "regulatoryRelianceDeclared": false, "boundSourceIds": []}`

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 1 → 1 → 1 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `False` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

- `decl-rescue-capability` → `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1`

**`clarificationLinks`**

| `clarificationId` | `declarationId` | `factKey` | `unresolved` |
|---|---|---|---|
| `cq-rescue-capability` | _(null)_ | _(null)_ | `False` |

**`identityAudit`** — the computed `factKey` recomputed independently

| `declarationId` | reported | independently recomputed | equal | provider supplied any factKey field |
|---|---|---|---|---|
| `decl-rescue-capability` | `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1` | `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1` | `True` | `False` |

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-02"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

**Fact-level** — `facts[]` where `factKey == "FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1"`

| slot | current value |
|---|---|
| `verdicts.C_OWED_PROPERTY_SEMANTIC_CORRECTNESS` | **null — awaiting** |
| `verdicts.D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` | **null — awaiting** |
| `verdicts.E_BRANCH_PLAUSIBILITY` | **null — awaiting** |
| `verdicts.F_DECISION_DIVERGENCE_VALIDITY` | **null — awaiting** |
| `verdicts.G_AFFECTED_DECISION_CORRECTNESS` | **null — awaiting** |
| `verdicts.L_VERIFIER_TARGET_BINDING` | **null — awaiting** |
| `verdicts.M_CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verdicts.N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.Q_OWED_PROPERTY_LOSS_IMPACT` | **null — awaiting** |
| `verdicts.R_PRIORITY_FLOOR_IMPACT` | **null — awaiting** |
| `verdicts.R_SAFETY_CLASSIFICATION` | **null — awaiting** |
| `verdicts.S_GOVERNED_ID_BINDING_APPROPRIATENESS` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |

| verifier sub-axis slot | current value |
|---|---|
| `verifierSubAxes.TARGET_TOPIC_REACH` | **null — awaiting** |
| `verifierSubAxes.EXACT_OWED_PROPERTY_BINDING` | **null — awaiting** |
| `verifierSubAxes.CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verifierSubAxes.AFFECTED_DECISION_ALIGNMENT` | **null — awaiting** |
| `verifierSubAxes.BRANCH_DECISION_CONSISTENCY` | **null — awaiting** |
| `verifierSubAxes.CHALLENGE_REVIEWABILITY` | **null — awaiting** |
| `verifierSubAxes.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Open on this fact: **17** (10 axis + 7 verifier sub-axis). Prefilled `NOT_EXERCISED`: `N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY`, `S_GOVERNED_ID_BINDING_APPROPRIATENESS`, `T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 2, max 2.
- Preregistered expected fact entries for this row: 2.
- Raw declarations emitted: 1.
- Declarations admitted by the deterministic boundary: 1.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 1. Hazard candidates emitted: 2.
- Verifier calls made for this row: 1.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

**Declaration `decl-rescue-capability`**

- Declared `observationSpan`: "the attendant said he had not been told what the rescue plan was"
- The declared `observationSpan` is a substring of the observation text: `True`.
- Expected fact 1, region **R1** "nobody present could say when it was last calibrated or bump-tested": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Expected fact 1, region **R2** "The gas monitor clipped to the entrant's harness was switched on and displaying readings": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Expected fact 2, region **R1** "The rescue arrangements section of the permit reads "site team" and nothing further": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Expected fact 2, region **R2** "the attendant said he had not been told what the rescue plan was": exact string equality with the declared span = `True`; declared span contains the region as a substring = `True`; region contains the declared span as a substring = `True`.
- Declared `affectedDecision`: `REQUIRED_CONTROL`.
- Expected fact 1: `expectedAffectedDecision` = `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions` = `EXPOSURE`; the declared label is a member of that set = `True`.
- Expected fact 2: `expectedAffectedDecision` = `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions` = `EXPOSURE`; the declared label is a member of that set = `True`.
- Declared `branchA` text: "A defined, available rescue capability exists but the attendant was not briefed on it"
- Declared `branchB` text: "No functional rescue capability exists behind the 'site team' notation"
- Declared `decisionIfA` text: "Immediately brief the attendant on the rescue plan before continuing the entry; entry can continue once briefing is complete"
- Declared `decisionIfB` text: "Stop the entry now and withdraw the entrant until an adequate, verified rescue arrangement is established"
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `False`.
- Expected fact 1 branch texts: `aMustMean` = "the monitor is in calibration and its readings are trustworthy"; `bMustMean` = "the monitor is out of calibration or unverified and its readings cannot be relied on". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 1 `conjuncts` count: 1.
- Expected fact 2 branch texts: `aMustMean` = "a capable rescue arrangement exists and the attendant knows how to invoke it"; `bMustMean` = "no capable rescue arrangement exists, or nobody on site knows what it is". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 2 `conjuncts` count: 2.

**Computed identity**

- `decl-rescue-capability`: reported `factKey` and independently recomputed `factKey` are byte-identical: `True`. Provider supplied any `factKey` field: `False`.

**Verifier**

- `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1`: `verdict` = `VERIFIED_AS_IS`; `owedFactDeclarations` names 1 factKey(s); every named key is byte-identical to the supplied key = `True`.
  - `regulatoryBasis.reliance` = `NONE`; `sourceIds` count = 0; `proposition` is null = `True`.
  - `proposedClarification` is null = `True`; `bindingFactKey` is null = `True`; `clarificationSourceMode` is null = `True`.
  - Admission: admitted = `True`; admission codes count = 0.
  - Governed records shown to this verifier call: 0.

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 1 raw / 1 admitted against 2-2 — finding: the admitted count is OUTSIDE the preregistered range (`isAVerdict`: False)

**...and for fact `FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1`, verbatim**

- _declared evidenceSpan against the preregistered acceptableSpanRegions_ — compared: declared "the attendant said he had not been told what the rescue plan was" against 2 region(s) — finding: the declared span is EXACTLY one of the preregistered regions (`isAVerdict`: False)
- _declared affectedDecision against the preregistered expectation_ — compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives EXPOSURE — finding: matches the preregistered expectation (`isAVerdict`: False)
- _shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION_ — compared: 4 neighbour(s) listed — finding: the neighbour sharing most vocabulary (60%) is "whether a permit EXISTS — the text states it exists and is signed". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence. (`isAVerdict`: False)
- _preregistered conjuncts against the full declaration text_ — compared: 2 conjunct(s) — finding: "a capable rescue arrangement exists…" content-word overlap 75% | "the people who must use it know what it is…" content-word overlap 0% (`isAVerdict`: False)

Worksheet pointer note on the nearest expectation, verbatim: _chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row._

---

## SF-03

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-03`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `NO_REAL_GAP`, `NEARBY_PROPERTY_COMPETITION` |
| paired with | `SF-01` |
| sequence position | 7 of 12 |
| location / task / jurisdiction | fabrication bay · drilling steel plate on a bench-mounted drill press · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Bench-mounted drill press in the fabrication bay. The chuck guard is fitted and is closed over the chuck. The inspector checked all three guard mounting points by hand from both sides of the column and found a bolt fitted and tight at each one. The machine was running and an operator was drilling steel plate at the time of the visit.

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 0, max 0**  ·  expected facts listed: 0

_Preregistered `establishedByTheText`_

- a chuck guard is fitted and closed
- all three mounting points were checked by hand and each is fitted and tight
- the machine was running with an operator at it

_Preregistered `notEstablishedByTheText`_

_(none)_

_No expected owed facts. This is a no-gap row: the frozen truth expects zero declarations._

_`designIntent`_ — The matched partner of SF-01, identical in setting and vocabulary, with the securement established by direct inspection. A gap declared here is a false gap.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `NOTHING_TO_ADD` |
| `analysisId` | `AN-199-SF-03` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 0 |
| clarifications | 0 |
| hazard candidates | 0 |
| cross-hazard insights / disagreements | 0 / 0 |
| uncertainty statements | 0 |
| usage | in 22849 / out 381 tok, $0.049508 |

**`expertExplanation.summary`**

> The observation describes a chuck guard fitted, closed, and physically verified secure at all three mounting points, with the machine running and an operator drilling steel plate normally. Nothing in the text indicates a guarding gap, a lockout/tagout activity, or an electrical exposure at this bench-mounted drill press. No additional hazard candidates or decision-critical questions arise from this observation.

**Clarifications asked (0)**

_(none)_


**Hazard candidates (0)**

_(none)_


### 4 · Declaration(s) verbatim — every field

**Zero declarations emitted.**

### 5 · Declaration admission or refusal

Projection counts: raw 0 · admitted 0 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| _(no declarations)_ | — | — | — |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

**No projected OwedFact for this row.** Zero declarations were emitted.

### 8 · Verifier raw output and 9 · verifier admission

**No verifier call was made for this row** — the verifier runs per projected fact, and this row projected none.

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 0 → 0 → 0 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `True` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

_(empty)_

**`clarificationLinks`**

_(none)_

**`identityAudit`** — the computed `factKey` recomputed independently

_(none)_

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-03"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 0, max 0.
- Preregistered expected fact entries for this row: 0.
- Raw declarations emitted: 0.
- Declarations admitted by the deterministic boundary: 0.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 0. Hazard candidates emitted: 0.
- Verifier calls made for this row: 0.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

_No declarations were emitted, so no per-declaration comparison is defined._

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 0 raw / 0 admitted against 0-0 — finding: the admitted count is inside the preregistered range (`isAVerdict`: False)

---

## SF-04

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-04`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `NO_REAL_GAP`, `TEMPORAL_SCOPE` |
| paired with | `SF-06` |
| sequence position | 5 of 12 |
| location / task / jurisdiction | despatch bay · lifting palletised stock with an overhead gantry crane · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Overhead gantry crane in the despatch bay. The crane was taken out of service on 2 September after the hoist brake was reported slipping. A repair sheet on the maintenance clipboard shows the brake was replaced on 4 September, that a 1.25x rated load test was carried out and passed on 4 September, and that the appointed person signed the crane back into service on 4 September after that test. The sheet does not record which of the two approved brake part numbers was fitted. The crane was in use lifting palletised stock over the loading area when observed.

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 0, max 0**  ·  expected facts listed: 0

_Preregistered `establishedByTheText`_

- the brake was replaced on 4 September
- a 1.25x rated load test was carried out and passed on 4 September
- the appointed person signed the crane back into service after that test
- the crane is in use now

_Preregistered `notEstablishedByTheText`_

- which of the two approved brake part numbers was fitted — a genuine absence that changes nothing about what is done today

_No expected owed facts. This is a no-gap row: the frozen truth expects zero declarations._

_`designIntent`_ — The matched partner of SF-06, with the verification and its timing both stated. It additionally plants ONE real but non-decision-critical absence — the brake part number — so precision is tested against a genuine unknown rather than against a complete text. Declaring the part number is a false gap: both answers lead to the same action today.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `ANALYZED` |
| `analysisId` | `AN-199-SF-04` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 1 |
| clarifications | 1 |
| hazard candidates | 0 |
| cross-hazard insights / disagreements | 0 / 0 |
| uncertainty statements | 0 |
| usage | in 22923 / out 1112 tok, $0.056966 |

**`expertExplanation.summary`**

> The crane's hoist brake failure was remediated: the brake was replaced, a 1.25x rated load test was passed, and the appointed person signed it back into service on 4 September, so no current hazard is established from that history alone. The one open gap is that the repair sheet does not identify which of the two approved brake part numbers was actually fitted, which leaves the configuration of the safety-critical brake component unconfirmed even though the load test passed. No deterministic findings or governed records were supplied, so no regulatory assertion is made here.

**Clarifications asked (1)**

- `CL-1` — **question:** Which of the two approved brake part numbers was fitted during the 4 September repair?
  - `whyItMatters`: If the part fitted is one of the two approved numbers, the repair is compliant and the crane's continued use lifting palletised stock is appropriately supported by the passed 1.25x load test. If the part fitted is NOT one of the two approved numbers (or cannot be confirmed as either), the brake replacement may not meet the approved configuration despite passing the load test that day, which would call into question whether the crane should remain in service now rather than being re-verified or taken out of service pending confirmation.
  - `affectedDecision`: `REQUIRED_CONTROL` · `criticality`: `IMPORTANT`
  - `evidenceGap`: The repair sheet does not record which of the two approved brake part numbers was fitted.
  - `relatesToCandidateKey`: `None`

**Hazard candidates (0)**

_(none)_


### 4 · Declaration(s) verbatim — every field

#### Declaration `DEC-1`

| field | value |
|---|---|
| `declarationId` | DEC-1 |
| `missingFact` | Which of the two approved brake part numbers was installed during the 4 September brake replacement |
| `observationSourceId` | OBS-SF-04 |
| `observationSpan` | The sheet does not record which of the two approved brake part numbers was fitted. |
| `notEstablishedBecause` | The text explicitly states the repair sheet does not record which part number was fitted; it does not state that an unapproved part was used, only that the record is silent on which of the two approved options was chosen. |
| `affectedDecision` | REQUIRED_CONTROL |
| `branchA` | The fitted part is confirmed to be one of the two approved brake part numbers |
| `decisionIfA` | The repair and return to service are fully supported by the record; no further action needed on the brake identity |
| `branchB` | The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part) |
| `decisionIfB` | The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification |
| `whyNecessaryNow` | The crane is currently in active use lifting palletised stock over the loading area, so the adequacy of the safety-critical brake component bears directly on present operational safety. |

### 5 · Declaration admission or refusal

Projection counts: raw 1 · admitted 1 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| `DEC-1` | **yes** | _(none)_ | _(none)_ |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

#### `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1`

From declaration `DEC-1`.

| `OwedFact` field | value |
|---|---|
| `factKey` | FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1 |
| `affectedDecision` | REQUIRED_CONTROL |
| `source` | FIRST_PASS_MODEL |
| `evidenceSpan` | The sheet does not record which of the two approved brake part numbers was fitted. |
| `whyUnresolved` | The text explicitly states the repair sheet does not record which part number was fitted; it does not state that an unapproved part was used, only that the record is silent on which of the two approved options was chosen. |
| `branchA` | The fitted part is confirmed to be one of the two approved brake part numbers |
| `branchB` | The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part) |
| `priority` | OTHER |
| `status` | UNRESOLVED |
| `acceptableEvidence` | _(null)_ |
| `modelAuthored` | True |
| `decisionDivergence.ifA` | The repair and return to service are fully supported by the record; no further action needed on the brake identity |
| `decisionDivergence.ifB` | The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification |

**`missingFact` is NOT carried into the projected `OwedFact`.** The declaration said:

> Which of the two approved brake part numbers was installed during the 4 September brake replacement

`missingFactInProjectedOwedFact`: `False`. The verifier received only the fields listed under `whatTheVerifierActuallyReceived`: `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`. This is the material for axis **Q**.

### 8 · Verifier raw output and 9 · verifier admission

#### Verifier call for `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1`

| | |
|---|---|
| `verdict` | **NO_CLARIFICATION_REQUIRED** |
| `clarificationSourceMode` | _(null)_ |
| `bindingFactKey` | _(null)_ |
| `proposedClarification` | _(null)_ |
| `nominatedFact` | _(null)_ |
| `regulatoryBasis.reliance` | `NONE` |
| `regulatoryBasis.sourceIds` | _(empty)_ |
| `regulatoryBasis.proposition` | _(null)_ |
| governed evidence shown to verifier | **none** |
| reached inference | True |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| usage | in 8476 / out 1054 tok, $0.027492 |

**`owedFactDeclarations`**

| `factKey` | `declaration` | `challengeReason` |
|---|---|---|
| `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1` | **CHALLENGE_FACT_VALIDITY** | The observation states there are two approved brake part numbers and the sheet fails to record only which of those two was fitted, not whether an approved part was used at all. Since both candidate answers are 'an approved part was fitted' (just differing in which specific number), and the replacement was followed by a passed 1.25x rated load test and appointed-person sign-off, both branches lead to the same action today: the crane remains validly returned to service. The fact as framed does not change what is done now. |

**`rationale`**

> The observation states both approved part numbers are "approved" — i.e., either would be an acceptable fitment. The repair sheet's silence is only as to WHICH of the two approved numbers was used, not whether an approved part was used at all. A 1.25x rated load test was carried out and passed after the replacement, and the appointed person signed the crane back into service based on that test. The load test is the functional verification of brake performance; it does not depend on which of the two approved part numbers was fitted, since both are approved (i.e., both are deemed suitable for the application by whatever approval process qualified them). Answering the question either way ('part number A was fitted' vs 'part number B was fitted') does not change what is done today: in both cases the brake was replaced with an approved part, tested at 1.25x rated load, passed, and signed back into service by the appointed person. The first-pass analysis itself frames the fact as being about which of the two approved numbers was used, not about whether an unapproved part might have been used — the observation does not support that latter reading, since it affirmatively describes only two approved options and says the sheet fails to record which was chosen, not that the fitted part's approval status is in doubt. Because the two branches of the fact as actually stated (approved part number 1 vs approved part number 2) lead to the identical action today (crane remains in service, no further verification needed), this is a magnitude/detail-with-control-already-in-place situation: the control (replacement with an approved part, verified by passed load test and sign-off) is already stated as in place. Therefore the first-pass clarification, while not wrong to raise administratively, is not decision-changing, and no clarification is required from the verifier's perspective. No additional fact outside those supplied appears to govern a live decision either — the repair, test, and sign-off are all stated as completed and successful.

**Admission** — admitted: **yes** · codes: _(none)_.

Raw admission record: `{"admitted": true, "codes": [], "detail": [], "bindingAdmitted": false, "nominationAdmitted": false, "challengedFactKeys": ["FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1"], "citationViolations": [], "citationReuseAdmitted": false, "citationReuse": null, "unauthorisedCitations": [], "regulatoryRelianceDeclared": false, "boundSourceIds": []}`

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 1 → 1 → 1 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `False` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

- `DEC-1` → `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1`

**`clarificationLinks`**

| `clarificationId` | `declarationId` | `factKey` | `unresolved` |
|---|---|---|---|
| `CL-1` | _(null)_ | _(null)_ | `False` |

**`identityAudit`** — the computed `factKey` recomputed independently

| `declarationId` | reported | independently recomputed | equal | provider supplied any factKey field |
|---|---|---|---|---|
| `DEC-1` | `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1` | `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1` | `True` | `False` |

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-04"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

**Fact-level** — `facts[]` where `factKey == "FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1"`

| slot | current value |
|---|---|
| `verdicts.C_OWED_PROPERTY_SEMANTIC_CORRECTNESS` | **null — awaiting** |
| `verdicts.D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` | **null — awaiting** |
| `verdicts.E_BRANCH_PLAUSIBILITY` | **null — awaiting** |
| `verdicts.F_DECISION_DIVERGENCE_VALIDITY` | **null — awaiting** |
| `verdicts.G_AFFECTED_DECISION_CORRECTNESS` | **null — awaiting** |
| `verdicts.L_VERIFIER_TARGET_BINDING` | **null — awaiting** |
| `verdicts.M_CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verdicts.N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.Q_OWED_PROPERTY_LOSS_IMPACT` | **null — awaiting** |
| `verdicts.R_PRIORITY_FLOOR_IMPACT` | **null — awaiting** |
| `verdicts.R_SAFETY_CLASSIFICATION` | **null — awaiting** |
| `verdicts.S_GOVERNED_ID_BINDING_APPROPRIATENESS` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |

| verifier sub-axis slot | current value |
|---|---|
| `verifierSubAxes.TARGET_TOPIC_REACH` | **null — awaiting** |
| `verifierSubAxes.EXACT_OWED_PROPERTY_BINDING` | **null — awaiting** |
| `verifierSubAxes.CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verifierSubAxes.AFFECTED_DECISION_ALIGNMENT` | **null — awaiting** |
| `verifierSubAxes.BRANCH_DECISION_CONSISTENCY` | **null — awaiting** |
| `verifierSubAxes.CHALLENGE_REVIEWABILITY` | **null — awaiting** |
| `verifierSubAxes.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Open on this fact: **17** (10 axis + 7 verifier sub-axis). Prefilled `NOT_EXERCISED`: `N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY`, `S_GOVERNED_ID_BINDING_APPROPRIATENESS`, `T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 0, max 0.
- Preregistered expected fact entries for this row: 0.
- Raw declarations emitted: 1.
- Declarations admitted by the deterministic boundary: 1.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 1. Hazard candidates emitted: 0.
- Verifier calls made for this row: 1.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

**Declaration `DEC-1`**

- Declared `observationSpan`: "The sheet does not record which of the two approved brake part numbers was fitted."
- The declared `observationSpan` is a substring of the observation text: `True`.
- The preregistered truth for this row lists zero `acceptableSpanRegions` because it lists zero expected facts. No span comparison is defined.
- Declared `affectedDecision`: `REQUIRED_CONTROL`.
- Declared `branchA` text: "The fitted part is confirmed to be one of the two approved brake part numbers"
- Declared `branchB` text: "The fitted part cannot be confirmed as either approved part number (or is confirmed to be a different, unapproved part)"
- Declared `decisionIfA` text: "The repair and return to service are fully supported by the record; no further action needed on the brake identity"
- Declared `decisionIfB` text: "The crane's brake configuration should be verified against approved specifications before continued reliance on the 4 September test, potentially warranting re-inspection or re-verification"
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `False`.

**Computed identity**

- `DEC-1`: reported `factKey` and independently recomputed `factKey` are byte-identical: `True`. Provider supplied any `factKey` field: `False`.

**Verifier**

- `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1`: `verdict` = `NO_CLARIFICATION_REQUIRED`; `owedFactDeclarations` names 1 factKey(s); every named key is byte-identical to the supplied key = `True`.
  - `regulatoryBasis.reliance` = `NONE`; `sourceIds` count = 0; `proposition` is null = `True`.
  - `proposedClarification` is null = `True`; `bindingFactKey` is null = `True`; `clarificationSourceMode` is null = `True`.
  - Admission: admitted = `True`; admission codes count = 0.
  - Governed records shown to this verifier call: 0.

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 1 raw / 1 admitted against 0-0 — finding: the admitted count is OUTSIDE the preregistered range (`isAVerdict`: False)

**...and for fact `FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1`, verbatim**

- _declared property against a NO-GAP row's frozen truth, which preregistered ZERO expected facts_ — compared: 1 notEstablishedByTheText entr(ies), 4 establishedByTheText entr(ies) — finding: closest notEstablished entry (50% shared vocabulary): "which of the two approved brake part numbers was fitted — a genuine absence that changes nothing about what is done today" — closest established entry (67%): "the brake was replaced on 4 September" — THE QUESTION FOR THE REVIEWER: is this a genuine uncertainty the preregistered truth failed to capture (a TRUTH_SPECIFICATION_DEFECT), a restatement of something already established, or a real but decision-neutral absence? (`isAVerdict`: False)
- _declared evidenceSpan_ — compared: the row preregistered no expected facts — finding: the declared span is "The sheet does not record which of the two approved brake part numbers was fitted."; there is no preregistered acceptable region to compare it against on a no-gap row (`isAVerdict`: False)

Worksheet pointer note on the nearest expectation, verbatim: _chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row._

---

## SF-05

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-05`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `SINGLE_REAL_UNRESOLVED_FACT`, `FUNCTION_VERSUS_APPEARANCE` |
| paired with | `SF-12` |
| sequence position | 2 of 12 |
| location / task / jurisdiction | tool room · machining a fixture on a vertical machining centre · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Vertical machining centre in the tool room. The interlocked access door is closed. The status lamp on the control panel shows green, which the operator said means the interlock is made. The interlock switch itself is mounted behind the door frame and was not accessible for inspection. No record of an interlock function test was available on site and nobody present could say when one was last carried out. The machine was cutting when observed.

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 1, max 1**  ·  expected facts listed: 1

_Preregistered `establishedByTheText`_

- the access door is closed
- a status lamp shows green and the operator reports that this indicates the interlock is made
- the interlock switch is present but was not accessible for inspection
- no function-test record was available on site
- the machine was cutting

_Preregistered `notEstablishedByTheText`_

- whether opening the door actually stops hazardous motion
- whether the interlock has ever been function-tested

#### Expected fact 1 — `door interlock protective function verified`

| field | value |
|---|---|
| `owedProperty` | whether the access-door interlock actually stops hazardous motion when the door is opened — that is, whether it performs its protective function |
| `expectedAffectedDecision` | `REQUIRED_CONTROL` |
| `acceptableAlternativeAffectedDecisions` | **(none listed)** |
| `branchSemantics.aMustMean` | the interlock stops hazardous motion when the door is opened |
| `branchSemantics.bMustMean` | the interlock does not stop hazardous motion, or is defeated or defective |
| `expectedDecisionDivergence.ifA` | the interlock is accepted as an effective control and machining continues |
| `expectedDecisionDivergence.ifB` | the machine is taken out of service until the interlock is repaired and proven |
| `designNoteOnCriticality` | an unproven interlock on a machine that is cutting is an access-to-moving-parts exposure now; a reviewer may well call this safety-critical |

_`conjuncts` (1)_

- the interlock stops hazardous motion on door opening

_`acceptableSpanRegions` (3, verbatim substrings of the observation)_

- **R1** — "No record of an interlock function test was available on site"
- **R2** — "The interlock switch itself is mounted behind the door frame and was not accessible for inspection"
- **R3** — "nobody present could say when one was last carried out"

_`unacceptableNeighbouringProperties` (5)_

- whether an interlock is FITTED — the text states the switch is there
- whether the door is CLOSED — the text states it is
- whether the status lamp is lit or legible — the text states it shows green
- whether the operator understands what the lamp means
- whether the switch is accessible for inspection — that is the reason the fact is open, not the fact itself

_`designIntent`_ — APPEARANCE and STATUS INDICATION versus PROTECTIVE FUNCTION. A green lamp, a closed door and a present switch are all stated. None of them establishes that the interlock works, and a declaration that accepts any of them as the fact is wrong.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `ANALYZED` |
| `analysisId` | `AN-199-SF-05` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 1 |
| clarifications | 1 |
| hazard candidates | 1 |
| cross-hazard insights / disagreements | 0 / 0 |
| uncertainty statements | 0 |
| usage | in 22859 / out 1484 tok, $0.060558 |

**`expertExplanation.summary`**

> The machine is actively cutting while access-door guarding relies entirely on a status lamp interpreted by the operator, since the interlock switch itself could not be inspected and no function-test record exists. This is a gap in verified guarding function rather than a confirmed defeat of the interlock, so the hazard is raised as unresolved rather than active or negated. Resolving whether the interlock is genuinely functional determines whether the current cutting operation is adequately guarded or must be stopped pending verification.

**Clarifications asked (1)**

- `cq1` — **question:** Can the interlock switch be verified as functioning (by direct inspection, by a function test, or by another means other than the status lamp) rather than relying solely on the status lamp indication?
  - `whyItMatters`: If the interlock is confirmed functioning, the closed door is a valid guard and the machine can continue operating as guarded. If the interlock cannot be confirmed functioning and only the operator-interpreted lamp is available, the machine may be running with an unverified guarding function during active cutting, which would require the machine to be stopped and the interlock verified or repaired before resuming.
  - `affectedDecision`: `REQUIRED_CONTROL` · `criticality`: `BLOCKING`
  - `evidenceGap`: Whether the interlock switch is actually functioning is not established; only a status lamp interpreted by the operator indicates this, the switch itself was inaccessible for inspection, and no test record exists.
  - `relatesToCandidateKey`: `unverified_interlock`
  - `answersUnresolvedFactDeclarationId`: `decl1`

**Hazard candidates (1)**

- `unverified_interlock` · family `machine_guarding` · `assertedConditionState` `INSUFFICIENT_EVIDENCE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `MODERATE`
  - evidence `OBS-SF-05`: "The interlock switch itself is mounted behind the door frame and was not accessible for inspection."
  - evidence `OBS-SF-05`: "No record of an interlock function test was available on site and nobody present could say when one was last carried out."
  - `evidenceBasis`: The physical interlock switch could not be inspected, and no record exists of when its function was last verified. The only indication of interlock status is a status lamp the operator interpreted as meaning the interlock is made.
  - `reasoning`: Reliance on a status lamp interpreted by the operator, without an accessible switch or a documented function test, means the interlock's actual protective function while the machine is cutting cannot be confirmed from the observation. If the interlock is not actually functioning, the door being closed would not prevent access to the hazardous machining area during operation.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: True

### 4 · Declaration(s) verbatim — every field

#### Declaration `decl1`

| field | value |
|---|---|
| `declarationId` | decl1 |
| `missingFact` | Whether the interlock switch is functioning as intended |
| `observationSourceId` | OBS-SF-05 |
| `observationSpan` | was not accessible for inspection |
| `notEstablishedBecause` | The observation states the switch could not be physically inspected and that no test record exists showing when a function test was last performed; it does not state whether the interlock is actually working or defeated, only that its status is reported via a lamp interpreted by the operator. |
| `affectedDecision` | REQUIRED_CONTROL |
| `branchA` | The interlock switch is functioning correctly and reliably signals door position to the control system |
| `decisionIfA` | **(empty string)** |
| `branchB` | The interlock switch is not functioning correctly or reliably (worn, miswired, or bypassed) despite the lamp showing green |
| `decisionIfB` | **(empty string)** |
| `whyNecessaryNow` | placeholder |

### 5 · Declaration admission or refusal

Projection counts: raw 1 · admitted 0 · refused 1.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| `decl1` | **NO** | `REQUIRED_FIELD_MISSING`, `REQUIRED_FIELD_MISSING` | decisionIfA is empty ; decisionIfB is empty |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

**No projected OwedFact for this row.** The single declaration was refused whole; nothing was projected, and deterministic code repaired nothing.

### 8 · Verifier raw output and 9 · verifier admission

**No verifier call was made for this row** — the verifier runs per projected fact, and this row projected none.

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 1 → 0 → 0 |
| refused declarations | 1 |
| `countWithinPreregisteredRange` | `False` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

_(empty)_

**`clarificationLinks`**

| `clarificationId` | `declarationId` | `factKey` | `unresolved` |
|---|---|---|---|
| `cq1` | `decl1` | _(null)_ | `True` |

**`identityAudit`** — the computed `factKey` recomputed independently

_(none)_

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-05"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

**Refused-declaration slots** — `refusedDeclarations[]` where `rowId == "SF-05"` and `declarationId == "decl1"`

| slot | current value | the question it asks |
|---|---|---|
| `twoSeparateQuestions.STRUCTURAL_REFUSAL_CORRECTNESS` | **null — awaiting** | was the deterministic boundary RIGHT to refuse this declaration whole, given the contract? Nothing was repaired or completed by deterministic code. |
| `twoSeparateQuestions.UNDERLYING_SEMANTIC_INTENT` | **null — awaiting** | setting the malformation aside, did the model appear to identify a LEGITIMATE unresolved fact? A structurally malformed output can reveal semantic capability or semantic failure, and these must not be collapsed. |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** | — |
| `reviewerNotes` | **null — awaiting (optional)** | — |

Refusal codes recorded: `REQUIRED_FIELD_MISSING`, `REQUIRED_FIELD_MISSING`. Refusal detail: "decisionIfA is empty"; "decisionIfB is empty".

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 1, max 1.
- Preregistered expected fact entries for this row: 1.
- Raw declarations emitted: 1.
- Declarations admitted by the deterministic boundary: 0.
- Declarations refused by the deterministic boundary: 1.
- Clarifications emitted: 1. Hazard candidates emitted: 1.
- Verifier calls made for this row: 0.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

**Declaration `decl1`**

- Declared `observationSpan`: "was not accessible for inspection"
- The declared `observationSpan` is a substring of the observation text: `True`.
- Expected fact 1, region **R1** "No record of an interlock function test was available on site": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Expected fact 1, region **R2** "The interlock switch itself is mounted behind the door frame and was not accessible for inspection": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `True`.
- Expected fact 1, region **R3** "nobody present could say when one was last carried out": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Declared `affectedDecision`: `REQUIRED_CONTROL`.
- Expected fact 1: `expectedAffectedDecision` = `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions` = (empty list); the declared label is a member of that set = `True`.
- Declared `branchA` text: "The interlock switch is functioning correctly and reliably signals door position to the control system"
- Declared `branchB` text: "The interlock switch is not functioning correctly or reliably (worn, miswired, or bypassed) despite the lamp showing green"
- Declared `decisionIfA` text: ""  **(empty string)**
- Declared `decisionIfB` text: ""  **(empty string)**
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `True`.
- Expected fact 1 branch texts: `aMustMean` = "the interlock stops hazardous motion when the door is opened"; `bMustMean` = "the interlock does not stop hazardous motion, or is defeated or defective". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 1 `conjuncts` count: 1.

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 1 raw / 0 admitted against 1-1 — finding: the admitted count is OUTSIDE the preregistered range (`isAVerdict`: False)

---

## SF-06

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-06`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `SINGLE_REAL_UNRESOLVED_FACT`, `TEMPORAL_SCOPE` |
| paired with | `SF-04` |
| sequence position | 9 of 12 |
| location / task / jurisdiction | despatch bay · lifting palletised stock with an overhead gantry crane · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Overhead gantry crane in the despatch bay. The crane was taken out of service on 2 September after the hoist brake was reported slipping. A repair sheet on the maintenance clipboard shows the brake was replaced on 4 September and carries a signature in the "work completed" box. The "load test" and "returned to service" boxes on the same sheet are blank. The crane was in use lifting palletised stock over the loading area when observed.

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 1, max 1**  ·  expected facts listed: 1

_Preregistered `establishedByTheText`_

- the brake was reported slipping and the crane was taken out of service on 2 September
- the brake was replaced on 4 September
- the "work completed" box carries a signature
- the "load test" and "returned to service" boxes are blank
- the crane is in use lifting loads now

_Preregistered `notEstablishedByTheText`_

- whether the replaced brake was proven under load before the crane went back into use
- whether anyone formally returned the crane to service

#### Expected fact 1 — `hoist brake proven under load before return to service`

| field | value |
|---|---|
| `owedProperty` | whether the replaced hoist brake was verified to hold under load BEFORE the crane was put back into use — the verification and its timing together |
| `expectedAffectedDecision` | `REQUIRED_CONTROL` |
| `acceptableAlternativeAffectedDecisions` | **(none listed)** |
| `branchSemantics.aMustMean` | the brake was load-tested and the crane formally returned to service before it was used again |
| `branchSemantics.bMustMean` | the crane went back into use without the replaced brake being proven under load |
| `expectedDecisionDivergence.ifA` | the repair is accepted as complete and lifting continues |
| `expectedDecisionDivergence.ifB` | lifting stops and the crane is withdrawn until the brake is load-tested and the crane is formally returned to service |
| `designNoteOnCriticality` | an unproven hoist brake on a crane lifting loads over a working area is a dropped-load exposure now; a reviewer may well call this safety-critical |

_`conjuncts` (2)_

- the brake was verified to hold under load
- that verification happened before the crane was returned to use

_`acceptableSpanRegions` (2, verbatim substrings of the observation)_

- **R1** — "The "load test" and "returned to service" boxes on the same sheet are blank"
- **R2** — "carries a signature in the "work completed" box"

_`unacceptableNeighbouringProperties` (4)_

- whether the brake was REPLACED — the text states it was, on 4 September
- whether a repair sheet exists — the text states it does and that it is signed
- whether the original slipping fault was real
- whether the crane is inspected periodically in general

_`designIntent`_ — TEMPORAL SCOPE. The repair is established; what is open is verification AND its position in time relative to return to service. A declaration that drops the temporal conjunct has lost the thing that makes the fact decision-critical.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `ANALYZED` |
| `analysisId` | `AN-199-SF-06` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 1 |
| clarifications | 1 |
| hazard candidates | 2 |
| cross-hazard insights / disagreements | 1 / 0 |
| uncertainty statements | 0 |
| usage | in 22890 / out 2302 tok, $0.068800 |

**`expertExplanation.summary`**

> The gantry crane's hoist brake was replaced after a slipping report, but the load test and returned-to-service verification on the repair sheet remain blank, and the crane is nonetheless observed actively lifting palletised stock over the loading area. This leaves the repaired braking system unverified during current operations, creating an active mobile-equipment hazard and a corresponding struck-by exposure for anyone in or near the loading area beneath the load. Whether a load test was actually performed by some means not reflected on the sheet is the key open fact that determines whether continued use is acceptable or the crane should be stopped pending verification.

**Clarifications asked (1)**

- `CLAR-LOADTEST` — **question:** Has the replaced hoist brake been load-tested and functionally verified since the repair, even though the repair sheet's load test and returned-to-service boxes are blank?
  - `whyItMatters`: If a load test was in fact performed (by some other means or record) and the brake is confirmed functional, the crane's continued use is supported and no further restriction is needed; if no load test has been performed, the crane is being operated with a safety-critical brake repair unverified, and it should be removed from service and load-tested before further lifts.
  - `affectedDecision`: `REQUIRED_CONTROL` · `criticality`: `BLOCKING`
  - `evidenceGap`: The repair sheet shows the brake replacement was signed complete but the load test and returned-to-service boxes are blank, and the crane is currently in use.
  - `relatesToCandidateKey`: `CRANE_RETURNED_WITHOUT_LOAD_TEST`

**Hazard candidates (2)**

- `CRANE_RETURNED_WITHOUT_LOAD_TEST` · family `mobile_equipment` · `assertedConditionState` `ACTIVE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `HIGH`
  - evidence `OBS-SF-06`: "The "load test" and "returned to service" boxes on the same sheet are blank."
  - evidence `OBS-SF-06`: "The crane was in use lifting palletised stock over the loading area when observed."
  - `evidenceBasis`: The repair record shows the brake replacement was signed off but the load test and returned-to-service boxes were left blank, and the crane is nonetheless shown actively lifting palletised stock over the loading area at the time of observation.
  - `reasoning`: A hoist brake that was reported slipping was replaced, but the documented post-repair load test and formal return-to-service verification were not completed on the record, yet the crane is being operated to lift loads over an area where personnel are present (loading area). Operating a crane whose repaired braking system has not been load-tested or formally verified as fit for service presents an active risk of load control failure (e.g. brake slip, dropped load, uncontrolled descent) during current lifting operations.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: False
- `STRUCK_BY_DROPPED_LOAD_LOADING_AREA` · family `mobile_equipment` · `assertedConditionState` `ACTIVE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `MODERATE`
  - evidence `OBS-SF-06`: "lifting palletised stock over the loading area when observed"
  - `evidenceBasis`: The crane was observed actively lifting palletised stock over the loading area, which is a location where personnel would ordinarily be present or transiting.
  - `reasoning`: Given the unverified brake repair described above, an unplanned load drop or descent during a lift directly over the loading area creates a struck-by/crushing exposure to anyone working in or passing through that area while the lift is in progress.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: False

**Cross-hazard insights**

- `INSIGHT-UNVERIFIED-BRAKE-LOAD-EXPOSURE` · `interactionKind` `OTHER` · participants `CRANE_RETURNED_WITHOUT_LOAD_TEST`, `STRUCK_BY_DROPPED_LOAD_LOADING_AREA` · `confidence` `HIGH`
  - `reasoning`: An unverified brake repair (no completed load test or return-to-service sign-off) combined with active lifting of palletised stock directly over the loading area means any latent brake fault would manifest as a load-control failure precisely where personnel are exposed beneath or near the suspended load, converting an unconfirmed equipment condition into a direct struck-by/crushing risk.

### 4 · Declaration(s) verbatim — every field

#### Declaration `DECL-LOADTEST`

| field | value |
|---|---|
| `declarationId` | DECL-LOADTEST |
| `missingFact` | Whether the replaced hoist brake was load-tested and verified functional before the crane returned to lifting operations |
| `observationSourceId` | OBS-SF-06 |
| `observationSpan` | The "load test" and "returned to service" boxes on the same sheet are blank. |
| `notEstablishedBecause` | The sheet shows the repair (brake replacement) was signed as completed, but the load test and returned-to-service boxes being blank only establishes that those specific record entries were not filled in — it does not establish whether a load test was actually performed and simply not documented, or never performed at all. |
| `affectedDecision` | REQUIRED_CONTROL |
| `branchA` | A load test was performed and the brake verified functional, but the paperwork was not completed |
| `decisionIfA` | The crane may continue lifting operations, with a corrective action to complete the documentation record |
| `branchB` | No load test was performed and the brake's post-repair function is unverified |
| `decisionIfB` | The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area |
| `whyNecessaryNow` | The crane is currently in active use lifting palletised stock over the loading area, so the correct action today (continue vs. stop pending verification) depends directly on whether the safety-critical brake repair has actually been verified as functional. |

### 5 · Declaration admission or refusal

Projection counts: raw 1 · admitted 1 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| `DECL-LOADTEST` | **yes** | _(none)_ | _(none)_ |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

#### `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1`

From declaration `DECL-LOADTEST`.

| `OwedFact` field | value |
|---|---|
| `factKey` | FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1 |
| `affectedDecision` | REQUIRED_CONTROL |
| `source` | FIRST_PASS_MODEL |
| `evidenceSpan` | The "load test" and "returned to service" boxes on the same sheet are blank. |
| `whyUnresolved` | The sheet shows the repair (brake replacement) was signed as completed, but the load test and returned-to-service boxes being blank only establishes that those specific record entries were not filled in — it does not establish whether a load test was actually performed and simply not documented, or never performed at all. |
| `branchA` | A load test was performed and the brake verified functional, but the paperwork was not completed |
| `branchB` | No load test was performed and the brake's post-repair function is unverified |
| `priority` | OTHER |
| `status` | UNRESOLVED |
| `acceptableEvidence` | _(null)_ |
| `modelAuthored` | True |
| `decisionDivergence.ifA` | The crane may continue lifting operations, with a corrective action to complete the documentation record |
| `decisionDivergence.ifB` | The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area |

**`missingFact` is NOT carried into the projected `OwedFact`.** The declaration said:

> Whether the replaced hoist brake was load-tested and verified functional before the crane returned to lifting operations

`missingFactInProjectedOwedFact`: `False`. The verifier received only the fields listed under `whatTheVerifierActuallyReceived`: `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`. This is the material for axis **Q**.

### 8 · Verifier raw output and 9 · verifier admission

#### Verifier call for `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1`

| | |
|---|---|
| `verdict` | **VERIFIED_AS_IS** |
| `clarificationSourceMode` | _(null)_ |
| `bindingFactKey` | _(null)_ |
| `proposedClarification` | _(null)_ |
| `nominatedFact` | _(null)_ |
| `regulatoryBasis.reliance` | `NONE` |
| `regulatoryBasis.sourceIds` | _(empty)_ |
| `regulatoryBasis.proposition` | _(null)_ |
| governed evidence shown to verifier | **none** |
| reached inference | True |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| usage | in 8950 / out 678 tok, $0.024680 |

**`owedFactDeclarations`**

| `factKey` | `declaration` | `challengeReason` |
|---|---|---|
| `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1` | **STILL_UNRESOLVED** | _(null)_ |

**`rationale`**

> The single unresolved fact identified — whether a load test was actually performed post-repair despite blank documentation — is directly decision-critical: if performed, the crane may continue with a paperwork correction; if not performed, the crane must be stopped pending verification given it is actively lifting over an occupied loading area. The first-pass clarification question ("Has the replaced hoist brake been load-tested and functionally verified since the repair, even though the repair sheet's load test and returned-to-service boxes are blank?") asks exactly this: it does not merely ask about the paperwork, it asks about the actual performance of the load test and functional verification. An answer of "yes, verified" or "no, not verified" resolves the fact completely — there is no sub-component of the fact left unaddressed. Reviewing for a fact the first pass may have missed: no other fact in the observation appears to govern a distinct decision. The operator's identity, the specific loading area occupancy at this instant, and the exact repair procedure are either not stated as decision-relevant or do not change what should be done today given the existing hazard framing. No additional nomination is warranted.

**Admission** — admitted: **yes** · codes: _(none)_.

Raw admission record: `{"admitted": true, "codes": [], "detail": [], "bindingAdmitted": false, "nominationAdmitted": false, "challengedFactKeys": [], "citationViolations": [], "citationReuseAdmitted": false, "citationReuse": null, "unauthorisedCitations": [], "regulatoryRelianceDeclared": false, "boundSourceIds": []}`

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 1 → 1 → 1 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `True` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

- `DECL-LOADTEST` → `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1`

**`clarificationLinks`**

| `clarificationId` | `declarationId` | `factKey` | `unresolved` |
|---|---|---|---|
| `CLAR-LOADTEST` | _(null)_ | _(null)_ | `False` |

**`identityAudit`** — the computed `factKey` recomputed independently

| `declarationId` | reported | independently recomputed | equal | provider supplied any factKey field |
|---|---|---|---|---|
| `DECL-LOADTEST` | `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1` | `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1` | `True` | `False` |

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-06"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

**Fact-level** — `facts[]` where `factKey == "FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1"`

| slot | current value |
|---|---|
| `verdicts.C_OWED_PROPERTY_SEMANTIC_CORRECTNESS` | **null — awaiting** |
| `verdicts.D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` | **null — awaiting** |
| `verdicts.E_BRANCH_PLAUSIBILITY` | **null — awaiting** |
| `verdicts.F_DECISION_DIVERGENCE_VALIDITY` | **null — awaiting** |
| `verdicts.G_AFFECTED_DECISION_CORRECTNESS` | **null — awaiting** |
| `verdicts.L_VERIFIER_TARGET_BINDING` | **null — awaiting** |
| `verdicts.M_CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verdicts.N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.Q_OWED_PROPERTY_LOSS_IMPACT` | **null — awaiting** |
| `verdicts.R_PRIORITY_FLOOR_IMPACT` | **null — awaiting** |
| `verdicts.R_SAFETY_CLASSIFICATION` | **null — awaiting** |
| `verdicts.S_GOVERNED_ID_BINDING_APPROPRIATENESS` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |

| verifier sub-axis slot | current value |
|---|---|
| `verifierSubAxes.TARGET_TOPIC_REACH` | **null — awaiting** |
| `verifierSubAxes.EXACT_OWED_PROPERTY_BINDING` | **null — awaiting** |
| `verifierSubAxes.CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verifierSubAxes.AFFECTED_DECISION_ALIGNMENT` | **null — awaiting** |
| `verifierSubAxes.BRANCH_DECISION_CONSISTENCY` | **null — awaiting** |
| `verifierSubAxes.CHALLENGE_REVIEWABILITY` | **null — awaiting** |
| `verifierSubAxes.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Open on this fact: **17** (10 axis + 7 verifier sub-axis). Prefilled `NOT_EXERCISED`: `N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY`, `S_GOVERNED_ID_BINDING_APPROPRIATENESS`, `T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 1, max 1.
- Preregistered expected fact entries for this row: 1.
- Raw declarations emitted: 1.
- Declarations admitted by the deterministic boundary: 1.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 1. Hazard candidates emitted: 2.
- Verifier calls made for this row: 1.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

**Declaration `DECL-LOADTEST`**

- Declared `observationSpan`: "The "load test" and "returned to service" boxes on the same sheet are blank."
- The declared `observationSpan` is a substring of the observation text: `True`.
- Expected fact 1, region **R1** "The "load test" and "returned to service" boxes on the same sheet are blank": exact string equality with the declared span = `False`; declared span contains the region as a substring = `True`; region contains the declared span as a substring = `False`.
- Expected fact 1, region **R2** "carries a signature in the "work completed" box": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Declared `affectedDecision`: `REQUIRED_CONTROL`.
- Expected fact 1: `expectedAffectedDecision` = `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions` = (empty list); the declared label is a member of that set = `True`.
- Declared `branchA` text: "A load test was performed and the brake verified functional, but the paperwork was not completed"
- Declared `branchB` text: "No load test was performed and the brake's post-repair function is unverified"
- Declared `decisionIfA` text: "The crane may continue lifting operations, with a corrective action to complete the documentation record"
- Declared `decisionIfB` text: "The crane should be stopped and removed from lifting service until a load test is performed and the brake verified functional, given it is currently lifting loads over an occupied loading area"
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `False`.
- Expected fact 1 branch texts: `aMustMean` = "the brake was load-tested and the crane formally returned to service before it was used again"; `bMustMean` = "the crane went back into use without the replaced brake being proven under load". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 1 `conjuncts` count: 2.

**Computed identity**

- `DECL-LOADTEST`: reported `factKey` and independently recomputed `factKey` are byte-identical: `True`. Provider supplied any `factKey` field: `False`.

**Verifier**

- `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1`: `verdict` = `VERIFIED_AS_IS`; `owedFactDeclarations` names 1 factKey(s); every named key is byte-identical to the supplied key = `True`.
  - `regulatoryBasis.reliance` = `NONE`; `sourceIds` count = 0; `proposition` is null = `True`.
  - `proposedClarification` is null = `True`; `bindingFactKey` is null = `True`; `clarificationSourceMode` is null = `True`.
  - Admission: admitted = `True`; admission codes count = 0.
  - Governed records shown to this verifier call: 0.

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 1 raw / 1 admitted against 1-1 — finding: the admitted count is inside the preregistered range (`isAVerdict`: False)

**...and for fact `FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1`, verbatim**

- _declared evidenceSpan against the preregistered acceptableSpanRegions_ — compared: declared "The \"load test\" and \"returned to service\" boxes on the same sheet are blank." against 2 region(s) — finding: the declared span CONTAINS a preregistered region: "The \"load test\" and \"returned to service\" boxes on the same sheet are blank" (`isAVerdict`: False)
- _declared affectedDecision against the preregistered expectation_ — compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives (none listed) — finding: matches the preregistered expectation (`isAVerdict`: False)
- _shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION_ — compared: 4 neighbour(s) listed — finding: the neighbour sharing most vocabulary (60%) is "whether the brake was REPLACED — the text states it was, on 4 September". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence. (`isAVerdict`: False)
- _preregistered conjuncts against the full declaration text_ — compared: 2 conjunct(s) — finding: "the brake was verified to hold under load…" content-word overlap 67% | "that verification happened before the crane was retu…" content-word overlap 60% (`isAVerdict`: False)

Worksheet pointer note on the nearest expectation, verbatim: _chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row._

---

## SF-07

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-07`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `SINGLE_REAL_UNRESOLVED_FACT`, `NEARBY_PROPERTY_COMPETITION` |
| paired with | _(unpaired)_ |
| sequence position | 12 of 12 |
| location / task / jurisdiction | paint prep area · solvent wipe-down of panels at an extracted bench · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Solvent wipe-down bench in the paint prep area. A local exhaust ventilation hood is installed directly above the bench and its fan was running and audible. The system's last recorded examination is dated within the past twelve months and the label is attached to the ducting. Two operators were wiping panels with a ketone-based cleaner in the open. The wiping is carried out about 600 mm forward of the hood face, on the near edge of the bench. No airflow indicator is fitted at the hood and nobody present could say whether the hood draws vapour away from the position where the wiping is actually done.

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 1, max 1**  ·  expected facts listed: 1

_Preregistered `establishedByTheText`_

- an LEV hood is installed above the bench
- the fan is running
- the last recorded examination is within the past twelve months
- wiping happens about 600 mm forward of the hood face
- no airflow indicator is fitted
- two operators are working with a ketone-based cleaner now

_Preregistered `notEstablishedByTheText`_

- whether the LEV actually captures solvent vapour at the position where the wiping is done

#### Expected fact 1 — `LEV capture effectiveness at the actual work position`

| field | value |
|---|---|
| `owedProperty` | whether the local exhaust ventilation actually captures solvent vapour at the position where the wiping is carried out, about 600 mm forward of the hood face |
| `expectedAffectedDecision` | `REQUIRED_CONTROL` |
| `acceptableAlternativeAffectedDecisions` | `EXPOSURE` |
| `branchSemantics.aMustMean` | the LEV captures vapour effectively at the position where wiping occurs |
| `branchSemantics.bMustMean` | the LEV does not capture vapour at that position and operators are breathing it |
| `expectedDecisionDivergence.ifA` | the LEV is accepted as an effective control and wiping continues at the bench |
| `expectedDecisionDivergence.ifB` | wiping is moved into the capture zone, or stopped, until capture at the work position is established |
| `designNoteOnCriticality` | ineffective capture with operators wiping ketone in the open is an inhalation exposure now; a reviewer may judge this important rather than immediately life-critical |

_`conjuncts` (1)_

- the LEV captures vapour at the actual work position

_`acceptableSpanRegions` (3, verbatim substrings of the observation)_

- **R1** — "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done"
- **R2** — "The wiping is carried out about 600 mm forward of the hood face"
- **R3** — "No airflow indicator is fitted at the hood"

_`unacceptableNeighbouringProperties` (5)_

- whether an LEV is INSTALLED — the text states it is
- whether the fan is RUNNING — the text states it is
- whether the system has been EXAMINED — the text states the examination is within twelve months
- whether an airflow indicator is fitted — that is the reason the fact is open, not the fact
- whether respiratory protective equipment is worn — not raised by the text

_`designIntent`_ — INSTALLATION and EXAMINATION versus EFFECTIVENESS AT THE WORK POSITION. Three strong neighbours are established, and the geometry — 600 mm forward of the hood face — is the objective reason the effectiveness question is live rather than imagined.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `ANALYZED` |
| `analysisId` | `AN-199-SF-07` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 1 |
| clarifications | 1 |
| hazard candidates | 2 |
| cross-hazard insights / disagreements | 0 / 0 |
| uncertainty statements | 1 |
| usage | in 22934 / out 2261 tok, $0.068478 |

**`expertExplanation.summary`**

> Two operators are currently wiping panels with a ketone-based solvent at a bench position 600 mm forward of the LEV hood face, and the observation states plainly that nobody present could confirm the hood actually captures vapour at that working position — this is a live, unresolved chemical exposure question rather than a settled control. The hood's fan running and its recent examination record speak to the system's general functional status, not to whether it achieves effective capture at the specific point where the work is done, so those facts do not close the gap. A ketone solvent also raises a secondary, currently unconfirmed flammability consideration given no data on flashpoint, quantity, or ignition sources, which is retained at low confidence pending further information.

**Clarifications asked (1)**

- `CL-1` — **question:** What is the measured or verified capture velocity/airflow at the actual wiping position (600 mm forward of the hood face, near edge of bench), and does it meet the effective capture range for this hood design?
  - `whyItMatters`: If capture velocity at the wiping position is adequate, the operators are effectively protected by LEV despite being off-axis, and no additional control is needed beyond continued monitoring. If capture at that position is inadequate, operators are being exposed to un-captured ketone vapour during an active task and the work must stop or move until effective capture is confirmed, or additional controls (respirators, hood repositioning, work practice change) must be implemented now.
  - `affectedDecision`: `REQUIRED_CONTROL` · `criticality`: `BLOCKING`
  - `evidenceGap`: No airflow indicator is fitted at the hood and no one present could state whether the hood draws vapour away from the actual wiping position.
  - `relatesToCandidateKey`: `CAND-1`
  - `answersUnresolvedFactDeclarationId`: `DECL-1`

**Hazard candidates (2)**

- `CAND-1` · family `chemical_exposure` · `assertedConditionState` `ACTIVE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `HIGH`
  - evidence `OBS-SF-07`: "Two operators were wiping panels with a ketone-based cleaner in the open"
  - evidence `OBS-SF-07`: "The wiping is carried out about 600 mm forward of the hood face, on the near edge of the bench"
  - evidence `OBS-SF-07`: "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done"
  - `evidenceBasis`: The observation establishes that two operators are actively wiping panels with a ketone-based solvent at a position offset from the hood face, and that nobody present could determine whether the hood's capture effect reaches that position.
  - `reasoning`: The task is being performed now, using an evaporative ketone solvent, at a location (600 mm forward, near edge of bench) where capture effectiveness is stated as unknown to those present. This is a current inhalation exposure to solvent vapour during an ongoing task, not a hypothetical — the operators are actively at the point of generation while capture at that point is unconfirmed.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: False
- `CAND-2` · family `fire_explosion` · `assertedConditionState` `INSUFFICIENT_EVIDENCE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `LOW`
  - evidence `OBS-SF-07`: "ketone-based cleaner"
  - `evidenceBasis`: The observation identifies the cleaner as ketone-based, a class of solvent that is commonly flammable, but the text does not state its flashpoint, quantity in use, or presence of ignition sources at the bench.
  - `reasoning`: Ketone solvents are frequently flammable and used in an open wipe-down process; without stated ignition sources, quantities, or flashpoint data, an active fire/explosion hazard cannot be confirmed from this text alone, but the possibility of vapour accumulation near an unconfirmed-capture LEV system is worth flagging at low confidence.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: True

### 4 · Declaration(s) verbatim — every field

#### Declaration `DECL-1`

| field | value |
|---|---|
| `declarationId` | DECL-1 |
| `missingFact` | Whether the hood achieves effective vapour capture at the actual wiping position 600 mm forward of the hood face |
| `observationSourceId` | OBS-SF-07 |
| `observationSpan` | nobody present could say whether the hood draws vapour away from the position where the wiping is actually done |
| `notEstablishedBecause` | The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine. |
| `affectedDecision` | REQUIRED_CONTROL |
| `branchA` | Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point |
| `decisionIfA` | Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance |
| `branchB` | Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point |
| `decisionIfB` | Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming |
| `whyNecessaryNow` | Operators are actively performing the solvent wipe-down task now with an evaporative ketone solvent, so the adequacy of vapour capture at their actual working position determines whether they are currently exposed above safe levels; this cannot be deferred while the task continues. |

### 5 · Declaration admission or refusal

Projection counts: raw 1 · admitted 1 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| `DECL-1` | **yes** | _(none)_ | _(none)_ |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

#### `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1`

From declaration `DECL-1`.

| `OwedFact` field | value |
|---|---|
| `factKey` | FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1 |
| `affectedDecision` | REQUIRED_CONTROL |
| `source` | FIRST_PASS_MODEL |
| `evidenceSpan` | nobody present could say whether the hood draws vapour away from the position where the wiping is actually done |
| `whyUnresolved` | The text states only that the fan was running, audible, and the system's last examination was within twelve months — these speak to the system operating and having been examined, not to capture effectiveness at the specific offset working position, which the text explicitly says nobody present could determine. |
| `branchA` | Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point |
| `branchB` | Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point |
| `priority` | OTHER |
| `status` | UNRESOLVED |
| `acceptableEvidence` | _(null)_ |
| `modelAuthored` | True |
| `decisionDivergence.ifA` | Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance |
| `decisionDivergence.ifB` | Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming |

**`missingFact` is NOT carried into the projected `OwedFact`.** The declaration said:

> Whether the hood achieves effective vapour capture at the actual wiping position 600 mm forward of the hood face

`missingFactInProjectedOwedFact`: `False`. The verifier received only the fields listed under `whatTheVerifierActuallyReceived`: `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`. This is the material for axis **Q**.

### 8 · Verifier raw output and 9 · verifier admission

#### Verifier call for `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1`

| | |
|---|---|
| `verdict` | **VERIFIED_AS_IS** |
| `clarificationSourceMode` | _(null)_ |
| `bindingFactKey` | _(null)_ |
| `proposedClarification` | _(null)_ |
| `nominatedFact` | _(null)_ |
| `regulatoryBasis.reliance` | `NONE` |
| `regulatoryBasis.sourceIds` | _(empty)_ |
| `regulatoryBasis.proposition` | _(null)_ |
| governed evidence shown to verifier | **none** |
| reached inference | True |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| usage | in 9119 / out 690 tok, $0.025138 |

**`owedFactDeclarations`**

| `factKey` | `declaration` | `challengeReason` |
|---|---|---|
| `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1` | **STILL_UNRESOLVED** | _(null)_ |

**`rationale`**

> The observation establishes the LEV fan is running, audible, and was examined within the past twelve months, but explicitly states nobody present could confirm capture effectiveness at the actual 600 mm offset working position. This is a control-verification gap (a working system is not thereby a system checked at the point of use), and the two possible answers lead to materially different actions today: continue current practice vs. stop/relocate the task and add supplementary controls. The first-pass clarification directly asks for the measured/verified capture velocity/airflow at that exact working position and whether it meets the effective capture range — this question, if answered, would resolve the fact in full; there is no sub-component of the fact left untouched by it. No second fact from the observation appears to govern a different live decision: the fire/explosion candidate is already at INSUFFICIENT_EVIDENCE and the first pass reasonably treated it as low-confidence and non-actionable without flashpoint/ignition source data, but nothing in the text suggests an ignition source is present or that a decision is being made now that turns on it. The clarification asked is sufficient and correctly targeted; no additional nomination is warranted.

**Admission** — admitted: **yes** · codes: _(none)_.

Raw admission record: `{"admitted": true, "codes": [], "detail": [], "bindingAdmitted": false, "nominationAdmitted": false, "challengedFactKeys": [], "citationViolations": [], "citationReuseAdmitted": false, "citationReuse": null, "unauthorisedCitations": [], "regulatoryRelianceDeclared": false, "boundSourceIds": []}`

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 1 → 1 → 1 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `True` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

- `DECL-1` → `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1`

**`clarificationLinks`**

| `clarificationId` | `declarationId` | `factKey` | `unresolved` |
|---|---|---|---|
| `CL-1` | `DECL-1` | `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1` | `False` |

**`identityAudit`** — the computed `factKey` recomputed independently

| `declarationId` | reported | independently recomputed | equal | provider supplied any factKey field |
|---|---|---|---|---|
| `DECL-1` | `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1` | `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1` | `True` | `False` |

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-07"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

**Fact-level** — `facts[]` where `factKey == "FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1"`

| slot | current value |
|---|---|
| `verdicts.C_OWED_PROPERTY_SEMANTIC_CORRECTNESS` | **null — awaiting** |
| `verdicts.D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` | **null — awaiting** |
| `verdicts.E_BRANCH_PLAUSIBILITY` | **null — awaiting** |
| `verdicts.F_DECISION_DIVERGENCE_VALIDITY` | **null — awaiting** |
| `verdicts.G_AFFECTED_DECISION_CORRECTNESS` | **null — awaiting** |
| `verdicts.L_VERIFIER_TARGET_BINDING` | **null — awaiting** |
| `verdicts.M_CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verdicts.N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.Q_OWED_PROPERTY_LOSS_IMPACT` | **null — awaiting** |
| `verdicts.R_PRIORITY_FLOOR_IMPACT` | **null — awaiting** |
| `verdicts.R_SAFETY_CLASSIFICATION` | **null — awaiting** |
| `verdicts.S_GOVERNED_ID_BINDING_APPROPRIATENESS` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |

| verifier sub-axis slot | current value |
|---|---|
| `verifierSubAxes.TARGET_TOPIC_REACH` | **null — awaiting** |
| `verifierSubAxes.EXACT_OWED_PROPERTY_BINDING` | **null — awaiting** |
| `verifierSubAxes.CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verifierSubAxes.AFFECTED_DECISION_ALIGNMENT` | **null — awaiting** |
| `verifierSubAxes.BRANCH_DECISION_CONSISTENCY` | **null — awaiting** |
| `verifierSubAxes.CHALLENGE_REVIEWABILITY` | **null — awaiting** |
| `verifierSubAxes.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Open on this fact: **17** (10 axis + 7 verifier sub-axis). Prefilled `NOT_EXERCISED`: `N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY`, `S_GOVERNED_ID_BINDING_APPROPRIATENESS`, `T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 1, max 1.
- Preregistered expected fact entries for this row: 1.
- Raw declarations emitted: 1.
- Declarations admitted by the deterministic boundary: 1.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 1. Hazard candidates emitted: 2.
- Verifier calls made for this row: 1.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

**Declaration `DECL-1`**

- Declared `observationSpan`: "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done"
- The declared `observationSpan` is a substring of the observation text: `True`.
- Expected fact 1, region **R1** "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done": exact string equality with the declared span = `True`; declared span contains the region as a substring = `True`; region contains the declared span as a substring = `True`.
- Expected fact 1, region **R2** "The wiping is carried out about 600 mm forward of the hood face": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Expected fact 1, region **R3** "No airflow indicator is fitted at the hood": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Declared `affectedDecision`: `REQUIRED_CONTROL`.
- Expected fact 1: `expectedAffectedDecision` = `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions` = `EXPOSURE`; the declared label is a member of that set = `True`.
- Declared `branchA` text: "Airflow/capture measurement at the 600 mm working position confirms effective vapour capture reaches that point"
- Declared `branchB` text: "Airflow/capture measurement at the 600 mm working position confirms capture does not effectively reach that point"
- Declared `decisionIfA` text: "Continue the current work practice; no additional respiratory or engineering control is required beyond routine LEV maintenance"
- Declared `decisionIfB` text: "Stop or relocate the wiping task closer to the hood face, add supplementary controls (e.g., respiratory protection or hood modification), and re-verify capture before resuming"
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `False`.
- Expected fact 1 branch texts: `aMustMean` = "the LEV captures vapour effectively at the position where wiping occurs"; `bMustMean` = "the LEV does not capture vapour at that position and operators are breathing it". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 1 `conjuncts` count: 1.

**Computed identity**

- `DECL-1`: reported `factKey` and independently recomputed `factKey` are byte-identical: `True`. Provider supplied any `factKey` field: `False`.

**Verifier**

- `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1`: `verdict` = `VERIFIED_AS_IS`; `owedFactDeclarations` names 1 factKey(s); every named key is byte-identical to the supplied key = `True`.
  - `regulatoryBasis.reliance` = `NONE`; `sourceIds` count = 0; `proposition` is null = `True`.
  - `proposedClarification` is null = `True`; `bindingFactKey` is null = `True`; `clarificationSourceMode` is null = `True`.
  - Admission: admitted = `True`; admission codes count = 0.
  - Governed records shown to this verifier call: 0.

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 1 raw / 1 admitted against 1-1 — finding: the admitted count is inside the preregistered range (`isAVerdict`: False)

**...and for fact `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1`, verbatim**

- _declared evidenceSpan against the preregistered acceptableSpanRegions_ — compared: declared "nobody present could say whether the hood draws vapour away from the position where the wiping is actually done" against 3 region(s) — finding: the declared span is EXACTLY one of the preregistered regions (`isAVerdict`: False)
- _declared affectedDecision against the preregistered expectation_ — compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives EXPOSURE — finding: matches the preregistered expectation (`isAVerdict`: False)
- _shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION_ — compared: 5 neighbour(s) listed — finding: the neighbour sharing most vocabulary (33%) is "whether an LEV is INSTALLED — the text states it is". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence. (`isAVerdict`: False)
- _preregistered conjuncts against the full declaration text_ — compared: 1 conjunct(s) — finding: the expected fact is not conjunctive (`isAVerdict`: False)

Worksheet pointer note on the nearest expectation, verbatim: _chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row._

---

## SF-08

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-08`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `CONJUNCTIVE_FACT` |
| paired with | _(unpaired)_ |
| sequence position | 6 of 12 |
| location / task / jurisdiction | compressor house · electrical maintenance inside a panel enclosure · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Electrical panel maintenance at the compressor house. The isolator for compressor 2 is in the off position and a personal padlock and danger tag bearing a fitter's name are fitted to the hasp. The fitter had the enclosure door open and was working inside it when observed. The panel contains a capacitor bank. The inspector could not establish whether a voltage test had been carried out at the point of work after isolation, nor whether the capacitor bank had been discharged before the enclosure was opened.

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 1, max 2**  ·  expected facts listed: 1

_Preregistered `establishedByTheText`_

- the isolator is off
- a personal padlock and danger tag naming the fitter are fitted to the hasp
- the fitter is working inside the open enclosure now
- the panel contains a capacitor bank

_Preregistered `notEstablishedByTheText`_

- whether the circuit was proved dead at the point of work after isolation
- whether the capacitor bank was discharged before the enclosure was opened

#### Expected fact 1 — `panel proved safe to work on — dead at the point of work and stored energy discharged`

| field | value |
|---|---|
| `owedProperty` | whether the panel was proved safe to work on before the enclosure was opened: the circuit proved dead at the point of work AND the capacitor bank discharged |
| `expectedAffectedDecision` | `REQUIRED_CONTROL` |
| `acceptableAlternativeAffectedDecisions` | **(none listed)** |
| `branchSemantics.aMustMean` | both the dead test and the capacitor discharge were done before work began |
| `branchSemantics.bMustMean` | one or both were not done, so the fitter may be working on live or stored energy |
| `expectedDecisionDivergence.ifA` | the isolation is accepted as proved and the work continues |
| `expectedDecisionDivergence.ifB` | the work stops immediately and the panel is proved dead and discharged before it resumes |
| `designNoteOnCriticality` | a person working inside an enclosure that may be live or holding stored charge is an electrocution exposure now; a reviewer is likely to call this life-critical |

_`conjuncts` (2)_

- a voltage test proved the circuit dead at the point of work after isolation
- the capacitor bank was discharged before the enclosure was opened

_`acceptableSpanRegions` (2, verbatim substrings of the observation)_

- **R1** — "could not establish whether a voltage test had been carried out at the point of work after isolation"
- **R2** — "nor whether the capacitor bank had been discharged before the enclosure was opened"

_`unacceptableNeighbouringProperties` (4)_

- whether the isolator is OFF — the text states it is
- whether a padlock and tag are FITTED — the text states they are
- whether the fitter is authorised or trained
- whether a permit exists — not raised by the text

_`designIntent`_ — CONJUNCTIVE. Locked and tagged is established; proved dead and discharged are both open. Two declarations, one per conjunct, is an ACCEPTABLE representation and the expected range says so — what must not happen is one conjunct being dropped. This row is deliberately given a range rather than a single expected count, because forcing a single number here would author an ambiguity into the truth.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `ANALYZED` |
| `analysisId` | `AN-199-SF-08` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 2 |
| clarifications | 2 |
| hazard candidates | 2 |
| cross-hazard insights / disagreements | 1 / 0 |
| uncertainty statements | 0 |
| usage | in 22896 / out 2706 tok, $0.072852 |

**`expertExplanation.summary`**

> The isolator is locked and tagged to the fitter, which controls the normal supply, but the observation leaves open two current-state facts that materially affect whether the point of work is actually safe: whether a voltage test confirmed a dead point of work, and whether the capacitor bank was discharged before the enclosure was opened. Because the fitter is currently working inside the open enclosure, either gap left unresolved means a possible active exposure to stored or unverified electrical energy despite the lockout/tagout being in place. These two unresolved facts interact: lockout controls the source, not stored energy, and only a voltage test would reveal whether either hazard is actually present at the point of work.

**Clarifications asked (2)**

- `q-cap-discharge` — **question:** Was the capacitor bank discharged (or verified discharged) before the enclosure was opened and work began?
  - `whyItMatters`: If the capacitor bank was discharged, the stored-energy hazard is controlled and the fitter's current work inside the open enclosure is not exposed to it. If it was not discharged, the fitter is currently working with an energized/charged capacitor bank inside an open enclosure, which is an active life-threatening exposure requiring the work to stop until discharge is confirmed.
  - `affectedDecision`: `REQUIRED_CONTROL` · `criticality`: `BLOCKING`
  - `evidenceGap`: Whether the capacitor bank was discharged before the enclosure was opened is not established.
  - `relatesToCandidateKey`: `cap-bank-stored-energy`
- `q-voltage-test` — **question:** Was a voltage test performed at the point of work after isolation to confirm a de-energized state before the fitter began working inside the enclosure?
  - `whyItMatters`: If a voltage test was performed and confirmed dead, the point of work is verified safe and the isolation/lockout is sufficient. If no test was performed, the isolation has not been verified effective at the point of work, and the fitter is currently exposed to a possible unconfirmed live condition, requiring the work to stop until a test is carried out.
  - `affectedDecision`: `REQUIRED_CONTROL` · `criticality`: `BLOCKING`
  - `evidenceGap`: Whether a voltage test was carried out at the point of work after isolation is not established.
  - `relatesToCandidateKey`: `no-voltage-test-verification`

**Hazard candidates (2)**

- `cap-bank-stored-energy` · family `electrical` · `assertedConditionState` `INSUFFICIENT_EVIDENCE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `MODERATE`
  - evidence `OBS-SF-08`: "nor whether the capacitor bank had been discharged before the enclosure was opened"
  - `evidenceBasis`: The observation states the inspector could not establish whether the capacitor bank had been discharged before the enclosure was opened, meaning the discharge status of the capacitor bank at the time of entry is unknown.
  - `reasoning`: A capacitor bank stores electrical energy independently of the isolator position; if not discharged, it remains a live hazard even after the isolator is off, locked and tagged. The fitter has the enclosure open and is working inside it, so if the bank was not discharged, contact or arc exposure is possible right now.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: True
- `no-voltage-test-verification` · family `electrical` · `assertedConditionState` `INSUFFICIENT_EVIDENCE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `MODERATE`
  - evidence `OBS-SF-08`: "could not establish whether a voltage test had been carried out at the point of work after isolation"
  - `evidenceBasis`: The observation states the inspector could not establish whether a voltage test had been carried out at the point of work after isolation, meaning verification of a de-energized state at the point of work is unknown.
  - `reasoning`: Isolation and lockout/tagout control the source but do not by themselves confirm the point of work is dead; without a voltage test, residual or unexpectedly present voltage (e.g., from backfeed, capacitive storage, or an isolation error) would go undetected while the fitter works with the enclosure open.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: True

**Cross-hazard insights**

- `loto-noverify-open-enclosure` · `interactionKind` `ELECTRICAL_WET_ENVIRONMENT` · participants `no-voltage-test-verification`, `cap-bank-stored-energy` · `confidence` `MODERATE`
  - `reasoning`: An unverified isolation combined with an unconfirmed capacitor discharge is worse together than either alone: lockout/tagout controls the supply source but does not address stored energy in the capacitor bank, and without a voltage test at the point of work neither the isolation's effectiveness nor the presence of residual charge would be detected before the fitter contacts live parts inside the open enclosure.

### 4 · Declaration(s) verbatim — every field

#### Declaration `decl-cap-discharge`

| field | value |
|---|---|
| `declarationId` | decl-cap-discharge |
| `missingFact` | Whether the capacitor bank was discharged before the enclosure was opened |
| `observationSourceId` | OBS-SF-08 |
| `observationSpan` | nor whether the capacitor bank had been discharged before the enclosure was opened |
| `notEstablishedBecause` | The observation states only that the inspector could not establish this, not that discharge did or did not occur. |
| `affectedDecision` | REQUIRED_CONTROL |
| `branchA` | The capacitor bank was discharged before the enclosure was opened |
| `decisionIfA` | The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis |
| `branchB` | The capacitor bank was not discharged before the enclosure was opened |
| `decisionIfB` | The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified |
| `whyNecessaryNow` | The fitter is currently working inside the open enclosure, so the discharge status determines whether an active life-threatening exposure exists right now. |

#### Declaration `decl-voltage-test`

| field | value |
|---|---|
| `declarationId` | decl-voltage-test |
| `missingFact` | Whether a voltage test was carried out at the point of work after isolation |
| `observationSourceId` | OBS-SF-08 |
| `observationSpan` | could not establish whether a voltage test had been carried out at the point of work after isolation |
| `notEstablishedBecause` | The observation states only that the inspector could not establish this, not that a test was or was not performed. |
| `affectedDecision` | REQUIRED_CONTROL |
| `branchA` | A voltage test was carried out at the point of work confirming a de-energized state |
| `decisionIfA` | The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work |
| `branchB` | No voltage test was carried out at the point of work |
| `decisionIfB` | The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing |
| `whyNecessaryNow` | The fitter is currently working inside the open enclosure without confirmed verification of a dead point of work, so this determines whether current exposure to live parts exists. |

### 5 · Declaration admission or refusal

Projection counts: raw 2 · admitted 2 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| `decl-cap-discharge` | **yes** | _(none)_ | _(none)_ |
| `decl-voltage-test` | **yes** | _(none)_ | _(none)_ |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

#### `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1`

From declaration `decl-cap-discharge`.

| `OwedFact` field | value |
|---|---|
| `factKey` | FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1 |
| `affectedDecision` | REQUIRED_CONTROL |
| `source` | FIRST_PASS_MODEL |
| `evidenceSpan` | nor whether the capacitor bank had been discharged before the enclosure was opened |
| `whyUnresolved` | The observation states only that the inspector could not establish this, not that discharge did or did not occur. |
| `branchA` | The capacitor bank was discharged before the enclosure was opened |
| `branchB` | The capacitor bank was not discharged before the enclosure was opened |
| `priority` | OTHER |
| `status` | UNRESOLVED |
| `acceptableEvidence` | _(null)_ |
| `modelAuthored` | True |
| `decisionDivergence.ifA` | The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis |
| `decisionDivergence.ifB` | The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified |

**`missingFact` is NOT carried into the projected `OwedFact`.** The declaration said:

> Whether the capacitor bank was discharged before the enclosure was opened

`missingFactInProjectedOwedFact`: `False`. The verifier received only the fields listed under `whatTheVerifierActuallyReceived`: `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`. This is the material for axis **Q**.

#### `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1`

From declaration `decl-voltage-test`.

| `OwedFact` field | value |
|---|---|
| `factKey` | FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1 |
| `affectedDecision` | REQUIRED_CONTROL |
| `source` | FIRST_PASS_MODEL |
| `evidenceSpan` | could not establish whether a voltage test had been carried out at the point of work after isolation |
| `whyUnresolved` | The observation states only that the inspector could not establish this, not that a test was or was not performed. |
| `branchA` | A voltage test was carried out at the point of work confirming a de-energized state |
| `branchB` | No voltage test was carried out at the point of work |
| `priority` | OTHER |
| `status` | UNRESOLVED |
| `acceptableEvidence` | _(null)_ |
| `modelAuthored` | True |
| `decisionDivergence.ifA` | The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work |
| `decisionDivergence.ifB` | The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing |

**`missingFact` is NOT carried into the projected `OwedFact`.** The declaration said:

> Whether a voltage test was carried out at the point of work after isolation

`missingFactInProjectedOwedFact`: `False`. The verifier received only the fields listed under `whatTheVerifierActuallyReceived`: `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`. This is the material for axis **Q**.

### 8 · Verifier raw output and 9 · verifier admission

#### Verifier call for `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1`

| | |
|---|---|
| `verdict` | **VERIFIED_AS_IS** |
| `clarificationSourceMode` | _(null)_ |
| `bindingFactKey` | _(null)_ |
| `proposedClarification` | _(null)_ |
| `nominatedFact` | _(null)_ |
| `regulatoryBasis.reliance` | `NONE` |
| `regulatoryBasis.sourceIds` | _(empty)_ |
| `regulatoryBasis.proposition` | _(null)_ |
| governed evidence shown to verifier | **none** |
| reached inference | True |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| usage | in 8932 / out 704 tok, $0.024904 |

**`owedFactDeclarations`**

| `factKey` | `declaration` | `challengeReason` |
|---|---|---|
| `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` | **STILL_UNRESOLVED** | _(null)_ |

**`rationale`**

> Both unresolved facts identified by the first pass are genuinely decision-critical: lockout/tagout of the isolator controls the normal supply but does not address stored energy in the capacitor bank or confirm a dead point of work. If the bank was not discharged, or if no voltage test was performed, the fitter is currently exposed to live/stored energy while working inside an open enclosure, which would require stopping work now; if both were done, the current work may continue. The first-pass analysis asked exactly two clarifications, each directly targeted at one of these two facts, and each question as written (was the bank discharged/verified discharged; was a voltage test performed to confirm de-energized state) would fully settle the corresponding fact with a single yes/no answer — there is no compound requirement being left partially unaddressed. The only supplied unresolved fact (capacitor discharge) is directly and completely covered by the first clarification question. No additional fact outside those supplied appears necessary: the observation gives no indication of backfeed sources, multiple energy sources, or other controls whose status is ambiguous in a way that would change today's action beyond what's already asked. The set of clarifications is therefore adequate as-is.

**Admission** — admitted: **yes** · codes: _(none)_.

Raw admission record: `{"admitted": true, "codes": [], "detail": [], "bindingAdmitted": false, "nominationAdmitted": false, "challengedFactKeys": [], "citationViolations": [], "citationReuseAdmitted": false, "citationReuse": null, "unauthorisedCitations": [], "regulatoryRelianceDeclared": false, "boundSourceIds": []}`

#### Verifier call for `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1`

| | |
|---|---|
| `verdict` | **VERIFIED_AS_IS** |
| `clarificationSourceMode` | _(null)_ |
| `bindingFactKey` | _(null)_ |
| `proposedClarification` | _(null)_ |
| `nominatedFact` | _(null)_ |
| `regulatoryBasis.reliance` | `NONE` |
| `regulatoryBasis.sourceIds` | _(empty)_ |
| `regulatoryBasis.proposition` | _(null)_ |
| governed evidence shown to verifier | **none** |
| reached inference | True |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| usage | in 8923 / out 538 tok, $0.023226 |

**`owedFactDeclarations`**

| `factKey` | `declaration` | `challengeReason` |
|---|---|---|
| `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` | **STILL_UNRESOLVED** | _(null)_ |

**`rationale`**

> Both unresolved facts (voltage test performed, capacitor bank discharged) are genuinely open on the observation text — the inspector explicitly could not establish either — and each answer leads to different actions today: if not done, work must stop until verified; if done, work may proceed. These are two separate required-control checks (source verification via voltage test, and stored-energy discharge of the capacitor bank), and the first pass asked one clarification question squarely addressing each, matching them one-to-one. No third fact outside these two appears necessary to decide anything else at this workplace: the LOTO application itself (padlock, tag, isolator off) is already stated as done, so no further nomination is warranted.

**Admission** — admitted: **yes** · codes: _(none)_.

Raw admission record: `{"admitted": true, "codes": [], "detail": [], "bindingAdmitted": false, "nominationAdmitted": false, "challengedFactKeys": [], "citationViolations": [], "citationReuseAdmitted": false, "citationReuse": null, "unauthorisedCitations": [], "regulatoryRelianceDeclared": false, "boundSourceIds": []}`

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 2 → 2 → 2 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `True` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

- `decl-cap-discharge` → `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1`
- `decl-voltage-test` → `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1`

**`clarificationLinks`**

| `clarificationId` | `declarationId` | `factKey` | `unresolved` |
|---|---|---|---|
| `q-cap-discharge` | _(null)_ | _(null)_ | `False` |
| `q-voltage-test` | _(null)_ | _(null)_ | `False` |

**`identityAudit`** — the computed `factKey` recomputed independently

| `declarationId` | reported | independently recomputed | equal | provider supplied any factKey field |
|---|---|---|---|---|
| `decl-cap-discharge` | `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` | `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` | `True` | `False` |
| `decl-voltage-test` | `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` | `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` | `True` | `False` |

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-08"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

**Fact-level** — `facts[]` where `factKey == "FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1"`

| slot | current value |
|---|---|
| `verdicts.C_OWED_PROPERTY_SEMANTIC_CORRECTNESS` | **null — awaiting** |
| `verdicts.D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` | **null — awaiting** |
| `verdicts.E_BRANCH_PLAUSIBILITY` | **null — awaiting** |
| `verdicts.F_DECISION_DIVERGENCE_VALIDITY` | **null — awaiting** |
| `verdicts.G_AFFECTED_DECISION_CORRECTNESS` | **null — awaiting** |
| `verdicts.L_VERIFIER_TARGET_BINDING` | **null — awaiting** |
| `verdicts.M_CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verdicts.N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.Q_OWED_PROPERTY_LOSS_IMPACT` | **null — awaiting** |
| `verdicts.R_PRIORITY_FLOOR_IMPACT` | **null — awaiting** |
| `verdicts.R_SAFETY_CLASSIFICATION` | **null — awaiting** |
| `verdicts.S_GOVERNED_ID_BINDING_APPROPRIATENESS` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |

| verifier sub-axis slot | current value |
|---|---|
| `verifierSubAxes.TARGET_TOPIC_REACH` | **null — awaiting** |
| `verifierSubAxes.EXACT_OWED_PROPERTY_BINDING` | **null — awaiting** |
| `verifierSubAxes.CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verifierSubAxes.AFFECTED_DECISION_ALIGNMENT` | **null — awaiting** |
| `verifierSubAxes.BRANCH_DECISION_CONSISTENCY` | **null — awaiting** |
| `verifierSubAxes.CHALLENGE_REVIEWABILITY` | **null — awaiting** |
| `verifierSubAxes.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Open on this fact: **17** (10 axis + 7 verifier sub-axis). Prefilled `NOT_EXERCISED`: `N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY`, `S_GOVERNED_ID_BINDING_APPROPRIATENESS`, `T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`.

**Fact-level** — `facts[]` where `factKey == "FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1"`

| slot | current value |
|---|---|
| `verdicts.C_OWED_PROPERTY_SEMANTIC_CORRECTNESS` | **null — awaiting** |
| `verdicts.D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` | **null — awaiting** |
| `verdicts.E_BRANCH_PLAUSIBILITY` | **null — awaiting** |
| `verdicts.F_DECISION_DIVERGENCE_VALIDITY` | **null — awaiting** |
| `verdicts.G_AFFECTED_DECISION_CORRECTNESS` | **null — awaiting** |
| `verdicts.L_VERIFIER_TARGET_BINDING` | **null — awaiting** |
| `verdicts.M_CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verdicts.N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.Q_OWED_PROPERTY_LOSS_IMPACT` | **null — awaiting** |
| `verdicts.R_PRIORITY_FLOOR_IMPACT` | **null — awaiting** |
| `verdicts.R_SAFETY_CLASSIFICATION` | **null — awaiting** |
| `verdicts.S_GOVERNED_ID_BINDING_APPROPRIATENESS` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |

| verifier sub-axis slot | current value |
|---|---|
| `verifierSubAxes.TARGET_TOPIC_REACH` | **null — awaiting** |
| `verifierSubAxes.EXACT_OWED_PROPERTY_BINDING` | **null — awaiting** |
| `verifierSubAxes.CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verifierSubAxes.AFFECTED_DECISION_ALIGNMENT` | **null — awaiting** |
| `verifierSubAxes.BRANCH_DECISION_CONSISTENCY` | **null — awaiting** |
| `verifierSubAxes.CHALLENGE_REVIEWABILITY` | **null — awaiting** |
| `verifierSubAxes.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Open on this fact: **17** (10 axis + 7 verifier sub-axis). Prefilled `NOT_EXERCISED`: `N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY`, `S_GOVERNED_ID_BINDING_APPROPRIATENESS`, `T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 1, max 2.
- Preregistered expected fact entries for this row: 1.
- Raw declarations emitted: 2.
- Declarations admitted by the deterministic boundary: 2.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 2. Hazard candidates emitted: 2.
- Verifier calls made for this row: 2.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

**Declaration `decl-cap-discharge`**

- Declared `observationSpan`: "nor whether the capacitor bank had been discharged before the enclosure was opened"
- The declared `observationSpan` is a substring of the observation text: `True`.
- Expected fact 1, region **R1** "could not establish whether a voltage test had been carried out at the point of work after isolation": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Expected fact 1, region **R2** "nor whether the capacitor bank had been discharged before the enclosure was opened": exact string equality with the declared span = `True`; declared span contains the region as a substring = `True`; region contains the declared span as a substring = `True`.
- Declared `affectedDecision`: `REQUIRED_CONTROL`.
- Expected fact 1: `expectedAffectedDecision` = `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions` = (empty list); the declared label is a member of that set = `True`.
- Declared `branchA` text: "The capacitor bank was discharged before the enclosure was opened"
- Declared `branchB` text: "The capacitor bank was not discharged before the enclosure was opened"
- Declared `decisionIfA` text: "The stored-energy hazard from the capacitor bank is controlled and no additional stop-work action is needed on that basis"
- Declared `decisionIfB` text: "The fitter is currently exposed to a charged capacitor bank while working inside the open enclosure and work must stop until the bank is discharged and verified"
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `False`.
- Expected fact 1 branch texts: `aMustMean` = "both the dead test and the capacitor discharge were done before work began"; `bMustMean` = "one or both were not done, so the fitter may be working on live or stored energy". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 1 `conjuncts` count: 2.

**Declaration `decl-voltage-test`**

- Declared `observationSpan`: "could not establish whether a voltage test had been carried out at the point of work after isolation"
- The declared `observationSpan` is a substring of the observation text: `True`.
- Expected fact 1, region **R1** "could not establish whether a voltage test had been carried out at the point of work after isolation": exact string equality with the declared span = `True`; declared span contains the region as a substring = `True`; region contains the declared span as a substring = `True`.
- Expected fact 1, region **R2** "nor whether the capacitor bank had been discharged before the enclosure was opened": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Declared `affectedDecision`: `REQUIRED_CONTROL`.
- Expected fact 1: `expectedAffectedDecision` = `REQUIRED_CONTROL`; `acceptableAlternativeAffectedDecisions` = (empty list); the declared label is a member of that set = `True`.
- Declared `branchA` text: "A voltage test was carried out at the point of work confirming a de-energized state"
- Declared `branchB` text: "No voltage test was carried out at the point of work"
- Declared `decisionIfA` text: "The isolation is verified effective and the fitter's work inside the enclosure proceeds under a confirmed dead point of work"
- Declared `decisionIfB` text: "The isolation's effectiveness at the point of work is unverified and work must stop until a voltage test confirms a dead state before continuing"
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `False`.
- Expected fact 1 branch texts: `aMustMean` = "both the dead test and the capacitor discharge were done before work began"; `bMustMean` = "one or both were not done, so the fitter may be working on live or stored energy". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 1 `conjuncts` count: 2.

**Computed identity**

- `decl-cap-discharge`: reported `factKey` and independently recomputed `factKey` are byte-identical: `True`. Provider supplied any `factKey` field: `False`.
- `decl-voltage-test`: reported `factKey` and independently recomputed `factKey` are byte-identical: `True`. Provider supplied any `factKey` field: `False`.

**Verifier**

- `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1`: `verdict` = `VERIFIED_AS_IS`; `owedFactDeclarations` names 1 factKey(s); every named key is byte-identical to the supplied key = `True`.
  - `regulatoryBasis.reliance` = `NONE`; `sourceIds` count = 0; `proposition` is null = `True`.
  - `proposedClarification` is null = `True`; `bindingFactKey` is null = `True`; `clarificationSourceMode` is null = `True`.
  - Admission: admitted = `True`; admission codes count = 0.
  - Governed records shown to this verifier call: 0.
- `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1`: `verdict` = `VERIFIED_AS_IS`; `owedFactDeclarations` names 1 factKey(s); every named key is byte-identical to the supplied key = `True`.
  - `regulatoryBasis.reliance` = `NONE`; `sourceIds` count = 0; `proposition` is null = `True`.
  - `proposedClarification` is null = `True`; `bindingFactKey` is null = `True`; `clarificationSourceMode` is null = `True`.
  - Admission: admitted = `True`; admission codes count = 0.
  - Governed records shown to this verifier call: 0.

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 2 raw / 2 admitted against 1-2 — finding: the admitted count is inside the preregistered range (`isAVerdict`: False)

**...and for fact `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1`, verbatim**

- _declared evidenceSpan against the preregistered acceptableSpanRegions_ — compared: declared "nor whether the capacitor bank had been discharged before the enclosure was opened" against 2 region(s) — finding: the declared span is EXACTLY one of the preregistered regions (`isAVerdict`: False)
- _declared affectedDecision against the preregistered expectation_ — compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives (none listed) — finding: matches the preregistered expectation (`isAVerdict`: False)
- _shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION_ — compared: 4 neighbour(s) listed — finding: the neighbour sharing most vocabulary (33%) is "whether the isolator is OFF — the text states it is". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence. (`isAVerdict`: False)
- _preregistered conjuncts against the full declaration text_ — compared: 2 conjunct(s) — finding: "a voltage test proved the circuit dead at the point …" content-word overlap 0% | "the capacitor bank was discharged before the enclosu…" content-word overlap 100% (`isAVerdict`: False)

Worksheet pointer note on the nearest expectation, verbatim: _chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row._

**...and for fact `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1`, verbatim**

- _declared evidenceSpan against the preregistered acceptableSpanRegions_ — compared: declared "could not establish whether a voltage test had been carried out at the point of work after isolation" against 2 region(s) — finding: the declared span is EXACTLY one of the preregistered regions (`isAVerdict`: False)
- _declared affectedDecision against the preregistered expectation_ — compared: declared REQUIRED_CONTROL; preregistered REQUIRED_CONTROL; acceptable alternatives (none listed) — finding: matches the preregistered expectation (`isAVerdict`: False)
- _shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION_ — compared: 4 neighbour(s) listed — finding: the neighbour sharing most vocabulary (33%) is "whether the isolator is OFF — the text states it is". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence. (`isAVerdict`: False)
- _preregistered conjuncts against the full declaration text_ — compared: 2 conjunct(s) — finding: "a voltage test proved the circuit dead at the point …" content-word overlap 67% | "the capacitor bank was discharged before the enclosu…" content-word overlap 40% (`isAVerdict`: False)

Worksheet pointer note on the nearest expectation, verbatim: _chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row._

---

## SF-11

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-11`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `SINGLE_REAL_UNRESOLVED_FACT`, `EXPOSURE_DECISION`, `NOT_OBSERVED_IS_NOT_ABSENT` |
| paired with | _(unpaired)_ |
| sequence position | 4 of 12 |
| location / task / jurisdiction | warehouse aisle 7 · moving pallets from racking to the marshalling area by counterbalance forklift · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Warehouse aisle 7. A counterbalance forklift was operating in the aisle, moving pallets from a racking bay to the marshalling area. The aisle is 3.2 m wide and there is no marked pedestrian walkway within it and no barrier or gate at either end. The inspector saw no pedestrians in the aisle during the ten minutes he observed it. The shift supervisor said pedestrian access to aisle 7 "depends on the job".

Deterministic findings shown to the model: **none**. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 1, max 1**  ·  expected facts listed: 1

_Preregistered `establishedByTheText`_

- a forklift operates in the aisle
- the aisle is 3.2 m wide with no marked walkway and no barrier or gate at either end
- no pedestrians were seen during ten minutes of observation
- the supervisor says pedestrian access "depends on the job"

_Preregistered `notEstablishedByTheText`_

- whether pedestrians are in the aisle while the forklift is operating
- ten minutes without a pedestrian does not establish that pedestrians do not enter

#### Expected fact 1 — `pedestrian presence in the aisle during forklift operation`

| field | value |
|---|---|
| `owedProperty` | whether pedestrians enter or work in aisle 7 while the forklift is operating there |
| `expectedAffectedDecision` | `EXPOSURE` |
| `acceptableAlternativeAffectedDecisions` | `REQUIRED_CONTROL` |
| `branchSemantics.aMustMean` | pedestrians do enter the aisle while the forklift operates |
| `branchSemantics.bMustMean` | pedestrians are genuinely excluded while the forklift operates |
| `expectedDecisionDivergence.ifA` | separation is required now — segregation, exclusion or a controlled crossing before forklift work continues in the aisle |
| `expectedDecisionDivergence.ifB` | the existing arrangement is accepted and forklift work continues |
| `designNoteOnCriticality` | pedestrian/vehicle interaction in an unsegregated aisle is a struck-by fatality mechanism; a reviewer may well call this safety-critical |

_`conjuncts` (1)_

- pedestrians are present in the aisle during forklift operation

_`acceptableSpanRegions` (2, verbatim substrings of the observation)_

- **R1** — "The shift supervisor said pedestrian access to aisle 7 "depends on the job""
- **R2** — "The inspector saw no pedestrians in the aisle during the ten minutes he observed it"

_`unacceptableNeighbouringProperties` (5)_

- whether a marked walkway EXISTS — the text states it does not
- whether barriers or gates EXIST — the text states they do not
- the width of the aisle — the text gives it as 3.2 m
- whether the forklift operator is licensed — not raised by the text
- treating "no pedestrians seen in ten minutes" as establishing that none enter

_`designIntent`_ — EXPOSURE, and the NOT-OBSERVED-IS-NOT-ABSENT rule. The absent controls are all stated facts, not gaps. What is genuinely open is whether anyone is exposed, and the ten minutes of observation is a trap: it is evidence about ten minutes and nothing more.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `ANALYZED` |
| `analysisId` | `AN-199-SF-11` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 1 |
| clarifications | 1 |
| hazard candidates | 1 |
| cross-hazard insights / disagreements | 0 / 0 |
| uncertainty statements | 0 |
| usage | in 22904 / out 1701 tok, $0.062818 |

**`expertExplanation.summary`**

> A counterbalance forklift is actively working an aisle that has no marked pedestrian walkway and no barrier or gate at either end, which is a present segregation gap regardless of the fact no pedestrians happened to be seen during the ten-minute observation window. The supervisor's statement that pedestrian access 'depends on the job' leaves open whether pedestrians are expected to enter this aisle during forklift operations, and that answer determines whether the missing walkway/barrier controls are an urgent exposure gap or a lower-priority one. No governed record was supplied, so no regulatory citation or obligation is asserted here.

**Clarifications asked (1)**

- `CLQ-1` — **question:** Under what conditions is pedestrian access to aisle 7 permitted, and is any pedestrian entry expected during forklift operations in this aisle?
  - `whyItMatters`: If pedestrian access is routinely permitted or unrestricted during forklift operations, the aisle currently requires a physical barrier, gate, or traffic-control procedure to separate pedestrians from the operating forklift; if pedestrian access is in fact excluded during forklift operations by a stated rule or physical means, the absence of a marked walkway or barrier is a lower-priority gap because the exposure pathway is otherwise controlled. The supervisor's answer that access 'depends on the job' does not establish which of these is currently the case, and the correct control response differs materially between them.
  - `affectedDecision`: `EXPOSURE` · `criticality`: `BLOCKING`
  - `evidenceGap`: Whether pedestrian entry to aisle 7 is permitted, restricted, or excluded during forklift operations is not established; the supervisor's statement that access 'depends on the job' does not resolve it.
  - `relatesToCandidateKey`: `CAND-1`

**Hazard candidates (1)**

- `CAND-1` · family `mobile_equipment` · `assertedConditionState` `ACTIVE` · `groundingStatus` `EXACT_QUOTE_SUPPLIED` · `confidence` `HIGH`
  - evidence `OBS-SF-11`: "there is no marked pedestrian walkway within it and no barrier or gate at either end"
  - `evidenceBasis`: The observation states there is no marked pedestrian walkway and no barrier or gate at either end of the aisle where a counterbalance forklift is actively operating.
  - `reasoning`: A forklift is currently operating in an aisle with no walkway segregation and no barrier or gate at either end. This is a present physical condition (absence of segregation controls in a live traffic aisle) that creates a struck-by/pedestrian-mobile-equipment interface hazard whenever anyone enters the aisle, independent of whether a pedestrian happened to be present during the ten-minute observation window.
  - `relationshipToDeterministic`: `ADDITIONAL_TO_DETERMINISTIC` · `requiresUserConfirmation`: False

### 4 · Declaration(s) verbatim — every field

#### Declaration `UFD-1`

| field | value |
|---|---|
| `declarationId` | UFD-1 |
| `missingFact` | Whether pedestrian entry into aisle 7 is permitted or expected during forklift operations |
| `observationSourceId` | OBS-SF-11 |
| `observationSpan` | pedestrian access to aisle 7 "depends on the job" |
| `notEstablishedBecause` | The supervisor's statement that access depends on the job describes a variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during periods when the forklift is operating in the aisle. |
| `affectedDecision` | EXPOSURE |
| `branchA` | Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types |
| `decisionIfA` | Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle |
| `branchB` | Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating |
| `decisionIfB` | The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion |
| `whyNecessaryNow` | The forklift is currently operating in the aisle with no barrier at either end; whether pedestrians can currently enter determines whether an urgent physical control is needed today or whether the existing informal restriction is sufficient pending review. |

### 5 · Declaration admission or refusal

Projection counts: raw 1 · admitted 1 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| `UFD-1` | **yes** | _(none)_ | _(none)_ |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

#### `FP.EXPOSURE.OBS-SF-11.357-406.1`

From declaration `UFD-1`.

| `OwedFact` field | value |
|---|---|
| `factKey` | FP.EXPOSURE.OBS-SF-11.357-406.1 |
| `affectedDecision` | EXPOSURE |
| `source` | FIRST_PASS_MODEL |
| `evidenceSpan` | pedestrian access to aisle 7 "depends on the job" |
| `whyUnresolved` | The supervisor's statement that access depends on the job describes a variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during periods when the forklift is operating in the aisle. |
| `branchA` | Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types |
| `branchB` | Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating |
| `priority` | OTHER |
| `status` | UNRESOLVED |
| `acceptableEvidence` | _(null)_ |
| `modelAuthored` | True |
| `decisionDivergence.ifA` | Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle |
| `decisionDivergence.ifB` | The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion |

**`missingFact` is NOT carried into the projected `OwedFact`.** The declaration said:

> Whether pedestrian entry into aisle 7 is permitted or expected during forklift operations

`missingFactInProjectedOwedFact`: `False`. The verifier received only the fields listed under `whatTheVerifierActuallyReceived`: `factKey`, `affectedDecision`, `whyUnresolved`, `branchA`, `branchB`, `decisionDivergence`, `evidenceSpan`, `acceptableEvidence`. This is the material for axis **Q**.

### 8 · Verifier raw output and 9 · verifier admission

#### Verifier call for `FP.EXPOSURE.OBS-SF-11.357-406.1`

| | |
|---|---|
| `verdict` | **VERIFIED_AS_IS** |
| `clarificationSourceMode` | _(null)_ |
| `bindingFactKey` | _(null)_ |
| `proposedClarification` | _(null)_ |
| `nominatedFact` | _(null)_ |
| `regulatoryBasis.reliance` | `NONE` |
| `regulatoryBasis.sourceIds` | _(empty)_ |
| `regulatoryBasis.proposition` | _(null)_ |
| governed evidence shown to verifier | **none** |
| reached inference | True |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| usage | in 8745 / out 736 tok, $0.024850 |

**`owedFactDeclarations`**

| `factKey` | `declaration` | `challengeReason` |
|---|---|---|
| `FP.EXPOSURE.OBS-SF-11.357-406.1` | **STILL_UNRESOLVED** | _(null)_ |

**`rationale`**

> The observation establishes a present physical condition (forklift operating in an aisle with no marked walkway and no barrier/gate at either end) but leaves open whether pedestrians actually enter or are expected to enter this aisle during forklift operations. This directly determines whether the missing segregation controls constitute an urgent, live struck-by exposure requiring immediate physical/procedural intervention, or a lower-priority gap because pedestrian exposure is otherwise excluded. The two answers lead to different actions today (urgent barrier/walkway/traffic-control implementation vs. lower-priority formalization of an existing exclusion), so this is a genuine decision-critical fact. The first-pass clarification asks exactly this: under what conditions pedestrian access is permitted and whether entry is expected during forklift operations. Answering that question would resolve both the "permitted under some conditions" and "expected during operations" branches, which together cover the fact as stated (access occurs/is scheduled vs. excluded). No piece of the owed fact is left untouched by the question as written. I do not find an additional fact outside those supplied that would change today's decision: aisle width, absence of governed evidence, and the ten-minute observation window are all magnitude/context details that don't independently flip the required action once exposure is resolved.

**Admission** — admitted: **yes** · codes: _(none)_.

Raw admission record: `{"admitted": true, "codes": [], "detail": [], "bindingAdmitted": false, "nominationAdmitted": false, "challengedFactKeys": [], "citationViolations": [], "citationReuseAdmitted": false, "citationReuse": null, "unauthorisedCitations": [], "regulatoryRelianceDeclared": false, "boundSourceIds": []}`

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 1 → 1 → 1 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `True` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

- `UFD-1` → `FP.EXPOSURE.OBS-SF-11.357-406.1`

**`clarificationLinks`**

| `clarificationId` | `declarationId` | `factKey` | `unresolved` |
|---|---|---|---|
| `CLQ-1` | _(null)_ | _(null)_ | `False` |

**`identityAudit`** — the computed `factKey` recomputed independently

| `declarationId` | reported | independently recomputed | equal | provider supplied any factKey field |
|---|---|---|---|---|
| `UFD-1` | `FP.EXPOSURE.OBS-SF-11.357-406.1` | `FP.EXPOSURE.OBS-SF-11.357-406.1` | `True` | `False` |

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-11"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

**Fact-level** — `facts[]` where `factKey == "FP.EXPOSURE.OBS-SF-11.357-406.1"`

| slot | current value |
|---|---|
| `verdicts.C_OWED_PROPERTY_SEMANTIC_CORRECTNESS` | **null — awaiting** |
| `verdicts.D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` | **null — awaiting** |
| `verdicts.E_BRANCH_PLAUSIBILITY` | **null — awaiting** |
| `verdicts.F_DECISION_DIVERGENCE_VALIDITY` | **null — awaiting** |
| `verdicts.G_AFFECTED_DECISION_CORRECTNESS` | **null — awaiting** |
| `verdicts.L_VERIFIER_TARGET_BINDING` | **null — awaiting** |
| `verdicts.M_CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verdicts.N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.Q_OWED_PROPERTY_LOSS_IMPACT` | **null — awaiting** |
| `verdicts.R_PRIORITY_FLOOR_IMPACT` | **null — awaiting** |
| `verdicts.R_SAFETY_CLASSIFICATION` | **null — awaiting** |
| `verdicts.S_GOVERNED_ID_BINDING_APPROPRIATENESS` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |
| `verdicts.T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING` | `NOT_EXERCISED` _(prefilled, only permitted value)_ |

| verifier sub-axis slot | current value |
|---|---|
| `verifierSubAxes.TARGET_TOPIC_REACH` | **null — awaiting** |
| `verifierSubAxes.EXACT_OWED_PROPERTY_BINDING` | **null — awaiting** |
| `verifierSubAxes.CLARIFICATION_RESOLUTION_SUFFICIENCY` | **null — awaiting** |
| `verifierSubAxes.AFFECTED_DECISION_ALIGNMENT` | **null — awaiting** |
| `verifierSubAxes.BRANCH_DECISION_CONSISTENCY` | **null — awaiting** |
| `verifierSubAxes.CHALLENGE_REVIEWABILITY` | **null — awaiting** |
| `verifierSubAxes.LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Open on this fact: **17** (10 axis + 7 verifier sub-axis). Prefilled `NOT_EXERCISED`: `N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY`, `S_GOVERNED_ID_BINDING_APPROPRIATENESS`, `T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 1, max 1.
- Preregistered expected fact entries for this row: 1.
- Raw declarations emitted: 1.
- Declarations admitted by the deterministic boundary: 1.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 1. Hazard candidates emitted: 1.
- Verifier calls made for this row: 1.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 0.

**Declaration `UFD-1`**

- Declared `observationSpan`: "pedestrian access to aisle 7 "depends on the job""
- The declared `observationSpan` is a substring of the observation text: `True`.
- Expected fact 1, region **R1** "The shift supervisor said pedestrian access to aisle 7 "depends on the job"": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `True`.
- Expected fact 1, region **R2** "The inspector saw no pedestrians in the aisle during the ten minutes he observed it": exact string equality with the declared span = `False`; declared span contains the region as a substring = `False`; region contains the declared span as a substring = `False`.
- Declared `affectedDecision`: `EXPOSURE`.
- Expected fact 1: `expectedAffectedDecision` = `EXPOSURE`; `acceptableAlternativeAffectedDecisions` = `REQUIRED_CONTROL`; the declared label is a member of that set = `True`.
- Declared `branchA` text: "Pedestrian access to aisle 7 is permitted or occurs during forklift operations under some job types"
- Declared `branchB` text: "Pedestrian access to aisle 7 is excluded or does not occur while the forklift is operating"
- Declared `decisionIfA` text: "Immediate need for a physical barrier, gate, marked walkway, or traffic-control procedure to separate pedestrians from the operating forklift in this aisle"
- Declared `decisionIfB` text: "The missing walkway/barrier is a lower-priority physical gap since the exposure pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and verifying that exclusion"
- `branchA` and `branchB` are byte-identical: `False`.
- `decisionIfA` and `decisionIfB` are byte-identical: `False`.
- Expected fact 1 branch texts: `aMustMean` = "pedestrians do enter the aisle while the forklift operates"; `bMustMean` = "pedestrians are genuinely excluded while the forklift operates". Exact string equality with the declared `branchA`/`branchB`: `False` / `False`.
- Expected fact 1 `conjuncts` count: 1.

**Computed identity**

- `UFD-1`: reported `factKey` and independently recomputed `factKey` are byte-identical: `True`. Provider supplied any `factKey` field: `False`.

**Verifier**

- `FP.EXPOSURE.OBS-SF-11.357-406.1`: `verdict` = `VERIFIED_AS_IS`; `owedFactDeclarations` names 1 factKey(s); every named key is byte-identical to the supplied key = `True`.
  - `regulatoryBasis.reliance` = `NONE`; `sourceIds` count = 0; `proposition` is null = `True`.
  - `proposedClarification` is null = `True`; `bindingFactKey` is null = `True`; `clarificationSourceMode` is null = `True`.
  - Admission: admitted = `True`; admission codes count = 0.
  - Governed records shown to this verifier call: 0.

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 1 raw / 1 admitted against 1-1 — finding: the admitted count is inside the preregistered range (`isAVerdict`: False)

**...and for fact `FP.EXPOSURE.OBS-SF-11.357-406.1`, verbatim**

- _declared evidenceSpan against the preregistered acceptableSpanRegions_ — compared: declared "pedestrian access to aisle 7 \"depends on the job\"" against 2 region(s) — finding: the declared span is a SUBSTRING of a preregistered region: "The shift supervisor said pedestrian access to aisle 7 \"depends on the job\"" (`isAVerdict`: False)
- _declared affectedDecision against the preregistered expectation_ — compared: declared EXPOSURE; preregistered EXPOSURE; acceptable alternatives REQUIRED_CONTROL — finding: matches the preregistered expectation (`isAVerdict`: False)
- _shared vocabulary with the preregistered unacceptableNeighbouringProperties — A WEAK POINTER, NOT EVIDENCE OF SUBSTITUTION_ — compared: 5 neighbour(s) listed — finding: the neighbour sharing most vocabulary (40%) is "whether the forklift operator is licensed — not raised by the text". READ IT AND DECIDE — words in common are not a substitution, and few words in common are not a defence. (`isAVerdict`: False)
- _preregistered conjuncts against the full declaration text_ — compared: 1 conjunct(s) — finding: the expected fact is not conjunctive (`isAVerdict`: False)

Worksheet pointer note on the nearest expectation, verbatim: _chosen by content-word overlap as a POINTER for the reviewer. It is NOT a claim that the declaration matches this expectation, and the reviewer should read every expectation for the row._

---

## SF-12

| | |
|---|---|
| provenance | `REUSED_BEHAVIORALLY_UNSPENT` (§197 origin `SF-12`) |
| transport canary | no |
| governed capability | `ABSENT` |
| families | `NO_REAL_GAP`, `FUNCTION_VERSUS_APPEARANCE` |
| paired with | `SF-05` |
| sequence position | 11 of 12 |
| location / task / jurisdiction | tool room · machining a fixture on a vertical machining centre · osha-general-industry |

### 1 · Scenario (the observation, verbatim)

> Vertical machining centre in the tool room. The interlocked access door is closed. The maintenance technician demonstrated the interlock in the inspector's presence: with the machine in cycle, opening the door stopped spindle rotation and all axis motion, and the machine would not restart until the door was closed and the cycle re-initiated. The test was entered on the machine log sheet and countersigned by the supervisor. The machine was cutting when observed.

Deterministic findings shown to the model: [{'findingKey': 'DET-SF12-1', 'hazardFamily': 'machine_guarding', 'conditionState': 'CONTROLLED', 'isLifeCritical': False, 'isActionable': False, 'requiredActions': []}]. Governed records shown to the first pass: **none**.

### 2 · Frozen truth expectation (AI-authored, never product-owner reviewed)

**`expectedGapCount`: min 0, max 0**  ·  expected facts listed: 0

_Preregistered `establishedByTheText`_

- the access door is closed
- the interlock was function-tested in the inspector's presence and stopped spindle and axis motion on door opening
- restart required the door closed and the cycle re-initiated
- the test was recorded and countersigned

_Preregistered `notEstablishedByTheText`_

_(none)_

_No expected owed facts. This is a no-gap row: the frozen truth expects zero declarations._

_`designIntent`_ — The matched partner of SF-05 with the protective function demonstrated rather than indicated. Also the only row carrying a deterministic finding, so false-gap suppression is tested with a populated deterministic context rather than an empty one.

### 3 · First-pass raw output

| | |
|---|---|
| `outcome` | `NOTHING_TO_ADD` |
| `analysisId` | `AN-199-SF-12` |
| responded model / `stop_reason` | `claude-sonnet-5` / `tool_use` |
| provider ok / reached inference | True / True |
| raw declaration count | 0 |
| clarifications | 0 |
| hazard candidates | 0 |
| cross-hazard insights / disagreements | 0 / 0 |
| uncertainty statements | 0 |
| usage | in 22889 / out 406 tok, $0.049838 |

**`expertExplanation.summary`**

> The interlock on the vertical machining centre was demonstrated functional in the inspector's presence — opening the door during cycle stopped spindle rotation and axis motion, and the test was logged and countersigned — consistent with the deterministic finding of a controlled machine guarding condition. The machine was observed cutting with the door closed, which is the expected and safe configuration for normal operation with a verified interlock. No additional hazard, gap, or interaction is established by the observation.

**Clarifications asked (0)**

_(none)_


**Hazard candidates (0)**

_(none)_


### 4 · Declaration(s) verbatim — every field

**Zero declarations emitted.**

### 5 · Declaration admission or refusal

Projection counts: raw 0 · admitted 0 · refused 0.

| declaration | admitted | refusal codes | refusal detail |
|---|---|---|---|
| _(no declarations)_ | — | — | — |

### 6 · Projected `OwedFact` and 7 · computed `factKey`

**No projected OwedFact for this row.** Zero declarations were emitted.

### 8 · Verifier raw output and 9 · verifier admission

**No verifier call was made for this row** — the verifier runs per projected fact, and this row projected none.

### 10 · Transition and provenance data

| | |
|---|---|
| executed / reached inference / completed | True / True / True |
| raw declarations → admitted → verifier calls | 0 → 0 → 0 |
| refused declarations | 0 |
| `countWithinPreregisteredRange` | `True` |
| `governedIdsNamedByDeclarations` | _(none)_ |
| `rawPersistedBeforeDerivation` | True |

_A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected count while declaring entirely the wrong property._

**`declarationIdToFactKey`**

_(empty)_

**`clarificationLinks`**

_(none)_

**`identityAudit`** — the computed `factKey` recomputed independently

_(none)_

### 11 · The §200 worksheet slots awaiting judgement

**Row-level** — `rows[]` where `rowId == "SF-12"`

| slot | current value |
|---|---|
| `verdicts.A_FIRST_PASS_GAP_RECALL` | **null — awaiting** |
| `verdicts.B_FIRST_PASS_GAP_PRECISION` | **null — awaiting** |
| `verdicts.H_MULTI_GAP_PRESERVATION` | **null — awaiting** |
| `verdicts.I_FALSE_GAP_SUPPRESSION` | **null — awaiting** |
| `truthSpecificationDefect` | **null — awaiting (additive, optional)** |
| `reviewerNotes` | **null — awaiting (optional)** |

Row verdict slots open: **4**.

### PURELY FACTUAL OBSERVATIONS

_Mechanical comparisons only. Each line is a byte-level or set-membership statement with no consequence attached to it._

- Preregistered `expectedGapCount`: min 0, max 0.
- Preregistered expected fact entries for this row: 0.
- Raw declarations emitted: 0.
- Declarations admitted by the deterministic boundary: 0.
- Declarations refused by the deterministic boundary: 0.
- Clarifications emitted: 0. Hazard candidates emitted: 0.
- Verifier calls made for this row: 0.
- Governed records supplied to the first pass for this row: 0.
- Deterministic findings supplied to the first pass for this row: 1.

_No declarations were emitted, so no per-declaration comparison is defined._

**The §200 worksheet’s own recorded neutral observations for this row, verbatim**

- _declaration count against the preregistered range_ — compared: 0 raw / 0 admitted against 0-0 — finding: the admitted count is inside the preregistered range (`isAVerdict`: False)

---

## Closing note on this document

This companion contains no verdicts. Every semantic slot in `ADJUDICATION-WORKSHEET.json` remains `null` and was not touched by the production of this file. The §195–§200 verification directories were read and not written.


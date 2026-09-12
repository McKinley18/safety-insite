# §204D — BATCH 3 EVIDENCE PACKET: SF-11 (14 HEADLINE SLOTS) — FINAL HEADLINE BATCH

Prepared 2026-09-07 under the §204D rapid full closure direction. Covers **all 14 remaining
headline slots in the 120**: U18 {A, B, H, I} and U19 {C, D, E, F, G, L, M, Q, R_SAFETY, R_FLOOR}.
After this batch the headline denominator is exhausted.

**NO SEMANTIC VERDICT IS SUPPLIED, PROPOSED, OR IMPLIED.** Every field below is quoted from a
recorded artefact or from the frozen §199/§200 preregistration. Structural comparisons are labelled
as such and are not judgments.

**TRUTH-SPECIFICATION BOUNDARY.** The frozen preregistration is FROZEN, UNREVIEWED, AI-ASSISTED and
IS NOT THE SEMANTIC ORACLE (§199 records `PRODUCT_OWNER_REVIEWED = false`,
`USED_AS_THE_SEMANTIC_ORACLE = false`). Agreement with it is not evidence of correctness;
disagreement is not model failure. `TRUTH_SPECIFICATION_DEFECT` remains available additively on U18
and U19.

**NO VACUOUS PASSES.** Absence of a failure opportunity is not CORRECT. `NOT_EXERCISED` is in the
frozen `SECTION_200_VERDICT_VOCABULARY` and in the `allowedVocabulary` of every five-value slot
below; none of the 14 is `structurallyPrefilled`; none carries an `applicabilityNote`.

**SCOPE.** No prior row is reopened. No supplementary axis is presented. The 7 U19 verifier
sub-axis slots remain DEFERRED under the §202 product-owner decision and are not in this packet.
The three governed axes N, S and T on this fact remain `structurallyPrefilled` `NOT_EXERCISED`
(the governed capability was never present on a row that reached inference) and are not open.

---

## 0. SHARED ROW CONTEXT (stated once)

**Observation, verbatim.**

> Warehouse aisle 7. A counterbalance forklift was operating in the aisle, moving pallets from a
> racking bay to the marshalling area. The aisle is 3.2 m wide and there is no marked pedestrian
> walkway within it and no barrier or gate at either end. The inspector saw no pedestrians in the
> aisle during the ten minutes he observed it. The shift supervisor said pedestrian access to
> aisle 7 "depends on the job".

**Inspection context.** location `warehouse aisle 7`; task `moving pallets from racking to the
marshalling area by counterbalance forklift`; jurisdiction `osha-general-industry`.

**Frozen design.** Families `['SINGLE_REAL_UNRESOLVED_FACT', 'EXPOSURE_DECISION',
'NOT_OBSERVED_IS_NOT_ABSENT']`. `preregisteredExpectedGapCount` min 1 / max 1. `pairedWith` null.
`isTransportCanary` false. `capability` ABSENT. No deterministic findings shown. No governed
records and no governed source ids shown (hence N/S/T prefilled `NOT_EXERCISED`).

**Preregistered ESTABLISHED by the text:** a forklift operates in the aisle; the aisle is 3.2 m
wide with no marked walkway and no barrier or gate at either end; no pedestrians were seen during
ten minutes of observation; the supervisor says pedestrian access "depends on the job".

**Preregistered NOT ESTABLISHED by the text:** whether pedestrians are in the aisle while the
forklift is operating; ten minutes without a pedestrian does not establish that pedestrians do not
enter.

**Preregistered expected `owedProperty`, verbatim:** "whether pedestrians enter or work in aisle 7
while the forklift is operating there". Single conjunct: "pedestrians are present in the aisle
during forklift operation".

**Preregistered `expectedAffectedDecision`:** `EXPOSURE`. Acceptable alternative:
`REQUIRED_CONTROL`.

**Preregistered `acceptableSpanRegions`, verbatim:** (1) "The shift supervisor said pedestrian
access to aisle 7 \"depends on the job\""; (2) "The inspector saw no pedestrians in the aisle
during the ten minutes he observed it".

**Preregistered `branchSemantics`, verbatim:** aMustMean "pedestrians do enter the aisle while the
forklift operates"; bMustMean "pedestrians are genuinely excluded while the forklift operates".

**Preregistered `expectedDecisionDivergence`, verbatim:** ifA "separation is required now —
segregation, exclusion or a controlled crossing before forklift work continues in the aisle"; ifB
"the existing arrangement is accepted and forklift work continues".

**Preregistered `unacceptableNeighbouringProperties`, verbatim:** whether a marked walkway EXISTS —
the text states it does not; whether barriers or gates EXIST — the text states they do not; the
width of the aisle — the text gives it as 3.2 m; whether the forklift operator is licensed — not
raised by the text; treating "no pedestrians seen in ten minutes" as establishing that none enter.

**Preregistered design-intent note, verbatim:** "EXPOSURE, and the NOT-OBSERVED-IS-NOT-ABSENT rule.
The absent controls are all stated facts, not gaps. What is genuinely open is whether anyone is
exposed, and the ten minutes of observation is a trap: it is evidence about ten minutes and nothing
more."

**Preregistered criticality note, verbatim:** "pedestrian/vehicle interaction in an unsegregated
aisle is a struck-by fatality mechanism; a reviewer may well call this safety-critical". THIS NOTE
IS QUOTED, NOT ADOPTED; IT IS NOT THE ORACLE.

**Transport and provider state.** `reachedInference` true; httpStatus 200; respondedModel
`claude-sonnet-5`; stopReason `tool_use`; outcome `ANALYZED`; no provider error.

---

## 1. WHAT THE FIRST PASS ACTUALLY EMITTED

**One hazard candidate, `CAND-1`** — hazardFamily `mobile_equipment`, assertedConditionState
`ACTIVE`, groundingStatus `EXACT_QUOTE_SUPPLIED`, confidence `HIGH`, `requiresUserConfirmation`
false. Its quoted evidence is "there is no marked pedestrian walkway within it and no barrier or
gate at either end". Its reasoning, verbatim:

> A forklift is currently operating in an aisle with no walkway segregation and no barrier or gate
> at either end. This is a present physical condition (absence of segregation controls in a live
> traffic aisle) that creates a struck-by/pedestrian-mobile-equipment interface hazard whenever
> anyone enters the aisle, independent of whether a pedestrian happened to be present during the
> ten-minute observation window.

**One decision-critical clarification, `CLQ-1`** — affectedDecision `EXPOSURE`, criticality
`BLOCKING`, `relatesToCandidateKey` `CAND-1`. Question, verbatim:

> Under what conditions is pedestrian access to aisle 7 permitted, and is any pedestrian entry
> expected during forklift operations in this aisle?

whyItMatters, verbatim:

> If pedestrian access is routinely permitted or unrestricted during forklift operations, the aisle
> currently requires a physical barrier, gate, or traffic-control procedure to separate pedestrians
> from the operating forklift; if pedestrian access is in fact excluded during forklift operations
> by a stated rule or physical means, the absence of a marked walkway or barrier is a
> lower-priority gap because the exposure pathway is otherwise controlled. The supervisor's answer
> that access 'depends on the job' does not establish which of these is currently the case, and the
> correct control response differs materially between them.

evidenceGap, verbatim: "Whether pedestrian entry to aisle 7 is permitted, restricted, or excluded
during forklift operations is not established; the supervisor's statement that access 'depends on
the job' does not resolve it."

**One unresolved-fact declaration, `UFD-1`**, verbatim fields:

- `missingFact`: "Whether pedestrian entry into aisle 7 is permitted or expected during forklift
  operations"
- `observationSourceId`: `OBS-SF-11`
- `observationSpan`: "pedestrian access to aisle 7 \"depends on the job\""
- `notEstablishedBecause`: "The supervisor's statement that access depends on the job describes a
  variable policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded
  during periods when the forklift is operating in the aisle."
- `affectedDecision`: `EXPOSURE`
- `branchA`: "Pedestrian access to aisle 7 is permitted or occurs during forklift operations under
  some job types"
- `decisionIfA`: "Immediate need for a physical barrier, gate, marked walkway, or traffic-control
  procedure to separate pedestrians from the operating forklift in this aisle"
- `branchB`: "Pedestrian access to aisle 7 is excluded or does not occur while the forklift is
  operating"
- `decisionIfB`: "The missing walkway/barrier is a lower-priority physical gap since the exposure
  pathway is otherwise controlled by procedure, and the corrective focus shifts to formalizing and
  verifying that exclusion"
- `whyNecessaryNow`: "The forklift is currently operating in the aisle with no barrier at either
  end; whether pedestrians can currently enter determines whether an urgent physical control is
  needed today or whether the existing informal restriction is sufficient pending review."

`crossHazardInsights` empty. `disagreements` empty. `uncertainty.statements` empty.

**expertExplanation.summary, verbatim:**

> A counterbalance forklift is actively working an aisle that has no marked pedestrian walkway and
> no barrier or gate at either end, which is a present segregation gap regardless of the fact no
> pedestrians happened to be seen during the ten-minute observation window. The supervisor's
> statement that pedestrian access 'depends on the job' leaves open whether pedestrians are
> expected to enter this aisle during forklift operations, and that answer determines whether the
> missing walkway/barrier controls are an urgent exposure gap or a lower-priority one. No governed
> record was supplied, so no regulatory citation or obligation is asserted here.

**Admission and refusal.** `admittedFactKeys` = `['FP.EXPOSURE.OBS-SF-11.357-406.1']`.
`rejectedDeclarations` empty. `refusalCodes` empty. Unlike SF-05, NOTHING WAS REFUSED ON THIS ROW.

---

## 2. U18 — ROW SF-11, FOUR HEADLINE SLOTS

*Neutral structural note, offered without judgment:* the row emitted exactly one declaration; the
preregistered range is 1–1; the recorded deterministic observation reads "the admitted count is
inside the preregistered range". Count agreement is not semantic agreement, and the preregistration
is not the oracle.

*Neutral structural note, offered without judgment:* `CAND-1` carries `assertedConditionState`
`ACTIVE` and quotes the absence of walkway/barrier — material the preregistration lists among
ESTABLISHED facts. That absence was raised as a hazard candidate, NOT as an owed fact; the single
declaration `UFD-1` targets pedestrian entry instead. Whether raising it as an ACTIVE candidate
bears on axis B is a semantic question and is not answered here.

*Neutral structural note, offered without judgment:* `CLQ-1` carries `relatesToCandidateKey` but
carries NO `answersUnresolvedFactDeclarationId` field. On SF-01 the corresponding clarification did
carry that field. This is a field-presence comparison only; what it implies for clarification-to-
declaration binding is a semantic question and is not answered here.

**Q1. `ROW:SF-11:A_FIRST_PASS_GAP_RECALL`** — "Were ALL genuinely decision-critical unresolved
facts declared for this row?"
Allowed: `CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`.
Vocabulary source `SECTION_200_VERDICT_VOCABULARY_VERBATIM`. Counts toward the 120: yes.
*What this slot uniquely decides:* whether the genuinely decision-critical unresolved property on
this row was declared — with the NOT-OBSERVED-IS-NOT-ABSENT trap live (ten minutes of no
pedestrians), and with the absent segregation controls being stated facts rather than gaps.

**Q2. `ROW:SF-11:B_FIRST_PASS_GAP_PRECISION`** — "Were unnecessary or already-resolved facts
avoided?"
Allowed: same five. Counts toward the 120: yes.
*What this slot uniquely decides:* whether any ESTABLISHED or neighbouring property (walkway
existence, barrier existence, aisle width, operator licensing, or "no pedestrians in ten minutes"
read as absence) was promoted into an owed fact.

**Q3. `ROW:SF-11:H_MULTI_GAP_PRESERVATION`** — "Do independent gaps survive INDEPENDENTLY?"
Allowed: same five. Counts toward the 120: yes.
*Recorded facts bearing on it:* the frozen design preregisters one owed property with one conjunct
and a 1–1 gap count; one declaration was emitted and admitted; the recorded observation reads "the
expected fact is not conjunctive". Whether a genuine multi-gap opportunity existed is the question.

**Q4. `ROW:SF-11:I_FALSE_GAP_SUPPRESSION`** — "On a row whose text is sufficient, was an
unnecessary owed fact avoided?"
Allowed: same five. Counts toward the 120: yes.
*Recorded facts bearing on it:* `pairedWith` is null on SF-11 — it has no paired sufficient-text
control — and the frozen design preregisters a genuine unresolved property on this row.

---

## 3. U19 — PROJECTED FACT `FP.EXPOSURE.OBS-SF-11.357-406.1`, TEN HEADLINE SLOTS

**The projected OwedFact, verbatim.**

- `factKey` `FP.EXPOSURE.OBS-SF-11.357-406.1`; `affectedDecision` `EXPOSURE`; `source`
  `FIRST_PASS_MODEL`; `priority` `OTHER`; `status` `UNRESOLVED`; `acceptableEvidence` null;
  `modelAuthored` true.
- `evidenceSpan`: "pedestrian access to aisle 7 \"depends on the job\""
- `whyUnresolved`: "The supervisor's statement that access depends on the job describes a variable
  policy but does not state whether pedestrian entry occurs, is scheduled, or is excluded during
  periods when the forklift is operating in the aisle."
- `branchA` / `branchB` and `decisionDivergence.ifA` / `.ifB` are byte-identical to the declaration
  fields quoted in §1.

**The field pair axis Q measures.** `missingFact` in the declaration is "Whether pedestrian entry
into aisle 7 is permitted or expected during forklift operations". `missingFact` present in the
projected OwedFact: **false**. The object the verifier received carries no `missingFact` field.

**Verifier v3.3 record.** `reachedInference` true; `verdict` `VERIFIED_AS_IS`;
`clarificationSourceMode` null; `bindingFactKey` null; `proposedClarification` null;
`owedFactDeclarations` = one entry, `STILL_UNRESOLVED`, `challengeReason` null;
`regulatoryBasis.reliance` `NONE` with no sourceIds; `admissionAdmitted` true with no codes;
`governedEvidenceShownToVerifier` empty; instruction version
`hazlenz.expert.verifier-instruction.v3.2`; admission contract `hazlenz.expert.verifier.v3.3`.

**Verifier rationale, verbatim.**

> The observation establishes a present physical condition (forklift operating in an aisle with no
> marked walkway and no barrier/gate at either end) but leaves open whether pedestrians actually
> enter or are expected to enter this aisle during forklift operations. This directly determines
> whether the missing segregation controls constitute an urgent, live struck-by exposure requiring
> immediate physical/procedural intervention, or a lower-priority gap because pedestrian exposure
> is otherwise excluded. The two answers lead to different actions today (urgent
> barrier/walkway/traffic-control implementation vs. lower-priority formalization of an existing
> exclusion), so this is a genuine decision-critical fact. The first-pass clarification asks exactly
> this: under what conditions pedestrian access is permitted and whether entry is expected during
> forklift operations. Answering that question would resolve both the "permitted under some
> conditions" and "expected during operations" branches, which together cover the fact as stated
> (access occurs/is scheduled vs. excluded). No piece of the owed fact is left untouched by the
> question as written. I do not find an additional fact outside those supplied that would change
> today's decision: aisle width, absence of governed evidence, and the ten-minute observation
> window are all magnitude/context details that don't independently flip the required action once
> exposure is resolved.

**Recorded neutral deterministic observations for this fact** (comparisons, not verdicts):

- declared `evidenceSpan` vs the 2 preregistered `acceptableSpanRegions`: **the declared span is a
  SUBSTRING of a preregistered region** ("The shift supervisor said pedestrian access to aisle 7
  \"depends on the job\"").
- declared `affectedDecision` vs preregistered: **matches** (`EXPOSURE`).
- shared vocabulary with `unacceptableNeighbouringProperties` — **DISCLOSED AS NOISY, A WEAK
  POINTER**: highest overlap 40% with "whether the forklift operator is licensed — not raised by
  the text". Words in common are not a substitution and few words in common are not a defence.
- preregistered conjuncts vs the full declaration text: **the expected fact is not conjunctive**.

### The ten open slots

**C — `C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`.** "Does this declaration identify the EXACT property
that remains unknown?" Five-value vocabulary.
*Bearing material:* the preregistered property is "whether pedestrians enter or work in aisle 7
while the forklift is operating there"; the declaration's property is "whether pedestrian entry
into aisle 7 is permitted or expected during forklift operations". PERMITTED / EXPECTED versus
ENTER OR WORK is the semantic comparison this slot decides; it is stated here, not resolved.

**D — `D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE`.** "Is the verbatim span actually relevant to WHY this
fact is unresolved?" Five-value vocabulary.
*Bearing material:* the declared span is the supervisor's "depends on the job" statement, a
substring of preregistered region (1). The alternative preregistered region — the ten-minute
observation — was not the span chosen.

**E — `E_BRANCH_PLAUSIBILITY`.** "Are branchA and branchB genuinely possible resolutions of THIS
exact fact?" Five-value vocabulary.
*Bearing material:* branchA "permitted or occurs ... under some job types" against preregistered
aMustMean "pedestrians do enter the aisle while the forklift operates"; branchB "excluded or does
not occur while the forklift is operating" against preregistered bMustMean "pedestrians are
genuinely excluded while the forklift operates".

**F — `F_DECISION_DIVERGENCE_VALIDITY`.** "Do ifA and ifB represent MATERIALLY DIFFERENT downstream
decisions?" Five-value vocabulary.
*Bearing material:* ifA requires an immediate physical/procedural separation control; ifB
downgrades the missing walkway/barrier to a lower-priority gap and redirects to formalizing and
verifying the exclusion. The preregistered ifB was "the existing arrangement is accepted and
forklift work continues"; the emitted ifB adds formalization and verification rather than plain
acceptance.

**G — `G_AFFECTED_DECISION_CORRECTNESS`.** "Is the fact bound to the correct affectedDecision?"
Five-value vocabulary.
*Bearing material:* declared `EXPOSURE`; preregistered `EXPOSURE`; acceptable alternative
`REQUIRED_CONTROL`.

**L — `L_VERIFIER_TARGET_BINDING`.** "Does the verifier verdict address the EXACT projected owed
fact?" Five-value vocabulary.
*Bearing material:* the full verifier rationale is quoted above. It is the only verifier text on
this fact; `bindingFactKey` is null and no clarification was proposed.

**M — `M_CLARIFICATION_RESOLUTION_SUFFICIENCY`.** "Would the clarification actually obtain evidence
CAPABLE OF SETTLING the fact?" Five-value vocabulary.
*Bearing material:* `CLQ-1` asks under what conditions pedestrian access is permitted and whether
any entry is expected during forklift operations. The prior §204 sessions recorded a
performance-versus-result defect pattern on other rows (asking whether an activity occurred rather
than what it established); whether that pattern is present or absent here is what this slot
decides.

**Q — `Q_OWED_PROPERTY_LOSS_IMPACT`.** "Did the ABSENCE of a dedicated owed-property field in
OwedFact cause loss for this fact?"
Allowed: `NO_OBSERVABLE_LOSS` · `MINOR_WORDING_LOSS` · `TARGET_AMBIGUITY` ·
`NEIGHBOURING_PROPERTY_AMBIGUITY` · `CLARIFICATION_INSUFFICIENCY` · `INCORRECT_VERIFIER_BINDING` ·
`HUMAN_REVIEW_DIFFICULTY`. Vocabulary source `SECTION_200_AXIS_SCALE_VERBATIM`.
*Bearing material:* `missingFact` is absent from the projected OwedFact and from the verifier's
input object. What survives into the verifier's view is `whyUnresolved`, `evidenceSpan`, both
branches, the decision divergence, and `affectedDecision`. THIS SLOT IS DECIDED PER-FACT; no result
recorded on U14 or on any earlier fact carries over to it.

**R (safety) — `R_SAFETY_CLASSIFICATION`.** "How would you classify this fact's safety
significance?"
Allowed: `ORDINARY_NON_ESCALATING` · `SAFETY_SIGNIFICANT` · `PLAUSIBLY_LIFE_CRITICAL` ·
`INDETERMINATE`. Vocabulary source `SECTION_200_AXIS_SCALE_VERBATIM`.
*Bearing material:* a counterbalance forklift is operating now in a 3.2 m aisle with no
segregation and no barrier at either end; whether pedestrians enter during operations is
unresolved. The preregistered criticality note calls unsegregated pedestrian/vehicle interaction a
struck-by fatality mechanism — QUOTED, NOT ADOPTED, AND NOT THE ORACLE.

**R (floor) — `R_PRIORITY_FLOOR_IMPACT`.** "Does the projected priority floor of OTHER materially
under-escalate this fact?"
Allowed: `FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` · `FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE` ·
`INDETERMINATE`. Vocabulary source `SECTION_202_PRODUCT_OWNER_CONFIRMED`.
*Bearing material:* the projected `priority` on this fact is `OTHER`.
THIS AXIS IS DIAGNOSTIC MEASUREMENT ONLY. Whatever is recorded, no priority-policy mutation and no
provider-controlled escalation authority follows from it.

---

## 4. RECORDING NOTE

Recording goes through `backend/scripts/record-204-adjudication-verdicts.ts`, i.e. §202's
`recordVerdict` / `recordAdditive` unmodified, attribution `PRODUCT_OWNER`. Per ENTRY 1 of
`POST-120-REMEDIATION-REGISTER.md`, `recordAdditive` overwrites rather than appends; any additive
text for U18 or U19 will be submitted as prior-value-plus-new-text by the caller. Both units
currently hold `reviewerNotes` null and `truthSpecificationDefect` null.

**Expected count after this batch:** SUPPLIED 120 / 120, REMAINING 0 / 120. The 66 supplementary
slots remain deferred and are counted separately.

**Not authorized and not performed:** provider calls, database operations, remediation, prompt /
contract / priority changes, commit / push / tag / deploy.

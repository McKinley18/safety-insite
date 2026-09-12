# §209B — PRODUCT-OWNER ADJUDICATION BATCH 001

Slots 1–22 of 177, in the frozen instrument order.

Preregistration identity `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`. **Zero verdicts supplied. This document supplies none and asks for 22.**

## How to read this document

One block per judgment slot. Each block is self-contained: it repeats the whole frozen truth for its case, the exact observation, the authoritative model output, the authoritative §208B verifier output and the frozen §200 instructions for its axis, so that no other file needs to be opened to form the judgment. Repetition between blocks on the same case is deliberate.

**Verifier evidence is the §208B recovered set (`ACCEPTANCE_VERIFIER_EVIDENCE`).** The §208 verifier outputs are `DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE`, are not an input to any judgment here, and their content appears nowhere in this document.

### What this document deliberately does not tell you

No suggested verdict. No predicted verdict. No machine score. No running total. No provisional gate outcome. **No indication of which gates a slot feeds**, and no statement of what any particular answer would cause. The structural findings shown per case — declaration counts, admission, refusal codes — are **evidence**, not a score and not an answer.

### The two rules that are easiest to break

- **AMBIGUOUS is never a pass.** AMBIGUOUS is never a pass. On a hard-gate slot it makes the gate UNDETERMINED, which blocks acceptance exactly as FAILED does.
- **NOT_EXERCISED is never a pass.** permitted only where the design targeted an axis and the opportunity did not materialise, with a recorded reason. A vacuous CORRECT is forbidden. A NOT_EXERCISED on a hard-gate slot reduces that gate denominator; below the preregistered minimum the gate is COVERAGE_INSUFFICIENT, which is not a pass.

Do not choose CORRECT or INCORRECT merely to make a slot determinate. AMBIGUOUS is a legitimate answer and the instrument is built to carry it.

### Recording

Every verdict is recorded through `record-209-verdict.ts`, or through `record-209-batch.ts` from a file you author with one line per judgment in the form `slotId | verdict | reason`. Both accept `PRODUCT_OWNER` attribution and nothing else, and neither derives any field.

---

## SLOT 1 of 177 — `AC-01.ROW.A`

### 1. Slot identity

- **slotId:** `AC-01.ROW.A`
- **kind:** `ROW_AXIS`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `A` — **FIRST_PASS_GAP_RECALL**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Were ALL genuinely decision-critical unresolved facts declared for this row?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis A FIRST_PASS_GAP_RECALL, verbatim:*

- **what bears on it:** the observation text, what it establishes, what it leaves open. A fact is decision-critical only if two materially different answers lead to two different CURRENT outcomes.
- **CORRECT when:** every gap the text genuinely leaves open, and that changes what is done today, was declared
- **PARTIALLY_CORRECT when:** some but not all such gaps were declared
- **INCORRECT when:** a gap that changes what is done today was not declared at all
- **must NOT influence the verdict:** whether the count matches the preregistered range; how well written the declaration is

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.ROW.A | <VERDICT> | <your reason>
```

---

## SLOT 2 of 177 — `AC-01.ROW.B`

### 1. Slot identity

- **slotId:** `AC-01.ROW.B`
- **kind:** `ROW_AXIS`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `B` — **FIRST_PASS_GAP_PRECISION**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Were unnecessary or already-resolved facts avoided?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis B FIRST_PASS_GAP_PRECISION, verbatim:*

- **what bears on it:** whether each declared fact is genuinely open in the text AND genuinely changes today's action
- **CORRECT when:** no declared fact is already established by the text and none is decision-neutral
- **PARTIALLY_CORRECT when:** one of several declarations is unnecessary
- **INCORRECT when:** a declared fact is answered by the text, or both its answers lead to the same action today
- **must NOT influence the verdict:** whether asking anyway would be harmless or good practice

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.ROW.B | <VERDICT> | <your reason>
```

---

## SLOT 3 of 177 — `AC-01.ROW.H`

### 1. Slot identity

- **slotId:** `AC-01.ROW.H`
- **kind:** `ROW_AXIS`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `H` — **MULTI_GAP_PRESERVATION**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Do independent gaps survive INDEPENDENTLY?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis H MULTI_GAP_PRESERVATION, verbatim:*

- **what bears on it:** whether two declared facts are genuinely different facts, and whether settling one leaves the other open
- **CORRECT when:** each declared fact stands alone and would need its own evidence
- **PARTIALLY_CORRECT when:** both gaps are present but partly conflated
- **INCORRECT when:** two declarations restate one gap, or one declaration silently merges two
- **must NOT influence the verdict:** the structural distinctness of the computed keys — already reported mechanically

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.ROW.H | <VERDICT> | <your reason>
```

---

## SLOT 4 of 177 — `AC-01.ROW.I`

### 1. Slot identity

- **slotId:** `AC-01.ROW.I`
- **kind:** `ROW_AXIS`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `I` — **FALSE_GAP_SUPPRESSION**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **On a row whose text is sufficient, was an unnecessary owed fact avoided?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis I FALSE_GAP_SUPPRESSION, verbatim:*

- **what bears on it:** the matched partner row is named so both can be read together
- **CORRECT when:** no fact was declared, or any declared fact is genuinely open
- **PARTIALLY_CORRECT when:** a declared fact is marginal rather than clearly false
- **INCORRECT when:** a fact was declared that the text answers, or that changes nothing today
- **must NOT influence the verdict:** that declaring something would have been more thorough

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.ROW.I | <VERDICT> | <your reason>
```

---

## SLOT 5 of 177 — `AC-01.FACT1.C`

### 1. Slot identity

- **slotId:** `AC-01.FACT1.C`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
- **bound declarationId:** `decl_lanyard`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `C` — **OWED_PROPERTY_SEMANTIC_CORRECTNESS**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Does this declaration identify the EXACT property that remains unknown?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis C OWED_PROPERTY_SEMANTIC_CORRECTNESS, verbatim:*

- **CORRECT when:** the property named is the one the text leaves open
- **PARTIALLY_CORRECT when:** the property is in the right area but stated more narrowly or more broadly than the open question
- **INCORRECT when:** the property named is a NEIGHBOUR the text already establishes — presence for securement, appearance for function, repair for verification
- **must NOT influence the verdict:** that OwedFact has no dedicated field for the property; score from missingFact and the whole declaration

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.FACT1.C | <VERDICT> | <your reason>
```

---

## SLOT 6 of 177 — `AC-01.FACT1.E`

### 1. Slot identity

- **slotId:** `AC-01.FACT1.E`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
- **bound declarationId:** `decl_lanyard`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `E` — **BRANCH_PLAUSIBILITY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Are branchA and branchB genuinely possible resolutions of THIS exact fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis E BRANCH_PLAUSIBILITY, verbatim:*

- **CORRECT when:** both branches are real possible STATES OF THE WORLD given the observation
- **PARTIALLY_CORRECT when:** one branch is sound and the other is not
- **INCORRECT when:** a branch is a rhetorical opposite, an invented state the text excludes, or an answer to a different question
- **must NOT influence the verdict:** which branch is more likely

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.FACT1.E | <VERDICT> | <your reason>
```

---

## SLOT 7 of 177 — `AC-01.FACT1.F`

### 1. Slot identity

- **slotId:** `AC-01.FACT1.F`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
- **bound declarationId:** `decl_lanyard`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `F` — **DECISION_DIVERGENCE_VALIDITY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis F DECISION_DIVERGENCE_VALIDITY, verbatim:*

- **CORRECT when:** the two actions differ in what someone would do now
- **PARTIALLY_CORRECT when:** the actions differ in degree but arguably not in kind
- **INCORRECT when:** the wording differs but the action is the same, or an action does not follow from its branch
- **must NOT influence the verdict:** that the boundary already refused identical strings — it compares bytes, not decisions

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.FACT1.F | <VERDICT> | <your reason>
```

---

## SLOT 8 of 177 — `AC-01.FACT1.M`

### 1. Slot identity

- **slotId:** `AC-01.FACT1.M`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
- **bound declarationId:** `decl_lanyard`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `M` — **CLARIFICATION_RESOLUTION_SUFFICIENCY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis M CLARIFICATION_RESOLUTION_SUFFICIENCY, verbatim:*

- **CORRECT when:** an answer would establish or refute the property
- **PARTIALLY_CORRECT when:** an answer would narrow the fact without settling it
- **INCORRECT when:** it names the right fact but would be satisfied by evidence that leaves the property open — presence, visibility, a status indicator, a signature
- **must NOT influence the verdict:** how well phrased the question is. TOPIC REACH IS NOT RESOLUTION SUFFICIENCY.

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.FACT1.M | <VERDICT> | <your reason>
```

---

## SLOT 9 of 177 — `AC-01.FACT1.L`

### 1. Slot identity

- **slotId:** `AC-01.FACT1.L`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
- **bound declarationId:** `decl_lanyard`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `L` — **VERIFIER_TARGET_BINDING**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Does the verifier verdict address the EXACT projected owed fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis L VERIFIER_TARGET_BINDING, verbatim:*

- **CORRECT when:** the verdict is about this fact and no other
- **PARTIALLY_CORRECT when:** it reaches the right topic but drifts to an adjacent property
- **INCORRECT when:** it addresses a neighbouring property, a different hazard, or the row in general
- **must NOT influence the verdict:** that admission passed — admission is structural. TOPIC REACH IS NOT EXACT BINDING.

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.
- **fidelity disclosure frozen on this slot:** AXIS L PROVENANCE: this verdict comes from the §208B RECOVERED verifier evidence, executed against the frozen §208 first-pass outputs with the hazard-candidate block correctly populated and the §199 provider envelope. The §208 verifier outputs are DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and are NOT an input to this judgment. The §208 fidelity limitation does not apply here.

**To record this judgment:**

```
AC-01.FACT1.L | <VERDICT> | <your reason>
```

---

## SLOT 10 of 177 — `AC-01.FACT2.C`

### 1. Slot identity

- **slotId:** `AC-01.FACT2.C`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 2
- **bound factKey:** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
- **bound declarationId:** `decl_duct`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `C` — **OWED_PROPERTY_SEMANTIC_CORRECTNESS**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Does this declaration identify the EXACT property that remains unknown?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis C OWED_PROPERTY_SEMANTIC_CORRECTNESS, verbatim:*

- **CORRECT when:** the property named is the one the text leaves open
- **PARTIALLY_CORRECT when:** the property is in the right area but stated more narrowly or more broadly than the open question
- **INCORRECT when:** the property named is a NEIGHBOUR the text already establishes — presence for securement, appearance for function, repair for verification
- **must NOT influence the verdict:** that OwedFact has no dedicated field for the property; score from missingFact and the whole declaration

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.FACT2.C | <VERDICT> | <your reason>
```

---

## SLOT 11 of 177 — `AC-01.FACT2.E`

### 1. Slot identity

- **slotId:** `AC-01.FACT2.E`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 2
- **bound factKey:** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
- **bound declarationId:** `decl_duct`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `E` — **BRANCH_PLAUSIBILITY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Are branchA and branchB genuinely possible resolutions of THIS exact fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis E BRANCH_PLAUSIBILITY, verbatim:*

- **CORRECT when:** both branches are real possible STATES OF THE WORLD given the observation
- **PARTIALLY_CORRECT when:** one branch is sound and the other is not
- **INCORRECT when:** a branch is a rhetorical opposite, an invented state the text excludes, or an answer to a different question
- **must NOT influence the verdict:** which branch is more likely

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.FACT2.E | <VERDICT> | <your reason>
```

---

## SLOT 12 of 177 — `AC-01.FACT2.F`

### 1. Slot identity

- **slotId:** `AC-01.FACT2.F`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 2
- **bound factKey:** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
- **bound declarationId:** `decl_duct`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `F` — **DECISION_DIVERGENCE_VALIDITY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis F DECISION_DIVERGENCE_VALIDITY, verbatim:*

- **CORRECT when:** the two actions differ in what someone would do now
- **PARTIALLY_CORRECT when:** the actions differ in degree but arguably not in kind
- **INCORRECT when:** the wording differs but the action is the same, or an action does not follow from its branch
- **must NOT influence the verdict:** that the boundary already refused identical strings — it compares bytes, not decisions

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.FACT2.F | <VERDICT> | <your reason>
```

---

## SLOT 13 of 177 — `AC-01.FACT2.M`

### 1. Slot identity

- **slotId:** `AC-01.FACT2.M`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 2
- **bound factKey:** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
- **bound declarationId:** `decl_duct`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `M` — **CLARIFICATION_RESOLUTION_SUFFICIENCY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis M CLARIFICATION_RESOLUTION_SUFFICIENCY, verbatim:*

- **CORRECT when:** an answer would establish or refute the property
- **PARTIALLY_CORRECT when:** an answer would narrow the fact without settling it
- **INCORRECT when:** it names the right fact but would be satisfied by evidence that leaves the property open — presence, visibility, a status indicator, a signature
- **must NOT influence the verdict:** how well phrased the question is. TOPIC REACH IS NOT RESOLUTION SUFFICIENCY.

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-01.FACT2.M | <VERDICT> | <your reason>
```

---

## SLOT 14 of 177 — `AC-01.FACT2.L`

### 1. Slot identity

- **slotId:** `AC-01.FACT2.L`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 2
- **bound factKey:** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
- **bound declarationId:** `decl_duct`

### 2. Case

- **caseId:** `AC-01` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** distribution warehouse, high-bay aisle 7
- **task:** replacing high-bay light fittings from a self-propelled mobile elevating work platform
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** fall_protection, mobile_equipment, electrical
- **case purpose (frozen):** F1 -- two genuinely independent decision-critical unresolved facts on one row, one of them materially more salient than the other. §204 measured this once and it failed: the salient fact was declared and the second was left in prose.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, FUNCTION_VERSUS_APPEARANCE

### 3. Axis / judgment name

- **axis:** `L` — **VERIFIER_TARGET_BINDING**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Does the verifier verdict address the EXACT projected owed fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** The salient fact (a visible harness with an invisible termination) is designed to attract the declaration. The second fact is deliberately quieter -- a painted floor marking -- and is the one F1 predicts will be left in prose. Both are life-critical and neither settles the other.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The operator in the raised basket is attached to the basket's designated anchor point by the lanyard he is wearing.
  - *why:* attached and not attached lead to different actions right now: work continues, or the basket is brought down and the attachment corrected before work resumes.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The service duct cover the machine is standing on can carry the machine's wheel loading with the basket raised and extended.
  - *why:* sufficient and insufficient lead to different actions right now: the machine stays where it is, or it is lowered and repositioned off the duct before work resumes.
- **P3** — `RESOLVED`
  - *statement:* A full body harness and lanyard are being worn.
  - *why:* the observation states it directly. It is the appearance that competes with P1.
- **P4** — `RESOLVED`
  - *statement:* The outriggers are stowed.
  - *why:* stated, and stated to be normal for the model. It is not an open question and must not be converted into one.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-01-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the operator's lanyard is actually attached to the basket's designated anchor point, so that the harness he is wearing would arrest a fall from the basket
- **conjuncts, all of which must survive:** “the lanyard is connected to the designated anchor point”
- **independent of:** AC-01-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `EXPOSURE`
- **essential qualifiers that must survive:**
  - attachment, not possession -- wearing the harness is established and is not the question
  - the designated anchor point, not any convenient part of the basket
- **acceptable branch partition:**
  - the lanyard is attached to the designated anchor point
  - the lanyard is not attached to the designated anchor point
- **what is done TODAY under each state:**
  - *attached to the designated anchor point* → the fall-arrest arrangement for this task is accepted and the work continues
  - *not attached to the designated anchor point* → the basket is lowered and the attachment corrected before work resumes
- **PROHIBITED decision claims:**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **evidence that would actually settle it:**
  - a direct observation or photograph showing the lanyard hook engaged on the designated anchor point
  - a statement from the operator identifying the point his lanyard is clipped to
- **a sufficient clarification must establish:** the point the lanyard is actually clipped to -- not whether a harness is worn, and not whether an anchor point exists.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether a harness is worn -- the text states it is
  - whether the basket has an anchor point -- the text states it does
  - whether the harness is in date or inspected
  - whether the operator is trained to use the machine

**`AC-01-F2`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the service duct cover the machine is standing on is rated to carry this machine's wheel loading with the basket raised
- **conjuncts, all of which must survive:** “the duct cover carries the wheel loading in the machine's present configuration”
- **independent of:** AC-01-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-01-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the loading with the basket RAISED, which is the loading that applies now
  - the specific duct cover the machine is standing on, not floor loading generally
- **acceptable branch partition:**
  - the duct cover is rated for, and carries, this wheel loading
  - the duct cover is not rated for this wheel loading, or its rating cannot be established
- **what is done TODAY under each state:**
  - *rated and adequate* → the machine stays in position and the work continues
  - *not rated or not establishable* → the basket is lowered and the machine repositioned clear of the duct before work resumes
- **PROHIBITED decision claims:**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish
- **evidence that would actually settle it:**
  - the duct cover's marked or documented load rating together with the machine's wheel loading
  - a structural determination for this cover at this configuration
- **a sufficient clarification must establish:** the load the duct cover can carry, set against this machine's wheel loading in its present raised configuration -- not merely whether a duct is present.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the duct is marked -- the text states it is
  - whether the outriggers are deployed -- the text states they are stowed and that this is normal
  - whether the aisle is wide enough

**Frozen temporal / sequence requirements:**

- both facts are about the situation NOW, with a person in a raised basket. Neither may be stated as a matter for a future review.

### 8. Exact observation and supplied context

*distribution warehouse, high-bay aisle 7 — replacing high-bay light fittings from a self-propelled mobile elevating work platform. Jurisdiction osha-general-industry. Hazard families supplied: fall_protection, mobile_equipment, electrical.*

> A self-propelled boom-type mobile elevating work platform is set up in aisle 7 with the basket raised to approximately six metres. The operator in the basket is wearing a full body harness with a lanyard; the lanyard runs down behind him and the inspector could not see where its other end terminates. The basket has a designated anchor point marked on the inside of the guardrail. The machine is standing on a section of aisle floor that carries a painted outline and the words SERVICE DUCT BELOW. No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit. The machine was set on its wheels with the outriggers stowed, which is normal for this model. Work was in progress when the inspector arrived and continued during the visit.

**Established by the text:**

- the operator is wearing a full body harness and a lanyard
- the basket has a designated anchor point
- the machine is standing over a marked service duct
- the duct cover carries no load rating and the site plan was unavailable
- the machine is on wheels with outriggers stowed, which is normal for the model
- work is in progress with a person in the raised basket now

**Not established by the text:**

- where the lanyard terminates, and therefore whether the operator is attached to the designated anchor point
- whether the service duct cover can carry the wheel loading of this machine
- the make and model of the machine
- how long the work has been under way

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (2):**

- `lanyard_termination_unknown` [fall_protection] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “the lanyard runs down behind him and the inspector could not see where its other end terminates”
  - *evidence basis:* The observation states the inspector could not visually determine where the lanyard's other end is anchored, from the vantage point available at the time.
  - *reasoning:* A full body harness and lanyard are only an effective fall arrest control if the lanyard is connected to a suitable anchor point. The observation establishes a designated anchor point exists on the basket, but does not establish that the operator's lanyard is actually clipped to it. If it is unclipped or attached to a non-anchor point, the operator has no fall protection while working from a raised basket at approximately six metres.
- `duct_load_rating_unknown` [mobile_equipment] `INSUFFICIENT_EVIDENCE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-01:* “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - *evidence basis:* The observation states no load rating markings were found and the site plan was unavailable at the time of the visit, meaning the load capacity of the duct cover the machine is standing on could not be confirmed by the inspector.
  - *reasoning:* The self-propelled MEWP, with an operator elevated in the basket, is standing directly on a marked service duct cover of unknown load rating. If the duct cover cannot bear the machine's wheel loads with the basket raised, a collapse could occur, causing the platform to tip or drop while the operator is elevated in the basket — a struck-by/fall hazard combination. This is a hazard the observation directly supports through the absence of any confirmable rating.

**Produced declaration `decl_lanyard`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** Whether the operator's lanyard is connected to the basket's designated anchor point
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “the inspector could not see where its other end terminates”
- **notEstablishedBecause:** The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
- **branchA:** The lanyard is clipped to the designated anchor point inside the guardrail
- **decisionIfA:** Fall protection is functioning as required and work may continue as observed
- **branchB:** The lanyard is unclipped, or clipped to a non-anchor part of the basket
- **decisionIfB:** Fall protection is not functional; work must stop until the operator connects to the designated anchor point
- **whyNecessaryNow:** The operator is currently working at height in the basket, so whether fall arrest would function in the event of a fall is a live, present-tense safety question that cannot wait.

**Produced declaration `decl_duct`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** The load-bearing capacity of the service duct cover beneath the MEWP and whether it is sufficient for the machine's wheel loading
- **affectedDecision:** `HAZARD_SEVERITY`
- **observationSourceId:** `OBS-AC-01`
- **observationSpan (verbatim):** “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
- **notEstablishedBecause:** The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
- **branchA:** The duct cover is rated to carry the MEWP's wheel loads with the basket raised
- **decisionIfA:** The machine may remain positioned where it is while work continues
- **branchB:** The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
- **decisionIfB:** The machine must be repositioned off the duct before the basket is raised further or work continues
- **whyNecessaryNow:** The machine is currently standing on the duct with the operator elevated in the basket, so whether the standing surface can support the load is a live structural safety question affecting the elevated worker right now.

**Clarifications the model asked (2):**

- `q_lanyard_connection` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_lanyard`
  - *question (verbatim):* “Is the operator's lanyard actually connected to the basket's designated anchor point, or to some other point, or not connected at all?”
  - *why it matters:* If the lanyard is connected to the designated anchor point, fall protection is in place and the operator is protected while working from the six-metre basket. If it is unclipped or attached to a non-anchor part of the basket, the operator has no functional fall arrest while elevated, which requires an immediate stop-work and correction before work continues.
  - *evidence gap:* The observation states the inspector could not see where the lanyard's other end terminates, so its connection point is unknown.
- `q_duct_capacity` [HAZARD_SEVERITY, BLOCKING] → answers declaration `decl_duct`
  - *question (verbatim):* “What is the load-bearing capacity of the service duct cover beneath the machine, and does it exceed the MEWP's wheel loading with the basket raised?”
  - *why it matters:* If the duct cover is rated to carry the machine's wheel loads, the machine may continue operating in this position safely. If the duct cover's capacity is unknown or insufficient, the machine must be repositioned off the duct before continuing to raise the basket, since a collapse under the machine with the operator elevated could cause a serious fall or tip-over.
  - *evidence gap:* No load rating is marked on the duct cover or nearby, and the site plan giving duct specifications was not available at the time of the visit.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_lanyard` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the inspector could not see where its other end terminates”
  - `whyUnresolved`: The observation states only that the termination point was not visible to the inspector; it does not state the lanyard is disconnected nor that it is connected to the anchor point.
  - `branchA`: The lanyard is clipped to the designated anchor point inside the guardrail
  - `branchB`: The lanyard is unclipped, or clipped to a non-anchor part of the basket
  - `decisionDivergence.ifA`: Fall protection is functioning as required and work may continue as observed
  - `decisionDivergence.ifB`: Fall protection is not functional; work must stop until the operator connects to the designated anchor point
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_duct` → ADMITTED as `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`
  - `affectedDecision`: `HAZARD_SEVERITY`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “No load rating is marked on the duct cover or anywhere nearby, and the site plan was not available at the time of the visit.”
  - `whyUnresolved`: The observation states the load rating was not marked and the site plan was unavailable; it does not state the duct's actual capacity or that it is inadequate or adequate.
  - `branchA`: The duct cover is rated to carry the MEWP's wheel loads with the basket raised
  - `branchB`: The duct cover is not rated for, or its capacity cannot be confirmed to meet, the MEWP's wheel loads
  - `decisionDivergence.ifA`: The machine may remain positioned where it is while work continues
  - `decisionDivergence.ifB`: The machine must be repositioned off the duct before the basket is raised further or work continues
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1`** (declaration `decl_lanyard`, ordinal 1, candidates supplied 2) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach genuinely decision-critical, unresolved facts. (1) Lanyard termination: the observation only establishes that the inspector could not see the termination, which is equally consistent with proper connection and with disconnection — these lead to different actions (continue vs. stop work), so it is unresolved and matters; the first-pass question asks exactly whether it is connected to the designated anchor point, other point, or not at all, which would settle the fact fully. (2) Duct load rating: the observation states no rating was found and the site plan was unavailable, leaving the duct's capacity to bear the MEWP's wheel loads unconfirmed; the two possible answers (adequate vs. inadequate capacity) lead to different actions (continue operating there vs. relocate/cease), so this also matters and the first-pass question reaches it directly. No additional unraised fact appears necessary: the observation does not suggest any other open contingency that would change today's action (e.g., outriggers stowed is stated as normal for this model, so that is settled, not a hazard branch). Both supplied unresolved facts are already the subject of adequate first-pass questions, so no replacement or new question is needed, and no separate nomination is warranted.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1`** (declaration `decl_duct`, ordinal 2, candidates supplied 2) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** Both first-pass questions reach the two decision-critical facts. The lanyard-connection question directly resolves whether fall protection is effective (REQUIRED_CONTROL). The duct load-rating question directly resolves the supplied unresolved fact FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1: it asks for the duct's load-bearing capacity and whether it exceeds the MEWP's wheel loading, which is exactly the fact needed to decide whether the machine can remain on the duct or must be repositioned. Answering "what is the capacity, does it exceed wheel loading" as written would establish either that the duct is adequate (work continues) or inadequate/unconfirmed-adequate (machine must move), matching the two branches given for the supplied fact. There is no partial-coverage problem here — the fact requires only one thing (comparing capacity to wheel load) and the question asks precisely that.

I considered whether a further fact should be nominated — e.g., whether work should stop immediately while these two questions are pending, given the operator is elevated at six metres on an unconfirmed surface with unconfirmed fall arrest. But the observation states work was already in progress and continued during the visit; the first-pass analysis does not add a stop-work action, and adding one would alter corrective actions, which is outside my remit. No additional fact outside the two supplied appears necessary to determine a decision not already covered by the two clarifications asked.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-01-F1`**

- attachment, not possession -- wearing the harness is established and is not the question
- the designated anchor point, not any convenient part of the basket

**`AC-01-F2`**

- the loading with the basket RAISED, which is the loading that applies now
- the specific duct cover the machine is standing on, not floor loading generally

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-01-T1` — whether the harness is within its inspection date.** nothing in the observation puts the harness's condition in question, and the answer does not change what is done today: the attachment question is the one that governs whether the work continues.
- **`AC-01-T2` — whether the outriggers should be deployed.** the text states the stowed configuration is normal for this model. Declaring it would be an unsupported adverse counterfactual of the F2 shape.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-01-F1`**
  - that fall protection across the site, or for other tasks on this machine, is adequate
  - that the machine is safe to operate, which this fact does not reach -- P2 is open
  - that no other fall-protection measure is required anywhere
- **`AC-01-F2`**
  - that the aisle floor generally is suitable for this machine
  - that the machine is safe to use, which this fact does not reach -- F1 is open
  - that outriggers would resolve it, which the fact does not establish

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis L VERIFIER_TARGET_BINDING, verbatim:*

- **CORRECT when:** the verdict is about this fact and no other
- **PARTIALLY_CORRECT when:** it reaches the right topic but drifts to an adjacent property
- **INCORRECT when:** it addresses a neighbouring property, a different hazard, or the row in general
- **must NOT influence the verdict:** that admission passed — admission is structural. TOPIC REACH IS NOT EXACT BINDING.

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `4e64786cdc443519077707086beeeb025b955187a668dacf1f5bc1613401e1a7`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `6855f924a4a630ebc75cc523a5bc4ed59fa180c83bbd46a8d6548bfae250f0d4`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.
- **fidelity disclosure frozen on this slot:** AXIS L PROVENANCE: this verdict comes from the §208B RECOVERED verifier evidence, executed against the frozen §208 first-pass outputs with the hazard-candidate block correctly populated and the §199 provider envelope. The §208 verifier outputs are DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and are NOT an input to this judgment. The §208 fidelity limitation does not apply here.

**To record this judgment:**

```
AC-01.FACT2.L | <VERDICT> | <your reason>
```

---

## SLOT 15 of 177 — `AC-02.ROW.A`

### 1. Slot identity

- **slotId:** `AC-02.ROW.A`
- **kind:** `ROW_AXIS`

### 2. Case

- **caseId:** `AC-02` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** maintenance workshop
- **task:** dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** machine_guarding, electrical, ppe
- **case purpose (frozen):** F1 with a precision guard: three unresolved things, of which exactly two are decision-critical. Tests enumeration without rewarding a coverage habit.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, THRESHOLD_IS_NOT_A_GAP

### 3. Axis / judgment name

- **axis:** `A` — **FIRST_PASS_GAP_RECALL**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Were ALL genuinely decision-critical unresolved facts declared for this row?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** Two decision-critical facts and one real-but-neutral unknown on the same row. A model with a coverage habit declares three; a model that drops the quieter conjunct declares one. Only two is correct.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The wheel fitted this morning is rated for a maximum operating speed at or above the machine's spindle speed.
  - *why:* an over-speeded wheel can burst with a person at the machine now. Rated and not rated lead to opposite actions today.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The adjustable tongue guard is set close enough to the newly fitted wheel to prevent a fragment escaping through the opening.
  - *why:* the wheel changed diameter and the tongue guard did not move, so the gap is open by construction. Within tolerance and outside it lead to different actions today.
- **P3** — `UNRESOLVED`
  - *statement:* The portable appliance inspection is current.
  - *why:* genuinely unknown, but nothing in the observation suggests an electrical defect, and both answers lead to the same thing today: the machine keeps running while a record is chased. Declaring it is an axis-B precision failure, not thoroughness.
- **P4** — `RESOLVED`
  - *statement:* Both wheel guards are fitted and closed.
  - *why:* stated. It is the neighbour that competes with P2.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-02-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
- **conjuncts, all of which must survive:** “the wheel's rated speed is at or above the machine's spindle speed”
- **independent of:** AC-02-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the comparison of two figures, not the presence of a marking -- the marking is established
- **acceptable branch partition:**
  - the wheel is rated at or above the spindle speed
  - the wheel is rated below the spindle speed, or the comparison cannot be made
- **what is done TODAY under each state:**
  - *rated at or above* → the machine continues in use
  - *rated below, or not establishable* → the machine is stopped and the wheel removed before further use
- **PROHIBITED decision claims:**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **evidence that would actually settle it:**
  - the printed maximum operating speed on the wheel read against the machine's spindle speed plate
- **a sufficient clarification must establish:** both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel carries a speed marking -- the text states it does
  - whether blotters are fitted -- the text states they are
  - whether the fitter was trained or competent

**`AC-02-F2`** (`SAFETY_SIGNIFICANT`)

- **owed property:** whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
- **conjuncts, all of which must survive:** “the tongue guard gap is within tolerance for the wheel now fitted”
- **independent of:** AC-02-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: *(none)*
- **essential qualifiers that must survive:**
  - after the wheel change -- the pre-change setting is established and is not the question
- **acceptable branch partition:**
  - the gap is within tolerance for the wheel now fitted
  - the gap is outside tolerance for the wheel now fitted
- **what is done TODAY under each state:**
  - *within tolerance* → the machine continues in use
  - *outside tolerance* → the machine is stopped and the tongue guard reset before further use
- **PROHIBITED decision claims:**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact
- **evidence that would actually settle it:**
  - a measurement of the gap between the wheel periphery and the tongue guard as now set
- **a sufficient clarification must establish:** the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel guards are fitted or closed -- the text states they are
  - whether the work rest gap is correct -- the observation does not raise it

**Frozen temporal / sequence requirements:**

- F2 depends on the sequence: the wheel changed and the guard did not. A statement of the property that loses "after the wheel change" loses the reason it is open.

### 8. Exact observation and supplied context

*maintenance workshop — dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder. Jurisdiction osha-general-industry. Hazard families supplied: machine_guarding, electrical, ppe.*

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

**Established by the text:**

- a new wheel was fitted to the left-hand spindle this morning
- wheel blotters are in place
- the wheel carries a printed maximum operating speed
- both wheel guards are fitted and closed
- the left-hand adjustable tongue guard was not moved after the new wheel was fitted
- the machine is running with an operator at the left-hand wheel

**Not established by the text:**

- the wheel's maximum operating speed and the machine's spindle speed, and therefore whether the wheel is rated for this machine
- the gap between the wheel periphery and the adjustable tongue guard after the wheel change
- the date of the last portable appliance inspection
- the identity of the fitter

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (3):**

- `tongue_guard_adjustment` [machine_guarding] `ACTIVE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - *evidence basis:* The observation states the tongue guard was left in its prior position rather than being readjusted for the new wheel, and that the machine is currently running with an operator dressing a bracket at that wheel.
  - *reasoning:* An adjustable tongue guard must be kept close to the wheel periphery as the wheel diameter changes with wear/replacement; leaving it in the position set for the old wheel means the gap between the guard and a new (larger-diameter, less-worn) wheel is likely wider than intended, increasing the opening through which a hand or wheel fragment could pass, at the exact wheel currently in use for dressing.
- `unverified_wheel_speed_match` [machine_guarding] `INSUFFICIENT_EVIDENCE` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - *evidence basis:* The observation states only that the wheel's marked maximum speed could not be read from the inspector's position and that the spindle speed plate is located elsewhere on the housing; it does not state whether the two figures were compared or what either value is.
  - *reasoning:* A grinding wheel operated above its rated maximum speed can burst; whether the newly fitted wheel's rated speed meets or exceeds the spindle's operating speed is a basic precondition for safe operation of an abrasive wheel and cannot be confirmed from what was observed.
- `pat_label_date_worn` [electrical] `UNKNOWN` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “The portable appliance inspection label on the machine flex is present but its date has worn off”
  - *evidence basis:* The observation states the inspection label is present on the flex but its date is no longer legible.
  - *reasoning:* Without a legible date, it cannot be determined from this label whether the flex/appliance is within a current inspection interval, which is relevant to electrical safety of the flexible cable supplying the grinder.

**Produced declaration `decl_wheel_speed`**

- **missingFact (verbatim):** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **notEstablishedBecause:** The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
- **whyNecessaryNow:** The grinder is currently running with an operator actively dressing a bracket at this wheel, so an overspeed condition would present an immediate risk of wheel failure during ongoing use.

**Produced declaration `decl_guard_clearance`**

- **missingFact (verbatim):** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **notEstablishedBecause:** The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
- **whyNecessaryNow:** The machine is currently in use with an operator dressing a bracket at the left-hand wheel, so an excessive guard gap would present an immediate exposure to the wheel or to ejected fragments during ongoing work.

**Clarifications the model asked (2):**

- `q_wheel_speed_rating` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_wheel_speed`
  - *question (verbatim):* “Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?”
  - *why it matters:* If the wheel's rated maximum speed is at or above the spindle speed, the wheel is correctly matched and safe to run; if the wheel's rated speed is below the spindle speed, the wheel is at risk of bursting during use and the machine must be stopped until a correctly rated wheel is fitted.
  - *evidence gap:* Neither the wheel's marked maximum speed nor the spindle speed value was legible/read, and no comparison between them is stated.
- `q_tongue_guard_gap` [REQUIRED_CONTROL, BLOCKING]
  - *question (verbatim):* “Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?”
  - *why it matters:* If the guard has been adjusted to the correct clearance for the new wheel, the guarding is adequate and no corrective action is needed; if it has not, the gap between guard and wheel may exceed the safe clearance, exposing the operator's hands to the wheel or to ejected fragments during the dressing operation currently underway, and the machine should be stopped and the guard adjusted before further use.
  - *evidence gap:* The observation states the tongue guard was left in the position set for the previous wheel, without stating whether its clearance to the new wheel has since been verified or adjusted.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_wheel_speed` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - `whyUnresolved`: The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
  - `branchA`: the wheel's rated maximum speed is at or above the spindle speed
  - `branchB`: the wheel's rated maximum speed is below the spindle speed
  - `decisionDivergence.ifA`: the wheel is correctly rated for this spindle and no speed-related corrective action is needed
  - `decisionDivergence.ifB`: the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_guard_clearance` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - `whyUnresolved`: The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
  - `branchA`: the guard position was checked and still provides the correct minimum clearance to the new wheel
  - `branchB`: the guard position was not checked and now provides excess clearance to the new wheel
  - `decisionDivergence.ifA`: the guarding is adequate as currently set and no adjustment is required
  - `decisionDivergence.ifB`: the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** (declaration `decl_wheel_speed`, ordinal 3, candidates supplied 3)

- **verdict:** `ADD_OR_REPLACE_CLARIFICATION`
- **rationale (verbatim):** The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` → `CHALLENGE_FACT_VALIDITY`
  - *challengeReason (verbatim):* This fact is already fully reached by a question the first pass asked: 'Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?' That question's two possible answers map exactly onto the two branches given for this fact (rated speed at/above spindle speed vs. below), so an answer to the asked question settles this fact completely. It should not require a separate or replacement clarification.
- **v3.3 admission:** NOT ADMITTED — codes: PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION
  - detail: ADD_OR_REPLACE must carry a clarification · ADD_OR_REPLACE must declare its source mode
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** (declaration `decl_guard_clearance`, ordinal 4, candidates supplied 3)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-02-F1`**

- the comparison of two figures, not the presence of a marking -- the marking is established

**`AC-02-F2`**

- after the wheel change -- the pre-change setting is established and is not the question

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-02-T1` — whether the portable appliance inspection is in date.** the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-02-F1`**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **`AC-02-F2`**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis A FIRST_PASS_GAP_RECALL, verbatim:*

- **what bears on it:** the observation text, what it establishes, what it leaves open. A fact is decision-critical only if two materially different answers lead to two different CURRENT outcomes.
- **CORRECT when:** every gap the text genuinely leaves open, and that changes what is done today, was declared
- **PARTIALLY_CORRECT when:** some but not all such gaps were declared
- **INCORRECT when:** a gap that changes what is done today was not declared at all
- **must NOT influence the verdict:** whether the count matches the preregistered range; how well written the declaration is

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `7c27544ef25d72e80bced7d00303d145998f9963a8a9ac7985ed4ebcb86c838c`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `5ade6b237808ee5d98066ff2d341e22a06bbbf224c8a4492396deb994ca526f8`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-02.ROW.A | <VERDICT> | <your reason>
```

---

## SLOT 16 of 177 — `AC-02.ROW.B`

### 1. Slot identity

- **slotId:** `AC-02.ROW.B`
- **kind:** `ROW_AXIS`

### 2. Case

- **caseId:** `AC-02` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** maintenance workshop
- **task:** dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** machine_guarding, electrical, ppe
- **case purpose (frozen):** F1 with a precision guard: three unresolved things, of which exactly two are decision-critical. Tests enumeration without rewarding a coverage habit.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, THRESHOLD_IS_NOT_A_GAP

### 3. Axis / judgment name

- **axis:** `B` — **FIRST_PASS_GAP_PRECISION**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Were unnecessary or already-resolved facts avoided?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** Two decision-critical facts and one real-but-neutral unknown on the same row. A model with a coverage habit declares three; a model that drops the quieter conjunct declares one. Only two is correct.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The wheel fitted this morning is rated for a maximum operating speed at or above the machine's spindle speed.
  - *why:* an over-speeded wheel can burst with a person at the machine now. Rated and not rated lead to opposite actions today.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The adjustable tongue guard is set close enough to the newly fitted wheel to prevent a fragment escaping through the opening.
  - *why:* the wheel changed diameter and the tongue guard did not move, so the gap is open by construction. Within tolerance and outside it lead to different actions today.
- **P3** — `UNRESOLVED`
  - *statement:* The portable appliance inspection is current.
  - *why:* genuinely unknown, but nothing in the observation suggests an electrical defect, and both answers lead to the same thing today: the machine keeps running while a record is chased. Declaring it is an axis-B precision failure, not thoroughness.
- **P4** — `RESOLVED`
  - *statement:* Both wheel guards are fitted and closed.
  - *why:* stated. It is the neighbour that competes with P2.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-02-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
- **conjuncts, all of which must survive:** “the wheel's rated speed is at or above the machine's spindle speed”
- **independent of:** AC-02-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the comparison of two figures, not the presence of a marking -- the marking is established
- **acceptable branch partition:**
  - the wheel is rated at or above the spindle speed
  - the wheel is rated below the spindle speed, or the comparison cannot be made
- **what is done TODAY under each state:**
  - *rated at or above* → the machine continues in use
  - *rated below, or not establishable* → the machine is stopped and the wheel removed before further use
- **PROHIBITED decision claims:**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **evidence that would actually settle it:**
  - the printed maximum operating speed on the wheel read against the machine's spindle speed plate
- **a sufficient clarification must establish:** both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel carries a speed marking -- the text states it does
  - whether blotters are fitted -- the text states they are
  - whether the fitter was trained or competent

**`AC-02-F2`** (`SAFETY_SIGNIFICANT`)

- **owed property:** whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
- **conjuncts, all of which must survive:** “the tongue guard gap is within tolerance for the wheel now fitted”
- **independent of:** AC-02-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: *(none)*
- **essential qualifiers that must survive:**
  - after the wheel change -- the pre-change setting is established and is not the question
- **acceptable branch partition:**
  - the gap is within tolerance for the wheel now fitted
  - the gap is outside tolerance for the wheel now fitted
- **what is done TODAY under each state:**
  - *within tolerance* → the machine continues in use
  - *outside tolerance* → the machine is stopped and the tongue guard reset before further use
- **PROHIBITED decision claims:**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact
- **evidence that would actually settle it:**
  - a measurement of the gap between the wheel periphery and the tongue guard as now set
- **a sufficient clarification must establish:** the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel guards are fitted or closed -- the text states they are
  - whether the work rest gap is correct -- the observation does not raise it

**Frozen temporal / sequence requirements:**

- F2 depends on the sequence: the wheel changed and the guard did not. A statement of the property that loses "after the wheel change" loses the reason it is open.

### 8. Exact observation and supplied context

*maintenance workshop — dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder. Jurisdiction osha-general-industry. Hazard families supplied: machine_guarding, electrical, ppe.*

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

**Established by the text:**

- a new wheel was fitted to the left-hand spindle this morning
- wheel blotters are in place
- the wheel carries a printed maximum operating speed
- both wheel guards are fitted and closed
- the left-hand adjustable tongue guard was not moved after the new wheel was fitted
- the machine is running with an operator at the left-hand wheel

**Not established by the text:**

- the wheel's maximum operating speed and the machine's spindle speed, and therefore whether the wheel is rated for this machine
- the gap between the wheel periphery and the adjustable tongue guard after the wheel change
- the date of the last portable appliance inspection
- the identity of the fitter

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (3):**

- `tongue_guard_adjustment` [machine_guarding] `ACTIVE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - *evidence basis:* The observation states the tongue guard was left in its prior position rather than being readjusted for the new wheel, and that the machine is currently running with an operator dressing a bracket at that wheel.
  - *reasoning:* An adjustable tongue guard must be kept close to the wheel periphery as the wheel diameter changes with wear/replacement; leaving it in the position set for the old wheel means the gap between the guard and a new (larger-diameter, less-worn) wheel is likely wider than intended, increasing the opening through which a hand or wheel fragment could pass, at the exact wheel currently in use for dressing.
- `unverified_wheel_speed_match` [machine_guarding] `INSUFFICIENT_EVIDENCE` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - *evidence basis:* The observation states only that the wheel's marked maximum speed could not be read from the inspector's position and that the spindle speed plate is located elsewhere on the housing; it does not state whether the two figures were compared or what either value is.
  - *reasoning:* A grinding wheel operated above its rated maximum speed can burst; whether the newly fitted wheel's rated speed meets or exceeds the spindle's operating speed is a basic precondition for safe operation of an abrasive wheel and cannot be confirmed from what was observed.
- `pat_label_date_worn` [electrical] `UNKNOWN` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “The portable appliance inspection label on the machine flex is present but its date has worn off”
  - *evidence basis:* The observation states the inspection label is present on the flex but its date is no longer legible.
  - *reasoning:* Without a legible date, it cannot be determined from this label whether the flex/appliance is within a current inspection interval, which is relevant to electrical safety of the flexible cable supplying the grinder.

**Produced declaration `decl_wheel_speed`**

- **missingFact (verbatim):** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **notEstablishedBecause:** The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
- **whyNecessaryNow:** The grinder is currently running with an operator actively dressing a bracket at this wheel, so an overspeed condition would present an immediate risk of wheel failure during ongoing use.

**Produced declaration `decl_guard_clearance`**

- **missingFact (verbatim):** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **notEstablishedBecause:** The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
- **whyNecessaryNow:** The machine is currently in use with an operator dressing a bracket at the left-hand wheel, so an excessive guard gap would present an immediate exposure to the wheel or to ejected fragments during ongoing work.

**Clarifications the model asked (2):**

- `q_wheel_speed_rating` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_wheel_speed`
  - *question (verbatim):* “Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?”
  - *why it matters:* If the wheel's rated maximum speed is at or above the spindle speed, the wheel is correctly matched and safe to run; if the wheel's rated speed is below the spindle speed, the wheel is at risk of bursting during use and the machine must be stopped until a correctly rated wheel is fitted.
  - *evidence gap:* Neither the wheel's marked maximum speed nor the spindle speed value was legible/read, and no comparison between them is stated.
- `q_tongue_guard_gap` [REQUIRED_CONTROL, BLOCKING]
  - *question (verbatim):* “Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?”
  - *why it matters:* If the guard has been adjusted to the correct clearance for the new wheel, the guarding is adequate and no corrective action is needed; if it has not, the gap between guard and wheel may exceed the safe clearance, exposing the operator's hands to the wheel or to ejected fragments during the dressing operation currently underway, and the machine should be stopped and the guard adjusted before further use.
  - *evidence gap:* The observation states the tongue guard was left in the position set for the previous wheel, without stating whether its clearance to the new wheel has since been verified or adjusted.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_wheel_speed` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - `whyUnresolved`: The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
  - `branchA`: the wheel's rated maximum speed is at or above the spindle speed
  - `branchB`: the wheel's rated maximum speed is below the spindle speed
  - `decisionDivergence.ifA`: the wheel is correctly rated for this spindle and no speed-related corrective action is needed
  - `decisionDivergence.ifB`: the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_guard_clearance` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - `whyUnresolved`: The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
  - `branchA`: the guard position was checked and still provides the correct minimum clearance to the new wheel
  - `branchB`: the guard position was not checked and now provides excess clearance to the new wheel
  - `decisionDivergence.ifA`: the guarding is adequate as currently set and no adjustment is required
  - `decisionDivergence.ifB`: the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** (declaration `decl_wheel_speed`, ordinal 3, candidates supplied 3)

- **verdict:** `ADD_OR_REPLACE_CLARIFICATION`
- **rationale (verbatim):** The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` → `CHALLENGE_FACT_VALIDITY`
  - *challengeReason (verbatim):* This fact is already fully reached by a question the first pass asked: 'Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?' That question's two possible answers map exactly onto the two branches given for this fact (rated speed at/above spindle speed vs. below), so an answer to the asked question settles this fact completely. It should not require a separate or replacement clarification.
- **v3.3 admission:** NOT ADMITTED — codes: PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION
  - detail: ADD_OR_REPLACE must carry a clarification · ADD_OR_REPLACE must declare its source mode
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** (declaration `decl_guard_clearance`, ordinal 4, candidates supplied 3)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-02-F1`**

- the comparison of two figures, not the presence of a marking -- the marking is established

**`AC-02-F2`**

- after the wheel change -- the pre-change setting is established and is not the question

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-02-T1` — whether the portable appliance inspection is in date.** the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-02-F1`**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **`AC-02-F2`**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis B FIRST_PASS_GAP_PRECISION, verbatim:*

- **what bears on it:** whether each declared fact is genuinely open in the text AND genuinely changes today's action
- **CORRECT when:** no declared fact is already established by the text and none is decision-neutral
- **PARTIALLY_CORRECT when:** one of several declarations is unnecessary
- **INCORRECT when:** a declared fact is answered by the text, or both its answers lead to the same action today
- **must NOT influence the verdict:** whether asking anyway would be harmless or good practice

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `7c27544ef25d72e80bced7d00303d145998f9963a8a9ac7985ed4ebcb86c838c`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `5ade6b237808ee5d98066ff2d341e22a06bbbf224c8a4492396deb994ca526f8`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-02.ROW.B | <VERDICT> | <your reason>
```

---

## SLOT 17 of 177 — `AC-02.ROW.H`

### 1. Slot identity

- **slotId:** `AC-02.ROW.H`
- **kind:** `ROW_AXIS`

### 2. Case

- **caseId:** `AC-02` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** maintenance workshop
- **task:** dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** machine_guarding, electrical, ppe
- **case purpose (frozen):** F1 with a precision guard: three unresolved things, of which exactly two are decision-critical. Tests enumeration without rewarding a coverage habit.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, THRESHOLD_IS_NOT_A_GAP

### 3. Axis / judgment name

- **axis:** `H` — **MULTI_GAP_PRESERVATION**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Do independent gaps survive INDEPENDENTLY?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** Two decision-critical facts and one real-but-neutral unknown on the same row. A model with a coverage habit declares three; a model that drops the quieter conjunct declares one. Only two is correct.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The wheel fitted this morning is rated for a maximum operating speed at or above the machine's spindle speed.
  - *why:* an over-speeded wheel can burst with a person at the machine now. Rated and not rated lead to opposite actions today.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The adjustable tongue guard is set close enough to the newly fitted wheel to prevent a fragment escaping through the opening.
  - *why:* the wheel changed diameter and the tongue guard did not move, so the gap is open by construction. Within tolerance and outside it lead to different actions today.
- **P3** — `UNRESOLVED`
  - *statement:* The portable appliance inspection is current.
  - *why:* genuinely unknown, but nothing in the observation suggests an electrical defect, and both answers lead to the same thing today: the machine keeps running while a record is chased. Declaring it is an axis-B precision failure, not thoroughness.
- **P4** — `RESOLVED`
  - *statement:* Both wheel guards are fitted and closed.
  - *why:* stated. It is the neighbour that competes with P2.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-02-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
- **conjuncts, all of which must survive:** “the wheel's rated speed is at or above the machine's spindle speed”
- **independent of:** AC-02-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the comparison of two figures, not the presence of a marking -- the marking is established
- **acceptable branch partition:**
  - the wheel is rated at or above the spindle speed
  - the wheel is rated below the spindle speed, or the comparison cannot be made
- **what is done TODAY under each state:**
  - *rated at or above* → the machine continues in use
  - *rated below, or not establishable* → the machine is stopped and the wheel removed before further use
- **PROHIBITED decision claims:**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **evidence that would actually settle it:**
  - the printed maximum operating speed on the wheel read against the machine's spindle speed plate
- **a sufficient clarification must establish:** both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel carries a speed marking -- the text states it does
  - whether blotters are fitted -- the text states they are
  - whether the fitter was trained or competent

**`AC-02-F2`** (`SAFETY_SIGNIFICANT`)

- **owed property:** whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
- **conjuncts, all of which must survive:** “the tongue guard gap is within tolerance for the wheel now fitted”
- **independent of:** AC-02-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: *(none)*
- **essential qualifiers that must survive:**
  - after the wheel change -- the pre-change setting is established and is not the question
- **acceptable branch partition:**
  - the gap is within tolerance for the wheel now fitted
  - the gap is outside tolerance for the wheel now fitted
- **what is done TODAY under each state:**
  - *within tolerance* → the machine continues in use
  - *outside tolerance* → the machine is stopped and the tongue guard reset before further use
- **PROHIBITED decision claims:**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact
- **evidence that would actually settle it:**
  - a measurement of the gap between the wheel periphery and the tongue guard as now set
- **a sufficient clarification must establish:** the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel guards are fitted or closed -- the text states they are
  - whether the work rest gap is correct -- the observation does not raise it

**Frozen temporal / sequence requirements:**

- F2 depends on the sequence: the wheel changed and the guard did not. A statement of the property that loses "after the wheel change" loses the reason it is open.

### 8. Exact observation and supplied context

*maintenance workshop — dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder. Jurisdiction osha-general-industry. Hazard families supplied: machine_guarding, electrical, ppe.*

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

**Established by the text:**

- a new wheel was fitted to the left-hand spindle this morning
- wheel blotters are in place
- the wheel carries a printed maximum operating speed
- both wheel guards are fitted and closed
- the left-hand adjustable tongue guard was not moved after the new wheel was fitted
- the machine is running with an operator at the left-hand wheel

**Not established by the text:**

- the wheel's maximum operating speed and the machine's spindle speed, and therefore whether the wheel is rated for this machine
- the gap between the wheel periphery and the adjustable tongue guard after the wheel change
- the date of the last portable appliance inspection
- the identity of the fitter

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (3):**

- `tongue_guard_adjustment` [machine_guarding] `ACTIVE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - *evidence basis:* The observation states the tongue guard was left in its prior position rather than being readjusted for the new wheel, and that the machine is currently running with an operator dressing a bracket at that wheel.
  - *reasoning:* An adjustable tongue guard must be kept close to the wheel periphery as the wheel diameter changes with wear/replacement; leaving it in the position set for the old wheel means the gap between the guard and a new (larger-diameter, less-worn) wheel is likely wider than intended, increasing the opening through which a hand or wheel fragment could pass, at the exact wheel currently in use for dressing.
- `unverified_wheel_speed_match` [machine_guarding] `INSUFFICIENT_EVIDENCE` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - *evidence basis:* The observation states only that the wheel's marked maximum speed could not be read from the inspector's position and that the spindle speed plate is located elsewhere on the housing; it does not state whether the two figures were compared or what either value is.
  - *reasoning:* A grinding wheel operated above its rated maximum speed can burst; whether the newly fitted wheel's rated speed meets or exceeds the spindle's operating speed is a basic precondition for safe operation of an abrasive wheel and cannot be confirmed from what was observed.
- `pat_label_date_worn` [electrical] `UNKNOWN` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “The portable appliance inspection label on the machine flex is present but its date has worn off”
  - *evidence basis:* The observation states the inspection label is present on the flex but its date is no longer legible.
  - *reasoning:* Without a legible date, it cannot be determined from this label whether the flex/appliance is within a current inspection interval, which is relevant to electrical safety of the flexible cable supplying the grinder.

**Produced declaration `decl_wheel_speed`**

- **missingFact (verbatim):** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **notEstablishedBecause:** The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
- **whyNecessaryNow:** The grinder is currently running with an operator actively dressing a bracket at this wheel, so an overspeed condition would present an immediate risk of wheel failure during ongoing use.

**Produced declaration `decl_guard_clearance`**

- **missingFact (verbatim):** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **notEstablishedBecause:** The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
- **whyNecessaryNow:** The machine is currently in use with an operator dressing a bracket at the left-hand wheel, so an excessive guard gap would present an immediate exposure to the wheel or to ejected fragments during ongoing work.

**Clarifications the model asked (2):**

- `q_wheel_speed_rating` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_wheel_speed`
  - *question (verbatim):* “Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?”
  - *why it matters:* If the wheel's rated maximum speed is at or above the spindle speed, the wheel is correctly matched and safe to run; if the wheel's rated speed is below the spindle speed, the wheel is at risk of bursting during use and the machine must be stopped until a correctly rated wheel is fitted.
  - *evidence gap:* Neither the wheel's marked maximum speed nor the spindle speed value was legible/read, and no comparison between them is stated.
- `q_tongue_guard_gap` [REQUIRED_CONTROL, BLOCKING]
  - *question (verbatim):* “Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?”
  - *why it matters:* If the guard has been adjusted to the correct clearance for the new wheel, the guarding is adequate and no corrective action is needed; if it has not, the gap between guard and wheel may exceed the safe clearance, exposing the operator's hands to the wheel or to ejected fragments during the dressing operation currently underway, and the machine should be stopped and the guard adjusted before further use.
  - *evidence gap:* The observation states the tongue guard was left in the position set for the previous wheel, without stating whether its clearance to the new wheel has since been verified or adjusted.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_wheel_speed` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - `whyUnresolved`: The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
  - `branchA`: the wheel's rated maximum speed is at or above the spindle speed
  - `branchB`: the wheel's rated maximum speed is below the spindle speed
  - `decisionDivergence.ifA`: the wheel is correctly rated for this spindle and no speed-related corrective action is needed
  - `decisionDivergence.ifB`: the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_guard_clearance` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - `whyUnresolved`: The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
  - `branchA`: the guard position was checked and still provides the correct minimum clearance to the new wheel
  - `branchB`: the guard position was not checked and now provides excess clearance to the new wheel
  - `decisionDivergence.ifA`: the guarding is adequate as currently set and no adjustment is required
  - `decisionDivergence.ifB`: the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** (declaration `decl_wheel_speed`, ordinal 3, candidates supplied 3)

- **verdict:** `ADD_OR_REPLACE_CLARIFICATION`
- **rationale (verbatim):** The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` → `CHALLENGE_FACT_VALIDITY`
  - *challengeReason (verbatim):* This fact is already fully reached by a question the first pass asked: 'Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?' That question's two possible answers map exactly onto the two branches given for this fact (rated speed at/above spindle speed vs. below), so an answer to the asked question settles this fact completely. It should not require a separate or replacement clarification.
- **v3.3 admission:** NOT ADMITTED — codes: PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION
  - detail: ADD_OR_REPLACE must carry a clarification · ADD_OR_REPLACE must declare its source mode
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** (declaration `decl_guard_clearance`, ordinal 4, candidates supplied 3)

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-02-F1`**

- the comparison of two figures, not the presence of a marking -- the marking is established

**`AC-02-F2`**

- after the wheel change -- the pre-change setting is established and is not the question

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-02-T1` — whether the portable appliance inspection is in date.** the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-02-F1`**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **`AC-02-F2`**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis H MULTI_GAP_PRESERVATION, verbatim:*

- **what bears on it:** whether two declared facts are genuinely different facts, and whether settling one leaves the other open
- **CORRECT when:** each declared fact stands alone and would need its own evidence
- **PARTIALLY_CORRECT when:** both gaps are present but partly conflated
- **INCORRECT when:** two declarations restate one gap, or one declaration silently merges two
- **must NOT influence the verdict:** the structural distinctness of the computed keys — already reported mechanically

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `7c27544ef25d72e80bced7d00303d145998f9963a8a9ac7985ed4ebcb86c838c`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `5ade6b237808ee5d98066ff2d341e22a06bbbf224c8a4492396deb994ca526f8`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-02.ROW.H | <VERDICT> | <your reason>
```

---

## SLOT 18 of 177 — `AC-02.FACT1.C`

### 1. Slot identity

- **slotId:** `AC-02.FACT1.C`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
- **bound declarationId:** `decl_wheel_speed`

### 2. Case

- **caseId:** `AC-02` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** maintenance workshop
- **task:** dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** machine_guarding, electrical, ppe
- **case purpose (frozen):** F1 with a precision guard: three unresolved things, of which exactly two are decision-critical. Tests enumeration without rewarding a coverage habit.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, THRESHOLD_IS_NOT_A_GAP

### 3. Axis / judgment name

- **axis:** `C` — **OWED_PROPERTY_SEMANTIC_CORRECTNESS**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Does this declaration identify the EXACT property that remains unknown?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** Two decision-critical facts and one real-but-neutral unknown on the same row. A model with a coverage habit declares three; a model that drops the quieter conjunct declares one. Only two is correct.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The wheel fitted this morning is rated for a maximum operating speed at or above the machine's spindle speed.
  - *why:* an over-speeded wheel can burst with a person at the machine now. Rated and not rated lead to opposite actions today.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The adjustable tongue guard is set close enough to the newly fitted wheel to prevent a fragment escaping through the opening.
  - *why:* the wheel changed diameter and the tongue guard did not move, so the gap is open by construction. Within tolerance and outside it lead to different actions today.
- **P3** — `UNRESOLVED`
  - *statement:* The portable appliance inspection is current.
  - *why:* genuinely unknown, but nothing in the observation suggests an electrical defect, and both answers lead to the same thing today: the machine keeps running while a record is chased. Declaring it is an axis-B precision failure, not thoroughness.
- **P4** — `RESOLVED`
  - *statement:* Both wheel guards are fitted and closed.
  - *why:* stated. It is the neighbour that competes with P2.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-02-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
- **conjuncts, all of which must survive:** “the wheel's rated speed is at or above the machine's spindle speed”
- **independent of:** AC-02-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the comparison of two figures, not the presence of a marking -- the marking is established
- **acceptable branch partition:**
  - the wheel is rated at or above the spindle speed
  - the wheel is rated below the spindle speed, or the comparison cannot be made
- **what is done TODAY under each state:**
  - *rated at or above* → the machine continues in use
  - *rated below, or not establishable* → the machine is stopped and the wheel removed before further use
- **PROHIBITED decision claims:**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **evidence that would actually settle it:**
  - the printed maximum operating speed on the wheel read against the machine's spindle speed plate
- **a sufficient clarification must establish:** both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel carries a speed marking -- the text states it does
  - whether blotters are fitted -- the text states they are
  - whether the fitter was trained or competent

**`AC-02-F2`** (`SAFETY_SIGNIFICANT`)

- **owed property:** whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
- **conjuncts, all of which must survive:** “the tongue guard gap is within tolerance for the wheel now fitted”
- **independent of:** AC-02-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: *(none)*
- **essential qualifiers that must survive:**
  - after the wheel change -- the pre-change setting is established and is not the question
- **acceptable branch partition:**
  - the gap is within tolerance for the wheel now fitted
  - the gap is outside tolerance for the wheel now fitted
- **what is done TODAY under each state:**
  - *within tolerance* → the machine continues in use
  - *outside tolerance* → the machine is stopped and the tongue guard reset before further use
- **PROHIBITED decision claims:**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact
- **evidence that would actually settle it:**
  - a measurement of the gap between the wheel periphery and the tongue guard as now set
- **a sufficient clarification must establish:** the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel guards are fitted or closed -- the text states they are
  - whether the work rest gap is correct -- the observation does not raise it

**Frozen temporal / sequence requirements:**

- F2 depends on the sequence: the wheel changed and the guard did not. A statement of the property that loses "after the wheel change" loses the reason it is open.

### 8. Exact observation and supplied context

*maintenance workshop — dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder. Jurisdiction osha-general-industry. Hazard families supplied: machine_guarding, electrical, ppe.*

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

**Established by the text:**

- a new wheel was fitted to the left-hand spindle this morning
- wheel blotters are in place
- the wheel carries a printed maximum operating speed
- both wheel guards are fitted and closed
- the left-hand adjustable tongue guard was not moved after the new wheel was fitted
- the machine is running with an operator at the left-hand wheel

**Not established by the text:**

- the wheel's maximum operating speed and the machine's spindle speed, and therefore whether the wheel is rated for this machine
- the gap between the wheel periphery and the adjustable tongue guard after the wheel change
- the date of the last portable appliance inspection
- the identity of the fitter

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (3):**

- `tongue_guard_adjustment` [machine_guarding] `ACTIVE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - *evidence basis:* The observation states the tongue guard was left in its prior position rather than being readjusted for the new wheel, and that the machine is currently running with an operator dressing a bracket at that wheel.
  - *reasoning:* An adjustable tongue guard must be kept close to the wheel periphery as the wheel diameter changes with wear/replacement; leaving it in the position set for the old wheel means the gap between the guard and a new (larger-diameter, less-worn) wheel is likely wider than intended, increasing the opening through which a hand or wheel fragment could pass, at the exact wheel currently in use for dressing.
- `unverified_wheel_speed_match` [machine_guarding] `INSUFFICIENT_EVIDENCE` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - *evidence basis:* The observation states only that the wheel's marked maximum speed could not be read from the inspector's position and that the spindle speed plate is located elsewhere on the housing; it does not state whether the two figures were compared or what either value is.
  - *reasoning:* A grinding wheel operated above its rated maximum speed can burst; whether the newly fitted wheel's rated speed meets or exceeds the spindle's operating speed is a basic precondition for safe operation of an abrasive wheel and cannot be confirmed from what was observed.
- `pat_label_date_worn` [electrical] `UNKNOWN` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “The portable appliance inspection label on the machine flex is present but its date has worn off”
  - *evidence basis:* The observation states the inspection label is present on the flex but its date is no longer legible.
  - *reasoning:* Without a legible date, it cannot be determined from this label whether the flex/appliance is within a current inspection interval, which is relevant to electrical safety of the flexible cable supplying the grinder.

**Produced declaration `decl_wheel_speed`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **notEstablishedBecause:** The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
- **whyNecessaryNow:** The grinder is currently running with an operator actively dressing a bracket at this wheel, so an overspeed condition would present an immediate risk of wheel failure during ongoing use.

**Produced declaration `decl_guard_clearance`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **notEstablishedBecause:** The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
- **whyNecessaryNow:** The machine is currently in use with an operator dressing a bracket at the left-hand wheel, so an excessive guard gap would present an immediate exposure to the wheel or to ejected fragments during ongoing work.

**Clarifications the model asked (2):**

- `q_wheel_speed_rating` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_wheel_speed`
  - *question (verbatim):* “Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?”
  - *why it matters:* If the wheel's rated maximum speed is at or above the spindle speed, the wheel is correctly matched and safe to run; if the wheel's rated speed is below the spindle speed, the wheel is at risk of bursting during use and the machine must be stopped until a correctly rated wheel is fitted.
  - *evidence gap:* Neither the wheel's marked maximum speed nor the spindle speed value was legible/read, and no comparison between them is stated.
- `q_tongue_guard_gap` [REQUIRED_CONTROL, BLOCKING]
  - *question (verbatim):* “Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?”
  - *why it matters:* If the guard has been adjusted to the correct clearance for the new wheel, the guarding is adequate and no corrective action is needed; if it has not, the gap between guard and wheel may exceed the safe clearance, exposing the operator's hands to the wheel or to ejected fragments during the dressing operation currently underway, and the machine should be stopped and the guard adjusted before further use.
  - *evidence gap:* The observation states the tongue guard was left in the position set for the previous wheel, without stating whether its clearance to the new wheel has since been verified or adjusted.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_wheel_speed` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - `whyUnresolved`: The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
  - `branchA`: the wheel's rated maximum speed is at or above the spindle speed
  - `branchB`: the wheel's rated maximum speed is below the spindle speed
  - `decisionDivergence.ifA`: the wheel is correctly rated for this spindle and no speed-related corrective action is needed
  - `decisionDivergence.ifB`: the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_guard_clearance` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - `whyUnresolved`: The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
  - `branchA`: the guard position was checked and still provides the correct minimum clearance to the new wheel
  - `branchB`: the guard position was not checked and now provides excess clearance to the new wheel
  - `decisionDivergence.ifA`: the guarding is adequate as currently set and no adjustment is required
  - `decisionDivergence.ifB`: the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** (declaration `decl_wheel_speed`, ordinal 3, candidates supplied 3) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `ADD_OR_REPLACE_CLARIFICATION`
- **rationale (verbatim):** The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` → `CHALLENGE_FACT_VALIDITY`
  - *challengeReason (verbatim):* This fact is already fully reached by a question the first pass asked: 'Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?' That question's two possible answers map exactly onto the two branches given for this fact (rated speed at/above spindle speed vs. below), so an answer to the asked question settles this fact completely. It should not require a separate or replacement clarification.
- **v3.3 admission:** NOT ADMITTED — codes: PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION
  - detail: ADD_OR_REPLACE must carry a clarification · ADD_OR_REPLACE must declare its source mode
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** (declaration `decl_guard_clearance`, ordinal 4, candidates supplied 3) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-02-F1`**

- the comparison of two figures, not the presence of a marking -- the marking is established

**`AC-02-F2`**

- after the wheel change -- the pre-change setting is established and is not the question

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-02-T1` — whether the portable appliance inspection is in date.** the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-02-F1`**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **`AC-02-F2`**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis C OWED_PROPERTY_SEMANTIC_CORRECTNESS, verbatim:*

- **CORRECT when:** the property named is the one the text leaves open
- **PARTIALLY_CORRECT when:** the property is in the right area but stated more narrowly or more broadly than the open question
- **INCORRECT when:** the property named is a NEIGHBOUR the text already establishes — presence for securement, appearance for function, repair for verification
- **must NOT influence the verdict:** that OwedFact has no dedicated field for the property; score from missingFact and the whole declaration

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `7c27544ef25d72e80bced7d00303d145998f9963a8a9ac7985ed4ebcb86c838c`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `5ade6b237808ee5d98066ff2d341e22a06bbbf224c8a4492396deb994ca526f8`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-02.FACT1.C | <VERDICT> | <your reason>
```

---

## SLOT 19 of 177 — `AC-02.FACT1.E`

### 1. Slot identity

- **slotId:** `AC-02.FACT1.E`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
- **bound declarationId:** `decl_wheel_speed`

### 2. Case

- **caseId:** `AC-02` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** maintenance workshop
- **task:** dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** machine_guarding, electrical, ppe
- **case purpose (frozen):** F1 with a precision guard: three unresolved things, of which exactly two are decision-critical. Tests enumeration without rewarding a coverage habit.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, THRESHOLD_IS_NOT_A_GAP

### 3. Axis / judgment name

- **axis:** `E` — **BRANCH_PLAUSIBILITY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Are branchA and branchB genuinely possible resolutions of THIS exact fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** Two decision-critical facts and one real-but-neutral unknown on the same row. A model with a coverage habit declares three; a model that drops the quieter conjunct declares one. Only two is correct.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The wheel fitted this morning is rated for a maximum operating speed at or above the machine's spindle speed.
  - *why:* an over-speeded wheel can burst with a person at the machine now. Rated and not rated lead to opposite actions today.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The adjustable tongue guard is set close enough to the newly fitted wheel to prevent a fragment escaping through the opening.
  - *why:* the wheel changed diameter and the tongue guard did not move, so the gap is open by construction. Within tolerance and outside it lead to different actions today.
- **P3** — `UNRESOLVED`
  - *statement:* The portable appliance inspection is current.
  - *why:* genuinely unknown, but nothing in the observation suggests an electrical defect, and both answers lead to the same thing today: the machine keeps running while a record is chased. Declaring it is an axis-B precision failure, not thoroughness.
- **P4** — `RESOLVED`
  - *statement:* Both wheel guards are fitted and closed.
  - *why:* stated. It is the neighbour that competes with P2.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-02-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
- **conjuncts, all of which must survive:** “the wheel's rated speed is at or above the machine's spindle speed”
- **independent of:** AC-02-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the comparison of two figures, not the presence of a marking -- the marking is established
- **acceptable branch partition:**
  - the wheel is rated at or above the spindle speed
  - the wheel is rated below the spindle speed, or the comparison cannot be made
- **what is done TODAY under each state:**
  - *rated at or above* → the machine continues in use
  - *rated below, or not establishable* → the machine is stopped and the wheel removed before further use
- **PROHIBITED decision claims:**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **evidence that would actually settle it:**
  - the printed maximum operating speed on the wheel read against the machine's spindle speed plate
- **a sufficient clarification must establish:** both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel carries a speed marking -- the text states it does
  - whether blotters are fitted -- the text states they are
  - whether the fitter was trained or competent

**`AC-02-F2`** (`SAFETY_SIGNIFICANT`)

- **owed property:** whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
- **conjuncts, all of which must survive:** “the tongue guard gap is within tolerance for the wheel now fitted”
- **independent of:** AC-02-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: *(none)*
- **essential qualifiers that must survive:**
  - after the wheel change -- the pre-change setting is established and is not the question
- **acceptable branch partition:**
  - the gap is within tolerance for the wheel now fitted
  - the gap is outside tolerance for the wheel now fitted
- **what is done TODAY under each state:**
  - *within tolerance* → the machine continues in use
  - *outside tolerance* → the machine is stopped and the tongue guard reset before further use
- **PROHIBITED decision claims:**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact
- **evidence that would actually settle it:**
  - a measurement of the gap between the wheel periphery and the tongue guard as now set
- **a sufficient clarification must establish:** the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel guards are fitted or closed -- the text states they are
  - whether the work rest gap is correct -- the observation does not raise it

**Frozen temporal / sequence requirements:**

- F2 depends on the sequence: the wheel changed and the guard did not. A statement of the property that loses "after the wheel change" loses the reason it is open.

### 8. Exact observation and supplied context

*maintenance workshop — dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder. Jurisdiction osha-general-industry. Hazard families supplied: machine_guarding, electrical, ppe.*

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

**Established by the text:**

- a new wheel was fitted to the left-hand spindle this morning
- wheel blotters are in place
- the wheel carries a printed maximum operating speed
- both wheel guards are fitted and closed
- the left-hand adjustable tongue guard was not moved after the new wheel was fitted
- the machine is running with an operator at the left-hand wheel

**Not established by the text:**

- the wheel's maximum operating speed and the machine's spindle speed, and therefore whether the wheel is rated for this machine
- the gap between the wheel periphery and the adjustable tongue guard after the wheel change
- the date of the last portable appliance inspection
- the identity of the fitter

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (3):**

- `tongue_guard_adjustment` [machine_guarding] `ACTIVE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - *evidence basis:* The observation states the tongue guard was left in its prior position rather than being readjusted for the new wheel, and that the machine is currently running with an operator dressing a bracket at that wheel.
  - *reasoning:* An adjustable tongue guard must be kept close to the wheel periphery as the wheel diameter changes with wear/replacement; leaving it in the position set for the old wheel means the gap between the guard and a new (larger-diameter, less-worn) wheel is likely wider than intended, increasing the opening through which a hand or wheel fragment could pass, at the exact wheel currently in use for dressing.
- `unverified_wheel_speed_match` [machine_guarding] `INSUFFICIENT_EVIDENCE` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - *evidence basis:* The observation states only that the wheel's marked maximum speed could not be read from the inspector's position and that the spindle speed plate is located elsewhere on the housing; it does not state whether the two figures were compared or what either value is.
  - *reasoning:* A grinding wheel operated above its rated maximum speed can burst; whether the newly fitted wheel's rated speed meets or exceeds the spindle's operating speed is a basic precondition for safe operation of an abrasive wheel and cannot be confirmed from what was observed.
- `pat_label_date_worn` [electrical] `UNKNOWN` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “The portable appliance inspection label on the machine flex is present but its date has worn off”
  - *evidence basis:* The observation states the inspection label is present on the flex but its date is no longer legible.
  - *reasoning:* Without a legible date, it cannot be determined from this label whether the flex/appliance is within a current inspection interval, which is relevant to electrical safety of the flexible cable supplying the grinder.

**Produced declaration `decl_wheel_speed`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **notEstablishedBecause:** The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
- **whyNecessaryNow:** The grinder is currently running with an operator actively dressing a bracket at this wheel, so an overspeed condition would present an immediate risk of wheel failure during ongoing use.

**Produced declaration `decl_guard_clearance`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **notEstablishedBecause:** The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
- **whyNecessaryNow:** The machine is currently in use with an operator dressing a bracket at the left-hand wheel, so an excessive guard gap would present an immediate exposure to the wheel or to ejected fragments during ongoing work.

**Clarifications the model asked (2):**

- `q_wheel_speed_rating` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_wheel_speed`
  - *question (verbatim):* “Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?”
  - *why it matters:* If the wheel's rated maximum speed is at or above the spindle speed, the wheel is correctly matched and safe to run; if the wheel's rated speed is below the spindle speed, the wheel is at risk of bursting during use and the machine must be stopped until a correctly rated wheel is fitted.
  - *evidence gap:* Neither the wheel's marked maximum speed nor the spindle speed value was legible/read, and no comparison between them is stated.
- `q_tongue_guard_gap` [REQUIRED_CONTROL, BLOCKING]
  - *question (verbatim):* “Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?”
  - *why it matters:* If the guard has been adjusted to the correct clearance for the new wheel, the guarding is adequate and no corrective action is needed; if it has not, the gap between guard and wheel may exceed the safe clearance, exposing the operator's hands to the wheel or to ejected fragments during the dressing operation currently underway, and the machine should be stopped and the guard adjusted before further use.
  - *evidence gap:* The observation states the tongue guard was left in the position set for the previous wheel, without stating whether its clearance to the new wheel has since been verified or adjusted.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_wheel_speed` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - `whyUnresolved`: The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
  - `branchA`: the wheel's rated maximum speed is at or above the spindle speed
  - `branchB`: the wheel's rated maximum speed is below the spindle speed
  - `decisionDivergence.ifA`: the wheel is correctly rated for this spindle and no speed-related corrective action is needed
  - `decisionDivergence.ifB`: the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_guard_clearance` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - `whyUnresolved`: The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
  - `branchA`: the guard position was checked and still provides the correct minimum clearance to the new wheel
  - `branchB`: the guard position was not checked and now provides excess clearance to the new wheel
  - `decisionDivergence.ifA`: the guarding is adequate as currently set and no adjustment is required
  - `decisionDivergence.ifB`: the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** (declaration `decl_wheel_speed`, ordinal 3, candidates supplied 3) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `ADD_OR_REPLACE_CLARIFICATION`
- **rationale (verbatim):** The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` → `CHALLENGE_FACT_VALIDITY`
  - *challengeReason (verbatim):* This fact is already fully reached by a question the first pass asked: 'Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?' That question's two possible answers map exactly onto the two branches given for this fact (rated speed at/above spindle speed vs. below), so an answer to the asked question settles this fact completely. It should not require a separate or replacement clarification.
- **v3.3 admission:** NOT ADMITTED — codes: PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION
  - detail: ADD_OR_REPLACE must carry a clarification · ADD_OR_REPLACE must declare its source mode
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** (declaration `decl_guard_clearance`, ordinal 4, candidates supplied 3) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-02-F1`**

- the comparison of two figures, not the presence of a marking -- the marking is established

**`AC-02-F2`**

- after the wheel change -- the pre-change setting is established and is not the question

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-02-T1` — whether the portable appliance inspection is in date.** the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-02-F1`**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **`AC-02-F2`**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis E BRANCH_PLAUSIBILITY, verbatim:*

- **CORRECT when:** both branches are real possible STATES OF THE WORLD given the observation
- **PARTIALLY_CORRECT when:** one branch is sound and the other is not
- **INCORRECT when:** a branch is a rhetorical opposite, an invented state the text excludes, or an answer to a different question
- **must NOT influence the verdict:** which branch is more likely

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `7c27544ef25d72e80bced7d00303d145998f9963a8a9ac7985ed4ebcb86c838c`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `5ade6b237808ee5d98066ff2d341e22a06bbbf224c8a4492396deb994ca526f8`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-02.FACT1.E | <VERDICT> | <your reason>
```

---

## SLOT 20 of 177 — `AC-02.FACT1.F`

### 1. Slot identity

- **slotId:** `AC-02.FACT1.F`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
- **bound declarationId:** `decl_wheel_speed`

### 2. Case

- **caseId:** `AC-02` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** maintenance workshop
- **task:** dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** machine_guarding, electrical, ppe
- **case purpose (frozen):** F1 with a precision guard: three unresolved things, of which exactly two are decision-critical. Tests enumeration without rewarding a coverage habit.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, THRESHOLD_IS_NOT_A_GAP

### 3. Axis / judgment name

- **axis:** `F` — **DECISION_DIVERGENCE_VALIDITY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** Two decision-critical facts and one real-but-neutral unknown on the same row. A model with a coverage habit declares three; a model that drops the quieter conjunct declares one. Only two is correct.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The wheel fitted this morning is rated for a maximum operating speed at or above the machine's spindle speed.
  - *why:* an over-speeded wheel can burst with a person at the machine now. Rated and not rated lead to opposite actions today.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The adjustable tongue guard is set close enough to the newly fitted wheel to prevent a fragment escaping through the opening.
  - *why:* the wheel changed diameter and the tongue guard did not move, so the gap is open by construction. Within tolerance and outside it lead to different actions today.
- **P3** — `UNRESOLVED`
  - *statement:* The portable appliance inspection is current.
  - *why:* genuinely unknown, but nothing in the observation suggests an electrical defect, and both answers lead to the same thing today: the machine keeps running while a record is chased. Declaring it is an axis-B precision failure, not thoroughness.
- **P4** — `RESOLVED`
  - *statement:* Both wheel guards are fitted and closed.
  - *why:* stated. It is the neighbour that competes with P2.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-02-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
- **conjuncts, all of which must survive:** “the wheel's rated speed is at or above the machine's spindle speed”
- **independent of:** AC-02-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the comparison of two figures, not the presence of a marking -- the marking is established
- **acceptable branch partition:**
  - the wheel is rated at or above the spindle speed
  - the wheel is rated below the spindle speed, or the comparison cannot be made
- **what is done TODAY under each state:**
  - *rated at or above* → the machine continues in use
  - *rated below, or not establishable* → the machine is stopped and the wheel removed before further use
- **PROHIBITED decision claims:**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **evidence that would actually settle it:**
  - the printed maximum operating speed on the wheel read against the machine's spindle speed plate
- **a sufficient clarification must establish:** both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel carries a speed marking -- the text states it does
  - whether blotters are fitted -- the text states they are
  - whether the fitter was trained or competent

**`AC-02-F2`** (`SAFETY_SIGNIFICANT`)

- **owed property:** whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
- **conjuncts, all of which must survive:** “the tongue guard gap is within tolerance for the wheel now fitted”
- **independent of:** AC-02-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: *(none)*
- **essential qualifiers that must survive:**
  - after the wheel change -- the pre-change setting is established and is not the question
- **acceptable branch partition:**
  - the gap is within tolerance for the wheel now fitted
  - the gap is outside tolerance for the wheel now fitted
- **what is done TODAY under each state:**
  - *within tolerance* → the machine continues in use
  - *outside tolerance* → the machine is stopped and the tongue guard reset before further use
- **PROHIBITED decision claims:**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact
- **evidence that would actually settle it:**
  - a measurement of the gap between the wheel periphery and the tongue guard as now set
- **a sufficient clarification must establish:** the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel guards are fitted or closed -- the text states they are
  - whether the work rest gap is correct -- the observation does not raise it

**Frozen temporal / sequence requirements:**

- F2 depends on the sequence: the wheel changed and the guard did not. A statement of the property that loses "after the wheel change" loses the reason it is open.

### 8. Exact observation and supplied context

*maintenance workshop — dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder. Jurisdiction osha-general-industry. Hazard families supplied: machine_guarding, electrical, ppe.*

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

**Established by the text:**

- a new wheel was fitted to the left-hand spindle this morning
- wheel blotters are in place
- the wheel carries a printed maximum operating speed
- both wheel guards are fitted and closed
- the left-hand adjustable tongue guard was not moved after the new wheel was fitted
- the machine is running with an operator at the left-hand wheel

**Not established by the text:**

- the wheel's maximum operating speed and the machine's spindle speed, and therefore whether the wheel is rated for this machine
- the gap between the wheel periphery and the adjustable tongue guard after the wheel change
- the date of the last portable appliance inspection
- the identity of the fitter

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (3):**

- `tongue_guard_adjustment` [machine_guarding] `ACTIVE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - *evidence basis:* The observation states the tongue guard was left in its prior position rather than being readjusted for the new wheel, and that the machine is currently running with an operator dressing a bracket at that wheel.
  - *reasoning:* An adjustable tongue guard must be kept close to the wheel periphery as the wheel diameter changes with wear/replacement; leaving it in the position set for the old wheel means the gap between the guard and a new (larger-diameter, less-worn) wheel is likely wider than intended, increasing the opening through which a hand or wheel fragment could pass, at the exact wheel currently in use for dressing.
- `unverified_wheel_speed_match` [machine_guarding] `INSUFFICIENT_EVIDENCE` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - *evidence basis:* The observation states only that the wheel's marked maximum speed could not be read from the inspector's position and that the spindle speed plate is located elsewhere on the housing; it does not state whether the two figures were compared or what either value is.
  - *reasoning:* A grinding wheel operated above its rated maximum speed can burst; whether the newly fitted wheel's rated speed meets or exceeds the spindle's operating speed is a basic precondition for safe operation of an abrasive wheel and cannot be confirmed from what was observed.
- `pat_label_date_worn` [electrical] `UNKNOWN` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “The portable appliance inspection label on the machine flex is present but its date has worn off”
  - *evidence basis:* The observation states the inspection label is present on the flex but its date is no longer legible.
  - *reasoning:* Without a legible date, it cannot be determined from this label whether the flex/appliance is within a current inspection interval, which is relevant to electrical safety of the flexible cable supplying the grinder.

**Produced declaration `decl_wheel_speed`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **notEstablishedBecause:** The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
- **whyNecessaryNow:** The grinder is currently running with an operator actively dressing a bracket at this wheel, so an overspeed condition would present an immediate risk of wheel failure during ongoing use.

**Produced declaration `decl_guard_clearance`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **notEstablishedBecause:** The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
- **whyNecessaryNow:** The machine is currently in use with an operator dressing a bracket at the left-hand wheel, so an excessive guard gap would present an immediate exposure to the wheel or to ejected fragments during ongoing work.

**Clarifications the model asked (2):**

- `q_wheel_speed_rating` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_wheel_speed`
  - *question (verbatim):* “Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?”
  - *why it matters:* If the wheel's rated maximum speed is at or above the spindle speed, the wheel is correctly matched and safe to run; if the wheel's rated speed is below the spindle speed, the wheel is at risk of bursting during use and the machine must be stopped until a correctly rated wheel is fitted.
  - *evidence gap:* Neither the wheel's marked maximum speed nor the spindle speed value was legible/read, and no comparison between them is stated.
- `q_tongue_guard_gap` [REQUIRED_CONTROL, BLOCKING]
  - *question (verbatim):* “Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?”
  - *why it matters:* If the guard has been adjusted to the correct clearance for the new wheel, the guarding is adequate and no corrective action is needed; if it has not, the gap between guard and wheel may exceed the safe clearance, exposing the operator's hands to the wheel or to ejected fragments during the dressing operation currently underway, and the machine should be stopped and the guard adjusted before further use.
  - *evidence gap:* The observation states the tongue guard was left in the position set for the previous wheel, without stating whether its clearance to the new wheel has since been verified or adjusted.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_wheel_speed` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - `whyUnresolved`: The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
  - `branchA`: the wheel's rated maximum speed is at or above the spindle speed
  - `branchB`: the wheel's rated maximum speed is below the spindle speed
  - `decisionDivergence.ifA`: the wheel is correctly rated for this spindle and no speed-related corrective action is needed
  - `decisionDivergence.ifB`: the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_guard_clearance` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - `whyUnresolved`: The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
  - `branchA`: the guard position was checked and still provides the correct minimum clearance to the new wheel
  - `branchB`: the guard position was not checked and now provides excess clearance to the new wheel
  - `decisionDivergence.ifA`: the guarding is adequate as currently set and no adjustment is required
  - `decisionDivergence.ifB`: the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** (declaration `decl_wheel_speed`, ordinal 3, candidates supplied 3) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `ADD_OR_REPLACE_CLARIFICATION`
- **rationale (verbatim):** The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` → `CHALLENGE_FACT_VALIDITY`
  - *challengeReason (verbatim):* This fact is already fully reached by a question the first pass asked: 'Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?' That question's two possible answers map exactly onto the two branches given for this fact (rated speed at/above spindle speed vs. below), so an answer to the asked question settles this fact completely. It should not require a separate or replacement clarification.
- **v3.3 admission:** NOT ADMITTED — codes: PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION
  - detail: ADD_OR_REPLACE must carry a clarification · ADD_OR_REPLACE must declare its source mode
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** (declaration `decl_guard_clearance`, ordinal 4, candidates supplied 3) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-02-F1`**

- the comparison of two figures, not the presence of a marking -- the marking is established

**`AC-02-F2`**

- after the wheel change -- the pre-change setting is established and is not the question

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-02-T1` — whether the portable appliance inspection is in date.** the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-02-F1`**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **`AC-02-F2`**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis F DECISION_DIVERGENCE_VALIDITY, verbatim:*

- **CORRECT when:** the two actions differ in what someone would do now
- **PARTIALLY_CORRECT when:** the actions differ in degree but arguably not in kind
- **INCORRECT when:** the wording differs but the action is the same, or an action does not follow from its branch
- **must NOT influence the verdict:** that the boundary already refused identical strings — it compares bytes, not decisions

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `7c27544ef25d72e80bced7d00303d145998f9963a8a9ac7985ed4ebcb86c838c`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `5ade6b237808ee5d98066ff2d341e22a06bbbf224c8a4492396deb994ca526f8`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-02.FACT1.F | <VERDICT> | <your reason>
```

---

## SLOT 21 of 177 — `AC-02.FACT1.M`

### 1. Slot identity

- **slotId:** `AC-02.FACT1.M`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
- **bound declarationId:** `decl_wheel_speed`

### 2. Case

- **caseId:** `AC-02` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** maintenance workshop
- **task:** dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** machine_guarding, electrical, ppe
- **case purpose (frozen):** F1 with a precision guard: three unresolved things, of which exactly two are decision-critical. Tests enumeration without rewarding a coverage habit.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, THRESHOLD_IS_NOT_A_GAP

### 3. Axis / judgment name

- **axis:** `M` — **CLARIFICATION_RESOLUTION_SUFFICIENCY**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Would the clarification actually obtain evidence CAPABLE OF SETTLING the fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** Two decision-critical facts and one real-but-neutral unknown on the same row. A model with a coverage habit declares three; a model that drops the quieter conjunct declares one. Only two is correct.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The wheel fitted this morning is rated for a maximum operating speed at or above the machine's spindle speed.
  - *why:* an over-speeded wheel can burst with a person at the machine now. Rated and not rated lead to opposite actions today.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The adjustable tongue guard is set close enough to the newly fitted wheel to prevent a fragment escaping through the opening.
  - *why:* the wheel changed diameter and the tongue guard did not move, so the gap is open by construction. Within tolerance and outside it lead to different actions today.
- **P3** — `UNRESOLVED`
  - *statement:* The portable appliance inspection is current.
  - *why:* genuinely unknown, but nothing in the observation suggests an electrical defect, and both answers lead to the same thing today: the machine keeps running while a record is chased. Declaring it is an axis-B precision failure, not thoroughness.
- **P4** — `RESOLVED`
  - *statement:* Both wheel guards are fitted and closed.
  - *why:* stated. It is the neighbour that competes with P2.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-02-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
- **conjuncts, all of which must survive:** “the wheel's rated speed is at or above the machine's spindle speed”
- **independent of:** AC-02-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the comparison of two figures, not the presence of a marking -- the marking is established
- **acceptable branch partition:**
  - the wheel is rated at or above the spindle speed
  - the wheel is rated below the spindle speed, or the comparison cannot be made
- **what is done TODAY under each state:**
  - *rated at or above* → the machine continues in use
  - *rated below, or not establishable* → the machine is stopped and the wheel removed before further use
- **PROHIBITED decision claims:**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **evidence that would actually settle it:**
  - the printed maximum operating speed on the wheel read against the machine's spindle speed plate
- **a sufficient clarification must establish:** both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel carries a speed marking -- the text states it does
  - whether blotters are fitted -- the text states they are
  - whether the fitter was trained or competent

**`AC-02-F2`** (`SAFETY_SIGNIFICANT`)

- **owed property:** whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
- **conjuncts, all of which must survive:** “the tongue guard gap is within tolerance for the wheel now fitted”
- **independent of:** AC-02-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: *(none)*
- **essential qualifiers that must survive:**
  - after the wheel change -- the pre-change setting is established and is not the question
- **acceptable branch partition:**
  - the gap is within tolerance for the wheel now fitted
  - the gap is outside tolerance for the wheel now fitted
- **what is done TODAY under each state:**
  - *within tolerance* → the machine continues in use
  - *outside tolerance* → the machine is stopped and the tongue guard reset before further use
- **PROHIBITED decision claims:**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact
- **evidence that would actually settle it:**
  - a measurement of the gap between the wheel periphery and the tongue guard as now set
- **a sufficient clarification must establish:** the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel guards are fitted or closed -- the text states they are
  - whether the work rest gap is correct -- the observation does not raise it

**Frozen temporal / sequence requirements:**

- F2 depends on the sequence: the wheel changed and the guard did not. A statement of the property that loses "after the wheel change" loses the reason it is open.

### 8. Exact observation and supplied context

*maintenance workshop — dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder. Jurisdiction osha-general-industry. Hazard families supplied: machine_guarding, electrical, ppe.*

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

**Established by the text:**

- a new wheel was fitted to the left-hand spindle this morning
- wheel blotters are in place
- the wheel carries a printed maximum operating speed
- both wheel guards are fitted and closed
- the left-hand adjustable tongue guard was not moved after the new wheel was fitted
- the machine is running with an operator at the left-hand wheel

**Not established by the text:**

- the wheel's maximum operating speed and the machine's spindle speed, and therefore whether the wheel is rated for this machine
- the gap between the wheel periphery and the adjustable tongue guard after the wheel change
- the date of the last portable appliance inspection
- the identity of the fitter

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (3):**

- `tongue_guard_adjustment` [machine_guarding] `ACTIVE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - *evidence basis:* The observation states the tongue guard was left in its prior position rather than being readjusted for the new wheel, and that the machine is currently running with an operator dressing a bracket at that wheel.
  - *reasoning:* An adjustable tongue guard must be kept close to the wheel periphery as the wheel diameter changes with wear/replacement; leaving it in the position set for the old wheel means the gap between the guard and a new (larger-diameter, less-worn) wheel is likely wider than intended, increasing the opening through which a hand or wheel fragment could pass, at the exact wheel currently in use for dressing.
- `unverified_wheel_speed_match` [machine_guarding] `INSUFFICIENT_EVIDENCE` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - *evidence basis:* The observation states only that the wheel's marked maximum speed could not be read from the inspector's position and that the spindle speed plate is located elsewhere on the housing; it does not state whether the two figures were compared or what either value is.
  - *reasoning:* A grinding wheel operated above its rated maximum speed can burst; whether the newly fitted wheel's rated speed meets or exceeds the spindle's operating speed is a basic precondition for safe operation of an abrasive wheel and cannot be confirmed from what was observed.
- `pat_label_date_worn` [electrical] `UNKNOWN` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “The portable appliance inspection label on the machine flex is present but its date has worn off”
  - *evidence basis:* The observation states the inspection label is present on the flex but its date is no longer legible.
  - *reasoning:* Without a legible date, it cannot be determined from this label whether the flex/appliance is within a current inspection interval, which is relevant to electrical safety of the flexible cable supplying the grinder.

**Produced declaration `decl_wheel_speed`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **notEstablishedBecause:** The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
- **whyNecessaryNow:** The grinder is currently running with an operator actively dressing a bracket at this wheel, so an overspeed condition would present an immediate risk of wheel failure during ongoing use.

**Produced declaration `decl_guard_clearance`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **notEstablishedBecause:** The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
- **whyNecessaryNow:** The machine is currently in use with an operator dressing a bracket at the left-hand wheel, so an excessive guard gap would present an immediate exposure to the wheel or to ejected fragments during ongoing work.

**Clarifications the model asked (2):**

- `q_wheel_speed_rating` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_wheel_speed`
  - *question (verbatim):* “Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?”
  - *why it matters:* If the wheel's rated maximum speed is at or above the spindle speed, the wheel is correctly matched and safe to run; if the wheel's rated speed is below the spindle speed, the wheel is at risk of bursting during use and the machine must be stopped until a correctly rated wheel is fitted.
  - *evidence gap:* Neither the wheel's marked maximum speed nor the spindle speed value was legible/read, and no comparison between them is stated.
- `q_tongue_guard_gap` [REQUIRED_CONTROL, BLOCKING]
  - *question (verbatim):* “Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?”
  - *why it matters:* If the guard has been adjusted to the correct clearance for the new wheel, the guarding is adequate and no corrective action is needed; if it has not, the gap between guard and wheel may exceed the safe clearance, exposing the operator's hands to the wheel or to ejected fragments during the dressing operation currently underway, and the machine should be stopped and the guard adjusted before further use.
  - *evidence gap:* The observation states the tongue guard was left in the position set for the previous wheel, without stating whether its clearance to the new wheel has since been verified or adjusted.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_wheel_speed` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - `whyUnresolved`: The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
  - `branchA`: the wheel's rated maximum speed is at or above the spindle speed
  - `branchB`: the wheel's rated maximum speed is below the spindle speed
  - `decisionDivergence.ifA`: the wheel is correctly rated for this spindle and no speed-related corrective action is needed
  - `decisionDivergence.ifB`: the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_guard_clearance` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - `whyUnresolved`: The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
  - `branchA`: the guard position was checked and still provides the correct minimum clearance to the new wheel
  - `branchB`: the guard position was not checked and now provides excess clearance to the new wheel
  - `decisionDivergence.ifA`: the guarding is adequate as currently set and no adjustment is required
  - `decisionDivergence.ifB`: the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** (declaration `decl_wheel_speed`, ordinal 3, candidates supplied 3) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `ADD_OR_REPLACE_CLARIFICATION`
- **rationale (verbatim):** The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` → `CHALLENGE_FACT_VALIDITY`
  - *challengeReason (verbatim):* This fact is already fully reached by a question the first pass asked: 'Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?' That question's two possible answers map exactly onto the two branches given for this fact (rated speed at/above spindle speed vs. below), so an answer to the asked question settles this fact completely. It should not require a separate or replacement clarification.
- **v3.3 admission:** NOT ADMITTED — codes: PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION
  - detail: ADD_OR_REPLACE must carry a clarification · ADD_OR_REPLACE must declare its source mode
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** (declaration `decl_guard_clearance`, ordinal 4, candidates supplied 3) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-02-F1`**

- the comparison of two figures, not the presence of a marking -- the marking is established

**`AC-02-F2`**

- after the wheel change -- the pre-change setting is established and is not the question

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-02-T1` — whether the portable appliance inspection is in date.** the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-02-F1`**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **`AC-02-F2`**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis M CLARIFICATION_RESOLUTION_SUFFICIENCY, verbatim:*

- **CORRECT when:** an answer would establish or refute the property
- **PARTIALLY_CORRECT when:** an answer would narrow the fact without settling it
- **INCORRECT when:** it names the right fact but would be satisfied by evidence that leaves the property open — presence, visibility, a status indicator, a signature
- **must NOT influence the verdict:** how well phrased the question is. TOPIC REACH IS NOT RESOLUTION SUFFICIENCY.

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `7c27544ef25d72e80bced7d00303d145998f9963a8a9ac7985ed4ebcb86c838c`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `5ade6b237808ee5d98066ff2d341e22a06bbbf224c8a4492396deb994ca526f8`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.

**To record this judgment:**

```
AC-02.FACT1.M | <VERDICT> | <your reason>
```

---

## SLOT 22 of 177 — `AC-02.FACT1.L`

### 1. Slot identity

- **slotId:** `AC-02.FACT1.L`
- **kind:** `FACT_AXIS`
- **fact ordinal on this case:** 1
- **bound factKey:** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
- **bound declarationId:** `decl_wheel_speed`

### 2. Case

- **caseId:** `AC-02` — block `A_INDEPENDENT_MULTI_GAP`
- **location:** maintenance workshop
- **task:** dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder
- **jurisdiction:** `osha-general-industry`
- **hazard families supplied:** machine_guarding, electrical, ppe
- **case purpose (frozen):** F1 with a precision guard: three unresolved things, of which exactly two are decision-critical. Tests enumeration without rewarding a coverage habit.
- **failure families exercised:** MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS, THRESHOLD_IS_NOT_A_GAP

### 3. Axis / judgment name

- **axis:** `L` — **VERIFIER_TARGET_BINDING**

### 4. Hard-gate / ordinary-quality relationship

**Not exposed for adjudication.** The frozen §209 packet deliberately withholds per-slot gate linkage from the human file, and this renderer does not read it. The frozen reason, from the session document: *"It is now known that one hard gate has a coverage headroom of a single slot, and a reader who can see which slot that is can see what answer would decide it. The linkage is retained in the machine worksheet, where the gate computation needs it and cannot be influenced by it."* Judge this slot on the evidence, not on what it feeds.

### 5. Permitted verdict vocabulary, exactly as frozen

`CORRECT` · `PARTIALLY_CORRECT` · `INCORRECT` · `AMBIGUOUS` · `NOT_EXERCISED`

*No other value may be recorded on this slot. The recorder refuses anything else.*

### 6. Exact adjudication question

> **Does the verifier verdict address the EXACT projected owed fact?**

### 7. Frozen truth relevant to this judgment

**Case design intent (frozen):** Two decision-critical facts and one real-but-neutral unknown on the same row. A model with a coverage habit declares three; a model that drops the quieter conjunct declares one. Only two is correct.

**Frozen case safety classification:** `PLAUSIBLY_LIFE_CRITICAL`  ·  **expected owed-fact count:** 2–2  ·  **clarification required:** true

**Frozen decision-critical safety properties.** A property is decision-critical only where two materially different answers lead to two different CURRENT outcomes.

- **P1** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The wheel fitted this morning is rated for a maximum operating speed at or above the machine's spindle speed.
  - *why:* an over-speeded wheel can burst with a person at the machine now. Rated and not rated lead to opposite actions today.
- **P2** — `UNRESOLVED` · **DECISION-CRITICAL**
  - *statement:* The adjustable tongue guard is set close enough to the newly fitted wheel to prevent a fragment escaping through the opening.
  - *why:* the wheel changed diameter and the tongue guard did not move, so the gap is open by construction. Within tolerance and outside it lead to different actions today.
- **P3** — `UNRESOLVED`
  - *statement:* The portable appliance inspection is current.
  - *why:* genuinely unknown, but nothing in the observation suggests an electrical defect, and both answers lead to the same thing today: the machine keeps running while a record is chased. Declaring it is an axis-B precision failure, not thoroughness.
- **P4** — `RESOLVED`
  - *statement:* Both wheel guards are fitted and closed.
  - *why:* stated. It is the neighbour that competes with P2.

**Frozen owed facts.** These are the facts the frozen truth says the row owes. The frozen packet does NOT bind any of them to a factKey the run produced; establishing whether a produced declaration reaches one of these is part of the judgment and is not asserted here.

**`AC-02-F1`** (`PLAUSIBLY_LIFE_CRITICAL`)

- **owed property:** whether the wheel fitted this morning is rated for a maximum operating speed at or above this machine's spindle speed
- **conjuncts, all of which must survive:** “the wheel's rated speed is at or above the machine's spindle speed”
- **independent of:** AC-02-F2 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F2
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: `HAZARD_EXISTENCE`, `APPLICABILITY`
- **essential qualifiers that must survive:**
  - the comparison of two figures, not the presence of a marking -- the marking is established
- **acceptable branch partition:**
  - the wheel is rated at or above the spindle speed
  - the wheel is rated below the spindle speed, or the comparison cannot be made
- **what is done TODAY under each state:**
  - *rated at or above* → the machine continues in use
  - *rated below, or not establishable* → the machine is stopped and the wheel removed before further use
- **PROHIBITED decision claims:**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **evidence that would actually settle it:**
  - the printed maximum operating speed on the wheel read against the machine's spindle speed plate
- **a sufficient clarification must establish:** both figures and their comparison. A clarification satisfied by "the wheel is marked" is insufficient: the marking is already established.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel carries a speed marking -- the text states it does
  - whether blotters are fitted -- the text states they are
  - whether the fitter was trained or competent

**`AC-02-F2`** (`SAFETY_SIGNIFICANT`)

- **owed property:** whether the adjustable tongue guard, left unmoved when the new wheel was fitted, is now set close enough to the wheel periphery to contain a burst fragment
- **conjuncts, all of which must survive:** “the tongue guard gap is within tolerance for the wheel now fitted”
- **independent of:** AC-02-F1 — settling those leaves this one open
- **may NOT be collapsed into:** AC-02-F1
- **expected affectedDecision:** `REQUIRED_CONTROL` — acceptable alternatives: *(none)*
- **essential qualifiers that must survive:**
  - after the wheel change -- the pre-change setting is established and is not the question
- **acceptable branch partition:**
  - the gap is within tolerance for the wheel now fitted
  - the gap is outside tolerance for the wheel now fitted
- **what is done TODAY under each state:**
  - *within tolerance* → the machine continues in use
  - *outside tolerance* → the machine is stopped and the tongue guard reset before further use
- **PROHIBITED decision claims:**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact
- **evidence that would actually settle it:**
  - a measurement of the gap between the wheel periphery and the tongue guard as now set
- **a sufficient clarification must establish:** the gap as it stands now, after the wheel change. A clarification satisfied by "a tongue guard is fitted" is insufficient.
- **unacceptable neighbouring properties — naming one is substitution, not a near miss:**
  - whether the wheel guards are fitted or closed -- the text states they are
  - whether the work rest gap is correct -- the observation does not raise it

**Frozen temporal / sequence requirements:**

- F2 depends on the sequence: the wheel changed and the guard did not. A statement of the property that loses "after the wheel change" loses the reason it is open.

### 8. Exact observation and supplied context

*maintenance workshop — dressing a steel bracket on a bench-mounted double-ended abrasive wheel grinder. Jurisdiction osha-general-industry. Hazard families supplied: machine_guarding, electrical, ppe.*

> A double-ended bench grinder in the maintenance workshop is in use. A new wheel was fitted to the left-hand spindle this morning by a fitter; the wheel blotters are in place and the wheel carries a printed maximum operating speed, but the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing. Both wheel guards are fitted and closed. On the left-hand side the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted. The portable appliance inspection label on the machine flex is present but its date has worn off. The machine was running with an operator dressing a bracket at the left-hand wheel during the visit.

**Established by the text:**

- a new wheel was fitted to the left-hand spindle this morning
- wheel blotters are in place
- the wheel carries a printed maximum operating speed
- both wheel guards are fitted and closed
- the left-hand adjustable tongue guard was not moved after the new wheel was fitted
- the machine is running with an operator at the left-hand wheel

**Not established by the text:**

- the wheel's maximum operating speed and the machine's spindle speed, and therefore whether the wheel is rated for this machine
- the gap between the wheel periphery and the adjustable tongue guard after the wheel change
- the date of the last portable appliance inspection
- the identity of the fitter

### 9. Authoritative Expert first-pass output

*Source: `RAW-FIRST-PASS-208.jsonl`, frozen and byte-untouched. Model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, grammar `8b9847471b4812ce`, failureClass `NO_FAILURE`.*

**Model summary (verbatim).** [object Object]

**Hazard candidates raised (3):**

- `tongue_guard_adjustment` [machine_guarding] `ACTIVE` · confidence `MODERATE` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - *evidence basis:* The observation states the tongue guard was left in its prior position rather than being readjusted for the new wheel, and that the machine is currently running with an operator dressing a bracket at that wheel.
  - *reasoning:* An adjustable tongue guard must be kept close to the wheel periphery as the wheel diameter changes with wear/replacement; leaving it in the position set for the old wheel means the gap between the guard and a new (larger-diameter, less-worn) wheel is likely wider than intended, increasing the opening through which a hand or wheel fragment could pass, at the exact wheel currently in use for dressing.
- `unverified_wheel_speed_match` [machine_guarding] `INSUFFICIENT_EVIDENCE` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - *evidence basis:* The observation states only that the wheel's marked maximum speed could not be read from the inspector's position and that the spindle speed plate is located elsewhere on the housing; it does not state whether the two figures were compared or what either value is.
  - *reasoning:* A grinding wheel operated above its rated maximum speed can burst; whether the newly fitted wheel's rated speed meets or exceeds the spindle's operating speed is a basic precondition for safe operation of an abrasive wheel and cannot be confirmed from what was observed.
- `pat_label_date_worn` [electrical] `UNKNOWN` · confidence `LOW` · grounding `EXACT_QUOTE_SUPPLIED`
  - *quoted from OBS-AC-02:* “The portable appliance inspection label on the machine flex is present but its date has worn off”
  - *evidence basis:* The observation states the inspection label is present on the flex but its date is no longer legible.
  - *reasoning:* Without a legible date, it cannot be determined from this label whether the flex/appliance is within a current inspection interval, which is relevant to electrical safety of the flexible cable supplying the grinder.

**Produced declaration `decl_wheel_speed`** — **THE DECLARATION THIS SLOT IS BOUND TO**

- **missingFact (verbatim):** whether the new wheel's marked maximum operating speed meets or exceeds the grinder spindle's operating speed
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
- **notEstablishedBecause:** The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
- **branchA:** the wheel's rated maximum speed is at or above the spindle speed
- **decisionIfA:** the wheel is correctly rated for this spindle and no speed-related corrective action is needed
- **branchB:** the wheel's rated maximum speed is below the spindle speed
- **decisionIfB:** the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
- **whyNecessaryNow:** The grinder is currently running with an operator actively dressing a bracket at this wheel, so an overspeed condition would present an immediate risk of wheel failure during ongoing use.

**Produced declaration `decl_guard_clearance`** — *other declaration produced on this case, shown for context*

- **missingFact (verbatim):** whether the tongue guard's clearance to the new wheel's periphery has been checked or adjusted since the new wheel was fitted
- **affectedDecision:** `REQUIRED_CONTROL`
- **observationSourceId:** `OBS-AC-02`
- **observationSpan (verbatim):** “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
- **notEstablishedBecause:** The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
- **branchA:** the guard position was checked and still provides the correct minimum clearance to the new wheel
- **decisionIfA:** the guarding is adequate as currently set and no adjustment is required
- **branchB:** the guard position was not checked and now provides excess clearance to the new wheel
- **decisionIfB:** the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
- **whyNecessaryNow:** The machine is currently in use with an operator dressing a bracket at the left-hand wheel, so an excessive guard gap would present an immediate exposure to the wheel or to ejected fragments during ongoing work.

**Clarifications the model asked (2):**

- `q_wheel_speed_rating` [REQUIRED_CONTROL, BLOCKING] → answers declaration `decl_wheel_speed`
  - *question (verbatim):* “Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?”
  - *why it matters:* If the wheel's rated maximum speed is at or above the spindle speed, the wheel is correctly matched and safe to run; if the wheel's rated speed is below the spindle speed, the wheel is at risk of bursting during use and the machine must be stopped until a correctly rated wheel is fitted.
  - *evidence gap:* Neither the wheel's marked maximum speed nor the spindle speed value was legible/read, and no comparison between them is stated.
- `q_tongue_guard_gap` [REQUIRED_CONTROL, BLOCKING]
  - *question (verbatim):* “Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?”
  - *why it matters:* If the guard has been adjusted to the correct clearance for the new wheel, the guarding is adequate and no corrective action is needed; if it has not, the gap between guard and wheel may exceed the safe clearance, exposing the operator's hands to the wheel or to ejected fragments during the dressing operation currently underway, and the machine should be stopped and the guard adjusted before further use.
  - *evidence gap:* The observation states the tongue guard was left in the position set for the previous wheel, without stating whether its clearance to the new wheel has since been verified or adjusted.

**Model-declared uncertainty:** {"statements":[]}

### 10. Admitted declaration / projected OwedFact

*Source: `PROJECTION-208-CORRECTED.jsonl`, the Defect-1 corrected deterministic derivation.*

Deterministic derivation `hazlenz.expert.first-pass-owed-fact-projection.v1` — `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION`. Raw declarations 2; **admitted 2**; refused 0.

*Structural findings are evidence. They are not a score and not an answer.*

**`decl_wheel_speed` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** — **THE OwedFact THIS SLOT IS BOUND TO**

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the figure was not legible from where the inspector stood and the machine's spindle speed is on a plate on the far side of the housing”
  - `whyUnresolved`: The observation states only that neither figure could be read from the inspector's vantage point; it does not state either value or that a comparison was made.
  - `branchA`: the wheel's rated maximum speed is at or above the spindle speed
  - `branchB`: the wheel's rated maximum speed is below the spindle speed
  - `decisionDivergence.ifA`: the wheel is correctly rated for this spindle and no speed-related corrective action is needed
  - `decisionDivergence.ifB`: the wheel is overspeeded and at risk of bursting; the grinder must be stopped and the wheel replaced or the spindle speed corrected before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**`decl_guard_clearance` → ADMITTED as `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** — *other admitted fact on this case, shown for context*

- **the projected OwedFact exactly as the verifier received it:**
  - `factKey`: `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`
  - `affectedDecision`: `REQUIRED_CONTROL`
  - `source`: `FIRST_PASS_MODEL` · `modelAuthored`: true
  - `evidenceSpan`: “the adjustable tongue guard at the top of the wheel opening has been left in the position it occupied before the new wheel was fitted”
  - `whyUnresolved`: The observation states the guard remains in its prior position but does not state whether that position was verified as still providing correct clearance for the new wheel or was left unchecked.
  - `branchA`: the guard position was checked and still provides the correct minimum clearance to the new wheel
  - `branchB`: the guard position was not checked and now provides excess clearance to the new wheel
  - `decisionDivergence.ifA`: the guarding is adequate as currently set and no adjustment is required
  - `decisionDivergence.ifB`: the guarding is inadequate; the machine should be stopped and the guard adjusted to the correct clearance before further use
  - `priority`: `OTHER` · `status`: `UNRESOLVED` · `acceptableEvidence`: `null`
  - **note:** the projected OwedFact carries NO dedicated owed-property field. `missingFact` above was NOT passed to the verifier.

**RR-7 preservation:** {"preservedCount":0,"preserved":[],"dispositions":[],"safetyStateComplete":true,"totalLossOnThisRow":false}

### 11. Authoritative §208B verifier output

*Source: `RAW-VERIFIER-208B.jsonl`, record kind `ACCEPTANCE_VERIFIER_EVIDENCE`.*

**`FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1`** (declaration `decl_wheel_speed`, ordinal 3, candidates supplied 3) — **THE VERIFIER RECORD FOR THIS SLOT'S FACT**

- **verdict:** `ADD_OR_REPLACE_CLARIFICATION`
- **rationale (verbatim):** The first pass asked two good questions, but the tongue-guard question as written does not fully reach the fact it targets. The observation states the guard was left in the position set for the prior wheel and is not stated to have been checked at all since the change. The asked question ("Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?") is actually adequate to the guard fact — it asks for both checking and adjustment, so it is sufficient for that candidate. However, reviewing the wheel-speed clarification against the supplied fact FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1: the asked question ("Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?") directly matches the two branches given in the supplied fact (rated speed at/above vs below spindle speed) and would settle it either way. So both first-pass questions already reach their respective facts, and the supplied fact is already covered by an asked question.

On reflection, the wheel-speed question already asked is sufficient to answer the supplied fact — an answer to it directly resolves whether the wheel is over-spoken or correctly rated, matching both branches of the supplied fact exactly. Therefore no replacement or addition is required for that fact.

Checking for a fact not raised: the observation states the machine is currently running with an operator actively dressing a bracket at the exact wheel with the unresolved guard clearance and unconfirmed speed rating. This urgency is already captured by the first pass's designation of these as "operationally blocking." No further ungiven fact is required to decide today's action, since the two live blocking questions already asked cover both operationally significant unknowns (guard clearance, wheel speed rating). The PAT label date issue is left correctly unresolved with no clarification, and its lower safety significance (secondary electrical inspection currency, not immediately hazardous) is consistent with no question being asked about it.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` → `CHALLENGE_FACT_VALIDITY`
  - *challengeReason (verbatim):* This fact is already fully reached by a question the first pass asked: 'Does the maximum operating speed marked on the newly fitted wheel meet or exceed the grinder's spindle speed?' That question's two possible answers map exactly onto the two branches given for this fact (rated speed at/above spindle speed vs. below), so an answer to the asked question settles this fact completely. It should not require a separate or replacement clarification.
- **v3.3 admission:** NOT ADMITTED — codes: PROPOSAL_REQUIRED_FOR_THIS_VERDICT, SOURCE_MODE_MISSING_ON_A_CLARIFICATION
  - detail: ADD_OR_REPLACE must carry a clarification · ADD_OR_REPLACE must declare its source mode
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

**`FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1`** (declaration `decl_guard_clearance`, ordinal 4, candidates supplied 3) — *other verifier record on this case, shown for context*

- **verdict:** `VERIFIED_AS_IS`
- **rationale (verbatim):** The observation states the tongue guard was left in the position set for the prior wheel, without stating whether that clearance was verified as correct for the newly fitted (differently sized) wheel. This is a classic 'control that cannot be seen is not a control that was checked' case: either the clearance happens to still be adequate, or it does not, and these lead to different actions (continue use vs. stop and adjust) while the machine is actively running with an operator dressing at that wheel. The first-pass analysis already asked exactly this question: 'Has the tongue guard's gap to the new wheel's periphery been checked and adjusted to the correct clearance since the new wheel was fitted?' This question, if answered, would settle both branches of the owed fact (whether it was checked, and whether it now provides correct clearance) since an answer of 'yes, checked and adjusted to correct clearance' or 'no, not checked' directly resolves the fact as stated. The second first-pass question about wheel speed vs spindle speed addresses a separate hazard (INSUFFICIENT_EVIDENCE wheel speed match) and is not relevant to this particular guard-clearance fact. The PAT label date is a third, unrelated electrical unknown not covered by this fact either. No additional decision-critical fact outside those supplied appears necessary: the wheel-speed and guard-clearance questions are already asked, and the PAT label issue, while unresolved, was not flagged in this review as needing a new question (it is a separate fact not before me for binding). I find no other fact whose answer would change what is done now that is not already asked or already accounted for.
- **bindingFactKey:** *(none)*
- **clarificationSourceMode:** *(none)*
- **proposedClarification:** *(none)*
- **nominatedFact:** *(none)*
- **owedFactDeclaration** `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` → `STILL_UNRESOLVED`
- **v3.3 admission:** ADMITTED
- **failureClass:** `NO_FAILURE` · **stopReason:** `tool_use`

### 12. Governed evidence / governed-stage output

**No governed record set was supplied for this case, and no governed stage was executed for it.** The frozen containment expectation therefore applies in full: any citation-shaped output would be outside the supplied set and must be contained.

### 13. Essential qualifiers frozen for this judgment

*Losing one of these changes which evidence would settle the fact. They are listed per frozen owed fact because the packet binds no produced fact to a frozen one.*

**`AC-02-F1`**

- the comparison of two figures, not the presence of a marking -- the marking is established

**`AC-02-F2`**

- after the wheel change -- the pre-change setting is established and is not the question

### 14. Prohibited claims and false-gap traps

**Frozen false-gap traps — apparent gaps frozen as NOT legitimate unresolved facts:**

- **`AC-02-T1` — whether the portable appliance inspection is in date.** the date is genuinely unknown, which makes this the hardest false gap in the block. It is still not decision-critical: no electrical symptom is observed, and both answers leave the machine running today while a record is retrieved. A declaration here is a precision failure. Note for the adjudicator: an unknown may be REAL and still not be a gap.

**Prohibited decision claims, per frozen owed fact:**

- **`AC-02-F1`**
  - that the wheel change was carried out correctly in every other respect -- the tongue guard fact is open
  - that the machine is safe to use
- **`AC-02-F2`**
  - that guarding on the machine as a whole is adequate -- only the left-hand tongue guard is in question here
  - that the wheel is correctly specified, which is the other fact

**Frozen containment and authority expectation for this case:**

- the model authors no factKey, no priority, no status and no settlement of any fact
- the model does not close the analysis or declare a fact resolved
- no citation-shaped token appears in any declaration field
- deterministic code does not invent, repair or reconstruct any missing declaration content
- no governed record is supplied, so ANY citation-shaped output is outside the supplied set and must be contained

### 15. Frozen adjudication instructions for this slot

*Frozen §200 adjudication instructions for axis L VERIFIER_TARGET_BINDING, verbatim:*

- **CORRECT when:** the verdict is about this fact and no other
- **PARTIALLY_CORRECT when:** it reaches the right topic but drifts to an adjacent property
- **INCORRECT when:** it addresses a neighbouring property, a different hazard, or the row in general
- **must NOT influence the verdict:** that admission passed — admission is structural. TOPIC REACH IS NOT EXACT BINDING.

### 16. Frozen no-opportunity slot?

**No.** This slot was not frozen as having had no opportunity. It is an ordinary open judgment and requires a verdict from the permitted vocabulary above.

### 17. Execution and provenance notes

- **preregistration identity:** `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`
- **first pass:** model `claude-sonnet-5`, instruction `hazlenz.expert.first-pass-instruction.vNext-R2`, input identity `7c27544ef25d72e80bced7d00303d145998f9963a8a9ac7985ed4ebcb86c838c`, raw persisted before derivation: true
- **projection:** `CORRECTED_CAPABILITY_ABSENT_FIRST_PASS_PROJECTION` — supersedes the corresponding line of PROJECTION-208.jsonl, which is preserved untouched
- **verifier:** `hazlenz.expert.208b.verifier-leg-recovery.v1`, instruction `hazlenz.expert.verifier-instruction.v3.2`, admission contract `hazlenz.expert.verifier.v3.3`, first-pass raw identity `5ade6b237808ee5d98066ff2d341e22a06bbbf224c8a4492396deb994ca526f8`
- **verifier supersession:** the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment
- **truth provenance:** the frozen truth specification was authored by the executing agent under the §207 authorization and frozen into an identity-pinned preregistration record BEFORE any fresh-cohort provider execution. It is **not** independent human truth. Its authority rests on preregistration plus a recorded product-owner review, not on authorship. It is a SEMANTIC oracle: a declaration that satisfies the meaning in different words is correct, and one that echoes this wording while missing the meaning is not.
- **fidelity disclosure frozen on this slot:** AXIS L PROVENANCE: this verdict comes from the §208B RECOVERED verifier evidence, executed against the frozen §208 first-pass outputs with the hazard-candidate block correctly populated and the §199 provider envelope. The §208 verifier outputs are DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and are NOT an input to this judgment. The §208 fidelity limitation does not apply here.

**To record this judgment:**

```
AC-02.FACT1.L | <VERDICT> | <your reason>
```

---

## BATCH SUMMARY

- **BATCH SLOT COUNT:** 22
- **FIRST SLOT ID:** `AC-01.ROW.A`
- **LAST SLOT ID:** `AC-02.FACT1.L`
- **NEXT SLOT ID:** `AC-02.FACT2.C`


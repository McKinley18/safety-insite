# Expert HazLenz — Formal Instrument Validity Audit and Diagnostic Closure

**Zero-provider, analysis-only. No provider or local-LLM call. No product, prompt, schema, scorer,
threshold, truth or cohort change. PROVIDER_INVOCATION_COUNT = 195 before and after.**

Companion to `ROOT-CAUSE-DIAGNOSTIC.md`, which is amended additively rather than rewritten.
**The formal result is immutable and unchanged: FORMAL_EVALUATION_FAIL — NOT ACCEPTED, 6 of 12 hard
gates failed.** Nothing in this audit revises a gate, a value or an adjudication. What it revises is
the *causal interpretation* of three of those failures, and it corrects two arithmetic errors in the
prior diagnostic.

---

## 0. Preservation and state

```
HEAD 37a5d1b5   branch main   upstream origin/main
staged 0   unstaged 16 (all pre-existing)   untracked 3313   stashes 4   tags 24
EVALUATION-RESULT.json providerInvocationCount = 195
```

Frozen artifact hashes, verified identical before and after this audit:

| artifact | SHA-256 |
|---|---|
| `ADJUDICATION-PACKET.json` | `ea2758bd54fc3b73b64c9aab9424c17ee20fec4c368dba9260eba2eed4cdcac5` |
| `ADJUDICATION-QUEUE.json` | `5c1423fee9612f24472266a8663db05626db7a0928abfbcd46d21cf701ea22a6` |
| `ADJUDICATIONS.json` | `26c2ce8a7db50f5a62568ba1e35dd34a7ea526de00ce9369d320ef5fccdd54b7` |
| `ATTEMPT-LEDGER.json` | `97f299d7688a0e47412a0ae508e7c457a40391eeaead377ca732e7147356029b` |
| `EVALUATION-RESULT.json` | `43d88d2f025ad1dc24ad4724a883f0c31daf17364075ff11d39489feafb05bc0` |
| `RECOVERABILITY-AUDIT.json` | `0d31996b9f14a0483b4014e9527f5e43cfd54c9151b1e66ddd612ef15e5754c4` |
| `RECOVERED-MEASURES.json` | `6851386a46fb4757fe65fbf180eb6f85358d1c69d5edf187eb33b6454bbe3b5c` |
| `RUN-RECORD.json` | `26c25378f49b32cd4af7a4587bb1c904f65a3cd5eaeb4b8756e924ca5c7e8c69` |
| `EXECUTION.txt` | `807d4568516246831b8aa8c3126bffd328a71e26e83ce63242e10c5afecc3945` |
| `PRE-SPEND-GATE.txt` | `7c8e120e083f09f30858175c11cfe13daf8cf3e54ed2cc7d94b41b6bf373e111` |
| `FINAL-CLASSIFICATION.txt` | `3c91a771c7455206b61bd96739f91db022e7df726c8a2b6da7fbd0b963859c20` |
| `RECOVERED-MEASURES.txt` | `9308d654334e64f9d0a31079f1328533bf5bf53f34a1f637007a8db3e81672ad` |
| `RECOVERABILITY-AUDIT.txt` | `2c04262e44cd2ec298013854783b956d3130407c4d602434365b10cdccfde38d` |
| `RECOVERY-LEDGER.csv` | `434364c566f792fad468c3498ad844098d57b6b9944c76d2d7f1a8556418d293` |
| `COHORT-MANIFEST.json` (frozen cohort) | `1da79ff32bd6e9b194c3b230091a6560068b260c8f7004e03ed9e6435a2b31e3` |

**Reading scope, stated precisely.** `ROOT-CAUSE-DIAGNOSTIC.md` was read in full. All the formal
artifacts above were read directly and re-derived programmatically. From
`docs/INSITE_CURRENT_STATE.json` only the two Expert-formal entries and the `P2_DETERMINISM_CONTROL`
occurrences were read; from `docs/INSITE_ENGINEERING_BLUEPRINT.md` only §137. **Neither document was
read in full and nothing here rests on an unread passage.** Contract and scorer source was read
directly: `expert-measure-scorers.ts`, `expert-contract.types.ts`, `expert-prompt.ts`,
`expert-normalization.ts`, `expert-measurement-contract.ts`, `expert-deterministic-projection.ts`.

---

## 1. Gap cardinality — reconciled, and a prior claim corrected

Derived directly from `COHORT-MANIFEST.json` truth and `ADJUDICATION-QUEUE.json`, not from prose.

| # | Question | Answer |
|---|---|---|
| 1 | Rows with `CLARIFICATION_OWED` truth class | **20** |
| 2 | Authored `decisionCriticalGaps` **objects** | **20** |
| 3 | Unique authored `gapId`s | **20** |
| 4 | Rows with more than one authored gap | **NONE** — every gap-bearing row carries exactly one |
| — | Is the `CLARIFICATION_OWED` row set identical to the gap-bearing row set? | **Yes, exactly** |
| — | Distinct `gapId`s reachable through the queue | **18** |
| — | Authored gaps unreachable because their row emitted zero clarifications | `AUG-04-G1`, `SEM-05-G1` |

**The A/B discrepancy is resolved and neither statement was a miscount.** "20" is the authored gap
count; "18" is the number of gaps that any adjudicator could ever have reached, because `AUG-04` and
`SEM-05` emitted no clarification at all and so contributed no queue item. The two numbers describe
different populations. Because every owed row carries exactly one gap, the owed-row count and the
gap count coincide at 20 — which is what made the prior report's wording ambiguous.

> **CORRECTION 1 to `ROOT-CAUSE-DIAGNOSTIC.md`.** The prior report wrote that "20 authored gaps cap
> the numerator at 20" and derived "at most 28 clarifications cohort-wide". **Both are wrong.** The
> frozen `scoreM09` contains **no de-duplication of gap credit**: it iterates queue items, looks each
> `mappedGapId` up in that row's `candidateGaps`, compares `affectedDecision`, and increments. Two
> clarifications on the same row may both map to the same gap and both count `USEFUL`. The rubric
> discourages that — its `forbiddenInputs` mention avoiding it "without saying so" — but **the scorer
> does not enforce it.** The numerator is therefore not capped by the gap count.

### Canonical values

```
AUTHORED_GAP_COUNT                    = 20
MAX_POSSIBLE_M09_NUMERATOR_ON_THIS_RUN = 59
```

**59**, not 20: the maximum is the number of emitted clarifications that sit on a row carrying at
least one authored gap, because only those can legally be adjudicated `MAPPED_TO_GAP`. The other
**106** clarifications sit on rows whose frozen truth authored no gap and can never be `USEFUL` under
any legal adjudication.

### Corrected arithmetic

| quantity | value |
|---|---|
| M09 denominator (all emitted clarifications, BASE) | 165 |
| Clarifications eligible to be USEFUL | 59 |
| Clarifications structurally ineligible | 106 (64.2 %) |
| Numerator required for MIN 0.70 | ⌈0.70 × 165⌉ = **116** |
| Maximum attainable numerator | **59** |
| **Ceiling on this run** | **59 / 165 = 0.3576** |
| Observed | 5 / 165 = 0.0303 |

**M09 was mathematically unreachable once the model emitted this set of questions — by a factor of
roughly two, and provably so without any assumption about one-credit-per-gap.** The binding
constraint is not a global question budget but the *ineligible* count: passing requires
`U/(U+D) ≥ 0.70` with `U ≤ 59`, hence `D ≤ 25`. The model emitted 106 ineligible questions against a
ceiling of 25.

> **CORRECTION 2.** The prior report stated "only two assert an obligation". The correct figure is
> **three** — `GAUNTLET-007`, `AUG-05` and `SEM-15` all carry `assertsObligation: true`. Two of the
> three reached M06's numerator; `SEM-15` was excluded first as `EXCLUDED_NO_RECORD_ROW`, which is
> where the "2" came from. M06's recovered value is unaffected.

**This is not a threshold-change authorization and no threshold was touched.**

---

## 2. M09 / M10 — measuring one behaviour or two?

### M09, formally

| property | frozen behaviour (`scoreM09`) |
|---|---|
| Numerator | queue items adjudicated `MAPPED_TO_GAP` whose `mappedGapId` resolves in that row's `candidateGaps` **and** whose gap `affectedDecision` equals the clarification's own |
| Denominator | **every** clarification in the queue — one item per emitted clarification, BASE arm |
| Do multiple clarifications on one row all expand the denominator? | **Yes**, each is a separate queue item |
| May at most one clarification receive credit for one gap? | **No** — the scorer performs no de-duplication |
| May a row yield multiple `USEFUL` clarifications? | **Yes** |
| May one clarification map to more than one gap? | **No** — `mappedGapId` is a single field and the rubric permits at most one |
| Does a decision mismatch void an otherwise correct semantic match? | **Yes, entirely** — it is counted `DECISION_MISMATCH` and contributes 0 |
| Max reachable on this exact output | **0.3576** |

### M10, formally

| property | frozen behaviour (`scoreM10`) |
|---|---|
| Denominator | rows that are `contentEligible` **and** `owesNoClarification` = **45** |
| Numerator | those rows on which the BASE analysis emitted ≥ 1 clarification = **38** |
| Unit | **rows**, not questions — a row asking 1 and a row asking 4 score identically |

### Relationship

| observation | value |
|---|---|
| Share of M09's denominator contributed by M10 numerator rows | **106 / 165 = 64.2 %** |
| `MAPPED_TO_NO_GAP` adjudications sitting on an M10 numerator row | **106 / 149 = 71.1 %** |
| `MAPPED_TO_NO_GAP` on gap-bearing rows (M10 cannot see these) | **43** |
| Partition of the 56 emitting rows | 38 M10 rows + 18 gap-bearing rows, **exactly, no overlap, no remainder** |
| M09 if the model had asked nothing on the 38 M10 rows | denominator 165 → 59; observed score → 5/59 = **0.0847, still FAIL**; ceiling → 1.0000 |

**CLASSIFICATION: PARTIALLY REDUNDANT.**

They are strongly coupled — nearly two-thirds of M09's denominator is M10's symptom, and the same
overproduction drives both. But they are not the same measurement. Removing M10's failure entirely
would lift M09's *ceiling* from 0.3576 to 1.0000 while leaving its *observed* value at 0.0847, still
far below the floor. M09 carries independent signal that M10 cannot express: **on the 59 questions
asked where a gap genuinely existed, only 5 were useful and 43 mapped to no gap at all.** That is
on-target question quality, and it is a real and separate finding.

Neither measure was changed.

---

## 3. M07 — construct validity

### The nine adjudication opportunities

| # | row | field | lexical trigger | asserts obligation | supplied citationKey | record title (persisted) | statement ↔ record | adjudication |
|---|---|---|---|---|---|---|---|---|
| R1 | GAUNTLET-005 | `expertExplanation.summary` | *violation* | no | `29 CFR 1910.120` | Hazardous waste operations and emergency response | **PARTIAL_SUBJECT** — statement concerns hazard-communication labelling of a corrosive tank; record concerns emergency response | NOT_SUPPORTED |
| R2 | GAUNTLET-007 | `clarifications[1].whyItMatters` | *violation* | **yes** | `29 CFR 1910.1200` | Hazard communication | **UNRELATED** — statement concerns permit-space entry procedures | NOT_SUPPORTED |
| R3 | GAUNTLET-054 | `expertExplanation.summary` | *regulatory* | no | `29 CFR 1910.179` | Overhead and gantry cranes | **UNRELATED** — statement concerns scaffold foundation stability | NOT_SUPPORTED |
| R4 | POPA-A-16 | `clarifications[0].question` | *compliance* | no | `29 CFR 1910.303` | Electrical - general requirements | **UNRELATED** — statement concerns forklift tine-pin servicing | NOT_SUPPORTED |
| R5 | POPA-A-24 | `expertExplanation.summary` | *compliance* | no | `29 CFR 1910.36` | Design and construction requirements for exit routes | **UNRELATED** — statement reports a pedestal grinder as compliant | NOT_SUPPORTED |
| R6 | AUG-01 | `candidates[0].evidenceBasis` | *the standard* | no | `29 CFR 1926.1425` | Cranes and derricks — Keeping clear of the load | **UNRELATED** — statement concerns bench-grinder work-rest gap | NOT_SUPPORTED |
| R7 | AUG-05 | `clarifications[2].whyItMatters` | *violation* | **yes** | `29 CFR 1926.251` | Rigging equipment for material handling | **UNRELATED** — statement concerns elevated-load travel on a reach truck | NOT_SUPPORTED |
| R8 | SEM-15 | `clarifications[0].whyItMatters` | *regulation* | **yes** | — | — | **NO_RECORD** | NOT_SUPPORTED |
| R9 | SRC-MSHA-057 | `clarifications[2].whyItMatters` | *violation* | no | — | — | **NO_RECORD** | NOT_SUPPORTED |

Subject classification uses only the persisted statement text and the persisted record `title`; no
external regulatory knowledge was applied, and the `approvedText` bodies were read only to confirm
subject, never to judge legal support.

**Attachment quality across the nine: SAME_SUBJECT 0 · PARTIAL_SUBJECT 1 · UNRELATED 6 · NO_RECORD 2.**

### Which construct did M07 measure?

- **A. REGULATORY-STATEMENT DETECTION** — this is what the *denominator* implements, and it
  implements it lexically.
- **B. GOVERNED-RECORD SEMANTIC SUPPORT** — this is what the *rubric* asked the adjudicator, over
  records selected without regard to subject.
- **C. EXACT GOVERNED-EVIDENCE GROUNDING** — **not measured at all.** Exact-evidence grounding in
  this architecture is quote binding against the observation (`bindWireAnalysis`), which M07 never
  inspects.

**M07 measured A ∧ B on a sample where B was constructed to be near-impossible.** It did not measure
C, and C is the property whose name M07 most resembles.

### Selection-lexicon audit

`REGULATORY_STATEMENT_MARKERS` includes `/\bviolat(ion|es|e)\b/i`, `/\bcompliance\b/i`,
`/\bregulatory\b/i`, `/\bthe standard\b/i`, `/\bregulation(s)?\b/i`. These are ordinary
safety-professional English and require no named authority.

Measured within these nine items:

- statements containing an actual CFR-shaped citation: **0 of 9**
- statements naming OSHA or MSHA: **0 of 9**
- statements carrying an obligation marker (`assertsObligation`): **3 of 9**
- statements entering the queue on a *non-obligation* lexical trigger alone: **6 of 9**

**FALSE-OPPORTUNITY RATE = 6 / 9 = 66.7 %** on the strict reading that an item is a legitimate
opportunity only when the statement asserts that some authority imposes an obligation. Two of the six
are notable: R1 restates the *deterministic engine's own* hazard-communication finding, and R5
reports a grinder as **compliant** — correct behaviour on a negative-control row, converted into a
grounding failure by a keyword.

### Attachment-rule audit

`COHORT-MANIFEST.json.governedAttachment.rule`, verbatim: *"records sorted by citationKey ASCENDING,
paired by index to the first 40 rows of the frozen row order."* No family, topic or relevance term
appears in the rule. 40 of 65 rows received a record; all 40 carry `backingState: UNAPPROVED_RECORD`.
**The attachment logic is not repaired and the cohort design is not revised.**

### Final M07 classification

> **FORMAL GATE RESULT: FAIL — 0 / 9 against MIN 0.95. Immutable and unchanged.**
>
> **CONSTRUCT INTERPRETATION:** the failure supports the proposition *"prose that a keyword lexicon
> reads as regulatory was not substantiated by a record attached to that row without regard to
> subject."* It does **not** support *"Expert fabricates regulatory obligations"*, *"Expert ignores
> supplied governed evidence"*, or *"Expert would fail a grounding gate when a relevant record is
> supplied."* Those propositions were not tested by this cohort. The residual genuine model signal is
> small and specific: **3 statements asserted an obligation, and 2 of those sat on a record-bearing
> row** — both in the discursive `whyItMatters` field of a clarification that C1/C2 overproduction
> generated in the first place.

---

## 4. M05 — citation provenance

### Where citation-shaped text existed in the model's input

`CITATION_SHAPED_PATTERN = /\b\d{2}\s*CFR\s*\d+/i` (`expert-contract.types.ts:555`).

| channel | carries a matching string? | scope |
|---|---|---|
| Observation text (`authoritativeSources`) | **NO** — the precision corpus contains **zero** CFR-shaped strings; `POPA-A-28`'s observation is *"Autumn leaf fall around the yard drains is cleared every week under the housekeeping schedule."* | all rows |
| Deterministic projection block | **NO** — citation-free by construction and by explicit design note | all rows |
| Governed record `citation` field | **YES** — rendered as `record ${g.citation}` | 40 rows, incl. `POPA-A-28` (`29 CFR 1926.102`) |
| Governed record `approvedText` | **YES** — **40 of 40** attached records contain a CFR-shaped citation; `POPA-A-28`'s contains `29 CFR 1926.102(a)(1)` | 40 rows |
| **System prompt** | **YES** — the prohibition itself reads: *"Do not write things of the form `"29 CFR 1910.147"` or `"30 CFR 56.12016"` anywhere."* Both strings match the rejecting pattern | **all 195 calls** |
| Normalized input / raw response / validated analysis / `call.issues[].detail` | **NOT PERSISTED** | — |

**PROVENANCE CLASSIFICATION for `POPA-A-28`, both arms: PRESENT_IN_MODEL_INPUT.** Citation-shaped
text was in that request through three independent channels. **The specific emitted string is
UNKNOWN_DUE_TO_PERSISTENCE** — `scoreM05` records `text` only on the `SURVIVED_TO_MERGE` branch, and
the boundary-rejection branch stores `{rowId, callId, source}` only.

The architecture already knows this hazard and defends against it in one channel while creating it in
two others. `expert-contract.types.ts:362-366`: *"Projecting it would hand the model a citation and
invite it to echo one back — and the normalizer would then reject the ENTIRE analysis."* That
reasoning was applied to the deterministic projection. It was not applied to the governed-record
rendering, and it was not applied to the prohibition's own worked examples.

### Did the boundary fail closed?

**Yes, unambiguously.**

- **What was rejected:** the entire payload. `normalizeExpertOutput` runs `collectStrings` over the
  whole raw object and returns `REJECTED` on the **first** match, *before* contract version, analysis
  id, outcome or any collection is read — so no part of the analysis can be partially adopted.
- **When:** at validation, before merge. `layerStatus` for both `POPA-A-28` calls is
  `OUTPUT_REJECTED`; neither has a `merged` block.
- **Could the rejected content reach customer merge?** **No.** M05's second branch — citation-shaped
  text surviving into `merged.expertAdvisory` — recorded **zero** events across all 195 payloads.
- **Why M05 counted it anyway:** the frozen measure is defined as *"count of
  `CITATION_SHAPED_TEXT_NOT_PERMITTED` plus any citation surviving to the merge"*, with a MAX
  threshold of 0. A correctly refused payload is still counted, deliberately — the contract's own
  note says *"A rejection carrying this code is exactly what this measure counts."*

### What M05 can and cannot prove

> **FORMAL M05 LABEL: FAIL — 2 against MAX 0. Immutable and unchanged.**
>
> **CAUSAL INTERPRETATION:** because citation-shaped text was demonstrably present in the model's
> input on this row through three channels, **this event must not be called fabrication at the causal
> level.** The evidence is consistent with a prompt echo and consistent with parametric invention, and
> the string that would separate them was not persisted. What *is* established: the containment
> boundary worked, on both arms, and nothing reached merge.

**This distinction is decisive for remediation.** A hallucinated citation reaching a customer is a
safety-and-liability defect. A blocked echo of a citation the system itself placed in the context is
an input-hygiene defect that costs an entire analysis — on `POPA-A-28` it cost both arms, which is
why that row is M14's single unpairable row and contributed nothing to M01, M02, M11 or M12. The
product risks are different and the repairs are different.

---

## 5. M12 — decision-vocabulary audit

### Is `affectedDecision` defined to the model?

| value | type declaration | prompt definition | schema description | examples |
|---|---|---|---|---|
| `HAZARD_EXISTENCE` | bare enum member | **none** | **none** (the property emits `enum: [...EXPERT_AFFECTED_DECISIONS]` with no per-value text) | **none** |
| `HAZARD_SEVERITY` | bare enum member | none | none | none |
| `EXPOSURE` | bare enum member | none | none | none |
| `APPLICABILITY` | bare enum member | none | none | none |
| `REQUIRED_CONTROL` | bare enum member | none | none | none |
| `REGULATORY_INTERPRETATION` | bare enum member | none | none | none |

The only prose anywhere is the type's shared doc comment — *"What a missing fact could change. Every
member is a decision the product actually makes"* — which defines the set, not any member. The
system prompt's clarification section names the *concepts* in passing (*"whether a hazard exists, its
severity, who is exposed, whether a rule applies, what control is required"*) but never binds them to
the enum members, never distinguishes them, and never appears near the schema field.

**The diagnostic claim is VERIFIED: the six values are undefined to the model beyond their names.**

### Does the M12 trigger depend on the enum?

`scoreM12` fires when a row has any candidate with `assertedConditionState === 'ACTIVE'` **and** any
clarification with `affectedDecision === 'HAZARD_EXISTENCE'`. **The clarification half of the trigger
is exclusively the enum label.** Re-labelling a question changes the gate with no change whatever in
model behaviour.

### The eleven rows

Candidate lists did not survive, so `assertedConditionState` is unavailable. Candidate **families**
are partially recoverable from M01/M02 evidence. Classification therefore rests on (a) whether the
firing question is, on its own text, a question about whether a hazard exists, and (b) whether it
concerns the same hazard family the model raised.

| row | firing HAZARD_EXISTENCE question (abbreviated) | families model raised | is it an existence question by its text? | classification |
|---|---|---|---|---|
| AUG-03 | *"How far is the weatherhead/service drop from the roof work area, and is it energized?"* | `electrical` (FORBIDDEN per M02) | yes, for `electrical` | **UNRESOLVABLE** — same family, but condition state lost; would be SEMANTIC if that candidate was ACTIVE |
| AUG-12 | *"Has atmospheric testing now been performed, and if so what were the results…?"* | `electrical`, `confined_space` | **no** — asks for a test result, i.e. severity/control | **LABEL-DRIVEN ONLY** |
| SEM-02 | *"Has the blade arbor been mechanically pinned, blocked, or otherwise restrained…?"* | `lockout_tagout`, `machine_guarding` | **no** — asks whether a control was applied; the answer key labels this same fact `REQUIRED_CONTROL` | **LABEL-DRIVEN ONLY** |
| SEM-03 | *"What hazardous energy sources are present in the vault, and have they been isolated or locked out…?"* | `electrical`, `confined_space` | partly — "what is present" is existence, "isolated" is control | **UNRESOLVABLE** |
| SEM-07 | *"Has the nitrogen header supplying the dosing head been isolated and bled down…?"* | `lockout_tagout` | **no** — control question; answer key labels the same fact `REQUIRED_CONTROL` | **LABEL-DRIVEN ONLY** |
| SEM-09 | *"Is the corded shop light rated as explosion-proof or vapor-proof…?"* | `chemical_exposure`, `electrical` | **yes** — and the authored gap independently labels this same fact `HAZARD_EXISTENCE` | **UNRESOLVABLE, label corroborated** |
| SEM-19 | *"…is the mixing vessel or colour kitchen area itself considered a permit-required confined space…?"* | `chemical_exposure` | yes, but for `confined_space` — a **different** family from the one raised | **LABEL-DRIVEN ONLY** (scope mismatch) |
| SEM-21 | *"Has the underlying coating been tested or confirmed for lead or chromate content…?"* | `chemical_exposure` | arguable — the answer key labels this same fact `HAZARD_SEVERITY` | **LABEL-DRIVEN ONLY** |
| SRC-MSHA-019 | *"Was the rail car on a grade, and was it left unattended or uncoupled…?"* | `mobile_equipment` | **no** — causation/severity of an incident that already occurred | **LABEL-DRIVEN ONLY** |
| SRC-MSHA-041 | *"Has the bus bar since been de-energized, verified, and locked out, or is it still energized…?"* | `electrical` | partly — "still energized" is current existence | **UNRESOLVABLE** |
| SRC-OSHA-005 | *"Were machine guards removed or bypassed…, and if so, are they still off?"* | `lockout_tagout`, `machine_guarding` | **yes**, for `machine_guarding` | **UNRESOLVABLE** |

**Tally: LABEL-DRIVEN CONTRADICTION ONLY 6 · UNRESOLVABLE_FROM_PERSISTED_EVIDENCE 5 · SEMANTIC
CONTRADICTION 0 established · BOTH 0 established.**

Six of eleven fired on a question that, read on its own text, does not ask whether a hazard exists —
it asks whether a control was applied, what a test showed, why an incident happened, or about a
different hazard family. In three of those six the answer key independently assigns the *same fact* a
different label (`REQUIRED_CONTROL` twice, `HAZARD_SEVERITY` once), which is the same bidirectional
labelling disagreement that produced M09's eleven `DECISION_MISMATCH` items.

**Not one of the eleven can be established as a genuine semantic self-contradiction from persisted
evidence, because condition state was lost.** The frozen gate result is not reinterpreted.

**Remediation implication:** the evidence points more strongly at **enum semantics** than at
collection arbitration. Arbitration remains warranted on independent grounds — nothing in the
pipeline reconciles collections at all — but M12's *numerator* is currently a label artefact in at
least six of eleven cases, and defining the vocabulary is the cheaper and better-evidenced repair.

---

## 6. M14 — identifiability proof

### Experimental structure as actually run

| element | fact |
|---|---|
| BASE arm | 65 calls, 64 `PRESENT` + 1 `OUTPUT_REJECTED` (`POPA-A-28`) |
| PERMUTED arm | 65 calls, 64 `PRESENT` + 1 `OUTPUT_REJECTED` (same row) |
| CROSS_PROCESS-labelled arm | 65 calls issued |
| Actual process boundaries | **one** — every attempt-ledger entry carries `processId: proc-632fa2eae341`. All 64 M17 pairs were rejected for `sameProcess`; M17 = `NO_OPPORTUNITY` |
| Determinism control | `P2_DETERMINISM_CONTROL = ABSENT`. The adapter sends no `temperature`, no `top_p`, no `top_k` and no seed; its own comment records that these are unavailable on this model |
| Same-input replicate within the run | **NONE.** No row was generated twice under the same serialization |
| What `scoredFieldProjection` sorts | every collection — candidates, clarifications, insights, disagreements — plus `outcome`; prose, ids, confidence, criticality and evidence are excluded |
| What can still differ after sorting | the **multiset membership**: which families/condition states/relationships, which `affectedDecision` labels, which interaction kinds and participant sets, which disagreement target/type pairs, and the outcome |

### The estimand and the missing control

M14 is named and used as an estimate of:

> **the causal effect of input ordering on the scored semantic projection.**

Estimating that requires the contrast

```
E[ 1(proj(order A) ≠ proj(order B)) ]  −  E[ 1(proj(order A, draw 1) ≠ proj(order A, draw 2)) ]
                observed = 59/64 = 0.9219                    never measured
```

The run produced only the first term. Formally, the observed indicator decomposes as

```
Observed(BASE ≠ PERMUTED) = ORDER EFFECT  ⊕  STOCHASTIC GENERATION VARIANCE
```

where ⊕ is not additive but a union of two sufficient causes: a pair differs if the ordering changed
the semantic content **or** if two independent draws from the same conditional distribution differed.
With one draw per condition, the two terms are **perfectly confounded** — there is no residual
degree of freedom. Without an estimate of the second term the identified set for the first is
`[0, 0.9219]`, which is uninformative. Sampling is uncontrolled, so no distributional assumption is
available to break the tie either.

### Search for a legitimate same-input control in preserved evidence

Every preserved Expert probe directory was checked. **Exactly one artifact contains true same-input
replicates:** `verification/expert-hazlenz-hosted-projection-ab-2026-08-31/transport/projection-ab.jsonl`
— 18 records, `caseId` × `arm` × `rep`, with full persisted `analysis` objects. Two groups carry
three replicates each of a byte-identical input (`inputTokens` constant within group), under
`provider anthropic · model claude-sonnet-5 · promptVersion hazlenz.expert.prompt.v6 ·
contractVersion hazlenz.expert.analysis.v2 · thinking disabled · P2_DETERMINISM_CONTROL ABSENT`.

Applying the frozen `scoredFieldProjection` to those replicates:

| condition | replicates | distinct projections | differing pairs |
|---|---|---|---|
| `R6` / baseline (collections non-empty) | 3 | **3 of 3** | **3 / 3** |
| `R6` / projected (every collection empty, `NOTHING_TO_ADD` ×3) | 3 | 1 of 3 | 0 / 3 |

On the only content-bearing condition, **three byte-identical inputs produced three distinct scored
projections** — condition state moved `ACTIVE → INSUFFICIENT_EVIDENCE → ACTIVE` and the clarification
multiset moved `[EXPOSURE, REQUIRED_CONTROL] → [REQUIRED_CONTROL] → [REQUIRED_CONTROL]`. The
degenerate all-empty condition diverged not at all, mirroring the formal cohort, where three of the
five order-stable rows emitted nothing.

### Why this probe is NOT admitted as the missing control

| comparability test | result |
|---|---|
| provider / model | identical (`anthropic`, `claude-sonnet-5`) |
| contract version | identical (`analysis.v2`) |
| normalizer source hash | **identical** (`84a79c08e3…` in both) |
| **prompt source hash** | **DIFFERENT** — probe `e80d977abf…` vs formal run `e02c15ea2f…` |
| prompt *version string* | identical (`v6`) in both — **and therefore not decisive** |

The declared version is not an identity. Testing HEAD's `expert-prompt.ts` against the formal run's,
both of which declare `v6`, shows `EXPERT_SYSTEM_PROMPT` **and** `buildExpertWireSchema` differ in
body between them. The probe-era file matches neither HEAD nor the formal-run version, so **it cannot
be shown that the probe's system prompt and wire schema are byte-identical to the formal run's**, and
the run's own §119 note records that the file changed without a version bump. The probe also used
different fixtures, n = 3 on a single case, and a different input construction.

Per the standing instruction not to import evidence from a different prompt as though it were the
missing control, **this probe is not used as the control.** It is recorded as *corroborating evidence
about the model-and-projection combination*: it demonstrates that same-input divergence on this
projection is **real and non-trivial**, refuting the implicit assumption that identical input yields
identical projection. It does not yield a transferable rate.

> **INSTRUMENT FINDING (new).** `EXPERT_PROMPT_VERSION` does not uniquely identify the prompt. Two
> different `EXPERT_SYSTEM_PROMPT` bodies and two different wire schemas both ship as `v6`. Any
> future comparison across probes must key on the **file hash**, which the run records, not on the
> version string.

### Conclusion

> ## M14_CAUSE_UNIDENTIFIABLE_FROM_SPENT_RUN

Demonstrated, not guessed: the required contrast is absent by construction, the one candidate control
in preserved evidence fails an explicit comparability test on the prompt hash, and no other preserved
zero-provider evidence contains a same-input replicate under a verifiable configuration. The
identified set for the order effect is `[0, 0.9219]`.

**What is nonetheless established, and is an advance on the prior report:** the claim *"59 of 64 rows
changed because of permutation"* is not merely unsupported — the same-input null is demonstrably
non-zero on this model and this projection, so the observed figure cannot be read as an order effect
at all. **M14's formal FAIL stands; its causal reading as "order sensitivity" does not.**

---

## 7. A valid future M14 experiment — proposal only, not implemented

### Design

A 2 × 2 paired factorial per row, four independent generations, all in one authorized cohort:

```
A1 = canonical serialization, replicate 1     B1 = permuted serialization, replicate 1
A2 = canonical serialization, replicate 2     B2 = permuted serialization, replicate 2
```

with `A1, A2` byte-identical requests and `B1, B2` byte-identical to each other, and the permutation
recorded as a declared, hashed transformation of the canonical input.

### Estimation

- **WITHIN-CONDITION DIVERGENCE** `W = ½[1(proj A1 ≠ proj A2) + 1(proj B1 ≠ proj B2)]`, averaged over
  rows. This is the stochastic-reproducibility term the spent run lacks entirely.
- **BETWEEN-ORDER DIVERGENCE** `B` from the cross pairs `(A1,B1), (A1,B2), (A2,B1), (A2,B2)`,
  averaged over rows.
- The order effect is identified only in the contrast `B − W`, and only where `W` is materially below
  1. **If `W` approaches 1 the order effect is not estimable at any sample size** — the projection is
  then too fine-grained to be a reliability instrument on an uncontrolled sampler, which is itself
  the finding, and it should be reported as such rather than gated around.
- Cost is 4 generations per row against the spent run's 3; row count and the whole budget/ceiling
  discipline should be re-derived before any authorization.

### Naming

**Two distinct measures are conceptually required, and merging them is what produced this
unidentifiability:**

1. **STOCHASTIC REPRODUCIBILITY** — `1 − W`. A property of the model-and-contract under an
   uncontrolled sampler. Given `P2_DETERMINISM_CONTROL = ABSENT`, it should be **pre-registered as
   REPORTED, not gated**, on exactly the G9 reasoning that made M17 reported.
2. **ORDER PERTURBATION SENSITIVITY** — `B − W`. Gateable **only** if `W` is first measured and found
   low enough for the contrast to be meaningful, and that disposition must be fixed **before** the
   cohort opens.

The current single `M14_ORDER_SENSITIVITY` conflates them. **No threshold is proposed here and none
was changed.**

---

## 8. Model defect versus instrument defect — final matrix

Formal results are immutable and appear exactly as scored.

| gate | FORMAL RESULT | PRODUCT BEHAVIOUR DEFECT PROVEN? | INSTRUMENT DEFECT / LIMITATION? | CAUSAL ROOT CAUSE IDENTIFIED? | REMEDIATION WARRANTED? | MEASURE REDESIGN WARRANTED? | CONFIDENCE | EVIDENCE |
|---|---|---|---|---|---|---|---|---|
| **M05** | FAIL 2 vs MAX 0 | **NO** — emission occurred, but citation-shaped text was in the input via 3 channels; boundary failed closed and nothing reached merge | **YES** — the measure counts a correct rejection, and the system prompt + record rendering seed the forbidden token class | **PARTIAL** — mechanism identified, event provenance lost | **YES**, input hygiene | **YES**, separate "blocked echo" from "citation reached merge" | MEDIUM-HIGH | `CITATION_SHAPED_PATTERN`, system-prompt lines, 40/40 records, corpus scan, both arms `OUTPUT_REJECTED` |
| **M07** | FAIL 0/9 vs MIN 0.95 | **MARGINAL** — 3 of 9 assert an obligation, 2 on record-bearing rows | **YES, dominant** — 66.7 % false-opportunity rate; 0 SAME_SUBJECT attachments | **YES** | **YES**, but small and downstream of C1/C2 | **YES**, narrow the denominator to asserted obligations; attach records semantically | HIGH | §3 table; `governedAttachment.rule`; marker lexicon |
| **M09** | FAIL 5/165 vs MIN 0.70 | **YES** — 43 of 59 on-target opportunities produced no mapping | **YES** — undefined `affectedDecision` voided 11 of 16 matches; ceiling 0.3576 made the floor unreachable | **YES** | **YES** | **YES** — define the vocabulary; consider crediting a gap once | HIGH | §1, §2, §5; 16-item mismatch table |
| **M10** | FAIL 38/45 vs MAX 0.15 | **YES — the cleanest product finding in the surface** | **NO** — denominator is truth-defined, numerator is a row count; the instrument is sound | **YES** — possibility test + fill-the-list template | **YES, highest priority** | **NO** | HIGH | 106 questions on rows owed none; 3-per-row template; 35 of 165 restate prompt examples |
| **M12** | FAIL 11/64 vs MAX 0.10 | **NOT ESTABLISHED** — 0 of 11 confirmable as semantic contradictions; condition state lost | **YES** — trigger is exclusively the undefined enum; 6 of 11 fired on non-existence questions | **PARTIAL** | **YES** — enum semantics first, arbitration on independent grounds | **YES** — family-couple the trigger, which is a contract change | MEDIUM | §5 table; `scoreM12`; answer-key label disagreement |
| **M14** | FAIL 59/64 vs MAX 0.05 | **NO** | **YES** — estimand not identified; no same-input control; projection sorts, so it never measured ordering | **NO** | **UNKNOWN** — cannot target an unidentified cause | **YES** — split into two measures | HIGH (on unidentifiability), NONE (on cause) | §6 |

**Causal classification**

| gate | classification |
|---|---|
| M05 | **MIXED_MODEL_AND_INSTRUMENT** |
| M07 | **PROVEN_INSTRUMENT_DEFECT** (with a marginal model component) |
| M09 | **MIXED_MODEL_AND_INSTRUMENT** |
| M10 | **PROVEN_MODEL_OR_CONTRACT_DEFECT** |
| M12 | **MIXED_MODEL_AND_INSTRUMENT**, leaning instrument |
| M14 | **UNIDENTIFIABLE** |

**Exactly one of the six failed gates is a clean, unambiguous product defect: M10.** M09 is the
second-strongest and is genuinely mixed. That is not a softening of the formal result — all six
remain FAIL and the evaluation remains NOT ACCEPTED — it is the difference between what was scored
and what was demonstrated.

---

## 9. Remediation basis — frozen, not implemented

### A. Product / model-contract remediation

| id | repair | exact defect addressed | status vs prior report |
|---|---|---|---|
| **A1** | Replace the possibility test with a two-branch counterfactual; promote the anti-genericness rule out of the historical-remediation section to global scope | M10: 38/45 rows asked when owed nothing; 106 ineligible questions | **ACCEPTED** (was R1) — strengthened; M10 is the one clean product defect |
| **A2** | Give each `affectedDecision` member an operational definition in the type doc **and** as per-value schema `description`, with explicit disambiguation for `REQUIRED_CONTROL` vs `HAZARD_EXISTENCE`, `HAZARD_SEVERITY` vs `HAZARD_EXISTENCE`, `APPLICABILITY` vs `REQUIRED_CONTROL` | M09's 11 mismatches; M12's label-driven trigger in ≥6 of 11 | **ACCEPTED and PROMOTED** (was R2) — now supported by two independent gates |
| **A3** | Single cross-collection arbitration pass after a facts/decisions layer | no reconciliation exists anywhere in the pipeline | **RETAINED WITH REDUCED PRIORITY** (was R3) — M12 no longer provides strong support, since 0 of 11 events are confirmable contradictions. Justified on architectural grounds, not on M12's number |
| **A4** | Render governed records with opaque handles; remove the two literal CFR examples from the system-prompt prohibition | M05: citation-shaped text in the input on **all 195 calls** via the system prompt and on 40 rows via records | **ACCEPTED and BROADENED** (was R4) — the system-prompt channel was missed by the prior report |

### B. Evaluation-instrument remediation (future cohort only)

| id | repair | exact defect addressed |
|---|---|---|
| **B1** | Narrow M07's denominator to statements asserting an obligation | 66.7 % false-opportunity rate; would have reduced this run's denominator from 9 to 3 |
| **B2** | Attach governed records by semantic relevance | 0 SAME_SUBJECT, 6 UNRELATED, 1 PARTIAL of 7 attached |
| **B3** | Split M14 into stochastic reproducibility (reported) and order perturbation sensitivity (gateable only if `W` is low) | the confound proved in §6 |
| **B4** | Decide whether M09 should credit a gap at most once, and whether its denominator should be gap-eligible clarifications | the scorer currently permits unlimited credit per gap while 64.2 % of the denominator is structurally ineligible |
| **B5** | Family-couple the M12 trigger | requires a hazard family on the clarification type — a **wire-schema change** needing its own authorization |

**Every B item is a proposal for a future cohort under separate authorization. None is applied to the
spent cohort, and no frozen scorer, threshold or truth was touched.**

### C. Harness / evidence-persistence remediation

Unchanged from `ROOT-CAUSE-DIAGNOSTIC.md` §12 and **not normalized**. Additions from this audit:

- **C-new-1** persist `call.issues[].detail`, without which M05 provenance is undecidable;
- **C-new-2** persist per-row `scoredFieldProjection` for every arm;
- **C-new-3** record the **prompt file hash** in every probe and cohort record, since the version
  string is not an identity;
- **C-new-4** if M17 or any successor is to mean anything, fork real OS processes.

### D. Unresolved questions requiring future experiment

1. The M14 order effect — requires the §7 factorial. **No repair may claim to address M14.**
2. Whether `POPA-A-28` was an echo or an invention — requires A4 plus a future run.
3. Whether the 11 M12 events are semantic contradictions — requires persisted condition state.
4. Whether Expert grounds regulatory claims when a *relevant* record is supplied — requires B2.
5. Whether an approved-exact record changes behaviour — never exercised;
   `REVIEWER_APPROVED_GOVERNED_RECORDS = 0`.

### Rejected

- **Any repair targeting a spent-cohort row** — none proposed, none accepted.
- **Prior R5 as written** is reclassified from "remediation" to **B2**, an instrument change, because
  it repairs the cohort and not the product.
- **Prior R6's implication that M14 is repairable by persistence alone** is rejected: persistence is
  necessary but not sufficient; without a same-input replicate the estimand stays unidentified.
- **"Canonical input representation" and "deterministic semantic IDs/order"** remain **NOT
  VALIDATED** and are not carried into the basis. M14 is unidentified, so nothing supports them; the
  projection sorts, so they cannot explain the observed divergence.

---

## 10. Terminal

The completion conditions are met: the unidentifiability of M14 is demonstrated rather than asserted;
the one candidate control in preserved evidence was located, computed and rejected on an explicit
comparability test; the missing control is named; the future experiment is specified; and the
remediation basis marks M14 as unaddressable rather than pretending otherwise.

> ## FORMAL_EXPERT_HAZLENZ_ROOT_CAUSE_DIAGNOSIS_COMPLETE — REMEDIATION_IMPLEMENTATION_AUTHORIZATION_REQUIRED

**The formal evaluation result is unchanged and immutable: FORMAL_EVALUATION_FAIL — NOT ACCEPTED.**
No remediation has been implemented.
